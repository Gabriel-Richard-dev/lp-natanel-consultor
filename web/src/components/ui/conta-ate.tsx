import { useEffect, useState } from "react";
import { useVisivel } from "@/hooks/use-visivel";
import { movimentoReduzido } from "@/lib/utils";

// Número que sobe de 0 até o valor quando aparece na tela
export function ContaAte({ alvo, duracao = 1200 }: { alvo: number; duracao?: number }) {
  const [ref, visivel] = useVisivel<HTMLSpanElement>("0px 0px -5% 0px");
  const [valor, setValor] = useState(0);

  useEffect(() => {
    if (!visivel) return;
    if (movimentoReduzido()) return setValor(alvo);
    const inicio = performance.now();
    let quadro = requestAnimationFrame(function passo(agora) {
      const t = Math.min((agora - inicio) / duracao, 1);
      setValor(Math.round(alvo * (1 - (1 - t) ** 3)));
      if (t < 1) quadro = requestAnimationFrame(passo);
    });
    return () => cancelAnimationFrame(quadro);
  }, [visivel, alvo, duracao]);

  return <span ref={ref}>{valor}</span>;
}
