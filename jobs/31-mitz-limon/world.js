// One glowing world for the JobSpace / lemon-juice robber reel. Time comes only from hf-seek / __hfThreeTime.
import * as THREE from "three";
import { EffectComposer } from "three/addons/postprocessing/EffectComposer.js";
import { RenderPass } from "three/addons/postprocessing/RenderPass.js";
import { UnrealBloomPass } from "three/addons/postprocessing/UnrealBloomPass.js";
import { OutputPass } from "three/addons/postprocessing/OutputPass.js";
import { CopyShader } from "three/addons/shaders/CopyShader.js";
import { ShaderPass } from "three/addons/postprocessing/ShaderPass.js";
import { RGBShiftShader } from "three/addons/shaders/RGBShiftShader.js";
import { VignetteShader } from "three/addons/shaders/VignetteShader.js";

const { S, W, LEAD } = window.__EV;
const IDS = Object.keys(S);
const norm = (s) => s.replace(/[^א-ת0-9]/g, "");
const at = (id, word, n = 1) => {
  const hits = W[id].words.filter((w) => norm(w.text) === norm(word));
  if (!hits[n - 1]) throw new Error(`no word ${id}/${word}#${n}`);
  return hits[n - 1].start;
};
const g = (id, word, n) => S[id][0] + LEAD + at(id, word, n); // global time of a word
const sm = (a, b, x) => { const t = Math.min(1, Math.max(0, (x - a) / (b - a))); return t * t * (3 - 2 * t); };
const rng = ((s) => () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296))(55);

// ---------- renderer ----------
const canvas = document.getElementById("world");
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
renderer.setPixelRatio(1);
renderer.setSize(1080, 1920, false);
renderer.toneMapping = THREE.ACESFilmicToneMapping;
const scene = new THREE.Scene();
const BG = 0x03020f;
scene.background = new THREE.Color(BG);
scene.fog = new THREE.FogExp2(BG, 0.03);
const camera = new THREE.PerspectiveCamera(45, 1080 / 1920, 0.05, 600);
// pull back 1.2x so everything stays inside the Reels safe zone (phones crop ~9% per side)
const safeFov = (f) => 2 * Math.atan(Math.tan(f * Math.PI / 360) * 1.2) * 180 / Math.PI;
scene.add(new THREE.HemisphereLight(0x6fe8ff, 0x1a0630, 2.2));
const key = new THREE.DirectionalLight(0xffffff, 2.2); key.position.set(4, 8, 6); scene.add(key);
const composer = new EffectComposer(renderer, new THREE.WebGLRenderTarget(1080, 1920, { type: THREE.HalfFloatType, samples: 4 })) // MSAA: thin neon lines stop shimmering;
composer.addPass(new RenderPass(scene, camera));
const bloom = new UnrealBloomPass(new THREE.Vector2(1080, 1920), 1.0, 0.45, 0.8);
composer.addPass(bloom);
const rgb = new ShaderPass(RGBShiftShader); rgb.uniforms.amount.value = 0.0011; composer.addPass(rgb);
const vig = new ShaderPass(VignetteShader); vig.uniforms.offset.value = 1.0; vig.uniforms.darkness.value = 1.15; composer.addPass(vig);
const txtPass = new RenderPass(scene, camera); txtPass.clear = false; txtPass.clearDepth = true;
txtPass.render = function (...a) { const bg = scene.background; scene.background = null; camera.layers.set(1); RenderPass.prototype.render.apply(this, a); camera.layers.set(0); scene.background = bg; };
composer.addPass(txtPass);
composer.addPass(new OutputPass());
// cuts dissolve: the last frame of the outgoing shot fades over the new one
const prevRT = new THREE.WebGLRenderTarget(1080, 1920, { type: THREE.HalfFloatType });
const copyPass = new ShaderPass(CopyShader);
const mix = new ShaderPass({ uniforms: { tDiffuse: { value: null }, tPrev: { value: prevRT.texture }, k: { value: 0 } }, vertexShader: CopyShader.vertexShader,
  fragmentShader: "uniform sampler2D tDiffuse, tPrev; uniform float k; varying vec2 vUv; void main() { gl_FragColor = mix(texture2D(tDiffuse, vUv), texture2D(tPrev, vUv), k); }" });
composer.addPass(mix);

const glow = (hex, k) => new THREE.MeshBasicMaterial({ color: new THREE.Color(hex).multiplyScalar(k), toneMapped: false });
const VIOLET = 0x3ee6ff, ORANGE = 0xff2fb4, GOLD = 0xffd23a;
const mFrame = glow(VIOLET, 1.5), mHot = glow(ORANGE, 2.2);
// Fresnel rim glow added to the emissive term
const holo = (mat, rim, k = 1.6) => { mat.onBeforeCompile = (sh) => { sh.uniforms.rimC = { value: new THREE.Color(rim).multiplyScalar(k) };
  sh.fragmentShader = "uniform vec3 rimC;\n" + sh.fragmentShader.replace("#include <emissivemap_fragment>", "#include <emissivemap_fragment>\n totalEmissiveRadiance += rimC * pow(max(0.0, 1.0 - abs(dot(normal, normalize(vViewPosition)))), 2.2);"); }; return mat; };
