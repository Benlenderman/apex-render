// NEVER BUY A HANDHELD (DroidDeck). Phone on a stand on a dark desk; wrong = a red gaming handheld (pay + charge), right = Steam game mode on the phone.
import { THREE, S, g, sm, scene, bloom, glow, tube, VIOLET, ORANGE, RED, GREEN, WHITE, beam, shoot, run } from "./kit.js";
import { title, cap, boom, endCard, overlays, fitText, mSkin } from "./extra.js";

import { RoundedBoxGeometry } from "three/addons/geometries/RoundedBoxGeometry.js";
const std = (c, e, r = 0.45, m = 0.25) => new THREE.MeshStandardMaterial({ color: c, emissive: e, roughness: r, metalness: m });
const rbox = (w, h, d, r, mat) => new THREE.Mesh(new RoundedBoxGeometry(w, h, d, 4, r), mat);
const plane = (w, h, mat) => new THREE.Mesh(new THREE.PlaneGeometry(w, h), mat);
const mBody = std(0x4a42c8, 0x1c1766, 0.35, 0.35), mDark = std(0x14123a, 0x07061a, 0.6, 0.2), mLav = std(0xc9c0ff, 0x4a3fb0, 0.4, 0.1);
const mRedBody = std(0x7a1626, 0x3a0510, 0.4, 0.3);
const txt = (s, hex, w, k = 1.0) => { const t = fitText([s], hex, k, 2); t.visible = true; t.scale.setScalar(w / 2); return t; };
const ROOT = new THREE.Group(); scene.add(ROOT); // everything here is hidden before the CTA

// ---------- desk + room lights ----------
const desk = rbox(18, 0.3, 5, 0.12, std(0x221d66, 0x0c0a30, 0.7, 0.1)); desk.position.set(3, -0.14, -0.6); ROOT.add(desk);
const pl = new THREE.PointLight(0xe8e2ff, 18, 9, 1.6); pl.position.set(-1.6, 3.2, 2.2); ROOT.add(pl);
const rim = new THREE.PointLight(0xff8a3a, 10, 8, 1.6); rim.position.set(2.6, 2.2, -2.4); ROOT.add(rim);

// ---------- a "game mode" screen: green bar, hero tile with a play triangle, 2x2 small tiles ----------
function gameUI(w, h) {
  const gp = new THREE.Group();
  const bar = plane(w, h * 0.025, glow(GREEN, 1.4)); bar.position.set(0, h * 0.4, 0.002); gp.add(bar);
  const hero = plane(w * 0.44, h * 0.62, glow(VIOLET, 0.75)); hero.position.set(-w * 0.23, -h * 0.06, 0.002); gp.add(hero);
  const tri = new THREE.Mesh(new THREE.CircleGeometry(h * 0.12, 3), glow(WHITE, 1.2)); tri.position.set(-w * 0.23, -h * 0.06, 0.004); gp.add(tri);
  const small = [[0.12, 0.1], [0.36, 0.1], [0.12, -0.22], [0.36, -0.22]].map(([x, y], i) => {
    const p = plane(w * 0.2, h * 0.27, glow([ORANGE, 0x4fb4ff, GREEN, 0xff7ad9][i], 0.7)); p.position.set(w * x, h * y, 0.002); gp.add(p); return p;
  });
  gp.userData.small = small;
  return gp;
}

