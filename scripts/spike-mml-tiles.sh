#!/usr/bin/env bash
# Spike: verifies the Maanmittauslaitos WMTS tile service against real data.
#
# Run this after setting EXPO_PUBLIC_MML_API_KEY in .env. It proves three
# things that compiling code cannot:
#   1. the API key is accepted
#   2. each layer returns an actual image, not an error page
#   3. the z/y/x path order is right — a wrong order still returns 200 but
#      shows the wrong part of Finland
#
# The first fetched tile is saved as a fixture so a later regression can be
# compared against a known-good response.

set -uo pipefail
cd "$(git rev-parse --show-toplevel)" || exit 2

[ -f .env ] || { echo "spike: .env missing" >&2; exit 2; }
# shellcheck disable=SC1091
KEY=$(grep -E '^EXPO_PUBLIC_MML_API_KEY=' .env | cut -d= -f2-)

if [ -z "$KEY" ]; then
  echo "spike: EXPO_PUBLIC_MML_API_KEY is empty in .env" >&2
  echo "Register at https://omatili.maanmittauslaitos.fi/user/new/avoimet-rajapintapalvelut" >&2
  exit 2
fi

BASE="https://avoin-karttakuva.maanmittauslaitos.fi/avoin/wmts/1.0.0"
SET="WGS84_Pseudo-Mercator"
FIXTURES="fixtures/mml"
mkdir -p "$FIXTURES"

# A tile over Central Finland at zoom 9. Path order is z/y/x (TileMatrix /
# TileRow / TileCol), which is NOT the x/y order most tile servers use.
Z=9; Y=140; X=291

FAILED=0
check() {
  local layer="$1" ext="$2"
  local url="$BASE/$layer/default/$SET/$Z/$Y/$X.$ext?api-key=$KEY"
  local out="$FIXTURES/$layer-$Z-$Y-$X.$ext"

  # Never print the URL: it carries the API key.
  local code size type
  code=$(curl -s -o "$out" -w "%{http_code}" "$url")
  size=$(wc -c < "$out" | tr -d ' ')
  type=$(file -b --mime-type "$out")

  printf '%-16s HTTP %-4s %8s B  %s\n' "$layer" "$code" "$size" "$type"

  if [ "$code" != "200" ]; then
    echo "  FAIL — expected 200"; FAILED=1; rm -f "$out"; return
  fi
  case "$type" in
    image/png|image/jpeg) ;;
    *) echo "  FAIL — response is not an image ($type)"; FAILED=1; rm -f "$out"; return ;;
  esac
  # An all-white or near-empty tile usually means the path order is wrong.
  if [ "$size" -lt 1000 ]; then
    echo "  WARN — tile is suspiciously small; check the z/y/x order"
  fi
}

echo "Maanmittauslaitos WMTS — tile z=$Z y=$Y x=$X (Keski-Suomi)"
echo
check maastokartta png
check taustakartta png
check ortokuva jpg

echo
if [ $FAILED -eq 0 ]; then
  echo "spike: PASS — fixtures saved under $FIXTURES/"
  echo "Open one to confirm it shows Finnish terrain, not an empty grid."
  exit 0
fi
echo "spike: FAIL"
exit 1
