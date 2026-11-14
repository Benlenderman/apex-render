// 112 blind-driveway: wrong = rider passes a tall hedge fast, hugging it; a car reverses out of the hidden driveway and he hits it (red).
// Right = slow down, move to the lane centre, cover the brakes, spot the reverse lights and stop well short (green).
import { THREE, S, g, sm, flash, scene, bloom, glow, VIOLET, ORANGE, RED, GREEN, WHITE, box, patch, road, makeCar, pathState, shoot, run } from "./kit.js";
import { makePerson, pose, title, endCard, cap, overlays, bikes, ride, tag, tagAt } from "./extra.js";

// ---------- props: hedge rows with a driveway gap, house, reverse lights ----------
const ZD = -120, GAP = 3.2;
function hedge(z0, z1) {
  const m = new THREE.MeshStandardMaterial({ color: 0x0d2a1c, emissive: 0x08301c, roughness: 0.9 });
  const len = Math.abs(z1 - z0), b = box(1.4, 2.2, len, 4.9, 1.1, (z0 + z1) / 2, m); scene.add(b);
  for (let z = Math.min(z0, z1) + 1; z < Math.max(z0, z1); z += 2.2) { const s = new THREE.Mesh(new THREE.SphereGeometry(0.85, 10, 8), m); s.position.set(4.9, 2.1, z); scene.add(s); }
}
hedge(ZD + GAP, ZD + 90); hedge(ZD - GAP, ZD - 70);
const drive = patch(5.6, 2 * GAP - 0.4, 0x3a3550, 0.5); drive.position.set(7.6, 0.01, ZD); scene.add(drive); drive.set(1);

const LW = 3.5, V = 14;
road({ lanes: 2, lw: LW, cx: 0.8 - LW / 2 + LW / 2, z0: 60, z1: -400 });
scene.fog.density = 0.012;
const T2 = S.s2[0], T3 = S.s3[0], T4 = S.s4[0], T5 = S.s5[0], T6 = S.s6[0], T7 = S.s7[0];
const car = makeCar({ driver: true, color: 0x6a5ad8 }), [Bk] = bikes(1), THROWN = makePerson();
const mRev = glow(WHITE, 0.2);
car.g.add(box(0.36, 0.12, 0.05, -0.2, 0.74, 2.18, mRev, false), box(0.36, 0.12, 0.05, 0.2, 0.74, 2.18, mRev, false));
// car faces +x (nose into the property), reversing = moving -x into the road
const placeCar = (x) => { car.g.visible = true; car.g.position.set(x, 0, ZD); car.g.rotation.y = Math.PI / 2; };

// ---- A: fast, hugging the hedge; car backs out and the bike hits its side ----
const tHit = g("s2", "hit") - 0.05, XA = 2.9;
const zHit = ZD + 0.93 + 1.05;
const uH = (t) => Math.max(0, t - tHit);
const aZ = (t) => (t < tHit ? zHit + V * (tHit - t) : zHit - 0.6 * (1 - Math.exp(-uH(t) / 0.25)));
const aPath = (t) => [XA + 0.5 * sm(tHit, tHit + 0.5, t), aZ(t)];
const kD = (t) => sm(tHit + 0.05, tHit + 0.45, t);
const tBack = g("s2", "backs") - 0.1;
const carA = (t) => 8.2 - 3.6 * sm(tBack, tHit - 0.05, t);

// ---- B: slow, centre of the lane, stops well short ----
const tStop = T6 + 1.5, ZS = ZD + 12;
const bZ = (t) => ZS + 70 * Math.pow(1 - sm(T3, tStop, t), 1.6);
const xB = (t) => XA - 1.9 * sm(g("s4", "move"), g("s4", "center"), t);
const bPath = (t) => [xB(t), bZ(t)];
const tRevB = g("s6", "reverse") - 0.15;
const carB = (t) => 8.2 - 4.2 * sm(tRevB + 0.3, T7 + 0.4, t);

const tHed = tag("BLIND DRIVEWAY", RED), tCar = tag("CAR BACKING OUT", RED), tRev = tag("REVERSE LIGHTS", GREEN), tBrk = tag("FINGERS ON THE BRAKE", GREEN), tStopT = tag("STOPPED IN TIME", GREEN);
const lane = patch(1.6, 30, GREEN, 1.4); scene.add(lane);

