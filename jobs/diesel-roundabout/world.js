// 101 diesel-roundabout: a truck turning round a roundabout leaves a diesel streak; a rider comes in fast, leans hard,
// the rear tyre hits the diesel and the bike slides out (red). Right way: spot the rainbow shine, slow before entering
// while upright, ride round almost straight on the clean inner line, away from where the trucks turn (green).
import { THREE, S, g, sm, flash, scene, bloom, mSolid, VIOLET, ORANGE, RED, GREEN, pathState, shoot, makeTruck, patch } from "./kit.js";
import { run } from "./kit.js";
import { track, buildRoad, ribbon, makePerson, pose, title, endCard, cap, overlays, bikes, ride, downLean, tag, tagAt } from "./extra.js";

// ---- props ----
function rainbowTex(seed) {
  const c = document.createElement("canvas"); c.width = c.height = 256; const x = c.getContext("2d");
  const gr = x.createRadialGradient(128, 128, 4, 128, 128, 126);
  for (let i = 0; i <= 10; i++) gr.addColorStop(i / 10, `hsla(${(seed * 47 + i * 52) % 360}, 95%, 62%, ${i < 9 ? 0.85 : 0})`);
  x.fillStyle = gr; x.fillRect(0, 0, 256, 256);
  x.globalCompositeOperation = "lighter";
  for (let k = 0; k < 5; k++) { const a = seed + k * 1.7, r = 30 + 14 * k; x.strokeStyle = `hsla(${(k * 70 + seed * 30) % 360}, 100%, 70%, 0.5)`; x.lineWidth = 6; x.beginPath(); x.ellipse(128 + 18 * Math.cos(a), 128 + 14 * Math.sin(a), r, r * 0.8, a, 0, 7); x.stroke(); }
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t;
}
function slick(r, seed) {
  const m = new THREE.Mesh(new THREE.CircleGeometry(r, 40), new THREE.MeshBasicMaterial({ map: rainbowTex(seed), transparent: true, opacity: 0, toneMapped: false, depthWrite: false, blending: THREE.AdditiveBlending }));
  m.rotation.x = -Math.PI / 2; m.renderOrder = 4; scene.add(m); return m;
}
function ringMark(r, hex) {
  const m = new THREE.Mesh(new THREE.RingGeometry(r, r + 0.25, 48), new THREE.MeshBasicMaterial({ color: new THREE.Color(hex).multiplyScalar(2), transparent: true, opacity: 0, toneMapped: false, depthWrite: false, blending: THREE.AdditiveBlending }));
  m.rotation.x = -Math.PI / 2; m.renderOrder = 6; scene.add(m); return m;
}
// polyline path, Chaikin-smoothed, walked by distance u
function poly(pts) {
  let p = pts;
  for (let it = 0; it < 4; it++) { const q = [p[0]]; for (let j = 0; j < p.length - 1; j++) { const [a, b] = [p[j], p[j + 1]]; q.push([0.75 * a[0] + 0.25 * b[0], 0.75 * a[1] + 0.25 * b[1]], [0.25 * a[0] + 0.75 * b[0], 0.25 * a[1] + 0.75 * b[1]]); } q.push(p[p.length - 1]); p = q; }
  const cum = [0]; for (let j = 1; j < p.length; j++) cum.push(cum[j - 1] + Math.hypot(p[j][0] - p[j - 1][0], p[j][1] - p[j - 1][1]));
  return (u) => {
    if (u <= 0) return [p[0][0], p[0][1] - u];
    let lo = 0, hi = cum.length - 1; while (hi - lo > 1) { const m = (lo + hi) >> 1; if (cum[m] < u) lo = m; else hi = m; }
    const f = Math.min(1, (u - cum[lo]) / (cum[hi] - cum[lo] || 1)); return [p[lo][0] + f * (p[hi][0] - p[lo][0]), p[lo][1] + f * (p[hi][1] - p[lo][1])];
  };
}

