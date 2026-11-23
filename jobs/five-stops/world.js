// 155 five-stops: one rider, one car pulling out, the same brake point five times.
// 1 rear only (hits), 2 front grab (goes down), 3 too gentle (hits), 4 grab + ABS (stops close), 5 squeeze (room to spare).
import { THREE, S, g, sm, scene, bloom, glow, patch, box, mAsph, mFrame, makeCar, VIOLET, RED, GREEN, WHITE, mSolid, pathState, shoot, run } from "./kit.js";
import { track, ribbon, buildRoad, title, endCard, cap, boom, overlays, bikes, ride, dist, tag, tagAt, END, makePerson, pose, downLean } from "./extra.js";

const T2 = S.s2[0], T3 = S.s3[0], T4 = S.s4[0], T5 = S.s5[0], T6 = S.s6[0], T7 = S.s7[0], T8 = S.s8[0], TE = END("s8");

// ---- the junction: main road north (-z), side road joins from the right at s = J ----
const J = 100, LW = 3.6;
const { P } = track([{ len: 900 }]);
buildRoad(P, -60, J + 250, { LW, lamps: true, gaps: [[J - 4.1, J + 4.1, 1]] });
const P2 = (s, o) => [LW + s, -J + o];
ribbon(P2, -3.7, 3.7, 0.4, 70, mAsph);
for (const sd of [-1, 1]) ribbon(P2, sd * 3.6 - 0.04, sd * 3.6 + 0.04, 0.9, 70, mFrame, 0.02, 0.5);
for (let s = 6; s < 70; s += 4) ribbon(P2, -0.06, 0.06, s, s + 1.6, glow(VIOLET, 1.1), 0.012, 0.4);

// the car: D = metres driven. 0..4.4 pulls out and blocks the lane, beyond that it turns left and leaves
const car = makeCar({ driver: true }), ZC = -J - 1.6;
const carSt = (D) => {
  const a = (D - 4.4) / 4;
  if (D < 4.4) return { x: 6.6 - D, z: ZC, h: Math.PI / 2 };
  if (a < Math.PI / 2) return { x: 2.2 - 4 * Math.sin(a), z: ZC + 4 - 4 * Math.cos(a), h: Math.PI / 2 + a };
  return { x: -1.8, z: ZC + 4 + (D - 4.4 - 2 * Math.PI), h: Math.PI };
};
const pull = (e) => 4.4 * sm(0, 1.3, e);
const carGo = dist((t) => 6 * sm(T7, T7 + 1.2, t), T7 - 0.1, TE + 1);

// ---- the five runs: 22 m/s, brake at the same point S0, 40 m before the car; a = deceleration, k = playback speed ----
const V = 22, SHIT = J - 0.6, S0 = SHIT - 40, X = 1.8;
const eHit = (a) => (V - Math.sqrt(V * V - 80 * a)) / a; // seconds from brake to the car
const tSq = g("s6", "squeezes") + 0.2, tStop5 = g("s6", "stops"), tLocks = g("s3", "locks");
const R = [
  null,
  { tb: g("s2", "slows") - eHit(3.43), k: 1, a: 3.43, crash: true }, // rear only, about 0.35 g
  { tb: tLocks, k: 0.6, a: 4.9, crash: true }, // front locked, then sliding on its side
  { tb: g("s4", "out") - eHit(4.9), k: 1, a: 4.9, crash: true }, // both, too gentle, 0.5 g
  { tb: g("s5", "stops") + 0.15 - V / 6.9, k: 1, a: 6.9 }, // ABS cycling, 0.7 g
  { tb: tSq, k: V / 9.3 / (tStop5 - tSq), a: 9.3 }, // progressive squeeze, 0.95 g
];
const dBr = (e, a) => (e < 0 ? V * e : e < V / a ? V * e - (a * e * e) / 2 : (V * V) / (2 * a));
const pos = (i, t) => { const r = R[i], s = S0 + dBr(r.k * (t - r.tb), r.a); return r.crash ? Math.min(s, SHIT) : s; };
const GO = dist((t) => 14 * sm(T8 - 0.3, T8 + 2, t), T8 - 0.4, TE + 1); // he rides on under the CTA
const fn = [(t) => [X, -(S0 + 14 - 11 * (T2 - t)), 0], ...[1, 2, 3, 4].map((i) => (t) => [X, -pos(i, t), 0]), (t) => [X, -(pos(5, t) + GO(t)), 0]];
const runOf = (t) => (t < T2 ? 0 : t < T3 ? 1 : t < T4 ? 2 : t < T5 ? 3 : t < T6 ? 4 : 5);
const tI1 = g("s2", "slows"), tI3 = g("s4", "out");
boom("s2", "slows", 0.8); boom("s4", "out", 0.8);

