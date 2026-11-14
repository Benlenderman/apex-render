// 126 tank-grip: wrong = red rider brakes without gripping the tank, slides forward onto his arms; locked arms can't steer, he runs wide in the next corner and goes down (red).
// Right = green rider squeezes the tank with his knees, core tight, legs hold him; arms stay loose and the bike turns in easily (green).
import { THREE, S, g, sm, flash, scene, bloom, glow, ORANGE, RED, GREEN, WHITE, hud, beam, shoot, run } from "./kit.js";
import { track, ribbon, buildRoad, makePerson, pose, title, endCard, cap, overlays, bikes, ride } from "./extra.js";

// ---------- props: INCORRECT / CORRECT badge, glowing body-part overlay, joint dot ----------
function badge(txt, css) {
  const c = document.createElement("canvas"); c.width = 1024; c.height = 256; const x = c.getContext("2d");
  x.font = "900 130px Inter, Arial, sans-serif"; const w = Math.min(1024, x.measureText(txt).width + 80);
  x.fillStyle = css; x.beginPath(); x.roundRect((1024 - w) / 2, 38, w, 180, 18); x.fill();
  x.fillStyle = "#fff"; x.textBaseline = "middle"; x.textAlign = "center"; x.fillText(txt, 512, 132, 960);
  const m = new THREE.Mesh(new THREE.PlaneGeometry(2, 0.5), new THREE.MeshBasicMaterial({ map: new THREE.CanvasTexture(c), color: 0xb8b8b8, transparent: true, toneMapped: false, depthWrite: false, depthTest: false, fog: false }));
  m.renderOrder = 22; m.userData.w = 2; m.visible = false; scene.add(m); return m;
}
// a glowing shell over rider parts (children indices); set(a) 0..1
function glowParts(B, idx, hex) {
  const m = glow(hex, 0); m.transparent = true; m.blending = THREE.AdditiveBlending; m.depthWrite = false;
  const os = idx.map((i) => { const c = B.rider.children[i], o = new THREE.Mesh(c.geometry, m); o.scale.setScalar(1.12); c.add(o); return o; });
  return { set(a, hx = hex) { os.forEach((o) => (o.visible = a > 0.01)); m.color.set(hx).multiplyScalar(1.6 * a); } };
}
function knees(B, hex) {
  const m = glow(hex, 0); m.depthTest = false;
  const os = [-1, 1].map((s) => { const o = new THREE.Mesh(new THREE.SphereGeometry(0.075, 14, 10), m); o.position.set(s * 0.2, 0.96, -0.08); o.renderOrder = 9; B.rider.add(o); return o; });
  return { set(a) { os.forEach((o) => (o.visible = a > 0.01)); m.color.set(hex).multiplyScalar(1.5 * a); } };
}

// ---------- track: straight, then a left-hander ----------
const LW = 3.6, SIN = 90, ARC = 50, RC = 22;
const { P } = track([{ len: SIN }, { len: ARC, R: RC }, { len: 400 }]);
buildRoad(P, 0, 320, { LW, lamps: false });
const mK = [glow(RED, 1.0), glow(WHITE, 0.55)];
for (let s = SIN - 4, i = 0; s < SIN + ARC + 4; s += 1.6, i++) ribbon(P, -LW - 1.1, -LW - 0.45, s, s + 1.6, mK[i % 2], 0.015, 0.4);
ribbon(P, LW + 0.5, LW + 9, SIN, SIN + ARC + 20, new THREE.MeshBasicMaterial({ color: 0x3a2412 }), 0.006, 1); // gravel on the outside
scene.fog.density = 0.016;
const lineO = (s) => 1.5 - 3.3 * Math.sin(Math.PI * Math.min(1, Math.max(0, (s - SIN) / ARC)));

const T2 = S.s2[0], T3 = S.s3[0], T4 = S.s4[0], T5 = S.s5[0], T6 = S.s6[0], T7 = S.s7[0];
const [BR, BG] = bikes(2), THROWN = makePerson();
[BR, BG].forEach((B) => B.hlight.material.color.multiplyScalar(0.25));

// distance under a speed profile v(t), anchored so s(tA) = sA
function course(v, t0, t1, tA, sA) {
  const ST = []; let s = 0; for (let t = t0; t <= t1 + 0.02; t += 0.01) { ST.push(s); s += v(t) * 0.01; }
  const at = (t) => { const i = Math.max(0, Math.min(ST.length - 2, (t - t0) / 0.01)), k = Math.floor(i); return ST[k] + (ST[k + 1] - ST[k]) * (i - k); };
  const off = sA - at(tA); return (t) => at(t) + off;
}

