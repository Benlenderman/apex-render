// NEVER BUILD A RADAR FROM SCRATCH (PLFM Radar / AERIS-10). Dark bench; wrong = loose red parts, guessed wires, a dead box;
// right = a flat-panel radar that steers its beam, spins, and puts echoes on a map.
import { THREE, S, g, sm, scene, bloom, glow, VIOLET, ORANGE, RED, GREEN, WHITE, beam, label, shoot, run } from "./kit.js";
import { title, cap, boom, endCard, overlays, fitText } from "./extra.js";
import { RoundedBoxGeometry } from "three/addons/geometries/RoundedBoxGeometry.js";

const std = (c, e, r = 0.45, m = 0.25) => new THREE.MeshStandardMaterial({ color: c, emissive: e, roughness: r, metalness: m });
const rbox = (w, h, d, r, mat) => new THREE.Mesh(new RoundedBoxGeometry(w, h, d, 4, r), mat);
const mBody = std(0x4a42c8, 0x1c1766, 0.35, 0.35), mDark = std(0x14123a, 0x07061a, 0.6, 0.2), mLav = std(0xc9c0ff, 0x4a3fb0, 0.4, 0.1);
const mPcb = std(0x0f5a33, 0x06301a, 0.5, 0.2), mGrey = std(0x5a566e, 0x1a1828, 0.6, 0.3);
const root = new THREE.Group(); scene.add(root);
const add = (o, p = root) => (p.add(o), o);

// ---------- bench + lights ----------
const desk = add(rbox(9, 0.3, 6, 0.12, std(0x221d66, 0x0c0a30, 0.7, 0.1))); desk.position.set(0, -0.14, 0);
const pl = add(new THREE.PointLight(0xe8e2ff, 18, 10, 1.6)); pl.position.set(-1.8, 3.4, 2.6);
const rim = add(new THREE.PointLight(0xff8a3a, 8, 8, 1.6)); rim.position.set(2.6, 2.4, -2.2);

// ================= WRONG WAY =================
// blank page on a stand, with a red "?"
const page = add(new THREE.Group()); page.position.set(0, 0.02, -0.7);
const sheet = rbox(1.25, 1.65, 0.04, 0.02, mLav); sheet.position.set(0, 0.85, 0); sheet.rotation.x = -0.25; page.add(sheet);
const qm = fitText(["?"], RED, 1.6, 2.6); qm.visible = true; qm.renderOrder = 4; qm.material.depthTest = true; qm.position.set(0, 0, 0.03); sheet.add(qm);
// loose parts: chips with red pins, resistors, capacitors
function chip(mPin, w = 0.42) {
  const gp = new THREE.Group();
  gp.add(rbox(w, 0.08, w * 0.7, 0.015, mDark));
  for (let i = 0; i < 4; i++) for (const s of [-1, 1]) { const p = new THREE.Mesh(new THREE.BoxGeometry(0.03, 0.02, 0.09), mPin); p.position.set(-w * 0.36 + i * w * 0.24, -0.02, s * w * 0.4); gp.add(p); }
  const dot = new THREE.Mesh(new THREE.CircleGeometry(0.025, 12), mPin); dot.rotation.x = -Math.PI / 2; dot.position.set(-w * 0.32, 0.042, -w * 0.2); gp.add(dot);
  return gp;
}
function resistor() {
  const gp = new THREE.Group(); const c = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 0.32, 16), std(0xd8b48a, 0x3a2a1a)); c.rotation.z = Math.PI / 2; gp.add(c);
  [-0.08, 0, 0.08].forEach((x) => { const b = new THREE.Mesh(new THREE.CylinderGeometry(0.064, 0.064, 0.03, 16), glow(RED, 1.2)); b.rotation.z = Math.PI / 2; b.position.x = x; gp.add(b); });
  const l = new THREE.Mesh(new THREE.CylinderGeometry(0.01, 0.01, 0.64, 6), mGrey); l.rotation.z = Math.PI / 2; gp.add(l);
  return gp;
}
function capacitor() {
  const gp = new THREE.Group(); const c = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.1, 0.28, 20), std(0x2a2a6a, 0x0c0c30)); c.position.y = 0.14; gp.add(c);
  const top = new THREE.Mesh(new THREE.CircleGeometry(0.1, 20), glow(RED, 1.0)); top.rotation.x = -Math.PI / 2; top.position.y = 0.281; gp.add(top);
  return gp;
}
const mRedPin = glow(RED, 1.4);
const PARTS = [[chip(mRedPin), -0.8, 0.3], [resistor(), 0.75, 0.5], [capacitor(), -0.45, 0.85], [chip(mRedPin, 0.34), 0.45, 0.95], [resistor(), -0.85, 1.1], [capacitor(), 0.85, 0.05]];
const parts = PARTS.map(([o, x, z]) => { add(o); o.position.set(x, 0.06, z); o.userData.home = new THREE.Vector3(x, 0.06, z); return o; });
// guessed wires: red zigzags between parts
const mWire = glow(RED, 1.8);
const wires = [[0, 3], [1, 2], [4, 5], [2, 3], [0, 1]].map(([a, b]) => {
  const A = parts[a].userData.home, B = parts[b].userData.home, mid = A.clone().lerp(B, 0.5); mid.y = 0.55;
  const curve = new THREE.QuadraticBezierCurve3(A.clone().setY(0.12), mid, B.clone().setY(0.12));
  return add(new THREE.Mesh(new THREE.TubeGeometry(curve, 24, 0.018, 6), mWire));
});
// the box that sees nothing: grey case, dead round screen with a flat red line, red X
const dead = add(new THREE.Group()); dead.position.set(0, 0.02, 0.4);
const dcase = rbox(1.5, 1.0, 0.9, 0.06, mGrey); dcase.position.y = 0.5; dead.add(dcase);
const scope = new THREE.Mesh(new THREE.CircleGeometry(0.34, 40), new THREE.MeshBasicMaterial({ color: 0x050410 })); scope.position.set(-0.25, 0.52, 0.452); dead.add(scope);
const flat = new THREE.Mesh(new THREE.PlaneGeometry(0.6, 0.025), glow(RED, 1.8)); flat.position.set(-0.25, 0.52, 0.455); dead.add(flat);
[0.36, 0.56].forEach((y) => { const k = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.07, 0.06, 20), mDark); k.rotation.x = Math.PI / 2; k.position.set(0.45, y + 0.05, 0.47); dead.add(k); });
const xMark = new THREE.Group(); xMark.position.set(0, 0.55, 0.62); dead.add(xMark);
[0.8, -0.8].forEach((r) => { const b = new THREE.Mesh(new THREE.BoxGeometry(1.25, 0.09, 0.05), glow(RED, 2.2)); b.rotation.z = r; xMark.add(b); });

