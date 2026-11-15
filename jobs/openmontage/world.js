// NEVER LET AI SPEND BLIND (OpenMontage). Laptop on a dark desk; wrong = coins vanish into AI clips that get thrown away;
// right = a film studio on screen: prompt, script, shots, cut, cost first, every scene approved, $1.33 film, free real footage.
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

const grp = () => { const gp = new THREE.Group(); gp.rotation.x = -0.12; gp.visible = false; root.add(gp); return gp; };
const txt = (lines, hex, w, z = 0.04) => { const t = fitText(lines, hex, 1.0, w); t.visible = true; t.position.z = z; t.renderOrder = 6; return t; };

// ---------- film frame (a clip): dark frame, colored picture, sprocket holes ----------
function makeClip(hex, w = 0.56) {
  const gp = grp(), h = w * 0.75;
  gp.add(rbox(w, h, 0.05, 0.03, mDark));
  const pic = new THREE.Mesh(new THREE.PlaneGeometry(w * 0.82, h * 0.62), glow(hex, 0.9)); pic.position.z = 0.03; gp.add(pic);
  for (let i = 0; i < 4; i++) for (const y of [-1, 1]) {
    const s = new THREE.Mesh(new THREE.PlaneGeometry(w * 0.1, h * 0.08), new THREE.MeshBasicMaterial({ color: 0xc9c0ff })); s.position.set((i - 1.5) * w * 0.24, y * h * 0.41, 0.03); gp.add(s);
  }
  gp.userData.pic = pic; return gp;
}
const setPic = (c, hex, k = 0.9) => c.userData.pic.material.color.set(hex).multiplyScalar(k);

// ---------- coin with a $ ----------
const mCoin = std(0xffb03a, 0x9a4a00, 0.3, 0.6);
function makeCoin() {
  const gp = grp();
  const c = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.12, 0.04, 32), mCoin); c.rotation.x = Math.PI / 2; gp.add(c);
  gp.add(txt(["$"], 0x5a2a00, 0.34, 0.025)); return gp;
}

// ---------- check mark ----------
function makeCheck(hex = GREEN) {
  const gp = grp(), m = glow(hex, 1.2);
  const a = new THREE.Mesh(new THREE.BoxGeometry(0.045, 0.12, 0.03), m); a.position.set(-0.045, -0.02, 0); a.rotation.z = 0.8; gp.add(a);
  const b = new THREE.Mesh(new THREE.BoxGeometry(0.045, 0.24, 0.03), m); b.position.set(0.05, 0.03, 0); b.rotation.z = -0.6; gp.add(b);
  return gp;
}

// ---------- s1: AI box eats coins ----------
const ai = grp(); ai.add(rbox(0.5, 0.5, 0.08, 0.08, std(0x2a1f7a, 0x2a1d90, 0.35, 0.3)));
ai.add(txt(["AI"], WHITE, 0.6, 0.05)); const aiRing = new THREE.Mesh(new THREE.TorusGeometry(0.32, 0.016, 6, 40), glow(RED, 1.8)); ai.add(aiRing);
const COIN_N = 5, coins = Array.from({ length: COIN_N }, makeCoin);
const STACK = (i) => SCR(0.62, 0.38 + i * 0.05, 0.1), AIP = SCR(-0.5, 0.82, 0.1);
const qmark = fitText(["?"], RED, 1.6, 1.4); qmark.renderOrder = 8;

// ---------- s2: three clips, coin under each, trash bin ----------
const CLIPX = [-0.72, 0, 0.72];
const clips = CLIPX.map(() => makeClip(VIOLET));
const tags = CLIPX.map(() => makeCoin());
const prompt = grp(); prompt.add(rbox(1.7, 0.26, 0.05, 0.08, mDark));
const promptRing = new THREE.Mesh(new THREE.PlaneGeometry(1.72, 0.28), glow(RED, 1.4)); promptRing.position.z = -0.03; prompt.add(promptRing);
prompt.add(txt(["PROMPT: \"MAKE IT EPIC\""], WHITE, 1.5, 0.04));
const bin = grp();
bin.add(new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.22, 0.42, 32, 1, true), new THREE.MeshStandardMaterial({ color: 0x5a1020, emissive: 0x401018, side: THREE.DoubleSide })));
const binRim = new THREE.Mesh(new THREE.TorusGeometry(0.3, 0.02, 8, 40), glow(RED, 2.0)); binRim.rotation.x = Math.PI / 2 - 0.35; binRim.position.y = 0.21; bin.add(binRim);
bin.rotation.x = 0.35;

