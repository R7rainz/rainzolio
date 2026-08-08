import Image from "next/image";
import { GithubActivity } from "@/components/GithubActivity";
import { HeroScene } from "@/components/HeroScene";
import { Projects } from "@/components/Projects";
import { Resume } from "@/components/Resume";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Timeline } from "@/components/Timeline";
import { TypingStats } from "@/components/TypingStats";
import profile from "@/data/profile.json";

const { name, about, stack, links } = profile;

const nav = [
  ["Work", "#projects"],
  ["About", "#about"],
  ["Journey", "#timeline"],
  ["Résumé", "#resume"],
];

export default function Home() {
  return (
    <div className="relative isolate min-h-screen">
      <div
        aria-hidden
        className="pointer-events-none fixed inset-x-0 top-0 -z-10 h-[38rem] bg-[radial-gradient(circle_at_70%_-20%,var(--accent-subtle),transparent_52%)]"
      />

      <header className="sticky top-0 z-50 border-b border-border/70 bg-background/80 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-5xl items-center justify-between gap-6 px-5 sm:px-8">
          <a href="#top" className="group flex items-center gap-3" aria-label="Back to top">
            <Image
              src={name.avatar}
              alt=""
              width={32}
              height={32}
              priority
              className="h-8 w-8 rounded-full border border-border object-cover grayscale transition group-hover:grayscale-0"
            />
            <span className="text-sm font-semibold tracking-tight text-heading">{name.display}</span>
          </a>

          <div className="flex items-center gap-2 sm:gap-6">
            <nav aria-label="Primary navigation" className="hidden items-center gap-6 sm:flex">
              {nav.map(([label, href]) => (
                <a
                  key={href}
                  href={href}
                  className="font-mono text-[0.68rem] uppercase tracking-[0.14em] text-foreground-subtle hover:text-heading"
                >
                  {label}
                </a>
              ))}
            </nav>
            <a
              href="mailto:ronakkamboj26@gmail.com"
              className="hidden rounded-full bg-heading px-4 py-2 font-mono text-[0.68rem] font-medium text-background hover:-translate-y-0.5 sm:block"
            >
              Let&apos;s talk
            </a>
            <ThemeToggle />
          </div>
        </div>
      </header>

      <main id="top" className="mx-auto w-full max-w-5xl px-5 sm:px-8">
        <section className="grid items-center gap-10 py-20 sm:py-24 lg:grid-cols-[1.12fr_0.88fr] lg:gap-12">
          <div className="hero-copy max-w-2xl">
            <p className="flex items-center gap-3 font-mono text-[0.68rem] uppercase tracking-[0.18em] text-foreground-subtle">
              <span className="h-px w-8 bg-accent" />
              {name.role} · India
            </p>
            <h1 className="mt-5 text-balance text-[clamp(2.7rem,6vw,4.4rem)] font-semibold leading-[0.98] tracking-[-0.055em] text-heading">
              Building systems
              <span className="block text-foreground-subtle">that stay up.</span>
            </h1>
            <p className="mt-6 max-w-xl text-pretty text-sm leading-7 text-foreground-muted sm:text-base">
              {name.tagline}
            </p>
            <div className="mt-7 flex flex-wrap items-center gap-3">
              <a
                href="#projects"
                className="rounded-full bg-accent px-4 py-2.5 font-mono text-[0.68rem] font-semibold text-accent-foreground hover:-translate-y-0.5 hover:bg-accent-hover"
              >
                Explore my work ↓
              </a>
              <a
                href={profile.resume}
                target="_blank"
                rel="noreferrer"
                className="rounded-full border border-border bg-surface/60 px-4 py-2.5 font-mono text-[0.68rem] text-heading hover:-translate-y-0.5 hover:border-border-strong"
              >
                View résumé ↗
              </a>
            </div>
            <p className="mt-5 flex items-center gap-2 font-mono text-[0.64rem] text-foreground-subtle">
              <span className="status-dot h-2 w-2 rounded-full bg-accent" />
              {name.status}
            </p>
          </div>

          <HeroScene />
        </section>

        <Projects />

        <section id="about" className="reveal-section scroll-mt-20 border-t border-border py-16 sm:py-20">
          <div className="grid gap-10 lg:grid-cols-[0.38fr_0.62fr] lg:gap-16">
            <div>
              <p className="section-index">02 / About</p>
              <h2 className="mt-3 text-2xl font-semibold tracking-[-0.035em] text-heading sm:text-3xl">
                Engineering with the boring parts in mind.
              </h2>
            </div>

            <div>
              <div className="flex flex-col gap-5">
                {about.map((paragraph) => (
                  <p key={paragraph} className="text-pretty text-base leading-7 text-foreground-muted">
                    {paragraph}
                  </p>
                ))}
              </div>

              <dl className="mt-10 grid gap-6 sm:grid-cols-2">
                {Object.entries(stack).map(([group, items]) => (
                  <div key={group} className="border-t border-border pt-4">
                    <dt className="font-mono text-[0.62rem] uppercase tracking-[0.16em] text-foreground-subtle">
                      {group}
                    </dt>
                    <dd className="mt-3 flex flex-wrap gap-x-3 gap-y-2 text-sm text-heading">
                      {items.map((item) => (
                        <span key={item}>{item}</span>
                      ))}
                    </dd>
                  </div>
                ))}
              </dl>
            </div>
          </div>
        </section>

        <Timeline />
        <GithubActivity />
        <TypingStats />
        <Resume />
      </main>

      <footer className="border-t border-border">
        <div className="mx-auto flex max-w-5xl flex-col gap-6 px-5 py-9 sm:flex-row sm:items-center sm:justify-between sm:px-8">
          <div>
            <p className="text-sm font-medium text-heading">{name.display}</p>
            <p className="mt-1 font-mono text-[0.64rem] text-foreground-subtle">
              Backend engineer · {name.location}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-5">
            {links.map((link) => (
              <a
                key={link.label}
                href={link.href}
                target="_blank"
                rel="noreferrer"
                className="font-mono text-[0.68rem] text-foreground-subtle hover:text-heading"
              >
                {link.label} ↗
              </a>
            ))}
            <a href="#top" className="font-mono text-[0.68rem] text-foreground-subtle hover:text-heading">
              Back to top ↑
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
