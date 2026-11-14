// 122 group-pace: Red chases faster friends, too much speed + lean, the bend tightens, runs wide, grabs the brake, down.
// Blue lets them go: slow before, look through, press, roll on. Too fast? no brake, look + press. Meeting point: the group waits.
import { THREE, S, g, sm, clamp, flash, scene, bloom, glow, hud, patch, beam, local, VIOLET, ORANGE, RED, GREEN, WHITE, pathState, shoot, run } from "./kit.js";
import { track, buildRoad, title, endCard, cap, overlays, bikes, ride, downLean, tag, tagAt } from "./extra.js";

const BLUE = 0x3a9bff;
// ---- prop: speed / lean readout (canvas HUD), redrawn only on change ----
function makeReadout() {
  const c = document.createElement("canvas"); c.width = 760; c.height = 260; const x = c.getContext("2d"), tex = new THREE.CanvasTexture(c);
  const m = new THREE.Mesh(new THREE.PlaneGeometry(1, 260 / 760), new THREE.MeshBasicMaterial({ map: tex, color: new THREE.Color(0.65, 0.65, 0.65), transparent: true, toneMapped: false, depthWrite: false, depthTest: false, fog: false }));
  m.renderOrder = 30; m.userData.w = 1; m.visible = false; scene.add(m);
  let last = "";
  m.draw = (spd, lean, need, hex) => {
    const key = [spd, lean, need, hex].join("|"); if (key === last) return; last = key;
    const css = "#" + new THREE.Color(hex).getHexString();
    x.clearRect(0, 0, 760, 260);
    x.fillStyle = "rgba(14,12,40,0.88)"; x.beginPath(); x.roundRect(8, 8, 744, 244, 34); x.fill(); x.strokeStyle = css; x.lineWidth = 6; x.stroke();
    x.textAlign = "center"; x.textBaseline = "middle";
    const col = (cx, lab, val, vc) => { x.fillStyle = "#a8a4c8"; x.font = "700 34px Inter, Arial, sans-serif"; x.fillText(lab, cx, 62); x.fillStyle = vc; x.font = "900 78px Inter, Arial, sans-serif"; x.fillText(val, cx, 140); };
    col(200, "SPEED", `${spd}`, "#fff"); col(560, "LEAN", `${lean}°`, lean >= 45 ? "#ff4a5a" : "#fff");
    x.fillStyle = "#a8a4c8"; x.font = "700 30px Inter, Arial, sans-serif"; x.fillText("KM/H", 200, 205);
    if (need) { x.fillStyle = "#ff4a5a"; x.font = "900 40px Inter, Arial, sans-serif"; x.fillText(`NEEDS ${need}°`, 560, 208); }
    tex.needsUpdate = true;
  };
  return m;
}
// ---- prop: meeting-point pin (glowing post + ground ring) ----
function makePin(x, z) {
  const G = new THREE.Group(); G.position.set(x, 0, z); scene.add(G);
  const post = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.07, 3, 10), glow(GREEN, 2.5)); post.position.y = 1.5;
  const head = new THREE.Mesh(new THREE.SphereGeometry(0.35, 20, 14), glow(GREEN, 3)); head.position.y = 3.1;
  const ring = new THREE.Mesh(new THREE.RingGeometry(2.6, 2.9, 48), new THREE.MeshBasicMaterial({ color: new THREE.Color(GREEN).multiplyScalar(2), toneMapped: false, transparent: true, side: THREE.DoubleSide, depthWrite: false }));
  ring.rotation.x = -Math.PI / 2; ring.position.y = 0.03; G.add(post, head, ring);
  G.set = (a, t) => { G.visible = a > 0.01; G.scale.setScalar(0.4 + 0.6 * a); ring.scale.setScalar(1 + 0.08 * Math.sin(t * 5)); };
  return G;
}

// ---- timing ----
const T2 = S.s2[0], T3 = S.s3[0], T4 = S.s4[0], T5 = S.s5[0], T6 = S.s6[0], T7 = S.s7[0], TE = S.s8[0] + S.s8[1];
const tPush = g("s2", "pushes"), tEyes = g("s2", "eyes"), tTight = g("s3", "tightens"), tNeed = g("s3", "needs"), tWide = g("s3", "wide"), tGrab = g("s3", "grabs"), tDown = g("s3", "down");
const tSlow = g("s4", "slow"), tLook = g("s4", "look"), tPress = g("s4", "press"), tRoll = g("s4", "roll");
const tDont = g("s5", "don't"), tLook5 = g("s5", "look"), tPress5 = g("s5", "press");
const tRoute = g("s6", "route"), tGood = g("s6", "good"), tWaits = g("s6", "waits");
const on = (t, a, b = 1e9) => sm(a - 0.1, a + 0.2, t) * (1 - sm(b - 0.15, b, t));
const integ = (vf, t0, t1) => { const DT = 0.01, T = [0]; for (let i = 1; t0 + i * DT <= t1 + 2; i++) T.push(T[i - 1] + vf(t0 + (i - 0.5) * DT) * DT);
  return (t) => { const f = clamp((t - t0) / DT, 0, T.length - 1.001), i = Math.floor(f); return T[i] + (T[i + 1] - T[i]) * (f - i); }; };

