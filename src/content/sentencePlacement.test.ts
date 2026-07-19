// @vitest-environment jsdom

import { afterEach, expect, it, vi } from 'vitest';

afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllGlobals();
  vi.resetModules();
  document.body.innerHTML = '';
});

it('floats the card below the complete multi-line source sentence', async () => {
  vi.useFakeTimers();
  Object.defineProperties(Range.prototype, {
    getClientRects: {
      configurable: true,
      value(this: Range) {
        if (this.toString() === 'The agent works relentlessly until the task is complete.') {
          return [
            { left: 40, top: 80, right: 520, bottom: 104, width: 480, height: 24 },
            { left: 40, top: 112, right: 300, bottom: 136, width: 260, height: 24 },
          ];
        }
        return [
          { left: 180, top: 80, right: 260, bottom: 104, width: 80, height: 24 },
        ];
      },
    },
    getBoundingClientRect: {
      configurable: true,
      value: () => ({ left: 40, top: 80, right: 520, bottom: 136, width: 480, height: 56 }),
    },
  });
  vi.stubGlobal('chrome', {
    runtime: { lastError: undefined, sendMessage: vi.fn() },
  });
  document.body.innerHTML =
    '<p id="source">The agent works relentlessly until the task is complete. Another sentence follows.</p>';
  const text = document.querySelector('#source')!.firstChild!;
  const selectionRange = document.createRange();
  selectionRange.setStart(text, 16);
  selectionRange.setEnd(text, 28);
  const selection = window.getSelection()!;
  selection.removeAllRanges();
  selection.addRange(selectionRange);
  await import('./index');

  document.dispatchEvent(new MouseEvent('mouseup', { bubbles: true }));
  await vi.advanceTimersByTimeAsync(0);

  const host = document.querySelector<HTMLElement>('.english-reading-ext-cloze')!;
  expect(host.style.top).toBe('152px');
  expect(host.style.left).toBe('180px');
});
