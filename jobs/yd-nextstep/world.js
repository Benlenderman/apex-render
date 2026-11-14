import { reel, RED, GREEN, VIOLET, WHITE } from "./yd.js";
reel({
  id: "yd-nextstep",
  title: "אף פעם אל תיפרדו בלי צעד הבא",
  caps: [
    ["s2", "מדבר", ["אף אחד לא מדבר"], RED, { boom: 0.3 }],
    ["s3", "מביך", ["שבוע אחרי: מביך"], RED, { boom: 0.4 }],
    ["s4", "מספרים", ["מחליפים מספרים"], GREEN, { boom: 0.35 }],
    ["s5", "ריצה", ["הצעה אחת"], VIOLET],
    ["s6", "יום", ["הודעה באותו יום"], GREEN, { boom: 0.3 }],
  ],
  end: ["מספר. הצעה.", "הודעה באותו יום."],
  endBoom: ["s7", "יום", 0.5],
  scenes: [
    { from: "s1", kind: "map", see: ["s1", 0.2], tap: ["s1", 1.2], go: ["s1", "תיפרדו"] },
    { from: "s2", kind: "phone", tint: ["s2", "מדבר"], items: [
      { type: "bubble", text: "היה כיף, נדבר!", side: -1, y: 1.55, w: 1.7, at: ["s2", 0.1] },
      { type: "bubble", text: "בטח, נדבר", side: 1, y: 0.9, w: 1.4, at: ["s2", 0.8] },
      { type: "row", text: "0 הודעות", hex: RED, y: 0.25, w: 1.4, at: ["s2", "מדבר"], ic: "x" },
      { type: "bubble", text: "היי... זוכר אותי?", hex: RED, side: -1, y: -0.3, w: 1.8, at: ["s3", "כבר"] },
      { type: "strike", at: ["s3", "מביך"], y: -0.3, s: 0.8 },
    ] },
    { from: "s4", kind: "phone", items: [
      { type: "row", text: "איש קשר חדש", hex: VIOLET, y: 1.6, k: 1.6, w: 1.4, at: ["s4", 0.1] },
      { type: "row", text: "נועה", y: 0.9, k: 2.4, w: 1.2, at: ["s4", 0.4], ic: "v" },
      { type: "bubble", text: "ריצה בשישי בבוקר?", hex: GREEN, side: 1, y: 0.2, w: 1.9, at: ["s5", "ריצה"] },
      { type: "bubble", text: "יאללה!", side: -1, y: -0.45, w: 1.2, at: ["s5", "בבוקר"] },
    ] },
    { from: "s6", kind: "phone", items: [
      { type: "row", text: "היום, 21:30", hex: VIOLET, y: 1.6, k: 1.6, w: 1.4, at: ["s6", 0.05] },
      { type: "bubble", text: "היה ממש כיף היום!", hex: GREEN, side: 1, y: 0.9, w: 1.9, at: ["s6", "הודעה"] },
      { type: "bubble", text: "גם לי! נתראה בשישי", side: -1, y: 0.1, w: 1.9, at: ["s6", "חם"] },
    ] },
    { from: "s7", kind: "map", see: ["s7", 0], tap: ["s7", 0.4], go: ["s7", 0.6] },
  ],
});
