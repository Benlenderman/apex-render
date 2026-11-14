// 100 red-light-mirror: a rider stopped at a red light stares up at the light; the car behind keeps rolling (driver on the phone) and hits the bike.
// Right way: stop in first gear, eye on the mirror; leave room ahead, stop to one side of the lane; flash the brake light; still coming -> ride into the gap.
import { THREE, S, g, sm, flash, scene, bloom, box, tube, glow, beam, patch, makeCar, VIOLET, ORANGE, RED, GREEN, WHITE, pathState, shoot, sceneOf, run } from "./kit.js";
import { track, buildRoad, makePerson, pose, title, endCard, cap, overlays, bikes, ride, downLean, tag, tagAt } from "./extra.js";

scene.fog.density = 0.008;
const { P } = track([{ len: 3000 }]);
buildRoad(P, -80, 1200);
const at = (s, o) => P(s, o);
const T3 = S.s3[0], T4 = S.s4[0], T5 = S.s5[0], T6 = S.s6[0];
const sL = 120, sA = sL - 1.4, sF = sL - 9.6, O = 1.8, OS = 0.65; // stop line, bike stop (A), bike stop at the side (B)

// ---- traffic light over the lane + stop line ----
const lamps = [];
{
  const G = new THREE.Group(); scene.add(G); const [x, z] = at(sL + 0.6, 4.3); G.position.set(x, 0, z);
  G.add(box(0.16, 5.6, 0.16, 0, 2.8, 0, glow(VIOLET, 1.2), false), box(2.7, 0.12, 0.12, -1.35, 5.5, 0, glow(VIOLET, 1.2), false));
  G.add(box(0.55, 1.55, 0.4, -2.5, 4.8, 0));
  [[RED, 5.3], [ORANGE, 4.8], [GREEN, 4.3]].forEach(([hex, y]) => { const m = new THREE.Mesh(new THREE.SphereGeometry(0.19, 16, 12), glow(hex, 0.25)); m.position.set(-2.5, y, 0.22); G.add(m); lamps.push([m, hex]); });
  lamps[0][0].material.color.set(RED).multiplyScalar(4);
  const [lx, lz] = at(sL, O); scene.add(box(3.5, 0.02, 0.35, lx, 0.015, lz, glow(WHITE, 0.9), false));
}
const lampPos = new THREE.Vector3(); lamps[0][0].getWorldPosition(lampPos);

// ---- car behind (A): rolling, driver head down on the phone; see-through cabin ----
const CARa = makeCar({ color: 0xc8324a }), CARb = makeCar({ color: 0x5246c8 }), CARc = makeCar({ color: 0x3b6ad0 });
for (const c of CARa.g.children) if (c.isMesh && c.position.y > 1.1) { c.material = c.material.clone(); c.material.transparent = true; c.material.opacity = 0.18; c.material.depthWrite = false; }
{
  const D = new THREE.Group(); D.position.set(-0.4, 0, 0.35); CARa.g.add(D);
  const mD = new THREE.MeshStandardMaterial({ color: 0x3a33a0, emissive: 0x1f1a5e });
  D.add(box(0.42, 0.5, 0.24, 0, 0.98, 0, mD));
  const hd = new THREE.Mesh(new THREE.IcosahedronGeometry(0.14, 1), mD); hd.position.set(0, 1.3, -0.08); D.add(hd); // head bowed forward
  const ph = box(0.16, 0.24, 0.02, 0, 1.06, -0.32, glow(0x9fd0ff, 3.2), false); ph.rotation.x = -0.9; D.add(ph); // phone screen lit
  D.add(tube([-0.16, 1.15, 0], [-0.05, 1.04, -0.3], 0.07, mD), tube([0.16, 1.15, 0], [0.05, 1.04, -0.3], 0.07, mD));
}
const [Bk] = bikes(1), THROWN = makePerson();

