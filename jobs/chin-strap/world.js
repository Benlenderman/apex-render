// 114 chin-strap: wrong = quick ride with the strap hanging loose; in a slide the helmet flies off before his head hits the road (red).
// Right = close the strap, two fingers under it, pull the helmet from the back and it stays on, then ride (green).
import { THREE, S, g, sm, flash, scene, bloom, glow, box, mSolid, VIOLET, ORANGE, RED, GREEN, road, pathState, shoot, run } from "./kit.js";
import { makePerson, pose, title, endCard, cap, overlays, bikes, ride, tag, tagAt } from "./extra.js";

// ---------- props: segment between two points, chin strap on a helmet group, loose helmet ----------
const UP = new THREE.Vector3(0, 1, 0), dV = new THREE.Vector3();
function seg(parent, mat, r) {
  const m = new THREE.Mesh(new THREE.CylinderGeometry(r, r, 1, 8), mat); parent.add(m);
  return { m, set(a, b) { dV.set(b[0] - a[0], b[1] - a[1], b[2] - a[2]); const L = dV.length() || 1e-4; m.position.set((a[0] + b[0]) / 2, (a[1] + b[1]) / 2, (a[2] + b[2]) / 2); m.scale.set(1, L, 1); m.quaternion.setFromUnitVectors(UP, dV.normalize()); } };
}
const lerp3 = (a, b, k) => a.map((v, i) => v + (b[i] - v) * k);
// strap on a head group whose helmet sphere is centred (0, 0.04, -0.04), r 0.15. close: 0 loose .. 1 buckled
function strap(G, s = 1, base = 1.6) {
  const mat = glow(RED, base), parts = [];
  for (const sd of [-1, 1]) parts.push([seg(G, mat, 0.02 * s), seg(G, mat, 0.02 * s), sd]);
  const buckle = box(0.04 * s, 0.03 * s, 0.03 * s, 0, 0, 0, mat, false); G.add(buckle);
  return {
    set(close, t, hot = 0) {
      const col = new THREE.Color(RED).lerp(new THREE.Color(GREEN), close);
      mat.color.copy(col).multiplyScalar(base * (1 - 0.45 * close) + 0.6 * hot);
      for (const [a, b, sd] of parts) {
        const sw = (1 - close) * 0.05 * Math.sin(t * 9 + sd);
        const P0 = [sd * 0.145, -0.02, -0.05].map((v) => v * s);
        const mid = lerp3([sd * 0.13 + sw, -0.17, -0.07 + sw], [sd * 0.1, -0.12, -0.12], close).map((v) => v * s);
        const end = lerp3([sd * 0.1 + 1.5 * sw, -0.31, -0.08 + sw], [sd * 0.012, -0.165, -0.14], close).map((v) => v * s);
        a.set(P0, mid); b.set(mid, end);
        if (sd > 0) buckle.position.set(...end);
      }
    },
  };
}

const LW = 3.6, XR = LW / 2;
road({ lanes: 2, lw: LW, z0: 60, z1: -500 });
scene.fog.density = 0.012;
const T2 = S.s2[0], T3 = S.s3[0], T4 = S.s4[0], T5 = S.s5[0], T6 = S.s6[0], T7 = S.s7[0];
const [BA, BB] = bikes(2), THROWN = makePerson();
THROWN.mats.head.color.set(0xd9a27a); THROWN.mats.head.emissive.set(0x5a2a10);
const stA = strap(BA.headG), stB = strap(BB.headG, 1, 1.0);

// ---- A: quick ride at 11 m/s, bike slides out; rider thrown, helmet flies off at "flies", head hits the road at "hit" ----
const V = 11;
const tHit = g("s2", "crash") - 0.05, tOff = g("s2", "flies"), tRoad = g("s2", "hit") + 0.15;
const zBH = -V * tHit;
const uH = (t) => Math.max(0, t - tHit);
const aZ = (t) => (t < tHit ? -V * t : zBH - 4.5 * (1 - Math.exp(-uH(t) / 0.5)));
const aPath = (t) => [XR + 0.6 * sm(tHit, tHit + 0.6, t), aZ(t)];
const kD = (t) => sm(tHit + 0.05, tHit + 0.35, t);
const pX = XR + 0.2, pZ = (t) => zBH - 1.0 - 5.5 * sm(tHit, tRoad + 0.6, t);
const lieK = (t) => sm(tHit + 0.1, tHit + 0.55, t);
const headW = (t) => { const a = -Math.PI / 2 * lieK(t); return [pX, 0.18 * lieK(t) + 1.7 * Math.cos(a), pZ(t) + 1.7 * Math.sin(a)]; };
// helmet: rides on the head until tOff, then flies forward and rolls
const HEL = new THREE.Group(); HEL.scale.setScalar(1.3); scene.add(HEL);
const helS = new THREE.Mesh(new THREE.SphereGeometry(0.19, 18, 14), mSolid); helS.position.set(0, 0.05, -0.05);
HEL.add(helS, box(0.27, 0.075, 0.04, 0, 0.05, -0.22, glow(VIOLET, 2), false));
const stH = strap(HEL, 1.25);
const H0 = headW(tOff), VH = [0.9, 2.6, -8.5], YL = 0.2;
const tLand = (VH[1] + Math.sqrt(VH[1] ** 2 + 2 * 9.8 * (H0[1] - YL))) / 9.8;
const helP = (t) => {
  if (t < tOff) return [...headW(t), 0];
  const u = t - tOff;
  if (u < tLand) return [H0[0] + VH[0] * u, H0[1] + VH[1] * u - 4.9 * u * u, H0[2] + VH[2] * u, u * 9];
  const r = 1 - Math.exp(-(u - tLand) / 0.45), L = [H0[0] + VH[0] * tLand, YL, H0[2] + VH[2] * tLand];
  return [L[0] + 0.5 * r, YL, L[2] - 2.6 * r, tLand * 9 + 7 * r];
};