// ---------- phone on a stand at the origin, screen faces +z ----------
const PH = new THREE.Group(); PH.position.set(0, 1.02, 0); PH.rotation.x = -0.08; ROOT.add(PH);
const PW = 2.9, PHH = 1.42;
{ // phone body: rounded-rect slab (RoundedBox clamps the corner to the thin depth), punch-hole camera on the left
  const r = 0.24, w = PW / 2, h = PHH / 2, sh = new THREE.Shape();
  sh.moveTo(-w + r, -h); sh.lineTo(w - r, -h); sh.quadraticCurveTo(w, -h, w, -h + r); sh.lineTo(w, h - r); sh.quadraticCurveTo(w, h, w - r, h);
  sh.lineTo(-w + r, h); sh.quadraticCurveTo(-w, h, -w, h - r); sh.lineTo(-w, -h + r); sh.quadraticCurveTo(-w, -h, -w + r, -h);
  const body = new THREE.Mesh(new THREE.ExtrudeGeometry(sh, { depth: 0.1, bevelEnabled: true, bevelSize: 0.02, bevelThickness: 0.02, bevelSegments: 2 }), mBody);
  body.position.z = -0.06; PH.add(body);
}
const mScreen = new THREE.MeshBasicMaterial({ color: 0x0b0a26, toneMapped: false });
const SW = PW - 0.36, SHh = PHH - 0.14;
const face = new THREE.Mesh(new RoundedBoxGeometry(SW, SHh, 0.01, 4, 0.004), mScreen); face.position.set(0.04, 0, 0.068); PH.add(face);
const cam = new THREE.Mesh(new THREE.CircleGeometry(0.045, 20), new THREE.MeshBasicMaterial({ color: 0x05040f })); cam.position.set(-PW / 2 + 0.11, 0, 0.081); PH.add(cam);
const stand = new THREE.Group(); ROOT.add(stand);
const sb = rbox(1.3, 0.08, 0.7, 0.03, mDark); sb.position.set(0, 0.04, -0.05); stand.add(sb);
const sp = rbox(1.0, 0.7, 0.06, 0.03, mDark); sp.position.set(0, 0.45, -0.32); sp.rotation.x = -0.3; stand.add(sp);
const lip = rbox(1.3, 0.12, 0.12, 0.03, mDark); lip.position.set(0, 0.32, 0.12); stand.add(lip);
// screen layers (children of the phone, just above the glass)
const S0 = new THREE.Group(); S0.position.z = 0.075; PH.add(S0);
const qMark = txt("?", RED, 1.6, 1.4); S0.add(qMark);
const ui = gameUI(SW, SHh); S0.add(ui);
const icon = new THREE.Group(); S0.add(icon);
icon.add(rbox(0.62, 0.62, 0.08, 0.14, std(0x1f7a4a, 0x0f5a33, 0.4, 0.2)));
const ic = txt("DD", WHITE, 0.6, 1.0); ic.position.z = 0.045; icon.add(ic);
const playBtn = new THREE.Group(); S0.add(playBtn);
playBtn.add(rbox(1.2, 0.42, 0.06, 0.12, std(0x1f7a4a, 0x14883f, 0.4, 0.2)));
const pt = txt("PLAY", WHITE, 1.0, 1.0); pt.position.z = 0.035; playBtn.add(pt);
const sign = new THREE.Group(); S0.add(sign);
sign.add(rbox(1.5, 0.95, 0.05, 0.08, mLav));
const st1 = txt("SIGN IN", 0x3d2bd6, 1.1, 0.6); st1.position.set(0, 0.22, 0.03); sign.add(st1);
[0.0, -0.22].forEach((y) => { const l = plane(1.1, 0.12, new THREE.MeshBasicMaterial({ color: 0x8a80e0 })); l.position.set(0, y, 0.03); sign.add(l); });
const check = new THREE.Mesh(new THREE.CircleGeometry(0.12, 24), glow(GREEN, 1.6)); check.position.set(0.62, 0.36, 0.035); sign.add(check);
// store tiles that drop into the library (s5)
const STORES = ["GOG", "EPIC", "XBOX"];
const stores = STORES.map((s, i) => {
  const gp = new THREE.Group();
  gp.add(rbox(SW * 0.2, SHh * 0.27, 0.05, 0.04, std([0x6b3fd0, 0x2a2a2a, 0x1f7a3a][i], [0x2a1470, 0x0c0c0c, 0x0a3a18][i], 0.4, 0.2)));
  const t = txt(s, WHITE, SW * 0.18, 1.0); t.position.z = 0.03; gp.add(t);
  S0.add(gp); return gp;
});
const finger = new THREE.Mesh(new THREE.CapsuleGeometry(0.11, 0.5, 6, 12), mSkin); finger.rotation.x = Math.PI / 2 - 0.3; ROOT.add(finger);