// ---- A (s1-s2) ----
const tStop = 1.4, tStare = g("s1", "stare"), tHit = g("s2", "hit");
const sAb = (t) => (t < tStop ? sA - 5 * (1 - t / tStop) ** 2 : t < tHit ? sA : sA + 2.0 * sm(tHit, tHit + 0.9, t));
const pA = (t) => at(sAb(t), O + 0.4 * sm(tHit, tHit + 0.9, t));
const sCa = (t) => (t < tHit ? sA - 2.95 - 5 * (tHit - t) : sA - 2.95 + 0.9 * sm(tHit, tHit + 0.5, t));
const pCa = (t) => at(sCa(t), O);
// ---- B (s3-s7) ----
const tSide = g("s4", "stop") - 0.1, tFl = g("s5", "flash"), tGo = g("s6", "you"), tBk = tGo + 0.4;
const sB = (t) => (t < tSide ? sF - 0.6 : t < tGo ? sF - 0.6 + 0.6 * sm(tSide, tSide + 1.0, t) : sF + 3.0 * sm(tGo, tGo + 1.4, t));
const oB = (t) => (t < tSide ? O : t < tGo ? O - (O - OS) * sm(tSide, tSide + 1.0, t) : OS - 0.2 * sm(tGo, tGo + 1.4, t));
const hB = (t) => 0.45 * (sm(tSide, tSide + 0.5, t) - sm(tSide + 0.45, tSide + 1.05, t)) + 0.15 * (sm(tGo, tGo + 0.6, t) - sm(tGo + 0.6, tGo + 1.4, t));
const pB = (t) => { const [x, z] = at(sB(t), oB(t)); return [x, z, hB(t)]; };
const noseB = (t) => (t < tBk ? sF + 0.6 - 4 - 8 * (tBk - t) : sF + 0.6 - 4 + (() => { const u = Math.min(1, t - tBk); return 8 * u - 4 * u * u; })());
const pCb = (t) => at(noseB(t) - 2.15, O);
const sCc = sF + 7.05; CARc.set({ x: at(sCc, O)[0], z: at(sCc, O)[1], h: 0 });

const stare = beam(RED, 2.2, 0.03), sight = beam(GREEN, 2.2, 0.03);
const room = patch(1.5, 1, GREEN, 1.2), mid = patch(1.6, 2.2, RED, 1.4), behind = patch(1.4, 2.2, RED, 1.6);
const tGear = tag("1ST GEAR", GREEN), tFlash = tag("FLASH!", RED), tRoom = tag("ROOM", GREEN);

title("NEVER JUST STARE AT THE RED LIGHT");
cap("s2", "car", ["THE CAR BEHIND", "IS STILL ROLLING"], RED, { y: 0.3, until: ["s2", "driver"] });
cap("s2", "driver", ["THE DRIVER IS", "ON THEIR PHONE"], RED, { y: 0.3, until: ["s2", "you", 2], untilN: 2 });
cap("s2", "you", "HIT FROM BEHIND", RED, { n: 2, y: 0.3, boom: 0.6 });
cap("s3", "stop", ["STOP IN GEAR,", "ONE EYE ON YOUR MIRROR"], GREEN);
cap("s4", "leave", "LEAVE ROOM AHEAD", GREEN, { until: ["s4", "stop"] });
cap("s4", "stop", ["STOP TO ONE SIDE,", "NOT IN THE MIDDLE"], GREEN);
cap("s5", "if", ["CAR BEHIND", "NOT SLOWING?"], ORANGE, { until: ["s5", "flash"] });
cap("s5", "flash", ["FLASH YOUR", "BRAKE LIGHT"], GREEN);
cap("s6", "still", "STILL COMING?", ORANGE, { until: ["s6", "you"] });
cap("s6", "you", ["RIDE INTO", "YOUR GAP"], GREEN);
endCard(["STAY IN GEAR.", "WATCH YOUR MIRROR."]);

