// yd.js: shared Yesh Dibur reel scenes (phone / house / map) driven by a config. Lifted from reel 01 (yd-nitaem).
// world.js: import { reel, RED, ... } from "./yd.js"; reel({ id, title, caps, end, endBoom, scenes: [...] })
// Times: ["s2","word"] = that word, ["s2",0.4] = line start + 0.4 s.
import { THREE, S, g, sm, pulse, scene, camera, bloom, box, tube, glow, VIOLET, ORANGE, RED, GREEN, WHITE, shoot, run, beam, patch, hdg, label } from "./kit.js";
import { title, endCard, cap, boom, overlays, fitText, makePerson, pose, ARM } from "./extra.js";
export { VIOLET, ORANGE, RED, GREEN, WHITE };

scene.fog.density = 0.02;
const tm = (x) => (typeof x === "number" ? x : typeof x[1] === "number" ? S[x[0]][0] + x[1] : g(x[0], x[1], x[2]));
const put = (m, x, y, z, s, a) => { m.visible = a > 0.01; if (!m.visible) return; m.position.set(x, y, z); m.rotation.set(0, 0, 0); m.scale.setScalar(s * (0.85 + 0.15 * a)); m.material.opacity = a; };
const pop = (t, t0) => sm(t0 - 0.08, t0 + 0.12, t);
const tint = (hex, k) => new THREE.MeshBasicMaterial({ color: new THREE.Color(hex).multiplyScalar(k), transparent: true, toneMapped: false });
const vA = new THREE.Vector3(), vB = new THREE.Vector3();

// ================= phone =================
const PY = 2.6;
const phone = new THREE.Group(); scene.add(phone);
phone.add(box(2.3, 4.6, 0.18, 0, PY, 0, glow(0x0c0a24, 1), true));
const screen = box(2.05, 4.2, 0.02, 0, PY, 0.1, glow(0x14103a, 1), false); phone.add(screen);

