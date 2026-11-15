// NEVER RUN A BROWSER FOR MUSIC (Spotifast). Laptop on a dark desk; wrong = a red web browser hides inside the music app,
// right = green native app that shrinks into a Winamp mini player, equalizer, playlist, visuals, three platforms.
import { THREE, S, g, sm, scene, bloom, glow, VIOLET, ORANGE, RED, GREEN, WHITE, tube, shoot, run } from "./kit.js";
import { title, cap, boom, endCard, overlays, fitText } from "./extra.js";

import { RoundedBoxGeometry } from "three/addons/geometries/RoundedBoxGeometry.js";
const std = (c, e, r = 0.45, m = 0.25) => new THREE.MeshStandardMaterial({ color: c, emissive: e, roughness: r, metalness: m });
const rbox = (w, h, d, r, mat) => new THREE.Mesh(new RoundedBoxGeometry(w, h, d, 4, r), mat);
const plane = (w, h, mat, x, y, z, parent) => { const p = new THREE.Mesh(new THREE.PlaneGeometry(w, h), mat); p.position.set(x, y, z); parent.add(p); return p; };
const flat = (hex) => new THREE.MeshBasicMaterial({ color: hex, toneMapped: false });
const txt = (s, hex, w, x, y, z, parent) => { const t = fitText([s], hex, 1.0, w); t.visible = true; t.position.set(x, y, z); parent.add(t); return t; };
const mBody = std(0x4a42c8, 0x1c1766, 0.35, 0.35), mDark = std(0x14123a, 0x07061a, 0.6, 0.2), mLav = std(0xc9c0ff, 0x4a3fb0, 0.4, 0.1);

const root = new THREE.Group(); scene.add(root);

// ---------- desk + room lights ----------
const desk = rbox(9, 0.3, 5, 0.12, std(0x221d66, 0x0c0a30, 0.7, 0.1)); desk.position.set(0, -0.14, -0.6); root.add(desk);
const pl = new THREE.PointLight(0xe8e2ff, 18, 9, 1.6); pl.position.set(-1.6, 3.2, 2.2); root.add(pl);
const rim = new THREE.PointLight(0xff8a3a, 10, 8, 1.6); rim.position.set(2.6, 2.2, -2.4); root.add(rim);
const front = new THREE.PointLight(0xd8d0ff, 10, 8, 1.6); front.position.set(0.5, 2.8, 3.6); root.add(front);

// ---------- laptop at the origin, screen faces +z ----------
const base = rbox(2.6, 0.1, 1.7, 0.04, mBody); base.position.set(0, 0.05, 0); root.add(base);
const keysM = rbox(2.2, 0.02, 0.8, 0.01, mDark); keysM.position.set(0, 0.105, -0.2); root.add(keysM);
const pad = rbox(0.8, 0.02, 0.45, 0.01, mDark); pad.position.set(0, 0.105, 0.5); root.add(pad);
const lid = new THREE.Group(); lid.position.set(0, 0.1, -0.85); lid.rotation.x = -0.12; root.add(lid);
const screenM = rbox(2.6, 1.7, 0.06, 0.04, mBody); screenM.position.set(0, 0.85, 0); lid.add(screenM);
plane(2.4, 1.5, flat(0x0b0a26), 0, 0.85, 0.035, lid);
const SCR = (x, y, dz = 0.25) => new THREE.Vector3(x, 0.1 + y, -0.85 + 0.12 * y + dz); // point just in front of the screen

// music note (head + stem + flag)
function makeNote(mat, s = 1) {
  const n = new THREE.Group();
  const head = new THREE.Mesh(new THREE.SphereGeometry(0.1, 16, 12), mat); head.scale.set(1.3, 1, 0.5); n.add(head);
  const stem = new THREE.Mesh(new THREE.BoxGeometry(0.035, 0.36, 0.03), mat); stem.position.set(0.11, 0.18, 0); n.add(stem);
  const flag = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.05, 0.03), mat); flag.position.set(0.17, 0.32, 0); flag.rotation.z = -0.6; n.add(flag);
  n.scale.setScalar(s); return n;
}

