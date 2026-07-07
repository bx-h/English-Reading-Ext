import type { ClozeResult } from '../types';
import { BLANK_TOKEN } from '../types';
import { closestBlock } from './extract';

export interface RenderHandlers {
  onSelect: (optionIndex: number) => void;
  onReveal: () => void;
  /** 是否为真实 LLM 失败后降级到 mock 的结果 */
  degraded?: boolean;
  /** 降级原因（脱敏） */
  degradeReason?: string;
}

export interface LoadingHandlers {
  onCancel: () => void;
}

/** 一个内嵌卡片的生命周期句柄：加载 → 完成/失败，可移除 */
export interface CardView {
  loading(handlers: LoadingHandlers): void;
  done(result: ClozeResult, mocked: boolean, handlers: RenderHandlers): void;
  fail(msg: string, onRetry?: () => void): void;
  remove(): void;
}

const STYLE = `
:host {
  all: initial;
  --background: 40 20% 97%;
  --foreground: 220 20% 14%;
  --card: 0 0% 100%;
  --card-foreground: 220 20% 14%;
  --primary: 152 55% 38%;
  --primary-foreground: 0 0% 100%;
  --primary-soft: 150 55% 94%;
  --primary-border: 150 40% 82%;
  --secondary: 220 15% 96%;
  --muted: 220 15% 96%;
  --muted-foreground: 220 10% 46%;
  --destructive: 0 65% 52%;
  --destructive-foreground: 0 0% 100%;
  --destructive-soft: 0 70% 96%;
  --destructive-border: 0 60% 88%;
  --warning: 32 90% 46%;
  --warning-soft: 40 90% 94%;
  --warning-border: 36 70% 82%;
  --border: 220 15% 90%;
  --cw-card-bg: 0 0% 100%;
  --cw-card-border: 220 15% 88%;
  --cw-rail: 152 55% 42%;
  --cw-shadow: 0 1px 2px hsl(220 20% 14% / 0.04), 0 4px 12px hsl(220 20% 14% / 0.06);
}
[hidden] { display: none !important; }
.cw-card {
  position: relative;
  width: 100%;
  max-width: 420px;
  background: hsl(var(--cw-card-bg));
  border: 1px solid hsl(var(--cw-card-border));
  border-left: 3px solid hsl(var(--cw-rail));
  border-radius: 8px;
  padding: 12px 14px;
  box-shadow: var(--cw-shadow);
  box-sizing: border-box;
  font-family: -apple-system, BlinkMacSystemFont, "SF Pro Text", "PingFang SC",
    "Hiragino Sans GB", "Microsoft YaHei", "Segoe UI", Roboto, sans-serif;
  font-size: 13px;
  line-height: 1.55;
  color: hsl(var(--foreground));
}
.cw-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  margin-bottom: 8px;
}
.cw-word {
  font-weight: 600;
  font-size: 13px;
  letter-spacing: 0.01em;
}
.cw-word em {
  font-style: normal;
  color: hsl(var(--primary));
  font-weight: 600;
}
.cw-badge {
  font-size: 10px;
  line-height: 1;
  padding: 3px 6px;
  border-radius: 999px;
  border: 1px solid transparent;
  font-weight: 500;
  letter-spacing: 0.02em;
}
.cw-badge--llm {
  color: hsl(var(--primary));
  background: hsl(var(--primary-soft));
  border-color: hsl(var(--primary-border));
}
.cw-badge--mock {
  color: hsl(var(--warning));
  background: hsl(var(--warning-soft));
  border-color: hsl(var(--warning-border));
}
.cw-badge--degraded {
  color: hsl(var(--destructive));
  background: hsl(var(--destructive-soft));
  border-color: hsl(var(--destructive-border));
}
.cw-translation {
  font-size: 13.5px;
  color: hsl(var(--foreground));
  margin-bottom: 10px;
}
.cw-blank {
  display: inline-block;
  min-width: 56px;
  padding: 0 6px;
  margin: 0 2px;
  border-bottom: 1.5px dashed hsl(var(--muted-foreground) / 0.55);
  color: transparent;
  user-select: none;
}
.cw-blank--filled {
  border-bottom-color: transparent;
  color: hsl(var(--primary));
  font-weight: 600;
  background: hsl(var(--primary-soft));
  border-radius: 4px;
  padding: 1px 6px;
}
.cw-blank--filled-neutral {
  color: hsl(var(--foreground));
  background: hsl(var(--muted));
  font-weight: 600;
}
.cw-options {
  display: flex;
  flex-direction: column;
  gap: 6px;
  margin-bottom: 8px;
}
.cw-option {
  all: unset;
  box-sizing: border-box;
  display: flex;
  align-items: flex-start;
  gap: 8px;
  padding: 7px 9px;
  border: 1px solid hsl(var(--border));
  border-radius: 6px;
  background: hsl(var(--card));
  cursor: pointer;
  font-size: 12.5px;
  color: hsl(var(--foreground));
  overflow-wrap: anywhere;
  transition: border-color 120ms ease, background 120ms ease;
}
.cw-option:hover:not([disabled]) {
  border-color: hsl(var(--primary) / 0.55);
  background: hsl(var(--primary-soft) / 0.5);
}
.cw-option:focus-visible {
  outline: 2px solid hsl(var(--primary));
  outline-offset: 2px;
}
.cw-option[disabled] { cursor: default; }
.cw-option__marker {
  flex: 0 0 auto;
  width: 16px;
  height: 16px;
  border-radius: 4px;
  background: hsl(var(--muted));
  color: hsl(var(--muted-foreground));
  font-size: 10px;
  font-weight: 600;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  margin-top: 1px;
}
.cw-option--correct {
  border-color: hsl(var(--primary));
  background: hsl(var(--primary-soft));
}
.cw-option--correct .cw-option__marker {
  background: hsl(var(--primary));
  color: hsl(var(--primary-foreground));
}
.cw-option--wrong {
  border-color: hsl(var(--destructive) / 0.55);
  background: hsl(var(--destructive-soft));
  color: hsl(var(--destructive));
}
.cw-option--wrong .cw-option__marker {
  background: hsl(var(--destructive));
  color: hsl(var(--destructive-foreground));
}
.cw-option--dim { opacity: 0.55; }
.cw-result {
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 8px 10px;
  border-radius: 6px;
  margin-bottom: 8px;
  font-size: 12.5px;
}
.cw-result--correct {
  background: hsl(var(--primary-soft));
  color: hsl(var(--primary));
  border: 1px solid hsl(var(--primary-border));
}
.cw-result--wrong {
  background: hsl(var(--destructive-soft));
  border: 1px solid hsl(var(--destructive-border));
  color: hsl(var(--foreground));
}
.cw-result--reveal {
  background: hsl(var(--muted));
  color: hsl(var(--foreground));
  border: 1px solid hsl(var(--border));
}
.cw-result__title {
  font-weight: 600;
  font-size: 12px;
  letter-spacing: 0.02em;
}
.cw-result__row { display: flex; gap: 6px; align-items: baseline; }
.cw-result__label {
  font-size: 11.5px;
  color: hsl(var(--muted-foreground));
  flex: 0 0 auto;
}
.cw-result__value--wrong { color: hsl(var(--destructive)); font-weight: 500; }
.cw-result__value--right { color: hsl(var(--primary)); font-weight: 600; }
.cw-clue {
  font-size: 12px;
  color: hsl(var(--muted-foreground));
  padding: 6px 0 2px;
  border-top: 1px dashed hsl(var(--border));
  margin-top: 2px;
}
.cw-clue::before {
  content: "线索 · ";
  color: hsl(var(--primary));
  font-weight: 600;
}
.cw-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 8px;
  margin-top: 6px;
}
.cw-hint {
  font-size: 11px;
  color: hsl(var(--muted-foreground));
}
.cw-link {
  all: unset;
  cursor: pointer;
  font-size: 11.5px;
  color: hsl(var(--muted-foreground));
  text-decoration: underline;
  text-decoration-color: hsl(var(--border));
  text-underline-offset: 3px;
}
.cw-link:hover { color: hsl(var(--foreground)); }
.cw-link--danger { color: hsl(var(--destructive)); }
.cw-btn {
  all: unset;
  cursor: pointer;
  font-size: 12px;
  padding: 5px 10px;
  border-radius: 6px;
  border: 1px solid hsl(var(--border));
  background: hsl(var(--card));
  color: hsl(var(--foreground));
}
.cw-btn:hover { border-color: hsl(var(--primary) / 0.5); }
.cw-btn--primary {
  background: hsl(var(--primary));
  color: hsl(var(--primary-foreground));
  border-color: hsl(var(--primary));
}
.cw-error {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  font-size: 12.5px;
  color: hsl(var(--destructive));
}
.cw-loading-text {
  color: hsl(var(--muted-foreground));
}
.cw-skeleton {
  height: 30px;
  background: linear-gradient(90deg, hsl(var(--muted)) 0%, hsl(var(--secondary)) 50%, hsl(var(--muted)) 100%);
  background-size: 200% 100%;
  animation: cw-shimmer 1.2s linear infinite;
}
@keyframes cw-shimmer {
  0% { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}
`;

