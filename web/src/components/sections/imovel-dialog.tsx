import {
  BedDouble,
  Building2,
  CalendarClock,
  CheckCircle2,
  Loader2,
  MapPin,
  MessageCircle,
  Phone,
  Ruler,
  ShowerHead,
  X,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { campoClaro } from "@/components/ui/campo";
import { enviarLead, type Imovel } from "@/lib/api";
import { formatPreco, whatsappOferta } from "@/lib/contato";
import { mascaraTelefone } from "@/lib/telefone";
import { mensagemDe } from "@/lib/utils";

const FOCAVEIS = 'a[href], button:not([disabled]), input:not([tabindex="-1"]), select, textarea, [tabindex]:not([tabindex="-1"])';

function ContatoRapido({ imovel }: { imovel: Imovel }) {
  const [nome, setNome] = useState("");
  const [telefone, setTelefone] = useState("");
  const [aceite, setAceite] = useState(false);
  const [isca, setIsca] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState("");
  const [enviado, setEnviado] = useState(false);

  async function enviar(e: React.FormEvent) {
    e.preventDefault();
    setErro("");
    setEnviando(true);
    try {
      await enviarLead({
        nome: nome.trim(),
        telefone,
        imovel: [imovel.titulo, imovel.construtora].filter(Boolean).join(" · "),
        origem: "imovel",
        consentimento: aceite,
        site: isca,
      });
      setEnviado(true);
    } catch (err) {
      setErro(mensagemDe(err, "não foi possível enviar agora"));
    } finally {
      setEnviando(false);
    }
  }

  if (enviado) {
    return (
      <p aria-live="polite" className="flex items-start gap-2 rounded-lg bg-white p-4 text-fundo-marca text-sm" role="status">
        <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-ouro-texto" /> Recebemos seu contato. Falamos com você no
        próximo horário de atendimento.
      </p>
    );
  }

  return (
    <form className="space-y-3" onSubmit={enviar}>
      <div className="grid gap-3 sm:grid-cols-2">
        <input
          aria-label="Seu nome"
          autoComplete="name"
          className={campoClaro}
          maxLength={100}
          minLength={2}
          onChange={(e) => setNome(e.target.value)}
          placeholder="Seu nome"
          required
          value={nome}
        />
        <input
          aria-label="Seu WhatsApp"
          autoComplete="tel"
          className={campoClaro}
          inputMode="tel"
          onChange={(e) => setTelefone(mascaraTelefone(e.target.value))}
          pattern="\(\d{2}\) \d{4,5}-\d{4}"
          placeholder="(85) 90000-0000"
          required
          title="DDD e número, ex.: (85) 98778-5187"
          value={telefone}
        />
      </div>
      <input
        aria-hidden="true"
        autoComplete="off"
        className="absolute -left-[9999px] h-0 w-0 opacity-0"
        name="site"
        onChange={(e) => setIsca(e.target.value)}
        tabIndex={-1}
        value={isca}
      />
      <label className="flex cursor-pointer items-start gap-3 text-fundo-marca/70 text-xs leading-relaxed">
        <input
          checked={aceite}
          className="mt-0.5 h-4 w-4 shrink-0 accent-gold"
          onChange={(e) => setAceite(e.target.checked)}
          required
          type="checkbox"
        />
        <span>Concordo em ser contatado pela Alves Costa. Uso seus dados apenas para este atendimento (LGPD).</span>
      </label>
      {erro && (
        <p className="text-red-700 text-sm" role="alert">
          {erro}
        </p>
      )}
      <button
        className="flex h-12 w-full items-center justify-center gap-2 rounded-lg bg-fundo-marca font-semibold text-white transition-colors hover:bg-marca disabled:opacity-60"
        disabled={enviando}
        type="submit"
      >
        {enviando && <Loader2 className="h-4 w-4 animate-spin" />}
        Enviar meu contato
      </button>
    </form>
  );
}

export function ImovelDialog({ imovel, onFechar }: { imovel: Imovel; onFechar: () => void }) {
  const painel = useRef<HTMLDivElement>(null);
  const [ligar, setLigar] = useState(false);
  const local = [imovel.bairro, imovel.cidade].filter(Boolean).join(", ");

  // Esc fecha; Tab fica preso no diálogo; o fundo não rola; o foco volta para quem abriu.
  useEffect(() => {
    const antes = document.activeElement as HTMLElement | null;
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    painel.current?.querySelector<HTMLElement>("button")?.focus();

    const aoTeclar = (e: KeyboardEvent) => {
      if (e.key === "Escape") return onFechar();
      if (e.key !== "Tab" || !painel.current) return;
      const itens = [...painel.current.querySelectorAll<HTMLElement>(FOCAVEIS)];
      const primeiro = itens[0];
      const ultimo = itens[itens.length - 1];
      if (e.shiftKey && document.activeElement === primeiro) {
        e.preventDefault();
        ultimo.focus();
      } else if (!e.shiftKey && document.activeElement === ultimo) {
        e.preventDefault();
        primeiro.focus();
      }
    };
    document.addEventListener("keydown", aoTeclar);
    return () => {
      document.removeEventListener("keydown", aoTeclar);
      document.body.style.overflow = overflow;
      antes?.focus();
    };
  }, [onFechar]);

  const dados = [
    imovel.quartos ? { icone: BedDouble, texto: `${imovel.quartos} ${imovel.quartos === 1 ? "quarto" : "quartos"}` } : null,
    imovel.banheiros ? { icone: ShowerHead, texto: `${imovel.banheiros} ${imovel.banheiros === 1 ? "banheiro" : "banheiros"}` } : null,
    imovel.area ? { icone: Ruler, texto: imovel.area } : null,
    imovel.entrega ? { icone: CalendarClock, texto: `Entrega ${imovel.entrega}` } : null,
  ].filter((d): d is { icone: typeof BedDouble; texto: string } => !!d);

  // portal no body: assim nenhuma seção (isolate, transform, z-index) prende o modal abaixo da navbar
  return createPortal(
    // biome-ignore lint/a11y/useKeyWithClickEvents: o Esc já fecha (listener no document)
    <div
      className="fade-in fixed inset-0 z-[100] flex animate-in items-end justify-center bg-fundo-marca/70 p-0 backdrop-blur-sm duration-200 sm:items-center sm:p-6"
      onClick={(e) => e.target === e.currentTarget && onFechar()}
    >
      <div
        aria-labelledby="imovel-titulo"
        aria-modal="true"
        className="slide-in-from-bottom-8 sm:zoom-in-95 relative flex max-h-[94vh] w-full max-w-2xl animate-in flex-col overflow-hidden rounded-t-2xl bg-white font-corpo text-fundo-marca shadow-2xl duration-300 sm:max-h-[92vh] sm:rounded-2xl"
        ref={painel}
        role="dialog"
      >
        <div className="overflow-y-auto">
          <div className="relative aspect-[16/10] w-full bg-black/10 sm:aspect-[2/1]">
            {imovel.imagem ? (
              <img alt={imovel.titulo} className="absolute inset-0 h-full w-full object-cover" src={imovel.imagem} />
            ) : (
              <div className="flex h-full items-center justify-center text-fundo-marca/25">
                <Building2 className="h-14 w-14" />
              </div>
            )}
            {imovel.fase && (
              <span className="absolute top-4 left-4 rounded-sm bg-fundo-marca px-2.5 py-1 font-medium text-gold text-xs">
                {imovel.fase}
              </span>
            )}
            <button
              aria-label="Fechar"
              className="absolute top-3 right-3 flex h-10 w-10 items-center justify-center rounded-full bg-white/90 text-fundo-marca shadow-lg transition-colors hover:bg-white"
              onClick={onFechar}
              type="button"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="p-5 sm:p-7">
            {imovel.construtora && <p className="mb-1 font-medium text-ouro-texto text-sm">{imovel.construtora}</p>}
            <h2 className="font-display font-semibold text-2xl leading-tight tracking-tight sm:text-3xl" id="imovel-titulo">
              {imovel.titulo}
            </h2>
            {local && (
              <p className="mt-2 flex items-center gap-1.5 text-fundo-marca/70 text-sm">
                <MapPin className="h-4 w-4 shrink-0" /> {local}
              </p>
            )}

            {dados.length > 0 && (
              <ul className="mt-5 flex flex-wrap gap-x-6 gap-y-2 border-black/10 border-y py-4 text-sm">
                {dados.map((d) => (
                  <li className="flex items-center gap-2" key={d.texto}>
                    <d.icone className="h-4 w-4 text-ouro-texto" /> {d.texto}
                  </li>
                ))}
              </ul>
            )}

            <p className="mt-4 text-fundo-marca/70 text-sm leading-relaxed">
              {imovel.preco != null ? (
                <>
                  A partir de <strong className="font-display font-semibold text-fundo-marca text-lg">{formatPreco(imovel.preco)}</strong>.
                  Confirmamos condições e disponibilidade com você.
                </>
              ) : (
                "O valor muda de unidade para unidade. Confirmamos com você no atendimento."
              )}
            </p>

            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              <a
                className="flex h-12 items-center justify-center gap-2 rounded-lg bg-gold font-semibold text-black transition-colors hover:bg-gold-claro"
                href={whatsappOferta(imovel.titulo, imovel.url, imovel.construtora)}
                rel="noreferrer"
                target="_blank"
              >
                <MessageCircle className="h-4 w-4" /> Falar no WhatsApp
              </a>
              <button
                aria-expanded={ligar}
                className="flex h-12 items-center justify-center gap-2 rounded-lg border-2 border-fundo-marca font-semibold text-fundo-marca transition-colors hover:bg-fundo-marca hover:text-gold"
                onClick={() => setLigar((v) => !v)}
                type="button"
              >
                <Phone className="h-4 w-4" /> Quero que me liguem
              </button>
            </div>

            {ligar && (
              <div className="fade-in slide-in-from-top-1 mt-4 animate-in rounded-xl bg-prata p-4 duration-200 sm:p-5">
                <ContatoRapido imovel={imovel} />
              </div>
            )}

            <p className="mt-5 text-fundo-marca/55 text-xs leading-relaxed">
              Imagens ilustrativas. Valores, metragens e disponibilidade podem mudar.
            </p>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}
