// NEVER BUY A PRO CARD (GPU Unlock). GeForce card in a neon void; wrong = half-speed gauge + pricey pro card,
// right = lock opens, gauge to 100%, boot order, tensor cores double, 4090 bars, same images, RTX 20/30/40.
import { THREE, S, g, sm, scene, bloom, glow, VIOLET, ORANGE, RED, GREEN, WHITE, label, shoot, run } from "./kit.js";
import { title, cap, boom, endCard, overlays, fitText } from "./extra.js";
import { RoundedBoxGeometry } from "three/addons/geometries/RoundedBoxGeometry.js";

const std = (c, e, r = 0.45, m = 0.25) => new THREE.MeshStandardMaterial({ color: c, emissive: e, roughness: r, metalness: m });
const rbox = (w, h, d, r, mat) => new THREE.Mesh(new RoundedBoxGeometry(w, h, d, 4, r), mat);
const mBody = std(0x4a42c8, 0x1c1766, 0.35, 0.35), mDark = std(0x14123a, 0x07061a, 0.6, 0.2), mLav = std(0xc9c0ff, 0x4a3fb0, 0.4, 0.1);
const mGold = std(0xffb040, 0x7a4a10, 0.35, 0.6);
const txt = (s, hex = WHITE, k = 1.0, w = 1) => { const t = fitText([s], hex, k, w); t.visible = true; return t; };

const pl = new THREE.PointLight(0xe8e2ff, 18, 12, 1.6); pl.position.set(-1.6, 3.4, 3.2); scene.add(pl);
const rim = new THREE.PointLight(0xff8a3a, 8, 9, 1.6); rim.position.set(2.6, 2.4, -2.4); scene.add(rim);

// ---------- graphics card: body, two spinning fans, name strip, gold PCIe edge, bracket; faces +z ----------
function makeCard(body, name, accentHex, nameHex = WHITE) {
  const gp = new THREE.Group();
  gp.add(rbox(2.2, 0.9, 0.36, 0.06, body));
  const fans = [-0.55, 0.55].map((x) => {
    const f = new THREE.Group(); f.position.set(x, -0.08, 0.19); gp.add(f);
    const hole = new THREE.Mesh(new THREE.CircleGeometry(0.3, 32), mDark); f.add(hole);
    const ring = new THREE.Mesh(new THREE.TorusGeometry(0.3, 0.018, 8, 48), glow(accentHex, 1.4)); ring.position.z = 0.01; f.add(ring);
    const bl = new THREE.Group(); bl.position.z = 0.015; f.add(bl);
    for (let i = 0; i < 7; i++) { const b = new THREE.Mesh(new THREE.PlaneGeometry(0.09, 0.24), mLav); b.position.set(Math.cos((i * 2 * Math.PI) / 7) * 0.14, Math.sin((i * 2 * Math.PI) / 7) * 0.14, 0); b.rotation.z = (i * 2 * Math.PI) / 7 + 0.5; bl.add(b); }
    const hub = new THREE.Mesh(new THREE.CircleGeometry(0.07, 24), glow(accentHex, 1.2)); hub.position.z = 0.02; f.add(hub);
    f.userData = { bl, ring, hub }; return f;
  });
  const strip = new THREE.Mesh(new THREE.PlaneGeometry(2.0, 0.03), glow(accentHex, 1.6)); strip.position.set(0, 0.42, 0.185); gp.add(strip);
  const nm = txt(name, nameHex, nameHex === WHITE ? 1.0 : 1.3, 0.8); nm.position.set(0, 0.31, 0.19); gp.add(nm);
  const edge = rbox(1.2, 0.1, 0.06, 0.02, mGold); edge.position.set(0.25, -0.5, 0); gp.add(edge);
  const br = rbox(0.06, 1.1, 0.4, 0.02, std(0x5a5690, 0x1a1840, 0.7, 0.3)); br.position.set(-1.13, -0.05, 0); gp.add(br);
  gp.userData = { fans, strip };
  scene.add(gp); return gp;
}
const setAccent = (c, hex) => { const k = hex === GREEN ? 0.55 : 1; c.userData.strip.material.color.set(hex).multiplyScalar(1.6 * k); c.userData.fans.forEach((f) => { f.userData.ring.material.color.set(hex).multiplyScalar(1.4 * k); f.userData.hub.material.color.set(hex).multiplyScalar(1.2 * k); }); }; // green blooms much harder than red
const spin = (c, a) => c.userData.fans.forEach((f) => (f.userData.bl.rotation.z = -a));

