// 96 speed-bump: wrong (red): bike with a passenger hits a speed bump fast, the passenger is thrown up off the seat.
// Right (green): slow down early, brakes off before the bump, roll over straight at a steady speed, warn the passenger
// so they grip with their knees.
import { THREE, S, g, sm, pulse, scene, bloom, box, glow, VIOLET, ORANGE, RED, GREEN, pathState, shoot, sceneOf, run } from "./kit.js";
import { track, buildRoad, addPillion, title, endCard, cap, boom, overlays, tag, tagAt, bikes, ride, dist } from "./extra.js";

scene.fog.density = 0.012;
const { P } = track([{ len: 3000 }]);
buildRoad(P, -40, 700);
const [B] = bikes(1), Q = addPillion(B);
const O = 1.8, HALF = 0.68; // lane offset; wheel offset from bike centre

// speed bumps: orange/white striped hump across the lane
const mBumpA = glow(ORANGE, 1.6), mBumpB = glow(0xffffff, 0.9);
const bumpAt = (s) => { const [x, z] = P(s, 1.8); const G = new THREE.Group(); G.position.set(x, 0, z); scene.add(G);
  for (let i = 0; i < 8; i++) G.add(box(0.45, 0.1, 0.42, -1.58 + i * 0.45, 0.05, 0, i % 2 ? mBumpB : mBumpA, false)); return G; };
const hump = (d) => (Math.abs(d) < 0.35 ? 0.1 * Math.cos((d / 0.35) * Math.PI / 2) ** 2 : 0);

// ---- part A: too fast, rear wheel crosses the bump on "throws"
const TB = S.s3[0], V = 11, tHit = g("s2", "throws") - 0.05, sBA = 60;
const sA = (t) => sBA + HALF + V * (t - tHit);
const pathA = (t) => P(sA(t), O);
// ---- part B: slow down from "slow", brakes off by "reach", cross at "straight" at a steady 3.5 m/s, then a second bump in s5
const tSlow = g("s3", "slow"), tOff = g("s3", "reach"), tCross = g("s4", "straight"), VS = 3.5, V2 = 10;
const vB = (t) => V2 - (V2 - VS) * sm(tSlow - 0.2, tOff - 0.1, t);
const DB = dist(vB, TB, TB + 40), sB0 = 300;
const sB = (t) => sB0 + DB(t);
const sBB = sB(tCross) + HALF, tKnee = g("s5", "knees"), sBC = sB(tKnee + 0.3) + HALF; // front wheel on bump at "straight"; 2nd bump after "knees"
const pathB = (t) => P(sB(t), O);
const path = (t) => (t < TB ? pathA : pathB)(t);
const sNow = (t) => (t < TB ? sA(t) : sB(t));
bumpAt(sBA); bumpAt(sBB); bumpAt(sBC);
const bumps = [sBA, sBB, sBC];

const tUp = tag("THROWN UP", RED), tBr = tag("BRAKES OFF", GREEN), tSm = tag("SMOOTH FOR YOU", GREEN), tHard = tag("HARD HIT FOR THEM", RED);

title("NEVER HIT A SPEED BUMP FAST");
cap("s2", "rear", ["THEY SIT OVER", "THE REAR WHEEL"], RED, { until: ["s2", "bump"] });
cap("s2", "bump", ["A BUMP YOU", "BARELY FEEL"], RED, { until: ["s2", "throws"] });
cap("s2", "throws", ["THROWS THEM UP", "OFF THE SEAT"], RED);
boom("s2", "throws", 0.9);
cap("s3", "slow", ["SLOW RIGHT DOWN", "BEFORE THE BUMP"], GREEN, { until: ["s3", "come"] });
cap("s3", "come", ["BRAKES OFF", "BEFORE YOU REACH IT"], GREEN);
cap("s4", "roll", ["ROLL OVER IT", "STRAIGHT"], GREEN, { until: ["s4", "steady"] });
cap("s4", "steady", ["AT A STEADY SPEED"], GREEN);
cap("s5", "warn", ["WARN THEM", "AT THE FIRST ONE"], GREEN, { until: ["s5", "grip"] });
cap("s5", "grip", ["THEY GRIP", "WITH THEIR KNEES"], GREEN);
cap("s6", "smooth", ["SMOOTH FOR YOU"], GREEN, { until: ["s6", "hard"] });
cap("s6", "hard", ["HARD HIT FOR THEM"], RED);
endCard(["SLOW BEFORE THE BUMP.", "BRAKES OFF ON IT."]);

