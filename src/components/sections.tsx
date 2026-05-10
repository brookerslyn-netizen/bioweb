import { useState } from "react";
import { ChevronDown, Eye, MessageSquare, Sparkles, Star, Calendar, Award } from "lucide-react";
import type { AppConfig, FavoritesItem } from "../lib/config";
import { splitLines, splitTags } from "../lib/config";
import { Reveal, RansomNote, Typewriter, LiveClock, Doodle, useViewCount } from "./parts";
import { DiscordCard, EmailCard, SpotifyNowPlaying, SteamCard, MusicPlayer } from "./widgets";
import { useLanyard } from "./parts";

/* ===================== Hero ===================== */

export function HeroSection({ config }: { config: AppConfig }) {
  const lines = splitLines(config.hero.typingLinesText);
  return (
    <section id="hero" className="relative pt-12 md:pt-20 pb-16 md:pb-24 px-6 text-center">
      <Doodle kind="star" top="22%" left="6%" size={40} rotate={-15} />
      <Doodle kind="swirl" top="68%" left="86%" size={56} rotate={20} />
      <Doodle kind="arrow" top="10%" left="78%" size={70} rotate={20} />

      <div className="text-[10px] uppercase tracking-[0.4em] font-mono palette-text-muted">
        {config.hero.handle}
      </div>

      <div className="mt-6 mb-2 flex justify-center">
        <RansomNote
          name={config.hero.name}
          sizes={[88, 100, 76, 96, 84]}
          className="palette-text-shadow"
        />
      </div>

      <p className="mt-3 text-2xl md:text-3xl palette-text-soft" style={{ fontFamily: "'Indie Flower', cursive" }}>
        {config.hero.subtitle}
      </p>

      <div className="mt-6 inline-block rounded-2xl px-4 py-3 palette-surface">
        {lines.length > 0 && <Typewriter lines={lines} />}
      </div>

      <div className="mt-12 flex flex-col items-center gap-1 palette-text-muted">
        <span className="text-[10px] uppercase tracking-widest font-mono">
          {config.hero.scrollHint}
        </span>
        <ChevronDown size={20} className="animate-bounce" />
      </div>
    </section>
  );
}

/* ===================== Marquee ===================== */

export function MarqueeSection({ text }: { text: string }) {
  const repeated = text || "—";
  return (
    <section id="marquee" className="palette-marquee py-3 overflow-hidden">
      <div className="whitespace-nowrap" style={{ animation: "marquee 28s linear infinite" }}>
        <span className="inline-block px-8 palette-text" style={{ fontFamily: "'Shadows Into Light', cursive", fontSize: 22 }}>
          {repeated}
        </span>
        <span className="inline-block px-8 palette-text-soft" style={{ fontFamily: "'Shadows Into Light', cursive", fontSize: 22 }}>
          {repeated}
        </span>
        <span className="inline-block px-8 palette-text" style={{ fontFamily: "'Shadows Into Light', cursive", fontSize: 22 }}>
          {repeated}
        </span>
        <span className="inline-block px-8 palette-text-soft" style={{ fontFamily: "'Shadows Into Light', cursive", fontSize: 22 }}>
          {repeated}
        </span>
      </div>
    </section>
  );
}

/* ===================== About ===================== */

