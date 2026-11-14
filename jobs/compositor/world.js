// NEVER PAY TO EDIT PHOTOS (Compositor). Laptop on a dark desk; wrong = red monthly bills pile up, right = a free editor:
// brush, layers + masks + blend modes, heal / clone / grow past the edges, PSD file, same shortcuts.
import { THREE, S, g, sm, scene, bloom, glow, VIOLET, ORANGE, RED, GREEN, WHITE, shoot, run } from "./kit.js";
import { title, cap, boom, endCard, overlays, fitText } from "./extra.js";

import { RoundedBoxGeometry } from "three/addons/geometries/RoundedBoxGeometry.js";
const std = (c, e, r = 0.45, m = 0.25) => new THREE.MeshStandardMaterial({ color: c, emissive: e, roughness: r, metalness: m });
const rbox = (w, h, d, r, mat) => new THREE.Mesh(new RoundedBoxGeometry(w, h, d, 4, r), mat);
const mBody = std(0x4a42c8, 0x1c1766, 0.35, 0.35), mDark = std(0x14123a, 0x07061a, 0.6, 0.2), mLav = std(0xc9c0ff, 0x4a3fb0, 0.4, 0.1);
const WORLD = new THREE.Group(); scene.add(WORLD); // hidden before the CTA
const add = (o, p = WORLD) => (p.add(o), o);
const basic = (hex) => new THREE.MeshBasicMaterial({ color: hex, toneMapped: false });

// canvas-drawn plane (art, panels); dimmed a little so the bloom keeps it readable
function art(w, h, draw, parent, px = 400) {
  const c = document.createElement("canvas"); c.width = Math.round(w * px); c.height = Math.round(h * px);
  draw(c.getContext("2d"), c.width, c.height);
  const tex = new THREE.CanvasTexture(c); tex.colorSpace = THREE.SRGBColorSpace;
  const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ map: tex, transparent: true, toneMapped: false, color: 0xd0d0d0 }));
  return add(m, parent);
}

// ---------- desk + room lights ----------
add(rbox(9, 0.3, 5, 0.12, std(0x221d66, 0x0c0a30, 0.7, 0.1))).position.set(0, -0.14, -0.6);
add(new THREE.PointLight(0xe8e2ff, 18, 9, 1.6)).position.set(-1.6, 3.2, 2.2);
add(new THREE.PointLight(0xff8a3a, 10, 8, 1.6)).position.set(2.6, 2.2, -2.4);

// ---------- laptop at the origin, screen faces +z ----------
add(rbox(2.6, 0.1, 1.7, 0.04, mBody)).position.set(0, 0.05, 0);
add(rbox(2.2, 0.02, 0.8, 0.01, mDark)).position.set(0, 0.105, -0.2);
add(rbox(0.8, 0.02, 0.45, 0.01, mDark)).position.set(0, 0.105, 0.5);
const lid = add(new THREE.Group()); lid.position.set(0, 0.1, -0.85);
add(rbox(2.6, 1.7, 0.06, 0.04, mBody), lid).position.set(0, 0.85, 0);
const mScreen = new THREE.MeshBasicMaterial({ color: 0x0b0a26, toneMapped: false });
add(new THREE.Mesh(new THREE.PlaneGeometry(2.4, 1.5), mScreen), lid).position.set(0, 0.85, 0.035);
add(new THREE.Mesh(new THREE.PlaneGeometry(2.4, 0.12), glow(VIOLET, 0.35)), lid).position.set(0, 1.54, 0.037);
const accent = add(new THREE.Mesh(new THREE.PlaneGeometry(2.4, 0.015), glow(VIOLET, 1.6)), lid); accent.position.set(0, 1.475, 0.038);
[-1.08, -0.98, -0.88].forEach((x, i) => add(new THREE.Mesh(new THREE.CircleGeometry(0.025, 16), glow([RED, ORANGE, GREEN][i], 1.2)), lid).position.set(x, 1.54, 0.039));

