// 157 rewind: a crash at a side street, rewound 1, 3, 5 and 8 seconds, then played forward the right way.
// Everything is a function of story time tau (0 = impact); video time maps to tau, so a rewind is a fast backward scrub.
import { THREE, S, g, sm, scene, bloom, glow, patch, beam, box, wheel, mAsph, mFrame, makeCar, RED, GREEN, WHITE, VIOLET, mSolid, shoot, run } from "./kit.js";
import { track, ribbon, title, endCard, cap, boom, overlays, bikes, ride, dist, END, makePerson, pose, downLean } from "./extra.js";

const T2 = S.s2[0], T3 = S.s3[0], T4 = S.s4[0], T5 = S.s5[0], T6 = S.s6[0], T7 = S.s7[0], T8 = S.s8[0], TE = END("s8");
const lin = (K, t) => { if (t <= K[0][0]) return K[0][1]; for (let i = 1; i < K.length; i++) if (t <= K[i][0]) return K[i - 1][1] + ((K[i][1] - K[i - 1][1]) * (t - K[i - 1][0])) / (K[i][0] - K[i - 1][0]); return K.at(-1)[1]; };
const tRew = g("s1", "rewind"), tHit = g("s2", "late") + 0.15;
const KB = [[0, 2.2], [tRew, 2.6], [tRew + 0.3, 0], [T2, -1.9], [tHit, 0], [T3, 0.6], [T3 + 0.45, -3.6], [T4, -2.0], [T4 + 0.4, -5.3], [T5, -4.0], [T5 + 0.4, -8.6], [T6, -6.5]];
const KG = [[T6, -8.2], [T7, 1.3], [T8, 2.3], [TE, 5.5]];
boom("s2", "late", 0.8);

// ---- three lanes north (-z); side street joins from the right at s = J; a green light further on ----
const J = 100, G = J + 30, XR = 1.1, XV = 3.3, ZC = -J - 1.6, SHIT = J - 0.6;
const { P } = track([{ len: 900 }]);
ribbon(P, -6, 6, -90, 400, mAsph);
ribbon(P, -5.45, -5.35, -90, 400, mFrame, 0.02, 0.5);
ribbon(P, 5.35, 5.45, -90, J - 4.2, mFrame, 0.02, 0.5); ribbon(P, 5.35, 5.45, J + 4.2, 400, mFrame, 0.02, 0.5);
ribbon(P, -1.85, -1.75, -90, 400, mFrame, 0.014, 0.5);
for (let s = -90; s < 400; s += 4) ribbon(P, 1.74, 1.86, s, s + 1.6, glow(VIOLET, 1.1), 0.012, 0.4);
for (let s = -80, i = 0; s < 400; s += 20, i++) { const sd = i % 2 ? -1 : 1; if (sd > 0 && Math.abs(s - J) < 8) continue; scene.add(box(0.1, 4, 0.1, sd * 7.2, 2, -s, mFrame, false), box(0.12, 0.08, 0.12, sd * 6.8, 4, -s, glow(VIOLET, 2.0), false)); }
const P2 = (s, o) => [5.4 + s, -J + o];
ribbon(P2, -3.7, 3.7, 0, 75, mAsph);
for (const sd of [-1, 1]) ribbon(P2, sd * 3.6 - 0.04, sd * 3.6 + 0.04, 0.5, 75, mFrame, 0.02, 0.5);
for (let s = 5; s < 75; s += 4) ribbon(P2, -0.06, 0.06, s, s + 1.6, glow(VIOLET, 1.1), 0.012, 0.4);
scene.add(box(0.25, 5.8, 0.25, -6.4, 2.9, -G, mFrame, false), box(0.25, 5.8, 0.25, 6.4, 2.9, -G, mFrame, false), box(13, 0.25, 0.25, 0, 5.8, -G, mFrame, false));
const mLamp = glow(GREEN, 3); mLamp.fog = false;
for (const x of [0, 3.6]) scene.add(box(1.6, 1.6, 0.3, x, 4.9, -G, mLamp, false));

