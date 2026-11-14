// 120 counter-steer: to go left you first push the left grip away (wheel steers right), the bike tips left, then carves.
// Wrong (red) = turn the bars left at speed, the bike falls over to the right. Right (green) = push left grip, tips left, carves.
import { THREE, S, g, sm, flash, scene, camera, bloom, box, tube, beam, patch, glow, hud, VIOLET, ORANGE, RED, GREEN, WHITE, pathState, shoot, run } from "./kit.js";
import { track, buildRoad, makePerson, pose, title, endCard, cap, overlays, bikes, ride, downLean, tag, tagAt } from "./extra.js";

// ---- prop: live readout strip (speed / lean / steer), redrawn only when its text changes ----
function makeReadout() {
  const c = document.createElement("canvas"); c.width = 1024; c.height = 150; const x = c.getContext("2d");
  const tex = new THREE.CanvasTexture(c);
  const m = new THREE.Mesh(new THREE.PlaneGeometry(1, 150 / 1024), new THREE.MeshBasicMaterial({ map: tex, color: new THREE.Color(0.62, 0.62, 0.62), transparent: true, toneMapped: false, depthWrite: false, depthTest: false, fog: false }));
  m.renderOrder = 30; m.userData.w = 1; m.visible = false; scene.add(m);
  let last = "";
  m.draw = (spd, lean, steer, hex) => {
    const key = [spd, lean, steer, hex].join("|"); if (key === last) return; last = key;
    x.clearRect(0, 0, 1024, 150);
    x.fillStyle = "rgba(14,12,40,0.88)"; x.beginPath(); x.roundRect(8, 8, 1008, 134, 30); x.fill();
    x.strokeStyle = "#" + new THREE.Color(hex).getHexString(); x.lineWidth = 5; x.stroke();
    const cols = [["SPEED", `${spd} KM/H`], ["LEAN", lean], ["STEER", steer]];
    cols.forEach(([k, v], i) => {
      const cx = 175 + i * 337; x.textAlign = "center"; x.textBaseline = "middle";
      x.fillStyle = "#a8a4c8"; x.font = "700 34px Inter, Arial, sans-serif"; x.fillText(k, cx, 50);
      x.fillStyle = "#fff"; x.font = "900 54px Inter, Arial, sans-serif"; x.fillText(v, cx, 103);
    });
    tex.needsUpdate = true;
  };
  return m;
}
// ---- prop: hand balancing a broom; tilt rotates the broom about the palm ----
function makeBroom() {
  const G = new THREE.Group(), hand = new THREE.Group(), br = new THREE.Group();
  const skin = new THREE.MeshStandardMaterial({ color: 0xc89070, emissive: new THREE.Color(0xc89070).multiplyScalar(0.45), roughness: 0.7 });
  const wood = new THREE.MeshStandardMaterial({ color: 0xb07a3a, emissive: new THREE.Color(0xb07a3a).multiplyScalar(0.5), roughness: 0.6 });
  const bris = new THREE.MeshStandardMaterial({ color: 0xe0c060, emissive: new THREE.Color(0xe0c060).multiplyScalar(0.5), roughness: 0.8 });
  hand.add(box(0.5, 0.14, 0.42, 0, 0, 0, skin), tube([0, -0.07, 0.1], [0.15, -1.6, 0.6], 0.2, skin)); // palm up + forearm
  for (let i = 0; i < 4; i++) hand.add(box(0.09, 0.09, 0.26, -0.18 + i * 0.12, 0.03, -0.32, skin));
  br.add(tube([0, 0, 0], [0, 2.6, 0], 0.06, wood), box(0.9, 0.12, 0.2, 0, 2.62, 0, wood), box(0.95, 0.4, 0.14, 0, 2.88, 0, bris));
  br.position.y = 0.08; hand.add(br); G.add(hand); scene.add(G);
  G.setB = (x, tilt) => { hand.position.x = x; br.rotation.z = tilt; };
  return G;
}
// ---- prop: bicycle with a small rider (faces -z) ----
function makeBicycle() {
  const G = new THREE.Group(), L = new THREE.Group(), fork = new THREE.Group(); G.add(L); scene.add(G); G.rotation.order = "YXZ";
  const mF = new THREE.MeshStandardMaterial({ color: 0x8c7cff, emissive: new THREE.Color(0x8c7cff).multiplyScalar(0.6), roughness: 0.4 });
  const mB = new THREE.MeshStandardMaterial({ color: 0x2a2450, emissive: new THREE.Color(0x6a5cd0).multiplyScalar(0.35), roughness: 0.6 });
  const wheelT = (z) => { const w = new THREE.Mesh(new THREE.TorusGeometry(0.34, 0.035, 8, 28), mF); w.rotation.y = Math.PI / 2; w.position.set(0, 0.36, z); return w; };
  L.add(wheelT(0.52), tube([0, 0.36, 0.52], [0, 0.85, 0.05], 0.05, mF), tube([0, 0.85, 0.05], [0, 0.92, -0.42], 0.05, mF), tube([0, 0.36, 0.52], [0, 0.45, -0.05], 0.05, mF), tube([0, 0.45, -0.05], [0, 0.85, 0.05], 0.05, mF));
  L.add(box(0.16, 0.05, 0.26, 0, 0.95, 0.08, mB));
  fork.position.set(0, 0.92, -0.42); L.add(fork);
  const fw = wheelT(0); fw.position.set(0, -0.56, -0.12); fork.add(fw, tube([0, 0, 0], [0, -0.56, -0.12], 0.05, mF), box(0.6, 0.04, 0.04, 0, 0.12, 0.02, mF));
  // rider: torso, head with helmet, arms to the bars, legs to the pedals
  L.add(tube([0, 1.0, 0.1], [0, 1.5, -0.12], 0.22, mB), new THREE.Mesh(new THREE.SphereGeometry(0.14, 14, 10), mB));
  L.children.at(-1).position.set(0, 1.68, -0.18);
  L.add(tube([-0.13, 1.42, -0.1], [-0.28, 1.05, -0.4], 0.07, mB), tube([0.13, 1.42, -0.1], [0.28, 1.05, -0.4], 0.07, mB));
  L.add(tube([-0.1, 1.0, 0.08], [-0.12, 0.5, -0.02], 0.09, mB), tube([0.1, 1.0, 0.08], [0.12, 0.5, -0.02], 0.09, mB));
  G.set = (st, vis = true) => { G.visible = vis && !!st; if (!G.visible) return; G.position.set(st.x, 0, st.z); G.rotation.set(0, st.h, 0); L.rotation.z = st.lean; fork.rotation.y = -st.steer * 1.5; };
  return G;
}

