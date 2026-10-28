import { ContaAte } from "@/components/ui/conta-ate";
import { useImoveis } from "@/hooks/use-imoveis";
import { CIDADES_ATENDIDAS } from "@/lib/cidades";

export function FaixaNumeros() {
  const { imoveis } = useImoveis();
  const construtoras = new Set(imoveis.map((i) => i.construtora).filter(Boolean)).size;

  const itens: { alvo?: number; texto?: string; rotulo: string }[] = [
    { alvo: imoveis.length, rotulo: "empreendimentos disponíveis" },
    { alvo: construtoras, rotulo: "construtoras" },
    { alvo: CIDADES_ATENDIDAS.length, rotulo: "cidades atendidas" },
    { texto: "Grátis", rotulo: "atendimento e simulação" },
  ];

  return (
    <section aria-label="Alves Costa em números" className="border-white/10 border-t bg-preto">
      <dl className="mx-auto grid max-w-6xl grid-cols-2 gap-y-8 px-4 pt-10 pb-16 md:grid-cols-4 md:px-6 md:pb-20">
        {itens.map((n, i) => (
          <div className={`flex flex-col-reverse justify-end md:px-8 ${i ? "md:border-white/10 md:border-l" : "md:pl-0"}`} key={n.rotulo}>
            <dt className="mt-1 text-sm text-white/65">{n.rotulo}</dt>
            <dd className="font-display font-semibold text-4xl text-gold tabular-nums">
              {n.texto ?? (n.alvo ? <ContaAte alvo={n.alvo} key={n.alvo} /> : "…")}
            </dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
