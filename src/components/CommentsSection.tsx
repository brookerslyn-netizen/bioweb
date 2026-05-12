import { useState, useRef, useCallback } from "react";
import { Send, Heart } from "lucide-react";
import type { CommentEntry } from "../lib/config";

const API_BASE = import.meta.env.VITE_API_URL ||
  (import.meta.env.PROD ? "/api" : "http://localhost:3001/api");

/* stable layout per comment */
function noteStyle(id: string, index: number) {
  let h = 0;
  for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) >>> 0;
  const col = index % 4;
  const row = Math.floor(index / 4);
  const x = 80 + col * 300 + ((h % 80) - 40);
  const y = 80 + row * 240 + (((h >> 4) % 60) - 30);
  const rot = ((h % 18) - 9);
  // paper-like colors, not too saturated
  const colors = [
    "#fff9c4", "#fce4ec", "#e8f5e9", "#e3f2fd", "#fff3e0", "#f3e5f5", "#fafaf2", "#fff8a8",
  ];
  const color = colors[h % colors.length];
  // washi tape color on some notes
  const washiColors = ["#f5a9b8", "#a7f3d0", "#fde68a", "#bfdbfe", "#ddd6fe", null, null, null];
  const washi = washiColors[h % washiColors.length];
  const washiAngle = ((h >> 8) % 180) - 90;
  return { x, y, rot, color, washi, washiAngle };
}

