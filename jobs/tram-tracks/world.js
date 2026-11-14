// 105 tram-tracks: wrong = rider crosses tram rails at a shallow angle, the front wheel drops into the groove, the bars snap, he falls (red).
// Right = move over first, cross close to a right angle, upright, no brakes on the metal; in the rain slow down even more (green).
import { THREE, S, g, sm, flash, scene, camera, bloom, box, beam, patch, VIOLET, ORANGE, RED, GREEN, WHITE, pathState, shoot, run } from "./kit.js";
import { track, buildRoad, makePerson, pose, title, endCard, cap, overlays, bikes, ride, downLean, tag, tagAt } from "./extra.js";

// ---- props: grooved street tram rails (rail head, black groove, lip) in pairs ----
const RA = 0.36, GA = 0.7175;                                   // rails run forward-left, 20.6 deg off the road; half gauge
const dR = [-Math.sin(RA), -Math.cos(RA)], nR = [Math.cos(RA), -Math.sin(RA)];
const mSteel = new THREE.MeshStandardMaterial({ color: 0xdfe3ff, emissive: 0x6a70a8, roughness: 0.15, metalness: 0.6 });
const mGroove = new THREE.MeshBasicMaterial({ color: 0x000000 });
const mBed = new THREE.MeshStandardMaterial({ color: 0x1c1844, roughness: 0.8 });
const strip = (cx, cz, off, w, y, mat, L) => { const m = new THREE.Mesh(new THREE.BoxGeometry(w, 0.01, L), mat); m.position.set(cx + nR[0] * off, y, cz + nR[1] * off); m.rotation.y = RA; scene.add(m); return m; };
function railPair(cx, cz, L = 46) {
  strip(cx, cz, 0, 2.3, 0.006, mBed, L);
  for (const s of [-1, 1]) { const o = s * GA; strip(cx, cz, o, 0.075, 0.016, mSteel, L); strip(cx, cz, o + s * 0.06, 0.045, 0.017, mGroove, L); strip(cx, cz, o + s * 0.1, 0.035, 0.016, mSteel, L); }
}
// near rail of a pair passes through W -> pair centre (rider moving forward meets the low-f rail first)
const pairAt = (W, k = 0) => [W[0] + nR[0] * (GA + k), W[1] + nR[1] * (GA + k)];

// ---- path integrator: heading h(t) (0 = -z, + = left), speed v(t) -> [x, z, h] ----
function integ(t0, t1, x0, z0, hF, vF) {
  const dt = 0.01, n = Math.ceil((t1 - t0) / dt) + 1, X = [x0], Z = [z0];
  for (let i = 1; i < n; i++) { const t = t0 + (i - 0.5) * dt, h = hF(t), v = vF(t); X.push(X[i - 1] - Math.sin(h) * v * dt); Z.push(Z[i - 1] - Math.cos(h) * v * dt); }
  return (t) => { const f = Math.min(n - 1.001, Math.max(0, (t - t0) / dt)), i = Math.floor(f), r = f - i; return [X[i] + (X[i + 1] - X[i]) * r, Z[i] + (Z[i + 1] - Z[i]) * r, hF(t)]; };
}
const front = (p, d = 0.68) => [p[0] - Math.sin(p[2]) * d, p[1] - Math.cos(p[2]) * d];
const bump = (t, a, b, e = 0.5) => sm(a, a + e, t) - sm(b - e, b, t);

scene.fog.density = 0.009;
const { P } = track([{ len: 4000 }]);
buildRoad(P, -80, 1500, { LW: 5, lamps: true });
const T2 = S.s2[0], T3 = S.s3[0], T4 = S.s4[0], T5 = S.s5[0], T6 = S.s6[0], T7 = S.s7[0], TE = S.s8[0] + S.s8[1];

// ---- A: wrong way, rides straight across rails at a shallow angle ----
const tDrop = g("s2", "drops") + 0.05, tSnap = g("s2", "snap"), tFall = g("s2", "fall");
const hA = (t) => RA * sm(tDrop, tDrop + 0.35, t) + 0.9 * sm(tSnap - 0.05, tSnap + 0.35, t);
const vA = (t) => (t < tDrop ? 9 : t < tSnap ? 9 - 3 * sm(tDrop, tSnap, t) : 6 * Math.exp(-(t - tSnap) / 0.55));
const aPath = integ(-1, T3 + 1, 2, -100, hA, vA);
const WA = front(aPath(tDrop)), cA = pairAt(WA);
railPair(...cA); railPair(...pairAt(WA, 4.6));
const wob = (t) => 0.12 * Math.sin((t - tDrop) * 22) * bump(t, tDrop, tSnap + 0.1, 0.15);
const kD = (t) => sm(tSnap + 0.05, tFall + 0.15, t);

