// NEVER BUY A CARPLAY GADGET (DiPlay). Car dashboard with an Android head unit; wrong = a red adapter box + cable,
// right = DiPlay installed on the car screen turns it into CarPlay: cable or wireless, nothing extra, HUD on the windshield.
import { THREE, S, g, sm, scene, bloom, glow, beam, road, VIOLET, ORANGE, RED, GREEN, WHITE, shoot, run } from "./kit.js";
import { title, cap, boom, endCard, overlays, fitText } from "./extra.js";

import { RoundedBoxGeometry } from "three/addons/geometries/RoundedBoxGeometry.js";
const std = (c, e, r = 0.45, m = 0.25) => new THREE.MeshStandardMaterial({ color: c, emissive: e, roughness: r, metalness: m });
const rbox = (w, h, d, r, mat) => new THREE.Mesh(new RoundedBoxGeometry(w, h, d, 4, r), mat);
const mBody = std(0x4a42c8, 0x1c1766, 0.35, 0.35), mDark = std(0x14123a, 0x07061a, 0.6, 0.2), mLav = std(0xc9c0ff, 0x4a3fb0, 0.4, 0.1);
const Y0 = 1.2; // the car interior sits above the road
const WORLD = new THREE.Group(); WORLD.position.y = Y0; scene.add(WORLD); // hidden before the CTA
const add = (o, p = WORLD) => (p.add(o), o);
const L = (x, y, z) => new THREE.Vector3(x, y + Y0, z); // local -> world (for beams)

function tex(w, h, draw, px = 400) {
  const c = document.createElement("canvas"); c.width = Math.round(w * px); c.height = Math.round(h * px);
  draw(c.getContext("2d"), c.width, c.height);
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t;
}
const rr = (x, X, Y, w, h, r, col) => { x.fillStyle = col; x.beginPath(); x.roundRect(X, Y, w, h, r); x.fill(); };

// ---------- road outside, dashboard, windshield ----------
const rd = road({ lanes: 2, z0: -3, z1: -300 });
const mDash = std(0x221d66, 0x0c0a30, 0.7, 0.1);
add(rbox(8, 1.25, 2.6, 0.15, mDash)).position.set(0, -0.6, 0.1);
add(rbox(8, 0.12, 0.2, 0.05, glow(VIOLET, 0.5))).position.set(0, -0.02, 1.38); // glowing lip on the dash edge
add(new THREE.PointLight(0xe8e2ff, 18, 9, 1.6)).position.set(-1.6, 3.0, 2.4);
add(new THREE.PointLight(0xff8a3a, 8, 8, 1.6)).position.set(2.4, 2.0, -1.8);
const WS0 = new THREE.Vector3(0, 0.05, -1.25), WS1 = new THREE.Vector3(0, 3.2, -2.65); // windshield bottom / top (centre)
const wsDir = WS1.clone().sub(WS0), wsLen = wsDir.length(), wsTilt = -Math.atan2(-wsDir.z, wsDir.y);
const glass = add(new THREE.Mesh(new THREE.PlaneGeometry(3.2, wsLen), new THREE.MeshBasicMaterial({ color: 0x6a5fd0, transparent: true, opacity: 0.06, depthWrite: false, side: THREE.DoubleSide })));
glass.position.copy(WS0).lerp(WS1, 0.5); glass.rotation.x = wsTilt;
const mPillar = glow(VIOLET, 0.9);
const wsEdges = [[-1.6, -1.6], [1.6, 1.6]].map(([a]) => { const m = add(new THREE.Mesh(new THREE.BoxGeometry(0.08, wsLen, 0.08), mPillar)); m.position.copy(glass.position); m.position.x = a; m.rotation.x = wsTilt; return m; });
const wsAt = (f) => WS0.clone().lerp(WS1, f); // point on the glass

