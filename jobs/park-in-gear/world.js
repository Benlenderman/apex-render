// 143 park-in-gear: wrong = parked nose-down a hill in neutral, it rolls forward off the side stand and falls (red).
// Right = shift to first gear, bars turned to the stand side, the bike can't roll; next time start it in neutral (green).
import { THREE, S, g, sm, flash, scene, bloom, box, tube, glow, VIOLET, ORANGE, RED, GREEN, WHITE, shoot, run } from "./kit.js";
import { title, endCard, cap, overlays, bikes, ride, dist, tag, tagAt } from "./extra.js";

scene.fog.density = 0.012;
const T2 = S.s2[0], T3 = S.s3[0], T4 = S.s4[0], T5 = S.s5[0], T6 = S.s6[0], T7 = S.s7[0];
const SLOPE = -0.15; // hill: the bike's forward (-z) is downhill
const hill = new THREE.Group(); hill.rotation.x = SLOPE; scene.add(hill);
const mAs = new THREE.MeshStandardMaterial({ color: 0x14122e, emissive: 0x07061a, roughness: 0.9 });
hill.add(box(4.2, 0.04, 60, 0.4, -0.02, -10, mAs, false));
const mSoil = new THREE.MeshStandardMaterial({ color: 0x18240f, emissive: 0x0a1406, roughness: 1 });
hill.add(box(12, 0.04, 60, -7.7, -0.03, -10, mSoil, false), box(12, 0.04, 60, 8.5, -0.03, -10, mSoil, false));
for (let i = 0; i < 16; i++) hill.add(box(0.1, 0.012, 1.4, 0.4, 0.005, 12 - i * 3.2, glow(WHITE, 0.9), false)); // centre dashes
for (let i = 0; i < 12; i++) { const z = 10 - i * 4; hill.add(box(0.12, 0.8, 0.12, 2.5, 0.4, z, glow(VIOLET, 0.9), false), box(0.16, 0.12, 0.04, 2.5, 0.72, z, glow(ORANGE, 2), false)); } // roadside posts show the slope

// ---- side stand (from kickstand-up) + gear lever on the left ----
function addStand(B) {
  const piv = new THREE.Group(); piv.position.set(-0.2, 0.36, 0.1); B.lean.add(piv);
  const m = glow(RED, 1), tip = new THREE.Object3D(); tip.position.set(0, -0.34, 0);
  piv.add(tube([0, 0, 0], [0, -0.34, 0], 0.055, m), box(0.14, 0.04, 0.2, 0, -0.34, 0, m, false), tip);
  return { piv, tip, set(k, hex, b) { piv.rotation.set(-0.2 * k - 1.45 * (1 - k), 0, -0.55 * k - 0.15 * (1 - k)); m.color.set(hex).multiplyScalar(b); } };
}
const [Bk] = bikes(1); hill.add(Bk.g);
const ST = addStand(Bk);
const lev = new THREE.Group(); lev.position.set(-0.3, 0.34, -0.12); Bk.lean.add(lev);
const mLev = glow(VIOLET, 2); lev.add(tube([0, 0, 0], [0, 0.02, -0.22], 0.035, mLev), box(0.09, 0.03, 0.05, -0.03, 0.02, -0.22, mLev, false));
// exhaust puffs (right side, rear)
const puffs = Array.from({ length: 6 }, () => { const m = new THREE.Mesh(new THREE.SphereGeometry(0.07, 10, 8), new THREE.MeshBasicMaterial({ color: 0, toneMapped: false, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false })); Bk.g.add(m); return m; });
// arrows on the hill: red "rolls forward", red push vs green wall in s5
function arrow(hex) { const m = glow(hex, 2.4), a = new THREE.Group(); a.add(tube([0, 0, 0.35], [0, 0, -0.1], 0.04, m)); const c = new THREE.Mesh(new THREE.ConeGeometry(0.09, 0.18, 12), m); c.rotation.x = -Math.PI / 2; c.position.z = -0.18; a.add(c); hill.add(a); a.m = m; return a; }
const arR = arrow(RED), arP = arrow(RED);
const wall = box(0.9, 0.5, 0.03, 0, 0.25, -1.0, new THREE.MeshBasicMaterial({ color: 0, toneMapped: false, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false }), false); hill.add(wall);
const mkRing = () => { const m = new THREE.MeshBasicMaterial({ color: 0, toneMapped: false, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide }); const r = new THREE.Mesh(new THREE.RingGeometry(0.9, 1.0, 48), m); r.rotation.x = -Math.PI / 2; hill.add(r); return r; };
const halo = mkRing();
const setRing = (r, x, z, k, hex, s0, s1) => { if (k <= 0 || k >= 1) { r.visible = false; return; } r.visible = true; r.position.set(x, 0.03, z); r.scale.setScalar(s0 + (s1 - s0) * k); r.material.color.set(hex).multiplyScalar(2.6 * (1 - k)); };
// gear readouts
const gN = tag("NEUTRAL", RED, 2.2), g1 = tag("1ST GEAR", GREEN, 2.2), gN6 = tag("NEUTRAL", VIOLET, 2.2);

