// 153 looked-at-me: a car waits at a side road, the driver looks straight at the rider (red) and pulls out anyway.
// Rewind into the driver's seat: the bike is one small headlight that barely moves, then the windshield pillar hides it.
// Right way (green): a weave across the lane makes the light jump out in his view, brake covered.
import { THREE, S, g, sm, scene, camera, bloom, glow, hud, patch, beam, box, tube, local, mAsph, mFrame, makeCar, VIOLET, ORANGE, RED, GREEN, WHITE, mSolid, pathState, shoot, run } from "./kit.js";
import { track, ribbon, buildRoad, title, endCard, cap, boom, overlays, bikes, ride, dist, tag, tagAt, END } from "./extra.js";

scene.fog.density = 0.014; // the far bike must fade to a single headlight, not vanish

// ---- timing ----
const T2 = S.s2[0], T3 = S.s3[0], T4 = S.s4[0], T5 = S.s5[0], T6 = S.s6[0], T7 = S.s7[0], T8 = S.s8[0], TE = END("s8");
const tThen = g("s1", "then"), tPull = g("s1", "pulled");
const tYou2 = g("s2", "you"), tHe2 = g("s2", "he"), tGoes2 = g("s2", "goes");
const tBike4 = g("s4", "bike"), tHead = g("s4", "headlight"), tDoesnt = g("s4", "doesn");
const tCovers = g("s5", "covers"), tLooks = g("s5", "looks"), tGoes5 = g("s5", "goes");
const tShift = g("s6", "shift"), tMakes = g("s6", "makes"), tJump = g("s6", "jump"), tView = g("s6", "view"), tAnd = g("s6", "and"), tCover = g("s6", "cover");
const tCutC = tView + 0.2;
const on = (t, a, b = 1e9) => sm(a - 0.1, a + 0.2, t) * (1 - sm(b - 0.15, b, t));
const rad = Math.PI / 180, v3 = (x, y, z) => new THREE.Vector3(x, y, z);

// ---- the junction: main road north (-z), side road joins from the right at s = J ----
const J = 100, LW = 3.6;
const { P } = track([{ len: 900 }]);
buildRoad(P, -60, J + 250, { LW, lamps: false, gaps: [[J - 4.1, J + 4.1, 1]] });
// lamps on the far side only: none may stand in the driver's line of sight
for (let s = -60; s < J + 250; s += 20) scene.add(box(0.1, 4, 0.1, -LW - 1.6, 2, -s, mFrame, false), box(0.9, 0.08, 0.2, -LW - 1.2, 4, -s, glow(VIOLET, 2.0), false));
const P2 = (s, o) => [LW + s, -J + o];
ribbon(P2, -3.7, 3.7, 0.4, 70, mAsph);
for (const sd of [-1, 1]) ribbon(P2, sd * 3.6 - 0.04, sd * 3.6 + 0.04, 0.9, 70, mFrame, 0.02, 0.5);
for (let s = 6; s < 70; s += 4) ribbon(P2, -0.06, 0.06, s, s + 1.6, glow(VIOLET, 1.1), 0.012, 0.4);

// ---- the car: waits nose-in, angled toward its left turn; e = seconds since it starts to pull out ----
const car = makeCar({ driver: true });
const H0 = Math.PI / 2 + 0.5, C0 = [6.6, -J - 1.6], F = [-Math.sin(H0), -Math.cos(H0)], L = [-Math.cos(H0), Math.sin(H0)];
const carSt = (e) => { const d = 5 * sm(0, 1.4, e); return { x: C0[0] + F[0] * d, z: C0[1] + F[1] * d, h: H0 }; };
const HL = [-0.4, 1.25, 0.4], head = (cs) => local(cs.x, cs.z, cs.h, ...HL), CS0 = carSt(-9);
// angle of a world point left of the car's nose, seen from the driver's head (degrees)
const bearing = (cs, x, z) => { const [hx, , hz] = head(cs), vx = x - hx, vz = z - hz; return Math.atan2(vx * L[0] + vz * L[1], vx * F[0] + vz * F[1]) / rad; };

// ---- red rider: 15 m/s, brakes hard from e = 0.2, stops half a metre short of the car's side ----
const SSTOP = J - 3.55, vR = (e) => 15 * (1 - sm(0.2, 1.3, e)), DR = dist(vR, -8, 3), DT = DR(3);
const rPath = (e) => [1.8, -(SSTOP - DT + DR(e)), 0];
// story time -> event time, one mapping per section (each extrapolates, so finite differences never cross a cut)
const eA = (t) => 1.2 * (t - tPull) + 0.2;
const eB = (t) => 0.6 * (t - tGoes2) + 0.15;
const eD = (t) => (t < tGoes5 ? 0.45 * (t - tGoes5) : t - tGoes5);
const eC = (t) => eB(T3) + (eD(T4) - eB(T3)) * sm(T3, T4 - 0.1, t); // the rewind
const segE = (t) => (t < T2 ? eA : t < T3 ? eB : t < T4 ? eC : eD);
const fnOf = (E) => (tt) => rPath(E(tt)), fnA = fnOf(eA), fnB = fnOf(eB);