// ---- Red: 15 m/s, pushes to 21, brakes hard on "grabs" ----
const vR = (t) => 15 + 6 * sm(tPush, tPush + 1.5, t) - 13 * sm(tGrab, tDown, t), sR = integ(vR, 0, tDown + 3);
const A_LEN = 60, B_LEN = 60, C_LEN = 20, D_LEN = 15, TIGHT = 50, TR = -22;
const L0 = Math.max(20, sR(tTight) - (A_LEN + B_LEN + C_LEN + D_LEN)), ST = L0 + A_LEN + B_LEN + C_LEN + D_LEN, SX = ST + TIGHT;
const { C, P } = track([{ len: L0 }, { len: A_LEN, R: 60 }, { len: B_LEN, R: -60 }, { len: C_LEN }, { len: D_LEN, R: -45 }, { len: TIGHT, R: TR }, { len: 500 }]);
buildRoad(P, -60, SX + 300, { LW: 3.6, lamps: true });
const TAU = 0.55, uA = (t) => (t < tDown ? t : tDown + TAU * (1 - Math.exp(-(t - tDown) / TAU)));
const kW = (u) => sm(tWide - 0.9, tDown, u);
const rPath = (t) => { const u = uA(t), s = sR(u); const [x, z] = P(s, 1.8 - 6.0 * kW(u)); return [x, z, C(s)[2] + 0.35 * kW(u)]; };
const kD = (t) => sm(tDown, tDown + 0.4, t);
// friends: always ahead, gap grows every bend
const fPath = (base, gap0, rate, t0, o) => (t) => { const s = base(t) + gap0 + rate * (t - t0); const [x, z] = P(s, o); return [x, z, C(s)[2]]; };
const f1R = fPath(sR, 9, 2.6, 0, 1.2), f2R = fPath(sR, 13, 2.6, 0, 2.4);

// ---- Blue s4: slow before the bend, steady through, roll on; reaches the tight arc on "press" ----
const vB = (t) => 19 - 8 * sm(tSlow, tLook, t) + 6 * sm(tRoll, tRoll + 1.5, t), iB = integ(vB, T4 - 1, T5 + 1), sB = (t) => ST + iB(t) - iB(tPress);
const bPath = (t) => { const s = sB(t), [x, z] = P(s, 1.8); return [x, z, C(s)[2]]; };
const f1B = fPath(sB, 12, 4, T4, 1.2), f2B = fPath(sB, 16, 4, T4, 2.4);
// ---- Blue s5: came in too fast, drifts wide, no brake, looks + presses back to his line ----
const cPath = (t) => { const s = ST - 9 + 15 * (t - T5), o = 1.8 - 1.6 * sm(tDont - 0.4, tLook5, t) + 1.6 * sm(tPress5, tPress5 + 0.9, t); const [x, z] = P(s, o); return [x, z, C(s)[2]]; };
// ---- s6: meeting point after the bend; friends parked, Blue rolls in; s7+ all ride off together ----
const SP = SX + 80, [px, pz] = P(SP, 5.2), hp = C(SP)[2], pin = makePin(px, pz);
const sBlue6 = (t) => SP - 45 + 41 * sm(T6, tWaits + 0.2, t) + (t > T7 ? 3 * (t - T7) ** 2 : 0);
const dPath = (t) => { const s = sBlue6(t), [x, z] = P(s, 1.8 + 1.8 * sm(tGood - 0.8, tWaits, t)); return [x, z, C(s)[2]]; };
const parked = (ds, o) => (t) => { const s = SP + ds + (t > T7 ? 3 * (t - T7) ** 2 : 0), [x, z] = P(s, o); return [x, z, C(s)[2]]; };
const f1P = parked(4, 4.0), f2P = parked(7.5, 4.4);

