// 148 phone-mount: phone bolted straight to the bars -> engine vibration travels up the frame, the phone jitters, its camera lens cracks; right way: a mount with a damper soaks up the shaking, phone locked in tight, route set before the ride.
import { THREE, S, g, sm, flash, scene, bloom, box, tube, mSolid, mFrame, VIOLET, ORANGE, RED, GREEN, shoot, sceneOf, run, glow } from "./kit.js";
import { title, endCard, cap, overlays, tag, tagAt, bikes, ride, fixed } from "./extra.js";

scene.fog.density = 0.02;
const [B] = bikes(1);
const mk = (hex, k = 2) => glow(hex, k);
// mount, all on the fork (bar centre at fork-local (0, 0.12, 0.05))
const clamp = box(0.08, 0.07, 0.07, 0, 0.12, 0.05, mk(RED, 2), false); B.fork.add(clamp);
const stem = box(0.03, 0.12, 0.03, 0, 0.2, 0.05, mFrame, false); B.fork.add(stem);
const damper = new THREE.Group(); damper.position.set(0, 0.25, 0.05); B.fork.add(damper);
const dMat = mk(GREEN, 2.2);
for (const [x, z] of [[-0.035, -0.02], [0.035, -0.02], [-0.035, 0.02], [0.035, 0.02]]) {
  const c = new THREE.Mesh(new THREE.CylinderGeometry(0.016, 0.016, 0.035, 10), dMat); c.position.set(x, 0, z); damper.add(c);
}
const cradle = new THREE.Group(); B.fork.add(cradle);
const phone = box(0.1, 0.18, 0.014, 0, 0, 0, mSolid, false); cradle.add(phone);
const scrMat = new THREE.MeshBasicMaterial({ color: 0x14305a }); const scr = new THREE.Mesh(new THREE.PlaneGeometry(0.088, 0.165), scrMat); scr.position.z = 0.008; cradle.add(scr);
const route = box(0.006, 0.12, 0.002, 0, 0, 0.0095, mk(GREEN, 1.4), false); cradle.add(route);
const pin = new THREE.Mesh(new THREE.SphereGeometry(0.009, 10, 8), mk(ORANGE, 1.4)); pin.position.set(0, 0.06, 0.011); cradle.add(pin);
const lens = new THREE.Mesh(new THREE.CylinderGeometry(0.014, 0.014, 0.006, 16), mk(VIOLET, 2)); lens.rotation.x = Math.PI / 2; lens.position.set(-0.025, 0.06, -0.009); cradle.add(lens);
const crack = new THREE.Group(); crack.position.set(-0.025, 0.06, -0.012); cradle.add(crack);
for (const r of [0.6, -0.7, 2.0]) { const c = box(0.075, 0.004, 0.002, 0, 0, 0, mk(RED, 3), false); c.rotation.z = r; crack.add(c); }
const jaws = [-1, 1].map((s) => { const j = box(0.014, 0.12, 0.03, s * 0.062, 0, 0, mk(GREEN, 2), false); cradle.add(j); return j; });
const ghost = box(0.1, 0.18, 0.014, 0, 0, 0, new THREE.MeshBasicMaterial({ color: RED, transparent: true, opacity: 0 }), false); B.fork.add(ghost);
// vibration: dots running from the engine up the frame to the bars (lean coords)
const E = new THREE.Vector3(0.24, 0.45, 0.0), TOP = new THREE.Vector3(0.12, 1.1, -0.47), DMP = new THREE.Vector3(0.1, 1.2, -0.47);
const dots = Array.from({ length: 9 }, () => { const d = new THREE.Mesh(new THREE.SphereGeometry(0.03, 10, 8), mk(RED, 3)); B.lean.add(d); return d; });
const tDamp = tag("DAMPER", GREEN), tCam = tag("CAMERA", RED);

