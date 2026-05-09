/* Tiny WebAudio sound effects: paper rustle, paper-scrap confetti click, vinyl crackle (loop) */

let ctx: AudioContext | null = null;

function getCtx(): AudioContext | null {
  if (typeof window === "undefined") return null;
  if (!ctx) {
    try {
      const C = (window as unknown as { AudioContext?: typeof AudioContext; webkitAudioContext?: typeof AudioContext }).AudioContext
        ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
      if (!C) return null;
      ctx = new C();
    } catch {
      return null;
    }
  }
  if (ctx?.state === "suspended") {
    void ctx.resume().catch(() => {});
  }
  return ctx;
}

export function playPaperRustle(volume = 0.18) {
  const c = getCtx();
  if (!c) return;
  try {
    const dur = 0.18;
    const buf = c.createBuffer(1, c.sampleRate * dur, c.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < data.length; i++) {
      const t = i / data.length;
      const env = Math.exp(-3 * t);
      data[i] = (Math.random() * 2 - 1) * env;
    }
    const src = c.createBufferSource();
    src.buffer = buf;
    const filter = c.createBiquadFilter();
    filter.type = "highpass";
    filter.frequency.value = 1800;
    const gain = c.createGain();
    gain.gain.value = volume;
    src.connect(filter).connect(gain).connect(c.destination);
    src.start();
  } catch {
    /* ignore */
  }
}

export function playClickPop(volume = 0.22) {
  const c = getCtx();
  if (!c) return;
  try {
    const o = c.createOscillator();
    o.type = "triangle";
    o.frequency.setValueAtTime(720, c.currentTime);
    o.frequency.exponentialRampToValueAtTime(180, c.currentTime + 0.12);
    const g = c.createGain();
    g.gain.setValueAtTime(volume, c.currentTime);
    g.gain.exponentialRampToValueAtTime(0.001, c.currentTime + 0.16);
    o.connect(g).connect(c.destination);
    o.start();
    o.stop(c.currentTime + 0.18);
  } catch {
    /* ignore */
  }
}

let crackleStop: (() => void) | null = null;
export function startVinylCrackle(volume = 0.08) {
  if (crackleStop) return;
  const c = getCtx();
  if (!c) return;
  try {
    const bufLen = c.sampleRate * 2;
    const buf = c.createBuffer(1, bufLen, c.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < data.length; i++) {
      // mostly silent, occasional pops
      const r = Math.random();
      data[i] = r > 0.997 ? (Math.random() * 2 - 1) * 0.6 : (Math.random() * 2 - 1) * 0.04;
    }
    const src = c.createBufferSource();
    src.buffer = buf;
    src.loop = true;
    const filter = c.createBiquadFilter();
    filter.type = "bandpass";
    filter.frequency.value = 2400;
    filter.Q.value = 0.7;
    const gain = c.createGain();
    gain.gain.value = volume;
    src.connect(filter).connect(gain).connect(c.destination);
    src.start();
    crackleStop = () => {
      try {
        src.stop();
        src.disconnect();
      } catch {
        /* ignore */
      }
      crackleStop = null;
    };
  } catch {
    /* ignore */
  }
}

export function stopVinylCrackle() {
  if (crackleStop) crackleStop();
}

/* Confetti: spawn paper-scrap divs that fall from a click point */
export function paperScrapConfetti(x: number, y: number, accent = "#34d399") {
  const colors = ["#fff8a8", "#f5a9b8", accent, "#5bcefa", "#fafaf2", "#ffd6e7"];
  const root = document.body;
  const N = 14;
  for (let i = 0; i < N; i++) {
    const sc = document.createElement("div");
    sc.style.position = "fixed";
    sc.style.left = x + "px";
    sc.style.top = y + "px";
    sc.style.width = 8 + Math.random() * 8 + "px";
    sc.style.height = 4 + Math.random() * 5 + "px";
    sc.style.background = colors[Math.floor(Math.random() * colors.length)];
    sc.style.borderRadius = "1px";
    sc.style.pointerEvents = "none";
    sc.style.zIndex = "9999";
    sc.style.transform = `rotate(${Math.random() * 360}deg)`;
    sc.style.opacity = "0.92";
    sc.style.boxShadow = "0 1px 1px rgba(0,0,0,0.2)";
    root.appendChild(sc);
    const vx = (Math.random() - 0.5) * 360;
    const vy = -120 - Math.random() * 200;
    const rot = (Math.random() - 0.5) * 720;
    const dur = 900 + Math.random() * 600;
    sc.animate(
      [
        { transform: sc.style.transform, opacity: 0.92 },
        {
          transform: `translate(${vx}px, ${vy + 240}px) rotate(${rot}deg)`,
          opacity: 0,
        },
      ],
      { duration: dur, easing: "cubic-bezier(.2,.6,.4,1)", fill: "forwards" },
    );
    setTimeout(() => sc.remove(), dur + 50);
  }
}
