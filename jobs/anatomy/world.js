// NEVER SETTLE FOR A WALL OF TEXT (Anatomy). Laptop on a dark desk; wrong = an AI wall of red paragraphs,
// right = a 3D rocket engine builds out of the screen, fires, splits into 11 parts, flat drawing or 3D.
import { THREE, S, g, sm, scene, bloom, glow, tube, VIOLET, ORANGE, RED, GREEN, WHITE, label, beam, shoot, run } from "./kit.js";
import { title, cap, boom, endCard, overlays, fitText } from "./extra.js";

import { RoundedBoxGeometry } from "three/addons/geometries/RoundedBoxGeometry.js";
const std = (c, e, r = 0.45, m = 0.25) => new THREE.MeshStandardMaterial({ color: c, emissive: e, roughness: r, metalness: m });
const rbox = (w, h, d, r, mat) => new THREE.Mesh(new RoundedBoxGeometry(w, h, d, 4, r), mat);
const mBody = std(0x4a42c8, 0x1c1766, 0.35, 0.35), mDark = std(0x14123a, 0x07061a, 0.6, 0.2), mLav = std(0xc9c0ff, 0x4a3fb0, 0.4, 0.1);

// ---------- desk + room lights ----------
const desk = rbox(9, 0.3, 5, 0.12, std(0x221d66, 0x0c0a30, 0.7, 0.1)); desk.position.set(0, -0.14, -0.6); scene.add(desk);
const pl = new THREE.PointLight(0xe8e2ff, 18, 9, 1.6); pl.position.set(-1.6, 3.2, 2.2); scene.add(pl);
const rim = new THREE.PointLight(0xff8a3a, 10, 8, 1.6); rim.position.set(2.6, 2.2, -2.4); scene.add(rim);

// ---------- laptop at the origin, screen faces +z (filee) ----------
const lap = new THREE.Group(); scene.add(lap);
const base = rbox(2.6, 0.1, 1.7, 0.04, mBody); base.position.set(0, 0.05, 0); lap.add(base);
const kb = rbox(2.2, 0.02, 0.8, 0.01, mDark); kb.position.set(0, 0.105, -0.2); lap.add(kb);
const pad = rbox(0.8, 0.02, 0.45, 0.01, mDark); pad.position.set(0, 0.105, 0.5); lap.add(pad);
const lid = new THREE.Group(); lid.position.set(0, 0.1, -0.85); lid.rotation.x = -0.12; lap.add(lid);
const screen = rbox(2.6, 1.7, 0.06, 0.04, mBody); screen.position.set(0, 0.85, 0); lid.add(screen);
const mScreen = new THREE.MeshBasicMaterial({ color: 0x0b0a26, toneMapped: false });
const face = new THREE.Mesh(new THREE.PlaneGeometry(2.4, 1.5), mScreen); face.position.set(0, 0.85, 0.035); lid.add(face);
const bar = new THREE.Mesh(new THREE.PlaneGeometry(2.4, 0.12), glow(VIOLET, 0.35)); bar.position.set(0, 1.54, 0.037); lid.add(bar);
const accent = new THREE.Mesh(new THREE.PlaneGeometry(2.4, 0.015), glow(VIOLET, 1.6)); accent.position.set(0, 1.475, 0.038); lid.add(accent);
[-1.08, -0.98, -0.88].forEach((x, i) => { const d = new THREE.Mesh(new THREE.CircleGeometry(0.025, 16), glow([RED, ORANGE, GREEN][i], 1.2)); d.position.set(x, 1.54, 0.039); lid.add(d); });
const SCR = (x, y) => new THREE.Vector3(x, 0.1 + y, -0.85 + 0.12 * y + 0.25); // point just in front of the screen

