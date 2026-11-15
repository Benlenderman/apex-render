// 139 metal-grate: wrong = rider fights the bike on a wet metal bridge deck: tyres slide, he grabs the brake, the bike goes down (red).
// Right = speed down before the bridge, straight and steady on the metal, let it wiggle with loose arms, no braking/turning until the road (green).
import { THREE, S, g, sm, flash, scene, bloom, box, glow, mSolid, VIOLET, ORANGE, RED, GREEN, hud, pathState, shoot, run } from "./kit.js";
import { track, buildRoad, makePerson, pose, title, endCard, cap, overlays, bikes, dist } from "./extra.js";

scene.fog.density = 0.008;
const T2 = S.s2[0], T3 = S.s3[0], T4 = S.s4[0], T5 = S.s5[0], T6 = S.s6[0], T7 = S.s7[0];
const { P } = track([{ len: 900 }]);
buildRoad(P, -60, 800);
const LX = 1.8;

// ---------- timing ----------
const tSlide = g("s2", "slide"), tGrab = g("s2", "grabs"), tDown = g("s2", "goes");
const tSpeed = g("s3", "speed"), tStr = g("s4", "straight"), tThr = g("s4", "throttle");
const tWig = g("s5", "wiggle"), tArms = g("s5", "keep"), tNo = g("s6", "no"), tTurn = g("s6", "turning"), tUntil = g("s6", "until"), tBack = g("s6", "back");

// ---------- part A: 14 m/s onto bridge A, slides, grabs brake, goes down ----------
const VA = 14, A0 = 100, A1 = 150, tOnA = T2 - 0.2;
const sA = (t) => A0 + VA * (t - tOnA);
const wigA = (t) => sm(tSlide - 0.1, tDown, t);
const fA0 = (t) => [LX, -sA(t)];
function preA(t) { const s = pathState(fA0, t), w = wigA(t), ph = 9 * (t - tSlide); s.x += 0.3 * w * Math.sin(ph); s.h += 0.2 * w * Math.sin(ph + 1.2); s.lean = 0.14 * w * Math.sin(ph + 0.6); return s; }
const stD = preA(tDown);
function red(t) {
  if (t <= tDown) return { ...preA(t), k: 0 };
  const e = t - tDown, te = Math.min(e, VA / 8), slide = VA * te - 4 * te * te, k = sm(0, 0.4, e);
  return { x: stD.x - Math.sin(stD.h) * slide + 0.6 * k, z: stD.z - Math.cos(stD.h) * slide, h: stD.h + 0.5 * k, lean: -1.45 * k, steer: 0, v: Math.max(0, VA - 8 * e), k };
}
const fA = (t) => { const r = red(t); return [r.x, r.z, r.h]; };

// ---------- part B: speed down before bridge B, then 7 m/s steady across; bridge ends at "back" ----------
const vB = (t) => 15 - 8 * sm(T3 - 0.1, T4 - 0.1, t);
const DB = dist(vB, T3 - 3, T7 + 6);
const tOnB = T4 + 0.25, B0 = 400;
const sB = (t) => B0 + DB(t) - DB(tOnB);
const B1 = sB(tBack);
const wigB = (t) => sm(tWig - 0.1, tWig + 0.3, t) * (1 - sm(T6 + 0.4, T6 + 1.0, t));
const fB = (t) => [LX, -sB(t)];

// ---------- wet metal bridges: dark deck, glossy cross bars, side rails ----------
const mDeck = new THREE.MeshStandardMaterial({ color: 0x2a2850, emissive: 0x16143a, roughness: 0.15, metalness: 0.85 });
function bridge(s0, s1) {
  const L = s1 - s0, zc = -(s0 + L / 2), grp = new THREE.Group(), mBar = glow(0xb8c8ff, 0.9), mRail = glow(VIOLET, 1.3);
  grp.add(box(7.6, 0.04, L, 0, 0.035, zc, mDeck, false));
  for (let s = s0 + 0.25; s < s1; s += 0.5) grp.add(box(7.4, 0.012, 0.05, 0, 0.06, -s, mBar, false));
  for (let x = -3.3; x <= 3.31; x += 0.6) grp.add(box(0.035, 0.012, L, x, 0.062, zc, mBar, false));
  for (const sx of [-4, 4]) {
    grp.add(box(0.12, 0.12, L, sx, 1.05, zc, mRail, false));
    for (let s = s0; s <= s1; s += 3) grp.add(box(0.1, 1.05, 0.1, sx, 0.52, -s, mSolid, false));
  }
  scene.add(grp); return { grp, mBar };
}
const BA = bridge(A0, A1), BB = bridge(B0, B1);

