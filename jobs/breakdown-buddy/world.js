// 85 breakdown-buddy: a bike breaks down, the group rides on and leaves the rider alone on the shoulder with no signal (red).
// Right way: the sweep stops with them, both bikes pushed well off the road, both wait behind the barrier, the leader is told and the group waits further on, recovery arrives with nobody alone (green).
import { THREE, S, g, sm, flash, scene, bloom, box, VIOLET, ORANGE, RED, GREEN, pathState, shoot, sceneOf, run, patch, makeTruck } from "./kit.js";
import { track, buildRoad, makePerson, pose, ARM, title, endCard, cap, overlays, tag, tagAt, bikes, ride, dist } from "./extra.js";

scene.fog.density = 0.006;
const V = 12, { P } = track([{ len: 4000 }]);
buildRoad(P, -100, 3800, { lamps: false });
const B = bikes(5), pA = makePerson(), pS = makePerson(), TRK = makeTruck();
const T2 = S.s2[0], T3 = S.s3[0], T4 = S.s4[0], T5 = S.s5[0], T6 = S.s6[0], T7 = S.s7[0];
const tRides = g("s2", "rides"), tAlone = g("s2", "alone"), tSignal = g("s2", "signal");
const tSweep = g("s3", "sweep"), tStops = g("s3", "stops"), tPush = g("s4", "push"), tWait = g("s4", "wait"), tFront = g("s4", "front");
const tLeader = g("s5", "leader"), tAgree = g("s5", "agree"), tNobody = g("s6", "nobody"), tRec = g("s6", "recovery");

// ---- A: four ride; bike 3 (last) loses power and rolls onto the shoulder; the other three ride on ----
const tA0 = 1.2, tA1 = T2 + 0.6;
const D3A = dist((t) => V * (1 - sm(tA0, tA1, t)), 0, T3 + 1), stopA = 36 + D3A(T3);
const aPath = (i) => (t) => {
  if (i === 4) return null;
  if (i < 3) return P(60 + V * t - 8 * i, 1.8);
  const [x, z] = P(36 + D3A(t), 1.8 + 3.0 * sm(tA0 + 0.2, tA1 - 0.6, t));
  return t > tA1 ? [x, z, 0] : [x, z];
};
// ---- B: five ride; bike 3 breaks down again, the sweep (4) closes up and stops behind it; group (0..2) rides on, then pulls over at "agree" ----
const sB = 1500, kOff = (t) => sm(tPush, tPush + 1.5, t);
const DG = dist((t) => V * (1 - sm(tAgree - 1.6, tAgree + 0.4, t)), T3, T7 + 8), sG = sB + DG(T7 + 8);
const D3B = dist((t) => V * (1 - sm(T3 - 0.4, T3 + 1.6, t)), T3, T7 + 8), stop3 = sB - 24 + D3B(T7 + 8);
const s4B = (t) => sB - 24 + D3B(t) - (8 - 3.5 * sm(T3 - 0.4, T3 + 2.2, t)), stop4 = stop3 - 4.5;
const bPath = (i) => (t) => {
  if (i < 3) return P(sB + DG(t) - 8 * i, 1.8 + 3.0 * sm(tAgree - 1.2, tAgree + 0.3, t));
  const s = i === 3 ? sB - 24 + D3B(t) : s4B(t), w0 = i === 3 ? T3 : T3 + 0.3;
  const [x, z] = P(s, 1.8 + 3.0 * sm(w0, w0 + 1.4, t) + 1.4 * kOff(t));
  return t > T3 + 2.3 ? [x, z, 0] : [x, z];
};
const path = (i) => (t) => (t < T3 ? aPath(i)(t) : bPath(i)(t));
const sMid = (stop3 + stop4) / 2;

// ---- guard rail along the shoulder at offset 7.2 (rail + posts), around both stops ----
const rail = (s0, s1) => {
  const [x, z0] = P(s0, 7.2), [, z1] = P(s1, 7.2), L = Math.abs(z1 - z0);
  scene.add(box(0.12, 0.3, L, x, 0.65, (z0 + z1) / 2));
  for (let s = s0; s <= s1; s += 3) { const [px, pz] = P(s, 7.2); scene.add(box(0.12, 0.65, 0.12, px, 0.32, pz, undefined, false)); }
};
rail(stopA - 30, stopA + 30); rail(stop3 - 40, stop3 + 40);