const C0 = new THREE.Vector3(0, 0.6, 0);
const gf = makeCard(mBody, "GEFORCE RTX", RED); gf.position.copy(C0);
const pro = makeCard(mLav, "PRO CARD", RED, RED); pro.visible = false;
// price tag hanging from the pro card
const tag = new THREE.Group(); pro.add(tag); tag.position.set(0.75, 0.62, 0.3); tag.rotation.z = -0.18;
tag.add(rbox(0.7, 0.32, 0.05, 0.05, std(0xff2a3a, 0x801018, 0.4, 0.1)));
const tagT = txt("$$$$", WHITE, 1.0, 0.62); tagT.position.z = 0.03; tag.add(tagT);
// "same chip" on both cards, between the fans
function chip(hex) {
  const c = new THREE.Group(); c.add(rbox(0.36, 0.36, 0.06, 0.03, mDark));
  const core = new THREE.Mesh(new THREE.PlaneGeometry(0.22, 0.22), glow(hex, 1.4)); core.position.z = 0.032; c.add(core);
  for (let i = 0; i < 4; i++) for (const s of [-1, 1]) { const p = new THREE.Mesh(new THREE.BoxGeometry(0.03, 0.06, 0.02), mGold); p.position.set(-0.12 + i * 0.08, s * 0.2, 0); c.add(p); const q = p.clone(); q.rotation.z = Math.PI / 2; q.position.set(s * 0.2, -0.12 + i * 0.08, 0); c.add(q); }
  c.position.set(0, -0.06, 0.22); c.visible = false; return c;
}
const chipA = chip(VIOLET), chipB = chip(VIOLET); gf.add(chipA); pro.add(chipB);
const eq = new THREE.Group(); scene.add(eq); [0.07, -0.07].forEach((y) => { const b = new THREE.Mesh(new THREE.BoxGeometry(0.36, 0.07, 0.05), glow(VIOLET, 1.8)); b.position.y = y; eq.add(b); });

// ---------- lock on the GeForce ----------
const lock = new THREE.Group(); lock.position.set(0, -0.2, 0.3); gf.add(lock);
const mLock = std(0xff2a3a, 0x801018, 0.4, 0.2);
lock.add(rbox(0.4, 0.32, 0.12, 0.05, mLock));
const shackle = new THREE.Mesh(new THREE.TorusGeometry(0.12, 0.035, 10, 24, Math.PI), glow(RED, 1.6)); lock.add(shackle);
const hole = new THREE.Mesh(new THREE.CircleGeometry(0.04, 16), mDark); hole.position.z = 0.065; lock.add(hole);

// ---------- speed gauge above the card ----------
const gauge = new THREE.Group(); gauge.position.set(0, 1.45, 0); scene.add(gauge);
const N = 20, ticks = [];
for (let i = 0; i < N; i++) {
  const a = Math.PI - (i + 0.5) * (Math.PI / N);
  const m = new THREE.Mesh(new THREE.BoxGeometry(0.07, 0.17, 0.04), glow(RED, 1.6));
  m.position.set(Math.cos(a) * 0.62, Math.sin(a) * 0.62, 0); m.rotation.z = a - Math.PI / 2; gauge.add(m); ticks.push(m);
}
const needle = new THREE.Group(); gauge.add(needle);
const nd = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.04, 0.03), glow(WHITE, 1.4)); nd.position.x = 0.25; needle.add(nd);
const nhub = new THREE.Mesh(new THREE.CircleGeometry(0.06, 20), glow(WHITE, 1.2)); nhub.position.z = 0.02; needle.add(nhub);
const g50 = txt("50%", RED, 1.6, 0.9), g100 = txt("100%", GREEN, 1.6, 0.9);
[g50, g100].forEach((m) => { m.position.set(0, 0.2, 0.02); gauge.add(m); });

