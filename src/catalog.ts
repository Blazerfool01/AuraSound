export interface Track {
  id: string;
  title: string;
  artist: string;
  album: string;
  albumId: string;
  genre: string;
  duration: number;
  src: string;
  cover: string;
}
export interface Album {
  id: string;
  title: string;
  artist: string;
  description: string;
  genre: string;
  cover: string;
  tracks: string[];
}
const albumInfo = [
  [
    "Glass Horizons",
    "Low Season",
    "Small moments, wide open spaces. Warm electronic textures for a slower day.",
    "Electronic",
  ],
  [
    "After the Sun",
    "June Atlas",
    "Amber light, unhurried rhythms. A little warmth to take with you.",
    "Downtempo",
  ],
  [
    "Soft Focus",
    "Still Forms",
    "Drifting melodies and room to think. Find your quiet corner.",
    "Ambient",
  ],
  [
    "Tidal Memory",
    "Moss Circuit",
    "Organic patterns, distant shores and a feeling of coming home.",
    "Ambient",
  ],
  [
    "Golden Hour",
    "Pale Current",
    "Dusty keys and mellow beats for the long way home.",
    "Lo-fi",
  ],
  [
    "Blue Distance",
    "North Window",
    "Late-night transmissions from somewhere just out of reach.",
    "Electronic",
  ],
];
const titles = [
  "Glass Horizons",
  "Daybreak Signal",
  "After the Sun",
  "Terracotta Sky",
  "Soft Focus",
  "Weightless",
  "Tidal Memory",
  "Saltwater Letters",
  "Golden Hour",
  "Slow Sunday",
  "Blue Distance",
  "Last Train Home",
];
export const albums: Album[] = albumInfo.map((a, i) => ({
  id: `a${i + 1}`,
  title: a[0],
  artist: a[1],
  description: a[2],
  genre: a[3],
  cover: `/art/a${i + 1}.svg`,
  tracks: [`t${i * 2 + 1}`, `t${i * 2 + 2}`],
}));
export const tracks: Track[] = titles.map((title, i) => {
  const a = albums[Math.floor(i / 2)];
  return {
    id: `t${i + 1}`,
    title,
    artist: a.artist,
    album: a.title,
    albumId: a.id,
    genre: a.genre,
    duration: (32 * 60) / (78 + i * 3),
    src: `/audio/t${i + 1}.wav`,
    cover: a.cover,
  };
});
export const trackById = (id: string) => tracks.find((t) => t.id === id);
export const formatTime = (n: number) =>
  `${Math.floor((Number.isFinite(n) ? n : 0) / 60)}:${String(Math.floor((Number.isFinite(n) ? n : 0) % 60)).padStart(2, "0")}`;
