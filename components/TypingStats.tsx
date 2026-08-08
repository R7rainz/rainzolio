import { TypingMonkey } from "@/components/TypingMonkey";
import { getTypingStats } from "@/lib/monkeytype";

/** Server component — Monkeytype is hit at build/ISR time, never from the browser. */
export async function TypingStats() {
  const t = await getTypingStats();
  // Rate-limited, offline, or the profile went private: show nothing.
  if (!t) return null;

  const peak = Math.max(...t.bests.map((b) => b.wpm));

  return (
    <section id="typing" className="reveal-section scroll-mt-20 border-t border-border py-16 sm:py-20">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="section-index">05 / By the numbers</p>
          <h2 className="mt-3 text-2xl font-semibold tracking-[-0.035em] text-heading sm:text-3xl">
            Fast hands. Careful code.
          </h2>
        </div>
        <a
          href={t.profileUrl}
          target="_blank"
          rel="noreferrer"
          className="font-mono text-[0.66rem] text-foreground-subtle hover:text-heading"
        >
          Monkeytype profile ↗
        </a>
      </div>

      <div className="mt-8 grid gap-8 rounded-2xl border border-border bg-surface/55 p-6 sm:grid-cols-[auto_1fr] sm:gap-12">
        {/* Headline: the 60s test is Monkeytype's benchmark. */}
        {t.sixty && (
          <div className="flex flex-col">
            <div className="flex items-baseline gap-1.5">
              <span className="font-mono text-5xl font-semibold tabular-nums tracking-[-0.06em] text-accent-text">
                {t.sixty.wpm}
              </span>
              <span className="font-mono text-sm text-foreground-muted">wpm</span>
            </div>
            <span className="mt-1 font-mono text-[0.65rem] uppercase tracking-[0.15em] text-foreground-subtle">
              60s · {t.sixty.acc}% acc
            </span>
            <TypingMonkey className="mt-5 h-12 w-20" />
          </div>
        )}

        {/* Personal bests per duration, scaled against the fastest. */}
        <div className="flex flex-col justify-center gap-2">
          {t.bests.map((b, i) => (
            <div key={b.seconds} className="flex items-center gap-3">
              <span className="w-8 shrink-0 text-right font-mono text-[0.65rem] tabular-nums text-foreground-subtle">
                {b.seconds}s
              </span>
              <span className="h-1.5 flex-1 overflow-hidden rounded-full bg-border/60">
                <span
                  className="wpm-bar block h-full rounded-full"
                  style={{
                    width: `${(b.wpm / peak) * 100}%`,
                    backgroundColor: b.seconds === 60 ? "var(--accent)" : "var(--contrib-2)",
                    animationDelay: `${i * 90}ms`,
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

      <p className="mt-5 font-mono text-[0.64rem] leading-relaxed text-foreground-subtle">
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
