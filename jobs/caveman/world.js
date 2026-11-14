// NEVER PAY FOR AN ESSAY (Caveman). Laptop on a dark desk; wrong = red essay + token coins pour out, right = short green answer.
import { THREE, S, g, sm, scene, bloom, glow, VIOLET, ORANGE, RED, GREEN, WHITE, shoot, run } from "./kit.js";
import { title, cap, boom, endCard, overlays, fitText } from "./extra.js";

import { RoundedBoxGeometry } from "three/addons/geometries/RoundedBoxGeometry.js";
const std = (c, e, r = 0.45, m = 0.25) => new THREE.MeshStandardMaterial({ color: c, emissive: e, roughness: r, metalness: m });
const rbox = (w, h, d, r, mat) => new THREE.Mesh(new RoundedBoxGeometry(w, h, d, 4, r), mat);
const mBody = std(0x4a42c8, 0x1c1766, 0.35, 0.35), mDark = std(0x14123a, 0x07061a, 0.6, 0.2);
const WORLD = new THREE.Group(); scene.add(WORLD); // hidden before the CTA
const add = (o, p = WORLD) => (p.add(o), o);

// ---------- desk + room lights ----------
const desk = add(rbox(9, 0.3, 5, 0.12, std(0x221d66, 0x0c0a30, 0.7, 0.1))); desk.position.set(0, -0.14, -0.6);
const pl = add(new THREE.PointLight(0xe8e2ff, 18, 9, 1.6)); pl.position.set(-1.6, 3.2, 2.2);
const rim = add(new THREE.PointLight(0xff8a3a, 10, 8, 1.6)); rim.position.set(2.6, 2.2, -2.4);

// ---------- laptop at the origin, screen faces +z ----------
add(rbox(2.6, 0.1, 1.7, 0.04, mBody)).position.set(0, 0.05, 0);
add(rbox(2.2, 0.02, 0.8, 0.01, mDark)).position.set(0, 0.105, -0.2);
add(rbox(0.8, 0.02, 0.45, 0.01, mDark)).position.set(0, 0.105, 0.5);
const lid = add(new THREE.Group()); lid.position.set(0, 0.1, -0.85); lid.rotation.x = -0.12;
add(rbox(2.6, 1.7, 0.06, 0.04, mBody), lid).position.set(0, 0.85, 0);
const mScreen = new THREE.MeshBasicMaterial({ color: 0x0b0a26, toneMapped: false });
add(new THREE.Mesh(new THREE.PlaneGeometry(2.4, 1.5), mScreen), lid).position.set(0, 0.85, 0.035);
add(new THREE.Mesh(new THREE.PlaneGeometry(2.4, 0.12), glow(VIOLET, 0.35)), lid).position.set(0, 1.54, 0.037);
const accent = add(new THREE.Mesh(new THREE.PlaneGeometry(2.4, 0.015), glow(VIOLET, 1.6)), lid); accent.position.set(0, 1.475, 0.038);
[-1.08, -0.98, -0.88].forEach((x, i) => add(new THREE.Mesh(new THREE.CircleGeometry(0.025, 16), glow([RED, ORANGE, GREEN][i], 1.2)), lid).position.set(x, 1.54, 0.039));

// things drawn on the screen live in the lid (local y 0.1..1.45, x -1.2..1.2)
function bubble(w, h, hex, k, txt, tw, x, y) {
  const gp = add(new THREE.Group(), lid); gp.position.set(x, y, 0.06);
  add(rbox(w, h, 0.03, Math.min(0.06, h / 3), new THREE.MeshBasicMaterial({ color: new THREE.Color(hex).multiplyScalar(0.28), toneMapped: false })), gp);
  add(new THREE.Mesh(new THREE.PlaneGeometry(w - 0.04, 0.012), glow(hex, k)), gp).position.set(0, -h / 2 + 0.02, 0.02);
  if (txt) { const t = fitText([txt], WHITE, 1.0, tw); t.visible = true; t.position.z = 0.02; gp.add(t); gp.userData.t = t; }
  gp.visible = false; return gp;
}
// s1-s2: the user's quick question, then the AI's essay (greeting, wall of red lines, recap)
const ask = bubble(1.05, 0.2, VIOLET, 1.4, "QUICK QUESTION?", 0.95, 0.6, 1.32);
const greet = bubble(1.5, 0.2, RED, 1.6, "GREAT QUESTION! HAPPY TO HELP.", 1.35, -0.4, 1.08);
const LINES = Array.from({ length: 6 }, (_, i) => {
  const m = add(new THREE.Mesh(new THREE.PlaneGeometry(1.5 + 0.55 * ((i * 37) % 5) / 4, 0.055), glow(RED, 0.9)), lid);
  m.geometry.translate(m.geometry.parameters.width / 2, 0, 0); m.position.set(-1.12, 0.9 - i * 0.095, 0.06); m.visible = false; return m;
});
const recap = bubble(1.5, 0.2, RED, 1.6, "TO SUM UP, IN SHORT...", 1.2, -0.4, 0.25);

