// 108 visor-fog: wrong = cold morning, the visor fogs white, rider can't see the car braking ahead and hits it (red).
// Right = crack the visor open, anti-fog insert, breathe down, pull over and clear it (green).
import { THREE, S, g, sm, flash, scene, camera, bloom, box, beam, patch, glow, makeCar, VIOLET, ORANGE, RED, GREEN, pathState, shoot, run } from "./kit.js";
import { track, buildRoad, makePerson, pose, title, endCard, cap, overlays, bikes, ride, downLean, tag, tagAt } from "./extra.js";

// ---- props: a white fog layer stuck on the camera (rider POV through a fogged visor) ----
function fogTex() {
  const c = document.createElement("canvas"); c.width = c.height = 512; const x = c.getContext("2d");
  const gr = x.createRadialGradient(256, 256, 40, 256, 256, 360);
  gr.addColorStop(0, "rgba(225,232,240,0.78)"); gr.addColorStop(1, "rgba(240,244,250,1)");
  x.fillStyle = gr; x.fillRect(0, 0, 512, 512);
  let s = 7; const r = () => ((s = (s * 16807) % 2147483647) / 2147483647); // seeded, deterministic
  for (let i = 0; i < 900; i++) { const px = r() * 512, py = r() * 512, rr = 1 + r() * 5; x.fillStyle = `rgba(255,255,255,${0.25 + 0.5 * r()})`; x.beginPath(); x.arc(px, py, rr, 0, 7); x.fill(); }
  return new THREE.CanvasTexture(c);
}
const fogL = new THREE.Mesh(new THREE.PlaneGeometry(1.4, 1.4), new THREE.MeshBasicMaterial({ map: fogTex(), color: 0x9aa3ae, transparent: true, depthTest: false, depthWrite: false, toneMapped: false, fog: false, opacity: 0 }));
fogL.renderOrder = 15; fogL.position.set(0, 0, -0.6); camera.add(fogL); scene.add(camera);

// ---- path integrator (straight road toward -z) -> [x, z, 0] ----
function integ(t0, t1, x0, z0, vF, xF) {
  const dt = 0.01, n = Math.ceil((t1 - t0) / dt) + 1, Z = [z0];
  for (let i = 1; i < n; i++) Z.push(Z[i - 1] - vF(t0 + (i - 0.5) * dt) * dt);
  return (t) => { const f = Math.min(n - 1.001, Math.max(0, (t - t0) / dt)), i = Math.floor(f), r = f - i; return [xF ? xF(t) : x0, Z[i] + (Z[i + 1] - Z[i]) * r, 0]; };
}

scene.fog.density = 0.016;
const { P } = track([{ len: 4000 }]);
buildRoad(P, -80, 2100, { LW: 3.6, lamps: true });
const T2 = S.s2[0], T3 = S.s3[0], T4 = S.s4[0], T5 = S.s5[0], T6 = S.s6[0], T7 = S.s7[0], TE = S.s8[0] + S.s8[1];
const on = (t, a, b = 1e9) => sm(a - 0.1, a + 0.2, t) * (1 - sm(b - 0.15, b, t));
const V3 = (x, y, z) => new THREE.Vector3(x, y, z);
const L3 = (A, B, u) => A.clone().lerp(B, u);

// ---- A: fogged visor, car ahead brakes, rider rides into its back ----
const tHit = g("s2", "hit"), tBrk = g("s2", "braking") - 0.2, kD = (t) => sm(tHit + 0.05, tHit + 0.6, t);
const aPath = (t) => [1.8, t < tHit ? -13 * t : -13 * tHit + 0.5 * sm(tHit, tHit + 0.3, t), 0];
const zHit = -13 * tHit, zCarHit = zHit - 0.68 - 2.15;
const vC = (t) => (t < tHit ? 11 * (1 - sm(tBrk, tBrk + 1.0, t)) : 0);
const cZ = []; for (let i = 0, z = zCarHit; i <= 1000; i++) { cZ.push(z); z += vC(tHit - (i + 0.5) * 0.01) * 0.01; } // backwards from the hit
const carAZ = (t) => (t >= tHit ? zCarHit - 0.3 * sm(tHit, tHit + 0.25, t) : cZ[Math.min(1000, Math.round((tHit - t) / 0.01))]);
const carA = makeCar({ color: 0x1a1534, driver: true });
const brakeA = box(1.7, 0.11, 0.05, 0, 0.74, 2.19, glow(RED, 1), false); carA.g.add(brakeA);

// ---- B: visor cracked open (s3), insert (s4), breath (s5) ----
const bPath = integ(T3 - 1, T6 + 1, 1.8, -400, () => 9);
// ---- F: still fogging, pulls over onto the shoulder and stops ----
const tPull = g("s6", "pull"), tClr = g("s6", "clear");
const fPath = integ(T6 - 1, T7 + 1, 1.8, -900, (t) => 9 * (1 - sm(tPull, tPull + 1.8, t)), (t) => 1.8 + 3.0 * sm(tPull - 0.1, tPull + 1.7, t));
// ---- G: rides on with a clear visor ----
const gPath = integ(T7 - 1, TE + 1, 1.8, -1400, () => 9);

