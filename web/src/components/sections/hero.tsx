import { useEffect, useMemo, useState } from "react";
import { ImovelDialog } from "@/components/sections/imovel-dialog";
import { campo } from "@/components/ui/campo";
import { Chave } from "@/components/ui/chave";
import { useImoveis } from "@/hooks/use-imoveis";
import type { Imovel } from "@/lib/api";
import { CIDADES_ATENDIDAS } from "@/lib/cidades";
import { FASES, grupoDaFase } from "@/lib/fase";
import { navegar } from "@/lib/rota";
import { cn, movimentoReduzido, normalizar } from "@/lib/utils";

const QUARTOS = [1, 2, 3];
const TROCA_MS = 6500;

// Até quatro fotos de empreendimentos diferentes: pronto, lançamento, em obras e Eusébio
function escolherFotos(imoveis: Imovel[]) {
  const com = imoveis.filter((i) => i.imagem && i.origem === "habitnet");
  const em = (cidade: string) => (i: Imovel) => normalizar(i.cidade ?? "") === cidade;
  const escolhas = [
    com.find((i) => grupoDaFase(i.fase) === "pronto"),
    com.find((i) => grupoDaFase(i.fase) === "lancamento"),
    com.find((i) => grupoDaFase(i.fase) === "obras" && em("caucaia")(i)) ?? com.find((i) => grupoDaFase(i.fase) === "obras"),
    com.find(em("eusebio")),
  ].filter((i): i is Imovel => !!i);
  const unicos = [...new Map(escolhas.map((i) => [i.id, i])).values()];
  if (unicos.length) return unicos;
  const qualquer = imoveis.find((i) => i.imagem);
  return qualquer ? [qualquer] : [];
}

export function Hero() {
  const { imoveis, carregando } = useImoveis();
  const [cidade, setCidade] = useState("");
  const [fase, setFase] = useState("");
  const [quartos, setQuartos] = useState(0);
  const [atual, setAtual] = useState(0);
  const [pausado, setPausado] = useState(false);
  const [aberto, setAberto] = useState<Imovel | null>(null);

  const fotos = useMemo(() => escolherFotos(imoveis), [imoveis]);
  const destaque = fotos[atual % Math.max(fotos.length, 1)];

  // a foto troca sozinha; para com o mouse no cartão, com o diálogo aberto e com "reduzir movimento"
  useEffect(() => {
    if (fotos.length < 2 || pausado || aberto || movimentoReduzido()) return;
    const id = setInterval(() => setAtual((n) => (n + 1) % fotos.length), TROCA_MS);
    return () => clearInterval(id);
  }, [fotos.length, pausado, aberto]);

  // mesmo critério do catálogo: cidade igual, fase do grupo, quartos a partir de N
  const encontrados = imoveis.filter(
    (i) =>
      (!cidade || normalizar(i.cidade ?? "") === normalizar(cidade)) &&
      (!fase || grupoDaFase(i.fase) === fase) &&
      (!quartos || (i.quartos ?? 0) >= quartos)
  ).length;

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
      {fotos.map((f, i) => (
        <img
          alt=""
          aria-hidden="true"
          className={cn(
            "absolute inset-0 -z-20 h-full w-full object-cover transition-opacity duration-[1600ms] ease-in-out",
            i === atual % fotos.length ? "opacity-100" : "opacity-0"
          )}
          fetchPriority={i === 0 ? "high" : "low"}
          key={f.id}
          src={f.imagem ?? ""}
        />
      ))}
      {/* escurece da esquerda (texto) para a direita (foto) e por baixo (busca) */}
      <div className="absolute inset-0 -z-10 bg-gradient-to-r from-fundo-marca/95 via-fundo-marca/55 to-transparent" />
      <div className="absolute inset-0 -z-10 bg-gradient-to-t from-fundo-marca/85 via-transparent to-fundo-marca/25" />

      <div className="mx-auto flex min-h-[36rem] max-w-6xl flex-col justify-center px-4 py-16 md:min-h-[44rem] md:px-6 md:py-24">
        <p className="mb-6 flex items-center gap-3 font-medium text-gold">
          <span aria-hidden="true" className="h-px w-8 bg-gold/70 sm:w-12" />
          A chave da felicidade é sonhar
          <Chave className="h-4 w-8" />
        </p>
        <h1 className="max-w-3xl font-display font-semibold text-5xl text-white leading-[1.02] tracking-tight sm:text-6xl md:text-7xl">
          Encontre o seu lar em Fortaleza e região
        </h1>
        <p className="mt-6 max-w-xl text-lg text-white/80 leading-relaxed">
          Lançamentos, imóveis em obras e prontos para morar, com a Alves Costa ao seu lado até a entrega das chaves.
        </p>

        <form
          aria-label="Buscar imóveis"
          className="mt-10 grid max-w-4xl gap-3 rounded-xl border border-white/15 bg-fundo-marca/80 p-4 shadow-2xl shadow-black/40 backdrop-blur-md sm:grid-cols-2 md:grid-cols-[1fr_1fr_0.7fr_auto] md:items-end md:p-5"
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
          <ul className="mt-5 flex flex-wrap gap-x-6 gap-y-2 text-sm text-white/75">
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

      {destaque && (
        <div
          className="absolute right-6 bottom-6 hidden w-72 rounded-xl border border-white/15 bg-fundo-marca/75 p-4 backdrop-blur-md md:block"
          onBlur={() => setPausado(false)}
          onFocus={() => setPausado(true)}
          onMouseEnter={() => setPausado(true)}
          onMouseLeave={() => setPausado(false)}
        >
          <p className="text-gold text-sm">{[destaque.construtora, destaque.fase].filter(Boolean).join(", ")}</p>
          <p className="mt-0.5 font-display font-semibold text-lg text-white leading-snug">{destaque.titulo}</p>
          <p className="text-sm text-white/65">{[destaque.bairro, destaque.cidade].filter(Boolean).join(", ")}</p>
          <div className="mt-3 flex items-center justify-between">
            <button
              className="font-medium text-gold text-sm underline-offset-4 hover:underline"
              onClick={() => setAberto(destaque)}
              type="button"
            >
              Ver detalhes
            </button>
            {fotos.length > 1 && (
              <div className="flex gap-1.5" role="group" aria-label="Escolher foto">
                {fotos.map((f, i) => (
                  <button
                    aria-label={`Foto ${i + 1}: ${f.titulo}`}
                    aria-pressed={i === atual % fotos.length}
                    className={cn(
                      "h-2 rounded-full transition-all",
                      i === atual % fotos.length ? "w-6 bg-gold" : "w-2 bg-white/35 hover:bg-white/60"
                    )}
                    key={f.id}
                    onClick={() => setAtual(i)}
                    type="button"
                  />
                ))}
              </div>
            )}
          </div>
          <p className="mt-3 text-white/45 text-xs">Imagem ilustrativa</p>
        </div>
      )}
      {aberto && <ImovelDialog imovel={aberto} onFechar={() => setAberto(null)} />}
    </section>
  );
}
