// 123 peg-weight: Red stands on the same peg all corner, bike stiff + heavy, runs wide.
// Green: entry (braking) inside peg light, full lean press the inside peg, exit weight to the outside leg as the bike lifts.
import { THREE, S, g, sm, clamp, scene, bloom, box, glow, hud, patch, label, local, VIOLET, ORANGE, RED, GREEN, WHITE, mSolid, pathState, shoot, run } from "./kit.js";
import { track, buildRoad, title, endCard, cap, overlays, bikes, ride, tag, tagAt } from "./extra.js";

// ---- prop: articulated rider on B.lean (hip 1 = hips slid right/inside, knee 1 = right knee out); legs light up ----
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
  const bootL = box(0.11, 0.08, 0.24, -0.25, 0.38, 0.08), bootR = box(0.11, 0.08, 0.24, 0.25, 0.38, 0.08);
  R.add(bootL, bootR, box(0.1, 0.09, 0.1, -0.39, 1.07, -0.47), box(0.1, 0.09, 0.1, 0.39, 1.07, -0.47));
  // per-leg highlight: the leg turns into a glowing shell + a glow ball on the peg (like the reference's leg overlay)
  const shell = (r) => new THREE.Mesh(new THREE.CylinderGeometry(r, r, 1, 12), new THREE.MeshBasicMaterial({ color: 0xffffff, toneMapped: false, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false }));
  const legFx = [0, 1].map(() => { const a = shell(0.15), b = shell(0.13); a.set = b.set = undefined; R.add(a, b);
    const ball = new THREE.Mesh(new THREE.SphereGeometry(0.17, 16, 12), new THREE.MeshBasicMaterial({ color: 0xffffff, toneMapped: false, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false })); R.add(ball);
    [a, b].forEach((m) => { m.set = (p, q) => { const d = q.clone().sub(p), L = d.length(); m.position.copy(p).add(q).multiplyScalar(0.5); m.scale.set(1, L, 1); m.quaternion.setFromUnitVectors(Y, d.normalize()); }; });
    return { a, b, ball }; });
  R.pose = ({ hip = 0, knee = 0, legs = [[0, RED], [0, RED]] }) => {
    const H = v3(0.32 * hip, 0.98, 0.28), Sc = v3(0.12 * hip, 1.45, -0.1);
    const d = Sc.clone().sub(H), L = d.length();
    torso.position.copy(H).add(Sc).multiplyScalar(0.5); torso.scale.set(1, L / 0.66, 1); torso.quaternion.setFromUnitVectors(Y, d.normalize());
    head.position.copy(Sc).add(v3(0.04 * hip, 0.22, -0.13));
    armL.set(Sc.clone().add(v3(-0.2, 0, 0)), v3(-0.39, 1.07, -0.47)); armR.set(Sc.clone().add(v3(0.2, 0, 0)), v3(0.39, 1.07, -0.47));
    const kL = v3(-0.24 + 0.1 * hip, 0.72, -0.12), kR = v3(0.24 + 0.1 * hip + 0.42 * knee, 0.7 - 0.12 * knee, -0.12 + 0.06 * knee);
    const fL = v3(-0.25, 0.4, 0.1), fR = v3(0.25, 0.4, 0.1), hL = H.clone().add(v3(-0.15, 0, 0)), hR = H.clone().add(v3(0.15, 0, 0));
    thL.set(hL, kL); thR.set(hR, kR); shL.set(kL, fL); shR.set(kR, fR);
    [[hL, kL, fL], [hR, kR, fR]].forEach(([h, k, f], i) => {
      const [a, hex] = legs[i], F = legFx[i], col = new THREE.Color(hex).multiplyScalar(2.2);
      F.a.set(h, k); F.b.set(k, f); F.ball.position.copy(f);
      [F.a, F.b, F.ball].forEach((m) => { m.visible = a > 0.01; m.material.color.copy(col); m.material.opacity = 0.55 * Math.min(1, a); });
      F.ball.scale.setScalar(0.8 + 0.5 * a);
    });
  };
  return R;
}
// ---- prop: peg-weight readout, two bars IN / OUT ----
function makeGauge() {
  const c = document.createElement("canvas"); c.width = 760; c.height = 300; const x = c.getContext("2d"), tex = new THREE.CanvasTexture(c);
  const m = new THREE.Mesh(new THREE.PlaneGeometry(1, 300 / 760), new THREE.MeshBasicMaterial({ map: tex, color: new THREE.Color(0.65, 0.65, 0.65), transparent: true, toneMapped: false, depthWrite: false, depthTest: false, fog: false }));
  m.renderOrder = 30; m.userData.w = 1; m.visible = false; scene.add(m);
  let last = "";
  m.draw = (inP, outP, head, hex) => {
    const key = [inP, outP, head, hex].join("|"); if (key === last) return; last = key;
    const css = "#" + new THREE.Color(hex).getHexString();
    x.clearRect(0, 0, 760, 300);
    x.fillStyle = "rgba(14,12,40,0.88)"; x.beginPath(); x.roundRect(8, 8, 744, 284, 34); x.fill(); x.strokeStyle = css; x.lineWidth = 6; x.stroke();
    x.textBaseline = "middle"; x.textAlign = "left"; x.fillStyle = css; x.font = "900 40px Inter, Arial, sans-serif"; x.fillText(head, 40, 62);
    [["INSIDE PEG", inP], ["OUTSIDE PEG", outP]].forEach(([lab, p], i) => {
      const y = 140 + i * 90;
      x.fillStyle = "#a8a4c8"; x.font = "700 32px Inter, Arial, sans-serif"; x.fillText(lab, 40, y);
      x.fillStyle = "rgba(168,164,200,0.18)"; x.beginPath(); x.roundRect(290, y - 22, 330, 44, 22); x.fill();
      x.fillStyle = p >= 60 ? css : "#a8a4c8"; x.beginPath(); x.roundRect(290, y - 22, Math.max(44, 3.3 * p), 44, 22); x.fill();
      x.fillStyle = "#fff"; x.font = "900 38px Inter, Arial, sans-serif"; x.fillText(`${p}%`, 640, y + 2);
    });
    tex.needsUpdate = true;
  };
  return m;
}