// ---------- s3 GitHub star (as in filee) ----------
const starShape = new THREE.Shape();
for (let i = 0; i < 10; i++) { const a = Math.PI / 2 + (i * Math.PI) / 5, r = i % 2 ? 0.17 : 0.4; starShape[i ? "lineTo" : "moveTo"](Math.cos(a) * r, Math.sin(a) * r); }
const star = new THREE.Mesh(new THREE.ExtrudeGeometry(starShape, { depth: 0.08, bevelEnabled: true, bevelSize: 0.03, bevelThickness: 0.03, bevelSegments: 2 }), glow(ORANGE, 1.5));
scene.add(star);

// ---------- s4 boot order column at x=6 ----------
const BX = 6;
function step(name, hex, y) {
  const s = new THREE.Group(); s.position.set(BX - 0.2, y, 0); scene.add(s);
  s.add(rbox(1.7, 0.46, 0.2, 0.08, std(0x2a2470, 0x0c0a30, 0.5, 0.2)));
  const e = new THREE.Mesh(new THREE.PlaneGeometry(0.08, 0.36), glow(hex, 1.8)); e.position.set(-0.75, 0, 0.105); s.add(e);
  const t = txt(name, hex === GREEN ? GREEN : WHITE, 1.0, 1.35); t.position.set(0.05, 0, 0.11); s.add(t);
  s.visible = false; return s;
}
const steps = [step("POWER ON", VIOLET, 2.6), step("GPU UNLOCK", GREEN, 1.9), step("NVIDIA DRIVER", VIOLET, 1.2), step("GPU BIOS", VIOLET, 0.5)];
const arrows = [0, 1, 2].map((i) => { const a = new THREE.Mesh(new THREE.ConeGeometry(0.1, 0.16, 3), glow(VIOLET, 1.6)); a.rotation.z = Math.PI; a.position.set(BX - 0.2, 2.25 - i * 0.7, 0); scene.add(a); return a; });
function check() {
  const c = new THREE.Group(), m = glow(GREEN, 2.0);
  const a = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.16, 0.04), m); a.position.set(-0.06, -0.02, 0); a.rotation.z = 0.8; c.add(a);
  const b = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.3, 0.04), m); b.position.set(0.05, 0.04, 0); b.rotation.z = -0.6; c.add(b);
  const r = new THREE.Mesh(new THREE.TorusGeometry(0.2, 0.025, 8, 32), m); c.add(r);
  c.visible = false; scene.add(c); return c;
}
const chkDrv = check(), chkBios = check();
chkDrv.position.set(BX + 1.0, 1.2, 0.2); chkBios.position.set(BX + 1.0, 0.5, 0.2); // floor is y=0, keep everything above it

// ---------- s5 tensor cores + 4090 bars at x=-6 ----------
const TX = -6;
const die = new THREE.Group(); die.position.set(TX, 1.1, 0); scene.add(die);
die.add(rbox(1.8, 1.8, 0.12, 0.06, mDark));
const cores = [];
for (let i = 0; i < 16; i++) { const c = rbox(0.32, 0.32, 0.1, 0.03, std(0x333080, 0x111030, 0.5, 0.2)); c.position.set(-0.6 + (i % 4) * 0.4, 0.6 - Math.floor(i / 4) * 0.4, 0.1); die.add(c); cores.push(c); }
const coreM = { off: std(0x2a2660, 0x0a0820, 0.6, 0.2), half: std(0xff2a3a, 0x901020, 0.4, 0.2), on: std(0x3dff8a, 0x16a050, 0.4, 0.2) };
const barR = rbox(0.7, 1, 0.5, 0.05, std(0xff2a3a, 0x901020, 0.4, 0.2)), barG = rbox(0.7, 1, 0.5, 0.05, std(0x3dff8a, 0x16a050, 0.4, 0.2));
barR.position.set(TX - 0.55, 0, 0); barG.position.set(TX + 0.55, 0, 0); scene.add(barR, barG);
const t165 = fitText(["165"], RED, 1.6, 1.0), t329 = fitText(["329"], GREEN, 1.6, 1.0), t4090 = fitText(["RTX 4090"], WHITE, 1.0, 1.8);

