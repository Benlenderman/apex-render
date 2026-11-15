// NEVER GUESS HOW IT WORKS (REA). Laptop on a dark desk; wrong = you copy a toggle card, its inside (gears) is missing, the copy jams red;
// right = REA icon, lens looks inside, the app splits into UI / gears / binary layers, steps + evidence checks, a working green version.
import { THREE, S, g, sm, scene, bloom, glow, tube, VIOLET, ORANGE, RED, GREEN, WHITE, shoot, run } from "./kit.js";
import { title, cap, boom, endCard, overlays, fitText } from "./extra.js";

import { RoundedBoxGeometry } from "three/addons/geometries/RoundedBoxGeometry.js";
const root = new THREE.Group(); scene.add(root);
const std = (c, e, r = 0.45, m = 0.25) => new THREE.MeshStandardMaterial({ color: c, emissive: e, roughness: r, metalness: m });
const rbox = (w, h, d, r, mat) => new THREE.Mesh(new RoundedBoxGeometry(w, h, d, 4, r), mat);
const mBody = std(0x4a42c8, 0x1c1766, 0.35, 0.35), mDark = std(0x14123a, 0x07061a, 0.6, 0.2);
const wt = (lines, hex, k, w) => { const m = fitText(lines, hex, k, w); m.material.depthTest = true; m.renderOrder = 1; m.visible = true; return m; };
const plane = (w, h, mat, x, y, z, parent) => { const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), mat); m.position.set(x, y, z); parent.add(m); return m; };
const show = (o, k, s = 1) => { o.visible = k > 0.01; o.scale.setScalar(Math.max(1e-3, s * k)); };
const win = (t, a, b) => t >= a && t < b;

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

// ---------- an app card with a toggle switch (the "feature") ----------
const mLine = new THREE.MeshBasicMaterial({ color: 0x6a5fd0 });
function card(edgeHex) {
  const gp = new THREE.Group();
  gp.add(rbox(0.9, 0.62, 0.04, 0.04, mDark));
  const edge = plane(0.94, 0.66, glow(edgeHex, 0.9), 0, 0, -0.025, gp);
  plane(0.9, 0.08, glow(VIOLET, 0.5), 0, 0.27, 0.022, gp);
  plane(0.5, 0.03, mLine, -0.12, 0.14, 0.022, gp); plane(0.34, 0.03, mLine, -0.2, 0.07, 0.022, gp);
  const mTrack = std(0x3a3560, 0x101030, 0.4, 0.2);
  const track = rbox(0.42, 0.2, 0.04, 0.09, mTrack); track.position.set(0, -0.13, 0.03); gp.add(track);
  const knob = new THREE.Mesh(new THREE.SphereGeometry(0.075, 20, 14), std(0xffffff, 0x404060, 0.3, 0.1)); knob.position.set(-0.11, -0.13, 0.08); gp.add(knob);
  gp.userData = { edge, mTrack, knob, track };
  gp.visible = false; return gp;
}
// k = 0 off .. 1 on
const setToggle = (c, k, hex = GREEN) => { c.userData.knob.position.x = -0.11 + 0.22 * k; c.userData.mTrack.emissive.set(0x101030).lerp(new THREE.Color(hex).multiplyScalar(0.55), k); };
const blink = (t, t0) => sm(0.15, 0.35, ((t - t0) / 1.1) % 1) * (1 - sm(0.65, 0.85, ((t - t0) / 1.1) % 1)); // flips on, then off

// ---------- gears (what happens inside) ----------
function gearMesh(r, n, mat) {
  const s = new THREE.Shape();
  for (let i = 0; i < n * 4; i++) { const a = (i / (n * 4)) * Math.PI * 2, rr = i % 4 < 2 ? r : r * 0.78; s[i ? "lineTo" : "moveTo"](Math.cos(a) * rr, Math.sin(a) * rr); }
  const h = new THREE.Path(); h.absarc(0, 0, r * 0.3, 0, Math.PI * 2, true); s.holes.push(h);
  return new THREE.Mesh(new THREE.ExtrudeGeometry(s, { depth: 0.04, bevelEnabled: false }), mat);
}
function gears(hex) {
  const gp = new THREE.Group(), mat = std(new THREE.Color(hex).multiplyScalar(0.6), new THREE.Color(hex).multiplyScalar(0.35), 0.35, 0.6);
  const a = gearMesh(0.17, 10, mat); a.position.set(-0.12, -0.03, 0); gp.add(a);
  const b = gearMesh(0.115, 7, mat); b.position.set(0.155, 0.08, 0); gp.add(b);
  gp.userData.spin = (t) => { a.rotation.z = t * 1.6; b.rotation.z = -t * 1.6 * (10 / 7) + 0.2; };
  gp.visible = false; return gp;
}

