import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Pencil, ChevronLeft, Music2 } from "lucide-react";
import "./App.css";
import bgGif from "./assets/bg/dreamy.gif";

import {
  applyBuiltinPalette,
  applyPaletteVars,
  customPaletteToVars,
  BUILTIN_PALETTES,
} from "./lib/palettes";
import { loadConfig, saveConfig, pushHistory, checkAdminAuth, logoutAdmin, getAdminKey, DEFAULT_CONFIG, type AppConfig, type SectionKey, } from "./lib/config";

const API_BASE = import.meta.env.VITE_API_URL || 
  (import.meta.env.PROD 
    ? "/api"  // In production, API will be on same domain
    : "http://localhost:3001/api");

import {
  PencilCursor,
  BerryFollower,
  Splash,
  StickyNoteBar,
  useKonami,
  useClickConfetti,
  useNameSurprise,
} from "./components/parts";
import {
  HeroSection,
  MarqueeSection,
  AboutSection,
  NowSection,
  ConnectionsSection,
  RecentSection,
  FavoritesSection,
  GuestbookSection,
  StickersSection,
  SteamSection,
  FooterSection,
} from "./components/sections";
import { AdminPanel } from "./components/AdminPanel";
import { NavigationTab, type View } from "./components/NavigationTab";
import { CommentsSection } from "./components/CommentsSection";
import { PortfolioPage } from "./components/PortfolioPage";
import { MusicPlayer } from "./components/widgets";

