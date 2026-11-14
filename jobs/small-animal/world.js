// 109 small-animal: wrong = rider yanks the bars for a small animal, runs wide into the oncoming lane and hits a car (red).
// Right = brake hard in a straight line, eyes where you want to go, if you must hit it stay upright with steady throttle (green).
import { THREE, S, g, sm, flash, scene, camera, bloom, box, beam, patch, glow, makeCar, VIOLET, ORANGE, RED, GREEN, pathState, shoot, run } from "./kit.js";
import { track, buildRoad, makePerson, pose, title, endCard, cap, overlays, bikes, ride, downLean, tag, tagAt } from "./extra.js";

// ---- prop: a small four-legged animal (fox-ish), walks along x ----
function makeAnimal() {
  const a = new THREE.Group(), m = new THREE.MeshStandardMaterial({ color: 0xd9822b, emissive: new THREE.Color(0xd9822b).multiplyScalar(0.55), roughness: 0.6 });
  const legs = [];
  a.add(box(0.44, 0.2, 0.2, 0, 0.3, 0, m), box(0.18, 0.17, 0.17, 0.28, 0.4, 0, m), box(0.09, 0.07, 0.08, 0.41, 0.37, 0, m),
    box(0.04, 0.08, 0.04, 0.27, 0.52, 0.05, m), box(0.04, 0.08, 0.04, 0.27, 0.52, -0.05, m));
  const tail = box(0.3, 0.07, 0.07, -0.34, 0.36, 0, m); tail.rotation.z = 0.5; a.add(tail);
  for (const [x, z] of [[0.16, 0.07], [0.16, -0.07], [-0.16, 0.07], [-0.16, -0.07]]) { const l = box(0.05, 0.22, 0.05, x, 0.11, z, m); legs.push(l); a.add(l); }
  a.scale.setScalar(1.4); scene.add(a);
  a.setA = (x, z, dir, t, vis = true, walk = 1) => { // dir +1 walks to +x
    a.visible = vis; if (!vis) return;
    a.position.set(x, 0, z); a.rotation.y = dir > 0 ? 0 : Math.PI;
    legs.forEach((l, i) => (l.rotation.z = walk * 0.5 * Math.sin(t * 16 + (i % 2 ? 0 : Math.PI))));
  };
  return a;
}

// ---- path integrator (straight road toward -z) -> [x, z, 0] ----
function integ(t0, t1, x0, z0, vF, xF) {
  const dt = 0.01, n = Math.ceil((t1 - t0) / dt) + 1, Z = [z0];
  for (let i = 1; i < n; i++) Z.push(Z[i - 1] - vF(t0 + (i - 0.5) * dt) * dt);
  return (t) => { const f = Math.min(n - 1.001, Math.max(0, (t - t0) / dt)), i = Math.floor(f), r = f - i; return [xF ? xF(t) : x0, Z[i] + (Z[i + 1] - Z[i]) * r, 0]; };
}

const { P } = track([{ len: 4000 }]);
buildRoad(P, -80, 2100, { LW: 3.6, lamps: true });
const T2 = S.s2[0], T3 = S.s3[0], T4 = S.s4[0], T5 = S.s5[0], T6 = S.s6[0], T7 = S.s7[0], TE = S.s8[0] + S.s8[1];
const on = (t, a, b = 1e9) => sm(a - 0.1, a + 0.2, t) * (1 - sm(b - 0.15, b, t));
const V3 = (x, y, z) => new THREE.Vector3(x, y, z);

// ---- A: animal crosses, rider yanks the bars, runs wide into the oncoming lane and hits a car ----
const tYank = g("s2", "yank"), tHit = g("s2", "hit"), kD = (t) => sm(tHit + 0.05, tHit + 0.6, t);
const VA = 14;
const aX = (t) => 1.8 - 3.8 * sm(tYank - 0.1, tYank + 1.3, t);
const aPath = (t) => [aX(t), t < tHit ? -VA * t : -VA * tHit - 1.2 * sm(tHit, tHit + 0.4, t), 0];
const zHit = -VA * tHit, zCarHit = zHit - 0.68 - 2.17;
const carAZ = (t) => (t < tHit ? zCarHit + 12 * (t - tHit) : zCarHit + 0.4 * sm(tHit, tHit + 0.3, t)); // drives toward +z
const carA = makeCar({ color: 0x1a1534, driver: true });
const zAnA = -VA * tYank - 9; // animal is 9 m ahead when he yanks
const anAX = (t) => 4.2 - 2.0 * (t - 0.6); // walks right to left, in his lane at the yank

