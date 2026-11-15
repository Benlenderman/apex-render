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


// ================= reel 33: the hungry judges =================
const GREEN = 0x4dff88, RED = 0xff4a4a, BREAD = 0xffb85a;
const mBread = holo(new THREE.MeshStandardMaterial({ color: BREAD, emissive: 0x5a2c00, roughness: 0.4 }), 0xffe0a0, 1.2);
const mRobe = holo(new THREE.MeshStandardMaterial({ color: 0x1a1a3a, emissive: 0x0a0a20, roughness: 0.3, metalness: 0.4 }), 0xb08cff, 2.0);
const pop = (a, u) => { const s = Math.min(1, Math.max(0, (u - a + 0.05) / 0.35)); return 0.01 + 0.99 * (1 - (1 - s) ** 3); };
const cl = (x) => Math.min(1, Math.max(0, x));

function sandwich(s = 1) {
  const g = new THREE.Group();
  g.add(box(0.5, 0.08, 0.36, 0, 0, 0, mBread, false), box(0.52, 0.04, 0.38, 0, 0.06, 0, glow(GREEN, 1.1), false), box(0.5, 0.08, 0.36, 0, 0.12, 0, mBread, false));
  g.scale.setScalar(s); return g;
}
function clock(r = 0.5) { // round wall clock, hands set in drawAt
  const c = new THREE.Group();
  c.add(new THREE.Mesh(new THREE.CircleGeometry(r, 40), glow(0x14123a, 1)), new THREE.Mesh(new THREE.RingGeometry(r * 0.92, r, 40), glow(VIOLET, 1.6)));
  const hh = box(0.04, r * 0.5, 0.01, 0, r * 0.25, 0.02, glow(0xffffff, 1.2), false), mm = box(0.03, r * 0.8, 0.01, 0, r * 0.4, 0.03, glow(GOLD, 1.4), false);
  const H = new THREE.Group(), M = new THREE.Group(); H.add(hh); M.add(mm); c.add(H, M); c.userData = { H, M };
  return c;
}
const OX = (i) => i * 60;
const SETS = [];
const set = (i) => { const G = new THREE.Group(); G.position.x = OX(i); scene.add(G); SETS.push(G); return G; };

// ---------- 0: the courtroom (h1) ----------
const G0 = set(0);
G0.add(box(12, 6, 0.2, 0, 3, -2.6, mDark, false));
G0.add(box(3.0, 1.3, 0.8, 0, 0.65, -1.5, mSolid), box(3.0, 0.05, 0.02, 0, 1.31, -1.09, mFrame, false));
const judge0 = person(mRobe); judge0.position.set(0, 0.35, -1.9); G0.add(judge0);
const sand0 = sandwich(0.7); G0.add(sand0);
const pris0 = person(mPerson); pris0.position.set(0.85, 0, 0.2); pris0.rotation.y = Math.PI; G0.add(pris0);
const gavel = new THREE.Group(); gavel.position.set(-0.9, 1.45, -1.3); G0.add(gavel);
gavel.add(box(0.36, 0.14, 0.14, 0, 0, 0, mBread, false), box(0.05, 0.05, 0.4, 0, 0, 0.22, mBread, false));

// ---------- 1: 1,112 rulings (s1) ----------
const G1 = set(1);
const yr1 = text("2011", 1.6, { px: 260, color: GOLD, k: 1.5, aspect: 3 }); yr1.position.set(0, 4.2, 0); G1.add(yr1);
const RES = [-0.75, 0, 0.75].map((x) => { const p = person(mPerson); p.position.set(x * 1.6, 0, 0.9); p.scale.setScalar(0.8); G1.add(p); return p; });
const PILE = Array.from({ length: 14 }, (_, i) => { const f = box(1.2, 0.08, 0.85, 0.03 * Math.sin(i * 2.1), 0.05 + i * 0.1, -0.8, glow(i % 2 ? 0x2a2a70 : 0x3a3a90, 1), false); f.rotation.y = 0.12 * Math.sin(i * 1.7); G1.add(f); return f; });
const n1 = text("1,112 החלטות", 2.8, { px: 220, color: 0xffffff, k: 1.3, aspect: 5 }); n1.position.set(0, 3.3, 0.6); G1.add(n1);
const il1 = text("ישראל", 1.5, { px: 230, color: VIOLET, k: 1.4, aspect: 3 }); il1.position.set(0, 2.7, 0.6); G1.add(il1);

