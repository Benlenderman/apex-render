// NEVER LET AI JUST DESCRIBE IT (Text-to-CAD). Laptop + a 3D printer on a dark desk; wrong = the AI answers with a
// paragraph and the printer bed stays empty; right = words or a photo in, code builds a phone stand, one line changes
// one part, STL + STEP out, checked, printed on the printer.
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
const put = (m, x, y, z, rz = 0) => { m.position.set(x, y, z); m.rotation.z = rz; return m; };
const edgeMat = (hex, k = 1.6) => new THREE.LineBasicMaterial({ color: new THREE.Color(hex).multiplyScalar(k), toneMapped: false });

// ---------- desk + room lights ----------
const desk = rbox(10, 0.3, 5, 0.12, std(0x221d66, 0x0c0a30, 0.7, 0.1)); desk.position.set(1.4, -0.14, -0.6); root.add(desk);
const pl = new THREE.PointLight(0xe8e2ff, 18, 9, 1.6); pl.position.set(-1.6, 3.2, 2.2); root.add(pl);
const rim = new THREE.PointLight(0xff8a3a, 10, 8, 1.6); rim.position.set(-0.5, 2.2, -2.6); root.add(rim);
const pl2 = new THREE.PointLight(0xe8e2ff, 14, 8, 1.6); pl2.position.set(5.0, 3.0, 2.0); root.add(pl2);

// ---------- laptop at the origin, screen faces +z ----------
const base = rbox(2.6, 0.1, 1.7, 0.04, mBody); base.position.set(0, 0.05, 0); root.add(base);
const keys = rbox(2.2, 0.02, 0.8, 0.01, mDark); keys.position.set(0, 0.105, -0.2); root.add(keys);
const pad = rbox(0.8, 0.02, 0.45, 0.01, mDark); pad.position.set(0, 0.105, 0.5); root.add(pad);
const lid = new THREE.Group(); lid.position.set(0, 0.1, -0.85); lid.rotation.x = -0.12; root.add(lid);
lid.add(put(rbox(2.6, 1.7, 0.06, 0.04, mBody), 0, 0.85, 0));
const mScreen = new THREE.MeshBasicMaterial({ color: 0x0b0a26, toneMapped: false });
plane(2.4, 1.5, mScreen, 0, 0.85, 0.035, lid);
plane(2.4, 0.12, glow(VIOLET, 0.35), 0, 1.54, 0.037, lid);
const accent = plane(2.4, 0.015, glow(VIOLET, 1.6), 0, 1.475, 0.038, lid);
[-1.08, -0.98, -0.88].forEach((x, i) => { const d = new THREE.Mesh(new THREE.CircleGeometry(0.025, 16), glow([RED, ORANGE, GREEN][i], 1.2)); d.position.set(x, 1.54, 0.039); lid.add(d); });

// ---------- chat on the screen ----------
const bubble = (txt, w) => { const gp = new THREE.Group(); gp.add(rbox(w, 0.2, 0.02, 0.05, std(0x6a5ff0, 0x2a2090, 0.35, 0.2))); const t = wt([txt], WHITE, 1.0, w * 0.92); t.position.z = 0.02; gp.add(t); lid.add(gp); gp.visible = false; return gp; };
const ask = bubble("MAKE ME A PHONE STAND", 1.3); ask.position.set(0.42, 1.28, 0.05);
const ask4 = bubble("A PHONE STAND FOR MY DESK", 1.5); ask4.position.set(0.3, 1.28, 0.05);
const avatar = new THREE.Group(); avatar.position.set(-1.02, 1.02, 0.05); lid.add(avatar);
avatar.add(new THREE.Mesh(new THREE.CircleGeometry(0.09, 24), glow(VIOLET, 1.0)));
const aiT = wt(["AI"], WHITE, 1.0, 0.2); aiT.position.z = 0.003; avatar.add(aiT);
const mLine = new THREE.MeshBasicMaterial({ color: 0x8a84c0, toneMapped: false });
const PW = [1.75, 1.9, 1.6, 1.85, 1.7, 1.9, 1.5, 1.8, 1.65, 1.2];
const para = PW.map((w, i) => { const m = plane(w, 0.04, mLine, 0, 1.02 - i * 0.085, 0.045, lid); m.userData.w = w; m.visible = false; return m; });
const setLine = (m, k) => { m.visible = k > 0.01; m.scale.x = Math.max(1e-3, k); m.position.x = -0.9 + (m.userData.w * k) / 2; };

