// NEVER JUGGLE TRACKER TABS (God's Eye View). Laptop on a dark desk; wrong = a carousel of red tracker tabs with
// three different maps, right = one live 3D globe with planes, ships, satellites, quakes; click a flight, cockpit, night vision.
import { THREE, S, g, sm, scene, camera, bloom, glow, box, tube, VIOLET, ORANGE, RED, GREEN, WHITE, shoot, run } from "./kit.js";
import { title, cap, boom, endCard, overlays, fitText } from "./extra.js";
import { RoundedBoxGeometry } from "three/addons/geometries/RoundedBoxGeometry.js";

const std = (c, e, r = 0.45, m = 0.25) => new THREE.MeshStandardMaterial({ color: c, emissive: e, roughness: r, metalness: m });
const rbox = (w, h, d, r, mat) => new THREE.Mesh(new RoundedBoxGeometry(w, h, d, 4, r), mat);
const mBody = std(0x4a42c8, 0x1c1766, 0.35, 0.35), mDark = std(0x14123a, 0x07061a, 0.6, 0.2), mLav = std(0xc9c0ff, 0x4a3fb0, 0.4, 0.1);
const root = new THREE.Group(); scene.add(root);
const add = (...o) => (root.add(...o), o[0]);
let seed = 7; const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
const canvasTex = (w, h, draw) => { const c = document.createElement("canvas"); c.width = w; c.height = h; draw(c.getContext("2d"), w, h); const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t; };
const wText = (txt, hex, w) => { const m = fitText([txt], hex, 1.0, w); m.visible = true; m.material.depthTest = true; m.renderOrder = 0; return m; }; // world text hidden behind props

// ---------- desk + laptop (as filee) ----------
add(rbox(9, 0.3, 5, 0.12, std(0x221d66, 0x0c0a30, 0.7, 0.1))).position.set(0, -0.14, -0.6);
const pl = new THREE.PointLight(0xe8e2ff, 18, 9, 1.6); pl.position.set(-1.6, 3.2, 2.2); add(pl);
const rim = new THREE.PointLight(0xff8a3a, 10, 8, 1.6); rim.position.set(2.6, 2.2, -2.4); add(rim);
const front = new THREE.PointLight(0xd8d0ff, 10, 10, 1.4); front.position.set(0.5, 2.6, 3.4); add(front);
add(rbox(2.6, 0.1, 1.7, 0.04, mBody)).position.set(0, 0.05, 0);
add(rbox(2.2, 0.02, 0.8, 0.01, mDark)).position.set(0, 0.105, -0.2);
add(rbox(0.8, 0.02, 0.45, 0.01, mDark)).position.set(0, 0.105, 0.5);
const lid = new THREE.Group(); lid.position.set(0, 0.1, -0.85); lid.rotation.x = -0.12; add(lid);
lid.add(rbox(2.6, 1.7, 0.06, 0.04, mBody)); lid.children[0].position.set(0, 0.85, 0);
const mScreen = new THREE.MeshBasicMaterial({ color: 0x0b0a26, toneMapped: false });
const face = new THREE.Mesh(new THREE.PlaneGeometry(2.4, 1.5), mScreen); face.position.set(0, 0.85, 0.035); lid.add(face);
const bar = new THREE.Mesh(new THREE.PlaneGeometry(2.4, 0.12), glow(VIOLET, 0.35)); bar.position.set(0, 1.54, 0.037); lid.add(bar);
const accent = new THREE.Mesh(new THREE.PlaneGeometry(2.4, 0.015), glow(VIOLET, 1.6)); accent.position.set(0, 1.475, 0.038); lid.add(accent);
[-1.08, -0.98, -0.88].forEach((x, i) => { const d = new THREE.Mesh(new THREE.CircleGeometry(0.025, 16), glow([RED, ORANGE, GREEN][i], 1.2)); d.position.set(x, 1.54, 0.039); lid.add(d); });

// ---------- airplane: nose along +z ----------
function makePlane(mat = mLav, light = RED) {
  const p = new THREE.Group();
  const fus = new THREE.Mesh(new THREE.CapsuleGeometry(0.055, 0.42, 4, 12), mat); fus.rotation.x = Math.PI / 2; p.add(fus);
  p.add(box(0.62, 0.018, 0.13, 0, -0.01, 0.02, mat, false));
  p.add(box(0.24, 0.014, 0.07, 0, 0.0, -0.22, mat, false));
  p.add(box(0.014, 0.12, 0.09, 0, 0.07, -0.22, mat, false));
  const lt = new THREE.Mesh(new THREE.SphereGeometry(0.022, 8, 6), glow(light, 2.2)); lt.position.set(0, 0.06, 0); p.add(lt);
  return p;
}

