/**
 * Momo — an original ginger tabby that guides the tour.
 *
 * A plain cat, drawn from scratch: no character IP here (a generic cat isn't
 * protected the way a specific design like Doraemon is). Ginger from the warm
 * palette, cream belly, its own face.
 *
 * `costume` tracks the life stage, `action` drives the limbs, `walking` swaps
 * the sit for a stepping gait. Pure SVG + CSS keyframes (globals.css), so it
 * needs no client JS of its own and the site-wide reduced-motion rule quiets it.
 */

export type Costume = "newborn" | "school" | "student" | "college" | "dev" | "grad";
export type Action = "wave" | "point" | "type" | "cheer" | "idle";

const FUR = "var(--contrib-3)"; // ginger
const FUR_DARK = "var(--contrib-4)"; // stripes
const BELLY = "var(--surface)";
const INK = "var(--heading)";
const NOSE = "var(--accent)";

export function Cat({
  costume = "newborn",
  action = "idle",
  walking = false,
  className = "",
}: {
  costume?: Costume;
  action?: Action;
  walking?: boolean;
  className?: string;
}) {
  const typing = action === "type";
  const waving = action === "wave" || action === "cheer";

  return (
    <svg viewBox="0 0 100 104" className={className} fill="none" role="img" aria-label="Momo the cat">
      {/* whole cat bobs; a bit more while walking */}
      <g style={{ animation: `cat-bob ${walking ? "0.5s" : "2.6s"} ease-in-out infinite`, transformOrigin: "50px 70px" }}>
        {/* tail, behind the body, always swaying */}
        <path
          d="M74 84 Q92 80 88 62 Q86 52 78 54"
          stroke={FUR}
          strokeWidth="7"
          strokeLinecap="round"
          fill="none"
          style={{ animation: "cat-tail 1.8s ease-in-out infinite", transformOrigin: "74px 84px" }}
        />

        {/* back legs / haunch */}
        <ellipse cx="50" cy="86" rx="26" ry="14" fill={FUR} />

        {/* front legs — step while walking, tap while typing, else planted */}
        {typing ? (
          <>
            <g style={{ animation: "cat-step 300ms ease-in-out infinite" }}>
              <rect x="38" y="86" width="7" height="14" rx="3.5" fill={FUR} />
            </g>
            <g style={{ animation: "cat-step 300ms ease-in-out infinite", animationDelay: "-150ms" }}>
              <rect x="55" y="86" width="7" height="14" rx="3.5" fill={FUR} />
            </g>
          </>
        ) : walking ? (
          <>
            <g style={{ animation: "cat-step 0.34s ease-in-out infinite" }}>
              <rect x="38" y="86" width="7" height="14" rx="3.5" fill={FUR} />
            </g>
            <g style={{ animation: "cat-step 0.34s ease-in-out infinite", animationDelay: "-170ms" }}>
              <rect x="55" y="86" width="7" height="14" rx="3.5" fill={FUR} />
            </g>
          </>
        ) : (
          <>
            <rect x="38" y="88" width="7" height="12" rx="3.5" fill={FUR} />
            <rect x="55" y="88" width="7" height="12" rx="3.5" fill={FUR} />
            {/* toe beans */}
            <circle cx="41.5" cy="99" r="1" fill={NOSE} opacity="0.5" />
            <circle cx="58.5" cy="99" r="1" fill={NOSE} opacity="0.5" />
          </>
        )}

        {/* body */}
        <ellipse cx="50" cy="72" rx="24" ry="22" fill={FUR} />
        <ellipse cx="50" cy="76" rx="13" ry="15" fill={BELLY} />

        {/* one paw waves/cheers or points */}
        {(waving || action === "point") && (
          <g
            style={
              waving
                ? { animation: "guide-wave 1s ease-in-out infinite", transformOrigin: "70px 66px" }
                : undefined
            }
          >
            <rect
              x={action === "point" ? 70 : 68}
              y={action === "point" ? 58 : 50}
              width="7"
              height="16"
              rx="3.5"
              fill={FUR}
              transform={action === "point" ? "rotate(38 73 60)" : "rotate(12 71 58)"}
            />
          </g>
        )}

        {/* head */}
        <g style={{ transformOrigin: "50px 40px" }}>
          {/* ears */}
          <path d="M28 30 L26 12 L44 24 Z" fill={FUR} />
          <path d="M72 30 L74 12 L56 24 Z" fill={FUR} />
          <path d="M31 26 L30 17 L40 24 Z" fill={NOSE} opacity="0.4" />
          <path d="M69 26 L70 17 L60 24 Z" fill={NOSE} opacity="0.4" />

          {/* face */}
          <circle cx="50" cy="40" r="22" fill={FUR} />
          {/* forehead stripes */}
          <path d="M46 20 L45 30 M50 19 L50 30 M54 20 L55 30" stroke={FUR_DARK} strokeWidth="2" strokeLinecap="round" opacity="0.6" />
          {/* cheeks */}
          <ellipse cx="38" cy="46" rx="8" ry="6" fill={BELLY} opacity="0.85" />
          <ellipse cx="62" cy="46" rx="8" ry="6" fill={BELLY} opacity="0.85" />

          {/* eyes — blink */}
          <g style={{ animation: "guide-blink 4.8s ease-in-out infinite", transformOrigin: "50px 39px" }}>
            <ellipse cx="41" cy="39" rx="4" ry="5" fill={INK} />
            <ellipse cx="59" cy="39" rx="4" ry="5" fill={INK} />
            <circle cx="42.5" cy="37" r="1.4" fill="#fff" opacity="0.9" />
            <circle cx="60.5" cy="37" r="1.4" fill="#fff" opacity="0.9" />
          </g>

          {/* nose + mouth */}
          <path d="M47 46 L53 46 L50 49 Z" fill={NOSE} />
          <path d="M50 49 Q46 52 43 50 M50 49 Q54 52 57 50" stroke={INK} strokeWidth="1.4" strokeLinecap="round" fill="none" opacity="0.7" />

          {/* whiskers */}
          <g stroke={FUR_DARK} strokeWidth="1.2" strokeLinecap="round" opacity="0.5">
            <path d="M30 44 L16 42 M30 47 L17 49" />
            <path d="M70 44 L84 42 M70 47 L83 49" />
          </g>
        </g>

        {/* headgear over the head */}
        <Headgear costume={costume} />

        {/* belly emblem */}
        <Emblem costume={costume} />
      </g>
    </svg>
  );
}