const mSolid = holo(new THREE.MeshStandardMaterial({ color: 0x1a2a6a, emissive: 0x0a1440, roughness: 0.25, metalness: 0.6 }), 0x3ee6ff, 1.0);
const mWarm = holo(new THREE.MeshStandardMaterial({ color: 0xff3cb8, emissive: 0x700050, roughness: 0.35 }), 0xffa0e8, 2.0);
const mPerson = holo(new THREE.MeshStandardMaterial({ color: 0x4a7dff, emissive: 0x10308a, roughness: 0.3, metalness: 0.3 }), 0x5ff0ff, 2.2);
const mDark = holo(new THREE.MeshStandardMaterial({ color: 0x0c1030, emissive: 0x05061a, roughness: 0.3, metalness: 0.5 }), 0x7a5cff, 0.8);
const mEdge = new THREE.LineBasicMaterial({ color: new THREE.Color(VIOLET).multiplyScalar(1.3), toneMapped: false });

function box(w, h, d, x, y, z, mat = mSolid, edges = true) {
  const geo = new THREE.BoxGeometry(w, h, d);
  const m = new THREE.Mesh(geo, mat);
  m.position.set(x, y, z);
  if (edges) m.add(new THREE.LineSegments(new THREE.EdgesGeometry(geo), mEdge));
  return m;
}
// Hebrew text on a canvas plane; redrawn once Heebo has loaded and whenever set() changes the text
const TEXTS = [];
// keep text luminance under the bloom threshold (0.8) so it stays crisp
const txtCol = (hex, k) => { const c = new THREE.Color(hex), l = 0.2126 * c.r + 0.7152 * c.g + 0.0722 * c.b; return c.multiplyScalar(Math.min(k, 1.45, 0.72 / l)); };
function text(str, width, { px = 300, color = VIOLET, k = 1.8, align = "center", aspect = 2, weight = 900 } = {}) {
  const c = document.createElement("canvas");
  c.width = 1024; c.height = 1024 / aspect;
  const tex = new THREE.CanvasTexture(c);
  const mat = new THREE.MeshBasicMaterial({ map: tex, color: txtCol(color, k), transparent: true, toneMapped: false, depthWrite: false, fog: false });
  const m = new THREE.Mesh(new THREE.PlaneGeometry(width, width / aspect), mat);
  const paint = () => {
    const x = c.getContext("2d");
    x.clearRect(0, 0, c.width, c.height);
    x.fillStyle = "#fff"; x.direction = /^[\d₪A-Za-z %]+$/.test(m.userData.str) ? "ltr" : "rtl"; x.textBaseline = "middle";
    x.textAlign = align === "right" ? "right" : "center";
    x.font = `${weight} ${px}px Heebo, Arial, sans-serif`;
    const fit = Math.min(1, 980 / x.measureText(m.userData.str).width); // never clip a long word
    if (fit < 1) x.font = `${weight} ${Math.floor(px * fit)}px Heebo, Arial, sans-serif`;
    x.fillText(m.userData.str, align === "right" ? 1000 : 512, c.height / 2);
    tex.needsUpdate = true;
  };
  m.userData.str = str;
  m.userData.set = (s) => { if (s !== m.userData.str) { m.userData.str = s; paint(); } };
  m.layers.set(1); // text skips bloom: drawn in its own pass after the glow
  TEXTS.push(paint); paint();
  return m;
}
function person(mat) { // standing, faces +z, 1.6 tall
  const p = new THREE.Group();
  const body = new THREE.Mesh(new THREE.CapsuleGeometry(0.2, 0.7, 4, 10), mat); body.position.y = 0.75;
  const head = new THREE.Mesh(new THREE.SphereGeometry(0.17, 16, 12), mat); head.position.y = 1.42;
  p.add(body, head);
  return p;
}
function seated(mat) { // sits on a chair, faces +x
  const p = new THREE.Group();
  const body = new THREE.Mesh(new THREE.CapsuleGeometry(0.21, 0.45, 4, 10), mat); body.position.set(0, 1.12, 0);
  const head = new THREE.Mesh(new THREE.SphereGeometry(0.18, 16, 12), mat); head.position.set(0.04, 1.66, 0);
  p.add(body, head, box(0.5, 0.14, 0.34, 0.22, 0.74, 0, mat, false), box(0.12, 0.7, 0.3, 0.44, 0.36, 0, mat, false));
  p.add(box(0.12, 0.38, 0.12, 0.2, 1.12, 0.2, mat, false), box(0.12, 0.38, 0.12, 0.2, 1.12, -0.2, mat, false)); // arms
  p.add(box(0.5, 0.06, 0.5, -0.02, 0.64, 0, mDark), box(0.06, 0.7, 0.5, -0.28, 1.0, 0, mDark)); // chair
  return p;
}

// ---------- floor ----------
const grid = new THREE.GridHelper(600, 400, 0x2a6cff, 0x1a3aa0);
grid.material.toneMapped = false;
scene.add(grid);
const floor = new THREE.Mesh(new THREE.PlaneGeometry(600, 600), new THREE.MeshBasicMaterial({ color: 0x02020a }));
floor.rotation.x = -Math.PI / 2; floor.position.y = -0.01;
scene.add(floor);
const DUST = new Float32Array(1500 * 3), DC = new Float32Array(1500 * 3);
for (let i = 0; i < 1500; i++) { DUST.set([-12 + rng() * 56, rng() * 12, -16 + rng() * 30], i * 3); DC.set(rng() < 0.6 ? [0.3, 0.9, 1.4] : [1.4, 0.3, 1.0], i * 3); }
const dGeo = new THREE.BufferGeometry(); dGeo.setAttribute("position", new THREE.BufferAttribute(DUST, 3)); dGeo.setAttribute("color", new THREE.BufferAttribute(DC, 3));
const dust = new THREE.Points(dGeo, new THREE.PointsMaterial({ size: 0.035, vertexColors: true, transparent: true, opacity: 0.8, toneMapped: false, depthWrite: false, blending: THREE.AdditiveBlending }));
scene.add(dust);


