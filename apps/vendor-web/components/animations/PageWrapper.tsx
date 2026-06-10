"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";

interface PageWrapperProps {
  children: React.ReactNode;
  className?: string;
}

export function PageWrapper({ children, className = "" }: PageWrapperProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const ctx = gsap.context(() => {
      // Page fade + lift entrance
      gsap.fromTo(
        el,
        { opacity: 0, y: 18 },
        { opacity: 1, y: 0, duration: 0.45, ease: "power3.out" }
      );

      // Stagger all direct stat/card children
      gsap.fromTo(
        el.querySelectorAll("[data-animate]"),
        { opacity: 0, y: 24, scale: 0.97 },
        {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 0.4,
          stagger: 0.07,
          ease: "power2.out",
          delay: 0.15,
        }
      );
    }, el);

    return () => ctx.revert();
  }, []);

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
}
