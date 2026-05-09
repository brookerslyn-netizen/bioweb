export type Palette = {
  id: string;
  label: string;
  swatch: [string, string, string];
  vars: Record<string, string>;
};

export const BUILTIN_PALETTES: Palette[] = [
  {
    id: "forest",
    label: "forest",
    swatch: ["#0a0f0c", "#1a3d2a", "#34d399"],
    vars: {
      "--p-bg": "#070f0a",
      "--p-surface": "rgba(20, 38, 28, 0.62)",
      "--p-surface-strong": "rgba(14, 26, 20, 0.92)",
      "--p-surface-border": "rgba(127, 255, 212, 0.18)",
      "--p-text": "#d6f6e2",
      "--p-text-soft": "#6ee7b7",
      "--p-text-muted": "rgba(214, 246, 226, 0.62)",
      "--p-accent": "#34d399",
      "--p-accent-hover": "#10b981",
      "--p-accent-contrast": "#062118",
      "--p-cursor": "#34d399",
      "--p-cursor-glow": "rgba(52, 211, 153, 0.65)",
      "--p-veil":
        "radial-gradient(1100px 650px at 50% 18%, rgba(20,50,35,0.55), rgba(8,20,14,0.92) 60%, rgba(3,8,5,0.98) 100%)",
      "--p-gif-opacity": "0.18",
      "--p-gif-filter": "saturate(0.4) blur(2px) hue-rotate(80deg)",
      "--p-gradient-text":
        "linear-gradient(90deg, #34d399, #6ee7b7, #a7f3d0, #6ee7b7, #34d399)",
      "--p-marquee-bg": "rgba(8, 20, 14, 0.6)",
      "--p-marquee-border": "rgba(52, 211, 153, 0.18)",
      "--p-text-shadow":
        "0 2px 18px rgba(52,211,153,0.45), 0 0 1px rgba(167,243,208,0.4)",
      "--p-selection": "#34d399",
      "--p-selection-text": "#062118",
      "--p-scroll-thumb": "linear-gradient(#6ee7b7, #34d399)",
    },
  },
  {
    id: "pink-dream",
    label: "pink dream",
    swatch: ["#ffe4ec", "#ff9ec1", "#ff5d92"],
    vars: {
      "--p-bg": "#fff0f5",
      "--p-surface": "rgba(255, 255, 255, 0.55)",
      "--p-surface-strong": "rgba(255, 255, 255, 0.78)",
      "--p-surface-border": "rgba(255, 255, 255, 0.6)",
      "--p-text": "#b62a5c",
      "--p-text-soft": "#e83a78",
      "--p-text-muted": "rgba(182, 42, 92, 0.7)",
      "--p-accent": "#ff5d92",
      "--p-accent-hover": "#e83a78",
      "--p-accent-contrast": "#ffffff",
      "--p-cursor": "#ff5d92",
      "--p-cursor-glow": "rgba(255, 93, 146, 0.7)",
      "--p-veil":
        "radial-gradient(1200px 700px at 50% 20%, rgba(255,255,255,0.55), rgba(255,255,255,0.2) 50%, rgba(255,221,235,0.65) 100%), linear-gradient(180deg, rgba(255,240,245,0.55) 0%, rgba(255,200,220,0.55) 60%, rgba(255,160,195,0.55) 100%)",
      "--p-gif-opacity": "0.7",
      "--p-gif-filter": "none",
      "--p-gradient-text":
        "linear-gradient(90deg, #ff5d92, #ff7ba9, #ffb1cc, #ff7ba9, #ff5d92)",
      "--p-marquee-bg": "rgba(255, 255, 255, 0.3)",
      "--p-marquee-border": "rgba(255, 200, 220, 0.6)",
      "--p-text-shadow":
        "0 2px 18px rgba(255,130,170,0.55), 0 0 1px rgba(255,255,255,0.6)",
      "--p-selection": "#ff9ec1",
      "--p-selection-text": "#3a1224",
      "--p-scroll-thumb": "linear-gradient(#ff9ec1, #ff5d92)",
    },
  },
  {
    id: "crimson",
    label: "crimson",
    swatch: ["#0a0203", "#3d0a0e", "#ef4444"],
    vars: {
      "--p-bg": "#0a0203",
      "--p-surface": "rgba(50, 8, 14, 0.65)",
      "--p-surface-strong": "rgba(28, 4, 8, 0.88)",
      "--p-surface-border": "rgba(244, 63, 94, 0.2)",
      "--p-text": "#fecaca",
      "--p-text-soft": "#fca5a5",
      "--p-text-muted": "rgba(254, 202, 202, 0.6)",
      "--p-accent": "#ef4444",
      "--p-accent-hover": "#dc2626",
      "--p-accent-contrast": "#1a0204",
      "--p-cursor": "#f43f5e",
      "--p-cursor-glow": "rgba(244, 63, 94, 0.65)",
      "--p-veil":
        "radial-gradient(1100px 650px at 50% 18%, rgba(80,12,22,0.55), rgba(20,4,8,0.92) 60%, rgba(8,0,2,0.98) 100%)",
      "--p-gif-opacity": "0.10",
      "--p-gif-filter": "saturate(0.4) blur(2px) hue-rotate(-30deg)",
      "--p-gradient-text":
        "linear-gradient(90deg, #ef4444, #fb7185, #fda4af, #fb7185, #ef4444)",
      "--p-marquee-bg": "rgba(20, 4, 8, 0.6)",
      "--p-marquee-border": "rgba(244, 63, 94, 0.18)",
      "--p-text-shadow":
        "0 2px 18px rgba(239,68,68,0.5), 0 0 1px rgba(254,202,202,0.4)",
      "--p-selection": "#ef4444",
      "--p-selection-text": "#1a0204",
      "--p-scroll-thumb": "linear-gradient(#fb7185, #ef4444)",
    },
  },
  {
    id: "aqua",
    label: "aqua",
    swatch: ["#04111c", "#0a2540", "#22d3ee"],
    vars: {
      "--p-bg": "#04111c",
      "--p-surface": "rgba(8, 38, 60, 0.65)",
      "--p-surface-strong": "rgba(4, 22, 38, 0.88)",
      "--p-surface-border": "rgba(34, 211, 238, 0.18)",
      "--p-text": "#a5f3fc",
      "--p-text-soft": "#67e8f9",
      "--p-text-muted": "rgba(165, 243, 252, 0.6)",
      "--p-accent": "#22d3ee",
      "--p-accent-hover": "#06b6d4",
      "--p-accent-contrast": "#04111c",
      "--p-cursor": "#22d3ee",
      "--p-cursor-glow": "rgba(34, 211, 238, 0.65)",
      "--p-veil":
        "radial-gradient(1100px 650px at 50% 18%, rgba(8,50,80,0.55), rgba(4,16,28,0.92) 60%, rgba(2,8,14,0.98) 100%)",
      "--p-gif-opacity": "0.10",
      "--p-gif-filter": "saturate(0.4) blur(2px) hue-rotate(180deg)",
      "--p-gradient-text":
        "linear-gradient(90deg, #22d3ee, #5eead4, #a5f3fc, #5eead4, #22d3ee)",
      "--p-marquee-bg": "rgba(4, 22, 38, 0.6)",
      "--p-marquee-border": "rgba(34, 211, 238, 0.18)",
      "--p-text-shadow":
        "0 2px 18px rgba(34,211,238,0.45), 0 0 1px rgba(165,243,252,0.4)",
      "--p-selection": "#22d3ee",
      "--p-selection-text": "#04111c",
      "--p-scroll-thumb": "linear-gradient(#5eead4, #22d3ee)",
    },
  },
  {
    id: "diary",
    label: "diary",
    swatch: ["#ebd9b0", "#c9a96a", "#a83232"],
    vars: {
      "--p-bg": "#e8d6a8",
      "--p-surface": "rgba(255, 248, 224, 0.78)",
      "--p-surface-strong": "rgba(255, 250, 232, 0.92)",
      "--p-surface-border": "rgba(120, 80, 30, 0.22)",
      "--p-text": "#3a2818",
      "--p-text-soft": "#6b4423",
      "--p-text-muted": "rgba(58, 40, 24, 0.62)",
      "--p-accent": "#a83232",
      "--p-accent-hover": "#832525",
      "--p-accent-contrast": "#fff8e0",
      "--p-cursor": "#a83232",
      "--p-cursor-glow": "rgba(168, 50, 50, 0.5)",
      "--p-veil":
        "radial-gradient(1200px 700px at 50% 18%, rgba(255,245,210,0.55), rgba(232,214,168,0.35) 50%, rgba(212,184,128,0.3) 100%), linear-gradient(180deg, rgba(255,248,224,0.4) 0%, rgba(232,214,168,0.5) 100%)",
      "--p-gif-opacity": "0.05",
      "--p-gif-filter": "saturate(0.3) blur(3px) sepia(0.5)",
      "--p-gradient-text":
        "linear-gradient(90deg, #6b4423, #a83232, #3a2818, #a83232, #6b4423)",
      "--p-marquee-bg": "rgba(232, 214, 168, 0.6)",
      "--p-marquee-border": "rgba(120, 80, 30, 0.25)",
      "--p-text-shadow":
        "0 1px 0 rgba(255,255,240,0.4), 0 2px 8px rgba(120,80,30,0.18)",
      "--p-selection": "#a83232",
      "--p-selection-text": "#fff8e0",
      "--p-scroll-thumb": "linear-gradient(#c9a96a, #a83232)",
    },
  },
  {
    id: "violet-dust",
    label: "violet dust",
    swatch: ["#0c0518", "#2d1b4e", "#c084fc"],
    vars: {
      "--p-bg": "#0c0518",
      "--p-surface": "rgba(40, 16, 70, 0.6)",
      "--p-surface-strong": "rgba(20, 8, 36, 0.88)",
      "--p-surface-border": "rgba(192, 132, 252, 0.22)",
      "--p-text": "#e9d5ff",
      "--p-text-soft": "#d8b4fe",
      "--p-text-muted": "rgba(233, 213, 255, 0.65)",
      "--p-accent": "#c084fc",
      "--p-accent-hover": "#a855f7",
      "--p-accent-contrast": "#1a0030",
      "--p-cursor": "#f0abfc",
      "--p-cursor-glow": "rgba(240, 171, 252, 0.65)",
      "--p-veil":
        "radial-gradient(1100px 650px at 50% 18%, rgba(60,24,100,0.55), rgba(16,6,30,0.9) 60%, rgba(6,2,12,0.97) 100%)",
      "--p-gif-opacity": "0.18",
      "--p-gif-filter": "saturate(0.6) blur(2px) hue-rotate(280deg)",
      "--p-gradient-text":
        "linear-gradient(90deg, #c084fc, #e9d5ff, #ffffff, #e9d5ff, #c084fc)",
      "--p-marquee-bg": "rgba(20, 8, 36, 0.6)",
      "--p-marquee-border": "rgba(192, 132, 252, 0.22)",
      "--p-text-shadow":
        "0 2px 18px rgba(192,132,252,0.5), 0 0 1px rgba(240,171,252,0.4)",
      "--p-selection": "#c084fc",
      "--p-selection-text": "#1a0030",
      "--p-scroll-thumb": "linear-gradient(#d8b4fe, #c084fc)",
    },
  },
];

