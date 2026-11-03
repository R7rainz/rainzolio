"use client";

import { useSyncExternalStore } from "react";

export type Theme = "light" | "dark";

export const THEME_KEY = "rainz-theme";
export const THEME_EVENT = "themechange";

/**
 * The active theme lives on <html data-theme>, written before paint by the boot
 * script in app/layout.tsx. That makes it an external store, so it's read with
 * useSyncExternalStore rather than mirrored into state via an effect.
 */
function subscribe(onChange: () => void) {
  window.addEventListener(THEME_EVENT, onChange);
  return () => window.removeEventListener(THEME_EVENT, onChange);
}

function getSnapshot(): Theme {
  const t = document.documentElement.dataset.theme;
  // No data-theme only happens when storage threw in the boot script; the CSS is
  // following the system then, so the toggle should too.
  if (t === "dark" || t === "light") return t;
  return matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

// The server can't know the theme; the page itself is themed by CSS before
// paint, and only the toggle icon reconciles after hydration.
function getServerSnapshot(): Theme {
  return "dark";
}

export function useTheme(): Theme {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}

export function setTheme(next: Theme) {
  document.documentElement.dataset.theme = next;
  try {
    localStorage.setItem(THEME_KEY, next);
  } catch {
    // Private mode / storage disabled — the theme still applies for this page.
  }
  window.dispatchEvent(new Event(THEME_EVENT));
}