// ---------- s6 images + cards at x=12 ----------
const IX = 12;
function picture() {
  const p = new THREE.Group(); scene.add(p);
  p.add(rbox(1.7, 1.15, 0.08, 0.05, std(0x9a96c8, 0x2a2850, 0.3, 0.6)));
  const sky = new THREE.Mesh(new THREE.PlaneGeometry(1.5, 0.95), new THREE.MeshBasicMaterial({ color: 0x2a1f7a })); sky.position.z = 0.045; p.add(sky);
  const sun = new THREE.Mesh(new THREE.CircleGeometry(0.15, 24), glow(ORANGE, 1.3)); sun.position.set(0.4, 0.2, 0.05); p.add(sun);
  [[-0.35, 0.55, 0x6a5fd0], [0.2, 0.42, 0x8a7ff0]].forEach(([x, h, c]) => { const m = new THREE.Mesh(new THREE.CircleGeometry(h, 3), new THREE.MeshBasicMaterial({ color: c })); m.rotation.z = Math.PI / 2; m.position.set(x, -0.47 + h * 0.5, 0.055); m.scale.y = 1; p.add(m); });
  const mask = new THREE.Mesh(new THREE.PlaneGeometry(1.7, 0.4), std(0x9a96c8, 0x2a2850, 0.3, 0.6)); mask.position.set(0, -0.68, 0.06); p.add(mask);
  p.visible = false; return p;
}
const picA = picture(), picB = picture();
const pbBack = new THREE.Mesh(new THREE.PlaneGeometry(1.7, 0.14), new THREE.MeshBasicMaterial({ color: 0x241e66 })); scene.add(pbBack);
const pbFill = new THREE.Mesh(new THREE.PlaneGeometry(1.7, 0.14), glow(GREEN, 1.3)); scene.add(pbFill);
const eq2 = new THREE.Group(); scene.add(eq2); [0.07, -0.07].forEach((y) => { const b = new THREE.Mesh(new THREE.BoxGeometry(0.36, 0.07, 0.05), glow(GREEN, 1.6)); b.position.y = y; eq2.add(b); });
const minis = ["RTX 20", "RTX 30", "RTX 40"].map((n) => { const c = makeCard(mBody, n, GREEN); c.scale.setScalar(0.62); setAccent(c, GREEN); c.visible = false; return c; });

// ---------- captions ----------
title("NEVER BUY A PRO CARD");
cap("s1", "pro", ["PRO CARD?"], RED, { until: ["s1", "exploring"] });
cap("s1", "exploring", ["EXPLORING GITHUB REPOS"], WHITE, { until: "s1" });
cap("s2", "same", ["SAME CHIP"], RED, { until: ["s2", "much"] });
cap("s2", "much", ["MUCH HIGHER PRICE"], RED, { until: ["s2", "only"], boom: 0.5 });
cap("s2", "only", ["JUST FOR FULL SPEED"], RED);
cap("s3", "gpu", ["GPU UNLOCK"], GREEN, { until: ["s3", "over"], boom: 0.5 });
cap("s3", "over", ["OVER 19,000 STARS", "IN UNDER 4 WEEKS"], ORANGE, { until: ["s3", "free"], boom: 0.5 });
cap("s3", "free", ["FREE ON GITHUB"], GREEN, { until: ["s3", "removes"] });
cap("s3", "removes", ["HALF SPEED CAP: GONE"], GREEN);
cap("s4", "runs", ["RUNS AT BOOT"], VIOLET, { until: ["s4", "before"] });
cap("s4", "before", ["BEFORE THE DRIVER"], VIOLET, { until: ["s4", "no"], untilN: 2 });
cap("s4", "no", ["NO PATCHED DRIVER"], GREEN, { n: 2, until: ["s4", "no"], untilN: 3 }); // "no"#1 is "normal"
cap("s4", "no", ["NO BIOS FLASH"], GREEN, { n: 3 });
cap("s5", "tensor", ["TENSOR CORES"], VIOLET, { until: ["s5", "double"] });
cap("s5", "double", ["DOUBLE THE RATE"], GREEN, { until: ["s5", "an"], boom: 0.5 });
cap("s5", "rtx", ["RTX 4090"], WHITE, { until: ["s5", "165"] });
cap("s5", "165", ["165 TO 329"], GREEN, { until: ["s5", "trillion"], boom: 0.4 });
cap("s5", "trillion", ["TRILLION OPERATIONS", "A SECOND"], GREEN);
cap("s6", "ai", ["AI IMAGES", "UP TO 55% FASTER"], GREEN, { until: ["s6", "same"], boom: 0.4 });
cap("s6", "same", ["SAME RESULTS", "BIT FOR BIT"], GREEN, { until: ["s6", "built"] });
cap("s6", "built", ["RTX 20, 30, 40"], GREEN, { until: ["s6", "on"] });
cap("s6", "on", ["ON LINUX"], GREEN);
endCard(["DON'T BUY THE PRO CARD.", "UNLOCK THE ONE YOU HAVE."]);

