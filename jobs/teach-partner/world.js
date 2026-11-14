// 92 teach-partner: you stand in an empty car park shouting at your partner on a bike; they wobble round in a stressed oval (red).
// Right way: a training ground with cones and a qualified instructor, a slalom on the training bike; then you ride together at their pace (green).
import { THREE, S, g, sm, scene, bloom, box, glow, VIOLET, ORANGE, RED, GREEN, pathState, shoot, run, patch, beam } from "./kit.js";
import { track, buildRoad, makePerson, pose, ARM, title, endCard, cap, overlays, bikes, ride } from "./extra.js";

scene.fog.density = 0.006;
const T2 = S.s2[0], T3 = S.s3[0], T4 = S.s4[0], T5 = S.s5[0], T6 = S.s6[0];
const tShout = g("s2", "shout"), tStress = g("s2", "stressed"), tHab = g("s2", "habits");
const tCourse = g("s3", "course"), tQual = g("s3", "qualified"), tTrain = g("s4", "training");

const { P } = track([{ len: 4000 }]);
buildRoad(P, -100, 3800, { lamps: false });
const [BP, BY] = bikes(2), you = makePerson(), inst = makePerson();

// ---- A: empty car park right of the road; partner circles you, you shout from the middle ----
const cx = 15, cz = -60;
const parkV = patch(18, 18, VIOLET, 0.12), parkR = patch(18, 18, RED, 0.2);
parkV.position.set(cx, 0.02, cz); parkR.position.set(cx, 0.025, cz);
const wob = (t) => sm(tStress - 0.3, tStress + 0.8, t);
const aPath = (t) => {
  const ph = 0.85 * t, k = wob(t), r = 1 + 0.18 * k * Math.sin(3.1 * t);
  return [cx + 5.2 * r * Math.cos(ph), cz + 4.2 * r * Math.sin(ph)];
};
const shout = beam(RED, 1.0, 0.05);
const va = new THREE.Vector3(), vb = new THREE.Vector3();

// ---- B: training ground far down the road: cones in a line, the instructor, the training bike slaloms ----
const gx = 16, gz = -700, ground = patch(12, 36, GREEN, 0.18); ground.position.set(gx, 0.02, gz);
const z0 = gz + 11, mC = glow(ORANGE, 1.6);
for (let k = 0; k < 5; k++) scene.add(box(0.35, 0.5, 0.35, gx, 0.25, z0 - 5 * k, mC, false));
const zStart = gz + 16, VB = 2.8;
const bPath = (t) => {
  const d = Math.max(0, t - tTrain) * VB, z = zStart - d;
  return [gx + 1.5 * Math.cos((Math.PI * (z - z0)) / 5) * (1 - sm(z0 + 2, zStart, z)), z];
};

// ---- C: back on the road, partner leads, you follow at their pace ----
const sC = 1500, VC = 7;
const cP = (t) => P(sC + VC * (t - T5), 1.0), cY = (t) => P(sC - 9 + VC * (t - T5), 2.6);

title("NEVER TEACH YOUR PARTNER TO RIDE YOURSELF");
cap("s2", "shout", ["YOU SHOUT"], RED, { until: ["s2", "stressed"] });
cap("s2", "stressed", ["THEY GET STRESSED"], RED, { until: ["s2", "habits"] });
cap("s2", "habits", ["YOUR BAD HABITS", "PASS ON"], RED, { boom: 0.5 });
cap("s3", "course", ["BOOK A COURSE"], GREEN, { until: ["s3", "qualified"] });
cap("s3", "qualified", ["WITH A QUALIFIED", "INSTRUCTOR"], GREEN);
cap("s4", "training", ["TRAINING BIKE,", "SAFE AREA"], GREEN, { until: ["s4", "right"] });
cap("s4", "right", ["THE RIGHT WAY", "FROM DAY ONE"], GREEN);
cap("s5", "ride", ["RIDE WITH THEM AFTER,", "AT THEIR PACE"], GREEN);
cap("s6", "partner", ["THEIR PARTNER,", "NOT THEIR INSTRUCTOR"], GREEN);
endCard(["BOOK A COURSE.", "THEN RIDE TOGETHER."]);

const fol = (fn) => (t) => pathState(fn, t);
const SH = [
  { at: 0, K: [[0, [cx - 15, 15, cz + 21, cx, 0.4, cz - 1, 46]], [3, [cx - 14, 14, cz + 19.5, cx, 0.4, cz - 1, 46]]] },
  { at: T2, K: [[0, [cx - 11, 9, cz + 15, cx + 0.5, 0.6, cz - 0.5, 46]], [3.5, [cx - 10, 8.5, cz + 14, cx + 0.5, 0.6, cz - 0.5, 46]]] },
  { at: T3, K: [[0, [gx - 2, 8, zStart + 12, gx + 1, 0.3, gz + 5, 46]], [3, [gx - 2.3, 8.5, zStart + 13, gx + 1, 0.3, gz + 5, 46]]] },
  { at: T4, f: fol(bPath), noRot: true, K: [[0, [-1.2, 4.8, 8.5, -1.5, 0.3, -10, 46]], [4, [-1.4, 5.2, 9, -1.5, 0.3, -10, 46]]] },
  { at: T5, f: fol(cY), noRot: true, K: [[0, [-1.5, 3.4, 9, -1.2, 0.9, -16, 46]], [3, [-1.7, 3.6, 9.5, -1.2, 0.9, -16, 46]]] },
  { at: T6, f: fol(cP), noRot: true, K: [[0, [-5.5, 3.0, -9, 1.2, 0.9, 4, 46]], [4, [-6, 3.4, -10, 1.2, 0.9, 4, 46]]] },
];

run("w", (t) => {
  const A = t < T3, B = !A && t < T5, hex = A ? (t < T2 ? VIOLET : RED) : GREEN;
  if (A) {
    const k = wob(t), st = ride(BP, aPath, t, hex, { lean: 0.22 * k * Math.sin(4.3 * t), trail: true });
    const [px, pz] = aPath(t), hY = Math.atan2(-(px - cx), -(pz - cz)), yell = t > tShout ? 1 : 0;
    pose(you, { x: cx, z: cz, h: hY, armR: yell ? ARM.point + 0.35 * Math.sin(7 * t) : 0, armL: yell ? 0.4 + 0.3 * Math.sin(5 * t + 1) : 0, hex });
    you.head.getWorldPosition(va); vb.set(px, 1.3, pz);
    shout.set(va, vb, yell * sm(tShout, tShout + 0.3, t) * (0.45 + 0.15 * Math.sin(6 * t)));
    ride(BY, null, t, hex);
    pose(inst, { vis: false });
  } else {
    pose(you, { vis: false }); shout.set(va, vb, 0);
    if (B) {
      ride(BP, bPath, t, GREEN, { still: t < tTrain, trail: t > tTrain });
      ride(BY, null, t, GREEN);
      pose(inst, { x: gx - 2.6, z: zStart - 4, h: -Math.PI / 2 + 0.5, armR: t > tQual ? ARM.point : 0, hex: GREEN });
    } else {
      pose(inst, { vis: false });
      ride(BP, cP, t, GREEN); ride(BY, cY, t, GREEN);
    }
  }
  parkV.set(A ? 1 - sm(tStress - 0.3, tStress + 0.3, t) : 0);
  parkR.set(A ? sm(tStress - 0.3, tStress + 0.3, t) : 0);
  ground.set(B ? sm(tCourse - 0.3, tCourse + 0.3, t) : 0);
  const shot = shoot(SH, t);
  bloom.strength = 1.0 + 1.2 * shot.punch * shot.punch + overlays(t);
});
