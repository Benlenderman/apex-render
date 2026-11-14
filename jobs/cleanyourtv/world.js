// NEVER LET YOUR TV SHOW ADS (CleanYourTV). TV on a console; wrong = red ad rows + tracking, right = laptop cleans it over Wi-Fi.
import { THREE, S, g, sm, scene, bloom, glow, VIOLET, ORANGE, RED, GREEN, WHITE, shoot, run } from "./kit.js";
import { title, cap, boom, endCard, overlays, fitText } from "./extra.js";

import { RoundedBoxGeometry } from "three/addons/geometries/RoundedBoxGeometry.js";
const std = (c, e, r = 0.45, m = 0.25) => new THREE.MeshStandardMaterial({ color: c, emissive: e, roughness: r, metalness: m });
const rbox = (w, h, d, r, mat) => new THREE.Mesh(new RoundedBoxGeometry(w, h, d, 4, r), mat);
const mBody = std(0x4a42c8, 0x1c1766, 0.35, 0.35), mDark = std(0x14123a, 0x07061a, 0.6, 0.2);
const plane = (w, h, mat) => new THREE.Mesh(new THREE.PlaneGeometry(w, h), mat);
// text that lives in the world (depth-tested, so objects in front hide it)
const wtext = (txt, hex, k, w) => { const t = fitText([txt], hex, k, w); t.material.depthTest = true; t.renderOrder = 2; t.visible = true; return t; };

// ---------- room: floor, console, lights ----------
const floor = rbox(12, 0.2, 9, 0.1, std(0x1b1752, 0x0a0828, 0.8, 0.1)); floor.position.set(0, -0.1, -0.5); scene.add(floor);
const consoleT = rbox(3.6, 0.5, 0.9, 0.08, mBody); consoleT.position.set(0, 0.25, -1.7); scene.add(consoleT);
const pl = new THREE.PointLight(0xe8e2ff, 18, 10, 1.6); pl.position.set(-1.8, 3.4, 2.4); scene.add(pl);
const rim = new THREE.PointLight(0xff8a3a, 8, 8, 1.6); rim.position.set(2.6, 2.4, -3.0); scene.add(rim);

// ---------- TV: screen faces +z ----------
const TVC = new THREE.Vector3(0, 1.65, -1.75), SW = 3.0, SHh = 1.7;
const tv = new THREE.Group(); tv.position.copy(TVC); scene.add(tv);
tv.add(rbox(SW + 0.16, SHh + 0.16, 0.1, 0.04, mDark));
const neck = rbox(0.3, 0.6, 0.08, 0.03, mDark); neck.position.set(0, -1.1, -0.04); tv.add(neck);
const mScreen = new THREE.MeshBasicMaterial({ color: 0x0b0a26, toneMapped: false });
const face = plane(SW, SHh, mScreen); face.position.z = 0.055; tv.add(face);
const tvGlow = new THREE.PointLight(0xff3040, 6, 5, 1.6); tvGlow.position.set(0, 0, 1.2); tv.add(tvGlow);

// ad layout: hero banner + a sponsored row + a row of junk apps
function tile(w, h, hex, txt, k = 0.9) {
  const gp = new THREE.Group();
  gp.add(plane(w, h, glow(hex, k)));
  if (txt) { const t = wtext(txt, WHITE, 1.0, w * 0.9); t.position.z = 0.005; gp.add(t); }
  tv.add(gp); return gp;
}
const hero = tile(2.7, 0.55, RED, "SPONSORED", 0.8); hero.position.set(0, 0.5, 0.06);
const adRow = [-1.02, -0.34, 0.34, 1.02].map((x) => { const m = tile(0.6, 0.38, RED, "AD", 0.75); m.position.set(x, -0.08, 0.06); return m; });
const junk = [-1.02, -0.34, 0.34, 1.02].map((x, i) => { const m = tile(0.6, 0.38, [0xff4a2a, 0xff2a5a, 0xff5a3a, 0xff2a3a][i], "APP", 0.6); m.position.set(x, -0.58, 0.06); return m; });
const ADS = [hero, ...adRow];

