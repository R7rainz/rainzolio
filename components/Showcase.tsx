"use client";

import { useEffect, useRef, useState, type ComponentType } from "react";
import { flushSync } from "react-dom";
import { AuraMail } from "@/components/demos/AuraMail";
import { Banners } from "@/components/demos/Banners";
import type { DemoProps } from "@/components/demos/hooks";
import { PulseOps } from "@/components/demos/PulseOps";
import { SongSpot } from "@/components/demos/SongSpot";
import { Switchyard } from "@/components/demos/Switchyard";
import { Label } from "@/components/Heading";
import { Window } from "@/components/Window";

/**
 * The project showcase: a fixed-size stage (window + info panel) that never
 * changes height between projects, and a macOS-style dock to switch them.
 * Dock icons magnify toward the pointer; launching one bounces it, shrinks the
 * window into the old app's icon and grows it back out of the new one (Web
 * Animations, no library). The dock is the tablist, the window the tabpanel;
 * arrow keys move between apps. Demos only run timers while on screen.
 */

type Project = {
  name: string;
  blurb: string;
  role: string | null;
  stack: string[];
  repo: string;
  demo: string | null;
  highlights?: string[];
  live?: string;
};

const DEMOS: Record<string, ComponentType<DemoProps>> = {
  switchyard: Switchyard,
  pulse: PulseOps,
  mail: AuraMail,
  sync: SongSpot,
  banners: Banners,
};

// One monochrome glyph per app (24×24, stroked).
const GLYPHS: Record<string, React.ReactNode> = {
  switchyard: <path d="M6 3v18M6 9c0 4 3 6 8 6h4M15 12l3 3-3 3" />,
  pulse: <path d="M3 12h4l2-5 4 10 2-5h6" />,
  mail: (
    <>
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <path d="m3 7 9 6 9-6" />
    </>
  ),
  sync: (
    <>
      <path d="M9 18V5l11-2v13" />
      <circle cx="6" cy="18" r="3" />
      <circle cx="17" cy="16" r="3" />
    </>
  ),
  banners: (
    <>
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <path d="M7.5 15v-3M12 15V9M16.5 15v-5" />
    </>
  ),
};

const calm = () => matchMedia("(prefers-reduced-motion: reduce)").matches;

