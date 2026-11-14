// 128 gravel-corner: wrong = Red enters a blind right bend at 60, finds gravel at the edge while leaned, grabs the front
// brake, the front washes out, low-side (red). Right = Blue slows to 45 before the bend (stops within what he sees), less
// lean, line away from the edge; on gravel he stays smooth, no brakes, a bit more upright (green).
import { THREE, S, g, sm, flash, scene, camera, bloom, box, glow, beam, mSolid, VIOLET, ORANGE, RED, GREEN, WHITE, label, hud, shoot, run } from "./kit.js";
import { track, ribbon, buildRoad, makePerson, pose, endCard, cap, overlays, bikes, dist } from "./extra.js";

// ---------- props built here: dark pill labels + readout cards ----------
function canvasPlane(w, h, draw, width) {
  const c = document.createElement("canvas"); c.width = w; c.height = h; const x = c.getContext("2d");
  const tex = new THREE.CanvasTexture(c);
  const m = new THREE.Mesh(new THREE.PlaneGeometry(width, (width * h) / w), new THREE.MeshBasicMaterial({ map: tex, color: 0xd0d0d0, transparent: true, toneMapped: false, depthWrite: false, depthTest: false, fog: false }));
  m.renderOrder = 22; m.userData.w = width; m.visible = false; scene.add(m);
  m.draw = (...a) => { x.clearRect(0, 0, w, h); draw(x, ...a); tex.needsUpdate = true; };
  return m;
}
const css = (hex) => "#" + new THREE.Color(hex).getHexString();
function pill(txt, hex) {
  const m = canvasPlane(1024, 200, (x) => {
    x.font = "900 96px Inter, Arial, sans-serif"; const tw = x.measureText(txt).width + 110, X = 512 - tw / 2;
    x.fillStyle = "rgba(12,10,34,0.9)"; x.beginPath(); x.roundRect(X, 20, tw, 160, 80); x.fill();
    x.strokeStyle = css(hex); x.lineWidth = 8; x.stroke();
    x.fillStyle = css(hex); x.textAlign = "center"; x.textBaseline = "middle"; x.fillText(txt, 512, 104);
  }, 2);
  m.draw(); return m;
}
function readout(name) {
  let last = "";
  const m = canvasPlane(512, 256, (x, val, hex) => {
    x.fillStyle = "rgba(12,10,34,0.88)"; x.beginPath(); x.roundRect(8, 8, 496, 240, 44); x.fill();
    x.strokeStyle = css(hex); x.lineWidth = 6; x.stroke();
    x.textAlign = "center"; x.textBaseline = "middle";
    x.fillStyle = "#b8b4d8"; x.font = "800 44px Inter, Arial, sans-serif"; x.fillText(name, 256, 62);
    x.fillStyle = css(hex); x.font = "900 112px Inter, Arial, sans-serif"; x.fillText(val, 256, 166);
  }, 1);
  m.set = (val, hex, sx, a) => { const key = val + hex; if (key !== last) { m.draw(val, hex); last = key; } hud(m, sx * 1.08, -0.36, 0.26, a); };
  return m;
}

// ---------- road: straight, then a blind right-hand bend ----------
scene.fog.density = 0.009;
const Sb = 150, R = 45, BL = 110;
const { C, P } = track([{ len: Sb }, { len: BL, R: -R }, { len: 600 }]);
buildRoad(P, -60, Sb + BL + 200);
const T2 = S.s2[0], T3 = S.s3[0], T4 = S.s4[0], T5 = S.s5[0], T6 = S.s6[0], T7 = S.s7[0];
const V = 16.7, V2 = 12.5, sG = Sb + 30, OG = 2.7; // 60 / 45 km/h, gravel patch on the inside edge
const kap = (s) => (1 / R) * sm(Sb - 2, Sb + 6, s) * (1 - sm(Sb + BL - 6, Sb + BL + 2, s));
const leanAt = (s, v) => -Math.atan((v * v * kap(s)) / 9.8);

