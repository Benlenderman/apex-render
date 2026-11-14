// NEVER SCROLL A WALL OF TEXT (Archify). Laptop on a dark desk; wrong = endless red text reply, right = a page you click.
import { THREE, S, g, sm, scene, bloom, glow, tube, VIOLET, ORANGE, RED, GREEN, WHITE, label, shoot, run } from "./kit.js";
import { title, cap, boom, endCard, overlays, fitText } from "./extra.js";

import { RoundedBoxGeometry } from "three/addons/geometries/RoundedBoxGeometry.js";
const std = (c, e, r = 0.45, m = 0.25) => new THREE.MeshStandardMaterial({ color: c, emissive: e, roughness: r, metalness: m });
const rbox = (w, h, d, r, mat) => new THREE.Mesh(new RoundedBoxGeometry(w, h, d, 4, r), mat);
const mBody = std(0x4a42c8, 0x1c1766, 0.35, 0.35), mDark = std(0x14123a, 0x07061a, 0.6, 0.2), mLav = std(0xc9c0ff, 0x4a3fb0, 0.4, 0.1);
const mGreen = std(0x1f7a4a, 0x0f5a33, 0.4, 0.2);
const flat = (w, h, mat) => new THREE.Mesh(new THREE.PlaneGeometry(w, h), mat);

// ---------- desk + room lights ----------
const desk = rbox(9, 0.3, 5, 0.12, std(0x221d66, 0x0c0a30, 0.7, 0.1)); desk.position.set(0, -0.14, -0.6); scene.add(desk);
const pl = new THREE.PointLight(0xe8e2ff, 18, 9, 1.6); pl.position.set(-1.6, 3.2, 2.2); scene.add(pl);
const rim = new THREE.PointLight(0xff8a3a, 10, 8, 1.6); rim.position.set(2.6, 2.2, -2.4); scene.add(rim);

// ---------- laptop at the origin, screen faces +z ----------
const base = rbox(2.6, 0.1, 1.7, 0.04, mBody); base.position.set(0, 0.05, 0); scene.add(base);
const keys = rbox(2.2, 0.02, 0.8, 0.01, mDark); keys.position.set(0, 0.105, -0.2); scene.add(keys);
const pad = rbox(0.8, 0.02, 0.45, 0.01, mDark); pad.position.set(0, 0.105, 0.5); scene.add(pad);
const lid = new THREE.Group(); lid.position.set(0, 0.1, -0.85); lid.rotation.x = -0.12; scene.add(lid);
const screen = rbox(2.6, 1.7, 0.06, 0.04, mBody); screen.position.set(0, 0.85, 0); lid.add(screen);
const mScreen = new THREE.MeshBasicMaterial({ color: 0x0b0a26, toneMapped: false });
const face = flat(2.4, 1.5, mScreen); face.position.set(0, 0.85, 0.035); lid.add(face);
const bar = flat(2.4, 0.12, glow(VIOLET, 0.35)); bar.position.set(0, 1.54, 0.037); lid.add(bar);
const accent = flat(2.4, 0.015, glow(VIOLET, 1.6)); accent.position.set(0, 1.475, 0.038); lid.add(accent);
[-1.08, -0.98, -0.88].forEach((x, i) => { const d = new THREE.Mesh(new THREE.CircleGeometry(0.025, 16), glow([RED, ORANGE, GREEN][i], 1.2)); d.position.set(x, 1.54, 0.039); lid.add(d); });
const onLid = (x, y, z = 0.08) => { lid.updateMatrixWorld(true); return lid.localToWorld(new THREE.Vector3(x, y, z)); };

