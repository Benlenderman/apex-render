// NEVER RENT YOUR PHOTO EDITOR (PhotoCraft). Laptop with a photo editor on a dark desk; wrong = monthly bills pile on the screen,
// then a red padlock locks your files; right = the editor rebuilds itself: same menus and keys, PSD layers, 307/309 grid, edit stack, 3 OSes.
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
const bar = plane(2.4, 0.12, glow(VIOLET, 0.35), 0, 1.54, 0.037, lid);
const accent = plane(2.4, 0.015, glow(VIOLET, 1.6), 0, 1.475, 0.038, lid);
[-1.08, -0.98, -0.88].forEach((x, i) => { const d = new THREE.Mesh(new THREE.CircleGeometry(0.025, 16), glow([RED, ORANGE, GREEN][i], 1.2)); d.position.set(x, 1.54, 0.039); lid.add(d); });

// ---------- the photo (canvas: sunset over mountains and water) ----------
function photoTex() {
  const c = document.createElement("canvas"); c.width = 768; c.height = 512; const x = c.getContext("2d");
  const sky = x.createLinearGradient(0, 0, 0, 330); sky.addColorStop(0, "#3a2a8a"); sky.addColorStop(0.6, "#e0608a"); sky.addColorStop(1, "#ffb060");
  x.fillStyle = sky; x.fillRect(0, 0, 768, 340);
  x.fillStyle = "#fff0b0"; x.beginPath(); x.arc(470, 280, 62, 0, 7); x.fill();
  x.fillStyle = "#4a2f86"; x.beginPath(); x.moveTo(0, 340); x.lineTo(150, 170); x.lineTo(260, 270); x.lineTo(360, 150); x.lineTo(520, 340); x.fill();
  x.fillStyle = "#2c1e5e"; x.beginPath(); x.moveTo(300, 340); x.lineTo(560, 200); x.lineTo(768, 320); x.lineTo(768, 340); x.fill();
  const sea = x.createLinearGradient(0, 340, 0, 512); sea.addColorStop(0, "#d06a8e"); sea.addColorStop(1, "#1e1650");
  x.fillStyle = sea; x.fillRect(0, 340, 768, 172);
  x.fillStyle = "rgba(255,230,160,0.7)"; for (let i = 0; i < 6; i++) x.fillRect(420 - i * 6, 360 + i * 22, 100 + i * 12, 6);
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t;
}
const PHOTO = photoTex();
const mPhoto = new THREE.MeshBasicMaterial({ map: PHOTO, toneMapped: false, color: 0xb8b8b8 });
const photo = plane(1.5, 1.1, mPhoto, -0.15, 0.8, 0.04, lid);

