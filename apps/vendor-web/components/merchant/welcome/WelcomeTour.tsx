"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, ArrowLeft, X, Check } from "lucide-react";
import { ROUTES } from "@/lib/config/routes";

// ─── Tour slides ──────────────────────────────────────────────────────────────

const SLIDES = [
  {
    emoji: "🎉",
    title: "You're in!",
    description:
      "Your GoMarket vendor account is ready. Let's take a quick look at what makes selling on GoMarket effortless.",
    bg: "rgba(26,122,66,0.09)",
    accent: "#1A7A42",
  },
  {
    emoji: "🏪",
    title: "Your store, your brand",
    description:
      "Create a beautiful storefront in minutes. Customise your logo, colours, and layout — no code needed. Customers shop at your own URL.",
    bg: "rgba(59,130,246,0.09)",
    accent: "#3b82f6",
  },
  {
    emoji: "📦",
    title: "Products made simple",
    description:
      "Add products with photos, variants, and pricing. Organise with categories and collections. Bulk import from a spreadsheet in seconds.",
    bg: "rgba(245,158,11,0.09)",
    accent: "#f59e0b",
  },
  {
    emoji: "📊",
    title: "Orders & insights",
    description:
      "Track every order in real time. See who's buying, what's popular, and how your revenue is growing — all from one dashboard.",
    bg: "rgba(139,92,246,0.09)",
    accent: "#8b5cf6",
  },
  {
    emoji: "🚀",
    title: "Ready to launch!",
    description:
      "Choose a plan that fits your business — start free, upgrade anytime. Your first store is just 2 minutes away.",
    bg: "rgba(236,72,153,0.09)",
    accent: "#ec4899",
  },
] as const;

// ─── Canvas confetti (no external dependency) ─────────────────────────────────

