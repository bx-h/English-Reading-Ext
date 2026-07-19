// @vitest-environment jsdom

import { afterEach, expect, it } from 'vitest';

import { extractContext, sentenceRangeForSelection } from './extract';

afterEach(() => {
  document.body.innerHTML = '';
  window.getSelection()?.removeAllRanges();
});

it('maps repeated source text to the occurrence containing the selection', () => {
  document.body.innerHTML = `
    <p id="source">
      <span>The seam keeps this feature stable.</span>
      <span id="chosen">The seam keeps this feature stable.</span>
    </p>
  `;
  const chosenText = document.querySelector('#chosen')!.firstChild!;
  const selectedWord = document.createRange();
  selectedWord.setStart(chosenText, 4);
  selectedWord.setEnd(chosenText, 8);
  const selection = window.getSelection()!;
  selection.addRange(selectedWord);

  const sourceRange = sentenceRangeForSelection(selection);

  expect(sourceRange?.startContainer).toBe(chosenText);
  expect(sourceRange?.toString()).toBe('The seam keeps this feature stable.');
});

it('keeps the visual range on a short sentence when LLM context expands to the paragraph', () => {
  document.body.innerHTML = `
    <p id="source">Wait. This longer sentence supplies useful context for the language model.</p>
  `;
  const text = document.querySelector('#source')!.firstChild!;
  const selectedWord = document.createRange();
  selectedWord.setStart(text, 0);
  selectedWord.setEnd(text, 4);
  const selection = window.getSelection()!;
  selection.addRange(selectedWord);
  const payload = extractContext(selection)!;

  const visualRange = sentenceRangeForSelection(selection);

  expect(payload.sourceScope).toBe('paragraph');
  expect(visualRange?.toString()).toBe('Wait.');
});