// ---------- the wall of text: one long AI reply drawn on a tall canvas ----------
function wallCanvas() {
  const c = document.createElement("canvas"); c.width = 512; c.height = 2048; const x = c.getContext("2d");
  x.fillStyle = "#151236"; x.fillRect(0, 0, 512, 2048);
  let y = 30, day = 1;
  for (let i = 0; y < 2010; i++) {
    if (i % 11 === 0 && day <= 4) { x.fillStyle = "#ff5a68"; x.font = "900 40px Inter, Arial, sans-serif"; x.fillText(`DAY ${day++}`, 30, y + 34); y += 60; continue; }
    x.fillStyle = "#8f88c8"; x.fillRect(30, y, 300 + ((i * 97) % 150), 16); y += 30;
  }
  return c;
}
const wc = wallCanvas();
const texS = new THREE.CanvasTexture(wc); texS.wrapT = THREE.RepeatWrapping; texS.repeat.set(1, 0.3);
const wallOnScreen = flat(2.3, 1.3, new THREE.MeshBasicMaterial({ map: texS, toneMapped: false })); wallOnScreen.position.set(0, 0.78, 0.04); lid.add(wallOnScreen);
const texT = new THREE.CanvasTexture(wc);
const tallGeo = new THREE.PlaneGeometry(1.5, 4.6); tallGeo.translate(0, 2.3, 0);
const tall = new THREE.Mesh(tallGeo, new THREE.MeshBasicMaterial({ map: texT, toneMapped: false, side: THREE.DoubleSide })); scene.add(tall);
const lost = fitText(["?"], RED, 2.0, 0.9);

// ---------- the clickable page on the screen (s3 on): day tabs, stops, map ----------
const page = new THREE.Group(); lid.add(page);
const tabs = [0, 1, 2, 3].map((i) => {
  const t = rbox(0.5, 0.17, 0.02, 0.03, mBody); t.position.set(-0.84 + i * 0.56, 1.3, 0.05); page.add(t);
  const tx = fitText([`DAY ${i + 1}`], WHITE, 1.0, 0.42); tx.visible = true; tx.renderOrder = 21; tx.position.set(0, 0, 0.012); t.add(tx);
  return t;
});
const stops = [0.98, 0.7, 0.42].map((y, i) => {
  const gp = new THREE.Group(); gp.position.set(-0.62, y, 0.05); page.add(gp);
  const card = rbox(0.9, 0.22, 0.02, 0.04, mDark); gp.add(card);
  const pin = new THREE.Mesh(new THREE.CircleGeometry(0.05, 20), glow(ORANGE, 1.4)); pin.position.set(-0.33, 0, 0.012); gp.add(pin);
  const ln = flat(0.5 - i * 0.08, 0.04, glow(VIOLET, 0.8)); ln.position.set(0.02, 0, 0.012); gp.add(ln);
  return gp;
});
const map = new THREE.Group(); map.position.set(0.55, 0.7, 0.05); page.add(map);
map.add(flat(1.0, 0.82, new THREE.MeshBasicMaterial({ color: 0x0e3b2c, toneMapped: false })));
[[-0.5, -0.2, 0.5, 0.25], [-0.2, -0.41, 0.1, 0.41], [-0.5, 0.15, 0.5, -0.05], [0.25, -0.41, 0.3, 0.41]].forEach(([a, b, c, d]) => {
  const r = tube([a, b, 0.01], [c, d, 0.01], 0.025, glow(GREEN, 0.5)); map.add(r);
});
const mapPin = new THREE.Group(); map.add(mapPin);
const pinCone = new THREE.Mesh(new THREE.ConeGeometry(0.06, 0.16, 16), glow(GREEN, 2.0)); pinCone.rotation.x = Math.PI; pinCone.position.y = 0.08; mapPin.add(pinCone);
const pinHead = new THREE.Mesh(new THREE.SphereGeometry(0.07, 16, 12), glow(GREEN, 2.0)); pinHead.position.y = 0.18; mapPin.add(pinHead);
const pinRing = new THREE.Mesh(new THREE.TorusGeometry(0.1, 0.012, 6, 32), glow(GREEN, 2.0)); mapPin.add(pinRing);

