// NEVER BUY A BIGGER COMPUTER (Edge0). Laptop on a dark desk; wrong = the whole model jams the memory bar, right = 256 experts streamed from storage.
import { THREE, S, g, sm, scene, bloom, glow, VIOLET, ORANGE, RED, GREEN, WHITE, beam, shoot, run } from "./kit.js";
import { title, cap, boom, endCard, overlays, fitText } from "./extra.js";

import { RoundedBoxGeometry } from "three/addons/geometries/RoundedBoxGeometry.js";
const std = (c, e, r = 0.45, m = 0.25) => new THREE.MeshStandardMaterial({ color: c, emissive: e, roughness: r, metalness: m });
const rbox = (w, h, d, r, mat) => new THREE.Mesh(new RoundedBoxGeometry(w, h, d, 4, r), mat);
const mBody = std(0x4a42c8, 0x1c1766, 0.35, 0.35), mDark = std(0x14123a, 0x07061a, 0.6, 0.2);
const root = new THREE.Group(); scene.add(root); // everything but captions; hidden for the CTA
const add = (...o) => { root.add(...o); return o[0]; };
const wText = (txt, hex, k, w) => { const t = fitText([txt], hex, k, w); t.visible = true; t.material.depthTest = true; t.renderOrder = 2; return t; };

// ---------- desk + room lights ----------
const desk = add(rbox(9, 0.3, 5, 0.12, std(0x221d66, 0x0c0a30, 0.7, 0.1))); desk.position.set(0, -0.14, -0.6);
const pl = add(new THREE.PointLight(0xe8e2ff, 18, 9, 1.6)); pl.position.set(-1.6, 3.2, 2.2);
const rim = add(new THREE.PointLight(0xff8a3a, 10, 8, 1.6)); rim.position.set(2.6, 2.2, -2.4);

// ---------- laptop at the origin, screen faces +z ----------
const base = add(rbox(2.6, 0.1, 1.7, 0.04, mBody)); base.position.set(0, 0.05, 0);
const keysM = add(rbox(2.2, 0.02, 0.8, 0.01, mDark)); keysM.position.set(0, 0.105, -0.2);
const pad = add(rbox(0.8, 0.02, 0.45, 0.01, mDark)); pad.position.set(0, 0.105, 0.5);
const lid = add(new THREE.Group()); lid.position.set(0, 0.1, -0.85); lid.rotation.x = -0.12;
const screen = rbox(2.6, 1.7, 0.06, 0.04, mBody); screen.position.set(0, 0.85, 0); lid.add(screen);
const mScreen = new THREE.MeshBasicMaterial({ color: 0x0b0a26, toneMapped: false });
const face = new THREE.Mesh(new THREE.PlaneGeometry(2.4, 1.5), mScreen); face.position.set(0, 0.85, 0.035); lid.add(face);
const bar = new THREE.Mesh(new THREE.PlaneGeometry(2.4, 0.12), glow(VIOLET, 0.35)); bar.position.set(0, 1.54, 0.037); lid.add(bar);
const accent = new THREE.Mesh(new THREE.PlaneGeometry(2.4, 0.015), glow(VIOLET, 1.6)); accent.position.set(0, 1.475, 0.038); lid.add(accent);
[-1.08, -0.98, -0.88].forEach((x, i) => { const d = new THREE.Mesh(new THREE.CircleGeometry(0.025, 16), glow([RED, ORANGE, GREEN][i], 1.2)); d.position.set(x, 1.54, 0.039); lid.add(d); });
// screen UI: EDGE0 name (from s3), a MEMORY meter, then two speed bars (s6)
const appName = wText("EDGE0", GREEN, 1.0, 1.3); appName.position.set(0, 1.13, 0.04); lid.add(appName);
const memLbl = wText("MEMORY", WHITE, 0.9, 0.9); memLbl.position.set(0, 0.72, 0.04); lid.add(memLbl);
const memBack = new THREE.Mesh(new THREE.PlaneGeometry(2.0, 0.24), new THREE.MeshBasicMaterial({ color: 0x1d1950, toneMapped: false })); memBack.position.set(0, 0.42, 0.038); lid.add(memBack);
const fillGeo = new THREE.PlaneGeometry(1, 0.2); fillGeo.translate(0.5, 0, 0);
const mFill = glow(VIOLET, 1.2), memFill = new THREE.Mesh(fillGeo, mFill); memFill.position.set(-0.98, 0.42, 0.04); lid.add(memFill);
const spA = new THREE.Mesh(fillGeo, glow(VIOLET, 0.9)), spB = new THREE.Mesh(fillGeo, glow(GREEN, 1.1));
spA.position.set(-0.98, 0.78, 0.04); spB.position.set(-0.98, 0.42, 0.04); lid.add(spA, spB);
const MEM = (x = 0) => lid.localToWorld(new THREE.Vector3(-0.9 + x, 0.42, 0.12)); // a point on the memory meter

