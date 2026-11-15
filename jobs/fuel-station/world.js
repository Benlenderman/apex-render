// 144 fuel-station: wrong = rides into the gas station fast, brakes hard on a fuel spill, the front wheel slides and the bike falls (red).
// Right = spot the rainbow patches by the pumps, ride in slow and straight, brake gently on clean ground before the pumps, stop upright (green).
import { THREE, S, g, sm, flash, scene, bloom, box, glow, VIOLET, ORANGE, RED, GREEN, WHITE, shoot, run } from "./kit.js";
import { title, endCard, cap, overlays, bikes, ride, dist } from "./extra.js";

scene.fog.density = 0.012;
const T2 = S.s2[0], T3 = S.s3[0], T4 = S.s4[0], T5 = S.s5[0], T6 = S.s6[0], T7 = S.s7[0];

// ---- forecourt: concrete slab, pump island, canopy ----
const mCon = new THREE.MeshStandardMaterial({ color: 0x1c1a38, emissive: 0x0b0a20, roughness: 0.85 });
scene.add(box(14, 0.04, 70, 0, -0.02, -5, mCon, false));
for (let i = 0; i < 18; i++) scene.add(box(0.06, 0.012, 14, -7 + i * 0.8, 0.003, -14, glow(VIOLET, 0.25), false)); // slab joints
const PZ = -15; // pump island centre
scene.add(box(1.0, 0.18, 5.0, 1.9, 0.09, PZ, glow(ORANGE, 0.5), false));
const pumps = [PZ + 1.3, PZ - 1.3].map((z) => {
  const p = new THREE.Group(); p.position.set(1.9, 0.18, z); scene.add(p);
  p.add(box(0.55, 1.5, 0.45, 0, 0.75, 0), box(0.4, 0.3, 0.02, -0.06, 1.15, 0.24, glow(VIOLET, 1.6), false), box(0.04, 0.5, 0.04, -0.3, 0.7, 0.1, glow(ORANGE, 2), false));
  return p;
});
const roofM = glow(ORANGE, 1.2);
scene.add(box(7, 0.2, 9, 0.8, 4.4, PZ, undefined, false), box(7.04, 0.08, 9.04, 0.8, 4.28, PZ, roofM, false));
for (const [x, z] of [[1.9, PZ + 2.4], [1.9, PZ - 2.4]]) scene.add(box(0.25, 4.3, 0.25, x, 2.15, z, glow(VIOLET, 0.7), false));
const lamp = new THREE.PointLight(0xffe6c8, 30, 14, 1.6); lamp.position.set(0.5, 4, PZ); scene.add(lamp);

// ---- fuel spills: rainbow sheen (deterministic canvas texture) ----
function sheenTex() {
  const c = document.createElement("canvas"); c.width = c.height = 256; const x = c.getContext("2d");
  const gr = x.createRadialGradient(128, 128, 10, 128, 128, 126);
  ["#ff3d8a", "#ffb03d", "#f6ff4d", "#3dff8a", "#3dd8ff", "#7a5cff", "#ff3dd0"].forEach((h, i) => gr.addColorStop(i / 7, h));
  gr.addColorStop(1, "rgba(0,0,0,0)"); x.fillStyle = gr; x.fillRect(0, 0, 256, 256);
  return new THREE.CanvasTexture(c);
}
const TEX = sheenTex();
function spill(x, z, s) {
  const grp = new THREE.Group(); grp.position.set(x, 0.012, z); scene.add(grp);
  const m = new THREE.MeshBasicMaterial({ map: TEX, transparent: true, opacity: 0.6, blending: THREE.AdditiveBlending, depthWrite: false, toneMapped: false });
  [[0, 0, 1], [0.35, 0.2, 0.7], [-0.3, -0.25, 0.6]].forEach(([dx, dz, k]) => { const c = new THREE.Mesh(new THREE.CircleGeometry(0.5 * s * k, 40), m); c.rotation.x = -Math.PI / 2; c.position.set(dx * s, 0, dz * s); grp.add(c); });
  return { grp, m };
}
const SPZ = PZ + 2.6; // the spill the wrong bike brakes on (lane, by the pumps)
const spills = [spill(0, SPZ, 1.3), spill(1.0, PZ + 0.6, 0.9), spill(0.6, PZ - 1.8, 0.8)];
const mkRing = () => { const m = new THREE.MeshBasicMaterial({ color: 0, toneMapped: false, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide }); const r = new THREE.Mesh(new THREE.RingGeometry(0.9, 1.0, 48), m); r.rotation.x = -Math.PI / 2; scene.add(r); return r; };
const spot = spills.map(mkRing), halo = mkRing();
const setRing = (r, x, z, k, hex, s0, s1, b = 2.6) => { if (k <= 0 || k >= 1) { r.visible = false; return; } r.visible = true; r.position.set(x, 0.03, z); r.scale.setScalar(s0 + (s1 - s0) * k); r.material.color.set(hex).multiplyScalar(b * (1 - k)); };
// skid streak (wrong), straight line + clean braking zone (right)
const skid = box(0.06, 0.01, 1, 0, 0.02, 0, glow(RED, 2.2), false); scene.add(skid);
const line = box(0.08, 0.01, 1, 0, 0.018, 0, glow(GREEN, 1.6), false); scene.add(line);
const zoneM = new THREE.MeshBasicMaterial({ color: 0, toneMapped: false, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false });
const zone = box(1.4, 0.01, 3.0, 0, 0.016, 0, zoneM, false); scene.add(zone);
const plumb = box(0.05, 2.0, 0.05, 0, 1.0, 0, glow(GREEN, 2), false); scene.add(plumb);

