// 130 red-light-gap: wrong = at a red light at night Red stops right behind the car ahead, in neutral, never checks his
// mirror; the driver behind is on a phone and rear-ends him, nowhere to go (red). Right = Blue stops with a gap he can ride
// into, stays in first gear, watches the mirror, flashes his brake light, then rides into the gap and the car stops where
// he was (green).
import { THREE, S, g, sm, flash, scene, camera, bloom, box, glow, beam, mSolid, makeCar, VIOLET, ORANGE, RED, GREEN, WHITE, label, hud, shoot, run } from "./kit.js";
import { track, buildRoad, makePerson, pose, title, endCard, cap, overlays, bikes, ride, downLean } from "./extra.js";

// ---------- props built here: pill labels + readout cards ----------
function canvasPlane(w, h, draw, width) {
  const c = document.createElement("canvas"); c.width = w; c.height = h; const x = c.getContext("2d");
  const tex = new THREE.CanvasTexture(c);
  const m = new THREE.Mesh(new THREE.PlaneGeometry(width, (width * h) / w), new THREE.MeshBasicMaterial({ map: tex, color: 0xd0d0d0, transparent: true, toneMapped: false, depthWrite: false, depthTest: false, fog: false }));
  m.renderOrder = 22; m.userData.w = width; m.visible = false; scene.add(m);
  m.draw = (...a) => { x.clearRect(0, 0, w, h); draw(x, ...a); tex.needsUpdate = true; };
  return m;
}
const css = (hex) => "#" + new THREE.Color(hex).getHexString();
function pill(txt, hex) {
  const m = canvasPlane(1024, 200, (x) => {
    const fs = Math.min(96, Math.floor(96 * 880 / (txt.length * 62))); x.font = `900 ${fs}px Inter, Arial, sans-serif`; const tw = x.measureText(txt).width + 110, X = 512 - tw / 2;
    x.fillStyle = "rgba(12,10,34,0.9)"; x.beginPath(); x.roundRect(X, 20, tw, 160, 80); x.fill();
    x.strokeStyle = css(hex); x.lineWidth = 8; x.stroke();
    x.fillStyle = css(hex); x.textAlign = "center"; x.textBaseline = "middle"; x.fillText(txt, 512, 104);
  }, 2);
  m.draw(); return m;
}
function readout(name) {
  let last = "";
  const m = canvasPlane(512, 256, (x, val, hex) => {
    x.fillStyle = "rgba(12,10,34,0.88)"; x.beginPath(); x.roundRect(8, 8, 496, 240, 44); x.fill();
    x.strokeStyle = css(hex); x.lineWidth = 6; x.stroke();
    x.textAlign = "center"; x.textBaseline = "middle";
    x.fillStyle = "#b8b4d8"; x.font = "800 44px Inter, Arial, sans-serif"; x.fillText(name, 256, 62);
    x.fillStyle = css(hex); x.font = "900 112px Inter, Arial, sans-serif"; x.fillText(val, 256, 166);
  }, 1);
  m.set = (val, hex, sx, a) => { const key = val + hex; if (key !== last) { m.draw(val, hex); last = key; } hud(m, sx, -0.36, 0.26, a); };
  return m;
}
// world tag with a fixed on-screen size (k = fraction of the camera distance), so it never balloons near the camera
const tagD = (m, x, y, z, a, k = 0.16) => label(m, x, y, z, k * camera.position.distanceTo(new THREE.Vector3(x, y, z)), Math.min(1, a));