// ---------- the bigger computer someone tells you to buy (s1, red) ----------
const tower = add(new THREE.Group()); tower.position.set(1.4, 0, -2.4); tower.scale.set(0.85, 0.85, 0.85);
const tBody = rbox(1.0, 2.6, 1.3, 0.08, std(0x5a1a3a, 0x3a0818, 0.4, 0.3)); tBody.position.y = 1.3; tower.add(tBody);
for (let i = 0; i < 4; i++) { const s = new THREE.Mesh(new THREE.PlaneGeometry(0.7, 0.06), glow(RED, 2.0)); s.position.set(0, 2.2 - i * 0.28, 0.66); tower.add(s); }
const fan = new THREE.Mesh(new THREE.TorusGeometry(0.24, 0.035, 8, 32), glow(RED, 1.8)); fan.position.set(0, 0.7, 0.66); tower.add(fan);

// ---------- the model: 256 experts. cluster 8x8x4 -> wall 16x16 -> into the SSD ----------
const N = 256, mCube = std(0x4a42c8, 0x1c1766, 0.4, 0.2), mSel = glow(GREEN, 1.3), mNext = glow(VIOLET, 1.6);
const cubeGeo = new RoundedBoxGeometry(0.12, 0.12, 0.12, 2, 0.02);
const cubes = Array.from({ length: N }, () => { const c = add(new THREE.Mesh(cubeGeo, mCube)); c.visible = false; return c; });
const C1 = new THREE.Vector3(0, 2.6, -0.9), WALL = new THREE.Vector3(0, 2.72, -1.25);
const clusterPos = (i, out) => out.set(((i % 8) - 3.5) * 0.16, ((((i / 8) | 0) % 8) - 3.5) * 0.16, (((i / 64) | 0) - 1.5) * 0.16);
const wallPos = (i, out) => out.set(((i % 16) - 7.5) * 0.1, (((i / 16) | 0) - 7.5) * 0.1, 0).add(WALL);
const SEL = [37, 58, 101, 140, 171, 222]; // the few experts it needs right now
const SPILL = cubes.map((_, i) => i).filter((i) => i % 7 === 3);
const hash = (i) => { const x = Math.sin(i * 12.9898) * 43758.5453; return x - Math.floor(x); };

// ---------- SSD on the desk (s5) ----------
const SSDP = new THREE.Vector3(-0.75, 0.1, 1.35);
const ssd = add(new THREE.Group()); ssd.position.copy(SSDP);
const ssdB = rbox(1.2, 0.14, 0.62, 0.04, std(0x1f6a48, 0x0c3a24, 0.4, 0.3)); ssd.add(ssdB);
const ssdL = wText("SSD", WHITE, 1.0, 0.7); ssdL.rotation.x = -Math.PI / 2 + 0.35; ssdL.position.set(0, 0.075, 0.02); ssd.add(ssdL);
const ssdLed = new THREE.Mesh(new THREE.SphereGeometry(0.03, 10, 8), glow(GREEN, 2.2)); ssdLed.position.set(0.5, 0.08, 0.2); ssd.add(ssdLed);
const STREAM = Array.from({ length: 7 }, () => add(new THREE.Mesh(cubeGeo, mSel)));
const NEXT = [0, 1].map(() => add(new THREE.Mesh(cubeGeo, mNext)));
const pipe = beam(GREEN, 1.2, 0.03); root.add(pipe);

// ---------- s6: platform cards ----------
const mCard = std(0x4a42c8, 0x1c1766, 0.85, 0.1);
const card = (txt, x, y) => {
  const gp = add(new THREE.Group()); gp.position.set(x, y, -0.5);
  gp.add(rbox(1.15, 0.48, 0.06, 0.06, mCard));
  const t = wText(txt, WHITE, 1.0, 0.95); t.position.z = 0.035; gp.add(t);
  const r = new THREE.Mesh(new THREE.PlaneGeometry(1.05, 0.02), glow(GREEN, 1.6)); r.position.set(0, -0.2, 0.035); gp.add(r);
  gp.visible = false; return gp;
};
const cards = [["MAC", -0.64, 2.95], ["IPHONE", 0.64, 2.95], ["ANDROID", -0.64, 2.35], ["WINDOWS", 0.64, 2.35]].map((a) => card(...a));