function App() {
  const [config, setConfig] = useState<AppConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [entered, setEntered] = useState(false);
  const [leaving, setLeaving] = useState(false);
  const [adminOpen, setAdminOpen] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [stickyDismissed, setStickyDismissed] = useState(
    () => sessionStorage.getItem("brook-sticky-dismissed") === "1",
  );
  const [berryOn, setBerryOn] = useState(false);
  const [currentView, setCurrentView] = useState<View>("main");
  const initialAuthRan = useRef(false);
  const { handleNameClick } = useNameSurprise();

  /* === load config on mount === */
  useEffect(() => {
    const initializeConfig = async () => {
      try {
        const loadedConfig = await loadConfig();
        setConfig(loadedConfig);
      } catch (error) {
        console.error('Failed to load config:', error);
        // Fallback to the baked-in default when the API is unreachable.
        setConfig(DEFAULT_CONFIG);
      } finally {
        setLoading(false);
      }
    };
    
    initializeConfig();
  }, []);

  /* === auth gate (run once on mount) === */
  useEffect(() => {
    if (initialAuthRan.current) return;
    initialAuthRan.current = true;
    setIsAdmin(checkAdminAuth());
  }, []);

  /* === apply palette whenever paletteId or customPalettes change === */
  useEffect(() => {
    if (!config) return;
    const customs = config.customPalettes ?? [];
    const custom = customs.find((p) => p.id === config.paletteId);
    if (custom) {
      applyPaletteVars(customPaletteToVars(custom.colors));
    } else {
      applyBuiltinPalette(config.paletteId);
    }
  }, [config?.paletteId, config?.customPalettes]);

  /* === persist config === only admins save to the API, so random visitors
     can't round-trip a stale config back to the server and clobber live data
     (comments, for example). Non-admins still get a localStorage cache. */
  useEffect(() => {
    if (!config) return;
    if (isAdmin) {
      saveConfig(config).catch(error => {
        console.error('Failed to save config:', error);
      });
    } else {
      try { localStorage.setItem("brook-config", JSON.stringify(config)); } catch { /* ignore */ }
    }
  }, [config, isAdmin]);

  /* === periodic refresh of comments so new posts appear without a reload === */
  useEffect(() => {
    if (!config) return;
    let cancelled = false;

    const refresh = async () => {
      try {
        // Prefer the lightweight endpoint; fall back to re-reading config if
        // the deployed backend is older and doesn't expose /api/comments.
        let comments: AppConfig["comments"] | null = null;
        const r = await fetch(`${API_BASE}/comments`);
        if (r.ok) {
          const data = await r.json();
          if (Array.isArray(data?.comments)) comments = data.comments;
        } else {
          const cr = await fetch(`${API_BASE}/config`);
          if (cr.ok) {
            const full = await cr.json();
            if (Array.isArray(full?.comments)) comments = full.comments;
          }
        }
        if (cancelled || !comments) return;
        setConfig((c) => c && comments ? { ...c, comments } : c);
      } catch { /* ignore */ }
    };

    // refresh when the user flips to the comments view + every 30s while it's open
    if (currentView === "comments") {
      refresh();
      const iv = setInterval(refresh, 30_000);
      return () => { cancelled = true; clearInterval(iv); };
    }
    return () => { cancelled = true; };
  }, [currentView, config?.comments?.length]);

  /* === keyboard shortcut: ctrl+. opens admin (only if authed) === */
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === ".") {
        if (isAdmin) {
          e.preventDefault();
          setAdminOpen((o) => !o);
        }
      }
      if (e.key === "Escape") setAdminOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isAdmin]);

  /* === konami easter egg === */
  useKonami(() => setBerryOn((on) => !on), config?.features.konami ?? false);

  /* === click confetti + hover rustle === */
  const accent = useMemo(() => {
    if (!config) return "#c084fc"; // fallback color
    const custom = (config.customPalettes ?? []).find((p) => p.id === config.paletteId);
    if (custom) return custom.colors.accent;
    const b = BUILTIN_PALETTES.find((p) => p.id === config.paletteId) ?? BUILTIN_PALETTES[0];
    return b.vars["--p-accent"];
  }, [config?.paletteId, config?.customPalettes]);
  useClickConfetti((entered && config?.features.confetti) ?? false, accent);
  // useHoverRustle(entered); // Disabled - hover sound removed

  /* === splash transition === */
  const handleEnter = useCallback(() => {
    setLeaving(true);
    // splash has already run its own transition; unmount right away
    setTimeout(() => setEntered(true), 50);
  }, []);

  function logout() {
    logoutAdmin();
    setIsAdmin(false);
    setAdminOpen(false);
  }

  function dismissSticky() {
    sessionStorage.setItem("brook-sticky-dismissed", "1");
    setStickyDismissed(true);
  }

  const handleAddComment = async (name: string, message: string) => {
    const response = await fetch(`${API_BASE}/comments`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, message }),
    });
    const result = await response.json().catch(() => ({}));
    if (!response.ok) {
      throw new Error(result.error || `HTTP error! status: ${response.status}`);
    }
    if (config) {
      setConfig({
        ...config,
        comments: [result.comment, ...(config.comments || [])]
      });
    }
  };

  /* === admin moderation: delete / hide / pin === */
  const adminAuthHeaders = (): HeadersInit => {
    const k = getAdminKey();
    return k ? { 'Content-Type': 'application/json', 'x-admin-key': k } : { 'Content-Type': 'application/json' };
  };

  const handleDeleteComment = async (id: string) => {
    if (!isAdmin) return;
    const r = await fetch(`${API_BASE}/comments/${id}`, {
      method: 'DELETE',
      headers: adminAuthHeaders(),
    });
    if (!r.ok) throw new Error('failed to delete');
    setConfig((c) => c ? { ...c, comments: (c.comments || []).filter((cm) => cm.id !== id) } : c);
  };

  const handlePatchComment = async (id: string, patch: { hidden?: boolean; pinned?: boolean }) => {
    if (!isAdmin) return;
    const r = await fetch(`${API_BASE}/comments/${id}`, {
      method: 'PATCH',
      headers: adminAuthHeaders(),
      body: JSON.stringify(patch),
    });
    if (!r.ok) throw new Error('failed to patch');
    setConfig((c) => {
      if (!c) return c;
      return {
        ...c,
        comments: (c.comments || []).map((cm) => cm.id === id ? { ...cm, ...patch } : cm),
      };
    });
  };

  /* === render section by key === */
  const renderSection = (key: SectionKey) => {
    if (!config) return null;
    switch (key) {
      case "hero":
        return <HeroSection key="hero" config={config} onNameClick={handleNameClick} />;
      case "marquee":
        return config.features.marquee ? (
          <MarqueeSection key="marquee" text={config.marqueeText} />
        ) : null;
      case "about":
        return <AboutSection key="about" config={config} />;
      case "now":
        return <NowSection key="now" config={config} />;
      case "connections":
        return <ConnectionsSection key="connections" config={config} />;
      case "recent":
        return <RecentSection key="recent" config={config} />;
      case "favorites":
        return <FavoritesSection key="favorites" config={config} />;
      case "guestbook":
        return <GuestbookSection key="guestbook" config={config} />;
      case "stickers":
        return <StickersSection key="stickers" config={config} />;
      case "steam":
        return <SteamSection key="steam" config={config} />;
      case "footer":
        return <FooterSection key="footer" config={config} />;
      default:
        return null;
    }
  };

  const bgUrl = config?.bgUrl || bgGif;

  if (loading || !config) {
    return (
      <div className="fixed inset-0 bg-black flex items-center justify-center text-white">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <div>Loading...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative">
      {/* background gif */}
      <div className="bg-gif" style={{ backgroundImage: `url(${bgUrl})` }} />
      {/* veil */}
      <div className="fixed inset-0 -z-[1] palette-veil pointer-events-none" />
      {/* paper grain */}
      {config?.features.paperGrain && <div className="grain" />}

      {/* pencil cursor + konami berry */}
      {config?.features.cursor && <PencilCursor enabled={true} />}
      <BerryFollower active={berryOn} />

      {/* Navigation Tab */}
      <NavigationTab currentView={currentView} onViewChange={setCurrentView} />

      {/* splash */}
      {!entered && (
        <Splash
          onEnter={handleEnter}
          leaving={leaving}
          name={config?.hero.name || "brook"}
          splashText={config?.hero.splashText || ""}
        />
      )}

      {/* admin button (only if authed) */}
      {isAdmin && entered && !adminOpen && (
        <button
          onClick={() => setAdminOpen(true)}
          aria-label="open admin"
          className="fixed top-3 right-3 z-[55] w-11 h-11 rounded-full palette-accent-bg flex items-center justify-center shadow-lg hover:scale-110 transition"
          title="admin (ctrl+.)"
        >
          <Pencil size={18} />
        </button>
      )}

      {/* sticky note bar (admin-editable) */}
      {entered && config?.stickyNote.enabled && !stickyDismissed && (
        <StickyNoteBar text={config.stickyNote.text} onDismiss={dismissSticky} />
      )}

      {/* sections — home always renders underneath so it's visible through the tear */}
      <main className="relative z-[1]">
        {currentView === "main" && config?.sectionOrder.map((s) => renderSection(s))}
        {entered && currentView === "portfolio" && (
          <PortfolioPage
            projects={config?.portfolio || []}
            covers={config?.guitarCovers || []}
          />
        )}
        {entered && currentView === "comments" && (
          <CommentsSection
            comments={config?.comments || []}
            onAddComment={handleAddComment}
            isAdmin={isAdmin}
            onDeleteComment={handleDeleteComment}
            onPatchComment={handlePatchComment}
          />
        )}
      </main>

      {/* Persistent music player — rendered once so playback survives view switches.
          Lives in a collapsible dock so it doesn't cover scrolled content. */}
      {entered && config && (config.music.enabled && config.features.music) && (
        <MusicDock>
          <MusicPlayer
            playlist={config.music.playlist}
            volume={config.music.volume}
            autoplay={config.music.autoplay}
            visual={config.music.visual}
            crackle={config.music.crackle && config.features.transFlair}
            enabled={config.music.enabled && config.features.music}
          />
        </MusicDock>
      )}

      {/* admin panel */}
      {isAdmin && config && (
        <AdminPanel
          open={adminOpen}
          onClose={() => setAdminOpen(false)}
          config={config}
          set={(updater) => {
            if (!config) return;
            // snapshot pre-change to enable undo
            pushHistory(config);
            setConfig((prev) => updater(prev!));
          }}
          onLogout={logout}
        />
      )}



      {/* @keyframes for marquee + blink (used by Typewriter cursor) */}
      <style>{`
        @keyframes marquee { 0% { transform: translateX(0); } 100% { transform: translateX(-50%); } }
        @keyframes blink { 50% { opacity: 0; } }
      `}</style>
    </div>
  );
}

