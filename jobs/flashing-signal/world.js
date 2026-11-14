// 104 flashing-signal: wrong = a car on the cross road blinks right, the rider pulls out, the car goes straight and hits him (red).
// Right = watch the front wheel not the light: the car slows, the wheels turn, the driver's head looks into the turn,
// the car really turns into the side road, only then the rider goes (green).
import { THREE, S, g, sm, flash, scene, bloom, VIOLET, ORANGE, RED, GREEN, pathState, shoot, run, patch, beam, makeCar, glow, box } from "./kit.js";
import { track, buildRoad, title, endCard, cap, overlays, tag, tagAt, bikes, ride, downLean, makePerson, pose, dist } from "./extra.js";

// ---- props: right-hand indicator lamps on a car (front, side repeater, rear), blinkable ----
function blinker(C) {
  const m = glow(ORANGE, 0.15);
  C.g.add(box(0.34, 0.16, 0.06, 0.66, 0.72, -2.19, m, false), box(0.05, 0.1, 0.32, 0.96, 0.78, -1.75, m, false), box(0.34, 0.16, 0.06, 0.66, 0.74, 2.19, m, false), box(0.12, 0.1, 0.1, 1.0, 1.08, -0.62, m, false));
  return (on) => m.color.set(ORANGE).multiplyScalar(on ? 3.4 : 0.35);
}
const blink = (t) => t % 0.6 < 0.4;
const ringFor = (C) => { const r = new THREE.Mesh(new THREE.TorusGeometry(0.52, 0.03, 8, 48), glow(GREEN, 1.4)); r.rotation.y = Math.PI / 2; r.position.x = 0.14; C.front[1].add(r); return r; };

scene.fog.density = 0.009;
const J = 200, sL = J - 5.2, { P } = track([{ len: 600 }]);
buildRoad(P, -60, 600, { gaps: [[J - 4.6, J + 4.6, -1], [J - 4.6, J + 4.6, 1]] });
const P2 = (s, o = 0) => [s, -J + o]; // cross road along +x, o > 0 = near lane
buildRoad(P2, -160, -4.2, { lamps: false }); buildRoad(P2, 4.2, 160, { lamps: false });
const stopLine = patch(3.6, 0.35, 0xffffff, 0.5); { const [x, z] = P(sL + 0.4, 1.8); stopLine.position.set(x, 0.02, z); stopLine.set(0.6); }
const T2 = S.s2[0], T3 = S.s3[0], T5 = S.s5[0], T6 = S.s6[0], T7 = S.s7[0];

// rider's right turn out of the side road: stop line -> arc R -> near lane of the cross road heading +x
const R = 3.4, LR = (R * Math.PI) / 2, ZN = -J + 1.8, Z0 = -(J - 5.2);
const turn = (d) => (d <= 0 ? [1.8, Z0, 0] : d < LR ? [1.8 + R - R * Math.cos(d / R), Z0 - R * Math.sin(d / R)] : [1.8 + R + d - LR, ZN]);

// ---- A: wrong way ----
const tPull = g("s2", "pull"), tHit = g("s2", "hit"), PH = 0.95, aAcc = (2 * R * PH) / (tHit - tPull) ** 2;
const hitP = turn(R * PH), hA = -PH;
const aPath = (t) => {
  if (t < tPull) return [1.8, Z0, 0];
  if (t < tHit) return turn(0.5 * aAcc * (t - tPull) ** 2);
  const u = t - tHit, k = 1 - Math.exp(-u / 0.3);
  return [hitP[0] + 4.5 * k, hitP[1] - 0.6 * k, hA - 0.7 * k];
};
const VA = 10, cA0 = hitP[0] - 0.45 - 2.16;
const cAx = (t) => (t < tHit ? cA0 - VA * (tHit - t) : cA0 + 3.5 * (1 - Math.exp(-(t - tHit) / 0.35)));
const carAPath = (t) => [cAx(t), ZN, -Math.PI / 2];
const carA = makeCar({ color: 0x5246c8 }), blA = blinker(carA);
const [Bk] = bikes(1), THROWN = makePerson();

