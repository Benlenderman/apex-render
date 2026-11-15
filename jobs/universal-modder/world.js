// NEVER MOD A GAME BLIND (Universal Modder). Laptop running a blocky game on a dark desk; wrong = guessed files, crash, saves wiped;
// right = AI agent: backs up saves, finds the engine, reads code, makes art/3D/sound, tests in game, leaves notes for the next AI.
import { THREE, S, g, sm, scene, bloom, glow, VIOLET, ORANGE, RED, GREEN, WHITE, shoot, run } from "./kit.js";
import { title, cap, boom, endCard, overlays, fitText } from "./extra.js";

import { RoundedBoxGeometry } from "three/addons/geometries/RoundedBoxGeometry.js";
const root = new THREE.Group(); scene.add(root);
const std = (c, e, r = 0.45, m = 0.25) => new THREE.MeshStandardMaterial({ color: c, emissive: e, roughness: r, metalness: m });
const rbox = (w, h, d, r, mat) => new THREE.Mesh(new RoundedBoxGeometry(w, h, d, 4, r), mat);
const mBody = std(0x4a42c8, 0x1c1766, 0.35, 0.35), mDark = std(0x14123a, 0x07061a, 0.6, 0.2), mLav = std(0xc9c0ff, 0x4a3fb0, 0.4, 0.1);
const wt = (lines, hex, k, w) => { const m = fitText(lines, hex, k, w); m.material.depthTest = true; m.renderOrder = 1; m.visible = true; return m; };
const plane = (w, h, mat, x, y, z, parent) => { const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), mat); m.position.set(x, y, z); parent.add(m); return m; };
const show = (o, k, s = 1) => { o.visible = k > 0.01; o.scale.setScalar(Math.max(1e-3, s * k)); };
const texOf = (c) => { const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.magFilter = THREE.NearestFilter; return t; };
const canvas = (w, h) => { const c = document.createElement("canvas"); c.width = w; c.height = h; return [c, c.getContext("2d")]; };

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

// ---------- pixel hero (8 x 12) ----------
const HERO = ["..hhhh..", ".hhhhhh.", ".hssssh.", ".sesses.", ".ssssss.", "..ssss..", ".tttttt.", "sttttttS", "sttttttS", ".pppppp.", ".pp..pp.", ".bb..bb."];
const HC = { h: "#5a3a1a", s: "#f0b890", e: "#2a2050", t: "#2fd0c0", S: "#f0b890", p: "#3a4ad0", b: "#2a2238" };
const drawHero = (x, X, Y, px) => HERO.forEach((row, j) => [...row].forEach((ch, i) => { if (HC[ch]) { x.fillStyle = HC[ch]; x.fillRect(X + i * px, Y + j * px, px, px); } }));

// ---------- the game on screen: blocky hills, tree, sun, hero ----------
function gameTex(withHero) {
  const [c, x] = canvas(768, 480), B = 32;
  const sky = x.createLinearGradient(0, 0, 0, 320); sky.addColorStop(0, "#3a2a9a"); sky.addColorStop(1, "#8a7cf8");
  x.fillStyle = sky; x.fillRect(0, 0, 768, 480);
  x.fillStyle = "#fff0a0"; x.fillRect(560, 60, 80, 80);
  x.fillStyle = "#e8e4ff"; [[90, 90, 4], [330, 60, 3]].forEach(([a, b, n]) => x.fillRect(a, b, n * B, B));
  const H = [9, 9, 9, 8, 8, 8, 9, 9, 10, 10, 10, 9, 9, 8, 8, 8, 9, 9, 9, 10, 10, 10, 10, 10];
  H.forEach((h, i) => { const y = h * B; x.fillStyle = "#3fbf6a"; x.fillRect(i * B, y, B, B); x.fillStyle = "#7a4a2a"; x.fillRect(i * B, y + B, B, 480 - y - B);
    x.fillStyle = "rgba(0,0,0,0.15)"; for (let k = y + B; k < 480; k += B) x.fillRect(i * B, k, B, 2); x.fillRect(i * B, y, 2, 480 - y); });
  x.fillStyle = "#6a3a1a"; x.fillRect(19 * B, 6 * B, B, 4 * B); x.fillStyle = "#2a9a4a"; x.fillRect(17.5 * B, 3.5 * B, 4 * B, 3 * B);
  if (withHero) drawHero(x, 7 * B, 8 * B - 12 * 8, 8);
  return texOf(c);
}
const mGame = new THREE.MeshBasicMaterial({ map: gameTex(true), toneMapped: false, color: 0xb8b8b8 });
const gamePic = plane(2.0, 1.25, mGame, 0, 0.82, 0.04, lid);
const gFrame = new THREE.LineSegments(new THREE.EdgesGeometry(new THREE.PlaneGeometry(2.04, 1.29)), new THREE.LineBasicMaterial({ color: new THREE.Color(GREEN).multiplyScalar(1.8), toneMapped: false }));
gFrame.position.z = 0.002; gamePic.add(gFrame);

