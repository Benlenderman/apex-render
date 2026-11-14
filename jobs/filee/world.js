// NEVER UPLOAD YOUR FILES (Filee). Laptop on a dark desk; wrong = file flies to a stranger's server, right = local ring menu.
import { THREE, S, g, sm, scene, bloom, glow, box, tube, VIOLET, ORANGE, RED, GREEN, WHITE, mSolid,
  textPlane, label, beam, shoot, run } from "./kit.js";
import { title, cap, boom, endCard, overlays, fitText } from "./extra.js";

import { RoundedBoxGeometry } from "three/addons/geometries/RoundedBoxGeometry.js";
const std = (c, e, r = 0.45, m = 0.25) => new THREE.MeshStandardMaterial({ color: c, emissive: e, roughness: r, metalness: m });
const rbox = (w, h, d, r, mat) => new THREE.Mesh(new RoundedBoxGeometry(w, h, d, 4, r), mat);
const mBody = std(0x4a42c8, 0x1c1766, 0.35, 0.35), mDark = std(0x14123a, 0x07061a, 0.6, 0.2), mLav = std(0xc9c0ff, 0x4a3fb0, 0.4, 0.1);

// ---------- desk + room lights ----------
const desk = rbox(9, 0.3, 5, 0.12, std(0x221d66, 0x0c0a30, 0.7, 0.1)); desk.position.set(0, -0.14, -0.6); scene.add(desk);
const pl = new THREE.PointLight(0xe8e2ff, 18, 9, 1.6); pl.position.set(-1.6, 3.2, 2.2); scene.add(pl);
const rim = new THREE.PointLight(0xff8a3a, 10, 8, 1.6); rim.position.set(2.6, 2.2, -2.4); scene.add(rim);
const lampGlow = new THREE.Mesh(new THREE.SphereGeometry(0.09, 16, 12), glow(WHITE, 1.6)); lampGlow.position.copy(pl.position); scene.add(lampGlow);

// ---------- laptop at the origin, screen faces +z ----------
const base = rbox(2.6, 0.1, 1.7, 0.04, mBody); base.position.set(0, 0.05, 0); scene.add(base);
const keys = rbox(2.2, 0.02, 0.8, 0.01, mDark); keys.position.set(0, 0.105, -0.2); scene.add(keys);
const pad = rbox(0.8, 0.02, 0.45, 0.01, mDark); pad.position.set(0, 0.105, 0.5); scene.add(pad);
const lid = new THREE.Group(); lid.position.set(0, 0.1, -0.85); lid.rotation.x = -0.12; scene.add(lid);
const screen = rbox(2.6, 1.7, 0.06, 0.04, mBody); screen.position.set(0, 0.85, 0); lid.add(screen);
const mScreen = new THREE.MeshBasicMaterial({ color: 0x0b0a26, toneMapped: false });
const face = new THREE.Mesh(new THREE.PlaneGeometry(2.4, 1.5), mScreen); face.position.set(0, 0.85, 0.035); lid.add(face);
// screen UI: a window bar + a thin accent line under it
const bar = new THREE.Mesh(new THREE.PlaneGeometry(2.4, 0.12), glow(VIOLET, 0.35)); bar.position.set(0, 1.54, 0.037); lid.add(bar);
const accent = new THREE.Mesh(new THREE.PlaneGeometry(2.4, 0.015), glow(VIOLET, 1.6)); accent.position.set(0, 1.475, 0.038); lid.add(accent);
[-1.08, -0.98, -0.88].forEach((x, i) => { const d = new THREE.Mesh(new THREE.CircleGeometry(0.025, 16), glow([RED, ORANGE, GREEN][i], 1.2)); d.position.set(x, 1.54, 0.039); lid.add(d); });
const SCR = (x, y) => new THREE.Vector3(x, 0.1 + y, -0.85 + 0.12 * y + 0.25); // point just in front of the screen

