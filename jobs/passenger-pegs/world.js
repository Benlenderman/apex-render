// 98 passenger-pegs: wrong (red): passenger on a bike with no pegs, legs dangle and swing next to the rear wheel.
// Right (green): pillion seat + pegs folded down, check the licence (new rider L plate = no passenger), helmet + gear.
import { THREE, S, g, sm, pulse, scene, bloom, box, tube, glow, VIOLET, ORANGE, RED, GREEN, WHITE, pathState, shoot, sceneOf, run } from "./kit.js";
import { track, buildRoad, addPillion, makePerson, pose, fitText, title, endCard, cap, boom, overlays, tag, tagAt, bikes, ride } from "./extra.js";

scene.fog.density = 0.012;
const { P } = track([{ len: 3000 }]);
buildRoad(P, -40, 700);
const [B] = bikes(1), Q = addPillion(B), F = makePerson();
const O = 1.8, T2 = S.s2[0], T3 = S.s3[0], T4 = S.s4[0], T5 = S.s5[0], T6 = S.s6[0], T7 = S.s7[0];

// pillion parts: Q.g children = torso, headG, thighs x2, shins x2, feet x2, waist x2, rails x2, knees x2, hands x2
const qShins = Q.g.children.slice(4, 8);
// dangling legs (no pegs): pivot at the knee, shin + foot hang down and swing
const mDang = glow(VIOLET, 0.5);
const dang = [-1, 1].map((s) => { const L = new THREE.Group(); L.position.set(s * 0.2, -0.03, -0.34);
  L.add(tube([0, 0, 0], [0, -0.5, 0], 0.1, mDang), box(0.11, 0.08, 0.24, 0, -0.53, -0.06, mDang, false)); Q.g.add(L); return L; });
// pillion pad + fold-down pegs (green)
const mPad = glow(GREEN, 0.25), pad = box(0.3, 0.07, 0.32, 0, 0.99, 0.62, mPad, false); B.lean.add(pad);
const mPeg = glow(GREEN, 1.2);
const pegs = [-1, 1].map((s) => { const G = new THREE.Group(); G.position.set(s * 0.2, 0.43, 0.42); G.add(box(0.16, 0.04, 0.05, s * 0.08, 0, 0, mPeg, false)); B.lean.add(G); return G; });
// new-rider L plate on the tail
// L drawn from two red bars on a white plate (text "L" rendered too small)
const Lp = new THREE.Group(), mL = glow(RED, 2.2); Lp.add(box(0.06, 0.24, 0.02, -0.06, 0, 0, mL, false), box(0.18, 0.06, 0.02, 0, -0.09, 0, mL, false));
Lp.position.set(0, 0.78, 0.84); B.lean.add(Lp); const Lb = box(0.34, 0.34, 0.01, 0, 0.78, 0.82, glow(WHITE, 0.6), false); B.lean.add(Lb);

// motion: A rolls through s1-s2; B stopped at the kerb s3-s4; C rides s5; s6 stopped, friend left standing; s7 rides
const VA = 8, sA = (t) => 40 + VA * t, sB0 = 300, sC = (t) => 500 + 7 * Math.max(0, t - T5), sD0 = 700, sE = (t) => 900 + 7 * Math.max(0, t - T7);
const path = (t) => P(t < T3 ? sA(t) : t < T5 ? sB0 : t < T6 ? sC(t) : t < T7 ? sD0 : sE(t), O);
const moving = (t) => t < T3 || (t >= T5 && t < T6) || t >= T7;

const tWheel = tag("LEGS BY THE WHEEL", RED), tPad = tag("SEAT FOR TWO", GREEN), tPeg = tag("PEGS DOWN", GREEN), tL = tag("NEW RIDER", ORANGE);

title("NEVER CARRY A PASSENGER WITHOUT PEGS");
cap("s2", "nowhere", ["NOWHERE TO PUT", "THEIR FEET"], RED, { until: ["s2", "brace"] });
cap("s2", "brace", ["THEY CAN'T BRACE"], RED, { until: ["s2", "legs"] });
cap("s2", "legs", ["LEGS SWING", "NEAR THE WHEEL"], RED);
boom("s2", "wheel", 0.8);
cap("s3", "check", ["CHECK THE BIKE FIRST"], GREEN, { until: ["s3", "seat"] });
cap("s3", "seat", ["A SEAT MADE", "FOR TWO"], GREEN, { until: ["s3", "pegs"] });
cap("s3", "pegs", ["PASSENGER PEGS", "FOLDED DOWN"], GREEN);
cap("s4", "check", ["CHECK YOUR", "LICENCE TOO"], GREEN, { until: ["s4", "new"] });
cap("s4", "new", ["NEW RIDER?", "NO PASSENGER YET"], ORANGE);
cap("s5", "helmet", ["A HELMET AND GEAR", "SAME AS YOU"], GREEN);
cap("s6", "no", ["NO PEGS, NO SEAT,", "NO RIDE"], RED);
endCard(["TWO SEATS, TWO PEGS.", "OR NO PASSENGER."]);

