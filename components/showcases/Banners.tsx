"use client";

import { useEffect, useState } from "react";

/**
 * GitHub Banners showcase — the service's own output.
 *
 * The project renders SVG banners of GitHub stats, so the showcase is a banner
 * being rendered: cache miss, fetch, aggregate, then the SVG paints in. Stats
 * shown are Ronak's real ones, passed in from the server.
 */

const STAGES = [
  { label: "GET /banner/R7rainz", note: "cache MISS" },
  { label: "fetch github api", note: "token 2/4" },
  { label: "aggregate stats", note: "kafka → render" },
  { label: "200 image/svg+xml", note: "cached 6h" },
];

export function Banners({ repos, stars }: { repos: number; stars: number }) {
  const [stage, setStage] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setStage((s) => (s + 1) % (STAGES.length + 1)), 1100);
    return () => clearInterval(id);
  }, []);

  const rendered = stage >= STAGES.length;

  return (
    <div className="flex h-full flex-col justify-center gap-3 p-5 font-mono">
      {/* pipeline */}
      <div className="flex flex-col gap-1">
        {STAGES.map((s, i) => {
          const done = stage > i;
          const active = stage === i;
          return (
            <div
              key={s.label}
              className="flex items-baseline justify-between gap-2 text-[0.58rem] transition-opacity duration-500"
              style={{ opacity: done || active ? 1 : 0.28 }}
            >
              <span className={active ? "text-accent-text" : "text-foreground-muted"}>
                {done ? "✓" : active ? "›" : " "} {s.label}
              </span>
              <span className="text-foreground-subtle">{s.note}</span>
            </div>
          );
        })}
      </div>

      {/* the banner it produces */}
      <div
        className="mt-1 overflow-hidden rounded-md border border-border bg-surface transition-all duration-700 ease-[cubic-bezier(0.22,1,0.36,1)]"
        style={{
          opacity: rendered ? 1 : 0.25,
          transform: rendered ? "translateY(0)" : "translateY(4px)",
        }}
      >
        <div className="flex items-center justify-between px-3 py-2.5">
          <div>
            <p className="text-[0.6rem] font-semibold text-heading">R7rainz</p>
            <p className="text-[0.5rem] text-foreground-subtle">github stats</p>
          </div>
          <div className="flex gap-4 text-right">
            <div>
              <p className="text-[0.7rem] font-semibold tabular-nums text-accent-text">{repos}</p>
              <p className="text-[0.45rem] uppercase tracking-wider text-foreground-subtle">repos</p>
            </div>
            <div>
              <p className="text-[0.7rem] font-semibold tabular-nums text-accent-text">{stars}</p>
              <p className="text-[0.45rem] uppercase tracking-wider text-foreground-subtle">stars</p>
            </div>
          </div>
        </div>
        <div className="h-[3px] w-full bg-gradient-to-r from-accent via-accent/40 to-transparent" />
      </div>
    </div>
  );
}
