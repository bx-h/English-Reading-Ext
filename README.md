# Cloze Card Coach

A Chrome MV3 extension for contextual English reading practice.

Instead of translating the whole page, Cloze Card Coach reacts when you select an English word or phrase. It reads the nearby sentence or paragraph, creates a short cloze-style meaning question, and stores your answer locally for review.

## Features

- Selection-triggered reading help on web pages.
- Context-aware cloze card rendered in an isolated Shadow DOM.
- Three answer options with immediate feedback.
- Wrong-answer feedback preserves both your choice and the correct answer.
- Local mock mode for trying the extension without an API key.
- Bring-your-own OpenAI-compatible LLM endpoint.
- Local vocabulary history stored in IndexedDB.

## Privacy Model

- API keys are stored only in `chrome.storage.local`.
- No API key is hard-coded in the repository.
- Selected text, surrounding context, page title, and page URL may be sent to the LLM endpoint you configure.
- Mock mode does not make network requests.
- Error messages shown in the UI are sanitized to avoid exposing Bearer tokens or query-string keys.

## Permissions

The extension currently injects a content script on `<all_urls>` so it can react to selections on arbitrary reading pages. Host access for the configured LLM endpoint is requested as an optional permission when you save provider settings.

Before publishing to an extension store, consider narrowing the content-script model to site opt-in, `activeTab`, or dynamic content-script registration.

## Development

Requirements:

- Node.js 22+
- pnpm

```bash
pnpm install
pnpm typecheck
pnpm build
```

The production build is written to `dist/`.

## Load In Chrome

1. Open `chrome://extensions`.
2. Enable Developer mode.
3. Click "Load unpacked".
4. Select this repository's `dist/` directory.

## LLM Provider Setup

Open the extension options page and configure:

- API key
- API base URL, for example `https://api.openai.com/v1`
- Model name
- Optional fallback models
- Auth mode:
  - `Bearer Header`: sends `Authorization: Bearer <key>`
  - `Query parameter`: sends the key as `?ak=<key>` for compatible gateways that require query-string authentication

If no key is configured, or if "Force mock" is enabled, the extension uses local mock data.

## Evaluation Script

The optional local evaluation script uses environment variables. It never reads a repository secret file.

```bash
EVAL_API_KEY=... \
EVAL_API_BASE_URL=https://api.openai.com/v1 \
EVAL_MODEL=gpt-4o-mini \
npx tsx scripts/eval-m0.ts --limit=3
```

Optional variables:

- `EVAL_AUTH_MODE`: `bearer` or `ak-query` (default: `bearer`)
- `EVAL_FALLBACK_MODELS`: comma-separated fallback model list
- `EVAL_GLOSS_LANG`: `zh` or `en` (default: `zh`)
- `EVAL_TIMEOUT_MS`: per-request timeout in milliseconds

The script writes sanitized results to `scripts/eval-m0-output.json`, which is ignored by git.

## Project Structure

- `src/background/`: provider orchestration, request cache, record persistence messages
- `src/content/`: selection extraction and Shadow DOM card rendering
- `src/lib/`: providers, settings, and local store helpers
- `src/options/`: extension options page
- `scripts/`: local evaluation and fixture utilities
- `openspec/`: change specification history for the cloze feedback interaction

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md).

## Security

Please report security issues privately. See [SECURITY.md](SECURITY.md).

## License

MIT. See [LICENSE](LICENSE).
