// 137 pump-brakes: wrong = new pads go in, rider rolls off, the first squeeze goes to the bar and the bike rolls into a parked car (red).
// Why = new pads pushed the pistons back, a gap to the disc (red). Right = pump the lever, each pump steps the pistons out, lever firm, slow test, ride (green).
import { THREE, S, g, sm, flash, scene, bloom, box, tube, glow, VIOLET, ORANGE, RED, GREEN, makeCar, shoot, run } from "./kit.js";
import { track, buildRoad, title, endCard, cap, overlays, bikes, ride, dist, mSkin } from "./extra.js";

scene.fog.density = 0.01;
const T2 = S.s2[0], T3 = S.s3[0], T4 = S.s4[0], T5 = S.s5[0], T6 = S.s6[0], T7 = S.s7[0];
const O = 1.8;
const { P } = track([{ len: 600 }]);
buildRoad(P, -60, 400);
const wp = (o, v = new THREE.Vector3()) => o.getWorldPosition(v);

// ---- timing ----
const tPads = g("s1", "pads"), tRide = g("s1", "ride");
const tSq = g("s2", "squeeze"), tWay = g("s2", "way"), tBar = g("s2", "bar"), tBike = g("s2", "bike"), tStop = g("s2", "stop");
const tPush = g("s3", "push"), tBack = g("s3", "back");
const tPump = g("s4", "pump"), tFew = g("s4", "few");
const tFeels = g("s5", "feels"), tFirm = g("s5", "firm");
const tTest = g("s6", "test"), tSlow = g("s6", "slowly"), tRide6 = g("s6", "ride");

// ---- motion ----
const vA = (t) => 2.4 * sm(tRide - 0.1, tRide + 0.6, t) * (1 - sm(tStop - 0.04, tStop + 0.06, t));
const DA = dist(vA, 0, 30), zA = (t) => -DA(t), pA = (t) => [O, zA(t), 0];
const zCar = zA(tStop) - 1.0 - 2.25;
const vB = (t) => 1.6 * sm(tTest - 0.05, tTest + 0.4, t) * (1 - sm(tSlow, tSlow + 0.6, t)) + 7 * sm(tRide6, tRide6 + 1.3, t);
const DB = dist(vB, T3, 30), pB = (t) => [O, -DB(t), 0];

// ---- lever: pulls (0 = rest, 1 = touching the grip) and pad gap (0 = pads on the disc, 1 = pistons pushed back) ----
const bump = (u) => (u > 0 && u < 1 ? Math.sin(Math.PI * u) : 0);
const PU = [tPump - 0.05, tPump + 0.4, tPump + 0.85, tPump + 1.3], PK = [1, 0.8, 0.6, 0.45], ST = [0.35, 0.3, 0.23, 0.12];
function pull(t) {
  if (t < T3) return t > T2 ? sm(tSq - 0.1, tBar - 0.05, t) : 0;
  if (t < T5) { let p = 0; PU.forEach((a, i) => (p = Math.max(p, PK[i] * bump((t - a) / 0.38)))); return p; }
  if (t < T6) return Math.max(0.45 * bump((t - T5 - 0.05) / 0.4), 0.42 * sm(tFeels - 0.2, tFirm - 0.05, t));
  return 0.38 * sm(tSlow - 0.1, tSlow + 0.2, t) * (1 - sm(tRide6 - 0.2, tRide6, t));
}
function gapOf(t) {
  if (t < T3) return sm(0.45, 0.75, t);
  if (t < T4) return sm(tPush - 0.05, tBack, t);
  if (t < T5) { let g0 = 1; PU.forEach((a, i) => (g0 -= ST[i] * sm(a + 0.15, a + 0.35, t))); return Math.max(0, g0); }
  return 0;
}

