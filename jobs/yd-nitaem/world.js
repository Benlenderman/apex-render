// 01 yd-nitaem: wrong (red): "נתאם" in the chat, three days go by, nobody leaves home.
// Right (violet/green): open an activity in Yesh Dibur (what / when / where, under a minute), people nearby tap "אני בפנים" and meet.
import { THREE, S, g, sm, pulse, scene, bloom, box, tube, glow, VIOLET, ORANGE, RED, GREEN, WHITE, shoot, run, beam, patch, hdg } from "./kit.js";
import { title, endCard, cap, boom, overlays, fitText, makePerson, pose, ARM, END } from "./extra.js";

scene.fog.density = 0.02;
const T = (id, w, n) => g(id, w, n);
const put = (m, x, y, z, s, a) => { m.visible = a > 0.01; if (!m.visible) return; m.position.set(x, y, z); m.rotation.set(0, 0, 0); m.scale.setScalar(s * (0.85 + 0.15 * a)); m.material.opacity = a; };
const pop = (t, t0) => sm(t0 - 0.08, t0 + 0.12, t);

// ---- the phone (stands on the grid, screen faces +z) ----
const PY = 2.6;
const phone = new THREE.Group(); scene.add(phone);
phone.add(box(2.3, 4.6, 0.18, 0, PY, 0, glow(0x0c0a24, 1), true));
const screen = box(2.05, 4.2, 0.02, 0, PY, 0.1, glow(0x14103a, 1), false); phone.add(screen);

// chat bubble: dark tinted box + white text, side -1 = left (them), 1 = right (me)
function bubble(text, hex, side, y, w = 1.35) {
  const bg = box(w, 0.6, 0.03, 0, 0, 0, new THREE.MeshBasicMaterial({ color: new THREE.Color(hex).multiplyScalar(0.45), transparent: true, toneMapped: false }), false);
  scene.add(bg); const tx = fitText([text], WHITE, 1.4, w * 1.1);
  const x = side * (1.02 - w / 2 - 0.08);
  return { set(a, dy = 0) { bg.visible = a > 0.01; bg.material.opacity = a; bg.position.set(x, PY + y + dy, 0.13); bg.scale.setScalar(0.6 + 0.4 * a); put(tx, x, PY + y + dy, 0.15, 0.6 + 0.4 * a, a); } };
}
const bQ = bubble("רוצים לצאת הערב?", VIOLET, -1, 1.45, 1.95);
const bN = bubble("נתאם", RED, 1, 0.7, 1.2);
const days = ["יום 1", "יום 2", "יום 3"].map((d, i) => { const m = fitText([d], RED, 1.8, 1.4); return (a) => put(m, 0, PY + 0.05 - i * 0.42, 0.15, 1, a); });
const seen = fitText([["אין תגובה...", 1]], RED, 1.6, 1.8);

// activity card (s4-s5)
const card = box(1.8, 2.7, 0.03, 0, PY - 0.2, 0.12, new THREE.MeshBasicMaterial({ color: new THREE.Color(VIOLET).multiplyScalar(0.28), transparent: true, toneMapped: false }), true); scene.add(card);
const cardT = fitText([["פעילות חדשה", 1]], VIOLET, 2.0, 1.6);
const rows = [["מה: קפה", "s5", "מה"], ["מתי: הערב, 20:00", "s5", "מתי"], ["איפה: ליד הבית", "s5", "ואיפה"]].map(([txt, id, w], i) => ({ m: fitText([txt], WHITE, 1.3, 1.5), t: () => T(id, w), y: PY + 0.55 - i * 0.6 }));
const ticks = rows.map((r) => box(0.14, 0.14, 0.02, 0, 0, 0, glow(GREEN, 2.5), false));
const plus = fitText(["+"], WHITE, 1.6, 1.6);
const clock = fitText([["0:42", 1]], GREEN, 2.2, 1.0);

// ---- the house (s3): a person alone inside, dim red ----
const HX = -14;
const house = new THREE.Group(); scene.add(house); house.position.set(HX, 0, 0);
const mWall = new THREE.MeshStandardMaterial({ color: 0x2a1030, emissive: 0x200810, roughness: 0.7, transparent: true, opacity: 0.35 });
house.add(box(4, 3, 3, 0, 1.5, 0, mWall, true));
house.add(tube([-2.2, 3, 1.6], [0, 4.4, 1.6], 0.1, glow(RED, 1.2)), tube([0, 4.4, 1.6], [2.2, 3, 1.6], 0.1, glow(RED, 1.2)));
house.add(box(0.9, 0.9, 0.05, 1.1, 1.8, 1.52, glow(0x40101a, 1), true)); // window
const loner = makePerson(); const lonerPhone = box(0.24, 0.4, 0.03, 0, 0, 0, glow(RED, 1.6), false); scene.add(lonerPhone);

