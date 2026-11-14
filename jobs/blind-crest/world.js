// 107 blind-crest: wrong = rider overtakes a slow car before a hilltop, an oncoming car comes over the top, head-on crash (red).
// Right = stay behind until you can see over the crest, wait for a long straight with a clear view, check ahead + mirror, pass fast, back in with room (green).
import { THREE, S, g, sm, flash, scene, bloom, glow, beam, patch, makeCar, keys, VIOLET, ORANGE, RED, GREEN, mFrame, pathState, shoot, run, box } from "./kit.js";
import { makePerson, pose, title, endCard, cap, overlays, bikes, ride, downLean, tag, tagAt, dist } from "./extra.js";

// ---- props: a hill with a crest at zC (road runs along -z, gentle climb, steeper drop behind the top so the far side is hidden) ----
const zC = -60, HH = 6, WB = 36, WF = 18;
const Y = (z) => HH * Math.exp(-(((z - zC) / (z > zC ? WB : WF)) ** 2));
const slope = (z, h) => Math.atan(((Y(z - 0.05) - Y(z + 0.05)) / 0.1) * (h === 0 ? 1 : -1)); // nose-up angle for heading h (0 = -z)
const lift = (z) => 0.004 + 0.03 * sm(0, 0.3, Y(z));
function ribbonY(x0, x1, z0, z1, mat, dy = 0, step = 1) {
  const pos = [], idx = []; let n = 0;
  for (let z = z0; z >= z1 - 1e-6; z -= step, n++) { const y = Y(z) + lift(z) + dy; pos.push(x0, y, z, x1, y, z); if (n) { const k = 2 * n; idx.push(k - 2, k - 1, k, k - 1, k + 1, k); } }
  const geo = new THREE.BufferGeometry(); geo.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3)); geo.setIndex(idx); geo.computeVertexNormals();
  const m = new THREE.Mesh(geo, mat); m.material.side = THREE.DoubleSide; scene.add(m); return m;
}
// terrain skin + its own grid lines (the kit's flat grid stays underneath where the hill is ~0)
{
  const tz0 = zC + 110, tz1 = zC - 70, pos = [], idx = []; let n = 0;
  for (let z = tz0; z >= tz1; z -= 1, n++) { const y = Y(z) - 0.03; pos.push(-200, y, z, 200, y, z); if (n) { const k = 2 * n; idx.push(k - 2, k - 1, k, k - 1, k + 1, k); } }
  const geo = new THREE.BufferGeometry(); geo.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3)); geo.setIndex(idx);
  scene.add(new THREE.Mesh(geo, new THREE.MeshBasicMaterial({ color: 0x07051c, side: THREE.DoubleSide })));
  const L = [], mL = new THREE.LineBasicMaterial({ color: 0x1c1752, toneMapped: false });
  for (let x = -150; x <= 150; x += 2) for (let z = tz0; z > tz1; z -= 1) if (Y(z) > 0.05 || Y(z - 1) > 0.05) L.push(x, Y(z), z, x, Y(z - 1), z - 1);
  for (let z = Math.round(tz0 / 2) * 2; z > tz1; z -= 2) if (Y(z) > 0.05) L.push(-150, Y(z), z, 150, Y(z), z);
  const lg = new THREE.BufferGeometry(); lg.setAttribute("position", new THREE.Float32BufferAttribute(L, 3)); scene.add(new THREE.LineSegments(lg, mL));
}
const LW = 3.6, RZ0 = 160, RZ1 = -420;
ribbonY(-LW - 0.5, LW + 0.5, RZ0, RZ1, new THREE.MeshStandardMaterial({ color: 0x0f0c2c, roughness: 0.9 }));
for (const sd of [-1, 1]) ribbonY(sd * (LW + 0.3) - 0.04, sd * (LW + 0.3) + 0.04, RZ0, RZ1, mFrame, 0.016, 0.5);
const mDash = glow(VIOLET, 1.1);
for (let z = RZ0; z > RZ1; z -= 4) ribbonY(-0.06, 0.06, z, z - 1.6, mDash, 0.008, 0.4);
for (let z = RZ0, i = 0; z > RZ1; z -= 20, i++) { const sd = i % 2 ? -1 : 1, y = Y(z); scene.add(box(0.1, 4, 0.1, sd * (LW + 1.6), y + 2, z, mFrame, false), box(0.12, 0.08, 0.12, sd * (LW + 1.2), y + 4, z, glow(VIOLET, 2.0), false)); }
// glowing strip on the left lane for "clear view" (follows the hill)
const mView = new THREE.MeshBasicMaterial({ color: new THREE.Color(GREEN).multiplyScalar(0.9), toneMapped: false, transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false });
let viewStrip = null;

const hillFix = (o, z, h) => { o.position.y += Y(z); o.rotation.x = slope(z, h); };

