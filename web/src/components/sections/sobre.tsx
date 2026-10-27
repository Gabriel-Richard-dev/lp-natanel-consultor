import logo from "@/assets/logo/logo-alves-costa.webp";

export function Sobre() {
  return (
    <section className="border-white/10 border-y bg-preto py-20 text-white md:py-24" id="sobre">
      <div className="mx-auto grid max-w-6xl items-center gap-12 px-4 md:px-6 lg:grid-cols-[1fr_1.2fr]">
        <img alt="Alves Costa: a chave da felicidade é sonhar" className="w-full max-w-sm" loading="lazy" src={logo} />
        <div>
          <h2 className="font-display font-semibold text-3xl tracking-tight md:text-4xl">
            Uma busca tranquila, com transparência do início ao fim
          </h2>
          <p className="mt-5 max-w-xl text-white/65 leading-relaxed">
            Na Alves Costa, procurar um novo lar não precisa ser cansativo. Conhecemos a fundo o mercado da região
            metropolitana de Fortaleza e ajudamos cada cliente a escolher bem, seja para morar ou para investir.
          </p>
        </div>
      </div>
    </section>
  );
}