// ---- timing ----
const T2 = S.s2[0], T3 = S.s3[0], T4 = S.s4[0], T5 = S.s5[0], T6 = S.s6[0], T7 = S.s7[0], TE = S.s8[0] + S.s8[1];
const tStiff = g("s2", "stiff"), tOff = g("s3", "off"), tPress = g("s4", "press"), tMove = g("s5", "move"), tOutside = g("s5", "outside"), tLift = g("s5", "lift"), tDrive = g("s5", "drive");
const tParts = g("s6", "parts"), tThree2 = g("s6", "three", 2);
const on = (t, a, b = 1e9) => sm(a - 0.1, a + 0.2, t) * (1 - sm(b - 0.15, b, t));
const integ = (vf, t0, t1) => { const DT = 0.01, T = [0]; for (let i = 1; t0 + i * DT <= t1 + 2; i++) T.push(T[i - 1] + vf(t0 + (i - 0.5) * DT) * DT);
  return (t) => { const f = clamp((t - t0) / DT, 0, T.length - 1.001), i = Math.floor(f); return T[i] + (T[i + 1] - T[i]) * (f - i); }; };

// ---- Green speed: brake in s3, carry 12 m/s through full lean in s4, drive out in s5 ----
const vG = (t) => 24 - 12 * sm(T3 + 0.5, T4 - 0.1, t) + 9 * sm(tMove, tDrive + 0.4, t), iG = integ(vG, 0, TE + 1);
const R1 = -24, R2 = -55, A1 = iG(T5) - iG(T4) + 2, A2 = 26;
const SC = 60; // turn-in at s = SC, reached at T4
const sG = (t) => SC + iG(t) - iG(T4);
const { C, P } = track([{ len: SC }, { len: A1, R: R1 }, { len: A2, R: R2 }, { len: 500 }]);
buildRoad(P, -200, SC + A1 + A2 + 250, { LW: 3.6, lamps: true });
const gPath = (t) => { const s = sG(t), [x, z] = P(s, 1.6); return [x, z, C(s)[2]]; };
// Red (s2): same corner at a steady 18 m/s, stiff: runs wide over the line at the exit
const sR = (t) => SC - 26 + 18 * (t - T2), kW = (t) => sm(tStiff - 0.4, T3, t);
const rPath = (t) => { const s = sR(t), [x, z] = P(s, 1.6 - 3.4 * kW(t)); return [x, z, C(s)[2] + 0.12 * kW(t)]; };
// s1 hero + s6 replay of the green line
const hPath = (t) => { const s = SC - 30 + 20 * t, [x, z] = P(s, 1.6); return [x, z, C(s)[2]]; };
const s6s = (t) => SC - 16 + 40 * (t - T6), xPath = (t) => { const s = s6s(t), [x, z] = P(s, 1.6); return [x, z, C(s)[2]]; };

