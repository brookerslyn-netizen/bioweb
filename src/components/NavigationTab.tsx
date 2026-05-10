import { Home, MessageSquare, Briefcase } from "lucide-react";

export type View = "main" | "comments" | "portfolio";

const TABS: { view: View; icon: React.ReactNode; label: string; washi: string }[] = [
  { view: "main",      icon: <Home size={24} />,          label: "home",      washi: "washi-pink" },
  { view: "portfolio", icon: <Briefcase size={24} />,     label: "portfolio", washi: "washi-mint" },
  { view: "comments",  icon: <MessageSquare size={24} />, label: "notes",     washi: "washi-yellow" },
];

export function NavigationTab({
  currentView,
  onViewChange,
}: {
  currentView: View;
  onViewChange: (view: View) => void;
}) {
  return (
    <div className="fixed top-1/2 left-0 -translate-y-1/2 z-[50] flex flex-col gap-3">
      {TABS.map(({ view, icon, label, washi }) => {
        const active = currentView === view;
        return (
          <button
            key={view}
            onClick={() => onViewChange(view)}
            title={label}
            aria-current={active ? "page" : undefined}
            className={`group relative flex items-center gap-3 transition-all ${active ? "translate-x-0" : "hover:translate-x-2"}`}
            style={{
              padding: "16px 22px",
              minHeight: 60,
              minWidth: 64,
              background: active
                ? "var(--p-surface-strong, var(--paper-cream))"
                : "var(--p-surface, rgba(255,255,255,0.06))",
              color: "var(--p-text)",
              borderRadius: "0 14px 14px 0",
              boxShadow: active
                ? "4px 6px 18px rgba(0,0,0,0.34), inset 0 1px 0 rgba(255,255,255,0.18)"
                : "3px 4px 12px rgba(0,0,0,0.24)",
              borderLeft: active ? `5px solid var(--p-accent)` : "5px solid transparent",
              fontFamily: "'Shadows Into Light', cursive",
              fontSize: 18,
              backdropFilter: "blur(6px)",
              WebkitBackdropFilter: "blur(6px)",
            }}
          >
            {/* washi tape accent — same style as home page */}
            <div
              className={`washi ${washi}`}
              style={{
                position: "absolute",
                top: -8,
                left: 10,
                right: 10,
                width: "auto",
                height: 16,
                opacity: active ? 0.92 : 0.7,
                transform: `rotate(${active ? -2 : -0.5}deg)`,
              }}
            />
            {icon}
            <span className="hidden md:inline" style={{ fontSize: 18 }}>{label}</span>
            {/* tooltip for small screens */}
            <span
              className="md:hidden absolute left-full ml-2 px-2 py-1 rounded text-xs font-mono uppercase tracking-widest whitespace-nowrap pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity"
              style={{ background: "var(--p-surface-strong)", color: "var(--p-text)", boxShadow: "0 2px 8px rgba(0,0,0,0.25)" }}
            >
              {label}
            </span>
          </button>
        );
      })}
    </div>
  );
}
