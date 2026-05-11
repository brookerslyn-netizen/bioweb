import { useEffect, useMemo, useRef, useState } from "react";
import {
  Music2,
  Disc3,
  ExternalLink,
  Play,
  Pause,
  SkipForward,
  SkipBack,
  Shuffle,
  Volume2,
  VolumeX,
  Mail,
  Copy,
  Check,
  Gamepad2,
} from "lucide-react";
import type { LanyardSpotify } from "./parts";
import { useLanyard } from "./parts";
import type { YTTrack } from "../lib/config";
import { startVinylCrackle, stopVinylCrackle } from "../lib/sfx";

const API_BASE = import.meta.env.VITE_API_URL || (import.meta.env.PROD ? "/api" : "http://localhost:3001/api");

/* ===================== status helpers ===================== */

function statusLabel(s?: string) {
  switch (s) {
    case "online":
      return { label: "online", dot: "#22c55e" };
    case "idle":
      return { label: "idle", dot: "#eab308" };
    case "dnd":
      return { label: "do not disturb", dot: "#ef4444" };
    default:
      return { label: "offline", dot: "#94a3b8" };
  }
}

function fmtMs(ms: number) {
  const s = Math.max(0, Math.floor(ms / 1000));
  const m = Math.floor(s / 60);
  const r = s % 60;
  return `${m}:${r.toString().padStart(2, "0")}`;
}

/* ===================== Spotify now-playing ===================== */

export function SpotifyNowPlaying({
  spotify,
  fallbackUrl,
}: {
  spotify: LanyardSpotify | null | undefined;
  fallbackUrl: string;
}) {
  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 700);
    return () => clearInterval(id);
  }, []);

  if (!spotify || !spotify.timestamps) {
    return (
      <div className="rounded-2xl p-4 paper paper-text">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl flex items-center justify-center palette-accent-bg">
            <Music2 size={20} />
          </div>
          <div className="min-w-0 flex-1">
            <div className="text-[10px] uppercase tracking-widest font-mono paper-text-muted">spotify</div>
            <div className="font-semibold paper-text truncate" style={{ fontFamily: "'Shadows Into Light', cursive", fontSize: 22 }}>
              not playing
            </div>
            <div className="text-xs paper-text-muted truncate">not listening right now</div>
          </div>
          <a
            href={fallbackUrl}
            target="_blank"
            rel="noreferrer"
            className="flex-shrink-0 p-2 rounded-lg hover:bg-black/10 transition-colors"
            title="visit my spotify"
          >
            <ExternalLink size={14} className="paper-text-muted" />
          </a>
        </div>
      </div>
    );
  }
  const total = spotify.timestamps.end - spotify.timestamps.start;
  const elapsed = now - spotify.timestamps.start;
  const pct = Math.max(0, Math.min(100, (elapsed / total) * 100));

  return (
    <div className="rounded-2xl p-4 paper paper-text">
      <div className="flex items-center gap-3">
        {spotify.album_art_url && (
          <img src={spotify.album_art_url} alt="" className="w-12 h-12 rounded-xl object-cover" />
        )}
        <div className="min-w-0 flex-1">
          <div className="text-[10px] uppercase tracking-widest font-mono paper-text-muted">
            now playing on spotify
          </div>
          <div className="font-semibold paper-text truncate" style={{ fontFamily: "'Shadows Into Light', cursive", fontSize: 22 }}>
            {spotify.song}
          </div>
          <div className="text-xs paper-text-muted truncate">
            {spotify.artist}
            {spotify.album ? ` — ${spotify.album}` : ""}
          </div>
        </div>
      </div>
      <div className="mt-2 h-1 rounded-full overflow-hidden" style={{ background: "rgba(0,0,0,0.12)" }}>
        <div className="h-full palette-accent-bg scrub-fill" style={{ width: `${pct}%` }} />
      </div>
      <div className="mt-1 flex justify-between font-mono text-[10px] paper-text-muted">
        <span>{fmtMs(elapsed)}</span>
        <span>{fmtMs(total)}</span>
      </div>
    </div>
  );
}

/* ===================== Discord card with copy-id ===================== */