// ---------- s5: chat view (one sentence typed) + three topic cards ----------
const chat = new THREE.Group(); lid.add(chat);
const input = rbox(2.0, 0.24, 0.02, 0.08, mDark); input.position.set(-0.05, 0.35, 0.05); chat.add(input);
const typed = flat(1.5, 0.05, glow(WHITE, 0.9)); typed.position.set(-0.05, 0.35, 0.065); chat.add(typed);
const send = new THREE.Mesh(new THREE.CircleGeometry(0.08, 24), glow(GREEN, 1.6)); send.position.set(0.82, 0.35, 0.065); chat.add(send);
const TOPICS = ["TRIPS", "SCHOOL", "SYSTEMS"];
const cards = TOPICS.map((txt) => {
  const gp = new THREE.Group(); scene.add(gp);
  gp.add(rbox(0.95, 0.5, 0.08, 0.06, mBody));
  const rim2 = flat(0.85, 0.03, glow(GREEN, 1.4)); rim2.position.set(0, -0.19, 0.045); gp.add(rim2);
  const t = fitText([txt], WHITE, 1.0, 0.8); t.visible = true; t.position.z = 0.05; gp.add(t);
  return gp;
});

// ---------- s6: a step diagram; click one step, everything after it lights up ----------
const NODES = [[-1.05, 2.45], [-0.35, 2.45], [0.35, 2.9], [0.35, 2.0], [1.05, 2.9], [-1.05, 1.95]];
const EDGES = [[0, 1], [5, 1], [1, 2], [1, 3], [2, 4]];
const AFTER = { 1: 0, 2: 1, 3: 1, 4: 2 }; // step -> light-up order
const nodes = NODES.map(([x, y]) => { const m = rbox(0.46, 0.3, 0.1, 0.06, std(0x4a42c8, 0x1c1766, 0.35, 0.35)); m.position.set(x, y, -0.3); scene.add(m); return m; });
const edges = EDGES.map(([a, b]) => { const m = tube([NODES[a][0], NODES[a][1], -0.3], [NODES[b][0], NODES[b][1], -0.3], 0.04, glow(VIOLET, 0.6)); scene.add(m); return m; });

// one file (the html page) and a friend's phone
const file = new THREE.Group(); scene.add(file);
file.add(rbox(0.56, 0.72, 0.06, 0.05, mLav));
const fBand = flat(0.46, 0.2, glow(GREEN, 1.1)); fBand.position.set(0, -0.12, 0.032); file.add(fBand);
const fCorner = new THREE.Mesh(new THREE.CircleGeometry(0.09, 3), glow(ORANGE, 1.4)); fCorner.position.set(0.19, 0.27, 0.033); fCorner.rotation.z = Math.PI / 4; file.add(fCorner);
[0.14, 0.06].forEach((y) => { const l = flat(0.3, 0.025, new THREE.MeshBasicMaterial({ color: 0x6a5fd0 })); l.position.set(-0.05, y, 0.032); file.add(l); });
const fTxt = fitText(["HTML"], WHITE, 1.0, 0.4); fTxt.visible = true; fTxt.position.set(0, -0.12, 0.034); file.add(fTxt);
const phone = new THREE.Group(); scene.add(phone);
phone.add(rbox(0.6, 1.1, 0.07, 0.08, mBody));
const pScreen = flat(0.5, 0.95, new THREE.MeshBasicMaterial({ color: 0x0b0a26, toneMapped: false })); pScreen.position.z = 0.04; phone.add(pScreen);
const pGot = new THREE.Group(); pGot.position.z = 0.05; phone.add(pGot);
[[0.3, 0.1], [0.3, -0.05], [0.3, -0.2]].forEach(([w, y], i) => { const r = rbox(0.38, 0.11, 0.01, 0.02, i ? mDark : mGreen); r.position.y = y + 0.1; pGot.add(r); });
const pPin = new THREE.Mesh(new THREE.CircleGeometry(0.035, 16), glow(ORANGE, 1.4)); pPin.position.set(-0.12, 0.05, 0.01); pGot.add(pPin);

// ---------- s3: GitHub star ----------
const starShape = new THREE.Shape();
for (let i = 0; i < 10; i++) { const a = Math.PI / 2 + (i * Math.PI) / 5, r = i % 2 ? 0.17 : 0.4; starShape[i ? "lineTo" : "moveTo"](Math.cos(a) * r, Math.sin(a) * r); }
const star = new THREE.Mesh(new THREE.ExtrudeGeometry(starShape, { depth: 0.08, bevelEnabled: true, bevelSize: 0.03, bevelThickness: 0.03, bevelSegments: 2 }), glow(ORANGE, 1.5));
scene.add(star);