// ---- path integrator (straight road toward -z) -> [x, z, 0] ----
function integ(t0, t1, x0, z0, vF, xF) {
  const dt = 0.01, n = Math.ceil((t1 - t0) / dt) + 1, Z = [z0];
  for (let i = 1; i < n; i++) Z.push(Z[i - 1] - vF(t0 + (i - 0.5) * dt) * dt);
  return (t) => { const f = Math.min(n - 1.001, Math.max(0, (t - t0) / dt)), i = Math.floor(f), r = f - i; return [xF ? xF(t) : x0, Z[i] + (Z[i + 1] - Z[i]) * r, 0]; };
}

const SC = 1400; // the left bend starts here
const { P } = track([{ len: SC }, { len: 50, R: 32 }, { len: 600 }]);
buildRoad(P, -80, SC + 400, { LW: 3.6, lamps: true });
const T2 = S.s2[0], T3 = S.s3[0], T4 = S.s4[0], T5 = S.s5[0], T6 = S.s6[0], T7 = S.s7[0], TE = S.s8[0] + S.s8[1];
const on = (t, a, b = 1e9) => sm(a - 0.1, a + 0.2, t) * (1 - sm(b - 0.15, b, t));
const V3 = (x, y, z) => new THREE.Vector3(x, y, z);