const [Bk] = bikes(1);

// ---- timing ----
const tPull = g("s1", "pulling"), tBrake1 = g("s1", "brake");
const tFront = g("s2", "front"), tSlides = g("s2", "slides"), tFall = g("s2", "fall");
const tWet = g("s3", "wet"), tRain = g("s3", "rainbow"), tPumps = g("s3", "pumps");
const tSlow = g("s4", "slow"), tStraight = g("s4", "straight");
const tGently = g("s5", "gently"), tBefore = g("s5", "before"), tClean = g("s5", "clean");
const tStop = g("s6", "stop"), tUp = g("s6", "upright");

// wrong: rides in at 7 m/s, grabs the brake at "front", the front slides at "slides", down at "fall"
const vA = (t) => 7 * (1 - 0.35 * sm(tFront, tSlides, t)) * (1 - sm(tSlides, tFall + 0.7, t));
const DA = dist(vA, 0, T3);
const ZA0 = SPZ + 0.75 + DA(tSlides); // front wheel lands on the spill as it slides
const pA = (t) => [0, ZA0 - DA(t)];
// right: slow and straight from s4, gentle brake from "gently", stopped on clean ground before the spill
const ZSTOP = SPZ + 3.4;
const vB = (t) => 2.6 * sm(T4 - 0.3, T4, t) * (1 - sm(tGently, tClean + 0.3, t));
const DB = dist(vB, T3, T7);
const ZB0 = ZSTOP + DB(T7);
const pB = (t) => [0, ZB0 - DB(t)];

title("NEVER BRAKE HARD AT THE GAS STATION");
cap("s1", "pulling", ["GAS STATION?"], VIOLET, { y: 0.3, until: ["s1", "never"] });
cap("s2", "spilled", ["SPILLED FUEL", "IS SLIPPERY"], RED, { y: 0.3, until: ["s2", "front"] });
cap("s2", "front", ["THE FRONT", "WHEEL SLIDES"], RED, { y: 0.3, until: ["s2", "you"] });
cap("s2", "you", ["YOU FALL"], RED, { y: 0.3, boom: 0.6 });
cap("s3", "look", ["LOOK FOR", "RAINBOW PATCHES"], GREEN, { y: 0.3 });
cap("s4", "ride", ["SLOW AND", "STRAIGHT"], GREEN, { y: 0.3 });
cap("s5", "brake", ["BRAKE GENTLY", "ON CLEAN GROUND"], GREEN, { y: 0.3 });
cap("s6", "stop", ["STOP UPRIGHT"], GREEN, { y: 0.3 });
endCard(["GAS STATION?", "SLOW, STRAIGHT, GENTLE BRAKES."]);

// ---- shots (bike rides toward -z; camera front-left, never closer than ~4 m) ----
const follow = (P, dx, dy, dz, ly, fov) => (t) => { const z = P(t)[1]; return [dx, dy, z + dz, 0.2, ly, z - 1.2, fov]; };
const SH = [
  { at: 0, cam: (t) => { const z = pA(t)[1]; return [-1.0, 2.6, z + 6.8, 0.3, 0.7, z - 6, 48]; } },
  { at: T2, cam: (t) => { const z = Math.max(pA(t)[1], SPZ - 0.6); return [-6.2, 2.1, z + 1.0, 0, 0.5, z + 0.4, 46]; } },
  { at: T3, K: [[0, [-3.6, 3.4, PZ + 6.2, 0.7, 0.1, PZ, 44]], [T4 - T3, [-3.0, 3.1, PZ + 5.4, 0.7, 0.1, PZ, 44]]] },
  { at: T4, cam: follow(pB, -4.8, 1.9, 4.6, 0.6, 46) },
  { at: T5, cam: (t) => { const z = pB(t)[1]; return [-6.2, 2.2, z + 0.8, 0, 0.5, z + 0.1, 46]; } },
  { at: T6, K: [[0, [-4.2, 1.5, ZSTOP - 3.4, 0, 0.8, ZSTOP, 44]], [T7 - T6, [-3.8, 1.5, ZSTOP - 3.0, 0, 0.8, ZSTOP, 44]]] },
  { at: T7, K: [[0, [-5.2, 2.8, ZSTOP - 3.2, 0, 0.7, ZSTOP, 48]], [3, [-3.0, 3.2, ZSTOP - 5.4, 0, 0.7, ZSTOP, 48]]] },
];

