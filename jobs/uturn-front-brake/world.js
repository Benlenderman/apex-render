// 133 uturn-front-brake: wrong = slow U-turn at full lock, the rider grabs the front brake, the front wheel tucks
// under and the bike drops to the inside (red). Right = fingers off the front lever, speed on the clutch and a little
// rear brake, revs a bit above idle, head turned to the exit gate: the bike stays up through a tight arc (green).
import { THREE, S, g, sm, flash, scene, camera, bloom, box, tube, glow, beam, VIOLET, ORANGE, RED, GREEN, mHot, pathState, local, shoot, run } from "./kit.js";
import { track, buildRoad, makePerson, pose, title, endCard, cap, overlays, bikes, downLean, dist } from "./extra.js";

scene.fog.density = 0.012;
const T2 = S.s2[0], T3 = S.s3[0], T4 = S.s4[0], T5 = S.s5[0], T6 = S.s6[0], T7 = S.s7[0];
const { P } = track([{ len: 600 }]);
buildRoad(P, -60, 400, { LW: 2.0 });
const wp = (o, v = new THREE.Vector3()) => o.getWorldPosition(v);

// ---- U-turn geometry: enter at (O, ZC) heading -z, arc left round (CX, ZC), leave at (O - 2R, ZC) heading +z ----
const O = 1.2, R = 1.75, ZC = 0, CX = O - R, ARC = Math.PI * R;
const at3 = (d) => {
  if (d < 0) return [O, ZC - d, 0];
  if (d < ARC) { const p = d / R; return [CX + R * Math.cos(p), ZC - R * Math.sin(p), p]; }
  return [O - 2 * R, ZC + (d - ARC), Math.PI];
};
const EXIT = new THREE.Vector3(O - 2 * R, 0.5, ZC + 2.4);

// ---- A: slow turn, full lock, grab the front brake, wheel tucks, bike drops ----
const tEnter = 0.6, tBars = g("s2", "bars"), tWay = g("s2", "way"), tFront = g("s2", "front"), tTuck = g("s2", "tucks"), tDrop = g("s2", "drops");
const vA = (t) => 0.9 * (1 - sm(tFront, tFront + 0.3, t));
const DA = dist(vA, 0, 10), dA = (t) => DA(t) - DA(tEnter);
const fA = (t) => at3(dA(t));
// ---- B: fingers off, clutch + rear brake, revs, head to the exit, tight arc ----
const tKeep = g("s3", "keep"), tOffF = g("s3", "off"), tClutch = g("s4", "clutch"), tRear = g("s4", "rear"), tEng = g("s5", "engine"), tTurn = g("s5", "turn"), tStays = g("s6", "stays");
const dB = (t) => -1.4 + 0.85 * (t - T3);
const fB = (t) => at3(dB(t));

const [Bk] = bikes(1);
// controls: front brake lever (right), clutch lever (left), rear brake pedal (right), front + rear discs
const lev = (s) => { const p = new THREE.Group(); p.position.set(s * 0.22, 0.12, -0.02); const m = glow(VIOLET, 1.2); p.add(box(0.2, 0.03, 0.04, s * 0.1, 0, -0.05, m, false)); Bk.fork.add(p); p.userData.m = m; return p; };
const brakeL = lev(1), clutchL = lev(-1);
const mFing = glow(VIOLET, 1.6), fingers = box(0.15, 0.035, 0.05, 0.33, 0.16, -0.07, mFing, false); Bk.fork.add(fingers);
const mPed = glow(VIOLET, 1.2), pedal = box(0.06, 0.03, 0.2, 0.3, 0.3, -0.12, mPed, false); Bk.lean.add(pedal);
const disc = (w, x) => { const m = new THREE.Mesh(new THREE.TorusGeometry(0.15, 0.02, 6, 28), glow(VIOLET, 1.5)); m.rotation.y = Math.PI / 2; m.position.x = x; w.add(m); return m; };
const discF = disc(Bk.frontW, 0.11), discR = disc(Bk.rearW, 0.13);
// cue ring that pulses round the control in use (always drawn on top)
const cueM = new THREE.MeshBasicMaterial({ color: 0, toneMapped: false, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, depthTest: false });
const cue = new THREE.Mesh(new THREE.RingGeometry(0.1, 0.13, 36), cueM); cue.renderOrder = 15; scene.add(cue);
// the tight line + exit gate
const ghostM = glow(GREEN, 0.6);
const ghost = new THREE.Group();
const arcM = new THREE.Mesh(new THREE.TorusGeometry(R, 0.03, 4, 96, Math.PI), ghostM); arcM.rotation.x = -Math.PI / 2; arcM.position.set(CX, 0.02, ZC);
ghost.add(arcM, tube([O, 0.02, ZC], [O, 0.02, ZC + 2.5], 0.06, ghostM), tube([O - 2 * R, 0.02, ZC], [O - 2 * R, 0.02, ZC + 2.6], 0.06, ghostM));
scene.add(ghost);
const gate = new THREE.Group();
for (const dx of [-0.6, 0.6]) { const c = new THREE.Mesh(new THREE.ConeGeometry(0.15, 0.45, 16), mHot); c.position.set(EXIT.x + dx, 0.22, EXIT.z); gate.add(c); }
scene.add(gate);
const sight = beam(GREEN, 1.6, 0.02);
const hitM = new THREE.MeshBasicMaterial({ color: 0, toneMapped: false, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false });
const hit = new THREE.Mesh(new THREE.RingGeometry(0.8, 1.0, 48), hitM); hit.rotation.x = -Math.PI / 2; scene.add(hit);
const THROWN = makePerson();