// rock wall on the inside of the bend = blind
const mRock = new THREE.MeshStandardMaterial({ color: 0x241d5a, emissive: 0x120e33, roughness: 0.9 });
for (let s = Sb - 20, i = 0; s < Sb + BL + 10; s += 2.4, i++) {
  const [x, z] = P(s, 6.2), h = 2.8 + 1.2 * Math.abs(Math.sin(i * 1.7)), b = box(2.7, h, 1.8 + 0.6 * Math.abs(Math.sin(i * 2.3)), x, h / 2, z, mRock);
  b.rotation.y = C(s)[2];
}
// gravel: orange wash + pebbles
const hash = (i) => { const v = Math.sin(i * 127.1) * 43758.5453; return v - Math.floor(v); };
const pebbles = new THREE.InstancedMesh(new THREE.IcosahedronGeometry(0.06, 0), glow(ORANGE, 0.9), 900); scene.add(pebbles);
let NP = 0;
const dummy = new THREE.Object3D();
function gravel(s0, s1, o0, o1, n) {
  const mat = new THREE.MeshBasicMaterial({ color: new THREE.Color(ORANGE).multiplyScalar(0.28), toneMapped: false, transparent: true, opacity: 0.85 });
  ribbon(P, o0, o1, s0, s1, mat, 0.012, 0.5);
  for (let i = 0; i < n; i++, NP++) {
    const s = s0 + (s1 - s0) * hash(NP * 3 + 1), o = o0 + (o1 - o0) * hash(NP * 3 + 2) ** 0.8, [x, z] = P(s, o);
    dummy.position.set(x, 0.03, z); dummy.rotation.set(hash(NP) * 3, hash(NP + 9) * 3, 0); dummy.scale.setScalar(0.6 + hash(NP * 7) * 0.9); dummy.updateMatrix(); pebbles.setMatrixAt(NP, dummy.matrix);
  }
  pebbles.count = NP;
}
gravel(sG - 7, sG + 9, 2.1, 3.6, 380);
// dirt along both edges of the bend (lights up for "dirt collects at the edges")
const mEdgeDirt = new THREE.MeshBasicMaterial({ color: new THREE.Color(ORANGE).multiplyScalar(0.9), toneMapped: false, transparent: true, opacity: 0, depthWrite: false });
ribbon(P, 3.15, 3.6, Sb - 4, Sb + BL + 4, mEdgeDirt, 0.016, 0.5); ribbon(P, -3.6, -3.15, Sb - 4, Sb + BL + 4, mEdgeDirt, 0.016, 0.5);

// ---------- Red: event time tau (d = 0 at the grab), slow-mo in s3 ----------
const tGrab = g("s3", "grabs"), tHe = g("s3", "he"), tF0 = g("s2", "leaned") + 0.7, tS1 = g("s1", "grab");
const tau = (t) => {
  if (t < T2) return t < tS1 ? t - tS1 : 1.6 * (t - tS1);                       // s1: quick preview of the crash
  const a = tGrab - tHe, b = 0.12 * (tHe - tF0);
  if (t <= tF0) return t - tF0 - a - b;
  if (t <= tHe) return -a - b + 0.12 * (t - tF0);                               // near-freeze while "dirt collects"
  if (t <= tGrab) return t - tGrab;
  const t2 = tGrab + 3.1; return t <= t2 ? 0.45 * (t - tGrab) : 0.45 * 3.1 + (t - t2);
};
const DW = 0.75, sW = V * DW - 2.5 * DW * DW, LG = leanAt(sG, V);
const [wx, wz] = P(sG + sW, OG), hw = C(sG + sW)[2];
function red(d) {
  if (d <= 0) { const s = sG + V * d, o = 1.8 + (OG - 1.8) * sm(Sb, sG, s), [x, z] = P(s, o); return { x, z, h: C(s)[2], lean: leanAt(s, V), steer: 0, v: V, k: 0 }; }
  if (d < DW) { const s = sG + V * d - 2.5 * d * d, [x, z] = P(s, OG); return { x, z, h: C(s)[2], lean: LG, steer: 0, v: V - 5 * d, k: 0 }; }
  const e = d - DW, v0 = V - 5 * DW, te = Math.min(e, v0 / 7), slide = v0 * te - 3.5 * te * te, k = sm(0.05, 0.55, e);
  return { x: wx - Math.sin(hw) * slide, z: wz - Math.cos(hw) * slide, h: hw + 0.35 * k, lean: LG + k * (-1.45 - LG), steer: -0.45 * sm(0, 0.15, e), v: Math.max(0, v0 - 7 * e), k };
}
const fnR = (t) => { const r = red(tau(t)); return [r.x, r.z, r.h]; };