// ---- actors + overlays ----
const [Bk] = bikes(1), THROWN = makePerson();
Bk.visor.scale.set(1.3, 1.9, 1);
const insert = box(0.2, 0.07, 0.012, 0, 0.05, -0.2, glow(GREEN, 2.5), false); Bk.headG.add(insert);
const air = [0, 1, 2, 3].map(() => beam(GREEN, 2.2, 0.018));
const brDown = beam(GREEN, 2.4, 0.035), brUp = beam(RED, 3, 0.045);
const hit = patch(2.0, 1.0, RED, 1.6), shoulder = patch(2.4, 9, GREEN, 0.8);
const tAir = tag("AIR IN", GREEN);

title("NEVER RIDE WITH A FOGGED VISOR");
cap("s2", "visor", ["THE VISOR", "GOES WHITE"], RED, { y: 0.3, until: ["s2", "can't"] });
cap("s2", "can't", ["YOU CAN'T SEE", "THE CAR BRAKING"], RED, { y: 0.3, until: ["s2", "and"] });
cap("s2", "and", "AND YOU HIT IT", RED, { y: 0.3, boom: 0.6 });
cap("s3", "crack", ["CRACK THE VISOR", "OPEN A LITTLE"], GREEN, { y: 0.3, until: ["s3", "let"] });
cap("s3", "let", "LET AIR IN", GREEN, { y: 0.3 });
cap("s4", "use", ["USE AN ANTI-FOG", "INSERT"], GREEN, { y: 0.3 });
cap("s5", "breathe", "BREATHE DOWN", GREEN, { y: 0.3, until: ["s5", "not"] });
cap("s5", "not", ["NOT UP", "INTO THE HELMET"], RED, { y: 0.3 });
cap("s6", "still", "STILL FOGGING?", ORANGE, { y: 0.3, until: ["s6", "pull"] });
cap("s6", "pull", ["PULL OVER", "AND CLEAR IT"], GREEN, { y: 0.3 });
endCard(["FOGGED VISOR?", "OPEN IT, OR STOP."]);

// ---- shots ----
const fol = (fn) => (t) => pathState(fn, t);
const tPOV = g("s2", "visor") - 0.15;
const SH = [
  { at: 0, f: fol(aPath), noRot: true, K: [[0, [1.4, 2.6, -4.6, 0, 1.6, 0, 40]], [T2, [1.1, 2.4, -3.6, 0, 1.65, 0, 38]]] },
  { at: tPOV, f: fol(aPath), noRot: true, K: [[0, [0, 1.75, -0.45, 0, 1.4, -20, 55]], [2, [0, 1.75, -0.45, 0, 1.35, -20, 55]]] },
  { at: tHit - 0.75, K: [[0, [6.5, 3.0, zHit + 7.5, 1.4, 0.8, zHit - 2.5, 50]], [1.6, [6.0, 3.2, zHit + 6.5, 1.6, 0.6, zHit - 2.5, 50]]] },
  { at: T3, f: fol(bPath), noRot: true, K: [[0, [2.2, 1.95, -1.6, 0, 1.7, -0.3, 36]], [2.2, [2.0, 1.9, -1.4, 0, 1.7, -0.3, 36]]] },
  { at: T4, f: fol(bPath), noRot: true, K: [[0, [-1.2, 1.9, -2.2, 0, 1.68, 0, 36]], [2.2, [-1.0, 1.85, -2.0, 0, 1.68, 0, 36]]] },
  { at: T5, f: fol(bPath), noRot: true, K: [[0, [2.4, 1.6, -0.9, 0, 1.85, -0.3, 36]], [2.4, [2.2, 1.6, -1.0, 0, 1.85, -0.3, 36]]] },
  { at: T6, f: fol(fPath), noRot: true, K: [[0, [-3.0, 4.6, 9.0, 1.0, 0.8, -6, 50]], [3, [-2.4, 5.2, 9.5, 1.5, 0.6, -4, 50]]] },
  { at: T7, f: fol(gPath), noRot: true, K: [[0, [1.6, 2.1, -5.0, 0, 1.5, 0, 42]], [4.3, [2.2, 3.4, -8.0, 0, 1.3, 0, 46]]] },
];

// fog on the visor 0..1 (white) over time
const tWhite = g("s2", "white");
const visorFog = (t) => (t < T3 ? 0.55 + 0.45 * sm(tWhite - 0.4, tWhite + 0.3, t)
  : t < T4 ? 1 - sm(g("s3", "air") - 0.6, g("s3", "air") + 0.5, t)
  : t < T5 ? 0 : t < T6 ? 0.7 * sm(g("s5", "up"), g("s5", "up") + 0.4, t)
  : t < T7 ? 0.85 * (1 - sm(tClr, tClr + 0.6, t)) : 0);
