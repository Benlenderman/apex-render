// 141 riding-boots: wrong = quick ride to the shop in sneakers; at a stop the bike tips, the foot rolls under it, the ankle breaks;
// laces catch on the foot peg (red). Right = boots over the ankle; stiff boots hold when the bike tips; every ride, even a short one (green).
import { THREE, S, g, sm, flash, scene, bloom, box, tube, glow, mSolid, textPlane, label, hud, VIOLET, ORANGE, RED, GREEN, WHITE, pathState, shoot, run } from "./kit.js";
import { track, buildRoad, title, endCard, cap, overlays, bikes } from "./extra.js";

scene.fog.density = 0.008;
const T2 = S.s2[0], T3 = S.s3[0], T4 = S.s4[0], T5 = S.s5[0], T6 = S.s6[0], T7 = S.s7[0];
const { P } = track([{ len: 900 }]);
buildRoad(P, -60, 800);
const LX = 1.8;

const tSneak = g("s1", "sneakers"), tTips = g("s2", "tips"), tStopW = g("s2", "stop"), tRoll = g("s2", "rolls"), tAnkA = g("s2", "ankle"), tBreak = g("s2", "breaks");
const tLace = g("s3", "laces"), tCatch = g("s3", "catch"), tPeg = g("s3", "peg");
const tBoots = g("s4", "boots"), tCover = g("s4", "cover"), tAnk4 = g("s4", "ankle");
const tStiff = g("s5", "stiff"), tProt = g("s5", "protect"), tAnk5 = g("s5", "ankle"), tFoot5 = g("s5", "foot"), tShort = g("s6", "short");

// ---------- part A: 12 m/s to the shop, brake to a stop ----------
const V = 12, tb = T2 - 1.0, D = 1.35, A = V / D;
const zA = (t) => { const e = Math.min(Math.max(t - tb, 0), D); return -(20 + V * Math.min(t, tb) + V * e - 0.5 * A * e * e); };
const fA = (t) => [LX, zA(t)];
const ZA = zA(tb + D), tS = tb + D;
const fA3 = (t) => [LX, ZA - 40 - V * (t - T3)];             // s3: riding again (new shot)
// ---------- part B: boots ----------
const fB = (t) => [LX, -(320 + V * (t - T4))];
const ZB = -(320 + V * (T5 - T4)) - 3;
const fB6 = (t) => [LX, ZB - 6 - V * (t - T6)];

const mLine = glow(WHITE, 1.1);
scene.add(box(3.2, 0.02, 0.3, LX, 0.02, ZA - 1.4, mLine, false), box(3.2, 0.02, 0.3, LX, 0.02, ZB - 1.4, mLine, false));

// shop sign (roadside, ahead of the stop and again for s6)
const mPost = glow(VIOLET, 1.2), signs = [];
for (const z of [ZA - 22, ZB - 34]) {
  scene.add(box(0.1, 3.0, 0.1, LX + 4.2, 1.5, z, mPost, false));
  const s = textPlane([["SHOP", 260, 256]], 2.4, ORANGE, 1.8); signs.push([s, z]);
}

const [Bk] = bikes(1), R = Bk.rider, ch = R.children;
const footL = ch[8], footR = ch[9], legL = ch[6];
const mSnk = new THREE.MeshStandardMaterial({ color: 0xf2f2ff, emissive: 0x77779a, roughness: 0.6 });
const mLace = glow(RED, 1.2);
footL.material = footR.material = mSnk;
for (const f of [footL, footR]) f.add(box(0.06, 0.012, 0.14, 0, 0.045, -0.02, mLace, false));

