import { useImoveis } from "@/hooks/use-imoveis";
import { CONSTRUTORAS } from "@/lib/construtoras";

export function Construtoras() {
  const { imoveis } = useImoveis();
  // só lista quem tem empreendimento no ar; sem dados ainda, mostra a lista completa
  const ativas = imoveis.length
    ? CONSTRUTORAS.filter((nome) => imoveis.some((i) => i.construtora === nome))
    : CONSTRUTORAS;

  return (
    <section aria-label="Construtoras" className="bg-cal py-20 md:py-24">
      <div className="mx-auto max-w-6xl px-4 md:px-6">
        <h2 className="max-w-2xl font-display font-semibold text-3xl text-nanquim tracking-tight md:text-4xl">
          Empreendimentos de {ativas.length} construtoras
        </h2>
        <p className="mt-6 max-w-4xl font-display font-medium text-2xl text-nanquim/90 leading-[1.5] md:text-3xl md:leading-[1.5]">
          {ativas.map((nome, i) => (
            <span key={nome}>
              <a
                className="underline decoration-2 decoration-concreto underline-offset-[6px] transition-colors hover:text-mar hover:decoration-mar"
                href={`/catalogo?construtora=${encodeURIComponent(nome)}`}
              >
                {nome}
              </a>
              {i < ativas.length - 2 ? ", " : i === ativas.length - 2 ? " e " : "."}
            </span>
          ))}
        </p>
      </div>
    </section>
  );
}
