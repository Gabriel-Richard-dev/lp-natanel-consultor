import { ArrowLeft, MessageCircle, Search, SlidersHorizontal } from "lucide-react";
import { useEffect, useState } from "react";
import { campoCompactoClaro } from "@/components/ui/campo";
import { Segmentado } from "@/components/ui/segmentado";
import logo from "@/assets/logo/logo-alves-costa.webp";
import { WhatsappFlutuante } from "@/components/layout/whatsapp-flutuante";
import { ImovelDialog } from "@/components/sections/imovel-dialog";
import { OfertaCard } from "@/components/sections/oferta-card";
import { useImoveis } from "@/hooks/use-imoveis";
import type { Imovel } from "@/lib/api";
import { whatsappLink } from "@/lib/contato";
import { FASES, FASES_FILTRO, type FaseGrupo, grupoDaFase } from "@/lib/fase";
import { cn, normalizar } from "@/lib/utils";

type Ordem = "recentes" | "menor" | "maior";

const QUARTOS_FILTRO = [
  { valor: 0, label: "Quartos" },
  { valor: 1, label: "1+" },
  { valor: 2, label: "2+" },
  { valor: 3, label: "3+" },
];
const POR_PAGINA = 24;

type Filtros = {
  busca: string;
  cidade: string;
  construtora: string;
  quartos: number;
  fase: FaseGrupo | "";
  ordem: Ordem;
};

const VAZIO: Filtros = { busca: "", cidade: "", construtora: "", quartos: 0, fase: "", ordem: "recentes" };

// Os filtros moram na URL (?cidade=Fortaleza&fase=obras): dá para compartilhar o link,
// recarregar a página e voltar do navegador sem perder a busca.
function lerUrl(): Filtros {
  const q = new URLSearchParams(location.search);
  const fase = q.get("fase");
  const ordem = q.get("ordem");
  return {
    busca: q.get("q") ?? "",
    cidade: q.get("cidade") ?? "",
    construtora: q.get("construtora") ?? "",
    quartos: Math.min(Number(q.get("quartos")) || 0, 3),
    fase: FASES.some((f) => f.valor === fase) ? (fase as FaseGrupo) : "",
    ordem: ordem === "menor" || ordem === "maior" ? ordem : "recentes",
  };
}

function paraUrl(f: Filtros) {
  const q = new URLSearchParams();
  if (f.busca) q.set("q", f.busca);
  if (f.cidade) q.set("cidade", f.cidade);
  if (f.construtora) q.set("construtora", f.construtora);
  if (f.quartos) q.set("quartos", String(f.quartos));
  if (f.fase) q.set("fase", f.fase);
  if (f.ordem !== "recentes") q.set("ordem", f.ordem);
  return `${location.pathname}${q.size ? `?${q}` : ""}`;
}


