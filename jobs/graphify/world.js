// NEVER LET AI REREAD YOUR CODE (Graphify). Laptop on a dark desk; wrong = an AI chip reads every file card one by one, again;
// right = the files collapse into one glowing graph in front of the screen: click a dot, light a path.
import { THREE, S, g, sm, scene, bloom, glow, VIOLET, ORANGE, RED, GREEN, WHITE, shoot, run } from "./kit.js";
import { title, cap, boom, endCard, overlays, fitText } from "./extra.js";

import { RoundedBoxGeometry } from "three/addons/geometries/RoundedBoxGeometry.js";
const root = new THREE.Group(); scene.add(root);
const std = (c, e, r = 0.45, m = 0.25) => new THREE.MeshStandardMaterial({ color: c, emissive: e, roughness: r, metalness: m });
const rbox = (w, h, d, r, mat) => new THREE.Mesh(new RoundedBoxGeometry(w, h, d, 4, r), mat);
const mBody = std(0x4a42c8, 0x1c1766, 0.35, 0.35), mDark = std(0x14123a, 0x07061a, 0.6, 0.2), mLav = std(0xc9c0ff, 0x4a3fb0, 0.4, 0.1);

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

// ---------- file cards: lavender card, colored band, orange folded corner ----------
function makeFile(hex, txt) {
  const gp = new THREE.Group();
  const b = rbox(0.56, 0.72, 0.06, 0.05, mLav); gp.add(b);
  const band = new THREE.Mesh(new THREE.PlaneGeometry(0.46, 0.2), glow(hex, 1.1)); band.position.set(0, -0.12, 0.032); gp.add(band);
  const corner = new THREE.Mesh(new THREE.CircleGeometry(0.09, 3), glow(ORANGE, 1.4)); corner.position.set(0.19, 0.27, 0.033); corner.rotation.z = Math.PI / 4; gp.add(corner);
  [0.14, 0.06].forEach((y) => { const l = new THREE.Mesh(new THREE.PlaneGeometry(0.3, 0.025), new THREE.MeshBasicMaterial({ color: 0x6a5fd0 })); l.position.set(-0.05, y, 0.032); gp.add(l); });
  const t = fitText([txt], WHITE, 1.0, 0.4); t.visible = true; t.position.set(0, -0.12, 0.034); t.renderOrder = 5; gp.add(t);
  gp.userData.band = band; gp.rotation.x = -0.12;
  root.add(gp); gp.visible = false;
  return gp;
}
const setBand = (f, hex, k = 1.1) => f.userData.band.material.color.set(hex).multiplyScalar(k);
const CARD = [[-0.75, 1.05], [0, 1.05], [0.75, 1.05], [-0.75, 0.45], [0, 0.45], [0.75, 0.45]];
const cards = ["PY", "JS", "TS", "SQL", "CSS", "MD"].map((n) => makeFile(RED, n));

// AI chip that reads the cards
const chip = new THREE.Group(); root.add(chip);
chip.add(rbox(0.26, 0.26, 0.06, 0.05, std(0x2a1f7a, 0x2a1d90, 0.35, 0.3)));
const chipT = fitText(["AI"], WHITE, 1.0, 0.36); chipT.visible = true; chipT.position.z = 0.035; chipT.renderOrder = 6; chip.add(chipT);
const chipRing = new THREE.Mesh(new THREE.TorusGeometry(0.17, 0.012, 6, 32), glow(RED, 1.8)); chip.add(chipRing);
chip.rotation.x = -0.12; chip.scale.setScalar(0.75);
// big red question mark above the laptop
const qm = fitText(["?"], RED, 1.6, 2.6); qm.renderOrder = 8;

// ---------- the graph: nodes (code violet, docs green, video orange) + edges ----------
const COL = [VIOLET, GREEN, ORANGE];
const NODES = [[-0.75, 1.05, 0], [0, 1.05, 0], [0.75, 1.05, 0], [-0.75, 0.45, 1], [0, 0.45, 0], [0.75, 0.45, 1],
  [-0.38, 0.78, 2], [0.38, 0.78, 0], [-1.0, 0.75, 1], [1.0, 0.75, 0], [-0.4, 1.3, 1], [0.4, 1.3, 2], [-0.4, 0.25, 0], [0.4, 0.25, 2], [1.0, 0.3, 2], [-1.0, 0.25, 0]];