// left leg that goes down to the ground at a stop: pivot at the hip, foot group at the end
const DL = new THREE.Group(); DL.position.set(-0.2, 0.95, -0.04); R.add(DL);
DL.add(tube([0, 0, 0], [0, -0.9, 0.06], 0.1, mSolid));
const FT = new THREE.Group(); FT.position.set(0, -0.93, 0.06); DL.add(FT);
const snkD = box(0.12, 0.09, 0.27, 0, 0.0, -0.06, mSnk); FT.add(snkD); snkD.add(box(0.06, 0.012, 0.14, 0, 0.05, -0.02, mLace, false));
const mBoot = mSolid.clone(); mBoot.emissive = new THREE.Color(0x1f1a5e);
const mTrim = glow(GREEN, 0.6);
const bootD = new THREE.Group(); FT.add(bootD);
bootD.add(box(0.14, 0.11, 0.29, 0, 0.0, -0.06, mBoot), tube([0, 0.04, 0.02], [0, 0.3, 0.0], 0.085, mBoot), box(0.19, 0.035, 0.19, 0, 0.3, 0.0, mTrim, false));
const mAnk = new THREE.MeshBasicMaterial({ color: 0, toneMapped: false, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide });
const ank = new THREE.Mesh(new THREE.RingGeometry(0.16, 0.22, 32), mAnk); ank.position.set(0, 0.12, 0.0); FT.add(ank);

// boots on both riding feet (part B)
const boots = [-1, 1].map((s) => {
  const b = new THREE.Group(); b.position.set(s * 0.25, 0.37, 0.08);
  b.add(box(0.14, 0.11, 0.29, 0, 0.0, -0.02, mBoot), tube([0, 0.04, 0.05], [-s * 0.012, 0.27, 0.07], 0.085, mBoot), box(0.19, 0.035, 0.19, -s * 0.012, 0.27, 0.07, mTrim, false));
  R.add(b); return b;
});

// lace that snags on the right foot peg (s3)
const mSnag = glow(RED, 1);
const laceLoose = tube([0.27, 0.42, 0.02], [0.42, 0.12, 0.06], 0.022, mSnag), laceTaut = tube([0.27, 0.42, 0.02], [0.34, 0.34, 0.13], 0.024, mSnag);
const pegEnd = box(0.08, 0.06, 0.08, 0.33, 0.34, 0.11, glow(RED, 0.3), false);
Bk.lean.add(pegEnd); R.add(laceLoose, laceTaut);

const crackM = new THREE.MeshBasicMaterial({ color: 0, toneMapped: false, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide });
const crack = new THREE.Mesh(new THREE.RingGeometry(0.3, 0.4, 40), crackM); scene.add(crack);
const wp = new THREE.Vector3();

// readout card
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
      x.fillStyle = css; x.font = "900 96px Inter, Arial, sans-serif"; x.fillText(val, 256, 166); tex.needsUpdate = true;
    }
    hud(m, 0, -0.36, 0.28, a);
  };
  return m;
}
const rShop = readout("TO THE SHOP");

title("NEVER RIDE IN SNEAKERS");
cap("s1", "quick", ["QUICK RIDE", "TO THE SHOP"], VIOLET, { y: 0.3, until: ["s1", "never"] });
cap("s2", "tips", ["BIKE TIPS AT A STOP"], RED, { y: 0.3, until: ["s2", "your"] });
cap("s2", "your", ["FOOT ROLLS UNDER"], RED, { y: 0.3, until: ["s2", "and"] });
cap("s2", "ankle", ["ANKLE BREAKS"], RED, { y: 0.3, boom: 0.6 });
cap("s3", "laces", ["LACES CATCH", "ON THE PEG"], RED, { y: 0.42 });
cap("s4", "boots", ["BOOTS OVER", "THE ANKLE"], GREEN, { y: 0.42 });
cap("s5", "stiff", ["STIFF BOOTS", "PROTECT"], GREEN, { y: 0.3, until: ["s5", "ankle"] });
cap("s5", "ankle", ["ANKLE AND FOOT"], GREEN, { y: 0.3 });
cap("s6", "every", ["EVERY RIDE", "EVEN A SHORT ONE"], GREEN, { y: 0.3 });
endCard(["NO SNEAKERS.", "BOOTS OVER THE ANKLE."]);