// ---------- file cards ----------
function makeFile(hex, txt) {
  const gp = new THREE.Group();
  gp.add(rbox(0.56, 0.72, 0.06, 0.05, mLav));
  const band = plane(0.46, 0.2, glow(hex, 1.1), 0, -0.12, 0.032, gp);
  const corner = new THREE.Mesh(new THREE.CircleGeometry(0.09, 3), glow(ORANGE, 1.4)); corner.position.set(0.19, 0.27, 0.033); corner.rotation.z = Math.PI / 4; gp.add(corner);
  [0.14, 0.06].forEach((y) => plane(0.3, 0.025, new THREE.MeshBasicMaterial({ color: 0x6a5fd0 }), -0.05, y, 0.032, gp));
  const t = wt([txt], WHITE, 1.0, 0.4); t.position.set(0, -0.12, 0.036); gp.add(t);
  gp.userData.band = band; gp.visible = false; return gp;
}
const setBand = (f, hex, k = 1.1) => f.userData.band.material.color.set(hex).multiplyScalar(k);
const check = (hex, s = 1) => { const gp = new THREE.Group(); const a = plane(0.09 * s, 0.24 * s, glow(hex, 1.8), -0.08 * s, -0.04 * s, 0, gp); a.rotation.z = 0.8; const b = plane(0.09 * s, 0.46 * s, glow(hex, 1.8), 0.07 * s, 0.04 * s, 0, gp); b.rotation.z = -0.6; return gp; };
const plate = (txt, hex, w = 0.9, h = 0.52, k = 1.4) => { const gp = new THREE.Group(); gp.add(rbox(w, h, 0.05, 0.06, mDark)); const ring = plane(w + 0.03, h + 0.03, glow(hex, 0.9), 0, 0, -0.03, gp); const t = wt([txt], hex === VIOLET ? WHITE : hex, k, w * 0.9); t.position.z = 0.03; gp.add(t); gp.userData.ring = ring; lid.add(gp); gp.visible = false; return gp; };

// ---------- s1: a wrench and a red question mark ----------
const mSteel = std(0xd8d4f0, 0x3a3060, 0.3, 0.8);
const wrench = new THREE.Group(); lid.add(wrench);
const wh = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.55, 0.05), mSteel); wh.position.y = -0.2; wrench.add(wh);
const wj = new THREE.Mesh(new THREE.TorusGeometry(0.11, 0.045, 10, 24, Math.PI * 1.5), mSteel); wj.position.y = 0.15; wj.rotation.z = -Math.PI * 0.25 + Math.PI; wrench.add(wj);
const qMark = wt(["?"], RED, 1.6, 0.9); lid.add(qMark);

// ---------- s2: guessed game files, crash window, save wiped ----------
const F2 = ["PAK", "DLL", "SAV"].map((n, i) => { const f = makeFile(VIOLET, n); f.position.set(-0.7 + 0.7 * i, 0.55, 0.12); lid.add(f); return f; });
const qs = F2.map((f, i) => { const q = wt(["?"], RED, 1.6, 0.4); q.position.set(-0.7 + 0.7 * i, 1.08, 0.13); lid.add(q); return q; });
const crash = new THREE.Group(); crash.position.set(0, 1.12, 0.3); lid.add(crash);
crash.add(rbox(1.3, 0.62, 0.05, 0.05, std(0x3a0610, 0x200206, 0.5, 0.2)));
plane(1.24, 0.1, glow(RED, 1.2), 0, 0.24, 0.03, crash);
[0.75, -0.75].forEach((r) => { const b = plane(0.07, 0.38, glow(RED, 2.0), 0, -0.04, 0.032, crash); b.rotation.z = r; });
const crashGlow = new THREE.PointLight(0xff3040, 3, 4, 1.6); crashGlow.position.set(0, 0, 0.8); crash.add(crashGlow);

