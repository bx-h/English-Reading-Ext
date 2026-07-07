## Context

The extension renders a Shadow DOM cloze card from `src/content/render.ts`. The background service worker already returns a `ClozeResult` with `translationWithBlank`, `sense`, `options`, `answerIndex`, and `clue`; content extraction and record saving already pass the user's selected option index or `null` for direct reveal.

The current renderer has too much state encoded in one `reveal()` mutation: it replaces the blank contents and writes a terse result label. This works functionally but loses the wrong option and leaves pre-answer controls visible in some states. The Lovable source repo `bx-h/cloze-card-coach` defines a portable `.cw-*` class-name contract for the vanilla Shadow DOM renderer.

## Goals / Non-Goals

**Goals:**

- Implement Lovable-style post-answer feedback in the vanilla Shadow DOM renderer.
- Port the `cloze-card-coach` `.cw-*` DOM/class contract rather than approximating its screenshot.
- Preserve the user's wrong answer and show it alongside the correct answer.
- Hide answer controls after answer completion.
- Keep the option rows visible after completion, using read-only correct/wrong row states.
- Keep floating cards compact on wide X/Twitter posts instead of stretching to the whole post width.
- Enforce exactly three generated answer options before rendering selectable controls.
- Keep clue visibility tied to completion.
- Keep the implementation local to the content-card rendering layer.

**Non-Goals:**

- No changes to the LLM prompt, provider request contract, background message schema, or IndexedDB record schema.
- No React or runtime UI dependency inside the content script.
- No redesign of selection extraction, floating placement, or Chrome permissions.

## Decisions

1. **Use the `cloze-card-coach` DOM skeleton and `.cw-*` class-name contract.**
   - Rationale: The card needs to transition from a selectable state into a read-only result state without losing values.
   - Alternative considered: Keep a `<select>` and disable it after answer. Rejected because disabled selects are harder to read and still hide comparison context in a cramped control.

2. **Keep the option list and convert it to read-only answer rows after completion.**
   - Rationale: Once answered, the learning task is complete. The card should show the result rather than invite edits.
   - Alternative considered: Remove the option controls and show only selected/correct chips. Rejected because it loses the Lovable prototype's direct A/B/C comparison and makes the wrong-answer state feel detached from the original choice.

3. **Render wrong-answer comparison as marked rows plus one `.cw-result--wrong` feedback block.**
   - Rationale: Marked rows preserve the original decision context, while the source feedback block provides the explicit "your choice" and "correct answer" explanation.
   - Alternative considered: Inline sentence-only feedback. Rejected because it is less reliable for fast visual comparison.

4. **Preserve badge behavior and failure state.**
   - Rationale: LLM/MOCK/degraded status and retry behavior already work and are not the source of the interaction issue.

5. **Validate the generated option count at the provider boundary.**
   - Rationale: The UI promise is exactly three candidate buttons; enforcing it before render keeps malformed LLM output from leaking into the card.
   - Alternative considered: Slice or pad options in the renderer. Rejected because it would hide provider quality issues and could make `answerIndex` ambiguous.

6. **Use a fixed compact floating width with viewport clamping.**
   - Rationale: On X posts, the nearest text block can be very wide, which made the card look unlike the Lovable reference and visually dominate the post.
   - Alternative considered: Match the parent block width. Rejected because it stretches a learning widget into a full-width panel.

## Risks / Trade-offs

- **Result state increases card height** -> Keep option rows and feedback panels compact and wrapping; do not add large explanatory copy.
- **Select-to-readonly transition may feel jumpy** -> Preserve the same translation line and only replace the blank/control area plus add small feedback rows.
- **Options can contain long text** -> Use wrapping chip styles and avoid fixed-width labels.
- **Shadow DOM CSS remains string-based** -> Keep the source `.cw-*` block as flat scoped classes; avoid framework-specific assumptions.

## Migration Plan

1. Update `src/content/render.ts` CSS to use the `cloze-card-coach` `.cw-*` token and class-name contract.
2. Update `renderCard()` markup to include `data-cw-state`, `[data-cw-slot="translation"]`, `[data-cw-slot="options"]`, `[data-cw-slot="result"]`, `[data-cw-slot="clue"]`, and `[data-cw-action="reveal"]`.
3. Update `src/lib/provider.ts` validation so only exactly three generated options can reach the selectable card state.
4. Replace `reveal()` with a result renderer that accepts `userIndex | null`, fills `.cw-blank`, locks `.cw-option` rows, toggles `.cw-option--correct|--wrong|--dim`, populates `.cw-result--correct|--wrong|--reveal`, removes `[data-cw-action="reveal"]`, and shows `.cw-clue`.
5. Run typecheck/build and regenerate `dist`.
6. Sync the new `dist` into the local unpacked extension directory used by Chrome.

Rollback: revert `src/content/render.ts` and rebuild; no data migration is required.
