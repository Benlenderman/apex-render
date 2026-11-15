// NEVER PAY FOR DEMO ZOOMS (Recordly). Laptop with a product demo on a dark desk; wrong = bills, the recording flies off to a
// designer's screen and a clock spins (V2, V3, V4); right = the demo zooms itself, cursor glides and bounces, bubble + background, exports.
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
const tex = (w, h, draw) => { const c = document.createElement("canvas"); c.width = w; c.height = h; draw(c.getContext("2d")); const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t; };

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

// ---------- s6: colorful background behind the demo ----------
const mGrad = new THREE.MeshBasicMaterial({ toneMapped: false, color: 0xb0b0b0, map: tex(512, 320, (x) => {
  const gr = x.createLinearGradient(0, 0, 512, 320); gr.addColorStop(0, "#ff7a3a"); gr.addColorStop(0.5, "#d0409a"); gr.addColorStop(1, "#5a3cff");
  x.fillStyle = gr; x.fillRect(0, 0, 512, 320);
}) });
const grad = plane(2.4, 1.36, mGrad, 0, 0.79, 0.037, lid);
const shadow = plane(2.2, 1.3, new THREE.MeshBasicMaterial({ color: 0x000000, transparent: true, opacity: 0.45 }), 0.06, 0.73, 0.038, lid);

// ---------- the product demo on the screen (a web app: nav, sidebar, cards, a SIGN UP button) ----------
const DW = 2.2, DH = 1.3, DY = 0.79;
const demoTex = tex(1024, 606, (x) => {
  x.fillStyle = "#14123a"; x.fillRect(0, 0, 1024, 606);
  x.fillStyle = "#221e5c"; x.fillRect(0, 0, 1024, 70); x.fillRect(0, 70, 190, 536);
  x.fillStyle = "#8a7bff"; x.beginPath(); x.arc(46, 35, 18, 0, 7); x.fill();
  x.fillStyle = "#b8b0ff"; [100, 170, 240].forEach((X) => x.fillRect(X + 520, 28, 46, 14));
  for (let i = 0; i < 6; i++) { x.fillStyle = i === 1 ? "#8a7bff" : "#4a4498"; x.fillRect(28, 110 + i * 56, 134, 22); }
  x.fillStyle = "#e8e4ff"; x.fillRect(230, 110, 430, 40); x.fillStyle = "#6e66c0"; x.fillRect(230, 170, 320, 18);
  [[230, "#2fd07a"], [490, "#8a7bff"], [750, "#ff8a3a"]].forEach(([X, c], i) => {
    x.fillStyle = "#221e5c"; x.beginPath(); x.roundRect(X, 230, 230, 200, 18); x.fill();
    x.fillStyle = c; for (let b = 0; b < 5; b++) { const h = [60, 110, 80, 140, 100][(b + i * 2) % 5]; x.fillRect(X + 24 + b * 40, 400 - h, 26, h); }
  });
  x.fillStyle = "#2fd07a"; x.beginPath(); x.roundRect(760, 470, 220, 76, 38); x.fill();
  x.fillStyle = "#0b2a1a"; x.font = "900 32px Inter, Arial, sans-serif"; x.textAlign = "center"; x.textBaseline = "middle"; x.fillText("SIGN UP", 870, 509);
});
demoTex.wrapS = demoTex.wrapT = THREE.ClampToEdgeWrapping;
const demoHolder = new THREE.Group(); demoHolder.position.set(0, DY, 0.04); lid.add(demoHolder);
const demo = plane(DW, DH, new THREE.MeshBasicMaterial({ map: demoTex, toneMapped: false, color: 0xc8c8c8 }), 0, 0, 0, demoHolder);
// zoom: z = factor, (cu,cv) = centre in uv; returns display xy of a uv point
const Z = { z: 1, cu: 0.5, cv: 0.5 };
function setZoom(z, cu, cv) {
  const h = 0.5 / z; Z.z = z; Z.cu = THREE.MathUtils.clamp(cu, h, 1 - h); Z.cv = THREE.MathUtils.clamp(cv, h, 1 - h);
  demoTex.repeat.set(1 / z, 1 / z); demoTex.offset.set(Z.cu - h, Z.cv - h);
}
const disp = (u, v, out) => out.set((u - Z.cu) * Z.z * DW, (v - Z.cv) * Z.z * DH, 0);
// uv of things on the demo
const BTN = [870 / 1024, 1 - 509 / 606], CARD2 = [605 / 1024, 1 - 330 / 606];

