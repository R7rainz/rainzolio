"use client";

import { useId, useState } from "react";

/**
 * An architecture figure for a project, drawn from data in profile.json.
 *
 * Backend projects have no UI to screenshot, so each gets a sketch of how it
 * actually works: boxes, arrows, and one dot travelling the main path. The dot
 * is SMIL, which the CSS reduced-motion rule can't reach, so it's hidden with
 * motion-reduce instead. Hovering (or tapping) a box traces it: its wires and
 * neighbours light up and the rest dims. Dimming sits on wrapper groups so it
 * never fights the scroll-driven draw-in on .node / .edge.
 *
 * Coordinates are node centres in a 360×170 viewBox.
 */

type Node = { id: string; label: string; x: number; y: number };
export type DiagramData = {
  caption: string;
  nodes: Node[];
  /** [from, to, label?] */
  edges: string[][];
  /** Node ids the dot visits, in order. */
  flow: string[];
};

const W = 360;
const H = 170;
const NW = 84;
const NH = 26;
const PAD = 3;

/** Where the segment from `to`'s centre towards `from` crosses `to`'s border. */
function border(to: Node, from: Node): [number, number] {
  const dx = from.x - to.x;
  const dy = from.y - to.y;
  const t = Math.min(
    dx ? (NW / 2 + PAD) / Math.abs(dx) : Infinity,
    dy ? (NH / 2 + PAD) / Math.abs(dy) : Infinity,
  );
  return [to.x + dx * t, to.y + dy * t];
}

export function Diagram({
  n,
  data,
  interactive = true,
  highlight,
  animate = true,
  caption = true,
}: {
  n: number;
  data: DiagramData;
  /** Off for previews: no hover tracing, so a click can belong to the parent. */
  interactive?: boolean;
  /** Drive the trace from outside (the workflow walkthrough); overrides hover. */
  highlight?: string | null;
  /** Draw-in as it scrolls into view; off where it isn't on the page scroller. */
  animate?: boolean;
  /** Hide the caption (card previews); it still names the figure for screen readers. */
  caption?: boolean;
}) {
  const [hovered, setActive] = useState<string | null>(null);
  const active = highlight !== undefined ? highlight : hovered;
  const captionId = useId();
  const byId = new Map(data.nodes.map((node) => [node.id, node]));
  const touches = (e: string[]) => active !== null && (e[0] === active || e[1] === active);
  const lit = new Set(active ? [active, ...data.edges.filter(touches).flatMap((e) => e.slice(0, 2))] : []);
  const route = data.flow
    .map((id) => byId.get(id))
    .filter((node): node is Node => Boolean(node))
    .map((node, i) => `${i ? "L" : "M"}${node.x} ${node.y}`)
    .join(" ");

  return (
    <figure className={`${animate ? "fig " : ""}my-8`}>
      <div className="well dot-grid p-3 sm:p-5">
        <svg
          viewBox={`0 0 ${W} ${H}`}
          role="img"
          aria-labelledby={caption ? captionId : undefined}
          aria-label={caption ? undefined : data.caption}
          className="mx-auto block h-auto w-full max-w-[34rem] font-mono"
        >
          {data.edges.map((edge) => {
            const [fromId, toId, label] = edge;
            const a = byId.get(fromId);
            const b = byId.get(toId);
            if (!a || !b) return null;
            const [x1, y1] = border(a, b);
            const [x2, y2] = border(b, a);
            const angle = Math.atan2(y2 - y1, x2 - x1);
            const head = (off: number) =>
              `${x2 - 6 * Math.cos(angle + off)},${y2 - 6 * Math.sin(angle + off)}`;
            // Horizontal edges are short; a label on the line would hide the
            // arrowhead, so it sits just above instead.
            const above = Math.abs(y2 - y1) < 1;
            const on = touches(edge);
            const ink = on ? "var(--accent)" : "var(--foreground-subtle)";
            return (
              <g
                key={`${fromId}-${toId}`}
                className="transition-opacity duration-300"
                opacity={active && !on ? 0.2 : 1}
              >
                <line
                  x1={x1}
                  y1={y1}
                  x2={x2}
                  y2={y2}
                  pathLength={1}
                  className="edge transition-[stroke,stroke-width] duration-500"
                  stroke={ink}
                  strokeWidth={on ? 1.5 : 1}
                />
                <polygon
                  points={`${x2},${y2} ${head(0.45)} ${head(-0.45)}`}
                  className="tip transition-[fill] duration-500"
                  fill={ink}
                />
                {label && (
                  <text
                    className="tip"
                    x={(x1 + x2) / 2}
                    y={above ? y1 - 5 : (y1 + y2) / 2 + 3}
                    textAnchor="middle"
                    fontSize="8"
                    fill="var(--foreground-muted)"
                    stroke="var(--inset)"
                    strokeWidth="4"
                    paintOrder="stroke"
                  >
                    {label}
                  </text>
                )}
              </g>
            );
          })}

          {/* Drawn under the nodes, so the dot rides the wires and dips into
              each box rather than sliding over its label. */}
          <circle r="3.5" fill="var(--accent)" className="motion-reduce:hidden">
            <animateMotion
              dur={`${data.flow.length * 0.9}s`}
              repeatCount="indefinite"
              path={route}
            />
          </circle>

          {data.nodes.map((node) => (
            <g
              key={node.id}
              className={`transition-opacity duration-300 ${interactive ? "cursor-pointer" : ""}`}
              opacity={active && !lit.has(node.id) ? 0.35 : 1}
              {...(interactive && {
                onPointerEnter: (e: React.PointerEvent) => e.pointerType === "mouse" && setActive(node.id),
                onPointerLeave: (e: React.PointerEvent) => e.pointerType === "mouse" && setActive(null),
                // Touch has no hover: a tap toggles the trace instead.
                onPointerUp: (e: React.PointerEvent) =>
                  e.pointerType !== "mouse" && setActive((a) => (a === node.id ? null : node.id)),
              })}
            >
              <g className="node">
                <rect
                  x={node.x - NW / 2}
                  y={node.y - NH / 2}
                  width={NW}
                  height={NH}
                  rx="4"
                  className="transition-[fill,stroke] duration-500"
                  fill={node.id === active ? "var(--accent-subtle)" : "var(--surface)"}
                  stroke={node.id === active ? "var(--accent)" : "var(--border-strong)"}
                />
                <text
                  x={node.x}
                  y={node.y + 3.5}
                  textAnchor="middle"
                  fontSize="9.5"
                  fill="var(--heading)"
                >
                  {node.label}
                </text>
              </g>
            </g>
          ))}
        </svg>
      </div>
      {caption && (
        <figcaption
          id={captionId}
          className="mt-3 text-[0.92rem] leading-snug text-foreground-muted"
        >
          <span className="mr-2 font-mono text-[0.7rem] text-accent-text">Fig. {n}</span>
          {data.caption}
        </figcaption>
      )}
    </figure>
  );
}
