// 115 gloves-always: wrong = short ride with bare hands (red), the bike goes down, the rider's hands hit the road first and scrape
// (sparks, red scrape marks), slow replay of the hands going down first. Right = a motorcycle glove with a palm slider (green),
// the wrist strap closes tight, then the gloved rider rides the short trip to the shop.
import { THREE, S, g, sm, flash, scene, bloom, box, glow, VIOLET, ORANGE, RED, GREEN, WHITE, pathState, shoot, run, patch, textPlane } from "./kit.js";
import { track, buildRoad, makePerson, title, endCard, cap, overlays, bikes, ride, downLean, tag, tagAt, dist } from "./extra.js";

// ---- props ----
function makeGlove() { // fingers up (+y), palm faces +z
  const G = new THREE.Group(); scene.add(G);
  const m = new THREE.MeshStandardMaterial({ color: 0x2e2878, emissive: 0x2a2280, roughness: 0.5 });
  const add = (w, h, d, x, y, z, mat = m, e = true) => { const b = box(w, h, d, x, y, z, mat, e); G.add(b); return b; };
  add(0.95, 1.0, 0.32, 0, 0, 0); // palm
  [[-0.36, 0.74], [-0.12, 0.88], [0.12, 0.84], [0.36, 0.68]].forEach(([x, L]) => add(0.2, L, 0.26, x, 0.52 + L / 2, 0));
  const th = add(0.24, 0.6, 0.26, 0.62, 0.02, 0.05); th.rotation.z = -0.65;
  const slider = add(0.66, 0.36, 0.05, 0, -0.24, 0.18, glow(GREEN, 0.5), false); // hard slider on the heel of the palm
  add(0.88, 0.28, 0.06, 0, 0.34, -0.19, glow(GREEN, 1.0), false); // knuckle armour (back)
  const cuff = add(1.0, 0.62, 0.38, 0, -0.82, 0);
  const hinge = new THREE.Group(); hinge.position.set(-0.52, -0.84, 0.21); G.add(hinge);
  const mStrap = glow(GREEN, 0.5), strap = box(1.08, 0.32, 0.06, 0.54, 0, 0.02, mStrap, true); hinge.add(strap);
  return { G, slider, cuff, hinge, mStrap };
}
function makeShop(x, z) {
  const G = new THREE.Group(); G.position.set(x, 0, z); scene.add(G);
  G.add(box(4, 3.0, 5, 0, 1.5, 0), box(0.05, 2.0, 1.4, -2.02, 1.0, 0.6, glow(VIOLET, 1.4), false), box(0.05, 1.4, 1.6, -2.02, 1.5, -1.3, glow(0xffd28a, 1.2), false));
  const sign = textPlane([["SHOP", 210, 256]], 3.2, ORANGE, 0.4); sign.position.set(-2.06, 3.5, 0); sign.rotation.y = -Math.PI / 2; sign.visible = true; sign.renderOrder = 4; sign.material.depthTest = true;
  return { G, sign };
}

scene.fog.density = 0.009;
const { P } = track([{ len: 4000 }]);
buildRoad(P, -80, 1500, { lamps: true });
const T2 = S.s2[0], T3 = S.s3[0], T4 = S.s4[0], T5 = S.s5[0], T6 = S.s6[0], T7 = S.s7[0];
const OL = 1.8, V = 11;