// green "zoom here" frame (outline only)
const zf = new THREE.LineSegments(new THREE.EdgesGeometry(new THREE.PlaneGeometry(1, 1)), new THREE.LineBasicMaterial({ color: new THREE.Color(GREEN).multiplyScalar(2.0), toneMapped: false }));
demoHolder.add(zf); zf.position.z = 0.01;
const zfC = [-1, 1].flatMap((sx) => [-1, 1].map((sy) => { const c = new THREE.Mesh(new THREE.PlaneGeometry(0.06, 0.06), glow(GREEN, 2.0)); c.userData.s = [sx, sy]; demoHolder.add(c); return c; }));
function frameAt(u, v, wu, hv, a) {
  const p = disp(u, v, new THREE.Vector3()), w = wu * Z.z * DW, h = hv * Z.z * DH;
  zf.visible = a > 0.01; zf.position.set(p.x, p.y, 0.01); zf.scale.set(w * (1 + 0.25 * (1 - a)), h * (1 + 0.25 * (1 - a)), 1);
  zfC.forEach((c) => { c.visible = zf.visible; c.position.set(p.x + c.userData.s[0] * zf.scale.x / 2, p.y + c.userData.s[1] * zf.scale.y / 2, 0.012); });
}

// cursor: a white arrow pointer + a click ring
const arrow = new THREE.Shape(); [[0, 0], [0, -0.2], [0.05, -0.15], [0.09, -0.24], [0.12, -0.225], [0.08, -0.14], [0.14, -0.14]].forEach(([a, b], i) => arrow[i ? "lineTo" : "moveTo"](a, b));
const cursor = new THREE.Mesh(new THREE.ShapeGeometry(arrow), glow(WHITE, 1.3)); demoHolder.add(cursor);
const ring = new THREE.Mesh(new THREE.RingGeometry(0.07, 0.095, 40), new THREE.MeshBasicMaterial({ color: new THREE.Color(GREEN).multiplyScalar(2), toneMapped: false, transparent: true })); demoHolder.add(ring);
const trail = Array.from({ length: 10 }, () => { const d = new THREE.Mesh(new THREE.CircleGeometry(0.018, 12), glow(VIOLET, 1.6)); demoHolder.add(d); return d; });

// REC / STOP badge in the top-left corner of the demo
const rec = new THREE.Group(); rec.position.set(-0.78, 0.5, 0.02); demoHolder.add(rec);
plane(0.5, 0.16, new THREE.MeshBasicMaterial({ color: 0x0b0a26 }), 0, 0, 0, rec);
const recDot = new THREE.Mesh(new THREE.CircleGeometry(0.045, 20), glow(0xff4060, 1.6)); recDot.position.set(-0.16, 0, 0.002); rec.add(recDot);
const stopSq = plane(0.08, 0.08, glow(WHITE, 1.2), -0.16, 0, 0.002, rec);
const recT = wt(["REC"], WHITE, 1.0, 0.36); recT.position.set(0.06, 0, 0.004); rec.add(recT);
const stopT = wt(["STOP"], WHITE, 1.0, 0.36); stopT.position.set(0.06, 0, 0.004); rec.add(stopT);

