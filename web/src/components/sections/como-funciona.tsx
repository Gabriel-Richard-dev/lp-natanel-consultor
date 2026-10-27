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
    texto: "Seguimos ao seu lado até a entrega do imóvel.",
  },
];

export function ComoFunciona() {
  return (
    <section className="bg-marca py-20 md:py-24" id="como-funciona">
      <div className="mx-auto max-w-6xl px-4 md:px-6">
        <h2 className="max-w-2xl font-display font-semibold text-3xl text-white tracking-tight md:text-4xl">
          Do primeiro contato até as chaves
        </h2>
        <ol className="mt-12">
          {ETAPAS.map((e, i) => (
            <li className="grid gap-x-8 gap-y-2 py-6 sm:grid-cols-[3.5rem_14rem_1fr]" key={e.titulo}>
              <span className="relative hidden sm:block">
                <span className="flex h-10 w-10 items-center justify-center rounded-full border border-gold/60 bg-fundo-marca font-display font-semibold text-gold tabular-nums">
                  {i + 1}
                </span>
                {i < ETAPAS.length - 1 && <span aria-hidden="true" className="absolute top-[2.75rem] -bottom-[2.75rem] left-5 w-px bg-gold/25" />}
              </span>
              <h3 className="flex items-center gap-3 font-display font-semibold text-white text-xl sm:pt-1.5">
                <span className="font-display text-gold tabular-nums sm:hidden">{i + 1}.</span>
                {e.titulo}
                {i === ETAPAS.length - 1 && <Chave className="h-5 w-10 text-gold" />}
              </h3>
              <p className="max-w-lg text-white/65 leading-relaxed sm:pt-2">{e.texto}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
