// NEVER PAY JUST TO TYPE (WordCraft). Laptop with a word processor on a dark desk; wrong = monthly bills pile on the screen,
// then the document goes READ-ONLY and a red padlock locks it; right = the editor rebuilds itself: ribbon, styles, track changes,
// .docx in and out, a 188-page stack + 1.4 ms, offline spell check, four platforms.
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
const show = (o, k, s = 1, min = 0.75) => { o.visible = k > 0.01; o.scale.setScalar(Math.max(1e-3, s * (min + (1 - min) * k))); }; // pops in near full size, never grows from tiny

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

// ---------- the document page (white sheet, heading + text lines) ----------
const mPage = new THREE.MeshBasicMaterial({ color: 0xc4c0e0, toneMapped: false });
const mInk = new THREE.MeshBasicMaterial({ color: 0x5a4fc0 });
const doc = new THREE.Group(); doc.position.set(-0.2, 0.68, 0.04); lid.add(doc);
const pageM = plane(1.2, 0.98, mPage, 0, 0, 0, doc);
const head = wt(["CHAPTER 1"], 0x3a2f9a, 1.0, 0.7); head.position.set(-0.17, 0.36, 0.003); doc.add(head);
const LW = [0.98, 0.92, 0.96, 0.7, 0.94, 0.88, 0.96, 0.6];
const lines = LW.map((w, i) => plane(w, 0.03, mInk, -0.49 + w / 2, 0.2 - i * 0.075, 0.002, doc));
const caret = plane(0.012, 0.07, glow(GREEN, 1.6), 0, 0, 0.004, doc);
// stack of pages behind (s5 "188-page")
const stack = Array.from({ length: 9 }, (_, i) => { const p = plane(1.2, 0.98, new THREE.MeshBasicMaterial({ color: new THREE.Color(0xc4c0e0).multiplyScalar(0.55 + 0.04 * i), toneMapped: false }), 0, 0, 0, lid); p.visible = false; return p; });

// ---------- ribbon: tabs on the window bar, a strip of buttons under it ----------
const TABS = ["FILE", "HOME", "INSERT", "DESIGN", "LAYOUT", "REVIEW"];
const ribbon = new THREE.Group(); ribbon.position.set(0, 1.4, 0.04); lid.add(ribbon);
const TX = (i) => -0.68 + i * 0.3;
const tabHi = plane(0.27, 0.1, glow(VIOLET, 1.4), TX(1), 0.14, 0.001, ribbon);
TABS.forEach((w, i) => { const m = wt([w], WHITE, 1.0, 0.27); m.position.set(TX(i), 0.14, 0.003); ribbon.add(m); });
plane(2.3, 0.15, glow(VIOLET, 0.22), 0, -0.01, 0, ribbon);
const BTN = ["B", "I", "U", "A", "=", "1.", "*", "T"];
const btns = BTN.map((b, i) => { const gp = new THREE.Group(); gp.position.set(-1.0 + i * 0.13, -0.01, 0.003); ribbon.add(gp); plane(0.1, 0.1, glow(VIOLET, 0.6), 0, 0, 0, gp); const t = wt([b], WHITE, 1.0, 0.16); t.position.z = 0.002; gp.add(t); return gp; });
// styles gallery on the right
const STY = ["NORMAL", "HEADING 1", "TITLE", "SUBTITLE"];
const panel = new THREE.Group(); panel.position.set(0.86, 0.68, 0.04); lid.add(panel);
plane(0.5, 0.98, glow(VIOLET, 0.25), 0, 0, 0, panel);
const sty = STY.map((s, i) => { const r = plane(0.44, 0.17, glow(VIOLET, 0.45), 0, 0.35 - i * 0.22, 0.002, panel); const t = wt([s], WHITE, 1.0, 0.36); t.position.z = 0.002; r.add(t); return r; });
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
  b.userData.home = new THREE.Vector3(-0.62 + 0.2 * i, 0.72 + (i % 2 ? 0.08 : -0.06), 0.1 + 0.03 * i);
  b.userData.rz = (i % 2 ? -1 : 1) * 0.08;
  b.visible = false; return b;
});

