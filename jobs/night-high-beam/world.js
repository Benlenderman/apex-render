// 83 night-high-beam: at night the rider behind keeps high beam on; it fills the front rider's mirrors, he can't see the car behind and pulls out in front of it (red).
// Right way: behind a rider dip your lights; the leader uses high beam on empty roads and dips it for oncoming cars; bigger gaps at night (green).
import { THREE, S, g, sm, pulse, flash, scene, bloom, VIOLET, RED, GREEN, WHITE, pathState, shoot, sceneOf, run, patch, makeCar } from "./kit.js";
import { track, buildRoad, title, endCard, cap, overlays, bikes, ride, dist } from "./extra.js";

scene.fog.density = 0.008;
const V = 12, { P } = track([{ len: 4000 }]);
buildRoad(P, -200, 3600, { lamps: false });
const B = bikes(2), CAR = makeCar({ color: 0x5246c8 }), ONC = makeCar({ color: 0x6a3fc0 });
const T2 = S.s2[0], T3 = S.s3[0], T4 = S.s4[0], T5 = S.s5[0], T6 = S.s6[0], T7 = S.s7[0];
const tHigh = g("s1", "high"), tMirror = g("s2", "mirrors"), tCars = g("s2", "cars");
const tDip = g("s3", "dip"), tEmpty = g("s4", "empty"), tOnc = g("s4", "oncoming");
const tGaps = g("s5", "gaps"), tLight = g("s6", "light");

// ---- headlight: a light cone + lit pool on the road, children of the bike ----
const mkBeam = (b) => {
  const G = new THREE.Group(); G.position.set(0, 0.95, -0.72); b.g.add(G);
  const cg = new THREE.ConeGeometry(1, 1, 28, 1, true); cg.translate(0, -0.5, 0); cg.rotateX(Math.PI / 2); // apex at origin, opens toward -z
  const cm = new THREE.MeshBasicMaterial({ color: new THREE.Color(0xfff2d0), transparent: true, opacity: 0.12, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.FrontSide, toneMapped: false });
  const cone = new THREE.Mesh(cg, cm); G.add(cone);
  const pm = new THREE.MeshBasicMaterial({ color: new THREE.Color(0xfff2d0), transparent: true, opacity: 0.2, blending: THREE.AdditiveBlending, depthWrite: false, toneMapped: false });
  const pool = new THREE.Mesh(new THREE.CircleGeometry(1, 32), pm); pool.rotation.x = -Math.PI / 2; b.g.add(pool);
  // high 0..1: low beam = short cone tipped to the road; high beam = long, level, wide
  return (high, a = 1, hex = 0xfff2d0) => {
    const L = 8 + 26 * high, R = 0.7 + 1.3 * high;
    cone.scale.set(R, R * 0.7, L); G.rotation.x = -0.11 * (1 - high) - 0.015;
    cm.color.set(hex); cm.opacity = (0.035 + 0.035 * high) * a; cone.visible = a > 0.01;
    pool.position.set(0, 0.02, -(4 + 14 * high)); pool.scale.set(1.6 + 2 * high, 4 + 14 * high, 1); pm.color.set(hex); pm.opacity = 0.13 * a; pool.visible = a > 0.01;
  };
};
const beamF = mkBeam(B[0]), beamR = mkBeam(B[1]);
// mirror glare on the front bike
const glareM = new THREE.MeshBasicMaterial({ color: new THREE.Color(0xffffff).multiplyScalar(3), transparent: true, opacity: 0, toneMapped: false, depthWrite: false, blending: THREE.AdditiveBlending });
const glares = [B[0].mirL, B[0].mirR].map((m, i) => { const s = new THREE.Mesh(new THREE.SphereGeometry(0.16, 16, 12), glareM); s.position.set(i ? 0.35 : -0.35, 0.39, 0.03); m.add(s); return s; });
const setGlare = (k) => glares.forEach((s) => { s.visible = k > 0.01; s.scale.setScalar(0.5 + 0.7 * k); glareM.opacity = k; });

// ---- A: front rider at offset 1.6; rear 9 m behind on high beam. A car comes up behind in the other lane; the blinded front rider pulls out to pass a slow truck-less gap and the car has to swerve ----
const front = (t) => 80 + V * t, gapA = 9;
const tOut = tCars - 0.2;
const kOut = (t) => sm(tOut, tOut + 0.9, t) * (1 - sm(tOut + 1.3, tOut + 2.0, t));
const fPath = (t) => (t < T3 ? P(front(t), 1.6 - 2.8 * kOut(t)) : bfPath(t));
const rPath = (t) => (t < T3 ? P(front(t) - gapA, 1.6) : brPath(t));
const DC = dist((t) => V + 9 - 8 * sm(tOut + 0.3, tOut + 1.0, t), 0, T3 + 1);
const carA = (t) => { const s = front(tOut + 0.7) - 6 + DC(t) - DC(tOut + 0.7); return P(s, -1.8 - 1.8 * kOut(t) * sm(tOut + 0.2, tOut + 0.8, t)); };
// ---- B: fresh road. Rear rider dips (s3). s4: the pair alone, the leader on high beam, an oncoming car at "oncoming" -> dips. s5: gap 9 -> 20 ----
const sB = 1600, G = (t) => gapA + 11 * sm(tGaps - 0.3, tGaps + 1.4, t);
const bfPath = (t) => P(sB + V * t, 1.6), brPath = (t) => P(sB + V * t - G(t), 1.6);
const sMeet = sB + V * (tOnc + 1.4);
const oncPath = (t) => (t > T4 && t < T5 + 0.5 ? P(sMeet - V * (t - tOnc - 1.4), -1.8) : null);

