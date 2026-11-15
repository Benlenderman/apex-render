// 136 chain-check: wrong = slack chain slaps, jumps off the rear sprocket, the back wheel locks and the bike skids (red).
// Right = once a week push the chain up and down in the middle, movement inside the manual's range, clean, lube, ride off (green).
import { THREE, S, g, sm, flash, scene, bloom, box, tube, glow, beam, patch, VIOLET, ORANGE, RED, GREEN, pathState, shoot, run } from "./kit.js";
import { track, buildRoad, title, endCard, cap, overlays, bikes, ride, dist, mSkin } from "./extra.js";

scene.fog.density = 0.01;
const T2 = S.s2[0], T3 = S.s3[0], T4 = S.s4[0], T5 = S.s5[0], T6 = S.s6[0], T7 = S.s7[0];
const O = 1.8;
const { P } = track([{ len: 600 }]);
buildRoad(P, -60, 400);
const wp = (o, v = new THREE.Vector3()) => o.getWorldPosition(v);

// ---- timing ----
const tSlap = g("s1", "slapping"), tJump = g("s2", "jumps"), tSpr = g("s2", "sprocket"), tLock = g("s2", "locks");
const tPush = g("s3", "push"), tUp = g("s3", "up"), tDown = g("s3", "down"), tMid = g("s3", "middle");
const tOnly = g("s4", "only"), tMan = g("s4", "manual");
const tClean = g("s5", "clean"), tLube = g("s5", "chain");
const tTight = g("s6", "tight"), tTurn = g("s6", "turning");

// ---- motion ----
const vA = (t) => 5 * (1 - sm(tLock, tLock + 0.9, t)), DA = dist(vA, 0, 30), zA = (t) => -DA(t);
const pA = (t) => [O, zA(t)];
const rotLock = zA(tLock) / 0.33;
const vB = (t) => 6 * sm(T6 + 0.1, T6 + 1.3, t), DB = dist(vB, T3, 30), pB = (t) => [O, -DB(t)];
// chain travel (its own slow rate so links read clearly)
const cv = (t) => (t < T3 ? 0.55 * (1 - sm(tSpr - 0.2, tLock, t)) : t < T5 ? 0 : t < T6 ? 0.22 * sm(T5, T5 + 0.3, t) : 0.22 + 0.4 * sm(T6, T6 + 1, t));
const CD = dist(cv, 0, 30);

