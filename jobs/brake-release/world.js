// 125 brake-release: wrong = red rider brakes hard, then lets go of the brake all at once at turn-in; the front goes light, the bike runs wide off the road and goes down in the gravel (red).
// Right = green rider eases off the brake as the lean comes in, brake fully off before the throttle opens; one smooth handover (green). A brake-pressure graph tracks both.
import { THREE, S, g, sm, flash, scene, bloom, glow, box, ORANGE, RED, GREEN, WHITE, hud, pathState, shoot, run } from "./kit.js";
import { track, ribbon, buildRoad, makePerson, pose, title, endCard, cap, overlays, bikes, ride } from "./extra.js";

// ---------- props: INCORRECT / CORRECT badge, brake-pressure graph panel, glow ring ----------
function badge(txt, css) {
  const c = document.createElement("canvas"); c.width = 1024; c.height = 256; const x = c.getContext("2d");
  x.font = "900 130px Inter, Arial, sans-serif"; const w = Math.min(1024, x.measureText(txt).width + 80);
  x.fillStyle = css; x.beginPath(); x.roundRect((1024 - w) / 2, 38, w, 180, 18); x.fill();
  x.fillStyle = "#fff"; x.textBaseline = "middle"; x.textAlign = "center"; x.fillText(txt, 512, 132, 960);
  const m = new THREE.Mesh(new THREE.PlaneGeometry(2, 0.5), new THREE.MeshBasicMaterial({ map: new THREE.CanvasTexture(c), color: 0xb8b8b8, transparent: true, toneMapped: false, depthWrite: false, depthTest: false, fog: false }));
  m.renderOrder = 22; m.userData.w = 2; m.visible = false; scene.add(m); return m;
}
// graph: curves = [{ f(t) -> 0..1, css, w, dash }], drawn from t0 up to t over the window [t0, t1]
function graphPanel() {
  const W = 1024, H = 420, c = document.createElement("canvas"); c.width = W; c.height = H; const x = c.getContext("2d");
  const tex = new THREE.CanvasTexture(c);
  const m = new THREE.Mesh(new THREE.PlaneGeometry(2, (2 * H) / W), new THREE.MeshBasicMaterial({ map: tex, color: 0xa8a8a8, transparent: true, toneMapped: false, depthWrite: false, depthTest: false, fog: false }));
  m.renderOrder = 21; m.userData.w = 2; m.visible = false; scene.add(m);
  const L = 70, R = W - 40, T = 96, B = H - 46;
  m.draw = (t, t0, t1, edge, curves, note) => {
    x.clearRect(0, 0, W, H);
    x.fillStyle = "rgba(10,8,34,0.86)"; x.strokeStyle = edge; x.lineWidth = 6; x.beginPath(); x.roundRect(4, 4, W - 8, H - 8, 26); x.fill(); x.stroke();
    x.font = "900 50px Inter, Arial, sans-serif"; x.fillStyle = "#fff"; x.textBaseline = "middle"; x.textAlign = "left"; x.fillText("BRAKE PRESSURE", 34, 52);
    let lx = W - 34; x.textAlign = "right"; x.font = "800 34px Inter, Arial, sans-serif";
    for (const cv of curves.slice(1).reverse()) { x.fillStyle = cv.css; x.fillText(cv.name, lx, 54); lx -= x.measureText(cv.name).width + 34; }
    x.strokeStyle = "rgba(255,255,255,0.25)"; x.lineWidth = 3; x.beginPath(); x.moveTo(L, T - 10); x.lineTo(L, B); x.lineTo(R, B); x.stroke();
    const X = (u) => L + ((u - t0) / (t1 - t0)) * (R - L), Y = (v) => B - v * (B - T);
    const te = Math.min(t, t1);
    for (const cv of curves) {
      x.strokeStyle = cv.css; x.lineWidth = cv.w; x.setLineDash(cv.dash || []); x.lineJoin = "round"; x.beginPath();
      for (let i = 0; i <= 160; i++) { const u = t0 + ((te - t0) * i) / 160; const p = [X(u), Y(cv.f(u))]; i ? x.lineTo(...p) : x.moveTo(...p); }
      x.stroke(); x.setLineDash([]);
      if (te > t0) { x.fillStyle = cv.css; x.beginPath(); x.arc(X(te), Y(cv.f(te)), cv.w * 1.4, 0, 7); x.fill(); }
    }
    if (note && note.a > 0.01) { x.globalAlpha = note.a; x.font = "900 44px Inter, Arial, sans-serif"; x.fillStyle = note.css; x.textAlign = "center"; x.fillText(note.txt, X(note.u), Y(note.v)); x.globalAlpha = 1; }
    tex.needsUpdate = true;
  };
  return m;
}
function ring(r, hex) {
  const m = glow(hex, 0), o = new THREE.Mesh(new THREE.TorusGeometry(r, 0.03, 8, 32), m); m.depthTest = false; o.renderOrder = 9; scene.add(o);
  return { o, set(p, h, a, hx = hex) { o.position.copy(p); o.rotation.set(0, h + Math.PI / 2, 0); o.visible = a > 0.01; m.color.set(hx).multiplyScalar(1.1 * a); } };
}

