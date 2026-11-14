// 89 pillion-phone: passenger films one-handed, twists round mid-corner, weight shifts, bike runs wide into the oncoming lane, car near miss (red).
// Right way: camera mount on helmet / bike set up before, or stop and take the photo standing still, both hands on, eyes over the shoulder (green).
import { THREE, S, g, sm, flash, scene, bloom, box, tube, glow, mSolid, VIOLET, ORANGE, RED, GREEN, WHITE, pathState, shoot, sceneOf, run, patch, makeCar } from "./kit.js";
import { track, buildRoad, addPillion, makePerson, pose, ARM, title, endCard, cap, overlays, bikes, ride, dist } from "./extra.js";

scene.fog.density = 0.008;
const V = 12;
const T2 = S.s2[0], T3 = S.s3[0], T4 = S.s4[0], T5 = S.s5[0], T6 = S.s6[0], T7 = S.s7[0];
const tFilm = g("s1", "film"), tPhone = g("s2", "phone"), tTwist = g("s2", "twist"), tWeight = g("s2", "weight"), tCorner = g("s2", "mid");
const tEvery = g("s3", "every"), tFeels = g("s3", "feels"), tMount = g("s4", "mount"), tHelmet = g("s4", "helmet"), tBikeW = g("s4", "bike"), tBefore = g("s4", "before");
const tStop = g("s5", "stop"), tPhoto = g("s5", "photo"), tStill = g("s5", "still"), tBoth = g("s6", "both"), tEyes = g("s6", "eyes");

// ---- track: straight, right bend entered on "twist", long straight after ----
const s0 = 60, sC = s0 + V * (tTwist - 0.4), RB = 30, LB = 40;
const { P } = track([{ len: sC }, { len: LB, R: -RB }, { len: 4000 }]);
buildRoad(P, -80, sC + LB + 3000, { lamps: false });
const [Bk] = bikes(1), Q = addPillion(Bk), car = makeCar({ driver: true }), pR = makePerson(), pQ = makePerson();

// ---- phone arm (replaces the right waist arm while filming) ----
const mPh = glow(WHITE, 2.0);
const armG = new THREE.Group(); armG.position.set(0.21, 0.54, 0); Q.g.add(armG);
armG.add(tube([0, 0, 0], [0, -0.55, 0], 0.08, mSolid));
const phone = box(0.1, 0.18, 0.03, 0, -0.62, 0, mPh, false); armG.add(phone);
// helmet cam + bike cam (right way)
const mCam = glow(GREEN, 1.6);
const hCam = box(0.1, 0.08, 0.14, 0, 0.17, -0.02, mCam, false); Q.headG.add(hCam);
const bCam = box(0.1, 0.09, 0.14, 0.2, 0.2, 0.02, mCam, false); Bk.fork.add(bCam);
// standing passenger's phone
const sPh = box(0.1, 0.18, 0.03, 0, -0.7, -0.06, mPh, false); pQ.armR.add(sPh);

// ---- paths ----
// A: rides into the bend; weight shift pushes it wide over the centre line toward the car, then back
const wide = (t) => 3.6 * sm(tWeight - 0.1, tWeight + 0.7, t) * (1 - sm(tWeight + 1.4, T3 + 0.8, t));
const wob = (t) => 0.25 * sm(tEvery - 0.2, tEvery + 0.3, t) * Math.sin((t - tEvery) * 7) * (1 - sm(T4 - 0.4, T4, t));
const aPath = (t) => P(s0 + V * t, 1.8 - wide(t) + wob(t));
// oncoming car in the left lane, passes the bike just after "weight"
const tPass = tWeight + 0.9, carPath = (t) => (t > T2 && t < T4 ? P(s0 + V * tPass - 12 * (t - tPass) + 3, -1.8) : null);
// B: rides from sB, pulls onto the shoulder at "stop", sets off again at s6
const sB = sC + LB + 1200, DA = dist((t) => V * (1 - sm(tStop - 0.1, tStop + 0.5, t)), T4, T6 + 1), stopS = sB + DA(T6 - 0.2);
const tGo = T6 - 0.1, DG = dist((t) => V * sm(tGo, tGo + 1.2, t), tGo, T7 + 10);
const bPath = (t) => {
  if (t < tGo) { const [x, z] = P(sB + DA(t), 1.8 + 3.0 * sm(tStop - 0.1, tStop + 0.5, t)); return t > tStop + 0.55 ? [x, z, 0] : [x, z]; }
  return P(stopS + DG(t), 4.8 - 3.0 * sm(tGo + 0.2, tGo + 1.4, t));
};
const lane = patch(3.4, 10, RED, 1.1);
{ const [x, z] = P(s0 + V * tPass, -1.8); lane.position.set(x, 0.03, z); lane.rotation.z = 0; }

title("NEVER LET YOUR PASSENGER FILM IN A CORNER");
cap("s2", "one", ["ONE HAND", "ON A PHONE"], RED, { until: ["s2", "twist"] });
cap("s2", "twist", ["THEY TWIST ROUND", "FOR THE SHOT"], RED, { until: ["s2", "weight"] });
cap("s2", "weight", ["WEIGHT SHIFTS", "MID-CORNER"], RED, { boom: 0.4 });
cap("s3", "every", ["EVERY MOVE THEY MAKE,", "THE BIKE FEELS"], RED);
cap("s4", "camera", ["CAMERA MOUNT ON", "THE HELMET"], GREEN, { until: ["s4", "bike"] });
cap("s4", "bike", ["OR ON THE BIKE"], GREEN, { until: ["s4", "before"] });
cap("s4", "before", ["SET UP", "BEFORE YOU GO"], GREEN);
cap("s5", "stop", ["OR STOP"], GREEN, { until: ["s5", "photo"] });
cap("s5", "photo", ["TAKE THE PHOTO", "STANDING STILL"], GREEN);
cap("s6", "both", ["BOTH HANDS ON"], GREEN, { until: ["s6", "eyes"] });
cap("s6", "eyes", ["EYES OVER", "YOUR SHOULDER"], GREEN);
endCard(["MOUNT THE CAMERA.", "HANDS STAY ON."]);

