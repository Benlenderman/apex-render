// 116 tar-snake: wrong = the rider leans hard into a left bend riding right along a shiny tar seam, the front tyre slides
// and the bike goes down (red). Right = spot the tar lines early, pick a line that crosses them at an angle instead of
// riding along them, keep the lean steady over the tar; hot sun and rain make them worse (green).
import { THREE, S, g, sm, flash, scene, bloom, camera, box, glow, VIOLET, ORANGE, RED, GREEN, pathState, shoot, run, patch } from "./kit.js";
import { track, buildRoad, ribbon, makePerson, pose, title, endCard, cap, overlays, bikes, ride, downLean, tag, tagAt } from "./extra.js";

// ---- props ----
const addMat = (hex, k = 1) => new THREE.MeshBasicMaterial({ color: new THREE.Color(hex).multiplyScalar(k), transparent: true, opacity: 0, toneMapped: false, depthWrite: false, blending: THREE.AdditiveBlending });
const mTar = new THREE.MeshStandardMaterial({ color: 0x020205, roughness: 0.08, metalness: 0.7, emissive: 0x000000 });
// a tar seam: black glossy strip with a moving shine on top
function seam(P, o0, s0, s1, ph) {
  const f = (s, o) => P(s, o0 + 0.12 * Math.sin(s * 0.45 + ph) + o);
  ribbon(f, -0.13, 0.13, s0, s1, mTar, 0.012, 0.4);
  const sh = addMat(0xffffff, 1); ribbon(f, -0.05, 0.05, s0, s1, sh, 0.02, 0.4);
  return sh;
}

// ---- world: straight, then a left bend ----
scene.fog.density = 0.008;
const T2 = S.s2[0], T3 = S.s3[0], T4 = S.s4[0], T5 = S.s5[0], T6 = S.s6[0], T7 = S.s7[0];
const SB = 250, RB = 40;
const { P } = track([{ len: SB }, { len: 80, R: RB }, { len: 600 }]);
buildRoad(P, -80, 700, { lamps: true });
const OL = 1.8;
const shines = [seam(P, 1.8, SB - 28, SB + 75, 0), seam(P, 2.95, SB + 6, SB + 42, 2), seam(P, 0.15, SB + 20, SB + 60, 4)];

// ---- A: hard lean right along the seam, the front slides ----
const tS = g("s2", "slides") - 0.05, VA = 12, sS = SB + 16;
const sA = (t) => sS - VA * (tS - t);
const ringA = (t) => P(sA(t), OL);
const pS = P(sS, OL), pS2 = P(sS + 0.1, OL), dirS = [(pS2[0] - pS[0]) / 0.1, (pS2[1] - pS[1]) / 0.1];
const hS = Math.atan2(-dirS[0], -dirS[1]), ln0 = pathState(ringA, tS - 0.05).lean, side = Math.sign(ln0) || -1;
const slideD = (t) => { const tau = Math.min(1.8, t - tS); return VA * tau - 0.5 * (VA / 1.8) * tau * tau; };
const pathA = (t) => {
  if (t < tS) return ringA(t);
  const d = slideD(t), yaw = -0.6 * sm(tS, tS + 0.6, t) * side;
  return [pS[0] + dirS[0] * d, pS[1] + dirS[1] * d, hS + yaw];
};
const [Bk] = bikes(1), RIDER = makePerson();

// ---- B: cross the seams at an angle, steady through the bend ----
const oB = (s) => 3.0 - 2.35 * sm(SB - 14, SB + 2, s);
const tX = g("s5", "tar"), VB = 9, sX = SB - 6;
const sB = (t) => sX + VB * (t - tX);
const pathB = (t) => P(sB(t), oB(sB(t)));
const mGo = addMat(GREEN, 0.55), mNo = addMat(RED, 0.9);
ribbon((s, o) => P(s, oB(s) + o), -0.08, 0.08, SB - 34, SB + 30, mGo, 0.03, 0.4);
ribbon((s, o) => P(s, 1.8 + 0.12 * Math.sin(s * 0.45) + o + 0.35), -0.12, 0.12, SB - 26, SB + 30, mNo, 0.03, 0.4);