// ---------- editor UI: tool strip, layers panel, menu words ----------
const tools = new THREE.Group(); tools.position.set(-1.08, 0.8, 0.04); lid.add(tools);
plane(0.14, 1.1, glow(VIOLET, 0.25), 0, 0, 0, tools);
for (let i = 0; i < 7; i++) plane(0.08, 0.08, glow(i === 1 ? GREEN : VIOLET, i === 1 ? 1.2 : 0.8), 0, 0.42 - i * 0.14, 0.002, tools);
const panel = new THREE.Group(); panel.position.set(0.9, 0.8, 0.04); lid.add(panel);
plane(0.46, 1.1, glow(VIOLET, 0.25), 0, 0, 0, panel);
const rows = [0, 1, 2, 3].map((i) => {
  const r = plane(0.4, 0.17, glow(VIOLET, i ? 0.45 : 0.9), 0, 0.4 - i * 0.22, 0.002, panel);
  const th = new THREE.Mesh(new THREE.PlaneGeometry(0.12, 0.12), i === 3 ? mPhoto : glow([GREEN, VIOLET, ORANGE][i], 0.9)); th.position.set(-0.12, 0, 0.002); r.add(th);
  plane(0.18, 0.025, glow(WHITE, 0.6), 0.07, 0, 0.002, r); return r;
});
const MENU = ["FILE", "EDIT", "IMAGE", "LAYER", "SELECT", "FILTER"];
const menu = new THREE.Group(); menu.position.set(0, 1.54, 0.04); lid.add(menu);
const MX = (i) => -0.62 + i * 0.31;
const menuHi = plane(0.27, 0.1, glow(VIOLET, 1.4), MX(3), 0, 0.001, menu);
MENU.forEach((w, i) => { const m = wt([w], WHITE, 1.0, 0.3); m.position.set(MX(i), 0, 0.003); menu.add(m); });
// dropdown under LAYER
const drop = new THREE.Group(); drop.position.set(MX(3) + 0.32, -0.08, 0.06); menu.add(drop);
const dropBg = rbox(0.82, 0.62, 0.02, 0.02, mDark); dropBg.position.set(0, -0.31, 0); drop.add(dropBg);
const DROWS = [["NEW LAYER", ""], ["DUPLICATE", "CMD J"], ["MERGE DOWN", "CMD E"], ["FLATTEN", ""]];
const dropHi = plane(0.78, 0.13, glow(VIOLET, 0.6), 0, -0.245, 0.012, drop);
DROWS.forEach(([a, b], i) => {
  const y = -0.1 - i * 0.145;
  const l = wt([a], WHITE, 0.95, 0.5); l.position.set(-0.13, y, 0.015); drop.add(l);
  if (b) { const r = wt([b], ORANGE, 1.2, 0.3); r.position.set(0.25, y, 0.015); drop.add(r); }
});
const cursor = new THREE.Mesh(new THREE.ConeGeometry(0.04, 0.12, 3), glow(WHITE, 0.7)); cursor.rotation.z = 0.5; lid.add(cursor);

// ---------- s1: monthly bills pile onto the screen ----------
const MONTHS = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN"];
const mBill = std(0xfff0f2, 0x3a1a20, 0.5, 0.05);
const bills = MONTHS.map((mo, i) => {
  const b = new THREE.Group(); lid.add(b);
  b.add(rbox(0.46, 0.6, 0.03, 0.03, mBill));
  plane(0.4, 0.14, glow(RED, 1.1), 0, 0.19, 0.017, b);
  const mt = wt([mo], WHITE, 1.0, 0.36); mt.position.set(0, 0.19, 0.02); b.add(mt);
  const d = wt(["$"], RED, 1.3, 0.5); d.position.set(0, -0.07, 0.02); b.add(d);
  [-0.21, -0.25].forEach((y) => plane(0.26, 0.02, new THREE.MeshBasicMaterial({ color: 0xd8a0a8 }), 0, y, 0.017, b));
  b.userData.home = new THREE.Vector3(-0.62 + 0.2 * i, 0.82 + (i % 2 ? 0.08 : -0.06), 0.1 + 0.03 * i);
  b.userData.rz = (i % 2 ? -1 : 1) * 0.08;
  b.visible = false; return b;
});

// ---------- s2: your PSD files + a red padlock ----------
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
const files = [-0.75, 0, 0.75].map((x) => { const f = makeFile(VIOLET, "PSD"); f.position.set(x, 0.5, 0.12); f.scale.setScalar(0.75); lid.add(f); return f; });
const lock = new THREE.Group(); lid.add(lock);
const mLock = std(0xc01830, 0x300408, 0.45, 0.3);
lock.add(rbox(0.6, 0.46, 0.16, 0.06, mLock));
const shackle = new THREE.Mesh(new THREE.TorusGeometry(0.19, 0.05, 12, 32, Math.PI), std(0xd8d4f0, 0x3a3060, 0.3, 0.8)); shackle.position.y = 0.23; lock.add(shackle);
[-0.19, 0.19].forEach((x) => { const p = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 0.1, 12), shackle.material); p.position.set(x, 0.23, 0); lock.add(p); });
const hole = new THREE.Mesh(new THREE.CircleGeometry(0.05, 16), new THREE.MeshBasicMaterial({ color: 0x1a0408 })); hole.position.set(0, 0.03, 0.085); lock.add(hole);
const slot = plane(0.035, 0.1, hole.material, 0, -0.04, 0.085, lock);
const lockGlow = new THREE.PointLight(0xff3040, 3, 4, 1.6); lockGlow.position.set(0, 0, 0.8); lock.add(lockGlow);

