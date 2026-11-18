// 152 100-riders: a stream of riders through one left-hander. Rider 61 (red) looks at the outside edge, stands the bike up,
// runs wide into the gravel with lean to spare. Sent again (green): eyes on the exit, a little more lean, rolls out clean.
import { THREE, S, g, sm, flash, scene, bloom, glow, hud, patch, beam, VIOLET, ORANGE, RED, GREEN, WHITE, mSolid, pathState, shoot, run } from "./kit.js";
import { track, ribbon, buildRoad, title, endCard, cap, overlays, bikes, ride, downLean, dist, tag, tagAt, END } from "./extra.js";

scene.fog.density = 0.018; // wide shots of the whole corner need to see 40 m

// ---- timing ----
const T2 = S.s2[0], T3 = S.s3[0], T4 = S.s4[0], T5 = S.s5[0], T6 = S.s6[0], T7 = S.s7[0], TE = END("s8");
const tEach = g("s1", "each"), tNoth = g("s2", "nothing");
const tLook = g("s3", "looks"), tGoes = g("s4", "goes"), tStand = g("s4", "stands"), tWide = g("s4", "wide"), tGrav = g("s4", "gravel");
const tStill = g("s5", "still"), tStop = g("s5", "stopped");
const tLook6 = g("s6", "looks"), tLeans = g("s6", "leans"), tRolls = g("s6", "rolls");
const on = (t, a, b = 1e9) => sm(a - 0.1, a + 0.2, t) * (1 - sm(b - 0.15, b, t));

// ---- the corner: 120 m straight, 90 degree left-hander R35, long exit. Gravel outside the bend (right) ----
const SC = 120, LW = 3.6, v3 = (x, y, z) => new THREE.Vector3(x, y, z);
const { C, P } = track([{ len: SC }, { len: 55, R: 35 }, { len: 500 }]);
buildRoad(P, -80, SC + 400, { LW, lamps: true, gaps: [[SC + 8, SC + 56, 1]] });
ribbon(P, LW + 0.2, 12, SC + 8, SC + 56, new THREE.MeshStandardMaterial({ color: 0x4a3a26, emissive: 0x241a0e, roughness: 1 }), 0.006);
{
  const N = 700, im = new THREE.InstancedMesh(new THREE.DodecahedronGeometry(0.08, 0), glow(0xd9b27a, 0.8), N), M = new THREE.Matrix4();
  let sd = 7; const rnd = () => (sd = (sd * 16807) % 2147483647) / 2147483647; // seeded: every frame must see the same stones
  for (let i = 0; i < N; i++) { const [x, z] = P(SC + 9 + 46 * rnd(), LW + 0.5 + 11 * rnd() ** 1.5); M.makeScale(0.6 + rnd(), 0.5 + 0.5 * rnd(), 0.6 + rnd()); M.setPosition(x, 0.04, z); im.setMatrixAt(i, M); }
  scene.add(im);
}

// ---- the stream: riders 14 m apart at 14 m/s, pooled bikes loop through a window around the corner ----
const NS = 14, GAP = 1.0, VS = 14, sStream = (en) => (t) => { const [x, z] = P(SC + VS * (t - en), 1.8); return [x, z]; };
// ---- rider 61, first run (red): slow motion from the corner on, drifts to the outside, stops in the gravel ----
const tIn = tLook - 0.1;
const vH = (t) => (16 - 9.5 * sm(tIn - 0.5, tIn + 0.4, t)) * (1 - sm(tGrav - 0.6, tGrav + 0.6, t));
const DH = dist(vH, T3 - 1, tGrav + 2), sH = (u) => SC + DH(u) - DH(tIn);
const sA = sH(tGoes), sB = sH(tGrav + 2) + 1, oH = (s) => 1.8 + 5.6 * sm(sA, sB, s);
const hPath = (u) => { const s = sH(u), [x, z] = P(s, oH(s)); return [x, z, C(s)[2] - Math.atan((oH(s + 0.5) - oH(s - 0.5)))]; };
const leanH = (u) => 0.5 * sm(tIn - 0.5, tIn + 0.4, u) * (1 - 0.85 * sm(tStand - 0.3, tStand + 0.5, u)); // left = +
const uRep = (t) => tIn + (t - T5 - 0.6) * 1.38; // s5 replay of the corner entry
const stopP = hPath(tGrav + 2), stopSt = { x: stopP[0], z: stopP[1], h: stopP[2] };
const edge = P(SC + 25, LW + 0.2);
// ---- rider 61, second run (green): same speed, real time, a touch wide at entry then tightens on "leans" ----
const tGIn = tLook6 + 0.3, sG = (t) => SC + 16 * (t - tGIn);
const gPath = (t) => { const [x, z] = P(sG(t), 1.8 + 0.9 * sm(tGIn, tLeans, t) - 1.1 * sm(tLeans, tLeans + 1.0, t)); return [x, z]; };
const exitP = P(SC + 60, 1.8);

