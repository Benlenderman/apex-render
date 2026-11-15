// 146 deer-dusk: wrong = rider swerves around a deer at sunset, the deer jumps the same way, he hits it (red).
// Right = slower at dusk, brake hard with the bike straight, aim where the deer came from, look for more deer (green).
import { THREE, S, g, sm, flash, scene, camera, bloom, box, glow, road, patch, beam, VIOLET, ORANGE, RED, GREEN, shoot, run } from "./kit.js";
import { title, endCard, cap, overlays, bikes, ride, dist, makePerson, pose, downLean, tag, tagAt } from "./extra.js";

// ---- dusk look: warm dark sky, low sun ahead, trees on both sides, no street lamps ----
const DUSK = new THREE.Color(0x2a1226);
scene.background = DUSK; scene.fog.color = DUSK; scene.fog.density = 0.016;
scene.add(road({ lanes: 2, lw: 3.5, cx: 0, z0: 80, z1: -760, lamps: false }));
const sunM = new THREE.MeshBasicMaterial({ color: new THREE.Color(ORANGE).multiplyScalar(1.6), toneMapped: false, fog: false });
const sun = new THREE.Mesh(new THREE.CircleGeometry(16, 48), sunM); scene.add(sun);
const hazeM = new THREE.MeshBasicMaterial({ color: new THREE.Color(0xff5a2a).multiplyScalar(0.5), toneMapped: false, fog: false, transparent: true, opacity: 0.7, blending: THREE.AdditiveBlending, depthWrite: false });
const haze = new THREE.Mesh(new THREE.PlaneGeometry(700, 12), hazeM); scene.add(haze);
const mTrunk = glow(VIOLET, 0.15), mCrown = new THREE.MeshStandardMaterial({ color: 0x14261c, emissive: 0x0b1a12, roughness: 0.9 });
for (let z = 70, i = 0; z > -760; z -= 8, i++) for (const s of [-1, 1]) {
  const x = s * (7.2 + ((i * 37 + (s > 0 ? 11 : 0)) % 5) * 0.7), h = 2.2 + ((i * 13) % 4) * 0.5;
  scene.add(box(0.3, 1.6, 0.3, x, 0.8, z, mTrunk, false), box(1.9, h, 1.9, x, 1.6 + h / 2, z + (i % 3), mCrown, false));
}

// ---- prop: a deer (head toward +x), walk = leg swing, y = jump height, roll = knocked onto its side ----
function makeDeer() {
  const a = new THREE.Group(), b = new THREE.Group(); a.add(b);
  const m = new THREE.MeshStandardMaterial({ color: 0xb4703a, emissive: new THREE.Color(0xb4703a).multiplyScalar(0.5), roughness: 0.6 });
  const w = new THREE.MeshStandardMaterial({ color: 0xf2e6d8, emissive: 0x806f60, roughness: 0.6 });
  const legs = [];
  b.add(box(1.1, 0.45, 0.4, 0, 1.0, 0, m, false), box(0.12, 0.12, 0.12, -0.58, 1.12, 0, w, false));
  const neck = new THREE.Group(); neck.position.set(0.45, 1.15, 0); b.add(neck);
  const n1 = box(0.18, 0.6, 0.2, 0.08, 0.25, 0, m, false); n1.rotation.z = -0.35; neck.add(n1);
  neck.add(box(0.36, 0.2, 0.2, 0.26, 0.55, 0, m, false), box(0.05, 0.14, 0.12, 0.08, 0.7, 0.12, m, false), box(0.05, 0.14, 0.12, 0.08, 0.7, -0.12, m, false));
  for (const s of [-1, 1]) { const an = box(0.04, 0.34, 0.04, 0.14, 0.86, s * 0.08, glow(0xe8d6b8, 0.8), false); an.rotation.x = s * 0.35; neck.add(an); }
  for (const [x, z] of [[0.42, 0.13], [0.42, -0.13], [-0.42, 0.13], [-0.42, -0.13]]) { const l = new THREE.Group(); l.position.set(x, 0.85, z); l.add(box(0.08, 0.85, 0.08, 0, -0.42, 0, m, false)); legs.push(l); b.add(l); }
  scene.add(a);
  a.setD = (x, z, dir, t, { vis = true, walk = 1, y = 0, roll = 0, graze = 0 } = {}) => {
    a.visible = vis; if (!vis) return;
    a.position.set(x, y, z); a.rotation.y = dir > 0 ? 0 : Math.PI; b.rotation.x = roll;
    neck.rotation.z = -1.1 * graze;
    legs.forEach((l, i) => (l.rotation.z = y > 0.05 ? (i < 2 ? -0.7 : 0.7) : walk * 0.45 * Math.sin(t * 9 + (i % 2 ? 0 : Math.PI))));
  };
  return a;
}

