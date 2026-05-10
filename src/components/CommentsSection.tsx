import { useState, useRef, useCallback } from "react";
import { Send, Heart, Pin } from "lucide-react";
import type { CommentEntry } from "../lib/config";

const API_BASE = import.meta.env.VITE_API_URL ||
  (import.meta.env.PROD ? "/api" : "http://localhost:3001/api");

/* deterministic position + rotation from comment id so it's stable across renders */
function noteStyle(id: string, index: number) {
  // simple hash from id string
  let h = 0;
  for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) >>> 0;
  const col = index % 4;
  const row = Math.floor(index / 4);
  const x = 60 + col * 280 + ((h % 60) - 30);
  const y = 60 + row * 220 + (((h >> 4) % 50) - 25);
  const rot = ((h % 14) - 7);
  const colors = ["#fff8a8", "#f5a9b8", "#a7f3d0", "#bfdbfe", "#fde68a", "#ddd6fe"];
  const color = colors[h % colors.length];
  return { x, y, rot, color };
}

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

  // panning state
  const boardRef = useRef<HTMLDivElement>(null);
  const isPanning = useRef(false);
  const panStart = useRef({ x: 0, y: 0 });
  const offset = useRef({ x: 0, y: 0 });
  const [pan, setPan] = useState({ x: 0, y: 0 });

  const onMouseDown = useCallback((e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest("button, input, textarea, a")) return;
    isPanning.current = true;
    panStart.current = { x: e.clientX - offset.current.x, y: e.clientY - offset.current.y };
    boardRef.current!.style.cursor = "grabbing";
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

  // touch panning
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
        setError("one comment per visitor!");
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
    try {
      await fetch(`${API_BASE}/comments/${id}/heart`, { method: "POST" });
    } catch { /* ignore */ }
  };

  // board size based on comment count
  const cols = Math.max(4, Math.ceil(Math.sqrt(comments.length + 1)));
  const boardW = cols * 280 + 120;
  const boardH = Math.ceil((comments.length + 1) / cols) * 220 + 120;

  return (
    <div className="fixed inset-0 z-10 flex flex-col" style={{ background: "var(--p-bg)" }}>
      {/* header */}
      <div className="flex-shrink-0 px-6 py-3 flex items-center gap-3 border-b"
        style={{ borderColor: "var(--p-surface-border)", background: "var(--p-surface)" }}>
        <Pin size={16} style={{ color: "var(--p-accent)" }} />
        <span style={{ fontFamily: "'Shadows Into Light', cursive", fontSize: 22, color: "var(--p-text)" }}>
          corkboard
        </span>
        <span className="text-xs font-mono ml-1" style={{ color: "var(--p-text-muted)" }}>
          {comments.length} notes · drag to pan
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
        {/* cork texture bg */}
        <div className="absolute inset-0 pointer-events-none" style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, rgba(91,67,38,0.08) 1px, transparent 0)`,
          backgroundSize: "24px 24px",
        }} />

        <div style={{
          position: "absolute",
          width: boardW,
          height: boardH,
          transform: `translate(${pan.x}px, ${pan.y}px)`,
          willChange: "transform",
        }}>
          {/* write a note card */}
          {!submitted ? (
            <div
              className="absolute"
              style={{
                left: 60, top: 60,
                width: 220,
                transform: "rotate(-2deg)",
                zIndex: 10,
              }}
            >
              {/* pin */}
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-4 h-4 rounded-full z-20 shadow-md"
                style={{ background: "var(--p-accent)", border: "2px solid rgba(0,0,0,0.3)" }} />
              <div className="rounded-sm p-3 shadow-xl"
                style={{ background: "#fff8a8", border: "1px solid rgba(0,0,0,0.08)" }}>
                <div className="text-xs font-mono uppercase tracking-widest mb-2" style={{ color: "#5b4326" }}>
                  leave a note
                </div>
                <form onSubmit={handleSubmit} className="space-y-2">
                  {error && <div className="text-xs" style={{ color: "#ef4444" }}>{error}</div>}
                  <input
                    type="text"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    placeholder="your name"
                    maxLength={30}
                    required
                    className="w-full px-2 py-1 rounded text-sm outline-none"
                    style={{ background: "rgba(255,255,255,0.6)", color: "#2b2316", fontFamily: "'Indie Flower', cursive", border: "1px solid rgba(0,0,0,0.12)" }}
                  />
                  <textarea
                    value={message}
                    onChange={e => setMessage(e.target.value.slice(0, 100))}
                    placeholder="say something..."
                    rows={3}
                    required
                    className="w-full px-2 py-1 rounded text-sm resize-none outline-none"
                    style={{ background: "rgba(255,255,255,0.6)", color: "#2b2316", fontFamily: "'Indie Flower', cursive", border: "1px solid rgba(0,0,0,0.12)" }}
                  />
                  <div className="flex items-center justify-between">
                    <span className="text-xs" style={{ color: "#5b4326" }}>{message.length}/100</span>
                    <button
                      type="submit"
                      disabled={isSubmitting || !name.trim() || !message.trim()}
                      className="flex items-center gap-1 px-2 py-1 rounded text-xs font-mono uppercase tracking-widest disabled:opacity-50"
                      style={{ background: "var(--p-accent)", color: "var(--p-accent-contrast)" }}
                    >
                      <Send size={10} />
                      {isSubmitting ? "..." : "pin it"}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          ) : (
            <div className="absolute" style={{ left: 60, top: 60, width: 220, transform: "rotate(-2deg)", zIndex: 10 }}>
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-4 h-4 rounded-full z-20 shadow-md"
                style={{ background: "var(--p-accent)", border: "2px solid rgba(0,0,0,0.3)" }} />
              <div className="rounded-sm p-4 shadow-xl text-center"
                style={{ background: "#fff8a8", fontFamily: "'Shadows Into Light', cursive", color: "#2b2316" }}>
                note pinned! ♥
              </div>
            </div>
          )}

          {/* comment sticky notes */}
          {comments.map((comment, i) => {
            const { x, y, rot, color } = noteStyle(comment.id, i);
            const hearts = localHearts[comment.id] ?? comment.hearts ?? 0;
            const hearted = heartedIds.has(comment.id);
            return (
              <div
                key={comment.id}
                className="absolute"
                style={{ left: x, top: y, width: 200, transform: `rotate(${rot}deg)`, zIndex: 1 }}
              >
                {/* pin */}
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-3.5 h-3.5 rounded-full shadow-md"
                  style={{ background: ["#ef4444","#3b82f6","#22c55e","#f59e0b","#a855f7"][i % 5], border: "2px solid rgba(0,0,0,0.25)" }} />
                <div className="rounded-sm p-3 shadow-lg"
                  style={{ background: color, border: "1px solid rgba(0,0,0,0.07)" }}>
                  <div className="font-bold truncate" style={{ fontFamily: "'Shadows Into Light', cursive", fontSize: 16, color: "#2b2316" }}>
                    {comment.name}
                  </div>
                  <div className="mt-1 text-sm leading-snug break-words" style={{ fontFamily: "'Indie Flower', cursive", color: "#2b2316" }}>
                    {comment.message}
                  </div>
                  <div className="mt-2 flex items-center justify-between">
                    <span className="text-xs" style={{ color: "#5b4326", fontFamily: "monospace" }}>
                      {new Date(comment.timestamp).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                    </span>
                    <button
                      onClick={() => handleHeart(comment.id, hearts)}
                      className="flex items-center gap-1 text-xs transition-transform hover:scale-110"
                      style={{ color: hearted ? "#ef4444" : "#5b4326" }}
                      title={hearted ? "already hearted" : "heart this"}
                    >
                      <Heart size={12} fill={hearted ? "#ef4444" : "none"} />
                      {hearts > 0 && <span>{hearts}</span>}
                    </button>
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
