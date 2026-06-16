"use client";

import { useEffect, useLayoutEffect, useState } from "react";
import { X, ArrowRight, ArrowLeft } from "lucide-react";

const TOUR_KEY = "gm_dash_tour_v1";

const STEPS: {
  target: string;
  emoji: string;
  title: string;
  description: string;
}[] = [
  {
    target: "dashboard",
    emoji: "📊",
    title: "Dashboard Overview",
    description:
      "Your command centre. See today's revenue, pending orders, and recent activity the moment you log in.",
  },
  {
    target: "products",
    emoji: "📦",
    title: "Products",
    description:
      "Add products with photos, pricing, and variants. Organise into categories and collections — bulk import from CSV too.",
  },
  {
    target: "orders",
    emoji: "🛒",
    title: "Orders",
    description:
      "Track every customer order in real time. Update fulfilment status, print invoices, and manage returns from one view.",
  },
  {
    target: "customers",
    emoji: "👥",
    title: "Customers",
    description:
      "Your built-in CRM. See who's buying, how often, and their lifetime value. Send follow-ups and build loyalty.",
  },
  {
    target: "analytics",
    emoji: "📈",
    title: "Analytics",
    description:
      "Revenue trends, best-selling products, traffic sources, and peak selling times — all in real-time charts.",
  },
];

interface Rect {
  x: number;
  y: number;
  width: number;
  height: number;
}

const PAD = 6;
const TOOLTIP_W = 292;
const SIDEBAR_W = 240;

