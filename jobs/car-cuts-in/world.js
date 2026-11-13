// 80 car-cuts-in: a car cuts into the group; the riders behind tailgate it to stay together, car boxed in (red).
// Right way: let it in, drop back to a safe gap behind it; riders ahead ride their own ride; group regroups at the next stop.
import { THREE, S, g, sm, pulse, flash, scene, bloom, VIOLET, RED, GREEN, pathState, shoot, sceneOf, run, patch, makeCar } from "./kit.js";
import { track, buildRoad, title, endCard, cap, overlays, bikes, ride, dist } from "./extra.js";

scene.fog.density = 0.006;
const V = 11, N = 6, SP = 12, { P } = track([{ len: 3000 }]);
buildRoad(P, -200, 2600);
const B = bikes(N), CAR = makeCar({ color: 0x5246c8 });
const OFF = (i) => (i % 2 ? 2.6 : 1.0);
const T2 = S.s2[0], T3 = S.s3[0], T4 = S.s4[0], T5 = S.s5[0], T6 = S.s6[0], T7 = S.s7[0];
const tCut = g("s1", "cuts"), tTail = g("s2", "tailgate"), tBox = g("s2", "boxed");
const tDrop = g("s3", "drop"), tGap = g("s3", "gap");
const tWait = g("s5", "waits"), tRider = g("s6", "rider");
const kBad = (t) => sm(tRider - 0.2, tRider + 0.8, t) * (1 - sm(T7 - 0.3, T7, t));
// the group, nose s0 + V t; slot c is the car's place between bike 2 and bike 3 (centre -2.5 SP)
const s0 = 60, lead = (t) => s0 + V * t;
const kIn = (t) => sm(tCut - 0.6, tCut + 0.9, t);
const kTail = (t) => sm(tTail - 0.2, tTail + 1.0, t) * (1 - sm(T3 - 0.1, T3 + 0.01, t));
const kDrop = (t) => (t >= T3 ? sm(tDrop - 0.3, tDrop + 1.6, t) : 0);
// car: overtakes on the other lane, cuts into the slot, then holds V
const carS = (t) => lead(t) - 2.5 * SP;
const carO = (t) => -1.8 + 3.6 * kIn(t);
const carPath = (t) => P(carS(t) - 26 * (1 - sm(-0.5, tCut + 0.2, t)), carO(t));
// rear bikes: before the cut normal spacing; tailgate = 2.5 m off the car's bumper; right way = 22 m gap behind the car
const rear = (i, t) => {
  const j = i - 3, normal = lead(t) - SP * i, bumper = carS(t) - 2.15 - 2.4 - 6 * j, safe = carS(t) - 2.15 - 22 - SP * j;
  const yieldBack = -4 * sm(tCut - 0.8, tCut + 0.2, t) * (1 - kTail(t)); // bike 3 eases off as the car swings in
  return normal + yieldBack + (bumper - normal) * kTail(t) + (safe - normal) * kDrop(t) + (bumper - safe) * kBad(t);
};
// the regroup stop: everyone pulls onto the right shoulder at sStop; the car drives on
const tStop = tWait - 1.6, sStop = lead(tWait) + 6;
const kPark = (i, t) => sm(tStop + (i >= 3 ? 1.8 : 0), tStop + (i >= 3 ? 3.4 : 1.6), t);
const DF = dist((t) => V * (1 - sm(tStop, tStop + 1.8, t)), 0, T7 + 6), DR = dist((t) => V * (1 - sm(tStop + 1.4, tStop + 3.6, t)), 0, T7 + 6);
const bPath = (i) => (t) => {
  if (t < T5 - 0.2 || t > T6) {
    const s = i < 3 ? lead(t) - SP * i : rear(i, t);
    return P(s, OFF(i));
  }
  // s5: front three brake and park on the shoulder, rear three arrive behind them
  const front = i < 3, D = front ? DF : DR, sNow = (front ? lead(T5 - 0.2) - SP * i : rear(i, T5 - 0.2)) + D(t) - D(T5 - 0.2);
  return P(Math.min(sNow, sStop - 7 * i), OFF(i) + (4.7 - OFF(i)) * kPark(i, t));
};

const gapZ = patch(3.2, 1, GREEN, 1.0), tailZ = patch(2.6, 1, RED, 1.4), boxZ = patch(3.2, 1, RED, 1.2), stopZ = patch(2.6, 1, GREEN, 0.9);
const strip = (m, a, b, o, k) => { const [x, z] = P((a + b) / 2, o); m.position.set(x, 0.03, z); m.scale.set(1, Math.max(0.1, Math.abs(b - a)), 1); m.set(k); };

