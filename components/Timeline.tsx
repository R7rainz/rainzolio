import profile from "@/data/profile.json";

/** The path so far, as a ledger. The last entry is where he is now. */
export function Timeline() {
  const items = profile.timeline;

  return (
    <ol className="border-t border-border">
      {items.map((item, i) => {
        const now = i === items.length - 1;
        return (
          <li
            key={`${item.year}-${item.title}`}
            className="reveal grid grid-cols-[3.5rem_minmax(0,1fr)] gap-x-4 border-b border-border py-4"
          >
            <span
              className={`pt-1 font-mono text-xs tabular-nums ${now ? "text-accent-text" : "text-foreground-subtle"}`}
            >
              {item.year}
            </span>
            <div>
              <div className="flex flex-wrap items-baseline gap-x-3">
                <h3 className="font-medium text-heading">
                  {now && (
                    <span
                      aria-hidden
                      className="mr-2 inline-block h-1.5 w-1.5 -translate-y-0.5 rounded-full bg-accent"
                    />
                  )}
                  {item.title}
                </h3>
                {item.stat && (
                  <span className="font-mono text-xs text-accent-text">{item.stat}</span>
                )}
              </div>
              <p className="mt-0.5 text-pretty text-[0.98rem] text-foreground-muted">{item.detail}</p>
            </div>
          </li>
        );
      })}
    </ol>
  );
}
