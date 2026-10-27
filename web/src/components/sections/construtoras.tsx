import { useImoveis } from "@/hooks/use-imoveis";
import { CONSTRUTORAS } from "@/lib/construtoras";

export function Construtoras() {
  const { imoveis } = useImoveis();
  // quem tem mais empreendimentos vem primeiro; sem dados ainda, mostra a lista completa
  const lista = CONSTRUTORAS.map((nome) => ({ nome, n: imoveis.filter((i) => i.construtora === nome).length }))
    .filter((c) => !imoveis.length || c.n > 0)
    .sort((a, b) => b.n - a.n);

  return (
    <section aria-label="Construtoras" className="folha bg-fundo-marca pt-[6.5rem] pb-20 md:pt-[8.5rem] md:pb-24">
      <div className="mx-auto max-w-6xl px-4 md:px-6">
        <h2 className="max-w-2xl font-display font-semibold text-3xl text-white tracking-tight md:text-4xl">
          Empreendimentos de {lista.length} construtoras
        </h2>
        <p className="mt-3 max-w-xl text-white/65 leading-relaxed">Escolha uma e veja só os empreendimentos dela.</p>
        <ul className="mt-8 flex flex-wrap gap-3">
          {lista.map(({ nome, n }) => (
            <li key={nome}>
              <a
                className="group flex items-center gap-3 rounded-full border border-white/15 bg-white/5 py-3 pr-3 pl-6 font-display font-medium text-lg text-white transition-colors hover:border-gold hover:bg-gold/10"
                href={`/catalogo?construtora=${encodeURIComponent(nome)}`}
              >
                {nome}
                {n > 0 && (
                  <span className="rounded-full bg-gold px-2.5 py-0.5 font-semibold text-black text-sm tabular-nums">{n}</span>
                )}
              </a>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