// ---- green rider: 16 m/s, passes the junction early in s7, weaves across the lane on the way ----
const tPass = T7 + 0.7, sG = (t) => J - 16 * (tPass - t);
const oG = (t) => 1.0 + 1.6 * sm(tShift - 0.3, tShift + 0.8, t) - 1.9 * sm(tJump - 0.35, tJump + 0.25, t) + 0.8 * sm(tAnd - 0.1, tAnd + 1.3, t);
const gPath = (t) => [oG(t), -sG(t)];
const lane = (o) => (t) => ({ x: o, z: -sG(t), h: 0 }); // camera anchor that ignores the weave

// ---- driver's cabin (seen only from his seat): door sill, dash, and the pillar exactly where it hides the bike ----
const bikeB = (e) => { const p = rPath(e); return bearing(CS0, p[0], p[1]); };
const thL = bikeB(eD(tCovers) - 0.05), thR = bikeB(-0.1);
const PR = 2.6, pil = (th, y) => [-PR * Math.sin(th * rad), (y - HL[1]) * PR / 0.7, -PR * Math.cos(th * rad)];
const pillar = new THREE.Group(); pillar.position.set(...HL);
const cabin = new THREE.Group(); scene.add(cabin);
{
  const mDark = new THREE.MeshBasicMaterial({ color: 0x0d0a2e, fog: false, side: THREE.DoubleSide });
  const q = [pil(thR - 2, 0.75), pil(thL - 2, 0.75), pil(thL + 2.5, 1.9), pil(thR + 2.5, 1.9)];
  const geo = new THREE.BufferGeometry(); geo.setAttribute("position", new THREE.Float32BufferAttribute(q.flat(), 3)); geo.setIndex([0, 1, 2, 0, 2, 3]);
  const mPil = mDark.clone(); mPil.color.set(0x1b1650); const mEdgeP = mDark.clone(); mEdgeP.color.set(0x4a3fa0); // dim edges: bright ones fight the captions
  pillar.add(new THREE.Mesh(geo, mPil), tube(q[0], q[3], 0.022, mEdgeP), tube(q[1], q[2], 0.022, mEdgeP)); cabin.add(pillar);
  cabin.add(box(0.1, 1.06, 2.6, -0.97, 0.53, 0.0, mDark), box(1.9, 0.12, 0.7, 0, 1.0, -0.62, mDark));
}
const povCam = (cs, th, fov, pitch = -0.05) => {
  const [hx, hy, hz] = head(cs), c = Math.cos(th * rad), s = Math.sin(th * rad);
  return [hx, hy, hz, hx + (F[0] * c + L[0] * s) * 30, hy + 30 * pitch, hz + (F[1] * c + L[1] * s) * 30, fov];
};

// ---- props ----
const [Br, Bg] = bikes(2);
const suit = (B, hex) => { const m = mSolid.clone(); m.color.set(hex); if (m.emissive) m.emissive.set(hex).multiplyScalar(0.4); B.rider.traverse((o) => { if (o.material === mSolid) o.material = m; }); B.visor.material = glow(hex, 2.4); };
suit(Br, RED); suit(Bg, GREEN);
for (const B of [Br, Bg]) { const m = glow(WHITE, 3); m.fog = false; const s = new THREE.Mesh(new THREE.SphereGeometry(0.13, 12, 8), m); s.position.set(0, 0, -0.2); B.fork.add(s); } // headlight that survives the fog
const hand = box(0.14, 0.11, 0.14, 0.39, 1.09, -0.5, glow(GREEN, 3), false); Bg.lean.add(hand);
const hit = patch(2.6, 3.4, RED, 1.6); hit.position.set(1.8, 0.03, -J + 3.0);
const bW = beam(WHITE, 2.2, 0.06), bV = beam(VIOLET, 2.6, 0.06);
const tBike = tag("THE BIKE", WHITE, 1.4), tSeen = tag("SEEN", GREEN, 1.6);
const ring = new THREE.Mesh(new THREE.RingGeometry(0.47, 0.5, 64), new THREE.MeshBasicMaterial({ color: new THREE.Color(WHITE).multiplyScalar(0.9), transparent: true, toneMapped: false, depthTest: false, depthWrite: false, fog: false }));
ring.userData.w = 1; ring.renderOrder = 20; ring.visible = false; scene.add(ring);

