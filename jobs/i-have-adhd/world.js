// NEVER LET AI BURY THE ANSWER (i-have-adhd). Laptop on a dark desk; wrong = a red wall of text with the step buried at the bottom,
// right = the skill puts the action first, numbered steps, one next step.
import { THREE, S, g, sm, scene, bloom, glow, tube, VIOLET, ORANGE, RED, GREEN, WHITE, shoot, run } from "./kit.js";
import { title, cap, boom, endCard, overlays, fitText } from "./extra.js";

import { RoundedBoxGeometry } from "three/addons/geometries/RoundedBoxGeometry.js";
const root = new THREE.Group(); scene.add(root);
const std = (c, e, r = 0.45, m = 0.25) => new THREE.MeshStandardMaterial({ color: c, emissive: e, roughness: r, metalness: m });
const rbox = (w, h, d, r, mat) => new THREE.Mesh(new RoundedBoxGeometry(w, h, d, 4, r), mat);
const mBody = std(0x4a42c8, 0x1c1766, 0.35, 0.35), mDark = std(0x14123a, 0x07061a, 0.6, 0.2);
const mLine = std(0xd8c4e8, 0x5a2a5a, 0.5, 0.1), mRedB = std(0xff4a5a, 0x8a1020, 0.4, 0.1), mGreenB = std(0x2fcf7a, 0x0f6a3a, 0.4, 0.1);
const mVioB = std(0x7b6cff, 0x2c2390, 0.4, 0.1);
const txt = (s, hex, w) => { const t = fitText([s], hex, 1.0, w); t.visible = true; return t; };

// ---------- desk + room lights ----------
const desk = rbox(9, 0.3, 5, 0.12, std(0x221d66, 0x0c0a30, 0.7, 0.1)); desk.position.set(0, -0.14, -0.6); root.add(desk);
const pl = new THREE.PointLight(0xe8e2ff, 18, 9, 1.6); pl.position.set(-1.6, 3.2, 2.2); root.add(pl);
const rim = new THREE.PointLight(0xff8a3a, 10, 8, 1.6); rim.position.set(2.6, 2.2, -2.4); root.add(rim);

// ---------- laptop at the origin, screen faces +z ----------
const base = rbox(2.6, 0.1, 1.7, 0.04, mBody); base.position.set(0, 0.05, 0); root.add(base);
const keys = rbox(2.2, 0.02, 0.8, 0.01, mDark); keys.position.set(0, 0.105, -0.2); root.add(keys);
const pad = rbox(0.8, 0.02, 0.45, 0.01, mDark); pad.position.set(0, 0.105, 0.5); root.add(pad);
const lid = new THREE.Group(); lid.position.set(0, 0.1, -0.85); lid.rotation.x = -0.12; root.add(lid);
const screen = rbox(2.6, 1.7, 0.06, 0.04, mBody); screen.position.set(0, 0.85, 0); lid.add(screen);
const mScreen = new THREE.MeshBasicMaterial({ color: 0x0b0a26, toneMapped: false });
const face = new THREE.Mesh(new THREE.PlaneGeometry(2.4, 1.5), mScreen); face.position.set(0, 0.85, 0.035); lid.add(face);
const bar = new THREE.Mesh(new THREE.PlaneGeometry(2.4, 0.12), glow(VIOLET, 0.35)); bar.position.set(0, 1.54, 0.037); lid.add(bar);
const accent = new THREE.Mesh(new THREE.PlaneGeometry(2.4, 0.015), glow(VIOLET, 1.6)); accent.position.set(0, 1.475, 0.038); lid.add(accent);
[-1.08, -0.98, -0.88].forEach((x, i) => { const d = new THREE.Mesh(new THREE.CircleGeometry(0.025, 16), glow([RED, ORANGE, GREEN][i], 1.2)); d.position.set(x, 1.54, 0.039); lid.add(d); });
const onScr = (m, x, y, z = 0.07) => { m.position.set(x, y, z); lid.add(m); m.visible = false; return m; }; // lid-local placement