const HOST_CLASS = 'english-reading-ext-cloze';
const FLOATING_GAP_PX = 8;
const VIEWPORT_MARGIN_PX = 8;
const MIN_FLOATING_WIDTH_PX = 340;
const MAX_FLOATING_WIDTH_PX = 460;
const FLOATING_WIDTH_PX = 420;

/** 移除页面上所有残留卡片（防御性兜底） */
export function clearCards(): void {
  document.querySelectorAll(`.${HOST_CLASS}`).forEach((n) => n.remove());
}

/** 在选区下方挂载卡片宿主，无法定位时回退到所在 block 后方 */
export function mountCard(anchor: Range): CardView {
  const host = document.createElement('div');
  host.className = HOST_CLASS;

  if (!positionHostBelowSelection(host, anchor)) {
    const block = closestBlock(anchor.endContainer);
    if (block && block.parentNode) {
      block.parentNode.insertBefore(host, block.nextSibling);
    } else {
      document.body.appendChild(host);
    }
  }

  const shadow = host.attachShadow({ mode: 'open' });

  return {
    loading: (handlers) => renderLoadingState(shadow, handlers),
    done: (result, mocked, handlers) => renderCard(shadow, result, mocked, handlers),
    fail: (msg, onRetry) => renderFail(shadow, msg, onRetry),
    remove: () => host.remove(),
  };
}

