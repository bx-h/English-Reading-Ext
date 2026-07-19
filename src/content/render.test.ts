// @vitest-environment jsdom

import { afterEach, describe, expect, it, vi } from 'vitest';

import type { ClozeResult } from '../types';
import { mountCard } from './render';

const result: ClozeResult = {
  selectedText: 'relentlessly',
  sourceText: 'The agent works relentlessly until the task is complete.',
  translationWithBlank: '这个代理会 {{BLANK}} 工作，直到任务完成。',
  sense: '不懈地',
  clue: '直到任务完成',
  options: ['不懈地', '偶尔地', '被动地'],
  answerIndex: 0,
};

describe('cloze card rendering and placement', () => {
  afterEach(() => {
    document.body.innerHTML = '';
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  it('underlines the source sentence while its card is mounted', () => {
    document.body.innerHTML =
      '<p id="source">The agent works relentlessly until the task is complete.</p>';
    const text = document.querySelector('#source')!.firstChild!;
    const selectedWord = document.createRange();
    selectedWord.setStart(text, 16);
    selectedWord.setEnd(text, 28);
    const sourceSentence = document.createRange();
    sourceSentence.selectNodeContents(document.querySelector('#source')!);
    [selectedWord, sourceSentence].forEach((range) => {
      Object.defineProperties(range, {
        getClientRects: {
          value: () => [
            { left: 40, top: 80, right: 520, bottom: 104, width: 480, height: 24 },
          ],
        },
        getBoundingClientRect: {
          value: () => ({ left: 40, top: 80, right: 520, bottom: 104, width: 480, height: 24 }),
        },
      });
    });
    const highlights = new Map<string, Set<Range>>();
    vi.stubGlobal(
      'Highlight',
      class extends Set<Range> {
        constructor(...ranges: Range[]) {
          super(ranges);
        }
      },
    );
    vi.stubGlobal('CSS', { highlights });

    const card = mountCard(selectedWord, sourceSentence)!;

    expect(highlights.get('english-reading-ext-source-sentence')?.has(sourceSentence)).toBe(true);
    expect(
      document.querySelector<HTMLStyleElement>('[data-english-reading-ext-highlight]')
        ?.textContent,
    ).toContain('text-decoration-color: #2fa66b');

    card.remove();
    expect(highlights.has('english-reading-ext-source-sentence')).toBe(false);
  });

  it('places the card above when it cannot fit below the source sentence', () => {
    document.body.innerHTML =
      '<p id="source">The agent works relentlessly until the task is complete.</p>';
    const text = document.querySelector('#source')!.firstChild!;
    const selectedWord = document.createRange();
    selectedWord.setStart(text, 16);
    selectedWord.setEnd(text, 28);
    const sourceSentence = document.createRange();
    sourceSentence.selectNodeContents(document.querySelector('#source')!);
    Object.defineProperties(selectedWord, {
      getClientRects: {
        value: () => [
          { left: 180, top: 650, right: 260, bottom: 674, width: 80, height: 24 },
        ],
      },
      getBoundingClientRect: { value: () => ({ width: 80, height: 24 }) },
    });
    Object.defineProperties(sourceSentence, {
      getClientRects: {
        value: () => [
          { left: 40, top: 650, right: 700, bottom: 674, width: 660, height: 24 },
          { left: 40, top: 676, right: 320, bottom: 700, width: 280, height: 24 },
        ],
      },
      getBoundingClientRect: {
        value: () => ({ left: 40, top: 650, right: 700, bottom: 700, width: 660, height: 50 }),
      },
    });
    vi.stubGlobal('innerWidth', 1200);
    vi.stubGlobal('innerHeight', 768);
    vi.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockImplementation(function (
      this: HTMLElement,
    ) {
      if (this.classList.contains('english-reading-ext-cloze')) {
        return { width: 420, height: 240 } as DOMRect;
      }
      return { width: 0, height: 0 } as DOMRect;
    });

    const card = mountCard(selectedWord, sourceSentence)!;
    card.loading({ onCancel: vi.fn() });

    const host = document.querySelector<HTMLElement>('.english-reading-ext-cloze')!;
    const cardTop = Number.parseFloat(host.style.top);
    expect(cardTop + 240).toBeLessThanOrEqual(650);
  });

  it('places the card beside the sentence when neither vertical side fits', () => {
    document.body.innerHTML = '<p id="source">A long source sentence.</p>';
    const text = document.querySelector('#source')!.firstChild!;
    const selectedWord = document.createRange();
    selectedWord.setStart(text, 2);
    selectedWord.setEnd(text, 6);
    const sourceSentence = document.createRange();
    sourceSentence.selectNodeContents(document.querySelector('#source')!);
    Object.defineProperties(selectedWord, {
      getClientRects: {
        value: () => [
          { left: 500, top: 300, right: 560, bottom: 324, width: 60, height: 24 },
        ],
      },
      getBoundingClientRect: { value: () => ({ width: 60, height: 24 }) },
    });
    Object.defineProperties(sourceSentence, {
      getClientRects: {
        value: () => [
          { left: 400, top: 200, right: 700, bottom: 600, width: 300, height: 400 },
        ],
      },
      getBoundingClientRect: { value: () => ({ width: 300, height: 400 }) },
    });
    vi.stubGlobal('innerWidth', 1400);
    vi.stubGlobal('innerHeight', 768);
    vi.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockImplementation(function (
      this: HTMLElement,
    ) {
      if (this.classList.contains('english-reading-ext-cloze')) {
        return { width: 420, height: 240 } as DOMRect;
      }
      return { width: 0, height: 0 } as DOMRect;
    });

    const card = mountCard(selectedWord, sourceSentence)!;
    card.loading({ onCancel: vi.fn() });

    const host = document.querySelector<HTMLElement>('.english-reading-ext-cloze')!;
    expect(Number.parseFloat(host.style.left)).toBeGreaterThanOrEqual(700);
  });

  it('chooses the closest safe placement to the selected word', () => {
    document.body.innerHTML = '<p id="source">A long source sentence.</p>';
    const text = document.querySelector('#source')!.firstChild!;
    const selectedWord = document.createRange();
    selectedWord.setStart(text, 2);
    selectedWord.setEnd(text, 6);
    const sourceSentence = document.createRange();
    sourceSentence.selectNodeContents(document.querySelector('#source')!);
    Object.defineProperties(selectedWord, {
      getClientRects: {
        value: () => [
          { left: 630, top: 100, right: 690, bottom: 124, width: 60, height: 24 },
        ],
      },
      getBoundingClientRect: { value: () => ({ width: 60, height: 24 }) },
    });
    Object.defineProperties(sourceSentence, {
      getClientRects: {
        value: () => [
          { left: 100, top: 100, right: 700, bottom: 450, width: 600, height: 350 },
        ],
      },
      getBoundingClientRect: { value: () => ({ width: 600, height: 350 }) },
    });
    vi.stubGlobal('innerWidth', 1400);
    vi.stubGlobal('innerHeight', 768);
    vi.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockImplementation(function (
      this: HTMLElement,
    ) {
      return this.classList.contains('english-reading-ext-cloze')
        ? ({ width: 420, height: 200 } as DOMRect)
        : ({ width: 0, height: 0 } as DOMRect);
    });

    const card = mountCard(selectedWord, sourceSentence)!;
    card.loading({ onCancel: vi.fn() });

    const host = document.querySelector<HTMLElement>('.english-reading-ext-cloze')!;
    expect(Number.parseFloat(host.style.left)).toBeGreaterThanOrEqual(700);
  });

  it('keeps avoiding the sentence after answer feedback increases card height', () => {
    document.body.innerHTML =
      '<p id="source">The agent works relentlessly until the task is complete.</p>';
    const text = document.querySelector('#source')!.firstChild!;
    const selectedWord = document.createRange();
    selectedWord.setStart(text, 16);
    selectedWord.setEnd(text, 28);
    const sourceSentence = document.createRange();
    sourceSentence.selectNodeContents(document.querySelector('#source')!);
    Object.defineProperties(selectedWord, {
      getClientRects: {
        value: () => [
          { left: 180, top: 650, right: 260, bottom: 674, width: 80, height: 24 },
        ],
      },
      getBoundingClientRect: { value: () => ({ width: 80, height: 24 }) },
    });
    Object.defineProperties(sourceSentence, {
      getClientRects: {
        value: () => [
          { left: 40, top: 650, right: 700, bottom: 700, width: 660, height: 50 },
        ],
      },
      getBoundingClientRect: { value: () => ({ width: 660, height: 50 }) },
    });
    vi.stubGlobal('innerWidth', 1200);
    vi.stubGlobal('innerHeight', 768);
    vi.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockImplementation(function (
      this: HTMLElement,
    ) {
      if (!this.classList.contains('english-reading-ext-cloze')) {
        return { width: 0, height: 0 } as DOMRect;
      }
      const state = this.shadowRoot?.querySelector<HTMLElement>('.cw-card')?.dataset.cwState;
      return { width: 420, height: state === 'answered' ? 400 : 240 } as DOMRect;
    });

    const card = mountCard(selectedWord, sourceSentence)!;
    card.done(result, false, { onSelect: vi.fn(), onReveal: vi.fn() });
    const host = document.querySelector<HTMLElement>('.english-reading-ext-cloze')!;
    host.shadowRoot!.querySelector<HTMLButtonElement>('[data-option="0"]')!.click();

    expect(Number.parseFloat(host.style.top) + 400).toBeLessThanOrEqual(650);
  });

  it('keeps the card on the same side of the sentence after answering', () => {
    document.body.innerHTML =
      '<p id="source">The agent works relentlessly until the task is complete.</p>';
    const text = document.querySelector('#source')!.firstChild!;
    const selectedWord = document.createRange();
    selectedWord.setStart(text, 16);
    selectedWord.setEnd(text, 28);
    const sourceSentence = document.createRange();
    sourceSentence.selectNodeContents(document.querySelector('#source')!);
    Object.defineProperties(selectedWord, {
      getClientRects: {
        value: () => [
          { left: 180, top: 300, right: 260, bottom: 324, width: 80, height: 24 },
        ],
      },
      getBoundingClientRect: { value: () => ({ width: 80, height: 24 }) },
    });
    Object.defineProperties(sourceSentence, {
      getClientRects: {
        value: () => [
          { left: 40, top: 300, right: 700, bottom: 350, width: 660, height: 50 },
        ],
      },
      getBoundingClientRect: { value: () => ({ width: 660, height: 50 }) },
    });
    vi.stubGlobal('innerWidth', 1200);
    vi.stubGlobal('innerHeight', 800);
    vi.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockImplementation(function (
      this: HTMLElement,
    ) {
      if (!this.classList.contains('english-reading-ext-cloze')) {
        return { width: 0, height: 0 } as DOMRect;
      }
      const state = this.shadowRoot?.querySelector<HTMLElement>('.cw-card')?.dataset.cwState;
      return { width: 420, height: state === 'answered' ? 400 : 240 } as DOMRect;
    });

    const card = mountCard(selectedWord, sourceSentence)!;
    card.done(result, false, { onSelect: vi.fn(), onReveal: vi.fn() });
    const host = document.querySelector<HTMLElement>('.english-reading-ext-cloze')!;
    const wasAbove = Number.parseFloat(host.style.top) < 300;
    host.shadowRoot!.querySelector<HTMLButtonElement>('[data-option="0"]')!.click();
    const remainsAbove = Number.parseFloat(host.style.top) < 300;

    expect(remainsAbove).toBe(wasAbove);
  });

  it('does not mount a misplaced card when sentence geometry is unavailable', () => {
    document.body.innerHTML = `
      <article id="article">
        <p id="source">The agent works relentlessly until the task is complete.</p>
      </article>
    `;
    const text = document.querySelector('#source')!.firstChild!;
    const selectedWord = document.createRange();
    selectedWord.setStart(text, 16);
    selectedWord.setEnd(text, 28);
    const sourceSentence = document.createRange();
    sourceSentence.selectNodeContents(document.querySelector('#source')!);
    [selectedWord, sourceSentence].forEach((range) => {
      Object.defineProperties(range, {
        getClientRects: { value: () => [] },
        getBoundingClientRect: { value: () => ({ width: 0, height: 0 }) },
      });
    });

    const card = mountCard(selectedWord, sourceSentence);

    expect(card).toBeNull();
    expect(document.querySelector('.english-reading-ext-cloze')).toBeNull();
  });

  it('dismisses when the user clicks outside after answering', () => {
    document.body.innerHTML = '<p id="source">The agent works relentlessly.</p>';
    const text = document.querySelector('#source')!.firstChild!;
    const range = document.createRange();
    range.setStart(text, 16);
    range.setEnd(text, 28);
    Object.defineProperties(range, {
      getClientRects: {
        value: () => [
          { left: 40, top: 80, right: 160, bottom: 104, width: 120, height: 24 },
        ],
      },
      getBoundingClientRect: {
        value: () => ({ left: 40, top: 80, right: 160, bottom: 104, width: 120, height: 24 }),
      },
    });

    const card = mountCard(range)!;
    card.done(result, false, {
      onSelect: vi.fn(),
      onReveal: vi.fn(),
    });
    const host = document.querySelector<HTMLElement>('.english-reading-ext-cloze')!;
    host.shadowRoot!.querySelector<HTMLButtonElement>('[data-option="0"]')!.click();

    document.body.click();

    expect(document.querySelector('.english-reading-ext-cloze')).toBeNull();
  });

  it('dismisses when the user clicks outside without answering', () => {
    document.body.innerHTML = '<p id="source">The agent works relentlessly.</p>';
    const text = document.querySelector('#source')!.firstChild!;
    const range = document.createRange();
    range.setStart(text, 16);
    range.setEnd(text, 28);
    Object.defineProperties(range, {
      getClientRects: {
        value: () => [
          { left: 40, top: 80, right: 160, bottom: 104, width: 120, height: 24 },
        ],
      },
      getBoundingClientRect: {
        value: () => ({ left: 40, top: 80, right: 160, bottom: 104, width: 120, height: 24 }),
      },
    });

    const card = mountCard(range)!;
    card.done(result, false, {
      onSelect: vi.fn(),
      onReveal: vi.fn(),
    });

    document.body.click();

    expect(document.querySelector('.english-reading-ext-cloze')).toBeNull();
  });

  it('dismisses when the user clicks outside while loading', () => {
    document.body.innerHTML = '<p id="source">The agent works relentlessly.</p>';
    const text = document.querySelector('#source')!.firstChild!;
    const range = document.createRange();
    range.setStart(text, 16);
    range.setEnd(text, 28);
    Object.defineProperties(range, {
      getClientRects: {
        value: () => [
          { left: 40, top: 80, right: 160, bottom: 104, width: 120, height: 24 },
        ],
      },
      getBoundingClientRect: {
        value: () => ({ left: 40, top: 80, right: 160, bottom: 104, width: 120, height: 24 }),
      },
    });

    const card = mountCard(range)!;
    card.loading({ onCancel: vi.fn() });
    document.body.click();

    expect(document.querySelector('.english-reading-ext-cloze')).toBeNull();
  });

  it('dismisses when the user clicks outside after an error', () => {
    document.body.innerHTML = '<p id="source">The agent works relentlessly.</p>';
    const text = document.querySelector('#source')!.firstChild!;
    const range = document.createRange();
    range.setStart(text, 16);
    range.setEnd(text, 28);
    Object.defineProperties(range, {
      getClientRects: {
        value: () => [
          { left: 40, top: 80, right: 160, bottom: 104, width: 120, height: 24 },
        ],
      },
      getBoundingClientRect: {
        value: () => ({ left: 40, top: 80, right: 160, bottom: 104, width: 120, height: 24 }),
      },
    });

    const onDismiss = vi.fn();
    const card = mountCard(range, range, onDismiss)!;
    card.fail('Connection failed', vi.fn());
    document.body.click();

    expect(document.querySelector('.english-reading-ext-cloze')).toBeNull();
    expect(onDismiss).toHaveBeenCalledTimes(1);
  });
});