// ---------- s3: clapperboard + GitHub star ----------
const clap = grp();
clap.add(rbox(1.1, 0.62, 0.08, 0.04, mDark));
clap.add(txt(["FILM STUDIO"], GREEN, 0.9, 0.05)).position.set(0, -0.06, 0.05);
const arm = new THREE.Group(); arm.position.set(-0.55, 0.36, 0); clap.add(arm);
const armBar = rbox(1.1, 0.14, 0.07, 0.02, mDark); armBar.position.set(0.55, 0.07, 0); arm.add(armBar);
for (let i = 0; i < 5; i++) { const s = new THREE.Mesh(new THREE.PlaneGeometry(0.11, 0.13), new THREE.MeshBasicMaterial({ color: 0xe8e2ff })); s.position.set(0.12 + i * 0.22, 0.07, 0.04); s.rotation.z = 0.5; arm.add(s); }
const fixBar = rbox(1.1, 0.1, 0.07, 0.02, mDark); fixBar.position.set(0, 0.3, 0); clap.add(fixBar);
for (let i = 0; i < 5; i++) { const s = new THREE.Mesh(new THREE.PlaneGeometry(0.11, 0.09), new THREE.MeshBasicMaterial({ color: 0xe8e2ff })); s.position.set(-0.43 + i * 0.22, 0.3, 0.04); s.rotation.z = -0.5; clap.add(s); }
const starShape = new THREE.Shape();
for (let i = 0; i < 10; i++) { const a = Math.PI / 2 + (i * Math.PI) / 5, r = i % 2 ? 0.17 : 0.4; starShape[i ? "lineTo" : "moveTo"](Math.cos(a) * r, Math.sin(a) * r); }
const star = new THREE.Mesh(new THREE.ExtrudeGeometry(starShape, { depth: 0.08, bevelEnabled: true, bevelSize: 0.03, bevelThickness: 0.03, bevelSegments: 2 }), glow(ORANGE, 1.5));
root.add(star);

// ---------- s4: prompt bubble, script page, shots, timeline ----------
const bubble = grp(); bubble.add(rbox(1.7, 0.3, 0.05, 0.1, std(0x5a4fe0, 0x2a2090, 0.35, 0.2)));
const tail = new THREE.Mesh(new THREE.ConeGeometry(0.07, 0.14, 3), std(0x5a4fe0, 0x2a2090)); tail.position.set(-0.6, -0.18, 0); tail.rotation.z = Math.PI; bubble.add(tail);
bubble.add(txt(["\"MAKE A 60-SECOND FILM\""], WHITE, 1.5, 0.04));
const page = grp(); page.add(rbox(0.5, 0.64, 0.05, 0.04, mLav));
for (let i = 0; i < 5; i++) { const l = new THREE.Mesh(new THREE.PlaneGeometry(i % 2 ? 0.26 : 0.34, 0.025), new THREE.MeshBasicMaterial({ color: 0x6a5fd0 })); l.position.set(-0.03, 0.1 - i * 0.07, 0.03); page.add(l); }
const pageBand = new THREE.Mesh(new THREE.PlaneGeometry(0.42, 0.11), glow(0x4a3fb0, 1.0)); pageBand.position.set(0, 0.23, 0.03); page.add(pageBand);
page.add(txt(["SCRIPT"], WHITE, 0.36, 0.035)).position.set(0, 0.23, 0.035);
const SHOTC = [0x3a8cff, ORANGE, GREEN];
const shots = SHOTC.map((c) => makeClip(c, 0.44));
const SHOT_A = [SCR(-0.05, 0.82, 0.08), SCR(0.42, 0.82, 0.08), SCR(0.89, 0.82, 0.08)];
const SHOT_B = [SCR(-0.44, 0.36, 0.08), SCR(0, 0.36, 0.08), SCR(0.44, 0.36, 0.08)];
const strip = grp(); strip.add(rbox(1.5, 0.42, 0.03, 0.04, std(0x2a2290, 0x1a1460, 0.5, 0.2)));
const playhead = new THREE.Mesh(new THREE.PlaneGeometry(0.02, 0.5), glow(WHITE, 1.6)); playhead.position.z = 0.09; strip.add(playhead);