function positionHostBelowSelection(host: HTMLElement, range: Range): boolean {
  if (!document.body) return false;

  const selectionRect = lastVisibleRect(range);
  if (!selectionRect) return false;

  const viewportWidth = document.documentElement.clientWidth || window.innerWidth;
  const margin = VIEWPORT_MARGIN_PX;
  const maxWidth = Math.max(0, viewportWidth - margin * 2);
  const width = Math.min(
    Math.max(FLOATING_WIDTH_PX, selectionRect.width + 96, MIN_FLOATING_WIDTH_PX),
    MAX_FLOATING_WIDTH_PX,
    maxWidth,
  );
  const clampedLeft = clamp(selectionRect.left, margin, viewportWidth - margin - width);

  host.dataset.floating = 'true';
  host.style.position = 'absolute';
  host.style.top = `${Math.round(window.scrollY + selectionRect.bottom + FLOATING_GAP_PX)}px`;
  host.style.left = `${Math.round(window.scrollX + clampedLeft)}px`;
  host.style.width = `${Math.round(width)}px`;
  host.style.maxWidth = `calc(100vw - ${margin * 2}px)`;
  host.style.display = 'block';
  host.style.boxSizing = 'border-box';
  host.style.zIndex = '2147483647';
  document.body.appendChild(host);
  return true;
}

function lastVisibleRect(range: Range): DOMRect | null {
  const rects = Array.from(range.getClientRects()).filter(
    (rect) => rect.width > 0 && rect.height > 0,
  );
  if (rects.length > 0) {
    return rects[rects.length - 1];
  }

  const rect = range.getBoundingClientRect();
  return rect.width > 0 && rect.height > 0 ? rect : null;
}

function clamp(value: number, min: number, max: number): number {
  if (max < min) return min;
  return Math.min(Math.max(value, min), max);
}

