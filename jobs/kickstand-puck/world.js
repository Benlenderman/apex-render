// 142 kickstand-puck: wrong = bike parks on soft grass, stand goes straight down, sinks in, the bike falls over (red).
// Right = flat plate out of the bag, under the stand, then lean the bike; the plate spreads the weight, bike still standing (green).
import { THREE, S, g, sm, flash, scene, bloom, box, tube, glow, VIOLET, ORANGE, RED, GREEN, shoot, run } from "./kit.js";
import { track, buildRoad, makePerson, title, endCard, cap, overlays, bikes, ride, dist, tag, tagAt } from "./extra.js";

scene.fog.density = 0.01;
const T2 = S.s2[0], T3 = S.s3[0], T4 = S.s4[0], T5 = S.s5[0], T6 = S.s6[0], T7 = S.s7[0];
const { P } = track([{ len: 600 }]);
buildRoad(P, -60, 400);
const wp = (o, v = new THREE.Vector3()) => o.getWorldPosition(v);
const PX = 6.3; // parking spot on the grass verge, right of the road

// ---- grass verge: dark soil slab + blades ----
const mSoil = new THREE.MeshStandardMaterial({ color: 0x1a2a10, emissive: 0x0c1a06, roughness: 1 });
scene.add(box(5, 0.04, 16, PX, -0.015, 1, mSoil, false));
const mBlade = glow(0x3f7a2a, 1.0), blades = new THREE.InstancedMesh(new THREE.BoxGeometry(0.012, 0.07, 0.012), mBlade, 700);
{ const M = new THREE.Matrix4(), Q = new THREE.Quaternion(), E = new THREE.Euler(), V0 = new THREE.Vector3(), SC = new THREE.Vector3(1, 1, 1);
  for (let i = 0; i < 700; i++) { const r1 = Math.abs(Math.sin(i * 12.9898) * 43758.5) % 1, r2 = Math.abs(Math.sin(i * 78.233) * 12543.7) % 1, r3 = Math.abs(Math.sin(i * 3.7) * 9631.1) % 1;
    const x = PX - 2.3 + 4.6 * r1, z = -6 + 15 * r2; if (Math.abs(x - PX) < 0.5 && Math.abs(z) < 1.1) continue; // keep the parking spot readable
    E.set((r3 - 0.5) * 0.5, r1 * 6, (r2 - 0.5) * 0.5); Q.setFromEuler(E); SC.set(1, 0.6 + 0.9 * r3, 1); M.compose(V0.set(x, 0.03, z), Q, SC); blades.setMatrixAt(i, M); } }
scene.add(blades);
// hot road shoulder (shimmer at "hot road")
const mHot = new THREE.MeshBasicMaterial({ color: 0, toneMapped: false, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false });
const hot = new THREE.Mesh(new THREE.PlaneGeometry(2.2, 14), mHot); hot.rotation.x = -Math.PI / 2; hot.position.set(2.6, 0.02, 1); scene.add(hot);
const waves = Array.from({ length: 6 }, (_, i) => { const m = box(1.6, 0.012, 0.012, 2.6, 0.2, -2 + i * 1.3, glow(ORANGE, 1), false); scene.add(m); return m; });

// ---- side stand on the bike's left (from kickstand-up); k 1 = down, 0 = up ----
function addStand(B) {
  const piv = new THREE.Group(); piv.position.set(-0.2, 0.36, 0.1); B.lean.add(piv);
  const m = glow(RED, 1), tip = new THREE.Object3D(); tip.position.set(0, -0.34, 0);
  piv.add(tube([0, 0, 0], [0, -0.34, 0], 0.055, m), box(0.14, 0.04, 0.2, 0, -0.34, 0, m, false), tip);
  return { piv, tip, set(k, hex, b) { piv.rotation.set(-0.2 * k - 1.45 * (1 - k), 0, -0.55 * k - 0.15 * (1 - k)); m.color.set(hex).multiplyScalar(b); } };
}
// ---- walking person: makePerson with hip-pivot legs ----
function walker() {
  const P0 = makePerson(); P0.body.children.slice(0, 6).forEach((c) => (c.visible = false));
  const legs = [-1, 1].map((s) => { const L = new THREE.Group(); L.position.set(s * 0.12, 0.92, 0); L.add(tube([0, 0, 0], [0, -0.84, 0], 0.14, P0.mats.legs), box(0.13, 0.09, 0.28, 0, -0.87, -0.05, P0.mats.feet)); P0.body.add(L); return L; });
  const bag = box(0.34, 0.42, 0.18, 0, 1.25, 0.2, glow(VIOLET, 0.9)); P0.body.add(bag);
  P0.set = ({ x, z, h, walk = 0, ph = 0, armR = 0, armL = 0, vis = true }) => {
    P0.g.visible = vis; if (!vis) return;
    P0.g.position.set(x, 0, z); P0.g.rotation.set(0, h, 0);
    const sw = Math.sin(ph) * 0.45 * walk; legs[0].rotation.x = sw; legs[1].rotation.x = -sw;
    P0.body.position.y = 0.03 * walk * Math.abs(Math.cos(ph));
    P0.armR.rotation.set(armR - sw * 0.6, 0, 0); P0.armL.rotation.set(armL + sw * 0.6, 0, 0);
  };
  P0.bag = bag; return P0;
}

