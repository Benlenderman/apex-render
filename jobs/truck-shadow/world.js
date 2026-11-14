// 111 truck-shadow: wrong = rider sits close behind a truck, can't see the road, truck can't see him, a hole appears from under the trailer and he goes down (red).
// Right = drop back until he sees the truck's mirrors (and the driver), spots the next hole early, then passes quickly (green).
import { THREE, S, g, sm, flash, scene, bloom, glow, VIOLET, ORANGE, RED, GREEN, patch, beam, road, makeTruck, pathState, shoot, run } from "./kit.js";
import { makePerson, pose, title, endCard, cap, overlays, bikes, ride, tag, tagAt } from "./extra.js";

// ---------- props: pothole with a glowing rim, driver's face for the mirror ----------
function hole(x, z, r = 0.55) {
  const G = new THREE.Group(); G.position.set(x, 0, z); scene.add(G);
  const pit = new THREE.Mesh(new THREE.CircleGeometry(r, 28), new THREE.MeshBasicMaterial({ color: 0x000000 })); pit.rotation.x = -Math.PI / 2; pit.position.y = 0.012; pit.scale.set(1, 0.75, 1); G.add(pit);
  const rimM = glow(ORANGE, 1.2); const rim = new THREE.Mesh(new THREE.RingGeometry(r, r + 0.09, 28), rimM); rim.rotation.x = -Math.PI / 2; rim.position.y = 0.016; rim.scale.set(1, 0.75, 1); G.add(rim);
  return { g: G, set(hex, k) { rimM.color.set(hex).multiplyScalar(k); } };
}
function faceMesh() {
  const c = document.createElement("canvas"); c.width = 128; c.height = 256;
  const x = c.getContext("2d"); x.fillStyle = "#fff"; x.beginPath(); x.ellipse(64, 120, 46, 62, 0, 0, 7); x.fill(); x.fillStyle = "#000"; x.beginPath(); x.arc(46, 110, 9, 0, 7); x.arc(82, 110, 9, 0, 7); x.fill(); x.fillRect(48, 150, 32, 7);
  return new THREE.Mesh(new THREE.PlaneGeometry(0.3, 0.6), new THREE.MeshBasicMaterial({ map: new THREE.CanvasTexture(c), color: new THREE.Color(0xffe2c0).multiplyScalar(0.8), transparent: true, toneMapped: false, opacity: 0 }));
}

const LW = 3.6, XL = -LW / 2, XR = LW / 2, V = 12;
road({ lanes: 2, lw: LW, z0: 80, z1: -900 });
scene.fog.density = 0.011;
const T2 = S.s2[0], T3 = S.s3[0], T4 = S.s4[0], T5 = S.s5[0], T6 = S.s6[0], T7 = S.s7[0];
const truck = makeTruck(), [Bk] = bikes(1), THROWN = makePerson();
const truckP = (t) => [XR, -V * t];

// ---- A: 5 m behind the trailer (trailer ends 15 m behind the cab front) ----
const GAPA = 15 + 5, tHit = g("s2", "truck") - 0.05;
const zHit = -V * tHit + GAPA;
const uH = (t) => Math.max(0, t - tHit);
const aZ = (t) => (t < tHit ? -V * t + GAPA : zHit - V * 0.7 * (1 - Math.exp(-uH(t) / 0.7)));
const aPath = (t) => [XR + 0.6 * sm(tHit, tHit + 0.9, t), aZ(t)];
const kD = (t) => sm(tHit + 0.05, tHit + 0.45, t);
const holeA = hole(XR, zHit - 0.3);

// ---- B: drop back to 30 m, slightly left in the lane so the left mirror shows; then pass in the left lane ----
const gapB = (t) => GAPA + 25 * sm(g("s3", "drop") - 0.1, g("s3", "drop") + 1.6, t) - 58 * sm(T6 + 0.3, T7 + 0.4, t);
const xB = (t) => XR - 0.8 * sm(g("s3", "drop"), g("s3", "drop") + 1.2, t) - (LW - 0.8) * sm(T6 - 0.2, T6 + 0.7, t);
const bPath = (t) => [xB(t), -V * t + gapB(t)];
const tRev = g("s5", "see") - 0.2; // truck's rear uncovers the second hole
const holeB = hole(XR, -V * tRev + 15);

