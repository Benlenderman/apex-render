import { reel, RED, GREEN, VIOLET, WHITE } from "./yd.js";
const far = (BX, d) => [[0, [BX, 2.7, 9.8, BX, 1.6, -0.4, 50]], [d + 0.4, [BX, 2.55, 9.0, BX, 1.6, -0.4, 50]]];
const lab = [];
[[-1.45, 0.4], [1.45, 0.4], [-1.45, -2.0], [1.45, -2.0]].forEach(([x, z], i) =>
  lab.push({ x, z, gap: 0.6, her2: i === 1 ? "m" : "f", him2: i === 2 ? "f" : "m", at: ["s3", 3.6 + i * 0.2], talk: [["him", ["s3", "לשיחה"], ["s3", "שאלו"]], ["her", ["s3", "לשיחה"], ["s3", "ואז"]]],
    qs: { who: i % 2 ? "her" : "him", at: ["s3", "שאלו"], until: ["s4", 0], every: 1.1 } }));
reel({
  id: "yd-likinggap",
  title: "אף פעם אל תניחו שהשתעממו מכם",
  dim: 0.35,
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
    // s1: Maya and a woman at a wedding, laughing for 20 minutes
    { from: "s1", kind: "bar", floor: 0xffb347, cam: far,
      pairs: [{ gap: 0.6, him2: "f", talk: [["him", ["s1", "דיברה"], ["s1", "צחקו"]], ["her", ["s1", "בחתונה"], ["s1", "צחקו"]]],
        says: [{ who: "her", text: "חחח באמת?!", hex: GREEN, at: ["s1", "צחקו"], off: ["s2", 0] }], happy: ["s1", "צחקו"] }],
      tags: [{ text: "חתונה", hex: VIOLET, at: ["s1", 0.1], off: ["s1", "עשרים"], y: 3.4, w: 1.2 }],
      clocks: [{ text: "20 דקות", hex: GREEN, at: ["s1", "עשרים"], x: 0, y: 3.5 }] },
    // s2: Maya alone on the way home, sure she was boring, sends nothing
    { from: "s2", kind: "bar", noBar: true, cam: far,
      pairs: [{ gap: 0.01, solo: true, noTab: true, him2: "f", him: [[["s2", "שעממתי"], RED]], slump: ["s2", "שעממתי"] }],
      tags: [{ text: "בדרך הביתה", hex: VIOLET, at: ["s2", 0.05], y: 3.4, w: 1.6 },
             { text: "0 הודעות", hex: RED, at: ["s2", "שלחה"], y: 2.7, w: 1.3 }] },
    // s3: Yale lab, strangers paired to talk, then asked
    { from: "s3", kind: "bar", pairs: lab,
      tags: [{ text: "זרים", at: ["s3", "זרים"], off: ["s3", "כמה"], y: 3.6, z: -1, w: 1.0 },
             { text: "כמה הוא אהב אותך?", hex: VIOLET, at: ["s3", "כמה"], y: 3.6, z: -1, w: 2.4 }],
      cam: (BX, d) => [[0, [BX, 5.6, 8.6, BX, 1.4, -1.1, 50]], [d + 0.4, [BX, 5.0, 7.6, BX, 1.4, -1.1, 50]]] },
    // s4: what they thought vs how much the other side liked them
    { from: "s4", kind: "bar", cam: far,
      pairs: [{ gap: 0.6, her2: "m",
        says: [{ who: "him", text: "בטח השתעמם ממני", hex: RED, at: ["s4", "כולם"], off: ["s4", "כיוון"] },
               { who: "her", text: "היה ממש כיף!", hex: GREEN, at: ["s4", "הצד"], off: ["s5", 0] }],
        him: [[["s4", "כולם"], RED]], her: [[["s4", "הצד"], GREEN]], happy: ["s4", "אהב"], heart: ["s4", "יותר"] }],
      tags: [{ text: "מה שחשבו", hex: RED, at: ["s4", "טעו"], off: ["s4", "כיוון"], y: 3.4, w: 1.4 },
             { text: "מה שהיה באמת", hex: GREEN, at: ["s4", "הצד"], y: 3.4, w: 1.8 }] },
    // s5: the liking gap, even between friends of months
    { from: "s5", kind: "bar", cam: far,
      pairs: [{ gap: 0.6, her2: "m", talk: [["her", ["s5", 0.2], ["s5", "פער"]], ["him", ["s5", "נשאר"], ["s6", 0]]], qs: { who: "him", at: ["s5", "פער"], until: ["s5", "נשאר"], every: 0.9, hex: RED } }],
      tags: [{ text: "פער החיבה", hex: VIOLET, at: ["s5", "פער"], y: 3.6, k: 2.4, w: 2.0 },
             { text: "גם בין חברים", hex: GREEN, at: ["s5", "חודשים"], y: 3.0, w: 1.7 }] },
    // s6: both alone that night, both waiting
    { from: "s6", kind: "bar", noBar: true, cam: far,
      pairs: [{ x: -1.1, gap: 0.01, solo: true, noTab: true, him2: "f", him: [[["s6", "לילה"], RED]], slump: ["s6", "חיכו"],
                says: [{ who: "him", text: "שעממתי אותה", hex: RED, w: 1.3, y: 2.45, at: ["s6", "לילה"] }] },
              { x: 1.1, gap: 0.01, solo: true, noTab: true, him2: "f", him: [[["s6", "השנייה"], RED]], slump: ["s6", "חיכו"],
                says: [{ who: "him", text: "שעממתי אותה", hex: RED, w: 1.3, y: 3.05, at: ["s6", "חשבה"] }] }],
      tags: [{ text: "באותו לילה", hex: VIOLET, at: ["s6", 0.05], y: 3.9, w: 1.6 }] },
    // s7: the message gets sent, they meet again
    { from: "s7", kind: "bar", floor: GREEN, cam: far,
      pairs: [{ gap: 0.6, him2: "f", him: [[["s7", 0], GREEN]], her: [[["s7", 0], GREEN]], happy: ["s7", 0.2], heart: ["s7", "תשלחו"],
        talk: [["him", ["s7", 0], ["s7", "תשלחו"]], ["her", ["s7", "יותר"], ["s8", 0]]] }] },
    { from: "s8", kind: "map", see: ["s8", 0], tap: ["s8", 0.4], go: ["s8", 0.6] },
  ],
});