// ---- props ----
const [Br, Bv, Bg] = bikes(3);
const suit = (B, hex) => { const m = mSolid.clone(); m.color.set(hex); if (m.emissive) m.emissive.set(hex).multiplyScalar(0.4); B.rider.traverse((o) => { if (o.material === mSolid) o.material = m; }); B.visor.material = glow(hex, 2.4); };
suit(Br, RED); suit(Bg, GREEN);
const hand = box(0.14, 0.11, 0.14, 0.39, 1.09, -0.5, glow(GREEN, 3), false); Bg.lean.add(hand);
const faller = makePerson();
for (const m of Object.values(faller.mats)) { m.color.set(RED); m.emissive.set(RED).multiplyScalar(0.4); }
faller.visor.material = glow(RED, 2.4);
const skid = box(0.14, 0.02, 1, X, 0.025, 0, glow(RED, 2), false); scene.add(skid);
const hitP = patch(3.2, 3.2, RED, 1.6); hitP.position.set(X, 0.03, -SHIT);
const room = patch(3.0, 13.4, GREEN, 1.6); room.position.set(X, 0.03, -(J - 6.5));
const tAbs = tag("ABS", WHITE, 1.4);

title("SAME STOP. FIVE WAYS.");
cap("s2", "one", ["WAY 1", "REAR ONLY"], RED, { until: ["s2", "back"] });
cap("s2", "back", ["REAR WHEEL", "LOCKS"], RED, { until: ["s2", "barely"] });
cap("s2", "barely", ["BARELY", "SLOWS"], RED);
cap("s3", "two", ["WAY 2", "FRONT GRAB"], RED, { until: ["s3", "wheel"] });
cap("s3", "wheel", ["FRONT WHEEL", "LOCKS"], RED, { until: ["s3", "bike"], boom: 0.5 });
cap("s3", "bike", ["THE BIKE", "GOES DOWN"], RED);
cap("s4", "three", ["WAY 3", "TOO GENTLE"], RED, { until: ["s4", "just"] });
cap("s4", "just", ["OUT OF", "ROAD"], RED);
cap("s5", "four", ["WAY 4", "GRAB + ABS"], WHITE, { until: ["s5", "he"] });
cap("s5", "he", ["STAYS UP.", "STOPS CLOSE."], WHITE);
cap("s6", "five", ["WAY 5", "SQUEEZE"], GREEN, { until: ["s6", "then"] });
cap("s6", "then", ["THEN SQUEEZE", "HARDER"], GREEN, { until: ["s6", "little"] });
cap("s6", "little", ["A LITTLE", "REAR"], GREEN, { until: ["s6", "stops"] });
cap("s6", "stops", ["ROOM", "TO SPARE"], GREEN);
endCard(["SQUEEZE.", "DON'T GRAB."]);

// ---- shots ----
const fol = (f) => (t) => pathState(f, t);
const behind = (at, i, dur) => ({ at, f: fol(fn[i]), K: [[0, [0.9, 2.6, 6.5, 1.5, 1.0, -10, 50]], [dur, [0.6, 2.2, 5.0, 1.5, 1.0, -10, 50]]] });
// high view from behind the bike: the bike at the bottom, the car at the top, the gap between them; keeps drifting after the stop
const high = (at, i, side, hgt = 5.5) => ({ at, f: null, cam: (t, su) => { const zb = fn[i](t)[1]; return [X + side * (2.4 - 0.3 * su), hgt + 0.25 * su, zb + 8.5 - 0.3 * su, X, 0.4, zb + 0.24 * (ZC - zb) - 1, 50]; } });
const tFive = g("s1", "five") - 0.1, tThen = g("s6", "then") - 0.1;
const SH = [
  behind(0, 0, tFive), high(tFive, 0, 1, 6.5),
  behind(T2, 1, R[1].tb + 0.5 - T2), high(R[1].tb + 0.5, 1, -1),
  { at: T3, f: fol(fn[2]), K: [[0, [-3.4, 1.2, -4.6, 0, 1.9, -0.2, 46]], [tLocks - T3, [-3.0, 1.1, -3.8, 0, 1.8, -0.2, 46]]] }, // low on the front wheel
  high(tLocks + 0.25, 2, 1, 4.6),
  behind(T4, 3, 1.1), high(T4 + 1.1, 3, -1),
  behind(T5, 4, R[4].tb + 0.5 - T5), high(R[4].tb + 0.5, 4, 1),
  { at: T6, f: fol(fn[5]), K: [[0, [4.6, 1.4, 0.9, 0, 1.75, 0.2, 44]], [tThen - T6, [4.0, 1.3, 0.4, 0, 1.75, 0.2, 44]]] }, // the hand on the lever
  high(tThen, 5, -1),
  { at: T7, f: null, cam: (t, su) => { const zb = fn[5](t)[1]; return [X - 5.5 + 1.6 * su, 3.4 + 0.4 * su, zb + 10 - 0.8 * su, X, 0.2, zb - 4, 50]; } },
  { at: T8 - 0.05, f: (t) => ({ x: 1.5, z: fn[5](t)[1], h: 0 }), K: [[0, [-2.0, 6.5, 6.0, 0, 0, 2.5, 50]], [TE - T8, [1.6, 7.5, 7.0, 0, 0, 3.0, 50]]] },
];

