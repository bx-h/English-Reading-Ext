# Security Policy

## Reporting A Vulnerability

Please do not open a public issue for vulnerabilities involving credential handling, extension permissions, data exposure, or provider request leakage.

Report privately through GitHub Security Advisories if available, or contact the repository owner directly.

## Data And Credentials

- Do not commit API keys, Bearer tokens, query-string keys, cookies, local storage exports, or real user reading history.
- The extension stores provider credentials in `chrome.storage.local`.
- The extension may send selected text and nearby page context to the user-configured LLM endpoint.

## Supported Versions

This project is pre-1.0. Security fixes target the latest `main` branch.
