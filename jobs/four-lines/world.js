// 159 four-lines: one blind right-hander, four lines through it at the same speed. Early turn-in runs wide into the truck; late turn-in sees more and exits tight.
import { THREE, S, g, sm, clamp, scene, bloom, glow, beam, box, mSolid, makeTruck, hdg, VIOLET, ORANGE, RED, GREEN, WHITE, shoot, run } from "./kit.js";
import { track, ribbon, buildRoad, title, endCard, cap, overlays, bikes, ride, END } from "./extra.js";

const T2 = S.s2[0], T4 = S.s4[0], T5 = S.s5[0], T6 = S.s6[0], T7 = S.s7[0], T8 = S.s8[0], TE = END("s8");
const R = 24, a = 60, LC = (R * Math.PI) / 2, b = a + LC, V = 8; // corner from s=a to s=b; own lane is o 0..3.6, oncoming o<0
const { C, P } = track([{ len: a }, { len: LC, R: -R }, { len: 300 }]);
buildRoad(P, -30, b + 120, { lamps: false });
// the bank on the inside that makes it blind
for (let s = a + 1; s < b - 3; s += 2) { const [x, z] = P(s, 4.9), w = box(1.4, 3.2, 2.6, x, 1.6, z, mSolid, true); w.rotation.y = C(s)[2]; scene.add(w); }
for (let k = 0; k < 40; k++) { const [x, z] = P(a + 25 + ((k * 0.618) % 1) * 8, 3.0 + ((k * 0.381) % 1) * 0.9); scene.add(box(0.12, 0.06, 0.12, x, 0.03, z, glow(ORANGE, 1.2), false)); }

// ---- the four lines: lateral offset along the corner ----
const LINE = [
  (s) => 1.2 + 1.8 * sm(a - 6, a + 7, s) - 3.55 * sm(a + 13, b + 2, s) + 1.6 * sm(b + 8, b + 14, s), // early in, wide out, over the line
  () => 1.8,
  (s) => 1.8 + 1.5 * sm(a - 14, a - 2, s),
  (s) => 0.8 + 1.9 * sm(a + 22, a + 34, s) - 0.5 * sm(a + 36, b + 6, s), // wide, late in, tight out
];
const HEX = [RED, VIOLET, ORANGE, GREEN];
const tIn1 = g("s2", "early"), tIn4 = g("s6", "turns"), tM1 = tIn1 + (b + 13 - a) / V, tM4 = tIn4 + (b + 3 - a - 22) / V;
const OWN = [(t) => a - 6 + V * (t - tIn1), (t) => a + 2 + V * (t - T4), (t) => a - 3 + V * (t - T5), (t) => a + 22 + V * (t - tIn4)];
const WIN = [[T2, T4], [T4, T5], [T5, T6], [T6, T7]];
const ph = (t) => (t < T2 ? 0 : t >= T7 ? 2 : 1);
const sOf = (i, p, u) => (p === 0 ? 14 + V * u - 7 * i : p === 2 ? a - 10 + V * (u - T7) : OWN[i](u));
const tGr = g("s5", "gravel");
const oOf = (i, p, s, u) => (p === 0 ? 1.8 : LINE[i](s) + (i === 2 && p === 1 ? 0.06 * Math.sin(20 * u) * sm(a + 25, a + 27, s) : 0));
const Bs = bikes(4);
const suit = Bs.map((B) => {
  const m = mSolid.clone(); B.rider.traverse((o) => { if (o.material === mSolid) o.material = m; });
  return (hex) => { if (hex === VIOLET) { m.color.set(0x3a33a0); m.emissive.set(0x1f1a5e); } else { m.color.set(hex); m.emissive.set(hex).multiplyScalar(0.4); } };
});
// painted traces of the lines
const S0 = a - 20, S1 = b + 20, NSEG = Math.floor((S1 - S0) / 0.5);
const traces = LINE.map((f, i) => ribbon((s, d) => P(s, f(s) + d), -0.22, 0.22, S0, S1, glow(HEX[i], 1.8), 0.03, 0.5));
const tEach = g("s1", "each");
// how far ahead he can see: the sight line that just clears the bank
const RW = R - 4.2, sightLen = (o) => R * (Math.acos(RW / (R - o)) + Math.acos(RW / (R - 1.8)));
const sight = [RED, ORANGE, RED, GREEN].map((h) => beam(h, 2.4, 0.14));
const tBut = g("s2", "but");
const truck = makeTruck();
const dots = HEX.map((h) => { const d = box(1.3, 0.1, 1.3, 0, 3, 0, glow(h, 2.2), false); scene.add(d); return d; }); // seen from the map only
const V3 = (x, y, z) => new THREE.Vector3(x, y, z);