// ---- B: brakes hard in a straight line and stops short of the animal ----
const tBrk = g("s3", "brake");
const bPath = integ(T3 - 1, T4 + 0.5, 1.8, -400, (t) => VA * (1 - sm(tBrk, tBrk + 1.5, t)));
const zStopB = bPath(tBrk + 1.7)[1], zAnB = zStopB - 3.2;
// ---- C: eyes on the open road, not on the animal (rolls slowly past behind it) ----
const cPath = integ(T4 - 1, T5 + 0.5, 1.8, -700, () => 6);
const zAnC = cPath(T4 + 1.6)[1] - 7;
// ---- D: has to hit it: stays upright, steady throttle, small bump ----
const tBump = g("s5", "upright") + 0.15;
const dPath = integ(T5 - 1, T6 + 0.5, 1.8, -1000, () => 10);
const zAnD = dPath(tBump)[1] - 0.7;
// ---- E: compare: small bump in his lane vs the oncoming lane ----
const ePath = integ(T6 - 1, T7 + 0.5, 1.8, -1300, () => 6);
const carE = makeCar({ color: 0x5246c8, driver: true });
const eCarZ = (t) => -1325 + 10 * (t - T6);
// ---- G: rides on ----
const gPath = integ(T7 - 1, TE + 1, 1.8, -1600, () => 9);

// ---- actors + overlays ----
const [Bk] = bikes(1), THROWN = makePerson(), AN = makeAnimal();
const hit = patch(2.0, 1.0, RED, 1.6), stopG = patch(1.4, 1, GREEN, 0.9), safeG = patch(2.6, 6, GREEN, 0.8), badR = patch(2.6, 8, RED, 0.8);
const eyeG = beam(GREEN, 2.2, 0.035), eyeR = beam(RED, 2.2, 0.025);
const tAn = tag("SMALL ANIMAL", ORANGE), tCar = tag("ONCOMING CAR", RED), tLook = tag("LOOK HERE", GREEN), tBump2 = tag("SMALL BUMP", GREEN), tLane = tag("ONCOMING LANE", RED),
  tUp = tag("UPRIGHT", GREEN), tSpd = tag("36 KM/H STEADY", GREEN);

title("NEVER SWERVE FOR A SMALL ANIMAL");
cap("s2", "yank", ["YOU YANK", "THE BARS"], RED, { y: 0.3, until: ["s2", "run"] });
cap("s2", "run", "YOU RUN WIDE", RED, { y: 0.3, until: ["s2", "and"] });
cap("s2", "and", ["AND HIT THE", "ONCOMING CAR"], RED, { y: 0.3, boom: 0.6 });
cap("s3", "brake", ["BRAKE HARD", "IN A STRAIGHT LINE"], GREEN, { y: 0.3 });
cap("s4", "keep", ["EYES WHERE", "YOU WANT TO GO"], GREEN, { y: 0.3, until: ["s4", "not"] });
cap("s4", "not", "NOT ON THE ANIMAL", RED, { y: 0.3 });
cap("s5", "if", "HAVE TO HIT IT?", ORANGE, { y: 0.3, until: ["s5", "keep"] });
cap("s5", "keep", ["BIKE UPRIGHT", "THROTTLE STEADY"], GREEN, { y: 0.3 });
cap("s6", "a", ["A SMALL BUMP", "BEATS AN ONCOMING LANE"], GREEN, { y: 0.3 });
endCard(["BRAKE STRAIGHT.", "DON'T SWERVE."]);

// ---- shots ----
const fol = (fn) => (t) => pathState(fn, t);
const SH = [
  { at: 0, f: fol(aPath), noRot: true, K: [[0, [-1.0, 3.2, 8.0, 0.3, 0.6, -14, 50]], [T2, [-0.8, 3.0, 7.0, 0.3, 0.5, -12, 50]]] },
  { at: tYank - 0.3, f: fol(aPath), noRot: true, K: [[0, [0.6, 4.2, 9.0, -1.2, 0.6, -14, 50]], [1.5, [1.4, 5.0, 10.0, -1.8, 0.5, -10, 50]]] },
  { at: tHit - 0.3, K: [[0, [-8.0, 3.2, zHit + 5.5, -1.8, 0.8, zHit - 1.0, 50]], [1.6, [-7.5, 3.6, zHit + 4.5, -1.8, 0.6, zHit - 1.5, 50]]] },
  { at: T3, f: fol(bPath), noRot: true, K: [[0, [-2.4, 3.6, 8.5, 0.3, 0.5, -12, 50]], [2.2, [-2.6, 4.2, 9.5, 0.3, 0.4, -10, 50]]] },
  { at: T4, f: fol(cPath), noRot: true, K: [[0, [-1.2, 3.4, 5.5, 0.2, 0.8, -10, 50]], [2.4, [-1.2, 3.6, 5.5, 0.2, 0.8, -10, 50]]] },
  { at: T5, f: fol(dPath), noRot: true, K: [[0, [1.6, 2.6, 6.5, -0.2, 0.7, -5, 50]], [2.8, [1.8, 2.4, 5.5, -0.2, 0.7, -5, 50]]] },
  { at: T6, f: fol(ePath), noRot: true, K: [[0, [-1.8, 13, 6.0, -1.8, 0, -12, 50]], [1.8, [-1.8, 14, 6.5, -1.8, 0, -12, 50]]] },
  { at: T7, f: fol(gPath), noRot: true, K: [[0, [-2.0, 4.5, 9.5, 0.4, 1.0, -30, 50]], [4.3, [-2.0, 6.5, 12.0, 0.4, 0.8, -30, 50]]] },
];

