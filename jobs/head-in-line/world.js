// 124 head-in-line: wrong = red rider hangs his hips off but his head stays over the bike's centre line, so the bike leans more and he has no grip to spare; a sandy patch and the front tucks (red).
// Right = green rider moves hips, chest and head together in one line; same corner, same speed, less lean, grip left for the same patch (green).
import { THREE, S, g, sm, flash, scene, camera, bloom, glow, box, VIOLET, ORANGE, RED, GREEN, WHITE, hud, patch, beam, pathState, shoot, run } from "./kit.js";
import { track, ribbon, buildRoad, makePerson, pose, title, endCard, cap, overlays, bikes, ride, tag, tagAt } from "./extra.js";

// ---------- props: INCORRECT / CORRECT badge, screen bars, glowing joint dot ----------
function badge(txt, css) {
  const c = document.createElement("canvas"); c.width = 1024; c.height = 256; const x = c.getContext("2d");
  x.font = "900 130px Inter, Arial, sans-serif"; const w = Math.min(1024, x.measureText(txt).width + 80);
  x.fillStyle = css; x.beginPath(); x.roundRect((1024 - w) / 2, 38, w, 180, 18); x.fill();
  x.fillStyle = "#fff"; x.textBaseline = "middle"; x.textAlign = "center"; x.fillText(txt, 512, 132, 960);
  const m = new THREE.Mesh(new THREE.PlaneGeometry(2, 0.5), new THREE.MeshBasicMaterial({ map: new THREE.CanvasTexture(c), color: 0xb8b8b8, transparent: true, toneMapped: false, depthWrite: false, depthTest: false, fog: false }));
  m.renderOrder = 22; m.userData.w = 2; m.visible = false; scene.add(m); return m;
}
function bar(hex) {
  const m = new THREE.Mesh(new THREE.PlaneGeometry(1, 0.022), new THREE.MeshBasicMaterial({ color: new THREE.Color(hex).multiplyScalar(0.8), transparent: true, toneMapped: false, depthWrite: false, depthTest: false, fog: false }));
  m.renderOrder = 22; m.userData.w = 1; m.visible = false; scene.add(m); return m;
}
function dot(hex) {
  const m = glow(hex, 0), o = new THREE.Mesh(new THREE.SphereGeometry(0.07, 14, 10), m); m.depthTest = false; o.renderOrder = 9; scene.add(o);
  return { o, set(p, a, hx = hex) { o.position.copy(p); o.visible = a > 0.01; m.color.set(hx).multiplyScalar(1.3 * a); } };
}

// ---------- track: one long left-hand corner, kerbs on the inside ----------
const R = 30, LW = 3.6, V = 13, O = -1.2; // riding line in the inner half
const { P } = track([{ len: 60 }, { len: 400, R }]);
buildRoad(P, 0, 260, { LW, lamps: false });
const mK = [glow(RED, 1.0), glow(WHITE, 0.55)];
for (let s = 50, i = 0; s < 260; s += 1.6, i++) ribbon(P, -LW - 1.1, -LW - 0.45, s, s + 1.6, mK[i % 2], 0.015, 0.4);
scene.fog.density = 0.02;

const T2 = S.s2[0], T3 = S.s3[0], T4 = S.s4[0], T5 = S.s5[0], T6 = S.s6[0], T7 = S.s7[0];
const S0 = 70; // already in the corner at t=0
const line = (o, ds = 0) => (t) => P(S0 + V * t + ds, o);
const [BR, BG] = bikes(2), THROWN = makePerson();

