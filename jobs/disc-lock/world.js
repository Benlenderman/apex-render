// 132 disc-lock: wrong = rider rolls off with the disc lock still on the front disc, the wheel turns, the lock hits the
// fork, the wheel stops dead, the bike pitches and falls (red). Right = bright reminder cable from the lock to the bar,
// walk to the front before you sit, look at the wheel, take the lock off, cable off, lock off, ride (green).
import { THREE, S, g, sm, flash, scene, bloom, box, tube, glow, beam, VIOLET, ORANGE, RED, GREEN, pathState, shoot, run } from "./kit.js";
import { track, buildRoad, makePerson, pose, title, endCard, cap, overlays, bikes, ride, downLean, dist } from "./extra.js";

scene.fog.density = 0.01;
const T2 = S.s2[0], T3 = S.s3[0], T4 = S.s4[0], T5 = S.s5[0], T6 = S.s6[0], T7 = S.s7[0];
const O = 1.8;
const { P } = track([{ len: 600 }]);
buildRoad(P, -60, 400);
const wp = (o, v = new THREE.Vector3()) => o.getWorldPosition(v);

// ---- A: roll off, lock comes round, hits the fork, wheel stops dead, bike falls ----
const tGo = g("s1", "ride") - 0.1, tHit = g("s2", "hits"), tStop = g("s2", "stops"), tFall = g("s2", "falls");
const RAW = dist((t) => sm(tGo, tGo + 0.9, t), 0, 30), DHIT = 1.5, kA = DHIT / RAW(tHit);
const DA = (t) => kA * RAW(Math.min(t, tHit));
const pA = (t) => [O, -DA(t), 0];
const zHit = -DHIT;
// ---- B: parked, cable, walk to the front, look, lock off, ride ----
const tCable = g("s3", "cable"), tBar = g("s3", "handlebar"), tWalk = g("s4", "walk"), tFront = g("s4", "front");
const tLook = g("s5", "look"), tTake = g("s5", "take"), tOff = g("s5", "off"), tC6 = g("s6", "cable"), tL6 = g("s6", "lock"), tRide = g("s6", "ride");
const vB = (t) => 8 * sm(tRide, tRide + 1.4, t), DB = dist(vB, T3, 30);
const pB = (t) => [O, -DB(t), 0];

const [Bk] = bikes(1);
// disc + lock on the right side of the front wheel; the lock sits on a pivot so it is straight up (at the fork leg) when it hits
const disc = new THREE.Mesh(new THREE.TorusGeometry(0.15, 0.02, 6, 28), glow(VIOLET, 2)); disc.rotation.y = Math.PI / 2; disc.position.set(0.09, 0, 0); Bk.frontW.add(disc);
const piv = new THREE.Group(); Bk.frontW.add(piv);
const mLock = glow(RED, 2);
const lockOn = new THREE.Group(); lockOn.position.set(0.2, 0.17, 0); piv.add(lockOn);
lockOn.add(box(0.12, 0.2, 0.1, 0, 0, 0, mLock, false), tube([0, 0.1, -0.05], [0, 0.1, 0.05], 0.025, mLock));
const lockFree = new THREE.Group(); scene.add(lockFree);
const mFree = glow(RED, 2); lockFree.add(box(0.11, 0.18, 0.1, 0, 0, 0, mFree, false));
const grip = new THREE.Object3D(); grip.position.set(0.39, 0.12, 0.05); Bk.fork.add(grip);
const cable = beam(ORANGE, 3, 0.03);
const ring = new THREE.Mesh(new THREE.TorusGeometry(0.16, 0.025, 8, 32), glow(GREEN, 3)); scene.add(ring);
const sight = beam(GREEN, 1.4, 0.015);
const SPK = Array.from({ length: 14 }, (_, i) => { const m = box(0.045, 0.045, 0.045, 0, 0, 0, glow(ORANGE, 4), false); scene.add(m); return [m, Math.abs(Math.sin(i * 12.99) * 437.5) % 1, Math.abs(Math.sin(i * 78.23) * 125.4) % 1]; });
function sparks(p, a, t) {
  for (const [m, r1, r2] of SPK) {
    m.visible = a > 0.02; if (!m.visible) continue;
    const u = (t * 3 + r1) % 1;
    m.position.set(p.x + 0.15 + 0.6 * u * r2, p.y + 0.5 * u * (1 - u) * 2, p.z + (r1 - 0.5) * 0.9 * u);
    m.scale.setScalar(a * (1 - u));
  }
}
const ME = makePerson(), THROWN = makePerson();