// ---------- file icons: lavender card, colored band, orange folded corner ----------
function makeFile(hex, txt) {
  const gp = new THREE.Group();
  const b = rbox(0.56, 0.72, 0.06, 0.05, mLav); gp.add(b);
  const band = new THREE.Mesh(new THREE.PlaneGeometry(0.46, 0.2), glow(hex, 1.1)); band.position.set(0, -0.12, 0.032); gp.add(band);
  const corner = new THREE.Mesh(new THREE.CircleGeometry(0.09, 3), glow(ORANGE, 1.4)); corner.position.set(0.19, 0.27, 0.033); corner.rotation.z = Math.PI / 4; gp.add(corner);
  [0.14, 0.06].forEach((y) => { const l = new THREE.Mesh(new THREE.PlaneGeometry(0.3, 0.025), new THREE.MeshBasicMaterial({ color: 0x6a5fd0 })); l.position.set(-0.05, y, 0.032); gp.add(l); });
  const t = fitText([txt], WHITE, 1.0, 0.4); t.visible = true; t.position.set(0, -0.12, 0.034); gp.add(t);
  gp.userData.band = band;
  scene.add(gp); gp.visible = false;
  return gp;
}
const setBand = (f, hex) => f.userData.band.material.color.set(hex).multiplyScalar(1.1);
const pdf = makeFile(RED, "PDF");
const docx = makeFile(GREEN, "DOCX");
const copies = [makeFile(RED, "PDF"), makeFile(RED, "PDF"), makeFile(RED, "PDF")];

// ---------- the stranger's server, up and behind ----------
const SV = new THREE.Vector3(0.9, 4.6, -5.5);
const server = new THREE.Group(); server.position.copy(SV); scene.add(server);
const rack = rbox(1.6, 2.6, 1.2, 0.12, mBody); server.add(rack);
for (let i = 0; i < 5; i++) {
  const u = rbox(1.36, 0.36, 0.06, 0.04, mDark); u.position.set(0, -0.95 + i * 0.48, 0.6); server.add(u);
  const led = new THREE.Mesh(new THREE.SphereGeometry(0.045, 12, 8), glow(RED, 2.2)); led.position.set(0.5, -0.95 + i * 0.48, 0.65); server.add(led);
}
const svLight = new THREE.PointLight(0xff3040, 14, 6, 1.6); svLight.position.set(0, 0, 1.4); server.add(svLight);
const upBeam = beam(RED, 1.6, 0.04);
const cross = [tube([-1, -1.4, 0.7], [1, 1.4, 0.7], 0.12, glow(RED, 2.4)), tube([1, -1.4, 0.7], [-1, 1.4, 0.7], 0.12, glow(RED, 2.4))];
cross.forEach((c) => server.add(c));

// ---------- ring menu + cursor ----------
const FORMATS = ["DOCX", "PNG", "MP3", "JPG", "TXT", "MP4"];
const ring = new THREE.Group(); scene.add(ring);
const torus = new THREE.Mesh(new THREE.TorusGeometry(0.62, 0.02, 8, 64), glow(VIOLET, 1.6)); ring.add(torus);
const slots = FORMATS.map((f, i) => {
  const a = Math.PI / 2 - (i * Math.PI * 2) / 6, s = new THREE.Group();
  s.position.set(Math.cos(a) * 0.62, Math.sin(a) * 0.62, 0.02);
  const d = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.2, 0.06, 32), i ? mBody : std(0x1f7a4a, 0x0f5a33, 0.4, 0.2)); d.rotation.x = Math.PI / 2; s.add(d);
  const r = new THREE.Mesh(new THREE.TorusGeometry(0.2, 0.012, 6, 32), glow(i ? VIOLET : GREEN, i ? 1.2 : 2.0)); r.position.z = 0.03; s.add(r);
  const t = fitText([f], WHITE, 1.0, 0.3); t.visible = true; t.position.z = 0.035; s.add(t);
  ring.add(s); return s;
});
const cursor = new THREE.Mesh(new THREE.ConeGeometry(0.07, 0.2, 3), glow(WHITE, 1.4)); cursor.rotation.z = 0.5; scene.add(cursor);

