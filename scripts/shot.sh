#!/usr/bin/env bash
# Screenshot the landing page and the app with headless Chromium.
#
#   scripts/shot.sh .            -> docs/assets/landing-desktop.png, landing-mobile.png
#   scripts/shot.sh . app        -> docs/assets/app-desktop.png, app-mobile.png
#   scripts/shot.sh . app seeded -> app-seeded-*.png (with demo history in storage)
#
# Look at the output before committing. A page that renders wrong is worse than
# no screenshot.
set -euo pipefail

REPO="${1:?usage: shot.sh <repo-path> [landing|app] [out-name]}"
KIND="${2:-landing}"
NAME="${3:-$KIND}"
ROOT="$(cd "$REPO" && pwd)"

if [ "$KIND" = "app" ]; then PAGE="$ROOT/docs/play/index.html"; else PAGE="$ROOT/docs/index.html"; fi
[ -f "$PAGE" ] || { echo "no page at $PAGE"; exit 1; }

mkdir -p "$ROOT/docs/assets"
CHROME="$(command -v chromium || command -v chromium-browser || command -v google-chrome)"

shot () { # width, outfile, height
  "$CHROME" --headless --no-sandbox --disable-gpu --hide-scrollbars \
    --window-size="$1,$3" --screenshot="$2" "file://$PAGE" >/dev/null 2>&1
  echo "wrote $2 ($(stat -c%s "$2") bytes)"
}

if [ "$KIND" = "app" ]; then
  shot 430  860  "$ROOT/docs/assets/${NAME}-mobile.png"
  shot 1280 1500 "$ROOT/docs/assets/${NAME}-desktop.png"
else
  shot 1280 2200 "$ROOT/docs/assets/${NAME}-desktop.png"
  shot 430  1600 "$ROOT/docs/assets/${NAME}-mobile.png"
fi