// ---------- s1-s2: their app, your copy ----------
const theirs = card(VIOLET); lid.add(theirs);
const heart = (() => {
  const s = new THREE.Shape(); s.moveTo(0, -0.12); s.bezierCurveTo(-0.2, 0.02, -0.12, 0.17, 0, 0.07); s.bezierCurveTo(0.12, 0.17, 0.2, 0.02, 0, -0.12);
  const m = new THREE.Mesh(new THREE.ExtrudeGeometry(s, { depth: 0.04, bevelEnabled: true, bevelSize: 0.015, bevelThickness: 0.015, bevelSegments: 2 }), glow(0xff5fa8, 1.3));
  m.visible = false; lid.add(m); return m;
})();
const qs = [[-0.62, 1.2], [0.6, 1.25], [0.66, 0.45]].map(([x, y]) => { const q = wt([["?", 2.5]], RED, 1.5, 0.6); q.position.set(x, y, 0.12); q.visible = false; lid.add(q); q.userData.p = [x, y]; return q; });
const mine = card(RED); lid.add(mine);
const gIn = gears(VIOLET); lid.add(gIn); // the original's inside
const qMine = wt([["?", 2.5]], RED, 1.5, 0.55); qMine.visible = false; lid.add(qMine);
const xMark = new THREE.Group(); lid.add(xMark);
xMark.add(tube([-0.3, -0.24, 0], [0.3, 0.24, 0], 0.035, glow(RED, 2.0)), tube([0.3, -0.24, 0], [-0.3, 0.24, 0], 0.035, glow(RED, 2.0)));
const arrow = new THREE.Group(); lid.add(arrow); // "copy" arrow between the two cards
arrow.add(tube([-0.12, 0, 0], [0.1, 0, 0], 0.02, glow(WHITE, 0.9)));
const head = new THREE.Mesh(new THREE.ConeGeometry(0.05, 0.1, 3), glow(WHITE, 0.9)); head.rotation.z = -Math.PI / 2; head.position.x = 0.13; arrow.add(head);

// ---------- s3: REA icon, $0, the lens, no-code plate ----------
function iconTex() {
  const c = document.createElement("canvas"); c.width = 512; c.height = 512; const x = c.getContext("2d");
  x.fillStyle = "#1f8a52"; x.beginPath(); x.roundRect(16, 16, 480, 480, 110); x.fill();
  x.strokeStyle = "#ffffff"; x.lineWidth = 34; x.beginPath(); x.arc(225, 200, 105, 0, 7); x.stroke(); // magnifier
  x.lineCap = "round"; x.lineWidth = 46; x.beginPath(); x.moveTo(300, 278); x.lineTo(390, 368); x.stroke();
  x.fillStyle = "#ffffff"; x.font = "900 120px Inter, Arial, sans-serif"; x.textAlign = "center"; x.textBaseline = "middle"; x.fillText("REA", 256, 430);
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t;
}
const icon = new THREE.Mesh(new THREE.PlaneGeometry(0.72, 0.72), new THREE.MeshBasicMaterial({ map: iconTex(), transparent: true, toneMapped: false, color: 0xc0c0c0 }));
icon.visible = false; lid.add(icon);
const plate = (txt, hex, w = 0.9, h = 0.52) => { const gp = new THREE.Group(); gp.add(rbox(w, h, 0.05, 0.06, mDark)); plane(w + 0.03, h + 0.03, glow(hex, 0.9), 0, 0, -0.03, gp); const t = wt([txt], hex, 1.4, w * 0.9); t.position.z = 0.03; gp.add(t); lid.add(gp); gp.visible = false; return gp; };
const zero = plate("$0", GREEN), code = plate("</>", GREEN);
const noSlash = new THREE.Mesh(new THREE.PlaneGeometry(0.06, 0.62), glow(ORANGE, 1.6)); noSlash.rotation.z = 0.9; noSlash.position.z = 0.05; code.add(noSlash);
const app3 = card(VIOLET); lid.add(app3);
const g3 = gears(GREEN); lid.add(g3);
const lens = new THREE.Group(); lid.add(lens); lens.visible = false;
lens.add(new THREE.Mesh(new THREE.TorusGeometry(0.26, 0.03, 10, 48), glow(GREEN, 1.6)));
const glass = new THREE.Mesh(new THREE.CircleGeometry(0.25, 40), new THREE.MeshBasicMaterial({ color: 0x3dff8a, transparent: true, opacity: 0.08, toneMapped: false, depthWrite: false })); lens.add(glass);
lens.add(tube([0.19, -0.19, 0], [0.4, -0.4, 0], 0.04, std(0xd8d4f0, 0x3a3060, 0.3, 0.8)));