// clean home: four favorite apps in one row + a glass highlight
const FAV = ["VIDEO", "MUSIC", "SPORT", "PHOTOS"], FX = [-1.05, -0.35, 0.35, 1.05];
const favs = FAV.map((f, i) => { const m = tile(0.6, 0.38, [VIOLET, GREEN, VIOLET, GREEN][i], f, 0.45); m.position.set(FX[i], -0.35, 0.06); return m; });
const glass = new THREE.Group(); tv.add(glass);
const mGlass = new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.18, toneMapped: false, depthWrite: false });
glass.add(plane(0.72, 0.5, mGlass));
[[0, 0.25, 0.72, 0.02], [0, -0.25, 0.72, 0.02], [-0.36, 0, 0.02, 0.5], [0.36, 0, 0.02, 0.5]].forEach(([x, y, w, h]) => { const e = plane(w, h, glow(WHITE, 1.3)); e.position.set(x, y, 0.002); glass.add(e); });

// ---------- tracking: red dots stream from the TV up to a red eye ----------
const EYE = new THREE.Vector3(1.0, 3.55, -2.6);
const eye = new THREE.Group(); eye.position.copy(EYE); scene.add(eye);
eye.add(new THREE.Mesh(new THREE.TorusGeometry(0.34, 0.05, 10, 48), glow(RED, 2.0)));
const lidT = new THREE.Mesh(new THREE.TorusGeometry(0.62, 0.04, 8, 48, Math.PI * 0.55), glow(RED, 1.8)); lidT.position.y = -0.33; lidT.rotation.z = Math.PI * 0.225; eye.add(lidT);
const lidB = lidT.clone(); lidB.position.y = 0.33; lidB.rotation.z = Math.PI + Math.PI * 0.225; eye.add(lidB);
const pupil = new THREE.Mesh(new THREE.SphereGeometry(0.15, 20, 14), glow(RED, 2.6)); eye.add(pupil);
const dots = Array.from({ length: 10 }, () => { const d = new THREE.Mesh(new THREE.SphereGeometry(0.05, 12, 8), glow(RED, 2.4)); scene.add(d); return d; });
const DOT0 = new THREE.Vector3(0.6, TVC.y + 0.9, -1.65);
const eyeX = [[-0.45, -0.45], [0.45, 0.45]].map((_, i) => { const c = new THREE.Mesh(new THREE.BoxGeometry(1.3, 0.1, 0.1), glow(GREEN, 2.0)); c.rotation.z = i ? -0.8 : 0.8; c.position.z = 0.15; eye.add(c); return c; });

// ---------- laptop on a low table in front (the computer that cleans it) ----------
const table = rbox(2.4, 0.08, 1.2, 0.04, std(0x221d66, 0x0c0a30, 0.7, 0.1)); table.position.set(0, 0.42, 1.4); scene.add(table);
const lap = new THREE.Group(); lap.position.set(0, 0.46, 1.5); lap.scale.setScalar(0.42); scene.add(lap);
const lbase = rbox(2.6, 0.1, 1.7, 0.04, mBody); lbase.position.set(0, 0.05, 0); lap.add(lbase);
const lkeys = rbox(2.2, 0.02, 0.8, 0.01, mDark); lkeys.position.set(0, 0.105, -0.2); lap.add(lkeys);
const lid = new THREE.Group(); lid.position.set(0, 0.1, -0.85); lid.rotation.x = -0.12; lap.add(lid);
const lscr = rbox(2.6, 1.7, 0.06, 0.04, mBody); lscr.position.set(0, 0.85, 0); lid.add(lscr);
const lface = plane(2.4, 1.5, new THREE.MeshBasicMaterial({ color: 0x0a1a1a, toneMapped: false })); lface.position.set(0, 0.85, 0.035); lid.add(lface);
const lbar = plane(2.4, 0.04, glow(GREEN, 1.6)); lbar.position.set(0, 1.5, 0.037); lid.add(lbar);
const lname = wtext("CLEANYOURTV", GREEN, 1.0, 2.0); lname.position.set(0, 0.85, 0.04); lid.add(lname);
// terminal window floating over the laptop for "one command"
const term = new THREE.Group(); term.position.set(0, 0.85, 0.045); term.scale.setScalar(0.0); lid.add(term);
term.add(plane(2.3, 1.4, new THREE.MeshBasicMaterial({ color: 0x07061a, toneMapped: false })));
const tBar = plane(2.3, 0.06, glow(GREEN, 1.4)); tBar.position.y = 0.62; term.add(tBar);
const tTxt = wtext("> restore", GREEN, 1.2, 1.4); tTxt.position.set(0, -0.02, 0.005); term.add(tTxt);
// undo arrow (green ring with a head)
const undo = new THREE.Group(); scene.add(undo);
undo.add(new THREE.Mesh(new THREE.TorusGeometry(0.32, 0.055, 10, 48, Math.PI * 1.6), glow(GREEN, 1.8)));
const head = new THREE.Mesh(new THREE.ConeGeometry(0.14, 0.24, 3), glow(GREEN, 1.8)); head.position.set(0.32, -0.04, 0); head.rotation.z = Math.PI; undo.add(head);