// ---------- night town street ----------
scene.fog.density = 0.012;
const LW = 5;
const { P } = track([{ len: 3000 }]);
buildRoad(P, -80, 400, { LW });
const T2 = S.s2[0], T3 = S.s3[0], T4 = S.s4[0], T5 = S.s5[0], T6 = S.s6[0], T7 = S.s7[0];
const O = 2.2, sL = 120, sCA = sL - 2.6, sA = sCA - 3.5, sB = sCA - 7.5; // lane, stop line, car ahead, Red stop, Blue stop
const hash = (i) => { const v = Math.sin(i * 127.1) * 43758.5453; return v - Math.floor(v); };
{ // lit-window buildings on both sides
  const c = document.createElement("canvas"); c.width = 256; c.height = 512; const x = c.getContext("2d");
  x.fillStyle = "#14112e"; x.fillRect(0, 0, 256, 512);
  for (let r = 0; r < 12; r++) for (let k = 0; k < 5; k++) { const h = hash(r * 7 + k * 13); x.fillStyle = h > 0.55 ? "#ffb866" : h > 0.35 ? "#4a3f8a" : "#1c1840"; x.fillRect(14 + k * 48, 16 + r * 41, 30, 24); }
  const tex = new THREE.CanvasTexture(c); tex.colorSpace = THREE.SRGBColorSpace;
  const mB = new THREE.MeshBasicMaterial({ map: tex, color: 0x9a90c0 });
  for (const sd of [-1, 1]) for (let s = -40, i = 0; s < 320; i++) {
    const w = 9 + 6 * hash(i * 3 + (sd > 0 ? 1 : 2)), h = 9 + 14 * hash(i * 5 + sd), d = 8, [bx, bz] = P(s + w / 2, sd * (LW + 8 + d / 2));
    const m = new THREE.Mesh(new THREE.BoxGeometry(d, h, w), mB); m.position.set(bx, h / 2, bz); scene.add(m); s += w + 1.5;
  }
}
// traffic light on the right, red lit, facing the queue; white stop line
const [tlx, tlz] = P(sL + 0.5, LW + 0.6);
box(0.18, 4.6, 0.18, tlx, 2.3, tlz, mSolid); box(LW + 0.6 - O + 0.4, 0.14, 0.14, tlx - (LW + 0.6 - O + 0.4) / 2, 4.5, tlz, mSolid);
const hx = O + 0.2; box(0.5, 1.3, 0.4, hx, 3.9, tlz, mSolid);
const lampR = new THREE.Mesh(new THREE.SphereGeometry(0.15, 16, 12), glow(RED, 3.2)); lampR.position.set(hx, 4.3, tlz + 0.22); scene.add(lampR);
for (const [y, hex] of [[3.9, ORANGE], [3.5, GREEN]]) { const l = new THREE.Mesh(new THREE.SphereGeometry(0.15, 16, 12), glow(hex, 0.25)); l.position.set(hx, y, tlz + 0.22); scene.add(l); }
{ const [x, z] = P(sL, O); box(LW - 0.2, 0.02, 0.4, x - O + LW / 2, 0.015, z, glow(WHITE, 0.45), false); }

// ---------- cars: one waiting at the light, one coming up behind (driver on a phone) ----------
const CA = makeCar({ color: 0x4a4f9a }); { const [x, z] = P(sCA, O); CA.set({ x, z, h: 0 }); }
const CB = makeCar({ driver: true, color: 0x7a3a8a });
CB.driver.position.set(-0.4, 1.12, 0.45);
const phone = box(0.16, 0.26, 0.03, -0.38, 1.02, 0.1, glow(0xbfe0ff, 2.6), false); phone.rotation.x = -0.6; CB.g.add(phone);
for (const sx of [-0.6, 0.6]) { const h = new THREE.Mesh(new THREE.SphereGeometry(0.12, 12, 8), glow(WHITE, 3)); h.position.set(sx, 0.72, -2.2); CB.g.add(h); }
// see-through cab for the phone shot only (glass and roof go ghostly so the head and phone read)
const ghost = CB.g.children.filter((c) => c.isMesh && Math.abs(c.position.y - 1.17) < 0.03 || (c.isMesh && Math.abs(c.position.y - 1.19) < 0.01));
const ghostM = ghost.map((c) => c.material), mGhost = new THREE.MeshBasicMaterial({ color: 0x8a6ad0, transparent: true, opacity: 0.18, depthWrite: false });
CB.driver.scale.setScalar(1.3);
const setGhost = (on) => ghost.forEach((c, i) => { c.material = on ? mGhost : ghostM[i]; c.children.forEach((e) => (e.visible = !on)); });
const carAt = (s) => { const [x, z] = P(s, O); return { x, z, h: 0 }; };