// ---- the bad run: 11 m/s beside the van, rolls on at -5, brakes at -0.7, hits at 0 ----
const vb = (u) => (u < -5 ? 11 : u < -0.7 ? 11 + 2.5 * (u + 5) : u < 0 ? 21.75 - 8 * (u + 0.7) : 0);
const Db = dist(vb, -10, 0), sb = (u) => SHIT - Db(0) + Db(Math.min(u, 0));
const Dv = dist((u) => (u < 0.2 ? 11 : Math.max(0, 11 - 5 * (u - 0.2))), -10, 6), SV0 = sb(-8) + 2.75;
const svB = (u) => SV0 + Dv(u) - Dv(-8), svG = (u) => SV0 + 11 * (u + 8);
// ---- the good run: drops back, rolls off, covers the brake, slows as the car pulls out, rides on ----
const vg = (u) => 11 - 2 * sm(-6.3, -5.3, u) - sm(-4.6, -3.8, u) - 3 * sm(-1.9, -0.4, u) + 5 * sm(0.6, 2.6, u);
const Dg = dist(vg, -8.2, 6), sg = (u) => sb(-8.2) + Dg(u), xg = (u) => XR - 0.9 * sm(-6.2, -4.6, u);
// ---- the car: comes down the side street, waits, pulls out at -2. Bad: stops across his lane. Good: turns left and leaves ----
const carSt = (u, good) => {
  const ap = u < -3.2 ? (u + 3.2) ** 2 : 0, D = u < -2 ? 0 : !good ? 7.2 * sm(-2, 0, u) : u < 0 ? 7.2 * ((u + 2) / 2) ** 2 : 7.2 + 7.2 * u, a = (D - 7.2) / 4.6;
  if (D <= 7.2) return { x: 8.2 + ap - D, z: ZC, h: Math.PI / 2 };
  if (a < Math.PI / 2) return { x: 1.0 - 4.6 * Math.sin(a), z: ZC + 4.6 - 4.6 * Math.cos(a), h: Math.PI / 2 + a };
  return { x: -3.6, z: ZC + 4.6 + (D - 7.2 - 2.3 * Math.PI), h: Math.PI };
};
const now = (t) => { const good = t >= T6, u = lin(good ? KG : KB, t); return { good, u, x: good ? xg(u) : XR, z: -(good ? sg(u) : sb(u)), zv: -(good ? svG(u) : svB(u)) }; };

// ---- props ----
const car = makeCar({ driver: true });
const van = new THREE.Group(), mVan = new THREE.MeshStandardMaterial({ color: 0x3d349e, emissive: 0x1d184c, roughness: 0.5, metalness: 0.3 }), vw = [];
van.add(box(2.2, 2.1, 7.5, 0, 1.35, 0, mVan), box(1.9, 0.7, 0.04, 0, 1.8, -3.77, glow(VIOLET, 0.9), false), box(0.4, 0.14, 0.04, -0.8, 0.8, 3.77, glow(RED, 2.6), false), box(0.4, 0.14, 0.04, 0.8, 0.8, 3.77, glow(RED, 2.6), false));
for (const [x, z] of [[-1.05, -2.5], [1.05, -2.5], [-1.05, 2.5], [1.05, 2.5]]) { const w = wheel(0.1); w.position.set(x, 0.355, z); van.add(w); vw.push(w); }
scene.add(van);
const [Br, Bg] = bikes(2);
const suit = (B, hex) => { const m = mSolid.clone(); m.color.set(hex); m.emissive.set(hex).multiplyScalar(0.4); B.rider.traverse((o) => { if (o.material === mSolid) o.material = m; }); B.visor.material = glow(hex, 2.4); };
suit(Br, RED); suit(Bg, GREEN);
const hR = box(0.14, 0.11, 0.14, 0.39, 1.09, -0.5, glow(RED, 3), false), hG = box(0.14, 0.11, 0.14, 0.39, 1.09, -0.5, glow(GREEN, 3), false); Br.lean.add(hR); Bg.lean.add(hG);
const faller = makePerson();
for (const m of Object.values(faller.mats)) { m.color.set(RED); m.emissive.set(RED).multiplyScalar(0.4); }
faller.visor.material = glow(RED, 2.4);
const hitP = patch(3.2, 3.2, RED, 1.6); hitP.position.set(XR, 0.03, -SHIT);
const sight = beam(RED, 2.5, 0.09), gaze = beam(WHITE, 2.2, 0.06);
const V3 = (x, y, z) => new THREE.Vector3(x, y, z);

