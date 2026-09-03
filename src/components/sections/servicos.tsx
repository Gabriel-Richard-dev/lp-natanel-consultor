import { Key, Search, TrendingUp } from "lucide-react";
import { useScrollReveal } from "@/hooks/use-scroll-reveal";

const servicos = [
  {
    icon: Search,
    title: "Compra assessorada",
    description:
      "Filtramos as opções certas pro seu perfil e orçamento, visitamos junto com você e negociamos o melhor preço.",
  },
  {
    icon: Key,
    title: "Venda e locação",
    description:
      "Anúncio profissional, fotos de qualidade e divulgação nos principais portais para vender ou alugar mais rápido.",
  },
  {
    icon: TrendingUp,
    title: "Avaliação e investimento",
    description:
      "Análise de mercado real para você saber o valor justo do imóvel ou identificar boas oportunidades de investimento.",
  },
];

export function Servicos() {
  const ref = useScrollReveal<HTMLDivElement>({ selector: ".servico-card" });

  return (
    <section className="mx-auto max-w-6xl px-4 py-24 md:px-6" id="servicos">
      <h2 className="mb-4 text-center font-bold text-3xl tracking-tight md:text-4xl">
        Como posso te ajudar
      </h2>
      <p className="mx-auto mb-16 max-w-xl text-center text-muted-foreground">
        Um acompanhamento completo em cada etapa do seu processo imobiliário.
      </p>

      <div className="grid gap-6 md:grid-cols-3" ref={ref}>
        {servicos.map(({ icon: Icon, title, description }) => (
          <div
            className="servico-card rounded-2xl border border-border bg-card p-8 shadow-sm"
            key={title}
          >
            <Icon className="mb-4 h-8 w-8 text-emerald-600" />
            <h3 className="mb-2 font-semibold text-lg">{title}</h3>
            <p className="text-muted-foreground text-sm leading-relaxed">
              {description}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
