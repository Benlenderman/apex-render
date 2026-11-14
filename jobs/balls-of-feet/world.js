// 127 balls-of-feet: wrong = red rider has his feet flat, middle of the boot on the peg, toes hanging low; leaning into the corner his toe hits the road, sparks, the foot is ripped off the peg and the bike goes down (red).
// Right = green rider moves onto the balls of his feet; legs ready, toes tucked up and clear of the road through the same corner (green).
import { THREE, S, g, sm, flash, scene, bloom, glow, box, ORANGE, RED, GREEN, WHITE, hud, beam, shoot, run } from "./kit.js";
import { track, ribbon, buildRoad, makePerson, pose, title, endCard, cap, overlays, bikes, ride } from "./extra.js";

// ---------- props: INCORRECT / CORRECT badge, glowing body-part overlay, sparks ----------
function badge(txt, css) {
  const c = document.createElement("canvas"); c.width = 1024; c.height = 256; const x = c.getContext("2d");
  x.font = "900 130px Inter, Arial, sans-serif"; const w = Math.min(1024, x.measureText(txt).width + 80);
  x.fillStyle = css; x.beginPath(); x.roundRect((1024 - w) / 2, 38, w, 180, 18); x.fill();
  x.fillStyle = "#fff"; x.textBaseline = "middle"; x.textAlign = "center"; x.fillText(txt, 512, 132, 960);
  const m = new THREE.Mesh(new THREE.PlaneGeometry(2, 0.5), new THREE.MeshBasicMaterial({ map: new THREE.CanvasTexture(c), color: 0xb8b8b8, transparent: true, toneMapped: false, depthWrite: false, depthTest: false, fog: false }));
  m.renderOrder = 22; m.userData.w = 2; m.visible = false; scene.add(m); return m;
}
function glowParts(B, idx, hex) {
  const m = glow(hex, 0); m.transparent = true; m.blending = THREE.AdditiveBlending; m.depthWrite = false;
  const os = idx.map((i) => { const c = B.rider.children[i], o = new THREE.Mesh(c.geometry, m); o.scale.setScalar(1.15); c.add(o); return o; });
  return { set(a, hx = hex) { os.forEach((o) => (o.visible = a > 0.01)); m.color.set(hx).multiplyScalar(1.6 * a); } };
}
// deterministic spark spray from a point on the road
function sparks(n) {
  const m = glow(ORANGE, 2.5), os = [];
  for (let i = 0; i < n; i++) { const o = box(0.025, 0.025, 0.12, 0, 0, 0, m, false); o.visible = false; scene.add(o); os.push(o); }
  return { set(p, h, t, a) {
    os.forEach((o, i) => {
      o.visible = a > 0.01; if (!o.visible) return;
      const u = ((t * 7 + i * 0.137) % 1), sd = Math.sin(i * 12.9898) * 0.6;
      o.position.set(p.x + Math.sin(h) * u * 0.9 + Math.cos(h) * sd * u * 0.5, 0.02 + 0.25 * u * (1 - u) * (1 + (i % 3)), p.z + Math.cos(h) * u * 0.9 - Math.sin(h) * sd * u * 0.5);
      o.rotation.set(0, h + sd, 0); o.scale.setScalar(a * (1 - u));
    });
  } };
}

// ---------- track: straight, then a left-hander ----------
const LW = 3.6, SIN = 90, ARC = 50, RC = 22;
const { P } = track([{ len: SIN }, { len: ARC, R: RC }, { len: 400 }]);
buildRoad(P, 0, 320, { LW, lamps: false });
const mK = [glow(RED, 1.0), glow(WHITE, 0.55)];
for (let s = SIN - 4, i = 0; s < SIN + ARC + 4; s += 1.6, i++) ribbon(P, -LW - 1.1, -LW - 0.45, s, s + 1.6, mK[i % 2], 0.015, 0.4);
scene.fog.density = 0.016;
const lineO = (s) => 1.5 - 3.3 * Math.sin(Math.PI * Math.min(1, Math.max(0, (s - SIN) / ARC)));

