// 150 oily-center: wrong = the rider stops at a junction behind a dripping car, puts his left foot on the dark oily stripe in the
// middle of the lane, the boot slips and the bike falls (red). Right = spot the dark stripe, stop with the wheels in the tyre track,
// foot down on clean road, ride off on solid ground (green).
import { THREE, S, g, sm, flash, scene, bloom, box, glow, beam, makeCar, VIOLET, ORANGE, RED, GREEN, WHITE, shoot, run } from "./kit.js";
import { track, buildRoad, makePerson, pose, title, endCard, cap, overlays, bikes, ride, downLean, limbs } from "./extra.js";

scene.fog.density = 0.012;
const { P } = track([{ len: 3000 }]);
buildRoad(P, -80, 600, { lamps: false });
const T2 = S.s2[0], T3 = S.s3[0], T4 = S.s4[0], T5 = S.s5[0], T6 = S.s6[0], T7 = S.s7[0];
const O = 1.8, sL = 120;                  // lane centre offset, stop line
const sCar = sL - 2.6, sStop = sL - 7.2;  // car waits at the line, the bike stops behind it
const OA = O + 0.45, OB = O - 0.93;       // wrong: bike near the middle (left foot lands in the stripe); right: wheels in the left tyre track
const FA = OA - 0.5, FB = OB - 0.5;       // where the left boot lands

// ---- props: stop line, dark oily stripe down the middle, the two tyre tracks ----
const strip = (s0, s1, o, w, y, mat) => { const [x0, z0] = P(s0, o), [x1, z1] = P(s1, o); const L = Math.hypot(x1 - x0, z1 - z0); const m = box(w, 0.012, L, (x0 + x1) / 2, y, (z0 + z1) / 2, mat, false); m.rotation.y = Math.atan2(x1 - x0, z1 - z0); scene.add(m); return m; };
const mLine = glow(WHITE, 0.5); { const [lx, lz] = P(sL, O); scene.add(box(3.5, 0.02, 0.4, lx, 0.015, lz, mLine, false)); }
const mOil = new THREE.MeshStandardMaterial({ color: 0x020104, metalness: 0.9, roughness: 0.12, emissive: 0x000000 });
strip(sL - 40, sL - 0.3, O, 0.7, 0.012, mOil);
const mSheen = glow(ORANGE, 0.25); mSheen.transparent = true; mSheen.blending = THREE.AdditiveBlending; mSheen.depthWrite = false;
for (const d of [-0.33, 0.33]) strip(sL - 40, sL - 0.3, O + d, 0.04, 0.016, mSheen); // stripe edges
const mTrk = glow(VIOLET, 0.35); mTrk.transparent = true; mTrk.blending = THREE.AdditiveBlending; mTrk.depthWrite = false;
for (const d of [-0.93, 0.93]) strip(sL - 40, sL - 0.3, O + d, 0.42, 0.014, mTrk);
const spot = new THREE.Mesh(new THREE.TorusGeometry(0.22, 0.025, 8, 32), glow(GREEN, 2.5)); spot.rotation.x = Math.PI / 2; scene.add(spot);
{ const [x, z] = P(sStop, FB); spot.position.set(x, 0.03, z); }
const bad = new THREE.Mesh(new THREE.TorusGeometry(0.22, 0.025, 8, 32), glow(RED, 2.5)); bad.rotation.x = Math.PI / 2; scene.add(bad);
{ const [x, z] = P(sStop, FA); bad.position.set(x, 0.03, z); }
// oil drops falling from the waiting car's engine onto the middle of the lane
const DROPS = Array.from({ length: 5 }, () => { const m = new THREE.Mesh(new THREE.SphereGeometry(0.035, 8, 6), glow(ORANGE, 2.5)); scene.add(m); return m; });

// ---- motion ----
const integ = (v, a, b) => { let d = 0; const n = 120, h = (b - a) / n; for (let i = 0; i < n; i++) d += v(a + (i + 0.5) * h) * h; return d; };
const tStopA = g("s1", "foot") - 0.35, tFootA = g("s1", "middle") - 0.1, tSlip = g("s2", "slips"), tFall = g("s2", "falls") - 0.1;
const vA = (t) => 8 * (1 - sm(0, tStopA, t) ** 0.7);
const pA = (t) => { const s = t >= tStopA ? sStop : sStop - integ(vA, t, tStopA); const [x, z] = P(s, OA); return [x, z, 0]; };
const tStopB = g("s4", "tracks") + 0.1, tFootB = g("s5", "down"), tGo = g("s6", "ride");
const vB = (t) => (t < tGo ? 6 * (1 - sm(T3 + 0.2, tStopB, t)) : 7 * sm(tGo, tGo + 1.2, t));
const pB = (t) => { const s = t < tGo ? (t >= tStopB ? sStop : sStop - integ(vB, t, tStopB)) : sStop + integ(vB, tGo, t); const [x, z] = P(s, OB); return [x, z, 0]; };
// the car: waits at the line, pulls away at "Cars" (wrong run) / "cars" in s4 (right run)
const tCarA = T2 - 0.3, tCarB = g("s4", "cars") - 0.15;
const carS = (t) => { const t0 = t < T3 ? tCarA : tCarB; return sCar + (t > t0 ? 2.2 * (t - t0) ** 2 : 0); };

