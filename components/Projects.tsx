import { Showcase } from "@/components/Showcase";
import profile from "@/data/profile.json";
import { getGithubStats } from "@/lib/github";

/**
 * Projects with a `live` key in profile.json get a working demo in the
 * Showcase (stats feed the GitHub Banners demo; it copes with null). Everything
 * else is a numbered "More work" list.
 */
export async function Projects() {
  const stats = await getGithubStats();
  const featured = profile.projects.filter((p) => p.live);
  const rest = profile.projects.filter((p) => !p.live);

  return (
    <>
      <Showcase projects={featured} stats={stats} />

      {rest.length > 0 && (
        <div className="mt-24">
          <h3 className="text-2xl font-semibold tracking-[-0.03em] text-heading">More work</h3>
          <ol className="mt-6 border-t border-border">
            {rest.map((p, i) => (
              <li key={p.name} className="reveal border-b border-border">
                <a
                  href={p.repo}
                  target="_blank"
                  rel="noreferrer"
                  className="group grid items-baseline gap-x-8 gap-y-1 py-6 sm:grid-cols-[3rem_minmax(0,1fr)_minmax(0,1.2fr)]"
                >
                  <span className="font-mono text-xs text-foreground-subtle">{String(i + 1).padStart(2, "0")}</span>
                  <span className="text-xl font-medium tracking-[-0.02em] text-heading transition-colors duration-300 group-hover:text-accent-text">
                    {p.name} <span aria-hidden className="text-base text-foreground-subtle">↗</span>
                  </span>
                  <span className="text-pretty text-sm leading-relaxed text-foreground-muted">
                    {p.blurb}
                    <span className="mt-1 block font-mono text-[0.68rem] text-foreground-subtle">
                      {p.stack.join(" · ")}
                    </span>
                  </span>
                </a>
              </li>
            ))}
          </ol>
        </div>
      )}
    </>
  );
}
