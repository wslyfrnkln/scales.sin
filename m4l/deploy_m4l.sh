#!/bin/zsh
# =============================================================================
# SCALES.SIN M4L — deploy assembler
#
# Why this exists: node.script resolves scales_entry.js relative to the .amxd's
# on-disk location. When Live collects the device into a project (Presets/MIDI
# Effects/.../Imported/), it copies ONLY the .amxd — the JS bridge is stripped
# and the device dies silently (no boot, no error; 2026-07-14 UCANTSAY test).
# Fix: deploy the device as a self-contained folder — .amxd + entry shim +
# bridge/ with the engine, vocabulary module, and vocab JSON copied INTO it
# (bridge files resolve locally-first, repo-layout fallback).
#
# Usage:
#   ./deploy_m4l.sh                 # deploy to User Library/.../Sin.Audio/Scales.sin-m4l
#   ./deploy_m4l.sh <target-dir>    # deploy next to an .amxd Live already collected
#                                   # (pass the project's .../Imported dir)
# =============================================================================
set -euo pipefail

HERE="${0:A:h}"                       # m4l/
APP="${HERE:h}"                       # Scales.sin App/
DEFAULT_TARGET="$HOME/Music/Ableton/User Library/Max for Live Devices/Sin.Audio/Scales.sin-m4l"
TARGET="${1:-$DEFAULT_TARGET}"
MAXNODE="/Applications/Max.app/Contents/Resources/C74/packages/Node for Max/source/bin/osx/node/node"

mkdir -p "$TARGET/bridge"

cp "$HERE/Scales.sin-m4l.amxd" "$TARGET/"
cp "$HERE/scales_entry.js"   "$TARGET/"
cp "$HERE/bridge/main.js" "$HERE/bridge/vocab_loader.js" \
   "$HERE/bridge/degree_resolver.js" "$HERE/bridge/midi_convert.js" \
   "$HERE/bridge/transform.js" "$HERE/bridge/constraints.js" \
   "$HERE/bridge/recipes.js" \
   "$TARGET/bridge/"
# App-root deps copied into bridge/ — the locally-first resolution in the bridge
# files picks these up; nothing outside the device folder is referenced.
cp "$APP/chord_suggestion_engine.js" "$APP/voicing_vocabulary.js" \
   "$APP/artist_vocab.json" "$TARGET/bridge/"

# Verify: the deployed bridge must boot standalone on Max's bundled Node
# (same binary node.script uses). A throw here = the device would die silently.
if [[ -x "$MAXNODE" ]]; then
    "$MAXNODE" -e "require('$TARGET/bridge/main.js')" \
        && echo "boot verify: OK (bundled node $("$MAXNODE" --version))" \
        || { echo "boot verify: FAILED — do not load this deploy"; exit 1; }
else
    echo "boot verify: SKIPPED — Max bundled node not found at $MAXNODE"
fi

echo "deployed → $TARGET"
echo "reminder: delete + re-drag the device in Live — a loaded device is a stale copy"