// ---- B: parked further down the road; strap goes on; rides off at s7 ----
const ZB = -160, tGo = g("s7", "every") - 0.2;
const bPath = (t) => [XR, ZB - 0.001 * t - 4 * Math.max(0, t - tGo) ** 2];
const tClose = g("s3", "close"), kClose = (t) => sm(tClose + 0.1, tClose + 0.7, t);
// right arm: shoulder -> hand target (rider space); hand box; two fingers in head space
const armSeg = seg(BB.rider, mSolid, 0.05), glove = box(0.09, 0.08, 0.1, 0, 0, 0, new THREE.MeshStandardMaterial({ color: 0x2f9a5a, roughness: 0.6 }), false); BB.rider.add(glove);
const fingers = [-1, 1].map((s) => { const f = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 0.1, 8), glow(GREEN, 0.45)); f.rotation.x = Math.PI / 2; BB.headG.add(f); return [f, s]; });
const SHO = [0.2, 1.42, 0.02], H2R = (p) => [p[0], p[1] + 1.62, p[2] - 0.04];
const handAt = (t) => {
  const kb = sm(tClose - 0.45, tClose - 0.05, t) * (1 - sm(tClose + 0.8, tClose + 1.2, t));
  const kf = sm(g("s4", "two") - 0.4, g("s4", "two"), t) * (1 - sm(T5 - 0.3, T5, t));
  const kp = sm(g("s5", "pull") - 0.35, g("s5", "pull"), t) * (1 - sm(T6 - 0.4, T6, t));
  if (kb > 0.001) return [kb, H2R([0.03, -0.17, -0.2])];
  if (kf > 0.001) return [kf, H2R([0.0, -0.15, -0.3 + 0.08 * sm(g("s4", "two"), g("s4", "fit"), t)])];
  if (kp > 0.001) return [kp, H2R([0.02, 0.12, 0.2])];
  return [0, SHO];
};
const tiltK = (t) => sm(g("s5", "up") - 0.1, g("s5", "up") + 0.35, t) * (1 - sm(g("s5", "roll") - 0.1, g("s5", "roll") + 0.4, t));
const hW = new THREE.Vector3();

const tLoose = tag("LOOSE", RED), tOk = tag("STAYS ON", GREEN), tHelm = tag("HELMET", RED);
title("NEVER RIDE WITH A LOOSE CHIN STRAP");
cap("s2", "crash", ["IN A CRASH", "THE HELMET FLIES OFF"], RED, { y: 0.3, boom: 0.6 });
cap("s3", "close", ["CLOSE THE STRAP", "EVERY TIME"], GREEN, { y: 0.3 });
cap("s4", "tight", ["ONLY TWO FINGERS", "UNDER THE STRAP"], GREEN, { y: 0.3 });
cap("s5", "pull", ["PULL IT UP FROM THE BACK", "IT MUST STAY ON"], GREEN, { y: 0.3 });
cap("s6", "open", ["AN OPEN HELMET", "PROTECTS NOTHING"], RED, { y: 0.3 });
endCard(["STRAP CLOSED.", "EVERY RIDE."]);

