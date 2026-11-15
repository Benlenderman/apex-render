// yd.js: shared Yesh Dibur reel scenes (phone / house / map) driven by a config. Lifted from reel 01 (yd-nitaem).
// world.js: import { reel, RED, ... } from "./yd.js"; reel({ id, title, caps, end, endBoom, scenes: [...] })
// Times: ["s2","word"] = that word, ["s2",0.4] = line start + 0.4 s.
import { THREE, S, g, sm, pulse, scene, camera, bloom, box, tube, glow, VIOLET, ORANGE, RED, GREEN, WHITE, shoot, run, beam, patch, hdg, label, mSolid } from "./kit.js";
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
    const bg = box(w, 0.6, 0.03, 0, 0, 0, tint(hex, 0.2), false); scene.add(bg);
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
  bar({ text, q, hex = GREEN, y = 0, frac = 1, at, fill, w = 1.7 }) {
    const tx = fitText([text], hex, 1.3, w), tq = q ? fitText([q], WHITE, 1.3, w) : null, track = box(1, 0.14, 0.03, 0, 0, 0, tint(WHITE, 0.15), false), bar = box(1, 0.14, 0.03, 0, 0, 0, tint(hex, 0.85), false);
    scene.add(track, bar); const t0 = tm(at), tf = fill ? tm(fill) : t0 + 0.2;
    return (t, on) => {
      const a = on ? pop(t, t0) : 0, f = Math.max(0.001, frac * sm(tf, tf + 0.9, t));
      const k = tq ? (t >= tf ? 1 : 0) : 1; // q = label before the number is spoken
      put(tx, 0, PY + y + 0.2, 0.15, 1, a * k); if (tq) put(tq, 0, PY + y + 0.2, 0.15, 1, a * (1 - k));
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
    pin.visible = head.visible = on && !s.court && mode === "gather"; head.rotation.y = t * 1.5; hoop.forEach((m) => (m.visible = on));
    ring.set(on && mode === "gather" ? sm(tSee - 0.6, tSee, t) * (1 - sm(tGo, tGo + 0.6, t)) : 0);
    if (tg) label(tg, MX, 3.9, MZ, 1, on ? pop(t, s.tagAt ? tm(s.tagAt) : tSee) : 0);
    // the ball: bounced by the solo player, or held by the first person after the meet
    ball.visible = on && ((mode === "alone" && s.ball !== false) || (s.court && mode === "gather"));
    if (mode === "alone") {
      const tL = T0("leave"), k = sm(tL, tL + 2.2, t), G = s.group ? 1 : 0, x = MX + 0.3 + 1.4 * G + 4.5 * k, z = MZ + 0.8 + 0.6 * G + 1.5 * k;
      pose(solo, { x, z, h: k > 0 ? hdg(4.5, 1.5) : G ? hdg(-2.2, -1.6) : Math.PI * 0.85, vis: on && k < 0.98, armR: k > 0 ? 0.6 : 0.3, hex: RED });
      solo.g.position.y = on && k > 0 && k < 1 ? Math.abs(Math.sin(t * 9)) * 0.08 : 0;
      if (on && s.ball !== false) { solo.armR.userData.hand.getWorldPosition(vA); ball.position.set(vA.x, k > 0 ? vA.y - 0.15 : 0.17 + Math.abs(Math.sin(t * 5)) * (vA.y - 0.4), vA.z); ball.visible = k < 0.98; }
    } else if (ball.visible) ball.position.set(MX + 0.25, 0.17 + Math.abs(Math.sin(t * 6)) * 0.9 * sm(tGo + 1.6, tGo + 2, t), MZ + 0.9);
    ppl.forEach((p, i) => {
      if (mode === "alone") {
        const gi = i < (s.group || 0), a = (i / (s.group || 1)) * Math.PI * 2, x = MX - 0.7 + Math.cos(a) * 0.75, z = MZ - 0.5 + Math.sin(a) * 0.75;
        pose(p.P, { x, z, h: hdg(MX - 0.7 - x, MZ - 0.5 - z) + 0.25 * Math.sin(t * 2 + i), vis: on && gi, armR: on && gi && Math.sin(t * 3 + i * 2) > 0.6 ? 1.2 : 0.2, hex: VIOLET });
        p.P.g.position.y = on && gi ? Math.abs(Math.sin(t * 7 + i * 1.3)) * 0.06 : 0; // jogging in place
        p.pin.visible = false; p.ray.set(vA, vB, 0); return;
      }
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


// ================= bar: a date at a high table, talk in world bubbles =================
// pairs: [{ x, z, gap, him:[[at,hex]..], her:[[at,hex]..], says:[{who:"him"|"her", text, at, off, hex, y}], talk:[[who, from, to]],
//          bored: at (she turns to her phone), happy: at (she leans in), heart: at, leave: at (she walks off), slump: at (he drops his head),
//          qs:{who, at, until, every} ("?" bubbles) }]
// tags: [{ text, hex, at, off, x, y, z, k, w }]   clocks: [{ text, hex, at, until, x, y, z }]   cam: (BX, d) => keys
const PINK = 0xff4d8a;
const heartGeo = (() => { const h = new THREE.Shape(); h.moveTo(0, -0.5); h.bezierCurveTo(-0.1, -0.35, -0.6, -0.05, -0.6, 0.25); h.bezierCurveTo(-0.6, 0.55, -0.25, 0.65, 0, 0.38); h.bezierCurveTo(0.25, 0.65, 0.6, 0.55, 0.6, 0.25); h.bezierCurveTo(0.6, -0.05, 0.1, -0.35, 0, -0.5); return new THREE.ShapeGeometry(h, 16); })();
const mctx = document.createElement("canvas").getContext("2d");
function wbubble(text, hex = VIOLET, w = 1.9) { // a speech bubble that faces the camera, sized to its text
  const tx = fitText([text], WHITE, 1.5, w);
  mctx.font = "900 100px Heebo, Arial, sans-serif"; const tw = mctx.measureText(text).width, px = Math.min(190, (980 / tw) * 100), fw = (tw * px) / 100 / 1024 * w + 0.22;
  const bg = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), new THREE.MeshBasicMaterial({ color: new THREE.Color(hex).multiplyScalar(0.42), transparent: true, depthTest: false, depthWrite: false, fog: false, toneMapped: false }));
  const tail = new THREE.Mesh(new THREE.CircleGeometry(0.09, 3), bg.material); tail.rotation.z = -Math.PI / 2; tail.position.set(0, -0.62, 0); bg.add(tail);
  bg.renderOrder = tail.renderOrder = 19; bg.visible = false; scene.add(bg);
  const hgt = (px / 512) * (w / 2) * 1.25 + 0.12;
  return (x, y, z, a, tx0 = 0) => {
    label(tx, x, y, z, 1, a); bg.visible = a > 0.01; if (!bg.visible) return;
    const k = 0.85 + 0.15 * a; bg.position.set(x, y, z); bg.quaternion.copy(camera.quaternion); bg.scale.set(fw * k, hgt * k, 1); bg.material.opacity = 0.92 * a;
    tail.position.x = tx0 / (fw * k); tail.scale.set(1 / (fw * k) * hgt * k * 1.2, 1, 1);
  };
}
const hexAt = (L, t, d) => { let h = d; for (const [a, x] of L || []) if (t >= tm(a)) h = x; return h; };
function pairOf(p, BX) {
  const x0 = BX + (p.x || 0), z0 = p.z || 0, gp = p.gap || 0.72, T = (k) => (p[k] ? tm(p[k]) : 1e9);
  const him = makePerson(), her = makePerson();
  const hair = (P) => P.body.add(box(0.34, 0.42, 0.12, 0, 1.6, 0.1, glow(0x5a2a6a, 1.4), false), box(0.36, 0.08, 0.36, 0, 1.83, 0, glow(0x5a2a6a, 1.4), false)); // long hair
  if (p.her2 !== "m") hair(her); if (p.him2 === "f") hair(him); // her2:"m" / him2:"f" = friends, not a date
  const tab = new THREE.Group(); scene.add(tab); tab.position.set(x0, 0, z0);
  tab.add(box(0.72, 0.05, 0.72, 0, 1.05, 0, mSolid), tube([0, 0.02, 0], [0, 1.03, 0], 0.07, mSolid), box(0.42, 0.04, 0.42, 0, 0.02, 0, mSolid),
    box(0.08, 0.17, 0.08, -0.2, 1.16, 0.05, glow(ORANGE, 1.5), false), box(0.08, 0.17, 0.08, 0.2, 1.16, -0.05, glow(VIOLET, 1.8), false));
  const ph = box(0.12, 0.2, 0.02, 0, 0, 0, glow(WHITE, 1.4), false); scene.add(ph);
  const heart = new THREE.Mesh(heartGeo, glow(PINK, 2.4)); scene.add(heart);
  const B = (p.says || []).map((s) => ({ ...s, b: wbubble(s.text, s.hex, s.w), t0: tm(s.at), t1: s.off ? tm(s.off) : 1e9 }));
  const qb = p.qs ? wbubble("?", p.qs.hex || VIOLET, 0.9) : null;
  const talking = (who, t) => B.some((s) => s.who === who && t >= s.t0 && t < Math.min(s.t1, s.t0 + 1.8)) || (p.talk || []).some(([w, a, b]) => w === who && t >= tm(a) && t < tm(b));
  return (t, on) => {
    tab.visible = on && !p.noTab; on = on && t >= (p.at ? tm(p.at) : -1e9); // noTab: standing outside; at: appears later
    const bored = sm(T("bored"), T("bored") + 0.5, t) * (1 - sm(T("happy") - 0.3, T("happy"), t)), happy = sm(T("happy"), T("happy") + 0.6, t), lv = sm(T("leave"), T("leave") + 1.8, t), cm = p.come ? 1 - sm(T("come"), T("come") + 1.6, t) : 0, slump = sm(T("slump"), T("slump") + 0.6, t);
    const tH = on && talking("him", t), tS = on && talking("her", t);
    const sl = p.solo ? lv : 0, sx = 3.6 * sl - 3.6 * Math.max(0, cm); // solo: he leaves / comes in himself
    pose(him, { x: x0 - gp + sx, z: z0 - 1.2 * sl, h: sl > 0 || cm > 0 ? hdg(1, 0) : p.solo ? (p.h ?? 0) : -Math.PI / 2, armR: tH ? 0.95 + 0.4 * Math.sin(t * 7) : 0.35, armL: 0.2, vis: on && sl < 0.97, hex: hexAt(p.him, t, VIOLET) });
    him.g.position.y = (sl > 0 && sl < 1) || (cm > 0 && cm < 1) ? Math.abs(Math.sin(t * 9)) * 0.07 : 0;
    him.head.rotation.set(tH ? 0.12 * Math.sin(t * 9) : 0.45 * slump + 0.05 * Math.sin(t * 2), 0, 0); him.body.rotation.x = 0.1 * slump;
    const hl = p.solo ? 0 : lv, hx = x0 + gp + 3.6 * hl, hz = z0 - 1.2 * hl;
    pose(her, { x: hx, z: hz, h: hl > 0 ? hdg(3.6, -1.2) : Math.PI / 2 + 1.25 * bored, armL: tS ? 0.95 + 0.4 * Math.sin(t * 6.5 + 1) : 0.3 + 0.9 * bored * (1 - lv), armR: 0.2, vis: on && !p.solo && hl < 0.97, hex: hexAt(p.her, t, VIOLET) });
    her.g.position.y = hl > 0 && hl < 1 ? Math.abs(Math.sin(t * 9)) * 0.07 : 0;
    her.head.rotation.set(tS ? 0.1 * Math.sin(t * 8) : 0.5 * bored + 0.06 * Math.sin(t * 2.3 + 1), 0, 0); her.body.rotation.x = -0.16 * happy;
    ph.visible = on && bored > 0.3 && lv < 0.5; if (ph.visible) { her.armL.userData.hand.getWorldPosition(vA); ph.position.set(vA.x, vA.y + 0.1, vA.z); ph.quaternion.copy(her.g.quaternion); ph.rotateX(-0.6); }
    const hk = on ? pop(t, T("heart")) : 0; heart.visible = hk > 0.01;
    if (heart.visible) { heart.position.set(x0, 2.25 + 0.05 * Math.sin(t * 3), z0); heart.quaternion.copy(camera.quaternion); heart.scale.setScalar(0.28 * hk * (1 + 0.12 * Math.max(0, Math.sin(t * 7)))); }
    for (const s of B) {
      const a = on ? pop(t, s.t0) * (1 - sm(s.t1 - 0.12, s.t1 + 0.08, t)) : 0, hm = s.who === "him", bx = hm ? x0 - gp + 0.45 : x0 + gp - 0.45;
      s.b(bx, (s.y || 2.45) + 0.04 * Math.sin(t * 2), z0, a, hm ? -0.4 : 0.4);
    }
    if (qb) { const q = p.qs, e = q.every || 0.9, u = t - tm(q.at), a = on && u > 0 && t < tm(q.until) ? Math.max(0, Math.sin(Math.PI * ((u % e) / (e * 0.7)))) * ((u % e) < e * 0.7 ? 1 : 0) : 0;
      qb(q.who === "him" ? x0 - gp + 0.15 : x0 + gp - 0.15, 2.3, z0, a, 0); }
  };
}
function barScene(s, BX) {
  const fl = patch(8, 6, s.floor || VIOLET, 0.3); fl.position.set(BX, 0.03, 0);
  const bar = new THREE.Group(); scene.add(bar); // s.noBar: outdoors bar.position.set(BX, 0, 0);
  bar.add(box(9, 1.1, 0.7, 0, 0.55, -3.4, mSolid), box(9, 0.06, 0.8, 0, 1.12, -3.4, glow(VIOLET, 1.2), false));
  for (let i = 0; i < 12; i++) bar.add(box(0.12, 0.12, 0.12, -4.4 + i * 0.8, 3.3 + 0.18 * Math.sin(i * 1.7), -3.0, glow(i % 3 ? ORANGE : VIOLET, 1.6), false));
  const P = s.pairs.map((p) => pairOf(p, BX));
  const tags = (s.tags || []).map((g0) => ({ ...g0, m: fitText([g0.text], g0.hex || WHITE, g0.k || 2.0, g0.w || 2.4), t0: tm(g0.at), t1: g0.off ? tm(g0.off) : 1e9 }));
  const clocks = (s.clocks || []).map((c) => {
    const G = new THREE.Group(), hp = new THREE.Group(), hx = c.hex || RED; scene.add(G);
    G.add(new THREE.Mesh(new THREE.RingGeometry(0.24, 0.3, 40), glow(hx, 2)), hp); hp.add(box(0.045, 0.2, 0.02, 0, 0.09, 0.01, glow(WHITE, 2), false));
    return { ...c, G, hp, m: fitText([c.text], hx, 2.0, 1.7), t0: tm(c.at), t1: c.until ? tm(c.until) : 1e9 };
  });
  return { set(t, on) {
    bar.visible = on && !s.noBar; fl.set(on ? 0.5 : 0); P.forEach((f) => f(t, on));
    for (const g0 of tags) label(g0.m, BX + (g0.x || 0), g0.y || 3.2, g0.z || 0, 1, on ? pop(t, g0.t0) * (1 - sm(g0.t1 - 0.1, g0.t1 + 0.1, t)) : 0);
    for (const c of clocks) {
      const a = on ? pop(t, c.t0) * (1 - sm(c.t1 - 0.1, c.t1 + 0.1, t)) : 0; c.G.visible = a > 0.01;
      if (c.G.visible) { c.G.position.set(BX + (c.x || 0), c.y || 2.7, c.z || 0); c.G.quaternion.copy(camera.quaternion); c.G.scale.setScalar(a); c.hp.rotation.z = -(t - c.t0) * 5; }
      label(c.m, BX + (c.x || 0), (c.y || 2.7) - 0.52, c.z || 0, 1, a);
    }
  }, cam: (d) => (s.cam ? s.cam(BX, d) : [[0, [BX + 0.5, 2.1, 6.6, BX, 1.75, 0, 50]], [d + 0.4, [BX - 0.4, 1.95, 5.7, BX, 1.7, 0, 50]]]) };
}

// ================= the reel =================
export function reel(cfg) {
  bloom.threshold = 0.95; bloom.radius = 0.3;
  title(cfg.title);
  (cfg.caps || []).forEach((c) => cap(...c));
  endCard(cfg.end); if (cfg.endBoom) boom(...cfg.endBoom);
  let nh = 0, nm = 0, np = 0, nb = 0;
  const END = S.s8[0] + S.s8[1];
  const sc = cfg.scenes.map((s, i) => {
    const o = s.kind === "bar" ? barScene(s, -60 - 30 * nb++) : s.kind === "phone" ? phoneScene(s) : s.kind === "house" ? houseScene(s, -14 - 12 * nh++) : mapScene(s, 24 + 30 * nm++);
    const T = (f) => (Array.isArray(f) ? tm(f) : S[f][0]); o.t0 = T(s.from); o.t1 = cfg.scenes[i + 1] ? T(cfg.scenes[i + 1].from) : 1e9; o.i = s.kind === "phone" ? np++ : 0;
    return o;
  });
  // dim the 3D world behind the s7 end card so the rule reads clean
  const dimP = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), new THREE.MeshBasicMaterial({ color: 0x080622, transparent: true, opacity: 0, depthTest: false, depthWrite: false, fog: false, toneMapped: false }));
  dimP.renderOrder = 15; dimP.position.set(0, 0, -2.2); dimP.scale.set(8, 8, 1); camera.add(dimP);
  const SH = sc.map((o) => ({ at: o.t0, K: o.cam(Math.min(o.t1, END) - o.t0, o.i) }));
  run(cfg.id + "-world", (t) => {
    const { punch } = shoot(SH, t);
    dimP.material.opacity = (cfg.dim ?? 0.82) * sm(S.s7[0] + 0.1, S.s7[0] + 0.6, t); dimP.visible = dimP.material.opacity > 0.01;
    let dim = 1, ph = false;
    for (const o of sc) { const on = t >= o.t0 && t < o.t1; o.set(t, on); if (on && o.map) dim = 0.6; if (on && o.phone) ph = true; }
    phone.visible = screen.visible = ph;
    bloom.strength = dim * (0.4 + 0.5 * punch * punch + 0.4 * overlays(t));
  });
}
