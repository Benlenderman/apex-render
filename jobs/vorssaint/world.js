// NEVER PAY FOR A DOZEN MAC APPS (Vorssaint). Laptop on a dark desk; wrong = a dozen paid app tiles with red price
// tags that cram the menu bar; right = one green menu bar icon with a volume mixer, window snapping, clipboard search,
// music to speakers + call to headset, features you switch off disappear, no account / tracking / subscription.
import { THREE, S, g, sm, scene, bloom, glow, beam, VIOLET, ORANGE, RED, GREEN, WHITE, shoot, run } from "./kit.js";
import { title, cap, boom, endCard, overlays, fitText } from "./extra.js";

import { RoundedBoxGeometry } from "three/addons/geometries/RoundedBoxGeometry.js";
const root = new THREE.Group(); scene.add(root);
const std = (c, e, r = 0.45, m = 0.25) => new THREE.MeshStandardMaterial({ color: c, emissive: e, roughness: r, metalness: m });
const rbox = (w, h, d, r, mat) => new THREE.Mesh(new RoundedBoxGeometry(w, h, d, 4, r), mat);
const mBody = std(0x4a42c8, 0x1c1766, 0.35, 0.35), mDark = std(0x14123a, 0x07061a, 0.6, 0.2), mLav = std(0xc9c0ff, 0x4a3fb0, 0.4, 0.1);
const wt = (lines, hex, k, w) => { const m = fitText(lines, hex, k, w); m.material.depthTest = true; m.renderOrder = 1; m.visible = true; return m; };
const plane = (w, h, mat, x, y, z, parent) => { const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), mat); m.position.set(x, y, z); parent.add(m); return m; };
const show = (o, k, s = 1) => { o.visible = k > 0.01; o.scale.setScalar(Math.max(1e-3, s * k)); };
const at = (m, x, y, z) => (m.position.set(x, y, z), m);
const pop = (k) => (k > 0.01 ? 0.75 + 0.25 * k : 0); // quick grow from 75%, never from tiny

