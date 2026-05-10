import { useState, useEffect, useRef } from "react";
import { Music, Clock, Play, Pause, Loader2 } from "lucide-react";
import { Reveal, Doodle } from "./parts";

interface Track {
  id: string;
  name: string;
  artist: string;
  album: string;
  image: string;
  playedAt: string;
  duration: number;
  previewUrl: string | null;
}

interface SpotifyRecentProps {
  apiBase: string;
}

// Custom event dispatched to MusicPlayer to take over playback
export const PLAY_YT_TRACK_EVENT = "play-yt-track";

export function SpotifyRecent({ apiBase }: SpotifyRecentProps) {
  const [tracks, setTracks] = useState<Track[]>([]);
  const [loading, setLoading] = useState(true);
  const [connected, setConnected] = useState(false);
  const [searchingId, setSearchingId] = useState<string | null>(null);
  const [playingId, setPlayingId] = useState<string | null>(null);

  // Track the currently playing YT video id so we can show "now playing" state
  const playingYtId = useRef<string | null>(null);

  useEffect(() => {
    fetchRecentTracks();
  }, [apiBase]);

  // Listen for the music player stopping so we can clear the playing indicator
  useEffect(() => {
    const onStop = () => {
      setPlayingId(null);
      playingYtId.current = null;
    };
    window.addEventListener("yt-track-ended", onStop);
    return () => window.removeEventListener("yt-track-ended", onStop);
  }, []);

  const fetchRecentTracks = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${apiBase}/spotify/recent`);

      if (response.status === 401) {
        setConnected(false);
        setLoading(false);
        return;
      }

      if (!response.ok) throw new Error("Failed to fetch tracks");

      const data = await response.json();
      setTracks(data.tracks || []);
      setConnected(true);
    } catch {
      setConnected(false);
    } finally {
      setLoading(false);
    }
  };

  const handleTrackClick = async (track: Track) => {
    // If already playing this track, stop it
    if (playingId === track.id) {
      window.dispatchEvent(new CustomEvent(PLAY_YT_TRACK_EVENT, { detail: null }));
      setPlayingId(null);
      playingYtId.current = null;
      return;
    }

    setSearchingId(track.id);
    try {
      const query = encodeURIComponent(`${track.name} ${track.artist}`);
      const res = await fetch(`${apiBase}/youtube/search?q=${query}`);
      if (!res.ok) throw new Error("Search failed");
      const data = await res.json();

      playingYtId.current = data.videoId;
      setPlayingId(track.id);

      // Tell MusicPlayer to load and autoplay this video
      window.dispatchEvent(
        new CustomEvent(PLAY_YT_TRACK_EVENT, {
          detail: { videoId: data.videoId, title: track.name, artist: track.artist },
        })
      );
    } catch {
      // silently fail — nothing to show
    } finally {
      setSearchingId(null);
    }
  };

  const formatTimeAgo = (dateString: string) => {
    const played = new Date(dateString);
    const now = new Date();
    const diff = Math.floor((now.getTime() - played.getTime()) / 1000 / 60);

    if (diff < 1) return "just now";
    if (diff < 60) return `${diff}m ago`;
    if (diff < 1440) return `${Math.floor(diff / 60)}h ago`;
    return `${Math.floor(diff / 1440)}d ago`;
  };

  if (loading) {
    return (
      <section className="py-4">
        <Reveal>
          <div className="paper p-4">
            <div className="flex items-center gap-2 mb-4">
              <Music className="w-5 h-5 paper-text" />
              <h2 className="text-xl font-bold paper-text" style={{ fontFamily: "'Shadows Into Light', cursive" }}>
                recently played
              </h2>
            </div>
            <div className="text-center py-8 paper-text-muted italic">loading tracks...</div>
          </div>
        </Reveal>
      </section>
    );
  }

  if (!connected) {
    return (
      <section className="py-4">
        <Reveal>
          <div className="paper p-4">
            <div className="flex items-center gap-2 mb-4">
              <Music className="w-5 h-5 paper-text" />
              <h2 className="text-xl font-bold paper-text" style={{ fontFamily: "'Shadows Into Light', cursive" }}>
                recently played
              </h2>
            </div>
            <div className="text-center py-6 paper-text-muted">
              <p className="mb-2">Spotify not connected</p>
              <p className="text-sm">Connect Spotify in admin panel to see recent tracks</p>
            </div>
            <Doodle kind="heart" top="15%" left="85%" size={16} rotate={10} />
            <Doodle kind="arrow" top="80%" left="5%" size={14} rotate={-20} />
          </div>
        </Reveal>
      </section>
    );
  }

  return (
    <section className="py-4">
      <Reveal>
        <div className="paper p-4">
          <div className="flex items-center gap-2 mb-4">
            <Music className="w-5 h-5 paper-text" />
            <h2 className="text-xl font-bold paper-text" style={{ fontFamily: "'Shadows Into Light', cursive" }}>
              recently played
            </h2>
            <span className="text-xs paper-text-muted font-mono ml-auto">click to play</span>
          </div>

          {tracks.length === 0 ? (
            <div className="text-center py-6 paper-text-muted italic">
              no recent tracks - go listen to some music!
            </div>
          ) : (
            <div className="space-y-3">
              {tracks.slice(0, 8).map((track, index) => {
                const isPlaying = playingId === track.id;
                const isSearching = searchingId === track.id;
                return (
                  <div
                    key={track.id}
                    className="flex items-center gap-3 p-2 rounded transition-all cursor-pointer group"
                    style={{
                      background: isPlaying
                        ? "rgba(var(--p-accent-rgb, 0,0,0), 0.08)"
                        : index % 2 === 0
                        ? "rgba(0,0,0,0.03)"
                        : "transparent",
                    }}
                    onClick={() => handleTrackClick(track)}
                  >
                    {track.image && (
                      <div className="relative flex-shrink-0">
                        <img
                          src={track.image}
                          alt={track.album}
                          className="w-12 h-12 rounded object-cover"
                        />
                        <div className="absolute inset-0 flex items-center justify-center bg-black/40 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-150">
                          {isSearching ? (
                            <Loader2 className="w-5 h-5 text-white animate-spin" />
                          ) : isPlaying ? (
                            <Pause className="w-5 h-5 text-white fill-current" />
                          ) : (
                            <Play className="w-5 h-5 text-white fill-current" />
                          )}
                        </div>
                        {isPlaying && (
                          <div className="absolute inset-0 rounded pointer-events-none" style={{ outline: "2px solid var(--p-accent)", outlineOffset: "-2px" }} />
                        )}
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <div
                        className="font-medium paper-text truncate text-sm"
                        style={{
                          fontFamily: "'Indie Flower', cursive",
                          color: isPlaying ? "var(--p-accent)" : undefined,
                        }}
                      >
                        {track.name}
                        {isPlaying && (
                          <span className="ml-2 text-xs font-mono opacity-70 animate-pulse">▶ playing</span>
                        )}
                      </div>
                      <div className="text-xs paper-text-muted truncate">{track.artist}</div>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <span className="text-xs paper-text-muted flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {formatTimeAgo(track.playedAt)}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          <Doodle kind="heart" top="10%" left="90%" size={18} rotate={15} />
          <Doodle kind="arrow" top="85%" left="8%" size={16} rotate={-25} />
        </div>
      </Reveal>
    </section>
  );
}
