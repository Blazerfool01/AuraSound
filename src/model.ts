import { albums, tracks, trackById } from "./catalog";
export { tracks } from "./catalog";
export interface Playlist {
  id: string;
  name: string;
  description: string;
  tracks: string[];
}
export interface State {
  version: 1;
  playlists: Playlist[];
  liked: string[];
  saved: string[];
  current: string | null;
  context: string[];
  contextIndex: number;
  queue: string[];
  history: string[];
  recent: string[];
  playing: boolean;
  shuffle: boolean;
  shuffleRemaining: string[];
  repeat: "off" | "all" | "one";
  volume: number;
  muted: boolean;
  position: number;
  serial: number;
}
export const initialState: State = {
  version: 1,
  playlists: [
    {
      id: "p1",
      name: "The slow lane",
      description: "A softer soundtrack for your everyday.",
      tracks: ["t1", "t5", "t7", "t9"],
    },
    {
      id: "p2",
      name: "After hours",
      description: "One more track before the lights go out.",
      tracks: ["t11", "t3", "t6", "t12"],
    },
  ],
  liked: [],
  saved: [],
  current: null,
  context: [],
  contextIndex: -1,
  queue: [],
  history: [],
  recent: [],
  playing: false,
  shuffle: false,
  shuffleRemaining: [],
  repeat: "off",
  volume: 0.65,
  muted: false,
  position: 0,
  serial: 0,
};
export type Action =
  | { type: "create"; id: string; name: string }
  | { type: "rename"; id: string; name: string; description?: string }
  | { type: "delete" | "like" | "save" | "enqueue"; id: string }
  | { type: "add" | "remove"; playlist: string; id: string }
  | { type: "moveTrack"; playlist: string; index: number; direction: number }
  | { type: "play"; id: string; context?: string[] }
  | {
      type:
        | "next"
        | "ended"
        | "previous"
        | "toggle"
        | "shuffle"
        | "repeat"
        | "mute"
        | "clearQueue"
        | "pause";
    }
  | { type: "moveQueue"; index: number; direction: number }
  | { type: "removeQueue" | "playQueue"; index: number }
  | { type: "volume" | "position"; value: number };
const toggle = (list: string[], id: string) =>
  list.includes(id) ? list.filter((x) => x !== id) : [...list, id];
export const validTracks = (a: unknown): string[] =>
  Array.isArray(a)
    ? a.filter((x): x is string => typeof x === "string" && !!trackById(x))
    : [];