// ---- timing ----
const tHill = g("s1", "hill"), tNeutral = g("s1", "neutral");
const tRolls = g("s2", "rolls"), tComes = g("s2", "comes"), tKick = g("s2", "kickstand"), tFalls = g("s2", "falls");
const tFirst = g("s3", "first");
const tTurn = g("s4", "turn"), tBars = g("s4", "bars"), tSide = g("s4", "side");
const tCant = g("s5", "can't"), tRoll5 = g("s5", "roll"), tSlope = g("s5", "slope");
const tStart = g("s6", "start"), tEngine = g("s6", "engine"), tN6 = g("s6", "neutral");

// rolls forward from tRolls, stand folds as it rolls, falls left, slides to a stop
const vA = (t) => 1.3 * sm(tRolls - 0.1, tKick, t) * (1 - sm(tFalls + 0.1, tFalls + 0.6, t));
const DA = dist(vA, 0, 30);
const pA = (t) => [0, -DA(t), 0];
const pP = () => [0, 0, 0];

title("NEVER PARK ON A HILL IN NEUTRAL");
cap("s1", "parking", ["ON A HILL?"], VIOLET, { y: 0.3, until: ["s1", "never"] });
cap("s2", "rolls", ["IT ROLLS", "FORWARD"], RED, { y: 0.3, until: ["s2", "comes"] });
cap("s2", "comes", ["OFF THE STAND", "AND DOWN"], RED, { y: 0.3, boom: 0.6 });
cap("s3", "park", ["PARK IN", "FIRST GEAR"], GREEN, { y: 0.3 });
cap("s4", "turn", ["BARS TO THE", "STAND SIDE"], GREEN, { y: 0.3 });
cap("s5", "now", ["IT CAN'T ROLL"], GREEN, { y: 0.3 });
cap("s6", "next", ["START IT", "IN NEUTRAL"], VIOLET, { y: 0.3 });
endCard(["ON A HILL?", "PARK IN FIRST GEAR."]);

const V = new THREE.Vector3();
const wpos = (x, y, z) => hill.localToWorld(V.set(x, y, z)).toArray();
const SH = [
  { at: 0, K: [[0, [-6.8, 1.6, 1.0, 0, 0.5, -0.4, 44]], [T2, [-6.4, 1.5, 0.6, 0, 0.5, -0.5, 44]]] },
  { at: tRolls - 0.25, cam: (t) => { const z = -DA(t); const [x, y, zz] = wpos(0, 0.4, z); return [-6.6, 2.0 + y, zz + 2.2, x, y + 0.2, zz - 0.4, 46]; } },
  { at: T3, K: [[0, [-5.0, 1.4, 1.4, -0.2, 0.45, -0.3, 42]], [1.7, [-4.6, 1.3, 1.1, -0.2, 0.45, -0.3, 42]]] },
  { at: T4, K: [[0, [-3.4, 2.9, -3.3, -0.1, 0.6, -0.4, 44]], [2.0, [-3.0, 2.8, -3.6, -0.1, 0.6, -0.4, 44]]] },
  { at: T5, K: [[0, [-6.6, 1.6, 0.3, 0, 0.5, -0.5, 44]], [2.4, [-6.2, 1.55, 0.0, 0, 0.5, -0.5, 44]]] },
  { at: T6, K: [[0, [-4.8, 1.6, 2.9, 0.1, 0.8, -0.2, 44]], [2.1, [-4.4, 1.55, 2.6, 0.1, 0.8, -0.2, 44]]] },
  { at: T7, K: [[0, [-6.0, 2.3, 3.0, 0, 0.6, -0.4, 46]], [3, [-3.4, 2.9, 5.4, 0, 0.6, -0.4, 46]]] },
];

