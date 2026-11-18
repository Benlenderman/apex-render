#!/bin/zsh
# Whole reel in one command: voice, word timings, scenes, cloud render.  Usage: ./make.sh [speed]
set -e
cd "${0:A:h}"
K=${APEX_REELS:-$HOME/.claude/skills/apex-never-reels}
$K/scripts/prep-seq.sh ${1:-1.3}
$K/scripts/render.sh ${PWD:t}.mp4