// ---------- the 3D printer on the desk, right of the laptop ----------
const PX = 4.0, PZ = -0.6;
const printer = new THREE.Group(); printer.position.set(PX, 0, PZ); root.add(printer);
const mPF = std(0x2a2470, 0x100c40, 0.45, 0.5);
printer.add(put(rbox(1.5, 0.16, 1.3, 0.05, mBody), 0, 0.08, 0));
for (const x of [-0.68, 0.68]) for (const z of [-0.58, 0.58]) printer.add(put(rbox(0.08, 1.5, 0.08, 0.02, mPF), x, 0.83, z));
for (const z of [-0.58, 0.58]) printer.add(put(rbox(1.44, 0.08, 0.08, 0.02, mPF), 0, 1.58, z));
for (const x of [-0.68, 0.68]) printer.add(put(rbox(0.08, 0.08, 1.24, 0.02, mPF), x, 1.58, 0));
const bed = rbox(1.12, 0.05, 0.92, 0.02, mDark); bed.position.set(0, 0.4, 0); printer.add(bed);
const bedEdge = new THREE.LineSegments(new THREE.EdgesGeometry(new THREE.BoxGeometry(1.12, 0.05, 0.92)), edgeMat(VIOLET, 1.2)); bed.add(bedEdge);
const gantry = rbox(1.3, 0.06, 0.06, 0.02, mLav); gantry.position.set(0, 1.25, 0.05); printer.add(gantry);
const head = new THREE.Group(); head.position.set(0, 1.25, 0.12); printer.add(head);
head.add(rbox(0.22, 0.24, 0.18, 0.04, mLav));
const nozzle = new THREE.Mesh(new THREE.ConeGeometry(0.05, 0.1, 12), glow(ORANGE, 1.6)); nozzle.rotation.x = Math.PI; nozzle.position.y = -0.17; head.add(nozzle);
const pLED = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.05, 0.02), glow(VIOLET, 1.2)); pLED.position.set(0, 0.16, 0.66); printer.add(pLED);
// wrong way: a red "?" over the empty bed, then a red X
const qm = wt(["?"], RED, 1.6, 0.9); qm.position.set(0, 0.85, 0.2); printer.add(qm); qm.visible = false;
const bedX = new THREE.Group(); bedX.position.set(0, 0.75, 0.2); printer.add(bedX);
[0.78, -0.78].forEach((r) => { const b = new THREE.Mesh(new THREE.BoxGeometry(0.07, 0.75, 0.04), glow(RED, 2.2)); b.rotation.z = r; bedX.add(b); });

// ---------- the phone stand: base, leaning back, front lip ----------
const mStand = std(0x36c878, 0x0f5a33, 0.4, 0.15), mHotP = std(0xff8a3a, 0x8a3008, 0.4, 0.15);
function makeStand() {
  const s = new THREE.Group();
  const b = rbox(0.8, 0.06, 0.5, 0.02, mStand); b.position.set(0, 0.03, 0); s.add(b);
  const backP = new THREE.Group(); backP.position.set(0, 0.06, -0.14); backP.rotation.x = -0.42; s.add(backP);
  const bp = rbox(0.8, 0.62, 0.06, 0.02, mStand); bp.position.y = 0.31; backP.add(bp);
  const lip = rbox(0.8, 0.1, 0.06, 0.02, mStand); lip.position.set(0, 0.1, 0.2); s.add(lip);
  [b, bp, lip].forEach((m) => m.add(new THREE.LineSegments(new THREE.EdgesGeometry(m.geometry, 30), edgeMat(GREEN, 0.9))));
  s.userData = { parts: [b, backP, lip], lip };
  return s;
}
const stand = makeStand(); root.add(stand); // s3-s6 in front of the screen
const printed = makeStand(); printer.add(printed); printed.position.set(0, 0.425, 0.02); printed.scale.setScalar(0.9);