// ---------- s3: app icon (fox on a blue tile), $0 tag, code card ----------
function iconTex() {
  const c = document.createElement("canvas"); c.width = 512; c.height = 512; const x = c.getContext("2d");
  x.fillStyle = "#2f7bf5"; x.beginPath(); x.roundRect(16, 16, 480, 480, 110); x.fill();
  x.fillStyle = "#ffffff"; x.beginPath(); // fox head: two ears, wide cheeks, pointed chin
  x.moveTo(256, 420); x.lineTo(110, 250); x.lineTo(120, 100); x.lineTo(205, 190); x.lineTo(307, 190); x.lineTo(392, 100); x.lineTo(402, 250); x.closePath(); x.fill();
  x.fillStyle = "#2f7bf5"; [[200, 265], [312, 265]].forEach(([a, b]) => { x.beginPath(); x.ellipse(a, b, 20, 13, 0, 0, 7); x.fill(); });
  x.beginPath(); x.moveTo(256, 420); x.lineTo(228, 372); x.lineTo(284, 372); x.closePath(); x.fill();
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t;
}
const icon = new THREE.Mesh(new THREE.PlaneGeometry(0.72, 0.72), new THREE.MeshBasicMaterial({ map: iconTex(), transparent: true, toneMapped: false, color: 0xc0c0c0 }));
lid.add(icon);
const plate = (txt, hex, w = 0.9, h = 0.52) => { const gp = new THREE.Group(); gp.add(rbox(w, h, 0.05, 0.06, mDark)); const ring = plane(w + 0.03, h + 0.03, glow(hex, 0.9), 0, 0, -0.03, gp); const t = wt([txt], hex, 1.4, w * 0.9); t.position.z = 0.03; gp.add(t); lid.add(gp); gp.visible = false; return gp; };
const zero = plate("$0", GREEN), code = plate("</>", GREEN);

// ---------- s4: CMD + J keys rise off the keyboard ----------
const keycap = (txt, x) => { const k = new THREE.Group(); k.add(rbox(0.34, 0.26, 0.1, 0.04, std(0x6a5ff0, 0x2a2090, 0.35, 0.2))); const t = wt([txt], WHITE, 1.0, 0.3); t.position.z = 0.055; k.add(t); k.position.set(x, 0.3, 0.05); root.add(k); k.visible = false; return k; };
const kCmd = keycap("CMD", -0.22), kJ = keycap("J", 0.22);

// ---------- s5: a PSD flies in, explodes into layers; 309-file grid ----------
const psd = makeFile(GREEN, "PSD"); lid.add(psd);
const L5 = new THREE.Group(); L5.position.set(-0.05, 0.82, 0.1); lid.add(L5);
const lPhoto = plane(1.2, 0.88, mPhoto, 0, 0, 0, L5);
const lShape = new THREE.Group(); L5.add(lShape);
const sh = new THREE.Mesh(new THREE.CircleGeometry(0.22, 40), new THREE.MeshBasicMaterial({ color: new THREE.Color(VIOLET).multiplyScalar(1.2), transparent: true, opacity: 0.85, toneMapped: false })); sh.position.set(-0.3, 0.12, 0); lShape.add(sh);
const lText = new THREE.Group(); L5.add(lText);
const tt = wt(["SUNSET"], WHITE, 1.1, 0.8); tt.position.set(0.15, -0.25, 0); lText.add(tt);
const frames = [lPhoto, lShape, lText].map((l, i) => { const e = new THREE.LineSegments(new THREE.EdgesGeometry(new THREE.PlaneGeometry(1.22, 0.9)), new THREE.LineBasicMaterial({ color: new THREE.Color(i ? VIOLET : GREEN).multiplyScalar(1.6), toneMapped: false })); l.add(e); return e; });
const grid = new THREE.Group(); grid.position.set(-0.15, 0.8, 0.08); lid.add(grid);
const COLS = 21, BAD = [96, 233];
const cells = Array.from({ length: 309 }, (_, i) => {
  const c = new THREE.Mesh(new THREE.PlaneGeometry(0.054, 0.054), glow(BAD.includes(i) ? ORANGE : GREEN, BAD.includes(i) ? 1.4 : 0.9));
  c.position.set((i % COLS - (COLS - 1) / 2) * 0.07, (7 - Math.floor(i / COLS)) * 0.065, 0); grid.add(c); return c;
});

