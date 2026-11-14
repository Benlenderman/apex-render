// 110 wet-leaves: wrong = a rider takes a leaf-covered bend at dry-road speed, leans, the tyre slides on the wet leaves, the bike goes down (red).
// Right = slow down on the straight while upright, ride the bare line between the leaves, lean less, smooth; shade under trees stays wet (green).
import { THREE, S, g, sm, flash, scene, bloom, box, glow, mSolid, mEdge, VIOLET, ORANGE, RED, GREEN, WHITE, pathState, shoot, run, patch, beam } from "./kit.js";
import { track, buildRoad, makePerson, pose, title, endCard, cap, overlays, bikes, ride, tag, tagAt } from "./extra.js";

// ---------- props: fallen leaves (instanced flat leaf shapes), autumn trees, wet shade ----------
const hash = (i, k) => { const v = Math.sin(i * 12.9898 + k * 78.233) * 43758.5453; return v - Math.floor(v); };
const leafGeo = (() => { const sh = new THREE.Shape(); sh.moveTo(0, -0.13); sh.quadraticCurveTo(0.1, 0, 0, 0.13); sh.quadraticCurveTo(-0.1, 0, 0, -0.13); const geo = new THREE.ShapeGeometry(sh); geo.rotateX(-Math.PI / 2); return geo; })();
const LEAF_COLS = [0xff6a1a, 0xffa020, 0xd8401a, 0xffc040, 0xb83a10].map((c) => new THREE.Color(c));
// leaves on a stretch of road: keep(s, o) = false leaves bare road
function leaves(P, s0, s1, n, keep, seed = 0) {
  const mat = new THREE.MeshBasicMaterial({ color: new THREE.Color(1, 1, 1).multiplyScalar(0.85), toneMapped: false, fog: true });
  const m = new THREE.InstancedMesh(leafGeo, mat, n), M = new THREE.Matrix4(), q = new THREE.Quaternion(), sc = new THREE.Vector3(), p = new THREE.Vector3(), Y = new THREE.Vector3(0, 1, 0);
  let k = 0;
  for (let i = 0; k < n && i < n * 6; i++) {
    const s = s0 + (s1 - s0) * hash(i + seed, 1), o = -4.0 + 8.0 * hash(i + seed, 2);
    if (!keep(s, o)) continue;
    const [x, z] = P(s, o); p.set(x, 0.012 + 0.002 * hash(i, 5), z); q.setFromAxisAngle(Y, hash(i + seed, 3) * 6.28); sc.setScalar(0.8 + 0.9 * hash(i + seed, 4));
    M.compose(p, q, sc); m.setMatrixAt(k, M); m.setColorAt(k, LEAF_COLS[Math.floor(hash(i + seed, 6) * 5)]); k++;
  }
  m.count = k; m.instanceMatrix.needsUpdate = true; m.instanceColor.needsUpdate = true; scene.add(m); return m;
}
const mTrunk = new THREE.MeshStandardMaterial({ color: 0x2a1f50, emissive: 0x140e30, roughness: 0.8 });
const mCanopy = new THREE.MeshStandardMaterial({ color: 0xc8501a, emissive: 0x5a1e08, roughness: 0.7, flatShading: true });
function tree(x, z, r = 1.8, seed = 0) {
  const G = new THREE.Group(); G.position.set(x, 0, z); scene.add(G);
  G.add(box(0.32, 3.4, 0.32, 0, 1.7, 0, mTrunk, false));
  const c = new THREE.Mesh(new THREE.IcosahedronGeometry(r, 1), mCanopy); c.position.set(0, 3.6 + 0.4 * hash(seed, 9), 0); c.scale.set(1, 0.8, 1); c.rotation.y = seed;
  c.add(new THREE.LineSegments(new THREE.EdgesGeometry(c.geometry), new THREE.LineBasicMaterial({ color: new THREE.Color(ORANGE).multiplyScalar(0.9), toneMapped: false })));
  G.add(c); return G;
}

