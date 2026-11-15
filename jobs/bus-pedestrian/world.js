// 145 bus-pedestrian: wrong = rides fast close past a stopped bus, someone steps out from in front of it, panic stop (red).
// Right = slow down before the bus, move further from it, look under it for feet, cover the brakes until past (green/violet).
import { THREE, S, g, sm, flash, scene, bloom, box, glow, road, VIOLET, ORANGE, RED, GREEN, WHITE, shoot, run } from "./kit.js";
import { title, endCard, cap, overlays, bikes, ride, dist, makePerson, pose } from "./extra.js";

scene.fog.density = 0.014;
const T2 = S.s2[0], T3 = S.s3[0], T4 = S.s4[0], T5 = S.s5[0], T6 = S.s6[0], T7 = S.s7[0];
scene.add(road({ lanes: 2, lw: 3.5, cx: 0.9, z0: 80, z1: -200 }));
// sidewalk on the right
scene.add(box(2.5, 0.15, 260, 5.65, 0.075, -60, glow(VIOLET, 0.35), false));

// ---- the stopped bus (front at z = BF, right lane, high floor so feet show underneath) ----
const BX = 3.0, BF = -30, BL = 11;
const bus = new THREE.Group(); bus.position.set(BX, 0, BF + BL / 2); scene.add(bus);
const mBus = new THREE.MeshStandardMaterial({ color: 0x5a4fd0, emissive: 0x2a2380, roughness: 0.5, metalness: 0.2 });
bus.add(box(2.5, 2.7, BL, 0, 0.42 + 1.35, 0, mBus));
bus.add(box(2.54, 0.7, BL - 1.2, 0, 2.15, 0.3, glow(VIOLET, 1.0), false)); // window band
bus.add(box(2.3, 1.0, 0.04, 0, 2.2, -BL / 2 - 0.01, glow(VIOLET, 1.4), false)); // windscreen
bus.add(box(1.6, 0.3, 0.04, 0, 3.0, -BL / 2 - 0.02, glow(ORANGE, 2.2), false)); // destination sign
for (const z of [-BL / 2 + 1.6, BL / 2 - 2.2]) for (const s of [-1, 1]) { const w = new THREE.Mesh(new THREE.CylinderGeometry(0.5, 0.5, 0.3, 20), new THREE.MeshStandardMaterial({ color: 0x0c0a1c })); w.rotation.z = Math.PI / 2; w.position.set(s * 1.15, 0.5, z); bus.add(w); }
const hazL = [-1, 1].map((s) => { const m = box(0.18, 0.12, 0.04, s * 1.0, 0.75, -BL / 2 - 0.02, glow(ORANGE, 2), false); bus.add(m); return m; });
const hazR = [-1, 1].map((s) => { const m = box(0.18, 0.12, 0.04, s * 1.0, 0.75, BL / 2 + 0.02, glow(ORANGE, 2), false); bus.add(m); return m; });
// bus stop sign on the sidewalk
scene.add(box(0.08, 2.4, 0.08, 5.2, 1.2, BF + 3, glow(VIOLET, 0.8), false), box(0.5, 0.5, 0.05, 5.2, 2.5, BF + 3, glow(ORANGE, 1.6), false));

const P = makePerson();
const Bk = bikes(1)[0];
const lever = box(0.22, 0.04, 0.05, 0.33, 0.1, -0.02, glow(GREEN, 3), false); Bk.fork.add(lever);
const mkRing = () => { const m = new THREE.MeshBasicMaterial({ color: 0, toneMapped: false, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide }); const r = new THREE.Mesh(new THREE.RingGeometry(0.9, 1.0, 48), m); r.rotation.x = -Math.PI / 2; scene.add(r); return r; };
const ring = mkRing(), halo = mkRing();
const setRing = (r, x, z, k, hex, s0, s1, b = 2.6) => { if (k <= 0 || k >= 1) { r.visible = false; return; } r.visible = true; r.position.set(x, 0.035, z); r.scale.setScalar(s0 + (s1 - s0) * k); r.material.color.set(hex).multiplyScalar(b * (1 - k)); };
const skid = box(0.07, 0.01, 1, 0, 0.02, 0, glow(RED, 2.2), false); scene.add(skid);
const gap = box(1.6, 0.01, 14, 0, 0.018, 0, new THREE.MeshBasicMaterial({ color: 0, toneMapped: false, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false }), false); scene.add(gap);
const scan = box(0.05, 0.05, 1, 0, 0, 0, glow(VIOLET, 2.6), false); scene.add(scan);
const feetM = new THREE.MeshBasicMaterial({ color: 0, toneMapped: false, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false });
const feetGlow = new THREE.Mesh(new THREE.CircleGeometry(0.45, 32), feetM); feetGlow.rotation.x = -Math.PI / 2; scene.add(feetGlow);

