// NEVER UPLOAD YOUR FILES (Filee). Laptop on a dark desk; wrong = file flies to a stranger's server, right = local ring menu.
import { THREE, S, g, sm, scene, bloom, glow, box, tube, VIOLET, ORANGE, RED, GREEN, WHITE, mSolid,
  textPlane, label, beam, shoot, run } from "./kit.js";
import { title, cap, boom, endCard, overlays, fitText } from "./extra.js";

const edges = (m, hex, k = 1.6) => { const e = new THREE.LineSegments(new THREE.EdgesGeometry(m.geometry), new THREE.LineBasicMaterial({ color: new THREE.Color(hex).multiplyScalar(k), toneMapped: false })); m.add(e); return e; };
const recolor = (e, hex, k = 1.6) => e.material.color.set(hex).multiplyScalar(k);

// ---------- laptop at the origin, screen faces +z ----------
const base = box(2.6, 0.1, 1.7, 0, 0.05, 0, mSolid, false); scene.add(base);
const baseE = edges(base, VIOLET);
const lid = new THREE.Group(); lid.position.set(0, 0.1, -0.85); lid.rotation.x = -0.12; scene.add(lid);
const screen = box(2.6, 1.7, 0.06, 0, 0.85, 0, mSolid, false); lid.add(screen);
const lidE = edges(screen, VIOLET);
const mScreen = new THREE.MeshBasicMaterial({ color: new THREE.Color(VIOLET).multiplyScalar(0.18), toneMapped: false });
const face = new THREE.Mesh(new THREE.PlaneGeometry(2.4, 1.5), mScreen); face.position.set(0, 0.85, 0.035); lid.add(face);
const SCR = (x, y) => new THREE.Vector3(x, 0.1 + y, -0.85 + 0.12 * y + 0.25); // point just in front of the screen

// ---------- file icons ----------
function makeFile(hex, txt) {
  const gp = new THREE.Group();
  const b = box(0.56, 0.72, 0.04, 0, 0, 0, glow(hex, 0.3), false); gp.add(b);
  gp.userData.e = edges(b, hex, 2.0);
  const t = fitText([txt], WHITE, 1.0, 0.5); t.visible = true; t.position.set(0, -0.05, 0.03); gp.add(t);
  gp.userData.t = t;
  scene.add(gp); gp.visible = false;
  return gp;
}
const pdf = makeFile(RED, "PDF");
const docx = makeFile(GREEN, "DOCX");
const copies = [makeFile(RED, "PDF"), makeFile(RED, "PDF"), makeFile(RED, "PDF")];

// ---------- the stranger's server, up and behind ----------
const SV = new THREE.Vector3(0.9, 4.6, -5.5);
const server = new THREE.Group(); server.position.copy(SV); scene.add(server);
const rack = box(1.6, 2.6, 1.2, 0, 0, 0, mSolid, false); server.add(rack); edges(rack, RED, 1.8);
for (let i = 0; i < 6; i++) server.add(box(1.3, 0.08, 0.02, 0, -1.0 + i * 0.4, 0.61, glow(RED, i % 2 ? 1.6 : 0.8), false));
const upBeam = beam(RED, 1.6, 0.04);
const cross = [tube([-1, -1.4, 0.7], [1, 1.4, 0.7], 0.12, glow(RED, 2.4)), tube([1, -1.4, 0.7], [-1, 1.4, 0.7], 0.12, glow(RED, 2.4))];
cross.forEach((c) => server.add(c));

// ---------- ring menu + cursor ----------
const FORMATS = ["DOCX", "PNG", "MP3", "JPG", "TXT", "MP4"];
const ring = new THREE.Group(); scene.add(ring);
const torus = new THREE.Mesh(new THREE.TorusGeometry(0.62, 0.025, 8, 64), glow(VIOLET, 2.2)); ring.add(torus);
const slots = FORMATS.map((f, i) => {
  const a = Math.PI / 2 - (i * Math.PI * 2) / 6, s = new THREE.Group();
  s.position.set(Math.cos(a) * 0.62, Math.sin(a) * 0.62, 0.02);
  const d = new THREE.Mesh(new THREE.CircleGeometry(0.2, 32), glow(i ? VIOLET : GREEN, i ? 0.35 : 0.5)); s.add(d);
  const t = fitText([f], WHITE, 1.0, 0.36); t.visible = true; t.position.z = 0.01; s.add(t);
  ring.add(s); return s;
});
const cursor = new THREE.Mesh(new THREE.ConeGeometry(0.07, 0.2, 3), glow(WHITE, 0.8)); cursor.rotation.z = 0.5; scene.add(cursor);