// ---------- s4: chat bubble; the app splits into UI / gears / binary ----------
const bubble = new THREE.Group(); lid.add(bubble); bubble.visible = false;
bubble.add(rbox(1.3, 0.3, 0.04, 0.1, std(0x6a5ff0, 0x2a2090, 0.35, 0.2)));
const tail = new THREE.Mesh(new THREE.CircleGeometry(0.07, 3), std(0x6a5ff0, 0x2a2090, 0.35, 0.2)); tail.position.set(-0.5, -0.16, 0); tail.rotation.z = -Math.PI / 2; bubble.add(tail);
const bt = wt(["HOW DOES IT WORK?"], WHITE, 1.0, 1.15); bt.position.z = 0.025; bubble.add(bt);
const L4 = new THREE.Group(); L4.position.set(0, 0.72, 0.08); lid.add(L4); L4.visible = false;
function binTex() {
  const c = document.createElement("canvas"); c.width = 512; c.height = 352; const x = c.getContext("2d");
  x.fillStyle = "#061a10"; x.fillRect(0, 0, 512, 352); x.fillStyle = "#3dff8a"; x.font = "700 30px monospace";
  for (let r = 0; r < 11; r++) { let s = ""; for (let i = 0; i < 24; i++) s += ((r * 7 + i * 13 + ((r * i) % 5)) % 3) ? "1" : "0"; x.fillText(s, 16, 30 + r * 31); }
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.wrapS = t.wrapT = THREE.RepeatWrapping; return t;
}
const BIN = binTex();
const binMat = new THREE.MeshBasicMaterial({ map: BIN, toneMapped: false, color: 0x909090 });
const lBin = plane(0.9, 0.62, binMat, 0, 0, 0, L4);
const binEdge = plane(0.94, 0.66, glow(GREEN, 0.9), 0, 0, -0.01, L4);
const lGear = gears(VIOLET); lGear.visible = true; L4.add(lGear);
const lUI = card(VIOLET); lUI.visible = true; L4.add(lUI);

// ---------- s5: three explained steps with evidence checks; your working version ----------
const steps = [0, 1, 2].map((i) => {
  const gp = new THREE.Group(); gp.position.set(-0.05, 1.18 - 0.36 * i, 0.08); lid.add(gp); gp.visible = false;
  gp.add(rbox(1.5, 0.28, 0.04, 0.06, mDark)); plane(1.53, 0.31, glow(VIOLET, 0.6), 0, 0, -0.025, gp);
  const n = wt([String(i + 1)], WHITE, 1.0, 0.6); n.position.set(-0.6, 0, 0.03); gp.add(n);
  plane(0.7, 0.035, mLine, -0.05, 0.04, 0.025, gp); plane(0.5, 0.035, mLine, -0.15, -0.05, 0.025, gp);
  const chk = new THREE.Group(); chk.position.set(0.58, 0, 0.04); gp.add(chk);
  chk.add(tube([-0.09, 0.0, 0], [-0.03, -0.07, 0], 0.025, glow(GREEN, 1.8)), tube([-0.03, -0.07, 0], [0.1, 0.09, 0], 0.025, glow(GREEN, 1.8)));
  gp.userData.chk = chk; return gp;
});
const yours = card(GREEN); lid.add(yours);