run("w", (t) => {
  const A = t < T3;
  let leverHex = VIOLET, leverB = 2, leverRot = 0;
  if (A) {
    const fold = sm(tComes - 0.1, tKick + 0.15, t);
    const f = sm(tKick + 0.05, tFalls + 0.35, t), fall = f * f;
    const lean = 0.2 * (1 - fold * 0.9) + 1.25 * fall;
    ride(Bk, t < tRolls ? pP : pA, t, t < T2 ? VIOLET : RED, { lean, still: t < tRolls, trail: false });
    Bk.rider.visible = false;
    ST.set(1 - fold, RED, 1.2 + 2.2 * flash(t, tComes) + 1.5 * flash(t, tNeutral));
    leverHex = RED; leverB = 2 + 2.5 * flash(t, tNeutral);
    // red arrow ahead, pushing downhill while it rolls
    const ak = sm(tRolls - 0.2, tRolls + 0.1, t) * (1 - sm(tFalls, tFalls + 0.3, t));
    arR.visible = ak > 0.02; arR.position.set(0.0, 0.08, -DA(t) - 1.2 - 0.25 * ((t * 1.8) % 1)); arR.scale.setScalar(1.4 * ak);
    arP.visible = false; wall.visible = false;
    setRing(halo, -0.7, -DA(t), sm(tFalls + 0.25, tFalls + 1.0, t), RED, 0.4, 1.8);
    Bk.g.updateMatrixWorld(true);
    tagAt(gN, 0, 0, 0, 0);
    tagAt(g1, 0, 0, 0, 0); tagAt(gN6, 0, 0, 0, 0);
    puffs.forEach((p) => (p.visible = false));
  } else {
    // s5: a nudge downhill that the gear stops
    const nudge = t > T5 ? 0.035 * Math.max(0, Math.sin(Math.PI * Math.min(1, Math.max(0, (t - tCant + 0.15) / 0.5)))) + 0.03 * Math.max(0, Math.sin(Math.PI * Math.min(1, Math.max(0, (t - tSlope + 0.1) / 0.5)))) : 0;
    ride(Bk, () => [0, -nudge, 0], t, GREEN, { lean: 0.2 * (1 - sm(T6 - 0.1, T6 + 0.4, t)), still: true, trail: false });
    const steer = 0.5 * sm(tTurn, tBars + 0.3, t) * (1 - sm(T6 - 0.1, T6 + 0.4, t));
    Bk.fork.rotation.y = steer;
    Bk.rider.visible = t > T6;
    ST.set(1 - sm(T6 - 0.1, T6 + 0.3, t), GREEN, 1.3 + 2.2 * flash(t, tSide));
    // shift: lever clicks down at "first", up to neutral at "neutral" in s6
    leverHex = t < T6 ? GREEN : VIOLET; leverB = 2 + 3 * flash(t, tFirst) + 3 * flash(t, tN6);
    leverRot = 0.35 * flash(t, tFirst) - 0.3 * flash(t, tN6);
    const pk = t > T5 && t < T6 ? sm(tCant - 0.3, tCant, t) : 0;
    arP.visible = pk > 0.02; arP.position.set(0, 0.6, 0.9 - 0.12 * Math.abs(Math.sin((t - tCant) * 5))); arP.scale.setScalar(1.2 * pk);
    wall.visible = pk > 0.02; wall.position.z = -1.05; wall.material.color.set(GREEN).multiplyScalar(0.6 * pk + 1.4 * flash(t, tRoll5) + 1.2 * flash(t, tSlope));
    arR.visible = false;
    setRing(halo, -0.2, 0, sm(tRoll5 - 0.05, tRoll5 + 0.8, t), GREEN, 0.4, 1.9);
    Bk.hlight.material.color.set(WHITE).multiplyScalar(1.8 + 3 * sm(tEngine, tEngine + 0.2, t) * (t > T6 ? 1 : 0));
    puffs.forEach((p, i) => { const u = (t - tEngine) * 1.4 + i / 6; const on = t > tEngine && t < T7 + 2; p.visible = on; if (!on) return; const k = u % 1; p.position.set(0.22 + 0.1 * k, 0.32 + 0.15 * k, 0.85 + 0.9 * k); p.scale.setScalar(0.6 + 2 * k); p.material.color.set(VIOLET).multiplyScalar(0.7 * (1 - k)); });
    Bk.g.updateMatrixWorld(true);
    tagAt(gN, 0, 0, 0, 0);
    tagAt(g1, 0, 0, 0, 0);
    tagAt(gN6, 0, 0, 0, 0);
  }
  lev.rotation.x = leverRot; mLev.color.set(leverHex).multiplyScalar(leverB);
  const shot = shoot(SH, t);
  bloom.strength = 0.8 + 1.0 * shot.punch * shot.punch + overlays(t) + (A ? 0.6 * flash(t, tFalls + 0.35) : 0.4 * flash(t, tRoll5));
});
