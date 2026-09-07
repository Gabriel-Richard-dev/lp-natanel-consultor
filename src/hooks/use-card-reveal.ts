import { animate, onScroll, stagger } from "animejs";
import { useEffect, useRef } from "react";

// Entrada diferenciada dos cards de oferta (anime.js) — flip 3D + escala,
// pra não repetir o fade/slide do GSAP usado no resto do site.
export function useCardReveal<T extends HTMLElement>(
  selector: string,
  deps: unknown[] = []
) {
  const ref = useRef<T>(null);

  useEffect(() => {
    const container = ref.current;
    if (!container) return;

    const targets = container.querySelectorAll<HTMLElement>(selector);
    if (targets.length === 0) return;

    for (const el of targets) {
      el.style.opacity = "0";
    }

    const animation = animate(targets, {
      opacity: [0, 1],
      scale: [0.85, 1],
      rotateX: [-25, 0],
      translateY: [40, 0],
      delay: stagger(90),
      duration: 700,
      ease: "outBack",
      autoplay: onScroll({ sync: true }),
    });

    return () => {
      animation.revert();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selector, ...deps]);

  return ref;
}