// ---------- app icons drawn on canvas ----------
function iconTex(kind, bg, slash = false) {
  const c = document.createElement("canvas"); c.width = c.height = 256; const x = c.getContext("2d");
  x.fillStyle = bg; x.beginPath(); x.roundRect(8, 8, 240, 240, 56); x.fill();
  x.strokeStyle = x.fillStyle = "#fff"; x.lineWidth = 16; x.lineCap = x.lineJoin = "round";
  const P = () => x.beginPath(), arc = (cx, cy, r, a, b) => { P(); x.arc(cx, cy, r, a, b); x.stroke(); };
  const rr = (X, Y, w, h, r, fill) => { P(); x.roundRect(X, Y, w, h, r); fill ? x.fill() : x.stroke(); };
  switch (kind) {
    case "vol": P(); x.moveTo(60, 104); x.lineTo(92, 104); x.lineTo(130, 70); x.lineTo(130, 186); x.lineTo(92, 152); x.lineTo(60, 152); x.closePath(); x.fill();
      arc(136, 128, 34, -0.8, 0.8); arc(136, 128, 64, -0.8, 0.8); break;
    case "win": rr(48, 64, 160, 128, 14); P(); x.moveTo(128, 64); x.lineTo(128, 192); x.moveTo(128, 128); x.lineTo(208, 128); x.stroke(); break;
    case "clip": rr(64, 58, 128, 156, 14); rr(100, 42, 56, 32, 10, true); [110, 140, 170].forEach((y) => { P(); x.moveTo(90, y); x.lineTo(166, y); x.stroke(); }); break;
    case "cpu": rr(76, 76, 104, 104, 12); rr(104, 104, 48, 48, 6, true); [96, 128, 160].forEach((v) => { P(); x.moveTo(v, 50); x.lineTo(v, 76); x.moveTo(v, 180); x.lineTo(v, 206); x.moveTo(50, v); x.lineTo(76, v); x.moveTo(180, v); x.lineTo(206, v); x.stroke(); }); break;
    case "fan": for (let i = 0; i < 3; i++) { const a = (i * Math.PI * 2) / 3; P(); x.ellipse(128 + Math.cos(a) * 44, 128 + Math.sin(a) * 44, 44, 22, a, 0, 7); x.fill(); } break;
    case "wifi": arc(128, 180, 30, -2.4, -0.74); arc(128, 180, 66, -2.4, -0.74); arc(128, 180, 102, -2.4, -0.74); P(); x.arc(128, 180, 12, 0, 7); x.fill(); break;
    case "kbd": rr(40, 80, 176, 100, 14); for (let r = 0; r < 2; r++) for (let i = 0; i < 5; i++) rr(58 + i * 30, 96 + r * 30, 18, 16, 3, true); rr(86, 156, 84, 10, 4, true); break;
    case "mouse": rr(84, 48, 88, 160, 44); P(); x.moveTo(128, 50); x.lineTo(128, 100); x.stroke(); break;
    case "trash": rr(78, 90, 100, 120, 10); P(); x.moveTo(60, 78); x.lineTo(196, 78); x.moveTo(108, 62); x.lineTo(148, 62); x.stroke(); [110, 146].forEach((v) => { P(); x.moveTo(v, 112); x.lineTo(v, 188); x.stroke(); }); break;
    case "folder": P(); x.moveTo(44, 76); x.lineTo(104, 76); x.lineTo(120, 96); x.lineTo(212, 96); x.lineTo(212, 190); x.lineTo(44, 190); x.closePath(); x.fill(); break;
    case "search": arc(112, 112, 46, 0, 7); P(); x.lineWidth = 22; x.moveTo(146, 146); x.lineTo(196, 196); x.stroke(); break;
    case "dock": rr(40, 150, 176, 40, 12); [72, 128, 184].forEach((v) => rr(v - 18, 100, 36, 36, 8, true)); break;
    case "music": P(); x.moveTo(100, 176); x.lineTo(100, 66); x.lineTo(180, 50); x.lineTo(180, 160); x.stroke(); P(); x.ellipse(82, 178, 26, 20, -0.3, 0, 7); x.fill(); P(); x.ellipse(162, 162, 26, 20, -0.3, 0, 7); x.fill(); break;
    case "call": x.lineWidth = 30; P(); x.arc(128, 128, 64, 2.2, 5.6, false); x.stroke(); [2.2, 5.6].forEach((a) => { P(); x.ellipse(128 + Math.cos(a) * 64, 128 + Math.sin(a) * 64, 30, 22, a + 1.57, 0, 7); x.fill(); }); break;
    case "user": P(); x.arc(128, 96, 38, 0, 7); x.fill(); P(); x.arc(128, 216, 74, Math.PI, 0); x.fill(); break;
    case "eye": P(); x.moveTo(36, 128); x.quadraticCurveTo(128, 30, 220, 128); x.quadraticCurveTo(128, 226, 36, 128); x.stroke(); P(); x.arc(128, 128, 26, 0, 7); x.fill(); break;
    case "card": rr(40, 72, 176, 116, 14); rr(40, 96, 176, 24, 0, true); rr(62, 146, 50, 14, 4, true); break;
    case "play": P(); x.moveTo(96, 72); x.lineTo(186, 128); x.lineTo(96, 184); x.closePath(); x.fill(); break;
    case "logo": x.font = "900 170px Inter, Arial, sans-serif"; x.textAlign = "center"; x.textBaseline = "middle"; x.fillText("V", 128, 140); break;
  }
  if (slash) { x.strokeStyle = "#ff3048"; x.lineWidth = 22; P(); x.moveTo(52, 204); x.lineTo(204, 52); x.stroke(); }
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t;
}
const iconMat = (kind, bg, slash, dim = 0xb8b8b8) => new THREE.MeshBasicMaterial({ map: iconTex(kind, bg, slash), color: dim, transparent: true, toneMapped: false });

// ---------- desk + room lights ----------
const desk = rbox(9, 0.3, 5, 0.12, std(0x221d66, 0x0c0a30, 0.7, 0.1)); desk.position.set(0, -0.14, -0.6); root.add(desk);
const pl = new THREE.PointLight(0xe8e2ff, 18, 9, 1.6); pl.position.set(-1.6, 3.2, 2.2); root.add(pl);
const rim = new THREE.PointLight(0xff8a3a, 10, 8, 1.6); rim.position.set(2.6, 2.2, -2.4); root.add(rim);