// ---- world: approach road from the south (-z), roundabout at zc, exit road north ----
scene.fog.density = 0.007;
const T2 = S.s2[0], T3 = S.s3[0], T4 = S.s4[0], T5 = S.s5[0], T6 = S.s6[0], T7 = S.s7[0];
const Rr = 11, zc = -200, R1 = Rr + 1.6, R2 = Rr - 1.3, O = 1.8;
const { P } = track([{ len: 4000 }]);
buildRoad(P, -80, -(zc + Rr + 3.4)); buildRoad(P, -(zc - Rr - 3.4), 600);
const ringP = (s, o) => { const th = Math.PI / 2 - s / Rr, r = Rr + o; return [r * Math.cos(th), zc + r * Math.sin(th)]; };
buildRoad((s, o) => ringP(s, -o), 0, 2 * Math.PI * Rr + 1, { lamps: false, LW: 3.2 });
{ const isl = new THREE.Mesh(new THREE.CylinderGeometry(Rr - 3.8, Rr - 3.8, 0.3, 48), mSolid); isl.position.set(0, 0.15, zc); scene.add(isl); }
const circ = (r, th) => [r * Math.cos(th), zc + r * Math.sin(th)];
const zIn = zc + Rr + 3.4;

// ---- A: fast in on the outer lane, hard lean ----
const tS = g("s2", "tyre") + 0.1, VA = 11;
const ptsA = [[O, zIn + 40], [O, zIn + 2]]; for (let th = 1.2; th >= -2.0; th -= 0.1) ptsA.push(circ(R1, th));
const wA = poly(ptsA), uIn = 40 - 2, u0A = uIn - VA * (tS - 0.75); // reach the ring ~0.75 s before the slip
const ringA = (t) => wA(u0A + VA * t);
const pS = ringA(tS), pS2 = ringA(tS + 0.02), dirS = [(pS2[0] - pS[0]) / 0.02 / VA, (pS2[1] - pS[1]) / 0.02 / VA];
const hS = Math.atan2(-dirS[0], -dirS[1]), side = Math.sign(pathState(ringA, tS - 0.05).lean) || 1, ln0 = pathState(ringA, tS - 0.05).lean;
const slideD = (t) => { const tau = Math.min(1.9, t - tS); return VA * tau - 0.5 * (VA / 1.9) * tau * tau; };
const pathA = (t) => {
  if (t < tS) return ringA(t);
  const d = slideD(t), yaw = 0.55 * sm(tS, tS + 0.6, t) * side;
  return [pS[0] + dirS[0] * d, pS[1] + dirS[1] * d, hS + yaw];
};
const thC = Math.atan2(pS[1] - zc, pS[0]); // where the slip happens on the ring
const [Bk] = bikes(1), RIDER = makePerson();

// truck tractor going round on the outer lane, dripping diesel where it turns
const TR = makeTruck(); TR.g.children.forEach((c) => { if (c.position.z > 6) c.visible = false; });
const wT = 7 / R1, tTD = g("s2", "diesel");
const truckP = (t) => (t < tS - 0.4 ? circ(R1, thC + 0.25 - wT * (t - tTD)) : null);
const blobs = [0.35, 0.12, -0.1, -0.33, -0.55, -0.78].map((d, i) => {
  const th = thC + d, m = slick(1.0 + 0.35 * ((i * 37) % 3) / 2, i + 1), [x, z] = circ(R1 + 0.3 * Math.sin(i * 2.1), th);
  m.position.set(x, 0.02, z); m.scale.set(1.0, 1.0, 1.0); m.rotation.z = i;
  return { m, t: tTD + (thC + 0.25 - th) / wT };
});
const spillXZ = circ(R1, thC - 0.2);

// ---- B: right way, one continuous ride: slow before the entry, round the inner line, out north ----
const ptsB = [[O, zIn + 40], [O, zIn + 2]]; for (let th = 1.25; th >= -1.25; th -= 0.1) ptsB.push(circ(R2, th)); ptsB.push([O, zc - Rr - 3]); ptsB.push([O, zc - Rr - 200]);
const wB = poly(ptsB), tSlow = g("s4", "slow"), tEnter = g("s4", "upright") - 0.25, V1 = 9, V2 = 4.2;
const vB = (t) => V1 + (V2 - V1) * sm(tSlow - 0.1, tEnter - 0.5, t);
const DB = (() => { const dt = 0.01, A = [0]; for (let t = T3; t < T7 + 4; t += dt) A.push(A.at(-1) + vB(t + dt / 2) * dt); return (t) => { const f = Math.max(0, (t - T3) / dt), i = Math.min(A.length - 2, Math.floor(f)); return A[i] + (A[i + 1] - A[i]) * (f - i); }; })();
const u0B = uIn - DB(tEnter);
const pathB = (t) => wB(u0B + DB(t));

