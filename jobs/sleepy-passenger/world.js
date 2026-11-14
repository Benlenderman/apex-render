// 87 sleepy-passenger: the passenger nods off, grip loosens, body sways, helmet bumps the rider's, weight shifts (red).
// Right way: stop at once, real break (water, food, walk), plan more stops, a passenger just sits so tires faster (green/orange).
import { S, g, sm, flash, scene, bloom, VIOLET, ORANGE, RED, GREEN, pathState, shoot, sceneOf, run, patch } from "./kit.js";
import { track, buildRoad, addPillion, makePerson, pose, ARM, title, endCard, cap, overlays, bikes, ride, tag, tagAt, dist } from "./extra.js";

scene.fog.density = 0.008;
const V = 12, { P } = track([{ len: 3000 }]);
buildRoad(P, -80, 2900, { lamps: false });
const T2 = S.s2[0], T3 = S.s3[0], T4 = S.s4[0], T5 = S.s5[0], T6 = S.s6[0], T7 = S.s7[0];
const [Bk] = bikes(1), Q = addPillion(Bk), pR = makePerson(), pQ = makePerson();
const tSleepy = g("s1", "sleepy"), tLoose = g("s2", "loosens"), tSway = g("s2", "sway");
const tHelmet = g("s3", "helmet"), tBump = g("s3", "bumps"), tYours = g("s3", "yours"), tShift = g("s3", "shifts"), tStop = g("s3", "stop");
const tWater = g("s4", "water"), tFood = g("s4", "food"), tWalk = g("s4", "walk");
const tStops = g("s5", "stops"), tMore = g("s5", "more"), tOften = g("s5", "often");
const tSit = g("s6", "sit"), tTired = g("s6", "tired"), tBump7 = g("s7", "bumps");

// ---- path: cruise, wobble while the passenger sways, pull onto the shoulder at "stop"; ride on again in s5 ----
const kSway = (t) => sm(tSway - 0.2, tSway + 0.3, t) * (1 - sm(tStop, tStop + 0.4, t));
const wob = (t) => kSway(t) * (0.3 * Math.sin((t - tSway) * 3.2) + 0.35 * sm(tShift - 0.1, tShift + 0.2, t) * Math.sin((t - tShift) * 5));
const DA = dist((t) => V * (1 - sm(tStop - 0.1, tStop + 1.0, t)), 0, T5 + 1), stopS = 60 + DA(T5);
const tGo = T5 - 0.1, DB = dist((t) => V * sm(tGo, tGo + 1.5, t), tGo, 40);
const path = (t) => {
  if (t < tGo) { const [x, z] = P(60 + DA(t), 1.8 + wob(t) + 3.0 * sm(tStop - 0.1, tStop + 0.9, t)); return t > tStop + 1.1 ? [x, z, 0] : [x, z]; }
  return P(stopS + DB(t), 4.8 - 3.0 * sm(tGo + 0.3, tGo + 1.6, t));
};

// ---- stop markers ahead (s5): plan stops more often ----
const mk = [40, 75, 110].map(() => patch(3, 6, GREEN, 1.0));
const posAt = (s, o, m) => { const [x, z] = P(s, o); m.position.set(x, 0.03, z); };
mk.forEach((m, i) => posAt(stopS + 40 + 35 * i, 5.2, m));

