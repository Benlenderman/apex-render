// 82 rain-gap: a group in the rain on dry-road gaps; spray hides the leader, he brakes, the rider behind can't stop in time and goes down (red).
// Right way: double the gap, brake earlier and softer, keep off the painted lines, the leader slows the pace (green).
import { THREE, S, g, sm, pulse, flash, scene, camera, bloom, VIOLET, RED, GREEN, WHITE, pathState, shoot, sceneOf, run, patch, glow } from "./kit.js";
import { track, buildRoad, title, endCard, cap, overlays, bikes, ride, dist, downLean } from "./extra.js";

scene.fog.density = 0.012;
const V = 11, N = 5, { P } = track([{ len: 4000 }]);
buildRoad(P, -200, 3600, { lamps: false });
const B = bikes(N);
const T2 = S.s2[0], T3 = S.s3[0], T4 = S.s4[0], T5 = S.s5[0], T6 = S.s6[0], T7 = S.s7[0];
const tDry = g("s1", "dry"), tStop = g("s2", "stop"), tSpray = g("s2", "spray");
const tDouble = g("s3", "double"), tBrake = g("s4", "brake"), tPaint = g("s4", "painted");
const tSlow = g("s5", "slows"), tFor = g("s6", "forgive");

// ---- A: 8 m gaps. The leader brakes at "spray"; rider 1 reacts late, stops longer on the wet road and hits him ----
const GA = 8, tB0 = Math.min(tSpray + 0.2, T3 - 2.4);
const D0 = dist((t) => V * (1 - sm(tB0, tB0 + 1.2, t)), 0, T3 + 1);
const D1 = dist((t) => V * (1 - 0.75 * sm(tB0 + 0.55, tB0 + 2.4, t)), 0, T3 + 1); // wet: softer decel
const Dn = (i) => dist((t) => V * (1 - sm(tB0 + 0.4 + 0.2 * i, tB0 + 1.4 + 0.2 * i, t)), 0, T3 + 1);
const DR = [D0, D1, Dn(2), Dn(3), Dn(4)];
let tHit = T3; for (let t = tB0; t < T3; t += 0.01) if (60 + D1(t) - GA >= 60 + D0(t) - 2.3) { tHit = t; break; }
const aS = (i, t) => {
  const free = 60 + DR[i](t) - GA * i;
  if (i === 1) return t < tHit ? free : 60 + D0(t) - 2.3 + 0.8 * sm(tHit, tHit + 0.8, t);
  return i === 0 ? free : Math.min(free, aS(i - 1, t) - 3.2);
};
const kDown = (t) => sm(tHit, tHit + 0.6, t);
// ---- B: fresh road. Gap doubles 8 -> 16 at "double". s4: tails glow, all ride the lane middle off the paint. s5: leader slows 11 -> 8 ----
const sB = 1400, VB = (t) => V - 3 * sm(tSlow - 0.2, tSlow + 1.6, t);
const DB = dist(VB, T3, T7 + 8);
const GB = (t) => GA + 8 * sm(tDouble - 0.2, tDouble + 1.8, t);
const OFF = (i) => (i % 2 ? 2.6 : 1.0);
const kMid = (t) => sm(tPaint - 0.3, tPaint + 1.0, t) * (1 - sm(T5 + 0.5, T5 + 1.8, t));
const path = (i) => (t) => t < T3 ? P(aS(i, t), OFF(i)) : P(sB + DB(t) - GB(t) * i, OFF(i) + (1.8 - OFF(i)) * kMid(t));

