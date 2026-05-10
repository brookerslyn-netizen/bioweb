import { useEffect, useState, useRef } from "react";
import { Music2, ExternalLink, BarChart2, ChevronDown, ChevronRight, Play, Pause, Loader2 } from "lucide-react";

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

interface SpotifyLastFmProps {
  username: string;
  spotifyUrl: string;
}

export function SpotifyLastFm({ username, spotifyUrl }: SpotifyLastFmProps) {
  const [nowPlaying, setNowPlaying] = useState<LastFmTrack | null>(null);
  const [recent, setRecent] = useState<LastFmTrack[]>([]);
  const [topArtists, setTopArtists] = useState<LastFmTopArtist[]>([]);
  const [loading, setLoading] = useState(true);
  const [showRecents, setShowRecents] = useState(false);
  const [showArtists, setShowArtists] = useState(false);
  const [playingTrackUrl, setPlayingTrackUrl] = useState<string | null>(null);
  const [searchingTrackUrl, setSearchingTrackUrl] = useState<string | null>(null);
  const playingYtId = useRef<string | null>(null);

  useEffect(() => {
    if (!username) return;
    setLoading(true);

    const key = import.meta.env.VITE_LASTFM_API_KEY || "";
    if (!key) { setLoading(false); return; }

    const fetchData = () => {
      const recentUrl = `https://ws.audioscrobbler.com/2.0/?method=user.getrecenttracks&user=${username}&limit=10&api_key=${key}&format=json`;
      const artistsUrl = `https://ws.audioscrobbler.com/2.0/?method=user.gettopartists&user=${username}&period=1month&limit=10&api_key=${key}&format=json`;

      Promise.all([
        fetch(recentUrl).then(r => r.json()),
        fetch(artistsUrl).then(r => r.json()),
      ]).then(([r, a]) => {
        const tracks = r?.recenttracks?.track || [];
        setRecent(tracks);
        setTopArtists(a?.topartists?.artist || []);
        // Check for now playing - Last.fm returns @attr with nowplaying="true" for currently playing track
        const firstTrack = tracks[0];
        const isNowPlaying = firstTrack?.["@attr"]?.nowplaying === "true" || firstTrack?.["@attr"]?.nowplaying === true;
        setNowPlaying(isNowPlaying ? firstTrack : null);
      }).catch(() => {}).finally(() => setLoading(false));
    };

    fetchData();
    // Refresh now playing status every 30 seconds
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, [username]);

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

  return (
    <div className="rounded-2xl p-4 paper paper-text">
      {/* Header / Now Playing */}
      <div className="flex items-center gap-3">
        {nowPlaying && getImg(nowPlaying.image) ? (
          <img 
            src={getImg(nowPlaying.image)} 
            alt="" 
            className="w-12 h-12 rounded-xl object-cover animate-pulse"
          />
        ) : (
          <div className="w-12 h-12 rounded-xl flex items-center justify-center palette-accent-bg">
            <Music2 size={20} />
          </div>
        )}
        <div className="min-w-0 flex-1">
          <div className="text-[10px] uppercase tracking-widest font-mono paper-text-muted">
            {nowPlaying ? "▶ now playing" : "spotify"}
          </div>
          <div 
            className="font-semibold paper-text truncate" 
            style={{ fontFamily: "'Shadows Into Light', cursive", fontSize: 22 }}
          >
            {nowPlaying ? nowPlaying.name : "not playing"}
          </div>
          <div className="text-xs paper-text-muted truncate">
            {nowPlaying 
              ? `${nowPlaying.artist["#text"]}${nowPlaying.album?.["#text"] ? ` — ${nowPlaying.album["#text"]}` : ""}`
              : "not listening right now"
            }
          </div>
        </div>
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
                const showCorner = isPlaying || isSearching;
                return (
                  <div
                    key={i}
                    className="flex-shrink-0 w-36 group relative"
                    style={{ scrollSnapAlign: "start" }}
                  >
                    {/* Corner indicator — only shown while this track is active */}
                    {showCorner && (
                      <button
                        onClick={(e) => handlePlayTrack(track, e)}
                        className="absolute top-2 right-2 z-10 w-8 h-8 rounded-full palette-accent-bg flex items-center justify-center shadow-lg transition-transform hover:scale-110 active:scale-95"
                      >
                        {isSearching ? (
                          <Loader2 size={16} className="animate-spin" />
                        ) : (
                          <Pause size={16} />
                        )}
                      </button>
                    )}
                    <a
                      href={track.url}
                      target="_blank"
                      rel="noreferrer"
                      className="block"
                    >
                      <div className="paper p-2 rounded-lg hover:bg-black/5 transition-colors relative">
                        <div className="relative mb-2">
                          {getImg(track.image) ? (
                            <img 
                              src={getImg(track.image)} 
                              alt="" 
                              className="w-full aspect-square rounded object-cover"
                            />
                          ) : (
                            <div className="w-full aspect-square rounded palette-accent-bg flex items-center justify-center">
                              <Music2 size={20} />
                            </div>
                          )}
                          {/* Hover play button (controlled purely by group-hover + active state) */}
                          <button
                            onClick={(e) => handlePlayTrack(track, e)}
                            className={`absolute inset-0 flex items-center justify-center bg-black/40 rounded transition-opacity ${showCorner ? "opacity-100" : "opacity-0 group-hover:opacity-100"}`}
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
                          className="text-xs font-medium paper-text truncate" 
                          style={{ fontFamily: "'Indie Flower', cursive" }}
                          title={track.name}
                        >
                          {track.name}
                        </div>
                        <div className="text-[10px] paper-text-muted truncate" title={track.artist["#text"]}>
                          {track.artist["#text"]}
                        </div>
                        {track.date && (
                          <div className="text-[9px] paper-text-muted mt-1 opacity-0 group-hover:opacity-100 transition-opacity">
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
              topArtists.map((artist, i) => (
                <a
                  key={i}
                  href={artist.url}
                  target="_blank"
                  rel="noreferrer"
                  className="flex-shrink-0 w-28 group"
                  style={{ scrollSnapAlign: "start" }}
                >
                  <div className="paper p-2 rounded-lg hover:bg-black/5 transition-colors text-center">
                    {getImg(artist.image, "small") ? (
                      <img 
                        src={getImg(artist.image, "small")} 
                        alt="" 
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
                      className="text-xs font-medium paper-text truncate" 
                      style={{ fontFamily: "'Indie Flower', cursive" }}
                      title={artist.name}
                    >
                      {artist.name}
                    </div>
                    <div className="flex items-center justify-center gap-1 text-[10px] paper-text-muted mt-1">
                      <BarChart2 size={10} />
                      {parseInt(artist.playcount).toLocaleString()}
                    </div>
                  </div>
                </a>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