// ---------- s3: GitHub star ----------
const starShape = new THREE.Shape();
for (let i = 0; i < 10; i++) { const a = Math.PI / 2 + (i * Math.PI) / 5, r = i % 2 ? 0.17 : 0.4; starShape[i ? "lineTo" : "moveTo"](Math.cos(a) * r, Math.sin(a) * r); }
const star = add(new THREE.Mesh(new THREE.ExtrudeGeometry(starShape, { depth: 0.08, bevelEnabled: true, bevelSize: 0.03, bevelThickness: 0.03, bevelSegments: 2 }), glow(ORANGE, 1.5)));

// ---------- captions ----------
title("NEVER BUY A BIGGER COMPUTER");
cap("s1", "bigger", ["BIGGER COMPUTER?"], RED, { until: ["s1", "exploring"] });
cap("s1", "exploring", ["EXPLORING GITHUB REPOS"], WHITE, { until: "s1" });
cap("s2", "loaded", ["THE NORMAL WAY"], RED, { until: ["s2", "whole"] });
cap("s2", "whole", ["WHOLE MODEL IN MEMORY"], RED, { until: ["s2", "runs"] });
cap("s2", "runs", ["OUT OF MEMORY"], RED, { boom: 0.5 });
cap("s3", "edge0", ["EDGE0"], GREEN, { until: ["s3", "over"], boom: 0.5 });
cap("s3", "over", ["OVER 11,000 STARS", "IN 9 WEEKS"], ORANGE, { until: ["s3", "runs"], boom: 0.5 });
cap("s3", "runs", ["35B AI IN UNDER 3 GB"], GREEN);
cap("s4", "split", ["256 SMALL EXPERTS"], VIOLET, { until: ["s4", "only"], boom: 0.4 });
cap("s4", "only", ["ONLY THE FEW IT NEEDS"], GREEN);
cap("s5", "stream", ["STREAMED FROM STORAGE"], GREEN, { until: ["s5", "predictor"] });
cap("s5", "predictor", ["LOADS THE NEXT ONES AHEAD"], VIOLET);
cap("s6", "up", ["UP TO 59% FASTER"], GREEN, { until: ["s6", "runs"], boom: 0.5 });
cap("s6", "runs", ["RUNS ON YOUR DEVICES"], GREEN);
endCard(["DON'T BUY MORE MEMORY.", "STREAM THE MODEL."]);

// ---------- timings (global seconds) ----------
const T = {
  big: g("s1", "big"), bigger: g("s1", "bigger"), s2: S.s2[0], whole: g("s2", "whole"), once: g("s2", "once"), runsOut: g("s2", "runs"),
  s3: S.s3[0], over: g("s3", "over"), runs: g("s3", "runs"), under: g("s3", "under"),
  s4: S.s4[0], split: g("s4", "split"), only: g("s4", "only"), few: g("s4", "few"),
  s5: S.s5[0], stream: g("s5", "stream"), pred: g("s5", "predictor"), next: g("s5", "next"),
  s6: S.s6[0], up: g("s6", "up"), faster: g("s6", "faster"), plat: ["mac", "iphone", "android", "windows"].map((w) => g("s6", w)),
  s7: S.s7[0], s8: S.s8[0],
};
const v = new THREE.Vector3(), v2 = new THREE.Vector3(), v3 = new THREE.Vector3();