// chat on the screen: the question bubble, then a wall of red answer lines
const bubble = new THREE.Group(); bubble.position.set(0.12, 1.27, 0.04); lid.add(bubble);
bubble.add(new THREE.Mesh(new THREE.PlaneGeometry(2.0, 0.26), glow(VIOLET, 0.45)));
const qTxt = fitText(["HOW DOES A ROCKET ENGINE WORK?"], WHITE, 1.0, 1.9); qTxt.visible = true; qTxt.position.z = 0.004; bubble.add(qTxt);
const LINES = Array.from({ length: 8 }, (_, i) => {
  const w = [2.1, 1.9, 2.15, 1.6, 2.05, 1.95, 2.1, 1.4][i];
  const m = new THREE.Mesh(new THREE.PlaneGeometry(w, 0.045), glow(RED, 1.3)); m.position.set(-1.1 + w / 2, 1.02 - i * 0.1, 0.04); lid.add(m); return m;
});

// ---------- s2: four paragraphs fly out into a wall ----------
function makePara(i) {
  const gp = new THREE.Group();
  gp.add(rbox(0.82, 0.62, 0.04, 0.03, std(0x2a0c1e, 0x14040c, 0.6, 0.1)));
  for (let j = 0; j < 6; j++) {
    const w = [0.66, 0.6, 0.68, 0.52, 0.64, 0.4][(j + i) % 6];
    const l = new THREE.Mesh(new THREE.PlaneGeometry(w, 0.035), glow(RED, 1.2)); l.position.set(-0.34 + w / 2, 0.22 - j * 0.085, 0.025); gp.add(l);
  }
  gp.visible = false; scene.add(gp); return gp;
}
const paras = [0, 1, 2, 3].map(makePara);
const WALL = [[-0.46, 1.48], [0.46, 1.48], [-0.46, 0.76], [0.46, 0.76]].map(([x, y]) => new THREE.Vector3(x, y, 1.2));
const CORNER = [[-0.68, 1.68], [0.68, 1.68], [-0.68, 0.56], [0.68, 0.56]].map(([x, y]) => new THREE.Vector3(x, y, 1.2));
const qMark = fitText(["?"], RED, 2.0, 1.2); // world-space question mark in the middle of the wall

// ---------- the rocket engine: 11 parts, each with an exploded offset ----------
const E = new THREE.Vector3(0, 3.4, -0.6);
const eng = new THREE.Group(); eng.position.copy(E); scene.add(eng);
const mMetal = std(0x6a62e0, 0x241d80, 0.3, 0.55), mHot2 = std(0x7c3cff, 0x3a1890, 0.35, 0.4);
const PARTS = [];
function part(off, ...meshes) { const gp = new THREE.Group(); meshes.forEach((m) => gp.add(m)); gp.userData.off = new THREE.Vector3(...off); eng.add(gp); PARTS.push(gp); return gp; }
const at = (m, x, y, z = 0) => (m.position.set(x, y, z), m);
const cyl = (r, h, mat, seg = 32) => new THREE.Mesh(new THREE.CylinderGeometry(r, r, h, seg), mat);
const ringG = (r, k = 1.8) => { const m = new THREE.Mesh(new THREE.TorusGeometry(r, 0.018, 8, 48), glow(GREEN, k)); m.rotation.x = Math.PI / 2; return m; };
// 1 nozzle bell
const prof = [[0.17, 0], [0.2, -0.15], [0.28, -0.4], [0.38, -0.62], [0.46, -0.85]].map(([r, y]) => new THREE.Vector2(r, y));
const bell = new THREE.Mesh(new THREE.LatheGeometry(prof, 48), new THREE.MeshStandardMaterial({ color: 0x5a52d8, emissive: 0x201870, roughness: 0.3, metalness: 0.5, side: THREE.DoubleSide }));
part([0, -0.5, 0], at(bell, 0, -0.25), at(ringG(0.46, 2.2), 0, -1.1));
// 2 combustion chamber, 3 injector dome
part([0, 0, 0], at(cyl(0.2, 0.4, mMetal), 0, -0.05), at(ringG(0.205), 0, 0.05));
part([0, 0.3, 0], at(new THREE.Mesh(new THREE.SphereGeometry(0.22, 32, 12, 0, Math.PI * 2, 0, Math.PI / 2), mHot2), 0, 0.15));
// 4-5 turbopumps, 6-7 preburners
[1, -1].forEach((s) => part([0.53 * s, 0.15, 0], at(cyl(0.13, 0.42, mMetal), 0.42 * s, 0.35), at(ringG(0.135), 0.42 * s, 0.35)));
[1, -1].forEach((s) => part([0.53 * s, 0.3, 0], at(cyl(0.09, 0.3, mHot2), 0.42 * s, 0.75), at(ringG(0.095, 1.4), 0.42 * s, 0.86)));
// 8-9 feed pipes (pump to chamber)
[1, -1].forEach((s) => part([0.25 * s, -0.3, 0], tube([0.42 * s, 0.15, 0], [0.42 * s, -0.05, 0], 0.07, mLav), tube([0.45 * s, -0.05, 0], [0.19 * s, -0.05, 0], 0.07, mLav)));
// 10 gimbal block, 11 thrust plate
part([0, 0.45, 0], at(new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.16, 0.22), mHot2), 0, 0.5));
part([0, 0.65, 0], at(cyl(0.35, 0.05, mMetal), 0, 0.65), at(ringG(0.35, 1.6), 0, 0.68));
const engLight = new THREE.PointLight(0xc8c0ff, 14, 7, 1.6); engLight.position.set(-1.4, 4.6, 1.8); scene.add(engLight);
const fireLight = new THREE.PointLight(0xff7a2a, 0, 5, 1.6); fireLight.position.set(0, 1.9, 0.2); scene.add(fireLight);