// s6: face bubble (bottom right of the demo)
const face = new THREE.Group(); demoHolder.add(face);
face.add(new THREE.Mesh(new THREE.CircleGeometry(0.27, 48), new THREE.MeshBasicMaterial({ toneMapped: false, color: 0xd0d0d0, map: tex(256, 256, (x) => {
  x.fillStyle = "#3a5cff"; x.fillRect(0, 0, 256, 256);
  x.fillStyle = "#2a1a10"; x.beginPath(); x.ellipse(128, 100, 66, 60, 0, Math.PI, 0); x.fill();
  x.fillStyle = "#f0b48a"; x.beginPath(); x.ellipse(128, 118, 54, 64, 0, 0, 7); x.fill();
  x.fillStyle = "#f0b48a"; x.fillRect(104, 170, 48, 40); x.fillStyle = "#ff8a3a"; x.beginPath(); x.ellipse(128, 262, 110, 70, 0, 0, 7); x.fill();
  x.fillStyle = "#2a1a10"; [[108, 112], [148, 112]].forEach(([a, b]) => { x.beginPath(); x.arc(a, b, 7, 0, 7); x.fill(); });
  x.strokeStyle = "#a0402a"; x.lineWidth = 6; x.beginPath(); x.arc(128, 140, 20, 0.2, Math.PI - 0.2); x.stroke();
}) })));
const faceRing = new THREE.Mesh(new THREE.RingGeometry(0.27, 0.3, 48), glow(GREEN, 1.8)); faceRing.position.z = 0.001; face.add(faceRing);
face.position.set(0.72, -0.34, 0.03);

// ---------- s1: bills on the screen ----------
const mBill = std(0xfff0f2, 0x3a1a20, 0.5, 0.05);
const bills = [0, 1, 2].map((i) => {
  const b = new THREE.Group(); lid.add(b);
  b.add(rbox(0.5, 0.64, 0.03, 0.03, mBill));
  plane(0.44, 0.14, glow(RED, 1.1), 0, 0.2, 0.017, b);
  const mt = wt(["INVOICE"], WHITE, 1.0, 0.4); mt.position.set(0, 0.2, 0.02); b.add(mt);
  const d = wt(["$"], RED, 1.3, 0.5); d.position.set(0, -0.07, 0.02); b.add(d);
  [-0.22, -0.26].forEach((y) => plane(0.26, 0.02, new THREE.MeshBasicMaterial({ color: 0xd8a0a8 }), 0, y, 0.017, b));
  b.userData.home = new THREE.Vector3(-0.6 + 0.6 * i, 0.82 + (i % 2 ? 0.08 : -0.04), 0.12 + 0.03 * i);
  b.userData.rz = (i % 2 ? -1 : 1) * 0.08; b.visible = false; return b;
});

// ---------- file cards ----------
function makeFile(hex, txt) {
  const gp = new THREE.Group();
  gp.add(rbox(0.56, 0.72, 0.06, 0.05, mLav));
  const band = plane(0.46, 0.2, glow(hex, 0.55), 0, -0.12, 0.032, gp);
  const corner = new THREE.Mesh(new THREE.CircleGeometry(0.09, 3), glow(ORANGE, 1.4)); corner.position.set(0.19, 0.27, 0.033); corner.rotation.z = Math.PI / 4; gp.add(corner);
  [0.14, 0.06].forEach((y) => plane(0.3, 0.025, new THREE.MeshBasicMaterial({ color: 0x6a5fd0 }), -0.05, y, 0.032, gp));
  const t = wt([txt], WHITE, 1.0, 0.4); t.position.set(0, -0.12, 0.036); gp.add(t);
  gp.visible = false; root.add(gp); return gp;
}
const vid = makeFile(RED, "MP4");
const versions = ["V2", "V3", "V4"].map((n) => makeFile(RED, n));
const outs = [makeFile(GREEN, "MP4"), makeFile(VIOLET, "GIF")];

