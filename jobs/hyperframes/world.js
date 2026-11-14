// NEVER EDIT VIDEO BY HAND (HyperFrames). Laptop on a dark desk; wrong = dragging red clips on a timeline, right = code -> web page -> video.
import { THREE, S, g, sm, scene, bloom, glow, VIOLET, ORANGE, RED, GREEN, WHITE, tube, shoot, run } from "./kit.js";
import { title, cap, boom, endCard, overlays, fitText } from "./extra.js";

import { RoundedBoxGeometry } from "three/addons/geometries/RoundedBoxGeometry.js";
const std = (c, e, r = 0.45, m = 0.25) => new THREE.MeshStandardMaterial({ color: c, emissive: e, roughness: r, metalness: m });
const rbox = (w, h, d, r, mat) => new THREE.Mesh(new RoundedBoxGeometry(w, h, d, 4, r), mat);
const plane = (w, h, mat) => new THREE.Mesh(new THREE.PlaneGeometry(w, h), mat);
const flat = (hex) => new THREE.MeshBasicMaterial({ color: hex, toneMapped: false });
const mBody = std(0x4a42c8, 0x1c1766, 0.35, 0.35), mDark = std(0x14123a, 0x07061a, 0.6, 0.2), mLav = std(0xc9c0ff, 0x4a3fb0, 0.4, 0.1);
const word = (txt, hex, w, k = 1.0) => { const t = fitText([txt], hex, k, w); t.visible = true; return t; };

// ---------- desk + room lights (as filee) ----------
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
const face = plane(2.4, 1.5, mScreen); face.position.set(0, 0.85, 0.035); lid.add(face);
const bar = plane(2.4, 0.12, glow(VIOLET, 0.35)); bar.position.set(0, 1.54, 0.037); lid.add(bar);
const accent = plane(2.4, 0.015, glow(VIOLET, 1.6)); accent.position.set(0, 1.475, 0.038); lid.add(accent);
[-1.08, -0.98, -0.88].forEach((x, i) => { const d = new THREE.Mesh(new THREE.CircleGeometry(0.025, 16), glow([RED, ORANGE, GREEN][i], 1.2)); d.position.set(x, 1.54, 0.039); lid.add(d); });
const onScreen = (o, x, y, z = 0.04) => { o.position.set(x, y, z); lid.add(o); return o; };

