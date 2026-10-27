import { useImoveis } from "@/hooks/use-imoveis";
import { CIDADES_ATENDIDAS } from "@/lib/cidades";
import { normalizar } from "@/lib/utils";

export function Cidades() {
  const { imoveis } = useImoveis();
  const contar = (cidade: string) => imoveis.filter((i) => normalizar(i.cidade ?? "") === normalizar(cidade)).length;

  return (
    <section className="bg-white py-20 md:py-24" id="cidades">
      <div className="mx-auto max-w-6xl px-4 md:px-6">
        <h2 className="font-display font-semibold text-3xl text-nanquim tracking-tight md:text-4xl">
          Onde atendemos
        </h2>
        <ul className="mt-8 grid gap-px overflow-hidden rounded-lg border border-concreto bg-concreto sm:grid-cols-2 lg:grid-cols-4">
          {CIDADES_ATENDIDAS.map((cidade) => {
            const n = contar(cidade);
            return (
              <li className="bg-cal" key={cidade}>
                <a
                  className="group block p-6 transition-colors hover:bg-nanquim md:p-8"
                  href={n ? `/catalogo?cidade=${encodeURIComponent(cidade)}` : "#contato"}
                >
                  <span className="block font-display font-semibold text-2xl text-nanquim group-hover:text-cal md:text-3xl">
                    {cidade}
                  </span>
                  <span className="mt-2 block text-nanquim/70 text-sm group-hover:text-dourado">
                    {n ? `${n} ${n === 1 ? "imóvel" : "imóveis"}` : "Consulte opções"}
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