// ================= reel 31: the lemon-juice robber =================
const GREEN = 0x4dff88, RED = 0xff4a4a, LEMON = 0xffe02a;
const mLemon = holo(new THREE.MeshStandardMaterial({ color: LEMON, emissive: 0x3a2c00, roughness: 0.35 }), 0xfff6a0, 0.8);
const mRob = holo(new THREE.MeshStandardMaterial({ color: 0x4a7dff, emissive: 0x10308a, roughness: 0.3, metalness: 0.3 }), 0x5ff0ff, 2.2);
const mHead = holo(new THREE.MeshStandardMaterial({ color: 0x4a7dff, emissive: 0x10308a, roughness: 0.3, metalness: 0.3 }), 0x5ff0ff, 2.2);
const mPaper = glow(0x1c1a48, 1);
const mWhite = glow(0xffffff, 1.1);
const pop = (a, u) => { const s = Math.min(1, Math.max(0, (u - a + 0.05) / 0.35)); return 0.01 + 0.99 * (1 - (1 - s) ** 3); };
const cl = (x) => Math.min(1, Math.max(0, x));
const lerpHex = (m, a, b, k) => m.color.setHex(a).lerp(new THREE.Color(b), k);

function lemon(s = 1) {
  const g = new THREE.Group();
  const b = new THREE.Mesh(new THREE.SphereGeometry(0.3, 24, 16), mLemon); b.scale.set(1.3, 1, 1);
  const t1 = new THREE.Mesh(new THREE.SphereGeometry(0.07, 12, 8), mLemon); t1.position.x = 0.4;
  const t2 = t1.clone(); t2.position.x = -0.4;
  const leaf = new THREE.Mesh(new THREE.SphereGeometry(0.1, 12, 8), glow(GREEN, 1.0)); leaf.scale.set(1.6, 0.4, 0.8); leaf.position.set(-0.28, 0.27, 0);
  g.add(b, t1, t2, leaf); g.scale.setScalar(s); return g;
}
// the robber: a standing figure that smiles; his head has its own material so lemon juice can turn it yellow
function robber(head = mHead) {
  const p = person(mRob); p.children[1].material = head;
  const eyeM = glow(0xffffff, 1.3);
  [-0.06, 0.06].forEach((x) => { const e = new THREE.Mesh(new THREE.SphereGeometry(0.024, 10, 8), eyeM); e.position.set(x, 1.47, 0.155); p.add(e); });
  const smile = new THREE.Mesh(new THREE.TorusGeometry(0.065, 0.014, 8, 20, Math.PI), eyeM); smile.rotation.z = Math.PI; smile.position.set(0, 1.39, 0.16);
  p.add(smile); p.userData.smile = smile;
  return p;
}
function secCam() { // wall security camera, lens toward +z, steady red dot (never blinks)
  const c = new THREE.Group();
  c.add(box(0.55, 0.28, 0.28, 0, 0, 0, mSolid), box(0.06, 0.3, 0.06, -0.2, 0.25, -0.1, mDark, false));
  const lens = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.1, 0.08, 20), mDark); lens.rotation.z = Math.PI / 2; lens.position.x = 0.31; c.add(lens);
  const dot = new THREE.Mesh(new THREE.SphereGeometry(0.035, 10, 8), glow(RED, 2.4)); dot.position.set(0.18, 0.08, 0.15); c.add(dot);
  return c;
}
function rrect(w, h, r) { const s = new THREE.Shape(), x = -w / 2, y = -h / 2; s.moveTo(x + r, y); s.lineTo(x + w - r, y); s.quadraticCurveTo(x + w, y, x + w, y + r); s.lineTo(x + w, y + h - r); s.quadraticCurveTo(x + w, y + h, x + w - r, y + h); s.lineTo(x + r, y + h); s.quadraticCurveTo(x, y + h, x, y + h - r); s.lineTo(x, y + r); s.quadraticCurveTo(x, y, x + r, y); return new THREE.ShapeGeometry(s, 8); }
function bankFront(x, z) { // a little bank building with columns and a sign
  const b = new THREE.Group(); b.position.set(x, 0, z);
  b.add(box(3.0, 2.4, 1.2, 0, 1.2, 0, mDark), box(3.4, 0.3, 1.5, 0, 2.55, 0, mSolid));
  const roof = new THREE.Mesh(new THREE.ConeGeometry(2.0, 0.7, 3), mSolid); roof.rotation.y = Math.PI / 2; roof.scale.z = 0.5; roof.position.y = 3.05; b.add(roof);
  [-1.1, -0.4, 0.4, 1.1].forEach((cx) => b.add(box(0.22, 2.1, 0.22, cx, 1.05, 0.72, mSolid, false)));
  const sign = text("בנק", 1.6, { px: 330, color: GOLD, k: 1.6 }); sign.position.set(0, 2.56, 0.77); b.add(sign);
  b.userData.sign = sign;
  return b;
}
const OX = (i) => i * 60; // every set lives far apart; only the active one is visible
const SETS = [];
const set = (i) => { const G = new THREE.Group(); G.position.x = OX(i); scene.add(G); SETS.push(G); return G; };

