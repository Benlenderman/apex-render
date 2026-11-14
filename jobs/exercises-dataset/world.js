// NEVER FILM EVERY EXERCISE (exercises-dataset). Wrong = phone app with empty "?" cards, a red film set shooting one move at a time.
// Right = the phone fills with animated exercise cards, one card in detail, the instruction sheet, the browser search on a laptop.
import { THREE, S, g, sm, scene, bloom, glow, tube, VIOLET, ORANGE, RED, GREEN, WHITE, shoot, run } from "./kit.js";
import { title, cap, boom, endCard, overlays, fitText, makePerson } from "./extra.js";
import { RoundedBoxGeometry } from "three/addons/geometries/RoundedBoxGeometry.js";

const std = (c, e, r = 0.45, m = 0.25) => new THREE.MeshStandardMaterial({ color: c, emissive: e, roughness: r, metalness: m });
const rbox = (w, h, d, r, mat) => new THREE.Mesh(new RoundedBoxGeometry(w, h, d, 4, r), mat);
const mBody = std(0x4a42c8, 0x1c1766, 0.35, 0.35), mDark = std(0x14123a, 0x07061a, 0.6, 0.2), mLav = std(0xc9c0ff, 0x4a3fb0, 0.4, 0.1);
const mRedB = std(0x8a1a2a, 0x40060f, 0.4, 0.3), mGreenB = std(0x1f7a4a, 0x0f5a33, 0.4, 0.2);
const set = (o, x, y, z) => (o.position.set(x, y, z), o);

// ---------- canvas textures ----------
function canvasMat(draw, k = 0.8) {
  const c = document.createElement("canvas"); c.width = c.height = 256; const x = c.getContext("2d"); draw(x);
  return new THREE.MeshBasicMaterial({ map: new THREE.CanvasTexture(c), color: new THREE.Color(k, k, k), toneMapped: false });
}
// side-view stick figure doing a dumbbell curl; a = 0 arm down .. 1 curled; hi = biceps lit green
function figure(x, a, col, hi, bg = "#1b1650") {
  x.fillStyle = bg; x.fillRect(0, 0, 256, 256);
  x.strokeStyle = col; x.fillStyle = col; x.lineCap = "round"; x.lineWidth = 12;
  x.beginPath(); x.arc(120, 50, 22, 0, 7); x.fill();
  const L = (p) => { x.beginPath(); x.moveTo(...p[0]); for (const q of p.slice(1)) x.lineTo(...q); x.stroke(); };
  L([[120, 75], [120, 150]]); L([[120, 150], [104, 228]]); L([[120, 150], [140, 228]]);
  const ang = Math.PI / 2 - a * (Math.PI - 0.45), hx = 122 + 46 * Math.cos(ang), hy = 128 + 46 * Math.sin(ang);
  if (hi) { x.strokeStyle = "#3dff8a"; x.lineWidth = 22; }
  L([[120, 86], [122, 128]]);
  x.strokeStyle = col; x.lineWidth = 12; L([[122, 128], [hx, hy]]);
  x.fillStyle = hi ? "#3dff8a" : col; x.fillRect(hx - 6, hy - 22, 12, 44); x.fillRect(hx - 13, hy - 26, 26, 10); x.fillRect(hx - 13, hy + 16, 26, 10);
}
const NF = 8, curl = (k) => 0.5 - 0.5 * Math.cos((k / NF) * Math.PI * 2);
const FIG = [0, 1].map((hi) => Array.from({ length: NF }, (_, k) => canvasMat((x) => figure(x, curl(k), "#e8e4ff", hi))));
const FIGG = Array.from({ length: NF }, (_, k) => canvasMat((x) => figure(x, curl(k), "#3dff8a", 0, "#0d2a24")));
const QMAT = canvasMat((x) => { x.fillStyle = "#2a0d1a"; x.fillRect(0, 0, 256, 256); x.fillStyle = "#ff2a3a"; x.font = "900 170px Inter, Arial"; x.textAlign = "center"; x.textBaseline = "middle"; x.fillText("?", 128, 138); }, 1.0);
const frameAt = (t, ph = 0) => Math.floor((t * 9 + ph) % NF);
const tile = (w, h) => new THREE.Mesh(new THREE.PlaneGeometry(w, h), QMAT);
const txt = (s, hex, k = 1.0, w = 0.4) => { const m = fitText([s], hex, k, w); m.visible = true; return m; };