export function DiscordCard({ discordId, showCopy }: { discordId: string; showCopy: boolean }) {
  const data = useLanyard(discordId);
  const status = statusLabel(data?.discord_status);
  const avatar = data?.discord_user?.avatar
    ? `https://cdn.discordapp.com/avatars/${data.discord_user.id}/${data.discord_user.avatar}.${data.discord_user.avatar.startsWith("a_") ? "gif" : "png"}?size=128`
    : null;
  const username = data?.discord_user?.global_name || data?.discord_user?.username || "loading…";
  const [copied, setCopied] = useState(false);

  return (
    <div className="rounded-2xl p-4 paper paper-text relative">
      <div className="absolute -top-2 left-6 washi washi-pink" style={{ transform: "rotate(-3deg)" }} />
      <div className="flex items-center gap-3">
        <div className="relative">
          {avatar ? (
            <img src={avatar} alt="" className="w-12 h-12 rounded-full object-cover" />
          ) : (
            <div className="w-12 h-12 rounded-full palette-accent-bg flex items-center justify-center">
              <Disc3 size={22} />
            </div>
          )}
          <span
            className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full"
            style={{ background: status.dot, border: "2px solid #fafaf2" }}
          />
        </div>
        <div className="min-w-0 flex-1">
          <div className="text-[10px] uppercase tracking-widest font-mono paper-text-muted">on discord</div>
          <div className="font-semibold paper-text truncate" style={{ fontFamily: "'Shadows Into Light', cursive", fontSize: 22 }}>
            {username}
          </div>
          <div className="text-xs paper-text-muted">{status.label}</div>
        </div>
        {showCopy && (
          <button
            onClick={async () => {
              try {
                await navigator.clipboard.writeText(discordId);
                setCopied(true);
                setTimeout(() => setCopied(false), 1500);
              } catch {
                /* ignore */
              }
            }}
            className="text-xs px-2 py-1.5 rounded-lg palette-accent-bg flex items-center gap-1 hover:scale-105 transition-transform"
            title="copy discord id"
          >
            {copied ? <Check size={12} /> : <Copy size={12} />}
            {copied ? "copied" : "copy id"}
          </button>
        )}
      </div>
    </div>
  );
}

/* ===================== Email card ===================== */

export function EmailCard({ email }: { email: string }) {
  return (
    <a
      href={`mailto:${email}`}
      className="rounded-2xl p-4 paper paper-text flex items-center gap-3 hover:scale-[1.01] transition-transform"
    >
      <div className="w-12 h-12 rounded-xl flex items-center justify-center palette-accent-bg">
        <Mail size={20} />
      </div>
      <div className="min-w-0">
        <div className="text-[10px] uppercase tracking-widest font-mono paper-text-muted">email</div>
        <div className="font-semibold paper-text truncate" style={{ fontFamily: "'Shadows Into Light', cursive", fontSize: 22 }}>
          {email}
        </div>
      </div>
    </a>
  );
}

/* ===================== Steam profile widget ===================== */

interface SteamProfile {
  steamId: string;
  name: string;
  avatar: string;
  profileUrl: string;
  status: string;
  isOnline: boolean;
  currentGame: string | null;
  currentGameId: string | null;
}

interface SteamRecentGame {
  appId: number;
  name: string;
  iconUrl: string;
  headerUrl: string;
  playtime2Weeks: number;
  playtimeForever: number;
}

function fmtHours(minutes: number): string {
  if (minutes < 60) return `${minutes}m`;
  const h = (minutes / 60).toFixed(1).replace(/\.0$/, "");
  return `${h}h`;
}

const STATUS_COLORS: Record<string, string> = {
  online: "#57cbde",
  busy: "#e05f5f",
  away: "#e0c05f",
  snooze: "#e0c05f",
  "looking to trade": "#57cbde",
  "looking to play": "#57cbde",
  offline: "#898989",
};

