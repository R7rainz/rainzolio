"use client";

import { useEffect, useRef, useState } from "react";
import { flushSync } from "react-dom";
import { Diagram, type DiagramData } from "@/components/Diagram";
import { Label } from "@/components/Heading";

/**
 * A project card built from depth, not outlines: the diagram sits in a recessed
 * well, and on hover the card tilts toward the pointer in 3D, lifts, and its
 * layers float apart (.project-card / .layer-* in globals.css), with a light
 * following the cursor and the actions arriving one by one.
 *
 * Opening it morphs the card into a <dialog> (a shared view-transition name
 * hands the card's box to the pop-up and back) that walks the diagram's flow
 * step by step beside the engineering notes. Without view transitions, or with
 * reduced motion, the dialog just pops. Native <dialog> brings focus trapping.
 */

type Project = {
  name: string;
  blurb: string;
  role: string | null;
  stack: string[];
  repo: string;
  demo: string | null;
  highlights?: string[];
  diagram?: DiagramData;
};

const STEP_MS = 1500;
const MORPH = "project-morph";

const calm = () => matchMedia("(prefers-reduced-motion: reduce)").matches;

/** Run `update` inside a view transition tagged "project", if we can and should. */
function morph(update: () => void, done: () => void) {
  if (calm() || !document.startViewTransition) {
    update();
    done();
    return false;
  }
  const root = document.documentElement;
  root.dataset.vt = "project";
  const t = document.startViewTransition(update);
  t.finished.finally(() => {
    delete root.dataset.vt;
    done();
  });
  return true;
}