function icon(kind) { // v = green check, x = red cross
  const G = new THREE.Group(), m = glow(kind === "v" ? GREEN : RED, 2.5); scene.add(G);
  const P = kind === "v" ? [[[-0.09, 0, 0], [-0.03, -0.07, 0]], [[-0.03, -0.07, 0], [0.1, 0.09, 0]]] : [[[-0.08, -0.08, 0], [0.08, 0.08, 0]], [[-0.08, 0.08, 0], [0.08, -0.08, 0]]];
  P.forEach(([a, b]) => G.add(tube(a, b, 0.035, m)));
  return G;
}
const ITEM = {
  bubble({ text, hex = VIOLET, side = -1, y = 0, w = 1.4, at }) {
    const bg = box(w, 0.6, 0.03, 0, 0, 0, tint(hex, 0.45), false); scene.add(bg);
    const tx = fitText([text], WHITE, 1.4, w * 0.85), x = side * (1.02 - w / 2 - 0.08), t0 = tm(at);
    return (t, on) => { const a = on ? pop(t, t0) : 0; bg.visible = a > 0.01; bg.material.opacity = a; bg.position.set(x, PY + y, 0.13); bg.scale.setScalar(0.6 + 0.4 * a); put(tx, x, PY + y, 0.15, 0.6 + 0.4 * a, a); };
  },
  row({ text, hex = WHITE, y = 0, at, w = 1.5, k = 1.4, ic, blink, x = 0, off }) {
    const m = fitText([text], hex, k, w), t0 = tm(at), t1 = off ? tm(off) : 1e9, I = ic ? icon(ic) : null;
    return (t, on) => {
      const a = on ? pop(t, t0) * (1 - sm(t1 - 0.1, t1 + 0.1, t)) : 0, b = blink ? 0.6 + 0.4 * Math.sin(t * 8) ** 2 : 1;
      put(m, x - (I ? 0.12 : 0) + 0.3 * (1 - a), PY + y, 0.15, 1, a * b);
      if (I) { const k2 = on ? pop(t, t0 + 0.25) * (1 - sm(t1 - 0.1, t1 + 0.1, t)) : 0; I.visible = k2 > 0.01; I.position.set(0.78, PY + y, 0.16); I.scale.setScalar(0.3 + 0.7 * k2); }
    };
  },
  panel({ y = 0, h = 2.7, w = 1.8, hex = VIOLET, at, off }) {
    const m = box(w, h, 0.03, 0, PY + y, 0.12, tint(hex, 0.28), false); scene.add(m); const t0 = tm(at), t1 = off ? tm(off) : 1e9;
    return (t, on) => { const a = on ? pop(t, t0) * (1 - sm(t1 - 0.1, t1 + 0.1, t)) : 0; m.visible = a > 0.01; m.material.opacity = a; m.scale.setScalar(0.7 + 0.3 * a); };
  },
  flood({ at, until, n = 9, hex = 0x8a86a8 }) { // a group chat scrolling too fast to read
    const W = ["חחח", "מי בא?", "אולי", "תלוי", "מתי?", "לא יודע", "אני בעבודה", "מחר?", "?", "איפה?", "אני בחוץ", "נראה"];
    const B = Array.from({ length: n }, (_, i) => ({ bg: box(1.2, 0.42, 0.03, 0, 0, 0, tint(hex, 0.4), false), tx: fitText([W[i % W.length]], WHITE, 1.2, 1.1), x: (i % 2 ? 1 : -1) * 0.34 }));
    B.forEach((b) => scene.add(b.bg)); const t0 = tm(at), t1 = tm(until);
    return (t, on) => B.forEach((b, i) => {
      const u = t - t0 - i * 0.12, y = -1.6 + ((u * 2.6) % 3.2 + 3.2) % 3.2, a = on && u > 0 ? sm(t0, t0 + 0.2, t) * (1 - sm(t1, t1 + 0.3, t)) * sm(-1.6, -1.3, y) * (1 - sm(1.2, 1.55, y)) : 0;
      b.bg.visible = a > 0.01; b.bg.material.opacity = a; b.bg.position.set(b.x, PY + y, 0.13); put(b.tx, b.x, PY + y, 0.15, 1, a);
    });
  },
  button({ text, y = -0.6, at, press, w = 1.6 }) {
    const bg = box(w, 0.56, 0.05, 0, 0, 0, tint(VIOLET, 0.9), false); scene.add(bg);
    const tx = fitText([text], WHITE, 1.6, w * 1.1), t0 = tm(at), tp = press ? tm(press) : 1e9;
    const ring = new THREE.Mesh(new THREE.RingGeometry(0.2, 0.26, 32), tint(WHITE, 1.6)); scene.add(ring);
    return (t, on) => {
      const a = on ? pop(t, t0) : 0, p = sm(tp, tp + 0.15, t), bump = 1 + 0.12 * pulse(t, tp, tp + 0.15);
      bg.visible = a > 0.01; bg.material.opacity = a; bg.material.color.set(p > 0.5 ? GREEN : VIOLET).multiplyScalar(p > 0.5 ? 0.55 : 0.9);
      bg.position.set(0, PY + y, 0.13); bg.scale.setScalar((0.6 + 0.4 * a) * bump); put(tx, 0, PY + y, 0.16, (0.6 + 0.4 * a) * bump, a);
      const r = on ? sm(tp - 0.05, tp + 0.5, t) : 0; ring.visible = r > 0.01 && r < 0.99; ring.position.set(0.3, PY + y - 0.05, 0.17); ring.scale.setScalar(0.5 + 2 * r); ring.material.opacity = 1 - r;
    };
  },
  bar({ text, hex = GREEN, y = 0, frac = 1, at, fill, w = 1.7 }) {
    const tx = fitText([text], hex, 1.3, w), track = box(1, 0.14, 0.03, 0, 0, 0, tint(WHITE, 0.15), false), bar = box(1, 0.14, 0.03, 0, 0, 0, tint(hex, 1.3), false);
    scene.add(track, bar); const t0 = tm(at), tf = fill ? tm(fill) : t0 + 0.2;
    return (t, on) => {
      const a = on ? pop(t, t0) : 0, f = Math.max(0.001, frac * sm(tf, tf + 0.9, t));
      put(tx, 0, PY + y + 0.2, 0.15, 1, a);
      track.visible = bar.visible = a > 0.01; track.material.opacity = bar.material.opacity = a;
      track.position.set(0, PY + y - 0.14, 0.13); track.scale.set(w, 1, 1);
      bar.position.set(w / 2 - (w * f) / 2, PY + y - 0.14, 0.14); bar.scale.set(w * f, 1, 1);
    };
  },
  strike({ at, y = 0, s = 1.5 }) {
    const G = new THREE.Group(), m = glow(RED, 2.2); scene.add(G);
    G.add(tube([-s / 2, -s / 2, 0], [s / 2, s / 2, 0], 0.12, m), tube([-s / 2, s / 2, 0], [s / 2, -s / 2, 0], 0.12, m)); const t0 = tm(at);
    return (t, on) => { const a = on ? pop(t, t0) : 0; G.visible = a > 0.01; G.position.set(0, PY + y, 0.2); G.scale.setScalar(0.3 + 0.7 * a + 0.05 * pulse(t, t0, t0 + 0.3)); };
  },
  spin({ at, until, y = 1.0 }) { // pull-to-refresh spinner
    const G = new THREE.Group(); scene.add(G);
    for (let i = 0; i < 8; i++) { const a = (i / 8) * Math.PI * 2, d = box(0.07, 0.07, 0.02, Math.cos(a) * 0.22, Math.sin(a) * 0.22, 0, glow(WHITE, 0.3 + 0.2 * i), false); G.add(d); }
    const t0 = tm(at), t1 = tm(until);
    return (t, on) => { const a = on ? sm(t0, t0 + 0.15, t) * (1 - sm(t1, t1 + 0.2, t)) : 0; G.visible = a > 0.01; G.position.set(0, PY + y - 0.3 * (1 - a), 0.16); G.rotation.z = -t * 7; G.scale.setScalar(a); };
  },
};

