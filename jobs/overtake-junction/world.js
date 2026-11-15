// 135 overtake-junction: wrong = rider overtakes a slow car next to a side road, the car turns left across him (red).
// Right = wait behind until past the side road, check a clear straight (no turns, no driveways), overtake there (green).
import { THREE, S, g, sm, flash, scene, bloom, box, glow, beam, patch, VIOLET, ORANGE, RED, GREEN, makeCar, pathState, shoot, run } from "./kit.js";
import { track, buildRoad, makePerson, pose, title, endCard, cap, overlays, bikes, downLean, dist } from "./extra.js";

scene.fog.density = 0.008;
const T2 = S.s2[0], T3 = S.s3[0], T4 = S.s4[0], T5 = S.s5[0], T6 = S.s6[0], T7 = S.s7[0];
const J = 200, { P } = track([{ len: 700 }]);
buildRoad(P, -60, 600, { gaps: [[J - 4.6, J + 4.6, -1]] });
const P2 = (s, o = 0) => [s, -J + o];
buildRoad(P2, -160, -4.2, { lamps: false }); // side road, left only
const wp = (o, v = new THREE.Vector3()) => o.getWorldPosition(v);

// ---- timing ----
const tSide = g("s1", "side"), tOv = g("s1", "overtake") - 0.15, tTurn = g("s2", "turns"), tAcr = g("s2", "across");
const tJt = g("s3", "turn"), tWait = g("s4", "wait"), tPast = g("s4", "past"), tClr = g("s5", "clear"), tNo = g("s5", "no");
const tOv2 = g("s6", "overtake") - 0.25;

// ---- part A: car slows and turns left (R = 5 arc from its lane into the side road's far lane) ----
const R = 5, z0 = -J + 3.2, L = (Math.PI / 2) * R;
const arc = (d) => (d <= 0 ? [1.8, z0 - d] : d < L ? [1.8 - R + R * Math.cos(d / R), z0 - R * Math.sin(d / R)] : [1.8 - R - (d - L), z0 - R]);
const DC = dist((t) => 7.5 - 3.3 * sm(tTurn - 0.9, tTurn, t), 0, 30), dC0 = DC(tTurn);
const fCarA = (t) => arc(DC(t) - dC0);
let tX = tTurn + 1;
for (let t = tTurn; t < tTurn + 4; t += 0.005) if (fCarA(t)[0] <= -1.8) { tX = t; break; }
const tHit = tX - 0.12, zHit = fCarA(tX)[1] + 2.1;
const DB = dist((t) => 7.5 + 3 * sm(tOv, tOv + 1.2, t), 0, 30);
const zB = (t) => zHit + DB(tHit) - DB(Math.min(t, tHit)) - (t > tHit ? 1.6 * sm(tHit, tHit + 0.5, t) : 0);
const xB = (t) => 1.8 - 3.6 * sm(tOv, tOv + 1.0, t) + (t > tHit ? 0.5 * sm(tHit, tHit + 0.5, t) : 0);
const fA = (t) => [xB(t), zB(t)];
// ---- part B: car goes straight through; rider waits behind until past the side road, then overtakes on the straight ----
const vC = 8, zC = (t) => -J + 9 - vC * (t - T4);
const fCarB = (t) => [1.8, zC(t)];
const fB = (t) => [1.8 - 3.6 * (sm(tOv2, tOv2 + 0.8, t) - sm(T7 + 0.9, T7 + 1.7, t)), zC(t) + 7 - 6 * sm(tOv2, tOv2 + 1.0, t) - 13 * sm(tOv2 + 0.3, T7 + 1.6, t)];