// ---------- 0: the bank (h1, s1) ----------
const G0 = set(0);
G0.add(box(12, 6, 0.2, 0, 3, -2.4, mDark, false));
G0.add(box(4.2, 1.15, 0.8, 0.4, 0.575, -1.4, mSolid), box(4.2, 0.05, 0.02, 0.4, 1.16, -0.99, mFrame, false));
const bankSign = text("בנק", 2.0, { px: 330, color: GOLD, k: 1.6 }); bankSign.position.set(0.4, 3.35, -2.25); G0.add(bankSign);
const cam0 = secCam(); cam0.position.set(-1.2, 3.1, -2.0); cam0.rotation.y = -1.1; cam0.rotation.z = -0.4; G0.add(cam0);
const cone = new THREE.Mesh(new THREE.ConeGeometry(0.55, 3.3, 24, 1, true), new THREE.MeshBasicMaterial({ color: new THREE.Color(RED).multiplyScalar(0.6), transparent: true, opacity: 0.08, side: THREE.DoubleSide, depthWrite: false, toneMapped: false }));
cone.position.set(-0.6, 2.27, -0.7); cone.lookAt(new THREE.Vector3(0, 1.45, 0.6)); cone.rotateX(-Math.PI / 2); // apex at the camera, wide end on his face G0.add(cone);
const teller = person(mWarm); teller.position.set(1.4, 0, -2.0); G0.add(teller);
const rob0 = robber(); G0.add(rob0);
const name0 = text("מקארתור ווילר", 1.4, { px: 120, color: 0xffffff, k: 1.3, aspect: 5 }); name0.position.set(0.25, 2.15, 0.7); G0.add(name0);
const bubble = new THREE.Group(); bubble.position.set(1.2, 2.7, 0.3); G0.add(bubble);
bubble.add(new THREE.Mesh(new THREE.CircleGeometry(0.62, 40), glow(0x2a2470, 1)), new THREE.Mesh(new THREE.RingGeometry(0.6, 0.66, 40), glow(VIOLET, 1.6)));
[[0.45, -0.75, 0.12], [0.25, -1.0, 0.07]].forEach(([x, y, r]) => { const d = new THREE.Mesh(new THREE.CircleGeometry(r, 20), glow(VIOLET, 1.6)); d.position.set(-x, y, 0); bubble.add(d); });
const bLemon = lemon(0.8); bLemon.position.z = 0.1; bubble.add(bLemon);

// ---------- 1: invisible ink (s2) ----------
const G1 = set(1);
G1.add(box(5.2, 0.15, 3.0, 0, 0.9, 0, holo(new THREE.MeshStandardMaterial({ color: 0x8a2a9a, emissive: 0x3a0840, roughness: 0.3, metalness: 0.4 }), 0xff60d0, 1.4)));
const paper = box(1.7, 0.02, 2.4, 0.1, 0.99, 0.0, mPaper, true); G1.add(paper);
const ink = text("סוד", 1.4, { px: 340, color: LEMON, k: 1.2, aspect: 1.6 }); ink.rotation.x = -Math.PI / 2; ink.position.set(0.1, 1.01, 0.0); G1.add(ink);
const lem1 = lemon(1.1); lem1.position.set(-0.75, 1.3, -1.1); G1.add(lem1);
const brush = new THREE.Group(); G1.add(brush);
brush.add(box(0.07, 0.07, 1.1, 0, 0, 0, mSolid, false), box(0.11, 0.11, 0.22, 0, 0, 0.6, mLemon, false));
brush.rotation.x = -0.9;

// ---------- 2: lemon on the face (s3) ----------
const G2 = set(2);
G2.add(box(12, 6, 0.2, 0, 3, -2.4, mDark, false));
const rob2 = robber(mHead); G2.add(rob2);
const lem2 = lemon(0.6); lem2.position.set(0.0, 2.25, 0.25); lem2.rotation.set(0.35, 0.7, 0.2); G2.add(lem2);
const DROPS = Array.from({ length: 6 }, (_, i) => { const d = new THREE.Mesh(new THREE.SphereGeometry(0.035, 10, 8), glow(LEMON, 1.6)); d.scale.y = 1.6; G2.add(d); return d; });

// ---------- 3: the Polaroid test (s4) ----------
const G3 = set(3);
G3.add(box(12, 6, 0.2, 0, 3, -2.4, mDark, false));
const rob3 = robber(mHead); rob3.position.set(-1.25, 0, 0); rob3.rotation.y = 0.5; G3.add(rob3);
const pol = new THREE.Group(); pol.position.set(0.55, 1.75, 0.2); pol.rotation.y = -0.35; G3.add(pol);
pol.add(box(1.25, 0.95, 0.55, 0, 0, 0, mSolid));
const plens = new THREE.Mesh(new THREE.CylinderGeometry(0.26, 0.26, 0.14, 28), mDark); plens.rotation.x = Math.PI / 2; plens.position.set(0, 0.06, 0.33); pol.add(plens);
pol.add(new THREE.Mesh(new THREE.RingGeometry(0.2, 0.26, 28), glow(VIOLET, 1.4)).translateZ(0.41).translateY(0.06));
[RED, GOLD, GREEN, VIOLET].forEach((c, i) => pol.add(box(0.24, 0.05, 0.01, -0.4 + i * 0.26, -0.38, 0.28, glow(c, 1.3), false)));
// the photo: white frame, dark picture, a body with no face
const photo = new THREE.Group(); G3.add(photo);
photo.add(box(1.0, 1.2, 0.02, 0, 0, 0, glow(0xb8c4ff, 0.32), false));
const pic = box(0.84, 0.86, 0.01, 0, 0.1, 0.015, glow(0x101030, 1.0), false); photo.add(pic);
const sil = new THREE.Mesh(new THREE.CapsuleGeometry(0.16, 0.28, 4, 10), glow(0x4a7dff, 0.9)); sil.position.set(0, -0.12, 0.03); sil.scale.z = 0.1; photo.add(sil);