// ---------- s2: READ-ONLY banner + red padlock ----------
const banner = new THREE.Group(); banner.position.set(-0.2, 1.08, 0.07); lid.add(banner);
plane(1.2, 0.16, glow(RED, 0.9), 0, 0, 0, banner);
const bt = wt(["READ-ONLY"], WHITE, 1.0, 0.7); bt.position.z = 0.003; banner.add(bt);
const lock = new THREE.Group(); lid.add(lock);
const mLock = std(0xc01830, 0x300408, 0.45, 0.3);
lock.add(rbox(0.6, 0.46, 0.16, 0.06, mLock));
const shackle = new THREE.Mesh(new THREE.TorusGeometry(0.19, 0.05, 12, 32, Math.PI), std(0xd8d4f0, 0x3a3060, 0.3, 0.8)); shackle.position.y = 0.23; lock.add(shackle);
[-0.19, 0.19].forEach((x) => { const p = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 0.1, 12), shackle.material); p.position.set(x, 0.23, 0); lock.add(p); });
const hole = new THREE.Mesh(new THREE.CircleGeometry(0.05, 16), new THREE.MeshBasicMaterial({ color: 0x1a0408 })); hole.position.set(0, 0.03, 0.085); lock.add(hole);
plane(0.035, 0.1, hole.material, 0, -0.04, 0.085, lock);
const lockGlow = new THREE.PointLight(0xff3040, 1.2, 4, 1.6); lockGlow.position.set(0, 0, 0.8); lock.add(lockGlow);

// ---------- s3: app icon (page + pen on a blue tile), $0 tag, clean-room card ----------
function iconTex() {
  const c = document.createElement("canvas"); c.width = 512; c.height = 512; const x = c.getContext("2d");
  x.fillStyle = "#2f6bf0"; x.beginPath(); x.roundRect(16, 16, 480, 480, 110); x.fill();
  x.fillStyle = "#ffffff"; x.beginPath(); x.moveTo(130, 90); x.lineTo(310, 90); x.lineTo(380, 160); x.lineTo(380, 420); x.lineTo(130, 420); x.closePath(); x.fill();
  x.fillStyle = "#b8c8ff"; x.beginPath(); x.moveTo(310, 90); x.lineTo(310, 160); x.lineTo(380, 160); x.closePath(); x.fill();
  x.fillStyle = "#2f6bf0"; [170, 215, 260, 305].forEach((y, i) => x.fillRect(165, y, i === 3 ? 110 : 180, 16));
  x.save(); x.translate(330, 330); x.rotate(-Math.PI / 4); // pen
  x.fillStyle = "#ffb020"; x.fillRect(-22, -150, 44, 150); x.fillStyle = "#1a1a40"; x.beginPath(); x.moveTo(-22, 0); x.lineTo(22, 0); x.lineTo(0, 46); x.closePath(); x.fill();
  x.restore();
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t;
}
const icon = new THREE.Mesh(new THREE.PlaneGeometry(0.72, 0.72), new THREE.MeshBasicMaterial({ map: iconTex(), transparent: true, toneMapped: false, color: 0xc0c0c0 }));
lid.add(icon);
const plate = (txt, hex, w = 0.9, h = 0.52) => { const gp = new THREE.Group(); gp.add(rbox(w, h, 0.05, 0.06, mDark)); plane(w + 0.03, h + 0.03, glow(hex, 0.9), 0, 0, -0.03, gp); const t = wt([txt], hex, 1.4, w * 0.9); t.position.z = 0.03; gp.add(t); lid.add(gp); gp.visible = false; return gp; };
const zero = plate("$0", GREEN), clean = plate("CLEAN-ROOM", GREEN, 1.2, 0.5), ms = plate("1.4 MS", GREEN, 0.9, 0.46);