// s4-s5: the Caveman answer (README example), the install command, the code that stays exact
const cmd = bubble(1.9, 0.2, GREEN, 1.4, "npx @caveman-ai/cli", 1.2, 0, 0.3);
const ans1 = bubble(1.9, 0.22, GREEN, 1.8, "NEW OBJECT REF EACH RENDER.", 1.55, 0, 1.15);
const ans2 = bubble(1.9, 0.22, GREEN, 1.8, "WRAP THE PROP IN useMemo.", 1.55, 0, 0.85);
const chip = bubble(0.9, 0.24, VIOLET, 2.2, "useMemo", 0.7, 0, 0.5);

// s6: two log/test sheets on the screen that squash down
function sheet(txt, x) {
  const gp = add(new THREE.Group(), lid); gp.position.set(x, 0.75, 0.07);
  add(rbox(0.8, 1.0, 0.04, 0.05, std(0xc9c0ff, 0x4a3fb0, 0.4, 0.1)), gp);
  for (let i = 0; i < 5; i++) add(new THREE.Mesh(new THREE.PlaneGeometry(0.55 - (i % 2) * 0.15, 0.04), new THREE.MeshBasicMaterial({ color: 0x6a5fd0 })), gp).position.set(-0.05, 0.28 - i * 0.12, 0.022);
  const t = fitText([txt], VIOLET, 1.2, 0.75); t.visible = true; t.position.set(0, 0.42 - 0.6, 0.024); gp.add(t); t.position.y = -0.38;
  gp.visible = false; return gp;
}
const logs = sheet("LOGS", -0.55), tests = sheet("TESTS", 0.55);

// s3: the caveman rock (a chunky grey stone with a green glow)
const rock = add(new THREE.Group());
const stone = add(new THREE.Mesh(new THREE.DodecahedronGeometry(0.42, 0), std(0x8a8698, 0x1a3a2a, 0.85, 0.05)), rock); stone.scale.set(1.25, 0.85, 0.9);
add(new THREE.Mesh(new THREE.TorusGeometry(0.6, 0.02, 8, 64), glow(GREEN, 1.8)), rock).rotation.x = 0;
rock.position.set(0, 0.95, -0.4);

// token coins: red pile in s2, two stacks (63 vs 20) in s5
const coin = (hex, e) => { const m = add(new THREE.Mesh(new THREE.CylinderGeometry(0.15, 0.15, 0.05, 28), std(hex, e, 0.3, 0.6))); m.visible = false; return m; };
const pile = Array.from({ length: 14 }, () => coin(0xff4050, 0x7a1018));
const stackR = Array.from({ length: 13 }, () => coin(0xff4050, 0x7a1018));
const stackG = Array.from({ length: 4 }, () => coin(0x40e080, 0x0f5a33));
const n63 = fitText(["63"], RED, 1.6, 0.7), n20 = fitText(["20"], GREEN, 1.4, 0.7);
[n63, n20].forEach((m) => WORLD.add(m));

// s6: a meter above the laptop: three bars, the last third switches off
const meter = add(new THREE.Group()); meter.position.set(0, 2.1, -0.5);
const segs = [0, 1, 2].map((i) => add(rbox(0.62, 0.26, 0.08, 0.05, glow(i < 2 ? GREEN : RED, 1.2)), meter));
segs.forEach((s, i) => s.position.x = (i - 1) * 0.68);