export type CustomPalette = {
  id: string;
  label: string;
  colors: {
    bg: string;
    surface: string;
    text: string;
    textSoft: string;
    accent: string;
    accentHover: string;
    cursor: string;
    selection: string;
  };
};

export function customPaletteToVars(c: CustomPalette["colors"]): Record<string, string> {
  return {
    "--p-bg": c.bg,
    "--p-surface": withAlpha(c.surface, 0.62),
    "--p-surface-strong": withAlpha(c.surface, 0.92),
    "--p-surface-border": withAlpha(c.accent, 0.22),
    "--p-text": c.text,
    "--p-text-soft": c.textSoft,
    "--p-text-muted": withAlpha(c.text, 0.62),
    "--p-accent": c.accent,
    "--p-accent-hover": c.accentHover,
    "--p-accent-contrast": c.bg,
    "--p-cursor": c.cursor,
    "--p-cursor-glow": withAlpha(c.cursor, 0.65),
    "--p-veil": `radial-gradient(1100px 650px at 50% 18%, ${withAlpha(c.surface, 0.55)}, ${withAlpha(c.bg, 0.92)} 60%, ${withAlpha(c.bg, 0.98)} 100%)`,
    "--p-gif-opacity": "0.18",
    "--p-gif-filter": "saturate(0.5) blur(2px)",
    "--p-gradient-text": `linear-gradient(90deg, ${c.accent}, ${c.textSoft}, ${c.text}, ${c.textSoft}, ${c.accent})`,
    "--p-marquee-bg": withAlpha(c.bg, 0.6),
    "--p-marquee-border": withAlpha(c.accent, 0.18),
    "--p-text-shadow": `0 2px 18px ${withAlpha(c.accent, 0.45)}, 0 0 1px ${withAlpha(c.text, 0.4)}`,
    "--p-selection": c.selection,
    "--p-selection-text": c.bg,
    "--p-scroll-thumb": `linear-gradient(${c.textSoft}, ${c.accent})`,
  };
}

function withAlpha(hex: string, a: number): string {
  const m = hex.replace("#", "").trim();
  if (m.length !== 6 && m.length !== 3) return hex;
  const full = m.length === 3 ? m.split("").map((c) => c + c).join("") : m;
  const r = parseInt(full.slice(0, 2), 16);
  const g = parseInt(full.slice(2, 4), 16);
  const b = parseInt(full.slice(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${a})`;
}

export const ALL_VAR_KEYS = Object.keys(BUILTIN_PALETTES[0].vars);

export function applyPaletteVars(vars: Record<string, string>) {
  const root = document.documentElement;
  for (const k of ALL_VAR_KEYS) {
    if (vars[k] != null) root.style.setProperty(k, vars[k]);
  }
}

export function applyBuiltinPalette(id: string) {
  const p = BUILTIN_PALETTES.find((x) => x.id === id) ?? BUILTIN_PALETTES[0];
  applyPaletteVars(p.vars);
}
