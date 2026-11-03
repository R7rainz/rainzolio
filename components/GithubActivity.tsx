import { Label } from "@/components/Heading";
import { getContributions, getGithubStats } from "@/lib/github";

/** Server component — GitHub is hit at build/ISR time, never from the browser. */
export async function GithubActivity() {
  const [stats, contrib] = await Promise.all([getGithubStats(), getContributions()]);
  if (!stats && !contrib) return null;

  return (
    <div className="card reveal mt-5 p-6 sm:p-8">
      <Label>On GitHub</Label>

      {stats && (
        <dl className="mt-4 flex flex-wrap gap-x-12 gap-y-4">
          <Stat value={stats.repos} label="repos" />
          <Stat value={stats.stars} label="stars" />
          <Stat value={stats.followers} label="followers" />
          {contrib && <Stat value={contrib.total} label="contributions, last year" />}
        </dl>
      )}

      {contrib && <Calendar days={contrib.days} />}

      {stats && stats.topLanguages.length > 0 && (
        <p className="mt-4 font-mono text-xs text-foreground-subtle">
          mostly {stats.topLanguages.join(" · ")}
        </p>
      )}
    </div>
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

  // One SVG with a viewBox rather than a grid of divs: a year is ~53 columns
  // and would overflow at fixed cell sizes; the viewBox scales to fit instead.
  const width = weeks.length * STEP - GAP;
  const height = 7 * STEP - GAP;

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      className="mt-6 h-auto w-full"
      role="img"
      aria-label="GitHub contribution calendar for the last year"
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
  );
}

function Stat({ value, label }: { value: number; label: string }) {
  return (
    <div className="flex flex-col-reverse">
      <dt className="font-mono text-[0.68rem] text-foreground-subtle">{label}</dt>
      <dd className="text-3xl font-semibold tabular-nums tracking-[-0.03em] text-heading">{value.toLocaleString()}</dd>
    </div>
  );
}
