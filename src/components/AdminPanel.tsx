import { useState } from "react";
import {
  X, Save, Copy, Download, Upload, RotateCcw, Undo2, ArrowUp, ArrowDown,
  Plus, Trash2, LogOut, Type, Palette as PaletteIcon, Image as ImageIcon,
  Music as MusicIcon, Layers, Heart, Sticker as StickerIcon, MessageSquare,
  Star, ListChecks, Award, Mail, FileText,
} from "lucide-react";
import type {
  AppConfig, SectionKey, FavoritesItem, GuestbookEntry, StickerItem,
  RecentItem, StuffItem, YTTrack, PortfolioProject, GuitarCover,
} from "../lib/config";
import { uid, popHistory, clearHistory, pushHistory, mergeConfig, DEFAULT_CONFIG } from "../lib/config";
import type { CustomPalette } from "../lib/palettes";
import { BUILTIN_PALETTES } from "../lib/palettes";

type Setter = (updater: (c: AppConfig) => AppConfig) => void;

function Field({ label, children, hint }: { label: string; children: React.ReactNode; hint?: string }) {
  return (
    <label className="block">
      <span className="text-[11px] uppercase tracking-widest font-mono palette-text-muted block mb-1">{label}</span>
      {children}
      {hint && <span className="text-[10px] palette-text-muted block mt-1">{hint}</span>}
    </label>
  );
}

function H({ children, icon }: { children: React.ReactNode; icon?: React.ReactNode }) {
  return (
    <div className="mt-6 mb-2 flex items-center gap-2 text-sm uppercase tracking-widest palette-text font-mono">
      {icon}
      <span>{children}</span>
    </div>
  );
}

const inputCls =
  "w-full rounded-lg px-3 py-2 palette-surface-strong palette-text font-mono text-sm focus:outline-none focus:ring-2";
const textareaCls = inputCls + " resize-y min-h-[60px]";
const btnCls =
  "px-2.5 py-1.5 rounded-lg text-xs uppercase tracking-widest font-mono palette-surface-strong hover:palette-accent-bg transition-colors flex items-center gap-1.5";