// ---------- s1: the plane flying over you ----------
const intro = add(makePlane(mBody, RED)); intro.scale.setScalar(1.5);

// ---------- s1-s2: tracker tabs (three windows, three different maps) ----------
const MAPS = [
  canvasTex(512, 256, (x, w, h) => { // flight tracker: blue grid map, white plane glyphs
    x.fillStyle = "#0d1a4a"; x.fillRect(0, 0, w, h); x.strokeStyle = "#2a4aa8"; x.lineWidth = 2;
    for (let i = 0; i <= w; i += 32) { x.beginPath(); x.moveTo(i, 0); x.lineTo(i, h); x.stroke(); }
    for (let i = 0; i <= h; i += 32) { x.beginPath(); x.moveTo(0, i); x.lineTo(w, i); x.stroke(); }
    x.fillStyle = "#3a4f8a"; [[110, 90, 80, 50], [300, 70, 90, 45], [380, 170, 60, 40], [150, 180, 45, 35]].forEach(([a, b, c, d]) => { x.beginPath(); x.ellipse(a, b, c, d, 0.3, 0, 7); x.fill(); });
    x.fillStyle = "#ffffff"; [[90, 60], [200, 120], [330, 90], [420, 200], [260, 200], [160, 150]].forEach(([a, b], i) => { x.save(); x.translate(a, b); x.rotate(i); x.beginPath(); x.moveTo(0, -14); x.lineTo(10, 12); x.lineTo(0, 6); x.lineTo(-10, 12); x.fill(); x.restore(); });
  }),
  canvasTex(512, 256, (x, w, h) => { // ship tracker: teal sea chart, coastline, dashed routes, orange boats
    x.fillStyle = "#06302c"; x.fillRect(0, 0, w, h); x.fillStyle = "#1f5a4a";
    x.beginPath(); x.moveTo(0, 0); x.lineTo(180, 0); x.bezierCurveTo(140, 80, 200, 120, 120, 256); x.lineTo(0, 256); x.fill();
    x.strokeStyle = "#5fd0b0"; x.setLineDash([10, 10]); x.lineWidth = 3;
    x.beginPath(); x.moveTo(200, 230); x.bezierCurveTo(300, 150, 380, 140, 500, 60); x.stroke(); x.beginPath(); x.moveTo(230, 30); x.lineTo(480, 220); x.stroke();
    x.setLineDash([]); x.fillStyle = "#ff8a3a"; [[260, 180], [350, 135], [440, 90], [300, 75], [420, 180]].forEach(([a, b]) => { x.beginPath(); x.moveTo(a - 16, b); x.lineTo(a + 16, b); x.lineTo(a + 10, b + 9); x.lineTo(a - 10, b + 9); x.fill(); x.fillRect(a - 4, b - 10, 8, 10); });
  }),
  canvasTex(512, 256, (x, w, h) => { // quake tracker: brown relief map, orange rings
    x.fillStyle = "#2a1408"; x.fillRect(0, 0, w, h); x.fillStyle = "#5a3418";
    [[140, 110, 120, 70], [380, 140, 110, 80]].forEach(([a, b, c, d]) => { x.beginPath(); x.ellipse(a, b, c, d, -0.2, 0, 7); x.fill(); });
    x.strokeStyle = "#7a4a22"; x.lineWidth = 2; for (let r = 20; r < 70; r += 16) { x.beginPath(); x.ellipse(140, 110, r * 1.6, r, -0.2, 0, 7); x.stroke(); }
    x.strokeStyle = "#ffb040"; x.lineWidth = 4; [[120, 100], [390, 150], [300, 60]].forEach(([a, b]) => { for (let r = 8; r < 40; r += 12) { x.beginPath(); x.arc(a, b, r, 0, 7); x.stroke(); } });
  }),
];
const NAMES = ["PLANES", "SHIPS", "QUAKES"];
const tabs = NAMES.map((n, i) => {
  const t = new THREE.Group();
  t.add(rbox(1.0, 0.7, 0.05, 0.03, mDark));
  const b = new THREE.Mesh(new THREE.PlaneGeometry(0.96, 0.15), glow(RED, 0.55)); b.position.set(0, 0.26, 0.027); t.add(b);
  const tx = wText(n, WHITE, 0.9); tx.position.set(0, 0.26, 0.03); tx.scale.setScalar(0.42); t.add(tx);
  const map = new THREE.Mesh(new THREE.PlaneGeometry(0.92, 0.46), new THREE.MeshBasicMaterial({ map: MAPS[i], color: 0xd0d0d0, toneMapped: false })); map.position.set(0, -0.07, 0.027); t.add(map);
  t.visible = false; return add(t);
});
// "not equal" signs between the tabs in the row
const neq = [-1, 1].map((s) => { const n = new THREE.Group(), m = glow(RED, 2.0); n.add(box(0.22, 0.035, 0.02, 0, 0.05, 0, m, false), box(0.22, 0.035, 0.02, 0, -0.05, 0, m, false)); const sl = box(0.035, 0.3, 0.02, 0, 0, 0, m, false); sl.rotation.z = -0.5; n.add(sl); n.userData.s = s; return add(n); });