const T2 = S.s2[0], T3 = S.s3[0], T4 = S.s4[0], T5 = S.s5[0], T6 = S.s6[0], T7 = S.s7[0], TE = S.s8[0] + S.s8[1];
const on = (t, a, b = 1e9) => sm(a - 0.1, a + 0.2, t) * (1 - sm(b - 0.15, b, t));
const V3 = (x, y, z) => new THREE.Vector3(x, y, z);
const RL = 1.75; // right lane centre

// ---- A: swerves left around the deer, the deer jumps left too, he hits it ----
const tDeer = g("s1", "deer"), tSw = g("s2", "swerve"), tJ = g("s2", "jumps"), tHit = g("s2", "hit");
const V = 14, zH = -V * tHit;
const aX = (t) => RL - 2.4 * sm(tSw - 0.15, tSw + 0.8, t);
const aPath = (t) => [aX(t), t < tHit ? -V * t : zH - 2.2 * sm(tHit, tHit + 0.6, t)];
const kD = (t) => sm(tHit + 0.05, tHit + 0.6, t);
const zDA = zH - 0.6;
const dAx = (t) => 1.3 - 2.0 * sm(tJ - 0.1, tHit, t);
const dAy = (t) => 0.7 * Math.sin(Math.PI * sm(tJ - 0.1, tHit + 0.05, t));

// ---- B: slower at dusk, hard straight brake, aim where it came from, stop for the group ----
const tSun = g("s3", "sunset"), tSlow = g("s3", "slower");
const tSee = g("s4", "see"), tBrk = g("s4", "brake"), tStr = g("s4", "straight");
const tAim = g("s5", "aim"), tCame = g("s5", "came"), tGoing = g("s5", "going"), tNot = g("s5", "not");
const tLook = g("s6", "look"), tMore = g("s6", "more"), tGroups = g("s6", "groups");
const tGo = T7 + 1.4;
const vB = (t) => 12 - 5 * sm(tSlow - 0.1, tSlow + 0.8, t) - 4.8 * sm(tBrk - 0.05, tBrk + 0.9, t) - 2.2 * sm(tMore - 0.1, tMore + 0.8, t) + 4.5 * sm(tGo, tGo + 1.2, t);
const Z0B = -420, DB = dist(vB, T3, TE + 1);
const xB = (t) => RL + 0.85 * sm(tAim - 0.1, tCame + 0.6, t);
const pB = (t) => [xB(t), Z0B - DB(t)];
// deer 1 crosses right to left in front of him while he brakes
const zD1 = Z0B - DB(tBrk + 0.9) - 9.5, d1X = (t) => 4.8 - 1.5 * (t - tSee + 0.2);
// s3: two deer graze on the shoulder ahead; s6: the same two cross after the first one
const zG = Z0B - DB(tSun) - 30;
const zStop = Z0B - DB(tMore + 0.9);
const d2X = (t) => 6.2 - 2.1 * Math.max(0, t - tLook + 0.3), d3X = (t) => 7.6 - 2.1 * Math.max(0, t - tLook - 0.1);

// ---- actors + overlays ----
const [Bk] = bikes(1), THROWN = makePerson();
const D1 = makeDeer(), D2 = makeDeer(), D3 = makeDeer();
const hit = patch(2.2, 1.2, RED, 1.6), stopG = patch(1.3, 1, GREEN, 0.9), lineG = patch(0.18, 14, GREEN, 1.2);
const aimG = beam(GREEN, 2.4, 0.05), aimR = beam(RED, 3.0, 0.07);
const tDeerT = tag("DEER", ORANGE), tStrT = tag("STRAIGHT", GREEN), tCameT = tag("CAME FROM", GREEN), tGoT = tag("GOING", RED), tMoreT = tag("MORE DEER", ORANGE);
const mkRing = () => { const m = new THREE.MeshBasicMaterial({ color: 0, toneMapped: false, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide }); const r = new THREE.Mesh(new THREE.RingGeometry(0.9, 1.0, 48), m); r.rotation.x = -Math.PI / 2; scene.add(r); return r; };
const rings = [mkRing(), mkRing(), mkRing()];
const setRing = (r, x, z, k, hex, s0, s1, b = 2.6) => { if (k <= 0 || k >= 1) { r.visible = false; return; } r.visible = true; r.position.set(x, 0.035, z); r.scale.setScalar(s0 + (s1 - s0) * k); r.material.color.set(hex).multiplyScalar(b * (1 - k)); };