// ---- the map (s6-s7): people around a meeting point ----
const MX = 24, MZ = 0;
const meet = patch(3.2, 3.2, GREEN, 1.4); meet.position.set(MX, 0.03, MZ);
const meetPin = tube([MX, 0, MZ], [MX, 2.4, MZ], 0.12, glow(GREEN, 2)); scene.add(meetPin);
const meetHead = box(0.5, 0.5, 0.5, MX, 2.6, MZ, glow(GREEN, 2.2), false); scene.add(meetHead);
const ppl = [0, 1, 2, 3, 4].map((i) => { const a = (i / 5) * Math.PI * 2 + 0.4, r = 3.4 + (i % 2) * 0.9; return { P: makePerson(), x0: MX + Math.cos(a) * r, z0: MZ + Math.sin(a) * r, a, pin: box(0.3, 0.3, 0.3, 0, 0, 0, glow(VIOLET, 2.2), false), ray: beam(GREEN, 2.2, 0.05) }; });
ppl.forEach((p) => scene.add(p.pin));
const inTag = fitText([["אני בפנים", 1]], GREEN, 2.0, 3.2);
const ring = patch(9, 9, VIOLET, 0.25); ring.position.set(MX, 0.02, MZ);

// ---- captions (top slot) ----
title('אף פעם אל תגידו "נתאם"');
cap("s2", "שלושה", ["3 ימים בצ'אט"], RED, { boom: 0.4 });
cap("s3", "יוצא", ["אף אחד לא יוצא"], RED, { boom: 0.3 });
cap("s4", "פותחים", ["פותחים פעילות", "ביש דיבור"], VIOLET, { boom: 0.4 });
cap("s5", "פחות", ["פחות מדקה"], GREEN, { boom: 0.35 });
cap("s6", "שקרוב", ["מי שקרוב רואה"], VIOLET);
cap("s6", "לוחץ", ['לוחץ "אני בפנים"'], GREEN, { boom: 0.3 });
cap("s6", "ונפגשים", ["ונפגשים"], GREEN, { boom: 0.5 });
endCard(["לא מתאמים.", "קובעים."]);
boom("s7", "קובעים", 0.5);

// ---- camera ----
const L = (id) => S[id][1];
const SH = [
  { at: 0, K: [[0, [0.3, 3.4, 6.6, 0, 3.4, 0, 50]], [L("s1") + L("s2"), [-0.2, 3.3, 5.6, 0, 3.3, 0, 50]]] },
  { at: S.s3[0], K: [[0, [HX + 3.5, 3.0, 8.6, HX, 2.9, 0, 50]], [L("s3") + 0.4, [HX + 2.2, 2.8, 7.4, HX, 2.7, 0, 50]]] },
  { at: S.s4[0], K: [[0, [-0.6, 3.4, 6.6, 0, 3.4, 0, 50]], [L("s4") + L("s5"), [0.4, 3.2, 5.6, 0, 3.2, 0, 50]]] },
  { at: S.s6[0], K: [[0, [MX, 9, MZ + 10, MX, 0.5, MZ - 1.5, 52]], [L("s6") + L("s7") + 1, [MX + 1.5, 6.5, MZ + 8, MX, 0.8, MZ - 1, 52]]] },
];