// plume under the nozzle (exit at local y -1.1)
const plume = new THREE.Group(); plume.position.set(0, -1.1, 0); eng.add(plume);
const addMat = (hex, k, o) => new THREE.MeshBasicMaterial({ color: new THREE.Color(hex).multiplyScalar(k), toneMapped: false, transparent: true, opacity: o, blending: THREE.AdditiveBlending, depthWrite: false });
const outer = new THREE.Mesh(new THREE.ConeGeometry(0.42, 0.95, 32, 1, true), addMat(ORANGE, 1.4, 0.75)); outer.rotation.x = Math.PI; outer.position.y = -0.47; plume.add(outer);
const core = new THREE.Mesh(new THREE.ConeGeometry(0.22, 0.7, 24, 1, true), addMat(0xffe0a0, 1.6, 0.9)); core.rotation.x = Math.PI; core.position.y = -0.35; plume.add(core);
const diamonds = [0.2, 0.42, 0.62].map((y, i) => { const m = new THREE.Mesh(new THREE.SphereGeometry(0.07 - i * 0.015, 12, 8), addMat(WHITE, 2.0, 0.9)); m.position.y = -y; plume.add(m); return m; });

// build beam: parts fly out of the laptop screen
const buildBeam = beam(GREEN, 1.6, 0.05);

// ---------- s5: cursor ----------
const cursor = new THREE.Mesh(new THREE.ConeGeometry(0.07, 0.2, 3), glow(WHITE, 1.4)); cursor.rotation.z = 0.5; scene.add(cursor);