// ---------- s1-s2: video editor (viewer + 3-track timeline of red clips) ----------
const ed = new THREE.Group(); lid.add(ed);
const viewer = plane(1.0, 0.56, flat(0x05041a)); viewer.position.set(0, 1.13, 0.04); ed.add(viewer);
const vFrame = new THREE.LineSegments(new THREE.EdgesGeometry(new THREE.PlaneGeometry(1.0, 0.56)), new THREE.LineBasicMaterial({ color: new THREE.Color(RED).multiplyScalar(1.3), toneMapped: false }));
vFrame.position.set(0, 1.13, 0.041); ed.add(vFrame);
const vPlay = new THREE.Mesh(new THREE.CircleGeometry(0.1, 3), glow(WHITE, 0.8)); vPlay.position.set(0, 1.13, 0.042); ed.add(vPlay);
const tlBg = plane(2.3, 0.66, flat(0x120f34)); tlBg.position.set(0, 0.47, 0.039); ed.add(tlBg);
const TRK = [0.68, 0.47, 0.26];
const mClip = [std(0xff3a4a, 0x7a1020), std(0xff7a3a, 0x7a3010), std(0xe0407a, 0x701030)];
const CL = [[0, -0.75, 0.5], [0, -0.1, 0.6], [0, 0.62, 0.5], [1, -0.6, 0.7], [1, 0.3, 0.5], [1, 0.88, 0.32], [2, -0.82, 0.38], [2, -0.2, 0.55], [2, 0.5, 0.6]];
const SHUF = [0.5, -0.45, -0.3, 0.55, -0.5, -0.25, 0.4, 0.45, -0.6]; // where each clip lands when "it all" gets redone
const clips = CL.map(([tr, x, w], i) => { const c = rbox(w - 0.04, 0.16, 0.03, 0.02, mClip[i % 3]); c.position.set(x, TRK[tr], 0.05); ed.add(c); c.userData = { x, w }; return c; });
[[1, "CUT"], [3, "CAPTION"], [7, "ZOOM"]].forEach(([i, txt]) => { const t = word(txt, WHITE, clips[i].userData.w * 0.85); t.position.z = 0.02; clips[i].add(t); });
const playhead = plane(0.014, 0.66, glow(WHITE, 1.2)); playhead.position.set(0, 0.47, 0.07); ed.add(playhead);
const cursor = new THREE.Mesh(new THREE.ConeGeometry(0.06, 0.18, 3), glow(WHITE, 1.4)); cursor.rotation.z = 0.5; ed.add(cursor);
// clock in the viewer on "hours"
const clock = new THREE.Group(); clock.position.set(0, 1.13, 0.045); ed.add(clock);
clock.add(new THREE.Mesh(new THREE.TorusGeometry(0.2, 0.018, 8, 48), glow(RED, 1.8)));
const hH = tube([0, 0, 0], [0, 0.11, 0], 0.025, glow(WHITE, 1.2)), hM = tube([0, 0, 0], [0, 0.16, 0], 0.018, glow(WHITE, 1.2));
const pivH = new THREE.Group(), pivM = new THREE.Group(); pivH.add(hH); pivM.add(hM); clock.add(pivH, pivM);

// ---------- s3: code typed on the screen ----------
function codeLine(txt, hex) {
  const c = document.createElement("canvas"); c.width = 1024; c.height = 80; const x = c.getContext("2d");
  x.fillStyle = "#fff"; x.textBaseline = "middle"; x.font = `700 46px "DejaVu Sans Mono", Menlo, monospace`; x.fillText(txt, 8, 42);
  const m = plane(2.2, 2.2 * 80 / 1024, new THREE.MeshBasicMaterial({ map: new THREE.CanvasTexture(c), color: new THREE.Color(hex).multiplyScalar(0.9), transparent: true, toneMapped: false, depthWrite: false }));
  m.renderOrder = 10; return m;
}
const CODE = [['<div id="intro" data-start="0">', VIOLET], ['  <h1 class="clip">LAUNCH</h1>', GREEN], ['  <img src="product.png">', GREEN], ["</div>", VIOLET], ["<script>", VIOLET], ['  tl.from("h1", { y: 80 })', 0xb8b0ff], ["</script>", VIOLET]];
const code = CODE.map(([t, h], i) => onScreen(codeLine(t, h), 0, 1.36 - i * 0.165, 0.045));

