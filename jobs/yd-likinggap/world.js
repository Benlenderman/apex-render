import { reel, RED, GREEN, VIOLET, WHITE } from "./yd.js";
reel({
  id: "yd-likinggap",
  title: "אף פעם אל תניחו שהשתעממו מכם",
  caps: [
    ["s1", "צחקו", ["צחקו כל הזמן"], GREEN],
    ["s2", "שעממתי", ["בטח שעממתי אותה"], RED, { boom: 0.3 }],
    ["s3", "ייל", ["מחקר: ייל, 2018"], VIOLET],
    ["s4", "יותר", ["אהבו אותם יותר"], GREEN, { boom: 0.35 }],
    ["s6", "כתבה", ["אף אחת לא כתבה"], RED, { boom: 0.4 }],
  ],
  end: ["אהבו אתכם יותר ממה שחשבתם.", "תשלחו את ההודעה."],
  endBoom: ["s7", "תשלחו", 0.3],
  scenes: [
    { from: "s1", kind: "map", n: 2, tag: "חתונה", tagAt: ["s1", 0.1], see: ["s1", 0.3], tap: ["s1", "בחתונה"], go: ["s1", "עשרים"] },
    { from: "s2", kind: "phone", tint: ["s2", "שעממתי"], items: [
      { type: "row", text: "בדרך הביתה", hex: VIOLET, y: 1.6, k: 1.6, w: 1.4, at: ["s2", 0.05] },
      { type: "bubble", text: "היה כיף להכיר!", hex: GREEN, side: 1, y: 0.9, w: 1.8, at: ["s2", "חשבה"] },
      { type: "row", text: "בטח שעממתי אותה", hex: RED, y: 0.1, w: 1.7, at: ["s2", "שעממתי"], ic: "x" },
      { type: "strike", at: ["s2", "שלחה"], y: 0.9, s: 1.0 },
    ] },
    { from: "s3", kind: "phone", items: [
      { type: "row", text: "ניסוי", hex: VIOLET, y: 1.6, k: 1.6, w: 1.0, at: ["s3", 0.2] },
      { type: "bubble", text: "היי, נעים מאוד", side: -1, y: 0.95, w: 1.7, at: ["s3", "זרים"] },
      { type: "bubble", text: "נעים מאוד!", side: 1, y: 0.3, w: 1.4, at: ["s3", "לשיחה"] },
      { type: "row", text: "כמה הוא אהב אותך?", hex: VIOLET, y: -0.45, k: 1.4, w: 1.8, at: ["s3", "כמה"] },
    ] },
    { from: "s4", kind: "phone", items: [
      { type: "bar", text: "מה שחשבו", hex: RED, y: 1.2, frac: 0.4, at: ["s4", 0.05], fill: ["s4", "טעו"] },
      { type: "bar", text: "כמה אהבו אותם", q: "כמה אהבו אותם: ?", hex: GREEN, y: 0.3, frac: 0.9, at: ["s4", "הצד"], fill: ["s4", "יותר"] },
    ] },
    { from: "s5", kind: "phone", items: [
      { type: "row", text: "פער החיבה", hex: VIOLET, y: 1.2, k: 2.2, w: 1.8, at: ["s5", "פער"] },
      { type: "row", text: "גם אחרי חודשים", hex: GREEN, y: 0.2, w: 1.6, at: ["s5", "חודשים"], ic: "v" },
    ] },
    { from: "s6", kind: "phone", tint: ["s6", "חיכו"], items: [
      { type: "row", text: "באותו לילה", hex: VIOLET, y: 1.6, k: 1.6, w: 1.4, at: ["s6", 0.05] },
      { type: "bubble", text: "מאיה: בטח שעממתי אותה", hex: RED, side: 1, y: 0.95, w: 1.95, at: ["s6", "לילה"] },
      { type: "bubble", text: "היא: בטח שעממתי אותה", hex: RED, side: -1, y: 0.25, w: 1.95, at: ["s6", "דבר"] },
      { type: "row", text: "0 הודעות", hex: RED, y: -0.5, w: 1.4, at: ["s6", "כתבה"], ic: "x" },
    ] },
    { from: "s7", kind: "map", see: ["s7", 0], tap: ["s7", 0.4], go: ["s7", 0.6] },
  ],
});