// ---------- laptop at the origin, screen faces +z ----------
root.add(at(rbox(2.6, 0.1, 1.7, 0.04, mBody), 0, 0.05, 0));
const keys = rbox(2.2, 0.02, 0.8, 0.01, mDark); keys.position.set(0, 0.105, -0.2); root.add(keys);
const pad = rbox(0.8, 0.02, 0.45, 0.01, mDark); pad.position.set(0, 0.105, 0.5); root.add(pad);
const lid = new THREE.Group(); lid.position.set(0, 0.1, -0.85); lid.rotation.x = -0.12; root.add(lid);
const shell = rbox(2.6, 1.7, 0.06, 0.04, mBody); shell.position.set(0, 0.85, 0); lid.add(shell);
const mScreen = new THREE.MeshBasicMaterial({ color: 0x0b0a26, toneMapped: false });
plane(2.4, 1.5, mScreen, 0, 0.85, 0.035, lid);
// menu bar: dim strip, a few grey "menu" words on the left, an accent line under it
const mBar = glow(VIOLET, 0.35); plane(2.4, 0.12, mBar, 0, 1.54, 0.037, lid);
const accent = plane(2.4, 0.015, glow(VIOLET, 1.6), 0, 1.475, 0.038, lid);
const mWord = new THREE.MeshBasicMaterial({ color: 0x9a94d0, toneMapped: false });
[[-1.1, 0.06], [-0.98, 0.12], [-0.83, 0.1], [-0.69, 0.08]].forEach(([x0, w]) => plane(w, 0.03, mWord, x0 + w / 2, 1.54, 0.039, lid));

// ---------- s1-s2: a dozen paid apps with red price tags ----------
const KINDS = ["vol", "win", "clip", "cpu", "fan", "wifi", "kbd", "mouse", "trash", "folder", "search", "dock"];
const BGS = ["#5b4bd6", "#3a62d8", "#7a46c8", "#4a52b8"];
const tagMat = glow(RED, 1.6);
const apps = KINDS.map((k, i) => {
  const gp = new THREE.Group(); lid.add(gp); gp.visible = false;
  plane(0.34, 0.34, iconMat(k, BGS[i % 4]), 0, 0, 0, gp);
  const tag = new THREE.Group(); tag.position.set(0.15, 0.15, 0.01); gp.add(tag);
  tag.add(new THREE.Mesh(new THREE.CircleGeometry(0.07, 24), tagMat));
  const d = wt(["$"], WHITE, 1.0, 0.16); d.position.z = 0.002; tag.add(d);
  gp.userData = { tag, home: new THREE.Vector3(-0.78 + (i % 4) * 0.52, 1.22 - Math.floor(i / 4) * 0.38, 0.05), bar: new THREE.Vector3(1.1 - i * 0.125, 1.54, 0.05) };
  return gp;
});

// ---------- s3+: the Vorssaint icon, $0 plate, star, small tool tiles ----------
const logo = new THREE.Group(); lid.add(logo);
logo.add(rbox(0.8, 0.8, 0.06, 0.14, mDark));
plane(0.78, 0.78, iconMat("logo", "#1f9a5a", false, 0xc8c8c8), 0, 0, 0.032, logo);
plane(0.86, 0.86, glow(GREEN, 0.6), 0, 0, -0.035, logo);
const barIcon = plane(0.1, 0.1, iconMat("logo", "#1f9a5a", false, 0xe0e0e0), 1.1, 1.54, 0.045, lid);
const barRing = new THREE.Mesh(new THREE.RingGeometry(0.075, 0.09, 32), glow(GREEN, 1.6)); barRing.position.set(1.1, 1.54, 0.044); lid.add(barRing);
const plateZ = new THREE.Group(); lid.add(plateZ); plateZ.visible = false;
plateZ.add(rbox(0.9, 0.52, 0.05, 0.06, mDark)); plane(0.93, 0.55, glow(GREEN, 0.9), 0, 0, -0.03, plateZ);
const zt = wt(["$0"], GREEN, 1.4, 0.8); zt.position.z = 0.03; plateZ.add(zt);
const starShape = new THREE.Shape();
for (let i = 0; i < 10; i++) { const a = Math.PI / 2 + (i * Math.PI) / 5, r = i % 2 ? 0.17 : 0.4; starShape[i ? "lineTo" : "moveTo"](Math.cos(a) * r, Math.sin(a) * r); }
const star = new THREE.Mesh(new THREE.ExtrudeGeometry(starShape, { depth: 0.08, bevelEnabled: true, bevelSize: 0.03, bevelThickness: 0.03, bevelSegments: 2 }), glow(ORANGE, 1.5));
root.add(star);
const TOOLS = ["vol", "win", "clip", "cpu", "search", "dock"];
const tools = TOOLS.map((k) => { const m = plane(0.26, 0.26, iconMat(k, "#5b4bd6"), 0, 0, 0.06, lid); m.visible = false; return m; });