// ---- rain: streaks falling around the camera; spray: soft white puffs behind each rear wheel ----
const RN = 900, rg = new THREE.BufferGeometry(), rp = new Float32Array(RN * 6), seed = Array.from({ length: RN }, (_, i) => [Math.sin(i * 12.9898) * 43758.5453 % 1, Math.sin(i * 78.233) * 12543.123 % 1, Math.sin(i * 39.425) * 9137.77 % 1].map((v) => Math.abs(v)));
rg.setAttribute("position", new THREE.BufferAttribute(rp, 3));
const rain = new THREE.LineSegments(rg, new THREE.LineBasicMaterial({ color: new THREE.Color(0xbfd0ff).multiplyScalar(0.9), transparent: true, opacity: 0.55, toneMapped: false, fog: false }));
rain.frustumCulled = false; scene.add(rain);
const setRain = (t) => {
  const c = camera.position;
  for (let i = 0; i < RN; i++) {
    const [a, b, d] = seed[i], x = c.x + (a - 0.5) * 30, z = c.z + (b - 0.5) * 30 - 6, y = ((d * 14 - t * 16) % 14 + 14) % 14 + c.y - 9;
    rp.set([x, y, z, x + 0.03, y + 0.55, z + 0.08], i * 6);
  }
  rg.attributes.position.needsUpdate = true;
};
const mSpray = new THREE.MeshBasicMaterial({ color: new THREE.Color(0xc8d2ff).multiplyScalar(0.55), transparent: true, opacity: 0.0, depthWrite: false, toneMapped: false, blending: THREE.AdditiveBlending });
const sprays = B.map(() => Array.from({ length: 6 }, (_, k) => { const m = new THREE.Mesh(new THREE.SphereGeometry(1, 12, 8), mSpray.clone()); scene.add(m); m.userData.k = k; return m; }));
const setSpray = (i, st, a, t) => sprays[i].forEach((m) => {
  const k = m.userData.k, back = 0.9 + k * 0.7, w = 0.35 + k * 0.22, bob = 0.08 * Math.sin(t * 9 + k * 2 + i);
  m.visible = !!st && a > 0.01 && st.v > 2; if (!m.visible) return;
  m.position.set(st.x + Math.sin(st.h) * back, 0.35 + k * 0.16 + bob, st.z + Math.cos(st.h) * back);
  m.scale.set(w, 0.3 + k * 0.12, w * 1.3); m.material.opacity = a * (0.32 - k * 0.035) * Math.min(1, st.v / 8);
});

const shortZ = patch(3.0, 1, RED, 1.3), gapZ = Array.from({ length: N - 1 }, () => patch(1.6, 1, GREEN, 0.9));
const paintZ = [patch(0.6, 1, RED, 1.4), patch(0.6, 1, RED, 1.4)], midZ = patch(1.2, 1, GREEN, 0.8);
const strip = (m, a, b, o, k) => { const [x, z] = P((a + b) / 2, o); m.position.set(x, 0.03, z); m.scale.set(1, Math.max(0.1, Math.abs(b - a)), 1); m.set(k); };

title("NEVER KEEP DRY-ROAD GAPS IN THE RAIN");
cap("s2", "longer", ["ON A WET ROAD", "YOU NEED LONGER TO STOP"], RED, { until: ["s2", "spray"] });
cap("s2", "spray", ["SPRAY HIDES", "THE BIKE AHEAD"], RED, { boom: 0.4 });
cap("s3", "double", ["DOUBLE THE GAP", "TO THE RIDER IN FRONT"], GREEN);
cap("s4", "brake", ["BRAKE EARLIER", "AND SOFTER"], GREEN, { until: ["s4", "keep"] });
cap("s4", "keep", ["KEEP OFF THE", "PAINTED LINES"], GREEN);
cap("s5", "leader", ["THE LEADER", "SLOWS THE PACE"], GREEN);
cap("s6", "wet", ["A WET ROAD DOESN'T", "FORGIVE A SHORT GAP"], RED);
endCard(["DOUBLE THE GAP.", "SLOW THE PACE."]);