// ---------- s2: the designer's screen + a clock, up and behind ----------
const SV = new THREE.Vector3(0.9, 4.6, -5.5);
const station = new THREE.Group(); station.position.copy(SV); root.add(station);
station.add(rbox(2.2, 1.45, 0.14, 0.08, mBody));
plane(2.0, 1.25, new THREE.MeshBasicMaterial({ color: 0x2a0610, toneMapped: false }), 0, 0, 0.075, station);
const tl = plane(1.7, 0.1, glow(RED, 0.9), 0, -0.4, 0.08, station); // timeline strip
const tlHead = plane(0.04, 0.22, glow(WHITE, 1.4), -0.8, -0.4, 0.085, station);
const edT = wt(["EDITING..."], RED, 1.6, 1.4); edT.position.set(0, 0.2, 0.085); station.add(edT);
const stand = rbox(0.2, 0.9, 0.12, 0.04, mDark); stand.position.set(0, -1.1, -0.05); station.add(stand);
const svLight = new THREE.PointLight(0xff3040, 4, 6, 1.6); svLight.position.set(0, 0, 1.4); station.add(svLight);
const clock = new THREE.Group(); clock.position.set(-1.75, 0.35, 0.2); station.add(clock);
const cface = new THREE.Mesh(new THREE.CylinderGeometry(0.5, 0.5, 0.08, 48), std(0xf4eefc, 0x403850, 0.5, 0.1)); cface.rotation.x = Math.PI / 2; clock.add(cface);
const crim = new THREE.Mesh(new THREE.TorusGeometry(0.5, 0.05, 10, 48), glow(RED, 2.0)); clock.add(crim);
for (let i = 0; i < 12; i++) { const a = (i / 12) * Math.PI * 2, tk = plane(0.03, 0.09, new THREE.MeshBasicMaterial({ color: 0x302848 }), Math.sin(a) * 0.4, Math.cos(a) * 0.4, 0.045, clock); tk.rotation.z = -a; }
const hand = (len, w, hex) => { const p = new THREE.Group(); p.position.z = 0.05; plane(w, len, new THREE.MeshBasicMaterial({ color: hex }), 0, len / 2 - 0.03, 0, p); clock.add(p); return p; };
const hHour = hand(0.26, 0.05, 0x1a1430), hMin = hand(0.38, 0.03, 0xd01830);
const upBeam = beam(RED, 1.6, 0.04);

// ---------- s3: app icon, $0 plate ----------
const icon = new THREE.Mesh(new THREE.PlaneGeometry(0.7, 0.7), new THREE.MeshBasicMaterial({ transparent: true, toneMapped: false, color: 0xc8c8c8, map: tex(512, 512, (x) => {
  x.fillStyle = "#1fa860"; x.beginPath(); x.roundRect(16, 16, 480, 480, 110); x.fill();
  x.strokeStyle = "#ffffff"; x.lineWidth = 34; x.beginPath(); x.arc(256, 256, 140, 0, 7); x.stroke();
  x.fillStyle = "#ffffff"; x.beginPath(); x.arc(256, 256, 78, 0, 7); x.fill();
}) }));
lid.add(icon);
const plate = (txt, hex, w = 0.9, h = 0.52) => { const gp = new THREE.Group(); gp.add(rbox(w, h, 0.05, 0.06, mDark)); plane(w + 0.03, h + 0.03, glow(hex, 0.9), 0, 0, -0.03, gp); const t = wt([txt], hex, 1.4, w * 0.9); t.position.z = 0.03; gp.add(t); lid.add(gp); gp.visible = false; return gp; };
const zero = plate("$0", GREEN);

// ---------- s6: three systems ----------
const OS = ["MAC", "WINDOWS", "LINUX"];
const osTiles = OS.map((n, i) => { const gp = new THREE.Group(); gp.add(rbox(0.66, 0.44, 0.06, 0.06, mBody)); plane(0.6, 0.03, glow(GREEN, 1.4), 0, -0.17, 0.035, gp); const t = wt([n], WHITE, 1.0, 0.56); t.position.z = 0.04; gp.add(t); gp.position.set(-0.78 + 0.78 * i, 0.82, 0.16); lid.add(gp); gp.visible = false; return gp; });

// ---------- s3: GitHub star ----------
const starShape = new THREE.Shape();
for (let i = 0; i < 10; i++) { const a = Math.PI / 2 + (i * Math.PI) / 5, r = i % 2 ? 0.17 : 0.4; starShape[i ? "lineTo" : "moveTo"](Math.cos(a) * r, Math.sin(a) * r); }
const star = new THREE.Mesh(new THREE.ExtrudeGeometry(starShape, { depth: 0.08, bevelEnabled: true, bevelSize: 0.03, bevelThickness: 0.03, bevelSegments: 2 }), glow(ORANGE, 1.5));
root.add(star);