// ---------- the globe ----------
const LAND = [[0.2, 0.3, 0.11, 0.12], [0.29, 0.66, 0.06, 0.13], [0.5, 0.25, 0.05, 0.06], [0.53, 0.55, 0.07, 0.15], [0.7, 0.28, 0.14, 0.1], [0.75, 0.45, 0.05, 0.06], [0.86, 0.7, 0.05, 0.05], [0.37, 0.12, 0.05, 0.05]];
const earthTex = canvasTex(1024, 512, (x, w, h) => {
  x.fillStyle = "#14106a"; x.fillRect(0, 0, w, h);
  x.fillStyle = "#3a8a6a";
  LAND.forEach(([u, v, a, b]) => { for (let k = 0; k < 14; k++) { x.beginPath(); x.ellipse((u + (rnd() - 0.5) * a * 1.4) * w, (v + (rnd() - 0.5) * b * 1.4) * h, a * w * (0.3 + 0.4 * rnd()), b * h * (0.3 + 0.4 * rnd()), rnd() * 3, 0, 7); x.fill(); } });
  x.strokeStyle = "rgba(170,150,255,0.35)"; x.lineWidth = 2;
  for (let i = 1; i < 12; i++) { x.beginPath(); x.moveTo((i * w) / 12, 0); x.lineTo((i * w) / 12, h); x.stroke(); }
  for (let i = 1; i < 6; i++) { x.beginPath(); x.moveTo(0, (i * h) / 6); x.lineTo(w, (i * h) / 6); x.stroke(); }
  x.fillStyle = "#ffe8a0"; for (let i = 0; i < 160; i++) { const [u, v, a, b] = LAND[i % LAND.length]; x.fillRect((u + (rnd() - 0.5) * a) * w, (v + (rnd() - 0.5) * b) * h, 2, 2); } // city lights
});
const mEarth = new THREE.MeshStandardMaterial({ map: earthTex, emissiveMap: earthTex, emissive: 0x5a50c0, roughness: 0.8, metalness: 0 });
const earth = add(new THREE.Group());
earth.add(new THREE.Mesh(new THREE.SphereGeometry(1, 64, 40), mEarth));
const atmo = new THREE.Mesh(new THREE.SphereGeometry(1.07, 48, 32), new THREE.MeshBasicMaterial({ color: new THREE.Color(VIOLET).multiplyScalar(0.5), transparent: true, opacity: 0.35, side: THREE.BackSide, blending: THREE.AdditiveBlending, depthWrite: false, toneMapped: false }));
earth.add(atmo);
const onEarth = (u, v, r = 1) => { const ph = u * Math.PI * 2, th = v * Math.PI; return new THREE.Vector3(-Math.cos(ph) * Math.sin(th), Math.cos(th), Math.sin(ph) * Math.sin(th)).multiplyScalar(r); };
const UP = new THREE.Vector3(0, 1, 0);
function stick(obj, u, v, r, spin = 0) { const p = onEarth(u, v, r); obj.position.copy(p); obj.quaternion.setFromUnitVectors(UP, p.clone().normalize()); obj.rotateY(spin); earth.add(obj); return obj; }
// ships on the oceans (green hull + white cabin)
const mShip = glow(GREEN, 1.3), mCab = glow(WHITE, 1.0);
const ships = [[0.1, 0.45], [0.4, 0.4], [0.62, 0.62], [0.95, 0.5], [0.42, 0.6], [0.15, 0.6], [0.8, 0.58]].map(([u, v], i) => {
  const s = new THREE.Group(); s.add(box(0.11, 0.025, 0.04, 0, 0.012, 0, mShip, false), box(0.03, 0.03, 0.03, -0.02, 0.035, 0, mCab, false));
  s.visible = false; return stick(s, u, v, 1.0, i);
});
// quake rings on land
const quakes = [[0.21, 0.3], [0.7, 0.3], [0.53, 0.52], [0.29, 0.62]].map(([u, v]) => {
  const q = new THREE.Group(); [0.05, 0.09].forEach((r) => { const m = new THREE.Mesh(new THREE.RingGeometry(r, r + 0.014, 32), glow(ORANGE, 2.0)); m.rotation.x = -Math.PI / 2; q.add(m); });
  q.visible = false; return stick(q, u, v, 1.005);
});
// planes flying great circles: P(th) = C + gs*R*(cos(th)*a + sin(th)*b)
const C = new THREE.Vector3(0, 1.75, -0.2), SMALL = new THREE.Vector3(0, 0.95, -0.3);
const RP = 1.07;
const routes = [];
const F = new THREE.Vector3(0, 0, 1), V = new THREE.Vector3(1, 0.25, 0).normalize();
routes.push({ a: F.clone(), b: V.clone(), th0: 0, w: 0.12 }); // plane 0: the one we click, at the front at T.click
for (let i = 1; i < 8; i++) {
  const a = new THREE.Vector3(rnd() - 0.5, rnd() - 0.5, rnd() - 0.5).normalize(), b = new THREE.Vector3(rnd() - 0.5, rnd() - 0.5, rnd() - 0.5);
  b.sub(a.clone().multiplyScalar(b.dot(a))).normalize();
  routes.push({ a, b, th0: rnd() * 6.28, w: 0.25 + 0.15 * rnd() });
}
const mPl = mLav;
const planes = routes.map(() => add(makePlane(mPl, GREEN)));
// satellites: box body + violet solar panels
const sats = [[0.5, 0.9, 0.18], [2.0, 0.5, 0.15], [4.0, 1.25, 0.2]].map(([ph, inc, w]) => {
  const s = new THREE.Group(); s.add(box(0.07, 0.07, 0.09, 0, 0, 0, mLav, false));
  [-1, 1].forEach((k) => s.add(box(0.15, 0.005, 0.06, k * 0.12, 0, 0, glow(VIOLET, 1.6), false)));
  s.userData = { ph, inc, w }; s.visible = false; return add(s);
});
// lock ring + click ring + trail for plane 0
const lockRing = add(new THREE.Mesh(new THREE.TorusGeometry(0.12, 0.007, 6, 48), glow(GREEN, 1.6)));
const clickRing = add(new THREE.Mesh(new THREE.TorusGeometry(0.1, 0.01, 6, 40), glow(WHITE, 2.0)));
const pathPt = (r, th, out = new THREE.Vector3()) => out.copy(r.a).multiplyScalar(Math.cos(th)).addScaledVector(r.b, Math.sin(th));
class Arc extends THREE.Curve { getPoint(u, o = new THREE.Vector3()) { return pathPt(routes[0], -Math.PI + u * Math.PI * 2, o).multiplyScalar(RP).add(C); } }
const NSEG = 480, trail = add(new THREE.Mesh(new THREE.TubeGeometry(new Arc(), NSEG, 0.012, 6, false), glow(GREEN, 2.0)));
const cursor = add(new THREE.Mesh(new THREE.ConeGeometry(0.05, 0.15, 3), glow(WHITE, 1.4))); cursor.rotation.z = 0.5;

