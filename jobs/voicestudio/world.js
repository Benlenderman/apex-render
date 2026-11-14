// NEVER CLONE YOUR VOICE ONLINE (VoiceStudio). Laptop + mic on a dark desk; wrong = voice flies to a stranger's server, right = cloned on the laptop.
import { THREE, S, g, sm, scene, bloom, glow, VIOLET, ORANGE, RED, GREEN, WHITE, beam, shoot, run } from "./kit.js";
import { title, cap, boom, endCard, overlays, fitText } from "./extra.js";

import { RoundedBoxGeometry } from "three/addons/geometries/RoundedBoxGeometry.js";
const std = (c, e, r = 0.45, m = 0.25) => new THREE.MeshStandardMaterial({ color: c, emissive: e, roughness: r, metalness: m });
const rbox = (w, h, d, r, mat) => new THREE.Mesh(new RoundedBoxGeometry(w, h, d, 4, r), mat);
const mBody = std(0x4a42c8, 0x1c1766, 0.35, 0.35), mDark = std(0x14123a, 0x07061a, 0.6, 0.2), mLav = std(0xc9c0ff, 0x4a3fb0, 0.4, 0.1);
const tint = (m, hex, k) => m.color.set(hex).multiplyScalar(k);

// ---------- desk + room lights (same as filee) ----------
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
const face = new THREE.Mesh(new THREE.PlaneGeometry(2.4, 1.5), mScreen); face.position.set(0, 0.85, 0.035); lid.add(face);
const bar = new THREE.Mesh(new THREE.PlaneGeometry(2.4, 0.12), glow(VIOLET, 0.35)); bar.position.set(0, 1.54, 0.037); lid.add(bar);
const accent = new THREE.Mesh(new THREE.PlaneGeometry(2.4, 0.015), glow(VIOLET, 1.6)); accent.position.set(0, 1.475, 0.038); lid.add(accent);
[-1.08, -0.98, -0.88].forEach((x, i) => { const d = new THREE.Mesh(new THREE.CircleGeometry(0.025, 16), glow([RED, ORANGE, GREEN][i], 1.2)); d.position.set(x, 1.54, 0.039); lid.add(d); });
const SCR = (x, y) => new THREE.Vector3(x, 0.1 + y, -0.85 + 0.12 * y + 0.25); // point just in front of the screen
// screen labels (upper half of the screen; cards sit in the lower half)
const scrLabel = (txt, hex) => { const t = fitText([txt], hex, 1.0, 1.3); t.renderOrder = 5; t.position.set(0, 1.2, 0.04); lid.add(t); return t; };
const lWeb = scrLabel("WEBSITE", RED), lApp = scrLabel("VOICESTUDIO", GREEN), lSign = scrLabel("SIGN UP", RED);
const signX = [0.5, -0.5].map((s) => { const m = new THREE.Mesh(new THREE.PlaneGeometry(1.2, 0.05), glow(RED, 1.6)); m.position.set(0, 1.2, 0.045); m.rotation.z = s; lid.add(m); return m; });

// ---------- voice clip: lavender card with waveform bars ----------
const BARS = [0.35, 0.7, 1, 0.55, 0.85, 0.4, 0.95, 0.6, 0.3];
function makeWave() {
  const gp = new THREE.Group();
  gp.add(rbox(0.86, 0.5, 0.06, 0.06, mLav));
  const mat = glow(VIOLET, 1.2);
  const bars = BARS.map((h, i) => { const b = new THREE.Mesh(new THREE.PlaneGeometry(0.05, 0.34), mat); b.position.set(-0.32 + i * 0.08, 0, 0.032); b.scale.y = h; gp.add(b); return b; });
  gp.userData = { bars, mat };
  gp.visible = false; scene.add(gp); return gp;
}
const setWave = (w, hex, t = 0, talk = 0) => { tint(w.userData.mat, hex, 1.2); w.userData.bars.forEach((b, i) => (b.scale.y = BARS[i] * (1 - talk) + talk * (0.3 + 0.7 * Math.abs(Math.sin(t * 9 + i * 1.3))))); };
const wave = makeWave(), out = makeWave();
const copies = [makeWave(), makeWave(), makeWave()];