// ---------- captions ----------
title("NEVER PAY FOR DEMO ZOOMS");
cap("s1", "exploring", ["EXPLORING GITHUB REPOS"], WHITE, { until: "s1" });
cap("s2", "send", ["SEND IT OFF"], RED, { until: ["s2", "wait"] });
cap("s2", "wait", ["WAIT FOR DAYS"], RED, { until: ["s2", "wait"], untilN: 2, boom: 0.4 });
cap("s2", "wait", ["WAIT AGAIN"], RED, { n: 2, until: ["s2", "every"] });
cap("s2", "every", ["EVERY SMALL CHANGE"], RED);
cap("s3", "recordly", ["RECORDLY"], GREEN, { until: ["s3", "over"], boom: 0.5 });
cap("s3", "over", ["OVER 36,000 STARS", "IN 8 MONTHS"], ORANGE, { until: ["s3", "free"], boom: 0.5 });
cap("s3", "free", ["IT'S FREE"], GREEN, { until: ["s3", "adds"] });
cap("s3", "adds", ["IT ADDS THE ZOOMS"], GREEN, { boom: 0.4 });
cap("s4", "record", ["RECORD, HIT STOP"], VIOLET, { until: ["s4", "watches"] });
cap("s4", "watches", ["WATCHES YOUR CURSOR"], VIOLET, { until: ["s4", "suggests"] });
cap("s4", "suggests", ["SUGGESTS THE ZOOM"], GREEN, { boom: 0.4 });
cap("s5", "your", ["SMOOTH MOUSE"], VIOLET, { until: ["s5", "bounce"] });
cap("s5", "bounce", ["BOUNCE ON EVERY CLICK"], GREEN, { boom: 0.4 });
cap("s6", "add", ["FACE IN A BUBBLE"], GREEN, { until: ["s6", "colorful"] });
cap("s6", "colorful", ["COLORFUL BACKGROUND"], GREEN, { until: ["s6", "save"] });
cap("s6", "save", ["VIDEO OR GIF"], GREEN, { until: ["s6", "mac"], boom: 0.4 });
cap("s6", "mac", ["MAC, WINDOWS, LINUX"], GREEN);
endCard(["DON'T PAY FOR ZOOMS.", "JUST HIT RECORD."]);

// ---------- timings (global seconds) ----------
const T = {
  pay: g("s1", "pay"), motion: g("s1", "motion"), designer: g("s1", "designer"),
  s2: S.s2[0], send: g("s2", "send"), wait: g("s2", "wait"), days: g("s2", "days"), wait2: g("s2", "wait", 2), every: g("s2", "every"), small: g("s2", "small"), change: g("s2", "change"),
  s3: S.s3[0], over: g("s3", "over"), free: g("s3", "free"), adds: g("s3", "adds"), zooms: g("s3", "zooms"),
  s4: S.s4[0], stop: g("s4", "stop"), watches: g("s4", "watches"), suggests: g("s4", "suggests"), zoom: g("s4", "zoom"),
  s5: S.s5[0], moves: g("s5", "moves"), bounce: g("s5", "bounce"), click: g("s5", "click"),
  s6: S.s6[0], face: g("s6", "face"), colorful: g("s6", "colorful"), save: g("s6", "save"), gif: g("s6", "gif"), mac: g("s6", "mac"), win: g("s6", "windows"), linux: g("s6", "linux"),
  s7: S.s7[0], s8: S.s8[0],
};
const OS_AT = [T.mac, T.win, T.linux];
const v = new THREE.Vector3(), v2 = new THREE.Vector3();
const HOME = new THREE.Vector3(0, 0.95, -0.55); // just in front of the screen, world space
const LAND = SV.clone().add(new THREE.Vector3(0.75, -0.3, 0.4));

