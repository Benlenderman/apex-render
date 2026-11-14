import { reel, RED, GREEN, VIOLET, WHITE } from "./yd.js";
reel({
  id: "yd-safety",
  title: "אף פעם אל תיפגשו בלי שמישהו יודע",
  caps: [
    ["s2", "יודע", ["אף אחד לא יודע"], RED, { boom: 0.3 }],
    ["s3", "לבד", ["אתם לבד"], RED, { boom: 0.4 }],
    ["s4", "לחבר", ["שלחו לחבר"], GREEN, { boom: 0.35 }],
    ["s5", "ציבורי", ["מקום ציבורי"], VIOLET],
    ["s6", "קמים", ["קמים והולכים"], GREEN, { boom: 0.3 }],
  ],
  end: ["מישהו יודע.", "מקום ציבורי. דרך משלכם."],
  endBoom: ["s7", "משלכם", 0.5],
  scenes: [
    { from: "s1", kind: "phone", tint: ["s2", 0], items: [
      { type: "bubble", text: "נפגשים ב-8?", side: -1, y: 1.4, w: 1.6, at: ["s1", 0.3] },
      { type: "bubble", text: "סגור", side: 1, y: 0.7, w: 1.0, at: ["s1", 1.0] },
      { type: "row", text: "חברים: לא יודעים", hex: RED, y: -0.1, w: 1.5, at: ["s2", "יודע"], ic: "x" },
      { type: "row", text: "איפה: ?", hex: RED, y: -0.6, w: 1.2, at: ["s2", "איפה"], ic: "x" },
      { type: "row", text: "עם מי: ?", hex: RED, y: -1.1, w: 1.2, at: ["s2", "מי"], ic: "x" },
    ] },
    { from: "s3", kind: "map", mode: "alone" },
    { from: "s4", kind: "phone", items: [
      { type: "row", text: "לחבר", hex: VIOLET, y: 1.6, k: 1.6, w: 1.0, at: ["s4", 0.1] },
      { type: "bubble", text: "עם: נועה", hex: GREEN, side: 1, y: 0.9, w: 1.6, at: ["s4", "מי"] },
      { type: "bubble", text: "איפה: קפה בכיכר", hex: GREEN, side: 1, y: 0.2, w: 1.8, at: ["s4", "איפה"] },
      { type: "bubble", text: "מתי: 20:00", hex: GREEN, side: 1, y: -0.5, w: 1.6, at: ["s4", "ומתי"] },
      { type: "bubble", text: "קיבלתי", side: -1, y: -1.2, w: 1.2, at: ["s4", 2.9] },
    ] },
    { from: "s5", kind: "map", see: ["s5", "ציבורי"], tap: ["s5", "ותגיעו"], go: ["s5", "בדרך"] },
    { from: "s6", kind: "phone", items: [
      { type: "row", text: "מרגיש לא נכון?", hex: RED, y: 1.0, k: 1.6, w: 1.7, at: ["s6", 0.05] },
      { type: "button", text: "הולכים", y: 0.1, at: ["s6", "נכון"], press: ["s6", "קמים"] },
      { type: "row", text: "לא צריך תירוץ", hex: GREEN, y: -0.8, w: 1.6, at: ["s6", "צריך"], ic: "v" },
    ] },
    { from: "s7", kind: "map", see: ["s7", 0], tap: ["s7", 0.4], go: ["s7", 0.6] },
  ],
});
