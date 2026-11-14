// 134 car-blindspot: wrong = rider sits beside a car's back door, the driver checks the mirror, the mirror's view misses
// the rider, the car moves into the lane and knocks the bike down (red). Right = the blind zone beside the back door,
// drop back or pass quickly, sit where the driver's face shows in the mirror: eyes meet (green).
import { THREE, S, g, sm, flash, scene, bloom, box, tube, glow, beam, VIOLET, ORANGE, RED, GREEN, makeCar, pathState, shoot, run } from "./kit.js";
import { track, buildRoad, makePerson, pose, title, endCard, cap, overlays, bikes, downLean } from "./extra.js";

scene.fog.density = 0.008;
const T2 = S.s2[0], T3 = S.s3[0], T4 = S.s4[0], T5 = S.s5[0], T6 = S.s6[0], T7 = S.s7[0];
const { P } = track([{ len: 600 }]);
buildRoad(P, -60, 400);
const wp = (o, v = new THREE.Vector3()) => o.getWorldPosition(v);
const V = 6, BL = -1.8, CL = 1.8;

// ---- car with a driver, a left mirror (driver's face shows in its glass) and a back door panel ----
const car = makeCar({ driver: true });
const mMir = glow(VIOLET, 1.0), mirror = new THREE.Group(); mirror.position.set(-1.05, 1.05, -0.65); car.g.add(mirror);
mirror.add(box(0.26, 0.17, 0.07, 0, 0, 0, glow(VIOLET, 0.7), false));
const glass = box(0.22, 0.13, 0.01, 0, 0, 0.04, mMir, false); mirror.add(glass);
const mFace = glow(0xffc9a8, 0), face = new THREE.Mesh(new THREE.CircleGeometry(0.045, 20), mFace); face.position.set(0, 0, 0.05); mirror.add(face);
const mEye = glow(0xffffff, 0), eyes = [-1, 1].map((s) => { const e = new THREE.Mesh(new THREE.CircleGeometry(0.009, 10), mEye); e.position.set(s * 0.016, 0.01, 0.052); mirror.add(e); return e; });
car.g.add(tube([-0.8, 0.98, -0.6], [-0.95, 1.03, -0.64], 0.02, glow(VIOLET, 1.2)));
const mDoor = glow(RED, 0), door = box(0.03, 0.42, 1.0, -0.95, 0.72, 0.85, mDoor, false); car.g.add(door);
// ground zones in car space: mirror view (wedge back-left) and the blind zone beside the back door
const zone = (pts, hex) => {
  const sh = new THREE.Shape(pts.map(([x, z]) => new THREE.Vector2(x, -z)));
  const m = new THREE.MeshBasicMaterial({ color: hex, toneMapped: false, transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide });
  const z = new THREE.Mesh(new THREE.ShapeGeometry(sh), m); z.rotation.x = -Math.PI / 2; z.position.y = 0.04; car.g.add(z); return m;
};
const viewM = zone([[-1.0, -0.6], [-1.0, 12], [-5.5, 10]], VIOLET);
const blindM = zone([[-1.0, -0.8], [-5.0, -0.8], [-5.0, 8.6]], RED);
const gaze = beam(VIOLET, 2, 0.015), look = beam(GREEN, 1.8, 0.02);
const ringM = new THREE.MeshBasicMaterial({ color: 0, toneMapped: false, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false });
const ring = new THREE.Mesh(new THREE.RingGeometry(0.9, 1.1, 48), ringM); ring.rotation.x = -Math.PI / 2; scene.add(ring);
const THROWN = makePerson();

// ---- timing ----
const tBack = g("s1", "back"), tChk = g("s2", "checks"), tNo = g("s2", "doesn"), tMv = g("s2", "moves");
const tSpot = g("s3", "spot"), tDropW = g("s4", "drop"), tPass = g("s4", "pass"), tFace = g("s5", "face"), tEyes = g("s6", "eyes");
const carX = (t) => (t < T3 ? CL - 2.6 * sm(tMv, tMv + 1.3, t) : CL);
let tHit = tMv + 1.3;
for (let t = tMv; t < tMv + 1.3; t += 0.005) if (carX(t) - 0.93 <= BL + 0.45) { tHit = t; break; }
const fCar = (t) => [carX(t), -V * t];
// A: beside the back door until the hit, then pushed left and skids to a stop
const fA = (t) => {
  const tau = Math.min(Math.max(t - tHit, 0), 1);
  return [BL - 0.7 * sm(tHit, tHit + 0.6, t), 1.0 - V * Math.min(t, tHit) - V * (tau - tau * tau / 2), 0];
};
// B: beside the door, drops back at "drop", passes in s7
const obB = (t) => 1.0 + 6.5 * sm(tDropW - 0.1, tDropW + 0.6, t) - 15 * sm(T7 + 0.2, T7 + 2.2, t);
const fB = (t) => [BL, -V * t + obB(t), 0];
const fP = (t) => [BL, -V * t + 1.0 - 8 * sm(tPass - 0.1, tPass + 0.9, t), 0];

