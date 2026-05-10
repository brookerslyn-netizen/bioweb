import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { CSSProperties, ReactNode } from "react";

/* ===================== Reveal on scroll ===================== */

export function Reveal({ children, className = "" }: { children: ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      (entries) => {
        for (const e of entries) if (e.isIntersecting) el.classList.add("is-visible");
      },
      { threshold: 0.12 },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);
  return <div ref={ref} className={`reveal ${className}`}>{children}</div>;
}

/* ===================== Pen Cursor ===================== */

export function PencilCursor({ enabled }: { enabled: boolean }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!enabled) return;
    const el = ref.current;
    if (!el) return;
    const onMove = (e: MouseEvent) => {
      el.style.transform = `translate3d(${e.clientX}px, ${e.clientY}px, 0) translate(-4px, -4px)`;
    };
    const onOver = (e: MouseEvent) => {
      const t = e.target as HTMLElement | null;
      const interactive = t?.closest("a, button, [data-cursor='hover'], input, textarea, select") != null;
      el.classList.toggle("is-hover", interactive);
    };
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseover", onOver);
    document.body.classList.add("no-cursor");
    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseover", onOver);
      document.body.classList.remove("no-cursor");
    };
  }, [enabled]);
  if (!enabled) return null;
  return (
    <div ref={ref} className="cursor-pencil hidden md:block">
      {/* craft scissors cursor — tip at top-left */}
      <svg viewBox="0 0 32 32" width="32" height="32" style={{ filter: "drop-shadow(0 2px 3px rgba(0,0,0,0.35))" }}>
        {/* blade 1 */}
        <path d="M4 4 L18 16 L16 18 L2 6 Z" fill="#c0c0c0" stroke="#666" strokeWidth="0.5" />
        {/* blade 2 */}
        <path d="M4 4 L16 18 L18 16 Z" fill="#d8d8d8" stroke="#666" strokeWidth="0.5" opacity="0" />
        <path d="M6 2 L18 16 L20 14 L8 0 Z" fill="#b0b0b0" stroke="#666" strokeWidth="0.5" />
        {/* pivot screw */}
        <circle cx="17" cy="17" r="2.5" fill="var(--p-accent)" stroke="#333" strokeWidth="0.5" />
        <circle cx="17" cy="17" r="0.8" fill="#333" />
        {/* handle 1 */}
        <ellipse cx="24" cy="22" rx="5" ry="3.5" fill="var(--p-accent)" stroke="#333" strokeWidth="0.6" transform="rotate(-30 24 22)" />
        <ellipse cx="24" cy="22" rx="3" ry="1.8" fill="var(--p-bg)" transform="rotate(-30 24 22)" />
        {/* handle 2 */}
        <ellipse cx="20" cy="26" rx="5" ry="3.5" fill="var(--p-accent)" stroke="#333" strokeWidth="0.6" transform="rotate(20 20 26)" />
        <ellipse cx="20" cy="26" rx="3" ry="1.8" fill="var(--p-bg)" transform="rotate(20 20 26)" />
      </svg>
    </div>
  );
}

/* ===================== Konami strawberry follower ===================== */