// ---- red: brakes on the straight with no grip, slides onto the arms, can't turn, runs wide and crashes ----
const tBkR = g("s2", "brake"), tSl = g("s2", "slides"), tTurnR = g("s3", "arms"), tCr = g("s3", "steer") - 0.15;
const vR = (t) => 16 - 7 * sm(tBkR, tBkR + 1.6, t);
const sRraw = course(vR, 0, T4 + 2, tTurnR, SIN);
const sR = (t) => (t < tCr ? sRraw(t) : sRraw(tCr) + 9 * 0.5 * (1 - Math.exp(-(t - tCr) / 0.5)));
const oR = (t) => lineO(Math.min(sR(t), SIN + 5)) + 6 * sm(tTurnR + 0.3, tCr, t) ** 1.2 + 1.2 * sm(tCr, tCr + 1, t);
const redPath = (t) => P(sR(t), oR(t));
const bkR = (t) => sm(tBkR, tBkR + 0.3, t) * (1 - sm(tTurnR - 0.2, tTurnR + 0.2, t));
const slide = (t) => sm(tBkR + 0.2, tSl + 0.4, t);
const kD = (t) => sm(tCr, tCr + 0.35, t);
const leanR = (t) => 0.32 * sm(tTurnR, tTurnR + 0.6, t);

// ---- green: brakes with knees on the tank, core tight, then turns in easily ----
const tBkG = g("s4", "brake"), tTurnG = g("s6", "bike") - 0.3;
const vG = (t) => 16 - 7 * sm(tBkG, tBkG + 1.6, t) + 4 * sm(tTurnG + 1.6, tTurnG + 3.5, t);
const sG = course(vG, T4 - 0.5, T7 + 6, tTurnG, SIN);
const oG = (t) => lineO(sG(t));
const greenPath = (t) => P(sG(t), oG(t));
const bkG = (t) => sm(tBkG - 0.1, tBkG + 0.3, t) * (1 - sm(tTurnG - 0.3, tTurnG + 0.2, t));

// body: red slides forward, torso folds onto the bars
const torsoX = BR.rider.children[0].rotation.x;
const GR = { arms: glowParts(BR, [4, 5, 10, 11], RED) };
const GG = { arms: glowParts(BG, [4, 5, 10, 11], GREEN), thighs: glowParts(BG, [2, 3], GREEN), core: glowParts(BG, [0], GREEN), shins: glowParts(BG, [6, 7], GREEN), knee: knees(BG, GREEN) };
const wArrow = beam(RED, 1.6, 0.05); wArrow.material.depthTest = false; wArrow.renderOrder = 9;
const wA = new THREE.Vector3(), wB = new THREE.Vector3();
const hip = new THREE.Object3D(); hip.position.set(0, 1.25, 0.2); BR.rider.add(hip);
const grip = new THREE.Object3D(); grip.position.set(0, 1.07, -0.5); BR.rider.add(grip);

const bdgI = badge("INCORRECT", "#d81e2c"), bdgC = badge("CORRECT", "#1fa855");
title("YOUR ARMS ARE DEAD BECAUSE OF THIS");
cap("s2", "slides", ["NO GRIP ON THE TANK:", "YOU SLIDE FORWARD"], RED, { y: 0.55 });
cap("s3", "arms", ["ALL YOUR WEIGHT", "ON YOUR ARMS"], RED, { y: 0.55, until: ["s3", "steer"] });
cap("s3", "steer", ["...AND YOU CAN'T STEER"], RED, { y: 0.55, boom: 0.6 });
cap("s4", "knees", ["SQUEEZE THE TANK", "WITH YOUR KNEES"], GREEN, { y: 0.55 });
cap("s5", "stomach", ["CORE TIGHT,", "LEGS HOLD YOU"], GREEN, { y: 0.55 });
cap("s6", "loose", ["ARMS LOOSE,", "EASY STEERING"], GREEN, { y: 0.55 });
endCard(["GRIP WITH YOUR LEGS.", "ARMS LOOSE."]);