/* SVG thumbtack — looks like a real pin */
function Thumbtack({ color }: { color: string }) {
  return (
    <svg width="18" height="24" viewBox="0 0 18 24" style={{ filter: "drop-shadow(0 2px 3px rgba(0,0,0,0.5))", display: "block" }}>
      {/* pin head */}
      <circle cx="9" cy="7" r="6.5" fill={color} stroke="rgba(0,0,0,0.35)" strokeWidth="1" />
      <circle cx="7" cy="5" r="2" fill="rgba(255,255,255,0.35)" />
      {/* pin shaft */}
      <line x1="9" y1="13" x2="9" y2="23" stroke="rgba(0,0,0,0.55)" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

const PIN_COLORS = ["#ef4444", "#3b82f6", "#22c55e", "#f59e0b", "#a855f7", "#ec4899", "#14b8a6"];

export function CommentsSection({
  comments,
  onAddComment,
}: {
  comments: CommentEntry[];
  onAddComment: (name: string, message: string) => Promise<void>;
}) {
  const [name, setName] = useState("");
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [heartedIds, setHeartedIds] = useState<Set<string>>(() => {
    try { return new Set(JSON.parse(localStorage.getItem("brook-hearted") || "[]")); }
    catch { return new Set(); }
  });
  const [localHearts, setLocalHearts] = useState<Record<string, number>>({});

  // panning
  const boardRef = useRef<HTMLDivElement>(null);
  const isPanning = useRef(false);
  const panStart = useRef({ x: 0, y: 0 });
  const offset = useRef({ x: 40, y: 40 });
  const [pan, setPan] = useState({ x: 40, y: 40 });

  const onMouseDown = useCallback((e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest("button, input, textarea, a")) return;
    isPanning.current = true;
    panStart.current = { x: e.clientX - offset.current.x, y: e.clientY - offset.current.y };
    if (boardRef.current) boardRef.current.style.cursor = "grabbing";
  }, []);

  const onMouseMove = useCallback((e: React.MouseEvent) => {
    if (!isPanning.current) return;
    const nx = e.clientX - panStart.current.x;
    const ny = e.clientY - panStart.current.y;
    offset.current = { x: nx, y: ny };
    setPan({ x: nx, y: ny });
  }, []);

  const onMouseUp = useCallback(() => {
    isPanning.current = false;
    if (boardRef.current) boardRef.current.style.cursor = "grab";
  }, []);

  const touchStart = useRef({ x: 0, y: 0 });
  const onTouchStart = useCallback((e: React.TouchEvent) => {
    const t = e.touches[0];
    touchStart.current = { x: t.clientX - offset.current.x, y: t.clientY - offset.current.y };
  }, []);
  const onTouchMove = useCallback((e: React.TouchEvent) => {
    const t = e.touches[0];
    const nx = t.clientX - touchStart.current.x;
    const ny = t.clientY - touchStart.current.y;
    offset.current = { x: nx, y: ny };
    setPan({ x: nx, y: ny });
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !message.trim()) return;
    setIsSubmitting(true);
    setError(null);
    try {
      await onAddComment(name.trim(), message.trim());
      setName("");
      setMessage("");
      setSubmitted(true);
    } catch (err: any) {
      if (err.message?.includes("429") || err.message?.includes("already")) {
        setError("one note per visitor!");
      } else if (err.message?.includes("inappropriate")) {
        setError("watch your language!");
      } else {
        setError("failed to send, try again.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleHeart = async (id: string, currentHearts: number) => {
    if (heartedIds.has(id)) return;
    const newSet = new Set(heartedIds);
    newSet.add(id);
    setHeartedIds(newSet);
    localStorage.setItem("brook-hearted", JSON.stringify([...newSet]));
    setLocalHearts(prev => ({ ...prev, [id]: (prev[id] ?? currentHearts) + 1 }));
    try { await fetch(`${API_BASE}/comments/${id}/heart`, { method: "POST" }); }
    catch { /* ignore */ }
  };

  const cols = Math.max(4, Math.ceil(Math.sqrt(comments.length + 2)));
  const boardW = cols * 300 + 160;
  const boardH = Math.ceil((comments.length + 2) / cols) * 240 + 160;

  return (
    <div className="fixed inset-0 z-10 flex flex-col" style={{ background: "#c8a97e" }}>

      {/* cork board texture overlay */}
      <div className="absolute inset-0 pointer-events-none" style={{
        backgroundImage: `
          url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='120' height='120'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='4' stitchTiles='stitch'/><feColorMatrix values='0 0 0 0 0.45  0 0 0 0 0.28  0 0 0 0 0.1  0 0 0 0.18 0'/></filter><rect width='100%' height='100%' filter='url(%23n)'/></svg>")
        `,
        backgroundSize: "120px 120px",
        mixBlendMode: "multiply",
        opacity: 0.9,
      }} />

      {/* header — looks like a wooden frame top bar */}
      <div className="relative flex-shrink-0 px-6 py-3 flex items-center gap-3 z-20"
        style={{
          background: "linear-gradient(180deg, #8b5e3c 0%, #6b4423 100%)",
          boxShadow: "0 4px 12px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.15)",
        }}>
        {/* wood grain lines */}
        <div className="absolute inset-0 pointer-events-none opacity-20" style={{
          backgroundImage: "repeating-linear-gradient(90deg, transparent 0px, transparent 18px, rgba(0,0,0,0.3) 18px, rgba(0,0,0,0.3) 19px)",
        }} />
        <span style={{ fontFamily: "'Shadows Into Light', cursive", fontSize: 24, color: "#fde68a", textShadow: "0 1px 3px rgba(0,0,0,0.5)" }}>
          📌 corkboard
        </span>
        <span className="text-xs font-mono" style={{ color: "rgba(253,230,138,0.7)" }}>
          {comments.length} notes · drag to explore
        </span>
      </div>

      {/* board */}
      <div
        ref={boardRef}
        className="flex-1 overflow-hidden relative select-none"
        style={{ cursor: "grab" }}
        onMouseDown={onMouseDown}
        onMouseMove={onMouseMove}
        onMouseUp={onMouseUp}
        onMouseLeave={onMouseUp}
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onMouseUp}
      >
        <div style={{
          position: "absolute",
          width: boardW,
          height: boardH,
          transform: `translate(${pan.x}px, ${pan.y}px)`,
          willChange: "transform",
        }}>

          {/* ── write a note ── */}
          <div className="absolute" style={{ left: 60, top: 50, width: 230, transform: "rotate(-3deg)", zIndex: 10 }}>
            <div className="absolute -top-3 left-1/2 -translate-x-1/2" style={{ zIndex: 20 }}>
              <Thumbtack color="var(--p-accent)" />
            </div>
            {/* washi tape strip across top */}
            <div className="absolute -top-2 left-4 right-4 h-5 rounded-sm opacity-80" style={{
              background: "repeating-linear-gradient(135deg, rgba(253,224,71,0.9) 0px, rgba(253,224,71,0.9) 8px, rgba(254,240,138,0.9) 8px, rgba(254,240,138,0.9) 16px)",
              transform: "rotate(-1deg)",
            }} />
            <div style={{
              background: "#fffde7",
              borderRadius: "2px",
              padding: "14px 12px 12px",
              boxShadow: "2px 4px 12px rgba(0,0,0,0.35), 0 1px 0 rgba(255,255,255,0.8) inset",
              backgroundImage: "repeating-linear-gradient(0deg, transparent, transparent 23px, rgba(91,67,38,0.08) 23px, rgba(91,67,38,0.08) 24px)",
            }}>
              {submitted ? (
                <div className="text-center py-4" style={{ fontFamily: "'Shadows Into Light', cursive", fontSize: 20, color: "#2b2316" }}>
                  note pinned! ♥
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-2">
                  <div className="text-xs uppercase tracking-widest font-mono mb-1" style={{ color: "#5b4326" }}>leave a note</div>
                  {error && <div className="text-xs" style={{ color: "#ef4444", fontFamily: "'Indie Flower', cursive" }}>{error}</div>}
                  <input
                    type="text"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    placeholder="your name"
                    maxLength={30}
                    required
                    className="w-full px-2 py-1 text-sm outline-none"
                    style={{
                      background: "transparent",
                      borderBottom: "1.5px solid rgba(91,67,38,0.3)",
                      color: "#2b2316",
                      fontFamily: "'Indie Flower', cursive",
                    }}
                  />
                  <textarea
                    value={message}
                    onChange={e => setMessage(e.target.value.slice(0, 100))}
                    placeholder="say something..."
                    rows={3}
                    required
                    className="w-full px-0 py-1 text-sm resize-none outline-none"
                    style={{
                      background: "transparent",
                      color: "#2b2316",
                      fontFamily: "'Indie Flower', cursive",
                      lineHeight: "24px",
                    }}
                  />
                  <div className="flex items-center justify-between pt-1">
                    <span className="text-xs font-mono" style={{ color: "#5b4326" }}>{message.length}/100</span>
                    <button
                      type="submit"
                      disabled={isSubmitting || !name.trim() || !message.trim()}
                      className="flex items-center gap-1 px-3 py-1 rounded-full text-xs font-mono uppercase tracking-widest disabled:opacity-40 transition-transform hover:scale-105"
                      style={{ background: "var(--p-accent)", color: "var(--p-accent-contrast)", boxShadow: "0 2px 6px rgba(0,0,0,0.25)" }}
                    >
                      <Send size={10} />
                      {isSubmitting ? "..." : "pin it"}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>

          {/* ── comment notes ── */}
          {comments.map((comment, i) => {
            const { x, y, rot, color, washi, washiAngle } = noteStyle(comment.id, i);
            const hearts = localHearts[comment.id] ?? comment.hearts ?? 0;
            const hearted = heartedIds.has(comment.id);
            const pinColor = PIN_COLORS[i % PIN_COLORS.length];

            return (
              <div key={comment.id} className="absolute" style={{ left: x, top: y, width: 210, transform: `rotate(${rot}deg)`, zIndex: 1 }}>
                {/* thumbtack */}
                <div className="absolute -top-3 left-1/2 -translate-x-1/2" style={{ zIndex: 5 }}>
                  <Thumbtack color={pinColor} />
                </div>

                {/* optional washi tape strip */}
                {washi && (
                  <div className="absolute -top-2 left-2 right-2 h-4 opacity-75 rounded-sm" style={{
                    background: `repeating-linear-gradient(${washiAngle}deg, ${washi} 0px, ${washi} 6px, rgba(255,255,255,0.4) 6px, rgba(255,255,255,0.4) 12px)`,
                  }} />
                )}

                {/* note paper */}
                <div style={{
                  background: color,
                  borderRadius: "2px",
                  padding: "14px 10px 10px",
                  boxShadow: "3px 5px 14px rgba(0,0,0,0.38), 0 1px 0 rgba(255,255,255,0.7) inset",
                  // ruled lines
                  backgroundImage: `linear-gradient(${color}, ${color}), repeating-linear-gradient(0deg, transparent, transparent 23px, rgba(91,67,38,0.1) 23px, rgba(91,67,38,0.1) 24px)`,
                  backgroundBlendMode: "normal",
                  position: "relative",
                }}>
                  {/* red margin line */}
                  <div className="absolute top-0 bottom-0" style={{ left: 28, width: 1, background: "rgba(239,68,68,0.25)" }} />

                  <div className="pl-5">
                    <div className="font-bold truncate" style={{ fontFamily: "'Shadows Into Light', cursive", fontSize: 17, color: "#2b2316" }}>
                      {comment.name}
                    </div>
                    <div className="mt-1 text-sm leading-6 break-words" style={{ fontFamily: "'Indie Flower', cursive", color: "#2b2316" }}>
                      {comment.message}
                    </div>
                    <div className="mt-2 flex items-center justify-between">
                      <span className="text-xs font-mono" style={{ color: "#5b4326", opacity: 0.7 }}>
                        {new Date(comment.timestamp).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                      </span>
                      <button
                        onClick={() => handleHeart(comment.id, hearts)}
                        className="flex items-center gap-1 text-xs transition-transform hover:scale-125 active:scale-95"
                        style={{ color: hearted ? "#ef4444" : "#5b4326" }}
                        title={hearted ? "already hearted" : "heart this"}
                      >
                        <Heart size={13} fill={hearted ? "#ef4444" : "none"} strokeWidth={hearted ? 0 : 2} />
                        {hearts > 0 && <span style={{ fontFamily: "monospace" }}>{hearts}</span>}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
