import { useEffect, useRef, useState, type Dispatch } from "react";
import { trackById } from "./catalog";
import type { Action, State } from "./model";
export function usePlayer(
  s: State,
  dispatch: Dispatch<Action>,
  notify: (s: string) => void,
) {
  const audio = useRef<HTMLAudioElement>(null);
  const [time, setTime] = useState(s.position);
  const [duration, setDuration] = useState(0);
  const state = useRef(s);
  state.current = s;
  const checkpoint = useRef(0);
  useEffect(() => {
    const a = audio.current;
    if (!a) return;
    const track = s.current ? trackById(s.current) : undefined;
    if (!track) {
      a.removeAttribute("src");
      a.load();
      return;
    }
    a.src = track.src;
    setTime(s.position);
    setDuration(track.duration);
    a.load();
    const ready = () => {
      a.currentTime = Math.min(
        state.current.position,
        a.duration || track.duration,
      );
      if (state.current.playing)
        void a.play().catch((e) => {
          if (e.name !== "AbortError") {
            dispatch({ type: "pause" });
            notify("Playback could not start. Press play to try again.");
          }
        });
    };
    a.addEventListener("loadedmetadata", ready, { once: true });
    return () => a.removeEventListener("loadedmetadata", ready);
    // Only explicit track transitions reload media; progress checkpoints do not.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [s.current, s.serial]);
  useEffect(() => {
    const a = audio.current;
    if (!a) return;
    if (!s.playing) a.pause();
    else if (a.readyState >= 2)
      void a.play().catch((e) => {
        if (e.name !== "AbortError") {
          dispatch({ type: "pause" });
          notify("Playback is paused. Press play to resume.");
        }
      });
  }, [s.playing, dispatch, notify]);
  useEffect(() => {
    if (audio.current) {
      audio.current.volume = s.volume;
      audio.current.muted = s.muted;
    }
  }, [s.volume, s.muted]);
  function seek(n: number) {
    const a = audio.current;
    if (a && Number.isFinite(n)) {
      a.currentTime = n;
      setTime(n);
      dispatch({ type: "position", value: n });
    }
  }
  function update() {
    const a = audio.current;
    if (!a) return;
    setTime(a.currentTime);
    if (Number.isFinite(a.duration)) setDuration(a.duration);
    if (Math.abs(a.currentTime - checkpoint.current) > 4) {
      checkpoint.current = a.currentTime;
      dispatch({ type: "position", value: a.currentTime });
    }
  }
  function previous() {
    if (time > 3) seek(0);
    else dispatch({ type: "previous" });
  }
  function fail() {
    dispatch({ type: "pause" });
    notify(
      "This audio file could not be loaded. Try another track or restart the local server.",
    );
  }
  return { audio, time, duration, seek, update, previous, fail };
}