// ---------- head unit (landscape screen on a short stand), faces +z ----------
const unit = add(new THREE.Group()); unit.position.set(0, 0.95, -0.45); unit.rotation.x = -0.1;
add(rbox(0.3, 0.5, 0.2, 0.05, mDark), unit).position.set(0, -0.62, -0.08);
add(rbox(2.0, 1.2, 0.08, 0.05, mBody), unit);
const SW = 1.86, SHh = 1.06;
const face = add(new THREE.Mesh(new THREE.PlaneGeometry(SW, SHh), new THREE.MeshBasicMaterial({ toneMapped: false, color: 0xd8d8d8 })), unit); face.position.z = 0.042;
const bezel = add(new THREE.LineSegments(new THREE.EdgesGeometry(new THREE.PlaneGeometry(2.0, 1.2)), new THREE.LineBasicMaterial({ color: 0xffffff, toneMapped: false })), unit); bezel.position.z = 0.045;
const texAndroid = tex(SW, SHh, (x, W, H) => {
  x.fillStyle = "#0b0a26"; x.fillRect(0, 0, W, H);
  x.fillStyle = "#a596ff"; x.font = "900 54px Inter, Arial"; x.textAlign = "left"; x.fillText("ANDROID", 40, 80);
  x.fillStyle = "#6a5fd0"; x.font = "800 44px Inter, Arial"; x.textAlign = "right"; x.fillText("12:30", W - 40, 78);
  for (let i = 0; i < 8; i++) { const cx = 70 + (i % 4) * ((W - 140) / 4), cy = 140 + Math.floor(i / 4) * 140; rr(x, cx + 20, cy, 120, 110, 20, "#2b2580"); x.fillStyle = "#a596ff"; x.beginPath(); x.arc(cx + 80, cy + 55, 26, 0, 7); x.fill(); }
});
const texInstall = tex(SW, SHh, (x, W, H) => {
  x.fillStyle = "#0a1a1a"; x.fillRect(0, 0, W, H);
  x.fillStyle = "#3dff8a"; x.font = "900 150px Inter, Arial"; x.textAlign = "center"; x.fillText("DIPLAY", W / 2, H * 0.48);
});
const ICONS = ["#3dff8a", "#4aa3ff", "#ff6a1a", "#a596ff", "#3dff8a", "#ffffff", "#4aa3ff", "#ff6a1a"];
const texCarPlay = tex(SW, SHh, (x, W, H) => {
  const gr = x.createLinearGradient(0, 0, W, H); gr.addColorStop(0, "#14204a"); gr.addColorStop(1, "#2a1a5a"); x.fillStyle = gr; x.fillRect(0, 0, W, H);
  rr(x, 0, 0, 130, H, 0, "rgba(0,0,0,0.45)");
  x.fillStyle = "#fff"; x.font = "800 34px Inter, Arial"; x.textAlign = "center"; x.fillText("12:30", 65, 60);
  ["#3dff8a", "#4aa3ff", "#ff6a1a"].forEach((c, i) => { rr(x, 25, 110 + i * 100, 80, 80, 20, c); });
  ICONS.forEach((c, i) => { const cx = 190 + (i % 4) * 135, cy = 70 + Math.floor(i / 4) * 175; rr(x, cx, cy, 110, 110, 26, c); x.fillStyle = "rgba(10,8,40,0.55)"; x.beginPath(); x.arc(cx + 55, cy + 55, 26, 0, 7); x.fill(); });
});
face.material.map = texAndroid;
const barBg = add(new THREE.Mesh(new THREE.PlaneGeometry(1.2, 0.07), glow(VIOLET, 0.35)), unit); barBg.position.set(0, -0.28, 0.046);
const bar = add(new THREE.Mesh(new THREE.PlaneGeometry(1.2, 0.07), glow(GREEN, 1.4)), unit); bar.geometry.translate(0.6, 0, 0); bar.position.set(-0.6, -0.28, 0.048);
const badge = add(new THREE.Group(), unit); badge.position.set(0.62, 0.36, 0.06);
add(new THREE.Mesh(new THREE.PlaneGeometry(0.62, 0.2), glow(ORANGE, 0.9)), badge);
{ const t = fitText(["PREVIEW"], 0x14123a, 1.0, 0.56); t.material.color.set(0x14123a); t.visible = true; t.position.z = 0.002; t.renderOrder = 21; badge.add(t); }

// ---------- iPhone ----------
const phone = add(new THREE.Group());
add(rbox(0.44, 0.88, 0.05, 0.07, std(0x1a1840, 0x08061e, 0.3, 0.6)), phone);
const pFace = add(new THREE.Mesh(new THREE.PlaneGeometry(0.39, 0.82), new THREE.MeshBasicMaterial({ toneMapped: false, color: 0xd0d0d0, map: tex(0.39, 0.82, (x, W, H) => {
  const gr = x.createLinearGradient(0, 0, 0, H); gr.addColorStop(0, "#2a1a6a"); gr.addColorStop(1, "#0b0a26"); x.fillStyle = gr; x.fillRect(0, 0, W, H);
  rr(x, W / 2 - 40, 14, 80, 22, 11, "#000");
  for (let i = 0; i < 12; i++) rr(x, 14 + (i % 3) * 46, 60 + Math.floor(i / 3) * 52, 34, 34, 9, ICONS[i % 8]);
  for (let i = 0; i < 3; i++) rr(x, 14 + i * 46, H - 50, 34, 34, 9, ICONS[i]);
}) })), phone); pFace.position.z = 0.027;
const phoneX = [add(new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.06, 0.04), glow(RED, 2.2))), add(new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.06, 0.04), glow(RED, 2.2)))];
phoneX[0].rotation.z = 0.785; phoneX[1].rotation.z = -0.785;