const [Bk, Bk2] = bikes(2);

title("NEVER SIT NEXT TO A CAR'S BACK DOOR");
cap("s1", "back", ["BESIDE THE", "BACK DOOR"], RED, { y: 0.3 });
cap("s2", "checks", ["DRIVER CHECKS", "THE MIRROR"], VIOLET, { y: 0.3, until: ["s2", "doesn"] });
cap("s2", "doesn", ["DOESN'T", "SEE YOU"], RED, { y: 0.3, until: ["s2", "moves"] });
cap("s2", "moves", ["MOVES INTO", "YOUR LANE"], RED, { y: 0.3, boom: 0.6 });
cap("s3", "spot", ["THE DRIVER'S", "BLIND SPOT"], RED, { y: 0.3 });
cap("s4", "drop", ["DROP BACK"], GREEN, { y: 0.3, until: ["s4", "pass"] });
cap("s4", "pass", ["OR PASS", "QUICKLY"], GREEN, { y: 0.3 });
cap("s5", "see", ["SEE THE DRIVER'S", "FACE IN THE MIRROR"], GREEN, { y: 0.3 });
cap("s6", "eyes", ["SEE THEIR EYES?", "THEY SEE YOU"], GREEN, { y: 0.3 });
endCard(["BACK DOOR?", "PASS OR DROP BACK."]);

const cs = (t) => pathState(fCar, t);
const SH = [
  { at: 0, f: (t) => pathState(fA, t), noRot: true, K: [[0, [-1.4, 3.0, 6.5, 1.8, 0.8, -1.2, 50]], [2.5, [-1.0, 2.7, 5.4, 1.8, 0.8, -1.2, 50]]] },
  { at: tBack - 0.15, f: cs, noRot: true, K: [[0, [-6.4, 2.4, 3.8, -1.4, 0.8, 0.5, 44]], [1.5, [-6.0, 2.2, 3.0, -1.4, 0.8, 0.5, 44]]] },
  { at: T2, f: cs, noRot: true, K: [[0, [-1.7, 2.6, 2.8, -0.9, 1.1, -0.6, 42]], [1.2, [-1.6, 2.5, 2.4, -0.9, 1.1, -0.6, 42]]] },
  { at: tNo - 0.1, f: cs, noRot: true, K: [[0, [-2.2, 7.0, 9.5, -2.4, 0, 1.0, 46]], [0.9, [-2.2, 7.2, 9.8, -2.4, 0, 1.0, 46]]] },
  { at: tMv - 0.1, f: (t) => pathState(fA, t), noRot: true, K: [[0, [-3.6, 3.4, 6.0, 1.2, 0.6, -1.5, 50]], [2, [-3.4, 3.2, 5.0, 0.6, 0.4, -1.0, 50]]] },
  { at: T3, f: cs, noRot: true, K: [[0, [-1.8, 15, 5.0, -1.8, 0, 1.6, 50]], [T4 - T3, [-1.8, 17, 4.6, -1.8, 0, 1.2, 50]], [T5 - T3, [-1.8, 19, 4.2, -1.8, 0, 0.8, 50]]] },
  { at: T5, f: (t) => pathState(fB, t), noRot: true, K: [[0, [-0.6, 3.2, 5.5, 1.4, 0.6, -6, 46]], [1.2, [-0.4, 3.0, 4.8, 1.4, 0.6, -6, 46]]] },
  { at: tFace - 0.25, f: cs, noRot: true, K: [[0, [-1.62, 1.28, 1.4, -1.05, 1.05, -0.65, 28]], [3, [-1.5, 1.26, 1.0, -1.05, 1.05, -0.65, 24]]] },
  { at: T7, f: cs, noRot: true, K: [[0, [-3.2, 4.6, 11, -1.8, 0.5, -1.5, 50]], [2.5, [-3.0, 4.4, 9.5, -1.8, 0.5, -2.5, 50]]] },
];