// ---- props ----
const pool = bikes(NS), [Bh, Bg] = bikes(2);
// rider 61 must read at a glance: his suit and visor take the run's colour (the kit only colours the trail)
const suit = (B, hex) => { const m = mSolid.clone(); m.color.set(hex); if (m.emissive) m.emissive.set(hex).multiplyScalar(0.4); B.rider.traverse((o) => { if (o.material === mSolid) o.material = m; }); B.visor.material = glow(hex, 2.4); };
suit(Bh, RED); suit(Bg, GREEN);
const hit = patch(3.2, 2.0, RED, 1.6), mkR = patch(2.6, 2.6, RED, 1.8), mkG = patch(2.2, 2.2, GREEN, 1.2);
const eyeR = beam(RED, 3, 0.07), eyeG = beam(GREEN, 2.2, 0.07);
const tExit = tag("EXIT", GREEN, 1.6), tRep = tag("REPLAY", WHITE, 1.1);
// panel: rider counter + one bar (speed or lean). zone = green "still left" part, tick = last run's mark
function makePanel() {
  const c = document.createElement("canvas"); c.width = 640; c.height = 300; const x = c.getContext("2d"), tex = new THREE.CanvasTexture(c);
  const m = new THREE.Mesh(new THREE.PlaneGeometry(1, 300 / 640), new THREE.MeshBasicMaterial({ map: tex, color: new THREE.Color(0.62, 0.62, 0.62), transparent: true, toneMapped: false, depthWrite: false, depthTest: false, fog: false }));
  m.renderOrder = 25; m.userData.w = 1; m.visible = false; scene.add(m);
  let last = "";
  m.draw = (head, lab, frac, hex, zone = 0, tick = 0) => {
    frac = Math.round(frac * 100) / 100; const key = JSON.stringify([head, lab, frac, hex, zone, tick]); if (key === last) return; last = key;
    const col = "#" + new THREE.Color(hex).getHexString(), X0 = 40, BW = 560, Y0 = 190, BH = 62;
    x.clearRect(0, 0, 640, 300);
    x.fillStyle = "rgba(14,12,40,0.88)"; x.beginPath(); x.roundRect(8, 8, 624, 284, 34); x.fill(); x.strokeStyle = col; x.lineWidth = 6; x.stroke();
    x.textBaseline = "middle"; x.textAlign = "left";
    x.fillStyle = "#fff"; x.font = "900 64px Inter, Arial, sans-serif"; x.fillText(head, X0, 66);
    x.fillStyle = "#a8a4c8"; x.font = "900 38px Inter, Arial, sans-serif"; x.fillText(lab, X0, 148);
    x.fillStyle = "rgba(168,164,200,0.18)"; x.fillRect(X0, Y0, BW, BH);
    x.fillStyle = col; x.fillRect(X0, Y0, BW * frac, BH);
    if (zone > frac) {
      x.fillStyle = "rgba(60,255,140,0.3)"; x.fillRect(X0 + BW * frac, Y0, BW * (zone - frac), BH);
      x.strokeStyle = "#3cff8c"; x.lineWidth = 5; x.strokeRect(X0 + BW * frac, Y0, BW * (zone - frac), BH);
      x.fillStyle = "#3cff8c"; x.font = "900 34px Inter, Arial, sans-serif"; x.textAlign = "right"; x.fillText("STILL LEFT", X0 + BW, 148);
    }
    if (tick) { x.fillStyle = "#ff4a5a"; x.fillRect(X0 + BW * tick - 4, Y0 - 12, 8, BH + 24); x.font = "900 30px Inter, Arial, sans-serif"; x.textAlign = "right"; x.fillText("LAST TIME", X0 + BW, 148); }
    tex.needsUpdate = true;
  };
  return m;
}
const PN = makePanel();

