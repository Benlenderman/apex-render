// NEVER TUNE IT BY HAND (Autoresearch). Laptop on a dark desk; wrong = you tweak one line at a time all night,
// right = an AI agent edits train.py, trains 5 min, keeps or throws out, 12 runs an hour.
import { THREE, S, g, sm, scene, bloom, glow, tube, VIOLET, ORANGE, RED, GREEN, WHITE, label, beam, shoot, run } from "./kit.js";
import { title, cap, boom, endCard, overlays, fitText } from "./extra.js";

import { RoundedBoxGeometry } from "three/addons/geometries/RoundedBoxGeometry.js";
const std = (c, e, r = 0.45, m = 0.25) => new THREE.MeshStandardMaterial({ color: c, emissive: e, roughness: r, metalness: m });
const rbox = (w, h, d, r, mat) => new THREE.Mesh(new RoundedBoxGeometry(w, h, d, 4, r), mat);
const mBody = std(0x4a42c8, 0x1c1766, 0.35, 0.35), mDark = std(0x14123a, 0x07061a, 0.6, 0.2), mLav = std(0xc9c0ff, 0x4a3fb0, 0.4, 0.1);
const mGreen = std(0x1f7a4a, 0x0f5a33, 0.4, 0.2);

// ---------- desk + room lights ----------
const desk = rbox(9, 0.3, 5, 0.12, std(0x221d66, 0x0c0a30, 0.7, 0.1)); desk.position.set(0.6, -0.14, -0.6); scene.add(desk);
const pl = new THREE.PointLight(0xe8e2ff, 18, 9, 1.6); pl.position.set(-1.6, 3.2, 2.2); scene.add(pl);
const rim = new THREE.PointLight(0xff8a3a, 10, 8, 1.6); rim.position.set(2.6, 2.2, -2.4); scene.add(rim);
const pl2 = new THREE.PointLight(0xe8e2ff, 12, 7, 1.6); pl2.position.set(3.0, 2.6, 2.4); scene.add(pl2);

// ---------- laptop at the origin, screen faces +z ----------
const base = rbox(2.6, 0.1, 1.7, 0.04, mBody); base.position.set(0, 0.05, 0); scene.add(base);
const keys = rbox(2.2, 0.02, 0.8, 0.01, mDark); keys.position.set(0, 0.105, -0.2); scene.add(keys);
const pad = rbox(0.8, 0.02, 0.45, 0.01, mDark); pad.position.set(0, 0.105, 0.5); scene.add(pad);
const lid = new THREE.Group(); lid.position.set(0, 0.1, -0.85); lid.rotation.x = -0.12; scene.add(lid);
const screen = rbox(2.6, 1.7, 0.06, 0.04, mBody); screen.position.set(0, 0.85, 0); lid.add(screen);
const onLid = (x, y, z = 0.05) => { lid.updateMatrixWorld(true); return lid.localToWorld(new THREE.Vector3(x, y, z)); };