const A_ = new THREE.Vector3(), B_ = new THREE.Vector3();
run("w", (t) => {
  const A = t < T3;
  const sc = cs(t);
  car.set(sc, A ? 0.25 * (sm(tMv - 0.1, tMv + 0.4, t) - sm(tMv + 0.7, tMv + 1.3, t)) : 0);
  let st, hex;
  if (A) {
    st = pathState(fA, t); st.h = 0; hex = t > tNo ? RED : VIOLET;
    const fall = sm(tHit, tHit + 0.45, t);
    st.lean = downLean(fall, 1);
    Bk.set(st, fA, t, { hex, trailOn: true });
    Bk.rider.visible = t < tHit + 0.3;
    const u = sm(tHit + 0.3, tHit + 0.6, t);
    pose(THROWN, { x: st.x - 1.0 - 0.4 * u, z: st.z + 0.3, h: 1.2, lie: u, armR: 1.4 * u, armL: 0.9 * u, vis: t > tHit + 0.3 });
    // back door glows red on "back door"
    mDoor.color.set(RED).multiplyScalar(2.2 * sm(tBack - 0.1, tBack + 0.2, t) * (1 - sm(T2 + 0.6, T2 + 1.0, t)));
    // driver glances at the mirror; the mirror's view lights up and misses the rider
    const chk = sm(tChk - 0.1, tChk + 0.15, t) * (1 - sm(tMv + 0.4, tMv + 0.7, t));
    car.g.updateMatrixWorld(true);
    gaze.set(wp(car.driver, A_), wp(mirror, B_), chk);
    viewM.opacity = 0.35 * chk; blindM.opacity = 0;
    mMir.color.set(VIOLET).multiplyScalar(0.5 + 0.9 * chk);
    // the miss: red ring round the rider
    const no = sm(tNo - 0.05, tNo + 0.15, t) * (1 - sm(tMv, tMv + 0.3, t));
    const hk = sm(tHit - 0.05, tHit + 0.5, t);
    if (hk > 0 && hk < 1) { ring.visible = true; ring.position.set(st.x + 0.4, 0.05, st.z); ring.scale.setScalar(0.4 + 1.4 * hk); ringM.color.set(ORANGE).multiplyScalar(2.2 * (1 - hk)); }
    else if (no > 0.01) { ring.visible = true; ring.position.set(st.x, 0.05, st.z); const ph = (t * 2.5) % 1; ring.scale.setScalar(0.7 + 0.4 * ph); ringM.color.set(RED).multiplyScalar(2 * no * (1 - ph)); }
    else ring.visible = false;
    Bk2.set(null); mFace.color.set(0); mEye.color.set(0); look.set(A_, A_, 0);
  } else {
    pose(THROWN, { vis: false }); Bk.rider.visible = true; ring.visible = false; mDoor.color.set(RED).multiplyScalar(t < T4 ? 1.6 * sm(T3, T3 + 0.4, t) : 0);
    st = pathState(fB, t); st.h = 0;
    const inBlind = obB(t) < 5.5 && obB(t) > -1.5;
    hex = inBlind && t < T4 + 0.3 ? RED : GREEN;
    Bk.set(st, fB, t, { hex, trailOn: true });
    // second rider shows the other choice: pass quickly
    const p2 = t > tPass - 0.1 && t < T5 + 0.2;
    if (p2) Bk2.set(pathState(fP, t), fP, t, { hex: GREEN, trailOn: true }); else Bk2.set(null);
    viewM.color.set(t > T5 ? GREEN : VIOLET);
    viewM.opacity = t < T5 ? 0.3 : 0.4;
    blindM.opacity = (t < T5 ? 0.45 * sm(tSpot - 0.2, tSpot + 0.2, t) : 0.2) * (t < T7 ? 1 : 1 - sm(T7, T7 + 0.4, t) * 0.6);
    // s5-s6: the driver's face shows in the mirror, eyes meet
    const see = sm(tFace - 0.3, tFace + 0.1, t), eye = sm(tEyes - 0.1, tEyes + 0.15, t);
    mMir.color.set(see > 0.01 ? GREEN : VIOLET).multiplyScalar(0.5 - 0.35 * see);
    mFace.color.set(0xffc9a8).multiplyScalar(0.8 * see); mEye.color.set(0xffffff).multiplyScalar(see * (1 + 1.5 * eye));
    car.g.updateMatrixWorld(true); Bk.g.updateMatrixWorld(true);
    look.set(wp(Bk.visor, A_), wp(mirror, B_), see * (t < T7 + 0.3 ? (t > tFace - 0.25 ? 0.4 : 1) : 0));
    gaze.set(wp(car.driver, A_), wp(mirror, B_), eye * (t < T7 + 0.3 ? 1 : 0));
  }
  const shot = shoot(SH, t);
  bloom.strength = 0.9 + 1.1 * shot.punch * shot.punch + overlays(t) + (A ? 0.8 * flash(t, tHit) : 0);
  if (t > tFace - 0.25 && t < T7) bloom.strength = 0.35;
});
