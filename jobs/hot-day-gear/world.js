// 140 hot-day-gear: wrong = rider takes off the jacket on a hot day, slides in a T-shirt, the road takes his skin (red).
// Right = jacket with air vents, open the vents not the zip (air flows through), drink at every stop, gear keeps you cool and protected (green).
import { THREE, S, g, sm, flash, scene, bloom, box, tube, glow, mSolid, VIOLET, ORANGE, RED, GREEN, hud, pathState, shoot, run } from "./kit.js";
import { track, buildRoad, makePerson, pose, title, endCard, cap, overlays, bikes, mSkin } from "./extra.js";

scene.fog.density = 0.008;
const T2 = S.s2[0], T3 = S.s3[0], T4 = S.s4[0], T5 = S.s5[0], T6 = S.s6[0], T7 = S.s7[0];
const { P } = track([{ len: 900 }]);
buildRoad(P, -60, 800);
const LX = 1.8;

const tOff = g("s1", "take"), tSlide = g("s2", "slide"), tSkin = g("s2", "takes");
const tJacket = g("s3", "jacket"), tAir = g("s3", "air"), tOpen = g("s4", "open"), tZip = g("s4", "zip");
const tDrink = g("s5", "drink"), tBefore = g("s5", "before"), tCool = g("s6", "cool"), tProt = g("s6", "protected");

// ---------- hot sun ----------
const sun = new THREE.Mesh(new THREE.SphereGeometry(16, 24, 16), new THREE.MeshBasicMaterial({ color: new THREE.Color(ORANGE).multiplyScalar(1.3), toneMapped: false, fog: false }));
scene.add(sun);

// ---------- part A: 12 m/s, jacket comes off, then a lowside in a T-shirt ----------
const VA = 12;
const fA0 = (t) => [LX, -(20 + VA * t)];
const stD = pathState(fA0, tSlide);
function red(t) {
  if (t <= tSlide) return { ...pathState(fA0, t), k: 0 };
  const e = t - tSlide, te = Math.min(e, VA / 8), slide = VA * te - 4 * te * te, k = sm(0, 0.4, e);
  return { x: stD.x + 0.5 * k, z: stD.z - slide, h: stD.h + 0.5 * k, lean: -1.45 * k, steer: 0, v: Math.max(0, VA - 8 * e), k };
}
const fA = (t) => { const r = red(t); return [r.x, r.z, r.h]; };

// ---------- part B: riding in a vented jacket ----------
const fB = (t) => [LX, -(300 + 12 * (t - T3))];
const STOP = { x: 4.7, z: -200 };

const [Bk] = bikes(1), R = Bk.rider, ch = R.children;
const mShirt = new THREE.MeshStandardMaterial({ color: 0xdcdcec, emissive: 0x4a4a66, roughness: 0.7 });
const mJacket = mSolid.clone();
const torsoParts = [ch[0]], armParts = [4, 5, 10, 11].map((i) => ch[i]);
const dress = (jacket) => { torsoParts.forEach((m) => { m.material = jacket ? mJacket : mShirt; }); armParts.forEach((m) => { m.material = jacket ? mJacket : mSkin; }); };

// jacket shell that flies off in s1
const mJk = mSolid.clone(); mJk.transparent = true;
const jacket = new THREE.Group(); R.add(jacket);
const shell = new THREE.Mesh(new THREE.CapsuleGeometry(0.2, 0.42, 4, 10), mJk); shell.position.set(0, 1.28, 0.16); shell.rotation.x = -0.55;
jacket.add(shell, tube([-0.2, 1.42, 0.02], [-0.37, 1.08, -0.45], 0.11, mJk), tube([0.2, 1.42, 0.02], [0.37, 1.08, -0.45], 0.11, mJk));

