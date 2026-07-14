import profile from "@/data/profile.json";

/**
 * The route so far. A single rail with a node per milestone; the last one is
 * live (accent + pulse) since it's where he currently is.
 */
export function Timeline() {
  const items = profile.timeline;

  return (
    <section id="timeline" className="border-t border-border py-16">
      <h2 className="font-mono text-[0.7rem] uppercase tracking-[0.25em] text-foreground-subtle">
        Timeline
      </h2>

      <ol className="mt-8">
        {items.map((item, i) => {
          const last = i === items.length - 1;
          return (
            <li key={`${item.year}-${item.title}`} className="group relative flex gap-4 sm:gap-5">
              {/* rail + node */}
              <div className="relative flex w-9 shrink-0 flex-col items-center">
                {/* The rail stops at the final node instead of dangling below it. */}
                {!last && (
                  <span
                    aria-hidden
                    className="absolute top-9 h-[calc(100%-1.5rem)] w-px bg-border"
                  />
                )}

                <span
                  className={`relative z-10 grid h-9 w-9 place-items-center rounded-full border transition-colors duration-500 ${
                    last
                      ? "border-accent/50 bg-accent-subtle text-accent-text"
                      : "border-border bg-surface text-foreground-subtle group-hover:border-accent/40 group-hover:text-accent-text"
                  }`}
                >
                  {last && (
                    <span
                      aria-hidden
                      className="absolute inset-0 animate-ping rounded-full border border-accent/40 opacity-60"
                    />
                  )}
                  <Icon name={item.icon} />
                </span>
              </div>

              {/* content */}
              <div className={`min-w-0 flex-1 ${last ? "pb-0" : "pb-9"}`}>
                <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                  <span
                    className={`font-mono text-[0.68rem] tabular-nums ${
                      last ? "text-accent-text" : "text-foreground-subtle"
                    }`}
                  >
                    {item.year}
                  </span>
                  <h3 className="text-[0.95rem] font-medium text-heading">{item.title}</h3>
                  {item.stat && (
                    <span className="rounded border border-border px-1.5 py-0.5 font-mono text-[0.62rem] text-accent-text transition-colors duration-500 group-hover:border-accent/40">
                      {item.stat}
                    </span>
                  )}
                </div>
                <p className="mt-1 text-pretty text-[0.85rem] leading-relaxed text-foreground-muted">
                  {item.detail}
                </p>
              </div>
            </li>
          );
        })}
      </ol>
    </section>
  );
}

const paths: Record<string, React.ReactElement> = {
  // a small spark / birth
  born: (
    <>
      <path d="M12 3v4M12 17v4M3 12h4M17 12h4" />
      <circle cx="12" cy="12" r="3.2" />
    </>
  ),
  // satchel
  school: (
    <>
      <path d="M4 9.5h16v9a1.5 1.5 0 01-1.5 1.5h-13A1.5 1.5 0 014 18.5v-9z" />
      <path d="M8.5 9.5V7a3.5 3.5 0 017 0v2.5M10 14h4" />
    </>
  ),
  // certificate
  exam: (
    <>
      <path d="M6 3.5h12v11H6z" />
      <path d="M9 7.5h6M9 11h4" />
      <circle cx="12" cy="17.5" r="3" />
      <path d="M10.5 20l-.5 3 2-1.2 2 1.2-.5-3" />
    </>
  ),
  // mortar board
  college: (
    <>
      <path d="M2.5 9.5L12 5l9.5 4.5L12 14 2.5 9.5z" />
      <path d="M6.5 11.5v5c0 1.4 2.5 2.5 5.5 2.5s5.5-1.1 5.5-2.5v-5" />
    </>
  ),
  // terminal
  code: (
    <>
      <rect x="3" y="4.5" width="18" height="15" rx="2" />
      <path d="M7 9.5l2.5 2.5L7 14.5M12.5 15h4" />
    </>
  ),
};

function Icon({ name }: { name: string }) {
  const d = paths[name];
  if (!d) return null;
  return (
    <svg
      viewBox="0 0 24 24"
      className="h-[15px] w-[15px]"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      {d}
    </svg>
  );
}
