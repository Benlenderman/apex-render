import { reel, RED, GREEN, VIOLET, WHITE } from "./yd.js";
reel({
  id: "yd-names",
  title: "אף פעם אל תשכחו שם",
  caps: [
    ["s2", "נעלם", ["השם נעלם"], RED, { boom: 0.3 }],
    ["s3", "מתביישים", ["מביך לשאול שוב"], RED],
    ["s4", "בקול", ["אומרים אותו בקול"], GREEN, { boom: 0.35 }],
    ["s5", "פעם", ["עוד פעם בשיחה"], VIOLET],
    ["s6", "היה", ["ובפרידה"], GREEN],
  ],
  end: ["שומעים שם?", "אומרים אותו מיד."],
  endBoom: ["s7", "מיד", 0.5],
  scenes: [
    { from: "s1", kind: "phone", tint: ["s2", "נעלם"], items: [
      { type: "bubble", text: "היי, אני דנה", side: -1, y: 1.2, w: 1.6, at: ["s1", 0.3] },
      { type: "row", text: "דנה", y: 0.1, k: 3.0, w: 1.4, at: ["s2", "השם"], off: ["s2", "נעלם"] },
      { type: "row", text: "?", hex: RED, y: 0.1, k: 3.2, w: 1.85, at: ["s2", "נעלם"], blink: true },
      { type: "bubble", text: "סליחה, מה השם?", hex: RED, side: 1, y: -0.5, w: 1.85, at: ["s3", "לשאול"] },
      { type: "strike", at: ["s3", "שוב"], y: -0.5, s: 1.2 },
    ] },
    { from: "s4", kind: "phone", items: [
      { type: "bubble", text: "היי, אני דנה", side: -1, y: 1.4, w: 1.6, at: ["s4", 0.1] },
      { type: "bubble", text: "נעים מאוד, דנה", hex: GREEN, side: 1, y: 0.6, w: 1.85, at: ["s4", "נעים"] },
      { type: "bubble", text: "דנה, ואת מאיפה?", hex: GREEN, side: 1, y: -0.2, w: 1.85, at: ["s5", "פעם"] },
      { type: "bubble", text: "היה כיף, דנה", hex: GREEN, side: 1, y: -1.0, w: 1.85, at: ["s6", "היה"] },
      { type: "row", text: "דנה", hex: GREEN, y: -1.7, k: 1.8, w: 1.0, at: ["s6", "נתראה"], ic: "v" },
    ] },
    { from: "s7", kind: "map", see: ["s7", 0], tap: ["s7", 0.4], go: ["s7", 0.6] },
  ],
});
