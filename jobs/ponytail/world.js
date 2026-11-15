// NEVER LET AI BLOAT YOUR CODE (Ponytail). Laptop on a dark desk; wrong = a date picker request turns into a library box,
// a hand-built calendar and 335 red lines; right = the lazy senior dev checks what's there, joins <Input> + the browser's date picker: 10 lines.
import { THREE, S, g, sm, scene, bloom, glow, VIOLET, ORANGE, RED, GREEN, WHITE, shoot, run } from "./kit.js";
import { title, cap, boom, endCard, overlays, fitText } from "./extra.js";

import { RoundedBoxGeometry } from "three/addons/geometries/RoundedBoxGeometry.js";
const root = new THREE.Group(); scene.add(root);
const std = (c, e, r = 0.45, m = 0.25) => new THREE.MeshStandardMaterial({ color: c, emissive: e, roughness: r, metalness: m });
const rbox = (w, h, d, r, mat) => new THREE.Mesh(new RoundedBoxGeometry(w, h, d, 4, r), mat);
const mBody = std(0x4a42c8, 0x1c1766, 0.35, 0.35), mDark = std(0x14123a, 0x07061a, 0.6, 0.2), mLav = std(0xc9c0ff, 0x4a3fb0, 0.4, 0.1);
// depth-tested text (fitText draws on top of everything; props here overlap each other)
const wt = (lines, hex, k, w) => { const m = fitText(lines, hex, k, w); m.material.depthTest = true; m.renderOrder = 1; m.visible = true; return m; };
const plane = (w, h, mat, x, y, z, parent) => { const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), mat); m.position.set(x, y, z); parent.add(m); return m; };
const show = (o, k, s = 1) => { o.visible = k > 0.01; o.scale.setScalar(Math.max(1e-3, s * k)); };
const grp = (parent, x = 0, y = 0, z = 0) => { const gp = new THREE.Group(); gp.position.set(x, y, z); parent.add(gp); return gp; };

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
plane(2.4, 1.5, mScreen, 0, 0.85, 0.035, lid);
plane(2.4, 0.12, glow(VIOLET, 0.35), 0, 1.54, 0.037, lid);
const accent = plane(2.4, 0.015, glow(VIOLET, 1.6), 0, 1.475, 0.038, lid);
[-1.08, -0.98, -0.88].forEach((x, i) => { const d = new THREE.Mesh(new THREE.CircleGeometry(0.025, 16), glow([RED, ORANGE, GREEN][i], 1.2)); d.position.set(x, 1.54, 0.039); lid.add(d); });

// ---------- s1: the request bubble + red code rows filling the screen ----------
const ask = grp(lid, 0, 1.24, 0.05);
ask.add(rbox(1.7, 0.26, 0.03, 0.08, std(0x5a4fe0, 0x2a2290, 0.4, 0.1)));
const askT = wt(["ADD A DATE PICKER"], WHITE, 1.0, 1.5); askT.position.z = 0.02; ask.add(askT);
const ROWS = 14, rows = Array.from({ length: ROWS }, (_, i) => {
  const w = 0.5 + ((i * 37) % 11) / 11 * 1.3, ind = ((i * 5) % 4) * 0.12;
  const r = plane(w, 0.045, glow(RED, 1.0), -1.08 + ind + w / 2, 1.06 - i * 0.068, 0.045, lid); r.visible = false; return r;
});
const COUNTS = ["40", "120", "210", "290", "335"], counters = COUNTS.map((n) => { const m = wt([n], RED, 1.6, 0.9); m.position.set(0.68, 0.55, 0.07); m.visible = false; lid.add(m); return m; });
const linesT = wt(["LINES"], RED, 1.3, 0.5); linesT.position.set(0.68, 0.33, 0.07); lid.add(linesT);

