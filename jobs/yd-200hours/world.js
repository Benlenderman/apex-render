import { reel, RED, GREEN, VIOLET, WHITE } from "./yd.js";
reel({
  id: "yd-200hours",
  title: "כמה שעות לוקח להפוך זר לחבר?",
  caps: [
    ["s1", "דיבר", ["אף אחד לא דיבר"], RED, { boom: 0.3 }],
    ["s2", "קנזס", ["מחקר: קנזס, 2018"], VIOLET],
    ["s4", "אחת", ["שעה אחת"], RED, { boom: 0.4 }],
    ["s5", "שבת", ["כל שבת"], GREEN],
    ["s6", "בשם", ["קראו לו בשם"], GREEN, { boom: 0.3 }],
  ],
  end: ["חברות זה לא קליק.", "זה שעות."],
  endBoom: ["s7", "קליק", 0.3],
  scenes: [
    { from: "s1", kind: "map", mode: "alone", ball: false, leave: ["s1", "חזר"] },
    { from: "s2", kind: "phone", items: [
      { type: "row", text: "קנזס, 2018", hex: VIOLET, y: 1.75, k: 1.6, w: 1.4, at: ["s2", 0.2] },
      { type: "bar", text: "מכרים: 50 שעות", hex: GREEN, y: 1.15, frac: 0.25, at: ["s3", "חמישים"] },
      { type: "bar", text: "חברים: 90 שעות", hex: GREEN, y: 0.45, frac: 0.45, at: ["s3", "תשעים"] },
      { type: "bar", text: "חבר קרוב: 200+ שעות", hex: VIOLET, y: -0.25, frac: 1, at: ["s3", "ממאתיים"] },
    ] },
    { from: "s4", kind: "phone", tint: ["s4", "אחת"], items: [
      { type: "bar", text: "חבר קרוב: 200 שעות", hex: VIOLET, y: 1.2, frac: 1, at: ["s4", 0.05], fill: ["s4", 0.05] },
      { type: "bar", text: "דני: שעה אחת", hex: RED, y: 0.3, frac: 0.02, at: ["s4", "אחת"] },
    ] },
    { from: "s5", kind: "map", see: ["s5", 0.2], tap: ["s5", "שבת"], go: ["s5", "ריצה"] },
    { from: "s6", kind: "phone", items: [
      { type: "row", text: "שבוע 3", hex: VIOLET, y: 1.6, k: 1.6, w: 1.2, at: ["s6", 0.05] },
      { type: "bubble", text: "בוקר טוב, דני!", hex: GREEN, side: -1, y: 1.0, w: 1.8, at: ["s6", "בשם"] },
      { type: "row", text: "חודש 3", hex: VIOLET, y: 0.35, k: 1.6, w: 1.2, at: ["s6", "בחודש"] },
      { type: "bubble", text: "קפה אחרי הריצה?", hex: GREEN, side: 1, y: -0.25, w: 1.8, at: ["s6", "קפה"] },
    ] },
    { from: "s7", kind: "map", see: ["s7", 0], tap: ["s7", 0.4], go: ["s7", 0.6] },
  ],
});
