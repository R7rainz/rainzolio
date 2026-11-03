"use client";

import { useEffect, useLayoutEffect, useRef, useState, type ComponentType } from "react";
import { AuraMail } from "@/components/demos/AuraMail";
import { Banners } from "@/components/demos/Banners";
import type { DemoProps } from "@/components/demos/hooks";
import { PulseOps } from "@/components/demos/PulseOps";
import { SongSpot } from "@/components/demos/SongSpot";
import { Switchyard } from "@/components/demos/Switchyard";
import { Label } from "@/components/Heading";
import { Window } from "@/components/Window";

/**
 * The project showcase: pill tabs over one window that runs a small working
 * version of the selected project (picked by its `live` key in profile.json),
 * with the blurb, notes, stack and links underneath. Tabs follow the ARIA tabs
 * pattern (arrow keys move between them). Demos only run timers while the
 * window is on screen.
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

export function Showcase({ projects, stats }: { projects: Project[]; stats: DemoProps["stats"] }) {
  const [active, setActive] = useState(0);
  const [visible, setVisible] = useState(false);
  const [pill, setPill] = useState({ left: 0, width: 0 });
  const tabs = useRef<(HTMLButtonElement | null)[]>([]);
  const stage = useRef<HTMLDivElement>(null);
  const p = projects[active];
  const Demo = (p.live && DEMOS[p.live]) || null;

  // The highlight pill slides to the active tab.
  useLayoutEffect(() => {
    const place = () => {
      const el = tabs.current[active];
      if (el) setPill({ left: el.offsetLeft, width: el.offsetWidth });
    };
    place();
    window.addEventListener("resize", place);
    return () => window.removeEventListener("resize", place);
  }, [active]);

  useEffect(() => {
    const el = stage.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => setVisible(e.isIntersecting));
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const select = (i: number) => {
    const next = (i + projects.length) % projects.length;
    setActive(next);
    tabs.current[next]?.focus();
    tabs.current[next]?.scrollIntoView({ block: "nearest", inline: "center", behavior: "smooth" });
  };

  return (
    <div className="mt-14">
      <div className="flex justify-center">
        <div
          role="tablist"
          aria-label="Projects"
          className="pill relative flex max-w-full gap-0.5 overflow-x-auto p-1"
          onKeyDown={(e) => {
            if (e.key === "ArrowRight") select(active + 1);
            else if (e.key === "ArrowLeft") select(active - 1);
          }}
        >
          <span
            aria-hidden
            className="absolute inset-y-1 rounded-full bg-heading transition-[left,width] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]"
            style={pill}
          />
          {projects.map((x, i) => (
            <button
              key={x.name}
              ref={(el) => {
                tabs.current[i] = el;
              }}
              type="button"
              role="tab"
              id={`tab-${i}`}
              aria-selected={i === active}
              aria-controls="showcase-panel"
              tabIndex={i === active ? 0 : -1}
              onClick={() => select(i)}
              className={`relative shrink-0 rounded-full px-4 py-2 text-sm transition-colors duration-300 ${
                i === active ? "text-background" : "text-foreground-muted hover:text-heading"
              }`}
            >
              {x.name}
            </button>
          ))}
        </div>
      </div>

      <div ref={stage} id="showcase-panel" role="tabpanel" aria-labelledby={`tab-${active}`} className="mt-6">
        <Window title={`${p.name.toLowerCase().replace(/\s+/g, "-")} · simulated`} className="mx-auto max-w-5xl">
          <div key={p.name} className="rise min-h-[22rem]">
            {Demo && <Demo live={visible} stats={stats} />}
          </div>
        </Window>

        <div key={p.name} className="rise mx-auto mt-8 grid max-w-5xl gap-8 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
          <div>
            {p.role && <Label>{p.role}</Label>}
            <h3 className="mt-1.5 text-3xl font-semibold tracking-[-0.035em] text-heading">{p.name}</h3>
            <p className="mt-3 text-pretty leading-relaxed text-foreground-muted">{p.blurb}</p>
          </div>
          <div>
            {p.highlights && (
              <ul className="flex flex-col gap-2">
                {p.highlights.map((h) => (
                  <li key={h} className="flex gap-3 text-pretty text-[0.93rem] text-foreground-muted">
                    <span aria-hidden className="select-none text-accent-text">
                      —
                    </span>
                    <span>{h}</span>
                  </li>
                ))}
              </ul>
            )}
            <ul className="mt-4 flex flex-wrap gap-1.5">
              {p.stack.map((s) => (
                <li key={s} className="rounded-full bg-[var(--inset)] px-2.5 py-1 font-mono text-[0.66rem] text-foreground-muted">
                  {s}
                </li>
              ))}
            </ul>
            <div className="mt-5 flex flex-wrap gap-2">
              <a href={p.repo} target="_blank" rel="noreferrer" className="rounded-full bg-heading px-5 py-2.5 text-sm font-medium text-background">
                Source ↗
              </a>
              {p.demo && (
                <a href={p.demo} target="_blank" rel="noreferrer" className="pill px-5 py-2.5 text-sm font-medium text-heading">
                  Live site ↗
                </a>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