// ---- actors + overlays ----
const [Bk] = bikes(1), RD = makeRider(Bk), GA = makeGauge();
const MK = new THREE.Mesh(new THREE.SphereGeometry(1.1, 20, 14), glow(WHITE, 2.5)); MK.visible = false; scene.add(MK);
const zones = [[SC - 7, 0xffb020, "IN: LIGHT"], [SC + A1 * 0.5, GREEN, "MIDDLE: INSIDE"], [SC + A1 + 6, 0x3a9bff, "OUT: OUTSIDE"]].map(([s, hex, txt]) => {
  const p = patch(4.6, 9, hex, 1.4), [x, z] = P(s, 0), h = C(s)[2], [lx, lz] = P(s, 8); p.position.set(x, 0.03, z); p.rotation.z = h; return { p, x: lx, z: lz, tg: tag(txt, hex, 2.0) };
});

title("YOUR WEIGHT ON THE PEGS SHOULD CHANGE");
cap("s2", "same", ["SAME PEG", "THE WHOLE WAY"], RED, { y: 0.3, until: ["s2", "stiff"] });
cap("s2", "stiff", ["STIFF.", "HEAVY."], RED, { y: 0.3 });
cap("s3", "going", "GOING IN", ORANGE, { y: 0.3, until: ["s3", "keep"] });
cap("s3", "keep", ["INSIDE PEG", "LIGHT"], ORANGE, { y: 0.3 });
cap("s4", "full", "FULL LEAN", GREEN, { y: 0.3, until: ["s4", "press"] });
cap("s4", "press", ["PRESS THE", "INSIDE PEG"], GREEN, { y: 0.3 });
cap("s5", "way", "WAY OUT", 0x3a9bff, { y: 0.3, until: ["s5", "move"] });
cap("s5", "move", ["WEIGHT TO THE", "OUTSIDE LEG"], 0x3a9bff, { y: 0.3, until: ["s5", "lift"] });
cap("s5", "lift", ["LIFT THE BIKE.", "DRIVE."], 0x3a9bff, { y: 0.3 });
cap("s6", "three", ["3 PARTS.", "3 PEGS."], VIOLET, { y: 0.16 });
endCard([["IN: LIGHT.", 1], ["MIDDLE: INSIDE.", 1], ["OUT: OUTSIDE.", 1]]);

// ---- shots ----
const fol = (fn) => (t) => pathState(fn, t);
const [cx, cz] = P(SC + A1 * 0.3, 8), hc = C(SC + A1 * 0.3)[2];
const SH = [
  { at: 0, f: fol(hPath), K: [[0, [2.6, 1.4, -4.2, 0, 0.8, 0, 50]], [T2, [2.4, 1.3, -3.6, 0, 0.8, 0, 50]]] },
  { at: T2, f: fol(rPath), K: [[0, [-1.2, 2.6, 5.0, 0, 0.9, -5, 50]], [T3 - T2, [-1.6, 3.2, 5.6, 0, 0.7, -5, 50]]] },
  { at: T3, f: fol(gPath), K: [[0, [3.6, 1.7, -5.2, 0, 1.3, 0, 50]], [T4 - T3, [3.4, 1.6, -4.8, 0, 1.3, 0, 50]]] },
  { at: T4, f: fol(gPath), K: [[0, [3.4, 1.5, -4.6, 0, 1.2, 0, 50]], [T5 - T4, [3.6, 1.5, -4.4, 0, 1.2, 0, 50]]] },
  { at: T5, f: fol(gPath), K: [[0, [-3.6, 1.7, -4.8, 0, 1.3, 0, 50]], [T6 - T5, [-3.4, 1.6, -5.0, 0, 1.3, 0, 50]]] },
  { at: T6, cam: () => [...local(cx, cz, hc, 0, 42, 6), ...local(cx, cz, hc, 0, 0, -2), 50] },
];

