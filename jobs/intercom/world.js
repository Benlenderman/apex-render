// 90 intercom: two riders chatting on the intercom through a busy junction, a car pulls out, the follower brakes late (red).
// Right way: hazards only in the hard parts, the leader calls gravel / car turning / stopping; chat on the straights (green).
import { THREE, S, g, sm, flash, scene, bloom, box, glow, VIOLET, ORANGE, RED, GREEN, pathState, shoot, sceneOf, run, patch, beam, makeCar } from "./kit.js";
import { track, buildRoad, title, endCard, cap, overlays, bikes, ride, dist } from "./extra.js";

scene.fog.density = 0.008;
const V = 10, T2 = S.s2[0], T3 = S.s3[0], T4 = S.s4[0], T5 = S.s5[0], T6 = S.s6[0], T7 = S.s7[0];
const tJ = g("s2", "junction"), tMind = g("s2", "mind");
const tGravel = g("s4", "gravel"), tCar = g("s4", "car"), tStopW = g("s4", "stopping"), tChat = g("s5", "chat"), tWarn = g("s6", "warning");

// ---- roads: main road + a cross road at J for part A ----
const J = 160, { P } = track([{ len: 2000 }]);
buildRoad(P, -60, 2000, { lamps: false, gaps: [[J - 4.6, J + 4.6, -1], [J - 4.6, J + 4.6, 1]] });
const P2 = (s, o = 0) => [s, -J + o];
buildRoad(P2, -160, -4.2, { lamps: false }); buildRoad(P2, 4.2, 160, { lamps: false });
const [L, F] = bikes(2), carA = makeCar({ driver: true }), carB = makeCar({ color: 0x5246c8 });

// ---- intercom meters: 4 bars above each helmet + the channel beam between helmets ----
const meter = (B) => {
  const m = glow(GREEN, 2.2), bars = [0, 1, 2, 3].map((i) => { const b = box(0.06, 0.22, 0.06, -0.135 + i * 0.09, 0.42, 0, m, false); B.headG.add(b); return b; });
  return { m, set(level, hex, t, seed) { bars.forEach((b, i) => { const k = level * (0.25 + 0.75 * Math.abs(Math.sin(t * (7 + 2.3 * i) + seed + i))); b.visible = k > 0.03; b.scale.y = Math.max(0.05, k); b.position.y = 0.42 + 0.11 * (b.scale.y - 1); }); m.color.set(hex).multiplyScalar(2.2); } };
};
const mL = meter(L), mF = meter(F), link = beam(GREEN, 1.0, 0.02);
const va = new THREE.Vector3(), vb = new THREE.Vector3();

// ---- part A: follower 12 m behind, chatting; car rolls out of the left road at the junction, follower brakes late ----
const sStop = J - 5.2, tB = tMind - 0.15, DF = dist((t) => V * (1 - sm(tB, tB + 0.9, t)), 0, T3 + 1), sF0 = sStop - DF(T3 + 1);
const aF = (t) => P(sF0 + DF(t), 2.3), aL = (t) => P(sF0 + 12 + V * t, 1.3);
const tCo = tJ - 0.2, DC = dist((t) => 7 * (1 - sm(tB + 0.1, tB + 0.7, t)), tCo, T3 + 1), cX0 = 0.6 - DC(T3 + 1);
const carAPath = (t) => (t < T3 ? P2(cX0 + DC(Math.max(tCo, t)), 1.8) : null);
const hitZ = patch(4, 4.5, RED, 1.2); { const [x, z] = P2(1.6, 2.4); hitZ.position.set(x, 0.03, z); }

// ---- part B: long road far past the junction ----
const sB = J + 300, tSlow = tStopW - 0.2, tGo = T5 + 0.1;
const DB = dist((t) => V * (1 - sm(tSlow, tSlow + 1.0, t)) + V * sm(tGo, tGo + 1.2, t) * (t > tGo ? 1 : 0), T3, T7 + 4);
const bL = (t) => P(sB + 8 + DB(t), 1.3), bF = (t) => P(sB + DB(t), 2.3);
// gravel ahead on "gravel"; on "car" a car ahead turns off to the right
const grav = patch(3.0, 6, ORANGE, 0.9); { const [x, z] = P(sB + 8 + DB(tGravel) + 14, 1.8); grav.position.set(x, 0.03, z); }
const sCar = sB + 8 + DB(tCar) + 22;
const carBPath = (t) => (t > T4 && t < T5 + 1 ? P(sCar + 6 * (t - tCar) * (t > tCar ? 0.5 : 1), 1.8 + 5 * sm(tCar, tCar + 1.6, t)) : null);