// ---------- s6: 16 edit layers stacked over the original photo; offline; three systems ----------
const S6 = new THREE.Group(); S6.position.set(-0.05, 0.84, 0.1); lid.add(S6);
const base6 = plane(1.2, 0.88, mPhoto, 0, 0, 0, S6);
const frame6 = new THREE.LineSegments(new THREE.EdgesGeometry(new THREE.PlaneGeometry(1.24, 0.92)), new THREE.LineBasicMaterial({ color: new THREE.Color(GREEN).multiplyScalar(1.8), toneMapped: false })); base6.add(frame6);
const EDIT_COL = [VIOLET, GREEN, ORANGE, 0x4fa8ff];
const edits = Array.from({ length: 16 }, (_, i) => {
  const m = new THREE.Mesh(new THREE.PlaneGeometry(1.2, 0.88), new THREE.MeshBasicMaterial({ color: new THREE.Color(EDIT_COL[i % 4]).multiplyScalar(0.9), transparent: true, opacity: 0.12, toneMapped: false, depthWrite: false, side: THREE.DoubleSide }));
  const e = new THREE.LineSegments(new THREE.EdgesGeometry(new THREE.PlaneGeometry(1.2, 0.88)), new THREE.LineBasicMaterial({ color: new THREE.Color(EDIT_COL[i % 4]).multiplyScalar(1.3), toneMapped: false, transparent: true })); m.add(e);
  m.position.set(0, 0, 0.06 + 0.05 * i); S6.add(m); return m;
});
const wifi = new THREE.Group(); wifi.position.set(0, 0.72, 0.15); lid.add(wifi);
[0.16, 0.3, 0.44].forEach((r) => { const a = new THREE.Mesh(new THREE.TorusGeometry(r, 0.035, 8, 32, Math.PI / 2), glow(VIOLET, 1.4)); a.rotation.z = Math.PI / 4; wifi.add(a); });
const wdot = new THREE.Mesh(new THREE.CircleGeometry(0.05, 16), glow(VIOLET, 1.4)); wifi.add(wdot);
const slash = new THREE.Mesh(new THREE.PlaneGeometry(0.07, 0.75), glow(ORANGE, 1.6)); slash.position.set(0, 0.22, 0.02); slash.rotation.z = 0.75; wifi.add(slash);
const OS = ["MAC", "WINDOWS", "LINUX"];
const osTiles = OS.map((n, i) => { const gp = new THREE.Group(); gp.add(rbox(0.66, 0.44, 0.06, 0.06, mBody)); plane(0.6, 0.03, glow(GREEN, 1.4), 0, -0.17, 0.035, gp); const t = wt([n], WHITE, 1.0, 0.56); t.position.z = 0.04; gp.add(t); gp.position.set(-0.7 + 0.55 * i, 0.82, 0.14); lid.add(gp); gp.visible = false; return gp; });

