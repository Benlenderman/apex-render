// 01 pillion-feet: passenger drops a foot at a stop -> weight shifts, bike tips; rider holds the bike, passenger feet stay on the pegs.
import { THREE, S, g, sm, flash, scene, bloom, box, tube, mSolid, VIOLET, ORANGE, RED, GREEN, shoot, sceneOf, run, patch, glow } from "./kit.js";
import { addPillion, title, endCard, cap, overlays, bikes, ride } from "./extra.js";

scene.fog.density = 0.02;
const [B] = bikes(1), Q = addPillion(B);
// stop line ahead of the bike
scene.add(box(3.2, 0.01, 0.12, 0, 0.01, -1.4, glow(0xffffff, 0.8), false));
// rider's feet on the ground and the front brake lever (right way)
const feet = new THREE.Group(); B.lean.add(feet);
for (const s of [-1, 1]) feet.add(tube([s * 0.24, 0.44, 0.14], [s * 0.42, 0.06, 0.02], 0.1, mSolid), box(0.12, 0.08, 0.26, s * 0.43, 0.04, -0.04, mSolid));
const lever = box(0.22, 0.06, 0.06, 0.42, 0.06, 0.1, glow(GREEN, 3), false); B.fork.add(lever);
// passenger's left leg that drops to the road (pivot at the hip, inside the pillion group)
const leg = new THREE.Group(); leg.position.set(-0.14, 0, 0); Q.g.add(leg);
leg.add(tube([0, 0, 0], [0, -0.92, 0], 0.11, glow(RED, 1.6)), box(0.12, 0.08, 0.26, 0, -0.93, -0.06, glow(RED, 2)));
const seatedLeft = [2, 4, 6].map((i) => Q.g.children[i]); // left thigh, shin, foot of addPillion
// glowing pegs under the passenger's feet
const pegs = [-1, 1].map((s) => { const p = box(0.2, 0.06, 0.3, s * 0.25, 0.44, 0.42, glow(GREEN, 3), false); B.lean.add(p); return p; });
const spot = patch(0.7, 0.7, RED, 1.2); spot.position.set(-0.5, 0.02, 0.6);
const feetZ = [-1, 1].map((s) => { const p = patch(0.55, 0.6, GREEN, 1.2); p.position.set(s * 0.43, 0.03, 0); return p; });

title("NEVER FEET DOWN AT A STOP");
cap("s2", "drop", "FOOT DOWN", RED, { until: ["s2", "weight"] });
cap("s2", "weight", "THE WEIGHT SHIFTS", RED, { until: ["s2", "tips"] });
cap("s2", "tips", ["THE BIKE", "TIPS OVER"], RED);
cap("s3", "rider", "RIDER HOLDS THE BIKE", GREEN, { until: ["s3", "both"] });
cap("s3", "both", "BOTH FEET DOWN", GREEN, { until: ["s3", "front"] });
cap("s3", "front", "FRONT BRAKE ON", GREEN);
cap("s4", "keeps", ["PASSENGER:", "FEET ON THE PEGS"], GREEN, { until: ["s4", "sits"] });
cap("s4", "sits", "SIT STILL", GREEN);
cap("s5", "leaning", "NO LEANING", GREEN, { until: ["s5", "shifting"] });
cap("s5", "shifting", "NO SHIFTING", GREEN, { until: ["s5", "wait"] });
cap("s5", "wait", ["WAIT TILL", "YOU PULL AWAY"], GREEN);
cap("s6", "tell", "TELL THEM BEFORE THE RIDE", ORANGE, { until: ["s6", "feet"] });
cap("s6", "feet", ["FEET ON THE PEGS", "EVERY STOP"], GREEN);
endCard(["RIDER HOLDS THE BIKE.", "PASSENGER FEET UP."]);

// s1-s2: roll in and stop at the line; s5: pull away
const T0 = g("s2", "stop"), T1 = g("s5", "pull");
const path = (u) => [0, u < T0 ? 0.25 * (T0 - u) ** 2 : u > T1 && u < S.s6[0] ? -0.9 * (u - T1) ** 2 : 0];