// ---------- s6: a burst of file types around the laptop ----------
const TYPES = ["PDF", "DOCX", "PNG", "MP4", "MP3", "JPG", "GIF", "WAV", "SVG", "EPUB", "MOV", "WEBP", "CSV", "HEIC", "FLAC", "ZIP"];
const tiles = TYPES.map((f, i) => { const m = makeFile(i % 3 ? VIOLET : GREEN, f); m.scale.setScalar(0.6); return m; });

// ---------- captions ----------
title("NEVER UPLOAD YOUR FILES");
cap("s1", "random", ["RANDOM WEBSITE?"], RED, { until: "s1" });
cap("s2", "stranger's", ["STRANGER'S SERVER"], RED, { until: ["s2", "who"] });
cap("s2", "who", ["WHO KEEPS A COPY?"], RED, { boom: 0.5 });
cap("s3", "filee", ["FILEE"], GREEN, { until: ["s3", "free"], boom: 0.5 });
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
  pdfIn: S.s1[0] + 0.1, up: g("s1", "upload"), land: g("s2", "lands"), copy: g("s2", "copy"),
  s3: S.s3[0], hold: g("s4", "hold"), drag: g("s4", "drag"), circle: g("s4", "circle"), mouse: g("s4", "mouse"),
  drop: g("s5", "drop"), nw: g("s5", "new"), orig: g("s5", "original"),
  n270: g("s6", "270"), nothing: g("s6", "nothing"), off: g("s6", "offline"), s7: S.s7[0],
};
const HOME = SCR(-0.55, 0.95), DRAG = SCR(0.35, 0.8), NEXT = SCR(0.15, 0.95);
const v = new THREE.Vector3(), v2 = new THREE.Vector3();
const lerp3 = (a, b, k, out) => out.copy(a).lerp(b, k);

// ---------- shots: [cx,cy,cz, lx,ly,lz, fov] ----------
const SH = [
  { at: 0, K: [[0, [0.3, 1.6, 4.6, 0, 0.9, -0.5, 48]], [S.s2[0], [0.1, 1.7, 4.0, 0, 1.0, -0.6, 48]]] },
  { at: S.s2[0], K: [[0, [2.2, 1.4, 4.6, 0.4, 2.6, -2.6, 56]], [1.6, [2.6, 1.8, 5.0, 0.6, 3.2, -3.2, 56]]] },
  { at: T.copy - 0.3, K: [[0, [2.4, 4.2, 1.2, 0.9, 4.4, -5.5, 52]], [2.0, [2.0, 4.4, 0.6, 0.9, 4.4, -5.5, 50]]] },
  { at: T.s3, K: [[0, [-0.6, 1.9, 4.8, 0, 1.0, -0.6, 48]], [3.6, [0.2, 1.6, 3.8, 0, 1.0, -0.6, 46]]] },
  { at: S.s4[0], K: [[0, [0.5, 1.4, 4.4, 0, 0.95, -0.6, 46]], [3.5, [0.3, 1.35, 4.0, 0.1, 0.95, -0.6, 46]]] },
  { at: S.s5[0], K: [[0, [-0.5, 1.5, 4.2, 0, 0.95, -0.6, 46]], [3.4, [-0.2, 1.6, 4.4, -0.1, 1.0, -0.6, 46]]] },
  { at: S.s6[0], K: [[0, [0, 2.6, 5.5, 0, 1.0, -0.6, 50]], [3.7, [0.6, 3.6, 6.5, 0, 1.2, -1, 50]]] },
  { at: T.s7, calm: 1, K: [[0, [0.6, 3.6, 6.5, 0, 1.2, -1, 50]], [4, [0.8, 4.2, 7.2, 0, 1.2, -1, 50]]] },
];