// ---------- 2: 8 judges, 10 months (s2) ----------
const G2 = set(2);
const JUDGES = Array.from({ length: 8 }, (_, i) => { const p = person(mRobe); p.position.set(-1.4 + i * 0.4, 0, -0.6 - 0.25 * (i % 2)); p.scale.setScalar(0.62); G2.add(p); return p; });
const j8 = text("8 שופטים", 2.0, { px: 230, color: 0xffffff, k: 1.3, aspect: 4 }); j8.position.set(0, 3.0, 0); G2.add(j8);
const m10 = text("10 חודשים", 2.0, { px: 230, color: GOLD, k: 1.5, aspect: 4 }); m10.position.set(0, 2.45, 0); G2.add(m10);
const QUEUE = Array.from({ length: 4 }, (_, i) => { const p = person(mPerson); p.position.set(-0.9 + i * 0.6, 0, 1.1); p.rotation.y = Math.PI; p.scale.setScalar(0.62); G2.add(p); return p; });

// ---------- 3: the chart (s3 to s6) ----------
// share of requests approved through a day: ~65% at the start, near 0 before the break, back to ~65% after it
const G3 = set(3);
const CW = 3.0, CH = 2.4, CX0 = -1.5, CY0 = 0.9;
G3.add(box(CW + 0.1, 0.04, 0.1, 0, CY0, 0, glow(0xffffff, 0.6), false), box(0.04, CH + 0.1, 0.1, CX0, CY0 + CH / 2, 0, glow(0xffffff, 0.6), false));
const BRK = 0.5; // break position on the x axis (0..1)
const val = (x) => (x < BRK ? 0.65 - 0.63 * (x / BRK) ** 1.2 : 0.65 - 0.45 * ((x - BRK) / (1 - BRK)));
const NDOT = 70;
const DOTS = Array.from({ length: NDOT }, (_, i) => {
  const x = i / (NDOT - 1), d = new THREE.Mesh(new THREE.SphereGeometry(0.045, 10, 8), glow(x < BRK ? ORANGE : VIOLET, 1.6));
  d.position.set(CX0 + CW * x, CY0 + CH * val(x), 0.05); G3.add(d); return d;
});
const JUMP = Array.from({ length: 10 }, (_, i) => { const d = new THREE.Mesh(new THREE.SphereGeometry(0.03, 8, 6), glow(VIOLET, 1.3)); d.position.set(CX0 + CW * BRK, CY0 + CH * (0.02 + 0.63 * (i / 9)), 0.05); G3.add(d); return d; });
const brkBar = box(0.36, CH, 0.02, CX0 + CW * BRK, CY0 + CH / 2, -0.05, glow(GOLD, 0.25), false); G3.add(brkBar);
const sand3 = sandwich(0.75); sand3.position.set(CX0 + CW * BRK, CY0 + CH + 0.45, 0); G3.add(sand3);
const lbStart = text("2 מכל 3", 1.3, { px: 230, color: ORANGE, k: 1.5, aspect: 3 }); lbStart.position.set(CX0 + 0.55, CY0 + CH * 0.65 + 0.35, 0.1); G3.add(lbStart);
const lbZero = text("כמעט 0", 1.3, { px: 230, color: RED, k: 1.5, aspect: 3 }); lbZero.position.set(CX0 + CW * BRK + 0.75, CY0 + 0.75, 0.1); G3.add(lbZero);
const lbBack = text("2 מכל 3", 1.3, { px: 230, color: VIOLET, k: 1.5, aspect: 3 }); lbBack.position.set(CX0 + CW * BRK + 0.75, CY0 + CH * 0.65 + 0.35, 0.1); G3.add(lbBack);
const lbBreak = text("הפסקת אוכל", 1.7, { px: 230, color: GOLD, k: 1.5, aspect: 4 }); lbBreak.position.set(CX0 + CW * BRK, CY0 + CH + 1.0, 0); G3.add(lbBreak);
const yAx = text("אושרו", 1.1, { px: 220, color: 0xffffff, k: 1.1, aspect: 3 }); yAx.position.set(CX0 + 0.45, CY0 + CH + 0.15, 0); G3.add(yAx);
const clk3 = clock(0.32); clk3.position.set(CX0 + CW - 0.35, CY0 - 0.5, 0); G3.add(clk3);