// ---------- s6: a burst of file types around the laptop ----------
const TYPES = ["PDF", "DOCX", "PNG", "MP4", "MP3", "JPG", "GIF", "WAV", "SVG", "EPUB", "MOV", "WEBP", "CSV", "HEIC", "FLAC", "ZIP"];
const tiles = TYPES.map((f, i) => { const m = makeFile(i % 3 ? VIOLET : GREEN, f); m.scale.setScalar(0.6); return m; });

// ---------- s3: GitHub star ----------
const starShape = new THREE.Shape();
for (let i = 0; i < 10; i++) { const a = Math.PI / 2 + (i * Math.PI) / 5, r = i % 2 ? 0.17 : 0.4; starShape[i ? "lineTo" : "moveTo"](Math.cos(a) * r, Math.sin(a) * r); }
const star = new THREE.Mesh(new THREE.ExtrudeGeometry(starShape, { depth: 0.08, bevelEnabled: true, bevelSize: 0.03, bevelThickness: 0.03, bevelSegments: 2 }), glow(ORANGE, 1.5));
scene.add(star);

// ---------- captions ----------
title("NEVER UPLOAD YOUR FILES");
cap("s1", "random", ["RANDOM WEBSITE?"], RED, { until: ["s1", "exploring"] });
cap("s1", "exploring", ["EXPLORING GITHUB REPOS"], WHITE, { until: "s1" });
cap("s2", "stranger's", ["STRANGER'S SERVER"], RED, { until: ["s2", "who"] });
cap("s2", "who", ["WHO KEEPS A COPY?"], RED, { boom: 0.5 });
cap("s3", "filee", ["FILEE"], GREEN, { until: ["s3", "almost"], boom: 0.5 });
cap("s3", "almost", ["ALMOST 27,000 STARS", "IN 7 WEEKS"], ORANGE, { until: ["s3", "free"], boom: 0.5 });
cap("s3", "free", ["FREE ON GITHUB"], GREEN, { until: ["s3", "converts"] });
cap("s3", "converts", ["ON YOUR COMPUTER"], GREEN);
cap("s4", "hold", ["HOLD A KEY"], VIOLET, { until: ["s4", "drag"] });
cap("s4", "drag", ["DRAG THE FILE"], VIOLET, { until: ["s4", "circle"] });
cap("s4", "circle", ["CIRCLE MENU"], VIOLET, { boom: 0.4 });
cap("s5", "drop", ["DROP ON A FORMAT"], GREEN, { until: ["s5", "new"], boom: 0.5 });
cap("s5", "new", ["NEW FILE, RIGHT NEXT TO IT"], GREEN);
cap("s6", "270", ["270 FILE TYPES"], GREEN, { until: ["s6", "nothing"], boom: 0.5 });
cap("s6", "nothing", ["NOTHING UPLOADED"], GREEN, { until: ["s6", "works"] });
cap("s6", "works", ["FULLY OFFLINE"], GREEN);
endCard(["DON'T UPLOAD IT.", "JUST DROP IT."]);
boom("s2", "lands", 0.6);

// ---------- timings (global seconds) ----------
const T = {
  pdfIn: S.s1[0] + 0.1, up: g("s1", "random"), land: g("s2", "lands"), copy: g("s2", "copy"),
  s3: S.s3[0], almost: g("s3", "almost"), free: g("s3", "free"), hold: g("s4", "hold"), drag: g("s4", "drag"), circle: g("s4", "circle"), mouse: g("s4", "mouse"),
  drop: g("s5", "drop"), nw: g("s5", "new"), orig: g("s5", "original"),
  n270: g("s6", "270"), nothing: g("s6", "nothing"), off: g("s6", "offline"), s7: S.s7[0],
};
const HOME = SCR(-0.55, 0.95), DRAG = SCR(0.35, 0.8), NEXT = SCR(0.15, 0.95);
const v = new THREE.Vector3(), v2 = new THREE.Vector3();
const lerp3 = (a, b, k, out) => out.copy(a).lerp(b, k);

