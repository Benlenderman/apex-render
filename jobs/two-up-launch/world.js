// 97 two-up-launch: wrong (red): hard launch with a passenger, front goes light, passenger slides back.
// Right (green): gentle pull away, tell them to hold on before you go, smooth gear changes, they stay in place.
import { THREE, S, g, sm, pulse, scene, bloom, box, glow, VIOLET, RED, GREEN, WHITE, pathState, shoot, sceneOf, run } from "./kit.js";
import { track, buildRoad, addPillion, title, endCard, cap, boom, overlays, tag, tagAt, bikes, ride, dist } from "./extra.js";

scene.fog.density = 0.012;
const { P } = track([{ len: 3000 }]);
buildRoad(P, -40, 900);
const [B] = bikes(1), Q = addPillion(B);
const O = 1.8, T2 = S.s2[0], T3 = S.s3[0], T4 = S.s4[0], T5 = S.s5[0], T6 = S.s6[0], T7 = S.s7[0];
const stopLine = (s) => { const [x, z] = P(s - 1.1, O); scene.add(box(3.4, 0.01, 0.25, x, 0.012, z, glow(WHITE, 1.4), false)); };

// A: hard launch at the start of s2
const tA = T2 + 0.1, sA0 = 40, sA = (t) => sA0 + 3.2 * Math.max(0, t - tA) ** 2;
// B: gentle launch in s3
const tB = g("s3", "pull") - 0.05, sB0 = 250, DBv = dist((t) => Math.min(7, 1.4 * Math.max(0, t - tB)), T3, T4 + 1);
// C: stopped in s4 while the rider tells them to hold on, then a gentle start on "go", smooth gear change in s5
const tC = g("s4", "go") + 0.1, sC0 = 500, DCv = dist((t) => Math.min(9, 1.5 * Math.max(0, t - tC)), T4, T7 + 8);
const sNow = (t) => (t < T3 ? sA(t) : t < T4 ? sB0 + DBv(t) : sC0 + DCv(t));
const path = (t) => P(sNow(t), O);
stopLine(sA0); stopLine(sB0); stopLine(sC0);

const tShift = g("s5", "smoothly");
const tWt = tag("WEIGHT BEHIND YOU", RED), tGear = tag("GEAR 2", GREEN);

title("NEVER PULL AWAY HARD");
cap("s2", "extra", ["THE EXTRA WEIGHT", "SITS BEHIND YOU"], RED, { until: ["s2", "front"] });
cap("s2", "front", ["THE FRONT GOES LIGHT"], RED, { until: ["s2", "passenger"] });
cap("s2", "passenger", ["YOUR PASSENGER", "SLIDES BACK"], RED);
boom("s2", "slides", 0.8);
cap("s3", "pull", ["PULL AWAY GENTLY"], GREEN, { until: ["s3", "roll"] });
cap("s3", "roll", ["ROLL ON THE", "THROTTLE SLOWLY"], GREEN);
cap("s4", "tell", ["TELL THEM TO", "HOLD ON"], GREEN, { until: ["s4", "before"] });
cap("s4", "before", ["BEFORE YOU GO"], GREEN);
cap("s5", "change", ["CHANGE GEAR", "SMOOTHLY"], GREEN, { until: ["s5", "so"] });
cap("s5", "so", ["NO HELMETS", "BANGING TOGETHER"], GREEN);
cap("s6", "smooth", ["SMOOTH STARTS", "KEEP THEM IN PLACE"], GREEN);
endCard(["GENTLE ON THE THROTTLE.", "SMOOTH ON THE GEARS."]);

const fol = (t) => pathState(path, t);
const SH = [
  { at: 0, f: fol, K: [[0, [-3.2, 1.6, -3.6, 0, 0.9, 0.2, 46]], [T2, [-3.0, 1.5, -3.0, 0, 0.9, 0.2, 46]]] },
  { at: T2, f: fol, K: [[0, [5.8, 1.5, 0.6, 0, 1.0, 0.2, 46]], [T3 - T2, [6.0, 1.6, 0.4, 0, 1.0, 0.2, 46]]] },
  { at: T3, f: fol, K: [[0, [-4.4, 1.5, 0.6, 0, 0.9, -0.2, 46]], [T4 - T3, [-4.6, 1.6, 0.2, 0, 0.9, -0.2, 46]]] },
  { at: T4, f: fol, K: [[0, [4.4, 1.9, 2.4, 0, 1.2, 0.2, 44]], [T5 - T4, [4.6, 1.9, 2.0, 0, 1.2, 0.2, 44]]] },
  { at: T5, f: fol, K: [[0, [5.0, 1.7, 0.8, 0, 1.2, 0.2, 44]], [T6 - T5, [5.2, 1.8, 0.5, 0, 1.2, 0.2, 44]]] },
  { at: T6, f: fol, K: [[0, [-5.0, 1.9, 1.6, 0, 1.0, 0, 46]], [T7 - T6, [-5.2, 2.0, 1.2, 0, 1.0, 0, 46]]] },
  { at: T7, f: fol, K: [[0, [-3, 6, 9, 0, 0.8, -4, 50]], [4, [-3, 8, 12, 0, 0.8, -6, 50]]] },
];

run("w", (t) => {
  const { id } = sceneOf(t), partA = t < T3;
  const st = ride(B, path, t, partA ? (t >= T2 ? RED : VIOLET) : GREEN, { trail: t > tA });
  // front goes light on the hard launch
  const lift = partA ? 0.32 * pulse(t, g("s2", "front") - 0.1, g("s2", "passenger") + 0.4) : 0;
  B.g.rotation.x = lift; B.g.position.y = 0.68 * Math.sin(lift);
  // passenger slides back on the hard launch; small bob forward on the gear change stays gentle
  const slide = partA ? sm(g("s2", "passenger") - 0.2, g("s2", "slides") + 0.2, t) : 0;
  const hold = id === "s4" ? sm(g("s4", "hold") - 0.1, g("s4", "hold") + 0.2, t) : id === "s5" || id === "s6" ? 1 : 0;
  Q.set({ slide, handsGlow: 0.35 * hold, knees: id === "s6" ? 0.35 * sm(T6, T6 + 0.4, t) : 0 });
  Q.headG.rotation.x = id === "s5" ? 0.08 * pulse(t, tShift - 0.1, tShift + 0.3) : 0;
  Q.mats.torso.emissive.set(partA && t >= T2 ? RED : 0x000000).multiplyScalar(0.4 + 1.4 * slide);
  B.headG.rotation.y = id === "s4" ? 1.1 * pulse(t, g("s4", "tell") - 0.2, g("s4", "go") - 0.1) : 0; // rider looks back to tell them
  tagAt(tWt, st.x, 2.6, st.z, 0, 0.7);
  tagAt(tGear, st.x, 2.5, st.z, 0, 0.6);
  const shot = shoot(SH, t);
  bloom.strength = 1.0 + 1.2 * shot.punch * shot.punch + overlays(t) + 0.3 * slide;
});
