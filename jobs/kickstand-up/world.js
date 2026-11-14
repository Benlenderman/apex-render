// 118 kickstand-up: wrong = rider rides off with the side stand still down, leans into the first left turn, the stand
// digs into the road, levers the bike over and throws him off (red). Right = check the stand with your foot, flip it up
// till it locks, look down once, make it part of the start-up routine, then ride (green).
import { THREE, S, g, sm, flash, scene, bloom, box, tube, glow, beam, VIOLET, ORANGE, RED, GREEN, pathState, shoot, run } from "./kit.js";
import { track, buildRoad, makePerson, pose, title, endCard, cap, overlays, bikes, ride, downLean, tag, tagAt, dist, limbs } from "./extra.js";

// ---- prop: side stand on the bike's left, pivot under the footpeg; k 1 = down, 0 = up (tucked back along the frame) ----
function addStand(B) {
  const piv = new THREE.Group(); piv.position.set(-0.2, 0.36, 0.1); B.lean.add(piv);
  const m = glow(RED, 1), tip = new THREE.Object3D(); tip.position.set(0, -0.34, 0);
  piv.add(tube([0, 0, 0], [0, -0.34, 0], 0.055, m), box(0.14, 0.04, 0.2, 0, -0.34, 0, m, false), tip);
  return { piv, tip, set(k, hex, b) { piv.rotation.set(-0.2 * k - 1.45 * (1 - k), 0, -0.55 * k - 0.15 * (1 - k)); m.color.set(hex).multiplyScalar(b); } };
}
// sparks: small glowing bits spraying back from a point
const SPK = Array.from({ length: 14 }, (_, i) => { const m = box(0.05, 0.05, 0.05, 0, 0, 0, glow(ORANGE, 4), false); scene.add(m); return [m, Math.abs(Math.sin(i * 12.99) * 437.5) % 1, Math.abs(Math.sin(i * 78.23) * 125.4) % 1]; });
function sparks(p, h, a, t) {
  for (const [m, r1, r2] of SPK) {
    m.visible = a > 0.02; if (!m.visible) continue;
    const u = (t * 3 + r1) % 1, back = 0.2 + 1.6 * u, side = (r2 - 0.5) * 1.2 * u;
    m.position.set(p.x + Math.sin(h) * back + Math.cos(h) * side, 0.05 + 0.5 * u * (1 - u) * (1 + r2), p.z + Math.cos(h) * back - Math.sin(h) * side);
    m.scale.setScalar(a * (1 - u));
  }
}

scene.fog.density = 0.01;
const T2 = S.s2[0], T3 = S.s3[0], T4 = S.s4[0], T5 = S.s5[0], T6 = S.s6[0], T7 = S.s7[0];
const O = 1.8;

// ---- A: ride off with the stand down, lean into a left turn, stand digs in, thrown off ----
const tGo = g("s1", "ride"), tLean = g("s2", "lean"), tDig = g("s2", "digs") - 0.05, tThrow = g("s2", "throws");
const VA = 10, vA = (t) => VA * sm(tGo, tGo + 1.4, t), DA = dist(vA, 0, 9), SB = DA(tLean) + 2;
const { P } = track([{ len: SB }, { len: 70, R: 12 }, { len: 500 }]);
buildRoad(P, -60, 400);
const ringA = (t) => { const [x, z] = P(DA(t), O); return [x, z]; };
const sD = DA(tDig), pD = P(sD, O), pD2 = P(sD + 0.1, O), dirD = [(pD2[0] - pD[0]) / 0.1, (pD2[1] - pD[1]) / 0.1];
const hD = Math.atan2(-dirD[0], -dirD[1]), lnD = pathState(ringA, tDig - 0.03).lean;
const slide = (t) => { const tau = Math.min(1.6, t - tDig); return VA * tau - 0.5 * (VA / 1.6) * tau * tau; };
const pA = (t) => {
  if (t < tGo) { const [x, z] = P(0, O); return [x, z, 0]; }
  if (t < tDig) return ringA(t);
  const d = slide(t); return [pD[0] + dirD[0] * d, pD[1] + dirD[1] * d, hD + 0.7 * sm(tThrow, tThrow + 0.7, t)];
};
const right = [Math.cos(hD), -Math.sin(hD)];
// ---- B: parked, check with the foot, flip up, lock, look down, routine, ride ----
const tChk = g("s3", "check"), tFlip = g("s4", "flip"), tLock = g("s4", "lock"), tLook = g("s5", "look"), tRide = g("s7", "ride") - 0.25;
const vB = (t) => 9 * sm(tRide, tRide + 1.2, t), DB = dist(vB, T3, 20);
const pB = (t) => { if (t < tRide) { const [x, z] = P(0, O); return [x, z, 0]; } const [x, z] = P(DB(t), O); return [x, z]; };

