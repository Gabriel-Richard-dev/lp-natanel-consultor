import { useImoveis } from "@/hooks/use-imoveis";
import { CIDADES_ATENDIDAS } from "@/lib/cidades";
import { normalizar } from "@/lib/utils";

export function Cidades() {
  const { imoveis } = useImoveis();
  const contar = (cidade: string) => imoveis.filter((i) => normalizar(i.cidade ?? "") === normalizar(cidade)).length;

  return (
    <section className="bg-marca py-20 md:py-24" id="cidades">
      <div className="mx-auto max-w-6xl px-4 md:px-6">
        <h2 className="font-display font-semibold text-3xl text-white tracking-tight md:text-4xl">
          Onde atendemos
        </h2>
        <ul className="mt-8 grid gap-px overflow-hidden rounded-lg border border-white/10 bg-white/10 sm:grid-cols-2 lg:grid-cols-4">
          {CIDADES_ATENDIDAS.map((cidade) => {
            const n = contar(cidade);
            return (
              <li className="bg-marca" key={cidade}>
                <a
                  className="group block p-6 transition-colors hover:bg-gold md:p-8"
                  href={n ? `/catalogo?cidade=${encodeURIComponent(cidade)}` : "#contato"}
                >
                  <span className="block font-display font-semibold text-2xl text-white group-hover:text-black md:text-3xl">
                    {cidade}
                  </span>
                  <span className="mt-2 block text-white/65 text-sm group-hover:text-black/70">
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
