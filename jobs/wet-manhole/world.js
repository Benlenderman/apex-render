// 119 wet-manhole: wrong = stopping in the rain, the rider puts his left foot on a wet manhole cover, the foot slides out
// and the bike falls on him (red). Right = look where the foot will land, stop short of the cover, watch oil and paint at
// the stop line, put the foot down on clean dry road (green).
import { THREE, S, g, sm, flash, scene, bloom, box, glow, beam, VIOLET, ORANGE, RED, GREEN, WHITE, pathState, shoot, run } from "./kit.js";
import { track, buildRoad, makePerson, pose, title, endCard, cap, overlays, bikes, ride, downLean, tag, tagAt, limbs } from "./extra.js";

scene.fog.density = 0.012;
const { P } = track([{ len: 3000 }]);
buildRoad(P, -80, 600);
const T2 = S.s2[0], T3 = S.s3[0], T4 = S.s4[0], T5 = S.s5[0], T6 = S.s6[0], T7 = S.s7[0];
const O = 1.8, sL = 120;                 // lane offset, stop line
const sA = sL - 1.0, sB = sA - 2.4;      // where the bike stops: A right at the line (foot on the cover), B short of it
const FO = O - 0.5;                      // the left foot lands here (lane offset)

// ---- props: stop line, manhole cover, oil sheen, rain ----
const [lx, lz] = P(sL, O); const mLine = glow(WHITE, 0.45); scene.add(box(3.5, 0.02, 0.4, lx, 0.015, lz, mLine, false));
const MH = new THREE.Group(); { const [x, z] = P(sA, FO); MH.position.set(x, 0.012, z); scene.add(MH); }
MH.add(new THREE.Mesh(new THREE.CylinderGeometry(0.42, 0.42, 0.02, 40), new THREE.MeshStandardMaterial({ color: 0x6a6490, metalness: 0.85, roughness: 0.15 })));
for (let i = -2; i <= 2; i++) MH.add(box(0.03, 0.025, 0.7 * Math.cos(Math.asin(i / 2.6)), i * 0.15, 0.01, 0, glow(VIOLET, 0.9), false));
const mhRing = new THREE.Mesh(new THREE.TorusGeometry(0.43, 0.03, 8, 40), glow(VIOLET, 1.5)); mhRing.rotation.x = Math.PI / 2; mhRing.position.y = 0.02; MH.add(mhRing);
const oil = new THREE.Mesh(new THREE.CircleGeometry(0.5, 32), glow(ORANGE, 0.5)); oil.rotation.x = -Math.PI / 2; oil.scale.set(1.4, 0.8, 1);
{ const [x, z] = P(sL + 0.6, O + 0.7); oil.position.set(x, 0.01, z); scene.add(oil); }
const spot = new THREE.Mesh(new THREE.TorusGeometry(0.3, 0.03, 8, 32), glow(GREEN, 2.5)); spot.rotation.x = Math.PI / 2; scene.add(spot);
{ const [x, z] = P(sB, FO); spot.position.set(x, 0.03, z); }
const RAIN = Array.from({ length: 160 }, (_, i) => { const m = box(0.012, 0.45, 0.012, 0, 0, 0, glow(VIOLET, 1.3), false); scene.add(m); return [m, (Math.sin(i * 12.9898) * 43758.5) % 1, (Math.sin(i * 78.233) * 12543.1) % 1, (Math.sin(i * 39.42) * 9321.7) % 1]; });
const rain = (t) => { const [cx, cz] = P(sA - 3, O); for (const [m, a, b, c] of RAIN) { m.position.set(cx + a * 9, 9 - ((t * 14 + Math.abs(c) * 9) % 9), cz + b * 14); } };

