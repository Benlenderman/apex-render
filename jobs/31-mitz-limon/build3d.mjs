// 3D version: index.html (one three.js canvas, world.js) + compositions/captions.html (white pill), from word timings.
// Run: node build3d.mjs
import fs from "node:fs";

const W = JSON.parse(fs.readFileSync("assets/words.json", "utf8"));
const LEAD = 0.05, TAIL = 0.35; // a breath between lines; the last line gets 1.2s for the end beat

let t = 0;
const S = {};
for (const id of Object.keys(W)) {
  const dur = +(W[id].dur + LEAD + (id === Object.keys(W).at(-1) ? 1.2 : TAIL)).toFixed(3);
  S[id] = [+t.toFixed(3), dur];
  t += dur;
}
const TOTAL = +t.toFixed(3);

// captions: 1-3 words per pill, broken at punctuation
const groups = [];
for (const id of Object.keys(W)) {
  const off = S[id][0] + LEAD;
  let g = [];
  W[id].words.forEach((w, i) => {
    if (g.length >= 2 && /^(עשר|בדיוק|איזה|לא|רק)$/.test(w.text)) { groups.push(g); g = []; } // start a pill on these words
    g.push({ text: w.text, start: off + w.start, end: off + w.end });
    const glue = /^(קורות|לחיצת|ולחיצת|ראש|נעים)$/.test(w.text); // keep "קורות חיים", "לחיצת יד" together
    const rest = W[id].words.slice(i + 1), orphan = rest.length && /[.,?!]$/.test(rest[0].text) && !/^(עשר|בדיוק|איזה|לא|רק)$/.test(rest[0].text); // never leave one word alone before a stop
    if (!glue && !orphan && g.length >= 3 || /[.,?!]$/.test(w.text) || i === W[id].words.length - 1) { groups.push(g); g = []; }
  });
}
let capHtml = "", capJs = "";
groups.forEach((g, gi) => {
  const gs = Math.max(0, g[0].start - 0.04);
  const ge = groups[gi + 1] ? Math.min(groups[gi + 1][0].start - 0.04, g.at(-1).end + 0.5) : g.at(-1).end + 0.4;
  const text = g.map((w) => w.text).join(" ").replace(/[.,]$/, "");
  capHtml += `    <div id="cg${gi}" class="cg"><span id="cp${gi}" class="pill">${text}</span></div>\n`;
  capJs += `    tl.set("#cg${gi}", { visibility: "visible" }, ${gs.toFixed(3)});
    tl.fromTo("#cp${gi}", { scale: 0.82, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.06, ease: "back.out(2.2)" }, ${gs.toFixed(3)});
    tl.set("#cg${gi}", { visibility: "hidden" }, ${ge.toFixed(3)});\n`;
});
fs.writeFileSync("compositions/captions.html", `<template>
  <link href="https://fonts.googleapis.com/css2?family=Heebo:wght@700;800;900&display=block" rel="stylesheet" />
  <style>
    #root { position: absolute; inset: 0; }
    .cg { position: absolute; left: 0; right: 0; top: 1580px; display: flex; justify-content: center; visibility: hidden; }
    .pill { display: inline-block; background: #ffffff; color: #0b0920; font: 800 64px Heebo, Arial, sans-serif; direction: rtl; padding: 16px 38px 20px; border-radius: 999px; white-space: nowrap; }
  </style>
  <div id="root" data-composition-id="captions" data-width="1080" data-height="1920">
${capHtml}  </div>
  <script>
    const tl = gsap.timeline({ paused: true });
${capJs}    tl.set({}, {}, ${TOTAL});
    window.__timelines["captions"] = tl;
  </script>
</template>
`);

const vo = Object.keys(W).map((id) => `      <audio id="vo-${id}" class="clip" src="assets/vo/${id}.mp3" data-start="${(S[id][0] + LEAD).toFixed(3)}" data-duration="${W[id].dur}" data-track-index="3" data-volume="1"></audio>`).join("\n");
fs.writeFileSync("index.html", `<!doctype html>
<html lang="he" data-resolution="portrait">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=1080, height=1920" />
    <script src="https://cdn.jsdelivr.net/npm/gsap@3.15.0/dist/gsap.min.js"></script>
    <script type="importmap">
      { "imports": {
        "three": "https://cdn.jsdelivr.net/npm/three@0.181.2/build/three.module.js",
        "three/addons/": "https://cdn.jsdelivr.net/npm/three@0.181.2/examples/jsm/"
      } }
    </script>
    <link href="https://fonts.googleapis.com/css2?family=Heebo:wght@700;800;900&display=block" rel="stylesheet" />
    <style>
      * { margin: 0; padding: 0; box-sizing: border-box; }
      html, body { margin: 0; width: 1080px; height: 1920px; overflow: hidden; background: #080622; }
      #world { position: absolute; inset: 0; width: 1080px; height: 1920px; display: block; }
    </style>
  </head>
  <body>
    <div id="root" data-composition-id="main" data-start="0" data-duration="${TOTAL}" data-width="1080" data-height="1920">
      <div id="stage" class="clip" data-start="0" data-duration="${TOTAL}" data-track-index="1" style="position:absolute;inset:0"><canvas id="world" width="1080" height="1920" data-layout-allow-overflow></canvas></div>
      <div id="captions" data-composition-id="captions" data-composition-src="compositions/captions.html" data-start="0" data-duration="${TOTAL}" data-track-index="2" data-track-kind="captions" data-width="1080" data-height="1920" style="z-index: 10"></div>
${vo}
    </div>
    <script>
      window.__EV = ${JSON.stringify({ S, W, LEAD })};
      const tl = gsap.timeline({ paused: true });
      tl.set({}, {}, ${TOTAL});
      window.__timelines["main"] = tl;
    </script>
    <script type="module" src="world.js"></script>
  </body>
</html>
`);
console.log("total", TOTAL, "pills", groups.length);
