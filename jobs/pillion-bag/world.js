// 88 pillion-bag: passenger rides one-handed holding a shopping bag, the bag swings into the rear wheel, bike goes down (red).
// Right way: luggage strapped to the bike or a tight backpack, both hands on the rider or grab rails, nothing loose, even round the block (green).
import { THREE, S, g, sm, flash, scene, bloom, box, tube, glow, mSolid, VIOLET, ORANGE, RED, GREEN, pathState, shoot, sceneOf, run, patch } from "./kit.js";
import { track, buildRoad, addPillion, makePerson, pose, title, endCard, cap, overlays, bikes, ride, tag, tagAt, dist, downLean } from "./extra.js";

scene.fog.density = 0.008;
const V = 12;
const T2 = S.s2[0], T3 = S.s3[0], T4 = S.s4[0], T5 = S.s5[0], T6 = S.s6[0], T7 = S.s7[0];
const tBag = g("s1", "bag"), tOne = g("s2", "one"), tNot = g("s2", "not"), tLoose = g("s2", "loose"), tSwing = g("s2", "swing"), tWheel = g("s2", "wheel");
const tStrap = g("s3", "strap"), tPack = g("s3", "backpack"), tBoth = g("s4", "both"), tRails = g("s4", "rails");
const tHangs = g("s5", "hangs"), tStraps = g("s5", "straps"), tShop = g("s5", "shopping"), tEvery = g("s6", "every"), tBlock = g("s6", "block");

// ---- track: long straight, then a left bend "round the block" reached on "round" in s6 ----
const sB = 1500, DB = dist(() => V, T3, T7 + 10), sBend = sB + DB(g("s6", "round") - 0.3);
const { P } = track([{ len: sBend }, { len: 14 * Math.PI / 2, R: 14 }, { len: 600 }]);
buildRoad(P, -80, sBend + 22 + 600, { lamps: false });
const [Bk] = bikes(1), Q = addPillion(Bk), lie1 = makePerson(), lie2 = makePerson();

// ---- passenger's right arm hangs down holding a bag (replaces the right waist arm while bagOn) ----
const armG = new THREE.Group(); armG.position.set(0.21, 0.54, 0); Q.g.add(armG);
armG.add(tube([0, 0, 0], [0.13, -0.44, 0.03], 0.08, mSolid));
const hand = new THREE.Mesh(new THREE.SphereGeometry(0.08, 10, 8), glow(RED, 2.2)); hand.position.set(0.13, -0.44, 0.03); armG.add(hand);
const piv = new THREE.Group(); piv.position.copy(hand.position); armG.add(piv);
const mBag = glow(ORANGE, 1.3);
piv.add(box(0.26, 0.32, 0.12, 0, -0.3, 0, mBag), tube([-0.07, -0.14, 0], [0, 0, 0], 0.025, mBag), tube([0.07, -0.14, 0], [0, 0, 0], 0.025, mBag));
// ---- right way: strapped top box + tight backpack ----
const mStrap = glow(GREEN, 1.1);
const topBox = new THREE.Group(); Bk.lean.add(topBox);
topBox.add(box(0.5, 0.34, 0.4, 0, 1.06, 1.12), box(0.54, 0.04, 0.06, 0, 1.24, 1.02, mStrap, false), box(0.54, 0.04, 0.06, 0, 1.24, 1.22, mStrap, false),
  box(0.04, 0.36, 0.06, -0.27, 1.06, 1.02, mStrap, false), box(0.04, 0.36, 0.06, 0.27, 1.06, 1.02, mStrap, false), box(0.04, 0.36, 0.06, -0.27, 1.06, 1.22, mStrap, false), box(0.04, 0.36, 0.06, 0.27, 1.06, 1.22, mStrap, false));
const pack = new THREE.Group(); pack.position.set(0, 0.36, 0.2); pack.rotation.x = -0.18; Q.g.add(pack);
pack.add(box(0.34, 0.4, 0.14, 0, 0, 0), box(0.05, 0.42, 0.05, -0.12, 0, -0.08, mStrap, false), box(0.05, 0.42, 0.05, 0.12, 0, -0.08, mStrap, false));
// ---- s5: a loose strap flapping off the top box, then gone ----
const flap = new THREE.Group(); flap.position.set(0.25, 0.92, 1.12); Bk.lean.add(flap);
flap.add(tube([0, 0, 0], [0.05, -0.45, 0.1], 0.04, glow(RED, 2.4)));

