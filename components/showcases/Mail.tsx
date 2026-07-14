"use client";

import { useEffect, useState } from "react";

/**
 * AuraMail showcase — the extraction pipeline.
 *
 * Mirrors what the project actually does: pull a placement email from Gmail,
 * summarize it with GPT-4 Mini, pull out the structured fields, and push the
 * deadline to Calendar — streamed over SSE, so the fields land one at a time.
 *
 * The email is invented for the illustration, not from anyone's inbox.
 */

const FIELDS = [
  { key: "company", value: "Rubrik" },
  { key: "role", value: "SDE Intern" },
  { key: "deadline", value: "18 Jul, 11:59pm" },
  { key: "ctc", value: "₹1.2L / mo" },
];

// 0 = idle, 1 = syncing, then one beat per field, then calendar.
const TOTAL = FIELDS.length + 3;
const BEAT_MS = 850;

export function Mail() {
  const [beat, setBeat] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setBeat((b) => (b + 1) % TOTAL), BEAT_MS);
    return () => clearInterval(id);
  }, []);

  const synced = beat >= 1;
  const revealed = Math.max(0, Math.min(FIELDS.length, beat - 1));
  const calendared = beat >= FIELDS.length + 2;

  return (
    <div className="flex h-full flex-col justify-center gap-3 p-5 font-mono">
      {/* the incoming mail */}
      <div className="rounded-md border border-border bg-surface px-3 py-2">
        <div className="flex items-baseline justify-between gap-2">
          <span className="truncate text-[0.6rem] text-heading">
            Placement Drive — Rubrik
          </span>
          <span className="shrink-0 text-[0.5rem] text-foreground-subtle">
            {synced ? "gmail ✓" : "syncing…"}
          </span>
        </div>
        <p className="mt-0.5 truncate text-[0.52rem] text-foreground-subtle">
          Applications close 18 July. Eligibility: 7.0 CGPA and above…
        </p>
      </div>

      {/* the stream */}
      <div className="flex items-center gap-1.5 text-[0.52rem] text-foreground-subtle">
        <span className="flex gap-[2px]">
          {[0, 1, 2].map((i) => (
            <span
              key={i}
              className="h-1 w-1 rounded-full bg-accent transition-opacity duration-300"
              style={{ opacity: revealed < FIELDS.length && (beat + i) % 3 === 0 ? 1 : 0.25 }}
            />
          ))}
        </span>
        <span>{revealed < FIELDS.length ? "gpt-4 mini · streaming" : "extracted"}</span>
        <span className="ml-auto">sse</span>
      </div>

      {/* the fields it pulls out */}
      <div className="flex flex-col gap-1">
        {FIELDS.map((f, i) => {
          const on = i < revealed;
          return (
            <div
              key={f.key}
              className="flex items-baseline justify-between gap-2 text-[0.58rem] transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]"
              style={{ opacity: on ? 1 : 0.2, transform: on ? "none" : "translateY(2px)" }}
            >
              <span className="text-foreground-subtle">{f.key}</span>
              <span className={on ? "text-heading" : "text-foreground-subtle"}>
                {on ? f.value : "—"}
              </span>
            </div>
          );
        })}
      </div>

      {/* calendar push */}
      <div
        className="flex items-center gap-1.5 rounded border border-border px-2 py-1 text-[0.52rem] transition-all duration-500"
        style={{ opacity: calendared ? 1 : 0.2 }}
      >
        <svg viewBox="0 0 24 24" className="h-2.5 w-2.5 text-accent" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden>
          <rect x="3" y="5" width="18" height="16" rx="2" />
          <path d="M3 10h18M8 3v4M16 3v4" />
        </svg>
        <span className="text-foreground-muted">
          {calendared ? "deadline added to calendar" : "calendar"}
        </span>
      </div>
    </div>
  );
}
