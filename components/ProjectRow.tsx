"use client";

import { useState } from "react";
import { MiniArt } from "@/components/MiniArt";

/**
 * A secondary project: at rest it's one quiet line. Hover (or keyboard focus)
 * expands it into the full blurb, stack, and its illustration.
 *
 * The reveal uses the grid-rows 0fr -> 1fr trick so it animates to the content's
 * real height — `height: auto` isn't animatable, and a max-height guess either
 * clips long text or eases at the wrong speed.
 */
export function ProjectRow({
  name,
  blurb,
  stack,
  repo,
  art,
}: {
  name: string;
  blurb: string;
  stack: string[];
  repo: string;
  art: string | null;
}) {
  const [open, setOpen] = useState(false);

  return (
    <a
      href={repo}
      target="_blank"
      rel="noreferrer"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
      onFocus={() => setOpen(true)}
      onBlur={() => setOpen(false)}
      className="group relative block border-b border-border py-4 transition-colors duration-500 hover:border-accent/50 focus:outline-none focus-visible:border-accent"
    >
      {/* Red rail wipes in from the left, matching the featured cards. */}
      <span
        aria-hidden
        className="pointer-events-none absolute bottom-0 left-0 h-px w-0 bg-accent transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:w-full group-focus-visible:w-full"
      />

      <div className="flex items-baseline justify-between gap-4">
        <span className="flex items-center gap-2 text-[0.95rem] font-medium text-heading transition-colors duration-300 group-hover:text-accent-text group-focus-visible:text-accent-text">
          <span className="h-1 w-1 rounded-full bg-accent opacity-0 transition-opacity duration-500 group-hover:opacity-100 group-focus-visible:opacity-100" />
          {name}
        </span>
        <span className="shrink-0 font-mono text-[0.62rem] text-foreground-subtle transition-colors duration-500 group-hover:text-foreground-muted">
          {stack.slice(0, 3).join(" · ")}
        </span>
      </div>

      <div
        className="grid transition-[grid-template-rows,opacity] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]"
        style={{ gridTemplateRows: open ? "1fr" : "0fr", opacity: open ? 1 : 0 }}
      >
        <div className="overflow-hidden">
          <div className="flex items-start gap-5 pt-3">
            <div className="flex-1">
              <p className="text-pretty text-[0.85rem] leading-relaxed text-foreground-muted">
                {blurb}
              </p>
              <div className="mt-2.5 flex flex-wrap gap-1.5">
                {stack.map((s) => (
                  <span
                    key={s}
                    className="rounded border border-border px-1.5 py-0.5 font-mono text-[0.6rem] text-foreground-muted"
                  >
                    {s}
                  </span>
                ))}
              </div>
            </div>

            {art && (
              <div className="hidden h-12 w-20 shrink-0 sm:block">
                <MiniArt name={art} active={open} />
              </div>
            )}
          </div>
        </div>
      </div>
    </a>
  );
}