// ---------- 4: two banks in Pittsburgh (s5) ----------
const G4 = set(4);
const B1 = bankFront(-1.05, -1.5), B2 = bankFront(1.05, -1.5); B1.scale.setScalar(0.6); B2.scale.setScalar(0.6); G4.add(B1, B2);
const city = text("פיטסבורג", 2.6, { px: 260, color: 0xffffff, k: 1.2, aspect: 4 }); city.position.set(0, 3.15, -1.2); G4.add(city);
const date = text("1995", 1.6, { px: 260, color: GOLD, k: 1.5, aspect: 3 }); date.position.set(0, 2.6, -1.2); G4.add(date);
const rob4 = robber(); rob4.scale.setScalar(0.9); G4.add(rob4);
const bag = new THREE.Mesh(new THREE.SphereGeometry(0.16, 14, 10), glow(GREEN, 1.0)); bag.position.set(0.28, 0.65, 0.1); rob4.add(bag);

// ---------- 5: the news on TV, someone recognizes him (s6) ----------
const G5 = set(5);
G5.add(box(12, 6, 0.2, 0, 3, -2.4, mDark, false));
const tv = new THREE.Group(); tv.position.set(0, 2.2, -1.6); G5.add(tv);
tv.add(new THREE.Mesh(rrect(3.4, 2.2, 0.18), glow(VIOLET, 1.1)), new THREE.Mesh(rrect(3.2, 2.0, 0.14), glow(0x0a0a24, 1)).translateZ(0.01));
tv.add(box(0.2, 0.8, 0.2, 0, -1.4, -0.1, mDark, false));
const tvRob = robber(); tvRob.scale.setScalar(0.95); tvRob.position.set(0, -0.95, 0.05); tv.add(tvRob);
const recDot = new THREE.Mesh(new THREE.CircleGeometry(0.06, 16), glow(RED, 2.0)); recDot.position.set(-1.35, 0.78, 0.03); tv.add(recDot);
const news = text("מבוקש", 1.1, { px: 260, color: RED, k: 1.5, aspect: 3 }); news.position.set(0.95, 0.72, 0.03); tv.add(news);
const viewer = seated(mWarm); viewer.rotation.y = Math.PI / 2; viewer.position.set(-1.1, 0, 1.4); G5.add(viewer); // faces -z, toward the TV
const bang = text("!", 0.9, { px: 700, color: GOLD, k: 1.6, aspect: 1 }); bang.position.set(-1.1, 2.35, 1.4); G5.add(bang);
const phone = box(0.12, 0.22, 0.03, -0.92, 1.45, 1.25, glow(VIOLET, 1.4), false); G5.add(phone);

// ---------- 6: he sees the footage (s7) ----------
const G6 = set(6);
G6.add(box(12, 6, 0.2, 0, 3, -2.4, mDark, false));
G6.add(box(2.6, 0.1, 1.4, 0, 0.85, 0, mSolid));

const scr6 = new THREE.Group(); scr6.position.set(0.55, 1.35, -0.2); scr6.rotation.y = -0.3; G6.add(scr6);
scr6.add(new THREE.Mesh(rrect(1.3, 0.9, 0.08), glow(VIOLET, 1.1)), new THREE.Mesh(rrect(1.2, 0.8, 0.06), glow(0x0a0a24, 1)).translateZ(0.01));
const scrRob = robber(); scrRob.scale.setScalar(0.42); scrRob.position.set(0, -0.36, 0.03); scr6.add(scrRob);
const rob6 = robber(); rob6.position.set(-0.75, 0, 0.55); rob6.rotation.y = 0.9; G6.add(rob6);
const shockQ = text("?!", 0.8, { px: 600, color: ORANGE, k: 1.7, aspect: 1 }); shockQ.position.set(-0.75, 2.2, 0.6); G6.add(shockQ);

// ---------- 7: the lab, Dunning and Kruger (s8) ----------
const G7 = set(7);
G7.add(box(12, 6, 0.2, 0, 3, -2.4, mDark, false));
const board7 = new THREE.Mesh(rrect(4.0, 2.0, 0.12), glow(0x14123a, 1)); board7.position.set(0, 3.0, -2.25); G7.add(board7);
G7.add(new THREE.Mesh(rrect(4.1, 2.1, 0.14), glow(VIOLET, 1.0)).translateZ(-2.27).translateY(3.0));
const headline = text("שודד עם מיץ לימון", 3.4, { px: 190, color: 0xffffff, k: 1.2, aspect: 5 }); headline.position.set(0, 3.25, -2.2); G7.add(headline);
const yr7 = text("1999", 1.3, { px: 260, color: GOLD, k: 1.5, aspect: 3 }); yr7.position.set(0, 2.55, -2.2); G7.add(yr7);
const dun = person(mPerson); dun.position.set(-0.75, 0, 0); dun.rotation.y = 0.25; G7.add(dun);
const kru = person(mWarm); kru.position.set(0.85, 0, 0.1); kru.rotation.y = -0.25; G7.add(kru);
const nDun = text("דאנינג", 1.3, { px: 230, color: 0xffffff, k: 1.2, aspect: 3 }); nDun.position.set(-0.75, 1.95, 0.1); G7.add(nDun);
const nKru = text("קרוגר", 1.3, { px: 230, color: 0xffffff, k: 1.2, aspect: 3 }); nKru.position.set(0.85, 1.95, 0.2); G7.add(nKru);
const lem7 = lemon(0.45); lem7.position.set(0, 3.85, -2.15); G7.add(lem7);

