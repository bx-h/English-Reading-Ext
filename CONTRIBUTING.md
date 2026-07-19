# Contributing

Thanks for considering a contribution.

## Development Workflow

1. Fork the repository and create a feature branch.
2. Install dependencies with `pnpm install`.
3. Make focused changes.
4. Run:

```bash
pnpm typecheck
pnpm build
```

5. Open a pull request with a clear description and screenshots for UI changes.

## Pull Request Guidelines

- Keep changes scoped to one problem.
- Do not commit the root `dist/` output, package archives, logs, local secrets, or evaluation output. The committed iOS Safari resource snapshot under `platforms/ios/EnglishReading/EnglishReading Extension/Resources/` is the explicit exception; refresh it with `pnpm ios:sync`.
- Do not add real API keys, tokens, private endpoints, or user data to tests, fixtures, screenshots, or documentation.
- For content-script UI changes, include the affected browser state and viewport in the PR description.

## Code Style

- Use TypeScript.
- Prefer existing module boundaries under `src/background`, `src/content`, `src/lib`, and `src/options`.
- Keep Shadow DOM card styles scoped and compact.
- Treat privacy and permission changes as user-facing behavior changes.