// ---------- timings ----------
const T = {
  half: g("s1", "half"), pro: g("s1", "pro"), same: g("s2", "same"), much: g("s2", "much"), full: g("s2", "full"),
  s3: S.s3[0], over: g("s3", "over"), free: g("s3", "free"), removes: g("s3", "removes"), cap: g("s3", "cap"),
  s4: S.s4[0], boot: g("s4", "boot"), before: g("s4", "before"), nvidia: g("s4", "nvidia"), no1: g("s4", "patched"), no2: g("s4", "bios"),
  s5: S.s5[0], dbl: g("s5", "double"), an: g("s5", "an"), r165: g("s5", "165"), r329: g("s5", "329"),
  s6: S.s6[0], same6: g("s6", "same"), built: g("s6", "built"), r20: g("s6", "20"), r30: g("s6", "30"), r40: g("s6", "40"),
  s7: S.s7[0], s8: S.s8[0],
};

// ---------- shots: [cx,cy,cz, lx,ly,lz, fov] ----------
const SH = [
  { at: 0, K: [[0, [0.3, 1.5, 5.6, 0, 1.15, 0, 48]], [T.pro, [0.1, 1.5, 6.0, 0, 1.2, 0, 48]]] },
  { at: T.pro - 0.05, K: [[0, [0.3, 1.6, 7.4, 0, 1.3, 0, 48]], [3.5, [-0.2, 1.6, 7.0, 0, 1.3, 0, 48]]] },
  { at: S.s2[0], K: [[0, [-0.4, 1.6, 7.2, 0, 1.3, 0, 48]], [4.8, [0.3, 1.5, 6.8, 0, 1.3, 0, 48]]] },
  { at: T.s3, K: [[0, [-0.4, 1.5, 6.0, 0, 1.2, 0, 48]], [4, [0.2, 1.5, 5.6, 0, 1.15, 0, 48]], [9, [0, 1.4, 5.4, 0, 1.15, 0, 48]]] },
  { at: T.s4, K: [[0, [BX + 0.4, 1.8, 6.2, BX, 1.55, 0, 48]], [5.5, [BX - 0.3, 1.8, 5.9, BX, 1.55, 0, 48]]] },
  { at: T.s5, K: [[0, [TX + 0.4, 1.3, 5.4, TX, 1.1, 0, 48]], [3, [TX - 0.2, 1.3, 5.0, TX, 1.1, 0, 48]]] },
  { at: T.an - 0.05, K: [[0, [TX - 0.3, 1.4, 6.4, TX, 1.2, 0, 48]], [5.5, [TX + 0.3, 1.4, 6.0, TX, 1.2, 0, 48]]] },
  { at: T.s6, K: [[0, [IX + 0.3, 1.9, 7.0, IX, 1.72, 0, 48]], [4.2, [IX - 0.3, 1.9, 6.8, IX, 1.72, 0, 48]]] },
  { at: T.built - 0.05, K: [[0, [IX + 0.3, 1.9, 6.3, IX, 1.7, 0, 48]], [3.5, [IX - 0.2, 1.9, 6.0, IX, 1.7, 0, 48]]] },
  { at: T.s7, calm: 1, K: [[0, [0, 1.4, 6.6, 0, 1.0, 0, 48]], [3, [0.3, 1.5, 7.2, 0, 1.0, 0, 48]]] },
];

