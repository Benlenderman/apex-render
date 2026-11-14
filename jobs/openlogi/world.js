// NEVER INSTALL A HEAVY MOUSE APP (OpenLogi). Laptop + mouse on a dark desk; wrong = a heavy red app lands on the screen,
// spins in the background, asks to sign in, no Linux; right = buttons mapped to cards, a ring of 8 actions, per-app buttons.
import { THREE, S, g, sm, scene, bloom, glow, tube, VIOLET, ORANGE, RED, GREEN, WHITE, shoot, run } from "./kit.js";
import { title, cap, boom, endCard, overlays, fitText } from "./extra.js";

import { RoundedBoxGeometry } from "three/addons/geometries/RoundedBoxGeometry.js";
const root = new THREE.Group(); scene.add(root);
const std = (c, e, r = 0.45, m = 0.25) => new THREE.MeshStandardMaterial({ color: c, emissive: e, roughness: r, metalness: m });
const rbox = (w, h, d, r, mat) => new THREE.Mesh(new RoundedBoxGeometry(w, h, d, 4, r), mat);
const mBody = std(0x4a42c8, 0x1c1766, 0.35, 0.35), mDark = std(0x14123a, 0x07061a, 0.6, 0.2), mLav = std(0xc9c0ff, 0x4a3fb0, 0.4, 0.1);
const mRed = std(0xc0283c, 0x5a0a18, 0.4, 0.2);

// ---------- desk + room lights ----------
const desk = rbox(9, 0.3, 5, 0.12, std(0x221d66, 0x0c0a30, 0.7, 0.1)); desk.position.set(0, -0.14, -0.6); root.add(desk);
const pl = new THREE.PointLight(0xe8e2ff, 18, 9, 1.6); pl.position.set(-1.6, 3.2, 2.2); root.add(pl);
const rim = new THREE.PointLight(0xff8a3a, 10, 8, 1.6); rim.position.set(2.6, 2.2, -2.4); root.add(rim);

// ---------- laptop at the origin, screen faces +z ----------
const base = rbox(2.6, 0.1, 1.7, 0.04, mBody); base.position.set(0, 0.05, 0); root.add(base);
const keys = rbox(2.2, 0.02, 0.8, 0.01, mDark); keys.position.set(0, 0.105, -0.2); root.add(keys);
const pad = rbox(0.8, 0.02, 0.45, 0.01, mDark); pad.position.set(0, 0.105, 0.5); root.add(pad);
const lid = new THREE.Group(); lid.position.set(0, 0.1, -0.85); lid.rotation.x = -0.12; root.add(lid);
const screen = rbox(2.6, 1.7, 0.06, 0.04, mBody); screen.position.set(0, 0.85, 0); lid.add(screen);
const mScreen = new THREE.MeshBasicMaterial({ color: 0x0b0a26, toneMapped: false });
const face = new THREE.Mesh(new THREE.PlaneGeometry(2.4, 1.5), mScreen); face.position.set(0, 0.85, 0.035); lid.add(face);
const bar = new THREE.Mesh(new THREE.PlaneGeometry(2.4, 0.12), glow(VIOLET, 0.35)); bar.position.set(0, 1.54, 0.037); lid.add(bar);
const accent = new THREE.Mesh(new THREE.PlaneGeometry(2.4, 0.015), glow(VIOLET, 1.6)); accent.position.set(0, 1.475, 0.038); lid.add(accent);
[-1.08, -0.98, -0.88].forEach((x, i) => { const d = new THREE.Mesh(new THREE.CircleGeometry(0.025, 16), glow([RED, ORANGE, GREEN][i], 1.2)); d.position.set(x, 1.54, 0.039); lid.add(d); });
const SCR = (x, y, dz = 0) => new THREE.Vector3(x, 0.1 + y, -0.85 + 0.12 * y + 0.25 + dz); // point just in front of the screen
const onScreen = (m) => { m.rotation.x = -0.12; root.add(m); m.visible = false; return m; };

