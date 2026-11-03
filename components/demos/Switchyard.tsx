"use client";

import { useState } from "react";
import { useTimers } from "@/components/demos/hooks";

/**
 * Switchyard, small: pick a prompt, Draft turns it into steps, Run executes
 * them one by one with timings and a streaming log. "Flaky Slack" makes the
 * last step fail once and retry with backoff, like the real engine's retries.
 */

type Step = { kind: string; label: string; ms: number };
const FLOWS: { prompt: string; steps: Step[] }[] = [
  {
    prompt: "When a PR opens, summarize it and post to Slack",
    steps: [
      { kind: "trigger", label: "github.pull_request", ms: 40 },
      { kind: "ai", label: "llm.summarize", ms: 820 },
      { kind: "action", label: "slack.post", ms: 210 },
    ],
  },
  {
    prompt: "Every morning, find failing builds and open an issue",
    steps: [
      { kind: "trigger", label: "schedule · 09:00", ms: 10 },
      { kind: "action", label: "http.get /builds", ms: 340 },
      { kind: "logic", label: "filter status = failed", ms: 5 },
      { kind: "action", label: "github.issue.create", ms: 260 },
    ],
  },
  {
    prompt: "On a signed webhook, classify it and route it",
    steps: [
      { kind: "trigger", label: "webhook · signed", ms: 12 },
      { kind: "ai", label: "llm.classify", ms: 640 },
      { kind: "logic", label: "switch priority", ms: 3 },
      { kind: "action", label: "discord.send", ms: 190 },
    ],
  },
];

type Status = "idle" | "run" | "retry" | "ok";

export function Switchyard() {
  const t = useTimers();
  const [flow, setFlow] = useState(0);
  const [drafted, setDrafted] = useState(0);
  const [status, setStatus] = useState<Status[]>([]);
  const [log, setLog] = useState<string[]>([]);
  const [flaky, setFlaky] = useState(false);
  const [busy, setBusy] = useState(false);
  const steps = FLOWS[flow].steps;

  const pick = (i: number) => {
    t.clear();
    setFlow(i);
    setDrafted(0);
    setStatus([]);
    setLog([]);
    setBusy(false);
  };

  const draft = () => {
    pick(flow);
    setBusy(true);
    setLog(["draft · prompt → graph"]);
    steps.forEach((s, i) =>
      t.later(300 * (i + 1), () => {
        setDrafted(i + 1);
        setLog((l) => [...l, `+ node ${s.label}`]);
        if (i === steps.length - 1) {
          setLog((l) => [...l, "graph valid · ready to run"]);
          setBusy(false);
        }
      }),
    );
  };

  const run = () => {
    setBusy(true);
    setStatus(steps.map(() => "idle"));
    setLog((l) => [...l, "run #42 · started"]);
    const mark = (i: number, s: Status) => setStatus((st) => st.map((x, k) => (k === i ? s : x)));
    let at = 200;
    steps.forEach((s, i) => {
      const last = i === steps.length - 1;
      t.later(at, () => mark(i, "run"));
      at += Math.max(350, s.ms);
      if (last && flaky) {
        t.later(at, () => {
          mark(i, "retry");
          setLog((l) => [...l, `${s.label} · 503 · retry in 400ms`]);
        });
        at += 700;
        t.later(at - 300, () => mark(i, "run"));
      }
      t.later(at, () => {
        mark(i, "ok");
        setLog((l) => [...l, `${s.label} · ok · ${s.ms}ms`]);
        if (last) {
          setLog((l) => [...l, "run #42 · succeeded"]);
          setBusy(false);
        }
      });
      at += 150;
    });
  };

  return (
    <div className="grid gap-4 p-4 sm:p-6 md:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)]">
      <div>
        <div className="flex flex-wrap gap-2">
          {FLOWS.map((f, i) => (
            <button
              key={f.prompt}
              type="button"
              onClick={() => pick(i)}
              className={`rounded-full px-3 py-1.5 text-left text-xs transition-colors duration-300 ${
                i === flow ? "bg-heading text-background" : "bg-[var(--inset)] text-foreground-muted hover:text-heading"
              }`}
            >
              {f.prompt}
            </button>
          ))}
        </div>

        <ol className="mt-5 flex flex-col">
          {steps.slice(0, drafted).map((s, i) => (
            <li key={s.label} className="rise flex flex-col">
              {i > 0 && <span aria-hidden className="ml-5 h-4 w-px bg-border-strong" />}
              <div
                className={`flex items-center gap-3 rounded-xl px-3 py-2.5 transition-colors duration-300 ${
                  status[i] === "run" ? "bg-accent-subtle" : "bg-[var(--inset)]"
                }`}
              >
                <span className="w-14 shrink-0 font-mono text-[0.62rem] uppercase tracking-wider text-foreground-subtle">
                  {s.kind}
                </span>
                <span className="min-w-0 flex-1 truncate font-mono text-xs text-heading">{s.label}</span>
                <span className="shrink-0 font-mono text-[0.68rem]">
                  {status[i] === "run" && <span className="inline-block h-2 w-2 animate-pulse rounded-full bg-accent" />}
                  {status[i] === "retry" && <span className="text-accent-text">↻ 503</span>}
                  {status[i] === "ok" && <span className="text-foreground-muted">✓ {s.ms}ms</span>}
                </span>
              </div>
            </li>
          ))}
          {drafted === 0 && (
            <li className="well px-4 py-6 text-center text-sm text-foreground-subtle">
              Draft turns the prompt into a graph you can edit.
            </li>
          )}
        </ol>

        <div className="mt-5 flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={draft}
            disabled={busy}
            className="rounded-full bg-heading px-4 py-2 text-xs font-medium text-background disabled:opacity-40"
          >
            Draft workflow
          </button>
          <button
            type="button"
            onClick={run}
            disabled={busy || drafted < steps.length}
            className="pill px-4 py-2 text-xs font-medium text-heading disabled:opacity-40"
          >
            Run ▸
          </button>
          <label className="ml-auto flex cursor-pointer items-center gap-2 font-mono text-[0.68rem] text-foreground-subtle">
            <input type="checkbox" checked={flaky} onChange={(e) => setFlaky(e.target.checked)} className="accent-[var(--accent)]" />
            flaky last step
          </label>
        </div>
      </div>

      <div className="well flex min-h-56 flex-col p-4">
        <p className="font-mono text-[0.62rem] uppercase tracking-wider text-foreground-subtle">logs · websocket</p>
        <ul aria-live="polite" className="mt-3 flex flex-col gap-1 font-mono text-[0.72rem] text-foreground-muted">
          {log.map((line, i) => (
            <li key={i} className="rise">
              <span className="text-foreground-subtle">{String(i).padStart(2, "0")} </span>
              {line}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
