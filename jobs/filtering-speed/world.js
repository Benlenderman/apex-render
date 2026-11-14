// 113 filtering-speed: wrong = rider filters between two slow lanes far faster than traffic; a car jumps lanes and he hits it (red).
// Right = filter just above traffic speed, watch the gaps, spot the turning wheels and the head check, drop back, then rejoin the lane when traffic speeds up (green).
import { THREE, S, g, sm, flash, scene, bloom, glow, box, VIOLET, ORANGE, RED, GREEN, patch, road, makeCar, pathState, shoot, run } from "./kit.js";
import { makePerson, pose, title, endCard, cap, overlays, bikes, ride, tag, tagAt } from "./extra.js";

// ---------- props: glowing ring marker (wheel / head) ----------
function ring(r, hex) {
  const m = glow(hex, 0), o = new THREE.Mesh(new THREE.TorusGeometry(r, 0.035, 8, 32), m); scene.add(o);
  return { o, set(x, y, z, a) { o.position.set(x, y, z); o.visible = a > 0.01; m.color.set(hex).multiplyScalar(2.6 * a); } };
}

const LW = 3.6, XL = -LW / 2, XR = LW / 2;
road({ lanes: 2, lw: LW, z0: 60, z1: -700 });
scene.fog.density = 0.012;
const T2 = S.s2[0], T3 = S.s3[0], T4 = S.s4[0], T5 = S.s5[0], T6 = S.s6[0], T7 = S.s7[0];
const [Bk] = bikes(1), THROWN = makePerson();
const COLS = [0x4a42b0, 0x3f5fb8, 0x5a3fa0, 0x45509a];
const cars = Array.from({ length: 12 }, (_, i) => makeCar({ color: COLS[i % 4] }));
const CJ = makeCar({ driver: true, color: 0x7a62e8 });
CJ.driver.scale.setScalar(1.5); CJ.driver.position.y = 1.2; CJ.driver.scale.setScalar(1.3); CJ.driver.add(box(0.07, 0.07, 0.12, 0, 0, -0.16, glow(0xfff4e8, 1.2), false)); // nose so the head turn reads

// ---- A: traffic crawls at 4 m/s, bike filters at 14; the car jumps lanes and the bike hits its side ----
const VC = 4, VA = 14;
const tHit = g("s2", "front") - 0.05, tJ = tHit - 0.5;
const zBH = -VA * tHit, zH = zBH - 1.25; // jumper's centre at the hit
const uH = (t) => Math.max(0, t - tHit);
const aZ = (t) => (t < tHit ? -VA * t : zBH - 0.7 * (1 - Math.exp(-uH(t) / 0.2)));
const aPath = (t) => [0.4 * sm(tHit, tHit + 0.4, t), aZ(t)];
const kD = (t) => sm(tHit + 0.05, tHit + 0.4, t);
const tStopA = tHit + 0.25;
const jx = (t) => XL + 3.6 * sm(tJ, tJ + 1.5, Math.min(t, tStopA));
const jz = (t) => zH + VC * (tHit - Math.min(t, tStopA + 0.3)) - 0.6 * sm(tStopA, tStopA + 0.6, t);
const jPath = (t) => [jx(t), jz(t)];
const laneA = (x, r) => (t) => [x, zH + r + VC * (tHit - t)];
const carsA = [[XL, 9], [XL, 18], [XL, 27], [XL, 36], [XL, -9], [XL, -18], [XR, 7.5], [XR, 16], [XR, 25], [XR, 34], [XR, -7.5], [XR, -16]].map(([x, r]) => laneA(x, r));