// vents (front + back slats on the torso) and the zip
const vents = new THREE.Group(); vents.position.set(0, 1.28, 0.16); vents.rotation.x = -0.55; R.add(vents);
const mVent = glow(GREEN, 0.5), slats = [];
for (const zs of [-1, 1]) for (const y of [-0.14, 0, 0.14]) {
  const p = new THREE.Group(); p.position.set(0, y, zs * 0.185); const s = box(0.26, 0.035, 0.02, 0, 0, 0, mVent, false); p.add(s); p.userData.zs = zs; vents.add(p); slats.push(p);
}
const mZip = glow(VIOLET, 1.6), zip = box(0.025, 0.5, 0.02, 0, 0.02, -0.19, mZip, false); vents.add(zip);

// airflow streaks in bike space, through the rider front to back
const mAir = [], streaks = [];
for (let i = 0; i < 14; i++) {
  const m = glow(0x7fe8ff, 1); mAir.push(m);
  const s = box(0.018, 0.018, 0.55, 0, 0, 0, m, false); s.userData = { x: ((i * 37) % 7 - 3) * 0.06, y: 1.1 + ((i * 53) % 5) * 0.09, ph: i / 14 };
  Bk.lean.add(s); streaks.push(s);
}

// crash: rider in a T-shirt slides on the road; abrasion streak
const THROWN = makePerson();
THROWN.mats.torso.color.set(0xdcdcec); THROWN.mats.arms.color.set(0xe0a27c); THROWN.mats.arms.emissive.set(0x5a2a1a);
const mScrape = glow(RED, 1), scrape = box(0.32, 0.02, 1, 0, 0.03, 0, mScrape, false); scene.add(scrape);
const ringM = new THREE.MeshBasicMaterial({ color: 0, toneMapped: false, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false });
const ring = new THREE.Mesh(new THREE.RingGeometry(0.9, 1.1, 48), ringM); ring.rotation.x = -Math.PI / 2; scene.add(ring);

// rest stop: shelter, standing rider with a water bottle
const mPost = glow(VIOLET, 1.2);
for (const [dx, dz] of [[-1.2, -1.4], [1.4, -1.4], [-1.2, 1.4], [1.4, 1.4]]) scene.add(box(0.08, 2.6, 0.08, STOP.x + 1.2 + dx, 1.3, STOP.z + dz, mPost, false));
scene.add(box(3.2, 0.1, 3.4, STOP.x + 1.3, 2.62, STOP.z, mSolid, true));
const STAND = makePerson();
const bottle = new THREE.Group(), mWater = glow(0x5fd8ff, 1.6);
bottle.add(new THREE.Mesh(new THREE.CylinderGeometry(0.055, 0.055, 0.24, 16), new THREE.MeshBasicMaterial({ color: 0xbfe8ff, transparent: true, opacity: 0.35, depthWrite: false })));
const water = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.045, 0.22, 16), mWater); bottle.add(water);
bottle.position.set(0, -0.72, -0.07); STAND.armR.add(bottle);

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
const rTemp = readout("TODAY");

title("NEVER RIDE IN A T-SHIRT ON A HOT DAY");
cap("s1", "hot", ["HOT DAY OUT"], VIOLET, { y: 0.3, until: ["s1", "never"] });
cap("s2", "slide", ["SLIDE IN A T-SHIRT"], RED, { y: 0.3, until: ["s2", "and"] });
cap("s2", "takes", ["THE ROAD TAKES", "YOUR SKIN OFF"], RED, { y: 0.3, boom: 0.6 });
cap("s3", "jacket", ["JACKET WITH", "AIR VENTS"], GREEN, { y: 0.3 });
cap("s4", "open", ["OPEN THE VENTS", "NOT THE ZIP"], GREEN, { y: 0.3 });
cap("s5", "drink", ["DRINK AT EVERY STOP"], GREEN, { y: 0.3, until: ["s5", "before"] });
cap("s5", "before", ["BEFORE YOU", "GET THIRSTY"], GREEN, { y: 0.3 });
cap("s6", "keeps", ["COOL AND", "PROTECTED"], GREEN, { y: 0.3 });
endCard(["HOT DAY?", "OPEN THE VENTS, NOT THE JACKET."]);

