// 149 earplugs: long ride, wind streams over the helmet, red noise rings at the ear, hearing bar drains; a helmet alone doesn't stop it.
// Right way: soft foam plugs slide in under the helmet, the noise rings stop, horn + siren rings still reach the ear, energy bar stays full.
import { THREE, S, g, sm, flash, scene, bloom, box, glow, VIOLET, ORANGE, RED, GREEN, pathState, shoot, sceneOf, run, makeCar } from "./kit.js";
import { track, buildRoad, title, endCard, cap, overlays, tag, tagAt, bikes, ride } from "./extra.js";

scene.fog.density = 0.012;
const V = 14, { P } = track([{ len: 4000 }]);
buildRoad(P, -60, 4000, { lamps: true });
const [B] = bikes(1), car = makeCar({ driver: true });
const aP = (t) => P(20 + V * t, 1.3), cP = (t) => P(20 + V * t - 7 + 1.5 * Math.sin(t * 0.7), -1.4);
const Bf = (fn) => (t) => pathState(fn, t);
// see-through helmet so the plugs can be seen going in
const head = B.headG.children[0]; head.material = head.material.clone(); head.material.transparent = true;
// earplugs (foam, orange) on both ears
const plugs = [-1, 1].map((s) => { const p = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.026, 0.06, 12), glow(ORANGE, 1.6)); p.rotation.z = Math.PI / 2; B.headG.add(p); return p; });
// noise rings at the right ear (red = wind roar)
const rings = Array.from({ length: 4 }, () => { const r = new THREE.Mesh(new THREE.TorusGeometry(0.06, 0.007, 6, 28), new THREE.MeshBasicMaterial({ color: RED, transparent: true, depthWrite: false, toneMapped: false })); r.rotation.y = Math.PI / 2; B.headG.add(r); return r; });
// wind streaks flowing past the rider (bike-local, -z is forward)
const wMat = new THREE.MeshBasicMaterial({ color: 0xbfb8ff, transparent: true, opacity: 0.5, depthWrite: false, blending: THREE.AdditiveBlending });
const streaks = Array.from({ length: 22 }, (_, i) => { const b = new THREE.Mesh(new THREE.BoxGeometry(0.012, 0.012, 0.9), wMat); b.userData = { x: ((i * 0.37) % 1 - 0.5) * 1.1, y: 1.25 + ((i * 0.61) % 1) * 0.7, p: (i * 0.29) % 1 }; B.g.add(b); return b; });
// bar meter over the helmet: hearing (s2) / energy (s6)
const bars = Array.from({ length: 5 }, (_, i) => { const b = box(0.045, 0.045, 0.045, -0.12 + i * 0.06, 0.25, 0, glow(GREEN, 2), false); B.headG.add(b); return b; });
// siren: orange light bar on the car roof + green sound rings
const siren = box(0.6, 0.12, 0.2, 0, 1.55, 0.2, glow(ORANGE, 2.5), false); car.g.add(siren);
const sRings = Array.from({ length: 4 }, () => { const r = new THREE.Mesh(new THREE.TorusGeometry(1, 0.03, 6, 40), new THREE.MeshBasicMaterial({ color: GREEN, transparent: true, depthWrite: false, toneMapped: false })); r.rotation.x = Math.PI / 2; scene.add(r); return r; });
const tHorn = tag("HORN", GREEN), tSiren = tag("SIREN", GREEN), tWind = tag("WIND", RED);

title("NEVER RIDE LONG WITHOUT EARPLUGS");
cap("s2", "hours", ["HOURS OF", "WIND NOISE"], RED, { until: ["s2", "damage"] });
cap("s2", "damage", ["HEARING DAMAGE", "FOR GOOD"], RED);
cap("s3", "helmet", ["A HELMET ALONE", "DOESN'T STOP IT"], RED);
cap("s4", "foam", ["SOFT FOAM EARPLUGS", "UNDER THE HELMET"], GREEN);
cap("s5", "hear", ["HORNS + SIRENS: YES", "WIND: NO"], GREEN);
cap("s6", "less", ["LESS TIRED", "ON LONG RIDES"], GREEN);
endCard(["LONG RIDE?", "WEAR EARPLUGS."]);