function useConfetti() {
  useEffect(() => {
    const canvas = document.createElement("canvas");
    Object.assign(canvas.style, {
      position: "fixed",
      top: "0",
      left: "0",
      width: "100%",
      height: "100%",
      pointerEvents: "none",
      zIndex: "10000",
    });
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    document.body.appendChild(canvas);

    const ctx = canvas.getContext("2d")!;
    const COLORS = [
      "#1A7A42",
      "#f59e0b",
      "#ef4444",
      "#3b82f6",
      "#8b5cf6",
      "#ec4899",
      "#10b981",
      "#f97316",
    ];

    const particles = Array.from({ length: 150 }, () => ({
      x: Math.random() * canvas.width,
      y: -30 - Math.random() * 140,
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
      vx: (Math.random() - 0.5) * 4.5,
      vy: 1.8 + Math.random() * 4,
      va: (Math.random() - 0.5) * 0.14,
      angle: Math.random() * Math.PI * 2,
      w: 7 + Math.random() * 7,
      h: 4 + Math.random() * 5,
      isRect: Math.random() > 0.38,
    }));

    let raf: number;
    let alive = true;

    function draw() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      let any = false;

      for (const p of particles) {
        p.x += p.vx;
        p.y += p.vy;
        p.angle += p.va;
        p.vy += 0.07;

        if (p.y < canvas.height + 40) any = true;

        const alpha = Math.max(0, 1 - p.y / (canvas.height * 1.05));
        ctx.save();
        ctx.globalAlpha = alpha;
        ctx.translate(p.x, p.y);
        ctx.rotate(p.angle);
        ctx.fillStyle = p.color;
        if (p.isRect) {
          ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
        } else {
          ctx.beginPath();
          ctx.arc(0, 0, p.h / 2, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.restore();
      }

      if (any && alive) {
        raf = requestAnimationFrame(draw);
      } else {
        canvas.remove();
      }
    }

    draw();

    return () => {
      alive = false;
      cancelAnimationFrame(raf);
      canvas.remove();
    };
  }, []);
}

// ─── WelcomeTour ─────────────────────────────────────────────────────────────

export function WelcomeTour() {
  const router = useRouter();
  const [slide, setSlide] = useState(0);
  const [animClass, setAnimClass] = useState("");
  const transitioning = useRef(false);
  useConfetti();

  const total = SLIDES.length;
  const current = SLIDES[slide];
  const isLast = slide === total - 1;

  function goTo(next: number, dir: "left" | "right") {
    if (transitioning.current) return;
    transitioning.current = true;
    setAnimClass(dir === "right" ? "slide-out-left" : "slide-out-right");
    setTimeout(() => {
      setSlide(next);
      setAnimClass(dir === "right" ? "slide-in-right" : "slide-in-left");
      setTimeout(() => {
        setAnimClass("");
        transitioning.current = false;
      }, 220);
    }, 160);
  }

  function proceed() {
    router.push(ROUTES.ONBOARDING.PLANS);
  }

  return (
    <>
      <style>{`
        @keyframes slideInRight  { from { opacity:0; transform:translateX(48px); } to { opacity:1; transform:none; } }
        @keyframes slideInLeft   { from { opacity:0; transform:translateX(-48px); } to { opacity:1; transform:none; } }
        @keyframes slideOutLeft  { from { opacity:1; transform:none; } to { opacity:0; transform:translateX(-48px); } }
        @keyframes slideOutRight { from { opacity:1; transform:none; } to { opacity:0; transform:translateX(48px); } }
        .slide-in-right  { animation: slideInRight  0.22s ease both; }
        .slide-in-left   { animation: slideInLeft   0.22s ease both; }
        .slide-out-left  { animation: slideOutLeft  0.16s ease both; }
        .slide-out-right { animation: slideOutRight 0.16s ease both; }
      `}</style>

      <div className="w-full min-h-[calc(100vh-56px)] flex items-center justify-center px-4 py-10">
        <div
          className="relative w-full max-w-[440px] rounded-[24px] overflow-hidden"
          style={{
            background: "#ffffff",
            boxShadow: "0 8px 40px rgba(0,0,0,0.1)",
          }}
        >
          {/* Skip */}
          <button
            type="button"
            onClick={proceed}
            className="absolute top-4 right-4 z-10 flex items-center gap-1 px-3 py-1.5 rounded-full text-[12px] font-semibold transition-colors hover:bg-slate-100"
            style={{ color: "#9ca3af" }}
          >
            Skip <X className="w-3.5 h-3.5" />
          </button>

          {/* Slide content */}
          <div
            className={`px-8 pt-14 pb-6 text-center min-h-[260px] flex flex-col items-center justify-center ${animClass}`}
          >
            <div
              className="w-20 h-20 rounded-[22px] flex items-center justify-center mx-auto mb-6 text-4xl select-none"
              style={{ background: current.bg }}
            >
              {current.emoji}
            </div>

            <h2
              className="text-[23px] font-extrabold mb-3 leading-tight"
              style={{ color: "#1C1C1C", letterSpacing: "-0.4px" }}
            >
              {current.title}
            </h2>

            <p
              className="text-[14px] leading-relaxed max-w-[340px]"
              style={{ color: "#4b5563" }}
            >
              {current.description}
            </p>
          </div>

          {/* Progress dots */}
          <div className="flex justify-center gap-2 pb-4">
            {SLIDES.map((_, i) => (
              <button
                key={i}
                type="button"
                onClick={() => {
                  if (i !== slide) goTo(i, i > slide ? "right" : "left");
                }}
                aria-label={`Go to slide ${i + 1}`}
                className="rounded-full"
                style={{
                  width: i === slide ? 24 : 7,
                  height: 7,
                  background: i === slide ? "#0A2E1A" : "#e2e8f0",
                  transition: "width 0.25s, background 0.25s",
                }}
              />
            ))}
          </div>

          {/* Nav */}
          <div
            className="flex items-center justify-between px-8 py-5 border-t"
            style={{ borderColor: "#f1f5f9" }}
          >
            <button
              type="button"
              onClick={() => goTo(slide - 1, "left")}
              disabled={slide === 0}
              className="flex items-center gap-1.5 px-4 py-2 rounded-[10px] text-[13px] font-semibold transition-all disabled:opacity-0 disabled:pointer-events-none"
              style={{
                color: "#6b7280",
                background: "#f8fafc",
                border: "1px solid #e2e8f0",
              }}
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              Back
            </button>

            {isLast ? (
              <button
                type="button"
                onClick={proceed}
                className="flex items-center gap-2 px-6 py-2.5 rounded-[10px] text-white text-[13px] font-bold transition-all active:scale-[0.97]"
                style={{
                  background: "#0A2E1A",
                  boxShadow: "0 4px 16px rgba(26,122,66,0.32)",
                }}
                onMouseOver={(e) =>
                  (e.currentTarget.style.background = "#239452")
                }
                onMouseOut={(e) =>
                  (e.currentTarget.style.background = "#0A2E1A")
                }
              >
                <Check className="w-4 h-4" />
                Set up my store
              </button>
            ) : (
              <button
                type="button"
                onClick={() => goTo(slide + 1, "right")}
                className="flex items-center gap-2 px-6 py-2.5 rounded-[10px] text-white text-[13px] font-bold transition-all active:scale-[0.97]"
                style={{
                  background: "#0A2E1A",
                  boxShadow: "0 4px 16px rgba(26,122,66,0.32)",
                }}
                onMouseOver={(e) =>
                  (e.currentTarget.style.background = "#0A2E1A")
                }
                onMouseOut={(e) =>
                  (e.currentTarget.style.background = "#0A2E1A")
                }
              >
                Next <ArrowRight className="w-4 h-4" />
              </button>
            )}
          </div>

          <p
            className="text-center text-[11px] pb-4"
            style={{ color: "#c4c8d0" }}
          >
            {slide + 1} of {total}
          </p>
        </div>
      </div>
    </>
  );
}
