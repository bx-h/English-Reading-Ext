## ADDED Requirements

### Requirement: Initial card presents exactly three answer options
The cloze card SHALL present exactly three candidate answer options in its initial selectable state, and provider validation MUST reject generated cloze results that do not contain exactly three options.

#### Scenario: Valid cloze result renders three buttons
- **WHEN** a cloze result contains exactly three options and a valid `answerIndex`
- **THEN** the initial card displays three selectable option buttons
- **AND** the correct answer is one of those three buttons

#### Scenario: Invalid option count rejected before render
- **WHEN** a generated cloze result contains fewer or more than three options
- **THEN** provider validation rejects the result
- **AND** the invalid result is not rendered as a selectable card

### Requirement: Card uses Lovable source DOM contract
The cloze card SHALL use the `bx-h/cloze-card-coach` `.cw-*` class-name and slot contract inside the Shadow DOM renderer.

#### Scenario: Initial state uses source class contract
- **WHEN** the card renders the selectable initial state
- **THEN** the root card has class `cw-card` and `data-cw-state="initial"`
- **AND** the header uses `cw-header`, `cw-word`, and `cw-badge`
- **AND** the answer controls use `cw-options` and `cw-option`
- **AND** the reveal action uses `data-cw-action="reveal"`

#### Scenario: Completion state uses source state classes
- **WHEN** the user answers or directly reveals
- **THEN** the root card updates `data-cw-state` to `answered` or `revealed`
- **AND** option rows use `cw-option--correct`, `cw-option--wrong`, or `cw-option--dim`
- **AND** feedback uses `cw-result--correct`, `cw-result--wrong`, or `cw-result--reveal`
- **AND** the clue uses `cw-clue`

### Requirement: Answer result states preserve learner context
The cloze card SHALL represent answer completion with explicit result states and MUST preserve the user's selected option when the answer is wrong.

#### Scenario: Correct option selected
- **WHEN** the user selects the option whose index equals `answerIndex`
- **THEN** the card fills the blank with the correct contextual meaning
- **AND** the card shows a positive result marker
- **AND** the three option rows remain visible in a read-only state
- **AND** the chosen option row is marked as correct
- **AND** the card shows a compact positive feedback panel
- **AND** the card prevents further answer changes

#### Scenario: Wrong option selected
- **WHEN** the user selects an option whose index does not equal `answerIndex`
- **THEN** the card fills the blank with the correct contextual meaning
- **AND** the three option rows remain visible in a read-only state
- **AND** the user's selected option row is marked with a gentle error state
- **AND** the correct option row is marked with a success state
- **AND** the card shows compact feedback panels for both the user's choice and the correct answer
- **AND** the card preserves both values until the card is dismissed or replaced
- **AND** the card prevents further answer changes

#### Scenario: Direct reveal selected
- **WHEN** the user chooses to reveal the answer without selecting an option
- **THEN** the card fills the blank with the correct contextual meaning
- **AND** the three option rows remain visible in a read-only state
- **AND** the correct option row is marked with a success state
- **AND** the card shows the correct option as the answer
- **AND** the card does not show any user-choice error marker

### Requirement: Completion hides reveal action and exposes clue
The cloze card SHALL remove pre-answer actions and expose the clue after the user answers or directly reveals the answer.

#### Scenario: Answer completes the interaction
- **WHEN** the user selects any answer option
- **THEN** the "看不出 / 直接看答案" action is removed from the card
- **AND** the clue is visible

#### Scenario: Direct reveal completes the interaction
- **WHEN** the user clicks "看不出 / 直接看答案"
- **THEN** the reveal action is removed from the card
- **AND** the clue is visible

### Requirement: Embedded card remains compact and restrained
The cloze card SHALL remain suitable for embedding inside X/Twitter, news pages, and document pages.

#### Scenario: Result feedback shown in narrow content
- **WHEN** the card displays correct, wrong, or reveal feedback
- **THEN** answer options and feedback labels wrap within the card without overflowing
- **AND** success and error colors are visually distinct but not visually dominant
- **AND** the existing LLM/MOCK/degraded badge remains available without competing with the answer feedback

#### Scenario: Floating card shown in a wide article or X post
- **WHEN** a selection occurs inside a wide text block
- **THEN** the floating card remains compact instead of stretching to the full parent text width
- **AND** the option rows use a stacked A/B/C layout comparable to the Lovable reference