// ---------- s6: three kinds of targets, local shield, three agents ----------
const kinds = ["NATIVE APPS", "ELECTRON", "WEBSITES"].map((n, i) => { const p = plate(n, VIOLET, 0.72, 0.36); p.position.set(-0.78 + 0.78 * i, 0.85, 0.12); return p; });
const shield = (() => {
  const s = new THREE.Shape(); s.moveTo(0, 0.3); s.quadraticCurveTo(0.14, 0.24, 0.26, 0.24); s.quadraticCurveTo(0.27, -0.12, 0, -0.32); s.quadraticCurveTo(-0.27, -0.12, -0.26, 0.24); s.quadraticCurveTo(-0.14, 0.24, 0, 0.3);
  const gp = new THREE.Group(); gp.visible = false; lid.add(gp);
  gp.add(new THREE.Mesh(new THREE.ExtrudeGeometry(s, { depth: 0.05, bevelEnabled: true, bevelSize: 0.015, bevelThickness: 0.015, bevelSegments: 2 }), std(0x1f7a4a, 0x0f5a33, 0.4, 0.2)));
  gp.add(tube([-0.11, 0.0, 0.08], [-0.03, -0.09, 0.08], 0.025, glow(WHITE, 1.2)), tube([-0.03, -0.09, 0.08], [0.12, 0.1, 0.08], 0.025, glow(WHITE, 1.2)));
  return gp;
})();
const agents = ["CLAUDE CODE", "CODEX", "CURSOR"].map((n, i) => { const p = plate(n, GREEN, 1.1, 0.3); p.position.set(0, 1.25 - 0.38 * i, 0.12); return p; });

// ---------- s3: GitHub star ----------
const starShape = new THREE.Shape();
for (let i = 0; i < 10; i++) { const a = Math.PI / 2 + (i * Math.PI) / 5, r = i % 2 ? 0.17 : 0.4; starShape[i ? "lineTo" : "moveTo"](Math.cos(a) * r, Math.sin(a) * r); }
const star = new THREE.Mesh(new THREE.ExtrudeGeometry(starShape, { depth: 0.08, bevelEnabled: true, bevelSize: 0.03, bevelThickness: 0.03, bevelSegments: 2 }), glow(ORANGE, 1.5));
root.add(star);

// ---------- captions ----------
title("NEVER GUESS HOW IT WORKS");
cap("s1", "exploring", ["EXPLORING GITHUB REPOS"], WHITE, { until: "s1" });
cap("s2", "copy", ["YOU COPY WHAT YOU SEE"], RED, { until: ["s2", "miss"] });
cap("s2", "miss", ["YOU MISS WHAT'S INSIDE"], RED, { until: ["s2", "never"] });
cap("s2", "never", ["IT NEVER WORKS THE SAME"], RED, { boom: 0.5 });
cap("s3", "rea", ["REA"], GREEN, { until: ["s3", "almost"], boom: 0.5 });
cap("s3", "almost", ["ALMOST 460,000 STARS", "IN 7 MONTHS"], ORANGE, { until: ["s3", "free"], boom: 0.5 });
cap("s3", "free", ["IT'S FREE"], GREEN, { until: ["s3", "look"] });
cap("s3", "look", ["YOUR AI LOOKS INSIDE"], GREEN, { until: ["s3", "without"] });
cap("s3", "without", ["NO SOURCE CODE NEEDED"], GREEN);
cap("s4", "ask", ["ASK YOUR AI"], VIOLET, { until: ["s4", "opens"] });
cap("s4", "opens", ["IT OPENS THE APP"], VIOLET, { until: ["s4", "down"], boom: 0.4 });
cap("s4", "down", ["DOWN TO THE BINARY"], GREEN, { boom: 0.4 });
cap("s5", "explains", ["EXPLAINS THE FEATURE"], VIOLET, { until: ["s5", "shows"] });
cap("s5", "shows", ["SHOWS THE EVIDENCE"], GREEN, { until: ["s5", "builds"] });
cap("s5", "builds", ["BUILDS YOUR VERSION"], GREEN, { boom: 0.5 });
cap("s6", "native", ["APPS AND WEBSITES"], VIOLET, { until: ["s6", "runs"] });
cap("s6", "runs", ["RUNS ON YOUR COMPUTER"], GREEN, { until: ["s6", "claude"] });
cap("s6", "claude", ["CLAUDE CODE, CODEX, CURSOR"], GREEN);
endCard(["DON'T GUESS HOW IT WORKS.", "LOOK INSIDE."]);
boom("s2", "same", 0.6);