// ---------- motion ----------
// run 1 (s1): Red rolls to a stop, the car behind hits at "didn't"
const tS1 = 0.8, tH1 = g("s1", "didn't") + 0.15;
// run 2 (s2-s3): Red rides in, stops; the car behind arrives at "nowhere"
const tS2 = g("s2", "stops") + 0.35, tH2 = g("s3", "nowhere");
const sCont = sA - 3.15; // car centre at contact (bike rear ~1 m behind its centre, car nose 2.15 ahead of its centre)
const shove = (e) => (e <= 0 ? 0 : e < 0.2 ? 12 * e - 30 * e * e : 1.2);
const runA = (t) => (t < T2 ? { tS: tS1, tH: tH1, t0: -1, v0: 6 } : { tS: tS2, tH: tH2, t0: T2, v0: 7 });
function red(t) {
  const R = runA(t), D = R.t0 < 0 ? tS1 : tS2 - T2, e = t - R.tH;
  let s = t < R.tS ? sA - (R.v0 / (2 * D)) * (R.tS - t) ** 2 : sA;
  s += shove(e);
  const k = sm(R.tH + 0.15, R.tH + 0.6, t);
  return { s, o: O - 0.6 * k, k };
}
const fnR = (t) => { const r = red(t); return P(r.s, r.o); };
const carB_A = (t) => { const R = runA(t), e = t - R.tH; return e < 0 ? sCont - 13 * -e : sCont + shove(e); };
// Blue (s4-s6): stops with a gap, rides into it, the car behind stops where he was
const tSB = g("s4", "stops") + 0.45, tGo = g("s6", "rides"), V0 = 16, tD0 = g("s6", "car"), tD1 = g("s6", "was") + 0.1, DD = tD1 - tD0;
const sStop = sB + 0.9 - 2.15;
function blue(t) {
  const s = t < tSB ? sB - (8 / (2 * 1.2)) * (tSB - t) ** 2 : sB + 6.6 * sm(tGo, tGo + 1.4, t);
  return { s, o: O + 2.0 * sm(tGo, tGo + 1.0, t) };
}
const fnB = (t) => { const b = blue(t); return P(b.s, b.o); };
const carB_B = (t) => t < tD0 ? sStop - (V0 * DD) / 2 - V0 * (tD0 - t) : t < tD1 ? sStop - (V0 * DD) / 2 + V0 * (t - tD0) - (V0 * (t - tD0) ** 2) / (2 * DD) : sStop;
const vCarB = (t) => (t < tD0 ? V0 : t < tD1 ? V0 * (1 - (t - tD0) / DD) : 0);

// ---------- bike, rider down, markers ----------
const [Bk] = bikes(1), VICTIM = makePerson();
const mTail = glow(RED, 3); Bk.tail.material = mTail; Bk.tail.scale.set(1.6, 1.6, 1);
const gapLine = box(0.12, 0.04, 1, 0, 0.03, 0, glow(GREEN, 2), false); gapLine.visible = false;
const noGap = box(0.9, 0.04, 0.12, 0, 0.03, 0, glow(RED, 2.4), false); noGap.visible = false;
const intoPath = beam(GREEN, 2.2, 0.04), sight = beam(GREEN, 2.0, 0.025);
const ring = new THREE.Mesh(new THREE.TorusGeometry(0.9, 0.06, 8, 40), glow(GREEN, 2.2)); ring.rotation.x = Math.PI / 2; ring.visible = false; scene.add(ring);
{ const [x, z] = P(sB, O); ring.position.set(x, 0.04, z); }

const pPhone = pill("LOOKING AT A PHONE", RED), pNoGap = pill("NO GAP", RED), pGear = pill("NOT IN GEAR", RED), pLook = pill("NEVER LOOKED", RED);
const pRoom = pill("ROOM TO MOVE", GREEN), pSlow = pill("NOT SLOWING", RED), pWas = pill("WHERE HE WAS", GREEN);
const rGear = readout("GEAR"), rCar = readout("CAR KM/H");