// ---------- s4: track changes on the page ----------
const tc = new THREE.Group(); tc.position.set(0, -0.04, 0.006); doc.add(tc);
plane(1.1, 0.13, mPage, 0, 0, -0.001, tc); // covers the text line under it
const old = wt(["THIRTY"], RED, 1.3, 0.42); old.position.set(-0.25, 0, 0); tc.add(old);
plane(0.34, 0.014, glow(RED, 1.2), -0.25, 0, 0.002, tc);
const neu = wt(["FORTY"], 0x14a050, 1.0, 0.38); neu.position.set(0.18, 0, 0); tc.add(neu);
const neuLine = plane(0.3, 0.012, new THREE.MeshBasicMaterial({ color: 0x14a050 }), 0.18, -0.05, 0.002, tc);

// ---------- s5: a DOCX file flies in, green check on save ----------
function makeFile(hex, txt) {
  const gp = new THREE.Group();
  gp.add(rbox(0.56, 0.72, 0.06, 0.05, mLav));
  const band = plane(0.46, 0.2, glow(hex, 1.1), 0, -0.12, 0.032, gp);
  const corner = new THREE.Mesh(new THREE.CircleGeometry(0.09, 3), glow(ORANGE, 1.4)); corner.position.set(0.19, 0.27, 0.033); corner.rotation.z = Math.PI / 4; gp.add(corner);
  [0.14, 0.06].forEach((y) => plane(0.3, 0.025, new THREE.MeshBasicMaterial({ color: 0x6a5fd0 }), -0.05, y, 0.032, gp));
  const t = wt([txt], WHITE, 1.0, 0.4); t.position.set(0, -0.12, 0.036); gp.add(t);
  gp.userData.band = band; gp.visible = false; return gp;
}
const docx = makeFile(VIOLET, "DOCX"); lid.add(docx);
const check = new THREE.Group(); docx.add(check); check.position.set(0.24, -0.32, 0.07);
check.add(new THREE.Mesh(new THREE.CircleGeometry(0.13, 32), glow(GREEN, 0.8)));
const ck = new THREE.Shape(); ck.moveTo(-0.07, 0); ck.lineTo(-0.02, -0.05); ck.lineTo(0.08, 0.06); ck.lineTo(0.06, 0.08); ck.lineTo(-0.02, -0.01); ck.lineTo(-0.05, 0.02); ck.closePath();
const ckm = new THREE.Mesh(new THREE.ShapeGeometry(ck), new THREE.MeshBasicMaterial({ color: 0x0a2a18 })); ckm.position.z = 0.002; check.add(ckm);

// ---------- s6: spelling squiggle, offline badge, four platforms ----------
const spell = new THREE.Group(); spell.position.set(0, 0.06, 0.006); doc.add(spell);
plane(1.1, 0.16, mPage, 0, 0, -0.001, spell);
const wBad = wt(["SPELING"], RED, 1.3, 0.5); wBad.position.set(-0.15, 0, 0); spell.add(wBad);
const wGood = wt(["SPELLING"], 0x14a050, 1.0, 0.54); wGood.position.set(-0.15, 0, 0); spell.add(wGood);
const sq = new THREE.Group(); spell.add(sq);
for (let i = 0; i < 12; i++) { const s = plane(0.04, 0.012, glow(RED, 1.3), -0.37 + i * 0.037, -0.07, 0.002, sq); s.rotation.z = i % 2 ? -0.6 : 0.6; }
const wifi = new THREE.Group(); wifi.position.set(0.18, 0.5, 0.15); lid.add(wifi);
[0.12, 0.22, 0.32].forEach((r) => { const a = new THREE.Mesh(new THREE.TorusGeometry(r, 0.028, 8, 32, Math.PI / 2), glow(0x3a2f9a, 1)); a.rotation.z = Math.PI / 4; wifi.add(a); });
wifi.add(new THREE.Mesh(new THREE.CircleGeometry(0.04, 16), glow(0x3a2f9a, 1)));
const slash = new THREE.Mesh(new THREE.PlaneGeometry(0.06, 0.55), glow(ORANGE, 1.6)); slash.position.set(0, 0.16, 0.02); slash.rotation.z = 0.75; wifi.add(slash);
const OS = ["MAC", "WINDOWS", "LINUX", "BROWSER"];
const osTiles = OS.map((n, i) => { const gp = new THREE.Group(); gp.add(rbox(0.72, 0.4, 0.06, 0.06, mBody)); plane(0.66, 0.03, glow(GREEN, 1.4), 0, -0.15, 0.035, gp); const t = wt([n], WHITE, 1.0, 0.6); t.position.z = 0.04; gp.add(t); gp.position.set(i % 2 ? 0.42 : -0.42, i < 2 ? 1.0 : 0.52, 0.16); lid.add(gp); gp.visible = false; return gp; });