const vA = new THREE.Vector3(), vB = new THREE.Vector3();
run("yd-nitaem-world", (t) => {
  const { punch } = shoot(SH, t);
  const chat = t < S.s3[0], cardOn = t >= S.s4[0] && t < S.s6[0];

  // s1-s2: the chat. Question, then "נתאם", then days pile up with no reply
  const tN = T("s1", "נתאם");
  bQ.set(chat ? pop(t, 0.0) : 0);
  bN.set(chat ? pop(t, tN) : 0);
  const dT = [T("s2", "נשאר"), T("s2", "שלושה"), T("s2", "ימים")];
  days.forEach((f, i) => f(chat ? pop(t, dT[i]) : 0));
  put(seen, 0, PY - 1.25, 0.15, 1, chat ? pop(t, dT[2] + 0.3) * (0.6 + 0.4 * Math.sin(t * 8) ** 2) : 0);
  screen.material.color.set(chat && t > dT[0] ? 0x24101e : 0x14103a);

  // s3: the house, person alone, looking at a dead phone
  const hs = t >= S.s3[0] && t < S.s4[0];
  pose(loner, { x: HX - 0.4, z: 0.2, h: Math.PI, armR: 0.9, vis: hs, hex: RED });
  loner.head.rotation.x = hs ? 0.5 : 0; // head down
  if (hs) { loner.armR.userData.hand.getWorldPosition(vA); lonerPhone.position.set(vA.x, vA.y + 0.12, vA.z + 0.12); }
  lonerPhone.visible = hs; lonerPhone.material.color.set(RED).multiplyScalar(0.6 + 0.8 * (Math.sin(t * 3) > 0 ? 1 : 0.3));

  // s4-s5: activity card fills in, field by field, timer under a minute
  const tC = S.s4[0] + 0.1;
  const ca = cardOn ? pop(t, tC) : 0;
  card.visible = ca > 0.01; card.material.opacity = ca; card.scale.setScalar(0.7 + 0.3 * ca);
  put(cardT, 0, PY + 1.25, 0.15, 1, ca);
  put(plus, 0, PY - 0.2, 0.15, 1 + 0.1 * Math.sin(t * 8), ca * (1 - sm(T("s5", "מה") - 0.15, T("s5", "מה"), t)));
  rows.forEach((r, i) => { const a = cardOn ? pop(t, r.t()) : 0; put(r.m, -0.12 + 0.3 * (1 - a), r.y, 0.15, 1, a); { const k = cardOn ? pop(t, r.t() + 0.25) : 0; ticks[i].visible = k > 0.01; ticks[i].position.set(0.72, r.y, 0.16); ticks[i].scale.setScalar(0.3 + 0.7 * k); } });
  const tP = T("s5", "פחות"), ka = cardOn ? pop(t, tP) : 0;
  put(clock, 0, PY - 1.45, 0.15, 1 + 0.15 * pulse(t, tP, tP + 0.3), ka);
  phone.position.y = 0; phone.visible = !hs && t < S.s6[0];
  screen.visible = phone.visible;

  // s6-s7: nearby people see it, tap in, walk to the meeting point
  const mapOn = t >= S.s6[0] && t < (S.s8 ? S.s8[0] + 0.3 : 1e9);
  const tSee = T("s6", "רואה"), tTap = T("s6", "לוחץ"), tGo = T("s6", "ונפגשים");
  ring.set(mapOn ? sm(S.s6[0], tSee, t) * (1 - sm(tGo, tGo + 0.6, t)) : 0);
  meet.set(mapOn ? 0.6 + 0.4 * pulse(t, tSee - 0.2, 99) : 0);
  meetPin.visible = meetHead.visible = mapOn;
  meetHead.rotation.y = t * 1.5;
  ppl.forEach((p, i) => {
    const k = sm(tGo - 0.4 + i * 0.08, tGo + 1.8 + i * 0.08, t), r = 0.9 + 0.25 * (i % 2);
    const x = p.x0 + (MX + Math.cos(p.a) * r - p.x0) * k, z = p.z0 + (MZ + Math.sin(p.a) * r - p.z0) * k;
    const tapped = t > tTap + i * 0.07;
    pose(p.P, { x, z, h: hdg(MX - p.x0, MZ - p.z0), vis: mapOn, armR: mapOn && pulse(t, tTap + i * 0.07, tTap + i * 0.07 + 0.5) ? ARM.up : ARM.down, hex: tapped ? GREEN : VIOLET });
    p.P.g.position.y = mapOn && k > 0 && k < 1 ? Math.abs(Math.sin(t * 9 + i)) * 0.08 : 0;
    p.pin.visible = mapOn; p.pin.position.set(x, 2.2 + 0.1 * Math.sin(t * 4 + i), z); p.pin.material.color.set(tapped ? GREEN : VIOLET).multiplyScalar(1.4);
    vA.set(x, 0.1, z); vB.set(MX, 0.1, MZ);
    p.ray.set(vA, vB, mapOn ? sm(tSee - 0.1 + i * 0.05, tSee + 0.2 + i * 0.05, t) * (1 - sm(tGo, tGo + 0.5, t)) * 0.5 : 0);
  });
  const ta = mapOn ? pulse(t, tTap - 0.05, tGo - 0.1) : 0;
  inTag.visible = false;

  bloom.strength = (mapOn ? 0.6 : 1) * (1.0 + 1.2 * punch * punch + overlays(t));
});