const fol = (fn) => (t) => { const s = pathState(fn, t); return { x: s.x, z: s.z, h: 0 }; };
const folA = (t) => { const r = red(Math.min(t, tSlide + 0.05)); return { x: r.x, z: r.z, h: 0 }; };
const rEnd = red(tSlide + 2), PX = rEnd.x + 1.2, PZ = rEnd.z - 1.0;
const SH = [
  { at: 0, f: folA, K: [[0, [1.0, 2.6, 6.5, 0.3, 1.1, -6, 46]], [T2 - 0.1, [0.8, 2.2, 5.2, 0.3, 1.1, -6, 46]]] },
  { at: T2 - 0.1, f: folA, K: [[0, [-3.4, 1.8, 5.0, 0.7, 0.9, -2, 44]], [tSlide - T2 + 0.5, [-3.2, 1.9, 4.6, 0.7, 0.8, -3, 44]]] },
  { at: tSlide + 0.45, K: [[0, [PX + 3.4, 3.0, PZ + 6, PX - 0.6, 0.3, PZ - 1.5, 44]], [T3 - tSlide - 0.45, [PX + 2.6, 2.4, PZ + 4.4, PX - 0.6, 0.3, PZ - 1.0, 42]]] },
  { at: T3, f: fol(fB), K: [[0, [-2.0, 1.8, -4.6, 0, 1.15, 0, 40]], [T4 - T3, [-1.7, 1.7, -4.0, 0, 1.2, 0, 40]]] },
  { at: T4, f: fol(fB), K: [[0, [1.6, 2.0, 4.2, 0, 1.2, -1, 42]], [T5 - T4, [1.3, 1.9, 3.7, 0, 1.2, -1, 42]]] },
  { at: T5, K: [[0, [STOP.x - 2.8, 2.0, STOP.z - 8.0, STOP.x + 0.6, 1.2, STOP.z, 40]], [T6 - T5, [STOP.x - 2.1, 1.9, STOP.z - 6.8, STOP.x + 0.6, 1.2, STOP.z, 40]]] },
  { at: T6, f: fol(fB), K: [[0, [-3.0, 2.0, 4.8, 0.7, 1.0, -2, 44]], [T7 - T6, [-2.7, 1.9, 4.3, 0.7, 1.0, -2, 44]]] },
  { at: T7 + 0.3, f: fol(fB), K: [[0, [1.5, 7, 12, 0, 0, -16, 50]], [2.6, [1.5, 10, 14, 0, 0, -16, 50]]] },
];