run("w", (t) => {
  const red = t >= T2 && t < T3, fn = t < T2 ? hPath : red ? rPath : t < T6 ? gPath : t < T7 ? xPath : null;
  const hex = red ? RED : t < T3 ? VIOLET : GREEN;
  const st = fn ? ride(Bk, fn, t, hex) : (ride(Bk, null, t, hex), null);
  if (st) Bk.lean.rotation.z = clamp(st.lean, -0.95, 0.95);
  if (red) Bk.lean.rotation.z += 0.05 * Math.sin(t * 10) * kW(t); // fighting a stiff bike
  Bk.rider.visible = false; RD.visible = !!st;
  // leg weight: [inside(right) %, outside(left) %]
  let inP = 50, outP = 50, head = "PEG WEIGHT", gh = VIOLET, legs = [[0, RED], [0, RED]], hip = 0, knee = 0;
  if (red) { inP = 70; outP = 30; head = "SAME PEG ALL CORNER"; gh = RED; legs = [[0, RED], [on(t, g("s2", "same"), T3), RED]]; }
  else if (t >= T3 && t < T6) {
    const e = sm(T3 + 0.3, tOff, t), a = sm(T4 + 0.2, tPress, t), x = sm(tMove, tOutside + 0.3, t);
    inP = Math.round(50 - 40 * e + 70 * a - 65 * x); outP = 100 - inP;
    head = t < T4 ? "GOING IN" : t < T5 ? "FULL LEAN" : "WAY OUT"; gh = t < T4 ? ORANGE : t < T5 ? GREEN : 0x3a9bff;
    // inside leg: red-outlined "light" on entry, green pressed at full lean; outside leg blue on the exit
    legs = [[t < T5 ? on(t, tOff - 0.3, T4 + 0.1) * 0.8 + on(t, tPress - 0.1, T5 + 0.1) : 0, t < T4 + 0.1 ? ORANGE : GREEN], [on(t, tMove, T6), 0x3a9bff]];
    hip = sm(T3 + 0.4, T4, t) * (1 - 0.6 * sm(tLift, tDrive, t)); knee = sm(T4 - 0.3, T4 + 0.3, t) * (1 - sm(tLift, tDrive, t));
  } else if (t >= T6) { hip = 1; knee = 1; const s = s6s(t);
    legs = [[s > SC - 3 && s < SC + A1 ? 1 : 0, GREEN], [s > SC + A1 ? 1 : 0, 0x3a9bff]]; }
  else { hip = 0.4; }
  RD.pose({ hip, knee, legs: [legs[1], legs[0]] }); // pose expects [left(outside), right(inside)]
  GA.draw(inP, outP, head, gh);
  hud(GA, -0.4, t < T3 ? -0.33 : 0.55, 0.4, (red && t > T2 + 0.3) || (t > T3 + 0.2 && t < T6 - 0.05) ? 1 : 0);
  // s6 map: three zones light up in turn, labels next to them
  zones.forEach((Z, i) => { const a = t >= T6 ? sm(T6 + 0.1 + i * 0.35, T6 + 0.4 + i * 0.35, t) : 0; Z.p.set(0.8 * a); hud(Z.tg, 0, -0.1 - 0.12 * i, 0.6, a); });
  MK.visible = t >= T6 && t < T7; if (MK.visible) { const [x, z] = xPath(t); MK.position.set(x, 1.2, z); const ss = s6s(t); MK.material.color.set(ss < SC ? 0xffb020 : ss < SC + A1 ? GREEN : 0x3a9bff).multiplyScalar(2.5); }
  const shot = shoot(SH, t);
  bloom.strength = 1.0 + 1.2 * shot.punch * shot.punch + overlays(t);
});
