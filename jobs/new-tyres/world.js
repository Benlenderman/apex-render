// 138 new-tyres: wrong = shiny new tyres, rider leans hard into the first corner, the shiny edge slides out, low-side (red).
// Right = ride gently (small lean), a bit more lean each corner; the shiny bands scrub off from the centre outwards and turn to grip (green).
import { THREE, S, g, sm, flash, scene, bloom, glow, VIOLET, ORANGE, RED, GREEN, hud, shoot, run, pathState } from "./kit.js";
import { track, buildRoad, makePerson, pose, title, endCard, cap, overlays, bikes } from "./extra.js";

scene.fog.density = 0.009;
const T2 = S.s2[0], T3 = S.s3[0], T4 = S.s4[0], T5 = S.s5[0], T6 = S.s6[0], T7 = S.s7[0];

// ---------- part A road: straight, then a left bend ----------
const SA = 50, RA = 22;
const A = track([{ len: SA }, { len: 45, R: RA }, { len: 300 }]);
buildRoad(A.P, -60, SA + 250);
// ---------- part B road (far to the side): a short straight then gentle alternating bends ----------
const XB = 400, RB = 30, SB0 = 13, BLEN = 11, GAP = 3;
const segs = [{ len: SB0 }]; for (let i = 0; i < 9; i++) segs.push({ len: BLEN, R: i % 2 ? -RB : RB }, { len: GAP });
segs.push({ len: 300 });
const Bt = track(segs), PB = (s, o = 0) => { const [x, z] = Bt.P(s, o); return [x + XB, z]; };
buildRoad(PB, -40, 420);

// ---------- timing ----------
const tSlip = g("s2", "slippery"), tSl = g("s2", "slides"), tCorner = g("s2", "corner");
const tNo = g("s4", "no"), tThr = g("s4", "throttle");
const tShiny = g("s6", "shiny"), tWears = g("s6", "wears"), tTyre = g("s6", "tyre");

// ---------- Red: 14 m/s into the bend, slides out on the shiny edge at "slides" ----------
const VA = 14, tE = tSl - 0.85;
const sA = (t) => SA + VA * (t - tE);
const pre = (t) => { const [x, z] = A.P(sA(t), 1.8); return [x, z]; };
const st0 = pathState(pre, tSl), LG = st0.lean, sgn = Math.sign(LG) || 1;
function red(t) {
  if (t <= tSl) { const s = pathState(pre, t); return { ...s, k: 0 }; }
  const e = t - tSl, te = Math.min(e, VA / 7), slide = VA * te - 3.5 * te * te, k = sm(0.0, 0.45, e);
  return { x: st0.x - Math.sin(st0.h) * slide, z: st0.z - Math.cos(st0.h) * slide, h: st0.h - sgn * 0.4 * k, lean: LG + k * (sgn * 1.45 - LG), steer: 0, v: Math.max(0, VA - 7 * e), k };
}
const fnA = (t) => { const r = red(t); return [r.x, r.z, r.h]; };

// ---------- Green: 8 m/s gently, then a little faster each corner (more lean each time) ----------
const vB = (t) => 8 + 3.2 * sm(T5 - 0.3, T6 - 0.2, t) + 2.8 * sm(T6 - 0.2, T7, t);
const DB = (() => { const N = 900, dt = 18 / N, a = new Float32Array(N + 1); for (let i = 1; i <= N; i++) a[i] = a[i - 1] + vB(T3 + (i - 0.5) * dt) * dt; return (t) => { const u = Math.max(0, Math.min(N, (t - T3) / dt)), i = Math.floor(u); return a[Math.min(i, N - 1)] + (a[Math.min(i + 1, N)] - a[Math.min(i, N - 1)]) * (u - i); }; })();
const fnB = (t) => { const [x, z] = PB(DB(t), 1.8); return [x, z]; };