// ---------- s4: the request, then the web page, then the video ----------
const ask = new THREE.Group(); onScreen(ask, 0, 0.88, 0.045);
ask.add(rbox(2.0, 0.42, 0.03, 0.08, std(0x6a5cf0, 0x2a2090)));
const askT = word("10-SECOND PRODUCT INTRO", WHITE, 1.8); askT.position.z = 0.02; ask.add(askT);
const page = new THREE.Group(); onScreen(page, 0, 0, 0.045);
const head = word("LAUNCH DAY", WHITE, 1.1, 1.2); head.position.set(-0.45, 1.05, 0.01); page.add(head);
const sub = plane(0.9, 0.04, flat(0x6a5fd0)); sub.position.set(-0.45, 0.8, 0.01); page.add(sub);
const btn = rbox(0.5, 0.18, 0.03, 0.06, std(0x1f9a5a, 0x0f5a33)); btn.position.set(-0.45, 0.55, 0.02); page.add(btn);
const btnT = word("BUY", WHITE, 0.3); btnT.position.z = 0.02; btn.add(btnT);
const img = rbox(0.75, 0.75, 0.04, 0.06, mLav); img.position.set(0.55, 0.82, 0.02); page.add(img);
const prod = rbox(0.28, 0.4, 0.06, 0.05, std(0xff7a3a, 0x7a3010)); prod.position.set(0.55, 0.8, 0.06); page.add(prod);
// video overlay: film sprockets, play button, progress bar
const film = new THREE.Group(); onScreen(film, 0, 0, 0.05);
[0.22, 1.42].forEach((y) => { for (let i = 0; i < 11; i++) { const h = plane(0.1, 0.06, flat(0x05041a)); h.position.set(-1.0 + i * 0.2, y, 0); film.add(h); } const s = plane(2.4, 0.12, glow(VIOLET, 0.5)); s.position.set(0, y, -0.002); film.add(s); });
const play = new THREE.Mesh(new THREE.CircleGeometry(0.13, 3), glow(GREEN, 1.3)); play.position.set(0.55, 0.82, 0.04); film.add(play);
const progBg = plane(2.0, 0.035, flat(0x2a2470)); progBg.position.set(0, 0.32, 0.005); film.add(progBg);
const progG = new THREE.PlaneGeometry(2.0, 0.035); progG.translate(1.0, 0, 0);
const prog = new THREE.Mesh(progG, glow(GREEN, 1.4)); prog.position.set(-1.0, 0.32, 0.008); film.add(prog);

// ---------- s5: ready-made pieces: captions, charts, maps, then a burst of blocks ----------
function block() { const b = new THREE.Group(); b.add(rbox(0.62, 0.62, 0.08, 0.06, mBody)); const f = plane(0.52, 0.52, flat(0x0b0a26)); f.position.z = 0.045; b.add(f); scene.add(b); b.visible = false; return b; }
const bCap = block(), bChart = block(), bMap = block();
const pill = rbox(0.46, 0.13, 0.03, 0.06, std(0xffffff, 0x666666, 0.5, 0)); pill.position.set(0, -0.12, 0.06); bCap.add(pill);
const pillT = word("Hello!", 0x111111, 0.3); pillT.position.z = 0.02; pill.add(pillT);
const capFace = new THREE.Mesh(new THREE.CircleGeometry(0.1, 24), mLav); capFace.position.set(0, 0.1, 0.05); bCap.add(capFace);
[0.12, 0.2, 0.3, 0.4].forEach((h, i) => { const b = rbox(0.08, h, 0.04, 0.015, std(0x3dff8a, 0x1f8a4a)); b.position.set(-0.15 + i * 0.1, -0.2 + h / 2, 0.06); bChart.add(b); });
for (let i = -2; i <= 2; i++) { const a = plane(0.5, 0.008, glow(VIOLET, 0.8)); a.position.set(0, i * 0.1, 0.05); bMap.add(a); const b = plane(0.008, 0.5, glow(VIOLET, 0.8)); b.position.set(i * 0.1, 0, 0.05); bMap.add(b); }
const pin = new THREE.Group(); pin.position.set(0.04, 0.0, 0.1); bMap.add(pin);
const pinTip = new THREE.Mesh(new THREE.ConeGeometry(0.05, 0.12, 16), glow(ORANGE, 1.4)); pinTip.rotation.z = Math.PI; pinTip.position.y = 0.0; pin.add(pinTip);
const pinHead = new THREE.Mesh(new THREE.SphereGeometry(0.06, 16, 12), glow(ORANGE, 1.4)); pinHead.position.y = 0.08; pin.add(pinHead);
const BLOCKS = [bCap, bChart, bMap];
const TILE_HEX = [GREEN, VIOLET, ORANGE];
const tiles = Array.from({ length: 16 }, (_, i) => { const m = new THREE.Group(); m.add(rbox(0.36, 0.36, 0.06, 0.04, mBody)); const s = plane(0.26, 0.07, glow(TILE_HEX[i % 3], 1.0)); s.position.set(0, -0.06, 0.035); m.add(s); const s2 = plane(0.18, 0.04, flat(0x6a5fd0)); s2.position.set(-0.03, 0.06, 0.035); m.add(s2); scene.add(m); m.visible = false; return m; });

