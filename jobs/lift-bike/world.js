// 95 lift-bike: a dropped bike on its left side. Wrong: friend bends over with straight legs and pulls with the back (red),
// back flares. Right (green): in gear, bars turned down, back against the seat, hands on bar + rear, legs push in small steps
// backwards; stand down if it lay on its right. Or two people lift together.
import { THREE, S, g, sm, scene, bloom, box, tube, glow, hdg, VIOLET, ORANGE, RED, GREEN, shoot, run } from "./kit.js";
import { track, buildRoad, makePerson, pose, title, endCard, cap, boom, overlays, bikes, ride, downLean } from "./extra.js";

scene.fog.density = 0.008;
const T2 = S.s2[0], T3 = S.s3[0], T4 = S.s4[0], T5 = S.s5[0], T6 = S.s6[0], T7 = S.s7[0];
const tLift = g("s1", "lift"), tBend = g("s1", "bending");
const tPull = g("s2", "pull"), tHeavy = g("s2", "heavier"), tGoes = g("s2", "goes");
const tGear = g("s3", "gear"), tBars = g("s3", "bars");
const tSit = g("s4", "sit"), tHand = g("s4", "hand"), tUnder = g("s4", "under");
const tPush = g("s5", "push"), tSmall = g("s5", "small"), tRight = g("s5", "right"), tStand = g("s5", "stand");
const tTog = g("s6", "together"), tTwo = g("s6", "two");

const { P } = track([{ len: 3000 }]);
buildRoad(P, -80, 300);
const [BK] = bikes(1), A = makePerson(), Bp = makePerson();
const [bx, bz] = P(40, 2.4), bF = () => [bx, bz, 0];

// split each person at the hips so the upper body can bend and the legs can squat
const rig = (p) => {
  const up = new THREE.Group(), low = new THREE.Group();
  [...p.body.children].forEach((c, i) => (i >= 6 ? up : low).add(c));
  up.children.forEach((c) => (c.position.y -= 0.92)); p.body.add(low, up);
  const dots = [p.armL, p.armR].map((a) => { const d = new THREE.Mesh(new THREE.SphereGeometry(0.09, 10, 8), glow(GREEN, 3)); d.position.set(0, -0.72, 0); a.add(d); d.visible = false; return d; });
  return { up, low, dots };
};
const RA = rig(A), RB = rig(Bp);
const bendSquat = (R, bend, squat) => { const k = 1 - 0.42 * squat; R.low.scale.y = k; R.up.position.y = 0.92 * k; R.up.rotation.x = -bend; };
const lit = (p, hex, k) => p.mats.torso.emissive.set(hex).multiplyScalar(k);

// kickstand (left side), shown on "stand"
const mStand = glow(ORANGE, 2.5), stand = tube([-0.16, 0.38, 0.12], [-0.42, 0.02, 0.26], 0.035, mStand); BK.lean.add(stand);

title("NEVER LIFT A DROPPED BIKE WITH YOUR BACK");
cap("s2", "pull", ["PULLING", "WITH YOUR BACK"], RED, { until: ["s2", "heavier"] });
cap("s2", "heavier", ["HEAVIER THAN", "YOU THINK"], RED, { until: ["s2", "goes"] });
cap("s2", "goes", ["YOUR BACK GOES"], RED);
boom("s2", "goes", 0.8);
cap("s3", "gear", ["PUT IT IN GEAR"], GREEN, { until: ["s3", "turn"] });
cap("s3", "turn", ["BARS TURNED", "TO THE GROUND"], GREEN);
cap("s4", "sit", ["BACK AGAINST", "THE SEAT"], GREEN, { until: ["s4", "one"] });
cap("s4", "one", ["ONE HAND ON THE BAR"], GREEN, { until: ["s4", "under"] });
cap("s4", "under", ["ONE UNDER THE REAR"], GREEN);
cap("s5", "push", ["PUSH WITH", "YOUR LEGS"], GREEN, { until: ["s5", "small"] });
cap("s5", "small", ["SMALL STEPS", "BACKWARDS"], GREEN, { until: ["s5", "if"] });
cap("s5", "if", ["ON ITS RIGHT SIDE?", "STAND DOWN FIRST"], ORANGE);
cap("s6", "lift", ["OR LIFT IT", "TOGETHER"], GREEN, { until: ["s6", "two"] });
cap("s6", "two", ["TWO PEOPLE,", "NO INJURIES"], GREEN);
endCard(["BACK TO THE SEAT.", "LIFT WITH YOUR LEGS."]);

