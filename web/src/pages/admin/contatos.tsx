import { Check, MessageCircle, RotateCcw, Trash2 } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { type Lead, listarLeads, marcarLead, removerLead } from "@/lib/api";
import { whatsappLink } from "@/lib/contato";
import { cn, mensagemDe } from "@/lib/utils";
import { botaoSecundario, Cabecalho, cartao, type Painel } from "./ui";

const quando = (iso: string) =>
  new Date(iso).toLocaleString("pt-BR", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" });

// 85987785187 -> (85) 98778-5187
const telefoneBonito = (d: string) => {
  const n = d.replace(/^55(?=\d{10,11}$)/, "");
  return n.length === 11
    ? `(${n.slice(0, 2)}) ${n.slice(2, 7)}-${n.slice(7)}`
    : n.length === 10
      ? `(${n.slice(0, 2)}) ${n.slice(2, 6)}-${n.slice(6)}`
      : d;
};

const linkWhatsapp = (l: Lead) => {
  const n = l.telefone.replace(/\D/g, "");
  const numero = n.length <= 11 ? `55${n}` : n;
  const texto = `Olá, ${l.nome.split(" ")[0]}! Aqui é da Alves Costa. Recebemos seu contato pelo site e vamos te ajudar.`;
  return whatsappLink(texto).replace(/wa\.me\/\d+/, `wa.me/${numero}`);
};

export function Contatos({ painel }: { painel: Painel }) {
  const [leads, setLeads] = useState<Lead[] | null>(null);
  const [confirmando, setConfirmando] = useState<string | null>(null);
  const { avisar } = painel;

  const carregar = useCallback(async () => {
    try {
      setLeads(await listarLeads());
    } catch (err) {
      setLeads((atual) => atual ?? []);
      avisar(mensagemDe(err, "não foi possível carregar os contatos"), true);
    }
  }, [avisar]);

  useEffect(() => {
    carregar();
  }, [carregar]);

  async function alternar(l: Lead) {
    try {
      await marcarLead(l.id, !l.atendido);
      await carregar();
    } catch (err) {
      avisar(mensagemDe(err, "erro ao atualizar"), true);
    }
  }

  async function excluir(l: Lead) {
    try {
      await removerLead(l.id);
      setConfirmando(null);
      await carregar();
      avisar("Contato excluído");
    } catch (err) {
      avisar(mensagemDe(err, "erro ao excluir"), true);
    }
  }

  const novos = (leads ?? []).filter((l) => !l.atendido).length;

  return (
    <div className="space-y-6">
      <Cabecalho sobre={leads ? `${novos} para atender` : undefined} titulo="Contatos" />

      <div className={cartao}>
        {leads === null ? (
          <div className="space-y-3 p-5">
            {Array.from({ length: 4 }, (_, i) => (
              <div className="h-10 animate-pulse rounded bg-papel" key={i} />
            ))}
          </div>
        ) : leads.length ? (
          <ul className="divide-y divide-linha">
            {leads.map((l) => {
              const detalhes = [l.interesse, l.cidade, l.orcamento].filter(Boolean).join(" · ");
              return (
                <li className={cn("flex flex-col gap-3 px-4 py-4 md:flex-row md:items-center md:px-5", l.atendido && "opacity-60", confirmando === l.id && "bg-red-50")} key={l.id}>
                  <div className="min-w-0 flex-1">
                    <p className="flex flex-wrap items-center gap-2 font-medium text-sm">
                      {l.nome}
                      {!l.atendido && <span className="rounded-full bg-ouro/15 px-2 py-0.5 font-medium text-[11px] text-ouro-texto">Novo</span>}
                    </p>
                    <p className="text-apagado text-xs tabular-nums">
                      {telefoneBonito(l.telefone)} · {quando(l.criado_em)}
                    </p>
                    {detalhes && <p className="mt-0.5 text-sm">{detalhes}</p>}
                    {l.imovel && <p className="text-apagado text-xs">Imóvel: {l.imovel}</p>}
                    {l.mensagem && <p className="mt-1 text-apagado text-xs">{l.mensagem}</p>}
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    {confirmando === l.id ? (
                      <>
                        <button className={botaoSecundario} onClick={() => setConfirmando(null)} type="button">
                          Cancelar
                        </button>
                        <button className="inline-flex items-center gap-2 rounded-md bg-red-700 px-4 py-2 font-medium text-sm text-white hover:bg-red-800" onClick={() => excluir(l)} type="button">
                          Excluir
                        </button>
                      </>
                    ) : (
                      <>
                        <a className={botaoSecundario} href={linkWhatsapp(l)} rel="noreferrer" target="_blank">
                          <MessageCircle className="h-4 w-4" /> Chamar
                        </a>
                        <button
                          aria-label={l.atendido ? "Marcar como novo" : "Marcar como atendido"}
                          className={botaoSecundario}
                          onClick={() => alternar(l)}
                          type="button"
                        >
                          {l.atendido ? <RotateCcw className="h-4 w-4" /> : <Check className="h-4 w-4" />}
                          <span className="hidden sm:inline">{l.atendido ? "Reabrir" : "Atendido"}</span>
                        </button>
                        <button
                          aria-label="Excluir contato"
                          className="rounded-md p-2 text-apagado hover:bg-red-50 hover:text-red-700"
                          onClick={() => setConfirmando(l.id)}
                          type="button"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
        ) : (
          <p className="px-5 py-12 text-center text-apagado text-sm">
            Nenhum contato ainda. Os cadastros do formulário do site aparecem aqui.
          </p>
        )}
      </div>
    </div>
  );
}
