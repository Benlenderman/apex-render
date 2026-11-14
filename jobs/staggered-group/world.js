// 131 staggered-group: wrong = Red rides half a second behind the leader, side by side with a friend in the same lane;
// a car pulls out, the leader brakes hard, Red needs a full second to react and hits him (red, slow motion with a timer).
// Right = staggered formation with timing lines (1 s across, 2 s same side); same car, Blue has room, brakes, moves over;
// in the bend the group goes single file two seconds apart (green).
import { THREE, S, g, sm, flash, scene, camera, bloom, box, glow, beam, mSolid, makeCar, VIOLET, ORANGE, RED, GREEN, WHITE, label, hud, shoot, run } from "./kit.js";
import { track, buildRoad, title, endCard, cap, overlays, bikes, ride, downLean } from "./extra.js";

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
const tagD = (m, x, y, z, a, k = 0.14) => label(m, x, y, z, k * camera.position.distanceTo(new THREE.Vector3(x, y, z)), Math.min(1, a));
// ground timing line between two road points, drawn as a thin glowing bar
function gline(hex) {
  const m = box(0.16, 0.04, 1, 0, 0.05, 0, glow(hex, 2.2), false); m.visible = false;
  m.set = (a, b, on) => {
    m.visible = on > 0.02; if (!m.visible) return;
    const dx = b[0] - a[0], dz = b[1] - a[1], L = Math.hypot(dx, dz);
    m.position.set((a[0] + b[0]) / 2, 0.05, (a[1] + b[1]) / 2); m.scale.set(1, 1, Math.max(0.01, L * on)); m.rotation.y = Math.atan2(dx, dz);
  };
  return m;
}

// ---------- road: long straight, then a right-hand bend ----------
scene.fog.density = 0.009;
const LW = 4, O = 2, V = 14; // half road, lane centre, 50 km/h
const SB = 420, BL = 160;
const { C, P } = track([{ len: SB }, { len: BL, R: 55 }, { len: 400 }]);
buildRoad(P, -40, SB + BL + 120, { LW });
const T2 = S.s2[0], T3 = S.s3[0], T4 = S.s4[0], T5 = S.s5[0], T6 = S.s6[0], T7 = S.s7[0];
const mAs = new THREE.MeshStandardMaterial({ color: 0x0f0c2c, roughness: 0.9 });
const sideRoad = (s) => { const [x, z] = P(s, LW + 6); box(12, 0.01, 6, x, 0.004, z, mAs, false); };

// stop smoothly: cruise at v until tb, then constant decel over distance D
const brakeTo = (s0, t0, tb, D) => (t) => {
  if (t < tb) return s0 + V * (t - t0);
  const a = (V * V) / (2 * D), e = Math.min(t - tb, V / a);
  return s0 + V * (tb - t0) + V * e - (a * e * e) / 2;
};
const speedOf = (fn, t) => Math.max(0, (fn(t + 0.02) - fn(t - 0.02)) / 0.04);