// ---------- 8: the chart (s9, s10) ----------
// four groups from weakest to strongest: how good they thought they were (pink) vs how good they really were (cyan)
const G8 = set(8);
const ACT = [0.12, 0.37, 0.62, 0.87], EST = [0.6, 0.57, 0.68, 0.74], BH = 3.0;
const mAct = glow(VIOLET, 1.3), mEst = glow(ORANGE, 1.3);
const BARS = ACT.map((a, i) => {
  const x = -1.35 + i * 0.9, est = box(0.32, 1, 0.3, x - 0.18, 0, 0, mEst.clone(), false), act = box(0.32, 1, 0.3, x + 0.18, 0, 0, mAct.clone(), false);
  G8.add(est, act); return { est, act, x };
});
G8.add(box(3.8, 0.04, 0.3, 0, 0.6, 0, glow(0xffffff, 0.5), false));
const lgEst = text("כמה הם חשבו שהם טובים", 3.6, { px: 170, color: ORANGE, k: 1.4, aspect: 6 }); lgEst.position.set(0, 4.75, 0); G8.add(lgEst);
const lgAct = text("כמה הם באמת טובים", 3.6, { px: 170, color: VIOLET, k: 1.4, aspect: 6 }); lgAct.position.set(0, 4.3, 0); G8.add(lgAct);
const lbWeak = text("הכי חלשים", 1.3, { px: 220, color: 0xffffff, k: 1.1, aspect: 3.5 }); lbWeak.position.set(-1.0, 0.25, 0.2); G8.add(lbWeak);
const lbTop = text("הכי טובים", 1.3, { px: 220, color: 0xffffff, k: 1.1, aspect: 3.5 }); lbTop.position.set(1.0, 0.25, 0.2); G8.add(lbTop);
const ring = new THREE.Mesh(new THREE.RingGeometry(0.55, 0.6, 48), glow(GOLD, 1.5)); ring.scale.y = 1.9; G8.add(ring);

// ---------- 9: end card (s11) ----------
const G9 = set(9);
const end1 = text("מפקפקים בעצמכם?", 3.0, { px: 230, color: 0xffffff, k: 1.25, aspect: 5 }); end1.position.set(0, 3.55, 0); G9.add(end1);
const end2 = text("אולי זה סימן טוב", 3.0, { px: 230, color: GOLD, k: 1.5, aspect: 5 }); end2.position.set(0, 2.75, 0); G9.add(end2);
const lem9 = lemon(0.7); lem9.position.set(0, 1.55, 0); G9.add(lem9);

// ---------- shots: one per line (or sub-shot on a word); [x,y,z, lookx,looky,lookz, fov] relative to the set ----------
const SH = [
  { at: 0, set: 0, K: [[0, [0.4, 2.0, 5.6, -0.2, 1.7, -0.4, 44]], [S.h1[1], [0.1, 1.85, 4.2, -0.1, 1.6, 0, 44]]] },
  { at: S.s1[0], set: 0, K: [[0, [-0.6, 2.0, 5.2, 0.2, 2.0, 0, 44]], [S.s1[1], [-0.2, 2.1, 4.6, 0.3, 2.1, 0, 44]]] },
  { at: S.s2[0], set: 1, K: [[0, [0.0, 5.6, 4.6, -0.1, 1.0, -0.2, 44]], [S.s2[1], [0.0, 5.3, 4.2, -0.1, 1.0, -0.2, 44]]] },
  { at: S.s3[0], set: 2, K: [[0, [0.5, 2.1, 4.0, 0, 1.8, 0, 40]], [S.s3[1], [0.2, 2.1, 3.4, 0, 1.8, 0, 40]]] },
  { at: S.s4[0], set: 3, K: [[0, [0.4, 2.0, 5.4, -0.2, 1.9, 0, 44]], [S.s4[1], [0.2, 2.0, 4.8, 0, 2.0, 0, 44]]] },
  { at: S.s5[0], set: 4, K: [[0, [0, 2.2, 7.8, 0, 1.9, -1, 46]], [S.s5[1], [0, 2.1, 7.2, 0, 1.9, -1, 46]]] },
  { at: S.s6[0], set: 5, K: [[0, [0.6, 2.4, 6.8, -0.3, 1.9, -0.4, 46]], [S.s6[1], [0.3, 2.3, 6.2, -0.4, 1.9, -0.4, 46]]] },
  { at: S.s7[0], set: 6, K: [[0, [0.0, 2.0, 5.2, -0.2, 1.6, 0, 42]], [S.s7[1], [-0.2, 1.95, 4.6, -0.3, 1.65, 0.2, 42]]] },
  { at: S.s8[0], set: 7, K: [[0, [0, 2.7, 7.4, 0, 2.3, -0.8, 46]], [S.s8[1], [0, 2.6, 6.6, 0, 2.3, -0.8, 46]]] },
  { at: S.s9[0], set: 8, K: [[0, [0, 2.6, 9.4, 0, 2.5, 0, 46]], [S.s9[1], [-0.2, 2.6, 9.0, -0.1, 2.5, 0, 46]]] },
  { at: S.s10[0], set: 8, K: [[0, [0.2, 2.6, 9.0, 0.1, 2.5, 0, 46]], [S.s10[1], [0.3, 2.6, 8.7, 0.2, 2.5, 0, 46]]] },
  { at: S.s11[0], set: 9, K: [[0, [0, 2.7, 7.2, 0, 2.6, 0, 45]], [S.s11[1], [0, 2.7, 7.0, 0, 2.6, 0, 45]]] },
];
function keys(t, K) { const s = cl((t - K[0][0]) / (K[1][0] - K[0][0])); return K[0][1].map((v, j) => v + (K[1][1][j] - v) * s); }
const A = (id, w, n) => at(id, w, n); // word time within its line
const showOnly = (i) => SETS.forEach((G, j) => (G.visible = j === i));