title("NEVER BOLT YOUR PHONE STRAIGHT TO THE BARS");
cap("s2", "vibration", ["ENGINE", "VIBRATION"], RED, { until: ["s2", "breaks"] });
cap("s2", "breaks", "THE CAMERA BREAKS", RED);
cap("s3", "mount", ["A MOUNT WITH A", "VIBRATION DAMPER"], GREEN);
cap("s4", "damper", ["THE DAMPER TAKES", "THE SHAKING"], GREEN);
cap("s5", "lock", "LOCK IT IN TIGHT", GREEN);
cap("s6", "set", ["SET THE ROUTE", "BEFORE YOU RIDE"], GREEN);
endCard(["PHONE ON THE BARS?", "USE A DAMPER."]);

const SH = [
  { at: 0, K: [[0, [2.6, 1.8, -2.2, 0, 1.1, -0.45, 44]], [3, [1.15, 1.5, -1.3, 0, 1.18, -0.45, 40]]] },
  { at: S.s2[0], K: [[0, [1.9, 1.05, -1.3, 0.1, 0.85, -0.3, 46]], [1.0, [1.6, 1.15, -1.25, 0.1, 0.95, -0.35, 44]], [1.9, [0.8, 1.33, -1.1, 0, 1.24, -0.45, 38]], [2.7, [0.65, 1.34, -1.0, 0, 1.25, -0.45, 38]]] },
  { at: S.s3[0], K: [[0, [1.15, 1.4, -0.95, 0, 1.22, -0.45, 38]], [2.6, [0.85, 1.38, -0.7, 0, 1.22, -0.45, 38]]] },
  { at: S.s4[0], K: [[0, [2.2, 1.25, -0.7, 0.05, 0.98, -0.32, 48]], [1.6, [2.0, 1.3, -0.6, 0.05, 1.0, -0.32, 48]]] },
  { at: S.s5[0], K: [[0, [0.6, 1.8, 0.35, 0, 1.27, -0.45, 38]], [2.5, [0.45, 1.75, 0.25, 0, 1.27, -0.45, 38]]] },
  { at: S.s6[0], K: [[0, [0.25, 1.8, 0.35, 0, 1.27, -0.44, 36]], [1.8, [0.12, 1.76, 0.25, 0, 1.27, -0.44, 36]]] },
  { at: S.s7[0], K: [[0, [3.2, 1.9, 2.6, 0, 0.9, -0.2, 44]], [6, [-2.6, 2.0, 3.2, 0, 0.9, -0.2, 44]]] },
];