// ---- timing ----
const tBus = g("s1", "bus"), tFast = g("s1", "fast");
const tSteps = g("s2", "steps"), tRight = g("s2", "right"), tYou = g("s2", "you");
const tSlow = g("s3", "slow"), tReach = g("s3", "reach");
const tMove = g("s4", "move"), tFurther = g("s4", "further");
const tUnder = g("s5", "under"), tFront5 = g("s5", "front"), tFeet = g("s5", "feet");
const tCover = g("s6", "cover"), tPast = g("s6", "past");

// wrong: 11 m/s 0.9 m from the bus, panic stop at "right", ends 1.4 m short of the person
const XA = 0.9, PZ = BF - 0.8;
const FX = BX + 1.65, FZ = BF + 3.0; // right half: someone waits on the curb side of the bus, only the feet show under it
const vA = (t) => 11 * (1 - sm(tRight - 0.15, tRight + 0.75, t));
const DA = dist(vA, 0, T3);
const ZA0 = PZ + 1.5 + DA(tRight + 0.75);
const pA = (t) => [XA, ZA0 - DA(t)];
// person steps out from in front of the bus into the lane
const pX = (t) => BX - 0.6 - 2.0 * sm(tSteps - 0.1, tRight + 0.2, t);
// right: slows before the bus, moves further out, rolls past slowly covering the brake
const vB = (t) => 4 + 6 * (1 - sm(tSlow - 0.1, tReach + 0.2, t));
const DB = dist(vB, T3, T7 + 4);
const ZB0 = BF + BL + 13 + DB(tReach + 0.2);
const xB = (t) => XA - 1.6 * sm(tMove - 0.1, tFurther + 0.3, t);
const pB = (t) => [xB(t), ZB0 - DB(t)];

title("NEVER RIDE FAST PAST A STOPPED BUS");
cap("s1", "bus", ["STOPPED BUS?"], VIOLET, { y: 0.3, until: ["s1", "never"] });
cap("s2", "someone", ["SOMEONE", "STEPS OUT"], RED, { y: 0.3, until: ["s2", "right"] });
cap("s2", "right", ["RIGHT IN", "FRONT OF YOU"], RED, { y: 0.3, boom: 0.6 });
cap("s3", "slow", ["SLOW DOWN", "BEFORE THE BUS"], GREEN, { y: 0.3 });
cap("s4", "move", ["MOVE FURTHER", "FROM THE BUS"], GREEN, { y: 0.3 });
cap("s5", "look", ["LOOK UNDER IT", "FOR FEET"], VIOLET, { y: 0.3 });
cap("s6", "cover", ["COVER YOUR", "BRAKES"], GREEN, { y: 0.3 });
endCard(["STOPPED BUS?", "SLOW DOWN, WATCH FOR PEOPLE."]);

const SH = [
  { at: 0, cam: (t) => { const [x, z] = pA(t); return [x - 2.6, 2.9, z + 7.5, 1.4, 1.0, z - 9, 48]; } },
  { at: T2, K: [[0, [-4.6, 2.3, PZ - 5.6, 1.4, 0.8, PZ + 1.5, 48]], [T3 - T2, [-4.0, 2.1, PZ - 5.0, 1.2, 0.8, PZ + 1.6, 48]]] },
  { at: T3, cam: (t) => { const [x, z] = pB(t); return [x - 3.2, 2.6, z + 6.5, 1.0, 1.0, z - 8, 48]; } },
  { at: T5, cam: (t) => { const k = sm(T5, T6, t); return [0.3 + 0.9 * k, 0.34, BF + 7.8 - 1.6 * k, FX, 0.12, FZ, 42]; } },
  { at: T6, cam: (t) => { const [x, z] = pB(t); return [x - 5.6, 2.0, z + 0.8, x, 0.6, z + 0.1, 46]; } },
  { at: T7, cam: (t) => { const [x, z] = pB(t), a = (t - T7) * 0.35; return [x - 6.6 * Math.cos(a) + 0.5, 2.7 + 0.3 * (t - T7), z + 0.5 - 6.6 * Math.sin(a), x + 0.5, 0.8, z - 0.3, 48]; } },
];

