// 121 body-too-late: tucked on the straight, then sit up + brake + hips + knee + turn-in all at the corner = 4 jobs in 2 s.
// Wrong (red): the rider piles every job into the braking zone, runs wide and goes down. s7 (green): body already set, clean carve.
import { THREE, S, g, sm, flash, scene, bloom, box, glow, hud, patch, beam, VIOLET, ORANGE, RED, GREEN, WHITE, mSolid, pathState, shoot, run } from "./kit.js";
import { track, buildRoad, title, endCard, cap, overlays, bikes, ride, downLean } from "./extra.js";

// ---- prop: articulated rider on B.lean (tuck 1 = chest on tank, hip 1 = hips slid right, knee 1 = right knee out) ----
const Y = new THREE.Vector3(0, 1, 0), v3 = (x, y, z) => new THREE.Vector3(x, y, z);
function limb(r, mat, parent) {
  const m = new THREE.Mesh(new THREE.CylinderGeometry(r, r, 1, 10), mat); parent.add(m);
  m.set = (a, b) => { const d = b.clone().sub(a), L = d.length(); m.position.copy(a).add(b).multiplyScalar(0.5); m.scale.set(1, L, 1); m.quaternion.setFromUnitVectors(Y, d.normalize()); };
  return m;
}
function makeRider(B) {
  const R = new THREE.Group(); B.lean.add(R);
  const torso = new THREE.Mesh(new THREE.CapsuleGeometry(0.18, 0.3, 4, 10), mSolid); R.add(torso);
  const head = new THREE.Group(); head.add(new THREE.Mesh(new THREE.SphereGeometry(0.15, 16, 12), mSolid), box(0.22, 0.06, 0.03, 0, 0.02, -0.15, glow(VIOLET, 2), false)); R.add(head);
  const armL = limb(0.075, mSolid, R), armR = limb(0.075, mSolid, R), thL = limb(0.1, mSolid, R), thR = limb(0.1, mSolid, R), shL = limb(0.085, mSolid, R), shR = limb(0.085, mSolid, R);
  R.add(box(0.11, 0.08, 0.24, -0.25, 0.38, 0.08), box(0.11, 0.08, 0.24, 0.25, 0.38, 0.08), box(0.1, 0.09, 0.1, -0.39, 1.07, -0.47), box(0.1, 0.09, 0.1, 0.39, 1.07, -0.47));
  const gl = (hex, r) => { const m = new THREE.Mesh(new THREE.SphereGeometry(r, 16, 12), new THREE.MeshBasicMaterial({ color: new THREE.Color(hex).multiplyScalar(3), toneMapped: false, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false })); R.add(m); return m; };
  const gTorso = gl(RED, 0.2), gHip = gl(RED, 0.2), gKnee = gl(RED, 0.14);
  R.pose = ({ tuck = 0, hip = 0, knee = 0, glows = [0, 0, 0], hex = RED }) => {
    const H = v3(0.32 * hip, 0.98, 0.28), Sc = v3(0.12 * hip, 1.55 - 0.3 * tuck, 0.05 - 0.3 * tuck);
    const d = Sc.clone().sub(H), L = d.length();
    torso.position.copy(H).add(Sc).multiplyScalar(0.5); torso.scale.set(1, L / 0.66, 1); torso.quaternion.setFromUnitVectors(Y, d.normalize());
    head.position.copy(Sc).add(v3(0.04 * hip, 0.24 - 0.04 * tuck, -0.1 - 0.06 * tuck));
    armL.set(Sc.clone().add(v3(-0.2, 0, 0)), v3(-0.39, 1.07, -0.47)); armR.set(Sc.clone().add(v3(0.2, 0, 0)), v3(0.39, 1.07, -0.47));
    const kL = v3(-0.24 + 0.1 * hip, 0.72, -0.12), kR = v3(0.24 + 0.1 * hip + 0.42 * knee, 0.7 - 0.12 * knee, -0.12 + 0.06 * knee);
    thL.set(H.clone().add(v3(-0.15, 0, 0)), kL); thR.set(H.clone().add(v3(0.15, 0, 0)), kR);
    shL.set(kL, v3(-0.25, 0.4, 0.1)); shR.set(kR, v3(0.25, 0.4, 0.1));
    gTorso.position.copy(Sc); gHip.position.copy(H); gKnee.position.copy(kR);
    [gTorso, gHip, gKnee].forEach((m, i) => { m.visible = glows[i] > 0.01; m.material.opacity = 0.4 * Math.min(1, glows[i]); m.material.color.set(hex).multiplyScalar(3); m.scale.setScalar(0.8 + 0.4 * glows[i]); });
  };
  return R;
}
// ---- prop: job list panel (speed + the jobs piled into the braking zone), redrawn only on change ----
function makePanel() {
  const c = document.createElement("canvas"); c.width = 640; c.height = 520; const x = c.getContext("2d"), tex = new THREE.CanvasTexture(c);
  const m = new THREE.Mesh(new THREE.PlaneGeometry(1, 520 / 640), new THREE.MeshBasicMaterial({ map: tex, color: new THREE.Color(0.62, 0.62, 0.62), transparent: true, toneMapped: false, depthWrite: false, depthTest: false, fog: false }));
  m.renderOrder = 30; m.userData.w = 1; m.visible = false; scene.add(m);
  let last = "";
  m.draw = (spd, head, rows, hex) => {
    const key = JSON.stringify([spd, head, rows, hex]); if (key === last) return; last = key;
    x.clearRect(0, 0, 640, 520);
    x.fillStyle = "rgba(14,12,40,0.88)"; x.beginPath(); x.roundRect(8, 8, 624, 504, 34); x.fill();
    x.strokeStyle = "#" + new THREE.Color(hex).getHexString(); x.lineWidth = 6; x.stroke();
    x.textBaseline = "middle"; x.textAlign = "left";
    x.fillStyle = "#a8a4c8"; x.font = "700 36px Inter, Arial, sans-serif"; x.fillText("SPEED", 40, 62);
    x.fillStyle = "#fff"; x.font = "900 56px Inter, Arial, sans-serif"; x.fillText(`${spd} KM/H`, 220, 64);
    x.fillStyle = head ? "#ff4a5a" : "#a8a4c8"; x.font = "900 40px Inter, Arial, sans-serif"; x.fillText(head || "JOBS", 40, 140);
    rows.forEach(([txt, on], i) => {
      const y = 215 + i * 78;
      x.fillStyle = on ? "#ff4a5a" : "rgba(168,164,200,0.25)"; x.beginPath(); x.arc(62, y, 22, 0, 7); x.fill();
      x.fillStyle = on ? "#fff" : "rgba(168,164,200,0.35)"; x.font = "900 30px Inter, Arial, sans-serif"; x.textAlign = "center"; x.fillText(String(i + 1), 62, y + 1);
      x.textAlign = "left"; x.font = "900 46px Inter, Arial, sans-serif"; x.fillText(txt, 106, y + 2);
    });
    tex.needsUpdate = true;
  };
  return m;
}