run("w", (t) => {
  const A = t < T3;
  if (A) {
    const f = sm(tSlides + 0.25, tFall + 0.3, t), fall = f * f;
    const slide = sm(tSlides - 0.05, tFall + 0.3, t);
    ride(Bk, pA, t, t < T2 ? VIOLET : RED, { lean: 1.45 * fall, h: 0.45 * slide, trail: false });
    Bk.rider.visible = true;
    Bk.fork.rotation.y = 0.55 * slide * (1 - 0.4 * fall) + 0.12 * Math.sin(t * 40) * sm(tSlides - 0.1, tSlides + 0.1, t) * (1 - fall);
    Bk.tail.material.color.set(RED).multiplyScalar(3 + 6 * sm(tFront - 0.1, tFront + 0.05, t) * (1 - sm(tFall + 0.5, tFall + 0.8, t)) + 4 * flash(t, tBrake1));
    // the spill glows red as the wheel hits it
    spills.forEach((s, i) => { s.m.opacity = 0.55 + (i === 0 ? 0.4 * sm(T2, T2 + 0.4, t) : 0); s.m.color.set(i === 0 && t > T2 ? 0xff8090 : WHITE); });
    spot.forEach((r, i) => setRing(r, i === 0 ? 0 : 0, SPZ, i === 0 ? sm(T2 + 0.1, T2 + 0.9, t) : 0, RED, 0.6, 1.8));
    const z0 = ZA0 - DA(tSlides) - 0.7, z1 = ZA0 - DA(t) - 0.7, on = t > tSlides;
    skid.visible = on; if (on) { skid.scale.z = Math.max(0.01, z0 - z1); skid.position.set(0, 0.02, (z0 + z1) / 2); }
    setRing(halo, -0.4, ZA0 - DA(t), sm(tFall + 0.2, tFall + 1.0, t), RED, 0.5, 2.0);
    line.visible = false; zone.visible = false; plumb.visible = false;
  } else {
    ride(Bk, pB, t, GREEN, { lean: 0, trail: false });
    Bk.rider.visible = true;
    const brk = sm(tGently - 0.1, tGently + 0.2, t) * (1 - sm(tClean + 0.6, tClean + 1.0, t));
    Bk.tail.material.color.set(RED).multiplyScalar(3 + 2.5 * brk);
    // s3: each rainbow patch lights up and gets a violet spotting ring
    spills.forEach((s, i) => { const k = sm(tWet - 0.1 + i * 0.25, tWet + 0.2 + i * 0.25, t); s.m.opacity = 0.4 + 0.25 * k * (t < T4 ? 1 : 0.4); s.m.color.set(WHITE); });
    spot.forEach((r, i) => { const z = spills[i].grp.position.z, x = spills[i].grp.position.x; const t0 = tRain - 0.1 + i * 0.3; setRing(r, x, z, t < T4 ? ((t - t0) % 1.1) / 1.1 * (t > t0 ? 1 : 0) : 0, VIOLET, 0.4, 1.5); });
    // s4: green straight line ahead of the wheel
    const lk = sm(tSlow - 0.1, tStraight, t) * (1 - sm(T5 + 0.5, T5 + 0.9, t));
    line.visible = lk > 0.02; if (line.visible) { const zb = ZB0 - DB(t); line.scale.z = 6 * lk; line.position.set(0, 0.018, zb - 0.8 - 3 * lk); }
    // s5: clean braking zone before the pumps
    const zk = sm(tBefore - 0.2, tClean, t) * (1 - sm(T6 + 0.3, T6 + 0.7, t));
    zone.visible = zk > 0.02; zone.position.set(0, 0.016, ZSTOP); zoneM.color.set(GREEN).multiplyScalar(0.35 * zk + 0.6 * flash(t, tClean));
    // s6: upright: green plumb line and halo
    const pk = sm(tUp - 0.25, tUp, t) * (1 - sm(T7 + 0.4, T7 + 0.8, t));
    plumb.visible = pk > 0.02; plumb.position.set(-0.55, 1.0, ZSTOP); plumb.scale.y = pk;
    setRing(halo, 0, ZSTOP, sm(tStop - 0.05, tStop + 0.8, t), GREEN, 0.4, 1.9);
    skid.visible = false;
  }
  lamp.intensity = 30;
  const shot = shoot(SH, t);
  bloom.strength = 0.8 + 1.0 * shot.punch * shot.punch + overlays(t) + (A ? 0.6 * flash(t, tFall + 0.3) : 0.4 * flash(t, tUp));
});