// ---------- shared floor + lights ----------
const floor = new THREE.Mesh(new THREE.CircleGeometry(4.2, 48), std(0x221d66, 0x0c0a30, 0.7, 0.1)); floor.rotation.x = -Math.PI / 2; scene.add(floor);
const pl = new THREE.PointLight(0xe8e2ff, 18, 9, 1.6); pl.position.set(-1.6, 3.2, 2.2); scene.add(pl);
const rim = new THREE.PointLight(0xff8a3a, 10, 8, 1.6); rim.position.set(2.6, 2.2, -2.4); scene.add(rim);

// ---------- A: phone with the workout app ----------
const A = new THREE.Group(); scene.add(A);
const phone = rbox(1.3, 2.5, 0.12, 0.12, mBody); set(phone, 0, 1.33, 0); A.add(phone);
A.add(set(rbox(0.5, 0.08, 0.4, 0.03, mDark), 0, 0.04, 0.05));
const pScreen = new THREE.Mesh(new THREE.PlaneGeometry(1.16, 2.3), new THREE.MeshBasicMaterial({ color: 0x0b0a26, toneMapped: false })); set(pScreen, 0, 1.33, 0.065); A.add(pScreen);
const pBar = new THREE.Mesh(new THREE.PlaneGeometry(1.16, 0.015), glow(VIOLET, 1.6)); set(pBar, 0, 2.3, 0.068); A.add(pBar);
const pHead = txt("WORKOUTS", WHITE, 0.8, 0.9); set(pHead, 0, 2.38, 0.07); A.add(pHead);
const cards = [];
for (let r = 0; r < 3; r++) for (let c = 0; c < 2; c++) { const m = tile(0.5, 0.56); set(m, c ? 0.28 : -0.28, 1.88 - r * 0.66, 0.07); A.add(m); cards.push(m); }
// red film camera on a tripod
function filmCam() {
  const gp = new THREE.Group();
  [-1, 0, 1].forEach((i) => gp.add(tube([0, 0.95, 0], [i * 0.3, 0, i ? 0.15 : -0.3], 0.04, mDark)));
  const b = rbox(0.5, 0.32, 0.28, 0.05, mRedB); set(b, 0, 1.12, 0); gp.add(b);
  const lens = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.12, 0.2, 20), mDark); lens.rotation.z = Math.PI / 2; set(lens, 0.33, 1.12, 0); gp.add(lens);
  const ring = new THREE.Mesh(new THREE.TorusGeometry(0.1, 0.015, 8, 24), glow(RED, 1.8)); ring.rotation.y = Math.PI / 2; set(ring, 0.44, 1.12, 0); gp.add(ring);
  const rec = new THREE.Mesh(new THREE.SphereGeometry(0.045, 12, 8), glow(RED, 2.4)); set(rec, -0.14, 1.32, 0.1); gp.add(rec);
  gp.userData.rec = rec; return gp;
}
const camA = filmCam(); camA.position.set(-0.95, 0, 1.1); camA.rotation.y = 0.35; camA.userData.k = 0.8; A.add(camA);
// s3: the star and the wall of exercise tiles
const starShape = new THREE.Shape();
for (let i = 0; i < 10; i++) { const a = Math.PI / 2 + (i * Math.PI) / 5, r = i % 2 ? 0.17 : 0.4; starShape[i ? "lineTo" : "moveTo"](Math.cos(a) * r, Math.sin(a) * r); }
const star = new THREE.Mesh(new THREE.ExtrudeGeometry(starShape, { depth: 0.08, bevelEnabled: true, bevelSize: 0.03, bevelThickness: 0.03, bevelSegments: 2 }), glow(ORANGE, 1.5));
scene.add(star);
const wall = [];
for (let r = 0; r < 9; r++) for (let c = 0; c < 9; c++) {
  if (Math.abs(c - 4) < 2 && r > 0 && r < 8) continue; // keep the phone clear
  const m = new THREE.Mesh(new THREE.PlaneGeometry(0.36, 0.36), FIGG[0]); set(m, (c - 4) * 0.44, 0.2 + r * 0.42, -1.2); m.userData.ph = (r * 3 + c) % NF; A.add(m); wall.push(m);
}