// ---------- s3: GitHub star (as filee) ----------
const starShape = new THREE.Shape();
for (let i = 0; i < 10; i++) { const a = Math.PI / 2 + (i * Math.PI) / 5, r = i % 2 ? 0.17 : 0.4; starShape[i ? "lineTo" : "moveTo"](Math.cos(a) * r, Math.sin(a) * r); }
const star = add(new THREE.Mesh(new THREE.ExtrudeGeometry(starShape, { depth: 0.08, bevelEnabled: true, bevelSize: 0.03, bevelThickness: 0.03, bevelSegments: 2 }), glow(ORANGE, 1.5)));

// ---------- s5: cockpit over terrain, far from the desk ----------
const X0 = 200;
const ground = new THREE.Group(); scene.add(ground); ground.position.set(X0, 0, 0);
const terrTex = canvasTex(1024, 1024, (x, w, h) => {
  const cols = ["#1d4a3a", "#26593f", "#2c3a78", "#1f6a48", "#34306a", "#2a5030"];
  for (let i = 0; i < w; i += 64) for (let j = 0; j < h; j += 64) { x.fillStyle = cols[Math.floor(rnd() * cols.length)]; x.fillRect(i, j, 64, 64); }
  x.strokeStyle = "#4a3fd0"; x.lineWidth = 16; x.beginPath(); x.moveTo(300, 0); x.bezierCurveTo(500, 300, 200, 600, 420, 1024); x.stroke(); // river
  x.strokeStyle = "#c9c0ff"; x.lineWidth = 5; [256, 640].forEach((p) => { x.beginPath(); x.moveTo(p, 0); x.lineTo(p, h); x.stroke(); x.beginPath(); x.moveTo(0, p); x.lineTo(w, p); x.stroke(); });
});
terrTex.wrapS = terrTex.wrapT = THREE.RepeatWrapping; terrTex.repeat.set(3, 3);
const terr = new THREE.Mesh(new THREE.PlaneGeometry(120, 120), new THREE.MeshBasicMaterial({ map: terrTex, color: 0xa0a0a0 })); terr.rotation.x = -Math.PI / 2; terr.position.set(0, 0.03, -30); ground.add(terr);
const mBld = new THREE.MeshBasicMaterial({ color: 0x241e70 });
for (let i = 0; i < 90; i++) { const hgt = 0.3 + rnd() * 1.4; ground.add(box(0.5 + rnd() * 0.6, hgt, 0.5 + rnd() * 0.6, (rnd() - 0.5) * 30, hgt / 2, 8 - rnd() * 70, mBld)); }
ground.visible = false;
// frame drawn in units of the half-height of the view at d = 0.3 (x spans +-0.5625)
const cockpit = new THREE.Group(); camera.add(cockpit); cockpit.visible = false;
const mCk = new THREE.MeshBasicMaterial({ color: 0x15123e }), mCkE = glow(VIOLET, 1.3);
cockpit.add(box(1.4, 0.16, 0.05, 0, 0.94, 0, mCk, false), box(1.4, 0.015, 0.05, 0, 0.86, 0.01, mCkE, false));
[-1, 1].forEach((s) => { cockpit.add(tube([s * 0.6, -0.75, 0], [s * 0.42, 0.9, 0], 0.08, mCk), tube([s * 0.55, -0.75, 0.01], [s * 0.37, 0.9, 0.01], 0.012, mCkE)); });
cockpit.add(box(1.4, 0.3, 0.05, 0, -0.9, 0, mCk, false), box(1.4, 0.015, 0.05, 0, -0.75, 0.01, mCkE, false));
[-0.36, -0.12, 0.12, 0.36].forEach((x, i) => { const gd = new THREE.Mesh(new THREE.RingGeometry(0.05, 0.065, 24), glow(i % 2 ? GREEN : VIOLET, 1.6)); gd.position.set(x, -0.88, 0.03); cockpit.add(gd); });

