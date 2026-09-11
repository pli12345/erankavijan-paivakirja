#!/usr/bin/env bash
# Generates the origin block that every PR body must start with.
#
# Identity values (base, head, artifact checksums, build numbers) are read from
# git and from the artifacts themselves — never typed by hand. The script
# refuses to produce a block when the worktree is dirty or HEAD is unpushed,
# because an identity that cannot be reproduced from the remote is not an
# identity.
#
# Usage: scripts/identity.sh [base-ref] [artifact ...]
#   scripts/identity.sh
#   scripts/identity.sh main build/app.ipa build/app.aab

set -uo pipefail
cd "$(git rev-parse --show-toplevel)" || exit 2

BASE_REF="${1:-main}"
shift 2>/dev/null || true
ARTIFACTS=("$@")

fail() { echo "identity: $1" >&2; exit 1; }

# --- Refusal conditions -------------------------------------------------------

if [ -n "$(git status --porcelain)" ]; then
  echo "identity: REFUSING — worktree is not clean." >&2
  echo >&2
  git status --short >&2
  echo >&2
  echo "Commit or stash first. An identity block generated from a dirty tree" >&2
  echo "describes a state that exists on no one else's machine." >&2
  exit 1
fi

HEAD_SHA=$(git rev-parse HEAD) || fail "cannot read HEAD"
BRANCH=$(git rev-parse --abbrev-ref HEAD)

if ! git branch -r --contains "$HEAD_SHA" 2>/dev/null | grep -q .; then
  echo "identity: REFUSING — HEAD ($(git rev-parse --short HEAD)) is not on any remote branch." >&2
  echo "Push first: git push origin $BRANCH" >&2
  exit 1
fi

git rev-parse --verify "$BASE_REF" >/dev/null 2>&1 || fail "base ref '$BASE_REF' does not exist"
BASE_SHA=$(git rev-parse "$BASE_REF")

# --- Origin block -------------------------------------------------------------

echo "## Alkuperä"
echo
echo "| | |"
echo "|---|---|"
echo "| Base | \`$BASE_REF\` @ \`${BASE_SHA:0:12}\` |"
echo "| Head | \`$BRANCH\` @ \`${HEAD_SHA:0:12}\` |"
echo "| Generoitu | $(date -u +%Y-%m-%dT%H:%M:%SZ) |"
echo

COMMIT_COUNT=$(git rev-list --count "$BASE_SHA..$HEAD_SHA")
echo "**Commitit ($COMMIT_COUNT):**"
echo
if [ "$COMMIT_COUNT" -eq 0 ]; then
  echo "_Ei commiteja basen jälkeen._"
else
  git log --oneline --no-decorate "$BASE_SHA..$HEAD_SHA" | sed 's/^/- /'
fi
echo

CHANGED=$(git diff --name-only "$BASE_SHA...$HEAD_SHA")
FILE_COUNT=$(printf '%s\n' "$CHANGED" | grep -c . || true)
echo "**Muuttuneet tiedostot ($FILE_COUNT):**"
echo
if [ "$FILE_COUNT" -eq 0 ]; then
  echo "_Ei muutoksia._"
else
  printf '%s\n' "$CHANGED" | sed 's/^/- `/; s/$/`/'
fi
echo

echo "**Artefaktit:**"
echo
if [ ${#ARTIFACTS[@]} -eq 0 ]; then
  echo "_Ei artefaktia tässä vaiheessa — koodimuutos ilman buildia._"
else
  echo "| Tiedosto | Koko | SHA-256 | Muokattu |"
  echo "|---|---|---|---|"
  for a in "${ARTIFACTS[@]}"; do
    [ -f "$a" ] || fail "artifact not found: $a"
    size=$(wc -c < "$a" | tr -d ' ')
    sum=$(shasum -a 256 "$a" | awk '{print $1}')
    mtime=$(date -u -r "$a" +%Y-%m-%dT%H:%M:%SZ)
    echo "| \`$a\` | $size B | \`${sum:0:16}…\` | $mtime |"
  done
fi
echo
echo "_Generoitu skriptillä \`scripts/identity.sh\`, ei käsin._"