// ---------- s1: the user's question bubble ----------
const qb = new THREE.Group(); qb.add(rbox(1.7, 0.4, 0.05, 0.12, mVioB)); const qt = txt("HOW DO I FIX THIS?", WHITE, 1.5); qt.position.z = 0.03; qb.add(qt);
onScr(qb, 0.25, 1.15);

// ---------- s1-s2: the wall of text, growing up out of the screen ----------
const wall = new THREE.Group(); lid.add(wall); wall.position.z = 0.08;
const wBack = rbox(2.3, 3.1, 0.03, 0.06, mDark); wall.add(wBack);
const wEdge = new THREE.Mesh(new THREE.PlaneGeometry(2.38, 3.18), glow(RED, 0.9)); wEdge.position.z = -0.02; wall.add(wEdge);
const NL = 19, lines = [];
for (let i = 0; i < NL; i++) {
  const w = i ? 1.3 + 0.6 * (((i * 37) % 10) / 10) : 1.3;
  const l = rbox(w, 0.075, 0.02, 0.03, i ? mLine : mLine.clone()); l.position.set(-1.0 + w / 2, 0.25 + i * 0.155, 0.03); wall.add(l); lines.push(l);
}
const stepTag = txt("THE STEP", GREEN, 0.7); stepTag.position.set(0.68, 0.25, 0.06); wall.add(stepTag);
// "Great question!" bubble on top of the wall (red, three dots: the caption carries the words)
const gq = new THREE.Group(); gq.add(rbox(1.0, 0.36, 0.05, 0.1, mRedB));
[-0.22, 0, 0.22].forEach((x) => { const d = new THREE.Mesh(new THREE.SphereGeometry(0.05, 12, 8), glow(WHITE, 1.2)); d.position.set(x, 0, 0.04); gq.add(d); });
onScr(gq, -0.45, 2.95, 0.16);
// side notes: red bubbles branching off the wall, left and right
const notes = [[1, 2.55], [-1, 2.0], [1, 1.45], [-1, 0.95]].map(([s, y]) => {
  const n = new THREE.Group(); n.add(rbox(0.42, 0.28, 0.05, 0.08, mRedB));
  [-0.1, 0, 0.1].forEach((x) => { const d = new THREE.Mesh(new THREE.SphereGeometry(0.03, 10, 6), glow(WHITE, 1.1)); d.position.set(x, 0, 0.04); n.add(d); });
  const link = tube([-s * 0.21, 0, 0], [-s * 0.38, -0.12, 0], 0.025, glow(RED, 2.0)); n.add(link);
  onScr(n, s * 1.5, y, 0.12); return n;
});

// ---------- s3: the skill card + GitHub star ----------
const card = new THREE.Group(); card.add(rbox(1.8, 0.55, 0.08, 0.1, mGreenB)); const ct = txt("i-have-adhd", WHITE, 1.6); ct.position.z = 0.05; card.add(ct);
onScr(card, 0, 0.85, 0.12);
const starShape = new THREE.Shape();
for (let i = 0; i < 10; i++) { const a = Math.PI / 2 + (i * Math.PI) / 5, r = i % 2 ? 0.17 : 0.4; starShape[i ? "lineTo" : "moveTo"](Math.cos(a) * r, Math.sin(a) * r); }
const star = new THREE.Mesh(new THREE.ExtrudeGeometry(starShape, { depth: 0.08, bevelEnabled: true, bevelSize: 0.03, bevelThickness: 0.03, bevelSegments: 2 }), glow(ORANGE, 1.5));
root.add(star);

// ---------- s3-s4: the answer first, then numbered steps ----------
function row(text, mat, w, h = 0.26) { const r = new THREE.Group(); r.add(rbox(w, h, 0.05, 0.07, mat)); const t = txt(text, WHITE, Math.min(w * 0.8, 1.4)); t.position.z = 0.04; r.add(t); return r; }
const answer = onScr(row("ANSWER", mGreenB, 2.0), 0, 1.3);
const dims = [1.0, 0.75, 0.5].map((y, i) => onScr(rbox(1.4 - 0.25 * i, 0.06, 0.02, 0.02, mDark), -0.3 + 0.12 * i, y));
const action = onScr(row("ACTION", mGreenB, 2.0), 0, 1.3);
const steps = [1, 2, 3].map((n, i) => {
  const r = new THREE.Group();
  const d = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.12, 0.05, 28), mGreenB); d.rotation.x = Math.PI / 2; r.add(d);
  const nt = txt(String(n), WHITE, 0.5); nt.position.z = 0.04; r.add(nt);
  const b = rbox(1.45 - 0.2 * i, 0.12, 0.03, 0.04, mLine); b.position.set(0.3 + 0.725 - 0.1 * i, 0, 0); r.add(b);
  return onScr(r, -0.95, 0.98 - 0.3 * i);
});

