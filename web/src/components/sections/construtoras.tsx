import { Chave } from "@/components/ui/chave";
import { Revelar } from "@/components/ui/revelar";
import { useImoveis } from "@/hooks/use-imoveis";
import { CONSTRUTORAS } from "@/lib/construtoras";

export function Construtoras() {
  const { imoveis } = useImoveis();
  // quem tem mais empreendimentos vem primeiro; sem dados ainda, mostra a lista completa
  const lista = CONSTRUTORAS.map((nome) => ({ nome, n: imoveis.filter((i) => i.construtora === nome).length }))
    .filter((c) => !imoveis.length || c.n > 0)
    .sort((a, b) => b.n - a.n);
  const total = lista.reduce((soma, c) => soma + c.n, 0);

  return (
    <section aria-label="Construtoras" className="folha relative isolate overflow-hidden bg-fundo-marca pt-24 pb-20 md:pt-[7.5rem] md:pb-24">
      <Chave className="-z-10 -rotate-12 pointer-events-none absolute top-16 -right-16 hidden w-[32rem] text-gold/10 md:block" />
      <div className="mx-auto max-w-6xl px-4 md:px-6">
        <Revelar>
          <h2 className="max-w-2xl font-display font-semibold text-3xl text-white tracking-tight md:text-4xl">
            {total ? `${lista.length} construtoras, ${total} empreendimentos` : "Construtoras"}
          </h2>
          <p className="mt-3 max-w-xl text-white/65 leading-relaxed">Escolha uma e veja só os empreendimentos dela.</p>
        </Revelar>
        <ul className="mt-10 grid border-white/10 border-t md:grid-cols-2 md:gap-x-16">
          {lista.map(({ nome, n }, i) => (
            <Revelar as="li" atraso={i * 40} key={nome}>
              <a
                className="group flex items-baseline justify-between gap-4 border-white/10 border-b py-4 transition-colors hover:border-gold"
                href={`/catalogo?construtora=${encodeURIComponent(nome)}`}
              >
                <span className="font-display font-medium text-2xl text-white transition-colors group-hover:text-gold">{nome}</span>
                {n > 0 && (
                  <span className="shrink-0 text-sm text-white/55 tabular-nums">
                    {n} {n === 1 ? "empreendimento" : "empreendimentos"}
                  </span>
                )}
              </a>
            </Revelar>
          ))}
        </ul>
      </div>
    </section>
  );
}