// ---------- 4: famous around the world (s7) ----------
const G4 = set(4);
const globe = new THREE.Mesh(new THREE.SphereGeometry(1.0, 20, 14), new THREE.MeshBasicMaterial({ color: new THREE.Color(VIOLET).multiplyScalar(0.9), wireframe: true, toneMapped: false })); globe.position.set(0, 1.5, -0.5); G4.add(globe);
const head4 = text("השופטים הרעבים", 3.0, { px: 230, color: 0xffffff, k: 1.3, aspect: 5 }); head4.position.set(0, 3.25, 0.3); G4.add(head4);
const sand4 = sandwich(0.8); sand4.position.set(0, 1.45, 0.75); G4.add(sand4);

// ---------- 5: the lawyer twist (s8) ----------
const G5 = set(5);
G5.add(box(12, 6, 0.2, 0, 3, -2.6, mDark, false));
const LINE = Array.from({ length: 5 }, (_, i) => {
  const p = person(mPerson); p.scale.setScalar(0.7); G5.add(p);
  const law = i % 2 === 0; // with a lawyer: a briefcase by his side
  if (law) { const bc = box(0.24, 0.18, 0.08, 0.3, 0.55, 0, mBread, false); p.add(bc); }
  return { p, law, i };
});
const noLaw = text("בלי עורך דין", 2.4, { px: 230, color: ORANGE, k: 1.5, aspect: 4.5 }); noLaw.position.set(0, 3.2, 0); G5.add(noLaw);
const endR = text("סוף הסבב", 1.6, { px: 230, color: GOLD, k: 1.5, aspect: 3.5 }); endR.position.set(0.4, 2.3, 0); G5.add(endR);

// ---------- 6: the clock and the stomach (s9) ----------
const G6 = set(6);
const clk6 = clock(0.6); clk6.position.set(-0.8, 2.6, 0); G6.add(clk6);
const plate6 = new THREE.Group(); plate6.position.set(0.85, 2.6, 0); G6.add(plate6);
plate6.add(new THREE.Mesh(new THREE.CircleGeometry(0.6, 40), glow(0x14123a, 1)), new THREE.Mesh(new THREE.RingGeometry(0.54, 0.6, 40), glow(GOLD, 1.5)));
const s6w = sandwich(0.8); s6w.rotation.x = Math.PI / 2; s6w.position.z = 0.15; plate6.add(s6w);
const judge6 = person(mRobe); judge6.position.set(0, 0, 0.3); G6.add(judge6);
const q6 = text("?", 0.8, { px: 700, color: GOLD, k: 1.6, aspect: 1 }); q6.position.set(0, 3.7, 0); G6.add(q6);

// ---------- 7: end card (s10) ----------
const G7 = set(7);
const end1 = text("החלטה גדולה?", 3.0, { px: 230, color: 0xffffff, k: 1.25, aspect: 5 }); end1.position.set(0, 3.55, 0); G7.add(end1);
const end2 = text("קודם תאכלו משהו", 3.0, { px: 230, color: GOLD, k: 1.5, aspect: 5 }); end2.position.set(0, 2.75, 0); G7.add(end2);
const sand7 = sandwich(1.0); sand7.position.set(0, 1.55, 0); G7.add(sand7);