/** 加载骨架态：立即给反馈，并提供取消 */
function renderLoadingState(shadow: ShadowRoot, handlers: LoadingHandlers): void {
  shadow.innerHTML = `<style>${STYLE}</style>
  <div class="cw-card" data-cw-state="loading" aria-busy="true">
    <div class="cw-header">
      <div class="cw-word">猜词义 · <em>出题中…</em></div>
      <button class="cw-btn" data-cancel>取消</button>
    </div>
    <div class="cw-translation cw-loading-text">正在出题…</div>
    <div class="cw-options">
      <div class="cw-option cw-skeleton"></div>
      <div class="cw-option cw-skeleton"></div>
      <div class="cw-option cw-skeleton"></div>
    </div>
  </div>`;
  shadow
    .querySelector('[data-cancel]')!
    .addEventListener('click', () => handlers.onCancel());
}

/** 失败态：可选重试 + 关闭，重试在同一卡片内进行，不新插块 */
function renderFail(shadow: ShadowRoot, msg: string, onRetry?: () => void): void {
  const retryBtn = onRetry
    ? `<button class="cw-btn cw-btn--primary" data-retry>重试</button>`
    : '';
  shadow.innerHTML = `<style>${STYLE}</style>
  <div class="cw-card" data-cw-state="error">
    <div class="cw-header">
      <div class="cw-word">猜词义</div>
    </div>
    <div class="cw-error">
      <span>出题失败：${escapeHtml(msg)}</span>
      <div style="display:flex;gap:6px">
        <button class="cw-btn" data-dismiss>关闭</button>
        ${retryBtn}
      </div>
    </div>
  </div>`;
  if (onRetry) {
    shadow.querySelector('[data-retry]')!.addEventListener('click', () => onRetry());
  }
  const host = shadow.host as HTMLElement;
  shadow
    .querySelector('[data-dismiss]')!
    .addEventListener('click', () => host.remove());
}

function renderCard(
  shadow: ShadowRoot,
  result: ClozeResult,
  mocked: boolean,
  handlers: RenderHandlers,
): void {
  const [before, after] = splitBlank(result.translationWithBlank);
  const optionsHtml = result.options
    .map(
      (o, i) =>
        `<button class="cw-option" type="button" data-option="${i}">
          <span class="cw-option__marker">${optionLetter(i)}</span>
          <span>${escapeHtml(o)}</span>
        </button>`,
    )
    .join('');

  const source = sourceFromFlags(mocked, handlers.degraded);
  const badge = badgeHtml(source);

  shadow.innerHTML = `<style>${STYLE}</style>
  <div class="cw-card" data-cw-state="initial">
    <div class="cw-header">
      <div class="cw-word">猜词义 · <em data-cw-slot="word">${escapeHtml(result.selectedText)}</em></div>
      ${badge}
    </div>
    <div class="cw-translation" data-cw-slot="translation">
      ${escapeHtml(before)}<span class="cw-blank" data-blank>______</span>${escapeHtml(after)}
    </div>
    <div class="cw-options" data-cw-slot="options">${optionsHtml}</div>
    <div class="cw-result" data-cw-slot="result" hidden></div>
    <div class="cw-clue" data-cw-slot="clue" hidden>${escapeHtml(result.clue)}</div>
    <div class="cw-actions">
      <span class="cw-hint" data-cw-slot="hint">选一个你觉得最合适的意思</span>
      <button class="cw-link cw-link--danger" data-cw-action="reveal">看不出 / 直接看答案</button>
    </div>
  </div>`;

  shadow.querySelectorAll<HTMLButtonElement>('[data-option]').forEach((button) => {
    button.addEventListener('click', () => {
      const optionIndex = Number(button.dataset.option);
      if (!Number.isInteger(optionIndex)) return;
      handlers.onSelect(optionIndex);
      reveal(shadow, result, optionIndex);
    });
  });

  shadow.querySelector('[data-cw-action="reveal"]')!.addEventListener('click', () => {
    handlers.onReveal();
    reveal(shadow, result, null);
  });
}