const fM = (t) => { const a = fB(t); return [(a[0] + 1.8) / 2, (a[1] + zC(t)) / 2]; };
const car = makeCar({}), [Bk] = bikes(1), THROWN = makePerson();
const mouth = patch(8, 8.6, RED, 1.2); mouth.position.set(-7.6, 0.03, -J);
const clear = patch(3.4, 40, GREEN, 0.7);
const mEdge = glow(GREEN, 1.4), edge = box(0.12, 0.03, 40, -3.75, 0.03, 0, mEdge, false); scene.add(edge);
// red trace of the car's turn (grows in s3)
const pts = []; for (let d = -10; d <= L + 6; d += 0.5) { const [x, z] = arc(d); pts.push(new THREE.Vector3(x, 0.08, z)); }
const tGeo = new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 80, 0.09, 6), tMat = glow(RED, 2);
const trace = new THREE.Mesh(tGeo, tMat); scene.add(trace);
const ringM = new THREE.MeshBasicMaterial({ color: 0, toneMapped: false, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false });
const ring = new THREE.Mesh(new THREE.RingGeometry(0.9, 1.1, 48), ringM); ring.rotation.x = -Math.PI / 2; scene.add(ring);
const scan = beam(GREEN, 1.6, 0.02);

title("NEVER OVERTAKE NEAR A SIDE ROAD");
cap("s2", "turns", ["THE CAR", "TURNS LEFT"], RED, { y: 0.3, until: ["s2", "right"] });
cap("s2", "right", ["RIGHT ACROSS YOU"], RED, { y: 0.3, boom: 0.6 });
cap("s3", "turn", ["CARS TURN", "WITHOUT WARNING"], RED, { y: 0.3 });
cap("s4", "wait", ["WAIT UNTIL YOU'RE", "PAST THE SIDE ROAD"], GREEN, { y: 0.3 });
cap("s5", "clear", ["CLEAR ROAD"], GREEN, { y: 0.3, until: ["s5", "no"] });
cap("s5", "no", ["NO TURNS", "NO DRIVEWAYS"], GREEN, { y: 0.3 });
cap("s6", "overtake", ["THEN OVERTAKE", "ON THE STRAIGHT"], GREEN, { y: 0.3 });
endCard(["SIDE ROAD? WAIT.", "OVERTAKE ON THE STRAIGHT."]);

const bA = (t) => pathState(fA, t), bB = (t) => pathState(fB, t);
const SH = [
  { at: 0, f: bA, noRot: true, K: [[0, [1.0, 3.0, 7.5, -0.6, 1.0, -14, 48]], [2.2, [0.6, 3.2, 7.0, -1.0, 1.0, -14, 48]]] },
  { at: tOv - 0.1, f: bA, noRot: true, K: [[0, [4.5, 4.5, 8.5, -1.2, 0.6, -9, 48]], [1.6, [4.0, 5.0, 8.0, -1.8, 0.6, -10, 48]]] },
  { at: tTurn - 0.2, K: [[0, [7, 13, -(J - 26), -2, 0, -(J - 2), 46]], [1.4, [6.5, 12, -(J - 22), -2, 0, -(J - 1), 46]]] },
  { at: tHit - 0.35, K: [[0, [4.2, 3.4, -(J - 5.5), -2.4, 0.6, -(J + 1.2), 44]], [2.5, [4.6, 3.8, -(J - 6.5), -2.4, 0.6, -(J + 1.2), 46]]] },
  { at: T3, K: [[0, [-1.5, 24, -(J - 7), -1.5, 0, -(J - 0.5), 50]], [T4 - T3, [-1.5, 28, -(J - 8), -1.5, 0, -(J - 0.5), 50]]] },
  { at: T4, f: bB, noRot: true, K: [[0, [4.5, 6, 9, -2, 0.3, -9, 48]], [T5 - T4, [3.5, 5.5, 7, -1, 0.5, -10, 48]]] },
  { at: T5, f: bB, noRot: true, K: [[0, [2.4, 4.2, 5.5, -1.8, 0.3, -28, 50]], [T6 - T5, [1.6, 4.6, 4.5, -1.8, 0.3, -32, 50]]] },
  { at: tOv2 - 0.1, f: (t) => pathState(fM, t), noRot: true, K: [[0, [-9, 9, 9, 0, 0.4, -2, 50]], [1.6, [-9, 9.5, 7, 0, 0.4, -2, 50]]] },
  { at: T7 + 0.4, f: bB, noRot: true, K: [[0, [-2, 28, 24, 0, 0, 6, 50]], [2.5, [-2, 31, 26, 0, 0, 6, 50]]] },
];