// ---------- s1 game cards floating above the phone ----------
const cards = [0, 1, 2].map((i) => {
  const gp = new THREE.Group();
  gp.add(rbox(0.62, 0.82, 0.06, 0.06, mBody));
  const art = plane(0.5, 0.5, glow([VIOLET, ORANGE, 0x4fb4ff][i], 0.8)); art.position.set(0, 0.08, 0.032); gp.add(art);
  const tr = new THREE.Mesh(new THREE.CircleGeometry(0.1, 3), glow(WHITE, 1.2)); tr.position.set(0, 0.08, 0.034); gp.add(tr);
  const bar = plane(0.4, 0.06, glow(VIOLET, 1.2)); bar.position.set(0, -0.28, 0.032); gp.add(bar);
  ROOT.add(gp); return gp;
});

// ---------- s2 chip ----------
const chip = new THREE.Group(); ROOT.add(chip);
chip.add(rbox(0.8, 0.8, 0.1, 0.05, mDark));
const core = plane(0.44, 0.44, glow(VIOLET, 1.3)); core.position.z = 0.055; chip.add(core);
for (let i = 0; i < 5; i++) for (const s of [-1, 1]) {
  const o = -0.28 + i * 0.14;
  const a = rbox(0.06, 0.16, 0.04, 0.01, std(0xffc24a, 0x6a4a00, 0.3, 0.8)); a.position.set(o, s * 0.47, 0); chip.add(a);
  const b = rbox(0.16, 0.06, 0.04, 0.01, std(0xffc24a, 0x6a4a00, 0.3, 0.8)); b.position.set(s * 0.47, o, 0); chip.add(b);
}

// ---------- the red handheld, on its own spot on the desk ----------
const HX = 6;
const HH = new THREE.Group(); ROOT.add(HH);
HH.add(rbox(2.5, 1.05, 0.24, 0.32, mRedBody));
const hs = plane(1.3, 0.76, new THREE.MeshBasicMaterial({ color: 0x1a0610, toneMapped: false })); hs.position.z = 0.125; HH.add(hs);
const hsr = plane(1.38, 0.84, glow(RED, 1.2)); hsr.position.z = 0.122; HH.add(hsr);
const hq = txt("?", RED, 1.0, 1.4); hq.position.z = 0.13; HH.add(hq);
for (const s of [-1, 1]) {
  const stick = new THREE.Mesh(new THREE.CylinderGeometry(0.13, 0.13, 0.1, 24), mDark); stick.rotation.x = Math.PI / 2; stick.position.set(s * 0.95, 0.2, 0.15); HH.add(stick);
}
[[0.32, 0.09], [0.09, 0.32]].forEach(([w, h]) => { const d = rbox(w, h, 0.06, 0.02, mDark); d.position.set(-0.95, -0.2, 0.13); HH.add(d); });
[[0, 0.1], [0.1, 0], [-0.1, 0], [0, -0.1]].forEach(([x, y]) => { const b = new THREE.Mesh(new THREE.SphereGeometry(0.05, 12, 8), glow(RED, 1.6)); b.position.set(0.95 + x, -0.2 + y, 0.13); HH.add(b); });
const hLight = new THREE.PointLight(0xff3040, 10, 6, 1.6); hLight.position.set(0, 0.4, 1.4); HH.add(hLight);
// s2: coins ("pay") and a low battery ("charge") above the handheld
const coins = [0, 1, 2, 3, 4].map(() => { const c = new THREE.Mesh(new THREE.CylinderGeometry(0.26, 0.26, 0.08, 32), std(0xffb020, 0x7a4a00, 0.3, 0.8)); ROOT.add(c); return c; });
const batt = new THREE.Group(); ROOT.add(batt);
const bShell = rbox(0.95, 0.5, 0.08, 0.06, mDark); batt.add(bShell);
const bTip = rbox(0.08, 0.2, 0.08, 0.02, mDark); bTip.position.set(0.52, 0, 0); batt.add(bTip);
const bRim = plane(0.95, 0.5, glow(RED, 1.6)); bRim.position.z = -0.045; bRim.scale.setScalar(1.08); batt.add(bRim);
const bFill = plane(0.2, 0.34, glow(RED, 2.0)); bFill.position.set(-0.3, 0, 0.045); batt.add(bFill);