// ---------- s5: cost tag + storyboard with checks ----------
const costTag = grp(); costTag.add(rbox(1.3, 0.3, 0.05, 0.1, std(0x1f7a4a, 0x0f5a33, 0.4, 0.2)));
costTag.add(txt(["COST SHOWN FIRST"], WHITE, 1.15, 0.04));
const SCX = [-0.84, -0.28, 0.28, 0.84], SCC = [0x3a8cff, ORANGE, GREEN, VIOLET];
const scenes = SCX.map((_, i) => makeClip(SCC[i], 0.48));
const checks = SCX.map(() => makeCheck());

// ---------- s6: banana film, price, real footage cut ----------
const film = makeClip(0x2a6ad0, 1.1);
const banana = new THREE.Group(); film.add(banana);
const bCurve = new THREE.CatmullRomCurve3([new THREE.Vector3(-0.26, 0.06, 0), new THREE.Vector3(-0.12, -0.08, 0), new THREE.Vector3(0.08, -0.09, 0), new THREE.Vector3(0.26, 0.05, 0)]);
const bGeo = new THREE.TubeGeometry(bCurve, 32, 0.06, 16, false);
const pos = bGeo.attributes.position; // taper the ends
for (let i = 0; i < pos.count; i++) { const seg = Math.floor(i / 17) / 32, k = 0.35 + 0.65 * Math.sin(Math.PI * seg); const c = bCurve.getPoint(seg); pos.setXYZ(i, c.x + (pos.getX(i) - c.x) * k, c.y + (pos.getY(i) - c.y) * k, c.z + (pos.getZ(i) - c.z) * k); }
bGeo.computeVertexNormals();
banana.add(new THREE.Mesh(bGeo, std(0xffd23a, 0x8a6a00, 0.4, 0.05)));
[[-0.27, 0.07], [0.27, 0.06]].forEach(([x, y]) => { const t = new THREE.Mesh(new THREE.SphereGeometry(0.025, 10, 8), std(0x4a3010, 0x1a1000)); t.position.set(x, y, 0); banana.add(t); });
banana.position.z = 0.09;
const price = grp(); price.add(rbox(0.8, 0.3, 0.05, 0.1, std(0x1f7a4a, 0x0f5a33, 0.4, 0.2))); price.add(txt(["$1.33"], WHITE, 0.7, 0.04));
const REAL = [0x3a8cff, 0x2fbf6a, 0xd08a3a, 0x7a9aff];
const reel = REAL.map((c) => makeClip(c, 0.48));
const cutLine = new THREE.Mesh(new THREE.PlaneGeometry(0.03, 0.62), glow(WHITE, 2.2)); cutLine.rotation.x = -0.12; root.add(cutLine);
const freeTag = grp(); freeTag.add(rbox(0.8, 0.3, 0.05, 0.1, std(0x1f7a4a, 0x0f5a33, 0.4, 0.2))); freeTag.add(txt(["FREE"], WHITE, 0.6, 0.04));

