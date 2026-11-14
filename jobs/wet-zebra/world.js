// 103 wet-zebra: wrong = in the rain the rider brakes hard on the white stripes, the front wheel locks, the bike goes down (red).
// Right = brake before the paint on the dark road, cross straight with light brakes, brake again on the far side; same for arrows,
// words and lines (green).
import { THREE, S, g, sm, flash, scene, camera, bloom, box, VIOLET, ORANGE, RED, GREEN, WHITE, pathState, shoot, run, patch } from "./kit.js";
import { track, buildRoad, makePerson, pose, title, endCard, cap, overlays, bikes, ride, downLean, tag, tagAt } from "./extra.js";

// ---- props: wet white paint (zebra, arrow, painted word) ----
const mPaint = new THREE.MeshStandardMaterial({ color: 0xffffff, emissive: 0x8088b0, roughness: 0.08, metalness: 0.35 });
const flat = (geo, x, z, rz = 0) => { const m = new THREE.Mesh(geo, mPaint); m.rotation.set(-Math.PI / 2, 0, rz); m.position.set(x, 0.014, z); scene.add(m); return m; };
const ZD = 5, XS = [-3.25, -2.25, -1.25, -0.25, 0.75, 1.75, 2.75]; // stripes run with traffic, rider's lane line sits on the 1.75 stripe
const zebra = (s0) => XS.forEach((x) => flat(new THREE.PlaneGeometry(0.5, ZD), x, -(s0 + ZD / 2)));
function arrow(s, o) {
  const sh = new THREE.Shape([[-0.18, 0], [0.18, 0], [0.18, 2.2], [0.55, 2.2], [0, 3.4], [-0.55, 2.2], [-0.18, 2.2]].map(([a, b]) => new THREE.Vector2(a, b)));
  flat(new THREE.ShapeGeometry(sh), o, -s);
}
function word(txt, s, o) {
  const c = document.createElement("canvas"); c.width = 512; c.height = 1024; const x = c.getContext("2d");
  x.fillStyle = "#fff"; x.font = "bold 165px Arial"; x.textAlign = "center"; x.textBaseline = "middle";
  x.save(); x.translate(256, 512); x.scale(1, 3.4); x.fillText(txt, 0, 0); x.restore();
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace;
  const m = new THREE.Mesh(new THREE.PlaneGeometry(2.6, 5.2), new THREE.MeshStandardMaterial({ map: t, transparent: true, emissive: 0x8088b0, emissiveMap: t, roughness: 0.08, metalness: 0.35, depthWrite: false }));
  m.rotation.set(-Math.PI / 2, 0, 0); m.position.set(o, 0.015, -s); scene.add(m);
}

scene.fog.density = 0.011;
const { P } = track([{ len: 4000 }]);
buildRoad(P, -80, 1400, { lamps: true });
const T2 = S.s2[0], T3 = S.s3[0], T4 = S.s4[0], T5 = S.s5[0], T6 = S.s6[0], T7 = S.s7[0];
const OL = 1.75;

// ---- A: wrong way, full brake on the paint at 12 m/s ----
const ZA = 120, VA = 12, tLock = g("s2", "locks"), tDown = g("s2", "goes");
const sL = ZA + 0.6, uS = (t) => Math.max(0, t - tLock);
const aS = (t) => (t < tLock ? sL - VA * (tLock - t) : sL + VA * 0.75 * (1 - Math.exp(-uS(t) / 0.75)));
const kD = (t) => sm(tLock + 0.15, tDown + 0.1, t);
const aPath = (t) => P(aS(t), OL + 0.9 * kD(t));
zebra(ZA);
const [Bk] = bikes(1), THROWN = makePerson();
const skid = patch(0.14, 1, RED, 1.4);

// ---- B: right way, brake on the dark road, light and straight on the paint, brake again after ----
const ZB = 640, tBr = g("s3", "braking"), tDark = g("s3", "dark"), tOnP = g("s4", "keep"), tBr2 = g("s5", "brake"), tFar = g("s5", "side");
const vB = (t) => 12 - 8 * sm(tBr - 0.1, tDark + 0.2, t) - 1.6 * sm(tBr2 - 0.1, tFar + 0.3, t) + 6 * sm(T6, T6 + 1.5, t);
const DB = (() => { const dt = 0.01, A = [0]; for (let t = T3; t < T7 + 5; t += dt) A.push(A.at(-1) + vB(t + dt / 2) * dt); return (t) => { const f = Math.max(0, (t - T3) / dt), i = Math.min(A.length - 2, Math.floor(f)); return A[i] + (A[i + 1] - A[i]) * (f - i); }; })();
const sB0 = ZB - DB(tOnP), sB = (t) => sB0 + DB(t), bPath = (t) => P(sB(t), OL);
zebra(ZB);
// s6: an arrow, a painted word and a stop line ahead of B
const sAr = sB(T6) + 14, sWd = sAr + 10, sLn = sWd + 9;
arrow(sAr, OL); word("SLOW", sWd, OL);
flat(new THREE.PlaneGeometry(3.4, 0.45), OL, -sLn);

