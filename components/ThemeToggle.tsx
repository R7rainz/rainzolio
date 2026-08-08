"use client";

import { useRef } from "react";
import { setTheme, useTheme, type Theme } from "@/lib/useTheme";

export function ThemeToggle() {
  const theme = useTheme();
  const btn = useRef<HTMLButtonElement>(null);

  const toggle = () => {
    const next: Theme = theme === "dark" ? "light" : "dark";
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    // Circular wipe out of the button. Progressive enhancement — without View
    // Transitions (or with reduced motion) it just swaps.
    if (reduced || !document.startViewTransition) {
      setTheme(next);
      return;
    }

    const t = document.startViewTransition(() => setTheme(next));
    t.ready.then(() => {
      const r = btn.current?.getBoundingClientRect();
      if (!r) return;
      const x = r.left + r.width / 2;
      const y = r.top + r.height / 2;
      // Radius to the farthest corner, so the wipe always covers the viewport.
      const end = Math.hypot(Math.max(x, innerWidth - x), Math.max(y, innerHeight - y));
      document.documentElement.animate(
        { clipPath: [`circle(0px at ${x}px ${y}px)`, `circle(${end}px at ${x}px ${y}px)`] },
        {
          duration: 620,
          easing: "cubic-bezier(0.22, 1, 0.36, 1)",
          pseudoElement: "::view-transition-new(root)",
        },
      );
    });
  };

  const dark = theme === "dark";

  return (
    <button
      ref={btn}
      onClick={toggle}
      aria-label={`Switch to ${dark ? "light" : "dark"} theme`}
      title={`Switch to ${dark ? "light" : "dark"} theme`}
      className="group relative grid h-9 w-9 place-items-center rounded-full border border-border bg-surface/60 text-foreground-muted transition-colors duration-500 hover:border-border-strong hover:text-accent-text"
    >
      <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" aria-hidden>
        {/* One circle morphs between sun and moon: the mask slides in to bite a
            crescent out of it while the rays retract. */}
        <defs>
          <mask id="rainz-moon-mask">
            <rect width="24" height="24" fill="white" />
            <circle
              cx={dark ? 16.5 : 27}
              cy={dark ? 7.5 : 0}
              r="8"
              fill="black"
              className="transition-all duration-700 ease-[cubic-bezier(0.22,1,0.36,1)]"
            />
          </mask>
        </defs>

        <circle
          cx="12"
          cy="12"
          r={dark ? 8.5 : 5}
          mask="url(#rainz-moon-mask)"
          fill="currentColor"
          className="transition-all duration-700 ease-[cubic-bezier(0.22,1,0.36,1)]"
        />

        <g
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
          className={`origin-center transition-all duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] ${
            dark ? "scale-50 opacity-0" : "scale-100 opacity-100"
          }`}
        >
          {[0, 45, 90, 135, 180, 225, 270, 315].map((deg) => (
            <line key={deg} x1="12" y1="1.6" x2="12" y2="4" transform={`rotate(${deg} 12 12)`} />
          ))}
        </g>
      </svg>
    </button>
  );
}