// ---- B: right way, move over left, then turn right and cross both pairs near 90 deg ----
const tMv = g("s3", "move"), tCr = g("s4", "cross") - 0.3, t1 = g("s4", "angle"), t2 = g("s5", "upright"), tOut = g("s5", "metal") + 0.6;
const hB = (t) => 0.55 * bump(t, tMv - 0.1, tMv + 1.3, 0.45) - 0.72 * bump(t, tCr, tOut, 0.55);
const vB = (t) => 6.5 - 3.2 * sm(tMv + 0.8, tCr + 0.3, t) + 3 * sm(tOut, tOut + 1, t);
const bPath = integ(T3 - 1, T6 + 1, 2.4, -600, hB, vB);
const WB1 = front(bPath(t1)), WB2 = front(bPath(t2));
const sp = (WB2[0] - WB1[0]) * nR[0] + (WB2[1] - WB1[1]) * nR[1];
railPair(...pairAt(WB1)); railPair(...pairAt(WB1, sp));

// ---- C: rain, slows down even more, crosses straight ----
const tC = g("s7", "straight"), tCc = g("s7", "cross") - 0.5;
const hC = (t) => -0.72 * bump(t, tCc, tC + 1.3, 0.5);
const vC = (t) => 7 - 4.6 * sm(g("s6", "slow") - 0.1, g("s6", "more") + 0.3, t);
const cPath = integ(T6 - 1, TE + 1, -2.2, -1100, hC, vC);
const WC = front(cPath(tC)); railPair(...pairAt(WC));

// ---- rain: streaks around the camera (s6+) ----
const RN = 900, rg = new THREE.BufferGeometry(), rp = new Float32Array(RN * 6), seed = Array.from({ length: RN }, (_, i) => [Math.sin(i * 12.9898) * 43758.5453 % 1, Math.sin(i * 78.233) * 12543.123 % 1, Math.sin(i * 39.425) * 9137.77 % 1].map((v) => Math.abs(v)));
rg.setAttribute("position", new THREE.BufferAttribute(rp, 3));
const rain = new THREE.LineSegments(rg, new THREE.LineBasicMaterial({ color: new THREE.Color(0xbfd0ff).multiplyScalar(0.9), transparent: true, opacity: 0.5, toneMapped: false, fog: false }));
rain.frustumCulled = false; scene.add(rain);
const setRain = (t) => {
  rain.visible = t > T6; if (!rain.visible) return; const c = camera.position;
  for (let i = 0; i < RN; i++) { const [a, b, d] = seed[i], x = c.x + (a - 0.5) * 30, z = c.z + (b - 0.5) * 30 - 6, y = ((d * 14 - t * 16) % 14 + 14) % 14 + c.y - 9; rp.set([x, y, z, x + 0.03, y + 0.55, z + 0.08], i * 6); }
  rg.attributes.position.needsUpdate = true;
};

// ---- actors + overlays ----
const [Bk] = bikes(1), THROWN = makePerson();
const pathRed = beam(RED, 2.0, 0.035), railRed = beam(RED, 2.0, 0.035), pathGrn = beam(GREEN, 1.6, 0.035), upBeam = beam(GREEN, 1.6, 0.03);
const hit = patch(1.0, 1.0, RED, 1.6), hitB = patch(0.9, 0.9, GREEN, 1.0), wet = patch(2.3, 8, 0x9fc0ff, 0.5);
const tShallow = tag("SHALLOW ANGLE", RED), tGroove = tag("GROOVE", RED), tRight = tag("~90°", GREEN), tUp = tag("UPRIGHT", GREEN),
  tNoBr = tag("NO BRAKES", ORANGE), tWet = tag("WET STEEL", ORANGE), tSlow = tag("SLOW", GREEN);
const V3 = (x, y, z) => new THREE.Vector3(x, y, z);