const [Bk] = bikes(1);
const car = makeCar({});
// ---- disc on the right of the front wheel (outside the fork leg so it reads) ----
const mDisc = glow(0xb8b0e8, 0.55);
const disc = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.16, 0.008, 40), mDisc); disc.rotation.z = Math.PI / 2; disc.position.set(0.24, 0, 0); Bk.frontW.add(disc);
for (let i = 0; i < 8; i++) { const a = (i / 8) * Math.PI * 2; Bk.frontW.add(box(0.012, 0.018, 0.018, 0.24, 0.1 * Math.cos(a), 0.1 * Math.sin(a), glow(0x241c48, 1), false)); }
// ---- caliper: group at the axle, turned so local +y points to the rear-top of the disc ----
const cal = new THREE.Group(); cal.position.set(0.24, -0.62, -0.16); cal.rotation.x = Math.atan2(0.86, 0.5); Bk.fork.add(cal);
const R0 = 0.14;
const mBody = glow(VIOLET, 1.3), mPist = glow(0xe0dcff, 1.1), mNew = glow(ORANGE, 1.5), mOld = glow(0x6a5a4a, 0.7), mGap = glow(RED, 2.2);
for (const s of [-1, 1]) {
  cal.add(box(0.03, 0.08, 0.1, s * 0.09, R0, 0, mBody, false));
  cal.add(box(0.2, 0.014, 0.014, 0, R0 + 0.045, s * 0.045, mBody, false));
}
const pads = [], olds = [], pists = [], gaps = [];
for (const s of [-1, 1]) {
  const pd = box(0.016, 0.06, 0.075, 0, R0, 0, mNew, false); cal.add(pd); pads.push(pd);
  const od = box(0.008, 0.06, 0.075, 0, R0, 0, mOld, false); cal.add(od); olds.push(od);
  const pi = new THREE.Mesh(new THREE.CylinderGeometry(0.024, 0.024, 0.03, 20), mPist); pi.rotation.z = Math.PI / 2; cal.add(pi); pists.push(pi);
  const gp = box(1, 0.06, 0.075, 0, R0, 0, mGap, false); cal.add(gp); gaps.push(gp);
}
const mArr = glow(RED, 2.4), arrs = [-1, 1].map((s) => { const c = new THREE.Mesh(new THREE.ConeGeometry(0.014, 0.035, 12), mArr); c.rotation.z = -s * Math.PI / 2; cal.add(c); return c; });
function setCaliper(gp, padIn, oldOut, gapHex, gapK, arrowK) {
  const gw = 0.025 * gp;
  [-1, 1].forEach((s, i) => {
    pads[i].position.set(s * (0.004 + gw + 0.008), R0 + 0.3 * (1 - padIn), 0); pads[i].visible = padIn > 0.01;
    olds[i].position.set(s * 0.008, R0 + 0.3 * oldOut, 0); olds[i].visible = oldOut < 0.99;
    const inner = padIn > 0.01 ? 0.004 + gw + 0.016 : 0.012 + 0.017 * sm(0.45, 0.75, gp);
    pists[i].position.set(s * (inner + 0.015), R0, 0);
    gaps[i].visible = gapK > 0.02 && gw > 0.002; gaps[i].scale.x = Math.max(gw, 0.001); gaps[i].position.set(s * (0.004 + gw / 2), R0, 0);
    arrs[i].visible = arrowK > 0.02; arrs[i].position.set(s * (inner + 0.05 + 0.02 * arrowK), R0, 0); arrs[i].scale.setScalar(Math.max(arrowK, 0.01));
  });
  mGap.color.set(gapHex).multiplyScalar(2.2 * gapK);
}
const calC = new THREE.Object3D(); calC.position.set(0, R0, 0); cal.add(calC);
// ---- lever on the right grip ----
const piv = new THREE.Group(); piv.position.set(0.24, 0.12, 0.0); Bk.fork.add(piv);
const mLev = glow(VIOLET, 1.2);
piv.add(box(0.035, 0.035, 0.05, 0, 0, -0.02, mBody, false));
piv.add(box(0.22, 0.022, 0.02, 0.11, 0, -0.06, mLev, false));
piv.add(box(0.11, 0.03, 0.04, 0.15, 0.0, -0.088, mSkin, false));
Bk.fork.add(box(0.12, 0.05, 0.09, 0.39, 0.155, 0.045, mSkin, false));
const gripC = new THREE.Object3D(); gripC.position.set(0.39, 0.12, 0.05); Bk.fork.add(gripC);
const mFirm = glow(GREEN, 2.2), firm = box(0.02, 0.02, 1, 0.39, 0.12, 0, mFirm, false); Bk.fork.add(firm);
// hose from the perch down to the caliper, with a pulse on each pump
const HA = new THREE.Vector3(0.26, 0.1, 0.0), HB = new THREE.Vector3(0.33, -0.5, -0.03);
Bk.fork.add(tube(HA.toArray(), HB.toArray(), 0.011, glow(0x3a3260, 1)));
const mPulse = glow(GREEN, 1.8), pulseB = new THREE.Mesh(new THREE.SphereGeometry(0.022, 12, 10), mPulse); Bk.fork.add(pulseB);
// rings
const mkRing = () => { const m = new THREE.MeshBasicMaterial({ color: 0, toneMapped: false, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide }); const r = new THREE.Mesh(new THREE.RingGeometry(0.34, 0.39, 48), m); scene.add(r); return r; };
const ring = mkRing(), ring2 = mkRing();
const pulseRing = (r, p, k, hex, s0, s1, ry = -Math.PI / 2, rx = 0) => { if (k <= 0 || k >= 1) { r.visible = false; return; } r.visible = true; r.position.copy(p); r.rotation.set(rx, ry, 0); r.scale.setScalar(s0 + (s1 - s0) * k); r.material.color.set(hex).multiplyScalar(2.6 * (1 - k)); };

