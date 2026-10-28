import { useEffect, useRef } from "react";
import { movimentoReduzido } from "@/lib/utils";

// O elemento anda mais devagar (fator > 0) ou mais depressa (fator < 0) que a rolagem
export function useParallax<T extends HTMLElement>(fator: number) {
  const ref = useRef<T>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || movimentoReduzido()) return;
    let quadro = 0;
    const atualizar = () => {
      quadro = 0;
      const r = el.getBoundingClientRect();
      const deslocamento = r.top + r.height / 2 - window.innerHeight / 2;
      el.style.transform = `translate3d(0, ${(-deslocamento * fator).toFixed(1)}px, 0)`;
    };
    const aoRolar = () => {
      if (!quadro) quadro = requestAnimationFrame(atualizar);
    };
    atualizar();
    window.addEventListener("scroll", aoRolar, { passive: true });
    window.addEventListener("resize", aoRolar);
    return () => {
      window.removeEventListener("scroll", aoRolar);
      window.removeEventListener("resize", aoRolar);
      if (quadro) cancelAnimationFrame(quadro);
    };
  }, [fator]);

  return ref;
}
