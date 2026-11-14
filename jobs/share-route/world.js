// 86 share-route: a rider alone crashes on a quiet road; nobody knows where to look or that he's missing (red).
// Right way: he sends a friend the route and the time he'll be back, shares live location, says when he's home; no word = the friend calls (green).
import { THREE, S, g, sm, flash, scene, bloom, box, VIOLET, ORANGE, RED, GREEN, pathState, shoot, sceneOf, run, patch } from "./kit.js";
import { track, buildRoad, makePerson, pose, ARM, title, endCard, cap, overlays, tag, tagAt, bikes, ride, dist, limbs, downLean } from "./extra.js";

scene.fog.density = 0.006;
const V = 13, { P } = track([{ len: 4000 }]);
buildRoad(P, -100, 3800, { lamps: false });
const B = bikes(1), LB = limbs(B[0]), rider = makePerson(), friend = makePerson();
const T2 = S.s2[0], T3 = S.s3[0], T4 = S.s4[0], T5 = S.s5[0], T6 = S.s6[0], T7 = S.s7[0];
const tCrash = g("s2", "crash"), tNobody = g("s2", "nobody"), tMissing = g("s2", "missing");
const tSend = g("s3", "send"), tRoute = g("s3", "route"), tTime = g("s3", "time");
const tLive = g("s4", "live"), tHome = g("s5", "home"), tTell = g("s5", "tell"), tIf = g("s5", "if"), tCall = g("s5", "call");

// ---- A: alone on an empty road; crashes on "crash", slides onto the shoulder ----
const tC = tCrash + 0.1;
const DA = dist((t) => V * (1 - sm(tC, tC + 1.1, t)), 0, T3 + 1), stopA = 60 + DA(T3);
const kDown = (t) => sm(tC, tC + 0.5, t);
const aPath = (t) => { const [x, z] = P(60 + DA(t), 1.8 + 2.2 * sm(tC, tC + 1.1, t)); return t > tC + 1.1 ? [x, z, 0] : [x, z]; };
// ---- B: leaves home at s4, rides the shared route, parks at the other home on "home" ----
const sB = 1500, tGo = T4 - 0.3, tArr = tHome + 0.1;
const vB = (t) => 12 * (sm(tGo, tGo + 1.2, t) - sm(tArr - 1.6, tArr, t));
const DB = dist(vB, T3, T7 + 8), sD = sB + DB(T7 + 8);
const bPath = (t) => {
  const [x, z] = P(sB + DB(t), 4.5 - 2.7 * sm(tGo, tGo + 1.2, t) + 2.7 * sm(tArr - 1.4, tArr, t));
  return t < tGo || t > tArr ? [x, z, 0] : [x, z];
};
const path = (t) => (t < T3 ? aPath(t) : bPath(t));

// ---- homes: start and end of the route; the friend's place is elsewhere (s5) ----
const house = (s, o) => { const [x, z] = P(s, o); scene.add(box(6, 3.6, 6, x, 1.8, z)); };
const sF = sB - 400;
house(sB + 2, 10); house(sD + 2, 10); house(sF, 10);

const tgWhere = tag("WHERE?", RED), tgMiss = tag("MISSING?", RED), tgBack = tag("BACK BY 6 PM", GREEN), tgLive = tag("LIVE", GREEN), tgHome = tag("I'M HOME", GREEN), tgCall = tag("NO WORD? CALL", ORANGE);
const crashZ = patch(5, 6, RED, 1.1), routeZ = patch(1.4, 1, GREEN, 0.9), liveZ = patch(2.4, 2.4, GREEN, 1.2);
const posAt = (s, o, m) => { const [x, z] = P(s, o); m.position.set(x, 0.03, z); };
const strip = (m, a, b, o, k) => { const [x, z] = P((a + b) / 2, o); m.position.set(x, 0.03, z); m.scale.set(1, Math.max(0.1, Math.abs(b - a)), 1); m.set(k); };

title("NEVER RIDE ALONE WITHOUT SHARING YOUR ROUTE");
cap("s2", "crash", ["A CRASH ON", "A QUIET ROAD"], RED, { until: ["s2", "nobody"] });
cap("s2", "nobody", ["NOBODY KNOWS", "WHERE TO LOOK"], RED, { boom: 0.5, until: ["s2", "missing"] });
cap("s2", "missing", ["OR THAT YOU'RE", "MISSING"], RED);
cap("s3", "send", ["SEND A FRIEND", "YOUR ROUTE"], GREEN, { until: ["s3", "time"] });
cap("s3", "time", ["AND WHEN", "YOU'LL BE BACK"], GREEN);
cap("s4", "share", ["OR SHARE YOUR", "LIVE LOCATION"], GREEN);
cap("s5", "home", ["HOME?", "TELL THEM"], GREEN, { until: ["s5", "if"] });
cap("s5", "if", ["NO MESSAGE?", "THEY KNOW TO CALL"], GREEN);
cap("s6", "send", ["SEND THIS TO THE FRIEND", "WHO RIDES ALONE"], GREEN);
endCard(["SHARE YOUR ROUTE.", "SAY WHEN YOU'RE HOME."]);