// ---------- camera ----------
// ahead/side of the bike along the road, looking back at it (side > 0 = outside / right)
const cam = (sF, oF, ahead, side, up, fov, lookY = 0.9) => ({ cam: (t, su) => { const s = sF(t), o = oF(t), a = ahead - 0.12 * Math.min(su, 3); const [x, z] = P(s + a, o + side), [lx, lz] = P(s, o); return [x, up, z, lx, lookY, lz, fov]; } });
const SH = [
  { at: 0, ...cam(sR, oR, 9, 2.4, 1.6, 30, 1.0) },
  // s2: straight-on front, he slides forward under braking
  { at: T2, calm: 1, ...cam(sR, oR, 6.5, 0.5, 1.55, 28, 1.05) },
  // side view so the slide reads
  { at: tSl - 0.25, ...cam(sR, oR, 0.8, 6.0, 1.3, 30, 0.95) },
  // s3: high over the corner, locked arms, he runs wide into the gravel
  { at: T3 + 0.3, ...cam(sR, oR, 7, -3.5, 2.4, 34, 0.7) },
  // s4: side close-up, knees squeeze the tank
  { at: T4, calm: 1, ...cam(sG, oG, 0.8, 6.0, 1.3, 30, 0.95) },
  // s5: front three-quarter, core and legs
  { at: T5, ...cam(sG, oG, 6.5, 1.6, 1.5, 30, 1.0) },
  // s6: high over the corner, clean turn
  { at: T6, ...cam(sG, oG, 7, -3.5, 2.4, 34, 0.7) },
  { at: T7, calm: 1, ...cam(sG, oG, 9, -2.4, 1.6, 32, 1.0) },
];

const on = (t, a, b = 1e9) => sm(a - 0.1, a + 0.2, t) * (1 - sm(b - 0.15, b, t));
run("w", (t) => {
  const shot = shoot(SH, t); // camera first so hud() sizes against this frame's fov
  const A = t < T4;
  if (A) {
    const k = kD(t), base = leanR(t) + 0.04 * Math.sin(t * 13) * sm(tTurnR, tTurnR + 0.4, t) * (1 - k);
    ride(BR, redPath, t, RED, k > 0 ? { lean: base + k * 1.2, down: k } : { lean: base });
    BR.g.rotation.x = -0.06 * bkR(t);
    const sl = slide(t); BR.rider.position.z = -0.11 * sl; BR.rider.children[0].rotation.x = torsoX - 0.25 * sl;
    if (t > tCr + 0.15) { const v = t - tCr - 0.15, [x, z] = P(sRraw(tCr) + 3 + 5 * sm(0, 1, v), oR(t) + 1 + 1.5 * sm(0, 1, v)); pose(THROWN, { x, z, h: 0.5, lie: sm(0, 0.35, v), armR: 2.4, armL: 1.8, hex: RED }); } else pose(THROWN, { vis: false });
    BG.set(null);
    GR.arms.set(k < 0.5 ? Math.max(0.6 * on(t, g("s1", "arms"), T2), on(t, tSl, tCr + 0.2)) * (0.85 + 0.15 * Math.sin(t * 10)) : 0);
    BR.g.updateMatrixWorld(true); hip.getWorldPosition(wA); grip.getWorldPosition(wB);
    wArrow.set(wA, wB, k < 0.5 ? on(t, tSl - 0.1, T3 + 0.3) : 0);
  } else {
    BR.set(null); pose(THROWN, { vis: false }); wArrow.set(wA, wB, 0);
    ride(BG, greenPath, t, GREEN, {});
    BG.g.rotation.x = -0.05 * bkG(t);
    GG.knee.set(0.55 * on(t, g("s4", "knees") - 0.1, T6 + 0.5)); GG.thighs.set(on(t, g("s4", "squeeze"), T6 + 0.5) * 0.45);
    GG.core.set(on(t, g("s5", "stomach"), T6) * 0.4); GG.shins.set(on(t, g("s5", "legs"), T6) * 0.4);
    GG.arms.set(0.5 * on(t, g("s6", "arms"), T7) * (0.6 + 0.4 * Math.sin(t * 5)));
  }
  hud(bdgI, 0, -0.84, 0.5, A ? 1 : 0); hud(bdgC, 0, -0.84, 0.5, !A && t < T7 ? 1 : 0);
  bloom.strength = 0.9 + 1.0 * shot.punch * shot.punch + overlays(t) + (A ? 0.8 * flash(t, tCr + 0.1) : 0);
});