const nodes = NODES.map(([x, y, ty], i) => {
  const m = new THREE.Mesh(new THREE.SphereGeometry(0.075, 20, 14), glow(COL[ty], 1.4));
  m.position.copy(SCR(x, y, 0.06 * Math.sin(i * 2.3))); m.userData.ty = ty; m.visible = false; root.add(m); return m;
});
const EDGES = [[0, 1], [1, 2], [0, 6], [6, 4], [4, 7], [7, 2], [3, 6], [5, 7], [0, 10], [10, 1], [1, 11], [11, 2], [3, 12], [12, 4], [4, 13], [13, 5],
  [8, 0], [8, 3], [9, 2], [9, 5], [14, 5], [15, 3], [6, 7], [10, 6], [11, 7]];
const up = new THREE.Vector3(0, 1, 0);
const edges = EDGES.map(([a, b]) => {
  const A = nodes[a].position, B = nodes[b].position, d = B.clone().sub(A);
  const m = new THREE.Mesh(new THREE.CylinderGeometry(0.013, 0.013, d.length(), 6), new THREE.MeshBasicMaterial({ color: 0xffffff, toneMapped: false }));
  m.position.copy(A).add(B).multiplyScalar(0.5); m.quaternion.setFromUnitVectors(up, d.normalize()); m.visible = false; root.add(m);
  return m;
});
const eIdx = (a, b) => EDGES.findIndex(([x, y]) => (x === a && y === b) || (x === b && y === a));
const CLICK = 4, NB = [6, 7, 12, 13], NBE = NB.map((n) => eIdx(CLICK, n));
const PATH = [15, 3, 6, 7, 5, 9], PE = PATH.slice(1).map((n, i) => eIdx(PATH[i], n));
const ringOf = (hex) => { const r = new THREE.Mesh(new THREE.TorusGeometry(0.15, 0.016, 8, 40), glow(hex, 2.0)); r.rotation.x = -0.12; r.visible = false; root.add(r); return r; };
const clickRing = ringOf(GREEN), endA = ringOf(ORANGE), endB = ringOf(ORANGE);
const cursor = new THREE.Mesh(new THREE.ConeGeometry(0.07, 0.2, 3), glow(WHITE, 1.4)); cursor.rotation.z = 0.5; root.add(cursor);

// s4: one file of each kind flies into the map
const kinds = [makeFile(VIOLET, "PY"), makeFile(GREEN, "PDF"), makeFile(ORANGE, "MP4")];
const KIND_FROM = [SCR(-0.6, 0.8, 0.5), SCR(0, 0.8, 0.5), SCR(0.6, 0.8, 0.5)], KIND_TO = [1, 3, 6];

// s6: the AI tools it works in, a row above the laptop
const tools = ["CLAUDE CODE", "CURSOR", "CODEX"].map((n, i) => {
  const gp = new THREE.Group(); gp.add(rbox(0.98, 0.34, 0.08, 0.08, mBody));
  const t = fitText([n], WHITE, 1.0, 0.86); t.visible = true; t.position.z = 0.05; t.renderOrder = 6; gp.add(t);
  gp.position.set((i - 1) * 1.18, 2.2, -0.75); gp.visible = false; root.add(gp); return gp;
});

// ---------- s3: GitHub star ----------
const starShape = new THREE.Shape();
for (let i = 0; i < 10; i++) { const a = Math.PI / 2 + (i * Math.PI) / 5, r = i % 2 ? 0.17 : 0.4; starShape[i ? "lineTo" : "moveTo"](Math.cos(a) * r, Math.sin(a) * r); }
const star = new THREE.Mesh(new THREE.ExtrudeGeometry(starShape, { depth: 0.08, bevelEnabled: true, bevelSize: 0.03, bevelThickness: 0.03, bevelSegments: 2 }), glow(ORANGE, 1.5));
root.add(star);

