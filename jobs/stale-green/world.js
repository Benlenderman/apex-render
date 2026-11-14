// 117 stale-green: wrong = the light far ahead has been green a while, the rider speeds up to make it, it turns red and an
// oncoming car turns left across his lane; he hits its side (red). Right = old green: ease off, cover the brakes, watch the
// car waiting to turn, light turns yellow and he stops calmly while the car turns across (green).
import { THREE, S, g, sm, flash, scene, bloom, box, glow, beam, makeCar, VIOLET, ORANGE, RED, GREEN, WHITE, pathState, shoot, run } from "./kit.js";
import { track, buildRoad, makePerson, pose, title, endCard, cap, overlays, bikes, ride, downLean, tag, tagAt } from "./extra.js";

scene.fog.density = 0.008;
const { P } = track([{ len: 3000 }]);
buildRoad(P, -80, 1200);
const T2 = S.s2[0], T3 = S.s3[0], T4 = S.s4[0], T5 = S.s5[0], T6 = S.s6[0];
const sJ = 200, O = 1.8, R = 3.6, sL = sJ - 7; // junction centre on our lane, stop line

// ---- traffic light over our lane + stop line + side road on the right ----
const lamps = [];
{
  const G = new THREE.Group(); scene.add(G); const [x, z] = P(sL + 0.6, 4.3); G.position.set(x, 0, z);
  G.add(box(0.16, 5.6, 0.16, 0, 2.8, 0, glow(VIOLET, 1.2), false), box(2.7, 0.12, 0.12, -1.35, 5.5, 0, glow(VIOLET, 1.2), false));
  G.add(box(0.55, 1.55, 0.4, -2.5, 4.8, 0));
  [[RED, 5.3], [ORANGE, 4.8], [GREEN, 4.3]].forEach(([hex, y]) => { const m = new THREE.Mesh(new THREE.SphereGeometry(0.21, 16, 12), glow(hex, 0.25)); m.position.set(-2.5, y, 0.22); G.add(m); lamps.push([m, hex]); });
  const [lx, lz] = P(sL, O); scene.add(box(3.5, 0.02, 0.35, lx, 0.015, lz, glow(WHITE, 0.9), false));
  const [rx, rz] = P(sJ, 3.6 + 30); scene.add(box(60, 0.01, 7.2, rx, 0.006, rz, new THREE.MeshStandardMaterial({ color: 0x14112e, roughness: 0.9 }), false)); // side road
}
const setLight = (i) => lamps.forEach(([m, hex], k) => m.material.color.set(hex).multiplyScalar(k === i ? 5 : 0.22)); // 0 red 1 yellow 2 green
const lampPos = new THREE.Vector3(); lamps[2][0].getWorldPosition(lampPos);

// distance covered under a speed profile v(t) between a and b
const integ = (v, a, b) => { let d = 0; const n = 120, h = (b - a) / n; for (let i = 0; i < n; i++) d += v(a + (i + 0.5) * h) * h; return d; };
// oncoming car turning left across our lane: comes down the far lane, quarter arc, ends broadside in our lane at sJ
const carTurn = (th) => { const s = sJ + R - R * Math.sin(th), o = -O + R - R * Math.cos(th); const [x, z] = P(s, o); return [x, z, Math.PI + th]; };

// ---- A (s1-s2): speeds up, light turns red, car turns, hit ----
const tAcc = g("s1", "speed"), tRed = g("s2", "red"), tHit = g("s2", "hit"), tTurn = tHit - 1.05;
const vA = (t) => 14 + 8 * sm(tAcc - 0.1, tAcc + 0.7, t);
const sHit = sJ - 2.0;
const sAb = (t) => (t <= tHit ? sHit - integ(vA, t, tHit) : sHit - 0.5 * sm(tHit, tHit + 0.5, t));
const pA = (t) => { const [x, z] = P(sAb(t), O); return [x, z, 0]; };
const pCa = (t) => {
  if (t < tTurn) { const [x, z] = P(sJ + R + 8 * (tTurn - t), -O); return [x, z, Math.PI]; }
  return carTurn((Math.PI / 2) * sm(tTurn, tHit, t) ** 0.85 + 0.12 * sm(tHit, tHit + 0.6, t));
};
// ---- B (s3-s7): eases off, covers brakes, watches the waiting car, yellow -> calm stop ----
const tEase = g("s4", "ease"), tYel = g("s6", "yellow"), tStop = tYel + 1.7, sStop = sL - 1.6;
const vB = (t) => (t < tYel ? 15 - 6 * sm(tEase, tEase + 0.9, t) : 9 * (1 - sm(tYel, tStop, t)));
const sBb = (t) => (t >= tStop ? sStop : sStop - integ(vB, t, tStop));
const pB = (t) => { const [x, z] = P(sBb(t), O); return [x, z, 0]; };
const tGoC = tYel + 0.9;
const pCb = (t) => carTurn((Math.PI / 2) * sm(tGoC, tGoC + 1.6, t) + 0.9 * Math.max(0, t - tGoC - 1.6) / 1.2);

const CARa = makeCar({ color: 0xc8324a }), CARb = makeCar({ color: 0x5246c8 });
const ind = box(0.28, 0.18, 0.1, 0.62, 0.75, -2.05, glow(ORANGE, 4), false); CARb.g.add(ind); // left front indicator
const [Bk] = bikes(1), THROWN = makePerson();
const sight = beam(GREEN, 2.2, 0.03);

const tSpeed = tag("SPEEDING UP", RED), tOld = tag("OLD GREEN", ORANGE), tEaseT = tag("EASE OFF", GREEN), tCover = tag("COVER BRAKES", GREEN), tTurnT = tag("TURNING CAR", ORANGE), tCalm = tag("STOP CALMLY", GREEN);