function move<T>(a: T[], i: number, d: number) {
  const b = [...a],
    j = i + d;
  if (i >= 0 && i < b.length && j >= 0 && j < b.length)
    [b[i], b[j]] = [b[j], b[i]];
  return b;
}
function start(s: State, id: string, extra: Partial<State> = {}): State {
  return {
    ...s,
    current: id,
    playing: true,
    position: 0,
    serial: s.serial + 1,
    history: s.current ? [...s.history, s.current].slice(-100) : s.history,
    recent: [id, ...s.recent.filter((x) => x !== id)].slice(0, 12),
    ...extra,
  };
}
function next(s: State): State {
  if (s.queue.length) return start(s, s.queue[0], { queue: s.queue.slice(1) });
  if (!s.context.length) return { ...s, playing: false };
  if (s.shuffle) {
    let remaining = s.shuffleRemaining;
    if (!remaining.length) {
      if (s.repeat !== "all") return { ...s, playing: false };
      remaining = s.context.filter((id) => id !== s.current);
      if (!remaining.length) return start(s, s.context[0]);
    }
    const index = Math.floor(Math.random() * remaining.length),
      id = remaining[index];
    return start(s, id, {
      contextIndex: s.context.indexOf(id),
      shuffleRemaining: remaining.filter((_, i) => i !== index),
    });
  }
  const i = s.contextIndex + 1;
  if (i < s.context.length) return start(s, s.context[i], { contextIndex: i });
  return s.repeat === "all"
    ? start(s, s.context[0], { contextIndex: 0 })
    : { ...s, playing: false };
}
export function reducer(s: State, a: Action): State {
  switch (a.type) {
    case "create":
      return a.name.trim() && !s.playlists.some((p) => p.id === a.id)
        ? {
            ...s,
            playlists: [
              ...s.playlists,
              {
                id: a.id,
                name: a.name.trim().slice(0, 80),
                description: "Your own little corner of sound.",
                tracks: [],
              },
            ],
          }
        : s;
    case "rename":
      return a.name.trim()
        ? {
            ...s,
            playlists: s.playlists.map((p) =>
              p.id === a.id
                ? {
                    ...p,
                    name: a.name.trim().slice(0, 80),
                    description:
                      a.description === undefined
                        ? p.description
                        : a.description.slice(0, 300),
                  }
                : p,
            ),
          }
        : s;
    case "delete":
      return { ...s, playlists: s.playlists.filter((p) => p.id !== a.id) };
    case "add":
      return trackById(a.id)
        ? {
            ...s,
            playlists: s.playlists.map((p) =>
              p.id === a.playlist
                ? { ...p, tracks: [...new Set([...p.tracks, a.id])] }
                : p,
            ),
          }
        : s;
    case "remove":
      return {
        ...s,
        playlists: s.playlists.map((p) =>
          p.id === a.playlist
            ? { ...p, tracks: p.tracks.filter((id) => id !== a.id) }
            : p,
        ),
      };
    case "moveTrack":
      return {
        ...s,
        playlists: s.playlists.map((p) =>
          p.id === a.playlist
            ? { ...p, tracks: move(p.tracks, a.index, a.direction) }
            : p,
        ),
      };
    case "like":
      return trackById(a.id) ? { ...s, liked: toggle(s.liked, a.id) } : s;
    case "save":
      return albums.some((x) => x.id === a.id)
        ? { ...s, saved: toggle(s.saved, a.id) }
        : s;
    case "play": {
      if (!trackById(a.id)) return s;
      const context = validTracks(a.context ?? tracks.map((t) => t.id));
      if (!context.includes(a.id)) context.unshift(a.id);
      return start(s, a.id, {
        context,
        contextIndex: context.indexOf(a.id),
        shuffleRemaining: context.filter((id) => id !== a.id),
        queue: [],
      });
    }
    case "enqueue":
      return trackById(a.id) ? { ...s, queue: [...s.queue, a.id] } : s;
    case "next":
      return next(s);
    case "ended":
      return s.repeat === "one" && s.current
        ? start(s, s.current, { history: s.history })
        : next(s);
    case "previous": {
      const id = s.history.at(-1);
      return id
        ? start(s, id, {
            history: s.history.slice(0, -1),
            contextIndex: s.context.includes(id)
              ? s.context.indexOf(id)
              : s.contextIndex,
          })
        : { ...s, position: 0, serial: s.serial + 1 };
    }
    case "toggle":
      return s.current
        ? { ...s, playing: !s.playing }
        : start(s, tracks[0].id, {
            context: tracks.map((t) => t.id),
            contextIndex: 0,
          });
    case "pause":
      return { ...s, playing: false };
    case "shuffle":
      return {
        ...s,
        shuffle: !s.shuffle,
        shuffleRemaining: s.context.filter((id) => id !== s.current),
      };
    case "repeat":
      return {
        ...s,
        repeat: s.repeat === "off" ? "all" : s.repeat === "all" ? "one" : "off",
      };
    case "mute":
      return { ...s, muted: !s.muted };
    case "volume":
      return { ...s, volume: Math.max(0, Math.min(1, a.value)), muted: false };
    case "position":
      return { ...s, position: Math.max(0, a.value) };
    case "clearQueue":
      return { ...s, queue: [] };
    case "removeQueue":
      return { ...s, queue: s.queue.filter((_, i) => i !== a.index) };
    case "moveQueue":
      return { ...s, queue: move(s.queue, a.index, a.direction) };
    case "playQueue":
      return s.queue[a.index]
        ? start(s, s.queue[a.index], { queue: s.queue.slice(a.index + 1) })
        : s;
  }
}
export function searchTracks(query: string) {
  const q = query.trim().toLowerCase();
  return tracks.filter((t) =>
    `${t.title} ${t.artist} ${t.album} ${t.genre}`.toLowerCase().includes(q),
  );
}
export function restore(raw: string | null): State {
  try {
    const v = JSON.parse(raw ?? "null");
    if (!v || v.version !== 1) return structuredClone(initialState);
    const playlists: Playlist[] = Array.isArray(v.playlists)
      ? v.playlists
          .filter(
            (p: unknown) =>
              p &&
              typeof p === "object" &&
              typeof (p as Playlist).id === "string" &&
              typeof (p as Playlist).name === "string",
          )
          .map((p: Playlist) => ({
            id: p.id,
            name: p.name.slice(0, 80),
            description:
              typeof p.description === "string"
                ? p.description.slice(0, 300)
                : "",
            tracks: [...new Set(validTracks(p.tracks))],
          }))
      : initialState.playlists;
    const context = validTracks(v.context);
    const current =
      typeof v.current === "string" && trackById(v.current) ? v.current : null;
    return {
      ...initialState,
      playlists,
      liked: [...new Set(validTracks(v.liked))],
      saved: Array.isArray(v.saved)
        ? v.saved.filter((x: unknown) => albums.some((a) => a.id === x))
        : [],
      current,
      context,
      contextIndex: Number.isInteger(v.contextIndex)
        ? Math.max(-1, Math.min(context.length - 1, v.contextIndex))
        : -1,
      queue: validTracks(v.queue),
      history: validTracks(v.history).slice(-100),
      recent: validTracks(v.recent).slice(0, 12),
      playing: false,
      shuffle: v.shuffle === true,
      shuffleRemaining: Array.isArray(v.shuffleRemaining)
        ? [...new Set(validTracks(v.shuffleRemaining))].filter((id) =>
            context.includes(id),
          )
        : context.filter((id) => id !== current),
      repeat: ["off", "all", "one"].includes(v.repeat) ? v.repeat : "off",
      volume:
        typeof v.volume === "number" && Number.isFinite(v.volume)
          ? Math.min(1, Math.max(0, v.volume))
          : 0.65,
      muted: v.muted === true,
      position:
        current && typeof v.position === "number" && Number.isFinite(v.position)
          ? Math.max(0, Math.min(trackById(current)!.duration, v.position))
          : 0,
      serial: 0,
    };
  } catch {
    return structuredClone(initialState);
  }
}

export const isCurrentContext = (s: State, ids: string[]) =>
  s.context.length === ids.length && s.context.every((id, i) => id === ids[i]);
