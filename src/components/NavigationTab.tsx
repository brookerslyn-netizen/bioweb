import { Home, MessageSquare, Briefcase } from "lucide-react";

export type View = "main" | "comments" | "portfolio";

const TABS: { view: View; icon: React.ReactNode; label: string; washiColor: string }[] = [
  { view: "main",      icon: <Home size={16} />,        label: "home",      washiColor: "rgba(255,158,193,0.85)" },
  { view: "portfolio", icon: <Briefcase size={16} />,   label: "portfolio", washiColor: "rgba(110,231,183,0.85)" },
  { view: "comments",  icon: <MessageSquare size={16} />, label: "notes",  washiColor: "rgba(253,224,71,0.85)" },
];

export function NavigationTab({
  currentView,
  onViewChange,
}: {
  currentView: View;
  onViewChange: (view: View) => void;
}) {
  return (
    <div className="fixed top-1/2 left-2 -translate-y-1/2 z-[50] flex flex-col gap-1.5">
      {TABS.map(({ view, icon, label, washiColor }) => {
        const active = currentView === view;
        return (
          <button
            key={view}
            onClick={() => onViewChange(view)}
            title={label}
            className="group relative flex items-center gap-1.5 transition-all hover:translate-x-1"
            style={{
              padding: "6px 10px",
              background: active ? "var(--paper-cream)" : "rgba(245,232,200,0.85)",
              color: "var(--paper-ink)",
              borderRadius: "0 6px 6px 0",
              boxShadow: active
                ? "2px 3px 10px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.7)"
                : "1px 2px 6px rgba(0,0,0,0.2)",
              borderLeft: active ? `3px solid var(--p-accent)` : "3px solid transparent",
              fontFamily: "'Shadows Into Light', cursive",
              fontSize: 13,
              position: "relative",
            }}
          >
            {/* washi tape accent */}
            <div
              className="absolute -top-1 left-1 right-1 h-2 rounded-sm"
              style={{
                background: washiColor,
                opacity: active ? 0.9 : 0.4,
                transform: `rotate(${active ? -1 : 0}deg)`,
              }}
            />
            {icon}
            <span className="hidden md:inline text-xs">{label}</span>
            {/* tooltip for mobile */}
            <span
              className="md:hidden absolute left-full ml-2 px-2 py-1 rounded text-xs font-mono uppercase tracking-widest whitespace-nowrap pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity"
              style={{ background: "var(--paper-cream)", color: "var(--paper-ink)", boxShadow: "0 2px 8px rgba(0,0,0,0.2)" }}
            >
              {label}
            </span>
          </button>
        );
      })}
    </div>
  );
}