// ---------- s5: list of 5 max, one next step, no closer ----------
const tiles5 = [0, 1, 2, 3, 4, 5].map((i) => {
  const r = new THREE.Group(); r.add(rbox(0.28, 0.28, 0.05, 0.06, i < 5 ? mVioB : mRedB));
  const t = txt(String(i + 1), WHITE, 0.4); t.position.z = 0.04; r.add(t);
  if (i === 5) [1, -1].forEach((s) => r.add(tube([-0.17, -0.17 * s, 0.05], [0.17, 0.17 * s, 0.05], 0.025, glow(RED, 2.4))));
  return onScr(r, -0.85 + 0.34 * i, 1.28);
});
const next = onScr(row("NEXT STEP", mGreenB, 1.9), -0.1, 0.83);
const arrow = new THREE.Mesh(new THREE.ConeGeometry(0.1, 0.22, 3), glow(GREEN, 1.6)); arrow.rotation.z = -Math.PI / 2; arrow.position.set(1.0, 0, 0.03); next.add(arrow);
const hope = onScr(row("HOPE THIS HELPS!", mRedB, 1.6, 0.24), 0, 0.42);
const hopeX = [1, -1].map((s) => { const x = tube([-0.85, -0.18 * s, 0.06], [0.85, 0.18 * s, 0.06], 0.03, glow(RED, 2.6)); hope.add(x); return x; });

// ---------- s6: minutes, not "a bit"; 10 rules ----------
const clock = new THREE.Group();
clock.add(new THREE.Mesh(new THREE.TorusGeometry(0.34, 0.035, 10, 48), glow(GREEN, 1.6)));
const dial = new THREE.Mesh(new THREE.CircleGeometry(0.32, 40), mDark); dial.position.z = -0.01; clock.add(dial);
const hMin = tube([0, 0, 0.02], [0, 0.26, 0.02], 0.025, glow(WHITE, 1.3)); clock.add(hMin);
const hHr = tube([0, 0, 0.02], [0.16, 0, 0.02], 0.03, glow(WHITE, 1.3)); clock.add(hHr);
onScr(clock, -0.6, 0.9);
const min5 = onScr(txt("5 MIN", GREEN, 1.1), 0.5, 1.12);
const aBit = onScr(txt("A BIT?", RED, 1.0), 0.5, 0.62);
const strike = onScr(tube([-0.38, 0, 0], [0.38, 0, 0], 0.025, glow(RED, 2.6)), 0.5, 0.62, 0.1);
const rules = Array.from({ length: 10 }, (_, i) => {
  const r = new THREE.Group(); r.add(rbox(0.36, 0.36, 0.05, 0.07, mGreenB));
  const t = txt(String(i + 1), WHITE, 0.45); t.position.z = 0.04; r.add(t);
  return onScr(r, -0.88 + 0.44 * (i % 5), i < 5 ? 1.15 : 0.65);
});