const cam = (s, o, y, ls, lo, ly, f) => { const [x, z] = at(s, o), [lx, lz] = at(ls, lo); return [x, y, z, lx, ly, lz, f]; };
const fol = (fn) => (t) => pathState(fn, t);
const sB3 = sF - 0.6;
const SH = [
  { at: 0, K: [[0, cam(sA - 9, -1.4, 2.0, sA + 3, O + 0.6, 3.3, 54)], [2.3, cam(sA - 7.5, -1.0, 2.2, sA + 2, O + 0.6, 3.4, 54)]] },
  { at: S.s2[0], K: [[0, cam(sA - 30, -1.8, 4.6, sA - 6, O, 0.6, 40)], [1.6, cam(sA - 28, -1.8, 4.4, sA - 5, O, 0.6, 40)]] },
  { at: g("s2", "driver") - 0.1, f: fol(pCa), noRot: true, K: [[0, [-3.4, 2.4, -2.8, -0.3, 1.0, 0.4, 46]], [1.6, [-3.1, 2.3, -2.5, -0.3, 1.0, 0.4, 46]]] },
  { at: tHit - 0.55, K: [[0, cam(sA + 7, -2.6, 2.3, sA - 1.5, O, 0.7, 54)], [1.8, cam(sA + 7.5, -2.9, 2.5, sA - 0.5, O, 0.6, 54)]] },
  { at: T3, K: [[0, cam(sB3 + 5.2, -0.6, 2.1, sB3 - 3, O, 0.9, 48)], [2, cam(sB3 + 4.6, -0.5, 2.0, sB3 - 3, O, 0.9, 48)]] },
  { at: T4, K: [[0, cam(sF - 10, 0.8, 8.5, sF + 3.5, 1.4, 0, 48)], [3.3, cam(sF - 9, 0.6, 9, sF + 3.5, 1.3, 0, 48)]] },
  { at: T5, f: fol(pCb), noRot: true, K: [[0, [-1.4, 2.7, 5.5, 0.4, 1.0, -16, 44]], [2.8, [-1.5, 2.8, 6, 0.4, 0.9, -14, 44]]] },
  { at: T6, K: [[0, cam(sF - 22, -1.5, 9, sF + 3, 1.3, 0, 46)], [4, cam(sF - 20, -1.6, 9.5, sF + 3.5, 1.3, 0, 46)]] },
];
const V3 = (a) => new THREE.Vector3(...a), wp = (o, v = new THREE.Vector3()) => o.getWorldPosition(v);
run("w", (t) => {
  const { id } = sceneOf(t), A = t < T3;
  Bk.headG.rotation.set(0, 0, 0); Bk.tail.material.color.set(RED).multiplyScalar(3);
  if (A) {
    const k = sm(tHit + 0.05, tHit + 0.45, t);
    ride(Bk, pA, t, RED, k > 0 ? { lean: downLean(k, -1), down: k } : { trail: t < tStop + 0.3 });
    if (k === 0) Bk.headG.rotation.x = 0.6 * sm(tStare - 0.3, tStare + 0.1, t); // looking up at the light
    CARa.set(pathState(pCa, t)); CARb.set(null); CARc.g.visible = false;
    // rider thrown forward over the bars
    const u = sm(tHit, tHit + 0.75, t), [x, z] = at(sA + 0.4 + 3.4 * u, O - 0.3 - 0.5 * u);
    pose(THROWN, { x, z, h: 0, lie: sm(tHit, tHit + 0.6, t), armR: 1.2 * u, armL: 1.0 * u, vis: t > tHit + 0.02 });
    if (t > tHit) THROWN.g.position.y += 0.9 * Math.sin(Math.PI * Math.min(1, (t - tHit) / 0.75)) + 0.35 * (1 - u);
    stare.set(wp(Bk.visor), lampPos, k === 0 ? sm(tStare - 0.1, tStare + 0.2, t) : 0);
  } else {
    ride(Bk, pB, t, VIOLET, { trail: t > tGo });
    pose(THROWN, { vis: false }); stare.set(lampPos, lampPos, 0);
    CARa.set(null); CARc.g.visible = true; CARb.set(pathState(pCb, t));
    const look = id === "s3" ? sm(T3 + 0.25, T3 + 0.6, t) : id === "s5" || (id === "s6" && t < tGo) ? 1 : 0;
    Bk.headG.rotation.set(-0.25 * look, 0.55 * look, 0);
    const cb = pathState(pCb, t);
    sight.set(wp(Bk.mirL.children[1]), V3([cb.x, 1.1, cb.z + 0]), look * (id === "s4" ? 0 : 1));
    // brake light flashes
    if (t > tFl && t < tGo + 0.2) { const on = Math.floor((t - tFl) * 6) % 2 === 0; Bk.tail.material.color.set(RED).multiplyScalar(on ? 14 : 1.2); }
    const fa = t > tFl && t < tGo + 0.2 ? (Math.floor((t - tFl) * 6) % 2 === 0 ? 1 : 0.25) : 0;
    { const [x, z] = at(sB(t) - 2.0, oB(t)); behind.position.set(x, 0.03, z); behind.set(fa * 0.8); tagAt(tFlash, x, 1.9, z, fa > 0 ? 1 : 0, 1.3); }
    // in gear tag (s3)
    { const [x, z] = at(sB(t), oB(t) - 1.5); tagAt(tGear, x, 1.8, z, id === "s3" ? sm(g("s3", "gear") - 0.1, g("s3", "gear") + 0.2, t) : 0, 1.0); }
    // room ahead: bike front to the car ahead's rear
    const sf = sB(t) + 0.9, sr = sCc - 2.15, L = Math.max(0.1, sr - sf), roomOn = id === "s4" ? sm(g("s4", "leave"), g("s4", "leave") + 0.3, t) : id === "s6" ? sm(g("s6", "gap") - 0.1, g("s6", "gap") + 0.2, t) * (1 - sm(tGo + 0.6, tGo + 1.2, t)) : 0;
    { const [x, z] = at((sf + sr) / 2, oB(t)); room.position.set(x, 0.03, z); room.scale.set(1, L, 1); room.set(roomOn); tagAt(tRoom, x - 1.6, 0.9, z, roomOn, 1.0); }
    { const [x, z] = at(sF - 0.1, O); mid.position.set(x, 0.035, z); mid.set(id === "s4" ? sm(g("s4", "not") - 0.1, g("s4", "not") + 0.2, t) : 0); }
  }
  const shot = shoot(SH, t);
  bloom.strength = 1.0 + 1.2 * shot.punch * shot.punch + overlays(t) + (A ? 1.0 * flash(t, tHit) : 0);
});