// screen content = one canvas redrawn every frame from t
const SC = document.createElement("canvas"); SC.width = 1024; SC.height = 640; const X = SC.getContext("2d");
const scTex = new THREE.CanvasTexture(SC);
const face = new THREE.Mesh(new THREE.PlaneGeometry(2.4, 1.5), new THREE.MeshBasicMaterial({ map: scTex, color: 0xd8d8d8, toneMapped: false })); face.position.set(0, 0.85, 0.035); lid.add(face);
const FONT = (px, w = 900) => `${w} ${px}px Inter, Arial, sans-serif`;
const CODE = [0.55, 0.8, 0.42, 0.7, 0.62, 0.35, 0.74, 0.5]; // code line widths
const RES = [1, 0, 1, 1, 0, 1, 0, 1, 1, 0, 1, 1]; // s6 grid: 1 = kept (green), 0 = thrown out (red)
function rr(x, y, w, h, r) { X.beginPath(); X.roundRect(x, y, w, h, r); }
function check(x, y, s, col) { X.strokeStyle = col; X.lineWidth = s * 0.18; X.lineCap = "round"; X.beginPath(); X.moveTo(x - s * 0.35, y); X.lineTo(x - s * 0.1, y + s * 0.28); X.lineTo(x + s * 0.4, y - s * 0.3); X.stroke(); }
function cross(x, y, s, col) { X.strokeStyle = col; X.lineWidth = s * 0.18; X.lineCap = "round"; X.beginPath(); X.moveTo(x - s * 0.3, y - s * 0.3); X.lineTo(x + s * 0.3, y + s * 0.3); X.moveTo(x + s * 0.3, y - s * 0.3); X.lineTo(x - s * 0.3, y + s * 0.3); X.stroke(); }
function drawScreen(t) {
  const wrong = t < T.s3, acc = wrong ? "#ff3a4a" : "#3dff8a";
  X.fillStyle = wrong ? "#0c0a28" : "#081a16"; X.fillRect(0, 0, 1024, 640);
  X.fillStyle = "#2a2470"; X.fillRect(0, 0, 1024, 60);
  ["#ff3a4a", "#ff8a3a", "#3dff8a"].forEach((c, i) => { X.fillStyle = c; X.beginPath(); X.arc(36 + i * 34, 30, 11, 0, 7); X.fill(); });
  X.fillStyle = "#e8e4ff"; X.font = FONT(30, 700); X.textAlign = "left"; X.textBaseline = "middle"; X.fillText("train.py", 150, 31);
  X.fillStyle = acc; X.fillRect(0, 58, 1024, 5);

  const grid = (t >= T.tried && t < T.s3) || t >= T.n12;
  if (grid) { // 12 experiment slots: s2 = only 3 tried by hand, s6+ = all 12 filled by the agent
    X.textAlign = "center"; X.fillStyle = "#e8e4ff"; X.font = FONT(40);
    X.fillText(wrong ? "BY HAND, ALL NIGHT" : "ONE HOUR", 512, 110);
    for (let i = 0; i < 12; i++) {
      const cx = 170 + (i % 4) * 228, cy = 215 + Math.floor(i / 4) * 140;
      const on = wrong ? sm(T.tried + 0.15 * i, T.tried + 0.15 * i + 0.2, t) * (i < 3) : sm(T.n12 + 0.16 * i, T.n12 + 0.16 * i + 0.2, t);
      rr(cx - 95, cy - 55, 190, 110, 18); X.lineWidth = 4; X.strokeStyle = "#4a42a0"; X.stroke();
      if (on > 0.01) {
        X.globalAlpha = on; const kept = wrong || RES[i];
        X.fillStyle = wrong ? "#5a1830" : kept ? "#11583a" : "#5a1830"; rr(cx - 95, cy - 55, 190, 110, 18); X.fill();
        if (wrong) { X.fillStyle = "#ffb0b8"; X.font = FONT(56); X.fillText(String(i + 1), cx, cy + 4); }
        else (kept ? check : cross)(cx, cy, 70, kept ? "#3dff8a" : "#ff5a68");
        X.globalAlpha = 1;
      }
    }
    scTex.needsUpdate = true; return;
  }

  const timerOn = t >= T.trains && t < T.s5;
  if (timerOn) { // 5-minute training run counting down
    const k = sm(T.trains + 0.2, S.s5[0] - 0.1, t), left = Math.round(300 * (1 - k));
    X.lineWidth = 26; X.strokeStyle = "#2a2470"; X.beginPath(); X.arc(512, 350, 190, 0, 7); X.stroke();
    X.strokeStyle = "#3dff8a"; X.beginPath(); X.arc(512, 350, 190, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * (1 - k)); X.stroke();
    X.textAlign = "center"; X.fillStyle = "#ffffff"; X.font = FONT(120);
    X.fillText(`${Math.floor(left / 60)}:${String(left % 60).padStart(2, "0")}`, 512, 340);
    X.fillStyle = "#a8ffd0"; X.font = FONT(36, 700); X.fillText("TRAINING", 512, 430);
    scTex.needsUpdate = true; return;
  }

  // code editor: line 4 is the one being changed
  const edit = wrong ? sm(T.change, T.change + 0.5, t) : sm(T.edits, T.edits + 0.5, t);
  CODE.forEach((w, i) => {
    const y = 100 + i * 46; X.fillStyle = "#4a4490"; X.font = FONT(22, 700); X.textAlign = "right"; X.fillText(String(i + 1), 60, y + 9);
    let ww = w;
    if (i === 3) {
      if (edit > 0) { X.fillStyle = wrong ? "rgba(255,58,74,0.25)" : "rgba(61,255,138,0.22)"; X.fillRect(76, y - 14, 900, 42); }
      ww = w + (0.25 - w) * edit + 0.45 * edit * edit;
    }
    X.fillStyle = i === 3 && edit > 0 ? acc : i % 3 ? "#8f88c8" : "#b8a8ff"; X.fillRect(90, y, 860 * Math.min(ww, 0.95), 18);
  });
  if (wrong && t < T.change && Math.floor(t * 2.5) % 2) { X.fillStyle = "#ffffff"; X.fillRect(90 + 860 * CODE[3] + 8, 226, 6, 34); } // blinking cursor
  // bottom panel: progress bar (wait for the run) and the score
  const run = wrong ? sm(T.wait, T.check, t) : 0;
  if (wrong && t >= T.wait) {
    X.textAlign = "left"; X.fillStyle = "#e8e4ff"; X.font = FONT(30, 800); X.fillText("RUNNING...", 90, 500);
    rr(90, 525, 520, 34, 17); X.fillStyle = "#2a2470"; X.fill(); rr(90, 525, 520 * Math.max(0.07, run), 34, 17); X.fillStyle = "#ff3a4a"; X.fill();
  }
  if (wrong && t >= T.check) {
    const a = sm(T.check, T.check + 0.25, t); X.globalAlpha = a;
    rr(680, 470, 270, 120, 22); X.fillStyle = "#3a1430"; X.fill(); X.lineWidth = 5; X.strokeStyle = "#ff3a4a"; X.stroke();
    X.textAlign = "center"; X.fillStyle = "#ffb0b8"; X.font = FONT(30, 800); X.fillText("SCORE", 815, 505); X.font = FONT(56); X.fillStyle = "#ffffff"; X.fillText("?", 815, 556);
    X.globalAlpha = 1;
  }
  if (!wrong) { X.textAlign = "left"; X.fillStyle = "#a8ffd0"; X.font = FONT(30, 800); X.fillText(t >= T.agent ? "AGENT AT WORK" : "AUTORESEARCH", 90, 520); }
  scTex.needsUpdate = true;
}