// ---------- captions ----------
title("NEVER LET AI BURY THE ANSWER");
cap("s1", "wall", ["WALL OF TEXT"], RED, { until: ["s1", "exploring"] });
cap("s1", "exploring", ["EXPLORING GITHUB REPOS"], WHITE, { until: "s1" });
cap("s2", "great", ["\"GREAT QUESTION!\""], RED, { until: ["s2", "wanders"] });
cap("s2", "wanders", ["SIDE NOTES"], RED, { until: ["s2", "hides"] });
cap("s2", "hides", ["THE STEP YOU NEED?", "AT THE BOTTOM"], RED, { boom: 0.5 });
cap("s3", "have", ["I HAVE ADHD"], GREEN, { until: ["s3", "over"], boom: 0.5 });
cap("s3", "over", ["OVER 61,000 STARS", "IN 6 MONTHS"], ORANGE, { until: ["s3", "it's"], boom: 0.5 });
cap("s3", "it's", ["FREE ON GITHUB"], GREEN, { until: ["s3", "put"] });
cap("s3", "put", ["ANSWER FIRST"], GREEN);
cap("s4", "next", ["ACTION FIRST"], GREEN, { until: ["s4", "then"], boom: 0.4 });
cap("s4", "then", ["NUMBERED STEPS"], VIOLET);
cap("s5", "lists", ["5 ITEMS, MAX"], GREEN, { until: ["s5", "ends"], boom: 0.4 });
cap("s5", "ends", ["ONE NEXT STEP"], GREEN, { until: ["s5", "no"] });
cap("s5", "no", ["NO CLOSERS"], GREEN);
cap("s6", "times", ["MINUTES, NOT \"A BIT\""], GREEN, { until: ["s6", "10"] });
cap("s6", "10", ["10 RULES"], GREEN, { until: ["s6", "you"], boom: 0.4 });
cap("s6", "you", ["NO DIAGNOSIS NEEDED"], GREEN);
endCard(["DON'T DIG FOR IT.", "GET THE ANSWER FIRST."]);
boom("s1", "wall", 0.5);

// ---------- timings (global seconds) ----------
const T = {
  q: S.s1[0] + 0.1, dig: g("s1", "dig"), ans1: g("s1", "answer"), s2: S.s2[0], great: g("s2", "great"), wand: g("s2", "wanders"), hides: g("s2", "hides"),
  s3: S.s3[0], over: g("s3", "over"), its: g("s3", "it's"), makes: g("s3", "makes"), put: g("s3", "put"),
  s4: S.s4[0], steps: g("s4", "steps"), numb: g("s4", "numbered"), one: g("s4", "one"),
  s5: S.s5[0], items: g("s5", "items"), ends: g("s5", "ends"), no: g("s5", "no"), hope: g("s5", "hope"),
  s6: S.s6[0], not: g("s6", "not"), ten: g("s6", "10"), s7: S.s7[0], s8: S.s8[0],
};

// ---------- shots: [cx,cy,cz, lx,ly,lz, fov] ----------
const WIDE = [0.2, 2.1, 6.8, 0, 1.85, -0.9, 50];
const SH = [
  { at: 0, K: [[0, [0.3, 1.8, 5.6, 0, 0.9, -0.5, 48]], [2, [0.1, 1.8, 5.2, 0, 0.95, -0.6, 48]]] },
  { at: T.dig - 0.05, K: [[0, [0.4, 1.6, 5.6, 0, 1.3, -0.8, 50]], [1.0, WIDE], [5, [-0.2, 2.2, 7.0, 0, 1.85, -0.9, 50]]] },
  { at: T.s3, K: [[0, [-0.6, 2.1, 5.8, 0, 1.0, -0.6, 48]], [3.6, [0.2, 1.8, 5.2, 0, 1.0, -0.6, 46]], [9.3, [0.4, 1.7, 5.0, 0, 0.95, -0.6, 46]]] },
  { at: T.s4, K: [[0, [0.5, 1.7, 5.3, 0, 0.95, -0.6, 46]], [3.2, [0.2, 1.6, 5.0, 0.05, 0.95, -0.6, 46]]] },
  { at: T.s5, K: [[0, [-0.5, 1.7, 5.3, 0, 0.95, -0.6, 46]], [4.0, [-0.2, 1.7, 5.1, -0.05, 0.95, -0.6, 46]]] },
  { at: T.s6, K: [[0, [0.4, 1.7, 5.3, 0, 0.95, -0.6, 46]], [4.2, [0.1, 1.9, 5.6, 0, 0.95, -0.6, 46]]] },
  { at: T.s7, calm: 1, K: [[0, [0.3, 2.6, 7.8, 0, 1.3, -1.2, 50]], [4, [0.5, 2.8, 8.4, 0, 1.3, -1.2, 50]]] },
];