// ================= RIGHT WAY: flat-panel radar =================
function makeRadar(s = 1) {
  const R = new THREE.Group(); add(R);
  const base = new THREE.Mesh(new THREE.CylinderGeometry(0.5, 0.58, 0.26, 40), mBody); base.position.y = 0.13; R.add(base);
  const ringL = new THREE.Mesh(new THREE.TorusGeometry(0.54, 0.018, 8, 48), glow(VIOLET, 1.6)); ringL.rotation.x = Math.PI / 2; ringL.position.y = 0.2; R.add(ringL);
  const yaw = new THREE.Group(); yaw.position.y = 0.26; R.add(yaw);
  const mast = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.1, 0.62, 16), mDark); mast.position.y = 0.31; yaw.add(mast);
  const panel = new THREE.Group(); panel.position.set(0, 0.95, 0); panel.rotation.x = -0.12; yaw.add(panel);
  panel.add(rbox(1.5, 1.4, 0.12, 0.04, mBody));
  const face = new THREE.Mesh(new THREE.PlaneGeometry(1.36, 1.26), new THREE.MeshBasicMaterial({ color: 0x0a1a1a })); face.position.z = 0.062; panel.add(face);
  const pads = [];
  for (let i = 0; i < 4; i++) for (let j = 0; j < 4; j++) { const p = new THREE.Mesh(new THREE.PlaneGeometry(0.2, 0.2), glow(GREEN, 0.9)); p.position.set(-0.48 + i * 0.32, -0.45 + j * 0.3, 0.065); panel.add(p); pads.push(p); }
  const bm = new THREE.Group(); bm.position.z = 0.07; panel.add(bm);
  const cg = new THREE.ConeGeometry(0.62, 3.2, 40, 1, true); cg.translate(0, -1.6, 0); cg.rotateX(-Math.PI / 2);
  const cone = new THREE.Mesh(cg, new THREE.MeshBasicMaterial({ color: new THREE.Color(GREEN).multiplyScalar(0.9), transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide, toneMapped: false }));
  bm.add(cone);
  const core = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 3.2, 8), glow(GREEN, 2.0)); core.rotation.x = Math.PI / 2; core.position.z = 1.6; bm.add(core);
  R.scale.setScalar(s);
  R.userData = { yaw, panel, bm, cone, core, pads };
  R.setBeam = (a, len = 1) => { cone.material.opacity = 0.32 * a; cone.visible = core.visible = a > 0.01; bm.scale.set(1, 1, Math.max(0.01, len)); core.material.color.set(GREEN).multiplyScalar(2 * a); };
  R.setBeam(0);
  return R;
}
const radar = makeRadar(1);