// ---------- B: the film set (gym, camera, person, takes) ----------
const B = new THREE.Group(); scene.add(B);
const P = makePerson(); B.add(P.g); P.g.position.set(-0.15, 0, -0.2); P.g.rotation.y = Math.PI;
Object.values(P.mats).forEach((m) => { m.color.set(0x8a2a4a); m.emissive.set(0x3a0a1a); });
const camB = filmCam(); camB.position.set(-1.0, 0, 1.0); camB.rotation.y = -0.55; B.add(camB);
function dumbbell(mat, disc) {
  const gp = new THREE.Group();
  const h = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.5, 12), mDark); h.rotation.z = Math.PI / 2; gp.add(h);
  [-1, 1].forEach((s) => { const d = new THREE.Mesh(new THREE.CylinderGeometry(0.11, 0.11, 0.1, 20), mat); d.rotation.z = Math.PI / 2; d.position.x = s * 0.22; gp.add(d); const e = new THREE.Mesh(new THREE.TorusGeometry(0.11, 0.012, 6, 24), glow(disc, 1.6)); e.rotation.y = Math.PI / 2; e.position.x = s * 0.275; gp.add(e); });
  return gp;
}
const rack = new THREE.Group(); set(rack, 0.2, 0, -1.5); B.add(rack);
rack.add(set(rbox(1.9, 0.08, 0.4, 0.02, mDark), 0, 0.55, 0), set(rbox(1.9, 0.08, 0.4, 0.02, mDark), 0, 1.0, 0));
[-0.75, 0.75].forEach((x) => rack.add(tube([x, 0, 0], [x, 1.05, 0], 0.06, mDark)));
for (let i = 0; i < 6; i++) { const d = dumbbell(mRedB, RED); d.scale.setScalar(0.85); set(d, -0.6 + (i % 3) * 0.6, i < 3 ? 0.7 : 1.15, 0); rack.add(d); }
const takes = [1, 2, 3, 4].map((n) => {
  const gp = new THREE.Group();
  gp.add(rbox(0.5, 0.36, 0.04, 0.03, mDark));
  const top = new THREE.Group(); set(top, 0, 0.22, 0); gp.add(top);
  for (let i = 0; i < 4; i++) top.add(set(new THREE.Mesh(new THREE.PlaneGeometry(0.1, 0.08), glow(i % 2 ? WHITE : RED, i % 2 ? 0.8 : 1.4)), -0.18 + i * 0.12, 0, 0.03));
  const t = txt(`TAKE ${n}`, WHITE, 0.8, 0.42); set(t, 0, -0.03, 0.03); gp.add(t);
  B.add(gp); return gp;
});

// ---------- C: one exercise card in detail ----------
const C = new THREE.Group(); scene.add(C);
C.add(set(rbox(1.7, 2.3, 0.08, 0.08, mBody), 0, 1.3, 0));
const gif = new THREE.Mesh(new THREE.PlaneGeometry(1.36, 1.2), FIG[0][0]); set(gif, 0, 1.75, 0.05); C.add(gif);
const gifTag = txt("ANIMATION", VIOLET, 1.3, 0.5); set(gifTag, 0.38, 1.27, 0.06); C.add(gifTag);
const thumb = new THREE.Group(); set(thumb, -0.4, 0.62, 0.06); C.add(thumb);
thumb.add(rbox(0.62, 0.62, 0.04, 0.04, mLav), set(new THREE.Mesh(new THREE.PlaneGeometry(0.54, 0.54), FIG[0][3]), 0, 0, 0.025));
const muscleTag = new THREE.Group(); set(muscleTag, 0.4, 0.62, 0.06); C.add(muscleTag);
muscleTag.add(rbox(0.66, 0.26, 0.04, 0.06, mGreenB)); muscleTag.add(set(txt("BICEPS", WHITE, 0.9, 0.56), 0, 0, 0.03));

