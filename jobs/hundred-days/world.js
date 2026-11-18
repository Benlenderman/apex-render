// 154 hundred-days: Maya on day 100 stops calmly for a car that pulls out; then her first hundred days:
// circling the parking lot, four stalls, a dropped bike, a corner run wide (red), eyes up (day 30),
// the same corner clean (green), and the day-100 junction again with two fingers on the brake.
import { THREE, S, g, sm, scene, camera, bloom, glow, patch, beam, box, mAsph, mFrame, makeCar, VIOLET, ORANGE, RED, GREEN, WHITE, mSolid, pathState, shoot, run } from "./kit.js";
import { track, ribbon, buildRoad, title, endCard, cap, overlays, bikes, ride, dist, tag, tagAt, END, makePerson, pose, downLean } from "./extra.js";

// ---- timing ----
const T2 = S.s2[0], T3 = S.s3[0], T4 = S.s4[0], T5 = S.s5[0], T6 = S.s6[0], T7 = S.s7[0], T8 = S.s8[0], TE = END("s8");
const tPull1 = g("s1", "pulls"), tStops1 = g("s1", "stops"), tLot = g("s1", "hundred", 2) - 0.15;
const tStall = g("s2", "stalls"), tOut = g("s2", "gets");
const tDrops = g("s3", "drops"), tNobody = g("s3", "nobody");
const tGrab = g("s4", "grabs"), tStands = g("s4", "stands"), tHeart = g("s4", "heart");
const tStarts = g("s5", "starts"), tLooking = g("s5", "looking");
const tJ = g("s6", "day", 2) - 0.05, tPull6 = g("s6", "pulls"), tTwo = g("s6", "two"), tStops6 = g("s6", "stops"), tRides = g("s6", "rides");
const on = (t, a, b = 1e9) => sm(a - 0.1, a + 0.2, t) * (1 - sm(b - 0.15, b, t));
const v3 = (x, y, z) => new THREE.Vector3(x, y, z);

// ---- zone A, the junction: main road north (-z), side road joins from the right at s = J ----
const J = 100, LW = 3.6;
const { P } = track([{ len: 900 }]);
buildRoad(P, -60, J + 250, { LW, lamps: true, gaps: [[J - 4.1, J + 4.1, 1]] });
const P2 = (s, o) => [LW + s, -J + o];
ribbon(P2, -3.7, 3.7, 0.4, 70, mAsph);
for (const sd of [-1, 1]) ribbon(P2, sd * 3.6 - 0.04, sd * 3.6 + 0.04, 0.9, 70, mFrame, 0.02, 0.5);
for (let s = 6; s < 70; s += 4) ribbon(P2, -0.06, 0.06, s, s + 1.6, glow(VIOLET, 1.1), 0.012, 0.4);

// the car pulls out of the side road, turns left across her lane and drives away in the far lane; e = seconds since it moves
const car = makeCar({ driver: true });
const ZC = -J - 1.6, DC = dist((e) => 6 * sm(0, 1.2, e), -2, 14);
const carSt = (e) => {
  const D = DC(e), a = (D - 4.4) / 4;
  if (D < 4.4) return { x: 6.6 - D, z: ZC, h: Math.PI / 2 };
  if (a < Math.PI / 2) return { x: 2.2 - 4 * Math.sin(a), z: ZC + 4 - 4 * Math.cos(a), h: Math.PI / 2 + a };
  return { x: -1.8, z: ZC + 4 + (D - 4.4 - 2 * Math.PI), h: Math.PI };
};
// Maya: 13 m/s, brakes smoothly from e = 0.15, stops 4 m short of the car's line; on day 100 (s6) she then rides on
const SSTOP = J - 4.0, DR = dist((e) => 13 * (1 - sm(0.15, 1.5, e)), -8, 4), DT = DR(4);
const e1 = (t) => t - tPull1, e6 = (t) => 0.75 * (t - tPull6);
const GO = dist((t) => 14 * sm(tRides - 0.1, tRides + 2.4, t), tRides - 0.2, TE + 1);
const fnA = (t) => [1.8, -(SSTOP - DT + DR(e1(t))), 0];
const fnJ = (t) => [1.8, -(SSTOP - DT + DR(e6(t)) + GO(t)), 0];
const laneJ = (t) => ({ x: 1.5, z: fnJ(t)[1], h: 0 });