export function Catalogo() {
  const { imoveis, carregando, erro } = useImoveis();
  const [filtros, setFiltros] = useState(lerUrl);
  const [mostrando, setMostrando] = useState(POR_PAGINA);
  const [maisFiltros, setMaisFiltros] = useState(false);
  const [aberto, setAberto] = useState<Imovel | null>(null);
  const { busca, cidade, construtora, quartos, fase, ordem } = filtros;

  useEffect(() => {
    history.replaceState(null, "", paraUrl(filtros));
  }, [filtros]);

  function mudar(parcial: Partial<Filtros>) {
    setFiltros((f) => ({ ...f, ...parcial }));
    setMostrando(POR_PAGINA);
  }

  const cidades = [...new Set(imoveis.map((i) => i.cidade).filter((c): c is string => !!c))].sort();
  const construtoras = [...new Set(imoveis.map((i) => i.construtora).filter((c): c is string => !!c))].sort();
  const termo = normalizar(busca.trim());
  const visiveis = imoveis.filter(
    (i) =>
      (!cidade || i.cidade === cidade) &&
      (!construtora || i.construtora === construtora) &&
      (!fase || grupoDaFase(i.fase) === fase) &&
      (i.quartos ?? 0) >= quartos &&
      (!termo || [i.titulo, i.bairro, i.cidade, i.construtora].some((c) => c && normalizar(c).includes(termo)))
  );
  if (ordem !== "recentes") {
    // sem preço (empreendimentos do portal) vai sempre para o fim
    const valor = (i: Imovel, vazio: number) => i.preco ?? vazio;
    visiveis.sort((a, b) =>
      ordem === "menor" ? valor(a, Infinity) - valor(b, Infinity) : valor(b, -1) - valor(a, -1)
    );
  }
  const filtrando = !!(termo || cidade || construtora || fase || quartos);
  const extrasAtivos = [cidade, construtora, quartos, ordem !== "recentes"].filter(Boolean).length;
  const pagina = visiveis.slice(0, mostrando);

  function limpar() {
    setFiltros(VAZIO);
    setMostrando(POR_PAGINA);
  }

  return (
    <main className="min-h-screen bg-prata font-corpo text-fundo-marca">
      <header>
        <div className="bg-fundo-marca">
          <div className="mx-auto flex h-20 max-w-6xl items-center justify-between px-4 md:px-6">
            <a href="/">
              <img alt="Alves Costa" className="h-14 w-auto" src={logo} />
            </a>
            <a className="flex items-center gap-1.5 font-medium text-sm text-white/70 hover:text-gold" href="/">
              <ArrowLeft className="h-4 w-4" />
              Voltar para o site
            </a>
          </div>
        </div>
        <div className="mx-auto max-w-6xl px-4 pt-12 pb-10 md:px-6 md:pt-16 md:pb-12">
          <h1 className="font-display font-semibold text-3xl text-fundo-marca tracking-tight md:text-5xl">
            Catálogo de imóveis
          </h1>
          <p className="mt-3 max-w-xl text-fundo-marca/70">
            {carregando
              ? "Carregando imóveis…"
              : `${imoveis.length} imóveis em Fortaleza e região, com acompanhamento da Alves Costa até a entrega das chaves.`}
          </p>
        </div>
      </header>

      <div className="border-black/10 border-b bg-prata/95 backdrop-blur md:sticky md:top-0 md:z-20">
        <div className="mx-auto max-w-6xl space-y-3 px-4 py-4 md:px-6">
          <div className="grid gap-3 md:grid-cols-[1fr_14rem]">
            <div className="relative">
              <Search className="absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-fundo-marca/55" />
              <input
                aria-label="Buscar por bairro, nome ou construtora"
                className={cn(campoCompactoClaro, "w-full pl-10")}
                onChange={(e) => mudar({ busca: e.target.value })}
                placeholder="Buscar por bairro, nome ou construtora"
                type="search"
                value={busca}
              />
            </div>
            <select
              aria-label="Ordenar"
              className={cn(campoCompactoClaro, "w-full")}
              onChange={(e) => mudar({ ordem: e.target.value as Ordem })}
              value={ordem}
            >
              <option value="recentes">Mais recentes</option>
              <option value="menor">Menor preço</option>
              <option value="maior">Maior preço</option>
            </select>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Segmentado
              claro
              className="w-full md:w-[25rem]"
              onChange={(v) => mudar({ fase: v as FaseGrupo | "" })}
              opcoes={FASES_FILTRO}
              rotulo="Fase do empreendimento"
              valor={fase}
            />

            <button
              aria-expanded={maisFiltros}
              className="flex h-11 w-full items-center justify-center gap-2 rounded-lg border border-black/15 text-sm text-fundo-marca md:hidden"
              onClick={() => setMaisFiltros((v) => !v)}
              type="button"
            >
              <SlidersHorizontal className="h-4 w-4" /> Mais filtros
              {extrasAtivos > 0 && <span className="rounded-full bg-gold px-2 py-0.5 text-black text-xs">{extrasAtivos}</span>}
            </button>

            <div className={cn("w-full grid-cols-2 gap-3", maisFiltros ? "grid" : "hidden", "md:contents")}>
              <select
                aria-label="Cidade"
                className={cn(campoCompactoClaro, "w-full md:w-44")}
                onChange={(e) => mudar({ cidade: e.target.value })}
                value={cidade}
              >
                <option value="">Cidades</option>
                {cidades.map((c) => (
                  <option key={c}>{c}</option>
                ))}
              </select>
              {construtoras.length > 1 && (
                <select
                  aria-label="Construtora"
                  className={cn(campoCompactoClaro, "w-full md:w-48")}
                  onChange={(e) => mudar({ construtora: e.target.value })}
                  value={construtora}
                >
                  <option value="">Construtoras</option>
                  {construtoras.map((c) => (
                    <option key={c}>{c}</option>
                  ))}
                </select>
              )}
              <Segmentado
              claro
                className="col-span-2 md:col-span-1 md:w-64"
                onChange={(v) => mudar({ quartos: v })}
                opcoes={QUARTOS_FILTRO}
                rotulo="Quartos"
                valor={quartos}
              />
            </div>
          </div>
        </div>
      </div>

      <section className="mx-auto max-w-6xl px-4 py-10 md:px-6">
        {!carregando && (
          <div className="mb-6 flex items-center justify-between text-fundo-marca/70 text-sm">
            <p>
              {filtrando ? `${visiveis.length} de ${imoveis.length} imóveis` : `${imoveis.length} imóveis`}
            </p>
            {filtrando && (
              <button className="font-medium text-ouro-texto hover:underline" onClick={limpar} type="button">
                Limpar filtros
              </button>
            )}
          </div>
        )}

        {carregando ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }, (_, i) => (
              <div className="h-96 animate-pulse rounded-lg bg-black/5" key={i} />
            ))}
          </div>
        ) : visiveis.length ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {pagina.map((oferta) => (
              <OfertaCard key={oferta.id} oferta={oferta} onAbrir={setAberto} />
            ))}
          </div>
        ) : (
          <div className="rounded-lg border border-black/10 border-dashed bg-white py-16 text-center">
            <p className="font-display font-semibold text-fundo-marca">{erro ? "Não conseguimos carregar os imóveis agora" : "Nenhum imóvel com esses filtros"}</p>
            <button className="mt-2 text-ouro-texto text-sm hover:underline" onClick={limpar} type="button">
              Limpar filtros
            </button>
          </div>
        )}

        {visiveis.length > pagina.length && (
          <div className="mt-10 text-center">
            <button
              className="rounded-md border-2 border-fundo-marca px-8 py-3 font-semibold text-fundo-marca text-sm transition-colors hover:bg-fundo-marca hover:text-gold"
              onClick={() => setMostrando((n) => n + POR_PAGINA)}
              type="button"
            >
              Mostrar mais ({visiveis.length - pagina.length} restantes)
            </button>
          </div>
        )}

        <div className="mt-16 flex flex-col items-center gap-4 rounded-lg bg-preto px-6 py-10 text-center md:flex-row md:justify-between md:px-10 md:text-left">
          <div>
            <p className="font-display font-semibold text-white text-xl">Não encontrou o que procura?</p>
            <p className="mt-1 text-sm text-white/70">
              Conte o que você precisa e a Alves Costa procura para você.
            </p>
          </div>
          <a
            className="flex shrink-0 items-center gap-2 rounded-md bg-gold px-6 py-3 font-semibold text-black transition hover:brightness-110"
            href={whatsappLink("Olá! Vi o catálogo no site da Alves Costa e estou procurando um imóvel.")}
            rel="noreferrer"
            target="_blank"
          >
            <MessageCircle className="h-4 w-4" />
            Falar com a Alves Costa
          </a>
        </div>
      </section>

      {aberto && <ImovelDialog imovel={aberto} onFechar={() => setAberto(null)} />}
      <WhatsappFlutuante />
    </main>
  );
}
