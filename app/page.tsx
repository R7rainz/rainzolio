import Image from "next/image";
import { Beyond } from "@/components/Beyond";
import { GithubActivity } from "@/components/GithubActivity";
import { Heading } from "@/components/Heading";
import { Projects } from "@/components/Projects";
import { Rain } from "@/components/Rain";
import { RainGlass } from "@/components/RainGlass";
import { ScrollFx } from "@/components/ScrollFx";
import { Terminal } from "@/components/Terminal";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Timeline } from "@/components/Timeline";
import profile from "@/data/profile.json";

const { name, about, stack, links } = profile;
const email = links.find((l) => l.href.startsWith("mailto:"));
const elsewhere = links.filter((l) => l !== email);

const NAV = [
  ["Work", "#work"],
  ["About", "#about"],
  ["Beyond", "#beyond"],
  ["Contact", "#contact"],
];

/** The logo (same as app/icon.svg): a raindrop with a `>_` prompt cut out. */
function Mark({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="13 6 38 52" aria-hidden className={className}>
      <path d="M32 8s-17 18.6-17 31a17 17 0 0 0 34 0C49 26.6 32 8 32 8z" fill="var(--accent)" />
      <g fill="none" stroke="var(--surface)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="3.6">
        <path d="m24.5 34 6.5 5.5-6.5 5.5" />
        <path d="M34 46h7.5" />
      </g>
    </svg>
  );
}

const darkButton =
  "rounded-full bg-heading px-6 py-3 text-sm font-medium text-background shadow-[0_10px_24px_-10px_rgb(0_0_0/0.45)] transition-transform duration-300 hover:-translate-y-0.5";
const lightButton =
  "pill px-6 py-3 text-sm font-medium text-heading transition-transform duration-300 hover:-translate-y-0.5";