const [Bk] = bikes(1), ST = addStand(Bk), LB = limbs(Bk), THROWN = makePerson();
Bk.rider.children[Bk.rider.children.length - 2].scale.y = 1.4; // left leg long enough to reach the stand
const ring = new THREE.Mesh(new THREE.TorusGeometry(0.18, 0.025, 8, 32), glow(GREEN, 3)); scene.add(ring);
const sight = beam(GREEN, 2.2, 0.025);

title("NEVER LEAVE THE KICKSTAND DOWN");
cap("s1", "about", ["ABOUT TO", "RIDE OFF?"], VIOLET, { until: ["s1", "never"] });
cap("s2", "lean", ["YOU LEAN INTO", "THE FIRST TURN"], RED, { y: 0.3, until: ["s2", "stand"] });
cap("s2", "stand", ["THE STAND DIGS IN"], RED, { y: 0.3, until: ["s2", "throws"] });
cap("s2", "throws", ["AND THROWS", "YOU OFF"], RED, { y: 0.3, boom: 0.6 });
cap("s3", "check", ["CHECK THE STAND", "WITH YOUR FOOT"], GREEN, { y: 0.3 });
cap("s4", "flip", ["FLIP IT UP"], GREEN, { until: ["s4", "feel"] });
cap("s4", "feel", ["FEEL IT LOCK"], GREEN);
cap("s5", "look", ["LOOK DOWN ONCE", "EVERY TIME"], GREEN);
cap("s6", "make", ["PART OF YOUR", "START-UP ROUTINE"], GREEN);
endCard(["STAND UP.", "THEN RIDE."]);

const W = (x, y, z) => [x, y, z];
const [bx0, bz0] = P(0, O);
const wp = (o, v = new THREE.Vector3()) => o.getWorldPosition(v);
const SH = [
  { at: 0, f: (t) => pathState(pA, t), K: [[0, [-2.4, 1.3, 3.0, -0.2, 0.6, -1.5, 50]], [2.3, [-2.6, 1.6, 4.0, -0.2, 0.7, -2.5, 50]]] },
  { at: T2, cam: (t) => { const b = pathState(pA, t), [cx, cz] = P(SB + 20, -6.5); return [cx, 3.4, cz, b.x, 0.6, b.z, 44]; } },
  { at: tDig - 0.3, cam: (t) => { const b = pathState(pA, Math.min(t, tDig + 1.6)); return [pD[0] + dirD[0] * 11 - right[0] * 5, 2.6, pD[1] + dirD[1] * 11 - right[1] * 5, b.x + right[0] * 1.2, 0.5, b.z + right[1] * 1.2, 56]; } },
  { at: T3, K: [[0, W(bx0 - 2.6, 1.3, 1.6, bx0 - 0.2, 0.75, 0.1, 44)], [2, W(bx0 - 2.4, 1.2, 1.3, bx0 - 0.2, 0.7, 0.1, 44)]].map(([a, v]) => [a, [...v.slice(0, 3), ...[bx0 - 0.2, 0.75, bz0 + 0.1], 44]]) },
  { at: T4, K: [[0, [bx0 - 6.0, 1.2, bz0 + 1.6, bx0 - 0.2, 0.6, bz0 + 0.1, 42]], [2, [bx0 - 5.4, 1.1, bz0 + 1.3, bx0 - 0.2, 0.6, bz0 + 0.1, 42]]] },
  { at: T5, K: [[0, [bx0 - 5.2, 3.6, bz0 - 3.8, bx0 - 0.1, 0.6, bz0 + 0.1, 46]], [1.7, [bx0 - 5.3, 3.7, bz0 - 3.4, bx0 - 0.1, 0.6, bz0 + 0.1, 46]]] },
  { at: T6, K: [[0, [bx0 - 7.0, 2.4, bz0 + 2.8, bx0 + 0.3, 0.8, bz0 - 0.4, 46]], [1.8, [bx0 - 5.6, 2.6, bz0 + 5.6, bx0 + 0.3, 0.8, bz0 - 0.4, 46]]] },
  { at: T7, f: (t) => pathState(pB, t), K: [[0, [-1.4, 2.3, 5.5, 0, 0.8, -8, 50]], [1.5, [-1.2, 2.2, 5.0, 0, 0.8, -8, 50]]] },
];
// s3 shot: camera low on the left, bike sits in the lower half under the cap
SH[3].K = [[0, [bx0 - 7.0, 2.0, bz0 + 2.0, bx0 - 0.2, 0.7, bz0 + 0.1, 44]], [2, [bx0 - 6.4, 1.8, bz0 + 1.6, bx0 - 0.2, 0.7, bz0 + 0.1, 44]]];

