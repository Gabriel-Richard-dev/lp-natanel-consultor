import { BedDouble, Building2, CalendarClock, Ruler, ShowerHead } from "lucide-react";
import type { Imovel } from "@/lib/api";
import { useTilt } from "@/hooks/use-tilt";
import { formatPreco } from "@/lib/contato";
import { cn } from "@/lib/utils";

export function OfertaCard({ oferta, onAbrir }: { oferta: Imovel; onAbrir: (oferta: Imovel) => void }) {
  const tiltRef = useTilt<HTMLDivElement>();

  return (
    <div
      className="oferta-card flex flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-sm transition-shadow hover:shadow-xl"
      ref={tiltRef}
      style={{ perspective: "1000px", transformStyle: "preserve-3d" }}
    >
      {/* o botão abaixo é o controle de teclado; clicar na foto faz o mesmo para quem usa mouse/toque */}
      <div className="relative h-48 w-full cursor-pointer overflow-hidden bg-muted" onClick={() => onAbrir(oferta)}>
        {/* 135% de altura centralizada: sobra margem para o parallax da home
            (yPercent ±12) sem mostrar borda, e fica centrada onde não há parallax */}
        {oferta.imagem ? (
          <img
            alt={oferta.titulo}
            className="oferta-img absolute inset-x-0 top-[-17.5%] h-[135%] w-full object-cover"
            decoding="async"
            loading="lazy"
            src={oferta.imagem}
          />
        ) : (
          <div className="flex h-full items-center justify-center text-muted-foreground/40">
            <Building2 className="h-10 w-10" />
          </div>
        )}
        {oferta.fase && (
          <span className="absolute top-3 left-3 rounded-full bg-fundo-marca/90 px-3 py-1 font-medium text-gold text-xs backdrop-blur">
            {oferta.fase}
          </span>
        )}
      </div>
      <div className="flex flex-1 flex-col p-5">
        {oferta.construtora && (
          <span className="mb-1 font-medium text-muted-foreground text-xs uppercase tracking-wide">
            {oferta.construtora}
          </span>
        )}
        {oferta.preco != null ? (
          <span className="mb-1 font-semibold text-gold-fundo text-xl dark:text-gold">
            {formatPreco(oferta.preco)}
          </span>
        ) : null}
        <h3 className={oferta.preco != null ? "mb-2 line-clamp-2 font-medium text-sm leading-snug" : "mb-2 line-clamp-2 font-semibold text-lg leading-snug"}>
          {oferta.titulo}
        </h3>
        <p className="mb-4 text-muted-foreground text-xs">
          {[oferta.bairro, oferta.cidade].filter(Boolean).join(", ")}
        </p>

        <div className={cn("flex items-center gap-4 text-muted-foreground text-xs", oferta.entrega ? "mb-2" : "mb-5")}>
          {!!oferta.quartos && (
            <span className="flex items-center gap-1">
              <BedDouble className="h-3.5 w-3.5" /> {oferta.quartos}
            </span>
          )}
          {!!oferta.banheiros && (
            <span className="flex items-center gap-1">
              <ShowerHead className="h-3.5 w-3.5" /> {oferta.banheiros}
            </span>
          )}
          {oferta.area && (
            <span className="flex items-center gap-1">
              <Ruler className="h-3.5 w-3.5" /> {oferta.area}
            </span>
          )}
        </div>
        {oferta.entrega && (
          <p className="mb-5 flex items-center gap-1 text-muted-foreground text-xs">
            <CalendarClock className="h-3.5 w-3.5" /> Entrega prevista: {oferta.entrega}
          </p>
        )}

        <button
          className="mt-auto rounded-lg bg-fundo-marca py-2.5 text-center font-medium text-gold text-sm transition-colors hover:bg-marca-2"
          onClick={() => onAbrir(oferta)}
          type="button"
        >
          Ver detalhes
        </button>
      </div>
    </div>
  );
}