const gapZ = patch(2.6, 1, GREEN, 0.9), redZ = patch(2.6, 1, RED, 1.2);
const strip = (m, a, b, o, k) => { const [x, z] = P((a + b) / 2, o); m.position.set(x, 0.03, z); m.scale.set(1, Math.max(0.1, Math.abs(b - a)), 1); m.set(k); };

title("NEVER RIDE ON HIGH BEAM BEHIND A FRIEND");
cap("s2", "mirrors", ["YOUR LIGHT FILLS", "THEIR MIRRORS"], RED, { until: ["s2", "cars"] });
cap("s2", "cars", ["THEY CAN'T SEE", "THE CARS BEHIND"], RED, { boom: 0.5 });
cap("s3", "dip", ["BEHIND A RIDER,", "DIP YOUR LIGHTS"], GREEN);
cap("s4", "leader", ["THE LEADER: HIGH BEAM", "ON EMPTY ROADS"], GREEN, { until: ["s4", "dips"] });
cap("s4", "dips", ["DIP IT FOR", "ONCOMING TRAFFIC"], GREEN);
cap("s5", "leave", ["AT NIGHT,", "LEAVE BIGGER GAPS"], GREEN);
cap("s6", "light", ["LIGHT THE ROAD,", "NOT YOUR FRIEND'S MIRRORS"], GREEN);
endCard(["DIP YOUR LIGHTS.", "OPEN YOUR GAPS."]);

const fol = (fn) => (t) => pathState(fn, t);
const SH = [
  { at: 0, f: fol(rPath), noRot: true, K: [[0, [-7, 5, 12, 1.6, 0.6, -10, 50]], [3, [-8, 6, 11, 1.6, 0.6, -12, 50]]] },
  // POV over the front rider's shoulder into his blinding mirrors
  { at: T2, f: fol(fPath), noRot: true, K: [[0, [-3.6, 2.6, -5.8, 1.4, 1.1, 1.5, 46]], [2, [-3.8, 2.7, -5.4, 1.4, 1.1, 2, 46]]] },
  { at: tCars - 0.3, f: fol(fPath), noRot: true, K: [[0, [-9, 9, 14, 0.5, 0, -4, 50]], [3, [-10, 10, 12, 0.5, 0, -6, 50]]] },
  { at: T3, f: fol(brPath), noRot: true, K: [[0, [-5, 4, 9, 1.6, 0.6, -10, 50]], [3, [-6, 4.5, 8, 1.6, 0.6, -12, 50]]] },
  { at: T4, f: fol(bfPath), noRot: true, K: [[0, [-3, 5.5, 11, 1.6, 0, -16, 50]], [4, [-3.5, 6, 10, 1.6, 0, -18, 50]]] },
  { at: T5, f: fol(brPath), noRot: true, K: [[0, [-10, 14, 16, 1.6, 0, -12, 50]], [4, [-11, 16, 14, 1.6, 0, -14, 50]]] },
  { at: T6, f: fol(brPath), noRot: true, K: [[0, [-4, 3.5, 7, 1.6, 0.6, -10, 50]], [3, [-4.5, 4, 6, 1.6, 0.6, -12, 50]]] },
];

run("w", (t) => {
  const { id } = sceneOf(t), A = t < T3;
  const bad = A && t > tHigh - 0.2;
  const sf = ride(B[0], fPath, t, A ? (t > tCars ? RED : VIOLET) : GREEN), sr = ride(B[1], rPath, t, bad ? RED : A ? VIOLET : GREEN);
  // rear light: A high beam (red-hot white), B low beam (green tint after dip)
  const dip = A ? 0 : sm(tDip - 0.2, tDip + 0.4, t);
  beamR(A ? sm(tHigh - 0.3, tHigh, t) : 1 - dip, 1, A ? 0xfff2d0 : dip > 0.5 ? 0xc8ffd8 : 0xfff2d0);
  // front light: low in A; s4 high on the empty road, dips when the oncoming car shows; low after
  const fh = id === "s4" ? sm(tEmpty - 0.6, tEmpty - 0.2, t) * (1 - sm(tOnc - 0.1, tOnc + 0.3, t)) : 0;
  beamF(fh, 1, id === "s4" ? 0xc8ffd8 : 0xfff2d0);
  setGlare(A ? sm(tHigh - 0.1, tHigh + 0.4, t) : 0.0);
  CAR.set(A && t > tOut - 1.5 ? pathState(carA, t) : null, 0);
  ONC.set(pathState(oncPath, t));
  // red: the high-beam zone between the two bikes in A; green gap in s5/s6
  strip(redZ, -sr.z + 1, -sf.z - 1, 1.6, A ? sm(tHigh, tHigh + 0.4, t) * (1 - sm(tCars - 0.4, tCars - 0.1, t)) : 0);
  strip(gapZ, -sr.z + 1, -sf.z - 1, 1.6, id === "s5" || id === "s6" ? sm(tGaps - 0.2, tGaps + 0.4, t) : 0);
  const shot = shoot(SH, t);
  bloom.strength = 1.0 + 1.2 * shot.punch * shot.punch + overlays(t) + 0.6 * flash(t, tOut + 0.8) + 0.3 * flash(t, tDip);
});