run("filee-world", (t) => {
  const wrong = t < T.s3, done = t >= T.nw;
  // laptop color: red while uploading, green from s3
  const hex = wrong ? RED : GREEN;
  recolor(baseE, wrong ? VIOLET : GREEN); recolor(lidE, wrong ? VIOLET : GREEN);
  mScreen.color.set(wrong ? VIOLET : GREEN).multiplyScalar(wrong ? 0.16 : 0.14 + 0.06 * sm(T.s3, T.s3 + 0.4, t));

  // PDF: on screen, then (s1-s2) flies up the beam to the server; from s3 it is back home
  pdf.visible = t >= T.pdfIn;
  const fly = sm(T.up, T.land, t);
  if (wrong) { lerp3(HOME, SV, fly, pdf.position); pdf.position.z += 0.6 * fly; pdf.position.y += Math.sin(fly * Math.PI) * 0.6; }
  else if (t < T.drag) pdf.position.copy(HOME);
  else if (t < T.drop) lerp3(HOME, DRAG, sm(T.drag, T.drag + 0.6, t), pdf.position);
  else pdf.position.copy(HOME); // the original stays where it was
  pdf.scale.setScalar(wrong ? 1 - 0.35 * fly : 1);
  pdf.rotation.y = wrong ? fly * 0.6 : 0;
  const pdfHex = wrong ? RED : VIOLET; recolor(pdf.userData.e, pdfHex, 2); pdf.children[0].material.color.set(pdfHex).multiplyScalar(0.3);

  // the dragged ghost of the file follows the cursor, then turns into a DOCX on drop
  const ghostOn = t >= T.drag && t < T.drop + 0.25;
  // server + beam + copies
  server.visible = wrong || (t >= T.nothing && t < T.s7);
  server.scale.setScalar(wrong ? 1 : 0.8);
  cross.forEach((c) => (c.visible = !wrong));
  upBeam.set(v.copy(HOME).add(new THREE.Vector3(0, 0.3, 0)), v2.copy(SV).add(new THREE.Vector3(0, -1.4, 0.6)), wrong ? sm(T.up - 0.1, T.up + 0.2, t) * 0.8 : 0);
  copies.forEach((c, i) => {
    const k = sm(T.copy + 0.12 * i, T.copy + 0.3 + 0.12 * i, t);
    c.visible = wrong && k > 0.01;
    c.position.set(SV.x + 1.2 + 0.5 * i, SV.y - 0.6 + 0.5 * i, SV.z + 0.8); c.scale.setScalar(0.7 * k); c.rotation.y = -0.4;
  });

  // ring menu + cursor
  const ringA = sm(T.circle - 0.1, T.circle + 0.25, t) * (1 - sm(T.drop + 0.1, T.drop + 0.4, t));
  ring.visible = ringA > 0.01; ring.position.copy(DRAG); ring.position.z += 0.05; ring.rotation.x = -0.12; ring.scale.setScalar(0.3 + 0.7 * ringA);
  slots[0].scale.setScalar(1 + 0.35 * sm(T.drop - 0.3, T.drop, t));
  const curOn = t >= T.hold - 0.1 && t < T.drop + 0.5;
  cursor.visible = curOn;
  let cp = DRAG;
  if (t < T.drag) cp = v.copy(HOME).add(new THREE.Vector3(0.2, -0.2, 0.08));
  else if (t < T.drop - 0.4) cp = lerp3(v.copy(HOME).add(new THREE.Vector3(0.2, -0.2, 0.08)), v2.copy(DRAG).add(new THREE.Vector3(0.2, -0.2, 0.08)), sm(T.drag, T.drag + 0.6, t), v);
  else cp = lerp3(v2.copy(DRAG).add(new THREE.Vector3(0.2, -0.2, 0.08)), slots[0].getWorldPosition(new THREE.Vector3()).add(new THREE.Vector3(0.1, -0.1, 0.1)), sm(T.drop - 0.4, T.drop, t), v);
  cursor.position.copy(cp);

  // dragged copy rides with the cursor (reuse copies[0] style: the PDF itself stays home on drop)
  if (ghostOn && t < T.drop) pdf.position.copy(cursor.position).add(new THREE.Vector3(-0.2, 0.25, -0.06));

  // DOCX lands next to the original
  const dk = sm(T.nw - 0.1, T.nw + 0.3, t);
  docx.visible = dk > 0.01 && t < T.s7 + 3;
  docx.position.copy(NEXT).add(new THREE.Vector3(0.55, 0.25 * (1 - dk), 0)); docx.scale.setScalar(dk);

  // s6: file-type tiles burst out around the laptop
  tiles.forEach((m, i) => {
    const k = sm(T.n270 + 0.04 * i, T.n270 + 0.4 + 0.04 * i, t) * (1 - sm(T.s7 - 0.3, T.s7, t));
    m.visible = k > 0.01;
    const a = (i / tiles.length) * Math.PI * 2 + t * 0.25, r = 2.0 + 0.4 * (i % 2);
    m.position.set(Math.cos(a) * r, 1.0 + Math.sin(a) * r * 0.75, -0.4 + 0.3 * Math.sin(a * 2));
    m.scale.setScalar(0.6 * k);
  });

  const { punch } = shoot(SH, t);
  const spike = overlays(t);
  bloom.strength = 1.0 + 1.2 * punch * punch + spike;
});