// ---------- Blue: 60 -> 45 before the bend, passes the gravel at "line" on a line away from the edge ----------
const tSlow = g("s4", "slows"), tPass = g("s5", "edge") - 0.4;
const vB = (t) => V - (V - V2) * sm(tSlow, tSlow + 1.6, t);
const DB = dist(vB, T4 - 2, 40), sB = (t) => sG + DB(t) - DB(tPass);
const oB = (t) => 1.8 - 0.7 * sm(g("s5", "moves"), g("s5", "line") + 0.4, t);
const sG2 = sB(g("s6", "brakes"));
gravel(sG2 - 4, sG2 + 4, 0.0, 3.6, 480);
const upr = (t) => 1 - 0.28 * sm(g("s6", "bike"), g("s6", "bike") + 0.5, t);
function blue(t) { const s = sB(t), [x, z] = P(s, oB(t)), v = vB(t); return { x, z, h: C(s)[2], lean: leanAt(s, v) * upr(t), steer: 0, v, s }; }
const fnB = (t) => { const b = blue(t); return [b.x, b.z, b.h]; };

// ---------- bikes ----------
const [BR, BB] = bikes(2), THROWN = makePerson();
const tint = (B, hex) => { const m = mSolid.clone(); m.color.set(hex); m.emissive.set(hex).multiplyScalar(0.3); B.g.traverse((o) => { if (o.material === mSolid) o.material = m; }); };
tint(BR, 0x8a2034); tint(BB, 0x2b3fb0);
const disc = new THREE.Mesh(new THREE.TorusGeometry(0.17, 0.035, 8, 24), glow(RED, 0)); disc.rotation.y = Math.PI / 2; disc.position.x = 0.1; BR.frontW.add(disc);

// sight line + stopping-distance strip (s4)
const sight = beam(GREEN, 2.0, 0.03);
const STRIP = Array.from({ length: 24 }, () => { const m = box(1.0, 0.03, 1.2, 0, 0.02, 0, glow(GREEN, 1), false); m.visible = false; return m; });
const sightBar = box(3.4, 0.05, 0.25, 0, 0.03, 0, glow(GREEN, 2.2), false); sightBar.visible = false;
function strip(s0, o, len, hex, a) {
  STRIP.forEach((m, i) => {
    const d = (i + 0.5) * (len / STRIP.length); m.visible = a > 0.01 && d < len; if (!m.visible) return;
    const [x, z] = P(s0 + d, o); m.position.set(x, 0.02, z); m.rotation.y = C(s0 + d)[2]; m.scale.set(1, 1, (len / STRIP.length) * 0.6);
    m.material.color.set(hex).multiplyScalar(0.9 * a);
  });
}

// labels / readouts
const pGravel = pill("LOOSE GRAVEL", ORANGE), pGravel2 = pill("GRAVEL", ORANGE), pBlind = pill("BLIND BEND", VIOLET), pSee = pill("WHAT HE CAN SEE", GREEN);
const rSpeed = readout("KM/H"), rLean = readout("LEAN");

cap("s1", "this", ["THIS CRASH TOOK", "UNDER A SECOND"], RED, { until: ["s1", "gravel"] });
cap("s1", "gravel", ["GRAVEL", "MID-CORNER"], ORANGE, { until: ["s1", "one"] });
cap("s1", "one", ["ONE GRAB OF", "THE BRAKE"], RED, { y: 0.3, boom: 0.4 });
cap("s2", "red", ["RED: 60 INTO", "A BLIND BEND"], RED, { y: 0.3, until: ["s2", "only"] });
cap("s2", "only", ["SEES THE GRAVEL", "ALREADY LEANED"], RED, { y: 0.3 });
cap("s3", "dirt", ["DIRT COLLECTS", "AT THE EDGES"], ORANGE, { until: ["s3", "he"] });
cap("s3", "grabs", ["GRABS THE", "FRONT BRAKE"], RED, { until: ["s3", "tyre"] });
cap("s3", "tyre", ["FRONT TYRE", "SLIDES OUT"], RED, { boom: 0.5 });
cap("s4", "blue", ["BLUE SLOWS", "BEFORE THE BEND"], GREEN, { until: ["s4", "stop"] });
cap("s4", "stop", ["STOP WITHIN", "THE ROAD YOU SEE"], GREEN);
cap("s5", "at", ["SLOWER =", "LESS LEAN"], GREEN, { until: ["s5", "moves"] });
cap("s5", "moves", ["LINE AWAY", "FROM THE EDGE"], GREEN);
cap("s6", "if", ["CAN'T AVOID IT?", "STAY SMOOTH"], GREEN, { until: ["s6", "no"] });
cap("s6", "no", ["NO BRAKES", "STEADY THROTTLE"], GREEN, { until: ["s6", "bike"] });
cap("s6", "bike", ["BIKE A LITTLE", "MORE UPRIGHT"], GREEN);
endCard(["SLOW BEFORE BLIND BENDS.", "ON GRAVEL, STAY SMOOTH."]);

