// 94 dropped-bike-check: your friend's bike lies at the kerb; they pick it up and ride straight off. The bent lever / twisted bar fail
// and they slide into the back of a stopped car (red). Right way: parked bike close-ups: levers + pegs, squeeze the brakes (firm),
// fluid leak + loose mirrors, bars lock to lock; then a slow minute before speeding up (green).
import { THREE, S, g, sm, scene, bloom, box, tube, glow, makeCar, hdg, VIOLET, ORANGE, RED, GREEN, pathState, shoot, run, patch } from "./kit.js";
import { track, buildRoad, makePerson, pose, ARM, title, endCard, cap, boom, overlays, bikes, ride, downLean, dist } from "./extra.js";

scene.fog.density = 0.008;
const T2 = S.s2[0], T3 = S.s3[0], T4 = S.s4[0], T5 = S.s5[0], T6 = S.s6[0], T7 = S.s7[0];
const tNev = g("s1", "never"), tRide = g("s1", "ride"), tBent = g("s2", "bent"), tTw = g("s2", "twisted"), tMom = g("s2", "moment"), tNeed = g("s2", "need");
const tLev = g("s3", "levers"), tFoot = g("s3", "foot"), tSnap = g("s3", "bent");
const tSq = g("s4", "squeeze"), tFirm = g("s4", "firm");
const tLeak = g("s5", "leaking"), tLoose = g("s5", "loose"), tTurn = g("s5", "turn");
const tSlow = g("s6", "slowly"), tSpd = g("s6", "speed");

const { P } = track([{ len: 3000 }]);
buildRoad(P, -80, 700);
const [BF] = bikes(1), fr = makePerson(), car = makeCar();

// levers (pivot near the bar end) and foot pegs on the friend's bike
const levers = [-1, 1].map((s) => {
  const G = new THREE.Group(), m = glow(VIOLET, 1.2); G.position.set(s * 0.2, 0.12, 0.0);
  G.add(tube([0, 0, 0], [s * 0.2, -0.02, -0.12], 0.035, m)); G.userData.m = m; BF.fork.add(G); return G;
});
const pegs = [-1, 1].map((s) => { const m = glow(VIOLET, 1.0), b = box(0.16, 0.04, 0.05, s * 0.28, 0.36, 0.14, m, false); BF.lean.add(b); b.userData.m = m; return b; });
const bar = BF.fork.children.find((c) => c.geometry?.parameters?.width === 0.7);
const mirM = [BF.mirL, BF.mirR].map((m) => m.children[1].material);
const lit = (m, hex, k) => m.color.set(hex).multiplyScalar(k);

// ---- A: dropped at the kerb (s=40), picked up, ridden off; brakes fail into a stopped car ----
const s0 = 40, VA = 10;
const tC = tNeed + 0.1;
const vA = (t) => VA * sm(tRide, tRide + 1.4, t) * (1 - 0.25 * sm(tMom, tMom + 0.3, t)) * (1 - sm(tC, tC + 0.3, t));
const DA = dist(vA, 0, T3 + 1);
const aF = (t) => [...P(s0 + DA(t), 2.7 - 0.9 * sm(tRide, tRide + 1.2, t)), 0];
const sCar = s0 + DA(tC) + 2.0 + 2.15, [xCar, zCar] = P(sCar, 1.8);

// ---- B: parked for the check at s=300 ----
const sB = 300, [xB, zB] = P(sB, 2.6), bF = () => [xB, zB, 0];
const leak = patch(0.7, 0.5, RED, 0.9); leak.position.set(xB, 0.03, zB - 0.1);
const drops = [0, 1, 2].map(() => { const d = new THREE.Mesh(new THREE.SphereGeometry(0.035, 8, 6), glow(RED, 2.4)); scene.add(d); return d; });

// ---- C: slow minute, then speed up ----
const vC = (t) => 2.6 + 11 * sm(tSpd, tSpd + 1.2, t);
const DC = dist(vC, T6, T7 + 6);
const cF = (t) => [...P(sB + DC(t), 2.6 - 0.8 * sm(T6, T6 + 1.5, t)), 0];

