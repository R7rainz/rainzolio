"use client";

/**
 * Small illustrations for the secondary projects.
 *
 * They only animate while their row is open, so five of these idling in the
 * page cost nothing. Each is keyed by `art` in data/profile.json.
 */

export function MiniArt({ name, active }: { name: string; active: boolean }) {
  const art = ART[name];
  if (!art) return null;
  return art(active);
}

const stroke = {
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.4,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
};

const ART: Record<string, (active: boolean) => React.ReactElement> = {
  // BrainBox — a doc with two collaborator carets
  notes: (active) => (
    <svg viewBox="0 0 64 40" className="h-full w-full text-accent" aria-hidden>
      <g {...stroke} opacity="0.5">
        <rect x="12" y="4" width="40" height="32" rx="3" />
        <path d="M18 13h20M18 20h26M18 27h14" />
      </g>
      <g className="transition-opacity duration-500" opacity={active ? 1 : 0}>
        <rect x="38" y="16" width="1.5" height="8" fill="currentColor">
          {active && (
            <animate attributeName="x" values="38;44;38" dur="2.4s" repeatCount="indefinite" />
          )}
        </rect>
        <rect x="24" y="9" width="1.5" height="8" fill="currentColor" opacity="0.55">
          {active && (
            <animate attributeName="x" values="24;33;24" dur="3.1s" repeatCount="indefinite" />
          )}
        </rect>
      </g>
    </svg>
  ),

  // TaskFlow — a TOTP token, its six digits rolling over
  token: (active) => (
    <svg viewBox="0 0 64 40" className="h-full w-full text-accent" aria-hidden>
      <g {...stroke} opacity="0.5">
        <rect x="8" y="8" width="48" height="24" rx="4" />
      </g>
      {Array.from({ length: 6 }).map((_, i) => (
        <rect
          key={i}
          x={14 + i * 6.5}
          y="16"
          width="4"
          height="8"
          rx="1"
          fill="currentColor"
          opacity={0.25}
        >
          {active && (
            <animate
              attributeName="opacity"
              values="0.25;0.9;0.25"
              dur="1.8s"
              begin={`${i * 0.18}s`}
              repeatCount="indefinite"
            />
          )}
        </rect>
      ))}
    </svg>
  ),

  // CodeQuest Lite — a streak of ticked days
  streak: (active) => (
    <svg viewBox="0 0 64 40" className="h-full w-full text-accent" aria-hidden>
      {Array.from({ length: 12 }).map((_, i) => (
        <rect
          key={i}
          x={6 + (i % 6) * 9}
          y={12 + Math.floor(i / 6) * 9}
          width="7"
          height="7"
          rx="1.5"
          fill="currentColor"
          opacity={0.18}
        >
          {active && (
            <animate
              attributeName="opacity"
              values="0.18;0.95;0.18"
              dur="2.6s"
              begin={`${i * 0.16}s`}
              repeatCount="indefinite"
            />
          )}
        </rect>
      ))}
    </svg>
  ),

  // neovim-conf — a buffer with a block cursor
  editor: (active) => (
    <svg viewBox="0 0 64 40" className="h-full w-full text-accent" aria-hidden>
      <g {...stroke} opacity="0.45">
        <path d="M10 10h10M10 16h22M10 22h16M10 28h26" />
      </g>
      <rect x="34" y="19" width="5" height="6" fill="currentColor" opacity="0.9">
        {active && (
          <animate attributeName="opacity" values="0.9;0.1;0.9" dur="1.1s" repeatCount="indefinite" />
        )}
      </rect>
    </svg>
  ),

  // SoftSell — a landing page skeleton
  landing: (active) => (
    <svg viewBox="0 0 64 40" className="h-full w-full text-accent" aria-hidden>
      <g {...stroke} opacity="0.5">
        <rect x="10" y="5" width="44" height="30" rx="3" />
        <path d="M10 12h44" />
      </g>
      <g fill="currentColor">
        <rect x="15" y="17" width="16" height="2.5" rx="1.25" opacity="0.8" />
        <rect x="15" y="23" width="10" height="2.5" rx="1.25" opacity="0.5" />
        <rect x="38" y="17" width="12" height="9" rx="2" opacity="0.25">
          {active && (
            <animate attributeName="opacity" values="0.25;0.7;0.25" dur="2s" repeatCount="indefinite" />
          )}
        </rect>
      </g>
    </svg>
  ),
};
