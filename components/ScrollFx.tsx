"use client";

import { useEffect } from "react";

/**
 * Everything that reacts to scrolling, in one place (styles in globals.css):
 * - .reveal / .fig / .bar elements get .in as they enter the viewport; those
 *   arriving together are staggered.
 * - --hero (0..1 over the first screen) and --scroll (0..1 down the page) are
 *   written on <html> once per frame while scrolling.
 * - Whatever is scrolling gets .is-scrolling for a moment, so scrollbars only
 *   show while in use, like macOS overlay scrollbars.
 */
export function ScrollFx() {
  useEffect(() => {
    const root = document.documentElement;

    const io = new IntersectionObserver(
      (entries) => {
        entries
          .filter((e) => e.isIntersecting)
          .forEach((e, i) => {
            const el = e.target as HTMLElement;
            el.style.transitionDelay = `${i * 90}ms`;
            el.classList.add("in");
            io.unobserve(el);
          });
      },
      { rootMargin: "0px 0px -10% 0px", threshold: 0.12 },
    );
    const watch = () => document.querySelectorAll(".reveal:not(.in), .fig:not(.in), .bar:not(.in)").forEach((el) => io.observe(el));
    watch();
    // Sections that render late (e.g. after a theme change) still get picked up.
    const mo = new MutationObserver(watch);
    mo.observe(document.body, { childList: true, subtree: true });

    let frame = 0;
    const vars = () => {
      frame = 0;
      const max = root.scrollHeight - innerHeight;
      root.style.setProperty("--scroll", String(max > 0 ? scrollY / max : 0));
      root.style.setProperty("--hero", String(Math.min(1, scrollY / innerHeight)));
    };
    vars();

    const timers = new Map<Element, number>();
    const onScroll = (e: Event) => {
      if (!frame) frame = requestAnimationFrame(vars);
      const el = e.target instanceof Element ? e.target : root;
      el.classList.add("is-scrolling");
      window.clearTimeout(timers.get(el));
      timers.set(
        el,
        window.setTimeout(() => {
          el.classList.remove("is-scrolling");
          timers.delete(el);
        }, 900),
      );
    };
    document.addEventListener("scroll", onScroll, { capture: true, passive: true });
    window.addEventListener("resize", vars);

    return () => {
      io.disconnect();
      mo.disconnect();
      cancelAnimationFrame(frame);
      timers.forEach((t) => window.clearTimeout(t));
      document.removeEventListener("scroll", onScroll, { capture: true });
      window.removeEventListener("resize", vars);
    };
  }, []);

  return null;
}
