import profile from "@/data/profile.json";

export function Timeline() {
  // A professional portfolio starts where the relevant education does; birth
  // and primary school remain in the data but do not help a hiring reader.
  const items = profile.timeline.slice(2);

  return (
    <section id="timeline" className="reveal-section scroll-mt-20 border-t border-border py-16 sm:py-20">
      <div className="grid gap-10 lg:grid-cols-[0.38fr_0.62fr] lg:gap-16">
        <header>
          <p className="section-index">03 / Journey</p>
          <h2 className="mt-3 text-2xl font-semibold tracking-[-0.035em] text-heading sm:text-3xl">
            Still early. Already building.
          </h2>
          <p className="mt-4 max-w-sm text-sm leading-6 text-foreground-muted">
            The short version—from competitive programming to backend systems.
          </p>
        </header>

        <ol className="border-y border-border">
          {items.map((item, index) => {
            const current = index === items.length - 1;
            return (
              <li
                key={`${item.year}-${item.title}`}
                className="group grid grid-cols-[4.5rem_1fr] gap-4 border-b border-border py-6 last:border-b-0 sm:grid-cols-[6rem_1fr]"
              >
                <span className={`font-mono text-[0.66rem] ${current ? "text-accent-text" : "text-foreground-subtle"}`}>
                  {item.year}
                </span>
                <div>
                  <div className="flex flex-wrap items-center gap-2.5">
                    <h3 className="font-medium text-heading transition-colors group-hover:text-accent-text">
                      {item.title}
                    </h3>
                    {item.stat && (
                      <span className="rounded-full border border-border px-2 py-0.5 font-mono text-[0.58rem] text-foreground-subtle">
                        {item.stat}
                      </span>
                    )}
                  </div>
                  <p className="mt-1.5 text-sm leading-6 text-foreground-muted">{item.detail}</p>
                </div>
              </li>
            );
          })}
        </ol>
      </div>
    </section>
  );
}
