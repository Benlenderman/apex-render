// 91 group-u-turn: the group misses the turn and all eight swing round at once, blocking both lanes; cars brake hard (red).
// Right way: pull fully off the road, turn one rider at a time when it's clear both ways, regroup off the road; or loop a roundabout (green).
import { THREE, S, g, sm, flash, scene, bloom, mSolid, VIOLET, RED, GREEN, pathState, shoot, sceneOf, run, patch, makeCar } from "./kit.js";
import { track, buildRoad, title, endCard, cap, overlays, bikes, ride, dist } from "./extra.js";

scene.fog.density = 0.006;
const V = 9, N = 8, T2 = S.s2[0], T3 = S.s3[0], T4 = S.s4[0], T5 = S.s5[0], T6 = S.s6[0], T7 = S.s7[0];
const tSw = g("s2", "swing"), tCross = g("s2", "cross"), tBlock = g("s2", "block");
const tPull = g("s3", "pull"), tOne = g("s4", "one"), tOnly = g("s4", "only"), tBoth = g("s4", "both"), tGo = g("s5", "go");

// ---- roads: one long road; a roundabout at its far end for s6 ----
const { P } = track([{ len: 4000 }]);
const Rr = 11, zc = -1500, sEnd = -(zc + Rr + 3.5);
buildRoad(P, -80, sEnd, { lamps: false });
{ const { P: Pc } = track([{ len: 2 * Math.PI * Rr + 1, R: Rr }]); buildRoad((s, o) => { const [x, z] = Pc(s, o); return [x + Rr, z + zc]; }, 0, 2 * Math.PI * Rr + 1, { lamps: false, LW: 3.2 }); }
{ const isl = new THREE.Mesh(new THREE.CylinderGeometry(Rr - 3.8, Rr - 3.8, 0.3, 48), mSolid); isl.position.set(0, 0.15, zc); scene.add(isl); }
const BK = bikes(N), carO = makeCar({ driver: true }), carB = makeCar({ color: 0x5246c8 }), carP = makeCar({ color: 0x5246c8 });
const off = (i) => (i % 2 ? 2.6 : 1.0);

// ---- A: staggered group slows, then all swing round at once and stall across both lanes ----
const sA0 = 140, DA = dist((t) => V * (1 - 0.75 * sm(tSw - 1.2, tSw, t)), 0, tSw), thMax = [1.5, 2.0, 1.7, 1.35, 1.9, 1.55, 2.05, 1.45];
const aPath = (i) => (t) => {
  const s0 = sA0 - 6 * i;
  if (t < tSw) return P(s0 + DA(t), off(i));
  const sc = s0 + DA(tSw), th = thMax[i] * sm(tSw, tSw + 1.5, t), a = 2.5, b = 3.0;
  return [off(i) - b * (1 - Math.cos(th)), -(sc + a * Math.sin(th)), Math.atan2(b * Math.sin(th), a * Math.cos(th))];
};
const zFront = -(sA0 + DA(tSw) + 2.5), zBack = -(sA0 - 6 * (N - 1) + DA(tSw));
// oncoming car (left lane, +z) and a car behind (right lane, -z): both brake hard to a stop at the wall of bikes
const DC = dist((t) => 15 * (1 - sm(tCross - 0.3, tBlock + 0.1, t)), tCross - 3, T3 + 1), DCt = DC(T3 + 1);
const carOPath = (t) => (t > T2 && t < T3 ? [-1.8, zFront - 7 - (DCt - DC(t)), Math.PI] : null);
const carBPath = (t) => (t > T2 && t < T3 ? [1.8, zBack + 8 + (DCt - DC(t)), 0] : null);
const blockZ = patch(7.6, zBack - zFront + 4, RED, 0.7); blockZ.position.set(0, 0.03, (zFront + zBack) / 2);

// ---- B: pull over into a lay-by (o = 7.2), then one at a time: U-turn across into the left lane ----
const sB = 500, sPark = sB + 90, DB = dist((t) => V * (1 - sm(tPull - 0.2, tPull + 2.2, t)), T3 - 1, T5), DBt = DB(T5);
const layby = patch(4, 60, GREEN, 0.5); { const [x, z] = P(sPark - 22, 7.2); layby.position.set(x, 0.03, z); }
const tTurn = [tOne - 0.1, tBoth + 0.15];
const bPath = (i) => (t) => {
  const sp = sPark - 6.5 * i;
  if (i < 2 && t > tTurn[i]) {
    const k = sm(tTurn[i], tTurn[i] + 2.4, t), ph = Math.PI * k, ex = Math.max(0, t - tTurn[i] - 2.4);
    if (ex > 0) return P(sp - 7 * ex - 0.5 * ex * ex, -1.8);
    return P(sp + 4.5 * Math.sin(ph), 2.7 + 4.5 * Math.cos(ph));
  }
  return P(sp - (DBt - DB(t)), off(i) + (7.2 - off(i)) * sm(tPull - 0.1, tPull + 1.6, t));
};
const carPPath = (t) => (t > T4 && t < T5 ? P(sPark - 60 + 15 * (t - tOnly), 1.8) : null);

// ---- C: regrouped on the far shoulder (o = -7.2, facing +z), pull out together on "go" ----
const sC = 1000, DGo = dist((t) => 8 * sm(tGo, tGo + 1.4, t), tGo - 1, T6 + 1);
const cPath = (i) => (t) => {
  const t0 = tGo + 0.18 * i, d = DGo(t - 0.18 * i), [x, z] = P(sC + 6.5 * i - d, -7.2 + 5.4 * sm(t0, t0 + 1.4, t));
  return t < t0 ? [x, z, Math.PI] : [x, z];
};

