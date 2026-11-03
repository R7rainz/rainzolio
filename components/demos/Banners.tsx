"use client";

import { useRef, useState } from "react";
import { useTimers, type DemoProps } from "@/components/demos/hooks";

/**
 * GitHub Banners, small: type a username and render. A cache miss walks the
 * real pipeline (token rotation, aggregate, render, store with soft/hard
 * TTLs); rendering again is a cache hit. R7rainz shows the real stats the page
 * already fetched; other names get stable made-up numbers from a hash.
 */

const LANGS = ["TypeScript", "Go", "Rust", "Python", "C++", "Lua", "Java", "Zig"];
const PIPELINE = ["cache MISS", "github api · token 3/4", "aggregate repos, stars, languages", "render svg", "store · soft TTL 10m, hard 24h"];

type Banner = { user: string; repos: number; stars: number; langs: string[] };

function hash(s: string) {
  let h = 2166136261;
  for (const c of s) h = Math.imul(h ^ c.charCodeAt(0), 16777619);
  return h >>> 0;
}

function made(user: string): Banner {
  const h = hash(user.toLowerCase());
  return {
    user,
    repos: 5 + (h % 76),
    stars: (h >> 7) % 420,
    langs: [0, 3, 5].map((k) => LANGS[(h >> k) % LANGS.length]).filter((l, i, a) => a.indexOf(l) === i),
  };
}

export function Banners({ stats }: DemoProps) {
  const t = useTimers();
  const cache = useRef(new Map<string, Banner>());
  const [user, setUser] = useState("R7rainz");
  const [stage, setStage] = useState(-1);
  const [banner, setBanner] = useState<Banner | null>(null);
  const [hit, setHit] = useState(false);

  const render = () => {
    const name = user.trim().replace(/^@/, "") || "R7rainz";
    const key = name.toLowerCase();
    t.clear();
    const cached = cache.current.get(key);
    if (cached) {
      setBanner(cached);
      setHit(true);
      setStage(-1);
      return;
    }
    const data: Banner =
      key === "r7rainz" && stats ? { user: name, repos: stats.repos, stars: stats.stars, langs: stats.topLanguages.slice(0, 3) } : made(name);
    setBanner(null);
    setHit(false);
    setStage(0);
    PIPELINE.forEach((_, i) => t.later(380 * (i + 1), () => setStage(i + 1)));
    t.later(380 * (PIPELINE.length + 1), () => {
      cache.current.set(key, data);
      setBanner(data);
    });
  };

  return (
    <div className="grid gap-4 p-4 sm:p-6 md:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
      <div>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            render();
          }}
          className="flex gap-2"
        >
          <label className="flex min-w-0 flex-1 items-center gap-1 rounded-full bg-[var(--inset)] px-4 py-2 font-mono text-xs text-foreground-subtle">
            /banner/
            <input
              value={user}
              onChange={(e) => setUser(e.target.value)}
              aria-label="GitHub username"
              spellCheck={false}
              className="min-w-0 flex-1 bg-transparent text-heading outline-none"
            />
          </label>
          <button type="submit" className="rounded-full bg-heading px-4 py-2 text-xs font-medium text-background">
            Render
          </button>
        </form>

        <ol aria-live="polite" className="mt-4 flex flex-col gap-1.5 font-mono text-[0.72rem]">
          {hit ? (
            <li className="rise text-heading">✓ cache HIT · served in 2ms · fresh (soft TTL)</li>
          ) : (
            PIPELINE.map((p, i) => (
              <li
                key={p}
                className={`transition-colors duration-300 ${i < stage ? "text-heading" : i === stage ? "text-accent-text" : "text-foreground-subtle/50"}`}
              >
                {i < stage ? "✓" : i === stage ? "›" : "·"} {p}
              </li>
            ))
          )}
        </ol>
        <p className="mt-4 font-mono text-[0.66rem] text-foreground-subtle">Render twice: the second one comes from cache.</p>
      </div>

      <div className="well grid min-h-48 place-items-center p-5">
        {banner ? (
          <div key={`${banner.user}-${hit}`} className="rise card w-full max-w-sm p-5">
            <p className="font-mono text-[0.62rem] uppercase tracking-wider text-foreground-subtle">github.com/{banner.user}</p>
            <p className="mt-1 text-2xl font-semibold tracking-[-0.03em] text-heading">{banner.user}</p>
            <div className="mt-4 flex gap-6">
              <div>
                <p className="text-xl font-semibold tabular-nums text-heading">{banner.repos}</p>
                <p className="font-mono text-[0.62rem] text-foreground-subtle">repos</p>
              </div>
              <div>
                <p className="text-xl font-semibold tabular-nums text-heading">{banner.stars}</p>
                <p className="font-mono text-[0.62rem] text-foreground-subtle">stars</p>
              </div>
            </div>
            <div className="mt-4 flex flex-wrap gap-1.5">
              {banner.langs.map((l) => (
                <span key={l} className="rounded-full bg-[var(--inset)] px-2.5 py-1 font-mono text-[0.62rem] text-foreground-muted">
                  {l}
                </span>
              ))}
            </div>
          </div>
        ) : (
          <p className="text-center text-sm text-foreground-subtle">{stage >= 0 ? "rendering…" : "Your banner shows up here."}</p>
        )}
      </div>
    </div>
  );
}
