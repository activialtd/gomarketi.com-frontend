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

    let ctx: gsap.Context | undefined;

    // rAF defers GSAP past React's hydration consistency check so the
    // "from" inline styles (opacity:0, transform) are never seen by React.
    const rafId = requestAnimationFrame(() => {
      ctx = gsap.context(() => {
        gsap.fromTo(
          el,
          { opacity: 0, y: 18 },
          {
            opacity: 1,
            y: 0,
            duration: 0.45,
            ease: "power3.out",
            clearProps: "transform,opacity",
          }
        );

        const targets = el.querySelectorAll("[data-animate]");
        if (targets.length > 0) {
          gsap.fromTo(
            targets,
            { opacity: 0, y: 24, scale: 0.97 },
            {
              opacity: 1,
              y: 0,
              scale: 1,
              duration: 0.4,
              stagger: 0.07,
              ease: "power2.out",
              delay: 0.15,
              clearProps: "transform,opacity,scale",
            }
          );
        }
      }, el);
    });

    return () => {
      cancelAnimationFrame(rafId);
      ctx?.revert();
    };
  }, []);

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
}