// ---------- track: braking straight, then a tight left-hander, then the exit ----------
const LW = 3.6, SIN = 80, RC = 25, ARC = 60;
const { P } = track([{ len: SIN }, { len: ARC, R: RC }, { len: 400 }]);
buildRoad(P, 0, 300, { LW, lamps: false });
const mK = [glow(RED, 1.0), glow(WHITE, 0.55)];
for (let s = SIN - 4, i = 0; s < SIN + ARC + 4; s += 1.6, i++) ribbon(P, -LW - 1.1, -LW - 0.45, s, s + 1.6, mK[i % 2], 0.015, 0.4);
ribbon(P, LW + 0.5, LW + 9, SIN, SIN + ARC + 20, new THREE.MeshBasicMaterial({ color: 0x3a2412 }), 0.006, 1); // gravel trap on the outside
scene.fog.density = 0.016;

const T2 = S.s2[0], T3 = S.s3[0], T4 = S.s4[0], T5 = S.s5[0], T6 = S.s6[0], T7 = S.s7[0];
const [BR, BG] = bikes(2), THROWN = makePerson();
[BR, BG].forEach((B) => B.hlight.material.color.multiplyScalar(0.25));
// brake lever + throttle grip on the right hand
const lever = (B) => { const mL = glow(WHITE, 0.3), mT = glow(WHITE, 0.2), h = B.rider.children[11]; const l = box(0.2, 0.025, 0.03, -0.06, 0.03, -0.09, mL, false); const gr = box(0.06, 0.06, 0.14, 0, 0, 0, mT, false); gr.rotation.y = Math.PI / 2; h.add(l, gr); return { mL, mT }; };
const LR = lever(BR), LG = lever(BG);
const lineO = (s) => 1.5 - 3.3 * Math.sin(Math.PI * Math.min(1, Math.max(0, (s - SIN) / ARC))); // outside, apex, outside

// ---- red: brakes hard on the straight, drops the brake at turn-in, runs wide, down in the gravel ----
const tDrop = g("s1", "once"), tCr = g("s2", "confidence");
const vD = (ARC - 8) / (tCr - tDrop), V0 = vD + 6 * tDrop, F = (t) => V0 * t - 3 * t * t; // slow enough that he runs wide inside the corner
const sCr = SIN + vD * (tCr - tDrop);
const sR = (t) => (t < tDrop ? SIN - (F(tDrop) - F(t)) : t < tCr ? SIN + vD * (t - tDrop) : sCr + vD * 0.6 * (1 - Math.exp(-(t - tCr) / 0.6)));
const oR = (t) => lineO(Math.min(sR(t), SIN + 6)) + 6.5 * sm(tDrop + 0.5, tCr, t) ** 1.3 + 1.5 * sm(tCr, tCr + 1, t);
const redPath = (t) => P(sR(t), oR(t));
const pR = (t) => sm(0.1, 0.5, t) * (1 - sm(tDrop - 0.02, tDrop + 0.1, t));
const leanR = (t) => 0.75 * sm(tDrop, tDrop + 0.5, t) * (1 - 0.4 * sm(tDrop + 0.8, tCr, t));
const kD = (t) => sm(tCr, tCr + 0.35, t);