// ---- B: traffic frame (rel r, + = behind); bike rides just above traffic speed ----
const tUp = g("s6", "speeds") - 0.2;
const D = (t) => VC * t + 7 * (t < tUp ? 0 : t < tUp + 1.5 ? (t - tUp) ** 2 / 3 : 0.75 + (t - tUp - 1.5));
const Z0 = -40;
const tLook = g("s5", "look"), tC = g("s5", "mirrors") + 0.15;
const rB = (t) => (t < tLook ? 7 + 2 * (tLook - t) : 7) + 3.5 * sm(tC - 0.2, tC + 1.2, t) - 6 * sm(g("s6", "back"), g("s6", "lane") + 0.8, t);
const xB = (t) => XR * sm(g("s6", "back") - 0.1, g("s6", "lane") + 0.6, t);
const bPath = (t) => [xB(t), Z0 - D(t) + rB(t)];
const cjPath = (t) => [XR - 3.6 * sm(tC, tC + 1.6, t), Z0 - D(t)];
const laneB = (x, r) => (t) => [x, Z0 - D(t) + r];
const carsB = [[XL, 9], [XL, 18], [XL, 27], [XL, -10], [XL, -19], [XL, 36], [XR, 10], [XR, 19], [XR, 28], [XR, -9], [XR, -18], [XR, 37]].map(([x, r]) => laneB(x, r));
const steerB = (t) => 0.4 * sm(g("s5", "turning") - 0.1, g("s5", "turning") + 0.3, t) * (1 - sm(tC + 0.9, tC + 1.5, t));
const headB = (t) => 1.0 * sm(g("s5", "heads") - 0.1, g("s5", "heads") + 0.3, t) * (1 - sm(tC + 0.3, tC + 0.9, t));

// overlays
const gapP = patch(3.0, 13, ORANGE, 1.2); scene.add(gapP);
const rW = ring(0.5, ORANGE), rH = ring(0.32, ORANGE);
const tFast = tag("TOO FAST", RED), tGap = tag("GAP", ORANGE), tWheel = tag("WHEELS TURN", ORANGE), tHead = tag("HEAD CHECK", ORANGE);
const wP = new THREE.Vector3(), hP = new THREE.Vector3();

title("NEVER FILTER MUCH FASTER THAN TRAFFIC");
cap("s2", "jumps", ["A CAR JUMPS LANES", "YOU CAN'T STOP"], RED, { y: 0.3, boom: 0.6 });
cap("s3", "keep", ["MATCH THE", "TRAFFIC SPEED"], GREEN, { y: 0.3 });
cap("s4", "watch", ["WATCH THE GAPS"], GREEN, { y: 0.3 });
cap("s5", "look", ["TURNING WHEELS?", "HEAD CHECK? BACK OFF"], ORANGE, { y: 0.3 });
cap("s6", "traffic", ["TRAFFIC SPEEDS UP?", "GET BACK IN THE LANE"], GREEN, { y: 0.3 });
endCard(["FILTER SLOW.", "READY TO STOP."]);

const Bf = (fn) => (t) => pathState(fn, t);
const SH = [
  // hook: low behind the rider, slow cars sliding past on both sides
  { at: 0, f: Bf(aPath), noRot: 1, K: [[0, [0.4, 2.0, 6, 0, 1.1, -14, 56]], [2.4, [0.5, 2.2, 5.5, 0, 1.1, -14, 54]]] },
  // s2: high behind-right: the car swings out of the left lane, bike hits it
  { at: T2, cam: (t) => { const z = aZ(Math.min(t, tHit)); return [4, 8, z + 13, -0.6, 0.3, z - 5, 50]; } },
  // s3: behind and above, bike creeping past at nearly the same speed
  { at: T3, f: Bf(bPath), noRot: 1, K: [[0, [1.5, 5, 10, 0, 1, -12, 50]], [2.4, [1.6, 5.5, 10, 0, 1, -12, 50]]] },
  // s4: higher, the gap in the left lane ahead
  { at: T4, f: Bf(bPath), noRot: 1, K: [[0, [2.5, 9, 9, -0.8, 0, -12, 50]], [2.4, [2.6, 9.5, 9, -0.8, 0, -12, 50]]] },
  // s5: over the rider's shoulder on the car ahead-right: wheels and head
  { at: T5, calm: 1, cam: (t) => { const b = pathState(bPath, t), c = pathState(cjPath, t); return [c.x - 5.6, 4.2, c.z + 3.2, c.x - 0.4, 1.6, c.z - 0.8, 58]; } },
  // the car cuts across, bike already backing off
  { at: tC + 0.25, f: Bf(bPath), noRot: 1, K: [[0, [-2.5, 7.5, 9, 0.3, 0, -8, 50]], [1.6, [-2.8, 8, 9.5, 0.3, 0, -8, 50]]] },
  // s6: traffic speeds up, bike slots into the right lane
  { at: T6, f: Bf(bPath), noRot: 1, K: [[0, [-3, 7, 11, 1, 0.5, -10, 50]], [2.4, [-3.2, 7.5, 11, 1.2, 0.5, -10, 50]]] },
  { at: T7, f: Bf(bPath), noRot: 1, K: [[0, [-2, 4, 9, 1.2, 1, -14, 50]], [3, [-2.2, 4.5, 9, 1.2, 1, -14, 50]]] },
];

