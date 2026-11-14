// NEVER APPLY EVERYWHERE (Career-Ops). Laptop on a dark desk; wrong = one CV sprayed at a wall of jobs, an AI filter drops them all,
// right = paste a job ad, check it is open, score 1-5 against your CV, skip under 4, draft CV + letter + answers, you press Submit.
import { THREE, S, g, sm, scene, bloom, glow, tube, VIOLET, ORANGE, RED, GREEN, WHITE, shoot, run } from "./kit.js";
import { title, cap, boom, endCard, overlays, fitText } from "./extra.js";
import { RoundedBoxGeometry } from "three/addons/geometries/RoundedBoxGeometry.js";

const std = (c, e, r = 0.45, m = 0.25) => new THREE.MeshStandardMaterial({ color: c, emissive: e, roughness: r, metalness: m });
const rbox = (w, h, d, r, mat) => new THREE.Mesh(new RoundedBoxGeometry(w, h, d, 4, r), mat);
const mBody = std(0x4a42c8, 0x1c1766, 0.35, 0.35), mDark = std(0x14123a, 0x07061a, 0.6, 0.2);
const root = new THREE.Group(); scene.add(root); // everything in the world; hidden before the CTA
const add = (o) => { root.add(o); return o; };
const txt = (lines, hex, w, k = 1.0) => { const t = fitText(lines, hex, k, w); t.visible = true; return t; };

// ---------- desk + room lights ----------
const desk = add(rbox(9, 0.3, 5, 0.12, std(0x221d66, 0x0c0a30, 0.7, 0.1))); desk.position.set(0, -0.14, -0.6);
const pl = add(new THREE.PointLight(0xe8e2ff, 18, 9, 1.6)); pl.position.set(-1.6, 3.2, 2.2);
const rim = add(new THREE.PointLight(0xff8a3a, 10, 8, 1.6)); rim.position.set(2.6, 2.2, -2.4);

// ---------- laptop at the origin, screen faces +z (same as filee) ----------
const base = add(rbox(2.6, 0.1, 1.7, 0.04, mBody)); base.position.set(0, 0.05, 0);
const keysM = add(rbox(2.2, 0.02, 0.8, 0.01, mDark)); keysM.position.set(0, 0.105, -0.2);
const pad = add(rbox(0.8, 0.02, 0.45, 0.01, mDark)); pad.position.set(0, 0.105, 0.5);
const lid = new THREE.Group(); lid.position.set(0, 0.1, -0.85); lid.rotation.x = -0.12; root.add(lid);
const screen = rbox(2.6, 1.7, 0.06, 0.04, mBody); screen.position.set(0, 0.85, 0); lid.add(screen);
const mScreen = new THREE.MeshBasicMaterial({ color: 0x0b0a26, toneMapped: false });
const face = new THREE.Mesh(new THREE.PlaneGeometry(2.4, 1.5), mScreen); face.position.set(0, 0.85, 0.035); lid.add(face);
const bar = new THREE.Mesh(new THREE.PlaneGeometry(2.4, 0.12), glow(VIOLET, 0.35)); bar.position.set(0, 1.54, 0.037); lid.add(bar);
const accent = new THREE.Mesh(new THREE.PlaneGeometry(2.4, 0.015), glow(VIOLET, 1.6)); accent.position.set(0, 1.475, 0.038); lid.add(accent);
[-1.08, -0.98, -0.88].forEach((x, i) => { const d = new THREE.Mesh(new THREE.CircleGeometry(0.025, 16), glow([RED, ORANGE, GREEN][i], 1.2)); d.position.set(x, 1.54, 0.039); lid.add(d); });
const SCR = (x, y) => new THREE.Vector3(x, 0.1 + y, -0.85 + 0.12 * y + 0.25); // point just in front of the screen