// ---- paths: A rides, wobbles when the bag swings, goes down; B rides from sB to the bend and on ----
const tHit = tWheel, tDown = tHit + 0.35;
const DA = dist((t) => V * (1 - sm(tHit, tHit + 1.4, t)), 0, T3 + 1), stopA = 60 + DA(T3);
const aPath = (t) => { const [x, z] = P(60 + DA(t), 1.8 + 0.25 * sm(tSwing, tHit, t) * Math.sin((t - tSwing) * 9) + 0.8 * sm(tHit, tHit + 1.2, t)); return t > tHit + 1.4 ? [x, z, 0] : [x, z]; };
const bPath = (t) => P(sB + DB(t), 1.8);
const path = (t) => (t < T3 ? aPath(t) : bPath(t));
const kDown = (t) => sm(tHit + 0.1, tDown + 0.3, t);
const redZ = patch(5, 6, RED, 1.1);
{ const [x, z] = P(stopA - 1, 2.6); redZ.position.set(x, 0.03, z); }

title("NEVER LET YOUR PASSENGER HOLD A BAG");
cap("s2", "one", ["ONE HAND ON A BAG"], RED, { until: ["s2", "not"] });
cap("s2", "not", ["ONE HAND", "NOT HOLDING ON"], RED, { until: ["s2", "loose"] });
cap("s2", "loose", ["A LOOSE BAG SWINGS", "INTO THE WHEEL"], RED, { boom: 0.3 });
cap("s3", "strap", ["STRAP THE LUGGAGE", "TO THE BIKE"], GREEN, { until: ["s3", "backpack"] });
cap("s3", "backpack", ["OR A BACKPACK", "WORN TIGHT"], GREEN);
cap("s4", "both", ["BOTH HANDS", "HOLD YOU"], GREEN, { until: ["s4", "rails"] });
cap("s4", "rails", ["OR THE GRAB RAILS"], GREEN);
cap("s5", "nothing", ["NOTHING HANGS LOOSE"], GREEN, { until: ["s5", "straps"] });
cap("s5", "straps", ["NO STRAPS,", "NO SHOPPING BAGS"], RED);
cap("s6", "both", ["BOTH HANDS,", "EVERY RIDE"], GREEN, { until: ["s6", "even"] });
cap("s6", "even", ["EVEN ROUND", "THE BLOCK"], GREEN);
endCard(["BOTH HANDS ON.", "BAGS STRAPPED DOWN."]);
const tg = { free: tag("NOT HOLDING ON", RED), wheel: tag("INTO THE WHEEL", RED), box: tag("STRAPPED", GREEN), pack: tag("WORN TIGHT", GREEN), both: tag("BOTH HANDS", GREEN) };

const fol = (fn) => (t) => pathState(fn, t);
const cam = (s, o, y, ls, lo, ly, f) => { const [x, z] = P(s, o), [lx, lz] = P(ls, lo); return [x, y, z, lx, ly, lz, f]; };
const SH = [
  { at: 0, f: fol(path), K: [[0, [3.0, 2.2, 6.0, 0, 1.0, -2, 44]], [3, [3.3, 2.4, 6.8, 0, 1.0, -2, 44]]] },
  { at: tBag - 0.3, f: fol(path), K: [[0, [4.2, 1.8, 2.0, 0, 0.95, 0.4, 44]], [2.5, [4.4, 1.9, 1.8, 0, 0.95, 0.4, 44]]] },
  { at: tLoose - 0.3, f: fol(path), K: [[0, [3.2, 1.2, 3.0, 0, 0.75, 0.5, 44]], [1.5, [3.4, 1.3, 2.8, 0, 0.75, 0.5, 44]]] },
  { at: tHit + 0.5, K: [[0, cam(stopA - 12, 6, 4.5, stopA, 2, 0.4, 46)], [3, cam(stopA - 13, 6.5, 5, stopA, 2, 0.4, 46)]] },
  { at: T3, f: fol(path), K: [[0, [3.6, 2.0, 2.4, 0, 1.1, 0.6, 40]], [3, [3.8, 2.1, 2.1, 0, 1.1, 0.6, 40]]] },
  { at: tPack - 0.3, f: fol(path), K: [[0, [-2.4, 2.0, 3.4, 0, 1.3, 0.4, 40]], [3, [-2.6, 2.1, 3.2, 0, 1.3, 0.4, 40]]] },
  { at: T4, f: fol(path), K: [[0, [3.2, 1.9, 1.8, 0, 1.2, 0.3, 38]], [3, [3.4, 2.0, 1.6, 0, 1.2, 0.3, 38]]] },
  { at: T5, f: fol(path), K: [[0, [2.8, 1.4, 3.4, 0, 0.9, 0.8, 42]], [3, [3.0, 1.5, 3.2, 0, 0.9, 0.8, 42]]] },
  { at: T6, f: fol(path), K: [[0, [-3, 3, 7, 0.4, 1.0, -4, 46]], [2, [-3.2, 3.4, 8, 0.4, 1.0, -4, 46]]] },
  { at: g("s6", "round") - 0.6, K: [[0, cam(sBend - 14, 10, 14, sBend + 8, -6, 0, 50)], [3, cam(sBend - 12, 10, 15, sBend + 10, -8, 0, 50)]] },
  { at: T7, f: fol(path), K: [[0, [-2.8, 2.6, 7, 0.4, 1.0, -4, 46]], [3, [-3.2, 3.2, 8.5, 0.4, 1.0, -5, 46]]] },
];
const ON = (a, b, t) => sm(a - 0.15, a + 0.1, t) * (1 - sm(b - 0.15, b, t));

