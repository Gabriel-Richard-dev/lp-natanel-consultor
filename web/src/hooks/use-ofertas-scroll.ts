import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useEffect, useRef } from "react";

gsap.registerPlugin(ScrollTrigger);

// Reveal + parallax das fotos amarrados ao scroll (GSAP scrub) na home.
export function useOfertasScroll<T extends HTMLElement>(deps: unknown[] = []) {
  const ref = useRef<T>(null);

  useEffect(() => {
    const container = ref.current;
    if (!container) return;

    const cards = container.querySelectorAll<HTMLElement>(".oferta-card");

    const ctx = gsap.context(() => {
      for (const [i, card] of cards.entries()) {
        gsap.fromTo(
          card,
          { opacity: 0, y: 90, scale: 0.92, rotate: i % 2 === 0 ? -2.5 : 2.5 },
          {
            opacity: 1,
            y: 0,
            scale: 1,
            rotate: 0,
            ease: "power3.out",
            scrollTrigger: {
              trigger: card,
              start: "top 92%",
              end: "top 55%",
              scrub: 0.6,
            },
          }
        );

        const img = card.querySelector(".oferta-img");
        if (img) {
          gsap.fromTo(
            img,
            { yPercent: -12 },
            {
              yPercent: 12,
              ease: "none",
              scrollTrigger: {
                trigger: card,
                start: "top bottom",
                end: "bottom top",
                scrub: true,
              },
            }
          );
        }
      }
    }, container);

    return () => ctx.revert();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  return ref;
}