export function AdminPanel({
  open,
  onClose,
  config,
  set,
  onLogout,
}: {
  open: boolean;
  onClose: () => void;
  config: AppConfig;
  set: Setter;
  onLogout: () => void;
}) {
  const [confirmReset, setConfirmReset] = useState(false);
  const [importText, setImportText] = useState("");
  const [importErr, setImportErr] = useState("");
  const [exported, setExported] = useState(false);

  function exportClipboard() {
    const json = JSON.stringify(config, null, 2);
    navigator.clipboard.writeText(json).then(() => {
      setExported(true);
      setTimeout(() => setExported(false), 1500);
    }).catch(() => {});
  }
  function exportDownload() {
    const json = JSON.stringify(config, null, 2);
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `brook-config-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }
  function tryImport() {
    setImportErr("");
    try {
      const parsed = JSON.parse(importText);
      pushHistory(config);
      set(() => mergeConfig(DEFAULT_CONFIG, parsed));
      setImportText("");
    } catch (err) {
      setImportErr(`invalid JSON: ${(err as Error).message}`);
    }
  }
  function undo() {
    const prev = popHistory();
    if (prev) set(() => prev);
  }
  function reset() {
    pushHistory(config);
    set(() => DEFAULT_CONFIG);
    clearHistory();
    setConfirmReset(false);
  }

  const swap = (arr: SectionKey[], i: number, j: number) => {
    if (j < 0 || j >= arr.length) return arr;
    const a = arr.slice();
    [a[i], a[j]] = [a[j], a[i]];
    return a;
  };

  return (
    <>
      <div
        className={`admin-backdrop fixed inset-0 z-[60] bg-black/40 ${open ? "is-open" : ""}`}
        onClick={onClose}
      />
      <aside
        className={`admin-drawer fixed top-0 right-0 bottom-0 z-[61] w-full sm:w-[440px] palette-surface-strong overflow-y-auto ${open ? "is-open" : ""}`}
        style={{ boxShadow: "-12px 0 48px rgba(0,0,0,0.45)" }}
      >
        <div className="sticky top-0 z-10 palette-surface-strong px-4 py-3 flex items-center justify-between border-b" style={{ borderColor: "var(--p-surface-border)" }}>
          <div className="flex items-center gap-2">
            <PaletteIcon size={16} className="palette-accent-text" />
            <span className="font-mono text-sm uppercase tracking-widest palette-text">admin panel</span>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={onLogout} className={btnCls} title="sign out admin"><LogOut size={12} /> logout</button>
            <button onClick={onClose} className={btnCls}><X size={14} /></button>
          </div>
        </div>

        <div className="p-4 space-y-3 pb-12">
          {/* ===== palette ===== */}
          <H icon={<PaletteIcon size={14} />}>palette</H>
          <div className="grid grid-cols-5 gap-2">
            {BUILTIN_PALETTES.map((p) => (
              <button
                key={p.id}
                onClick={() => { pushHistory(config); set((c) => ({ ...c, paletteId: p.id })); }}
                className="rounded-lg p-2 text-center palette-surface-strong hover:scale-105 transition"
                style={{ outline: config.paletteId === p.id ? "2px solid var(--p-accent)" : "" }}
              >
                <div className="flex justify-center gap-0.5">
                  {p.swatch.map((c, i) => (
                    <span key={i} className="block w-3 h-3 rounded-full" style={{ background: c }} />
                  ))}
                </div>
                <div className="text-[9px] mt-1 palette-text-muted truncate">{p.label}</div>
              </button>
            ))}
          </div>
          <CustomPalettePicker config={config} set={set} />

          {/* ===== sticky note ===== */}
          <H icon={<FileText size={14} />}>sticky note (top of page)</H>
          <Field label="enabled">
            <input
              type="checkbox"
              checked={config.stickyNote.enabled}
              onChange={(e) => set((c) => ({ ...c, stickyNote: { ...c.stickyNote, enabled: e.target.checked } }))}
            />
          </Field>
          <Field label="text">
            <textarea
              className={textareaCls}
              value={config.stickyNote.text}
              onChange={(e) => set((c) => ({ ...c, stickyNote: { ...c.stickyNote, text: e.target.value } }))}
            />
          </Field>

          {/* ===== background ===== */}
          <H icon={<ImageIcon size={14} />}>background</H>
          <Field label="bg url (leave empty for default)">
            <input
              className={inputCls}
              value={config.bgUrl}
              onChange={(e) => set((c) => ({ ...c, bgUrl: e.target.value }))}
              placeholder="https://…/bg.gif"
            />
          </Field>

          {/* ===== hero ===== */}
          <H icon={<Type size={14} />}>hero</H>
          <Field label="name (ransom-note)">
            <input className={inputCls} value={config.hero.name}
              onChange={(e) => set((c) => ({ ...c, hero: { ...c.hero, name: e.target.value } }))} />
          </Field>
          <Field label="@handle">
            <input className={inputCls} value={config.hero.handle}
              onChange={(e) => set((c) => ({ ...c, hero: { ...c.hero, handle: e.target.value } }))} />
          </Field>
          <Field label="subtitle">
            <input className={inputCls} value={config.hero.subtitle}
              onChange={(e) => set((c) => ({ ...c, hero: { ...c.hero, subtitle: e.target.value } }))} />
          </Field>
          <Field label="typing lines (one per line)">
            <textarea className={textareaCls} rows={4}
              value={config.hero.typingLinesText}
              onChange={(e) => set((c) => ({ ...c, hero: { ...c.hero, typingLinesText: e.target.value } }))} />
          </Field>
          <Field label="scroll hint">
            <input className={inputCls} value={config.hero.scrollHint}
              onChange={(e) => set((c) => ({ ...c, hero: { ...c.hero, scrollHint: e.target.value } }))} />
          </Field>
          <Field label="splash text">
            <input className={inputCls} value={config.hero.splashText}
              onChange={(e) => set((c) => ({ ...c, hero: { ...c.hero, splashText: e.target.value } }))} />
          </Field>

          {/* ===== about ===== */}
          <H icon={<Heart size={14} />}>about me</H>
          <Field label="title">
            <input className={inputCls} value={config.about.title}
              onChange={(e) => set((c) => ({ ...c, about: { ...c.about, title: e.target.value } }))} />
          </Field>
          <Field label="body (multi-line)">
            <textarea className={textareaCls} rows={5} value={config.about.body}
              onChange={(e) => set((c) => ({ ...c, about: { ...c.about, body: e.target.value } }))} />
          </Field>
          <Field label="tags (comma-separated)">
            <input className={inputCls} value={config.about.tagsText}
              onChange={(e) => set((c) => ({ ...c, about: { ...c.about, tagsText: e.target.value } }))} />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="age"><input className={inputCls} value={config.about.age}
              onChange={(e) => set((c) => ({ ...c, about: { ...c.about, age: e.target.value } }))} /></Field>
            <Field label="timezone"><input className={inputCls} value={config.about.timezone}
              onChange={(e) => set((c) => ({ ...c, about: { ...c.about, timezone: e.target.value } }))} /></Field>
          </div>
          <div className="flex gap-3 text-sm palette-text">
            <label className="flex items-center gap-1"><input type="checkbox" checked={config.about.showAge}
              onChange={(e) => set((c) => ({ ...c, about: { ...c.about, showAge: e.target.checked } }))} /> show age</label>
            <label className="flex items-center gap-1"><input type="checkbox" checked={config.about.showTimezone}
              onChange={(e) => set((c) => ({ ...c, about: { ...c.about, showTimezone: e.target.checked } }))} /> show tz</label>
          </div>

          {/* ===== now ===== */}
          <H icon={<ListChecks size={14} />}>now (one per line)</H>
          <textarea className={textareaCls} rows={4}
            value={config.nowListText}
            onChange={(e) => set((c) => ({ ...c, nowListText: e.target.value }))} />

          {/* ===== contact ===== */}
          <H icon={<Mail size={14} />}>contact</H>
          <Field label="email"><input className={inputCls} value={config.contact.email}
            onChange={(e) => set((c) => ({ ...c, contact: { ...c.contact, email: e.target.value } }))} /></Field>
          <Field label="discord id"><input className={inputCls} value={config.contact.discordId}
            onChange={(e) => set((c) => ({ ...c, contact: { ...c.contact, discordId: e.target.value } }))} /></Field>
          <Field label="spotify url"><input className={inputCls} value={config.contact.spotifyUrl}
            onChange={(e) => set((c) => ({ ...c, contact: { ...c.contact, spotifyUrl: e.target.value } }))} /></Field>
          <Field label="steam id (numeric)"><input className={inputCls} value={config.contact.steamId}
            onChange={(e) => set((c) => ({ ...c, contact: { ...c.contact, steamId: e.target.value } }))} placeholder="76561198…" /></Field>
          <Field label="last.fm username"><input className={inputCls} value={config.contact.lastfmUsername || ""}
            onChange={(e) => set((c) => ({ ...c, contact: { ...c.contact, lastfmUsername: e.target.value } }))} placeholder="your lastfm username" /></Field>
          <div className="flex gap-3 text-sm palette-text flex-wrap">
            <label className="flex items-center gap-1"><input type="checkbox" checked={config.contact.showEmail}
              onChange={(e) => set((c) => ({ ...c, contact: { ...c.contact, showEmail: e.target.checked } }))} /> show email</label>
            <label className="flex items-center gap-1"><input type="checkbox" checked={config.contact.showCopyDiscord}
              onChange={(e) => set((c) => ({ ...c, contact: { ...c.contact, showCopyDiscord: e.target.checked } }))} /> copy-id button</label>
          </div>

          {/* ===== music ===== */}
          <H icon={<MusicIcon size={14} />}>music</H>
          <div className="grid grid-cols-2 gap-3">
            <label className="flex items-center gap-1 text-sm palette-text">
              <input type="checkbox" checked={config.music.enabled}
                onChange={(e) => set((c) => ({ ...c, music: { ...c.music, enabled: e.target.checked } }))} /> enabled
            </label>
            <label className="flex items-center gap-1 text-sm palette-text">
              <input type="checkbox" checked={config.music.autoplay}
                onChange={(e) => set((c) => ({ ...c, music: { ...c.music, autoplay: e.target.checked } }))} /> autoplay
            </label>
            <label className="flex items-center gap-1 text-sm palette-text">
              <input type="checkbox" checked={config.music.crackle}
                onChange={(e) => set((c) => ({ ...c, music: { ...c.music, crackle: e.target.checked } }))} /> vinyl crackle
            </label>
            <Field label="visual">
              <select className={inputCls} value={config.music.visual}
                onChange={(e) => set((c) => ({ ...c, music: { ...c.music, visual: e.target.value as "vinyl" | "cassette" | "none" } }))}>
                <option value="vinyl">vinyl</option>
                <option value="cassette">cassette</option>
                <option value="none">none</option>
              </select>
            </Field>
            <Field label={`volume (${config.music.volume})`}>
              <input type="range" min={0} max={100} value={config.music.volume}
                onChange={(e) => set((c) => ({ ...c, music: { ...c.music, volume: parseInt(e.target.value, 10) } }))}
                className="w-full" />
            </Field>
          </div>
          <PlaylistEditor config={config} set={set} />

          {/* ===== favorites ===== */}
          <FavoritesEditor config={config} set={set} />

          {/* ===== guestbook ===== */}
          <GuestbookEditor config={config} set={set} />

          {/* ===== stickers ===== */}
          <StickersEditor config={config} set={set} />

          {/* ===== recent ===== */}
          <RecentEditor config={config} set={set} />

          {/* ===== stuff i made ===== */}
          <StuffEditor config={config} set={set} />

          {/* ===== portfolio ===== */}
          <PortfolioEditor config={config} set={set} />

          {/* ===== guitar covers ===== */}
          <CoversEditor config={config} set={set} />

          {/* ===== marquee ===== */}
          <H>marquee</H>
          <Field label="marquee text"><input className={inputCls} value={config.marqueeText}
            onChange={(e) => set((c) => ({ ...c, marqueeText: e.target.value }))} /></Field>

          {/* ===== footer ===== */}
          <H>footer</H>
          <Field label="headline"><input className={inputCls} value={config.footer.headline}
            onChange={(e) => set((c) => ({ ...c, footer: { ...c.footer, headline: e.target.value } }))} /></Field>
          <Field label="sub line"><input className={inputCls} value={config.footer.sub}
            onChange={(e) => set((c) => ({ ...c, footer: { ...c.footer, sub: e.target.value } }))} /></Field>
          <Field label="signature"><input className={inputCls} value={config.footer.bottom}
            onChange={(e) => set((c) => ({ ...c, footer: { ...c.footer, bottom: e.target.value } }))} /></Field>
          <Field label="trans flair caption"><input className={inputCls} value={config.footer.transFlairText}
            onChange={(e) => set((c) => ({ ...c, footer: { ...c.footer, transFlairText: e.target.value } }))} /></Field>
          <label className="flex items-center gap-1 text-sm palette-text">
            <input type="checkbox" checked={config.footer.showTransFlair}
              onChange={(e) => set((c) => ({ ...c, footer: { ...c.footer, showTransFlair: e.target.checked } }))} /> show trans flair
          </label>

          {/* ===== features ===== */}
          <H>feature toggles</H>
          <div className="grid grid-cols-2 gap-1">
            {(Object.keys(config.features) as Array<keyof AppConfig["features"]>).map((k) => (
              <label key={k} className="flex items-center gap-1 text-sm palette-text">
                <input type="checkbox" checked={config.features[k]}
                  onChange={(e) => set((c) => ({ ...c, features: { ...c.features, [k]: e.target.checked } }))} />
                {k}
              </label>
            ))}
          </div>

          {/* ===== section order ===== */}
          <H icon={<Layers size={14} />}>section order</H>
          <div className="space-y-1">
            {config.sectionOrder.map((s, i) => (
              <div key={s} className="palette-surface-strong rounded-lg px-2 py-1 flex items-center justify-between">
                <span className="font-mono text-xs palette-text">{i + 1}. {s}</span>
                <div className="flex gap-1">
                  <button className={btnCls} onClick={() => set((c) => ({ ...c, sectionOrder: swap(c.sectionOrder, i, i - 1) }))}><ArrowUp size={12} /></button>
                  <button className={btnCls} onClick={() => set((c) => ({ ...c, sectionOrder: swap(c.sectionOrder, i, i + 1) }))}><ArrowDown size={12} /></button>
                </div>
              </div>
            ))}
          </div>

          {/* ===== import / export / undo / reset ===== */}
          <H>import / export</H>
          <div className="flex gap-2 flex-wrap">
            <button className={btnCls} onClick={exportClipboard}><Copy size={12} />{exported ? "copied" : "copy json"}</button>
            <button className={btnCls} onClick={exportDownload}><Download size={12} /> download</button>
            <button className={btnCls} onClick={undo}><Undo2 size={12} /> undo</button>
            <button className={btnCls} onClick={() => setConfirmReset(true)}><RotateCcw size={12} /> reset</button>
          </div>

          <Field label="paste config json to import">
            <textarea className={textareaCls} rows={3} value={importText}
              onChange={(e) => setImportText(e.target.value)} placeholder='{"paletteId":"forest", ...}' />
          </Field>
          {importErr && <div className="text-xs text-red-400">{importErr}</div>}
          <button className={btnCls + " w-full justify-center"} onClick={tryImport}><Upload size={12} /> import</button>

          {confirmReset && (
            <div className="palette-surface-strong rounded-xl p-4 mt-3 border" style={{ borderColor: "var(--p-accent)" }}>
              <div className="palette-text font-bold">reset to defaults?</div>
              <div className="palette-text-muted text-xs">this clears all your changes. (saved to undo first.)</div>
              <div className="mt-3 flex gap-2">
                <button className={btnCls} onClick={reset}><Save size={12} /> yes, reset</button>
                <button className={btnCls} onClick={() => setConfirmReset(false)}><X size={12} /> cancel</button>
              </div>
            </div>
          )}

          <div className="text-[10px] palette-text-muted mt-6 text-center">
            saves to server for all users · admin auth via <code>?admin=…</code>
          </div>
        </div>
      </aside>
    </>
  );
}

/* ===================== Custom palette ===================== */

const DEFAULT_CUSTOM_COLORS: CustomPalette["colors"] = {
  bg: "#0c0a16",
  surface: "#1f1736",
  text: "#e9d5ff",
  textSoft: "#d8b4fe",
  accent: "#c084fc",
  accentHover: "#a855f7",
  cursor: "#f0abfc",
  selection: "#c084fc",
};

function CustomPalettePicker({ config, set }: { config: AppConfig; set: Setter }) {
  const [editor, setEditor] = useState<CustomPalette | null>(null);
  const [name, setName] = useState("");

  function newCustom() {
    setEditor({ id: "custom-" + uid(), label: "my palette", colors: { ...DEFAULT_CUSTOM_COLORS } });
    setName("my palette");
  }
  function save() {
    if (!editor) return;
    const c: CustomPalette = { ...editor, label: name || "untitled" };
    pushHistory(config);
    set((cfg) => {
      const ex = cfg.customPalettes.find((p) => p.id === c.id);
      const customPalettes = ex
        ? cfg.customPalettes.map((p) => (p.id === c.id ? c : p))
        : cfg.customPalettes.concat(c);
      return { ...cfg, customPalettes, paletteId: c.id };
    });
    setEditor(null);
  }
  function edit(p: CustomPalette) { setEditor(p); setName(p.label); }
  function del(id: string) {
    pushHistory(config);
    set((c) => ({
      ...c,
      customPalettes: c.customPalettes.filter((p) => p.id !== id),
      paletteId: c.paletteId === id ? "forest" : c.paletteId,
    }));
  }

  return (
    <div className="space-y-2">
      <div className="text-[11px] uppercase tracking-widest font-mono palette-text-muted">custom palettes</div>
      <div className="grid grid-cols-3 gap-2">
        {config.customPalettes.map((p) => (
          <div key={p.id} className="palette-surface-strong rounded-lg p-2 relative">
            <button
              onClick={() => { pushHistory(config); set((c) => ({ ...c, paletteId: p.id })); }}
              className="block w-full text-left"
              style={{ outline: config.paletteId === p.id ? "2px solid var(--p-accent)" : "" }}
            >
              <div className="flex gap-0.5">
                <span className="block w-3 h-3 rounded-full" style={{ background: p.colors.bg }} />
                <span className="block w-3 h-3 rounded-full" style={{ background: p.colors.surface }} />
                <span className="block w-3 h-3 rounded-full" style={{ background: p.colors.accent }} />
              </div>
              <div className="text-[9px] mt-1 palette-text-muted truncate">{p.label}</div>
            </button>
            <div className="flex gap-1 mt-1">
              <button onClick={() => edit(p)} className="text-[9px] palette-text-muted hover:palette-text">edit</button>
              <button onClick={() => del(p.id)} className="text-[9px] text-red-400">del</button>
            </div>
          </div>
        ))}
        <button onClick={newCustom} className="palette-surface-strong rounded-lg p-2 flex flex-col items-center justify-center hover:palette-accent-bg">
          <Plus size={14} /><span className="text-[9px] mt-0.5">new</span>
        </button>
      </div>

      {editor && (
        <div className="palette-surface-strong rounded-xl p-3 mt-2 space-y-2">
          <Field label="palette name">
            <input className={inputCls} value={name} onChange={(e) => setName(e.target.value)} />
          </Field>
          {(Object.keys(editor.colors) as Array<keyof CustomPalette["colors"]>).map((k) => (
            <div key={k} className="flex items-center gap-2">
              <span className="text-xs font-mono palette-text-muted w-28">{k}</span>
              <input
                type="color"
                value={editor.colors[k]}
                onChange={(e) =>
                  setEditor({ ...editor, colors: { ...editor.colors, [k]: e.target.value } })
                }
              />
              <input
                className={inputCls + " flex-1"}
                value={editor.colors[k]}
                onChange={(e) =>
                  setEditor({ ...editor, colors: { ...editor.colors, [k]: e.target.value } })
                }
              />
            </div>
          ))}
          <div className="flex gap-2">
            <button className={btnCls} onClick={save}><Save size={12} /> save</button>
            <button className={btnCls} onClick={() => setEditor(null)}><X size={12} /> cancel</button>
          </div>
        </div>
      )}
    </div>
  );
}

/* ===================== Playlist editor ===================== */

function PlaylistEditor({ config, set }: { config: AppConfig; set: Setter }) {
  function update(i: number, patch: Partial<YTTrack>) {
    set((c) => ({ ...c, music: { ...c.music, playlist: c.music.playlist.map((t, idx) => idx === i ? { ...t, ...patch } : t) } }));
  }
  function add() {
    pushHistory(config);
    set((c) => ({ ...c, music: { ...c.music, playlist: c.music.playlist.concat({ id: "", title: "track" }) } }));
  }
  function remove(i: number) {
    pushHistory(config);
    set((c) => ({ ...c, music: { ...c.music, playlist: c.music.playlist.filter((_, idx) => idx !== i) } }));
  }
  return (
    <div className="space-y-2">
      <div className="text-[11px] uppercase tracking-widest font-mono palette-text-muted">youtube playlist</div>
      {config.music.playlist.map((t, i) => (
        <div key={i} className="grid grid-cols-[80px_1fr_auto] gap-2 items-center">
          <input className={inputCls} value={t.id} onChange={(e) => update(i, { id: e.target.value })} placeholder="yt id" />
          <input className={inputCls} value={t.title} onChange={(e) => update(i, { title: e.target.value })} placeholder="track title" />
          <button className={btnCls} onClick={() => remove(i)}><Trash2 size={12} /></button>
        </div>
      ))}
      <button className={btnCls} onClick={add}><Plus size={12} /> add track</button>
    </div>
  );
}

/* ===================== Favorites editor ===================== */

const BUCKETS: Array<keyof AppConfig["favorites"]> = ["games", "music", "movies", "food"];
function FavoritesEditor({ config, set }: { config: AppConfig; set: Setter }) {
  const [b, setB] = useState<keyof AppConfig["favorites"]>("games");
  const items = config.favorites[b];
  function update(i: number, patch: Partial<FavoritesItem>) {
    set((c) => ({ ...c, favorites: { ...c.favorites, [b]: c.favorites[b].map((it, idx) => idx === i ? { ...it, ...patch } : it) } }));
  }
  function add() {
    pushHistory(config);
    set((c) => ({ ...c, favorites: { ...c.favorites, [b]: c.favorites[b].concat({ emoji: "★", label: "edit", note: "", imageUrl: "" }) } }));
  }
  function remove(i: number) {
    pushHistory(config);
    set((c) => ({ ...c, favorites: { ...c.favorites, [b]: c.favorites[b].filter((_, idx) => idx !== i) } }));
  }
  return (
    <>
      <H icon={<Star size={14} />}>favorites</H>
      <div className="flex gap-1 flex-wrap">
        {BUCKETS.map((k) => (
          <button key={k} onClick={() => setB(k)}
            className={`px-2 py-1 rounded text-xs uppercase font-mono ${b === k ? "palette-accent-bg" : "palette-surface-strong palette-text-muted"}`}>
            {k}
          </button>
        ))}
      </div>
      <div className="space-y-2 mt-2">
        {items.map((it, i) => (
          <div key={i} className="palette-surface-strong rounded-lg p-2 space-y-2">
            <div className="grid grid-cols-[40px_1fr_auto] gap-2 items-center">
              <input className={inputCls} value={it.emoji} onChange={(e) => update(i, { emoji: e.target.value })} placeholder="emoji" />
              <div className="space-y-1">
                <input className={inputCls} value={it.label} onChange={(e) => update(i, { label: e.target.value })} placeholder="label" />
                <input className={inputCls} value={it.note} onChange={(e) => update(i, { note: e.target.value })} placeholder="optional note" />
              </div>
              <button className={btnCls} onClick={() => remove(i)}><Trash2 size={12} /></button>
            </div>
            <div className="grid grid-cols-[80px_1fr] gap-2 items-center">
              <span className="text-xs palette-text-muted">image url</span>
              <input 
                className={inputCls} 
                value={it.imageUrl || ""} 
                onChange={(e) => update(i, { imageUrl: e.target.value })} 
                placeholder="https://.../image.jpg (leave empty for emoji)" 
              />
            </div>
            {it.imageUrl && (
              <div className="flex items-center gap-2">
                <span className="text-xs palette-text-muted">preview:</span>
                <img 
                  src={it.imageUrl} 
                  alt={it.label} 
                  className="w-8 h-8 rounded object-cover"
                  onError={(e) => { e.currentTarget.style.display = 'none'; }}
                />
                <span className="text-xs palette-text-muted">or fallback: {it.emoji}</span>
              </div>
            )}
          </div>
        ))}
        <button className={btnCls} onClick={add}><Plus size={12} /> add fav</button>
      </div>
    </>
  );
}

/* ===================== Guestbook editor ===================== */

function GuestbookEditor({ config, set }: { config: AppConfig; set: Setter }) {
  function update(i: number, patch: Partial<GuestbookEntry>) {
    set((c) => ({ ...c, guestbook: c.guestbook.map((e, idx) => idx === i ? { ...e, ...patch } : e) }));
  }
  function add() {
    pushHistory(config);
    const today = new Date().toISOString().slice(0, 10);
    set((c) => ({ ...c, guestbook: c.guestbook.concat({ id: uid(), name: "anon", message: "edit me", date: today }) }));
  }
  function remove(i: number) {
    pushHistory(config);
    set((c) => ({ ...c, guestbook: c.guestbook.filter((_, idx) => idx !== i) }));
  }
  return (
    <>
      <H icon={<MessageSquare size={14} />}>shoutouts</H>
      <div className="space-y-2">
        {config.guestbook.map((g, i) => (
          <div key={g.id} className="palette-surface-strong rounded-lg p-2 space-y-1">
            <div className="grid grid-cols-2 gap-2">
              <input className={inputCls} value={g.name} onChange={(e) => update(i, { name: e.target.value })} placeholder="name" />
              <input className={inputCls} value={g.date} onChange={(e) => update(i, { date: e.target.value })} placeholder="2026-05-08" />
            </div>
            <textarea className={textareaCls} rows={2} value={g.message} onChange={(e) => update(i, { message: e.target.value })} />
            <button className={btnCls} onClick={() => remove(i)}><Trash2 size={12} /> delete</button>
          </div>
        ))}
        <button className={btnCls} onClick={add}><Plus size={12} /> add shoutout</button>
      </div>
    </>
  );
}

/* ===================== Stickers editor ===================== */

function StickersEditor({ config, set }: { config: AppConfig; set: Setter }) {
  function update(i: number, patch: Partial<StickerItem>) {
    set((c) => ({ ...c, stickers: c.stickers.map((e, idx) => idx === i ? { ...e, ...patch } : e) }));
  }
  function add() {
    pushHistory(config);
    set((c) => ({ ...c, stickers: c.stickers.concat({ id: uid(), emoji: "🌱", label: "edit", imageUrl: "" }) }));
  }
  function remove(i: number) {
    pushHistory(config);
    set((c) => ({ ...c, stickers: c.stickers.filter((_, idx) => idx !== i) }));
  }
  return (
    <>
      <H icon={<StickerIcon size={14} />}>sticker wall</H>
      <div className="space-y-2">
        {config.stickers.map((s, i) => (
          <div key={s.id} className="palette-surface-strong rounded-lg p-2 space-y-2">
            <div className="grid grid-cols-[40px_1fr_auto] gap-2 items-center">
              <input className={inputCls} value={s.emoji} onChange={(e) => update(i, { emoji: e.target.value })} placeholder="emoji" />
              <input className={inputCls} value={s.label} onChange={(e) => update(i, { label: e.target.value })} placeholder="label" />
              <button className={btnCls} onClick={() => remove(i)}><Trash2 size={12} /></button>
            </div>
            <div className="grid grid-cols-[80px_1fr] gap-2 items-center">
              <span className="text-xs palette-text-muted">image url</span>
              <input 
                className={inputCls} 
                value={s.imageUrl || ""} 
                onChange={(e) => update(i, { imageUrl: e.target.value })} 
                placeholder="https://.../image.jpg (leave empty for emoji)" 
              />
            </div>
            {s.imageUrl && (
              <div className="flex items-center gap-2">
                <span className="text-xs palette-text-muted">preview:</span>
                <img 
                  src={s.imageUrl} 
                  alt={s.label} 
                  className="w-8 h-8 rounded object-cover"
                  onError={(e) => { e.currentTarget.style.display = 'none'; }}
                />
                <span className="text-xs palette-text-muted">or fallback: {s.emoji}</span>
              </div>
            )}
          </div>
        ))}
        <button className={btnCls} onClick={add}><Plus size={12} /> add sticker</button>
      </div>
    </>
  );
}

/* ===================== Recent editor ===================== */

function RecentEditor({ config, set }: { config: AppConfig; set: Setter }) {
  function update(i: number, patch: Partial<RecentItem>) {
    set((c) => ({ ...c, recent: c.recent.map((e, idx) => idx === i ? { ...e, ...patch } : e) }));
  }
  function add() {
    pushHistory(config);
    set((c) => ({ ...c, recent: c.recent.concat({ id: uid(), emoji: "•", text: "edit me", imageUrl: "" }) }));
  }
  function remove(i: number) {
    pushHistory(config);
    set((c) => ({ ...c, recent: c.recent.filter((_, idx) => idx !== i) }));
  }
  return (
    <>
      <H>recent things</H>
      <div className="space-y-2">
        {config.recent.map((r, i) => (
          <div key={r.id} className="palette-surface-strong rounded-lg p-2 space-y-2">
            <div className="grid grid-cols-[40px_1fr_auto] gap-2 items-center">
              <input className={inputCls} value={r.emoji} onChange={(e) => update(i, { emoji: e.target.value })} placeholder="emoji" />
              <input className={inputCls} value={r.text} onChange={(e) => update(i, { text: e.target.value })} placeholder="text" />
              <button className={btnCls} onClick={() => remove(i)}><Trash2 size={12} /></button>
            </div>
            <div className="grid grid-cols-[80px_1fr] gap-2 items-center">
              <span className="text-xs palette-text-muted">image url</span>
              <input 
                className={inputCls} 
                value={r.imageUrl || ""} 
                onChange={(e) => update(i, { imageUrl: e.target.value })} 
                placeholder="https://.../image.jpg (leave empty for emoji)" 
              />
            </div>
            {r.imageUrl && (
              <div className="flex items-center gap-2">
                <span className="text-xs palette-text-muted">preview:</span>
                <img 
                  src={r.imageUrl} 
                  alt={r.text} 
                  className="w-8 h-8 rounded object-cover"
                  onError={(e) => { e.currentTarget.style.display = 'none'; }}
                />
                <span className="text-xs palette-text-muted">or fallback: {r.emoji}</span>
              </div>
            )}
          </div>
        ))}
        <button className={btnCls} onClick={add}><Plus size={12} /> add</button>
      </div>
    </>
  );
}

/* ===================== Stuff i made editor ===================== */

function StuffEditor({ config, set }: { config: AppConfig; set: Setter }) {
  function update(i: number, patch: Partial<StuffItem>) {
    set((c) => ({ ...c, stuffIMade: c.stuffIMade.map((e, idx) => idx === i ? { ...e, ...patch } : e) }));
  }
  function add() {
    pushHistory(config);
    set((c) => ({ ...c, stuffIMade: c.stuffIMade.concat({ emoji: "✨", title: "thing", blurb: "edit me", tag: "wip", url: "" }) }));
  }
  function remove(i: number) {
    pushHistory(config);
    set((c) => ({ ...c, stuffIMade: c.stuffIMade.filter((_, idx) => idx !== i) }));
  }
  return (
    <>
      <H icon={<Award size={14} />}>stuff i made</H>
      <div className="space-y-1">
        {config.stuffIMade.map((p, i) => (
          <div key={i} className="palette-surface-strong rounded-lg p-2 space-y-1">
            <div className="grid grid-cols-[40px_1fr_80px] gap-2 items-center">
              <input className={inputCls} value={p.emoji} onChange={(e) => update(i, { emoji: e.target.value })} />
              <input className={inputCls} value={p.title} onChange={(e) => update(i, { title: e.target.value })} placeholder="title" />
              <input className={inputCls} value={p.tag} onChange={(e) => update(i, { tag: e.target.value })} placeholder="tag" />
            </div>
            <textarea className={textareaCls} rows={2} value={p.blurb} onChange={(e) => update(i, { blurb: e.target.value })} placeholder="blurb" />
            <input className={inputCls} value={p.url || ""} onChange={(e) => update(i, { url: e.target.value })} placeholder="optional url" />
            <button className={btnCls} onClick={() => remove(i)}><Trash2 size={12} /> delete</button>
          </div>
        ))}
        <button className={btnCls} onClick={add}><Plus size={12} /> add</button>
      </div>
    </>
  );
}

/* ===================== Portfolio editor ===================== */

function PortfolioEditor({ config, set }: { config: AppConfig; set: Setter }) {
  function update(i: number, patch: Partial<PortfolioProject>) {
    pushHistory(config);
    set((c) => ({ ...c, portfolio: c.portfolio.map((p, idx) => (idx === i ? { ...p, ...patch } : p)) }));
  }
  function add() {
    pushHistory(config);
    set((c) => ({ ...c, portfolio: [...c.portfolio, { id: uid(), title: "new project", blurb: "", tag: "web", emoji: "🚀" }] }));
  }
  function remove(i: number) {
    pushHistory(config);
    set((c) => ({ ...c, portfolio: c.portfolio.filter((_, idx) => idx !== i) }));
  }
  return (
    <>
      <H icon={<Award size={14} />}>portfolio</H>
      <div className="space-y-1">
        {config.portfolio.map((p, i) => (
          <div key={p.id} className="palette-surface-strong rounded-lg p-2 space-y-1">
            <div className="grid grid-cols-[40px_1fr_80px] gap-2 items-center">
              <input className={inputCls} value={p.emoji} onChange={(e) => update(i, { emoji: e.target.value })} />
              <input className={inputCls} value={p.title} onChange={(e) => update(i, { title: e.target.value })} placeholder="title" />
              <input className={inputCls} value={p.tag} onChange={(e) => update(i, { tag: e.target.value })} placeholder="tag" />
            </div>
            <textarea className={textareaCls} rows={2} value={p.blurb} onChange={(e) => update(i, { blurb: e.target.value })} placeholder="blurb" />
            <input className={inputCls} value={p.url || ""} onChange={(e) => update(i, { url: e.target.value })} placeholder="optional url" />
            <input className={inputCls} value={p.imageUrl || ""} onChange={(e) => update(i, { imageUrl: e.target.value })} placeholder="optional image url" />
            <button className={btnCls} onClick={() => remove(i)}><Trash2 size={12} /> delete</button>
          </div>
        ))}
        <button className={btnCls} onClick={add}><Plus size={12} /> add project</button>
      </div>
    </>
  );
}

/* ===================== Guitar covers editor ===================== */

function CoversEditor({ config, set }: { config: AppConfig; set: Setter }) {
  function update(i: number, patch: Partial<GuitarCover>) {
    pushHistory(config);
    set((c) => ({ ...c, guitarCovers: c.guitarCovers.map((p, idx) => (idx === i ? { ...p, ...patch } : p)) }));
  }
  function add() {
    pushHistory(config);
    set((c) => ({ ...c, guitarCovers: [...c.guitarCovers, { id: uid(), title: "new cover", youtubeId: "" }] }));
  }
  function remove(i: number) {
    pushHistory(config);
    set((c) => ({ ...c, guitarCovers: c.guitarCovers.filter((_, idx) => idx !== i) }));
  }
  return (
    <>
      <H icon={<MusicIcon size={14} />}>guitar covers</H>
      <div className="text-[10px] palette-text-muted -mt-1">
        either paste a YouTube ID, or an audio URL (mp3/ogg/wav). audio takes priority if both are set.
      </div>
      <div className="space-y-2">
        {config.guitarCovers.map((c, i) => (
          <div key={c.id} className="palette-surface-strong rounded-lg p-2 space-y-1">
            <input className={inputCls} value={c.title} onChange={(e) => update(i, { title: e.target.value })} placeholder="title" />
            <input className={inputCls} value={c.youtubeId} onChange={(e) => update(i, { youtubeId: e.target.value })} placeholder="youtube id (leave empty for audio-only)" />
            <input className={inputCls} value={c.audioUrl || ""} onChange={(e) => update(i, { audioUrl: e.target.value })} placeholder="audio url (https://.../track.mp3)" />
            <input className={inputCls} value={c.coverImage || ""} onChange={(e) => update(i, { coverImage: e.target.value })} placeholder="cover image url (optional, used for audio)" />
            <input className={inputCls} value={c.note || ""} onChange={(e) => update(i, { note: e.target.value })} placeholder="optional note" />
            <button className={btnCls} onClick={() => remove(i)}><Trash2 size={12} /> delete</button>
          </div>
        ))}
        <button className={btnCls} onClick={add}><Plus size={12} /> add cover</button>
      </div>
    </>
  );
}
