// 93 worn-tyres: your friend rides ahead in the rain on a worn rear tyre (red ring); it loses grip and they slide down in front of you.
// Right way: a tread close-up (macro slab far below the world): wear bars in the grooves, worn down to them, flat in the middle; cuts, bulges, cracks, pressure.
// Then at the kerb you point at their tyre and say it now (green).
import { THREE, S, g, sm, scene, bloom, box, glow, VIOLET, ORANGE, RED, GREEN, WHITE, pathState, shoot, run, patch, beam } from "./kit.js";
import { track, buildRoad, makePerson, pose, ARM, title, endCard, cap, overlays, bikes, ride, downLean, dist } from "./extra.js";

scene.fog.density = 0.008;
const T3 = S.s3[0], T6 = S.s6[0], T7 = S.s7[0];
const tWorn = g("s1", "worn"), tSl = g("s2", "slides");
const tTread = g("s3", "tread"), tBars = g("s3", "wear");
const tDn = g("s4", "down"), tFlat = g("s4", "flat"), tTime = g("s4", "time");
const tCut = g("s5", "cuts"), tBul = g("s5", "bulges"), tCr = g("s5", "cracks"), tPr = g("s5", "pressure");

const { P } = track([{ len: 3000 }]);
buildRoad(P, -80, 2200);
const [BF, BY] = bikes(2), fr = makePerson(), you = makePerson();
const ringM = new THREE.MeshBasicMaterial({ color: RED, toneMapped: false });
const ring = new THREE.Mesh(new THREE.TorusGeometry(0.37, 0.03, 8, 48), ringM); ring.rotation.y = Math.PI / 2; BF.rearW.add(ring);

// ---- A: riding in the rain; the friend's worn rear tyre lets go at "slides", you brake to a stop behind ----
const VA = 11;
const sF0 = (t) => 60 + VA * t, sl = (t) => (t > tSl ? (VA / 2.4) * (1 - Math.exp(-2.4 * (t - tSl))) : 0);
const aF = (t) => P(t < tSl ? sF0(t) : sF0(tSl) + sl(t), 1.0 - 0.45 * sm(tSl, tSl + 1.2, t));
const DY = dist((t) => VA * (1 - sm(tSl + 0.2, tSl + 1.8, t)), 0, T3);
const aY = (t) => P(46 + DY(t), 2.4);
const N = 500, rainGeo = new THREE.BufferGeometry(), rainP = new Float32Array(N * 6);
rainGeo.setAttribute("position", new THREE.BufferAttribute(rainP, 3));
const rain = new THREE.LineSegments(rainGeo, new THREE.LineBasicMaterial({ color: new THREE.Color(WHITE).multiplyScalar(0.9), toneMapped: false, transparent: true, opacity: 0.45 }));
rain.frustumCulled = false; scene.add(rain);
const hsh = (i, k) => { const v = Math.sin(i * 127.1 + k * 311.7) * 43758.5453; return v - Math.floor(v); };
const setRain = (cx, cz, t) => {
  for (let i = 0; i < N; i++) {
    const x = cx - 9 + 18 * hsh(i, 1), z = cz - 30 + 40 * hsh(i, 2), y = 7 - ((7 * hsh(i, 3) + 16 * t) % 7);
    rainP.set([x, y, z, x - 0.03, y + 0.45, z + 0.06], i * 6);
  }
  rainGeo.attributes.position.needsUpdate = true;
};

