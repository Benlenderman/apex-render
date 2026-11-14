// 129 lower-body-first: wrong = Red sits up, brakes, moves his hips and turns all at once at the corner, the bike
// wobbles and runs wide onto the kerb (red). Right = Blue, still tucked on the straight, moves his hips over first
// (right hip off the seat), body set, then sits up, brakes, opens the knee and turns in, smooth (green).
import { THREE, S, g, sm, scene, bloom, box, glow, mSolid, VIOLET, ORANGE, RED, GREEN, WHITE, hud, shoot, run } from "./kit.js";
import { track, ribbon, buildRoad, title, endCard, cap, overlays, bikes, dist } from "./extra.js";

// ---------- props built here: pill labels, readout cards, articulated sport rider ----------
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
    const fs = Math.min(96, Math.floor(96 * 880 / (txt.length * 62))); x.font = `900 ${fs}px Inter, Arial, sans-serif`; const tw = x.measureText(txt).width + 110, X = 512 - tw / 2;
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
  m.set = (val, hex, sx, a) => { const key = val + hex; if (key !== last) { m.draw(val, hex); last = key; } hud(m, sx, -0.36, 0.26, a); };
  return m;
}
const Y = new THREE.Vector3(0, 1, 0), V3 = (x, y, z) => new THREE.Vector3(x, y, z);
function seg(parent, r, mat) {
  const m = new THREE.Mesh(new THREE.CapsuleGeometry(r, 1, 4, 10), mat); parent.add(m);
  const d = new THREE.Vector3();
  m.put = (a, b) => { d.subVectors(b, a); const L = d.length(); m.position.copy(a).add(b).multiplyScalar(0.5); m.quaternion.setFromUnitVectors(Y, d.divideScalar(L)); m.scale.set(1, Math.max(0.05, L - 2 * r) , 1); };
  return m;
}
// sport rider in the bike's lean group: hip = hips moved to the right (0..1), up = sat up (0 tucked .. 1), knee = right knee open
function sportRider(B) {
  B.rider.visible = false;
  const R = new THREE.Group(); B.lean.add(R);
  const mUp = mSolid.clone(), mLow = mSolid.clone();
  const pelvis = new THREE.Mesh(new THREE.BoxGeometry(0.36, 0.18, 0.3), mLow); R.add(pelvis);
  const torso = seg(R, 0.17, mUp), head = new THREE.Mesh(new THREE.SphereGeometry(0.16, 16, 12), mUp); R.add(head);
  const visor = box(0.22, 0.07, 0.03, 0, 0, 0, glow(VIOLET, 2), false); R.add(visor);
  const armL = seg(R, 0.065, mUp), armR = seg(R, 0.065, mUp), thL = seg(R, 0.085, mLow), thR = seg(R, 0.085, mLow), shL = seg(R, 0.07, mLow), shR = seg(R, 0.07, mLow);
  const ftL = box(0.11, 0.08, 0.24, -0.25, 0.38, 0.3, mLow), ftR = box(0.11, 0.08, 0.24, 0.25, 0.38, 0.3, mLow); R.add(ftL, ftR);
  return {
    mUp, mLow,
    set(hip, up, knee, jit = 0) {
      const P0 = V3(0.26 * hip, 0.99 - 0.04 * hip, 0.2), a = 1.2 - 0.6 * up + jit, b = 0.2 * hip;
      pelvis.position.copy(P0); pelvis.rotation.z = -0.35 * hip;
      const dir = V3(Math.sin(b), Math.cos(a), -Math.sin(a)).normalize(), sh = P0.clone().addScaledVector(dir, 0.5), hd = P0.clone().addScaledVector(dir, 0.76);
      torso.put(P0, sh); head.position.copy(hd); visor.position.set(hd.x, hd.y + 0.01, hd.z - 0.15);
      armL.put(V3(sh.x - 0.19, sh.y, sh.z), V3(-0.37, 1.07, -0.47)); armR.put(V3(sh.x + 0.19, sh.y, sh.z), V3(0.37, 1.07, -0.47));
      const hL = V3(P0.x - 0.14, P0.y, P0.z), hR = V3(P0.x + 0.14, P0.y - 0.03 * hip, P0.z);
      const kL = V3(-0.3, 0.8, -0.1), kR = V3(0.3 + 0.12 * hip + 0.32 * knee, 0.78 - 0.08 * knee, -0.08 + 0.06 * knee);
      thL.put(hL, kL); thR.put(hR, kR); shL.put(kL, V3(-0.25, 0.42, 0.26)); shR.put(kR, V3(0.25, 0.42, 0.26));
    },
  };
}