// ---- rain: streaks around the camera ----
const RN = 900, rg = new THREE.BufferGeometry(), rp = new Float32Array(RN * 6), seed = Array.from({ length: RN }, (_, i) => [Math.sin(i * 12.9898) * 43758.5453 % 1, Math.sin(i * 78.233) * 12543.123 % 1, Math.sin(i * 39.425) * 9137.77 % 1].map((v) => Math.abs(v)));
rg.setAttribute("position", new THREE.BufferAttribute(rp, 3));
const rain = new THREE.LineSegments(rg, new THREE.LineBasicMaterial({ color: new THREE.Color(0xbfd0ff).multiplyScalar(0.9), transparent: true, opacity: 0.5, toneMapped: false, fog: false }));
rain.frustumCulled = false; scene.add(rain);
const setRain = (t) => {
  const c = camera.position;
  for (let i = 0; i < RN; i++) { const [a, b, d] = seed[i], x = c.x + (a - 0.5) * 30, z = c.z + (b - 0.5) * 30 - 6, y = ((d * 14 - t * 16) % 14 + 14) % 14 + c.y - 9; rp.set([x, y, z, x + 0.03, y + 0.55, z + 0.08], i * 6); }
  rg.attributes.position.needsUpdate = true;
};

// overlays
const warnA = patch(7.2, ZD, RED, 0.3); { const [x, z] = P(ZA + ZD / 2, 0); warnA.position.set(x, 0.03, z); }
const brZ = patch(1.4, 1, GREEN, 0.8), brZ2 = patch(1.4, 1, GREEN, 0.8), line = patch(0.3, ZD + 1, GREEN, 1.2);
{ const [x, z] = P(ZB + ZD / 2, OL); line.position.set(x, 0.035, z); }
const strip = (m, a, b, o, k) => { const [x, z] = P((a + b) / 2, o); m.position.set(x, 0.03, z); m.scale.set(1, Math.max(0.1, Math.abs(b - a)), 1); m.set(k); };
const tPaint = tag("WET PAINT", RED), tNo = tag("NO BRAKES HERE", RED), tLockT = tag("FRONT LOCKS", RED), tBrH = tag("BRAKE HERE", GREEN),
  tStr = tag("STRAIGHT", GREEN), tLight = tag("LIGHT BRAKES", ORANGE), tAgain = tag("BRAKE AGAIN", GREEN),
  tArr = tag("ARROWS", ORANGE), tWord = tag("WORDS", ORANGE), tLine = tag("LINES", ORANGE);

title("NEVER BRAKE ON WHITE PAINT IN THE RAIN");
cap("s1", "rain", ["RAIN, AND A", "CROSSING AHEAD?"], VIOLET, { until: ["s1", "never"] });
cap("s1", "never", ["NEVER BRAKE ON", "THE WHITE PAINT"], RED);
cap("s2", "wet", ["WET PAINT IS SLICK"], RED, { until: ["s2", "the"], y: 0.3 });
cap("s2", "the", ["THE FRONT WHEEL LOCKS"], RED, { until: ["s2", "and"], y: 0.3 });
cap("s2", "and", ["AND THE BIKE GOES DOWN"], RED, { y: 0.3, boom: 0.6 });
cap("s3", "do", ["BRAKE BEFORE THE PAINT,", "ON THE DARK ROAD"], GREEN, { y: 0.3 });
cap("s4", "on", ["ON THE STRIPES: STRAIGHT", "AND LIGHT ON THE BRAKES"], GREEN);
cap("s5", "roll", ["ROLL OVER THE PAINT,", "THEN BRAKE AGAIN"], GREEN);
cap("s6", "same", ["SAME FOR ARROWS,", "WORDS AND LINES"], GREEN);
endCard(["WET PAINT IS ICE.", "BRAKE BEFORE IT."]);

