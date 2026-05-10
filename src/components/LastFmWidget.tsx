import { useEffect, useState } from "react";
import { Music2, ExternalLink, BarChart2, ChevronDown } from "lucide-react";

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

function useLastFm(username: string) {
  const [recent, setRecent] = useState<LastFmTrack[]>([]);
  const [topArtists, setTopArtists] = useState<LastFmTopArtist[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!username) return;
    const key = import.meta.env.VITE_LASTFM_API_KEY || "";
    if (!key) { setLoading(false); setError(true); return; }

    setLoading(true);
    setError(false);

    const recentUrl = `https://ws.audioscrobbler.com/2.0/?method=user.getrecenttracks&user=${username}&limit=8&api_key=${key}&format=json`;
    const artistsUrl = `https://ws.audioscrobbler.com/2.0/?method=user.gettopartists&user=${username}&period=1month&limit=5&api_key=${key}&format=json`;

    Promise.all([
      fetch(recentUrl).then(r => r.json()),
      fetch(artistsUrl).then(r => r.json()),
    ]).then(([r, a]) => {
      setRecent(r?.recenttracks?.track || []);
      setTopArtists(a?.topartists?.artist || []);
    }).catch(() => setError(true)).finally(() => setLoading(false));
  }, [username]);

  const nowPlaying = recent[0]?.["@attr"]?.nowplaying === "true" ? recent[0] : null;
  return { recent, topArtists, loading, error, nowPlaying };
}

/* ── Compact card shown in the connections grid ── */
export function LastFmCard({
  username,
  fallbackUrl,
}: {
  username: string;
  fallbackUrl?: string;
}) {
  const [expanded, setExpanded] = useState(false);
  const { recent, topArtists, loading, error, nowPlaying } = useLastFm(username);

  if (!username) return null;

  const displayTrack = nowPlaying ?? recent[0];
  const art = displayTrack ? getImg(displayTrack.image) : "";

  return (
    <div className="rounded-2xl paper paper-text overflow-hidden">
      {/* ── collapsed header — always visible ── */}
      <button
        onClick={() => setExpanded(e => !e)}
        className="w-full p-4 flex items-center gap-3 text-left hover:bg-black/5 transition-colors"
      >
        {/* album art or icon */}
        <div className="relative flex-shrink-0">
          {art ? (
            <img src={art} alt="" className="w-12 h-12 rounded-xl object-cover" />
          ) : (
            <div className="w-12 h-12 rounded-xl flex items-center justify-center palette-accent-bg">
              <Music2 size={20} />
            </div>
          )}
          {nowPlaying && (
            <span className="absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full flex items-center justify-center"
              style={{ background: "var(--p-accent)" }}>
              <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
            </span>
          )}
        </div>

        <div className="min-w-0 flex-1">
          <div className="text-[10px] uppercase tracking-widest font-mono paper-text-muted">
            {nowPlaying ? "scrobbling now" : "last scrobbled"}
          </div>
          {loading ? (
            <div className="text-sm paper-text-muted italic">loading...</div>
          ) : error ? (
            <div className="font-semibold paper-text" style={{ fontFamily: "'Shadows Into Light', cursive", fontSize: 20 }}>
              last.fm
            </div>
          ) : displayTrack ? (
            <>
              <div className="font-semibold paper-text truncate" style={{ fontFamily: "'Shadows Into Light', cursive", fontSize: 20 }}>
                {displayTrack.name}
              </div>
              <div className="text-xs paper-text-muted truncate">{displayTrack.artist["#text"]}</div>
            </>
          ) : (
            <div className="font-semibold paper-text" style={{ fontFamily: "'Shadows Into Light', cursive", fontSize: 20 }}>
              nothing yet
            </div>
          )}
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          {fallbackUrl && (
            <a
              href={fallbackUrl}
              target="_blank"
              rel="noreferrer"
              className="p-1 rounded hover:bg-black/10 transition-colors"
              onClick={e => e.stopPropagation()}
              title="open last.fm"
            >
              <ExternalLink size={13} className="paper-text-muted" />
            </a>
          )}
          <ChevronDown
            size={16}
            className="paper-text-muted transition-transform duration-200"
            style={{ transform: expanded ? "rotate(180deg)" : "rotate(0deg)" }}
          />
        </div>
      </button>

      {/* ── expanded panel ── */}
      <div
        className="overflow-hidden transition-all duration-300"
        style={{ maxHeight: expanded ? "600px" : "0px" }}
      >
        <div className="px-4 pb-4 space-y-4">
          {loading ? (
            <div className="text-center py-4 paper-text-muted italic text-sm">loading scrobbles...</div>
          ) : (
            <>
              {/* recent tracks */}
              <div>
                <div className="text-[10px] uppercase tracking-widest font-mono paper-text-muted mb-2">recent tracks</div>
                <div className="space-y-1">
                  {recent.slice(nowPlaying ? 1 : 0, 7).map((track, i) => (
                    <a
                      key={i}
                      href={track.url}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center gap-2 p-1 rounded hover:bg-black/5 transition-colors group"
                    >
                      {getImg(track.image, "small") ? (
                        <img src={getImg(track.image, "small")} alt="" className="w-8 h-8 rounded object-cover flex-shrink-0" />
                      ) : (
                        <div className="w-8 h-8 rounded flex-shrink-0 palette-accent-bg flex items-center justify-center">
                          <Music2 size={12} />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="text-xs font-medium paper-text truncate" style={{ fontFamily: "'Indie Flower', cursive" }}>
                          {track.name}
                        </div>
                        <div className="text-[10px] paper-text-muted truncate">{track.artist["#text"]}</div>
                      </div>
                      {track.date && (
                        <span className="text-[10px] paper-text-muted font-mono flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                          {new Date(parseInt(track.date.uts) * 1000).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                        </span>
                      )}
                    </a>
                  ))}
                </div>
              </div>

              {/* top artists this month */}
              {topArtists.length > 0 && (
                <div>
                  <div className="text-[10px] uppercase tracking-widest font-mono paper-text-muted mb-2">top artists · this month</div>
                  <div className="space-y-1">
                    {topArtists.map((artist, i) => (
                      <a
                        key={i}
                        href={artist.url}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center gap-2 p-1 rounded hover:bg-black/5 transition-colors"
                      >
                        {getImg(artist.image, "small") ? (
                          <img src={getImg(artist.image, "small")} alt="" className="w-8 h-8 rounded-full object-cover flex-shrink-0" />
                        ) : (
                          <div className="w-8 h-8 rounded-full flex-shrink-0 palette-accent-bg flex items-center justify-center text-xs font-bold"
                            style={{ color: "var(--p-accent-contrast)" }}>
                            {artist.name[0]}
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <div className="text-xs font-medium paper-text truncate" style={{ fontFamily: "'Indie Flower', cursive" }}>
                            {artist.name}
                          </div>
                        </div>
                        <div className="flex items-center gap-1 text-[10px] paper-text-muted flex-shrink-0">
                          <BarChart2 size={10} />
                          {parseInt(artist.playcount).toLocaleString()}
                        </div>
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

/* ── Standalone section widget (kept for LastFmSection if needed) ── */
export function LastFmWidget({ username }: { username: string }) {
  return (
    <LastFmCard
      username={username}
      fallbackUrl={`https://www.last.fm/user/${username}`}
    />
  );
}