// ---------- s3: app icon (gamepad on a violet tile), $0, AI agent, game tiles ----------
function iconTex() {
  const [c, x] = canvas(512, 512);
  x.fillStyle = "#6a4cf0"; x.beginPath(); x.roundRect(16, 16, 480, 480, 110); x.fill();
  x.fillStyle = "#ffffff"; x.beginPath(); x.roundRect(86, 186, 340, 160, 80); x.fill();
  [[150, 330], [362, 330]].forEach(([a, b]) => { x.beginPath(); x.arc(a, b, 62, 0, 7); x.fill(); });
  x.fillStyle = "#6a4cf0"; x.fillRect(136, 246, 72, 24); x.fillRect(160, 222, 24, 72);
  x.fillStyle = "#2fd070"; x.beginPath(); x.arc(350, 236, 18, 0, 7); x.fill(); x.fillStyle = "#ff8a3a"; x.beginPath(); x.arc(390, 276, 18, 0, 7); x.fill();
  return texOf(c);
}
const icon = new THREE.Mesh(new THREE.PlaneGeometry(0.72, 0.72), new THREE.MeshBasicMaterial({ map: iconTex(), transparent: true, toneMapped: false, color: 0xc0c0c0 }));
lid.add(icon);
const zero = plate("$0", GREEN);
function makeBot(eye = GREEN) {
  const b = new THREE.Group();
  b.add(rbox(0.56, 0.44, 0.3, 0.1, mBody));
  const face = rbox(0.44, 0.28, 0.02, 0.06, mDark); face.position.z = 0.15; b.add(face);
  const eyes = [-0.1, 0.1].map((x) => { const e = new THREE.Mesh(new THREE.CircleGeometry(0.045, 16), glow(eye, 1.8)); e.position.set(x, 0.01, 0.165); b.add(e); return e; });
  const ant = new THREE.Mesh(new THREE.CylinderGeometry(0.015, 0.015, 0.14, 8), mSteel); ant.position.y = 0.29; b.add(ant);
  const ball = new THREE.Mesh(new THREE.SphereGeometry(0.04, 12, 8), glow(ORANGE, 1.6)); ball.position.y = 0.37; b.add(ball);
  [-0.31, 0.31].forEach((x) => { const ear = rbox(0.06, 0.16, 0.16, 0.03, mDark); ear.position.x = x; b.add(ear); });
  b.userData.eyes = eyes; lid.add(b); b.visible = false; return b;
}
const bot = makeBot();
function tileTex(kind) {
  const [c, x] = canvas(256, 256);
  if (kind === 0) { x.drawImage(mGame.map.image, 120, 160, 400, 320, 0, 0, 256, 256); }
  else if (kind === 1) { x.fillStyle = "#1a1050"; x.fillRect(0, 0, 256, 256); x.fillStyle = "#3a3a5a"; x.beginPath(); x.moveTo(100, 60); x.lineTo(156, 60); x.lineTo(240, 256); x.lineTo(16, 256); x.fill();
    x.fillStyle = "#fff0a0"; for (let y = 80; y < 256; y += 46) x.fillRect(124, y, 8, 24); x.fillStyle = "#ff3a5a"; x.fillRect(150, 190, 40, 50); x.fillStyle = "#ffc0c8"; x.fillRect(156, 196, 28, 12); }
  else { x.fillStyle = "#06041a"; x.fillRect(0, 0, 256, 256); x.fillStyle = "#fff"; for (let i = 0; i < 40; i++) x.fillRect((i * 97) % 256, (i * 53) % 256, 3, 3);
    x.fillStyle = "#2fd0c0"; x.beginPath(); x.moveTo(128, 70); x.lineTo(180, 190); x.lineTo(76, 190); x.fill(); x.fillStyle = "#ff8a3a"; x.fillRect(110, 190, 36, 30); x.fillStyle = "#7a5cff"; x.beginPath(); x.arc(200, 70, 30, 0, 7); x.fill(); }
  return texOf(c);
}
const tiles = [0, 1, 2].map((k, i) => { const gp = new THREE.Group(); gp.add(rbox(0.52, 0.52, 0.04, 0.04, mBody)); plane(0.46, 0.46, new THREE.MeshBasicMaterial({ map: tileTex(k), toneMapped: false, color: 0xb0b0b0 }), 0, 0, 0.022, gp);
  gp.position.set(-0.62 + 0.62 * i, 0.5, 0.14); lid.add(gp); gp.visible = false; return gp; });