// ---------- s6: flat drawing of the same engine, and a "nothing to install" check ----------
const sheet = new THREE.Group(); sheet.position.copy(E); scene.add(sheet);
sheet.add(at(new THREE.Mesh(new THREE.PlaneGeometry(1.5, 2.1), new THREE.MeshBasicMaterial({ color: 0x0d0b2e })), 0, -0.2, -0.01));
const mLineV = glow(VIOLET, 1.4), mLineG = glow(GREEN, 1.3);
const poly = (pts, mat, r = 0.022) => { for (let i = 1; i < pts.length; i++) sheet.add(tube([...pts[i - 1], 0], [...pts[i], 0], r, mat)); };
poly([[-0.75, 0.85], [0.75, 0.85], [0.75, -1.25], [-0.75, -1.25], [-0.75, 0.85]], mLineV, 0.03);
[1, -1].forEach((s) => {
  poly([[0.17 * s, -0.25], [0.2 * s, -0.4], [0.28 * s, -0.65], [0.38 * s, -0.87], [0.46 * s, -1.1]], mLineG); // bell
  poly([[0.2 * s, -0.25], [0.2 * s, 0.15]], mLineG); // chamber wall
  poly([[0.29 * s, 0.14], [0.55 * s, 0.14], [0.55 * s, 0.56], [0.29 * s, 0.56], [0.29 * s, 0.14]], mLineG); // pump
  poly([[0.33 * s, 0.6], [0.51 * s, 0.6], [0.51 * s, 0.9], [0.33 * s, 0.9], [0.33 * s, 0.6]], mLineG); // preburner
  poly([[0.42 * s, 0.14], [0.42 * s, -0.05], [0.2 * s, -0.05]], mLineV); // pipe
});
poly([[-0.46, -1.1], [0.46, -1.1]], mLineG); poly([[-0.2, -0.25], [0.2, -0.25]], mLineG);
poly(Array.from({ length: 9 }, (_, i) => { const a = (i / 8) * Math.PI; return [Math.cos(a) * 0.22, 0.15 + Math.sin(a) * 0.22]; }), mLineG); // dome
poly([[-0.35, 0.65], [0.35, 0.65]], mLineV);
sheet.visible = false;
const check = new THREE.Group(); scene.add(check);
check.add(tube([-0.16, 0.0, 0], [-0.05, -0.12, 0], 0.07, glow(GREEN, 1.8)), tube([-0.05, -0.12, 0], [0.18, 0.16, 0], 0.07, glow(GREEN, 1.8)));
check.visible = false;

// ---------- s3: GitHub star (filee) ----------
const starShape = new THREE.Shape();
for (let i = 0; i < 10; i++) { const a = Math.PI / 2 + (i * Math.PI) / 5, r = i % 2 ? 0.17 : 0.4; starShape[i ? "lineTo" : "moveTo"](Math.cos(a) * r, Math.sin(a) * r); }
const star = new THREE.Mesh(new THREE.ExtrudeGeometry(starShape, { depth: 0.08, bevelEnabled: true, bevelSize: 0.03, bevelThickness: 0.03, bevelSegments: 2 }), glow(ORANGE, 1.5));
scene.add(star);

// ---------- captions ----------
title("NEVER SETTLE FOR A WALL OF TEXT");
cap("s1", "exploring", ["EXPLORING GITHUB REPOS"], WHITE, { until: "s1" });
cap("s2", "four", ["FOUR LONG PARAGRAPHS"], RED, { until: ["s2", "still"] });
cap("s2", "still", ["CAN'T PICTURE A PART"], RED, { boom: 0.5 });
cap("s3", "anatomy", ["ANATOMY"], GREEN, { until: ["s3", "over"], boom: 0.5 });
cap("s3", "over", ["OVER 27,000 STARS", "IN 5 WEEKS"], ORANGE, { until: ["s3", "it's"], boom: 0.5 });
cap("s3", "free", ["FREE SKILL FOR CLAUDE"], GREEN, { until: ["s3", "explains"] });
cap("s3", "explains", ["EXPLAINS BY BUILDING"], GREEN);
cap("s4", "3d", ["A 3D ROCKET ENGINE"], VIOLET, { until: ["s4", "firing"] });
cap("s4", "firing", ["FIRING"], GREEN, { boom: 0.5 });
cap("s5", "mouse", ["MOUSE OVER IT"], VIOLET, { until: ["s5", "11"] });
cap("s5", "11", ["11 MAIN PARTS"], GREEN, { boom: 0.5 });
cap("s6", "flat", ["FLAT DRAWINGS"], VIOLET, { until: ["s6", "full"] });
cap("s6", "full", ["OR FULL 3D MODELS"], VIOLET, { until: ["s6", "nothing"] });
cap("s6", "nothing", ["NOTHING TO INSTALL"], GREEN);
endCard(["DON'T READ ABOUT IT.", "BUILD IT."]);

