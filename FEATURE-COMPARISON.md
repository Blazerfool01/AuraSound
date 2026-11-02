# Undertone — feature comparison and validation

Built 1 November 2026 with React 19, TypeScript and Vite. Original code, identity, cover art and music. Reference: [Spotify web player](https://open.spotify.com/), observed through public UI and a user-authorized signed-in session. This is a functional local reconstruction of selected workflows, not a complete Spotify clone.

`Observed` means directly seen or exercised in the browser. `Inferred` means an interpretation not proven by a completed reference workflow. `Local choice` means deliberately specified for this application. The investigation ledger and REA provenance are in [OBSERVATIONS.md](OBSERVATIONS.md) and [evidence/public-home.json](evidence/public-home.json).

## Comparison

| Feature | Reference evidence | Undertone behavior | Fidelity / difference |
|---|---|---|---|
| Main shell | Observed PUB-01, AUTH-01: top search, rounded library/content panels, bottom transport, right queue panel | Same structural areas; original coral/green palette, system typography, branding, art and editorial copy | Structural resemblance, not pixel identity. Panel resizing is not implemented. |
| Home | Observed public discovery shelves, circular artists, square album art; signed-in quick tiles and personalized shelves | Quick collection tiles, album/artist shelves, original mixes and local listening recents | Static catalog and hand-authored selection; no recommendation service. |
| Global search | Observed PUB-02: typing navigates without Enter; result categories | Live case-insensitive title, artist, album and genre search; All/Songs/Albums/Artists/Playlists | Different URL scheme: hash routes. Podcasts, audiobooks, profiles and genre landing pages omitted. |
| Album / artist navigation | Observed public result links and signed-in collection table | Dedicated album and artist pages, releases, track list and play actions | Fictional artists, one release each. No public biography or follow graph. |
| Song rows | Observed: play, title/artist links, album, duration and action menu | Independent play, album/artist navigation, heart, duration, playlist/queue actions | Row title opens its album; no separate song-detail page. |
| Create playlist | Observed AUTH-02: immediate empty collection, editable title, inline search | Named local creation dialog, navigates to new playlist, inline search/add | Requires a nonblank name before creation. No automatic numbered playlist. |
| Edit playlist | Observed AUTH-02: name/description fields, Save | Name/description dialog with Save, title click or pencil shortcut | 80-character local name limit versus observed 100; 300-character description. No photo/privacy/collaboration controls. |
| Playlist membership | Observed: Add to Playlist, populated table, Remove from this playlist | Inline add and menu selection, duplicate prevention, remove and up/down reorder | Reference duplicate handling and drag ordering were not tested. Local move controls provide an explicit ordering contract. |
| Delete playlist | Observed AUTH-02: confirmation, removal from library, return Home | Confirmation, local deletion, return Your Library | No server recovery feature. Only local state changes. |
| Liked Songs | Observed AUTH-04: add increments count; saved control opens playlist sheet; uncheck + Done removes | Heart toggle with a separate playlist picker, dedicated Liked Songs collection and count | Intentional interaction difference: no saved-state playlist sheet. |
| Saved albums | Observed signed-in library had album entries and album filter | Save/remove on album page, library grid/sidebar/filter | Direct save/remove sequence was validated locally, not in reference. |
| Library browsing | Observed filters, library search, Recents ordering | Playlist/album filters, local sidebar search, persistent saved collections | No artist follows, folder/blend support or sort menu. |
| Playback | Observed AUTH-03: active player, progress, pause, next/previous; selected song led to a different recommendation | Direct HTMLAudioElement playback of 12 short original local WAVs; track progression, pause, seek, previous/next, volume/mute | Direct selection is a local contract. Does not emulate the account's recommendation substitution or ads. |
| Previous | Control observed; exact restart threshold not tested in reference | Restart current after 3 seconds; otherwise return to actual history | Local choice with unit test and browser previous check. |
| Shuffle | Control observed disabled for authenticated account | Shuffled cycle without repeats; stops at cycle end unless Repeat all | Local choice, not proven reference behavior. Regression test verifies finite cycle. |
| Repeat | Control observed disabled for authenticated account | Off → All → One → Off; Repeat one applies to natural end, manual Next advances | Local choice; pure transition tests and UI state checks. |
| Queue panel | Observed AUTH-03: right panel, Now playing, Next in queue and Next up | Right panel with now playing, explicit queue and collection remainder | Placement/categories directly observed. Compact/mobile panel overlays content. |
| Add to queue | Observed: addition makes separate explicit-queue section, toast and Clear queue | Append, duplicate entries allowed, reorder, remove one occurrence, clear, jump to entry | Priority is inferred from reference section order; local queue-before-collection execution is independently tested. |
| Persistence | Reference signed-in library existed; cross-session internals were not investigated | Versioned localStorage for playlists, likes, saved albums, queue, history, recents, settings and position checkpoints | Local-only architecture. Reload restores paused. No account/cloud sync. |
| Responsive UI | Public reference only measured at desktop; signed-in browser viewport varied | Desktop grid, compact/tablet layout, mobile drawer, two-column cover grid, fixed mobile player and full-width queue | Responsive behavior is our own design. No claim of mobile-reference fidelity. |

## Verification evidence

Validation performed on Windows, Node.js 24.20.0 and Chromium/Chrome 156. Actual installed dependency versions are locked in package-lock.json.

| Check | Result and boundary |
|---|---|
| `npm test` | 24 passing tests in 2 files: search; playlist CRUD and duplicate handling; likes/saved albums; explicit queue priority and duplicate occurrence edits; repeat/end handling; played history; shuffle and collection-context regression; safe storage restore; all 12 physical WAV files, headers, durations, non-silence and cover paths. |
| Red/green | Initial 10 behavior tests failed against feature stubs before implementation, then passed. Two review regressions failed before their fixes, then passed. Media integrity tests verify shipped artifacts independently. |
| `npm run build` | TypeScript compilation and Vite production bundle. Final build result recorded with delivered dist. |
| `npm audit` | Zero reported vulnerabilities after updating the test runner and adding Node type declarations. This is a dependency audit, not a security certification. |
| Live browser: search | ambient returned 4 songs and 2 albums; glass matched its songs/album/artist; Albums filter left 2 ambient album cards; impossible query displayed the no-result state. |
| Live browser: playback | t1.wav loaded with duration 24.61542 seconds; currentTime advanced to 4.136664 while paused=false. Pause, seek via timeline, mute, previous, repeat cycle and shuffle toggle were exercised. |
| Live browser: queue | Appended Glass Horizons then Daybreak Signal; moved Daybreak Signal up; Next selected Daybreak Signal before collection continuation; queue removal/clear UI checked. Pure tests cover duplicate occurrences. |
| Live browser: playlist lifecycle | Created Night Shift QA, description entered, added t1, renamed Night Shift Verified, reloaded and verified name/description/membership; added t2, moved it first, removed it, confirmed deletion. Temporary QA playlist removed. |
| Live browser: saved state | Liked t1, saved all 6 albums; state survived reload. All 6 saved album cards remained visible at 900px width after the responsive regression fix. |
| Live browser: context regression | Played t1 from album a1, opened The slow lane, started that collection; Next selected Soft Focus (t5), confirming the playlist context replaced the album context. |
| Live browser: responsive | Visual checks at 1440×900 and 390×844; width/overflow check at 320×740 returned clientWidth=scrollWidth=320. Mobile queue and drawer opened/closed; closed drawer inert attribute verified. Desktop viewport reset after QA. |
| Accessibility basics | Named icon controls, labels for inputs/ranges, keyboard-operable menus and reorder actions, native modal dialogs, skip navigation without route corruption, reduced-motion CSS, inert closed mobile drawer. This is not a full WCAG audit. |
| Browser errors | Browser error-log query returned an empty array during the checked local session. |

## Iterative corrections

An independent read-only review identified five issues. All were addressed: collection context now participates in play/pause decisions; shuffle tracks its remaining cycle; skip navigation no longer corrupts the hash route; home-only card truncation no longer hides saved library albums; the closed mobile drawer is inert and opening moves focus to its close control. A final build caught missing Node types for artifact tests; @types/node was added explicitly.

## What is deliberately outside this deliverable

Commercial catalog, accounts/authentication, entitlement rules, ads, billing, protected streaming, cross-device connections, cloud sync, social/collaborative playlists, folders/blends, podcasts/audiobooks, lyrics, artist-follow graph, photo uploads, public sharing, credits UI, miniplayer/fullscreen and recommendation infrastructure. Some controls were observed but not reconstructed; others could not be characterized from observation. See [UNKNOWN-FUNCTIONALITY.md](UNKNOWN-FUNCTIONALITY.md) for that distinction.

The demo catalog consists of short original procedural music studies, not full-length commercial recordings. Storage is local to one browser origin and is lost if its site data is cleared. The localhost server must run to serve the app/media. No audio import, service worker, backup UI, multi-tab conflict resolution or device-specific mobile audio guarantee is claimed.