// ---------- s4: save backup, engines, code ----------
const sav4 = makeFile(GREEN, "SAV"); lid.add(sav4);
const savCopy = makeFile(GREEN, "SAV"); lid.add(savCopy);
const folder = new THREE.Group(); folder.position.set(0.55, 0.72, 0.12); lid.add(folder);
const mFold = std(0xffa040, 0x6a3008, 0.45, 0.1);
const fb = rbox(0.8, 0.6, 0.06, 0.05, mFold); folder.add(fb);
const ftab = rbox(0.3, 0.12, 0.06, 0.03, mFold); ftab.position.set(-0.22, 0.32, 0); folder.add(ftab);
const fl = wt(["BACKUP"], WHITE, 1.0, 0.6); fl.position.set(0, -0.12, 0.04); folder.add(fl);
const fCheck = check(GREEN, 0.8); fCheck.position.set(0, 0.1, 0.05); folder.add(fCheck);
folder.visible = false;
const ENG = ["UNITY", "UNREAL", "GODOT"].map((n, i) => { const p = plate(n, VIOLET, 0.62, 0.36, 1.0); p.position.set(-0.68 + 0.68 * i, 0.82, 0.14); return p; });
const code = new THREE.Group(); code.position.set(0, 0.82, 0.1); lid.add(code);
code.add(rbox(1.8, 1.1, 0.04, 0.05, mDark));
const CL = [[0.5, 0.0, VIOLET], [0.9, 0.1, GREEN], [0.7, 0.1, WHITE], [0.4, 0.2, ORANGE], [1.0, 0.2, GREEN], [0.6, 0.1, WHITE], [0.8, 0.0, VIOLET], [0.5, 0.1, GREEN]];
const clines = CL.map(([w, ind, hex], i) => { const m = plane(w, 0.05, glow(hex, hex === WHITE ? 0.5 : 0.9), -0.75 + ind + w / 2, 0.4 - i * 0.115, 0.025, code); m.userData.w = w; return m; });
const scan = plane(1.7, 0.02, glow(GREEN, 2.0), 0, 0, 0.03, code);
code.visible = false;

// ---------- s5: art, 3D model, sound, test in the running game ----------
const [hc, hx] = canvas(128, 160); drawHero(hx, 32, 32, 8);
const art = new THREE.Group(); art.add(rbox(0.56, 0.72, 0.05, 0.05, mLav)); plane(0.46, 0.58, new THREE.MeshBasicMaterial({ map: texOf(hc), toneMapped: false, color: 0xc0c0c0, transparent: true }), 0, 0, 0.03, art);
art.position.set(-0.68, 0.82, 0.14); lid.add(art); art.visible = false;
const crate = new THREE.Group(); crate.position.set(0, 0.82, 0.32); lid.add(crate);
const cb = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.4, 0.4), std(0xb07a3a, 0x3a2008, 0.6, 0.1)); crate.add(cb);
crate.add(new THREE.LineSegments(new THREE.EdgesGeometry(cb.geometry), new THREE.LineBasicMaterial({ color: new THREE.Color(GREEN).multiplyScalar(1.8), toneMapped: false })));
crate.visible = false;
const sound = new THREE.Group(); sound.position.set(0.68, 0.82, 0.14); lid.add(sound);
const bars = Array.from({ length: 7 }, (_, i) => { const b = new THREE.Mesh(new THREE.BoxGeometry(0.05, 1, 0.04), glow(i % 2 ? VIOLET : GREEN, 1.4)); b.position.x = -0.21 + 0.07 * i; sound.add(b); return b; });
sound.visible = false;
const mHero = new THREE.MeshBasicMaterial({ map: texOf(hc), toneMapped: false, color: 0xc0c0c0, transparent: true });
const heroIn = plane(0.2, 0.25, mHero, 0, 0, 0.06, lid);
const playCheck = check(GREEN, 1.0); lid.add(playCheck);

