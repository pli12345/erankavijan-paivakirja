#!/usr/bin/env bash
# Mandatory gate before opening a PR, building, or releasing.
#
# Fail-closed: every check must actively pass. A check that cannot run counts as
# a failure, not as a pass — a written instruction gets forgotten, a gate does not.
#
# Usage: scripts/preflight.sh

set -uo pipefail
cd "$(git rev-parse --show-toplevel)" || exit 2

FAILED=0
step() { printf '\n== %s ==\n' "$1"; }
ok()   { echo "  ok — $1"; }
bad()  { echo "  FAIL — $1"; FAILED=1; }

step "1/7  Secret watchdog (proven in both directions)"
if bash scripts/prove-secret-scan.sh >/dev/null 2>&1; then
  ok "watchdog detects a planted secret and passes a clean tree"
else
  bad "watchdog proof failed — the gate is blind, see scripts/prove-secret-scan.sh"
fi

step "2/7  Secret scan of tracked files"
if out=$(bash scripts/secret-scan.sh 2>&1); then
  ok "${out##*$'\n'}"
else
  echo "$out" | sed 's/^/  /'
  bad "secrets found in tracked files"
fi

step "3/7  .env is ignored, .env.example is tracked"
if git check-ignore -q .env; then ok ".env is gitignored"; else bad ".env is NOT gitignored"; fi
if git ls-files --error-unmatch .env.example >/dev/null 2>&1; then
  ok ".env.example is tracked"
else
  bad ".env.example is not tracked"
fi
if git ls-files --error-unmatch .env >/dev/null 2>&1; then
  bad ".env is TRACKED — remove it from the index immediately"
else
  ok ".env is not in the index"
fi

step "4/7  Environment variable parity (.env.example vs .env)"
if [ -f .env ]; then
  missing=""
  while IFS= read -r key; do
    [ -z "$key" ] && continue
    grep -q "^${key}=" .env || missing="$missing $key"
  done < <(grep -oE '^[A-Z_][A-Z0-9_]*(?==)' .env.example 2>/dev/null || grep -E '^[A-Z_][A-Z0-9_]*=' .env.example | cut -d= -f1)
  if [ -n "$missing" ]; then
    bad "keys in .env.example missing from .env:$missing"
  else
    ok "every .env.example key is present in .env"
  fi
  # Keys the app runs without, in a degraded but honest mode. An empty one is
  # reported, never silently accepted — the degradation must stay visible.
  OPTIONAL_KEYS=" EXPO_PUBLIC_MML_API_KEY "

  # Values are never printed — only whether they are empty.
  empty=""; degraded=""
  while IFS= read -r line; do
    key="${line%%=*}"; val="${line#*=}"
    [ -n "$val" ] && continue
    case "$OPTIONAL_KEYS" in
      *" $key "*) degraded="$degraded $key" ;;
      *) empty="$empty $key" ;;
    esac
  done < <(grep -E '^[A-Z_][A-Z0-9_]*=' .env)

  if [ -n "$empty" ]; then bad "empty required values in .env:$empty"; else ok "no empty required values"; fi
  if [ -n "$degraded" ]; then
    echo "  WARN — optional key not set:$degraded"
    echo "         Maanmittauslaitoksen karttalaatat eivät ole käytössä;"
    echo "         kartta näyttää alustan oman peruskartan."
  fi
else
  bad ".env missing — copy .env.example and fill it in"
fi

step "5/7  TypeScript"
if npx --no-install tsc --noEmit 2>&1 | tee /tmp/preflight-tsc.log | tail -5; then
  if [ -s /tmp/preflight-tsc.log ]; then
    bad "typecheck produced output — see above"
  else
    ok "no type errors"
  fi
else
  bad "typecheck failed"
fi
rm -f /tmp/preflight-tsc.log

step "6/7  Lint"
if npx --no-install eslint . >/tmp/preflight-lint.log 2>&1; then
  ok "no lint errors"
else
  tail -15 /tmp/preflight-lint.log | sed 's/^/  /'
  bad "lint errors"
fi
rm -f /tmp/preflight-lint.log

step "7/7  Tests"
if npx --no-install jest --silent >/tmp/preflight-jest.log 2>&1; then
  ok "$(grep -E '^Tests:' /tmp/preflight-jest.log | head -1 | sed 's/^ *//')"
else
  tail -20 /tmp/preflight-jest.log | sed 's/^/  /'
  bad "tests failing"
fi
rm -f /tmp/preflight-jest.log

echo
if [ $FAILED -eq 0 ]; then
  echo "preflight: PASS — $(git rev-parse --short HEAD) on $(git rev-parse --abbrev-ref HEAD)"
  exit 0
fi
echo "preflight: FAIL — do not open the PR, build, or release."
exit 1
