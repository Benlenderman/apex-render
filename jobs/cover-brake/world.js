// 151 cover-brake: town street, a parked car pulls out. Wrong = fingers wrapped on the throttle grip, the hand has to travel to the
// lever first, braking starts late and the bike bumps the car (red). Right = two fingers resting on the front brake lever, braking
// starts at once and the bike stops well short (green). Bars on the road show reaction distance + braking distance for both.
import { THREE, S, g, sm, flash, scene, bloom, box, glow, makeCar, pathState, VIOLET, ORANGE, RED, GREEN, WHITE, shoot, run } from "./kit.js";
import { track, buildRoad, title, endCard, cap, overlays, bikes, ride } from "./extra.js";

scene.fog.density = 0.011;
const { P } = track([{ len: 3000 }]);
buildRoad(P, -80, 600, { lamps: true });
const T2 = S.s2[0], T3 = S.s3[0], T4 = S.s4[0], T5 = S.s5[0], T6 = S.s6[0], T7 = S.s7[0];
const O = 1.8, V = 12, A = 8, sb0 = 80;          // lane, speed (m/s, ~43 km/h), braking decel, where the car starts to move
const RA = 1.25, RB = 0.75;                      // reaction time: hand on the grip vs two fingers already on the lever
const tbA = g("s2", "lever") + 0.05, tcA = tbA - RA;
const tbB = g("s5", "already"), tcB = tbB - RB;
const dA = V * RA, dB = V * RB, dBr = (V * V) / (2 * A);
const sHit = sb0 + dA + 8, sCar = sHit + 2.0;    // the wrong rider is still doing ~4 m/s when he reaches the car
const sStopB = sb0 + dB + dBr;                   // right rider stops 5 m before that point
const brakeS = (s0, tb, t) => { const u = Math.min(t - tb, V / A); return s0 + V * u - 0.5 * A * u * u; };
const sA = (t) => (t < tbA ? sb0 + V * (t - tcA) : Math.min(sHit, brakeS(sb0 + dA, tbA, t)));
const tHit = tbA + (V - Math.sqrt(V * V - 2 * A * 8)) / A;
const sB = (t) => (t < tbB ? sb0 + V * (t - tcB) : brakeS(sb0 + dB, tbB, t));
const pA = (t) => { const [x, z] = P(sA(t), O); return [x, z, 0]; };
const pB = (t) => { const [x, z] = P(sB(t), O); return [x, z, 0]; };

// ---- props ----
const [Bk] = bikes(1), car = makeCar({ driver: true });
const KO = O + 2.5;   // parked at the kerb
const carPose = (t) => { const tc = t < T4 ? tcA : tcB, u = sm(tc, tc + 1.0, t); return { x: P(sCar - 1.0 + 1.5 * u, KO - (KO - O - 0.4) * u)[0], z: P(sCar - 1.0 + 1.5 * u, 0)[1], h: 0.75 * Math.sin(Math.PI * 0.62 * u) }; };
// lever + two fingers on the right grip (fork-local grip at x 0.39, y 0.12, z 0.05)
const mLev = glow(RED, 1.2), lever = new THREE.Group(); lever.position.set(0.27, 0.12, -0.03); Bk.fork.add(lever);
lever.add(box(0.26, 0.045, 0.05, 0.12, 0, -0.06, mLev, false));
const mFin = glow(RED, 2.2), fingers = [0, 1].map((i) => { const f = box(0.05, 0.055, 0.13, 0, 0, 0, mFin, false); Bk.fork.add(f); return { f, x: 0.31 + 0.065 * i }; });
// distance bars on the road: reaction (driving on, no braking yet) + braking
const mkBar = (o, hex) => { const m = box(0.42, 0.02, 1, 0, 0.02, 0, glow(hex, 1.4), false); m.material.transparent = true; scene.add(m); m.userData.o = o; return m; };
const bar = (m, s0, s1, a) => { m.visible = a > 0.01 && s1 > s0 + 0.05; if (!m.visible) return; const [x, z0] = P(s0, m.userData.o), [, z1] = P(s1, m.userData.o); m.position.set(x, 0.02, (z0 + z1) / 2); m.scale.z = Math.abs(z1 - z0); m.material.opacity = a; };
const rA = mkBar(O + 0.95, RED), bA = mkBar(O + 0.95, ORANGE), rB = mkBar(O - 0.95, GREEN), bB = mkBar(O - 0.95, GREEN); [rB, bB].forEach((m) => m.material.color.set(GREEN).multiplyScalar(0.9));
const tick = (hex) => { const m = box(1.6, 0.03, 0.12, 0, 0.03, 0, glow(hex, 2.5), false); scene.add(m); return m; };
const tkA = tick(RED), tkB = tick(GREEN), tk0 = tick(WHITE);
const put = (m, s, o, a) => { const [x, z] = P(s, o); m.position.set(x, 0.03, z); m.visible = a > 0.01; };