// ---------- the adapter box (red) + price tag + red cable ----------
const dongle = add(new THREE.Group());
add(rbox(0.6, 0.32, 0.42, 0.06, std(0x7a1a32, 0x3a0614, 0.4, 0.3)), dongle);
add(new THREE.Mesh(new THREE.PlaneGeometry(0.5, 0.04), glow(RED, 2.0)), dongle).position.set(0, 0.1, 0.212);
{ const t = fitText(["ADAPTER"], WHITE, 1.0, 0.52); t.visible = true; t.position.set(0, -0.03, 0.214); dongle.add(t); }
const tag = add(new THREE.Group());
add(rbox(0.26, 0.32, 0.03, 0.04, mLav), tag);
{ const t = fitText(["$"], RED, 1.6, 0.5); t.visible = true; t.position.set(0, -0.02, 0.02); tag.add(t); }
const tagString = add(new THREE.Mesh(new THREE.BoxGeometry(0.015, 0.3, 0.015), glow(WHITE, 0.8)));
const redCable = beam(RED, 1.8, 0.035);

// ---------- s3: download arrow ----------
const arrow = add(new THREE.Group());
add(new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.34, 0.06), glow(GREEN, 1.4)), arrow).position.y = 0.17;
{ const c = add(new THREE.Mesh(new THREE.ConeGeometry(0.2, 0.26, 4), glow(GREEN, 1.4)), arrow); c.rotation.x = Math.PI; c.rotation.y = Math.PI / 4; c.position.y = -0.1; }

// ---------- s4: green cable, wireless arcs ----------
const greenCable = beam(GREEN, 1.6, 0.035);
const arcs = [0.12, 0.22, 0.32].map((r) => { const m = add(new THREE.Mesh(new THREE.TorusGeometry(r, 0.022, 6, 24, Math.PI / 2), glow(GREEN, 1.6))); m.rotation.z = Math.PI / 4; return m; });

// ---------- s5: three crossed-out cards ----------
function card(txt) {
  const gp = add(new THREE.Group());
  add(rbox(0.58, 0.4, 0.05, 0.04, mDark), gp);
  const t = fitText([txt], RED, 1.6, 0.5); t.visible = true; t.position.z = 0.025; gp.add(t);
  const s = add(new THREE.Mesh(new THREE.BoxGeometry(0.62, 0.04, 0.02), glow(GREEN, 1.1)), gp); s.geometry.translate(0.31, 0, 0); s.position.set(-0.31, -0.13, 0.04); s.rotation.z = 0.45;
  gp.userData.strike = s; gp.visible = false; return gp;
}
const cards = [card("HACKING"), card("MAC"), card("ACCOUNT")];

// ---------- s6: HUD on the windshield ----------
const hud = add(new THREE.Group()); hud.position.copy(wsAt(0.76)); hud.rotation.x = wsTilt - Math.PI / 2 + Math.PI / 2; // lies on the glass
hud.rotation.x = wsTilt;
const arShape = new THREE.Shape();
[[-0.08, -0.45], [0.08, -0.45], [0.08, 0.02], [0.22, 0.02], [0.22, -0.12], [0.45, 0.1], [0.22, 0.32], [0.22, 0.18], [-0.08, 0.18]].forEach(([x, y], i) => arShape[i ? "lineTo" : "moveTo"](x, y));
const hudArrow = add(new THREE.Mesh(new THREE.ShapeGeometry(arShape), glow(GREEN, 1.3)), hud); hudArrow.position.set(-0.1, 0.1, 0.01);
const hudText = fitText(["MAIN ST"], GREEN, 1.3, 1.1); hudText.visible = true; hudText.position.set(0, -0.62, 0.01); hud.add(hudText);
const hudLine = add(new THREE.Mesh(new THREE.PlaneGeometry(1.1, 0.02), glow(GREEN, 1.2)), hud); hudLine.position.set(0, -0.42, 0.01);