title("NEVER USE THE FRONT BRAKE IN A TIGHT U-TURN");
cap("s1", "turning", ["TIGHT U-TURN,", "NARROW ROAD"], VIOLET, { y: 0.3, until: ["s1", "never"] });
cap("s2", "bars", ["BARS AT", "FULL LOCK"], VIOLET, { y: 0.3, until: ["s2", "front"] });
cap("s2", "front", ["FRONT BRAKE:", "WHEEL TUCKS"], RED, { y: 0.3, until: ["s2", "bike"] });
cap("s2", "bike", ["AND THE", "BIKE DROPS"], RED, { y: 0.3, boom: 0.6 });
cap("s3", "keep", ["FINGERS OFF", "THE FRONT BRAKE"], GREEN, { y: 0.3 });
cap("s4", "clutch", ["SPEED ON", "THE CLUTCH"], GREEN, { y: 0.3, until: ["s4", "little"] });
cap("s4", "little", ["+ A LITTLE", "REAR BRAKE"], GREEN, { y: 0.3 });
cap("s5", "engine", ["REVS A BIT", "ABOVE IDLE"], GREEN, { y: 0.3, until: ["s5", "turn"] });
cap("s5", "turn", ["HEAD TO", "THE EXIT"], GREEN, { y: 0.3 });
cap("s6", "stays", ["STAYS UP,", "TURNS TIGHT"], GREEN, { y: 0.3 });
endCard(["TIGHT TURN?", "REAR BRAKE + CLUTCH."]);

const stF = pathState(fA, tDrop + 0.6);
const [fx, , fz] = local(stF.x, stF.z, stF.h, 0, 0, 0);
const SH = [
  { at: 0, f: (t) => pathState(fA, t), K: [[0, [2.4, 2.3, 3.6, -0.2, 0.6, -1.6, 50]], [3, [2.8, 2.6, 3.0, -0.2, 0.6, -1.6, 50]]] },
  { at: g("s1", "never") - 0.1, f: (t) => pathState(fA, t), K: [[0, [0.95, 1.6, 0.75, 0.3, 1.05, -0.55, 40]], [1.6, [1.05, 1.65, 0.6, 0.3, 1.05, -0.55, 40]]] },
  { at: T2, f: (t) => pathState(fA, t), K: [[0, [1.9, 2.7, 1.6, -0.1, 0.6, -0.8, 46]], [1.6, [1.7, 2.6, 1.2, -0.1, 0.6, -0.8, 46]]] },
  { at: tFront - 0.1, calm: true, f: (t) => pathState(fA, Math.min(t, tFront + 0.3)), K: [[0, [1.7, 1.0, -1.5, 0, 0.4, -0.7, 44]], [1.2, [1.6, 1.1, -1.3, 0, 0.4, -0.7, 44]]] },
  { at: tDrop - 0.4, K: [[0, [fx + 3.6, 2.5, fz + 2.8, fx - 0.3, 0.3, fz - 0.2, 48]], [1.6, [fx + 3.2, 2.3, fz + 2.4, fx - 0.3, 0.3, fz - 0.2, 48]]] },
  { at: T3, f: (t) => pathState(fB, t), K: [[0, [1.5, 1.9, 1.3, 0.25, 1.0, -0.5, 42]], [1.6, [1.6, 1.95, 1.1, 0.25, 1.0, -0.5, 42]]] },
  { at: T4, f: (t) => pathState(fB, t), K: [[0, [-1.3, 2.5, 0.6, -0.3, 1.0, -0.6, 42]], [1.6, [-1.4, 2.55, 0.4, -0.3, 1.0, -0.6, 42]]] },
  { at: tRear - 0.25, f: (t) => pathState(fB, t), K: [[0, [2.0, 1.1, 1.0, 0.2, 0.4, -0.1, 44]], [1.2, [1.9, 1.15, 0.8, 0.2, 0.4, -0.1, 44]]] },
  { at: T5, f: (t) => pathState(fB, t), K: [[0, [2.4, 1.5, 2.6, 0.1, 0.7, 0.2, 46]], [1.9, [2.2, 1.5, 2.3, 0.1, 0.7, 0.2, 46]]] },
  { at: tTurn - 0.1, f: (t) => pathState(fB, t), K: [[0, [1.5, 2.7, 2.6, -0.6, 1.1, -1.2, 50]], [1.8, [1.3, 2.8, 2.4, -0.6, 1.1, -1.2, 50]]] },
  { at: T6, K: [[0, [CX + 0.3, 8.5, ZC + 4.2, CX, 0, ZC + 0.2, 50]], [1.6, [CX + 0.3, 9.0, ZC + 4.5, CX, 0, ZC + 0.2, 50]]] },
  { at: T7, K: [[0, [CX + 2.6, 4.0, ZC + 6.5, O - 2 * R, 0.6, ZC + 1.8, 48]], [5, [CX + 2.2, 4.4, ZC + 7.2, O - 2 * R, 0.6, ZC + 2.4, 48]]] },
];