// ---- actors + overlays ----
const [Bk, F1, F2] = bikes(3), RO = makeReadout();
// colour-coded helmet + jacket so Red / Blue / friends read at a glance
const paint = (B, hex, k = 1.1) => { const m = glow(hex, k); B.rider.children[0].material = m; B.headG.children[0].material = m; };
const mRed = glow(RED, 1.1), mBlue = glow(BLUE, 1.1); paint(F1, VIOLET, 0.9); paint(F2, VIOLET, 0.9);
const dress = (m) => { Bk.rider.children[0].material = m; Bk.headG.children[0].material = m; };
const hit = patch(3.2, 2.0, RED, 1.6), gaze = beam(RED, 3, 0.03), gazeG = beam(BLUE, 3, 0.03);
const route = Array.from({ length: 7 }, () => beam(GREEN, 2.2, 0.06));
const tMeet = tag("MEETING POINT", GREEN, 2.0);

title("CAN'T KEEP UP? DON'T TRY");
cap("s2", "friends", "THEY'RE FASTER", VIOLET, { y: 0.3, until: ["s2", "pull"] });
cap("s2", "pull", ["EVERY BEND", "THEY PULL AHEAD"], VIOLET, { y: 0.3, until: ["s2", "pushes"] });
cap("s2", "pushes", ["MORE SPEED.", "MORE LEAN."], RED, { y: 0.3, until: ["s2", "eyes"] });
cap("s2", "eyes", ["EYES ON THEM.", "NOT THE ROAD."], RED, { y: 0.3 });
cap("s3", "tightens", "THE BEND TIGHTENS", ORANGE, { y: 0.3, until: ["s3", "needs"] });
cap("s3", "needs", ["NEEDS MORE GRIP", "THAN THE TYRES HAVE"], RED, { y: 0.3, until: ["s3", "wide"] });
cap("s3", "wide", "RUNS WIDE", RED, { y: 0.3, until: ["s3", "grabs"] });
cap("s3", "grabs", "GRABS THE BRAKE", RED, { y: 0.3, until: ["s3", "down"] });
cap("s3", "down", "DOWN.", RED, { y: 0.3, until: ["s3", "wasn't"], boom: 0.6 });
cap("s3", "wasn't", ["NOT EVEN", "HIS PACE"], ORANGE, { y: 0.3 });
cap("s4", "lets", "LET THEM GO", BLUE, { y: 0.3, until: ["s4", "own"] });
cap("s4", "own", "RIDE YOUR OWN PACE", BLUE, { y: 0.3, until: ["s4", "slow"] });
cap("s4", "slow", ["SLOW BEFORE", "THE BEND"], GREEN, { y: 0.3, until: ["s4", "look"] });
cap("s4", "look", "LOOK THROUGH IT", GREEN, { y: 0.3, until: ["s4", "press"] });
cap("s4", "press", ["PRESS THE", "INSIDE GRIP"], GREEN, { y: 0.3, until: ["s4", "roll"] });
cap("s4", "roll", "ROLL ON GENTLY", GREEN, { y: 0.3 });
cap("s5", "came", "CAME IN TOO FAST?", ORANGE, { y: 0.3, until: ["s5", "don't"] });
cap("s5", "don't", ["DON'T GRAB", "THE BRAKE"], RED, { y: 0.3, until: ["s5", "look"] });
cap("s5", "look", ["LOOK WHERE", "YOU WANT TO GO"], GREEN, { y: 0.3, until: ["s5", "press"] });
cap("s5", "press", ["PRESS FOR", "MORE LEAN"], GREEN, { y: 0.3 });
cap("s6", "agree", ["AGREE THE ROUTE", "AND A MEETING POINT"], VIOLET, { y: 0.3, until: ["s6", "good"] });
cap("s6", "good", "A GOOD GROUP WAITS", GREEN, { y: 0.3 });
endCard(["RIDE YOUR PACE.", "NOT THEIRS."]);

// ---- shots ----
const fol = (fn) => (t) => pathState(fn, t);
const pinCam = () => [...local(px, pz, hp, -6, 9, 22), ...local(px, pz, hp, -1, 0.5, 0), 48];
const SH = [
  { at: 0, f: fol(rPath), K: [[0, [1.2, 3.4, 8.5, 0, 1.0, -14, 50]], [T2, [1.0, 3.0, 7.5, 0, 1.0, -14, 50]]] },
  { at: T2, f: fol(rPath), K: [[0, [-1.6, 1.9, 5.0, 0, 1.0, -10, 50]], [tEyes - T2, [-1.2, 1.8, 4.4, 0, 1.0, -10, 50]]] },
  { at: tEyes, f: fol(rPath), K: [[0, [1.0, 3.4, 4.6, 0, 1.0, -25, 50]], [T3 - tEyes, [0.9, 3.2, 4.2, 0, 1.0, -25, 50]]], calm: true },
  { at: T3, f: fol(rPath), K: [[0, [-4.0, 7.0, 10.0, 0, 0.5, -6, 50]], [tDown - T3, [-5.0, 8.5, 9.0, 0, 0.3, -3, 50]], [T4 - T3, [-5.5, 9.0, 9.0, 0, 0.3, -2, 50]]] },
  { at: T4, f: fol(bPath), K: [[0, [-1.6, 2.6, 6.0, 0, 1.0, -10, 50]], [T5 - T4, [-1.8, 3.2, 6.5, 0, 0.8, -10, 50]]] },
  { at: T5, f: fol(cPath), K: [[0, [-2.0, 4.5, 8.0, 0, 0.6, -8, 50]], [T6 - T5, [-2.4, 5.0, 8.0, 0, 0.6, -8, 50]]] },
  { at: T6, cam: pinCam },
];

