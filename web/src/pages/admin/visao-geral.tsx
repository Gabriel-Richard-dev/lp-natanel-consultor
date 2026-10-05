import { Building2, Plus, RefreshCw } from "lucide-react";
import { useState } from "react";
import { sincronizarChavesNaMao } from "@/lib/api";
import { formatPreco } from "@/lib/contato";
import { cn, mensagemDe } from "@/lib/utils";
import { botaoPrimario, botaoSecundario, Cabecalho, cartao, type Painel } from "./ui";

const hoje = () =>
  new Intl.DateTimeFormat("pt-BR", { weekday: "long", day: "numeric", month: "long" }).format(new Date());

const saudacao = () => {
  const hora = new Date().getHours();
  return hora < 12 ? "Bom dia" : hora < 18 ? "Boa tarde" : "Boa noite";
};

const precoCurto = (valor: number) =>
  new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    notation: "compact",
    maximumFractionDigits: 0,
  }).format(valor);

function tempoDesde(iso: string) {
  const min = Math.round((Date.now() - new Date(iso).getTime()) / 60_000);
  const rtf = new Intl.RelativeTimeFormat("pt-BR", { numeric: "auto" });
  if (min < 1) return "agora mesmo";
  if (min < 60) return rtf.format(-min, "minute");
  if (min < 60 * 24) return rtf.format(-Math.round(min / 60), "hour");
  return rtf.format(-Math.round(min / (60 * 24)), "day");
}

export function VisaoGeral({ painel }: { painel: Painel }) {
  const { imoveis, recarregar, avisar } = painel;
  const [sincronizando, setSincronizando] = useState(false);

  const lista = imoveis ?? [];
  const proprios = lista.filter((i) => i.origem === "manual");
  const doPortal = lista.filter((i) => i.origem === "chaves_na_mao");
  const ultimaSync = doPortal.reduce<string | null>(
    (max, i) => (!max || i.atualizado_em > max ? i.atualizado_em : max),
    null
  );
  const precoMedio = lista.length ? lista.reduce((s, i) => s + i.preco, 0) / lista.length : 0;
  const numeros = [
    { label: "No site", valor: lista.length },
    { label: "Cadastrados por você", valor: proprios.length },
    { label: "Vindos do Chaves na Mão", valor: doPortal.length },
    { label: "Preço médio", valor: precoCurto(precoMedio) },
  ];

  async function sincronizar() {
    setSincronizando(true);
    try {
      const { total } = await sincronizarChavesNaMao();
      await recarregar();
      avisar(`${total} anúncios atualizados do Chaves na Mão`);
    } catch (err) {
      avisar(mensagemDe(err, "falha ao sincronizar"), true);
    } finally {
      setSincronizando(false);
    }
  }

  return (
    <div className="space-y-8">
      <Cabecalho sobre={<span className="first-letter:uppercase">{hoje()}</span>} titulo={`${saudacao()}, Natanael`}>
        <a className={botaoPrimario} href="/admin/novo">
          <Plus className="h-4 w-4" /> Cadastrar imóvel
        </a>
      </Cabecalho>

      <dl className={cn(cartao, "grid grid-cols-2 lg:grid-cols-4")}>
        {numeros.map((n, i) => (
          <div
            className={cn(
              "px-5 py-4",
              i % 2 === 1 && "border-linha border-l",
              i >= 2 && "border-linha border-t lg:border-t-0",
              i === 2 && "lg:border-l"
            )}
            key={n.label}
          >
            <dt className="text-apagado text-xs">{n.label}</dt>
            <dd className="mt-1 font-semibold text-2xl tabular-nums tracking-tight">
              {imoveis === null ? "–" : n.valor}
            </dd>
          </div>
        ))}
      </dl>

      <div className="grid gap-6 lg:grid-cols-[1fr_300px]">
        <section className={cartao}>
          <div className="flex items-center justify-between border-linha border-b px-5 py-3.5">
            <h2 className="font-medium text-sm">Seus cadastros recentes</h2>
            <a className="text-ouro-texto text-sm hover:underline" href="/admin/imoveis">
              Ver todos
            </a>
          </div>
          {proprios.length ? (
            <ul className="divide-y divide-linha">
              {proprios.slice(0, 5).map((imovel) => (
                <li key={imovel.id}>
                  <a
                    className="flex items-center gap-4 px-5 py-3 transition hover:bg-papel"
                    href={`/admin/imoveis/${imovel.id}`}
                  >
                    <div className="flex h-10 w-14 shrink-0 items-center justify-center overflow-hidden rounded bg-papel">
                      {imovel.imagem ? (
                        <img alt="" className="h-full w-full object-cover" src={imovel.imagem} />
                      ) : (
                        <Building2 className="h-4 w-4 text-apagado/50" />
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm">{imovel.titulo}</p>
                      <p className="truncate text-apagado text-xs">
                        {[imovel.bairro, imovel.cidade].filter(Boolean).join(", ") || "Sem localização"}
                      </p>
                    </div>
                    <p className="shrink-0 text-sm tabular-nums">{formatPreco(imovel.preco)}</p>
                  </a>
                </li>
              ))}
            </ul>
          ) : (
            <p className="px-5 py-10 text-center text-apagado text-sm">
              {imoveis === null ? "Carregando…" : "Você ainda não cadastrou nenhum imóvel. "}
              {imoveis !== null && (
                <a className="text-ouro-texto hover:underline" href="/admin/novo">
                  Cadastrar o primeiro
                </a>
              )}
            </p>
          )}
        </section>

        <section className={cn(cartao, "flex flex-col p-5")}>
          <h2 className="font-medium text-sm">Chaves na Mão</h2>
          <p className="mt-1 text-apagado text-sm leading-relaxed">
            Use o botão abaixo para trazer seus anúncios do portal para o site.
          </p>
          <dl className="my-5 space-y-2 text-sm">
            <div className="flex justify-between gap-3">
              <dt className="text-apagado">Última atualização</dt>
              <dd>{ultimaSync ? tempoDesde(ultimaSync) : "–"}</dd>
            </div>
            <div className="flex justify-between gap-3">
              <dt className="text-apagado">Anúncios no site</dt>
              <dd className="tabular-nums">{doPortal.length}</dd>
            </div>
          </dl>
          <button
            className={cn(botaoSecundario, "mt-auto w-full")}
            disabled={sincronizando}
            onClick={sincronizar}
            type="button"
          >
            <RefreshCw className={cn("h-4 w-4", sincronizando && "animate-spin")} />
            {sincronizando ? "Atualizando…" : "Atualizar agora"}
          </button>
        </section>
      </div>
    </div>
  );
}
