# Undertone implementation plan

Goal: original React/TypeScript/Vite music application using public Spotify UI observations, with a fully local playable catalog.

## Evidence and design

Observed 2026-11-01 at https://open.spotify.com and /search/ambient, logged out. REA Evidence ev_f49de126a601d998f2454a092ebc1e85c659bb1c91bc556f817a704765db5e6b captures home accessibility and pixels at 1440x1000. Artwork did not load in that capture. Subsequent visible Chrome interactions establish: Create playlist opens a login prompt; entering ambient navigates immediately to /search/ambient; results have category links, song rows with durations, artist/album links, Liked Songs and more-options controls. Song menu offers playlist, liked songs, artist/album, credits and share. Play opens an account prompt. No account was used.

Chosen architecture: static local app, canonical typed catalog, pure library/player reducer, one HTMLAudioElement, localStorage versioned state with defensive validation. Hash routes support browser navigation. Original abstract SVG covers and deterministic original synthesized WAV music avoid external media or licensing dependency. Audio is delivered by the local web server. React renders navigation, collection pages, search, library, queue and player. CSS uses dark rounded panels, square covers, circular artist imagery, neutral text and original coral accent.

Alternatives: a backend would add sync but requires accounts and service operation; external audio would increase variety but add network and licensing risks. Local static architecture fulfills the brief without those dependencies. These are autonomous engineering choices under the user's execution instruction.

## Tasks

- [x] Write behavioral tests for search, playlist/library mutations, queue priority/reorder, next/previous, repeat/shuffle, persistence validation.
- [x] Implement model and original catalog; prove tests pass.
- [x] Generate original local audio and SVG assets, retain reproducible generator and license.
- [x] Implement responsive shell, home, search/category filtering, album/artist/playlist details, persistent library and playlist editing.
- [x] Implement HTML audio playback, pause/seek/volume/mute, previous/next, repeat/shuffle, queue management and restore paused after reload.
- [x] Build/typecheck; browser test desktop and mobile, CRUD persistence, audio progression, navigation and queue; fix defects.
- [x] Deliver comparison report with observed/inferred/unknown labels, exact verification evidence and remaining limits.

## Review focus

Malformed storage must not break boot; invalid IDs must not crash; duplicate queue entries must remain independent; empty collections must be usable; audio failures must be visible. No autoplay after reload. No Spotify assets, branding, source inspection or access circumvention.

## Completion evidence

24 automated tests pass; production TypeScript/Vite build passes; dependency audit reports zero vulnerabilities. Browser feature checks and desktop/mobile screenshots are documented in FEATURE-COMPARISON.md. Five independent review findings were fixed and revalidated.
