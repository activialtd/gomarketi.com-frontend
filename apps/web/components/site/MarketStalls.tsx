import type { ReactNode } from "react";

// Brand palette, hardcoded because SVG fills can't read Tailwind classes.
const C = {
  primary: "#0a2e1a",
  secondary: "#0a4d2a",
  soft: "#239452",
  accent: "#22c55e",
  yellow: "#f2b705",
  white: "#ffffff",
};

const W = 180; // stall width
const N = 6; // canopy stripes
const SW = W / N;
const GROUND = 360;
const COUNTER = 262; // counter top

type StallProps = {
  x: number;
  top: number;
  stripe: string;
  name: string;
  hang?: ReactNode;
  goods: ReactNode;
};

function Stall({ x, top, stripe, name, hang, goods }: StallProps) {
  const stripeTop = top + 10;
  const stripeBottom = top + 60;

  return (
    <g stroke={C.primary} strokeWidth={2} strokeLinejoin="round">
      {/* poles */}
      <rect x={x + 4} y={stripeBottom} width={5} height={GROUND - stripeBottom} fill={C.primary} />
      <rect x={x + W - 9} y={stripeBottom} width={5} height={GROUND - stripeBottom} fill={C.primary} />

      {hang}

      {/* striped canopy with scalloped edge */}
      {Array.from({ length: N }, (_, i) => {
        const sx = x + i * SW;
        const fill = i % 2 === 0 ? stripe : C.white;
        return (
          <g key={i} fill={fill}>
            <rect x={sx} y={stripeTop} width={SW} height={50} />
            <path d={`M${sx} ${stripeBottom} A${SW / 2} ${SW / 2} 0 0 0 ${sx + SW} ${stripeBottom} Z`} />
          </g>
        );
      })}
      <rect x={x - 6} y={top} width={W + 12} height={12} rx={3} fill={C.primary} />

      {goods}

      {/* counter */}
      <rect x={x + 14} y={COUNTER + 8} width={W - 28} height={GROUND - COUNTER - 8} fill={C.white} strokeWidth={2.5} />
      <rect x={x + 8} y={COUNTER} width={W - 16} height={10} rx={2} fill={C.secondary} />
      <text
        x={x + W / 2}
        y={COUNTER + 58}
        textAnchor="middle"
        fontSize={14}
        fontWeight={700}
        fill={C.primary}
        stroke="none"
        fontFamily="inherit"
      >
        {name}
      </text>
    </g>
  );
}

function FabricStack({ x, colors }: { x: number; colors: string[] }) {
  return (
    <>
      {colors.map((c, i) => (
        <rect key={i} x={x} y={COUNTER - 11 * (i + 1)} width={54} height={11} rx={2} fill={c} strokeWidth={1.5} />
      ))}
    </>
  );
}

function Pile({ x, bowl, fruit }: { x: number; bowl: string; fruit: string }) {
  const r = 8;
  return (
    <>
      {[x + 14, x + 29, x + 44].map((cx) => (
        <circle key={cx} cx={cx} cy={COUNTER - 22 - r + 2} r={r} fill={fruit} strokeWidth={1.5} />
      ))}
      {[x + 21, x + 37].map((cx) => (
        <circle key={cx} cx={cx} cy={COUNTER - 22 - 3 * r + 4} r={r} fill={fruit} strokeWidth={1.5} />
      ))}
      <path d={`M${x} ${COUNTER - 22} H${x + 58} L${x + 50} ${COUNTER} H${x + 8} Z`} fill={bowl} />
    </>
  );
}

export function MarketStalls({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 600 380"
      className={className}
      role="img"
      aria-label="Three market stalls selling fabric, phones and food"
    >
      {/* Fabric stall */}
      <Stall
        x={10}
        top={70}
        stripe={C.soft}
        name="Ada Fabrics"
        hang={
          <>
            <rect x={46} y={132} width={18} height={52} fill={C.yellow} strokeWidth={1.5} />
            <rect x={90} y={132} width={18} height={72} fill={C.secondary} strokeWidth={1.5} />
            <rect x={134} y={132} width={18} height={44} fill={C.accent} strokeWidth={1.5} />
          </>
        }
        goods={
          <>
            <FabricStack x={34} colors={[C.soft, C.yellow, C.primary]} />
            <FabricStack x={112} colors={[C.accent, C.secondary, C.yellow, C.soft]} />
          </>
        }
      />

      {/* Phone stall */}
      <Stall
        x={210}
        top={40}
        stripe={C.accent}
        name="Musa Phones"
        hang={
          <>
            <line x1={280} y1={102} x2={280} y2={130} strokeWidth={1.5} />
            <line x1={320} y1={102} x2={320} y2={130} strokeWidth={1.5} />
            <rect x={266} y={130} width={68} height={38} rx={3} fill={C.white} />
            <text x={300} y={156} textAnchor="middle" fontSize={20} fontWeight={800} fill={C.soft} stroke="none">
              ₦
            </text>
          </>
        }
        goods={
          <>
            {[0, 1, 2, 3, 4].map((i) => {
              const px = 232 + i * 28;
              return (
                <g key={i}>
                  <rect x={px} y={COUNTER - 34} width={20} height={34} rx={3} fill={C.primary} />
                  <rect x={px + 3} y={COUNTER - 30} width={14} height={22} rx={1} fill={i % 2 ? C.accent : C.white} strokeWidth={0} />
                </g>
              );
            })}
          </>
        }
      />

      {/* Food stall */}
      <Stall
        x={410}
        top={85}
        stripe={C.secondary}
        name="Iya Basira Foods"
        goods={
          <>
            <Pile x={432} bowl={C.soft} fruit={C.yellow} />
            <Pile x={508} bowl={C.secondary} fruit={C.accent} />
          </>
        }
      />

      {/* ground */}
      <line x1={0} y1={GROUND} x2={600} y2={GROUND} stroke={C.primary} strokeWidth={3} strokeLinecap="round" />
    </svg>
  );
}
