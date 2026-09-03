import { ArrowLeft } from "lucide-react";
import logo from "@/assets/logo/logo-natanael.png";
import { OfertaCard } from "@/components/sections/oferta-card";
import ofertas from "@/data/ofertas.json";
import { useCardReveal } from "@/hooks/use-card-reveal";

export function Catalogo() {
  const ref = useCardReveal<HTMLDivElement>(".oferta-card");

  return (
    <main className="mx-auto max-w-6xl px-4 py-16 md:px-6">
      <div className="mb-10 flex items-center justify-between">
        <img alt="Natanael Machado" className="h-14 w-auto" src={logo} />
        <a
          className="flex items-center gap-1.5 font-medium text-muted-foreground text-sm hover:text-foreground"
          href="#"
        >
          <ArrowLeft className="h-4 w-4" />
          Voltar para o site
        </a>
      </div>

      <h1 className="mb-2 font-bold text-3xl tracking-tight md:text-4xl">
        Catálogo completo
      </h1>
      <p className="mb-12 text-muted-foreground">
        Todos os {ofertas.length} imóveis disponíveis com Natanael Machado
        agora.
      </p>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3" ref={ref}>
        {ofertas.map((oferta) => (
          <OfertaCard key={oferta.id} oferta={oferta} />
        ))}
      </div>
    </main>
  );
}
