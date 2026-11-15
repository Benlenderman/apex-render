// 147 pillion-exhaust: passenger steps off on the exhaust (right) side -> calf on the hot pipe, burn; right way: show the pipe before the ride, on/off on the left, long pants + boots, rider holds the bike, off on the no-exhaust side.
import { THREE, S, g, sm, flash, scene, bloom, box, tube, mSolid, mFrame, VIOLET, ORANGE, RED, GREEN, shoot, sceneOf, run, patch, glow } from "./kit.js";
import { addPillion, makePerson, pose, ARM, title, endCard, cap, overlays, tag, tagAt, bikes, ride, fixed } from "./extra.js";

scene.fog.density = 0.02;
const [B] = bikes(1), Q = addPillion(B);
// parking bay lines
for (const x of [-1.6, 1.6, -4.8, 4.8]) scene.add(box(0.08, 0.01, 3.6, x, 0.01, 0.2, mFrame, false));
scene.add(box(9.7, 0.01, 0.08, 0, 0.01, -1.6, mFrame, false));
const parked = bikes(2); parked.forEach((b, i) => { ride(b, fixed(-0.3, i ? 3.2 : -3.2), 0, VIOLET, { lean: 0.12 * (i ? 1 : -1) }); b.rider.visible = false; });
// the exhaust (bike's right, +x) as a glowing overlay; burn spot where the calf meets it
const hot = tube([0.16, 0.25, 0.3], [0.17, 0.5, 0.75], 0.13, glow(RED, 0.1)); hot.material.transparent = true; B.lean.add(hot);
const burn = new THREE.Mesh(new THREE.SphereGeometry(0.11, 12, 8), glow(RED, 3)); burn.position.set(0.3, 0.45, 0.62); B.lean.add(burn);
const Pp = makePerson(), Rr = makePerson(), N = makePerson(); B.lean.add(Pp.g);
const base = Object.fromEntries(Object.entries(N.mats).map(([k, m]) => [k, m.emissive.clone()]));
const feet = new THREE.Group(); B.lean.add(feet);
for (const s of [-1, 1]) feet.add(tube([s * 0.24, 0.44, 0.14], [s * 0.42, 0.06, 0.02], 0.1, mSolid), box(0.12, 0.08, 0.26, s * 0.43, 0.04, -0.04, mSolid));
const lever = box(0.22, 0.06, 0.06, 0.42, 0.06, 0.1, glow(GREEN, 3), false); B.fork.add(lever);
const zBad = patch(1.1, 2.2, RED, 0.9), zGood = patch(1.1, 2.2, GREEN, 0.9), feetZ = [-1, 1].map((s) => { const p = patch(0.55, 0.6, GREEN, 1.2); p.position.set(s * 0.43, 0.03, 0); return p; });
zBad.position.set(1.0, 0.02, 0.5); zGood.position.set(-1.0, 0.02, 0.5);
const tHot = tag("HOT PIPE", RED), tBurn = tag("BURN", RED), tExh = tag("EXHAUST: THIS SIDE", RED), tNo = tag("NO EXHAUST", GREEN), tSide = tag("HOT SIDE", RED), tPants = tag("LONG PANTS", GREEN), tBoots = tag("BOOTS", GREEN), tBrake = tag("FRONT BRAKE", GREEN);

title("NEVER GET OFF ON THE EXHAUST SIDE");
cap("s2", "touches", ["LEG ON", "THE HOT PIPE"], RED, { until: ["s2", "burn"] });
cap("s2", "burn", "A BAD BURN", RED);
cap("s3", "tell", ["BEFORE THE RIDE:", "SHOW THE EXHAUST"], GREEN);
cap("s4", "get", "ON AND OFF", GREEN, { until: ["s4", "other"] });
cap("s4", "other", "THE OTHER SIDE", GREEN);
cap("s5", "long", "LONG PANTS", GREEN, { until: ["s5", "boots"] });
cap("s5", "boots", "+ BOOTS", GREEN, { until: ["s5", "short"] });
cap("s5", "short", ["EVEN FOR", "A SHORT RIDE"], ORANGE);
cap("s6", "hold", ["HOLD THE BIKE", "STEADY"], GREEN);
endCard(["OFF ON THE SIDE", "WITH NO EXHAUST."]);