// ---------- s3: GitHub star ----------
const starShape = new THREE.Shape();
for (let i = 0; i < 10; i++) { const a = Math.PI / 2 + (i * Math.PI) / 5, r = i % 2 ? 0.17 : 0.4; starShape[i ? "lineTo" : "moveTo"](Math.cos(a) * r, Math.sin(a) * r); }
const star = new THREE.Mesh(new THREE.ExtrudeGeometry(starShape, { depth: 0.08, bevelEnabled: true, bevelSize: 0.03, bevelThickness: 0.03, bevelSegments: 2 }), glow(ORANGE, 1.5));
root.add(star);

// ---------- captions ----------
title("NEVER PAY JUST TO TYPE");
cap("s1", "exploring", ["EXPLORING GITHUB REPOS"], WHITE, { until: "s1" });
cap("s2", "stop", ["STOP PAYING?"], RED, { until: ["s2", "read"] });
cap("s2", "read", ["READ-ONLY"], RED, { until: ["s2", "can't"], boom: 0.4 });
cap("s2", "can't", ["CAN'T EDIT A WORD"], RED, { boom: 0.5 });
cap("s3", "wordcraft", ["WORDCRAFT"], GREEN, { until: ["s3", "over"], boom: 0.5 });
cap("s3", "over", ["OVER 18,000 STARS", "IN 5 WEEKS"], ORANGE, { until: ["s3", "free"], boom: 0.5 });
cap("s3", "free", ["IT'S FREE"], GREEN, { until: ["s3", "word"], untilN: 2 });
cap("s3", "word", ["A WORD PROCESSOR"], GREEN, { n: 2, until: ["s3", "rebuilt"] });
cap("s3", "rebuilt", ["REBUILT FROM SCRATCH"], GREEN, { until: ["s3", "none"] });
cap("s3", "none", ["NONE OF MICROSOFT'S CODE"], GREEN);
cap("s4", "same", ["SAME RIBBON"], VIOLET, { until: ["s4", "same"], untilN: 2 });
cap("s4", "same", ["SAME STYLES"], VIOLET, { n: 2, until: ["s4", "same"], untilN: 3 });
cap("s4", "same", ["SAME TRACK CHANGES"], VIOLET, { n: 3, until: ["s4", "right"], boom: 0.4 });
cap("s4", "right", ["RIGHT WHERE YOU EXPECT"], GREEN);
cap("s5", "opens", ["OPENS AND SAVES .DOCX"], GREEN, { until: ["s5", "type"] });
cap("s5", "type", ["188-PAGE DOCUMENT"], VIOLET, { until: ["s5", "updates"], boom: 0.4 });
cap("s5", "updates", ["UPDATES IN 1.4 MS"], GREEN, { boom: 0.5 });
cap("s6", "spell", ["SPELL CHECK OFFLINE"], GREEN, { until: ["s6", "mac"] });
cap("s6", "mac", ["MAC, WINDOWS, LINUX"], GREEN, { until: ["s6", "in"] });
cap("s6", "in", ["AND YOUR BROWSER"], GREEN);
endCard(["DON'T RENT YOUR WORDS.", "OWN THEM."]);
boom("s2", "can't", 0.6);