title("NEVER RIDE ON WITH A SLEEPY PASSENGER");
cap("s2", "loosens", ["THEIR GRIP", "LOOSENS"], RED, { until: ["s2", "sway"] });
cap("s2", "sway", ["THEIR BODY", "STARTS TO SWAY"], RED);
cap("s3", "helmet", ["HELMET BUMPS YOURS"], RED, { until: ["s3", "weight"] });
cap("s3", "weight", ["WEIGHT SHIFTS AROUND"], RED, { until: ["s3", "stop"] });
cap("s3", "stop", "STOP.", GREEN, { boom: 0.5 });
cap("s4", "take", "TAKE A REAL BREAK", GREEN, { until: ["s4", "water"] });
cap("s4", "water", ["WATER, FOOD,", "A WALK AROUND"], GREEN);
cap("s5", "plan", ["PLAN MORE STOPS", "THAN RIDING ALONE"], GREEN);
cap("s6", "passenger", ["NOTHING TO DO", "BUT SIT"], ORANGE, { until: ["s6", "that"] });
cap("s6", "that", ["SO THEY GET", "TIRED FASTER"], ORANGE);
endCard(["HELMET BUMPS YOURS?", "TIME TO STOP."]);
const tg = { sleepy: tag("SLEEPY", ORANGE), grip: tag("LOOSE GRIP", RED), sway: tag("SWAYING", RED), bump: tag("BUMP", RED), shift: tag("SHIFTING", RED), water: tag("WATER", GREEN), food: tag("FOOD", GREEN), walk: tag("WALK", GREEN), sit: tag("JUST SITTING", ORANGE) };

const fol = (fn) => (t) => pathState(fn, t);
const cam = (s, o, y, ls, lo, ly, f) => { const [x, z] = P(s, o), [lx, lz] = P(ls, lo); return [x, y, z, lx, ly, lz, f]; };
const SH = [
  { at: 0, f: fol(path), K: [[0, [-2.6, 2.2, 6.5, 0.3, 1.1, -3, 44]], [3, [-2.9, 2.4, 7.2, 0.3, 1.1, -3, 44]]] },
  { at: tSleepy - 0.4, f: fol(path), K: [[0, [3.8, 2.6, 5.0, 0, 1.2, -0.5, 42]], [2, [4.0, 2.7, 5.4, 0, 1.2, -0.5, 42]]] },
  { at: tSway - 0.3, f: fol(path), K: [[0, [-2.4, 3.2, 6.5, 0.8, 0.8, -5, 46]], [3, [-2.6, 3.4, 7.0, 0.8, 0.8, -5, 46]]] },
  { at: tHelmet - 0.3, f: fol(path), K: [[0, [4.6, 2.2, 2.2, 0, 1.4, 0, 38]], [2, [4.8, 2.3, 2.0, 0, 1.4, 0, 38]]] },
  { at: tShift - 0.3, f: fol(path), K: [[0, [-2.6, 2.6, 6.5, 0.6, 0.9, -4, 46]], [3, [-3.0, 3.2, 8.0, 1.0, 0.8, -4, 46]]] },
  { at: T4, K: [[0, cam(stopS - 10, 1.5, 3.4, stopS + 1, 6.0, 1.1, 46)], [3, cam(stopS - 10.5, 1.3, 3.6, stopS + 1, 6.0, 1.1, 46)]] },
  { at: T5, K: [[0, cam(stopS - 16, 0, 12, stopS + 50, 4, 0, 50)], [2.5, cam(stopS - 10, -1, 16, stopS + 70, 4, 0, 50)]] },
  { at: T6, f: fol(path), K: [[0, [4.4, 2.2, 2.8, 0, 1.3, 0, 40]], [3, [4.6, 2.3, 2.6, 0, 1.3, 0, 40]]] },
  { at: T7, f: fol(path), K: [[0, [-2.8, 2.6, 7, 0.4, 1.0, -4, 46]], [3, [-3.2, 3.2, 8.5, 0.4, 1.0, -5, 46]]] },
];
const ON = (a, b, t) => sm(a - 0.15, a + 0.1, t) * (1 - sm(b - 0.15, b, t));
const pulse1 = (t, c) => Math.exp(-(((t - c) / 0.13) ** 2));

