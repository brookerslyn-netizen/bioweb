import { useState, useRef, useCallback, useMemo } from "react";
import { Send, Heart, Trash2, EyeOff, Eye, Pin, PinOff } from "lucide-react";
import type { CommentEntry } from "../lib/config";

const API_BASE = import.meta.env.VITE_API_URL ||
  (import.meta.env.PROD ? "/api" : "http://localhost:3001/api");

/* stable layout per comment */
function noteStyle(id: string, index: number) {
  let h = 0;
  for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) >>> 0;
  const col = index % 3;
  const row = Math.floor(index / 3);
  const x = 60 + col * 340 + ((h % 60) - 30);
  const y = 60 + row * 280 + (((h >> 4) % 50) - 25);
  const rot = ((h % 14) - 7);
  const colors = [
    "#fff9c4", "#fce4ec", "#e8f5e9", "#e3f2fd", "#fff3e0", "#f3e5f5", "#fafaf2", "#fff8a8",
  ];
  const color = colors[h % colors.length];
  const tapeColors = ["rgba(255,158,193,0.7)", "rgba(110,231,183,0.7)", "rgba(253,224,71,0.7)", "rgba(196,181,253,0.7)", "rgba(251,191,146,0.7)"];
  const tape = tapeColors[h % tapeColors.length];
  const tapeAngle = ((h >> 6) % 30) - 15;
  return { x, y, rot, color, tape, tapeAngle };
}