export function AboutSection({ config }: { config: AppConfig }) {
  const tags = splitTags(config.about.tagsText);
  return (
    <section id="about" className="px-6 py-12 max-w-5xl mx-auto">
      <Reveal>
        <div className="paper p-6 md:p-8 relative tilt-n1" style={{ minHeight: 200 }}>
          <div className="washi washi-pink" style={{ top: -10, left: 40, transform: "rotate(-6deg)" }} />
          <div className="washi washi-mint" style={{ top: -10, right: 40, transform: "rotate(7deg)" }} />

          <div className="flex items-center gap-2 text-[10px] uppercase tracking-widest font-mono paper-text-muted">
            <span style={{ color: "var(--p-accent)" }}>●</span> who am i
          </div>
          <h2 className="mt-2 paper-text" style={{ fontFamily: "'Shadows Into Light', cursive", fontSize: 48 }}>
            {config.about.title}
          </h2>

          <p className="mt-4 text-lg leading-relaxed paper-text whitespace-pre-line" style={{ fontFamily: "'Indie Flower', cursive" }}>
            {config.about.body}
          </p>

          <div className="mt-5 flex flex-wrap gap-2">
            {tags.map((t, i) => (
              <span
                key={i}
                className="px-3 py-1 rounded-full text-sm paper-text"
                style={{
                  fontFamily: "'Indie Flower', cursive",
                  background: i % 3 === 0 ? "#fff8a8" : i % 3 === 1 ? "#f5a9b8" : "#a7f3d0",
                  border: "1px dashed rgba(0,0,0,0.18)",
                  transform: `rotate(${(i % 2 === 0 ? -1 : 1) * (1 + (i % 3))}deg)`,
                }}
              >
                {t}
              </span>
            ))}
          </div>

          <div className="mt-5 flex flex-wrap gap-3 text-sm paper-text-muted">
            {config.about.showAge && (
              <span className="px-3 py-1 rounded-full paper-2 flex items-center gap-1">
                <Calendar size={14} /> age {config.about.age}
              </span>
            )}
            {config.about.showTimezone && (
              <span className="px-3 py-1 rounded-full paper-2 flex items-center gap-1">
                <LiveClock tz={config.about.timezone} />
              </span>
            )}
          </div>
        </div>
      </Reveal>
    </section>
  );
}

/* ===================== Now ===================== */

export function NowSection({ config }: { config: AppConfig }) {
  const lines = splitLines(config.nowListText);
  if (!lines.length) return null;
  return (
    <section id="now" className="px-6 py-8 max-w-4xl mx-auto">
      <Reveal>
        <div className="paper paper-2 p-6 relative tilt-1">
          <div className="washi washi-yellow" style={{ top: -10, right: 30, transform: "rotate(-4deg)" }} />
          <div className="text-[10px] uppercase tracking-widest font-mono paper-text-muted">
            ▸ now
          </div>
          <ul className="mt-3 space-y-2 text-lg paper-text" style={{ fontFamily: "'Indie Flower', cursive" }}>
            {lines.map((l, i) => (
              <li key={i} className="flex gap-2">
                <span style={{ color: "var(--p-accent)" }}>·</span>
                <span>{l}</span>
              </li>
            ))}
          </ul>
        </div>
      </Reveal>
    </section>
  );
}

/* ===================== Connections (Discord + Spotify + Email + Recents) ===================== */

import { SpotifyRecent } from "./SpotifyRecent";
import { LastFmWidget } from "./LastFmWidget";

export function ConnectionsSection({ config, apiBase }: { config: AppConfig; apiBase?: string }) {
  const lan = useLanyard(config.contact.discordId);
  return (
    <section id="connections" className="px-6 py-8 max-w-4xl mx-auto">
      <Reveal>
        <div className="grid md:grid-cols-2 gap-4">
          <DiscordCard discordId={config.contact.discordId} showCopy={config.contact.showCopyDiscord} />
          <SpotifyNowPlaying spotify={lan?.spotify} fallbackUrl={config.contact.spotifyUrl} />
          {config.contact.showEmail && <EmailCard email={config.contact.email} />}
          <MusicPlayer
            playlist={config.music.playlist}
            volume={config.music.volume}
            autoplay={config.music.autoplay}
            visual={config.music.visual}
            crackle={config.music.crackle && config.features.transFlair}
            enabled={config.music.enabled && config.features.music}
          />
        </div>
        {config.features.spotify && apiBase && (
          <div className="mt-4">
            <SpotifyRecent apiBase={apiBase} />
          </div>
        )}
      </Reveal>
    </section>
  );
}