// ---- recovery truck in s6: rolls in from behind and parks on the shoulder ahead of the bikes ----
const tEnd = T6 + 2.6, sT = stop3 + 22;
const truckPath = (t) => {
  if (t < T6 - 0.2) return null;
  const d = Math.max(0, tEnd - t), [x, z] = P(sT - 4.5 * d * d, 1.8 + 2.8 * sm(tEnd - 2.0, tEnd - 0.2, t));
  return d < 0.15 ? [x, z, 0] : [x, z];
};

// ---- tags and zones ----
const tgAlone = tag("ALONE", RED), tgSig = tag("NO SIGNAL", RED), tgSw = tag("SWEEP", ORANGE), tgCall = tag("CALLING LEADER", ORANGE), tgWait = tag("GROUP WAITS HERE", GREEN);
const aloneZ = patch(4, 5, RED, 1.1), frontZ = patch(2.6, 14, RED, 1.1), behindZ = patch(2.2, 14, GREEN, 0.9), groupZ = patch(3, 24, GREEN, 0.8);
const posAt = (s, o, m) => { const [x, z] = P(s, o); m.position.set(x, 0.03, z); };

title("NEVER LEAVE A RIDER ALONE WITH A BROKEN BIKE");
cap("s2", "group", ["THE GROUP", "RIDES ON"], RED, { until: ["s2", "alone"] });
cap("s2", "alone", ["ONE RIDER ALONE,", "MAYBE NO SIGNAL"], RED, { boom: 0.5 });
cap("s3", "sweep", ["THE SWEEP STOPS", "WITH THEM"], GREEN);
cap("s4", "push", ["PUSH THE BIKE", "WELL OFF THE ROAD"], GREEN, { until: ["s4", "wait"] });
cap("s4", "wait", ["WAIT BEHIND THE BARRIER,", "NOT IN FRONT OF IT"], GREEN);
cap("s5", "let", ["TELL THE LEADER"], GREEN, { until: ["s5", "agree"] });
cap("s5", "agree", ["AGREE WHERE", "THE GROUP WAITS"], GREEN);
cap("s6", "nobody", ["NOBODY WAITS FOR", "RECOVERY ALONE"], GREEN);
endCard(["THE SWEEP STAYS.", "NOBODY IS LEFT ALONE."]);

const cam = (s, o, y, ls, lo, ly, f) => { const [x, z] = P(s, o), [lx, lz] = P(ls, lo); return [x, y, z, lx, ly, lz, f]; };
const fol = (fn) => (t) => pathState(fn, t);
const SH = [
  { at: 0, f: fol(aPath(3)), noRot: true, K: [[0, [-4, 5, 10, 1.5, 0.6, -14, 50]], [3, [-5, 6, 9, 2.0, 0.6, -16, 50]]] },
  { at: tRides - 0.3, K: [[0, cam(stopA - 10, -1.5, 3.5, stopA + 14, 4.5, 1, 46)], [3, cam(stopA - 11, -2, 3.8, stopA + 16, 4.5, 1, 46)]] },
  { at: tAlone - 0.3, K: [[0, cam(stopA - 9, 0.5, 3.4, stopA + 0.5, 5.6, 1.4, 44)], [3, cam(stopA - 9.5, 0.3, 3.6, stopA + 0.5, 5.6, 1.4, 44)]] },
  { at: T3, f: fol(bPath(4)), noRot: true, K: [[0, [-4, 5, 10, 1.0, 0.6, -12, 50]], [4, [-5, 6, 9, 2.0, 0.6, -12, 50]]] },
  { at: T4, K: [[0, cam(sMid - 10, -2, 5.5, sMid, 7, 0.5, 46)], [4, cam(sMid - 11, -2.5, 6, sMid, 7, 0.5, 46)]] },
  { at: T5, K: [[0, cam(sMid - 10, 3.0, 3.4, sMid, 8.0, 1.5, 44)], [3, cam(sMid - 10.5, 2.8, 3.6, sMid, 8.0, 1.5, 44)]] },
  { at: tAgree - 0.3, K: [[0, cam(sG - 30, -1, 12, sG - 6, 4.5, 0, 48)], [3, cam(sG - 31, -1.5, 13, sG - 6, 4.5, 0, 48)]] },
  { at: T6, K: [[0, cam(stop3 + 10, 10.5, 3.2, stop3 - 10, 4, 0.8, 50)], [4, cam(stop3 + 11, 11, 3.6, stop3 - 10, 4, 0.8, 50)]] },
  { at: T7, K: [[0, cam(stop3 - 30, -3, 18, stop3 + 8, 6, 0, 50)], [4, cam(stop3 - 32, -4, 20, stop3 + 8, 6, 0, 50)]] },
];