// ---------- s3: GitHub star ----------
const starShape = new THREE.Shape();
for (let i = 0; i < 10; i++) { const a = Math.PI / 2 + (i * Math.PI) / 5, r = i % 2 ? 0.17 : 0.4; starShape[i ? "lineTo" : "moveTo"](Math.cos(a) * r, Math.sin(a) * r); }
const star = new THREE.Mesh(new THREE.ExtrudeGeometry(starShape, { depth: 0.08, bevelEnabled: true, bevelSize: 0.03, bevelThickness: 0.03, bevelSegments: 2 }), glow(ORANGE, 1.5));
root.add(star);

// ---------- captions ----------
title("NEVER RENT YOUR PHOTO EDITOR");
cap("s1", "exploring", ["EXPLORING GITHUB REPOS"], WHITE, { until: "s1" });
cap("s2", "stop", ["STOP PAYING?"], RED, { until: ["s2", "stops"] });
cap("s2", "stops", ["THE APP STOPS OPENING"], RED, { boom: 0.5 });
cap("s3", "photocraft", ["PHOTOCRAFT"], GREEN, { until: ["s3", "over"], boom: 0.5 });
cap("s3", "over", ["OVER 79,000 STARS", "IN 6 WEEKS"], ORANGE, { until: ["s3", "free"], boom: 0.5 });
cap("s3", "free", ["IT'S FREE"], GREEN, { until: ["s3", "rebuilt"] });
cap("s3", "rebuilt", ["REBUILT FROM SCRATCH"], GREEN, { until: ["s3", "none"] });
cap("s3", "none", ["NONE OF ADOBE'S CODE"], GREEN);
cap("s4", "same", ["SAME MENUS"], VIOLET, { until: ["s4", "shortcuts"] });
cap("s4", "shortcuts", ["SAME SHORTCUTS"], VIOLET, { until: ["s4", "right"], boom: 0.4 });
cap("s4", "right", ["WHERE YOUR HANDS EXPECT"], GREEN);
cap("s5", "opens", ["OPENS PHOTOSHOP FILES"], GREEN, { until: ["s5", "saved"] });
cap("s5", "saved", ["SAVED AGAIN"], VIOLET, { until: ["s5", "307"] });
cap("s5", "307", ["307 OF 309 TEST FILES"], GREEN, { until: ["s5", "exactly"], boom: 0.5 });
cap("s5", "exactly", ["LOOK EXACTLY THE SAME"], GREEN);
cap("s6", "stack", ["16 KINDS OF EDITS"], VIOLET, { until: ["s6", "original"], boom: 0.4 });
cap("s6", "original", ["ORIGINAL NEVER CHANGES"], GREEN, { until: ["s6", "works"] });
cap("s6", "works", ["WORKS OFFLINE"], GREEN, { until: ["s6", "mac"] });
cap("s6", "mac", ["MAC, WINDOWS, LINUX"], GREEN);
endCard(["DON'T RENT IT.", "OWN IT."]);
boom("s2", "stops", 0.6);

// ---------- timings (global seconds) ----------
const T = {
  every: g("s1", "every"), s2: S.s2[0], app: g("s2", "app"), stops: g("s2", "stops"),
  s3: S.s3[0], get: g("s3", "get"), over: g("s3", "over"), free: g("s3", "free"), rebuilt: g("s3", "rebuilt"), none: g("s3", "none"),
  s4: S.s4[0], shortcuts: g("s4", "shortcuts"), right: g("s4", "right"),
  s5: S.s5[0], opens: g("s5", "opens"), files: g("s5", "files"), saved: g("s5", "saved"), n307: g("s5", "307"), n309: g("s5", "309"), exactly: g("s5", "exactly"),
  s6: S.s6[0], original: g("s6", "original"), it: g("s6", "it"), offline: g("s6", "offline"), mac: g("s6", "mac"), win: g("s6", "windows"), linux: g("s6", "linux"),
  s7: S.s7[0], s8: S.s8[0],
};
const OS_AT = [T.mac, T.win, T.linux];
const v = new THREE.Vector3(), v2 = new THREE.Vector3();

