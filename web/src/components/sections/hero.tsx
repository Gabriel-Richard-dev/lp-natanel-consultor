import { ChevronLeft, ChevronRight, Search } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { ImovelDialog } from "@/components/sections/imovel-dialog";
import { TextoBrilhante } from "@/components/ui/texto-brilhante";
import { useImoveis } from "@/hooks/use-imoveis";
import { useParallax } from "@/hooks/use-parallax";
import type { Imovel } from "@/lib/api";
import { CIDADES_ATENDIDAS } from "@/lib/cidades";
import { FASES, grupoDaFase } from "@/lib/fase";
import { escolherFotos } from "@/lib/fotos-hero";
import { navegar } from "@/lib/rota";
import { cn, movimentoReduzido } from "@/lib/utils";

const TROCA_MS = 7000;

export function Hero() {
  const { imoveis, carregando } = useImoveis();
  const [busca, setBusca] = useState("");
  const [atual, setAtual] = useState(0);
  const [pausado, setPausado] = useState(false);
  const [aberto, setAberto] = useState<Imovel | null>(null);
  const arco = useParallax<HTMLDivElement>(0.07);
  const toque = useRef<number | null>(null);

  const fotos = useMemo(() => escolherFotos(imoveis), [imoveis]);
  const indice = fotos.length ? atual % fotos.length : 0;
  const destaque = fotos[indice];
  const ir = (i: number) => setAtual((i + fotos.length) % fotos.length);

  // cada troca reinicia o relógio; para com o mouse no cartão, com o diálogo aberto e com "reduzir movimento"
  useEffect(() => {
    if (fotos.length < 2 || pausado || aberto || movimentoReduzido()) return;
    const id = setTimeout(() => setAtual((n) => n + 1), TROCA_MS);
    return () => clearTimeout(id);
  }, [atual, fotos.length, pausado, aberto]);

  // sugestões do campo de busca: cidades, construtoras e bairros que existem nos dados
  const sugestoes = useMemo(
    () =>
      [...new Set([...CIDADES_ATENDIDAS, ...imoveis.flatMap((i) => [i.construtora, i.bairro])])]
        .filter((s): s is string => !!s)
        .sort((a, b) => a.localeCompare(b, "pt-BR")),
    [imoveis]
  );
  const porFase = FASES.map((f) => ({ ...f, n: imoveis.filter((i) => grupoDaFase(i.fase) === f.valor).length }));

  function buscar(e: React.FormEvent) {
    e.preventDefault();
    const termo = busca.trim();
    navegar(`/catalogo${termo ? `?q=${encodeURIComponent(termo)}` : ""}`);
  }

  return (
    <section className="relative isolate overflow-hidden bg-fundo-marca" id="top">
      <div aria-hidden="true" className="planta -z-10 absolute inset-0" />
      <div aria-hidden="true" className="-z-10 absolute -top-40 -right-40 h-[38rem] w-[38rem] rounded-full bg-gold/10 blur-3xl" />

      <div className="mx-auto grid max-w-6xl items-center gap-14 px-4 pt-28 pb-14 md:px-6 lg:grid-cols-[1.15fr_0.85fr] lg:gap-10 lg:pt-36 lg:pb-20">
        <div>
          <h1 className="text-balance font-display font-semibold text-5xl text-white leading-[1.02] tracking-tight sm:text-6xl">
            Encontre o seu <TextoBrilhante>lar</TextoBrilhante> em Fortaleza e região
          </h1>
          <p className="mt-6 max-w-lg text-lg text-white/75 leading-relaxed">
            Lançamentos, imóveis em obras e prontos para morar. A Alves Costa acompanha você até a entrega das chaves.
          </p>

          <form aria-label="Buscar imóveis" className="mt-9 max-w-xl" onSubmit={buscar}>
            <div className="flex items-center gap-2 rounded-2xl border border-white/15 bg-marca p-2 transition-colors focus-within:border-gold focus-within:ring-2 focus-within:ring-gold/25">
              <Search aria-hidden="true" className="ml-3 h-5 w-5 shrink-0 text-gold" />
              <input
                aria-label="Buscar por bairro, cidade ou construtora"
                autoComplete="off"
                className="h-12 min-w-0 flex-1 bg-transparent px-2 text-base text-white outline-none placeholder:text-white/45"
                list="sugestoes-busca"
                onChange={(e) => setBusca(e.target.value)}
                placeholder="Bairro ou cidade"
                type="search"
                value={busca}
              />
              <button
                className="h-12 shrink-0 rounded-xl bg-gold px-6 font-semibold text-black transition-colors hover:bg-gold-claro"
                type="submit"
              >
                Buscar
              </button>
            </div>
            <datalist id="sugestoes-busca">
              {sugestoes.map((s) => (
                <option key={s} value={s} />
              ))}
            </datalist>
          </form>

          <ul className="mt-5 flex flex-wrap gap-2">
            {porFase.map((f) => (
              <li key={f.valor}>
                <a
                  className="flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-4 py-2 text-sm text-white/85 transition-colors hover:border-gold hover:text-gold"
                  href={`/catalogo?fase=${f.valor}`}
                >
                  {f.label}
                  {!carregando && <span className="font-semibold text-gold tabular-nums">{f.n}</span>}
                </a>
              </li>
            ))}
            <li>
              <a
                className="flex items-center rounded-full px-3 py-2 text-sm text-white/65 underline-offset-4 transition-colors hover:text-gold hover:underline"
                href="/catalogo"
              >
                {carregando ? "Ver todos" : `Ver todos os ${imoveis.length}`}
              </a>
            </li>
          </ul>
        </div>

        {/* janela em arco: a foto aparece inteira, com a etiqueta do empreendimento pendurada */}
        <div className="mx-auto w-full max-w-sm pb-10 lg:max-w-none lg:pb-0" ref={arco}>
          <div
            className="relative aspect-[7/8] touch-pan-y"
            onPointerCancel={() => {
              toque.current = null;
            }}
            onPointerDown={(e) => {
              toque.current = e.clientX;
            }}
            onPointerUp={(e) => {
              if (toque.current === null || fotos.length < 2) return;
              const dx = e.clientX - toque.current;
              toque.current = null;
              if (Math.abs(dx) > 50) ir(indice + (dx < 0 ? 1 : -1));
            }}
          >
            <div
              aria-hidden="true"
              className="absolute inset-0 translate-x-3 translate-y-3 rounded-t-[999px] rounded-b-2xl border border-gold/50"
            />
            <div className="relative h-full overflow-hidden rounded-t-[999px] rounded-b-2xl bg-marca">
              {fotos.map((f, i) => {
                const ativa = i === indice;
                return (
                  <img
                    alt=""
                    aria-hidden="true"
                    className={cn(
                      "absolute inset-0 h-full w-full select-none object-cover transition-[opacity,transform] ease-out",
                      ativa ? "scale-100 opacity-100" : "scale-110 opacity-0"
                    )}
                    draggable={false}
                    fetchPriority={i === 0 ? "high" : "low"}
                    key={f.id}
                    src={f.imagem ?? ""}
                    // entra com a imagem assentando devagar (zoom suave); sai só desvanecendo
                    style={{ transitionDuration: ativa ? "1600ms, 9000ms" : "1600ms, 1600ms" }}
                  />
                );
              })}
            </div>

            {fotos.length > 1 && (
              <>
                <button
                  aria-label="Foto anterior"
                  className="absolute top-1/2 left-3 hidden h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-white/25 bg-fundo-marca/55 text-white backdrop-blur transition-colors hover:border-gold hover:text-gold md:flex"
                  onClick={() => ir(indice - 1)}
                  type="button"
                >
                  <ChevronLeft className="h-5 w-5" />
                </button>
                <button
                  aria-label="Próxima foto"
                  className="absolute top-1/2 right-3 hidden h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-white/25 bg-fundo-marca/55 text-white backdrop-blur transition-colors hover:border-gold hover:text-gold md:flex"
                  onClick={() => ir(indice + 1)}
                  type="button"
                >
                  <ChevronRight className="h-5 w-5" />
                </button>
              </>
            )}

            {destaque && (
              <div
                className="absolute bottom-4 -left-2 w-60 rounded-xl bg-gold p-4 text-black shadow-2xl shadow-black/50 sm:-left-6 sm:w-64"
                onBlur={() => setPausado(false)}
                onFocus={() => setPausado(true)}
                onMouseEnter={() => setPausado(true)}
                onMouseLeave={() => setPausado(false)}
              >
                <span
                  aria-hidden="true"
                  className="absolute top-3 right-3 h-3 w-3 rounded-full bg-fundo-marca shadow-[inset_0_1px_2px_rgb(0_0_0/0.6)]"
                />
                <div className="fade-in slide-in-from-bottom-2 animate-in duration-500" key={destaque.id}>
                  <p className="pr-6 font-medium text-black/70 text-sm">
                    {[destaque.construtora, destaque.fase].filter(Boolean).join(", ")}
                  </p>
                  <p className="mt-0.5 font-display font-semibold text-xl leading-snug">{destaque.titulo}</p>
                  <p className="text-black/70 text-sm">{[destaque.bairro, destaque.cidade].filter(Boolean).join(", ")}</p>
                </div>
                <div className="mt-3 flex items-center justify-between gap-3">
                  <button
                    className="font-semibold text-sm underline underline-offset-4"
                    onClick={() => setAberto(destaque)}
                    type="button"
                  >
                    Ver detalhes
                  </button>
                  {fotos.length > 1 && (
                    <div aria-label="Escolher foto" className="flex items-center gap-1.5" role="group">
                      {fotos.map((f, i) => (
                        <button
                          aria-label={`Foto ${i + 1}: ${f.titulo}`}
                          aria-pressed={i === indice}
                          className={cn(
                            "relative h-2 overflow-hidden rounded-full transition-all",
                            i === indice ? "w-8 bg-black/25" : "w-2 bg-black/30 hover:bg-black/55"
                          )}
                          key={f.id}
                          onClick={() => ir(i)}
                          type="button"
                        >
                          {i === indice && (
                            // barra que enche até a próxima troca; some enquanto pausado
                            <span
                              className={cn(
                                "absolute inset-0 origin-left rounded-full bg-black",
                                pausado || movimentoReduzido() ? "" : "animate-progresso"
                              )}
                              key={`${atual}-${pausado}`}
                              style={{ animationDuration: `${TROCA_MS}ms` }}
                            />
                          )}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
          {destaque && <p className="mt-6 text-white/45 text-xs lg:mt-5">Imagem ilustrativa</p>}
        </div>
      </div>
      {aberto && <ImovelDialog imovel={aberto} onFechar={() => setAberto(null)} />}
    </section>
  );
}
