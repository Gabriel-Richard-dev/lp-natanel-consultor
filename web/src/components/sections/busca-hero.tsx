import { Building2, Compass, MapPin, Search } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import type { Imovel } from "@/lib/api";
import { CIDADES_ATENDIDAS } from "@/lib/cidades";
import { CONSTRUTORAS } from "@/lib/construtoras";
import { navegar } from "@/lib/rota";
import { cn, normalizar } from "@/lib/utils";

type Tipo = "cidade" | "construtora" | "bairro";
type Opcao = { id: string; tipo: Tipo; rotulo: string; sub?: string; n: number; href: string };

const GRUPOS: { tipo: Tipo; titulo: string; icone: typeof MapPin; max: number }[] = [
  { tipo: "cidade", titulo: "Cidades", icone: MapPin, max: 4 },
  { tipo: "construtora", titulo: "Construtoras", icone: Building2, max: 4 },
  { tipo: "bairro", titulo: "Bairros", icone: Compass, max: 6 },
];

const enc = encodeURIComponent;

// índice de tudo o que dá para buscar, com quantos imóveis cada item tem
function montarOpcoes(imoveis: Imovel[]): Opcao[] {
  const contar = <T,>(chave: (i: Imovel) => T | null) => {
    const mapa = new Map<T, number>();
    for (const i of imoveis) {
      const k = chave(i);
      if (k != null) mapa.set(k, (mapa.get(k) ?? 0) + 1);
    }
    return mapa;
  };
  const porCidade = contar((i) => (i.cidade ? normalizar(i.cidade) : null));
  const porConstrutora = contar((i) => i.construtora);
  const porBairro = contar((i) => (i.bairro ? `${i.bairro}|${i.cidade ?? ""}` : null));

  const cidades: Opcao[] = CIDADES_ATENDIDAS.map((c): Opcao => ({
    id: `cidade-${c}`,
    tipo: "cidade",
    rotulo: c,
    n: porCidade.get(normalizar(c)) ?? 0,
    href: `/catalogo?cidade=${enc(c)}`,
  }));
  const construtoras: Opcao[] = CONSTRUTORAS.map((c): Opcao => ({
    id: `construtora-${c}`,
    tipo: "construtora",
    rotulo: c,
    n: porConstrutora.get(c) ?? 0,
    href: `/catalogo?construtora=${enc(c)}`,
  })).filter((o) => o.n > 0);
  const bairros: Opcao[] = [...porBairro].map(([chave, n]): Opcao => {
    const [bairro, cidade] = chave.split("|");
    return { id: `bairro-${chave}`, tipo: "bairro", rotulo: bairro, sub: cidade || undefined, n, href: `/catalogo?q=${enc(bairro)}` };
  });

  const maisImoveis = (a: Opcao, b: Opcao) => b.n - a.n || a.rotulo.localeCompare(b.rotulo, "pt-BR");
  return [...cidades.sort(maisImoveis), ...construtoras.sort(maisImoveis), ...bairros.sort(maisImoveis)];
}

// destaca o trecho digitado dentro do nome
function Destacar({ texto, termo }: { texto: string; termo: string }) {
  const i = termo ? normalizar(texto).indexOf(normalizar(termo)) : -1;
  if (i < 0) return <>{texto}</>;
  return (
    <>
      {texto.slice(0, i)}
      <strong className="font-semibold text-gold">{texto.slice(i, i + termo.length)}</strong>
      {texto.slice(i + termo.length)}
    </>
  );
}