// ---- green: same braking, eases off as the lean comes in, throttle once the brake is off ----
const tIn = g("s3", "ease"), tThr = g("s5", "throttle"), tOff = tThr - 0.25, tLess = g("s4", "less");
const vC = (ARC - 3) / (tThr - tIn);
const tB0 = T3 - 0.2;
const vG = (t) => (t < tIn ? vC + 6 * (1 - sm(tB0, tIn, t)) : t < tThr ? vC : vC + 5 * Math.min(t - tThr, 3));
const ST = []; { let s = 0; for (let t = tB0; t <= T7 + 5; t += 0.01) { ST.push(s); s += vG(t) * 0.01; } }
const iIn = Math.round((tIn - tB0) / 0.01);
const sG = (t) => { const i = Math.max(0, Math.min(ST.length - 2, (t - tB0) / 0.01)), k = Math.floor(i); return SIN + (ST[k] + (ST[k + 1] - ST[k]) * (i - k)) - ST[iIn]; };
const greenPath = (t) => P(sG(t), lineO(sG(t)));
const pG = (t) => (t < tIn ? sm(tB0, tB0 + 0.3, t) : Math.max(0, 1 - sm(tIn, tOff, t)));
const leanG = (t) => 0.85 * sm(tIn, tLess + 0.4, t) * (1 - sm(tThr + 0.4, tThr + 2.2, t));
const thrG = (t) => sm(tThr, tThr + 0.8, t);

// ---------- overlays ----------
const bdgI = badge("INCORRECT", "#d81e2c"), bdgC = badge("CORRECT", "#1fa855");
const graph = graphPanel();
const rFront = ring(0.42, RED), rHandR = ring(0.16, RED), rHandG = ring(0.16, GREEN);

title("DON'T DROP THE BRAKE AT TURN-IN");
cap("s2", "light", ["THE FRONT GOES LIGHT"], RED, { y: 0.3, until: ["s2", "wide"] });
cap("s2", "wide", ["THE BIKE RUNS WIDE"], RED, { y: 0.3, boom: 0.6 });
cap("s3", "ease", ["EASE OFF THE BRAKE", "AS THE LEAN COMES IN"], GREEN, { y: 0.3 });
cap("s4", "more", ["MORE LEAN,", "LESS BRAKE"], GREEN, { y: 0.3 });
cap("s5", "throttle", ["BRAKE FULLY OFF", "BEFORE THE THROTTLE"], GREEN, { y: 0.3 });
cap("s6", "smooth", ["BRAKE, LEAN, THROTTLE", "ONE SMOOTH HANDOVER"], GREEN, { y: 0.3 });
endCard(["DON'T DROP IT.", "EASE IT OFF."]);

// ---------- camera ----------
// front three-quarter (trackside long lens), aimed a bit low so the bike sits above the graph
const front = (sF, oF, ahead, side, up = 1.5, fov = 32, lookY = 0.55) => ({ cam: (t, su) => { const s = sF(t), o = oF(t), a = ahead - 0.15 * Math.min(su, 3); const [x, z] = P(s + a, o + side), [lx, lz] = P(s, o); return [x, up, z, lx, lookY, lz, fov]; } });
const chase = (sF, oF, back, up, fov = 40) => ({ cam: (t, su) => { const s = sF(t), o = oF(t), b = back - 0.12 * Math.min(su, 3); const [x, z] = P(s - b, o + 0.3), [lx, lz] = P(s + 2, o); return [x, up, z, lx, 0.5, lz, fov]; } });
const oG = (t) => lineO(sG(t));
const SH = [
  { at: 0, ...front(sR, oR, 13, 2.6, 1.7, 30) },
  { at: g("s1", "brake") - 0.15, calm: 1, ...front(sR, oR, 4.6, 1.9, 1.7, 32, 0.3) },
  { at: tDrop + 0.45, ...front(sR, oR, 11, -2.6, 1.5, 32) },
  // s2: wide from the inside of the corner, the bike runs wide into the gravel
  { at: T2 + 0.4, ...front(sR, oR, 7, -4.5, 2.8, 36, 0.3) },
  { at: T3, ...front(sG, oG, 4.6, 1.9, 1.7, 32, 0.3) },
  { at: g("s3", "lean") - 0.1, ...front(sG, oG, 11, -2.6, 1.5, 32) },
  { at: T4, calm: 1, ...front(sG, oG, 10, -2.4, 1.4, 30) },
  { at: tThr - 0.15, ...front(sG, oG, 10, -2.4, 2.4, 30, -0.1) },
  { at: tThr + 1.2, calm: 1, ...chase(sG, oG, 7, 2.2, 42) },
  // s6: high over the inside, the whole smooth line
  { at: T6, ...front(sG, oG, 9, -3.2, 2.4, 34, 0.5) },
  { at: T7, calm: 1, ...chase(sG, oG, 8, 2.4, 42) },
];