// ---------- captions ----------
title("NEVER LET AI SPEND BLIND");
cap("s1", "before", ["BEFORE THE PLAN?"], RED, { until: ["s1", "exploring"] });
cap("s1", "exploring", ["EXPLORING GITHUB REPOS"], WHITE, { until: "s1" });
cap("s2", "costs", ["EVERY CLIP COSTS MONEY"], RED, { until: ["s2", "bad"] });
cap("s2", "bad", ["ONE BAD PROMPT"], RED, { until: ["s2", "shots"] });
cap("s2", "shots", ["THROWN AWAY"], RED, { boom: 0.5 });
cap("s3", "openmontage", ["OPENMONTAGE"], GREEN, { until: ["s3", "over"], boom: 0.5 });
cap("s3", "over", ["OVER 80,000 STARS", "IN 7 MONTHS"], ORANGE, { until: ["s3", "it's"], boom: 0.5 });
cap("s3", "it's", ["OPEN SOURCE"], GREEN, { until: ["s3", "turns"] });
cap("s3", "turns", ["A WHOLE FILM STUDIO"], GREEN, { boom: 0.4 });
cap("s4", "describe", ["DESCRIBE THE VIDEO"], VIOLET, { until: ["s4", "writes"] });
cap("s4", "writes", ["IT WRITES THE SCRIPT"], VIOLET, { until: ["s4", "makes"] });
cap("s4", "makes", ["MAKES THE SHOTS"], VIOLET, { until: ["s4", "edits"] });
cap("s4", "edits", ["EDITS THE CUT"], GREEN, { boom: 0.4 });
cap("s5", "shows", ["COST BEFORE IT STARTS"], GREEN, { until: ["s5", "approve"] });
cap("s5", "approve", ["APPROVE EVERY SCENE"], GREEN, { boom: 0.4 });
cap("s6", "60", ["60-SECOND FILM"], VIOLET, { until: ["s6", "cost"] });
cap("s6", "cost", ["TOTAL COST: $1.33"], GREEN, { until: ["s6", "cut"], boom: 0.5 });
cap("s6", "cut", ["REAL FOOTAGE, FREE"], GREEN);
endCard(["DON'T PAY BLIND.", "APPROVE EVERY SCENE."]);
boom("s2", "burns", 0.6);

// ---------- timings (global seconds) ----------
const T = {
  spend: g("s1", "spend"), plan: g("s1", "plan"), s2: S.s2[0], costs: g("s2", "costs"), bad: g("s2", "bad"), burns: g("s2", "burns"), shots: g("s2", "shots"),
  s3: S.s3[0], over: g("s3", "over"), its: g("s3", "it's"), turns: g("s3", "turns"), film: g("s3", "film"),
  s4: S.s4[0], writes: g("s4", "writes"), makes: g("s4", "makes"), edits: g("s4", "edits"),
  s5: S.s5[0], approve: g("s5", "approve"), one1: g("s5", "one", 1), by: g("s5", "by"), one2: g("s5", "one", 2),
  s6: S.s6[0], cost6: g("s6", "cost"), also: g("s6", "also"), cut: g("s6", "cut"), free: g("s6", "free"), s7: S.s7[0], s8: S.s8[0],
};
const CHECK_AT = [T.approve + 0.1, T.one1, T.by, T.one2];
const v = new THREE.Vector3();
const pulse01 = (a, b, t, fi = 0.25, fo = 0.2) => sm(a - 0.1, a + fi, t) * (1 - sm(b - fo, b, t));

// ---------- shots: [cx,cy,cz, lx,ly,lz, fov] ----------
const SH = [
  { at: 0, K: [[0, [0.3, 1.8, 5.6, 0, 0.9, -0.5, 48]], [S.s2[0], [0.1, 1.7, 5.1, 0, 0.95, -0.6, 48]]] },
  { at: T.s2, K: [[0, [-0.5, 1.6, 5.2, 0, 0.95, -0.6, 46]], [4.6, [0.3, 1.6, 5.0, 0, 0.95, -0.6, 46]]] },
  { at: T.s3, K: [[0, [-0.6, 2.1, 5.8, 0, 1.0, -0.6, 48]], [3.6, [0.2, 1.8, 5.2, 0, 1.0, -0.6, 46]]] },
  { at: T.its - 0.1, K: [[0, [0.5, 1.7, 5.2, 0, 0.95, -0.6, 46]], [4.4, [0.2, 1.6, 5.0, 0, 0.95, -0.6, 46]]] },
  { at: T.s4, K: [[0, [-0.5, 1.7, 5.2, 0, 0.95, -0.6, 46]], [3.6, [-0.2, 1.6, 5.0, 0, 0.95, -0.6, 46]]] },
  { at: T.s5, K: [[0, [0.5, 1.6, 5.0, 0, 0.95, -0.6, 46]], [3.7, [0.2, 1.7, 5.2, 0, 0.95, -0.6, 46]]] },
  { at: T.s6, K: [[0, [-0.4, 1.7, 5.2, 0, 0.95, -0.6, 46]], [5.5, [0.2, 1.6, 5.0, 0, 0.95, -0.6, 46]]] },
  { at: T.s7, K: [[0, [0, 2.4, 6.0, 0, 1.1, -0.6, 50]], [1.0, [0, 2.8, 7.4, 0, 1.6, -1.0, 50]], [2, [0.3, 3.0, 7.8, 0, 1.6, -1.0, 50]]] },
];