const [Bk] = bikes(1);
// ---- chain loop on the left side (local coords of the leaning bike) ----
const CX = -0.27, F = { y: 0.37, z: 0.1, r: 0.07 }, R = { y: 0.33, z: 0.68, r: 0.12 };
const Lt = Math.hypot(R.z - F.z, R.y + R.r - F.y - F.r), Lb = Math.hypot(R.z - F.z, R.y - R.r - F.y + F.r);
const LR = Math.PI * R.r, LF = Math.PI * F.r, LT = Lt + LR + Lb + LF;
const C = { sag: 0.02, topSag: 0, drop: 0, side: 0 };
function cpt(d, out) {
  d = ((d % LT) + LT) % LT;
  let y, z, x = CX;
  if (d < Lt) { const q = d / Lt; y = F.y + F.r + (R.y + R.r - F.y - F.r) * q - C.topSag * Math.sin(Math.PI * q); z = F.z + (R.z - F.z) * q; }
  else if (d < Lt + LR) { const a = ((d - Lt) / LR) * Math.PI; y = R.y + R.r * Math.cos(a) - C.drop * Math.sin(a / 2); z = R.z + R.r * Math.sin(a) + 0.05 * C.drop; x -= C.side * Math.sin(a / 2); }
  else if (d < Lt + LR + Lb) { const q = (d - Lt - LR) / Lb; y = R.y - R.r + (F.y - F.r - R.y + R.r) * q - C.sag * Math.sin(Math.PI * q) - C.drop * (1 - q); z = R.z + (F.z - R.z) * q; x -= C.side * (1 - q); }
  else { const a = ((d - Lt - LR - Lb) / LF) * Math.PI; y = F.y - F.r * Math.cos(a); z = F.z - F.r * Math.sin(a); }
  return out.set(x, y, z);
}
const N = 38, mDull = glow(0x8a6a4a, 0.7), mLube = glow(GREEN, 1.2), mChain = glow(RED, 1.8);
const links = Array.from({ length: N }, () => { const m = box(0.03, 0.028, 0.042, 0, 0, 0, mChain, false); Bk.lean.add(m); return m; });
const P0 = new THREE.Vector3(), P1 = new THREE.Vector3();
function placeChain(d0, lubed, clean) {
  for (let i = 0; i < N; i++) {
    const d = d0 + (i / N) * LT;
    cpt(d, P0); cpt(d + 0.01, P1);
    links[i].position.copy(P0); links[i].rotation.x = -Math.atan2(P1.y - P0.y, P1.z - P0.z);
    links[i].material = lubed != null ? (i / N < lubed ? mLube : clean ? mChain : mDull) : mChain;
  }
}
// sprockets
function sprocket(r, n, mat) {
  const s = new THREE.Group();
  const d = new THREE.Mesh(new THREE.CylinderGeometry(r * 0.85, r * 0.85, 0.012, 32), mat); d.rotation.z = Math.PI / 2; s.add(d);
  for (let i = 0; i < n; i++) { const tt = box(0.012, 0.03, 0.02, 0, 0, 0, mat, false); const a = (i / n) * Math.PI * 2; tt.position.set(0, r * Math.cos(a), r * Math.sin(a)); tt.rotation.x = -a; s.add(tt); }
  return s;
}
const mSpr = glow(ORANGE, 1.1);
const rearS = sprocket(R.r, 18, mSpr); rearS.position.set(CX, 0, 0); Bk.rearW.add(rearS);
Bk.rearW.add(tube([0, 0, 0], [CX, 0, 0], 0.025, mSpr));
const frontS = sprocket(F.r, 10, mSpr); frontS.position.set(CX, F.y, F.z); Bk.lean.add(frontS);
const mid = new THREE.Object3D(); Bk.lean.add(mid); // middle of the bottom run
// hand that pushes the chain
const hand = new THREE.Group(); scene.add(hand);
hand.add(box(0.07, 0.05, 0.1, 0, 0, 0, mSkin, false), tube([0, -0.02, 0], [-0.25, -0.35, 0.15], 0.035, mSkin));
// arrows + gauge + manual
const mArr = glow(GREEN, 2.4);
const arrU = new THREE.Mesh(new THREE.ConeGeometry(0.03, 0.07, 12), mArr), arrD = new THREE.Mesh(new THREE.ConeGeometry(0.03, 0.07, 12), mArr);
arrD.rotation.x = Math.PI; scene.add(arrU, arrD);
const gauge = new THREE.Group(); scene.add(gauge);
const mRule = glow(VIOLET, 1.2), mBand = glow(GREEN, 1.6), mTick = glow(ORANGE, 3);
gauge.add(box(0.012, 0.26, 0.012, 0, 0, 0, mRule, false));
for (let i = -4; i <= 4; i++) gauge.add(box(0.03, 0.004, 0.006, 0.015, i * 0.03, 0, mRule, false));
const band = box(0.03, 0.065, 0.03, 0, 0, 0, mBand, false); gauge.add(band);
const tick = box(0.07, 0.008, 0.02, 0.02, 0, 0, mTick, false); gauge.add(tick);
const book = new THREE.Group(); scene.add(book);
const mCov = glow(VIOLET, 1.6), mPage = glow(0xffffff, 1.2);
const cL = new THREE.Group(), cR = new THREE.Group(); book.add(cL, cR);
cL.add(box(0.012, 0.2, 0.14, 0, 0, -0.07, mCov, false), box(0.008, 0.18, 0.125, 0.008, 0, -0.07, mPage, false));
cR.add(box(0.012, 0.2, 0.14, 0, 0, 0.07, mCov, false), box(0.008, 0.18, 0.125, 0.008, 0, 0.07, mPage, false));
for (let i = 0; i < 4; i++) cR.add(box(0.004, 0.006, 0.09, 0.014, 0.05 - i * 0.03, 0.07, glow(GREEN, 1.6), false));
const ref = beam(GREEN, 1.6, 0.01);
// brush, lube can, mist
const brush = new THREE.Group(); scene.add(brush);
brush.add(box(0.04, 0.03, 0.16, 0, 0.03, 0, glow(VIOLET, 1.4), false), box(0.05, 0.03, 0.15, 0, -0.005, 0, glow(0xd8c8ff, 1), false), tube([0, 0.04, 0], [-0.2, 0.35, 0], 0.015, glow(VIOLET, 1.4)));
const can = new THREE.Group(); scene.add(can);
can.add(new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.035, 0.16, 16), glow(GREEN, 1.3)));
const noz = box(0.02, 0.03, 0.02, 0, 0.09, 0, glow(0xffffff, 1.5), false); can.add(noz);
const mist = beam(GREEN, 1.5, 0.03);
// skid mark, rings
const skid = patch(0.14, 1, RED, 1.4);
const ringM = new THREE.MeshBasicMaterial({ color: 0, toneMapped: false, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false });
const ring = new THREE.Mesh(new THREE.RingGeometry(0.34, 0.39, 48), ringM); scene.add(ring);
const pulseRing = (p, k, hex, s0 = 0.4, s1 = 1.4) => { if (k <= 0 || k >= 1) return; ring.visible = true; ring.position.copy(p); ring.rotation.set(0, -Math.PI / 2, 0); ring.scale.setScalar(s0 + (s1 - s0) * k); ringM.color.set(hex).multiplyScalar(2.6 * (1 - k)); };