// ---------- s3: GitHub star (as in filee) ----------
const starShape = new THREE.Shape();
for (let i = 0; i < 10; i++) { const a = Math.PI / 2 + (i * Math.PI) / 5, r = i % 2 ? 0.17 : 0.4; starShape[i ? "lineTo" : "moveTo"](Math.cos(a) * r, Math.sin(a) * r); }
const star = add(new THREE.Mesh(new THREE.ExtrudeGeometry(starShape, { depth: 0.08, bevelEnabled: true, bevelSize: 0.03, bevelThickness: 0.03, bevelSegments: 2 }), glow(ORANGE, 1.5)));

// ---------- captions ----------
title("NEVER PAY FOR AN ESSAY");
cap("s1", "exploring", ["EXPLORING GITHUB REPOS"], WHITE, { until: "s1" });
cap("s2", "greeting", ["A GREETING"], RED, { until: ["s2", "recap"] });
cap("s2", "recap", ["A RECAP"], RED, { until: ["s2", "every"] });
cap("s2", "every", ["EVERY WORD", "COSTS TOKENS"], RED, { boom: 0.5 });
cap("s3", "caveman", ["CAVEMAN"], GREEN, { until: ["s3", "almost"], boom: 0.5 });
cap("s3", "almost", ["ALMOST 120,000 STARS", "IN 7 MONTHS"], ORANGE, { until: ["s3", "it"], boom: 0.5 });
cap("s3", "makes", ["SAY LESS.", "READ LESS."], GREEN);
cap("s4", "one", ["ONE COMMAND"], GREEN, { until: ["s4", "answers"] });
cap("s4", "answers", ["ANSWER FIRST"], GREEN, { until: ["s4", "one"], untilN: 2 });
cap("s4", "one", ["ONE IDEA", "PER SENTENCE"], GREEN, { n: 2, boom: 0.4 });
cap("s5", "same", ["SAME FIX"], GREEN, { until: ["s5", "63"] });
cap("s5", "63", ["63 TOKENS BECOME 20"], GREEN, { until: ["s5", "your"], boom: 0.5 });
cap("s5", "code", ["CODE STAYS EXACT"], VIOLET);
cap("s6", "shrinks", ["SHRINKS LOGS", "AND TEST OUTPUT"], GREEN, { until: ["s6", "reads"] });
cap("s6", "reads", ["READS A THIRD LESS"], GREEN, { boom: 0.5 });
endCard(["SKIP THE ESSAY.", "GET THE ANSWER."]);
boom("s1", "essay", 0.5);

// ---------- timings (global seconds) ----------
const T = {
  essay: g("s1", "essay"), greet: g("s2", "greeting"), recap: g("s2", "recap"), costs: g("s2", "costs"),
  s3: S.s3[0], cave: g("s3", "caveman"), almost: g("s3", "almost"), it: g("s3", "it"), say: g("s3", "say"), read: g("s3", "read"),
  cmd: g("s4", "command"), ans: g("s4", "answers"), idea: g("s4", "idea"),
  same: g("s5", "same"), n63: g("s5", "63"), n20: g("s5", "20"), code: g("s5", "code"),
  logs: g("s6", "logs"), tests: g("s6", "test"), shrink: g("s6", "shrinks"), reads: g("s6", "reads"), third: g("s6", "third"),
  s7: S.s7[0], s8: S.s8[0],
};

