// 156 truck-mirrors: six bikes around one truck, the driver sees two. Green = what his mirrors and windshield cover, red = the four blind spots.
import { THREE, S, g, sm, scene, bloom, glow, patch, beam, box, mAsph, mFrame, makeTruck, VIOLET, RED, GREEN, WHITE, mSolid, shoot, run } from "./kit.js";
import { track, ribbon, title, endCard, cap, overlays, bikes, ride, tag, tagAt, END } from "./extra.js";

const T2 = S.s2[0], T3 = S.s3[0], T4 = S.s4[0], T5 = S.s5[0], T6 = S.s6[0], T7 = S.s7[0], T8 = S.s8[0], TE = END("s8");

// ---- three lanes north (-z), the truck in the middle one ----
const { P } = track([{ len: 900 }]);
ribbon(P, -6, 6, -80, 700, mAsph);
for (const sd of [-1, 1]) ribbon(P, sd * 5.4 - 0.05, sd * 5.4 + 0.05, -80, 700, mFrame, 0.02, 0.5);
for (const o of [-1.8, 1.8]) for (let s = -80; s < 700; s += 4) ribbon(P, o - 0.06, o + 0.06, s, s + 1.6, glow(VIOLET, 1.1), 0.012, 0.4);
for (let s = -80, i = 0; s < 700; s += 20, i++) { const sd = i % 2 ? -1 : 1; scene.add(box(0.1, 4, 0.1, sd * 7.2, 2, -s, mFrame, false), box(0.12, 0.08, 0.12, sd * 6.8, 4, -s, glow(VIOLET, 2.0), false)); }

const truck = makeTruck(), zt = (t) => -(20 + 16 * t);
const fT = (t) => ({ x: 0, z: zt(t), h: 0 });

// ---- six bikes, offsets from the truck: [x, z] now -> [x, z] once they move to where he can see them (s8) ----
const O = [
  [[0, 18.5], [-3.6, 22]], // right behind the trailer
  [[3.3, 0.6], [3.6, 21]], // beside the cab, passenger side
  [[0.5, -3.1], [0.5, -15]], // under the front bumper
  [[-2.9, 2.2], [-3.6, 15.5]], // just behind his door
  [[-3.6, 10], [-3.6, 10]], // seen in the left mirror
  [[3.6, 15], [3.6, 15]], // seen in the right mirror
];
const k8 = (t) => sm(T8 - 0.2, T8 + 1.8, t);
const off = (i, t) => { const [a, b] = O[i], k = k8(t); return [a[0] + (b[0] - a[0]) * k, a[1] + (b[1] - a[1]) * k + (i === 2 ? 0.08 : 0.25) * Math.sin(1.3 * t + 2 * i)]; };
const fn = O.map((_, i) => (t) => { const o = off(i, t); return [o[0], zt(t) + o[1], 0]; });
const Bs = bikes(6);
const vR = glow(RED, 2.4), vG = glow(GREEN, 2.4);
const suit = Bs.map((B) => {
  const m = mSolid.clone(), v0 = B.visor.material;
  B.rider.traverse((o) => { if (o.material === mSolid) o.material = m; });
  return (hex) => { if (hex === VIOLET) { m.color.set(0x3a33a0); m.emissive.set(0x1f1a5e); B.visor.material = v0; } else { m.color.set(hex); m.emissive.set(hex).multiplyScalar(0.4); B.visor.material = hex === RED ? vR : vG; } };
});
const tGone = [g("s3", "gone"), g("s4", "gone"), g("s5", "gone"), g("s5", "gone", 2)], tSeen = g("s6", "two");

// zones on the road, relative to the truck: [x, z, w, d]
const Z = (hex, x, z, w, d) => { const p = patch(w, d, hex, 1.5); p.userData.o = [x, z]; return p; };
const zWin = Z(GREEN, 0, -28, 10.8, 40), zL = Z(GREEN, -3.45, 23, 3.9, 34), zR = Z(GREEN, 3.45, 25.5, 3.9, 29);
const zRed = [Z(RED, 0, 22, 2.9, 14), Z(RED, 3.45, 3.5, 3.9, 15), Z(RED, 0, -4.4, 2.9, 5.4), Z(RED, -3.0, 2, 3.0, 7.5)];
const tagsG = zRed.map(() => tag("GONE", RED, 2.0)), tagsS = [tag("SEEN", GREEN, 2.0), tag("SEEN", GREEN, 2.0)];
const sight = beam(RED, 2.5, 0.07), gB = [0, 1, 2, 3].map(() => beam(GREEN, 2.5, 0.07));
const V3 = (x, y, z) => new THREE.Vector3(x, y, z);