// red web browser face (tab strip, address bar, globe); w x h, drawn on +z
function browserFace(w, h, parent, z0) {
  const f = new THREE.Group(); f.position.z = z0; parent.add(f);
  plane(w, h, flat(0x2a0712), 0, 0, 0, f);
  plane(w, h * 0.13, glow(RED, 0.55), 0, h * 0.435, 0.002, f);
  [[-0.36, 0.22], [-0.12, 0.2]].forEach(([x, tw]) => plane(w * tw, h * 0.1, glow(RED, x < -0.2 ? 1.4 : 0.9), w * x, h * 0.44, 0.004, f));
  plane(w * 0.78, h * 0.09, flat(0xffd5da), w * 0.05, h * 0.3, 0.004, f);
  const lock = new THREE.Mesh(new THREE.CircleGeometry(h * 0.03, 16), glow(RED, 1.6)); lock.position.set(-w * 0.3, h * 0.3, 0.006); f.add(lock);
  const globe = new THREE.Group(); globe.position.set(0, -h * 0.1, 0.05); f.add(globe);
  const gr = h * 0.27, gm = glow(RED, 1.8);
  globe.add(new THREE.Mesh(new THREE.TorusGeometry(gr, gr * 0.05, 6, 48), gm));
  const mer = new THREE.Mesh(new THREE.TorusGeometry(gr, gr * 0.04, 6, 48), gm); mer.scale.x = 0.45; globe.add(mer);
  [0, 0.5, -0.5].forEach((k) => { const r = gr * Math.sqrt(1 - k * k); const p = new THREE.Mesh(new THREE.BoxGeometry(r * 2, gr * 0.07, 0.01), gm); p.position.y = gr * k; globe.add(p); });
  const vline = new THREE.Mesh(new THREE.BoxGeometry(gr * 0.07, gr * 2, 0.01), gm); globe.add(vline);
  f.userData.globe = globe;
  return f;
}

// ---------- screen layer 1 (behind): the hidden browser ----------
const brScreen = browserFace(2.4, 1.5, lid, 0.04); brScreen.position.y = 0.85;
const brRows = new THREE.Group(); brRows.position.set(0, 0.85, 0.046); lid.add(brRows);
for (let i = 0; i < 4; i++) {
  plane(0.16, 0.13, glow(RED, 1.2), -0.55, 0.12 - i * 0.2, 0, brRows);
  plane(1.1, 0.05, flat(0xff8a96), 0.15, 0.12 - i * 0.2, 0, brRows);
}

// ---------- screen layer 2 (front): the music app. appWrap = shrink pivot (center), appPiv = wipe pivot (right edge) ----------
const appWrap = new THREE.Group(); appWrap.position.set(0, 0.85, 0.048); lid.add(appWrap);
const appPiv = new THREE.Group(); appPiv.position.x = 1.2; appWrap.add(appPiv);
const app = new THREE.Group(); app.position.x = -1.2; appPiv.add(app);
const mAcc = glow(VIOLET, 1.4), mAccSoft = glow(VIOLET, 0.45), mCover = glow(VIOLET, 0.9);
plane(2.4, 1.5, flat(0x0d0b2e), 0, 0, 0, app);
plane(0.62, 1.5, flat(0x16133f), -0.89, 0, 0.002, app);
const appNote = makeNote(mAcc, 0.9); appNote.position.set(-0.98, 0.42, 0.01); app.add(appNote);
[0.12, -0.04, -0.2].forEach((y) => plane(0.4, 0.04, mAccSoft, -0.89, y, 0.004, app));
for (let i = 0; i < 4; i++) {
  plane(0.17, 0.15, mCover, -0.36, 0.48 - i * 0.24, 0.004, app);
  plane(0.95, 0.05, flat(0xb8b0ff), 0.32, 0.5 - i * 0.24, 0.004, app);
  plane(0.55, 0.035, flat(0x5a52a8), 0.12, 0.42 - i * 0.24, 0.004, app);
}
plane(2.4, 0.22, flat(0x1a1748), 0, -0.64, 0.003, app);
const play = new THREE.Mesh(new THREE.CircleGeometry(0.07, 24), mAcc); play.position.set(0, -0.64, 0.006); app.add(play);
plane(0.9, 0.025, mAccSoft, 0.6, -0.64, 0.006, app);

// ---------- s1: a big red browser rises behind the laptop ----------
const bigBr = new THREE.Group(); root.add(bigBr);
const bbBody = rbox(2.0, 1.32, 0.1, 0.06, std(0x5a1020, 0x2a0610, 0.4, 0.2)); bigBr.add(bbBody);
browserFace(1.86, 1.18, bigBr, 0.056);
const bbNote = makeNote(glow(RED, 1.8), 0.7); bbNote.position.set(0.55, -0.32, 0.12); bigBr.add(bbNote);
const BB = new THREE.Vector3(0, 2.75, -1.5);