// ---------- captions ----------
title("NEVER LET AI REREAD YOUR CODE");
cap("s1", "every", ["EVERY FILE, EVERY TIME"], RED, { until: ["s1", "exploring"] });
cap("s1", "exploring", ["EXPLORING GITHUB REPOS"], WHITE, { until: "s1" });
cap("s2", "opens", ["ONE BY ONE"], RED, { until: ["s2", "again"] });
cap("s2", "again", ["AGAIN AND AGAIN"], RED, { until: ["s2", "where"] });
cap("s2", "where", ["WHERE IS IT USED?"], RED, { boom: 0.5 });
cap("s3", "graphify", ["GRAPHIFY"], GREEN, { until: ["s3", "over"], boom: 0.5 });
cap("s3", "over", ["OVER 147,000 STARS", "IN 7 MONTHS"], ORANGE, { until: ["s3", "free"], boom: 0.5 });
cap("s3", "free", ["FREE ON GITHUB"], GREEN, { until: ["s3", "turns"] });
cap("s3", "turns", ["ONE CLICKABLE MAP"], GREEN, { boom: 0.4 });
cap("s4", "code", ["CODE"], VIOLET, { until: ["s4", "documents"] });
cap("s4", "documents", ["DOCUMENTS"], GREEN, { until: ["s4", "even"] });
cap("s4", "even", ["EVEN VIDEOS"], ORANGE, { until: ["s4", "all"] });
cap("s4", "all", ["ALL ON ONE MAP"], GREEN, { until: ["s4", "every"] });
cap("s4", "every", ["EVERY DOT IS AN IDEA"], GREEN);
cap("s5", "click", ["CLICK ANY DOT"], VIOLET, { until: ["s5", "see"] });
cap("s5", "see", ["SEE WHAT IT LINKS TO"], GREEN, { until: ["s5", "ask"] });
cap("s5", "ask", ["HOW DO TWO CONNECT?"], ORANGE, { until: ["s5", "lights"] });
cap("s5", "lights", ["IT LIGHTS UP THE PATH"], GREEN, { boom: 0.4 });
cap("s6", "runs", ["ON YOUR OWN COMPUTER"], GREEN, { until: ["s6", "works"] });
cap("s6", "works", ["WORKS IN YOUR AI TOOLS"], VIOLET);
endCard(["DON'T SEARCH YOUR CODE.", "MAP IT."]);

// ---------- timings (global seconds) ----------
const T = {
  read: g("s1", "read"), where: g("s2", "where"), s3: S.s3[0], over: g("s3", "over"), free: g("s3", "free"), turns: g("s3", "turns"), map: g("s3", "map"),
  s4: S.s4[0], code: g("s4", "code"), docs: g("s4", "documents"), vids: g("s4", "videos"), every: g("s4", "every"),
  s5: S.s5[0], click: g("s5", "click"), see: g("s5", "see"), ask: g("s5", "ask"), lights: g("s5", "lights"),
  s6: S.s6[0], claude: g("s6", "claude"), cursor: g("s6", "cursor"), codex: g("s6", "codex"), s7: S.s7[0], s8: S.s8[0],
};
const KIND_AT = [T.code, T.docs, T.vids];
const TOOL_AT = [T.claude, T.cursor, T.codex];
const v = new THREE.Vector3();

// ---------- shots: [cx,cy,cz, lx,ly,lz, fov] ----------
const SH = [
  { at: 0, K: [[0, [0.3, 1.8, 5.6, 0, 0.9, -0.5, 48]], [S.s2[0], [0.1, 1.7, 5.1, 0, 0.95, -0.6, 48]]] },
  { at: S.s2[0], K: [[0, [-0.5, 1.6, 5.2, 0, 0.95, -0.6, 46]], [4, [0.3, 1.6, 5.0, 0, 0.95, -0.6, 46]]] },
  { at: T.where - 0.2, K: [[0, [-0.6, 2.1, 5.8, 0, 1.0, -0.6, 48]], [2, [-0.4, 2.0, 5.6, 0, 1.0, -0.6, 48]]] },
  { at: T.s3, K: [[0, [-0.6, 2.1, 5.8, 0, 1.0, -0.6, 48]], [3.6, [0.2, 1.8, 5.2, 0, 1.0, -0.6, 46]]] },
  { at: T.turns - 0.1, K: [[0, [0.5, 1.7, 5.2, 0, 0.95, -0.6, 46]], [3.2, [0.2, 1.6, 5.0, 0, 0.95, -0.6, 46]]] },
  { at: T.s4, K: [[0, [-0.5, 1.7, 5.2, 0, 0.95, -0.6, 46]], [4, [-0.2, 1.6, 5.0, 0, 0.95, -0.6, 46]]] },
  { at: T.s5, K: [[0, [0.5, 1.6, 5.0, 0, 0.95, -0.6, 46]], [4.4, [0.2, 1.7, 5.2, 0, 0.95, -0.6, 46]]] },
  { at: T.s6, K: [[0, [0, 2.4, 6.0, 0, 1.1, -0.6, 50]], [1.0, [0, 2.8, 7.4, 0, 1.6, -1.0, 50]], [4, [0.3, 3.0, 7.8, 0, 1.6, -1.0, 50]]] },
  { at: T.s7, calm: 1, K: [[0, [0.3, 3.0, 7.8, 0, 1.6, -1.0, 50]], [2, [0.5, 3.2, 8.4, 0, 1.6, -1.0, 50]]] },
];

