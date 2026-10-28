import { useEffect, useRef, useState } from "react";
import { movimentoReduzido } from "@/lib/utils";

// true quando o elemento entra na tela (uma vez só); com "reduzir movimento" já nasce true
export function useVisivel<T extends Element>(margem = "0px 0px -12% 0px") {
  const ref = useRef<T>(null);
  const [visivel, setVisivel] = useState(movimentoReduzido);

  useEffect(() => {
    const el = ref.current;
    if (visivel || !el) return;
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          setVisivel(true);
          io.disconnect();
        }
      },
      { rootMargin: margem }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [visivel, margem]);

  return [ref, visivel] as const;
}