// ---------- part A (s1-s3): half a second behind, side by side; slow motion after the brake ----------
const tB = g("s2", "brakes"), tHit = g("s3", "nowhere"), HIT = 1.22, K = HIT / (tHit - tB);
const tau = (t) => (t < tB ? t : t < tHit ? tB + (t - tB) * K : tB + HIT + (t - tHit)); // sim clock
const sA0 = 30, sLeadB = sA0 + V * tB, sCarA = sLeadB + 14 + 2.6;
sideRoad(sCarA);
const leadA = (t) => brakeTo(sA0, 0, tB, 14)(tau(t));
const redA = (t) => { const q = tau(t), e = q - tB; return e < 1 ? sA0 - 7 + V * q : sA0 - 7 + V * (tB + 1) + V * (e - 1) - 3.5 * (e - 1) ** 2; };
const redAc = (t) => (t < tHit ? redA(t) : redA(tHit) + 0.9 * sm(tHit, tHit + 0.6, t)); // contact: shoved to a stop
const tCarA0 = tau(g("s2", "car") - 0.15), tCarA1 = tB + 0.25;
const carA = (t) => { const q = tau(t); return LW + 7 - (LW + 7 - (O + 0.4)) * sm(tCarA0, tCarA1, q); };
// ---------- part B (s4-s5): staggered, same car ----------
const sB0 = 40, tLB = g("s5", "car") + 0.2, sBlead = (t) => brakeTo(sB0, T4, tLB, 14)(t);
const sCarB = sB0 + V * (tLB - T4) + 14 + 2.6;
sideRoad(sCarB);
const tBB = g("s5", "brakes");
const sBblue0 = sB0 - V, sBblueStop = sB0 + V * (tLB - T4) + 14 - 1.2; // stops beside the leader's rear wheel
const sBblue = brakeTo(sBblue0, T4, tBB, sBblueStop - (sBblue0 + V * (tBB - T4)));
const carB = (t) => LW + 7 - (LW + 7 - (O + 0.4)) * sm(g("s5", "car") - 0.6, tLB + 0.25, t);
const OL = O - 1.0, OR = O + 1.0;
// ---------- part C (s6+): single file in the bend, two seconds apart ----------
const sC0 = SB - 8, sCl = (t) => sC0 + V * (t - T6);

// ---------- riders, car, markers ----------
const BK = bikes(4);
const mRed = mSolid.clone(); mRed.color.set(0xc0304a); if (mRed.emissive) mRed.emissive.set(0x501020);
const solids = BK.map((b) => { const a = []; b.g.traverse((o) => { if (o.isMesh && o.material === mSolid) a.push(o); }); return a; });
const tint = (i, red) => solids[i].forEach((o) => (o.material = red ? mRed : mSolid));
const TL = BK.map((b) => { const m = glow(RED, 3); b.tail.material = m; b.tail.scale.set(1.5, 1.5, 1); return m; });
const CAR = makeCar({ color: 0x8a8fd0 });
const lHalf = gline(RED), l1 = gline(GREEN), l2a = gline(GREEN), l2b = gline(GREEN), lc1 = gline(GREEN), lc2 = gline(GREEN), lc3 = gline(GREEN);
const pHard = pill("BRAKES HARD", ORANGE), pHalf = pill("HALF A SECOND", RED), pSide = pill("SIDE BY SIDE", RED), pClose = pill("TOO CLOSE", RED);
const pLead = pill("LEADER", VIOLET), p2nd = pill("2ND", GREEN), p1s = pill("1 S ACROSS", GREEN), p2s = pill("2 S", GREEN), p2s2 = pill("2 S", GREEN), pRoom = pill("ROOM", GREEN);
const pc1 = pill("2 S", GREEN), pc2 = pill("2 S", GREEN), pc3 = pill("2 S", GREEN), pNew = pill("NEW RIDER", GREEN), pLeadC = pill("LEADER", VIOLET);
const rReact = readout("RED REACTS"), rGap = readout("GAP"), rSpd = readout("KM/H");

title("THIS CLOSE TO YOUR FRIENDS?");
cap("s2", "car", ["A CAR", "PULLS OUT"], RED, { y: 0.3, until: ["s2", "front"] });
cap("s2", "front", ["THE LEADER", "BRAKES HARD"], ORANGE, { y: 0.3, until: ["s2", "red"] });
cap("s2", "red", ["RED NEEDS", "A FULL SECOND"], RED, { y: 0.3, until: ["s2", "half"] });
cap("s2", "half", ["BUT HE'S ONLY", "HALF A SECOND BACK"], RED);
cap("s3", "too", ["TOO CLOSE,", "SIDE BY SIDE"], RED, { until: ["s3", "he"] });
cap("s3", "he", ["NOWHERE", "TO GO"], RED, { boom: 0.5 });
cap("s4", "open", ["ON A STRAIGHT:", "RIDE STAGGERED"], GREEN, { until: ["s4", "leader"] });
cap("s4", "leader", ["LEADER", "ON ONE SIDE"], GREEN, { until: ["s4", "second"] });
cap("s4", "second", ["2ND ON THE OTHER,", "ONE SECOND BACK"], GREEN, { until: ["s4", "rest"] });
cap("s4", "rest", ["THE REST: TWO SECONDS", "BEHIND THEIR SIDE"], GREEN);
cap("s5", "same", ["SAME CAR,", "SAME SPEED"], ORANGE, { until: ["s5", "blue"] });
cap("s5", "blue", ["BLUE HAS", "ROOM"], GREEN, { until: ["s5", "he"] });
cap("s5", "he", ["HE BRAKES,", "THEN MOVES OVER"], GREEN);
cap("s6", "bends", ["BENDS AND NARROW ROADS:", "SINGLE FILE"], GREEN, { until: ["s6", "two"] });
cap("s6", "two", ["TWO SECONDS", "APART"], GREEN, { until: ["s6", "new"] });
cap("s6", "new", ["NEW RIDERS RIGHT", "BEHIND THE LEADER"], GREEN);
endCard(["RIDE STAGGERED.", "KEEP TWO SECONDS."]);