title("NEVER RIDE RIGHT AFTER NEW BRAKE PADS");
cap("s1", "changed", ["NEW BRAKE PADS?"], VIOLET, { y: 0.3, until: ["s1", "never"] });
cap("s2", "squeeze", ["FIRST SQUEEZE"], RED, { y: 0.3, until: ["s2", "way"] });
cap("s2", "way", ["LEVER GOES", "TO THE BAR"], RED, { y: 0.3, until: ["s2", "bike"] });
cap("s2", "bike", ["BIKE DOES", "NOT STOP"], RED, { y: 0.3, boom: 0.6 });
cap("s3", "push", ["PISTONS", "PUSHED BACK"], RED, { y: 0.3 });
cap("s4", "pump", ["PUMP THE LEVER"], GREEN, { y: 0.3, until: ["s4", "few"] });
cap("s4", "few", ["A FEW TIMES"], GREEN, { y: 0.3 });
cap("s5", "wait", ["UNTIL IT", "FEELS FIRM"], GREEN, { y: 0.3 });
cap("s6", "test", ["TEST SLOWLY", "FIRST"], GREEN, { y: 0.3, until: ["s6", "ride"] });
cap("s6", "ride", ["THEN RIDE"], GREEN, { y: 0.3 });
endCard(["NEW PADS?", "PUMP THE LEVER FIRST."]);

const V = new THREE.Vector3(), V2 = new THREE.Vector3(), V3 = new THREE.Vector3();
const calCam = (t, su) => { const C = wp(calC, V); return [C.x + 0.62, C.y + 0.42, C.z + 0.55 - 0.04 * su, C.x, C.y + 0.02, C.z, 42]; };
const levCam = (t, su) => { const G = wp(gripC, V); return [G.x + 0.45, G.y + 0.62, G.z - 0.7 + 0.03 * su, G.x - 0.12, G.y - 0.02, G.z, 42]; };
const midCam = (t, su) => { const F = wp(Bk.fork, V); return [F.x + 1.9 - 0.05 * su, F.y + 0.1, F.z + 0.35, F.x + 0.2, F.y - 0.3, F.z - 0.1, 44]; };
const zb0 = zA(tBike - 0.2);
const SH = [
  { at: 0, cam: calCam },
  { at: tRide - 0.25, cam: (t, su) => { const z = zA(t); return [O + 2.4, 1.5, z + 3.0, O, 0.75, z - 1.2, 46]; } },
  { at: T2, cam: levCam },
  { at: tBike - 0.2, K: [[0, [O + 4.6, 2.0, zb0 + 0.6, O, 0.75, zb0 - 2.4, 46]], [1.6, [O + 4.3, 1.9, zb0 + 0.2, O, 0.75, zb0 - 2.5, 46]]] },
  { at: T3, cam: calCam },
  { at: T4, cam: levCam },
  { at: tPump + 0.55, cam: midCam },
  { at: T5, cam: levCam },
  { at: tFirm + 0.35, cam: calCam },
  { at: T6, K: [[0, [O + 3.4, 1.5, 1.2, O, 0.8, -1.6, 46]], [tRide6 - T6, [O + 3.2, 1.45, 0.8, O, 0.8, -1.8, 46]]] },
  { at: tRide6 + 0.1, cam: (t, su) => { const z = -DB(t); return [O + 2.2, 1.7, z + 3.4, O, 0.8, z - 1.5, 48]; } },
  { at: T7 + 0.3, cam: (t, su) => { const z = -DB(t); return [O + 1.4, 3.0, z + 6, O, 0.8, z - 4, 50]; } },
];