// ---------- the mouse, front right of the laptop, nose toward the screen ----------
const MP = new THREE.Vector3(0.78, 0, 1.12);
const mouse = new THREE.Group(); mouse.position.copy(MP); mouse.rotation.y = -0.15; root.add(mouse);
const shell = new THREE.Mesh(new THREE.SphereGeometry(1, 40, 24, 0, Math.PI * 2, 0, Math.PI / 2), mBody); shell.scale.set(0.3, 0.2, 0.46); mouse.add(shell);
const split = new THREE.Mesh(new THREE.BoxGeometry(0.012, 0.03, 0.3), mDark); split.position.set(0, 0.155, -0.25); split.rotation.x = 0.55; mouse.add(split);
const wheel = new THREE.Mesh(new THREE.CylinderGeometry(0.055, 0.055, 0.05, 24), mDark); wheel.rotation.z = Math.PI / 2; wheel.position.set(0, 0.15, -0.2); mouse.add(wheel);
const wheelRing = new THREE.Mesh(new THREE.TorusGeometry(0.056, 0.008, 6, 24), glow(VIOLET, 1.6)); wheelRing.rotation.y = Math.PI / 2; wheelRing.position.copy(wheel.position); mouse.add(wheelRing);
// glowing pads: left click, right click, thumb button
const btnL = new THREE.Mesh(new THREE.SphereGeometry(1, 20, 12, 0, Math.PI * 2, 0, Math.PI / 2), glow(VIOLET, 0.5)); btnL.scale.set(0.09, 0.012, 0.12); btnL.position.set(-0.11, 0.142, -0.25); btnL.rotation.x = 0.5; mouse.add(btnL);
const btnR = btnL.clone(); btnR.material = glow(VIOLET, 0.5); btnR.position.x = 0.11; mouse.add(btnR);
const thumb = rbox(0.05, 0.06, 0.16, 0.02, std(0x2a2290, 0x2a1d90, 0.35, 0.3)); thumb.position.set(-0.29, 0.07, -0.02); mouse.add(thumb);
const thumbGlow = new THREE.Mesh(new THREE.BoxGeometry(0.01, 0.04, 0.13), glow(VIOLET, 0.6)); thumbGlow.position.set(-0.318, 0.07, -0.02); mouse.add(thumbGlow);
const BTN = [btnL, btnR, thumbGlow];
const lightBtn = (m, hex, k) => m.material.color.set(hex).multiplyScalar(k);