// ---------- microphone on the desk, front-left ----------
const MIC = new THREE.Vector3(-0.95, 0, 1.2);
const mic = new THREE.Group(); mic.position.copy(MIC); scene.add(mic);
const mBase = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.24, 0.05, 32), mBody); mBase.position.y = 0.025; mic.add(mBase);
const stem = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.4, 12), mBody); stem.position.y = 0.25; mic.add(stem);
const head = new THREE.Mesh(new THREE.CapsuleGeometry(0.12, 0.16, 6, 20), mDark); head.position.y = 0.6; mic.add(head);
const mRing = glow(RED, 1.4);
[-0.08, 0, 0.08].forEach((y) => { const r = new THREE.Mesh(new THREE.TorusGeometry(0.125, 0.012, 6, 32), mRing); r.rotation.x = Math.PI / 2; r.position.y = 0.6 + y; mic.add(r); });
const MICTOP = new THREE.Vector3(MIC.x, 0.85, MIC.z);

// ---------- the stranger's server, up and behind (filee) ----------
const SV = new THREE.Vector3(0.9, 4.6, -5.5);
const server = new THREE.Group(); server.position.copy(SV); scene.add(server);
server.add(rbox(1.6, 2.6, 1.2, 0.12, mBody));
for (let i = 0; i < 5; i++) {
  const u = rbox(1.36, 0.36, 0.06, 0.04, mDark); u.position.set(0, -0.95 + i * 0.48, 0.6); server.add(u);
  const led = new THREE.Mesh(new THREE.SphereGeometry(0.045, 12, 8), glow(RED, 2.2)); led.position.set(0.5, -0.95 + i * 0.48, 0.65); server.add(led);
}
const svLight = new THREE.PointLight(0xff3040, 14, 6, 1.6); svLight.position.set(0, 0, 1.4); server.add(svLight);
const upBeam = beam(RED, 1.6, 0.04);

// ---------- s4: sound rings from the screen ----------
const rings = [0, 1, 2].map(() => { const r = new THREE.Mesh(new THREE.TorusGeometry(0.4, 0.015, 6, 48), glow(GREEN, 1.1)); r.visible = false; scene.add(r); return r; });

// ---------- s5: video card + book ----------
const video = new THREE.Group(); scene.add(video);
video.add(rbox(0.86, 0.52, 0.06, 0.05, mBody));
const play = new THREE.Mesh(new THREE.CircleGeometry(0.13, 3), glow(GREEN, 1.3)); play.position.z = 0.035; video.add(play);
const vBar = new THREE.Mesh(new THREE.PlaneGeometry(0.7, 0.03), glow(VIOLET, 1.2)); vBar.position.set(0, -0.19, 0.035); video.add(vBar);
const book = new THREE.Group(); scene.add(book);
const pages = rbox(0.5, 0.62, 0.12, 0.02, std(0xf2eeff, 0x6a5fd0, 0.6, 0)); book.add(pages);
const cover = rbox(0.52, 0.64, 0.04, 0.02, mBody); cover.position.z = 0.07; book.add(cover);
const spine = new THREE.Mesh(new THREE.PlaneGeometry(0.06, 0.64), glow(GREEN, 1.2)); spine.position.set(-0.22, 0, 0.092); book.add(spine);
[0.12, 0.02].forEach((y) => { const l = new THREE.Mesh(new THREE.PlaneGeometry(0.26, 0.03), glow(VIOLET, 1.0)); l.position.set(0.04, y, 0.092); book.add(l); });

// ---------- s5: language tags orbit the laptop ----------
const LANGS = ["EN", "ES", "FR", "DE", "HI", "JA", "ZH", "AR", "PT", "RU", "KO", "HE"];
const tiles = LANGS.map((l, i) => {
  const gp = new THREE.Group();
  gp.add(rbox(0.5, 0.34, 0.05, 0.05, i % 3 ? mBody : std(0x1f7a4a, 0x0f5a33, 0.4, 0.2)));
  const t = fitText([l], WHITE, 1.0, 0.5); t.visible = true; t.position.z = 0.03; gp.add(t);
  gp.visible = false; scene.add(gp); return gp;
});

