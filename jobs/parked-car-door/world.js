// 102 parked-car-door: wrong = rider skims a row of parked cars, a door swings open, he hits it at full speed (red).
// Right = ride a door's width out (door zone shown), read the cars (a head, brake lights), a car pulls out with no
// signal -> cover the brakes and slow, keep space (green).
import { THREE, S, g, sm, flash, scene, bloom, box, glow, makeCar, VIOLET, ORANGE, RED, GREEN, pathState, shoot, run, patch } from "./kit.js";
import { track, buildRoad, makePerson, pose, title, endCard, cap, overlays, bikes, ride, downLean, tag, tagAt } from "./extra.js";

// ---- props: parked car with a driver door, dimmable tail lights, optional see-through cabin + head ----
const doorMat = (hex) => new THREE.MeshStandardMaterial({ color: hex, emissive: new THREE.Color(hex).multiplyScalar(0.5), roughness: 0.45, metalness: 0.3 });
function parked(s, { color = 0x4a42b8, see = false } = {}) {
  const C = makeCar({ color, driver: see });
  const [x, z] = P(s, CO); C.set({ x, z, h: 0 });
  const tails = C.g.children.filter((c) => c.isMesh && Math.abs(c.position.z - 2.16) < 0.05 && Math.abs(c.position.y - 0.74) < 0.05);
  tails.forEach((m) => { m.material = m.material.clone(); m.material.color.set(RED).multiplyScalar(0.12); });
  if (see) for (const c of C.g.children) if (c.isMesh && c.position.y > 1.1 && c !== C.driver) { c.material = c.material.clone(); c.material.transparent = true; c.material.opacity = 0.18; c.material.depthWrite = false; }
  const door = new THREE.Group(); door.position.set(-0.96, 0, -0.4); C.g.add(door);
  door.add(box(0.07, 0.62, 1.15, 0, 0.66, 0.575, doorMat(color)));
  const edgeM = glow(ORANGE, 0.6); door.add(box(0.09, 0.62, 0.06, 0, 0.66, 1.15, edgeM, false));
  return { C, door, edgeM, tails, s };
}

scene.fog.density = 0.008;
const { P } = track([{ len: 4000 }]);
buildRoad(P, -80, 1400);
const CO = 3.2, SC = 300;
const T2 = S.s2[0], T3 = S.s3[0], T4 = S.s4[0], T5 = S.s5[0], T6 = S.s6[0], T7 = S.s7[0];

// ---- A: wrong way, skimming the cars at o=1.7 ----
const tOpen = g("s2", "opens"), tHit = g("s2", "hit"), VA = 14, sHit = SC - 1.6;
const aS = (t) => (t < tHit ? sHit - VA * (tHit - t) : sHit + 2.4 * sm(tHit, tHit + 0.9, t));
const aPath = (t) => P(aS(t), 1.7 - 1.0 * sm(tHit, tHit + 0.9, t));
const [Bk] = bikes(1), THROWN = makePerson();

// ---- B: right way, a door's width out at o=0.3, slows for the car pulling out ----
const OB = 0.3, tCover = g("s5", "cover"), tDown = g("s5", "down");
const vB = (t) => 10 - 6 * sm(tCover - 0.1, tDown + 0.2, t) + 2 * sm(T6, T6 + 1.2, t);
const DB = (() => { const dt = 0.01, A = [0]; for (let t = T3; t < T7 + 5; t += dt) A.push(A.at(-1) + vB(t + dt / 2) * dt); return (t) => { const f = Math.max(0, (t - T3) / dt), i = Math.min(A.length - 2, Math.floor(f)); return A[i] + (A[i + 1] - A[i]) * (f - i); }; })();
const sB0 = SC + 30, sB = (t) => sB0 + DB(t), bPath = (t) => P(sB(t), OB);

// special cars: one with a driver's head and brake lights (s4), one that pulls out with no signal (s5)
const sHd = sB(g("s4", "head")) + 9;
const tPull = g("s5", "pulling") - 0.1, sC0 = sB(tPull) + 20;
const cPath = (t) => { const u = Math.max(0, t - tPull); return [...P(sC0 + 2.2 * u * u, CO - 2.3 * sm(0, 1.8, u))]; };