// overlays: truck-attached zones, mirror face, sight lines
const zGap = patch(2.4, 5, RED, 1.4); zGap.position.set(0, 0.03, 17.5); truck.g.add(zGap);
const zBlind = patch(2.6, 9, RED, 1.4); zBlind.position.set(0, 0.03, 21); truck.g.add(zBlind);
const zSide = patch(2.6, 15, RED, 1.2); zSide.position.set(-3.6, 0.03, 7); truck.g.add(zSide);
const face = faceMesh(); face.position.set(-1.8, 2.5, -0.9); truck.g.add(face);
const sight = beam(GREEN, 2.2, 0.05), sightDrv = beam(GREEN, 2.2, 0.05);
const vA = new THREE.Vector3(), mirP = new THREE.Vector3(), drvP = new THREE.Vector3();
const tHole = tag("HOLE", RED), tHole2 = tag("HOLE", ORANGE), tClose = tag("TOO CLOSE", RED);

title("NEVER RIDE IN A TRUCK'S SHADOW");
cap("s2", "can't", ["YOU CAN'T SEE", "THE ROAD AHEAD"], RED, { until: ["s2", "truck"], y: 0.3 });
cap("s2", "truck", ["THE TRUCK", "CAN'T SEE YOU"], RED, { y: 0.3, boom: 0.6 });
cap("s3", "drop", ["DROP BACK", "TILL YOU SEE ITS MIRRORS"], GREEN, { y: 0.3 });
cap("s4", "if", ["SEE THE DRIVER'S MIRRORS?", "THEY SEE YOU"], GREEN, { y: 0.3 });
cap("s5", "hang", ["HANG BACK.", "SEE THE HOLE IN TIME"], GREEN, { y: 0.3 });
cap("s6", "passing", ["DON'T WAIT BESIDE IT.", "PASS QUICKLY"], ORANGE, { y: 0.3 });
endCard(["SEE THE MIRRORS.", "OR DROP BACK."]);

const Tk = (t) => pathState(truckP, t), Bf = (fn) => (t) => pathState(fn, t);
const tM = g("s4", "if") - 0.05, tThey = g("s4", "they") - 0.05;
const SH = [
  // hook: low behind the rider, the trailer wall fills the frame
  { at: 0, f: Bf(aPath), noRot: 1, K: [[0, [0.9, 1.7, 4.2, 0, 2.0, -12, 58]], [2.6, [1.1, 1.9, 3.6, 0, 2.2, -12, 56]]] },
  // s2: high behind-right, the trailer uncovers the hole a moment before the front wheel hits it
  { at: T2, f: Tk, noRot: 1, K: [[0, [5.5, 9, 34, 0, 0.5, 18, 48]], [3.4, [5.5, 9.5, 40, 0, 0.5, 22, 48]]] },
  // s3: high behind the rider, the gap opens
  { at: T3, f: Bf(bPath), noRot: 1, K: [[0, [3, 6, 9, 0, 1.2, -16, 50]], [2.5, [3, 7, 11, 0, 1.2, -22, 50]]] },
  // s4: over the rider's shoulder, long lens on the truck's left mirror, then a high side view of both sight lines
  { at: T4, calm: 1, cam: (t) => { const b = pathState(bPath, t); truck.set(Tk(t)); truck.g.updateMatrixWorld(true); truck.mirrors[0].getWorldPosition(mirP); return [b.x - 0.3, 2.0, b.z + 1.3, mirP.x, mirP.y, mirP.z, 6]; } },
  { at: tThey, f: Bf(bPath), noRot: 1, K: [[0, [-2.5, 5, 8.5, 0.5, 0, -22, 50]], [1.6, [-2.8, 5.5, 9, 0.5, 0, -22, 50]]] },
  // s5: low behind the rider looking down the road
  { at: T5, f: Bf(bPath), noRot: 1, K: [[0, [1.4, 3.4, 8, 0.3, 0.6, -30, 46]], [3, [1.4, 3.4, 7.5, 0.3, 0.6, -30, 46]]] },
  // s6: the pass, high from behind-left
  { at: T6, f: Bf(bPath), noRot: 1, K: [[0, [-3.5, 6, 12, -0.5, 1, -10, 50]], [2.2, [-4, 7, 11, -0.5, 1, -8, 50]]] },
  // s7: ahead, looking back: rider clear in front of the truck
  { at: T7, f: Tk, noRot: 1, K: [[0, [-6, 5, -30, -1.5, 1, -8, 50]], [3, [-6.5, 6, -33, -1.5, 1, -9, 50]]] },
];