const T2 = S.s2[0], T3 = S.s3[0], T4 = S.s4[0], T5 = S.s5[0], T6 = S.s6[0], T7 = S.s7[0];
const [BR, BG] = bikes(2), THROWN = makePerson();
[BR, BG].forEach((B) => B.hlight.material.color.multiplyScalar(0.25));
const V = 12, EXTRA = 0.09; // same speed and lean for both riders; only the feet differ

// ---- red: feet flat, toes low; toe hits the road in the corner, foot ripped off, down ----
const tTurnR = g("s3", "lean") + 0.25, tHit = g("s3", "hit") - 0.15, tCr = g("s3", "road") + 0.05;
const sR = (t) => (t < tCr ? SIN + V * (t - tTurnR) : SIN + V * (tCr - tTurnR) + 7 * 0.55 * (1 - Math.exp(-(t - tCr) / 0.55)));
const oR = (t) => lineO(Math.min(sR(t), SIN + 8)) + 1.6 * sm(tCr, tCr + 1, t);
const redPath = (t) => P(sR(t), oR(t));
const kD = (t) => sm(tCr, tCr + 0.35, t);

// ---- green: moves onto the balls of his feet, same corner, toes clear ----
const tTurnG = g("s5", "and"), tShift = g("s4", "stand"), tBalls = g("s4", "balls") + 0.1;
const sG = (t) => SIN + V * (t - tTurnG);
const oG = (t) => lineO(sG(t));
const greenPath = (t) => P(sG(t), oG(t));

// foot placement: flat = middle of the boot on the peg, toe hanging; balls = boot back, ball on the peg, toe up off the road
const FLAT = { y: 0.557, z: 0.05, rx: -0.55 }, BALL = { y: 0.41, z: 0.18, rx: -0.1 };
function feet(B, k) { for (const i of [8, 9]) { const f = B.rider.children[i]; f.position.y = FLAT.y + (BALL.y - FLAT.y) * k; f.position.z = FLAT.z + (BALL.z - FLAT.z) * k; f.rotation.x = FLAT.rx + (BALL.rx - FLAT.rx) * k; } }
const toe = (B) => { const o = new THREE.Object3D(); o.position.set(-0.03, -0.04, -0.12); B.rider.children[8].add(o); return o; };
const toeR = toe(BR), toeG = toe(BG);

const GR = { feet: glowParts(BR, [8, 9], RED) };
const GG = { feet: glowParts(BG, [8, 9], GREEN), legs: glowParts(BG, [2, 3, 6, 7], GREEN) };
const SP = sparks(14);
const gap = beam(GREEN, 2.2, 0.025); gap.material.depthTest = false; gap.renderOrder = 9;
const tp = new THREE.Vector3(), tg = new THREE.Vector3();

const bdgI = badge("INCORRECT", "#d81e2c"), bdgC = badge("CORRECT", "#1fa855");
title("WHERE YOUR FEET SIT MATTERS");
cap("s2", "middle", ["MIDDLE OF THE BOOT", "ON THE PEG"], RED, { y: 0.55, until: ["s2", "toes"] });
cap("s2", "toes", ["TOES HANG LOW"], RED, { y: 0.55 });
cap("s3", "toes", ["TOES HIT THE ROAD"], RED, { y: 0.55, boom: 0.7 });
cap("s4", "balls", ["BALLS OF YOUR FEET", "ON THE PEGS"], GREEN, { y: 0.55 });
cap("s5", "legs", ["LEGS READY,", "FASTER REACTIONS"], GREEN, { y: 0.55, until: ["s5", "toes"] });
cap("s5", "toes", ["TOES CLEAR", "OF THE ROAD"], GREEN, { y: 0.55 });
cap("s6", "ready", ["READY TO MOVE,", "NOT RESTING"], GREEN, { y: 0.55 });
endCard(["BALLS OF YOUR FEET.", "ALWAYS READY."]);