// ---- timing ----
const T2 = S.s2[0], T3 = S.s3[0], T4 = S.s4[0], T5 = S.s5[0], T6 = S.s6[0], T7 = S.s7[0], TE = S.s8[0] + S.s8[1];
const tSit = g("s2", "sit"), tBrk = g("s2", "braking"), tHips = g("s3", "hips"), tKnee = g("s4", "knee"), tTurn = g("s4", "turn");
const tMis = g("s6", "mistakes");
const on = (t, a, b = 1e9) => sm(a - 0.1, a + 0.2, t) * (1 - sm(b - 0.15, b, t));

// ---- speed profile: 30 m/s, brake from "braking" to turn-in down to 13 m/s ----
const vAt = (t) => 30 - 17 * sm(tBrk, tTurn, t), DT = 0.01, ST = [0];
for (let i = 1; i * DT < TE + 2; i++) ST.push(ST[i - 1] + vAt((i - 0.5) * DT) * DT);
const sAt = (t) => { const f = Math.max(0, t / DT), i = Math.min(ST.length - 2, Math.floor(f)); return ST[i] + (ST[i + 1] - ST[i]) * (f - i) + (t < 0 ? 30 * t : 0); };
const SC = sAt(tTurn) - 2;
const { C, P } = track([{ len: SC }, { len: 110, R: -30 }, { len: 400 }]);
buildRoad(P, -80, SC + 380, { LW: 3.6, lamps: true });