// ---- timing ----
const tHot = g("s1", "hot"), tGrass = g("s1", "grass"), tStand = g("s1", "stand"), tDown = g("s1", "down");
const tSinks = g("s2", "sinks"), tGround = g("s2", "ground"), tBike = g("s2", "bike"), tFalls = g("s2", "falls"), tOver = g("s2", "over");
const tPlate3 = g("s3", "plate"), tBag = g("s3", "bag");
const tPut = g("s4", "put"), tUnder = g("s4", "under"), tKick = g("s4", "kickstand"), tLean = g("s4", "lean");
const tSpreads = g("s5", "spreads"), tWeight = g("s5", "weight"), tStand5 = g("s5", "stand"), tSink = g("s5", "sink");
const tStill = g("s6", "still"), tCome = g("s6", "come");

// ---- motion: roll in on the grass, stop at z = 0 ----
const vA = (t) => 2.6 * (1 - sm(tGrass - 0.5, tNeverStop(), t));
function tNeverStop() { return g("s1", "never") + 0.15; }
const DA = dist(vA, 0, 30), Z0 = DA(3);
const pA = (t) => [PX, Z0 - DA(t), 0];
const pPark = () => [PX, 0, 0];

const [Bk] = bikes(1), ST = addStand(Bk), MAN = walker();
// plate (puck)
const mPlate = glow(GREEN, 1.6), plate = new THREE.Group(); scene.add(plate);
plate.add(new THREE.Mesh(new THREE.CylinderGeometry(0.075, 0.075, 0.018, 32), mPlate));
const plateRim = new THREE.Mesh(new THREE.TorusGeometry(0.075, 0.006, 6, 32), glow(GREEN, 3)); plateRim.rotation.x = Math.PI / 2; plateRim.position.y = 0.01; plate.add(plateRim);
// rings: red dent (sinking) / green spread (on the plate) / green "still standing"
const mkRing = (r0, r1) => { const m = new THREE.MeshBasicMaterial({ color: 0, toneMapped: false, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide }); const r = new THREE.Mesh(new THREE.RingGeometry(r0, r1, 40), m); r.rotation.x = -Math.PI / 2; scene.add(r); return r; };
const dent = mkRing(0.05, 0.09), sp1 = mkRing(0.02, 0.03), sp2 = mkRing(0.02, 0.03), halo = mkRing(0.9, 1.0);
const setRing = (r, p, k, hex, s0, s1, a = 2.6) => { if (k <= 0 || k >= 1) { r.visible = false; return; } r.visible = true; r.position.set(p.x, 0.035, p.z); r.scale.setScalar(s0 + (s1 - s0) * k); r.material.color.set(hex).multiplyScalar(a * (1 - k)); };
// weight arrow (down onto the stand)
const mArr = glow(GREEN, 2.4), arrow = new THREE.Group(); scene.add(arrow);
arrow.add(tube([0, 0.35, 0], [0, 0.1, 0], 0.025, mArr)); { const c = new THREE.Mesh(new THREE.ConeGeometry(0.05, 0.1, 12), mArr); c.rotation.x = Math.PI; c.position.y = 0.06; arrow.add(c); }
const tPlateTag = tag("FLAT PLATE", GREEN, 2.0), tStill6 = tag("STILL STANDING", GREEN, 2.0);

title("NEVER PARK ON HOT ROAD OR SOFT GROUND");
cap("s1", "parking", ["HOT ROAD", "OR GRASS?"], VIOLET, { y: 0.3, until: ["s1", "never"] });
cap("s2", "kickstand", ["THE STAND", "SINKS IN"], RED, { y: 0.3, until: ["s2", "bike"] });
cap("s2", "bike", ["THE BIKE", "FALLS OVER"], RED, { y: 0.3, boom: 0.6 });
cap("s3", "carry", ["CARRY A SMALL", "FLAT PLATE"], GREEN, { y: 0.3 });
cap("s4", "put", ["PLATE UNDER", "THE STAND"], GREEN, { y: 0.3, until: ["s4", "before"] });
cap("s4", "before", ["THEN LEAN", "THE BIKE"], GREEN, { y: 0.3 });
cap("s5", "spreads", ["SPREADS", "THE WEIGHT"], GREEN, { y: 0.3, until: ["s5", "so"] });
cap("s5", "so", ["THE STAND", "DOESN'T SINK"], GREEN, { y: 0.3 });
cap("s6", "your", ["STILL STANDING"], GREEN, { y: 0.3 });
endCard(["SOFT GROUND?", "PLATE UNDER THE STAND."]);