// Wi-Fi: three arcs over the laptop + green packets toward the TV
const wifi = new THREE.Group(); scene.add(wifi);
const arcs = [0.18, 0.34, 0.5].map((r) => { const a = new THREE.Mesh(new THREE.TorusGeometry(r, 0.04, 8, 32, Math.PI / 2), glow(GREEN, 1.8)); a.rotation.z = Math.PI / 4; wifi.add(a); return a; });
const wdot = new THREE.Mesh(new THREE.SphereGeometry(0.06, 12, 8), glow(GREEN, 1.8)); wifi.add(wdot);
const packets = Array.from({ length: 6 }, () => { const d = new THREE.Mesh(new THREE.SphereGeometry(0.05, 12, 8), glow(GREEN, 2.2)); scene.add(d); return d; });
const WF = new THREE.Vector3(0, 1.3, 1.5);

// ---------- s3: GitHub star ----------
const starShape = new THREE.Shape();
for (let i = 0; i < 10; i++) { const a = Math.PI / 2 + (i * Math.PI) / 5, r = i % 2 ? 0.17 : 0.4; starShape[i ? "lineTo" : "moveTo"](Math.cos(a) * r, Math.sin(a) * r); }
const star = new THREE.Mesh(new THREE.ExtrudeGeometry(starShape, { depth: 0.08, bevelEnabled: true, bevelSize: 0.03, bevelThickness: 0.03, bevelSegments: 2 }), glow(ORANGE, 1.5));
scene.add(star);

// ---------- captions ----------
title("NEVER LET YOUR TV SHOW ADS");
cap("s1", "exploring", ["EXPLORING GITHUB REPOS"], WHITE, { until: "s1" });
cap("s2", "sponsored", ["SPONSORED ROWS"], RED, { until: ["s2", "tracking"] });
cap("s2", "tracking", ["TRACKING"], RED, { until: ["s2", "apps"], boom: 0.5 });
cap("s2", "apps", ["APPS YOU NEVER", "ASKED FOR"], RED);
cap("s3", "cleanyourtv", ["CLEANYOURTV"], GREEN, { until: ["s3", "over"], boom: 0.5 });
cap("s3", "over", ["OVER 57,000 STARS", "IN 4 WEEKS"], ORANGE, { until: ["s3", "it's"], boom: 0.5 });
cap("s3", "it's", ["FREE ON GITHUB"], GREEN, { until: ["s3", "android"] });
cap("s3", "android", ["ANY ANDROID OR GOOGLE TV"], GREEN, { until: ["s3", "from"] });
cap("s3", "from", ["FROM YOUR COMPUTER"], GREEN);
cap("s4", "over", ["OVER HOME WI-FI"], GREEN, { until: ["s4", "ads"] });
cap("s4", "ads", ["ADS OFF"], GREEN, { until: ["s4", "tracking"], boom: 0.4 });
cap("s4", "tracking", ["TRACKING OFF"], GREEN, { until: ["s4", "junk"], boom: 0.4 });
cap("s4", "junk", ["JUNK APPS OFF"], GREEN, { boom: 0.4 });
cap("s5", "pitch", ["PITCH BLACK HOME"], VIOLET, { until: ["s5", "four"] });
cap("s5", "four", ["4 FAVORITE APPS", "IN ONE ROW"], GREEN);
cap("s6", "no", ["NO ROOT"], GREEN, { until: ["s6", "no"], untilN: 2 });
cap("s6", "no", ["NO CABLE"], GREEN, { n: 2, until: ["s6", "nothing"] });
cap("s6", "nothing", ["NOTHING UNINSTALLED"], GREEN, { until: ["s6", "one"] });
cap("s6", "one", ["ONE COMMAND", "PUTS IT BACK"], GREEN, { boom: 0.4 });
endCard(["SAME TV.", "NO ADS."]);

