import { ArrowUpRight, Building2, Pencil, Plus, Search, Trash2 } from "lucide-react";
import { useState } from "react";
import { type Imovel, removerImovel } from "@/lib/api";
import { formatPreco } from "@/lib/contato";
import { cn, mensagemDe, normalizar } from "@/lib/utils";
import { botaoPrimario, Cabecalho, cartao, inputCls, type Painel } from "./ui";

type Filtro = "todos" | "manual" | "chaves_na_mao";

const plural = (n: number, palavra: string) => `${n} ${palavra}${n === 1 ? "" : "s"}`;

function detalhes(i: Imovel) {
  return [
    i.quartos ? plural(i.quartos, "quarto") : null,
    i.banheiros ? plural(i.banheiros, "banheiro") : null,
    i.area,
  ]
    .filter(Boolean)
    .join(" · ");
}

function Linha({
  imovel,
  confirmando,
  onPedirExclusao,
  onCancelar,
  onExcluir,
}: {
  imovel: Imovel;
  confirmando: boolean;
  onPedirExclusao: () => void;
  onCancelar: () => void;
  onExcluir: () => void;
}) {
  const manual = imovel.origem === "manual";
  const local = [imovel.bairro, imovel.cidade].filter(Boolean).join(", ");
  const info = [local, detalhes(imovel)].filter(Boolean).join(" · ");

  return (
    <li className={cn("flex items-center gap-4 px-4 py-3 md:px-5", confirmando && "bg-red-50")}>
      <div className="flex h-12 w-16 shrink-0 items-center justify-center overflow-hidden rounded bg-papel md:h-14 md:w-20">
        {imovel.imagem ? (
          <img alt="" className="h-full w-full object-cover" loading="lazy" src={imovel.imagem} />
        ) : (
          <Building2 className="h-5 w-5 text-apagado/40" />
        )}
      </div>

      <div className="min-w-0 flex-1">
        <p className="line-clamp-2 text-sm sm:line-clamp-1">{imovel.titulo}</p>
        {info && <p className="truncate text-apagado text-xs">{info}</p>}
        <p className="mt-0.5 text-sm tabular-nums sm:hidden">{formatPreco(imovel.preco)}</p>
      </div>

      <p className={cn("hidden w-28 shrink-0 text-xs md:block", manual ? "text-ouro-texto" : "text-apagado")}>
        {manual ? "Seu cadastro" : "Chaves na Mão"}
      </p>
      <p className="hidden w-28 shrink-0 text-right text-sm tabular-nums sm:block">
        {formatPreco(imovel.preco)}
      </p>

      <div className="flex shrink-0 items-center justify-end gap-1 sm:w-28">
        {confirmando ? (
          <>
            <button
              className="rounded-md bg-red-700 px-2.5 py-1.5 font-medium text-white text-xs hover:bg-red-800"
              onClick={onExcluir}
              type="button"
            >
              Excluir
            </button>
            <button
              className="rounded-md px-2 py-1.5 text-apagado text-xs hover:text-tinta"
              onClick={onCancelar}
              type="button"
            >
              Não
            </button>
          </>
        ) : manual ? (
          <>
            <a
              aria-label={`Editar ${imovel.titulo}`}
              className="rounded-md p-2 text-sm hover:bg-papel sm:px-2.5 sm:py-1.5"
              href={`/admin/imoveis/${imovel.id}`}
            >
              <Pencil className="h-4 w-4 sm:hidden" />
              <span className="hidden sm:inline">Editar</span>
            </a>
            <button
              aria-label={`Excluir ${imovel.titulo}`}
              className="rounded-md p-2 text-apagado hover:bg-red-50 hover:text-red-700"
              onClick={onPedirExclusao}
              type="button"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </>
        ) : (
          imovel.url && (
            <a
              aria-label="Ver anúncio no Chaves na Mão"
              className="inline-flex items-center gap-0.5 rounded-md p-2 text-apagado text-sm hover:bg-papel hover:text-tinta sm:px-2.5 sm:py-1.5"
              href={imovel.url}
              rel="noreferrer"
              target="_blank"
            >
              <span className="hidden sm:inline">Anúncio</span> <ArrowUpRight className="h-4 w-4 sm:h-3.5 sm:w-3.5" />
            </a>
          )
        )}
      </div>
    </li>
  );
}