export function SteamCard({ steamId }: { steamId: string }) {
  const [profile, setProfile] = useState<SteamProfile | null>(null);
  const [games, setGames] = useState<SteamRecentGame[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!steamId) { setLoading(false); return; }
    let cancelled = false;

    (async () => {
      try {
        const r = await fetch(`${API_BASE}/steam/profile?steamId=${steamId}`);
        if (!r.ok) throw new Error("Steam fetch failed");
        const data = await r.json();
        if (cancelled) return;
        if (data.profile) setProfile(data.profile);
        if (data.recentGames) setGames(data.recentGames);
      } catch { /* silently fail */ }
      finally { if (!cancelled) setLoading(false); }
    })();

    return () => { cancelled = true; };
  }, [steamId]);

  if (!steamId) {
    return (
      <div className="rounded-2xl p-4 paper paper-text relative">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl flex items-center justify-center palette-accent-bg">
            <Gamepad2 size={20} />
          </div>
          <div>
            <div className="text-[10px] uppercase tracking-widest font-mono paper-text-muted">steam</div>
            <div className="font-semibold paper-text" style={{ fontFamily: "'Shadows Into Light', cursive", fontSize: 22 }}>
              steam id pending
            </div>
            <div className="text-xs paper-text-muted">add via admin → contact → steam id</div>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="rounded-2xl p-4 paper paper-text">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl flex items-center justify-center palette-accent-bg animate-pulse">
            <Gamepad2 size={20} />
          </div>
          <div className="text-sm paper-text-muted italic">loading steam...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl p-4 paper paper-text space-y-3">
      {/* Profile header */}
      <a
        href={profile?.profileUrl || `https://steamcommunity.com/profiles/${steamId}`}
        target="_blank"
        rel="noreferrer"
        className="flex items-center gap-3 hover:opacity-90 transition-opacity"
      >
        {profile?.avatar ? (
          <img src={profile.avatar} alt="" className="w-12 h-12 rounded-xl object-cover" />
        ) : (
          <div className="w-12 h-12 rounded-xl flex items-center justify-center palette-accent-bg">
            <Gamepad2 size={20} />
          </div>
        )}
        <div className="min-w-0 flex-1">
          <div className="text-[10px] uppercase tracking-widest font-mono paper-text-muted flex items-center gap-1.5">
            steam
            {profile && (
              <span className="inline-flex items-center gap-1">
                <span
                  className="w-2 h-2 rounded-full inline-block"
                  style={{ background: STATUS_COLORS[profile.status] || STATUS_COLORS.offline }}
                />
                <span>{profile.status}</span>
              </span>
            )}
          </div>
          <div className="font-semibold paper-text truncate" style={{ fontFamily: "'Shadows Into Light', cursive", fontSize: 22 }}>
            {profile?.name || steamId}
          </div>
          {profile?.currentGame && (
            <div className="text-xs paper-text-muted truncate" style={{ fontFamily: "'Indie Flower', cursive" }}>
              ▶ playing <span className="font-medium paper-text">{profile.currentGame}</span>
            </div>
          )}
        </div>
        <ExternalLink size={14} className="paper-text-muted flex-shrink-0" />
      </a>

      {/* Recent games */}
      {games.length > 0 && (
        <div className="space-y-1.5">
          <div className="text-[10px] uppercase tracking-widest font-mono paper-text-muted">
            recently played
          </div>
          <div className="flex gap-2 overflow-x-auto pb-1" style={{ scrollbarWidth: "none" }}>
            {games.map((g) => (
              <a
                key={g.appId}
                href={`https://store.steampowered.com/app/${g.appId}`}
                target="_blank"
                rel="noreferrer"
                className="flex-shrink-0 w-32 rounded-lg overflow-hidden paper-2 hover:scale-[1.03] transition-transform group"
                title={`${g.name} — ${fmtHours(g.playtime2Weeks)} last 2 weeks`}
              >
                <img
                  src={g.headerUrl}
                  alt={g.name}
                  className="w-full h-16 object-cover"
                  loading="lazy"
                  onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
                />
                <div className="px-2 py-1.5">
                  <div className="text-[11px] font-medium paper-text truncate" style={{ fontFamily: "'Indie Flower', cursive" }}>
                    {g.name}
                  </div>
                  <div className="text-[10px] paper-text-muted font-mono">
                    {fmtHours(g.playtime2Weeks)} · 2wk
                  </div>
                </div>
              </a>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

/* ===================== Music player (YouTube IFrame API + cassette/vinyl visuals) ===================== */

declare global {
  interface Window {
    YT?: {
      Player: new (
        el: HTMLElement | string,
        opts: Record<string, unknown>,
      ) => YTPlayer;
      PlayerState: { ENDED: number; PLAYING: number; PAUSED: number; BUFFERING: number; CUED: number };
    };
    onYouTubeIframeAPIReady?: () => void;
  }
}

type YTPlayer = {
  loadVideoById: (id: string | { videoId: string; startSeconds?: number; endSeconds?: number }) => void;
  cueVideoById: (id: string) => void;
  playVideo: () => void;
  pauseVideo: () => void;
  setVolume: (v: number) => void;
  getCurrentTime: () => number;
  getDuration: () => number;
  destroy: () => void;
};

let ytApiPromise: Promise<void> | null = null;
function loadYTApi(): Promise<void> {
  if (ytApiPromise) return ytApiPromise;
  ytApiPromise = new Promise((resolve) => {
    if (window.YT?.Player) return resolve();
    const tag = document.createElement("script");
    tag.src = "https://www.youtube.com/iframe_api";
    document.body.appendChild(tag);
    window.onYouTubeIframeAPIReady = () => resolve();
  });
  return ytApiPromise;
}

function shuffle<T>(arr: T[]): T[] {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function MusicPlayer({
  playlist,
  volume,
  autoplay,
  visual,
  crackle,
  enabled,
}: {
  playlist: YTTrack[];
  volume: number;
  autoplay: boolean;
  visual: "vinyl" | "cassette" | "none";
  crackle: boolean;
  enabled: boolean;
}) {
  const queue = useMemo(() => (playlist.length ? shuffle(playlist) : []), [playlist]);
  const [idx, setIdx] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [muted, setMuted] = useState(false);
  const [now, setNow] = useState(0);
  const [dur, setDur] = useState(0);
  // When a Spotify recent track is clicked, this overrides the current queue track display
  const [externalTrack, setExternalTrack] = useState<{ title: string; artist: string } | null>(null);
  // Track the actual YT video ID currently loaded (may differ from queue[idx].id when external)
  const [activeVideoId, setActiveVideoId] = useState<string | null>(null);
  const playerRef = useRef<YTPlayer | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const trackingRef = useRef<ReturnType<typeof setInterval> | null>(null);

  /* mount yt api + create player */
  useEffect(() => {
    if (!enabled || !queue.length) return;
    let cancelled = false;
    loadYTApi().then(() => {
      if (cancelled) return;
      if (!containerRef.current) return;
      const div = document.createElement("div");
      containerRef.current.appendChild(div);
      const p = new window.YT!.Player(div, {
        height: "0",
        width: "0",
        videoId: queue[0].id,
        playerVars: { autoplay: autoplay ? 1 : 0, controls: 0, disablekb: 1, modestbranding: 1, playsinline: 1 },
        events: {
          onReady: (e: { target: YTPlayer }) => {
            playerRef.current = e.target;
            e.target.setVolume(muted ? 0 : volume);
            setActiveVideoId(queue[0].id);
            if (autoplay) {
              e.target.playVideo();
              setPlaying(true);
            }
          },
          onStateChange: (e: { data: number }) => {
            if (window.YT?.PlayerState) {
              if (e.data === window.YT.PlayerState.ENDED) {
                window.dispatchEvent(new CustomEvent("yt-track-ended"));
                setExternalTrack(null);
                next();
              } else if (e.data === window.YT.PlayerState.PLAYING) {
                setPlaying(true);
              } else if (e.data === window.YT.PlayerState.PAUSED) {
                setPlaying(false);
              }
            }
          },
        },
      });
      playerRef.current = p;
    });
    return () => {
      cancelled = true;
      try { playerRef.current?.destroy(); } catch { /* ignore */ }
      playerRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled, queue]);

  /* sync volume + mute */
  useEffect(() => {
    playerRef.current?.setVolume(muted ? 0 : volume);
  }, [volume, muted]);

  /* progress poll */
  useEffect(() => {
    if (!enabled) return;
    if (trackingRef.current) clearInterval(trackingRef.current);
    trackingRef.current = setInterval(() => {
      const p = playerRef.current;
      if (!p) return;
      try {
        setNow(p.getCurrentTime());
        setDur(p.getDuration());
      } catch { /* ignore */ }
    }, 750);
    return () => { if (trackingRef.current) clearInterval(trackingRef.current); };
  }, [enabled]);

  /* vinyl crackle SFX */
  useEffect(() => {
    if (enabled && playing && crackle && !muted) {
      startVinylCrackle(0.05);
    } else {
      stopVinylCrackle();
    }
    return () => stopVinylCrackle();
  }, [enabled, playing, crackle, muted]);

  /* listen for external "play this YT video" events from SpotifyRecent */
  useEffect(() => {
    if (!enabled) return;
    const handler = (e: Event) => {
      const detail = (e as CustomEvent).detail as
        | { videoId: string; title: string; artist: string; startSeconds?: number }
        | null;
      if (!detail) {
        setExternalTrack(null);
        setActiveVideoId(null);
        playerRef.current?.pauseVideo();
        return;
      }
      setExternalTrack({ title: detail.title, artist: detail.artist });
      setActiveVideoId(detail.videoId);
      // loadVideoById({ videoId, startSeconds }) is the YT.Player signature
      // that jumps straight to the timestamp, used for play-along.
      if (typeof detail.startSeconds === "number" && detail.startSeconds > 0) {
        playerRef.current?.loadVideoById({
          videoId: detail.videoId,
          startSeconds: detail.startSeconds,
        });
      } else {
        playerRef.current?.loadVideoById(detail.videoId);
      }
      playerRef.current?.playVideo();
    };
    window.addEventListener("play-yt-track", handler);
    return () => window.removeEventListener("play-yt-track", handler);
  }, [enabled]);

  function next() {
    if (!queue.length) return;
    const ni = (idx + 1) % queue.length;
    setIdx(ni);
    setExternalTrack(null);
    setActiveVideoId(queue[ni].id);
    window.dispatchEvent(new CustomEvent("yt-track-ended")); // clears SpotifyRecent playing state
    playerRef.current?.loadVideoById(queue[ni].id);
    playerRef.current?.playVideo();
  }
  function prev() {
    if (!queue.length) return;
    const ni = (idx - 1 + queue.length) % queue.length;
    setIdx(ni);
    setExternalTrack(null);
    setActiveVideoId(queue[ni].id);
    window.dispatchEvent(new CustomEvent("yt-track-ended")); // clears SpotifyRecent playing state
    playerRef.current?.loadVideoById(queue[ni].id);
    playerRef.current?.playVideo();
  }
  function toggle() {
    if (!playerRef.current) return;
    if (playing) playerRef.current.pauseVideo();
    else playerRef.current.playVideo();
  }
  function reshuffle() {
    setIdx(0);
  }

  if (!enabled || !queue.length) return null;
  const cur = queue[idx];
  const pct = dur > 0 ? Math.min(100, (now / dur) * 100) : 0;
  const displayTitle = externalTrack ? externalTrack.title : cur.title;
  const displayArtist = externalTrack ? externalTrack.artist : cur.artist;
  // Use the actual playing video ID for the thumbnail (may be an external/Spotify track)
  const thumbUrl = activeVideoId ? `https://img.youtube.com/vi/${activeVideoId}/mqdefault.jpg` : null;

  return (
    <div className="rounded-2xl p-4 paper paper-text relative">
      <div className="absolute -top-2 right-8 washi washi-yellow" style={{ transform: "rotate(2deg)" }} />
      <div ref={containerRef} style={{ position: "absolute", left: -9999, top: -9999, opacity: 0 }} />
      <div className="flex items-center gap-4">
        {visual === "vinyl" && (
          <div className="relative w-16 h-16 rounded-full flex-shrink-0 overflow-hidden"
            style={{ background: "radial-gradient(circle, #2b2316 30%, #0a0a0a 32%, #2b2316 33%, #0a0a0a 100%)" }}>
            {/* album art as vinyl label */}
            {thumbUrl && (
              <img
                src={thumbUrl}
                alt=""
                className="absolute inset-0 w-full h-full object-cover rounded-full opacity-60"
                style={{ mixBlendMode: "luminosity" }}
              />
            )}
            <div className={`absolute inset-0 rounded-full ${playing ? "vinyl-spin" : ""}`}>
              <div className="absolute top-1/2 left-1/2 w-4 h-4 rounded-full palette-accent-bg" style={{ transform: "translate(-50%, -50%)", zIndex: 2 }} />
              <div className="absolute inset-2 rounded-full" style={{ border: "1px solid rgba(255,255,255,0.12)" }} />
              <div className="absolute inset-4 rounded-full" style={{ border: "1px solid rgba(255,255,255,0.08)" }} />
            </div>
          </div>
        )}
        {visual === "cassette" && (
          <div className="relative w-24 h-16 rounded-md flex-shrink-0 overflow-hidden"
            style={{ background: "#2b2316", border: "2px solid #5b4326" }}>
            {/* album art as cassette label */}
            {thumbUrl && (
              <img
                src={thumbUrl}
                alt=""
                className="absolute inset-0 w-full h-full object-cover opacity-40"
                style={{ mixBlendMode: "luminosity" }}
              />
            )}
            <div className="absolute top-1.5 left-1.5 right-1.5 h-3 rounded-sm z-10" style={{ background: "rgba(255,248,168,0.85)" }} />
            <div className={`absolute bottom-1.5 left-2 w-5 h-5 rounded-full z-10 ${playing ? "cassette-reel" : ""}`}
              style={{ background: "radial-gradient(circle, #888 30%, #2b2316 32%)" }}>
              <div className="absolute inset-1 rounded-full" style={{ border: "1px solid #555" }} />
            </div>
            <div className={`absolute bottom-1.5 right-2 w-5 h-5 rounded-full z-10 ${playing ? "cassette-reel" : ""}`}
              style={{ background: "radial-gradient(circle, #888 30%, #2b2316 32%)" }}>
              <div className="absolute inset-1 rounded-full" style={{ border: "1px solid #555" }} />
            </div>
          </div>
        )}
        {visual === "none" && (
          <div className="w-12 h-12 rounded-xl flex items-center justify-center palette-accent-bg flex-shrink-0">
            <Music2 size={22} />
          </div>
        )}
        <div className="min-w-0 flex-1">
          <div className="text-[10px] uppercase tracking-widest font-mono paper-text-muted">now playing</div>
          <div className="font-semibold paper-text truncate" style={{ fontFamily: "'Shadows Into Light', cursive", fontSize: 22 }}>
            {displayTitle}
          </div>
          {displayArtist && <div className="text-xs paper-text-muted truncate">{displayArtist}</div>}
        </div>
      </div>

      <div className="mt-3 h-1 rounded-full overflow-hidden" style={{ background: "rgba(0,0,0,0.12)" }}>
        <div className="h-full palette-accent-bg" style={{ width: `${pct}%` }} />
      </div>
      <div className="mt-1 flex justify-between font-mono text-[10px] paper-text-muted">
        <span>{fmtMs(now * 1000)}</span>
        <span>{dur > 0 ? fmtMs(dur * 1000) : "--:--"}</span>
      </div>

      <div className="mt-3 flex items-center justify-between gap-2">
        <button onClick={reshuffle} className="paper-text-muted hover:paper-text" title="reshuffle queue"><Shuffle size={16} /></button>
        <div className="flex items-center gap-2">
          <button onClick={prev} className="paper-text hover:paper-text" title="prev"><SkipBack size={20} /></button>
          <button onClick={toggle} className="palette-accent-bg p-2 rounded-full hover:scale-105 transition-transform" title={playing ? "pause" : "play"}>
            {playing ? <Pause size={20} /> : <Play size={20} />}
          </button>
          <button onClick={next} className="paper-text hover:paper-text" title="next"><SkipForward size={20} /></button>
        </div>
        <button onClick={() => setMuted((m) => !m)} className="paper-text-muted hover:paper-text" title={muted ? "unmute" : "mute"}>
          {muted ? <VolumeX size={16} /> : <Volume2 size={16} />}
        </button>
      </div>
    </div>
  );
}