// ---------- shots: [cx,cy,cz, lx,ly,lz, fov] ----------
const WIDE = [0.3, 2.4, 8.0, 0, 1.45, -0.8, 50], WIDE2 = [0.0, 2.5, 8.4, 0, 1.5, -0.8, 50];
const SH = [
  { at: 0, K: [[0, WIDE], [S.s2[0], WIDE2]] },
  { at: T.s2, K: [[0, [-0.4, 2.3, 7.4, 0, 1.45, -0.7, 50]], [5, [-0.1, 2.2, 7.0, 0, 1.4, -0.6, 50]]] },
  { at: T.s3, K: [[0, [-0.6, 2.1, 5.8, 0, 1.0, -0.6, 48]], [3.6, [0.2, 1.8, 5.2, 0, 1.0, -0.6, 46]]] },
  { at: T.runs - 0.1, K: [[0, WIDE], [4, WIDE2]] },
  { at: T.s4, K: [[0, [-0.3, 2.5, 8.2, 0, 1.55, -0.9, 50]], [5.4, [0.3, 2.4, 7.8, 0, 1.55, -0.9, 50]]] },
  { at: T.s5, K: [[0, [0.2, 2.5, 7.4, 0, 1.0, 0.0, 50]], [4, [-0.2, 2.4, 7.0, 0, 1.0, 0.0, 50]]] },
  { at: T.s6, K: [[0, [-0.3, 2.5, 8.2, 0, 1.55, -0.8, 50]], [5, [0.3, 2.5, 8.4, 0, 1.55, -0.8, 50]]] },
  { at: T.s7, calm: 1, K: [[0, [0.3, 2.5, 8.4, 0, 1.55, -0.8, 50]], [4, [0.5, 2.7, 9.0, 0, 1.55, -0.8, 50]]] },
];

