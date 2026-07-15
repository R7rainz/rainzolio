import Image from "next/image";
import { GithubActivity } from "@/components/GithubActivity";
import { Projects } from "@/components/Projects";
import { Resume } from "@/components/Resume";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Timeline } from "@/components/Timeline";
import { TypingStats } from "@/components/TypingStats";
import profile from "@/data/profile.json";

const { name, about, stack, links } = profile;

export default function Home() {
  return (
    <div className="mx-auto w-full max-w-3xl px-6 sm:px-8">
      <header className="flex items-center justify-between py-8">
        <span className="font-mono text-sm tracking-tight">
          <span className="text-accent">~/</span>
          <span className="text-heading">{name.handle}</span>
        </span>
        <ThemeToggle />
      </header>

      <main>
        {/* Hero */}
        <section className="py-10">
          <div className="flex items-center gap-4">
            <Image
              src={name.avatar}
              alt={name.display}
              width={56}
              height={56}
              priority
              className="h-14 w-14 rounded-full border border-border object-cover"
            />
            <div>
              <h1 className="text-2xl font-semibold tracking-tight text-heading sm:text-[1.75rem]">
                {name.display}
              </h1>
              <p className="mt-0.5 font-mono text-[0.72rem] text-foreground-subtle">
                {name.role} · {name.place}
              </p>
            </div>
          </div>

          <p className="mt-7 text-pretty text-[1.02rem] leading-relaxed text-foreground">
            {name.tagline}
          </p>

          <div className="mt-7 flex flex-wrap items-center gap-x-6 gap-y-2">
            {[...links, { label: "Résumé", href: profile.resume }].map((l) => (
              <a
                key={l.label}
                href={l.href}
                target="_blank"
                rel="noreferrer"
                className="group relative text-sm text-foreground hover:text-accent-text"
              >
                {l.label}
                <span className="absolute -bottom-0.5 left-0 h-px w-0 bg-accent transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:w-full" />
              </a>
            ))}
            <span className="flex items-center gap-2 font-mono text-[0.68rem] text-foreground-subtle">
              <span className="h-1.5 w-1.5 rounded-full bg-accent" />
              {name.status}
            </span>
          </div>
        </section>

        {/* About */}
        <section id="about" className="border-t border-border py-16">
          <h2 className="font-mono text-[0.7rem] uppercase tracking-[0.25em] text-foreground-subtle">
            About
          </h2>
          <div className="mt-6 flex flex-col gap-4">
            {about.map((p) => (
              <p key={p} className="text-pretty text-[0.95rem] leading-relaxed text-foreground-muted">
                {p}
              </p>
            ))}
          </div>

          <dl className="mt-9 flex flex-col gap-3">
            {Object.entries(stack).map(([group, items]) => (
              <div key={group} className="flex flex-wrap items-baseline gap-x-4 gap-y-1.5">
                <dt className="w-20 shrink-0 font-mono text-[0.65rem] uppercase tracking-[0.15em] text-foreground-subtle">
                  {group}
                </dt>
                <dd className="flex flex-wrap gap-1.5">
                  {items.map((i) => (
                    <span
                      key={i}
                      className="rounded border border-border px-1.5 py-0.5 font-mono text-[0.65rem] text-foreground-muted"
                    >
                      {i}
                    </span>
                  ))}
                </dd>
              </div>
            ))}
          </dl>
        </section>

        <Timeline />
        <Projects />
        <GithubActivity />
        <TypingStats />
        <Resume />
      </main>

      <footer className="flex flex-wrap items-center justify-between gap-2 border-t border-border py-8 font-mono text-[0.68rem] text-foreground-subtle">
        <span>{name.location}</span>
        <span>built by rainz</span>
      </footer>
    </div>
  );
}
