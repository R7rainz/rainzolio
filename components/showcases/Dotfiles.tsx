"use client";

import { useEffect, useState } from "react";

/**
 * The Arch rice — what R7rainz/dotfiles actually contains.
 *
 * Hyprland on Wayland with a Quickshell (Noctalia) bar; the repo's .config has
 * hypr/, noctalia/, waybar/, rofi/, mako/, fish/, nvim/, yazi/ — hence QML as
 * the repo language. Not Fedora/KDE: that's his current daily driver, but these
 * dotfiles are the Arch setup.
 *
 * Windows tile in one at a time, then the layout holds. Hover focuses a window
 * the way a WM would, and the focused one gets Hyprland's signature gradient
 * border.
 */

const ARCH = "#1793d1";

const WINDOWS = [
  { id: "fetch", title: "fastfetch", accent: ARCH, area: "col-span-2 row-span-1" },
  { id: "nvim", title: "nvim", accent: "#a6e3a1", area: "col-span-1 row-span-2" },
  { id: "yazi", title: "yazi", accent: "#cba6f7", area: "col-span-2 row-span-1" },
];

// Open one at a time, then hold the full layout — that's what you mostly see.
const TIMELINE = [0, 1, 2, 3, 3, 3, 3, 3, 3, 3];
const BEAT_MS = 620;

