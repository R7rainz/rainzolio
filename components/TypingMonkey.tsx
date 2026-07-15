/**
 * A monkey at a keyboard, for the typing section.
 *
 * Drawn from scratch rather than reusing Monkeytype's own logo — that's their
 * trademark, and this isn't their site. It's a nod, not their mark.
 *
 * Pure CSS keyframes (see globals.css) so this stays a server component, and
 * so the site-wide prefers-reduced-motion rule stops it for free.
 */
export function TypingMonkey({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 64 44"
      className={className}
      fill="none"
      role="img"
      aria-label="A monkey typing"
    >
      {/* head + body bob together, a beat slower than the hands */}
      <g style={{ animation: "bob 620ms ease-in-out infinite" }}>
        {/* ears */}
        <circle cx="21" cy="15" r="4" fill="var(--contrib-2)" />
        <circle cx="43" cy="15" r="4" fill="var(--contrib-2)" />
        <circle cx="21" cy="15" r="2" fill="var(--accent-subtle)" />
        <circle cx="43" cy="15" r="2" fill="var(--accent-subtle)" />

        {/* head */}
        <ellipse cx="32" cy="15" rx="11" ry="10" fill="var(--contrib-3)" />
        {/* face */}
        <ellipse cx="32" cy="17.5" rx="7.5" ry="6.5" fill="var(--contrib-1)" />

        {/* eyes — blink on a long cycle so it reads as alive, not twitchy */}
        <g style={{ animation: "monkey-blink 4.2s ease-in-out infinite", transformOrigin: "32px 14px" }}>
          <circle cx="28.5" cy="14" r="1.5" fill="var(--heading)" />
          <circle cx="35.5" cy="14" r="1.5" fill="var(--heading)" />
        </g>

        {/* muzzle */}
        <ellipse cx="32" cy="19.5" rx="3" ry="2" fill="var(--contrib-2)" opacity="0.55" />

        {/* shoulders */}
        <path d="M23 26 q9 -4 18 0 v5 h-18 z" fill="var(--contrib-3)" />
      </g>

      {/* Keyboard first: SVG has no z-index, so paint order is document order —
          drawn last it covered the hands entirely. */}
      <rect x="10" y="33" width="44" height="9" rx="2.5" fill="var(--surface)" stroke="var(--border-strong)" />
      {[14, 20, 26, 32, 38, 44, 50].map((x) => (
        <rect key={x} x={x} y="35" width="3.5" height="1.8" rx="0.6" fill="var(--foreground-subtle)" opacity="0.45" />
      ))}
      {/* spacebar */}
      <rect x="24" y="39" width="16" height="1.6" rx="0.8" fill="var(--foreground-subtle)" opacity="0.35" />

      {/* Arms + hands over the keys, alternating — offset by half the cycle. */}
      <g style={{ animation: "tap-down 300ms ease-in-out infinite" }}>
        <path d="M25 28 L22 34" stroke="var(--contrib-3)" strokeWidth="3.2" strokeLinecap="round" />
        <circle cx="21.5" cy="35.5" r="3" fill="var(--contrib-1)" stroke="var(--contrib-3)" strokeWidth="1" />
      </g>
      <g style={{ animation: "tap-down 300ms ease-in-out infinite", animationDelay: "-150ms" }}>
        <path d="M39 28 L42 34" stroke="var(--contrib-3)" strokeWidth="3.2" strokeLinecap="round" />
        <circle cx="42.5" cy="35.5" r="3" fill="var(--contrib-1)" stroke="var(--contrib-3)" strokeWidth="1" />
      </g>
    </svg>
  );
}