// ---------- s2: a red library box, then a hand-built calendar ----------
const lib = grp(lid, 0, 0.8, 0.35);
const mBox = std(0xb0303a, 0x3a0810, 0.6, 0.1);
lib.add(rbox(0.9, 0.7, 0.6, 0.05, mBox));
plane(0.92, 0.1, glow(RED, 1.4), 0, 0.2, 0.31, lib); // tape
const libT = wt(["LIBRARY"], WHITE, 1.0, 0.75); libT.position.set(0, -0.08, 0.31); lib.add(libT);
const cal = grp(lid, 0, 0.82, 0.06);
const calHead = plane(1.5, 0.2, glow(RED, 1.0), 0, 0.5, 0, cal);
const calT = wt(["CALENDAR"], WHITE, 1.0, 0.8); calT.position.set(0, 0.5, 0.005); cal.add(calT);
const cells = Array.from({ length: 35 }, (_, i) => {
  const c = plane(0.17, 0.13, glow(RED, i === 17 ? 1.6 : 0.55), -0.63 + (i % 7) * 0.21, 0.3 - Math.floor(i / 7) * 0.16, 0, cal);
  c.visible = false; return c;
});
const warn = grp(lid, 0.68, 1.0, 0.12);
const tri = new THREE.Mesh(new THREE.CircleGeometry(0.2, 3), glow(RED, 1.6)); tri.rotation.z = Math.PI / 2; warn.add(tri);
const bang = wt(["!"], WHITE, 1.0, 0.3); bang.position.set(0, -0.03, 0.01); bang.scale.setScalar(0.8); warn.add(bang);

// ---------- s3: Ponytail avatar (oval glasses, hair pulled back into a ponytail) ----------
function avatarTex() {
  const c = document.createElement("canvas"); c.width = 512; c.height = 512; const x = c.getContext("2d");
  x.fillStyle = "#3d2bd6"; x.beginPath(); x.roundRect(16, 16, 480, 480, 110); x.fill();
  x.fillStyle = "#2a2440"; x.beginPath(); x.moveTo(330, 170); x.quadraticCurveTo(470, 230, 420, 430); x.quadraticCurveTo(380, 300, 320, 250); x.fill(); // ponytail
  x.fillStyle = "#7a5cff"; x.beginPath(); x.moveTo(120, 496); x.quadraticCurveTo(256, 330, 392, 496); x.fill(); // shoulders
  x.fillStyle = "#f0c09a"; x.beginPath(); x.ellipse(256, 250, 105, 125, 0, 0, 7); x.fill(); // face
  x.fillStyle = "#2a2440"; x.beginPath(); x.ellipse(256, 175, 112, 72, 0, Math.PI, 0); x.fill(); // hair slicked back
  x.fillRect(330, 225, 28, 22); x.beginPath(); x.arc(344, 236, 16, 0, 7); x.fill(); // hair tie knot
  x.strokeStyle = "#111"; x.lineWidth = 9; [205, 307].forEach((cx) => { x.beginPath(); x.ellipse(cx, 255, 40, 28, 0, 0, 7); x.stroke(); });
  x.beginPath(); x.moveTo(245, 255); x.lineTo(267, 255); x.stroke();
  x.fillStyle = "#111"; [205, 307].forEach((cx) => { x.beginPath(); x.arc(cx, 257, 7, 0, 7); x.fill(); });
  x.lineWidth = 7; x.strokeStyle = "#8a4a3a"; x.beginPath(); x.moveTo(225, 330); x.lineTo(287, 330); x.stroke(); // flat mouth: says nothing
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t;
}
const avatar = new THREE.Mesh(new THREE.PlaneGeometry(0.82, 0.82), new THREE.MeshBasicMaterial({ map: avatarTex(), transparent: true, toneMapped: false, color: 0xc0c0c0 }));
lid.add(avatar);
const plate = (txt, hex, w = 0.9, h = 0.52) => { const gp = new THREE.Group(); gp.add(rbox(w, h, 0.05, 0.06, mDark)); plane(w + 0.03, h + 0.03, glow(hex, 0.9), 0, 0, -0.03, gp); const t = wt([txt], hex, 1.4, w * 0.9); t.position.z = 0.03; gp.add(t); lid.add(gp); gp.visible = false; return gp; };
const zero = plate("$0", GREEN, 1.1, 0.62);

