import { useEffect, useState } from "react";
import { Music2, ExternalLink, BarChart2, ChevronDown, ChevronRight } from "lucide-react";

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
              recentTracks.map((track, i) => (
                <a
                  key={i}
                  href={track.url}
                  target="_blank"
                  rel="noreferrer"
                  className="flex-shrink-0 w-36 group"
                  style={{ scrollSnapAlign: "start" }}
                >
                  <div className="paper p-2 rounded-lg hover:bg-black/5 transition-colors">
                    {getImg(track.image) ? (
                      <img 
                        src={getImg(track.image)} 
                        alt="" 
                        className="w-full aspect-square rounded object-cover mb-2"
                      />
                    ) : (
                      <div className="w-full aspect-square rounded palette-accent-bg flex items-center justify-center mb-2">
                        <Music2 size={20} />
                      </div>
                    )}
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
              ))
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