function drawAt(t) {
  let id = IDS[0];
  for (const k of IDS) if (t >= S[k][0]) id = k;
  const u = t - S[id][0] - LEAD;
  dust.position.y = 0.12 * Math.sin(t * 0.4); dust.rotation.y = t * 0.004;
  let shot = SH[0];
  for (const s of SH) if (t >= s.at) shot = s;
  showOnly(shot.set);
  dust.position.x = OX(shot.set);
  bankSign.visible = id === "h1"; teller.rotation.y = 0; teller.position.z = -2.0;
  lerpHex(mHead, 0x4a7dff, LEMON, 0); mHead.emissive.setHex(0x10308a);

  if (id === "h1") { // walks in, no mask, turns to the camera and smiles
    const w = sm(0.0, A("h1", "בלי") + 0.2, u);
    rob0.position.set(-1.3 + 1.3 * w, 0, 0.6); rob0.rotation.y = (1 - sm(A("h1", "וחייך") - 0.35, A("h1", "וחייך"), u)) * 1.2 - 0.5 * sm(A("h1", "וחייך"), A("h1", "למצלמות"), u);
    rob0.userData.smile.scale.setScalar(pop(A("h1", "וחייך") - 0.3, u));
    teller.rotation.y = -0.5 * sm(A("h1", "בלי"), A("h1", "בלי") + 0.4, u); teller.position.z = -2.0 - 0.2 * sm(A("h1", "בלי"), A("h1", "בלי") + 0.4, u);
    name0.visible = bubble.visible = false;
  } else if (id === "s1") {
    rob0.position.set(0, 0, 0.6); rob0.rotation.y = -0.5 + 0.5 * sm(0, 0.6, u); rob0.userData.smile.scale.setScalar(1);
    name0.visible = u < A("s1", "תוכנית") - 0.05; name0.scale.setScalar(pop(A("s1", "מקארתור"), u));
    bubble.visible = u > A("s1", "תוכנית") - 0.05; bubble.scale.setScalar(pop(A("s1", "תוכנית"), u));
  }
  if (id === "s2") { // write with lemon juice, the words fade out
    const wr = sm(A("s2", "כותבים") - 0.1, A("s2", "והכתב"), u), gone = sm(A("s2", "נעלם") - 0.1, A("s2", "נעלם") + 0.6, u);
    ink.material.opacity = (u < A("s2", "כותבים") ? 0 : 1) * (1 - gone);
    ink.scale.set(Math.max(0.01, wr), 1, 1); ink.position.x = 0.4 + 0.9 * (1 - wr);
    brush.visible = u > A("s2", "כותבים") - 0.3 && gone < 0.5;
    brush.position.set(0.1 + 0.7 - 1.4 * wr, 1.45, 0.25 + 0.08 * Math.sin(u * 12));
    lem1.rotation.y = 0.2 * u;
  }
  if (id === "s3") { // squeeze the lemon over the head, the face turns yellow
    const sq = sm(A("s3", "מרח") - 0.2, A("s3", "מרח") + 0.2, u), face = sm(A("s3", "מרח"), A("s3", "הפנים") + 0.2, u);
    lem2.scale.set(0.6 * (1 + 0.15 * sq), 0.6 * (1 - 0.15 * sq), 0.6);
    DROPS.forEach((d, i) => { const k = ((u - A("s3", "מרח") + i * 0.18) % 0.9) / 0.9; d.visible = u > A("s3", "מרח") - 0.05 && face < 1; d.position.set(-0.12 + 0.05 * i, 2.05 - 0.4 * k, 0.12); });
    lerpHex(mHead, 0x4a7dff, LEMON, face); mHead.emissive.setHex(0x10308a).lerp(new THREE.Color(0x9a7a00), face);
    rob2.userData.smile.scale.setScalar(1);
  }
  if (id === "s4") { // a Polaroid of himself: the photo slides out with no face in it
    lerpHex(mHead, 0x4a7dff, LEMON, 1); mHead.emissive.setHex(0x6a5200);
    const out = sm(A("s4", "צילם"), A("s4", "צילם") + 0.9, u), up = sm(A("s4", "ובתמונה") - 0.1, A("s4", "ובתמונה") + 0.6, u);
    photo.visible = u > A("s4", "צילם") - 0.05;
    photo.position.set(0.55 - 0.75 * up, 1.75 - 0.75 * out + 0.6 * up, 0.25 + 1.4 * up); photo.rotation.set(-0.15 * (1 - up), -0.35 * (1 - up), 0);
    photo.scale.setScalar(0.55 + 0.45 * up);
    pol.visible = up < 0.98;
  }
  if (id === "s5") { // two banks in one day
    lerpHex(mHead, 0x4a7dff, LEMON, 1); mHead.emissive.setHex(0x6a5200);
    const run = sm(A("s5", "שני") - 0.2, A("s5", "בנקים") + 0.6, u);
    rob4.position.set(-1.05 + 2.1 * run, 0, 0.6); bag.scale.setScalar(1 + 0.6 * sm(A("s5", "בנקים"), A("s5", "בנקים") + 0.3, u)); rob4.rotation.y = run > 0.02 && run < 0.98 ? Math.PI / 2 : 0;
    bag.visible = run > 0.02;
    [B1, B2].forEach((b, i) => { const on = i === 0 ? 1 : sm(A("s5", "בנקים") - 0.1, A("s5", "בנקים") + 0.3, u); b.userData.sign.material.color.copy(txtCol(GOLD, 0.6 + 1.0 * on)); });
    city.scale.setScalar(pop(A("s5", "בפיטסבורג"), u));
  }
  if (id === "s6") { // the footage on TV, a viewer recognizes him
    lerpHex(mHead, 0x4a7dff, LEMON, 1); mHead.emissive.setHex(0x6a5200);
    tv.visible = true; tvRob.scale.setScalar(0.95 * pop(A("s6", "את"), u));
    bang.visible = u > A("s6", "זיהה") - 0.05; bang.scale.setScalar(pop(A("s6", "זיהה"), u));
    phone.visible = u > A("s6", "זיהה") + 0.3;
  }
  if (id === "s7") { // he sees himself on the screen and can't believe it
    lerpHex(mHead, 0x4a7dff, LEMON, 1); mHead.emissive.setHex(0x6a5200);
    const sh = sm(A("s7", "בהלם") - 0.15, A("s7", "בהלם") + 0.2, u);
    rob6.children[1].position.set(0, 1.42 + 0.04 * sh, -0.06 * sh);
    rob6.userData.smile.scale.set(1, 1 - 1.8 * sh, 1);
    shockQ.visible = u > A("s7", "בהלם") - 0.05; shockQ.scale.setScalar(pop(A("s7", "בהלם"), u));
    rob6.rotation.y = 0.9 - 0.4 * sm(A("s7", "אבל") - 0.1, A("s7", "אבל") + 0.3, u);
  }
  if (id === "s8") {
    headline.scale.setScalar(pop(A("s8", "קרא") - 0.1, u)); lem7.scale.setScalar(0.45 * pop(A("s8", "קרא"), u));
    nDun.scale.setScalar(pop(A("s8", "דאנינג"), u)); nKru.scale.setScalar(pop(A("s8", "קרוגר"), u));
    yr7.scale.setScalar(pop(A("s8", "במעבדה"), u));
  }
  if (id === "s9" || id === "s10") {
    const grow = id === "s9" ? sm(0, 1.2, u) : 1, i = id === "s9" ? 0 : 3;
    const focus = id === "s9" ? sm(A("s9", "פחות") - 0.2, A("s9", "פחות") + 0.3, u) : sm(A("s10", "אלה") - 0.2, A("s10", "אלה") + 0.3, u);
    BARS.forEach((b, j) => {
      const he = 0.6 + BH * EST[j] * grow, ha = 0.6 + BH * ACT[j] * grow, dim = j === i ? 1 : 1 - 0.65 * focus;
      b.est.scale.y = BH * EST[j] * grow + 0.001; b.est.position.y = 0.6 + (BH * EST[j] * grow) / 2;
      b.act.scale.y = BH * ACT[j] * grow + 0.001; b.act.position.y = 0.6 + (BH * ACT[j] * grow) / 2;
      b.est.material.color.copy(new THREE.Color(ORANGE).multiplyScalar(1.3 * dim)); b.act.material.color.copy(new THREE.Color(VIOLET).multiplyScalar(1.3 * dim));
    });
    ring.visible = focus > 0.01; ring.position.set(BARS[i].x, 0.6 + BH * 0.45, 0.2); ring.scale.set(focus * 0.95, focus * 1.9, 1);
    lbWeak.visible = id === "s9"; lbTop.visible = id === "s10";
  }
  if (id === "s11") {
    end1.material.opacity = sm(0, 0.5, u); end2.material.opacity = sm(A("s11", "אולי") - 0.2, A("s11", "אולי") + 0.3, u);
    lem9.rotation.y = 0.3 * u;
  }

  const su = t - shot.at, [cx, cy, cz, lx, ly, lz, fov] = keys(su, shot.K), ox = OX(shot.set);
  camera.position.set(cx + ox, cy, cz); camera.lookAt(lx + ox, ly, lz);
  camera.fov = safeFov(fov); camera.updateProjectionMatrix();
}

function renderAt(t) { drawAt(t); composer.render(); }
window.__hf = window.__hf || {};
window.__hf.buildReady = window.__hf.buildReady || {};
window.__hf.buildReady["jobspace-world"] = Promise.all([document.fonts.load("900 100px Heebo"), document.fonts.load("800 100px Heebo")]).catch(() => {}).then(() => {
  TEXTS.forEach((p) => p());
  const t0 = window.__hfThreeTime || 0;
  renderAt(t0); renderAt(t0); // first bloom pass can come out black
});
window.addEventListener("hf-seek", (e) => renderAt(e.detail.time));
