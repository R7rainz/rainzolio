"use client";

import { useEffect, useState } from "react";

/**
 * PulseOps showcase — a monitor doing its job.
 *
 * Backend projects have no UI to screenshot, so this stands in: checks tick
 * along, one endpoint degrades into an incident and recovers. The shape is
 * real (HTTP + heartbeat checks, latency, incidents); the numbers are a
 * simulation, which the caption says out loud.
 */

const CHECKS = [
  { name: "api.pulseops.dev", kind: "HTTP", base: 42 },
  { name: "worker-heartbeat", kind: "PING", base: 18 },
  { name: "postgres-primary", kind: "TCP", base: 7 },
];

const BARS = 26;
// The middle check dips into an incident and comes back.
const INCIDENT_FROM = 16;
const INCIDENT_TO = 20;

function latency(base: number, i: number, row: number, tick: number) {
  // Deterministic pseudo-noise — no Math.random, so SSR and client agree.
  const n = Math.sin((i + tick) * 1.7 + row * 3.1) * 0.5 + Math.cos((i + tick) * 0.9) * 0.3;
  const down = row === 0 && i >= INCIDENT_FROM && i < INCIDENT_TO;
  return down ? base * 4.2 + n * 12 : base + n * base * 0.45;
}

export function Pulse() {
  const [tick, setTick] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setTick((t) => t + 1), 1400);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="flex h-full flex-col justify-center gap-4 p-5 font-mono">
      {CHECKS.map((check, row) => {
        const bars = Array.from({ length: BARS }, (_, i) => latency(check.base, i, row, tick));
        const down = row === 0;
        const worst = Math.max(...bars);

        return (
          <div key={check.name}>
            <div className="flex items-baseline justify-between gap-2">
              <span className="flex items-center gap-1.5 text-[0.62rem] text-foreground">
                <span
                  className={`h-1.5 w-1.5 rounded-full ${down ? "bg-accent" : "bg-emerald-500"}`}
                />
                {check.name}
              </span>
              <span className="text-[0.55rem] text-foreground-subtle">
                {check.kind} · {Math.round(bars[BARS - 1])}ms
              </span>
            </div>

            <div className="mt-1.5 flex h-7 items-end gap-[2px]">
              {bars.map((v, i) => {
                const incident = row === 0 && i >= INCIDENT_FROM && i < INCIDENT_TO;
                return (
                  <span
                    key={i}
                    className="flex-1 rounded-[1px] transition-[height,background-color] duration-700 ease-[cubic-bezier(0.22,1,0.36,1)]"
                    style={{
                      height: `${Math.max(8, (v / worst) * 100)}%`,
                      backgroundColor: incident ? "var(--accent)" : "var(--border-strong)",
                      opacity: incident ? 1 : 0.75,
                    }}
                  />
                );
              })}
            </div>
          </div>
        );
      })}

      <p className="text-[0.55rem] text-foreground-subtle">
        <span className="text-accent-text">incident</span> · api.pulseops.dev · resolved in 4m
      </p>
    </div>
  );
}