// ---- zone B, the parking lot ----
const X0 = 300;
scene.add(box(44, 0.02, 64, X0, -0.012, -6, mAsph, false));
for (const [w, d, x, z] of [[44, 0.1, 0, 26], [0.1, 64, -22, -6], [0.1, 64, 22, -6], [19.5, 0.1, -12.25, -38], [19.5, 0.1, 12.25, -38]]) scene.add(box(w, 0.03, d, X0 + x, 0.02, z, glow(VIOLET, 1.4), false));
for (let z = -22; z <= 14; z += 3) scene.add(box(4.5, 0.02, 0.08, X0 - 19.5, 0.02, z, mFrame, false));
for (const sd of [-1, 1]) scene.add(box(0.14, 2.6, 0.14, X0 + sd * 2.5, 1.3, -38, mFrame, false), box(0.3, 0.3, 0.3, X0 + sd * 2.5, 2.7, -38, glow(ORANGE, 2.4), false));
for (const [x, z] of [[-19.5, -5.5], [-19.5, -11.5], [-19.5, 6.5]]) makeCar().set({ x: X0 + x, z, h: Math.PI / 2 });
const tExit = tag("EXIT", ORANGE, 1.4);
// day 0: slow circles in the lot
const fnLot = (t) => { const a = 0.8 * (t - tLot) + 0.6; return [X0 + 5 * Math.cos(a), -2 - 5 * Math.sin(a)]; };
// day 1: four lurches toward the exit, each dies, then she finally rolls out
const stalls = [0, 0.42, 0.84, 1.26].map((d) => tStall - 0.1 + d);
const fn2 = (t) => [X0, -22.5 - stalls.reduce((a, s) => a + 1.2 * sm(s, s + 0.16, t), 0) - 4 * Math.max(0, t - tOut + 0.1) ** 2, 0];
// day 3: standing still, the bike tips over; she ends up standing next to it
const B3 = [X0 + 8, 4], fn3 = () => [B3[0], B3[1], 0.5];
const maya = makePerson();
for (const m of Object.values(maya.mats)) { m.color.set(RED); m.emissive.set(RED).multiplyScalar(0.4); }
maya.visor.material = glow(RED, 2.4);

// ---- zone C, the corner: straight, then a 90 degree right-hander ----
const XC = -300, TC = track([{ len: 80 }, { len: 47.1, R: -30 }, { len: 160 }]);
const Pc = (q, o = 0) => { const [x, z] = TC.P(q, o); return [x + XC, z]; };
buildRoad(Pc, -40, 260, { LW, lamps: false });
// day 12: 11 m/s, grabs the brake mid-corner, the bike stands up and runs wide across the road
const D4 = dist((t) => 11 * (1 - 0.6 * sm(tGrab, tGrab + 1.2, t)) * (1 - sm(tHeart - 0.5, tHeart + 0.5, t)), T4 - 1, T5 + 1);
const fn4 = (t) => Pc(93 - D4(tGrab) + D4(t), 1.8 - 5.0 * sm(tStands - 0.7, tStands + 1.0, t));
// day 30: eyes come up as she reaches the corner
const s5 = (t) => 80 + 12 * (t - tLooking), fn5 = (t) => Pc(s5(t), 1.8);
// day 60: the same corner, one clean line
const s6 = (t) => 88 + 12 * (t - T6), fn6 = (t) => { const q = s6(t); return Pc(q, 2.3 - 1.2 * sm(84, 100, q) + 1.0 * sm(108, 128, q)); };
const wide = patch(3.2, 4.5, RED, 1.6), exitP = patch(2.4, 3.2, GREEN, 1.6);

// ---- props ----
const [Br, Bg] = bikes(2);
const suit = (B, hex) => { const m = mSolid.clone(); m.color.set(hex); if (m.emissive) m.emissive.set(hex).multiplyScalar(0.4); B.rider.traverse((o) => { if (o.material === mSolid) o.material = m; }); B.visor.material = glow(hex, 2.4); };
suit(Br, RED); suit(Bg, GREEN);
const hand = box(0.14, 0.11, 0.14, 0.39, 1.09, -0.5, glow(GREEN, 3), false); Bg.lean.add(hand);
const bR = beam(RED, 2.4, 0.07), bG = beam(GREEN, 2.4, 0.07);