title("NEVER RIDE FAST PAST A BLIND DRIVEWAY");
cap("s2", "backs", ["A CAR BACKS OUT", "WITHOUT LOOKING"], RED, { y: 0.3, boom: 0.6 });
cap("s3", "slow", ["CAN'T SEE IN?", "SLOW DOWN"], GREEN, { y: 0.3 });
cap("s4", "move", ["MOVE AWAY FROM THE HEDGE", "TO THE LANE CENTRE"], GREEN, { y: 0.3 });
cap("s5", "cover", ["COVER YOUR BRAKES"], GREEN, { y: 0.3 });
cap("s6", "watch", ["WATCH FOR", "REVERSE LIGHTS"], GREEN, { y: 0.3 });
endCard(["CAN'T SEE IN?", "SLOW DOWN."]);

const Bf = (fn) => (t) => pathState(fn, t);
const SH = [
  // hook: behind the rider, hedge wall on the right, driveway gap ahead
  { at: 0, f: Bf(aPath), noRot: 1, K: [[0, [-1.6, 2.3, 6.5, 0.8, 1.2, -16, 55]], [2.4, [-1.6, 2.4, 6, 0.8, 1.2, -16, 52]]] },
  // s2: high from across the road: car rolls out of the gap, bike arrives and hits it
  { at: T2, cam: () => [-6.5, 7.5, ZD + 11, 3, 0.5, ZD + 2.5, 50] },
  // s3: behind the rider, slowing
  { at: T3, f: Bf(bPath), noRot: 1, K: [[0, [-1.4, 2.6, 7, 0.6, 1, -16, 52]], [2, [-1.5, 2.8, 6.5, 0.6, 1, -16, 52]]] },
  // s4: high behind: rider moves to the lane centre, green lane strip
  { at: T4, f: Bf(bPath), noRot: 1, K: [[0, [-1, 8, 11, 0.8, 0, -10, 50]], [2.4, [-1, 8.5, 11, 0.8, 0, -10, 50]]] },
  // s5: close front-left on the hands and bars
  { at: T5, f: Bf(bPath), noRot: 1, calm: 1, K: [[0, [-1.8, 1.7, -2.6, 0, 1.1, 0, 38]], [1.4, [-1.9, 1.75, -2.4, 0, 1.1, 0, 38]]] },
  // s6: wide across the road again: reverse lights, car backs out, rider stopped well short
  { at: T6, cam: () => [-4, 10, ZD + 24, 3.5, 0.5, ZD + 1, 48] },
  { at: T7, cam: (t) => [-4.5, 10.5, ZD + 25 + 0.4 * (t - T7), 3.5, 0.5, ZD + 1, 48] },
];

const on = (t, a, b = 1e9) => sm(a - 0.1, a + 0.2, t) * (1 - sm(b - 0.15, b, t));
run("w", (t) => {
  const A = t < T3;
  let st;
  if (A) {
    const k = kD(t), s0 = pathState(aPath, t);
    st = ride(Bk, aPath, t, t < T2 ? VIOLET : RED, k > 0 ? { lean: -1.45 * k - s0.lean * k, down: k } : {});
    placeCar(carA(t));
    if (t > tHit) { const u = t - tHit; pose(THROWN, { x: XA + 0.8 * sm(0, 0.5, u), z: zHit - 1 - 4.2 * sm(0, 0.7, u), h: 0, lie: sm(0.2, 0.6, u), armR: 2.4, armL: 2.0, hex: RED }); } else pose(THROWN, { vis: false });
    mRev.color.set(WHITE).multiplyScalar(t > tBack ? 3 : 0.2);
  } else {
    pose(THROWN, { vis: false });
    st = ride(Bk, bPath, t, GREEN, { trail: true });
    placeCar(carB(t));
    mRev.color.set(WHITE).multiplyScalar(t > tRevB ? 3 + 2 * Math.sin(t * 12) * (t < T7 ? 1 : 0) : 0.2);
  }
  // tags
  tagAt(tHed, 5, 3.6, ZD, A ? on(t, g("s1", "hedge"), T2) : 0, 4);
  tagAt(tCar, car.g.position.x, 2.8, ZD, 0, 2.4);
  tagAt(tRev, car.g.position.x - 1, 2.6, ZD, !A ? on(t, g("s6", "reverse"), T7 + 0.4) * 0 : 0, 2.4);
  tagAt(tBrk, st ? st.x : 0, 2.2, st ? st.z : 0, !A ? on(t, g("s5", "cover"), T6) : 0, 0.6);
  tagAt(tStopT, st ? st.x - 1.8 : 0, 2.6, st ? st.z : 0, !A ? on(t, T7 - 0.1) : 0, 1.3);
  lane.position.set(XA - 1.9, 0.02, ZS - 2); lane.set(!A ? on(t, g("s4", "center"), T5) * 0.8 : 0);
  const shot = shoot(SH, t);
  bloom.strength = 1.0 + 1.2 * shot.punch * shot.punch + overlays(t) + (A ? 0.8 * flash(t, tHit + 0.05) : 0);
});