// ---------- s6: phone on the desk, front-right ----------
const phone = new THREE.Group(); phone.position.set(1.0, 0.48, 1.05); phone.rotation.set(-0.12, -0.35, 0); scene.add(phone);
phone.add(rbox(0.46, 0.9, 0.05, 0.05, mBody));
const pFace = new THREE.Mesh(new THREE.PlaneGeometry(0.4, 0.8), new THREE.MeshBasicMaterial({ color: 0x0a1a1a, toneMapped: false })); pFace.position.z = 0.027; phone.add(pFace);
const pBars = BARS.slice(0, 6).map((h, i) => { const b = new THREE.Mesh(new THREE.PlaneGeometry(0.035, 0.3), glow(GREEN, 1.2)); b.position.set(-0.11 + i * 0.045, 0, 0.029); b.scale.y = h; phone.add(b); return b; });

// ---------- s3: GitHub star (filee) ----------
const starShape = new THREE.Shape();
for (let i = 0; i < 10; i++) { const a = Math.PI / 2 + (i * Math.PI) / 5, r = i % 2 ? 0.17 : 0.4; starShape[i ? "lineTo" : "moveTo"](Math.cos(a) * r, Math.sin(a) * r); }
const star = new THREE.Mesh(new THREE.ExtrudeGeometry(starShape, { depth: 0.08, bevelEnabled: true, bevelSize: 0.03, bevelThickness: 0.03, bevelSegments: 2 }), glow(ORANGE, 1.5));
scene.add(star);

// ---------- captions ----------
title("NEVER CLONE YOUR VOICE ONLINE");
cap("s1", "website", ["ON A WEBSITE?"], RED, { until: ["s1", "exploring"] });
cap("s1", "exploring", ["EXPLORING GITHUB REPOS"], WHITE, { until: "s1" });
cap("s2", "upload", ["UPLOADED VOICE"], RED, { until: ["s2", "someone"] });
cap("s2", "someone", ["SOMEONE ELSE'S SERVER"], RED, { boom: 0.5 });
cap("s3", "voicestudio", ["VOICESTUDIO"], GREEN, { until: ["s3", "over"], boom: 0.5 });
cap("s3", "over", ["OVER 110,000 STARS", "IN 7 MONTHS"], ORANGE, { until: ["s3", "free"], boom: 0.5 });
cap("s3", "free", ["IT'S FREE"], GREEN, { until: ["s3", "all"] });
cap("s3", "all", ["ON YOUR OWN DEVICE"], GREEN);
cap("s4", "one", ["ONE CLEAR RECORDING"], VIOLET, { until: ["s4", "talks"] });
cap("s4", "talks", ["TALKS IN THAT VOICE"], GREEN, { boom: 0.4 });
cap("s5", "translate", ["TRANSLATES VIDEOS"], VIOLET, { until: ["s5", "read"] });
cap("s5", "read", ["READS WHOLE BOOKS"], VIOLET, { until: ["s5", "646"] });
cap("s5", "646", ["646 LANGUAGES"], GREEN, { boom: 0.5 });
cap("s6", "no", ["NO ACCOUNT"], GREEN, { until: ["s6", "runs"] });
cap("s6", "runs", ["ON YOUR LAPTOP"], GREEN, { until: ["s6", "or"] });
cap("s6", "or", ["OR EVEN YOUR PHONE"], GREEN);
endCard(["CLONE IT AT HOME.", "YOUR VOICE STAYS YOURS."]);
boom("s2", "lives", 0.5);

// ---------- timings (global seconds) ----------
const T = {
  voice: g("s1", "voice"), web: g("s1", "website"),
  up: g("s2", "upload"), land: g("s2", "lives"), copy: g("s2", "someone"),
  s3: S.s3[0], app: g("s3", "voicestudio"), over: g("s3", "over"), free: g("s3", "free"),
  s4: S.s4[0], rec: g("s4", "recording"), talks: g("s4", "talks"),
  s5: S.s5[0], tr: g("s5", "translate"), read: g("s5", "read"), n646: g("s5", "646"),
  s6: S.s6[0], laptop: g("s6", "laptop"), phone: g("s6", "phone"), s7: S.s7[0],
};
const HOME = SCR(-0.5, 0.55), OUT = SCR(0.55, 0.55), VID = SCR(-0.55, 0.55), BOOK = SCR(0.6, 0.55);
const v = new THREE.Vector3(), v2 = new THREE.Vector3();
const lerp3 = (a, b, k, o) => o.copy(a).lerp(b, k);

