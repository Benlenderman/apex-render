// 81 let-cars-pass: ten bikes nose to tail, the car is stuck behind, loses patience and overtakes all ten at once (red).
// Right way: keep gaps so a car passes a few bikes at a time; split into smaller groups; never speed up to shut a car out.
import { THREE, S, g, sm, pulse, flash, scene, bloom, VIOLET, RED, GREEN, pathState, shoot, sceneOf, run, patch, makeCar } from "./kit.js";
import { track, buildRoad, title, endCard, cap, overlays, bikes, ride, dist } from "./extra.js";

scene.fog.density = 0.005;
const V = 11, N = 10, { P } = track([{ len: 4000 }]);
buildRoad(P, -200, 3600);
const B = bikes(N), CAR = makeCar({ color: 0x5246c8, driver: true });
const OFF = (i) => (i % 2 ? 2.6 : 1.0);
const T2 = S.s2[0], T3 = S.s3[0], T4 = S.s4[0], T5 = S.s5[0], T6 = S.s6[0], T7 = S.s7[0];
const tStuck = g("s2", "stuck"), tOver = g("s2", "overtakes");
const tGaps = g("s3", "gaps"), tFew = g("s3", "few");
const tSplit = g("s4", "split"), tSpeed = g("s5", "speed"), tRelax = g("s6", "relaxed");
const lead = (t) => 80 + V * t;
// ---- A: one tight line, 6 m apart; the car sits behind, then passes all ten on the other side ----
const aS = (i, t) => lead(t) - 6 * i;
const DO = dist((t) => 18 * sm(tOver - 0.2, tOver + 0.8, t), 0, T3 + 1);
const aCar = (t) => P(aS(N - 1, t) - 11 + DO(t), 1.8 - 3.6 * sm(tOver - 0.4, tOver + 0.5, t));
// ---- B: groups [0-2] [3-5] [6-9], gap G between them; bike 3 shuts the A-B gap in s5, then lets it open in s6 ----
const G = (t) => 26 + 30 * sm(tSplit - 0.2, tSplit + 2.2, t);
const shut = (t) => sm(tSpeed - 0.2, tSpeed + 1.4, t) * (1 - sm(tRelax - 1.2, tRelax + 0.8, t));
const gAB = (t) => G(t) - (G(t) - 6) * shut(t);
const bS = (i, t) => i < 3 ? lead(t) - 6 * i : i < 6 ? lead(t) - 12 - gAB(t) - 6 * (i - 3) : lead(t) - 24 - gAB(t) - G(t) - 6 * (i - 6);
// car: behind group C, passes its four bikes into the B-C gap (s3), waits there (s4),
// pulls out next to group B to reach the A-B gap but bike 3 closes it (s5), then slides in once it reopens (s6)
const k1 = (t) => sm(tFew - 1.0, tFew + 1.8, t), k2 = (t) => sm(tSpeed - 0.8, tSpeed + 0.8, t), k3 = (t) => sm(tRelax - 0.4, tRelax + 1.6, t);
const midBC = (t) => bS(5, t) - (G(t) + 6) / 2, midAB = (t) => bS(2, t) - (gAB(t) + 6) / 2;
const bCarS = (t) => { let s = bS(9, t) - 12; s += (midBC(t) - s) * k1(t); s += (bS(4, t) - s) * k2(t); s += (midAB(t) - s) * k3(t); return s; };
const out1 = (t) => sm(tFew - 1.3, tFew - 0.6, t) * (1 - sm(tFew + 1.0, tFew + 1.9, t));
const out2 = (t) => sm(tSpeed - 1.1, tSpeed - 0.4, t) * (1 - sm(tRelax + 0.4, tRelax + 1.5, t));
const bCar = (t) => P(bCarS(t), 1.8 - 3.6 * Math.max(out1(t), out2(t)));
const carPath = (t) => (t < T3 ? aCar(t) : bCar(t));
const path = (i) => (t) => P(t < T3 ? aS(i, t) : bS(i, t), OFF(i));

const lineZ = patch(3.2, 1, RED, 1.2), passZ = patch(3.2, 1, RED, 1.2), gz = [patch(3.2, 1, GREEN, 1.0), patch(3.2, 1, GREEN, 1.0)];
const strip = (m, a, b, o, k) => { const [x, z] = P((a + b) / 2, o); m.position.set(x, 0.03, z); m.scale.set(1, Math.max(0.1, Math.abs(b - a)), 1); m.set(k); };