// ---------- s1-s2: a red wall clock above the laptop, hands spin overnight ----------
const clock = new THREE.Group(); clock.position.set(0, 2.15, -1.0); scene.add(clock);
const cFace = new THREE.Mesh(new THREE.CircleGeometry(0.32, 40), mDark); clock.add(cFace);
clock.add(new THREE.Mesh(new THREE.TorusGeometry(0.33, 0.03, 8, 48), glow(RED, 1.6)));
for (let i = 0; i < 12; i++) { const a = (i / 12) * Math.PI * 2, tk = new THREE.Mesh(new THREE.BoxGeometry(0.02, 0.06, 0.01), glow(WHITE, 0.9)); tk.position.set(Math.sin(a) * 0.26, Math.cos(a) * 0.26, 0.01); tk.rotation.z = -a; clock.add(tk); }
const hand = (len, w) => { const p = new THREE.Group(); const m = new THREE.Mesh(new THREE.BoxGeometry(w, len, 0.01), glow(WHITE, 1.1)); m.position.set(0, len / 2, 0.02); p.add(m); clock.add(p); return p; };
const hH = hand(0.15, 0.035), hM = hand(0.23, 0.022);

// ---------- s3+: the AI agent, a small robot on the desk right of the laptop ----------
const RB = new THREE.Vector3(1.6, 0, 0.3);
const robot = new THREE.Group(); robot.position.copy(RB); robot.rotation.y = -0.6; scene.add(robot);
const torso = rbox(0.4, 0.34, 0.3, 0.06, mBody); torso.position.y = 0.29; robot.add(torso);
[-0.1, 0.1].forEach((x) => { const l = rbox(0.1, 0.13, 0.12, 0.03, mDark); l.position.set(x, 0.065, 0); robot.add(l); });
const head = rbox(0.48, 0.34, 0.34, 0.08, mBody); head.position.y = 0.66; robot.add(head);
const visor = rbox(0.38, 0.2, 0.02, 0.05, mDark); visor.position.set(0, 0.66, 0.17); robot.add(visor);
const eyes = [-0.08, 0.08].map((x) => { const e = new THREE.Mesh(new THREE.SphereGeometry(0.04, 16, 12), glow(GREEN, 2.2)); e.position.set(x, 0.67, 0.185); robot.add(e); return e; });
robot.add(tube([0, 0.83, 0], [0, 0.95, 0], 0.025, mDark));
const bulb = new THREE.Mesh(new THREE.SphereGeometry(0.045, 16, 12), glow(ORANGE, 2.0)); bulb.position.y = 0.97; robot.add(bulb);
const arms = [-1, 1].map((s) => { const a = new THREE.Group(); a.position.set(s * 0.23, 0.42, 0); a.add(tube([0, 0, 0], [0, -0.22, 0], 0.06, mDark)); robot.add(a); return a; });
const ray = beam(GREEN, 1.4, 0.025);