const fol = (fn) => (t) => { const s = pathState(fn, t); return { x: s.x, z: s.z, h: 0 }; };
const folA = (t) => ({ x: LX, z: zA(Math.min(t, tS)), h: 0 });
const SH = [
  { at: 0, f: folA, K: [[0, [1.1, 1.5, 4.4, 0.3, 0.8, -5, 44]], [T2 - 0.6, [0.9, 1.2, 3.6, 0.3, 0.6, -5, 44]]] },
  { at: T2 - 0.6, K: [[0, [LX - 1.9, 1.0, ZA - 5.6, LX - 0.25, 0.6, ZA, 40]], [T3 - T2 + 0.6, [LX - 1.5, 0.8, ZA - 4.8, LX - 0.3, 0.5, ZA, 40]]] },
  { at: T3, f: fol(fA3), K: [[0, [1.7, 1.5, 1.2, 0.3, 0.36, 0.05, 42]], [T4 - T3, [1.45, 1.3, 1.0, 0.3, 0.36, 0.05, 40]]] },
  { at: T4, f: fol(fB), K: [[0, [1.9, 1.6, 1.4, 0.3, 0.45, 0.05, 42]], [T5 - T4, [1.6, 1.4, 1.1, 0.3, 0.45, 0.05, 40]]] },
  { at: T5, K: [[0, [LX - 1.9, 1.0, ZB - 5.6, LX - 0.25, 0.6, ZB, 40]], [T6 - T5, [LX - 1.5, 0.8, ZB - 4.8, LX - 0.3, 0.5, ZB, 40]]] },
  { at: T6, f: fol(fB6), K: [[0, [1.1, 1.6, 4.6, 0.3, 0.9, -6, 44]], [T7 - T6, [0.9, 1.4, 4.0, 0.3, 0.8, -6, 44]]] },
  { at: T7 + 0.3, f: fol(fB6), K: [[0, [1.5, 7, 12, 0, 0, -16, 50]], [2.6, [1.5, 10, 14, 0, 0, -16, 50]]] },
];

const parked = (z) => ({ ...pathState(fA, tb - 0.1), x: LX, z, lean: 0, steer: 0, v: 0 });