// ---- motion: both runs brake to a stop ----
const integ = (v, a, b) => { let d = 0; const n = 120, h = (b - a) / n; for (let i = 0; i < n; i++) d += v(a + (i + 0.5) * h) * h; return d; };
const tStopA = g("s1", "foot") + 0.05, tFootA = g("s1", "manhole") - 0.1, tSlide = g("s2", "slides"), tFall = g("s2", "falls") - 0.1;
const vA = (t) => 8 * (1 - sm(0, tStopA, t) ** 0.7);
const pA = (t) => { const s = t >= tStopA ? sA : sA - integ(vA, t, tStopA); const [x, z] = P(s, O); return [x, z, 0]; };
const tStopB = g("s4", "before") + 0.1, tFootB = g("s4", "after");
const vB = (t) => 6 * (1 - sm(T3 + 0.3, tStopB, t));
const pB = (t) => { const s = t >= tStopB ? sB : sB - integ(vB, t, tStopB); const [x, z] = P(s, O); return [x, z, 0]; };

const [Bk] = bikes(1), LB = limbs(Bk), legL = Bk.rider.children[Bk.rider.children.length - 2], VICTIM = makePerson();
legL.scale.y = 1.6; // long enough to reach the road from the seat
const sight = beam(GREEN, 2.2, 0.025);

title("NEVER PUT YOUR FOOT ON A MANHOLE");
cap("s1", "stopping", ["STOPPING", "IN THE RAIN?"], VIOLET, { until: ["s1", "never"] });
cap("s2", "foot", ["YOUR FOOT", "SLIDES OUT"], RED, { y: 0.3, until: ["s2", "and"] });
cap("s2", "and", ["THE BIKE", "FALLS ON YOU"], RED, { y: 0.3, boom: 0.6 });
cap("s3", "look", ["LOOK WHERE", "YOUR FOOT LANDS"], GREEN, { y: 0.3 });
cap("s4", "stop", ["STOP BEFORE", "THE METAL COVER"], GREEN);
cap("s5", "watch", ["WATCH FOR", "OIL AND PAINT"], ORANGE);
cap("s6", "put", ["FOOT DOWN ON", "CLEAN DRY ROAD"], GREEN);
endCard(["LOOK DOWN.", "THEN FOOT DOWN."]);