// ---------- s4: dropdown panels under the menu bar icon ----------
function panel(w, h, cx, cy) {
  const gp = new THREE.Group(); gp.position.set(cx, cy, 0.05); lid.add(gp); gp.visible = false;
  gp.add(rbox(w, h, 0.03, 0.05, std(0x1a1650, 0x0a0830, 0.5, 0.2)));
  plane(w + 0.03, h + 0.03, glow(VIOLET, 0.7), 0, 0, -0.02, gp);
  return gp;
}
// volume mixer: three apps, each with its own slider
const mix = panel(1.5, 1.05, 0.35, 0.9);
const mFill = glow(GREEN, 1.2), mTrack = new THREE.MeshBasicMaterial({ color: 0x3a3570, toneMapped: false });
const sliders = ["music", "play", "call"].map((k, i) => {
  const y = 0.3 - i * 0.3;
  plane(0.22, 0.22, iconMat(k, BGS[i]), -0.55, y, 0.02, mix);
  plane(0.95, 0.04, mTrack, 0.12, y, 0.02, mix);
  const fill = plane(1, 0.045, mFill, 0, y, 0.022, mix);
  const knob = new THREE.Mesh(new THREE.CircleGeometry(0.055, 24), glow(WHITE, 1.0)); knob.position.set(0, y, 0.025); mix.add(knob);
  return { fill, knob, to: [0.85, 0.3, 0.6][i] };
});
const setSlider = (s, v) => { const x0 = -0.355, L = 0.95 * v; s.fill.scale.x = Math.max(1e-3, L); s.fill.position.x = x0 + L / 2; s.knob.position.x = x0 + L; };
// window snapping: two windows that snap into the left and right halves
function winTex(hex) {
  const c = document.createElement("canvas"); c.width = 400; c.height = 300; const x = c.getContext("2d");
  x.fillStyle = "#d8d2ff"; x.fillRect(0, 0, 400, 300); x.fillStyle = hex; x.fillRect(0, 0, 400, 34);
  x.fillStyle = "#9a90e0"; [70, 110, 150, 190, 230].forEach((y, i) => x.fillRect(24, y, [300, 240, 330, 200, 280][i], 18));
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t;
}
const wins = ["#6a5ff0", "#3a8fd8"].map((h) => { const m = plane(1, 1, new THREE.MeshBasicMaterial({ map: winTex(h), color: 0xb0b0b0, toneMapped: false }), 0, 0.8, 0.05, lid); m.visible = false; return m; });
const snapLine = plane(0.02, 1.34, glow(GREEN, 2.0), 0, 0.79, 0.06, lid);
// clipboard history: a search field with "link", three copied items, the match glows green
const clipP = panel(1.5, 1.2, 0.35, 0.85);
plane(1.3, 0.2, new THREE.MeshBasicMaterial({ color: 0x2c2766, toneMapped: false }), 0, 0.42, 0.02, clipP);
plane(0.14, 0.14, iconMat("search", "#2c2766"), -0.55, 0.42, 0.025, clipP);
const q = wt(["link"], WHITE, 1.0, 0.5); q.position.set(-0.18, 0.42, 0.025); clipP.add(q);
const rows = [0.12, -0.14, -0.4].map((y, i) => {
  const gp = new THREE.Group(); gp.position.set(0, y, 0.02); clipP.add(gp);
  plane(1.3, 0.2, i ? new THREE.MeshBasicMaterial({ color: 0x24205a, toneMapped: false }) : glow(GREEN, 0.45), 0, 0, 0, gp);
  plane(0.13, 0.13, iconMat("clip", BGS[i]), -0.55, 0, 0.003, gp);
  plane([0.8, 0.6, 0.7][i], 0.035, mWord, -0.4 + [0.8, 0.6, 0.7][i] / 2, 0, 0.003, gp);
  return gp;
});