// parked row (skip slots where the special cars sit)
const row = [];
for (let s = SC - 56; s < SC + 200; s += 7) if (Math.abs(s - sHd) > 6 && Math.abs(s - sC0) > 6) row.push(parked(s, { color: [0x4a42b8, 0x3b3590, 0x5a4fd0][row.length % 3] }));
const doorCar = row.reduce((a, c) => (Math.abs(c.s - SC) < Math.abs(a.s - SC) ? c : a));
const HD = parked(sHd, { color: 0x5a4fd0, see: true });
const PULL = parked(sC0, { color: 0x3b3590 });

// overlays
const zone = patch(1.15, 260, RED, 0.5); zone.position.set(1.7, 0.03, -(SC + 90));
const tClose = tag("TOO CLOSE", RED), tDoor = tag("DOOR!", RED), tZone = tag("DOOR ZONE", RED), tWidth = tag("A DOOR'S WIDTH", GREEN),
  tHead = tag("HEAD", ORANGE), tBrake = tag("BRAKE LIGHTS", ORANGE), tNoSig = tag("NO SIGNAL", RED), tCov = tag("COVER BRAKES", GREEN), tSpace = tag("SPACE", GREEN);

title("NEVER RIDE CLOSE TO PARKED CARS");
cap("s2", "a", ["A DOOR OPENS", "WITHOUT WARNING"], RED, { until: ["s2", "and"], y: 0.3 });
cap("s2", "and", ["YOU HIT IT", "AT FULL SPEED"], RED, { y: 0.3, boom: 0.6 });
cap("s3", "ride", ["RIDE A DOOR'S WIDTH", "AWAY FROM PARKED CARS"], GREEN, { y: 0.3 });
cap("s4", "look", ["LOOK INSIDE THE CARS"], GREEN, { until: ["s4", "for"] });
cap("s4", "for", ["FOR A HEAD", "OR BRAKE LIGHTS"], GREEN);
cap("s5", "a", ["A CAR PULLING OUT,", "NO SIGNAL?"], RED, { until: ["s5", "cover"] });
cap("s5", "cover", ["COVER YOUR BRAKES", "AND SLOW DOWN"], GREEN);
cap("s6", "give", ["GIVE YOURSELF SPACE", "AND TIME TO REACT"], GREEN);
endCard(["ONE DOOR'S WIDTH.", "EVERY PARKED CAR."]);

const fol = (fn) => (t) => pathState(fn, t);
const cam = (s, o, y, ls, lo, ly, f) => { const [x, z] = P(s, o), [lx, lz] = P(ls, lo); return [x, y, z, lx, ly, lz, f]; };
const SH = [
  { at: 0, f: fol(aPath), noRot: true, K: [[0, [-1.6, 2.6, 6.5, 1.2, 1.0, -12, 50]], [2.5, [-1.8, 2.8, 6.0, 1.2, 1.0, -12, 50]]] },
  { at: T2, K: [[0, cam(SC + 6, -1.2, 2.3, SC - 3, 2.0, 0.9, 48)], [2.8, cam(SC + 5.5, -1.5, 2.1, SC - 1, 2.0, 0.8, 48)]] },
  { at: T3, f: fol(bPath), noRot: true, K: [[0, [-2.2, 6.5, 7.5, 1.2, 0, -9, 50]], [2.0, [-2.4, 6.8, 7.2, 1.2, 0, -10, 50]]] },
  { at: T4, f: fol(bPath), noRot: true, K: [[0, [-2.8, 3.0, 6.5, 2.6, 0.9, -10, 48]], [2.1, [-2.8, 3.0, 6.0, 2.6, 0.9, -10, 48]]] },
  { at: T5, f: fol(bPath), noRot: true, K: [[0, [-1.2, 3.0, 6.5, 0.9, 0.9, -13, 50]], [3.3, [-1.4, 3.2, 6.8, 0.9, 0.9, -13, 50]]] },
  { at: T6, f: fol(bPath), noRot: true, K: [[0, [-5, 11, 9, 1.2, 0, -5, 46]], [1.8, [-5, 12, 10, 1.2, 0, -5, 46]]] },
  { at: T7, f: fol(bPath), noRot: true, K: [[0, [-5, 12, 10, 1.2, 0, -5, 46]], [4, [-6, 16, 13, 1.2, 0, -7, 46]]] },
];

