import { useEffect, useRef, useState } from "react";
import { ExternalLink, Guitar, Folder, Play, Pause, Volume2, VolumeX } from "lucide-react";
import { Reveal, Doodle } from "./parts";
import type { PortfolioProject, GuitarCover } from "../lib/config";

const PLAY_YT_TRACK_EVENT = "play-yt-track";

/* ── YouTube embed ── */
function YTEmbed({ videoId, title }: { videoId: string; title: string }) {
  const [loaded, setLoaded] = useState(false);

  // When the user triggers a cover, pause the persistent music player so two
  // audio sources don't fight for ears.
  const load = () => {
    window.dispatchEvent(new CustomEvent(PLAY_YT_TRACK_EVENT, { detail: null }));
    setLoaded(true);
  };

  return (
    <div className="relative w-full rounded overflow-hidden" style={{ paddingBottom: "56.25%", background: "#1a1a1a" }}>
      {!loaded && (
        <button
          onClick={load}
          className="absolute inset-0 flex flex-col items-center justify-center gap-2 group"
          style={{ background: "#1a1a1a" }}
        >
          <img
            src={`https://img.youtube.com/vi/${videoId}/mqdefault.jpg`}
            alt={title}
            className="absolute inset-0 w-full h-full object-cover opacity-60"
          />
          <div className="relative z-10 w-14 h-14 rounded-full flex items-center justify-center shadow-xl group-hover:scale-110 transition-transform"
            style={{ background: "var(--p-accent)" }}>
            <svg viewBox="0 0 24 24" width="24" height="24" fill="var(--p-accent-contrast)">
              <polygon points="5,3 19,12 5,21" />
            </svg>
          </div>
        </button>
      )}
      {loaded && (
        <iframe
          className="absolute inset-0 w-full h-full"
          src={`https://www.youtube.com/embed/${videoId}?autoplay=1`}
          title={title}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      )}
    </div>
  );
}

/* ── Project card ── */
function ProjectCard({ project, index }: { project: PortfolioProject; index: number }) {
  const tilt = index % 2 === 0 ? "rotate(-1deg)" : "rotate(1deg)";
  const sharedClass = "paper p-5 block relative group transition-transform hover:scale-[1.02]";
  const sharedStyle = { transform: tilt };

  const inner = (
    <>
      <div className="washi washi-yellow absolute" style={{ top: -10, right: 20, transform: "rotate(3deg)", width: 60, height: 16 }} />
      {project.imageUrl && (
        <img
          src={project.imageUrl}
          alt={project.title}
          className="w-full h-36 object-cover rounded mb-3"
          onError={e => { (e.target as HTMLImageElement).style.display = "none"; }}
        />
      )}
      <div className="flex items-start justify-between gap-2">
        <span className="text-2xl">{project.emoji}</span>
        <span className="text-[12px] uppercase tracking-widest font-mono px-2 py-0.5 rounded-full paper-2 paper-text">
          {project.tag}
        </span>
      </div>
      <h3 className="mt-2 paper-text" style={{ fontFamily: "'Shadows Into Light', cursive", fontSize: 22 }}>
        {project.title}
      </h3>
      <p className="text-sm paper-text-muted mt-1" style={{ fontFamily: "'Indie Flower', cursive" }}>
        {project.blurb}
      </p>
      {project.url && (
        <div className="mt-3 flex items-center gap-1 text-xs paper-text-muted group-hover:paper-text transition-colors">
          <ExternalLink size={11} /> view project
        </div>
      )}
    </>
  );

  if (project.url) {
    return (
      <a href={project.url} target="_blank" rel="noreferrer" className={sharedClass} style={sharedStyle}>
        {inner}
      </a>
    );
  }
  return (
    <div className={sharedClass} style={sharedStyle}>
      {inner}
    </div>
  );
}