export function ProjectCard({ p, n, wide }: { p: Project; n: number; wide: boolean }) {
  const card = useRef<HTMLElement>(null);
  const dialog = useRef<HTMLDialogElement>(null);
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState(0);
  const [playing, setPlaying] = useState(true);
  const flow = p.diagram?.flow ?? [];

  const show = () => {
    const c = card.current;
    const d = dialog.current;
    if (!c || !d || d.open) return;
    c.style.viewTransitionName = MORPH;
    const morphed = morph(
      () => {
        c.style.viewTransitionName = "";
        d.style.viewTransitionName = MORPH;
        flushSync(() => {
          setStep(0);
          setPlaying(!calm());
          setOpen(true);
        });
        d.showModal();
      },
      () => (d.style.viewTransitionName = ""),
    );
    d.classList.toggle("vt", morphed);
  };

  const hide = () => {
    const c = card.current;
    const d = dialog.current;
    if (!c || !d || !d.open) return;
    d.style.viewTransitionName = MORPH;
    morph(
      () => {
        d.style.viewTransitionName = "";
        c.style.viewTransitionName = MORPH;
        d.close();
      },
      () => (c.style.viewTransitionName = ""),
    );
  };

  // Walk the flow while the pop-up is open and playing.
  useEffect(() => {
    if (!open || !playing || flow.length < 2) return;
    const id = window.setInterval(() => setStep((s) => (s + 1) % flow.length), STEP_MS);
    return () => window.clearInterval(id);
  }, [open, playing, flow.length]);

  const go = (s: number) => {
    setPlaying(false);
    setStep((s + flow.length) % flow.length);
  };

  const tilt = (e: React.PointerEvent<HTMLElement>) => {
    if (e.pointerType !== "mouse") return;
    const el = e.currentTarget;
    const r = el.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width;
    const y = (e.clientY - r.top) / r.height;
    el.style.setProperty("--mx", `${x * 100}%`);
    el.style.setProperty("--my", `${y * 100}%`);
    if (calm()) return;
    el.style.setProperty("--rx", `${(0.5 - y) * 7}deg`);
    el.style.setProperty("--ry", `${(x - 0.5) * 9}deg`);
  };
  const untilt = (e: React.PointerEvent<HTMLElement>) => {
    e.currentTarget.style.setProperty("--rx", "0deg");
    e.currentTarget.style.setProperty("--ry", "0deg");
  };

  const label = (id: string) => p.diagram?.nodes.find((x) => x.id === id)?.label ?? id;
  // The wire into each step, so the walkthrough says how it got there.
  const via = (k: number) => p.diagram?.edges.find((e) => e[0] === flow[k - 1] && e[1] === flow[k])?.[2];

  return (
    <div className={`reveal ${wide ? "lg:col-span-2" : ""}`}>
      <article
        ref={card}
        onPointerMove={tilt}
        onPointerLeave={untilt}
        className={`project-card card group relative flex h-full flex-col p-3 ${wide ? "lg:flex-row-reverse lg:items-stretch" : ""}`}
      >
        {/* The preview opens the pop-up on click; keyboard users get the button below. */}
        <div onClick={show} className={`layer layer-2 cursor-zoom-in [&_figure]:my-0 ${wide ? "lg:w-[56%]" : ""}`}>
          {p.diagram && <Diagram n={n} data={p.diagram} interactive={false} caption={false} />}
        </div>

        <div className="layer layer-1 relative flex flex-1 flex-col px-4 pb-4 pt-6 sm:px-5">
          <span
            aria-hidden
            className="pointer-events-none absolute right-4 top-4 font-mono text-5xl font-semibold leading-none text-foreground-subtle/15"
          >
            {String(n).padStart(2, "0")}
          </span>
          {p.role && <Label>{p.role}</Label>}
          <h3 className="mt-1.5 text-[1.75rem] font-semibold leading-tight tracking-[-0.035em] text-heading">{p.name}</h3>
          <p className="mt-3 line-clamp-3 text-pretty text-[0.97rem] leading-relaxed text-foreground-muted">{p.blurb}</p>
          <ul className="mt-4 flex flex-wrap gap-1.5">
            {p.stack.map((s) => (
              <li key={s} className="rounded-full bg-[var(--inset)] px-2.5 py-1 font-mono text-[0.66rem] text-foreground-muted">
                {s}
              </li>
            ))}
          </ul>

          <div className="mt-auto flex flex-wrap gap-2 pt-6">
            <button
              type="button"
              onClick={show}
              className="action rounded-full bg-heading px-4 py-2 text-xs font-medium text-background shadow-[0_8px_20px_-8px_var(--shade-deep)]"
            >
              Open workflow →
            </button>
            <a href={p.repo} target="_blank" rel="noreferrer" className="action pill px-4 py-2 text-xs font-medium text-heading">
              Source ↗
            </a>
            {p.demo && (
              <a href={p.demo} target="_blank" rel="noreferrer" className="action pill px-4 py-2 text-xs font-medium text-heading">
                Demo ↗
              </a>
            )}
          </div>
        </div>
      </article>

      <dialog
        ref={dialog}
        onClose={() => setOpen(false)}
        // Esc and backdrop clicks close through the morph too.
        onCancel={(e) => {
          e.preventDefault();
          hide();
        }}
        onClick={(e) => e.target === e.currentTarget && hide()}
        aria-label={`${p.name} workflow`}
        className="project-dialog card m-auto max-h-[calc(100svh-2rem)] w-[min(58rem,calc(100vw-2rem))] max-w-none overflow-y-auto border-0 p-0 text-foreground backdrop:bg-black/40 backdrop:backdrop-blur-sm"
      >
        <div className="p-6 sm:p-9">
          <div className="rise flex items-start justify-between gap-4 [animation-delay:120ms]">
            <div>
              {p.role && <Label>{p.role}</Label>}
              <h3 className="mt-1.5 text-3xl font-semibold tracking-[-0.035em] text-heading sm:text-4xl">{p.name}</h3>
            </div>
            <button
              type="button"
              onClick={hide}
              aria-label="Close"
              className="pill grid h-10 w-10 shrink-0 place-items-center text-lg text-foreground-muted transition-transform duration-300 hover:rotate-90 hover:text-heading"
            >
              ×
            </button>
          </div>

          {open && p.diagram && (
            <div className="rise mt-6 [animation-delay:200ms]">
              <Diagram n={n} data={p.diagram} highlight={flow[step] ?? null} animate={false} />
            </div>
          )}

          {flow.length > 0 && (
            <div className="rise mt-2 [animation-delay:280ms]">
              <div className="flex items-center justify-between gap-3">
                <Label>
                  Workflow · step {step + 1} of {flow.length}
                </Label>
                <div className="flex gap-1.5 font-mono text-xs">
                  <button type="button" onClick={() => go(step - 1)} aria-label="Previous step" className="pill h-8 w-8">
                    ←
                  </button>
                  <button
                    type="button"
                    onClick={() => setPlaying((x) => !x)}
                    className="pill h-8 px-3 text-foreground-muted hover:text-heading"
                  >
                    {playing ? "pause" : "play"}
                  </button>
                  <button type="button" onClick={() => go(step + 1)} aria-label="Next step" className="pill h-8 w-8">
                    →
                  </button>
                </div>
              </div>
              <ol className="mt-3 flex flex-wrap items-center gap-x-1.5 gap-y-2 font-mono text-xs">
                {flow.map((id, k) => (
                  <li key={`${id}-${k}`} className="flex items-center gap-1.5">
                    {k > 0 && (
                      <span aria-hidden className="text-foreground-subtle">
                        {via(k) ? `—${via(k)}→` : "→"}
                      </span>
                    )}
                    <button
                      type="button"
                      onClick={() => go(k)}
                      aria-current={k === step ? "step" : undefined}
                      className={`rounded-full px-3 py-1.5 transition-all duration-500 ${
                        k === step
                          ? "scale-105 bg-accent text-background shadow-[0_6px_16px_-6px_var(--accent)]"
                          : "bg-[var(--inset)] text-foreground-muted hover:text-heading"
                      }`}
                    >
                      {label(id)}
                    </button>
                  </li>
                ))}
              </ol>
            </div>
          )}

          <div className="rise [animation-delay:360ms]">
            <p className="mt-8 text-pretty text-[1.02rem] leading-relaxed text-foreground-muted">{p.blurb}</p>

            {p.highlights && (
              <ul className="mt-5 flex flex-col gap-2.5">
                {p.highlights.map((h) => (
                  <li key={h} className="flex gap-3 text-pretty text-[0.95rem] text-foreground-muted">
                    <span aria-hidden className="select-none text-accent-text">
                      —
                    </span>
                    <span>{h}</span>
                  </li>
                ))}
              </ul>
            )}

            <ul className="mt-6 flex flex-wrap gap-1.5">
              {p.stack.map((s) => (
                <li key={s} className="rounded-full bg-[var(--inset)] px-2.5 py-1 font-mono text-[0.66rem] text-foreground-muted">
                  {s}
                </li>
              ))}
            </ul>
            <div className="mt-6 flex flex-wrap gap-2">
              <a href={p.repo} target="_blank" rel="noreferrer" className="rounded-full bg-heading px-5 py-2.5 text-sm font-medium text-background">
                Source ↗
              </a>
              {p.demo && (
                <a href={p.demo} target="_blank" rel="noreferrer" className="pill px-5 py-2.5 text-sm font-medium text-heading">
                  Demo ↗
                </a>
              )}
            </div>
          </div>
        </div>
      </dialog>
    </div>
  );
}
