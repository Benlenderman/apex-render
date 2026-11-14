import { reel, RED, GREEN, VIOLET, WHITE, ORANGE } from "./yd.js";
reel({
  id: "yd-invite",
  title: "אף פעם אל תחכו להזמנה",
  caps: [
    ["s2", "ומרעננים", ["מרעננים..."], RED, { boom: 0.3 }],
    ["s3", "ערב", ["עוד ערב על הספה"], RED, { boom: 0.3 }],
    ["s4", "פותחים", ["פותחים בעצמכם"], VIOLET, { boom: 0.4 }],
    ["s5", "רואים", ["קרובים רואים"], VIOLET],
    ["s6", "כשהראשון", ["הראשון מצטרף"], GREEN, { boom: 0.35 }],
  ],
  end: ["לא מחכים.", "מזמינים."],
  endBoom: ["s7", "מזמינים", 0.5],
  scenes: [
    { from: "s1", kind: "house" },
    { from: "s2", kind: "phone", tint: ["s2", "ומרעננים"], items: [
      { type: "row", text: "אין הודעות חדשות", hex: RED, y: 0.2, at: ["s2", 0.1], k: 1.6, w: 1.7, blink: true },
      { type: "spin", at: ["s2", "ומרעננים"], until: ["s3", 0], y: 1.2 },
    ] },
    { from: "s3", kind: "house", sofa: true },
    { from: "s4", kind: "phone", items: [
      { type: "panel", y: -0.2, at: ["s4", 0.05] },
      { type: "row", text: "פעילות חדשה", hex: VIOLET, y: 0.85, at: ["s4", "פותחים"], k: 1.8, w: 1.5 },
      { type: "row", text: "מה: כדורסל", y: 0.25, at: ["s4", "כדורסל"], ic: "v" },
      { type: "row", text: "מתי: 20:00", y: -0.35, at: ["s4", "בשמונה"], ic: "v" },
    ] },
    { from: "s5", kind: "map", court: true, see: ["s5", "רואים"], tap: ["s6", "כשהראשון"], go: ["s7", 0] },
  ],
});
