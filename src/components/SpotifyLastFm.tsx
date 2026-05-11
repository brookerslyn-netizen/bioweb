import { useEffect, useState, useRef, useMemo } from "react";
import { Music2, ExternalLink, BarChart2, ChevronDown, ChevronRight, Play, Pause, Loader2, Info, Mic2 } from "lucide-react";
import { useLanyard, type LanyardSpotify } from "./parts";

const API_BASE = import.meta.env.VITE_API_URL || (import.meta.env.PROD ? "/api" : "http://localhost:3001/api");
const PLAY_YT_TRACK_EVENT = "play-yt-track";

interface LastFmTrack {
  name: string;
  artist: { "#text": string };
  album: { "#text": string };
  image: { "#text": string; size: string }[];
  url: string;
  "@attr"?: { nowplaying?: string };
  date?: { "#text": string; uts: string };
}

interface LastFmTopArtist {
  name: string;
  playcount: string;
  url: string;
  image: { "#text": string; size: string }[];
}

function getImg(images: { "#text": string; size: string }[], size = "medium") {
  return images?.find(i => i.size === size)?.["#text"] || images?.[images.length - 1]?.["#text"] || "";
}

/** Pick the best available track/album cover from Last.fm's size list.
 *  Walks from largest to smallest; returns the first non-empty non-placeholder. */
function getBestCover(images: { "#text": string; size: string }[]): string {
  const order = ["mega", "extralarge", "large", "medium", "small"];
  for (const size of order) {
    const url = images?.find(i => i.size === size)?.["#text"];
    if (url && !isLastFmPlaceholder(url)) return url;
  }
  return "";
}

/** Last.fm serves a known placeholder PNG when an artist has no real photo.
 *  Detect it by the shared hash in the filename so we can fall back to Deezer. */
function isLastFmPlaceholder(url: string): boolean {
  if (!url) return true;
  return /2a96cbd8b46e442fc41c2b86b821562f|default_avatar|\/noimage\//.test(url);
}

interface LastFmUserInfo {
  playcount: string;
  registered: { unixtime: string; "#text": string | number };
  url: string;
  name: string;
}

interface SpotifyLastFmProps {
  username: string;
  spotifyUrl: string;
  discordId?: string;
}