run("w", (t) => {
  const { id } = sceneOf(t), A = t < T3, kd = A ? kDown(t) : 0;
  const hex = A ? (t < T2 ? (t > tBag ? ORANGE : VIOLET) : RED) : GREEN;
  const st = ride(Bk, A ? aPath : bPath, t, hex, { lean: A ? downLean(kd, 1) : 0, still: A && t > tHit + 1.4, trail: !(A && t > tHit + 1.2) });
  const down = kd > 0.5;
  Bk.rider.visible = !down; Q.g.visible = !down;
  // passenger: bag in the right hand (A), both hands on in B (waist, then rails on "rails")
  const bagOn = A;
  Q.set({ grip: !A && t > tRails - 0.1 && id === "s4" ? "rails" : "waist", handsGlow: !A && id !== "s5" ? 0.6 * sm(tBoth - 0.2, tBoth + 0.2, t) : 0 });
  Q.g.children[9].visible = Q.g.children[9].visible && !bagOn; // right waist arm gone while holding the bag
  if (Q.g.children[11].visible) Q.g.children[11].visible = true;
  armG.visible = bagOn;
  hand.material.color.set(RED).multiplyScalar(t > tNot - 0.2 ? 2.4 + 1.5 * Math.sin(t * 8) ** 2 : 0.0001);
  hand.visible = t > tNot - 0.2;
  const sw = sm(tLoose - 0.2, tSwing, t) * Math.sin((t - tLoose) * 5) * 0.5;
  piv.rotation.set(0.25 * Math.sin(t * 3) + sw, 0, -0.9 * sm(tSwing, tHit, t) + 0.15 * Math.sin(t * 4));
  mBag.color.set(t > T2 ? RED : ORANGE).multiplyScalar(t > tHit - 0.1 && t < tHit + 0.3 ? 4 : 1.4);
  for (const k of ["torso", "legs"]) Q.mats[k].emissive.set(hex).multiplyScalar(0.35);
  topBox.visible = !A && t > tStrap - 0.15; pack.visible = !A && t > tPack - 0.15;
  flap.visible = id === "s5" && t > tHangs - 0.1 && t < tShop + 0.4; flap.rotation.set(0.5 * Math.sin(t * 13), 0, 0.3 * Math.sin(t * 9));
  // crash: both down on the road
  const [lx, lz] = P(stopA + 1.5, 3.2), [lx2, lz2] = P(stopA - 1.5, 0.6);
  pose(lie1, { x: lx, z: lz, h: 0.4, lie: 1, vis: A && down, hex: RED });
  pose(lie2, { x: lx2, z: lz2, h: -0.6, lie: 1, vis: A && down, hex: RED });
  redZ.set(A ? sm(tDown, tDown + 0.5, t) : 0);
  // tags
  const x = st.x, z = st.z;
  tagAt(tg.both, x, 2.2, z, id === "s6" ? ON(T6 + 0.1, g("s6", "round") - 0.6, t) : 0, 1.0);
  const shot = shoot(SH, t);
  bloom.strength = 1.0 + 1.2 * shot.punch * shot.punch + overlays(t) + 0.6 * flash(t, tHit) + 0.4 * flash(t, tDown);
});