const [Bk] = bikes(1), THROWN = makePerson();
// rider arms / hands (children 4, 5 = arms, 10, 11 = hands) glow green when "arms loose"
const armParts = [4, 5, 10, 11].map((i) => Bk.rider.children[i]), mArm = glow(GREEN, 1.6);
const setArms = (k) => armParts.forEach((m) => { m.material = k > 0.02 ? mArm : mSolid; }) || mArm.color.set(GREEN).multiplyScalar(0.3 + 0.9 * k);
const tailM = Bk.tail.material;

// green guide line straight across bridge B; red slide line on bridge A
const mGuide = glow(GREEN, 1.4), guide = box(0.07, 0.02, B1 - B0, LX, 0.075, -(B0 + (B1 - B0) / 2), mGuide, false); scene.add(guide);
const mEnd = glow(GREEN, 1.6), endBar = box(7.6, 0.03, 0.4, 0, 0.08, -B1, mEnd, false); scene.add(endBar);
const ringM = new THREE.MeshBasicMaterial({ color: 0, toneMapped: false, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false });
const ring = new THREE.Mesh(new THREE.RingGeometry(0.9, 1.1, 48), ringM); ring.rotation.x = -Math.PI / 2; scene.add(ring);

// ---------- readout card ----------
function readout(name) {
  const c = document.createElement("canvas"); c.width = 512; c.height = 256; const x = c.getContext("2d"), tex = new THREE.CanvasTexture(c);
  const m = new THREE.Mesh(new THREE.PlaneGeometry(1, 0.5), new THREE.MeshBasicMaterial({ map: tex, color: 0xd0d0d0, transparent: true, toneMapped: false, depthWrite: false, depthTest: false, fog: false }));
  m.renderOrder = 22; m.userData.w = 1; m.visible = false; scene.add(m);
  let last = "";
  m.set = (val, hex, a) => {
    const key = val + hex;
    if (key !== last) {
      last = key; const css = "#" + new THREE.Color(hex).getHexString();
      x.clearRect(0, 0, 512, 256); x.fillStyle = "rgba(12,10,34,0.88)"; x.beginPath(); x.roundRect(8, 8, 496, 240, 44); x.fill();
      x.strokeStyle = css; x.lineWidth = 6; x.stroke(); x.textAlign = "center"; x.textBaseline = "middle";
      x.fillStyle = "#b8b4d8"; x.font = "800 44px Inter, Arial, sans-serif"; x.fillText(name, 256, 62);
      x.fillStyle = css; x.font = "900 104px Inter, Arial, sans-serif"; x.fillText(val, 256, 166); tex.needsUpdate = true;
    }
    hud(m, 0, -0.36, 0.28, a);
  };
  return m;
}
const rSpd = readout("SPEED");

title("NEVER FIGHT A WET METAL BRIDGE");
cap("s1", "wet", ["WET METAL", "BRIDGE AHEAD"], VIOLET, { y: 0.3, until: ["s1", "never"] });
cap("s2", "slide", ["TYRES SLIDE", "ON THE METAL"], RED, { y: 0.3, until: ["s2", "grabs"] });
cap("s2", "grabs", ["GRABS THE BRAKE"], RED, { y: 0.3, until: ["s2", "goes"] });
cap("s2", "goes", ["THE BIKE GOES DOWN"], RED, { y: 0.3, boom: 0.6 });
cap("s3", "speed", ["SPEED DOWN", "BEFORE THE BRIDGE"], GREEN, { y: 0.3 });
cap("s4", "keep", ["KEEP IT STRAIGHT", "THROTTLE STEADY"], GREEN, { y: 0.3 });
cap("s5", "wiggle", ["IT WILL WIGGLE"], GREEN, { y: 0.3, until: ["s5", "keep"] });
cap("s5", "keep", ["ARMS LOOSE", "LET IT MOVE"], GREEN, { y: 0.3 });
cap("s6", "no", ["NO BRAKING", "NO TURNING"], GREEN, { y: 0.3, until: ["s6", "until"] });
cap("s6", "until", ["UNTIL YOU'RE BACK", "ON THE ROAD"], GREEN, { y: 0.3 });
endCard(["WET METAL?", "STRAIGHT, STEADY, LOOSE ARMS."]);

