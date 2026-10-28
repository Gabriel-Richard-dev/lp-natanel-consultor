import { CheckCircle2, Loader2, MessageCircle } from "lucide-react";
import { useState } from "react";
import { Revelar } from "@/components/ui/revelar";
import { Horario } from "@/components/layout/horario";
import { campo } from "@/components/ui/campo";
import { enviarLead } from "@/lib/api";
import { CIDADES_ATENDIDAS } from "@/lib/cidades";
import { whatsappLink } from "@/lib/contato";
import { mascaraTelefone } from "@/lib/telefone";
import { cn, mensagemDe } from "@/lib/utils";

const INTERESSES = ["Comprar", "Investir", "Vender meu imóvel"];
const CIDADES = [...CIDADES_ATENDIDAS, "Outra"];
const VALORES = ["Até R$ 200 mil", "R$ 200 a 300 mil", "R$ 300 a 500 mil", "Acima de R$ 500 mil", "Ainda não sei"];

const BENEFICIOS = [
  { titulo: "Seleção sob medida", texto: "Filtramos lançamentos e imóveis prontos pelo seu perfil e orçamento." },
  { titulo: "Acompanhamento completo", texto: "Visitas, simulação, documentação e negociação, do início às chaves." },
  { titulo: "Sem compromisso", texto: "Atendimento gratuito. Você só segue em frente se fizer sentido." },
];

