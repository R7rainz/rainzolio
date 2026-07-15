import { getTypingStats } from "@/lib/monkeytype";

/** Server component — Monkeytype is hit at build/ISR time, never from the browser. */
export async function TypingStats() {
  const t = await getTypingStats();
  // Rate-limited, offline, or the profile went private: show nothing.
  if (!t) return null;

  const peak = Math.max(...t.bests.map((b) => b.wpm));

  return (
    <section id="typing" className="border-t border-border py-16">
      <div className="flex flex-wrap items-baseline justify-between gap-3">
        <h2 className="font-mono text-[0.7rem] uppercase tracking-[0.25em] text-foreground-subtle">
          Typing
        </h2>
        <a
          href={t.profileUrl}
          target="_blank"
          rel="noreferrer"
          className="group relative font-mono text-[0.72rem] text-foreground hover:text-accent-text"
        >
          monkeytype
          <span className="absolute -bottom-0.5 left-0 h-px w-0 bg-accent transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:w-full" />
        </a>
      </div>

      <div className="mt-8 grid gap-8 sm:grid-cols-[auto_1fr] sm:gap-12">
        {/* Headline: the 60s test is Monkeytype's benchmark. */}
        {t.sixty && (
          <div className="flex flex-col">
            <div className="flex items-baseline gap-1.5">
              <span className="font-mono text-4xl font-semibold tabular-nums text-accent-text">
                {t.sixty.wpm}
              </span>
              <span className="font-mono text-sm text-foreground-muted">wpm</span>
            </div>
            <span className="mt-1 font-mono text-[0.65rem] uppercase tracking-[0.15em] text-foreground-subtle">
              60s · {t.sixty.acc}% acc
            </span>
          </div>
        )}

        {/* Personal bests per duration, scaled against the fastest. */}
        <div className="flex flex-col justify-center gap-2">
          {t.bests.map((b) => (
            <div key={b.seconds} className="flex items-center gap-3">
              <span className="w-8 shrink-0 text-right font-mono text-[0.65rem] tabular-nums text-foreground-subtle">
                {b.seconds}s
              </span>
              <span className="h-1.5 flex-1 overflow-hidden rounded-full bg-border/60">
                <span
                  className="block h-full rounded-full"
                  style={{
                    width: `${(b.wpm / peak) * 100}%`,
                    backgroundColor: b.seconds === 60 ? "var(--accent)" : "var(--contrib-2)",
                  }}
                />
              </span>
              <span className="w-16 shrink-0 font-mono text-[0.65rem] tabular-nums text-foreground-muted">
                {b.wpm} wpm
              </span>
            </div>
          ))}
        </div>
      </div>

      <p className="mt-7 font-mono text-[0.68rem] leading-relaxed text-foreground-subtle">
        {t.tests.toLocaleString()} tests · {t.hours}h typing
        {t.rank && (
          <>
            {" · ranked "}
            <span className="text-foreground-muted">
              #{t.rank.place.toLocaleString()}
            </span>
            {` of ${t.rank.of.toLocaleString()} all-time (${t.rank.seconds}s english)`}
          </>
        )}
      </p>
    </section>
  );
}
