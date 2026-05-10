import type { CustomPalette } from "./palettes";

/* ===== types ===== */

export type SectionKey =
  | "hero"
  | "marquee"
  | "about"
  | "now"
  | "connections"
  | "recent"
  | "favorites"
  | "guestbook"
  | "stickers"
  | "steam"
  | "stuffIMade"
  | "footer";

export type FavoritesItem = { emoji: string; label: string; note: string; imageUrl?: string };
export type GuestbookEntry = { id: string; name: string; message: string; date: string };
export type CommentEntry = { id: string; name: string; message: string; timestamp: string; hearts?: number };
export type StickerItem = { id: string; emoji: string; label: string; imageUrl?: string };
export type RecentItem = { id: string; emoji: string; text: string; imageUrl?: string };
export type StuffItem = { emoji: string; title: string; blurb: string; tag: string; url?: string };
export type YTTrack = { id: string; title: string; artist?: string };

export type AppConfig = {
  paletteId: string;
  customPalettes: CustomPalette[];
  bgUrl: string;

  hero: {
    name: string;
    handle: string;
    subtitle: string;
    typingLinesText: string;
    scrollHint: string;
    splashText: string;
    showSparkles: boolean;
  };

  about: {
    title: string;
    body: string;
    tagsText: string;
    age: string;
    timezone: string;
    showAge: boolean;
    showTimezone: boolean;
  };

  nowListText: string;

  contact: {
    email: string;
    showEmail: boolean;
    discordId: string;
    showCopyDiscord: boolean;
    spotifyUrl: string;
    steamId: string;
  };

  music: {
    enabled: boolean;
    volume: number; // 0..100
    autoplay: boolean;
    visual: "vinyl" | "cassette" | "none";
    crackle: boolean;
    playlist: YTTrack[];
  };

  favorites: {
    games: FavoritesItem[];
    music: FavoritesItem[];
    movies: FavoritesItem[];
    food: FavoritesItem[];
  };

  guestbook: GuestbookEntry[];
  stickers: StickerItem[];
  recent: RecentItem[];
  stuffIMade: StuffItem[];
  comments: CommentEntry[];

  stickyNote: {
    enabled: boolean;
    text: string;
  };

  marqueeText: string;

  footer: {
    headline: string;
    sub: string;
    bottom: string;
    transFlairText: string;
    showTransFlair: boolean;
  };

  features: {
    cursor: boolean;
    hearts: boolean;
    sparkles: boolean;
    marquee: boolean;
    music: boolean;
    transFlair: boolean;
    paperGrain: boolean;
    confetti: boolean;
    konami: boolean;
    polaroidFlip: boolean;
    spotify: boolean;
  };

  sectionOrder: SectionKey[];
};

/* ===== defaults (with all 100 user answers baked in) ===== */

export const DEFAULT_CONFIG: AppConfig = {
  paletteId: "forest",
  customPalettes: [],
  bgUrl: "",

  hero: {
    name: "brook",
    handle: "@brookerslyn",
    subtitle: "chronically dumb",
    typingLinesText: "touch grass\neat grass",
    scrollHint: "scroll for screamers",
    splashText: "click to steal your data",
    showSparkles: false,
  },

  about: {
    title: "about me",
    body:
      "mostly a lazy person idk type shit\nplay celeste it'll turn you into one of us",
    tagsText: "ass sleep schedule, true idiot, sucks at guitar",
    age: "16",
    timezone: "GMT+5",
    showAge: true,
    showTimezone: true,
  },

  nowListText:
    "still didnt beat farewell\neither in discord or playing guitar\nor sleeping idk",

  contact: {
    email: "brookerslyn@gmail.com",
    showEmail: true,
    discordId: "647814047210930223",
    showCopyDiscord: true,
    spotifyUrl:
      "https://open.spotify.com/user/bwgcycadjmtonviwisal8vnp8?si=5c905528ace34b0f",
    steamId: "",
  },

  music: {
    enabled: true,
    volume: 50,
    autoplay: true,
    visual: "vinyl",
    crackle: true,
    playlist: [
      { id: "3IpM7RK0GeY", title: "track 1" },
    ],
  },

  favorites: {
    games: [
      { emoji: "🍓", label: "celeste", note: "still on farewell" },
    ],
    music: [
      { emoji: "🎸", label: "edit me", note: "from the admin panel" },
    ],
    movies: [
      { emoji: "🎬", label: "edit me", note: "from the admin panel" },
    ],
    food: [
      { emoji: "🍜", label: "edit me", note: "from the admin panel" },
    ],
  },

  guestbook: [],
  stickers: [],
  recent: [],
  stuffIMade: [],
  comments: [],

  stickyNote: {
    enabled: false,
    text: "edit this note from the admin panel",
  },

  marqueeText: "touch grass • eat grass • git gud",

  footer: {
    headline: "see ya",
    sub: "",
    bottom: "",
    transFlairText: "TRANS PEOPLE CAN DOUBLE JUMP",
    showTransFlair: true,
  },

  features: {
    cursor: true,
    hearts: false,
    sparkles: false,
    marquee: true,
    music: true,
    transFlair: true,
    paperGrain: true,
    confetti: true,
    konami: true,
    polaroidFlip: true,
    spotify: true,
  },

  sectionOrder: [
    "hero",
    "marquee",
    "about",
    "now",
    "connections",
    "recent",
    "favorites",
    "guestbook",
    "stickers",
    "steam",
    "stuffIMade",
    "footer",
  ],
};

