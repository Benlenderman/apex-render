// 76 crashed-rides-on: friend crashes, says "fine", rides straight on with a hidden broken wrist / head knock (red).
// Right way: sit them down 10 min, ask + watch, check helmet + levers/brakes, hit head/confused/hurts = no ride, get help; bike later.
import { THREE, S, g, sm, flash, scene, bloom, box, glow, beam, patch, VIOLET, ORANGE, RED, GREEN, WHITE, shoot, sceneOf, run } from "./kit.js";
import { track, buildRoad, makePerson, pose, title, endCard, cap, overlays, bikes, ride, downLean, tag, tagAt, ARM } from "./extra.js";

scene.fog.density = 0.012;
const { P } = track([{ len: 3000 }]);
buildRoad(P, -80, 1500);
const SC = 300, T2 = S.s2[0], T3 = S.s3[0];
const V = (x, y, z) => new THREE.Vector3(x, y, z);
const [Bk] = bikes(1);
const FR = makePerson(), HE = makePerson();
// sitting legs for the friend (body drops 0.42 so the hips sit on the kerb)
const seatLegs = new THREE.Group(); FR.body.add(seatLegs);
import { tube } from "./kit.js";
for (const s of [-1, 1]) seatLegs.add(tube([s * 0.12, 0.92, 0], [s * 0.13, 0.92, -0.42], 0.15, FR.mats.legs), tube([s * 0.13, 0.92, -0.42], [s * 0.13, 0.5, -0.46], 0.12, FR.mats.lower), box(0.13, 0.09, 0.28, s * 0.13, 0.47, -0.52, FR.mats.feet));
const sit = (k) => { const on = k > 0.5; FR.body.children.slice(0, 6).forEach((c) => (c.visible = !on)); seatLegs.visible = on; FR.body.position.y = on ? -0.42 : 0; };
const kerb = box(0.7, 0.42, 1.6, 0, 0.21, 0); scene.add(kerb);
// injury markers: on the riding friend (s2) and on the standing/sitting friend (s4 helmet)
const mHurt = glow(RED, 3);
const hurtW = new THREE.Mesh(new THREE.SphereGeometry(0.11, 12, 10), mHurt); hurtW.position.set(0.39, 1.07, -0.47); Bk.rider.add(hurtW);
const hurtH = new THREE.Mesh(new THREE.SphereGeometry(0.21, 14, 10), mHurt.clone()); hurtH.material.transparent = true; hurtH.material.opacity = 0.55; Bk.headG.add(hurtH); hurtH.position.set(0, 0.04, -0.04);
const scuff = new THREE.Mesh(new THREE.SphereGeometry(0.07, 10, 8), glow(ORANGE, 3)); scuff.position.set(0.1, 0.08, -0.1); FR.head.add(scuff);
const ring = (r) => { const m = new THREE.Mesh(new THREE.TorusGeometry(r, 0.025, 8, 40), glow(ORANGE, 2.6)); scene.add(m); return m; };
const rHead = ring(0.32), rLevL = ring(0.2), rLevR = ring(0.2), rDisc = ring(0.3);
// 10-minute clock: 10 ticks on the ground around the kerb
const ticks = Array.from({ length: 10 }, (_, i) => { const m = box(0.18, 0.04, 0.5, 0, 0.03, 0, glow(GREEN, 0.9), false); scene.add(m); return m; });
// phone for the call
const phone = box(0.09, 0.16, 0.03, 0, -0.72, -0.05, glow(GREEN, 3), false); HE.armR.add(phone);
const sight = beam(GREEN, 2.2, 0.03);
// red cross over the bike (they don't ride)
const crossA = beam(RED, 3, 0.09), crossB = beam(RED, 3, 0.09);
const halo = patch(2.4, 2.4, GREEN, 1);
const tFine = tag("\"I'M FINE\"", RED), tQ = tag("WHERE DOES IT HURT?", GREEN), tLater = tag("COLLECT LATER", ORANGE), tHelp = tag("GET HELP", GREEN), tTen = tag("10 MIN", GREEN);
const tLev = tag("LEVERS + BRAKES", ORANGE), tHelm = tag("HIT?", ORANGE);

