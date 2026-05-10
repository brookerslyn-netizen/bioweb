import { Home, MessageSquare, Briefcase } from "lucide-react";

export type View = "main" | "comments" | "portfolio";

const TABS: { view: View; icon: React.ReactNode; label: string; washiColor: string }[] = [
  { view: "main",      icon: <Home size={20} />,          label: "home",      washiColor: "rgba(255,158,193,0.85)" },
  { view: "portfolio", icon: <Briefcase size={20} />,     label: "portfolio", washiColor: "rgba(110,231,183,0.85)" },
  { view: "comments",  icon: <MessageSquare size={20} />, label: "notes",     washiColor: "rgba(253,224,71,0.85)" },
];

export function NavigationTab({
  currentView,
  onViewChange,
}: {
  currentView: View;
  onViewChange: (view: View) => void;
}) {
  return (
    <div className="fixed top-1/2 left-0 -translate-y-1/2 z-[50] flex flex-col gap-2">
      {TABS.map(({ view, icon, label, washiColor }) => {
        const active = currentView === view;
        return (
          <button
            key={view}
            onClick={() => onViewChange(view)}
            title={label}
            aria-current={active ? "page" : undefined}
            className={`group relative flex items-center gap-2 transition-all ${active ? "translate-x-0" : "hover:translate-x-1.5"}`}
            style={{
              padding: "10px 14px",
              minHeight: 44,
              background: active
                ? "var(--p-surface-strong, var(--paper-cream))"
                : "var(--p-surface, rgba(255,255,255,0.06))",
              color: "var(--p-text)",
              borderRadius: "0 10px 10px 0",
              boxShadow: active
                ? "3px 4px 14px rgba(0,0,0,0.32), inset 0 1px 0 rgba(255,255,255,0.18)"
                : "2px 3px 10px rgba(0,0,0,0.22)",
              borderLeft: active ? `4px solid var(--p-accent)` : "4px solid transparent",
              fontFamily: "'Shadows Into Light', cursive",
              fontSize: 15,
              backdropFilter: "blur(6px)",
              WebkitBackdropFilter: "blur(6px)",
            }}
          >
            {/* washi tape accent */}
            <div
              className="absolute -top-1.5 left-2 right-2 h-2.5 rounded-sm"
              style={{
                background: washiColor,
                opacity: active ? 0.92 : 0.55,
                transform: `rotate(${active ? -1.5 : 0}deg)`,
              }}
            />
            {icon}
            <span className="hidden md:inline" style={{ fontSize: 14 }}>{label}</span>
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
