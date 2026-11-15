// SCRIPT.txt -> ElevenLabs Hebrew VO per scene (vo_he.mjs settings) + forced alignment -> assets/words.json
import fs from "node:fs"; import os from "node:os"; import { execSync } from "node:child_process";
const env = JSON.parse(fs.readFileSync(os.homedir() + "/.claude.json", "utf8")).mcpServers["apex-video"].env;
const SAY = JSON.parse(fs.readFileSync("SAY.json", "utf8"));
const lines = fs.readFileSync("SCRIPT.txt", "utf8").trim().split("\n").map((l) => l.split("|"));
const out = {};
const tailDb = (f) => +execSync(`ffmpeg -sseof -0.08 -i ${f} -af volumedetect -f null - 2>&1`).toString().match(/mean_volume: (-?[\d.]+)/)[1];
for (const [id, cap] of lines) {
  let say = cap.replace(/^ב-/, "ב");
  for (const [k, v] of Object.entries(SAY)) say = /^\d/.test(k) ? say.replace(k, v) : say.replace(new RegExp(`(?<![א-ת])${k}(?![א-ת])`), v);
  const f = `assets/vo/${id}.mp3`;
  // v3 sometimes clips the last syllable: the trailing " ..." gives it room, and a take that still ends loud is redone
  for (let k = 0; k < 4 && (!fs.existsSync(f) || tailDb(f) > -40); k++) {
    const r = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/wLxnZDWJFDdnAjp7Nsvx?output_format=mp3_44100_128`, { method: "POST",
      headers: { "xi-api-key": env.ELEVENLABS_API_KEY, "Content-Type": "application/json" },
      body: JSON.stringify({ text: ({ h1: "[curious] ", h2: "[mischievously] " }[id] ?? "") + say + " ...", model_id: "eleven_v3", voice_settings: { stability: 0.5, similarity_boost: 0.8, style: 0.6, use_speaker_boost: true } }) });
    if (!r.ok) throw new Error(id + " tts " + r.status + (await r.text()).slice(0, 200));
    fs.writeFileSync(f + ".raw.mp3", Buffer.from(await r.arrayBuffer()));
    execSync(`ffmpeg -y -v error -i ${f}.raw.mp3 -filter:a atempo=1.15 ${f} && rm ${f}.raw.mp3`); // Ben wants a faster pace than the voice delivers
  }
  const form = new FormData();
  form.append("file", new Blob([fs.readFileSync(f)], { type: "audio/mpeg" }), id + ".mp3");
  form.append("text", say);
  const a = await fetch("https://api.elevenlabs.io/v1/forced-alignment", { method: "POST", headers: { "xi-api-key": env.ELEVENLABS_API_KEY }, body: form });
  if (!a.ok) throw new Error(id + " align " + a.status);
  let words = (await a.json()).words.filter((w) => w.text.trim()).map((w) => ({ text: w.text.trim(), start: w.start, end: w.end }));
  // fold spoken numbers back to digits for the captions
  for (const [k, v] of Object.entries(SAY)) {
    const n = v.split(" ").length, i = words.findIndex((_, j) => words.slice(j, j + n).map((w) => w.text.replace(/[.,]/g, "")).join(" ").replace(/^ב(?=אל[ףפ])/, "") === v);
    if (i >= 0) words.splice(i, n, { text: (words[i].text.startsWith("באל") ? "ב-" : "") + k + (words[i + n - 1].text.match(/[.,]$/)?.[0] ?? ""), start: words[i].start, end: words[i + n - 1].end });
  }
  if (tailDb(f) > -40) console.log("WARN tail still loud", id);
  const dur = +execSync(`ffprobe -v error -show_entries format=duration -of csv=p=0 ${f}`).toString();
  out[id] = { dur, words };
}
fs.writeFileSync("assets/words.json", JSON.stringify(Object.fromEntries(lines.map(([id]) => [id, out[id]]))));
for (const [id] of lines) console.log(id, out[id].dur.toFixed(2), out[id].words.map((w) => w.text).join(" "));