const fol = (t) => pathState(path, t);
const T4 = S.s4[0], T5 = S.s5[0], T6 = S.s6[0], T7 = S.s7[0];
const SH = [
  { at: 0, f: fol, K: [[0, [0.2, 1.9, 5.0, 0.5, 0.9, -6, 46]], [TB, [0.2, 2.0, 4.6, 0.5, 0.9, -6, 46]]] },
  { at: S.s2[0], f: fol, K: [[0, [5.6, 1.6, 1.6, 0, 0.9, 0.3, 46]], [TB - S.s2[0], [5.8, 1.7, 1.4, 0, 0.9, 0.3, 46]]] },
  { at: TB, f: fol, K: [[0, [-2.6, 2.2, 5.2, 0, 0.9, -5, 46]], [T4 - TB, [-2.2, 2.0, 4.4, 0, 0.8, -4, 46]]] },
  { at: T4, f: fol, K: [[0, [4.6, 1.1, 0.4, 0, 0.6, -0.3, 44]], [T5 - T4, [4.8, 1.2, 0.0, 0, 0.6, -0.3, 44]]] },
  { at: T5, f: fol, K: [[0, [3.4, 1.9, 2.4, 0, 1.1, 0.0, 44]], [T6 - T5, [3.8, 1.7, 1.2, 0, 1.0, 0.0, 44]]] },
  { at: T6, f: fol, K: [[0, [-4.2, 1.6, 1.2, 0, 1.0, 0.0, 44]], [T7 - T6, [-4.4, 1.8, 0.6, 0, 1.0, 0.0, 44]]] },
  { at: T7, f: fol, K: [[0, [-3, 6, 9, 0, 0.8, -4, 50]], [4, [-3, 8, 12, 0, 0.8, -6, 50]]] },
];

run("w", (t) => {
  const { id } = sceneOf(t), partA = t < TB;
  const st = ride(B, path, t, partA ? (t > S.s2[0] ? RED : VIOLET) : GREEN);
  // wheels over the bumps -> height + pitch
  const s = sNow(t); let hf = 0, hr = 0;
  for (const b of bumps) { hf += hump(s + HALF - b); hr += hump(s - HALF - b); }
  B.g.position.y = (hf + hr) / 2; B.g.rotation.x = Math.atan2(hf - hr, 2 * HALF);
  // brake light while braking in s3
  const brk = !partA ? pulse(t, tSlow - 0.1, tOff - 0.3) : 0;
  B.tail.material.color.set(RED).multiplyScalar(2 + 6 * brk);
  // passenger thrown up after the rear wheel hits fast (part A), a small jolt in s6
  const thrown = partA ? Math.max(0, Math.sin(Math.PI * Math.min(1, Math.max(0, (t - tHit) / 0.9)))) : 0;
  const jolt = id === "s6" ? pulse(t, g("s6", "hard") - 0.05, g("s6", "hard") + 0.25) * 0.08 : 0;
  const knees = id === "s5" ? sm(g("s5", "grip") - 0.1, g("s5", "grip") + 0.2, t) : 0;
  Q.set({ look: id === "s5" ? 0.6 * pulse(t, g("s5", "warn") - 0.1, g("s5", "first") + 0.3) : 0, knees: 0.35 * knees, handsGlow: 0.35 * knees });
  Q.g.position.y = 0.97 + 0.55 * thrown + jolt; Q.g.rotation.x = -0.35 * thrown;
  Q.mats.torso.emissive.set(partA && t > S.s2[0] ? RED : id === "s6" && t > g("s6", "hard") - 0.1 ? RED : 0x000000).multiplyScalar(partA ? 0.4 + 1.2 * thrown : 0.8);
  // rider turns his head back to warn the passenger
  B.headG.rotation.y = id === "s5" ? 1.1 * pulse(t, g("s5", "warn") - 0.15, g("s5", "first") + 0.3) : 0;
  tagAt(tUp, st.x, 2.9, st.z, 0, 0.7);
  tagAt(tBr, st.x, 2.5, st.z, 0, 0.7);
  tagAt(tSm, st.x, 2.6, st.z, 0, 0.6); tagAt(tHard, st.x, 2.6, st.z, 0, 0.6);
  const shot = shoot(SH, t);
  bloom.strength = 1.0 + 1.2 * shot.punch * shot.punch + overlays(t) + 0.4 * thrown;
});
