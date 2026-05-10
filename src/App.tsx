import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Pencil } from "lucide-react";
import "./App.css";
import bgGif from "./assets/bg/dreamy.gif";

import {
  applyBuiltinPalette,
  applyPaletteVars,
  customPaletteToVars,
  BUILTIN_PALETTES,
} from "./lib/palettes";
import { loadConfig, saveConfig, pushHistory, checkAdminAuth, logoutAdmin, type AppConfig, type SectionKey, } from "./lib/config";

const API_BASE = import.meta.env.VITE_API_URL || 
  (import.meta.env.PROD 
    ? "/api"  // In production, API will be on same domain
    : "http://localhost:3001/api");

import {
  PencilCursor,
  BerryFollower,
  Splash,
  StickyNoteBar,
  Doodle,
  useKonami,
  useClickConfetti,
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
  StuffIMadeSection,
  FooterSection,
  LastFmSection,
} from "./components/sections";
import { AdminPanel } from "./components/AdminPanel";
import { NavigationTab, type View } from "./components/NavigationTab";
import { CommentsSection } from "./components/CommentsSection";
import { PortfolioPage } from "./components/PortfolioPage";

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

  /* === load config on mount === */
  useEffect(() => {
    const initializeConfig = async () => {
      try {
        const loadedConfig = await loadConfig();
        setConfig(loadedConfig);
      } catch (error) {
        console.error('Failed to load config:', error);
        // try localStorage before falling back to hardcoded defaults
        try {
          const raw = localStorage.getItem("brook-config");
          if (raw) {
            const parsed = JSON.parse(raw);
            setConfig(parsed);
            return;
          }
        } catch { /* ignore */ }
        setConfig({
          paletteId: "diary",
          customPalettes: [],
          bgUrl: "",
          hero: { name: "brook", handle: "@brookerslyn", subtitle: "chronically dumb", typingLinesText: "touch grass\neat grass", scrollHint: "scroll for screamers", splashText: "click to steal your data", showSparkles: false },
          about: { title: "about me", body: "mostly a lazy person idk type shit\nplay celeste it'll turn you into one of us", tagsText: "ass sleep schedule, true idiot, sucks at guitar", age: "16", timezone: "GMT+5", showAge: true, showTimezone: true },
          nowListText: "still didnt beat farewell\neither in discord or playing guitar\nor sleeping idk",
          contact: { email: "brookerslyn@gmail.com", showEmail: true, discordId: "647814047210930223", showCopyDiscord: true, spotifyUrl: "https://open.spotify.com/user/bwgcycadjmtonviwisal8vnp8?si=5c905528ace34b0f", steamId: "" },
          music: { enabled: true, volume: 50, autoplay: true, visual: "vinyl", crackle: true, playlist: [{ id: "3IpM7RK0GeY", title: "track 1" }] },
          favorites: { games: [{ emoji: "🍓", label: "celeste", note: "still on farewell" }], music: [{ emoji: "🎸", label: "edit me", note: "from the admin panel" }], movies: [{ emoji: "🎬", label: "edit me", note: "from the admin panel" }], food: [{ emoji: "🍜", label: "edit me", note: "from the admin panel" }] },
          guestbook: [], stickers: [], recent: [], stuffIMade: [], comments: [], portfolio: [], guitarCovers: [],
          stickyNote: { enabled: false, text: "edit this note from the admin panel" },
          marqueeText: "touch grass • eat grass • git gud",
          footer: { headline: "see ya", sub: "", bottom: "", transFlairText: "TRANS PEOPLE CAN DOUBLE JUMP", showTransFlair: true },
          features: { cursor: true, hearts: false, sparkles: false, marquee: true, music: true, transFlair: true, paperGrain: true, confetti: true, konami: true, polaroidFlip: true, spotify: true },
          sectionOrder: ["hero", "marquee", "about", "now", "connections", "recent", "favorites", "guestbook", "stickers", "steam", "stuffIMade", "footer"]
        });
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

  /* === persist config (debounced, skip initial load) === */
  const isFirstRender = useRef(true);
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    if (!config) return;
    // debounce — wait 800ms after last change before saving
    const timer = setTimeout(() => {
      saveConfig(config).catch(err => console.error('Failed to save config:', err));
    }, 800);
    return () => clearTimeout(timer);
  }, [config]);

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
    setTimeout(() => setEntered(true), 650);
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
    try {
      const response = await fetch(`${API_BASE}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, message }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || `HTTP error! status: ${response.status}`);
      if (config) {
        setConfig({ ...config, comments: [result.comment, ...(config.comments || [])] });
      }
    } catch (error: any) {
      console.error('Failed to add comment:', error.message);
      throw error;
    }
  };

  /* === render section by key === */
  const renderSection = (key: SectionKey) => {
    if (!config) return null;
    switch (key) {
      case "hero":
        return <HeroSection key="hero" config={config} />;
      case "marquee":
        return config.features.marquee ? (
          <MarqueeSection key="marquee" text={config.marqueeText} />
        ) : null;
      case "about":
        return <AboutSection key="about" config={config} />;
      case "now":
        return <NowSection key="now" config={config} />;
      case "connections":
        return <ConnectionsSection key="connections" config={config} apiBase={API_BASE} />;
      case "lastfm":
        return <LastFmSection key="lastfm" config={config} />;
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
      case "stuffIMade":
        return <StuffIMadeSection key="stuffIMade" config={config} />;
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

      {/* sections */}
      <main className="relative z-[1]">
        {entered && currentView === "main" && config?.sectionOrder.map((s) => renderSection(s))}
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
          />
        )}
      </main>

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

      {/* scattered footer doodles */}
      <Doodle kind="star" top="92%" left="6%" size={36} rotate={-10} />
      <Doodle kind="heart" top="88%" left="92%" size={32} rotate={20} />

      {/* @keyframes for marquee + blink (used by Typewriter cursor) */}
      <style>{`
        @keyframes marquee { 0% { transform: translateX(0); } 100% { transform: translateX(-50%); } }
        @keyframes blink { 50% { opacity: 0; } }
      `}</style>
    </div>
  );
}

export default App;
