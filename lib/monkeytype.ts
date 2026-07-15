import "server-only";
import profile from "@/data/profile.json";

/**
 * Monkeytype stats, fetched server-side.
 *
 * The public profile endpoint needs no auth. Same approach as lib/github.ts:
 * fetch at build/ISR time and render with our own tokens rather than embedding
 * someone else's badge.
 */

const USER = profile.monkeytype.username;
const REVALIDATE = 60 * 60 * 24; // 1 day

export type Pb = { seconds: number; wpm: number; acc: number };

export type TypingStats = {
  /** Personal bests across the standard time tests, ascending by duration. */
  bests: Pb[];
  /** Monkeytype's headline benchmark. */
  sixty: Pb | null;
  tests: number;
  hours: number;
  /** Best all-time leaderboard placing, across the ranked durations. */
  rank: { seconds: number; place: number; of: number } | null;
  profileUrl: string;
};

type Entry = { wpm?: number; acc?: number };
type ApiProfile = {
  message?: string;
  data?: {
    personalBests?: { time?: Record<string, Entry[]> };
    typingStats?: { completedTests?: number; timeTyping?: number };
    allTimeLbs?: { time?: Record<string, Record<string, { rank?: number; count?: number }>> };
  };
};

/** Monkeytype stores every PB for a duration; the personal best is the fastest. */
function fastest(entries: Entry[] | undefined): Entry | null {
  if (!entries?.length) return null;
  return entries.reduce((a, b) => ((b.wpm ?? 0) > (a.wpm ?? 0) ? b : a));
}

export async function getTypingStats(): Promise<TypingStats | null> {
  const profileUrl = `https://monkeytype.com/profile/${USER}`;

  try {
    const res = await fetch(
      `https://api.monkeytype.com/users/${encodeURIComponent(USER)}/profile?isUid=false`,
      { headers: { "User-Agent": "rainzolio-portfolio" }, next: { revalidate: REVALIDATE } },
    );
    if (!res.ok) return null;

    const json: ApiProfile = await res.json();
    const d = json.data;
    if (!d) return null;

    const bests: Pb[] = [15, 30, 60, 120]
      .map((seconds) => {
        const best = fastest(d.personalBests?.time?.[String(seconds)]);
        if (!best?.wpm) return null;
        return { seconds, wpm: Math.round(best.wpm), acc: Math.round(best.acc ?? 0) };
      })
      .filter((x): x is Pb => x !== null);

    if (!bests.length) return null;

    // Only some durations are ranked; take the best placing by percentile.
    let rank: TypingStats["rank"] = null;
    for (const [seconds, langs] of Object.entries(d.allTimeLbs?.time ?? {})) {
      const en = langs?.english;
      if (!en?.rank || !en.count) continue;
      const candidate = { seconds: Number(seconds), place: en.rank, of: en.count };
      if (!rank || candidate.place / candidate.of < rank.place / rank.of) rank = candidate;
    }

    return {
      bests,
      sixty: bests.find((b) => b.seconds === 60) ?? null,
      tests: d.typingStats?.completedTests ?? 0,
      hours: Math.round((d.typingStats?.timeTyping ?? 0) / 3600),
      rank,
      profileUrl,
    };
  } catch {
    // Offline build or the API moved — the section hides itself.
    return null;
  }
}
