import "server-only";
import profile from "@/data/profile.json";

/**
 * GitHub data, fetched server-side.
 *
 * Deliberately not github-readme-stats or a similar embedded SVG: those are an
 * external image request on every page view, can't be themed to match, and go
 * down with the upstream service. This hits the APIs at build/ISR time and
 * renders with our own tokens instead.
 *
 * Unauthenticated REST is 60 req/hour per IP, so everything is cached for a
 * day. Set GITHUB_TOKEN to raise that to 5000/hour if it ever matters.
 */

const USER = profile.github.username;
const REVALIDATE = 60 * 60 * 24; // 1 day

export type GithubStats = {
  repos: number;
  followers: number;
  stars: number;
  topLanguages: string[];
};

export type ContributionDay = { date: string; count: number; level: 0 | 1 | 2 | 3 | 4 };
export type Contributions = { total: number; days: ContributionDay[] };

type ApiUser = { public_repos: number; followers: number; message?: string };
type ApiRepo = { language: string | null; stargazers_count: number; fork: boolean };

function headers(): HeadersInit {
  const h: Record<string, string> = {
    Accept: "application/vnd.github+json",
    // GitHub rejects requests without one.
    "User-Agent": "rainzolio-portfolio",
  };
  if (process.env.GITHUB_TOKEN) h.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;
  return h;
}

export async function getGithubStats(): Promise<GithubStats | null> {
  try {
    const [userRes, repoRes] = await Promise.all([
      fetch(`https://api.github.com/users/${USER}`, {
        headers: headers(),
        next: { revalidate: REVALIDATE },
      }),
      fetch(`https://api.github.com/users/${USER}/repos?per_page=100&sort=pushed`, {
        headers: headers(),
        next: { revalidate: REVALIDATE },
      }),
    ]);
    if (!userRes.ok || !repoRes.ok) return null;

    const user: ApiUser = await userRes.json();
    const repos: ApiRepo[] = await repoRes.json();
    if (!Array.isArray(repos) || user.message) return null;

    const own = repos.filter((r) => !r.fork);
    const counts = new Map<string, number>();
    for (const r of own) {
      if (r.language) counts.set(r.language, (counts.get(r.language) ?? 0) + 1);
    }

    return {
      repos: user.public_repos,
      followers: user.followers,
      stars: own.reduce((sum, r) => sum + r.stargazers_count, 0),
      topLanguages: [...counts.entries()]
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([lang]) => lang),
    };
  } catch {
    return null;
  }
}

/**
 * The contribution calendar.
 *
 * GitHub's REST API doesn't expose contributions at all — the only official
 * source is the GraphQL API, which requires a token. This uses a public proxy
 * so the site works with no secrets configured; if it ever disappears, the
 * section hides itself rather than breaking the page.
 */
export async function getContributions(): Promise<Contributions | null> {
  try {
    const res = await fetch(`https://github-contributions-api.jogruber.de/v4/${USER}?y=last`, {
      next: { revalidate: REVALIDATE },
    });
    if (!res.ok) return null;

    const json: {
      total?: Record<string, number>;
      contributions?: ContributionDay[];
      error?: string;
    } = await res.json();
    if (json.error || !Array.isArray(json.contributions)) return null;

    const total = json.total?.lastYear ?? Object.values(json.total ?? {})[0] ?? 0;
    return { total, days: json.contributions };
  } catch {
    return null;
  }
}