// ---------- s5: results station on the right of the desk: KEEP tray + trash bin ----------
const ST = new THREE.Vector3(3.0, 0, 0.6);
const tray = rbox(0.62, 0.06, 0.46, 0.03, mGreen); tray.position.set(ST.x - 0.5, 0.03, ST.z); scene.add(tray);
const trayRim = new THREE.Mesh(new THREE.EdgesGeometry(new THREE.BoxGeometry(0.62, 0.06, 0.46)), new THREE.LineBasicMaterial({ color: new THREE.Color(GREEN).multiplyScalar(1.4), toneMapped: false })); trayRim.position.copy(tray.position); scene.add(trayRim);
const bin = new THREE.Mesh(new THREE.CylinderGeometry(0.27, 0.21, 0.5, 28, 1, true), std(0x3a1430, 0x2a0818, 0.5, 0.3)); bin.material.side = THREE.DoubleSide; bin.position.set(ST.x + 0.5, 0.25, ST.z); scene.add(bin);
const binRim = new THREE.Mesh(new THREE.TorusGeometry(0.27, 0.02, 8, 40), glow(RED, 1.8)); binRim.rotation.x = Math.PI / 2; binRim.position.set(ST.x + 0.5, 0.5, ST.z); scene.add(binRim);
const binIn = new THREE.Mesh(new THREE.CircleGeometry(0.21, 28), mDark); binIn.rotation.x = -Math.PI / 2; binIn.position.set(ST.x + 0.5, 0.02, ST.z); scene.add(binIn);
const lKeep = fitText(["KEEP"], GREEN, 1.3, 1.2), lOut = fitText(["OUT"], RED, 1.3, 1.2);
function card(good) {
  const gp = new THREE.Group(); gp.add(rbox(0.5, 0.36, 0.04, 0.04, mLav));
  const m = glow(good ? GREEN : RED, 1.6);
  if (good) { gp.add(tube([-0.12, 0.0, 0.03], [-0.03, -0.09, 0.03], 0.045, m)); gp.add(tube([-0.03, -0.09, 0.03], [0.14, 0.1, 0.03], 0.045, m)); }
  else { gp.add(tube([-0.1, -0.1, 0.03], [0.1, 0.1, 0.03], 0.045, m)); gp.add(tube([0.1, -0.1, 0.03], [-0.1, 0.1, 0.03], 0.045, m)); }
  scene.add(gp); gp.visible = false; return gp;
}
const cGood = card(true), cBad = card(false), cNew = card(true);
cNew.children.slice(1).forEach((c) => (c.visible = false)); // blank card for the next try
const loop = new THREE.Group(); scene.add(loop);
loop.add(new THREE.Mesh(new THREE.TorusGeometry(0.34, 0.025, 8, 48, Math.PI * 1.6), glow(VIOLET, 1.8)));
const head2 = new THREE.Mesh(new THREE.ConeGeometry(0.07, 0.15, 16), glow(VIOLET, 1.8)); head2.position.set(0.34, 0, 0); head2.rotation.z = Math.PI; loop.add(head2);

// ---------- s6: one GPU, one file, one score above the laptop ----------
const trio = new THREE.Group(); trio.position.set(0, 2.35, -1.2); scene.add(trio);
const gpu = new THREE.Group(); gpu.position.x = -0.95; trio.add(gpu);
gpu.add(rbox(0.72, 0.4, 0.07, 0.03, mGreen));
const fans = [-0.17, 0.17].map((x) => { const f = new THREE.Group(); f.position.set(x, 0.03, 0.04); f.add(new THREE.Mesh(new THREE.CircleGeometry(0.13, 28), mDark));
  f.add(new THREE.Mesh(new THREE.TorusGeometry(0.13, 0.012, 6, 32), glow(GREEN, 1.6)));
  for (let i = 0; i < 4; i++) { const b = new THREE.Mesh(new THREE.BoxGeometry(0.03, 0.2, 0.01), glow(GREEN, 0.7)); b.rotation.z = (i * Math.PI) / 4; b.position.z = 0.01; f.add(b); }
  gpu.add(f); return f; });