scene.fog.density = 0.011;
const T2 = S.s2[0], T3 = S.s3[0], T4 = S.s4[0], T5 = S.s5[0], T6 = S.s6[0], T7 = S.s7[0];
const on = (t, a, b = 1e9) => sm(a - 0.1, a + 0.2, t) * (1 - sm(b - 0.15, b, t));
const V3 = (x, y, z) => new THREE.Vector3(x, y, z);

// ---- A: pulls out before the crest, oncoming car comes over the top, head-on ----
const tPull = g("s2", "pull"), tTop = g("s2", "top"), tHit = g("s2", "nowhere") + 0.15, VE = 15;
const vA = (t) => 8 + 6 * sm(tPull, tPull + 1.0, t), DA = dist(vA, 0, tHit + 3);
const zEHit = zC - 2 + VE * (tHit - tTop), zbHit = zEHit + 2.17 + 0.95, zA0 = zbHit + DA(tHit);
const xA = (t) => 1.8 - 3.6 * sm(tPull - 0.1, tPull + 1.2, t);
const aPath = (t) => (t < tHit ? [xA(t), zA0 - DA(t)] : [xA(tHit), zbHit + 1.1 * sm(tHit, tHit + 0.4, t), 0]);
const ePath = (t) => [-1.8, t < tHit ? zEHit + VE * (t - tHit) : zEHit + 0.5 * sm(tHit, tHit + 0.3, t), Math.PI];
const vS1 = (t) => 8 * (1 - sm(tHit + 0.1, tHit + 1.3, t)), DS1 = dist(vS1, 0, T3 + 1);
const s1Path = (t) => [1.8, zA0 - 9 - DS1(t), 0];
const carS1 = makeCar({ color: 0x4a40b8, driver: true }), carE = makeCar({ color: 0x1a1534, driver: true });
const kD = (t) => sm(tHit + 0.05, tHit + 0.5, t);

// ---- B: stays behind over the crest, waits, checks, passes fast, back in with room ----
const tCrest = g("s3", "crest"), tGo = g("s5", "go") + 0.05, TB = T3 - 1;
const zB0 = zC + 8 * (tCrest - TB);
const zS = (t) => zB0 - 9 - 8 * (t - TB);
const vP = (t) => 8 + 14 * sm(tGo, tGo + 0.9, t), DP = dist(vP, TB, T7 + 5);
let tBk = tGo + 0.5; while (zS(tBk) - (zB0 - DP(tBk)) < 8.1 && tBk < tGo + 5) tBk += 0.01;
const vB = (t) => vP(t) - 12.5 * sm(tBk + 0.3, tBk + 1.5, t), DB = dist(vB, TB, T7 + 5);
const xB = (t) => 1.8 - 3.6 * sm(tGo - 0.3, tGo + 1.0, t) + 3.6 * sm(tBk - 0.1, tBk + 1.4, t);
const bPath = (t) => [xB(t), zB0 - DB(t)];
const sPath = (t) => [1.8, zS(t), 0];
const tCross = tCrest + 0.7, zCross = zB0 - DB(tCross);
const cPath = (t) => [-1.8, zCross + 16 * (t - tCross), Math.PI];
const carS = makeCar({ color: 0x4a40b8, driver: true }), carC = makeCar({ color: 0x5246c8, driver: true });
for (const c of [carS1, carE, carS, carC]) c.g.rotation.order = "YXZ";

// ---- actors + overlays ----
const [Bk] = bikes(1), THROWN = makePerson();
const sightR = beam(RED, 1.8, 0.03), sightG = beam(GREEN, 1.8, 0.03), backG = beam(GREEN, 1.4, 0.03);
const hit = patch(2.2, 1.2, RED, 1.6), gapG = patch(1.6, 1, GREEN, 0.9);
const tSlowCar = tag("SLOW CAR", ORANGE), tCrestT = tag("BLIND CREST", RED), tOnc = tag("ONCOMING", RED), tNoView = tag("NO VIEW", RED), tView = tag("CLEAR VIEW", GREEN);

title("NEVER OVERTAKE BEFORE A HILLTOP");
cap("s2", "pull", "YOU PULL OUT", RED, { y: 0.3, until: ["s2", "car"] });
cap("s2", "car", ["A CAR COMES", "OVER THE TOP"], RED, { y: 0.3, until: ["s2", "nowhere"] });
cap("s2", "nowhere", "NOWHERE TO GO", RED, { y: 0.3, boom: 0.6 });
cap("s3", "stay", "STAY BEHIND", GREEN, { y: 0.3, until: ["s3", "until"] });
cap("s3", "until", ["UNTIL YOU CAN SEE", "OVER THE CREST"], GREEN, { y: 0.3 });
cap("s4", "wait", ["WAIT FOR A LONG,", "STRAIGHT ROAD"], GREEN);
cap("s5", "check", ["CHECK AHEAD,", "CHECK YOUR MIRROR"], GREEN, { until: ["s5", "then"] });
cap("s5", "then", "THEN GO", GREEN);
cap("s6", "pass", "PASS FAST", GREEN, { until: ["s6", "get"] });
cap("s6", "get", ["BACK IN YOUR LANE", "WITH ROOM TO SPARE"], GREEN);
endCard(["CAN'T SEE PAST IT?", "DON'T PASS IT."]);