export function BuscaHero({ imoveis }: { imoveis: Imovel[] }) {
  const [texto, setTexto] = useState("");
  const [aberto, setAberto] = useState(false);
  const [ativo, setAtivo] = useState(-1);
  const raiz = useRef<HTMLFormElement>(null);

  const todas = useMemo(() => montarOpcoes(imoveis), [imoveis]);
  const termo = texto.trim();

  // com texto: o que combina; sem texto: as cidades e as construtoras com mais imóveis
  const opcoes = useMemo(() => {
    const t = normalizar(termo);
    return GRUPOS.flatMap((g) =>
      todas
        .filter((o) => o.tipo === g.tipo && (g.tipo !== "bairro" || t) && (!t || normalizar(o.rotulo).includes(t)))
        .slice(0, g.max)
    );
  }, [todas, termo]);

  // fecha ao clicar fora
  useEffect(() => {
    const fora = (e: MouseEvent) => !raiz.current?.contains(e.target as Node) && setAberto(false);
    document.addEventListener("mousedown", fora);
    return () => document.removeEventListener("mousedown", fora);
  }, []);

  function ir(href: string) {
    setAberto(false);
    navegar(href);
  }

  function enviar(e: React.FormEvent) {
    e.preventDefault();
    if (ativo >= 0 && opcoes[ativo]) return ir(opcoes[ativo].href);
    ir(`/catalogo${termo ? `?q=${enc(termo)}` : ""}`);
  }

  function aoTeclar(e: React.KeyboardEvent) {
    if (e.key === "Escape") return setAberto(false);
    if (e.key !== "ArrowDown" && e.key !== "ArrowUp") return;
    e.preventDefault();
    setAberto(true);
    if (!opcoes.length) return;
    setAtivo((a) => (e.key === "ArrowDown" ? (a + 1) % opcoes.length : (a - 1 + opcoes.length) % opcoes.length));
  }

  const mostrar = aberto && opcoes.length > 0;

  return (
    <form aria-label="Buscar imóveis" className="relative mt-9 max-w-xl" onSubmit={enviar} ref={raiz}>
      <div className="flex items-center gap-2 rounded-2xl border border-white/15 bg-marca p-2 transition-colors focus-within:border-gold focus-within:ring-2 focus-within:ring-gold/25">
        <Search aria-hidden="true" className="ml-3 h-5 w-5 shrink-0 text-gold" />
        <input
          aria-activedescendant={mostrar && ativo >= 0 ? `opcao-${ativo}` : undefined}
          aria-autocomplete="list"
          aria-controls="sugestoes-busca"
          aria-expanded={mostrar}
          aria-label="Buscar por bairro, cidade ou construtora"
          autoComplete="off"
          className="h-12 min-w-0 flex-1 bg-transparent px-2 text-base text-white outline-none placeholder:text-white/45"
          onChange={(e) => {
            setTexto(e.target.value);
            setAberto(true);
            setAtivo(-1);
          }}
          onFocus={() => setAberto(true)}
          onKeyDown={aoTeclar}
          placeholder="Bairro, cidade ou construtora"
          role="combobox"
          type="text"
          value={texto}
        />
        <button
          className="h-12 shrink-0 rounded-xl bg-gold px-6 font-semibold text-black transition-colors hover:bg-gold-claro"
          type="submit"
        >
          Buscar
        </button>
      </div>

      {mostrar && (
        <div
          className="fade-in slide-in-from-top-1 absolute inset-x-0 top-full z-30 mt-2 max-h-[19rem] animate-in overflow-y-auto rounded-2xl border border-white/15 bg-marca p-2 shadow-2xl shadow-black/60 duration-150"
          id="sugestoes-busca"
          role="listbox"
        >
          {opcoes.map((o, i) => {
            const grupo = GRUPOS.find((g) => g.tipo === o.tipo);
            const Icone = grupo?.icone ?? MapPin;
            const primeiroDoGrupo = i === 0 || opcoes[i - 1].tipo !== o.tipo;
            return (
              <div key={o.id}>
                {primeiroDoGrupo && (
                  <p className="px-3 pt-2 pb-1 font-medium text-white/50 text-xs">{grupo?.titulo}</p>
                )}
                <button
                  aria-selected={i === ativo}
                  className={cn(
                    "flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-colors",
                    i === ativo ? "bg-gold/15" : "hover:bg-white/5"
                  )}
                  id={`opcao-${i}`}
                  onClick={() => ir(o.href)}
                  onMouseEnter={() => setAtivo(i)}
                  role="option"
                  tabIndex={-1}
                  type="button"
                >
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white/5 text-gold">
                    <Icone className="h-4 w-4" />
                  </span>
                  <span className="min-w-0 flex-1 truncate text-white">
                    <Destacar termo={termo} texto={o.rotulo} />
                    {o.sub && <span className="ml-2 text-sm text-white/50">{o.sub}</span>}
                  </span>
                  <span className="shrink-0 text-sm text-white/50 tabular-nums">
                    {o.n} {o.n === 1 ? "imóvel" : "imóveis"}
                  </span>
                </button>
              </div>
            );
          })}
        </div>
      )}
    </form>
  );
}