export function SpotifyLastFm({ username, spotifyUrl, discordId }: SpotifyLastFmProps) {
  // Subscribe to Lanyard so we can prefer live Discord Spotify activity over
  // Last.fm's scrobble (Last.fm is ~30s stale and doesn't know the playback
  // position within the track).
  const lanyard = useLanyard(discordId || "");
  const liveSpotify: LanyardSpotify | null =
    lanyard?.listening_to_spotify && lanyard.spotify ? lanyard.spotify : null;
  const [nowPlaying, setNowPlaying] = useState<LastFmTrack | null>(null);
  const [recent, setRecent] = useState<LastFmTrack[]>([]);
  const [topArtists, setTopArtists] = useState<LastFmTopArtist[]>([]);
  const [userInfo, setUserInfo] = useState<LastFmUserInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [showRecents, setShowRecents] = useState(false);
  const [showArtists, setShowArtists] = useState(false);
  const [playingTrackUrl, setPlayingTrackUrl] = useState<string | null>(null);
  const [searchingTrackUrl, setSearchingTrackUrl] = useState<string | null>(null);
  // Deezer-resolved artist images keyed by artist name (lowercased). Filled in
  // after topArtists loads, because Last.fm mostly returns placeholder images.
  const [artistImages, setArtistImages] = useState<Record<string, string>>({});
  // Deezer-resolved album covers keyed by "artist||track". Filled in when a
  // recent track has no large cover available from Last.fm.
  const [trackCovers, setTrackCovers] = useState<Record<string, string>>({});
  const playingYtId = useRef<string | null>(null);

  useEffect(() => {
    if (!username) return;
    setLoading(true);

    const key = import.meta.env.VITE_LASTFM_API_KEY || "";
    if (!key) { setLoading(false); return; }

    const fetchData = () => {
      const recentUrl = `https://ws.audioscrobbler.com/2.0/?method=user.getrecenttracks&user=${username}&limit=10&api_key=${key}&format=json`;
      const artistsUrl = `https://ws.audioscrobbler.com/2.0/?method=user.gettopartists&user=${username}&period=1month&limit=10&api_key=${key}&format=json`;
      const infoUrl = `https://ws.audioscrobbler.com/2.0/?method=user.getinfo&user=${username}&api_key=${key}&format=json`;

      Promise.all([
        fetch(recentUrl).then(r => r.json()),
        fetch(artistsUrl).then(r => r.json()),
        fetch(infoUrl).then(r => r.json()),
      ]).then(([r, a, info]) => {
        const tracks = r?.recenttracks?.track || [];
        setRecent(tracks);
        setTopArtists(a?.topartists?.artist || []);
        // user.getinfo returns { user: {...} }
        const u = info?.user;
        if (u && u.playcount) {
          setUserInfo(u as LastFmUserInfo);
        } else if (info?.error) {
          console.warn("[SpotifyLastFm] user.getinfo error:", info.error, info.message);
        }
        // Check for now playing - Last.fm returns @attr with nowplaying="true" for currently playing track
        const firstTrack = tracks[0];
        const isNowPlaying = firstTrack?.["@attr"]?.nowplaying === "true" || firstTrack?.["@attr"]?.nowplaying === true;
        setNowPlaying(isNowPlaying ? firstTrack : null);
      }).catch((err) => {
        console.warn("[SpotifyLastFm] fetch error:", err);
      }).finally(() => setLoading(false));
    };

    fetchData();
    // Refresh now playing status every 30 seconds
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, [username]);

  // Resolve album covers via Deezer for any recent track that Last.fm left
  // without a usable cover (no image or only a tiny placeholder).
  useEffect(() => {
    if (!recent.length) return;
    let cancelled = false;

    const needed = recent
      .filter((t) => !getBestCover(t.image))
      .map((t) => ({
        artist: t.artist?.["#text"] || "",
        track: t.name,
        key: `${(t.artist?.["#text"] || "").toLowerCase()}||${t.name.toLowerCase()}`,
      }))
      .filter((t) => t.artist && t.track);

    if (needed.length === 0) return;

    (async () => {
      const results = await Promise.all(
        needed.map(async ({ artist, track, key }) => {
          try {
            const r = await fetch(
              `${API_BASE}/track-cover?artist=${encodeURIComponent(artist)}&track=${encodeURIComponent(track)}`,
            );
            if (!r.ok) return [key, ""] as const;
            const data = await r.json();
            return [key, data.url || ""] as const;
          } catch {
            return [key, ""] as const;
          }
        }),
      );
      if (cancelled) return;
      setTrackCovers((prev) => {
        const next = { ...prev };
        for (const [key, url] of results) if (url) next[key] = url;
        return next;
      });
    })();

    return () => { cancelled = true; };
  }, [recent]);

  // Resolve artist profile images via Deezer for any entry that Last.fm left
  // as a placeholder. Runs whenever the top-artists list changes.
  useEffect(() => {
    if (!topArtists.length) return;
    let cancelled = false;

    const needed = topArtists
      .filter((a) => isLastFmPlaceholder(getImg(a.image, "medium")))
      .map((a) => a.name);

    if (needed.length === 0) return;

    (async () => {
      const results = await Promise.all(
        needed.map(async (name) => {
          try {
            const r = await fetch(`${API_BASE}/artist-image?name=${encodeURIComponent(name)}`);
            if (!r.ok) return [name, ""] as const;
            const data = await r.json();
            return [name, data.url || ""] as const;
          } catch {
            return [name, ""] as const;
          }
        }),
      );
      if (cancelled) return;
      setArtistImages((prev) => {
        const next = { ...prev };
        for (const [name, url] of results) if (url) next[name.toLowerCase()] = url;
        return next;
      });
    })();

    return () => { cancelled = true; };
  }, [topArtists]);

  // Listen for music player stopping to clear playing indicator
  useEffect(() => {
    const onStop = () => {
      setPlayingTrackUrl(null);
      playingYtId.current = null;
    };
    window.addEventListener("yt-track-ended", onStop);
    return () => window.removeEventListener("yt-track-ended", onStop);
  }, []);

  const handlePlayTrack = async (track: LastFmTrack, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    const trackKey = track.url;
    
    // If already playing this track, stop it
    if (playingTrackUrl === trackKey) {
      window.dispatchEvent(new CustomEvent(PLAY_YT_TRACK_EVENT, { detail: null }));
      setPlayingTrackUrl(null);
      playingYtId.current = null;
      return;
    }

    setSearchingTrackUrl(trackKey);
    try {
      const query = encodeURIComponent(`${track.name} ${track.artist["#text"]}`);
      const res = await fetch(`${API_BASE}/youtube/search?q=${query}`);
      if (!res.ok) throw new Error("Search failed");
      const data = await res.json();

      playingYtId.current = data.videoId;
      setPlayingTrackUrl(trackKey);
      setShowRecents(true); // Keep recents open while playing

      // Tell MusicPlayer to load and autoplay this video
      window.dispatchEvent(
        new CustomEvent(PLAY_YT_TRACK_EVENT, {
          detail: { videoId: data.videoId, title: track.name, artist: track.artist["#text"] },
        })
      );
    } catch {
      // silently fail
    } finally {
      setSearchingTrackUrl(null);
    }
  };

  const recentTracks = nowPlaying ? recent.slice(1) : recent;

  // Unified "what's playing right now" view — Lanyard (live Discord Spotify
  // activity with exact position) wins over Last.fm (30s-stale scrobbles).
  const activeTrack = useMemo(() => {
    if (liveSpotify) {
      return {
        source: "lanyard" as const,
        name: liveSpotify.song || "",
        artist: liveSpotify.artist || "",
        album: liveSpotify.album || "",
        cover: liveSpotify.album_art_url || "",
        spotifyTrackId: liveSpotify.track_id || "",
        spotifyUrl: liveSpotify.track_id
          ? `https://open.spotify.com/track/${liveSpotify.track_id}`
          : "",
        startedAtMs: liveSpotify.timestamps?.start ?? 0,
        endsAtMs: liveSpotify.timestamps?.end ?? 0,
      };
    }
    if (nowPlaying) {
      return {
        source: "lastfm" as const,
        name: nowPlaying.name,
        artist: nowPlaying.artist["#text"],
        album: nowPlaying.album["#text"] || "",
        cover: getBestCover(nowPlaying.image),
        spotifyTrackId: "",
        spotifyUrl: "",
        startedAtMs: 0,
        endsAtMs: 0,
      };
    }
    return null;
  }, [liveSpotify, nowPlaying]);

  return (
    <div className="rounded-2xl p-4 paper paper-text">
      {/* Header / Now Playing */}
      <div className="flex items-center gap-3">
        {activeTrack?.cover ? (
          <img
            src={activeTrack.cover}
            alt=""
            className="w-12 h-12 rounded-xl object-cover animate-pulse"
          />
        ) : (
          <div className="w-12 h-12 rounded-xl flex items-center justify-center palette-accent-bg">
            <Music2 size={20} />
          </div>
        )}
        <div className="min-w-0 flex-1">
          <div className="text-[12px] uppercase tracking-widest font-mono paper-text-muted flex items-center gap-1.5">
            {activeTrack ? (
              <>
                <span>▶ now playing</span>
                {activeTrack.source === "lanyard" && (
                  <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full" style={{ background: "rgba(29,185,84,0.18)", color: "#1db954" }}>
                    <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: "#1db954" }} />
                    live
                  </span>
                )}
              </>
            ) : (
              <span>spotify</span>
            )}
          </div>
          <div
            className="font-semibold paper-text truncate"
            style={{ fontFamily: "'Shadows Into Light', cursive", fontSize: 22 }}
          >
            {activeTrack ? activeTrack.name : "not playing"}
          </div>
          <div className="text-sm paper-text-muted truncate">
            {activeTrack
              ? `${activeTrack.artist}${activeTrack.album ? ` — ${activeTrack.album}` : ""}`
              : "not listening right now"}
          </div>
        </div>
        {/* play-along button — Lanyard gives us the exact Spotify position via
            timestamps.start, so for the live source we can seek precisely.
            For Last.fm we fall back to /api/spotify/now-playing as before. */}
        {activeTrack && activeTrack.source === "lanyard" && (
          <LanyardPlayAlong active={activeTrack} />
        )}
        {activeTrack && activeTrack.source === "lastfm" && nowPlaying && (
          <NowPlayingPlayAlong
            track={nowPlaying}
            isPlaying={playingTrackUrl === nowPlaying.url}
            isSearching={searchingTrackUrl === nowPlaying.url}
            onPlay={handlePlayTrack}
          />
        )}
        <a
          href={spotifyUrl}
          target="_blank"
          rel="noreferrer"
          className="flex-shrink-0 p-2 rounded-lg hover:bg-black/10 transition-colors"
          title="visit my spotify"
        >
          <ExternalLink size={14} className="paper-text-muted" />
        </a>
      </div>

      {/* Lyrics panel — only shown when we have a live Spotify track id from
          Lanyard (aureal.dev lyrics need the Spotify track id). */}
      {activeTrack?.source === "lanyard" && activeTrack.spotifyTrackId && (
        <LyricsPanel
          trackId={activeTrack.spotifyTrackId}
          startedAtMs={activeTrack.startedAtMs}
        />
      )}

      {/* Scrobble stats — total plays since account creation, with listen-time tooltip */}
      {userInfo && parseInt(userInfo.playcount) > 0 && (
        <ScrobbleStats info={userInfo} />
      )}

      {/* Expandable Toggle Buttons */}
      <div className="mt-3 flex gap-2">
        <button
          onClick={() => setShowRecents(!showRecents)}
          className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs font-mono uppercase tracking-wider border transition-all"
          style={{
            background: showRecents ? "var(--p-accent)" : "transparent",
            color: showRecents ? "var(--p-accent-contrast)" : "var(--paper-ink-soft)",
            borderColor: showRecents ? "transparent" : "rgba(0,0,0,0.15)",
          }}
        >
          {showRecents ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
          recent tracks
        </button>
        <button
          onClick={() => setShowArtists(!showArtists)}
          className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs font-mono uppercase tracking-wider border transition-all"
          style={{
            background: showArtists ? "var(--p-accent)" : "transparent",
            color: showArtists ? "var(--p-accent-contrast)" : "var(--paper-ink-soft)",
            borderColor: showArtists ? "transparent" : "rgba(0,0,0,0.15)",
          }}
        >
          {showArtists ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
          top artists
        </button>
      </div>

      {/* Recent Tracks - Horizontally Scrollable */}
      {showRecents && (
        <div className="mt-3">
          <div 
            className="flex gap-3 overflow-x-auto pb-3 px-1 scrollbar-hide cursor-grab active:cursor-grabbing"
            style={{ 
              scrollbarWidth: "none", 
              msOverflowStyle: "none",
              scrollSnapType: "x mandatory",
              WebkitOverflowScrolling: "touch"
            }}
          >
            {loading ? (
              <div className="text-center py-4 paper-text-muted italic text-sm flex-shrink-0">loading...</div>
            ) : recentTracks.length === 0 ? (
              <div className="text-center py-4 paper-text-muted italic text-sm flex-shrink-0">no recent tracks</div>
            ) : (
              recentTracks.map((track, i) => {
                const isSearching = searchingTrackUrl === track.url;
                const isPlaying = playingTrackUrl === track.url;
                const isActive = isPlaying || isSearching;
                const lfmCover = getBestCover(track.image);
                const coverKey = `${(track.artist?.["#text"] || "").toLowerCase()}||${track.name.toLowerCase()}`;
                const coverSrc = lfmCover || trackCovers[coverKey] || "";
                return (
                  <div
                    key={`${track.url}-${i}`}
                    className="flex-shrink-0 w-36 group relative"
                    style={{ scrollSnapAlign: "start" }}
                  >
                    <a
                      href={track.url}
                      target="_blank"
                      rel="noreferrer"
                      className="block"
                    >
                      <div
                        className="paper p-2 rounded-lg hover:bg-black/5 transition-colors relative"
                        style={
                          isActive
                            ? { outline: "2px solid var(--p-accent)", outlineOffset: "-2px" }
                            : undefined
                        }
                      >
                        <div className="relative mb-2">
                          {coverSrc ? (
                            <img
                              src={coverSrc}
                              alt=""
                              loading="lazy"
                              className="w-full aspect-square rounded object-cover"
                            />
                          ) : (
                            <div className="w-full aspect-square rounded palette-accent-bg flex items-center justify-center">
                              <Music2 size={20} />
                            </div>
                          )}
                          {/* single play/pause overlay — always visible when active, hover-only otherwise */}
                          <button
                            onClick={(e) => handlePlayTrack(track, e)}
                            className={`absolute inset-0 flex items-center justify-center bg-black/40 rounded transition-opacity duration-150 ${isActive ? "opacity-100" : "opacity-0 group-hover:opacity-100"}`}
                          >
                            <div className="w-10 h-10 rounded-full palette-accent-bg flex items-center justify-center shadow-lg">
                              {isSearching ? (
                                <Loader2 size={20} className="animate-spin" />
                              ) : isPlaying ? (
                                <Pause size={20} />
                              ) : (
                                <Play size={20} className="ml-1" />
                              )}
                            </div>
                          </button>
                        </div>
                        <div 
                          className="text-sm font-medium paper-text truncate" 
                          style={{ fontFamily: "'Indie Flower', cursive" }}
                          title={track.name}
                        >
                          {track.name}
                        </div>
                        <div className="text-[12px] paper-text-muted truncate" title={track.artist["#text"]}>
                          {track.artist["#text"]}
                        </div>
                        {track.date && (
                          <div className="text-[11px] paper-text-muted mt-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            {new Date(parseInt(track.date.uts) * 1000).toLocaleDateString("en-US", { 
                              month: "short", 
                              day: "numeric" 
                            })}
                          </div>
                        )}
                      </div>
                    </a>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* Top Artists - Horizontally Scrollable */}
      {showArtists && (
        <div className="mt-3">
          <div 
            className="flex gap-3 overflow-x-auto pb-3 px-1 scrollbar-hide cursor-grab active:cursor-grabbing"
            style={{ 
              scrollbarWidth: "none", 
              msOverflowStyle: "none",
              scrollSnapType: "x mandatory",
              WebkitOverflowScrolling: "touch"
            }}
          >
            {loading ? (
              <div className="text-center py-4 paper-text-muted italic text-sm flex-shrink-0">loading...</div>
            ) : topArtists.length === 0 ? (
              <div className="text-center py-4 paper-text-muted italic text-sm flex-shrink-0">no top artists</div>
            ) : (
              topArtists.map((artist, i) => {
                const lfmImg = getImg(artist.image, "medium");
                const resolved = artistImages[artist.name.toLowerCase()];
                // Prefer Deezer-resolved image when Last.fm returned a placeholder
                const imgSrc = !isLastFmPlaceholder(lfmImg) ? lfmImg : resolved || "";
                return (
                  <a
                    key={i}
                    href={artist.url}
                    target="_blank"
                    rel="noreferrer"
                    className="flex-shrink-0 w-28 group"
                    style={{ scrollSnapAlign: "start" }}
                  >
                    <div className="paper p-2 rounded-lg hover:bg-black/5 transition-colors text-center">
                      {imgSrc ? (
                        <img
                          src={imgSrc}
                          alt=""
                          loading="lazy"
                          className="w-16 h-16 rounded-full object-cover mx-auto mb-2"
                        />
                      ) : (
                        <div
                          className="w-16 h-16 rounded-full mx-auto mb-2 palette-accent-bg flex items-center justify-center text-lg font-bold"
                          style={{ color: "var(--p-accent-contrast)" }}
                        >
                          {artist.name[0]}
                        </div>
                      )}
                      <div
                        className="text-sm font-medium paper-text truncate"
                        style={{ fontFamily: "'Indie Flower', cursive" }}
                        title={artist.name}
                      >
                        {artist.name}
                      </div>
                      <div className="flex items-center justify-center gap-1 text-[12px] paper-text-muted mt-1">
                        <BarChart2 size={10} />
                        {parseInt(artist.playcount).toLocaleString()}
                      </div>
                    </div>
                  </a>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}

/* ===================== Scrobble stats ===================== */

function formatInt(n: number): string {
  return n.toLocaleString("en-US");
}

/** Render a condensed duration from a total in minutes — "X days, Y hours"
 *  style readout, auto-picking the biggest unit. */
function humanizeMinutes(totalMinutes: number): string {
  const days = Math.floor(totalMinutes / (60 * 24));
  if (days >= 2) {
    const hours = Math.floor((totalMinutes - days * 60 * 24) / 60);
    return hours > 0 ? `${formatInt(days)} days, ${hours}h` : `${formatInt(days)} days`;
  }
  const hours = Math.floor(totalMinutes / 60);
  if (hours >= 2) {
    const mins = Math.floor(totalMinutes - hours * 60);
    return mins > 0 ? `${formatInt(hours)}h ${mins}m` : `${formatInt(hours)} hours`;
  }
  return `${formatInt(Math.round(totalMinutes))} minutes`;
}

/* ===================== Play-along button for now-playing ===================== */

function fmtTime(ms: number): string {
  const totalSec = Math.floor(ms / 1000);
  const m = Math.floor(totalSec / 60);
  const s = (totalSec % 60).toString().padStart(2, "0");
  return `${m}:${s}`;
}

function NowPlayingPlayAlong({
  track,
  isPlaying,
  isSearching: parentSearching,
  onPlay,
}: {
  track: LastFmTrack;
  isPlaying: boolean;
  isSearching: boolean;
  onPlay: (track: LastFmTrack, e: React.MouseEvent) => void;
}) {
  const [progressMs, setProgressMs] = useState<number | null>(null);
  const [durationMs, setDurationMs] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const pollingRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Poll the backend for the current playback position every 5s while visible.
  useEffect(() => {
    let cancelled = false;
    const poll = async () => {
      try {
        const r = await fetch(`${API_BASE}/spotify/now-playing`);
        if (!r.ok) return;
        const data = await r.json();
        if (cancelled) return;
        if (data.isPlaying && data.track) {
          setProgressMs(data.progressMs ?? null);
          setDurationMs(data.track.durationMs ?? null);
        } else {
          setProgressMs(null);
          setDurationMs(null);
        }
      } catch { /* ignore */ }
    };
    poll();
    pollingRef.current = setInterval(poll, 5000);
    return () => { cancelled = true; if (pollingRef.current) clearInterval(pollingRef.current); };
  }, [track.url]);

  const handleClick = async (e: React.MouseEvent) => {
    if (isPlaying) {
      // stop
      onPlay(track, e);
      return;
    }

    setLoading(true);
    try {
      // Fetch fresh position right before playing so we're as close as possible
      const r = await fetch(`${API_BASE}/spotify/now-playing`);
      let startSeconds = 0;
      if (r.ok) {
        const data = await r.json();
        if (data.isPlaying && data.progressMs) {
          startSeconds = Math.floor(data.progressMs / 1000);
          setProgressMs(data.progressMs);
          setDurationMs(data.track?.durationMs ?? durationMs);
        }
      }

      // YouTube search
      const query = encodeURIComponent(`${track.name} ${track.artist["#text"]}`);
      const ytRes = await fetch(`${API_BASE}/youtube/search?q=${query}`);
      if (!ytRes.ok) throw new Error("Search failed");
      const ytData = await ytRes.json();

      // Dispatch with startSeconds so MusicPlayer seeks to brook's position
      window.dispatchEvent(
        new CustomEvent(PLAY_YT_TRACK_EVENT, {
          detail: {
            videoId: ytData.videoId,
            title: track.name,
            artist: track.artist["#text"],
            startSeconds,
          },
        }),
      );
    } catch { /* silently fail */ } finally {
      setLoading(false);
    }
  };

  const showTime = progressMs != null && durationMs != null && durationMs > 0;
  const busy = loading || parentSearching;

  return (
    <div className="flex-shrink-0 flex flex-col items-center gap-0.5">
      <button
        onClick={handleClick}
        title={isPlaying ? "stop" : "play along"}
        aria-label={isPlaying ? "stop playback" : "play along"}
        className="w-10 h-10 rounded-full flex items-center justify-center shadow-md hover:scale-105 active:scale-95 transition-transform"
        style={{ background: "var(--p-accent)", color: "var(--p-accent-contrast)" }}
      >
        {busy ? (
          <Loader2 size={16} className="animate-spin" />
        ) : isPlaying ? (
          <Pause size={16} />
        ) : (
          <Play size={16} className="ml-0.5" />
        )}
      </button>
      {showTime && (
        <span className="text-[12px] font-mono paper-text-muted tabular-nums whitespace-nowrap">
          {fmtTime(progressMs)} / {fmtTime(durationMs)}
        </span>
      )}
    </div>
  );
}

function ScrobbleStats({ info }: { info: LastFmUserInfo }) {
  const plays = parseInt(info.playcount, 10) || 0;
  const registeredSec = parseInt(info.registered?.unixtime || "0", 10) || 0;
  const registeredDate = registeredSec ? new Date(registeredSec * 1000) : null;
  const years = registeredDate
    ? Math.max(0, (Date.now() - registeredDate.getTime()) / (1000 * 60 * 60 * 24 * 365.25))
    : 0;

  // assume average track length ~3 minutes; good enough for a "vibe" readout
  const AVG_MINUTES = 3;
  const totalMinutes = plays * AVG_MINUTES;
  const listenSpan = humanizeMinutes(totalMinutes);

  const sinceLabel = registeredDate
    ? registeredDate.toLocaleDateString("en-US", { month: "short", year: "numeric" })
    : "launch";

  const tooltipText = years >= 0.25
    ? `averaging ~${AVG_MINUTES}-minute tracks, that's the equivalent of listening to music for ${listenSpan}!`
    : `${formatInt(plays)} scrobbles since my account was made`;

  return (
    <div className="mt-3 px-3 py-2 rounded-lg paper-2 paper-text flex items-center gap-2 text-sm md:text-base">
      <BarChart2 size={14} className="paper-text-muted flex-shrink-0" />
      <span style={{ fontFamily: "'Indie Flower', cursive" }}>
        scrobbled{" "}
        <span className="relative group inline-flex items-center gap-1 font-bold">
          <span>{formatInt(plays)}</span>
          <span className="paper-text-muted">tracks</span>
          <Info size={12} className="paper-text-muted cursor-help" />
          {/* hover/focus tooltip */}
          <span
            role="tooltip"
            className="pointer-events-none absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 max-w-[70vw] p-2 rounded text-xs font-mono tracking-normal opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity z-20"
            style={{
              background: "var(--p-surface-strong, #2a2118)",
              color: "var(--p-text, #f5eeda)",
              boxShadow: "0 4px 14px rgba(0,0,0,0.35)",
              fontFamily: "'Indie Flower', cursive",
              fontSize: 13,
              lineHeight: 1.35,
              whiteSpace: "normal",
            }}
          >
            {tooltipText}
          </span>
        </span>
        {" "}since {sinceLabel}
      </span>
    </div>
  );
}

/* ===================== Lanyard play-along ===================== */

type LanyardActive = {
  name: string;
  artist: string;
  album: string;
  cover: string;
  spotifyTrackId: string;
  spotifyUrl: string;
  startedAtMs: number;
  endsAtMs: number;
};

function LanyardPlayAlong({ active }: { active: LanyardActive }) {
  const [playing, setPlaying] = useState(false);
  const [searching, setSearching] = useState(false);
  const [, setTick] = useState(0);

  // listen for "track ended" broadcasts from MusicPlayer so our button state
  // resets when a different track takes over.
  useEffect(() => {
    const onStop = () => setPlaying(false);
    window.addEventListener("yt-track-ended", onStop);
    return () => window.removeEventListener("yt-track-ended", onStop);
  }, []);

  // re-render every second so the position readout keeps ticking without the
  // entire widget's fetch cycle.
  useEffect(() => {
    const iv = setInterval(() => setTick((t) => t + 1), 1000);
    return () => clearInterval(iv);
  }, []);

  const now = Date.now();
  const elapsedMs = Math.max(0, now - active.startedAtMs);
  const durationMs = Math.max(0, active.endsAtMs - active.startedAtMs);
  const progressMs = durationMs > 0 ? Math.min(elapsedMs, durationMs) : elapsedMs;

  const handleClick = async () => {
    if (playing) {
      window.dispatchEvent(new CustomEvent(PLAY_YT_TRACK_EVENT, { detail: null }));
      setPlaying(false);
      return;
    }
    setSearching(true);
    try {
      const startSeconds = Math.max(0, Math.floor((Date.now() - active.startedAtMs) / 1000));
      const query = encodeURIComponent(`${active.name} ${active.artist}`);
      const ytRes = await fetch(`${API_BASE}/youtube/search?q=${query}`);
      if (!ytRes.ok) throw new Error("Search failed");
      const ytData = await ytRes.json();
      window.dispatchEvent(
        new CustomEvent(PLAY_YT_TRACK_EVENT, {
          detail: {
            videoId: ytData.videoId,
            title: active.name,
            artist: active.artist,
            startSeconds,
          },
        }),
      );
      setPlaying(true);
    } catch { /* silently fail */ } finally {
      setSearching(false);
    }
  };

  return (
    <div className="flex-shrink-0 flex flex-col items-center gap-0.5">
      <button
        onClick={handleClick}
        title={playing ? "stop" : "play along"}
        aria-label={playing ? "stop playback" : "play along"}
        className="w-10 h-10 rounded-full flex items-center justify-center shadow-md hover:scale-105 active:scale-95 transition-transform"
        style={{ background: "var(--p-accent)", color: "var(--p-accent-contrast)" }}
      >
        {searching ? (
          <Loader2 size={16} className="animate-spin" />
        ) : playing ? (
          <Pause size={16} />
        ) : (
          <Play size={16} className="ml-0.5" />
        )}
      </button>
      {durationMs > 0 && (
        <span className="text-[11px] font-mono paper-text-muted tabular-nums whitespace-nowrap">
          {fmtTime(progressMs)} / {fmtTime(durationMs)}
        </span>
      )}
    </div>
  );
}

/* ===================== Lyrics panel (lyrics.aureal.dev) ===================== */

interface LyricLine { time: number; text: string }

function LyricsPanel({ trackId, startedAtMs }: { trackId: string; startedAtMs: number }) {
  const [lines, setLines] = useState<LyricLine[] | null>(null);
  const [plain, setPlain] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [tick, setTick] = useState(0);
  const listRef = useRef<HTMLDivElement | null>(null);

  // fetch lyrics whenever the track changes
  useEffect(() => {
    let cancelled = false;
    setLines(null);
    setPlain("");
    setLoading(true);
    setOpen(false);
    (async () => {
      try {
        const r = await fetch(`https://lyrics.aureal.dev/api/lyrics/${encodeURIComponent(trackId)}`);
        if (!r.ok) throw new Error("no lyrics");
        const data = await r.json();
        if (cancelled) return;
        // aureal returns either { syncedLyrics, plainLyrics, ... } or similar.
        // We sniff both common shapes so small API tweaks don't break us.
        const synced = data.syncedLyrics || data.synced || data.synced_lyrics;
        const plainText = data.plainLyrics || data.plain || data.plain_lyrics || data.lyrics;
        if (typeof synced === "string" && synced.length > 0) {
          setLines(parseLRC(synced));
        }
        if (typeof plainText === "string") setPlain(plainText);
      } catch { /* ignore */ }
      finally { if (!cancelled) setLoading(false); }
    })();
    return () => { cancelled = true; };
  }, [trackId]);

  // tick every 400ms while the panel is open so the current line advances
  useEffect(() => {
    if (!open) return;
    const iv = setInterval(() => setTick((t) => t + 1), 400);
    return () => clearInterval(iv);
  }, [open]);
  void tick;

  // scroll the active line into view when it changes
  const currentMs = Date.now() - startedAtMs;
  const activeIdx = useMemo(() => {
    if (!lines) return -1;
    let idx = -1;
    for (let i = 0; i < lines.length; i++) {
      if (lines[i].time <= currentMs) idx = i; else break;
    }
    return idx;
  }, [lines, currentMs]);

  useEffect(() => {
    if (!open || activeIdx < 0 || !listRef.current) return;
    const el = listRef.current.querySelector<HTMLElement>(`[data-line="${activeIdx}"]`);
    if (el) el.scrollIntoView({ block: "center", behavior: "smooth" });
  }, [activeIdx, open]);

  if (loading) return null;
  if (!lines && !plain) return null;

  return (
    <div className="mt-3 rounded-lg paper-2 overflow-hidden">
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between gap-2 px-3 py-2 text-xs font-mono uppercase tracking-wider hover:bg-black/5 transition-colors"
        style={{ color: "var(--paper-ink-soft)" }}
      >
        <span className="flex items-center gap-1.5">
          <Mic2 size={12} />
          lyrics {lines ? "· synced" : "· text only"}
        </span>
        {open ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
      </button>

      {open && (
        <div
          ref={listRef}
          className="max-h-56 overflow-y-auto px-3 py-2 space-y-1"
          style={{ scrollbarWidth: "thin" }}
        >
          {lines ? (
            lines.map((line, i) => {
              const isActive = i === activeIdx;
              return (
                <div
                  key={i}
                  data-line={i}
                  className="transition-all duration-200"
                  style={{
                    fontFamily: "'Indie Flower', cursive",
                    fontSize: isActive ? 18 : 14,
                    color: isActive ? "var(--p-text)" : "var(--paper-ink-soft)",
                    opacity: isActive ? 1 : 0.55,
                    fontWeight: isActive ? 600 : 400,
                    lineHeight: 1.4,
                  }}
                >
                  {line.text || "♪"}
                </div>
              );
            })
          ) : (
            <pre
              className="whitespace-pre-wrap paper-text"
              style={{ fontFamily: "'Indie Flower', cursive", fontSize: 14 }}
            >
              {plain}
            </pre>
          )}
        </div>
      )}
    </div>
  );
}

/** Parse an LRC-style string into {time(ms), text} pairs. Drops lines with
 *  no timestamp. Tolerant of Windows/Unix line endings. */
function parseLRC(src: string): LyricLine[] {
  const out: LyricLine[] = [];
  const lineRx = /\[(\d{1,2}):(\d{1,2})(?:\.(\d{1,3}))?\]/g;
  for (const raw of src.split(/\r?\n/)) {
    const text = raw.replace(lineRx, "").trim();
    // reset regex state
    lineRx.lastIndex = 0;
    let m: RegExpExecArray | null;
    const times: number[] = [];
    while ((m = lineRx.exec(raw)) !== null) {
      const mm = parseInt(m[1], 10);
      const ss = parseInt(m[2], 10);
      const ms = m[3] ? parseInt(m[3].padEnd(3, "0").slice(0, 3), 10) : 0;
      times.push(mm * 60000 + ss * 1000 + ms);
    }
    for (const t of times) out.push({ time: t, text });
  }
  out.sort((a, b) => a.time - b.time);
  return out;
}
