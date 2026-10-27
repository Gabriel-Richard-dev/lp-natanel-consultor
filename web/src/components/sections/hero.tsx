import { useEffect, useMemo, useState } from "react";
import { ImovelDialog } from "@/components/sections/imovel-dialog";
import { campo } from "@/components/ui/campo";
import { Segmentado } from "@/components/ui/segmentado";
import { useImoveis } from "@/hooks/use-imoveis";
import type { Imovel } from "@/lib/api";
import { CIDADES_ATENDIDAS } from "@/lib/cidades";
import { escolherFotos } from "@/lib/fotos-hero";
import { FASES, FASES_FILTRO, grupoDaFase } from "@/lib/fase";
import { navegar } from "@/lib/rota";
import { cn, movimentoReduzido, normalizar } from "@/lib/utils";

const QUARTOS = [
  { valor: 0, label: "Todos" },
  { valor: 1, label: "1+" },
  { valor: 2, label: "2+" },
  { valor: 3, label: "3+" },
];
const TROCA_MS = 6500;

export function Hero() {
  const { imoveis, carregando } = useImoveis();
  const [cidade, setCidade] = useState("");
  const [fase, setFase] = useState<string>("");
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
      <div aria-hidden="true" className="planta -z-10 absolute inset-0" />
      <div aria-hidden="true" className="-z-10 absolute -top-40 -right-40 h-[38rem] w-[38rem] rounded-full bg-gold/10 blur-3xl" />

      <div className="mx-auto grid max-w-6xl items-center gap-14 px-4 py-14 md:px-6 lg:grid-cols-[1.15fr_0.85fr] lg:gap-10 lg:py-20">
        <div>
          <h1 className="text-balance font-display font-semibold text-5xl text-white leading-[1.02] tracking-tight sm:text-6xl">
            Encontre o seu lar em Fortaleza e região
          </h1>
          <p className="mt-6 max-w-lg text-lg text-white/75 leading-relaxed">
            Lançamentos, imóveis em obras e prontos para morar, com a Alves Costa ao seu lado até a entrega das chaves.
          </p>

          <form aria-label="Buscar imóveis" className="mt-9 space-y-4 rounded-xl border border-white/15 bg-marca p-4 md:p-5" onSubmit={buscar}>
            <div>
              <span className="mb-1.5 block text-sm text-white/70" id="rotulo-fase">
                Fase da obra
              </span>
              <Segmentado
                onChange={(v) => setFase(v)}
                opcoes={FASES_FILTRO}
                rotulo="Fase da obra"
                valor={fase}
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-sm text-white/70" htmlFor="busca-cidade">
                  Cidade
                </label>
                <select className={campo} id="busca-cidade" onChange={(e) => setCidade(e.target.value)} value={cidade}>
                  <option value="">Todas as cidades</option>
                  {CIDADES_ATENDIDAS.map((c) => (
                    <option key={c}>{c}</option>
                  ))}
                </select>
              </div>
              <div>
                <span className="mb-1.5 block text-sm text-white/70">Quartos</span>
                <Segmentado onChange={setQuartos} opcoes={QUARTOS} rotulo="Quartos" valor={quartos} />
              </div>
            </div>
            <button
              className="h-12 w-full rounded-lg bg-gold px-7 font-semibold text-black transition-colors hover:bg-gold-claro"
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

        {/* janela em arco: a foto aparece inteira, sem escurecer, com a etiqueta do empreendimento pendurada */}
        <div className="relative mx-auto w-full max-w-sm pb-10 lg:max-w-none lg:pb-0">
          <div className="relative aspect-[7/8]">
            <div
              aria-hidden="true"
              className="absolute inset-0 translate-x-3 translate-y-3 rounded-t-[999px] rounded-b-2xl border border-gold/50"
            />
            <div className="relative h-full overflow-hidden rounded-t-[999px] rounded-b-2xl bg-marca">
              {fotos.map((f, i) => (
                <img
                  alt=""
                  aria-hidden="true"
                  className={cn(
                    "absolute inset-0 h-full w-full object-cover transition-opacity duration-[1600ms] ease-in-out",
                    i === atual % fotos.length ? "opacity-100" : "opacity-0"
                  )}
                  fetchPriority={i === 0 ? "high" : "low"}
                  key={f.id}
                  src={f.imagem ?? ""}
                />
              ))}
            </div>

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
                <p className="pr-6 font-medium text-black/70 text-sm">
                  {[destaque.construtora, destaque.fase].filter(Boolean).join(", ")}
                </p>
                <p className="mt-0.5 font-display font-semibold text-xl leading-snug">{destaque.titulo}</p>
                <p className="text-black/70 text-sm">{[destaque.bairro, destaque.cidade].filter(Boolean).join(", ")}</p>
                <div className="mt-3 flex items-center justify-between">
                  <button
                    className="font-semibold text-sm underline underline-offset-4"
                    onClick={() => setAberto(destaque)}
                    type="button"
                  >
                    Ver detalhes
                  </button>
                  {fotos.length > 1 && (
                    <div aria-label="Escolher foto" className="flex gap-1.5" role="group">
                      {fotos.map((f, i) => (
                        <button
                          aria-label={`Foto ${i + 1}: ${f.titulo}`}
                          aria-pressed={i === atual % fotos.length}
                          className={cn(
                            "h-2 rounded-full transition-all",
                            i === atual % fotos.length ? "w-6 bg-black" : "w-2 bg-black/30 hover:bg-black/55"
                          )}
                          key={f.id}
                          onClick={() => setAtual(i)}
                          type="button"
                        />
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