const fol = (fn) => (t) => pathState(fn, t);
const SH = [
  { at: 0, f: fol(path(2)), noRot: true, K: [[0, [-9, 7, 16, 1.6, 0.5, -10, 50]], [3, [-10, 8, 14, 1.6, 0.5, -12, 50]]] },
  { at: T2, f: fol(path(1)), noRot: true, K: [[0, [-1.2, 2.6, 5.5, 1.0, 0.9, -10, 48]], [3, [-1.4, 2.8, 5.0, 1.0, 0.9, -10, 48]]] },
  { at: tHit - 0.5, f: fol(path(0)), noRot: true, K: [[0, [-7, 4.5, 9, 1.6, 0.4, 1, 48]], [3, [-7.5, 5, 8, 1.6, 0.4, 1, 48]]] },
  { at: T3, f: fol(path(2)), noRot: true, K: [[0, [-10, 14, 20, 1.6, 0, -14, 50]], [5, [-11, 16, 18, 1.6, 0, -16, 50]]] },
  { at: T4, f: fol(path(1)), noRot: true, K: [[0, [-3, 3.2, 7, 1.4, 0.7, -6, 48]], [2, [-3.4, 3.4, 6, 1.4, 0.7, -8, 48]]] },
  { at: tPaint - 0.3, f: fol(path(2)), noRot: true, K: [[0, [-6, 12, 12, 1.4, 0, -10, 50]], [4, [-6.5, 13, 11, 1.4, 0, -12, 50]]] },
  { at: T5, f: fol(path(0)), noRot: true, K: [[0, [-8, 7, -8, 1.6, 0.5, 14, 50]], [4, [-9, 8, -6, 1.6, 0.5, 16, 50]]] },
  { at: T6, f: fol(path(2)), noRot: true, K: [[0, [-12, 22, 26, 1.6, 0, -14, 52]], [4, [-13, 24, 24, 1.6, 0, -16, 52]]] },
];

run("w", (t) => {
  const { id } = sceneOf(t), A = t < T3;
  const sts = B.map((b, i) => {
    const hex = A ? (t > tDry - 0.2 ? RED : VIOLET) : GREEN;
    const st = ride(b, path(i), t, hex, A && i === 1 ? { lean: downLean(kDown(t)), down: kDown(t) } : {});
    // brake lights: A leader on the hard brake; s4 everyone early and soft
    const on = A ? (t > tB0 && i === 0 ? 1 : 0) : id === "s4" && t > tBrake - 0.1 && t < tPaint ? 0.6 + 0.4 * Math.sin((t - tBrake) * 3) : 0;
    b.tail.scale.setScalar(1 + 1.8 * on);
    if (A && i === 1) b.g.position.y = 0.25 * kDown(t);
    setSpray(i, st, A ? 1 : 0.55, t);
    return st;
  });
  // A: red short gap between leader and rider 1 (lights on "dry", stays through the crash)
  const s0 = -sts[0].z, s1 = -sts[1].z;
  strip(shortZ, s1 + 1, s0 - 1, 1.8, A ? sm(tDry - 0.1, tDry + 0.4, t) * (1 - sm(tHit + 0.2, tHit + 0.5, t)) : 0);
  // B: green doubled gaps; s4 red paint (centre line + edge line), green lane middle
  const onG = A || t > T7 ? 0 : sm(tDouble - 0.1, tDouble + 0.6, t);
  for (let i = 0; i < N - 1; i++) strip(gapZ[i], -sts[i + 1].z + 1.2, -sts[i].z - 1.2, 1.8, onG * (id === "s4" ? 0 : 1));
  const kp = id === "s4" ? sm(tPaint - 0.1, tPaint + 0.4, t) : 0, sl = -sts[N - 1].z - 6, sh = -sts[0].z + 14;
  strip(paintZ[0], sl, sh, 0, kp); strip(paintZ[1], sl, sh, 3.6, kp); strip(midZ, sl, sh, 1.8, kp);
  const shot = shoot(SH, t);
  setRain(t);
  bloom.strength = 1.0 + 1.2 * shot.punch * shot.punch + overlays(t) + 0.8 * flash(t, tHit) + (id === "s5" ? 0.3 * flash(t, tSlow + 0.4) : 0) + 0.3 * flash(t, tFor);
});