run("w", (t) => {
  const A = t < T3;
  if (A) {
    const park = 0.2 * (1 - sm(tGo - 0.2, tGo + 0.3, t));
    const lev = sm(tDig, tThrow, t), k = sm(tThrow, tThrow + 0.5, t);
    const lean = t < tDig ? park : (1 - lev) * lnD - 0.35 * lev * (1 - k) + downLean(k, -1) - pathState(pA, t).lean;
    ride(Bk, pA, t, t < T2 ? VIOLET : RED, t < tDig ? { lean, trail: t > tGo + 0.2 } : { lean, down: t > tThrow ? 1 : 0, trail: k < 0.5 });
    ST.set(1, RED, 1.2 + 2.5 * sm(g("s1", "kickstand") - 0.1, g("s1", "kickstand") + 0.2, t));
    LB.set({});
    const tp = wp(ST.tip); sparks(tp, pathState(pA, t).h, sm(tDig - 0.25, tDig - 0.1, t) * (1 - sm(tThrow + 0.1, tThrow + 0.3, t)), t);
    // rider thrown over the outside of the turn
    const u = sm(tThrow, tThrow + 0.9, t), b0 = pA(tThrow);
    pose(THROWN, { x: b0[0] + dirD[0] * 4.5 * u + right[0] * 2.6 * u, z: b0[1] + dirD[1] * 4.5 * u + right[1] * 2.6 * u, h: hD - 1.2 * u, lie: sm(tThrow, tThrow + 0.7, t), armR: 1.4 * u, armL: 0.9 * u, vis: t > tThrow });
    if (t > tThrow) THROWN.g.position.y += 1.6 * Math.sin(Math.PI * Math.min(1, (t - tThrow) / 0.75)) + 0.5 * (1 - u);
    ring.visible = false; sight.set(tp, tp, 0); Bk.headG.rotation.x = 0;
  } else {
    pose(THROWN, { vis: false }); sparks(null, 0, 0, t);
    const up = sm(T3 + 0.2, T3 + 0.8, t);
    ride(Bk, pB, t, GREEN, { lean: 0.2 * (1 - up), trail: t > tRide + 0.2 });
    const kS = 1 - sm(tFlip, tFlip + 0.3, t), locked = t > tLock - 0.05;
    ST.set(kS, kS > 0.5 ? ORANGE : GREEN, locked ? 2.5 : 1.4);
    const foot = t > tChk - 0.15 && t < tLock + 0.4;
    LB.set(foot ? { leg: -1, legA: 0.1 + 0.25 * sm(tChk - 0.15, tChk + 0.3, t) - 0.1 * sm(tFlip, tFlip + 0.3, t), glow: 1 } : {});
    const pv = wp(ST.piv); ring.visible = t > tLock - 0.05 && t < tLock + 0.6;
    if (ring.visible) { const q = sm(tLock - 0.05, tLock + 0.55, t); ring.position.copy(pv); ring.rotation.y = Math.PI / 2; ring.scale.setScalar(0.6 + 2.2 * q); ring.material.color.set(GREEN).multiplyScalar(3 * (1 - q)); }
    const look = t > T5 && t < T6 ? sm(tLook, tLook + 0.3, t) : 0;
    Bk.headG.rotation.x = -0.6 * look;
    sight.set(wp(Bk.visor), wp(ST.tip), look);
    // start-up routine checklist
    const r = (w, a) => (t > T6 && t < T7 ? sm(g("s6", w) - 0.1, g("s6", w) + 0.15, t) * a : 0);
    const mir = r("part", 1); for (const m of [Bk.mirL, Bk.mirR]) m.children[1].material.color.set(mir > 0.1 ? GREEN : VIOLET).multiplyScalar(2 + 2 * mir);
  }
  const shot = shoot(SH, t);
  bloom.strength = 1.0 + 1.2 * shot.punch * shot.punch + overlays(t) + (A ? 0.8 * flash(t, tThrow) : 0.5 * flash(t, tLock));
});
