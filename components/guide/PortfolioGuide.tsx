"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import guide from "@/data/guide.json";
import { Cat, type Action, type Costume } from "./Cat";

type View = { costume: Costume; action: Action; line: string };

const HIDE_KEY = "rainz-guide-hidden";
const FOCUS_RATIO = 0.45; // the screen line that counts as "you're reading this"
const WALK_MS = 850; // how long the stroll to a new spot takes
const FAST_MS = 1200; // section changes closer than this count as "fast scrolling"
const TIMELINE_STEP_MS = 2000; // life-cycle auto-advance cadence

// Horizontal lanes (% from left) the cat strolls between, kept clear of the
// edges so the speech bubble never clips.
const LANES = [26, 54, 34, 62, 30, 48];

const STEPS = guide.steps as { id: string; costume: Costume; action: Action; line: string }[];
const TIMELINE = guide.timeline as View[];

export function PortfolioGuide() {
  const [mounted, setMounted] = useState(false);
  const [hidden, setHidden] = useState(true);
  const [view, setView] = useState<View>({
    costume: STEPS[0].costume,
    action: STEPS[0].action,
    line: guide.intro,
  });
  const [walking, setWalking] = useState(false);
  const [lane, setLane] = useState(LANES[0]);
  const [activeId, setActiveId] = useState<string | null>(null);

  const laneIdx = useRef(0);
  const lastChangeAt = useRef(0);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);
  const timelineInt = useRef<ReturnType<typeof setInterval> | null>(null);

  const clearTimers = () => {
    timers.current.forEach(clearTimeout);
    timers.current = [];
    if (timelineInt.current) {
      clearInterval(timelineInt.current);
      timelineInt.current = null;
    }
  };

  // Which configured section is nearest the focus line.
  const recompute = useCallback(() => {
    const focusY = window.innerHeight * FOCUS_RATIO;
    let bestId: string | null = null;
    let bestDist = Infinity;
    for (const s of STEPS) {
      const el = document.getElementById(s.id);
      if (!el) continue;
      const r = el.getBoundingClientRect();
      if (r.bottom < 0 || r.top > window.innerHeight) continue;
      const dist = Math.abs(r.top + r.height / 2 - focusY);
      if (dist < bestDist) {
        bestDist = dist;
        bestId = s.id;
      }
    }
    if (bestId) setActiveId((prev) => (prev === bestId ? prev : bestId));
  }, []);

  // React to a section change: stroll to a new lane, and either narrate the
  // section, throw a "you're fast!" line, or kick off the timeline auto-play.
  useEffect(() => {
    if (!activeId) return;
    const step = STEPS.find((s) => s.id === activeId);
    if (!step) return;

    clearTimers();

    // stroll to the next lane
    laneIdx.current = (laneIdx.current + 1) % LANES.length;
    setLane(LANES[laneIdx.current]);
    setWalking(true);
    timers.current.push(setTimeout(() => setWalking(false), WALK_MS));

    const now = Date.now();
    const fast = now - lastChangeAt.current < FAST_MS;
    lastChangeAt.current = now;

    if (activeId === "timeline") {
      // Auto-advance the life cycle on its own — no scrolling required.
      let i = 0;
      const play = () => setView(TIMELINE[i]);
      play();
      timelineInt.current = setInterval(() => {
        i += 1;
        if (i >= TIMELINE.length) {
          if (timelineInt.current) clearInterval(timelineInt.current);
          timelineInt.current = null;
          return; // hold on the final "fourth year" stage
        }
        play();
      }, TIMELINE_STEP_MS);
      return clearTimers;
    }

    if (fast) {
      const quip = guide.reactions[Math.floor(Math.random() * guide.reactions.length)];
      setView({ costume: step.costume, action: "idle", line: quip });
      // then settle into the real line, if we're still on this section
      timers.current.push(
        setTimeout(() => setView({ costume: step.costume, action: step.action, line: step.line }), 1700),
      );
    } else {
      setView({ costume: step.costume, action: step.action, line: step.line });
    }

    return clearTimers;
  }, [activeId]);

  useEffect(() => {
    let ticking = false;
    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        recompute();
        ticking = false;
      });
    };
    const raf = requestAnimationFrame(() => {
      setHidden(localStorage.getItem(HIDE_KEY) === "1");
      setMounted(true);
      recompute();
    });
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      clearTimers();
    };
  }, [recompute]);

  const dismiss = () => {
    setHidden(true);
    localStorage.setItem(HIDE_KEY, "1");
  };
  const reveal = () => {
    setHidden(false);
    localStorage.removeItem(HIDE_KEY);
  };

  if (!mounted) return null;

  if (hidden) {
    return (
      <button
        onClick={reveal}
        aria-label="Bring back Momo the guide"
        className="fixed bottom-4 left-4 z-50 grid h-12 w-12 place-items-center rounded-full border border-border bg-surface-raised/90 shadow-lg backdrop-blur transition-colors duration-500 hover:border-accent/50"
      >
        <Cat costume="dev" action="idle" className="h-9 w-9" />
      </button>
    );
  }

  return (
    // Full-width strip pinned to the bottom; the cat rides along it. pointer-events
    // are off so it walks *over* the content without blocking clicks — only the
    // dismiss button re-enables them.
    <div className="pointer-events-none fixed inset-x-0 bottom-0 z-50 h-0">
      <div
        className="absolute bottom-2 flex flex-col items-center transition-[left] ease-[cubic-bezier(0.34,1.2,0.64,1)]"
        style={{ left: `${lane}%`, transform: "translateX(-50%)", transitionDuration: `${WALK_MS}ms` }}
      >
        {/* speech bubble — re-keyed on the line so it re-pops each time she speaks */}
        <div
          key={view.line}
          className="pointer-events-auto relative mb-1 max-w-[min(76vw,300px)] rounded-2xl rounded-b-sm border border-border bg-surface-raised/95 px-3.5 py-2.5 shadow-xl backdrop-blur"
          style={{ animation: "guide-bubble-in 400ms cubic-bezier(0.22,1,0.36,1) both" }}
        >
          <p className="text-pretty text-center text-[0.8rem] leading-snug text-foreground">{view.line}</p>
          <button
            onClick={dismiss}
            aria-label="Hide Momo"
            className="absolute -right-2 -top-2 grid h-5 w-5 place-items-center rounded-full border border-border bg-surface text-foreground-subtle transition-colors duration-300 hover:border-accent/50 hover:text-accent-text"
          >
            <svg viewBox="0 0 24 24" className="h-3 w-3" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden>
              <path d="M6 6l12 12M18 6L6 18" strokeLinecap="round" />
            </svg>
          </button>
          {/* tail of the bubble */}
          <span className="absolute -bottom-1.5 left-1/2 h-3 w-3 -translate-x-1/2 rotate-45 border-b border-r border-border bg-surface-raised/95" />
        </div>

        {/* the cat, flipped to face travel */}
        <Cat
          costume={view.costume}
          action={view.action}
          walking={walking}
          className="h-20 w-[4.5rem] sm:h-24 sm:w-20"
        />
      </div>
    </div>
  );
}