const vF = new THREE.Vector3();
run("w", (t) => {
  const A = t < T3;
  let st, d, pitch = 0, hex, cueOn = null, cueHex = GREEN;
  // reset controls
  brakeL.rotation.y = 0; clutchL.rotation.y = 0; pedal.rotation.x = 0; pedal.scale.setScalar(1);
  brakeL.userData.m.color.set(VIOLET).multiplyScalar(1.2); clutchL.userData.m.color.set(VIOLET).multiplyScalar(1.2);
  mPed.color.set(VIOLET).multiplyScalar(1.2); discF.material.color.set(VIOLET).multiplyScalar(1.5); discR.material.color.set(VIOLET).multiplyScalar(1.5);
  mHot.color.set(ORANGE).multiplyScalar(2.4); Bk.headG.rotation.set(0, 0, 0);
  let fy = 0.16, fz0 = -0.07;
  if (A) {
    d = dA(t); st = pathState(fA, t); hex = t < T2 ? VIOLET : RED;
    const inArc = sm(tEnter - 0.3, tEnter + 0.5, t);
    const tuck = sm(tTuck - 0.05, tTuck + 0.2, t), fall = sm(tDrop - 0.35, tDrop + 0.3, t);
    const steer = 0.35 * inArc + 0.25 * sm(tBars, tWay, t) + 0.3 * tuck;
    st.steer = -steer;
    st.lean = Math.min(1.45, 0.18 * inArc + 0.22 * sm(tTuck, tDrop - 0.35, t) + downLean(fall, 1));
    pitch = -0.07 * sm(tFront, tFront + 0.15, t) * (1 - fall);
    // the grab: fingers close on the lever, lever squeezes, lever + disc go red
    const grab = sm(tFront - 0.15, tFront + 0.05, t), warn = sm(g("s1", "grab") - 0.1, g("s1", "grab") + 0.1, t) * (1 - sm(T2 - 0.2, T2, t));
    brakeL.rotation.y = -0.35 * grab; fy = 0.16 - 0.04 * grab;
    const red = Math.max(grab, warn);
    brakeL.userData.m.color.set(red > 0.01 ? RED : VIOLET).multiplyScalar(1.2 + 2.4 * red + 2 * flash(t, tFront));
    mFing.color.set(red > 0.01 ? RED : VIOLET).multiplyScalar(1.6 + 1.5 * red);
    discF.material.color.set(grab > 0.01 ? RED : VIOLET).multiplyScalar(1.5 + 2.5 * grab);
    if (warn > 0.3 || (grab > 0.3 && t < tTuck + 0.4)) { cueOn = brakeL; cueHex = RED; }
    Bk.set(st, fA, t, { hex, pitch, trailOn: t > tEnter });
    Bk.rider.visible = t < tDrop + 0.25;
    const u = sm(tDrop + 0.2, tDrop + 0.5, t);
    const [px, , pz] = local(st.x, st.z, st.h, -1.0 - 0.5 * u, 0, 0.2);
    pose(THROWN, { x: px, z: pz, h: st.h + 1.2, lie: u, armR: 1.4 * u, armL: 0.9 * u, vis: t > tDrop + 0.25 });
    const hk = sm(tDrop + 0.2, tDrop + 0.7, t);
    hit.visible = hk > 0 && hk < 1; hit.position.set(st.x, 0.03, st.z); hit.scale.setScalar(0.4 + 1.6 * hk); hitM.color.set(ORANGE).multiplyScalar(2 * (1 - hk));
    ghostM.color.set(GREEN).multiplyScalar(0); gate.visible = false; sight.set(vF, vF, 0);
  } else {
    pose(THROWN, { vis: false }); hit.visible = false; Bk.rider.visible = true; gate.visible = true;
    d = dB(t); st = pathState(fB, t); hex = GREEN;
    const arc = sm(-0.4, 0.5, d) * (1 - sm(ARC - 0.6, ARC + 0.2, d));
    st.steer = -(0.42 + 0.04 * Math.sin(2.3 * t)) * arc; st.lean = (0.2 + 0.03 * Math.sin(2.1 * t)) * arc;
    // s3: fingers lift off the front lever and stay off
    const lift = sm(tKeep, tOffF + 0.1, t);
    fy = 0.16 + 0.12 * lift; fz0 = -0.07 + 0.08 * lift;
    mFing.color.set(GREEN).multiplyScalar(1.6 + 1.2 * lift);
    brakeL.userData.m.color.set(t < T4 ? GREEN : VIOLET).multiplyScalar(t < T4 ? 1.2 + 1.6 * lift : 1.2);
    if (t < T4 && lift > 0.2) cueOn = brakeL;
    // s4 on: feather the clutch; rear brake from "rear" through s4 and lightly after
    const cl = t > tClutch - 0.1 ? 1 : 0, rb = t > tRear - 0.1 ? 1 : 0;
    clutchL.rotation.y = cl * (0.22 + 0.12 * Math.sin(t * 7));
    clutchL.userData.m.color.set(cl ? GREEN : VIOLET).multiplyScalar(1.2 + 1.8 * cl);
    const press = rb * (0.5 + 0.5 * Math.sin(t * 6));
    pedal.rotation.x = 0.3 * press; pedal.scale.setScalar(rb ? 1.6 : 1); mPed.color.set(rb ? GREEN : VIOLET).multiplyScalar(rb ? 2.6 : 1.2);
    discR.material.color.set(rb ? GREEN : VIOLET).multiplyScalar(1.5 + 1.5 * press);
    if (t < T5) { if (t > tRear - 0.1) cueOn = pedal; else if (cl) cueOn = clutchL; }
    // s5: revs a bit above idle (exhaust throbs), then head turns to the exit gate
    const rev = t > tEng - 0.1 ? 1 : 0;
    mHot.color.set(ORANGE).multiplyScalar(2.4 + rev * (1.2 + 0.8 * Math.sin(t * 16)));
    const look = sm(tTurn - 0.05, tTurn + 0.4, t);
    Bk.set(st, fB, t, { hex, trailOn: t > T4 });
    Bk.g.updateMatrixWorld(true);
    const hp = wp(Bk.headG);
    let rel = Math.atan2(-(EXIT.x - hp.x), -(EXIT.z - hp.z)) - st.h; rel = Math.atan2(Math.sin(rel), Math.cos(rel));
    Bk.headG.rotation.y = look * Math.max(-0.2, Math.min(1.3, rel));
    Bk.g.updateMatrixWorld(true);
    sight.set(wp(Bk.visor), EXIT, look * (t < T7 + 0.4 ? 1 : 0));
    ghostM.color.set(GREEN).multiplyScalar(t > T6 ? 1.6 : t > T4 ? 0.5 : 0);
  }
  fingers.position.set(0.33, fy, fz0);
  Bk.frontW.rotation.x = Bk.rearW.rotation.x = -d / 0.33;
  const shot = shoot(SH, t);
  cue.visible = !!cueOn;
  if (cueOn) { wp(cueOn.children[0] || cueOn, cue.position); cue.quaternion.copy(camera.quaternion); const ph = (t * 2.2) % 1; cue.scale.setScalar(0.6 + 0.4 * ph); cueM.color.set(cueHex).multiplyScalar(1.2 * (1 - ph)); }
  bloom.strength = (A ? 1.0 : 0.7) + 1.2 * shot.punch * shot.punch + overlays(t) + (A ? 0.8 * flash(t, tFront) + 0.6 * flash(t, tDrop + 0.3) : 0.4 * flash(t, tTurn));
});
