// 73 tailgate: a car sits close behind a bike; the bike stops shorter, the car hits the rider; the rider also brakes for a pothole/gravel the driver can't see.
// Right way: at least 3 seconds behind a bike, counted from a sign; double it (6 s) in the rain; room for the rider to save themselves.
import { THREE, S, g, sm, flash, scene, bloom, camera, box, glow, patch, makeCar, VIOLET, ORANGE, RED, GREEN, WHITE, pathState, shoot, sceneOf, run } from "./kit.js";
import { track, buildRoad, title, endCard, cap, overlays, bikes, ride, downLean, dist, tag, tagAt } from "./extra.js";

scene.fog.density = 0.008;
const { P } = track([{ len: 4000 }]);
buildRoad(P, -80, 3000);
const END = S.s8[0] + S.s8[1], T3 = S.s3[0], T4 = S.s4[0];
const at = (s, o) => P(s, o), O = 1.8;
const [Bk] = bikes(1), CARa = makeCar({ color: 0xc8324a }), CARb = makeCar({ color: 0x5246c8 });
// ---- rain (copied from first-rain) ----
function makeRain(n = 1400) {
  const pos = new Float32Array(n * 6), seed = new Float32Array(n * 3);
  for (let i = 0; i < n; i++) { const r = (k) => { const x = Math.sin(i * 127.1 + k * 311.7) * 43758.5453; return x - Math.floor(x); }; seed.set([r(1), r(2), r(3)], i * 3); }
  const geo = new THREE.BufferGeometry(); geo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
  const mat = new THREE.LineBasicMaterial({ color: 0xbfd8ff, transparent: true, opacity: 0.5, toneMapped: false, depthWrite: false, fog: false });
  const m = new THREE.LineSegments(geo, mat); m.frustumCulled = false; scene.add(m);
  return { update(t, on, len = 0.5) {
    m.visible = on > 0.01; if (!m.visible) return;
    const c = camera.position, B = 14, H = 9, cnt = Math.floor(n * Math.min(1, on));
    for (let i = 0; i < n; i++) {
      if (i >= cnt) { pos.fill(0, i * 6, i * 6 + 6); continue; }
      const x = c.x + (seed[i * 3] - 0.5) * 2 * B, z = c.z + (seed[i * 3 + 2] - 0.5) * 2 * B;
      const y = c.y - 3 + ((((seed[i * 3 + 1] * H - t * 11) % H) + H) % H);
      pos.set([x, y, z, x + 0.05, y - len, z], i * 6);
    }
    geo.attributes.position.needsUpdate = true;
  } };
}
const rain = makeRain(1400);