// ---- D: ride on to the roundabout, all the way round and back the way you came ----
const pts = [];
const push = (x, z) => pts.push([x, z]);
push(1.8, zc + 70); push(1.8, zc + Rr + 6);
for (let th = 0.45; th >= -Math.PI - 0.45; th -= 0.08) push((Rr + 1.6) * Math.cos(th), zc + (Rr + 1.6) * Math.sin(th));
push(-1.8, zc + Rr + 6); push(-1.8, zc + 200);
let poly = pts;
for (let it = 0; it < 4; it++) { const q = [poly[0]]; for (let j = 0; j < poly.length - 1; j++) { const [a, b] = [poly[j], poly[j + 1]]; q.push([0.75 * a[0] + 0.25 * b[0], 0.75 * a[1] + 0.25 * b[1]], [0.25 * a[0] + 0.75 * b[0], 0.25 * a[1] + 0.75 * b[1]]); } q.push(poly[poly.length - 1]); poly = q; }
const cum = [0]; for (let j = 1; j < poly.length; j++) cum.push(cum[j - 1] + Math.hypot(poly[j][0] - poly[j - 1][0], poly[j][1] - poly[j - 1][1]));
const along = (u) => {
  if (u <= 0) return [poly[0][0], poly[0][1] - u];
  let lo = 0, hi = cum.length - 1; while (hi - lo > 1) { const m = (lo + hi) >> 1; if (cum[m] < u) lo = m; else hi = m; }
  const f = Math.min(1, (u - cum[lo]) / (cum[hi] - cum[lo] || 1)); return [poly[lo][0] + f * (poly[hi][0] - poly[lo][0]), poly[lo][1] + f * (poly[hi][1] - poly[lo][1])];
};
const dPath = (i) => (t) => along(50 + 9 * (t - T6) - 7.5 * i);

const path = (i) => (t) => (t < T3 ? aPath(i)(t) : t < T5 ? bPath(i)(t) : t < T6 ? cPath(i)(t) : dPath(i)(t));
const phase = (t) => (t < T3 ? aPath : t < T5 ? bPath : t < T6 ? cPath : dPath);

title("NEVER U-TURN THE WHOLE GROUP AT ONCE");
cap("s2", "ten", ["TEN BIKES SWING", "ROUND AT ONCE"], RED, { until: ["s2", "cross"] });
cap("s2", "cross", ["ACROSS THE TRAFFIC"], RED, { until: ["s2", "block"] });
cap("s2", "block", ["BOTH LANES", "BLOCKED"], RED, { boom: 0.5 });
cap("s3", "pull", ["PULL OVER,", "FULLY OFF THE ROAD"], GREEN);
cap("s4", "turn", ["ONE RIDER", "AT A TIME"], GREEN, { until: ["s4", "only"] });
cap("s4", "only", ["ONLY WHEN IT'S", "CLEAR BOTH WAYS"], GREEN);
cap("s5", "regroup", ["REGROUP", "OFF THE ROAD"], GREEN, { until: ["s5", "go"] });
cap("s5", "go", ["THEN GO AGAIN"], GREEN);
cap("s6", "or", ["OR LOOP THE", "NEXT ROUNDABOUT"], GREEN);
endCard(["PULL OVER.", "TURN ONE AT A TIME."]);

const fol = (fn) => (t) => pathState(fn, t);
const cam = (s, o, y, ls, lo, ly, f) => { const [x, z] = P(s, o), [lx, lz] = P(ls, lo); return [x, y, z, lx, ly, lz, f]; };
const zMid = (zFront + zBack) / 2;
const SH = [
  { at: 0, f: fol(aPath(5)), noRot: true, K: [[0, [4.0, 5.5, 12, -0.5, 0.6, -16, 48]], [3, [4.5, 6.2, 13, -0.5, 0.6, -18, 48]]] },
  { at: tSw - 0.4, K: [[0, [7, 17, zBack + 30, -0.5, 0, zMid - 6, 48]], [3, [8, 19, zBack + 33, -0.5, 0, zMid - 6, 48]]] },
  { at: T3, f: fol(bPath(3)), noRot: true, K: [[0, [-4.5, 6, 13, 2.5, 0.6, -14, 48]], [4, [-6, 8, 15, 4.0, 0.6, -14, 48]]] },
  { at: T4, K: [[0, cam(sPark - 30, -9, 10, sPark - 6, 3.5, 0, 48)], [5, cam(sPark - 31, -10, 11, sPark - 6, 3.5, 0, 48)]] },
  { at: T5, K: [[0, cam(sC - 18, -2.5, 4.5, sC + 10, -6, 0.8, 46)], [3, cam(sC - 19, -2.0, 5.0, sC + 10, -5, 0.8, 46)]] },
  { at: T6, K: [[0, [10, 44, zc + 42, 0, 0, zc - 2, 46]], [6, [12, 50, zc + 48, 0, 0, zc - 2, 46]]] },
];

run("w", (t) => {
  const A = t < T3, hex = A ? (t < T2 ? VIOLET : RED) : GREEN, ph = phase(t);
  BK.forEach((B, i) => {
    const fn = ph(i), p0 = fn(t), p1 = fn(t + 0.05), still = Math.hypot(p1[0] - p0[0], p1[1] - p0[1]) < 0.01;
    ride(B, fn, t, hex, { still, trail: !still });
  });
  carO.set(pathState(carOPath, t));
  carB.set(pathState(carBPath, t));
  carP.set(pathState(carPPath, t));
  blockZ.set(A ? sm(tCross, tCross + 0.5, t) : 0);
  layby.set(!A && t < T5 ? sm(tPull - 0.3, tPull + 0.3, t) : 0);
  const shot = shoot(SH, t);
  bloom.strength = 1.0 + 1.2 * shot.punch * shot.punch + overlays(t) + 0.5 * flash(t, tBlock);
});