function reveal(shadow: ShadowRoot, result: ClozeResult, userIndex: number | null): void {
  const card = shadow.querySelector<HTMLElement>('.cw-card')!;
  card.dataset.cwState = userIndex === null ? 'revealed' : 'answered';

  const blank = shadow.querySelector<HTMLElement>('[data-blank]')!;
  const correctOption = result.options[result.answerIndex] ?? result.sense;
  blank.classList.add('cw-blank--filled');
  if (userIndex === null) {
    blank.classList.add('cw-blank--filled-neutral');
  }
  blank.textContent = correctOption;

  markCompletedOptions(shadow, result, userIndex);

  const resultEl = shadow.querySelector<HTMLElement>('[data-cw-slot="result"]')!;
  resultEl.hidden = false;
  if (userIndex === null) {
    resultEl.className = 'cw-result cw-result--reveal';
    resultEl.innerHTML = [
      '<div class="cw-result__row">',
      '<span class="cw-result__label">答案：</span>',
      `<span class="cw-result__value--right">${optionLetter(result.answerIndex)}. ${escapeHtml(correctOption)}</span>`,
      '</div>',
    ].join('');
  } else if (userIndex === result.answerIndex) {
    resultEl.className = 'cw-result cw-result--correct';
    resultEl.innerHTML = `<div class="cw-result__title">✓ 对了</div><div style="font-size:12px">${escapeHtml(result.sense)}</div>`;
  } else {
    const wrongOption = result.options[userIndex] ?? '';
    resultEl.className = 'cw-result cw-result--wrong';
    resultEl.innerHTML = [
      '<div class="cw-result__title" style="color:hsl(var(--destructive))">× 再想想</div>',
      '<div class="cw-result__row">',
      '<span class="cw-result__label">你的选择：</span>',
      `<span class="cw-result__value--wrong">${optionLetter(userIndex)}. ${escapeHtml(wrongOption)}</span>`,
      '</div>',
      '<div class="cw-result__row">',
      '<span class="cw-result__label">正确答案：</span>',
      `<span class="cw-result__value--right">${optionLetter(result.answerIndex)}. ${escapeHtml(correctOption)}</span>`,
      '</div>',
    ].join('');
  }

  shadow.querySelector<HTMLElement>('[data-cw-slot="clue"]')!.hidden = false;
  const hint = shadow.querySelector<HTMLElement>('[data-cw-slot="hint"]');
  if (hint) hint.textContent = '已作答 · 点选项已锁定';
  shadow.querySelector<HTMLElement>('[data-cw-action="reveal"]')?.remove();
}

function markCompletedOptions(
  shadow: ShadowRoot,
  result: ClozeResult,
  userIndex: number | null,
): void {
  shadow.querySelectorAll<HTMLButtonElement>('[data-option]').forEach((button) => {
    const optionIndex = Number(button.dataset.option);
    button.disabled = true;
    button.classList.add('cw-option--dim');

    if (optionIndex === result.answerIndex) {
      button.classList.remove('cw-option--dim');
      button.classList.add('cw-option--correct');
    }
    if (userIndex !== null && optionIndex === userIndex && userIndex !== result.answerIndex) {
      button.classList.remove('cw-option--dim');
      button.classList.add('cw-option--wrong');
    }
  });
}

function optionLetter(index: number): string {
  return String.fromCharCode(65 + index);
}

type Source = 'LLM' | 'MOCK' | 'DEGRADED';

function sourceFromFlags(mocked: boolean, degraded?: boolean): Source {
  if (degraded) return 'DEGRADED';
  return mocked ? 'MOCK' : 'LLM';
}

function badgeHtml(source: Source): string {
  if (source === 'LLM') {
    return '<span class="cw-badge cw-badge--llm" data-cw-slot="badge">LLM</span>';
  }
  if (source === 'MOCK') {
    return '<span class="cw-badge cw-badge--mock" data-cw-slot="badge">MOCK</span>';
  }
  return '<span class="cw-badge cw-badge--degraded" data-cw-slot="badge">降级 MOCK</span>';
}

function splitBlank(text: string): [string, string] {
  const idx = text.indexOf(BLANK_TOKEN);
  if (idx === -1) return [text, ''];
  return [text.slice(0, idx), text.slice(idx + BLANK_TOKEN.length)];
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}