const on = (t, a, b = 1e9) => sm(a - 0.1, a + 0.2, t) * (1 - sm(b - 0.15, b, t));
run("w", (t) => {
  const A = t < T3;
  let st;
  const lanes = A ? carsA : carsB;
  cars.forEach((c, i) => c.set(pathState(lanes[i], t)));
  if (A) {
    const k = kD(t), s0 = pathState(aPath, t);
    st = ride(Bk, aPath, t, t < T2 ? VIOLET : RED, k > 0 ? { lean: 1.45 * k - s0.lean * k, down: k } : {});
    CJ.set(pathState(jPath, t), 0); CJ.driver.rotation.y = 0;
    if (t > tHit + 0.1) { const u = t - tHit - 0.1; pose(THROWN, { x: 0.3 + 0.5 * sm(0, 0.6, u), z: zBH - 1.5 - 3.5 * sm(0, 0.8, u), h: 0, lie: sm(0.1, 0.5, u), armR: 2.4, armL: 2.0, hex: RED }); } else pose(THROWN, { vis: false });
  } else {
    pose(THROWN, { vis: false });
    st = ride(Bk, bPath, t, GREEN, { trail: true });
    CJ.set(pathState(cjPath, t), steerB(t)); CJ.driver.rotation.y = headB(t);
  }
  tagAt(tFast, st.x, 2.6, st.z, A ? on(t, g("s1", "faster"), T2 - 0.1) : 0, 1.4);
  // the gap in the left lane next to the car that will move
  const cj = CJ.g.position;
  gapP.position.set(XL, 0.02, cj.z); gapP.set(!A ? on(t, g("s4", "gaps"), tC + 0.4) * (0.7 + 0.3 * Math.sin(t * 8)) : 0);
  tagAt(tGap, XL, 1.2, cj.z, !A ? on(t, g("s4", "gaps"), T5) : 0, 1.6);
  // wheel + head markers
  CJ.front[0].getWorldPosition(wP); CJ.driver.getWorldPosition(hP);
  const aw = !A ? on(t, g("s5", "turning"), tC + 0.9) : 0, ah = !A ? on(t, g("s5", "heads"), tC + 0.9) : 0;
  rW.set(wP.x - 0.12, wP.y, wP.z, aw); rW.o.rotation.y = Math.PI / 2 + CJ.g.rotation.y;
  rH.set(hP.x, hP.y, hP.z, ah); rH.o.rotation.y = Math.PI / 2 + CJ.g.rotation.y;
  tagAt(tWheel, wP.x - 0.3, 1.25, wP.z - 0.6, aw * 0, 0.9);
  tagAt(tHead, hP.x - 0.4, 2.0, hP.z, ah * 0, 0.9);
  const shot = shoot(SH, t);
  bloom.strength = 1.0 + 1.2 * shot.punch * shot.punch + overlays(t) + (A ? 0.8 * flash(t, tHit + 0.05) : 0);
});