title("ONE CORNER. FOUR LINES.");
cap("s2", "rider", ["RIDER 1", "TURNS IN EARLY"], WHITE, { until: ["s2", "but"] });
cap("s2", "but", ["RUNS WIDE", "AT THE EXIT"], RED);
cap("s3", "he", ["OVER THE", "CENTER LINE"], RED, { until: ["s3", "truck"] });
cap("s3", "truck", ["TRUCK"], RED, { boom: 0.6 });
cap("s4", "rider", ["RIDER 2", "MID LANE"], WHITE, { until: ["s4", "but"] });
cap("s4", "but", ["SEES THE", "EXIT LATE"], ORANGE);
cap("s5", "rider", ["RIDER 3", "INSIDE EDGE"], WHITE, { until: ["s5", "more"] });
cap("s5", "more", ["MORE LEAN", "LESS VIEW"], RED, { until: ["s5", "gravel"] });
cap("s5", "gravel", ["GRAVEL"], RED, { boom: 0.4 });
cap("s6", "rider", ["RIDER 4", "STAYS WIDE"], GREEN, { until: ["s6", "sees"] });
cap("s6", "sees", ["SEES THROUGH", "THE CORNER"], GREEN, { until: ["s6", "then"] });
cap("s6", "then", ["TURNS IN", "LATE"], GREEN, { until: ["s6", "with"] });
cap("s6", "with", ["ROOM", "TO SPARE"], GREEN);
endCard(["TURN IN LATE.", "SEE MORE."]);

// ---- shots ----
const fR = (i) => (t) => { const p = ph(t), s = sOf(i, p, t), [x, z] = P(s, oOf(i, p, s, t)); return { x, z, h: C(s)[2] }; };
const fM = () => ({ x: 12, z: -76, h: 0 }), fI = (t) => { const s = 4 + V * t, [x, z] = P(s, 1.8); return { x, z, h: 0 }; };
const sh = (at, to, f, A, B) => ({ at, f, K: [[0, A], [to - at, B]] });
const map = (at, to, h0 = 64, h1 = 58, dx = 0) => sh(at, to, fM, [dx, h0, 5, dx, 0, 0, 50], [-dx, h1, 4, -dx, 0, 0, 50]);
const tFeel = g("s2", "but") - 0.1, tLate2 = g("s4", "but") - 0.1, tMore = g("s5", "more") - 0.1, tGrv = tGr - 0.1, tSees = g("s6", "sees") - 0.1, tThen = g("s6", "then") - 0.1, tRoom = g("s6", "with") - 0.25;
const SH = [
  sh(0, tEach - 0.1, fI, [4, 5, 17, 0, 1, -20, 50], [3, 4.4, 15, 0, 1, -20, 50]), // four in file, the blind corner ahead
  map(tEach - 0.1, T2, 68, 60, 1),
  sh(T2, tFeel, fR(0), [1.6, 3, 8, 0.4, 1, -10, 50], [1.2, 2.6, 7, 0.4, 1, -10, 50]),
  map(tFeel, S.s3[0], 62, 56, -1),
  sh(S.s3[0], T4, fR(0), [1.2, 2.4, 7.5, -1.5, 1.3, -12, 54], [0.8, 2.1, 6, -1.5, 1.3, -12, 54]), // the truck comes round the bank
  sh(T4, tLate2, fR(1), [-3, 2.6, 6.5, 2.8, 1, -6, 50], [-2.6, 2.3, 5.5, 2.8, 1, -6, 50]),
  map(tLate2, T5, 60, 55, 1),
  sh(T5, tMore, fR(2), [-1.5, 2.6, 7.5, 1.6, 1, -8, 50], [-1.2, 2.3, 6.5, 1.6, 1, -8, 50]),
  map(tMore, tGrv, 58, 54, -1),
  sh(tGrv, T6, fR(2), [-2.4, 1.8, 8, 0.8, 0.6, -3, 50], [-2.1, 1.6, 7, 0.8, 0.6, -3, 50]),
  sh(T6, tSees, fR(3), [2.6, 3, 8, -0.5, 1, -10, 50], [2.2, 2.7, 7, -0.5, 1, -10, 50]),
  map(tSees, tThen, 62, 56, 1),
  sh(tThen, tRoom, fR(3), [-1, 3.6, 9, 0.5, 1, -10, 50], [-0.6, 3.2, 8, 0.5, 1, -10, 50]),
  sh(tRoom, T7, fR(3), [1, 5.5, 10, -1.2, 1, -6, 50], [0.8, 4.8, 8.5, -1.2, 1, -6, 50]), // truck goes by, room to spare
  map(T7, T8, 66, 61, -1),
  sh(T8, TE, fM, [1, 82, -21, 1, 0, -26, 50], [-1, 76, -21, -1, 0, -26, 50]), // the corner sits under the CTA text
];

