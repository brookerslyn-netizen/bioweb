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

/* ===================== Pencil Cursor ===================== */

export function PencilCursor({ enabled }: { enabled: boolean }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!enabled) return;
    const el = ref.current;
    if (!el) return;
    const onMove = (e: MouseEvent) => {
      el.style.transform = `translate3d(${e.clientX}px, ${e.clientY}px, 0) translate(-2px, -22px)`;
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
      <svg viewBox="0 0 24 24" width="26" height="26" style={{ filter: "drop-shadow(0 1px 1px rgba(0,0,0,0.4))" }}>
        {/* tip */}
        <polygon points="2,22 6,18 7,21 5,23" fill="#1a1a1a" />
        <polygon points="3.5,21.6 6,19 6.6,20.5" fill="#5b4326" />
        {/* shaft */}
        <polygon points="6,18 18,6 22,10 10,22" fill="var(--p-accent)" stroke="#1a1a1a" strokeWidth="0.5" />
        {/* metal ferrule */}
        <polygon points="18,6 19.5,4.5 23.5,8.5 22,10" fill="#c9c9c9" stroke="#1a1a1a" strokeWidth="0.5" />
        {/* eraser */}
        <polygon points="19.5,4.5 21,3 25,7 23.5,8.5" fill="#f5a9b8" stroke="#1a1a1a" strokeWidth="0.5" />
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

/* ===================== Splash (no sparkles, just text) ===================== */

export function Splash({ onEnter, leaving, name, splashText }: {
  onEnter: () => void;
  leaving: boolean;
  name: string;
  splashText: string;
}) {
  return (
    <div
      onClick={onEnter}
      className={`fixed inset-0 z-50 cursor-pointer flex flex-col items-center justify-center text-center px-6 ${leaving ? "splash-fade-out" : ""}`}
    >
      <div className="absolute inset-0 -z-10 palette-veil" />
      <div className="absolute inset-0 -z-20 palette-bg" />
      <RansomNote
        name={name}
        sizes={[80, 90, 70, 95, 80]}
        className="palette-text-shadow"
        style={{ marginBottom: "1.5rem" }}
      />
      <p className="mt-6 text-2xl md:text-3xl palette-text-soft" style={{ fontFamily: "'Indie Flower', cursive" }}>
        {splashText}
      </p>
      <p className="mt-3 text-xs uppercase tracking-[0.3em] font-mono palette-text-muted">
        [ click anywhere ]
      </p>
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

/* ===================== Doodles (scattered SVGs) ===================== */

export function Doodle({ kind, top, left, size = 60, rotate = 0 }: { kind: "arrow" | "star" | "swirl" | "heart"; top: string; left: string; size?: number; rotate?: number }) {
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
