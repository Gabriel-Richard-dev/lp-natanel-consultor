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

function Chave({ className }: { className?: string }) {
  return (
    <svg aria-hidden="true" className={className} fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 48 24">
      <circle cx="9" cy="12" r="6.5" />
      <path d="M15.5 12H44M36 12v7M43 12v5" />
    </svg>
  );
}

export function ComoFunciona() {
  return (
    <section className="bg-marca py-20 md:py-24" id="como-funciona">
      <div className="mx-auto max-w-6xl px-4 md:px-6">
        <h2 className="max-w-2xl font-display font-semibold text-3xl text-white tracking-tight md:text-4xl">
          Do primeiro contato até as chaves
        </h2>
        <ol className="mt-12 border-white/10 border-t">
          {ETAPAS.map((e, i) => (
            <li
              className="grid items-baseline gap-x-8 gap-y-2 border-white/10 border-b py-6 sm:grid-cols-[4rem_14rem_1fr]"
              key={e.titulo}
            >
              <span className="font-display font-semibold text-3xl text-gold tabular-nums">{i + 1}</span>
              <h3 className="flex items-center gap-3 font-display font-semibold text-white text-xl">
                {e.titulo}
                {i === ETAPAS.length - 1 && <Chave className="h-5 w-10 text-gold" />}
              </h3>
              <p className="max-w-lg text-white/70 leading-relaxed">{e.texto}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
