## 1. Renderer State Model

- [x] 1.1 Refactor `renderCard()` markup into explicit option, feedback, clue, and action regions.
- [x] 1.2 Replace the current `reveal()` mutation with a completion renderer for correct, wrong, and direct-reveal states.
- [x] 1.3 Ensure completed interactions remove reveal actions and prevent further answer changes.
- [x] 1.4 Enforce exactly three candidate options before rendering selectable answer buttons.
- [x] 1.5 Keep completed option rows visible and mark correct/wrong choices in place.
- [x] 1.6 Port the `bx-h/cloze-card-coach` `.cw-*` DOM/class contract into `src/content/render.ts`.

## 2. Visual Feedback

- [x] 2.1 Add compact Shadow DOM CSS for answer rows, selected/correct/error states, and restrained completion copy.
- [x] 2.2 Preserve LLM/MOCK/degraded badge and failure/retry styles without making them visually dominant.
- [x] 2.3 Ensure long options wrap inside the floating card without overflow.
- [x] 2.4 Keep the floating card compact on wide X/Twitter posts instead of stretching to the parent block width.

## 3. Validation and Packaging

- [x] 3.1 Run OpenSpec validation for `improve-cloze-feedback-card`.
- [x] 3.2 Run TypeScript/build validation.
- [x] 3.3 Regenerate extension artifacts and sync `dist/` to the current unpacked Chrome extension directory.
- [x] 3.4 Run subagent review and address findings until review passes.
- [x] 3.5 Compare against `bx-h/cloze-card-coach` source contract and rerun visual verification.