// ---------- timings (global seconds) ----------
const T = {
  love: g("s1", "love"), never1: g("s1", "never"), s2: S.s2[0], copy: g("s2", "copy"), miss: g("s2", "miss"), never2: g("s2", "never"), same: g("s2", "same"),
  s3: S.s3[0], almost: g("s3", "almost"), free: g("s3", "free"), look: g("s3", "look"), without: g("s3", "without"),
  s4: S.s4[0], opens: g("s4", "opens"), down: g("s4", "down"),
  s5: S.s5[0], shows: g("s5", "shows"), builds: g("s5", "builds"),
  s6: S.s6[0], electron: g("s6", "electron"), websites: g("s6", "websites"), runs: g("s6", "runs"), claude: g("s6", "claude"), codex: g("s6", "codex"), cursor: g("s6", "cursor"),
  s7: S.s7[0], s8: S.s8[0],
};
const AG_AT = [T.claude, T.codex, T.cursor], KI_AT = [T.s6, T.electron, T.websites];

// ---------- shots: [cx,cy,cz, lx,ly,lz, fov] ----------
const SH = [
  { at: 0, K: [[0, [0.3, 1.8, 5.6, 0, 0.9, -0.5, 48]], [S.s2[0], [0.1, 1.7, 5.1, 0, 0.95, -0.6, 48]]] },
  { at: T.s2, K: [[0, [-0.5, 1.6, 5.2, 0, 0.95, -0.6, 46]], [3, [0.3, 1.6, 5.0, 0, 0.95, -0.6, 46]]] },
  { at: T.never2 - 0.15, K: [[0, [0.2, 1.8, 5.0, 0, 1.0, -0.6, 46]], [1.5, [0.1, 1.8, 4.8, 0, 1.0, -0.6, 46]]] },
  { at: T.s3, K: [[0, [-0.6, 2.1, 5.8, 0, 1.0, -0.6, 48]], [3.6, [0.2, 1.8, 5.2, 0, 1.0, -0.6, 46]]] },
  { at: T.look - 0.1, K: [[0, [0.5, 1.7, 5.2, 0, 0.95, -0.6, 46]], [2.8, [0.2, 1.6, 5.0, 0, 0.95, -0.6, 46]]] },
  { at: T.s4, K: [[0, [-0.4, 1.7, 5.1, 0, 0.95, -0.6, 46]], [1.7, [-0.1, 1.7, 5.0, 0, 0.95, -0.6, 46]]] },
  { at: T.opens - 0.1, K: [[0, [2.8, 1.8, 4.2, 0, 0.9, -0.3, 48]], [2.7, [2.5, 1.9, 4.5, 0, 0.9, -0.3, 48]]] },
  { at: T.s5, K: [[0, [0.4, 1.7, 5.2, 0, 0.95, -0.6, 46]], [3.9, [0.1, 1.7, 5.0, 0, 0.95, -0.6, 46]]] },
  { at: T.s6, K: [[0, [-0.3, 1.7, 5.3, 0, 0.95, -0.6, 46]], [2.4, [0.2, 1.7, 5.0, 0, 0.95, -0.6, 46]]] },
  { at: T.claude - 0.1, K: [[0, [0.4, 1.8, 5.0, 0, 0.95, -0.6, 46]], [2.2, [0.1, 1.8, 5.2, 0, 0.95, -0.6, 46]]] },
  { at: T.s7, calm: 1, K: [[0, [0.2, 1.9, 5.8, 0, 0.95, -0.6, 48]], [2, [0.4, 2.0, 6.2, 0, 0.95, -0.6, 48]]] },
];