scene.fog.density = 0.012;
// A bend at 100, B bend at 600 (both left, R 30), shaded tree tunnel after B
const BA = 100, BB = 600, R = 30, BL = 50;
const { P } = track([{ len: BA }, { len: BL, R }, { len: BB - BA - BL }, { len: BL, R }, { len: 3000 }]);
buildRoad(P, -60, 1100, { lamps: false });
const T2 = S.s2[0], T3 = S.s3[0], T4 = S.s4[0], T5 = S.s5[0], T6 = S.s6[0], T7 = S.s7[0];
const OL = 1.75;
for (let s = -40, i = 0; s < 1000; s += 9, i++) for (const sd of [-1, 1]) if (hash(i, sd + 3) > 0.3) { const [x, z] = P(s + 4 * hash(i, sd), sd * (5.6 + 1.5 * hash(i, sd + 7))); tree(x, z, 1.5 + 0.8 * hash(i, sd + 2), i); }

// ---- A: leaves all over the bend, rider at dry-road speed ----
const leavesA = leaves(P, BA - 12, BA + BL + 8, 2600, () => true, 0);
const VA = 13.5, tSl = g("s2", "slides"), tDn = g("s2", "goes");
const tIn = tSl - 1.5; // reaches the bend 1.5 s before the slide
const uS = (t) => Math.max(0, t - tSl);
const aS = (t) => (t < tSl ? BA + VA * (t - tIn) : BA + VA * (tSl - tIn) + VA * 0.9 * (1 - Math.exp(-uS(t) / 0.9)));
const kSl = (t) => sm(tSl, tSl + 1.1, t);
const aPath = (t) => P(aS(t), OL + 2.3 * kSl(t)); // the tyres let go: the bike runs wide
const kD = (t) => sm(tSl + 0.1, tDn + 0.25, t);
const [Bk] = bikes(1), THROWN = makePerson();
const skid = beam(RED, 2.4, 0.06), skA = new THREE.Vector3(), skB = new THREE.Vector3();
let leanSign = 1; { const st = pathState(aPath, tSl - 0.05); leanSign = Math.sign(st.lean) || 1; }

// ---- B: brake on the straight, bare line between the leaves, lean less ----
const lineO = (s) => OL - 0.25 + 0.55 * Math.sin((s - BB) / 9); // the bare strip the rider follows
const leavesB = leaves(P, BB - 12, BB + BL + 8, 2400, (s, o) => Math.abs(o - lineO(s)) > 0.75, 777);
const tBr = g("s3", "slow"), tUp = g("s3", "upright");
const vB = (t) => 13.5 - 6.5 * sm(tBr - 0.1, tUp + 0.3, t) + 4 * sm(T6 + 0.4, T6 + 2.4, t);
const DB = (() => { const dt = 0.01, A = [0]; for (let t = T3; t < T7 + 6; t += dt) A.push(A.at(-1) + vB(t + dt / 2) * dt); return (t) => { const f = Math.max(0, (t - T3) / dt), i = Math.min(A.length - 2, Math.floor(f)); return A[i] + (A[i + 1] - A[i]) * (f - i); }; })();
const sB0 = BB - 1 - DB(T4), sB = (t) => sB0 + DB(t);
const oB = (t) => { const s = sB(t); return s < BB - 12 ? OL : s < BB - 4 ? OL + (lineO(s) - OL) * sm(BB - 12, BB - 4, s) : lineO(s); };
const bPath = (t) => P(sB(t), oB(t));
// shade under trees after the bend: wet dark patches with a sheen
const sSh = sB(T6) + 12;
const mWet = new THREE.MeshStandardMaterial({ color: 0x1a2a60, emissive: 0x0c1a48, roughness: 0.05, metalness: 0.8, transparent: true, opacity: 0.85 });
for (let i = 0; i < 6; i++) { const [x, z] = P(sSh + i * 3.2, -1.2 + 2.6 * hash(i, 11)), m = new THREE.Mesh(new THREE.CircleGeometry(1.2 + 0.9 * hash(i, 12), 24), mWet); m.rotation.x = -Math.PI / 2; m.scale.set(1.3, 1, 1); m.position.set(x, 0.009, z); scene.add(m); }
for (let i = 0; i < 6; i++) for (const sd of [-1, 1]) { const [x, z] = P(sSh - 2 + i * 4, sd * 4.6); tree(x, z, 2.6, 50 + i); }
leaves(P, sSh - 4, sSh + 22, 500, (s, o) => Math.abs(o - OL) > 1.0 || hash(Math.round(s * 7), 3) > 0.8, 4242);
const shade = patch(9, 26, 0x2040ff, 0.5); { const [x, z] = P(sSh + 9, 0); shade.position.set(x, 0.02, z); const [x2, z2] = P(sSh + 10, 0); shade.rotation.z = Math.atan2(x2 - x, -(z2 - z)) * 0; }

