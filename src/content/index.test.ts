// @vitest-environment jsdom

import { afterEach, expect, it, vi } from 'vitest';

import type { ClozeResult } from '../types';

const result: ClozeResult = {
  selectedText: 'relentlessly',
  sourceText: 'The agent works relentlessly until the task is complete.',
  translationWithBlank: '这个代理会 {{BLANK}} 工作，直到任务完成。',
  sense: '不懈地',
  clue: '直到任务完成',
  options: ['不懈地', '偶尔地', '被动地'],
  answerIndex: 0,
};

afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllGlobals();
  vi.resetModules();
  document.body.innerHTML = '';
});

it('keeps the first answer click effective when generation took over five seconds', async () => {
  vi.useFakeTimers();
  vi.setSystemTime(new Date('2026-07-18T10:00:00Z'));
  Object.defineProperties(Range.prototype, {
    getClientRects: {
      configurable: true,
      value: () => [
        { left: 40, top: 80, right: 160, bottom: 104, width: 120, height: 24 },
      ],
    },
    getBoundingClientRect: {
      configurable: true,
      value: () => ({ left: 40, top: 80, right: 160, bottom: 104, width: 120, height: 24 }),
    },
  });
  vi.stubGlobal('crypto', { randomUUID: () => 'record-id' });
  vi.stubGlobal('chrome', {
    runtime: {
      lastError: undefined,
      sendMessage: vi.fn(
        (message: { type: string }, callback?: (value: unknown) => void) => {
          if (message.type === 'GENERATE_CLOZE') {
            callback?.({ ok: true, mocked: false, result });
          }
        },
      ),
    },
  });
  document.body.innerHTML =
    '<p id="source">The agent works relentlessly until the task is complete.</p>';
  const text = document.querySelector('#source')!.firstChild!;
  const range = document.createRange();
  range.setStart(text, 16);
  range.setEnd(text, 28);
  const selection = window.getSelection()!;
  selection.removeAllRanges();
  selection.addRange(range);
  await import('./index');

  document.dispatchEvent(new MouseEvent('mouseup', { bubbles: true }));
  await vi.advanceTimersByTimeAsync(0);
  vi.setSystemTime(new Date('2026-07-18T10:00:06Z'));

  const host = document.querySelector<HTMLElement>('.english-reading-ext-cloze')!;
  const option = host.shadowRoot!.querySelector<HTMLButtonElement>('[data-option="0"]')!;
  option.dispatchEvent(new MouseEvent('mouseup', { bubbles: true, composed: true }));
  option.click();
  await vi.advanceTimersByTimeAsync(0);

  expect(
    document
      .querySelector<HTMLElement>('.english-reading-ext-cloze')!
      .shadowRoot!.querySelector<HTMLElement>('.cw-card')!.dataset.cwState,
  ).toBe('answered');
});

it('opens the card directly after touch selection settles', async () => {
  vi.useFakeTimers();
  Object.defineProperties(Range.prototype, {
    getClientRects: {
      configurable: true,
      value: () => [
        { left: 40, top: 80, right: 160, bottom: 104, width: 120, height: 24 },
      ],
    },
    getBoundingClientRect: {
      configurable: true,
      value: () => ({ left: 40, top: 80, right: 160, bottom: 104, width: 120, height: 24 }),
    },
  });
  const sendMessage = vi.fn(
    (message: { type: string }, callback?: (value: unknown) => void) => {
      if (message.type === 'GENERATE_CLOZE') {
        callback?.({ ok: true, mocked: false, result });
      }
    },
  );
  vi.stubGlobal('chrome', {
    runtime: {
      lastError: undefined,
      sendMessage,
    },
  });
  document.body.innerHTML =
    '<p id="source">The agent works relentlessly until the task is complete.</p>';
  const text = document.querySelector('#source')!.firstChild!;
  const range = document.createRange();
  range.setStart(text, 16);
  range.setEnd(text, 28);
  const selection = window.getSelection()!;
  selection.removeAllRanges();
  selection.addRange(range);
  await import('./index');

  const pointerDown = new Event('pointerdown', { bubbles: true });
  Object.defineProperty(pointerDown, 'pointerType', { value: 'touch' });
  document.dispatchEvent(pointerDown);
  const pointerUp = new Event('pointerup', { bubbles: true });
  Object.defineProperty(pointerUp, 'pointerType', { value: 'touch' });
  document.dispatchEvent(pointerUp);
  await vi.advanceTimersByTimeAsync(699);

  expect(document.querySelector('.english-reading-ext-selection-trigger')).toBeNull();
  expect(sendMessage).not.toHaveBeenCalled();
  expect(selection.isCollapsed).toBe(false);

  await vi.advanceTimersByTimeAsync(1);

  const trigger = document.querySelector<HTMLButtonElement>('.english-reading-ext-selection-trigger');
  expect(trigger).toBeNull();
  expect(selection.isCollapsed).toBe(true);
  expect(sendMessage).toHaveBeenCalledTimes(1);
  expect(sendMessage).toHaveBeenCalledWith(
    expect.objectContaining({ type: 'GENERATE_CLOZE' }),
    expect.any(Function),
  );
});