const on = (t, a, b = 1e9) => sm(a - 0.1, a + 0.2, t) * (1 - sm(b - 0.15, b, t));
run("w", (t) => {
  const A = t < T3;
  // doors: wrong way, the door car flings open; right way, the doors ahead swing open to show the zone in s3
  const show = A ? 0 : on(t, g("s3", "width"), T4);
  for (const c of row) {
    const o = c === doorCar && A ? sm(tOpen - 0.05, tOpen + 0.25, t) * (1 - 0.15 * sm(tHit, tHit + 0.2, t)) : show * 0.85 * (c.s > sB(t) + 3 ? 1 : 0);
    c.door.rotation.y = -1.1 * o; c.edgeM.color.set(A ? RED : ORANGE).multiplyScalar(0.6 + 2 * o);
  }
  let st;
  if (A) {
    const k = sm(tHit, tHit + 0.3, t);
    st = ride(Bk, aPath, t, t < T2 ? VIOLET : RED, k > 0 ? { lean: downLean(k, -1), down: k } : {});
    if (t > tHit + 0.1) { const [px, pz] = P(sHit + 3.2 * sm(tHit, tHit + 0.8, t), 1.1 - 0.8 * sm(tHit, tHit + 0.8, t)); pose(THROWN, { x: px, z: pz, h: 1.2, lie: sm(tHit + 0.1, tHit + 0.5, t), armR: 2.2, armL: 1.6, hex: RED }); } else pose(THROWN, { vis: false });
  } else {
    pose(THROWN, { vis: false });
    st = ride(Bk, bPath, t, GREEN, { trail: true });
  }
  // head + brake lights, the car that pulls out
  if (HD.C.driver) HD.C.driver.material.emissive.set(ORANGE).multiplyScalar(0.3 + 0.9 * on(t, g("s4", "head"), T5));
  HD.tails.forEach((m) => m.material.color.set(RED).multiplyScalar(0.12 + 3 * on(t, g("s4", "brake"), T5)));
  PULL.C.set(pathState(cPath, t));
  zone.set(A ? 0 : on(t, g("s3", "width"), T7 + 3) * 0.9);
  const [dx, dz] = P(SC - 0.6, 1.4);
  tagAt(tClose, st.x, 2.2, st.z, on(t, g("s1", "close"), T2), 1.1);
  tagAt(tDoor, dx, 1.7, dz, A ? on(t, g("s2", "door"), g("s2", "and")) : 0, 1.2);
  const [zx, zz] = P(sB(t) + 9, 1.7);
  tagAt(tZone, zx, 1.9, zz, A ? 0 : on(t, g("s3", "width"), T4), 1.3);
  tagAt(tWidth, st.x - 0.4, 2.3, st.z, A ? 0 : on(t, g("s3", "away"), T4), 1.2);
  const [hx, hz] = P(sHd + 0.4, CO), [bx, bz] = P(sHd - 2.3, CO);
  tagAt(tHead, hx, 2.1, hz, on(t, g("s4", "head"), T5), 1.0);
  tagAt(tBrake, bx, 1.4, bz, on(t, g("s4", "brake"), T5), 1.0);
  const pc = pathState(cPath, t);
  tagAt(tNoSig, pc.x, 2.2, pc.z, on(t, g("s5", "no"), tCover), 1.2);
  tagAt(tCov, st.x - 1.8, 1.2, st.z - 1.0, on(t, tCover, T6), 1.1);
  const [sx, sz] = P(sB(t) + 6, OB);
  tagAt(tSpace, sx, 0.8, sz, on(t, g("s6", "space"), T7), 1.4);
  const shot = shoot(SH, t);
  bloom.strength = 1.0 + 1.2 * shot.punch * shot.punch + overlays(t) + (A ? 0.8 * flash(t, tHit) : 0);
});
