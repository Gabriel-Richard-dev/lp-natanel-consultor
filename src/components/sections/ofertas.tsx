import { ArrowRight } from "lucide-react";
import ofertas from "@/data/ofertas.json";
import { OfertaCard } from "@/components/sections/oferta-card";
import { useCardReveal } from "@/hooks/use-card-reveal";

const PREVIEW_COUNT = 6;

export function Ofertas() {
  const ref = useCardReveal<HTMLDivElement>(".oferta-card");
  const preview = ofertas.slice(0, PREVIEW_COUNT);

  return (
    <section className="mx-auto max-w-6xl px-4 py-24 md:px-6" id="ofertas">
      <h2 className="mb-4 text-center font-bold text-3xl tracking-tight md:text-4xl">
        Imóveis disponíveis agora
      </h2>
      <p className="mx-auto mb-16 max-w-xl text-center text-muted-foreground">
        Seleção atualizada direto do meu portfólio no Chaves na Mão.
      </p>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3" ref={ref}>
        {preview.map((oferta) => (
          <OfertaCard key={oferta.id} oferta={oferta} />
        ))}
      </div>

      {ofertas.length > PREVIEW_COUNT && (
        <div className="mt-12 text-center">
          <a
            className="inline-flex items-center gap-2 font-medium text-emerald-700 hover:underline dark:text-emerald-400"
            href="#/catalogo"
          >
            Ver catálogo completo ({ofertas.length} imóveis)
            <ArrowRight className="h-4 w-4" />
          </a>
        </div>
      )}
    </section>
  );
}