run("w", (t) => {
  const { id } = sceneOf(t), A = t < T3;
  const sts = B.map((b, i) => ride(b, path(i), t, A ? (i === 3 || t > tRides ? RED : VIOLET) : GREEN, { trail: !(i >= 3 && (A ? t > tA1 : t > T3 + 2.3)) }));
  B.forEach((b, i) => b.sig(i === 3 && (A ? t > tA0 : true) ? 2 : 0, t));
  // riders step off: A bike 3 at T2+0.8; B bikes 3 and 4 at T4
  const offA = A && t > T2 + 0.8, offB = !A && t > T4 - 0.2;
  B[3].rider.visible = !(offA || offB); B[4].rider.visible = !offB;
  // A: the stranded rider stands by the bike, phone up at "signal"
  if (A) {
    const [x, z] = P(stopA + 0.4, 6.0);
    pose(pA, { x, z, h: Math.PI / 2, vis: offA, hex: RED, armR: ARM.up * 0.85 * sm(tSignal - 0.4, tSignal, t) });
    tagAt(tgAlone, x, 2.4, z, offA && t > tAlone - 0.1 && t < tSignal - 0.2 ? 1 : 0, 1.2);
    tagAt(tgSig, x, 2.4, z, offA && t > tSignal - 0.2 ? 1 : 0, 1.2);
    posAt(stopA, 5.5, aloneZ); aloneZ.set(sm(tAlone - 0.2, tAlone + 0.3, t));
  } else aloneZ.set(0);
  // B: both riders push alongside, then walk behind the rail at "wait"
  const kW = sm(tWait - 0.3, tWait + 1.0, t), oP = 5.6 + 1.4 * kOff(t);
  for (const [p, s, ds] of [[pA, stop3, -0.6], [pS, stop4, 0.6]]) {
    if (A && p === pA) continue;
    const [x, z] = P(s + ds * kW, oP + (8.6 - oP) * kW);
    pose(p, { x, z, h: Math.PI / 2, vis: offB, hex: GREEN, armR: p === pS && id === "s5" ? ARM.up * 0.85 * sm(tLeader - 0.4, tLeader, t) : 0 });
  }
  if (A) pS.g.visible = false;
  // red: in front of the rail (road side); green: behind it
  posAt(sMid, 5.7, frontZ); frontZ.set(id === "s4" ? sm(tFront - 0.2, tFront + 0.2, t) : 0);
  posAt(sMid, 8.7, behindZ); behindZ.set(!A && t > tWait - 0.1 ? sm(tWait - 0.1, tWait + 0.4, t) : 0);
  // tags: sweep in s3, call in s5, group stop in s5
  tagAt(tgSw, sts[4]?.x ?? 0, 2.5, sts[4]?.z ?? 0, id === "s3" && sts[4] ? sm(tSweep - 0.1, tSweep + 0.2, t) : 0, 1.6);
  { const [x, z] = P(stop4 + 0.3, 7.6); tagAt(tgCall, x, 2.6, z, id === "s5" && t < tAgree - 0.3 ? sm(tLeader - 0.1, tLeader + 0.2, t) : 0, 1.3); }
  posAt(sG - 8, 4.8, groupZ); groupZ.set(id === "s5" ? sm(tAgree, tAgree + 0.5, t) : 0);
  { const [x, z] = P(sG - 8, 5); tagAt(tgWait, x, 2.6, z, id === "s5" && t > tAgree + 0.3 ? 1 : 0, 2.6); }
  TRK.set(id === "s6" || id === "s7" ? pathState(truckPath, t) : null);
  const shot = shoot(SH, t);
  bloom.strength = 1.0 + 1.2 * shot.punch * shot.punch + overlays(t) + 0.4 * flash(t, tAlone) + 0.3 * flash(t, tStops) + 0.3 * flash(t, tNobody);
});