// ---- B: right way: car slows, wheels steer, it turns into the side road (lane x=-1.8 heading +z) ----
const R2 = 4, LC = (R2 * Math.PI) / 2;
const cTurn = (d) => (d < 0 ? [-5.8 + d, ZN] : d < LC ? [-5.8 + R2 * Math.sin(d / R2), ZN + R2 * (1 - Math.cos(d / R2))] : [-1.8, ZN + R2 + d - LC]);
const tSlow = g("s4", "slows"), tWh = g("s4", "start"), tArc = g("s4", "turn") - 0.1;
const vC = (t) => 11 - 9.2 * sm(tSlow - 0.3, tWh, t) + 6 * sm(tArc + LC / 1.8, tArc + LC / 1.8 + 1.5, t);
const DC = dist(vC, 0, 30), cd = (t) => DC(t) - DC(tArc);
let tArcEnd = tArc; while (cd(tArcEnd) < LC) tArcEnd += 0.01;
const carBPath = (t) => cTurn(cd(t));
const steerB = (t) => -0.55 * sm(tWh - 0.1, g("s4", "turn") + 0.1, t) * (1 - sm(tArcEnd - 0.3, tArcEnd + 0.4, t));
const carB = makeCar({ color: 0x5246c8, driver: true }), blB = blinker(carB), ring = ringFor(carB);
for (const c of carB.g.children) if (c.isMesh && c.position.y > 1.1 && c !== carB.driver && c.geometry.type === "BoxGeometry" && c.scale.x === 1) { c.material = c.material.clone(); c.material.transparent = true; c.material.opacity = 0.2; c.material.depthWrite = false; }
const nose = box(0.08, 0.08, 0.16, 0, 0, -0.16, glow(ORANGE, 1.2), false); carB.driver.add(nose); carB.driver.scale.setScalar(1.4);
const look = beam(GREEN, 1.8, 0.05);
const tHead = g("s5", "head"), tLook = g("s5", "looking");
// rider B waits, then goes once the car is really through the turn
const tGo = g("s6", "really") - 0.1, DB = dist((t) => 9 * sm(tGo, tGo + 1.5, t), tGo, T7 + 6);
const bPath = (t) => turn(t < tGo ? 0 : DB(t));

// overlays
const hitZ = patch(4, 4, RED, 1.2); hitZ.position.set(hitP[0], 0.03, hitP[1]);
const tSig = tag("SIGNAL ON", ORANGE), tStr = tag("GOES STRAIGHT", RED), tWheel = tag("WATCH THE WHEEL", GREEN), tLight = tag("NOT THE LIGHT", RED),
  tSlowT = tag("SLOWING", GREEN), tTurnT = tag("WHEELS TURN", GREEN), tHeadT = tag("HEAD TURNED", GREEN), tGoT = tag("NOW GO", GREEN);

title("NEVER TRUST A FLASHING SIGNAL");
cap("s2", "pull", ["YOU PULL OUT"], RED, { until: ["s2", "the"], y: 0.3 });
cap("s2", "the", ["THE DRIVER", "GOES STRAIGHT"], RED, { until: ["s2", "and"], y: 0.3 });
cap("s2", "and", ["AND HITS YOU"], RED, { y: 0.3, boom: 0.6 });
cap("s3", "watch", ["WATCH THE WHEELS,", "NOT THE LIGHT"], GREEN, { y: 0.3 });
cap("s4", "wait", ["WAIT UNTIL", "THE CAR SLOWS"], GREEN, { until: ["s4", "and"], y: 0.3 });
cap("s4", "and", ["AND THE WHEELS", "START TO TURN"], GREEN);
cap("s5", "check", ["CHECK THE", "DRIVER'S HEAD"], GREEN, { until: ["s5", "are"] });
cap("s5", "are", ["LOOKING WHERE", "THEY SIGNAL?"], GREEN);
cap("s6", "only", ["ONLY GO WHEN IT'S", "REALLY TURNING"], GREEN);
endCard(["SIGNALS LIE.", "WHEELS DON'T."]);

const fol = (fn) => (t) => pathState(fn, t);
const SH = [
  { at: 0, f: fol(carAPath), noRot: true, K: [[0, [6.5, 2.6, 7.5, 0.6, 0.8, 0, 44]], [2.7, [5.5, 2.4, 7.0, 0.6, 0.8, 0, 44]]] },
  { at: T2, K: [[0, [13, 4.5, -J + 11, 2, 0.6, -J + 1.5, 46]], [2.5, [13.5, 4.8, -J + 11.5, 3.5, 0.6, -J + 1.5, 46]]] },
  { at: T3, f: fol(carBPath), noRot: true, K: [[0, [3.4, 1.5, 6.4, 0.6, 0.7, 0.6, 42]], [1.5, [3.2, 1.4, 6.0, 0.6, 0.7, 0.6, 42]]] },
  { at: S.s4[0], f: fol(carBPath), noRot: true, K: [[0, [4.2, 2.0, 7.0, 0.6, 0.6, 0.6, 42]], [3, [4.0, 2.0, 6.8, 0.6, 0.6, 0.6, 42]]] },
  { at: T5, f: fol(carBPath), noRot: true, K: [[0, [4.5, 4.6, 5.2, 0, 1.0, -0.3, 44]], [2.6, [4.8, 4.8, 5.4, 0, 1.0, -0.3, 44]]] },
  { at: T6, f: fol(bPath), noRot: true, K: [[0, [0.6, 3.6, 8, -1.6, 0.8, -5, 50]], [1.9, [0.4, 3.8, 8.4, -0.6, 0.8, -6, 50]]] },
  { at: T7, f: fol(bPath), noRot: true, K: [[0, [-3, 6, 9, 2, 0.5, -3, 46]], [4.5, [-4, 9, 12, 4, 0.5, -3, 46]]] },
];