// ---------- s3: app icon (wireframe cube on a tile), $0 plate, GitHub star ----------
const icon = new THREE.Group(); lid.add(icon);
icon.add(rbox(0.8, 0.8, 0.08, 0.12, mDark));
plane(0.84, 0.84, glow(GREEN, 0.8), 0, 0, -0.045, icon);
const cube = new THREE.LineSegments(new THREE.EdgesGeometry(new THREE.BoxGeometry(0.36, 0.36, 0.36)), edgeMat(GREEN, 2.0)); cube.position.z = 0.25; icon.add(cube);
const plate = (txt, hex, w = 0.9, h = 0.52) => { const gp = new THREE.Group(); gp.add(rbox(w, h, 0.05, 0.06, mDark)); plane(w + 0.03, h + 0.03, glow(hex, 0.9), 0, 0, -0.03, gp); const t = wt([txt], hex, 1.4, w * 0.9); t.position.z = 0.03; gp.add(t); lid.add(gp); gp.visible = false; return gp; };
const zero = plate("$0", GREEN);
const starShape = new THREE.Shape();
for (let i = 0; i < 10; i++) { const a = Math.PI / 2 + (i * Math.PI) / 5, r = i % 2 ? 0.17 : 0.4; starShape[i ? "lineTo" : "moveTo"](Math.cos(a) * r, Math.sin(a) * r); }
const star = new THREE.Mesh(new THREE.ExtrudeGeometry(starShape, { depth: 0.08, bevelEnabled: true, bevelSize: 0.03, bevelThickness: 0.03, bevelSegments: 2 }), glow(ORANGE, 1.5));
root.add(star);

// ---------- s4: a photo of a phone on a stand ----------
function photoTex() {
  const c = document.createElement("canvas"); c.width = 512; c.height = 384; const x = c.getContext("2d");
  const bg = x.createLinearGradient(0, 0, 0, 384); bg.addColorStop(0, "#c8c0ee"); bg.addColorStop(1, "#8a80c8"); x.fillStyle = bg; x.fillRect(0, 0, 512, 384);
  x.fillStyle = "#5a4f9a"; x.fillRect(0, 300, 512, 84); // table
  x.save(); x.translate(270, 300); x.rotate(-0.32); x.fillStyle = "#1c1838"; x.beginPath(); x.roundRect(-60, -230, 120, 230, 16); x.fill();
  x.fillStyle = "#4fa8ff"; x.beginPath(); x.roundRect(-50, -220, 100, 205, 10); x.fill(); x.restore();
  x.fillStyle = "#f2f0ff"; x.beginPath(); x.moveTo(170, 300); x.lineTo(380, 300); x.lineTo(380, 282); x.lineTo(232, 282); x.lineTo(232, 268); x.lineTo(170, 268); x.fill(); // the stand
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t;
}
const photo = new THREE.Group(); lid.add(photo); photo.visible = false;
photo.add(rbox(0.86, 0.7, 0.03, 0.03, std(0xf4f2ff, 0x404060, 0.5, 0.05)));
plane(0.76, 0.57, new THREE.MeshBasicMaterial({ map: photoTex(), toneMapped: false, color: 0xb8b8b8 }), 0, 0.03, 0.017, photo);

