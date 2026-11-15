#!/bin/zsh
# SCRIPT.txt -> ElevenLabs Hebrew VO + alignment (vo.mjs, skipped once assets/words.json exists; "./make.sh vo" forces it) -> render.sh
set -e
cd "${0:A:h}"
mkdir -p assets/vo
[[ "$1" == vo || ! -f assets/words.json ]] && node vo.mjs | tee vo.log
./render.sh