// ---- wrong way: crash then rides straight on ----
const tFall = 0.35, sCr = SC - 2;
const crS = (t) => (t < tFall ? sCr - 9 + 8 * t : sCr - 6.2 + 6.2 * sm(tFall, tFall + 1.1, t));
const tUp = g("s1", "says") - 0.4, tFineW = g("s1", "fine"), tRide = g("s1", "ride");
const riS = (t) => SC + 3 + 3 * (t - T2) + 0.9 * Math.max(0, t - T2) ** 2 * 0.5;
const wob = (t) => 2.0 + 0.45 * Math.sin((t - T2) * 2.3) + 0.2 * Math.sin((t - T2) * 5.1);
const riPath = (t) => P(riS(t), wob(t));
// ---- right way positions ----
const BIKE = [SC + 3.2, 6.1], KERB = [SC, 5.0], HELP = [SC + 1.2, 4.0];
{ const [x, z] = P(...KERB); kerb.position.set(x, 0.21, z); halo.position.set(x - 0.4, 0.03, z - 0.4); }
ticks.forEach((m, i) => { const a = (i / 10) * Math.PI * 2, [x, z] = P(KERB[0] + 1.6 * Math.cos(a), KERB[1] - 0.2 + 1.6 * Math.sin(a)); m.position.set(x, 0.03, z); m.rotation.y = -a; });
const tSit = g("s3", "sit"), tTenW = g("s3", "ten"), tAsk = g("s3", "ask"), tWatch = g("s3", "watch"), tMove = g("s3", "move");
const tHelmW = g("s4", "helmet"), tBikeW = g("s4", "bike"), tLevW = g("s4", "levers");
const tHead5 = g("s5", "head"), tDont = g("s5", "don't"), tHelpW = g("s5", "help");
const tLaterW = g("s6", "later"), tFirst = g("s6", "first");

title("NEVER LET A CRASHED FRIEND RIDE STRAIGHT ON");
cap("s2", "adrenaline", "ADRENALINE HIDES PAIN", RED, { until: ["s2", "broken"] });
cap("s2", "broken", ["A BROKEN WRIST", "A KNOCK TO THE HEAD"], RED, { until: ["s2", "can"] });
cap("s2", "can", ["CAN FEEL LIKE NOTHING", "FOR A WHILE"], RED, { boom: 0.4 });
cap("s3", "sit", "SIT THEM DOWN", GREEN, { until: ["s3", "take"] });
cap("s3", "take", "TAKE TEN MINUTES", GREEN, { until: ["s3", "ask"] });
cap("s3", "ask", ["ASK WHERE IT HURTS", "WATCH HOW THEY MOVE"], GREEN);
cap("s4", "check", "CHECK THEIR HELMET FOR A HIT", GREEN, { until: ["s4", "and"] });
cap("s4", "and", ["CHECK THE BIKE:", "BENT LEVERS AND BRAKES"], GREEN);
cap("s5", "if", ["HIT THEIR HEAD?", "CONFUSED? SOMETHING HURTS?"], RED, { until: ["s5", "they", 2], untilN: 2 });
cap("s5", "they", ["THEY DON'T RIDE.", "GET HELP."], RED, { n: 2, boom: 0.4 });
cap("s6", "bike", "THE BIKE CAN BE COLLECTED LATER", ORANGE, { until: ["s6", "your"] });
cap("s6", "your", "YOUR FRIEND COMES FIRST", GREEN);
endCard(["SIT DOWN FIRST.", "RIDE LATER, OR NOT AT ALL."]);