// ---------- shots: [cx,cy,cz, lx,ly,lz, fov] ----------
const SH = [
  { at: 0, K: [[0, [0.3, 1.8, 5.6, 0, 0.9, -0.5, 48]], [S.s2[0], [0.1, 1.8, 5.0, 0, 1.0, -0.6, 48]]] },
  { at: S.s2[0], K: [[0, [0.1, 1.8, 5.0, 0, 1.0, -0.6, 48]], [2.0, [-0.2, 1.7, 4.7, 0, 0.95, -0.6, 48]]] },
  { at: T.costs - 0.35, K: [[0, [0.2, 2.1, 5.4, 0, 0.75, 0.2, 50]], [1.6, [0.0, 2.0, 5.0, 0, 0.7, 0.3, 50]]] },
  { at: T.s3, K: [[0, [-0.6, 2.1, 5.8, 0, 1.0, -0.6, 48]], [3.6, [0.2, 1.8, 5.2, 0, 1.0, -0.6, 46]], [8.3, [0.1, 1.8, 5.0, 0, 1.0, -0.6, 46]]] },
  { at: S.s4[0], K: [[0, [0.5, 1.7, 5.4, 0, 0.95, -0.6, 46]], [4.0, [0.2, 1.6, 4.9, 0.0, 0.95, -0.6, 46]]] },
  { at: S.s5[0], K: [[0, [0.1, 2.0, 5.6, 0, 0.75, 0.0, 48]], [2.6, [-0.1, 1.9, 5.2, 0, 0.7, 0.1, 48]]] },
  { at: T.code - 0.2, K: [[0, [0.2, 1.6, 4.8, 0, 0.9, -0.6, 46]], [2.0, [0.1, 1.6, 4.6, 0, 0.9, -0.6, 46]]] },
  { at: S.s6[0], K: [[0, [0, 2.2, 5.6, 0, 1.1, -0.6, 50]], [1.2, [0, 2.6, 6.8, 0, 1.45, -0.8, 50]], [3.7, [0.3, 2.7, 7.0, 0, 1.5, -0.8, 50]]] },
  { at: T.s7, calm: 1, K: [[0, [0.3, 2.7, 7.0, 0, 1.5, -0.8, 50]], [4, [0.5, 3.0, 7.8, 0, 1.6, -1.0, 50]]] },
];

const pop = (o, a, s = 1) => { o.visible = a > 0.01; o.scale.setScalar(s * Math.max(0.001, a)); };
const onOff = (t, a, b) => sm(a - 0.05, a + 0.2, t) * (1 - sm(b - 0.15, b, t));