// ---------- CV: lavender page, round photo, text lines, "CV" ----------
const mLav = std(0xc9c0ff, 0x4a3fb0, 0.4, 0.1), mRedCV = glow(RED, 0.9);
function makeCV() {
  const gp = new THREE.Group();
  gp.add(rbox(0.56, 0.72, 0.05, 0.04, mLav));
  const ph = new THREE.Mesh(new THREE.CircleGeometry(0.09, 20), glow(VIOLET, 0.9)); ph.position.set(-0.15, 0.2, 0.03); gp.add(ph);
  [0.24, 0.16].forEach((y) => { const l = new THREE.Mesh(new THREE.PlaneGeometry(0.2, 0.025), new THREE.MeshBasicMaterial({ color: 0x6a5fd0 })); l.position.set(0.1, y, 0.03); gp.add(l); });
  const t = txt(["CV"], 0x2a1f8a, 0.42, 0.9); t.position.set(0, -0.1, 0.032); gp.add(t);
  add(gp); gp.visible = false; return gp;
}
// ---------- job ad card: dark card, colored header, "JOB AD", lines ----------
function makeJob(hex, label = "JOB AD") {
  const gp = new THREE.Group();
  const mat = std(0x2c2680, 0x14105a, 0.4, 0.2);
  gp.add(rbox(0.9, 0.62, 0.05, 0.04, mat));
  const head = new THREE.Mesh(new THREE.PlaneGeometry(0.82, 0.16), glow(hex, 1.0)); head.position.set(0, 0.2, 0.03); gp.add(head);
  const t = txt([label], WHITE, 0.6, 1.0); t.position.set(0, 0.2, 0.033); gp.add(t);
  [-0.02, -0.12, -0.22].forEach((y, i) => { const l = new THREE.Mesh(new THREE.PlaneGeometry(0.6 - i * 0.12, 0.03), new THREE.MeshBasicMaterial({ color: 0x8a80e0 })); l.position.set(-0.08 + i * 0.06 * 0, y, 0.03); gp.add(l); });
  gp.userData = { head, mat, t };
  add(gp); gp.visible = false; return gp;
}
const INK = new THREE.Color(0x140f3a), PAPER = new THREE.Color(WHITE).multiplyScalar(0.7);
const tint = (j, hex, k = 1) => { j.userData.head.material.color.set(hex).multiplyScalar(k); j.userData.t.material.color.copy(hex === RED ? PAPER : INK); }; // dark label on light headers

// ---------- s1/s2: a wall of 9 jobs behind the laptop, one CV copy each ----------
const WALL = [];
for (let r = 0; r < 3; r++) for (let c = 0; c < 3; c++) WALL.push(new THREE.Vector3(-1.05 + c * 1.05, 3.6 - r * 0.75, -3.0));
const wallJobs = WALL.map((p) => { const j = makeJob(RED); j.position.copy(p); return j; });
const homeCV = makeCV();
const copies = WALL.map(() => makeCV());
const scanBar = add(new THREE.Mesh(new THREE.PlaneGeometry(3.6, 0.06), glow(RED, 2.4))); scanBar.visible = false;
// s2 end: empty inbox on the screen
const env = new THREE.Group(); add(env);
env.add(rbox(0.9, 0.6, 0.04, 0.03, mLav));
env.add(tube([-0.43, 0.28, 0.03], [0, -0.02, 0.03], 0.025, glow(VIOLET, 1.4)), tube([0.43, 0.28, 0.03], [0, -0.02, 0.03], 0.025, glow(VIOLET, 1.4)));
const badge = new THREE.Mesh(new THREE.CircleGeometry(0.17, 28), glow(RED, 1.3)); badge.position.set(0.45, 0.3, 0.05); env.add(badge);
const zero = txt(["0"], WHITE, 0.4, 1.2); zero.position.set(0.45, 0.3, 0.06); env.add(zero);

// ---------- s3: three small job cards on screen, you filter them ----------
const pick = [makeJob(VIOLET, "JOB"), makeJob(VIOLET, "JOB"), makeJob(VIOLET, "JOB")];

