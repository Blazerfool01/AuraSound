import { describe, it, expect } from "vitest";
import {
  initialState,
  reducer,
  restore,
  searchTracks,
  tracks,
  isCurrentContext,
} from "./model";
describe("catalog search", () => {
  it("matches title artist album and genre without case or whitespace sensitivity", () => {
    expect(searchTracks("  GLASS  ").map((t) => t.id)).toContain("t1");
    expect(searchTracks("ambient").length).toBeGreaterThan(0);
    expect(searchTracks("no-match-zz")).toEqual([]);
  });
});
describe("local library", () => {
  it("creates renames adds uniquely removes and deletes playlists", () => {
    let s = reducer(initialState, {
      type: "create",
      id: "mine",
      name: "  Night shift  ",
    });
    s = reducer(s, { type: "add", playlist: "mine", id: "t1" });
    s = reducer(s, { type: "add", playlist: "mine", id: "t1" });
    expect(s.playlists.find((p) => p.id === "mine")).toMatchObject({
      name: "Night shift",
      tracks: ["t1"],
    });
    s = reducer(s, { type: "rename", id: "mine", name: "Changed" });
    expect(s.playlists.find((p) => p.id === "mine")?.name).toBe("Changed");
    s = reducer(s, { type: "remove", playlist: "mine", id: "t1" });
    expect(s.playlists.find((p) => p.id === "mine")?.tracks).toEqual([]);
    s = reducer(s, { type: "delete", id: "mine" });
    expect(s.playlists.find((p) => p.id === "mine")).toBeUndefined();
  });
  it("toggles liked songs and saved albums", () => {
    let s = reducer(initialState, { type: "like", id: "t1" });
    expect(s.liked).toContain("t1");
    s = reducer(s, { type: "like", id: "t1" });
    expect(s.liked).not.toContain("t1");
    s = reducer(s, { type: "save", id: "a1" });
    expect(s.saved).toContain("a1");
  });
});
describe("player transitions", () => {
  it("consumes explicit queue before collection and preserves duplicate entries", () => {
    let s = reducer(initialState, {
      type: "play",
      id: "t1",
      context: ["t1", "t2", "t3"],
    });
    s = reducer(s, { type: "enqueue", id: "t5" });
    s = reducer(s, { type: "enqueue", id: "t5" });
    s = reducer(s, { type: "next" });
    expect(s.current).toBe("t5");
    expect(s.queue).toEqual(["t5"]);
    s = reducer(s, { type: "next" });
    s = reducer(s, { type: "next" });
    expect(s.current).toBe("t2");
  });
  it("reorders and removes a particular queue occurrence", () => {
    let s = { ...initialState, queue: ["t1", "t2", "t1"] };
    s = reducer(s, { type: "moveQueue", index: 2, direction: -1 });
    expect(s.queue).toEqual(["t1", "t1", "t2"]);
    s = reducer(s, { type: "removeQueue", index: 0 });
    expect(s.queue).toEqual(["t1", "t2"]);
  });
  it("stops at end, repeats collection, and repeats one only on ended", () => {
    let s = reducer(initialState, { type: "play", id: "t1", context: ["t1"] });
    expect(reducer(s, { type: "next" }).playing).toBe(false);
    s = { ...s, repeat: "all" };
    expect(reducer(s, { type: "next" }).playing).toBe(true);
    s = { ...s, repeat: "one" };
    expect(reducer(s, { type: "ended" }).current).toBe("t1");
  });
  it("previous returns to the actually played history", () => {
    let s = reducer(initialState, {
      type: "play",
      id: "t1",
      context: ["t1", "t2"],
    });
    s = reducer(s, { type: "next" });
    expect(reducer(s, { type: "previous" }).current).toBe("t1");
  });
  it("shuffle chooses a different valid track", () => {
    const s = {
      ...reducer(initialState, {
        type: "play",
        id: "t1",
        context: ["t1", "t2", "t3"],
      }),
      shuffle: true,
    };
    const n = reducer(s, { type: "next" });
    expect(n.current).not.toBe("t1");
    expect(s.context).toContain(n.current);
  });
  it("stops after a shuffled cycle with repeat off", () => {
    let s = reducer(initialState, {
      type: "play",
      id: "t1",
      context: ["t1", "t2", "t3"],
    });
    s = reducer(s, { type: "shuffle" });
    const visited = [s.current];
    s = reducer(s, { type: "next" });
    visited.push(s.current);
    s = reducer(s, { type: "next" });
    visited.push(s.current);
    expect(new Set(visited).size).toBe(3);
    expect(reducer(s, { type: "next" }).playing).toBe(false);
  });
  it("distinguishes collection identity when the same song appears in two lists", () => {
    const s = reducer(initialState, {
      type: "play",
      id: "t1",
      context: ["t1", "t2"],
    });
    expect(isCurrentContext(s, ["t1", "t2"])).toBe(true);
    expect(isCurrentContext(s, ["t1", "t5"])).toBe(false);
  });
});
describe("persistence boundary", () => {
  it("round trips library and queue while restoring paused", () => {
    const s = reducer(initialState, {
      type: "play",
      id: "t1",
      context: tracks.map((t) => t.id),
    });
    expect(restore(JSON.stringify(s))).toMatchObject({
      current: "t1",
      playing: false,
      context: s.context,
    });
  });
  it("recovers malformed and structurally invalid state", () => {
    for (const raw of [
      "{",
      "null",
      "[]",
      '{"version":1,"playlists":[null],"liked":false}',
    ])
      expect(() => restore(raw)).not.toThrow();
    const s = restore(
      JSON.stringify({
        ...initialState,
        current: "invalid",
        queue: ["invalid", "t1"],
        volume: 99,
      }),
    );
    expect(s.current).toBe(null);
    expect(s.queue).toEqual(["t1"]);
    expect(s.volume).toBe(1);
  });
});
