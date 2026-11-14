// 99 know-the-route: wrong (red): a leader on an unknown route misses a right turn, brakes hard past it, the whole group
// brakes hard behind and bunches up past the junction. Right (green): ride it first / study the map (route line, turn,
// fuel stop, rough patch), share the route to every rider's phone, slow early + signal early, the group turns neatly.
import { THREE, S, g, sm, pulse, scene, bloom, camera, box, tube, glow, VIOLET, ORANGE, RED, GREEN, WHITE, pathState, shoot, sceneOf, run, beam, patch } from "./kit.js";
import { track, buildRoad, title, endCard, cap, boom, overlays, bikes, ride, dist } from "./extra.js";

const FOG = 0.011; scene.fog.density = FOG;
const J1 = 200, J2 = 1200, RR = 12, ARC = (RR * Math.PI) / 2;
const { P } = track([{ len: 3000 }]);
const tA = track([{ len: J1 }, { len: ARC, R: -RR }, { len: 600 }]), tB = track([{ len: J2 }, { len: ARC, R: -RR }, { len: 600 }]);
// main road in pieces (no lamps or right edge line in the junction mouths), side roads to the right
buildRoad(P, -40, J1 - 16); buildRoad(P, J1 - 16, J1 + 16, { lamps: false, gaps: [[J1 - 16, J1 + 16, 1]] }); buildRoad(P, J1 + 16, J2 - 16);
buildRoad(P, J2 - 16, J2 + 16, { lamps: false, gaps: [[J2 - 16, J2 + 16, 1]] }); buildRoad(P, J2 + 16, 2000);
buildRoad(tA.P, J1 + ARC * 0.4, J1 + ARC + 250, { lamps: false }); buildRoad(tB.P, J2 + ARC * 0.4, J2 + ARC + 250, { lamps: false });

// turn-right sign before each junction: post + plate + glowing arrow (points +x = right)
const mArA = glow(ORANGE, 1.6), mArB = glow(ORANGE, 1.6);
const sign = (J, m) => { const [x, z] = P(J - 14, 5.4), G = new THREE.Group(); G.position.set(x, 0, z); scene.add(G);
  G.add(tube([0, 0, 0], [0, 2.2, 0], 0.08, glow(WHITE, 0.5)), box(1.3, 0.8, 0.05, 0, 2.5, 0, glow(0x1a1440, 1), false),
    box(0.7, 0.14, 0.07, -0.1, 2.5, 0.02, m, false), box(0.36, 0.12, 0.07, 0.28, 2.62, 0.02, m, false), box(0.36, 0.12, 0.07, 0.28, 2.38, 0.02, m, false));
  G.children[3].rotation.z = -0.75; G.children[4].rotation.z = 0.75; return G; };
sign(J1, mArA); sign(J2, mArB);

const B = bikes(3), V = 12, GAP = 9, OFF = [1.0, 2.6, 1.0];
const T2 = S.s2[0], T3 = S.s3[0], T4 = S.s4[0], T5 = S.s5[0], T6 = S.s6[0], T7 = S.s7[0];

// ---- part A (s1-s2): leader passes the turn on "miss", brakes hard on "brake"; each follower reacts 0.4 s later -> bunched
const tMiss = g("s2", "miss"), tBr = g("s2", "brake") - 0.05;
const DA = [0, 1, 2].map((i) => dist((t) => V * (1 - sm(tBr + 0.4 * i, tBr + 0.4 * i + 1.2, t)), 0, 30));
const pA = [0, 1, 2].map((i) => (t) => P(J1 + DA[i](t) - DA[i](tMiss) - GAP * i, OFF[i]));

// ---- part B: s3 head: leader alone rides the route; s4 group parked at the start; s5 pulls away, slows + signals early;
// leader reaches the turn just after s6 starts; s6-s7 the group follows it round
const tStudy = g("s3", "study") - 0.1, tSlow = g("s5", "slow"), tSig = g("s5", "signal") - 0.15;
const vB = (t) => 7 * sm(T5, T5 + 0.8, t) * (1 - 0.5 * sm(tSlow - 0.1, tSlow + 0.6, t)) * (1 + 0.8 * sm(T6 + 1.4, T7 + 1, t));
const DB = dist(vB, T5, T7 + 6), s0 = J2 - DB(T6 + 0.35);
const pB = [0, 1, 2].map((i) => (t) => tB.P(s0 + DB(t) - 7 * i, OFF[i]));
const pSolo = (t) => tB.P(J2 - 30 + 8 * (t - T3), 1.0);

