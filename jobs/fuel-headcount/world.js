// 84 fuel-headcount: one rider is still paying inside; the group rides off and leaves him alone at the pumps (red).
// Right way: the leader counts the bikes, everyone shows ready (thumb up), the sweep leaves last and checks the lot, the whole group rides together (green).
import { THREE, S, g, sm, flash, scene, bloom, box, VIOLET, ORANGE, RED, GREEN, pathState, shoot, sceneOf, run, patch } from "./kit.js";
import { track, buildRoad, makePerson, pose, ARM, title, endCard, cap, overlays, tag, tagAt, bikes, ride, dist, limbs } from "./extra.js";

scene.fog.density = 0.006;
const N = 4, { P } = track([{ len: 4000 }]);
buildRoad(P, -100, 3800, { lamps: false });
const B = bikes(N), LB = B.map((b) => limbs(b)), payer = makePerson();
const T2 = S.s2[0], T3 = S.s3[0], T4 = S.s4[0], T5 = S.s5[0], T6 = S.s6[0], T7 = S.s7[0];
const tStill = g("s2", "still"), tRides = g("s2", "rides"), tLeft = g("s2", "left");
const tCount = g("s3", "counts"), tReady = g("s4", "ready"), tThumb = g("s4", "thumb");
const tSweep = g("s5", "sweep"), tChk = g("s5", "checks"), tTen = g("s6", "ten"), tTog = g("s6", "together");

// ---- fuel station: canopy on posts, pumps, kiosk ----
const station = (s) => {
  const at = (ds, o) => P(s + ds, o);
  for (const ds of [-9, -3]) { const [x, z] = at(ds, 10.2); scene.add(box(0.7, 1.6, 0.5, x, 0.8, z)); }
  const [kx, kz] = at(-4, 16); scene.add(box(4, 3, 5, kx, 1.5, kz));
};
const sA = 100, sB = 1400, park = (s0, i) => [s0 - 3 * i, 8.4];
station(sA); station(sB);

// ---- A: bikes 0..2 pull out at "rides"; bike 3 waits, its rider is inside paying ----
const vA = (i) => (t) => 11 * sm(tRides - 0.3 + 0.35 * i, tRides + 1.6 + 0.35 * i, t);
const DA = [0, 1, 2].map((i) => dist(vA(i), 0, T3 + 1));
const aPath = (i) => (t) => {
  const [s0, o0] = park(sA, i);
  if (i === 3) return P(s0, o0);
  const k = sm(tRides - 0.2 + 0.35 * i, tRides + 1.8 + 0.35 * i, t);
  return P(s0 + DA[i](t), o0 + (1.8 - o0) * k);
};
// ---- B: same stop, all four. Bikes 0..2 roll out slowly in s5, the sweep (3) leaves after "checks"; s6 all ride together ----
const tGo = (i) => (i < 3 ? T5 + 0.1 + 0.45 * i : tChk + 0.5);
const vB = (i) => (t) => (i < 3 ? 6 * sm(tGo(i), tGo(i) + 1.4, t) + 6 * sm(T6 - 0.3, T6 + 1.4, t) : 13 * sm(tGo(i), tGo(i) + 1.6, t) - 1 * sm(T6 + 1.5, T6 + 3, t));
const DB = B.map((_, i) => dist(vB(i), T3, T7 + 8));
const bPath = (i) => (t) => {
  const [s0, o0] = park(sB, i), k = sm(tGo(i), tGo(i) + 2.2, t);
  return P(s0 + DB[i](t), o0 + (1.8 - o0) * k);
};
const path = (i) => (t) => (t < T3 ? aPath(i)(t) : bPath(i)(t));

// ---- tags and zones ----
const tPay = tag("STILL PAYING", ORANGE), tAlone = tag("LEFT ALONE", RED);
const nums = [1, 2, 3, 4].map((n) => tag(String(n), GREEN)), tAll = tag("4 OF 4", GREEN), tSw = tag("SWEEP", ORANGE), tClear = tag("NOBODY LEFT", GREEN);
const aloneZ = patch(4, 4, RED, 1.1), lotZ = patch(5, 14, GREEN, 0.8);
const posAt = (s, o, z) => { const [x, zz] = P(s, o); z.position.set(x, 0.03, zz); };

title("NEVER LEAVE A STOP WITHOUT A HEAD COUNT");
cap("s2", "still", ["ONE RIDER IS", "STILL PAYING"], RED, { until: ["s2", "rides"] });
cap("s2", "rides", ["THE GROUP RIDES OFF.", "THEY'RE LEFT ALONE"], RED, { boom: 0.5 });
cap("s3", "leader", ["THE LEADER", "COUNTS THE BIKES"], GREEN);
cap("s4", "everyone", ["EVERYONE SHOWS", "THEY'RE READY"], GREEN, { until: ["s4", "thumb"] });
cap("s4", "thumb", ["HELMET ON, ENGINE ON,", "THUMB UP"], GREEN);
cap("s5", "sweep", ["THE SWEEP LEAVES LAST", "AND CHECKS"], GREEN);
cap("s6", "ten", ["TEN SECONDS OF COUNTING.", "EVERYONE LEAVES TOGETHER"], GREEN);
endCard(["COUNT THE BIKES.", "THEN RIDE."]);

