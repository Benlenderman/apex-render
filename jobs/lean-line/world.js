// 158 lean-line: one ride drawn as one line of lean angle. Smooth hills, a flat spot of fear, ten tight jagged corners, round again.
import { THREE, S, g, sm, scene, camera, bloom, glow, beam, box, mAsph, mFrame, mSolid, pathState, VIOLET, RED, GREEN, WHITE, shoot, run } from "./kit.js";
import { ribbon, title, endCard, cap, overlays, bikes, END } from "./extra.js";

const T2 = S.s2[0], T3 = S.s3[0], T4 = S.s4[0], T5 = S.s5[0], T6 = S.s6[0], T7 = S.s7[0], T8 = S.s8[0], TE = END("s8");
const V = 14, RAD = Math.PI / 180;
scene.fog.density = 0.018;

// ---- his lean in degrees, right = up on the graph ----
const tDrop = g("s3", "drops"), tCalm = T6 + 0.1;
const HILLS = [[0.3, 1.5, 12], [1.7, 2.9, -14], [3.1, 4.3, 15], [4.5, 5.5, -15], [5.6, 6.6, 16], [6.7, 7.75, -20], [7.85, 8.85, 25], [8.95, 9.8, -16],
  [21.6, 22.9, 24], [23.0, 24.4, -25], [24.5, 25.9, 23], [26.0, 27.4, -24], [27.5, 28.9, 24], [29.0, 30.4, -23], [30.5, 32, 22]];
const TIGHT = [9, 12, 8, 13, 10, 12, 8, 11, 13, 9]; // ten small corners
const t5a = T5 + 0.5, dT = (tCalm - 0.1 - t5a) / 10;
const fearUp = (t) => 30 * sm(9.85, 10.7, t);
function lean(t) {
  for (const [a, b, A] of HILLS) if (t >= a && t < b) return A * Math.sin((Math.PI * (t - a)) / (b - a));
  if (t >= 9.85 && t < t5a) return fearUp(t) * (1 - 0.88 * sm(tDrop, tDrop + 0.18, t)) * (1 - sm(t5a - 0.6, t5a, t)) + (t > tDrop ? 1.2 * Math.sin(9 * t) : 0);
  if (t >= t5a && t < t5a + 10 * dT) { const i = Math.floor((t - t5a) / dT), p = (t - t5a) / dT - i; return (i % 2 ? -1 : 1) * TIGHT[i] * (1 - Math.abs(2 * p - 1)) + 1.6 * Math.sin(41 * t); }
  return 0;
}
// what the road asks for: the same, except the corner he gave up on keeps turning
const roadLean = (t) => (t >= 9.85 && t < t5a ? fearUp(t) * (1 - 0.67 * sm(12.2, 13.5, t)) * (1 - sm(t5a - 0.8, t5a, t)) : lean(t));
const wide = (t) => 1.3 * sm(tDrop + 0.1, 13.5, t) + 2.1 * sm(14.8, 16.1, t) - 3.4 * sm(16.3, 18.6, t); // metres toward the oncoming lane

// ---- the road, integrated from the lean it asks for at this speed ----
const T0 = -4, DT = 0.01, N = 4100, RX = [], RZ = [], RH = [];
for (let i = 0, x = 0, z = 0, a = 0; i < N; i++) { RX.push(x); RZ.push(z); RH.push(a); x -= Math.sin(a) * V * DT; z -= Math.cos(a) * V * DT; a -= ((9.8 * Math.tan(roadLean(T0 + i * DT) * RAD)) / V) * DT; }
const C = (t) => { const q = Math.min(N - 2, Math.max(0, (t - T0) / DT)), i = Math.floor(q), f = q - i, L = (A) => A[i] + (A[i + 1] - A[i]) * f; return { x: L(RX), z: L(RZ), h: L(RH) }; };
const P = (t, o = 0) => { const c = C(t); return [c.x + o * Math.cos(c.h), c.z - o * Math.sin(c.h)]; };
const SA = T0 + 0.2, SB = 36.5;
ribbon(P, -4.1, 4.1, SA, SB, mAsph, 0.004, 0.05);
const mLine = glow(VIOLET, 1.1);
for (const sd of [-1, 1]) ribbon(P, sd * 3.6 - 0.05, sd * 3.6 + 0.05, SA, SB, mFrame, 0.02, 0.03);
for (let s = SA; s < SB; s += 0.3) ribbon(P, -0.07, 0.07, s, s + 0.12, mLine, 0.012, 0.04);
const mLamp = glow(VIOLET, 2.0);
for (let s = SA, i = 0; s < SB; s += 0.8, i++) { const sd = i % 2 ? -1 : 1, [x, z] = P(s, sd * 5.4); scene.add(box(0.1, 3.6, 0.1, x, 1.8, z, mFrame, false), box(0.14, 0.1, 0.14, x, 3.6, z, mLamp, false)); }