title("HE STOPPED. THE CAR BEHIND DIDN'T.");
cap("s2", "night", ["NIGHT", "IN TOWN"], VIOLET, { y: 0.3, until: ["s2", "stops"] });
cap("s2", "stops", ["RIGHT BEHIND", "THE CAR AHEAD"], RED, { y: 0.3, until: ["s2", "neutral"] });
cap("s2", "neutral", ["IN", "NEUTRAL"], RED, { y: 0.3, until: ["s2", "never"] });
cap("s2", "never", ["NEVER CHECKS", "HIS MIRROR"], RED, { y: 0.3, until: ["s2", "driver"] });
cap("s2", "driver", ["DRIVER BEHIND:", "LOOKING AT A PHONE"], RED);
cap("s3", "had", ["NOWHERE", "TO GO"], RED, { boom: 0.5 });
cap("s4", "blue", ["BLUE LEAVES", "A GAP"], GREEN, { until: ["s4", "stays"] });
cap("s4", "stays", ["STAYS IN", "FIRST GEAR"], GREEN, { until: ["s4", "keeps"] });
cap("s4", "keeps", ["EYE ON", "THE MIRROR"], GREEN);
cap("s5", "car", ["CAR COMING", "FAST"], RED, { until: ["s5", "flashes"] });
cap("s5", "flashes", ["FLASH YOUR", "BRAKE LIGHT"], GREEN, { until: ["s5", "it"] });
cap("s5", "it", ["IT ISN'T", "SLOWING"], RED);
cap("s6", "blue", ["RIDE INTO", "THE GAP"], GREEN, { until: ["s6", "car"] });
cap("s6", "car", ["IT STOPS", "WHERE YOU WERE"], GREEN);
endCard(["NOT OVER UNTIL", "THE CAR BEHIND STOPS."]);

