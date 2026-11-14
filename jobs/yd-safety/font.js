const f = new FontFace("Heebo", "url(assets/heebo.ttf)", { weight: "100 900" });
document.fonts.add(f);
await f.load();