// ---------- s5: code panel on the left of the screen ----------
const code = new THREE.Group(); code.position.set(-0.6, 0.85, 0.045); lid.add(code); code.visible = false;
plane(1.1, 1.2, glow(VIOLET, 0.18), 0, 0, 0, code);
const CODE = ["base = Box(80, 50, 5)", "back = Box(80, 60, 5)", "lip = Box(80, 10, 5)"];
const codeL = CODE.map((s, i) => { const m = wt([s], i === 2 ? WHITE : GREEN, 1.0, 1.0); m.position.set(0, 0.3 - i * 0.28, 0.003); code.add(m); return m; });
const lip2 = wt(["lip = Box(80, 20, 5)"], ORANGE, 1.4, 1.0); lip2.position.set(0, 0.3 - 2 * 0.28, 0.004); code.add(lip2);
const hi = plane(1.04, 0.16, glow(ORANGE, 0.5), 0, 0.3 - 2 * 0.28, 0.001, code);

// ---------- s6: STL + STEP files, the check ----------
function makeFile(hex, txt) {
  const gp = new THREE.Group();
  gp.add(rbox(0.56, 0.72, 0.06, 0.05, mLav));
  plane(0.46, 0.2, glow(hex, 1.1), 0, -0.12, 0.032, gp);
  const corner = new THREE.Mesh(new THREE.CircleGeometry(0.09, 3), glow(ORANGE, 1.4)); corner.position.set(0.19, 0.27, 0.033); corner.rotation.z = Math.PI / 4; gp.add(corner);
  [0.14, 0.06].forEach((y) => plane(0.3, 0.025, new THREE.MeshBasicMaterial({ color: 0x6a5fd0 }), -0.05, y, 0.032, gp));
  const t = wt([txt], WHITE, 1.0, 0.4); t.position.set(0, -0.12, 0.036); gp.add(t);
  lid.add(gp); gp.visible = false; return gp;
}
const fSTL = makeFile(GREEN, "STL"), fSTEP = makeFile(GREEN, "STEP");
const check = new THREE.Group(); root.add(check);
check.add(put(new THREE.Mesh(new THREE.BoxGeometry(0.09, 0.26, 0.05), glow(GREEN, 1.4)), -0.1, -0.04, 0, 0.75));
check.add(put(new THREE.Mesh(new THREE.BoxGeometry(0.09, 0.5, 0.05), glow(GREEN, 1.4)), 0.1, 0.08, 0, -0.6));
const scan = new THREE.Mesh(new THREE.BoxGeometry(1.1, 0.015, 0.015), glow(GREEN, 1.4)); root.add(scan);

// ---------- captions ----------
title("NEVER LET AI JUST DESCRIBE IT");
cap("s1", "exploring", ["EXPLORING GITHUB REPOS"], WHITE, { until: "s1" });
cap("s2", "ask", ["ASK FOR A PHONE STAND"], RED, { until: ["s2", "paragraph"] });
cap("s2", "paragraph", ["YOU GET A PARAGRAPH"], RED, { until: ["s2", "nothing"], boom: 0.4 });
cap("s2", "nothing", ["NOTHING TO PRINT"], RED, { boom: 0.5 });
cap("s3", "text", ["TEXT-TO-CAD"], GREEN, { until: ["s3", "over"], boom: 0.5 });
cap("s3", "over", ["OVER 26,000 STARS", "IN 7 MONTHS"], ORANGE, { until: ["s3", "free"], boom: 0.5 });
cap("s3", "free", ["IT'S FREE"], GREEN, { until: ["s3", "makes"] });
cap("s3", "makes", ["IT DESIGNS THE ACTUAL PART"], GREEN);
cap("s4", "describe", ["PLAIN WORDS"], VIOLET, { until: ["s4", "or"] });
cap("s4", "or", ["OR A PHOTO"], VIOLET);
cap("s5", "builds", ["BUILT FROM CODE"], GREEN, { until: ["s5", "change"] });
cap("s5", "change", ["CHANGE ONE THING"], ORANGE, { until: ["s5", "only"], boom: 0.4 });
cap("s5", "only", ["ONLY THAT PART UPDATES"], GREEN);
cap("s6", "out", ["REAL STL AND STEP FILES"], GREEN, { until: ["s6", "checks"], boom: 0.4 });
cap("s6", "checks", ["CHECKS IT CAN BE MADE"], GREEN, { until: ["s6", "then"] });
cap("s6", "then", ["SENT TO YOUR PRINTER"], GREEN, { boom: 0.4 });
endCard(["DON'T DESCRIBE IT.", "PRINT IT."]);
boom("s2", "text", 0.5);