it('keeps a touch selection adjustable during the settle grace period', async () => {
  vi.useFakeTimers();
  Object.defineProperties(Range.prototype, {
    getClientRects: {
      configurable: true,
      value: () => [
        { left: 40, top: 80, right: 160, bottom: 104, width: 120, height: 24 },
      ],
    },
    getBoundingClientRect: {
      configurable: true,
      value: () => ({ left: 40, top: 80, right: 160, bottom: 104, width: 120, height: 24 }),
    },
  });
  vi.stubGlobal('chrome', {
    runtime: {
      lastError: undefined,
      sendMessage: vi.fn(),
    },
  });
  document.body.innerHTML =
    '<p id="source">The agent works relentlessly until the task is complete.</p>';
  await import('./index');

  const pointerDown = new Event('pointerdown', { bubbles: true });
  Object.defineProperty(pointerDown, 'pointerType', { value: 'touch' });
  document.dispatchEvent(pointerDown);

  const text = document.querySelector('#source')!.firstChild!;
  const range = document.createRange();
  range.setStart(text, 16);
  range.setEnd(text, 28);
  const selection = window.getSelection()!;
  selection.removeAllRanges();
  selection.addRange(range);
  document.dispatchEvent(new Event('selectionchange'));
  await vi.advanceTimersByTimeAsync(699);

  const trigger = document.querySelector<HTMLElement>('.english-reading-ext-selection-trigger');
  expect(trigger).toBeNull();
  expect(selection.isCollapsed).toBe(false);
  expect(selection.toString()).toBe('relentlessly');
});

it('requests only the latest touch selection after adjustment settles', async () => {
  vi.useFakeTimers();
  Object.defineProperties(Range.prototype, {
    getClientRects: {
      configurable: true,
      value: () => [
        { left: 40, top: 80, right: 160, bottom: 104, width: 120, height: 24 },
      ],
    },
    getBoundingClientRect: {
      configurable: true,
      value: () => ({ left: 40, top: 80, right: 160, bottom: 104, width: 120, height: 24 }),
    },
  });
  const sendMessage = vi.fn();
  vi.stubGlobal('chrome', { runtime: { lastError: undefined, sendMessage } });
  document.body.innerHTML = '<p id="source">Alpha beta gamma.</p>';
  await import('./index');

  const pointerDown = new Event('pointerdown', { bubbles: true });
  Object.defineProperty(pointerDown, 'pointerType', { value: 'touch' });
  document.dispatchEvent(pointerDown);

  const text = document.querySelector('#source')!.firstChild!;
  const selection = window.getSelection()!;
  const first = document.createRange();
  first.setStart(text, 0);
  first.setEnd(text, 5);
  selection.removeAllRanges();
  selection.addRange(first);
  document.dispatchEvent(new Event('selectionchange'));
  await vi.advanceTimersByTimeAsync(400);

  const latest = document.createRange();
  latest.setStart(text, 6);
  latest.setEnd(text, 10);
  selection.removeAllRanges();
  selection.addRange(latest);
  document.dispatchEvent(new Event('selectionchange'));
  await vi.advanceTimersByTimeAsync(699);
  expect(sendMessage).not.toHaveBeenCalled();

  await vi.advanceTimersByTimeAsync(1);
  expect(sendMessage).toHaveBeenCalledTimes(1);
  expect(sendMessage).toHaveBeenCalledWith(
    expect.objectContaining({
      type: 'GENERATE_CLOZE',
      payload: expect.objectContaining({ selectedText: 'beta' }),
    }),
    expect.any(Function),
  );
});

it('does not resurrect a loading card after an outside dismissal', async () => {
  vi.useFakeTimers();
  Object.defineProperties(Range.prototype, {
    getClientRects: {
      configurable: true,
      value: () => [
        { left: 40, top: 80, right: 160, bottom: 104, width: 120, height: 24 },
      ],
    },
    getBoundingClientRect: {
      configurable: true,
      value: () => ({ left: 40, top: 80, right: 160, bottom: 104, width: 120, height: 24 }),
    },
  });
  let finishRequest: ((value: unknown) => void) | undefined;
  vi.stubGlobal('chrome', {
    runtime: {
      lastError: undefined,
      sendMessage: vi.fn(
        (message: { type: string }, callback?: (value: unknown) => void) => {
          if (message.type === 'GENERATE_CLOZE') finishRequest = callback;
        },
      ),
    },
  });
  document.body.innerHTML = '<p id="source">The agent works relentlessly.</p>';
  const text = document.querySelector('#source')!.firstChild!;
  const range = document.createRange();
  range.setStart(text, 16);
  range.setEnd(text, 28);
  const selection = window.getSelection()!;
  selection.removeAllRanges();
  selection.addRange(range);
  await import('./index');

  document.dispatchEvent(new MouseEvent('mouseup', { bubbles: true }));
  await vi.advanceTimersByTimeAsync(0);
  expect(document.querySelector('.english-reading-ext-cloze')).not.toBeNull();

  document.body.click();
  expect(document.querySelector('.english-reading-ext-cloze')).toBeNull();
  finishRequest?.({ ok: true, mocked: false, result });
  await vi.advanceTimersByTimeAsync(0);

  expect(document.querySelector('.english-reading-ext-cloze')).toBeNull();
});