title("100 RIDERS. ONE CORNER.");
cap("s2", "first", "60 RIDERS THROUGH", VIOLET, { until: ["s2", "nothing"] });
cap("s2", "nothing", ["NOTHING", "HAPPENS"], VIOLET);
cap("s3", "rider", ["RIDER 61", "FEELS FAST"], RED, { until: ["s3", "looks"] });
cap("s3", "looks", ["EYES ON THE", "OUTSIDE EDGE"], RED);
cap("s4", "bike", ["THE BIKE GOES", "WHERE HE LOOKS"], RED, { until: ["s4", "stands"] });
cap("s4", "stands", "STANDS IT UP", RED, { until: ["s4", "wide"] });
cap("s4", "wide", "RUNS WIDE", RED, { until: ["s4", "gravel"] });
cap("s4", "gravel", ["INTO THE", "GRAVEL"], RED, { boom: 0.6 });
cap("s5", "strange", ["THE STRANGE", "PART"], ORANGE, { until: ["s5", "still"] });
cap("s5", "still", ["LEAN ANGLE", "STILL LEFT"], GREEN, { until: ["s5", "stopped"] });
cap("s5", "stopped", ["HE STOPPED", "USING IT"], RED);
cap("s6", "send", ["RIDER 61.", "AGAIN."], GREEN, { until: ["s6", "same"] });
cap("s6", "same", "SAME BIKE", WHITE, { until: ["s6", "same"], untilN: 2 });
cap("s6", "same", "SAME SPEED", WHITE, { n: 2, until: ["s6", "time"] });
cap("s6", "looks", ["EYES ON", "THE EXIT"], GREEN, { until: ["s6", "leans"] });
cap("s6", "leans", ["A LITTLE", "MORE LEAN"], GREEN, { until: ["s6", "rolls"] });
cap("s6", "rolls", ["ROLLS OUT", "CLEAN"], GREEN);
endCard(["SAME SPEED.", "DIFFERENT EYES."]);

// ---- shots (offsets local to the anchor's heading; world = absolute coordinates) ----
const fol = (fn) => (t) => pathState(fn, t), world = () => ({ x: 0, z: 0, h: 0 });
const hero = (t) => pathState(t >= T5 ? (tt) => hPath(uRep(tt)) : hPath, t);
const SH = [
  { at: 0, f: fol(sStream(2)), K: [[0, [0.6, 2.2, 5.5, 0, 1.0, -4, 50]], [tEach, [0.3, 2.7, 6.5, 0, 1.0, -4, 50]]] },
  { at: tEach - 0.1, f: world, noRot: true, K: [[0, [5, 11, -SC - 42, -5, 0, -SC - 10, 50]], [T2 - tEach + 0.1, [2, 12.5, -SC - 45, -5, 0, -SC - 10, 50]]] },
  { at: T2, f: fol(sStream(5)), K: [[0, [-3.4, 3.4, -7.5, 0, 0.8, 8, 50]], [T3 - T2, [-4.0, 3.9, -6.5, 0, 0.8, 8, 50]]] },
  { at: T3, f: hero, K: [[0, [0.0, 2.0, 5.0, 0, 1.1, -4, 50]], [tLook - 0.15 - T3, [0.0, 1.9, 4.2, 0, 1.1, -4, 50]]] },
  { at: tLook - 0.15, f: hero, K: [[0, [-1.6, 2.6, 3.4, 2.0, 0.8, -8, 50]], [T4 - tLook + 0.15, [-1.9, 2.9, 3.9, 2.0, 0.8, -8, 50]]] },
  { at: T4, f: hero, K: [[0, [0.0, 6.0, 6.5, 0.8, 0, -6, 50]], [tWide - 0.1 - T4, [-0.5, 7.0, 7.5, 0.8, 0, -5, 50]]] },
  { at: tWide - 0.1, f: () => stopSt, K: [[0, [1.5, 1.5, -7.0, 0, 2.2, 0, 50]], [T5 - tWide + 0.1, [2.4, 1.8, -5.8, 0, 1.9, 0, 50]]] },
  { at: T5, f: hero, K: [[0, [0.0, 1.5, 4.6, 0, 1.0, 0, 46]], [tStop - 0.1 - T5, [0.3, 1.4, 4.0, 0, 1.0, 0, 46]]] },
  { at: tStop - 0.1, f: hero, K: [[0, [-0.8, 1.3, -5.5, 0, 1.0, 0, 48]], [T6 - tStop + 0.1, [-1.2, 1.5, -4.6, 0, 1.0, 0, 48]]] },
  { at: T6, f: fol(gPath), K: [[0, [0.5, 2.1, 5.2, 0, 1.1, -4, 50]], [tLook6 - 0.15 - T6, [0.2, 2.0, 4.4, 0, 1.1, -4, 50]]] },
  { at: tLook6 - 0.15, f: fol(gPath), K: [[0, [1.6, 2.6, 3.4, -2.5, 0.8, -9, 50]], [tLeans - 0.1 - tLook6 + 0.15, [1.9, 2.9, 3.9, -2.5, 0.8, -9, 50]]] },
  { at: tLeans - 0.1, f: fol(gPath), K: [[0, [-1.4, 1.0, -5.5, 0, 0.9, 0, 50]], [tRolls - tLeans, [-1.8, 1.2, -4.6, 0, 0.9, 0, 50]]] },
  { at: tRolls - 0.1, f: fol(gPath), K: [[0, [0.0, 2.6, 6.0, 0, 1.0, -5, 50]], [TE - tRolls + 0.1, [0.0, 4.2, 8.5, 0, 1.0, -6, 50]]] },
];