// ---------- timings (global seconds) ----------
const T = {
  never: g("s1", "never"), s2: S.s2[0], ask: g("s2", "ask"), para: g("s2", "paragraph"), text: g("s2", "text"), nothing: g("s2", "nothing"),
  s3: S.s3[0], over: g("s3", "over"), free: g("s3", "free"), makes: g("s3", "makes"),
  s4: S.s4[0], or: g("s4", "or"), photo: g("s4", "photo"),
  s5: S.s5[0], code: g("s5", "code"), change: g("s5", "change"), only: g("s5", "only"), upd: g("s5", "updates"),
  s6: S.s6[0], step: g("s6", "step"), checks: g("s6", "checks"), made: g("s6", "made"), then: g("s6", "then"), lab: g("s6", "lab"),
  s7: S.s7[0], s8: S.s8[0],
};
const v = new THREE.Vector3();

// ---------- shots: [cx,cy,cz, lx,ly,lz, fov] ----------
const PR = (dx, cy, cz, ly, fov = 46) => [PX + dx, cy, cz, PX, ly, PZ, fov];
const SH = [
  { at: 0, K: [[0, PR(-0.4, 1.7, 3.6, 0.8)], [2, PR(0.1, 1.6, 3.3, 0.8)]] },
  { at: T.never - 0.1, K: [[0, [0.3, 1.8, 5.4, 0, 0.95, -0.6, 46]], [S.s2[0] - T.never, [0.1, 1.7, 5.0, 0, 0.95, -0.6, 46]]] },
  { at: T.s2, K: [[0, [-0.4, 1.6, 5.1, 0, 0.95, -0.6, 46]], [2.4, [0.2, 1.6, 4.9, 0, 0.95, -0.6, 46]]] },
  { at: T.nothing - 0.1, K: [[0, PR(0.5, 1.8, 3.6, 0.8)], [1.6, PR(0.2, 1.7, 3.4, 0.8)]] },
  { at: T.s3, K: [[0, [-0.6, 2.1, 5.8, 0, 1.0, -0.6, 48]], [3.6, [0.2, 1.8, 5.2, 0, 1.0, -0.6, 46]]] },
  { at: T.makes - 0.1, K: [[0, [0.5, 1.7, 5.0, 0, 0.95, -0.5, 46]], [2.2, [0.2, 1.6, 4.8, 0, 0.95, -0.5, 46]]] },
  { at: T.s4, K: [[0, [-0.4, 1.7, 5.2, 0, 0.95, -0.6, 46]], [2.6, [0.1, 1.7, 5.0, 0, 0.95, -0.6, 46]]] },
  { at: T.s5, K: [[0, [0.4, 1.7, 5.2, 0, 0.95, -0.6, 46]], [3.7, [-0.1, 1.7, 5.0, 0, 0.95, -0.6, 46]]] },
  { at: T.s6, K: [[0, [-0.3, 1.7, 5.2, 0, 0.95, -0.6, 46]], [2.4, [0.2, 1.7, 5.0, 0, 0.95, -0.6, 46]]] },
  { at: T.then - 0.1, K: [[0, PR(-0.5, 1.8, 3.5, 0.8)], [2.4, PR(0.0, 1.7, 3.3, 0.8)]] },
  { at: T.s7, calm: 1, K: [[0, PR(0.0, 1.9, 3.6, 1.15)], [2, PR(0.3, 2.0, 4.0, 1.2)]] },
];