// ---------- D: gear + step-by-step instructions + 10 languages ----------
const D = new THREE.Group(); scene.add(D);
D.add(set(rbox(1.9, 2.5, 0.08, 0.08, mBody), 0, 1.3, -0.05));
const gear = dumbbell(mGreenB, GREEN); gear.scale.setScalar(1.5); set(gear, 0, 2.18, 0.25); D.add(gear);
const steps = [0, 1, 2].map((i) => {
  const gp = new THREE.Group(); set(gp, 0, 1.62 - i * 0.32, 0.02); D.add(gp);
  gp.add(set(new THREE.Mesh(new THREE.CircleGeometry(0.11, 24), glow(GREEN, 0.9)), -0.62, 0, 0.01));
  gp.add(set(txt(String(i + 1), 0x0b0920, 1.0, 0.2), -0.62, 0, 0.02));
  gp.add(set(new THREE.Mesh(new THREE.PlaneGeometry(1.05 - i * 0.18, 0.07), new THREE.MeshBasicMaterial({ color: 0xc9c0ff })), -0.42 + (1.05 - i * 0.18) / 2, 0, 0.01));
  return gp;
});
const LANGS = ["EN", "ES", "IT", "TR", "RU", "ZH", "HI", "PL", "KO", "FR"];
const chips = LANGS.map((l, i) => {
  const gp = new THREE.Group(); set(gp, -0.68 + (i % 5) * 0.34, 0.66 - Math.floor(i / 5) * 0.34, 0.06); D.add(gp);
  gp.add(rbox(0.3, 0.26, 0.04, 0.05, i % 2 ? mBody.clone() : mGreenB)); gp.children[0].material = i % 2 ? std(0x5a50e0, 0x2a2290) : mGreenB;
  gp.add(set(txt(l, WHITE, 0.95, 0.3), 0, 0, 0.03)); return gp;
});

// ---------- E: laptop with the browser (one local file, no server) ----------
const E = new THREE.Group(); scene.add(E);
E.add(set(rbox(2.6, 0.1, 1.7, 0.04, mBody), 0, 0.05, 0), set(rbox(2.2, 0.02, 0.8, 0.01, mDark), 0, 0.105, -0.2), set(rbox(0.8, 0.02, 0.45, 0.01, mDark), 0, 0.105, 0.5));
const lid = new THREE.Group(); lid.position.set(0, 0.1, -0.85); lid.rotation.x = -0.12; E.add(lid);
lid.add(set(rbox(2.6, 1.7, 0.06, 0.04, mBody), 0, 0.85, 0));
lid.add(set(new THREE.Mesh(new THREE.PlaneGeometry(2.4, 1.5), new THREE.MeshBasicMaterial({ color: 0x0a1a1a, toneMapped: false })), 0, 0.85, 0.035));
lid.add(set(new THREE.Mesh(new THREE.PlaneGeometry(2.4, 0.12), glow(VIOLET, 0.35)), 0, 1.54, 0.037));
lid.add(set(new THREE.Mesh(new THREE.PlaneGeometry(2.4, 0.015), glow(GREEN, 1.6)), 0, 1.475, 0.038));
[-1.08, -0.98, -0.88].forEach((x, i) => lid.add(set(new THREE.Mesh(new THREE.CircleGeometry(0.025, 16), glow([RED, ORANGE, GREEN][i], 1.2)), x, 1.54, 0.039)));
const urlT = txt("INDEX.HTML", WHITE, 0.7, 0.7); set(urlT, 0, 1.54, 0.04); lid.add(urlT);
const search = new THREE.Group(); set(search, 0, 1.3, 0.04); lid.add(search);
search.add(set(new THREE.Mesh(new THREE.PlaneGeometry(1.7, 0.2), new THREE.MeshBasicMaterial({ color: 0xc9c0ff })), 0, 0, 0));
const qT = txt("CURL", 0x0b0920, 1.0, 0.8); set(qT, -0.38, 0, 0.005); search.add(qT);
const results = [];
for (let r = 0; r < 2; r++) for (let c = 0; c < 5; c++) { const m = new THREE.Mesh(new THREE.PlaneGeometry(0.36, 0.42), FIGG[0]); set(m, -0.88 + c * 0.44, 0.88 - r * 0.5, 0.04); m.userData.ph = r * 5 + c; lid.add(m); results.push(m); }
// the file card that drops into the browser
const file = new THREE.Group(); E.add(file);
file.add(rbox(0.56, 0.72, 0.06, 0.05, mLav));
file.add(set(new THREE.Mesh(new THREE.PlaneGeometry(0.46, 0.2), glow(GREEN, 1.1)), 0, -0.12, 0.032));
file.add(set(txt("HTML", WHITE, 1.0, 0.4), 0, -0.12, 0.034));
// crossed-out server
const server = new THREE.Group(); E.add(server);
server.add(rbox(1.6, 2.6, 1.2, 0.12, mBody));
for (let i = 0; i < 5; i++) { server.add(set(rbox(1.36, 0.36, 0.06, 0.04, mDark), 0, -0.95 + i * 0.48, 0.6)); server.add(set(new THREE.Mesh(new THREE.SphereGeometry(0.045, 12, 8), glow(RED, 2.2)), 0.5, -0.95 + i * 0.48, 0.65)); }
server.add(tube([-1, -1.4, 0.7], [1, 1.4, 0.7], 0.12, glow(RED, 2.4)), tube([1, -1.4, 0.7], [-1, 1.4, 0.7], 0.12, glow(RED, 2.4)));
server.scale.setScalar(0.42); server.position.set(0, 2.75, -1.6);

