"use client";

import { useState } from "react";

/**
 * For the Ronaldo fan: press it and the letters do the celebration, a jump, a
 * half-turn in the air, and a stamped landing. The key remounts the letters so
 * every press replays it. Reduced motion just shows the word.
 */
export function Siu() {
  const [n, setN] = useState(0);

  return (
    <button
      type="button"
      onClick={() => setN((x) => x + 1)}
      aria-label="Celebrate: siuuu"
      className="pill inline-flex items-center gap-2 px-3.5 py-1.5 font-mono text-xs text-foreground-muted transition-colors duration-300 hover:text-heading"
    >
      <span aria-hidden className="text-accent-text">7</span>
      <span key={n} aria-hidden className="inline-flex">
        {[..."SIUUU"].map((ch, i) => (
          <span
            key={i}
            className={n ? "siu inline-block" : "inline-block"}
            style={{ animationDelay: `${i * 55}ms` }}
          >
            {n ? ch : ch.toLowerCase()}
          </span>
        ))}
      </span>
    </button>
  );
}