// ---------- s3: GitHub star (as in filee) ----------
const starShape = new THREE.Shape();
for (let i = 0; i < 10; i++) { const a = Math.PI / 2 + (i * Math.PI) / 5, r = i % 2 ? 0.17 : 0.4; starShape[i ? "lineTo" : "moveTo"](Math.cos(a) * r, Math.sin(a) * r); }
const star = add(new THREE.Mesh(new THREE.ExtrudeGeometry(starShape, { depth: 0.08, bevelEnabled: true, bevelSize: 0.03, bevelThickness: 0.03, bevelSegments: 2 }), glow(ORANGE, 1.5)));

// ---------- captions ----------
title("NEVER BUY A CARPLAY GADGET");
cap("s1", "exploring", ["EXPLORING GITHUB REPOS"], WHITE, { until: "s1" });
cap("s2", "adapter", ["ONE MORE BOX"], RED, { until: ["s2", "pay"], boom: 0.4 });
cap("s2", "pay", ["TO PAY FOR"], RED, { until: ["s2", "plug"] });
cap("s2", "plug", ["AND PLUG IN"], RED, { until: ["s2", "your"] });
cap("s2", "your", ["YOUR CAR HAS", "THE SCREEN"], VIOLET);
cap("s3", "instead", ["INSTEAD"], GREEN, { until: ["s3", "diplay"] });
cap("s3", "diplay", ["DIPLAY"], GREEN, { until: ["s3", "over"], boom: 0.5 });
cap("s3", "over", ["OVER 13,000 STARS", "IN 7 WEEKS"], ORANGE, { until: ["s3", "you"], boom: 0.5 });
cap("s3", "install", ["INSTALL ON THE CAR"], GREEN, { until: ["s3", "becomes"] });
cap("s3", "becomes", ["SCREEN BECOMES", "APPLE CARPLAY"], GREEN, { boom: 0.5 });
cap("s4", "plug", ["WITH A CABLE"], VIOLET, { until: ["s4", "or"] });
cap("s4", "or", ["OR FULLY WIRELESS"], GREEN, { boom: 0.4 });
cap("s5", "no", ["NO HACKING"], GREEN, { until: ["s5", "mac"] });
cap("s5", "mac", ["NO MAC"], GREEN, { until: ["s5", "account"] });
cap("s5", "account", ["NO ACCOUNT"], GREEN, { until: ["s5", "it's"] });
cap("s5", "it's", ["EARLY VERSION", "NOT OFFICIAL FROM APPLE"], WHITE);
cap("s6", "on", ["ON SOME BYDS"], WHITE, { until: ["s6", "turn"] });
cap("s6", "turn", ["TURN ARROWS"], GREEN, { until: ["s6", "street"] });
cap("s6", "street", ["STREET NAMES"], GREEN, { until: ["s6", "windshield"] });
cap("s6", "windshield", ["ON THE WINDSHIELD"], GREEN, { boom: 0.4 });
endCard(["KEEP THE SCREEN.", "SKIP THE GADGET."]);

// ---------- timings (global seconds) ----------
const T = {
  iphone: g("s1", "iphone"), gadget: g("s1", "gadget"),
  s2: S.s2[0], pay: g("s2", "pay"), plug2: g("s2", "plug"), your2: g("s2", "your"),
  s3: S.s3[0], get: g("s3", "get"), dip: g("s3", "diplay"), over: g("s3", "over"), you: g("s3", "you"), install: g("s3", "install"), becomes: g("s3", "becomes"),
  s4: S.s4[0], or: g("s4", "or"), wireless: g("s4", "wireless"),
  s5: S.s5[0], mac: g("s5", "mac"), account: g("s5", "account"), its: g("s5", "it's"),
  s6: S.s6[0], turn: g("s6", "turn"), street: g("s6", "street"), wind: g("s6", "windshield"),
  s7: S.s7[0], s8: S.s8[0],
};