/* ── Audio cover player (used when no youtubeId is provided) ── */
function AudioCover({ cover }: { cover: GuitarCover }) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [playing, setPlaying] = useState(false);
  const [muted, setMuted] = useState(false);
  const [progress, setProgress] = useState(0); // 0..1
  const [duration, setDuration] = useState(0);
  const [current, setCurrent] = useState(0);

  // keep local state in sync with the audio element
  useEffect(() => {
    const a = audioRef.current;
    if (!a) return;
    const onPlay = () => setPlaying(true);
    const onPause = () => setPlaying(false);
    const onTime = () => {
      setCurrent(a.currentTime);
      if (a.duration && !isNaN(a.duration)) setProgress(a.currentTime / a.duration);
    };
    const onMeta = () => setDuration(a.duration || 0);
    const onEnded = () => { setPlaying(false); setProgress(0); setCurrent(0); };
    a.addEventListener("play", onPlay);
    a.addEventListener("pause", onPause);
    a.addEventListener("timeupdate", onTime);
    a.addEventListener("loadedmetadata", onMeta);
    a.addEventListener("ended", onEnded);
    return () => {
      a.removeEventListener("play", onPlay);
      a.removeEventListener("pause", onPause);
      a.removeEventListener("timeupdate", onTime);
      a.removeEventListener("loadedmetadata", onMeta);
      a.removeEventListener("ended", onEnded);
    };
  }, []);

  // if the main music player takes over (another track starts somewhere),
  // pause this audio cover so two sources aren't playing at once.
  useEffect(() => {
    const pauseIfPlaying = () => { audioRef.current?.pause(); };
    window.addEventListener("play-yt-track", pauseIfPlaying);
    return () => window.removeEventListener("play-yt-track", pauseIfPlaying);
  }, []);

  const toggle = () => {
    const a = audioRef.current;
    if (!a) return;
    if (a.paused) {
      // silence the persistent music dock before starting this cover
      window.dispatchEvent(new CustomEvent(PLAY_YT_TRACK_EVENT, { detail: null }));
      a.play().catch(() => { /* autoplay blocked */ });
    } else {
      a.pause();
    }
  };

  const toggleMute = () => {
    const a = audioRef.current;
    if (!a) return;
    a.muted = !a.muted;
    setMuted(a.muted);
  };

  const seek = (e: React.MouseEvent<HTMLDivElement>) => {
    const a = audioRef.current;
    if (!a || !a.duration) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const pct = Math.min(1, Math.max(0, (e.clientX - rect.left) / rect.width));
    a.currentTime = pct * a.duration;
  };

  const fmt = (t: number) => {
    if (!t || isNaN(t)) return "0:00";
    const m = Math.floor(t / 60);
    const s = Math.floor(t % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  };

  const img = cover.coverImage;

  return (
    <div
      className="relative w-full rounded overflow-hidden"
      style={{
        paddingBottom: "56.25%",
        background: img
          ? `linear-gradient(180deg, rgba(0,0,0,0) 40%, rgba(0,0,0,0.85) 100%), url("${img}") center/cover no-repeat`
          : "linear-gradient(135deg, var(--p-surface-strong, #2a1f3d) 0%, var(--p-surface, #1a1230) 100%)",
      }}
    >
      {/* fallback center icon when there's no cover image */}
      {!img && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-20 h-20 rounded-full flex items-center justify-center" style={{ background: "var(--p-accent)" }}>
            <Guitar size={34} color="var(--p-accent-contrast)" />
          </div>
        </div>
      )}

      {/* hidden native audio element — we drive it via custom controls */}
      <audio ref={audioRef} src={cover.audioUrl} preload="metadata" />

      {/* compact control bar pinned to the bottom of the 16:9 frame */}
      <div
        className="absolute left-0 right-0 bottom-0 flex items-center gap-2 px-3 py-2"
        style={{ color: "#fff" }}
      >
        <button
          onClick={toggle}
          aria-label={playing ? "pause" : "play"}
          className="flex-shrink-0 w-9 h-9 rounded-full flex items-center justify-center shadow-lg hover:scale-105 active:scale-95 transition-transform"
          style={{ background: "var(--p-accent)", color: "var(--p-accent-contrast)" }}
        >
          {playing ? <Pause size={16} /> : <Play size={16} className="ml-0.5" />}
        </button>

        <span className="font-mono text-[13px] tabular-nums" style={{ opacity: 0.85 }}>
          {fmt(current)}
        </span>

        {/* progress bar — click to seek */}
        <div
          className="flex-1 h-1.5 rounded-full cursor-pointer group"
          onClick={seek}
          style={{ background: "rgba(255,255,255,0.25)" }}
        >
          <div
            className="h-full rounded-full group-hover:brightness-110 transition"
            style={{ width: `${progress * 100}%`, background: "var(--p-accent)" }}
          />
        </div>

        <span className="font-mono text-[13px] tabular-nums" style={{ opacity: 0.6 }}>
          {fmt(duration)}
        </span>

        <button
          onClick={toggleMute}
          aria-label={muted ? "unmute" : "mute"}
          className="flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center hover:bg-white/10 transition-colors"
          style={{ color: "#fff" }}
        >
          {muted ? <VolumeX size={14} /> : <Volume2 size={14} />}
        </button>
      </div>
    </div>
  );
}