// ---------- the photo on the screen (sky, sun, mountains, ground) ----------
function landscape(x, W, H, wide) {
  const gr = x.createLinearGradient(0, 0, 0, H); gr.addColorStop(0, "#1b1858"); gr.addColorStop(0.75, "#7a56d8"); x.fillStyle = gr; x.fillRect(0, 0, W, H);
  x.fillStyle = "#ff8a3a"; x.beginPath(); x.arc(W * (wide ? 0.62 : 0.72), H * (wide ? 0.36 : 0.3), H * (wide ? 0.08 : 0.11), 0, 7); x.fill();
  const mtn = (cx, w, h, col) => { x.fillStyle = col; x.beginPath(); x.moveTo(cx - w / 2, H * 0.84); x.lineTo(cx, H * 0.84 - h); x.lineTo(cx + w / 2, H * 0.84); x.fill(); };
  const peaks = wide ? [[0.08, 0.3, 0.42], [0.92, 0.3, 0.4], [0.3, 0.4, 0.46], [0.55, 0.34, 0.36], [0.75, 0.3, 0.3]] : [[0.25, 0.6, 0.55], [0.6, 0.5, 0.42], [0.88, 0.4, 0.3]];
  peaks.forEach(([cx, w, h], i) => mtn(W * cx, W * w, H * h, ["#3a2fa0", "#2f9a6a", "#4a3fb0", "#2f9a6a", "#3a2fa0"][i]));
  x.fillStyle = "#14503a"; x.fillRect(0, H * 0.84, W, H * 0.16);
}
const PW = 2.2, PH = 1.25, PY = 0.8;
const photoBig = art(2.9, 1.8, (x, W, H) => landscape(x, W, H, true), lid); photoBig.position.set(0, PY + 0.1, 0.042); photoBig.visible = false;
const bigFrame = add(new THREE.Group(), lid); bigFrame.position.set(0, PY + 0.1, 0.05);
[[2.9, 0.02, 0, 0.9], [2.9, 0.02, 0, -0.9], [0.02, 1.8, 1.45, 0], [0.02, 1.8, -1.45, 0]].forEach(([w, h, x, y]) => add(new THREE.Mesh(new THREE.PlaneGeometry(w, h), glow(GREEN, 1.6)), bigFrame).position.set(x, y, 0));
const photo = art(PW, PH, (x, W, H) => landscape(x, W, H, false), lid); photo.position.set(0, PY, 0.045);
const PZ = 0.05; // things on top of the photo (lid space)
const tree = (x) => { const gp = add(new THREE.Group(), lid); gp.position.set(x, PY - 0.4, PZ);
  add(new THREE.Mesh(new THREE.PlaneGeometry(0.04, 0.12), basic(0x5a3a2a)), gp).position.set(0, 0.05, 0);
  const c = add(new THREE.Mesh(new THREE.CircleGeometry(0.15, 3), basic(0x1fa060)), gp); c.rotation.z = Math.PI / 2; c.position.set(0, 0.26, 0.001); return gp; };
const tree1 = tree(-0.85), tree2 = tree(0.42);
const spot = add(new THREE.Mesh(new THREE.CircleGeometry(0.07, 24), basic(0xd01828)), lid); spot.position.set(-0.3, PY + 0.32, PZ);
const healRing = add(new THREE.Mesh(new THREE.RingGeometry(0.11, 0.135, 32), glow(GREEN, 1.8)), lid); healRing.position.set(-0.3, PY + 0.32, PZ + 0.004);
const stampRing = add(new THREE.Mesh(new THREE.RingGeometry(0.2, 0.225, 32), glow(GREEN, 1.8)), lid);
const stampLine = add(new THREE.Mesh(new THREE.PlaneGeometry(1, 0.02), glow(GREEN, 1.4)), lid); stampLine.geometry.translate(0.5, 0, 0);
// editor UI over the photo (s3): tool column left, layers panel right
const ui = add(new THREE.Group(), lid); ui.position.z = PZ + 0.006;
add(new THREE.Mesh(new THREE.PlaneGeometry(0.16, 1.1), basic(0x14123a)), ui).position.set(-1.0, PY, 0);
for (let i = 0; i < 6; i++) add(new THREE.Mesh(new THREE.PlaneGeometry(0.09, 0.09), i === 1 ? glow(GREEN, 1.4) : glow(VIOLET, 0.8)), ui).position.set(-1.0, PY + 0.42 - i * 0.16, 0.002);
add(new THREE.Mesh(new THREE.PlaneGeometry(0.36, 0.9), basic(0x14123a)), ui).position.set(0.9, PY + 0.1, 0);
for (let i = 0; i < 4; i++) add(new THREE.Mesh(new THREE.PlaneGeometry(0.28, 0.14), i ? glow(VIOLET, 0.5) : glow(GREEN, 0.9)), ui).position.set(0.9, PY + 0.42 - i * 0.2, 0.002);
// green brush stroke painted across the sky in s3
const stroke = add(new THREE.Mesh(new THREE.PlaneGeometry(1, 0.07), glow(GREEN, 1.3)), lid); stroke.geometry.translate(0.5, 0, 0); stroke.position.set(-0.55, PY + 0.45, PZ + 0.008);