// ---- overlays: red bunch patches (s2); map route line + turn / fuel / rough markers (s3); phones (s4)
const close = [patch(1.4, 1, RED, 1.2), patch(1.4, 1, RED, 1.2)];
const NR = 24, rA = J2 - 30, rB = J2 + ARC + 26, route = Array.from({ length: NR }, () => beam(GREEN, 1.2, 0.6));
const va = new THREE.Vector3(), vb = new THREE.Vector3();
const mkTurn = patch(9, 9, ORANGE, 1.4), mkRough = patch(7, 8, RED, 1.4);
{ const [x, z] = tB.P(J2 + ARC / 2, 0); mkTurn.position.x = x; mkTurn.position.z = z; }
{ const [x, z] = tB.P(J2 + ARC + 18, 0); mkRough.position.x = x; mkRough.position.z = z; mkRough.rotation.z = Math.PI / 2; }
const mFuel = glow(GREEN, 0.4), fuel = new THREE.Group(); { const [x, z] = tB.P(J2 + ARC + 7, 7); fuel.position.set(x, 0, z); }
fuel.add(box(1.2, 2.4, 0.9, 0, 1.2, 0, mFuel, false), box(4.5, 0.25, 3.5, 0, 3.4, 0, mFuel, false)); scene.add(fuel);
const mPh = glow(GREEN, 1.1), mScr = glow(0x0a0820, 1), mRt = glow(GREEN, 2.4), mDot = glow(ORANGE, 3);
const phones = B.map(() => { const G = new THREE.Group(); G.add(box(0.5, 0.9, 0.04, 0, 0, 0, mPh, false), box(0.42, 0.78, 0.04, 0, 0, 0.02, mScr, false),
  box(0.06, 0.46, 0.03, -0.08, -0.1, 0.05, mRt, false), box(0.24, 0.06, 0.03, 0.03, 0.13, 0.05, mRt, false), box(0.09, 0.09, 0.03, -0.08, 0.13, 0.06, mDot, false)); scene.add(G); return G; });

title("NEVER LEAD A ROUTE YOU'VE NEVER RIDDEN");
cap("s2", "miss", ["YOU MISS A TURN"], RED, { until: ["s2", "brake"] });
cap("s2", "brake", ["BRAKE HARD", "TO MAKE IT"], RED, { until: ["s2", "whole"] });
cap("s2", "whole", ["THE WHOLE GROUP", "FOLLOWS YOU IN"], RED);
boom("s2", "brake", 0.8);
cap("s3", "ride", ["RIDE IT FIRST"], GREEN, { until: ["s3", "study"] });
cap("s3", "study", ["OR STUDY THE MAP"], GREEN, { until: ["s3", "turns"] });
cap("s3", "turns", ["THE TURNS"], ORANGE, { until: ["s3", "fuel"] });
cap("s3", "fuel", ["THE FUEL STOPS"], GREEN, { until: ["s3", "rough"] });
cap("s3", "rough", ["THE ROUGH PARTS"], RED);
cap("s4", "share", ["SHARE THE ROUTE", "BEFORE THE RIDE"], GREEN, { until: ["s4", "every"] });
cap("s4", "every", ["EVERY RIDER HAS IT", "ON THEIR PHONE"], GREEN);
cap("s5", "not", ["NOT SURE", "ABOUT A TURN?"], ORANGE, { until: ["s5", "slow"] });
cap("s5", "slow", ["SLOW DOWN EARLY"], GREEN, { until: ["s5", "signal"] });
cap("s5", "signal", ["SIGNAL EARLY"], GREEN);
cap("s6", "group", ["THE GROUP RIDES AS WELL", "AS YOU LEAD"], GREEN);
endCard(["KNOW THE ROUTE.", "SHARE THE ROUTE."]);

const fol = (fn) => (t) => pathState(fn, t);
const [jx, jz] = tB.P(J2, 0);
const SH = [
  { at: 0, f: fol(pA[2]), noRot: true, K: [[0, [2.6, 3.4, 9, 0, 1, -12, 48]], [T2, [2.4, 3.6, 9.5, 0, 1, -12, 48]]] },
  { at: T2, calm: false, f: fol(pA[0]), noRot: true, K: [[0, [9, 8, 4, 0, 0.3, -1, 50]], [T3 - T2, [10, 9, 5, 0, 0.3, 2, 50]]] },
  { at: T3, f: fol(pSolo), K: [[0, [-2.0, 3.0, 8.5, 0, 1, -8, 48]], [tStudy - T3, [-1.8, 2.9, 8, 0, 1, -8, 48]]] },
  { at: tStudy, calm: false, f: () => ({ x: jx + 16, z: jz - 12 }), noRot: true, K: [[0, [0, 58, 10, 0, 0, 0, 52]], [T4 - tStudy, [0, 64, 11, 0, 0, 0, 52]]] },
  { at: T4, f: fol(pB[1]), noRot: true, K: [[0, [6.5, 3.6, 7, 0, 1.6, -1, 50]], [T5 - T4, [6.2, 3.4, 6, 0, 1.6, -1, 50]]] },
  { at: T5, f: fol(pB[0]), noRot: true, K: [[0, [-1.4, 3.4, 10, 0.4, 1, -10, 48]], [T6 - T5, [-1.2, 3.6, 9.5, 0.4, 1, -10, 48]]] },
  { at: T6, f: () => ({ x: jx, z: jz }), noRot: true, K: [[0, [-9, 15, 18, 5, 0, -4, 50]], [3.5, [-10, 18, 21, 6, 0, -6, 50]]] },
];