const SH = [
  { at: 0, K: [[0, [-5.2, 2.0, 2.6, 0, 0.8, 1.2, 46]], [3, [-4.6, 2.0, 0.8, 0, 0.8, 0.2, 44]]] },
  { at: S.s2[0], K: [[0, [-3.2, 1.4, 2.0, -0.3, 0.6, 0.5, 44]], [2, [-2.9, 1.3, 1.6, -0.3, 0.6, 0.5, 44]]] },
  { at: g("s2", "tips") - 0.35, K: [[0, [-0.6, 2.6, -4.6, -0.5, 0.5, 0.3, 46]], [3, [-0.2, 3.2, -4.4, -0.6, 0.4, 0.3, 46]]] },
  { at: S.s3[0], K: [[0, [3.9, 1.8, -3.6, 0, 0.9, 0.1, 44]], [4, [3.4, 1.9, -3.0, 0, 0.8, 0.1, 44]]] },
  { at: S.s4[0], K: [[0, [-3.0, 1.3, 2.2, 0, 0.6, 0.4, 44]], [3, [-2.6, 1.3, 1.8, 0, 0.6, 0.4, 44]]] },
  { at: S.s5[0], K: [[0, [-4.0, 2.0, 1.6, 0, 0.8, 0.0, 44]], [3, [-4.6, 2.4, -0.4, 0, 0.8, -2.0, 46]]] },
  { at: S.s6[0], K: [[0, [-3.6, 2.4, 3.6, 0, 0.9, 0, 44]], [4, [-4.2, 2.4, 2.4, 0, 0.9, 0, 44]]] },
  { at: S.s7[0], K: [[0, [3.4, 4.2, 4.6, 0, 0.5, 0, 46]], [6, [-1.5, 4.6, 5.8, 0, 0.5, 0, 46]]] },
];

run("w", (t) => {
  const { id } = sceneOf(t), wrong = id === "s1" || id === "s2";
  let lean = 0, d = 0;
  if (id === "s2") {
    d = sm(g("s2", "drop") - 0.1, g("s2", "foot") + 0.25, t);
    lean = 0.14 * sm(g("s2", "weight") - 0.1, g("s2", "shifts") + 0.2, t) + 1.24 * sm(g("s2", "tips") - 0.15, g("s2", "tips") + 0.75, t) ** 1.6;
  }
  const hex = wrong ? RED : id === "s7" ? GREEN : VIOLET;
  ride(B, path, t, hex, { lean, trail: false });
  for (const k of ["torso", "legs"]) Q.mats[k].emissive.set(hex).multiplyScalar(0.35);
  Q.set();
  leg.visible = d > 0.01; seatedLeft.forEach((m) => (m.visible = !leg.visible));
  leg.rotation.set(0.9 * (1 - d), 0, -0.35 * d);
  const stopped = t > T0 - 0.2 && !(id === "s5" && t > T1) && id !== "s1";
  feet.visible = stopped && lean < 0.3;
  lever.visible = !wrong && stopped && (id !== "s3" || t > g("s3", "front") - 0.1);
  const kP = id === "s4" ? sm(g("s4", "pegs") - 0.2, g("s4", "pegs") + 0.1, t) : ["s5", "s6", "s7"].includes(id) ? 1 : 0;
  pegs.forEach((p) => { p.visible = kP > 0.01; p.scale.setScalar(0.6 + 0.6 * kP + 0.3 * flash(t, g("s4", "pegs"))); });
  spot.set(id === "s2" ? sm(g("s2", "foot") - 0.1, g("s2", "foot") + 0.2, t) * (1 - sm(g("s2", "tips"), g("s2", "tips") + 0.3, t)) : 0);
  const kF = id === "s3" ? sm(g("s3", "feet") - 0.1, g("s3", "feet") + 0.2, t) : 0;
  feetZ.forEach((p) => p.set(kF * (1 - 0.6 * sm(g("s3", "front"), g("s3", "front") + 0.3, t))));
  const shot = shoot(SH, t);
  bloom.strength = 1.0 + 1.2 * shot.punch * shot.punch + overlays(t) + (id === "s2" ? 0.8 * flash(t, g("s2", "over") + 0.1) : 0);
});