title("NEVER CHAT ON THE INTERCOM IN THE HARD PARTS");
cap("s2", "story", ["A STORY IN YOUR EAR"], RED, { until: ["s2", "junction"] });
cap("s2", "junction", ["AT A BUSY JUNCTION"], RED, { until: ["s2", "mind"] });
cap("s2", "mind", ["YOUR MIND IS", "OFF THE ROAD"], RED, { boom: 0.5 });
cap("s3", "agree", ["HARD ROADS:", "HAZARDS ONLY"], GREEN);
cap("s4", "leader", ["THE LEADER CALLS IT"], GREEN, { until: ["s4", "gravel"] });
cap("s4", "gravel", ["GRAVEL."], GREEN, { until: ["s4", "car"] });
cap("s4", "car", ["CAR TURNING."], GREEN, { until: ["s4", "stopping"] });
cap("s4", "stopping", ["STOPPING."], GREEN);
cap("s5", "chat", ["CHAT ON THE STRAIGHTS", "AND AT THE STOPS"], GREEN);
cap("s6", "one", ["ONE VOICE,", "ONE WARNING"], GREEN);
endCard(["HARD ROADS, HAZARDS ONLY.", "CHAT ON THE STRAIGHTS."]);

const fol = (fn) => (t) => pathState(fn, t);
const cam = (s, o, y, ls, lo, ly, f) => { const [x, z] = P(s, o), [lx, lz] = P(ls, lo); return [x, y, z, lx, ly, lz, f]; };
const SH = [
  { at: 0, f: fol(aF), K: [[0, [2.6, 2.4, 5.5, -0.6, 1.2, -8, 44]], [3, [2.9, 2.6, 6.0, -0.6, 1.2, -8, 44]]] },
  { at: T2, f: fol(aF), K: [[0, [2.0, 4.2, 9.0, -1.0, 0.8, -16, 46]], [3, [2.2, 4.0, 8.0, -1.0, 0.8, -14, 46]]] },
  { at: tMind + 0.1, K: [[0, cam(sStop - 6, 4.5, 2.2, sStop + 3, 1.5, 1.0, 44)], [2, cam(sStop - 6.5, 4.8, 2.4, sStop + 3, 1.5, 1.0, 44)]] },
  { at: T3, f: fol(bF), K: [[0, [3.0, 2.4, 5.0, -0.6, 1.4, -6, 44]], [3, [3.2, 2.6, 5.4, -0.6, 1.4, -6, 44]]] },
  { at: T4, f: fol(bF), K: [[0, [2.2, 3.2, 6.5, -0.4, 1.0, -14, 46]], [5, [2.4, 3.4, 7.0, -0.4, 1.0, -14, 46]]] },
  { at: T5, f: fol(bF), K: [[0, [-4.0, 3.6, 6.0, 0.4, 1.4, -6, 44]], [3, [-4.2, 3.7, 5.6, 0.4, 1.4, -6, 44]]] },
  { at: T6, f: fol(bF), K: [[0, [2.6, 3.2, 6.0, -0.8, 1.3, -8, 44]], [3, [2.8, 3.3, 5.6, -0.8, 1.3, -8, 44]]] },
  { at: T7, f: fol(bF), K: [[0, [-2.8, 2.8, 8, 0.4, 1.0, -6, 46]], [3, [-3.2, 3.4, 9.5, 0.4, 1.0, -7, 46]]] },
];

run("w", (t) => {
  const { id } = sceneOf(t), A = t < T3;
  const hex = A ? (t < T2 ? VIOLET : RED) : GREEN;
  const sl = ride(L, A ? aL : bL, t, A ? VIOLET : GREEN, { still: !A && DB(t + 0.05) - DB(t) < 0.01 });
  const sf = ride(F, A ? aF : bF, t, hex, { still: !A && DB(t + 0.05) - DB(t) < 0.01 });
  // who talks: A both chat nonstop; s3 silent; s4 leader calls each hazard; s5 both chat; s6 one warning from the leader
  const call = flash(t, tGravel) + flash(t, tCar) + flash(t, tStopW);
  let lv = 0, fv = 0;
  if (A) { lv = fv = 1; }
  else if (id === "s4") lv = Math.min(1, 1.6 * call);
  else if (id === "s5") lv = fv = sm(tChat - 0.2, tChat + 0.2, t);
  else if (id === "s6") lv = Math.min(1, 1.6 * flash(t, tWarn));
  const mh = A ? (t < T2 ? ORANGE : RED) : GREEN;
  mL.set(lv, mh, t, 0); mF.set(fv, mh, t, 1.7);
  L.headG.getWorldPosition(va); F.headG.getWorldPosition(vb); va.y += 0.45; vb.y += 0.45;
  link.material.color.set(mh).multiplyScalar(1.0); link.set(va, vb, Math.min(1, Math.max(lv, fv)) * 0.55);
  carA.set(pathState(carAPath, t));
  carB.set(pathState(carBPath, t));
  hitZ.set(A ? sm(tB, tB + 0.4, t) : 0);
  grav.set(id === "s4" ? sm(tGravel - 0.3, tGravel, t) * (1 - sm(tCar + 0.6, tCar + 1, t)) : 0);
  const shot = shoot(SH, t);
  bloom.strength = 1.0 + 1.2 * shot.punch * shot.punch + overlays(t) + 0.5 * flash(t, tB + 0.6) + 0.3 * call;
});