// ---------- s5: music -> speaker, call -> headset ----------
const onMusic = plane(0.5, 0.5, iconMat("music", "#1f9a5a"), -0.55, 0.8, 0.05, lid);
const onCall = plane(0.5, 0.5, iconMat("call", "#5b4bd6"), 0.55, 0.8, 0.05, lid);
const SPK = new THREE.Vector3(-0.62, 0, 1.3), HS = new THREE.Vector3(0.65, 0, 1.3);
const speaker = new THREE.Group(); speaker.position.copy(SPK); speaker.rotation.y = 0.25; root.add(speaker);
speaker.add(at(rbox(0.42, 0.72, 0.36, 0.05, mBody), 0, 0.36, 0));
[[0.5, 0.13], [0.22, 0.08]].forEach(([y, r]) => {
  const cone = new THREE.Mesh(new THREE.CircleGeometry(r, 28), mDark); cone.position.set(0, y, 0.182); speaker.add(cone);
  const ring = new THREE.Mesh(new THREE.RingGeometry(r * 0.95, r * 1.12, 28), glow(GREEN, 0.8)); ring.position.set(0, y, 0.184); speaker.add(ring);
});
const waves = [0, 1, 2].map(() => { const w = new THREE.Mesh(new THREE.TorusGeometry(0.2, 0.012, 6, 40, Math.PI * 0.6), glow(GREEN, 0.9)); w.rotation.z = -Math.PI * 0.3; speaker.add(w); return w; });
const headset = new THREE.Group(); headset.position.copy(HS); headset.rotation.y = -0.25; root.add(headset);
headset.add(at(rbox(0.36, 0.04, 0.3, 0.02, mBody), 0, 0.02, 0));
headset.add(at(new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.025, 0.42, 12), mBody), 0, 0.25, 0));
const band = new THREE.Mesh(new THREE.TorusGeometry(0.2, 0.035, 10, 32, Math.PI), mLav); band.position.set(0, 0.5, 0); headset.add(band);
[-0.2, 0.2].forEach((x) => { const c = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.09, 0.07, 24), mLav); c.rotation.z = Math.PI / 2; c.position.set(x, 0.46, 0); headset.add(c); const p = new THREE.Mesh(new THREE.CircleGeometry(0.06, 20), glow(VIOLET, 1.4)); p.position.set(x + Math.sign(x) * 0.036, 0.46, 0); p.rotation.y = Math.sign(x) * Math.PI / 2; headset.add(p); });
const mic = new THREE.Mesh(new THREE.CylinderGeometry(0.015, 0.015, 0.22, 8), mLav); mic.position.set(0.2, 0.36, 0.1); mic.rotation.x = 1.0; headset.add(mic);
const bMusic = beam(GREEN, 1.6, 0.03), bCall = beam(VIOLET, 1.8, 0.03);
const v = new THREE.Vector3(), v2 = new THREE.Vector3();

// ---------- s6: features list; switched-off rows disappear; then no account / tracking / subscription ----------
const feat = panel(1.6, 1.3, 0, 0.8);
const FEAT = ["vol", "fan", "win", "wifi", "clip", "dock"], ON = [1, 0, 1, 0, 1, 0];
const frows = FEAT.map((k, i) => {
  const gp = new THREE.Group(); feat.add(gp);
  plane(0.16, 0.16, iconMat(k, BGS[i % 4]), -0.6, 0, 0.02, gp);
  plane(0.7, 0.035, mWord, -0.12, 0, 0.02, gp);
  const tr = new THREE.MeshBasicMaterial({ color: 0x3a3570, toneMapped: false });
  plane(0.24, 0.12, tr, 0.55, 0, 0.02, gp);
  const kn = new THREE.Mesh(new THREE.CircleGeometry(0.05, 20), glow(WHITE, 0.6)); kn.position.set(0.49, 0, 0.025); gp.add(kn);
  gp.userData = { tr, kn };
  return gp;
});
const nos = [["user", "#5b4bd6"], ["eye", "#3a62d8"], ["card", "#7a46c8"]].map(([k, bg], i) => { const m = plane(0.5, 0.5, iconMat(k, bg, true), -0.62 + i * 0.62, 0.8, 0.06, lid); m.visible = false; return m; });

// ---------- captions ----------
title("NEVER PAY FOR A DOZEN MAC APPS");
cap("s1", "exploring", ["EXPLORING GITHUB REPOS"], WHITE, { until: "s1" });
cap("s2", "volume", ["A VOLUME APP"], RED, { until: ["s2", "window"] });
cap("s2", "window", ["A WINDOW APP"], RED, { until: ["s2", "clipboard"] });
cap("s2", "clipboard", ["A CLIPBOARD APP"], RED, { until: ["s2", "costs"] });
cap("s2", "costs", ["EACH ONE COSTS MONEY"], RED, { until: ["s2", "menu"], boom: 0.5 });
cap("s2", "menu", ["A MENU BAR FULL OF ICONS"], RED, { boom: 0.4 });
cap("s3", "get", ["VORSSAINT"], GREEN, { until: ["s3", "almost"], boom: 0.5 });
cap("s3", "almost", ["ALMOST 35,000 STARS", "IN 5 MONTHS"], ORANGE, { until: ["s3", "free"], boom: 0.5 });
cap("s3", "free", ["IT'S FREE"], GREEN, { until: ["s3", "puts"] });
cap("s3", "puts", ["ALL BEHIND ONE ICON"], GREEN);
cap("s4", "set", ["VOLUME FOR EACH APP"], VIOLET, { until: ["s4", "snap"] });
cap("s4", "snap", ["SNAP WINDOWS"], VIOLET, { until: ["s4", "search"], boom: 0.4 });
cap("s4", "search", ["SEARCH WHAT YOU COPIED"], VIOLET);
cap("s5", "play", ["MUSIC ON SPEAKERS"], GREEN, { until: ["s5", "while"] });
cap("s5", "while", ["CALL IN YOUR HEADSET"], VIOLET);
cap("s6", "install", ["INSTALL WHAT YOU USE"], GREEN, { until: ["s6", "the"] });
cap("s6", "the", ["THE REST DISAPPEARS"], GREEN, { until: ["s6", "no"] });
cap("s6", "no", ["NO ACCOUNT"], GREEN, { until: ["s6", "no"], untilN: 2, boom: 0.3 });
cap("s6", "no", ["NO TRACKING"], GREEN, { n: 2, until: ["s6", "no"], untilN: 3, boom: 0.3 });
cap("s6", "no", ["NO SUBSCRIPTION"], GREEN, { n: 3, boom: 0.3 });
endCard(["DON'T BUY A DOZEN APPS.", "GET ONE ICON."]);
boom("s1", "never", 0.4);