const cam = (s, o, y, ls, lo, ly, f) => { const [x, z] = P(s, o), [lx, lz] = P(ls, lo); return [x, y, z, lx, ly, lz, f]; };
const fol = (fn) => (t) => pathState(fn, t);
const SH = [
  { at: 0, f: fol(aPath), noRot: true, K: [[0, [0, 4, 10, 0, 0.8, -14, 50]], [3, [0, 5, 9, 0, 0.8, -16, 50]]] },
  { at: tCrash - 0.4, K: [[0, cam(stopA - 14, -2, 3.2, stopA, 4, 0.8, 46)], [3, cam(stopA - 15, -2.5, 3.6, stopA, 4, 0.8, 46)]] },
  // crane up: the empty road all around the crash
  { at: tNobody - 0.2, K: [[0, cam(stopA - 16, 0, 14, stopA + 4, 4, 0, 50)], [3, cam(stopA - 30, -2, 36, stopA + 8, 4, 0, 52)]] },
  { at: T3, K: [[0, cam(sB - 12, 2.5, 7, sB + 14, 3.5, 0.5, 50)], [3, cam(sB - 13, 2.2, 9, sB + 20, 3.5, 0.5, 50)]] },
  { at: T4, f: fol(bPath), noRot: true, K: [[0, [0, 5, 10, 0, 0.8, -14, 50]], [4, [0, 6, 9, 0, 0.8, -16, 50]]] },
  { at: tHome - 1.0, K: [[0, cam(sD - 14, -1.5, 4.5, sD, 6, 0.8, 46)], [3, cam(sD - 15, -2, 4.8, sD, 6, 0.8, 46)]] },
  { at: tIf - 0.2, K: [[0, cam(sF - 9, 2.5, 3.2, sF, 7.5, 1.4, 44)], [3, cam(sF - 9.5, 2.3, 3.4, sF, 7.5, 1.4, 44)]] },
  { at: T6, K: [[0, cam(sB - 25, -4, 26, (sB + sD) / 2, 3, 0, 52)], [4, cam(sB - 28, -5, 30, (sB + sD) / 2, 3, 0, 52)]] },
];

run("w", (t) => {
  const { id } = sceneOf(t), A = t < T3;
  const st = ride(B[0], path, t, A ? (t > tCrash - 0.2 ? RED : VIOLET) : GREEN, A ? { lean: downLean(kDown(t)), down: kDown(t), trail: t < tC + 1.1 } : { trail: t > tGo && t < tArr });
  if (A) B[0].g.position.y = 0.25 * kDown(t);
  // A: the rider lies on the shoulder past the bike
  { const [x, z] = P(stopA + 2.5, 5.6); pose(rider, { x, z, h: 0, lie: 1, vis: A && t > tC + 0.5, hex: RED }); }
  posAt(stopA + 1, 4.8, crashZ); crashZ.set(A ? sm(tC + 0.3, tC + 0.8, t) : 0);
  tagAt(tgWhere, st.x, 3.0, st.z, A && t > tNobody - 0.1 && t < tMissing - 0.2 ? 1 : 0, 3.2);
  tagAt(tgMiss, st.x, 3.0, st.z, A && t > tMissing - 0.2 ? 1 : 0, 3.2);
  // s3: phone up on "send"; the route lights along the road on "route"; the time at the far end on "time"
  // s5: arm up on "tell"
  LB.set((id === "s3" && t > tSend - 0.2) || (id === "s5" && t > tTell - 0.2 && t < tIf) ? { arm: 1, armA: 2.4, armF: 0.1, glow: 1 } : {});
  const kR = A ? 0 : sm(tRoute - 0.2, tRoute + 1.4, t);
  strip(routeZ, sB, sB + (sD - sB) * kR, 1.8, kR > 0.01 ? 1 : 0);
  { const [x, z] = P(sD, 4); tagAt(tgBack, x, 3.0, z, id === "s3" ? sm(tTime - 0.1, tTime + 0.2, t) : 0, 3.0); }
  // s4: live location pulses under the rider
  const kL = id === "s4" ? sm(tLive - 0.2, tLive + 0.2, t) : 0;
  liveZ.position.set(st.x, 0.04, st.z); liveZ.scale.setScalar(1 + 0.35 * Math.abs(Math.sin(t * 4))); liveZ.set(kL);
  tagAt(tgLive, st.x, 2.6, st.z, kL, 1.6);
  tagAt(tgHome, st.x, 2.6, st.z, id === "s5" && t > tTell - 0.2 && t < tIf ? 1 : 0, 1.8);
  // s5: the friend at their place, no message, phone up on "call"
  { const [x, z] = P(sF - 1, 6.8); pose(friend, { x, z, h: Math.PI / 2, vis: id === "s5" && t > tIf - 0.4, hex: GREEN, armR: ARM.up * 0.85 * sm(tCall - 0.4, tCall, t) });
    tagAt(tgCall, x, 2.6, z, id === "s5" && t > tIf ? 1 : 0, 1.4); }
  const shot = shoot(SH, t);
  bloom.strength = 1.0 + 1.2 * shot.punch * shot.punch + overlays(t) + 0.6 * flash(t, tC + 0.4) + 0.3 * flash(t, tRoute) + 0.3 * flash(t, tHome);
});
