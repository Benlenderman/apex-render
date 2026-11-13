// 77 impress-passenger: hard corner + quick start scare the passenger (tense, fights the bike), scared passenger grabs/shifts/leans wrong -> runs wide (red).
// Right way: smooth, brake early + gently, roll on slowly; ask at every stop; smooth = they want to ride again.
import { THREE, S, g, sm, flash, scene, bloom, VIOLET, ORANGE, RED, GREEN, pathState, shoot, sceneOf, run } from "./kit.js";
import { track, buildRoad, addPillion, title, endCard, cap, overlays, bikes, ride, tag, tagAt, dist } from "./extra.js";

scene.fog.density = 0.011;
const { P } = track([{ len: 120 }, { len: 50, R: -30 }, { len: 330 }, { len: 70, R: 28 }, { len: 2000 }]);
buildRoad(P, -80, 2200);
const T2 = S.s2[0], T3 = S.s3[0], T4 = S.s4[0], T5 = S.s5[0], T6 = S.s6[0];
const [Bk] = bikes(1), Q = addPillion(Bk);
const tCorner = g("s2", "corners"), tQuick = g("s2", "quicker") - 0.15, tTense = g("s2", "tense") - 0.2;
const tGrab = g("s3", "grabs"), tShift = g("s3", "shifts"), tWrong = g("s3", "wrong"), tStill = g("s3", "still");
// phase paths
const p1 = (t) => P(124 - 17 * (tCorner - t), 1.8); // hard into bend 1
const p2 = (t) => P(300 + 5 * Math.max(0, t - tQuick) ** 2, 1.8); // snap start from a stop
const wide = (t) => 1.8 + 3.4 * sm(tWrong - 0.3, tStill + 0.6, t);
const p3 = (t) => P(478 + 14 * (t - tTense), wide(t)); // bend 2, scared passenger, runs wide
// right way: smooth speed profile
const tBrake = g("s4", "brake"), tRoll = g("s4", "roll");
const vB = (t) => 13 - 5 * sm(tBrake - 0.2, tBrake + 1.6, t) + 4 * sm(tRoll, tRoll + 2.5, t);
const DB = dist(vB, T4, T5 + 1), sB0 = 104 - DB(tBrake);
const p4 = (t) => P(sB0 + DB(t), 1.8);
const p5 = () => [...P(260, 3.0), Math.PI * 0]; // stopped at the side
const DC = dist(() => 10, T6, T6 + 30);
const p6 = (t) => P(470 + DC(t), 1.8);

title("NEVER RIDE TO IMPRESS YOUR PASSENGER");
cap("s2", "harder", "HARDER CORNERS", RED, { until: ["s2", "quicker"] });
cap("s2", "quicker", "QUICKER STARTS", RED, { until: ["s2", "they"] });
cap("s2", "they", ["THEY TENSE UP", "AND FIGHT THE BIKE"], RED);
cap("s3", "a", ["A SCARED PASSENGER", "GRABS, SHIFTS, LEANS THE WRONG WAY"], RED, { until: ["s3", "right"] });
cap("s3", "right", ["RIGHT WHEN YOU", "NEED THEM STILL"], RED, { boom: 0.5 });
cap("s4", "ride", "RIDE SMOOTH", GREEN, { until: ["s4", "brake"] });
cap("s4", "brake", "BRAKE EARLY AND GENTLY", GREEN, { until: ["s4", "roll"] });
cap("s4", "roll", "ROLL ON THE THROTTLE SLOWLY", GREEN);
cap("s5", "ask", ["ASK AT EVERY STOP", "HOW IT FEELS"], GREEN);
cap("s6", "smooth", ["SMOOTH MAKES THEM", "WANT TO RIDE AGAIN"], GREEN);
endCard(["RIDE SMOOTH.", "THAT'S WHAT IMPRESSES."]);
const tTag = { tense: tag("TENSE", RED), grabs: tag("GRABS", RED), shifts: tag("SHIFTS", RED), wrong: tag("LEANS THE WRONG WAY", RED), brake: tag("BRAKE EARLY", GREEN), roll: tag("ROLL ON SLOWLY", GREEN), ask: tag("HOW DOES IT FEEL?", GREEN) };