// ---------- s6: notes passed from one AI to the next ----------
function makeNote() {
  const gp = new THREE.Group(); gp.add(rbox(0.5, 0.64, 0.04, 0.04, mLav));
  plane(0.42, 0.13, glow(GREEN, 1.1), 0, 0.22, 0.025, gp);
  const t = wt(["NOTES"], WHITE, 1.0, 0.36); t.position.set(0, 0.22, 0.03); gp.add(t);
  [0.06, -0.04, -0.14, -0.24].forEach((y, i) => plane(i % 2 ? 0.26 : 0.34, 0.025, new THREE.MeshBasicMaterial({ color: 0x6a5fd0 }), -0.02, y, 0.025, gp));
  lid.add(gp); gp.visible = false; return gp;
}
const notes = [0, 1, 2].map(makeNote);
const bot1 = makeBot(), bot2 = makeBot();

// ---------- s3: GitHub star ----------
const starShape = new THREE.Shape();
for (let i = 0; i < 10; i++) { const a = Math.PI / 2 + (i * Math.PI) / 5, r = i % 2 ? 0.17 : 0.4; starShape[i ? "lineTo" : "moveTo"](Math.cos(a) * r, Math.sin(a) * r); }
const star = new THREE.Mesh(new THREE.ExtrudeGeometry(starShape, { depth: 0.08, bevelEnabled: true, bevelSize: 0.03, bevelThickness: 0.03, bevelSegments: 2 }), glow(ORANGE, 1.5));
root.add(star);

// ---------- captions ----------
title("NEVER MOD A GAME BLIND");
cap("s1", "exploring", ["EXPLORING GITHUB REPOS"], WHITE, { until: "s1" });
cap("s2", "guess", ["GUESSING AT FILES?"], RED, { until: ["s2", "crash"] });
cap("s2", "crash", ["THE GAME CRASHES"], RED, { until: ["s2", "wipe"], boom: 0.5 });
cap("s2", "wipe", ["SAVES WIPED"], RED, { boom: 0.5 });
cap("s3", "universal", ["UNIVERSAL MODDER"], GREEN, { until: ["s3", "almost"], boom: 0.5 });
cap("s3", "almost", ["ALMOST 9,700 STARS", "IN 6 WEEKS"], ORANGE, { until: ["s3", "free"], boom: 0.5 });
cap("s3", "free", ["IT'S FREE"], GREEN, { until: ["s3", "lets"] });
cap("s3", "lets", ["YOUR AI AGENT MODS IT"], GREEN, { until: ["s3", "almost"], untilN: 2 });
cap("s3", "almost", ["ALMOST ANY PC GAME"], GREEN, { n: 2 });
cap("s4", "backs", ["SAVES BACKED UP FIRST"], GREEN, { until: ["s4", "works"], boom: 0.4 });
cap("s4", "works", ["FINDS THE ENGINE"], VIOLET, { until: ["s4", "reads"] });
cap("s4", "reads", ["READS THE REAL CODE"], GREEN, { boom: 0.4 });
cap("s5", "art", ["ART"], VIOLET, { until: ["s5", "3d"] });
cap("s5", "3d", ["3D MODELS"], VIOLET, { until: ["s5", "sounds"] });
cap("s5", "sounds", ["SOUNDS"], VIOLET, { until: ["s5", "tests"] });
cap("s5", "tests", ["TESTED IN THE GAME"], GREEN, { boom: 0.5 });
cap("s6", "every", ["IT LEAVES NOTES"], GREEN, { until: ["s6", "so"] });
cap("s6", "so", ["THE NEXT AI STARTS AHEAD"], GREEN);
endCard(["DON'T GUESS.", "READ THE CODE."]);
boom("s2", "crash", 0.6);