// ---------- paintbrush (tip at the group origin) ----------
const brush = add(new THREE.Group());
const bh = add(new THREE.Group(), brush); bh.rotation.z = -0.55;
{ const tip = add(new THREE.Mesh(new THREE.ConeGeometry(0.06, 0.18, 20), glow(GREEN, 1.6)), bh); tip.position.set(0, 0.09, 0); tip.rotation.x = Math.PI; }
add(new THREE.Mesh(new THREE.CylinderGeometry(0.065, 0.06, 0.14, 20), std(0xd8d8e8, 0x303040, 0.25, 0.9)), bh).position.set(0, 0.25, 0);
add(new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.06, 0.7, 20), mBody), bh).position.set(0, 0.67, 0);

// ---------- monthly bills (red) ----------
function bill(month) {
  const gp = add(new THREE.Group());
  add(rbox(0.56, 0.42, 0.03, 0.03, mLav), gp);
  add(new THREE.Mesh(new THREE.PlaneGeometry(0.5, 0.13), glow(RED, 1.2)), gp).position.set(0, 0.12, 0.017);
  const t = fitText(["BILL"], WHITE, 1.0, 0.4); t.visible = true; t.position.set(0, 0.12, 0.019); gp.add(t);
  const m = fitText([month], RED, 1.4, 0.5); m.visible = true; m.position.set(0, -0.07, 0.019); gp.add(m);
  gp.visible = false; return gp;
}
const MONTHS = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN"];
const bills = MONTHS.map(bill);
const SLOT = (i) => new THREE.Vector3((i % 3 - 1) * 0.6, 1.3 - Math.floor(i / 3) * 0.5, 0.9);
const lastBill = bill("JUL");

// ---------- s4: exploded layers + blend mode menu ----------
const stack = add(new THREE.Group()); stack.position.set(-0.42, 0.95, 0.45); stack.rotation.y = 0.55;
const LW = 1.0, LH = 0.57;
const lay = [
  art(LW, LH, (x, W, H) => landscape(x, W, H, false), stack),
  art(LW, LH, (x, W, H) => { x.fillStyle = "rgba(10,8,30,0.85)"; x.fillRect(0, 0, W, H); const r = x.createRadialGradient(W * 0.45, H * 0.55, 0, W * 0.45, H * 0.55, H * 0.42); r.addColorStop(0, "#fff"); r.addColorStop(0.8, "#fff"); r.addColorStop(1, "rgba(255,255,255,0)"); x.fillStyle = r; x.fillRect(0, 0, W, H); }, stack),
  art(LW, LH, (x, W, H) => { x.fillStyle = "#ff8a3a"; x.beginPath(); x.arc(W * 0.72, H * 0.3, H * 0.13, 0, 7); x.fill(); }, stack),
];
const edges = lay.map((p) => { const e = new THREE.LineSegments(new THREE.EdgesGeometry(p.geometry), new THREE.LineBasicMaterial({ color: new THREE.Color(VIOLET).multiplyScalar(1.4), toneMapped: false })); p.add(e); return e; });
const MODES = ["NORMAL", "DISSOLVE", "DARKEN", "MULTIPLY", "COLOR BURN"];
const menu = art(0.8, 1.05, (x, W, H) => {
  x.fillStyle = "#14123a"; x.beginPath(); x.roundRect(0, 0, W, H, 30); x.fill(); x.strokeStyle = "#a596ff"; x.lineWidth = 6; x.stroke();
  x.fillStyle = "#a596ff"; x.font = "800 34px Inter, Arial"; x.textAlign = "center"; x.fillText("BLEND MODE", W / 2, 70);
  x.fillStyle = "#fff"; x.font = "800 34px Inter, Arial"; x.textAlign = "left";
  MODES.forEach((m, i) => x.fillText(m, 40, 150 + i * 66));
}); menu.position.set(0.72, 1.0, 0.45);
const hilite = add(new THREE.Mesh(new THREE.PlaneGeometry(0.72, 0.13), glow(GREEN, 0.5)));
hilite.material.transparent = true; hilite.material.opacity = 0.55;
const rowY = (i) => 1.0 + 0.525 - (150 + i * 66 - 13) / 400;

