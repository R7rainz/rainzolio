import { useEffect, useMemo, useRef } from "react";

/** setTimeout that's cancelled on unmount (and on demand), so demos never act on stale state. */
export function useTimers() {
  const list = useRef<number[]>([]);
  useEffect(() => {
    const pending = list.current;
    return () => pending.splice(0).forEach(clearTimeout);
  }, []);
  return useMemo(
    () => ({
      later: (ms: number, fn: () => void) => void list.current.push(window.setTimeout(fn, ms)),
      clear: () => list.current.splice(0).forEach(clearTimeout),
    }),
    [],
  );
}

/** setInterval that always calls the latest fn; pass null to stop it. */
export function useInterval(fn: () => void, ms: number | null) {
  const saved = useRef(fn);
  useEffect(() => {
    saved.current = fn;
  });
  useEffect(() => {
    if (ms === null) return;
    const id = window.setInterval(() => saved.current(), ms);
    return () => window.clearInterval(id);
  }, [ms]);
}

/** The props every demo gets from the Showcase. */
export type DemoProps = {
  /** On screen: continuous timers may run. */
  live: boolean;
  stats: { repos: number; stars: number; topLanguages: string[] } | null;
};