const place = (o, p, s) => { o.position.copy(p); o.scale.setScalar(s); o.visible = s > 0.01; };
run("openmontage-world", (t) => {
  root.visible = t < T.s8 - 0.12; // hide the scene before the CTA fades in
  const wrong = t < T.s3;
  accent.material.color.set(wrong ? (t >= T.spend ? RED : VIOLET) : GREEN).multiplyScalar(1.6);
  mScreen.color.set(wrong ? 0x0b0a26 : 0x0a1a1a);

  // s1: coin stack on screen, coins hop one by one into the AI box; red ? on "plan"
  const s1on = sm(S.s1[0] + 0.05, S.s1[0] + 0.35, t) * (1 - sm(T.s2 - 0.15, T.s2 + 0.05, t));
  place(ai, AIP, s1on); aiRing.rotation.z = t * 2;
  coins.forEach((c, i) => {
    const j = COIN_N - 1 - i, a = T.spend + 0.32 * j, f = sm(a, a + 0.35, t);
    v.copy(STACK(i)).lerp(AIP, f); v.y += Math.sin(Math.PI * f) * 0.35;
    place(c, v, s1on * (1 - sm(0.7, 1, f)) * 0.9); c.rotation.set(-Math.PI / 2 * (1 - sm(0, 0.3, f)) - 0.12, f * 6, 0); // flat in the stack, faces the camera in flight
  });
  const qk = sm(T.plan - 0.1, T.plan + 0.2, t) * s1on;
  qmark.visible = qk > 0.01; qmark.position.copy(SCR(0.42, 0.9, 0.2)); qmark.scale.setScalar(qk * 1.3 * (1 + 0.05 * Math.sin(t * 7))); qmark.rotation.x = -0.12; qmark.material.opacity = qk;

  // s2: three clips pop in, a coin drops under each, bad prompt turns them red, they fall into the bin
  const binK = sm(T.shots - 0.3, T.shots - 0.05, t) * (1 - sm(T.s3 - 0.1, T.s3 + 0.1, t));
  place(bin, SCR(0, 0.28, 0.3), binK * 0.9);
  clips.forEach((c, i) => {
    const on = sm(T.s2 + 0.05 + 0.15 * i, T.s2 + 0.3 + 0.15 * i, t), fall = sm(T.shots - 0.1 + 0.12 * i, T.shots + 0.35 + 0.12 * i, t);
    v.copy(SCR(CLIPX[i], 0.98, 0.1)).lerp(SCR(0, 0.4, 0.3), fall);
    place(c, v, on * (1 - 0.75 * fall) * (fall > 0.97 ? 0 : 1)); c.rotation.z = fall * (i - 1) * 1.2;
    const red = sm(T.burns + 0.1 * i, T.burns + 0.2 + 0.1 * i, t);
    setPic(c, red > 0.5 ? RED : VIOLET, red > 0.5 ? 1.2 + 0.5 * Math.sin(t * 20 + i) : 0.9);
  });
  tags.forEach((c, i) => {
    const a = T.costs + 0.12 * i, k = sm(a, a + 0.25, t) * (1 - sm(T.bad - 0.2, T.bad, t));
    place(c, SCR(CLIPX[i], 0.52 + 0.12 * (1 - sm(a, a + 0.25, t)), 0.1), k * 0.9); c.rotation.y = (t - a) * 3;
  });
  const pk = sm(T.bad - 0.15, T.bad + 0.15, t) * (1 - sm(T.shots - 0.45, T.shots - 0.3, t));
  place(prompt, SCR(0, 0.45, 0.12), pk * 0.85);

  // s3: clapper on "Instead", snaps on "film"; star above the laptop on the star line
  const ck = sm(T.s3 - 0.05, T.s3 + 0.25, t) * (1 - sm(T.s4 - 0.15, T.s4 + 0.05, t));
  place(clap, SCR(0, 0.6, 0.12), ck);
  arm.rotation.z = 0.45 * (1 - sm(T.film, T.film + 0.15, t));
  const sk = sm(T.over - 0.1, T.over + 0.25, t) * (1 - sm(T.its - 0.15, T.its + 0.1, t));
  star.visible = sk > 0.01; star.scale.setScalar(0.42 * sk * (1 + 0.08 * Math.sin(t * 6)));
  star.position.set(0, 1.84, -0.3); star.rotation.y = 0.35 * Math.sin((t - T.over) * 2.5);

  // s4: bubble, script page, shots, then the shots line up on the timeline
  const s4end = 1 - sm(T.s5 - 0.15, T.s5 + 0.05, t);
  place(bubble, SCR(0, 1.28, 0.1), sm(T.s4 - 0.05, T.s4 + 0.2, t) * s4end * 0.95);
  place(page, SCR(-0.75, 0.68, 0.08), sm(T.writes - 0.1, T.writes + 0.2, t) * (1 - sm(T.edits - 0.1, T.edits + 0.15, t)) * s4end);
  const lineUp = sm(T.edits, T.edits + 0.45, t);
  shots.forEach((c, i) => {
    const k = sm(T.makes - 0.1 + 0.12 * i, T.makes + 0.15 + 0.12 * i, t) * s4end;
    place(c, v.copy(SHOT_A[i]).lerp(SHOT_B[i], lineUp), k);
  });
  place(strip, SCR(0, 0.36, 0.04), sm(T.edits - 0.1, T.edits + 0.2, t) * s4end);
  playhead.position.x = -0.7 + 1.4 * sm(T.edits + 0.4, T.s5 - 0.1, t);

  // s5: cost tag first, then four scenes, each gets a green check
  const s5end = 1 - sm(T.s6 - 0.15, T.s6 + 0.05, t);
  place(costTag, SCR(0, 1.25, 0.1), sm(T.s5 - 0.05, T.s5 + 0.2, t) * s5end);
  scenes.forEach((c, i) => {
    place(c, SCR(SCX[i], 0.72, 0.08), sm(T.s5 + 0.05 + 0.1 * i, T.s5 + 0.3 + 0.1 * i, t) * s5end);
    const ok = sm(CHECK_AT[i], CHECK_AT[i] + 0.15, t);
    place(checks[i], SCR(SCX[i], 0.35, 0.12), ok * s5end * 1.3);
    setPic(c, SCC[i], 0.5 + 0.6 * ok);
  });

  // s6: banana film + price, then real footage strip with a cut and FREE
  const s6end = 1 - sm(T.s7 - 0.15, T.s7, t);
  const filmK = sm(T.s6 - 0.05, T.s6 + 0.2, t) * (1 - sm(T.also - 0.1, T.also + 0.1, t));
  place(film, SCR(0, 0.86, 0.1), filmK); banana.rotation.z = 0.15 * Math.sin(t * 3);
  place(price, SCR(0, 0.33, 0.14), sm(T.cost6 + 0.2, T.cost6 + 0.45, t) * (1 - sm(T.also - 0.1, T.also + 0.1, t)));
  const gap = sm(T.cut, T.cut + 0.3, t);
  reel.forEach((c, i) => {
    const x = (i - 1.5) * 0.5 + (i < 2 ? -0.08 : 0.08) * gap;
    place(c, SCR(x, 0.86, 0.08), sm(T.also - 0.1 + 0.06 * i, T.also + 0.15 + 0.06 * i, t) * s6end);
  });
  const cl = sm(T.cut - 0.05, T.cut + 0.1, t) * (1 - sm(T.cut + 0.35, T.cut + 0.55, t));
  cutLine.visible = cl > 0.01; cutLine.position.copy(SCR(0, 0.86, 0.14)); cutLine.scale.set(1, cl, 1);
  place(freeTag, SCR(0, 0.33, 0.14), sm(T.free - 0.1, T.free + 0.15, t) * s6end);

  const { punch } = shoot(SH, t);
  const spike = overlays(t);
  bloom.strength = 1.0 + 1.2 * punch * punch + spike;
});
