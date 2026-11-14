#!/bin/zsh
# One command: SCRIPT.txt -> voice -> word timings -> scenes -> MP4.  Usage: ./make.sh [speed] [voice]
set -e
cd "${0:A:h}"
SPEED=${1:-1.15}
VOICE=${2:-am_puck}
export HYPERFRAMES_PYTHON=/Users/benlenderman/explainers/.venv/bin/python
mkdir -p assets/vo assets/words

# voice + transcription per scene, all scenes in parallel
while IFS='|' read -r id line; do
  [[ -z "$id" ]] && continue
  ( npx hyperframes tts "$line" -v $VOICE -s $SPEED -o assets/vo/$id.wav --json >/dev/null 2>&1
    npx hyperframes transcribe assets/vo/$id.wav --json 2>&1 | grep '"type":"words"' > assets/words/$id.jsonl ) &
done < SCRIPT.txt
wait

# words.json: whisper overshoots the clip end, so scale times to fit the real duration
node ../batch-2026-11-05/words.cjs

node build3d.mjs
../batch-2026-11-12/render.sh ${PWD:t}.mp4
