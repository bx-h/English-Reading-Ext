## Why

The current cloze card loses important learning context after an answer: a wrong selection is replaced by the correct meaning, so the reader cannot compare what they chose against the expected answer. The card also keeps the reveal action visible after the interaction is already complete, which makes the state feel unfinished.

The Lovable source repo `bx-h/cloze-card-coach` defines the migration target: a `.cw-*` Shadow DOM-compatible card contract with explicit initial, answered, revealed, loading, and error states.

## What Changes

- Replace the post-answer select replacement flow with explicit result states for correct, wrong, and reveal interactions.
- Port the `cloze-card-coach` `.cw-*` DOM/class contract into the vanilla content renderer instead of approximating the screenshot.
- Preserve the user's wrong option and show it next to the correct answer with restrained visual labels.
- Remove the "看不出 / 直接看答案" action after any answer or direct reveal.
- Keep the clue hidden before answering and visible after answering or revealing.
- Enforce exactly three generated answer options before the card enters the selectable state.
- Keep existing loading, degraded/mock, and failure/retry behavior while aligning the visual hierarchy with the Lovable prototype.

## Capabilities

### New Capabilities

- `cloze-answer-feedback`: Defines the cloze card's answer-result state model and user-facing feedback requirements.

### Modified Capabilities

- None.

## Impact

- Affects `src/content/render.ts` Shadow DOM markup/CSS and `src/lib/provider.ts` cloze result validation.
- Does not change the background service worker message schema, LLM request prompt/schema, IndexedDB record schema, or content extraction.
- Build output and unpacked extension artifacts must be regenerated after implementation.