// ---------- timings (global seconds) ----------
const T = {
  mod: g("s1", "mod"), blind: g("s1", "blind"),
  s2: S.s2[0], wrong: g("s2", "wrong"), crash: g("s2", "crash"), wipe: g("s2", "wipe"),
  s3: S.s3[0], almost: g("s3", "almost"), free: g("s3", "free"), lets: g("s3", "lets"), almost2: g("s3", "almost", 2), any: g("s3", "any"),
  s4: S.s4[0], first: g("s4", "first"), works: g("s4", "works"), engine: g("s4", "engine"), reads: g("s4", "reads"),
  s5: S.s5[0], d3: g("s5", "3d"), sounds: g("s5", "sounds"), tests: g("s5", "tests"), running: g("s5", "running"),
  s6: S.s6[0], leaves: g("s6", "leaves"), next: g("s6", "next"), left: g("s6", "left"),
  s7: S.s7[0], s8: S.s8[0],
};
const v = new THREE.Vector3(), v2 = new THREE.Vector3();
const pop = (a, b, t, d = 0.2) => sm(a - 0.05, a - 0.05 + d, t) * (t < b ? 1 : 0); // in at a, gone (hard) at b
const popOut = (a, b, t, d = 0.2) => sm(a - 0.05, a - 0.05 + d, t) * (1 - sm(b - 0.15, b, t)); // in at a, quick out ending at b

// ---------- shots: [cx,cy,cz, lx,ly,lz, fov] ----------
const SH = [
  { at: 0, K: [[0, [0.3, 1.8, 5.6, 0, 0.9, -0.5, 48]], [S.s2[0], [0.1, 1.7, 5.1, 0, 0.95, -0.6, 48]]] },
  { at: T.s2, K: [[0, [-0.5, 1.6, 5.2, 0, 0.95, -0.6, 46]], [2, [0.2, 1.6, 5.0, 0, 0.95, -0.6, 46]]] },
  { at: T.crash - 0.15, K: [[0, [-0.3, 1.8, 4.8, 0, 1.0, -0.6, 46]], [1.6, [-0.2, 1.8, 4.6, 0, 1.0, -0.6, 46]]] },
  { at: T.s3, K: [[0, [-0.6, 2.1, 5.8, 0, 1.0, -0.6, 48]], [4.4, [0.2, 1.8, 5.2, 0, 1.0, -0.6, 46]]] },
  { at: T.lets - 0.1, K: [[0, [0.5, 1.7, 5.2, 0, 0.95, -0.6, 46]], [3.4, [0.2, 1.6, 5.0, 0, 0.95, -0.6, 46]]] },
  { at: T.s4, K: [[0, [-0.4, 1.7, 5.0, 0, 0.95, -0.6, 46]], [1.4, [-0.2, 1.7, 4.9, 0, 0.95, -0.6, 46]]] },
  { at: T.works - 0.1, K: [[0, [0.4, 1.7, 5.1, 0, 0.95, -0.6, 46]], [1.5, [0.2, 1.7, 5.0, 0, 0.95, -0.6, 46]]] },
  { at: T.reads - 0.1, K: [[0, [0, 1.8, 4.9, 0, 1.0, -0.6, 46]], [1.2, [0, 1.8, 4.7, 0, 1.0, -0.6, 46]]] },
  { at: T.s5, K: [[0, [0.4, 1.7, 5.3, 0, 0.95, -0.6, 46]], [2.4, [0.1, 1.7, 5.1, 0, 0.95, -0.6, 46]]] },
  { at: T.tests - 0.1, K: [[0, [-0.3, 1.8, 5.0, 0, 1.0, -0.6, 46]], [2.0, [-0.1, 1.8, 4.8, 0, 1.0, -0.6, 46]]] },
  { at: T.s6, K: [[0, [0.3, 1.7, 5.2, 0, 0.95, -0.6, 46]], [4.2, [-0.2, 1.7, 5.0, 0, 0.95, -0.6, 46]]] },
  { at: T.s7, calm: 1, K: [[0, [0.2, 1.9, 5.8, 0, 0.95, -0.6, 48]], [2, [0.4, 2.0, 6.2, 0, 0.95, -0.6, 48]]] },
];