function phoneScene(s) {
  const items = (s.items || []).map((it) => ITEM[it.type](it)), tR = s.tint ? tm(s.tint) : 1e9;
  return { set(t, on) { if (on) screen.material.color.set(t > tR ? 0x24101e : 0x14103a); items.forEach((f) => f(t, on)); }, phone: true,
    cam: (d, i) => { const sx = i % 2 ? -1 : 1; return [[0, [0.3 * sx, 3.4, 6.6, 0, 3.4, 0, 50]], [d, [-0.3 * sx, 3.2, 5.6, 0, 3.2, 0, 50]]]; } };
}

// ================= house: someone alone at home, dead red phone =================
function houseScene(s, HX) {
  const house = new THREE.Group(); scene.add(house); house.position.set(HX, 0, 0);
  const mWall = new THREE.MeshStandardMaterial({ color: 0x2a1030, emissive: 0x200810, roughness: 0.7, transparent: true, opacity: 0.35 });
  house.add(box(4, 3, 3, 0, 1.5, 0, mWall, true));
  house.add(tube([-2.2, 3, 1.6], [0, 4.4, 1.6], 0.1, glow(RED, 1.2)), tube([0, 4.4, 1.6], [2.2, 3, 1.6], 0.1, glow(RED, 1.2)));
  house.add(box(0.9, 0.9, 0.05, 1.1, 1.8, 1.52, glow(0x40101a, 1), true));
  if (s.sofa) house.add(box(2.2, 0.5, 0.8, -0.4, 0.25, -0.5, new THREE.MeshStandardMaterial({ color: 0x3a1430, emissive: 0x2a0818 }), true), box(2.2, 0.6, 0.25, -0.4, 0.8, -0.85, new THREE.MeshStandardMaterial({ color: 0x3a1430, emissive: 0x2a0818 }), true));
  const P = makePerson(), ph = box(0.24, 0.4, 0.03, 0, 0, 0, glow(RED, 1.6), false); scene.add(ph);
  const tg = s.tag ? fitText([[s.tag, 1]], RED, 2.0, 3.0) : null, tT = s.tagAt ? tm(s.tagAt) : 0;
  return { set(t, on) {
    pose(P, { x: HX - 0.4, z: 0.2, h: Math.PI, armR: 0.9, vis: on, hex: RED }); P.head.rotation.x = on ? 0.5 : 0;
    if (on) { P.armR.userData.hand.getWorldPosition(vA); ph.position.set(vA.x, vA.y + 0.12, vA.z + 0.12); }
    ph.visible = on; ph.material.color.set(RED).multiplyScalar(0.6 + 0.8 * (Math.sin(t * 3) > 0 ? 1 : 0.3));
    if (tg) label(tg, HX, 5.1, 0.5, 1, on ? pop(t, tT) : 0);
  }, cam: (d) => [[0, [HX + 3.5, 3.0, 8.6, HX, 2.9, 0, 50]], [d + 0.4, [HX + 2.2, 2.8, 7.4, HX, 2.7, 0, 50]]] };
}