export function Captacao() {
  const [interesse, setInteresse] = useState(INTERESSES[0]);
  const [nome, setNome] = useState("");
  const [telefone, setTelefone] = useState("");
  const [cidade, setCidade] = useState("");
  const [valor, setValor] = useState("");
  const [aceite, setAceite] = useState(false);
  const [isca, setIsca] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState("");
  const [enviado, setEnviado] = useState(false);

  const vender = interesse === "Vender meu imóvel";

  async function enviar(e: React.FormEvent) {
    e.preventDefault();
    setErro("");
    setEnviando(true);
    try {
      await enviarLead({
        nome: nome.trim(),
        telefone,
        interesse,
        cidade,
        orcamento: vender ? "" : valor,
        origem: "landing",
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

  const resumo =
    `Olá! Acabei de enviar meus dados pelo site. Meu nome é ${nome.trim()} e quero ${interesse.toLowerCase()}` +
    `${cidade ? ` em ${cidade}` : ""}${!vender && valor ? ` (${valor.toLowerCase()})` : ""}.`;

  return (
    <section className="folha relative isolate overflow-hidden bg-prata pt-24 pb-20 md:pt-[7.5rem] md:pb-24" id="contato">
      <div aria-hidden="true" className="planta-clara -z-10 absolute inset-0" />
      <div className="mx-auto grid max-w-6xl gap-12 px-4 md:px-6 lg:grid-cols-[1fr_1.1fr]">
        <Revelar>
          <h2 className="font-display font-semibold text-3xl text-fundo-marca tracking-tight md:text-4xl">
            Conte o que você procura
          </h2>
          <p className="mt-4 max-w-md text-fundo-marca/70 leading-relaxed">
            Deixe seu contato e a gente envia opções que combinam com o que você procura.
          </p>
          <dl className="mt-8 divide-y divide-black/10 border-black/10 border-y">
            {BENEFICIOS.map(({ titulo, texto }) => (
              <div className="py-4" key={titulo}>
                <dt className="font-display font-semibold text-fundo-marca">{titulo}</dt>
                <dd className="mt-1 text-fundo-marca/70 text-sm leading-relaxed">{texto}</dd>
              </div>
            ))}
          </dl>
          <div className="mt-8">
            <h3 className="mb-3 font-display font-semibold text-fundo-marca">Horário de atendimento</h3>
            <Horario claro />
          </div>
        </Revelar>

        <Revelar atraso={140} className="rounded-lg border border-white/10 bg-marca p-6 md:p-10">
          {enviado ? (
            <div aria-live="polite" className="flex h-full flex-col justify-center" role="status">
              <CheckCircle2 className="mb-4 h-10 w-10 text-gold" />
              <h3 className="font-display font-semibold text-2xl text-white">Recebemos seu contato</h3>
              <p className="mt-2 max-w-sm text-white/70">
                Falamos com você pelo WhatsApp no próximo horário de atendimento. Se preferir, adiante a conversa agora:
              </p>
              <a
                className="mt-6 inline-flex w-fit items-center gap-2 rounded-md bg-gold px-6 py-3 font-semibold text-black transition-colors hover:bg-gold-claro"
                href={whatsappLink(resumo)}
                rel="noreferrer"
                target="_blank"
              >
                <MessageCircle className="h-4 w-4" /> Continuar no WhatsApp
              </a>
            </div>
          ) : (
            <form className="space-y-5" onSubmit={enviar}>
              <fieldset>
                <legend className="mb-2 font-medium text-white text-sm">Eu quero</legend>
                <div className="grid grid-cols-3 gap-2">
                  {INTERESSES.map((i) => (
                    <button
                      aria-pressed={interesse === i}
                      className={cn(
                        "rounded-md border px-2 py-2.5 text-center text-sm transition",
                        interesse === i
                          ? "border-gold bg-gold font-medium text-black"
                          : "border-white/10 text-white/80 hover:border-white/40"
                      )}
                      key={i}
                      onClick={() => setInteresse(i)}
                      type="button"
                    >
                      {i}
                    </button>
                  ))}
                </div>
              </fieldset>

              <div>
                <label className="mb-1.5 block font-medium text-white text-sm" htmlFor="lead-nome">
                  Seu nome
                </label>
                <input
                  autoComplete="name"
                  className={campo}
                  id="lead-nome"
                  maxLength={100}
                  minLength={2}
                  onChange={(e) => setNome(e.target.value)}
                  placeholder="Como podemos te chamar?"
                  required
                  value={nome}
                />
              </div>

              <div>
                <label className="mb-1.5 block font-medium text-white text-sm" htmlFor="lead-tel">
                  WhatsApp
                </label>
                <input
                  autoComplete="tel"
                  className={campo}
                  id="lead-tel"
                  inputMode="tel"
                  onChange={(e) => setTelefone(mascaraTelefone(e.target.value))}
                  pattern="\(\d{2}\) \d{4,5}-\d{4}"
                  placeholder="(85) 90000-0000"
                  required
                  title="DDD e número, ex.: (85) 98778-5187"
                  value={telefone}
                />
              </div>

              <div className={cn("grid gap-4", !vender && "sm:grid-cols-2")}>
                <div>
                  <label className="mb-1.5 block font-medium text-white text-sm" htmlFor="lead-cidade">
                    {vender ? "Onde fica o imóvel?" : "Cidade de interesse"}
                  </label>
                  <select className={campo} id="lead-cidade" onChange={(e) => setCidade(e.target.value)} value={cidade}>
                    <option value="">Selecione</option>
                    {CIDADES.map((c) => (
                      <option key={c}>{c}</option>
                    ))}
                  </select>
                </div>
                {!vender && (
                  <div>
                    <label className="mb-1.5 block font-medium text-white text-sm" htmlFor="lead-valor">
                      Faixa de valor
                    </label>
                    <select className={campo} id="lead-valor" onChange={(e) => setValor(e.target.value)} value={valor}>
                      <option value="">Selecione</option>
                      {VALORES.map((v) => (
                        <option key={v}>{v}</option>
                      ))}
                    </select>
                  </div>
                )}
              </div>

              {/* isca para robôs: fora da tela, sem foco, sem autopreenchimento */}
              <input
                aria-hidden="true"
                autoComplete="off"
                className="absolute -left-[9999px] h-0 w-0 opacity-0"
                name="site"
                onChange={(e) => setIsca(e.target.value)}
                tabIndex={-1}
                value={isca}
              />

              <label className="flex cursor-pointer items-start gap-3 text-white/65 text-xs leading-relaxed">
                <input
                  checked={aceite}
                  className="mt-0.5 h-4 w-4 shrink-0 accent-gold"
                  onChange={(e) => setAceite(e.target.checked)}
                  required
                  type="checkbox"
                />
                <span>
                  Concordo em ser contatado pela Alves Costa por WhatsApp ou telefone. Uso seus dados apenas para este
                  atendimento (LGPD).
                </span>
              </label>

              {erro && (
                <p className="text-red-400 text-sm" role="alert">
                  {erro}
                </p>
              )}

              <button
                className="flex w-full items-center justify-center gap-2 rounded-md bg-gold px-6 py-3.5 font-semibold text-black transition-colors hover:bg-gold-claro disabled:opacity-60"
                disabled={enviando}
                type="submit"
              >
                {enviando && <Loader2 className="h-4 w-4 animate-spin" />}
                Quero receber opções
              </button>
            </form>
          )}
        </Revelar>
      </div>
    </section>
  );
}