const fol = (fn) => (t) => pathState(fn, t);
const cam = (s, o, y, ls, lo, ly, f) => { const [x, z] = P(s, o), [lx, lz] = P(ls, lo); return [x, y, z, lx, ly, lz, f]; };
const SH = [
  { at: 0, f: fol(aPath), noRot: true, K: [[0, [-1.4, 2.6, 6.5, 1.0, 0.6, -14, 50]], [2.5, [-1.6, 2.9, 6.2, 1.0, 0.4, -12, 50]]] },
  { at: T2, K: [[0, cam(ZA + 15, -2.6, 3.2, ZA + 2, 1.4, 0.6, 50)], [3.0, cam(ZA + 15.5, -2.8, 3.4, ZA + 5, 1.8, 0.4, 50)]] },
  { at: T3, f: fol(bPath), noRot: true, K: [[0, [-2.2, 6.0, 7.5, 1.0, 0, -12, 50]], [2.2, [-2.2, 6.0, 7.0, 1.0, 0, -10, 50]]] },
  { at: T4, f: fol(bPath), noRot: true, K: [[0, [-2.2, 3.4, 7.0, 0.4, 0.5, -6, 50]], [2.4, [-2.4, 3.6, 7.2, 0.4, 0.5, -6, 50]]] },
  { at: T5, f: fol(bPath), noRot: true, K: [[0, [-2.0, 3.2, 7.5, 0.6, 0.4, -8, 50]], [2.5, [-2.0, 3.2, 7.0, 0.6, 0.4, -8, 50]]] },
  { at: T6, f: fol(bPath), noRot: true, K: [[0, [-3, 8, 6, 0.8, 0, -16, 48]], [2.0, [-3, 8.5, 6, 0.8, 0, -16, 48]]] },
  { at: T7, f: fol(bPath), noRot: true, K: [[0, [-5, 12, 10, 0.8, 0, -6, 46]], [4, [-6, 16, 13, 0.8, 0, -8, 46]]] },
];

const on = (t, a, b = 1e9) => sm(a - 0.1, a + 0.2, t) * (1 - sm(b - 0.15, b, t));
run("w", (t) => {
  const A = t < T3;
  let st;
  if (A) {
    const k = kD(t);
    st = ride(Bk, aPath, t, t < T2 ? VIOLET : RED, k > 0 ? { lean: downLean(k, 1), down: k } : {});
    if (t > tDown) { const u = t - tDown, [px, pz] = P(aS(t) + 1.2 + 1.6 * sm(0, 0.9, u), OL + 1.4 * sm(0, 0.9, u)); pose(THROWN, { x: px, z: pz, h: -0.6, lie: sm(0, 0.35, u), armR: 2.4, armL: 1.8, hex: RED }); } else pose(THROWN, { vis: false });
    strip(skid, sL, Math.max(sL + 0.1, aS(t)), OL + 0.45 * kD(t), t > tLock ? 1 : 0);
  } else {
    pose(THROWN, { vis: false }); skid.set(0);
    st = ride(Bk, bPath, t, GREEN, { trail: true });
  }
  warnA.set(A ? on(t, g("s1", "never")) * 0.8 : 0);
  const [zx, zz] = P(ZA + ZD / 2, -1.8);
  tagAt(tPaint, zx, 1.6, zz, A ? on(t, g("s1", "crossing"), g("s1", "never")) : 0, 2.2);
  tagAt(tNo, zx, 1.6, zz, A ? on(t, g("s1", "never"), T2) : 0, 2.2);
  tagAt(tLockT, st.x - 0.4, 0.9, st.z + 2.0, A ? on(t, tLock, tDown) : 0, 1.1);
  // B overlays
  const b0 = sB(tBr - 0.1), b1 = Math.min(ZB - 0.6, sB(Math.min(t, tDark + 0.2)));
  strip(brZ, b0, b1, OL, A ? 0 : on(t, tBr, T4) * 0.9);
  tagAt(tBrH, ...P(sB(t) + 4, OL - 1.2).flatMap((v, i) => (i ? [1.3, v] : [v])), A ? 0 : on(t, tBr, T4), 1.1);
  line.set(A ? 0 : on(t, g("s4", "straight"), T5) * 0.9);
  tagAt(tStr, st.x, 0.9, st.z - 4.5, A ? 0 : on(t, g("s4", "straight"), T5), 1.0);
  tagAt(tLight, st.x, 2.7, st.z, A ? 0 : on(t, g("s4", "brakes"), T5), 1.0);
  const c0 = ZB + ZD + 0.5, c1 = Math.max(c0 + 0.1, sB(Math.min(t, tFar + 0.3)));
  strip(brZ2, c0, c1, OL, A ? 0 : on(t, tBr2, T6) * 0.9);
  tagAt(tAgain, st.x - 0.3, 2.3, st.z, A ? 0 : on(t, tBr2, T6), 1.1);
  const lbl = (m, s, w, b) => { const [x, z] = P(s, OL - 1.9); tagAt(m, x, 1.2, z, A ? 0 : on(t, g("s6", w), b), 1.1); };
  lbl(tArr, sAr + 1.5, "arrows", T7); lbl(tWord, sWd, "words", T7); lbl(tLine, sLn, "lines", T7);
  setRain(t);
  const shot = shoot(SH, t);
  bloom.strength = 1.0 + 1.2 * shot.punch * shot.punch + overlays(t) + (A ? 0.8 * flash(t, tDown) : 0);
});