// ---------- s6: no account, no keys ----------
const mX = glow(RED, 2.2);
const keyG = add(new THREE.Group());
keyG.add(new THREE.Mesh(new THREE.TorusGeometry(0.1, 0.035, 10, 28), glow(VIOLET, 1.4)), box(0.3, 0.05, 0.04, 0.24, 0, 0, glow(VIOLET, 1.4), false), box(0.04, 0.08, 0.04, 0.32, -0.05, 0, glow(VIOLET, 1.4), false), box(0.04, 0.06, 0.04, 0.24, -0.04, 0, glow(VIOLET, 1.4), false));
const card = add(new THREE.Group());
card.add(rbox(0.46, 0.34, 0.04, 0.03, mLav));
const head = new THREE.Mesh(new THREE.CircleGeometry(0.055, 20), glow(VIOLET, 1.0)); head.position.set(-0.12, 0.04, 0.025); card.add(head);
const bust = new THREE.Mesh(new THREE.CircleGeometry(0.08, 20, 0, Math.PI), glow(VIOLET, 1.0)); bust.position.set(-0.12, -0.1, 0.025); card.add(bust);
[0.06, -0.02, -0.1].forEach((y) => card.add(box(0.16, 0.025, 0.005, 0.09, y, 0.025, new THREE.MeshBasicMaterial({ color: 0x6a5fd0 }), false)));
[keyG, card].forEach((o) => { o.add(tube([-0.28, -0.22, 0.06], [0.28, 0.22, 0.06], 0.045, mX)); o.visible = false; });

// ---------- captions ----------
title("NEVER JUGGLE TRACKER TABS");
cap("s1", "exploring", ["EXPLORING GITHUB REPOS"], WHITE, { until: "s1" });
cap("s2", "one", ["ONE TAB EACH"], RED, { until: ["s2", "none"] });
cap("s2", "none", ["NONE SHOW", "THE SAME MAP"], RED, { boom: 0.5 });
cap("s3", "god's", ["GOD'S EYE VIEW"], GREEN, { until: ["s3", "almost"], boom: 0.5 });
cap("s3", "almost", ["ALMOST 65,000 STARS", "IN UNDER 5 MONTHS"], ORANGE, { until: ["s3", "puts"], boom: 0.5 });
cap("s3", "planes", ["LIVE PLANES"], GREEN, { until: ["s3", "ships"] });
cap("s3", "ships", ["SHIPS"], GREEN, { until: ["s3", "satellites"] });
cap("s3", "satellites", ["SATELLITES"], VIOLET, { until: ["s3", "earthquakes"] });
cap("s3", "earthquakes", ["EARTHQUAKES"], ORANGE, { until: ["s3", "one"] });
cap("s3", "one", ["ONE 3D GLOBE"], GREEN, { boom: 0.4 });
cap("s4", "click", ["CLICK ANY FLIGHT"], VIOLET, { until: ["s4", "locks"] });
cap("s4", "locks", ["LOCKED ON"], GREEN, { until: ["s4", "draws"] });
cap("s4", "draws", ["LIVE TRAIL"], GREEN);
cap("s5", "ride", ["RIDE IN THE COCKPIT"], VIOLET, { until: ["s5", "ground"] });
cap("s5", "ground", ["GROUND RIGHT UNDER YOU"], GREEN);
cap("s6", "night", ["NIGHT VISION"], GREEN, { until: ["s6", "thermal"], boom: 0.4 });
cap("s6", "thermal", ["THERMAL"], ORANGE, { until: ["s6", "no"], boom: 0.4 });
cap("s6", "no", ["NO ACCOUNT, NO KEYS"], GREEN);
endCard(["DON'T JUGGLE TABS.", "WATCH ONE GLOBE."]);