// ---------- shots (local coords, raised by Y0): [cx,cy,cz, lx,ly,lz, fov] ----------
const up = (K) => K.map(([d, a]) => [d, [a[0], a[1] + Y0, a[2], a[3], a[4] + Y0, a[5], a[6]]]);
const SH = [
  { at: 0, K: up([[0, [0.3, 1.7, 5.6, 0, 0.85, -0.4, 48]], [S.s2[0], [0.1, 1.6, 5.1, 0, 0.85, -0.4, 48]]]) },
  { at: T.s2, K: up([[0, [-0.25, 1.5, 4.9, -0.05, 0.6, 0.1, 44]], [T.your2 - T.s2, [-0.2, 1.45, 4.6, -0.05, 0.6, 0.1, 44]]]) },
  { at: T.your2, K: up([[0, [0, 1.7, 5.3, 0, 0.9, -0.4, 48]], [2, [0.1, 1.6, 5.0, 0, 0.9, -0.4, 48]]]) },
  { at: T.s3, K: up([[0, [-0.6, 2.0, 5.8, 0, 1.0, -0.6, 48]], [3.6, [0.2, 1.8, 5.2, 0, 1.0, -0.6, 46]], [8.8, [0.1, 1.75, 5.0, 0, 0.95, -0.6, 46]]]) },
  { at: T.s4, K: up([[0, [0.6, 1.4, 4.7, 0.3, 0.8, 0, 46]], [2.9, [0.4, 1.45, 4.4, 0.3, 0.85, 0, 46]]]) },
  { at: T.s5, K: up([[0, [0, 1.5, 5.0, 0, 0.8, -0.2, 46]], [4.3, [0, 1.45, 4.6, 0, 0.8, -0.2, 46]]]) },
  { at: T.s6, K: up([[0, [0, 1.7, 5.2, 0, 1.2, -1.0, 48]], [0.8, [0, 1.95, 4.6, 0, 2.0, -1.7, 48]], [3.9, [0, 2.0, 4.3, 0, 2.05, -1.7, 48]]]) },
  { at: T.s7, calm: 1, K: up([[0, [0, 2.0, 5.6, 0, 1.4, -1.2, 50]], [3.2, [0.3, 2.3, 6.4, 0, 1.4, -1.2, 50]]]) },
];

const pop = (o, a, s = 1) => { o.visible = a > 0.01; o.scale.setScalar(s * Math.max(0.001, a)); };
const onOff = (t, a, b) => sm(a - 0.05, a + 0.2, t) * (1 - sm(b - 0.15, b, t));