// ---------- shots: [cx,cy,cz, lx,ly,lz, fov] ----------
const SH = [
  { at: 0, K: [[0, [0.1, 1.8, 5.6, -0.2, 0.85, -0.3, 48]], [S.s2[0], [-0.1, 1.8, 5.1, -0.2, 0.9, -0.4, 48]]] },
  { at: T.up, K: [[0, [2.4, 1.6, 5.4, 0.5, 3.1, -2.6, 58]], [2.0, [2.8, 2.0, 5.8, 0.6, 3.5, -3.2, 58]]] },
  { at: T.copy - 0.3, K: [[0, [2.8, 4.2, 1.6, 1.4, 4.4, -5.0, 54]], [2.0, [2.5, 4.4, 1.0, 1.4, 4.4, -5.0, 52]]] },
  { at: T.s3, K: [[0, [-0.6, 2.1, 5.8, 0, 1.0, -0.6, 48]], [7.5, [0.2, 1.8, 5.2, 0, 1.0, -0.6, 46]]] },
  { at: T.s4, K: [[0, [-0.4, 1.7, 5.3, -0.25, 0.85, -0.2, 48]], [2.5, [-0.1, 1.75, 5.1, -0.15, 0.9, -0.3, 47]]] },
  { at: T.s5, K: [[0, [0.3, 1.8, 5.2, 0, 1.0, -0.6, 46]], [T.n646 - T.s5 - 0.2, [0, 1.9, 5.4, 0, 1.0, -0.6, 47]], [T.n646 - T.s5 + 0.7, [0, 2.8, 7.4, 0, 1.75, -1.2, 50]], [T.s6 - T.s5, [0.3, 3.0, 7.8, 0, 1.8, -1.2, 50]]] },
  { at: T.s6, K: [[0, [0.3, 1.9, 6.0, 0.1, 0.9, -0.3, 48]], [3, [0.5, 1.9, 5.7, 0.2, 0.85, -0.2, 48]]] },
  { at: T.s7, calm: 1, K: [[0, [0.3, 3.0, 7.8, 0, 1.8, -1.2, 50]], [4, [0.5, 3.2, 8.4, 0, 1.8, -1.2, 50]]] },
];