// ---------- s4: project files, a magnifier, the Input tile, a browser with its date picker ----------
const FILES = ["APP", "INPUT", "BUTTON", "FORM", "API", "UTILS"];
const proj = grp(lid, 0, 0.84, 0.06);
const tiles = FILES.map((n, i) => {
  const gp = grp(proj, -0.7 + (i % 3) * 0.7, 0.22 - Math.floor(i / 3) * 0.48, 0);
  const b = rbox(0.6, 0.38, 0.04, 0.05, mBody); gp.add(b);
  const bar = plane(0.5, 0.03, glow(VIOLET, 1.2), 0, -0.13, 0.025, gp);
  const t = wt([n], WHITE, 1.0, 0.5); t.position.z = 0.03; gp.add(t);
  gp.userData.bar = bar; return gp;
});
const inputTile = tiles[1];
const mag = grp(lid, 0, 0, 0.2);
mag.add(new THREE.Mesh(new THREE.TorusGeometry(0.16, 0.035, 10, 32), glow(WHITE, 0.5)));
const lens = new THREE.Mesh(new THREE.CircleGeometry(0.15, 32), new THREE.MeshBasicMaterial({ color: 0x9a8cff, transparent: true, opacity: 0.18, toneMapped: false, depthWrite: false })); mag.add(lens);
const handle = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.035, 0.26, 10), glow(WHITE, 0.5)); handle.position.set(0.19, -0.19, 0); handle.rotation.z = Math.PI / 4; mag.add(handle);
const browser = grp(lid, 0.55, 0.8, 0.08);
browser.add(rbox(0.95, 0.85, 0.04, 0.05, mDark));
plane(0.95, 0.14, glow(VIOLET, 0.5), 0, 0.355, 0.025, browser);
[-0.4, -0.33, -0.26].forEach((x) => { const d = new THREE.Mesh(new THREE.CircleGeometry(0.02, 12), glow(WHITE, 0.9)); d.position.set(x, 0.355, 0.03); browser.add(d); });
plane(0.55, 0.06, glow(WHITE, 0.25), 0.12, 0.355, 0.03, browser);
const picker = grp(browser, 0, -0.08, 0.03);
plane(0.7, 0.1, glow(GREEN, 1.0), 0, 0.2, 0, picker);
for (let i = 0; i < 21; i++) plane(0.08, 0.06, glow(GREEN, i === 9 ? 1.8 : 0.45), -0.27 + (i % 7) * 0.09, 0.08 - Math.floor(i / 7) * 0.09, 0, picker);
const browserT = wt(["BROWSER"], WHITE, 1.0, 0.55); browserT.position.set(0, -0.36, 0.03); browser.add(browserT);

// ---------- s5: one green file, 10 lines ----------
const card = grp(lid, 0, 0.82, 0.1);
card.add(rbox(1.5, 1.08, 0.04, 0.06, std(0x14403a, 0x08261f, 0.5, 0.1)));
plane(1.53, 1.11, glow(GREEN, 0.8), 0, 0, -0.03, card);
const codeT = wt(['<Input type="date" />'], GREEN, 1.1, 1.3); codeT.position.set(0, 0.34, 0.03); card.add(codeT);
const tenRows = Array.from({ length: 10 }, (_, i) => {
  const w = 0.4 + ((i * 3) % 5) * 0.14;
  const r = plane(w, 0.032, glow(GREEN, 0.9), -0.6 + ((i % 3) ? 0.08 : 0) + w / 2, 0.18 - i * 0.065, 0.03, card); r.visible = false; return r;
});