// ---------- captions ----------
title("NEVER FILM EVERY EXERCISE");
cap("s1", "exploring", ["EXPLORING GITHUB REPOS"], WHITE, { until: "s1" });
cap("s2", "gym", ["A GYM, A CAMERA"], RED, { until: ["s2", "someone"] });
cap("s2", "someone", ["SOMEONE TO ACT IT OUT"], RED, { until: ["s2", "one"] });
cap("s2", "one", ["ONE AT A TIME"], RED, { boom: 0.5 });
cap("s3", "exercises", ["EXERCISES DATASET"], GREEN, { until: ["s3", "almost"], boom: 0.5 });
cap("s3", "almost", ["ALMOST 24,000 STARS", "IN 8 MONTHS"], ORANGE, { until: ["s3", "it"], boom: 0.5 });
cap("s3", "1324", ["1,324 EXERCISES"], GREEN, { until: ["s3", "ready"], boom: 0.5 });
cap("s3", "ready", ["READY TO USE"], GREEN);
cap("s4", "moving", ["MOVING ANIMATION"], VIOLET, { until: ["s4", "small"] });
cap("s4", "small", ["SMALL PICTURE"], VIOLET, { until: ["s4", "muscle"] });
cap("s4", "muscle", ["THE MUSCLE IT WORKS"], GREEN, { boom: 0.4 });
cap("s5", "gear", ["THE GEAR YOU NEED"], GREEN, { until: ["s5", "step"] });
cap("s5", "step", ["STEP BY STEP"], GREEN, { until: ["s5", "10"] });
cap("s5", "10", ["10 LANGUAGES"], GREEN, { boom: 0.5 });
cap("s6", "open", ["ONE FILE IN YOUR BROWSER"], VIOLET, { until: ["s6", "search"] });
cap("s6", "search", ["SEARCH ALL 1,324"], GREEN, { until: ["s6", "no"], boom: 0.4 });
cap("s6", "no", ["NO SERVER NEEDED"], GREEN);
endCard(["DON'T FILM EVERY MOVE.", "DOWNLOAD THEM."]);
boom("s1", "film", 0.5);