run("w", (t) => {
  const i = runOf(t), r = R[i], e = r ? r.k * (t - r.tb) : -1;
  car.set(carSt(i === 0 ? pull(0.6 * (t - g("s1", "pulling"))) : t >= T7 ? 4.4 + carGo(t) : pull(e + 0.9)));
  // red rider: ways 1 to 3
  const hit = i === 1 ? sm(tI1, tI1 + 0.25, t) : i === 3 ? sm(tI3, tI3 + 0.25, t) : 0;
  const k2 = i === 2 ? sm(tLocks + 0.5, g("s3", "goes") + 0.15, t) : 0; // the fall, timed to "goes down"
  const slide = i === 1 && e > 0 && !hit ? sm(0, 0.3, e) : 0; // locked rear wheel steps out
  ride(Br, i >= 1 && i <= 3 ? fn[i] : null, t, RED, i === 2 ? { lean: downLean(k2, -1), down: k2, trail: k2 < 0.1 } : { lean: 0.45 * hit + 0.1 * slide * Math.sin(7 * e), h: 0.17 * slide * Math.sin(7 * e) });
  const zb = i >= 1 && i <= 3 ? -pos(i, t) : 0;
  pose(faller, { x: X + 1.2, z: zb - 1.6, h: 0.3, lie: 1, vis: k2 >= 0.5, hex: RED });
  const sk = i === 1 ? [S0 + 0.68, zb + 0.68] : i === 2 ? [S0 - 0.68, Math.min(zb, S0 + 22 * 0.6 * 0.5) - 0.68 + 0.01] : null; // rear mark for way 1, short front mark for way 2
  skid.visible = !!sk && sk[1] - sk[0] > 0.1;
  if (skid.visible) { skid.scale.z = sk[1] - sk[0]; skid.position.z = -(sk[0] + sk[1]) / 2; }
  hitP.set(0.9 * hit);
  // violet rider: the opening and way 4 (ABS)
  ride(Bv, i === 0 || i === 4 ? fn[i] : null, t, VIOLET);
  tagAt(tAbs, X, 2.5, -(i === 4 ? pos(4, t) : 0), i === 4 ? sm(g("s5", "abs") - 0.1, g("s5", "abs") + 0.15, t) : 0, 1.6);
  // green rider: way 5, then he rides on
  ride(Bg, i === 5 ? fn[5] : null, t, GREEN, { trail: t < T8 - 0.05 });
  hand.visible = i === 5 && t < T7;
  room.set(i === 5 ? 0.9 * sm(tStop5, tStop5 + 0.4, t) * (1 - sm(T8 - 0.5, T8 - 0.1, t)) : 0);
  // front dives while the front brake works (not for the rear-only way)
  const dive = r && i !== 1 && i !== 2 ? -0.07 * (r.a / 9.8) * sm(0, 0.3, e) * (1 - sm(V / r.a - 0.25, V / r.a, e)) * (1 - hit) : 0;
  for (const B of [Br, Bv, Bg]) B.lean.rotation.x = dive;
  const shot = shoot(SH, t);
  bloom.strength = 0.8 + 1.2 * shot.punch * shot.punch + overlays(t);
});