// ---------- s3 GitHub star (as in filee) ----------
const starShape = new THREE.Shape();
for (let i = 0; i < 10; i++) { const a = Math.PI / 2 + (i * Math.PI) / 5, r = i % 2 ? 0.17 : 0.4; starShape[i ? "lineTo" : "moveTo"](Math.cos(a) * r, Math.sin(a) * r); }
const star = new THREE.Mesh(new THREE.ExtrudeGeometry(starShape, { depth: 0.08, bevelEnabled: true, bevelSize: 0.03, bevelThickness: 0.03, bevelSegments: 2 }), glow(ORANGE, 1.5));
ROOT.add(star);

// ---------- s4 green shield with a check ----------
const shield = new THREE.Group(); ROOT.add(shield);
const shS = new THREE.Shape(); shS.moveTo(0, 0.42); shS.lineTo(0.34, 0.3); shS.lineTo(0.3, -0.1); shS.quadraticCurveTo(0.2, -0.32, 0, -0.44); shS.quadraticCurveTo(-0.2, -0.32, -0.3, -0.1); shS.lineTo(-0.34, 0.3); shS.closePath();
shield.add(new THREE.Mesh(new THREE.ExtrudeGeometry(shS, { depth: 0.08, bevelEnabled: true, bevelSize: 0.02, bevelThickness: 0.02, bevelSegments: 2 }), std(0x1f7a4a, 0x14883f, 0.4, 0.2)));
shield.add(tube([-0.14, 0.0, 0.12], [-0.03, -0.12, 0.12], 0.06, glow(WHITE, 1.4)), tube([-0.03, -0.12, 0.12], [0.16, 0.14, 0.12], 0.06, glow(WHITE, 1.4)));

// ---------- s6 smart glasses + cable + giant screen ----------
const GL = new THREE.Group(); ROOT.add(GL);
const mFrameG = std(0x1a1840, 0x0a0820, 0.4, 0.4);
for (const s of [-1, 1]) {
  const lens = rbox(0.78, 0.44, 0.06, 0.12, std(0x0a2a2a, 0x0a3a2a, 0.15, 0.6)); lens.position.set(s * 0.46, 0, 0); GL.add(lens);
  const rimL = rbox(0.86, 0.52, 0.04, 0.14, mFrameG); rimL.position.set(s * 0.46, 0, -0.03); GL.add(rimL);
  GL.add(tube([s * 0.88, 0.1, -0.03], [s * 0.92, 0.1, -1.0], 0.07, mFrameG));
  const shine = plane(0.6, 0.06, glow(GREEN, 1.2)); shine.position.set(s * 0.46, 0.12, 0.035); GL.add(shine);
}
GL.add(tube([-0.1, 0.12, -0.03], [0.1, 0.12, -0.03], 0.08, mFrameG));
const cable = beam(GREEN, 1.6, 0.04);
const giant = new THREE.Group(); ROOT.add(giant);
const GW = 5.2, GH = 2.6;
const gFace = plane(GW, GH, new THREE.MeshBasicMaterial({ color: 0x0a1a1a, toneMapped: false })); giant.add(gFace);
const gRim = plane(GW + 0.12, GH + 0.12, glow(GREEN, 0.9)); gRim.position.z = -0.01; giant.add(gRim);
giant.add(gameUI(GW, GH));

