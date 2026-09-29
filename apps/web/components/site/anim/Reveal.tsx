"use client";

import { useEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

/**
 * Scroll animation layer for the marketing pages.
 *
 * Mount this once per page. It finds every element marked `data-reveal` and
 * animates it in as it enters the viewport, so individual sections stay plain
 * server-rendered markup with no animation code of their own.
 *
 * Variants, set with `data-reveal="..."`:
 *   up      (default) rises and fades in
 *   left    slides in from the left
 *   right   slides in from the right
 *   scale   settles in from slightly small
 *   lines   staggers the element's direct children, for headlines and lists
 *
 * `data-reveal-delay` adds seconds of delay.
 *
 * Nothing here runs when the visitor prefers reduced motion — the markup is
 * already in its final state, and `globals.css` only hides reveal targets
 * once `gsap-ready` is on <html>, so content is never stranded invisible if
 * JavaScript fails to load.
 */
export function Reveal() {
  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) return;

    gsap.registerPlugin(ScrollTrigger);
    document.documentElement.classList.add("gsap-ready");

    const ctx = gsap.context(() => {
      const targets = gsap.utils.toArray<HTMLElement>("[data-reveal]");

      targets.forEach((el) => {
        const variant = el.dataset.reveal || "up";
        const delay = Number(el.dataset.revealDelay ?? 0);
        const common = {
          scrollTrigger: { trigger: el, start: "top 85%", once: true },
          duration: 0.9,
          delay,
          ease: "power3.out",
        };

        if (variant === "lines") {
          gsap.set(el, { opacity: 1 });
          gsap.from(Array.from(el.children), {
            ...common,
            opacity: 0,
            yPercent: 60,
            stagger: 0.09,
          });
          return;
        }

        const from: gsap.TweenVars = { opacity: 0 };
        if (variant === "left") from.x = -48;
        else if (variant === "right") from.x = 48;
        else if (variant === "scale") from.scale = 0.94;
        else from.y = 34;

        gsap.fromTo(el, from, { ...common, opacity: 1, x: 0, y: 0, scale: 1 });
      });

      // Parallax for anything marked `data-parallax`, where the value is how
      // far the element drifts (in pixels) across its own scroll span.
      gsap.utils.toArray<HTMLElement>("[data-parallax]").forEach((el) => {
        const distance = Number(el.dataset.parallax || 60);
        gsap.to(el, {
          y: distance,
          ease: "none",
          scrollTrigger: {
            trigger: el,
            start: "top bottom",
            end: "bottom top",
            scrub: true,
          },
        });
      });
    });

    return () => {
      ctx.revert();
      document.documentElement.classList.remove("gsap-ready");
    };
  }, []);

  return null;
}