title("NEVER SWERVE AROUND A DEER");
cap("s1", "deer", ["DEER ON THE ROAD", "AT SUNSET?"], ORANGE, { y: 0.3, until: ["s1", "never"] });
cap("s2", "swerve", "YOU SWERVE", RED, { y: 0.3, until: ["s2", "jumps"] });
cap("s2", "jumps", ["IT JUMPS", "THE SAME WAY"], RED, { y: 0.3, until: ["s2", "hit"] });
cap("s2", "hit", "YOU HIT IT", RED, { y: 0.3, boom: 0.6 });
cap("s3", "deer", ["SUNRISE AND SUNSET", "= DEER TIME"], ORANGE, { y: 0.3, until: ["s3", "slower"] });
cap("s3", "slower", "RIDE SLOWER", GREEN, { y: 0.3 });
cap("s4", "brake", ["BRAKE HARD", "BIKE STRAIGHT"], GREEN, { y: 0.3 });
cap("s5", "aim", ["AIM WHERE IT", "CAME FROM"], GREEN, { y: 0.3, until: ["s5", "not"] });
cap("s5", "not", ["NOT WHERE", "IT'S GOING"], RED, { y: 0.3 });
cap("s6", "look", ["LOOK FOR MORE", "DEER MOVE IN GROUPS"], ORANGE, { y: 0.3 });
endCard(["DEER ON THE ROAD?", "BRAKE STRAIGHT. EXPECT MORE."]);

// ---- shots ----
const SH = [
  { at: 0, cam: (t) => { const [x, z] = aPath(t); return [x - 1.2, 2.4, z + 6.5, x + 0.2, 1.0, z - 14, 48]; } },
  { at: tSw - 0.35, cam: (t) => { const [x, z] = aPath(Math.min(t, tHit)); return [x + 1.2, 5.6, z + 10.0, x - 0.6, 0.5, z - 8, 50]; } },
  { at: tHit - 0.2, K: [[0, [-7.0, 2.8, zH + 4.5, -0.6, 0.6, zH - 1.5, 48]], [T3 - tHit + 0.2, [-6.2, 3.3, zH + 3.4, -0.6, 0.5, zH - 2.2, 48]]] },
  { at: T3, cam: (t) => { const [x, z] = pB(t); return [x - 2.4, 2.8, z + 7.0, x + 1.4, 1.2, z - 14, 48]; } },
  { at: T4, cam: (t) => { const [x, z] = pB(t); return [x - 2.2, 3.4, z + 6.5, x + 0.4, 0.6, z - 10, 48]; } },
  { at: T5, cam: (t) => { const [x, z] = pB(t), k = t - T5; return [x - 0.6 + 0.3 * k, 10.5, z + 7.0, x - 0.8, 0, z - 9, 54]; } },
  { at: T6, cam: (t) => { const [x, z] = pB(t), k = t - T6; return [x - 2.6 + 0.4 * k, 3.6 + 0.15 * k, z + 7.5, x - 0.9, 0.7, z - 8, 52]; } },
  { at: T7, cam: (t) => { const [x, z] = pB(t), k = (t - T7) * 0.5; return [x - 2.4 + 1.0 * k, 3.2 + 0.4 * k, z + 7.0, x - 0.8, 0.8, z - 6, 52]; } },
];

