# Observation ledger — 1 November 2026

Scope: the requested Spotify web interface. All actions used visible controls. No proprietary source, API implementation, protected stream or credentials were retrieved. Public browser sessions and the user's subsequently authenticated browser are different environments; geography and account restrictions may change results.

## PUB-01: public home, REA controlled scenario

URL: https://open.spotify.com/. Chromium 156.0.8078.76, fresh temporary profile, viewport 1440×1000, logged out. REA launched the browser, navigated to the URL and performed a declared wait before capturing DOM, accessibility and screenshot. Provider-owned browser cleanup was reported as terminated.

Evidence ID: `ev_f49de126a601d998f2454a092ebc1e85c659bb1c91bc556f817a704765db5e6b`. Compact provenance and hashes are in `evidence/public-home.json`. The screenshot was visually reviewed. It showed a black top bar, a search pill, separate rounded library and content panels, square song art placeholders, circular artist placeholders and a bottom privacy dialog. Artwork was not fully loaded. The accessibility record established Trending songs, Popular artists, Popular albums and singles, Popular radio and Featured Charts. Disabled player controls and a sign-up preview banner were present.

## PUB-02: public interactions, visible Chrome UI

- Create playlist opened “Log in to create and share playlists”; dismissed with Not now.
- Typing ambient into the header search navigated to `/search/ambient` without pressing Enter. All, Playlists, Genres & Moods, Podcasts & Shows, Artists, Albums, Songs, Audiobooks and Profiles filters were visible.
- Result rows exposed a play action, song and artist navigation, Add to Liked Songs, duration and more options. Artist and album sections were separate.
- The song menu exposed playlist addition, Liked Songs, song radio, artist/album navigation, credits, sharing and desktop app opening. Queue was absent in this logged-out menu.
- Play opened an account prompt and added `#login`. No authentication was bypassed.

## AUTH-01: authenticated shell

The user explicitly offered to sign in, completed authentication themselves, then authorized inspection. No credential handling was performed. The signed-in shell replaced account prompts with a profile control, library filters (Playlists, Artists, Albums), library search, Recents ordering and saved collections. Home had quick collection tiles and personalized sections. The bottom bar included Queue and device controls. UI content and personal library details were used only to understand structure; personal data was not imported into Undertone.

## AUTH-02: isolated playlist lifecycle

Create opened a menu with Playlist, Blend and Folder. Playlist created an empty collection immediately, navigated to its detail page and inserted it in the library. Clicking its title opened Edit details, with Name (100 character counter), Description (300 character counter), photo controls, privacy and Save. A test playlist was named “Undertone observation — temporary”. Its inline search accepted ambient and then displayed songs with Add to Playlist. Adding one song produced a title/artist/album/duration table, collection duration and recommendations. A song's menu exposed Remove from this playlist. That action removed the row. The collection menu Delete opened confirmation; confirming returned to Home and removed the test playlist from the library. The temporary playlist was deleted during cleanup. Home's recent tiles could briefly retain its stale entry; disappearance from the actual library was verified.

## AUTH-03: playback and queue

Selecting Play on the test song eventually resulted in active playback, enabled previous/next and a changing progress slider. The displayed playing title was a different recommendation, not the selected test song. Shuffle and repeat were disabled for the observed account. This is evidence of this session's behavior only; account tier, recommendations and timing were not independently isolated.

Opening Queue showed a right-hand panel with Now playing and Next up. A queued row's menu exposed Add to queue and Remove from queue. Add to queue created a separate Next in queue section above Next up, with Clear queue, and a confirmation toast. The single added explicit queue item was cleared. No priority transition was played through, so queue priority is inferred from ordering, not proven execution. Spotify was paused at cleanup. Existing recommendations/listening history cannot be restored exactly after observation.

## AUTH-04: liked-song mutation and cleanup

Add to Liked Songs incremented the visible library count by one and changed the player control to Add to playlist. Clicking that control opened a playlist-selection sheet with Liked Songs checked. Unchecking it and selecting Done restored the original count (43). This establishes that the saved-state control is not simply a second-click unlike toggle in this reference version. Undertone intentionally uses an explicit heart toggle and a separate playlist picker.

## Boundaries

The authenticated observations above are direct computer-use observations, not REA Evidence records. Their AUTH labels identify this written ledger; only PUB-01 has a REA-generated Evidence ID. Tool transcript is the source of the interaction observations. No claims about unobserved backend implementation, premium features, licensing delivery, source architecture or universal behavior follow from these records.