/* ===================== Last.fm ===================== */

export function LastFmSection({ config }: { config: AppConfig }) {
  const username = config.contact.lastfmUsername;
  if (!username) return null;
  return <LastFmWidget username={username} />;
}

export function RecentSection({ config }: { config: AppConfig }) {
  if (config.recent.length === 0) return null;
  return (
    <section id="recent" className="px-6 py-8 max-w-4xl mx-auto">
      <Reveal>
        <div className="paper p-6 tilt-n1 relative">
          <div className="washi washi-mint" style={{ top: -10, left: 30, transform: "rotate(-3deg)" }} />
          <h2 className="paper-text" style={{ fontFamily: "'Shadows Into Light', cursive", fontSize: 36 }}>recent things</h2>
          <ul className="mt-3 space-y-2 text-lg paper-text" style={{ fontFamily: "'Indie Flower', cursive" }}>
            {config.recent.map((r) => (
              <li key={r.id} className="flex gap-2 items-center">
                {r.imageUrl ? (
                  <img 
                    src={r.imageUrl} 
                    alt={r.text} 
                    className="w-6 h-6 rounded object-cover"
                    onError={(e) => { 
                      e.currentTarget.style.display = 'none';
                      e.currentTarget.nextElementSibling?.classList.remove('hidden');
                    }}
                  />
                ) : null}
                <span className={`${r.imageUrl ? 'hidden' : ''}`}>{r.emoji}</span>
                <span>{r.text}</span>
              </li>
            ))}
          </ul>
        </div>
      </Reveal>
    </section>
  );
}

/* ===================== Favorites (games / music / movies / food) ===================== */

const BUCKETS: Array<{ key: keyof AppConfig["favorites"]; label: string; icon: string }> = [
  { key: "games", label: "games", icon: "🎮" },
  { key: "music", label: "music", icon: "🎧" },
  { key: "movies", label: "movies", icon: "🎬" },
  { key: "food", label: "food", icon: "🍜" },
];

