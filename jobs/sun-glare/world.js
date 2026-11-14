// 106 sun-glare: wrong = rider keeps full speed into a low sun, can't see the car stopped ahead and rides into its back (red).
// Right = slow down when the glare hits, tuck the head, use the visor's sun shade, oncoming drivers can't see you, leave a bigger gap and stop in time (green).
import { THREE, S, g, sm, flash, scene, camera, bloom, box, beam, patch, glow, makeCar, VIOLET, ORANGE, RED, GREEN, pathState, shoot, run } from "./kit.js";
import { track, buildRoad, makePerson, pose, title, endCard, cap, overlays, bikes, ride, downLean, tag, tagAt } from "./extra.js";

// ---- props: low sun (disc + halo + warm horizon band) kept 520 m ahead of the camera, plus a lens glare on the camera ----
function radial(stops) {
  const c = document.createElement("canvas"); c.width = c.height = 256; const x = c.getContext("2d"), gr = x.createRadialGradient(128, 128, 0, 128, 128, 128);
  for (const [o, col] of stops) gr.addColorStop(o, col); x.fillStyle = gr; x.fillRect(0, 0, 256, 256); return new THREE.CanvasTexture(c);
}
const add = (o) => ({ transparent: true, depthWrite: false, toneMapped: false, fog: false, blending: THREE.AdditiveBlending, ...o });
const sun = new THREE.Mesh(new THREE.CircleGeometry(11, 48), new THREE.MeshBasicMaterial({ color: new THREE.Color(0xffe6b8).multiplyScalar(3), toneMapped: false, fog: false }));
const halo = new THREE.Mesh(new THREE.PlaneGeometry(130, 130), new THREE.MeshBasicMaterial(add({ map: radial([[0, "rgba(255,200,130,1)"], [0.15, "rgba(255,150,80,0.55)"], [0.5, "rgba(255,90,60,0.12)"], [1, "rgba(0,0,0,0)"]]) })));
const band = new THREE.Mesh(new THREE.PlaneGeometry(1600, 90), new THREE.MeshBasicMaterial(add({ map: radial([[0, "rgba(255,130,70,0.7)"], [0.6, "rgba(160,60,90,0.18)"], [1, "rgba(0,0,0,0)"]]) })));
for (const m of [band, halo, sun]) { m.frustumCulled = false; scene.add(m); }
const glare = new THREE.Mesh(new THREE.PlaneGeometry(1.1, 1.1), new THREE.MeshBasicMaterial(add({ depthTest: false, map: radial([[0, "rgba(255,246,225,1)"], [0.12, "rgba(255,230,190,0.75)"], [0.4, "rgba(255,170,110,0.25)"], [1, "rgba(0,0,0,0)"]]) })));
glare.renderOrder = 15; camera.add(glare);
const SUN = new THREE.Vector3();
function placeSun(G) {
  const c = camera.position; SUN.set(c.x, 9, c.z - 520);
  sun.position.copy(SUN); halo.position.set(SUN.x, SUN.y, SUN.z - 2); band.position.set(c.x, 6, c.z - 540);
  for (const m of [sun, halo, band]) m.quaternion.copy(camera.quaternion);
  const v = SUN.clone().project(camera), hh = Math.tan(THREE.MathUtils.degToRad(camera.fov / 2)), face = v.z < 1 ? 1 - sm(0.8, 1.5, Math.max(Math.abs(v.x), Math.abs(v.y))) : 0;
  glare.position.set(v.x * hh * camera.aspect, v.y * hh, -1); glare.material.opacity = 0.32 * G * face;
  return face;
}

// ---- path integrator (straight road, heading fixed) -> [x, z, h] ----
function integ(t0, t1, x0, z0, vF, h = 0) {
  const dt = 0.01, n = Math.ceil((t1 - t0) / dt) + 1, Z = [z0], dir = h === 0 ? -1 : 1;
  for (let i = 1; i < n; i++) Z.push(Z[i - 1] + dir * vF(t0 + (i - 0.5) * dt) * dt);
  return (t) => { const f = Math.min(n - 1.001, Math.max(0, (t - t0) / dt)), i = Math.floor(f), r = f - i; return [x0, Z[i] + (Z[i + 1] - Z[i]) * r, h]; };
}