// ---------- s6: two renders of the same video, side by side ----------
function videoCard() {
  const c = new THREE.Group(); c.add(rbox(1.3, 0.9, 0.06, 0.06, mBody));
  const f = plane(1.2, 0.8, flat(0x0a1a1a)); f.position.z = 0.035; c.add(f);
  const h = word("LAUNCH DAY", WHITE, 0.6, 1.2); h.position.set(-0.27, 0.12, 0.04); c.add(h);
  const p = rbox(0.18, 0.26, 0.04, 0.03, std(0xff7a3a, 0x7a3010)); p.position.set(0.32, 0.08, 0.05); c.add(p);
  const bg = plane(1.1, 0.03, flat(0x2a2470)); bg.position.set(0, -0.3, 0.04); c.add(bg);
  const pg = new THREE.PlaneGeometry(1.1, 0.03); pg.translate(0.55, 0, 0); const pr = new THREE.Mesh(pg, glow(GREEN, 1.4)); pr.position.set(-0.55, -0.3, 0.045); c.add(pr);
  c.userData.pr = pr; scene.add(c); c.visible = false; return c;
}
const cards = [videoCard(), videoCard()];
const eq = new THREE.Group(); [0.07, -0.07].forEach((y) => { const b = rbox(0.3, 0.07, 0.04, 0.02, glow(GREEN, 1.3)); b.position.y = y; eq.add(b); }); scene.add(eq);
const check = new THREE.Group(); check.add(tube([-0.18, 0, 0], [-0.05, -0.14, 0], 0.06, glow(GREEN, 1.5)), tube([-0.05, -0.14, 0], [0.24, 0.2, 0], 0.06, glow(GREEN, 1.5))); scene.add(check);

// ---------- s3: GitHub star (as filee) ----------
const starShape = new THREE.Shape();
for (let i = 0; i < 10; i++) { const a = Math.PI / 2 + (i * Math.PI) / 5, r = i % 2 ? 0.17 : 0.4; starShape[i ? "lineTo" : "moveTo"](Math.cos(a) * r, Math.sin(a) * r); }
const star = new THREE.Mesh(new THREE.ExtrudeGeometry(starShape, { depth: 0.08, bevelEnabled: true, bevelSize: 0.03, bevelThickness: 0.03, bevelSegments: 2 }), glow(ORANGE, 1.5));
scene.add(star);

// ---------- captions ----------
title("NEVER EDIT VIDEO BY HAND");
cap("s1", "exploring", ["EXPLORING GITHUB REPOS"], WHITE, { until: "s1" });
cap("s2", "every", ["CUT, CAPTION, ZOOM", "ALL BY HAND"], RED, { until: ["s2", "one"] });
cap("s2", "one", ["ONE CHANGE?", "DO IT ALL AGAIN"], RED, { boom: 0.5 });
cap("s3", "hyperframes", ["HYPERFRAMES"], GREEN, { until: ["s3", "over"], boom: 0.5 });
cap("s3", "over", ["OVER 84,000 STARS", "IN 8 MONTHS"], ORANGE, { until: ["s3", "it's"], boom: 0.5 });
cap("s3", "it's", ["FREE ON GITHUB"], GREEN, { until: ["s3", "your"] });
cap("s3", "your", ["AI MAKES THE VIDEO"], GREEN, { until: ["s3", "writing"] });
cap("s3", "writing", ["BY WRITING CODE"], GREEN);
cap("s4", "ask", ["10-SECOND PRODUCT INTRO"], VIOLET, { until: ["s4", "builds"] });
cap("s4", "builds", ["IT BUILDS A WEB PAGE"], VIOLET, { until: ["s4", "turns"] });
cap("s4", "turns", ["THE PAGE TURNS", "INTO A VIDEO"], GREEN, { boom: 0.5 });
cap("s5", "captions", ["CAPTIONS"], VIOLET, { until: ["s5", "charts"] });
cap("s5", "charts", ["CHARTS"], VIOLET, { until: ["s5", "maps"] });
cap("s5", "maps", ["MAPS"], VIOLET, { until: ["s5", "about"] });
cap("s5", "about", ["ABOUT 450", "READY-MADE PIECES"], GREEN, { boom: 0.5 });
cap("s6", "make", ["MAKE IT TWICE"], VIOLET, { until: ["s6", "exact"] });
cap("s6", "exact", ["EXACT SAME VIDEO"], GREEN, { until: ["s6", "it's"], boom: 0.4 });
cap("s6", "it's", ["MADE BY HEYGEN"], GREEN);
endCard(["DON'T DRAG THE CLIPS.", "WRITE THE VIDEO."]);
boom("s2", "change", 0.6);