// ---------- s5: chip + map display, off to the right ----------
const DX = 7;
const disp = add(new THREE.Group()); disp.position.set(DX, 0, -0.4); disp.scale.setScalar(0.82);
const mon = rbox(1.9, 1.9, 0.14, 0.06, mBody); mon.position.y = 1.25; disp.add(mon);
const stand = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.07, 0.35, 12), mDark); stand.position.y = 0.17; disp.add(stand);
const mapFace = new THREE.Mesh(new THREE.CircleGeometry(0.8, 64), new THREE.MeshBasicMaterial({ color: 0x062016 })); mapFace.position.set(0, 1.25, 0.075); disp.add(mapFace);
[0.27, 0.53, 0.79].forEach((r) => { const t = new THREE.Mesh(new THREE.TorusGeometry(r, 0.008, 6, 64), glow(GREEN, 0.9)); t.position.set(0, 1.25, 0.08); disp.add(t); });
[[1.6, 0.01], [0.01, 1.6]].forEach(([w, h]) => { const l = new THREE.Mesh(new THREE.PlaneGeometry(w, h), glow(GREEN, 0.6)); l.position.set(0, 1.25, 0.08); disp.add(l); });
const sweep = new THREE.Group(); sweep.position.set(0, 1.25, 0.085); disp.add(sweep);
const sw = new THREE.Mesh(new THREE.PlaneGeometry(0.8, 0.025), glow(GREEN, 2.0)); sw.position.x = 0.4; sweep.add(sw);
const DOTS = [[0.35, 0.3], [-0.42, 0.18], [0.12, -0.55], [-0.2, -0.33], [0.6, -0.1], [-0.5, 0.52]];
const dots = DOTS.map(([x, y]) => { const d = new THREE.Mesh(new THREE.SphereGeometry(0.045, 12, 8), glow(ORANGE, 2.2)); d.position.set(x, 1.25 + y, 0.1); disp.add(d); return d; });
const fpga = chip(glow(GREEN, 1.4), 0.6); fpga.position.set(0, 0.06, 1.0); disp.add(fpga);
const fpgaGlow = new THREE.Mesh(new THREE.PlaneGeometry(0.36, 0.26), glow(GREEN, 1.2)); fpgaGlow.rotation.x = -Math.PI / 2; fpgaGlow.position.set(0, 0.105, 1.0); disp.add(fpgaGlow);
const echo = beam(GREEN, 1.6, 0.03);
// echo pulses flying from the chip into the display
const pulses = [0, 1, 2].map(() => { const p = new THREE.Mesh(new THREE.SphereGeometry(0.05, 12, 8), glow(GREEN, 2.4)); disp.add(p); return p; });

// ---------- s6: small (3 km) and big (20 km) radars + boards and code ----------
const BX = -8;
const small = makeRadar(0.55), big = makeRadar(0.9);
small.position.set(BX - 0.85, 0, 0); big.position.set(BX + 0.6, 0, 0);
const t3 = fitText(["3 KM"], GREEN, 1.8, 1.4), t20 = fitText(["20 KM"], GREEN, 1.8, 1.4);
function pcb(i) {
  const gp = new THREE.Group(); add(gp);
  gp.add(rbox(1.3, 0.85, 0.04, 0.02, mPcb));
  for (let k = 0; k < 6; k++) { const tr = new THREE.Mesh(new THREE.PlaneGeometry(0.9 - 0.1 * (k % 3), 0.012), glow(ORANGE, 1.0)); tr.position.set(-0.05, -0.32 + k * 0.13, 0.022); gp.add(tr); }
  const c = chip(glow(GREEN, 1.2), 0.32); c.rotation.x = Math.PI / 2; c.position.set(0.32 - 0.2 * i, 0.08, 0.05); gp.add(c);
  return gp;
}
const boards = [0, 1, 2].map(pcb);
const code = add(new THREE.Group());
code.add(rbox(1.3, 0.95, 0.04, 0.03, mDark));
const cbar = new THREE.Mesh(new THREE.PlaneGeometry(1.3, 0.1), glow(VIOLET, 0.4)); cbar.position.set(0, 0.42, 0.022); code.add(cbar);
[[0.6, VIOLET], [0.8, GREEN], [0.45, ORANGE], [0.7, GREEN], [0.55, VIOLET], [0.35, ORANGE]].forEach(([w, c], k) => { const l = new THREE.Mesh(new THREE.PlaneGeometry(w, 0.04), glow(c, 1.0)); l.position.set(-0.5 + w / 2 + (k % 2) * 0.1, 0.27 - k * 0.11, 0.023); code.add(l); });