title("NEVER IGNORE A LOOSE CHAIN");
cap("s1", "slapping", ["CHAIN", "SLAPPING?"], RED, { y: 0.3, until: ["s2", "jumps"] });
cap("s2", "jumps", ["JUMPS OFF", "THE SPROCKET"], RED, { y: 0.3, until: ["s2", "locks"] });
cap("s2", "locks", ["BACK WHEEL", "LOCKS"], RED, { y: 0.3, boom: 0.6 });
cap("s3", "once", ["ONCE A WEEK"], GREEN, { y: 0.3, until: ["s3", "push"] });
cap("s3", "push", ["PUSH IT UP", "AND DOWN"], GREEN, { y: 0.3, until: ["s3", "middle"] });
cap("s3", "middle", ["IN THE MIDDLE"], GREEN, { y: 0.3 });
cap("s4", "check", ["ONLY AS MUCH AS", "YOUR MANUAL SAYS"], GREEN, { y: 0.3 });
cap("s5", "clean", ["CLEAN IT"], GREEN, { y: 0.3, until: ["s5", "put"] });
cap("s5", "put", ["THEN LUBE IT"], GREEN, { y: 0.3 });
cap("s6", "tight", ["TIGHT AND OILED"], GREEN, { y: 0.3, until: ["s6", "keeps"] });
cap("s6", "keeps", ["WHEEL KEEPS", "TURNING"], GREEN, { y: 0.3 });
endCard(["CHECK THE CHAIN.", "LUBE THE CHAIN."]);