// ================= map: people nearby =================
// mode gather: see -> rays to the meeting point, tap -> people turn green, go -> walk in.
// mode alone: one red person with a ball on an empty spot, walks home at `leave`.
// mode wait: red people waiting at the spot, looking around; one empty place with "?".
function mapScene(s, MX) {
  const MZ = 0, mode = s.mode || "gather", n = s.n || 5;
  const meet = patch(3.2, 3.2, s.court ? ORANGE : GREEN, s.court ? 1.0 : 1.4); meet.position.set(MX, 0.03, MZ);
  const pin = tube([MX, 0, MZ], [MX, 2.4, MZ], 0.12, glow(GREEN, 2)); scene.add(pin);
  const head = box(0.5, 0.5, 0.5, MX, 2.6, MZ, glow(GREEN, 2.2), false); scene.add(head);
  const hoop = s.court ? [box(0.1, 3, 0.1, MX - 1.4, 1.5, MZ - 1.4, glow(ORANGE, 1.2), false), box(1.0, 0.7, 0.06, MX - 1.4, 3.1, MZ - 1.3, glow(WHITE, 0.4), true), box(0.45, 0.04, 0.45, MX - 1.4, 2.8, MZ - 1.0, glow(ORANGE, 2), false)] : [];
  hoop.forEach((m) => scene.add(m));
  const ball = new THREE.Mesh(new THREE.IcosahedronGeometry(0.17, 1), glow(ORANGE, 1.8)); scene.add(ball);
  const ppl = Array.from({ length: n }, (_, i) => { const a = (i / n) * Math.PI * 2 + 0.4, r = 3.4 + (i % 2) * 0.9; const p = { P: makePerson(), x0: MX + Math.cos(a) * r, z0: MZ + Math.sin(a) * r, a, pin: box(0.3, 0.3, 0.3, 0, 0, 0, glow(VIOLET, 2.2), false), ray: beam(GREEN, 2.2, 0.05) }; scene.add(p.pin); return p; });
  const ring = patch(9, 9, VIOLET, 0.25); ring.position.set(MX, 0.02, MZ);
  const tg = s.tag ? fitText([[s.tag, 1]], s.tagHex || GREEN, 2.0, 3.2) : null, q = mode === "wait" ? fitText([["?", 1]], RED, 2.2, 1.2) : null;
  const solo = mode === "alone" ? makePerson() : null;
  const T0 = (k) => (s[k] ? tm(s[k]) : 1e9);
  return { set(t, on) {
    const tSee = T0("see"), tTap = T0("tap"), tGo = T0("go");
    meet.set(on ? (mode === "gather" ? 0.6 + 0.4 * pulse(t, tSee - 0.2, 99) : mode === "alone" ? 0.5 * (1 - sm(T0("leave"), T0("leave") + 1, t)) : 0.5) : 0);
    pin.visible = head.visible = on && !s.court; head.rotation.y = t * 1.5; hoop.forEach((m) => (m.visible = on));
    ring.set(on && mode === "gather" ? sm(tSee - 0.6, tSee, t) * (1 - sm(tGo, tGo + 0.6, t)) : 0);
    if (tg) label(tg, MX, 3.9, MZ, 1, on ? pop(t, s.tagAt ? tm(s.tagAt) : tSee) : 0);
    // the ball: bounced by the solo player, or held by the first person after the meet
    ball.visible = on && ((mode === "alone" && s.ball !== false) || (s.court && mode === "gather"));
    if (mode === "alone") {
      const tL = T0("leave"), k = sm(tL, tL + 2.2, t), x = MX + 0.3 + 4.5 * k, z = MZ + 0.8 + 1.5 * k;
      pose(solo, { x, z, h: k > 0 ? hdg(4.5, 1.5) : Math.PI * 0.85, vis: on && k < 0.98, armR: k > 0 ? 0.6 : 0.3, hex: RED });
      solo.g.position.y = on && k > 0 && k < 1 ? Math.abs(Math.sin(t * 9)) * 0.08 : 0;
      if (on && s.ball !== false) { solo.armR.userData.hand.getWorldPosition(vA); ball.position.set(vA.x, k > 0 ? vA.y - 0.15 : 0.17 + Math.abs(Math.sin(t * 5)) * (vA.y - 0.4), vA.z); ball.visible = k < 0.98; }
    } else if (ball.visible) ball.position.set(MX + 0.25, 0.17 + Math.abs(Math.sin(t * 6)) * 0.9 * sm(tGo + 1.6, tGo + 2, t), MZ + 0.9);
    ppl.forEach((p, i) => {
      if (mode === "alone") { pose(p.P, { vis: false }); p.pin.visible = false; p.ray.set(vA, vB, 0); return; }
      if (mode === "wait") {
        const empty = i === n - 1, x = MX + Math.cos(p.a) * 1.1, z = MZ + Math.sin(p.a) * 1.1;
        pose(p.P, { x, z, h: hdg(x - MX, z - MZ) + 0.6 * Math.sin(t * 1.3 + i * 1.7), vis: on && !empty, armL: i === 0 && on ? 1.6 : 0, hex: RED });
        p.pin.visible = false; p.ray.set(vA, vB, 0);
        if (empty && q) label(q, x, 1.5 + 0.08 * Math.sin(t * 4), z, 1, on ? 0.6 + 0.4 * Math.sin(t * 6) ** 2 : 0);
        return;
      }
      const k = sm(tGo - 0.4 + i * 0.08, tGo + 1.8 + i * 0.08, t), r = 0.9 + 0.25 * (i % 2);
      const x = p.x0 + (MX + Math.cos(p.a) * r - p.x0) * k, z = p.z0 + (MZ + Math.sin(p.a) * r - p.z0) * k, tapped = t > tTap + i * 0.07;
      pose(p.P, { x, z, h: hdg(MX - p.x0, MZ - p.z0), vis: on, armR: on && pulse(t, tTap + i * 0.07, tTap + i * 0.07 + 0.5) ? ARM.up : ARM.down, hex: tapped ? GREEN : VIOLET });
      p.P.g.position.y = on && k > 0 && k < 1 ? Math.abs(Math.sin(t * 9 + i)) * 0.08 : 0;
      p.pin.visible = on; p.pin.position.set(x, 2.2 + 0.1 * Math.sin(t * 4 + i), z); p.pin.material.color.set(tapped ? GREEN : VIOLET).multiplyScalar(1.4);
      vA.set(x, 0.1, z); vB.set(MX, 0.1, MZ);
      p.ray.set(vA, vB, on ? sm(tSee - 0.1 + i * 0.05, tSee + 0.2 + i * 0.05, t) * (1 - sm(tGo, tGo + 0.5, t)) * 0.5 : 0);
    });
  }, map: true,
  cam: (d) => (mode === "gather" ? [[0, [MX, 9, MZ + 10, MX, 0.5, MZ - 1.5, 52]], [d + 1, [MX + 1.5, 6.5, MZ + 8, MX, 0.8, MZ - 1, 52]]]
    : [[0, [MX + 2.5, 4.8, MZ + 8, MX + 0.5, 1.0, MZ, 50]], [d + 0.5, [MX + 1.2, 3.6, MZ + 6.2, MX + 0.8, 1.0, MZ, 50]]]) };
}