// ---- A (s1-s2): tailgating at 0.5 s; bike brakes hard and stops shorter; the car hits the rider ----
const tBr = g("s2", "brakes"), V0 = 12;
const vB = (t) => (t < tBr ? V0 : Math.max(0, V0 - 9 * (t - tBr)));
const vC = (t) => (t < tBr + 0.55 ? V0 : Math.max(0, V0 - 6.5 * (t - tBr - 0.55)));
const dB = dist(vB, 0, T3), dC = dist(vC, 0, T3);
const sB0 = 60, GAP = 6.5;
let tHit = T3; for (let t = tBr; t < T3; t += 0.005) if (sB0 + dB(t) - (sB0 - GAP + dC(t)) < 3.1) { tHit = t; break; }
const aB = (t) => (t < tHit ? sB0 + dB(t) : sB0 + dB(tHit) + 3.2 * sm(tHit, tHit + 0.9, t));
const aC = (t) => (t < tHit ? sB0 - GAP + dC(t) : sB0 - GAP + dC(tHit) + 0.8 * sm(tHit, tHit + 0.5, t));
// ---- s3: still too close; the rider brakes for a pothole/gravel the driver can't see ----
const tPot = g("s3", "pothole"), S3B = 600;
const vB3 = (t) => V0 - 5 * sm(tPot - 0.3, tPot + 0.2, t) * (1 - sm(tPot + 0.9, tPot + 1.6, t));
const vC3 = (t) => V0 - 5 * sm(tPot + 0.25, tPot + 0.75, t) * (1 - sm(tPot + 1.1, tPot + 1.8, t));
const dB3 = dist(vB3, T3, T4), dC3 = dist(vC3, T3, T4);
const sPot = S3B + dB3(tPot + 0.35) + 1.4; // pothole just ahead of where the bike swerves
const pot = new THREE.Mesh(new THREE.CircleGeometry(0.55, 20), new THREE.MeshBasicMaterial({ color: 0x020108 })); pot.rotation.x = -Math.PI / 2;
{ const [x, z] = at(sPot, O + 0.1); pot.position.set(x, 0.02, z); scene.add(pot); }
const gravel = new THREE.Group(); scene.add(gravel);
for (let i = 0; i < 40; i++) { const r = (k) => { const x = Math.sin(i * 91.7 + k * 37.3) * 43758.5; return x - Math.floor(x); }; const [x, z] = at(sPot + 3 + r(1) * 3, O - 0.8 + r(2) * 1.8); gravel.add(box(0.07, 0.04, 0.07, x, 0.03, z, glow(0x8a80b0, 0.6), false)); }
const tagPot = tag("POTHOLE", RED), tagGrav = tag("GRAVEL", RED);
// ---- B (s4-s7): 3 s gap at 10 m/s, counted from a sign; in the rain it opens to 6 s; s6 the rider stops hard with room ----
const V1 = 10, tCount = g("s4", "count") + 0.1, sSign = 2000;
const tRain = g("s5", "rain"), tRoom = g("s6", "room");
const vB4 = (t) => (t < tRoom ? V1 : Math.max(0, V1 - 8 * (t - tRoom)));
const dB4 = dist(vB4, tCount, END);
const bB = (t) => sSign + dB4(t);
const gapS = (t) => 3 + 3 * sm(tRain, tRain + 1.8, t); // seconds
const tCB = tRoom + 0.6; // driver reacts 0.6 s after the bike brakes
const bC = (t) => { const u = Math.min(t, tCB), d = Math.max(0, t - tCB), ts = V1 / 6; return sSign + V1 * (u - tCount) - V1 * gapS(u) + (d < ts ? V1 * d - 3 * d * d : V1 * ts / 2); };
const sign = new THREE.Group(); scene.add(sign);
{ const [x, z] = at(sSign, 4.3); sign.position.set(x, 0, z); sign.add(box(0.1, 2.2, 0.1, 0, 1.1, 0, glow(VIOLET, 1.2), false), box(0.9, 0.6, 0.06, 0, 2.3, 0, glow(ORANGE, 1.4), true)); }
const nums = ["1", "2", "3"].map((s) => tag(s, GREEN, 2.2)), six = tag("6 SECONDS", GREEN), three = tag("3 SECONDS", GREEN);
const zone = patch(1.6, 1, GREEN, 1.2), redZ = patch(1.6, 1, RED, 1.4);

title("NEVER TAILGATE A MOTORCYCLE");
cap("s2", "bike", ["A BIKE CAN OFTEN STOP", "SHORTER THAN YOUR CAR"], RED, { until: ["s2", "if"] });
cap("s2", "if", ["IT BRAKES HARD,", "YOU HIT THE RIDER"], RED, { boom: 0.6 });
cap("s3", "pothole", ["A POTHOLE OR GRAVEL", "YOU CAN'T EVEN SEE"], RED);
cap("s4", "leave", ["AT LEAST 3 SECONDS", "BEHIND A BIKE"], GREEN, { until: ["s4", "count"] });
cap("s4", "count", ["COUNT FROM WHEN", "IT PASSES A SIGN"], GREEN);
cap("s5", "rain", ["IN THE RAIN,", "DOUBLE IT"], GREEN);
cap("s6", "give", ["GIVE THEM ROOM,", "THEY HAVE ROOM TO", "SAVE THEMSELVES"], GREEN);
endCard(["THREE SECONDS BEHIND A BIKE.", "SIX IN THE RAIN."]);