scene.fog.density = 0.009;
const { P } = track([{ len: 4000 }]);
buildRoad(P, -80, 2100, { LW: 3.6, lamps: true });
const T2 = S.s2[0], T3 = S.s3[0], T4 = S.s4[0], T5 = S.s5[0], T6 = S.s6[0], T7 = S.s7[0], TE = S.s8[0] + S.s8[1];
const on = (t, a, b = 1e9) => sm(a - 0.1, a + 0.2, t) * (1 - sm(b - 0.15, b, t));
const V3 = (x, y, z) => new THREE.Vector3(x, y, z);

// ---- A: full speed into the sun, rear-ends a stopped car ----
const tHit = g("s2", "into"), kD = (t) => sm(tHit + 0.05, tHit + 0.6, t);
const aPath = (t) => [1.8, t < tHit ? -14 * t : -14 * tHit + 0.5 * sm(tHit, tHit + 0.3, t), 0];
const zHit = -14 * tHit, zCarA = zHit - 0.68 - 2.15;
const carA = makeCar({ color: 0x1a1534, driver: true });

// ---- B: slows down when the glare hits, tucks the head, drops the sun shade ----
const tSlow = g("s3", "slow");
const bPath = integ(T3 - 1, T5 + 1, 1.8, -400, (t) => 14 - 7 * sm(tSlow, tSlow + 1.1, t));
const shade = box(0.25, 0.075, 0.035, 0, 0.16, -0.2, new THREE.MeshStandardMaterial({ color: 0x120c24, emissive: 0x3a1f10, roughness: 0.1, metalness: 0.5, transparent: true, opacity: 0.92 }), false);
const tShade = g("s4", "shade") - 0.25, tTuck = g("s4", "tuck");

// ---- E: oncoming car drives into the sun, rider comes the other way with the sun behind him ----
const tPass = g("s5", "you", 2) + 0.5;
const ePath = (t) => [-1.8, -900 + 10 * (t - tPass), Math.PI];
const cPath = (t) => [1.8, -900 - 11 * (t - tPass), 0];
const carE = makeCar({ color: 0x5246c8, driver: true });

// ---- F: bigger gap behind a car, car brakes, rider stops in time ----
const tBr = g("s6", "ready"), tBig = g("s6", "bigger");
const fCar = integ(T6 - 1, T7 + 2, 1.8, -1300, (t) => 9 * (1 - sm(tBr, tBr + 0.8, t)));
const fBike = integ(T6 - 1, T7 + 2, 1.8, -1300 + 2.15 + 0.68 + 6, (t) => (9 - 4 * sm(T6 - 0.3, tBig + 0.3, t)) * (1 - sm(tBr + 0.25, tBr + 1.25, t)));
const carF = makeCar({ color: 0x4a40b8, driver: true });
const brakeF = box(1.7, 0.11, 0.05, 0, 0.74, 2.19, glow(RED, 1), false); carF.g.add(brakeF);

// ---- G: rides slowly into the sun ----
const gPath = integ(T7 - 1, TE + 1, 1.8, -1800, () => 6);

// ---- actors + overlays ----
const [Bk] = bikes(1), THROWN = makePerson();
Bk.headG.add(shade);
const sight = beam(RED, 1.8, 0.03), gapG = patch(1.6, 1, GREEN, 0.9), stopG = patch(1.4, 1, GREEN, 0.9), hit = patch(2.0, 1.0, RED, 1.6);
const tCar = tag("STOPPED CAR", RED), tStop = tag("STOPPING DISTANCE", GREEN), tShd = tag("SUN SHADE", GREEN), tBlind = tag("CAN'T SEE YOU", RED),
  tGap = tag("BIG GAP", GREEN), tReady = tag("READY", ORANGE);