/* ── Guitar cover card ── */
function CoverCard({ cover, index }: { cover: GuitarCover; index: number }) {
  const tilt = index % 2 === 0 ? "rotate(1deg)" : "rotate(-1deg)";
  // audio takes priority if both are set
  const hasAudio = !!cover.audioUrl;
  const hasYouTube = !!cover.youtubeId;
  return (
    <div className="paper p-4 relative" style={{ transform: tilt }}>
      <div className="washi washi-pink absolute" style={{ top: -10, left: 20, transform: "rotate(-4deg)", width: 60, height: 16 }} />
      {hasAudio ? (
        <AudioCover cover={cover} />
      ) : hasYouTube ? (
        <YTEmbed videoId={cover.youtubeId} title={cover.title} />
      ) : (
        <div className="paper-2 p-6 text-center paper-text-muted italic text-sm rounded">
          no media yet — add a youtube id or audio url in admin
        </div>
      )}
      <div className="mt-3">
        <div className="font-medium paper-text" style={{ fontFamily: "'Shadows Into Light', cursive", fontSize: 18 }}>
          {cover.title}
        </div>
        {cover.note && (
          <div className="text-xs paper-text-muted mt-1" style={{ fontFamily: "'Indie Flower', cursive" }}>
            {cover.note}
          </div>
        )}
      </div>
    </div>
  );
}

/* ── Main page ── */
export function PortfolioPage({
  projects,
  covers,
}: {
  projects: PortfolioProject[];
  covers: GuitarCover[];
}) {
  const [tab, setTab] = useState<"projects" | "guitar">("projects");

  return (
    <div className="relative min-h-screen px-6 py-10 max-w-5xl mx-auto">
      {/* header */}
      <Reveal>
        <div className="mb-8 text-center relative">
          <Doodle kind="star" top="-10%" left="5%" size={40} rotate={-15} />
          <Doodle kind="swirl" top="20%" left="88%" size={50} rotate={20} />
          <h1 className="palette-text palette-text-shadow" style={{ fontFamily: "'Shadows Into Light', cursive", fontSize: 56 }}>
            portfolio
          </h1>
          <p className="palette-text-soft mt-1" style={{ fontFamily: "'Indie Flower', cursive", fontSize: 20 }}>
            stuff i made & played
          </p>

          {/* tab switcher */}
          <div className="mt-5 inline-flex gap-2 paper px-3 py-2 rounded-2xl">
            <button
              onClick={() => setTab("projects")}
              className="flex items-center gap-2 px-4 py-1.5 rounded-xl text-sm font-mono uppercase tracking-widest transition-all"
              style={{
                background: tab === "projects" ? "var(--p-accent)" : "transparent",
                color: tab === "projects" ? "var(--p-accent-contrast)" : "var(--paper-ink-soft)",
              }}
            >
              <Folder size={14} /> projects
            </button>
            <button
              onClick={() => setTab("guitar")}
              className="flex items-center gap-2 px-4 py-1.5 rounded-xl text-sm font-mono uppercase tracking-widest transition-all"
              style={{
                background: tab === "guitar" ? "var(--p-accent)" : "transparent",
                color: tab === "guitar" ? "var(--p-accent-contrast)" : "var(--paper-ink-soft)",
              }}
            >
              <Guitar size={14} /> covers
            </button>
          </div>
        </div>
      </Reveal>

      {/* projects grid */}
      {tab === "projects" && (
        <Reveal>
          {projects.length === 0 ? (
            <div className="paper p-8 text-center paper-text-muted italic tilt-n1">
              no projects yet — add them from the admin panel
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-5">
              {projects.map((p, i) => (
                <ProjectCard key={p.id} project={p} index={i} />
              ))}
            </div>
          )}
        </Reveal>
      )}

      {/* guitar covers grid */}
      {tab === "guitar" && (
        <Reveal>
          {covers.length === 0 ? (
            <div className="paper p-8 text-center paper-text-muted italic tilt-1">
              no covers yet — add them from the admin panel
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 gap-5">
              {covers.map((c, i) => (
                <CoverCard key={c.id} cover={c} index={i} />
              ))}
            </div>
          )}
        </Reveal>
      )}
    </div>
  );
}