// ---- A: bare hands, the bike goes down, hands hit first ----
const tF0 = g("s2", "fall") - 0.2, tHit = Math.max(tF0 + 0.45, g("s2", "hit") - 0.05);
const fd = tHit - tF0, s0 = 60;
const sBk = (t) => (t < tF0 ? s0 + V * t : s0 + V * tF0 + V * 0.7 * (1 - Math.exp(-(t - tF0) / 0.7)));
const kDown = (t) => sm(tF0, tF0 + 0.45, t);
const bikeA = (t) => P(sBk(t), OL + 0.7 * sm(tF0, tF0 + 1.2, t));
const sP = (t) => { const u = Math.max(0, t - tF0); return s0 + V * tF0 + 0.3 + (u < fd ? V * 0.95 * u : V * 0.95 * fd + V * 0.95 * 0.5 * (1 - Math.exp(-(u - fd) / 0.5))); };
const persA = (t) => (t < tF0 ? bikeA(t) : P(sP(t), OL - 0.2 * sm(tF0, tHit, t)));
const [Bk] = bikes(1), MAN = makePerson();
const hands = [MAN.armL.userData.hand, MAN.armR.userData.hand], mBare = glow(RED, 2.2);
hands.forEach((h) => { h.material = mBare; h.scale.setScalar(1.5); });
const rHands = [Bk.rider.children[10], Bk.rider.children[11]], mBareR = glow(RED, 2.4), mGlove = glow(GREEN, 1.6);
rHands.forEach((h) => h.scale.setScalar(1.45));
const scrape = [patch(0.16, 1, RED, 1.6), patch(0.16, 1, RED, 1.6)], touch = patch(1.6, 1.0, RED, 1.2);
const sparks = Array.from({ length: 30 }, (_, i) => { const b = box(0.06, 0.06, 0.06, 0, -5, 0, glow(i % 3 ? ORANGE : RED, 4), false); scene.add(b); return b; });
const rnd = (i, k) => Math.abs(Math.sin(i * 12.9898 + k * 78.233) * 43758.5453) % 1;
const vH = new THREE.Vector3(), vH2 = new THREE.Vector3();
// the thrown rider: tips forward face-down, arms reaching ahead; hands touch at tHit then slide
function thrown(t) {
  if (t < tF0) { MAN.g.visible = false; return null; }
  MAN.g.visible = true;
  const [x, z] = persA(t), k = sm(tF0, tHit, t), p = Math.min(1, (t - tF0) / fd);
  MAN.g.position.set(x, 0, z); MAN.g.rotation.set(0, 0, 0);
  MAN.body.rotation.set(-1.32 * k, 0, 0);
  const a = 0.9 + 1.6 * sm(tF0, tF0 + fd * 0.6, t);
  MAN.armR.rotation.set(a, 0, -0.12); MAN.armL.rotation.set(a, 0, 0.12);
  MAN.g.updateMatrixWorld(true);
  hands[0].getWorldPosition(vH); hands[1].getWorldPosition(vH2);
  const need = 0.07 - Math.min(vH.y, vH2.y);
  MAN.g.position.y = t < tHit ? Math.max(need, 0.55 * Math.sin(Math.PI * p) + 0.25 * (1 - p)) : need;
  MAN.g.updateMatrixWorld(true);
  hands[0].getWorldPosition(vH); hands[1].getWorldPosition(vH2);
  return [vH.clone(), vH2.clone()];
}
const H0 = thrown(tHit); // where the hands first touch the road

// ---- B: glove close-up, then the short ride to the shop ----
const GX = -16, GY = 2.4, GZ = -1000;
const GL = makeGlove(); GL.G.position.set(GX, GY, GZ);
const tPalm = g("s4", "palm"), tClose = g("s5", "close"), tTight = g("s5", "tight");
const sB0 = 1300, vB = (t) => 8 * (1 - sm(T7 + 0.2, T7 + 1.8, t)), DB = dist(vB, T6, T7 + 4);
const sB = (t) => sB0 + DB(t), bikeB = (t) => P(sB(t), OL);
const sShop = sB(T7 + 1.8) + 1.5;
const SHOP = makeShop(...P(sShop, 8.2));
const shopZone = patch(3.2, 4, GREEN, 0.8); { const [x, z] = P(sShop, 5.4); shopZone.position.set(x, 0.03, z); }
const tOn = tag("GLOVES ON", GREEN), tSlide = tag("PALM SLIDER", GREEN), wrist = patch(1.2, 0.5, GREEN, 0.35);