title("HE LOOKED RIGHT AT ME");
boom("s1", "anyway", 0.6);
cap("s2", "every", ["EVERY RIDER", "KNOWS THIS"], VIOLET, { until: ["s2", "you"] });
cap("s2", "you", ["YOU SEE", "HIS FACE"], WHITE, { until: ["s2", "he"] });
cap("s2", "he", ["HE SEES", "YOU"], WHITE, { until: ["s2", "goes"] });
cap("s2", "goes", "HE GOES", RED, { boom: 0.6 });
cap("s3", "now", "REWIND", WHITE, { until: ["s3", "sit"] });
cap("s3", "sit", ["SIT IN", "THE CAR"], ORANGE);
cap("s4", "from", ["THE DRIVER'S", "SEAT"], ORANGE, { until: ["s4", "one"] });
cap("s4", "one", ["ONE SMALL", "HEADLIGHT"], WHITE, { until: ["s4", "doesn"] });
cap("s4", "doesn", ["NO SIDEWAYS", "MOVEMENT"], RED, { until: ["s4", "barely"] });
cap("s4", "barely", ["BARELY SEEMS", "TO MOVE"], RED);
cap("s5", "pillar", ["THE PILLAR", "COVERS IT"], RED, { until: ["s5", "looks"] });
cap("s5", "looks", "HE LOOKS", WHITE, { until: ["s5", "sees"] });
cap("s5", "sees", ["AN EMPTY", "ROAD"], WHITE, { until: ["s5", "goes"] });
cap("s5", "goes", "HE GOES", RED, { boom: 0.7 });
cap("s6", "so", "SO MOVE", GREEN, { until: ["s6", "shift"] });
cap("s6", "shift", ["SHIFT ACROSS", "YOUR LANE"], GREEN, { until: ["s6", "makes"] });
cap("s6", "makes", ["THE LIGHT", "JUMPS"], GREEN, { until: ["s6", "and"] });
cap("s6", "and", ["COVER YOUR", "BRAKE"], GREEN);
endCard(["HE LOOKED.", "HE NEVER SAW YOU."]);

// ---- shots (K offsets local to the anchor; cam = absolute world coordinates) ----
const fol = (fn) => (t) => pathState(fn, t), world = () => ({ x: 0, z: 0, h: 0 });
const gaze5 = (t) => 50.5 + 5.5 * sm(tLooks - 0.1, tLooks + 0.45, t) - 14 * sm(tGoes5 - 0.15, tGoes5 + 0.3, t);
const bG = (t, o) => bearing(CS0, o ?? oG(t), -sG(t));
const rotG = bG(tJump - 0.35, 2.6) - 0.5 - (thR - 2), thG = bG(tJump - 0.35, 2.6) - 1.6;
const SH = [
  { at: 0, f: fol(fnA), K: [[0, [0.9, 2.6, 6.5, 1.5, 1.0, -10, 50]], [tThen, [0.6, 2.2, 5.0, 1.5, 1.0, -10, 50]]] },
  { at: tThen - 0.1, f: world, noRot: true, K: [[0, [-5.5, 1.8, -J + 10, 2.6, 0.8, -J + 2.6, 50]], [T2 - tThen + 0.1, [-4.8, 2.1, -J + 9, 2.6, 0.8, -J + 2.6, 50]]] },
  { at: T2, f: fol(fnB), K: [[0, [-0.6, 1.9, 4.5, 1.2, 1.0, -8, 50]], [tYou2 - T2, [-0.4, 1.8, 4.0, 1.2, 1.0, -8, 50]]] },
  { at: tYou2 - 0.1, cam: (t) => { const r = rPath(eB(t)), [hx, hy, hz] = head(carSt(eB(t))); return [r[0] - 0.7, 2.25, r[1] + 3.2, hx, hy, hz, 30]; } }, // over his shoulder, at the driver
  { at: tHe2 - 0.1, cam: (t) => { const cs = carSt(eB(t)), r = rPath(eB(t)); const [cx, cy, cz] = local(cs.x, cs.z, cs.h, 0.9, 1.95, 2.9); return [cx, cy, cz, r[0], 1.1, r[1], 40]; } }, // over the car, at the rider
  { at: tGoes2 - 0.1, f: world, noRot: true, K: [[0, [-6, 10, -J + 15, 2.5, 0, -J + 1, 50]], [T3 - tGoes2 + 0.1, [-5.5, 10.5, -J + 14.5, 2.5, 0, -J + 1, 50]]] },
  { at: T3, f: world, noRot: true, calm: true, K: [[0, [-5.5, 10.5, -J + 14.5, 2.5, 0, -J + 1, 50]], [T4 - T3, [7.6, 1.6, -J + 1.27, 7.14, 1.25, -J - 1.44, 40]]] }, // rewind: fly to his window
  { at: T4, cam: (t) => { const p = rPath(eD(t)), k = sm(T4 + 0.2, tHead, t); return povCam(CS0, 52 + (bearing(CS0, p[0], p[1]) + 0.5 - 52) * k, 48 - 24 * k, -0.06 + 0.05 * k); } },
  { at: tDoesnt - 0.1, cam: (t) => { const p = rPath(eD(t)), [hx, hy, hz] = head(CS0); return [hx, hy, hz, p[0], 0.9, p[1], 13 - 1.5 * sm(tDoesnt, T5, t)]; } }, // locked on the light
  { at: T5, cam: (t) => povCam(carSt(eD(t)), gaze5(t), 46, -0.07) },
  { at: T6, f: lane(1.8), K: [[0, [0, 2.4, 6, 0, 1.0, -6, 50]], [tMakes - T6, [0, 2.1, 5, 0, 1.0, -6, 50]]] },
  { at: tMakes - 0.1, cam: (t) => povCam(CS0, thG, 20 - sm(tMakes, tCutC, t), -0.012) },
  { at: tCutC, f: lane(1.8), K: [[0, [-1.6, 1.3, -6.5, 0.3, 1.0, 0, 44]], [T7 - tCutC, [-1.9, 1.5, -5.5, 0.3, 1.0, 0, 44]]] },
  { at: T7, f: lane(1.8), K: [[0, [-0.8, 2.2, 6.5, 1.5, 0.9, -6, 50]], [T8 - T7, [-0.8, 3.4, 8.5, 1.5, 0.9, -7, 50]]] },
  { at: T8 - 0.05, f: lane(1.5), K: [[0, [0.0, 6.5, 6.5, 0, 0, 2.5, 50]], [TE - T8, [0.0, 7.5, 7.5, 0, 0, 3.0, 50]]] }, // CTA: rider rides on above the text
];

