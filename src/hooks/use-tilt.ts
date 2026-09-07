import { gsap } from "gsap";
import { useEffect, useRef } from "react";

// Tilt 3D + glow que segue o mouse (GSAP quickTo). Passe `scale: false` quando
// o elemento já tiver sua própria animação de escala (ex: scroll scrub), pra
// evitar as duas tweens brigando pela mesma propriedade.
export function useTilt<T extends HTMLElement>(
  max = 10,
  { scale = true }: { scale?: boolean } = {}
) {
  const ref = useRef<T>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const setRotateX = gsap.quickTo(el, "rotateX", {
      duration: 0.4,
      ease: "power2.out",
    });
    const setRotateY = gsap.quickTo(el, "rotateY", {
      duration: 0.4,
      ease: "power2.out",
    });
    const setScale = scale
      ? gsap.quickTo(el, "scale", { duration: 0.4, ease: "power2.out" })
      : null;

    function onMove(e: MouseEvent) {
      const rect = el!.getBoundingClientRect();
      const px = (e.clientX - rect.left) / rect.width - 0.5;
      const py = (e.clientY - rect.top) / rect.height - 0.5;
      setRotateY(px * max * 2);
      setRotateX(-py * max * 2);
    }
    function onEnter() {
      setScale?.(1.03);
    }
    function onLeave() {
      setRotateX(0);
      setRotateY(0);
      setScale?.(1);
    }

    el.addEventListener("mousemove", onMove);
    el.addEventListener("mouseenter", onEnter);
    el.addEventListener("mouseleave", onLeave);

    return () => {
      el.removeEventListener("mousemove", onMove);
      el.removeEventListener("mouseenter", onEnter);
      el.removeEventListener("mouseleave", onLeave);
    };
  }, [max, scale]);

  return ref;
}