const fol = (fn) => (t) => { const s = pathState(fn, t); return { x: s.x, z: s.z, h: 0 }; };
const folA = (t) => { const r = red(Math.min(t, tDown + 0.05)); return { x: r.x, z: r.z, h: 0 }; };
const zDown = -sA(tDown);
const SH = [
  { at: 0, f: folA, K: [[0, [1.0, 4.5, 9, 0.3, 0.3, -18, 50]], [T2 - 0.3, [0.9, 3.6, 7.5, 0.3, 0.4, -14, 48]]] },
  { at: T2 - 0.3, f: folA, K: [[0, [-3.4, 1.8, 5.0, 0.7, 0.9, -2, 44]], [tGrab - T2 + 0.1, [-3.0, 1.7, 4.6, 0.7, 0.9, -2, 44]]] },
  { at: tGrab - 0.2, f: folA, K: [[0, [1.6, 1.6, 5.0, 0, 0.9, -2, 44]], [tDown - tGrab + 0.15, [1.4, 1.5, 4.6, 0, 0.9, -2, 44]]] },
  { at: tDown - 0.05, K: [[0, [6, 6.5, zDown + 3, 1.5, 0, zDown - 7, 48]], [T3 - tDown + 0.05, [5.5, 7, zDown + 2, 1.5, 0, zDown - 7, 48]]] },
  { at: T3, f: fol(fB), K: [[0, [0.8, 3.2, 8, 0.3, 0.4, -14, 48]], [T4 - T3, [0.7, 3.0, 7, 0.3, 0.4, -14, 48]]] },
  { at: T4, f: fol(fB), K: [[0, [0, 4.5, 8.5, 0, 0.4, -16, 50]], [T5 - T4, [0, 4.8, 8.0, 0, 0.4, -16, 50]]] },
  { at: T5, f: fol(fB), K: [[0, [0.6, 2.4, 5.2, 0.2, 1.0, -3, 44]], [T6 - T5, [0.5, 2.3, 4.8, 0.2, 1.0, -3, 44]]] },
  { at: T6, f: fol(fB), K: [[0, [1.2, 5, 9, 0.4, 0.3, -10, 50]], [T7 - T6, [1.0, 5.5, 8.5, 0.4, 0.3, -10, 50]]] },
  { at: T7 + 0.3, f: fol(fB), K: [[0, [2, 9, 12, 0, 0, -16, 50]], [2.6, [2, 12, 14, 0, 0, -16, 50]]] },
];

run("w", (t) => {
  const isA = t < T3;
  if (isA) {
    const r = red(t);
    Bk.set(r, fA, t, { hex: t < tSlide ? VIOLET : RED, trailOn: r.v > 0.5 });
    if (t > tGrab) Bk.frontW.rotation.x = -sA(tGrab) / 0.33; // front wheel locks
    Bk.rider.visible = r.k < 0.5; setArms(0);
    tailM.color.set(RED).multiplyScalar(t > tGrab ? 3 + 4 * flash(t, tGrab) : 2);
    pose(THROWN, { x: r.x + 1.6, z: r.z - 1.6, h: 0.9, lie: 1, armR: 1.4, armL: 0.6, vis: r.k > 0.5, hex: RED });
    BA.mBar.color.set(t > tSlide ? 0xffb0b8 : 0xb8c8ff).multiplyScalar(0.9 + 0.5 * flash(t, tSlide));
    const hk = sm(tDown + 0.2, tDown + 1.0, t);
    if (hk > 0 && hk < 1) { ring.visible = true; ring.position.set(r.x, 0.09, r.z); ring.scale.setScalar(0.6 + 2 * hk); ringM.color.set(RED).multiplyScalar(2.4 * (1 - hk)); } else ring.visible = false;
    rSpd.set("", RED, 0); guide.visible = endBar.visible = false;
  } else {
    pose(THROWN, { vis: false }); Bk.rider.visible = true;
    const st = pathState(fB, t); st.steer = 0.07 * wigB(t) * Math.sin(14 * t + 1.3); st.h += 0.03 * wigB(t) * Math.sin(14 * t); st.x += 0.05 * wigB(t) * Math.sin(14 * t); st.lean = 0.04 * wigB(t) * Math.sin(14 * t + 0.5);
    Bk.set(st, fB, t, { hex: GREEN });
    tailM.color.set(RED).multiplyScalar(t > T3 && t < T4 - 0.1 ? 5 : 2); // braking before the bridge only
    setArms(sm(tArms - 0.1, tArms + 0.2, t) * (1 - sm(T6, T6 + 0.3, t)));
    rSpd.set(`${Math.round(vB(t) * 3.6)} km/h`, GREEN, t > tSpeed - 0.3 && t < T5 ? 1 : 0);
    guide.visible = t > tStr - 0.2; mGuide.color.set(GREEN).multiplyScalar(0.8 * sm(tStr - 0.2, tStr + 0.2, t));
    endBar.visible = t > tUntil - 0.2; mEnd.color.set(GREEN).multiplyScalar(0.6 + 2 * flash(t, tBack));
    const hk = sm(tBack - 0.05, tBack + 0.7, t);
    if (hk > 0 && hk < 1) { ring.visible = true; ring.position.set(st.x, 0.09, st.z); ring.scale.setScalar(0.4 + 1.4 * hk); ringM.color.set(GREEN).multiplyScalar(2.2 * (1 - hk)); } else ring.visible = false;
  }
  const shot = shoot(SH, t);
  bloom.strength = 0.85 + 1.0 * shot.punch * shot.punch + overlays(t) + (isA ? 0.6 * flash(t, tDown) : 0);
});