const pop = (m, a, b, t, s = 1) => { const k = sm(a, a + 0.25, t) * (1 - sm(b - 0.15, b, t)); m.visible = k > 0.01; m.scale.setScalar(s * Math.max(k, 0.001)); return k; };

run("adhd-world", (t) => {
  root.visible = t < T.s8 - 0.12; // hide the scene before the CTA fades in
  const wrong = t < T.s3;
  accent.material.color.set(wrong ? (t >= T.dig ? RED : VIOLET) : GREEN).multiplyScalar(1.6);
  mScreen.color.set(wrong ? 0x0b0a26 : 0x0a1a1a);

  // s1: question bubble, then the wall grows up out of the screen
  pop(qb, T.q, T.dig + 0.2, t);
  const wk = sm(T.dig - 0.05, T.ans1 + 0.2, t);
  wall.visible = wrong && wk > 0.01;
  wBack.scale.y = Math.max(wk, 0.01); wEdge.scale.y = Math.max(wk, 0.01);
  wBack.position.y = wEdge.position.y = 0.1 + 1.55 * wk;
  lines.forEach((l, i) => { l.visible = 0.25 + i * 0.155 < 0.12 + 3.1 * wk; });
  // s2: the step at the bottom lights up green on "hides"
  const hk = sm(T.hides, T.hides + 0.3, t);
  lines[0].material.color.set(hk > 0 ? new THREE.Color(0xd8c4e8).lerp(new THREE.Color(0x2fcf7a), hk) : 0xd8c4e8);
  lines[0].material.emissive.set(new THREE.Color(0x5a2a5a).lerp(new THREE.Color(0x0f8a4a), hk));
  stepTag.visible = hk > 0.05; stepTag.material.opacity = hk;
  pop(gq, T.great - 0.05, T.s3, t);
  gq.rotation.z = 0.06 * Math.sin(t * 8);
  notes.forEach((n, i) => { pop(n, T.wand + 0.15 * i, T.s3, t); n.position.y += 0; });

  // s3: the skill card drops in on "Instead", the star rides above it on the count
  const ck = sm(T.s3, T.s3 + 0.35, t) * (1 - sm(T.makes - 0.1, T.makes + 0.15, t));
  card.visible = ck > 0.01; card.position.y = 0.85 + 1.2 * (1 - sm(T.s3, T.s3 + 0.35, t)); card.scale.setScalar(Math.max(ck, 0.001));
  const sk = sm(T.over - 0.1, T.over + 0.25, t) * (1 - sm(T.its - 0.15, T.its + 0.1, t));
  star.visible = sk > 0.01; star.scale.setScalar(0.48 * sk * (1 + 0.08 * Math.sin(t * 6)));
  star.position.set(0, 1.9, -0.3); star.rotation.y = 0.35 * Math.sin((t - T.over) * 2.5);
  pop(answer, T.makes, T.s4, t);
  dims.forEach((d, i) => pop(d, T.makes + 0.1 + 0.08 * i, T.s4, t));

  // s4: ACTION on top, then steps 1-2-3
  pop(action, T.s4, T.s5, t);
  [T.steps, T.numb, T.one].forEach((a, i) => pop(steps[i], a - 0.05, T.s5, t));

  // s5: 5 tiles + a crossed sixth, the next step, the closer crossed out
  tiles5.forEach((m, i) => pop(m, T.s5 + 0.08 * i, i < 5 ? T.s6 : T.ends, t));
  pop(next, T.ends - 0.05, T.s6, t);
  pop(hope, T.no - 0.1, T.s6, t);
  hopeX.forEach((x) => (x.visible = t >= T.hope));

  // s6: clock (minute hand ticking), then the 10 rules
  pop(clock, T.s6, T.ten, t); hMin.rotation.z = -(t - T.s6) * 2.2;
  pop(min5, T.s6 + 0.05, T.ten, t); pop(aBit, T.s6 + 0.3, T.ten, t); pop(strike, T.not, T.ten, t);
  rules.forEach((m, i) => pop(m, T.ten - 0.05 + 0.04 * i, T.s7, t));

  const { punch } = shoot(SH, t);
  const spike = overlays(t);
  bloom.strength = Math.min(1.45, 1.0 + 1.2 * punch * punch + spike);
});