// ---------- timings ----------
const T = {
  film: g("s1", "film"), gym: g("s2", "gym"), camera: g("s2", "camera"), someone: g("s2", "someone"), act: g("s2", "act"), one: g("s2", "one"),
  s3: S.s3[0], almost: g("s3", "almost"), it: g("s3", "it"), hands: g("s3", "hands"), n1324: g("s3", "1324"),
  moving: g("s4", "moving"), small: g("s4", "small"), muscle: g("s4", "muscle"),
  gear: g("s5", "gear"), step: g("s5", "step"), by: g("s5", "by"), step2: g("s5", "step", 2), ten: g("s5", "10"),
  open: g("s6", "open"), browser: g("s6", "browser"), search: g("s6", "search"), all: g("s6", "all"), no: g("s6", "no"),
  s7: S.s7[0], s8: S.s8[0],
};
const on = (a, b, t) => t >= a && t < b;

// ---------- shots: [cx,cy,cz, lx,ly,lz, fov] ----------
const SH = [
  { at: 0, K: [[0, [0.4, 1.7, 7.0, 0, 1.45, 0, 48]], [S.s2[0], [0.0, 1.7, 6.5, -0.1, 1.45, 0, 48]]] },
  { at: S.s2[0], K: [[0, [0.6, 1.8, 7.2, 0, 1.3, 0, 50]], [S.s2[1], [0.2, 1.7, 6.8, 0, 1.3, 0, 50]]] },
  { at: T.s3, K: [[0, [-0.4, 1.6, 6.0, 0, 1.35, 0, 48]], [T.almost - T.s3, [0, 1.9, 7.0, 0, 1.6, 0, 48]], [T.hands - T.s3, [0, 2.0, 8.4, 0, 1.75, 0, 48]], [S.s3[1], [0.3, 2.0, 8.8, 0, 1.75, 0, 48]]] },
  { at: S.s4[0], K: [[0, [0.4, 1.5, 5.4, 0, 1.3, 0, 48]], [S.s4[1], [0.1, 1.4, 5.0, 0, 1.3, 0, 48]]] },
  { at: S.s5[0], K: [[0, [-0.4, 1.5, 5.6, 0, 1.35, 0, 48]], [S.s5[1], [-0.1, 1.5, 5.3, 0, 1.35, 0, 48]]] },
  { at: S.s6[0], K: [[0, [0.3, 1.8, 5.6, 0, 1.0, -0.5, 48]], [T.no - S.s6[0] - 0.2, [0.1, 1.8, 5.2, 0, 1.0, -0.6, 48]], [T.no - S.s6[0] + 0.6, [0, 2.8, 7.4, 0, 1.75, -1.2, 50]]] },
  { at: T.s7, calm: 1, K: [[0, [0, 2.8, 7.4, 0, 1.75, -1.2, 50]], [4, [0.3, 3.0, 8.0, 0, 1.8, -1.2, 50]]] },
];