title("THE CRASH STARTED TEN SECONDS AGO");
cap("s1", "crash", ["CRASH:", "1 SECOND"], RED, { until: ["s1", "mistake"] });
cap("s1", "mistake", ["MISTAKE:", "10 SECONDS"], RED, { until: ["s1", "rewind"] });
cap("s1", "rewind", ["<< REWIND"], WHITE);
cap("s2", "one", ["1 SECOND", "BEFORE"], WHITE, { until: ["s2", "car"] });
cap("s2", "car", ["A CAR", "PULLS OUT"], RED, { until: ["s2", "brakes"] });
cap("s2", "brakes", ["BRAKES HARD"], RED, { until: ["s2", "too"] });
cap("s2", "too", ["TOO LATE"], RED);
cap("s3", "three", ["3 SECONDS", "BEFORE"], WHITE, { until: ["s3", "sees"] });
cap("s3", "sees", ["HE SEES", "THE CAR"], WHITE, { until: ["s3", "decides"] });
cap("s3", "decides", ["HE ASSUMES", "HE'S SEEN"], RED);
cap("s4", "five", ["5 SECONDS", "BEFORE"], WHITE, { until: ["s4", "rolls"] });
cap("s4", "rolls", ["ROLLS ON", "FOR THE GREEN"], RED);
cap("s5", "eight", ["8 SECONDS", "BEFORE"], WHITE, { until: ["s5", "riding"] });
cap("s5", "riding", ["BESIDE", "A VAN"], WHITE, { until: ["s5", "from"] });
cap("s5", "from", ["THE DRIVER'S", "VIEW"], WHITE, { until: ["s5", "hides"] });
cap("s5", "hides", ["THE VAN", "HIDES HIM"], RED);
cap("s6", "now", ["PLAY IT", "FORWARD >>"], GREEN, { until: ["s6", "drops"] });
cap("s6", "drops", ["DROPS BACK"], GREEN, { until: ["s6", "rolls"] });
cap("s6", "rolls", ["ROLLS OFF"], GREEN, { until: ["s6", "covers"] });
cap("s6", "covers", ["COVERS", "THE BRAKE"], GREEN, { until: ["s6", "car"] });
cap("s6", "car", ["THE CAR", "PULLS OUT"], WHITE, { until: ["s6", "already"] });
cap("s6", "already", ["ALREADY", "SLOWING"], GREEN);
endCard(["CRASHES START EARLY.", "SO DOES THE SAVE."]);

// ---- shots (world coords, off the rider's position) ----
const eyeOf = (cs) => [cs.x + 0.4, ZC + 0.4];
const c = (at, f, fog = 0.03) => ({ at, fog, f: null, cam: (t, su) => f(now(t), su) });
const behindCar = (n, back, y, k, fov, ly = 0) => { const [ex, ez] = eyeOf(carSt(n.u, false)), dx = ex - n.x, dz = ez - n.z, L = Math.hypot(dx, dz); return [ex + (dx / L) * back, y, ez + (dz / L) * back, ex - dx * k, ly, ez - dz * k, fov]; };
const w = (id, word) => g(id, word) - 0.1;
const SH = [
  c(0, (n, su) => [XR + 5.5 - 0.5 * su, 1.7 + 0.15 * su, -SHIT + 5.5 - 0.4 * su, XR - 0.3, 0.9, -SHIT - 0.6, 50]), // the aftermath
  c(w("s1", "crash"), (n, su) => [XR + 0.3, 15 - 0.6 * su, -SHIT + 7, XR, 0, -SHIT - 0.5, 50]),
  c(w("s1", "mistake"), (n, su) => [XR - 3 + 0.3 * su, 5.5, -(SHIT + 10), XR + 0.5, 0.5, -(SHIT - 22), 50]), // down the road he came from: the rewind
  c(T2, (n, su) => [n.x + 0.9 - 0.15 * su, 2.6, n.z + 6.5 - 0.5 * su, n.x + 0.4, 1.0, n.z - 10, 50]),
  c(w("s2", "brakes"), (n, su) => [XR - 2.4 + 0.3 * su, 5.5 + 0.25 * su, n.z + 8.5 - 0.3 * su, XR, 0.4, n.z + 0.24 * (ZC - n.z) - 1, 50]),
  c(T3, (n, su) => [n.x - 3, 4, n.z - 9 + 0.3 * su, n.x + 1, 0.8, n.z + 3, 50]), // rewind to three seconds, from ahead of him
  c(w("s3", "sees"), (n, su) => [n.x - 2, 2.6, n.z + 9 - 0.4 * su, n.x + 0.55 * (8.2 - n.x), 1.2, n.z + 0.55 * (ZC - n.z), 30], 0.008), // his look at the car, long lens
  c(w("s3", "decides"), (n, su) => behindCar(n, 14 - 0.6 * su, 2.6, 1, 22, 3), 0.008), // over the waiting car, at him
  c(T4, (n, su) => [n.x - 0.5 + 0.1 * su, 1.5, n.z - 3.8 + 0.2 * su, n.x + 0.2, 1.7, n.z, 44]), // the throttle hand
  c(w("s4", "make"), (n, su) => [n.x - 0.4, 3.2, n.z + 13 - 0.5 * su, n.x + 0.6, 4.9, -G, 20], 0.006), // long lens to the green light
  c(T5, (n, su) => [n.x - 2.4, 3.6, n.z + 7.5 - 0.3 * su, n.x + 1.3, 1.0, n.z - 4, 50]),
  c(w("s5", "from"), (n, su) => behindCar(n, 24 - su, 3.5, 1, 12, 3.5), 0.005), // over the car, down its sight line
  c(w("s5", "hides"), (n, su) => [n.x - 3.2 + 0.2 * su, 5 + 0.2 * su, n.z + 8, n.x + 2.5, 0.5, n.z - 12, 50]),
  c(T6, (n, su) => [n.x - 2.2, 5.5, n.z + 9 - 0.3 * su, n.x + 1, 0.5, n.z - 8, 50]),
  c(w("s6", "drops"), (n, su) => { const m = (n.z + n.zv + 3.75) / 2; return [-8.5, 2.4, m, 2, 1, m, 58]; }), // from the side: the gap to the van opens
  c(w("s6", "covers"), (n, su) => [n.x + 4.2 - 0.4 * su, 1.4, n.z + 0.9, n.x, 1.5, n.z + 0.2, 44]), // the brake hand
  c(w("s6", "car"), (n, su) => [-2.5, 7, n.z + 22 - 0.6 * su, 2, 0.5, n.z + 0.6 * (ZC - n.z), 26], 0.008),
  c(T7, (n, su) => [n.x - 5.5 + 1.6 * su, 3.4 + 0.4 * su, n.z + 10 - 0.8 * su, n.x, 0.2, n.z - 4, 50], 0.012),
  c(T8 - 0.05, (n, su) => [n.x - 2 + 0.75 * su, 6.5 + 0.2 * su, n.z + 6 + 0.2 * su, n.x, 0, n.z + 2.5 + 0.1 * su, 50]),
];