// ---------- s3: GitHub star ----------
const starShape = new THREE.Shape();
for (let i = 0; i < 10; i++) { const a = Math.PI / 2 + (i * Math.PI) / 5, r = i % 2 ? 0.17 : 0.4; starShape[i ? "lineTo" : "moveTo"](Math.cos(a) * r, Math.sin(a) * r); }
const star = new THREE.Mesh(new THREE.ExtrudeGeometry(starShape, { depth: 0.08, bevelEnabled: true, bevelSize: 0.03, bevelThickness: 0.03, bevelSegments: 2 }), glow(ORANGE, 1.5));
root.add(star);

// s3: a Rust gear, then a crossed-out small browser
const gear = new THREE.Group(); root.add(gear);
gear.add(new THREE.Mesh(new THREE.TorusGeometry(0.3, 0.09, 12, 40), glow(VIOLET, 1.3)));
for (let i = 0; i < 10; i++) { const a = (i / 10) * Math.PI * 2, tth = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.14, 0.12), glow(VIOLET, 1.3)); tth.position.set(Math.cos(a) * 0.42, Math.sin(a) * 0.42, 0); tth.rotation.z = a; gear.add(tth); }
txt("R", WHITE, 0.7, 0, 0, 0.06, gear);
const noBr = new THREE.Group(); root.add(noBr);
noBr.add(rbox(1.0, 0.66, 0.06, 0.04, std(0x5a1020, 0x2a0610, 0.4, 0.2)));
browserFace(0.92, 0.58, noBr, 0.034);
[[-1, 1], [1, 1]].forEach(([s]) => noBr.add(tube([-0.5 * s, -0.36, 0.1], [0.5 * s, 0.36, 0.1], 0.07, glow(RED, 2.4))));

// ---------- s4-s5: Winamp-style mini player, equalizer, playlist (stacked in front of the laptop) ----------
const SKINS = [0x2b2b3e, 0x3b2a78, 0x1d5a44, 0x2b2b3e];
const mSkin = std(SKINS[0], 0x101018, 0.5, 0.4), mPanel = flat(0x05060a), mBtn = std(0x8a8aa8, 0x2a2a40, 0.4, 0.5);
const mTitle = glow(VIOLET, 0.9);
function panel(h) {
  const p = new THREE.Group(); root.add(p);
  p.add(rbox(2.2, h, 0.1, 0.04, mSkin));
  plane(2.1, 0.07, mTitle, 0, h / 2 - 0.07, 0.052, p);
  return p;
}
const PW = 0.93, PY = [2.5, 1.52, 0.54], PZ = 0.9;
const player = panel(PW);
plane(0.84, 0.5, mPanel, -0.6, 0.06, 0.052, player);
txt("1:24", GREEN, 0.5, -0.78, 0.17, 0.056, player);
const bars = Array.from({ length: 9 }, (_, i) => { const b = new THREE.Mesh(new THREE.BoxGeometry(0.05, 1, 0.01), glow(GREEN, 1.3)); b.position.set(-0.94 + i * 0.07, -0.16, 0.056); player.add(b); return b; });
plane(1.12, 0.16, mPanel, 0.44, 0.2, 0.052, player);
txt("SPOTIFAST", GREEN, 0.8, 0.44, 0.2, 0.056, player);
plane(1.12, 0.03, glow(GREEN, 0.6), 0.44, -0.04, 0.054, player);
const seekKnob = rbox(0.12, 0.08, 0.03, 0.01, mBtn); seekKnob.position.set(0.1, -0.04, 0.06); player.add(seekKnob);
for (let i = 0; i < 5; i++) { const b = rbox(0.17, 0.13, 0.05, 0.02, mBtn); b.position.set(-0.9 + i * 0.2, -0.32, 0.06); player.add(b); }
const pBtn = new THREE.Mesh(new THREE.CircleGeometry(0.035, 3), flat(0x101018)); pBtn.position.set(-0.7, -0.32, 0.09); player.add(pBtn);

const eq = panel(PW);
plane(2.0, 0.66, mPanel, 0, -0.05, 0.052, eq);
const knobs = Array.from({ length: 10 }, (_, i) => {
  const x = -0.81 + i * 0.18; plane(0.03, 0.56, glow(GREEN, 0.5), x, -0.05, 0.054, eq);
  const k = rbox(0.11, 0.07, 0.03, 0.01, mBtn); k.position.set(x, 0, 0.07); eq.add(k); return k;
});
const plist = panel(PW);
plane(2.0, 0.66, mPanel, 0, -0.05, 0.052, plist);
const rowsP = [0, 1, 2, 3].map((i) => plane(1.6 - (i % 2) * 0.35, 0.06, glow(i ? GREEN : WHITE, i ? 0.7 : 0.9), -0.12 - (i % 2) * 0.17, 0.17 - i * 0.15, 0.054, plist));
[player, eq, plist].forEach((p, i) => p.position.set(0, PY[i], PZ));