const on = (t, a, b = 1e9) => sm(a - 0.1, a + 0.2, t) * (1 - sm(b - 0.15, b, t));
run("w", (t) => {
  const A = t < T3, ts = Tk(t);
  truck.set(ts);
  let st;
  if (A) {
    const k = kD(t), s0 = pathState(aPath, t);
    st = ride(Bk, aPath, t, t < T2 ? VIOLET : RED, k > 0 ? { lean: 1.45 * k - s0.lean * k, down: k } : {});
    if (t > tHit + 0.15) { const u = t - tHit - 0.15; pose(THROWN, { x: XR + 0.3, z: zHit - 1.8 - 4.5 * sm(0, 0.9, u), h: 0.4, lie: sm(0, 0.35, u), armR: 2.4, armL: 1.8, hex: RED }); } else pose(THROWN, { vis: false });
  } else {
    pose(THROWN, { vis: false });
    st = ride(Bk, bPath, t, t < T6 ? GREEN : ORANGE, { trail: true });
  }
  // zones
  zGap.set(A ? on(t, g("s1", "never"), T2) * (0.75 + 0.25 * Math.sin(t * 9)) : 0);
  zBlind.set(A ? on(t, g("s2", "truck"), T3) * 0.9 : 0);
  zSide.set(!A ? on(t, g("s6", "don't"), T7) * 0.7 : 0);
  tagAt(tClose, ts.x, 3.4, ts.z + 17.5, A ? on(t, g("s1", "close"), T2) : 0, 1.3);
  // holes
  holeA.set(RED, A ? 1.2 + 2.5 * on(t, tHit - 0.6) : 0.6);
  tagAt(tHole, XR, 1.1, zHit - 0.3, A ? on(t, tHit - 0.45, T3) : 0, 1.2);
  holeB.set(ORANGE, A ? 0.6 : 1.2 + 2.5 * on(t, tRev, T6 + 1));
  tagAt(tHole2, XR, 1.4, -V * tRev + 15, !A ? on(t, g("s5", "hole"), T6 + 0.6) : 0, 2.4);
  // mirror: face shows in it during s4, sight lines rider <-> mirror <-> driver
  const mir = truck.mirrors[0]; mir.getWorldPosition(mirP); Bk.visor.getWorldPosition(vA); truck.driver.getWorldPosition(drvP);
  const mk = !A && t < T5 ? on(t, g("s3", "mirrors"), T5) : 0;
  const close = t > T4 - 0.05 && t < tThey; mir.material.color.set(mk > 0 ? GREEN : VIOLET).multiplyScalar(close ? 0.5 : 2.2 + 2.5 * mk);
  face.material.opacity = !A && t < T5 ? on(t, tM, T5) : 0;
  sight.set(vA, mirP, !A && t < T5 && !close ? on(t, g("s3", "mirrors"), T5) : 0);
  sightDrv.set(drvP, mirP, !A && t < T5 ? on(t, tThey + 0.05, T5) : 0);
  const shot = shoot(SH, t);
  bloom.strength = 1.0 + 1.2 * shot.punch * shot.punch + overlays(t) + (A ? 0.8 * flash(t, tHit + 0.1) : 0);
});