const strip = (m, a, b, o, k) => { const [x, z] = P((a + b) / 2, o); m.position.set(x, 0.03, z); m.scale.set(1, Math.max(0.1, Math.abs(b - a)), 1); m.set(k); };
run("w", (t) => {
  const { id } = sceneOf(t), A = t < T3, solo = t >= T3 && t < tStudy, map = t >= tStudy && t < T4;
  scene.fog.density = map ? 0.002 : FOG;
  const sts = B.map((b, i) => {
    const vis = A || (!solo && !map) || (solo && i === 0);
    b.g.visible = vis; b.trail.visible = vis;
    if (!vis) return null;
    const fn = A ? pA[i] : solo ? pSolo : pB[i];
    const st = ride(b, fn, t, A ? (t >= T2 ? RED : VIOLET) : GREEN, { trail: !(id === "s4") });
    // brake lights: hard in part A, gentle on the early slow-down in s5
    const brk = A ? pulse(t, tBr + 0.4 * i, tBr + 0.4 * i + 1.3) : id === "s5" ? pulse(t, tSlow - 0.1 + 0.25 * i, tSlow + 0.6 + 0.25 * i) * 0.6 : 0;
    b.tail.material.color.set(RED).multiplyScalar(3 + 6 * brk);
    b.sig(!A && t >= tSig + 0.25 * i && t < T7 + 0.5 ? 1 : 0, t + 0.11 * i);
    return st;
  });
  const shot = shoot(SH, t);
  // s2: bunch patches between the stopped bikes; missed-turn sign turns red
  const kC = id === "s2" ? sm(g("s2", "whole") - 0.2, g("s2", "whole") + 0.3, t) : 0;
  if (A) for (let i = 0; i < 2; i++) { const a = -pA[i](t)[1] + 1.1, bb = -pA[i + 1](t)[1] - 1.1; strip(close[i], bb, a, 1.8, kC); }
  else close.forEach((c) => c.set(0));
  mArA.color.set(A && t > tMiss ? RED : ORANGE).multiplyScalar(1.6 + (A && t > tMiss ? 1.2 * Math.abs(Math.sin(7 * t)) : 0));
  // s3 map: route line draws on from "study" to "map", markers on their words
  const kR = map ? sm(tStudy + 0.1, g("s3", "map") + 0.2, t) : 0;
  for (let i = 0; i < NR; i++) { const q0 = rA + ((rB - rA) * i) / NR, q1 = rA + ((rB - rA) * (i + 1)) / NR, on = kR * NR - i;
    const [x0, z0] = tB.P(q0, 0), [x1, z1] = tB.P(q1, 0); va.set(x0, 0.08, z0); vb.set(x1, 0.08, z1); route[i].set(va, vb, Math.max(0, Math.min(1, on))); }
  mkTurn.set(map ? sm(g("s3", "turns") - 0.1, g("s3", "turns") + 0.2, t) : 0);
  const kF = map ? sm(g("s3", "fuel") - 0.1, g("s3", "fuel") + 0.2, t) : 0; fuel.visible = map; mFuel.color.set(GREEN).multiplyScalar(0.4 + 1.6 * kF);
  mkRough.set(map ? sm(g("s3", "rough") - 0.1, g("s3", "rough") + 0.2, t) : 0);
  // s4 phones: leader's on "share", the others on "every"
  phones.forEach((p, i) => { const k = id === "s4" ? sm(i ? g("s4", "every") + 0.15 * (i - 1) : g("s4", "share"), (i ? g("s4", "every") + 0.15 * (i - 1) : g("s4", "share")) + 0.25, t) : 0;
    p.visible = k > 0.01 && sts[i]; if (!p.visible) return; p.position.set(sts[i].x, 2.4 + 0.15 * k, sts[i].z); p.scale.setScalar(k); p.lookAt(camera.position); });
  bloom.strength = (map ? 0.55 : 1.0) + 1.2 * shot.punch * shot.punch + overlays(t);
});