run("w", (t) => {
  const E = segE(t), showR = t < T6, e = showR ? E(t) : -9;
  const pov = (t >= T4 && t < T6) || (t >= tMakes - 0.1 && t < tCutC);
  const cs = carSt(e);
  car.set(cs); car.g.visible = !pov; // from his seat the car is the cabin around the camera
  cabin.visible = pov; cabin.position.set(cs.x, 0, cs.z); cabin.rotation.y = cs.h; pillar.rotation.y = t >= T6 ? rotG * rad : 0;
  const stR = showR ? ride(Br, fnOf(E), t, RED, { trail: t < T3 }) : ride(Br, null, t, RED);
  const stG = t >= T6 ? ride(Bg, gPath, t, GREEN, { trail: t < T8 - 0.05 }) : ride(Bg, null, t, GREEN); // no trail under the CTA text
  Bg.lean.rotation.z = Math.max(-0.3, Math.min(0.3, Bg.lean.rotation.z));
  hand.visible = t >= tCover - 0.1;
  hit.set(t < T2 ? sm(0.9, 1.1, eA(t)) : 0);
  // sight lines between the two heads
  const [hx, hy, hz] = head(cs), A = v3(hx, hy, hz), B = stR ? v3(stR.x, 1.6, stR.z) : A;
  bW.set(A, B, stR ? 0.8 * (on(t, 0.3, tThen - 0.1) + on(t, tHe2, tGoes2 - 0.1)) : 0);
  bV.set(B, A, stR ? 0.8 * on(t, tYou2, tHe2 - 0.1) : 0);
  // camera first: world tags billboard to it and size themselves to the lens
  const shot = shoot(SH, t), thf = Math.tan(THREE.MathUtils.degToRad(camera.fov / 2)) * 0.5625;
  const lab = (m, st, a) => { if (!st) return tagAt(m, 0, 0, 0, 0); const R = Math.hypot(st.x - hx, st.z - hz); tagAt(m, st.x, 1.0 + R * thf * 0.55, st.z, a, R * thf * 0.34); };
  lab(tBike, stR, t >= T4 && t < tDoesnt - 0.1 ? on(t, tBike4, tDoesnt - 0.1) : 0);
  lab(tSeen, stG, pov && t >= T6 ? on(t, tJump + 0.1, tCutC) : 0);
  hud(ring, 0, 0, 0.5, t >= tDoesnt - 0.1 && t < T5 ? 0.9 * on(t, tDoesnt, T5) : 0);
  bloom.strength = 0.8 + 1.2 * shot.punch * shot.punch + overlays(t);
});
