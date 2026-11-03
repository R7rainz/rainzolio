"use client";

import { useState } from "react";
import { useInterval, useTimers, type DemoProps } from "@/components/demos/hooks";

/**
 * SongSpot, small: one room, three listeners. The server only keeps an anchor
 * (position + when it was set); play, pause and seek publish a new anchor that
 * reaches each listener after their network lag, and each works out "now" from
 * it. The offset readout shows the clock-offset correction settling to ~0.
 */

const LEN = 214; // seconds
const LISTENERS = [
  { name: "you", lag: 0, err: 0 },
  { name: "ana", lag: 240, err: 96 },
  { name: "kabir", lag: 410, err: 141 },
];

type Anchor = { pos: number; at: number; playing: boolean };
type Seen = { anchor: Anchor; synced: number };

const clock = (s: number) => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, "0")}`;
const position = (a: Anchor, now: number) => Math.min(LEN, Math.max(0, a.playing ? a.pos + (now - a.at) / 1000 : a.pos));

export function SongSpot({ live }: DemoProps) {
  const t = useTimers();
  // No Date.now() during render: SSR and hydration must agree, so time starts at 0.
  const [now, setNow] = useState(0);
  const [server, setServer] = useState<Anchor>({ pos: 37, at: 0, playing: false });
  const [seen, setSeen] = useState<Seen[]>(LISTENERS.map(() => ({ anchor: { pos: 37, at: 0, playing: false }, synced: -1e9 })));

  // Ticks whenever on screen, so offsets keep settling while paused too.
  useInterval(() => setNow(Date.now()), live ? 200 : null);

  const publish = (anchor: Anchor) => {
    const at = anchor.at;
    setServer(anchor);
    setNow(at);
    LISTENERS.forEach((l, i) => {
      const deliver = () => setSeen((list) => list.map((s, k) => (k === i ? { anchor, synced: Date.now() } : s)));
      if (l.lag) t.later(l.lag, deliver);
      else deliver();
    });
  };

  const toggle = () => {
    const at = Date.now();
    publish({ pos: position(server, at), at, playing: !server.playing });
  };
  const seek = (pos: number) => publish({ pos, at: Date.now(), playing: server.playing });

  return (
    <div className="p-4 sm:p-6">
      <div className="flex flex-wrap items-center gap-3">
        <span className="rounded-full bg-[var(--inset)] px-3 py-1.5 font-mono text-xs text-heading">room K4M9TQ</span>
        <span className="text-sm text-foreground-muted">Rain on Glass · demo track</span>
        <button
          type="button"
          onClick={toggle}
          className="ml-auto rounded-full bg-heading px-4 py-2 text-xs font-medium text-background"
        >
          {server.playing ? "Pause for everyone" : "Play for everyone"}
        </button>
      </div>

      <ul className="mt-5 flex flex-col gap-2">
        {LISTENERS.map((l, i) => {
          const s = seen[i];
          const pos = position(s.anchor, now);
          const pending = s.anchor !== server;
          const residual = l.err * Math.exp(-Math.max(0, now - s.synced) / 600);
          return (
            <li key={l.name} className="grid grid-cols-[2rem_minmax(0,1fr)] items-center gap-x-3 rounded-xl bg-[var(--inset)] px-3 py-3">
              <span className="grid h-8 w-8 place-items-center rounded-full bg-background font-mono text-xs uppercase text-heading">
                {l.name[0]}
              </span>
              <div className="min-w-0">
                <div className="flex items-baseline justify-between gap-3 font-mono text-[0.68rem]">
                  <span className="text-heading">{l.name}</span>
                  <span className="tabular-nums text-foreground-subtle">
                    {clock(pos)} / {clock(LEN)} ·{" "}
                    {pending ? <span className="text-accent-text">syncing…</span> : `±${Math.round(residual)}ms`}
                  </span>
                </div>
                {i === 0 ? (
                  <input
                    type="range"
                    min={0}
                    max={LEN}
                    step={1}
                    value={Math.round(pos)}
                    onChange={(e) => seek(Number(e.target.value))}
                    aria-label="Seek for everyone"
                    className="mt-2 w-full accent-[var(--accent)]"
                  />
                ) : (
                  <span className="mt-2 block h-1.5 rounded-full bg-background">
                    <span
                      className="block h-full rounded-full bg-foreground-subtle transition-[width] duration-200"
                      style={{ width: `${(pos / LEN) * 100}%` }}
                    />
                  </span>
                )}
              </div>
            </li>
          );
        })}
      </ul>

      <p className="mt-4 font-mono text-[0.66rem] leading-relaxed text-foreground-subtle">
        server keeps only {"{"} pos: {clock(server.pos)}, at, playing: {String(server.playing)} {"}"}. Each client adds
        its measured clock offset, so lag and skew don&apos;t matter. Drag your bar or press play.
      </p>
    </div>
  );
}
