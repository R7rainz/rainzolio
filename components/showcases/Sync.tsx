"use client";

import { useEffect, useState } from "react";

/**
 * SongSpot showcase — the room clock.
 *
 * The server never streams audio; it stores a playhead anchor and every client
 * resolves its own position from it, so three browsers land on the same second
 * of the same song. Here the playhead advances a second per tick, and after
 * each seek the listeners' offsets converge back toward zero.
 *
 * Everything derives from a tick counter rather than Date.now(): reading the
 * clock during render would disagree between server and client and break
 * hydration.
 */

const DURATION = 243; // 4:03, the track being simulated
const SEEK_EVERY = 14; // ticks between simulated seeks
const LISTENERS = ["you", "ana", "kabir"];

// The events that aren't a seek, cycled between seeks.
const IDLE_EVENTS = ["queue.vote", "player.play", "room.join", "queue.add"];

function mmss(total: number) {
  return `${Math.floor(total / 60)}:${String(total % 60).padStart(2, "0")}`;
}

// Deterministic sub-frame jitter per listener, so SSR and client agree.
function jitter(i: number, tick: number) {
  let h = (tick * 31 + i * 7919) * 2654435761;
  h ^= h >>> 12;
  return Math.abs(h) % 17;
}

export function Sync() {
  const [tick, setTick] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setTick((t) => t + 1), 1000);
    return () => clearInterval(id);
  }, []);

  // Each stretch between seeks starts somewhere new, then plays forward a
  // second a tick.
  const leg = Math.floor(tick / SEEK_EVERY);
  const sinceSeek = tick % SEEK_EVERY;
  const position = ((leg * 6151 + 96) % (DURATION - 40)) + sinceSeek;
  const pct = (position / DURATION) * 100;

  const seeking = sinceSeek < 2;
  const event = seeking ? "player.seek" : IDLE_EVENTS[leg % IDLE_EVENTS.length];

  // A seek knocks everyone out of alignment; the anchor pulls them back in.
  const spike = Math.max(0, 3 - sinceSeek);

  return (
    <div className="flex h-full flex-col justify-center gap-3 p-5 font-mono">
      {/* room header */}
      <div className="flex items-baseline justify-between gap-3 text-[0.58rem]">
        <span className="flex items-baseline gap-1.5">
          <span className="text-foreground-subtle">room</span>
          <span className="tracking-[0.18em] text-heading">X7K2QD</span>
        </span>
        <span className="text-foreground-subtle">3 in sync</span>
      </div>

      {/* now playing */}
      <div>
        <div className="flex items-baseline justify-between gap-3 whitespace-nowrap text-[0.62rem]">
          <span className="truncate text-heading">▸ Midnight City</span>
          <span className="shrink-0 tabular-nums text-foreground-subtle">
            {mmss(position)} / {mmss(DURATION)}
          </span>
        </div>

        {/* the shared playhead — one bar, every client resolves to it */}
        <div className="relative mt-2 h-1 rounded-full bg-border">
          <div
            className="absolute inset-y-0 left-0 rounded-full bg-accent transition-[width] duration-1000 ease-linear"
            style={{ width: `${pct}%` }}
          />
          <span
            className="absolute top-1/2 h-2 w-2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-accent transition-[left] duration-1000 ease-linear"
            style={{ left: `${pct}%` }}
          />
        </div>
      </div>

      {/* per-listener offset from the server anchor */}
      <div className="flex flex-col gap-1">
        {LISTENERS.map((name, i) => {
          const offset = jitter(i, tick) + spike * spike * 18;
          const adrift = offset > 40;
          return (
            <div
              key={name}
              className="flex items-baseline justify-between gap-3 whitespace-nowrap text-[0.58rem]"
            >
              <span className="flex items-center gap-1.5 text-foreground-muted">
                <span
                  className="h-1 w-1 rounded-full bg-accent transition-opacity duration-500"
                  style={{ opacity: adrift ? 0.3 : 1 }}
                />
                {name}
              </span>
              <span
                className={`tabular-nums transition-colors duration-500 ${
                  adrift ? "text-accent-text" : "text-foreground-subtle"
                }`}
              >
                ±{offset}ms
              </span>
            </div>
          );
        })}
      </div>

      {/* the socket doing the fan-out */}
      <div className="flex items-baseline gap-1.5 text-[0.55rem]">
        <span className="text-foreground-subtle">ws</span>
        <span className={seeking ? "text-accent-text" : "text-foreground-muted"}>▸ {event}</span>
      </div>
    </div>
  );
}