// ---------- track: long straight, right-hand bend with kerbs ----------
scene.fog.density = 0.008;
const Sb = 330, Rb = 40, BL = 75, LW = 5;
const { C, P } = track([{ len: Sb }, { len: BL, R: -Rb }, { len: 400 }]);
buildRoad(P, -20, Sb + BL + 200, { LW, lamps: false });
for (const sd of [-1, 1]) for (let s = Sb - 25, i = 0; s < Sb + BL + 15; s += 1.4, i++) ribbon(P, sd > 0 ? LW + 0.3 : -LW - 1.1, sd > 0 ? LW + 1.1 : -LW - 0.3, s, s + 1.4, glow(i % 2 ? WHITE : RED, i % 2 ? 0.55 : 0.9), 0.02, 0.7);
const kap = (s) => (1 / Rb) * sm(Sb - 2, Sb + 6, s) * (1 - sm(Sb + BL - 6, Sb + BL + 2, s));
const leanAt = (s, v) => -Math.atan((v * v * kap(s)) / 9.8);
const T2 = S.s2[0], T3 = S.s3[0], T4 = S.s4[0], T5 = S.s5[0], T6 = S.s6[0], T7 = S.s7[0];
const V0 = 33, V1 = 21;

// Red: all four at the corner
const tSitA = g("s2", "sit"), tBrkA = g("s2", "brake"), tHipA = g("s2", "hips"), tTurnA = g("s2", "turn"), tAll = g("s2", "all");
const vA = (t) => V0 - (V0 - V1) * sm(tBrkA, tBrkA + 1.3, t);
const DA = dist(vA, -1, 8), sA = (t) => Sb + DA(t) - DA(tTurnA);
const oA = (s) => -3 - 1.9 * sm(Sb + 4, Sb + 26, s);
// Blue: hips on the straight, then sit up, brake, knee, turn in
const tMove = g("s3", "move"), tFirst = g("s3", "first"), tSitB = g("s5", "sit"), tBrkB = g("s5", "brake"), tKnee = g("s5", "open"), tTurnB = g("s5", "turn");
const vB = (t) => V0 - (V0 - V1) * sm(tBrkB, tBrkB + 1.2, t);
const DB = dist(vB, T3 - 1, 25), sB = (t) => Sb + DB(t) - DB(tTurnB);
const oB = (s) => -3 + 6.2 * sm(Sb, Sb + 34, s) - 5.2 * sm(Sb + 42, Sb + 80, s);

const [Bk] = bikes(1), RD = sportRider(Bk);
const mBike = mSolid.clone(); Bk.g.traverse((o) => { if (o.material === mSolid) o.material = mBike; });
const RED_B = 0x8a2034, BLUE_B = 0x2b3fb0;
function state(sf, of, t, v, extra = {}) {
  const s = sf(t), o = of(s), [x, z] = P(s, o);
  return { x, z, h: C(s)[2] + (extra.h || 0), lean: leanAt(s, v) * (extra.k ?? 1) + (extra.lean || 0), steer: extra.steer || 0, v, s };
}

// labels
const pSit = pill("SIT UP", RED), pBrk = pill("BRAKE", RED), pHip = pill("HIPS", RED), pTrn = pill("TURN", RED), pWide = pill("RUNS WIDE", RED);
const pSet = pill("BODY SET", GREEN), pHipOff = pill("RIGHT HIP OFF THE SEAT", GREEN);
const qSit = pill("1. SIT UP", GREEN), qBrk = pill("2. BRAKE", GREEN), qKnee = pill("3. OPEN KNEE", GREEN), qTurn = pill("4. TURN IN", GREEN);
const rSpeed = readout("KM/H"), rLean = readout("LEAN");