// chain centre in world for B (bike parked at O, 0)
const MZ = (F.z + R.z) / 2, MY = (F.y - F.r + R.y - R.r) / 2;
const SH = [
  { at: 0, cam: (t, su) => { const z = zA(t); return [O - 2.8 + 0.4 * Math.min(1, su / 2), 0.85, z + 1.0, O - 0.15, 0.5, z + 0.3, 44]; } },
  { at: tJump - 0.1, cam: (t, su) => { const z = zA(t); return [O - 1.8, 0.55, z + 0.9, O - 0.2, 0.36, z + 0.55, 42]; } },
  { at: tLock - 0.1, cam: (t, su) => { const z = zA(t); return [O - 3.0, 1.3, z + 2.6, O - 0.1, 0.35, z + 0.5, 46]; } },
  { at: T3, K: [[0, [O - 1.9, 0.62, MZ + 0.15, O - 0.25, MY + 0.1, MZ, 40]], [T4 - T3, [O - 1.7, 0.58, MZ + 0.05, O - 0.25, MY + 0.1, MZ, 40]]] },
  { at: T4, K: [[0, [O - 2.1, 0.75, MZ + 0.35, O - 0.3, MY + 0.16, MZ - 0.05, 42]], [T5 - T4, [O - 2.0, 0.72, MZ + 0.2, O - 0.3, MY + 0.16, MZ - 0.05, 42]]] },
  { at: T5, K: [[0, [O - 1.9, 0.7, MZ - 0.05, O - 0.25, MY + 0.12, MZ + 0.05, 42]], [T6 - T5, [O - 1.8, 0.66, MZ + 0.15, O - 0.25, MY + 0.12, MZ + 0.05, 42]]] },
  { at: T6, f: (t) => pathState(pB, t), noRot: true, K: [[0, [-2.4, 0.75, 0.7, -0.15, 0.55, 0.35, 44]], [T7 - T6, [-2.6, 1.0, 1.3, -0.1, 0.4, 0.2, 46]]] },
  { at: T7 + 0.3, f: (t) => pathState(pB, t), noRot: true, K: [[0, [-3.0, 1.6, 2.6, 0, 0.4, -0.6, 48]], [2, [-3.2, 1.8, 3.0, 0, 0.4, -0.8, 48]]] },
];