// passenger on/off: m 0 standing beside, 0.3 foot on the peg, 0.75 leg over, 1 seated; side -1 left, +1 right (exhaust)
function mount(m, side, hex) {
  const a = sm(0, 0.3, m), b = sm(0.3, 0.75, m), seated = m >= 0.92;
  Q.g.visible = seated; Pp.g.visible = !seated && m > -0.5;
  Pp.g.position.set(side * (0.85 - 0.3 * a - 0.45 * b), 0.33 * a + 0.2 * b, 0.6); Pp.g.rotation.set(0, -side * Math.PI / 2, 0);
  Pp.body.rotation.set(-0.5 * b, 0, 0);
  for (const k of ["torso", "legs"]) { Pp.mats[k].emissive.set(hex).multiplyScalar(0.35); Q.mats[k].emissive.set(hex).multiplyScalar(0.35); }
}

const SH = [
  { at: 0, K: [[0, [4.4, 2.4, 4.8, 0.2, 0.75, 0.3, 44]], [3, [3.8, 2.2, 4.2, 0.2, 0.7, 0.3, 44]]] },
  { at: S.s2[0], K: [[0, [-0.6, 1.5, 3.6, 0.35, 0.6, 0.55, 44]], [3, [-0.4, 1.3, 3.1, 0.35, 0.55, 0.55, 44]]] },
  { at: S.s3[0], K: [[0, [4.8, 3.2, 5.8, 0.7, 0.7, 1.0, 46]], [4, [4.2, 3.0, 5.2, 0.7, 0.7, 1.0, 46]]] },
  { at: S.s4[0], K: [[0, [-4.9, 2.5, 3.0, -0.3, 0.8, 0.4, 44]], [3, [-4.5, 2.5, 2.2, -0.3, 0.8, 0.4, 44]]] },
  { at: S.s5[0], K: [[0, [-4.0, 1.6, 4.8, -1.0, 0.85, 1.2, 44]], [4, [-3.5, 1.5, 4.2, -1.0, 0.8, 1.2, 44]]] },
  { at: S.s6[0], K: [[0, [-3.4, 2.2, -2.8, 0, 0.8, 0.3, 44]], [3, [-3.8, 2.3, -1.6, 0, 0.8, 0.3, 44]]] },
  { at: S.s7[0], K: [[0, [1.0, 5.0, 5.6, 0, 0.4, 0.4, 46]], [6, [-1.6, 5.2, 5.0, 0, 0.4, 0.4, 46]]] },
];