// ---- B: macro tread slab far below the world ----
const MY = -200, mBase = new THREE.MeshStandardMaterial({ color: 0x15123a, emissive: 0x0a081f, roughness: 0.9 });
scene.add(box(3.4, 0.4, 6.2, 0, MY - 0.2, 0, mBase, false));
const mRib = new THREE.MeshStandardMaterial({ color: 0x3a33a0, emissive: 0x1f1a5e, roughness: 0.55, metalness: 0.2 });
const ribX = [-1.2, -0.6, 0, 0.6, 1.2], blocks = [];
for (const x of ribX) for (let k = 0; k < 7; k++) { const b = box(0.42, 1, 0.78, x, MY + 0.5, -2.7 + 0.9 * k, mRib); scene.add(b); blocks.push([b, x]); }
const mBar = glow(ORANGE, 0.6), bars = [];
for (const x of [-0.9, -0.3, 0.3, 0.9]) for (const z of [-1.35, 1.35]) { const b = box(0.17, 0.08, 0.22, x, MY + 0.04, z, mBar, false); scene.add(b); bars.push(b); }
const flatP = patch(1.6, 6.2, RED, 0.5);
const mCut = glow(RED, 2.6), cut = box(0.09, 0.03, 0.9, 0.6, MY, -0.9, mCut, false); cut.rotation.y = 0.5; scene.add(cut);
const bulge = new THREE.Mesh(new THREE.SphereGeometry(0.32, 20, 12), glow(RED, 1.8)); bulge.scale.set(1, 0.5, 1); bulge.position.set(-0.6, MY + 0.1, 0.5); scene.add(bulge);
const cracks = new THREE.Group(); scene.add(cracks);
for (let i = 0; i < 3; i++) for (let j = 0; j < 3; j++) { const c = box(0.22, 0.02, 0.035, -1.2 - 0.14 + 0.14 * j, 0, -0.6 + 0.3 * i, glow(ORANGE, 2.8), false); c.rotation.y = j % 2 ? 0.7 : -0.7; cracks.add(c); }
const gauge = new THREE.Group(); gauge.position.set(0.85, MY + 0.9, 2.5); gauge.rotation.set(-0.45, 0.3, 0); scene.add(gauge);
const dial = new THREE.Mesh(new THREE.CylinderGeometry(0.42, 0.42, 0.04, 40), glow(VIOLET, 0.5)); dial.rotation.x = Math.PI / 2; gauge.add(dial);
const rim = new THREE.Mesh(new THREE.TorusGeometry(0.43, 0.025, 8, 48), glow(VIOLET, 2.2)); gauge.add(rim);
const zone = new THREE.Mesh(new THREE.TorusGeometry(0.34, 0.035, 6, 24, 0.8), glow(GREEN, 2.4)); zone.rotation.z = 0.9; zone.position.z = 0.03; gauge.add(zone);
const needleG = new THREE.Group(); needleG.position.z = 0.04; gauge.add(needleG);
needleG.add(box(0.03, 0.34, 0.02, 0, 0.17, 0, glow(ORANGE, 3), false));

// ---- C: at the kerb, the friend's bike parked, you point at the rear tyre ----
const sC = 900, oC = 3.0, [xC, zC] = P(sC, oC);
const cF = () => [xC, zC];

title("NEVER LET A FRIEND RIDE ON WORN TYRES");
cap("s2", "wet", ["NO GRIP", "IN THE WET"], RED, { until: ["s2", "slides"] });
cap("s2", "slides", ["THEY SLIDE DOWN", "IN FRONT OF YOU"], RED, { boom: 0.5 });
cap("s3", "tread", ["LOOK AT THE TREAD"], GREEN, { until: ["s3", "wear"] });
cap("s3", "wear", ["FIND THE", "WEAR BARS"], GREEN);
cap("s4", "down", ["DOWN TO THE BARS?"], RED, { until: ["s4", "flat"] });
cap("s4", "flat", ["FLAT IN", "THE MIDDLE?"], RED, { until: ["s4", "time"] });
cap("s4", "time", ["TIME FOR", "NEW TYRES"], RED, { boom: 0.5 });
cap("s5", "cuts", ["CUTS, BULGES,", "CRACKS"], ORANGE, { until: ["s5", "pressure"] });
cap("s5", "pressure", ["AND THE PRESSURE"], ORANGE);
cap("s6", "saying", ["SAY IT NOW"], GREEN, { until: ["s6", "watching"] });
cap("s6", "watching", ["NOT AFTER", "THEY SLIDE"], GREEN);
endCard(["CHECK THE TREAD.", "SAY SOMETHING."]);

const fol = (fn) => (t) => pathState(fn, t);
const M = (x, y, z, tx, ty, tz, f = 46) => [x, MY + y, z, tx, MY + ty, tz, f];
const SH = [
  { at: 0, f: fol(aF), noRot: true, K: [[0, [2.6, 0.7, 3.4, 0, 0.4, -0.2, 46]], [tWorn + 0.6, [2.9, 0.9, 3.9, 0, 0.45, -0.4, 46]], [S.s2[0], [2.6, 2.0, 7.5, 0.2, 0.5, -3, 46]]] },
  { at: S.s2[0], f: fol(aY), noRot: true, K: [[0, [0.4, 3.0, 7.5, -1.4, 0.4, -12, 46]], [4, [0.6, 3.3, 8, -1.4, 0.4, -12, 46]]] },
  { at: T3, K: [[0, M(3.6, 3.4, 5.4, 0, 0, 0)], [tBars - T3, M(3.4, 3.1, 5.0, 0, 0, 0.2)], [tBars - T3 + 0.8, M(2.2, 2.6, 4.4, 0.3, 0, 0.9)], [4, M(2.1, 2.5, 4.2, 0.3, 0, 0.9)]] },
  { at: S.s4[0], K: [[0, M(2.2, 2.8, 5.4, 0, 0, 0.3)], [4, M(2.0, 3.2, 5.8, 0, 0, 0.3)]] },
  { at: S.s5[0], K: [[0, M(1.8, 3.0, 5.0, 0, 0.1, 0.6)], [4, M(1.7, 3.2, 5.3, 0, 0.1, 0.6)]] },
  { at: T6, K: [[0, [xC - 4.6, 2.2, zC + 5.6, xC + 0.2, 0.6, zC + 0.3, 46]], [3, [xC - 4.9, 2.4, zC + 6.0, xC + 0.2, 0.6, zC + 0.3, 46]]] },
  { at: T7, K: [[0, [xC - 4.5, 3.0, zC + 7, xC + 0.3, 0.6, zC, 46]], [6, [xC - 5, 3.6, zC + 8, xC + 0.3, 0.6, zC, 46]]] },
];

