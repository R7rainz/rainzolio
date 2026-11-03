import { Label } from "@/components/Heading";
import { Siu } from "@/components/Siu";
import { TypingRace } from "@/components/TypingRace";
import profile from "@/data/profile.json";
import { getTypingStats, type TypingStats } from "@/lib/monkeytype";

/**
 * Beyond code, as a grid of cards. Typing is live from Monkeytype (with the
 * race beside it) and drops out if the API does; the first fact card runs wide
 * so the three-column grid always closes its rows.
 */
export async function Beyond() {
  const typing = await getTypingStats();

  return (
    <div className="mt-14 grid gap-5 lg:grid-cols-3">
      {typing && <Typing t={typing} />}
      {profile.beyond.map((b, i) => (
        <article key={b.label} className={`card reveal flex flex-col p-6 sm:p-7 ${i === 0 ? "lg:col-span-2" : ""}`}>
          <Label>{b.label}</Label>
          <h3 className="mt-1.5 text-xl font-semibold tracking-[-0.02em] text-heading">{b.value}</h3>
          {b.detail && <p className="mt-2 text-pretty text-[0.95rem] leading-relaxed text-foreground-muted">{b.detail}</p>}
          {b.meta && <p className="mt-3 font-mono text-[0.7rem] text-foreground-subtle">{b.meta}</p>}
          {b.label === "Football" && (
            <div className="mt-auto pt-4">
              <Siu />
            </div>
          )}
          {b.href && (
            <a href={b.href} target="_blank" rel="noreferrer" className="mt-auto pt-5 text-sm font-medium text-heading hover:text-accent-text">
              Source →
            </a>
          )}
        </article>
      ))}
    </div>
  );
}

function Typing({ t }: { t: TypingStats }) {
  const peak = Math.max(...t.bests.map((b) => b.wpm));
  const top = t.rank ? (t.rank.place / t.rank.of) * 100 : null;

  return (
    <article className="card reveal grid gap-8 p-6 sm:p-7 lg:col-span-3 lg:grid-cols-2">
      <div>
        <Label>Typing</Label>
        <h3 className="mt-1.5 text-xl font-semibold tracking-[-0.02em] text-heading">
          {peak} wpm peak{t.sixty && `, ${t.sixty.wpm} over 60s`}
        </h3>

        <div className="mt-5 flex flex-col gap-2">
          {t.bests.map((b) => (
            <div key={b.seconds} className="flex items-center gap-3 font-mono text-[0.7rem] tabular-nums">
              <span className="w-8 text-right text-foreground-subtle">{b.seconds}s</span>
              <span className="h-1.5 flex-1 rounded-full bg-border">
                <span
                  className="bar block h-full rounded-full"
                  style={{
                    width: `${(b.wpm / peak) * 100}%`,
                    backgroundColor: b.wpm === peak ? "var(--accent)" : "var(--foreground-subtle)",
                  }}
                />
              </span>
              <span className="w-24 text-foreground-muted">
                {b.wpm} wpm · {b.acc}%
              </span>
            </div>
          ))}
        </div>

        <p className="mt-4 font-mono text-[0.7rem] leading-relaxed text-foreground-subtle">
          {t.tests.toLocaleString()} tests · {t.hours}h typed
          {t.rank && top !== null && (
            <>
              {" · "}#{t.rank.place.toLocaleString()} of {t.rank.of.toLocaleString()} all-time (
              {t.rank.seconds}s english, top {top < 1 ? top.toFixed(1) : Math.round(top)}%)
            </>
          )}
        </p>
        <a href={t.profileUrl} target="_blank" rel="noreferrer" className="mt-4 inline-block text-sm font-medium text-heading hover:text-accent-text">
          Monkeytype →
        </a>
      </div>

      <TypingRace best={peak} />
    </article>
  );
}