run("w", (t) => {
  const red = t < T4; dress(red ? mRed : mBlue);
  const blue4 = t >= T4 && t < T5, blue5 = t >= T5 && t < T6, meet = t >= T6;
  // Red + friends
  const dl = downLean(kD(t), -1);
  const stR = red ? ride(Bk, rPath, t, RED, { lean: dl, down: kD(t) }) : null;
  if (stR) Bk.lean.rotation.z = clamp(stR.lean - dl, -0.85, 0.85) + dl;
  // the same bike plays Blue after s4 (Red is gone)
  const bf = blue4 ? bPath : blue5 ? cPath : meet ? dPath : null, stB = bf ? ride(Bk, bf, t, BLUE) : null;
  if (stB) Bk.lean.rotation.z = clamp(stB.lean, -0.9, 0.9);
  if (!red && !bf) ride(Bk, null, t, BLUE);
  const ff = red ? [f1R, f2R] : blue4 ? [f1B, f2B] : meet ? [f1P, f2P] : [null, null];
  [F1, F2].forEach((F, i) => { const st = ride(F, ff[i], t, VIOLET); if (st) F.lean.rotation.z = clamp(st.lean, -0.8, 0.8); });
  const st = stR || stB;
  // crash
  if (stR) { hit.position.set(stR.x, 0.03, stR.z); hit.rotation.z = stR.h; }
  hit.set(red ? on(t, tDown + 0.15, T4) : 0);
  // gaze lines: Red stares at his friends; Blue looks through the bend
  const head = st ? new THREE.Vector3(...local(st.x, st.z, st.h, 0, 1.6, -0.2)) : null;
  if (stR && t < tTight) { const [fx, fz] = f1R(t); gaze.set(head, new THREE.Vector3(fx, 1.2, fz), on(t, tEyes, T3)); } else gaze.set(head, head, 0);
  if (stB && (blue4 || blue5)) { const s = (blue4 ? sB(t) : ST - 9 + 15 * (t - T5)) + 16, [lx, lz] = P(s, 1.8); gazeG.set(head, new THREE.Vector3(lx, 0.3, lz), blue4 ? on(t, tLook, tRoll) : on(t, tLook5, T6)); } else gazeG.set(head, head, 0);
  // name tags
  // route + meeting point
  route.forEach((b, i) => { const s0 = SP - 70 + i * 10, [ax, az] = P(s0, 0), [bx, bz] = P(s0 + 6, 0); b.set(new THREE.Vector3(ax, 0.05, az), new THREE.Vector3(bx, 0.05, bz), meet ? on(t, tRoute + i * 0.08, tGood) : 0); });
  pin.set(meet ? sm(tRoute + 0.3, tRoute + 0.9, t) : 0, t);
  tagAt(tMeet, px, 4.2, pz, meet ? on(t, tRoute + 0.6, tGood) : 0, 1.6);
  // readout: Red's speed + lean; "needs" shows the lean the tight bend asks for at his speed
  const need = stR && t > tNeed - 0.1 && t < tDown ? Math.round((Math.atan((stR.v * stR.v) / (9.8 * -TR)) * 180) / Math.PI) : 0;
  if (st) RO.draw(Math.round((st.v * 3.6) / 5) * 5, Math.round((Math.abs(Bk.lean.rotation.z) * 180) / Math.PI), need, red ? RED : BLUE);
  hud(RO, -0.40, -0.27, 0.42, (red && t > T2 + 0.2 && t < tDown) || ((blue4 || blue5) && t > T4 + 0.2) ? 1 : 0);
  const shot = shoot(SH, t);
  bloom.strength = 1.0 + 1.2 * shot.punch * shot.punch + overlays(t) + (red ? 1.0 * flash(t, tDown + 0.15) : 0);
});