// ---------- timings (global seconds) ----------
const T = {
  juggle: g("s1", "juggle"), s2: S.s2[0], tP: g("s2", "planes"), tS: g("s2", "ships"), tQ: g("s2", "earthquakes"), none: g("s2", "none"),
  s3: S.s3[0], almost: g("s3", "almost"), puts: g("s3", "puts"), planes: g("s3", "planes"), ships: g("s3", "ships"), sats: g("s3", "satellites"), quakes: g("s3", "earthquakes"),
  s4: S.s4[0], click: g("s4", "click"), locks: g("s4", "locks"), draws: g("s4", "draws"),
  s5: S.s5[0], s6: S.s6[0], night: g("s6", "night"), thermal: g("s6", "thermal"), no: g("s6", "no"), s7: S.s7[0], s8: S.s8[0],
};
T.lockAt = T.click + 0.35; // plane 0 reaches the front of the globe here
routes[0].th0 = -routes[0].w * T.lockAt;
const v = new THREE.Vector3(), v2 = new THREE.Vector3(), n = new THREE.Vector3();
const thOf = (i, t) => routes[i].th0 + routes[i].w * t;
const P0 = (t, out) => pathPt(routes[0], thOf(0, t), out).multiplyScalar(RP).add(C); // plane 0 world pos (globe full size, at C)

// ---------- shots: [cx,cy,cz, lx,ly,lz, fov] ----------
const WIDE = [0.2, 1.9, 5.6, 0, 1.55, -0.4, 48];
const SH = [
  { at: 0, K: [[0, [0.3, 1.9, 5.8, 0, 1.25, -0.4, 48]], [S.s2[0], [0.1, 1.9, 5.4, 0, 1.35, -0.3, 48]]] },
  { at: T.s2, K: [[0, [-0.4, 1.9, 5.2, 0, 1.45, 0, 48]], [T.none - T.s2, [0.0, 1.9, 5.0, 0, 1.5, 0, 48]], [4.6, [0.1, 1.9, 5.4, 0, 1.55, 0, 48]]] },
  { at: T.s3, K: [[0, [-0.4, 1.8, 5.4, 0, 1.25, -0.5, 48]], [T.puts - T.s3, [0.1, 1.7, 5.0, 0, 1.25, -0.5, 48]], [T.puts - T.s3 + 0.8, WIDE], [10, [0.4, 2.0, 5.8, 0, 1.6, -0.4, 48]]] },
  { at: T.s4, cam: (t) => {
    const k = sm(T.click + 0.2, T.locks + 0.5, t), p = P0(t, v);
    n.copy(p).sub(C).normalize();
    const near = v2.copy(p).addScaledVector(n, 3.3).add(new THREE.Vector3(-0.3, 0.3, 0));
    const cp = new THREE.Vector3(0.2, 1.9, 5.4).lerp(near, k), lp = C.clone().lerp(v2.copy(p).add(new THREE.Vector3(0, -0.35, 0)), k);
    return [cp.x, cp.y, cp.z, lp.x, lp.y, lp.z, 48 - 6 * k];
  } },
  { at: T.s5, calm: 1, K: [[0, [X0, 2.4, 8, X0, 1.5, 2, 48]], [4, [X0 + 0.6, 2.2, -6, X0 + 0.8, 1.3, -12, 48]]] },
  { at: T.s6, K: [[0, [0.3, 1.9, 5.4, 0, 1.6, -0.3, 48]], [T.no - T.s6, [0.0, 1.9, 5.6, 0, 1.55, -0.3, 48]], [5, [-0.2, 1.9, 5.8, 0, 1.5, -0.3, 48]]] },
  { at: T.s7, calm: 1, K: [[0, [-0.2, 1.9, 5.8, 0, 1.5, -0.3, 48]], [4, [0.2, 2.0, 6.4, 0, 1.5, -0.3, 48]]] },
];