// ---------- s6: music visuals (thin rings, no discs) + three platform tiles ----------
const vis = new THREE.Group(); vis.position.set(0, 1.55, 0.7); root.add(vis);
const VC = [VIOLET, GREEN, WHITE, 0x52d6ff, VIOLET, GREEN];
const rings = VC.map((c, i) => { const r = new THREE.Mesh(new THREE.TorusGeometry(0.35 + i * 0.19, 0.025, 8, 80), glow(c, 1.4)); vis.add(r); return r; });
const spiralPts = Array.from({ length: 120 }, (_, i) => { const a = i * 0.21, r = 0.1 + i * 0.011; return new THREE.Vector3(Math.cos(a) * r, Math.sin(a) * r, 0); });
const spiral = new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(spiralPts), 300, 0.018, 6), glow(0xff7ad9, 1.3)); vis.add(spiral);
const tiles = ["MAC", "WINDOWS", "LINUX"].map((s, i) => {
  const t = new THREE.Group(); root.add(t);
  t.add(rbox(0.8, 0.56, 0.06, 0.05, mLav));
  plane(0.68, 0.22, glow(GREEN, 0.9), 0, -0.1, 0.034, t);
  txt(s, 0x14102a, 0.62, 0, -0.1, 0.036, t);
  plane(0.4, 0.03, flat(0x6a5fd0), 0, 0.14, 0.033, t);
  t.position.set(-0.9 + i * 0.9, 1.25, 0.9); return t;
});

// ---------- captions ----------
title("NEVER RUN A BROWSER FOR MUSIC");
cap("s1", "whole", ["A WHOLE WEB BROWSER?"], RED, { until: ["s1", "exploring"] });
cap("s1", "exploring", ["EXPLORING GITHUB REPOS"], WHITE, { until: "s1" });
cap("s2", "hides", ["A HIDDEN WEB BROWSER"], RED, { until: ["s2", "just"], boom: 0.5 });
cap("s2", "just", ["JUST FOR YOUR PLAYLISTS"], RED);
cap("s3", "spotifast", ["SPOTIFAST"], GREEN, { until: ["s3", "over"], boom: 0.5 });
cap("s3", "over", ["OVER 10,000 STARS", "IN 11 WEEKS"], ORANGE, { until: ["s3", "free"], boom: 0.5 });
cap("s3", "free", ["IT'S FREE"], GREEN, { until: ["s3", "built"] });
cap("s3", "built", ["BUILT IN RUST"], VIOLET, { until: ["s3", "no"] });
cap("s3", "no", ["NO BROWSER INSIDE"], GREEN);
cap("s4", "shrink", ["SHRINK THE WINDOW"], VIOLET, { until: ["s4", "winamp"] });
cap("s4", "winamp", ["WINAMP MINI PLAYER"], GREEN, { until: ["s4", "classic"], boom: 0.5 });
cap("s4", "classic", ["CLASSIC SKINS"], VIOLET);
cap("s5", "equalizer", ["EQUALIZER"], GREEN, { until: ["s5", "playlist"] });
cap("s5", "playlist", ["PLAYLIST"], GREEN, { until: ["s5", "sound"] });
cap("s5", "sound", ["BARS BOUNCE TO THE MUSIC"], GREEN, { boom: 0.4 });
cap("s6", "10000", ["10,000+ VISUALS"], GREEN, { until: ["s6", "runs"], boom: 0.5 });
cap("s6", "runs", ["MAC, WINDOWS, LINUX"], GREEN);
endCard(["DON'T RUN A BROWSER.", "JUST PLAY THE MUSIC."]);
boom("s1", "browser", 0.5);

// ---------- timings (global seconds) ----------
const T = {
  whole: g("s1", "whole"), s2: S.s2[0], hides: g("s2", "hides"), lists: g("s2", "playlists"),
  s3: S.s3[0], spot: g("s3", "spotifast"), over: g("s3", "over"), free: g("s3", "free"), built: g("s3", "built"), no: g("s3", "no"),
  s4: S.s4[0], shrink: g("s4", "shrink"), winamp: g("s4", "winamp"), classic: g("s4", "classic"),
  s5: S.s5[0], eq: g("s5", "equalizer"), pl: g("s5", "playlist"), sound: g("s5", "sound"),
  s6: S.s6[0], n10k: g("s6", "10000"), runs: g("s6", "runs"), s7: S.s7[0], s8: S.s8[0],
};
const v = new THREE.Vector3();

