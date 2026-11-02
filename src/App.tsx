import {
  useState,
  useEffect,
  useReducer,
  useCallback,
  useRef,
  createContext,
  useContext,
  type ReactNode,
  type Dispatch,
} from "react";
import {
  AudioLines,
  Home,
  Search,
  Library,
  Plus,
  ArrowRight,
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Shuffle,
  Repeat,
  Repeat1,
  Volume2,
  VolumeX,
  ListMusic,
  Heart,
  Check,
  MoreHorizontal,
  X,
  Clock3,
  Music2,
  Disc3,
  ArrowUp,
  ArrowDown,
  Pencil,
  Trash2,
  Headphones,
  Menu,
  Pin,
  Radio,
} from "lucide-react";
import {
  albums,
  tracks,
  trackById,
  formatTime,
  type Track,
  type Album,
} from "./catalog";
import {
  initialState,
  reducer,
  restore,
  searchTracks,
  isCurrentContext,
  type State,
  type Action,
  type Playlist,
} from "./model";
import { usePlayer } from "./usePlayer";
const KEY = "undertone.library.v1";
type Context = {
  s: State;
  dispatch: Dispatch<Action>;
  notify: (x: string) => void;
  go: (x: string) => void;
  edit: (p?: Playlist) => void;
};
const C = createContext<Context>(null!);
const useApp = () => useContext(C);
const href = (x: string) => `#/${x}`;
function IconButton({
  label,
  children,
  onClick,
  active = false,
  disabled = false,
  className = "",
}: {
  label: string;
  children: ReactNode;
  onClick?: () => void;
  active?: boolean;
  disabled?: boolean;
  className?: string;
}) {
  return (
    <button
      type="button"
      title={label}
      aria-label={label}
      aria-pressed={active}
      disabled={disabled}
      className={`icon ${active ? "active" : ""} ${className}`}
      onClick={onClick}
    >
      {children}
    </button>
  );
}
function Cover({
  src,
  name,
  round = false,
}: {
  src?: string;
  name: string;
  round?: boolean;
}) {
  return src ? (
    <img
      className={`cover ${round ? "round" : ""}`}
      src={src}
      alt={`${name} cover`}
      loading="lazy"
    />
  ) : (
    <div className="cover placeholder">
      <Music2 />
    </div>
  );
}
function PlaylistArt({ p }: { p: Playlist }) {
  return (
    <Cover
      src={p.tracks[0] ? trackById(p.tracks[0])?.cover : undefined}
      name={p.name}
    />
  );
}
function Like({ id }: { id: string }) {
  const { s, dispatch } = useApp();
  return (
    <IconButton
      label={
        s.liked.includes(id) ? "Remove from Liked Songs" : "Add to Liked Songs"
      }
      active={s.liked.includes(id)}
      onClick={() => dispatch({ type: "like", id })}
    >
      <Heart size={18} fill={s.liked.includes(id) ? "currentColor" : "none"} />
    </IconButton>
  );
}
function TrackRow({
  t,
  index,
  ids,
  playlist,
  compact = false,
  addTo,
}: {
  t: Track;
  index: number;
  ids: string[];
  playlist?: Playlist;
  compact?: boolean;
  addTo?: string;
}) {
  const { s, dispatch, go, notify } = useApp();
  const [open, setOpen] = useState(false);
  const menu = useRef<HTMLDivElement>(null);
  const current = s.current === t.id;
  useEffect(() => {
    if (!open) return;
    const close = (e: PointerEvent) => {
      if (!menu.current?.contains(e.target as Node)) setOpen(false);
    };
    const esc = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("pointerdown", close);
    document.addEventListener("keydown", esc);
    return () => {
      document.removeEventListener("pointerdown", close);
      document.removeEventListener("keydown", esc);
    };
  }, [open]);
  const play = () =>
    current && isCurrentContext(s, ids)
      ? dispatch({ type: "toggle" })
      : dispatch({ type: "play", id: t.id, context: ids });
  return (
    <div
      className={`track-row ${compact ? "compact" : ""} ${current ? "current" : ""}`}
      data-testid={`track-${t.id}`}
    >
      <button
        className="track-number"
        aria-label={`${current && s.playing ? "Pause" : "Play"} ${t.title}`}
        onClick={play}
      >
        <span>
          {current && s.playing ? <AudioLines size={16} /> : index + 1}
        </span>
        {current && s.playing ? (
          <Pause size={16} />
        ) : (
          <Play size={16} fill="currentColor" />
        )}
      </button>
      <div className="track-title">
        <Cover src={t.cover} name={t.album} />
        <div>
          <button
            className="text-button title-link"
            onClick={() => go(`album/${t.albumId}`)}
          >
            {t.title}
          </button>
          <button
            className="text-button muted"
            onClick={() => go(`artist/${t.albumId}`)}
          >
            {t.artist}
          </button>
        </div>
      </div>
      {!compact && (
        <button
          className="text-button track-album muted"
          onClick={() => go(`album/${t.albumId}`)}
        >
          {t.album}
        </button>
      )}
      {addTo ? (
        <button
          className="outline small"
          disabled={s.playlists
            .find((p) => p.id === addTo)
            ?.tracks.includes(t.id)}
          onClick={() => {
            dispatch({ type: "add", playlist: addTo, id: t.id });
            notify("Added to playlist");
          }}
        >
          {s.playlists.find((p) => p.id === addTo)?.tracks.includes(t.id)
            ? "Added"
            : "Add"}
        </button>
      ) : (
        <Like id={t.id} />
      )}
      <span className="duration">{formatTime(t.duration)}</span>
      <div ref={menu} className="row-menu">
        <button
          className="icon"
          aria-label={`More options for ${t.title}`}
          aria-expanded={open}
          onClick={() => setOpen(!open)}
        >
          <MoreHorizontal size={19} />
        </button>
        {open && (
          <div
            className="dropdown"
            role="group"
            aria-label={`Actions for ${t.title}`}
          >
            <button
              onClick={() => {
                dispatch({ type: "enqueue", id: t.id });
                notify("Added to queue");
                setOpen(false);
              }}
            >
              <ListMusic size={16} />
              Add to queue
            </button>
            <label>
              Add to playlist
              <select
                aria-label={`Add ${t.title} to playlist`}
                value=""
                onChange={(e) => {
                  if (e.target.value) {
                    dispatch({
                      type: "add",
                      playlist: e.target.value,
                      id: t.id,
                    });
                    notify("Added to playlist");
                    setOpen(false);
                  }
                }}
              >
                <option value="" disabled>
                  Choose a playlist
                </option>
                {s.playlists.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </label>
            <button
              onClick={() => {
                dispatch({ type: "like", id: t.id });
                setOpen(false);
              }}
            >
              <Heart size={16} />
              {s.liked.includes(t.id)
                ? "Remove from Liked Songs"
                : "Add to Liked Songs"}
            </button>
            <button
              onClick={() => {
                go(`album/${t.albumId}`);
                setOpen(false);
              }}
            >
              <Disc3 size={16} />
              Go to album
            </button>
            {playlist && (
              <>
                <button
                  onClick={() => {
                    dispatch({
                      type: "remove",
                      playlist: playlist.id,
                      id: t.id,
                    });
                    setOpen(false);
                  }}
                >
                  <Trash2 size={16} />
                  Remove from this playlist
                </button>
                <div className="reorder">
                  <button
                    disabled={index === 0}
                    onClick={() => {
                      dispatch({
                        type: "moveTrack",
                        playlist: playlist.id,
                        index,
                        direction: -1,
                      });
                      setOpen(false);
                    }}
                  >
                    <ArrowUp size={16} />
                    Move up
                  </button>
                  <button
                    disabled={index === ids.length - 1}
                    onClick={() => {
                      dispatch({
                        type: "moveTrack",
                        playlist: playlist.id,
                        index,
                        direction: 1,
                      });
                      setOpen(false);
                    }}
                  >
                    <ArrowDown size={16} />
                    Move down
                  </button>
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
function TrackList({
  ids,
  playlist,
  compact = false,
  addTo,
}: {
  ids: string[];
  playlist?: Playlist;
  compact?: boolean;
  addTo?: string;
}) {
  return (
    <div className="track-list">
      {!compact && ids.length > 0 && (
        <div className="track-head">
          <span>#</span>
          <span>Title</span>
          <span className="album-head">Album</span>
          <span />
          <Clock3 size={16} />
          <span />
        </div>
      )}
      {ids.map((id, i) => {
        const t = trackById(id);
        return (
          t && (
            <TrackRow
              key={`${id}-${i}`}
              t={t}
              ids={ids}
              index={i}
              playlist={playlist}
              compact={compact}
              addTo={addTo}
            />
          )
        );
      })}
    </div>
  );
}
function AlbumCard({ a, artist = false }: { a: Album; artist?: boolean }) {
  const { dispatch } = useApp();
  return (
    <article className={`music-card ${artist ? "artist-card" : ""}`}>
      <div className="art-wrap">
        <a href={href(`${artist ? "artist" : "album"}/${a.id}`)}>
          <Cover src={a.cover} name={a.title} round={artist} />
        </a>
        <button
          className="round-play card-play"
          aria-label={`Play ${artist ? a.artist : a.title}`}
          onClick={() =>
            dispatch({ type: "play", id: a.tracks[0], context: a.tracks })
          }
        >
          <Play size={22} fill="currentColor" />
        </button>
      </div>
      <a
        className="card-name"
        href={href(`${artist ? "artist" : "album"}/${a.id}`)}
      >
        {artist ? a.artist : a.title}
      </a>
      <p>{artist ? "Artist" : a.artist}</p>
    </article>
  );
}
function PlaylistCard({ p, index }: { p: Playlist; index: number }) {
  const { dispatch } = useApp();
  return (
    <article className="music-card playlist-card">
      <div className={`playlist-art tone-${index % 3}`}>
        <a href={href(`playlist/${p.id}`)}>
          <span className="mini-brand">
            <AudioLines size={15} /> UNDERTONE
          </span>
          <strong>{p.name}</strong>
          <span className="art-sub">
            A little less noise.
            <br />A little more feeling.
          </span>
          <span className="orbit" />
        </a>
        {p.tracks.length > 0 && (
          <button
            className="round-play card-play"
            aria-label={`Play ${p.name}`}
            onClick={() =>
              dispatch({ type: "play", id: p.tracks[0], context: p.tracks })
            }
          >
            <Play size={22} fill="currentColor" />
          </button>
        )}
      </div>
      <a className="card-name" href={href(`playlist/${p.id}`)}>
        {p.name}
      </a>
      <p>{p.description}</p>
    </article>
  );
}
function Section({
  title,
  subtitle,
  children,
  all,
}: {
  title: string;
  subtitle?: string;
  children: ReactNode;
  all?: string;
}) {
  return (
    <section className="music-section">
      <div className="section-heading">
        <div>
          {subtitle && <p className="eyebrow">{subtitle}</p>}
          <h2>{title}</h2>
        </div>
        {all && (
          <a className="show-all" href={href(all)}>
            Show all <ArrowRight size={14} />
          </a>
        )}
      </div>
      {children}
    </section>
  );
}
function HomePage() {
  const { s, dispatch } = useApp();
  const [genre, setGenre] = useState("All");
  const shown =
    genre === "All" ? albums : albums.filter((a) => a.genre === genre);
  return (
    <div className="page home-page">
      <div className="chips">
        {["All", "Electronic", "Ambient", "Lo-fi", "Downtempo"].map((x) => (
          <button
            key={x}
            aria-pressed={genre === x}
            className={genre === x ? "selected" : ""}
            onClick={() => setGenre(x)}
          >
            {x}
          </button>
        ))}
      </div>
      <div className="greeting">
        <div>
          <p className="eyebrow">YOUR SPACE. YOUR SOUND.</p>
          <h1>
            Find your frequency<span>.</span>
          </h1>
          <p>Good music. A little room to breathe.</p>
        </div>
        <span className="edition">
          <Radio size={17} /> INDEPENDENT SOUNDS / VOL. 01
        </span>
      </div>
      <div className="quick-grid">
        <a className="quick-item" href={href("liked")}>
          <span className="liked-art">
            <Heart fill="currentColor" />
          </span>
          <strong>Liked Songs</strong>
          <span>
            {s.liked.length} {s.liked.length === 1 ? "song" : "songs"}
          </span>
        </a>
        {s.playlists.slice(0, 2).map((p) => (
          <a key={p.id} className="quick-item" href={href(`playlist/${p.id}`)}>
            <PlaylistArt p={p} />
            <strong>{p.name}</strong>
            <Play size={17} />
          </a>
        ))}
        <a className="quick-item" href={href("album/a3")}>
          <Cover src="/art/a3.svg" name="Soft Focus" />
          <strong>Soft Focus</strong>
          <Play size={17} />
        </a>
      </div>
      <Section
        title={genre === "All" ? "Fresh frequencies" : `${genre}, in focus`}
        subtitle="DISCOVER SOMETHING GOOD"
        all="search"
      >
        <div className="card-grid">
          {shown.map((a) => (
            <AlbumCard key={a.id} a={a} />
          ))}
        </div>
      </Section>
      {genre === "All" && (
        <>
          <Section
            title="Made for your moments"
            subtitle="SETTLE INTO A FEELING"
            all="library"
          >
            <div className="moment-grid">
              {s.playlists.slice(0, 4).map((p, i) => (
                <PlaylistCard key={p.id} p={p} index={i} />
              ))}
              <article className="editorial">
                <Headphones size={28} />
                <p>
                  A slower pace.
                  <br />A better soundtrack.
                </p>
                <span>12 original tracks. Zero distractions.</span>
                <button
                  className="outline"
                  onClick={() =>
                    dispatch({
                      type: "play",
                      id: "t1",
                      context: tracks.map((t) => t.id),
                    })
                  }
                >
                  Start listening <ArrowRight size={16} />
                </button>
              </article>
            </div>
          </Section>
          <Section
            title={
              s.recent.length ? "Your recent rotation" : "Meet the artists"
            }
            all={s.recent.length ? "recents" : "search"}
          >
            {s.recent.length ? (
              <TrackList ids={s.recent.slice(0, 4)} />
            ) : (
              <div className="card-grid">
                {albums.map((a) => (
                  <AlbumCard key={a.id} a={a} artist />
                ))}
              </div>
            )}
          </Section>
        </>
      )}
    </div>
  );
}
function SearchPage({ query }: { query: string }) {
  const { s } = useApp();
  const [filter, setFilter] = useState("All");
  const result = searchTracks(query);
  const q = query.trim().toLowerCase();
  const foundAlbums = albums.filter((a) =>
    `${a.title} ${a.artist} ${a.genre}`.toLowerCase().includes(q),
  );
  const foundPlaylists = s.playlists.filter((p) =>
    `${p.name} ${p.description}`.toLowerCase().includes(q),
  );
  const noResults =
    !result.length && !foundPlaylists.length && !foundAlbums.length;
  return (
    <div className="page search-page">
      <div className="chips">
        {["All", "Songs", "Albums", "Artists", "Playlists"].map((x) => (
          <button
            key={x}
            className={filter === x ? "selected" : ""}
            aria-pressed={filter === x}
            onClick={() => setFilter(x)}
          >
            {x}
          </button>
        ))}
      </div>
      <p className="eyebrow">THE CATALOG IS YOURS TO EXPLORE</p>
      <h1>{q ? `Results for “${query}”` : "Discover your next favourite"}</h1>
      {noResults ? (
        <div className="empty">
          <Search size={42} />
          <h2>No results found</h2>
          <p>Try another title, artist, album or genre.</p>
        </div>
      ) : (
        <>
          {(filter === "All" || filter === "Songs") && (
            <Section title="Songs">
              <TrackList ids={result.map((t) => t.id)} />
              {!result.length && <p className="muted">No matching songs.</p>}
            </Section>
          )}
          {(filter === "All" || filter === "Albums") && (
            <Section title="Albums">
              <div className="card-grid">
                {foundAlbums.map((a) => (
                  <AlbumCard key={a.id} a={a} />
                ))}
              </div>
              {!foundAlbums.length && (
                <p className="muted">No matching albums.</p>
              )}
            </Section>
          )}
          {(filter === "All" || filter === "Artists") && (
            <Section title="Artists">
              <div className="card-grid">
                {foundAlbums.map((a) => (
                  <AlbumCard key={a.id} a={a} artist />
                ))}
              </div>
              {!foundAlbums.length && (
                <p className="muted">No matching artists.</p>
              )}
            </Section>
          )}
          {(filter === "All" || filter === "Playlists") && (
            <Section title="Playlists">
              <div className="moment-grid">
                {foundPlaylists.map((p, i) => (
                  <PlaylistCard key={p.id} p={p} index={i} />
                ))}
              </div>
              {!foundPlaylists.length && (
                <p className="muted">No matching playlists.</p>
              )}
            </Section>
          )}
        </>
      )}
    </div>
  );
}
function CollectionPage({ type, id }: { type: string; id: string }) {
  const { s, dispatch, edit, notify, go } = useApp();
  const [find, setFind] = useState("");
  const [findOpen, setFindOpen] = useState(false);
  const p = s.playlists.find((p) => p.id === id);
  const a = albums.find((a) => a.id === id);
  const liked = type === "liked";
  const recent = type === "recents";
  const artist = type === "artist";
  const ids = liked
    ? s.liked
    : recent
      ? s.recent
      : type === "playlist"
        ? p?.tracks
        : a?.tracks;
  if (!ids)
    return (
      <div className="page empty">
        <Music2 size={42} />
        <h1>Nothing here yet</h1>
        <p>This collection could not be found.</p>
        <a className="primary" href={href("")}>
          Back to Home
        </a>
      </div>
    );
  const name = liked
    ? "Liked Songs"
    : recent
      ? "Your recent rotation"
      : type === "playlist"
        ? p!.name
        : artist
          ? a!.artist
          : a!.title;
  const description = liked
    ? "All the tracks you come back to."
    : recent
      ? "A few familiar frequencies."
      : type === "playlist"
        ? p!.description
        : a!.description;
  const current = ids.includes(s.current ?? "") && isCurrentContext(s, ids);
  return (
    <div className="collection-page">
      <div
        className={`collection-hero ${liked ? "liked-hero" : ""} ${artist ? "artist-hero" : ""}`}
      >
        <div className="hero-art">
          {liked ? (
            <div className="liked-art">
              <Heart size={75} fill="currentColor" />
            </div>
          ) : p ? (
            <PlaylistArt p={p} />
          ) : (
            <Cover src={a?.cover} name={name} round={artist} />
          )}
        </div>
        <div className="collection-meta">
          <p className="eyebrow">
            {liked || recent
              ? "YOUR COLLECTION"
              : artist
                ? "ARTIST"
                : type === "playlist"
                  ? "YOUR PLAYLIST"
                  : "ORIGINAL ALBUM"}
          </p>
          <h1>
            {p ? (
              <button className="text-button" onClick={() => edit(p)}>
                {name}
              </button>
            ) : (
              name
            )}
          </h1>
          <p>{description}</p>
          <div className="collection-stats">
            <span className="avatar tiny">u</span>
            <strong>{p || liked || recent ? "You" : a?.artist}</strong>
            <span>•</span>
            {ids.length} {ids.length === 1 ? "song" : "songs"}
            <span>•</span>
            {formatTime(
              ids.reduce((sum, id) => sum + (trackById(id)?.duration ?? 0), 0),
            )}
          </div>
        </div>
      </div>
      <div className="collection-body">
        <div className="collection-actions">
          <button
            className="round-play large"
            disabled={!ids.length}
            aria-label={`${current && s.playing ? "Pause" : "Play"} ${name}`}
            onClick={() =>
              current
                ? dispatch({ type: "toggle" })
                : dispatch({ type: "play", id: ids[0], context: ids })
            }
          >
            {current && s.playing ? (
              <Pause fill="currentColor" />
            ) : (
              <Play fill="currentColor" />
            )}
          </button>
          <IconButton
            label="Shuffle"
            active={s.shuffle}
            onClick={() => dispatch({ type: "shuffle" })}
          >
            <Shuffle />
          </IconButton>
          {a && !artist && (
            <IconButton
              label={
                s.saved.includes(a.id)
                  ? "Remove album from library"
                  : "Save album to library"
              }
              active={s.saved.includes(a.id)}
              onClick={() => {
                dispatch({ type: "save", id: a.id });
                notify(
                  s.saved.includes(a.id)
                    ? "Removed from your library"
                    : "Saved to your library",
                );
              }}
            >
              {s.saved.includes(a.id) ? (
                <Check size={27} />
              ) : (
                <Plus size={27} />
              )}
            </IconButton>
          )}
          {p && (
            <>
              <IconButton label="Edit playlist" onClick={() => edit(p)}>
                <Pencil />
              </IconButton>
              <IconButton
                label="Delete playlist"
                onClick={() => edit({ ...p, id: `delete:${p.id}` })}
              >
                <Trash2 />
              </IconButton>
              <button
                className="outline find-more"
                onClick={() => setFindOpen(!findOpen)}
              >
                Find more <Search size={16} />
              </button>
            </>
          )}
        </div>
        {ids.length ? (
          <TrackList ids={ids} playlist={p} />
        ) : (
          <div className="empty">
            <Music2 size={38} />
            <h2>
              {liked
                ? "Your favourites start here"
                : "A playlist waiting to happen"}
            </h2>
            <p>
              {liked
                ? "Tap a heart on any song to keep it here."
                : "Find a song below and make it your own."}
            </p>
            {liked && (
              <button className="primary" onClick={() => go("search")}>
                Explore music
              </button>
            )}
          </div>
        )}
        {p && (!ids.length || findOpen) && (
          <Section title="Let’s find something for your playlist">
            <label className="inline-search">
              <Search size={18} />
              <input
                aria-label="Find songs for playlist"
                placeholder="Search songs, artists or albums"
                value={find}
                onChange={(e) => setFind(e.target.value)}
              />
            </label>
            <TrackList ids={searchTracks(find).map((t) => t.id)} addTo={p.id} />
          </Section>
        )}
        {artist && (
          <Section title="Releases">
            <div className="card-grid">
              <AlbumCard a={a!} />
            </div>
          </Section>
        )}
        <p className="catalog-note">
          UNDERTONE RECORDINGS · 2026
          <br />
          Original compositions & artwork. Made to be listened to.
        </p>
      </div>
    </div>
  );
}
function LibraryPage() {
  const { s, edit } = useApp();
  const [filter, setFilter] = useState("All");
  return (
    <div className="page">
      <p className="eyebrow">THE SOUNDS YOU KEEP</p>
      <div className="section-heading">
        <h1>Your library</h1>
        <button className="primary" onClick={() => edit()}>
          <Plus size={17} />
          Create playlist
        </button>
      </div>
      <div className="chips">
        {["All", "Playlists", "Albums"].map((x) => (
          <button
            key={x}
            aria-pressed={x === filter}
            className={x === filter ? "selected" : ""}
            onClick={() => setFilter(x)}
          >
            {x}
          </button>
        ))}
      </div>
      {filter !== "Albums" && (
        <Section title="Your playlists">
          <div className="moment-grid">
            <a className="liked-card" href={href("liked")}>
              <Heart size={40} fill="currentColor" />
              <h2>Liked Songs</h2>
              <p>
                {s.liked.length} {s.liked.length === 1 ? "song" : "songs"}
              </p>
            </a>
            {s.playlists.map((p, i) => (
              <PlaylistCard key={p.id} p={p} index={i} />
            ))}
          </div>
        </Section>
      )}
      {filter !== "Playlists" && (
        <Section title="Saved albums">
          <div className="card-grid">
            {albums
              .filter((a) => s.saved.includes(a.id))
              .map((a) => (
                <AlbumCard key={a.id} a={a} />
              ))}
          </div>
          {!s.saved.length && (
            <div className="empty small-empty">
              <Disc3 size={30} />
              <h3>Keep an album close</h3>
              <p>Open an album and tap + to save it here.</p>
              <a href={href("search")}>
                Explore albums <ArrowRight size={14} />
              </a>
            </div>
          )}
        </Section>
      )}
    </div>
  );
}
function PlaylistDialog({
  playlist,
  onClose,
}: {
  playlist: Playlist | null;
  onClose: () => void;
}) {
  const { dispatch, go, notify } = useApp();
  const ref = useRef<HTMLDialogElement>(null);
  const deleting = playlist?.id.startsWith("delete:");
  const [name, setName] = useState(playlist?.name ?? "");
  const [description, setDescription] = useState(playlist?.description ?? "");
  useEffect(() => {
    ref.current?.showModal();
    ref.current?.querySelector("input")?.focus();
    return () => ref.current?.close();
  }, []);
  return (
    <dialog ref={ref} onCancel={onClose} aria-labelledby="dialog-title">
      <div className="dialog-top">
        <h2 id="dialog-title">
          {deleting
            ? "Delete playlist?"
            : playlist
              ? "Edit details"
              : "A new favourite mix"}
        </h2>
        <IconButton label="Close dialog" onClick={onClose}>
          <X />
        </IconButton>
      </div>
      {deleting ? (
        <>
          <p>“{name}” will be removed from this local library.</p>
          <div className="dialog-actions">
            <button className="outline" onClick={onClose}>
              Keep playlist
            </button>
            <button
              className="primary"
              onClick={() => {
                dispatch({ type: "delete", id: playlist!.id.slice(7) });
                go("library");
                notify("Playlist deleted");
                onClose();
              }}
            >
              Delete playlist
            </button>
          </div>
        </>
      ) : (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (!name.trim()) return;
            const id = playlist?.id ?? crypto.randomUUID();
            if (playlist) dispatch({ type: "rename", id, name, description });
            else {
              dispatch({ type: "create", id, name });
              dispatch({ type: "rename", id, name, description });
            }
            go(`playlist/${id}`);
            notify(playlist ? "Playlist updated" : "Playlist created");
            onClose();
          }}
        >
          <label>
            Name
            <input
              autoFocus
              required
              maxLength={80}
              placeholder="Give it a name"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </label>
          <label>
            Description
            <textarea
              maxLength={300}
              rows={3}
              placeholder="What’s the feeling?"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </label>
          <p className="muted">Just for you. Saved on this browser.</p>
          <div className="dialog-actions">
            <button className="primary" disabled={!name.trim()} type="submit">
              {playlist ? "Save changes" : "Create playlist"}
            </button>
          </div>
        </form>
      )}
    </dialog>
  );
}
function QueuePanel({ close }: { close: () => void }) {
  const { s, dispatch } = useApp();
  const current = s.current ? trackById(s.current) : undefined;
  const upcoming = s.context.slice(s.contextIndex + 1);
  return (
    <aside className="queue-panel" aria-label="Queue">
      <div className="section-heading">
        <h2>Queue</h2>
        <IconButton label="Close queue" onClick={close}>
          <X size={20} />
        </IconButton>
      </div>
      <p className="eyebrow">NOW PLAYING</p>
      {current ? (
        <div className="queue-now">
          <Cover src={current.cover} name={current.album} />
          <div>
            <strong>{current.title}</strong>
            <p>{current.artist}</p>
          </div>
          <AudioLines className="active" size={19} />
        </div>
      ) : (
        <p className="muted">Pick a track to get started.</p>
      )}
      <div className="section-heading queue-heading">
        <h3>Next in queue</h3>
        <button
          className="text-button muted"
          disabled={!s.queue.length}
          onClick={() => dispatch({ type: "clearQueue" })}
        >
          Clear
        </button>
      </div>
      {!s.queue.length && (
        <p className="queue-tip">
          Your queue is open.
          <br />
          Add songs from their ••• menu.
        </p>
      )}
      {s.queue.map((id, i) => {
        const t = trackById(id)!;
        return (
          <div className="queue-item" key={`${id}-${i}`}>
            <button
              className="queue-track"
              onClick={() => dispatch({ type: "playQueue", index: i })}
              aria-label={`Play queued ${t.title}`}
            >
              <Cover src={t.cover} name={t.album} />
              <span>
                <strong>{t.title}</strong>
                <small>{t.artist}</small>
              </span>
            </button>
            <div className="queue-tools">
              <IconButton
                label={`Move ${t.title} up`}
                disabled={i === 0}
                onClick={() =>
                  dispatch({ type: "moveQueue", index: i, direction: -1 })
                }
              >
                <ArrowUp size={14} />
              </IconButton>
              <IconButton
                label={`Move ${t.title} down`}
                disabled={i === s.queue.length - 1}
                onClick={() =>
                  dispatch({ type: "moveQueue", index: i, direction: 1 })
                }
              >
                <ArrowDown size={14} />
              </IconButton>
              <IconButton
                label={`Remove queued ${t.title}`}
                onClick={() => dispatch({ type: "removeQueue", index: i })}
              >
                <X size={14} />
              </IconButton>
            </div>
          </div>
        );
      })}
      <h3 className="queue-heading">Next from your collection</h3>
      {s.shuffle && (
        <p className="muted">
          Shuffle is on · next track is chosen at playback.
        </p>
      )}
      {!s.shuffle &&
        upcoming.map((id, i) => {
          const t = trackById(id)!;
          return (
            <div className="queue-upcoming" key={`${id}-${i}`}>
              <Cover src={t.cover} name={t.album} />
              <div>
                <strong>{t.title}</strong>
                <p>{t.artist}</p>
              </div>
            </div>
          );
        })}
      {!s.current && (
        <p className="muted">Your next listening session starts here.</p>
      )}
    </aside>
  );
}
export default function App() {
  const [storageError, setStorageError] = useState("");
  const [s, dispatch] = useReducer(reducer, undefined, () => {
    try {
      return restore(localStorage.getItem(KEY));
    } catch {
      return initialState;
    }
  });
  const [narrow, setNarrow] = useState(
    () => matchMedia("(max-width:640px)").matches,
  );
  const sidebarRef = useRef<HTMLElement>(null);
  const [route, setRoute] = useState(() => location.hash.slice(2));
  const [queue, setQueue] = useState(false);
  const [sidebar, setSidebar] = useState(false);
  const [libraryFilter, setLibraryFilter] = useState("All");
  const [libQuery, setLibQuery] = useState("");
  const [libSearch, setLibSearch] = useState(false);
  const [toast, setToast] = useState("");
  const [dialog, setDialog] = useState<Playlist | null | undefined>(undefined);
  const main = useRef<HTMLElement>(null);
  const notify = useCallback((x: string) => setToast(x), []);
  const edit = useCallback((p?: Playlist) => setDialog(p ?? null), []);
  const go = useCallback((x: string) => {
    location.hash = `/${x}`;
    setSidebar(false);
  }, []);
  useEffect(() => {
    const update = () => {
      setRoute(location.hash.slice(2));
      setSidebar(false);
      main.current?.scrollTo(0, 0);
    };
    window.addEventListener("hashchange", update);
    return () => window.removeEventListener("hashchange", update);
  }, []);
  useEffect(() => {
    try {
      localStorage.setItem(KEY, JSON.stringify(s));
      setStorageError("");
    } catch {
      setStorageError(
        "Browser storage is unavailable. Changes will last for this session only.",
      );
    }
  }, [s]);
  useEffect(() => {
    if (!toast) return;
    const t = window.setTimeout(() => setToast(""), 3500);
    return () => clearTimeout(t);
  }, [toast]);
  const player = usePlayer(s, dispatch, notify);
  const current = s.current ? trackById(s.current) : undefined;
  const [type, id = ""] = route.split("/");
  let query = "";
  try {
    query = type === "search" ? decodeURIComponent(route.slice(7)) : "";
  } catch {
    query = "";
  }
  const queryChange = (value: string) => {
    const next = `/search/${encodeURIComponent(value)}`;
    if (type === "search") {
      history.replaceState(null, "", `#${next}`);
      setRoute(next.slice(1));
    } else go(next.slice(1));
  };
  useEffect(() => {
    const key = (e: KeyboardEvent) => {
      const el = e.target as HTMLElement;
      if (
        ["INPUT", "TEXTAREA", "SELECT", "BUTTON"].includes(el.tagName) ||
        el.isContentEditable ||
        dialog !== undefined
      )
        return;
      if (e.code === "Space") {
        e.preventDefault();
        dispatch({ type: "toggle" });
      }
      if (e.key === "Escape") {
        setQueue(false);
        setSidebar(false);
      }
    };
    window.addEventListener("keydown", key);
    return () => window.removeEventListener("keydown", key);
  }, [dialog]);
  useEffect(() => {
    const media = matchMedia("(max-width:640px)");
    const update = () => setNarrow(media.matches);
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, []);
  useEffect(() => {
    if (sidebar && narrow) sidebarRef.current?.querySelector("button")?.focus();
  }, [sidebar, narrow]);
  const closeSidebar = () => {
    setSidebar(false);
    document.querySelector<HTMLButtonElement>(".mobile-menu")?.focus();
  };
  const ctx = { s, dispatch, notify, go, edit };
  const filtered = s.playlists.filter((p) =>
    p.name.toLowerCase().includes(libQuery.toLowerCase()),
  );
  return (
    <C.Provider value={ctx}>
      <a
        className="skip"
        href="#main"
        onClick={(e) => {
          e.preventDefault();
          main.current?.focus();
        }}
      >
        Skip to music
      </a>
      <div className={`app-shell ${queue ? "with-queue" : ""}`}>
        <header className="global-header">
          <a className="brand" href={href("")} aria-label="Undertone home">
            <span className="brand-mark">
              <AudioLines size={25} />
            </span>
            <strong>
              undertone<span>®</span>
            </strong>
          </a>
          <div className="header-center">
            <IconButton
              label="Home"
              active={!type}
              className="home-button"
              onClick={() => go("")}
            >
              <Home size={23} />
            </IconButton>
            <label className="global-search">
              <Search size={23} />
              <input
                aria-label="Search music"
                placeholder="What do you want to play?"
                value={query}
                onChange={(e) => queryChange(e.target.value)}
                onFocus={() => {
                  if (type !== "search") go("search");
                }}
              />
              {query && (
                <IconButton
                  label="Clear search"
                  onClick={() => queryChange("")}
                >
                  <X size={18} />
                </IconButton>
              )}
              <span className="search-divider" />
              <IconButton label="Browse music" onClick={() => go("search")}>
                <Disc3 size={23} />
              </IconButton>
            </label>
          </div>
          <div className="header-right">
            <span className="local-badge">
              <span /> LOCAL LISTENING
            </span>
            <button
              className="avatar"
              aria-label="Open your library"
              onClick={() => go("library")}
            >
              u
            </button>
            <IconButton
              label="Toggle library"
              className="mobile-menu"
              onClick={() => setSidebar(!sidebar)}
            >
              <Menu />
            </IconButton>
          </div>
        </header>
        {sidebar && (
          <button
            className="drawer-scrim"
            aria-label="Close library"
            onClick={closeSidebar}
          />
        )}
        <aside
          ref={sidebarRef}
          inert={narrow && !sidebar}
          className={`sidebar ${sidebar ? "visible" : ""}`}
          aria-label="Your library"
        >
          <div className="sidebar-title">
            {narrow && (
              <IconButton label="Close library drawer" onClick={closeSidebar}>
                <X size={19} />
              </IconButton>
            )}
            <button
              className="text-button library-title"
              onClick={() => go("library")}
            >
              <Library size={22} />
              <strong>Your Library</strong>
            </button>
            <IconButton label="Create playlist" onClick={() => edit()}>
              <Plus size={21} />
            </IconButton>
          </div>
          <div className="chips library-chips">
            {["All", "Playlists", "Albums"].map((x) => (
              <button
                key={x}
                className={libraryFilter === x ? "selected" : ""}
                aria-pressed={libraryFilter === x}
                onClick={() => setLibraryFilter(x)}
              >
                {x}
              </button>
            ))}
          </div>
          <div className="library-toolbar">
            <IconButton
              label="Search your library"
              onClick={() => setLibSearch(!libSearch)}
            >
              <Search size={17} />
            </IconButton>
            {libSearch ? (
              <input
                autoFocus
                aria-label="Filter library"
                placeholder="Search library"
                value={libQuery}
                onChange={(e) => setLibQuery(e.target.value)}
              />
            ) : (
              <span>YOUR COLLECTION</span>
            )}
            <ListMusic size={16} />
          </div>
          <nav className="library-items">
            {libraryFilter !== "Albums" && (
              <>
                <a
                  className={`library-item ${type === "liked" ? "selected" : ""}`}
                  href={href("liked")}
                >
                  <span className="liked-art">
                    <Heart size={22} fill="currentColor" />
                  </span>
                  <span>
                    <strong>Liked Songs</strong>
                    <small>
                      <Pin size={12} />
                      Playlist · {s.liked.length}{" "}
                      {s.liked.length === 1 ? "song" : "songs"}
                    </small>
                  </span>
                </a>
                {filtered.map((p) => (
                  <a
                    key={p.id}
                    className={`library-item ${id === p.id ? "selected" : ""}`}
                    href={href(`playlist/${p.id}`)}
                  >
                    <PlaylistArt p={p} />
                    <span>
                      <strong>{p.name}</strong>
                      <small>Playlist · You</small>
                    </span>
                  </a>
                ))}
              </>
            )}
            {libraryFilter !== "Playlists" &&
              albums
                .filter(
                  (a) =>
                    s.saved.includes(a.id) &&
                    `${a.title} ${a.artist}`
                      .toLowerCase()
                      .includes(libQuery.toLowerCase()),
                )
                .map((a) => (
                  <a
                    className={`library-item ${id === a.id ? "selected" : ""}`}
                    key={a.id}
                    href={href(`album/${a.id}`)}
                  >
                    <Cover src={a.cover} name={a.title} />
                    <span>
                      <strong>{a.title}</strong>
                      <small>Album · {a.artist}</small>
                    </span>
                  </a>
                ))}
            {libraryFilter === "Albums" && !s.saved.length && (
              <p className="sidebar-hint">
                Albums you save will find a home here.
              </p>
            )}
          </nav>
          <div className="sidebar-bottom">
            <div className="library-prompt">
              <Plus size={20} />
              <strong>A mix that’s all you.</strong>
              <p>Start with a song. See where it goes.</p>
              <button className="outline small" onClick={() => edit()}>
                Create playlist
              </button>
            </div>
            <div className="local-note">
              <span className="live-dot" /> Your library stays on this device.
            </div>
          </div>
        </aside>
        <main id="main" inert={narrow && sidebar} ref={main} tabIndex={-1}>
          <div className="page-nav">
            <IconButton label="Go back" onClick={() => history.back()}>
              <ChevronLeft size={21} />
            </IconButton>
            <IconButton label="Go forward" onClick={() => history.forward()}>
              <ChevronRight size={21} />
            </IconButton>
            <span>Music for the way you feel.</span>
            <AudioLines size={17} />
          </div>
          {!type ? (
            <HomePage />
          ) : type === "search" ? (
            <SearchPage query={query} />
          ) : type === "library" ? (
            <LibraryPage />
          ) : ["album", "artist", "playlist", "liked", "recents"].includes(
              type,
            ) ? (
            <CollectionPage key={route} type={type} id={id} />
          ) : (
            <div className="page empty">
              <h1>Page not found</h1>
              <a href={href("")}>Back to Home</a>
            </div>
          )}
          <footer className="page-footer">
            <div>
              <AudioLines size={19} />
              <strong>undertone</strong>
              <span>Find your frequency.</span>
            </div>
            <p>Original sounds. Independent spirit. © 2026 Undertone.</p>
          </footer>
        </main>
        {queue && <QueuePanel close={() => setQueue(false)} />}
        <footer className="player" aria-label="Music player">
          <div className="now-playing">
            {current ? (
              <>
                <button
                  className="art-button"
                  aria-label="Open playing album"
                  onClick={() => go(`album/${current.albumId}`)}
                >
                  <Cover src={current.cover} name={current.album} />
                </button>
                <div>
                  <button
                    className="text-button"
                    onClick={() => go(`album/${current.albumId}`)}
                  >
                    {current.title}
                  </button>
                  <button
                    className="text-button muted"
                    onClick={() => go(`artist/${current.albumId}`)}
                  >
                    {current.artist}
                  </button>
                </div>
                <Like id={current.id} />
              </>
            ) : (
              <>
                <span className="idle-art">
                  <AudioLines />
                </span>
                <div>
                  <strong>Your next favourite awaits</strong>
                  <small>Choose a track to get started</small>
                </div>
              </>
            )}
          </div>
          <div className="player-center">
            <div className="transport">
              <IconButton
                label={s.shuffle ? "Disable shuffle" : "Enable shuffle"}
                active={s.shuffle}
                onClick={() => dispatch({ type: "shuffle" })}
              >
                <Shuffle size={18} />
              </IconButton>
              <IconButton
                label="Previous track"
                disabled={!current}
                onClick={player.previous}
              >
                <SkipBack size={20} fill="currentColor" />
              </IconButton>
              <button
                className="player-play"
                aria-label={s.playing ? "Pause" : "Play"}
                onClick={() => dispatch({ type: "toggle" })}
              >
                {s.playing ? (
                  <Pause size={21} fill="currentColor" />
                ) : (
                  <Play size={21} fill="currentColor" />
                )}
              </button>
              <IconButton
                label="Next track"
                disabled={!current}
                onClick={() => dispatch({ type: "next" })}
              >
                <SkipForward size={20} fill="currentColor" />
              </IconButton>
              <IconButton
                label={`Repeat: ${s.repeat}`}
                active={s.repeat !== "off"}
                onClick={() => dispatch({ type: "repeat" })}
              >
                {s.repeat === "one" ? (
                  <Repeat1 size={18} />
                ) : (
                  <Repeat size={18} />
                )}
              </IconButton>
            </div>
            <div className="timeline">
              <span>{formatTime(player.time)}</span>
              <input
                aria-label="Playback position"
                type="range"
                min="0"
                max={player.duration || 1}
                step="0.1"
                disabled={!current}
                value={Math.min(player.time, player.duration || 1)}
                onChange={(e) => player.seek(Number(e.target.value))}
                style={
                  {
                    "--progress": `${player.duration ? (player.time / player.duration) * 100 : 0}%`,
                  } as React.CSSProperties
                }
              />
              <span>{formatTime(player.duration)}</span>
            </div>
          </div>
          <div className="player-tools">
            <IconButton
              label="Queue"
              active={queue}
              onClick={() => setQueue(!queue)}
            >
              <ListMusic size={20} />
            </IconButton>
            <IconButton
              label={s.muted ? "Unmute" : "Mute"}
              onClick={() => dispatch({ type: "mute" })}
            >
              {s.muted || s.volume === 0 ? (
                <VolumeX size={19} />
              ) : (
                <Volume2 size={19} />
              )}
            </IconButton>
            <input
              aria-label="Volume"
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={s.muted ? 0 : s.volume}
              onChange={(e) =>
                dispatch({ type: "volume", value: Number(e.target.value) })
              }
              style={
                {
                  "--progress": `${(s.muted ? 0 : s.volume) * 100}%`,
                } as React.CSSProperties
              }
            />
          </div>
        </footer>
      </div>
      <audio
        ref={player.audio}
        onTimeUpdate={player.update}
        onEnded={() => dispatch({ type: "ended" })}
        onError={player.fail}
        preload="metadata"
      />
      {dialog !== undefined && (
        <PlaylistDialog
          playlist={dialog}
          onClose={() => setDialog(undefined)}
        />
      )}
      <div className="status-stack" aria-live="polite">
        {storageError && <div className="toast error">{storageError}</div>}
        {toast && (
          <div className="toast">
            <Check size={18} />
            {toast}
          </div>
        )}
      </div>
    </C.Provider>
  );
}