// ---------- cameras ----------
const cam = (s, o, y, ls, lo, ly, f) => { const [x, z] = P(s, o), [lx, lz] = P(ls, lo); return [x, y, z, lx, ly, lz, f]; };
const folCar = (fn) => (t) => carAt(fn(t));
const SH = [
  { at: 0, K: [[0, cam(sA - 13, O - 3.2, 4.6, sA, O, 0.4, 50)], [T2, cam(sA - 11, O - 3.6, 4.2, sA, O, 0.4, 50)]] },
  { at: T2, K: [[0, cam(sA - 30, -1, 9, sA + 2, O, 1.2, 50)], [0.7, cam(sA - 24, -0.5, 7.5, sA + 2, O, 1.0, 50)]] },
  { at: g("s2", "stops") - 0.15, K: [[0, cam(sA - 4.2, O - 2.4, 1.6, sA + 1.6, O, 0.7, 46)], [1.6, cam(sA - 3.8, O - 2.3, 1.5, sA + 1.6, O, 0.7, 46)]] },
  { at: g("s2", "neutral") - 0.15, K: [[0, cam(sA + 0.2, O - 4.6, 1.5, sA, O, 0.8, 46)], [0.8, cam(sA - 0.2, O - 4.4, 1.5, sA, O, 0.8, 46)]] },
  { at: g("s2", "never") - 0.15, K: [[0, cam(sA + 1.3, O - 2.7, 1.9, sA - 0.4, O, 1.3, 46)], [1.3, cam(sA + 1.3, O - 2.9, 2.0, sA - 0.4, O, 1.3, 46)]] },
  { at: g("s2", "driver") - 0.15, f: folCar(carB_A), noRot: true, K: [[0, [-7.5, 2.8, -3.0, -0.2, 0.95, 0.2, 32]], [2.3, [-6.8, 2.6, -2.4, -0.2, 0.95, 0.2, 32]]] },
  { at: T3, K: [[0, cam(sA - 6, O - 0.3, 16, sA - 4, O - 0.3, 0, 50)], [2.2, cam(sA - 5.5, O - 0.3, 15, sA - 3.5, O - 0.3, 0, 50)]] },
  { at: g("s3", "had") - 0.15, K: [[0, cam(sA - 7.5, O - 5.5, 1.9, sA - 1.5, O, 0.6, 50)], [1.5, cam(sA - 7.0, O - 5.8, 2.0, sA - 1, O, 0.5, 50)]] },
  { at: T4, K: [[0, cam(sB - 10, O - 2.6, 4.6, sB + 2.5, O, 0.5, 48)], [0.6, cam(sB - 9, O - 2.6, 4.6, sB + 2.5, O, 0.5, 48)]] },
  { at: g("s4", "gap") - 0.15, K: [[0, cam(sB - 4, O - 3.4, 7.5, sB + 2.5, O, 0, 46)], [0.8, cam(sB - 3.6, O - 3.4, 7.8, sB + 2.5, O, 0, 46)]] },
  { at: g("s4", "stays") - 0.15, K: [[0, cam(sB + 0.2, O - 4.6, 1.5, sB, O, 0.8, 46)], [1.0, cam(sB - 0.2, O - 4.4, 1.5, sB, O, 0.8, 46)]] },
  { at: g("s4", "keeps") - 0.15, K: [[0, cam(sB + 3.2, O - 1.6, 2.4, sB - 10, O, 0.8, 46)], [1.8, cam(sB + 3.0, O - 1.9, 2.5, sB - 10, O, 0.8, 46)]] },
  { at: T5, K: [[0, cam(sB + 4, O - 0.9, 2.1, sB - 30, O, 0.8, 34)], [1.3, cam(sB + 3.8, O - 0.9, 2.0, sB - 30, O, 0.8, 34)]] },
  { at: g("s5", "so") - 0.1, K: [[0, cam(sB - 5.5, O + 1.3, 1.4, sB + 1, O, 0.9, 44)], [1.4, cam(sB - 5.0, O + 1.4, 1.4, sB + 1, O, 0.9, 44)]] },
  { at: g("s5", "it") - 0.1, K: [[0, cam(sB + 1.5, O - 3.6, 3.0, sB - 18, O, 0.6, 40)], [1.3, cam(sB + 1.5, O - 3.8, 3.1, sB - 18, O, 0.6, 40)]] },
  { at: T6, K: [[0, cam(sB - 15, O - 4, 7.5, sB + 3, O + 1, 0, 50)], [3.3, cam(sB - 13, O - 4, 7.5, sB + 3, O + 1, 0, 50)]] },
  { at: T7, K: [[0, cam(sB - 9, O - 3, 9, sB + 1, O + 1, 0, 50)], [2.7, cam(sB - 10, O - 3, 11, sB + 1, O + 1, 0, 50)]] },
];