const Bf = (fn) => (t) => pathState(fn, t);
const SH = [
  // hook: close on the rider's face, strap flapping below the chin
  { at: 0, f: Bf(aPath), noRot: 1, calm: 1, K: [[0, [-1.5, 1.95, -2.1, 0, 1.45, -0.1, 34]], [2.4, [-1.3, 1.9, -1.9, 0, 1.5, -0.1, 34]]] },
  // s2: high behind-left: bike slides out, rider thrown, helmet flies ahead
  { at: T2, cam: (t) => { const z = aZ(Math.min(t, tHit)) - 3 * sm(tHit, tHit + 1.2, t); return [XR - 2.2, 4.2, z + 4.5, XR + 0.3, 0, z - 5.5, 50]; } },
  // s3: close front-left on the chin: strap closes
  { at: T3, f: Bf(bPath), noRot: 1, calm: 1, K: [[0, [-1.3, 1.85, -1.7, 0, 1.5, -0.1, 34]], [2, [-1.2, 1.82, -1.6, 0, 1.5, -0.1, 34]]] },
  // s4: low in front: two fingers under the strap
  { at: T4, f: Bf(bPath), noRot: 1, calm: 1, K: [[0, [-0.9, 1.6, -2.0, 0, 1.68, -0.1, 32]], [2, [-0.85, 1.6, -1.9, 0, 1.68, -0.1, 32]]] },
  // s5: side view: hand pulls the back of the helmet up, it stays on
  { at: T5, f: Bf(bPath), noRot: 1, calm: 1, K: [[0, [-2.0, 1.95, 0.3, 0, 1.68, -0.05, 36]], [2, [-1.9, 1.93, 0.25, 0, 1.68, -0.05, 36]]] },
  // s6: back at the crash: the helmet lies on the road away from the rider
  { at: T6, cam: (t) => { const h = helP(T6), z = (h[2] + pZ(T6)) / 2; return [pX - 2, 2.2, pZ(T6) + 2.5 + 0.2 * (t - T6), h[0], 0.1, h[2], 45]; } },
  // s7: strap closed, rider pulls away
  { at: T7, f: Bf(bPath), noRot: 1, K: [[0, [-1.4, 1.9, -1.9, 0, 1.5, -0.1, 36]], [2.5, [-1.6, 2.6, 4, 0, 1.2, -6, 46]]] },
];

const on = (t, a, b = 1e9) => sm(a - 0.1, a + 0.2, t) * (1 - sm(b - 0.15, b, t));
run("w", (t) => {
  // A, always on (its aftermath is shown again in s6)
  const k = kD(t), s0 = pathState(aPath, t);
  const st = ride(BA, aPath, t, t < T2 ? VIOLET : RED, k > 0 ? { lean: 1.45 * k - s0.lean * k, down: k, trail: t < tHit + 1 } : {});
  stA.set(0, t);
  if (t > tHit + 0.1) pose(THROWN, { x: pX, z: pZ(t), h: 0, lie: lieK(t), armR: 2.4 - 1.6 * lieK(t), armL: 2.0 - 1.4 * lieK(t), hex: RED });
  else pose(THROWN, { vis: false });
  const hp = helP(t);
  HEL.visible = t > tHit + 0.1; HEL.position.set(hp[0], hp[1] - 0.05, hp[2] + 0.05); HEL.rotation.set(-hp[3], 0, 0.3 * hp[3] * (t > tOff ? 1 : 0));
  stH.set(0, t, t > tOff ? 0.8 : 0);
  tagAt(tLoose, st.x - 0.1, 1.2, st.z - 0.3, t < T2 ? on(t, g("s1", "loose"), T2) : 0, 0.22);
  tagAt(tHelm, hp[0], 0.75, hp[2], 0, 0.6);
  // B
  const sb = ride(BB, bPath, t, GREEN, { trail: t > tGo });
  stB.set(kClose(t), t, 0);
  const [ka, hand] = handAt(t), ch = BB.rider.children;
  armSeg.m.visible = glove.visible = ka > 0.001; ch[5].visible = ch[11].visible = ka <= 0.001;
  const hpos = lerp3(SHO.map((v, i) => [0.39, 1.07, -0.47][i]), hand, ka); glove.position.set(...hpos); armSeg.set(SHO, hpos);
  const kf = on(t, g("s4", "two") - 0.1, T5 - 0.2);
  fingers.forEach(([f, s]) => { f.visible = kf > 0.01; f.position.set(s * 0.02, -0.142, -0.32 + 0.16 * sm(g("s4", "two"), g("s4", "fit"), t)); });
  const kt = tiltK(t); BB.headG.rotation.x = -0.32 * kt; BB.headG.position.y = 1.62 + 0.04 * kt;
  BB.headG.getWorldPosition(hW);
  tagAt(tOk, hW.x, hW.y + 0.42, hW.z, 0, 0.16);
  const shot = shoot(SH, t);
  bloom.strength = 1.0 + 1.2 * shot.punch * shot.punch + overlays(t) + 0.8 * flash(t, tHit + 0.05) + 0.5 * flash(t, tRoad);
});
