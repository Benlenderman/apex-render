// 79 pillion-helmet: spare helmet too big -> rolls off in a crash (red). Right way: strap done, snug, no forehead gap;
// push side to side -> head moves with it; try to roll it forward -> stays on; strap done every time, even short rides.
import { THREE, S, g, sm, flash, scene, bloom, box, glow, VIOLET, ORANGE, RED, GREEN, WHITE, pathState, shoot, sceneOf, run } from "./kit.js";
import { track, buildRoad, addPillion, title, endCard, cap, overlays, bikes, ride, dist } from "./extra.js";

scene.fog.density = 0.011;
const { P } = track([{ len: 3000 }]);
buildRoad(P, -80, 2000);
const T2 = S.s2[0], T3 = S.s3[0], T4 = S.s4[0], T5 = S.s5[0], T6 = S.s6[0];
const [Bk] = bikes(1), Q = addPillion(Bk);
// the loose spare helmet: too big, sits high with a gap at the forehead
const lidMat = new THREE.MeshStandardMaterial({ color: 0x3a33a0, emissive: 0x5a1020, roughness: 0.5 });
const bigLid = new THREE.Mesh(new THREE.SphereGeometry(0.21, 16, 12), lidMat); Q.headG.add(bigLid);
const gapBar = box(0.2, 0.05, 0.02, 0, -0.02, -0.2, glow(RED, 2.4), false); bigLid.add(gapBar); // gap glow at the forehead
// chin strap (green when done), fitted helmet = the head itself
const strap = new THREE.Mesh(new THREE.TorusGeometry(0.13, 0.016, 8, 24, Math.PI), glow(GREEN, 1.6));
strap.rotation.set(0, Math.PI / 2, Math.PI); strap.position.set(0, -0.04, -0.02); Q.headG.add(strap);

const tBig = g("s2", "big"), tCrash = g("s2", "crash");
const vA = (t) => 11 - 11 * sm(tCrash - 0.1, tCrash + 0.5, t);
const DA = dist(vA, 0, T3), pA = (t) => P(200 - DA(tCrash) + DA(t), 1.8);
const tGap = g("s3", "gap");
const tPush = g("s4", "push"), tCheek = g("s4", "cheeks");
const tRoll = g("s5", "roll"), tMust = g("s5", "must");
const tEvery = g("s6", "every"), tShort = g("s6", "short");
const PARK = () => [...P(300, 3.2), 0];
const DC = dist((t) => 7 * sm(tShort - 0.6, tShort + 0.8, t), T6, T6 + 30), pC = (t) => P(300 + DC(t), 3.2);

title("NEVER HAND YOUR PASSENGER THE SPARE HELMET UNCHECKED");
cap("s2", "too", ["TOO BIG CAN ROLL OFF", "IN A CRASH"], RED, { boom: 0.5 });
cap("s3", "strap", "STRAP DONE", GREEN, { until: ["s3", "no"] });
cap("s3", "no", "NO GAP AT THE FOREHEAD", GREEN);
cap("s4", "push", "PUSH IT SIDE TO SIDE", ORANGE, { until: ["s4", "their"] });
cap("s4", "their", ["THEIR CHEEKS SHOULD", "MOVE WITH IT"], GREEN);
cap("s5", "try", "TRY TO ROLL IT FORWARD", ORANGE, { until: ["s5", "must"] });
cap("s5", "must", "IT MUST NOT COME OFF", GREEN);
cap("s6", "strap", ["STRAP DONE UP,", "EVERY TIME"], GREEN, { until: ["s6", "even"] });
cap("s6", "even", "EVEN FOR A SHORT RIDE", GREEN);
endCard(["SNUG FIT.", "STRAP DONE."]);

