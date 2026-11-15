import { reel, RED, GREEN, VIOLET, WHITE } from "./yd.js";
const far = (BX, d) => [[0, [BX, 2.7, 9.8, BX, 1.6, -0.4, 50]], [d + 0.4, [BX, 2.55, 9.0, BX, 1.6, -0.4, 50]]];
const group = (at, t0, t1, ex = {}) => [
  { x: -1.4, z: -1.6, gap: 0.55, noTab: true, at, her2: "m", talk: [["him", t0, t1], ["her", t0, t1]], ...ex },
  { x: 1.4, z: -1.6, gap: 0.55, noTab: true, at, talk: [["her", t0, t1]], ...ex },
];
reel({
  id: "yd-200hours",
  title: "כמה שעות לוקח להפוך זר לחבר?",
  dim: 0.35,
  caps: [
    ["s1", "דיבר", ["אף אחד לא דיבר"], RED, { boom: 0.3 }],
    ["s2", "קנזס", ["מחקר: קנזס, 2018"], VIOLET],
    ["s4", "אחת", ["שעה אחת"], RED, { boom: 0.4 }],
    ["s5", "שבת", ["כל שבת"], GREEN],
    ["s6", "בשם", ["קראו לו בשם"], GREEN, { boom: 0.3, until: ["s6", "בחודש"] }],
  ],
  end: ["חברות זה לא קליק.", "זה שעות."],
  scenes: [
    // s1: Danny alone, then a running group that talks among itself; he leaves
    { from: "s1", kind: "bar", noBar: true, floor: GREEN, cam: far,
      pairs: [...group(["s1", "הצטרף"], ["s1", "ריצה"], ["s2", 0]),
        { x: 0.3, z: 0.9, gap: 0.01, solo: true, noTab: true, him: [[["s1", "דיבר"], RED]], slump: ["s1", "דיבר"], leave: ["s1", "חזר"] }],
      tags: [{ text: "דני, חיפה", at: ["s1", 0.1], off: ["s1", "הצטרף"], x: 0.3, y: 2.6, z: 0.9, w: 1.4 },
             { text: "קבוצת ריצה", hex: GREEN, at: ["s1", "ריצה"], y: 3.6, z: -1.6, w: 1.8 }] },
    // s2-s3: two strangers at a cafe table become friends, the hours tick up
    { from: "s2", kind: "bar", cam: far,
      pairs: [{ gap: 0.6, her2: "m", talk: [["him", ["s2", "בדק"], ["s2", "זר"]], ["her", ["s3", 0], ["s3", "רחוקים"]], ["him", ["s3", "תשעים"], ["s3", "ויותר"]], ["her", ["s3", "ממאתיים"], ["s4", 0]]],
        him: [[["s3", "ממאתיים"], GREEN]], her: [[["s3", "ממאתיים"], GREEN]], happy: ["s3", "קרוב"] }],
      tags: [{ text: "זר", hex: RED, at: ["s2", "זר"], off: ["s3", "חמישים"], y: 3.3, w: 1.0 },
             { text: "חברים רחוקים", at: ["s3", "חמישים"], off: ["s3", "תשעים"], y: 3.3, w: 1.9 },
             { text: "חברים", hex: GREEN, at: ["s3", "כדי", 2], off: ["s3", "ויותר"], y: 3.3, w: 1.3 },
             { text: "חבר קרוב", hex: GREEN, at: ["s3", "ממאתיים"], y: 3.3, w: 1.6 }],
      clocks: [{ text: "50 שעות", hex: VIOLET, at: ["s3", "חמישים"], until: ["s3", "תשעים"], x: 0, y: 2.45 },
               { text: "90 שעות", hex: VIOLET, at: ["s3", "כדי", 2], until: ["s3", "ויותר"], x: 0, y: 2.45 },
               { text: "200+ שעות", hex: GREEN, at: ["s3", "ממאתיים"], x: 0, y: 2.45 }] },
    // s4: close friends (200h) next to Danny alone (1h)
    { from: "s4", kind: "bar", noBar: true, floor: GREEN, cam: far,
      pairs: [{ x: -1.55, gap: 0.5, noTab: true, her2: "m", him: [[["s4", 0], GREEN]], her: [[["s4", 0], GREEN]], talk: [["him", ["s4", 0], ["s5", 0]]], happy: ["s4", 0.05] },
              { x: 1.55, gap: 0.01, solo: true, noTab: true, him: [[["s4", 0], RED]], slump: ["s4", "אחת"] }],
      tags: [{ text: "200 שעות", hex: GREEN, at: ["s4", 0.05], x: -1.55, y: 2.85, w: 1.3 },
             { text: "1 שעה", hex: RED, at: ["s4", "אחת"], x: 1.55, y: 2.85, w: 1.1 }] },
    // s5: he comes back to the same run
    { from: "s5", kind: "bar", noBar: true, floor: GREEN, cam: far,
      pairs: [...group(null, ["s5", 0], ["s6", 0]),
        { x: 0.3, z: 0.9, gap: 0.01, solo: true, noTab: true, come: ["s5", "חזר"] }],
      tags: [{ text: "אותה ריצה, אותה שעה", hex: GREEN, at: ["s5", "ריצה"], y: 3.6, z: -1.6, w: 2.4 }] },
    // s6a: week 3 at the run, someone greets him by name
    { from: "s6", kind: "bar", noBar: true, floor: GREEN, cam: far,
      pairs: [...group(null, ["s6", 0], ["s6", "בחודש"]),
        { x: 0, z: 0.9, gap: 0.6, noTab: true, her2: "m",
          says: [{ who: "her", text: "בוקר טוב, דני!", hex: GREEN, at: ["s6", "בשם"] }],
          him: [[["s6", "בשם"], GREEN]], happy: ["s6", "בשם"] }],
      tags: [{ text: "שבוע 3", hex: VIOLET, at: ["s6", 0.05], y: 3.6, z: -1.6, w: 1.2 }] },
    // s6b: month 3, coffee after the run
    { from: ["s6", "בחודש"], kind: "bar", cam: far,
      pairs: [{ gap: 0.6, her2: "m",
        says: [{ who: "her", text: "קפה אחרי הריצה?", hex: GREEN, at: ["s6", "קפה"], off: ["s7", 0] }],
        him: [[["s6", "בחודש"], GREEN]], her: [[["s6", "בחודש"], GREEN]], happy: ["s6", "קפה"], talk: [["him", ["s6", "בחודש"], ["s6", "קפה"]]] }],
      tags: [{ text: "חודש 3", hex: GREEN, at: ["s6", "בחודש"], y: 3.4, k: 2.6, w: 1.6 }] },
    // s7: a table of friends, 50 hours a year
    { from: "s7", kind: "bar", cam: far,
      pairs: [{ x: -1.3, gap: 0.55, her2: "m", him: [[["s7", 0], GREEN]], talk: [["him", ["s7", 0], ["s7", "חברות"]]], happy: ["s7", 0.1] },
              { x: 1.3, gap: 0.55, her: [[["s7", 0], GREEN]], talk: [["her", ["s7", 0.4], ["s7", "קליק"]]], happy: ["s7", 0.1] }],
      clocks: [{ text: "50 שעות בשנה", hex: GREEN, at: ["s7", "חמישים"], until: ["s7", "חברות"], x: 0, y: 2.6 }] },
  ],
});