title("TRY THIS ON THE NEXT CORNER");
cap("s2", "most", ["THE USUAL WAY", "INTO A CORNER"], RED, { y: 0.3, until: ["s2", "all"] });
cap("s2", "all", ["ALL AT THE", "SAME TIME"], RED, { y: 0.3, boom: 0.4 });
cap("s3", "instead", ["STILL TUCKED", "ON THE STRAIGHT"], GREEN, { y: 0.3, until: ["s3", "move"] });
cap("s3", "move", ["MOVE YOUR", "HIPS FIRST"], GREEN, { y: 0.3 });
cap("s4", "for", ["RIGHT TURN =", "RIGHT HIP OFF"], GREEN, { until: ["s4", "before"] });
cap("s4", "before", ["BEFORE YOU", "SIT UP"], GREEN);
cap("s5", "your", ["YOUR BODY", "IS SET"], GREEN, { until: ["s5", "now"] });
cap("s5", "now", ["NOW SIT UP,", "BRAKE, TURN IN"], GREEN);
cap("s6", "one", ["ONE LESS JOB", "UNDER BRAKING"], GREEN, { boom: 0.3 });
endCard(["HIPS FIRST, ON THE STRAIGHT.", "THEN BRAKE."]);

const BACK = [0, 2.0, 5.8, 0, 0.9, -8, 44];
const fl = (sf, of) => (t) => { const s = sf(t), [x, z] = P(s, of(s)); return { x, z, h: C(s)[2] }; };
const fA = fl(sA, oA), fB = fl(sB, oB);
const SH = [
  { at: 0, f: fA, K: [[0, [0.8, 2.4, 6.5, 0, 1.0, -8, 46]], [1.6, BACK]] },
  { at: T2, f: fA, K: [[0, BACK], [2.0, [0, 1.9, 5.2, 0, 0.9, -8, 44]]] },
  { at: tAll - 0.15, f: fA, K: [[0, [-4.5, 3.0, 5.5, 0, 0.6, -4, 46]], [1.0, [-5.5, 3.6, 6.5, 0, 0.6, -2, 46]]] },
  { at: T3, f: fB, K: [[0, [0, 1.8, 5.0, 0, 0.9, -8, 44]], [2.2, BACK]] },
  { at: T4, f: fB, K: [[0, [2.8, 1.7, 3.8, 0.1, 0.9, -0.3, 44]], [2.2, [3.0, 1.8, 3.4, 0.1, 0.9, -0.5, 44]]] },
  { at: g("s4", "before") - 0.15, f: fB, K: [[0, BACK], [1.2, BACK]] },
  { at: T5, f: fB, K: [[0, [0, 1.9, 5.4, 0, 0.9, -8, 44]], [2.3, [0, 2.0, 5.8, 0, 0.9, -8, 44]]] },
  { at: tTurnB - 0.15, f: fB, K: [[0, [0.4, 2.3, 6.0, 0, 0.9, -3, 46]], [1.0, [0.4, 2.5, 6.4, 0, 0.9, -3, 46]]] },
  { at: T6, f: fB, K: [[0, [-0.8, 2.6, 6.2, 0, 0.8, -3, 46]], [1.5, [-1.0, 2.9, 6.8, 0, 0.8, -3, 46]]] },
  { at: T7, f: fB, K: [[0, [0, 2.2, 6.5, 0, 1, -12, 48]], [2.5, [0, 3.2, 8.5, 0, 1, -14, 50]]] },
];
const deg = (l) => `${Math.round(Math.abs(l) * 57.3)}°`;
const onAt = (t, a, b) => sm(a - 0.05, a + 0.1, t) * (1 - sm(b - 0.1, b, t));
const lowBase = new THREE.Color();
run("w", (t) => {
  const A = t < T3;
  let st;
  if (A) {
    const w = sm(tAll - 0.4, tAll, t), wob = Math.sin(t * 15);
    const v = vA(t);
    st = state(sA, oA, t, v, { k: 0.75, lean: 0.07 * wob * w, steer: 0.13 * Math.sin(t * 17) * w, h: 0.07 * w });
    const sit = sm(tSitA, tSitA + 0.25, t), hip = sm(tHipA, tHipA + 0.3, t), knee = sm(tTurnA, tTurnA + 0.25, t);
    RD.set(hip, sit, knee, 0.12 * wob * w);
    mBike.color.set(t < 0.5 ? 0x3a2e8c : RED_B); RD.mUp.color.set(RED_B); RD.mLow.color.set(RED_B); RD.mLow.emissive.set(RED_B).multiplyScalar(0.3); RD.mUp.emissive.set(RED_B).multiplyScalar(0.3);
    Bk.tail.material.color.set(RED).multiplyScalar(t > tBrkA ? 5 : 2);
    const end = T3 - 0.05;
    hud(pSit, -0.45, 0.1, 0.5, onAt(t, tSitA, end)); hud(pBrk, 0.45, 0.1, 0.5, onAt(t, tBrkA, end));
    hud(pHip, -0.45, -0.02, 0.5, onAt(t, tHipA, end)); hud(pTrn, 0.45, -0.02, 0.5, onAt(t, tTurnA, end));
    hud(pWide, 0, -0.16, 0.7, onAt(t, g("s2", "same"), end));
    for (const m of [pSet, pHipOff, qSit, qBrk, qKnee, qTurn]) m.visible = false;
    rSpeed.set(String(Math.round(v * 3.6)), RED, -0.58, sm(T2, T2 + 0.3, t) * (1 - sm(tAll - 0.25, tAll - 0.1, t)));
    rLean.set(deg(st.lean), RED, 0.58, sm(T2, T2 + 0.3, t) * (1 - sm(tAll - 0.25, tAll - 0.1, t)));
  } else {
    const v = vB(t);
    st = state(sB, oB, t, v);
    const hip = sm(tMove, tFirst + 0.2, t), sit = sm(tSitB, tSitB + 0.35, t), knee = sm(tKnee, g("s5", "knee") + 0.2, t);
    RD.set(hip, sit, knee);
    mBike.color.set(BLUE_B); RD.mUp.color.set(BLUE_B); RD.mUp.emissive.set(BLUE_B).multiplyScalar(0.3);
    const hl = sm(tMove - 0.1, tMove + 0.3, t) * (1 - sm(T5 + 0.6, T5 + 1.0, t)) + 0.8 * sm(tKnee, tKnee + 0.2, t) * (1 - sm(tTurnB, tTurnB + 0.4, t));
    lowBase.set(BLUE_B).lerp(new THREE.Color(GREEN), hl); RD.mLow.color.copy(lowBase); RD.mLow.emissive.set(BLUE_B).multiplyScalar(0.3).lerp(new THREE.Color(GREEN).multiplyScalar(0.3), hl);
    Bk.tail.material.color.set(RED).multiplyScalar(t > tBrkB && t < tTurnB + 0.6 ? 5 : 2);
    for (const m of [pSit, pBrk, pHip, pTrn, pWide]) m.visible = false;
    hud(pHipOff, 0, 0.12, 0.9, onAt(t, g("s4", "right", 2), T5));
    hud(pSet, 0, 0.12, 0.66, onAt(t, g("s5", "body"), g("s5", "now")));
    hud(qSit, 0, 0.12, 0.66, onAt(t, tSitB, tBrkB)); hud(qBrk, 0, 0.12, 0.66, onAt(t, tBrkB, tKnee));
    hud(qKnee, 0, 0.12, 0.7, onAt(t, tKnee, tTurnB)); hud(qTurn, 0, 0.12, 0.66, onAt(t, tTurnB, T6));
    const ra = (t < T7 ? 1 : 0) * sm(T3 + 0.1, T3 + 0.4, t) * (1 - sm(T7 - 0.15, T7, t)) * (1 - onAt(t, T4, T5));
    rSpeed.set(String(Math.round(v * 3.6)), GREEN, -0.65, ra); rLean.set(deg(st.lean), GREEN, 0.65, ra);
  }
  Bk.set(st, null, t, { trailOn: false });
  const shot = shoot(SH, t);
  bloom.strength = 1.0 + 1.0 * shot.punch * shot.punch + overlays(t);
});