const fol = (fn) => (t) => pathState(fn, t);
const cam = (s, o, y, ls, lo, ly, f) => { const [x, z] = P(s, o), [lx, lz] = P(ls, lo); return [x, y, z, lx, ly, lz, f]; };
const sP = s0 + V * tPass;
const SH = [
  { at: 0, f: fol(aPath), K: [[0, [3.0, 2.2, 6.0, 0, 1.0, -2, 44]], [3, [3.3, 2.4, 6.8, 0, 1.0, -2, 44]]] },
  { at: tPhone - 0.3, f: fol(aPath), K: [[0, [3.8, 1.9, 2.4, 0, 1.2, 0.3, 44]], [2, [4.0, 2.0, 2.2, 0, 1.2, 0.3, 44]]] },
  { at: tWeight - 0.3, K: [[0, cam(sP - 22, 4.5, 7, sP - 2, -0.5, 0.5, 48)], [3, cam(sP - 18, 5, 8, sP + 2, -0.5, 0.5, 48)]] },
  { at: T3 + 0.2, f: fol(aPath), K: [[0, [-3.4, 2.0, 3.0, 0, 1.1, 0.2, 42]], [3, [-3.6, 2.1, 2.8, 0, 1.1, 0.2, 42]]] },
  { at: T4, f: fol(bPath), K: [[0, [3.4, 2.0, 2.4, 0, 1.3, 0.2, 42]], [3, [3.6, 2.1, 2.2, 0, 1.3, 0.2, 42]]] },
  { at: T5, K: [[0, cam(stopS - 9, 1.5, 3.0, stopS + 1, 6.0, 1.2, 44)], [3, cam(stopS - 9.5, 1.3, 3.2, stopS + 1, 6.0, 1.2, 44)]] },
  { at: T6 + 0.2, f: fol(bPath), K: [[0, [2.8, 2.0, 3.2, 0, 1.3, 0.2, 42]], [3, [3.0, 2.1, 3.0, 0, 1.3, 0.2, 42]]] },
  { at: T7, f: fol(bPath), K: [[0, [-2.8, 2.6, 7, 0.4, 1.0, -4, 46]], [3, [-3.2, 3.2, 8.5, 0.4, 1.0, -5, 46]]] },
];

run("w", (t) => {
  const { id } = sceneOf(t), A = t < T4, off = !A && t > tStop + 0.6 && t < tGo;
  const hex = A ? (t < T2 ? (t > tFilm ? ORANGE : VIOLET) : RED) : GREEN;
  const st = ride(Bk, A ? aPath : bPath, t, hex, { still: off, trail: !off });
  Bk.rider.visible = !off; Q.g.visible = !off;
  // passenger: phone up (A), twists round, weight shifts against the lean
  const twist = A ? sm(tTwist - 0.2, tTwist + 0.4, t) * (1 - sm(T3 + 1.2, T4 - 0.2, t)) : 0;
  const shift = A ? sm(tWeight - 0.2, tWeight + 0.3, t) * (1 - sm(T3 + 0.5, T4 - 0.2, t)) : 0;
  const move = A && id === "s3" ? Math.sin((t - tEvery) * 5) : 0;
  Q.set({ grip: "waist", look: A ? twist + 0.6 * move : id === "s6" && t > tEyes - 0.2 ? 0.25 : 0, handsGlow: !A && id !== "s5" ? 0.6 * sm(tBoth - 0.2, tBoth + 0.2, t) : 0 });
  Q.g.rotation.z += A ? 0.35 * shift + 0.18 * move : 0;
  const phoneOn = A && t > tFilm - 0.2;
  Q.g.children[9].visible = Q.g.children[9].visible && !phoneOn;
  armG.visible = phoneOn;
  armG.rotation.set(-0.9 + 0.9 * twist, 0, 1.2 + 0.9 * twist);
  mPh.color.set(t > T2 ? RED : WHITE).multiplyScalar(2.2);
  Q.hands.forEach((h) => h.material.color.set(GREEN).multiplyScalar(2.2));
  for (const k of ["torso", "legs"]) Q.mats[k].emissive.set(hex).multiplyScalar(0.35);
  hCam.visible = !A && t > tHelmet - 0.15; bCam.visible = !A && t > tBikeW - 0.15;
  mCam.color.set(GREEN).multiplyScalar(1.4 + 2 * flash(t, tHelmet) + 2 * flash(t, tBikeW));
  car.set(pathState(carPath, t));
  lane.set(A ? sm(tWeight, tWeight + 0.4, t) * (1 - sm(T3 + 0.6, T3 + 1, t)) : 0);
  // stop: both stand on the shoulder, the passenger takes the photo
  { const [x, z] = P(stopS - 0.5, 7.0); pose(pR, { x, z, h: Math.PI / 2, vis: off, hex: GREEN }); }
  { const [x, z] = P(stopS + 1.4, 7.2); pose(pQ, { x, z, h: Math.PI / 2 + 0.6, vis: off, hex: GREEN, armR: ARM.out * sm(tPhoto - 0.4, tPhoto, t) }); }
  sPh.visible = off;
  const shot = shoot(SH, t);
  bloom.strength = 1.0 + 1.2 * shot.punch * shot.punch + overlays(t) + 0.5 * flash(t, tPass) + 0.3 * flash(t, tStop);
});