// ---------- s3: GitHub star ----------
const starShape = new THREE.Shape();
for (let i = 0; i < 10; i++) { const a = Math.PI / 2 + (i * Math.PI) / 5, r = i % 2 ? 0.17 : 0.4; starShape[i ? "lineTo" : "moveTo"](Math.cos(a) * r, Math.sin(a) * r); }
const star = add(new THREE.Mesh(new THREE.ExtrudeGeometry(starShape, { depth: 0.08, bevelEnabled: true, bevelSize: 0.03, bevelThickness: 0.03, bevelSegments: 2 }), glow(ORANGE, 1.5)));

// ---------- captions ----------
title("NEVER BUILD A RADAR FROM SCRATCH");
cap("s1", "exploring", ["EXPLORING GITHUB REPOS"], WHITE, { until: "s1" });
cap("s2", "hunt", ["HUNT FOR PARTS"], RED, { until: ["s2", "guess"] });
cap("s2", "guess", ["GUESS EVERY CIRCUIT"], RED, { until: ["s2", "box"] });
cap("s2", "box", ["A BOX THAT SEES NOTHING"], RED, { boom: 0.5 });
cap("s3", "plfm", ["PLFM RADAR"], GREEN, { until: ["s3", "over"], boom: 0.5 });
cap("s3", "over", ["OVER 27,000 STARS", "IN 8 MONTHS"], ORANGE, { until: ["s3", "open"], boom: 0.5 });
cap("s3", "open", ["OPEN SOURCE"], GREEN, { until: ["s3", "full"] });
cap("s3", "full", ["A FULL RADAR", "YOU BUILD YOURSELF"], GREEN);
cap("s4", "aims", ["LEFT, RIGHT, UP, DOWN"], VIOLET, { until: ["s4", "without"] });
cap("s4", "without", ["WITHOUT MOVING"], GREEN, { boom: 0.4 });
cap("s5", "spins", ["SPINS ALL THE WAY AROUND"], VIOLET, { until: ["s5", "chip"] });
cap("s5", "chip", ["ECHOES INTO", "DOTS ON A MAP"], GREEN, { boom: 0.4 });
cap("s6", "one", ["3 KM OR 20 KM"], GREEN, { until: ["s6", "every"], boom: 0.4 });
cap("s6", "every", ["EVERY BOARD", "ALL THE CODE"], GREEN, { until: ["s6", "free"] });
cap("s6", "free", ["FREE"], GREEN, { boom: 0.5 });
endCard(["DON'T START FROM SCRATCH.", "START FROM THE PLANS."]);
boom("s2", "nothing", 0.5);

// ---------- timings (global seconds) ----------
const T = {
  s2: S.s2[0], hunt: g("s2", "hunt"), guess: g("s2", "guess"), box: g("s2", "box"), s3: S.s3[0], over: g("s3", "over"), open: g("s3", "open"),
  aims: g("s4", "aims"), left: g("s4", "left"), right: g("s4", "right"), up: g("s4", "up"), down: g("s4", "down"), without: g("s4", "without"),
  spins: g("s5", "spins"), around: g("s5", "around"), chip: g("s5", "chip"), echoes: g("s5", "echoes"), dots: g("s5", "dots"),
  s6: S.s6[0], bigger: g("s6", "bigger"), every: g("s6", "every"), free: g("s6", "free"), s7: S.s7[0], s8: S.s8[0],
};

