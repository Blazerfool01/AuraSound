# Observation limits and unreconstructed functionality

## Could not be reconstructed from observation alone

1. **Recommendation and radio selection.** A requested test song led to a different playing recommendation. Its ranking inputs, account rules, timing, experimentation and server decision path were not observable or isolated. Local selections play the selected original track directly.
2. **Premium shuffle and repeat semantics.** These controls were disabled for the observed signed-in account. Exact shuffle distribution, smart-shuffle insertion, repeat behavior under ads and mixed contexts, and entitlement transitions were not tested. Undertone defines a finite shuffle cycle and explicit repeat modes.
3. **Streaming backend and DRM.** Codecs, adaptive delivery, licensing, encryption, buffering strategy, gapless behavior, entitlement enforcement and offline protected download internals cannot be inferred from the visible UI. No protected stream inspection or circumvention occurred.
4. **Cross-device synchronization.** The device picker was visible, but no additional device or session conflict was exercised. Session handoff, queue merge and volume ownership are unknown.
5. **Cloud persistence/conflict rules.** The signed-in library was visible and temporary changes were observed, but concurrency, offline reconciliation, retry semantics and recovery retention were not investigated. The local app uses versioned browser storage.
6. **Queue execution edge cases.** Explicit insertion, separate section ordering and clearing were observed. Priority playback, duplicate insertion policy, drag behavior, skip-to-item semantics and queue survival when choosing a different collection were not exhaustively tested. Local behavior is documented and covered by reducer tests.
7. **Playback boundary details.** Previous's restart threshold, seek behavior under every content type, ads, natural-end auto-radio, crossfade, gapless transitions and browser media-key integration were not characterized. Undertone's previous threshold and repeat rules are local engineering decisions.
8. **Unseen responsive behavior.** Mobile reference layouts and device-specific touch, accessibility and audio restrictions were not tested. Undertone has its own responsive implementation; validation was desktop Chrome at emulated viewport sizes, not native iOS/Android testing.
9. **Private implementation architecture.** The reference's source, data model, APIs, caching, analytics, backend services and tests were not inspected. Undertone's reducer, catalog and HTML audio architecture are independent original choices.

## Observed but not implemented

These are visible features, not unknown discoveries: playlist photo/privacy/collaboration controls; automatic numbered playlist creation; the saved-song playlist-selection sheet; library Artists/Recents sorting; library resizing; Blend and Folder creation; recommendation shelves; song radio; credits and sharing; desktop installation; lyrics/device/miniplayer/fullscreen controls; podcast/audiobook/profile search categories; artist following. They require substantially broader product scope or service support.

## Bounded cleanup

The signed-in temporary test playlist was deleted, its test song removed before deletion, the single explicit queue addition cleared, and the Liked Songs count restored to its initial value. Reference playback was paused. Observing playback can affect recents, listening history and recommendation inputs; those effects were not reversible through the tested UI and are not claimed to have been erased. No pre-existing playlist content was edited.

## Practical local limits

- Twelve 17–25 second original synthesized tracks, six albums, fictional artists.
- State belongs to one browser origin; preview port 4173 and dev port 5173 have separate libraries.
- Approximate four-second progress checkpoints, restored paused; no automatic playback after reload.
- No service worker: keep the local HTTP server running.
- WAV format is intentionally simple and larger than compressed streaming media.
- No account system, public publishing, uploaded audio, sync, backup/restore UI or cross-tab conflict resolution.
- No claim of full Spotify, WCAG, Safari/Firefox or native-device parity.
