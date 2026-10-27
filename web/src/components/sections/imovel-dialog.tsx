import { BedDouble, Building2, CalendarClock, CheckCircle2, Loader2, MapPin, MessageCircle, Ruler, ShowerHead, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { campoClaro } from "@/components/ui/campo-claro";
import { enviarLead, type Imovel } from "@/lib/api";
import { formatPreco, whatsappOferta } from "@/lib/contato";
import { mascaraTelefone } from "@/lib/telefone";
import { mensagemDe } from "@/lib/utils";

const FOCAVEIS = 'a[href], button:not([disabled]), input:not([tabindex="-1"]), select, textarea, [tabindex]:not([tabindex="-1"])';

function Ficha({ icone: Icone, children }: { icone: typeof BedDouble; children: React.ReactNode }) {
  return (
    <li className="flex items-center gap-2 text-nanquim/80 text-sm">
      <Icone className="h-4 w-4 shrink-0 text-mar" /> {children}
    </li>
  );
}

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
      <p aria-live="polite" className="flex items-center gap-2 rounded-md bg-cal p-4 text-mar text-sm" role="status">
        <CheckCircle2 className="h-5 w-5 shrink-0" /> Recebemos seu contato! Falamos com você em breve.
      </p>
    );
  }

  return (
    <form className="space-y-3" onSubmit={enviar}>
      <p className="font-display font-semibold text-nanquim">Prefere que a gente te ligue?</p>
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
      <label className="flex cursor-pointer items-start gap-3 text-nanquim/70 text-xs leading-relaxed">
        <input
          checked={aceite}
          className="mt-0.5 h-4 w-4 shrink-0 accent-mar"
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
        className="flex w-full items-center justify-center gap-2 rounded-md border-2 border-nanquim px-5 py-3 font-semibold text-nanquim transition-colors hover:bg-nanquim hover:text-cal disabled:opacity-60"
        disabled={enviando}
        type="submit"
      >
        {enviando && <Loader2 className="h-4 w-4 animate-spin" />}
        Quero que me liguem
      </button>
    </form>
  );
}

export function ImovelDialog({ imovel, onFechar }: { imovel: Imovel; onFechar: () => void }) {
  const painel = useRef<HTMLDivElement>(null);
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

  return (
    // biome-ignore lint/a11y/useKeyWithClickEvents: o Esc já fecha (listener no document)
    <div
      className="fixed inset-0 z-[60] flex items-end justify-center bg-nanquim/70 p-0 backdrop-blur-sm sm:items-center sm:p-6"
      onClick={(e) => e.target === e.currentTarget && onFechar()}
    >
      <div
        aria-labelledby="imovel-titulo"
        aria-modal="true"
        className="relative grid max-h-[92vh] w-full max-w-4xl overflow-y-auto rounded-t-xl bg-white font-corpo text-nanquim shadow-2xl sm:rounded-xl md:grid-cols-2"
        ref={painel}
        role="dialog"
      >
        <button
          aria-label="Fechar"
          className="absolute top-3 right-3 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-white/90 text-nanquim backdrop-blur transition-colors hover:bg-white"
          onClick={onFechar}
          type="button"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="relative h-56 bg-concreto/60 md:h-auto md:min-h-[28rem]">
          {imovel.imagem ? (
            <img alt={imovel.titulo} className="absolute inset-0 h-full w-full object-cover" src={imovel.imagem} />
          ) : (
            <div className="flex h-full items-center justify-center text-nanquim/25">
              <Building2 className="h-14 w-14" />
            </div>
          )}
          {imovel.fase && (
            <span className="absolute top-3 left-3 rounded-sm bg-nanquim px-2.5 py-1 font-medium text-cal text-xs">
              {imovel.fase}
            </span>
          )}
        </div>

        <div className="flex flex-col gap-5 p-6 md:p-8">
          <div>
            {imovel.construtora && (
              <p className="mb-1 font-medium text-mar text-sm">{imovel.construtora}</p>
            )}
            <h2 className="font-display font-semibold text-2xl tracking-tight" id="imovel-titulo">
              {imovel.titulo}
            </h2>
            {local && (
              <p className="mt-1 flex items-center gap-1.5 text-nanquim/70 text-sm">
                <MapPin className="h-4 w-4" /> {local}
              </p>
            )}
          </div>

          <p className="font-display font-semibold text-nanquim text-xl">
            {imovel.preco != null ? formatPreco(imovel.preco) : "Consulte valores"}
          </p>

          <ul className="space-y-2.5">
            {!!imovel.quartos && <Ficha icone={BedDouble}>{imovel.quartos} {imovel.quartos === 1 ? "quarto" : "quartos"}</Ficha>}
            {!!imovel.banheiros && (
              <Ficha icone={ShowerHead}>{imovel.banheiros} {imovel.banheiros === 1 ? "banheiro" : "banheiros"}</Ficha>
            )}
            {imovel.area && <Ficha icone={Ruler}>{imovel.area}</Ficha>}
            {imovel.entrega && <Ficha icone={CalendarClock}>Entrega prevista: {imovel.entrega}</Ficha>}
          </ul>

          <a
            className="flex items-center justify-center gap-2 rounded-md bg-nanquim px-5 py-3.5 font-semibold text-cal transition-colors hover:bg-mar"
            href={whatsappOferta(imovel.titulo, imovel.url, imovel.construtora)}
            rel="noreferrer"
            target="_blank"
          >
            <MessageCircle className="h-4 w-4" /> Falar sobre este imóvel
          </a>

          <div className="border-concreto border-t pt-5">
            <ContatoRapido imovel={imovel} />
          </div>

          <p className="text-nanquim/60 text-xs leading-relaxed">
            Imagens ilustrativas. Valores, metragens e disponibilidade podem mudar; confirmamos tudo com você no atendimento.
          </p>
        </div>
      </div>
    </div>
  );
}