// wrong: runs wide in s6 (o goes outside, left of a right-hander), slides to a stop after "mistakes"
const TAU = 0.6, uA = (t) => (t < tMis ? t : tMis + TAU * (1 - Math.exp(-(t - tMis) / TAU)));
const kW = (t) => sm(T6 + 0.1, tMis + 0.3, uA(t));
const aPath = (t) => { const u = uA(t), s = sAt(u), [x, z] = P(s, 1.8 - 7.2 * kW(t)); return [x, z, C(s)[2] + 0.35 * kW(t)]; };
const kD = (t) => sm(tMis, tMis + 0.45, t);
// right (s7): same corner, body already set before the brakes; time-shifted so it brakes then carves during s7
const gOff = tTurn - 1.4 - T7, gPath = (t) => { const s = sAt(t + gOff), [x, z] = P(s, 1.8); return [x, z, C(s)[2]]; };

// ---- actors + overlays ----
const [Bk, Bg] = bikes(2), RA = makeRider(Bk), RG = makeRider(Bg), PN = makePanel();
const hit = patch(3.2, 2.0, RED, 1.6), wideA = beam(RED, 3, 0.08);

title("YOU MOVE YOUR BODY TOO LATE");
cap("s2", "tucked", ["TUCKED IN", "ON THE STRAIGHT"], VIOLET, { y: 0.3, until: ["s2", "sit"] });
cap("s2", "sit", "SIT UP", RED, { y: 0.3, until: ["s2", "braking"] });
cap("s2", "braking", "THEN BRAKE", RED, { y: 0.3 });
cap("s3", "slide", ["SLIDE THE HIPS", "WHILE BRAKING"], RED, { y: 0.3 });
cap("s4", "knee", "KNEE OUT", RED, { y: 0.3, until: ["s4", "turn"] });
cap("s4", "turn", "THEN TURN IN", RED, { y: 0.3 });
cap("s5", "four", ["4 JOBS", "IN 2 SECONDS"], RED, { y: 0.3, until: ["s5", "hardest"], boom: 0.5 });
cap("s5", "hardest", ["AT THE HARDEST", "PART OF THE CORNER"], ORANGE, { y: 0.3 });
cap("s6", "too", ["TOO MUCH", "AT ONCE"], RED, { y: 0.3, until: ["s6", "mistakes"] });
cap("s6", "mistakes", ["RUNS WIDE.", "DOWN."], RED, { y: 0.3, boom: 0.6 });
endCard(["TOO MANY JOBS AT ONCE.", "PART 2: THE FIX"]);

// ---- shots (offsets local to the bike heading unless noRot) ----
const fol = (fn) => (t) => pathState(fn, t);
const SH = [
  { at: 0, f: fol(aPath), K: [[0, [0.0, 2.0, 4.6, 0, 1.0, -3, 50]], [T2, [0.0, 1.9, 4.2, 0, 1.0, -3, 50]]] },
  { at: T2, f: fol(aPath), K: [[0, [3.8, 1.9, 4.2, 0, 1.0, -0.8, 50]], [T3 - T2, [4.0, 2.0, 3.4, 0, 1.0, -1.0, 50]]] },
  { at: T3, f: fol(aPath), K: [[0, [0.0, 1.7, 3.6, 0, 1.0, 0, 50]], [T4 - T3, [0.2, 1.6, 3.2, 0, 1.0, 0, 50]]] },
  { at: T4, f: fol(aPath), K: [[0, [2.8, 1.2, -3.0, 0, 0.8, 0, 50]], [T5 - T4, [3.2, 1.4, -2.4, 0, 0.8, 0, 50]]] },
  { at: T5, f: fol(aPath), K: [[0, [0.0, 3.4, 6.5, 0, 0.8, -5, 50]], [T6 - T5, [0.0, 3.8, 7.0, 0, 0.8, -5, 50]]] },
  { at: T6, f: fol(aPath), noRot: true, K: [[0, [6.0, 8.0, 9.0, -1.0, 0.3, -2, 50]], [T7 - T6, [6.5, 8.5, 9.5, -1.0, 0.3, -1, 50]]] },
  { at: T7, f: fol(gPath), K: [[0, [-1.0, 2.6, 5.5, 0, 0.9, -4, 50]], [TE - T7, [-1.2, 2.8, 6.0, 0, 0.9, -4, 50]]] },
];

