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
    <section id="resume" className="reveal-section scroll-mt-20 border-t border-border py-16 sm:py-20">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="section-index">06 / Résumé</p>
          <h2 className="mt-3 text-2xl font-semibold tracking-[-0.035em] text-heading sm:text-3xl">
            The one-page version.
          </h2>
        </div>
        <div className="flex items-center gap-5">
          <a
            href={src}
            target="_blank"
            rel="noreferrer"
            className="font-mono text-[0.66rem] text-foreground-subtle hover:text-heading"
          >
            Open ↗
          </a>
          <a
            href={src}
            download="ronak-kamboj-resume.pdf"
            className="font-mono text-[0.66rem] text-foreground-subtle hover:text-heading"
          >
            Download ↓
          </a>
        </div>
      </div>

      <a
        href={src}
        target="_blank"
        rel="noreferrer"
        className="group/card relative mt-8 block overflow-hidden rounded-2xl border border-border bg-surface/55 transition-[border-color,box-shadow] duration-500 ease-calm hover:border-border-strong hover:shadow-[0_20px_60px_-45px_var(--accent-subtle)]"
      >
        <div
          aria-hidden
          className="pointer-events-none absolute inset-y-0 left-0 z-10 w-0.5 origin-top scale-y-0 bg-accent transition-transform duration-500 ease-calm group-hover/card:scale-y-100"
        />

        {/* Only the top of the page — showing all of it isn't a preview, it's
            just the résumé again, and an A4 at full width is a wall of text. */}
        <div className="relative h-[clamp(240px,40vw,430px)] overflow-hidden">
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
