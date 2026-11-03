import { ProjectCard } from "@/components/ProjectCard";
import profile from "@/data/profile.json";

/**
 * Projects with a `diagram` in profile.json become interactive cards that open
 * a workflow pop-up (ProjectCard); an odd last card spans the row. Everything
 * else is a numbered "More work" list.
 */
export function Projects() {
  const studies = profile.projects.filter((p) => p.diagram);
  const rest = profile.projects.filter((p) => !p.diagram);

  return (
    <>
      <div className="mt-14 grid gap-5 lg:grid-cols-2">
        {studies.map((p, i) => (
          <ProjectCard
            key={p.name}
            p={p}
            n={i + 1}
            wide={i === studies.length - 1 && studies.length % 2 === 1}
          />
        ))}
      </div>

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