run("diplay-world", (t) => {
  const wrong = t < T.s3;
  WORLD.visible = rd.visible = t < T.s8 - 0.1;
  [redCable, greenCable].forEach((b) => b.visible = b.visible && WORLD.visible);

  // head unit screen: Android -> DiPlay installing -> CarPlay
  face.material.map = t < T.get ? texAndroid : t < T.becomes ? texInstall : texCarPlay;
  const cp = sm(T.becomes - 0.05, T.becomes + 0.25, t);
  face.scale.setScalar(t >= T.becomes ? 0.92 + 0.08 * cp : 1);
  const scrPulse = Math.max(0, 1 - Math.abs(t - (T.your2 + 0.5)) / 0.6);
  bezel.material.color.set(wrong ? (scrPulse > 0.05 ? WHITE : VIOLET) : GREEN).multiplyScalar(wrong ? 1.0 + 1.6 * scrPulse : 1.4);
  const inst = t >= T.install - 0.1 && t < T.becomes;
  bar.visible = barBg.visible = inst; bar.scale.x = Math.max(0.001, sm(T.install, T.becomes - 0.1, t));
  pop(badge, onOff(t, T.its, T.s6 + 0.2) * (1 + 0.05 * Math.sin(t * 7)));

  // s1: iPhone pops beside the screen with a red X (no CarPlay); back in s4 with a cable, then wireless
  const p1 = onOff(t, T.iphone, T.s2);
  const p4 = sm(T.s4 - 0.05, T.s4 + 0.4, t) * (1 - sm(T.s5 + 0.2, T.s5 + 0.5, t));
  if (t < T.s3) { pop(phone, p1); phone.position.set(0.72, 0.6, 0.55); phone.rotation.set(0, -0.25, 0.08); }
  else { phone.visible = p4 > 0.01; phone.scale.setScalar(1); phone.position.set(0.72 + 1.2 * (1 - p4), 0.6, 0.55); phone.rotation.set(0, -0.2, 0); }
  phoneX.forEach((m) => { pop(m, onOff(t, T.iphone + 0.25, T.s2)); m.position.set(0.72, 0.6, 0.62); });

  // adapter: drops onto the dash on "gadget", tag on "pay", cable on "plug in", dims on "your car ... screen", gone on "Instead"
  const dg = sm(T.gadget - 0.1, T.gadget + 0.3, t) * (1 - sm(T.s3, T.s3 + 0.35, t));
  pop(dongle, dg); dongle.position.set(-0.7, 0.18 + 0.5 * (1 - sm(T.gadget - 0.1, T.gadget + 0.3, t)), 0.6); dongle.rotation.y = 0.25;
  const tg = sm(T.pay - 0.05, T.pay + 0.25, t) * (1 - sm(T.s3, T.s3 + 0.3, t));
  pop(tag, tg); tag.position.set(-0.24, 0.42, 0.72); tag.rotation.z = 0.15 * Math.sin((t - T.pay) * 5) * (1 - sm(T.pay, T.pay + 1.5, t));
  pop(tagString, tg); tagString.position.set(-0.32, 0.32, 0.7); tagString.rotation.z = 0.9;
  const ck = sm(T.plug2 - 0.05, T.plug2 + 0.45, t) * (1 - sm(T.s3, T.s3 + 0.3, t));
  const A = L(-0.55, 0.22, 0.4), B = L(-0.55, 0.42, -0.42);
  redCable.set(A, A.clone().lerp(B, Math.max(0.01, ck)), ck);

  // s3: download arrow drops into the screen on "get DiPlay"
  const ak = sm(T.get - 0.05, T.dip + 0.3, t);
  arrow.visible = t >= T.get - 0.05 && t < T.over - 0.15;
  arrow.position.set(0, 2.4 - 0.62 * ak, -0.1); arrow.scale.setScalar(Math.max(0.001, 1 - 0.6 * sm(T.dip + 0.1, T.over - 0.15, t)));
  const sk = sm(T.over - 0.1, T.over + 0.25, t) * (1 - sm(T.you - 0.15, T.you + 0.1, t));
  star.visible = sk > 0.01; star.scale.setScalar(0.55 * sk * (1 + 0.08 * Math.sin(t * 6)));
  star.position.set(0, 1.92, -0.3); star.rotation.y = 0.35 * Math.sin((t - T.over) * 2.5);

  // s4: green cable phone -> dash, then arcs for wireless
  const gc = sm(T.s4 + 0.15, T.s4 + 0.55, t) * (1 - sm(T.or, T.or + 0.25, t));
  const PA = L(0.66, 0.17, 0.58), PB = L(0.45, 0.42, -0.42);
  greenCable.set(PA, PA.clone().lerp(PB, Math.max(0.01, gc)), gc * (t < T.s5 ? 1 : 0));
  arcs.forEach((m, i) => {
    const a = sm(T.or + 0.1 * i, T.or + 0.25 + 0.1 * i, t) * (1 - sm(T.s5, T.s5 + 0.25, t));
    const blink = 0.6 + 0.4 * Math.max(0, Math.sin((t - T.wireless) * 8 - i * 1.2));
    pop(m, a); m.material.color.set(GREEN).multiplyScalar(1.6 * blink);
    m.position.set(0.72 + phone.position.x - 0.72, 1.1, 0.55);
  });

  // s5: three cards pop in and get struck through, gone on "It's an early version"
  const cardT = [T.s5, T.mac, T.account];
  cards.forEach((c, i) => {
    const a = onOff(t, cardT[i], T.its + 0.1);
    pop(c, a, 1.2); c.position.set((i - 1) * 0.72, 0.95, 0.05);
    c.userData.strike.scale.x = Math.max(0.001, sm(cardT[i] + 0.15, cardT[i] + 0.4, t));
  });

  // s6: windshield HUD: arrow on "turn", street name on "street", glass glows on "windshield"
  hud.visible = t >= T.turn - 0.1;
  hudArrow.scale.setScalar(Math.max(0.001, sm(T.turn - 0.1, T.turn + 0.25, t)));
  hudText.visible = t >= T.street - 0.1; hudText.material.opacity = sm(T.street - 0.1, T.street + 0.2, t);
  hudLine.scale.x = Math.max(0.001, sm(T.street - 0.1, T.street + 0.3, t));
  const wk = sm(T.wind - 0.1, T.wind + 0.2, t) * (1 - sm(T.s7 - 0.45, T.s7 - 0.1, t));
  mPillar.color.set(wk > 0.01 ? GREEN : VIOLET).multiplyScalar((0.9 + 0.6 * wk) * (1 - 0.75 * sm(T.s7 - 0.45, T.s7 - 0.1, t)));
  glass.material.opacity = 0.06 + 0.08 * wk;

  const { punch } = shoot(SH, t);
  const spike = overlays(t);
  bloom.strength = Math.min(1.45, 1.0 + 1.2 * punch * punch + spike);
});