// how far the rider can see along the road (terrain blocks the line from eye to a car roof)
function seeDist(zb) {
  const ey = Y(zb) + 1.5;
  for (let d = 3; d <= 90; d += 1) {
    const zt = zb - d, ty = Y(zt) + 1.3;
    for (let k = 1; k < d; k += 1) { const u = k / d; if (Y(zb - k) > ey + (ty - ey) * u) return d - 1; }
  }
  return 90;
}

// ---- shots: chase cams that ride the hill ----
const chase = (fn, K) => (t, su) => {
  const k = keys(su, K), b = pathState(fn, t), yb = Y(b.z), cz = b.z + k[2];
  return [b.x + k[0], Math.max(yb + k[1], Y(cz) + 0.8), cz, b.x + k[3], yb + k[4], b.z + k[5], k[6]];
};
const yH = Y(zbHit);
const SH = [
  { at: 0, cam: chase(aPath, [[0, [1.6, 3.0, 8.5, 0, 1.2, -20, 50]], [3, [1.3, 3.2, 7.8, 0, 1.2, -20, 50]]]) },
  { at: T2, cam: chase(aPath, [[0, [0.6, 4.6, 11, -0.6, 0.6, -20, 50]], [1.6, [0.2, 4.4, 10, -0.8, 0.6, -20, 50]]]) },
  { at: tHit - 0.55, K: [[0, [-10, yH + 3.6, zbHit + 7, -0.6, yH + 0.8, zbHit - 2.5, 48]], [2, [-9, yH + 3.9, zbHit + 6, -0.6, yH + 0.7, zbHit - 2.5, 48]]] },
  { at: T3, cam: chase(bPath, [[0, [24, 7.0, -4.5, 0, 1.2, -4.5, 50]], [2.4, [24, 7.5, -6, 0, 1.2, -5.5, 50]]]) },
  { at: T4, cam: chase(bPath, [[0, [1.8, 4.5, 8.5, -1.2, 0.2, -40, 50]], [2.2, [1.6, 5.2, 9.5, -1.2, 0.0, -40, 50]]]) },
  { at: T5, cam: chase(bPath, [[0, [1.3, 2.0, 4.6, 0, 1.25, -15, 46]], [2.2, [1.1, 2.1, 4.2, 0, 1.25, -15, 46]]]) },
  { at: T6 - 0.25, cam: chase(bPath, [[0, [-2.6, 4.6, 10, 0.8, 0.6, -14, 52]], [1.3, [-2.6, 6.0, 20, 0.8, 0.5, 0, 52]], [2.6, [-2.4, 7.5, 28, 0.8, 0.5, 3, 52]]]) },
  { at: T7, cam: chase(bPath, [[0, [-2.0, 4.5, 9.5, 0.4, 1.0, -30, 50]], [4.3, [-2.0, 6.5, 12.0, 0.4, 0.8, -30, 50]]]) },
];

const place = (car, fn, t, vis) => { if (!vis) return car.set(null); const p = fn(t); car.set({ x: p[0], z: p[1], h: p[2] }); hillFix(car.g, p[1], p[2]); };