// ---------- s6: PSD file + shortcut keys ----------
function makeFile(hex, txt) {
  const gp = add(new THREE.Group());
  add(rbox(0.56, 0.72, 0.06, 0.05, mLav), gp);
  add(new THREE.Mesh(new THREE.PlaneGeometry(0.46, 0.2), glow(hex, 0.55)), gp).position.set(0, -0.12, 0.032);
  const corner = add(new THREE.Mesh(new THREE.CircleGeometry(0.09, 3), glow(ORANGE, 1.4)), gp); corner.position.set(0.19, 0.27, 0.033); corner.rotation.z = Math.PI / 4;
  [0.14, 0.06].forEach((y) => add(new THREE.Mesh(new THREE.PlaneGeometry(0.3, 0.025), basic(0x6a5fd0)), gp).position.set(-0.05, y, 0.032));
  const t = fitText([txt], WHITE, 1.6, 0.44); t.visible = true; t.position.set(0, -0.12, 0.034); gp.add(t);
  gp.visible = false; return gp;
}
const psd = makeFile(VIOLET, "PSD");
const KEYS = ["V", "B", "M", "L"];
const mKey = std(0x2a2470, 0x120e40, 0.4, 0.2);
const keys = KEYS.map((k, i) => {
  const gp = add(new THREE.Group());
  add(rbox(0.34, 0.34, 0.12, 0.05, mKey), gp);
  const rim = add(new THREE.Mesh(new THREE.PlaneGeometry(0.3, 0.3), glow(GREEN, 0.2)), gp); rim.position.z = 0.061;
  const t = fitText([k], WHITE, 1.0, 0.5); t.visible = true; t.position.z = 0.063; gp.add(t);
  gp.userData.rim = rim; gp.visible = false; return gp;
});

// ---------- s3: GitHub star (as in filee) ----------
const starShape = new THREE.Shape();
for (let i = 0; i < 10; i++) { const a = Math.PI / 2 + (i * Math.PI) / 5, r = i % 2 ? 0.17 : 0.4; starShape[i ? "lineTo" : "moveTo"](Math.cos(a) * r, Math.sin(a) * r); }
const star = add(new THREE.Mesh(new THREE.ExtrudeGeometry(starShape, { depth: 0.08, bevelEnabled: true, bevelSize: 0.03, bevelThickness: 0.03, bevelSegments: 2 }), glow(ORANGE, 1.5)));