// ---------- timings (global seconds) ----------
const T = {
  sponsored: g("s2", "sponsored"), tracking: g("s2", "tracking"), apps: g("s2", "apps"), s3: S.s3[0], get: g("s3", "get"),
  over: g("s3", "over"), its: g("s3", "it's"), s4: S.s4[0], wifi: g("s4", "over"), ads: g("s4", "ads"), trk: g("s4", "tracking"), junk: g("s4", "junk"),
  pitch: g("s5", "pitch"), four: g("s5", "four"), row: g("s5", "row"), s6: S.s6[0], one: g("s6", "one"), back: g("s6", "back"), s7: S.s7[0],
};
const v = new THREE.Vector3();

// ---------- shots: [cx,cy,cz, lx,ly,lz, fov] ----------
const SH = [
  { at: 0, K: [[0, [0, 1.75, 5.6, 0, 1.75, -1.75, 50]], [S.s2[0], [0.1, 1.75, 5.2, 0, 1.75, -1.75, 50]]] },
  { at: T.tracking - 0.25, K: [[0, [1.4, 2.4, 5.4, 0.5, 2.6, -2.0, 56]], [2.5, [1.6, 2.5, 5.8, 0.5, 2.6, -2.0, 56]]] },
  { at: T.s3, K: [[0, [-0.4, 2.8, 6.8, 0, 1.45, -0.6, 52]], [9.5, [0.3, 2.7, 6.4, 0, 1.45, -0.6, 52]]] },
  { at: T.s4, K: [[0, [0.6, 2.9, 6.9, 0.2, 1.9, -1.0, 54]], [3.5, [0.3, 2.9, 6.6, 0.2, 1.9, -1.0, 54]]] },
  { at: S.s5[0], K: [[0, [0, 1.75, 5.2, 0, 1.65, -1.75, 50]], [3.6, [0, 1.75, 4.8, 0, 1.65, -1.75, 50]]] },
  { at: T.s6, K: [[0, [-0.4, 2.8, 6.8, 0, 1.45, -0.6, 52]], [3.7, [0, 2.9, 7.1, 0, 1.45, -0.6, 52]]] },
  { at: T.s7, calm: 1, K: [[0, [0, 2.9, 7.1, 0, 1.45, -0.6, 52]], [4, [0, 3.0, 7.8, 0, 1.45, -0.6, 52]]] },
];

