"use client";

import { useRef, useState } from "react";

/**
 * A one-line typing race against Ronak's best. The text is lines from the
 * projects on this page. A visually hidden input takes the keystrokes (so
 * mobile keyboards and screen readers work) and the line renders per character:
 * typed right, typed wrong, still to come.
 */

const LINES = [
  "Go for the workers, Node for the APIs, and Postgres underneath it all.",
  "Kafka is at-least-once, so the consumer dedups before it touches state.",
  "The server never streams audio; it stores an anchor and every client does the math.",
];

type Result = { wpm: number; acc: number };

/** Net wpm: correct characters / 5 per minute. */
function score(text: string, typed: string, ms: number): Result {
  let correct = 0;
  for (let i = 0; i < typed.length; i++) if (typed[i] === text[i]) correct++;
  const minutes = Math.max(ms, 1000) / 60000;
  return { wpm: Math.round(correct / 5 / minutes), acc: Math.round((correct / text.length) * 100) };
}

export function TypingRace({ best }: { best: number }) {
  const [line, setLine] = useState(0);
  const [typed, setTyped] = useState("");
  const [start, setStart] = useState<number | null>(null);
  const [result, setResult] = useState<Result | null>(null);
  const input = useRef<HTMLInputElement>(null);
  const text = LINES[line];

  const onType = (value: string) => {
    if (result) return;
    const t = performance.now();
    if (start === null) setStart(t);
    const next = value.slice(0, text.length);
    setTyped(next);
    if (next.length === text.length) setResult(score(text, next, t - (start ?? t)));
  };

  const again = () => {
    setLine((l) => (l + 1) % LINES.length);
    setTyped("");
    setStart(null);
    setResult(null);
    input.current?.focus();
  };

  return (
    <div
      className="cursor-text self-start rounded-2xl border border-border bg-background/60 p-4 transition-colors duration-300 focus-within:border-accent/60"
      onClick={() => input.current?.focus()}
    >
      <div className="flex flex-wrap items-center justify-between gap-2 font-mono text-[0.68rem] text-foreground-subtle">
        <span>race me · {best} wpm</span>
        <span aria-live="polite">
          {result ? (
            <>
              you: <span className="text-heading">{result.wpm} wpm</span> · {result.acc}% ·{" "}
              {result.wpm >= best ? "you win, respect" : `${best - result.wpm} wpm to go`}
            </>
          ) : start !== null ? (
            "typing…"
          ) : (
            "click here and start typing"
          )}
        </span>
      </div>

      <p aria-hidden className="mt-3 font-mono text-[0.92rem] leading-relaxed">
        {[...text].map((ch, i) => (
          <span
            key={i}
            className={
              i < typed.length
                ? typed[i] === ch
                  ? "text-heading"
                  : "rounded-sm bg-accent-subtle text-accent-text"
                : i === typed.length && !result
                  ? "border-l-2 border-accent text-foreground-subtle"
                  : "text-foreground-subtle"
            }
          >
            {ch}
          </span>
        ))}
      </p>

      <input
        ref={input}
        value={typed}
        onChange={(e) => onType(e.target.value)}
        aria-label={`Typing race. Type this line: ${text}`}
        autoComplete="off"
        autoCorrect="off"
        autoCapitalize="off"
        spellCheck={false}
        className="sr-only"
      />

      {result && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            again();
          }}
          className="link mt-3 font-mono text-xs"
        >
          again ↻
        </button>
      )}
    </div>
  );
}