const fol = (fn) => (t) => pathState(fn, t);
const pB = (t) => (t < T3 ? at(aB(t), O) : t < T4 ? at(S3B + dB3(t) , O + 0.6 * sm(tPot - 0.4, tPot + 0.1, t) * (1 - sm(tPot + 0.5, tPot + 1.2, t))) : at(bB(t), O));
const pC = (t) => (t < T3 ? at(aC(t), O) : t < T4 ? at(S3B - GAP + dC3(t), O) : at(bC(t), O));
const mid = (t) => { const a = pB(t), b = pC(t); return [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2]; };
const SH = [
  { at: 0, f: fol(pC), noRot: true, K: [[0, [-3.5, 3.4, 8, 0.5, 1.0, -7, 46]], [3, [-4, 3.8, 9, 0.5, 1.0, -7, 46]]] },
  { at: tBr - 0.6, f: fol(mid), noRot: true, K: [[0, [-7, 2.6, 2, 0, 0.8, -0.5, 44]], [3, [-7.5, 2.8, 3, 0, 0.8, -0.5, 44]]] },
  { at: T3, f: fol(pC), noRot: true, K: [[0, [-1.6, 4.2, 9, 0.6, 0.8, -12, 46]], [1, [-1.6, 4.2, 9, 0.6, 0.8, -12, 46]]] },
  { at: tPot - 0.25, f: fol(pB), noRot: true, K: [[0, [-3, 6, 6, 0.3, 0.4, -2.5, 50]], [2.5, [-3.2, 6.4, 6.5, 0.3, 0.4, -2.5, 50]]] },
  { at: T4, f: fol(pC), noRot: true, K: [[0, [-2.5, 6, 9, 0.8, 0, -22, 50]], [4, [-2.5, 6.5, 10, 0.8, 0, -24, 50]]] },
  { at: tRain, f: fol(pC), noRot: true, K: [[0, [-2.5, 6.5, 10, 0.8, 0, -24, 50]], [2.5, [-3, 10, 13, 0.8, 0, -40, 50]]] },
  { at: S.s6[0], f: fol(pC), noRot: true, K: [[0, [-3, 10, 13, 0.8, 0, -40, 50]], [3, [-3, 10.5, 14, 0.8, 0, -42, 50]]] },
];
run("w", (t) => {
  const { id } = sceneOf(t), A = t < T4;
  const hB = A ? RED : VIOLET;
  // bike
  if (t < T3) { const k = sm(tHit, tHit + 0.35, t); ride(Bk, pB, t, RED, k > 0 ? { lean: downLean(k, -1), down: k } : {}); }
  else ride(Bk, pB, t, hB);
  // car
  const cs = pathState(pC, t); CARa.set(A ? cs : null); CARb.set(A ? null : cs);
  // gap zone on the road between car nose and bike tail
  const b = pathState(pB, t), sb = -b.z - 1.0, sc = -cs.z + 2.2, L = Math.max(0.1, sb - sc);
  const zz = (s) => at(s, O);
  for (const [m, on] of [[redZ, A && t < tHit ? 1 : 0], [zone, A ? 0 : 1]]) { const [x, z] = zz((sb + sc) / 2); m.position.set(x, 0.03, z); m.scale.set(1, L, 1); m.set(on); }
  // pothole / gravel tags
  const pa = id === "s3" ? sm(tPot - 0.1, tPot + 0.2, t) : 0, ga = id === "s3" ? sm(g("s3", "gravel") - 0.1, g("s3", "gravel") + 0.2, t) : 0;
  // small labels beside the road (not over the lane), fading before the bike reaches them
  { const sb3 = -pathState(pB, t).z, fade = (s0) => 1 - sm(s0 - 6, s0 - 3, sb3);
    const [x, z] = at(sPot, O + 3.4); tagAt(tagPot, x, 1.0, z, pa * fade(sPot), 0.85); const [x2, z2] = at(sPot + 4.5, O + 3.4); tagAt(tagGrav, x2, 1.0, z2, ga * fade(sPot + 4.5), 0.85); }
  // count 1-2-3 from the sign
  const [sx, sz] = at(sSign, 4.3);
  nums.forEach((m, i) => { const T = tCount + 0.25 + 0.45 * i; /* 1-2-3 ticks before the cut */ tagAt(m, sx, 3.4 + 0.9 * i, sz, id === "s4" || id === "s5" ? sm(T - 0.1, T + 0.1, t) * (1 - sm(tRain - 0.3, tRain, t)) : 0, 2.4); });
  const [mx, mz] = mid(t);
  tagAt(three, mx + 0.8, 3.2, mz, !A && t > tCount + 3 ? sm(tCount + 3, tCount + 3.3, t) * (1 - sm(tRain, tRain + 0.3, t)) : 0, 6);
  tagAt(six, mx + 0.8, 4.5, mz, t > tRain ? sm(tRain + 1.5, tRain + 1.9, t) * (id === "s7" ? 1 : 1) : 0, 7);
  rain.update(t, t > tRain ? sm(tRain - 0.2, tRain + 0.4, t) : 0, 0.7);
  const shot = shoot(SH, t);
  bloom.strength = 1.0 + 1.2 * shot.punch * shot.punch + overlays(t) + (t < T3 ? 0.9 * flash(t, tHit) : 0) + (id === "s3" ? 0.4 * flash(t, tPot) : 0);
});