// ---------- shots: [cx,cy,cz, lx,ly,lz, fov] ----------
const SH = [
  { at: 0, K: [[0, [0.3, 1.8, 5.6, 0, 0.9, -0.5, 48]], [T.whole, [0.1, 1.8, 5.2, 0, 1.0, -0.6, 48]]] },
  { at: T.whole - 0.1, K: [[0, [0, 2.3, 7.6, 0, 1.6, -1.0, 50]], [4.5, [0.4, 2.4, 7.2, 0, 1.65, -1.0, 50]]] },
  { at: T.s2, K: [[0, [0.3, 1.7, 5.6, 0, 0.95, -0.6, 47]], [3.6, [0, 1.5, 5.1, 0, 0.95, -0.6, 47]]] },
  { at: T.s3, K: [[0, [-0.6, 2.1, 5.8, 0, 1.0, -0.6, 48]], [4.5, [0.2, 1.8, 5.2, 0, 1.0, -0.6, 46]], [9.2, [-0.2, 1.9, 5.5, 0, 1.0, -0.6, 47]]] },
  { at: T.s4, K: [[0, [0.3, 1.7, 5.4, 0, 0.95, -0.6, 47]], [1.6, [0.1, 1.6, 5.0, 0, 0.95, -0.6, 47]]] },
  { at: T.winamp - 0.1, K: [[0, [0.4, 2.9, 6.6, 0, 2.3, PZ, 46]], [2.5, [0.1, 2.8, 6.3, 0, 2.3, PZ, 46]]] },
  { at: T.s5, K: [[0, [0.5, 1.9, 7.9, 0, 1.52, PZ, 50]], [3.4, [0.1, 1.8, 7.6, 0, 1.52, PZ, 50]]] },
  { at: T.s6, K: [[0, [0, 2.0, 7.6, 0, 1.45, 0.4, 50]], [3.3, [0.3, 2.1, 7.2, 0, 1.45, 0.4, 50]]] },
  { at: T.runs - 0.05, K: [[0, [0, 1.9, 6.6, 0, 1.15, 0.4, 48]], [2.2, [0.3, 2.0, 6.3, 0, 1.15, 0.4, 48]]] },
  { at: T.s7, calm: 1, K: [[0, [0.3, 3.0, 7.8, 0, 1.8, -1.2, 50]], [4, [0.5, 3.2, 8.4, 0, 1.8, -1.2, 50]]] },
];