title("NEVER CROSS TRAM TRACKS AT A SHALLOW ANGLE");
cap("s2", "front", ["THE WHEEL DROPS", "INTO THE GROOVE"], RED, { y: 0.3, until: ["s2", "bars"] });
cap("s2", "bars", "THE BARS SNAP", RED, { y: 0.3, until: ["s2", "and"] });
cap("s2", "and", "YOU FALL", RED, { y: 0.3, boom: 0.6 });
cap("s3", "move", "MOVE OVER FIRST", GREEN, { y: 0.3, until: ["s3", "so"] });
cap("s3", "so", ["SO YOU CAN", "CROSS STRAIGHT"], GREEN, { y: 0.3 });
cap("s4", "cross", ["CROSS CLOSE TO", "A RIGHT ANGLE"], GREEN);
cap("s5", "keep", "KEEP IT UPRIGHT", GREEN, { until: ["s5", "no"] });
cap("s5", "no", ["NO BRAKING", "ON THE METAL"], GREEN);
cap("s6", "in", ["RAIN? SLOW DOWN", "EVEN MORE"], ORANGE, { until: ["s6", "wet"] });
cap("s6", "wet", ["WET STEEL", "HAS NO GRIP"], ORANGE);
endCard(["CROSS TRACKS STRAIGHT.", "NEVER ALONG THEM."]);

// ---- shots ----
const fol = (fn) => (t) => pathState(fn, t);
const SH = [
  { at: 0, f: fol(aPath), noRot: true, K: [[0, [-1.2, 2.5, 6.0, -0.6, 0.4, -14, 50]], [2.6, [-1.5, 2.9, 5.6, -0.8, 0.2, -12, 50]]] },
  { at: T2, f: fol(aPath), noRot: true, K: [[0, [3.2, 2.2, -4.6, -0.6, 0.4, 0, 50]], [1.4, [3.6, 2.4, -3.6, -0.8, 0.3, 0, 50]], [3.2, [3.8, 2.6, -2.6, -1.4, 0.3, 0, 50]]] },
  { at: T3, f: fol(bPath), noRot: true, K: [[0, [-1.0, 9, 9, -1.5, 0, -12, 50]], [2.2, [-1.4, 9.5, 8.5, -1.5, 0, -10, 50]]] },
  { at: T4, K: [[0, [WB1[0] - 6.5, 5.5, WB1[1] + 4.0, WB1[0] + 0.5, 0.3, WB1[1] - 1.0, 48]], [2.1, [WB1[0] - 6.0, 5.0, WB1[1] + 1.5, WB1[0] + 1.5, 0.3, WB1[1] - 2.5, 48]]] },
  { at: T5, K: [[0, [WB2[0] - 7.5, 3.0, WB2[1] - 2.5, WB2[0], 0.5, WB2[1] + 0.8, 50]], [2.1, [WB2[0] - 7.0, 3.2, WB2[1] - 4.0, WB2[0] + 1.0, 0.5, WB2[1] - 1.0, 50]]] },
  { at: T6, f: fol(cPath), noRot: true, K: [[0, [-1.3, 2.6, 6.0, 0.6, 0.4, -14, 50]], [3.0, [-1.4, 2.8, 5.6, 0.8, 0.3, -12, 50]]] },
  { at: T7, K: [[0, [WC[0] - 1.5, 6.5, WC[1] + 8, WC[0] + 0.5, 0, WC[1] - 2, 50]], [5, [WC[0] - 1.5, 8, WC[1] + 7, WC[0] + 1.5, 0, WC[1] - 4, 50]]] },
];

