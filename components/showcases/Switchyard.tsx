/**
 * A small visual for Switchyard's workflow graph. The animated token follows
 * the same route as the project: draft, review, then deterministic execution.
 */
export function Switchyard() {
  return (
    <div className="flex h-full flex-col justify-center gap-3 p-5 font-mono">
      <div className="flex items-center justify-between text-[0.58rem]">
        <span className="text-foreground-subtle">workflow / deploy-preview</span>
        <span className="text-accent-text">running</span>
      </div>

      <svg viewBox="0 0 320 128" className="h-auto w-full" role="img" aria-label="Switchyard workflow graph">
        <path d="M48 64H112M160 64H224M112 64l24-32M112 64l24 32M208 32h16M208 96h16" fill="none" stroke="var(--border-strong)" strokeWidth="1.5" strokeDasharray="3 4" />
        <path d="M48 64H112M160 64H224" fill="none" stroke="var(--accent)" strokeWidth="1.5" strokeDasharray="3 4" opacity="0.65">
          <animate attributeName="stroke-dashoffset" values="0;-28" dur="2.4s" repeatCount="indefinite" />
        </path>

        {[
          ["input", 20, 50],
          ["review", 112, 50],
          ["run", 224, 50],
          ["retry", 136, 18],
          ["logs", 136, 82],
        ].map(([label, x, y], index) => (
          <g key={label}>
            <rect x={x} y={y} width="48" height="28" rx="5" fill="var(--surface)" stroke={index === 2 ? "var(--accent)" : "var(--border-strong)"} />
            <text x={Number(x) + 24} y={Number(y) + 17} fill={index === 2 ? "var(--accent-text)" : "var(--foreground-muted)"} fontSize="7" textAnchor="middle">
              {label}
            </text>
          </g>
        ))}

        <circle r="3" fill="var(--accent)">
          <animateMotion dur="3.2s" repeatCount="indefinite" path="M48 64H112H160H224" />
        </circle>
      </svg>

      <div className="flex items-center justify-between border-t border-border pt-2 text-[0.54rem] text-foreground-subtle">
        <span>graph valid · 5 nodes</span>
        <span>ws · 18 events</span>
      </div>
    </div>
  );
}