const cam = (s, o, y, ls, lo, ly, f) => { const [x, z] = P(s, o), [lx, lz] = P(ls, lo); return [x, y, z, lx, ly, lz, f]; };
const fol = (fn) => (t) => pathState(fn, t);
const SH = [
  { at: 0, K: [[0, cam(sA - 22, 1, 8, sA - 4, 11.5, 1, 46)], [3, cam(sA - 20, 1.5, 7.5, sA - 4, 11.5, 1, 46)]] },
  { at: tRides - 0.4, K: [[0, cam(sA + 24, -1, 9, sA - 3, 8, 0.8, 48)], [3, cam(sA + 26, -1.5, 10, sA - 3, 8, 0.8, 48)]] },
  { at: tLeft - 0.3, K: [[0, cam(sA + 6, 6, 4, sA - 5, 10.5, 1.0, 46)], [3, cam(sA + 6.5, 5.5, 4.3, sA - 5, 10.5, 1.0, 46)]] },
  { at: T3, K: [[0, cam(sB - 24, 0, 8, sB - 4, 8.4, 1, 46)], [3, cam(sB - 22, 0.5, 7.5, sB - 4, 8.4, 1, 46)]] },
  { at: T4, K: [[0, cam(sB - 13, 3.5, 3.2, sB - 4, 8.4, 1.5, 46)], [3, cam(sB - 14, 3.2, 3.4, sB - 4, 8.4, 1.5, 46)]] },
  { at: T5, K: [[0, cam(sB - 30, -1, 11, sB - 2, 7.5, 0.5, 50)], [3, cam(sB - 31, -1.5, 12, sB, 7, 0.5, 50)]] },
  { at: T6, f: fol(bPath(3)), noRot: true, K: [[0, [-6, 8, 13, 1.8, 0, -16, 50]], [4, [-7, 10, 14, 1.8, 0, -20, 50]]] },
  { at: T7, f: fol(bPath(3)), noRot: true, K: [[0, [-8, 14, 16, 1.8, 0, -20, 50]], [4, [-9, 16, 18, 1.8, 0, -22, 50]]] },
];

run("w", (t) => {
  const { id } = sceneOf(t), A = t < T3;
  const sts = B.map((b, i) => ride(b, path(i), t, A ? (i === 3 ? RED : t > tRides ? RED : VIOLET) : GREEN, { trail: !A || i < 3 }));
  B[3].rider.visible = !A; // A: the payer is off the bike, inside
  // s4: everyone raises a hand when "thumb" is said; s5 sweep looks back
  LB.forEach((L, i) => L.set(id === "s4" && t > tThumb - 0.1 + 0.12 * i ? { arm: 1, armA: 2.4, armF: 0.1, glow: 1 } : {}));
  // engines on: tail lights glow from "ready"
  B.forEach((b) => b.tail.scale.setScalar(1 + (id === "s4" ? 1.5 * sm(tReady - 0.1, tReady + 0.3, t) : 0)));
  // payer: at the kiosk door, then steps out with an arm up after they're gone
  const kOut = sm(tLeft - 0.6, tLeft + 0.6, t), [px, pz] = P(sA - 2 - 1.5 * kOut, 13.4 - 2.4 * kOut);
  pose(payer, { x: px, z: pz, h: Math.PI / 2, vis: A, hex: t > tRides ? RED : null, armR: ARM.up * kOut, armL: 0 });
  tagAt(tPay, px, 2.6, pz, A && t > tStill - 0.1 && t < tLeft - 0.2 ? 1 : 0, 1.8);
  tagAt(tAlone, px, 2.6, pz, A && t > tLeft - 0.2 ? 1 : 0, 1.8);
  posAt(sA - 3.5, 11, aloneZ); aloneZ.set(A ? sm(tLeft - 0.2, tLeft + 0.3, t) : 0);
  // s3: count 1..4 over the bikes; s4 keeps "4 OF 4"
  nums.forEach((m, i) => tagAt(m, sts[i].x, 2.7, sts[i].z, id === "s3" && t > tCount - 0.1 + 0.3 * i ? 1 : 0, 2.2));
  tagAt(tAll, sts[1].x - 0.5, 3.4, sts[1].z + 1.5, id === "s3" && t > tCount + 1.1 ? 1 : 0, 1.8);
  // s5: the sweep tag; the lot lights green on "checks" (empty)
  tagAt(tSw, sts[3].x, 2.5, sts[3].z, id === "s5" ? sm(tSweep - 0.1, tSweep + 0.2, t) : 0, 1.6);
  posAt(sB - 5, 9.5, lotZ); lotZ.set(id === "s5" ? sm(tChk - 0.1, tChk + 0.4, t) : 0);
  { const [x, z] = P(sB - 3, 9); tagAt(tClear, x, 1.6, z, id === "s5" && t > tChk + 0.6 ? 1 : 0, 2.2); }
  const shot = shoot(SH, t);
  bloom.strength = 1.0 + 1.2 * shot.punch * shot.punch + overlays(t) + 0.4 * flash(t, tLeft) + 0.3 * flash(t, tCount) + 0.3 * flash(t, tTog);
});