// ---------- timings (global seconds) ----------
const T = {
  every: g("s1", "every"), s2: S.s2[0], read: g("s2", "read"), cant: g("s2", "can't"),
  s3: S.s3[0], over: g("s3", "over"), free: g("s3", "free"), proc: g("s3", "word", 2), none: g("s3", "none"),
  s4: S.s4[0], styles: g("s4", "same", 2), track: g("s4", "same", 3), right: g("s4", "right"),
  s5: S.s5[0], opens: g("s5", "opens"), saves: g("s5", "saves"), type: g("s5", "type"), updates: g("s5", "updates"),
  s6: S.s6[0], works: g("s6", "works"), offline: g("s6", "offline"), it: g("s6", "it"), mac: g("s6", "mac"), win: g("s6", "windows"), linux: g("s6", "linux"), browser: g("s6", "browser"),
  s7: S.s7[0], s8: S.s8[0],
};
const OS_AT = [T.mac, T.win, T.linux, T.browser];
const v = new THREE.Vector3(), v2 = new THREE.Vector3();

// ---------- shots: [cx,cy,cz, lx,ly,lz, fov] ----------
const SH = [
  { at: 0, K: [[0, [0.3, 1.8, 5.6, 0, 0.9, -0.5, 48]], [S.s2[0], [0.1, 1.7, 5.1, 0, 0.95, -0.6, 48]]] },
  { at: T.s2, K: [[0, [-0.5, 1.6, 5.2, 0, 0.95, -0.6, 46]], [3, [0.3, 1.6, 5.0, 0, 0.95, -0.6, 46]]] },
  { at: T.cant - 0.15, K: [[0, [-0.3, 1.8, 4.8, 0, 1.0, -0.6, 46]], [1.5, [-0.2, 1.8, 4.6, 0, 1.0, -0.6, 46]]] },
  { at: T.s3, K: [[0, [-0.6, 2.1, 5.8, 0, 1.0, -0.6, 48]], [3.6, [0.2, 1.8, 5.2, 0, 1.0, -0.6, 46]]] },
  { at: T.proc - 0.1, K: [[0, [0.5, 1.7, 5.2, 0, 0.95, -0.6, 46]], [3.2, [0.2, 1.6, 5.0, 0, 0.95, -0.6, 46]]] },
  { at: T.s4, K: [[0, [-0.4, 1.7, 4.9, 0, 1.0, -0.6, 46]], [3.4, [-0.1, 1.6, 4.7, 0, 0.95, -0.6, 46]]] },
  { at: T.s5, K: [[0, [0.4, 1.7, 5.2, 0, 0.95, -0.6, 46]], [2, [0.2, 1.7, 5.2, 0, 0.95, -0.6, 46]]] },
  { at: T.type - 0.15, K: [[0, [1.6, 1.7, 4.8, 0, 0.95, -0.5, 46]], [2.2, [1.3, 1.8, 5.0, 0, 0.95, -0.5, 46]]] },
  { at: T.s6, K: [[0, [-0.3, 1.7, 5.0, 0, 0.95, -0.6, 46]], [3.6, [0.2, 1.7, 5.2, 0, 0.95, -0.6, 46]]] },
  { at: T.s7, calm: 1, K: [[0, [0.2, 1.9, 5.8, 0, 0.95, -0.6, 48]], [2, [0.4, 2.0, 6.2, 0, 0.95, -0.6, 48]]] },
];