// ---------- timings (global seconds) ----------
const T = {
  never: g("s1", "never"), s2: S.s2[0], vol: g("s2", "volume"), win: g("s2", "window"), clip: g("s2", "clipboard"), costs: g("s2", "costs"), menu: g("s2", "menu"),
  s3: S.s3[0], almost: g("s3", "almost"), free: g("s3", "free"), puts: g("s3", "puts"), tools: g("s3", "tools"), behind: g("s3", "behind"), one: g("s3", "one"),
  s4: S.s4[0], snap: g("s4", "snap"), into: g("s4", "into"), lay: g("s4", "layouts"), search: g("s4", "search"),
  s5: S.s5[0], speakers: g("s5", "speakers"), call: g("s5", "call"), headset: g("s5", "headset"),
  s6: S.s6[0], only: g("s6", "only"), rest: g("s6", "rest"), no1: g("s6", "no"), no2: g("s6", "no", 2), no3: g("s6", "no", 3),
  s7: S.s7[0], s8: S.s8[0],
};

// ---------- shots: [cx,cy,cz, lx,ly,lz, fov] ----------
const LAP = (x, y, z) => [x, y, z, 0, 0.95, -0.6, 46];
const BAR = [0.37, 1.72, 3.1, 0.37, 1.42, -1.0, 46];
const SH = [
  { at: 0, K: [[0, [0.3, 1.8, 5.6, 0, 0.9, -0.5, 48]], [T.s2, [0.1, 1.8, 5.1, 0, 0.95, -0.6, 47]]] },
  { at: T.s2, K: [[0, LAP(-0.4, 1.7, 5.1)], [T.menu - T.s2, LAP(0.2, 1.7, 4.9)]] },
  { at: T.menu - 0.1, K: [[0, BAR], [2, [0.47, 1.74, 2.9, 0.42, 1.42, -1.0, 46]]] },
  { at: T.s3, K: [[0, [-0.6, 2.1, 5.8, 0, 1.0, -0.6, 48]], [3.6, [0.2, 1.8, 5.2, 0, 1.0, -0.6, 46]]] },
  { at: T.puts - 0.1, K: [[0, LAP(0.5, 1.7, 5.0)], [T.one - T.puts, LAP(0.2, 1.65, 4.8)]] },
  { at: T.one - 0.1, K: [[0, BAR], [1.4, [0.55, 1.74, 2.8, 0.5, 1.42, -1.0, 46]]] },
  { at: T.s4, K: [[0, LAP(0.4, 1.7, 5.0)], [4, LAP(0.0, 1.7, 4.8)]] },
  { at: T.s5, K: [[0, [-0.3, 1.35, 6.3, 0, 0.75, 0, 46]], [3, [0.0, 1.4, 6.0, 0, 0.75, 0, 46]]] },
  { at: T.s6, K: [[0, LAP(-0.4, 1.7, 5.1)], [4.8, LAP(0.2, 1.7, 4.9)]] },
  { at: T.s7, calm: 1, K: [[0, LAP(0.0, 1.8, 5.4)], [2, LAP(0.3, 1.9, 5.8)]] },
];