// ---------- shots: [cx,cy,cz, lx,ly,lz, fov] ----------
const FRONT = [0.2, 1.7, 5.2, 0, 0.95, -0.6, 46];
const SH = [
  { at: 0, K: [[0, [0.3, 1.8, 5.6, 0, 0.9, -0.5, 48]], [S.s2[0], [0.1, 1.7, 5.1, 0, 0.95, -0.6, 48]]] },
  { at: T.s2, K: [[0, [-0.5, 1.6, 5.2, 0, 0.95, -0.6, 46]], [3, [0.3, 1.6, 5.0, 0, 0.95, -0.6, 46]]] },
  { at: T.stops - 0.15, K: [[0, [-0.3, 1.8, 4.8, 0, 1.0, -0.6, 46]], [1.5, [-0.2, 1.8, 4.6, 0, 1.0, -0.6, 46]]] },
  { at: T.s3, K: [[0, [-0.6, 2.1, 5.8, 0, 1.0, -0.6, 48]], [3.6, [0.2, 1.8, 5.2, 0, 1.0, -0.6, 46]]] },
  { at: T.rebuilt - 0.1, K: [[0, [0.5, 1.7, 5.2, 0, 0.95, -0.6, 46]], [3.2, [0.2, 1.6, 5.0, 0, 0.95, -0.6, 46]]] },
  { at: T.s4, K: [[0, [-0.4, 1.6, 5.0, 0, 0.85, -0.5, 46]], [3.2, [-0.1, 1.5, 4.8, 0, 0.85, -0.5, 46]]] },
  { at: T.s5, K: [[0, [0.4, 1.7, 5.2, 0, 0.95, -0.6, 46]], [2, FRONT]] },
  { at: T.files - 0.15, K: [[0, [2.4, 1.7, 4.4, 0, 0.95, -0.5, 46]], [0.8, [2.2, 1.8, 4.6, 0, 0.95, -0.5, 46]]] },
  { at: T.n307 - 0.15, K: [[0, [0, 1.7, 5.0, 0, 0.95, -0.6, 46]], [2.6, [0.2, 1.7, 5.2, 0, 0.95, -0.6, 46]]] },
  { at: T.s6, K: [[0, [2.4, 1.8, 4.4, 0, 0.95, -0.4, 46]], [3.4, [2.0, 1.9, 4.8, 0, 0.95, -0.4, 46]]] },
  { at: T.it - 0.1, K: [[0, [-0.3, 1.7, 5.2, 0, 0.95, -0.6, 46]], [2.6, [0.2, 1.7, 5.0, 0, 0.95, -0.6, 46]]] },
  { at: T.s7, calm: 1, K: [[0, [0.2, 1.9, 5.8, 0, 0.95, -0.6, 48]], [2, [0.4, 2.0, 6.2, 0, 0.95, -0.6, 48]]] },
];