// ---------- s1-s2: the heavy red app ----------
const app = new THREE.Group(); root.add(app);
app.add(rbox(1.5, 1.05, 0.22, 0.08, mRed));
const appBar = new THREE.Mesh(new THREE.PlaneGeometry(1.4, 0.1), glow(RED, 1.6)); appBar.position.set(0, 0.42, 0.115); app.add(appBar);
const appT = fitText(["APP"], WHITE, 1.0, 1.0); appT.visible = true; appT.position.set(0, 0.05, 0.12); appT.renderOrder = 6; app.add(appT);
app.rotation.x = -0.12;
const APP_HOME = SCR(0, 0.85, 0.2);
// spinning gear on the app (runs in the background)
const gear = new THREE.Group(); app.add(gear); gear.position.set(0.48, -0.28, 0.14);
gear.add(new THREE.Mesh(new THREE.TorusGeometry(0.12, 0.04, 8, 24), glow(RED, 2.0)));
for (let i = 0; i < 8; i++) { const tth = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.08, 0.04), glow(RED, 2.0)); const a = (i * Math.PI) / 4; tth.position.set(Math.cos(a) * 0.17, Math.sin(a) * 0.17, 0); tth.rotation.z = a; gear.add(tth); }
// sign-in panel
const signin = new THREE.Group(); root.add(signin); signin.rotation.x = -0.12;
signin.add(rbox(1.2, 0.95, 0.06, 0.06, mLav));
const siT = fitText(["SIGN IN"], RED, 1.6, 0.9); siT.visible = true; siT.position.set(0, 0.28, 0.04); siT.renderOrder = 7; signin.add(siT);
[0.0, -0.22].forEach((y) => { const f = rbox(0.9, 0.13, 0.02, 0.03, mDark); f.position.set(0, y, 0.04); signin.add(f); });
for (let i = 0; i < 6; i++) { const d = new THREE.Mesh(new THREE.CircleGeometry(0.022, 12), glow(WHITE, 1.0)); d.position.set(-0.3 + i * 0.1, -0.22, 0.056); signin.add(d); }
const siBtn = rbox(0.5, 0.12, 0.03, 0.04, std(0xc0283c, 0x8a1020, 0.4, 0.2)); siBtn.position.set(0, -0.39, 0.04); signin.add(siBtn);
// penguin (Linux) with a red cross
function makePenguin() {
  const p = new THREE.Group();
  const body = new THREE.Mesh(new THREE.SphereGeometry(1, 28, 20), std(0x3a3a5a, 0x15152a, 0.5, 0.1)); body.scale.set(0.3, 0.4, 0.26); body.position.y = 0.4; p.add(body);
  const belly = new THREE.Mesh(new THREE.SphereGeometry(1, 24, 16), std(0xf2f0ff, 0x6a66a0, 0.5, 0.0)); belly.scale.set(0.22, 0.31, 0.12); belly.position.set(0, 0.36, 0.17); p.add(belly);
  const head = new THREE.Mesh(new THREE.SphereGeometry(0.2, 24, 16), std(0x3a3a5a, 0x15152a, 0.5, 0.1)); head.position.set(0, 0.88, 0); p.add(head);
  [-1, 1].forEach((s) => {
    const e = new THREE.Mesh(new THREE.SphereGeometry(0.05, 12, 8), std(0xffffff, 0x888888, 0.3, 0)); e.position.set(s * 0.075, 0.93, 0.16); p.add(e);
    const pu = new THREE.Mesh(new THREE.SphereGeometry(0.024, 10, 8), mDark); pu.position.set(s * 0.075, 0.93, 0.205); p.add(pu);
    const ft = new THREE.Mesh(new THREE.SphereGeometry(1, 16, 10), glow(ORANGE, 1.2)); ft.scale.set(0.1, 0.04, 0.14); ft.position.set(s * 0.12, 0.03, 0.08); p.add(ft);
  });
  const beak = new THREE.Mesh(new THREE.ConeGeometry(0.06, 0.14, 12), glow(ORANGE, 1.3)); beak.rotation.x = Math.PI / 2; beak.position.set(0, 0.84, 0.22); p.add(beak);
  root.add(p); p.visible = false; return p;
}
const peng = makePenguin(); peng.position.set(0, 0.11, 0.35);
const pcross = [tube([-0.55, 0.0, 0.5], [0.55, 1.2, 0.5], 0.06, glow(RED, 2.4)), tube([0.55, 0.0, 0.5], [-0.55, 1.2, 0.5], 0.06, glow(RED, 2.4))];
pcross.forEach((c) => peng.add(c));

// ---------- s4: button -> action cards on screen ----------
function card(txt, hex) {
  const gp = new THREE.Group(); gp.add(rbox(1.5, 0.34, 0.06, 0.08, mBody));
  const s = new THREE.Mesh(new THREE.PlaneGeometry(0.06, 0.24), glow(hex, 1.6)); s.position.set(-0.66, 0, 0.035); gp.add(s);
  const t = fitText([txt], WHITE, 1.0, 1.1); t.visible = true; t.position.z = 0.04; t.renderOrder = 6; gp.add(t);
  return onScreen(gp);
}
const acts = [card("CTRL + C", VIOLET), card("\"SEE YOU AT 5\"", GREEN), card("1 > 2 > 3", ORANGE)];
const ACT_Y = [1.25, 0.85, 0.45];
const lg = new THREE.CylinderGeometry(0.012, 0.012, 1, 6); lg.translate(0, 0.5, 0);
const link = new THREE.Mesh(lg, glow(GREEN, 1.8)); link.visible = false; root.add(link);