// ---------- captions ----------
title("NEVER PAY TO EDIT PHOTOS");
cap("s1", "exploring", ["EXPLORING GITHUB REPOS"], WHITE, { until: "s1" });
cap("s2", "bills", ["BILLED EVERY MONTH"], RED, { until: ["s2", "even"], boom: 0.4 });
cap("s2", "even", ["EVEN IF YOU", "BARELY OPEN IT"], RED);
cap("s3", "compositor", ["COMPOSITOR"], GREEN, { until: ["s3", "over"], boom: 0.5 });
cap("s3", "over", ["OVER 18,000 STARS", "IN 8 WEEKS"], ORANGE, { until: ["s3", "it's"], boom: 0.5 });
cap("s3", "it's", ["FULL IMAGE EDITOR", "FOR YOUR MAC"], GREEN, { until: ["s3", "completely"] });
cap("s3", "completely", ["COMPLETELY FREE"], GREEN, { boom: 0.5 });
cap("s4", "layers", ["LAYERS"], VIOLET, { until: ["s4", "masks"], boom: 0.4 });
cap("s4", "masks", ["MASKS"], VIOLET, { until: ["s4", "all"] });
cap("s4", "all", ["PHOTOSHOP'S", "BLEND MODES"], VIOLET, { until: ["s4", "same"] });
cap("s4", "same", ["IN THE SAME ORDER"], GREEN);
cap("s5", "fix", ["FIX SPOTS"], GREEN, { until: ["s5", "copy"] });
cap("s5", "copy", ["COPY PARTS"], GREEN, { until: ["s5", "grow"] });
cap("s5", "grow", ["GROW PAST THE EDGES"], GREEN, { boom: 0.4 });
cap("s6", "opens", ["OPENS PHOTOSHOP FILES"], VIOLET, { until: ["s6", "shortcuts"] });
cap("s6", "shortcuts", ["SAME SHORTCUTS"], GREEN, { until: ["s6", "hands"], boom: 0.4 });
cap("s6", "hands", ["YOUR HANDS", "ALREADY KNOW"], GREEN);
endCard(["KEEP THE SHORTCUTS.", "DROP THE BILL."]);

// ---------- timings (global seconds) ----------
const T = {
  bill: g("s1", "bill"), billT: [g("s1", "bill"), g("s2", "bills"), g("s2", "every"), g("s2", "month"), g("s2", "months"), g("s2", "barely")],
  barely: g("s2", "barely"), s3: S.s3[0], over: g("s3", "over"), its: g("s3", "it's"), full: g("s3", "full"), completely: g("s3", "completely"),
  s4: S.s4[0], masks: g("s4", "masks"), blend: g("s4", "blend"), all: g("s4", "all"), same: g("s4", "same"), order: g("s4", "order"),
  s5: S.s5[0], fix: g("s5", "fix"), copy: g("s5", "copy"), grow: g("s5", "grow"), edges: g("s5", "edges"),
  s6: S.s6[0], opens: g("s6", "opens"), files: g("s6", "files"), shortcuts: g("s6", "shortcuts"), hands: g("s6", "hands"),
  s7: S.s7[0], drop: g("s7", "drop"), s8: S.s8[0],
};

// ---------- shots: [cx,cy,cz, lx,ly,lz, fov] ----------
const SH = [
  { at: 0, K: [[0, [0.3, 1.8, 5.6, 0, 0.9, -0.5, 48]], [S.s2[0], [0.1, 1.7, 5.4, 0, 1.0, -0.3, 48]]] },
  { at: S.s2[0], K: [[0, [0.1, 1.7, 5.4, 0, 1.0, -0.2, 48]], [3.9, [-0.1, 1.7, 5.7, 0, 0.95, -0.2, 48]]] },
  { at: T.s3, K: [[0, [-0.6, 2.1, 5.8, 0, 1.0, -0.6, 48]], [3.6, [0.2, 1.8, 5.2, 0, 1.0, -0.6, 46]], [8.1, [0.1, 1.8, 5.0, 0, 1.0, -0.6, 46]]] },
  { at: T.s4, K: [[0, [0.5, 1.6, 5.4, 0.15, 1.0, 0.0, 48]], [3.4, [0.2, 1.5, 5.1, 0.15, 1.0, 0.0, 48]]] },
  { at: T.s5, K: [[0, [0.0, 1.45, 5.2, 0, 0.9, -0.7, 46]], [T.grow - T.s5 - 0.2, [0.1, 1.45, 5.0, 0, 0.9, -0.7, 46]], [T.grow - T.s5 + 0.5, [0, 1.7, 6.3, 0, 0.95, -0.7, 48]], [S.s5[1], [0, 1.7, 6.5, 0, 0.95, -0.7, 48]]] },
  { at: T.s6, K: [[0, [0.4, 2.0, 6.6, 0, 0.8, -0.4, 48]], [4.0, [0.1, 1.9, 6.3, 0, 0.75, -0.4, 48]]] },
  { at: T.s7, calm: 1, K: [[0, [0.3, 2.4, 6.6, 0, 1.1, -0.6, 50]], [3.2, [0.5, 2.6, 7.2, 0, 1.2, -0.6, 50]]] },
];