title("NEVER RIDE INTO LOW SUN AT FULL SPEED");
cap("s2", "can't", ["YOU CAN'T SEE", "THE STOPPED CAR"], RED, { y: 0.3, until: ["s2", "and"] });
cap("s2", "and", ["YOU RIDE", "STRAIGHT INTO IT"], RED, { y: 0.3, boom: 0.6 });
cap("s3", "slow", ["SLOW DOWN AS SOON", "AS THE GLARE HITS"], GREEN, { y: 0.3 });
cap("s4", "tuck", "TUCK YOUR HEAD DOWN", GREEN, { y: 0.3, until: ["s4", "use"] });
cap("s4", "use", ["USE YOUR VISOR'S", "SUN SHADE"], GREEN);
cap("s5", "drivers", ["ONCOMING DRIVERS", "ARE BLIND TOO"], ORANGE, { until: ["s5", "and"] });
cap("s5", "and", "THEY CAN'T SEE YOU", RED);
cap("s6", "leave", "LEAVE A BIGGER GAP", GREEN, { until: ["s6", "and"] });
cap("s6", "and", ["BE READY", "TO STOP"], GREEN);
endCard(["CAN'T SEE?", "SLOW DOWN."]);

// ---- shots ----
const fol = (fn) => (t) => pathState(fn, t);
const SH = [
  { at: 0, f: fol(aPath), noRot: true, K: [[0, [-1.2, 2.3, 6.0, 0.4, 1.4, -20, 50]], [2.1, [-1.4, 2.5, 5.6, 0.4, 1.4, -20, 50]]] },
  { at: T2, f: fol(aPath), noRot: true, K: [[0, [1.4, 1.5, 4.5, -0.2, 1.3, -20, 46]], [1.4, [1.6, 1.6, 4.2, -0.2, 1.3, -20, 46]]] },
  { at: tHit - 0.75, K: [[0, [6.5, 3.0, zHit + 7.5, 1.4, 0.8, zHit - 2.5, 50]], [1.6, [6.0, 3.2, zHit + 6.5, 1.6, 0.6, zHit - 2.5, 50]]] },
  { at: T3, f: fol(bPath), noRot: true, K: [[0, [-1.4, 3.0, 7.0, 0.3, 1.0, -20, 50]], [1.8, [-1.6, 3.4, 7.5, 0.3, 1.0, -20, 50]]] },
  { at: T4, f: fol(bPath), noRot: true, K: [[0, [1.9, 2.1, -3.8, 0, 1.3, 0, 40]], [2.2, [1.7, 2.0, -3.4, 0, 1.35, 0, 40]]] },
  { at: T5, f: fol(cPath), noRot: true, K: [[0, [1.5, 3.4, 10, -1.6, 0.6, -25, 46]], [2.7, [1.6, 3.4, 9.0, -1.6, 0.6, -25, 46]]] },
  { at: T6, f: fol(fBike), noRot: true, K: [[0, [-3.5, 4.8, 8.0, -0.6, 0.5, -9, 50]], [1.9, [-3.5, 5.0, 7.5, -0.6, 0.5, -9, 50]]] },
  { at: T7, f: fol(gPath), noRot: true, K: [[0, [-2.0, 4.5, 9.5, 0.4, 1.0, -30, 50]], [4.3, [-2.0, 6.5, 12.0, 0.4, 0.8, -30, 50]]] },
];

// glare strength: full into the sun, cut by the visor shade in s4
const glareK = (t) => (t < T4 ? 0.95 : t < T5 ? 0.95 - 0.6 * sm(tShade, tShade + 0.4, t) : t < T6 ? 0.95 : t < T7 ? 0.7 : 0.8 - 0.3 * sm(S.s8[0], S.s8[0] + 1, t));