// ---------- s6: 53% less code bars, a shield, a 98% test ring ----------
const chart = grp(lid, 0, 0.25, 0.08);
const barR = plane(0.45, 1, glow(RED, 0.9), -0.4, 0.5, 0, chart), barG = plane(0.45, 1, glow(GREEN, 1.0), 0.4, 0.5, 0, chart);
const lblR = wt(["WITHOUT"], RED, 1.2, 0.55); lblR.position.set(-0.4, 1.12, 0.01); chart.add(lblR);
const lblG = wt(["WITH"], GREEN, 1.0, 0.5); lblG.position.set(0.4, 0.62, 0.01); chart.add(lblG);
const shield = grp(lid, -0.5, 0.82, 0.2);
const shShape = new THREE.Shape(); shShape.moveTo(0, 0.34); shShape.quadraticCurveTo(0.17, 0.3, 0.27, 0.24); shShape.lineTo(0.25, -0.02); shShape.quadraticCurveTo(0.2, -0.24, 0, -0.36); shShape.quadraticCurveTo(-0.2, -0.24, -0.25, -0.02); shShape.lineTo(-0.27, 0.24); shShape.quadraticCurveTo(-0.17, 0.3, 0, 0.34);
shield.add(new THREE.Mesh(new THREE.ExtrudeGeometry(shShape, { depth: 0.06, bevelEnabled: true, bevelSize: 0.02, bevelThickness: 0.02, bevelSegments: 2 }), glow(GREEN, 1.1)));
const lockT = wt(["SAFE"], 0x0a3020, 1.0, 0.45); lockT.material.color.set(0x062a18); lockT.position.set(0, 0, 0.1); shield.add(lockT);
const ring98 = grp(lid, 0.5, 0.82, 0.2);
ring98.add(new THREE.Mesh(new THREE.TorusGeometry(0.3, 0.03, 8, 64), glow(VIOLET, 0.5)));
const arc = new THREE.Mesh(new THREE.TorusGeometry(0.3, 0.05, 8, 64, Math.PI * 2 * 0.98), glow(GREEN, 0.8)); arc.rotation.z = Math.PI / 2; ring98.add(arc);
const t98 = wt(["98%"], WHITE, 1.3, 0.5); t98.position.set(0, 0.04, 0.02); ring98.add(t98);
const tTest = wt(["TESTED"], WHITE, 1.0, 0.36); tTest.position.set(0, -0.12, 0.02); ring98.add(tTest);

// ---------- s3: GitHub star ----------
const starShape = new THREE.Shape();
for (let i = 0; i < 10; i++) { const a = Math.PI / 2 + (i * Math.PI) / 5, r = i % 2 ? 0.17 : 0.4; starShape[i ? "lineTo" : "moveTo"](Math.cos(a) * r, Math.sin(a) * r); }
const star = new THREE.Mesh(new THREE.ExtrudeGeometry(starShape, { depth: 0.08, bevelEnabled: true, bevelSize: 0.03, bevelThickness: 0.03, bevelSegments: 2 }), glow(ORANGE, 1.5));
root.add(star);

// ---------- captions ----------
title("NEVER LET AI BLOAT YOUR CODE");
cap("s1", "exploring", ["EXPLORING GITHUB REPOS"], WHITE, { until: "s1" });
cap("s2", "installs", ["INSTALLS A LIBRARY"], RED, { until: ["s2", "builds"] });
cap("s2", "builds", ["A CALENDAR BY HAND"], RED, { until: ["s2", "335"] });
cap("s2", "335", ["335 LINES"], RED, { until: ["s2", "maintain"], boom: 0.5 });
cap("s2", "maintain", ["ALL YOURS TO MAINTAIN"], RED);
cap("s3", "ponytail", ["PONYTAIL"], GREEN, { until: ["s3", "over"], boom: 0.5 });
cap("s3", "over", ["OVER 190,000 STARS", "IN 5 MONTHS"], ORANGE, { until: ["s3", "free"], boom: 0.5 });
cap("s3", "free", ["IT'S FREE"], GREEN, { until: ["s3", "makes"] });
cap("s3", "makes", ["THE LAZIEST SENIOR DEV"], GREEN);
cap("s4", "checks", ["CHECKS WHAT'S THERE"], VIOLET, { until: ["s4", "input"] });
cap("s4", "input", ["YOUR INPUT BOX"], GREEN, { until: ["s4", "browser"], boom: 0.4 });
cap("s4", "browser", ["THE BROWSER'S DATE PICKER"], GREEN);
cap("s5", "puts", ["PUTS THE TWO TOGETHER"], GREEN, { until: ["s5", "one"] });
cap("s5", "one", ["ONE FILE, 10 LINES"], GREEN, { boom: 0.5 });
cap("s6", "53", ["53% LESS CODE"], GREEN, { until: ["s6", "never"], boom: 0.5 });
cap("s6", "never", ["NEVER CUTS SECURITY"], GREEN, { until: ["s6", "98"] });
cap("s6", "98", ["98% SHIP WITH A TEST"], GREEN, { boom: 0.4 });
endCard(["DON'T BUILD IT.", "REUSE IT."]);
boom("s2", "maintain", 0.5);

