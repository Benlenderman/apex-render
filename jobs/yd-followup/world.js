import { reel, RED, GREEN, VIOLET, WHITE } from "./yd.js";
const lab = [];
[[-1.45, 0.4], [1.45, 0.4], [-1.45, -2.0], [1.45, -2.0]].forEach(([x, z], i) =>
  lab.push({ x, z, gap: 0.6, qs: { who: i % 2 ? "her" : "him", at: ["s3", 0.3 + i * 0.25], until: ["s4", 0], every: 1.1, hex: GREEN }, talk: [["him", ["s3", 0], ["s4", 0]]] }));
reel({
  id: "yd-followup",
  title: "אף פעם אל תענו בסיפור משלכם",
  dim: 0.35,
  caps: [
    ["s2", "שני", ["אין דייט שני"], RED, { boom: 0.35 }],
    ["s4", "אהבו", ["שואלים יותר = אוהבים יותר"], GREEN, { boom: 0.3 }],
  ],
  end: ["\"איתך קל לדבר.\"", "והוא כמעט לא דיבר."],
  endBoom: ["s7", "קל", 0.4],
  scenes: [
    { from: "s1", kind: "bar", pairs: [{
      says: [{ who: "her", text: "חזרתי עכשיו מהודו", at: ["s1", "סיפרה"], off: ["s2", "גם"] },
             { who: "him", text: "גם אני הייתי בהודו!", hex: RED, at: ["s2", "גם"], off: ["s2", "דייט"] }],
      talk: [["her", ["s1", "סיפרה"], ["s1", "בהודו"]], ["him", ["s2", "גם"], ["s2", "היה"]]],
      him: [[["s2", "ודיבר"], RED]], bored: ["s2", "עצמו"], leave: ["s2", "שני"], slump: ["s2", "היה"] }],
      clocks: [{ text: "10 דקות", at: ["s2", "עשר"], until: ["s2", "דייט"], x: 0, y: 3.55 }] },
    { from: "s3", kind: "bar", pairs: lab,
      tags: [{ text: "הארוורד, 2017", hex: VIOLET, at: ["s3", "חוקרים"], y: 4.3, z: -1 },
             { text: "מאות שיחות", at: ["s3", "מאות"], y: 3.6, z: -1, off: ["s3", "חלקן"] },
             { text: "ספיד דייטינג", hex: GREEN, at: ["s3", "חלקן"], y: 3.6, z: -1 }],
      cam: (BX, d) => [[0, [BX, 5.6, 8.6, BX, 1.4, -1.1, 50]], [d + 0.4, [BX, 5.0, 7.6, BX, 1.4, -1.1, 50]]] },
    { from: "s4", kind: "bar", pairs: [
      { x: -1.55, gap: 0.6, him: [[["s4", 0], RED]], bored: ["s4", "אהבו"], slump: ["s4", "קיבל"] },
      { x: 1.55, gap: 0.6, him: [[["s4", 0], GREEN]], qs: { who: "him", at: ["s4", "ששאל"], until: ["s4", "אהבו"], every: 0.8 }, happy: ["s4", "אהבו"], heart: ["s4", "אהבו"] }],
      tags: [{ text: "שאל מעט", hex: RED, at: ["s4", 0.05], x: -1.55, y: 2.85, w: 1.3 },
             { text: "שאל הרבה", hex: GREEN, at: ["s4", 0.05], x: 1.55, y: 2.85, w: 1.3, off: ["s4", "קיבל"] },
             { text: "דייט שני", hex: GREEN, at: ["s4", "קיבל"], x: 1.55, y: 2.85, w: 1.3 }],
      cam: (BX, d) => [[0, [BX, 2.6, 9.8, BX, 1.6, 0, 50]], [d + 0.4, [BX, 2.5, 9.2, BX, 1.6, 0, 50]]] },
    { from: "s5", kind: "bar", pairs: [{
      says: [{ who: "her", text: "היה לי יום קשה", at: ["s5", "שאלה"] },
             { who: "him", text: "מה קרה?", hex: GREEN, at: ["s5", "השני"], y: 2.0 }],
      him: [[["s5", "השני"], GREEN]], talk: [["him", ["s5", "שעבדו"], ["s5", "שאלות"]]] }],
      tags: [{ text: "שאלת המשך", hex: GREEN, at: ["s5", "המשך"], y: 3.35, k: 2.4 }] },
    { from: "s6", kind: "bar", pairs: [{
      says: [{ who: "her", text: "חזרתי עכשיו מהודו", at: ["s6", "סיפרה"], off: ["s6", "שאל"] },
             { who: "him", text: "מה גרם לך לנסוע לבד?", hex: GREEN, at: ["s6", "שאל"], off: ["s7", 0] }],
      him: [[["s6", "שאל"], GREEN]], her: [[["s7", "דיברה"], GREEN]],
      talk: [["her", ["s6", "סיפרה"], ["s6", "הודו"]], ["her", ["s7", 0], ["s7", "והוא"]]],
      happy: ["s7", "דיברה"], heart: ["s7", "קל"] }],
      clocks: [{ text: "20 דקות", hex: GREEN, at: ["s7", "עשרים"], until: ["s7", "קל"], x: 0, y: 2.45 }] },
    { from: "s8", kind: "map", see: ["s8", 0], tap: ["s8", 0.4], go: ["s8", 0.6] },
  ],
});