export default function Home() {
  return (
    <div className="mx-auto w-full max-w-[72rem] px-5 sm:px-8">
      <div aria-hidden className="progress" />
      <Rain />
      <ScrollFx />

      {/* Floating chrome: it stays put while the page scrolls under it. */}
      <header className="sticky top-0 z-40 flex items-center justify-between gap-2 py-4 text-[0.8rem] sm:gap-3 sm:text-sm before:absolute before:inset-y-0 before:left-1/2 before:-z-10 before:w-screen before:-translate-x-1/2 before:bg-gradient-to-b before:from-background before:via-background/70 before:to-transparent">
        <a href="#" aria-label="Back to top" className="pill grid h-9 w-9 shrink-0 place-items-center sm:h-10 sm:w-10">
          <Mark className="h-5 w-5" />
        </a>
        <nav className="pill flex items-center gap-0.5 px-1 py-1 sm:px-1.5">
          {NAV.map(([label, href]) => (
            <a
              key={href}
              href={href}
              className="rounded-full px-2 py-1.5 text-foreground-muted transition-colors duration-300 hover:bg-accent-subtle hover:text-heading sm:px-3.5"
            >
              {label}
            </a>
          ))}
        </nav>
        <div className="flex items-center gap-2">
          <div className="pill">
            <ThemeToggle />
          </div>
          <a
            href={profile.resume}
            target="_blank"
            rel="noreferrer"
            className="hidden rounded-full bg-heading px-4 py-2 font-medium text-background sm:block"
          >
            Resume
          </a>
        </div>
      </header>

      <main>
        <section className="relative isolate pb-24 pt-20 text-center sm:pt-28">
          {/* A rainy window behind the first screen, running up under the header. */}
          <div className="absolute -top-[4.5rem] left-1/2 -z-10 h-[calc(100svh+4.5rem)] w-screen -translate-x-1/2 [mask-image:linear-gradient(to_bottom,black_72%,transparent)]">
            <RainGlass />
          </div>
          <div className="hero-copy">
          <p className="rise pill inline-flex items-center gap-2.5 py-1 pl-1 pr-4 text-[0.82rem] text-foreground-muted">
            <Image
              src={name.avatar}
              alt=""
              width={28}
              height={28}
              priority
              className="h-7 w-7 rounded-full object-cover"
            />
            {name.now}
          </p>

          <h1 className="rise mx-auto mt-8 text-[clamp(2.9rem,8.5vw,5.75rem)] font-semibold leading-[0.98] tracking-[-0.045em] text-heading [animation-delay:100ms]">
            {name.display}
            <span className="block text-foreground-subtle">{name.role}</span>
          </h1>

          <p className="rise mx-auto mt-7 max-w-[36rem] text-pretty text-lg leading-relaxed text-foreground-muted [animation-delay:200ms] sm:text-xl">
            {name.tagline}
          </p>

          <div className="rise mt-9 flex flex-wrap justify-center gap-3 [animation-delay:300ms]">
            {email && (
              <a href={email.href} className={darkButton}>
                Get in touch
              </a>
            )}
            <a href="#work" className={lightButton}>
              See the work
            </a>
          </div>

          <div className="rise mt-6 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 font-mono text-xs text-foreground-subtle [animation-delay:400ms]">
            {elsewhere.map((l) => (
              <a key={l.label} href={l.href} target="_blank" rel="noreferrer" className="link">
                {l.label} ↗
              </a>
            ))}
            <span>{name.status}</span>
          </div>
          </div>

          <div className="rise mt-16 [animation-delay:500ms]">
            <Terminal />
            <p className="mt-4 font-mono text-[0.7rem] text-foreground-subtle">
              it&apos;s a real shell, sort of. try <span className="text-heading">projects</span>,{" "}
              <span className="text-heading">stack</span> or <span className="text-heading">siuuu</span>
            </p>
          </div>
        </section>

        <section id="work" className="py-24">
          <Heading
            title="Selected work"
            muted="drawn the way it runs."
            sub="Each project comes with a sketch of how it actually works. Open one to walk through its workflow, step by step."
          />
          <Projects />
          <GithubActivity />
        </section>

        <section id="about" className="py-24">
          <Heading title="Full-stack," muted="end to end." />
          <div className="mt-8 grid gap-6 text-pretty text-[1.05rem] leading-relaxed text-foreground-muted lg:grid-cols-2 lg:gap-12">
            {about.map((p) => (
              <p key={p}>{p}</p>
            ))}
          </div>
          <ol className="mt-14 border-t border-border">
            {Object.entries(stack).map(([group, items], i) => (
              <li
                key={group}
                className="reveal grid items-baseline gap-x-8 gap-y-1 border-b border-border py-6 sm:grid-cols-[3rem_minmax(0,1fr)_minmax(0,1.2fr)]"
              >
                <span className="font-mono text-xs text-foreground-subtle">{String(i + 1).padStart(2, "0")}</span>
                <span className="text-xl font-medium tracking-[-0.02em] text-heading">{group}</span>
                <span className="text-sm leading-relaxed text-foreground-muted">{items.join(" · ")}</span>
              </li>
            ))}
          </ol>
        </section>

        <section id="beyond" className="py-24">
          <Heading title="Beyond code" sub="Ricing, typing, and football." />
          <Beyond />
        </section>

        <section id="path" className="grid gap-10 py-24 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)] lg:gap-16">
          <div className="lg:sticky lg:top-24 lg:self-start">
            <Heading title="Path" sub={`From ${name.location} to ${name.place}.`} />
          </div>
          <Timeline />
        </section>

        <section id="contact" className="py-28 text-center">
          {/* A small fan of cards, spreading on hover. */}
          <div className="group mx-auto flex w-fit items-end justify-center">
            <div className="card relative z-10 rotate-[-7deg] p-1.5 transition-transform duration-500 group-hover:-translate-x-3 group-hover:rotate-[-11deg]">
              <Image src={name.avatar} alt="" width={112} height={112} className="h-28 w-28 rounded-[1.1rem] object-cover" />
            </div>
            <a
              href={profile.resume}
              target="_blank"
              rel="noreferrer"
              aria-label="Open the resume PDF"
              className="card -ml-6 rotate-[6deg] p-1.5 transition-transform duration-500 group-hover:translate-x-3 group-hover:rotate-[10deg]"
            >
              {/* A committed PNG of page 1 (see scripts/resume-preview.mjs): an
                  embedded PDF needs a plugin most mobile browsers lack. */}
              <Image
                src={profile.resumePreview}
                alt=""
                width={1241}
                height={1754}
                sizes="96px"
                className="h-[8.5rem] w-24 rounded-[1rem] object-cover object-top"
              />
            </a>
          </div>

          <div className="mt-10">
            <Heading center title="Let's build something." sub={name.status} />
          </div>
          {email && (
            <a
              href={email.href}
              className="link mt-6 inline-block text-[clamp(1.4rem,4.5vw,2.25rem)] font-semibold tracking-[-0.03em] text-heading [overflow-wrap:anywhere]"
            >
              {email.href.replace("mailto:", "")}
            </a>
          )}
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            {email && (
              <a href={email.href} className={darkButton}>
                Email me
              </a>
            )}
            <a href={profile.resume} download="ronak-kamboj-resume.pdf" className={lightButton}>
              Download resume
            </a>
          </div>
        </section>
      </main>

      <footer className="relative overflow-hidden border-t border-border pt-14">
        <div className="grid gap-12 lg:grid-cols-[minmax(0,1fr)_auto]">
          <div>
            <span className="pill grid h-10 w-10 place-items-center">
              <Mark className="h-5 w-5" />
            </span>
            <p className="mt-4 text-sm text-foreground-muted">
              {name.display} · {name.role}
            </p>
            {email && (
              <a href={email.href} className="mt-5 inline-block rounded-full bg-heading px-4 py-2 text-sm font-medium text-background">
                Get in touch
              </a>
            )}
          </div>

          <div className="grid grid-cols-2 gap-x-14 gap-y-10 text-sm sm:grid-cols-3">
            <FooterColumn title="Sections" items={NAV.map(([label, href]) => ({ label, href }))} />
            <FooterColumn
              title="Projects"
              items={profile.projects.filter((p) => p.diagram).map((p) => ({ label: p.name, href: p.repo, external: true }))}
            />
            <FooterColumn
              title="Elsewhere"
              items={[
                ...links.map((l) => ({ label: l.label, href: l.href, external: !l.href.startsWith("mailto:") })),
                { label: "Resume", href: profile.resume, external: true },
              ]}
            />
          </div>
        </div>

        <div className="mt-16 flex flex-wrap justify-between gap-2 font-mono text-[0.7rem] text-foreground-subtle">
          <span>
            © {new Date().getFullYear()} {name.display}
          </span>
          <span>{name.location}</span>
        </div>

        <p
          aria-hidden
          className="reveal wordmark -mb-[0.2em] mt-6 select-none text-center text-[clamp(6rem,27vw,21rem)] font-semibold leading-none tracking-[-0.06em]"
        >
          {name.handle}
        </p>
      </footer>
    </div>
  );
}

function FooterColumn({
  title,
  items,
}: {
  title: string;
  items: { label: string; href: string; external?: boolean }[];
}) {
  return (
    <div>
      <p className="font-medium text-heading">{title}</p>
      <ul className="mt-3 flex flex-col gap-2">
        {items.map((it) => (
          <li key={it.label}>
            <a
              href={it.href}
              {...(it.external ? { target: "_blank", rel: "noreferrer" } : {})}
              className="text-foreground-muted transition-colors duration-300 hover:text-heading"
            >
              {it.label}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}
