/**
 * Section heading: a big tight title, an optional muted second line (the
 * two-tone look), and a short line of context underneath.
 */
export function Heading({
  title,
  muted,
  sub,
  center = false,
}: {
  title: string;
  muted?: string;
  sub?: React.ReactNode;
  center?: boolean;
}) {
  return (
    <div className={`reveal ${center ? "mx-auto max-w-2xl text-center" : "max-w-2xl"}`}>
      <h2 className="text-[clamp(2.1rem,4.6vw,3.4rem)] font-semibold leading-[1.02] tracking-[-0.04em] text-heading">
        {title}
        {muted && <span className="block text-foreground-subtle">{muted}</span>}
      </h2>
      {sub && <p className="mt-4 text-pretty text-[1.05rem] leading-relaxed text-foreground-muted">{sub}</p>}
    </div>
  );
}

/** Small mono label used inside cards. */
export function Label({ children }: { children: React.ReactNode }) {
  return <p className="font-mono text-[0.7rem] text-foreground-subtle">{children}</p>;
}