export function ListaImoveis({ painel }: { painel: Painel }) {
  const { imoveis, recarregar, avisar } = painel;
  const [busca, setBusca] = useState("");
  const [filtro, setFiltro] = useState<Filtro>("todos");
  const [confirmando, setConfirmando] = useState<string | null>(null);

  async function excluir(imovel: Imovel) {
    setConfirmando(null);
    try {
      await removerImovel(imovel.id);
      await recarregar();
      avisar(`"${imovel.titulo}" saiu do site`);
    } catch (err) {
      avisar(mensagemDe(err, "erro ao excluir"), true);
    }
  }

  const lista = imoveis ?? [];
  const totalManual = lista.filter((i) => i.origem === "manual").length;
  const termo = normalizar(busca.trim());
  const visiveis = lista.filter(
    (i) =>
      (filtro === "todos" || i.origem === filtro) &&
      (!termo || [i.titulo, i.bairro, i.cidade].some((c) => c && normalizar(c).includes(termo)))
  );

  const filtros: { valor: Filtro; label: string; total: number }[] = [
    { valor: "todos", label: "Todos", total: lista.length },
    { valor: "manual", label: "Seus cadastros", total: totalManual },
    { valor: "chaves_na_mao", label: "Chaves na Mão", total: lista.length - totalManual },
  ];

  return (
    <div className="space-y-6">
      <Cabecalho titulo="Imóveis">
        <a className={botaoPrimario} href="/admin/novo">
          <Plus className="h-4 w-4" /> Novo imóvel
        </a>
      </Cabecalho>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div className="-mb-px flex gap-5 overflow-x-auto">
          {filtros.map((f) => (
            <button
              className={cn(
                "whitespace-nowrap border-b-2 pb-2 text-sm transition",
                filtro === f.valor
                  ? "border-ouro font-medium text-tinta"
                  : "border-transparent text-apagado hover:text-tinta"
              )}
              key={f.valor}
              onClick={() => setFiltro(f.valor)}
              type="button"
            >
              {f.label} <span className="text-apagado tabular-nums">{f.total}</span>
            </button>
          ))}
        </div>
        <div className="relative sm:w-64">
          <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-apagado" />
          <input
            aria-label="Buscar imóveis"
            className={cn(inputCls, "pl-9")}
            onChange={(e) => setBusca(e.target.value)}
            placeholder="Buscar título ou bairro"
            value={busca}
          />
        </div>
      </div>

      <div className={cartao}>
        {imoveis === null ? (
          <ul className="divide-y divide-linha">
            {Array.from({ length: 5 }, (_, i) => (
              <li className="flex items-center gap-4 px-5 py-3" key={i}>
                <div className="h-14 w-20 animate-pulse rounded bg-papel" />
                <div className="h-3 w-1/2 animate-pulse rounded bg-papel" />
              </li>
            ))}
          </ul>
        ) : visiveis.length ? (
          <ul className="divide-y divide-linha">
            {visiveis.map((imovel) => (
              <Linha
                confirmando={confirmando === imovel.id}
                imovel={imovel}
                key={imovel.id}
                onCancelar={() => setConfirmando(null)}
                onExcluir={() => excluir(imovel)}
                onPedirExclusao={() => setConfirmando(imovel.id)}
              />
            ))}
          </ul>
        ) : (
          <p className="px-5 py-12 text-center text-apagado text-sm">
            {termo || filtro !== "todos" ? "Nada encontrado com essa busca." : "Nenhum imóvel ainda."}
          </p>
        )}
      </div>
    </div>
  );
}