run("universal-modder-world", (t) => {
  root.visible = t < T.s8 - 0.12; // hide the scene before the CTA fades in
  const wrong = t < T.s3, red = t >= T.crash - 0.05 && wrong;
  accent.material.color.set(wrong ? (t >= T.blind ? RED : VIOLET) : GREEN).multiplyScalar(1.6);
  mScreen.color.set(red ? 0x2a0610 : wrong ? 0x0b0a26 : 0x0a1a1a);

  // the game picture: on in s1 (dims on "blind"), dim behind the s2 files, back in s5 "tests" and s7
  const gameOn = wrong || (t >= T.tests - 0.1 && t < T.s6) || t >= T.s7;
  gamePic.visible = gameOn;
  const dim = wrong ? (t < T.blind ? 1 : 0.35 - 0.15 * sm(T.crash - 0.05, T.crash + 0.1, t)) : 1;
  mGame.color.setScalar(0.72 * dim);
  gFrame.visible = t >= T.running - 0.1 || t >= T.s7;
  gamePic.scale.setScalar(t >= T.tests - 0.1 && t < T.s6 ? Math.max(1e-3, sm(T.tests - 0.1, T.tests + 0.15, t)) : 1);

  // s1: wrench on "mod", red ? on "blind"; hard cut at s2
  show(wrench, pop(T.mod, T.s2, t), 1); wrench.position.set(0.55, 0.85, 0.3); wrench.rotation.z = -0.5 + 0.25 * Math.sin((t - T.mod) * 5);
  show(qMark, pop(T.blind, T.s2, t), 3); qMark.position.set(-0.45, 0.85, 0.3);

  // s2: three files pop in with ? marks; DLL turns red and shakes on "wrong"; crash window; SAV falls on "wipe"
  F2.forEach((f, i) => {
    const k = pop(T.s2 + 0.1 * i, T.s3, t);
    f.visible = k > 0.01; f.scale.setScalar(Math.max(1e-3, 0.7 * k));
    const bad = i === 1 && t >= T.wrong;
    setBand(f, bad || red ? RED : VIOLET, bad ? 1.6 : 1.1);
    f.position.x = -0.7 + 0.7 * i + (bad && t < T.crash ? 0.03 * Math.sin(t * 60) : 0);
    if (i === 2) { const fall = sm(T.wipe, T.wipe + 0.45, t); f.position.y = 0.55 - 0.9 * fall; f.rotation.z = -0.8 * fall; f.scale.setScalar(Math.max(1e-3, 0.7 * k * (1 - fall))); f.visible = k > 0.01 && fall < 0.98; }
  });
  qs.forEach((q, i) => show(q, pop(T.s2 + 0.15 + 0.1 * i, T.crash - 0.05, t), 2));
  show(crash, pop(T.crash, T.s3, t, 0.15), 1);

  // s3: icon on "Instead", star on "almost", $0 on "free", AI agent + game tiles on "lets" / "almost any"
  show(icon, pop(T.s3, T.free - 0.05, t) * (1 - sm(T.free - 0.2, T.free - 0.05, t)), 1);
  icon.position.set(0, 0.84, 0.25); icon.rotation.y = 0.25 * Math.sin((t - T.s3) * 2);
  show(zero, popOut(T.free, T.lets - 0.05, t), 1); zero.position.set(0, 0.82, 0.22);
  const s3b = t < T.s4;
  show(bot, s3b ? sm(T.lets - 0.1, T.lets + 0.15, t) : 0, 0.9); bot.position.set(0, 1.15, 0.2); bot.rotation.y = 0.2 * Math.sin((t - T.lets) * 2);
  tiles.forEach((m, i) => { show(m, s3b ? sm(T.almost2 - 0.1 + 0.15 * i, T.almost2 + 0.1 + 0.15 * i, t) : 0, 0.95); m.position.z = 0.14 + 0.08 * Math.max(0, 1 - Math.abs(t - T.any - 0.2 - 0.25 * i) / 0.2); });

  // s4: SAV copies into BACKUP; engine tiles, one picked; code read with a scan line
  const k4 = pop(T.s4, T.works - 0.05, t) * (1 - sm(T.works - 0.2, T.works - 0.05, t));
  show(sav4, k4, 0.75); sav4.position.set(-0.6, 0.75, 0.14);
  const cp = sm(T.s4 + 0.35, T.first, t);
  show(savCopy, k4 * (cp > 0.01 && cp < 0.99 ? 1 : 0), 0.6); savCopy.position.set(-0.6 + 1.15 * cp, 0.75 + 0.25 * Math.sin(cp * Math.PI), 0.2);
  show(folder, k4, 0.9); fCheck.visible = t >= T.first;
  ENG.forEach((p, i) => {
    const k = pop(T.works + 0.1 * i, T.reads - 0.05, t) * (1 - sm(T.reads - 0.2, T.reads - 0.05, t)), pick = i === 0 && t >= T.engine;
    show(p, k, pick ? 1.15 : 0.95); p.userData.ring.material.color.set(pick ? GREEN : VIOLET).multiplyScalar(pick ? 1.6 : 0.9);
  });
  const kc = pop(T.reads, T.s5, t);
  show(code, kc, 1);
  clines.forEach((m, i) => { const r = sm(T.reads + 0.06 * i, T.reads + 0.2 + 0.06 * i, t); m.visible = r > 0.01; m.scale.x = Math.max(1e-3, r); m.position.x = -0.75 + CL[i][1] + (CL[i][0] * r) / 2; });
  scan.position.y = 0.45 - 0.9 * sm(T.reads + 0.1, T.s5 - 0.1, t);

  // s5: art card, spinning 3D crate, sound bars; then the hero walks in the running game with a green check
  const out5 = T.tests - 0.1;
  show(art, pop(T.s5, out5, t) * (1 - sm(out5 - 0.15, out5, t)), 0.95);
  show(crate, pop(T.d3, out5, t) * (1 - sm(out5 - 0.15, out5, t)), 1); crate.rotation.set(0.4, (t - T.d3) * 2.2, 0);
  show(sound, pop(T.sounds, out5, t) * (1 - sm(out5 - 0.15, out5, t)), 1);
  bars.forEach((b, i) => { const h = 0.12 + 0.3 * Math.abs(Math.sin(t * 9 + i * 1.3)); b.scale.y = h; });
  const s5g = t >= T.tests - 0.1 && t < T.s6;
  heroIn.visible = s5g; heroIn.position.set(-0.15 + 0.45 * sm(T.tests, T.s6, t), 0.62 + 0.04 * Math.abs(Math.sin(t * 10)), 0.06);
  show(playCheck, s5g ? sm(T.running - 0.1, T.running + 0.15, t) : 0, 1); playCheck.position.set(0.72, 1.2, 0.12);

  // s6: AI #1 with its notes; notes stack up, then slide over to AI #2
  const s6on = t >= T.s6 && t < T.s7;
  show(bot1, s6on ? sm(T.s6, T.s6 + 0.2, t) : 0, 0.85); bot1.position.set(-0.6, 1.1, 0.16);
  show(bot2, s6on ? sm(T.next - 0.1, T.next + 0.15, t) : 0, 0.85); bot2.position.set(0.6, 1.1, 0.16);
  const pass = sm(T.next, T.next + 0.6, t);
  notes.forEach((n, i) => {
    const k = s6on ? sm(T.s6 + 0.1 + (i ? T.leaves - T.s6 + 0.15 * (i - 1) : 0), T.s6 + 0.3 + (i ? T.leaves - T.s6 + 0.15 * (i - 1) : 0), t) : 0;
    show(n, k, 0.7);
    n.position.set(-0.6 + 1.2 * sm(T.next + 0.1 * i, T.next + 0.5 + 0.1 * i, t) + 0.05 * i, 0.5 + 0.03 * i, 0.16 + 0.02 * i);
    n.rotation.z = (i - 1) * 0.08;
  });
  bot2.userData.eyes.forEach((e) => e.scale.setScalar(1 + 0.5 * Math.max(0, 1 - Math.abs(t - T.left) / 0.25)));

  // s3: the star pops in above the laptop while the star count is on screen (2-line caption: smaller, lower)
  const sk = sm(T.almost - 0.1, T.almost + 0.25, t) * (1 - sm(T.free - 0.15, T.free + 0.1, t));
  star.visible = sk > 0.01; star.scale.setScalar(0.4 * sk * (1 + 0.08 * Math.sin(t * 6)));
  star.position.set(0, 1.9, -0.3); star.rotation.y = 0.35 * Math.sin((t - T.almost) * 2.5);

  void pass; void v; void v2;
  const { punch } = shoot(SH, t);
  const spike = overlays(t);
  bloom.strength = 1.0 + 1.2 * punch * punch + spike;
});