run("w", (t) => {
  // stream: each pooled bike carries whichever rider of its residue is inside the window right now
  pool.forEach((B, j) => {
    const en = (j + NS * Math.round((t - 2 - j * GAP) / (NS * GAP))) * GAP; // time this rider reaches the corner
    const ok = en <= T3 + 0.7 || (t >= T6 && en >= tGIn - 4.3 && Math.abs(en - tGIn + 0.25) > 1.2);
    ride(B, ok ? sStream(en) : null, t, VIOLET, { trail: false });
  });
  // rider 61, first run + replay
  const rep = t >= T5, u = rep ? uRep(t) : t, hFn = rep ? (tt) => hPath(uRep(tt)) : hPath, showH = t >= T3 && t < T6;
  const kD = rep ? 0 : sm(tGrav + 0.35, tGrav + 0.9, t);
  const stH = showH ? ride(Bh, hFn, t, RED, { lean: leanH(u) + downLean(kD, 1) - pathState(hFn, t).lean, down: kD }) : ride(Bh, null, t, RED);
  Bh.headG.rotation.y = -0.55 * sm(tLook - 0.15, tLook + 0.25, u) * (1 - sm(tGrav - 0.3, tGrav, u));
  const look = showH && !rep ? on(t, tLook, tStand + 0.5) : 0;
  if (stH) eyeR.set(v3(stH.x, 1.55, stH.z), v3(edge[0], 0.1, edge[1]), 0.8 * look);
  else eyeR.set(v3(0, 0, 0), v3(0, 0, 1), 0);
  mkR.position.set(edge[0], 0.03, edge[1]); mkR.set(showH && !rep ? on(t, tLook, tGrav) : 0);
  hit.position.set(stopSt.x, 0.03, stopSt.z); hit.rotation.z = stopSt.h; hit.set(showH && !rep ? on(t, tGrav + 0.3) : 0);
  // rider 61, second run
  const showG = t >= T6, stG = showG ? ride(Bg, gPath, t, GREEN, { lean: -0.12 * (1 - sm(tLeans - 0.1, tLeans + 0.5, t)) * sm(tGIn, tGIn + 0.5, t) }) : ride(Bg, null, t, GREEN);
  Bg.headG.rotation.y = 0.45 * sm(tLook6 - 0.15, tLook6 + 0.25, t) * (1 - sm(tRolls, tRolls + 0.6, t));
  const lookG = showG ? on(t, tLook6, tLeans - 0.1) : 0, [lx, lz] = P(Math.min(SC + 60, sG(t) + 24), 1.8);
  if (stG) eyeG.set(v3(stG.x, 1.55, stG.z), v3(lx, 0.1, lz), 0.7 * lookG);
  else eyeG.set(v3(0, 0, 0), v3(0, 0, 1), 0);
  mkG.position.set(lx, 0.03, lz); mkG.set(lookG);
  // camera first: world tags billboard to it
  const shot = shoot(SH, t);
  tagAt(tExit, exitP[0], 2.6, exitP[1], showG ? on(t, tLook6, tRolls + 0.4) : 0, 2.2);
  hud(tRep, 0.5, 0.36, 0.36, rep && t < T6 ? on(t, T5 + 0.1, T6) : 0);
  // panel
  const n = t < T2 ? 1 + Math.floor((11 * t) / T2) : t < T3 ? Math.round(12 + 48 * sm(T2, tNoth + 0.2, t)) : 61;
  if (t < T5) PN.draw(`RIDER ${n} / 100`, "SPEED", n / 100, t < T3 ? VIOLET : RED);
  else if (t < T6) PN.draw("RIDER 61", "LEAN USED", leanH(u) / 0.9, RED, t >= tStill - 0.1 ? 0.8 : 0);
  else if (t < tLeans - 0.1) PN.draw("RIDER 61 / 100", "SAME SPEED", 0.61, GREEN);
  else PN.draw("RIDER 61", "LEAN USED", Math.min(1, Math.abs(stG.lean) / 0.9), GREEN, 0, 0.5 / 0.9);
  hud(PN, -0.5, 0.2, 0.44, on(t, 0.5, T7));
  bloom.strength = 1.0 + 1.2 * shot.punch * shot.punch + overlays(t) + (t < T5 ? 1.0 * flash(t, tGrav + 0.4) : 0);
});