// ---- A (s1+s2): rides at 60, leans into a lane change, then turns the bars left: falls over to the right ----
const tLean = g("s2", "lean"), tTurn = g("s2", "turn", 2), tFall = g("s2", "falls");
const kBar = (t) => sm(tTurn, tTurn + 0.35, t), kD = (t) => sm(tFall - 0.25, tFall + 0.45, t);
const VA = 16.7;
const vA = (t) => VA * (1 - 0.8 * sm(tFall + 0.2, tFall + 1.4, t));
const xA = (t) => 1.8 - 1.5 * sm(tLean - 0.3, tLean + 0.9, t) + 1.5 * sm(tLean + 0.9, tTurn - 0.1, t) - 0.25 * kBar(t) + 1.0 * kD(t);
const aPath = integ(-1, T3 + 0.5, 1.8, 10, vA, xA);
// ---- B (s3): pushes the left grip forward: front wheel steers right, bike tips left ----
const tPush = g("s3", "push"), tFront = g("s3", "front"), tTyre = g("s3", "tyres"), tTip = g("s3", "tips");
const kPush = (t) => sm(tPush, tPush + 0.4, t) * (1 - sm(tTip + 0.4, tTip + 1.0, t));
const kTip = (t) => sm(tFront, tTip + 0.4, t);
const bPath = integ(T3 - 1, T4 + 0.5, 1.8, -500, () => 9, (t) => 1.8 + 0.25 * sm(tFront, tTyre, t) - 0.6 * sm(tTip, T4, t));
// ---- D (s5): carves the left bend; wheel swings back into the turn ----
const s5s = SC - 5, VD = 12;
const dPath = (t) => { const [x, z] = P(s5s + VD * (t - T5), 1.8); return [x, z]; };
// ---- E (s6): a bicycle doing the same gentle left turn ----
const ePath = integ(T6 - 1, T7 + 0.5, 1.8, -900, () => 5, (t) => 1.8 - 1.6 * sm(T6 + 0.6, T7 - 0.2, t));
// ---- G (s7+s8): S-bends: push left, go left; push right, go right ----
const tP1 = g("s7", "push", 1), tP2 = g("s7", "push", 2);
const gPath = integ(T7 - 1, TE + 1, 1.0, -1100, () => 12, (t) => 1.0 - 1.5 * sm(tP1 + 0.15, tP1 + 1.1, t) + 2.6 * sm(tP2 + 0.15, tP2 + 1.2, t));

// ---- actors + overlays ----
const [Bk] = bikes(1), THROWN = makePerson(), BR = makeBroom(), BC = makeBicycle(), RD = makeReadout();
BR.position.set(-40, 0.9, -20);
const gripL = box(0.16, 0.08, 0.08, -0.39, 0.12, 0.05, glow(GREEN, 3.5), false), gripR = box(0.16, 0.08, 0.08, 0.39, 0.12, 0.05, glow(GREEN, 3.5), false);
Bk.fork.add(gripL, gripR);
const hit = patch(2.4, 1.4, RED, 1.6), pushA = beam(GREEN, 3, 0.06), whlA = beam(ORANGE, 3, 0.05), handA = beam(GREEN, 3, 0.08), tipA = beam(ORANGE, 3, 0.06);
const tWhlR = tag("WHEEL GOES RIGHT", ORANGE);