const STEP = 0.36; // seconds per card while the AI reads them
run("graphify-world", (t) => {
  root.visible = t < T.s8 - 0.12; // hide the scene before the CTA fades in
  const wrong = t < T.s3;
  accent.material.color.set(wrong ? (t >= T.read ? RED : VIOLET) : GREEN).multiplyScalar(1.6);
  mScreen.color.set(wrong ? 0x0b0a26 : 0x0a1a1a);

  // wrong way: cards on screen, the AI chip hops card to card, again and again
  const reading = t >= T.read - 0.1 && t < T.where;
  const cur = reading ? Math.floor((t - T.read + 0.1) / STEP) % 6 : -1;
  const into = sm(T.s3, T.s3 + 0.6, t); // Instead: cards collapse into the first six dots
  cards.forEach((c, i) => {
    const pop = i === cur ? Math.sin(Math.PI * Math.min(1, ((t - T.read + 0.1) % STEP) / STEP)) : 0;
    c.visible = t >= S.s1[0] + 0.1 && into < 0.99;
    c.position.copy(SCR(CARD[i][0], CARD[i][1], 0.15 * pop)).lerp(nodes[i].position, into);
    c.scale.setScalar((0.6 + 0.1 * pop) * (1 - into) * sm(0.05 + 0.06 * i, 0.35 + 0.06 * i, t));
    setBand(c, i === cur ? RED : t >= T.read ? 0x8a2030 : VIOLET, i === cur ? 2.0 : 1.1);
  });
  chip.visible = reading || (t >= T.where && wrong);
  if (cur < 0) chip.position.copy(SCR(CARD[0][0], CARD[0][1] + 0.21, 0.32)); // seek-safe park spot after reading
  if (cur >= 0) {
    const nx = Math.floor((t - T.read + 0.1) / STEP) + 1, f = sm(0.7, 1, ((t - T.read + 0.1) % STEP) / STEP), nxt = nx % 6;
    chip.position.copy(SCR(CARD[cur][0], CARD[cur][1] + 0.21, 0.32)).lerp(SCR(CARD[nxt][0], CARD[nxt][1] + 0.21, 0.32), f);
  }
  // "where is it used?" big red question mark above the laptop
  const qk = sm(T.where - 0.05, T.where + 0.25, t) * (1 - sm(T.s3 - 0.1, T.s3 + 0.1, t));
  qm.visible = qk > 0.01; qm.position.set(0, 2.05, -0.3); qm.scale.setScalar(qk * (1 + 0.05 * Math.sin(t * 7))); qm.material.opacity = qk;

  // right way: the graph
  nodes.forEach((n, i) => {
    const on = i < 6 ? sm(T.s3 + 0.3, T.s3 + 0.6, t) : sm(T.turns + 0.06 * (i - 6), T.turns + 0.3 + 0.06 * (i - 6), t);
    let s = on, k = 1.4;
    const ki = KIND_TO.indexOf(i);
    if (ki >= 0) s *= 1 + 0.7 * Math.max(0, 1 - Math.abs(t - KIND_AT[ki] - 0.5) / 0.3); // a file lands in this dot
    s *= 1 + 0.35 * Math.max(0, 1 - Math.abs(t - T.every - 0.04 * i) / 0.25); // every dot pulses
    let hex = COL[n.userData.ty];
    if (t >= T.click && t < T.ask) {
      if (i === CLICK) { s *= 1.3; hex = WHITE; k = 0.6; }
      else if (NB.includes(i) && t >= T.see - 0.1) { s *= 1.3; k = 2.0; }
      else if (t >= T.see - 0.1) k = 0.5;
    }
    if (t >= T.ask && t < T.s7) {
      const hop = PATH.indexOf(i);
      if (hop >= 0 && (hop === 0 || hop === PATH.length - 1 || t >= T.lights + 0.2 * (hop - 1))) { s *= 1.3; hex = hop === 0 || hop === PATH.length - 1 ? ORANGE : GREEN; k = 2.0; }
      else k = 0.6;
    }
    n.visible = s > 0.01; n.scale.setScalar(s); n.material.color.set(hex).multiplyScalar(k);
  });
  edges.forEach((e, i) => {
    const on = sm(T.turns + 0.1 + 0.04 * i, T.turns + 0.4 + 0.04 * i, t);
    e.visible = on > 0.01; e.scale.set(1, on, 1);
    let hex = VIOLET, k = 0.7;
    if (t >= T.see - 0.1 && t < T.ask && NBE.includes(i)) { hex = GREEN; k = 2.2; }
    const hop = PE.indexOf(i);
    if (t >= T.ask && t < T.s7 && hop >= 0 && t >= T.lights + 0.2 * hop) { hex = GREEN; k = 2.4; }
    if (t >= T.click && t < T.s7 && k < 1) k = 0.4;
    e.material.color.set(hex).multiplyScalar(k);
  });

  // s4: one file per kind flies into its dot
  kinds.forEach((c, i) => {
    const a = KIND_AT[i], f = sm(a + 0.15, a + 0.55, t);
    c.visible = t >= a - 0.1 && t < a + 0.55;
    c.position.copy(KIND_FROM[i]).lerp(nodes[KIND_TO[i]].position, f);
    c.scale.setScalar(0.55 * sm(a - 0.1, a + 0.1, t) * (1 - f));
  });

  // s5: cursor clicks the middle dot, then the two ends of the path get rings
  const curOn = t >= T.s5 - 0.05 && t < T.ask;
  cursor.visible = curOn;
  const CP = nodes[CLICK].position;
  cursor.position.copy(v.set(0.9, 0.3, 0.3).add(CP)).lerp(v.copy(CP).add(new THREE.Vector3(0.1, -0.12, 0.12)), sm(T.s5, T.click + 0.25, t));
  const press = Math.max(0, 1 - Math.abs(t - T.click - 0.3) / 0.12);
  cursor.scale.setScalar(1 - 0.25 * press);
  clickRing.visible = t >= T.click + 0.3 && t < T.ask; clickRing.position.copy(CP); clickRing.scale.setScalar(1.3 * sm(T.click + 0.3, T.click + 0.5, t));
  [endA, endB].forEach((r, j) => {
    const k = sm(T.ask + 0.1 * j, T.ask + 0.25 + 0.1 * j, t) * (1 - sm(T.s7 - 0.1, T.s7, t));
    r.visible = k > 0.01; r.position.copy(nodes[PATH[j ? PATH.length - 1 : 0]].position); r.scale.setScalar(k);
  });

  // s6: tool tiles pop in on their names, gone before the end card
  tools.forEach((m, i) => {
    const k = sm(TOOL_AT[i] - 0.1, TOOL_AT[i] + 0.15, t) * (1 - sm(T.s7 - 0.15, T.s7, t));
    m.visible = k > 0.01; m.scale.setScalar(1.1 * k);
  });

  // s3: the star pops in above the laptop while the star count is on screen
  const sk = sm(T.over - 0.1, T.over + 0.25, t) * (1 - sm(T.free - 0.15, T.free + 0.1, t));
  star.visible = sk > 0.01; star.scale.setScalar(0.62 * sk * (1 + 0.08 * Math.sin(t * 6)));
  star.position.set(0, 2.02, -0.3); star.rotation.y = 0.35 * Math.sin((t - T.over) * 2.5);

  const { punch } = shoot(SH, t);
  const spike = overlays(t);
  bloom.strength = 1.0 + 1.2 * punch * punch + spike;
});