title("NEVER SKIP THE GLOVES");
cap("s1", "short", ["SHORT RIDE?"], VIOLET, { until: ["s1", "never"] });
cap("s2", "fall", ["YOU FALL"], RED, { y: 0.3, until: ["s2", "hands"] });
cap("s2", "hands", ["YOUR HANDS HIT", "THE ROAD FIRST"], RED, { y: 0.3, until: ["s2", "skin"] });
cap("s2", "skin", ["AND THE SKIN", "IS GONE"], RED, { y: 0.3, boom: 0.5 });
cap("s3", "in", ["IN A FALL, HANDS", "ALWAYS GO DOWN FIRST"], ORANGE, { y: -0.2 });
cap("s4", "wear", ["WEAR MOTORCYCLE", "GLOVES"], GREEN, { until: ["s4", "palm"] });
cap("s4", "palm", ["WITH PALM", "PROTECTION"], GREEN);
cap("s5", "make", ["CLOSED TIGHT", "AT THE WRIST"], GREEN);
cap("s6", "every", ["EVERY RIDE"], GREEN, { until: ["s6", "even"] });
cap("s6", "even", ["EVEN TO THE SHOP", "DOWN THE ROAD"], GREEN);
endCard(["HANDS GO DOWN FIRST.", "COVER THEM."]);

// ---- replay clock: s3 replays the fall in slow motion ----
const rT0 = tF0 - 0.25, rate = Math.min(0.6, Math.max(0.3, (tHit - rT0) / Math.max(0.4, g("s3", "down") - T3)));
const tA = (t) => (t < T3 ? t : rT0 + (t - T3) * rate);

const fol = (fn) => (t) => pathState(fn, t);
const cam = (s, o, y, ls, lo, ly, f) => { const [x, z] = P(s, o), [lx, lz] = P(ls, lo); return [x, y, z, lx, ly, lz, f]; };
const persR = (t) => persA(tA(t));
const glove = (dx, dy, dz, lx, ly, lz, f) => [GX + dx, GY + dy, GZ + dz, GX + lx, GY + ly, GZ + lz, f];
const SH = [
  // s1: ahead-left of the rider, his bare red hands on the bars
  { at: 0, f: fol(bikeA), noRot: true, K: [[0, [-1.7, 1.75, -3.4, 0.1, 1.0, 0, 46]], [2.4, [-1.4, 1.6, -3.0, 0.1, 1.0, 0, 46]]] },
  // s2: side view, the bike goes down and the rider is thrown hands first
  { at: T2, f: fol(persA), noRot: true, K: [[0, [-5.2, 2.6, 0.6, 0, 0.6, -1.0, 48]], [4, [-5.0, 2.4, 0.2, 0, 0.4, -1.5, 48]]] },
  // s3: slow replay, low and close on the hands
  { at: T3, K: [[0, [H0[0].x - 1.7, 1.7, H0[0].z - 5.5, H0[0].x, 0.6, H0[0].z + 3, 46]], [3.2, [H0[0].x - 1.5, 1.4, H0[0].z - 6.0, H0[0].x, 0.4, H0[0].z + 1.5, 46]]] },
  // s4-s5: the glove
  { at: T4, K: [[0, glove(2.2, 0.8, 7.2, 0, 0.2, 0, 46)], [3.4, glove(0.8, 0.5, 6.4, 0, 0.1, 0, 46)]] },
  { at: T5, K: [[0, glove(1.6, 0.2, 5.4, 0, -0.3, 0, 46)], [3.4, glove(1.1, 0.0, 4.8, 0, -0.45, 0, 46)]] },
  // s6: gloved rider rides off to the shop
  { at: T6, f: fol(bikeB), noRot: true, K: [[0, [-1.6, 1.8, -3.4, 0.1, 1.0, 0, 46]], [1.4, [-1.9, 2.2, -3.8, 0.2, 1.0, 0, 46]]] },
  { at: g("s6", "shop") - 0.6, f: fol(bikeB), noRot: true, K: [[0, [0.4, 3.4, 7.5, 3.2, 1.2, -12, 48]], [3, [0.2, 3.2, 7.0, 2.6, 1.0, -8, 48]]] },
];

