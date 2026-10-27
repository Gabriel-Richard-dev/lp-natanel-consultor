import logo from "@/assets/logo/logo-alves-costa.webp";
import { useImoveis } from "@/hooks/use-imoveis";
import { CIDADES_ATENDIDAS } from "@/lib/cidades";

export function Sobre() {
  const { imoveis } = useImoveis();
  const construtoras = new Set(imoveis.map((i) => i.construtora).filter(Boolean));

  const numeros = [
    { rotulo: "empreendimentos no ar", valor: imoveis.length },
    { rotulo: "construtoras", valor: construtoras.size },
    { rotulo: "cidades atendidas", valor: CIDADES_ATENDIDAS.length },
  ];

  return (
    <section className="bg-nanquim py-20 text-cal md:py-24" id="sobre">
      <div className="mx-auto grid max-w-6xl items-center gap-12 px-4 md:px-6 lg:grid-cols-[1fr_1.2fr]">
        <img alt="Alves Costa: a chave da felicidade é sonhar" className="w-full max-w-sm" loading="lazy" src={logo} />
        <div>
          <h2 className="font-display font-semibold text-3xl tracking-tight md:text-4xl">
            Uma busca tranquila, com transparência do início ao fim
          </h2>
          <p className="mt-5 max-w-xl text-cal/75 leading-relaxed">
            Na Alves Costa, procurar um novo lar não precisa ser cansativo. Conhecemos a fundo o mercado da região
            metropolitana de Fortaleza e ajudamos cada cliente a escolher bem, seja para morar ou para investir.
          </p>
          {imoveis.length > 0 && (
            <dl className="mt-10 grid grid-cols-3 gap-6 border-cal/15 border-t pt-8">
              {numeros.map((n) => (
                <div className="flex flex-col-reverse justify-end" key={n.rotulo}>
                  <dt className="mt-1 text-cal/70 text-sm">{n.rotulo}</dt>
                  <dd className="font-display font-semibold text-4xl text-dourado tabular-nums">{n.valor}</dd>
                </div>
              ))}
            </dl>
          )}
        </div>
      </div>
    </section>
  );
}
