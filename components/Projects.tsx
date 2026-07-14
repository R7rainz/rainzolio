import { ProjectRow } from "@/components/ProjectRow";
import { Showcase } from "@/components/Showcase";
import profile from "@/data/profile.json";
import { getGithubStats } from "@/lib/github";

type Project = (typeof profile.projects)[number];

export async function Projects() {
  // Real numbers for the banners showcase, which renders Ronak's own stats.
  const stats = await getGithubStats();
  const repos = stats?.repos ?? 0;
  const stars = stats?.stars ?? 0;

  const featured = profile.projects.filter((p) => p.featured);
  const rest = profile.projects.filter((p) => !p.featured);

  return (
    <section id="projects" className="border-t border-border py-16">
      <h2 className="font-mono text-[0.7rem] uppercase tracking-[0.25em] text-foreground-subtle">
        Projects
      </h2>

      <div className="mt-8 flex flex-col gap-5">
        {featured.map((p) => (
          <Card key={p.name} project={p} repos={repos} stars={stars} />
        ))}
      </div>

      {rest.length > 0 && (
        <>
          <h3 className="mt-14 font-mono text-[0.7rem] uppercase tracking-[0.25em] text-foreground-subtle">
            Also
          </h3>
          {/* At rest these are one line each; hovering opens the full blurb,
              stack, and illustration. */}
          <ul className="mt-6 flex flex-col">
            {rest.map((p) => (
              <li key={p.name}>
                <ProjectRow
                  name={p.name}
                  blurb={p.blurb}
                  stack={p.stack}
                  repo={p.repo}
                  art={p.art ?? null}
                />
              </li>
            ))}
          </ul>
        </>
      )}
    </section>
  );
}

function Card({ project: p, repos, stars }: { project: Project; repos: number; stars: number }) {
  const hasShowcase = Boolean(p.showcase);

  return (
    // Lifts and warms on hover: scale + an accent border and red glow, so the
    // card you're reading is obviously the live one.
    <article className="group/card relative overflow-hidden rounded-xl border border-border bg-surface/40 transition-[transform,border-color,box-shadow,background-color] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] hover:z-10 hover:scale-[1.025] hover:border-accent/50 hover:bg-surface/70 hover:shadow-[0_18px_50px_-12px_var(--accent-subtle)]">
      {/* Red wash that fades in under the content on hover. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 group-hover/card:opacity-100"
        style={{
          background:
            "radial-gradient(120% 80% at 0% 0%, var(--accent-subtle), transparent 60%)",
        }}
      />
      {/* Accent rail down the left edge. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-y-0 left-0 w-0.5 origin-top scale-y-0 bg-accent transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover/card:scale-y-100"
      />

      {/* minmax(0,…) rather than a bare 1.1fr_1fr: `1fr` means `minmax(auto,1fr)`,
          and that auto floor is min-content — so a showcase containing nowrap or
          truncated text (AuraMail) widens its column and shifts the divider out
          of line with the other cards. minmax(0,…) keeps the split strictly
          proportional, so the vertical rule lands in the same place on every card. */}
      <div
        className={`relative ${hasShowcase ? "grid grid-cols-1 md:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)]" : ""}`}
      >
        <div className="p-6">
          <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
            <h3 className="text-lg font-semibold tracking-tight text-heading transition-colors duration-500 group-hover/card:text-accent-text">
              {p.name}
            </h3>
            {p.backendOnly && (
              <span className="rounded-full border border-border px-2 py-0.5 font-mono text-[0.6rem] uppercase tracking-wider text-foreground-subtle transition-colors duration-500 group-hover/card:border-accent/40 group-hover/card:text-accent-text">
                backend
              </span>
            )}
          </div>

          {p.role && (
            <p className="mt-1 font-mono text-[0.65rem] text-foreground-subtle">{p.role}</p>
          )}

          <p className="mt-3 text-pretty text-[0.9rem] leading-relaxed text-foreground-muted">
            {p.blurb}
          </p>

          <div className="mt-4 flex flex-wrap gap-1.5">
            {p.stack.map((s) => (
              <span
                key={s}
                className="rounded border border-border px-1.5 py-0.5 font-mono text-[0.62rem] text-foreground-muted transition-colors duration-500 group-hover/card:border-accent/30 group-hover/card:text-foreground"
              >
                {s}
              </span>
            ))}
          </div>

          <div className="mt-5 flex items-center gap-5">
            <a
              href={p.repo}
              target="_blank"
              rel="noreferrer"
              className="group relative font-mono text-[0.72rem] text-foreground hover:text-accent-text"
            >
              source
              <span className="absolute -bottom-0.5 left-0 h-px w-0 bg-accent transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:w-full" />
            </a>
            {p.demo && (
              <a
                href={p.demo}
                target="_blank"
                rel="noreferrer"
                className="group relative font-mono text-[0.72rem] text-foreground hover:text-accent-text"
              >
                demo
                <span className="absolute -bottom-0.5 left-0 h-px w-0 bg-accent transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:w-full" />
              </a>
            )}
          </div>
        </div>

        {hasShowcase && (
          <div className="relative min-h-[210px] border-t border-border bg-background/40 md:border-l md:border-t-0">
            <Showcase name={p.showcase!} repos={repos} stars={stars} />
          </div>
        )}
      </div>
    </article>
  );
}