const V0v = new THREE.Vector3(0, -50, 0);
const wp = (o, v = new THREE.Vector3()) => o.getWorldPosition(v);
const win = (t, a, b) => sm(a - 0.1, a + 0.1, t) * (1 - sm(b - 0.12, b, t));
run("w", (t) => {
  const A = t < T4;
  const tags = []; // [m, x, y, z, a, k] placed after the camera moves
  if (A) {
    const r = red(t), R = runA(t);
    ride(Bk, fnR, t, t < 0.5 || (t > T2 && t < T2 + 0.4) ? VIOLET : RED, { lean: downLean(r.k, 1), down: r.k, trail: t < R.tS - 0.2 });
    Bk.headG.rotation.y = 0; mTail.color.set(RED).multiplyScalar(t < R.tS ? 5 : 2.5);
    setGhost(t > g("s2", "driver") - 0.3 && t < T3);
    CB.set(carAt(carB_A(t))); CB.g.visible = t < T2 ? t > 0.9 : t > g("s2", "driver") - 0.3;
    const [px, pz] = P(r.s + 0.3, O - 1.6);
    pose(VICTIM, { x: px, z: pz, h: Math.PI / 2, lie: 1, armR: 0.5, armL: 1.3, vis: r.k > 0.6, hex: RED });
    // markers: tiny red gap bar, labels
    const [nx, nz] = P(sA + 1.0, O); noGap.position.set(nx, 0.03, nz);
    noGap.visible = t > g("s2", "stops") && t < tH2;
    const [bx, bz] = P(r.s, O), [cbx, cbz] = P(carB_A(t), O);
    tags.push([pNoGap, nx - 1.8, 0.4, nz, win(t, g("s3", "no"), g("s3", "had")), 0.13]);
    tags.push([pGear, bx + 2.8, 0.4, bz + 1.8, win(t, g("s3", "not"), g("s3", "had")), 0.13], [pLook, bx - 2.6, 0.4, bz + 4.2, win(t, g("s3", "saw"), g("s3", "had")), 0.13]);
    rGear.set("N", RED, -0.55, win(t, g("s2", "neutral"), g("s2", "never")));
    rCar.set("0", RED, 0.55, 0);
    gapLine.visible = false; ring.visible = false; intoPath.set(V0v, V0v, 0); sight.set(V0v, V0v, 0);
  } else {
    pose(VICTIM, { vis: false }); noGap.visible = false; setGhost(false);
    const b = blue(t);
    ride(Bk, fnB, t, t < T4 + 0.3 ? VIOLET : GREEN, { trail: t < tSB - 0.2 || t > tGo });
    CB.set(carAt(carB_B(t))); CB.g.visible = t > T5;
    // gap he can ride into
    const ga = win(t, g("s4", "gap"), g("s4", "stays"));
    const [g0x, g0z] = P(sB + 0.9, O), [g1x, g1z] = P(sCA - 2.2, O);
    gapLine.visible = ga > 0.01; gapLine.position.set((g0x + g1x) / 2, 0.03, (g0z + g1z) / 2); gapLine.scale.z = Math.abs(g1z - g0z);
    const [ix, iz] = P(sCA - 0.5, O + 2.0);
    intoPath.set(wp(Bk.hlight), new THREE.Vector3(ix, 0.3, iz), win(t, g("s4", "ride"), g("s4", "stays")) + win(t, g("s6", "blue") - 0.3, tGo + 0.3));
    tags.push([pRoom, (g0x + g1x) / 2 - 1.6, 0.5, (g0z + g1z) / 2, ga, 0.13]);
    // mirror: head turns right, sight beam back down the road
    const look = t > g("s4", "keeps") - 0.2 && t < tGo ? sm(g("s4", "keeps") - 0.2, g("s4", "keeps") + 0.1, t) : 0;
    Bk.headG.rotation.y = -0.5 * look;
    const sCB = carB_B(t), [sx, sz] = P(Math.max(sCB + 2.2, sB - 30), O);
    sight.set(wp(Bk.mirR), new THREE.Vector3(sx, 0.8, sz), look * (1 - sm(T5 + 1.5, T5 + 2, t)) * 0.8);
    // brake light: pulses while he flashes it
    const fl = t > g("s5", "flashes") && t < g("s5", "it") + 0.2 ? (Math.floor((t - g("s5", "flashes")) * 6) % 2 === 0 ? 1 : 0) : 0;
    mTail.color.set(RED).multiplyScalar(2.5 + 7 * fl);
    rGear.set("1", GREEN, -0.55, win(t, g("s4", "first") - 0.3, T5));
    rCar.set(String(Math.round(vCarB(t) * 3.6)), RED, 0.55, win(t, g("s5", "fast"), T6));
    const [cbx, cbz] = P(sCB, O);
    hud(pSlow, 0, 0.05, 0.5, win(t, g("s5", "it"), T6));
    ring.visible = t > tD0 - 0.2 && t < T7 + 2; ring.material.color.set(GREEN).multiplyScalar(1.5 + 2.5 * flash(t, g("s6", "waiting")));
    const [rx, rz] = P(sB, O - 1.8);
    tags.push([pWas, rx, 0.6, rz, win(t, g("s6", "right"), T7), 0.11]);
  }
  const shot = shoot(SH, t);
  for (const [m, x, y, z, a, k] of tags) tagD(m, x, y, z, a, k);
  const hit = flash(t, tH1 + 0.05) + flash(t, tH2 + 0.05);
  bloom.strength = 0.9 + 1.0 * shot.punch * shot.punch + overlays(t) + 0.8 * hit;
});