title("WANT TO GO LEFT? STEER RIGHT");
cap("s2", "can't", ["CAN'T TURN", "UPRIGHT"], ORANGE, { y: 0.3, until: ["s2", "lean"] });
cap("s2", "lean", "IT HAS TO LEAN", GREEN, { y: 0.3, until: ["s2", "turn"], untilN: 2 });
cap("s2", "turn", ["BARS LEFT", "AT SPEED"], RED, { y: 0.3, n: 2, until: ["s2", "falls"] });
cap("s2", "falls", ["IT FALLS", "THE OTHER WAY"], RED, { y: 0.3, boom: 0.6 });
cap("s3", "push", ["PUSH THE LEFT", "GRIP AWAY"], GREEN, { y: 0.3, until: ["s3", "front"] });
cap("s3", "front", ["FRONT WHEEL", "MOVES RIGHT"], ORANGE, { y: 0.3, until: ["s3", "tyres"] });
cap("s3", "tyres", ["TYRES SLIDE OUT", "UNDER YOU"], ORANGE, { y: 0.3, until: ["s3", "tips"] });
cap("s3", "tips", "BIKE TIPS LEFT", GREEN, { y: 0.3 });
cap("s4", "broom", "LIKE A BROOM", ORANGE, { y: 0.3, until: ["s4", "to"] });
cap("s4", "to", ["HAND RIGHT,", "BROOM TIPS LEFT"], GREEN, { y: 0.3 });
cap("s5", "once", "ONCE IT LEANS", GREEN, { y: 0.3, until: ["s5", "wheel"] });
cap("s5", "wheel", ["WHEEL SWINGS", "INTO THE TURN"], GREEN, { y: 0.3, until: ["s5", "carve"] });
cap("s5", "carve", "YOU CARVE THROUGH", GREEN, { y: 0.3 });
cap("s6", "every", ["SAME ON", "EVERY BICYCLE"], VIOLET, { y: 0.3, until: ["s6", "nobody"] });
cap("s6", "nobody", "NOBODY TOLD YOU", ORANGE, { y: 0.3 });
endCard(["PUSH LEFT, GO LEFT.", "PUSH RIGHT, GO RIGHT."]);

// ---- shots ----
const fol = (fn) => (t) => pathState(fn, t);
const SH = [
  { at: 0, f: fol(aPath), noRot: true, K: [[0, [-1.0, 2.8, 7.5, 0.3, 0.8, -14, 50]], [T2, [-0.8, 2.6, 6.5, 0.3, 0.8, -12, 50]]] },
  { at: T2, f: fol(aPath), noRot: true, K: [[0, [-3.2, 2.0, -7.5, 0, 0.8, 0, 50]], [T3 - T2, [-3.8, 2.4, -6.5, 0.4, 0.5, 0, 50]]] },
  { at: T3, f: fol(bPath), noRot: true, K: [[0, [0.3, 4.4, 2.4, 0, 0.6, -1.6, 50]], [T4 - T3, [0.5, 4.0, 3.4, 0, 0.5, -1.8, 50]]] },
  { at: T4, K: [[0, [-40, 3.4, -13.5, -40, 2.1, -20, 50]], [T5 - T4, [-40, 3.4, -14.5, -40, 2.1, -20, 50]]] },
  { at: T5, f: fol(dPath), K: [[0, [-1.6, 2.6, 7.0, 0.3, 0.8, -10, 50]], [T6 - T5, [-2.2, 2.8, 6.5, 0.0, 0.8, -10, 50]]] },
  { at: T6, f: fol(ePath), noRot: true, K: [[0, [2.8, 1.8, -4.5, 0, 0.9, 0, 50]], [T7 - T6, [3.2, 2.0, -4.0, 0, 0.9, 0, 50]]] },
  { at: T7, f: fol(gPath), noRot: true, K: [[0, [0.3, 4.5, 9.0, 0.3, 1.0, -20, 50]], [TE - T7, [0.3, 6.5, 12.0, 0.3, 0.8, -25, 50]]] },
];