title("SIX BIKES. HE SEES TWO.");
cap("s2", "two", ["TWO MIRRORS"], GREEN, { until: ["s2", "one"] });
cap("s2", "one", ["ONE", "WINDSHIELD"], GREEN, { until: ["s2", "that"] });
cap("s2", "that", ["HIS WHOLE", "WORLD"], GREEN);
cap("s3", "the", ["BEHIND THE", "TRAILER"], WHITE, { until: ["s3", "gone"] });
cap("s3", "gone", ["GONE"], RED, { boom: 0.6 });
cap("s4", "bike", ["PASSENGER", "SIDE"], WHITE, { until: ["s4", "gone"] });
cap("s4", "gone", ["GONE"], RED, { until: ["s4", "that"], boom: 0.6 });
cap("s4", "that", ["WIDEST", "BLIND ZONE"], RED);
cap("s5", "bike", ["UNDER THE", "BUMPER"], WHITE, { until: ["s5", "gone"] });
cap("s5", "gone", ["GONE"], RED, { until: ["s5", "he"], boom: 0.6 });
cap("s5", "he", ["HE SITS", "TOO HIGH"], RED, { until: ["s5", "and"] });
cap("s5", "and", ["BEHIND", "HIS DOOR"], WHITE, { until: ["s5", "gone"], untilN: 2 });
cap("s5", "gone", ["GONE TOO"], RED, { n: 2, boom: 0.6 });
cap("s6", "two", ["THESE TWO", "HE SEES"], GREEN, { until: ["s6", "who"] });
cap("s6", "who", ["THEY SEE", "HIS MIRRORS"], GREEN);
endCard(["CAN'T SEE HIS MIRRORS?", "HE CAN'T SEE YOU."]);

// ---- shots: offsets from the truck ----
const tFrom = g("s1", "from") - 0.1, tThat2 = g("s2", "that") - 0.1, tThat4 = g("s4", "that") - 0.1, tHe = g("s5", "he") - 0.1, tAnd = g("s5", "and") - 0.1, tWho = g("s6", "who") - 0.1;
const sh = (at, dur, a, b) => ({ at, f: fT, K: [[0, a], [dur, b]] });
const SH = [
  sh(0, tFrom, [9, 10, 36, 0, 1.5, 6, 50], [7, 13, 38, 0, 1.2, 6, 50]), // all six around the truck
  sh(tFrom, T2 - tFrom, [-4.5, 3.6, -10, -0.3, 2.5, -1, 46], [-3.6, 3.4, -8.5, -0.3, 2.5, -1, 46]), // his seat
  sh(T2, tThat2 - T2, [1.2, 4.6, -10.5, 0, 2.6, -1, 46], [0.4, 4.2, -8.5, 0, 2.6, -1, 46]), // face on: the mirrors and the windshield
  sh(tThat2, T3 - tThat2, [2, 29, 40, 0, 0, 8, 50], [0, 32, 42, 0, 0, 8, 50]), // the map of what he sees
  sh(T3, T4 - T3, [2.8, 2.3, 25.5, 0, 1.7, 15, 50], [2.2, 2.1, 24.2, 0, 1.7, 15, 50]),
  sh(T4, tThat4 - T4, [9, 4.6, -7.5, 2.2, 1.4, 0.6, 50], [8, 4.2, -6.5, 2.2, 1.4, 0.6, 50]),
  sh(tThat4, T5 - tThat4, [5, 26, 15, 2.6, 0, 3, 50], [5.5, 30, 17, 2.6, 0, 3, 50]),
  sh(T5, tHe - T5, [-4.6, 2.1, -9, 0.3, 1.4, -2.6, 50], [-4.0, 2.0, -8.2, 0.3, 1.4, -2.6, 50]),
  sh(tHe, tAnd - tHe, [6.5, 2.6, -4.5, 0, 1.7, -2.6, 46], [6.0, 2.5, -4.2, 0, 1.7, -2.6, 46]), // side on: the sight line clears his helmet
  sh(tAnd, T6 - tAnd, [-8.5, 3.6, -4, -1.8, 1.6, 2, 50], [-7.6, 3.3, -3, -1.8, 1.6, 2, 50]),
  sh(T6, tWho - T6, [0, 30, 40, 0, 0, 8, 50], [0, 33, 42, 0, 0, 8, 50]),
  sh(tWho, T7 - tWho, [-5.0, 2.5, 15, -1.8, 2.5, -1, 44], [-4.7, 2.4, 13.5, -1.8, 2.5, -1, 44]), // over the green rider's shoulder, at the mirror
  sh(T7, T8 - T7, [3, 30, 42, 0, 0, 7, 50], [1, 33, 44, 0, 0, 7, 50]),
  sh(T8, TE - T8, [-2, 32, 44, 0, 0, 5, 50], [3, 38, 48, 0, 0, 5, 50]),
];