// overlays
const brZ = patch(1.4, 1, GREEN, 0.8), lineZ = [], leafZone = patch(8, BL + 14, RED, 0.35);
for (let i = 0; i < 30; i++) lineZ.push(patch(0.55, 2.2, GREEN, 0.9));
{ const [x, z] = P(BA + BL / 2 - 4, 0), [x1, z1] = P(BA + BL / 2 - 3, 0); leafZone.position.set(x, 0.025, z); leafZone.rotation.z = Math.atan2(x1 - x, -(z1 - z)); }
const strip = (m, a, b, o, k) => { const [x, z] = P((a + b) / 2, o), [x1, z1] = P((a + b) / 2 + 0.5, o); m.position.set(x, 0.03, z); m.rotation.z = Math.atan2(x1 - x, -(z1 - z)); m.scale.set(1, Math.max(0.1, Math.abs(b - a)), 1); m.set(k); };
const tLeaves = tag("WET LEAVES", ORANGE), tFast = tag("DRY-ROAD SPEED", RED), tSlide = tag("TYRE SLIDES", RED), tBrake = tag("BRAKE HERE", GREEN), tUpr = tag("UPRIGHT", GREEN),
  tBare = tag("BARE ROAD", GREEN), tLean = tag("LEAN LESS", GREEN), tNoBr = tag("NO HARD BRAKING", ORANGE), tThr = tag("SMOOTH THROTTLE", GREEN), tWetS = tag("STILL WET", ORANGE);

title("NEVER CORNER ON WET LEAVES");
cap("s2", "wet", ["WET LEAVES", "ARE SLIPPERY"], RED, { until: ["s2", "the"], y: 0.3 });
cap("s2", "the", "THE TYRE SLIDES", RED, { until: ["s2", "and"], y: 0.3 });
cap("s2", "and", ["AND THE BIKE", "GOES DOWN"], RED, { y: 0.3, boom: 0.6 });
cap("s3", "slow", ["SLOW DOWN BEFORE", "THE BEND, UPRIGHT"], GREEN, { y: 0.3 });
cap("s4", "pick", ["PICK THE BARE ROAD", "BETWEEN THE LEAVES"], GREEN, { y: 0.3 });
cap("s5", "lean", ["LEAN LESS, NO HARD", "BRAKING, SMOOTH THROTTLE"], GREEN, { y: 0.3 });
cap("s6", "shade", ["SHADE UNDER TREES", "STAYS WET"], ORANGE, { y: 0.3 });
endCard(["LEAVES ARE SLIPPERY.", "SLOW AND UPRIGHT."]);

const fol = (fn) => (t) => pathState(fn, t);
const cam = (s, o, y, ls, lo, ly, f) => { const [x, z] = P(s, o), [lx, lz] = P(ls, lo); return [x, y, z, lx, ly, lz, f]; };
const sCr = aS(tSl);
const SH = [
  // hook: chase behind the rider as the leaf-covered bend comes up
  { at: 0, f: fol(aPath), K: [[0, [-1.2, 2.6, 6.8, 0.6, 0.6, -14, 50]], [3, [-1.4, 2.8, 6.4, 0.4, 0.4, -12, 50]]] },
  // s2: from the outside of the bend, high, the slide and the fall
  { at: T2, f: fol(aPath), K: [[0, [-5, 5.5, 6.5, 0.5, 0.4, -1, 48]], [3.5, [-6, 6, 5.5, 0.5, 0.3, 0, 48]]] },
  // s3: side chase on the straight, braking upright
  { at: T3, f: fol(bPath), K: [[0, [-6.5, 3.2, 4.5, 0, 0.7, -2, 48]], [3, [-6.5, 3.4, 3.8, 0, 0.7, -3, 48]]] },
  // s4: high behind, the bare strip through the leaves
  { at: T4, f: fol(bPath), K: [[0, [-0.6, 6.5, 9.5, 0.2, 0, -5, 50]], [3, [-0.8, 7.0, 9.0, 0.2, 0, -6, 50]]] },
  // s5: low front three-quarter, small lean
  { at: T5, f: fol(bPath), K: [[0, [-3.5, 3.2, 5, 0, 0.6, -4, 48]], [3, [-3.2, 3.0, 4.6, 0, 0.6, -4, 48]]] },
  // s6: high wide over the tree tunnel and its wet shade
  { at: T6, f: fol(bPath), K: [[0, [-0.8, 2.2, 6.5, 0, 0.8, -8, 50]], [3, [-0.8, 2.3, 6.0, 0, 0.8, -9, 50]]] },
  { at: T7, f: fol(bPath), K: [[0, [-4, 11, 9, 0.5, 0, -8, 48]], [4, [-5, 15, 12, 0.5, 0, -10, 48]]] },
];

