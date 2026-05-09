import { useState } from "react";
import { MessageSquare, Send, Calendar } from "lucide-react";
import { Reveal, Doodle } from "./parts";
import type { CommentEntry } from "../lib/config";

export function CommentsSection({ 
  comments, 
  onAddComment 
}: { 
  comments: CommentEntry[]; 
  onAddComment: (name: string, message: string) => void;
}) {
  const [name, setName] = useState("");
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !message.trim()) return;

    setIsSubmitting(true);
    setError(null);
    try {
      await onAddComment(name.trim(), message.trim());
      setName("");
      setMessage("");
    } catch (error: any) {
      console.error("Failed to submit comment:", error);
      if (error.message?.includes('429') || error.message?.includes('already left a comment')) {
        setError("You've already left a comment! One comment per visitor.");
      } else {
        setError("Failed to submit comment. Please try again.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatDate = (timestamp: string) => {
    return new Date(timestamp).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <section className="px-4 py-8 max-w-2xl mx-auto">
      <Reveal>
        <div className="paper p-6 relative" style={{ minHeight: 300 }}>
          <div className="washi washi-pink" style={{ top: -8, left: 30, transform: "rotate(-4deg)" }} />
          <div className="washi washi-mint" style={{ top: -8, right: 30, transform: "rotate(4deg)" }} />

          <div className="flex items-center gap-2 text-[9px] uppercase tracking-widest font-mono paper-text-muted">
            <span style={{ color: "var(--p-accent)" }}>●</span> guest messages
          </div>
          <h2 className="mt-1 paper-text flex items-center gap-2" style={{ fontFamily: "'Shadows Into Light', cursive", fontSize: 32 }}>
            comments <MessageSquare size={24} className="inline" />
          </h2>

          {/* Comment Form */}
          <div className="mt-4 paper p-3">
            <form onSubmit={handleSubmit} className="space-y-2">
              {error && (
                <div className="text-xs paper-text-muted palette-accent-bg palette-accent-contrast p-2 rounded">
                  {error}
                </div>
              )}
              <div className="grid grid-cols-[120px_1fr] gap-2">
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="name"
                  className="px-2 py-1 paper-surface border border-p-surface-border rounded paper-text placeholder-paper-text-muted text-sm"
                  maxLength={30}
                  required
                />
                <button
                  type="submit"
                  disabled={isSubmitting || !name.trim() || !message.trim()}
                  className="palette-accent-bg palette-accent-contrast px-3 py-1 rounded font-mono text-xs uppercase tracking-widest hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
                >
                  <Send size={12} />
                  {isSubmitting ? "..." : "send"}
                </button>
              </div>
              <div>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="leave a quick message..."
                  className="w-full px-2 py-1 paper-surface border border-p-surface-border rounded paper-text placeholder-paper-text-muted resize-none text-sm"
                  rows={2}
                  maxLength={200}
                  required
                />
              </div>
            </form>
          </div>

          {/* Comments List */}
          <div className="mt-4 space-y-2 max-h-64 overflow-y-auto">
            {comments.length === 0 ? (
              <div className="text-center py-4 paper-text-muted italic text-sm">
                no comments yet - be the first!
              </div>
            ) : (
              comments.slice(0, 10).map((comment) => (
                <div key={comment.id} className="paper p-2 text-sm" style={{ transform: `rotate(${(Math.random() * 2 - 1)}deg)` }}>
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1">
                      <div className="font-bold paper-text" style={{ fontFamily: "'Shadows Into Light', cursive", fontSize: 16 }}>
                        {comment.name}
                      </div>
                      <div className="mt-1 paper-text whitespace-pre-wrap" style={{ fontFamily: "'Indie Flower', cursive", fontSize: 14 }}>
                        {comment.message}
                      </div>
                    </div>
                    <div className="text-xs paper-text-muted whitespace-nowrap">
                      {formatDate(comment.timestamp)}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Decorative Doodles */}
          <Doodle kind="heart" top="85%" left="5%" size={20} rotate={-15} />
          <Doodle kind="arrow" top="80%" left="85%" size={18} rotate={25} />
        </div>
      </Reveal>
    </section>
  );
}