title("NEVER RIDE OFF WITH THE DISC LOCK ON");
cap("s1", "locked", ["LOCKED UP", "FOR THE NIGHT?"], VIOLET, { y: 0.3, until: ["s1", "never"] });
cap("s2", "hits", ["THE LOCK", "HITS THE FORK"], RED, { y: 0.3, until: ["s2", "stops"] });
cap("s2", "stops", ["THE WHEEL", "STOPS DEAD"], RED, { y: 0.3, until: ["s2", "falls"] });
cap("s2", "falls", ["AND THE", "BIKE FALLS"], RED, { y: 0.3, boom: 0.6 });
cap("s3", "bright", ["BRIGHT CABLE", "LOCK TO BARS"], GREEN, { y: 0.3 });
cap("s4", "walk", ["WALK TO", "THE FRONT"], GREEN, { y: 0.3 });
cap("s5", "look", ["LOOK AT", "THE WHEEL"], GREEN, { y: 0.3, until: ["s5", "take"] });
cap("s5", "take", ["TAKE THE", "LOCK OFF"], GREEN, { y: 0.3 });
cap("s6", "cable", ["CABLE OFF,", "LOCK OFF"], GREEN, { y: 0.3, until: ["s6", "then"] });
cap("s6", "then", ["THEN YOU RIDE"], GREEN, { y: 0.3 });
endCard(["LOCK ON THE WHEEL?", "CABLE ON THE BARS."]);

const bx = O;
const lk = (t) => [bx + 0.15, 0.45, -DA(t) - 0.68]; // lock area in A
const SH = [
  { at: 0, K: [[0, [bx + 3.0, 1.1, 0.6, bx + 0.1, 0.55, -0.5, 50]], [2.6, [bx + 2.4, 0.95, 0.1, bx + 0.1, 0.5, -0.6, 48]]] },
  { at: T2, cam: (t, su) => { const z = -DA(t); return [bx + 2.8 - 0.3 * Math.min(1, su), 1.0, z + 0.4, bx + 0.1, 0.45, z - 0.7, 46]; } },
  { at: tHit - 0.08, calm: true, cam: (t, su) => { const L = lk(t); return [L[0] + 2.5 - 0.25 * su, 1.0, L[2] + 1.0 - 0.1 * su, L[0] - 0.2, 0.5, L[2] - 0.2, 46]; } },
  { at: tFall - 0.2, K: [[0, [bx + 4.8, 2.2, zHit + 2.2, bx + 0.3, 0.4, zHit - 0.4, 48]], [1.6, [bx + 4.4, 2.0, zHit + 1.6, bx + 0.3, 0.4, zHit - 0.4, 48]]] },
  { at: T3, K: [[0, [bx + 2.6, 2.4, -3.0, bx + 0.2, 0.7, -0.4, 46]], [2.6, [bx + 2.2, 2.2, -2.6, bx + 0.2, 0.7, -0.4, 46]]] },
  { at: T4, K: [[0, [bx + 4.8, 3.2, 2.6, bx - 0.2, 0.6, -0.7, 46]], [2.2, [bx + 4.6, 3.0, 1.6, bx - 0.2, 0.6, -0.8, 46]]] },
  { at: T5, K: [[0, [bx + 4.4, 1.9, -1.3, bx + 0.1, 0.8, -1.05, 46]], [2.2, [bx + 4.0, 1.8, -1.2, bx + 0.1, 0.75, -1.05, 46]]] },
  { at: T6, K: [[0, [bx + 4.2, 2.3, -3.2, bx, 0.8, -1.0, 46]], [1.0, [bx + 4.0, 2.2, -3.0, bx, 0.8, -1.0, 46]]] },
  { at: tRide - 0.1, f: (t) => pathState(pB, t), K: [[0, [-1.4, 2.3, 5.5, 0, 0.8, -8, 50]], [3, [-1.2, 2.2, 5.0, 0, 0.8, -8, 50]]] },
];

