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

it('treats a paragraph break as a visual sentence boundary when punctuation is missing', () => {
  const source = document.createElement('div');
  source.id = 'source';
  source.style.whiteSpace = 'pre-wrap';
  source.textContent = [
    'First line',
    '',
    'Middle benchmarks line',
    '',
    'Last line',
  ].join('\n');
  document.body.appendChild(source);

  const text = source.firstChild as Text;
  const start = text.data.indexOf('benchmarks');
  const selectedWord = document.createRange();
  selectedWord.setStart(text, start);
  selectedWord.setEnd(text, start + 'benchmarks'.length);
  const selection = window.getSelection()!;
  selection.addRange(selectedWord);

  const visualRange = sentenceRangeForSelection(selection);

  expect(visualRange?.toString()).toBe('Middle benchmarks line');
});

it('limits the visual range to the selected paragraph in an unpunctuated social post', () => {
  const source = document.createElement('div');
  source.style.whiteSpace = 'pre-wrap';
  source.textContent = [
    'Everyone should develop their personal eval set for AI models: a few tasks relevant to daily life',
    '',
    'The industry benchmarks help but they might not reflect what will make it useful to you',
    '',
    'You find the model capability boundary by testing it',
  ].join('\n');
  document.body.appendChild(source);

  const text = source.firstChild as Text;
  const start = text.data.indexOf('benchmarks');
  const selectedWord = document.createRange();
  selectedWord.setStart(text, start);
  selectedWord.setEnd(text, start + 'benchmarks'.length);
  const selection = window.getSelection()!;
  selection.addRange(selectedWord);

  const visualRange = sentenceRangeForSelection(selection);

  expect(visualRange?.toString()).toBe(
    'The industry benchmarks help but they might not reflect what will make it useful to you',
  );
});

it('treats explicit line breaks as visual sentence boundaries', () => {
  document.body.innerHTML =
    '<div id="source">First line<br><br><span>Middle benchmarks line</span><br><br>Last line</div>';
  const text = document.querySelector('span')!.firstChild as Text;
  const start = text.data.indexOf('benchmarks');
  const selectedWord = document.createRange();
  selectedWord.setStart(text, start);
  selectedWord.setEnd(text, start + 'benchmarks'.length);
  const selection = window.getSelection()!;
  selection.addRange(selectedWord);

  const visualRange = sentenceRangeForSelection(selection);

  expect(visualRange?.toString()).toBe('Middle benchmarks line');
});