run("w", (t) => {
  let st;
  const A = t < T3;
  place(carS1, s1Path, t, A); place(carE, ePath, t, A);
  place(carS, sPath, t, !A); place(carC, cPath, t, t >= T3 && t < T4);
  Bk.headG.rotation.y = t >= T5 && t < T6 ? 0.55 * on(t, g("s5", "check", 2), g("s5", "then")) : 0;
  Bk.sig(!A && t > tGo - 0.6 && t < tGo + 0.8 ? -1 : !A && t > tBk - 0.3 && t < tBk + 0.9 ? 1 : 0, t);
  if (A) {
    st = ride(Bk, aPath, t, RED, { lean: downLean(kD(t), -1), down: kD(t), trail: false });
    hillFix(Bk.g, st.z, 0);
    Bk.rider.visible = t < tHit;
    if (t >= tHit) { // thrown forward over the oncoming car's bonnet
      const u = Math.min(1, (t - tHit) / 0.5), zs = zbHit - 0.6, ze = zEHit + 0.3, zz = zs + (ze - zs) * u;
      pose(THROWN, { x: -1.8 + 0.3 * u, z: zz, h: 0, lie: 0.35 + 0.65 * u, armR: 2.4, armL: 1.9, hex: RED });
      THROWN.g.position.y += Y(zz) + 0.9 * u + 0.9 * Math.sin(Math.PI * u) * (1 - 0.3 * u);
    } else pose(THROWN, { vis: false });
    hit.position.set(-1.8, Y(zbHit) + 0.06, zbHit - 1.4); hit.rotation.x = -Math.PI / 2 + slope(zbHit, 0); hit.set(t > tHit - 0.05 ? on(t, tHit, T3) : 0);
    const sp = s1Path(t), ep = ePath(t);
    tagAt(tSlowCar, 1.8, Y(sp[1]) + 2.6, sp[1], on(t, g("s1", "slow"), T2 + 0.4) * 0.9, 1.6);
    tagAt(tCrestT, 0, HH + 2.2, zC, on(t, g("s1", "hilltop"), T2) * 0.95, 4.0);
    tagAt(tOnc, -1.8, Y(ep[1]) + 2.6, ep[1], on(t, tTop + 0.1, tHit - 0.1) * 0.9, 1.6);
    // short red sight line: he can't see over the crest
    const sd = seeDist(st.z), ey = Y(st.z) + 1.5;
    sightR.set(V3(st.x, ey, st.z - 0.3), V3(-1.8, Y(st.z - sd) + 1.0, st.z - sd), on(t, g("s1", "hilltop"), tPull + 0.3) * 0.8);
  } else {
    pose(THROWN, { vis: false }); hit.set(0); tagAt(tSlowCar, 0, 0, 0, 0); tagAt(tCrestT, 0, 0, 0, 0); tagAt(tOnc, 0, 0, 0, 0);
    st = ride(Bk, bPath, t, t >= T6 ? GREEN : VIOLET, { trail: false });
    hillFix(Bk.g, st.z, 0);
  }
  // s3: sight line grows red -> green as he tops the crest
  const s3 = t >= T3 && t < T4 ? on(t, g("s3", "until"), T4) : 0, ey = Y(st.z) + 1.5, d3 = seeDist(st.z), clear = d3 > 45;
  const tip = V3(-1.8, Y(st.z - d3) + 1.0, st.z - d3);
  sightR.visible = false; sightG.visible = false;
  if (A) { const sd = seeDist(st.z); sightR.set(V3(st.x, ey, st.z - 0.3), V3(-1.8, Y(st.z - sd) + 1.0, st.z - sd), on(t, g("s1", "hilltop"), tPull + 0.3) * 0.8); }
  else if (s3 > 0) (clear ? sightG : sightR).set(V3(st.x, ey, st.z - 0.3), tip, s3 * 0.55);
  tagAt(tNoView, tip.x, tip.y + 1.4, tip.z, s3 * (clear ? 0 : 1), 1.6);
  // s4: the long clear view, painted down the left lane
  const s4 = t >= T4 && t < T5 ? on(t, g("s4", "long"), T5) : 0;
  if (!viewStrip) viewStrip = ribbonY(-3.2, -0.4, zC - 4, zC - 160, mView, 0.03, 1);
  mView.opacity = 0.35 * s4; viewStrip.visible = s4 > 0.01;
  tagAt(tView, -1.8, Y(st.z - 35) + 2.2, st.z - 35, Math.max(s4, s3 * (clear ? 1 : 0)), 2.0);
  // s5: look ahead, then back in the mirror
  const s5a = t >= T5 && t < T6 ? on(t, g("s5", "road"), g("s5", "check", 2)) : 0, s5b = t >= T5 && t < T6 ? on(t, g("s5", "mirror"), g("s5", "go")) : 0;
  if (s5a > 0) sightG.set(V3(st.x - 0.4, ey, st.z - 0.3), V3(-1.8, Y(st.z - 60) + 1.0, st.z - 60), s5a * 0.85);
  backG.set(V3(st.x - 0.4, ey, st.z + 0.3), V3(-1.8, Y(st.z + 25) + 1.0, st.z + 25), s5b * 0.85);
  // s6: room to spare between the car's front and the bike
  const sp = sPath(t), gz0 = sp[1] - 2.17, gz1 = st.z + 1.0, GL = Math.max(0.5, gz0 - gz1);
  const gp = t >= T6 && t < T7 ? on(t, Math.max(g("s6", "room"), tBk + 0.9), T7) : 0;
  gapG.scale.set(1, GL, 1); gapG.position.set(1.8, Y((gz0 + gz1) / 2) + 0.06, (gz0 + gz1) / 2); gapG.set(gp * 0.75);
  const shot = shoot(SH, t);
  bloom.strength = 1.0 + 1.2 * shot.punch * shot.punch + overlays(t) + (A ? 1.2 * flash(t, tHit) : 0);
});
function st0(t) { return t > T4 + 0.5; }