run("w", (t) => {
  const A = t < T7;
  const hex = t < tSit - 0.1 ? VIOLET : RED;
  const stA = A ? ride(Bk, aPath, t, hex, { lean: downLean(kD(t), -1), down: kD(t), trail: t >= tBrk }) : ride(Bk, null, t, hex);
  Bk.rider.visible = false; RA.visible = A && kD(t) < 0.5;
  const wob = 0.12 * Math.sin(t * 9) * on(t, tHips, tMis);
  RA.pose({ tuck: 1 - sm(tSit - 0.1, tSit + 0.4, t), hip: sm(tHips - 0.1, tHips + 0.9, t) + wob, knee: sm(tKnee - 0.1, tKnee + 0.5, t),
    glows: [on(t, tSit, tBrk + 0.6) + on(t, T5 + 0.3, T6), on(t, tHips, tKnee) + on(t, T5 + 0.3, T6), on(t, tKnee, T6)] });
  Bk.tail.material.color.set(RED).multiplyScalar(3 + 6 * on(t, tBrk, tTurn));
  if (A) Bk.lean.rotation.z += 0.08 * Math.sin(t * 11) * on(t, T5, tMis); // the wobble of a rider doing too much
  // crash patch + run-wide arrow
  if (stA) { hit.position.set(stA.x, 0.03, stA.z); hit.rotation.z = stA.h; }
  hit.set(A ? on(t, tMis + 0.2, T7) : 0);
  const [ax, az] = P(SC + 30, 1.8), [bx, bz] = P(SC + 48, -6.5);
  wideA.set(new THREE.Vector3(ax, 0.3, az), new THREE.Vector3(bx, 0.3, bz), A ? on(t, T6 + 0.2, tMis) : 0);
  // green bike: body set before the brakes (sat up, hips over), knee out before turn-in
  const stG = !A ? ride(Bg, gPath, t, GREEN) : ride(Bg, null, t, GREEN);
  Bg.rider.visible = false; RG.visible = !A;
  RG.pose({ tuck: 0, hip: 1, knee: sm(T7 + 0.4, T7 + 0.9, t), glows: [0, 0.6 * on(t, T7 + 0.1), 0.6 * on(t, T7 + 0.6)], hex: GREEN });
  // job panel
  const rows = [["SIT UP", t >= tSit - 0.1], ["BRAKE", t >= tBrk - 0.1], ["HIPS OVER", t >= tHips - 0.1], ["KNEE OUT", t >= tKnee - 0.1]];
  const stP = A ? stA : stG, two = t >= g("s5", "four") - 0.1;
  if (stP) PN.draw(Math.round((stP.v * 3.6) / 5) * 5, two ? "4 JOBS IN 2 SEC" : "", A ? rows : rows.map(([r]) => [r, false]), A ? hex : GREEN);
  hud(PN, -0.52, 0.7, 0.4, t > S.s1[1] + 3.7 && t < tMis + 0.1 ? 1 : 0);
  const shot = shoot(SH, t);
  bloom.strength = 1.0 + 1.2 * shot.punch * shot.punch + overlays(t) + (A ? 1.0 * flash(t, tMis + 0.2) : 0);
});