run("w", (t) => {
  const A = t < T4, ta = tA(t);
  if (A) {
    const k = kDown(ta);
    ride(Bk, bikeA, ta, ta < tF0 ? VIOLET : RED, k > 0 ? { lean: downLean(k, 1), down: k } : {});
    Bk.rider.visible = ta < tF0;
    rHands.forEach((h) => (h.material = mBareR));
    const H = thrown(ta);
    // scrape marks + sparks once the hands are on the road
    const on = H && ta > tHit ? 1 : 0;
    scrape.forEach((m, i) => { if (!H) return m.set(0); const a = H0[i].z, b = H[i].z, L = Math.max(0.05, Math.abs(a - b)); m.position.set(H[i].x, 0.035, (a + b) / 2); m.scale.set(1, L, 1); m.set(on); });
    touch.position.set((H0[0].x + H0[1].x) / 2, 0.03, (H0[0].z + H0[1].z) / 2); touch.set(H ? flash(ta, tHit + 0.05) * 1.2 + on * 0.25 : 0);
    const slideV = H && ta > tHit ? Math.exp(-(ta - tHit) / 0.5) : 0;
    sparks.forEach((b, i) => {
      if (slideV < 0.08) { b.visible = false; return; }
      const h = H[i % 2], ph = (rnd(i, 1) + (ta - tHit) * 3.2) % 1, age = ph * 0.32;
      b.visible = true; b.position.set(h.x + (rnd(i, 2) - 0.5) * 1.4 * age, 0.05 + 2.6 * age - 8 * age * age + 0.02, h.z + 5 * age * slideV);
    });
    GL.G.visible = false;
  } else {
    MAN.g.visible = false; scrape.forEach((m) => m.set(0)); touch.set(0); sparks.forEach((b) => (b.visible = false)); 
    rHands.forEach((h) => (h.material = mGlove));
    const B = t >= T6;
    const st = ride(Bk, B ? bikeB : null, t, GREEN, { trail: true });
    // glove: turns in, palm slider lights, strap closes tight
    GL.G.visible = !B;
    GL.G.rotation.set(0.1, 0.5 * (1 - sm(T4, T4 + 1.2, t)) - 0.25, 0);
    GL.slider.material.color.set(GREEN).multiplyScalar(0.4 + 0.9 * sm(tPalm - 0.1, tPalm + 0.25, t));
    const c = sm(tClose - 0.1, tTight + 0.1, t);
    GL.hinge.rotation.y = -1.2 * (1 - c); GL.cuff.scale.set(1 - 0.08 * c, 1, 1 - 0.08 * c);
    GL.mStrap.color.set(GREEN).multiplyScalar(0.4 + 0.7 * c);
    tagAt(tSlide, GX + 0.2, GY - 1.6, GZ + 0.4, B ? 0 : sm(tPalm, tPalm + 0.25, t) * (1 - sm(T5 - 0.2, T5, t)), 0.85);
    wrist.position.set(GX, GY - 0.84, GZ + 0.26); wrist.rotation.set(0, 0, 0); wrist.set(B ? 0 : sm(tTight - 0.1, tTight + 0.2, t) * (1 - sm(T6 - 0.2, T6, t)));
    if (st) tagAt(tOn, st.x - 0.6, 2.0, st.z - 0.4, sm(T6 + 0.1, T6 + 0.4, t) * (1 - sm(g("s6", "shop") - 0.7, g("s6", "shop") - 0.5, t)), 0.9);
    SHOP.sign.material.color.set(ORANGE).multiplyScalar(0.4 + 1.8 * sm(g("s6", "shop") - 0.2, g("s6", "shop") + 0.2, t));
    shopZone.set(B ? sm(g("s6", "shop"), g("s6", "shop") + 0.3, t) * 0.8 : 0);
  }
  const shot = shoot(SH, t);
  bloom.strength = 1.0 + 1.2 * shot.punch * shot.punch + overlays(t) + (A ? 0.7 * flash(ta, tHit) : 0);
});