// ---------- s4/s5: pasted job ad, OPEN badge, your CV, score pips 1..5 ----------
const job = makeJob(VIOLET);
const openB = new THREE.Group(); job.add(openB);
openB.add(rbox(0.42, 0.16, 0.03, 0.06, std(0x1f7a4a, 0x0f5a33, 0.4, 0.2)));
const ot = txt(["OPEN"], WHITE, 0.36, 1.0); ot.position.z = 0.02; openB.add(ot); openB.position.set(0.3, 0.47, 0.05);
const myCV = makeCV();
const job2 = makeJob(VIOLET);
const pips = [1, 2, 3, 4, 5].map((n) => {
  const p = new THREE.Group();
  const d = new THREE.Mesh(new THREE.CylinderGeometry(0.11, 0.11, 0.04, 28), std(0x2c2680, 0x14105a, 0.4, 0.2)); d.rotation.x = Math.PI / 2; p.add(d);
  const ring = new THREE.Mesh(new THREE.TorusGeometry(0.11, 0.012, 6, 28), glow(VIOLET, 1.2)); ring.position.z = 0.025; p.add(ring);
  const t = txt([String(n)], WHITE, 0.3, 1.0); t.position.z = 0.03; p.add(t);
  p.userData = { d, ring, t }; add(p); p.visible = false; return p;
});
const litPip = (p, hex) => { p.userData.d.material.emissive.set(hex ?? 0x14105a).multiplyScalar(hex ? 0.6 : 1); p.userData.t.material.color.copy(hex ? INK : PAPER); p.userData.ring.material.color.set(hex ?? VIOLET).multiplyScalar(1.2); };
// s5: the three drafts
const drafts = [["CV"], ["COVER", "LETTER"], ["ANSWERS"]].map((l) => {
  const gp = new THREE.Group();
  gp.add(rbox(0.62, 0.8, 0.05, 0.04, mLav));
  const band = new THREE.Mesh(new THREE.PlaneGeometry(0.54, 0.3), glow(GREEN, 0.9)); band.position.set(0, -0.12, 0.03); gp.add(band);
  [0.27, 0.2, 0.13].forEach((y) => { const ln = new THREE.Mesh(new THREE.PlaneGeometry(0.42, 0.025), new THREE.MeshBasicMaterial({ color: 0x6a5fd0 })); ln.position.set(0, y, 0.03); gp.add(ln); });
  const t = txt(l, 0x0a3a20, 0.5, 1.0); t.position.set(0, -0.12, 0.032); gp.add(t);
  add(gp); gp.visible = false; return gp;
});

// ---------- s6: SUBMIT button + cursor, then 740 jobs -> 68 applications ----------
const submit = new THREE.Group(); add(submit);
const mSub = std(0x1f7a4a, 0x0f5a33, 0.4, 0.2);
submit.add(rbox(1.3, 0.4, 0.08, 0.08, mSub));
const st = txt(["SUBMIT"], WHITE, 0.95, 1.0); st.position.z = 0.05; submit.add(st);
const cursor = add(new THREE.Mesh(new THREE.ConeGeometry(0.07, 0.2, 3), glow(WHITE, 1.4))); cursor.rotation.z = 0.5;
const N = 740, COLS = 37, ROWS = 20, SP = 0.1;
const dots = new THREE.InstancedMesh(new THREE.BoxGeometry(0.075, 0.075, 0.03), new THREE.MeshBasicMaterial({ toneMapped: false }), N); add(dots);
const RANK = [...Array(N).keys()].sort((a, b) => ((Math.sin(a * 12.9898) * 43758.5453) % 1 + 1) % 1 - ((Math.sin(b * 12.9898) * 43758.5453) % 1 + 1) % 1);
const KEEP = new Set(RANK.slice(0, 68)); console.assert(KEEP.size === 68);
const kept = (i) => KEEP.has(i); // exactly 68 of 740, scattered
const M4 = new THREE.Matrix4(), C3 = new THREE.Color(), DIM = new THREE.Color(VIOLET).multiplyScalar(0.55), OFF = new THREE.Color(0x2a2470), ON = new THREE.Color(GREEN).multiplyScalar(1.6);
const dotPos = (i) => [(-(COLS - 1) / 2 + (i % COLS)) * SP, 2.05 + Math.floor(i / COLS) * SP, -2.4];