export default App;

/* ===================== MusicDock =====================
 * Side-mounted collapsible wrapper for the persistent MusicPlayer. The player
 * always stays mounted (playback survives view switches + keeps going while
 * minimized). When minimized, the panel slides off the right edge leaving
 * just a small pull-tab with a chevron sticking out of the right side.
 *
 * State is persisted to localStorage so the user's preference sticks.
 */
const MUSIC_DOCK_KEY = "brook-music-dock";
function MusicDock({ children }: { children: React.ReactNode }) {
  const [minimized, setMinimized] = useState<boolean>(() => {
    try { return localStorage.getItem(MUSIC_DOCK_KEY) === "1"; } catch { return false; }
  });

  useEffect(() => {
    try { localStorage.setItem(MUSIC_DOCK_KEY, minimized ? "1" : "0"); } catch { /* ignore */ }
  }, [minimized]);

  return (
    <div
      className="fixed top-1/2 -translate-y-1/2 right-0 z-[45] pointer-events-none"
    >
      {/* Panel — slides off to the right when minimized. */}
      <div
        className="relative pointer-events-auto transition-transform duration-300 ease-out"
        style={{
          width: "min(92vw, 420px)",
          // when minimized, shift the whole panel off-screen so only the tab remains
          transform: minimized ? "translateX(100%)" : "translateX(-12px)",
          willChange: "transform",
        }}
      >
        {/* Pull tab sits on the LEFT edge of the panel and stays poking out of
            the right side of the screen when the panel slides away. */}
        <button
          onClick={() => setMinimized((m) => !m)}
          aria-label={minimized ? "show music player" : "hide music player"}
          title={minimized ? "pull out" : "hide"}
          className="absolute top-1/2 -translate-y-1/2 flex items-center justify-center gap-1 shadow-md hover:scale-[1.04] active:scale-95 transition-transform"
          style={{
            left: -22,
            width: 22,
            minHeight: 68,
            padding: "6px 2px",
            borderRadius: "10px 0 0 10px",
            background: "var(--p-surface-strong)",
            color: "var(--p-text)",
            border: "1px solid rgba(0,0,0,0.12)",
            borderRight: "none",
            flexDirection: "column",
            fontFamily: "'Shadows Into Light', cursive",
            fontSize: 12,
            lineHeight: 1,
          }}
        >
          <ChevronLeft
            size={14}
            style={{
              transition: "transform 250ms ease",
              transform: minimized ? "rotate(0deg)" : "rotate(180deg)",
            }}
          />
          <Music2 size={12} />
        </button>

        {children}
      </div>
    </div>
  );
}