run("w", (t) => {
  const p = ph(t), isMap = SH.findLast((q) => q.at <= t)?.f === fM;
  scene.fog.density = isMap ? 0.003 : 0.03; // the map looks down from 60 m, the fog would black it out
  Bs.forEach((B, i) => {
    const on = p !== 1 || (t >= WIN[i][0] && t < WIN[i][1]);
    const s = sOf(i, p, t), o = oOf(i, p, s, t);
    const hex = p === 0 ? VIOLET : i === 0 && p === 1 && t < tBut ? VIOLET : HEX[i];
    suit[i](hex);
    { const [dx, dz] = P(s, o); dots[i].position.set(dx, 3, dz); dots[i].visible = isMap && on; dots[i].material.color.set(hex).multiplyScalar(2.2); }
    ride(B, on ? (u) => { const q = sOf(i, p, u); return P(q, oOf(i, p, q, u)); } : null, t, hex, i === 2 && p ? { lean: -0.12 * sm(a - 4, a + 4, s) * (1 - sm(b - 4, b + 4, s)) } : {});
    // trace: drawn in on the map, painted behind him in his own scene, all four at the end
    const fr = p === 0 ? sm(tEach + 0.3 * i, tEach + 0.3 * i + 0.9, t) : p === 2 ? 1 : on ? clamp((s - S0) / (S1 - S0), 0, 1) : 0;
    traces[i].geometry.setDrawRange(0, Math.floor(fr * NSEG) * 6);
    // sight line through the corner
    const aS = on && p === 1 && (i > 0 || t >= tBut) ? sm(a - 4, a + 2, s) * (1 - sm(b - 12, b - 6, s)) : 0;
    const [x, z] = P(s, o), [ex, ez] = P(s + sightLen(Math.max(0, o)), 1.8);
    sight[i].set(V3(x, 1.4, z), V3(ex, 0.25, ez), 0.9 * aS);
  });
  // the oncoming truck: on the map, for rider one, and for rider four
  const sT = t < T2 ? (t > g("s1", "one", 3) - 0.4 ? b + 24 - 10 * (t - g("s1", "one", 3) + 0.4) : null) : t < T4 ? b + 7 + V * (tM1 - t) : t >= T6 && t < T7 ? b + 3 + V * (tM4 - t) : null;
  if (sT == null) truck.set(null);
  else { const [x, z] = P(sT, -2.3), [rx, rz] = P(sT + 10, -2.3); truck.set({ x, z, h: hdg(x - rx, z - rz) }); }
  const shot = shoot(SH, t);
  bloom.strength = 0.8 + 1.2 * shot.punch * shot.punch + overlays(t);
});