run("exercises-world", (t) => {
  const right = t >= T.s3;
  A.visible = t < S.s2[0] || on(T.s3, S.s4[0], t);
  B.visible = on(S.s2[0], T.s3, t);
  C.visible = on(S.s4[0], S.s5[0], t);
  D.visible = on(S.s5[0], S.s6[0], t);
  E.visible = on(S.s6[0], T.s8 - 0.1, t);
  floor.visible = t < T.s8 - 0.1;

  // A: red "?" cards, then green animated cards from "Instead"
  cards.forEach((m, i) => { m.material = right ? FIGG[frameAt(t, i * 3)] : QMAT; });
  pBar.material.color.set(right ? GREEN : t >= T.film ? RED : VIOLET).multiplyScalar(1.6);
  const ck = sm(T.film - 0.1, T.film + 0.25, t) * (right ? 0 : 1);
  camA.visible = ck > 0.01; camA.scale.setScalar(0.8 * ck); camA.userData.rec.visible = Math.floor(t * 3) % 2 === 0;
  const sk = sm(T.almost - 0.1, T.almost + 0.25, t) * (1 - sm(T.it - 0.15, T.it + 0.1, t));
  star.visible = A.visible && sk > 0.01; star.scale.setScalar(0.62 * sk * (1 + 0.08 * Math.sin(t * 6)));
  star.position.set(0, 2.98, 0.2); star.rotation.y = 0.35 * Math.sin((t - T.almost) * 2.5);
  wall.forEach((m, i) => { const k = sm(T.hands + 0.012 * i, T.hands + 0.25 + 0.012 * i, t); m.visible = k > 0.01; m.scale.setScalar(k); m.material = FIGG[frameAt(t, m.userData.ph)]; });

  // B: rack from the start of s2, camera on "camera", person on "someone", jumping jacks on "act", takes one at a time
  const bk = sm(T.camera - 0.1, T.camera + 0.2, t); camB.scale.setScalar(Math.max(bk, 0.001)); camB.visible = bk > 0.01; camB.userData.rec.visible = Math.floor(t * 3) % 2 === 0;
  const pk = sm(T.someone - 0.1, T.someone + 0.2, t); P.g.visible = pk > 0.01; P.g.scale.setScalar(Math.max(pk, 0.001));
  const jj = t >= T.act ? 0.5 - 0.5 * Math.cos((t - T.act) * 9) : 0;
  P.armL.rotation.z = -jj * 2.6; P.armR.rotation.z = jj * 2.6; P.body.position.y = 0.06 * Math.sin(jj * Math.PI);
  takes.forEach((m, i) => { const k = sm(T.one + 0.22 * i, T.one + 0.22 * i + 0.2, t); m.visible = k > 0.01; m.scale.setScalar(k); m.position.set(1.15, 0.45 + i * 0.48, 0.3); });

  // C: animated card; picture on "small"; biceps lit on "muscle"
  const lit = t >= T.muscle ? 1 : 0;
  gif.material = FIG[lit][frameAt(t)];
  gifTag.visible = t >= T.moving - 0.1; gifTag.material.opacity = sm(T.moving - 0.1, T.moving + 0.2, t);
  const tk = sm(T.small - 0.1, T.small + 0.2, t); thumb.visible = tk > 0.01; thumb.scale.setScalar(tk);
  const mk = sm(T.muscle - 0.1, T.muscle + 0.2, t); muscleTag.visible = mk > 0.01; muscleTag.scale.setScalar(mk);

  // D: dumbbell on "gear", steps one by one, 10 language chips
  const gk = sm(T.gear - 0.15, T.gear + 0.2, t); gear.visible = gk > 0.01; gear.scale.setScalar(1.5 * gk); gear.rotation.y = 0.5 * Math.sin(t * 1.5); gear.rotation.x = 0.25;
  [T.step, T.by, T.step2].forEach((a, i) => { const k = sm(a - 0.1, a + 0.15, t); steps[i].visible = k > 0.01; steps[i].scale.set(k, k, 1); });
  chips.forEach((m, i) => { const k = sm(T.ten - 0.1 + 0.05 * i, T.ten + 0.15 + 0.05 * i, t); m.visible = k > 0.01; m.scale.setScalar(k); });

  // E: the file drops into the browser, then the search and the results
  const fk = sm(T.open, T.browser, t);
  file.visible = t >= S.s6[0] && fk < 0.98; file.position.set(-1.6 + 1.6 * fk, 2.1 - 0.9 * fk, 0.3 - 0.9 * fk); file.scale.setScalar(1 - 0.6 * fk);
  urlT.visible = t >= T.browser - 0.1;
  const sk2 = sm(T.search - 0.1, T.search + 0.2, t); search.visible = sk2 > 0.01; search.scale.set(sk2, 1, 1);
  qT.scale.set(sm(T.search, T.search + 0.4, t), 1, 1);
  results.forEach((m, i) => { const k = sm(T.all - 0.1 + 0.04 * i, T.all + 0.15 + 0.04 * i, t); m.visible = k > 0.01; m.scale.setScalar(k); m.material = FIGG[frameAt(t, m.userData.ph)]; });
  const vk = sm(T.no - 0.1, T.no + 0.25, t); server.visible = vk > 0.01 && t < T.s7; server.scale.setScalar(0.42 * vk);

  const { punch } = shoot(SH, t);
  const spike = overlays(t);
  bloom.strength = 1.0 + 1.2 * punch * punch + spike;
});
