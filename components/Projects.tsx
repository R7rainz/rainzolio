import { ProjectRow } from "@/components/ProjectRow";
import { Showcase } from "@/components/Showcase";
import profile from "@/data/profile.json";
import { getGithubStats } from "@/lib/github";

type Project = (typeof profile.projects)[number];

export async function Projects() {
  const stats = await getGithubStats();
  const featured = profile.projects.filter((project) => project.featured);
  const rest = profile.projects.filter((project) => !project.featured);

  return (
    <section id="projects" className="reveal-section scroll-mt-20 border-t border-border py-16 sm:py-20">
      <div className="grid gap-10 lg:grid-cols-[0.3fr_0.7fr] lg:gap-14">
        <header className="lg:sticky lg:top-24 lg:self-start">
          <p className="section-index">01 / Selected work</p>
          <h2 className="mt-3 text-2xl font-semibold tracking-[-0.04em] text-heading sm:text-3xl">
            Systems I&apos;ve shipped.
          </h2>
          <p className="mt-4 max-w-sm text-sm leading-6 text-foreground-muted">
            Real services, queues, APIs, and the small interfaces that make their internals visible.
          </p>
        </header>

        <div>
          <div className="flex flex-col gap-5">
            {featured.map((project, index) => (
              <Card
                key={project.name}
                project={project}
                number={String(index + 1).padStart(2, "0")}
                repos={stats?.repos ?? 0}
                stars={stats?.stars ?? 0}
              />
            ))}
          </div>

          {rest.length > 0 && (
            <div className="mt-14">
              <div className="flex items-center justify-between border-b border-border pb-4">
                <h3 className="font-mono text-[0.66rem] uppercase tracking-[0.18em] text-foreground-subtle">
                  More experiments
                </h3>
                <span className="font-mono text-[0.6rem] text-foreground-subtle">
                  {String(rest.length).padStart(2, "0")}
                </span>
              </div>
              <ul>
                {rest.map((project) => (
                  <li key={project.name}>
                    <ProjectRow
                      name={project.name}
                      blurb={project.blurb}
                      stack={project.stack}
                      repo={project.repo}
                      art={project.art ?? null}
                    />
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

function Card({
  project: project,
  number,
  repos,
  stars,
}: {
  project: Project;
  number: string;
  repos: number;
  stars: number;
}) {
  return (
    <article className="group/card relative overflow-hidden rounded-2xl border border-border bg-surface/70 transition-[border-color,box-shadow] duration-500 ease-calm hover:border-border-strong hover:shadow-[0_20px_60px_-42px_var(--accent-subtle)]">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_0%_0%,var(--accent-subtle),transparent_44%)] opacity-0 transition-opacity duration-500 group-hover/card:opacity-100" />

      <div className="relative grid md:grid-cols-[minmax(0,1.05fr)_minmax(260px,0.95fr)]">
        <div className="flex flex-col p-5 sm:p-6">
          <div className="flex items-center justify-between gap-4">
            <span className="font-mono text-[0.62rem] text-foreground-subtle">{number}</span>
            {project.backendOnly && (
              <span className="rounded-full border border-border px-2.5 py-1 font-mono text-[0.56rem] uppercase tracking-[0.14em] text-foreground-subtle">
                backend
              </span>
            )}
          </div>

          <h3 className="mt-5 text-xl font-semibold tracking-[-0.03em] text-heading transition-colors duration-300 group-hover/card:text-accent-text">
            {project.name}
          </h3>
          {project.role && (
            <p className="mt-1.5 font-mono text-[0.63rem] text-foreground-subtle">{project.role}</p>
          )}
          <p className="mt-4 text-pretty text-sm leading-6 text-foreground-muted">{project.blurb}</p>

          <div className="mt-6 flex flex-wrap gap-x-3 gap-y-2 font-mono text-[0.6rem] text-foreground-subtle">
            {project.stack.map((item) => (
              <span key={item}>{item}</span>
            ))}
          </div>

          <div className="mt-6 flex items-center gap-3">
            <a
              href={project.repo}
              target="_blank"
              rel="noreferrer"
              className="rounded-full border border-border bg-background/40 px-4 py-2 font-mono text-[0.66rem] text-heading hover:border-border-strong"
            >
              Source ↗
            </a>
            {project.demo && (
              <a
                href={project.demo}
                target="_blank"
                rel="noreferrer"
                className="rounded-full bg-accent px-4 py-2 font-mono text-[0.66rem] font-medium text-accent-foreground hover:bg-accent-hover"
              >
                Live demo ↗
              </a>
            )}
          </div>
        </div>

        {project.showcase && (
          <div className="relative min-h-[220px] border-t border-border bg-background/35 md:border-l md:border-t-0">
            <Showcase name={project.showcase} repos={repos} stars={stars} />
          </div>
        )}
      </div>
    </article>
  );
}