// ---------- s3: GitHub star (copied from filee) ----------
const starShape = new THREE.Shape();
for (let i = 0; i < 10; i++) { const a = Math.PI / 2 + (i * Math.PI) / 5, r = i % 2 ? 0.17 : 0.4; starShape[i ? "lineTo" : "moveTo"](Math.cos(a) * r, Math.sin(a) * r); }
const star = add(new THREE.Mesh(new THREE.ExtrudeGeometry(starShape, { depth: 0.08, bevelEnabled: true, bevelSize: 0.03, bevelThickness: 0.03, bevelSegments: 2 }), glow(ORANGE, 1.5)));

// ---------- captions ----------
title("NEVER APPLY EVERYWHERE");
cap("s1", "same", ["SAME CV, EVERY JOB"], RED, { until: ["s1", "exploring"] });
cap("s1", "exploring", ["EXPLORING GITHUB REPOS"], WHITE, { until: "s1" });
cap("s2", "filter", ["AI FILTERS YOU OUT"], RED, { until: ["s2", "never"], boom: 0.5 });
cap("s2", "never", ["NO REPLY"], RED, { boom: 0.4 });
cap("s3", "careerops", ["CAREER-OPS"], GREEN, { until: ["s3", "over"], boom: 0.5 });
cap("s3", "over", ["OVER 82,000 STARS", "IN 7 MONTHS"], ORANGE, { until: ["s3", "it's"], boom: 0.5 });
cap("s3", "it's", ["FREE AI AGENT"], GREEN, { until: ["s3", "lets"] });
cap("s3", "lets", ["YOU FILTER THE COMPANIES"], GREEN);
cap("s4", "paste", ["PASTE A JOB AD"], VIOLET, { until: ["s4", "checks"] });
cap("s4", "checks", ["STILL OPEN?"], GREEN, { until: ["s4", "scores"], boom: 0.4 });
cap("s4", "scores", ["SCORED 1 TO 5", "AGAINST YOUR CV"], GREEN);
cap("s5", "under", ["UNDER 4? SKIP IT"], RED, { until: ["s5", "worth"], boom: 0.4 });
cap("s5", "worth", ["WORTH IT?"], GREEN, { until: ["s5", "writes"] });
cap("s5", "writes", ["CV, COVER LETTER, ANSWERS"], GREEN);
cap("s6", "never", ["IT NEVER APPLIES"], VIOLET, { until: ["s6", "press"] });
cap("s6", "press", ["YOU PRESS SUBMIT"], GREEN, { until: ["s6", "its"], boom: 0.5 });
cap("s6", "its", ["740 JOBS TRIED"], VIOLET, { until: ["s6", "sent"] });
cap("s6", "sent", ["ONLY 68 APPLICATIONS"], GREEN, { boom: 0.5 });
endCard(["STOP APPLYING EVERYWHERE.", "APPLY BETTER TO FEWER."]);

// ---------- timings (global seconds) ----------
const T = {
  same: g("s1", "same"), every: g("s1", "every"), filt: g("s2", "filter"), drop: g("s2", "dropped"), nev: g("s2", "never"),
  s3: S.s3[0], over: g("s3", "over"), its3: g("s3", "it's"), agent: g("s3", "agent"), filt3: g("s3", "filter"),
  paste: g("s4", "paste"), checks: g("s4", "checks"), open: g("s4", "open"), scores: g("s4", "scores"), p1: g("s4", "1"), p5: g("s4", "5"),
  under: g("s5", "under"), skip: g("s5", "skip"), worth: g("s5", "worth"), writes: g("s5", "writes"),
  cv: g("s5", "cv"), cover: g("s5", "cover"), answers: g("s5", "answers"),
  s6: S.s6[0], press: g("s6", "press"), its6: g("s6", "its"), n740: g("s6", "740"), sent: g("s6", "sent"), n68: g("s6", "68"),
  s7: S.s7[0], s8: S.s8[0],
};
boom("s2", "dropped", 0.6);
const HOME = SCR(0, 0.85), v = new THREE.Vector3();

