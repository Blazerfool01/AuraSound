import fs from "node:fs";
fs.mkdirSync("public/audio", { recursive: true });
fs.mkdirSync("public/art", { recursive: true });
const palettes = [
  ["#263c4c", "#97c5ba", "#d3b38c"],
  ["#5d323b", "#f4ab80", "#e85b43"],
  ["#443252", "#b39ccc", "#b5bdbb"],
  ["#1f4541", "#79b3a7", "#e5d3a3"],
  ["#553d2d", "#dfa575", "#e6c89e"],
  ["#27334b", "#7e9ab6", "#c4cfd4"],
];
for (let a = 0; a < 6; a++) {
  const [bg, fg, accent] = palettes[a];
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="640" height="640" viewBox="0 0 640 640"><defs><linearGradient id="g" x2="0.7" y2="1"><stop stop-color="${fg}"/><stop offset="1" stop-color="${bg}"/></linearGradient><filter id="noise"><feTurbulence type="fractalNoise" baseFrequency=".65" numOctaves="3" stitchTiles="stitch"/><feColorMatrix type="saturate" values="0"/><feComponentTransfer><feFuncA type="linear" slope=".13"/></feComponentTransfer><feBlend in="SourceGraphic" mode="soft-light"/></filter><radialGradient id="sun"><stop stop-color="${accent}"/><stop offset="1" stop-color="${accent}" stop-opacity=".05"/></radialGradient></defs><g filter="url(#noise)"><path fill="url(#g)" d="M0 0h640v640H0z"/><circle cx="${220 + a * 31}" cy="${210 + a * 10}" r="${135 - a * 4}" fill="url(#sun)"/><circle cx="${220 + a * 31}" cy="${210 + a * 10}" r="${71 + a * 5}" fill="${accent}" opacity=".85"/>${Array.from({ length: 8 }, (_, i) => `<path d="M-60 ${350 + i * 35} Q ${140 + a * 20} ${200 + i * 32} 350 ${340 + i * 30} T740 ${310 + i * 30}V700H-60Z" fill="${bg}" opacity="${0.14 + i * 0.09}"/>`).join("")}<path d="M0 590H640" stroke="${fg}" stroke-opacity=".35"/><text x="36" y="54" fill="#ffffffbb" font-family="Arial" font-size="12" letter-spacing="6">UNDERTONE RECORDINGS</text><text x="36" y="615" fill="#ffffffaa" font-family="Arial" font-size="12" letter-spacing="4">VOL. 0${a + 1} / ORIGINAL SESSIONS</text></g></svg>`;
  fs.writeFileSync(`public/art/a${a + 1}.svg`, svg);
}
// Original deterministic arrangements; no sampled audio, third-party melody or assets.
const rate = 22050,
  scale = [0, 2, 3, 7, 10, 12, 14, 15];
for (let j = 0; j < 12; j++) {
  const bpm = 78 + j * 3,
    beat = 60 / bpm,
    duration = 32 * beat,
    n = Math.ceil(duration * rate),
    data = Buffer.alloc(n * 2);
  let seed = 123 + j;
  const rand = () => {
    seed = (seed * 1664525 + 1013904223) >>> 0;
    return (seed / 4294967296) * 2 - 1;
  };
  const root = 45 + (j % 6) * 2,
    chords = [0, 5, 3, 7];
  const hz = (m) => 440 * 2 ** ((m - 69) / 12);
  for (let i = 0; i < n; i++) {
    const t = i / rate,
      b = t / beat,
      bar = Math.floor(b / 4),
      p = b % 1,
      ch = chords[bar % 4];
    const bass = hz(root + ch - 12),
      pad =
        [0, 3, 7].reduce(
          (s, v) =>
            s +
            Math.sin(
              2 * Math.PI * hz(root + ch + v) * t + Math.sin(t * 0.6) * 0.18,
            ),
          0,
        ) * 0.045;
    const kick =
      Math.sin(2 * Math.PI * (45 * t + 3 * (1 - Math.exp(-p * beat * 35)))) *
      Math.exp(-p * 14) *
      0.18;
    const snare =
      Math.floor(b) % 4 === 2 ? rand() * Math.exp(-p * 26) * 0.075 : 0;
    const hat = rand() * Math.exp(-((b * 2) % 1) * 40) * 0.027;
    const step = Math.floor(b * 2),
      mel = hz(
        root +
          12 +
          scale[
            (step * ((j % 3) + 1) + Math.floor(step / 8) * 3) % scale.length
          ],
      );
    const lead =
      (Math.sin(2 * Math.PI * mel * t) +
        Math.sin(2 * Math.PI * mel * 2 * t) * 0.12) *
      Math.exp(-((b * 2) % 1) * 5) *
      0.068;
    const low =
      Math.sin(2 * Math.PI * bass * t) * (0.06 + 0.025 * Math.exp(-p * 4));
    const fade = Math.min(1, t / 1.2, (duration - t) / 2);
    const sample =
      Math.tanh((pad + low + lead + kick + snare + hat) * 1.2) * fade;
    data.writeInt16LE(Math.round(sample * 28000), i * 2);
  }
  const header = Buffer.alloc(44);
  header.write("RIFF");
  header.writeUInt32LE(36 + data.length, 4);
  header.write("WAVEfmt ", 8);
  header.writeUInt32LE(16, 16);
  header.writeUInt16LE(1, 20);
  header.writeUInt16LE(1, 22);
  header.writeUInt32LE(rate, 24);
  header.writeUInt32LE(rate * 2, 28);
  header.writeUInt16LE(2, 32);
  header.writeUInt16LE(16, 34);
  header.write("data", 36);
  header.writeUInt32LE(data.length, 40);
  fs.writeFileSync(`public/audio/t${j + 1}.wav`, Buffer.concat([header, data]));
}
console.log(
  "Generated 12 original PCM music tracks and 6 original SVG covers.",
);