run("spotifast-world", (t) => {
  root.visible = t < T.s8 - 0.12; // hide the scene before the CTA fades in
  const wrong = t < T.s3;
  // theme: violet app in s1-s2, green app from s3
  const hue = wrong ? VIOLET : GREEN;
  mAcc.color.set(hue).multiplyScalar(1.4); mAccSoft.color.set(hue).multiplyScalar(0.45); mCover.color.set(hue).multiplyScalar(0.9);

  // s1: the big browser rises behind the laptop; s2 start: it dives into the screen
  const rise = sm(T.whole - 0.1, T.whole + 0.35, t), dive = sm(T.s2, T.s2 + 0.4, t);
  bigBr.visible = rise > 0.01 && dive < 0.99;
  bigBr.position.copy(BB).lerp(SCR(0, 0.85, 0.1), dive); bigBr.position.y -= 0.5 * (1 - rise) * (1 - dive);
  bigBr.scale.setScalar(Math.max(0.001, rise * (1 - dive)));
  bigBr.rotation.y = 0.12 * Math.sin(t * 1.3) * (1 - dive);

  // s2: the app wipes open (right edge pivot) to show the browser inside; playlist rows land in it
  const wipe = wrong ? sm(T.hides - 0.05, T.hides + 0.35, t) : 0;
  appPiv.scale.x = Math.max(0.001, 1 - wipe);
  brScreen.visible = wrong && t >= T.hides - 0.06; brRows.visible = wrong && t >= T.lists - 0.05;
  brRows.scale.y = sm(T.lists - 0.05, T.lists + 0.2, t) || 0.001;
  brScreen.userData.globe.visible = !brRows.visible;
  brScreen.userData.globe.rotation.y = t * 1.2;

  // s3: green app pops on "Instead"; s4: it shrinks, then the mini player takes over
  const pop = wrong ? 1 : 0.85 + 0.15 * sm(T.s3, T.s3 + 0.25, t);
  const shr = sm(T.shrink, T.shrink + 0.6, t);
  appWrap.scale.setScalar(pop * (1 - 0.7 * shr));
  appWrap.visible = t < T.winamp + 0.15 || t >= T.s7;
  if (t >= T.s7) appWrap.scale.setScalar(1);

  // s3 star (2-line caption above: smaller and lower), gear, crossed-out browser
  const sk = sm(T.over - 0.1, T.over + 0.25, t) * (1 - sm(T.free - 0.15, T.free + 0.05, t));
  star.visible = sk > 0.01; star.scale.setScalar(0.42 * sk * (1 + 0.08 * Math.sin(t * 6)));
  star.position.set(0, 1.97, -0.3); star.rotation.y = 0.35 * Math.sin((t - T.over) * 2.5);
  const gk = sm(T.built - 0.1, T.built + 0.2, t) * (1 - sm(T.no - 0.15, T.no + 0.0, t));
  gear.visible = gk > 0.01; gear.scale.setScalar(0.85 * gk); gear.position.set(0, 2.0, -0.3); gear.rotation.z = -t * 1.5;
  const nk = sm(T.no - 0.05, T.no + 0.25, t) * (1 - sm(T.s4 - 0.1, T.s4, t));
  noBr.visible = nk > 0.01; noBr.scale.setScalar(0.68 * nk); noBr.position.set(0, 1.98, -0.3);

  // s4-s5: player pops out of the shrunken app; skins cycle; then EQ and playlist stack below it
  const out = 1 - sm(T.s6 - 0.05, T.s6 + 0.2, t);
  const pk = sm(T.winamp - 0.15, T.winamp + 0.3, t) * out;
  player.visible = pk > 0.01; player.scale.setScalar(pk);
  player.position.copy(SCR(0, 0.85, 0.1)).lerp(v.set(0, PY[0], PZ), sm(T.winamp - 0.15, T.winamp + 0.3, t));
  const si = t < T.classic ? 0 : Math.min(3, Math.floor((t - T.classic) / 0.4) + 1);
  mSkin.color.set(SKINS[si]);
  const ek = sm(T.eq - 0.1, T.eq + 0.2, t) * out, lk = sm(T.pl - 0.1, T.pl + 0.2, t) * out;
  eq.visible = ek > 0.01; eq.scale.setScalar(ek); plist.visible = lk > 0.01; plist.scale.setScalar(lk);
  const amp = 0.35 + 0.65 * sm(T.sound - 0.1, T.sound + 0.2, t);
  bars.forEach((b, i) => { const h = 0.03 + amp * 0.26 * Math.abs(Math.sin(t * (5 + i * 0.9) + i * 1.7)); b.scale.y = h; b.position.y = -0.3 + h / 2; });
  knobs.forEach((k, i) => (k.position.y = -0.05 + 0.2 * Math.sin(i * 0.9 + 0.8) * (0.6 + 0.4 * Math.sin(t * 2 + i))));
  seekKnob.position.x = -0.05 + ((t * 0.12) % 0.9);
  rowsP[0].material.color.set(WHITE).multiplyScalar(0.7 + 0.3 * Math.sin(t * 4));

  // s6: visuals spin on "10,000", then three platform tiles
  const vk = sm(T.s6 - 0.05, T.s6 + 0.25, t) * (1 - sm(T.runs - 0.15, T.runs + 0.05, t));
  vis.visible = vk > 0.01; vis.scale.setScalar(vk * (1 + 0.06 * Math.sin(t * 7)));
  rings.forEach((r, i) => { r.rotation.x = t * (0.6 + 0.2 * i) + i; r.rotation.y = t * (0.4 - 0.13 * i); });
  spiral.rotation.z = -t * 2;
  tiles.forEach((m, i) => {
    const k = sm(T.runs + 0.12 * i - 0.05, T.runs + 0.12 * i + 0.25, t) * (1 - sm(T.s7 - 0.1, T.s7 + 0.05, t));
    m.visible = k > 0.01; m.scale.setScalar(k); m.rotation.y = 0.15 * Math.sin(t * 2 + i);
  });

  const { punch } = shoot(SH, t);
  const spike = overlays(t);
  bloom.strength = 1.0 + 1.2 * punch * punch + spike;
});