// ---------- shots: [cx,cy,cz, lx,ly,lz, fov] ----------
const WIDE = [0, 2.6, 6.8, 0, 2.3, -2.0, 52];
const SH = [
  { at: 0, K: [[0, [0.3, 1.8, 5.6, 0, 0.9, -0.5, 48]], [2.0, [0.1, 1.8, 5.1, 0, 1.0, -0.6, 48]]] },
  { at: T.every - 0.15, K: [[0, WIDE], [2.5, [0.3, 2.7, 6.4, 0, 2.4, -2.2, 52]]] },
  { at: T.filt - 0.1, K: [[0, [0.4, 2.9, 3.6, 0, 2.75, -3.0, 50]], [2.5, [0.1, 2.8, 3.3, 0, 2.6, -3.0, 50]]] },
  { at: T.nev - 0.1, K: [[0, [0.2, 1.7, 4.6, 0, 1.0, -0.6, 46]], [1.5, [0, 1.7, 4.3, 0, 1.0, -0.6, 46]]] },
  { at: T.s3, K: [[0, [-0.6, 2.1, 5.8, 0, 1.0, -0.6, 48]], [4.5, [0.2, 1.8, 5.2, 0, 1.0, -0.6, 46]]] },
  { at: S.s4[0], K: [[0, [0.5, 1.7, 5.2, 0, 0.95, -0.6, 46]], [5.5, [0.2, 1.6, 4.8, 0, 0.95, -0.6, 46]]] },
  { at: S.s5[0], K: [[0, [-0.5, 1.7, 5.2, 0, 0.95, -0.6, 46]], [2.0, [-0.2, 1.7, 5.4, 0, 1.0, -0.4, 46]], [4.6, [0, 1.8, 5.8, 0, 1.0, -0.3, 48]]] },
  { at: T.s6, K: [[0, [0.4, 1.7, 5.0, 0, 0.95, -0.6, 46]], [1.8, [0.2, 1.6, 4.7, 0, 0.9, -0.6, 46]]] },
  { at: T.its6 - 0.1, K: [[0, [0, 2.4, 5.6, 0, 1.5, -1.0, 50]], [1.0, [0, 3.0, 8.2, 0, 2.3, -1.4, 50]], [5, [0.3, 3.1, 8.6, 0, 2.3, -1.4, 50]]] },
  { at: T.s7, calm: 1, K: [[0, [0.3, 3.1, 8.6, 0, 2.3, -1.4, 50]], [3, [0.5, 3.3, 9.2, 0, 2.3, -1.4, 50]]] },
];