// overlays
const slowZ = patch(3.2, 12, GREEN, 0.55); slowZ.position.set(O, 0.03, zIn + 9);
const yieldL = patch(3.4, 0.35, 0xffffff, 0.8); yieldL.position.set(O, 0.03, zIn + 0.6);
const spot = ringMark(2.6, GREEN), redRing = ringMark(2.4, RED);
const clean = new THREE.MeshBasicMaterial({ color: new THREE.Color(GREEN).multiplyScalar(1.6), transparent: true, opacity: 0, toneMapped: false, depthWrite: false, blending: THREE.AdditiveBlending });
ribbon((s, o) => { const th = 1.25 - s / R2, r = R2 + o; return [r * Math.cos(th), zc + r * Math.sin(th)]; }, -0.6, 0.6, 0, 2.5 * R2, clean, 0.035, 0.3);
const tDiesel = tag("DIESEL", RED), tNoGrip = tag("NO GRIP", RED), tShine = tag("RAINBOW SHINE", ORANGE), tSlow2 = tag("SLOW", GREEN), tUp = tag("UPRIGHT", GREEN), tSmooth = tag("SMOOTH", GREEN), tClean = tag("CLEAN LINE", GREEN);

title("NEVER LEAN HARD ON A ROUNDABOUT");
cap("s2", "trucks", ["TRUCKS SPILL DIESEL", "WHERE THEY TURN"], RED, { until: ["s2", "tyre"], y: 0.3 });
cap("s2", "tyre", ["THE TYRE LOSES GRIP"], RED, { until: ["s2", "bike"], y: 0.3 });
cap("s2", "bike", ["THE BIKE SLIDES OUT"], RED, { y: 0.3, boom: 0.5 });
cap("s3", "look", ["LOOK FOR A SHINY,", "RAINBOW PATCH"], GREEN, { y: 0.3 });
cap("s4", "slow", ["SLOW DOWN", "BEFORE YOU ENTER"], GREEN, { until: ["s4", "while"] });
cap("s4", "while", ["WHILE THE BIKE", "IS STILL UPRIGHT"], GREEN);
cap("s5", "keep", ["KEEP THE BIKE AS", "STRAIGHT AS YOU CAN"], GREEN, { until: ["s5", "smooth"] });
cap("s5", "smooth", ["SMOOTH ON", "THE THROTTLE"], GREEN, { until: ["s5", "no"] });
cap("s5", "no", ["NO HARD BRAKING"], GREEN);
cap("s6", "ride", ["RIDE THE", "CLEANER LINE"], GREEN, { until: ["s6", "away"] });
cap("s6", "away", ["AWAY FROM WHERE", "THE TRUCKS TURN"], GREEN);
endCard(["ROUNDABOUTS HIDE DIESEL.", "RIDE SLOW AND UPRIGHT."]);

const fol = (fn) => (t) => pathState(fn, t);
const [sx, sz] = spillXZ;
const pE = pathA(tS + 1.9), mid = [(pS[0] + 2 * pE[0]) / 3, (pS[1] + 2 * pE[1]) / 3], rad = [(pS[0]) / Math.hypot(pS[0], pS[1] - zc), (pS[1] - zc) / Math.hypot(pS[0], pS[1] - zc)];
const cA = [pS[0] - dirS[0] * 7 + rad[0] * 4, pS[1] - dirS[1] * 7 + rad[1] * 4];
const SH = [
  { at: 0, f: fol(pathA), noRot: true, K: [[0, [2.2, 2.6, 7.5, -0.5, 0.9, -14, 50]], [2.4, [2.4, 2.8, 7.2, -0.5, 0.9, -14, 50]]] },
  { at: T2, K: [[0, [26, 15, zc + 26, 5, 0, zc + 1, 46]], [2.0, [24, 13, zc + 23, 6, 0, zc + 0, 46]]] },
  { at: tS - 0.35, K: [[0, [cA[0], 5, cA[1], mid[0], 0.3, mid[1], 50]], [2.6, [cA[0] - dirS[0] * 1.5, 5.6, cA[1] - dirS[1] * 1.5, mid[0], 0.3, mid[1], 50]]] },
  { at: T3, K: [[0, [sx + 6, 2.6, sz + 6, sx, 0, sz, 46]], [2.0, [sx + 5, 2.3, sz + 5, sx, 0, sz, 46]]] },
  { at: T4, f: fol(pathB), noRot: true, K: [[0, [-6, 2.4, 2.0, 0, 0.7, -1.0, 46]], [2.7, [-6, 2.6, 1.0, 0, 0.7, -1.5, 46]]] },
  { at: T5, f: fol(pathB), K: [[0, [-1.5, 3.2, 6.5, 0, 0.8, -8, 50]], [3.8, [-1.8, 3.4, 7.0, 0, 0.8, -8, 50]]] },
  { at: T6, K: [[0, [5, 34, zc + 20, 1, 0, zc - 2, 44]], [2.6, [5, 36, zc + 22, 1, 0, zc - 3, 44]]] },
  { at: T7, K: [[0, [5, 36, zc + 22, 1, 0, zc - 3, 44]], [4, [6, 40, zc + 25, 1, 0, zc - 4, 44]]] },
];