// ---- body positions on the bike (rider-group space, inside of a left corner = -x) ----
// red: hips off, torso tilted back up, head pulled back over the centre line
function bodyRed(B) {
  const r = B.rider, ch = r.children;
  r.position.x = -0.3; r.rotation.z = 0;
  ch[0].rotation.z = -0.32; ch[1].position.x = 0.3; ch[1].rotation.z = -0.1;
  ch[10].position.x = -0.39 + 0.3; ch[11].position.x = 0.39 + 0.3; // hands stay on the grips
  ch[4].position.x = 0.12; ch[5].position.x = 0.12;
}
// green: hips, chest and head all moved inside, one line
function bodyGreen(B) {
  const r = B.rider, ch = r.children;
  r.position.x = -0.16; r.rotation.z = 0.2;
  ch[1].position.x = -0.06;
  ch[10].position.x = -0.39 + 0.22; ch[11].position.x = 0.39 + 0.22;
  ch[4].position.x = 0.1; ch[5].position.x = 0.1;
}
bodyRed(BR); bodyGreen(BG);
const EXTRA = { red: 0.14, green: -0.12 }; // lean added on top of the physics lean

// markers on hips / chest / head + the bike's centre line
function marks(B) {
  const hip = new THREE.Object3D(); hip.position.set(0, 0.97, 0.16); B.rider.add(hip);
  const chest = new THREE.Object3D(); chest.position.set(0, 0.16, 0); B.rider.children[0].add(chest);
  const head = new THREE.Object3D(); head.position.set(0, 0.04, -0.04); B.headG.add(head);
  const cl = new THREE.Mesh(new THREE.BoxGeometry(0.03, 2.3, 0.03), new THREE.MeshBasicMaterial({ color: new THREE.Color(WHITE).multiplyScalar(1.4), toneMapped: false, transparent: true, depthWrite: false }));
  cl.position.set(0, 1.15, 0.05); cl.renderOrder = 7; B.lean.add(cl);
  return { hip, chest, head, cl };
}
const MR = marks(BR), MG = marks(BG);
[BR, BG].forEach((B) => B.hlight.material.color.multiplyScalar(0.2)); // headlight glare hid the rider in front shots
const noDepth = (b) => { b.material.depthTest = false; b.renderOrder = 8; return b; };
const dR = [dot(RED), dot(RED), dot(RED)], dG = [dot(GREEN), dot(GREEN), dot(GREEN)];
const bR = [beam(RED, 1.2, 0.03), beam(RED, 1.2, 0.03)].map(noDepth), bG = [beam(GREEN, 1.1, 0.03), beam(GREEN, 1.1, 0.03)].map(noDepth);
const vH = new THREE.Vector3(), vC = new THREE.Vector3(), vD = new THREE.Vector3();
function drawLine(M, dots, beams, a, aCl, hot) {
  M.hip.getWorldPosition(vH); M.chest.getWorldPosition(vC); M.head.getWorldPosition(vD);
  [vH, vC, vD].forEach((v, i) => dots[i].set(v, a * (i === 2 ? 1 + hot : 1)));
  beams[0].set(vH, vC, a); beams[1].set(vC, vD, a);
  M.cl.visible = aCl > 0.01; M.cl.material.opacity = 0.7 * aCl;
}

// ---- red: sandy patch at the apex of s3, the front tucks, bike slides out ----
const tHit = g("s3", "less") + 0.1;
const sHit = S0 + V * tHit;
const uH = (t) => Math.max(0, t - tHit);
const sR = (t) => (t < tHit ? S0 + V * t : sHit + V * 0.7 * (1 - Math.exp(-uH(t) / 0.7)));
const redPath = (t) => P(sR(t), O + 3.2 * sm(tHit, tHit + 1.2, t));
const kD = (t) => sm(tHit + 0.05, tHit + 0.4, t);
const sand = patch(1.6, 2.2, ORANGE, 1.3), sand2 = patch(1.6, 2.2, ORANGE, 1.3);
const placeSand = (m, s) => { const [x, z] = P(s, O), [x2, z2] = P(s + 1, O); m.position.set(x, 0.03, z); m.rotation.z = Math.atan2(x2 - x, z2 - z); };
placeSand(sand, sHit + 0.2);
const tSur = g("s6", "surprise"), sSur = S0 + V * tSur;
placeSand(sand2, sSur + 0.2);