run("text-to-cad-world", (t) => {
  root.visible = t < T.s8 - 0.12; // hide the scene before the CTA fades in
  const wrong = t < T.s3;
  accent.material.color.set(wrong ? (t >= T.never ? RED : VIOLET) : GREEN).multiplyScalar(1.6);
  mScreen.color.set(wrong ? 0x0b0a26 : 0x0a1a1a);
  mLine.color.set(t >= T.text ? 0xff5a66 : 0x8a84c0);

  // printer: "?" over the empty bed in s1, red X on "Nothing", bed edge green when it prints
  show(qm, sm(0.1, 0.4, t) * (1 - sm(T.never - 0.2, T.never - 0.05, t)), 1);
  const xk = sm(T.nothing, T.nothing + 0.2, t) * (t < T.s3 ? 1 : 0);
  show(bedX, xk, 1);
  bedEdge.material.color.set(t >= T.then ? GREEN : wrong && t >= T.nothing ? RED : VIOLET).multiplyScalar(1.4);
  pLED.material.color.set(t >= T.then ? GREEN : wrong && t >= T.nothing ? RED : VIOLET).multiplyScalar(1.4);

  // s1-s2 chat: AI lines on "never"; s2 user asks, then a paragraph pours in. Gone on "Instead".
  avatar.visible = t >= T.never - 0.1 && wrong;
  show(ask, sm(T.ask - 0.1, T.ask + 0.15, t) * (wrong ? 1 : 0), 1);
  para.forEach((m, i) => {
    let k;
    if (t < T.s2) k = i < 4 ? sm(T.never + 0.2 * i, T.never + 0.2 * i + 0.3, t) : 0;
    else k = sm(T.para - 0.1 + 0.09 * i, T.para + 0.15 + 0.09 * i, t);
    setLine(m, wrong ? k : 0);
    m.position.y = (t >= T.s2 ? 1.02 : 1.2) - i * 0.085;
  });
  avatar.position.y = t >= T.s2 ? 1.02 : 1.2;

  // s3: icon on "Instead", star on "Over", $0 on "free", the stand on "makes"
  show(icon, sm(T.s3, T.s3 + 0.25, t) * (1 - sm(T.free - 0.15, T.free, t)), 1);
  icon.position.set(0, 0.84, 0.25); icon.rotation.y = 0.25 * Math.sin((t - T.s3) * 2);
  cube.rotation.set(0.5, t * 1.2, 0);
  show(zero, sm(T.free - 0.1, T.free + 0.15, t) * (1 - sm(T.makes - 0.15, T.makes, t)), 1); zero.position.set(0, 0.84, 0.22);
  const sk = sm(T.over - 0.1, T.over + 0.25, t) * (1 - sm(T.free - 0.15, T.free + 0.1, t));
  star.visible = sk > 0.01; star.scale.setScalar(0.34 * sk * (1 + 0.08 * Math.sin(t * 6)));
  star.position.set(0, 1.9, -0.3); star.rotation.y = 0.35 * Math.sin((t - T.over) * 2.5);

  // the stand in front of the screen: s3 "makes" (spinning), s4 hidden, s5 built part by part, s6 checked
  const P = stand.userData.parts;
  const s3k = sm(T.makes - 0.1, T.makes + 0.25, t) * (1 - sm(T.s4 - 0.15, T.s4, t));
  const in5 = t >= T.s5 && t < T.then;
  stand.visible = s3k > 0.01 || in5;
  if (t < T.s4) { stand.position.set(0, 0.42, 0.2); stand.scale.setScalar(Math.max(1e-3, 1.25 * s3k)); stand.rotation.set(0.15, -0.6 + (t - T.makes) * 0.9, 0); P.forEach((p) => (p.visible = true)); }
  else {
    const out6 = t >= T.s6 ? sm(T.then - 0.3, T.then - 0.1, t) : 0;
    stand.position.set(0.55 - 0.55 * sm(T.s6, T.s6 + 0.4, t), 0.45, 0.3); stand.scale.setScalar(Math.max(1e-3, 1.05 * (1 - out6)));
    stand.rotation.set(0.2, -0.5 + 0.25 * Math.sin((t - T.s5) * 1.2), 0);
    const pt = [T.s5 + 0.05, T.s5 + 0.45, T.code];
    P.forEach((p, i) => { const k = sm(pt[i] - 0.1, pt[i] + 0.15, t); p.visible = k > 0.01; p.scale.setScalar(Math.max(1e-3, k)); });
  }
  // lip: grows taller and glows orange on "only that part updates"
  const grow = sm(T.only, T.upd, t), hot = sm(T.only - 0.1, T.only + 0.1, t) * (1 - sm(T.upd + 0.4, T.upd + 0.7, t));
  const lip = stand.userData.lip;
  if (t >= T.s5) { lip.scale.y = 1 + grow; lip.position.y = 0.06 + 0.05 * (1 + grow); }
  lip.material = hot > 0.5 ? mHotP : mStand;
  const plip = printed.userData.lip; plip.scale.y = 2; plip.position.y = 0.16;

  // s4: the ask, then the photo flies in
  show(ask4, sm(T.s4 - 0.05, T.s4 + 0.2, t) * (1 - sm(T.s5 - 0.15, T.s5, t)), 1);
  const ph = sm(T.or - 0.05, T.photo + 0.1, t);
  photo.visible = ph > 0.01 && t < T.s5;
  photo.position.set(0.9 - 0.6 * ph, 0.2 + 0.45 * ph, 0.08 + 0.5 * (1 - ph)); photo.rotation.z = -0.5 * (1 - ph) + 0.06; photo.scale.setScalar(Math.max(1e-3, ph));
  avatar.visible = avatar.visible || (t >= T.s4 && t < T.s5 && false);

  // s5: code lines type in, one line changes
  const in5c = t >= T.s5 - 0.05 && t < T.s6;
  code.visible = in5c; code.scale.setScalar(Math.max(1e-3, sm(T.s5 - 0.05, T.s5 + 0.2, t)));
  const ct = [T.s5 + 0.05, T.s5 + 0.45, T.code];
  codeL.forEach((m, i) => (m.visible = t >= ct[i] - 0.1 && !(i === 2 && t >= T.change + 0.25)));
  lip2.visible = t >= T.change + 0.25;
  hi.visible = t >= T.change - 0.1;

  // s6: files pop out on "STL" / "STEP", drop away on "checks"; check + scan on "checks"
  const fo = 1 - sm(T.checks - 0.15, T.checks + 0.05, t);
  show(fSTL, sm(T.s6 + 0.7, T.s6 + 1.0, t) * fo * (t < T.then ? 1 : 0), 0.95); fSTL.position.set(-0.72, 1.0, 0.35); fSTL.rotation.y = 0.25;
  show(fSTEP, sm(T.step - 0.1, T.step + 0.2, t) * fo * (t < T.then ? 1 : 0), 0.95); fSTEP.position.set(0.72, 1.0, 0.45); fSTEP.rotation.y = -0.25;
  const sc = sm(T.checks, T.checks + 0.7, t);
  scan.visible = t >= T.checks && t < T.checks + 0.75; scan.position.set(0, 0.4 + 0.8 * sc, 0.75);
  const ck = sm(T.checks + 0.6, T.checks + 0.85, t) * (1 - sm(T.then - 0.15, T.then - 0.02, t));
  show(check, ck, 0.85); check.position.set(0.3, 1.5, 0.6);

  // s6 "then" -> s7: the printer prints the stand, nozzle sweeping
  const pk = sm(T.then, T.s7 + 0.3, t);
  printed.visible = t >= T.then;
  printed.scale.set(0.9, Math.max(1e-3, 0.9 * pk), 0.9);
  const printing = t >= T.then && t < T.s7 + 0.3;
  head.position.x = printing ? 0.32 * Math.sin((t - T.then) * 9) : 0;
  head.position.y = 1.25 + (printing ? 0 : 0.0);
  nozzle.material.color.set(printing ? ORANGE : 0x6a5fd0).multiplyScalar(printing ? 1.8 : 1.0);

  const { punch } = shoot(SH, t);
  const spike = overlays(t);
  bloom.strength = 1.0 + 1.2 * punch * punch + spike;
});