const cam = (s, o, y, ls, lo, ly, f) => { const [x, z] = P(s, o), [lx, lz] = P(ls, lo); return [x, y, z, lx, ly, lz, f]; };
const fol = (t) => { const [x, z] = riPath(t); return { x, z, h: 0 }; };
const SH = [
  { at: 0, K: [[0, cam(SC - 16, -1.5, 3.2, SC - 6, 2.4, 0.6, 50)], [1.3, cam(SC - 9, -1.5, 3.6, SC + 0.5, 3.4, 0.6, 50)], [3, cam(SC - 8, -1.0, 3.2, SC + 0.5, 3.6, 0.7, 48)]] },
  { at: T2, f: fol, noRot: true, K: [[0, [-3.4, 2.6, 6.5, 0.6, 1.1, -3, 46]], [2, [-3.2, 2.4, 6, 0.6, 1.1, -3, 46]]] },
  { at: g("s2", "broken") - 0.15, f: fol, noRot: true, K: [[0, [3.4, 2.0, 3.8, 0.1, 1.0, -0.6, 42]], [2.5, [3.2, 1.9, 3.4, 0.1, 1.0, -0.6, 42]]] },
  { at: g("s2", "can") - 0.1, f: fol, noRot: true, K: [[0, [-2.5, 3.4, 9, 2.0, 1.0, -6, 48]], [3, [-2.8, 3.8, 10.5, 2.0, 1.0, -8, 48]]] },
  { at: T3, K: [[0, cam(SC - 7, 2.0, 3.0, SC + 0.6, 5.1, 0.8, 46)], [4, cam(SC - 6, 2.4, 2.7, SC + 0.6, 5.1, 0.8, 44)]] },
  { at: tAsk - 0.1, K: [[0, cam(SC - 4.8, 1.6, 2.4, SC + 0.6, 4.6, 1.0, 46)], [4, cam(SC - 4.4, 1.8, 2.3, SC + 0.6, 4.6, 1.0, 44)]] },
  { at: S.s4[0], K: [[0, cam(SC - 2.8, 3.0, 1.9, SC, 5.0, 1.2, 40)], [3, cam(SC - 2.5, 3.2, 1.9, SC, 5.0, 1.2, 38)]] },
  { at: tBikeW - 0.1, K: [[0, cam(SC + 0.6, 7.8, 2.1, SC + 3.2, 6.0, 0.6, 44)], [3, cam(SC + 0.8, 7.6, 2.0, SC + 3.2, 6.0, 0.6, 42)]] },
  { at: S.s5[0], K: [[0, cam(SC - 5, 1.6, 2.8, SC + 1.4, 5.3, 0.8, 48)], [4, cam(SC - 4.6, 1.8, 2.6, SC + 1.4, 5.3, 0.8, 46)]] },
  { at: S.s6[0], K: [[0, cam(SC + 9, 2.0, 3.4, SC + 1.6, 5.4, 0.6, 46)], [2, cam(SC + 8, 2.2, 3.2, SC + 1.6, 5.4, 0.6, 46)]] },
  { at: tFirst - 0.6, K: [[0, cam(SC - 4, 2.2, 2.4, SC, 4.8, 1.1, 42)], [3, cam(SC - 4.4, 2.0, 2.6, SC, 4.8, 1.1, 42)]] },
  { at: S.s7[0], calm: true, K: [[0, cam(SC - 4.4, 2.0, 2.6, SC, 4.8, 1.1, 42)], [4, cam(SC - 9, 0.5, 7, SC + 1, 4.8, 0.6, 46)]] },
];
const H = V(0, 0, 0), E = V(0, 0, 0), W0 = V(0, 0, 0);
run("w", (t) => {
  const { id } = sceneOf(t), A = t < T3;
  let st;
  Bk.hlight.visible = true; [rHead, rLevL, rLevR, rDisc].forEach((r) => (r.visible = false));
  hurtW.visible = hurtH.visible = false; scuff.visible = false; phone.visible = false;
  ticks.forEach((m) => (m.visible = false)); halo.set(0); sight.set(H, H, 0); crossA.set(H, H, 0); crossB.set(H, H, 0);
  if (A && t < T2) {
    // crash: rides in, goes down, slides; friend thrown, gets up, says fine
    const k = sm(tFall, tFall + 0.3, t);
    st = ride(Bk, (u) => P(crS(u), 2.0), t, RED, k > 0 ? { lean: downLean(k, 1), down: k, trail: t < tFall + 1.2 } : {});
    const [px, pz] = P(SC + 0.5 - 2.5 * (1 - sm(tFall, tFall + 1.0, t)), 3.4);
    const up = sm(tUp, tUp + 0.6, t);
    pose(FR, { vis: t > tFall + 0.1, x: px, z: pz, h: 0.4, lie: 1 - up, armR: ARM.up * sm(tFineW - 0.3, tFineW, t), hex: RED });
    sit(0); HE.g.visible = false;
    tagAt(tFine, px, 2.4, pz, sm(tFineW - 0.2, tFineW + 0.1, t), 1.6);
    if (t > tRide - 0.2) { /* gets back on: hide friend, bike rises */ const r = sm(tRide - 0.2, tRide + 0.3, t); pose(FR, { vis: r < 0.5, x: px, z: pz, h: 0.4, armR: ARM.up, hex: RED }); if (r >= 0.5) ride(Bk, (u) => P(SC + 3, 2.0), t, RED, { still: true, trail: false, lean: downLean(1 - r, 1) }); }
  } else if (A) {
    pose(FR, { vis: false }); HE.g.visible = false; tagAt(tFine, 0, 0, 0, 0);
    st = ride(Bk, riPath, t, RED);
    const p = 0.5 + 0.5 * Math.sin(t * 10);
    hurtW.visible = t > g("s2", "wrist") - 0.3; hurtW.scale.setScalar(1 + 0.4 * p);
    hurtH.visible = t > g("s2", "head") - 0.3; hurtH.scale.setScalar(1 + 0.15 * p);
  } else {
    tagAt(tFine, 0, 0, 0, 0);
    st = ride(Bk, () => [...P(...BIKE), 0.35], t, VIOLET, { still: true, trail: false, lean: downLean(1, 1) });
    Bk.rider.visible = false; Bk.hlight.visible = false;
    const [fx, fz] = P(...KERB), [hx, hz] = P(...HELP);
    const sk = sm(tSit - 0.3, tSit + 0.3, t);
    const raise = sm(tWatch, tMove + 0.2, t) * (1 - sm(tMove + 1.2, tMove + 1.8, t));
    pose(FR, { x: fx - 0.05, z: fz, h: Math.PI / 2 - 0.3, armR: 1.9 * raise, armL: 0.2, hex: ORANGE });
    sit(id === "s3" ? sk : 1);
    const call = id === "s5" ? sm(tHelpW - 0.4, tHelpW, t) : id === "s6" || id === "s7" ? 1 - sm(S.s6[0], S.s6[0] + 0.5, t) : 0;
    pose(HE, { x: hx, z: hz, h: Math.atan2(hx - fx, hz - fz), armR: 2.75 * call, hex: GREEN });
    phone.visible = call > 0.3;
    // 10 min clock
    if (id === "s3") { const n = Math.floor(10 * sm(tTenW - 0.1, tAsk - 0.1, t)) + (t > tTenW - 0.1 ? 1 : 0); ticks.forEach((m, i) => (m.visible = i < n && t < tAsk - 0.25)); }
    tagAt(tTen, fx, 2.2, fz, id === "s3" ? sm(tTenW - 0.1, tTenW + 0.2, t) * (1 - sm(tAsk - 0.5, tAsk - 0.25, t)) : 0, 1.1);
    tagAt(tQ, 0, 0, 0, 0);
    // sight from helper to friend (watch how they move)
    if (id === "s3" && t > tWatch - 0.2) { HE.head.getWorldPosition(H); FR.armR.userData.hand.getWorldPosition(E); sight.set(H, E, sm(tWatch - 0.2, tWatch + 0.1, t)); }
    // s4: helmet hit, then levers + brakes
    if (id === "s4") {
      const pk = 1 + 0.12 * Math.sin(t * 9);
      if (t < tBikeW - 0.1) { scuff.visible = t > tHelmW - 0.3; FR.head.getWorldPosition(W0); rHead.visible = scuff.visible; rHead.position.copy(W0); rHead.lookAt(camera_pos()); rHead.scale.setScalar(pk); tagAt(tHelm, W0.x, W0.y + 0.36, W0.z, sm(tHelmW - 0.2, tHelmW + 0.1, t), 0.38); }
      else {
        tagAt(tHelm, 0, 0, 0, 0);
        Bk.g.updateMatrixWorld(true);
        const a = sm(tLevW - 0.3, tLevW, t);
        for (const [r, p, par] of [[rLevL, V(-0.39, 0.12, 0.05), Bk.fork], [rLevR, V(0.39, 0.12, 0.05), Bk.fork], [rDisc, V(0.13, -0.62, -0.16), Bk.fork]]) { r.visible = a > 0.05; r.position.copy(par.localToWorld(p.clone())); r.lookAt(camera_pos()); r.scale.setScalar(pk * a); }
        const [bx, bz] = P(...BIKE); tagAt(tLev, bx, 0.95, bz, a, 0.45);
      }
    } else { tagAt(tHelm, 0, 0, 0, 0); tagAt(tLev, 0, 0, 0, 0); }
    // s5: red cross over the bike, help call
    if (id === "s5") {
      const a = sm(tDont - 0.2, tDont + 0.1, t), [bx, bz] = P(...BIKE), c = V(bx, 0.9, bz);
      crossA.set(c.clone().add(V(-0.9, 0.9, 0.9)), c.clone().add(V(0.9, -0.9, -0.9)), a); crossB.set(c.clone().add(V(-0.9, -0.9, 0.9)), c.clone().add(V(0.9, 0.9, -0.9)), a);
    }
    tagAt(tHelp, 0, 0, 0, 0);
    // s6: bike later, friend first
    { const [bx, bz] = P(...BIKE); tagAt(tLater, bx, 1.3, bz, id === "s6" ? sm(tLaterW - 0.4, tLaterW, t) * (1 - sm(tFirst - 0.7, tFirst - 0.5, t)) : 0, 0.9); }
    halo.set(id === "s6" ? sm(tFirst - 0.5, tFirst, t) : id === "s7" ? 1 : 0);
  }
  const shot = shoot(SH, t);
  bloom.strength = 1.0 + 1.2 * shot.punch * shot.punch + overlays(t) + (A ? 0.8 * flash(t, tFall + 0.2) : 0);
});
import { camera } from "./kit.js";
function camera_pos() { return camera.position; }
