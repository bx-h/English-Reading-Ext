import type {
  ClozeRequestPayload,
  ClozeResult,
  GenerateClozeResponse,
  VocabRecord,
} from '../types';
import { extractContext, isEditable } from './extract';
import { clearCards, mountCard } from './render';

const REQUEST_TIMEOUT_MS = 50_000;

let lastSelectedText = '';
let lastSelectedAt = 0;

// 并发控制：每次新出题自增 requestSeq，只有最新一次的回调可渲染；
// 旧请求回调（晚到/慢）会因 seq 不匹配被丢弃，避免覆盖新 selection 的结果。
let requestSeq = 0;
let activeTimer: ReturnType<typeof setTimeout> | null = null;

document.addEventListener('mouseup', () => {
  // 延迟一拍，确保 selection 已结算
  setTimeout(handleSelection, 0);
});

function handleSelection(): void {
  const sel = window.getSelection();
  if (!sel || sel.isCollapsed) return;

  const anchorNode = sel.anchorNode;
  // 忽略落在自己卡片内 / 可编辑区域内的选择
  if (anchorNode && (isInsideOwnCard(anchorNode) || isEditable(anchorNode))) return;

  const text = sel.toString().trim();
  if (!text) return;
  // 过滤过短噪声与疑似整段乱选
  if (text.length < 2 || text.length > 400) return;
  // 同词去重，但 5s 后允许重练
  const now = Date.now();
  if (text === lastSelectedText && now - lastSelectedAt < 5_000) return;

  const payload = extractContext(sel);
  if (!payload) return;
  lastSelectedText = text;
  lastSelectedAt = now;

  const anchor = sel.getRangeAt(0).cloneRange();
  startRequest(payload, anchor);
}

/** 发起一次出题：销毁旧卡片、立即插入 skeleton、token 并发控制、超时兜底、取消、重试 */
function startRequest(payload: ClozeRequestPayload, anchor: Range): void {
  // 作废任何在途请求与残留卡片，保证页面只有一个活动卡片
  teardownActive();
  clearCards();

  const seq = ++requestSeq;
  const card = mountCard(anchor);

  card.loading({
    onCancel: () => {
      if (seq !== requestSeq) return;
      teardownActive();
      card.remove();
    },
  });

  activeTimer = setTimeout(() => {
    if (seq !== requestSeq) return;
    clearActiveTimer();
    card.fail('出题超时', () => startRequest(payload, anchor));
  }, REQUEST_TIMEOUT_MS);

  chrome.runtime.sendMessage(
    { type: 'GENERATE_CLOZE', payload },
    (resp: GenerateClozeResponse) => {
      // 过期请求（用户已重新划词/取消）：直接丢弃，绝不渲染
      if (seq !== requestSeq) return;
      clearActiveTimer();

      if (chrome.runtime.lastError) {
        card.fail(chrome.runtime.lastError.message ?? '通信失败', () =>
          startRequest(payload, anchor),
        );
        return;
      }
      if (!resp?.ok || !resp.result) {
        card.fail(resp?.error ?? '未知错误', () => startRequest(payload, anchor));
        return;
      }
      const result = resp.result;
      card.done(result, resp.mocked, {
        onSelect: (i) => save(payload, result, i),
        onReveal: () => save(payload, result, null),
        degraded: resp.degraded,
        degradeReason: resp.degradeReason,
      });
    },
  );
}

/** 作废当前在途请求：使其回调失效 + 清超时 */
function teardownActive(): void {
  requestSeq++; // 让任何已在途的旧回调 seq 失配
  clearActiveTimer();
}

function clearActiveTimer(): void {
  if (activeTimer !== null) {
    clearTimeout(activeTimer);
    activeTimer = null;
  }
}

function save(
  payload: ClozeRequestPayload,
  result: ClozeResult,
  userAnswerIndex: number | null,
): void {
  const record: VocabRecord = {
    id: crypto.randomUUID(),
    selectedText: payload.selectedText,
    sourceText: payload.sourceText,
    sourceScope: payload.sourceScope,
    contextBefore: payload.contextBefore,
    contextAfter: payload.contextAfter,
    pageUrl: payload.pageUrl,
    pageTitle: payload.pageTitle,
    translationWithBlank: result.translationWithBlank,
    sense: result.sense,
    options: result.options,
    answerIndex: result.answerIndex,
    userAnswerIndex,
    correct: userAnswerIndex === null ? null : userAnswerIndex === result.answerIndex,
    clue: result.clue,
    createdAt: Date.now(),
  };
  chrome.runtime.sendMessage({ type: 'SAVE_RECORD', payload: record });
}

function isInsideOwnCard(node: Node): boolean {
  let el: Node | null = node;
  while (el) {
    if (
      el instanceof HTMLElement &&
      el.classList.contains('english-reading-ext-cloze')
    ) {
      return true;
    }
    el = (el as Node).parentNode ?? (el as ShadowRoot).host ?? null;
  }
  return false;
}
