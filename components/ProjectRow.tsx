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
      className="group relative block border-b border-border py-5 transition-colors duration-500 hover:border-border-strong focus:outline-none focus-visible:border-accent"
    >
      {/* Red rail wipes in from the left, matching the featured cards. */}
      <span
        aria-hidden
        className="pointer-events-none absolute bottom-0 left-0 h-px w-0 bg-accent transition-all duration-500 ease-calm group-hover:w-full group-focus-visible:w-full"
      />

      <div className="flex items-baseline justify-between gap-4">
        <span className="flex items-center gap-2 text-base font-medium text-heading transition-colors duration-300 group-hover:text-accent-text group-focus-visible:text-accent-text">
          <span className="h-1.5 w-1.5 rounded-full bg-accent opacity-40 transition-opacity duration-500 group-hover:opacity-100 group-focus-visible:opacity-100" />
          {name}
        </span>
        <span className="hidden shrink-0 font-mono text-[0.6rem] text-foreground-subtle transition-colors duration-500 group-hover:text-foreground-muted sm:block">
          {stack.slice(0, 3).join(" · ")}
        </span>
      </div>

      <div
        className="grid grid-rows-[1fr] opacity-100 transition-[grid-template-rows,opacity] duration-500 ease-calm sm:grid-rows-[0fr] sm:opacity-0 sm:group-hover:grid-rows-[1fr] sm:group-hover:opacity-100 sm:group-focus-visible:grid-rows-[1fr] sm:group-focus-visible:opacity-100"
      >
        <div className="overflow-hidden">
          <div className="flex items-start gap-5 pt-3">
            <div className="flex-1">
              <p className="text-pretty text-sm leading-6 text-foreground-muted">
                {blurb}
              </p>
              <div className="mt-3 flex flex-wrap gap-x-3 gap-y-1.5">
                {stack.map((s) => (
                  <span key={s} className="font-mono text-[0.58rem] text-foreground-subtle">
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