const on = (t, a, b = 1e9) => sm(a - 0.1, a + 0.2, t) * (1 - sm(b - 0.15, b, t));
const wp = new THREE.Vector3();
run("w", (t) => {
  const shot = shoot(SH, t); // camera first so hud() sizes against this frame's fov
  const A = t < T3;
  if (A) {
    const k = kD(t), s0 = pathState(redPath, t), ln = leanR(t) + 0.05 * Math.sin((t - tDrop) * 14) * Math.exp(-Math.max(0, t - tDrop) * 2) * (t > tDrop ? 1 : 0);
    ride(BR, redPath, t, RED, k > 0 ? { lean: ln + k * (1.45 - s0.lean - ln), down: k } : { lean: ln });
    // nose dives under brake, then springs up (front goes light) when the brake is dropped
    const u = t - tDrop; BR.g.rotation.x = -0.05 * pR(t) + (u > 0 && k < 0.5 ? 0.07 * Math.exp(-u / 0.7) * Math.abs(Math.cos(u * 6)) : 0);
    if (t > tCr + 0.15) { const v = t - tCr - 0.15, [x, z] = P(sCr + 2 + 5 * sm(0, 1, v), oR(t) + 1 + 1.5 * sm(0, 1, v)); pose(THROWN, { x, z, h: 0.4, lie: sm(0, 0.35, v), armR: 2.4, armL: 1.8, hex: RED }); } else pose(THROWN, { vis: false });
    BG.set(null);
    LR.mL.color.set(RED).multiplyScalar(0.3 + 3 * pR(t)); LR.mT.color.set(WHITE).multiplyScalar(0.2);
  } else {
    BR.set(null); pose(THROWN, { vis: false });
    ride(BG, greenPath, t, GREEN, { lean: leanG(t) });
    BG.g.rotation.x = -0.04 * pG(t);
    LG.mL.color.set(GREEN).multiplyScalar(0.3 + 3 * pG(t)); LG.mT.color.set(ORANGE).multiplyScalar(0.2 + 3 * thrG(t));
  }
  BR.g.updateMatrixWorld(true); BG.g.updateMatrixWorld(true);
  // glow on the brake hand while it's discussed, ring on the front tyre when it goes light
  BR.rider.children[11].getWorldPosition(wp); rHandR.set(wp, BR.g.rotation.y, A ? on(t, g("s1", "brake") - 0.1, tDrop + 0.5) : 0);
  BG.rider.children[11].getWorldPosition(wp); rHandG.set(wp, BG.g.rotation.y, !A ? Math.max(on(t, T3, g("s3", "lean")), on(t, tThr - 0.1, tThr + 1.2)) : 0);
  BR.frontW.getWorldPosition(wp); rFront.set(wp, BR.g.rotation.y, A ? on(t, g("s2", "light"), g("s2", "wide")) : 0);
  // brake-pressure graph
  const aG = A ? on(t, 0.9, T3) : on(t, T3 + 0.05, T7);
  hud(graph, 0, -0.36, 0.8, aG);
  if (aG > 0.01) {
    if (A) graph.draw(t, 0.2, tCr + 0.6, "#ff5a6a", [{ f: pR, css: "#ff5a6a", w: 9 }, { f: leanR, css: "#ffffff", w: 5, dash: [14, 10], name: "LEAN" }], { txt: "DROPPED!", u: tDrop + 0.55, v: 0.8, css: "#ff5a6a", a: on(t, tDrop + 0.1) });
    else graph.draw(t, T3 - 0.2, T6 + 0.4, "#3ddc84", [{ f: pG, css: "#3ddc84", w: 9 }, { f: (u) => leanG(u), css: "#ffffff", w: 5, dash: [14, 10], name: "LEAN" }, { f: thrG, css: "#ffa53d", w: 6, name: "THROTTLE" }], { txt: "EASED OFF", u: (tIn + tOff) / 2 - 0.4, v: 0.9, css: "#3ddc84", a: on(t, g("s3", "slowly")) });
  }
  // INCORRECT / CORRECT
  hud(bdgI, 0, -0.84, 0.5, A && t > 0.9 ? 1 : 0); hud(bdgC, 0, -0.84, 0.5, !A && t < T7 ? 1 : 0);
  bloom.strength = 0.9 + 1.0 * shot.punch * shot.punch + overlays(t) + (A ? 0.8 * flash(t, tCr + 0.1) : 0);
});
