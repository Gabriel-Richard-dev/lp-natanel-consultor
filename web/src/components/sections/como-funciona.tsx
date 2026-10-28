import { Revelar } from "@/components/ui/revelar";
import { Chave } from "@/components/ui/chave";

const ETAPAS = [
  {
    titulo: "Conversa",
    texto: "Você conta o que procura, em que região quer morar e quanto pode pagar por mês.",
  },
  {
    titulo: "Simulação",
    texto: "Calculamos entrada, parcela e renda sugerida, para você saber o que cabe no bolso antes de visitar.",
  },
  {
    titulo: "Visita",
    texto: "Separamos os empreendimentos que combinam com o seu perfil e vamos junto conhecer.",
  },
  {
    titulo: "Documentação",
    texto: "Organizamos os documentos e acompanhamos o financiamento e a negociação com a construtora.",
  },
  {
    titulo: "Chaves",
    texto: "Acompanhamos você até a entrega do imóvel.",
  },
];

export function ComoFunciona() {
  return (
    <section className="folha relative isolate overflow-hidden bg-marca pt-24 pb-20 md:pt-[7.5rem] md:pb-24" id="como-funciona">
      <div aria-hidden="true" className="-z-10 pointer-events-none absolute top-24 -right-20 hidden h-[34rem] w-[22rem] rounded-t-full border border-gold/15 lg:block" />
      <div aria-hidden="true" className="-z-10 pointer-events-none absolute top-40 -right-4 hidden h-[28rem] w-[16rem] rounded-t-full border border-gold/10 lg:block" />
      <div className="mx-auto max-w-6xl px-4 md:px-6">
        <h2 className="max-w-2xl font-display font-semibold text-3xl text-white tracking-tight md:text-4xl">
          Do primeiro contato até as chaves
        </h2>
        <ol className="mt-12">
          {ETAPAS.map((e, i) => (
            <Revelar as="li" atraso={i * 90} className="grid gap-x-8 gap-y-2 py-6 sm:grid-cols-[3.5rem_14rem_1fr]" key={e.titulo}>
              <span className="relative hidden sm:block">
                <span className="flex h-12 w-10 items-center justify-center rounded-t-full rounded-b-md border border-gold/60 bg-fundo-marca pt-1 font-display font-semibold text-gold tabular-nums">
                  {i + 1}
                </span>
                {i < ETAPAS.length - 1 && <span aria-hidden="true" className="absolute top-[3.25rem] -bottom-[3.25rem] left-5 w-px bg-gold/25" />}
              </span>
              <h3 className="flex items-center gap-3 font-display font-semibold text-white text-xl sm:pt-1.5">
                <span className="font-display text-gold tabular-nums sm:hidden">{i + 1}.</span>
                {e.titulo}
                {i === ETAPAS.length - 1 && <Chave className="h-5 w-10 text-gold" />}
              </h3>
              <p className="max-w-lg text-white/65 leading-relaxed sm:pt-2">{e.texto}</p>
            </Revelar>
          ))}
        </ol>
      </div>
    </section>
  );
}
