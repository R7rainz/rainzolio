# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

Single-page personal portfolio: Next.js 16 (App Router), React 19, Tailwind CSS v4, TypeScript. Deployed on Vercel.

## Commands

The package manager is pnpm (`pnpm-lock.yaml` is the committed lockfile; `bun.lock` is untracked).

- `pnpm dev`: dev server
- `pnpm build`: production build. This is also the type check, since there's no separate `tsc` script.
- `pnpm lint`: ESLint (next core-web-vitals and typescript configs)
- `pnpm resume:preview`: regenerates `public/hero/resume-preview.png` from page 1 of `public/hero/resume.pdf`. It needs `pdftoppm` (poppler) installed locally. Re-run it whenever the PDF changes, because the preview PNG is committed and is never built at deploy time.

There is no test suite.

## Architecture

Single page, laid out after spacefs.com: floating pill header, a centred two-tone hero with an interactive terminal window as its showcase, then Work / About / Beyond / Path / Contact sections built from big headings (`components/Heading.tsx`), numbered hairline rows, and white `.card`s, ending in a footer with link columns and a striped `rainz` wordmark. Fonts are Google Sans and Google Sans Code.

**Content lives in `data/profile.json`, not in the components.** The hero, about, stack, links, projects, `beyond` cards, timeline, resume paths, and the GitHub/Monkeytype usernames all come from that file. To change copy, edit the JSON. TS types are inferred from it, so a field present on only some entries (like `diagram`) becomes optional on all of them.

**Projects** (`components/Projects.tsx`, a server component):
- Projects with a `live` key (`switchyard`, `pulse`, `mail`, `sync`, `banners`) appear in `components/Showcase.tsx`: ARIA pill tabs over one `Window` that runs a small working, clearly simulated version of the project from `components/demos/`, with blurb, `highlights`, stack and links underneath. Demos only run continuous timers while the window is on screen (`live` prop); `components/demos/hooks.ts` has `useTimers` / `useInterval`. The Banners demo shows the real `getGithubStats()` numbers for R7rainz.
- Projects without `live` go in the numbered "More work" list.
- `components/Window.tsx` is the shared window chrome (also used by the hero `Terminal`).

**Interactive pieces** are client components: `Terminal` (commands answered from profile.json), `TypingRace` (race the live Monkeytype peak), `Siu` (letter bounce), `Showcase` and its demos, `Rain`, `RainGlass`, `ScrollFx` (scroll reveals, hero parallax, progress bar, auto-hiding scrollbars), `ThemeToggle`.

**Background:** the hero is a full-width pane of glass in the `--background` colour (`components/RainGlass.tsx`, a WebGL shader) with realistic drops running down it stop-and-go, leaving trails of tiny beads that dry up; no pointer input. Below the hero, `components/Rain.tsx` is a fixed 2D canvas of light rain where the pointer acts as an umbrella; `body` deliberately has no background so it shows between the `html` background and the content. Both pause with the tab and draw one still frame under reduced motion. Note the build compiles `light-dark()` into variables resolved once on `:root`, so changing `color-scheme` on a subtree does not flip tokens there.

**External data is fetched server-side and fails closed.** `lib/github.ts` and `lib/monkeytype.ts` are `server-only` modules called from async server components (`GithubActivity`, `Beyond`). Every fetch uses `next: { revalidate: 86400 }` (1-day ISR) and returns `null` on any failure, and that block then hides itself. Keep that contract: the page must build with no network and no secrets. `GITHUB_TOKEN` is optional and only raises the REST rate limit. Contributions come from a public proxy (`github-contributions-api.jogruber.de`) because GitHub's GraphQL API needs a token. Don't swap these for embedded third-party badge images.

**Theming:**
- Colors are CSS custom properties in `app/globals.css` using `light-dark()`: cool grey and near-black ink in light, graphite in dark, one blue accent (shared by the raindrop logo in `app/icon.svg` and `Mark` in `app/page.tsx`). They're exposed to Tailwind through `@theme inline` (`bg-background`, `text-foreground-muted`, `text-accent-text`, …). Use those tokens instead of raw colors; canvas/WebGL-free components read them at runtime via `getComputedStyle` and re-read on `themechange`.
- With no `data-theme` the page follows the system. An inline boot script in `app/layout.tsx` sets `<html data-theme>` before first paint from `localStorage['rainz-theme']`, falling back to the system preference; `[data-theme]` only pins `color-scheme`.
- `lib/useTheme.ts` reads the theme through `useSyncExternalStore`, and `setTheme` dispatches a `themechange` event. `ThemeToggle` does a View Transitions circular wipe.
- Shared classes in `globals.css`: `.link`, `.pill`, `.card`, `.well`, `.wordmark`.
- Motion: `.rise` plays on mount; `components/ScrollFx.tsx` adds `.in` to `.reveal` / `.bar` as they enter the viewport and drives `--hero` / `--scroll`. Reveals only hide content when the boot script tagged `<html>` with `.reveal-on` (motion allowed). Don't put `.reveal` on an element that also transforms on hover; wrap it instead.
- Font CSS variables are deliberately named `--font-google-sans` / `--font-google-sans-code`, not `--font-sans` / `--font-mono`, so the `@theme` mapping doesn't reference itself.

Imports use the `@/*` alias for the repo root.