// plate spot = stand tip with the bike leaned 0.2 on the stand
let SPOT = null;
function spot() {
  if (SPOT) return SPOT;
  ride(Bk, pPark, 0, GREEN, { lean: 0.2, still: true }); ST.set(1, GREEN, 1); Bk.g.updateMatrixWorld(true);
  SPOT = wp(ST.tip).clone(); SPOT.y = 0; return SPOT;
}
const MANX = PX - 1.0, MANZ = -1.35; // front-left of the bike, out of the camera line
const V = new THREE.Vector3(), V2 = new THREE.Vector3();
const SH = [
  { at: 0, cam: (t, su) => { const z = pA(t)[1]; return [PX - 3.4, 1.6, z + 2.4 - 0.15 * su, PX, 0.55, z - 0.3, 46]; } },
  { at: tStand - 0.15, K: [[0, [PX - 3.0, 1.0, 2.2, PX - 0.25, 0.3, 0.1, 42]], [1.6, [PX - 2.8, 0.9, 2.0, PX - 0.25, 0.28, 0.1, 42]]] },
  { at: T2, K: [[0, [PX - 2.4, 0.7, 1.5, PX - 0.3, 0.12, 0.1, 40]], [1.9, [PX - 2.2, 0.62, 1.35, PX - 0.3, 0.1, 0.1, 40]]] },
  { at: tBike - 0.3, K: [[0, [PX - 3.8, 1.7, 2.6, PX - 0.4, 0.35, 0, 46]], [1.6, [PX - 3.6, 1.55, 2.4, PX - 0.4, 0.3, 0, 46]]] },
  { at: T3, K: [[0, [PX - 3.6, 1.6, 1.4, MANX + 0.2, 1.0, MANZ + 0.1, 46]], [1.8, [PX - 3.3, 1.5, 1.2, MANX + 0.2, 1.0, MANZ + 0.1, 46]]] },
  { at: T4, K: [[0, [PX - 3.0, 1.1, 2.3, PX - 0.5, 0.3, -0.2, 44]], [2.3, [PX - 2.7, 1.0, 2.0, PX - 0.5, 0.28, -0.2, 44]]] },
  { at: T5, K: [[0, [PX - 2.3, 0.75, 1.5, PX - 0.35, 0.08, 0.12, 40]], [2.5, [PX - 2.1, 0.65, 1.3, PX - 0.35, 0.08, 0.12, 40]]] },
  { at: T6, K: [[0, [PX - 5.2, 2.3, 4.6, PX - 0.6, 0.7, -0.8, 48]], [2.2, [PX - 4.8, 2.1, 4.0, PX - 0.6, 0.7, -0.8, 48]]] },
  { at: T7, K: [[0, [PX - 3.6, 1.9, 3.0, PX - 0.2, 0.6, 0, 46]], [3, [PX - 1.8, 2.3, 3.9, PX - 0.2, 0.6, 0, 46]]] },
];

