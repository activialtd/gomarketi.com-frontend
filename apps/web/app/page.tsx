"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";
import gsap from "gsap";

/* ─── Cartoon SVG shapes ────────────────────────────────────────────────────── */

function Bag() {
  return (
    <svg viewBox="0 0 56 60" fill="none" className="w-full h-full">
      <rect x="6" y="18" width="44" height="36" rx="8" fill="#1a7a42" opacity="0.9" />
      <path d="M19 18v-4a9 9 0 0118 0v4" stroke="#1a7a42" strokeWidth="3.5" strokeLinecap="round" fill="none" />
      <circle cx="22" cy="34" r="2.5" fill="white" opacity="0.7" />
      <circle cx="34" cy="34" r="2.5" fill="white" opacity="0.7" />
      <path d="M22 42c2 2.5 10 2.5 12 0" stroke="white" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

function Coin() {
  return (
    <svg viewBox="0 0 52 52" fill="none" className="w-full h-full">
      <circle cx="26" cy="26" r="24" fill="#22c55e" />
      <circle cx="26" cy="26" r="18" fill="#16a34a" />
      <text x="26" y="32" textAnchor="middle" fill="white" fontSize="18" fontWeight="800">₦</text>
    </svg>
  );
}

function Star() {
  return (
    <svg viewBox="0 0 44 44" fill="none" className="w-full h-full">
      <path d="M22 4l4.5 13H41l-11 8 4.2 13L22 31l-12.2 7 4.2-13L3 17h14.5z" fill="#86efac" />
    </svg>
  );
}

function Sparkle() {
  return (
    <svg viewBox="0 0 40 40" fill="none" className="w-full h-full">
      <path d="M20 2v36M2 20h36M6 6l28 28M34 6L6 34" stroke="#bbf7d0" strokeWidth="2.5" strokeLinecap="round" />
    </svg>
  );
}

function PriceTag() {
  return (
    <svg viewBox="0 0 52 52" fill="none" className="w-full h-full">
      <path d="M4 4h20l24 24-20 20L4 24V4z" fill="#1a7a42" opacity="0.85" />
      <circle cx="15" cy="15" r="3" fill="white" />
    </svg>
  );
}

/* ─── Floaty wrapper ────────────────────────────────────────────────────────── */

type FloatyProps = { size: string; style: CSSProperties; children: React.ReactNode };
function Floaty({ size, style, children }: FloatyProps) {
  return (
    <span
      data-float="1"
      className={`absolute ${size} opacity-0 pointer-events-none`}
      style={style}
    >
      {children}
    </span>
  );
}

/* ─── Page ──────────────────────────────────────────────────────────────────── */

export default function ComingSoon() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const sceneRef = useRef<HTMLDivElement>(null);
  const headlineRef = useRef<HTMLHeadingElement>(null);
  const subRef = useRef<HTMLParagraphElement>(null);
  const badgeRef = useRef<HTMLDivElement>(null);
  const formRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = sceneRef.current;
    if (!el) return;

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: "back.out(1.4)" } });

      tl.fromTo(badgeRef.current, { y: -30, opacity: 0, scale: 0.7 }, { y: 0, opacity: 1, scale: 1, duration: 0.5 })
        .fromTo(headlineRef.current, { y: 50, opacity: 0 }, { y: 0, opacity: 1, duration: 0.6, ease: "power3.out" }, "-=0.2")
        .fromTo(subRef.current, { y: 28, opacity: 0 }, { y: 0, opacity: 1, duration: 0.5, ease: "power2.out" }, "-=0.25")
        .fromTo(formRef.current, { y: 36, opacity: 0, scale: 0.93 }, { y: 0, opacity: 1, scale: 1, duration: 0.55 }, "-=0.2");

      /* floating cartoon elements */
      const floaties = el.querySelectorAll<HTMLElement>("[data-float]");
      floaties.forEach((f, i) => {
        const amp = 10 + (i % 3) * 7;
        const dur = 2.6 + i * 0.45;

        gsap.fromTo(
          f,
          { opacity: 0, scale: 0, rotation: (i % 2 === 0 ? 15 : -15) },
          { opacity: 1, scale: 1, rotation: 0, duration: 0.55, ease: "back.out(2.2)", delay: 0.6 + i * 0.12 }
        );
        gsap.to(f, { y: -amp, duration: dur, yoyo: true, repeat: -1, ease: "sine.inOut", delay: 0.9 + i * 0.2 });
        gsap.to(f, {
          rotation: (i % 2 === 0 ? 1 : -1) * (6 + i * 1.5),
          duration: dur * 1.3,
          yoyo: true,
          repeat: -1,
          ease: "sine.inOut",
          delay: 0.7 + i * 0.15,
        });
      });

      /* pulse the live dot */
      gsap.to("[data-pulse]", { scale: 1.7, opacity: 0.45, duration: 0.75, yoyo: true, repeat: -1, ease: "sine.inOut" });

      /* squiggle underline draw */
      const line = el.querySelector<SVGPathElement>("[data-underline]");
      if (line) {
        const len = line.getTotalLength?.() ?? 180;
        gsap.set(line, { strokeDasharray: len, strokeDashoffset: len });
        gsap.to(line, { strokeDashoffset: 0, duration: 0.9, ease: "power2.inOut", delay: 0.6 });
      }
    }, el);

    return () => ctx.revert();
  }, []);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email) return;
    gsap.to(formRef.current, {
      scale: 0.95,
      duration: 0.1,
      yoyo: true,
      repeat: 1,
      ease: "power1.inOut",
      onComplete: () => setSubmitted(true),
    });
  }

  return (
    <main ref={sceneRef} className="min-h-screen bg-white flex flex-col overflow-hidden">

      {/* ── Background decoration ───────────────────────────────────────────── */}
      <div aria-hidden className="pointer-events-none fixed inset-0 overflow-hidden" style={{ zIndex: 0 }}>
        <div className="absolute -top-32 -right-32 w-[480px] h-[480px] rounded-full" style={{ background: "radial-gradient(circle, rgba(34,197,94,0.07) 0%, transparent 70%)" }} />
        <div className="absolute -bottom-24 -left-24 w-[360px] h-[360px] rounded-full" style={{ background: "radial-gradient(circle, rgba(26,122,66,0.06) 0%, transparent 70%)" }} />
      </div>

      {/* ── Cartoon floaties ────────────────────────────────────────────────── */}
      <div aria-hidden className="pointer-events-none fixed inset-0 overflow-hidden" style={{ zIndex: 1 }}>
        <Floaty size="w-14 h-14" style={{ top: "13%", left: "6%" }}><Bag /></Floaty>
        <Floaty size="w-11 h-11" style={{ top: "21%", right: "8%" }}><Coin /></Floaty>
        <Floaty size="w-10 h-10" style={{ top: "54%", left: "4%" }}><Star /></Floaty>
        <Floaty size="w-11 h-11" style={{ top: "63%", right: "6%" }}><PriceTag /></Floaty>
        <Floaty size="w-9 h-9"  style={{ top: "8%",  right: "22%" }}><Sparkle /></Floaty>
        <Floaty size="w-8 h-8"  style={{ top: "41%", right: "14%" }}><Coin /></Floaty>
        <Floaty size="w-12 h-12" style={{ bottom: "16%", left: "10%" }}><Star /></Floaty>
        <Floaty size="w-10 h-10" style={{ bottom: "13%", right: "9%" }}><Bag /></Floaty>
        <Floaty size="w-8 h-8"  style={{ top: "36%", left: "17%" }}><Sparkle /></Floaty>
      </div>

      {/* ── Nav ─────────────────────────────────────────────────────────────── */}
      <nav className="relative px-6 py-5 flex items-center max-w-5xl mx-auto w-full" style={{ zIndex: 10 }}>
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-[#1a7a42] flex items-center justify-center shadow-md">
            <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5" stroke="white" strokeWidth={2.2}>
              <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M3 6h18" strokeLinecap="round" />
              <path d="M16 10a4 4 0 01-8 0" strokeLinecap="round" />
            </svg>
          </div>
          <span className="text-[#1c1c1c] font-extrabold text-lg tracking-tight">GoMarketi</span>
        </div>
      </nav>

      {/* ── Hero ─────────────────────────────────────────────────────────────── */}
      <section className="relative flex-1 flex flex-col items-center justify-center px-6 py-20 text-center" style={{ zIndex: 10 }}>

        <div ref={badgeRef} className="inline-flex items-center gap-2 bg-[#f0faf3] text-[#1a7a42] text-xs font-bold px-4 py-2 rounded-full mb-8 border border-[#22c55e]/30 shadow-sm opacity-0">
          <span data-pulse className="w-2 h-2 rounded-full bg-[#22c55e] inline-block" />
          Something big is coming to Africa
        </div>

        <h1 ref={headlineRef} className="text-5xl sm:text-6xl md:text-7xl font-extrabold text-[#1c1c1c] leading-[1.1] tracking-tight max-w-3xl opacity-0">
          Africa&apos;s{" "}
          <span className="text-[#1a7a42] relative inline-block">
            Commerce
            <svg
              className="absolute left-0 w-full"
              style={{ bottom: -4, height: 10 }}
              viewBox="0 0 300 10"
              fill="none"
              preserveAspectRatio="none"
            >
              <path
                data-underline
                d="M2 7 Q75 2 150 6 Q225 10 298 4"
                stroke="#22c55e"
                strokeWidth="3.5"
                strokeLinecap="round"
                fill="none"
              />
            </svg>
          </span>{" "}
          Platform
        </h1>

        <p ref={subRef} className="mt-8 text-lg sm:text-xl text-gray-500 max-w-lg leading-relaxed opacity-0">
          We&apos;re building the infrastructure that empowers African vendors
          to sell, grow, and thrive — online and offline.
        </p>

        <div ref={formRef} className="mt-10 w-full max-w-md opacity-0">
          {submitted ? (
            <div className="flex items-center justify-center gap-3 bg-[#f0faf3] border border-[#22c55e]/40 rounded-2xl px-6 py-5 shadow-sm">
              <div className="w-9 h-9 rounded-full bg-[#1a7a42] flex items-center justify-center flex-shrink-0 shadow">
                <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5" stroke="white" strokeWidth={2.5}>
                  <polyline points="20,6 9,17 4,12" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              <p className="text-[#1a7a42] font-bold text-sm">
                You&apos;re on the list! We&apos;ll reach out when we launch.
              </p>
            </div>
          ) : (
            <>
              <form
                onSubmit={handleSubmit}
                className="flex gap-2 shadow-lg rounded-xl overflow-hidden border border-gray-200"
                style={{ boxShadow: "0 8px 32px rgba(26,122,66,0.10)" }}
              >
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email address"
                  className="flex-1 px-4 py-3.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#1a7a42]/25 focus:border-[#1a7a42] transition"
                />
                <button
                  type="submit"
                  className="px-5 py-3.5 bg-[#1a7a42] text-white text-sm font-bold hover:bg-[#239452] active:scale-95 transition-all whitespace-nowrap"
                >
                  Join Waitlist
                </button>
              </form>
              <p className="mt-3 text-xs text-gray-400">No spam. Only launch news.</p>
            </>
          )}
        </div>
      </section>

      {/* ── Footer ───────────────────────────────────────────────────────────── */}
      <footer className="relative px-6 py-6 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-3 max-w-5xl mx-auto w-full" style={{ zIndex: 10 }}>
        <p className="text-xs text-gray-400">
          © {new Date().getFullYear()} GoMarketi. All rights reserved.
        </p>
        <a href="mailto:hello@gomarketi.com" className="text-xs text-gray-400 hover:text-[#1a7a42] transition-colors">
          hello@gomarketi.com
        </a>
      </footer>
    </main>
  );
}