run("photocraft-world", (t) => {
  root.visible = t < T.s8 - 0.12; // hide the scene before the CTA fades in
  const wrong = t < T.s3, locked = t >= T.stops - 0.05 && wrong;
  accent.material.color.set(wrong ? (t >= T.every ? RED : VIOLET) : GREEN).multiplyScalar(1.6);
  mScreen.color.set(locked ? 0x2a0610 : wrong ? 0x0b0a26 : 0x0a1a1a);
  mPhoto.color.set(locked ? 0x3a3030 : 0xb8b8b8);

  // editor panels: on in the wrong part, gone on "Instead", fly back in on "rebuilt"
  const ab = sm(T.rebuilt, T.rebuilt + 0.5, t), uiOn = wrong || t >= T.rebuilt;
  tools.visible = panel.visible = menu.visible = uiOn; menu.visible = uiOn && !locked;
  tools.position.x = -1.08 - (wrong ? 0 : 0.8 * (1 - ab)); panel.position.x = 0.9 + (wrong ? 0 : 0.8 * (1 - ab)); menu.position.y = 1.54 + (wrong ? 0 : 0.4 * (1 - ab));
  [tools, panel, menu].forEach((o) => o.scale.setScalar(wrong ? 1 : Math.max(1e-3, ab)));
  photo.visible = t >= S.s1[0] + 0.05;

  // s1: bills land one by one; s2 "Stop paying": they drop away
  bills.forEach((b, i) => {
    const a = T.every + 0.42 * i, k = sm(a - 0.1, a + 0.15, t), fall = sm(T.s2, T.s2 + 0.45, t);
    b.visible = k > 0.01 && fall < 0.99;
    b.position.copy(b.userData.home); b.position.y += 0.25 * (1 - k) - 1.4 * fall; b.rotation.z = b.userData.rz + fall * 0.6 * (i % 2 ? 1 : -1);
    b.scale.setScalar(Math.max(1e-3, 0.95 * k * (1 - 0.5 * fall)));
  });

  // s2: your files pop up, then the padlock slams on and they turn red; "Instead" clears them
  const clear = sm(T.s3, T.s3 + 0.3, t);
  files.forEach((f, i) => {
    const k = sm(T.app + 0.15 * i, T.app + 0.25 + 0.15 * i, t) * (1 - clear);
    f.visible = k > 0.01 && t < T.s3 + 0.3; f.scale.setScalar(Math.max(1e-3, 0.75 * k));
    setBand(f, locked ? RED : VIOLET, locked ? 1.6 : 1.1);
  });
  const lk = sm(T.stops - 0.05, T.stops + 0.15, t), lout = sm(T.s3, T.s3 + 0.35, t);
  lock.visible = lk > 0.01 && lout < 0.99;
  lock.position.set(0, 1.03 + 0.35 * (1 - lk) + 0.9 * lout, 0.35); lock.scale.setScalar(Math.max(1e-3, (1.15 - 0.25 * lk) * (1 - 0.7 * lout)));
  shackle.position.y = 0.23 + 0.1 * (1 - sm(T.stops + 0.1, T.stops + 0.25, t)); // clicks shut

  // s3: icon on "get", $0 on "free", code card on "none"
  show(icon, sm(T.s3 + 0.05, T.s3 + 0.35, t) * (1 - sm(T.free - 0.15, T.free, t)), 1);
  icon.position.set(0, 0.84, 0.25); icon.rotation.y = 0.25 * Math.sin((t - T.s3) * 2);
  show(zero, sm(T.free - 0.1, T.free + 0.15, t) * (1 - sm(T.rebuilt - 0.15, T.rebuilt, t)), 1); zero.position.set(-0.15, 0.82, 0.22);
  show(code, sm(T.none - 0.1, T.none + 0.15, t) * (1 - sm(T.s4 - 0.15, T.s4, t)), 1); code.position.set(-0.15, 0.82, 0.22);

  // s4: LAYER menu drops down, CMD + J rise, cursor lands on DUPLICATE
  const s4on = t >= T.s4 - 0.05 && t < T.s5;
  menuHi.visible = s4on;
  const dk = sm(T.s4, T.s4 + 0.3, t);
  drop.visible = s4on && dk > 0.01; drop.scale.set(1, Math.max(1e-3, dk), 1);
  dropHi.visible = t >= T.shortcuts;
  [kCmd, kJ].forEach((k, i) => {
    const r = sm(T.shortcuts - 0.1 + 0.12 * i, T.shortcuts + 0.2 + 0.12 * i, t) * (1 - sm(T.s5 - 0.2, T.s5, t));
    k.visible = r > 0.01; k.position.y = 0.15 + 0.3 * r; k.rotation.x = -0.35; k.scale.setScalar(Math.max(1e-3, r));
    k.position.z = 0.05 - 0.03 * Math.max(0, 1 - Math.abs(t - T.shortcuts - 0.55 - 0.12 * i) / 0.1); // a quick press
  });
  cursor.visible = s4on && t >= T.s4 + 0.2;
  cursor.position.copy(v.set(MX(3) + 0.05, 1.45, 0.12)).lerp(v2.set(MX(3) + 0.62, 1.27, 0.12), sm(T.right - 0.1, T.right + 0.3, t));

  // s5: a PSD flies in, splits into its layers, they snap back on "saved", then the 309 grid
  const fly = sm(T.opens - 0.1, T.files - 0.1, t);
  psd.visible = t >= T.opens - 0.15 && t < T.files + 0.05;
  psd.position.set(1.0 * (1 - fly), 0.45 + 0.4 * fly, 1.3 - 1.1 * fly); psd.scale.setScalar(0.8); psd.rotation.y = -0.6 * (1 - fly);
  const L5on = t >= T.files - 0.05 && t < T.n307 - 0.05, ex = sm(T.files, T.files + 0.4, t) * (1 - sm(T.saved, T.saved + 0.35, t));
  L5.visible = L5on; L5.scale.setScalar(Math.max(1e-3, sm(T.files - 0.05, T.files + 0.15, t)));
  lShape.position.z = 0.02 + 0.38 * ex; lText.position.z = 0.04 + 0.76 * ex;
  frames.forEach((e, i) => (e.visible = i === 0 || ex > 0.05));
  const gOn = t >= T.n307 - 0.1 && t < T.s6;
  grid.visible = gOn;
  const pulseK = Math.max(0, 1 - Math.abs(t - T.exactly - 0.2) / 0.3);
  cells.forEach((c, i) => {
    const k = sm(T.n307 - 0.1 + 0.0016 * i, T.n307 + 0.1 + 0.0016 * i, t);
    c.visible = gOn && k > 0.01; c.scale.setScalar(Math.max(1e-3, k * (BAD.includes(i) ? 1 + 0.4 * sm(T.n309, T.n309 + 0.2, t) : 1 + 0.25 * pulseK)));
  });
  photo.visible = photo.visible && !L5on && !gOn;

  // s6: edits stack over the photo, lift on "original" (photo unchanged), then offline + three systems
  const s6on = t >= T.s6 - 0.05 && t < T.it;
  S6.visible = s6on; S6.scale.setScalar(Math.max(1e-3, sm(T.s6 - 0.05, T.s6 + 0.2, t)));
  const lift = sm(T.original - 0.1, T.original + 0.4, t);
  edits.forEach((m, i) => {
    const k = sm(T.s6 + 0.1 + 0.05 * i, T.s6 + 0.25 + 0.05 * i, t);
    m.visible = k > 0.01; m.position.z = 0.06 + 0.05 * i + 0.25 * lift + 0.3 * (1 - k);
    m.material.opacity = 0.12 * k * (1 - 0.6 * lift); m.children[0].material.opacity = k * (1 - 0.6 * lift);
  });
  frame6.visible = lift > 0.05;
  photo.visible = photo.visible && !s6on;
  const wk = sm(T.offline - 0.1, T.offline + 0.15, t) * (1 - sm(T.mac - 0.15, T.mac, t));
  show(wifi, wk, 1);
  osTiles.forEach((m, i) => show(m, sm(OS_AT[i] - 0.1, OS_AT[i] + 0.15, t) * (1 - sm(T.s7 - 0.15, T.s7, t)), 0.75));
  photo.visible = photo.visible && !(t >= T.offline - 0.1 && t < T.s7);

  // s3: the star pops in above the laptop while the star count is on screen
  const sk = sm(T.over - 0.1, T.over + 0.25, t) * (1 - sm(T.free - 0.15, T.free + 0.1, t));
  star.visible = sk > 0.01; star.scale.setScalar(0.42 * sk * (1 + 0.08 * Math.sin(t * 6)));
  star.position.set(0, 1.97, -0.3); star.rotation.y = 0.35 * Math.sin((t - T.over) * 2.5);

  const { punch } = shoot(SH, t);
  const spike = overlays(t);
  bloom.strength = 1.0 + 1.2 * punch * punch + spike;
});