run("vorssaint-world", (t) => {
  root.visible = t < T.s8 - 0.12; // hide the scene before the CTA fades in
  const wrong = t < T.s3;
  accent.material.color.set(wrong ? (t >= T.never ? RED : VIOLET) : GREEN).multiplyScalar(wrong ? 1.6 : 0.8);
  mBar.color.set(wrong && t >= T.menu ? 0x5a1020 : 0x2a2460);
  mScreen.color.set(wrong ? 0x0b0a26 : 0x0a1a1a);

  // s1: a dozen paid apps pop in one by one; s2: three of them called out, tags flash, then they cram into the menu bar
  apps.forEach((a, i) => {
    const t0 = 0.15 + i * 0.12, k = sm(t0, t0 + 0.15, t);
    a.visible = wrong && k > 0.01;
    const fly = sm(T.menu - 0.1 + i * 0.04, T.menu + 0.4 + i * 0.04, t);
    a.position.lerpVectors(a.userData.home, a.userData.bar, fly);
    const hl = i < 3 ? sm([T.vol, T.win, T.clip][i] - 0.1, [T.vol, T.win, T.clip][i] + 0.1, t) * (1 - sm([T.win, T.clip, T.costs][i] - 0.15, [T.win, T.clip, T.costs][i], t)) : 0;
    a.scale.setScalar(Math.max(1e-3, pop(k) * (1 + 0.35 * hl) * (1 - 0.7 * fly)));
    a.position.z += 0.05 * hl;
    const tg = a.userData.tag, tk = 1 + 0.6 * Math.max(0, 1 - Math.abs(t - T.costs - 0.05 * i) / 0.25);
    tg.visible = fly < 0.3; tg.scale.setScalar(tk);
  });

  // s3: icon on "Instead", star on "Almost", $0 on "free"; on "puts" the tools fly into the icon, which goes up to the menu bar
  const lk = sm(T.s3 - 0.05, T.s3 + 0.15, t) * (1 - sm(T.free - 0.15, T.free, t));
  const lk2 = sm(T.puts - 0.05, T.puts + 0.15, t);
  const up = sm(T.behind, T.one + 0.1, t);
  const logoK = t < T.puts - 0.05 ? lk : lk2 * (up < 0.98 ? 1 : 0);
  logo.visible = logoK > 0.01 && t < T.s4;
  logo.scale.setScalar(Math.max(1e-3, pop(logoK) * (1 - 0.875 * up)));
  logo.position.set(1.1 * up, 0.84 + 0.7 * up, 0.25 - 0.19 * up); logo.rotation.y = (1 - up) * 0.25 * Math.sin((t - T.s3) * 2);
  // later: the logo sits on the screen again on the end card
  if (t >= T.s7) { const k = sm(T.s7 - 0.05, T.s7 + 0.15, t); logo.visible = true; logo.scale.setScalar(pop(k)); logo.position.set(0, 0.84, 0.25); logo.rotation.y = 0.2 * Math.sin((t - T.s7) * 2); }
  barIcon.visible = !wrong && (t >= T.one + 0.05 || t >= T.s4);
  barRing.visible = barIcon.visible; barRing.scale.setScalar(1 + 0.25 * Math.sin(t * 5));
  show(plateZ, sm(T.free - 0.1, T.free + 0.1, t) * (1 - sm(T.puts - 0.15, T.puts - 0.02, t)), 1); plateZ.position.set(0, 0.84, 0.22);
  const sk = sm(T.almost - 0.1, T.almost + 0.25, t) * (1 - sm(T.free - 0.15, T.free + 0.1, t));
  star.visible = sk > 0.01; star.scale.setScalar(0.34 * sk * (1 + 0.08 * Math.sin(t * 6)));
  star.position.set(0, 1.9, -0.3); star.rotation.y = 0.35 * Math.sin((t - T.almost) * 2.5);
  tools.forEach((m, i) => {
    const a = (i / tools.length) * Math.PI * 2 + 0.3, inK = sm(T.puts + 0.05 * i, T.puts + 0.2 + 0.05 * i, t), gather = sm(T.tools - 0.1, T.behind, t);
    m.visible = inK > 0.01 && gather < 0.97;
    m.position.set(Math.cos(a) * 0.85 * (1 - gather), 0.84 + Math.sin(a) * 0.55 * (1 - gather), 0.3);
    m.scale.setScalar(Math.max(1e-3, pop(inK) * (1 - 0.7 * gather)));
  });

  // s4: volume mixer, then windows snap into halves, then clipboard search
  const in4 = t >= T.s4 && t < T.s5;
  const mk = sm(T.s4 - 0.05, T.s4 + 0.15, t);
  mix.visible = in4 && t < T.snap - 0.05; mix.scale.set(1, Math.max(1e-3, pop(mk)), 1); mix.position.y = 0.9 + 0.55 * (1 - pop(mk));
  sliders.forEach((s, i) => setSlider(s, 0.5 + (s.to - 0.5) * sm(T.s4 + 0.2 + 0.25 * i, T.s4 + 0.7 + 0.25 * i, t)));
  const wk = sm(T.snap - 0.05, T.snap + 0.12, t), sn = sm(T.into - 0.05, T.lay + 0.15, t);
  wins.forEach((w, i) => {
    w.visible = in4 && t >= T.snap - 0.05 && t < T.search - 0.05;
    const fx = [-0.25, 0.3][i], fy = [0.95, 0.65][i], tx = [-0.6, 0.6][i];
    w.position.set(fx + (tx - fx) * sn, fy + (0.79 - fy) * sn, 0.05 + 0.01 * i);
    w.scale.set(pop(wk) * (0.95 + (1.17 - 0.95) * sn), pop(wk) * (0.7 + (1.34 - 0.7) * sn), 1);
  });
  snapLine.visible = in4 && t >= T.lay && t < T.search - 0.05;
  const ck = sm(T.search - 0.05, T.search + 0.15, t);
  clipP.visible = in4 && t >= T.search - 0.05; clipP.scale.set(1, Math.max(1e-3, pop(ck)), 1); clipP.position.y = 0.85 + 0.6 * (1 - pop(ck));
  q.visible = t >= T.search + 0.1;
  rows.forEach((r, i) => { const k = sm(T.search + 0.15 + 0.12 * i, T.search + 0.3 + 0.12 * i, t); r.visible = k > 0.01; r.scale.setScalar(Math.max(1e-3, pop(k))); });

  // s5: music beams to the speaker, the call beams to the headset
  const in5 = t >= T.s5 && t < T.s6;
  onMusic.visible = in5; onMusic.scale.setScalar(pop(sm(T.s5 - 0.05, T.s5 + 0.12, t)));
  onCall.visible = in5; onCall.scale.setScalar(pop(sm(T.s5 - 0.05, T.s5 + 0.12, t)));
  speaker.visible = headset.visible = in5;
  lid.localToWorld(v.set(-0.55, 0.62, 0.06)); bMusic.set(v, v2.set(SPK.x, 0.8, SPK.z), in5 ? sm(T.speakers - 0.1, T.speakers + 0.2, t) * 0.9 : 0);
  lid.localToWorld(v.set(0.55, 0.62, 0.06)); bCall.set(v, v2.set(HS.x, 0.66, HS.z), in5 ? sm(T.call - 0.1, T.call + 0.2, t) * 0.9 : 0);
  waves.forEach((w, i) => { const ph = ((t - T.speakers) * 1.4 + i / 3) % 1; w.visible = in5 && t >= T.speakers; w.position.set(0, 0.5, 0.2 + 0.25 * ph); w.scale.setScalar(0.8 + 0.8 * ph); });

  // s6: features list; on "only" the used ones switch on; "the rest disappears" the others shrink away
  const in6 = t >= T.s6 && t < T.no1 - 0.05;
  const fk = sm(T.s6 - 0.05, T.s6 + 0.15, t), gone = sm(T.rest - 0.05, T.rest + 0.3, t);
  feat.visible = in6; feat.scale.set(1, Math.max(1e-3, pop(fk)), 1);
  let slot = 0;
  frows.forEach((r, i) => {
    const on = ON[i], sw = on ? sm(T.only + 0.1 * slot, T.only + 0.2 + 0.1 * slot, t) : 0;
    r.userData.kn.position.x = 0.49 + 0.12 * sw; r.userData.tr.color.set(sw > 0.5 ? 0x1f9a5a : 0x3a3570);
    const keep = on ? 1 : 1 - gone;
    r.visible = keep > 0.02; r.scale.setScalar(Math.max(1e-3, keep));
    const yAll = 0.5 - i * 0.2, yKept = 0.4 - (on ? (slot++) : 0) * 0.4;
    r.position.set(0, yAll + (yKept - yAll) * gone, 0.02);
  });
  // no account / no tracking / no subscription
  nos.forEach((m, i) => { const k = sm([T.no1, T.no2, T.no3][i] - 0.1, [T.no1, T.no2, T.no3][i] + 0.1, t); m.visible = t < T.s7 && k > 0.01; m.scale.setScalar(pop(k)); });

  const { punch } = shoot(SH, t);
  const spike = overlays(t);
  bloom.strength = 1.0 + 1.2 * punch * punch + spike;
});
