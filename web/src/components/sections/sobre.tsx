import { MapPin, Search, TrendingUp } from "lucide-react";
import logo from "@/assets/logo/logo-alves-costa.png";
import { useImoveis } from "@/hooks/use-imoveis";
import { useScrollReveal } from "@/hooks/use-scroll-reveal";

const servicos = [
  {
    icon: Search,
    title: "Compra assessorada",
    description:
      "Filtramos as opções certas pro seu perfil e orçamento, visitamos junto com você e negociamos o melhor preço.",
  },
  {
    icon: TrendingUp,
    title: "Avaliação e investimento",
    description:
      "Análise de mercado real para você saber o valor justo do imóvel ou identificar boas oportunidades de investimento.",
  },
];

export function Sobre() {
  const ref = useScrollReveal<HTMLDivElement>({ selector: ".sobre-anim" });
  const { imoveis } = useImoveis();

  const construtoras = new Set(imoveis.map((o) => o.construtora).filter(Boolean));

  const stats = [
    { label: "Empreendimentos", valor: `${imoveis.length}` },
    { label: "Construtoras parceiras", valor: `${construtoras.size}` },
    { label: "Cidades atendidas", valor: "3" },
  ];

  return (
    <section className="mx-auto max-w-6xl px-4 py-24 md:px-6" id="sobre">
      <div className="grid items-center gap-12 md:grid-cols-2" ref={ref}>
        <div className="sobre-anim order-2 md:order-1">
          <h2 className="mb-4 font-bold text-3xl tracking-tight md:text-4xl">
            Alves Costa
          </h2>
          <p className="mb-4 text-lg text-muted-foreground leading-relaxed">
            A chave da felicidade é sonhar. Na Alves Costa, transformamos a
            busca por um novo lar em uma experiência tranquila. Conhecemos a
            fundo o mercado da região metropolitana de Fortaleza e ajudamos
            cada cliente a tomar a melhor decisão, com transparência do início
            ao fim.
          </p>
          <div className="mb-8 flex items-center gap-2 font-medium text-gold-fundo dark:text-gold">
            <MapPin className="h-5 w-5" />
            <span>Atendemos Fortaleza, Eusébio e Maracanaú</span>
          </div>

          <div className="grid grid-cols-3 gap-4 border-border border-t pt-6">
            {stats.map((stat) => (
              <div key={stat.label}>
                <div className="font-semibold text-lg">{stat.valor}</div>
                <div className="text-muted-foreground text-xs">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="sobre-anim order-1 flex justify-center md:order-2">
          <div className="w-full max-w-sm rounded-2xl bg-fundo-marca p-6 shadow-lg">
            <img alt="Alves Costa, a chave da felicidade é sonhar" className="w-full" src={logo} />
          </div>
        </div>
      </div>

      <div className="sobre-anim mt-16 border-border border-t pt-12">
        <h3 className="mb-6 font-medium text-muted-foreground text-sm uppercase tracking-wide">
          Como podemos te ajudar
        </h3>
        <div className="grid gap-6 sm:grid-cols-2">
          {servicos.map(({ icon: Icon, title, description }) => (
            <div
              className="rounded-2xl border border-border bg-card p-6 shadow-sm"
              key={title}
            >
              <Icon className="mb-3 h-6 w-6 text-gold-fundo" />
              <h4 className="mb-1.5 font-semibold">{title}</h4>
              <p className="text-muted-foreground text-sm leading-relaxed">
                {description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