/* ===== persistence ===== */

const CONFIG_KEY = "brook-config";
const HISTORY_KEY = "brook-config-history";
const HISTORY_LIMIT = 10;
const API_BASE = import.meta.env.VITE_API_URL || 
  (import.meta.env.PROD 
    ? "/api"  // In production, API will be on same domain
    : "http://localhost:3001/api");

export function clearConfigCache() {
  localStorage.removeItem(CONFIG_KEY);
  console.log('Config cache cleared');
}

export async function loadConfig(): Promise<AppConfig> {
  try {
    // Try to load from API first
    console.log('Loading config from API...');
    const response = await fetch(`${API_BASE}/config`);
    if (response.ok) {
      const config = await response.json();
      console.log('Loaded config from API:', config);
      // Cache in localStorage as fallback
      localStorage.setItem(CONFIG_KEY, JSON.stringify(config));
      return config;
    }
  } catch (error) {
    console.warn('Failed to load from API, falling back to localStorage:', error);
  }
  
  // Fallback to localStorage
  try {
    const raw = localStorage.getItem(CONFIG_KEY);
    if (!raw) return DEFAULT_CONFIG;
    const parsed = JSON.parse(raw) as Partial<AppConfig>;
    return mergeConfig(DEFAULT_CONFIG, parsed);
  } catch {
    return DEFAULT_CONFIG;
  }
}

export function mergeConfig(base: AppConfig, override: Partial<AppConfig>): AppConfig {
  return {
    ...base,
    ...override,
    hero: { ...base.hero, ...(override.hero ?? {}) },
    about: { ...base.about, ...(override.about ?? {}) },
    contact: { ...base.contact, ...(override.contact ?? {}) },
    music: {
      ...base.music,
      ...(override.music ?? {}),
      playlist: override.music?.playlist ?? base.music.playlist,
    },
    favorites: { ...base.favorites, ...(override.favorites ?? {}) },
    stickyNote: { ...base.stickyNote, ...(override.stickyNote ?? {}) },
    footer: { ...base.footer, ...(override.footer ?? {}) },
    features: { ...base.features, ...(override.features ?? {}) },
    customPalettes: override.customPalettes ?? base.customPalettes,
    guestbook: override.guestbook ?? base.guestbook,
    stickers: override.stickers ?? base.stickers,
    recent: override.recent ?? base.recent,
    stuffIMade: override.stuffIMade ?? base.stuffIMade,
    comments: override.comments ?? base.comments,
    sectionOrder: override.sectionOrder ?? base.sectionOrder,
  };
}

export async function saveConfig(c: AppConfig): Promise<void> {
  try {
    // Save to API
    const response = await fetch(`${API_BASE}/config`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(c),
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    // Also save to localStorage as backup
    localStorage.setItem(CONFIG_KEY, JSON.stringify(c));
  } catch (error) {
    console.error('Failed to save to API, saving to localStorage only:', error);
    // Fallback to localStorage only
    localStorage.setItem(CONFIG_KEY, JSON.stringify(c));
  }
}

/* ===== undo history (last 10 snapshots) ===== */

export function pushHistory(prev: AppConfig) {
  try {
    const raw = localStorage.getItem(HISTORY_KEY);
    const arr: AppConfig[] = raw ? JSON.parse(raw) : [];
    arr.push(prev);
    while (arr.length > HISTORY_LIMIT) arr.shift();
    localStorage.setItem(HISTORY_KEY, JSON.stringify(arr));
  } catch {
    /* ignore */
  }
}

export function popHistory(): AppConfig | null {
  try {
    const raw = localStorage.getItem(HISTORY_KEY);
    if (!raw) return null;
    const arr: AppConfig[] = JSON.parse(raw);
    const last = arr.pop();
    localStorage.setItem(HISTORY_KEY, JSON.stringify(arr));
    return last ?? null;
  } catch {
    return null;
  }
}

export function clearHistory() {
  localStorage.removeItem(HISTORY_KEY);
}

/* ===== auth (admin gate) ===== */

const ADMIN_KEY = "brooksecretpasswordwow";
const ADMIN_FLAG = "brook-admin";

export function checkAdminAuth(): boolean {
  try {
    const url = new URL(window.location.href);
    const k = url.searchParams.get("admin");
    if (k === ADMIN_KEY) {
      sessionStorage.setItem(ADMIN_FLAG, "1");
      // strip the param so it doesn't sit in the URL
      url.searchParams.delete("admin");
      window.history.replaceState({}, "", url.toString());
      return true;
    }
  } catch {
    /* ignore */
  }
  return sessionStorage.getItem(ADMIN_FLAG) === "1";
}

export function logoutAdmin() {
  sessionStorage.removeItem(ADMIN_FLAG);
}

/* ===== text helpers (split at render, never normalize during typing) ===== */

export function splitLines(s: string): string[] {
  return s.split("\n").map((l) => l.trim()).filter(Boolean);
}

export function splitTags(s: string): string[] {
  return s.split(",").map((t) => t.trim()).filter(Boolean);
}

export function uid(): string {
  return Math.random().toString(36).slice(2, 10);
}