run("w", (t) => {
  const isA = t < T3, park = t >= T5 && t < T6;
  sun.position.set(-110, 22, (isA ? stD.z : -300 - 12 * (t - T3)) - 380); sun.visible = t < T7;
  if (isA) {
    const r = red(t);
    Bk.set(r, fA, t, { hex: t < tOff ? VIOLET : RED, trailOn: r.v > 0.5 });
    R.visible = r.k < 0.5; dress(t < tOff);
    const jk = sm(tOff, tOff + 0.9, t);
    jacket.visible = jk < 1; jacket.position.set(0.3 * jk, 0.9 * Math.sin(Math.PI * jk), 3.2 * jk); jacket.rotation.set(-1.8 * jk, 0.6 * jk, 0); mJk.opacity = 1 - jk * jk;
    vents.visible = false;
    const px = r.x + 1.2 * r.k, pz = r.z - 1.0 * r.k;
    pose(THROWN, { x: px, z: pz, h: 0.4, lie: 1, armR: 1.4, armL: 0.6, vis: r.k > 0.5 });
    const burn = sm(tSkin - 0.1, tSkin + 0.3, t);
    THROWN.mats.arms.emissive.set(0x5a2a1a).lerp(new THREE.Color(RED), burn); THROWN.mats.torso.emissive.set(0x4a4a66).lerp(new THREE.Color(RED), 0.8 * burn);
    const z0 = stD.z - 1.5, on = t > tSlide + 0.25;
    scrape.visible = on && pz < z0 - 0.1;
    if (scrape.visible) { scrape.scale.z = z0 - pz; scrape.position.set(px, 0.03, (z0 + pz) / 2); mScrape.color.set(RED).multiplyScalar(0.4 + 0.9 * burn + 1.0 * flash(t, tSkin)); }
    const hk = sm(tSkin, tSkin + 0.7, t);
    if (hk > 0 && hk < 1) { ring.visible = true; ring.position.set(px, 0.09, pz); ring.scale.setScalar(0.6 + 1.8 * hk); ringM.color.set(RED).multiplyScalar(2.4 * (1 - hk)); } else ring.visible = false;
    pose(STAND, { vis: false });
    rTemp.set("35°C", ORANGE, t < T2 - 0.1 ? sm(0.05, 0.3, t) : 0);
  } else {
    pose(THROWN, { vis: false }); scrape.visible = ring.visible = false; jacket.visible = false; dress(true); rTemp.set("", ORANGE, 0);
    const st = park ? { x: STOP.x, z: STOP.z + 0.6, h: 0.25, lean: 0.08, steer: 0.25, v: 0 } : pathState(fB, t);
    Bk.set(st, park ? () => [STOP.x, STOP.z] : fB, t, { hex: GREEN, trailOn: !park });
    R.visible = !park; vents.visible = !park;
    Bk.hlight.material.color.set(0xffffff).multiplyScalar(t < T4 || park ? 0.3 : 1.8);
    // vents: appear on "air", open on "open" (flaps tilt out, bright green); zip stays shut
    const show = sm(tAir - 0.2, tAir + 0.1, t), open = sm(tOpen - 0.05, tOpen + 0.35, t);
    mVent.color.set(GREEN).multiplyScalar(0.25 + 0.8 * show + 1.4 * open + 0.6 * flash(t, tCool));
    for (const p of slats) p.rotation.x = -p.userData.zs * 0.7 * open;
    mZip.color.set(VIOLET).multiplyScalar(1.4 + 1.6 * flash(t, tZip));
    // jacket shell glow on "jacket" and "protected"
    mJacket.emissive.set(0x1f1a5e).lerp(new THREE.Color(GREEN), 0.35 * (flash(t, tJacket) + flash(t, tProt)));
    for (let i = 0; i < streaks.length; i++) {
      const s = streaks[i], ph = (t * 1.6 + s.userData.ph) % 1;
      s.position.set(s.userData.x, s.userData.y, -2.4 + 4.4 * ph);
      mAir[i].color.set(0x7fe8ff).multiplyScalar(1.6 * open * Math.sin(Math.PI * ph));
      s.visible = open > 0.01 && !park;
    }
    const drink = sm(tDrink + 0.05, tDrink + 0.5, t) * (1 - sm(tBefore + 0.35, tBefore + 0.75, t));
    pose(STAND, { x: STOP.x + 0.9, z: STOP.z - 0.4, h: 0.35, armR: 0, armL: 0.1, vis: park });
    STAND.armR.rotation.set(2.05 * drink, 0, 0.45 * drink);
    bottle.rotation.x = 1.3 * drink; water.scale.y = 1 - 0.55 * sm(tDrink + 0.4, tBefore + 0.3, t); water.position.y = -0.11 * 0.55 * sm(tDrink + 0.4, tBefore + 0.3, t);
  }
  const shot = shoot(SH, t);
  bloom.strength = 0.8 + 1.0 * shot.punch * shot.punch + overlays(t) + (isA ? 0.5 * flash(t, tSlide) : 0);
});
