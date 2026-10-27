import { useState } from "react";
import { useImoveis } from "@/hooks/use-imoveis";
import { campo } from "@/components/ui/campo";
import { CIDADES_ATENDIDAS } from "@/lib/cidades";
import { FASES, grupoDaFase } from "@/lib/fase";
import { navegar } from "@/lib/rota";
import { normalizar } from "@/lib/utils";

const QUARTOS = [1, 2, 3];

export function Hero() {
  const { imoveis, carregando } = useImoveis();
  const [cidade, setCidade] = useState("");
  const [fase, setFase] = useState("");
  const [quartos, setQuartos] = useState(0);

  // mesmo critério do catálogo: cidade igual, fase do grupo, quartos a partir de N
  const encontrados = imoveis.filter(
    (i) =>
      (!cidade || normalizar(i.cidade ?? "") === normalizar(cidade)) &&
      (!fase || grupoDaFase(i.fase) === fase) &&
      (!quartos || (i.quartos ?? 0) >= quartos)
  ).length;

  // foto do hero: um empreendimento pronto para morar, com foto; senão qualquer um com foto
  const foto =
    imoveis.find((i) => i.imagem && i.origem === "habitnet" && grupoDaFase(i.fase) === "pronto") ??
    imoveis.find((i) => i.imagem);

  const porFase = FASES.map((f) => ({ ...f, n: imoveis.filter((i) => grupoDaFase(i.fase) === f.valor).length }));

  function buscar(e: React.FormEvent) {
    e.preventDefault();
    const q = new URLSearchParams();
    if (cidade) q.set("cidade", cidade);
    if (fase) q.set("fase", fase);
    if (quartos) q.set("quartos", String(quartos));
    navegar(`/catalogo${q.size ? `?${q}` : ""}`);
  }

  return (
    <section className="relative isolate overflow-hidden bg-fundo-marca" id="top">
      {foto?.imagem && (
        <img
          alt=""
          className="absolute inset-0 -z-20 h-full w-full object-cover"
          fetchPriority="high"
          src={foto.imagem}
        />
      )}
      {/* escurece da esquerda (texto) para a direita (foto) e por baixo (busca) */}
      <div className="absolute inset-0 -z-10 bg-gradient-to-r from-fundo-marca/95 via-fundo-marca/55 to-transparent" />
      <div className="absolute inset-0 -z-10 bg-gradient-to-t from-fundo-marca/80 via-transparent to-fundo-marca/25" />

      <div className="mx-auto flex min-h-[34rem] max-w-6xl flex-col justify-center px-4 py-16 md:min-h-[40rem] md:px-6 md:py-24">
        <h1 className="max-w-2xl font-display font-semibold text-4xl text-white leading-[1.05] tracking-tight sm:text-5xl md:text-6xl">
          Encontre o seu lar em Fortaleza e região
        </h1>
        <p className="mt-5 max-w-xl text-lg text-white/75 leading-relaxed">
          Lançamentos, imóveis em obras e prontos para morar, com a Alves Costa ao seu lado até a entrega das chaves.
        </p>

        <form
          aria-label="Buscar imóveis"
          className="mt-10 grid max-w-4xl gap-3 rounded-xl border border-white/15 bg-fundo-marca/80 p-4 backdrop-blur-md sm:grid-cols-2 md:grid-cols-[1fr_1fr_0.7fr_auto] md:items-end md:p-5"
          onSubmit={buscar}
        >
          <div>
            <label className="mb-1.5 block text-sm text-white/70" htmlFor="busca-cidade">
              Cidade
            </label>
            <select className={campo} id="busca-cidade" onChange={(e) => setCidade(e.target.value)} value={cidade}>
              <option value="">Todas</option>
              {CIDADES_ATENDIDAS.map((c) => (
                <option key={c}>{c}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-1.5 block text-sm text-white/70" htmlFor="busca-fase">
              Fase da obra
            </label>
            <select className={campo} id="busca-fase" onChange={(e) => setFase(e.target.value)} value={fase}>
              <option value="">Todas</option>
              {FASES.map((f) => (
                <option key={f.valor} value={f.valor}>
                  {f.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-1.5 block text-sm text-white/70" htmlFor="busca-quartos">
              Quartos
            </label>
            <select
              className={campo}
              id="busca-quartos"
              onChange={(e) => setQuartos(Number(e.target.value))}
              value={quartos}
            >
              <option value={0}>Qualquer</option>
              {QUARTOS.map((q) => (
                <option key={q} value={q}>
                  {q} ou mais
                </option>
              ))}
            </select>
          </div>
          <button
            className="h-12 rounded-lg bg-gold px-7 font-semibold text-black transition-colors hover:bg-gold-claro sm:col-span-2 md:col-span-1"
            type="submit"
          >
            {carregando ? "Ver imóveis" : `Ver ${encontrados} ${encontrados === 1 ? "imóvel" : "imóveis"}`}
          </button>
        </form>

        {!carregando && (
          <ul className="mt-5 flex flex-wrap gap-x-6 gap-y-2 text-sm text-white/70">
            {porFase.map((f) => (
              <li key={f.valor}>
                <a
                  className="underline-offset-4 transition-colors hover:text-gold hover:underline"
                  href={`/catalogo?fase=${f.valor}`}
                >
                  {f.n} {f.label.toLowerCase()}
                </a>
              </li>
            ))}
          </ul>
        )}
      </div>

      {foto?.imagem && (
        <p className="absolute right-6 bottom-4 hidden text-white/60 text-xs md:block">
          Imagem ilustrativa: {[foto.titulo, foto.construtora].filter(Boolean).join(", ")}
        </p>
      )}
    </section>
  );
}