const fol = (fn) => (t) => pathState(fn, t);
const SH = [
  { at: 0, f: fol(p1), K: [[0, [-2.6, 2.2, 6.5, 0.3, 1.1, -3, 44]], [3, [-2.9, 2.4, 7.2, 0.3, 1.1, -3, 44]]] },
  { at: tCorner - 0.6, f: fol(p1), K: [[0, [3.5, 1.2, -4.5, 0, 1.0, 0, 44]], [2, [4.2, 1.3, -3.4, 0, 1.0, 0, 44]]] },
  { at: tQuick, f: fol(p2), noRot: true, K: [[0, [5.6, 1.5, 0.9, 0, 1.25, 0, 44]], [2, [5.8, 1.6, 0.3, 0, 1.25, -0.5, 44]]] },
  { at: tTense, f: fol(p3), K: [[0, [2.6, 1.7, 3.0, 0, 1.3, -0.5, 40]], [2, [2.8, 1.8, 3.2, 0, 1.3, -0.5, 40]]] },
  { at: T3 + 0.4, f: fol(p3), K: [[0, [-2.4, 3.2, 6.5, 0.8, 0.8, -5, 46]], [5, [-2.6, 3.6, 7.5, 0.8, 0.8, -6, 46]]] },
  { at: T4, f: fol(p4), K: [[0, [-2.6, 2.3, 6.5, 0.3, 1.0, -3, 44]], [3, [-2.8, 2.4, 7, 0.3, 1.0, -3, 44]]] },
  { at: tRoll - 0.4, f: fol(p4), K: [[0, [2.3, 1.4, -3.8, 0, 1.0, 0, 44]], [3, [2.5, 1.5, -3.2, 0, 1.0, 0, 44]]] },
  { at: T5, f: () => ({ x: P(260, 3.0)[0], z: P(260, 3.0)[1], h: 0 }), K: [[0, [3.0, 1.9, -2.6, 0, 1.4, 0.3, 42]], [3, [3.3, 2.0, -2.3, 0, 1.4, 0.3, 42]]] },
  { at: T6, f: fol(p6), K: [[0, [-2.8, 2.6, 7, 0.4, 1.0, -4, 46]], [6, [-3.2, 3.2, 8.5, 0.4, 1.0, -5, 46]]] },
];
const ON = (a, b, t) => sm(a - 0.15, a + 0.1, t) * (1 - sm(b - 0.15, b, t));
run("w", (t) => {
  const { id } = sceneOf(t), A = t < T4;
  let st, pitch = 0;
  if (t < tQuick) st = ride(Bk, p1, t, RED);
  else if (t < tTense) { st = ride(Bk, p2, t, RED, { trail: false }); pitch = 0.16 * sm(tQuick, tQuick + 0.2, t) * (1 - sm(tQuick + 0.7, tTense, t)); }
  else if (A) st = ride(Bk, p3, t, RED, { lean: t > tWrong ? 0.18 * sm(tWrong, tWrong + 0.3, t) : 0 });
  else if (t < T5) st = ride(Bk, p4, t, GREEN);
  else if (t < T6) st = ride(Bk, (u) => p5(u), t, VIOLET, { still: true, trail: false });
  else st = ride(Bk, p6, t, GREEN);
  Bk.g.rotation.x = pitch; Bk.g.position.y = 0.68 * Math.sin(pitch);
  // passenger body language
  const scared = A && t > tCorner - 0.3;
  const counter = A ? (t > tTense ? 1 : t > tCorner - 0.3 ? 0.7 : 0) : 0;
  const look = A && t > tShift ? Math.sin((t - tShift) * 7) * 0.8 * (1 - sm(tStill + 0.5, T4, t)) : 0;
  const slide = t > tQuick && t < tTense ? sm(tQuick, tQuick + 0.25, t) : t > tShift && A ? 0.6 : 0;
  Q.set({ counter, look, slide, grip: "waist", handsGlow: A ? (t > tGrab - 0.1 ? 1 : 0) : id === "s6" || id === "s7" ? 0.6 : 0 });
  Q.hands.forEach((h) => h.material.color.set(A ? RED : GREEN).multiplyScalar(2.2));
  for (const k of ["torso", "legs"]) Q.mats[k].emissive.set(A ? (scared ? RED : ORANGE) : GREEN).multiplyScalar(0.35);
  if (A && t > tTense - 0.1) Q.torso.rotation.x = -0.18 + 0.25; else Q.torso.rotation.x = -0.18;
  // rider asks at the stop: head turns back
  Bk.headG.rotation.y = id === "s5" ? 1.3 * sm(g("s5", "ask") - 0.3, g("s5", "ask"), t) : 0;
  Q.headG.rotation.y = id === "s5" ? -0.4 * sm(g("s5", "how") - 0.2, g("s5", "how") + 0.2, t) : Q.headG.rotation.y;
  // brake light glows early
  Bk.tail.material.color.set(0xff2a3a).multiplyScalar(!A && t > tBrake - 0.2 && t < tRoll ? 8 : 3);
  // tags (world) above the bike
  const x = st.x, z = st.z;
  const at = { tense: 0, grabs: ON(tGrab, tShift, t), shifts: ON(tShift, tWrong, t), wrong: ON(tWrong, T4 - 0.1, t), brake: ON(tBrake, tRoll, t), roll: 0, ask: 0 };
  for (const k in tTag) tagAt(tTag[k], x, 2.05, z, at[k], k === "wrong" || k === "ask" ? 1.0 : 0.75);
  Bk.hlight.visible = !(id === "s2" || id === "s4" || id === "s5");
  const shot = shoot(SH, t);
  bloom.strength = 1.0 + 1.2 * shot.punch * shot.punch + overlays(t) + 0.6 * flash(t, tStill);
});
