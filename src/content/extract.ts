import type { ClozeRequestPayload, SourceScope } from '../types';

const SENTENCE_SPLIT = /[^.!?。！？]*[.!?。！？]+|\S[^.!?。！？]*$/g;

/**
 * 从当前 selection 抽取划线所在句/段 + 前后上下文。
 * 策略：取选区所在 block 元素的全文，按句切分；
 * 选中句过短(<25 字符)或选区内含多句标点时升级为整段。
 */
export function extractContext(sel: Selection): ClozeRequestPayload | null {
  const rawSelected = sel.toString().trim();
  if (!rawSelected) return null;
  // 匹配统一走 normalize，避免选区换行/多空格与折叠后段落文本对不上
  const needle = normalize(rawSelected);

  const range = sel.getRangeAt(0);
  const block = closestBlock(range.startContainer);
  const blockText = normalize(block?.textContent ?? rawSelected);

  const sentences = splitSentences(blockText);
  const hitIdx = sentences.findIndex((s) => s.includes(needle));

  let sourceText: string;
  let scope: SourceScope;
  let contextBefore = '';
  let contextAfter = '';

  if (hitIdx === -1) {
    // 选区跨句或抽取失败 → 用整段
    sourceText = blockText;
    scope = 'paragraph';
  } else {
    const sentence = sentences[hitIdx];
    if (sentence.length < 25 || hasMultipleSentenceMarks(needle)) {
      sourceText = blockText;
      scope = 'paragraph';
    } else {
      sourceText = sentence;
      scope = 'sentence';
      contextBefore = sentences[hitIdx - 1] ?? '';
      contextAfter = sentences[hitIdx + 1] ?? '';
    }
  }

  return {
    selectedText: rawSelected,
    sourceText,
    sourceScope: scope,
    contextBefore,
    contextAfter,
    pageUrl: location.href,
    pageTitle: document.title,
    glossLang: 'zh',
  };
}

/** 找到包含当前 selection 的完整句子 Range，供定位和整句标记使用。 */
export function sentenceRangeForSelection(sel: Selection): Range | null {
  const selectionRange = sel.getRangeAt(0);
  const block = closestBlock(selectionRange.startContainer);
  if (!block) return null;

  const mapped = normalizedTextMap(block);
  const needle = normalize(sel.toString());
  if (needle.length === 0) return null;

  const candidates = splitSentences(mapped.text)
    .filter((sentence) => sentence.includes(needle))
    .flatMap((sentence) => rangesForMappedText(mapped, sentence));

  return candidates.find((candidate) => rangeContains(candidate, selectionRange)) ?? null;
}

/** 抽取与渲染共用：找到选区/节点最近的块级祖先 */
export function closestBlock(node: Node): HTMLElement | null {
  let el: Node | null = node.nodeType === Node.TEXT_NODE ? node.parentElement : node;
  const blockTags = new Set([
    'P', 'LI', 'BLOCKQUOTE', 'DIV', 'TD', 'SECTION', 'ARTICLE', 'DD', 'DT', 'PRE',
  ]);
  while (el && el instanceof HTMLElement) {
    if (blockTags.has(el.tagName)) return el;
    el = el.parentElement;
  }
  return node.parentElement;
}

/** 节点是否落在可编辑区域（input/textarea/contenteditable），用于避免在编辑时弹卡片 */
export function isEditable(node: Node): boolean {
  let el: Node | null = node.nodeType === Node.TEXT_NODE ? node.parentElement : node;
  while (el && el instanceof HTMLElement) {
    const tag = el.tagName;
    if (tag === 'INPUT' || tag === 'TEXTAREA' || el.isContentEditable) return true;
    el = el.parentElement;
  }
  return false;
}

function normalize(text: string): string {
  return text.replace(/\s+/g, ' ').trim();
}

interface TextPosition {
  startNode: Text;
  startOffset: number;
  endNode: Text;
  endOffset: number;
}

function normalizedTextMap(root: HTMLElement): {
  text: string;
  positions: TextPosition[];
} {
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
  const chars: string[] = [];
  const positions: TextPosition[] = [];
  let current = walker.nextNode() as Text | null;

  while (current) {
    for (let offset = 0; offset < current.data.length; offset++) {
      const char = current.data[offset];
      if (/\s/.test(char)) {
        if (chars.length === 0) continue;
        if (chars[chars.length - 1] === ' ') {
          positions[positions.length - 1].endNode = current;
          positions[positions.length - 1].endOffset = offset + 1;
          continue;
        }
        chars.push(' ');
      } else {
        chars.push(char);
      }
      positions.push({
        startNode: current,
        startOffset: offset,
        endNode: current,
        endOffset: offset + 1,
      });
    }
    current = walker.nextNode() as Text | null;
  }

  if (chars[chars.length - 1] === ' ') {
    chars.pop();
    positions.pop();
  }
  return { text: chars.join(''), positions };
}

function rangeFromMappedText(
  positions: TextPosition[],
  startIndex: number,
  length: number,
): Range | null {
  const start = positions[startIndex];
  const end = positions[startIndex + length - 1];
  if (!start || !end) return null;

  const range = document.createRange();
  range.setStart(start.startNode, start.startOffset);
  range.setEnd(end.endNode, end.endOffset);
  return range;
}

function rangesForMappedText(
  mapped: { text: string; positions: TextPosition[] },
  needle: string,
): Range[] {
  const ranges: Range[] = [];
  let searchFrom = 0;
  while (searchFrom <= mapped.text.length - needle.length) {
    const startIndex = mapped.text.indexOf(needle, searchFrom);
    if (startIndex === -1) break;
    const range = rangeFromMappedText(mapped.positions, startIndex, needle.length);
    if (range) ranges.push(range);
    searchFrom = startIndex + 1;
  }
  return ranges;
}

function rangeContains(container: Range, inner: Range): boolean {
  return (
    container.compareBoundaryPoints(Range.START_TO_START, inner) <= 0 &&
    container.compareBoundaryPoints(Range.END_TO_END, inner) >= 0
  );
}

function splitSentences(text: string): string[] {
  const matches = text.match(SENTENCE_SPLIT);
  if (!matches) return [text];
  const parts = matches.map((s) => s.trim()).filter(Boolean);
  // 无标点段落（如社交长文）切分后会塌缩，丢字则兜底为整段
  const joinedLen = parts.join('').length;
  if (parts.length === 0 || joinedLen < text.replace(/\s/g, '').length * 0.6) {
    return [text];
  }
  return parts;
}

function hasMultipleSentenceMarks(text: string): boolean {
  return /[.!?。！？].+[.!?。！？]/.test(text);
}