// ---------- shots: [cx,cy,cz, lx,ly,lz, fov] ----------
const SH = [
  { at: 0, K: [[0, [0.3, 2.1, 5.6, 0, 0.75, -0.3, 48]], [S.s2[0], [0.1, 2.0, 5.0, 0, 0.7, -0.2, 48]], [S.s2[0] + S.s2[1], [-0.2, 1.9, 4.6, 0, 0.6, 0, 48]]] },
  { at: T.box - 0.1, K: [[0, [0.6, 1.6, 4.2, 0, 0.6, 0.3, 46]], [2, [0.3, 1.5, 3.8, 0, 0.6, 0.3, 46]]] },
  { at: T.s3, K: [[0, [-0.6, 1.9, 6.8, 0, 1.3, 0, 48]], [4, [0.2, 1.8, 6.3, 0, 1.3, 0, 46]]] },
  { at: T.open - 0.1, K: [[0, [1.8, 1.7, 4.8, 0, 1.0, 0, 48]], [3, [1.3, 1.9, 5.2, 0, 1.0, 0, 48]]] },
  { at: S.s4[0], K: [[0, [3.6, 3.0, 4.4, 0.2, 1.3, 1.0, 52]], [3.4, [3.2, 3.2, 4.8, 0.2, 1.3, 1.0, 52]]] },
  { at: S.s5[0], K: [[0, [0.4, 2.3, 5.6, 0, 1.1, 0, 48]], [2, [-0.4, 2.4, 5.4, 0, 1.1, 0, 48]]] },
  { at: T.chip - 0.1, K: [[0, [DX + 0.3, 1.5, 5.6, DX, 0.8, -0.2, 48]], [2.5, [DX - 0.2, 1.4, 5.9, DX, 0.75, -0.2, 48]]] },
  { at: T.s6, K: [[0, [BX, 2.0, 6.6, BX, 1.45, 0, 50]], [4.9, [BX + 0.3, 2.1, 6.2, BX, 1.45, 0, 50]]] },
  { at: T.s7, calm: 1, K: [[0, [0.3, 2.4, 6.6, 0, 1.45, 0, 50]], [4, [0.5, 2.6, 7.2, 0, 1.45, 0, 50]]] },
];