const fB = (t) => [XR, now(t).z, 0], fG = (t) => { const n = now(t); return [n.x, n.z, 0]; };
run("w", (t) => {
  const n = now(t), { good, u } = n, cs = carSt(u, good);
  car.set(cs);
  van.position.set(XV, 0, n.zv); vw.forEach((o) => (o.rotation.x = n.zv / 0.355));
  const k = good ? 0 : sm(0, 0.45, u);
  ride(Br, good ? null : fB, t, RED, { lean: downLean(k, -1), down: k, trail: false });
  ride(Bg, good ? fG : null, t, GREEN, { trail: false });
  Br.lean.rotation.x = !good && u > -0.7 && u < 0 ? -0.08 * sm(-0.7, -0.5, u) : 0;
  Bg.lean.rotation.x = good ? -0.04 * sm(-1.9, -1.4, u) * (1 - sm(-0.4, 0.2, u)) : 0;
  hR.visible = t >= g("s4", "rolls") && t < T5; hG.visible = t >= w("s6", "covers") && t < T7;
  pose(faller, { x: XR + 1.3, z: -SHIT + 0.3, h: 0.5, lie: 1, vis: !good && u > 0.22, hex: RED });
  hitP.set(good ? 0.5 * sm(-1.9, -1.2, u) * (1 - sm(1.2, 2, u)) : 0.9 * sm(0, 0.25, u));
  // s3: his look at the car
  const [ex, ez] = eyeOf(cs), E = V3(ex, 1.25, ez), H = V3(n.x, 1.5, n.z - 0.3);
  gaze.set(H, E, (t < w("s3", "decides") ? 0.9 : 0.45) * sm(w("s3", "sees"), w("s3", "sees") + 0.3, t) * (1 - sm(T4 - 0.2, T4, t)));
  // s5: the driver's sight line to him, cut where it meets the van (slab test on the van's footprint)
  let f = 1;
  { const dx = n.x - ex, dz = n.z - ez, a = [(XV - 1.1 - ex) / dx, (XV + 1.1 - ex) / dx], b = [(n.zv - 3.75 - ez) / dz, (n.zv + 3.75 - ez) / dz], lo = Math.max(Math.min(...a), Math.min(...b)), hi = Math.min(Math.max(...a), Math.max(...b)); if (lo < hi && lo > 0 && lo < 1) f = lo; }
  sight.set(E, V3(ex + f * (n.x - ex), 1.25 + f * 0.1, ez + f * (n.z - ez)), 0.9 * sm(w("s5", "from"), w("s5", "from") + 0.3, t) * (t < T6 ? 1 : 0));
  const shot = shoot(SH, t);
  scene.fog.density = shot.shot.fog;
  bloom.strength = 0.8 + 1.2 * shot.punch * shot.punch + overlays(t);
});