// ---------- s5: ring of 8 actions around the cursor ----------
const ACTS8 = ["COPY", "PASTE", "UNDO", "MUTE", "PLAY", "LOCK", "SNAP", "MAIL"];
const ring = new THREE.Group(); root.add(ring); ring.rotation.x = -0.12;
const torus = new THREE.Mesh(new THREE.TorusGeometry(0.52, 0.016, 8, 64), glow(VIOLET, 1.6)); ring.add(torus);
const slots = ACTS8.map((f, i) => {
  const a = Math.PI / 2 - (i * Math.PI * 2) / 8, s = new THREE.Group();
  s.position.set(Math.cos(a) * 0.52, Math.sin(a) * 0.52, 0.02);
  const d = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.16, 0.05, 32), i ? mBody : std(0x1f7a4a, 0x0f5a33, 0.4, 0.2)); d.rotation.x = Math.PI / 2; s.add(d);
  const r = new THREE.Mesh(new THREE.TorusGeometry(0.16, 0.01, 6, 32), glow(i ? VIOLET : GREEN, i ? 1.2 : 2.0)); r.position.z = 0.026; s.add(r);
  const t = fitText([f], WHITE, 1.0, 0.25); t.visible = true; t.position.z = 0.03; t.renderOrder = 6; s.add(t);
  ring.add(s); return s;
});
const RING_C = SCR(0.15, 0.78, 0.06);
const cursor = new THREE.Mesh(new THREE.ConeGeometry(0.06, 0.17, 3), glow(WHITE, 1.4)); cursor.rotation.z = 0.5; root.add(cursor);

// ---------- s6: app window on screen switches, the thumb button's action switches with it ----------
const winB = onScreen(card("BROWSER", VIOLET)), winE = onScreen(card("EDITOR", GREEN));
const tagB = fitText(["BACK"], VIOLET, 1.3, 0.7), tagE = fitText(["RUN CODE"], GREEN, 1.3, 0.9);
[tagB, tagE].forEach((m) => { m.renderOrder = 8; m.position.copy(MP).add(new THREE.Vector3(-0.15, 0.55, 0)); });
const tools = ["MAC", "WINDOWS", "LINUX"].map((n, i) => {
  const gp = new THREE.Group(); gp.add(rbox(0.98, 0.34, 0.08, 0.08, mBody));
  const s = new THREE.Mesh(new THREE.PlaneGeometry(0.8, 0.03), glow(GREEN, 1.6)); s.position.set(0, -0.13, 0.045); gp.add(s);
  const t = fitText([n], WHITE, 1.0, 0.8); t.visible = true; t.position.z = 0.05; t.renderOrder = 6; gp.add(t);
  gp.position.set((i - 1) * 1.18, 2.2, -0.75); gp.visible = false; root.add(gp); return gp;
});

// ---------- s3: GitHub star ----------
const starShape = new THREE.Shape();
for (let i = 0; i < 10; i++) { const a = Math.PI / 2 + (i * Math.PI) / 5, r = i % 2 ? 0.17 : 0.4; starShape[i ? "lineTo" : "moveTo"](Math.cos(a) * r, Math.sin(a) * r); }
const star = new THREE.Mesh(new THREE.ExtrudeGeometry(starShape, { depth: 0.08, bevelEnabled: true, bevelSize: 0.03, bevelThickness: 0.03, bevelSegments: 2 }), glow(ORANGE, 1.5));
root.add(star);
// s3: "light": a small green feather-light app chip on screen
const lite = onScreen(card("OPENLOGI", GREEN));