const tt0 = (t) => (t < T3 ? t : Math.min(tHit + 0.9, tTurn - 0.5 + (t - T3) * 1.3));
const A_ = new THREE.Vector3(), B_ = new THREE.Vector3();
run("w", (t) => {
  const A = t < T4;
  if (A) {
    const tt = t < T3 ? t : Math.min(tHit + 0.9, tTurn - 0.5 + (t - T3) * 1.3);
    const sc = pathState(fCarA, tt); car.set(sc, sm(tTurn - 0.1, tTurn + 0.2, t) * 0.4);
    const st = bA(tt); st.h = 0;
    const fall = sm(tHit, tHit + 0.4, tt);
    st.lean = Math.min(st.lean || 0, 0) * (1 - fall) + downLean(fall, -1);
    Bk.set(st, fA, tt, { hex: t > tTurn ? RED : VIOLET, trailOn: true });
    Bk.rider.visible = tt < tHit + 0.2;
    const u = sm(tHit + 0.2, tHit + 0.55, tt);
    pose(THROWN, { x: st.x + 0.9 + 0.6 * u, z: st.z - 1.2 - 0.6 * u, h: -0.8, lie: u, armR: 1.4 * u, armL: 0.9 * u, vis: tt > tHit + 0.2 });
    mouth.set(sm(tSide - 0.1, tSide + 0.3, t) * (0.7 + 0.3 * (t > T3 ? 1 : 0)));
    tGeo.setDrawRange(0, Math.floor(80 * sm(T3, T3 + 1.4, t)) * 36); trace.visible = t > T3;
    const hk = sm(tHit - 0.05, tHit + 0.55, tt);
    if (hk > 0 && hk < 1) { ring.visible = true; ring.position.set(-1.8, 0.05, zHit - 1.6); ring.scale.setScalar(0.5 + 1.6 * hk); ringM.color.set(ORANGE).multiplyScalar(2.2 * (1 - hk)); }
    else ring.visible = false;
    clear.set(0); edge.visible = false; scan.set(A_, A_, 0);
  } else {
    pose(THROWN, { vis: false }); Bk.rider.visible = true; ring.visible = false; trace.visible = false;
    car.set(pathState(fCarB, t));
    const st = bB(t);
    Bk.set(st, fB, t, { hex: GREEN, trailOn: true });
    mouth.set(t < T5 ? 0.5 * (1 - sm(tPast, tPast + 0.6, t)) : 0);
    // s5: clear straight ahead, unbroken edge (no turns, no driveways)
    const ck = sm(tClr - 0.2, tClr + 0.3, t) * (1 - sm(T7 + 0.4, T7 + 1.0, t));
    clear.position.set(-1.8, 0.03, st.z - 24); clear.set(ck);
    edge.visible = t > tNo - 0.2 && t < T7 + 1.0; edge.position.z = st.z - 24; mEdge.color.set(GREEN).multiplyScalar(1.6 * sm(tNo - 0.2, tNo + 0.2, t));
    Bk.g.updateMatrixWorld(true);
    const sw = sm(T5 - 0.1, T6 - 0.1, t);
    B_.set(-1.8 - 1.5 * Math.sin(sw * 6), 0.2, st.z - 10 - 30 * sw);
    scan.set(wp(Bk.visor, A_), B_, t > T5 - 0.1 && t < T6 ? 0.8 : 0);
  }
  const shot = shoot(SH, t);
  bloom.strength = 0.85 + 1.1 * shot.punch * shot.punch + overlays(t) + (A ? 0.8 * flash(tt0(t), tHit) : 0);
});