// ---- the rider ----
const fn = (t) => P(t, 1.8 - wide(t));
const [B] = bikes(1);
const mSuit = mSolid.clone(), v0 = B.visor.material, vR = glow(RED, 2.4), vG = glow(GREEN, 2.4);
B.rider.traverse((o) => { if (o.material === mSolid) o.material = mSuit; });
const suit = (hex) => { if (hex === VIOLET) { mSuit.color.set(0x3a33a0); mSuit.emissive.set(0x1f1a5e); B.visor.material = v0; } else { mSuit.color.set(hex); mSuit.emissive.set(hex).multiplyScalar(0.4); B.visor.material = hex === RED ? vR : vG; } };
const stateOf = (t) => { const st = pathState(fn, t); st.lean = -lean(t) * RAD; return st; };
const fB = (t) => stateOf(t), fR = (t) => C(t);
const gaze = beam(GREEN, 2.5, 0.05);

// ---- the line: a strip glued to the camera, 2 units in front of it ----
const GN = Math.ceil(TE / 0.02) + 1, gPos = new Float32Array(GN * 6), gCol = new Float32Array(GN * 6), gIdx = [];
for (let i = 1; i < GN; i++) { const k = 2 * i; gIdx.push(k - 2, k - 1, k, k - 1, k + 1, k); }
const gGeo = new THREE.BufferGeometry();
gGeo.setAttribute("position", new THREE.BufferAttribute(gPos, 3)); gGeo.setAttribute("color", new THREE.BufferAttribute(gCol, 3)); gGeo.setIndex(gIdx);
const hudMat = (o) => new THREE.MeshBasicMaterial({ toneMapped: false, depthTest: false, fog: false, transparent: true, blending: THREE.AdditiveBlending, side: THREE.DoubleSide, ...o });
const strip = new THREE.Mesh(gGeo, hudMat({ vertexColors: true })); strip.frustumCulled = false; strip.renderOrder = 18;
const base = new THREE.Mesh(new THREE.PlaneGeometry(1.2, 0.003), hudMat({ color: new THREE.Color(VIOLET).multiplyScalar(0.35) })); base.renderOrder = 17;
const dot = new THREE.Mesh(new THREE.CircleGeometry(0.016, 20), hudMat({ color: new THREE.Color(WHITE).multiplyScalar(3) })); dot.renderOrder = 19;
camera.add(strip, base, dot);
const LV = Array.from({ length: GN }, (_, i) => lean(i * 0.02)), col = new THREE.Color();
function drawLine(t) {
  const zoom = sm(4.4, T2 + 0.2, t) * (1 - sm(T7 - 0.3, T7 + 0.4, t)), y0 = 0.3 - 0.17 * sm(T7 - 0.3, T7 + 0.4, t), shown = TE * sm(0.15, 1.3, t), vis = 1 - sm(T8 - 0.25, T8 + 0.1, t); // gone under the CTA card
  const X = (u) => (-0.46 + (0.92 * u) / TE) * (1 - zoom) + (0.12 + ((u - t) * 0.92) / 7) * zoom, Y = (L) => y0 + L * 0.0029;
  for (let i = 0; i < GN; i++) {
    const u = i * 0.02, x = X(u), y = Y(LV[i]), done = u <= t;
    gPos.set([x, y - 0.0045, -2, x, y + 0.0045, -2], i * 6);
    col.set(!done ? VIOLET : u >= tCalm ? GREEN : u >= tDrop ? RED : WHITE).multiplyScalar(u > shown ? 0 : (done ? 2.2 : 0.55) * vis);
    gCol.set([col.r, col.g, col.b, col.r, col.g, col.b], i * 6);
  }
  gGeo.attributes.position.needsUpdate = gGeo.attributes.color.needsUpdate = true;
  base.position.set(0, y0, -2); dot.position.set(X(Math.min(t, TE)), Y(lean(t)), -2);
  dot.visible = t > 0.3 && vis > 0.5; base.visible = vis > 0.5;
}

