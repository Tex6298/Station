#!/bin/bash
# Push Station build fixes to GitHub
# Usage: GITHUB_TOKEN=ghp_your_token ./push-fixes.sh
# Or: Run from the Station repo directory after applying the patch:
#   cd Station && git apply ../station-build-fix.patch && git push

set -e

if [ -z "$GITHUB_TOKEN" ]; then
  echo "Error: Set GITHUB_TOKEN environment variable"
  echo "Create one at: https://github.com/settings/tokens (needs 'repo' scope)"
  exit 1
fi

REPO="Discern-AI/Station"
BRANCH="main"
API="https://api.github.com"

echo "Pushing build fixes to $REPO..."

# Method: Clone, apply patch, push
TMPDIR=$(mktemp -d)
cd "$TMPDIR"
git clone "https://${GITHUB_TOKEN}@github.com/${REPO}.git" Station
cd Station

# Apply the patch (download it from Claude chat first, place next to this script)
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
if [ -f "$SCRIPT_DIR/station-build-fix.patch" ]; then
  git apply "$SCRIPT_DIR/station-build-fix.patch"
  git add -A
  git commit -m "fix: resolve all Vercel build failures

- vercel.json: fix --filter=web to --filter=@station/web (package name mismatch)
- packages/ai/package.json: add subpath exports for deep imports
- packages/types/package.json: add subpath exports for deep imports
- apps/web/tsconfig.json: add missing path mappings for @station/ai, @station/db
- apps/web/lib/mock-data.ts: add missing 'provider' field to mock personas
- apps/web/app/login/page.tsx: wrap useSearchParams in Suspense boundary
- apps/web/app/settings/social/page.tsx: wrap useSearchParams in Suspense boundary
- apps/web/app/layout.tsx: use dynamic import for TopNav (SSR-safe)
- Remove conflicting (marketing)/page.tsx that duplicated root / route"
  git push origin main
  echo "Done! Fixes pushed. Vercel should auto-deploy."
else
  echo "Error: station-build-fix.patch not found next to this script"
  echo "Download it from the Claude chat and place it in the same directory"
  exit 1
fi

# Cleanup
rm -rf "$TMPDIR"