run("w", (t) => {
  let st;
  const A = t < T3;
  // cars
  carA.set(A ? { x: 1.8, z: zCarA - 0.3 * sm(tHit, tHit + 0.25, t), h: 0 } : null);
  const cE = cPath(t); carE.set(t >= T5 && t < T6 ? { x: cE[0], z: cE[1], h: 0 } : null);
  const cF = fCar(t); carF.set(t >= T6 && t < T7 ? { x: cF[0], z: cF[1], h: 0 } : null);
  const brk = on(t, tBr, T7);
  brakeF.material.color.set(RED).multiplyScalar(1 + 9 * brk);
  // rider
  Bk.headG.rotation.x = t >= T4 && t < T5 ? -0.3 * sm(tTuck, tTuck + 0.3, t) : t >= T6 ? -0.2 : 0;
  const ks = t >= T4 && t < T5 ? sm(tShade, tShade + 0.35, t) : t >= T6 ? 1 : 0;
  shade.visible = ks > 0.01; shade.position.y = 0.16 - 0.11 * ks;
  Bk.tail.material.color.set(RED).multiplyScalar(t >= T6 && t < T7 && t > tBr + 0.2 ? 12 : 3);
  if (A) {
    st = ride(Bk, aPath, t, RED, { lean: downLean(kD(t), 1), down: kD(t) });
    Bk.rider.visible = t < tHit;
    if (t >= tHit) { // thrown forward onto the trunk
      const u = Math.min(1, (t - tHit) / 0.45);
      pose(THROWN, { x: 1.8 + 0.15 * u, z: zHit + 0.1 + (zCarA + 1.3 - zHit - 0.1) * u, h: 0, lie: 0.35 + 0.65 * u, armR: 2.4, armL: 1.9, hex: RED });
      THROWN.g.position.y += 0.7 * u + 0.6 * Math.sin(Math.PI * u) - 0.3 * sm(0.5, 1, u) + 0.35 * sm(0.5, 1, u);
      THROWN.g.position.z -= 0.3 * sm(tHit, tHit + 0.25, t);
    } else pose(THROWN, { vis: false });
    tagAt(tCar, 1.8, 2.6, zCarA, on(t, g("s2", "car"), tHit - 0.2) * 0.85, 2.2);
    hit.position.set(1.8, 0.03, zCarA + 2.4); hit.set(t > tHit - 0.05 ? on(t, tHit, T3) : 0);
  } else {
    pose(THROWN, { vis: false }); hit.set(0);
    const fn = t < T5 ? bPath : t < T6 ? ePath : t < T7 ? fBike : gPath;
    st = ride(Bk, fn, t, t >= T5 && t < T6 ? VIOLET : GREEN, { trail: true });
  }
  // s3: stopping distance shrinks as he slows (v^2 / 2a)
  const sd = t >= T3 && t < T4 ? on(t, tSlow, T4) : 0, L = st ? (st.v * st.v) / 14 : 1;
  stopG.scale.set(1, Math.max(0.5, L), 1); stopG.position.set(1.8, 0.03, st ? st.z - 0.7 - L / 2 : 0); stopG.set(sd * 0.8);
  tagAt(tStop, 1.2, 0.6, st ? st.z - 0.7 - L * 0.6 : 0, sd, 1.0);
  tagAt(tShd, st ? st.x + 0.15 : 0, 2.0, st ? st.z - 0.2 : 0, 0, 0.42);
  // s5: driver's line of sight to the rider is lost in the glare
  const bl = t >= T5 && t < T6 ? on(t, g("s5", "blind"), T6) : 0, eR = ePath(t);
  sight.set(V3(cE[0] - 0.4, 1.25, cE[1] + 0.4), V3(eR[0], 1.6, eR[1]), bl * (0.6 + 0.4 * Math.sin(t * 18)));
  tagAt(tBlind, eR[0] + 1.4, 2.6, eR[1], t >= T5 && t < T6 ? on(t, g("s5", "can't"), T6) : 0, 1.6);
  // s6: the gap to the car ahead
  const gp = t >= T6 && t < T7 ? on(t, tBig, T7) : 0, bF = fBike(t), gz0 = cF[1] + 2.15, gz1 = bF[1] - 0.68, GL = Math.max(0.5, gz1 - gz0);
  gapG.scale.set(1, GL, 1); gapG.position.set(1.8, 0.03, (gz0 + gz1) / 2); gapG.set(gp * 0.7);
  tagAt(tGap, 1.8, 0.7, (gz0 + gz1) / 2, gp, 1.5);
  tagAt(tReady, 1.0, 2.4, bF[1], 0, 0.9);
  const shot = shoot(SH, t);
  placeSun(glareK(t));
  bloom.strength = 1.0 + 1.2 * shot.punch * shot.punch + overlays(t) + (A ? 1.0 * flash(t, tHit) : 0);
});