for (let i = 0; i < 9; i++) { const p = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.05, 0.01), glow(ORANGE, 1.2)); p.position.set(-0.24 + i * 0.06, -0.2, 0.04); gpu.add(p); }
const file = new THREE.Group(); trio.add(file);
file.add(rbox(0.4, 0.52, 0.05, 0.04, mLav));
const corner = new THREE.Mesh(new THREE.CircleGeometry(0.07, 3), glow(ORANGE, 1.4)); corner.position.set(0.13, 0.19, 0.03); corner.rotation.z = Math.PI / 4; file.add(corner);
[0.08, 0.0, -0.08, -0.16].forEach((y, i) => { const l = new THREE.Mesh(new THREE.PlaneGeometry(0.26 - i * 0.03, 0.025), new THREE.MeshBasicMaterial({ color: 0x6a5fd0 })); l.position.set(-0.03, y, 0.027); file.add(l); });
const score = new THREE.Group(); score.position.x = 0.95; trio.add(score);
score.add(new THREE.Mesh(new THREE.CircleGeometry(0.26, 40), mDark));
const arc = new THREE.Mesh(new THREE.TorusGeometry(0.22, 0.025, 6, 40, Math.PI), glow(GREEN, 1.6)); arc.position.z = 0.01; score.add(arc);
const needle = new THREE.Group(); needle.position.z = 0.02; score.add(needle);
const nd = new THREE.Mesh(new THREE.BoxGeometry(0.025, 0.2, 0.01), glow(WHITE, 1.1)); nd.position.y = 0.1; needle.add(nd);
const lG = fitText(["GPU"], WHITE, 0.9, 1.0), lF = fitText(["TRAIN.PY"], WHITE, 0.9, 1.0), lS = fitText(["SCORE"], WHITE, 0.9, 1.0);

// ---------- s3: GitHub star (filee) ----------
const starShape = new THREE.Shape();
for (let i = 0; i < 10; i++) { const a = Math.PI / 2 + (i * Math.PI) / 5, r = i % 2 ? 0.17 : 0.4; starShape[i ? "lineTo" : "moveTo"](Math.cos(a) * r, Math.sin(a) * r); }
const star = new THREE.Mesh(new THREE.ExtrudeGeometry(starShape, { depth: 0.08, bevelEnabled: true, bevelSize: 0.03, bevelThickness: 0.03, bevelSegments: 2 }), glow(ORANGE, 1.5));
scene.add(star);

// ---------- captions ----------
title("NEVER TUNE IT BY HAND");
cap("s1", "exploring", ["EXPLORING GITHUB REPOS"], WHITE, { until: "s1" });
cap("s2", "change", ["CHANGE ONE LINE"], RED, { until: ["s2", "wait"] });
cap("s2", "wait", ["WAIT FOR THE RUN"], RED, { until: ["s2", "check"] });
cap("s2", "check", ["CHECK THE SCORE"], RED, { until: ["s2", "morning"] });
cap("s2", "morning", ["BY MORNING:", "ONLY A FEW IDEAS"], RED, { boom: 0.5 });
cap("s3", "autoresearch", ["AUTORESEARCH"], GREEN, { until: ["s3", "over"], boom: 0.5 });
cap("s3", "over", ["OVER 100,000 STARS", "IN 8 MONTHS"], ORANGE, { until: ["s3", "it's"], boom: 0.5 });
cap("s3", "free", ["FREE, FROM", "ANDREJ KARPATHY"], GREEN, { until: ["s3", "agent"] });
cap("s3", "agent", ["AN AI AGENT RUNS", "THE EXPERIMENTS"], GREEN, { boom: 0.4 });
cap("s4", "edits", ["IT EDITS THE CODE"], VIOLET, { until: ["s4", "trains"] });
cap("s4", "trains", ["TRAINS FOR 5 MINUTES"], VIOLET, { boom: 0.4 });
cap("s5", "better", ["BETTER? KEEP IT."], GREEN, { until: ["s5", "worse"], boom: 0.4 });
cap("s5", "worse", ["WORSE? THROW IT OUT."], RED, { until: ["s5", "starts"], boom: 0.4 });
cap("s5", "starts", ["START OVER"], VIOLET);
cap("s6", "12", ["12 EXPERIMENTS", "AN HOUR"], GREEN, { until: ["s6", "on"], boom: 0.5 });
cap("s6", "on", ["ONE GPU, ONE FILE,", "ONE SCORE"], GREEN);
endCard(["GO TO SLEEP.", "LET IT EXPERIMENT."]);