// ---------- shots: [cx,cy,cz, lx,ly,lz, fov] ----------
const FRONT = [0.2, 1.7, 5.2, 0, 0.95, -0.6, 46];
const SH = [
  { at: 0, K: [[0, [0.3, 1.8, 5.6, 0, 0.9, -0.5, 48]], [S.s2[0], [0.1, 1.7, 5.0, 0, 0.95, -0.6, 48]]] },
  { at: T.send - 0.05, K: [[0, [2.4, 1.6, 5.4, 0.5, 3.1, -2.6, 58]], [1.4, [2.8, 2.0, 5.8, 0.6, 3.5, -3.2, 58]]] },
  { at: T.days - 0.3, K: [[0, [1.6, 4.4, 1.4, 0.3, 4.5, -5.0, 54]], [2.6, [1.3, 4.5, 0.9, 0.3, 4.5, -5.0, 52]]] },
  { at: T.s3, K: [[0, [-0.6, 2.1, 5.8, 0, 1.0, -0.6, 48]], [3.6, [0.2, 1.8, 5.2, 0, 1.0, -0.6, 46]]] },
  { at: T.adds - 0.1, K: [[0, [0.4, 1.6, 4.8, 0, 0.9, -0.6, 46]], [2.6, [0.1, 1.6, 4.6, 0, 0.9, -0.6, 46]]] },
  { at: T.s4, K: [[0, [-0.4, 1.6, 5.0, 0, 0.85, -0.5, 46]], [3.6, [-0.1, 1.5, 4.7, 0, 0.85, -0.5, 46]]] },
  { at: T.s5, K: [[0, [0.4, 1.7, 5.0, 0, 0.9, -0.6, 46]], [2.6, FRONT]] },
  { at: T.s6, K: [[0, [-0.3, 1.7, 5.2, 0, 0.95, -0.6, 46]], [2.2, [0.1, 1.7, 5.0, 0, 0.95, -0.6, 46]]] },
  { at: T.save - 0.1, K: [[0, [1.8, 1.8, 4.8, 0, 0.95, -0.4, 46]], [3.2, [1.4, 1.9, 5.2, 0, 0.95, -0.4, 46]]] },
  { at: T.s7, calm: 1, K: [[0, [0.2, 1.9, 5.8, 0, 0.95, -0.6, 48]], [2, [0.4, 2.0, 6.2, 0, 0.95, -0.6, 48]]] },
];

// cursor paths in demo uv
const P4 = [[0.3, 0.75], [0.45, 0.55], [0.62, 0.42], [0.85, 0.18]]; // s4: drifts toward SIGN UP
const bez = (P, k, out) => { const u = 1 - k; const c = [u * u * u, 3 * u * u * k, 3 * u * k * k, k * k * k]; out[0] = c.reduce((a, w, i) => a + w * P[i][0], 0); out[1] = c.reduce((a, w, i) => a + w * P[i][1], 0); return out; };
const P5 = [[0.25, 0.25], [0.3, 0.85], [0.75, 0.9], [0.6, 0.45]]; // s5: smooth glide onto a card
const cuv = [0, 0];