export function CommentsSection({
  comments,
  onAddComment,
  isAdmin = false,
  onDeleteComment,
  onPatchComment,
}: {
  comments: CommentEntry[];
  onAddComment: (name: string, message: string) => Promise<void>;
  isAdmin?: boolean;
  onDeleteComment?: (id: string) => Promise<void>;
  onPatchComment?: (id: string, patch: { hidden?: boolean; pinned?: boolean }) => Promise<void>;
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
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      if (msg.includes("429") || msg.includes("already")) {
        setError("one note per visitor!");
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

  // visibility: hide hidden comments from non-admins; sort pinned first
  const visibleComments = useMemo(() => {
    const filtered = isAdmin ? comments : comments.filter((c) => !c.hidden);
    return [...filtered].sort((a, b) => {
      if (a.pinned && !b.pinned) return -1;
      if (!a.pinned && b.pinned) return 1;
      return 0;
    });
  }, [comments, isAdmin]);

  const cols = Math.max(3, Math.ceil(Math.sqrt(visibleComments.length + 1)));
  const boardW = cols * 340 + 120;
  const boardH = Math.ceil((visibleComments.length + 1) / cols) * 280 + 120;

  return (
    <div className="fixed inset-0 z-10 flex flex-col palette-bg">

      {/* scrapbook page texture */}
      <div className="absolute inset-0 pointer-events-none" style={{
        backgroundImage: `
          url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='200' height='200'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='4' stitchTiles='stitch'/><feColorMatrix values='0 0 0 0 0.4  0 0 0 0 0.3  0 0 0 0 0.15  0 0 0 0.08 0'/></filter><rect width='100%' height='100%' filter='url(%23n)'/></svg>")
        `,
        backgroundSize: "200px 200px",
        mixBlendMode: "multiply",
        opacity: 0.45,
      }} />

      {/* ruled lines across the page (use palette text color) */}
      <div className="absolute inset-0 pointer-events-none" style={{
        backgroundImage: "repeating-linear-gradient(0deg, transparent, transparent 31px, var(--p-text, rgba(91,67,38,0.06)) 31px, var(--p-text, rgba(91,67,38,0.06)) 32px)",
        opacity: 0.06,
      }} />

      {/* header */}
      <div className="relative flex-shrink-0 px-6 py-3 flex items-center gap-3 z-20 palette-surface"
        style={{ borderBottom: "2px solid var(--p-surface-border, rgba(0,0,0,0.12))" }}>
        {/* washi tape across header */}
        <div className="absolute top-0 left-8 right-8 h-5 rounded-sm" style={{
          background: "repeating-linear-gradient(135deg, rgba(253,224,71,0.75) 0px, rgba(253,224,71,0.75) 8px, rgba(254,240,138,0.75) 8px, rgba(254,240,138,0.75) 16px)",
          transform: "rotate(-0.5deg)",
        }} />
        <span className="palette-text" style={{ fontFamily: "'Shadows Into Light', cursive", fontSize: 26 }}>
          sticky notes
        </span>
        <span className="text-xs font-mono palette-text-muted">
          {visibleComments.length} notes · drag to explore{isAdmin ? " · admin" : ""}
        </span>
      </div>

      {/* pannable board */}
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
          <div className="absolute" style={{ left: 40, top: 30, width: 240, transform: "rotate(-2deg)", zIndex: 10 }}>
            {/* tape strip holding the note */}
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-16 h-5 rounded-sm" style={{
              background: "rgba(253,224,71,0.8)",
              transform: "rotate(2deg)",
              zIndex: 20,
              borderTop: "1px solid rgba(255,255,255,0.3)",
            }} />
            <div style={{
              background: "#fffde7",
              borderRadius: "2px",
              padding: "16px 14px 12px",
              boxShadow: "2px 4px 14px rgba(0,0,0,0.2), 0 1px 0 rgba(255,255,255,0.8) inset",
              backgroundImage: "repeating-linear-gradient(0deg, transparent, transparent 23px, rgba(91,67,38,0.06) 23px, rgba(91,67,38,0.06) 24px)",
            }}>
              {submitted ? (
                <div className="text-center py-4" style={{ fontFamily: "'Shadows Into Light', cursive", fontSize: 20, color: "#2b2316" }}>
                  note stuck! ♥
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
                      borderBottom: "1.5px solid rgba(91,67,38,0.2)",
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
                      style={{ background: "var(--p-accent)", color: "var(--p-accent-contrast)", boxShadow: "0 2px 6px rgba(0,0,0,0.2)" }}
                    >
                      <Send size={10} />
                      {isSubmitting ? "..." : "stick it"}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>

          {/* ── comment notes ── */}
          {visibleComments.map((comment, i) => {
            const { x, y, rot, color, tape, tapeAngle } = noteStyle(comment.id, i);
            const hearts = localHearts[comment.id] ?? comment.hearts ?? 0;
            const hearted = heartedIds.has(comment.id);

            return (
              <div key={comment.id} className="absolute group" style={{
                left: x, top: y, width: 220,
                transform: `rotate(${rot}deg)`,
                zIndex: comment.pinned ? 4 : (comment.hidden ? 0 : 1),
                opacity: comment.hidden ? 0.45 : 1,
                transition: "transform 200ms ease, z-index 0ms, opacity 200ms",
              }}>
                {/* pinned indicator */}
                {comment.pinned && (
                  <div className="absolute -top-3 -right-2 z-10 w-7 h-7 rounded-full flex items-center justify-center palette-accent-bg shadow-md" title="pinned">
                    <Pin size={12} />
                  </div>
                )}

                {/* tape strip holding the note */}
                <div className="absolute -top-2 left-1/2 -translate-x-1/2 h-4 rounded-sm" style={{
                  width: 50 + (i % 3) * 10,
                  background: tape,
                  transform: `rotate(${tapeAngle}deg)`,
                  zIndex: 5,
                  borderTop: "1px solid rgba(255,255,255,0.3)",
                  borderBottom: "1px solid rgba(0,0,0,0.04)",
                }} />

                {/* note paper */}
                <div className="transition-shadow" style={{
                  background: color,
                  borderRadius: "1px",
                  padding: "14px 12px 10px",
                  boxShadow: comment.pinned
                    ? "3px 5px 16px rgba(0,0,0,0.28), 0 0 0 2px var(--p-accent), 0 1px 0 rgba(255,255,255,0.7) inset"
                    : "2px 3px 10px rgba(0,0,0,0.18), 0 1px 0 rgba(255,255,255,0.7) inset",
                  backgroundImage: `linear-gradient(${color}, ${color}), repeating-linear-gradient(0deg, transparent, transparent 23px, rgba(91,67,38,0.06) 23px, rgba(91,67,38,0.06) 24px)`,
                  position: "relative",
                }}>
                  <div>
                    <div className="font-bold truncate" style={{ fontFamily: "'Shadows Into Light', cursive", fontSize: 16, color: "#2b2316" }}>
                      {comment.name}
                    </div>
                    <div className="mt-1 text-sm leading-6 break-words" style={{ fontFamily: "'Indie Flower', cursive", color: "#2b2316" }}>
                      {comment.message}
                    </div>
                    <div className="mt-2 flex items-center justify-between">
                      <span className="text-xs font-mono" style={{ color: "#5b4326", opacity: 0.6 }}>
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

                  {/* admin moderation toolbar */}
                  {isAdmin && (onPatchComment || onDeleteComment) && (
                    <div
                      className="absolute -bottom-3 left-1/2 -translate-x-1/2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity"
                      style={{ zIndex: 6 }}
                    >
                      {onPatchComment && (
                        <button
                          onClick={() => onPatchComment(comment.id, { pinned: !comment.pinned })}
                          title={comment.pinned ? "unpin" : "pin"}
                          className="w-6 h-6 rounded-full flex items-center justify-center palette-surface-strong palette-text shadow-md hover:scale-110"
                        >
                          {comment.pinned ? <PinOff size={11} /> : <Pin size={11} />}
                        </button>
                      )}
                      {onPatchComment && (
                        <button
                          onClick={() => onPatchComment(comment.id, { hidden: !comment.hidden })}
                          title={comment.hidden ? "unhide" : "hide"}
                          className="w-6 h-6 rounded-full flex items-center justify-center palette-surface-strong palette-text shadow-md hover:scale-110"
                        >
                          {comment.hidden ? <Eye size={11} /> : <EyeOff size={11} />}
                        </button>
                      )}
                      {onDeleteComment && (
                        <button
                          onClick={() => {
                            if (confirm(`delete "${comment.message.slice(0, 30)}…" from ${comment.name}?`)) {
                              onDeleteComment(comment.id);
                            }
                          }}
                          title="delete"
                          className="w-6 h-6 rounded-full flex items-center justify-center shadow-md hover:scale-110"
                          style={{ background: "#ef4444", color: "white" }}
                        >
                          <Trash2 size={11} />
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