title("100 DAYS ON A MOTORCYCLE");
cap("s1", "hundred", ["100 DAYS", "EARLIER"], RED, { n: 2 });
cap("s2", "day", ["DAY 1", "4 STALLS"], RED);
cap("s3", "day", ["DAY 3", "DROPS THE BIKE"], RED, { until: ["s3", "nobody"] });
cap("s3", "nobody", ["NOBODY", "SEES"], WHITE, { until: ["s3", "it"] });
cap("s3", "it", ["IT STILL", "HURTS"], RED);
cap("s4", "day", ["DAY 12", "FIRST CORNER"], WHITE, { until: ["s4", "grabs"] });
cap("s4", "grabs", ["BRAKE", "MID-CORNER"], RED, { until: ["s4", "bike"] });
cap("s4", "bike", ["THE BIKE", "STANDS UP"], RED, { until: ["s4", "heart"], boom: 0.6 });
cap("s4", "heart", ["HEART IN", "HER THROAT"], RED);
cap("s5", "day", ["DAY 30", "EYES DOWN"], RED, { until: ["s5", "starts"] });
cap("s5", "starts", ["LOOK WHERE", "YOU WANT TO GO"], GREEN);
cap("s6", "day", ["DAY 60", "SAME CORNER"], GREEN, { until: ["s6", "no"] });
cap("s6", "no", ["NO BRAKE", "MID-CORNER"], GREEN, { until: ["s6", "day"], untilN: 2 });
cap("s6", "day", ["DAY 100", "AGAIN"], WHITE, { n: 2, until: ["s6", "two"] });
cap("s6", "two", ["TWO FINGERS", "ON THE BRAKE"], GREEN, { until: ["s6", "she"] });
cap("s6", "she", ["STOPS.", "BREATHES."], GREEN, { until: ["s6", "rides"] });
cap("s6", "rides", "RIDES ON", GREEN);
endCard(["NOBODY IS BORN SMOOTH.", "100 ORDINARY DAYS."]);

// ---- shots (K offsets local to the anchor; world = absolute coordinates) ----
const fol = (fn) => (t) => pathState(fn, t), world = () => ({ x: 0, z: 0, h: 0 });
const W = (at, a, b, dur, calm) => ({ at, f: world, noRot: true, calm, K: [[0, a], [dur, b]] });
const [cx, cz] = Pc(104, 0); // mid-corner
const corner = (fn) => (t) => { const [x, z] = fn(t); return [cx + 7, 7, cz + 12, x, 0.6, z, 50]; }; // high view that keeps the bike in frame
const SH = [
  { at: 0, f: fol(fnA), K: [[0, [0.9, 2.6, 6.5, 1.5, 1.0, -10, 50]], [tStops1, [0.6, 2.2, 5.0, 1.5, 1.0, -10, 50]]] },
  W(tStops1 - 0.25, [-5.5, 1.8, -J + 11, 2.6, 0.8, -J + 2.6, 50], [-4.6, 2.3, -J + 9.5, 2.0, 0.8, -J + 2.6, 50], tLot - tStops1 + 0.25),
  W(tLot, [X0 + 6, 4, 7, X0, 0.5, -2, 50], [X0 + 5, 4.8, 8, X0, 0.5, -2, 50], T2 - tLot),
  W(T2, [X0 + 12, 2.0, -24.5, X0, 0.9, -25, 50], [X0 + 11, 2.3, -28.5, X0, 0.9, -29.5, 50], T3 - T2),
  W(T3, [B3[0] + 2.6, 1.5, B3[1] + 4.2, B3[0], 0.8, B3[1], 50], [B3[0] + 6.5, 6.5, B3[1] + 11, B3[0], 0.4, B3[1], 50], T4 - T3),
  { at: T4, f: fol(fn4), K: [[0, [0.3, 2.3, 6.0, 0.6, 1.0, -8, 50]], [tGrab - T4, [0.2, 2.0, 5.0, 0.6, 1.0, -8, 50]]] },
  { at: tGrab - 0.1, f: world, noRot: true, cam: corner(fn4) },
  { at: tHeart - 0.1, f: fol(fn4), K: [[0, [1.6, 1.5, -4.6, 0, 1.2, 0, 44]], [T5 - tHeart + 0.1, [1.0, 1.6, -3.6, 0, 1.25, 0, 44]]] },
  { at: T5, f: fol(fn5), K: [[0, [1.2, 1.9, 4.6, -0.2, 0.5, -4.5, 50]], [tStarts - T5, [1.0, 2.1, 5.2, -0.2, 0.6, -5, 50]]] },
  { at: tStarts - 0.1, f: fol(fn5), K: [[0, [0.4, 3.0, 6.5, 0.8, 0.8, -12, 50]], [T6 - tStarts + 0.1, [0.4, 3.6, 7.5, 1.6, 0.8, -14, 50]]] },
  { at: T6, f: world, noRot: true, cam: corner(fn6) },
  { at: tJ, f: fol(fnJ), K: [[0, [0.9, 2.6, 6.5, 1.5, 1.0, -10, 50]], [tTwo - tJ, [0.6, 2.2, 5.0, 1.5, 1.0, -10, 50]]] },
  { at: tTwo - 0.05, f: fol(fnJ), K: [[0, [1.5, 2.7, 1.5, 0.35, 0.9, -0.9, 40]], [tStops6 - tTwo, [1.3, 2.5, 1.2, 0.35, 0.9, -0.9, 40]]] }, // the hand on the lever
  W(tStops6 - 0.1, [-5.5, 1.8, -J + 11, 2.6, 0.8, -J + 2.6, 50], [-4.6, 2.3, -J + 9.5, 2.0, 0.8, -J + 2.6, 50], tRides - tStops6 + 0.1),
  { at: tRides - 0.1, f: laneJ, K: [[0, [-0.8, 2.0, 5.5, 0.3, 0.9, -6, 50]], [T8 - tRides + 0.1, [-0.8, 3.6, 8.5, 0.3, 0.9, -7, 50]]] },
  { at: T8 - 0.05, f: laneJ, K: [[0, [-2.0, 6.5, 6.0, 0, 0, 2.5, 50]], [TE - T8, [1.6, 7.5, 7.0, 0, 0, 3.0, 50]]] }, // CTA: she rides on above the text, camera arcs so the card never stands still
];