export function Showcase({ projects, stats }: { projects: Project[]; stats: DemoProps["stats"] }) {
  const [active, setActive] = useState(0);
  const [visible, setVisible] = useState(false);
  const [hover, setHover] = useState<number | null>(null);
  const icons = useRef<(HTMLButtonElement | null)[]>([]);
  const win = useRef<HTMLDivElement>(null);
  const stage = useRef<HTMLDivElement>(null);
  const busy = useRef(false);
  const p = projects[active];
  const Demo = (p.live && DEMOS[p.live]) || null;

  useEffect(() => {
    const el = stage.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => setVisible(e.isIntersecting));
    io.observe(el);
    return () => io.disconnect();
  }, []);

  /** Where a window-sized box must move and shrink to sit on icon i. */
  const toward = (i: number) => {
    const w = win.current!.getBoundingClientRect();
    const ic = icons.current[i]!.getBoundingClientRect();
    const dx = ic.left + ic.width / 2 - (w.left + w.width / 2);
    const dy = ic.top + ic.height / 2 - (w.top + w.height / 2);
    return `translate(${dx}px, ${dy}px) scale(${(ic.width / w.width).toFixed(3)})`;
  };

  const bounce = (i: number) =>
    icons.current[i]?.animate(
      [{ transform: "translateY(0)" }, { transform: "translateY(-14px)" }, { transform: "translateY(0)" }, { transform: "translateY(-6px)" }, { transform: "translateY(0)" }],
      { duration: 700, easing: "ease-out" },
    );

  const launch = async (i: number) => {
    const next = (i + projects.length) % projects.length;
    icons.current[next]?.focus();
    if (next === active || busy.current) return;
    if (calm() || !win.current) return setActive(next);
    busy.current = true;
    bounce(next);
    const w = win.current;
    const out = w.animate([{ transform: "none", opacity: 1 }, { transform: toward(active), opacity: 0 }], {
      duration: 220,
      easing: "cubic-bezier(0.5, 0, 0.75, 0)",
      fill: "forwards",
    });
    await out.finished;
    flushSync(() => setActive(next));
    const into = w.animate([{ transform: toward(next), opacity: 0 }, { transform: "none", opacity: 1 }], {
      duration: 480,
      easing: "cubic-bezier(0.22, 1, 0.36, 1)",
    });
    out.cancel();
    await into.finished;
    busy.current = false;
  };

  // Mac-style magnification: each icon grows with closeness to the pointer.
  const magnify = (e: React.PointerEvent) => {
    if (e.pointerType !== "mouse" || calm()) return;
    icons.current.forEach((el) => {
      if (!el) return;
      const r = el.getBoundingClientRect();
      const d = Math.abs(e.clientX - (r.left + r.width / 2));
      el.style.setProperty("--s", String(1 + 0.45 * Math.max(0, 1 - d / 140)));
    });
  };
  const settle = () => icons.current.forEach((el) => el?.style.setProperty("--s", "1"));

  return (
    <div className="mt-14">
      <div ref={stage} className="mx-auto grid max-w-6xl gap-5 lg:h-[32rem] lg:grid-cols-[minmax(0,1fr)_20rem] lg:grid-rows-[minmax(0,1fr)]">
        <div ref={win} id="showcase-panel" role="tabpanel" aria-labelledby={`app-${active}`} className="h-[34rem] will-change-transform lg:h-full">
          <Window title={`${p.name.toLowerCase().replace(/\s+/g, "-")} · simulated`} className="flex h-full flex-col">
            <div key={p.name} className="min-h-0 flex-1 overflow-y-auto">
              {Demo && <Demo live={visible} stats={stats} />}
            </div>
          </Window>
        </div>

        {/* Fixed height: the text scrolls (fading at the edge), the links stay pinned below. */}
        <aside className="card flex h-[22rem] flex-col p-6 lg:h-full">
          <div key={p.name} className="rise min-h-0 flex-1 overflow-y-auto pb-6 [mask-image:linear-gradient(to_bottom,black_85%,transparent)]">
            {p.role && <Label>{p.role}</Label>}
            <h3 className="mt-1.5 text-2xl font-semibold tracking-[-0.035em] text-heading">{p.name}</h3>
            <p className="mt-3 text-pretty text-[0.88rem] leading-relaxed text-foreground-muted">{p.blurb}</p>
            {p.highlights && (
              <ul className="mt-5 flex flex-col gap-2">
                {p.highlights.map((h) => (
                  <li key={h} className="flex gap-2.5 text-pretty text-[0.82rem] text-foreground-muted">
                    <span aria-hidden className="select-none text-accent-text">
                      —
                    </span>
                    <span>{h}</span>
                  </li>
                ))}
              </ul>
            )}
            <ul className="mt-5 flex flex-wrap gap-1.5">
              {p.stack.map((s) => (
                <li key={s} className="rounded-full bg-[var(--inset)] px-2.5 py-1 font-mono text-[0.64rem] text-foreground-muted">
                  {s}
                </li>
              ))}
            </ul>
          </div>
          <div className="flex flex-wrap gap-2 pt-4">
            <a href={p.repo} target="_blank" rel="noreferrer" className="rounded-full bg-heading px-4 py-2 text-xs font-medium text-background">
              Source ↗
            </a>
            {p.demo && (
              <a href={p.demo} target="_blank" rel="noreferrer" className="pill px-4 py-2 text-xs font-medium text-heading">
                Live site ↗
              </a>
            )}
          </div>
        </aside>
      </div>

      {/* The dock. Fixed height; magnified icons grow up out of it, never shifting the page. */}
      <div className="mt-8 flex h-24 items-end justify-center">
        <div
          role="tablist"
          aria-label="Projects"
          onPointerMove={magnify}
          onPointerLeave={settle}
          onKeyDown={(e) => {
            if (e.key === "ArrowRight") launch(active + 1);
            else if (e.key === "ArrowLeft") launch(active - 1);
          }}
          className="pill flex items-end gap-3 rounded-[1.4rem] px-3 pb-2.5 pt-3"
        >
          {projects.map((x, i) => (
            <div key={x.name} className="relative flex flex-col items-center">
              {hover === i && (
                <span className="pill pointer-events-none absolute -top-12 whitespace-nowrap px-3 py-1 text-xs text-heading">{x.name}</span>
              )}
              <button
                ref={(el) => {
                  icons.current[i] = el;
                }}
                type="button"
                role="tab"
                id={`app-${i}`}
                aria-label={x.name}
                aria-selected={i === active}
                aria-controls="showcase-panel"
                tabIndex={i === active ? 0 : -1}
                onClick={() => launch(i)}
                onPointerEnter={() => setHover(i)}
                onPointerLeave={() => setHover(null)}
                onFocus={() => setHover(i)}
                onBlur={() => setHover(null)}
                className="card grid h-12 w-12 origin-bottom place-items-center rounded-[0.9rem] text-heading transition-transform duration-150 ease-out [transform:scale(var(--s,1))] sm:h-14 sm:w-14 sm:rounded-[1rem]"
              >
                <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                  {x.live && GLYPHS[x.live]}
                </svg>
              </button>
              <span aria-hidden className={`mt-1.5 h-1 w-1 rounded-full transition-opacity duration-300 ${i === active ? "bg-heading opacity-100" : "opacity-0"}`} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