run("plfm-radar-world", (t) => {
  root.visible = t < T.s8 - 0.12; // nothing from the scene under the CTA
  const wrong = t < T.s3;

  // --- wrong way ---
  const deadK = sm(T.box - 0.1, T.box + 0.25, t);
  page.visible = wrong && deadK < 0.99; page.scale.setScalar(1 - deadK);
  parts.forEach((p, i) => {
    const pop = sm(0.15 + 0.12 * i, 0.45 + 0.12 * i, t);
    const hop = Math.max(0, Math.sin((t - T.hunt - 0.18 * i) * 7)) * 0.35 * sm(T.hunt, T.hunt + 0.1, t) * (1 - sm(T.guess, T.guess + 0.2, t));
    p.visible = wrong && pop * (1 - deadK) > 0.01;
    p.position.copy(p.userData.home).setY(0.06 + hop); p.scale.setScalar(pop * (1 - deadK));
    p.rotation.y = 0.4 * i + hop;
  });
  wires.forEach((w, i) => { const k = sm(T.guess + 0.1 * i, T.guess + 0.1 * i + 0.2, t) * (1 - deadK); w.visible = wrong && k > 0.01; w.scale.setScalar(Math.max(0.01, k)); mWire.color.set(RED).multiplyScalar(1.2 + 0.8 * Math.abs(Math.sin(t * 14))); });
  dead.visible = wrong && deadK > 0.01; dead.scale.setScalar(deadK);
  xMark.visible = t >= g("s2", "nothing"); xMark.scale.setScalar(sm(g("s2", "nothing"), g("s2", "nothing") + 0.2, t));

  // --- main radar ---
  const rise = sm(T.s3 - 0.05, T.s3 + 0.3, t);
  radar.visible = !wrong && t < T.chip - 0.1 || t >= T.s7;
  radar.scale.setScalar(t >= T.s7 ? 1 : rise);
  const { yaw, panel, bm, pads } = radar.userData;
  pads.forEach((p, i) => p.material.color.set(GREEN).multiplyScalar(0.55 + 0.35 * Math.max(0, Math.sin(t * 5 - i * 0.4))));
  // s4: beam steers left, right, up, down; panel stays put
  const beamOn = sm(T.aims - 0.1, T.aims + 0.2, t);
  const side = -0.75 * sm(T.left - 0.1, T.left + 0.2, t) + 1.5 * sm(T.right - 0.1, T.right + 0.2, t) - 0.75 * sm(T.up - 0.15, T.up + 0.05, t);
  const vert = -0.65 * sm(T.up - 0.1, T.up + 0.15, t) + 1.3 * sm(T.down - 0.1, T.down + 0.15, t) - 0.65 * sm(T.without, T.without + 0.3, t);
  bm.rotation.set(t < S.s5[0] ? vert : 0, t < S.s5[0] ? side : 0, 0);
  // s5: the motor spins the whole panel around once; s7: slow turn
  yaw.rotation.y = t >= T.s7 ? 0.5 * Math.sin((t - T.s7) * 1.2) : Math.PI * 2 * sm(T.spins, T.around + 0.35, t);
  radar.setBeam(t >= T.s7 ? 0.8 : beamOn * (t < T.chip ? 1 : 0), 0.8);

  // s3 star: smaller and low, clear of the two-line caption
  const sk = sm(T.over - 0.1, T.over + 0.25, t) * (1 - sm(T.open - 0.25, T.open, t));
  star.visible = sk > 0.01; star.scale.setScalar(0.42 * sk * (1 + 0.06 * Math.sin(t * 6)));
  star.position.set(0, 2.12, 0.1); star.rotation.y = 0.35 * Math.sin((t - T.over) * 2.5);

  // --- s5 display ---
  const dk = t >= T.chip - 0.1 && t < T.s6;
  disp.visible = dk;
  sweep.rotation.z = -(t - T.chip) * 3.2;
  dots.forEach((d, i) => { const k = sm(T.dots - 0.2 + 0.07 * i, T.dots + 0.05 + 0.07 * i, t); d.scale.setScalar(k * (1 + 0.25 * Math.sin(t * 8 + i))); d.visible = k > 0.01; });
  fpgaGlow.material.color.set(GREEN).multiplyScalar(0.8 + 0.8 * Math.abs(Math.sin(t * 6)));
  const C0 = new THREE.Vector3(0, 0.12, 1.0), C1 = new THREE.Vector3(0, 0.55, 0.1);
  pulses.forEach((p, i) => { const u = ((t - T.echoes) * 1.6 + i / 3) % 1; p.visible = dk && t >= T.echoes; p.position.copy(C0).lerp(C1, u); });
  echo.set(new THREE.Vector3(DX, 0.12, 0.6), new THREE.Vector3(DX, 0.5, -0.3), dk && t >= T.echoes - 0.1 ? 0.6 : 0);

  // --- s6: 3 km vs 20 km, then boards + code ---
  const s6 = t >= T.s6 && t < T.s7, swap = sm(T.every - 0.15, T.every + 0.15, t);
  [small, big].forEach((R, i) => {
    R.visible = s6 && swap < 0.99; R.scale.setScalar((i ? 0.9 : 0.55) * (1 - swap) * sm(T.s6 - 0.05, T.s6 + 0.25, t));
    R.userData.panel.rotation.x = -0.3; R.userData.yaw.rotation.y = 1.0;
    R.setBeam(1 - swap, i ? sm(T.bigger - 0.1, T.bigger + 0.4, t) * 0.5 : 0.42 * sm(T.s6 + 0.2, T.s6 + 0.6, t));
  });
  label(t3, BX - 0.85, 1.45, 0.6, 0.55, s6 ? sm(T.s6 + 0.5, T.s6 + 0.7, t) * (1 - swap) : 0);
  label(t20, BX + 0.6, 2.25, 1.2, 0.6, s6 ? sm(T.bigger + 0.3, T.bigger + 0.5, t) * (1 - swap) : 0);
  boards.forEach((b, i) => {
    const k = sm(T.every - 0.05 + 0.12 * i, T.every + 0.25 + 0.12 * i, t);
    b.visible = s6 && k > 0.01; b.scale.setScalar(k);
    b.position.set(BX - 0.45 + 0.05 * i, 1.7 - 0.28 * i, 0.3 + 0.12 * i); b.rotation.set(-0.1, 0.25, 0.08 - 0.08 * i);
  });
  const ck = sm(g("s6", "code") - 0.1, g("s6", "code") + 0.2, t);
  code.visible = s6 && ck > 0.01; code.scale.setScalar(ck); code.position.set(BX + 0.55, 1.15, 0.8); code.rotation.set(-0.1, -0.3, -0.04);

  const { punch } = shoot(SH, t);
  const spike = overlays(t);
  bloom.strength = Math.min(1.45, 1.0 + 1.2 * punch * punch + spike);
});