// ---------- timings (global seconds) ----------
const T = {
  bloat: g("s1", "bloat"), s2: S.s2[0], installs: g("s2", "installs"), builds: g("s2", "builds"), hand: g("s2", "hand"), n335: g("s2", "335"), maintain: g("s2", "maintain"),
  s3: S.s3[0], over: g("s3", "over"), free: g("s3", "free"), makes: g("s3", "makes"),
  s4: S.s4[0], checks: g("s4", "checks"), your: g("s4", "your"), input: g("s4", "input"), browser: g("s4", "browser"), date: g("s4", "date"),
  s5: S.s5[0], one: g("s5", "one"), n10: g("s5", "10"),
  s6: S.s6[0], n53: g("s6", "53"), never: g("s6", "never"), n98: g("s6", "98"), test: g("s6", "test"),
  s7: S.s7[0], s8: S.s8[0],
};
const v = new THREE.Vector3();

// ---------- shots: [cx,cy,cz, lx,ly,lz, fov] ----------
const SH = [
  { at: 0, K: [[0, [0.3, 1.8, 5.6, 0, 0.9, -0.5, 48]], [S.s2[0], [0.1, 1.7, 5.1, 0, 0.95, -0.6, 48]]] },
  { at: T.s2, K: [[0, [-0.5, 1.6, 5.2, 0, 0.95, -0.6, 46]], [2.8, [0.3, 1.6, 5.0, 0, 0.95, -0.6, 46]]] },
  { at: T.n335 - 0.15, K: [[0, [-0.3, 1.8, 4.8, 0, 1.0, -0.6, 46]], [3, [-0.1, 1.8, 4.6, 0, 1.0, -0.6, 46]]] },
  { at: T.s3, K: [[0, [-0.6, 2.1, 5.8, 0, 1.0, -0.6, 48]], [5.2, [0.2, 1.8, 5.2, 0, 1.0, -0.6, 46]]] },
  { at: T.makes - 0.1, K: [[0, [0.5, 1.7, 5.0, 0, 0.95, -0.6, 46]], [3.2, [0.2, 1.6, 4.8, 0, 0.95, -0.6, 46]]] },
  { at: T.s4, K: [[0, [-0.4, 1.7, 5.2, 0, 0.95, -0.6, 46]], [3, [0.2, 1.7, 5.0, 0, 0.95, -0.6, 46]]] },
  { at: T.browser - 0.15, K: [[0, [0.5, 1.7, 5.0, 0, 0.95, -0.6, 46]], [1.6, [0.3, 1.7, 4.9, 0, 0.95, -0.6, 46]]] },
  { at: T.s5, K: [[0, [0.2, 1.7, 5.0, 0, 0.95, -0.6, 46]], [2.4, [-0.1, 1.7, 4.7, 0, 0.95, -0.6, 46]]] },
  { at: T.s6, K: [[0, [-0.4, 1.7, 5.2, 0, 0.95, -0.6, 46]], [2.1, [0.1, 1.7, 5.0, 0, 0.95, -0.6, 46]]] },
  { at: T.never - 0.1, K: [[0, [0.4, 1.7, 5.0, 0, 0.95, -0.6, 46]], [4.2, [0.1, 1.7, 5.2, 0, 0.95, -0.6, 46]]] },
  { at: T.s7, calm: 1, K: [[0, [0.2, 1.9, 5.8, 0, 0.95, -0.6, 48]], [2, [0.4, 2.0, 6.2, 0, 0.95, -0.6, 48]]] },
];

