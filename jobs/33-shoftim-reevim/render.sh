#!/bin/zsh
# build3d + render -> <folder>.mp4, at most 3 renders on the machine at once (slots in ../.slots).
set -e
cd "${0:A:h}"
node build3d.mjs
mkdir -p ../.slots
while true; do for i in 1 2 3; do mkdir ../.slots/$i 2>/dev/null && { SLOT=$i; break 2; }; done; sleep 10; done
trap "rmdir ../.slots/$SLOT" EXIT
npx hyperframes render -o ${PWD:t}.mp4 2>&1 | grep -E "Render complete|MB|rror"