const SH = [
  { at: 0, K: [[0, [bx - 4.2, 2.3, bz - 4.6, bx - 0.7, 0.5, bz, 46]], [T2 - 0.1, [bx - 3.6, 1.9, bz - 4.0, bx - 0.7, 0.5, bz, 46]]] },
  { at: T2, K: [[0, [bx - 1.5, 1.4, bz + 3.6, bx - 0.9, 0.8, bz, 46]], [T3 - T2, [bx - 1.4, 1.3, bz + 3.1, bx - 0.9, 0.8, bz, 46]]] },
  { at: T3, K: [[0, [bx - 3.0, 2.2, bz - 3.4, bx - 0.4, 0.4, bz - 0.2, 44]], [T4 - T3, [bx - 2.6, 1.9, bz - 3.0, bx - 0.4, 0.4, bz - 0.3, 44]]] },
  { at: T4, K: [[0, [bx - 1.4, 1.3, bz + 3.4, bx - 0.8, 0.6, bz, 46]], [T5 - T4, [bx - 1.3, 1.2, bz + 3.1, bx - 0.8, 0.6, bz, 46]]] },
  { at: T5, K: [[0, [bx - 1.6, 1.4, bz + 3.8, bx - 0.6, 0.7, bz, 46]], [tRight - T5, [bx - 1.8, 1.6, bz + 4.0, bx - 0.5, 0.75, bz, 46]], [T6 - T5, [bx - 4.4, 1.9, bz - 3.6, bx - 0.2, 0.6, bz, 44]]] },
  { at: T6, K: [[0, [bx + 3.4, 2.2, bz - 3.0, bx - 0.6, 0.6, bz, 46]], [T7 - T6, [bx + 3.8, 2.5, bz - 2.4, bx - 0.6, 0.7, bz, 46]]] },
  { at: T7, K: [[0, [bx - 4.8, 3.4, bz - 4.6, bx - 0.4, 0.6, bz, 46]], [6, [bx - 5.6, 4.2, bz - 5.6, bx - 0.4, 0.6, bz, 46]]] },
];

const hR = hdg(1, 0), hL = hdg(-1, 0);
run("w", (t) => {
  let down = 1, hex = VIOLET, steer = 0;
  A.mats.torso.emissive.set(0x000000); RA.dots.forEach((d) => (d.visible = false));
  pose(Bp, { vis: false }); stand.visible = false;
  if (t < T3) {
    // wrong: straight legs, bent back, pulls; bike barely rises then drops; back flares red
    const kB = sm(tLift - 0.2, tBend + 0.3, t), pull = sm(tPull, tPull + 0.5, t) * (1 - sm(tHeavy + 0.2, tHeavy + 0.6, t));
    hex = t < tLift ? VIOLET : RED;
    down = 1 - 0.14 * pull + 0.02 * Math.sin(30 * t) * pull;
    pose(A, { x: bx - 1.45, z: bz - 0.05, h: hR, armR: 1.25 * kB + 0.1 * kB, armL: 1.25 * kB + 0.1 * kB, hex: t < T2 ? VIOLET : RED });
    bendSquat(RA, 1.25 * kB - 0.15 * pull, sm(tGoes, tGoes + 0.3, t) * 0.35);
    if (t > tPull) lit(A, RED, 0.6 + 1.6 * sm(tGoes - 0.2, tGoes, t) * (0.7 + 0.3 * Math.sin(14 * t)));
  } else if (t < T6) {
    hex = GREEN;
    steer = 0.6 * sm(tBars - 0.1, tBars + 0.5, t);
    if (t < T4) {
      pose(A, { x: bx - 1.6, z: bz - 0.1, h: hR, armR: 1.2 * sm(tGear - 0.3, tGear, t), armL: 0, hex: GREEN });
      bendSquat(RA, 0, 0);
    } else {
      // turn around, back to the seat, squat; hands reach back to bar (front, -z) and rear
      const kT = sm(tSit - 0.3, tSit + 0.5, t), kH = sm(tHand - 0.1, tHand + 0.3, t), kU = sm(tUnder - 0.1, tUnder + 0.3, t);
      const kP = t > T5 ? sm(tPush, tSmall + 1.6, t) : 0, kS = Math.floor(kP * 4 * 0.999) / 4 + sm(0, 1, (kP * 4) % 1) / 4; // stepped
      down = 1 - (t > T5 ? kS : 0);
      pose(A, { x: bx - 1.55 + 0.45 * kT + 0.5 * kS, z: bz - 0.05, h: hR + (hL - hR) * kT, armR: -0.55 * kH, armL: -0.55 * kU, hex: GREEN });
      bendSquat(RA, 0.15 * kT * (1 - kS), kT * (1 - 0.85 * kS));
      RA.dots[1].visible = kH > 0.5; RA.dots[0].visible = kU > 0.5;
      A.g.position.y = 0.02 * Math.abs(Math.sin(Math.PI * 4 * kP)); // little steps
      if (t > tStand - 0.1) { stand.visible = true; mStand.color.set(ORANGE).multiplyScalar(2 + Math.sin(10 * t)); }
    }
  } else {
    // two people lift together
    hex = GREEN;
    const k = sm(tTog - 0.1, tTwo + 0.4, t);
    down = t < T7 ? 1 - k : 0;
    const kk = t < T7 ? k : 1;
    pose(A, { x: bx - 1.25 + 0.4 * kk, z: bz - 0.55, h: hR, armR: 0.9 - 0.4 * kk, armL: 0.9 - 0.4 * kk, hex: GREEN });
    pose(Bp, { x: bx - 1.25 + 0.4 * kk, z: bz + 0.55, h: hR, armR: 0.9 - 0.4 * kk, armL: 0.9 - 0.4 * kk, hex: GREEN });
    bendSquat(RA, 0.35 * (1 - kk), 0.8 * (1 - kk)); bendSquat(RB, 0.35 * (1 - kk), 0.8 * (1 - kk));
  }
  ride(BK, bF, t, hex, { still: true, lean: downLean(down, 1), down: 1, trail: false });
  BK.rider.visible = false; BK.g.position.y = 0.22 * down;
  BK.fork.rotation.y = steer;
  BK.hlight.material.color.set(0xffffff).multiplyScalar(0.5);
  const shot = shoot(SH, t);
  bloom.strength = 0.9 + 1.2 * shot.punch * shot.punch + overlays(t);
});
