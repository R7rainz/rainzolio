import { getContributions, getGithubStats } from "@/lib/github";

/** Server component — GitHub is hit at build/ISR time, never from the browser. */
export async function GithubActivity() {
  const [stats, contrib] = await Promise.all([getGithubStats(), getContributions()]);
  if (!stats && !contrib) return null;

  return (
    <section id="github" className="reveal-section scroll-mt-20 border-t border-border py-16 sm:py-20">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="section-index">04 / Open source</p>
          <h2 className="mt-3 text-2xl font-semibold tracking-[-0.035em] text-heading sm:text-3xl">
            Built in public.
          </h2>
        </div>
        <a
          href="https://github.com/R7rainz"
          target="_blank"
          rel="noreferrer"
          className="w-fit font-mono text-[0.66rem] text-foreground-subtle hover:text-heading"
        >
          @R7rainz ↗
        </a>
      </div>

      {stats && (
        <div className="mt-10 grid grid-cols-2 overflow-hidden rounded-2xl border border-border bg-surface/55 sm:grid-cols-4">
          <Stat value={stats.repos} label="repos" />
          <Stat value={stats.stars} label="stars" />
          <Stat value={stats.followers} label="followers" />
          {contrib && <Stat value={contrib.total} label="contributions this year" />}
        </div>
      )}

      {contrib && <Calendar days={contrib.days} />}

      {stats && stats.topLanguages.length > 0 && (
        <div className="mt-6 flex flex-wrap gap-2">
          {stats.topLanguages.map((lang) => (
            <span
              key={lang}
              className="rounded-full border border-border px-3 py-1 font-mono text-[0.62rem] text-foreground-muted"
            >
              {lang}
            </span>
          ))}
        </div>
      )}
    </section>
  );
}

const CELL = 11;
const GAP = 3;
const STEP = CELL + GAP;

function Calendar({ days }: { days: { date: string; count: number; level: number }[] }) {
  // The API returns a flat list of days; GitHub's grid is columns of weeks with
  // Sunday at the top, so pad the first column to line the weekdays up.
  const first = new Date(days[0].date).getUTCDay();
  const cells: ({ date: string; count: number; level: number } | null)[] = [
    ...Array(first).fill(null),
    ...days,
  ];

  const weeks: (typeof cells)[] = [];
  for (let i = 0; i < cells.length; i += 7) weeks.push(cells.slice(i, i + 7));

  // Drawn as one SVG with a viewBox rather than a flex grid of divs: a year is
  // ~53 columns and always overflows the column at fixed cell sizes. The
  // viewBox scales the whole calendar to the available width instead, so it
  // never needs a horizontal scrollbar.
  const width = weeks.length * STEP - GAP;
  const height = 7 * STEP - GAP;

  return (
    <div className="mt-6 rounded-2xl border border-border bg-surface/40 p-4 sm:p-6">
      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="h-auto w-full"
        role="img"
        aria-label={`GitHub contribution calendar for the last year`}
      >
        {weeks.map((week, w) =>
          week.map((day, d) =>
            day ? (
              <rect
                key={day.date}
                className="contrib-cell"
                x={w * STEP}
                y={d * STEP}
                width={CELL}
                height={CELL}
                rx="2"
                fill={`var(--contrib-${day.level})`}
                // Staggered by column so the year sweeps in left to right
                // (~640ms end to end) instead of appearing all at once.
                style={{ animationDelay: `${w * 12}ms` }}
              >
                <title>{`${day.count} contribution${day.count === 1 ? "" : "s"} on ${day.date}`}</title>
              </rect>
            ) : null,
          ),
        )}
      </svg>

      <div className="mt-4 flex items-center gap-2 font-mono text-[0.6rem] text-foreground-subtle">
        <span>less</span>
        {[0, 1, 2, 3, 4].map((l) => (
          <span
            key={l}
            className="h-[11px] w-[11px] rounded-[2px]"
            style={{ backgroundColor: `var(--contrib-${l})` }}
          />
        ))}
        <span>more</span>
      </div>
    </div>
  );
}

function Stat({ value, label }: { value: number; label: string }) {
  return (
    <div className="flex flex-col border-b border-r border-border p-5 even:border-r-0 sm:border-b-0 sm:even:border-r sm:last:border-r-0 sm:p-6">
      <span className="font-mono text-2xl font-semibold tabular-nums tracking-tight text-heading sm:text-3xl">
        {value.toLocaleString()}
      </span>
      <span className="mt-2 font-mono text-[0.58rem] uppercase tracking-[0.14em] text-foreground-subtle">
        {label}
      </span>
    </div>
  );
}