// ---------- shots: [cx,cy,cz, lx,ly,lz, fov] ----------
const SH = [
  { at: 0, K: [[0, [0.3, 1.8, 5.6, 0, 0.9, -0.5, 48]], [S.s2[0], [0.1, 1.8, 5.0, 0, 1.0, -0.6, 48]]] },
  { at: T.up, K: [[0, [2.4, 1.6, 5.4, 0.5, 3.1, -2.6, 58]], [3.0, [2.8, 2.0, 5.8, 0.6, 3.5, -3.2, 58]]] },
  { at: T.copy - 0.3, K: [[0, [2.8, 4.2, 1.6, 1.4, 4.4, -5.0, 54]], [2.0, [2.5, 4.4, 1.0, 1.4, 4.4, -5.0, 52]]] },
  { at: T.s3, K: [[0, [-0.6, 2.1, 5.8, 0, 1.0, -0.6, 48]], [3.6, [0.2, 1.8, 5.2, 0, 1.0, -0.6, 46]]] },
  { at: S.s4[0], K: [[0, [0.5, 1.7, 5.4, 0, 0.95, -0.6, 46]], [3.5, [0.3, 1.6, 5.0, 0.1, 0.95, -0.6, 46]]] },
  { at: S.s5[0], K: [[0, [-0.5, 1.7, 5.2, 0, 0.95, -0.6, 46]], [3.4, [-0.2, 1.8, 5.4, -0.1, 1.0, -0.6, 46]]] },
  { at: S.s6[0], K: [[0, [0, 2.6, 5.5, 0, 1.0, -0.6, 50]], [0.9, [0, 2.8, 7.4, 0, 1.75, -1.2, 50]], [3.7, [0.3, 3.0, 7.8, 0, 1.8, -1.2, 50]]] },
  { at: T.s7, calm: 1, K: [[0, [0.3, 3.0, 7.8, 0, 1.8, -1.2, 50]], [4, [0.5, 3.2, 8.4, 0, 1.8, -1.2, 50]]] },
];