run("w", (t) => {
  const { id } = sceneOf(t), wrong = id === "s1" || id === "s2", T = (w) => g(id, w);
  let m = 1, side = 1, riderOn = true;
  if (id === "s1") m = 1 - 0.4 * sm(T("off") - 0.1, T("exhaust") + 0.3, t);
  else if (id === "s2") m = 0.6 - 0.3 * sm(S.s2[0], T("touches"), t) - 0.3 * sm(T("burn") - 0.2, T("burn") + 0.4, t);
  else if (id === "s3") { m = -1; riderOn = false; }
  else if (id === "s4") { side = -1; m = 0.3 * sm(T("get") - 0.2, T("on"), t) + 0.7 * sm(T("on"), T("other"), t); }
  else if (id === "s5") { m = -1; riderOn = false; }
  else if (id === "s6") { side = -1; m = 1 - sm(T("until") - 0.1, S.s6[0] + S.s6[1] - 0.1, t); }
  else { side = -1; m = 0; }
  ride(B, fixed(0, 0), t, wrong ? RED : id === "s7" ? GREEN : VIOLET, { trail: false });
  B.rider.visible = riderOn;
  mount(m, side, wrong ? RED : VIOLET);
  // burned calf: the passenger's lower legs go red on contact
  const kB = id === "s2" ? sm(T("touches") - 0.05, T("touches") + 0.3, t) : 0;
  Pp.mats.lower.emissive.set(RED).multiplyScalar(0.9 * kB);
  burn.visible = kB > 0; burn.scale.setScalar(0.01 + kB * (1 + (id === "s2" ? 0.4 * flash(t, T("burn")) : 0)));
  const kHot = wrong ? 0.4 + 2.4 * (id === "s2" ? sm(T("hot") - 0.1, T("hot") + 0.3, t) : sm(T("exhaust") - 0.1, T("exhaust") + 0.3, t))
    : id === "s3" ? 0.3 + 2.4 * sm(T("exhaust") - 0.1, T("exhaust") + 0.3, t) * (0.75 + 0.25 * Math.sin(t * 9)) : 0.6;
  hot.material.color.set(RED).multiplyScalar(kHot);
  // s3: rider walks to the bike's right and points at the pipe while the passenger watches
  const s3 = id === "s3";
  if (s3) {
    const k = sm(T("tell") - 0.2, T("side"), t);
    pose(Rr, { x: 1.9 - 0.6 * k, z: 1.9 - 0.7 * k, h: 0.6 - 1.3 * sm(T("side") - 0.3, T("exhaust"), t), armR: ARM.point * sm(T("side"), T("exhaust"), t) });
    pose(N, { x: -0.1 + 0.3 * k, z: 2.3, h: 0.9 * k });
  } else pose(Rr, { vis: false });
  // s5: the passenger alone, slowly turning, legs then boots go green
  if (id === "s5") {
    pose(N, { x: -1.3, z: 1.5, h: -0.9 + 0.5 * sm(S.s5[0], S.s5[0] + S.s5[1], t) });
    const kP = sm(T("pants") - 0.15, T("pants") + 0.2, t), kF = sm(T("boots") - 0.15, T("boots") + 0.2, t);
    for (const k of ["legs", "lower"]) N.mats[k].emissive.copy(base[k]).lerp(new THREE.Color(GREEN).multiplyScalar(0.9), kP);
    N.mats.feet.emissive.copy(base.feet).lerp(new THREE.Color(GREEN).multiplyScalar(1.2), kF);
  } else if (!s3) pose(N, { vis: false });
  if (id !== "s5") for (const k in base) N.mats[k].emissive.copy(base[k]);
  // s6: rider feet down + front brake while the passenger steps off on the left
  const s6 = id === "s6", kF6 = s6 ? sm(T("hold") - 0.1, T("hold") + 0.2, t) : 0;
  feet.visible = !wrong && riderOn && (s6 || id === "s4" || id === "s7");
  feetZ.forEach((p) => p.set(kF6));
  lever.visible = s6 || id === "s4";
  // sides: green no-exhaust side, red hot side (right way scenes)
  const kS = id === "s4" ? sm(T("other") - 0.1, T("other") + 0.3, t) : id === "s7" ? 1 : 0;
  zGood.set(kS); zBad.set(id === "s2" ? 0.35 * kB : kS * 0.8);
  const shot = shoot(SH, t);
  tagAt(tHot, 0, 0, 0, 0, 1); 0 && (0, id === "s2" ? sm(T("hot") - 0.1, T("hot") + 0.2, t) * (1 - sm(T("burn") - 0.2, T("burn"), t)) : 0, 0.45);
  tagAt(tBurn, 0, 0, 0, 0, 1);
  tagAt(tExh, 0.4, 0.15, 1.3, s3 ? sm(T("exhaust") - 0.1, T("exhaust") + 0.3, t) : 0, 0.8);
  tagAt(tNo, -1.0, 0.1, 0.5, kS, 0.6);
  tagAt(tSide, 1.0, 0.1, 0.5, kS, 0.6);
  tagAt(tPants, 0, 0, 0, 0, 1);
  tagAt(tBoots, 0, 0, 0, 0, 1);
  tagAt(tBrake, 0.6, 0.35, -1.1, s6 ? sm(T("steady") - 0.1, T("steady") + 0.2, t) : 0, 0.6);
  bloom.strength = 1.0 + 1.2 * shot.punch * shot.punch + overlays(t) + (id === "s2" ? 0.9 * flash(t, T("touches") + 0.1) : 0);
});