const pop = (o, a, s = 1) => { o.visible = a > 0.01; o.scale.setScalar(s * Math.max(0.001, a)); };
const onOff = (t, a, b) => sm(a - 0.05, a + 0.2, t) * (1 - sm(b - 0.15, b, t));
const v = new THREE.Vector3();
const onScreen = (x, y, z = 0.12) => { lid.updateMatrixWorld(); return lid.localToWorld(v.set(x, y, z)); };

run("compositor-world", (t) => {
  const wrong = t < T.s3;
  WORLD.visible = t < T.s8 - 0.1;
  accent.material.color.set(wrong ? (t >= T.bill ? RED : VIOLET) : GREEN).multiplyScalar(1.6);

  // lid: closes halfway on "barely open it", opens again on "Instead"
  lid.rotation.x = -0.12 + 0.85 * sm(T.barely, T.barely + 0.6, t) * (1 - sm(T.s3, T.s3 + 0.45, t));
  photo.material.color.setScalar(0.82 * (1 - 0.6 * sm(T.barely, T.barely + 0.5, t) * (1 - sm(T.s3, T.s3 + 0.4, t))));

  // bills: JAN pops center in s1, then each month takes a slot in a grid in front of the screen; gone on "Instead"
  bills.forEach((b, i) => {
    const k = sm(T.billT[i] - 0.1, T.billT[i] + 0.2, t) * (1 - sm(T.s3 - 0.05, T.s3 + 0.3, t));
    pop(b, k, i === 0 && t < S.s2[0] ? 1.5 : 1);
    if (i === 0 && t < S.s2[0]) b.position.set(0, 1.0, 0.9);
    else if (i === 0) b.position.lerpVectors(new THREE.Vector3(0, 1.0, 0.9), SLOT(0), sm(S.s2[0], S.s2[0] + 0.3, t));
    else b.position.copy(SLOT(i)).add(new THREE.Vector3(0, 0.5 * (1 - k), 0));
    if (i === 0 && t >= S.s2[0]) b.scale.setScalar(Math.max(0.001, k * (1.5 - 0.5 * sm(S.s2[0], S.s2[0] + 0.3, t))));
    b.rotation.z = 0.08 * Math.sin(i * 2.1);
  });

  // s3: brush paints a green stroke ("Compositor"), star, editor UI, then the brush paints again ("free")
  const br1 = onOff(t, T.s3 + 0.05, T.over - 0.05), br2 = onOff(t, T.completely - 0.1, T.s4);
  const brA = Math.max(br1, br2);
  const p1 = sm(T.s3 + 0.3, T.over - 0.3, t), p2 = sm(T.completely, S.s4[0] - 0.2, t);
  const sx = br2 > 0.01 ? -0.55 + 1.1 * p2 : -0.55 + 1.1 * p1, sy = br2 > 0.01 ? PY + 0.2 : PY + 0.45;
  pop(brush, brA); brush.position.copy(onScreen(sx, sy, 0.1));
  stroke.visible = t > T.s3 + 0.3 && t < T.s4; stroke.scale.set(Math.max(0.001, 1.1 * Math.max(p1, 0.001)), 1, 1);
  const sk = sm(T.over - 0.1, T.over + 0.25, t) * (1 - sm(T.its - 0.15, T.its + 0.1, t));
  star.visible = sk > 0.01; star.scale.setScalar(0.5 * sk * (1 + 0.08 * Math.sin(t * 6)));
  star.position.set(0, 1.82, -0.3); star.rotation.y = 0.35 * Math.sin((t - T.over) * 2.5);
  ui.visible = t >= T.its && t < T.s4; ui.scale.setScalar(sm(T.its, T.its + 0.25, t) || 0.001);

  // s4: three layers fly out of the screen and fan apart; mask glows; blend menu rows light up in order
  const out = sm(T.s4 - 0.05, T.s4 + 0.4, t) * (1 - sm(T.s5 - 0.2, T.s5, t));
  stack.visible = out > 0.01;
  lay.forEach((p, i) => { p.position.set(0, 0, -0.5 + (0.5 + i * 0.32) * out); p.scale.setScalar(Math.max(0.001, out)); });
  const mk = onOff(t, T.masks - 0.05, T.all);
  edges[1].material.color.set(mk > 0.1 ? GREEN : VIOLET).multiplyScalar(1.4); lay[1].scale.setScalar(Math.max(0.001, out * (1 + 0.12 * mk)));
  const mA = onOff(t, T.all - 0.05, T.s5);
  pop(menu, mA);
  const row = Math.min(4, Math.max(0, Math.floor((t - T.same) / ((T.order + 0.4 - T.same) / 5))));
  hilite.visible = mA > 0.5 && t >= T.same - 0.05; hilite.position.set(0.72, rowY(t >= T.same ? row : 0), 0.46);

  // s5: heal the red spot, stamp-copy the tree, grow the photo past its edges
  spot.visible = t < T.fix + 0.5; spot.scale.setScalar(Math.max(0.001, 1 - sm(T.fix + 0.15, T.fix + 0.5, t)));
  pop(healRing, onOff(t, T.fix - 0.05, T.copy - 0.1), 1 + 0.1 * Math.sin(t * 8));
  const cl = sm(T.copy + 0.3, T.copy + 0.7, t);
  tree2.visible = t >= T.copy + 0.3; tree2.scale.setScalar(Math.max(0.001, cl));
  const stA = onOff(t, T.copy - 0.05, T.grow);
  pop(stampRing, stA); stampRing.position.set(-0.85, PY - 0.25, PZ + 0.004);
  stampLine.visible = stA > 0.01; stampLine.position.set(-0.85, PY - 0.25, PZ + 0.004); stampLine.scale.set(Math.max(0.001, 1.27 * sm(T.copy, T.copy + 0.4, t)), 1, 1);
  const gw = sm(T.grow, T.grow + 0.6, t) * (1 - sm(T.s6 - 0.2, T.s6 + 0.1, t));
  photoBig.visible = gw > 0.01; photoBig.scale.set(0.76 + 0.24 * gw, 0.69 + 0.31 * gw, 1);
  bigFrame.visible = photoBig.visible && t < T.s6; bigFrame.scale.copy(photoBig.scale);

  // s6: a PSD file flies into the screen; then four shortcut keys rise off the keyboard and press in turn
  const fk = sm(T.opens - 0.1, T.files + 0.3, t);
  psd.visible = t >= T.opens - 0.1 && t < T.files + 0.5;
  psd.position.lerpVectors(new THREE.Vector3(1.0, 1.9, 1.0), onScreen(0, PY, 0.15), fk); psd.scale.setScalar(Math.max(0.001, 1.15 - 0.85 * sm(T.files, T.files + 0.4, t)));
  psd.rotation.y = -0.4 * (1 - fk);
  keys.forEach((k, i) => {
    const a = onOff(t, T.shortcuts - 0.1 + 0.08 * i, T.s7);
    pop(k, a); k.position.set((i - 1.5) * 0.44, 0.22 + 0.3 * a, 0.25);
    const press = Math.max(0, 1 - Math.abs(t - (T.hands + 0.25 * i)) / 0.2);
    k.position.y -= 0.06 * press; k.userData.rim.material.color.set(GREEN).multiplyScalar(0.2 + 0.45 * press);
  });

  // s7: one last red bill drops off the desk on "Drop"
  const lb = onOff(t, T.s7 + 0.05, T.s8);
  pop(lastBill, lb, 1.3);
  const fall = sm(T.drop, T.drop + 0.7, t);
  lastBill.position.set(0.9 * fall, 1.0 + 1.0 * fall - 1.8 * fall * fall, 0.9); lastBill.rotation.z = -1.2 * fall; lastBill.scale.multiplyScalar(1 - 0.8 * fall);

  const { punch } = shoot(SH, t);
  const spike = overlays(t);
  bloom.strength = Math.min(1.45, 1.0 + 1.2 * punch * punch + spike);
});