// ---------- captions ----------
title("NEVER INSTALL A HEAVY MOUSE APP");
cap("s1", "heavy", ["A HEAVY APP?"], RED, { until: ["s1", "exploring"], boom: 0.5 });
cap("s1", "exploring", ["EXPLORING GITHUB REPOS"], WHITE, { until: "s1" });
cap("s2", "runs", ["RUNS IN THE BACKGROUND"], RED, { until: ["s2", "asks"] });
cap("s2", "asks", ["SIGN IN?"], RED, { until: ["s2", "doesn't"] });
cap("s2", "doesn't", ["NO LINUX"], RED, { boom: 0.5 });
cap("s3", "openlogi", ["OPENLOGI"], GREEN, { until: ["s3", "over"], boom: 0.5 });
cap("s3", "over", ["OVER 25,000 STARS", "IN UNDER 6 MONTHS"], ORANGE, { until: ["s3", "it's"], boom: 0.5 });
cap("s3", "it's", ["FREE AND LIGHT"], GREEN, { until: ["s3", "needs"] });
cap("s3", "needs", ["NO ACCOUNT"], GREEN);
cap("s4", "set", ["ANY MOUSE BUTTON"], VIOLET, { until: ["s4", "shortcut"] });
cap("s4", "shortcut", ["A SHORTCUT"], VIOLET, { until: ["s4", "piece"] });
cap("s4", "piece", ["A PIECE OF TEXT"], GREEN, { until: ["s4", "whole"] });
cap("s4", "whole", ["A LIST OF STEPS"], ORANGE);
cap("s5", "press", ["PRESS ONE BUTTON"], VIOLET, { until: ["s5", "ring"] });
cap("s5", "ring", ["A RING OF 8 ACTIONS"], GREEN, { boom: 0.4 });
cap("s6", "switch", ["SWITCH APPS"], VIOLET, { until: ["s6", "buttons"] });
cap("s6", "buttons", ["BUTTONS SWITCH TOO"], GREEN, { until: ["s6", "runs"] });
cap("s6", "runs", ["MAC, WINDOWS, LINUX"], GREEN);
endCard(["KEEP THE MOUSE.", "LOSE THE APP."]);

// ---------- timings (global seconds) ----------
const T = {
  heavy: g("s1", "heavy"), buttons: g("s1", "buttons"), s2: S.s2[0], runs: g("s2", "runs"), asks: g("s2", "asks"), linux: g("s2", "doesn't"),
  s3: S.s3[0], logi: g("s3", "openlogi"), over: g("s3", "over"), free: g("s3", "it's"), light: g("s3", "light"), needs: g("s3", "needs"),
  s4: S.s4[0], button: g("s4", "button"), shortcut: g("s4", "shortcut"), piece: g("s4", "piece"), whole: g("s4", "whole"),
  s5: S.s5[0], ring: g("s5", "ring"), opens: g("s5", "opens"),
  s6: S.s6[0], apps: g("s6", "apps"), bsw: g("s6", "switch", 2), runs6: g("s6", "runs"), mac: g("s6", "mac"), win: g("s6", "windows"), lin: g("s6", "linux"),
  s7: S.s7[0], s8: S.s8[0],
};
const ACT_AT = [T.shortcut, T.piece, T.whole];
const TOOL_AT = [T.mac, T.win, T.lin];
const v = new THREE.Vector3();

// ---------- shots: [cx,cy,cz, lx,ly,lz, fov] ----------
const SH = [
  { at: 0, K: [[0, [0.3, 1.9, 6.0, 0.1, 0.60, -0.3, 48]], [S.s2[0], [0.1, 1.8, 5.5, 0.1, 0.65, -0.3, 48]]] },
  { at: T.s2, K: [[0, [-0.5, 1.7, 5.5, 0.1, 0.65, -0.3, 46]], [4.4, [0.3, 1.7, 5.3, 0.1, 0.65, -0.3, 46]]] },
  { at: T.s3, K: [[0, [-0.6, 2.1, 6.0, 0.1, 0.70, -0.4, 48]], [3.6, [0.2, 1.9, 5.5, 0.1, 0.70, -0.4, 46]], [7.6, [0.4, 1.8, 5.3, 0.1, 0.70, -0.4, 46]]] },
  { at: T.s4, K: [[0, [0.9, 1.8, 5.4, 0.2, 0.55, -0.1, 46]], [3.6, [0.6, 1.7, 5.2, 0.2, 0.55, -0.1, 46]]] },
  { at: T.s5, K: [[0, [-0.4, 1.7, 5.2, 0.15, 0.60, -0.2, 46]], [3.4, [-0.1, 1.7, 5.0, 0.15, 0.60, -0.2, 46]]] },
  { at: T.s6, K: [[0, [0.5, 1.8, 5.4, 0.1, 0.60, -0.2, 46]], [1.6, [0.3, 1.8, 5.5, 0.1, 0.65, -0.2, 46]], [2.4, [0, 2.8, 7.4, 0, 1.25, -0.8, 50]], [3.7, [0.3, 3.0, 7.8, 0, 1.25, -0.8, 50]]] },
  { at: T.s7, calm: 1, K: [[0, [0.3, 3.0, 7.8, 0, 1.25, -0.8, 50]], [2, [0.5, 3.2, 8.4, 0, 1.25, -0.8, 50]]] },
];