export function DashboardTour() {
  const [visible, setVisible] = useState(false);
  const [step, setStep] = useState(0);
  const [spotRect, setSpotRect] = useState<Rect | null>(null);
  const [vpSize, setVpSize] = useState({ w: 0, h: 0 });

  // Only show on desktop (sidebar always visible at lg+)
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (window.innerWidth < 1024) return;
    if (!localStorage.getItem(TOUR_KEY)) {
      setVisible(true);
      setVpSize({ w: window.innerWidth, h: window.innerHeight });
    }
  }, []);

  // Measure target element whenever step changes
  useLayoutEffect(() => {
    if (!visible) return;
    const el = document.querySelector<HTMLElement>(
      `[data-tour="${STEPS[step].target}"]`,
    );
    if (!el) return;

    const r = el.getBoundingClientRect();
    setSpotRect({ x: r.x, y: r.y, width: r.width, height: r.height });

    // Scroll sidebar item into view if needed
    el.scrollIntoView({ block: "nearest", behavior: "smooth" });
  }, [step, visible]);

  function dismiss() {
    localStorage.setItem(TOUR_KEY, "1");
    setVisible(false);
  }

  if (!visible || !spotRect) return null;

  const sx = spotRect.x - PAD;
  const sy = spotRect.y - PAD;
  const sw = spotRect.width + PAD * 2;
  const sh = spotRect.height + PAD * 2;

  // Tooltip sits to the right of the sidebar
  const tooltipLeft = SIDEBAR_W + 20;

  // Vertically align tooltip with the spotlight, but clamp to viewport
  const tooltipTop = Math.min(
    Math.max(sy - 8, 12),
    vpSize.h - 320,
  );

  const current = STEPS[step];

  return (
    <>
      {/* Click-blocker (below overlay z — blocks background but lets tooltip be interactive) */}
      <div
        className="fixed inset-0"
        style={{ zIndex: 9988, pointerEvents: "all" }}
        onClick={dismiss}
      />

      {/* SVG spotlight mask */}
      <svg
        className="fixed inset-0 pointer-events-none"
        style={{ zIndex: 9989, width: "100vw", height: "100vh" }}
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <mask id="gm-tour-mask">
            <rect width="100%" height="100%" fill="white" />
            <rect x={sx} y={sy} width={sw} height={sh} rx={9} fill="black" />
          </mask>
        </defs>
        <rect
          width="100%"
          height="100%"
          fill="rgba(15,23,42,0.68)"
          mask="url(#gm-tour-mask)"
        />
      </svg>

      {/* Spotlight border glow */}
      <div
        className="fixed pointer-events-none"
        style={{
          zIndex: 9990,
          left: sx,
          top: sy,
          width: sw,
          height: sh,
          borderRadius: 9,
          border: "2px solid #1A7A42",
          boxShadow: "0 0 0 3px rgba(26,122,66,0.18), 0 0 22px rgba(26,122,66,0.35)",
          transition: "all 0.22s ease",
        }}
      />

      {/* Tooltip card */}
      <div
        className="fixed"
        style={{
          zIndex: 9991,
          left: tooltipLeft,
          top: tooltipTop,
          width: TOOLTIP_W,
          pointerEvents: "all",
          transition: "top 0.22s ease",
        }}
      >
        {/* Left arrow connector */}
        <div
          className="absolute"
          style={{
            left: -8,
            top: Math.min(Math.max(sy - tooltipTop + sh / 2 - 8, 16), 200),
            width: 0,
            height: 0,
            borderTop: "8px solid transparent",
            borderBottom: "8px solid transparent",
            borderRight: "8px solid #fff",
            filter: "drop-shadow(-2px 0 2px rgba(0,0,0,0.08))",
          }}
        />

        <div
          className="rounded-[16px] overflow-hidden"
          style={{
            background: "#fff",
            boxShadow: "0 16px 48px rgba(0,0,0,0.18), 0 2px 8px rgba(0,0,0,0.08)",
            border: "1px solid #e2e8f0",
          }}
        >
          {/* Header */}
          <div
            className="flex items-start justify-between px-5 pt-5 pb-3"
          >
            <div className="flex items-center gap-2.5">
              <span className="text-[22px] select-none">{current.emoji}</span>
              <p
                className="text-[14px] font-extrabold"
                style={{ color: "#1C1C1C", letterSpacing: "-0.2px" }}
              >
                {current.title}
              </p>
            </div>
            <button
              type="button"
              onClick={dismiss}
              className="p-1.5 rounded-full transition-colors hover:bg-slate-100 shrink-0"
              style={{ color: "#9ca3af" }}
              aria-label="Close tour"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          <p
            className="px-5 pb-4 text-[13px] leading-relaxed"
            style={{ color: "#4b5563" }}
          >
            {current.description}
          </p>

          {/* Progress dots */}
          <div className="flex items-center justify-center gap-1.5 pb-3">
            {STEPS.map((_, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setStep(i)}
                className="rounded-full transition-all duration-250"
                aria-label={`Go to step ${i + 1}`}
                style={{
                  width: i === step ? 20 : 6,
                  height: 6,
                  background: i === step ? "#1A7A42" : "#e2e8f0",
                }}
              />
            ))}
          </div>

          {/* Nav row */}
          <div
            className="flex items-center justify-between px-4 py-3 border-t"
            style={{ borderColor: "#f1f5f9" }}
          >
            <button
              type="button"
              onClick={() => setStep((s) => s - 1)}
              disabled={step === 0}
              className="flex items-center gap-1 px-3 py-1.5 rounded-[8px] text-[12px] font-semibold transition-all disabled:opacity-0 disabled:pointer-events-none"
              style={{
                color: "#6b7280",
                background: "#f8fafc",
                border: "1px solid #e2e8f0",
              }}
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              Back
            </button>

            <span className="text-[11px]" style={{ color: "#c4c8d0" }}>
              {step + 1} / {STEPS.length}
            </span>

            {step < STEPS.length - 1 ? (
              <button
                type="button"
                onClick={() => setStep((s) => s + 1)}
                className="flex items-center gap-1 px-3 py-1.5 rounded-[8px] text-[12px] font-bold text-white transition-all"
                style={{ background: "#1A7A42" }}
                onMouseOver={(e) =>
                  (e.currentTarget.style.background = "#239452")
                }
                onMouseOut={(e) =>
                  (e.currentTarget.style.background = "#1A7A42")
                }
              >
                Next
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            ) : (
              <button
                type="button"
                onClick={dismiss}
                className="flex items-center gap-1 px-3 py-1.5 rounded-[8px] text-[12px] font-bold text-white transition-all"
                style={{ background: "#1A7A42" }}
                onMouseOver={(e) =>
                  (e.currentTarget.style.background = "#239452")
                }
                onMouseOut={(e) =>
                  (e.currentTarget.style.background = "#1A7A42")
                }
              >
                Got it! 🎉
              </button>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
