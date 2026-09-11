#!/usr/bin/env bash
# Secret watchdog. Scans tracked files for credentials that must never be committed.
#
# Exit codes: 0 = clean, 1 = secret found, 2 = watchdog could not run.
#
# This gate is proven in both directions by scripts/prove-secret-scan.sh, which
# plants a real-shaped secret and asserts that this script fails on it. A
# watchdog that has never been shown to fail is not evidence of anything.
#
# Portability note: macOS ships bash 3.2, which has no `mapfile`. An earlier
# version of this script used it, silently scanned zero files and reported
# "clean" on every run. Keep this script bash 3.2 compatible.

set -uo pipefail
cd "$(git rev-parse --show-toplevel)" || exit 2

# Pattern|Description. Patterns are ERE, matched against tracked file contents.
PATTERNS=(
  'sb_secret_[A-Za-z0-9_-]{16,}|Supabase secret key'
  'eyJ[A-Za-z0-9_-]{20,}\.[A-Za-z0-9_-]{20,}\.[A-Za-z0-9_-]{10,}|JWT (Supabase service_role / anon)'
  '-----BEGIN [A-Z ]*PRIVATE KEY-----|Private key block'
  'AKIA[0-9A-Z]{16}|AWS access key id'
  'AIza[0-9A-Za-z_-]{35}|Google API key'
  'gh[pousr]_[A-Za-z0-9]{36,}|GitHub token'
  'xox[baprs]-[A-Za-z0-9-]{10,}|Slack token'
)

# Excluded from scanning: the lockfile carries integrity hashes that are long
# but harmless, and these two scripts contain the patterns by necessity.
EXCLUDE_RE='^(package-lock\.json|scripts/secret-scan\.sh|scripts/prove-secret-scan\.sh)$'

FILE_LIST=$(mktemp) || exit 2
trap 'rm -f "$FILE_LIST"' EXIT
git ls-files | grep -Ev "$EXCLUDE_RE" > "$FILE_LIST"

COUNT=$(wc -l < "$FILE_LIST" | tr -d ' ')
if [ "$COUNT" -eq 0 ]; then
  echo "secret-scan: scanned zero files — refusing to report success" >&2
  exit 2
fi

# Sanity check: the scanner must be able to match a string we know is present.
# Without this, a broken grep invocation would look identical to a clean tree.
if ! tr '\n' '\0' < "$FILE_LIST" | xargs -0 grep -lI "expo" >/dev/null 2>&1; then
  echo "secret-scan: self-check failed — grep matched nothing in a tree that" >&2
  echo "must contain 'expo'. The scanner is not reading files." >&2
  exit 2
fi

found=0
for entry in "${PATTERNS[@]}"; do
  pattern="${entry%%|*}"
  desc="${entry#*|}"
  # -I skips binary files; -n gives line numbers for the report.
  hits=$(tr '\n' '\0' < "$FILE_LIST" | xargs -0 grep -InE "$pattern" 2>/dev/null)
  if [ -n "$hits" ]; then
    found=1
    echo "SECRET FOUND — $desc"
    # Print location only. Never echo the matched value into logs.
    echo "$hits" | cut -d: -f1,2 | sed 's/^/  /'
  fi
done

if [ $found -eq 1 ]; then
  echo
  echo "secret-scan: FAILED. Do not commit. Rotate anything that was already pushed —"
  echo "git history keeps a secret even after the file is cleaned."
  exit 1
fi

echo "secret-scan: clean ($COUNT tracked files scanned)"
exit 0