// ---------- timings (global seconds) ----------
const T = {
  night: g("s1", "night"), s2: S.s2[0], change: g("s2", "change"), wait: g("s2", "wait"), check: g("s2", "check"), morning: g("s2", "morning"), tried: g("s2", "tried"),
  s3: S.s3[0], over: g("s3", "over"), free: g("s3", "free"), agent: g("s3", "agent"),
  s4: S.s4[0], edits: g("s4", "edits"), trains: g("s4", "trains"),
  s5: S.s5[0], better: g("s5", "better"), keeps: g("s5", "keeps"), worse: g("s5", "worse"), throws: g("s5", "throws"), starts: g("s5", "starts"),
  s6: S.s6[0], n12: g("s6", "12"), on: g("s6", "on"), gpu: g("s6", "gpu"), file: g("s6", "file"), score: g("s6", "score"), s7: S.s7[0],
};

// ---------- shots: [cx,cy,cz, lx,ly,lz, fov] ----------
const SH = [
  { at: 0, K: [[0, [0.3, 1.9, 5.6, 0, 1.3, -0.6, 48]], [T.s2, [0.1, 1.9, 5.2, 0, 1.3, -0.6, 48]]] },
  { at: T.s2, K: [[0, [0.15, 1.4, 3.8, 0, 0.95, -0.7, 46]], [T.morning - T.s2, [0.0, 1.45, 3.6, 0, 0.95, -0.7, 46]]] },
  { at: T.morning - 0.1, K: [[0, [0.2, 2.25, 2.3, 0, 2.05, -1.0, 46]], [T.tried - T.morning - 0.1, [0.1, 2.2, 2.1, 0, 2.05, -1.0, 46]]] },
  { at: T.tried - 0.05, K: [[0, [0.0, 1.45, 3.7, 0, 0.98, -0.7, 46]], [1.5, [0.1, 1.45, 3.9, 0, 0.98, -0.7, 46]]] },
  { at: T.s3, K: [[0, [-0.2, 2.2, 6.4, 0.3, 1.05, -0.5, 48]], [T.agent - T.s3, [0.4, 2.1, 6.6, 0.5, 1.0, -0.4, 48]], [T.s4 - T.s3, [0.6, 2.1, 6.8, 0.55, 1.0, -0.4, 48]]] },
  { at: T.s4, K: [[0, [0.7, 2.0, 6.2, 0.55, 1.0, -0.4, 48]], [T.trains - T.s4, [0.6, 1.9, 5.8, 0.5, 1.0, -0.4, 48]], [T.s5 - T.s4, [0.1, 1.5, 4.0, 0.05, 0.95, -0.7, 46]]] },
  { at: T.s5, K: [[0, [3.0, 1.8, 4.7, 3.0, 0.75, 0.4, 46]], [T.s6 - T.s5, [3.1, 1.85, 5.0, 3.0, 0.75, 0.4, 46]]] },
  { at: T.s6, K: [[0, [0.0, 1.45, 3.8, 0, 0.98, -0.7, 46]], [T.on - T.s6, [0.1, 1.5, 4.0, 0, 0.98, -0.7, 46]], [T.on - T.s6 + 0.7, [0.0, 2.4, 7.2, 0, 1.6, -1.0, 50]], [T.s7 - T.s6, [0.2, 2.5, 7.5, 0, 1.6, -1.0, 50]]] },
  { at: T.s7, calm: 1, K: [[0, [0.2, 2.5, 7.5, 0, 1.6, -1.0, 50]], [4, [0.4, 2.7, 8.0, 0, 1.6, -1.0, 50]]] },
];
const v = new THREE.Vector3();
const pop = (a, b, t) => sm(a, a + 0.25, t) * (1 - sm(b - 0.2, b, t));