run("w", (t) => {
  // junction car: only while a junction scene plays
  const eC = t < tLot ? e1(t) : t >= tJ ? e6(t) : null;
  car.set(eC == null ? null : carSt(eC));
  // red Maya: the first twelve days
  const k3 = t >= T3 && t < T4 ? sm(tDrops, tDrops + 0.45, t) : 0;
  const fR = t >= tLot && t < T2 ? fnLot : t >= T2 && t < T3 ? fn2 : t >= T3 && t < T4 ? fn3 : t >= T4 && t < T5 ? fn4 : t >= T5 && t < tStarts - 0.1 ? fn5 : null;
  const stR = ride(Br, fR, t, RED, fR === fn3 ? { lean: downLean(k3, -1), down: k3, still: true, trail: false } : { trail: fR !== fn2 });
  if (fR !== fn3) Br.lean.rotation.z = Math.max(-0.5, Math.min(0.5, Br.lean.rotation.z));
  pose(maya, { x: B3[0] + 1.25, z: B3[1] + 0.2, h: 0.5 + Math.PI / 2, vis: k3 >= 0.5, hex: RED, armR: 0.35 * sm(tNobody, tNobody + 0.4, t), armL: 0.35 * sm(tNobody, tNobody + 0.4, t) });
  // green Maya: day 30 on (and the opening)
  const fG = t < tLot ? fnA : t >= tStarts - 0.1 && t < T6 ? fn5 : t >= T6 && t < tJ ? fn6 : t >= tJ ? fnJ : null;
  const stG = ride(Bg, fG, t, GREEN, { trail: t < T8 - 0.05 }); // no trail under the CTA text
  Bg.lean.rotation.z = Math.max(-0.5, Math.min(0.5, Bg.lean.rotation.z));
  hand.visible = t >= tTwo - 0.1;
  // day 12: where she ends up, on the wrong side of the road
  const [wx, wz] = fn4(T5); wide.position.set(wx, 0.03, wz); wide.set(t >= T4 && t < T5 ? 0.9 * sm(tStands + 0.3, tStands + 0.8, t) : 0);
  // day 30: the sight line lifts from the front wheel to the corner exit
  const st5 = stG || stR; if (st5 && t >= T5 && t < T6) {
    const k = sm(tStarts, tLooking + 0.25, t), q = s5(t) + 3.2 + 30 * k, [fx, fz] = Pc(q, 1.8), A = v3(st5.x, 1.6, st5.z), B = v3(fx, 0.05 + 0.3 * k, fz);
    bR.set(A, B, 0.9 * (1 - k)); bG.set(A, B, 0.9 * k);
    exitP.position.set(fx, 0.03, fz); exitP.set(0.9 * k);
  } else { bR.set(v3(0, 0, 0), v3(0, 0, 1), 0); bG.set(v3(0, 0, 0), v3(0, 0, 1), 0); exitP.set(0); }
  const shot = shoot(SH, t);
  tagAt(tExit, X0, 3.6, -38, t >= tLot && t < T4 ? 1 : 0, 1.6);
  bloom.strength = 0.8 + 1.2 * shot.punch * shot.punch + overlays(t);
});