const on = (t, a, b = 1e9) => sm(a - 0.1, a + 0.2, t) * (1 - sm(b - 0.15, b, t));
run("w", (t) => {
  const A = t < T3;
  let st;
  if (A) {
    const k = kD(t), s0 = pathState(aPath, t);
    st = ride(Bk, aPath, t, t < T2 ? VIOLET : RED, k > 0 ? { lean: (leanSign * 1.45 - s0.lean) * k, down: k } : {});
    if (t > tDn) { const u = t - tDn, [px, pz] = P(aS(t) + 1.0 + 2.0 * sm(0, 1.0, u), OL + 2.3 * kSl(t) + 1.2 * sm(0, 1.0, u)); pose(THROWN, { x: px, z: pz, h: 0.8, lie: sm(0, 0.35, u), armR: 2.4, armL: 1.8, hex: RED }); } else pose(THROWN, { vis: false });
    // skid mark from where the tyre let go
    const [x0, z0] = P(sCr, OL), a = t > tSl ? 1 : 0; skA.set(x0, 0.03, z0); skB.set(st.x, 0.03, st.z); skid.set(skA, skB, a);
    leavesA.material.color.setRGB(0.85, 0.85, 0.85).lerp(new THREE.Color(RED).multiplyScalar(1.4), t > T2 ? on(t, g("s2", "slippery")) * 0.7 : 0);
  } else {
    pose(THROWN, { vis: false }); skid.set(skA, skA, 0);
    st = ride(Bk, bPath, t, GREEN, { trail: true });
  }
  leafZone.set(A ? on(t, g("s1", "never"), T2 + 0.2) * 0.7 : 0);
  const [lx, lz] = P(BA + 10, -1.5);
  tagAt(tLeaves, lx, 1.6, lz, A ? on(t, g("s1", "leaves"), g("s1", "never")) : 0, 4.5);
  // B overlays
  const b0 = sB(tBr - 0.1), b1 = Math.min(BB - 4, sB(Math.min(t, tUp + 0.3)));
  strip(brZ, b0, Math.max(b0 + 0.2, b1), OL, A ? 0 : on(t, tBr, T4) * 0.9);
  const lineA = A ? 0 : on(t, g("s4", "line"), T6);
  lineZ.forEach((m, i) => { const s = BB - 4 + i * 2.1; const [x, z] = P(s, lineO(s)), [x1, z1] = P(s + 0.5, lineO(s + 0.5)); m.position.set(x, 0.03, z); m.rotation.z = Math.atan2(x1 - x, -(z1 - z)); m.set(lineA * 0.8 * sm(0, 0.6, (t - g("s4", "line")) * 3 - i * 0.12)); });
  tagAt(tBare, ...P(BB + 14, lineO(BB + 14) - 1.6).flatMap((v, i) => (i ? [1.0, v] : [v])), A ? 0 : on(t, g("s4", "bare"), T5), 1.4);
  shade.set(0);
  const shot = shoot(SH, t);
  bloom.strength = 1.0 + 1.2 * shot.punch * shot.punch + overlays(t) + (A ? 0.8 * flash(t, tDn) : 0);
});