title("ONE RIDE. ONE LINE.");
cap("s1", "it", ["HIS LEAN ANGLE"], WHITE, { until: ["s1", "watch"] });
cap("s1", "watch", ["WATCH FOR", "THE FEAR"], RED);
cap("s2", "smooth", ["SMOOTH HILLS"], WHITE, { until: ["s2", "twenty"] });
cap("s2", "twenty", ["20°"], WHITE, { until: ["s2", "twenty"], untilN: 2 });
cap("s2", "twenty", ["25°"], WHITE, { n: 2 });
cap("s3", "faster", ["FASTER CORNER"], WHITE, { until: ["s3", "thirty"] });
cap("s3", "thirty", ["30°"], WHITE, { until: ["s3", "drops"] });
cap("s3", "drops", ["DROPS FLAT"], RED, { boom: 0.6 });
cap("s4", "that", ["THAT FLAT SPOT", "IS FEAR"], RED, { until: ["s4", "stood"] });
cap("s4", "stood", ["STOOD IT UP"], RED, { until: ["s4", "ran"] });
cap("s4", "ran", ["RAN WIDE"], RED);
cap("s5", "for", ["TEN CORNERS"], WHITE, { until: ["s5", "small"] });
cap("s5", "small", ["SMALL AND", "JAGGED"], RED, { until: ["s5", "he"] });
cap("s5", "he", ["RIDING TIGHT"], RED);
cap("s6", "he", ["HE BREATHES"], GREEN, { until: ["s6", "looks"] });
cap("s6", "looks", ["LOOKS THROUGH"], GREEN, { until: ["s6", "hills"] });
cap("s6", "hills", ["ROUND AGAIN"], GREEN);
endCard(["YOUR LEAN ANGLE", "TELLS THE TRUTH."]);

// ---- shots: offsets from the bike (fB) or from the road centre (fR); x right, z behind ----
const w = (id, word) => g(id, word) - 0.1;
const sh = (at, f, a, b, dur = 4) => ({ at, f, K: [[0, a], [dur, b]] });
const SH = [
  sh(0, fB, [0.4, 2.7, 7.5, 0, 2.3, 0, 50], [0, 2.4, 6, 0, 2.3, 0, 50], T2),
  sh(T2, fB, [0.7, 1.4, -7.5, 0, 2.2, 0, 50], [0.3, 1.4, -6.2, 0, 2.2, 0, 50]), // face on: the lean reads
  sh(T3, fB, [-0.8, 2.3, 6.5, 0, 2.2, 0, 50], [-0.4, 2.1, 5.5, 0, 2.2, 0, 50]),
  sh(w("s3", "climbs"), fB, [-0.8, 1.3, -7, 0, 2.2, 0, 50], [-0.4, 1.3, -6, 0, 2.2, 0, 50]),
  sh(T4, fR, [1.8, 6.5, 11, 0.6, 3.2, 0, 50], [1.8, 7.5, 12, 0.6, 3.2, 0, 50]), // the lane: he is leaving it
  sh(w("s4", "stood"), fR, [0, 1.6, -9, 0.6, 2.4, 0, 50], [0, 1.6, -7.5, 0.6, 2.4, 0, 50]),
  sh(w("s4", "ran"), fR, [0, 10, 9, 0, 4.2, 0, 50], [0, 11.5, 9.5, 0, 4.2, 0, 50]), // from above: over the centre line
  sh(T5, fB, [0.9, 2.3, 6, 0, 2.2, 0, 50], [0.5, 2.2, 5.2, 0, 2.2, 0, 50]),
  sh(w("s5", "for"), fB, [0.5, 1.4, -7, 0, 2.2, 0, 50], [0.2, 1.4, -5.6, 0, 2.2, 0, 50]),
  sh(w("s5", "he"), fB, [-2.2, 1.6, -4, 0, 2.0, 0, 50], [-1.8, 1.6, -3.4, 0, 2.0, 0, 50]),
  sh(T6, fB, [1.2, 1.4, -7, 0, 2.2, 0, 50], [0.8, 1.4, -6.2, 0, 2.2, 0, 50]),
  sh(w("s6", "looks"), fB, [0.3, 3.0, 7, 0, 2.2, -4, 50], [0.1, 2.8, 6.2, 0, 2.2, -4, 50]), // over his shoulder, through the corner
  sh(w("s6", "hills"), fB, [-0.9, 1.4, -7.5, 0, 2.2, 0, 50], [-0.5, 1.4, -6.5, 0, 2.2, 0, 50]),
  sh(T7, fB, [0, 3.2, 9, 0, 4.0, 0, 50], [0, 3.6, 10, 0, 4.2, 0, 50]),
  sh(T8, fB, [0.5, 3.6, 10, 0, 4.4, 0, 50], [-0.5, 5.5, 14, 0, 5.2, 0, 50], TE - T8),
];

run("w", (t) => {
  const hex = t >= tCalm ? GREEN : t >= tDrop ? RED : VIOLET, st = stateOf(t);
  suit(hex); B.set(st, fn, t, { hex }); B.rider.visible = true;
  // where he looks: two seconds up the road, once he breathes
  const tg = w("s6", "looks"), aG = sm(tg, tg + 0.3, t) * (1 - sm(T7 - 0.3, T7, t)), [lx, lz] = P(t + 1.6, 1.8);
  gaze.set(new THREE.Vector3(st.x, 1.5, st.z), new THREE.Vector3(lx, 0.05, lz), 0.9 * aG);
  const shot = shoot(SH, t);
  drawLine(t);
  bloom.strength = 0.8 + 1.2 * shot.punch * shot.punch + overlays(t);
});