const va = new THREE.Vector3();
run("w", (t) => {
  const A = t < T3, B = !A && t < T6;
  if (A) {
    const k = sm(tSl, tSl + 0.35, t), hex = t < S.s2[0] ? VIOLET : RED;
    ride(BF, aF, t, hex, k > 0 ? { lean: downLean(k, -1), down: k, trail: false } : { trail: true });
    ride(BY, aY, t, hex, { trail: true });
    const st = pathState(aF, t);
    if (t > tSl + 0.25) pose(fr, { x: st.x - 1.1, z: st.z + 0.6, h: -1.3, lie: 1, hex: RED }); else pose(fr, { vis: false });
    pose(you, { vis: false });
    const sy = pathState(aY, t); setRain(sy.x, sy.z, t); rain.visible = true;
    ringM.color.set(RED).multiplyScalar(sm(tWorn - 0.3, tWorn + 0.2, t) * (2.2 + 0.8 * Math.sin(9 * t)));
  } else {
    rain.visible = false; ride(BY, null, t, GREEN);
    if (B) { ride(BF, null, t, RED); pose(fr, { vis: false }); pose(you, { vis: false }); }
    else {
      const st = ride(BF, cF, t, GREEN, { still: true, trail: false }); BF.rider.visible = false;
      ringM.color.set(t < T7 ? RED : GREEN).multiplyScalar(t < T7 ? 2.2 + 0.8 * Math.sin(9 * t) : 2.6);
      // you crouch-point at the rear wheel from behind-left; the friend stands at the front looking back
      const rx = xC, rz = zC + 0.68;
      pose(you, { x: rx + 1.2, z: rz + 0.6, h: Math.atan2(1.2, 0.6), armR: ARM.point, hex: GREEN });
      pose(fr, { x: xC - 0.9, z: zC - 1.2, h: Math.atan2(-0.9, -1.88), hex: GREEN });
      void st;
    }
  }
  // tread: new (0.32) -> down to the bars (0.11) -> middle flat (0.08); colour violet -> red
  const kDn = sm(tDn, tDn + 0.8, t), kFl = sm(tFlat, tFlat + 0.7, t);
  for (const [b, x] of blocks) {
    const mid = Math.abs(x) < 0.7 ? 1 : 0, h = 0.32 - 0.21 * kDn - 0.03 * kFl * mid;
    b.scale.y = h; b.position.y = MY + h / 2;
  }
  const kR = Math.max(kDn, sm(tCut - 0.2, tCut, t));
  mRib.emissive.set(0x1f1a5e).lerp(new THREE.Color(0x6a0f1a), kR);
  mBar.color.set(ORANGE).multiplyScalar(0.6 + 2.6 * sm(tBars - 0.1, tBars + 0.3, t) * (B ? 1 : 0));
  flatP.position.set(0, MY + 0.1, 0); flatP.set(B && t < S.s5[0] ? 0.7 * kFl : 0);
  const pop = (a) => sm(a - 0.1, a + 0.25, t);
  cut.visible = t > tCut - 0.1; cut.position.y = MY + 0.12; cut.scale.set(1, 1, pop(tCut));
  bulge.visible = t > tBul - 0.1; bulge.scale.set(1, 0.5, 1).multiplyScalar(Math.max(0.01, pop(tBul)));
  cracks.visible = t > tCr - 0.1; cracks.position.set(0, MY + 0.12, 0);
  for (const c of cracks.children) c.scale.x = Math.max(0.01, pop(tCr));
  gauge.visible = t > tPr - 0.15; gauge.scale.setScalar(Math.max(0.01, 0.95 * pop(tPr)));
  needleG.rotation.z = 2.2 - 3.0 * sm(tPr + 0.2, tPr + 1.0, t);
  void va;
  const shot = shoot(SH, t);
  bloom.strength = 1.0 + 1.2 * shot.punch * shot.punch + overlays(t);
});