run("w", (t) => {
  const A = t < T3;
  // hot shoulder shimmer while the voice says "hot road"
  const hk = sm(tHot - 0.1, tHot + 0.15, t) * (1 - sm(tGrass, tGrass + 0.3, t));
  mHot.color.set(ORANGE).multiplyScalar(0.5 * hk);
  waves.forEach((w, i) => { w.visible = hk > 0.02; w.position.y = 0.1 + ((t * 0.6 + i * 0.17) % 1) * 0.6; w.material.color.set(ORANGE).multiplyScalar(1.6 * hk * (1 - ((t * 0.6 + i * 0.17) % 1))); });
  if (A) {
    const kS = sm(tStand - 0.05, tStand + 0.25, t);
    const sink = sm(tSinks - 0.05, tGround + 0.3, t);
    const f = sm(tFalls - 0.2, tOver + 0.15, t), fall = f * f;
    const lean = 0.2 * sm(tStand + 0.2, tDown + 0.2, t) + 0.12 * sink + (1.42 - 0.32) * fall;
    ride(Bk, t < tNeverStop() ? pA : pPark, t, t < T2 ? VIOLET : RED, { lean, trail: t < tNeverStop(), still: t >= tNeverStop() });
    Bk.g.position.y = -0.07 * sink;
    Bk.rider.visible = t < T2;
    ST.set(kS, RED, 1.2 + 2.2 * flash(t, tStand) + 1.5 * sink * (1 - fall));
    Bk.g.updateMatrixWorld(true);
    const tp = wp(ST.tip, V);
    setRing(dent, tp, t > tSinks - 0.05 && t < tFalls ? 0.5 * sm(tSinks - 0.05, tGround + 0.4, t) + 0.001 : 0, RED, 0.8, 2.2, 3);
    setRing(halo, V2.set(PX - 0.6, 0, 0), sm(tOver - 0.05, tOver + 0.7, t), RED, 0.4, 2.0);
    setRing(sp1, tp, 0, GREEN, 0, 0); setRing(sp2, tp, 0, GREEN, 0, 0);
    plate.visible = false; arrow.visible = false;
    // owner walks away from the bike in s2
    const w = sm(T2, T2 + 2.5, t);
    MAN.set({ x: PX - 0.8 - 0.8 * w, z: -0.3 - 3.4 * w, h: 0.22, walk: t > T2 ? 1 : 0, ph: t * 9, vis: t > T2 });
    tagAt(tPlateTag, 0, 0, 0, 0); tagAt(tStill6, 0, 0, 0, 0);
  } else {
    const sp = spot();
    const kS = sm(tKick - 0.1, tKick + 0.2, t);
    const lean = 0.2 * sm(tLean - 0.1, tLean + 0.4, t);
    ride(Bk, pPark, t, GREEN, { lean, still: true, trail: false });
    Bk.g.position.y = 0.012; Bk.rider.visible = false;
    ST.set(kS, kS < 0.5 ? ORANGE : GREEN, 1.3 + 2.4 * flash(t, tStand5 + 0.1) + 1.2 * flash(t, tLean + 0.4));
    // person: holds the bars, plate from the bag to the hand to the ground, walks off in s6 and back
    const out = sm(T6 - 0.1, T6 + 0.2, t), back = sm(tStill - 0.2, tCome + 0.5, t);
    const away = t < T6 ? 0 : 1 - back;
    const mx2 = MANX + 0.7 * away, mz2 = MANZ - 2.25 * away;
    MAN.set({ x: mx2, z: mz2, h: back > 0 && back < 1 ? 2.84 : -2.3, walk: t > T6 && back < 1 ? 1 : 0, ph: t * 9,
      armR: t < T6 ? 1.35 : 0, armL: t < T6 ? 0.9 * sm(tPlate3 - 0.3, tPlate3, t) * (1 - sm(tUnder + 0.1, tUnder + 0.5, t)) : 0, vis: true });
    MAN.g.updateMatrixWorld(true);
    const bagP = wp(MAN.bag, V).clone(), hand = wp(MAN.armL.userData.hand, V2).clone();
    const out3 = sm(tPlate3 - 0.25, tPlate3 + 0.1, t), dn = sm(tPut, tUnder + 0.35, t);
    plate.visible = t > tPlate3 - 0.3;
    if (t < tPut) plate.position.copy(bagP).lerp(hand, out3).add(V.set(0.12 * out3, 0.06 * Math.sin(Math.PI * out3), 0));
    else plate.position.copy(hand).lerp(V.set(sp.x, 0.01, sp.z), dn);
    plate.rotation.z = (1 - dn) * (t < tPut ? 0.6 * out3 : 0.6);
    mPlate.color.set(GREEN).multiplyScalar(1.4 + 2 * flash(t, tPlate3) + 1.5 * flash(t, tSpreads));
    tagAt(tPlateTag, 0, 0, 0, 0);
    // weight arrow + spreading rings on the plate
    const wk = sm(tSpreads - 0.3, tSpreads, t) * (1 - sm(T6 - 0.2, T6, t));
    arrow.visible = wk > 0.02; arrow.position.set(sp.x, 0.08 + 0.08 * (1 - wk) + 0.04 * Math.abs(Math.sin((t - tSpreads) * 6)), sp.z); arrow.scale.setScalar(0.6);
    const ph = (u) => (t > tSpreads && t < T6 ? ((t - tSpreads) / 0.7 + u) % 1 : 0);
    setRing(sp1, sp, ph(0), GREEN, 0.8, 3.0); setRing(sp2, sp, ph(0.5), GREEN, 0.8, 3.0);
    setRing(dent, sp, 0, RED, 0, 0);
    setRing(halo, V2.set(PX - 0.2, 0, 0), sm(tStill - 0.05, tStill + 0.8, t), GREEN, 0.4, 1.8);
    Bk.g.updateMatrixWorld(true);
    tagAt(tStill6, 0, 0, 0, 0);
  }
  const shot = shoot(SH, t);
  bloom.strength = 0.8 + 1.0 * shot.punch * shot.punch + overlays(t) + (A ? 0.7 * flash(t, tOver) : 0.4 * flash(t, tLean + 0.4));
});