const on = (t, a, b = 1e9) => sm(a - 0.1, a + 0.2, t) * (1 - sm(b - 0.15, b, t));
run("w", (t) => {
  const A = t < T3, Bp = !A && t < T6;
  Bk.tail.material.color.set(RED).multiplyScalar(2.5);
  let st;
  if (A) {
    const k = kD(t);
    st = ride(Bk, aPath, t, RED, k > 0 ? { lean: downLean(k, -1) + wob(t), down: k } : { lean: wob(t) });
    Bk.fork.rotation.y = t > tDrop ? 0.15 * Math.sin((t - tDrop) * 22) * (1 - sm(tSnap - 0.1, tSnap, t)) + 0.85 * sm(tSnap - 0.05, tSnap + 0.12, t) : Bk.fork.rotation.y;
    const dip = bump(t, tDrop - 0.05, tDrop + 0.35, 0.12); Bk.g.rotation.x = -0.09 * dip; Bk.g.position.y = -0.05 * dip;
    if (t > tFall) {
      const u = t - tFall, p = aPath(tFall), h = p[2], d = 0.8 + 2.2 * sm(0, 0.9, u);
      pose(THROWN, { x: p[0] - Math.sin(h) * d + 0.6, z: p[1] - Math.cos(h) * d, h, lie: sm(0, 0.35, u), armR: 2.4, armL: 1.8, hex: RED });
      THROWN.g.position.y += 0.6 * Math.sin(Math.PI * Math.min(1, u / 0.5));
    } else pose(THROWN, { vis: false });
    // s1: straight path ahead meets the rail at a shallow angle
    const s1a = t < T2 + 0.6 ? on(t, g("s1", "cross"), T2 + 0.6) : 0;
    pathRed.set(V3(st.x, 0.05, st.z - 1), V3(WA[0], 0.05, WA[1]), s1a);
    railRed.set(V3(WA[0] - dR[0] * 9, 0.05, WA[1] - dR[1] * 9), V3(WA[0] + dR[0] * 3, 0.05, WA[1] + dR[1] * 3), s1a);
    tagAt(tShallow, WA[0] - 1.2, 1.1, WA[1], on(t, g("s1", "shallow"), T2 + 0.6), 2.0);
    hit.position.set(WA[0], 0.03, WA[1]); hit.set(t > tDrop - 0.05 ? on(t, tDrop, tFall + 0.6) : 0);
    tagAt(tGroove, WA[0] + 0.9, 0.7, WA[1] + 0.4, on(t, tDrop, tSnap), 1.0);
  } else {
    pose(THROWN, { vis: false }); pathRed.set(V3(0, 0, 0), V3(0, 0, 1), 0); railRed.set(V3(0, 0, 0), V3(0, 0, 1), 0); hit.set(0);
    st = ride(Bk, Bp ? bPath : cPath, t, GREEN, { trail: true });
  }
  // s3: green line of the planned crossing, square to the rails
  const pl = Bp ? on(t, g("s3", "so"), T4 + 0.8) : 0, mB = [(WB1[0] + WB2[0]) / 2, (WB1[1] + WB2[1]) / 2];
  pathGrn.set(V3(mB[0] - nR[0] * 4, 0.05, mB[1] - nR[1] * 4), V3(mB[0] + nR[0] * 4, 0.05, mB[1] + nR[1] * 4), pl);
  // s4/s5: crossing marks
  const xA = Bp ? on(t, t1 - 0.15, t2 + 0.1) : 0, xB = Bp ? on(t, t2 - 0.15, T6) : 0, W = xB > 0 ? WB2 : WB1;
  hitB.position.set(W[0], 0.03, W[1]); hitB.rotation.z = 0; hitB.set(Math.max(xA, xB) * 0.8);
  tagAt(tRight, WB1[0] - 3.2, 0.6, WB1[1] + 1.5, Bp ? on(t, g("s4", "right"), T5) : 0, 1.2);
  upBeam.set(V3(st.x, 0.1, st.z), V3(st.x, 2.6, st.z), Bp ? on(t, g("s5", "upright"), g("s5", "no")) : 0);
  tagAt(tUp, st.x, 3.0, st.z, Bp ? on(t, g("s5", "upright"), g("s5", "no")) : 0, 1.1);
  // s6: rain, wet shine on the rails, slows down
  const wt = t > T6 ? on(t, g("s6", "wet"), T7) : 0;
  wet.position.set(WC[0], 0.025, WC[1]); wet.rotation.z = -RA; wet.set(wt * (0.5 + 0.3 * Math.sin(t * 9)));
  tagAt(tWet, WC[0] - 1.5, 1.0, WC[1] - 1, wt, 1.4);
  tagAt(tSlow, st.x - 1.0, 2.1, st.z, t > T6 ? on(t, g("s6", "slow"), g("s6", "wet")) : 0, 1.0);
  const shot = shoot(SH, t);
  setRain(t);
  bloom.strength = 1.0 + 1.2 * shot.punch * shot.punch + overlays(t) + (A ? 0.8 * flash(t, tFall) + 0.4 * flash(t, tDrop) : 0);
});