const cursor = new THREE.Mesh(new THREE.ConeGeometry(0.07, 0.2, 3), glow(WHITE, 1.4)); cursor.rotation.z = 0.5; scene.add(cursor);

// ---------- captions ----------
title("NEVER SCROLL A WALL OF TEXT");
cap("s1", "exploring", ["EXPLORING GITHUB REPOS"], WHITE, { until: "s1" });
cap("s2", "one", ["ONE LONG REPLY"], RED, { until: ["s2", "lose"] });
cap("s2", "lose", ["LOST BY DAY 2"], RED, { boom: 0.5 });
cap("s3", "archify", ["ARCHIFY"], GREEN, { until: ["s3", "over"], boom: 0.5 });
cap("s3", "over", ["OVER 96,000 STARS", "IN 7 MONTHS"], ORANGE, { until: ["s3", "free"], boom: 0.5 });
cap("s3", "free", ["FREE SKILL FOR YOUR AI"], GREEN, { until: ["s3", "page"] });
cap("s3", "page", ["A PAGE YOU CAN CLICK"], GREEN, { boom: 0.4 });
cap("s4", "switch", ["DAY 1 TO DAY 4"], VIOLET, { until: ["s4", "tap"] });
cap("s4", "tap", ["TAP A STOP"], VIOLET, { until: ["s4", "jumps"] });
cap("s4", "jumps", ["STRAIGHT TO THE MAP"], GREEN, { boom: 0.4 });
cap("s5", "trips", ["TRIPS. SCHOOL. SYSTEMS."], VIOLET, { until: ["s5", "you"] });
cap("s5", "you", ["ONE SENTENCE"], GREEN, { boom: 0.4 });
cap("s6", "click", ["CLICK ANY STEP"], VIOLET, { until: ["s6", "lights"] });
cap("s6", "lights", ["EVERYTHING AFTER IT", "LIGHTS UP"], GREEN, { until: ["s6", "it's"], boom: 0.5 });
cap("s6", "file", ["ONE FILE"], GREEN, { until: ["s6", "send"] });
cap("s6", "send", ["SEND IT TO A FRIEND"], GREEN);
endCard(["DON'T READ THE ANSWER.", "EXPLORE IT."]);
boom("s1", "never", 0.4);

// ---------- timings (global seconds) ----------
const T = {
  never: g("s1", "never"), s2: S.s2[0], reply: g("s2", "reply"), lose: g("s2", "lose"),
  s3: S.s3[0], over: g("s3", "over"), free: g("s3", "free"), page: g("s3", "page"),
  s4: S.s4[0], day1: g("s4", "day", 1), day4: g("s4", "four"), tap: g("s4", "tap"), jumps: g("s4", "jumps"), map: g("s4", "map"),
  s5: S.s5[0], trips: g("s5", "trips"), school: g("s5", "school"), whole: g("s5", "whole"), you: g("s5", "you"), sentence: g("s5", "sentence"),
  s6: S.s6[0], click: g("s6", "click"), lights: g("s6", "lights"), file: g("s6", "file"), send: g("s6", "send"), friend: g("s6", "friend"),
  s7: S.s7[0],
};
const v = new THREE.Vector3();

// ---------- shots: [cx,cy,cz, lx,ly,lz, fov] ----------
const SH = [
  { at: 0, K: [[0, [0.3, 1.5, 4.2, 0, 0.9, -0.7, 46]], [S.s2[0], [0.1, 1.4, 3.8, 0, 0.9, -0.7, 46]]] },
  { at: T.s2, K: [[0, [0.2, 1.6, 5.2, 0, 1.4, -0.7, 50]], [1.6, [0.5, 3.9, 8.4, 0, 3.9, -0.7, 56]], [4.2, [0.7, 4.1, 8.6, 0, 4.1, -0.7, 56]]] },
  { at: T.s3, K: [[0, [-0.6, 2.1, 5.8, 0, 1.0, -0.6, 48]], [5.0, [0.2, 1.8, 5.2, 0, 1.0, -0.6, 46]], [8.6, [0.1, 1.4, 3.9, 0, 0.9, -0.7, 46]]] },
  { at: T.s4, K: [[0, [0.2, 1.35, 4.2, 0, 0.85, -0.75, 46]], [3.7, [-0.1, 1.3, 4.0, 0.05, 0.85, -0.75, 46]]] },
  { at: T.s5, K: [[0, [0, 2.3, 6.2, 0, 1.45, -0.8, 50]], [3.5, [0.3, 2.4, 6.5, 0, 1.5, -0.8, 50]]] },
  { at: T.s6, K: [[0, [0, 2.5, 6.0, 0, 1.9, -0.6, 50]], [2.7, [0.2, 2.6, 6.4, 0, 2.0, -0.6, 50]], [4.9, [0.3, 2.6, 6.6, 0.2, 2.0, -0.6, 50]]] },
  { at: T.s7, calm: 1, K: [[0, [0.1, 1.5, 4.0, 0, 0.9, -0.7, 46]], [4, [0.3, 1.6, 4.4, 0, 0.9, -0.7, 46]]] },
];