// ---------- bikes, tyres with shiny tread bands ----------
const [BA, BG] = bikes(2), THROWN = makePerson();
const PHI = [-66, -52, -38, -24, -10, 10, 24, 38, 52, 66].map((d) => (d * Math.PI) / 180);
function bands(W, fat) {
  return PHI.map((p) => {
    const m = glow(0xe8e4ff, 1.2), r = fat + 0.004;
    const b = new THREE.Mesh(new THREE.TorusGeometry(0.255 + r * Math.cos(p), 0.011, 6, 48), m);
    b.rotation.y = Math.PI / 2; b.position.x = r * Math.sin(p); W.add(b); return { m, a: Math.abs(p) };
  });
}
const tyres = (B) => [...bands(B.rearW, 0.12), ...bands(B.frontW, 0.1)];
const bandA = tyres(BA), bandG = tyres(BG);
const cShine = new THREE.Color(0xeeeaff), cGrip = new THREE.Color(GREEN), cTmp = new THREE.Color();
// scrubbed = how far out (radians of lean) the tread is worn in; bands inside it turn to matte green grip
function paint(list, scrub, hot, hotHex) {
  for (const b of list) {
    const w = sm(b.a - 0.06, b.a + 0.02, scrub);
    cTmp.copy(cShine).multiplyScalar(0.8).lerp(cGrip.clone().multiplyScalar(0.9), w);
    if (hot > 0 && b.a > 0.5) cTmp.lerp(new THREE.Color(hotHex).multiplyScalar(1.6), hot);
    b.m.color.copy(cTmp);
  }
}
// max lean so far on the green bike
const maxLean = (t) => { let m = 0.12; for (let u = T3; u <= t; u += 0.1) { const s = pathState(fnB, u); if (s) m = Math.max(m, Math.abs(s.lean)); } return m; };

// ---------- lean readout ----------
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
      x.fillStyle = css; x.font = "900 112px Inter, Arial, sans-serif"; x.fillText(val, 256, 166); tex.needsUpdate = true;
    }
    hud(m, 0, -0.36, 0.26, a);
  };
  return m;
}
const rLean = readout("LEAN");
const deg = (l) => `${Math.round(Math.abs(l) * 57.3)}°`;

// contact ring
const ringM = new THREE.MeshBasicMaterial({ color: 0, toneMapped: false, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false });
const ring = new THREE.Mesh(new THREE.RingGeometry(0.9, 1.1, 48), ringM); ring.rotation.x = -Math.PI / 2; scene.add(ring);

title("NEVER LEAN HARD ON NEW TYRES");
cap("s1", "fresh", ["NEW TYRES?"], VIOLET, { y: 0.3, until: ["s1", "never"] });
cap("s2", "slippery", ["SLIPPERY FROM", "THE FACTORY"], RED, { y: 0.3, until: ["s2", "slides"] });
cap("s2", "slides", ["SLIDES OUT IN", "THE FIRST CORNER"], RED, { y: 0.3, boom: 0.6 });
cap("s3", "need", ["A FEW RIDES", "TO GET GRIP"], ORANGE, { y: 0.3 });
cap("s4", "ride", ["RIDE GENTLY", "AT FIRST"], GREEN, { y: 0.3, until: ["s4", "no"] });
cap("s4", "no", ["NO HARD BRAKING", "NO HARD THROTTLE"], GREEN, { y: 0.3 });
cap("s5", "lean", ["A BIT MORE LEAN", "EACH CORNER"], GREEN, { y: 0.3 });
cap("s6", "shiny", ["SHINY EDGE", "WEARS OFF"], GREEN, { y: 0.3, until: ["s6", "tyre"] });
cap("s6", "tyre", ["NOW IT GRIPS"], GREEN, { y: 0.3 });
endCard(["NEW TYRES ARE SLIPPERY.", "BREAK THEM IN."]);