// ================= the reel =================
export function reel(cfg) {
  title(cfg.title);
  (cfg.caps || []).forEach((c) => cap(...c));
  endCard(cfg.end); if (cfg.endBoom) boom(...cfg.endBoom);
  let nh = 0, nm = 0, np = 0;
  const END = S.s8[0] + S.s8[1];
  const sc = cfg.scenes.map((s, i) => {
    const o = s.kind === "phone" ? phoneScene(s) : s.kind === "house" ? houseScene(s, -14 - 12 * nh++) : mapScene(s, 24 + 30 * nm++);
    const T = (f) => (Array.isArray(f) ? tm(f) : S[f][0]); o.t0 = T(s.from); o.t1 = cfg.scenes[i + 1] ? T(cfg.scenes[i + 1].from) : 1e9; o.i = s.kind === "phone" ? np++ : 0;
    return o;
  });
  // dim the 3D world behind the s7 end card so the rule reads clean
  const dimP = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), new THREE.MeshBasicMaterial({ color: 0x080622, transparent: true, opacity: 0, depthTest: false, depthWrite: false, fog: false, toneMapped: false }));
  dimP.renderOrder = 15; dimP.position.set(0, 0, -2.2); dimP.scale.set(8, 8, 1); camera.add(dimP);
  const SH = sc.map((o) => ({ at: o.t0, K: o.cam(Math.min(o.t1, END) - o.t0, o.i) }));
  run(cfg.id + "-world", (t) => {
    const { punch } = shoot(SH, t);
    dimP.material.opacity = 0.82 * sm(S.s7[0] + 0.1, S.s7[0] + 0.6, t); dimP.visible = dimP.material.opacity > 0.01;
    let dim = 1, ph = false;
    for (const o of sc) { const on = t >= o.t0 && t < o.t1; o.set(t, on); if (on && o.map) dim = 0.6; if (on && o.phone) ph = true; }
    phone.visible = screen.visible = ph;
    bloom.strength = dim * (1.0 + 1.2 * punch * punch + overlays(t));
  });
}
