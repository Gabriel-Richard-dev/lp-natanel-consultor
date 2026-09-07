import { gsap } from "gsap";
import { useEffect } from "react";
import type { RefObject } from "react";

// Estilo "Focus Cards": ao passar o mouse num item, os outros escurecem e
// desfocam pra chamar atenção pro que está em foco.
export function useFocusList<T extends HTMLElement>(
  ref: RefObject<T | null>,
  selector: string,
  deps: unknown[] = []
) {
  useEffect(() => {
    const container = ref.current;
    if (!container) return;

    const items = Array.from(
      container.querySelectorAll<HTMLElement>(selector)
    );
    if (items.length < 2) return;

    function focus(target: HTMLElement) {
      for (const item of items) {
        gsap.to(item, {
          opacity: item === target ? 1 : 0.35,
          filter: item === target ? "blur(0px)" : "blur(2px)",
          duration: 0.4,
          ease: "power2.out",
        });
      }
    }
    function reset() {
      for (const item of items) {
        gsap.to(item, {
          opacity: 1,
          filter: "blur(0px)",
          duration: 0.4,
          ease: "power2.out",
        });
      }
    }

    const listeners = items.map((item) => {
      const onEnter = () => focus(item);
      item.addEventListener("mouseenter", onEnter);
      return () => item.removeEventListener("mouseenter", onEnter);
    });
    container.addEventListener("mouseleave", reset);

    return () => {
      for (const off of listeners) off();
      container.removeEventListener("mouseleave", reset);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selector, ...deps]);
}