// ---------- cameras ----------
const cam = (s, o, y, ls, lo, ly, f) => { const [x, z] = P(s, o), [lx, lz] = P(ls, lo); return [x, y, z, lx, ly, lz, f]; };
const at = (fn, o = O) => (t) => { const s = fn(t), [x, z] = P(s, o); return { x, z, h: C(s)[2] }; };
const sHit = redA(tHit);
const SH = [
  { at: 0, f: at(redA), K: [[0, [1.6, 3.0, 7.5, 0, 0.8, -9, 50]], [T2, [1.2, 2.7, 6.8, 0, 0.8, -9, 50]]] },
  { at: T2, f: at(leadA), K: [[0, [-2.2, 3.4, 6.5, 2.5, 0.6, -26, 44]], [1.8, [-2.2, 3.2, 6.0, 2.0, 0.6, -26, 44]]] },
  { at: tB - 0.1, f: at(leadA), K: [[0, [-7.5, 2.6, 2.5, 0, 0.8, -1.5, 46]], [0.7, [-7.2, 2.5, 1.5, 0, 0.8, -2, 46]]] },
  { at: g("s2", "red") - 0.1, f: at(redA), K: [[0, [0.3, 16, -3.4, 0.3, 0, -3.6, 50]], [3.5, [0.3, 15, -3.4, 0.3, 0, -3.6, 50]]] },
  { at: T3, f: at(leadA), K: [[0, [-3.0, 4.2, -9, 0.3, 0.7, 5, 46]], [2.0, [-2.8, 4.0, -8.5, 0.3, 0.7, 5, 46]]] },
  { at: g("s3", "he") - 0.15, K: [[0, cam(sHit - 2, O - 6.5, 2.0, sHit, O, 0.6, 48)], [1.5, cam(sHit - 1.5, O - 6.8, 2.2, sHit, O, 0.5, 48)]] },
  { at: T4, f: at((t) => sBblue(t) - 28, O), K: [[0, [-3, 9, 13, 0, 0, -26, 50]], [1.9, [-3, 9, 11, 0, 0, -26, 50]]] },
  { at: g("s4", "leader") - 0.15, f: at((t) => sBblue(t) - 28, O), K: [[0, [-5, 15, 13, 0.5, 0, -20, 50]], [5.3, [-5, 14, 11, 0.5, 0, -20, 50]]] },
  { at: T5, f: at(sBblue, OR), K: [[0, [1.0, 2.4, 6.5, -1.5, 0.8, -26, 46]], [2.0, [1.0, 2.3, 6.0, -1.5, 0.8, -26, 46]]] },
  { at: g("s5", "he") - 0.1, f: at(sBblue, O), K: [[0, [0, 16, 0.5, 0, 0, -1.5, 50]], [1.8, [0, 15, 0.5, 0, 0, -1.5, 50]]] },
  { at: T6, f: at((t) => sCl(t) - 84, O), K: [[0, [-6, 18, 14, 0, 0, -60, 50]], [3.5, [-6, 17, 12, 0, 0, -60, 50]]] },
  { at: g("s6", "new") - 0.15, f: at((t) => sCl(t) - 56, O), K: [[0, [-4, 8, 14, 0, 0, -24, 46]], [1.5, [-4, 7.5, 13, 0, 0, -24, 46]]] },
  { at: T7, f: at((t) => sCl(t) - 84, O), K: [[0, [-8, 16, 16, 0, 0, -40, 50]], [2.0, [-8, 22, 18, 0, 0, -40, 50]]] },
];