title("NEVER CLOSE UP ON A CAR THAT CUTS INTO THE GROUP");
cap("s2", "tailgate", ["THE RIDERS BEHIND", "TAILGATE THE CAR"], RED, { until: ["s2", "boxed"] });
cap("s2", "boxed", ["THE CAR IS BOXED IN", "BY BIKES"], RED, { boom: 0.5 });
cap("s3", "let", "LET IT IN", GREEN, { until: ["s3", "drop"] });
cap("s3", "drop", ["DROP BACK TO", "A SAFE GAP BEHIND IT"], GREEN);
cap("s4", "ahead", ["THE RIDERS AHEAD", "RIDE THEIR OWN RIDE"], GREEN);
cap("s5", "waits", ["THE GROUP WAITS", "AT THE NEXT TURN OR STOP"], GREEN);
cap("s6", "one", "ONE CAR IN THE GROUP IS FINE", GREEN, { until: ["s6", "rider"] });
cap("s6", "rider", ["A RIDER IN ITS BUMPER", "ISN'T"], RED);
endCard(["LET IT IN.", "KEEP YOUR GAP."]);

const fol = (fn) => (t) => pathState(fn, t);
const SH = [
  { at: 0, f: fol(carPath), noRot: true, K: [[0, [-9, 8, 18, 2, 0.5, -10, 50]], [3, [-10, 9, 16, 2, 0.5, -12, 50]]] },
  { at: T2, f: fol(bPath(3)), noRot: true, K: [[0, [-4.5, 4, 8, 0.5, 0.8, -6, 48]], [3, [-4.5, 4.2, 7, 0.5, 0.8, -6, 48]]] },
  { at: tBox - 0.3, f: fol(carPath), noRot: true, K: [[0, [-10, 18, 16, 1.5, 0, -2, 50]], [3, [-11, 20, 15, 1.5, 0, -2, 50]]] },
  { at: T3, f: fol(bPath(3)), noRot: true, K: [[0, [-3, 6, 13, 0, 0.6, -10, 50]], [4, [-3.5, 7.5, 15, 0, 0.6, -14, 50]]] },
  { at: T4, f: fol(bPath(1)), noRot: true, K: [[0, [-6, 4, 8, 1.6, 0.8, -6, 48]], [3, [-6.5, 4.5, 7, 1.6, 0.8, -8, 48]]] },
  { at: T5, K: [[0, (() => { const [x, z] = P(sStop - 40, -6), [lx, lz] = P(sStop - 10, 4.2); return [x, 9, z, lx, 0.5, lz, 50]; })()], [5, (() => { const [x, z] = P(sStop - 46, -7), [lx, lz] = P(sStop - 16, 4.2); return [x, 10, z, lx, 0.5, lz, 50]; })()]] },
  { at: T6, f: fol(carPath), noRot: true, K: [[0, [-12, 22, 26, 1.5, 0, -6, 52]], [4, [-13, 24, 24, 1.5, 0, -8, 52]]] },
];

run("w", (t) => {
  const { id } = sceneOf(t), A = t < T3, inS5 = t >= T5 - 0.2 && t <= T6;
  const sts = B.map((b, i) => ride(b, bPath(i), t, (A && i >= 3 && t > tTail - 0.3) || (i === 3 && kBad(t) > 0.3) ? RED : !A && i === 3 ? GREEN : VIOLET));
  const cs = carS(t) - 26 * (1 - sm(-0.5, tCut + 0.2, t));
  CAR.set(pathState(carPath, t), 0.12 * Math.sin(Math.PI * kIn(t)) * (t < tCut + 1 ? -1 : 0));
  // red: rider 3 in the car's bumper; boxed: red under the car on boxed
  const r3 = -sts[3].z;
  strip(tailZ, r3 + 1, cs - 2.15, 1.8, A ? sm(tTail, tTail + 0.6, t) * (1 - sm(T3 - 0.2, T3, t)) : kBad(t));
  strip(boxZ, cs - 2.4, cs + 2.4, 1.8, A ? pulse(t, tBox - 0.1, T3 - 0.3) : 0);
  // green: the safe gap behind the car
  strip(gapZ, r3 + 1, cs - 2.4, 1.8, !A && !inS5 && t < T7 ? sm(tGap - 0.2, tGap + 0.4, t) * (1 - kBad(t)) : 0);
  { const [x, z] = P(sStop - 18, 4.7); stopZ.position.set(x, 0.03, z); stopZ.scale.set(1, 46, 1); stopZ.set(id === "s5" ? sm(tWait - 0.2, tWait + 0.4, t) : 0); }
  const shot = shoot(SH, t);
  bloom.strength = 1.0 + 1.2 * shot.punch * shot.punch + overlays(t) + 0.5 * flash(t, tCut);
});