const C = new THREE.Color();
run("w", (t) => {
  const { id } = sceneOf(t), wrong = id === "s1" || id === "s2", T = (w) => g(id, w);
  ride(B, fixed(0, 0), t, wrong ? RED : id === "s7" ? GREEN : VIOLET, { trail: false });
  B.rider.visible = id === "s1" || id === "s7";
  B.hlight.visible = id === "s7"; B.mirL.visible = B.mirR.visible = id === "s7" || id === "s1";
  // wrong: red clamp straight on the bar, no damper, phone sits low
  damper.visible = !wrong;
  clamp.material.color.set(wrong ? RED : VIOLET).multiplyScalar(wrong && id === "s1" ? 0.6 + 2.2 * sm(T("bolt") - 0.1, T("bolt") + 0.3, t) : 1.6);
  stem.visible = !wrong;
  const base = wrong ? new THREE.Vector3(0, 0.2, 0.06) : new THREE.Vector3(0, 0.34, 0.07);
  // vibration strength and where the dots stop
  const kV = id === "s2" ? sm(T("engine") - 0.1, T("vibration"), t) : id === "s4" ? 1 : 0;
  dots.forEach((d, i) => {
    const u = (t * 1.6 + i / dots.length) % 1; d.visible = kV > 0.05;
    d.position.lerpVectors(E, wrong ? TOP : DMP, u); d.scale.setScalar(0.4 + 0.8 * kV * (1 - 0.5 * u));
    d.material.color.set(wrong ? RED : ORANGE).multiplyScalar(2.5);
  });
  // the phone jitters only when it takes the vibration directly
  const jit = wrong ? kV : 0;
  cradle.position.set(base.x + jit * 0.007 * Math.sin(t * 97), base.y + jit * 0.008 * Math.sin(t * 131 + 1), base.z);
  cradle.rotation.set(-0.5 + jit * 0.05 * Math.sin(t * 113), 0, jit * 0.05 * Math.sin(t * 89));
  // s4: the damper squishes instead
  const sq = id === "s4" ? 0.25 * Math.abs(Math.sin(t * 23)) : 0;
  damper.scale.set(1 + sq * 0.5, 1 - sq, 1 + sq * 0.5);
  dMat.color.set(GREEN).multiplyScalar(id === "s3" ? 0.8 + 2.4 * sm(T("damper") - 0.1, T("damper") + 0.3, t) : id === "s4" ? 2.4 + 2 * sq : 1.8);
  // camera lens: glows at "camera", cracks at "breaks"; the screen dies
  const kC = id === "s2" ? sm(T("camera") - 0.1, T("camera") + 0.2, t) : 0, kB = id === "s2" ? sm(T("breaks") - 0.05, T("breaks") + 0.15, t) : 0;
  lens.material.color.set(kC > 0 ? RED : VIOLET).multiplyScalar(1.5 + 2 * kC + 3 * flash(t, id === "s2" ? T("breaks") : -9));
  crack.visible = kB > 0.01; crack.scale.setScalar(kB);
  // screen: dark blue map; glitch after the break; route draws in s6
  const kR = id === "s6" ? sm(T("route") - 0.2, T("route") + 0.6, t) : id === "s7" || id === "s5" ? 1 : 0;
  scrMat.color.set(0x14305a).multiplyScalar(kB > 0 ? (Math.sin(t * 60) > 0.3 ? 0.15 : 1.4) * (1 - 0.8 * kB) : 1.2 + 0.6 * kR);
  route.visible = kR > 0.01; route.scale.set(1, Math.max(0.01, kR), 1); route.position.y = -0.06 + 0.06 * kR;
  pin.visible = kR > 0.9;
  // jaws: red in the wrong set-up, close in green on "lock"/"tight"
  const kJ = id === "s5" ? sm(T("lock") - 0.1, T("tight") + 0.1, t) : wrong ? 0.5 : 1;
  jaws.forEach((j, i) => { const s = i ? 1 : -1; j.position.x = s * (0.085 - 0.023 * kJ); j.material.color.set(wrong ? RED : GREEN).multiplyScalar(id === "s5" ? 0.4 + 1.2 * flash(t, T("tight")) + 0.5 * kJ : 0.8); });
  // s5 "fly off": a red ghost of a loose phone flies away, the real one stays
  const kF = id === "s5" ? sm(T("fly") - 0.1, T("fly") + 0.7, t) : 0;
  ghost.visible = kF > 0 && kF < 1; ghost.material.opacity = 0.45 * (1 - kF);
  ghost.position.set(0.25 * kF, 0.34 + 0.35 * kF, 0.07 + 0.3 * kF); ghost.rotation.set(-0.5 + 3 * kF, 0, 2 * kF);
  const shot = shoot(SH, t);
  tagAt(tDamp, 0.0, 1.13, -0.42, 0 && id === "s3" ? sm(T("damper") - 0.1, T("damper") + 0.3, t) * (1 - sm(S.s4[0] - 0.3, S.s4[0], t)) : 0, 0.07);
  tagAt(tCam, 0, 0, 0, 0, 1);
  bloom.strength = 1.0 + 1.2 * shot.punch * shot.punch + overlays(t) + (id === "s2" ? 1.0 * flash(t, T("breaks") + 0.05) : 0);
});