run("voicestudio-world", (t) => {
  const wrong = t < T.s3;
  tint(accent.material, wrong ? (t >= T.web ? RED : VIOLET) : GREEN, 1.6);
  mScreen.color.set(wrong ? 0x0b0a26 : 0x0a1a1a);
  lWeb.visible = wrong && t >= T.web - 0.1;
  lApp.visible = t >= T.app - 0.1 && t < T.s6 || (t >= T.laptop - 0.1 && t < T.s7);
  lSign.visible = t >= T.s6 && t < T.laptop - 0.1; signX.forEach((m) => (m.visible = lSign.visible && t >= T.s6 + 0.15));

  // mic: red while recording for the website, green for the local clone in s4
  const recOn = (t >= T.voice - 0.1 && t < T.up) || (t >= T.s4 && t < T.talks);
  tint(mRing, wrong ? RED : GREEN, recOn ? 1.4 + 0.5 * Math.sin(t * 10) : 0.7);
  mic.visible = t < T.s5 || t >= T.s7;

  // voice clip: mic -> screen (s1), screen -> server (s2); back home green (s3); mic -> screen again (s4)
  wave.visible = (t >= T.voice && t < T.s5);
  if (wrong) {
    const k = sm(T.voice, T.voice + 0.6, t), fly = sm(T.up, T.land, t);
    if (t < T.up) lerp3(MICTOP, HOME, k, wave.position);
    else { lerp3(HOME, SV, fly, wave.position); wave.position.z += 0.6 * fly; wave.position.y += Math.sin(fly * Math.PI) * 0.6; }
    wave.scale.setScalar((0.5 + 0.5 * k) * (1 - 0.35 * fly)); wave.rotation.y = fly * 0.6;
    setWave(wave, RED);
  } else if (t < T.s4) { wave.position.copy(HOME); wave.scale.setScalar(1); wave.rotation.y = 0; setWave(wave, GREEN); }
  else { const k = sm(T.rec, T.rec + 0.5, t); lerp3(MICTOP, HOME, k, wave.position); wave.scale.setScalar(0.5 + 0.5 * k); wave.visible = t >= T.rec - 0.15 && t < T.s5; setWave(wave, GREEN); }

  // s4: the cloned voice talks out of the laptop
  const ok = sm(T.talks - 0.1, T.talks + 0.25, t) * (1 - sm(T.s5 - 0.1, T.s5 + 0.1, t));
  out.visible = ok > 0.01; out.position.copy(OUT); out.scale.setScalar(ok); setWave(out, GREEN, t, 1);
  rings.forEach((r, i) => {
    const p = ((t - T.talks) * 0.9 + i / 3) % 1;
    r.visible = ok > 0.5 && t >= T.talks; r.position.copy(SCR(0.55, 0.55)); r.position.z += 0.02; r.rotation.x = -0.12; r.scale.setScalar(0.7 + 0.45 * p);
  });

  // server + beam + copies (s2)
  server.visible = wrong && t >= T.up - 0.05;
  upBeam.set(v.copy(HOME).add(new THREE.Vector3(0, 0.3, 0)), v2.copy(SV).add(new THREE.Vector3(0, -1.4, 0.6)), wrong ? sm(T.up - 0.1, T.up + 0.2, t) * 0.8 * (1 - sm(T.copy - 0.5, T.copy - 0.2, t)) : 0);
  copies.forEach((c, i) => {
    const k = sm(T.copy + 0.12 * i, T.copy + 0.3 + 0.12 * i, t);
    c.visible = wrong && k > 0.01; setWave(c, RED);
    c.position.set(SV.x + 1.5, SV.y + 0.75 - 0.8 * i, SV.z + 1.0); c.scale.setScalar(0.5 * k); c.rotation.y = 0.3;
  });

  // s5: video, book, language tags
  const vk = sm(T.tr - 0.1, T.tr + 0.25, t) * (1 - sm(T.n646 - 0.2, T.n646 + 0.1, t));
  video.visible = vk > 0.01; video.position.copy(VID); video.rotation.x = -0.12; video.scale.setScalar(vk);
  const bk = sm(T.read - 0.1, T.read + 0.25, t) * (1 - sm(T.n646 - 0.2, T.n646 + 0.1, t));
  book.visible = bk > 0.01; book.position.copy(BOOK); book.rotation.set(-0.12, -0.25 + 0.1 * Math.sin(t * 2), 0); book.scale.setScalar(bk);
  tiles.forEach((m, i) => {
    const k = sm(T.n646 + 0.03 * i, T.n646 + 0.35 + 0.03 * i, t) * (1 - sm(T.s6 - 0.2, T.s6 + 0.05, t));
    m.visible = k > 0.01;
    const a = Math.PI * (0.02 + 0.96 * i / (tiles.length - 1)); // upper arc only, so no tag hides behind the laptop
    m.position.set(Math.cos(a) * 1.95, 1.05 + Math.sin(a) * 1.3 + 0.04 * Math.sin(t * 3 + i), -1.6); m.scale.setScalar(0.8 * k);
  });

  // s6: phone pops up on the desk and talks too
  const pk = sm(T.phone - 0.1, T.phone + 0.25, t);
  phone.visible = pk > 0.01 && t < T.s7 + 3; phone.scale.setScalar(pk);
  pBars.forEach((b, i) => (b.scale.y = 0.3 + 0.7 * Math.abs(Math.sin(t * 9 + i * 1.3))));

  // s3: the star pops in above the laptop while the star count is on screen
  const sk = sm(T.over - 0.1, T.over + 0.25, t) * (1 - sm(T.free - 0.15, T.free + 0.1, t));
  star.visible = sk > 0.01; star.scale.setScalar(0.62 * sk * (1 + 0.08 * Math.sin(t * 6)));
  star.position.set(0, 2.02, -0.3); star.rotation.y = 0.35 * Math.sin((t - T.over) * 2.5);

  const { punch } = shoot(SH, t);
  const spike = overlays(t);
  // capped so a bloom hit never washes out the captions
  bloom.strength = Math.min(1.45, 0.9 + 0.8 * punch * punch + 0.6 * spike);
});