export function BerryFollower({ active }: { active: boolean }) {
  const ref = useRef<HTMLDivElement>(null);
  const target = useRef({ x: -100, y: -100 });
  const pos = useRef({ x: -100, y: -100 });
  useEffect(() => {
    if (!active) return;
    const onMove = (e: MouseEvent) => {
      target.current.x = e.clientX;
      target.current.y = e.clientY;
    };
    window.addEventListener("mousemove", onMove);
    let raf = 0;
    const tick = () => {
      pos.current.x += (target.current.x - pos.current.x) * 0.08;
      pos.current.y += (target.current.y - pos.current.y) * 0.08;
      const el = ref.current;
      if (el) el.style.transform = `translate3d(${pos.current.x + 26}px, ${pos.current.y + 14}px, 0) translate(-50%, -50%)`;
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => {
      window.removeEventListener("mousemove", onMove);
      cancelAnimationFrame(raf);
    };
  }, [active]);
  if (!active) return null;
  return (
    <div ref={ref} className="berry-follower">
      <svg viewBox="0 0 32 32" width="28" height="28" aria-hidden>
        <path d="M16 6 C 11 4, 7 7, 7 13 C 7 22, 12 28, 16 28 C 20 28, 25 22, 25 13 C 25 7, 21 4, 16 6 Z"
              fill="#ef4444" stroke="#7a1212" strokeWidth="0.7" />
        <path d="M11 4 C 13 2, 14 6, 16 6 C 18 6, 19 2, 21 4 L 19 8 L 13 8 Z" fill="#22c55e" stroke="#0a4d1a" strokeWidth="0.5" />
        {/* seeds */}
        {[
          [12, 14], [16, 12], [20, 14], [13, 18], [17, 17], [21, 19], [14, 22], [18, 22],
        ].map(([cx, cy], i) => (
          <ellipse key={i} cx={cx} cy={cy} rx="0.7" ry="1" fill="#fde68a" />
        ))}
      </svg>
    </div>
  );
}

/* ===================== Konami code hook ===================== */

const KONAMI = [
  "ArrowUp", "ArrowUp", "ArrowDown", "ArrowDown",
  "ArrowLeft", "ArrowRight", "ArrowLeft", "ArrowRight",
  "b", "a",
];

export function useKonami(onUnlock: () => void, enabled = true) {
  const buf = useRef<string[]>([]);
  useEffect(() => {
    if (!enabled) return;
    const onKey = (e: KeyboardEvent) => {
      const key = e.key.length === 1 ? e.key.toLowerCase() : e.key;
      buf.current.push(key);
      while (buf.current.length > KONAMI.length) buf.current.shift();
      if (buf.current.length === KONAMI.length && buf.current.every((k, i) => k === KONAMI[i])) {
        buf.current = [];
        onUnlock();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onUnlock, enabled]);
}

/* ===================== Typewriter ===================== */

export function Typewriter({ lines }: { lines: string[] }) {
  const [text, setText] = useState("");
  const [lineIndex, setLineIndex] = useState(0);
  const [deleting, setDeleting] = useState(false);
  const safe = lines.length === 0 ? [""] : lines;

  useEffect(() => {
    setText("");
    setLineIndex(0);
    setDeleting(false);
  }, [lines]);

  useEffect(() => {
    const current = safe[lineIndex % safe.length] ?? "";
    let timeout: ReturnType<typeof setTimeout>;
    if (!deleting && text.length < current.length) {
      timeout = setTimeout(() => setText(current.slice(0, text.length + 1)), 70);
    } else if (!deleting && text.length === current.length) {
      timeout = setTimeout(() => setDeleting(true), 1600);
    } else if (deleting && text.length > 0) {
      timeout = setTimeout(() => setText(current.slice(0, text.length - 1)), 35);
    } else if (deleting && text.length === 0) {
      setDeleting(false);
      setLineIndex((i) => i + 1);
    }
    return () => clearTimeout(timeout);
  }, [text, deleting, lineIndex, safe]);

  return (
    <span className="font-mono text-sm md:text-base palette-text">
      {text}
      <span className="inline-block w-[2px] h-4 md:h-5 align-middle ml-1 palette-accent-bg rounded-sm" style={{ animation: "blink 1s steps(2) infinite" }} />
    </span>
  );
}

/* ===================== Splash (page rip to enter) ===================== */

export function Splash({ onEnter, leaving, name, splashText }: {
  onEnter: () => void;
  leaving: boolean;
  name: string;
  splashText: string;
}) {
  return (
    <div
      onClick={onEnter}
      className="fixed inset-0 z-50 cursor-pointer flex flex-col items-center justify-center text-center px-6"
    >
      <div className="absolute inset-0 -z-10 palette-veil" />
      <div className="absolute inset-0 -z-20 palette-bg" />

      {/* top half rips upward */}
      <div className={`splash-rip-top ${leaving ? "splash-rip-top-out" : ""}`} />
      {/* bottom half rips downward */}
      <div className={`splash-rip-bottom ${leaving ? "splash-rip-bottom-out" : ""}`} />

      {/* scattered washi tape on splash */}
      <div className="absolute top-[15%] left-[10%] washi washi-pink" style={{ width: 80, height: 18, transform: "rotate(-18deg)", opacity: 0.5 }} />
      <div className="absolute top-[20%] right-[12%] washi washi-mint" style={{ width: 70, height: 18, transform: "rotate(12deg)", opacity: 0.4 }} />
      <div className="absolute bottom-[25%] left-[18%] washi washi-yellow" style={{ width: 90, height: 18, transform: "rotate(6deg)", opacity: 0.45 }} />
      <div className="absolute bottom-[18%] right-[15%] washi washi-lavender" style={{ width: 65, height: 18, transform: "rotate(-10deg)", opacity: 0.35 }} />

      <div className={`splash-content ${leaving ? "splash-content-out" : ""}`}>
        <RansomNote
          name={name}
          sizes={[80, 90, 70, 95, 80]}
          className="palette-text-shadow"
          style={{ marginBottom: "1.5rem" }}
        />
        <p className="mt-6 text-2xl md:text-3xl palette-text-soft" style={{ fontFamily: "'Indie Flower', cursive" }}>
          {splashText}
        </p>
        <div className="mt-6 inline-block">
          <p className="text-xs uppercase tracking-[0.3em] font-mono palette-text-muted animate-pulse">
            ✂️ tear to enter
          </p>
        </div>
      </div>
    </div>
  );
}

/* ===================== Ransom note hero ===================== */

const RANSOM_FONTS = [
  "'Permanent Marker', cursive",
  "'Special Elite', monospace",
  "'Pacifico', cursive",
  "'Shadows Into Light', cursive",
  "'Indie Flower', cursive",
];
const RANSOM_BGS = [
  "#fafaf2", "#fff8a8", "#f5a9b8", "#5bcefa", "#a7f3d0", "#fde68a",
];
const RANSOM_INKS = ["#1a1a1a", "#2b2316", "#3a1224", "#062118", "#04111c"];
const RANSOM_TILTS = [-3, 2, -2, 1, -1, 3, -2, 2];

export function RansomNote({
  name,
  sizes = [72, 84, 64, 88, 70],
  className = "",
  style,
}: {
  name: string;
  sizes?: number[];
  className?: string;
  style?: CSSProperties;
}) {
  const letters = useMemo(() => name.split(""), [name]);
  return (
    <span className={`ransom ${className}`} style={style}>
      {letters.map((ch, i) => (
        <span
          key={i}
          style={{
            fontFamily: RANSOM_FONTS[i % RANSOM_FONTS.length],
            fontSize: (sizes[i % sizes.length] ?? 72) + "px",
            background: RANSOM_BGS[i % RANSOM_BGS.length],
            color: RANSOM_INKS[i % RANSOM_INKS.length],
            transform: `rotate(${RANSOM_TILTS[i % RANSOM_TILTS.length]}deg)`,
            margin: "0 1px",
          }}
        >
          {ch}
        </span>
      ))}
    </span>
  );
}

/* ===================== StickyNote bar ===================== */

export function StickyNoteBar({ text, onDismiss }: { text: string; onDismiss: () => void }) {
  return (
    <div className="sticky-note relative px-5 py-3 mx-3 mt-3 mb-2 rounded-md flex items-start gap-3" style={{ transform: "rotate(-0.6deg)" }}>
      <div className="absolute -top-2 left-6 washi washi-pink" style={{ height: 14, width: 60, transform: "rotate(-2deg)" }} />
      <div className="text-base md:text-lg leading-snug whitespace-pre-wrap flex-1" style={{ fontFamily: "'Shadows Into Light', cursive" }}>
        {text}
      </div>
      <button
        onClick={onDismiss}
        className="text-xs uppercase tracking-widest opacity-60 hover:opacity-100"
        style={{ fontFamily: "'JetBrains Mono', monospace" }}
        aria-label="dismiss"
      >
        ✕ close
      </button>
    </div>
  );
}

/* ===================== Live clock ===================== */

function offsetMs(tz: string): number {
  const m = /^GMT([+-]?\d+)(?::?(\d{2}))?$/i.exec(tz.trim());
  if (!m) return 0;
  const h = parseInt(m[1], 10);
  const mn = m[2] ? parseInt(m[2], 10) : 0;
  return (h * 60 + (h < 0 ? -mn : mn)) * 60_000;
}

export function LiveClock({ tz }: { tz: string }) {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);
  const offset = offsetMs(tz);
  const local = new Date(now.getTime() + offset + now.getTimezoneOffset() * 60_000);
  const pad = (n: number) => n.toString().padStart(2, "0");
  return (
    <span className="font-mono text-sm palette-text">
      {pad(local.getHours())}:{pad(local.getMinutes())}:{pad(local.getSeconds())}{" "}
      <span className="palette-text-muted">{tz}</span>
    </span>
  );
}

/* ===================== Scattered Polaroid Decorations ===================== */

export function ScatteredPolaroids() {
  const polaroids = useMemo(() => [
    { top: "8%", left: "82%", rotate: 12, w: 70, h: 70, color: "#e8d4b8" },
    { top: "25%", left: "88%", rotate: -8, w: 60, h: 75, color: "#d4c4a8" },
    { top: "45%", left: "3%", rotate: -15, w: 65, h: 65, color: "#f0e6d2" },
    { top: "62%", left: "90%", rotate: 6, w: 55, h: 70, color: "#e0d0b8" },
    { top: "78%", left: "5%", rotate: 18, w: 75, h: 60, color: "#dcc8a8" },
    { top: "38%", left: "92%", rotate: -22, w: 50, h: 65, color: "#f5e8d0" },
  ], []);

  return (
    <>
      {polaroids.map((p, i) => (
        <div
          key={i}
          className="scattered-polaroid hidden lg:block"
          style={{
            top: p.top,
            left: p.left,
            transform: `rotate(${p.rotate}deg)`,
          }}
        >
          <div style={{
            background: "#fafaf2",
            padding: "4px 4px 16px 4px",
            borderRadius: "1px",
            boxShadow: "0 4px 12px rgba(0,0,0,0.3)",
          }}>
            <div style={{
              width: p.w,
              height: p.h,
              background: p.color,
              backgroundImage: `radial-gradient(circle at ${30 + i * 10}% ${20 + i * 8}%, rgba(255,255,255,0.3), transparent 60%)`,
            }} />
          </div>
        </div>
      ))}
    </>
  );
}

/* ===================== Falling Paper Scraps ===================== */

export function FallingPaperScraps() {
  const scraps = useMemo(() => {
    const colors = ["#f5e8c8", "#fce4ec", "#e8f5e9", "#fff8a8", "#f5a9b8", "#a7f3d0", "#fde68a", "#ddd6fe"];
    return Array.from({ length: 12 }, (_, i) => ({
      left: `${5 + (i * 8) % 90}%`,
      size: 6 + (i % 4) * 3,
      duration: 18 + (i % 5) * 6,
      delay: i * 3.2,
      color: colors[i % colors.length],
      rotate: (i * 47) % 360,
    }));
  }, []);

  return (
    <>
      {scraps.map((s, i) => (
        <div
          key={i}
          className="paper-scrap"
          style={{
            left: s.left,
            width: s.size,
            height: s.size * 1.3,
            background: s.color,
            animationDuration: `${s.duration}s`,
            animationDelay: `${s.delay}s`,
            borderRadius: "1px",
            boxShadow: "0 1px 3px rgba(0,0,0,0.15)",
          }}
        />
      ))}
    </>
  );
}

/* ===================== Decorative Stamps ===================== */

export function ScrapbookStamp({ top, left, rotate = 0, kind = "postage" }: {
  top: string;
  left: string;
  rotate?: number;
  kind?: "postage" | "circle" | "airmail";
}) {
  if (kind === "circle") {
    return (
      <div className="stamp hidden md:block" style={{ top, left, transform: `rotate(${rotate}deg)` }}>
        <svg width="50" height="50" viewBox="0 0 50 50">
          <circle cx="25" cy="25" r="22" fill="none" stroke="var(--p-accent)" strokeWidth="2" strokeDasharray="3 2" />
          <circle cx="25" cy="25" r="18" fill="none" stroke="var(--p-accent)" strokeWidth="0.5" />
          <text x="25" y="22" textAnchor="middle" fontSize="5" fill="var(--p-accent)" fontFamily="monospace">BROOKERSLYN</text>
          <text x="25" y="30" textAnchor="middle" fontSize="4" fill="var(--p-accent)" fontFamily="monospace">2025</text>
        </svg>
      </div>
    );
  }
  if (kind === "airmail") {
    return (
      <div className="stamp hidden md:block" style={{ top, left, transform: `rotate(${rotate}deg)` }}>
        <svg width="60" height="24" viewBox="0 0 60 24">
          {/* red-blue airmail border */}
          {Array.from({ length: 10 }, (_, i) => (
            <rect key={i} x={i * 6} y="0" width="3" height="24" fill={i % 2 === 0 ? "#ef4444" : "#3b82f6"} opacity="0.6" />
          ))}
          <rect x="8" y="4" width="44" height="16" fill="#fafaf2" />
          <text x="30" y="14" textAnchor="middle" fontSize="6" fill="#2b2316" fontFamily="monospace" fontWeight="bold">PAR AVION</text>
        </svg>
      </div>
    );
  }
  return (
    <div className="stamp hidden md:block" style={{ top, left, transform: `rotate(${rotate}deg)` }}>
      <svg width="40" height="48" viewBox="0 0 40 48">
        {/* perforated edge */}
        <rect x="2" y="2" width="36" height="44" rx="1" fill="#fde68a" stroke="var(--p-accent)" strokeWidth="0.5" />
        <rect x="4" y="4" width="32" height="28" rx="1" fill="var(--p-accent)" opacity="0.2" />
        <text x="20" y="40" textAnchor="middle" fontSize="5" fill="#2b2316" fontFamily="monospace">$0.{(rotate + 50) % 99}</text>
      </svg>
    </div>
  );
}

/* ===================== Binder Clip ===================== */

export function BinderClip({ top, left, rotate = 0 }: { top: string; left: string; rotate?: number }) {
  return (
    <div className="binder-clip hidden md:block" style={{ top, left, transform: `rotate(${rotate}deg)` }}>
      <svg width="24" height="32" viewBox="0 0 24 32" style={{ filter: "drop-shadow(0 2px 3px rgba(0,0,0,0.3))" }}>
        {/* clip body */}
        <rect x="4" y="8" width="16" height="12" rx="2" fill="#333" />
        {/* metal handles */}
        <path d="M7 8 L7 2 C7 0.5 9 0.5 9 2 L9 8" fill="none" stroke="#888" strokeWidth="1.5" />
        <path d="M15 8 L15 2 C15 0.5 17 0.5 17 2 L17 8" fill="none" stroke="#888" strokeWidth="1.5" />
        {/* grip part going down */}
        <path d="M6 20 L4 28" stroke="#555" strokeWidth="1" strokeLinecap="round" />
        <path d="M18 20 L20 28" stroke="#555" strokeWidth="1" strokeLinecap="round" />
      </svg>
    </div>
  );
}

/* ===================== Coffee Stain ===================== */

export function CoffeeStain({ top, left, size = 80 }: { top: string; left: string; size?: number }) {
  return <div className="coffee-stain hidden md:block" style={{ top, left, width: size, height: size }} />;
}

/* ===================== Name Click Surprise ===================== */

export function useNameSurprise() {
  const [surpriseActive, setSurpriseActive] = useState(false);
  const handleNameClick = useCallback(() => {
    setSurpriseActive(true);
    const letters = document.querySelectorAll(".ransom span");
    letters.forEach((el, i) => {
      const htmlEl = el as HTMLElement;
      const origTransform = htmlEl.style.transform;
      htmlEl.style.transition = "transform 400ms cubic-bezier(0.2,0.8,0.2,1)";
      htmlEl.style.transform = `${origTransform} translateY(${-20 - Math.random() * 30}px) rotate(${(Math.random() - 0.5) * 40}deg) scale(1.2)`;
      setTimeout(() => {
        htmlEl.style.transform = origTransform;
        if (i === letters.length - 1) {
          setTimeout(() => setSurpriseActive(false), 400);
        }
      }, 600 + i * 80);
    });
  }, []);
  return { surpriseActive, handleNameClick };
}

/* ===================== Doodles (scattered SVGs) ===================== */

export function Doodle({ kind, top, left, size = 60, rotate = 0 }: { kind: "arrow" | "star" | "swirl" | "heart" | "flower" | "tape-x"; top: string; left: string; size?: number; rotate?: number }) {
  const d: Record<string, ReactNode> = {
    arrow: (
      <svg viewBox="0 0 100 60" width={size} height={size * 0.6} fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M5 30 C 30 5, 60 55, 95 30" />
        <path d="M85 22 L 95 30 L 86 38" />
      </svg>
    ),
    star: (
      <svg viewBox="0 0 50 50" width={size} height={size} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
        <path d="M25 6 L 28 22 L 44 25 L 28 28 L 25 44 L 22 28 L 6 25 L 22 22 Z" />
      </svg>
    ),
    swirl: (
      <svg viewBox="0 0 60 60" width={size} height={size} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
        <path d="M30 10 C 50 10, 50 50, 30 50 C 18 50, 18 30, 30 30 C 38 30, 38 42, 30 42" />
      </svg>
    ),
    heart: (
      <svg viewBox="0 0 50 50" width={size} height={size} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
        <path d="M25 14 C 22 8, 12 8, 10 16 C 8 26, 25 40, 25 40 C 25 40, 42 26, 40 16 C 38 8, 28 8, 25 14 Z" />
      </svg>
    ),
    flower: (
      <svg viewBox="0 0 50 50" width={size} height={size} fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
        <circle cx="25" cy="25" r="4" fill="currentColor" opacity="0.3" />
        {[0, 60, 120, 180, 240, 300].map((a, i) => (
          <ellipse key={i} cx="25" cy="14" rx="5" ry="9" fill="none" stroke="currentColor" transform={`rotate(${a} 25 25)`} />
        ))}
      </svg>
    ),
    "tape-x": (
      <svg viewBox="0 0 50 50" width={size} height={size} fill="none" strokeLinecap="round">
        <line x1="5" y1="5" x2="45" y2="45" stroke="rgba(253,224,71,0.5)" strokeWidth="8" />
        <line x1="45" y1="5" x2="5" y2="45" stroke="rgba(253,224,71,0.5)" strokeWidth="8" />
      </svg>
    ),
  };
  return (
    <div className="doodle hidden md:block" style={{ top, left, transform: `rotate(${rotate}deg)` }}>
      {d[kind]}
    </div>
  );
}

/* ===================== Click-confetti listener (window-wide, paper scraps) ===================== */

export function useClickConfetti(enabled: boolean, accent: string) {
  const onClick = useCallback((e: MouseEvent) => {
    const t = e.target as HTMLElement | null;
    // skip clicks on form controls
    if (t?.closest("input, textarea, select, [data-no-confetti]")) return;
    import("../lib/sfx").then((m) => m.paperScrapConfetti(e.clientX, e.clientY, accent));
  }, [accent]);
  useEffect(() => {
    if (!enabled) return;
    window.addEventListener("click", onClick);
    return () => window.removeEventListener("click", onClick);
  }, [enabled, onClick]);
}

/* ===================== Hover-rustle listener ===================== */

export function useHoverRustle(enabled: boolean) {
  useEffect(() => {
    if (!enabled) return;
    let lastT = 0;
    const onOver = (e: MouseEvent) => {
      const now = performance.now();
      if (now - lastT < 220) return;
      const t = e.target as HTMLElement | null;
      if (!t?.closest(".paper, .polaroid, .sticky-note, button, a")) return;
      lastT = now;
      import("../lib/sfx").then((m) => m.playPaperRustle(0.06));
    };
    window.addEventListener("mouseover", onOver);
    return () => window.removeEventListener("mouseover", onOver);
  }, [enabled]);
}

/* ===================== Lanyard hook ===================== */

export type LanyardSpotify = {
  track_id?: string;
  timestamps?: { start: number; end: number };
  album?: string;
  album_art_url?: string;
  artist?: string;
  song?: string;
};

export type LanyardData = {
  discord_user?: {
    id: string;
    username: string;
    global_name?: string | null;
    avatar?: string | null;
    discriminator?: string;
  };
  discord_status?: "online" | "idle" | "dnd" | "offline";
  listening_to_spotify?: boolean;
  spotify?: LanyardSpotify | null;
};

export function useLanyard(userId: string) {
  const [data, setData] = useState<LanyardData | null>(null);
  useEffect(() => {
    if (!userId) return;
    setData(null);
    let ws: WebSocket | null = null;
    let heartbeat: ReturnType<typeof setInterval> | null = null;
    let reconnectTimer: ReturnType<typeof setTimeout> | null = null;
    let cancelled = false;

    const connect = () => {
      try {
        ws = new WebSocket("wss://api.lanyard.rest/socket");
      } catch {
        return;
      }
      ws.onopen = () => {
        ws?.send(JSON.stringify({ op: 2, d: { subscribe_to_id: userId } }));
      };
      ws.onmessage = (ev) => {
        try {
          const msg = JSON.parse(ev.data);
          if (msg.op === 1) {
            const interval = msg.d?.heartbeat_interval ?? 30000;
            heartbeat = setInterval(() => { ws?.send(JSON.stringify({ op: 3 })); }, interval);
          } else if (msg.t === "INIT_STATE" || msg.t === "PRESENCE_UPDATE") {
            setData(msg.d as LanyardData);
          }
        } catch { /* ignore */ }
      };
      ws.onclose = () => {
        if (heartbeat) clearInterval(heartbeat);
        heartbeat = null;
        if (!cancelled) reconnectTimer = setTimeout(connect, 4000);
      };
    };

    fetch(`https://api.lanyard.rest/v1/users/${userId}`)
      .then((r) => r.json())
      .then((j) => { if (j?.data && !cancelled) setData(j.data as LanyardData); })
      .catch(() => {});

    connect();
    return () => {
      cancelled = true;
      if (heartbeat) clearInterval(heartbeat);
      if (reconnectTimer) clearTimeout(reconnectTimer);
      ws?.close();
    };
  }, [userId]);
  return data;
}

/* ===================== View counter ===================== */

export function useViewCount() {
  const [count, setCount] = useState<number | null>(null);
  useEffect(() => {
    fetch("https://abacus.jasoncameron.dev/hit/brookerslyn-bio.devinapps.com/views")
      .then((r) => r.json())
      .then((j) => { if (typeof j?.value === "number") setCount(j.value); })
      .catch(() => {});
  }, []);
  return count;
}

/* ===================== Polaroid (with optional flip-on-hover) ===================== */

export function Polaroid({
  caption,
  flipNote,
  flipEnabled = true,
  children,
  className = "",
  width = 160,
  height = 160,
}: {
  caption: string;
  flipNote?: string;
  flipEnabled?: boolean;
  children: ReactNode;
  className?: string;
  width?: number;
  height?: number;
}) {
  const [flipped, setFlipped] = useState(false);
  const canFlip = flipEnabled && !!flipNote;
  return (
    <div
      className={`polaroid ${className}`}
      onMouseEnter={() => canFlip && setFlipped(true)}
      onMouseLeave={() => canFlip && setFlipped(false)}
      style={{ width: width + 16 }}
    >
      <div className="polaroid-inner" style={{ width, height, position: "relative", overflow: "hidden" }}>
        {!flipped ? (
          children
        ) : (
          <div className="absolute inset-0 flex items-center justify-center px-3 text-center" style={{ background: "#fafaf2", color: "#2b2316", fontFamily: "'Shadows Into Light', cursive" }}>
            {flipNote}
          </div>
        )}
      </div>
      <div className="polaroid-caption">{caption}</div>
    </div>
  );
}