const fol = (fn) => (t) => pathState(fn, t);
const cam = (s, o, y, ls, lo, ly, f) => { const [x, z] = P(s, o), [lx2, lz2] = P(ls, lo); return [x, y, z, lx2, ly, lz2, f]; };
const SH = [
  { at: 0, f: fol(pA), K: [[0, [-2.4, 2.9, 6.5, -0.2, 0.5, -3, 48]], [tStopA, [-4.2, 2.8, 4.4, -0.3, 0.4, -0.4, 48]], [2.9, [-4.4, 2.7, 4.0, -0.3, 0.4, -0.4, 48]]] },
  { at: T2, K: [[0, cam(sA + 5.0, FO - 6.2, 2.6, sA - 0.2, FO - 0.6, 0.4, 48)], [2.2, cam(sA + 4.6, FO - 6.0, 2.8, sA - 0.2, FO - 0.6, 0.3, 48)]] },
  { at: T3, f: fol(pB), K: [[0, [-1.4, 3.4, 6.4, -0.3, 0.3, -3, 48]], [2, [-1.6, 3.3, 5.8, -0.3, 0.2, -3, 48]]] },
  { at: T4, K: [[0, cam(sB + 4.0, FO - 5.0, 2.2, sB + 1.0, FO - 0.3, 0.3, 46)], [2.4, cam(sB + 3.6, FO - 5.0, 2.3, sB + 1.0, FO - 0.3, 0.3, 46)]] },
  { at: T5, K: [[0, cam(sB - 6.0, O - 3.2, 5.6, sL - 1.6, O, 0, 48)], [2.2, cam(sB - 5.5, O - 3.0, 5.8, sL - 1.6, O, 0, 48)]] },
  { at: T6, K: [[0, cam(sB + 3.0, FO - 4.0, 1.4, sB, FO - 0.2, 0.3, 44)], [1.8, cam(sB + 2.6, FO - 3.8, 1.3, sB, FO - 0.2, 0.3, 44)]] },
  { at: T7, K: [[0, cam(sB + 5.5, FO - 4.5, 2.8, sB + 1, O, 0.4, 46)], [1.8, cam(sB + 5.0, FO - 5.5, 3.0, sB + 1, O, 0.4, 46)]] },
];
const wp = (o, v = new THREE.Vector3()) => o.getWorldPosition(v);
const legA = (k) => 0.05 + 0.3 * k;
run("w", (t) => {
  rain(t);
  const A = t < T3;
  if (A) {
    const foot = sm(tFootA - 0.3, tFootA, t), slide = sm(tSlide, tSlide + 0.35, t), k = sm(tFall, tFall + 0.45, t);
    const lean = 0.1 * foot + 0.35 * slide * (1 - k) + downLean(k, 1);
    ride(Bk, pA, t, t < T2 ? VIOLET : RED, { lean, down: k, trail: t < tStopA - 0.3 });
    LB.set(foot > 0 ? { leg: -1, legA: legA(foot) + 0.9 * slide, glow: 1 + 2 * slide } : {});
    mhRing.material.color.set(t > tFootA - 0.2 ? RED : VIOLET).multiplyScalar(1.5 + 2.5 * sm(g("s1", "manhole") - 0.1, g("s1", "manhole") + 0.2, t));
    // rider pinned under the bike on the left
    const [x, z] = P(sA + 0.2, O - 1.0);
    pose(VICTIM, { x, z, h: Math.PI / 2, lie: 1, armR: 0.6, armL: 1.2, vis: k > 0.5 });
    spot.visible = false; oil.material.color.set(ORANGE).multiplyScalar(0.35);
    sight.set(wp(Bk.visor), wp(Bk.visor), 0);
  } else {
    pose(VICTIM, { vis: false });
    const foot = sm(tFootB - 0.3, tFootB, t);
    ride(Bk, pB, t, t < T4 ? VIOLET : GREEN, { lean: 0.1 * foot, trail: t < tStopB - 0.3 });
    LB.set(foot > 0 ? { leg: -1, legA: legA(foot), glow: 1 } : {});
    mhRing.material.color.set(RED).multiplyScalar(t < T4 ? 1.5 + 2 * sm(g("s3", "land") - 0.1, g("s3", "land") + 0.2, t) : 1.4);
    // look down: s3 at the cover ahead, s5 at the oil and paint, s7 at the spot
    const lk = t < T4 ? sm(T3 + 0.05, T3 + 0.35, t) : t > T5 && t < T6 ? sm(T5, T5 + 0.3, t) : t > T7 ? sm(T7, T7 + 0.3, t) : 0;
    Bk.headG.rotation.x = -0.45 * lk;
    const tgt = t < T4 ? new THREE.Vector3(MH.position.x, 0.05, MH.position.z) : t < T6 ? new THREE.Vector3(oil.position.x, 0.05, oil.position.z) : spot.position.clone();
    sight.set(wp(Bk.visor), tgt, lk);
    spot.visible = t > tFootB - 0.2; spot.material.color.set(GREEN).multiplyScalar(2 + 3 * flash(t, g("s6", "clean")));
    const o5 = t > T5 && t < T6 ? 1 : 0;
    oil.material.color.set(ORANGE).multiplyScalar(0.35 + 1.2 * o5 * sm(g("s5", "oil") - 0.1, g("s5", "oil") + 0.2, t));
    mLine.color.set(WHITE).multiplyScalar(0.45 + 1.2 * o5 * sm(g("s5", "paint") - 0.1, g("s5", "paint") + 0.2, t));
  }
  const shot = shoot(SH, t);
  bloom.strength = 1.0 + 1.2 * shot.punch * shot.punch + overlays(t) + (A ? 0.9 * flash(t, tFall + 0.3) : 0);
});