run("w", (t) => {
  const A = t < T3;
  let st;
  if (A) {
    st = ride(Bk, aPath, t, t < T2 ? VIOLET : RED, { lean: downLean(kD(t), -1) - 0.25 * Math.sin(Math.PI * sm(tSw - 0.15, tSw + 0.8, t)) * (t < tHit ? 1 : 0), down: kD(t), trail: t < tHit });
    // deer: stands in his lane, jumps left as he swerves left, gets hit and knocked down
    if (t < tHit) D1.setD(dAx(t), zDA, -1, t, { walk: 0, y: dAy(t) });
    else { const u = sm(tHit, tHit + 0.5, t); D1.setD(-0.7 - 1.4 * u, zDA - 2.5 * u, -1, t, { walk: 0, roll: 1.5 * u }); }
    D2.setD(0, 0, 1, t, { vis: false }); D3.setD(0, 0, 1, t, { vis: false });
    if (t >= tHit) {
      const u = Math.min(1, (t - tHit) / 0.6);
      pose(THROWN, { x: -0.8 - 0.6 * u, z: zH - 0.6 - 3.2 * u, h: 0, lie: 0.3 + 0.7 * u, armR: 2.4, armL: 1.9, hex: RED });
      THROWN.g.position.y += 0.8 * Math.sin(Math.PI * u);
    } else pose(THROWN, { vis: false });
    tagAt(tDeerT, dAx(t), 2.4, zDA, on(t, tDeer, tSw), 1.6);
    hit.position.set(-0.7, 0.03, zH - 0.6); hit.set(t > tHit - 0.05 ? on(t, tHit, T3) : 0);
    setRing(rings[0], -0.7, zH - 0.6, sm(tHit, tHit + 0.9, t), RED, 0.5, 2.4);
    rings[1].visible = rings[2].visible = false;
    Bk.tail.material.color.set(RED).multiplyScalar(3);
  } else {
    pose(THROWN, { vis: false }); hit.set(0);
    st = ride(Bk, pB, t, GREEN, { trail: false, lean: 0.05 * Math.sin(Math.PI * sm(tAim - 0.1, tCame + 0.6, t)) });
    const brk = sm(tBrk - 0.05, tBrk + 0.1, t) * (1 - sm(tBrk + 0.9, tBrk + 1.2, t));
    Bk.lean.rotation.x = -0.07 * brk;
    Bk.tail.material.color.set(RED).multiplyScalar(3 + 9 * Math.max(brk, sm(tSlow - 0.1, tSlow + 0.1, t) * (1 - sm(tSlow + 0.8, tSlow + 1.0, t)), sm(tMore - 0.1, tMore + 0.1, t) * (1 - sm(tGo - 0.2, tGo, t))));
    // deer 1: crosses right to left from "see" until it's off the road
    const x1 = d1X(t);
    D1.setD(x1, zD1, -1, t, { vis: t > tSee - 0.25 && x1 > -6.5 });
    // deer 2 + 3: graze on the right shoulder in s3, then cross after deer 1 in s6
    if (t < T4) { D2.setD(4.7, zG, -1, t, { walk: 0, graze: 1 }); D3.setD(5.2, zG - 3, 1, t, { walk: 0, graze: 1 }); }
    else if (t < tLook - 0.3) { D2.setD(0, 0, 1, t, { vis: false }); D3.setD(0, 0, 1, t, { vis: false }); }
    else { const a = d2X(t), b = d3X(t); D2.setD(a, zStop - 4.6, -1, t, { vis: a > -6.5 }); D3.setD(b, zStop - 6.6, -1, t, { vis: b > -6.5 }); }
    // s4: straight green line under the wheels + shrinking stop zone
    const [bx, bz] = pB(t), kS = t >= T4 && t < T5 ? on(t, tBrk, T5) : 0;
    lineG.position.set(bx, 0.03, bz - 6); lineG.set(kS * 0.9);
    const L = Math.max(0.6, (st.v * st.v) / 16);
    stopG.scale.set(1, L, 1); stopG.position.set(bx, 0.025, bz - 0.8 - L / 2); stopG.set(kS * 0.6);
    tagAt(tStrT, bx, 2.3, bz, t < T5 ? on(t, tStr, T5) : 0, 1.0);
    // s5: green aim line to where it came from (right), red to where it's going (left)
    const kG = t >= T5 && t < T6 ? on(t, tAim, T6) : 0, kR = t >= T5 && t < T6 ? on(t, tNot, T6) : 0;
    const H = V3(bx, 0.15, bz - 0.8);
    aimG.set(H, V3(3.6, 0.15, zD1), kG); aimR.set(H, V3(-3.0, 0.15, zD1), kR * (0.4 + 0.3 * Math.sin(t * 16)));
    tagAt(tCameT, 3.4, 0.9, zD1 - 1.0, kG, 1.1); tagAt(tGoT, -3.0, 0.9, zD1, kR, 1.3);
    // s6: rings and tag on the group
    const k6 = t >= T6 ? on(t, tMore, T7 + 0.6) : 0;
    setRing(rings[0], d2X(t), zStop - 4.6, k6 > 0 ? (t - tMore + 1) % 1 : 0, ORANGE, 0.5, 1.6);
    setRing(rings[1], d3X(t), zStop - 6.6, k6 > 0 ? (t - tMore + 0.5) % 1 : 0, ORANGE, 0.5, 1.6);
    setRing(rings[2], x1, zD1, t > tSee - 0.1 && t < T5 ? sm(tSee - 0.1, tSee + 0.8, t) : 0, ORANGE, 0.5, 2.0);
    tagAt(tMoreT, 0, 0, zStop, 0, 1);
    tagAt(tDeerT, x1, 2.4, zD1, t > T4 && t < T5 ? on(t, tSee, tBrk + 0.6) : 0, 1.4);
  }
  // sun + haze stay on the horizon ahead of the camera; brighten on "sunset"
  sunM.color.set(ORANGE).multiplyScalar(1.4 + 1.2 * flash(t, g("s3", "sunrise")) + 1.2 * flash(t, tSun));
  const shot = shoot(SH, t);
  sun.position.set(camera.position.x - 30, 14, camera.position.z - 420); sun.lookAt(camera.position);
  haze.position.set(camera.position.x, 2, camera.position.z - 410);
  bloom.strength = 0.9 + 1.0 * shot.punch * shot.punch + overlays(t) + (A ? 1.0 * flash(t, tHit) : 0);
});