title("NEVER RIDE IN TOWN WITH YOUR HAND OFF THE BRAKE");
cap("s1", "riding", ["RIDING", "THROUGH TOWN?"], VIOLET, { until: ["s1", "never"] });
cap("s2", "pulls", ["A CAR PULLS OUT"], RED, { until: ["s2", "move"] });
cap("s2", "move", ["HAND TO THE", "LEVER FIRST"], RED, { until: ["s2", "stop"] });
cap("s2", "stop", ["TOO LATE"], RED, { boom: 0.6 });
cap("s3", "every", ["EVERY SECOND", "COUNTS"], ORANGE);
cap("s4", "two", ["TWO FINGERS ON", "THE FRONT BRAKE"], GREEN);
cap("s5", "already", ["ALREADY", "BRAKING"], GREEN);
cap("s6", "stop", ["YOU STOP", "MUCH SHORTER"], GREEN);
endCard(["IN TOWN?", "TWO FINGERS ON THE BRAKE."]);

// follow cams are bike-relative (x right, -z ahead); world cams via cam()
const fA = (t) => pathState(pA, t), fB = (t) => pathState(pB, t);
const HAND = [0.38, 1.07, -0.52];
const cam = (s, o, y, ls, lo, ly, f) => { const [x, z] = P(s, o), [lx, lz] = P(ls, lo); return [x, y, z, lx, ly, lz, f]; };
const SH = [
  { at: 0, f: fA, noRot: 1, K: [[0, [-2.6, 2.4, 4.6, 0.4, 1.0, -5, 46]], [1.4, [1.6, 1.8, 0.4, 0.4, 1.05, -1.2, 40]]] },
  { at: g("s1", "fingers") - 0.25, f: fA, noRot: 1, K: [[0, [3.0, 2.3, -2.6, ...HAND, 26]], [1.3, [2.7, 2.2, -2.35, ...HAND, 25]]] },
  { at: T2, f: fA, noRot: 1, K: [[0, [-2.4, 3.4, 5.5, 0.6, 0.8, -12, 46]], [0.7, [-2.2, 3.2, 4.8, 0.6, 0.8, -10, 46]]] },
  { at: g("s2", "move") - 0.05, f: fA, noRot: 1, K: [[0, [3.0, 2.3, -2.6, ...HAND, 26]], [1.0, [2.7, 2.2, -2.35, ...HAND, 25]]] },
  { at: g("s2", "and") - 0.05, K: [[0, cam(sHit - 3, O - 6.5, 2.8, sHit + 0.8, O + 0.3, 0.7, 44)], [1.4, cam(sHit - 1.5, O - 6.0, 2.6, sHit + 0.8, O + 0.3, 0.7, 42)]] },
  { at: T3, K: [[0, cam(sb0 + 2, O - 11, 15, sb0 + 13, O, 0, 50)], [1.4, cam(sb0 + 4, O - 11, 15, sb0 + 14, O, 0, 50)]] },
  { at: T4, f: fB, noRot: 1, K: [[0, [3.6, 2.5, -3.2, ...HAND, 30]], [0.6, [3.0, 2.3, -2.6, ...HAND, 26]], [1.7, [2.7, 2.2, -2.35, ...HAND, 25]]] },
  { at: T5, f: fB, noRot: 1, K: [[0, [-2.6, 3.4, 5.0, 0.6, 0.8, -10, 46]], [1.8, [-2.6, 3.0, 4.0, 0.6, 0.8, -8, 44]]] },
  { at: T6, K: [[0, cam(sb0 + 3, O - 11, 15, sb0 + 15, O, 0, 50)], [1.0, cam(sb0 + 5, O - 11, 15, sb0 + 16, O, 0, 50)]] },
  { at: T7, K: [[0, cam(sb0 + 4, O - 5, 12, sb0 + 15, O, 0, 50)], [1.5, cam(sb0 + 4, O + 4, 12, sb0 + 15, O, 0, 50)]] },
];