run("w", (t) => {
  const A = t < T3;
  lockFree.visible = false; ring.visible = false;
  if (A) {
    pose(ME, { vis: false });
    const k = sm(tFall, tFall + 0.6, t);
    ride(Bk, pA, t, t < T2 ? VIOLET : RED, { lean: downLean(k, 1), down: t > tFall + 0.45 ? 1 : 0, trail: t > tGo + 0.3 && t < tHit });
    // jolt: rear lifts when the wheel stops dead
    const j = t > tHit ? Math.sin(Math.PI * Math.min(1, (t - tHit) / 0.5)) : 0;
    Bk.g.rotation.x = -0.2 * j; Bk.g.position.y = 0.68 * Math.sin(0.2 * j);
    Bk.rider.position.z = -0.18 * sm(tHit, tHit + 0.2, t);
    piv.rotation.x = -zHit / 0.33; lockOn.visible = true;
    const pls = 2 + 2.5 * sm(g("s1", "disc") - 0.1, g("s1", "disc") + 0.2, t) + 3 * flash(t, tHit);
    mLock.color.set(RED).multiplyScalar(pls);
    sparks(wp(lockOn), sm(tHit - 0.05, tHit, t) * (1 - sm(tHit + 0.25, tHit + 0.45, t)), t);
    const u = sm(tFall + 0.45, tFall + 1.1, t);
    pose(THROWN, { x: bx + 0.9 + 0.8 * u, z: zHit - 0.9 - 0.6 * u, h: -0.6, lie: u, armR: 1.4 * u, armL: 0.9 * u, vis: t > tFall + 0.45 });
    cable.set(wp(lockOn), wp(lockOn), 0); sight.set(wp(lockOn), wp(lockOn), 0);
  } else {
    pose(THROWN, { vis: false }); sparks(null, 0, t);
    ride(Bk, pB, t, GREEN, { trail: t > tRide + 0.2 });
    Bk.g.rotation.x = 0; Bk.g.position.y = 0; Bk.rider.position.z = 0;
    const mounted = t > tRide - 0.25;
    Bk.rider.visible = mounted;
    piv.rotation.x = 0;
    const held = t > tOff - 0.1;
    lockOn.visible = !held;
    mLock.color.set(RED).multiplyScalar(2.2);
    // the person: s3 at the right front clipping the cable; s4 walks from the left rear round to the front; s5 in front
    let x, z, h, armR = 0, armL = 0, bob = 0;
    if (t < T4) { x = bx + 0.8; z = -0.15; h = Math.PI / 2 + 0.3; armR = 1.1 * sm(T3 + 0.2, tCable, t); }
    else {
      // walk: left rear -> left front corner -> in front of the wheel
      const w = sm(tWalk - 0.15, tFront + 0.25, t), WP = [[bx - 0.9, 0.9], [bx - 0.9, -1.4], [bx + 0.15, -1.45]];
      const seg = w < 0.7 ? 0 : 1, q = seg ? (w - 0.7) / 0.3 : w / 0.7, A0 = WP[seg], A1 = WP[seg + 1];
      x = A0[0] + (A1[0] - A0[0]) * q; z = A0[1] + (A1[1] - A0[1]) * q;
      const walking = w > 0 && w < 1;
      h = walking ? Math.atan2(-(A1[0] - A0[0]), -(A1[1] - A0[1])) : w >= 1 ? Math.PI : 0;
      bob = walking ? Math.abs(Math.sin(t * 9)) * 0.05 : 0;
      armR = walking ? 0.35 * Math.sin(t * 9) : 0; armL = -armR;
      if (t > T5) { x = bx + 0.15; z = -1.45; h = Math.PI; armR = 0.9 * sm(tTake - 0.2, tOff - 0.1, t); armL = 0; }
    }
    pose(ME, { x, z, h, armR, armL, vis: !mounted });
    ME.g.position.y = bob;
    ME.body.rotation.x = 0;
    // cable from lock to the grip: grows on "cable", clips on "handlebar"; off on s6 "cable"
    const gr = sm(tCable, tBar, t), cOff = sm(tC6 - 0.05, tC6 + 0.2, t);
    const L = wp(lockOn), G = wp(grip);
    const end = held ? wp(ME.armR.userData.hand) : L;
    cable.set(end, end.clone().lerp(G, gr), (1 - cOff) * (t > tCable - 0.05 ? 1 : 0));
    cable.material.color.set(cOff > 0 ? GREEN : ORANGE).multiplyScalar(3);
    if (t > tBar - 0.05 && t < tBar + 0.6) { const q = sm(tBar - 0.05, tBar + 0.55, t); ring.visible = true; ring.position.copy(G); ring.rotation.y = Math.PI / 2; ring.scale.setScalar(0.5 + 1.2 * q); ring.material.color.set(GREEN).multiplyScalar(3 * (1 - q)); }
    // lock flies to the hand on "off"
    if (held && !mounted) {
      const q = sm(tOff - 0.1, tOff + 0.25, t), H = wp(ME.armR.userData.hand);
      lockFree.visible = true; lockFree.position.copy(L.clone().lerp(H, q));
      const lg = sm(tL6 - 0.05, tL6 + 0.15, t);
      mFree.color.set(lg > 0 ? GREEN : RED).multiplyScalar(2.2 + 2 * flash(t, tL6));
    }
    const look = t > T5 && t < tOff ? sm(tLook, tLook + 0.3, t) : 0;
    sight.set(wp(ME.visor), L, look);
  }
  const shot = shoot(SH, t);
  bloom.strength = 1.0 + 1.2 * shot.punch * shot.punch + overlays(t) + (A ? 0.9 * flash(t, tHit) + 0.6 * flash(t, tFall + 0.4) : 0.5 * flash(t, tBar) + 0.4 * flash(t, tOff));
});
