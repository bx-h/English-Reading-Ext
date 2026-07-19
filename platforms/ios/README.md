# iOS Safari extension

`EnglishReading/` is the committed Xcode wrapper for the same extension code
that powers the Chrome build. Keeping it in this repository prevents the Web
Extension source and the iOS container from drifting apart.

## Source of truth

- Product logic lives in the repository-level `src/` directory.
- `EnglishReading/EnglishReading Extension/Resources/` is a committed snapshot
  of `dist/`, so a fresh clone can open and build the Xcode project immediately.
- Swift, plist, storyboard, asset catalog, and Xcode project files are maintained
  in `platforms/ios/EnglishReading/`.

## Refresh extension resources

After changing the TypeScript or HTML sources, run:

```bash
pnpm ios:sync
```

This builds the Web Extension and replaces the committed iOS Resources snapshot.

## Build

Open `EnglishReading/EnglishReading.xcodeproj` in Xcode. Choose your personal
development team for the `EnglishReading` app and extension targets, then run on
an iPhone or simulator. The stable bundle identifiers are:

- `com.bxhuang.EnglishReading`
- `com.bxhuang.EnglishReading.Extension`

For a signing-free simulator verification from the repository root:

```bash
xcodebuild \
  -project platforms/ios/EnglishReading/EnglishReading.xcodeproj \
  -scheme EnglishReading \
  -destination 'generic/platform=iOS Simulator' \
  -derivedDataPath /tmp/english-reading-ios-derived-data \
  CODE_SIGNING_ALLOWED=NO \
  build
```

## Regenerating the wrapper

`pnpm ios:regenerate` reruns Apple's Safari Web Extension converter. It is an
explicit maintenance operation because it overwrites the committed wrapper.
Review its diff, restore any Xcode-specific customization, and run
`pnpm ios:sync` afterward.

Xcode build products, user data, signing certificates, provisioning profiles,
and local environment files are intentionally excluded by `.gitignore`.
