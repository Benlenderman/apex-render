import { reel, RED, GREEN, VIOLET, WHITE } from "./yd.js";
reel({
  id: "yd-followup",
  title: "אף פעם אל תענו בסיפור משלכם",
  caps: [
    ["s2", "שני", ["אין דייט שני"], RED, { boom: 0.35 }],
    ["s4", "אהבו", ["שואלים יותר = אוהבים יותר"], GREEN, { boom: 0.3 }],
  ],
  end: ["\"איתך קל לדבר.\"", "והוא כמעט לא דיבר."],
  endBoom: ["s7", "קל", 0.4],
  scenes: [
    { from: "s1", kind: "phone", tint: ["s2", "שני"], items: [
      { type: "row", text: "דייט ראשון", hex: WHITE, y: 1.6, k: 1.8, w: 1.4, at: ["s1", 0.05] },
      { type: "bubble", text: "חזרתי עכשיו מהודו", side: -1, y: 0.95, w: 1.9, at: ["s1", "סיפרה"] },
      { type: "bubble", text: "גם אני הייתי בהודו!", hex: RED, side: 1, y: 0.3, w: 1.95, at: ["s2", "גם"] },
      { type: "row", text: "10 דקות על עצמו", hex: RED, y: -0.4, w: 1.7, at: ["s2", "עשר"], ic: "x" },
    ] },
    { from: "s3", kind: "phone", items: [
      { type: "row", text: "ניסוי", hex: WHITE, y: 1.6, k: 2.0, w: 1.0, at: ["s3", 0.2] },
      { type: "row", text: "הארוורד, 2017", hex: VIOLET, y: 0.9, k: 2.0, w: 1.7, at: ["s3", "חוקרים"] },
      { type: "row", text: "מאות שיחות", y: 0.15, k: 1.8, w: 1.6, at: ["s3", "מאות"] },
      { type: "row", text: "ספיד דייטינג", hex: GREEN, y: -0.6, w: 1.6, at: ["s3", "חלקן"] },
    ] },
    { from: "s4", kind: "phone", items: [
      { type: "bar", text: "שאל מעט", hex: RED, y: 1.2, frac: 0.35, at: ["s4", 0.05], fill: ["s4", "שאלות"] },
      { type: "bar", text: "שאל הרבה", q: "שאל הרבה: ?", hex: GREEN, y: 0.3, frac: 0.9, at: ["s4", "שאלות"], fill: ["s4", "יותר"] },
      { type: "row", text: "יותר דייטים שניים", hex: GREEN, y: -0.55, w: 1.8, at: ["s4", "קיבל"], ic: "v" },
    ] },
    { from: "s5", kind: "phone", items: [
      { type: "row", text: "השאלות שעבדו", hex: WHITE, y: 1.6, k: 1.8, w: 1.6, at: ["s5", 0.05] },
      { type: "row", text: "שאלת המשך", hex: GREEN, y: 1.3 - 0.2, k: 2.2, w: 1.8, at: ["s5", "המשך"], ic: "v" },
      { type: "bubble", text: "היה לי יום קשה", side: -1, y: 0.35, w: 1.7, at: ["s5", "שאלה"] },
      { type: "bubble", text: "מה קרה?", hex: GREEN, side: 1, y: -0.3, w: 1.3, at: ["s5", "השני"] },
    ] },
    { from: "s6", kind: "phone", items: [
      { type: "row", text: "ניסיון שני", hex: WHITE, y: 1.6, k: 1.8, w: 1.4, at: ["s6", 0.05] },
      { type: "bubble", text: "חזרתי עכשיו מהודו", side: -1, y: 0.95, w: 1.9, at: ["s6", "סיפרה"] },
      { type: "bubble", text: "מה גרם לך לנסוע לבד?", hex: GREEN, side: 1, y: 0.3, w: 1.95, at: ["s6", "גרם"] },
    ] },
    { from: "s7", kind: "phone", items: [
      { type: "row", text: "היא: 20 דקות", hex: GREEN, y: 0.2, k: 1.8, w: 1.7, at: ["s7", "עשרים"], ic: "v" },
    ] },
    { from: "s8", kind: "map", see: ["s8", 0], tap: ["s8", 0.4], go: ["s8", 0.6] },
  ],
});