// POV fog layer opacity
const povFog = (t) => (t >= tPOV && t < tHit - 0.75 ? 0.3 + 0.5 * sm(tWhite - 0.3, tWhite + 0.6, t) : 0);
const VC = new THREE.Color(VIOLET).multiplyScalar(1.3), FC = new THREE.Color(0xdfe6ee).multiplyScalar(1.1);

run("w", (t) => {
  let st;
  const A = t < T3;
  carA.set(A ? { x: 1.8, z: carAZ(t), h: 0 } : null);
  brakeA.material.color.set(RED).multiplyScalar(1 + 10 * on(t, tBrk, T3));
  // visor: fog colour, open angle, insert
  const vf = visorFog(t);
  Bk.hlight.material.color.set(0xffffff).multiplyScalar(t < T2 || (t >= T3 && t < T6) || t >= T7 ? 0.7 : 1.8);
  Bk.visor.material.color.copy(VC).lerp(FC, vf);
  const open = t >= T3 && t < T4 ? sm(g("s3", "crack"), g("s3", "crack") + 0.4, t) : t >= T6 && t < T7 ? sm(tClr - 0.3, tClr + 0.1, t) : 0;
  Bk.visor.rotation.x = -0.55 * open; Bk.visor.position.set(0, 0.05 + 0.03 * open, -0.18 - 0.02 * open);
  const ki = t >= T4 && t < T5 ? sm(g("s4", "insert") - 0.3, g("s4", "insert"), t) : 0;
  insert.visible = ki > 0.01; insert.scale.setScalar(0.3 + 0.7 * ki);
  if (A) {
    st = ride(Bk, aPath, t, RED, { lean: downLean(kD(t), 1), down: kD(t), trail: false });
    Bk.rider.visible = t < tHit && !(t >= tPOV && t < tHit - 0.75);
    if (t >= tHit) { // thrown forward onto the trunk
      const u = Math.min(1, (t - tHit) / 0.45);
      pose(THROWN, { x: 1.8 + 0.15 * u, z: zHit + 0.1 + (zCarHit + 1.3 - zHit - 0.1) * u, h: 0, lie: 0.35 + 0.65 * u, armR: 2.4, armL: 1.9, hex: RED });
      THROWN.g.position.y += 0.7 * u + 0.6 * Math.sin(Math.PI * u) - 0.3 * sm(0.5, 1, u) + 0.35 * sm(0.5, 1, u);
      THROWN.g.position.z -= 0.3 * sm(tHit, tHit + 0.25, t);
    } else pose(THROWN, { vis: false });
    hit.position.set(1.8, 0.03, zCarHit + 2.4); hit.set(t > tHit - 0.05 ? on(t, tHit, T3) : 0);
  } else {
    pose(THROWN, { vis: false }); hit.set(0);
    const fn = t < T6 ? bPath : t < T7 ? fPath : gPath;
    st = ride(Bk, fn, t, GREEN, { trail: false, still: t >= T6 && t < T7 && t > tPull + 1.8 });
  }
  // s3: air streaks flowing into the cracked visor
  const ka = t >= T3 && t < T4 ? on(t, g("s3", "crack") + 0.3, T4) : 0, hz = st ? st.z : 0, hx = st ? st.x : 0;
  air.forEach((b, i) => {
    const A0 = V3(hx - 0.12 + 0.08 * i, 1.85 + 0.03 * (i % 2), hz - 1.6), B0 = V3(hx - 0.06 + 0.04 * i, 1.73, hz - 0.24);
    const u = (t * 1.6 + i * 0.27) % 1;
    b.set(L3(A0, B0, u), L3(A0, B0, Math.min(1, u + 0.35)), ka * (1 - u * 0.5));
  });
  tagAt(tAir, hx, 2.15, hz - 0.9, ka * on(t, g("s3", "air")), 0.42);
  // s5: breath, green down out of the chin, red up into the visor
  const kd = t >= T5 && t < T6 ? on(t, g("s5", "down"), T6) : 0, ku = t >= T5 && t < T6 ? on(t, g("s5", "up"), T6) : 0;
  const M = V3(hx, 1.58, hz - 0.3), uu = (t * 1.4) % 1;
  brDown.set(L3(M, V3(hx, 1.2, hz - 0.55), uu * 0.4), L3(M, V3(hx, 1.2, hz - 0.55), 0.4 + uu * 0.6), kd);
  const M2 = V3(hx, 1.5, hz - 0.36); brUp.set(L3(M2, V3(hx, 1.8, hz - 0.3), uu * 0.3), L3(M2, V3(hx, 1.8, hz - 0.3), 0.4 + uu * 0.6), ku * (0.6 + 0.4 * Math.sin(t * 20)));
  // s6: the shoulder spot
  const kp = t >= T6 && t < T7 ? on(t, tPull, T7) : 0, zs = fPath(tPull + 2.5)[1];
  shoulder.position.set(4.8, 0.03, zs); shoulder.set(kp * 0.6);
  const shot = shoot(SH, t);
  fogL.material.opacity = povFog(t);
  bloom.strength = 1.0 + 1.2 * shot.punch * shot.punch + overlays(t) + (A ? 1.0 * flash(t, tHit) : 0);
});