run("w", (t) => {
  let st, hex = VIOLET, fork = null;
  const A = t < T3;
  BC.set(null, false); BR.visible = t >= T4 && t < T5;
  gripL.visible = gripR.visible = false;
  if (A) {
    hex = t < T2 ? VIOLET : RED;
    st = ride(Bk, aPath, t, hex, { lean: downLean(kD(t), -1) - 0.35 * kBar(t) * (1 - kD(t)), down: kD(t), trail: false });
    if (t >= tTurn - 0.05 && kD(t) < 0.5) { fork = 0.45 * kBar(t); Bk.fork.rotation.y = fork; }
    if (t >= tFall) { // rider thrown off to the right, slides
      const u = Math.min(1, (t - tFall) / 0.8);
      pose(THROWN, { x: st.x + 0.6 + 1.6 * u, z: st.z - 0.8 - 1.2 * u, h: -0.8, lie: Math.min(1, 0.4 + u), armR: 2.4, armL: 1.6, hex: RED });
    } else pose(THROWN, { vis: false });
    hit.position.set(st.x + 1.0, 0.03, st.z - 0.4); hit.set(t > tFall ? on(t, tFall + 0.3, T3) : 0);
  } else {
    pose(THROWN, { vis: false }); hit.set(0);
    const fn = t < T4 ? bPath : t < T5 ? null : t < T6 ? dPath : t < T7 ? null : gPath;
    hex = t < T6 ? GREEN : VIOLET;
    st = ride(Bk, fn, t, hex, { trail: t >= T5 && t < T6 });
    if (t < T4) { // counter-steer close-up: fork angle and lean are scripted, not from the path
      fork = -0.32 * kPush(t); Bk.fork.rotation.y = fork; Bk.lean.rotation.z = 0.42 * kTip(t);
      gripL.visible = true; gripL.material.color.set(GREEN).multiplyScalar(1 + 4 * on(t, tPush, T4));
    }
    if (t >= T7) { const left = t < tP2 - 0.1; gripL.visible = left && t > tP1 - 0.1; gripR.visible = !left; }
    if (t >= T6 && t < T7) BC.set(pathState(ePath, t));
  }
  // s3 arrows: grip pushed away, wheel to the right, tip left
  if (st && t >= T3 && t < T4) {
    const c = Math.cos(st.h), gx = st.x - 0.39, gz = st.z - 0.5;
    pushA.set(V3(gx, 1.2, gz + 0.35), V3(gx, 1.2, gz - 0.25), on(t, tPush, tFront + 0.6));
    whlA.set(V3(st.x, 0.35, st.z - 1.25), V3(st.x + 0.9 * c, 0.35, st.z - 1.25), on(t, tFront, tTip));
    tipA.set(V3(st.x - 0.3, 1.9, st.z + 0.3), V3(st.x - 0.9, 1.7, st.z + 0.3), on(t, tTip, T4));
    tagAt(tWhlR, st.x + 0.8, 0.6, st.z - 1.6, on(t, tFront, tTip), 0.55);
  } else { pushA.set(V3(0, 0, 0), V3(0, 0, 1), 0); whlA.set(V3(0, 0, 0), V3(0, 0, 1), 0); tipA.set(V3(0, 0, 0), V3(0, 0, 1), 0); tagAt(tWhlR, 0, 0, 0, 0, 1); }
  // s4 broom: balanced, then the hand moves right and the broom tips left
  const tTo = g("s4", "to"), kH = sm(tTo, tTo + 0.7, t);
  BR.setB(0.9 * kH, 0.55 * sm(tTo + 0.15, tTo + 1.2, t) + 0.03 * Math.sin(t * 3) * (1 - kH));
  const k4 = t >= T4 && t < T5 ? 1 : 0;
  handA.set(V3(-40.3, 0.6, -19.4), V3(-39.2, 0.6, -19.4), k4 * on(t, tTo, T5));
  // s6 bicycle tag
  const e = t >= T6 && t < T7 ? pathState(ePath, t) : null;
  // readout: on the motorbike shots only
  const showRD = st && t >= T2 && !(t >= T4 && t < T5) && !(t >= T6 && t < T7) && t < S.s8[0] + 0.2 && t > 0.3;
  if (showRD) {
    const ln = Math.round((Bk.lean.rotation.z * 180) / Math.PI), fy = fork ?? Bk.fork.rotation.y;
    const down = A && kD(t) > 0.5;
    RD.draw(Math.round(st.v * 3.6 / 5) * 5, down ? "DOWN" : Math.abs(ln) < 2 ? "0°" : `${ln > 0 ? "L" : "R"} ${Math.abs(ln)}°`, Math.abs(fy) < 0.03 ? "STRAIGHT" : fy > 0 ? "LEFT" : "RIGHT", hex);
  }
  hud(RD, 0, t >= T7 ? 0.22 : 0.52, 0.72, showRD ? 1 : 0);
  const shot = shoot(SH, t);
  bloom.strength = 1.0 + 1.2 * shot.punch * shot.punch + overlays(t) + (A ? 1.0 * flash(t, tFall + 0.2) : 0);
});
