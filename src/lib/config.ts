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
  | "webring"
  | "footer";

export type FavoritesItem = { emoji: string; label: string; note: string; imageUrl?: string };
export type GuestbookEntry = { id: string; name: string; message: string; date: string };
export type CommentEntry = {
  id: string;
  name: string;
  message: string;
  timestamp: string;
  hearts?: number;
  hidden?: boolean;
  pinned?: boolean;
};
export type StickerItem = { id: string; emoji: string; label: string; imageUrl?: string };
export type RecentItem = { id: string; emoji: string; text: string; imageUrl?: string };
export type YTTrack = { id: string; title: string; artist?: string };
export type PortfolioProject = { id: string; title: string; blurb: string; tag: string; url?: string; imageUrl?: string; emoji: string };
export type GuitarCover = {
  id: string;
  title: string;
  youtubeId: string; // optional now; if empty + audioUrl set we render an audio player
  audioUrl?: string;
  coverImage?: string;
  note?: string;
};

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
    lastfmUsername?: string;
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
  comments: CommentEntry[];
  portfolio: PortfolioProject[];
  guitarCovers: GuitarCover[];

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

/* ===== defaults (live config snapshot) ===== */

export const DEFAULT_CONFIG: AppConfig = {
  paletteId: "diary",
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
      "mostly a lazy person idk type shit\nplay celeste it'll turn you into one of us\nyeah i also mod for roblox games who would've thought (alternate battlegrounds!!)\neat grass\n",
    tagsText: "ass sleep schedule, true idiot, sucks at guitar",
    age: "16",
    timezone: "GMT+5",
    showAge: true,
    showTimezone: true,
  },

  nowListText:
    "still didnt beat farewell\neither in discord or playing guitar\nor sleeping idk\nor not",

  contact: {
    email: "brookerslyn@gmail.com",
    showEmail: true,
    discordId: "647814047210930223",
    showCopyDiscord: true,
    spotifyUrl:
      "https://open.spotify.com/user/bwgcycadjmtonviwisal8vnp8?si=5c905528ace34b0f",
    steamId: "76561199702812419",
    lastfmUsername: "brookerslyn",
  },

  music: {
    enabled: true,
    volume: 100,
    autoplay: true,
    visual: "cassette",
    crackle: true,
    playlist: [
      { id: "Nmemc-b6cdU", title: "Summer Slack" },
      { id: "bIW0n36TUSQ", title: "Nareai Serve" },
      { id: "WpRcRYoHqxE", title: "DROP" },
    ],
  },

  favorites: {
    games: [
      { emoji: "🍓", label: "celeste", note: "still on farewell", imageUrl: "https://media.tenor.com/NjXUcFTS_EkAAAAj/madeline-celeste.gif" },
      { emoji: "★",  label: "omori", note: "heh 100% completion in 75 hours", imageUrl: "https://media.tenor.com/Z1iZAJCTQoUAAAAj/mewo.gif" },
      { emoji: "★",  label: "deltarune", note: "deltarune tomorrow", imageUrl: "https://i.redd.it/egbnebde4z5f1.gif" },
    ],
    music: [
      { emoji: "🎸", label: "kessoku band", note: "uh yeah its the group from bocchi the rock", imageUrl: "https://i.pinimg.com/originals/48/47/2b/48472b7707470c23b105a68746cd22bb.jpg" },
    ],
    movies: [
      { emoji: "🎬", label: "bocchi the rock", note: "thats surprising i didnt know", imageUrl: "https://m.media-amazon.com/images/I/91tiRtwMXsL.jpg" },
      { emoji: "★",  label: "Josee the Tiger and the Fish", note: "goated movie go watch it", imageUrl: "https://blog.alltheanime.com/wp-content/uploads/2022/06/Josee-the-Tiger-and-the-Fish.jpg" },
      { emoji: "★",  label: "jojos idk", note: "yeah jojo is peak i didnt watch stone ocean tho", imageUrl: "https://m.media-amazon.com/images/M/MV5BMzIyNzY4NTMtNmVhYS00OWFhLTkwMWMtOGFkNTdmNWU2ZDdiXkEyXkFqcGc@._V1_.jpg" },
    ],
    food: [
      { emoji: "🍜", label: "honestly no idea what to put here", note: "yeah no shit i dont know", imageUrl: "" },
    ],
  },

  guestbook: [],
  stickers: [
    { id: "67y4z1fp", emoji: "🌱", label: "madeline", imageUrl: "https://i.pinimg.com/originals/1c/9d/6c/1c9d6c8981fe59b7627dfd078f965d7f.gif" },
  ],
  recent: [],
  comments: [],
  portfolio: [
    { id: "bi9xgtrs", title: "brookerslyn.space", blurb: "personal bio website idk", tag: "web", emoji: "", imageUrl: "https://files.catbox.moe/ksr484.png", url: "https://www.brookerslyn.space/" },
  ],
  guitarCovers: [],

  stickyNote: {
    enabled: false,
    text: "not the final version\n",
  },

  marqueeText: "touch grass • eat grass • git gud",

  footer: {
    headline: "see ya",
    sub: "or not",
    bottom: "brook",
    transFlairText: "TRANS PEOPLE CAN DOUBLE JUMP",
    showTransFlair: true,
  },

  features: {
    cursor: false,
    hearts: true,
    sparkles: true,
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
    "webring",
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

function readCached(): AppConfig | null {
  try {
    const raw = localStorage.getItem(CONFIG_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<AppConfig>;
    return mergeConfig(DEFAULT_CONFIG, parsed);
  } catch {
    return null;
  }
}

export async function loadConfig(): Promise<AppConfig> {
  // Try API with a short timeout so slow/down backends don't block first paint.
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 4000);
    const response = await fetch(`${API_BASE}/config`, { signal: controller.signal });
    clearTimeout(timer);
    if (response.ok) {
      const raw = await response.json();
      const config = mergeConfig(DEFAULT_CONFIG, raw);
      localStorage.setItem(CONFIG_KEY, JSON.stringify(config));
      return config;
    }
  } catch {
    /* fall through to cache */
  }
  return readCached() ?? DEFAULT_CONFIG;
}