export function FavoritesSection({ config }: { config: AppConfig }) {
  const [active, setActive] = useState<keyof AppConfig["favorites"]>("games");
  const items: FavoritesItem[] = config.favorites[active] ?? [];
  return (
    <section id="favorites" className="px-6 py-8 max-w-5xl mx-auto">
      <Reveal>
        <div className="paper paper-2 p-6 relative tilt-1">
          <div className="washi washi-pink" style={{ top: -10, right: 50, transform: "rotate(4deg)" }} />
          <div className="flex items-baseline justify-between flex-wrap gap-2">
            <h2 className="paper-text" style={{ fontFamily: "'Shadows Into Light', cursive", fontSize: 36 }}>
              favorites <Star size={22} className="inline" />
            </h2>
            <div className="flex gap-1 flex-wrap">
              {BUCKETS.map((b) => (
                <button
                  key={b.key}
                  onClick={() => setActive(b.key)}
                  className={`px-3 py-1 rounded-full text-sm font-mono uppercase tracking-widest border ${active === b.key ? "palette-accent-bg" : "paper-text-muted"}`}
                  style={{ borderColor: active === b.key ? "transparent" : "rgba(0,0,0,0.15)" }}
                >
                  {b.icon} {b.label}
                </button>
              ))}
            </div>
          </div>

          {items.length === 0 ? (
            <div className="mt-4 paper-text-muted italic">nothing yet — admin can add</div>
          ) : (
            <div className="mt-4 grid sm:grid-cols-2 md:grid-cols-3 gap-3">
              {items.map((it, i) => (
                <div
                  key={i}
                  className="paper p-3"
                  style={{ transform: `rotate(${(i % 2 === 0 ? -1 : 1)}deg)` }}
                >
                  <div className="flex items-center gap-2">
                    {it.imageUrl ? (
                      <img 
                        src={it.imageUrl} 
                        alt={it.label} 
                        className="w-10 h-10 rounded-lg object-cover"
                        onError={(e) => { 
                          e.currentTarget.style.display = 'none';
                          e.currentTarget.nextElementSibling?.classList.remove('hidden');
                        }}
                      />
                    ) : null}
                    <span className={`text-2xl ${it.imageUrl ? 'hidden' : ''}`}>{it.emoji}</span>
                    <div className="font-bold paper-text" style={{ fontFamily: "'Shadows Into Light', cursive", fontSize: 22 }}>
                      {it.label}
                    </div>
                  </div>
                  {it.note && (
                    <div className="text-sm paper-text-muted mt-1" style={{ fontFamily: "'Indie Flower', cursive" }}>
                      {it.note}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </Reveal>
    </section>
  );
}

/* ===================== Guestbook (admin-managed shoutouts) ===================== */

export function GuestbookSection({ config }: { config: AppConfig }) {
  if (config.guestbook.length === 0) return null;
  return (
    <section id="guestbook" className="px-6 py-8 max-w-4xl mx-auto">
      <Reveal>
        <div className="paper p-6 tilt-n1 relative">
          <div className="washi washi-yellow" style={{ top: -10, left: 50, transform: "rotate(-5deg)" }} />
          <h2 className="paper-text" style={{ fontFamily: "'Shadows Into Light', cursive", fontSize: 36 }}>
            shoutouts <MessageSquare size={20} className="inline" />
          </h2>
          <div className="mt-4 grid md:grid-cols-2 gap-3">
            {config.guestbook.map((g, i) => (
              <div
                key={g.id}
                className="paper-2 paper p-4"
                style={{ transform: `rotate(${(i % 2 === 0 ? 1 : -1) * 1.5}deg)` }}
              >
                <div className="text-sm paper-text whitespace-pre-line" style={{ fontFamily: "'Indie Flower', cursive", fontSize: 18 }}>
                  "{g.message}"
                </div>
                <div className="mt-2 flex justify-between text-xs paper-text-muted">
                  <span>— {g.name}</span>
                  <span className="font-mono">{g.date}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </Reveal>
    </section>
  );
}

/* ===================== Sticker wall ===================== */

export function StickersSection({ config }: { config: AppConfig }) {
  if (config.stickers.length === 0) return null;
  return (
    <section id="stickers" className="px-6 py-8 max-w-5xl mx-auto">
      <Reveal>
        <div className="paper p-6 relative tilt-1">
          <div className="washi washi-mint" style={{ top: -10, right: 70, transform: "rotate(6deg)" }} />
          <h2 className="paper-text" style={{ fontFamily: "'Shadows Into Light', cursive", fontSize: 36 }}>
            sticker wall <Sparkles size={22} className="inline" />
          </h2>
          <div className="mt-4 flex flex-wrap gap-3 justify-center">
            {config.stickers.map((s, i) => (
              <div
                key={s.id}
                className="paper p-3 text-center"
                style={{
                  transform: `rotate(${((i * 17) % 9) - 4}deg)`,
                  width: 92,
                }}
                title={s.label}
              >
                <div className="text-3xl">
                  {s.imageUrl ? (
                    <img 
                      src={s.imageUrl} 
                      alt={s.label} 
                      className="w-12 h-12 rounded-lg object-cover"
                      onError={(e) => { 
                        e.currentTarget.style.display = 'none';
                        e.currentTarget.nextElementSibling?.classList.remove('hidden');
                      }}
                    />
                  ) : null}
                  <span className={`${s.imageUrl ? 'hidden' : ''}`}>{s.emoji}</span>
                </div>
                <div className="text-xs paper-text-muted mt-1 truncate" style={{ fontFamily: "'Indie Flower', cursive" }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </Reveal>
    </section>
  );
}

/* ===================== Steam ===================== */

export function SteamSection({ config }: { config: AppConfig }) {
  return (
    <section id="steam" className="px-6 py-8 max-w-4xl mx-auto">
      <Reveal>
        <SteamCard steamId={config.contact.steamId} />
      </Reveal>
    </section>
  );
}

/* ===================== Stuff i made ===================== */

export function StuffIMadeSection({ config }: { config: AppConfig }) {
  return (
    <section id="stuffIMade" className="px-6 py-8 max-w-5xl mx-auto">
      <Reveal>
        <h2 className="palette-text mb-3" style={{ fontFamily: "'Shadows Into Light', cursive", fontSize: 36 }}>
          stuff i made <Award size={22} className="inline" />
        </h2>
        {config.stuffIMade.length === 0 ? (
          <div className="paper paper-2 p-6 text-center palette-text-muted italic" style={{ color: "var(--paper-ink-soft)" }}>
            nothing here yet — add via the admin panel
          </div>
        ) : (
          <div className="grid md:grid-cols-3 gap-4">
            {config.stuffIMade.map((p, i) => {
              const Tag = p.url ? "a" : "div";
              const props = p.url ? { href: p.url, target: "_blank", rel: "noreferrer" } : {};
              return (
                <Tag
                  key={i}
                  {...props}
                  className="paper p-5 block hover:scale-[1.01] transition-transform"
                  style={{ transform: `rotate(${(i % 2 === 0 ? -1 : 1) * 1.2}deg)` }}
                >
                  <div className="flex items-start justify-between">
                    <div className="text-3xl">{p.emoji}</div>
                    <span className="text-[10px] uppercase tracking-widest font-mono px-2 py-1 rounded-full paper-2 paper-text">{p.tag}</span>
                  </div>
                  <h3 className="mt-2 paper-text" style={{ fontFamily: "'Shadows Into Light', cursive", fontSize: 26 }}>{p.title}</h3>
                  <p className="text-sm paper-text-muted" style={{ fontFamily: "'Indie Flower', cursive" }}>{p.blurb}</p>
                </Tag>
              );
            })}
          </div>
        )}
      </Reveal>
    </section>
  );
}

/* ===================== Footer ===================== */

export function FooterSection({ config }: { config: AppConfig }) {
  const visits = useViewCount();
  return (
    <footer id="footer" className="relative mt-12 pt-12 pb-8 px-6 text-center">
      <Doodle kind="heart" top="20%" left="14%" size={36} rotate={-20} />
      <Doodle kind="swirl" top="36%" left="84%" size={48} rotate={10} />

      <h2 className="palette-text" style={{ fontFamily: "'Shadows Into Light', cursive", fontSize: 60 }}>
        {config.footer.headline}
      </h2>
      {config.footer.sub && (
        <p className="mt-2 palette-text-soft" style={{ fontFamily: "'Indie Flower', cursive", fontSize: 22 }}>
          {config.footer.sub}
        </p>
      )}

      <div className="mt-6 flex flex-wrap items-center justify-center gap-4 text-xs uppercase tracking-widest font-mono palette-text-muted">
        {visits != null && (
          <span className="flex items-center gap-1">
            <Eye size={12} /> {visits.toLocaleString()} visits
          </span>
        )}
        {config.about.showTimezone && <LiveClock tz={config.about.timezone} />}
      </div>

      {config.footer.bottom && (
        <p className="mt-6 palette-text-muted text-sm" style={{ fontFamily: "'Indie Flower', cursive" }}>
          {config.footer.bottom}
        </p>
      )}

      {config.footer.showTransFlair && config.features.transFlair && (
        <div className="mt-8 inline-flex flex-col items-center gap-1">
          <div className="trans-flair-strip" />
          <span className="text-[10px] uppercase tracking-[0.3em] font-mono palette-text-muted">
            {config.footer.transFlairText}
          </span>
        </div>
      )}
    </footer>
  );
}