// ---------- captions ----------
title("NEVER BUY A HANDHELD");
cap("s1", "gaming", ["GAMING HANDHELD?"], RED, { until: ["s1", "exploring"] });
cap("s1", "exploring", ["EXPLORING GITHUB REPOS"], WHITE, { until: "s1" });
cap("s2", "one", ["ONE MORE DEVICE"], RED, { until: ["s2", "pay"] });
cap("s2", "pay", ["PAY FOR IT"], RED, { until: ["s2", "charge"], boom: 0.4 });
cap("s2", "charge", ["CHARGE IT"], RED, { until: ["s2", "recent"] });
cap("s2", "recent", ["YOUR PHONE HAS THE CHIP"], VIOLET, { boom: 0.4 });
cap("s3", "droiddeck", ["DROIDDECK"], GREEN, { until: ["s3", "over"], boom: 0.5 });
cap("s3", "over", ["OVER 20,000 STARS", "IN 7 WEEKS"], ORANGE, { until: ["s3", "it"], boom: 0.5 });
cap("s3", "brings", ["STEAM DECK GAME MODE"], GREEN);
cap("s4", "install", ["INSTALL THE APP"], GREEN, { until: ["s4", "press"] });
cap("s4", "press", ["PRESS PLAY"], GREEN, { until: ["s4", "sign"], boom: 0.4 });
cap("s4", "sign", ["SIGN IN TO STEAM"], GREEN, { until: ["s4", "no"] });
cap("s4", "no", ["NO HACKING YOUR PHONE"], GREEN, { boom: 0.4 });
cap("s5", "gog", ["GOG, EPIC, XBOX"], VIOLET, { until: ["s5", "same"], boom: 0.4 });
cap("s5", "same", ["ONE LIBRARY"], GREEN);
cap("s6", "smart", ["SMART GLASSES"], VIOLET, { until: ["s6", "play"] });
cap("s6", "play", ["GIANT SCREEN"], GREEN, { boom: 0.5 });
endCard(["KEEP THE PHONE.", "SKIP THE HANDHELD."]);
boom("s1", "handheld", 0.6);

// ---------- timings (global seconds) ----------
const T = {
  want: S.s1[0] + 0.05, never: g("s1", "never"), hh: g("s1", "handheld"),
  s2: S.s2[0], pay: g("s2", "pay"), charge: g("s2", "charge"), recent: g("s2", "recent"), chip: g("s2", "chip"),
  s3: S.s3[0], dd: g("s3", "droiddeck"), over: g("s3", "over"), it: g("s3", "it"), brings: g("s3", "brings"),
  install: g("s4", "install"), press: g("s4", "press"), play: g("s4", "play"), sign: g("s4", "sign"), no: g("s4", "no"),
  s5: S.s5[0], gog: g("s5", "gog"), epic: g("s5", "epic"), xbox: g("s5", "xbox"), same: g("s5", "same"),
  s6: S.s6[0], smart: g("s6", "smart"), giant: g("s6", "giant"), playG: g("s6", "play"), s7: S.s7[0], s8: S.s8[0],
};

// ---------- shots: [cx,cy,cz, lx,ly,lz, fov] ----------
const PHONE = [0, 1.45, 5.6, 0, 1.25, 0, 48];
const SH = [
  { at: 0, K: [[0, [0.3, 1.6, 6.9, 0, 1.5, 0, 48]], [2.0, [0.1, 1.6, 6.6, 0, 1.5, 0, 48]]] },
  { at: T.never - 0.1, K: [[0, [HX + 0.4, 1.5, 6.0, HX, 1.3, 0, 48]], [2.2, [HX + 0.1, 1.5, 5.6, HX, 1.3, 0, 48]], [4.5, [HX - 0.3, 1.6, 5.8, HX, 1.35, 0, 48]]] },
  { at: T.s2, K: [[0, [HX - 0.3, 1.6, 6.2, HX, 1.4, 0, 48]], [2.4, [HX + 0.2, 1.7, 6.0, HX, 1.45, 0, 48]]] },
  { at: T.recent - 0.1, K: [[0, [-0.4, 1.6, 6.8, 0, 1.45, 0, 48]], [3.0, [0.1, 1.6, 6.5, 0, 1.45, 0, 48]]] },
  { at: T.s3, K: [[0, [-0.4, 1.6, 6.9, 0, 1.45, 0, 48]], [4.0, [0.2, 1.55, 6.6, 0, 1.4, 0, 48]], [8.3, [0, 1.5, 6.5, 0, 1.35, 0, 48]]] },
  { at: S.s4[0], K: [[0, [0.4, 1.5, 6.6, 0, 1.35, 0, 48]], [3.6, [0.15, 1.5, 6.4, 0, 1.35, 0, 48]]] },
  { at: T.s5, K: [[0, [-0.4, 1.45, 6.5, 0, 1.3, 0, 48]], [3.4, [-0.15, 1.45, 6.6, 0, 1.3, 0, 48]]] },
  { at: T.s6, K: [[0, [0, 1.8, 6.8, 0, 1.7, 0, 48]], [2.4, [0, 2.2, 8.4, 0, 2.2, -1.5, 50]], [4.2, [0.3, 2.4, 9.2, 0, 2.3, -1.8, 50]]] },
  { at: T.s7, calm: 1, K: [[0, [0.3, 1.5, 6.9, 0, 1.7, 0, 48]], [3, [0.1, 1.5, 7.3, 0, 1.75, 0, 48]]] },
];
const show = (o, k, s = 1) => { o.visible = k > 0.01; o.scale.setScalar(Math.max(0.001, k) * s); };