const ARC = (k) => Math.PI - k * Math.PI; // needle angle for 0..1

run("gpu-unlock-world", (t) => {
  const wrong = t < T.s3, end = t >= T.s8 - 0.1;
  const atHome = t < T.s4 || (t >= T.s7 && !end);

  // GeForce card + fans (faster after the unlock)
  gf.visible = atHome;
  const unlocked = sm(T.removes - 0.05, T.removes + 0.35, t);
  setAccent(gf, t < T.removes ? RED : GREEN);
  spin(gf, t * (2 + 6 * sm(T.cap, T.cap + 0.6, t)));
  // pro card: drops in above at "pro", leaves at s3
  const pk = sm(T.pro - 0.1, T.pro + 0.3, t) * (1 - sm(T.s3 - 0.05, T.s3 + 0.3, t));
  pro.visible = pk > 0.01; pro.position.set(0, 2.15 + 0.6 * (1 - pk), 0); pro.scale.setScalar(pk); spin(pro, t * 8);
  tag.visible = t >= T.much - 0.1; tag.scale.setScalar(sm(T.much - 0.1, T.much + 0.2, t)); tag.rotation.z = -0.18 + 0.08 * Math.sin(t * 5);
  const ck = sm(T.same - 0.1, T.same + 0.2, t) * (1 - sm(T.s3 - 0.1, T.s3 + 0.1, t));
  chipA.visible = chipB.visible = ck > 0.01; chipA.scale.setScalar(ck * 1.2); chipB.scale.setScalar(ck * 1.2);
  eq.visible = ck > 0.01 && pk > 0.5; eq.position.set(0, 1.42, 0.3); eq.scale.setScalar(ck);

  // lock: red from s3 start, opens on "removes"
  const lk = sm(T.s3 - 0.05, T.s3 + 0.3, t);
  lock.visible = !wrong && lk > 0.01 && t < T.s4; lock.scale.setScalar(lk * 0.85);
  shackle.position.y = 0.16 + 0.12 * unlocked; shackle.rotation.y = 1.2 * unlocked;
  mLock.color.set(unlocked > 0.5 ? 0x2ad070 : 0xff2a3a); mLock.emissive.set(unlocked > 0.5 ? 0x0c5a2c : 0x801018);
  shackle.material.color.set(unlocked > 0.5 ? GREEN : RED).multiplyScalar(unlocked > 0.5 ? 0.9 : 1.6);

  // gauge: 50% red until "cap", then 100% green; hidden while the pro card or the star is up
  const starOn = t >= T.over - 0.1 && t < T.free + 0.1;
  gauge.visible = atHome && !(pk > 0.01) && !starOn;
  const gk = 0.5 + 0.5 * sm(T.cap, T.cap + 0.5, t) + (t < T.cap ? 0.02 * Math.sin(t * 9) : 0);
  needle.rotation.z = ARC(gk);
  const green = t >= T.cap;
  ticks.forEach((m, i) => { const on = i < Math.round(gk * N); m.material.color.set(on ? (green ? GREEN : RED) : 0x2a2660).multiplyScalar(on ? (green ? 0.8 : 1.6) : 1); });
  g50.visible = !green; g100.visible = green;
  g50.position.y = g100.position.y = -0.18;

  // star
  const sk = sm(T.over - 0.1, T.over + 0.25, t) * (1 - sm(T.free - 0.15, T.free + 0.1, t));
  star.visible = sk > 0.01; star.scale.setScalar(0.62 * sk * (1 + 0.08 * Math.sin(t * 6)));
  star.position.set(0, 1.62, 0.2); star.rotation.y = 0.35 * Math.sin((t - T.over) * 2.5);

  // s4 boot order
  const s4on = t >= T.s4 - 0.05 && t < T.s5;
  const ins = [T.s4, T.before, T.nvidia - 0.1, T.no2 - 0.15];
  steps.forEach((s, i) => { const k = sm(ins[i], ins[i] + 0.3, t); s.visible = s4on && k > 0.01; s.scale.setScalar(k); s.position.x = BX - 0.2 - 0.6 * (1 - k); });
  arrows.forEach((a, i) => { const k = sm(ins[i + 1] - 0.05, ins[i + 1] + 0.2, t); a.visible = s4on && k > 0.01; a.scale.setScalar(k); });
  steps[0].children[1].material.color.set(GREEN).multiplyScalar(1.8 * (0.6 + 0.4 * sm(T.boot - 0.1, T.boot + 0.2, t)));
  [[chkDrv, T.no1], [chkBios, T.no2]].forEach(([c, a]) => { const k = sm(a - 0.1, a + 0.2, t); c.visible = s4on && k > 0.01; c.scale.setScalar(k); });

  // s5 tensor cores, then 4090 bars
  const s5on = t >= T.s5 - 0.05 && t < T.s6;
  const dk = 1 - sm(T.an - 0.2, T.an + 0.05, t);
  die.visible = s5on && dk > 0.01; die.scale.setScalar(dk);
  const full = t >= T.dbl;
  cores.forEach((c, i) => { const lit = full ? t >= T.dbl + 0.025 * i : i % 2 === Math.floor(i / 4) % 2; c.material = lit ? (full ? coreM.on : coreM.half) : coreM.off; });
  const rk = sm(T.r165 - 0.1, T.r165 + 0.4, t), gk2 = sm(T.r329 - 0.1, T.r329 + 0.6, t);
  const barsOn = s5on && t >= T.an - 0.1;
  barR.visible = barsOn && rk > 0.01; barG.visible = barsOn && gk2 > 0.01;
  barR.scale.y = Math.max(0.01, 0.8 * rk); barR.position.y = 0.4 + 0.4 * rk;
  barG.scale.y = Math.max(0.01, 1.6 * gk2); barG.position.y = 0.4 + 0.8 * gk2;
  label(t4090, TX, 0.12, 0.4, 0.8, barsOn ? sm(T.an - 0.1, T.an + 0.2, t) : 0);
  label(t165, TX - 0.55, 0.4 + 0.8 * rk + 0.28, 0.3, 0.75, barsOn ? rk : 0);
  label(t329, TX + 0.55, 0.4 + 1.6 * gk2 + 0.28, 0.3, 0.75, barsOn ? gk2 : 0);

  // s6 images: one renders fast, then an identical twin; then RTX 20/30/40
  const s6on = t >= T.s6 - 0.05 && t < T.s7;
  const picOut = 1 - sm(T.built - 0.2, T.built + 0.05, t);
  const ak = sm(T.s6 - 0.05, T.s6 + 0.25, t) * picOut;
  picA.visible = s6on && ak > 0.01; picA.scale.setScalar(0.85 * ak); picA.position.set(IX, 2.45, 0);
  const bk = sm(T.same6 - 0.1, T.same6 + 0.25, t) * picOut;
  picB.visible = s6on && bk > 0.01; picB.scale.setScalar(0.85 * bk); picB.position.set(IX, 0.95, 0);
  const fill = sm(T.s6 + 0.2, T.s6 + 1.4, t);
  const pbOn = s6on && t < T.same6 - 0.1;
  pbBack.visible = pbFill.visible = pbOn && ak > 0.5;
  pbBack.position.set(IX, 1.45, 0); pbFill.position.set(IX - 0.85 * (1 - fill), 1.45, 0.01); pbFill.scale.x = Math.max(0.001, fill);
  eq2.visible = s6on && bk > 0.01; eq2.position.set(IX, 1.52, 0.1); eq2.scale.setScalar(bk);
  [T.built, T.r30, T.r40].forEach((a, i) => { const k = sm(a - 0.15, a + 0.15, t); const c = minis[i]; c.visible = s6on && k > 0.01; c.scale.setScalar(0.62 * k); c.position.set(IX, 2.55 - i * 0.85, 0); spin(c, t * 6); });

  const { punch } = shoot(SH, t);
  const spike = overlays(t);
  bloom.strength = 1.0 + 1.2 * punch * punch + spike;
});