export function mergeConfig(base: AppConfig, override: Partial<AppConfig>): AppConfig {
  // Known section keys used to filter out stale/removed entries that might
  // live in older saved configs (e.g. "stuffIMade" before it was removed).
  const VALID_SECTIONS: ReadonlySet<SectionKey> = new Set<SectionKey>([
    "hero", "marquee", "about", "now", "connections",
    "recent", "favorites", "guestbook", "stickers", "steam", "webring", "footer",
  ]);

  const rawOrder = override.sectionOrder ?? base.sectionOrder;
  const cleanedOrder = rawOrder.filter((k): k is SectionKey => VALID_SECTIONS.has(k as SectionKey));

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
    comments: override.comments ?? base.comments,
    portfolio: override.portfolio ?? base.portfolio,
    guitarCovers: override.guitarCovers ?? base.guitarCovers,
    sectionOrder: cleanedOrder.length ? cleanedOrder : base.sectionOrder,
  };
}

export async function saveConfig(c: AppConfig): Promise<void> {
  // Comments are owned by the backend (comments.json) and are NEVER sent back
  // with a config save, so a visitor's load-effect can't clobber new comments
  // added by someone else between fetch and save.
  const payload: Partial<AppConfig> = { ...c };
  delete (payload as { comments?: unknown }).comments;

  try {
    // Save to API
    const response = await fetch(`${API_BASE}/config`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    // Also save to localStorage as backup (keep comments here so recent posts
    // survive offline refreshes)
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
const ADMIN_KEY_STORAGE = "brook-admin-key";

export function checkAdminAuth(): boolean {
  try {
    const url = new URL(window.location.href);
    const k = url.searchParams.get("admin");
    if (k === ADMIN_KEY) {
      sessionStorage.setItem(ADMIN_FLAG, "1");
      sessionStorage.setItem(ADMIN_KEY_STORAGE, k);
      url.searchParams.delete("admin");
      window.history.replaceState({}, "", url.toString());
      return true;
    }
  } catch {
    /* ignore */
  }
  return sessionStorage.getItem(ADMIN_FLAG) === "1";
}

export function getAdminKey(): string | null {
  return sessionStorage.getItem(ADMIN_KEY_STORAGE);
}

export function logoutAdmin() {
  sessionStorage.removeItem(ADMIN_FLAG);
  sessionStorage.removeItem(ADMIN_KEY_STORAGE);
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