const fol = (t) => pathState(path, t);
const SH = [
  { at: 0, f: fol, K: [[0, [-4.6, 2.0, 3.0, 0, 0.9, 0, 46]], [T2, [-4.3, 1.9, 2.4, 0, 0.9, 0, 46]]] },
  { at: T2, f: fol, K: [[0, [4.4, 1.3, 1.8, 0, 0.75, 0.5, 44]], [T3 - T2, [4.1, 1.2, 1.5, 0, 0.75, 0.5, 44]]] },
  { at: T3, f: fol, K: [[0, [-3.2, 1.9, 4.4, 0.5, 0.9, 0.3, 46]], [T4 - T3, [-2.9, 1.8, 4.0, 0.5, 0.9, 0.3, 46]]] },
  { at: T4, f: fol, K: [[0, [-1.2, 1.4, 3.6, 0, 0.9, 0.4, 44]], [T5 - T4, [-1.0, 1.3, 3.1, 0, 0.9, 0.4, 44]]] },
  { at: T5, f: fol, K: [[0, [4.6, 1.8, 1.4, 0, 1.2, 0.3, 44]], [T6 - T5, [4.8, 1.8, 1.0, 0, 1.2, 0.3, 44]]] },
  { at: T6, f: fol, K: [[0, [-4.0, 1.9, 2.6, -0.6, 0.9, 0, 46]], [T7 - T6, [-4.3, 2.0, 2.2, -0.6, 0.9, 0, 46]]] },
  { at: T7, f: fol, K: [[0, [-3, 6, 9, 0, 0.8, -4, 50]], [4, [-3, 8, 12, 0, 0.8, -6, 50]]] },
];

run("w", (t) => {
  const { id } = sceneOf(t), wrong = t < T3 || id === "s6";
  const st = ride(B, path, t, wrong ? (t >= T2 ? RED : VIOLET) : GREEN, { trail: moving(t) });
  if (!moving(t)) st.v = 0;
  // passenger on the bike in s1-s2 (no pegs), s5 and s7 (pegs); off the bike in s3, s4, s6
  const onBike = t < T3 || id === "s5" || t >= T7;
  Q.g.visible = onBike;
  const hasKit = !wrong; // pad + pegs only on the right-way bike
  pad.visible = hasKit && t >= g("s3", "seat") - 0.1; pegs.forEach((p) => (p.visible = hasKit && t >= g("s3", "pegs") - 0.2));
  const fold = t < T4 ? sm(g("s3", "pegs"), g("s3", "folded") + 0.2, t) : 1;
  pegs.forEach((p, i) => (p.rotation.z = (i ? 1 : -1) * (Math.PI / 2) * (1 - fold)));
  mPad.color.set(GREEN).multiplyScalar(0.25 + 1.6 * (id === "s3" ? pulse(t, g("s3", "seat") - 0.1, g("s3", "pegs")) : 0));
  // legs: dangle + swing toward the wheel when there are no pegs; feet on pegs otherwise
  const dangle = t < T3;
  qShins.forEach((m) => (m.visible = !dangle)); dang.forEach((L) => (L.visible = dangle));
  const sw = t > T2 ? sm(T2, g("s2", "legs"), t) : 0.25;
  dang.forEach((L, i) => { L.rotation.x = -0.45 * sw * (0.6 + 0.4 * Math.sin(5.5 * t + i * 1.7)) - 0.15; L.rotation.z = (i ? 1 : -1) * 0.12; });
  mDang.color.set(t > g("s2", "legs") - 0.2 ? RED : VIOLET).multiplyScalar(t > g("s2", "legs") - 0.2 ? 1.2 + 0.8 * Math.abs(Math.sin(8 * t)) : 0.5);
  // L plate in s4
  Lp.visible = Lb.visible = id === "s4" && t > g("s4", "new") - 0.15;
  // helmet + gear glow in s5
  const kH = id === "s5" ? sm(g("s5", "helmet") - 0.1, g("s5", "helmet") + 0.2, t) : t >= T7 ? 1 : 0, kG = id === "s5" ? sm(g("s5", "gear") - 0.1, g("s5", "gear") + 0.2, t) : t >= T7 ? 1 : 0;
  Q.mats.head.emissive.set(GREEN).multiplyScalar(0.7 * kH); Q.mats.torso.emissive.set(t < T3 && t > T2 ? RED : GREEN).multiplyScalar(t < T3 ? (t > T2 ? 0.4 : 0) : 0.6 * kG);
  Q.mats.legs.emissive.set(GREEN).multiplyScalar(0.4 * kG);
  Q.set({ knees: 0, handsGlow: 0 });
  // friend standing by the kerb in s3, s6
  const fx = 1.4, fz = 0.2;
  if (id === "s3" || id === "s4" || id === "s6") { const [x, , z] = [st.x + fx, 0, st.z + fz]; pose(F, { x, z, h: Math.PI / 2, hex: id === "s6" ? RED : GREEN }); } else pose(F, { vis: false });
  tagAt(tWheel, st.x, 1.9, st.z + 0.6, 0, 0.7);
  tagAt(tPad, st.x, 1.7, st.z + 0.6, 0, 0.6);
  tagAt(tPeg, st.x, 1.7, st.z + 0.6, 0, 0.6);
  tagAt(tL, st.x, 1.9, st.z + 0.6, 0, 0.6);
  const shot = shoot(SH, t);
  bloom.strength = 1.0 + 1.2 * shot.punch * shot.punch + overlays(t);
});