// ---------- shots ----------
const SH = [
  { at: 0, set: 0, K: [[0, [0.6, 2.0, 5.4, 0, 1.6, -0.8, 44]], [S.h1[1], [0.3, 1.9, 4.6, 0, 1.6, -0.8, 44]]] },
  { at: S.s1[0], set: 1, K: [[0, [0, 2.6, 7.6, 0, 2.2, 0, 45]], [S.s1[1], [0, 2.5, 7.0, 0, 2.2, 0, 45]]] },
  { at: S.s2[0], set: 2, K: [[0, [0, 2.2, 6.6, 0, 1.6, 0, 45]], [S.s2[1], [0.2, 2.1, 6.0, 0, 1.6, 0, 45]]] },
  { at: S.s3[0], set: 3, K: [[0, [0, 2.4, 7.4, 0, 2.3, 0, 45]], [S.s6[0] + S.s6[1] - S.s3[0], [0, 2.4, 7.0, 0, 2.3, 0, 45]]] },
  { at: S.s7[0], set: 4, K: [[0, [0, 2.2, 6.4, 0, 2.2, 0, 45]], [S.s7[1], [0, 2.2, 5.9, 0, 2.2, 0, 45]]] },
  { at: S.s8[0], set: 5, K: [[0, [0, 2.0, 6.6, 0, 1.7, 0, 45]], [S.s8[1], [0, 2.0, 6.2, 0, 1.7, 0, 45]]] },
  { at: S.s9[0], set: 6, K: [[0, [0, 2.3, 7.0, 0, 2.2, 0, 45]], [S.s9[1], [0, 2.3, 6.5, 0, 2.2, 0, 45]]] },
  { at: S.s10[0], set: 7, K: [[0, [0, 2.7, 7.2, 0, 2.6, 0, 45]], [S.s10[1], [0, 2.7, 7.0, 0, 2.6, 0, 45]]] },
];
function keys(t, K) { const s = cl((t - K[0][0]) / (K[1][0] - K[0][0])); return K[0][1].map((v, j) => v + (K[1][1][j] - v) * s); }
const A = (id, w, n) => at(id, w, n);
const showOnly = (i) => SETS.forEach((G, j) => (G.visible = j === i));
const setClock = (c, h) => { c.userData.H.rotation.z = -h / 12 * Math.PI * 2; c.userData.M.rotation.z = -h * Math.PI * 2; };

