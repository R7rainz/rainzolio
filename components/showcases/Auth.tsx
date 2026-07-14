"use client";

import { useEffect, useState } from "react";

/**
 * TaskFlow showcase — the auth handshake.
 *
 * A TOTP code counts down and rolls over on a 30s window (the period RFC 6238
 * uses), while the login steps advance beside it. Digits come from a tick
 * counter, not a real secret — this illustrates the flow, it is not a working
 * authenticator. The counter also keeps it deterministic: reading Date.now()
 * during render would differ between server and client and break hydration.
 */

const STEPS = [
  { label: "POST /auth/login", note: "email + password" },
  { label: "verify argon2 hash", note: "ok" },
  { label: "challenge TOTP", note: "6 digits" },
  { label: "issue JWT", note: "15m access · 7d refresh" },
];

const PERIOD = 30; // seconds — the TOTP window
// Offsets the window counter off zero: counter 0 hashes to 000000, which would
// sit there looking broken for the first 30 seconds.
const SEED = 8731;

// Deterministic digits from the window counter, so SSR and client agree.
function codeFor(counter: number) {
  let h = (counter + SEED) * 2654435761;
  h ^= h >>> 13;
  h = Math.abs(h);
  return String(h % 1_000_000).padStart(6, "0");
}

export function Auth() {
  const [tick, setTick] = useState(0);
  const [step, setStep] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setTick((t) => t + 1), 1000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    const id = setInterval(() => setStep((s) => (s + 1) % (STEPS.length + 1)), 1000);
    return () => clearInterval(id);
  }, []);

  const counter = Math.floor(tick / PERIOD);
  const remaining = PERIOD - (tick % PERIOD);
  const code = codeFor(counter);

  return (
    <div className="flex h-full flex-col justify-center gap-4 p-5 font-mono">
      {/* steps — stacked above the code so nothing has to wrap */}
      <div className="flex flex-col gap-1">
        {STEPS.map((s, i) => {
          const done = step > i;
          const active = step === i;
          return (
            <div
              key={s.label}
              className="flex items-baseline justify-between gap-3 whitespace-nowrap text-[0.58rem] transition-opacity duration-500"
              style={{ opacity: done || active ? 1 : 0.28 }}
            >
              <span className={active ? "text-accent-text" : "text-foreground-muted"}>
                {done ? "✓" : active ? "›" : " "} {s.label}
              </span>
              <span className="text-foreground-subtle">{s.note}</span>
            </div>
          );
        })}
      </div>

      {/* the rolling code */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex gap-[3px]">
          {code.split("").map((d, i) => (
            <span
              key={i}
              className="grid h-7 w-5 place-items-center rounded border border-border bg-surface text-[0.7rem] font-semibold tabular-nums text-heading"
            >
              {d}
            </span>
          ))}
        </div>

        {/* countdown ring */}
        <div className="flex items-center gap-1.5">
          <svg viewBox="0 0 24 24" className="h-3.5 w-3.5 -rotate-90" aria-hidden>
            <circle cx="12" cy="12" r="9" fill="none" stroke="var(--border)" strokeWidth="3" />
            <circle
              cx="12"
              cy="12"
              r="9"
              fill="none"
              stroke="var(--accent)"
              strokeWidth="3"
              strokeLinecap="round"
              strokeDasharray={2 * Math.PI * 9}
              strokeDashoffset={2 * Math.PI * 9 * (1 - remaining / PERIOD)}
              className="transition-[stroke-dashoffset] duration-1000 ease-linear"
            />
          </svg>
          <span className="text-[0.55rem] tabular-nums text-foreground-subtle">{remaining}s</span>
        </div>
      </div>
    </div>
  );
}
