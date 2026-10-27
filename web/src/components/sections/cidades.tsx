import { useImoveis } from "@/hooks/use-imoveis";
import { CIDADES_ATENDIDAS } from "@/lib/cidades";
import { normalizar } from "@/lib/utils";

export function Cidades() {
  const { imoveis } = useImoveis();
  const daCidade = (cidade: string) => imoveis.filter((i) => normalizar(i.cidade ?? "") === normalizar(cidade));

  return (
    <section className="bg-prata folha pt-[6.5rem] pb-20 md:pt-[8.5rem] md:pb-24" id="cidades">
      <div className="mx-auto max-w-6xl px-4 md:px-6">
        <h2 className="font-display font-semibold text-3xl text-fundo-marca tracking-tight md:text-4xl">
          Onde atendemos
        </h2>
        <ul className="mt-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
          {CIDADES_ATENDIDAS.map((cidade) => {
            const lista = daCidade(cidade);
            const n = lista.length;
            // foto de um empreendimento da própria cidade
            const foto = (lista.find((i) => i.origem === "habitnet" && i.imagem) ?? lista.find((i) => i.imagem))?.imagem;
            return (
              <li key={cidade}>
                <a
                  className="group relative block aspect-[4/5] overflow-hidden rounded-xl bg-marca ring-gold ring-offset-2 ring-offset-prata transition hover:ring-2"
                  href={n ? `/catalogo?cidade=${encodeURIComponent(cidade)}` : "#contato"}
                >
                  {foto && (
                    <img
                      alt=""
                      className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                      decoding="async"
                      loading="lazy"
                      src={foto}
                    />
                  )}
                  <span className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/15 to-transparent" />
                  <span className="absolute inset-x-0 bottom-0 p-4 md:p-5">
                    <span className="block font-display font-semibold text-2xl text-white md:text-3xl">{cidade}</span>
                    <span className="mt-0.5 block text-gold text-sm">
                      {n ? `${n} ${n === 1 ? "imóvel" : "imóveis"}` : "Consulte opções"}
                    </span>
                  </span>
                </a>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