// sun + rain for s6
const sun = new THREE.Mesh(new THREE.SphereGeometry(7, 24, 16), glow(ORANGE, 2.2)); scene.add(sun);
const RN = 900, rg = new THREE.BufferGeometry(), rp = new Float32Array(RN * 6), seed = Array.from({ length: RN }, (_, i) => [Math.sin(i * 12.9898) * 43758.5453 % 1, Math.sin(i * 78.233) * 12543.123 % 1, Math.sin(i * 39.425) * 9137.77 % 1].map((v) => Math.abs(v)));
rg.setAttribute("position", new THREE.BufferAttribute(rp, 3));
const rainM = new THREE.LineBasicMaterial({ color: new THREE.Color(0xbfd0ff).multiplyScalar(0.9), transparent: true, opacity: 0, toneMapped: false, fog: false });
const rain = new THREE.LineSegments(rg, rainM); rain.frustumCulled = false; scene.add(rain);
const setRain = (t, a) => {
  rainM.opacity = 0.55 * a; rain.visible = a > 0.01; if (!rain.visible) return;
  const c = camera.position;
  for (let i = 0; i < RN; i++) { const [a1, b, d] = seed[i], x = c.x + (a1 - 0.5) * 40, z = c.z + (b - 0.5) * 40 - 8, y = ((d * 16 - t * 18) % 16 + 16) % 16 + c.y - 12; rp.set([x, y, z, x + 0.03, y + 0.7, z + 0.08], i * 6); }
  rg.attributes.position.needsUpdate = true;
};

const tShiny = tag("SHINY TAR", ORANGE), tSlick = tag("SLICK", RED), tSlide = tag("FRONT SLIDES", RED), tSpot = tag("TAR LINES", ORANGE),
  tCross = tag("CROSS THEM", GREEN), tNot = tag("NOT ALONG", RED), tSteady = tag("STEADY LEAN", GREEN), tHot = tag("HOT", ORANGE), tRain = tag("RAIN", VIOLET), tWorse = tag("WORSE", RED);

title("NEVER LEAN HARD ON A TAR SNAKE");
cap("s1", "shiny", ["SHINY BLACK LINES", "ON THE BEND?"], VIOLET, { until: ["s1", "never"] });
cap("s2", "hot", ["HOT TAR SEAL", "IS SLICK"], RED, { y: 0.3, until: ["s2", "tyre"] });
cap("s2", "tyre", ["THE TYRE SLIDES"], RED, { y: 0.3, until: ["s2", "lose"] });
cap("s2", "lose", ["YOU LOSE", "THE FRONT"], RED, { y: 0.3, boom: 0.5 });
cap("s3", "spot", ["SPOT THE TAR LINES", "BEFORE THE BEND"], ORANGE, { y: 0.3 });
cap("s4", "choose", ["CROSS THEM"], GREEN, { until: ["s4", "not"] });
cap("s4", "not", ["DON'T RIDE", "ALONG THEM"], GREEN);
cap("s5", "keep", ["STEADY LEAN", "NO SUDDEN INPUTS"], GREEN);
cap("s6", "hot", ["HOT DAYS"], ORANGE, { until: ["s6", "rain"] });
cap("s6", "rain", ["AND RAIN", "MAKE THEM WORSE"], RED);
endCard(["SHINY LINES ARE SLIPPERY.", "CROSS THEM, DON'T RIDE THEM."]);

const fol = (fn) => (t) => pathState(fn, t);
const on = (t, a, b = 1e9) => sm(a - 0.1, a + 0.2, t) * (1 - sm(b - 0.15, b, t));
const W = (s, o, y) => { const [x, z] = P(s, o); return [x, y, z]; };
const cam = (s, o, y, ls, lo, ly, f) => [...W(s, o, y), ...W(ls, lo, ly), f];
const pE = pathA(tS + 1.8);
const SH = [
  { at: 0, f: fol(pathA), K: [[0, [0.6, 2.6, 6.5, -1.6, 0.4, -18, 50]], [2.2, [0.6, 2.4, 6.0, -2.0, 0.4, -18, 50]]] },
  { at: T2, cam: (t) => { const b = pathState(pathA, Math.min(t, tS + 1.8)); return [...W(sS + 13, -3.4, 2.3), b.x, 0.5, b.z, 40 + 8 * sm(T2, tS + 1, t)]; } },
  { at: T3, f: fol(pathB), K: [[0, [0.4, 3.4, 7.5, -1.2, 0.2, -22, 48]], [2.2, [0.3, 3.2, 7.0, -1.6, 0.2, -20, 48]]] },
  { at: T4, K: [[0, cam(SB - 30, -2.5, 15, SB - 2, 1.6, 0, 46)], [3, cam(SB - 27, -2.0, 14, SB, 1.6, 0, 46)]] },
  { at: T5, f: fol(pathB), K: [[0, [-3.0, 2.3, 5.5, -0.6, 0.7, 0, 50]], [2.4, [-3.2, 2.4, 5.2, -0.6, 0.7, 0, 50]]] },
  { at: T6, K: [[0, cam(SB + 4, -16, 10, SB + 26, 2.5, 0, 48)], [5, cam(SB + 6, -16, 11, SB + 30, 2.5, 0, 48)]] },
];