title("NEVER SPEED UP FOR A GREEN");
cap("s1", "green", ["GREEN LIGHT", "FAR AHEAD?"], GREEN, { until: ["s1", "never"] });
cap("s2", "turns", ["IT TURNS RED"], RED, { y: 0.3, until: ["s2", "car"] });
cap("s2", "car", ["A CAR TURNS", "IN FRONT OF YOU"], RED, { y: 0.3, until: ["s2", "hit"] });
cap("s2", "hit", ["YOU HIT IT"], RED, { y: 0.3, boom: 0.6 });
cap("s3", "green", ["OLD GREEN", "WILL CHANGE SOON"], ORANGE, { y: 0.3 });
cap("s4", "ease", ["EASE OFF", "THE THROTTLE"], GREEN, { until: ["s4", "cover"] });
cap("s4", "cover", ["COVER YOUR", "BRAKES"], GREEN);
cap("s5", "watch", ["WATCH FOR CARS", "WAITING TO TURN"], ORANGE);
cap("s6", "yellow", ["YELLOW?", "STOP CALMLY"], GREEN);
endCard(["OLD GREEN?", "SLOW DOWN."]);

const fol = (fn) => (t) => pathState(fn, t);
const cam = (s, o, y, ls, lo, ly, f) => { const [x, z] = P(s, o), [lx, lz] = P(ls, lo); return [x, y, z, lx, ly, lz, f]; };
const SH = [
  { at: 0, f: fol(pA), K: [[0, [0.7, 2.6, 6.5, -0.8, 1.6, -20, 50]], [2.3, [0.6, 2.4, 6.0, -0.8, 1.8, -20, 50]]] },
  { at: T2, K: [[0, cam(sJ - 24, -4.2, 3.6, sJ + 1, 1.2, 1.4, 44)], [2, cam(sJ - 21, -4.2, 3.4, sJ + 1, 1.2, 1.2, 44)]] },
  { at: tHit - 0.45, K: [[0, cam(sJ - 8, -4.0, 2.3, sJ, 1.8, 0.8, 54)], [1.8, cam(sJ - 7.5, -4.4, 2.6, sJ + 0.5, 1.8, 0.7, 54)]] },
  { at: T3, f: fol(pB), K: [[0, [0.7, 2.6, 6.5, -0.8, 1.8, -20, 50]], [2.3, [0.6, 2.5, 6.2, -0.8, 1.8, -20, 50]]] },
  { at: T4, f: fol(pB), K: [[0, [-2.8, 2.7, 6.8, -0.3, 1.0, -3, 50]], [2, [-3.0, 2.6, 6.2, -0.3, 1.0, -3, 50]]] },
  { at: T5, f: fol(pB), K: [[0, [0.9, 2.5, 5.0, -0.5, 0.9, -24, 40]], [2.3, [0.9, 2.4, 4.6, -0.5, 0.9, -24, 40]]] },
  { at: T6, K: [[0, cam(sJ - 24, -1.5, 5.5, sJ - 6, 1.0, 0.6, 46)], [4, cam(sJ - 22, -1.5, 5.5, sJ - 6, 1.0, 0.6, 46)]] },
];
const wp = (o, v = new THREE.Vector3()) => o.getWorldPosition(v);
run("w", (t) => {
  const A = t < T3;
  if (A) {
    const k = sm(tHit + 0.05, tHit + 0.45, t);
    ride(Bk, pA, t, t < tAcc ? VIOLET : RED, k > 0 ? { lean: downLean(k, 1), down: k } : { trail: true });
    CARa.set(pathState(pCa, t)); CARb.set(null); ind.visible = false;
    // rider thrown over the car's side
    const u = sm(tHit, tHit + 0.8, t), [x, z] = P(sHit + 1 + 4.5 * u, O + 0.3 * u);
    pose(THROWN, { x, z, h: 0, lie: sm(tHit, tHit + 0.6, t), armR: 1.2 * u, armL: 1.0 * u, vis: t > tHit + 0.02 });
    if (t > tHit) THROWN.g.position.y += 2.0 * Math.sin(Math.PI * Math.min(1, (t - tHit) / 0.8)) + 0.2 * (1 - u);
    setLight(t < tRed - 0.55 ? 2 : t < tRed ? 1 : 0);
    sight.set(lampPos, lampPos, 0);
  } else {
    ride(Bk, pB, t, t < T4 ? VIOLET : GREEN, { trail: t < tStop - 0.3 });
    pose(THROWN, { vis: false }); CARa.set(null); CARb.set(pathState(pCb, t));
    ind.visible = Math.floor(t * 3) % 2 === 0;
    setLight(t < tYel ? 2 : t < tYel + 1.8 ? 1 : 0);
    const cb = pathState(pCb, t);
    sight.set(wp(Bk.visor), new THREE.Vector3(cb.x, 1.0, cb.z), t > T5 && t < T6 ? sm(g("s5", "watch"), g("s5", "watch") + 0.3, t) : 0);
  }
  // tags
  const b = pathState(A ? pA : pB, t);
  tagAt(tSpeed, b.x, 2.4, b.z, A ? sm(tAcc - 0.1, tAcc + 0.2, t) * (1 - sm(T2 - 0.2, T2, t)) : 0, 1.2);
  { const cb = pathState(pCb, t); tagAt(tTurnT, cb.x, 2.6, cb.z, !A && t > T5 && t < T6 ? sm(g("s5", "cars") - 0.1, g("s5", "cars") + 0.2, t) : 0, 3.2); }
  const shot = shoot(SH, t);
  bloom.strength = 1.0 + 1.2 * shot.punch * shot.punch + overlays(t) + (A ? 1.0 * flash(t, tHit) : 0);
});