run("wordcraft-world", (t) => {
  root.visible = t < T.s8 - 0.12; // hide the scene before the CTA fades in
  const wrong = t < T.s3, ro = wrong && t >= T.read - 0.05, locked = wrong && t >= T.cant - 0.05;
  accent.material.color.set(wrong ? (t >= T.every ? RED : VIOLET) : GREEN).multiplyScalar(1.6);
  mScreen.color.set(locked ? 0x2a0610 : wrong ? 0x0b0a26 : 0x0a1a1a);
  mPage.color.set(ro ? 0x9a8a9a : 0xc4c0e0);

  // editor UI: on in the wrong part, gone on "Instead" (hard cut), flies back in on "processor"
  const ab = sm(T.proc, T.proc + 0.45, t), uiOn = wrong || t >= T.proc;
  ribbon.visible = panel.visible = doc.visible = uiOn;
  panel.position.x = 0.86 + (wrong ? 0 : 0.6 * (1 - ab)); ribbon.position.y = 1.4 + (wrong ? 0 : 0.3 * (1 - ab));
  [ribbon, panel, doc].forEach((o) => o.scale.setScalar(wrong ? 1 : Math.max(1e-3, 0.6 + 0.4 * ab)));

  // s1: bills land one by one; s2 "Stop paying": they drop away
  bills.forEach((b, i) => {
    const a = T.every + 0.42 * i, k = sm(a - 0.1, a + 0.15, t), fall = sm(T.s2, T.s2 + 0.4, t);
    b.visible = k > 0.01 && fall < 0.99;
    b.position.copy(b.userData.home); b.position.y += 0.25 * (1 - k) - 1.4 * fall; b.rotation.z = b.userData.rz + fall * 0.6 * (i % 2 ? 1 : -1);
    b.scale.setScalar(Math.max(1e-3, 0.95 * (0.6 + 0.4 * k) * (1 - 0.5 * fall)));
  });

  // s2: READ-ONLY banner on "read", padlock slams on "can't"; everything gone at "Instead"
  show(banner, sm(T.read - 0.1, T.read + 0.1, t) * (wrong ? 1 : 0), 1, 0.8);
  const lk = sm(T.cant - 0.05, T.cant + 0.15, t);
  lock.visible = locked && lk > 0.01;
  lock.position.set(-0.2, 0.55 + 0.35 * (1 - lk), 0.35); lock.scale.setScalar(1.15 - 0.25 * lk);
  shackle.position.y = 0.23 + 0.1 * (1 - sm(T.cant + 0.1, T.cant + 0.25, t)); // clicks shut

  // s3: icon on "Instead", star on "over", $0 on "free", clean-room card on "none"
  show(icon, sm(T.s3 - 0.02, T.s3 + 0.12, t) * (1 - sm(T.free - 0.12, T.free, t)), 1);
  icon.position.set(0, 0.84, 0.25); icon.rotation.y = 0.25 * Math.sin((t - T.s3) * 2);
  show(zero, sm(T.free - 0.05, T.free + 0.1, t) * (1 - sm(T.proc - 0.12, T.proc, t)), 1); zero.position.set(0, 0.82, 0.22);
  show(clean, sm(T.none - 0.1, T.none + 0.08, t) * (1 - sm(T.s4 - 0.12, T.s4, t)), 1); clean.position.set(-0.15, 0.7, 0.22);

  // s4: ribbon buttons pulse, styles: HEADING 1 is picked and the heading grows, track changes on the page
  const s4on = t >= T.s4 - 0.05 && t < T.s5;
  btns.forEach((b, i) => { const p = s4on ? Math.max(0, 1 - Math.abs(t - T.s4 - 0.08 - 0.05 * i) / 0.18) : 0; b.scale.setScalar(1 + 0.45 * p); b.position.z = 0.003 + 0.05 * p; });
  tabHi.position.x = TX(s4on && t >= T.track ? 5 : 1);
  const pick = s4on && t >= T.styles + 0.15 ? 1 : 0;
  sty.forEach((r, i) => r.material.color.set(i === 1 && pick ? GREEN : VIOLET).multiplyScalar(i === 1 && pick ? 0.4 : 0.45));
  const hk = s4on ? sm(T.styles + 0.15, T.styles + 0.4, t) : 0;
  head.scale.setScalar(1 + 0.35 * hk); head.position.x = -0.17 + 0.05 * hk;
  const tk = s4on ? sm(T.track - 0.05, T.track + 0.15, t) : 0;
  tc.visible = tk > 0.01; old.visible = true; neu.visible = neuLine.visible = t >= T.track + 0.3;
  cursor.visible = s4on && t >= T.s4 + 0.1;
  cursor.position.copy(v.set(-0.95, 1.33, 0.12)).lerp(v2.set(0.8, 0.95, 0.12), sm(T.styles - 0.1, T.styles + 0.15, t)).lerp(v2.set(0.0, 0.58, 0.12), sm(T.track - 0.05, T.track + 0.2, t)).lerp(v2.set(TX(5) + 0.05, 1.5, 0.12), sm(T.right - 0.1, T.right + 0.25, t));

  // s5: DOCX flies onto the page, green check on "saves"; a 188-page stack behind, lines typed in, 1.4 MS badge
  const fly = sm(T.opens - 0.1, T.saves - 0.15, t);
  docx.visible = t >= T.opens - 0.12 && t < T.type - 0.05;
  docx.position.set(1.0 * (1 - fly) + 0.15 * fly, 0.45 + 0.25 * fly, 1.0 - 0.75 * fly); docx.scale.setScalar(0.8); docx.rotation.y = -0.6 * (1 - fly);
  docx.userData.band.material.color.set(t >= T.saves ? GREEN : VIOLET).multiplyScalar(1.1);
  show(check, sm(T.saves, T.saves + 0.15, t), 1, 0.5);
  const s5type = t >= T.type - 0.1 && t < T.s6;
  const sk5 = sm(T.type - 0.1, T.type + 0.2, t);
  stack.forEach((p, i) => { p.visible = s5type && sk5 > 0.01; p.position.set(-0.2 + 0.035 * (9 - i) * sk5, 0.68 + 0.025 * (9 - i) * sk5, 0.04 + 0.006 * i); });
  doc.position.z = s5type ? 0.1 : 0.04;
  lines.forEach((l, i) => { l.visible = !(s5type && i >= 4 && t < T.type + 0.35 * (i - 3)); });
  const lastI = s5type ? Math.min(7, 3 + Math.max(0, Math.floor((t - T.type) / 0.35))) : -1;
  caret.visible = s5type && Math.floor(t * 4) % 2 === 0;
  if (lastI >= 0) caret.position.set(-0.49 + LW[lastI] + 0.02, 0.2 - lastI * 0.075, 0.004);
  show(ms, sm(T.updates - 0.05, T.updates + 0.1, t) * (1 - sm(T.s6 - 0.12, T.s6, t)), 1); ms.position.set(0.5, 0.4, 0.24);

  // s6: misspelled word with a red squiggle, fixed on "works"; offline badge; four platform tiles
  const s6on = t >= T.s6 - 0.05 && t < T.mac - 0.05;
  spell.visible = s6on; const fixed = t >= T.works;
  wBad.visible = !fixed; sq.visible = !fixed; wGood.visible = fixed;
  show(wifi, sm(T.offline - 0.08, T.offline + 0.08, t) * (t < T.it ? 1 : 0), 1);
  const tilesOn = t >= T.mac - 0.1 && t < T.s7;
  doc.visible = doc.visible && !tilesOn; panel.visible = panel.visible && !tilesOn;
  osTiles.forEach((m, i) => show(m, sm(OS_AT[i] - 0.08, OS_AT[i] + 0.08, t) * (1 - sm(T.s7 - 0.12, T.s7, t)), 0.8));

  // s3: the star pops in above the laptop while the star count is on screen
  const sk = sm(T.over - 0.1, T.over + 0.2, t) * (1 - sm(T.free - 0.15, T.free + 0.1, t));
  star.visible = sk > 0.01; star.scale.setScalar(0.38 * (0.5 + 0.5 * sk) * (1 + 0.08 * Math.sin(t * 6)));
  star.position.set(0, 1.93, -0.3); star.rotation.y = 0.35 * Math.sin((t - T.over) * 2.5);

  const { punch } = shoot(SH, t);
  const spike = overlays(t);
  bloom.strength = 1.0 + 1.2 * punch * punch + spike;
});