// lean readouts
const leanTag = (hex) => { const c = document.createElement("canvas"); return { hex, m: null }; };
const LT = {};
const degTag = (key, deg, hex) => { const k = key + deg; if (!LT[k]) LT[k] = tag(`${deg}°`, hex); return LT[k]; };
const allTags = () => Object.values(LT);

const bdgI = badge("INCORRECT", "#d81e2c"), bdgC = badge("CORRECT", "#1fa855");
const barRt = bar(RED), barRb = bar(RED), barGt = bar(GREEN), barGb = bar(GREEN);

title("YOUR HIPS MOVED, YOUR HEAD DIDN'T");
cap("s2", "hangs", ["HIPS OFF THE SEAT..."], RED, { y: 0.3, until: ["s2", "head"] });
cap("s2", "head", ["...BUT THE HEAD STAYS", "IN THE MIDDLE"], RED, { y: 0.3 });
cap("s3", "more", ["MORE LEAN,", "LESS GRIP TO SPARE"], RED, { y: 0.3, boom: 0 });
cap("s4", "hips", ["HIPS, CHEST, HEAD", "ALL IN ONE LINE"], GREEN, { y: 0.3 });
cap("s5", "same", ["SAME CORNER, SAME SPEED", "LESS LEAN"], GREEN, { y: 0.3 });
cap("s6", "less", ["LESS LEAN =", "GRIP LEFT FOR A SURPRISE"], GREEN, { y: 0.3 });
endCard(["HIPS. CHEST. HEAD.", "ALL IN ONE LINE."]);

const Bf = (fn) => (t) => pathState(fn, t);
// chase cam built straight from the track (behind the bike along the road, slight dolly in)
const sG = (t) => S0 + V * t;
const chase = (sF, o, back, up, side = 0.1, fov = 38, ahead = 0.6, lookY = 1.0) => ({ cam: (t, su) => { const s = sF(t), b = back - 0.12 * Math.min(su, 3); const [x, z] = P(s - b, o + side), [lx, lz] = P(s + ahead, o - 0.15); return [x, up, z, lx, lookY, lz, fov]; } });
// front three-quarter from the outside of the corner, like a trackside long lens
const front = (sF, o, ahead, side, up = 1.25, fov = 30, lookY = 0.95) => ({ cam: (t, su) => { const s = sF(t), a = ahead - 0.15 * Math.min(su, 3); const [x, z] = P(s + a, o + side), [lx, lz] = P(s, o - 0.35); return [x, up, z, lx, lookY, lz, fov]; } });
const SH = [
  { at: 0, ...front((t) => sR(Math.min(t, tHit)), O, 12, 3.2, 1.5, 30) },
  { at: T2, calm: 1, ...front((t) => sR(Math.min(t, tHit)), O, 10, 2.8, 1.4, 28) },
  // s3: wider from behind-outside, lean angle, then the front tucks on the sand
  { at: T3, cam: (t) => { const [x, z] = P(S0 + V * Math.min(t, tHit + 0.3) - 7, O + 2.2), [lx, lz] = P(S0 + V * Math.min(t, tHit + 0.3) + 2, O + 0.6); return [x, 2.2, z, lx, 0.7, lz, 44]; } },
  { at: T4, ...front(sG, O, 10, 2.8, 1.4, 28) },
  // s5: wider rear, both riders side by side (red ghost on the outside)
  { at: T5, calm: 1, ...chase(sG, O + 0.9, 7.4, 2.0, 0, 44, 1.5) },
  // s6: green over the same kind of patch
  { at: T6, ...chase(sG, O, 4.8, 2.0, 0.6, 40, 3, 0.7) },
  { at: T7, calm: 1, ...front(sG, O, 10, 2.8, 1.4, 28) },
];