run("archify-world", (t) => {
  const wrong = t < T.s3;
  accent.material.color.set(wrong ? (t >= T.never ? RED : VIOLET) : GREEN).multiplyScalar(1.6);
  mScreen.color.set(wrong ? 0x0b0a26 : 0x0a1a1a);

  // s1-s2: the reply scrolls on screen and never ends; in s2 it rises out of the laptop as a tall strip
  wallOnScreen.visible = t < T.s2 + 0.4; // the reply moves out into the tall strip
  texS.offset.y = 0.7 - ((t * 0.09) % 0.7);
  const rise = sm(T.s2 + 0.1, T.reply, t);
  tall.visible = wrong && rise > 0.01;
  tall.position.set(0, 1.55, -0.6); tall.scale.set(1, rise, 1);
  texT.repeat.set(1, Math.max(0.01, rise)); texT.offset.y = 1 - rise;
  wallOnScreen.material.color.set(t >= T.s2 ? 0xff9aa2 : 0xffffff);
  tall.material.color.set(0xffb0b6);
  const lk = sm(T.lose - 0.1, T.lose + 0.2, t) * (wrong ? 1 : 0);
  label(lost, 1.25, 5.0 + 0.08 * Math.sin(t * 5), -0.5, 2.6, lk);

  // page UI (s3 "page" on; s5 shows the chat instead)
  const pageOn = t >= T.page - 0.1 && (t < T.s5 || t >= T.s6);
  page.visible = pageOn; page.scale.setScalar(pageOn ? 0.6 + 0.4 * sm(T.page - 0.1, T.page + 0.25, t) : 1);
  page.position.set(0, (1 - page.scale.y) * 0.85, 0);
  // active day tab walks from day 1 to day 4
  const active = t < T.day1 ? 0 : Math.min(3, Math.floor(4 * sm(T.day1, T.day4 + 0.05, t) - 1e-6 + 1e-3));
  tabs.forEach((tb, i) => { tb.material = i === active ? mGreen : mBody; });
  stops.forEach((s, i) => { s.scale.setScalar(i === 1 ? 1 + 0.12 * sm(T.tap, T.tap + 0.15, t) * (1 - sm(T.tap + 0.3, T.tap + 0.5, t)) : 1); s.children[0].material = i === 1 && t >= T.tap ? mGreen : mDark; });
  const pk = sm(T.jumps, T.jumps + 0.35, t);
  mapPin.visible = pk > 0.01; mapPin.position.set(0.12, -0.05 + 0.35 * (1 - pk), 0.02); pinRing.scale.setScalar(1 + 0.5 * ((t * 1.5) % 1));
  map.scale.setScalar(1 + 0.12 * sm(T.jumps, T.map + 0.2, t) * (t < T.s5 ? 1 : 0));

  // chat view + cards (s5)
  const s5 = t >= T.s5 && t < T.s6;
  chat.visible = s5;
  const ty = sm(T.you, T.sentence + 0.3, t);
  typed.scale.x = Math.max(0.01, ty); typed.position.x = -0.05 - 0.75 * (1 - ty);
  send.scale.setScalar(1 + 0.4 * sm(T.sentence + 0.2, T.sentence + 0.4, t));
  [T.trips, T.school, T.whole].forEach((T0, i) => {
    const k = sm(T0 - 0.1, T0 + 0.25, t) * (s5 ? 1 : 0);
    const c = cards[i]; c.visible = k > 0.01;
    c.position.set(-0.92 + i * 0.92, 0.9 + 1.25 * k, 0.1); c.scale.setScalar(0.82 * k); c.rotation.y = 0.15 * Math.sin(t * 2 + i);
  });

  // s6: diagram, click step 2, light everything after it; then it folds into one file sent to a phone
  const s6 = t >= T.s6 && t < T.s7;
  const fold = sm(T.file - 0.15, T.file + 0.3, t);
  const dk = sm(T.s6, T.s6 + 0.3, t) * (1 - fold);
  nodes.forEach((n, i) => {
    n.visible = s6 && dk > 0.01; n.scale.setScalar(dk);
    const ord = AFTER[i], lit = ord === undefined ? 0 : sm(T.lights + 0.22 * ord - 0.05, T.lights + 0.22 * ord + 0.15, t);
    n.material.color.set(0x4a42c8).lerp(new THREE.Color(0x1f9a5a), lit); n.material.emissive.set(0x1c1766).lerp(new THREE.Color(0x14803f), lit);
    if (i === 1) n.scale.setScalar(dk * (1 + 0.15 * sm(T.click + 0.25, T.click + 0.4, t) * (1 - sm(T.click + 0.5, T.click + 0.7, t))));
  });
  edges.forEach((e, j) => {
    const b = EDGES[j][1], lit = AFTER[b] && EDGES[j][0] !== 0 && EDGES[j][0] !== 5 ? sm(T.lights + 0.22 * AFTER[b] - 0.15, T.lights + 0.22 * AFTER[b], t) : 0;
    e.visible = s6 && dk > 0.01; e.scale.set(dk, dk, 1);
    e.material.color.set(VIOLET).multiplyScalar(0.6).lerp(new THREE.Color(GREEN).multiplyScalar(1.4), lit);
  });
  const fly = sm(T.send, T.friend + 0.2, t);
  file.visible = s6 && fold > 0.01;
  file.position.set(-0.6 + 1.5 * fly, 2.45 + 0.35 * Math.sin(fly * Math.PI), -0.3); file.scale.setScalar(fold * (1 - 0.45 * fly));
  const ph = sm(T.send - 0.2, T.send + 0.1, t);
  phone.visible = s6 && ph > 0.01; phone.position.set(0.95, 2.4, -0.3); phone.scale.setScalar(ph);
  pGot.visible = t >= T.friend + 0.15;

  // cursor: day tabs and a stop (s4), a step (s6)
  let cp = null;
  if (t >= T.s4 - 0.1 && t < T.s5) {
    if (t < T.tap - 0.35) { const k = 4 * sm(T.day1, T.day4 + 0.05, t); const i = Math.min(3, Math.floor(k)); cp = onLid(-0.84 + i * 0.56 + 0.16, 1.16); }
    else cp = onLid(-0.62, 0.62).lerp(onLid(0.96, 1.22), 1 - sm(T.tap - 0.35, T.tap, t));
  } else if (s6 && t < T.file - 0.2) {
    cp = v.set(NODES[1][0] + 0.15, NODES[1][1] - 0.15, -0.15).lerp(new THREE.Vector3(1.4, 1.6, -0.15), 1 - sm(T.s6, T.click + 0.25, t));
  }
  cursor.visible = !!cp; if (cp) cursor.position.copy(cp);

  // s3: the star pops in above the laptop while the star count is on screen
  const sk = sm(T.over - 0.1, T.over + 0.25, t) * (1 - sm(T.free - 0.15, T.free + 0.1, t));
  star.visible = sk > 0.01; star.scale.setScalar(0.5 * sk * (1 + 0.08 * Math.sin(t * 6)));
  star.position.set(0, 2.02, -0.3); star.rotation.y = 0.35 * Math.sin((t - T.over) * 2.5);

  const { punch } = shoot(SH, t);
  const spike = overlays(t);
  bloom.strength = Math.min(1.45, 1.0 + 1.2 * punch * punch + spike);
});
