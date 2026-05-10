import { useEffect, useState } from "react";
import { Music2, ExternalLink, BarChart2 } from "lucide-react";
import { Reveal, Doodle } from "./parts";

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

interface LastFmTopTrack {
  name: string;
  artist: { name: string };
  playcount: string;
  url: string;
  image: { "#text": string; size: string }[];
}

function getImg(images: { "#text": string; size: string }[], size = "medium") {
  return images?.find(i => i.size === size)?.["#text"] || images?.[images.length - 1]?.["#text"] || "";
}

export function LastFmWidget({ username }: { username: string }) {
  const [recent, setRecent] = useState<LastFmTrack[]>([]);
  const [topArtists, setTopArtists] = useState<LastFmTopArtist[]>([]);
  const [topTracks, setTopTracks] = useState<LastFmTopTrack[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<"recent" | "artists" | "tracks">("recent");

  useEffect(() => {
    if (!username) return;
    setLoading(true);

    const key = import.meta.env.VITE_LASTFM_API_KEY || "";
    if (!key) { setLoading(false); return; }

    const recentUrl = `https://ws.audioscrobbler.com/2.0/?method=user.getrecenttracks&user=${username}&limit=8&api_key=${key}&format=json`;
    const artistsUrl = `https://ws.audioscrobbler.com/2.0/?method=user.gettopartists&user=${username}&period=1month&limit=6&api_key=${key}&format=json`;
    const tracksUrl = `https://ws.audioscrobbler.com/2.0/?method=user.gettoptracks&user=${username}&period=1month&limit=6&api_key=${key}&format=json`;

    Promise.all([
      fetch(recentUrl).then(r => r.json()),
      fetch(artistsUrl).then(r => r.json()),
      fetch(tracksUrl).then(r => r.json()),
    ]).then(([r, a, t]) => {
      setRecent(r?.recenttracks?.track || []);
      setTopArtists(a?.topartists?.artist || []);
      setTopTracks(t?.toptracks?.track || []);
    }).catch(() => {}).finally(() => setLoading(false));
  }, [username]);

  if (!username) return null;

  const nowPlaying = recent[0]?.["@attr"]?.nowplaying === "true" ? recent[0] : null;

  return (
    <section className="px-6 py-8 max-w-4xl mx-auto">
      <Reveal>
        <div className="paper p-5 relative tilt-n1">
          <div className="washi washi-pink" style={{ top: -10, left: 40, transform: "rotate(-5deg)" }} />
          <div className="washi washi-mint" style={{ top: -10, right: 60, transform: "rotate(4deg)" }} />

          {/* header */}
          <div className="flex items-center justify-between flex-wrap gap-2 mb-4">
            <div className="flex items-center gap-2">
              <Music2 className="w-5 h-5 paper-text" />
              <h2 className="paper-text" style={{ fontFamily: "'Shadows Into Light', cursive", fontSize: 28 }}>
                last.fm
              </h2>
              <a
                href={`https://www.last.fm/user/${username}`}
                target="_blank"
                rel="noreferrer"
                className="paper-text-muted hover:paper-text transition-colors"
              >
                <ExternalLink size={13} />
              </a>
            </div>
            <div className="flex gap-1">
              {(["recent", "artists", "tracks"] as const).map(t => (
                <button
                  key={t}
                  onClick={() => setTab(t)}
                  className="px-3 py-1 rounded-full text-xs font-mono uppercase tracking-widest border transition-all"
                  style={{
                    background: tab === t ? "var(--p-accent)" : "transparent",
                    color: tab === t ? "var(--p-accent-contrast)" : "var(--paper-ink-soft)",
                    borderColor: tab === t ? "transparent" : "rgba(0,0,0,0.15)",
                  }}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          {/* now playing banner */}
          {nowPlaying && (
            <div className="mb-3 flex items-center gap-3 px-3 py-2 rounded-lg"
              style={{ background: "rgba(var(--p-accent-rgb,0,0,0),0.08)", border: "1px solid rgba(0,0,0,0.06)" }}>
              {getImg(nowPlaying.image) && (
                <img src={getImg(nowPlaying.image)} alt="" className="w-10 h-10 rounded object-cover flex-shrink-0" />
              )}
              <div className="min-w-0 flex-1">
                <div className="text-[10px] font-mono uppercase tracking-widest" style={{ color: "var(--p-accent)" }}>
                  ▶ scrobbling now
                </div>
                <div className="font-medium paper-text truncate text-sm" style={{ fontFamily: "'Indie Flower', cursive" }}>
                  {nowPlaying.name}
                </div>
                <div className="text-xs paper-text-muted truncate">{nowPlaying.artist["#text"]}</div>
              </div>
            </div>
          )}

          {loading ? (
            <div className="text-center py-6 paper-text-muted italic text-sm">loading scrobbles...</div>
          ) : (
            <>
              {/* recent tracks */}
              {tab === "recent" && (
                <div className="space-y-2">
                  {recent.slice(nowPlaying ? 1 : 0, 8).map((track, i) => (
                    <a
                      key={i}
                      href={track.url}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center gap-3 p-1.5 rounded hover:bg-black/5 transition-colors group"
                    >
                      {getImg(track.image) ? (
                        <img src={getImg(track.image)} alt="" className="w-9 h-9 rounded object-cover flex-shrink-0" />
                      ) : (
                        <div className="w-9 h-9 rounded flex-shrink-0 palette-accent-bg flex items-center justify-center">
                          <Music2 size={14} />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium paper-text truncate" style={{ fontFamily: "'Indie Flower', cursive" }}>
                          {track.name}
                        </div>
                        <div className="text-xs paper-text-muted truncate">{track.artist["#text"]}</div>
                      </div>
                      {track.date && (
                        <span className="text-xs paper-text-muted font-mono flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                          {new Date(parseInt(track.date.uts) * 1000).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                        </span>
                      )}
                    </a>
                  ))}
                </div>
              )}

              {/* top artists */}
              {tab === "artists" && (
                <div className="space-y-2">
                  {topArtists.map((artist, i) => (
                    <a
                      key={i}
                      href={artist.url}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center gap-3 p-1.5 rounded hover:bg-black/5 transition-colors"
                    >
                      {getImg(artist.image, "small") ? (
                        <img src={getImg(artist.image, "small")} alt="" className="w-9 h-9 rounded-full object-cover flex-shrink-0" />
                      ) : (
                        <div className="w-9 h-9 rounded-full flex-shrink-0 palette-accent-bg flex items-center justify-center text-sm font-bold" style={{ color: "var(--p-accent-contrast)" }}>
                          {artist.name[0]}
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium paper-text truncate" style={{ fontFamily: "'Indie Flower', cursive" }}>
                          {artist.name}
                        </div>
                      </div>
                      <div className="flex items-center gap-1 text-xs paper-text-muted flex-shrink-0">
                        <BarChart2 size={11} />
                        {parseInt(artist.playcount).toLocaleString()}
                      </div>
                    </a>
                  ))}
                </div>
              )}

              {/* top tracks */}
              {tab === "tracks" && (
                <div className="space-y-2">
                  {topTracks.map((track, i) => (
                    <a
                      key={i}
                      href={track.url}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center gap-3 p-1.5 rounded hover:bg-black/5 transition-colors"
                    >
                      {getImg(track.image) ? (
                        <img src={getImg(track.image)} alt="" className="w-9 h-9 rounded object-cover flex-shrink-0" />
                      ) : (
                        <div className="w-9 h-9 rounded flex-shrink-0 palette-accent-bg flex items-center justify-center">
                          <Music2 size={14} />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium paper-text truncate" style={{ fontFamily: "'Indie Flower', cursive" }}>
                          {track.name}
                        </div>
                        <div className="text-xs paper-text-muted truncate">{track.artist.name}</div>
                      </div>
                      <div className="flex items-center gap-1 text-xs paper-text-muted flex-shrink-0">
                        <BarChart2 size={11} />
                        {parseInt(track.playcount).toLocaleString()}
                      </div>
                    </a>
                  ))}
                </div>
              )}
            </>
          )}

          <Doodle kind="heart" top="88%" left="90%" size={16} rotate={12} />
        </div>
      </Reveal>
    </section>
  );
}