run("recordly-world", (t) => {
  root.visible = t < T.s8 - 0.12; // hide the scene before the CTA fades in
  const wrong = t < T.s3;
  accent.material.color.set(wrong ? (t >= T.pay ? RED : VIOLET) : GREEN).multiplyScalar(1.6);
  mScreen.color.set(wrong ? 0x0b0a26 : 0x0a1a1a);

  // s1: invoices land on "pay", "motion", "designer"; gone on the cut to the wide shot
  [T.pay, T.motion, T.designer].forEach((a, i) => {
    const b = bills[i], k = sm(a - 0.1, a + 0.15, t);
    b.visible = k > 0.01 && t < T.send - 0.05;
    b.position.copy(b.userData.home); b.position.y += 0.25 * (1 - k); b.rotation.z = b.userData.rz; b.scale.setScalar(Math.max(1e-3, 0.9 * k));
  });

  // s2: the recording flies up to the designer; clock spins while you wait; V2..V4 stack up
  const fly = sm(T.send, T.wait - 0.05, t);
  vid.visible = t >= T.send - 0.05 && wrong;
  vid.position.copy(HOME).lerp(LAND, fly); vid.position.y += Math.sin(fly * Math.PI) * 0.8; vid.scale.setScalar(0.9 - 0.35 * fly); vid.rotation.y = 0.4 * fly;
  // on "wait again": it bounces back toward the camera and returns
  const back = Math.sin(Math.PI * sm(T.wait2 - 0.05, T.every - 0.05, t));
  if (t > T.wait2 - 0.05) { vid.position.copy(LAND).add(v.set(1.0 * back, -0.5 * back, 1.1 * back)); }
  station.visible = t >= T.send - 0.05 && wrong;
  upBeam.set(v.copy(HOME).add(v2.set(0, 0.2, 0)), v2.copy(LAND).add(new THREE.Vector3(0, -0.5, 0)), wrong ? sm(T.send - 0.05, T.send + 0.2, t) * 0.7 * (1 - sm(T.wait - 0.2, T.wait, t)) : 0);
  const spin = 6 * sm(T.wait, T.wait2 - 0.05, t) + 8 * sm(T.wait2, T.change + 0.4, t);
  hMin.rotation.z = -spin * Math.PI * 2; hHour.rotation.z = -spin * Math.PI / 6 - 0.8;
  tlHead.position.x = -0.8 + 1.6 * ((t * 0.5) % 1);
  versions.forEach((c, i) => {
    const a = [T.every, T.small, T.change][i], k = sm(a - 0.1, a + 0.15, t);
    c.visible = wrong && k > 0.01;
    c.position.set(SV.x - 0.45 + 0.42 * i, SV.y - 0.15 + 0.06 * i, SV.z + 0.6 + 0.08 * i); c.scale.setScalar(Math.max(1e-3, 0.6 * k)); c.rotation.set(0, -0.15, 0.12 - 0.12 * i);
  });

  // s3: icon on "Instead", $0 on "free", then the demo zooms itself on "adds"
  show(icon, sm(T.s3, T.s3 + 0.2, t) * (1 - sm(T.over - 0.1, T.over + 0.05, t)), 1);
  icon.position.set(0, 0.84, 0.25); icon.rotation.y = 0.25 * Math.sin((t - T.s3) * 2);
  show(zero, sm(T.free - 0.1, T.free + 0.15, t) * (1 - sm(T.adds - 0.15, T.adds, t)), 1); zero.position.set(0, 0.84, 0.22);
  const demoOff = (t >= T.s3 && t < T.over + 0.05) || (t >= T.free - 0.1 && t < T.adds);
  demo.visible = !demoOff;

  // zoom state per line
  let z = 1, cu = 0.5, cv = 0.5, fa = 0, fr = null;
  if (t >= T.adds - 0.1 && t < T.s4) { // s3: frame on the chart card, then zoom in
    fr = [CARD2[0], CARD2[1], 0.26, 0.38]; fa = sm(T.adds - 0.1, T.adds + 0.1, t) * (1 - sm(T.zooms + 0.2, T.zooms + 0.45, t));
    const k = sm(T.zooms, T.zooms + 0.6, t); z = 1 + 1.3 * k; cu = 0.5 + (CARD2[0] - 0.5) * k; cv = 0.5 + (CARD2[1] - 0.5) * k;
    z *= 1 - 0.0 * t; if (t > T.s4 - 0.35) { const o = sm(T.s4 - 0.35, T.s4 - 0.05, t); z = 1 + (z - 1) * (1 - o); cu = 0.5 + (cu - 0.5) * (1 - o); cv = 0.5 + (cv - 0.5) * (1 - o); }
  }
  const s4on = t >= T.s4 && t < T.s5;
  if (s4on) { // cursor drifts to SIGN UP, frame suggested, zoom in
    fr = [BTN[0], BTN[1], 0.3, 0.26]; fa = sm(T.suggests - 0.1, T.suggests + 0.1, t) * (1 - sm(T.zoom + 0.15, T.zoom + 0.4, t));
    const k = sm(T.zoom - 0.1, T.zoom + 0.45, t); z = 1 + 1.4 * k; cu = 0.5 + (BTN[0] - 0.5) * k; cv = 0.5 + (BTN[1] - 0.5) * k;
  }
  const s5on = t >= T.s5 && t < T.s6;
  if (s5on) { const o = 1 - sm(T.s5, T.s5 + 0.35, t); z = 1 + 1.4 * o; cu = 0.5 + (BTN[0] - 0.5) * o; cv = 0.5 + (BTN[1] - 0.5) * o; }
  setZoom(z, cu, cv);
  if (fr) frameAt(fr[0], fr[1], fr[2], fr[3], fa); else frameAt(0.5, 0.5, 0.1, 0.1, 0);

  // REC badge: recording on "Record", STOP on "stop"
  const recOn = s4on && t < T.watches;
  rec.visible = recOn; const stopped = t >= T.stop - 0.05;
  recDot.visible = recT.visible = !stopped; stopSq.visible = stopT.visible = stopped;
  recDot.material.color.set(0xff4060).multiplyScalar(1.6 * (0.6 + 0.4 * Math.round((Math.sin(t * 12) + 1) / 2)));

  // cursor + violet trail (s4), smooth glide + click bounce (s5)
  let curOn = false, bounceK = 0, ripple = -1;
  if (s4on && t >= T.s4 + 0.1) {
    curOn = true; bez(P4, sm(T.watches - 0.2, T.zoom - 0.1, t), cuv);
    trail.forEach((d, i) => { const k = sm(T.watches - 0.2, T.zoom - 0.1, t) - (i + 1) * 0.035; const p = bez(P4, Math.max(0, k), [0, 0]); disp(p[0], p[1], d.position); d.position.z = 0.015; d.visible = t >= T.watches && k > 0 && t < T.zoom + 0.2; d.scale.setScalar(1 - i * 0.07); });
  } else trail.forEach((d) => (d.visible = false));
  if (s5on && t >= T.s5 + 0.15) {
    curOn = true; bez(P5, sm(T.s5 + 0.15, T.bounce - 0.05, t), cuv);
    if (t > T.bounce - 0.05) { cuv[0] = P5[3][0] + 0.12 * sm(T.bounce + 0.25, T.click - 0.05, t); cuv[1] = P5[3][1] - 0.18 * sm(T.bounce + 0.25, T.click - 0.05, t); }
    for (const c of [T.bounce, T.click]) { const u = t - c; if (u >= 0 && u < 0.45) { ripple = u / 0.45; bounceK = Math.max(bounceK, Math.sin(Math.min(1, u / 0.3) * Math.PI) * (1 - u / 0.45)); } }
  }
  cursor.visible = curOn;
  if (curOn) { disp(cuv[0], cuv[1], cursor.position); cursor.position.z = 0.02; cursor.scale.setScalar((1 - 0.35 * bounceK) * (s4on ? 1 : 1.25)); }
  ring.visible = ripple >= 0; if (ripple >= 0) { ring.position.set(cursor.position.x, cursor.position.y, 0.018); ring.scale.setScalar(0.6 + 1.6 * ripple); ring.material.opacity = 1 - ripple; }

  // s6: face bubble, colorful background (demo shrinks onto it), then exports + three systems
  const s6 = t >= T.s6 - 0.05;
  show(face, s6 ? sm(T.face - 0.1, T.face + 0.15, t) : 0, 1);
  const gk = s6 ? sm(T.colorful - 0.1, T.colorful + 0.35, t) : 0;
  grad.visible = gk > 0.01; shadow.visible = gk > 0.3;
  demoHolder.scale.setScalar(1 - 0.22 * gk); demoHolder.position.y = DY + 0.02 * gk;
  const s6b = t >= T.save - 0.1 && t < T.s7; // exports cover the screen: dim it
  outs.forEach((o, i) => {
    const a = i ? T.gif : T.save, k = sm(a - 0.1, a + 0.15, t) * (1 - sm(T.mac - 0.2, T.mac - 0.05, t));
    o.visible = k > 0.01; o.position.set(-0.5 + 1.0 * i, 0.95 + 0.1 * k, 0.05); o.scale.setScalar(Math.max(1e-3, 1.3 * k)); o.rotation.y = 0;
  });
  osTiles.forEach((m, i) => show(m, sm(OS_AT[i] - 0.1, OS_AT[i] + 0.15, t) * (1 - sm(T.s7 - 0.15, T.s7, t)), 1.05));
  demoHolder.visible = !(t >= T.mac - 0.1 && t < T.s7);
  void s6b;

  // s3: the star pops in above the laptop while the star count is on screen (2-line caption: small and low)
  const sk = sm(T.over - 0.1, T.over + 0.25, t) * (1 - sm(T.free - 0.15, T.free + 0.1, t));
  star.visible = sk > 0.01; star.scale.setScalar(0.38 * sk * (1 + 0.08 * Math.sin(t * 6)));
  star.position.set(0, 1.92, -0.3); star.rotation.y = 0.35 * Math.sin((t - T.over) * 2.5);

  const { punch } = shoot(SH, t);
  const spike = overlays(t);
  bloom.strength = Math.min(1.45, 1.0 + 1.2 * punch * punch + spike);
});