run("w", (t) => {
  const { id } = sceneOf(t), A = t < tStop, off = t > tStop + 1.2 && t < tGo;
  const hex = A ? (t < T2 ? (t > tSleepy ? ORANGE : VIOLET) : RED) : id === "s6" ? ORANGE : GREEN;
  const st = ride(Bk, path, t, hex, { still: off, trail: !off });
  // passenger: nods off, lets go, sways, helmet bumps forward
  const bump = Math.max(pulse1(t, tBump), pulse1(t, tYours), pulse1(t, tBump7));
  const sleepy = A ? sm(tSleepy - 0.3, tSleepy + 0.4, t) : id === "s6" ? sm(tTired - 0.3, tTired + 0.6, t) : id === "s7" ? 1 : 0;
  Q.set({ grip: A && t > tLoose - 0.1 ? "none" : "waist", handsGlow: A && t > tLoose - 0.1 ? 1 : 0, slide: A || id === "s7" ? bump : 0 });
  Q.g.rotation.z = (A ? kSway(t) : 0) * (0.22 * Math.sin((t - tSway) * 3.2) + 0.2 * sm(tShift - 0.1, tShift + 0.2, t) * Math.sin((t - tShift) * 5));
  Q.headG.rotation.x = -0.5 * sleepy + 0.12 * sleepy * Math.sin(t * 2.2);
  Q.hands.forEach((h) => h.material.color.set(RED).multiplyScalar(2.2));
  for (const k of ["torso", "legs"]) Q.mats[k].emissive.set(hex).multiplyScalar(0.35);
  Q.visor.material.color.set(bump > 0.3 ? RED : VIOLET).multiplyScalar(2 + 4 * bump);
  // the break: both off the bike, standing on the far shoulder
  Bk.rider.visible = !off; Q.g.visible = !off;
  const kWalk = sm(tWalk - 0.2, tWalk + 1.2, t);
  { const [x, z] = P(stopS - 0.5 + 2.5 * kWalk, 7.0); pose(pR, { x, z, h: Math.PI / 2, vis: off, hex: GREEN, armR: ARM.up * 0.8 * ON(tWater, tFood, t) }); }
  { const [x, z] = P(stopS + 1.2 + 2.5 * kWalk, 7.4); pose(pQ, { x, z, h: Math.PI / 2, vis: off, hex: GREEN, armL: ARM.up * 0.8 * ON(tFood, tWalk, t) }); }
  { const [x, z] = P(stopS - 0.5 + 2.5 * kWalk, 7.0); tagAt(tg.water, x, 2.4, z, off ? ON(tWater, tFood, t) : 0, 0.9); tagAt(tg.walk, x + 0, 2.4, z, off ? sm(tWalk - 0.1, tWalk + 0.2, t) : 0, 0.9); }
  { const [x, z] = P(stopS + 1.2 + 2.5 * kWalk, 7.4); tagAt(tg.food, x, 2.4, z, off ? ON(tFood, tWalk, t) : 0, 0.9); }
  // stop markers pop in on "stops", "more", "often"
  mk.forEach((m, i) => m.set(id === "s5" ? sm([tStops, tMore, tOften][i] - 0.1, [tStops, tMore, tOften][i] + 0.2, t) : 0));
  // tags above the bike
  const x = st.x, z = st.z, on = {
    sleepy: id === "s1" ? sm(tSleepy - 0.1, tSleepy + 0.2, t) : 0, grip: ON(tLoose, tSway, t), sway: ON(tSway, T3, t),
    bump: ON(tBump, tShift, t), shift: ON(tShift, tStop, t), sit: 0,
  };
  for (const k of ["sleepy", "grip", "sway", "bump", "shift", "sit"]) tagAt(tg[k], x, 2.15, z, on[k], k === "sit" || k === "grip" ? 0.6 : 0.65);
  const shot = shoot(SH, t);
  bloom.strength = 1.0 + 1.2 * shot.punch * shot.punch + overlays(t) + 0.5 * flash(t, tBump) + 0.4 * flash(t, tYours) + 0.4 * flash(t, tStop);
});