run("rea-world", (t) => {
  root.visible = t < T.s8 - 0.12; // hide the scene before the CTA fades in
  const wrong = t < T.s3;
  accent.material.color.set(wrong ? (t >= T.never1 ? RED : VIOLET) : GREEN).multiplyScalar(1.6);
  mScreen.color.set(wrong ? 0x0b0a26 : 0x0a1a1a);

  // s1: their app with a toggle that flips on and off; heart on "love", red ? on "never"
  const toLeft = sm(T.s2, T.s2 + 0.4, t);
  show(theirs, sm(S.s1[0], S.s1[0] + 0.3, t) * (wrong ? 1 : 0), 1.3 - 0.45 * toLeft);
  theirs.position.set(-0.55 * toLeft, 0.82, 0.06);
  setToggle(theirs, blink(t, 0.3));
  show(heart, sm(T.love - 0.1, T.love + 0.2, t) * (1 - sm(T.never1 - 0.1, T.never1 + 0.1, t)), 1);
  heart.position.set(0.48, 1.22, 0.14); heart.rotation.y = 0.3 * Math.sin(t * 3);
  qs.forEach((q, i) => {
    const k = sm(T.never1 + 0.12 * i, T.never1 + 0.2 + 0.12 * i, t) * (1 - sm(T.s2 - 0.15, T.s2, t));
    q.visible = k > 0.01; q.scale.setScalar(Math.max(1e-3, k)); q.position.y = q.userData.p[1] + 0.03 * Math.sin(t * 5 + i);
  });

  // s2: copy arrow, your red copy on the right; their gears show on "miss", your copy has a "?"; on "never" it jams + X
  show(arrow, sm(T.copy, T.copy + 0.2, t) * (wrong ? 1 : 0), 1); arrow.position.set(0.02, 0.82, 0.1);
  show(mine, sm(T.copy + 0.1, T.copy + 0.4, t) * (wrong ? 1 : 0), 0.85);
  const jam = sm(T.never2, T.never2 + 0.2, t);
  mine.position.set(0.6 + 0.025 * jam * Math.sin(t * 45) * (1 - sm(T.same, T.same + 0.4, t)), 0.82, 0.06);
  setToggle(mine, t < T.never2 ? blink(t, T.copy + 0.2) : 0.35, RED); // stuck half way
  mine.userData.mTrack.emissive.lerp(new THREE.Color(RED).multiplyScalar(0.6), jam);
  const insideK = sm(T.miss - 0.05, T.miss + 0.25, t) * (wrong ? 1 : 0);
  show(gIn, insideK, 0.8); gIn.position.set(-0.55, 0.84, 0.14); gIn.userData.spin(t);
  theirs.userData.knob.visible = theirs.userData.track.visible = insideK < 0.5; // gears take the toggle's place
  show(qMine, insideK, 0.9); qMine.position.set(0.6, 0.78, 0.12);
  mine.userData.knob.visible = mine.userData.track.visible = !(insideK > 0.5 && t < T.never2);
  show(xMark, sm(T.same - 0.1, T.same + 0.1, t) * (wrong ? 1 : 0), 1); xMark.position.set(0.6, 0.82, 0.16);
  qMine.visible = qMine.visible && t < T.same - 0.1;

  // s3: icon on "Instead", star on "Almost", $0 on "free", lens looks inside on "look", code plate on "without"
  show(icon, sm(T.s3, T.s3 + 0.25, t) * (1 - sm(T.free - 0.08, T.free, t)), 1);
  icon.position.set(0, 0.84, 0.25); icon.rotation.y = 0.25 * Math.sin((t - T.s3) * 2);
  show(zero, sm(T.free - 0.1, T.free + 0.15, t) * (1 - sm(T.look - 0.15, T.look, t)), 1); zero.position.set(0, 0.82, 0.22);
  const lk = sm(T.look - 0.1, T.look + 0.2, t) * (1 - sm(T.without - 0.15, T.without, t));
  show(app3, lk, 1.3); app3.position.set(0, 0.82, 0.06); setToggle(app3, blink(t, T.look));
  const sweep = sm(T.look, T.look + 0.6, t);
  show(lens, lk, 1); lens.position.set(-0.9 + 0.9 * sweep, 0.78, 0.3);
  show(g3, lk * sweep, 0.75); g3.position.set(0, 0.78, 0.16); g3.userData.spin(t);
  app3.userData.knob.visible = app3.userData.track.visible = sweep < 0.6;
  show(code, sm(T.without - 0.1, T.without + 0.15, t) * (1 - sm(T.s4 - 0.08, T.s4, t)), 1); code.position.set(0, 0.82, 0.22);

  // s4: bubble asks; the card on screen splits into UI / gears / binary
  const s4on = win(t, T.s4 - 0.05, T.s5);
  show(bubble, sm(T.s4 - 0.05, T.s4 + 0.15, t) * (1 - sm(T.opens - 0.1, T.opens + 0.1, t)), 1); bubble.position.set(-0.2, 1.3, 0.12);
  L4.visible = s4on; L4.scale.setScalar(Math.max(1e-3, sm(T.s4 - 0.05, T.s4 + 0.2, t)));
  const ex = sm(T.opens, T.opens + 0.5, t) * (1 - sm(T.s5 - 0.25, T.s5, t));
  lUI.position.z = 0.03 + 1.0 * ex; lGear.position.z = 0.02 + 0.5 * ex; lGear.userData.spin(t); lGear.scale.setScalar(0.9);
  setToggle(lUI, blink(t, T.s4));
  lGear.visible = ex > 0.05; lBin.visible = binEdge.visible = ex > 0.05;
  BIN.offset.y = t * 0.25;
  binMat.color.set(0x909090).multiplyScalar(1 + 0.5 * sm(T.down, T.down + 0.3, t));

  // s5: steps appear, evidence checks tick, then your green version works
  steps.forEach((s, i) => {
    const k = sm(T.s5 + 0.1 + 0.15 * i, T.s5 + 0.3 + 0.15 * i, t) * (1 - sm(T.builds - 0.15, T.builds, t));
    show(s, k, 1);
    show(s.userData.chk, sm(T.shows + 0.15 * i, T.shows + 0.3 + 0.15 * i, t), 1);
  });
  const yk = sm(T.builds - 0.05, T.builds + 0.3, t) * (1 - sm(T.s6 - 0.15, T.s6, t));
  show(yours, yk, 1.3); yours.position.set(0, 0.82, 0.06); setToggle(yours, blink(t, T.builds + 0.2));

  // s6: three kinds of targets, then a green shield on the screen, then the three agents
  kinds.forEach((p, i) => show(p, sm(KI_AT[i] - 0.1, KI_AT[i] + 0.15, t) * (1 - sm(T.runs - 0.15, T.runs, t)), 1));
  show(shield, sm(T.runs - 0.1, T.runs + 0.2, t) * (1 - sm(T.claude - 0.08, T.claude, t)), 1.6); shield.position.set(0, 0.85, 0.15);
  shield.rotation.y = 0.3 * Math.sin((t - T.runs) * 2.5);
  agents.forEach((p, i) => show(p, sm(AG_AT[i] - 0.1, AG_AT[i] + 0.15, t) * (1 - sm(T.s7 - 0.15, T.s7, t)), 1));

  // s7: the app with its gears showing under the lens while the end card is up
  const e7 = sm(T.s7, T.s7 + 0.3, t);
  if (t >= T.s7) {
    show(app3, e7, 1.3); app3.userData.knob.visible = app3.userData.track.visible = false;
    show(g3, e7, 0.75); show(lens, e7, 1); lens.position.set(0, 0.78, 0.3);
  }

  // s3: the star pops in above the laptop while the star count is on screen (2-line caption: smaller + lower)
  const sk = sm(T.almost - 0.1, T.almost + 0.25, t) * (1 - sm(T.free - 0.1, T.free, t));
  star.visible = sk > 0.01; star.scale.setScalar(0.42 * sk * (1 + 0.08 * Math.sin(t * 6)));
  star.position.set(0, 1.97, -0.3); star.rotation.y = 0.35 * Math.sin((t - T.almost) * 2.5);

  const { punch } = shoot(SH, t);
  const spike = overlays(t);
  bloom.strength = Math.min(1.45, 1.0 + 1.2 * punch * punch + spike);
});