const fol = (fn) => (t) => { const p = fn(t); return { x: p[0], z: p[1], h: p[2] }; };
const cam = (s, o, y, ls, lo, ly, f) => { const [x, z] = P(s, o), [lx, lz] = P(ls, lo); return [x, y, z, lx, ly, lz, f]; };
const tLean = g("s2", "leaned") - 0.45, tTyre = g("s3", "tyre") - 0.25, tStop = g("s4", "stop") - 0.3, tMoves = g("s5", "moves") - 0.2, tBike = g("s6", "bike") - 0.3;
const SH = [
  { at: 0, f: fol(fnR), K: [[0, [1.4, 2.4, 7.5, 0, 1.0, -20, 50]], [3.3, [2.2, 2.0, 6.5, 0, 0.8, -10, 50]], [4.5, [3.0, 2.4, 7.0, 0, 0.5, -4, 52]]] },
  { at: T2, K: [[0, cam(Sb - 75, -9, 7, Sb - 35, 1.8, 0.5, 50)], [2.6, cam(Sb - 40, -12, 10, Sb + 20, 2, 0, 52)], [3.6, cam(Sb - 32, -12, 10, Sb + 25, 2, 0, 52)]] },
  { at: tLean, f: fol(fnR), K: [[0, [-2.8, 1.1, -6.5, 0, 0.8, 0, 44]], [1.6, [-2.4, 1.0, -5.8, 0, 0.7, 0, 44]]] },
  { at: T3, K: [[0, cam(sG - 9, -1, 20, sG + 1, 1.8, 0, 50)], [2.9, cam(sG - 7, -1, 19, sG + 2, 1.8, 0, 50)]] },
  { at: tHe - 0.1, f: fol(fnR), K: [[0, [-2.4, 0.9, -2.0, 0, 0.5, -0.6, 44]], [1.6, [-2.6, 1.0, -2.2, 0, 0.5, -0.6, 44]]] },
  { at: tTyre, f: fol(fnR), K: [[0, [-4.5, 2.4, -4.0, 0, 0.3, 0, 46]], [2.3, [-5.0, 2.6, -2.5, 0, 0.3, 0, 46]]] },
  { at: T4, f: fol(fnB), K: [[0, [0, 2.2, 6.5, 0, 0.6, -20, 50]], [1.8, [0, 2.4, 6.5, 0, 0.6, -20, 50]]] },
  { at: tStop, f: fol(fnB), K: [[0, [0.3, 5.5, 7, 0, 0, -12, 50]], [1.8, [0.3, 5.8, 7.3, 0, 0, -12, 50]]] },
  { at: T5, f: fol(fnB), K: [[0, [-2.8, 1.1, -6.5, 0, 0.8, 0, 44]], [1.8, [-2.4, 1.0, -6, 0, 0.8, 0, 44]]] },
  { at: tMoves, f: fol(fnB), K: [[0, [0, 6, 7.5, 0, 0.5, -8, 50]], [1.9, [0, 6.3, 7.8, 0, 0.5, -8, 50]]] },
  { at: T6, f: fol(fnB), K: [[0, [1.2, 2.3, 6.5, 0, 0.9, -15, 48]], [3, [1.0, 2.0, 6.0, 0, 0.9, -15, 48]]] },
  { at: tBike, f: fol(fnB), K: [[0, [-0.3, 1.3, -6.5, 0, 0.9, 0, 44]], [1.6, [-0.2, 1.3, -6.0, 0, 0.9, 0, 44]]] },
  { at: T7, f: fol(fnB), K: [[0, [1.5, 3, 8, 0, 1, -20, 50]], [2.6, [2, 4.5, 10, 0, 1, -20, 50]]] },
];
const wp = (o, v = new THREE.Vector3()) => o.getWorldPosition(v);
const deg = (l) => `${Math.round(Math.abs(l) * 57.3)}°`;
const [gx, gz] = P(sG + 1, 3.0), [g2x, g2z] = P(sG2, 1.8), [bx, bz] = P(Sb + 8, 5.6);
run("w", (t) => {
  const A = t < T4, d = tau(t);
  let st;
  if (A) {
    const r = red(d); st = r;
    BR.set(r, fnR, t, { hex: t < 0.6 ? VIOLET : RED, trailOn: r.k < 0.2 && r.v > 1 }); BR.rider.visible = r.k < 0.5; BB.set(null);
    disc.material.color.set(RED).multiplyScalar(d > 0 ? 4 * (1 - sm(DW + 0.5, DW + 0.9, d)) : 0);
    pose(THROWN, { x: r.x + Math.cos(r.h) * -1.4 + Math.sin(r.h) * 1.6, z: r.z - Math.sin(r.h) * -1.4 + Math.cos(r.h) * 1.6, h: r.h + 1.2, lie: 1, armR: 1.4, armL: 0.6, vis: r.k > 0.5, hex: RED });
    rSpeed.set(r.k > 0.4 ? String(Math.round(r.v * 3.6)) : String(Math.round(r.v * 3.6)), RED, -0.55, sm(0.4, 0.8, t) * (1 - sm(T3 - 0.1, T3, t)) + (t > tHe - 0.1 ? 1 : 0) * (1 - sm(T4 - 0.15, T4, t)));
    rLean.set(r.k > 0.3 ? "DOWN" : deg(r.lean), RED, 0.55, sm(0.4, 0.8, t) * (1 - sm(T3 - 0.1, T3, t)) + (t > tHe - 0.1 ? 1 : 0) * (1 - sm(T4 - 0.15, T4, t)));
    sight.set(new THREE.Vector3(), new THREE.Vector3(), 0); strip(0, 0, 0, GREEN, 0); sightBar.visible = false;
  } else {
    const b = blue(t); st = b;
    BB.set(b, fnB, t, { hex: t < T4 + 0.3 ? VIOLET : GREEN }); BB.rider.visible = true; BR.set(null); pose(THROWN, { vis: false });
    const ra = t < T7 ? sm(T4 + 0.1, T4 + 0.4, t) * (1 - sm(T7 - 0.15, T7, t)) : 0;
    rSpeed.set(String(Math.round(b.v * 3.6)), GREEN, -0.55, ra); rLean.set(deg(b.lean), GREEN, 0.55, ra);
    // s4: what he can see + stopping distance at this speed
    const sa = t > T4 && t < T5 ? sm(g("s4", "stop") - 0.1, g("s4", "stop") + 0.2, t) : 0, sEnd = b.s + 27;
    const [ex, ez] = P(sEnd, 1.8); sight.set(wp(BB.visor), new THREE.Vector3(ex, 0.1, ez), sa);
    sightBar.visible = sa > 0.01; sightBar.position.set(ex, 0.03, ez); sightBar.rotation.y = C(sEnd)[2];
    const len = b.v * 1.0 + (b.v * b.v) / 14; strip(b.s + 1, 1.8, len, GREEN, sa * sm(g("s4", "road") - 0.1, g("s4", "road") + 0.3, t));
    tagAt3(pSee, ex, 1.4, ez, sa * (1 - sm(g("s4", "road") - 0.1, g("s4", "road"), t)), 2.4);
  }
  // pebbles glow + edge dirt pulse
  pebbles.material.color.set(ORANGE).multiplyScalar(0.8 + 1.2 * flash(t, g("s2", "gravel")) + 1.2 * flash(t, g("s6", "gravel")));
  mEdgeDirt.opacity = 0.9 * sm(g("s3", "edges") - 0.2, g("s3", "edges") + 0.2, t) * (1 - sm(tHe - 0.3, tHe, t)) * (0.7 + 0.3 * Math.sin(t * 9));
  tagAt3(pGravel, gx, 1.4, gz, (t > 1.5 && t < 2.9 ? 1 : 0) + (t > g("s2", "gravel") - 0.1 && t < tHe - 0.2 ? 1 : 0) + (t > g("s5", "moves") - 0.2 && t < g("s5", "from") ? 1 : 0), 2.6);
  tagAt3(pGravel2, g2x, 1.4, g2z, t > g("s6", "gravel") - 0.1 && t < g("s6", "stays") - 0.1 ? 1 : 0, 2.0);
  const shot = shoot(SH, t);
  bloom.strength = 1.0 + 1.0 * shot.punch * shot.punch + overlays(t) + (A ? 0.7 * flash(t, g("s3", "down")) : 0);
});
function tagAt3(m, x, y, z, a, s) { label(m, x, y, z, s, Math.min(1, a)); }