const fol = (fn) => (t) => pathState(fn, t);
const fp = { x: P(300, 3.2)[0], z: P(300, 3.2)[1], h: 0 }, park = () => fp;
const HEAD = (k = 0) => [0, 1.67, 0.55 + k];
const SH = [
  { at: 0, f: fol(pA), noRot: true, K: [[0, [3.6, 1.6, 0.9, 0, 1.2, 0.3, 42]], [3, [3.9, 1.7, 0.3, 0, 1.2, 0.0, 42]]] },
  { at: tBig - 0.3, f: fol(pA), noRot: true, K: [[0, [1.6, 1.85, 1.6, 0, 1.55, 0.45, 40]], [1.5, [1.7, 1.85, 1.4, 0, 1.55, 0.45, 40]]] },
  { at: tCrash - 0.4, f: fol(pA), noRot: true, K: [[0, [3.2, 2.0, -3.4, 0, 0.8, -1.5, 46]], [3, [3.4, 2.2, -3.8, 0, 0.7, -2.0, 46]]] },
  { at: T3, f: park, K: [[0, [1.3, 1.85, -0.4, 0, 1.6, 0.55, 38]], [3, [1.15, 1.8, -0.2, 0, 1.6, 0.55, 36]]] },
  { at: tGap - 0.2, f: park, K: [[0, [1.05, 1.72, 0.05, 0, 1.65, 0.55, 34]], [2, [0.95, 1.72, 0.15, 0, 1.65, 0.55, 32]]] },
  { at: T4, f: park, K: [[0, [1.25, 1.78, -0.15, 0, 1.62, 0.55, 36]], [3, [1.15, 1.78, 0.0, 0, 1.62, 0.55, 34]]] },
  { at: T5, f: park, K: [[0, [1.4, 1.8, 0.2, 0, 1.6, 0.55, 38]], [3, [1.3, 1.8, 0.35, 0, 1.6, 0.55, 36]]] },
  { at: T6, f: park, K: [[0, [1.3, 1.7, -0.2, 0, 1.55, 0.55, 38]], [1.5, [1.2, 1.7, 0.0, 0, 1.55, 0.55, 36]]] },
  { at: tShort - 0.4, f: fol(pC), noRot: true, K: [[0, [-3.2, 2.6, 5.5, 0.3, 0.9, -3, 46]], [5, [-3.6, 3.2, 7, 0.3, 0.9, -4, 46]]] },
];
run("w", (t) => {
  const { id } = sceneOf(t), A = t < T3;
  if (A) ride(Bk, pA, t, RED, { trail: t < tCrash });
  else if (t < tShort - 0.6) ride(Bk, PARK, t, VIOLET, { still: true, trail: false });
  else ride(Bk, pC, t, GREEN);
  Bk.hlight.visible = !(id === "s3" || id === "s4" || id === "s5");
  // crash: passenger lurches forward, the loose helmet rolls off ahead and tumbles down the road
  const c = A ? sm(tCrash - 0.1, tCrash + 0.3, t) : 0, fly = A ? sm(tCrash, tCrash + 1.4, t) : 0;
  Q.set({ grip: "waist", slide: c * (1 - sm(tCrash + 0.6, tCrash + 1.4, t)) });
  bigLid.visible = A;
  bigLid.position.set(0, 0.07 - 1.45 * Math.min(1, fly * 1.6) + 0.35 * Math.sin(Math.PI * Math.min(1, fly * 1.6)), -3.2 * fly);
  bigLid.rotation.x = -9 * fly;
  // checks on the fitted helmet: side to side (head turns with it), roll forward (stays on)
  const side = id === "s4" ? Math.sin((t - tPush) * 6) * sm(tPush, tPush + 0.3, t) * (1 - sm(T5 - 0.4, T5, t)) : 0;
  const roll = id === "s5" ? sm(tRoll, tRoll + 0.5, t) * (1 - sm(tMust + 0.6, tMust + 1.2, t)) : 0;
  Q.headG.rotation.set(-0.3 * roll, 0.35 * side, 0);
  Q.mats.head.emissive.set(A ? RED : GREEN).multiplyScalar(A ? 0.25 : 0.3 + 0.25 * (Math.abs(side) + roll));
  for (const k of ["torso", "legs"]) Q.mats[k].emissive.set(A ? RED : VIOLET).multiplyScalar(0.3);
  strap.visible = !A;
  strap.material.color.set(GREEN).multiplyScalar(id === "s6" && t < tShort ? 1.8 + 0.3 * Math.sin(t * 8) : 1.3);
  const shot = shoot(SH, t);
  bloom.strength = 1.0 + 1.2 * shot.punch * shot.punch + overlays(t) + 0.8 * flash(t, tCrash);
});