run("w", (t) => {
  let st;
  const A = t < T3;
  carA.set(A ? { x: -1.8, z: carAZ(t), h: Math.PI } : null);
  carE.set(t >= T6 && t < T7 ? { x: -1.8, z: eCarZ(t), h: Math.PI } : null);
  Bk.tail.material.color.set(RED).multiplyScalar(t >= T3 && t < T4 && t > tBrk ? 12 : 3);
  if (A) {
    st = ride(Bk, aPath, t, RED, { lean: downLean(kD(t), -1), down: kD(t), trail: false });
    AN.setA(Math.max(-4.5, anAX(t)), zAnA, -1, t);
    if (t >= tHit) { // thrown up onto the bonnet and over the roof
      const u = Math.min(1, (t - tHit) / 0.5);
      pose(THROWN, { x: -1.8 + 0.2 * u, z: zHit + 0.1 + 2.0 * u, h: 0, lie: 0.35 + 0.65 * u, armR: 2.4, armL: 1.9, hex: RED });
      THROWN.g.position.y += 0.9 * u + 0.7 * Math.sin(Math.PI * u) - 0.2 * sm(0.6, 1, u);
    } else pose(THROWN, { vis: false });
    tagAt(tAn, Math.max(-4.5, anAX(t)), 1.3, zAnA, on(t, g("s1", "small"), tYank) * 0.9, 1.4);
    tagAt(tCar, -1.8, 2.5, carAZ(t), on(t, g("s2", "run"), tHit - 0.1), 2.0);
    hit.position.set(-1.8, 0.03, zHit - 0.3); hit.set(t > tHit - 0.05 ? on(t, tHit, T3) : 0);
  } else {
    pose(THROWN, { vis: false }); hit.set(0);
    const fn = t < T4 ? bPath : t < T5 ? cPath : t < T6 ? dPath : t < T7 ? ePath : gPath;
    const bump = t >= T5 && t < T6 ? 0.18 * Math.max(0, Math.sin(Math.PI * Math.min(1, Math.max(0, (t - tBump + 0.1) / 0.35)))) : 0;
    st = ride(Bk, fn, t, t >= T5 && t < T6 ? VIOLET : GREEN, { trail: false });
    Bk.g.position.y += bump; Bk.g.rotation.x = -bump * 0.6;
    // animal per scene
    if (t < T4) AN.setA(3.5 - 1.4 * (t - T3), zAnB, -1, t);
    else if (t < T5) AN.setA(0.3 - 0.9 * (t - T4), zAnC, -1, t);
    else if (t < T6) { const k = sm(tBump - 0.05, tBump + 0.5, t); AN.setA(1.6 + 3 * k, zAnD + 0.4 * k, 1, t, true, 1); } // nudged off to the side, runs away
    else if (t < T7) AN.setA(1.8, -1318, -1, t, true, 0.3);
    else AN.setA(0, 0, 1, t, false);
  }
  // s3: stopping distance shrinks to a stop before the animal
  const sd = t >= T3 && t < T4 ? on(t, tBrk, T4) : 0, L = st ? Math.max(0.6, (st.v * st.v) / 18) : 1;
  stopG.scale.set(1, L, 1); stopG.position.set(1.8, 0.03, st ? st.z - 0.7 - L / 2 : 0); stopG.set(sd * 0.8);
  // s4: gaze
  const kE = t >= T4 && t < T5 ? on(t, g("s4", "eyes"), T5) : 0, kN = t >= T4 && t < T5 ? on(t, g("s4", "not"), T5) : 0;
  if (st) {
    const H = V3(st.x, 1.68, st.z - 0.2);
    eyeG.set(H, V3(1.8, 0.1, st.z - 16), kE);
    eyeR.set(H, V3(0.3 - 0.9 * (t - T4), 0.4, zAnC), kN * (0.35 + 0.25 * Math.sin(t * 18)));
    tagAt(tLook, 1.8, 0.6, st.z - 16, kE, 1.4);
    tagAt(tUp, st.x, 2.3, st.z, 0, 0.9);
    tagAt(tSpd, st.x, 0.5, st.z + 1.4, 0, 0.9);
  }
  // s6: compare lanes
  const k6 = t >= T6 && t < T7 ? on(t, T6 + 0.1, T7) : 0, k6b = t >= T6 && t < T7 ? on(t, g("s6", "oncoming"), T7) : 0;
  safeG.position.set(1.8, 0.03, -1318); safeG.set(k6 * 0.7); tagAt(tBump2, 1.8, 0.8, -1318, k6, 1.6);
  badR.position.set(-1.8, 0.03, -1318); badR.set(k6b * 0.7); tagAt(tLane, -1.0, 0.8, -1316, k6b, 1.4);
  const shot = shoot(SH, t);
  bloom.strength = 1.0 + 1.2 * shot.punch * shot.punch + overlays(t) + (A ? 1.0 * flash(t, tHit) : 0);
});
