import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useEffect, useRef } from "react";

gsap.registerPlugin(ScrollTrigger);

export function useScrollReveal<T extends HTMLElement>(
  options: { y?: number; stagger?: number; selector?: string } = {}
) {
  const ref = useRef<T>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const targets = options.selector
      ? el.querySelectorAll(options.selector)
      : el;

    const ctx = gsap.context(() => {
      gsap.from(targets, {
        opacity: 0,
        y: options.y ?? 40,
        duration: 0.8,
        ease: "power3.out",
        stagger: options.stagger ?? 0.1,
        scrollTrigger: {
          trigger: el,
          start: "top 80%",
          once: true,
        },
      });
    }, el);

    return () => ctx.revert();
  }, [options.y, options.stagger, options.selector]);

  return ref;
}
