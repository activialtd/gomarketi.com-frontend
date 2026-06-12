"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";

export function AuthAnimator({ children }: { children: React.ReactNode }) {
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = panelRef.current;
    if (!el) return;

    let ctx: gsap.Context | undefined;

    const rafId = requestAnimationFrame(() => {
      ctx = gsap.context(() => {
        const left = el.querySelector("[data-auth-left]");
        const right = el.querySelector("[data-auth-right]");
        const logo = el.querySelector("[data-auth-logo]");
        const heading = el.querySelector("[data-auth-heading]");
        const card = el.querySelector("[data-auth-card]");
        const form = el.querySelector("[data-auth-form]");

        const clearAllProps = "transform,opacity,scale";
        const tl = gsap.timeline({ defaults: { ease: "power3.out", clearProps: clearAllProps } });

        if (left) tl.fromTo(left, { x: -60, opacity: 0 }, { x: 0, opacity: 1, duration: 0.6 }, 0);
        if (right) tl.fromTo(right, { x: 40, opacity: 0 }, { x: 0, opacity: 1, duration: 0.55 }, 0.1);
        if (logo) tl.fromTo(logo, { y: -20, opacity: 0 }, { y: 0, opacity: 1, duration: 0.4 }, 0.2);
        if (heading) tl.fromTo(heading, { y: 20, opacity: 0 }, { y: 0, opacity: 1, duration: 0.5 }, 0.3);
        if (card) tl.fromTo(card, { y: 30, opacity: 0, scale: 0.96 }, { y: 0, opacity: 1, scale: 1, duration: 0.5 }, 0.35);
        if (form) tl.fromTo(form, { y: 24, opacity: 0 }, { y: 0, opacity: 1, duration: 0.45 }, 0.25);
      }, el);
    });

    return () => {
      cancelAnimationFrame(rafId);
      ctx?.revert();
    };
  }, []);

  return <div ref={panelRef} className="contents">{children}</div>;
}