// ---------- timings (global seconds) ----------
const T = {
  drag: g("s1", "drag"), hours: g("s1", "hours"), s2: S.s2[0], cut: g("s2", "cut"), capt: g("s2", "caption"), zoom: g("s2", "zoom"),
  change: g("s2", "change"), again: g("s2", "all"), s3: S.s3[0], over: g("s3", "over"), free: g("s3", "it's"), writing: g("s3", "writing"),
  s4: S.s4[0], builds: g("s4", "builds"), turns: g("s4", "turns"), s5: S.s5[0], charts: g("s5", "charts"), maps: g("s5", "maps"), about: g("s5", "about"),
  s6: S.s6[0], twice: g("s6", "twice"), exact: g("s6", "exact"), made: g("s6", "made"), s7: S.s7[0], s8: S.s8[0],
};

// ---------- shots: [cx,cy,cz, lx,ly,lz, fov] ----------
const SH = [
  { at: 0, K: [[0, [0.3, 1.8, 5.6, 0, 0.9, -0.5, 48]], [T.s2, [0.1, 1.8, 5.0, 0, 1.0, -0.6, 48]]] },
  { at: T.s2, K: [[0, [0.25, 1.35, 4.9, 0, 0.8, -0.8, 46]], [4.7, [-0.1, 1.3, 4.6, 0, 0.8, -0.8, 46]]] },
  { at: T.s3, K: [[0, [-0.6, 2.1, 5.8, 0, 1.0, -0.6, 48]], [3.6, [0.2, 1.8, 5.2, 0, 1.0, -0.6, 46]], [8.6, [0, 1.7, 5.0, 0, 0.95, -0.6, 46]]] },
  { at: T.s4, K: [[0, [0.5, 1.7, 5.4, 0, 0.95, -0.6, 46]], [4.9, [0.2, 1.6, 5.0, 0.1, 0.95, -0.6, 46]]] },
  { at: T.s5, K: [[0, [-0.4, 1.7, 5.7, 0, 1.0, -0.4, 48]], [2.0, [-0.1, 1.7, 5.5, 0, 1.0, -0.4, 48]]] },
  { at: T.about, K: [[0, [0, 2.6, 5.5, 0, 1.0, -0.6, 50]], [0.9, [0, 2.8, 7.4, 0, 1.75, -1.2, 50]], [2.0, [0.3, 3.0, 7.8, 0, 1.8, -1.2, 50]]] },
  { at: T.s6, K: [[0, [0.3, 3.0, 7.8, 0, 1.9, -1.0, 50]], [4.3, [0.1, 2.9, 7.3, 0, 1.9, -1.0, 50]]] },
  { at: T.s7, calm: 1, K: [[0, [0.3, 2.4, 6.6, 0, 1.2, -0.8, 48]], [4, [0.5, 2.5, 7.0, 0, 1.2, -0.8, 48]]] },
];