run("w", (t) => {
  const partA = t < T4;
  let st, fn, hex, down = 0, theta = 0, roll = 0;
  if (t < T3) {
    st = t < tS - 0.02 ? pathState(fA, t) : parked(ZA); fn = fA; hex = t < tSneak ? VIOLET : RED;
    down = sm(tS - 0.45, tS - 0.05, t);
    theta = 0.5 * sm(tTips + 0.05, tRoll + 0.35, t);                       // bike tips left onto the foot
    roll = sm(tRoll - 0.05, tRoll + 0.4, t);                               // foot rolls under it
  } else if (t < T4) { st = pathState(fA3, t); fn = fA3; hex = RED; }
  else if (t < T5) { st = pathState(fB, t); fn = fB; hex = GREEN; }
  else if (t < T6) {
    st = parked(ZB); fn = fB; hex = GREEN; down = 1;
    theta = 0.22 * sm(tStiff + 0.05, tProt, t) * (1 - sm(tAnk5 + 0.1, tFoot5 + 0.3, t));   // tips a little, boot holds, pushed back up
  } else { st = pathState(fB6, t); fn = fB6; hex = GREEN; }
  st = { ...st, lean: (st.lean || 0) + theta };
  Bk.set(st, fn, t, { hex, trailOn: st.v > 0.5 });
  Bk.hlight.material.color.set(0xffffff).multiplyScalar(0.5);

  // feet: sneakers in part A, boots in part B
  const booted = !partA, grow = sm(tBoots - 0.15, tBoots + 0.2, t);
  for (const b of boots) { b.visible = booted && down < 0.5; b.scale.set(1, booted ? Math.max(0.05, grow) : 1, 1); }
  footR.visible = !booted; footL.visible = !booted && down < 0.5;
  legL.visible = down < 0.5; DL.visible = down >= 0.5;
  snkD.visible = !booted; bootD.visible = booted;
  const psi = -0.28 + (0.62 + 0.28) * roll;                                 // world leg angle: out to the side, then shoved under the bike
  DL.rotation.z = psi - theta;
  FT.rotation.z = 1.0 * roll;
  mSnk.emissive.set(0x77779a).lerp(new THREE.Color(RED), Math.min(1, 1.2 * flash(t, tSneak) + (t < T3 ? 0.8 * sm(tBreak - 0.1, tBreak + 0.2, t) : 0)));

  // ankle ring: red break in s2, green protect in s5
  if (t < T3 && t > tAnkA - 0.1) { ank.visible = true; mAnk.color.set(RED).multiplyScalar(0.8 + 2.2 * flash(t, tBreak)); }
  else if (t >= T5 && t < T6 && t > tAnk5 - 0.1) { ank.visible = true; mAnk.color.set(GREEN).multiplyScalar(0.8 + 1.8 * flash(t, tAnk5) + 1.2 * flash(t, tFoot5)); }
  else ank.visible = false;
  Bk.g.updateMatrixWorld(true); ank.quaternion.copy(FT.getWorldQuaternion(new THREE.Quaternion()).invert());
  Bk.g.updateMatrixWorld(true);
  const hk = sm(tBreak, tBreak + 0.7, t);
  if (t < T3 && hk > 0 && hk < 1) { FT.getWorldPosition(wp); crack.visible = true; crack.position.copy(wp).setY(wp.y + 0.12); crack.lookAt(wp.x - 3, wp.y + 1, wp.z - 3); crack.scale.setScalar(0.6 + 1.6 * hk); crackM.color.set(RED).multiplyScalar(2.6 * (1 - hk)); }
  else crack.visible = false;

  // lace snag (s3)
  const s3 = t >= T3 && t < T4, snag = sm(tCatch - 0.05, tCatch + 0.15, t);
  laceLoose.visible = s3 && snag < 0.5; laceTaut.visible = s3 && snag >= 0.5;
  mSnag.color.set(RED).multiplyScalar(1.0 + 2.2 * flash(t, tCatch) + 1.4 * flash(t, tPeg));
  pegEnd.visible = s3; pegEnd.material.color.set(RED).multiplyScalar(0.4 + 2.5 * flash(t, tPeg));
  footR.position.z = 0.08 + (s3 ? 0.1 * snag * (1 - sm(tPeg + 0.3, tPeg + 0.6, t)) : 0); footR.rotation.x = s3 ? 0.5 * snag * (1 - sm(tPeg + 0.3, tPeg + 0.6, t)) : 0;

  // boot trim glow on boots / cover / ankle / stiff / foot
  mTrim.color.set(GREEN).multiplyScalar(0.5 + 1.0 * (flash(t, tBoots) + flash(t, tCover) + flash(t, tAnk4) + flash(t, tStiff)));
  mBoot.emissive.set(0x1f1a5e).lerp(new THREE.Color(GREEN), 0.4 * (flash(t, tStiff) + flash(t, tFoot5)));

  const [sA, zSa] = signs[0], [sB, zSb] = signs[1];
  label(sA, LX + 4.2, 3.4, zSa, 1, t < T2 - 0.6 ? 1 : 0);
  label(sB, LX + 4.2, 3.4, zSb, 1, t >= T6 && t < T7 ? 1 : 0);
  const left = Math.max(0, Math.round((st.z - zSb) / 10) * 10);
  rShop.set(t < T2 ? "2 MIN" : `${left} m`, t < T2 ? RED : GREEN, t < T2 - 0.3 ? sm(0.05, 0.3, t) : (t >= T6 && t < T7 - 0.1 ? sm(T6, T6 + 0.25, t) : 0));

  const shot = shoot(SH, t);
  bloom.strength = 0.8 + 1.0 * shot.punch * shot.punch + overlays(t) + (t < T3 ? 0.5 * flash(t, tBreak) : 0);
});