// ---------- timings (global seconds) ----------
const T = {
  never: g("s1", "never"), wall: g("s1", "wall"), text: g("s1", "text"), four: g("s2", "four"), still: g("s2", "still"),
  s3: S.s3[0], over: g("s3", "over"), its: g("s3", "it's"), explains: g("s3", "explains"), building: g("s3", "building"),
  s4: S.s4[0], firing: g("s4", "firing"), s5: S.s5[0], mouse: g("s5", "mouse"), over5: g("s5", "over"), splits: g("s5", "splits"),
  s6: S.s6[0], flat: g("s6", "flat"), full: g("s6", "full"), nothing: g("s6", "nothing"), s7: S.s7[0],
};
const v = new THREE.Vector3(), v2 = new THREE.Vector3();
const SRC = SCR(0, 0.85);

// ---------- shots: [cx,cy,cz, lx,ly,lz, fov] ----------
const sp = T.splits - T.s5;
const SH = [
  { at: 0, K: [[0, [0.3, 1.8, 5.6, 0, 0.9, -0.5, 48]], [S.s2[0], [0.1, 1.8, 5.0, 0, 1.0, -0.6, 48]]] },
  { at: S.s2[0], K: [[0, [0, 1.7, 5.7, 0, 1.12, -0.4, 50]], [3.9, [0, 1.65, 5.4, 0, 1.12, -0.4, 50]]] },
  { at: T.s3, K: [[0, [-0.6, 2.1, 5.8, 0, 1.0, -0.6, 48]], [3.6, [0.2, 1.8, 5.2, 0, 1.0, -0.6, 46]]] },
  { at: T.explains - 0.25, K: [[0, [0, 2.2, 6.6, 0, 1.9, -0.6, 46]], [1.8, [0, 3.2, 7.8, 0, 2.84, -0.6, 46]], [3, [0.2, 3.25, 7.9, 0, 2.86, -0.6, 46]]] },
  { at: T.s4, K: [[0, [0.6, 3.6, 5.3, 0, 3.26, -0.6, 46]], [3.6, [-0.3, 3.7, 4.95, 0, 3.26, -0.6, 46]]] },
  { at: T.s5, K: [[0, [0.2, 3.7, 5.0, 0, 3.4, -0.6, 46]], [sp, [0.1, 3.8, 5.2, 0, 3.55, -0.6, 46]], [sp + 0.7, [0, 4.1, 5.45, 0, 3.84, -0.6, 46]], [3.3, [-0.2, 4.1, 5.55, 0, 3.84, -0.6, 46]]] },
  { at: T.s6, K: [[0, [0, 3.75, 5.2, 0, 3.4, -0.6, 46]], [3.8, [0.2, 3.8, 5.0, 0, 3.4, -0.6, 46]]] },
  { at: T.s7, calm: 1, K: [[0, [0, 3.8, 5.6, 0, 3.6, -0.6, 48]], [3, [0, 3.9, 6.2, 0, 3.6, -0.6, 48]]] },
];