run("ponytail-world", (t) => {
  root.visible = t < T.s8 - 0.12; // hide the scene before the CTA fades in
  const wrong = t < T.s3, out = sm(T.s3, T.s3 + 0.25, t); // "Instead" clears every red prop fast
  accent.material.color.set(wrong ? (t >= T.bloat ? RED : VIOLET) : GREEN).multiplyScalar(1.6);
  mScreen.color.set(wrong && t >= T.n335 ? 0x1e0612 : wrong ? 0x0b0a26 : 0x0a1a1a);

  // s1: the request, then red code rows pour in from "bloat"
  show(ask, sm(0.15, 0.4, t) * (1 - sm(T.installs - 0.2, T.installs, t)), 1);
  const codeOn = (k) => t < T.builds - 0.1 || (t >= T.n335 - 0.1 && wrong) ? k : 0;
  rows.forEach((r, i) => {
    const a0 = t < T.builds ? T.bloat + 0.12 * i : T.n335 - 0.1 + 0.05 * i;
    const k = sm(a0, a0 + 0.1, t) * (1 - out);
    r.visible = codeOn(k) > 0.01 && !(t >= T.installs - 0.1 && t < T.n335 - 0.1);
    r.position.y = (t < T.builds ? 0.98 : 1.38) - i * 0.068 - (t < T.builds ? 0 : 0);
  });
  // counter 40 -> 335 on "335"
  const ci = Math.min(4, Math.floor((t - T.n335 + 0.05) / 0.12));
  counters.forEach((m, i) => (m.visible = wrong && t >= T.n335 - 0.05 && i === ci && out < 0.5));
  linesT.visible = wrong && t >= T.n335 - 0.05;
  if (t >= T.n335 - 0.05) rows.forEach((r) => (r.scale.x = 0.62)); // leave room for the counter

  // s2: library box drops in on "installs", leaves on "builds"
  const lk = sm(T.installs - 0.05, T.installs + 0.3, t) * (1 - sm(T.builds - 0.15, T.builds + 0.05, t));
  show(lib, lk, 1); lib.position.y = 0.8 + 0.6 * (1 - sm(T.installs - 0.05, T.installs + 0.3, t)); lib.rotation.y = 0.35 + 0.1 * Math.sin(t * 2);
  // calendar built cell by cell on "builds", gone on "335"
  const calOn = t >= T.builds - 0.1 && t < T.n335 - 0.05;
  cal.visible = calOn; calHead.visible = calT.visible = calOn;
  cells.forEach((c, i) => { const k = sm(T.builds + 0.035 * i, T.builds + 0.035 * i + 0.1, t); c.visible = calOn && k > 0.01; c.scale.setScalar(Math.max(1e-3, k)); });
  // "maintain": warning sign + the screen shakes
  const wk = sm(T.maintain - 0.1, T.maintain + 0.15, t) * (1 - out);
  show(warn, wrong ? wk : 0, 1); warn.position.set(0.68, 1.05, 0.12);
  lid.position.x = wrong && t >= T.maintain ? 0.015 * Math.sin(t * 45) * (1 - sm(T.maintain + 0.6, T.maintain + 1.0, t)) : 0;

  // s3: avatar on "Instead" (no empty screen), $0 on "free", avatar back on "makes"
  const avA = sm(T.s3 - 0.12, T.s3 + 0.08, t) * (1 - sm(T.free - 0.2, T.free - 0.05, t)) + sm(T.makes - 0.1, T.makes + 0.2, t) * (1 - sm(T.s4 - 0.15, T.s4, t));
  show(avatar, avA, T.over <= t && t < T.free ? 0.85 : 1);
  avatar.position.set(0, 0.84, 0.25); avatar.rotation.y = 0.2 * Math.sin((t - T.s3) * 2);
  show(zero, sm(T.free - 0.32, T.free - 0.14, t) * (1 - sm(T.makes - 0.15, T.makes, t)), 1); zero.position.set(0, 0.82, 0.22);

  // s4: project tiles, magnifier scans, INPUT lights green; browser + date picker
  const pA = sm(T.s4 - 0.05, T.s4 + 0.25, t) * (1 - sm(T.s5 + 0.5, T.s5 + 0.8, t));
  show(proj, pA, 1);
  const inHi = sm(T.input - 0.1, T.input + 0.2, t), brA = sm(T.browser - 0.1, T.browser + 0.2, t);
  tiles.forEach((m, i) => {
    if (i === 1) return;
    m.visible = pA > 0.01 && brA < 0.99; m.scale.setScalar(Math.max(1e-3, 1 - brA));
    m.children[0].material = inHi > 0.5 ? mDark : mBody;
  });
  inputTile.userData.bar.material.color.set(inHi > 0.5 ? GREEN : VIOLET).multiplyScalar(1.3);
  inputTile.children[0].material = inHi > 0.5 ? std(0x1f7a4a, 0x0f5a33, 0.4, 0.2) : mBody;
  const join = sm(T.s5 + 0.05, T.s5 + 0.5, t);
  inputTile.position.set(-0.75 * brA + 0.55 * join, 0.22 - 0.22 * brA, 0.02 + 0.08 * inHi);
  inputTile.scale.setScalar(1 + 0.25 * inHi);
  const scan = sm(T.checks, T.your, t);
  const mp = scan < 0.5 ? [-0.7 + 2.8 * scan, 0.22] : [0.7 - 2.8 * (scan - 0.5), -0.26];
  show(mag, sm(T.checks - 0.15, T.checks + 0.1, t) * (1 - sm(T.input - 0.1, T.input + 0.1, t)), 1);
  mag.position.set(mp[0] + 0.05, 0.84 + mp[1], 0.2);
  show(browser, brA * (1 - sm(T.s5 + 0.5, T.s5 + 0.8, t)), 1);
  browser.position.set(0.48 - 0.5 * join, 0.8, 0.08);
  picker.children.forEach((c, i) => { if (i) c.scale.setScalar(1 + (i === 10 ? 0.4 * sm(T.date - 0.1, T.date + 0.2, t) : 0)); });

  // s5: they merge into one green file; 10 lines tick in on "10"
  const cA = sm(T.s5 + 0.55, T.s5 + 0.85, t) * (1 - sm(T.s6 - 0.15, T.s6, t)) + sm(T.s7 - 0.1, T.s7 + 0.2, t);
  show(card, Math.min(1, cA), 0.95);
  tenRows.forEach((r, i) => (r.visible = t >= Math.min(T.one, T.n10 - 0.25) + 0.05 * i));

  // s6: bars on "53" (green shrinks to 47%), shield on "never", ring on "98"
  const chA = sm(T.s6 - 0.1, T.s6 + 0.15, t) * (1 - sm(T.never - 0.15, T.never, t));
  show(chart, chA, 1);
  const shrink = 1 - 0.53 * sm(T.n53 - 0.1, T.n53 + 0.4, t);
  barG.scale.y = shrink; barG.position.y = shrink / 2; lblG.position.y = shrink + 0.1;
  show(shield, sm(T.never - 0.1, T.never + 0.2, t) * (1 - sm(T.s7 - 0.15, T.s7, t)), 1); shield.rotation.y = 0.3 * Math.sin((t - T.never) * 2);
  show(ring98, sm(T.n98 - 0.1, T.n98 + 0.2, t) * (1 - sm(T.s7 - 0.15, T.s7, t)), 1);
  arc.scale.setScalar(1 + 0.06 * Math.max(0, 1 - Math.abs(t - T.test - 0.1) / 0.2));

  // s3: the star pops in above the laptop while the star count is on screen (2-line caption: small and low)
  const sk = sm(T.over - 0.1, T.over + 0.25, t) * (1 - sm(T.free - 0.2, T.free - 0.05, t));
  star.visible = sk > 0.01; star.scale.setScalar(0.42 * sk * (1 + 0.08 * Math.sin(t * 6)));
  star.position.set(0, 1.97, -0.3); star.rotation.y = 0.35 * Math.sin((t - T.over) * 2.5);

  const { punch } = shoot(SH, t);
  const spike = overlays(t);
  bloom.strength = Math.min(1.45, 1.0 + 1.2 * punch * punch + spike);
});
