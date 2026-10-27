import { CheckCircle2, Loader2, MessageCircle, ShieldCheck, Sparkles, UserCheck } from "lucide-react";
import { useState } from "react";
import { campoEscuro as campo } from "@/components/ui/campo-escuro";
import { enviarLead } from "@/lib/api";
import { whatsappLink } from "@/lib/contato";
import { mascaraTelefone } from "@/lib/telefone";
import { cn, mensagemDe } from "@/lib/utils";

const INTERESSES = ["Comprar", "Investir", "Vender meu imóvel"];
const CIDADES = ["Fortaleza", "Eusébio", "Maracanaú", "Caucaia", "Outra"];
const VALORES = ["Até R$ 200 mil", "R$ 200 a 300 mil", "R$ 300 a 500 mil", "Acima de R$ 500 mil", "Ainda não sei"];

const BENEFICIOS = [
  { icone: Sparkles, titulo: "Seleção sob medida", texto: "Filtramos lançamentos e imóveis prontos pelo seu perfil e orçamento." },
  { icone: UserCheck, titulo: "Acompanhamento completo", texto: "Visitas, simulação, documentação e negociação, do início às chaves." },
  { icone: ShieldCheck, titulo: "Sem compromisso", texto: "Atendimento gratuito. Você só segue em frente se fizer sentido." },
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
    <section className="bg-neutral-50 px-4 py-24 md:px-6" id="captacao">
      <div className="mx-auto grid max-w-6xl overflow-hidden rounded-3xl bg-fundo-marca shadow-xl lg:grid-cols-[1fr_1.05fr]">
        <div className="relative p-8 md:p-12">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(70%_60%_at_0%_0%,rgb(212_175_75/0.16),transparent_70%)]" />
          <div className="relative">
            <p className="mb-3 font-medium text-gold text-xs uppercase tracking-[0.2em]">Atendimento personalizado</p>
            <h2 className="font-bold text-3xl text-white tracking-tight md:text-4xl">
              Conte o que você procura.{" "}
              <span className="font-serif text-gold italic">Nós encontramos.</span>
            </h2>
            <p className="mt-4 max-w-md text-white/60 leading-relaxed">
              Nem todo imóvel está anunciado. Deixe seu contato e receba as melhores oportunidades para o seu momento.
            </p>
            <ul className="mt-8 space-y-5">
              {BENEFICIOS.map(({ icone: Icone, titulo, texto }) => (
                <li className="flex gap-4" key={titulo}>
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gold/10 text-gold">
                    <Icone className="h-5 w-5" />
                  </span>
                  <div>
                    <p className="font-medium text-white">{titulo}</p>
                    <p className="text-sm text-white/55 leading-relaxed">{texto}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="border-white/10 border-t bg-white/[0.03] p-8 md:p-12 lg:border-t-0 lg:border-l">
          {enviado ? (
            <div aria-live="polite" className="flex h-full flex-col items-center justify-center text-center" role="status">
              <CheckCircle2 className="mb-4 h-14 w-14 text-gold" />
              <h3 className="font-semibold text-2xl text-white">Recebemos seu contato!</h3>
              <p className="mt-2 max-w-xs text-white/60">
                Em breve falamos com você pelo WhatsApp. Se preferir, adiante a conversa agora:
              </p>
              <a
                className="mt-6 inline-flex items-center gap-2 rounded-lg bg-gold px-6 py-3 font-medium text-black transition-colors hover:bg-gold-claro"
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
                <legend className="mb-2 font-medium text-sm text-white/70">Eu quero</legend>
                <div className="grid grid-cols-3 gap-2">
                  {INTERESSES.map((i) => (
                    <button
                      aria-pressed={interesse === i}
                      className={cn(
                        "rounded-lg border px-2 py-2.5 text-center text-sm transition",
                        interesse === i
                          ? "border-gold bg-gold font-medium text-black"
                          : "border-white/15 text-white/70 hover:border-white/30 hover:text-white"
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
                <label className="mb-1.5 block font-medium text-sm text-white/70" htmlFor="lead-nome">
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
                <label className="mb-1.5 block font-medium text-sm text-white/70" htmlFor="lead-tel">
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
                  <label className="mb-1.5 block font-medium text-sm text-white/70" htmlFor="lead-cidade">
                    {vender ? "Onde fica o imóvel?" : "Cidade de interesse"}
                  </label>
                  <select className={campo} id="lead-cidade" onChange={(e) => setCidade(e.target.value)} value={cidade}>
                    <option className="text-black" value="">
                      Selecione
                    </option>
                    {CIDADES.map((c) => (
                      <option className="text-black" key={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>
                {!vender && (
                  <div>
                    <label className="mb-1.5 block font-medium text-sm text-white/70" htmlFor="lead-valor">
                      Faixa de valor
                    </label>
                    <select className={campo} id="lead-valor" onChange={(e) => setValor(e.target.value)} value={valor}>
                      <option className="text-black" value="">
                        Selecione
                      </option>
                      {VALORES.map((v) => (
                        <option className="text-black" key={v}>
                          {v}
                        </option>
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

              <label className="flex cursor-pointer items-start gap-3 text-white/55 text-xs leading-relaxed">
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
                className="flex w-full items-center justify-center gap-2 rounded-lg bg-gold px-6 py-3.5 font-semibold text-black transition-colors hover:bg-gold-claro disabled:opacity-60"
                disabled={enviando}
                type="submit"
              >
                {enviando && <Loader2 className="h-4 w-4 animate-spin" />}
                Quero receber oportunidades
              </button>
            </form>
          )}
        </div>
      </div>
    </section>
  );
}