run("filee-world", (t) => {
  const wrong = t < T.s3, done = t >= T.nw;
  // screen tint: red alert while uploading, green accent from s3
  accent.material.color.set(wrong ? (t >= T.up ? RED : VIOLET) : GREEN).multiplyScalar(1.6);
  mScreen.color.set(wrong ? 0x0b0a26 : 0x0a1a1a);

  // PDF: on screen, then (s1-s2) flies up the beam to the server; from s3 it is back home
  pdf.visible = t >= T.pdfIn;
  const fly = sm(T.up, T.land, t);
  if (wrong) { lerp3(HOME, SV, fly, pdf.position); pdf.position.z += 0.6 * fly; pdf.position.y += Math.sin(fly * Math.PI) * 0.6; }
  else if (t < T.drag) pdf.position.copy(HOME);
  else if (t < T.drop) lerp3(HOME, DRAG, sm(T.drag, T.drag + 0.6, t), pdf.position);
  else pdf.position.copy(HOME); // the original stays where it was
  pdf.scale.setScalar(wrong ? 1 - 0.35 * fly : 1);
  pdf.rotation.y = wrong ? fly * 0.6 : 0;
  setBand(pdf, wrong ? RED : VIOLET);

  // the dragged ghost of the file follows the cursor, then turns into a DOCX on drop
  const ghostOn = t >= T.drag && t < T.drop + 0.25;
  // server + beam + copies
  server.visible = (wrong && t >= T.up - 0.05) || (t >= T.nothing && t < T.s7);
  server.scale.setScalar(wrong ? 1 : 0.42);
  if (!wrong) server.position.set(0, 2.75, -1.6); else server.position.copy(SV);
  cross.forEach((c) => (c.visible = !wrong));
  upBeam.set(v.copy(HOME).add(new THREE.Vector3(0, 0.3, 0)), v2.copy(SV).add(new THREE.Vector3(0, -1.4, 0.6)), wrong ? sm(T.up - 0.1, T.up + 0.2, t) * 0.8 * (1 - sm(T.copy - 0.5, T.copy - 0.2, t)) : 0);
  copies.forEach((c, i) => {
    const k = sm(T.copy + 0.12 * i, T.copy + 0.3 + 0.12 * i, t);
    c.visible = wrong && k > 0.01;
    c.position.set(SV.x + 1.45, SV.y + 0.75 - 0.8 * i, SV.z + 1.0); c.scale.setScalar(0.45 * k); c.rotation.y = 0.3;
  });

  // ring menu + cursor
  const ringA = sm(T.circle - 0.1, T.circle + 0.25, t) * (1 - sm(T.drop + 0.1, T.drop + 0.4, t));
  ring.visible = ringA > 0.01; ring.position.copy(DRAG); ring.position.z += 0.05; ring.rotation.x = -0.12; ring.scale.setScalar(0.8 * (0.3 + 0.7 * ringA));
  slots[0].scale.setScalar(1 + 0.35 * sm(T.drop - 0.3, T.drop, t));
  const curOn = t >= T.hold - 0.1 && t < T.drop + 0.5;
  cursor.visible = curOn;
  let cp = DRAG;
  if (t < T.drag) cp = v.copy(HOME).add(new THREE.Vector3(0.2, -0.2, 0.08));
  else if (t < T.drop - 0.4) cp = lerp3(v.copy(HOME).add(new THREE.Vector3(0.2, -0.2, 0.08)), v2.copy(DRAG).add(new THREE.Vector3(0.2, -0.2, 0.08)), sm(T.drag, T.drag + 0.6, t), v);
  else cp = lerp3(v2.copy(DRAG).add(new THREE.Vector3(0.2, -0.2, 0.08)), slots[0].getWorldPosition(new THREE.Vector3()).add(new THREE.Vector3(0.1, -0.1, 0.1)), sm(T.drop - 0.4, T.drop, t), v);
  cursor.position.copy(cp);

  // dragged copy rides with the cursor (reuse copies[0] style: the PDF itself stays home on drop)
  if (ghostOn && t < T.drop) {
    const inRing = sm(T.circle - 0.1, T.circle + 0.25, t);
    if (t < T.circle - 0.1) pdf.position.copy(cursor.position).add(new THREE.Vector3(-0.2, 0.25, -0.06));
    else pdf.position.copy(DRAG).add(new THREE.Vector3(0, 0, 0.03));
    pdf.scale.setScalar(1 - 0.5 * inRing);
  }

  // DOCX lands next to the original
  const dk = sm(T.nw - 0.1, T.nw + 0.3, t);
  docx.visible = dk > 0.01 && t < T.s7 + 3;
  docx.position.copy(NEXT).add(new THREE.Vector3(0.55, 0.25 * (1 - dk), 0)); docx.scale.setScalar(dk);

  // s6: file-type tiles burst out around the laptop
  tiles.forEach((m, i) => {
    const k = sm(T.n270 + 0.03 * i, T.n270 + 0.35 + 0.03 * i, t) * (1 - sm(T.nothing - 0.2, T.nothing + 0.1, t));
    m.visible = k > 0.01;
    const a = (i / tiles.length) * Math.PI * 2 + t * 0.25;
    m.position.set(Math.cos(a) * 1.9, 1.0 + Math.sin(a) * 1.25, -1.6);
    m.scale.setScalar(0.6 * k);
  });

  // s3: the star pops in beside the laptop while the star count is on screen
  const sk = sm(T.almost - 0.1, T.almost + 0.25, t) * (1 - sm(T.free - 0.15, T.free + 0.1, t));
  star.visible = sk > 0.01; star.scale.setScalar(0.62 * sk * (1 + 0.08 * Math.sin(t * 6)));
  star.position.set(0, 2.02, -0.3); star.rotation.y = 0.35 * Math.sin((t - T.almost) * 2.5);

  const { punch } = shoot(SH, t);
  const spike = overlays(t);
  bloom.strength = 1.0 + 1.2 * punch * punch + spike;
});