run("hyperframes-world", (t) => {
  const wrong = t < T.s3;
  accent.material.color.set(wrong ? RED : GREEN).multiplyScalar(1.6);
  mScreen.color.set(wrong ? 0x0b0a26 : 0x0a1a1a);

  // editor: playhead runs, a clip gets dragged back and forth, then s2 names three clips and one change scrambles them all
  ed.visible = wrong;
  playhead.position.x = -1.1 + ((t * 0.35) % 2.2);
  const shake = sm(T.change - 0.05, T.change + 0.15, t), redo = sm(T.again - 0.1, T.again + 0.5, t);
  clips.forEach((c, i) => {
    let x = c.userData.x;
    if (i === 8) x += 0.28 * Math.sin(Math.max(0, t - T.drag) * 3.2) * sm(T.drag - 0.1, T.drag + 0.2, t) * (1 - sm(T.s2 - 0.3, T.s2, t));
    x += SHUF[i] * redo;
    c.position.x = x;
    c.rotation.z = shake * (1 - redo) * 0.12 * Math.sin(t * 40 + i * 1.7);
    c.position.y = TRK[CL[i][0]] + shake * (1 - redo) * 0.02 * Math.sin(t * 33 + i);
    const pick = [[1, T.cut], [3, T.capt], [7, T.zoom]].find(([j]) => j === i);
    c.scale.setScalar(1 + (pick ? 0.25 * Math.max(0, 1 - Math.abs(t - pick[1] - 0.1) / 0.35) : 0));
  });
  // cursor: on the dragged clip in s1, then hops to CUT / CAPTION / ZOOM
  let cx = clips[8].position.x, cy = TRK[2];
  if (t >= T.s2) {
    const stops = [[T.s2, clips[8].position.x, TRK[2]], [T.cut, clips[1].position.x, TRK[0]], [T.capt, clips[3].position.x, TRK[1]], [T.zoom, clips[7].position.x, TRK[2]], [T.again, 0.6, 0.2]];
    for (let k = 1; k < stops.length; k++) { const [t0, x0, y0] = stops[k - 1], [t1, x1, y1] = stops[k]; const u = sm(t1 - 0.35, t1, t); if (t >= t1 - 0.35) { cx = x0 + (x1 - x0) * u; cy = y0 + (y1 - y0) * u; } }
  }
  cursor.position.set(cx + 0.08, cy - 0.08, 0.1);
  cursor.visible = t >= T.drag - 0.3;
  clock.visible = t >= T.hours - 0.15; clock.scale.setScalar(sm(T.hours - 0.15, T.hours + 0.15, t)); vPlay.visible = !clock.visible;
  pivH.rotation.z = -t * 1.2; pivM.rotation.z = -t * 14;

  // s3: code lines type in, one by one, the last on "code"
  code.forEach((m, i) => { const t0 = T.s3 + 0.15 + i * ((T.writing - T.s3 - 0.15) / (code.length - 1)); m.visible = t >= t0 - 0.05 && t < T.s4; m.material.opacity = sm(t0 - 0.05, t0 + 0.15, t); });

  // s4: the request, then the page, then the page plays as a video (stays on the laptop to the end)
  const ak = sm(T.s4 - 0.05, T.s4 + 0.25, t) * (1 - sm(T.builds - 0.2, T.builds, t));
  ask.visible = ak > 0.01; ask.scale.setScalar(0.6 + 0.4 * ak);
  page.visible = t >= T.builds - 0.05;
  const pg = sm(T.builds - 0.05, T.builds + 0.3, t);
  page.scale.setScalar(0.7 + 0.3 * pg); page.position.set(0, 0.85 * (1 - (0.7 + 0.3 * pg)), 0.045);
  const isVid = sm(T.turns - 0.05, T.turns + 0.25, t);
  film.visible = isVid > 0.01; film.scale.set(1, 0.6 + 0.4 * isVid, 1); film.position.y = 0.85 * (1 - (0.6 + 0.4 * isVid));
  play.visible = t < T.turns + 0.6; play.scale.setScalar(1 + 0.4 * Math.max(0, 1 - Math.abs(t - T.turns - 0.3) / 0.3));
  prog.scale.x = Math.max(0.001, sm(T.turns, T.s5 - 0.1, t)) * (t < T.s5 ? 1 : 0) + (t >= T.s5 ? Math.max(0.001, ((t - T.s5) / 3) % 1) : 0);
  head.position.y = 1.05 - 0.25 * (1 - sm(T.turns + 0.1, T.turns + 0.6, t)) * isVid; head.material.opacity = t < T.turns ? 1 : sm(T.turns + 0.05, T.turns + 0.5, t);

  // s5: captions / charts / maps blocks pop in front of the screen, then shrink as 16 pieces burst out
  const startB = [T.s5, T.charts, T.maps], out = sm(T.about - 0.1, T.about + 0.25, t);
  BLOCKS.forEach((b, i) => {
    const k = sm(startB[i] - 0.1, startB[i] + 0.2, t) * (1 - out);
    b.visible = k > 0.01; b.scale.setScalar(k); b.position.set(-0.78 + 0.78 * i, 1.0 + 0.04 * Math.sin(t * 3 + i), 0.25); b.rotation.y = 0.15 * Math.sin(t * 1.5 + i);
  });
  pin.position.y = 0.0 + 0.05 * Math.abs(Math.sin(t * 5));
  tiles.forEach((m, i) => {
    const k = sm(T.about + 0.03 * i, T.about + 0.35 + 0.03 * i, t) * (1 - sm(T.s6 - 0.2, T.s6 + 0.1, t));
    m.visible = k > 0.01;
    const a = (i / tiles.length) * Math.PI * 2 + t * 0.25;
    m.position.set(Math.cos(a) * 1.9, 1.0 + Math.sin(a) * 1.25, -1.6); m.scale.setScalar(k);
  });

  // s6: two renders of the same video, both play in lock step; "=" between, check on "made"
  [T.s6, T.twice].forEach((t0, i) => {
    const c = cards[i], k = sm(t0 - 0.1, t0 + 0.25, t) * (1 - sm(T.s7 - 0.15, T.s7, t));
    c.visible = k > 0.01; c.scale.setScalar(k); c.position.set(i ? 0.95 : -0.95, 2.95, -0.6);
    c.userData.pr.scale.x = Math.max(0.001, sm(T.twice + 0.2, T.s7 - 0.3, t));
  });
  const ek = sm(T.exact - 0.1, T.exact + 0.2, t) * (1 - sm(T.s7 - 0.15, T.s7, t));
  eq.visible = ek > 0.01; eq.scale.setScalar(ek * (1 + 0.15 * Math.max(0, 1 - Math.abs(t - T.exact - 0.4) / 0.3))); eq.position.set(0, 2.95, -0.5);
  const ck = sm(T.made - 0.1, T.made + 0.2, t) * (1 - sm(T.s7 - 0.15, T.s7, t));
  check.visible = ck > 0.01; check.scale.setScalar(ck); check.position.set(0, 3.75, -0.5);

  // s3: the star pops in above the laptop while the star count is on screen
  const sk = sm(T.over - 0.1, T.over + 0.25, t) * (1 - sm(T.free - 0.15, T.free + 0.1, t));
  star.visible = sk > 0.01; star.scale.setScalar(0.56 * sk * (1 + 0.08 * Math.sin(t * 6)));
  star.position.set(0, 1.96, -0.3); star.rotation.y = 0.35 * Math.sin((t - T.over) * 2.5);

  const { punch } = shoot(SH, t);
  const spike = overlays(t);
  bloom.strength = 1.0 + 1.2 * punch * punch + spike;
});