const win = (t, a, b) => sm(a - 0.1, a + 0.1, t) * (1 - sm(b - 0.12, b, t));
const OFF = (t) => [0, -100000 - t]; // parks unused bikes far away
const fixedFn = (fn, o) => (t) => P(fn(t), typeof o === "function" ? o(t) : o);
run("w", (t) => {
  const tags = [];
  for (const L of [lHalf, l1, l2a, l2b, lc1, lc2, lc3]) L.visible = false;
  const brakeGlow = (i, fn) => { const v0 = speedOf(fn, t - 0.08), v1 = speedOf(fn, t + 0.08); TL[i].color.set(RED).multiplyScalar(v1 < v0 - 0.05 ? 9 : 2.5); };
  if (t < T4) { // ---- part A ----
    const kd = sm(tHit + 0.1, tHit + 0.55, t);
    const oRed = O - 0.25, oFr = O + 1.05;
    ride(BK[0], fixedFn(leadA, O - 0.25), t, VIOLET, {});
    ride(BK[1], (q) => P(redAc(q), oRed - 0.5 * sm(tHit + 0.1, tHit + 0.6, q)), t, RED, { lean: downLean(kd, 1), down: kd });
    ride(BK[2], fixedFn(redA, oFr), t, RED, {});
    tint(1, true); tint(2, true); BK[3].g.visible = false; BK[0].g.visible = BK[1].g.visible = BK[2].g.visible = true;
    brakeGlow(0, leadA); TL[1].color.set(RED).multiplyScalar(tau(t) > tB + 1 ? 9 : 2.5); TL[2].color.copy(TL[1].color);
    const [cx, cz] = P(sCarA, carA(t)); CAR.set({ x: cx, z: cz, h: Math.PI / 2 });
    // half-second line from Red's front wheel to the leader's rear wheel
    const aOn = win(t, g("s2", "red"), T3 + 0.8);
    lHalf.set(P(redA(t) + 0.7, oRed), P(leadA(t) - 0.7, O - 0.25), aOn);
    const [lx, lz] = P(leadA(t), O - 0.25), [rx, rz] = P(redA(t), oRed), [fx, fz] = P(redA(t), oFr);
    tags.push([pHalf, (lx + rx) / 2, 0.3, (lz + rz) / 2, win(t, g("s2", "half"), T3), 0.12]);
    tags.push([pClose, rx - 0.2, 2.4, rz, win(t, g("s3", "too"), g("s3", "he")), 0.12], [pSide, fx + 0.6, 1.6, fz, win(t, g("s3", "side"), g("s3", "he")), 0.12]);
    const react = Math.min(1, Math.max(0, tau(t) - tB));
    rReact.set(react.toFixed(1) + " S", react >= 1 ? RED : ORANGE, -0.55, win(t, g("s2", "red"), T3 + 0.8));
    rGap.set("0.5 S", RED, 0.55, win(t, g("s2", "half") - 0.6, T3 + 0.8));
    rSpd.set("0", RED, 0, 0);
  } else if (t < T6) { // ---- part B ----
    const oBlue = (q) => OR + 0.7 * sm(g("s5", "moves") - 0.1, g("s5", "moves") + 0.6, q);
    ride(BK[0], fixedFn(sBlead, OL), t, VIOLET, {});
    ride(BK[1], fixedFn(sBblue, oBlue), t, GREEN, {});
    ride(BK[2], fixedFn((q) => sBlead(q) - 28, OL), t, VIOLET, {});
    ride(BK[3], fixedFn((q) => sBblue(q) - 28, OR), t, VIOLET, {});
    for (const b of BK) b.g.visible = true;
    tint(1, false); tint(2, false);
    BK[2].g.visible = BK[3].g.visible = t < T5 + 0.3; // the rest drop out of the brake shot
    brakeGlow(0, sBlead); brakeGlow(1, sBblue); TL[2].color.set(RED).multiplyScalar(2.5); TL[3].color.copy(TL[2].color);
    const [cx, cz] = P(sCarB, carB(t)); CAR.set({ x: cx, z: cz, h: Math.PI / 2 });
    const sl = sBlead(t), sb = sBblue(t);
    const [lx, lz] = P(sl, OL), [bx, bz] = P(sb, OR), [x3, z3] = P(sl - 28, OL), [x4, z4] = P(sb - 28, OR);
    l1.set(P(sb + 0.7, OR), P(sl - 0.7, OL), win(t, g("s4", "second", 2) - 0.2, T5));
    l2a.set(P(sl - 28 + 0.7, OL), P(sl - 0.7, OL), win(t, g("s4", "two"), T5));
    l2b.set(P(sb - 28 + 0.7, OR), P(sb - 0.7, OR), win(t, g("s4", "two"), T5));
    tags.push([pLead, lx - 1.8, 1.2, lz, win(t, g("s4", "leader"), T5)], [p2nd, ...((q) => [q[0], 1.2, q[1]])(P(sb - 4, OR + 1.2)), win(t, g("s4", "second"), T5)]);
    tags.push([p1s, (lx + bx) / 2, 0.3, (lz + bz) / 2, win(t, g("s4", "second", 2) - 0.2, T5), 0.11]);
    tags.push([p2s, x3 - 2.6, 0.3, (z3 + lz) / 2, win(t, g("s4", "two"), T5), 0.11], [p2s2, x4 + 2.6, 0.3, (z4 + bz) / 2, win(t, g("s4", "two"), T5), 0.11]);
    tags.push([pRoom, bx + 1.6, 0.4, bz - 4, win(t, g("s5", "blue"), T6), 0.12]);
    rSpd.set(String(Math.round(speedOf(sBblue, t) * 3.6)), GREEN, -0.55, win(t, T4 + 0.2, T5) + win(t, g("s5", "he"), T6));
    rGap.set("1 S", GREEN, 0.55, win(t, g("s5", "blue"), T6));
    rReact.set("0", RED, 0, 0);
  } else { // ---- part C: single file in the bend ----
    tint(1, false); tint(2, false); for (let i = 0; i < 4; i++) { BK[i].g.visible = true; ride(BK[i], fixedFn((q) => sCl(q) - 28 * i, O), t, i === 0 ? VIOLET : GREEN, {}); TL[i].color.set(RED).multiplyScalar(2.5); }
    CAR.set({ x: 0, z: 5000, h: 0 });
    const s0 = sCl(t);
    const on = win(t, g("s6", "two"), T7 + 3);
    for (const [i, L, pm] of [[1, lc1, pc1], [2, lc2, pc2], [3, lc3, pc3]]) {
      const a = s0 - 28 * i, b = s0 - 28 * (i - 1);
      L.set(P(a + 0.7, O), P(b - 0.7, O), on);
      const [mx, mz] = P((a + b) / 2, O + 2.6);
      tags.push([pm, mx, 0.4, mz, on, 0.09]);
    }
    const [nx, nz] = P(s0 - 28, O - 2.2), [lx, lz] = P(s0, O - 2.2);
    tags.push([pNew, nx, 1.4, nz, win(t, g("s6", "new"), T7), 0.12], [pLeadC, lx, 1.4, lz, win(t, g("s6", "new"), T7), 0.12]);
    rReact.set("0", RED, 0, 0); rGap.set("2 S", GREEN, 0.55, win(t, g("s6", "two"), T7)); rSpd.set("0", GREEN, 0, 0);
  }
  const shot = shoot(SH, t);
  for (const [m, x, y, z, a, k] of tags) tagD(m, x, y, z, a, k);
  bloom.strength = 0.9 + 1.0 * shot.punch * shot.punch + overlays(t) + 0.8 * flash(t, tHit + 0.05);
});