// ---------- camera ----------
// ahead/side of the bike along the road, looking back at it (side < 0 = left / inside of the corner)
const cam = (sF, oF, ahead, side, up, fov, lookY = 0.9) => ({ cam: (t, su) => { const s = sF(t), o = oF(t), a = ahead - 0.12 * Math.min(su, 3); const [x, z] = P(s + a, o + side), [lx, lz] = P(s, o); return [x, up, z, lx, lookY, lz, fov]; } });
const SH = [
  { at: 0, ...cam(sR, oR, 9, 2.4, 1.6, 30, 1.0) },
  // low on the left, the boot on the peg
  { at: g("s1", "pegs") - 0.1, calm: 1, ...cam(sR, oR, 1.2, -5.5, 0.9, 30, 0.55) },
  // s3: low on the inside of the corner, the toe touches down
  { at: T3 + 0.1, ...cam(sR, oR, 8, -5.5, 1.3, 32, 0.4) },
  // s4: green, same low boot shot; he moves onto the balls of his feet
  { at: T4, ...cam(sG, oG, 1.2, -5.5, 0.9, 30, 0.55) },
  // s5: front three-quarter, legs ready
  { at: T5, ...cam(sG, oG, 6.5, 1.8, 1.4, 30, 0.8) },
  // toes clear in the corner
  { at: g("s5", "and") - 0.1, ...cam(sG, oG, 8, -5.5, 1.3, 32, 0.4) },
  { at: T6, calm: 1, ...cam(sG, oG, 7.5, -2.4, 1.5, 32, 0.8) },
  { at: T7, calm: 1, ...cam(sG, oG, 9, 2.0, 1.6, 32, 1.0) },
];

const on = (t, a, b = 1e9) => sm(a - 0.1, a + 0.2, t) * (1 - sm(b - 0.15, b, t));
run("w", (t) => {
  const shot = shoot(SH, t);
  const A = t < T4;
  if (A) {
    const k = kD(t);
    const st = ride(BR, redPath, t, RED, k > 0 ? { lean: EXTRA + k * 1.2, down: k } : { lean: EXTRA });
    feet(BR, 0);
    // toe touching down pulls the foot back off the peg just before the fall
    if (t > tHit) BR.rider.children[8].rotation.x = FLAT.rx - 0.5 * sm(tHit + 0.4, tCr, t);
    if (t > tCr + 0.15) { const v = t - tCr - 0.15, [x, z] = P(sR(tCr) + 2 + 4 * sm(0, 1, v), oR(t) + 1 + 1.4 * sm(0, 1, v)); pose(THROWN, { x, z, h: 0.4, lie: sm(0, 0.35, v), armR: 2.4, armL: 1.8, hex: RED }); } else pose(THROWN, { vis: false });
    BG.set(null);
    GR.feet.set(k < 0.5 ? Math.max(on(t, g("s1", "feet"), T2 - 0.3) * 0.6, on(t, T2, tCr)) * (0.85 + 0.15 * Math.sin(t * 10)) : 0);
    BR.g.updateMatrixWorld(true); toeR.getWorldPosition(tp);
    SP.set(tp, st ? st.h : 0, t, k < 0.6 ? on(t, tHit, tCr + 0.25) : 0);
    gap.set(tp, tp, 0);
  } else {
    BR.set(null); pose(THROWN, { vis: false });
    ride(BG, greenPath, t, GREEN, { lean: EXTRA });
    feet(BG, sm(tShift, tBalls, t));
    GG.feet.set(on(t, tShift - 0.1, T6 + 0.6) * (0.75 + 0.25 * Math.sin(t * 6)));
    GG.legs.set(0.4 * on(t, g("s5", "legs"), g("s5", "toes")) + 0.3 * on(t, g("s6", "ready"), T7));
    SP.set(tp, 0, t, 0);
    BG.g.updateMatrixWorld(true); toeG.getWorldPosition(tp); tg.set(tp.x, 0.01, tp.z);
    gap.set(tg, tp, on(t, g("s5", "toes"), T6));
  }
  hud(bdgI, 0, -0.84, 0.5, A && t > 0.9 ? 1 : 0); hud(bdgC, 0, -0.84, 0.5, !A && t < T7 ? 1 : 0);
  bloom.strength = 0.9 + 1.0 * shot.punch * shot.punch + overlays(t) + (A ? 0.8 * flash(t, tCr + 0.1) : 0);
});