const on = (t, a, b = 1e9) => sm(a - 0.1, a + 0.2, t) * (1 - sm(b - 0.15, b, t));
const H0 = new THREE.Vector3(), H1 = new THREE.Vector3();
run("w", (t) => {
  const A = t < T3;
  let st;
  if (A) {
    const k = sm(tHit, tHit + 0.3, t);
    st = ride(Bk, aPath, t, t < T2 ? VIOLET : RED, k > 0 ? { lean: downLean(k, 1), down: k } : {});
    if (t > tHit + 0.05) { const u = t - tHit, kk = 1 - Math.exp(-u / 0.35); pose(THROWN, { x: hitP[0] + 6 * kk, z: hitP[1] - 0.3 * kk, h: -Math.PI / 2, lie: sm(tHit + 0.05, tHit + 0.45, t), armR: 2.2, armL: 1.6, hex: RED }); } else pose(THROWN, { vis: false });
    carA.set(pathState(carAPath, t)); blA(blink(t)); carB.set(null);
  } else {
    pose(THROWN, { vis: false }); carA.set(null);
    st = ride(Bk, bPath, t, GREEN, { trail: t > tGo });
    const cs = pathState(carBPath, t); cs.h = cs.v < 0.05 ? -Math.PI / 2 : cs.h; carB.set(cs, steerB(t));
    blB(t < tArcEnd + 0.4 && blink(t));
  }
  // B extras: wheel ring, driver head turning into the turn + look beam
  const rA = A ? 0 : on(t, g("s3", "wheels"), T5);
  ring.visible = rA > 0.01; ring.material.color.set(GREEN).multiplyScalar(1.5 * rA); ring.scale.setScalar(0.92 + 0.08 * Math.sin(t * 8));
  const hk = A ? 0 : sm(tHead - 0.1, tLook, t) * (1 - sm(T6 + 0.5, T6 + 1, t));
  carB.driver.rotation.y = -1.1 * hk; nose.material.color.set(GREEN).multiplyScalar(0.5 + 2.5 * hk);
  if (!A) { carB.driver.getWorldPosition(H0); H1.set(0, 0, -6); carB.driver.localToWorld(H1); H1.y = 0.8; } look.set(H0, H1, A ? 0 : on(t, tLook, T6) * 0.9);
  hitZ.set(A ? sm(tHit, tHit + 0.2, t) : 0);
  const ca = pathState(carAPath, t), cb = pathState(carBPath, t);
  tagAt(tSig, ca.x + 1.0, 2.2, ca.z + 0.6, A ? on(t, g("s1", "signals"), g("s1", "never")) : 0, 0.8);
  tagAt(tStr, ca.x, 2.2, ca.z, 0, 1.0);
  ring.getWorldPosition(H0.set(0, 0, 0)); const wx = H0.x, wz = H0.z;
  if (!A) { carB.driver.getWorldPosition(H0); }
  tagAt(tWheel, wx, 1.35, wz + 0.6, 0, 0.55);
  tagAt(tLight, wx, 1.35, wz + 0.6, 0, 0.55);
  tagAt(tSlowT, wx, 1.35, wz + 0.6, 0, 0.55);
  tagAt(tTurnT, wx, 1.35, wz + 0.6, A ? 0 : on(t, tWh, T5), 0.55);
  tagAt(tHeadT, cb.x, 2.3, cb.z, A ? 0 : on(t, tLook, T6), 0.7);
  tagAt(tGoT, st.x, 2.4, st.z - 1.0, A ? 0 : on(t, tGo, T7), 1.2);
  const shot = shoot(SH, t);
  bloom.strength = 1.0 + 1.2 * shot.punch * shot.punch + overlays(t) + (A ? 0.8 * flash(t, tHit) : 0);
});