const V = new THREE.Vector3(), V2 = new THREE.Vector3();
run("w", (t) => {
  const A = t < T3;
  ring.visible = false;
  if (A) {
    hand.visible = gauge.visible = book.visible = brush.visible = can.visible = arrU.visible = arrD.visible = false;
    mist.set(V, V, 0); ref.set(V, V, 0);
    const fk = sm(tLock, tLock + 0.5, t) * (1 - sm(tLock + 1.2, tLock + 2, t));
    const st = ride(Bk, pA, t, RED, { trail: t < tLock, h: 0.3 * fk * Math.sin((t - tLock) * 9) + 0.18 * sm(tLock, tLock + 1, t), lean: -0.08 * fk });
    if (t > tLock) Bk.rearW.rotation.x = rotLock;
    // slack + slap, then off the sprocket
    const j = sm(tJump, tSpr + 0.15, t);
    C.sag = 0.07 + 0.045 * Math.sin(t * 31) * (1 - j * 0.6); C.topSag = 0.02 * Math.sin(t * 27 + 1);
    C.drop = 0.16 * j; C.side = 0.06 * j;
    mChain.color.set(RED).multiplyScalar(1.8 + 1.5 * flash(t, tSpr) + 0.6 * Math.max(0, Math.sin(t * 31)) * (1 - j));
    mSpr.color.set(j > 0.3 ? RED : ORANGE).multiplyScalar(1.1 + 2 * flash(t, tSpr));
    placeChain(CD(t), null);
    // skid behind the locked wheel
    const z0 = zA(tLock) + 0.68, z1 = zA(t) + 0.68;
    skid.visible = t > tLock; skid.position.set(O, 0.02, (z0 + z1) / 2); skid.scale.z = Math.max(0.01, z0 - z1); skid.set(t > tLock ? 1 : 0);
    Bk.g.updateMatrixWorld(true);
    pulseRing(wp(Bk.rearW, V), sm(tLock - 0.05, tLock + 0.6, t), RED);
  } else {
    skid.visible = false;
    ride(Bk, pB, t, GREEN, { trail: t > T6 + 0.4 });
    Bk.rider.visible = t > T6 - 0.4;
    C.drop = 0; C.side = 0; C.topSag = 0;
    // push up and down in the middle (inside the manual's range)
    const pk = t < T5 ? sm(tUp - 0.1, tUp + 0.05, t) : 0;
    const disp = 0.03 * pk * Math.sin((t - tUp) * 2 * Math.PI * 1.4);
    C.sag = t < T6 ? 0.02 - disp : 0.012;
    const clean = t > tClean + 0.3;
    const lubed = t < tLube ? 0 : sm(tLube, tLube + 1.1, t);
    if (t < T5) { mChain.color.set(VIOLET).multiplyScalar(1.6); }
    else mChain.color.set(VIOLET).multiplyScalar(1.6 + 1.2 * flash(t, tClean + 0.3));
    mSpr.color.set(ORANGE).multiplyScalar(1.1);
    placeChain(CD(t), t < T6 ? lubed : 1, clean || t < T5 ? true : false);
    if (t < T5) mDull.color.set(0x8a6a4a).multiplyScalar(0.7);
    Bk.g.updateMatrixWorld(true);
    // middle point of the bottom run (world)
    cpt(LT - LF - Lb / 2, V); mid.position.copy(V); const M = wp(mid, V2);
    hand.visible = t > tPush - 0.35 && t < T5 + 0.2;
    const hin = sm(tPush - 0.35, tPush + 0.05, t) * (1 - sm(T5 - 0.1, T5 + 0.2, t));
    hand.position.set(M.x - 0.06 - 0.25 * (1 - hin), M.y - 0.045 - 0.3 * (1 - hin), M.z);
    arrU.visible = arrD.visible = t > tUp - 0.1 && t < T4 + 0.2;
    const au = sm(tUp - 0.1, tUp + 0.1, t), ad = sm(tDown - 0.1, tDown + 0.1, t);
    arrU.position.set(M.x - 0.08, M.y + 0.1, M.z + 0.02); arrU.scale.setScalar(au * (1 + 0.4 * flash(t, tUp)));
    arrD.position.set(M.x - 0.08, M.y - 0.12, M.z + 0.02); arrD.scale.setScalar(ad * (1 + 0.4 * flash(t, tDown)));
    if (t > tMid - 0.05 && t < tMid + 0.6) { pulseRing(M, sm(tMid - 0.05, tMid + 0.55, t), GREEN, 0.15, 0.5); }
    // gauge beside the middle; band = what the manual allows
    gauge.visible = t > T4 - 0.15 && t < T5 + 0.1;
    gauge.position.set(M.x - 0.06, MY - 0.02 + 0.0, M.z - 0.12); gauge.scale.setScalar(sm(T4 - 0.15, T4 + 0.2, t));
    tick.position.y = M.y - (MY - 0.02);
    mBand.color.set(GREEN).multiplyScalar(0.8 + 1.6 * sm(tOnly - 0.1, tOnly + 0.2, t) + 1.2 * flash(t, tMan + 0.2));
    book.visible = t > tMan - 0.3 && t < T5 + 0.1;
    const bo = sm(tMan - 0.3, tMan + 0.15, t);
    book.position.set(M.x - 0.12, MY + 0.26, M.z - 0.32); book.scale.setScalar(bo);
    cL.rotation.y = 0.9 * bo; cR.rotation.y = -0.9 * bo;
    ref.set(wp(book, V), wp(band, new THREE.Vector3()), book.visible ? sm(tMan, tMan + 0.25, t) * (1 - sm(T5 - 0.2, T5, t)) : 0);
    // s5 clean then lube
    brush.visible = t > tClean - 0.25 && t < tLube - 0.05;
    const bq = sm(tClean - 0.25, tClean, t);
    brush.position.set(M.x - 0.03 - 0.3 * (1 - bq), M.y - 0.05, M.z + 0.13 * Math.sin((t - tClean) * 14));
    can.visible = t > tLube - 0.3 && t < T6;
    can.position.set(M.x - 0.2, M.y - 0.12, M.z + 0.15); can.rotation.set(0, 0, -0.9);
    const mk = can.visible ? sm(tLube - 0.05, tLube + 0.1, t) * (1 - sm(T6 - 0.15, T6, t)) : 0;
    mist.set(wp(noz, V), M, mk);
    if (t > tTurn - 0.05) pulseRing(wp(Bk.rearW, V), sm(tTurn - 0.05, tTurn + 0.6, t), GREEN);
  }
  const shot = shoot(SH, t);
  bloom.strength = 0.7 + 1.0 * shot.punch * shot.punch + overlays(t) + (A ? 0.8 * flash(t, tLock) : 0.3 * flash(t, tMan));
});