run("caveman-world", (t) => {
  const wrong = t < T.s3;
  WORLD.visible = t < T.s8 - 0.1;
  accent.material.color.set(wrong ? (t >= T.essay ? RED : VIOLET) : GREEN).multiplyScalar(1.6);
  mScreen.color.set(wrong ? 0x0b0a26 : 0x0a1a1a);

  // s1: question, then the essay types out line by line; s2: greeting and recap light up
  pop(ask, onOff(t, S.s1[0] + 0.15, T.s3));
  pop(greet, onOff(t, T.essay - 0.1, T.s3), 1 + 0.12 * Math.max(0, 1 - Math.abs(t - T.greet - 0.15) / 0.3));
  LINES.forEach((m, i) => { const k = onOff(t, T.essay + 0.12 * (i + 1), T.s3); m.visible = k > 0.01; m.scale.set(k, 1, 1); });
  pop(recap, onOff(t, T.essay + 0.9, T.s3), 1 + 0.12 * Math.max(0, 1 - Math.abs(t - T.recap - 0.15) / 0.3));

  // s2: red token coins pour off the screen onto the desk
  pile.forEach((c, i) => {
    const t0 = T.costs - 0.2 + 0.07 * i, k = sm(t0, t0 + 0.45, t);
    c.visible = t >= t0 && t < T.s3;
    const x = -0.7 + ((i * 53) % 14) / 10, z = 1.05 + ((i * 29) % 5) / 12, yEnd = 0.04 + 0.05 * Math.floor(i / 5);
    c.position.set(x * 0.9, 1.2 + (yEnd - 1.2) * k * k, -0.4 + (z + 0.4) * k);
    c.rotation.set(1.2 * (1 - k) + 0.1 * ((i % 3) - 1), i, 0.4 * (1 - k));
  });

  // s3: the rock, then the star; then say less (answer bubble shrinks) and read less (sheet shrinks)
  const rk = sm(T.cave - 0.1, T.cave + 0.25, t) * (1 - sm(T.almost - 0.2, T.almost, t));
  pop(rock, rk, 1 + 0.06 * Math.sin(t * 5)); rock.rotation.y = 0.4 * Math.sin((t - T.cave) * 2);
  const sk = sm(T.almost - 0.1, T.almost + 0.25, t) * (1 - sm(T.it - 0.15, T.it + 0.1, t));
  star.visible = sk > 0.01; star.scale.setScalar(0.52 * sk * (1 + 0.08 * Math.sin(t * 6)));
  star.position.set(0, 1.85, -0.3); star.rotation.y = 0.35 * Math.sin((t - T.almost) * 2.5);
  // say less: a long green answer bubble squeezes to a short one
  const sayA = onOff(t, T.it, S.s4[0]);
  ans1.visible = (sayA > 0.01) || t >= T.ans;
  if (t < S.s4[0]) { ans1.scale.set(sayA * (1 - 0.55 * sm(T.say, T.say + 0.4, t)), sayA, 1); ans1.position.x = 0; }
  // read less: the LOGS sheet squashes
  const rdA = onOff(t, T.read - 0.1, S.s4[0]);
  if (t < S.s4[0]) { logs.visible = rdA > 0.01; logs.scale.set(0.6 * rdA, 0.6 * rdA * (1 - 0.45 * sm(T.read, T.read + 0.4, t)), 1); logs.position.set(0, 0.45, 0.07); }
  else if (t < S.s6[0]) logs.visible = false;

  // s4: install command, then the answer comes first, one idea per bubble
  pop(cmd, onOff(t, T.cmd - 0.1, S.s5[0]));
  if (t >= S.s4[0]) pop(ans1, onOff(t, T.ans - 0.05, T.s7 - 0.1));
  pop(ans2, onOff(t, T.idea - 0.15, T.s7 - 0.1));
  // s5: two coin stacks, 63 red vs 20 green; then the useMemo chip glows (code stays exact)
  const s5on = t >= T.n63 - 0.2 && t < T.code - 0.2;
  stackR.forEach((c, i) => {
    const t0 = T.n63 - 0.15 + 0.04 * i, k = sm(t0, t0 + 0.25, t);
    c.visible = s5on && k > 0.01; c.position.set(-0.65, 0.04 + 0.052 * i + 0.6 * (1 - k), 1.05); c.rotation.set(0, 0, 0); c.scale.setScalar(1);
  });
  stackG.forEach((c, i) => {
    const t0 = T.n20 - 0.15 + 0.06 * i, k = sm(t0, t0 + 0.25, t);
    c.visible = s5on && k > 0.01; c.position.set(0.65, 0.04 + 0.052 * i + 0.6 * (1 - k), 1.05); c.scale.setScalar(1);
  });
  const l63 = s5on ? sm(T.n63, T.n63 + 0.3, t) : 0, l20 = s5on ? sm(T.n20, T.n20 + 0.3, t) : 0;
  n63.visible = l63 > 0.01; n63.position.set(-0.65, 0.95, 1.05); n63.scale.setScalar(l63);
  n20.visible = l20 > 0.01; n20.position.set(0.65, 0.42, 1.05); n20.scale.setScalar(l20);
  pop(chip, onOff(t, T.code - 0.1, S.s6[0]), 1 + 0.1 * Math.sin(t * 7));
  if (chip.visible) { cmd.visible = false; }

  // s6: logs + tests sheets appear, squash, and the meter loses its last third
  if (t >= S.s6[0]) {
    ans1.visible = ans2.visible = false;
    const lk = onOff(t, T.logs - 0.1, T.s7), tk = onOff(t, T.tests - 0.1, T.s7), sq = 1 - 0.33 * sm(T.shrink + 1.0, T.shrink + 1.4, t);
    logs.visible = lk > 0.01; logs.position.set(-0.55, 0.75 - 0.5 * (1 - sq), 0.07); logs.scale.set(lk, lk * sq, 1);
    tests.visible = tk > 0.01; tests.position.set(0.55, 0.75 - 0.5 * (1 - sq), 0.07); tests.scale.set(tk, tk * sq, 1);
  } else tests.visible = false;
  const mk = onOff(t, T.reads - 0.15, T.s7);
  pop(meter, mk);
  const off = sm(T.third, T.third + 0.35, t);
  segs[2].scale.setScalar(Math.max(0.001, 1 - off)); segs[2].visible = off < 0.99;

  const { punch } = shoot(SH, t);
  const spike = overlays(t);
  bloom.strength = Math.min(1.45, 1.0 + 1.2 * punch * punch + spike);
});