run("openlogi-world", (t) => {
  root.visible = t < T.s8 - 0.12; // hide the scene before the CTA fades in
  const wrong = t < T.s3;
  accent.material.color.set(wrong ? (t >= T.heavy ? RED : VIOLET) : GREEN).multiplyScalar(1.6);
  mScreen.color.set(wrong ? 0x0b0a26 : 0x0a1a1a);

  // s1: the heavy app drops onto the screen; s2 its gear spins; gone on "Instead"
  const drop = sm(T.heavy - 0.15, T.heavy + 0.2, t), out = sm(T.s3 - 0.05, T.s3 + 0.3, t);
  app.visible = drop > 0.01 && out < 0.99;
  app.position.copy(APP_HOME); app.position.y += 1.6 * (1 - drop) - 2.0 * out;
  app.scale.setScalar(1 - 0.4 * out);
  app.position.y -= 0.04 * Math.max(0, 1 - Math.abs(t - T.heavy - 0.22) / 0.12); // thud
  gear.rotation.z = t >= T.runs - 0.1 ? -(t - T.runs) * 4 : 0;
  gear.scale.setScalar(1 + 0.4 * sm(T.runs - 0.1, T.runs + 0.2, t));
  // sign-in panel pops in front of the app
  const si = sm(T.asks - 0.1, T.asks + 0.2, t) * (1 - sm(T.linux - 0.15, T.linux + 0.05, t));
  signin.visible = si > 0.01; signin.position.copy(SCR(0, 0.85, 0.45)); signin.scale.setScalar(si);
  // penguin with the red cross
  const pk = sm(T.linux - 0.1, T.linux + 0.2, t) * (1 - out);
  peng.visible = pk > 0.01; peng.scale.setScalar(0.85 * pk);
  pcross.forEach((c) => (c.visible = t >= T.linux + 0.25));

  // mouse buttons: red flash on "buttons" in s1, violet idle, green when mapped
  BTN.forEach((b, i) => {
    let hex = VIOLET, k = 0.6;
    if (wrong && t >= T.buttons - 0.1 && t < T.s2) { hex = RED; k = 1.6 + 0.8 * Math.sin(t * 14); }
    if (t >= T.button - 0.1 && t < T.s5) { hex = GREEN; k = i === 2 ? 2.2 : 1.3; }
    if (t >= T.s5 && t < T.s7 && i === 2) { hex = GREEN; k = 1.0 + 1.6 * Math.max(0, 1 - Math.abs(t - g("s5", "press") - 0.2) / 0.3); }
    if (t >= T.s6 && i === 2) { hex = t >= T.bsw - 0.1 ? GREEN : VIOLET; k = 2.0; }
    lightBtn(b, hex, k);
  });
  thumb.position.x = -0.29 + 0.02 * Math.max(0, 1 - Math.abs(t - g("s5", "press") - 0.2) / 0.15);

  // s3: green OpenLogi chip on screen while the app is gone, star on the star line
  const lk = sm(T.logi - 0.1, T.logi + 0.2, t) * (1 - sm(T.s4 - 0.1, T.s4 + 0.1, t));
  lite.visible = lk > 0.01; lite.position.copy(SCR(0, 0.85, 0.1)); lite.scale.setScalar(lk * (1 + 0.04 * Math.sin(t * 5)));
  const sk = sm(T.over - 0.1, T.over + 0.25, t) * (1 - sm(T.free - 0.15, T.free + 0.1, t));
  star.visible = sk > 0.01; star.scale.setScalar(0.42 * sk * (1 + 0.08 * Math.sin(t * 6)));
  star.position.set(0, 1.78, -0.3); star.rotation.y = 0.35 * Math.sin((t - T.over) * 2.5);

  // s4: each action card lands on screen on its word; a green line from the thumb button to the newest
  let newest = -1;
  acts.forEach((c, i) => {
    const k = sm(ACT_AT[i] - 0.25, ACT_AT[i] + 0.05, t) * (1 - sm(T.s5 - 0.1, T.s5 + 0.1, t));
    c.visible = k > 0.01; c.position.copy(SCR(0, ACT_Y[i], 0.1)); c.scale.setScalar(k);
    if (t >= ACT_AT[i] - 0.1) newest = i;
  });
  const lnk = t >= T.shortcut - 0.1 && t < T.s5 - 0.1;
  link.visible = lnk;
  if (lnk) {
    const A = thumbGlow.getWorldPosition(new THREE.Vector3()), B = SCR(0.75, ACT_Y[newest], 0.1), d = B.clone().sub(A);
    link.position.copy(A); link.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), d.clone().normalize()); link.scale.set(1, d.length(), 1);
  }

  // s5: cursor on screen, ring of 8 opens around it
  const ra = sm(T.ring - 0.1, T.ring + 0.3, t) * (1 - sm(T.s6 - 0.1, T.s6 + 0.1, t));
  ring.visible = ra > 0.01; ring.position.copy(RING_C); ring.scale.setScalar(0.3 + 0.7 * ra); ring.rotation.z = 0.4 * (1 - ra);
  slots.forEach((s, i) => s.scale.setScalar(sm(T.ring + 0.04 * i, T.ring + 0.25 + 0.04 * i, t)));
  cursor.visible = t >= T.s5 - 0.05 && t < T.s6 - 0.1;
  cursor.position.copy(v.copy(RING_C).add(new THREE.Vector3(0.7, -0.4, 0.05))).lerp(v2.copy(RING_C).add(new THREE.Vector3(0.05, -0.06, 0.08)), sm(T.s5, T.s5 + 0.6, t));

  // s6: browser -> editor on screen, the thumb tag follows
  const sw = sm(T.bsw - 0.15, T.bsw + 0.1, t), s6on = t >= T.s6 - 0.05 && t < T.runs6;
  const s6out = 1 - sm(T.runs6 - 0.15, T.runs6 + 0.05, t);
  winB.visible = s6on && sw < 0.99; winB.position.copy(SCR(0, 1.05, 0.1)); winB.scale.setScalar((1 - sw) * s6out * sm(T.s6 - 0.05, T.s6 + 0.2, t));
  winE.visible = s6on && sw > 0.01; winE.position.copy(SCR(0, 1.05, 0.1)); winE.scale.setScalar(sw * s6out);
  tagB.visible = s6on && sw < 0.99; tagB.scale.setScalar((1 - sw) * s6out); tagB.material.opacity = 1;
  tagE.visible = s6on && sw > 0.01; tagE.scale.setScalar(sw * s6out);
  tools.forEach((m, i) => {
    const k = sm(TOOL_AT[i] - 0.1, TOOL_AT[i] + 0.15, t) * (1 - sm(T.s7 - 0.15, T.s7, t));
    m.visible = k > 0.01; m.scale.setScalar(1.1 * k);
  });

  const { punch } = shoot(SH, t);
  const spike = overlays(t);
  bloom.strength = 1.0 + 1.2 * punch * punch + spike;
});
const v2 = new THREE.Vector3();