run("anatomy-world", (t) => {
  const wrong = t < T.s3;
  // laptop: until the camera rises to the engine in s4
  lap.visible = t < T.s4;
  accent.material.color.set(wrong ? (t >= T.never ? RED : VIOLET) : GREEN).multiplyScalar(1.6);
  mScreen.color.set(wrong ? 0x0b0a26 : 0x0a1a1a);
  bubble.visible = wrong;
  LINES.forEach((m, i) => { m.visible = t >= T.never + 0.16 * i && t < T.four + 0.1 * i; });

  // s2: paragraphs fly out of the screen into a wall, then split to the corners around a "?"
  paras.forEach((p, i) => {
    const k = sm(T.four + 0.12 * i, T.four + 0.5 + 0.12 * i, t), c = sm(T.still - 0.1, T.still + 0.35, t);
    p.visible = wrong && k > 0.01;
    p.position.copy(SRC).lerp(WALL[i], k).lerp(CORNER[i], c);
    p.scale.setScalar((0.3 + 0.7 * k) * (1 - 0.3 * c)); p.rotation.y = 0.15 * Math.sin(t * 1.5 + i);
  });
  const qa = sm(T.still, T.still + 0.3, t) * (wrong ? 1 : 0);
  label(qMark, 0, 1.12, 1.3, 0.75 * (1 + 0.06 * Math.sin(t * 7)), qa);

  // engine: parts fly out of the screen while "explains ... building it"
  eng.visible = t >= T.explains - 0.05;
  eng.rotation.y = 0.45 * Math.sin((t - T.explains) * 0.8);
  const boomK = sm(T.splits - 0.05, T.splits + 0.5, t) * (1 - sm(T.flat - 0.15, T.flat + 0.15, t));
  PARTS.forEach((p, i) => {
    const k = sm(T.explains + 0.12 * i, T.explains + 0.55 + 0.12 * i, t);
    v.copy(SRC).sub(E); // screen point in engine-local space (rotation is small during the build)
    p.position.copy(v).lerp(v2.set(0, 0, 0), k).addScaledVector(p.userData.off, boomK);
    p.scale.setScalar(0.25 + 0.75 * k);
    p.visible = k > 0.01;
  });
  buildBeam.set(SRC, v.copy(E).add(new THREE.Vector3(0, -0.6, 0)), sm(T.explains - 0.1, T.explains + 0.2, t) * (1 - sm(T.building + 0.4, T.building + 0.8, t)) * 0.7);

  // s6: engine swaps for a flat drawing, then back to 3D
  const flatK = sm(T.flat - 0.1, T.flat + 0.2, t) * (1 - sm(T.full - 0.1, T.full + 0.2, t));
  eng.scale.setScalar(1 - flatK);
  sheet.visible = flatK > 0.01; sheet.scale.setScalar(flatK);
  const ck = sm(T.nothing - 0.05, T.nothing + 0.25, t) * (1 - sm(T.s7 - 0.1, T.s7 + 0.1, t));
  check.visible = ck > 0.01; check.scale.setScalar(ck * 1.1); check.position.set(0.95, 3.0, -0.3);

  // plume: fires in s4, off when it splits, back on in s7
  const fire = Math.max(sm(T.firing - 0.1, T.firing + 0.2, t) * (1 - sm(T.splits - 0.2, T.splits, t)), sm(T.s7 - 0.1, T.s7 + 0.3, t));
  plume.visible = fire > 0.01;
  plume.scale.set(fire * (1 + 0.05 * Math.sin(t * 37)), fire * (1 + 0.08 * Math.sin(t * 23)), fire);
  diamonds.forEach((d, i) => d.scale.setScalar(1 + 0.25 * Math.sin(t * 29 + i * 2)));
  fireLight.intensity = 16 * fire;

  // s5: cursor glides in from the right and hovers on the engine
  const cOn = t >= T.mouse - 0.1 && t < T.flat;
  cursor.visible = cOn;
  cursor.position.copy(v.set(1.25, 2.6, 0.4)).lerp(v2.set(0.35, 3.25, 0.4), sm(T.mouse, T.over5 + 0.1, t));

  // s3: the star pops in above the laptop while the star count is on screen
  const sk = sm(T.over - 0.1, T.over + 0.25, t) * (1 - sm(T.its - 0.15, T.its + 0.1, t));
  star.visible = sk > 0.01; star.scale.setScalar(0.62 * sk * (1 + 0.08 * Math.sin(t * 6)));
  star.position.set(0, 2.02, -0.3); star.rotation.y = 0.35 * Math.sin((t - T.over) * 2.5);

  const { punch } = shoot(SH, t);
  const spike = overlays(t);
  // capped so a bloom hit never washes out the captions
  bloom.strength = Math.min(1.45, 0.9 + 0.8 * punch * punch + 0.6 * spike);
});
