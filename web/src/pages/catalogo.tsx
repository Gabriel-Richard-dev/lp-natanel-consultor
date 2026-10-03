import { ArrowLeft, MessageCircle, Search } from "lucide-react";
import { useState } from "react";
import logo from "@/assets/logo/logo-natanael.png";
import { OfertaCard } from "@/components/sections/oferta-card";
import { useImoveis } from "@/hooks/use-imoveis";
import { whatsappLink } from "@/lib/contato";
import { cn, normalizar } from "@/lib/utils";

type Ordem = "recentes" | "menor" | "maior";

const QUARTOS = [0, 1, 2, 3];

const campoCls =
  "rounded-lg border border-border bg-background px-3 py-2.5 text-sm outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/20";

export function Catalogo() {
  const { imoveis, carregando } = useImoveis();
  const [busca, setBusca] = useState("");
  const [cidade, setCidade] = useState("");
  const [quartos, setQuartos] = useState(0);
  const [ordem, setOrdem] = useState<Ordem>("recentes");

  const cidades = [...new Set(imoveis.map((i) => i.cidade).filter((c): c is string => !!c))].sort();
  const termo = normalizar(busca.trim());
  const visiveis = imoveis.filter(
    (i) =>
      (!cidade || i.cidade === cidade) &&
      (i.quartos ?? 0) >= quartos &&
      (!termo || [i.titulo, i.bairro, i.cidade].some((c) => c && normalizar(c).includes(termo)))
  );
  if (ordem !== "recentes") {
    visiveis.sort((a, b) => (ordem === "menor" ? a.preco - b.preco : b.preco - a.preco));
  }
  const filtrando = !!(termo || cidade || quartos);

  function limpar() {
    setBusca("");
    setCidade("");
    setQuartos(0);
  }

  return (
    <main className="min-h-screen bg-neutral-50">
      <header className="bg-[#0b1210]">
        <div className="mx-auto max-w-6xl px-4 pt-6 pb-12 md:px-6 md:pb-16">
          <div className="mb-12 flex items-center justify-between">
            <a href="/">
              <img alt="Natanael Machado" className="h-14 w-auto" src={logo} />
            </a>
            <a
              className="flex items-center gap-1.5 font-medium text-sm text-white/60 hover:text-white"
              href="/"
            >
              <ArrowLeft className="h-4 w-4" />
              Voltar para o site
            </a>
          </div>
          <h1 className="font-bold text-3xl text-white tracking-tight md:text-5xl">
            Catálogo de imóveis
          </h1>
          <p className="mt-3 max-w-xl text-white/60">
            {carregando
              ? "Carregando imóveis…"
              : `${imoveis.length} imóveis disponíveis em Fortaleza e região, todos com acompanhamento do Natanael do início ao fim.`}
          </p>
        </div>
      </header>

      <div className="sticky top-0 z-20 border-border border-b bg-background/95 backdrop-blur">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-3 px-4 py-3 md:px-6">
          <div className="relative min-w-52 flex-1">
            <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              aria-label="Buscar por bairro ou palavra"
              className={cn(campoCls, "w-full pl-9")}
              onChange={(e) => setBusca(e.target.value)}
              placeholder="Buscar por bairro ou palavra"
              value={busca}
            />
          </div>
          <select
            aria-label="Cidade"
            className={campoCls}
            onChange={(e) => setCidade(e.target.value)}
            value={cidade}
          >
            <option value="">Todas as cidades</option>
            {cidades.map((c) => (
              <option key={c}>{c}</option>
            ))}
          </select>
          <div aria-label="Quartos" className="flex rounded-lg border border-border bg-background p-0.5" role="group">
            {QUARTOS.map((q) => (
              <button
                aria-pressed={quartos === q}
                className={cn(
                  "rounded-md px-3 py-2 text-sm transition",
                  quartos === q ? "bg-emerald-600 font-medium text-white" : "text-muted-foreground hover:text-foreground"
                )}
                key={q}
                onClick={() => setQuartos(q)}
                type="button"
              >
                {q === 0 ? "Quartos" : `${q}+`}
              </button>
            ))}
          </div>
          <select
            aria-label="Ordenar"
            className={campoCls}
            onChange={(e) => setOrdem(e.target.value as Ordem)}
            value={ordem}
          >
            <option value="recentes">Mais recentes</option>
            <option value="menor">Menor preço</option>
            <option value="maior">Maior preço</option>
          </select>
        </div>
      </div>

      <section className="mx-auto max-w-6xl px-4 py-10 md:px-6">
        {!carregando && (
          <div className="mb-6 flex items-center justify-between text-muted-foreground text-sm">
            <p>
              {filtrando ? `${visiveis.length} de ${imoveis.length} imóveis` : `${imoveis.length} imóveis`}
            </p>
            {filtrando && (
              <button className="font-medium text-emerald-700 hover:underline" onClick={limpar} type="button">
                Limpar filtros
              </button>
            )}
          </div>
        )}

        {carregando ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }, (_, i) => (
              <div className="h-96 animate-pulse rounded-2xl bg-muted" key={i} />
            ))}
          </div>
        ) : visiveis.length ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {visiveis.map((oferta) => (
              <OfertaCard key={oferta.id} oferta={oferta} />
            ))}
          </div>
        ) : (
          <div className="rounded-2xl border border-border border-dashed bg-background py-16 text-center">
            <p className="font-medium">Nenhum imóvel com esses filtros</p>
            <button className="mt-2 text-emerald-700 text-sm hover:underline" onClick={limpar} type="button">
              Limpar filtros
            </button>
          </div>
        )}

        <div className="mt-16 flex flex-col items-center gap-4 rounded-2xl bg-[#0b1210] px-6 py-10 text-center md:flex-row md:justify-between md:px-10 md:text-left">
          <div>
            <p className="font-semibold text-white text-xl">Não encontrou o que procura?</p>
            <p className="mt-1 text-sm text-white/60">
              Nem todo imóvel está anunciado. Conte o que você precisa que o Natanael busca para você.
            </p>
          </div>
          <a
            className="flex shrink-0 items-center gap-2 rounded-lg bg-emerald-500 px-6 py-3 font-medium text-black transition-colors hover:bg-emerald-400"
            href={whatsappLink("Olá Natanael! Vi o catálogo no seu site e estou procurando um imóvel.")}
            rel="noreferrer"
            target="_blank"
          >
            <MessageCircle className="h-4 w-4" />
            Falar com Natanael
          </a>
        </div>
      </section>
    </main>
  );
}