run("cleanyourtv-world", (t) => {
  const wrong = t < T.s3;
  // ads: pulse in s2, shrink away on "ads" in s4
  const adsOff = sm(T.ads - 0.05, T.ads + 0.3, t), junkOff = sm(T.junk - 0.05, T.junk + 0.3, t);
  ADS.forEach((m, i) => { const k = 1 - sm(T.ads - 0.05 + 0.04 * i, T.ads + 0.3 + 0.04 * i, t); m.visible = k > 0.01; m.scale.setScalar(k * (1 + 0.06 * sm(T.sponsored, T.sponsored + 0.2, t) * (1 - sm(T.tracking - 0.2, T.tracking, t)) * Math.sin(t * 14))); });
  junk.forEach((m, i) => { const k = 1 - sm(T.junk - 0.05 + 0.04 * i, T.junk + 0.3 + 0.04 * i, t); m.visible = k > 0.01; m.scale.setScalar(k * (1 + 0.25 * Math.max(0, 1 - Math.abs(t - T.apps - 0.1 * i) / 0.25))); });
  tvGlow.color.set(junkOff < 1 ? 0xff3040 : 0x7a6aff); tvGlow.intensity = 6 * (1 - 0.6 * junkOff);

  // screen: dark navy with ads, pitch black from "pitch"
  const blk = sm(T.pitch - 0.1, T.pitch + 0.3, t);
  mScreen.color.setRGB(0.012 * (1 - blk), 0.01 * (1 - blk), 0.045 * (1 - blk));
  favs.forEach((m, i) => { const k = sm(T.four + 0.08 * i, T.four + 0.35 + 0.08 * i, t); m.visible = k > 0.01; m.scale.setScalar(k); });
  // glass highlight slides tile to tile from "row" onward
  const ga = sm(T.row - 0.1, T.row + 0.2, t); glass.visible = ga > 0.01;
  const gs = Math.max(0, t - T.row) / 0.7, gi = Math.floor(gs) % 6, gf = sm(0.55, 1, gs % 1);
  const seq = [0, 1, 2, 3, 2, 1], a = seq[gi], b = seq[(gi + 1) % 6];
  glass.position.set(FX[a] + (FX[b] - FX[a]) * gf, -0.35, 0.07); glass.scale.setScalar(ga * (1 + 0.08 * Math.sin(gf * Math.PI)));

  // tracking: eye + dots from s2 "tracking" until s4 "tracking" (then a green X over it)
  const eyeOn = (t >= T.tracking - 0.15 && t < T.s3) || (t >= T.s4 && t < T.trk + 0.9);
  eye.visible = eyeOn; eye.scale.setScalar((wrong ? sm(T.tracking - 0.15, T.tracking + 0.15, t) : sm(T.s4, T.s4 + 0.25, t) * (1 - sm(T.trk + 0.6, T.trk + 0.9, t))) * 0.9);
  pupil.position.x = 0.08 * Math.sin(t * 3);
  eyeX.forEach((c) => (c.visible = t >= T.trk));
  const flow = t >= T.tracking && t < T.trk;
  dots.forEach((d, i) => { const u = ((t - T.tracking) * 0.9 + i / dots.length) % 1; d.visible = flow && wrong; v.copy(DOT0).lerp(EYE, u); v.y += Math.sin(u * Math.PI) * 0.25; d.position.copy(v); });
  // in s4 the eye shows above the TV while its line is off; give it a fixed spot
  if (!wrong) eye.position.set(1.15, 3.25, -2.0); else eye.position.copy(EYE);

  // laptop appears in s3
  const lk = sm(T.get - 0.2, T.get + 0.2, t);
  lap.visible = table.visible = lk > 0.01 && !(t >= S.s5[0] && t < T.s6); lap.scale.setScalar(0.42 * lk);
  // Wi-Fi in s4 (and again on "no cable" in s6)
  const wk = Math.max(sm(T.wifi - 0.1, T.wifi + 0.2, t) * (1 - sm(S.s5[0] - 0.2, S.s5[0], t)), sm(g("s6", "no", 2) - 0.1, g("s6", "no", 2) + 0.2, t) * (1 - sm(g("s6", "nothing") - 0.1, g("s6", "nothing") + 0.1, t)));
  wifi.visible = wk > 0.01; wifi.position.copy(WF); wifi.scale.setScalar(wk * 0.62);
  arcs.forEach((m, i) => (m.material.color.set(GREEN).multiplyScalar(1 + 1.2 * Math.max(0, Math.sin(t * 6 - i)))));
  packets.forEach((d, i) => { const u = ((t - T.wifi) * 0.8 + i / packets.length) % 1; d.visible = wk > 0.5 && t < S.s5[0]; v.copy(WF).lerp(new THREE.Vector3(0, TVC.y - 0.2, TVC.z + 0.1), u); d.position.copy(v); });

  // s6: terminal + undo arrow over the laptop
  const tk = sm(T.one - 0.1, T.one + 0.25, t) * (1 - sm(T.s7 - 0.1, T.s7 + 0.1, t));
  term.visible = tk > 0.01; term.scale.setScalar(tk); lname.visible = !term.visible;
  const uk = sm(T.back - 0.15, T.back + 0.15, t) * (1 - sm(T.s7 - 0.1, T.s7 + 0.1, t));
  undo.visible = uk > 0.01; undo.position.set(1.0, 0.95, 1.6); undo.scale.setScalar(uk * 0.6); undo.rotation.z = -t * 2;

  // s3: the star pops in above the TV while the star count is on screen
  const sk = sm(T.over - 0.1, T.over + 0.25, t) * (1 - sm(T.its - 0.15, T.its + 0.1, t));
  star.visible = sk > 0.01; star.scale.setScalar(0.62 * sk * (1 + 0.08 * Math.sin(t * 6)));
  star.position.set(0, 3.05, -1.6); star.rotation.y = 0.35 * Math.sin((t - T.over) * 2.5);

  const { punch } = shoot(SH, t);
  const spike = overlays(t);
  bloom.strength = 1.0 + 1.2 * punch * punch + spike;
});