const on = (t, a, b = 1e9) => sm(a - 0.1, a + 0.2, t) * (1 - sm(b - 0.15, b, t));
const deg = (r) => Math.round(Math.abs(r) * 57.3);
run("w", (t) => {
  const A = t < T4, showRed = A || (t >= T5 && t < T6);
  allTags().forEach((m) => (m.visible = false));
  // red bike
  let sr = null;
  if (showRed) {
    const fn = A ? redPath : line(O + 1.9, -0.5), k = A ? kD(t) : 0, s0 = pathState(fn, t);
    sr = ride(BR, fn, t, RED, k > 0 ? { lean: EXTRA.red + k * (1.45 - s0.lean - EXTRA.red), down: k } : { lean: EXTRA.red });
    if (A && t > tHit + 0.2) { const u = t - tHit - 0.2, [x, z] = P(sHit + 2 + 6 * sm(0, 1.0, u), O + 1.2 + 2.6 * sm(0, 1.0, u)); pose(THROWN, { x, z, h: 0.9, lie: sm(0, 0.35, u), armR: 2.4, armL: 1.8, hex: RED }); } else pose(THROWN, { vis: false });
  } else { BR.set(null); pose(THROWN, { vis: false }); }
  // green bike (lean wobble on the patch in s6)
  let sg = null;
  if (!A) { const wob = 0.07 * Math.sin((t - tSur) * 18) * Math.exp(-Math.max(0, t - tSur) * 4) * (t > tSur ? 1 : 0); sg = ride(BG, line(O), t, GREEN, { lean: EXTRA.green + wob }); }
  else BG.set(null);
  BR.g.updateMatrixWorld(true); BG.g.updateMatrixWorld(true);
  // body line + centre line highlights
  if (showRed && kD(t) < 0.3) {
    const a = A ? on(t, g("s2", "hips"), tHit) : on(t, T5 + 0.3, T6);
    drawLine(MR, dR, bR, a, A ? on(t, g("s2", "middle") - 0.2, tHit) : a, A ? 1.5 * on(t, g("s2", "head"), T3) : 0);
  } else drawLine(MR, dR, bR, 0, 0, 0);
  if (!A) {
    const a = Math.max(on(t, g("s4", "hips")), 0), hot = 0.8 * flash(t, g("s4", "line"));
    drawLine(MG, dG, bG, a, t >= T5 && t < T6 ? on(t, T5 + 0.3, T6) : 0, hot);
    [vH, vC, vD].forEach(() => {});
    // reveal the dots one by one on their words in s4
    if (t < T5) { const w = ["hips", "chest", "head"].map((x) => sm(g("s4", x) - 0.1, g("s4", x) + 0.15, t)); dG.forEach((d, i) => d.set(d.o.position, w[i])); bG[0].visible = w[1] > 0.01 && bG[0].visible; bG[1].visible = w[2] > 0.01 && bG[1].visible; }
  } else drawLine(MG, dG, bG, 0, 0, 0);
  // lean angle readouts
  if (sr && t >= T3 && t < tHit - 0.05) tagAt(degTag("r", deg(sr.lean), RED), sr.x, 2.5, sr.z, on(t, g("s3", "lean"), tHit), 0.9);
  if (sr && t >= T5 && t < T6) hud(degTag("rh", deg(sr.lean), RED), 0.45, -0.3, 0.22, on(t, g("s5", "leans") - 0.3, T6));
  if (sg && t >= T5 && t < T6) hud(degTag("gh", deg(sg.lean), GREEN), -0.45, -0.3, 0.22, on(t, g("s5", "leans") - 0.3, T6));
  // sand patches
  sand.set(A ? on(t, g("s3", "needs") - 0.2, T4) * (0.7 + 0.3 * Math.sin(t * 9)) : 0);
  sand2.set(t >= T6 && t < T7 ? on(t, g("s6", "grip"), T7) * (0.7 + 0.3 * Math.sin(t * 9)) : 0);
  // INCORRECT / CORRECT frame
  const aI = A ? 1 - sm(T7 + 10, T7 + 11, t) : 0, aC = !A && t < T7 ? 1 : 0;
  hud(bdgI, 0, -0.84, 0.5, aI); hud(bdgC, 0, -0.84, 0.5, aC);
  const shot = shoot(SH, t);
  bloom.strength = 0.9 + 1.0 * shot.punch * shot.punch + overlays(t) + (A ? 0.8 * flash(t, tHit + 0.1) : 0);
});