title("NEVER RIDE SO TIGHT THAT A CAR CAN'T GET PAST");
cap("s2", "stuck", ["STUCK BEHIND", "TEN BIKES"], RED, { until: ["s2", "overtakes"] });
cap("s2", "overtakes", ["OVERTAKES ALL OF YOU", "AT ONCE"], RED, { boom: 0.5 });
cap("s3", "keep", "KEEP YOUR GAPS", GREEN, { until: ["s3", "few"] });
cap("s3", "few", ["A FEW BIKES", "AT A TIME"], GREEN);
cap("s4", "split", ["SPLIT INTO", "SMALLER GROUPS"], GREEN);
cap("s5", "never", ["NEVER SPEED UP TO STOP", "A CAR GETTING IN"], RED);
cap("s6", "relaxed", ["A RELAXED DRIVER", "IS A SAFER DRIVER"], GREEN);
endCard(["LEAVE GAPS.", "LET THEM PASS."]);

const fol = (fn) => (t) => pathState(fn, t);
const SH = [
  { at: 0, f: fol(path(5)), noRot: true, K: [[0, [-10, 10, 24, 1.6, 0, -16, 50]], [3, [-11, 11, 22, 1.6, 0, -18, 50]]] },
  { at: T2, f: fol(carPath), noRot: true, K: [[0, [-5, 3.4, 10, 1.4, 0.8, -6, 46]], [2, [-5.5, 3.6, 9, 1.4, 0.8, -7, 46]]] },
  { at: tOver - 0.3, f: fol(carPath), noRot: true, K: [[0, [-9, 12, 22, 0, 0, -20, 50]], [4, [-10, 14, 20, 0, 0, -24, 50]]] },
  { at: T3, f: fol(carPath), noRot: true, K: [[0, [-10, 14, 26, 1.0, 0, -20, 50]], [5, [-11, 16, 22, 1.0, 0, -20, 50]]] },
  { at: T4, f: fol(path(4)), noRot: true, K: [[0, [-12, 26, 36, 1.6, 0, -22, 50]], [4, [-13, 30, 34, 1.6, 0, -26, 50]]] },
  { at: T5, f: fol(path(3)), noRot: true, K: [[0, [-9, 8, 18, 1.0, 0.5, -10, 50]], [4, [-10, 9, 16, 1.0, 0.5, -12, 50]]] },
  { at: T6, f: fol(carPath), noRot: true, K: [[0, [-9, 8, 18, 1.4, 0.5, -10, 50]], [4, [-10, 10, 18, 1.4, 0.5, -12, 50]]] },
];

run("w", (t) => {
  const { id } = sceneOf(t), A = t < T3;
  const sts = B.map((b, i) => ride(b, path(i), t, A ? (t > tStuck - 0.3 ? RED : VIOLET) : id === "s5" && i >= 3 && i < 6 && shut(t) > 0.1 ? RED : GREEN));
  CAR.set(pathState(carPath, t));
  const cs = -pathState(carPath, t).z; // straight road along -z
  // A: red line = the wall of ten bikes; then the overtake lane
  strip(lineZ, aS(N - 1, t) - 1, aS(0, t) + 1, 4.3, A ? sm(tStuck - 0.1, tStuck + 0.4, t) * (1 - sm(tOver - 0.3, tOver, t)) : 0);
  strip(passZ, cs - 3, aS(0, t) + 8, -1.8, A ? sm(tOver, tOver + 0.4, t) * (1 - sm(T3 - 0.2, T3, t)) : 0);
  // B: green gaps between the groups (A-B gap goes away when bike 3 shuts it)
  const on = A || t > T7 ? 0 : sm(tGaps - 0.2, tGaps + 0.4, t);
  strip(gz[0], bS(3, t) + 1.2, bS(2, t) - 1.2, 1.8, on * (1 - shut(t)));
  strip(gz[1], bS(6, t) + 1.2, bS(5, t) - 1.2, 1.8, on);
  const shot = shoot(SH, t);
  bloom.strength = 1.0 + 1.2 * shot.punch * shot.punch + overlays(t) + 0.5 * flash(t, tOver) + (id === "s5" ? 0.4 * flash(t, tSpeed + 0.6) : 0);
});