run("edge0-world", (t) => {
  const wrong = t < T.s3; lid.updateMatrixWorld(true);
  root.visible = t < T.s8 - 0.1;
  accent.material.color.set(wrong ? (t >= T.whole ? RED : VIOLET) : GREEN).multiplyScalar(1.6);
  mScreen.color.set(wrong ? 0x0b0a26 : 0x0a1a1a);
  appName.visible = !wrong;

  // memory meter: small (s1), fills red (s2), small green (s3+); replaced by speed bars in s6
  const memOn = t < T.up - 0.1;
  memLbl.visible = memBack.visible = memFill.visible = memOn;
  let fill = 0.12;
  if (wrong) fill = 0.12 + 0.88 * sm(T.whole, T.once, t);
  else if (t < T.under) fill = 0.12;
  else fill = 0.12 + 0.06 * sm(T.under, T.under + 0.4, t);
  memFill.scale.x = 1.96 * fill;
  const red = wrong && t >= T.whole, blink = red && t >= T.runsOut ? 0.6 + 0.6 * (Math.sin(t * 22) > 0 ? 1 : 0) : 1.2;
  mFill.color.set(red ? RED : wrong ? VIOLET : GREEN).multiplyScalar(blink);
  const sp = sm(T.up - 0.1, T.faster, t);
  spA.visible = spB.visible = t >= T.up - 0.1;
  spA.scale.x = 1.1 * sm(T.up - 0.1, T.up + 0.3, t); spB.scale.x = 0.01 + 1.74 * sp; // 1 vs 1.59

  // the bigger computer rises in s1, gone at s2
  const tk = sm(T.bigger - 0.1, T.bigger + 0.35, t) * (1 - sm(T.s2 - 0.25, T.s2, t));
  tower.visible = tk > 0.01; tower.scale.set(0.85, 0.85 * Math.max(0.01, tk), 0.85);

  // ---- the 256 experts ----
  const cIn = sm(T.big - 0.1, T.big + 0.35, t);             // s1 pop in
  const drop = sm(T.s2, T.whole + 0.3, t);                   // s2 pushed down onto the screen
  const shake = wrong && t > T.once ? 0.04 * Math.sin(t * 40) : 0;
  const reIn = sm(T.runs - 0.1, T.runs + 0.35, t);           // s3 the same model, running fine
  const toWall = sm(T.split - 0.1, T.split + 0.5, t);
  const toSsd = sm(T.s5 - 0.05, T.s5 + 0.5, t);
  mCube.color.set(wrong ? (t >= T.whole ? 0xc8303e : 0x4a42c8) : t < T.s4 ? 0x2fae6a : 0x4a42c8);
  mCube.emissive.set(wrong ? (t >= T.whole ? 0x5a0a14 : 0x1c1766) : t < T.s4 ? 0x0c4a28 : 0x1c1766);
  const center = v3.copy(C1).add(new THREE.Vector3(shake, -0.35 * drop, 0.25 * drop));
  cubes.forEach((c, i) => {
    let on = false, s = 1;
    c.material = mCube;
    if (wrong) {
      on = cIn > 0.01; s = cIn * (1 + 0.15 * drop);
      clusterPos(i, c.position).multiplyScalar(1 + 0.15 * drop).add(center);
      const sk = SPILL.indexOf(i) >= 0 ? sm(T.runsOut, T.runsOut + 0.6, t) : 0;
      if (sk > 0) { // spill out of the jammed cluster and fall onto the desk in front of the laptop
        const tx = (hash(i) - 0.5) * 2.8, tz = 1.05 + hash(i + 7) * 0.55;
        v.set(tx, 0.07, tz); c.position.lerp(v, sk); c.position.y += Math.sin(sk * Math.PI) * 0.5;
        c.rotation.set(sk * 3 * hash(i), sk * 2, 0);
      } else c.rotation.set(0, 0, 0);
    } else if (t < T.s5 + 0.5) {
      on = reIn > 0.01; s = 0.8 * reIn;
      clusterPos(i, v).multiplyScalar(0.8).add(C1); wallPos(i, v2);
      c.position.copy(v).lerp(v2, toWall); s = s * (1 - 0.2 * toWall);
      c.rotation.set(0, 0, 0);
      const si = SEL.indexOf(i);
      if (si >= 0 && t >= T.only - 0.1) { // the few it needs light up and fly to the memory meter
        c.material = mSel;
        const k = sm(T.only + 0.06 * si, T.few + 0.1 + 0.06 * si, t);
        c.position.lerp(MEM(0.12 + si * 0.14), k); s = 0.64 * (1 - 0.15 * k);
        if (t >= T.s5) on = false;
      } else if (toSsd > 0) { // the rest go back into storage
        v.copy(SSDP).add(new THREE.Vector3((hash(i) - 0.5) * 0.9, 0.1, (hash(i + 3) - 0.5) * 0.4));
        c.position.lerp(v, toSsd); s *= 1 - 0.9 * toSsd; on = toSsd < 0.98;
      }
    }
    c.visible = on; c.scale.setScalar(Math.max(0.001, s));
  });

  // ---- s5: SSD + experts streaming up to memory, next ones loaded a step ahead ----
  const ssdK = sm(T.s5 - 0.1, T.s5 + 0.25, t) * (1 - sm(T.s6 - 0.1, T.s6 + 0.15, t));
  ssd.visible = ssdK > 0.01; ssd.scale.setScalar(Math.max(0.01, ssdK));
  const stK = sm(T.stream - 0.05, T.stream + 0.2, t) * (1 - sm(T.s6 - 0.1, T.s6 + 0.1, t));
  v.copy(SSDP).add(new THREE.Vector3(0, 0.15, 0)); v2.copy(MEM(0.5));
  pipe.set(v, v2, stK * 0.5);
  STREAM.forEach((c, k) => {
    const ph = ((t - T.stream) * 0.85 + k / STREAM.length) % 1;
    c.visible = stK > 0.01 && t >= T.stream; c.position.copy(v).lerp(v2, ph); c.scale.setScalar(0.7 * stK);
  });
  NEXT.forEach((c, k) => { // the predictor pulls the next two ahead of time; they wait beside the meter
    const nk = sm(T.next - 0.15 + 0.12 * k, T.next + 0.35 + 0.12 * k, t);
    c.visible = nk > 0.01 && t < T.s6 + 0.1; c.position.copy(v).lerp(MEM(1.3 + k * 0.18).add(new THREE.Vector3(0, 0.22, 0)), nk);
    c.scale.setScalar(0.75 * Math.min(1, nk * 3) * (1 - sm(T.s6 - 0.1, T.s6 + 0.1, t)));
  });

  // ---- s6: platform cards, one per word ----
  cards.forEach((cd, i) => {
    const k = sm(T.plat[i] - 0.1, T.plat[i] + 0.2, t) * (1 - sm(T.s7 - 0.2, T.s7, t));
    cd.visible = k > 0.01; cd.scale.setScalar(Math.max(0.01, k));
  });

  // ---- s3: the star while the star count is on screen ----
  const sk = sm(T.over - 0.1, T.over + 0.25, t) * (1 - sm(T.runs - 0.15, T.runs + 0.1, t));
  star.visible = sk > 0.01; star.scale.setScalar(0.62 * sk * (1 + 0.08 * Math.sin(t * 6)));
  star.position.set(0, 2.02, -0.3); star.rotation.y = 0.35 * Math.sin((t - T.over) * 2.5);

  const { punch } = shoot(SH, t);
  const spike = overlays(t);
  bloom.strength = Math.min(1.45, 1.0 + 1.2 * punch * punch + spike);
});