run("career-world", (t) => {
  const wrong = t < T.s3;
  root.visible = t < T.s8 - 0.1;
  accent.material.color.set(wrong ? (t >= T.filt ? RED : VIOLET) : GREEN).multiplyScalar(1.6);
  mScreen.color.set(wrong ? 0x0b0a26 : 0x0a1a1a);

  // s1: one CV on screen; on "same" it copies, on "every" the copies fly to the 9 jobs
  homeCV.visible = t < T.filt - 0.1; homeCV.position.copy(HOME); homeCV.scale.setScalar(1 + 0.08 * sm(T.same - 0.1, T.same + 0.2, t));
  const wallOn = t >= T.every - 0.15 && t < T.nev - 0.1;
  wallJobs.forEach((j, i) => { const k = sm(T.every - 0.15 + 0.04 * i, T.every + 0.2 + 0.04 * i, t); j.visible = wallOn && k > 0.01; j.scale.setScalar(k); });
  const dropK = sm(T.drop - 0.1, T.drop + 0.6, t);
  copies.forEach((c, i) => {
    const fan = sm(T.same, T.same + 0.4, t), fly = sm(T.every + 0.05 * i, T.every + 0.7 + 0.05 * i, t);
    c.visible = fan > 0.01 && t < T.nev - 0.1;
    const fanP = v.copy(HOME).add(new THREE.Vector3((i - 4) * 0.06 * fan, 0.02 * i * fan, 0.02 + 0.01 * i));
    const tgt = WALL[i].clone().add(new THREE.Vector3(0.28, -0.08, 0.12));
    c.position.copy(fanP).lerp(tgt, fly); c.position.y += Math.sin(fly * Math.PI) * 0.8;
    c.scale.setScalar(1 - 0.55 * fly);
    // s2: the red scan bar turns each copy red, then they all drop to the floor
    const hit = t >= T.filt + 0.2 + (3.6 - WALL[i].y) * 0.5;
    c.children[0].material = hit ? mRedCV : mLav;
    c.position.y -= dropK * (WALL[i].y - 0.25 + 0.15 * (i % 3)); c.rotation.z = dropK * (i % 2 ? 1.2 : -1.0);
  });
  // scan bar sweeps down the wall
  const sk = sm(T.filt, T.drop, t);
  scanBar.visible = t >= T.filt - 0.05 && t < T.drop + 0.3; scanBar.position.set(0, 3.95 - sk * 2.0, -2.85);

  // s2 end: empty inbox
  const ek = sm(T.nev - 0.1, T.nev + 0.2, t);
  env.visible = ek > 0.01 && t < T.s3; env.position.copy(SCR(0, 0.8)); env.rotation.x = -0.12; env.scale.setScalar(1.3 * ek);
  badge.scale.setScalar(1 + 0.15 * Math.sin(t * 9));

  // s3: star while the star count is on screen
  const sk3 = sm(T.over - 0.1, T.over + 0.25, t) * (1 - sm(T.its3 - 0.15, T.its3 + 0.1, t));
  star.visible = sk3 > 0.01; star.scale.setScalar(0.5 * sk3 * (1 + 0.08 * Math.sin(t * 6)));
  star.position.set(0, 2.0, -0.3); star.rotation.y = 0.35 * Math.sin((t - T.over) * 2.5);
  // s3: three jobs on screen; on "filter" two go red and shrink, the middle one turns green
  pick.forEach((j, i) => {
    const k = sm(T.agent - 0.1 + 0.08 * i, T.agent + 0.2 + 0.08 * i, t), f = sm(T.filt3, T.filt3 + 0.4, t);
    j.visible = k > 0.01 && t < S.s4[0];
    j.position.copy(SCR(-0.75 + 0.75 * i, 0.85)); j.rotation.x = -0.12;
    j.scale.setScalar(0.75 * k * (i === 1 ? 1 + 0.25 * f : 1 - 0.3 * f));
    tint(j, i === 1 ? (f > 0.5 ? GREEN : VIOLET) : (f > 0.5 ? RED : VIOLET), i === 1 ? 1.1 : 1 - 0.5 * f);
  });

  // s4: paste a job ad (slides in), OPEN badge, then your CV + score pips
  const pk = sm(T.paste - 0.1, T.paste + 0.35, t);
  const jobOn = t >= T.paste - 0.1 && t < T.writes + 0.2 && !(t >= T.under - 0.1 && t < T.worth);
  job.visible = jobOn; job.rotation.x = -0.12;
  const sideBySide = sm(T.scores - 0.2, T.scores + 0.2, t);
  const inS5 = t >= T.worth;
  job.position.copy(SCR(-1.6 * (1 - pk) - 0.55 * sideBySide * (inS5 ? 0 : 1), 0.95));
  if (inS5) job.position.copy(SCR(0, 0.95));
  job.scale.setScalar(1.05 * (inS5 ? 1 - sm(T.writes - 0.1, T.writes + 0.2, t) : 1));
  tint(job, inS5 ? GREEN : VIOLET, 1.0);
  const ob = sm(T.open - 0.15, T.open + 0.15, t);
  openB.visible = ob > 0.01; openB.scale.setScalar(ob * (1 + 0.25 * Math.max(0, 1 - Math.abs(t - T.open) / 0.3)));
  const ck = sideBySide * (1 - sm(T.under - 0.2, T.under, t));
  myCV.visible = ck > 0.01; myCV.position.copy(SCR(0.6, 0.95)); myCV.rotation.x = -0.12; myCV.scale.setScalar(0.85 * ck);
  // job 2 (s5, under 4): appears, scores 3, slides off on "skip"
  const j2 = sm(T.under - 0.1, T.under + 0.2, t), off = sm(T.skip - 0.05, T.skip + 0.4, t);
  job2.visible = j2 > 0.01 && off < 0.99; job2.rotation.x = -0.12;
  job2.position.copy(SCR(1.8 * off, 0.95)); job2.scale.setScalar(1.05 * j2 * (1 - 0.4 * off)); tint(job2, RED, 1 - 0.5 * off);
  // pips: s4 light 1..5 with the voice, s5 show 3 (red) then 4 (green)
  const pipOn = t >= T.scores - 0.2 && t < T.writes + 0.2;
  pips.forEach((p, i) => {
    const k = sm(T.scores - 0.2 + 0.05 * i, T.scores + 0.1 + 0.05 * i, t) * (1 - sm(T.writes - 0.1, T.writes + 0.2, t));
    p.visible = pipOn && k > 0.01; p.position.copy(SCR(-0.66 + 0.33 * i, 0.32)); p.rotation.x = -0.12; p.scale.setScalar(k);
    let hex = null;
    if (t < T.under - 0.1) { if (t >= T.p1 + (T.p5 - T.p1) * (i / 4) - 0.05) hex = GREEN; }
    else if (t < T.worth) { if (i < 3) hex = RED; }
    else if (i < 4 && t >= T.worth + 0.1 * i) hex = GREEN;
    litPip(p, hex);
  });
  // s5: three drafts pop out in front of the screen
  [T.cv, T.cover, T.answers].forEach((T0, i) => {
    const d = drafts[i], k = sm(T0 - 0.15, T0 + 0.2, t);
    d.visible = k > 0.01 && t < T.s6; d.position.set(-0.78 + 0.78 * i, 1.0 + 0.1 * (1 - k), 0.25); d.scale.setScalar(k);
    d.rotation.y = (1 - i) * 0.12;
  });

  // s6: SUBMIT button; the cursor (you) presses it
  const sb = sm(T.s6, T.s6 + 0.3, t);
  submit.visible = sb > 0.01 && t < T.its6 + 0.4; submit.position.copy(SCR(0, 0.8)); submit.rotation.x = -0.12; submit.scale.setScalar(sb);
  const pr = Math.max(0, 1 - Math.abs(t - T.press - 0.1) / 0.25);
  submit.position.z -= 0.05 * pr; mSub.emissive.set(0x0f5a33).lerp(new THREE.Color(GREEN), pr * 0.8);
  cursor.visible = t >= T.s6 + 0.1 && t < T.its6;
  cursor.position.copy(SCR(0.9, 0.3)).lerp(SCR(0.25, 0.68).add(new THREE.Vector3(0, 0, 0.1)), sm(T.s6 + 0.4, T.press - 0.05, t));
  // 740 jobs -> 68 applications
  const dOn = t >= T.n740 - 0.3 && t < T.s8;
  dots.visible = dOn;
  if (dOn) {
    const cut = sm(T.n68 - 0.1, T.n68 + 0.4, t);
    for (let i = 0; i < N; i++) {
      const k = sm(T.n740 - 0.3 + i * 0.0012, T.n740 + i * 0.0012, t);
      const [x, y, z] = dotPos(i);
      M4.makeScale(k, k, k).setPosition(x, y, z); dots.setMatrixAt(i, M4);
      dots.setColorAt(i, C3.copy(DIM).lerp(kept(i) ? ON : OFF, cut));
    }
    dots.instanceMatrix.needsUpdate = true; dots.instanceColor.needsUpdate = true;
  }

  const { punch } = shoot(SH, t);
  const spike = overlays(t);
  bloom.strength = Math.min(1.45, 0.9 + 0.8 * punch * punch + 0.6 * spike);
});
