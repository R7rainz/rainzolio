"use client";

import { useEffect, useState } from "react";

/**
 * Fedora KDE workflow scene.
 *
 * The old Arch/Hyprland identity is intentionally gone. This card now shows a
 * polished Fedora + KDE Plasma desktop: panel, launcher, widgets, terminals,
 * and a clean dev workspace.
 */

const WINDOWS = [
  { id: "nvim", title: "nvim", accent: "#3c6eb4", area: "col-span-2 row-span-2" },
  { id: "konsole", title: "konsole", accent: "#2aa198", area: "col-span-1 row-span-1" },
  { id: "monitor", title: "system monitor", accent: "#fb4934", area: "col-span-1 row-span-1" },
] as const;

const TIMELINE = [0, 1, 2, 3, 3, 3, 3, 3, 3];
const BEAT_MS = 620;

export function Dotfiles() {
  const [beat, setBeat] = useState(0);
  const [focus, setFocus] = useState<string | null>(null);

  useEffect(() => {
    const id = setInterval(() => setBeat((b) => (b + 1) % TIMELINE.length), BEAT_MS);
    return () => clearInterval(id);
  }, []);

  const open = TIMELINE[beat];

  return (
    <div className="relative flex h-full w-full flex-col overflow-hidden bg-gradient-to-br from-[#0b1020] via-[#101826] to-[#001b24] p-3">
      <div className="pointer-events-none absolute inset-0 grid place-items-center">
        <FedoraMark className="h-3/4 w-3/4 text-[#3c6eb4]/[0.08]" />
      </div>
      <div className="pointer-events-none absolute -bottom-1/4 -right-1/4 h-2/3 w-2/3 rounded-full bg-[#3c6eb4]/20 blur-3xl" />
      <div className="pointer-events-none absolute -left-1/4 -top-1/4 h-1/2 w-1/2 rounded-full bg-[#fb4934]/12 blur-3xl" />

      {/* KDE-style top panel */}
      <div className="relative z-10 mb-3 flex items-center justify-between rounded-xl bg-black/35 px-3 py-1.5 font-mono text-[0.6rem] text-white/55 ring-1 ring-white/10 backdrop-blur-md">
        <div className="flex items-center gap-2">
          <span className="grid h-5 w-5 place-items-center rounded-full bg-[#3c6eb4] text-white">
            <FedoraMark className="h-3.5 w-3.5" />
          </span>
          <span className="rounded-md bg-white/8 px-2 py-0.5 text-white/70">plasma</span>
        </div>

        <span className="flex items-center gap-1.5 text-[#8ab4f8]">
          <span className="h-1.5 w-1.5 rounded-full bg-[#2aa198]" />
          <span className="text-white/60">fedora · kde</span>
        </span>

        <div className="flex items-center gap-3">
          <span>cpu 42%</span>
          <span>mem 5.1G</span>
          <span className="text-white/80">21:04</span>
        </div>
      </div>

      <div className="relative z-10 grid min-h-0 flex-1 grid-cols-3 grid-rows-2 gap-3">
        {WINDOWS.map((w, i) => {
          const isOpen = i < open;
          const isFocus = focus === w.id;
          return (
            <div
              key={w.id}
              onMouseEnter={() => setFocus(w.id)}
              onMouseLeave={() => setFocus(null)}
              className={`${w.area} flex min-h-0 flex-col overflow-hidden rounded-xl bg-black/45 backdrop-blur-sm transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] ${
                isOpen ? "scale-100 opacity-100" : "scale-90 opacity-0"
              }`}
              style={{
                boxShadow: isFocus
                  ? `0 0 0 1.5px ${w.accent}, 0 8px 30px rgba(0,0,0,.5)`
                  : "0 0 0 1px rgba(255,255,255,.08)",
              }}
            >
              <div className="flex shrink-0 items-center justify-between border-b border-white/5 px-2 py-1">
                <div className="flex items-center gap-1.5">
                  <span className="h-1.5 w-1.5 rounded-full" style={{ background: w.accent }} />
                  <span className="font-mono text-[0.55rem] text-white/48">{w.title}</span>
                </div>
                <span className="h-1 w-5 rounded-full bg-white/10" />
              </div>

              <div className="min-h-0 flex-1 p-2 font-mono text-[0.55rem] leading-relaxed">
                {w.id === "nvim" && <Nvim />}
                {w.id === "konsole" && (
                  <div className="text-white/45">
                    <div className="text-[#8ab4f8]">~/rainzolio</div>
                    <div className="mt-0.5 text-[#2aa198]">pnpm dev</div>
                    <div className="mt-0.5 text-white/30">ready · localhost:3000</div>
                  </div>
                )}
                {w.id === "monitor" && <SystemMonitor accent={w.accent} />}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function Nvim() {
  const lines = [
    [["type ", "#ff7b72"], ["Service", "#d2a8ff"], [" = {", "#c9d1d9"]],
    [["  cache", "#79c0ff"], [": Redis", "#c9d1d9"], [";", "#c9d1d9"]],
    [["  queue", "#79c0ff"], [": Kafka", "#c9d1d9"], [";", "#c9d1d9"]],
    [["  store", "#79c0ff"], [": Postgres", "#c9d1d9"], [";", "#c9d1d9"]],
    [["}", "#c9d1d9"]],
  ];
  return (
    <pre className="leading-[1.6]">
      {lines.map((line, i) => (
        <div key={i}>
          <span className="mr-2 text-white/20">{String(i + 1).padStart(2, " ")}</span>
          {line.map(([text, color], k) => (
            <span key={k} style={{ color }}>
              {text}
            </span>
          ))}
        </div>
      ))}
    </pre>
  );
}

function SystemMonitor({ accent }: { accent: string }) {
  const bars = [42, 58, 34, 76, 51, 63, 45, 82, 39, 56, 48, 70];
  return (
    <div className="flex h-full min-h-0 items-end gap-[2px]">
      {bars.map((h, k) => (
        <span
          key={k}
          className="flex-1 rounded-sm"
          style={{ height: `${h}%`, background: accent, opacity: 0.28 + h / 220 }}
        />
      ))}
    </div>
  );
}

export function FedoraMark({ className = "h-2.5 w-2.5" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" aria-hidden>
      <circle cx="12" cy="12" r="10" fill="currentColor" />
      <path
        d="M8.3 12.5c0-2.5 1.7-4.2 4.1-4.2h2.4v2.3h-2.4c-1 0-1.7.7-1.7 1.8v.2h3.8v2.2h-3.8v4.1H8.3v-4.1H6.8v-2.2h1.5z"
        fill="white"
        opacity="0.9"
      />
      <path d="M14.8 5.1h2.4v3.2h-2.4z" fill="white" opacity="0.72" />
    </svg>
  );
}