const ramp = (id, w, n = 1) => sm(g(id, w, n) - 0.1, g(id, w, n) + 0.2, 0);
const on = (t, a, b = 1e9) => sm(a - 0.1, a + 0.2, t) * (1 - sm(b - 0.15, b, t));
run("w", (t) => {
  const A = t < T3;
  if (A) {
    const k = sm(tS + 0.15, tS + 0.9, t), hex = t < T2 ? VIOLET : RED;
    const lean = t < tS ? 0 : ln0 * (1 - k) * (1 - sm(tS, tS + 0.2, t)) + (t > tS ? ln0 * (1 - sm(tS, tS + 0.2, t)) * 0 : 0);
    ride(Bk, pathA, t, hex, t < tS ? { trail: true } : { lean: (1 - k) * ln0 + downLean(k, side), down: k, trail: k < 0.6 });
    const b = pathState(pathA, t), px = -Math.sin(b.h - Math.PI / 2 * side), pz = -Math.cos(b.h - Math.PI / 2 * side);
    pose(RIDER, { x: b.x - px * 1.1 + dirS[0] * 0.6, z: b.z - pz * 1.1 + dirS[1] * 0.6, h: b.h + 1.2 * side, lie: 1, armR: 1.6, armL: 0.8, vis: k > 0.5 });
  } else {
    ride(Bk, pathB, t, GREEN, { trail: t > T5 - 0.5 });
    pose(RIDER, { vis: false });
  }
  TR.set(pathState(truckP, t));
  blobs.forEach((o) => (o.m.material.opacity = 0.75 * sm(o.t - 0.1, o.t + 0.35, t) * (A ? 1 : 1)));
  // tags and marks
  const b = pathState(A ? pathA : pathB, t);
  tagAt(tDiesel, sx, 1.6, sz, A ? on(t, g("s2", "diesel"), g("s2", "tyre")) : on(t, g("s6", "trucks"), T7), 1.3);
  tagAt(tNoGrip, mid[0], 2.0, mid[1], A ? on(t, g("s2", "grip"), T3) : 0, 1.2);
  spot.position.set(sx, 0.04, sz); spot.material.opacity = on(t, g("s3", "look"), T4) * (0.7 + 0.3 * Math.sin(10 * t)); spot.scale.setScalar(0.75 + 0.04 * Math.sin(10 * t));
  redRing.position.set(sx, 0.04, sz); redRing.material.opacity = on(t, g("s6", "away"), T7 + 3) * 0.9; redRing.scale.setScalar(1.7);
  slowZ.set(!A && t < T5 ? on(t, tSlow, tEnter + 0.6) : 0);
  yieldL.set(!A && t < T6 ? 1 : 0);
  tagAt(tSlow2, O - 2.6, 0.8, zIn + 9, !A ? on(t, tSlow, g("s4", "while")) : 0, 1.0);
  tagAt(tUp, b.x, 2.3, b.z, !A ? on(t, g("s4", "upright"), T5) : 0, 1.0);
  tagAt(tSmooth, b.x, 2.3, b.z, on(t, g("s5", "smooth"), g("s5", "no")), 1.0);
  clean.opacity = 0.6 * on(t, g("s6", "cleaner"), T7 + 3);
  tagAt(tClean, -R2 * 0.2, 1.2, zc - R2 + 1.5, on(t, g("s6", "cleaner"), T7), 2.2);
  const shot = shoot(SH, t);
  bloom.strength = 1.0 + 1.2 * shot.punch * shot.punch + overlays(t) + (A ? 0.4 * flash(t, tS + 0.9) : 0);
});
