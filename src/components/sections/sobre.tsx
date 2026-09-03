import { MapPin } from "lucide-react";
import natanaelFoto from "@/assets/natanael/natanael-2.jpeg";
import ofertas from "@/data/ofertas.json";
import { useScrollReveal } from "@/hooks/use-scroll-reveal";

const precos = ofertas.map((o) => o.preco);
const precoMin = Math.min(...precos).toLocaleString("pt-BR");
const precoMax = Math.max(...precos).toLocaleString("pt-BR");

const stats = [
  { label: "Imóveis ativos", valor: `${ofertas.length}` },
  { label: "Faixa de preço", valor: `R$ ${precoMin} — ${precoMax}` },
  { label: "CRECI-CE", valor: "20127" },
];

export function Sobre() {
  const ref = useScrollReveal<HTMLDivElement>({ selector: ".sobre-anim" });

  return (
    <section className="mx-auto max-w-6xl px-4 py-24 md:px-6" id="sobre">
      <div className="grid items-center gap-12 md:grid-cols-2" ref={ref}>
        <div className="sobre-anim order-2 md:order-1">
          <h2 className="mb-4 font-bold text-3xl tracking-tight md:text-4xl">
            Natanael Machado
          </h2>
          <p className="mb-4 text-lg text-muted-foreground leading-relaxed">
            Consultor de imóveis dedicado a transformar a busca por um novo
            lar em uma experiência tranquila. Conheço a fundo o mercado da
            região metropolitana de Fortaleza e ajudo cada cliente a tomar a
            melhor decisão, com transparência do início ao fim.
          </p>
          <div className="mb-8 flex items-center gap-2 font-medium text-emerald-700 dark:text-emerald-400">
            <MapPin className="h-5 w-5" />
            <span>Atendo Fortaleza, Eusébio e Maracanaú</span>
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
          <img
            alt="Natanael Machado, consultor de imóveis"
            className="w-full max-w-sm rounded-2xl border border-border object-cover shadow-lg"
            src={natanaelFoto}
          />
        </div>
      </div>
    </section>
  );
}