run("w", (t) => {
  const A = t < T3;
  if (A) {
    const k = sm(tS + 0.15, tS + 0.85, t), hex = t < T2 ? VIOLET : RED;
    ride(Bk, pathA, t, hex, t < tS ? { trail: true, lean: 0.25 * side * sm(T2 - 0.6, tS - 0.3, t) } : { lean: (1 - k) * ln0 * 1.25 + downLean(k, side), down: k, trail: k < 0.6 });
    const b = pathState(pathA, t), px = -Math.sin(b.h - Math.PI / 2 * side), pz = -Math.cos(b.h - Math.PI / 2 * side);
    pose(RIDER, { x: b.x - px * 1.1 + dirS[0] * 0.6, z: b.z - pz * 1.1 + dirS[1] * 0.6, h: b.h + 1.2 * side, lie: 1, armR: 1.6, armL: 0.8, vis: k > 0.5 });
  } else {
    ride(Bk, pathB, t, GREEN, { trail: t > T4 });
    pose(RIDER, { vis: false });
  }
  // seam shine: glossy white, red when it bites, orange when spotted, hot orange / wet red in s6
  const tint = A ? (t > g("s2", "slick") - 0.1 ? RED : ORANGE) : t < T4 ? ORANGE : t > T6 ? (t > g("s6", "rain") ? RED : ORANGE) : 0xd8d8ff;
  const kS = A ? 0.45 + 0.9 * on(t, g("s1", "shiny"), T2) + 1.0 * on(t, g("s2", "slick"), T3) : t < T4 ? 0.45 + 1.2 * on(t, g("s3", "spot"), T4) : t > T6 ? 0.6 + 1.3 * sm(g("s6", "hot"), g("s6", "worse"), t) : 0.45;
  shines.forEach((m, i) => { m.color.set(tint).multiplyScalar(kS * (0.85 + 0.15 * Math.sin(6 * t + i * 2))); m.opacity = 1; });
  mGo.opacity = !A && t < T6 ? on(t, g("s4", "crosses") - 0.2) * 0.85 : 0;
  mNo.opacity = !A && t < T5 ? on(t, g("s4", "not"), T5) * 0.85 : 0;
  // tags
  const b = pathState(A ? pathA : pathB, t);
  { const [x, z] = P(SB + 2, 1.8); tagAt(tShiny, x, 1.4, z, A ? on(t, g("s1", "shiny"), T2) : 0, 1.6); }
  { const [x, z] = P(sS - 2, 1.8); tagAt(tSlick, x, 1.4, z, A ? on(t, g("s2", "slick"), g("s2", "tyre")) : 0, 1.3); }
  { const [x, z] = P(SB + 6, 1.8); tagAt(tSpot, x, 1.6, z, !A && t < T4 ? on(t, g("s3", "spot"), T4) : 0, 2.0); }
  { const [x, z] = P(SB - 7, -1.6); tagAt(tCross, x, 0.8, z, !A && t < T5 ? on(t, g("s4", "crosses"), T5) : 0, 2.6); }
  { const [x, z] = P(SB + 10, 4.6); tagAt(tNot, x, 0.8, z, !A && t < T5 ? on(t, g("s4", "not"), T5) : 0, 2.6); }
  { const [x, z] = P(SB + 24, 4); tagAt(tHot, x, 2.2, z, on(t, g("s6", "hot"), g("s6", "rain")), 2.6); tagAt(tRain, x, 2.2, z, on(t, g("s6", "rain"), g("s6", "worse")), 2.6); tagAt(tWorse, x, 2.2, z, on(t, g("s6", "worse"), T7 + 4), 2.6); }
  { const [x, z] = P(SB + 160, 30); sun.position.set(x, 38, z); sun.visible = t > T6 - 0.2; sun.scale.setScalar(0.2 + 0.8 * sm(g("s6", "hot") - 0.1, g("s6", "hot") + 0.3, t)); sun.material.color.set(ORANGE).multiplyScalar(2.2 * (1 - 0.8 * sm(g("s6", "rain"), g("s6", "rain") + 0.4, t))); }
  const shot = shoot(SH, t);
  setRain(t, sm(g("s6", "rain") - 0.1, g("s6", "rain") + 0.3, t));
  bloom.strength = 1.0 + 1.2 * shot.punch * shot.punch + overlays(t) + (A ? 0.4 * flash(t, tS + 0.85) : 0);
});
