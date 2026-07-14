import { getContributions, getGithubStats } from "@/lib/github";

/** Server component — GitHub is hit at build/ISR time, never from the browser. */
export async function GithubActivity() {
  const [stats, contrib] = await Promise.all([getGithubStats(), getContributions()]);
  if (!stats && !contrib) return null;

  return (
    <section id="github" className="border-t border-border py-16">
      <SectionHeading>GitHub</SectionHeading>

      {stats && (
        <div className="mt-8 flex flex-wrap items-baseline gap-x-10 gap-y-5">
          <Stat value={stats.repos} label="repos" />
          <Stat value={stats.stars} label="stars" />
          <Stat value={stats.followers} label="followers" />
          {contrib && <Stat value={contrib.total} label="contributions this year" />}
        </div>
      )}

      {contrib && <Calendar days={contrib.days} />}

      {stats && stats.topLanguages.length > 0 && (
        <div className="mt-7 flex flex-wrap gap-1.5">
          {stats.topLanguages.map((lang) => (
            <span
              key={lang}
              className="rounded-full border border-border px-2.5 py-0.5 font-mono text-[0.7rem] text-foreground-muted"
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
    <div className="mt-8">
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
                x={w * STEP}
                y={d * STEP}
                width={CELL}
                height={CELL}
                rx="2"
                fill={`var(--contrib-${day.level})`}
              >
                <title>{`${day.count} contribution${day.count === 1 ? "" : "s"} on ${day.date}`}</title>
              </rect>
            ) : null,
          ),
        )}
      </svg>

      <div className="mt-3 flex items-center gap-2 font-mono text-[0.65rem] text-foreground-subtle">
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
    <div className="flex flex-col">
      <span className="font-mono text-2xl font-semibold tabular-nums text-heading">
        {value.toLocaleString()}
      </span>
      <span className="mt-1 font-mono text-[0.65rem] uppercase tracking-[0.15em] text-foreground-subtle">
        {label}
      </span>
    </div>
  );
}

function SectionHeading({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="font-mono text-[0.7rem] uppercase tracking-[0.25em] text-foreground-subtle">
      {children}
    </h2>
  );
}