function drawAt(t) {
  let id = IDS[0];
  for (const k of IDS) if (t >= S[k][0]) id = k;
  const u = t - S[id][0] - LEAD;
  dust.position.y = 0.12 * Math.sin(t * 0.4); dust.rotation.y = t * 0.004;
  let shot = SH[0];
  for (const s of SH) if (t >= s.at) shot = s;
  showOnly(shot.set);
  dust.position.x = OX(shot.set);

  if (id === "h1") { // the prisoner stands before the judge; the judge takes a bite
    const bite = sm(A("h1", "אכל") - 0.4, A("h1", "אכל"), u), down = sm(A("h1", "אכל") + 0.3, A("h1", "אכל") + 0.7, u);
    const k = bite * (1 - down);
    sand0.position.set(0.25 - 0.1 * k, 1.42 + 0.33 * k, -1.2 - 0.35 * k); sand0.rotation.z = 0.3 * k;
    sand0.scale.set(0.7 * (1 - 0.3 * down), 0.7, 0.7);
    gavel.rotation.z = 0.3 * Math.sin(Math.min(u, A("h1", "שופט")) * 6) * (u < A("h1", "שופט") ? 1 : 0);
  }
  if (id === "s1") {
    yr1.scale.setScalar(pop(0, u));
    RES.forEach((p, i) => p.scale.setScalar(0.8 * pop(A("s1", "שלושה") + 0.12 * i, u)));
    const fill = sm(A("s1", "בדקו"), A("s1", "החלטות") + 0.3, u);
    PILE.forEach((f, i) => (f.visible = i / PILE.length < fill));
    n1.scale.setScalar(pop(A("s1", "מאלף"), u)); il1.scale.setScalar(pop(A("s1", "בישראל"), u));
  }
  if (id === "s2") {
    JUDGES.forEach((p, i) => p.scale.setScalar(0.62 * pop(A("s2", "שמונה") + 0.06 * i, u)));
    j8.scale.setScalar(pop(A("s2", "שמונה"), u)); m10.scale.setScalar(pop(A("s2", "עשרה"), u));
    QUEUE.forEach((p, i) => p.scale.setScalar(0.62 * pop(A("s2", "ואסירים") + 0.1 * i, u)));
  }
  if (["s3", "s4", "s5", "s6"].includes(id)) {
    const T = t - S.s3[0];
    // how far the line has drawn (0..1 on x)
    let x = 0.04;
    if (id === "s3") x = 0.04 + 0.04 * sm(0, S.s3[1], u);
    if (id === "s4") x = 0.08 + (BRK - 0.08) * sm(A("s4", "עבר") - 0.2, A("s4", "לאפס") + 0.2, u);
    if (id === "s5") x = BRK;
    if (id === "s6") x = BRK + 0.35 * sm(A("s6", "שוב"), A("s6", "שלוש") + 0.5, u);
    DOTS.forEach((d, i) => (d.visible = i / (NDOT - 1) <= x + 1e-6));
    const jump = id === "s6" ? sm(A("s6", "חזרו"), A("s6", "שוב"), u) : 0;
    JUMP.forEach((d, i) => (d.visible = i / 9 < jump));
    lbStart.scale.setScalar(id === "s3" ? pop(A("s3", "שתיים"), u) : 1);
    lbZero.visible = id !== "s3" && id !== "s6" && (id !== "s4" || u > A("s4", "לאפס") - 0.1); lbZero.scale.setScalar(id === "s4" ? pop(A("s4", "לאפס"), u) : 1);
    const brk = id === "s5" ? pop(A("s5", "להפסקת"), u) : id === "s6" ? 1 : 0;
    brkBar.visible = sand3.visible = lbBreak.visible = brk > 0.02;
    sand3.scale.setScalar(0.75 * brk); lbBreak.scale.setScalar(brk); sand3.rotation.y = 0.6 * T;
    lbBack.visible = id === "s6" && u > A("s6", "שוב") - 0.05; lbBack.scale.setScalar(pop(A("s6", "שוב"), u));
    setClock(clk3, 9 + 6 * x);
  }
  if (id === "s7") {
    globe.rotation.y = 0.4 * u; head4.scale.setScalar(pop(A("s7", "השופטים"), u)); sand4.rotation.y = 0.5 * u;
  }
  if (id === "s8") { // prisoners without a lawyer slide to the back of the line
    const mv = sm(A("s8", "בסוף") - 0.3, A("s8", "סבב") + 0.3, u);
    const order0 = [0, 1, 2, 3, 4], order1 = [0, 2, 4, 1, 3]; // slot each person ends in
    LINE.forEach(({ p, law, i }) => {
      const s0 = order0.indexOf(i), s1 = order1.indexOf(i), s = s0 + (s1 - s0) * mv;
      p.position.set(-1.4 + s * 0.7, 0, 0.2 + (law ? 0 : 0.5 * Math.sin(Math.PI * mv)));
      const hl = !law ? sm(A("s8", "בלי") - 0.1, A("s8", "בלי") + 0.3, u) : 0;
      p.children[1].material = hl > 0.5 ? mWarm : mPerson; p.children[0].material = hl > 0.5 ? mWarm : mPerson;
    });
    noLaw.scale.setScalar(pop(A("s8", "בלי"), u)); endR.scale.setScalar(pop(A("s8", "בסוף"), u));
  }
  if (id === "s9") {
    setClock(clk6, 10 + 0.5 * u);
    clk6.scale.setScalar(pop(A("s9", "בשעה"), u)); plate6.scale.setScalar(pop(A("s9", "ובבטן"), u));
    q6.scale.setScalar(pop(A("s9", "השאלה"), u));
  }
  if (id === "s10") {
    end1.material.opacity = sm(A("s10", "החלטה") - 0.3, A("s10", "החלטה") + 0.2, u); end2.material.opacity = sm(A("s10", "קודם") - 0.2, A("s10", "קודם") + 0.3, u);
    sand7.rotation.y = 0.4 * u; sand7.scale.setScalar(pop(A("s10", "תאכלו"), u));
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