run("w", (t) => {
  const z0 = zt(t), k = k8(t), wide = t >= T7 ? 1 - sm(T8 - 0.3, T8, t) : t >= T6 && t < tWho ? 1 : 0; // world tags only in the wide shots
  truck.mirrors.forEach((m) => m.material.color.set(t >= g("s2", "two") && t < T3 ? GREEN : VIOLET).multiplyScalar(2.4));
  truck.set(fT(t));
  Bs.forEach((B, i) => {
    const gone = i < 4 && t >= tGone[i], seen = i >= 4 ? t >= tSeen : k > 0.75;
    const hex = seen ? GREEN : gone ? RED : VIOLET;
    suit[i](hex); ride(B, fn[i], t, hex);
    const [ox, oz] = off(i, t);
    if (i < 4) { tagAt(tagsG[i], ox, 2.6, z0 + oz, gone ? wide : 0, 1.5); zRed[i].set(gone ? 0.9 * sm(tGone[i], tGone[i] + 0.3, t) * (1 - k) : 0); }
    else tagAt(tagsS[i - 4], ox, 2.6, z0 + oz, t >= tSeen + 0.2 ? wide : 0, 1.5);
  });
  for (const p of [zWin, zL, zR, ...zRed]) p.position.set(p.userData.o[0], 0.03, z0 + p.userData.o[1]);
  // what he sees: on in s2, back for the two seen riders and the ending
  const on2 = 1 - sm(T3 - 0.25, T3, t), on6 = sm(T6, T6 + 0.3, t);
  const aM = sm(g("s2", "two") - 0.1, g("s2", "two") + 0.3, t) * on2 + on6, aW = sm(g("s2", "one") - 0.1, g("s2", "one") + 0.3, t) * on2 + on6;
  zL.set(0.8 * aM); zR.set(0.8 * aM); zWin.set(0.8 * aW);
  // too high: his eye line over the dash lands on the road beyond the bike
  const eye = V3(-0.6, 2.85, z0 - 0.3), aS = sm(tHe, tHe + 0.5, t) * (1 - sm(tAnd - 0.2, tAnd, t));
  sight.set(eye, V3(-0.6 + 1.1 * aS, 2.85 - 2.85 * aS, z0 - 0.3 - 6.9 * aS), aS > 0 ? 0.9 : 0);
  // eye -> mirror -> the two riders he can see
  const aG = sm(tSeen, tSeen + 0.4, t) * (1 - sm(T8 - 0.3, T8, t));
  [-1, 1].forEach((s, j) => {
    const mir = V3(s * 1.8, 2.6, z0 - 1.0), [ox, oz] = off(4 + j, t);
    gB[2 * j].set(eye, mir, 0.9 * aG); gB[2 * j + 1].set(mir, V3(ox, 1.45, z0 + oz), 0.9 * aG);
  });
  const shot = shoot(SH, t);
  bloom.strength = 0.8 + 1.2 * shot.punch * shot.punch + overlays(t);
});