export function Dotfiles() {
  const [beat, setBeat] = useState(0);
  const [focus, setFocus] = useState<string | null>("fetch");

  useEffect(() => {
    const id = setInterval(() => setBeat((b) => (b + 1) % TIMELINE.length), BEAT_MS);
    return () => clearInterval(id);
  }, []);

  const open = TIMELINE[beat];

  return (
    <div className="relative flex h-full w-full flex-col overflow-hidden bg-[#11111b] p-2.5">
      {/* wallpaper: arch mark + hyprland-ish blooms */}
      <div className="pointer-events-none absolute inset-0 grid place-items-center">
        <ArchMark className="h-[78%] w-[78%]" style={{ color: ARCH, opacity: 0.07 }} />
      </div>
      <div
        className="pointer-events-none absolute -right-1/4 -top-1/3 h-2/3 w-2/3 rounded-full blur-3xl"
        style={{ background: `${ARCH}22` }}
      />
      <div className="pointer-events-none absolute -bottom-1/3 -left-1/4 h-2/3 w-2/3 rounded-full bg-[#cba6f7]/15 blur-3xl" />

      {/* noctalia / quickshell bar */}
      <div className="relative z-10 mb-2.5 flex items-center justify-between rounded-full bg-black/45 px-2.5 py-1 font-mono text-[0.55rem] text-white/55 ring-1 ring-white/10 backdrop-blur-md">
        <div className="flex items-center gap-1.5">
          <ArchMark className="h-2.5 w-2.5" style={{ color: ARCH }} />
          {[1, 2, 3, 4].map((w) => (
            <span
              key={w}
              className={`h-1.5 rounded-full transition-all duration-500 ${
                w === 2 ? "w-4" : "w-1.5"
              }`}
              style={{ background: w === 2 ? ARCH : "rgba(255,255,255,0.22)" }}
            />
          ))}
        </div>

        <span className="truncate text-white/45">hyprland · noctalia</span>

        <div className="flex items-center gap-2">
          <span className="text-[#a6e3a1]">42%</span>
          <span className="text-white/75">21:04</span>
        </div>
      </div>

      {/* hyprland tiling: real gaps, rounded corners, focus border */}
      <div className="relative z-10 grid min-h-0 flex-1 grid-cols-3 grid-rows-2 gap-2.5">
        {WINDOWS.map((w, i) => {
          const isOpen = i < open;
          const isFocus = focus === w.id;
          return (
            <div
              key={w.id}
              onMouseEnter={() => setFocus(w.id)}
              className={`${w.area} relative flex min-h-0 flex-col overflow-hidden rounded-xl bg-[#1e1e2e]/85 backdrop-blur-sm transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] ${
                isOpen ? "scale-100 opacity-100" : "scale-90 opacity-0"
              }`}
              style={{
                // Hyprland's focused window gets a gradient border, not a flat one.
                boxShadow: isFocus
                  ? `0 0 0 1.5px ${w.accent}, 0 0 22px -2px ${w.accent}66`
                  : "0 0 0 1px rgba(255,255,255,.06)",
              }}
            >
              <div className="flex shrink-0 items-center gap-1.5 px-2 pt-1.5">
                <span
                  className="h-1 w-1 rounded-full transition-opacity duration-500"
                  style={{ background: w.accent, opacity: isFocus ? 1 : 0.4 }}
                />
                <span className="font-mono text-[0.5rem] text-white/40">{w.title}</span>
              </div>

              <div className="min-h-0 flex-1 px-2 pb-2 pt-1 font-mono text-[0.5rem] leading-[1.5]">
                {w.id === "fetch" && <Fastfetch />}
                {w.id === "nvim" && <Nvim />}
                {w.id === "yazi" && <Yazi />}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function Fastfetch() {
  const rows = [
    ["os", "Arch Linux x86_64"],
    ["wm", "Hyprland (Wayland)"],
    ["shell", "fish"],
    ["bar", "Noctalia · Quickshell"],
    ["term", "ghostty"],
  ];
  return (
    <div className="flex h-full items-center gap-2.5">
      <ArchMark className="h-8 w-8 shrink-0" style={{ color: ARCH }} />
      <div className="min-w-0 flex-1">
        {rows.map(([k, v]) => (
          <div key={k} className="flex gap-1.5">
            <span className="w-8 shrink-0" style={{ color: ARCH }}>
              {k}
            </span>
            <span className="truncate text-white/55">{v}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function Nvim() {
  // Kept deliberately short — this window is a third of the card and longer
  // tokens clip mid-string, which reads as a bug rather than a code snippet.
  const lines: [string, string][][] = [
    [["Bar", "#f9e2af"], [" {", "#6c7086"]],
    [["  gaps", "#cba6f7"], [": ", "#6c7086"], ["8", "#fab387"]],
    [["  round", "#cba6f7"], [": ", "#6c7086"], ["12", "#fab387"]],
    [["}", "#6c7086"]],
  ];
  return (
    <pre className="leading-[1.6]">
      {lines.map((line, i) => (
        <div key={i}>
          <span className="mr-1.5 text-white/15">{i + 1}</span>
          {line.map(([t, c], k) => (
            <span key={k} style={{ color: c }}>
              {t}
            </span>
          ))}
        </div>
      ))}
    </pre>
  );
}

function Yazi() {
  const files = ["hypr/", "noctalia/", "waybar/", "rofi/"];
  return (
    <div className="flex h-full flex-col justify-center gap-[1px]">
      {files.map((f, i) => (
        <div
          key={f}
          className="flex items-center gap-1.5 rounded px-1"
          style={{ background: i === 1 ? `${ARCH}33` : "transparent" }}
        >
          <span style={{ color: i === 1 ? ARCH : "#6c7086" }}>▸</span>
          <span className={i === 1 ? "text-white/80" : "text-white/40"}>{f}</span>
        </div>
      ))}
    </div>
  );
}

/** The Arch mountain, redrawn — one path so it scales from bar to wallpaper. */
export function ArchMark({
  className = "h-2.5 w-2.5",
  style,
}: {
  className?: string;
  style?: React.CSSProperties;
}) {
  return (
    <svg viewBox="0 0 24 24" className={className} style={style} fill="currentColor" aria-hidden>
      <path d="M12 1.5c1.05 2.57 1.68 4.25 2.86 6.78-.72-.37-1.31-.63-1.87-.81.9 1.93 2.28 4.47 3.22 6.38-1.45-1.12-2.92-1.88-4.21-2.26-1.29.38-2.76 1.14-4.21 2.26.94-1.91 2.32-4.45 3.22-6.38-.56.18-1.15.44-1.87.81C10.32 5.75 10.95 4.07 12 1.5zm0 11.35c1.9.49 3.58 1.6 5.05 3.09l1.5 2.94c-1.7-1-3.6-1.79-5.4-2.19l-1.15-1.19-1.15 1.19c-1.8.4-3.7 1.19-5.4 2.19l1.5-2.94c1.47-1.49 3.15-2.6 5.05-3.09zM3.35 20.05c2.6-1.4 5.6-2.2 8.65-2.2s6.05.8 8.65 2.2l1 2.45c-3-1.72-6.3-2.62-9.65-2.62s-6.65.9-9.65 2.62l1-2.45z" />
    </svg>
  );
}