run("w", (t) => {
  const A = t < T3;
  const pl = pull(t), gp = gapOf(t);
  if (A) {
    ride(Bk, pA, t, t < T2 ? VIOLET : RED, { trail: t > tRide + 0.3 && t < tStop });
    const j = t > tStop ? bump((t - tStop) / 0.45) : 0;
    Bk.g.rotation.x = -0.07 * j;
    car.set({ x: O, z: zCar, h: 0 });
    setCaliper(gp, sm(0.6, 1.05, t), sm(0.15, 0.5, t), RED, t > T2 ? 1 : 0, 0);
    pulseRing(ring, V2.set(O, 0.7, zCar + 2.25), sm(tStop - 0.03, tStop + 0.6, t), RED, 0.5, 2.2, 0);
  } else {
    ride(Bk, pB, t, GREEN, { trail: t > tRide6 + 0.2 });
    Bk.g.rotation.x = 0;
    car.set(null);
    const red = t < T4 ? 1 : 1 - sm(tPump + 1.4, tPump + 1.7, t);
    setCaliper(gp, 1, 1, RED, red * (t < T4 ? sm(tPush, tPush + 0.3, t) : 1), t < T4 ? sm(tPush - 0.05, tPush + 0.2, t) * (1 - sm(tBack + 0.15, tBack + 0.4, t)) : 0);
    // pads clamp the disc green once the lever is firm
    mNew.color.set(t > tFeels ? GREEN : ORANGE).multiplyScalar(1.5 + 1.2 * flash(t, tFirm));
    Bk.g.updateMatrixWorld(true);
    pulseRing(ring, wp(Bk.frontW, V2), sm(tSlow + 0.4, tSlow + 1.0, t), GREEN, 0.6, 1.6);
  }
  if (A) mNew.color.set(ORANGE).multiplyScalar(1.5);
  // lever
  piv.rotation.y = -0.46 * pl;
  const levHex = A ? (t > T2 ? RED : VIOLET) : GREEN;
  mLev.color.set(levHex).multiplyScalar(1.1 + 0.6 * (A ? flash(t, tBar) : flash(t, tFirm)));
  const gapZ = 0.075 * (1 - pl), showFirm = t > tFirm - 0.1 && t < T6;
  firm.visible = showFirm; firm.scale.z = Math.max(gapZ, 0.001); firm.position.z = 0.025 - gapZ / 2;
  mFirm.color.set(GREEN).multiplyScalar(1.3 * sm(tFirm - 0.1, tFirm + 0.15, t));
  // hose pulse on each pump
  let pq = -1; if (!A && t < T5) PU.forEach((a) => { const u = (t - a - 0.1) / 0.35; if (u > 0 && u < 1) pq = u; });
  pulseB.visible = pq >= 0; if (pq >= 0) pulseB.position.copy(HA).lerp(HB, pq);
  Bk.g.updateMatrixWorld(true);
  const Gp = wp(gripC, V3);
  if (A) pulseRing(ring2, Gp, sm(tBar - 0.05, tBar + 0.5, t), RED, 0.15, 0.5, 0, -Math.PI / 2);
  else pulseRing(ring2, Gp, sm(tFirm - 0.05, tFirm + 0.5, t), GREEN, 0.15, 0.5, 0, -Math.PI / 2);
  const shot = shoot(SH, t);
  bloom.strength = 0.7 + 1.0 * shot.punch * shot.punch + overlays(t) + (A ? 0.6 * flash(t, tStop) : 0);
});