const SH = [
  { at: 0, f: Bf(aP), noRot: 1, K: [[0, [3.4, 2.0, -5.0, 0, 1.0, -1, 46]], [3, [2.5, 1.8, -3.4, 0, 1.2, -0.5, 42]]] },
  { at: S.s2[0], f: Bf(aP), noRot: 1, K: [[0, [1.7, 1.95, -0.9, 0, 1.74, -0.1, 42]], [3, [1.35, 1.92, -0.65, 0, 1.74, -0.1, 42]]] },
  { at: S.s3[0], f: Bf(aP), noRot: 1, K: [[0, [1.2, 1.9, -1.4, 0, 1.6, -0.1, 38]], [3, [1.0, 1.85, -1.1, 0, 1.6, -0.1, 38]]] },
  { at: S.s4[0], f: Bf(aP), noRot: 1, K: [[0, [1.1, 1.75, 0.2, 0, 1.62, -0.05, 36]], [3, [0.95, 1.72, 0.1, 0, 1.62, -0.05, 36]]] },
  { at: S.s5[0], f: Bf(aP), noRot: 1, K: [[0, [5.0, 3.6, -3.5, -1.2, 1.0, 3.0, 50]], [3, [4.4, 3.3, -2.8, -1.2, 1.0, 3.0, 50]]] },
  { at: S.s6[0], f: Bf(aP), noRot: 1, K: [[0, [2.6, 2.1, -3.2, 0, 1.5, 0, 44]], [3, [2.1, 2.0, -2.7, 0, 1.5, 0, 44]]] },
  { at: S.s7[0], f: Bf(aP), noRot: 1, K: [[0, [4, 5, 6, 0, 1, -3, 48]], [5, [-3, 5, 6, 0, 1, -3, 48]]] },
];

run("w", (t) => {
  const { id } = sceneOf(t), wrong = id === "s1" || id === "s2" || id === "s3", T = (w) => g(id, w);
  const st = ride(B, aP, t, wrong ? RED : id === "s7" ? GREEN : VIOLET);
  // plugs: off in the wrong part, slide in on "foam"/"earplugs" in s4, in afterwards
  const kP = wrong ? 0 : id === "s4" ? sm(T("foam") - 0.1, T("under"), t) : 1;
  plugs.forEach((p, i) => { const s = i ? 1 : -1; p.visible = kP > 0.01; p.position.set(s * (0.15 + 0.35 * (1 - kP)), 0.04, -0.04); p.material.color.set(ORANGE).multiplyScalar(1.4 + 1.5 * (id === "s4" ? flash(t, T("under")) : 0)); });
  head.material.opacity = id === "s4" ? 1 - 0.65 * sm(S.s4[0], T("foam"), t) : id === "s5" || id === "s3" ? (id === "s3" ? 1 - 0.5 * sm(T("noise") - 0.2, T("noise"), t) : 0.6) : 1;
  // wind: always there; red roar rings at the ear only without plugs
  const kW = id === "s1" ? sm(T("ride") - 0.2, T("earplugs"), t) : wrong ? 1 : id === "s4" ? 1 - sm(T("earplugs") - 0.1, T("under"), t) : 0;
  streaks.forEach((b) => { const u = (t * 2.2 + b.userData.p) % 1; b.position.set(b.userData.x, b.userData.y, -3.5 + 5 * u); });
  wMat.opacity = 0.45 + 0.25 * (wrong ? 1 : 0);
  rings.forEach((r, i) => { const u = (t * 1.8 + i / rings.length) % 1; r.visible = kW > 0.02; r.position.set(0.17 + 0.25 * u, 0.04, -0.04); r.scale.setScalar(0.6 + 1.6 * u); r.material.opacity = kW * (1 - u); r.material.color.set(RED).multiplyScalar(2.2); });
  // meter: hearing drains in s2, energy stays full in s6
  const show = id === "s2" || id === "s6";
  const lvl = id === "s2" ? 5 - 3.5 * sm(T("slowly") - 0.1, T("good"), t) : 5;
  bars.forEach((b, i) => { b.visible = show && i < lvl; b.material.color.set(id === "s2" ? (lvl < 3 ? RED : ORANGE) : GREEN).multiplyScalar(1.3 + (id === "s6" ? 1.0 * flash(t, T("tired")) : 0)); });
  // s5: siren car in the next lane, green sound rings that reach the rider
  const s5 = id === "s5", cst = s5 || id === "s6" ? pathState(cP, t) : null;
  car.set(cst);
  siren.material.color.set(Math.sin(t * 14) > 0 ? ORANGE : RED).multiplyScalar(s5 ? 3 : 1);
  const kS = s5 ? sm(T("horns") - 0.15, T("horns") + 0.1, t) : 0;
  sRings.forEach((r, i) => { const u = (t * 1.2 + i / sRings.length) % 1; r.visible = kS > 0.02 && !!cst; if (!cst) return; r.position.set(cst.x, 1.4, cst.z); r.scale.setScalar(0.4 + 3.2 * u); r.material.opacity = kS * (1 - u); r.material.color.set(GREEN).multiplyScalar(2.2); });
  B.hlight.visible = id === "s7";
  const shot = shoot(SH, t);
  const tg = (m, a, dx, dy, dz, size) => tagAt(m, st.x + dx, dy, st.z + dz, a, size);
  tg(tHorn, 0 && s5 ? sm(T("horns") - 0.1, T("horns") + 0.2, t) : 0, -2.2, 2.3, 3.0, 0.5);
  tg(tSiren, 0 && s5 ? sm(T("sirens") - 0.1, T("sirens") + 0.2, t) : 0, -2.2, 1.9, 3.6, 0.5);
  tg(tWind, 0, 0, 0, 0, 0.1);
  bloom.strength = 1.0 + 1.2 * shot.punch * shot.punch + overlays(t);
});