run("w", (t) => {
  const wrong = t < T4, tb = wrong ? tbA : tbB, tc = wrong ? tcA : tcB;
  car.set(t < T7 + 9 ? carPose(t) : null);
  const brk = t > tb ? 1 - sm(tb + V / A - 0.1, tb + V / A + 0.3, t) * (wrong ? 0 : 1) : 0;
  const hit = wrong ? flash(t, tHit) : 0;
  ride(Bk, wrong ? pA : pB, t, wrong ? (t < T2 ? VIOLET : RED) : t < T5 ? VIOLET : GREEN, { lean: 0, trail: wrong ? t < tHit - 0.2 : t < tbB + 1.2 });
  Bk.tail.material.color.set(RED).multiplyScalar(2 + 6 * brk);
  // hand: wrong = fingers wrapped on the grip, they travel to the lever on "move"→"lever"; right = resting on the lever
  const onL = wrong ? sm(g("s2", "move") - 0.05, tbA - 0.05, t) : t < S.s4[0] + 0.1 ? 0 : sm(g("s4", "two") - 0.1, g("s4", "fingers") + 0.25, t);
  const sq = brk * (wrong ? 1 : 1);
  lever.rotation.y = 0.22 * sq;
  fingers.forEach(({ f, x }, i) => { f.position.set(x + 0.02 * onL, 0.15 - 0.03 * onL + 0.004 * i, 0.06 - (0.13 - 0.04 * sq) * onL); });
  const good = !wrong && onL > 0.5;
  mFin.color.set(good ? GREEN : RED).multiplyScalar((good ? 0.9 : 1.5) + 0.8 * (wrong ? flash(t, g("s1", "off")) : flash(t, g("s4", "fingers") + 0.2)));
  mLev.color.set(good || (!wrong && sq > 0) ? GREEN : wrong && onL < 0.5 ? RED : ORANGE).multiplyScalar((good ? 0.6 : 1.0) + 0.6 * sq + (wrong ? 1.0 * flash(t, g("s1", "brake")) : 0));
  // bars: grow with the bike, stay for the comparison
  const sNowA = Math.min(sA(Math.min(t, T4 - 0.01)), sHit), sNowB = t < T4 ? sb0 : sB(t);
  const kA = t > tcA ? (wrong ? 1 : sm(T6 - 0.3, T6, t)) : 0, kB = !wrong && t > tcB ? 1 : 0;
  bar(rA, sb0, Math.min(sNowA, sb0 + dA), kA * (1 + 0 * flash(t, T3)));
  bar(bA, sb0 + dA, Math.max(sb0 + dA, sNowA), kA);
  rA.material.color.set(RED).multiplyScalar(1.4 + (t > T3 && t < T4 ? 2 * flash(t, g("s3", "second")) : 0));
  bar(rB, sb0, Math.min(sNowB, sb0 + dB), kB * 0.6);
  bar(bB, sb0 + dB, Math.max(sb0 + dB, sNowB), kB);
  put(tk0, sb0, O, t > tc ? 1 : 0);
  put(tkA, sHit, O + 0.95, t > tHit || !wrong ? 1 : 0);
  put(tkB, sStopB, O - 0.95, !wrong && t > tbB + V / A - 0.1 ? 1 : 0);
  tkB.material.color.set(GREEN).multiplyScalar(1.4 + 1.2 * flash(t, g("s6", "shorter")));
  Bk.hlight.visible = false;
  const shot = shoot(SH, t);
  bloom.strength = 1.0 + 1.2 * shot.punch * shot.punch + overlays(t) + 1.2 * hit;
});