const cN = new THREE.Color(), cE = new THREE.Color();
const MODES = { base: [0xffffff, 0x5a50c0], nvg: [0x60ff90, 0x1f9a44], hot: [0xffb060, 0xc04010] };
run("gods-eye-world", (t) => {
  const wrong = t < T.s3, cock = t >= T.s5 && t < T.s6;
  root.visible = t < T.s8 - 0.1 && !cock;
  ground.visible = cock; cockpit.visible = cock;
  accent.material.color.set(wrong ? (t >= T.juggle ? RED : VIOLET) : GREEN).multiplyScalar(1.6);
  mScreen.color.set(wrong ? 0x0b0a26 : 0x0a1a1a);

  // s1: a plane flies over the laptop
  const fk = sm(0, T.juggle + 0.2, t);
  intro.visible = t < T.juggle + 0.25;
  intro.position.set(-1.3 + 2.6 * fk, 1.15 + 0.15 * fk, 1.6); intro.rotation.set(0, Math.PI / 2, 0); intro.rotateZ(-0.7); intro.rotateX(0.15);

  // tabs: carousel spins while juggling, stops on each named tracker, then lines up in a row
  const rot = -4 * Math.PI * sm(T.juggle, T.tP - 0.05, t) - (2 * Math.PI / 3) * (sm(T.tS - 0.25, T.tS + 0.1, t) + sm(T.tQ - 0.25, T.tQ + 0.1, t));
  const row = sm(T.none - 0.25, T.none + 0.3, t), out = sm(T.s3 - 0.05, T.s3 + 0.25, t);
  tabs.forEach((tb, i) => {
    const pop = sm(T.juggle - 0.1 + 0.08 * i, T.juggle + 0.25 + 0.08 * i, t);
    tb.visible = pop > 0.01 && out < 0.99;
    let a = rot + (i * 2 * Math.PI) / 3; a = Math.atan2(Math.sin(a), Math.cos(a));
    const cx = Math.sin(a) * 0.75, cz = 0.2 + Math.cos(a) * 0.75, rx = (i - 1) * 0.74, rz = 0.5;
    tb.position.set(cx + (rx - cx) * row, 1.6 + (1.55 - 1.6) * row - 0.7 * out, cz + (rz - cz) * row);
    tb.rotation.y = a * (1 - row);
    tb.scale.setScalar(pop * (1 - 0.5 * row) * (1 - out));
  });
  neq.forEach((q) => { const k = sm(T.none + 0.1, T.none + 0.35, t) * (1 - out); q.visible = k > 0.01; q.position.set(q.userData.s * 0.37, 1.55, 0.55); q.scale.setScalar(k * 0.6); });

  // globe: small on the laptop screen from "Instead", up to full size from "puts"; in s6 it lifts to make room
  const gin = sm(T.s3 - 0.05, T.s3 + 0.35, t), grow = sm(T.puts - 0.1, T.puts + 0.6, t), lift = sm(T.no - 0.15, T.no + 0.35, t) * (1 - sm(T.s7 - 0.1, T.s7 + 0.4, t));
  const gs = (0.38 + 0.62 * grow) * gin * (1 - 0.25 * lift) * (1 - 0.35 * sm(T.s7 - 0.1, T.s7 + 0.4, t));
  const Cg = v.copy(SMALL).lerp(C, grow); const fin = sm(T.s7 - 0.1, T.s7 + 0.4, t); Cg.y += 0.3 * lift - 0.35 * fin;
  earth.visible = gin > 0.01; earth.position.copy(Cg); earth.scale.setScalar(Math.max(gs, 1e-3)); earth.rotation.y = 0.09 * t;
  // night vision / thermal skins
  const kn = sm(T.night - 0.1, T.night + 0.2, t), kh = sm(T.thermal - 0.1, T.thermal + 0.2, t), kb = sm(T.no - 0.1, T.no + 0.3, t);
  cN.set(MODES.base[0]).lerp(new THREE.Color(MODES.nvg[0]), kn * (1 - kh)).lerp(new THREE.Color(MODES.hot[0]), kh); cN.lerp(new THREE.Color(MODES.base[0]), kb);
  cE.set(MODES.base[1]).lerp(new THREE.Color(MODES.nvg[1]), kn * (1 - kh)).lerp(new THREE.Color(MODES.hot[1]), kh); cE.lerp(new THREE.Color(MODES.base[1]), kb);
  mEarth.color.copy(cN); mEarth.emissive.copy(cE);
  atmo.material.color.set(kh * (1 - kb) > 0.5 ? ORANGE : kn * (1 - kb) > 0.5 ? GREEN : VIOLET).multiplyScalar(0.5);

  ships.forEach((s, i) => { const k = sm(T.ships + 0.05 * i, T.ships + 0.3 + 0.05 * i, t); s.visible = k > 0.01; s.scale.setScalar(k); });
  quakes.forEach((q, i) => { const k = sm(T.quakes + 0.08 * i, T.quakes + 0.3 + 0.08 * i, t); q.visible = k > 0.01; q.scale.setScalar(k * (1 + 0.5 * ((t * 1.3 + i * 0.3) % 1))); });
  planes.forEach((p, i) => {
    const k = sm(T.planes + 0.05 * i, T.planes + 0.3 + 0.05 * i, t);
    p.visible = k > 0.01 && earth.visible;
    const th = thOf(i, t), r = routes[i];
    n.copy(pathPt(r, th, v2)); const tang = new THREE.Vector3().copy(r.a).multiplyScalar(-Math.sin(th)).addScaledVector(r.b, Math.cos(th));
    p.position.copy(Cg).addScaledVector(n, RP * gs); p.up.copy(n); p.lookAt(v2.copy(p.position).add(tang));
    p.scale.setScalar(0.24 * gs * k * (i === 0 ? 1 + 0.3 * sm(T.click, T.locks, t) : 1));
  });
  sats.forEach((s) => {
    const k = sm(T.sats, T.sats + 0.3, t); s.visible = k > 0.01 && earth.visible;
    const { ph, inc, w } = s.userData, a = ph + t * w * 2, r = 1.28 * gs;
    s.position.set(Math.cos(a) * r, Math.sin(a) * Math.sin(inc) * r * 0.55, Math.sin(a) * Math.cos(inc) * r).add(Cg); s.rotation.y = a; s.scale.setScalar(gs * k);
  });

  // s4: cursor clicks plane 0, ring locks on, trail grows behind it
  const p0 = planes[0].position;
  const cIn = sm(T.click - 0.3, T.click, t), cOut = sm(T.locks, T.locks + 0.3, t);
  cursor.visible = cIn > 0.01 && cOut < 0.99;
  cursor.position.copy(p0).add(v2.set(0.5 * (1 - sm(T.click, T.click + 0.3, t)) + 0.06, -0.4 * (1 - sm(T.click, T.click + 0.3, t)) - 0.06, 0.2));
  cursor.scale.setScalar(1 - cOut);
  const ck = sm(T.click + 0.25, T.click + 0.6, t); clickRing.visible = ck > 0.01 && ck < 0.99;
  clickRing.position.copy(p0); clickRing.lookAt(camera.position); clickRing.scale.setScalar(0.5 + 1.5 * ck); clickRing.material.color.set(WHITE).multiplyScalar(2 * (1 - ck));
  const lk = sm(T.locks - 0.1, T.locks + 0.2, t) * (1 - sm(T.s6 - 0.1, T.s6 + 0.1, t));
  lockRing.visible = lk > 0.01; lockRing.position.copy(p0); lockRing.lookAt(camera.position); lockRing.scale.setScalar(lk * (1 + 0.06 * Math.sin(t * 8)));
  const L = 1.0 * sm(T.draws - 0.1, T.draws + 0.9, t) * (1 - sm(T.s6 - 0.1, T.s6 + 0.1, t)), th0 = thOf(0, t);
  const seg = (th) => Math.round(((th + Math.PI) / (Math.PI * 2)) * NSEG);
  const s0 = seg(th0 - L), s1 = seg(th0 - 0.05);
  trail.visible = L > 0.02 && s1 > s0; trail.geometry.setDrawRange(s0 * 36, (s1 - s0) * 36);

  // s3 star
  const sk = sm(T.almost - 0.1, T.almost + 0.25, t) * (1 - sm(T.puts - 0.2, T.puts + 0.05, t));
  star.visible = sk > 0.01; star.scale.setScalar(0.5 * sk * (1 + 0.08 * Math.sin(t * 6)));
  star.position.set(0, 2.2, -0.2); star.rotation.y = 0.35 * Math.sin((t - T.almost) * 2.5);

  // s6 key + account card, crossed out
  const kk = sm(T.no - 0.05, T.no + 0.3, t) * (1 - sm(T.s7 - 0.15, T.s7 + 0.1, t));
  keyG.visible = card.visible = kk > 0.01;
  keyG.position.set(-0.62, 0.85, 0.7); keyG.scale.setScalar(kk * 1.1); keyG.rotation.y = 0.2 * Math.sin(t * 2);
  card.position.set(0.62, 0.85, 0.7); card.scale.setScalar(kk * 1.1); card.rotation.y = -0.2 * Math.sin(t * 2);

  const { punch } = shoot(SH, t);
  if (cock) { const hh = Math.tan(THREE.MathUtils.degToRad(camera.fov / 2)) * 0.3; cockpit.position.set(0, 0, -0.3); cockpit.scale.setScalar(hh); }
  const spike = overlays(t);
  bloom.strength = Math.min(1.45, 1.0 + 1.2 * punch * punch + spike);
});
