import Image from "next/image";
import profile from "@/data/profile.json";

/**
 * Résumé section with an inline preview.
 *
 * The preview is a committed PNG of page 1 (see scripts/resume-preview.mjs),
 * not an embedded <object>/<iframe>. Embedding depends on a browser PDF plugin,
 * which most mobile browsers don't have — it renders an empty box there. An
 * image renders everywhere and the whole thing links to the real PDF anyway.
 *
 * Re-run `pnpm resume:preview` after replacing the PDF or this goes stale.
 */
export function Resume() {
  const src = profile.resume;
  if (!src) return null;

  return (
    <section id="resume" className="border-t border-border py-16">
      <div className="flex flex-wrap items-baseline justify-between gap-3">
        <h2 className="font-mono text-[0.7rem] uppercase tracking-[0.25em] text-foreground-subtle">
          Résumé
        </h2>
        <div className="flex items-center gap-5">
          <a
            href={src}
            target="_blank"
            rel="noreferrer"
            className="group relative font-mono text-[0.72rem] text-foreground hover:text-accent-text"
          >
            open
            <span className="absolute -bottom-0.5 left-0 h-px w-0 bg-accent transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:w-full" />
          </a>
          <a
            href={src}
            download="ronak-kamboj-resume.pdf"
            className="group relative font-mono text-[0.72rem] text-foreground hover:text-accent-text"
          >
            download
            <span className="absolute -bottom-0.5 left-0 h-px w-0 bg-accent transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:w-full" />
          </a>
        </div>
      </div>

      <a
        href={src}
        target="_blank"
        rel="noreferrer"
        className="group/card relative mt-6 block overflow-hidden rounded-xl border border-border bg-surface/40 transition-[border-color,box-shadow,transform] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] hover:border-accent/50 hover:shadow-[0_18px_50px_-12px_var(--accent-subtle)]"
      >
        <div
          aria-hidden
          className="pointer-events-none absolute inset-y-0 left-0 z-10 w-0.5 origin-top scale-y-0 bg-accent transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover/card:scale-y-100"
        />

        {/* Only the top of the page — showing all of it isn't a preview, it's
            just the résumé again, and an A4 at full width is a wall of text. */}
        <div className="relative h-[clamp(220px,34vw,330px)] overflow-hidden">
          <Image
            src={profile.resumePreview}
            alt="Résumé, page 1"
            width={1241}
            height={1754}
            sizes="(max-width: 768px) 100vw, 704px"
            className="w-full object-cover object-top"
          />
        </div>

        {/* Fades the crop into the card so it ends softly rather than being
            visibly chopped, and floats the call to action there. */}
        <div className="pointer-events-none absolute inset-x-0 bottom-0 flex h-32 items-end justify-center bg-gradient-to-t from-surface via-surface/90 to-transparent pb-5">
          <span className="font-mono text-[0.7rem] text-foreground-muted transition-colors duration-500 group-hover/card:text-accent-text">
            open the full PDF →
          </span>
        </div>
      </a>
    </section>
  );
}