const [Bk] = bikes(1), LB = limbs(Bk), legL = Bk.rider.children[Bk.rider.children.length - 2], VICTIM = makePerson();
legL.scale.y = 1.6;
const car = makeCar({ driver: true });
const sight = beam(GREEN, 2.2, 0.025), sightO = beam(ORANGE, 1.6, 0.02);

title("NEVER STOP IN THE MIDDLE OF THE LANE");
cap("s1", "junction", ["STOPPING AT", "A JUNCTION?"], VIOLET, { until: ["s1", "never"] });
cap("s2", "drip", ["CARS DRIP OIL", "IN THE MIDDLE"], RED, { until: ["s2", "boot"] });
cap("s2", "boot", ["YOUR BOOT SLIPS"], RED, { boom: 0.6 });
cap("s3", "dark", ["SPOT THE", "DARK STRIPE"], ORANGE);
cap("s4", "stop", ["STOP IN THE", "TYRE TRACKS"], GREEN);
cap("s5", "foot", ["FOOT DOWN ON", "CLEAN ROAD"], GREEN);
cap("s6", "ride", ["RIDE OFF ON", "SOLID GROUND"], GREEN);
endCard(["STOP IN THE TYRE TRACKS.", "AVOID THE OILY MIDDLE."]);

const cam = (s, o, y, ls, lo, ly, f) => { const [x, z] = P(s, o), [lx2, lz2] = P(ls, lo); return [x, y, z, lx2, ly, lz2, f]; };
const SH = [
  { at: 0, K: [[0, cam(sStop - 9, O - 4.5, 3.2, sStop + 1, O, 0.5, 48)], [tStopA, cam(sStop - 4, O - 5.0, 3.0, sStop + 1.5, O, 0.4, 46)], [3.2, cam(sStop - 2.5, O - 5.0, 2.6, sStop + 0.5, O, 0.3, 46)]] },
  { at: T2, K: [[0, cam(sStop + 4.5, FA - 5.2, 2.6, sStop + 0.5, FA, 0.3, 46)], [2.6, cam(sStop + 4.0, FA - 5.0, 2.4, sStop + 0.2, FA, 0.3, 46)]] },
  { at: T3, K: [[0, cam(sStop - 15, O - 2.0, 5.2, sStop + 2, O, 0, 48)], [1.9, cam(sStop - 13.5, O - 1.8, 5.0, sStop + 2, O, 0, 48)]] },
  { at: T4, K: [[0, cam(sStop - 6, O + 3.6, 5.4, sStop + 1, O - 0.3, 0, 48)], [2.0, cam(sStop - 5, O + 3.4, 5.0, sStop + 1, O - 0.3, 0, 48)]] },
  { at: T5, K: [[0, cam(sStop + 3.0, FB - 4.0, 1.4, sStop, FB - 0.1, 0.3, 44)], [1.4, cam(sStop + 2.7, FB - 3.8, 1.3, sStop, FB - 0.1, 0.3, 44)]] },
  { at: T6, K: [[0, cam(sStop + 4.0, OB - 4.5, 2.4, sStop + 0.5, OB, 0.5, 46)], [1.8, cam(sStop + 8.5, OB - 4.8, 2.4, sStop + 6, OB, 0.5, 46)]] },
  { at: T7, K: [[0, cam(sStop - 6, O - 3.5, 6.5, sStop + 4, O, 0, 50)], [2.4, cam(sStop - 6, O + 3.0, 6.5, sStop + 4, O, 0, 50)]] },
];
const wp = (o, v = new THREE.Vector3()) => o.getWorldPosition(v);
const legA = (k) => 0.05 + 0.3 * k;
run("w", (t) => {
  const A = t < T3;
  // car
  const cs = carS(t), [cx, cz] = P(cs, O);
  car.set(cs < sL + 60 && t < T7 ? { x: cx, z: cz, h: 0 } : null);
  // drops: under the waiting car's engine, falling onto the middle
  const dropOn = A ? t < T2 + 0.6 : t < tCarB + 0.3;
  DROPS.forEach((m, i) => { const u = (t * 1.5 + i / DROPS.length) % 1; m.visible = dropOn; const [x, z] = P(Math.min(cs, sCar + 0.5) - 1.4 + 0.15 * i, O); m.position.set(x, 0.45 * (1 - u * u), z); m.material.color.set(ORANGE).multiplyScalar(2.5 + (A && t > T2 ? 2 * flash(t, g("s2", "drip")) : 0)); });
  if (A) {
    const foot = sm(tFootA - 0.3, tFootA, t), slip = sm(tSlip, tSlip + 0.35, t), k = sm(tFall, tFall + 0.45, t);
    const lean = 0.1 * foot + 0.35 * slip * (1 - k) + downLean(k, 1);
    ride(Bk, pA, t, t < T2 ? VIOLET : RED, { lean, down: k, trail: t < tStopA - 0.3 });
    LB.set(foot > 0 ? { leg: -1, legA: legA(foot) + 0.9 * slip, glow: 1 + 2 * slip } : {});
    const [vx, vz] = P(sStop + 0.2, OA - 1.0);
    pose(VICTIM, { x: vx, z: vz, h: Math.PI / 2, lie: 1, armR: 0.6, armL: 1.2, vis: k > 0.5 });
    mSheen.color.set(t > T2 ? RED : ORANGE).multiplyScalar(0.25 + 1.6 * sm(g("s1", "middle") - 0.1, g("s1", "middle") + 0.2, t) + (t > T2 ? 1.5 * sm(g("s2", "oil") - 0.1, g("s2", "oil") + 0.2, t) : 0));
    bad.visible = foot > 0.5; bad.material.color.set(RED).multiplyScalar(2 + 3 * (t > T2 ? flash(t, tSlip) : flash(t, tFootA)));
    spot.visible = false; mTrk.color.set(VIOLET).multiplyScalar(0.35);
    sight.set(wp(Bk.visor), wp(Bk.visor), 0); sightO.set(wp(Bk.visor), wp(Bk.visor), 0);
  } else {
    pose(VICTIM, { vis: false });
    const foot = sm(tFootB - 0.3, tFootB, t) * (1 - sm(tGo + 0.1, tGo + 0.4, t));
    ride(Bk, pB, t, t < T4 ? VIOLET : GREEN, { lean: 0.1 * foot, trail: t < tStopB - 0.3 || t > tGo + 0.3 });
    LB.set(foot > 0 ? { leg: -1, legA: legA(foot), glow: 1 } : {});
    bad.visible = false;
    // s3: look down at the dark stripe; s4: the tyre tracks light up green
    const lk = t < T4 ? sm(g("s3", "look") - 0.1, g("s3", "look") + 0.25, t) : t > T5 && t < T6 ? sm(T5, T5 + 0.25, t) : 0;
    Bk.headG.rotation.x = -0.45 * lk;
    const [sx, sz] = P(sStop + 3, O);
    sightO.set(wp(Bk.visor), new THREE.Vector3(sx, 0.05, sz), t < T4 ? lk : 0);
    sight.set(wp(Bk.visor), spot.position.clone(), t < T4 ? 0 : lk);
    mSheen.color.set(t < T4 ? ORANGE : RED).multiplyScalar(t < T4 ? 0.3 + 2.2 * sm(g("s3", "dark") - 0.1, g("s3", "stripe") + 0.1, t) + 1.5 * flash(t, g("s3", "stripe")) : t > T7 ? 0.6 + 1.5 * sm(g("s7", "oily") - 0.1, g("s7", "oily") + 0.2, t) : 0.5);
    const kT = t < T4 ? 0 : t < T7 ? 1 : sm(g("s7", "tracks") - 0.2, g("s7", "tracks"), t);
    mTrk.color.set(kT > 0 ? GREEN : VIOLET).multiplyScalar(0.3 + 0.35 * kT * (t < T5 ? sm(g("s4", "tyre") - 0.1, g("s4", "tracks") + 0.1, t) : 1) + (t > T4 && t < T5 ? 0.4 * flash(t, g("s4", "tracks")) : 0));
    spot.visible = t > tFootB - 0.2; spot.material.color.set(GREEN).multiplyScalar(2 + 3 * flash(t, t < T6 ? g("s5", "clean") : g("s6", "solid")));
  }
  const shot = shoot(SH, t);
  bloom.strength = 1.0 + 1.2 * shot.punch * shot.punch + overlays(t) + (A ? 0.9 * flash(t, tFall + 0.3) : 0);
});