run("w", (t) => {
  const A = t < T3;
  const blink = (Math.floor(t * 2.4) % 2) ? 2.6 : 0.4;
  [...hazL, ...hazR].forEach((m) => m.material.color.set(ORANGE).multiplyScalar(blink));
  if (A) {
    ride(Bk, pA, t, t < T2 ? VIOLET : RED, { trail: t < tRight });
    Bk.rider.visible = true;
    Bk.tail.material.color.set(RED).multiplyScalar(3 + 8 * sm(tRight - 0.15, tRight, t));
    Bk.lean.rotation.x = -0.08 * sm(tRight - 0.1, tRight + 0.3, t) * (1 - sm(tRight + 0.8, tRight + 1.2, t)); // nose dives under hard braking
    lever.visible = false;
    const px = pX(t), out = t > tSteps - 0.1;
    pose(P, { x: out ? px : BX - 0.6, z: PZ, h: out ? Math.PI / 2 : Math.PI / 2, vis: t > tBus, armR: 0.25 * Math.sin(t * 9) * (t < tRight + 0.2 ? 1 : 0), armL: t > tRight + 0.2 ? 1.6 * sm(tRight + 0.2, tRight + 0.5, t) : -0.25 * Math.sin(t * 9) });
    P.body.position.y = out && t < tRight + 0.2 ? 0.03 * Math.abs(Math.sin(t * 9)) : 0;
    setRing(ring, px, PZ, sm(tRight, tRight + 0.9, t), RED, 0.5, 2.2);
    setRing(halo, XA, PZ, sm(tYou - 0.1, tYou + 0.8, t), RED, 0.4, 1.8);
    const z0 = ZA0 - DA(tRight) - 0.7, z1 = ZA0 - DA(t) - 0.7, on = t > tRight;
    skid.visible = on; if (on) { skid.scale.z = Math.max(0.01, z0 - z1); skid.position.set(XA, 0.02, (z0 + z1) / 2); }
    gap.visible = false; scan.visible = false; feetGlow.visible = false;
  } else {
    ride(Bk, pB, t, GREEN, { trail: false, lean: -0.06 * Math.sin(Math.PI * sm(tMove - 0.1, tFurther + 0.3, t)) });
    Bk.rider.visible = true;
    Bk.lean.rotation.x = 0;
    Bk.tail.material.color.set(RED).multiplyScalar(3 + 2 * sm(tSlow - 0.1, tSlow + 0.2, t) * (1 - sm(tReach, tReach + 0.4, t)));
    lever.visible = t > tCover - 0.1; lever.material.color.set(GREEN).multiplyScalar(2 + 2.5 * flash(t, tCover) + 0.6 * Math.sin(t * 8));
    // the person waits in front of the bus; only the feet show from behind it
    pose(P, { x: FX, z: FZ, h: Math.PI / 2, vis: true });
    P.body.position.y = 0;
    const fk = sm(tFeet - 0.3, tFeet, t) * (1 - sm(T6 + 0.6, T6 + 1.0, t));
    feetGlow.visible = fk > 0.02; feetGlow.position.set(FX, 0.04, FZ); feetM.color.set(VIOLET).multiplyScalar(2.2 * fk + 1.5 * flash(t, tFeet));
    setRing(ring, FX, FZ, t > T5 && t < T6 + 0.6 ? ((t - tUnder + 0.1) % 1.0) : 0, VIOLET, 0.4, 1.4);
    // violet scan line from the rider's eyes, under the bus, to the feet
    const sk = sm(tUnder - 0.2, tUnder + 0.1, t) * (1 - sm(T6 - 0.1, T6 + 0.2, t));
    scan.visible = sk > 0.02;
    if (scan.visible) { const [x, z] = pB(t); const A3 = new THREE.Vector3(1.75, 0.2, BF + 5.0), B3 = new THREE.Vector3(FX, 0.15, FZ); const k = 0.35 + 0.65 * sm(tUnder, tFront5, t); B3.lerp(A3, 1 - k); scan.position.copy(A3).add(B3).multiplyScalar(0.5); scan.scale.set(0.5, 0.5, A3.distanceTo(B3)); scan.lookAt(B3); }
    // s4: green room between bike and bus
    const gk = sm(tMove, tFurther + 0.3, t) * (1 - sm(T5 - 0.2, T5 + 0.05, t));
    gap.visible = gk > 0.02; gap.position.set(BX - 1.25 - 0.8, 0.018, BF + BL / 2); gap.material.color.set(GREEN).multiplyScalar(0.5 * gk);
    setRing(halo, xB(t), pB(t)[1], sm(tPast - 0.1, tPast + 0.8, t), GREEN, 0.4, 1.9);
    skid.visible = false;
  }
  const shot = shoot(SH, t);
  bloom.strength = 0.8 + 1.0 * shot.punch * shot.punch + overlays(t) + (A ? 0.6 * flash(t, tRight + 0.2) : 0.4 * flash(t, tPast));
});
