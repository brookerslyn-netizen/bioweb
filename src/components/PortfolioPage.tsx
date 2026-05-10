import { useState } from "react";
import { ExternalLink, Guitar, Folder } from "lucide-react";
import { Reveal, Doodle } from "./parts";
import type { PortfolioProject, GuitarCover } from "../lib/config";

/* ── YouTube embed ── */
function YTEmbed({ videoId, title }: { videoId: string; title: string }) {
  const [loaded, setLoaded] = useState(false);
  return (
    <div className="relative w-full rounded overflow-hidden" style={{ paddingBottom: "56.25%", background: "#1a1a1a" }}>
      {!loaded && (
        <button
          onClick={() => setLoaded(true)}
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
  const Tag = project.url ? "a" : "div";
  const props = project.url ? { href: project.url, target: "_blank", rel: "noreferrer" } : {};

  return (
    <Tag
      {...(props as any)}
      className="paper p-5 block relative group transition-transform hover:scale-[1.02]"
      style={{ transform: tilt }}
    >
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
        <span className="text-[10px] uppercase tracking-widest font-mono px-2 py-0.5 rounded-full paper-2 paper-text">
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
    </Tag>
  );
}

/* ── Guitar cover card ── */
function CoverCard({ cover, index }: { cover: GuitarCover; index: number }) {
  const tilt = index % 2 === 0 ? "rotate(1deg)" : "rotate(-1deg)";
  return (
    <div className="paper p-4 relative" style={{ transform: tilt }}>
      <div className="washi washi-pink absolute" style={{ top: -10, left: 20, transform: "rotate(-4deg)", width: 60, height: 16 }} />
      <YTEmbed videoId={cover.youtubeId} title={cover.title} />
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