run("droiddeck-world", (t) => {
  ROOT.visible = t < T.s8 - 0.1;
  const right = t >= T.s3;
  mScreen.color.set(right ? 0x0a1a1a : 0x0b0a26);

  // phone screen layers
  show(qMark, sm(T.want + 0.3, T.want + 0.6, t) * (1 - sm(T.recent - 0.1, T.recent + 0.15, t)), 1.6 / 2);
  const uiOn = sm(T.s3 - 0.05, T.s3 + 0.3, t) * (1 - sm(T.install - 0.15, T.install + 0.05, t)) + sm(T.no - 0.1, T.no + 0.2, t);
  ui.visible = uiOn > 0.01 && t < T.s7 + 3; ui.scale.setScalar(Math.max(0.001, Math.min(1, uiOn)));
  ui.userData.small.forEach((p, i) => (p.visible = !(t >= T.gog - 0.1 && i < 3)));
  // s3 "brings": game mode UI pulses in brighter
  ui.position.z = 0.01 + 0.05 * sm(T.brings - 0.1, T.brings + 0.2, t) * (1 - sm(T.brings + 0.4, T.brings + 0.8, t));
  // s4: app icon drops in, then PLAY, then sign-in card
  const ik = sm(T.install - 0.1, T.install + 0.25, t) * (1 - sm(T.press - 0.15, T.press, t));
  show(icon, ik); icon.position.set(0, 0.6 * (1 - ik), 0.04);
  const pk = sm(T.press - 0.1, T.press + 0.15, t) * (1 - sm(T.sign - 0.15, T.sign, t));
  show(playBtn, pk, 1 - 0.12 * sm(T.play - 0.05, T.play + 0.05, t) * (1 - sm(T.play + 0.1, T.play + 0.25, t))); playBtn.position.z = 0.04;
  const sk2 = sm(T.sign - 0.1, T.sign + 0.15, t) * (1 - sm(T.no - 0.15, T.no, t));
  show(sign, sk2); sign.position.z = 0.04; check.visible = t > g("s4", "steam");
  // finger taps PLAY
  const fk = sm(T.press - 0.3, T.play, t) * (1 - sm(T.play + 0.2, T.play + 0.5, t));
  finger.visible = fk > 0.01 && t < T.sign;
  finger.position.set(0.3, 0.98, 0.5 + 1.0 * (1 - fk));
  // s5: store tiles drop into the first three small slots
  [T.gog, T.epic, T.xbox].forEach((T0, i) => {
    const k = sm(T0 - 0.1, T0 + 0.25, t);
    const slot = ui.userData.small[i];
    stores[i].visible = k > 0.01 && t < T.s7 + 3;
    stores[i].position.set(slot.position.x, slot.position.y + 1.0 * (1 - k), 0.04 + 0.6 * (1 - k));
    stores[i].scale.setScalar(Math.max(0.001, k) * (1 + 0.15 * sm(T.same - 0.1, T.same + 0.1, t) * (1 - sm(T.same + 0.3, T.same + 0.6, t))));
  });

  // s1: game cards float above the phone
  cards.forEach((c, i) => {
    const k = sm(T.want + 0.1 * i, T.want + 0.35 + 0.1 * i, t) * (1 - sm(T.never - 0.25, T.never - 0.1, t));
    show(c, k * 0.8); c.position.set((i - 1) * 0.75, 2.25 + 0.06 * Math.sin(t * 2 + i), 0.1); c.rotation.y = (i - 1) * -0.25;
  });

  // handheld: drops in on "handheld" (s1), stays through s2 until the cut to the phone
  const hk = sm(T.never - 0.2, T.never + 0.2, t);
  HH.visible = hk > 0.01 && t < T.recent; HH.position.set(HX, 1.05 + 1.5 * (1 - hk), 0.1); HH.rotation.x = -0.1;
  hsr.material.color.set(RED).multiplyScalar(1.0 + 0.6 * Math.abs(Math.sin(t * 4)));
  coins.forEach((c, i) => {
    const k = sm(T.pay + 0.06 * i, T.pay + 0.25 + 0.06 * i, t);
    c.visible = k > 0.01 && t < T.recent;
    c.position.set(HX - 0.62, 2.0 + 0.09 * i + 0.8 * (1 - k), 0.3);
  });
  const bk = sm(T.charge - 0.1, T.charge + 0.2, t);
  show(batt, bk * (t < T.recent ? 1 : 0)); batt.position.set(HX + 0.62, 2.18, 0.3);
  bFill.material.color.set(RED).multiplyScalar(0.6 + 1.6 * (Math.sin(t * 9) > 0 ? 1 : 0.2));

  // s2 chip rises out of the phone; leaves when the screen turns green
  const ck = sm(T.recent - 0.05, T.recent + 0.4, t) * (1 - sm(T.dd - 0.2, T.dd + 0.05, t));
  show(chip, ck * 0.75); chip.position.set(0, 1.4 + 0.95 * ck, 0.3); chip.rotation.y = 0.3 * Math.sin(t * 1.5);
  core.material.color.set(t > T.chip - 0.05 ? GREEN : VIOLET).multiplyScalar(1.1 + 0.5 * Math.max(0, 1 - Math.abs(t - T.chip) / 0.3));

  // s3: star above the phone while the star count is on screen
  const zk = sm(T.over - 0.1, T.over + 0.25, t) * (1 - sm(T.it - 0.15, T.it + 0.1, t));
  star.visible = zk > 0.01; star.scale.setScalar(0.55 * zk * (1 + 0.08 * Math.sin(t * 6)));
  star.position.set(0, 2.15, 0.2); star.rotation.y = 0.35 * Math.sin((t - T.over) * 2.5);

  // s4: shield on "no hacking"
  const shk = sm(T.no - 0.1, T.no + 0.25, t) * (1 - sm(T.s5 - 0.1, T.s5 + 0.15, t));
  show(shield, shk * 0.6); shield.position.set(0, 2.08, 0.3); shield.rotation.y = 0.3 * Math.sin(t * 2);

  // s6: glasses above the phone, cable, then the giant screen behind
  const gk = sm(T.smart - 0.15, T.smart + 0.25, t);
  show(GL, gk * (t < T.s7 - 0.05 ? 1 : 0)); GL.position.set(0, 2.45, 0.3); GL.rotation.y = 0.25 * Math.sin(t * 1.2);
  cable.set(new THREE.Vector3(1.25, 1.72, -0.08), new THREE.Vector3(0.92, 2.4, -0.4), sm(T.smart + 0.1, T.smart + 0.4, t) * (t < T.s7 - 0.05 ? 0.9 : 0));
  const bigk = sm(T.playG - 0.1, T.giant + 0.2, t);
  show(giant, bigk * (t < T.s7 - 0.05 ? 1 : 0)); giant.position.set(0, 4.2, -3.6);

  const { punch } = shoot(SH, t);
  const spike = overlays(t);
  bloom.strength = 1.0 + 1.2 * punch * punch + spike;
});
