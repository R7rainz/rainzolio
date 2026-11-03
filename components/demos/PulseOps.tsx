"use client";

import { useState } from "react";
import { useInterval, useTimers, type DemoProps } from "@/components/demos/hooks";

/**
 * PulseOps, small: three monitors checked every tick. "Take down" makes one
 * fail; after the grace threshold (2 failed checks) an incident opens and the
 * alert channels fire in turn. "Recover" lets checks pass again and the
 * incident resolves with its duration. Ticks only while on screen.
 */

const TICK = 700;
const GRACE = 2;
const SAMPLES = 28;
const CHANNELS = ["email", "Slack", "Discord", "webhook"];
const MONITORS = [
  { name: "api.acme.dev", kind: "HTTP", base: 42 },
  { name: "worker-heartbeat", kind: "HEARTBEAT", base: 18 },
  { name: "postgres-primary", kind: "TCP", base: 7 },
];

// Status colours are literal: red/green carry meaning, not theme.
const UP = "#30a46c";
const DOWN = "#e5484d";

type Mon = { samples: (number | null)[]; broken: boolean; fails: number; ok: number; total: number };
type Incident = { id: number; monitor: string; opened: number; resolved: number | null; alerted: number };

const seed = (): Mon[] =>
  MONITORS.map((m) => ({
    samples: Array.from({ length: SAMPLES }, (_, i) => m.base * (0.85 + 0.3 * Math.abs(Math.sin(i * 1.7 + m.base)))),
    broken: false,
    fails: 0,
    ok: 999,
    total: 1000,
  }));

export function PulseOps({ live }: DemoProps) {
  const t = useTimers();
  const [mons, setMons] = useState<Mon[]>(seed);
  const [tick, setTick] = useState(0);
  const [incidents, setIncidents] = useState<Incident[]>([]);

  const open = (i: number, at: number) => {
    const id = 12 + incidents.length;
    setIncidents((list) => [{ id, monitor: MONITORS[i].name, opened: at, resolved: null, alerted: 0 }, ...list]);
    CHANNELS.forEach((_, k) =>
      t.later(260 * (k + 1), () => setIncidents((list) => list.map((x) => (x.id === id ? { ...x, alerted: k + 1 } : x)))),
    );
  };
  const resolve = (i: number, at: number) =>
    setIncidents((list) => list.map((x) => (x.monitor === MONITORS[i].name && x.resolved === null ? { ...x, resolved: at } : x)));

  useInterval(
    () => {
      const next = tick + 1;
      const checked = mons.map((m, i) => {
        const base = MONITORS[i].base;
        const v = m.broken ? null : base * (0.8 + Math.random() * 0.45) * (Math.random() < 0.06 ? 2.2 : 1);
        return { ...m, samples: [...m.samples.slice(1), v], fails: v === null ? m.fails + 1 : 0, ok: m.ok + (v === null ? 0 : 1), total: m.total + 1 };
      });
      // Side effects stay out of state updaters (StrictMode runs those twice).
      checked.forEach((m, i) => {
        if (m.fails === GRACE) open(i, next);
        if (m.fails === 0 && mons[i].fails >= GRACE) resolve(i, next);
      });
      setTick(next);
      setMons(checked);
    },
    live ? TICK : null,
  );

  const toggle = (i: number) => setMons((ms) => ms.map((m, k) => (k === i ? { ...m, broken: !m.broken } : m)));
  const current = incidents[0];

  return (
    <div className="p-4 sm:p-6">
      <ul className="flex flex-col gap-2">
        {mons.map((m, i) => {
          const last = m.samples[m.samples.length - 1];
          const down = m.fails > 0;
          return (
            <li key={MONITORS[i].name} className="grid items-center gap-x-4 gap-y-2 rounded-xl bg-[var(--inset)] px-4 py-3 sm:grid-cols-[11rem_minmax(0,1fr)_auto]">
              <div className="flex items-center gap-2.5">
                <span className="h-2 w-2 shrink-0 rounded-full" style={{ background: down ? DOWN : UP }} />
                <div className="min-w-0">
                  <p className="truncate font-mono text-xs text-heading">{MONITORS[i].name}</p>
                  <p className="font-mono text-[0.6rem] uppercase tracking-wider text-foreground-subtle">{MONITORS[i].kind}</p>
                </div>
              </div>
              <div aria-hidden className="flex h-8 items-end gap-[2px]">
                {m.samples.map((v, k) => (
                  <span
                    key={k}
                    className="flex-1 rounded-[1px] transition-[height] duration-300"
                    style={{
                      height: v === null ? "100%" : `${Math.max(12, Math.min(100, (v / (MONITORS[i].base * 2.4)) * 100))}%`,
                      background: v === null ? DOWN : "var(--foreground-subtle)",
                      opacity: v === null ? 0.7 : 0.45,
                    }}
                  />
                ))}
              </div>
              <div className="flex items-center justify-between gap-4 sm:justify-end">
                <span className="w-24 font-mono text-[0.7rem] tabular-nums text-foreground-muted">
                  {last === null ? "timeout" : `${Math.round(last)}ms`} · {((m.ok / m.total) * 100).toFixed(2)}%
                </span>
                <button
                  type="button"
                  onClick={() => toggle(i)}
                  className={`w-24 rounded-full px-3 py-1.5 text-xs font-medium ${m.broken ? "bg-heading text-background" : "pill text-heading"}`}
                >
                  {m.broken ? "Recover" : "Take down"}
                </button>
              </div>
            </li>
          );
        })}
      </ul>

      <div aria-live="polite" className="well mt-4 min-h-28 p-4">
        {!current ? (
          <p className="font-mono text-xs text-foreground-subtle">
            All systems operational · 0 open incidents · checks every {TICK / 1000}s, incident after {GRACE} failures
          </p>
        ) : (
          <div key={current.id} className="rise">
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <p className="text-sm font-medium text-heading">
                INC-{current.id} · {current.monitor} {current.resolved === null ? "is unreachable" : "recovered"}
              </p>
              <span className="font-mono text-[0.68rem] text-foreground-subtle">
                {current.resolved === null
                  ? `open for ${(((tick - current.opened + GRACE) * TICK) / 1000).toFixed(1)}s`
                  : `resolved · down for ${(((current.resolved - current.opened + GRACE) * TICK) / 1000).toFixed(1)}s`}
              </span>
            </div>
            <div className="mt-3 flex flex-wrap gap-1.5">
              {CHANNELS.map((c, k) => (
                <span
                  key={c}
                  className={`rounded-full px-2.5 py-1 font-mono text-[0.66rem] transition-colors duration-300 ${
                    k < current.alerted ? "bg-heading text-background" : "bg-background text-foreground-subtle"
                  }`}
                >
                  {k < current.alerted ? "✓ " : ""}
                  {c}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