const fol = (fn) => (t) => { const s = pathState(fn, t); return { x: s.x, z: s.z, h: s.h }; };
const folA = (t) => { const r = red(Math.min(t, tSl + 0.02)); return { x: r.x, z: r.z, h: r.h }; };
const [cx, cz] = A.P(SA + VA * 0.85 + 4, -3);
const SH = [
  { at: 0, f: folA, K: [[0, [1.5, 0.75, 2.9, 0, 0.72, 0.68, 32]], [0.9, [1.3, 0.7, 2.7, 0, 0.72, 0.68, 32]]] },
  { at: 0.9, f: folA, K: [[0, [1.2, 1.9, 6.5, 0, 0.7, -10, 50]], [T2 + 1.0 - 0.9, [1.0, 1.7, 5.8, 0, 0.7, -10, 50]]] },
  { at: T2 + 1.0, f: folA, K: [[0, [-2.4, 1.0, -5.2, 0, 0.6, 0, 44]], [tSl + 0.35 - T2 - 1.0, [-2.2, 0.9, -4.8, 0, 0.5, 0, 44]]] },
  { at: tSl + 0.35, K: [[0, [cx + 6, 7, cz + 9, cx, 0, cz - 2, 48]], [T3 - tSl - 0.35, [cx + 5.5, 7.5, cz + 8, cx, 0, cz - 2, 48]]] },
  { at: T3, f: fol(fnB), K: [[0, [1.5, 0.75, 2.9, 0, 0.72, 0.68, 32]], [T4 - T3, [1.3, 0.7, 2.6, 0, 0.72, 0.68, 32]]] },
  { at: T4, f: fol(fnB), K: [[0, [0, 3.0, 7.5, 0, 0.6, -12, 50]], [T5 - T4, [0, 3.2, 7.2, 0, 0.6, -12, 50]]] },
  { at: T5, f: fol(fnB), K: [[0, [-2.8, 1.3, -6.5, 0, 0.7, 0, 46]], [T6 - T5, [-2.6, 1.2, -6.0, 0, 0.7, 0, 46]]] },
  { at: T6, f: fol(fnB), K: [[0, [1.6, 0.8, 3.1, 0, 0.72, 0.68, 32]], [T7 - T6, [1.5, 0.75, 2.9, 0, 0.72, 0.68, 32]]] },
  { at: tTyre - 0.15, f: fol(fnB), K: [[0, [0.6, 1.7, 5.4, -0.4, 0.5, -2, 46]], [T7 + 0.45 - tTyre, [0.4, 1.9, 5.8, -0.4, 0.5, -3, 46]]] },
  { at: T7 + 0.3, f: fol(fnB), K: [[0, [1.5, 3, 8, 0, 1, -20, 50]], [2.6, [2, 4.5, 10, 0, 1, -20, 50]]] },
];

run("w", (t) => {
  const isA = t < T3;
  if (isA) {
    const r = red(t);
    BA.set(r, fnA, t, { hex: t < tSlip ? VIOLET : RED, trailOn: r.k < 0.2 && r.v > 1 }); BA.rider.visible = r.k < 0.5; BG.set(null);
    pose(THROWN, { x: r.x + Math.cos(r.h) * -1.2 * sgn + Math.sin(r.h) * 1.6, z: r.z + Math.sin(r.h) * 1.2 * sgn + Math.cos(r.h) * 1.6, h: r.h + 1.2, lie: 1, armR: 1.4, armL: 0.6, vis: r.k > 0.5, hex: RED });
    // new tyre: all shiny; the edge flashes red where it meets the road
    const hot = t > tSlip - 0.1 ? Math.max(0.55 * sm(tSlip - 0.1, tSlip + 0.2, t), flash(t, tSl)) : 0;
    paint(bandA, 0, hot, RED);
    rLean.set(r.k > 0.3 ? "DOWN" : deg(r.lean), RED, t > T2 + 1.0 ? 1 : 0);
    const hk = sm(tSl + 0.2, tSl + 1.0, t);
    if (hk > 0 && hk < 1) { ring.visible = true; ring.position.set(r.x, 0.05, r.z); ring.scale.setScalar(0.6 + 2 * hk); ringM.color.set(RED).multiplyScalar(2.4 * (1 - hk)); } else ring.visible = false;
  } else {
    pose(THROWN, { vis: false }); BA.set(null);
    const st = pathState(fnB, t);
    BG.set(st, fnB, t, { hex: GREEN }); BG.rider.visible = true;
    const scrub = Math.max(maxLean(t) + 0.04, (t > T6 ? 1.3 * sm(tShiny - 0.1, tTyre, t) : 0));
    paint(bandG, scrub, 0, GREEN);
    rLean.set(deg(st.lean), GREEN, t > T4 && t < T6 ? 1 : 0);
    const gk = sm(tTyre - 0.05, tTyre + 0.7, t);
    if (gk > 0 && gk < 1) { ring.visible = true; ring.position.set(st.x, 0.05, st.z); ring.scale.setScalar(0.4 + 1.2 * gk); ringM.color.set(GREEN).multiplyScalar(2.2 * (1 - gk)); } else ring.visible = false;
  }
  const shot = shoot(SH, t);
  bloom.strength = 0.85 + 1.0 * shot.punch * shot.punch + overlays(t) + (isA ? 0.6 * flash(t, tSl) : 0);
});