title("NEVER RIDE A DROPPED BIKE WITHOUT A CHECK");
cap("s2", "bent", ["BENT BRAKE LEVER"], RED, { until: ["s2", "twisted"] });
cap("s2", "twisted", ["TWISTED BAR"], RED, { until: ["s2", "fail"] });
cap("s2", "fail", ["FAILS WHEN", "THEY NEED IT"], RED);
boom("s2", "need", 0.8);
cap("s3", "levers", ["CHECK THE LEVERS"], GREEN, { until: ["s3", "foot"] });
cap("s3", "foot", ["AND THE FOOT PEGS"], GREEN, { until: ["s3", "bent"] });
cap("s3", "bent", ["BENT OR SNAPPED?"], ORANGE);
cap("s4", "squeeze", ["SQUEEZE", "THE BRAKES"], GREEN, { until: ["s4", "firm"] });
cap("s4", "firm", ["FIRM,", "LIKE BEFORE"], GREEN);
cap("s5", "leaking", ["LEAKING FLUID?"], ORANGE, { until: ["s5", "loose"] });
cap("s5", "loose", ["LOOSE MIRRORS?"], ORANGE, { until: ["s5", "turn"] });
cap("s5", "turn", ["BARS LOCK", "TO LOCK"], GREEN);
cap("s6", "ride", ["RIDE SLOWLY", "FOR A MINUTE"], GREEN, { until: ["s6", "speed"] });
cap("s6", "speed", ["THEN SPEED UP"], GREEN);
endCard(["DROPPED IT? CHECK IT", "BEFORE YOU RIDE IT."]);

const fol = (fn) => (t) => pathState(fn, t);
const bar0 = [xB, 1.07, zB - 0.57];
const SH = [
  { at: 0, K: [[0, [6.4, 2.4, -33, 2.4, 0.4, -40.5, 46]], [T2 - 0.2, [6.6, 2.8, -32.5, 2.0, 0.6, -43, 46]]] },
  { at: tRide - 0.05, f: fol(aF), noRot: true, K: [[0, [3.0, 1.7, 3.0, 0, 0.8, -3, 44]], [T2 - tRide + 0.05, [2.0, 2.4, 7, 0, 0.7, -6, 46]]] },
  { at: T2, f: fol(aF), noRot: true, K: [[0, [2.0, 2.4, 7, 0, 0.7, -6, 46]], [3.5, [2.4, 2.8, 7.6, 0, 0.6, -5, 46]]] },
  { at: T3, K: [[0, [xB - 1.9, 1.7, zB - 2.6, bar0[0], 0.9, bar0[2], 44]], [tFoot - T3, [xB - 2.0, 1.6, zB - 2.4, bar0[0], 0.85, bar0[2], 44]],
    [tFoot - T3 + 0.4, [xB - 2.7, 1.2, zB + 0.6, xB, 0.4, zB - 0.2, 46]], [3, [xB - 2.9, 1.25, zB + 0.8, xB, 0.4, zB - 0.2, 46]]] },
  { at: T4, K: [[0, [xB - 1.5, 1.9, zB - 1.9, bar0[0] - 0.2, 1.0, bar0[2], 40]], [3, [xB - 1.4, 1.85, zB - 1.8, bar0[0] - 0.2, 1.0, bar0[2], 40]]] },
  { at: T5, K: [[0, [xB - 3.2, 1.5, zB - 1.9, xB, 0.5, zB - 0.4, 44]], [tTurn - T5, [xB - 3.0, 1.9, zB - 1.6, xB, 0.7, zB - 0.4, 44]], [2.8, [xB - 2.6, 3.4, zB + 2.4, xB + 0.4, 0.8, zB - 0.3, 46]]] },
  { at: T6, f: fol(cF), noRot: true, K: [[0, [-5.2, 2.0, 1.4, 0, 0.7, -0.2, 46]], [3, [-5.6, 2.3, 2.0, 0, 0.7, -0.6, 46]]] },
  { at: T7, f: fol(cF), noRot: true, K: [[0, [-1.5, 3.2, 8.5, 0, 0.8, -8, 46]], [6, [-1.8, 3.8, 9.5, 0, 0.8, -8, 46]]] },
];

