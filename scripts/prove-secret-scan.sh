#!/usr/bin/env bash
# Proves the secret watchdog works in BOTH directions:
#   1. it passes on the current clean tree, and
#   2. it fails on a planted, real-shaped secret.
#
# Rule this enforces: never trust a green security check until it has been shown
# to detect a planted secret. A scanner that silently scans nothing reports
# success forever.

set -uo pipefail
cd "$(git rev-parse --show-toplevel)" || exit 2

SCAN=scripts/secret-scan.sh
PLANT=".secret-scan-probe.ts"

cleanup() {
  rm -f "$PLANT"
  git rm --cached --quiet "$PLANT" 2>/dev/null || true
}
trap cleanup EXIT

echo "== Direction 1: clean tree must pass =="
if ! bash "$SCAN" >/dev/null; then
  echo "PROOF FAILED: watchdog reports a secret in the clean tree." >&2
  exit 1
fi
echo "  ok — clean tree passes"

echo "== Direction 2: planted secret must be detected =="
# A structurally valid JWT (header.payload.signature), built so it cannot be
# mistaken for a real credential: the payload decodes to role "planted-probe".
printf 'export const probe = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyb2xlIjoicGxhbnRlZC1wcm9iZSIsImlzcyI6InByb3ZlLXNjcmlwdCJ9.THIS_IS_NOT_A_REAL_SIGNATURE_0000";\n' > "$PLANT"
git add --intent-to-add --force "$PLANT" >/dev/null 2>&1

if bash "$SCAN" >/dev/null 2>&1; then
  echo "PROOF FAILED: watchdog did NOT detect the planted secret." >&2
  echo "The gate is blind. Do not rely on it." >&2
  exit 1
fi
echo "  ok — planted secret detected"

echo
echo "secret-scan proven in both directions."
