# iPhone Safari Extension Feasibility

Date: 2026-07-18

## Conclusion

The extension is portable to iPhone Safari, but an iPhone cannot directly load the Chrome `dist` folder. The web-extension assets must be packaged as a Safari Web Extension inside an iOS containing app, installed from Xcode for development or distributed through TestFlight/App Store.

Safari Web Extensions are available on iOS 15 and later. Safari 15.4 and later supports Manifest V3. Apple supports converting Chrome, Firefox, and Edge extensions with `safari-web-extension-packager`.

## Current-project compatibility

Likely reusable without a rewrite:

- Manifest V3 content scripts and a nonpersistent background service worker.
- The `chrome.*` namespace and callback-style asynchronous APIs.
- `chrome.storage.local` (Safari documents a 5 MB local limit).
- `optional_host_permissions` on Safari 15.5 and later.
- JavaScript, HTML, CSS, and Shadow DOM card rendering.

Likely adaptation and device-validation work:

- `src/content/index.ts` currently triggers only from `mouseup`. Apple recommends pointer-aware interaction on iOS; Safari text-selection handles may additionally require a debounced `selectionchange` path.
- The settings surface must be verified on iPhone. Safari supports extension options, but the generated containing app may need to expose the options page clearly.
- Website access for the `<all_urls>` content script and the configured LLM origin must be granted by the user in Safari.
- `storage.local` is device-local, so the API key and model configuration must be entered again on iPhone. Safari's documented `storage.sync` implementation does not sync values.
- The narrow viewport, touch hit targets, text-selection menu, safe areas, card height, and internal scrolling need real-device testing.
- The Safari packager's manifest warnings are authoritative and must be reviewed after conversion.

## Development and installation path

1. Build the existing web extension assets.
2. Run `xcrun safari-web-extension-packager <extension-folder> --ios-only` to generate the Xcode containing app and Safari Web Extension target.
3. Build and run the iOS app on a simulator or development iPhone.
4. On iPhone, enable it under Safari's extension management UI and grant website access.
5. For broader installation, distribute the containing app using TestFlight or the App Store.

Apple states that simulator testing is available before joining the Apple Developer Program, while testing on a physical iOS device requires Developer Program membership for this workflow.

This Mac is ready for the conversion experiment: Xcode 26.4.1 and `safari-web-extension-packager` are installed.

## Recommended next flow

Use a throwaway device prototype before production implementation. The prototype should answer one question: can selecting a word with iPhone Safari's native selection handles reliably trigger the card without fighting the system selection menu? If that succeeds, proceed with a shared-source Safari target and TDD for cross-browser input handling.

## Primary sources

- [Safari web extensions](https://developer.apple.com/documentation/safariservices/safari-web-extensions)
- [Packaging a web extension for Safari](https://developer.apple.com/documentation/safariservices/packaging-a-web-extension-for-safari)
- [Running your Safari web extension](https://developer.apple.com/documentation/safariservices/running-your-safari-web-extension)
- [Assessing browser compatibility](https://developer.apple.com/documentation/safariservices/assessing-your-safari-web-extension-s-browser-compatibility)
- [Optimizing a Safari web extension for iOS](https://developer.apple.com/documentation/safariservices/optimizing-your-web-extension-for-safari)
- [Managing Safari web extension permissions](https://developer.apple.com/documentation/safariservices/managing-safari-web-extension-permissions)
- [Safari 15.5 release notes](https://developer.apple.com/documentation/safari-release-notes/safari-15_5-release-notes)
- [Install and manage Safari extensions on iPhone](https://support.apple.com/guide/iphone/get-extensions-iphab0432bf6/ios)