run("w", (t) => {
  const A = t < T3, B = !A && t < T6;
  let lev = [VIOLET, 1.2], peg = [VIOLET, 1.0], squeeze = 0, bent = 0, twist = 0, mir = [VIOLET, 2.0], wob = 0, steer = 0;
  car.set(A ? { x: xCar, z: zCar, h: 0 } : null);
  if (A) {
    const down0 = 1 - sm(tNev, tRide - 0.05, t), kC = sm(tC, tC + 0.4, t), hex = t < T2 ? VIOLET : RED;
    if (t < tRide) {
      ride(BF, aF, t, hex, { still: true, lean: downLean(down0, 1), down: 1, trail: false });
      BF.g.position.y = 0.22 * down0;
      const [bx, bz] = aF(t);
      pose(fr, { x: bx - 1.25, z: bz + 0.35, h: hdg(1, 0), armR: 0.9 + 0.5 * (1 - down0), armL: 0.9 + 0.5 * (1 - down0), hex: VIOLET });
    } else if (kC > 0) {
      ride(BF, aF, t, RED, { lean: downLean(kC, -1), down: kC, trail: false });
      const st = pathState(aF, t), kT = sm(tC + 0.08, tC + 0.6, t);
      // rider is thrown back off the bike (away from the trunk) instead of vanishing into it
      if (t > tC + 0.08) { BF.rider.visible = false; pose(fr, { x: st.x - 0.3 - 0.9 * kT, z: st.z + 0.3 + 1.5 * kT, h: -0.4, lie: sm(tC + 0.08, tC + 0.35, t), armR: 2.2, armL: 1.6, hex: RED }); } else pose(fr, { vis: false });
    } else { ride(BF, aF, t, hex, { trail: true }); pose(fr, { vis: false }); }
    bent = 1; twist = 0.28;
    if (t > tBent - 0.1) lev = [RED, 2.2 + 0.8 * Math.sin(10 * t)];
    if (t > tMom) squeeze = 1;
  } else if (B) {
    ride(BF, bF, t, GREEN, { still: true, lean: 0.1, trail: false }); BF.rider.visible = false;
    pose(fr, { x: xB + 1.9, z: zB + 0.6, h: hdg(-1, 0), armR: ARM.point, armL: 0.3, hex: GREEN });
    if (t < T4) {
      const kL = sm(tLev - 0.1, tLev + 0.2, t), kP = sm(tFoot - 0.1, tFoot + 0.2, t), snap = t > tSnap ? 0.6 + 0.4 * Math.sin(12 * t) : 1;
      lev = [kL > 0.5 ? (t > tSnap ? ORANGE : GREEN) : VIOLET, 0.9 + 0.9 * kL * snap];
      peg = [kP > 0.5 ? (t > tSnap ? ORANGE : GREEN) : VIOLET, 1.0 + 2.2 * kP * snap];
    } else if (t < T5) {
      squeeze = t > tSq ? 0.5 - 0.5 * Math.cos(5 * (t - tSq)) : 0;
      lev = [GREEN, 0.9 + 1.0 * sm(tFirm - 0.1, tFirm + 0.2, t)];
    } else {
      if (t > tLoose - 0.1) { mir = [ORANGE, 2.4 + 0.8 * Math.sin(11 * t)]; wob = 0.25 * Math.sin(14 * t) * (1 - sm(tTurn - 0.2, tTurn, t)); }
      steer = 0.55 * Math.sin(2.6 * (t - tTurn)) * sm(tTurn - 0.1, tTurn + 0.3, t);
    }
  } else {
    ride(BF, cF, t, GREEN, { trail: true }); pose(fr, { vis: false });
  }
  // leak + drips (s5 only)
  const kLk = B && t > T5 ? sm(tLeak - 0.1, tLeak + 0.3, t) : 0;
  leak.set(kLk * (0.8 + 0.2 * Math.sin(6 * t)));
  drops.forEach((d, i) => { d.visible = kLk > 0.5; const ph = (t * 1.3 + i / 3) % 1; d.position.set(xB + 0.03 * (i - 1), 0.42 * (1 - ph * ph), zB - 0.1); });
  levers.forEach((L, i) => { const s = i ? 1 : -1; lit(L.userData.m, ...lev); L.rotation.set(0, -s * 0.55 * squeeze, s < 0 ? -0.5 * bent : 0); });
  pegs.forEach((p) => lit(p.userData.m, ...peg));
  if (B && mir[0] === VIOLET) mir = [VIOLET, 0.7];
  mirM.forEach((m) => lit(m, ...mir)); BF.mirL.rotation.z = wob; BF.mirR.rotation.z = -wob;
  if (bar) bar.rotation.y = twist;
  if (B) BF.fork.rotation.y = steer;
  BF.hlight.material.color.set(0xffffff).multiplyScalar(B ? 0.15 : 1.8);
  const shot = shoot(SH, t);
  bloom.strength = (B ? 0.55 : 1.0) + 1.2 * shot.punch * shot.punch + overlays(t);
});