function Emblem({ costume }: { costume: Costume }) {
  const glyph: Record<Costume, string> = {
    newborn: "♥",
    school: "Aa",
    student: "√x",
    college: "♪",
    dev: "</>",
    grad: "★",
  };
  return (
    <text
      x="50"
      y="80"
      textAnchor="middle"
      fontFamily="var(--font-mono, monospace)"
      fontSize="9"
      fontWeight="700"
      fill={NOSE}
      opacity="0.6"
    >
      {glyph[costume]}
    </text>
  );
}

/** Headgear drawn last so it layers over the head + ears cleanly. */
function Headgear({ costume }: { costume: Costume }) {
  switch (costume) {
    case "newborn":
      // tiny bonnet
      return (
        <g>
          <path d="M30 26 Q50 6 70 26" fill="var(--contrib-1)" stroke={NOSE} strokeWidth="1.5" />
          <circle cx="50" cy="11" r="2.5" fill="var(--contrib-2)" />
        </g>
      );
    case "school":
      // peaked cap
      return (
        <g>
          <path d="M32 22 Q50 8 68 22 L68 26 L32 26 Z" fill={NOSE} />
          <path d="M32 26 Q24 27 22 30 L38 29 Z" fill={NOSE} />
          <circle cx="50" cy="15" r="2" fill="var(--contrib-1)" />
        </g>
      );
    case "student":
      // beanie
      return (
        <g>
          <path d="M31 24 Q50 4 69 24 Z" fill="var(--contrib-2)" stroke={NOSE} strokeWidth="1.2" />
          <rect x="31" y="23" width="38" height="4" rx="2" fill={NOSE} />
        </g>
      );
    case "college":
      // headphones
      return (
        <g stroke={INK} strokeWidth="3" fill="none">
          <path d="M30 40 Q30 16 50 16 Q70 16 70 40" />
          <rect x="26" y="38" width="7" height="11" rx="3" fill={INK} />
          <rect x="67" y="38" width="7" height="11" rx="3" fill={INK} />
        </g>
      );
    case "dev":
      // headset with mic
      return (
        <g stroke={INK} strokeWidth="3" fill="none">
          <path d="M30 40 Q30 16 50 16 Q70 16 70 40" />
          <rect x="26" y="38" width="7" height="11" rx="3" fill={INK} />
          <rect x="67" y="38" width="7" height="11" rx="3" fill={INK} />
          <path d="M30 49 Q30 56 41 56" strokeWidth="2.2" />
          <circle cx="42" cy="56" r="2.2" fill={INK} stroke="none" />
        </g>
      );
    case "grad":
      // mortarboard
      return (
        <g>
          <path d="M50 8 L80 20 L50 32 L20 20 Z" fill={INK} />
          <path d="M50 26 L50 36 M50 36 L60 36" stroke="var(--contrib-2)" strokeWidth="2" fill="none" />
          <circle cx="61" cy="37" r="2.5" fill="var(--contrib-2)" />
        </g>
      );
  }
}
