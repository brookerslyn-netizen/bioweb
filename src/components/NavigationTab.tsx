import { Home, MessageSquare, Briefcase } from "lucide-react";

export type View = "main" | "comments" | "portfolio";

const TABS: { view: View; icon: React.ReactNode; label: string }[] = [
  { view: "main",      icon: <Home size={18} />,        label: "home" },
  { view: "portfolio", icon: <Briefcase size={18} />,   label: "portfolio" },
  { view: "comments",  icon: <MessageSquare size={18} />, label: "notes" },
];

export function NavigationTab({
  currentView,
  onViewChange,
}: {
  currentView: View;
  onViewChange: (view: View) => void;
}) {
  return (
    <div className="fixed top-1/2 left-3 -translate-y-1/2 z-[50] flex flex-col gap-2">
      {TABS.map(({ view, icon, label }) => {
        const active = currentView === view;
        return (
          <button
            key={view}
            onClick={() => onViewChange(view)}
            title={label}
            className="group relative flex items-center justify-center w-10 h-10 rounded-xl transition-all hover:scale-110"
            style={{
              background: active ? "var(--p-accent)" : "var(--paper-cream)",
              color: active ? "var(--p-accent-contrast)" : "var(--paper-ink-soft)",
              boxShadow: active
                ? "0 4px 14px rgba(0,0,0,0.35)"
                : "0 2px 8px rgba(0,0,0,0.25)",
              border: active ? "none" : "1px solid rgba(0,0,0,0.1)",
            }}
          >
            {icon}
            {/* tooltip */}
            <span
              className="absolute left-12 px-2 py-1 rounded text-xs font-mono uppercase tracking-widest whitespace-nowrap pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity"
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