run("autoresearch-world", (t) => {
  const wrong = t < T.s3;
  drawScreen(t);

  // clock: ticks slowly at night, spins through the night from "morning"
  clock.visible = t < T.s2 || (t >= T.morning - 0.1 && t < T.tried - 0.05);
  const spin = sm(T.morning - 0.1, T.tried, t) * Math.PI * 2 * 1.5;
  hM.rotation.z = -(0.4 + t * 0.4 + spin * 12); hH.rotation.z = -(4.0 + t * 0.033 + spin);

  // robot pops in on "agent", looks at the laptop, beams at the edited line in s4
  const rk = sm(T.agent - 0.15, T.agent + 0.25, t);
  robot.visible = rk > 0.01 && t < T.s5 || (t >= T.s6 && t < S.s8[0]);
  robot.scale.setScalar(t >= T.s6 ? 1 : rk);
  robot.position.y = 0.04 * Math.sin(t * 4);
  head.rotation.y = 0.15 * Math.sin(t * 1.7);
  arms[1].rotation.z = t >= T.edits && t < T.trains ? -0.9 + 0.2 * Math.sin(t * 12) : 0;
  const rayA = t < T.s5 ? sm(T.edits - 0.05, T.edits + 0.2, t) * (1 - sm(T.trains - 0.2, T.trains, t)) : 0;
  ray.set(eyes[0].getWorldPosition(v.set(0, 0, 0)).clone(), onLid(0.0, 0.85 + 0.75 - (100 + 3 * 46 + 9) / 640 * 1.5), rayA);

  // s5: good card -> KEEP tray, bad card -> bin, blank card + loop arrow = start over
  const top = new THREE.Vector3(ST.x, 1.15, ST.z);
  const gk = sm(T.better - 0.1, T.better + 0.2, t), gm = sm(T.keeps, T.keeps + 0.45, t);
  cGood.visible = gk > 0.01 && t < T.s6;
  cGood.position.copy(top).lerp(new THREE.Vector3(ST.x - 0.5, 0.1, ST.z), gm); cGood.position.y += Math.sin(gm * Math.PI) * 0.15;
  cGood.rotation.x = -1.5 * gm; cGood.scale.setScalar(gk * (1 - 0.15 * gm));
  const bk = sm(T.worse - 0.1, T.worse + 0.2, t), bm = sm(T.throws, T.throws + 0.45, t);
  cBad.visible = bk > 0.01 && bm < 0.98 && t < T.s6;
  cBad.position.copy(top).lerp(new THREE.Vector3(ST.x + 0.5, 0.3, ST.z), bm); cBad.position.y += Math.sin(bm * Math.PI) * 0.3;
  cBad.rotation.z = -2.2 * bm; cBad.scale.setScalar(bk * (1 - 0.5 * bm));
  const nk = sm(T.starts - 0.05, T.starts + 0.25, t);
  cNew.visible = nk > 0.01 && t < T.s6; cNew.position.copy(top); cNew.scale.setScalar(nk);
  loop.visible = cNew.visible; loop.position.copy(top).add(v.set(0, 0, 0.05)); loop.scale.setScalar(nk); loop.rotation.z = -t * 3;
  const stA = t >= T.s5 && t < T.s6 ? 1 : 0;
  label(lKeep, ST.x - 0.5, 0.36, ST.z + 0.1, 0.42, stA); label(lOut, ST.x + 0.5, 0.78, ST.z, 0.42, stA);

  // s6: GPU, file, score pop in on their words
  const tk = [T.gpu, T.file, T.score].map((w) => sm(w - 0.15, w + 0.15, t) * (1 - sm(T.s7 - 0.1, T.s7 + 0.2, t)));
  [gpu, file, score].forEach((o, i) => { o.visible = tk[i] > 0.01; o.scale.setScalar(tk[i]); });
  fans.forEach((f) => (f.rotation.z = -t * 6));
  needle.rotation.z = 1.2 - 2.0 * sm(T.score, T.score + 0.6, t);
  label(lG, -0.95, 2.35 - 0.36, -1.2, 0.5, tk[0]); label(lF, 0, 2.35 - 0.4, -1.2, 0.5, tk[1]); label(lS, 0.95, 2.35 - 0.36, -1.2, 0.5, tk[2]);

  // s3: the star pops in above the laptop while the star count is on screen
  const sk = sm(T.over - 0.1, T.over + 0.25, t) * (1 - sm(T.free - 0.15, T.free + 0.1, t));
  star.visible = sk > 0.01; star.scale.setScalar(0.5 * sk * (1 + 0.08 * Math.sin(t * 6)));
  star.position.set(0.1, 1.98, -0.3); star.rotation.y = 0.35 * Math.sin((t - T.over) * 2.5);

  const { punch } = shoot(SH, t);
  const spike = overlays(t);
  bloom.strength = Math.min(1.45, 0.9 + 0.8 * punch * punch + 0.6 * spike);
});
