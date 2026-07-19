#!/usr/bin/env bash
set -euo pipefail

repo_root="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
source_dir="$repo_root/dist"
resource_dir="$repo_root/platforms/ios/EnglishReading/EnglishReading Extension/Resources"

if [[ ! -d "$source_dir" ]]; then
  echo "dist/ is missing; run pnpm build first." >&2
  exit 1
fi

if [[ ! -d "$resource_dir" ]]; then
  echo "The committed iOS wrapper is missing: $resource_dir" >&2
  exit 1
fi

rsync -a --delete "$source_dir/" "$resource_dir/"
echo "Synced dist/ into the iOS Safari extension resources."
