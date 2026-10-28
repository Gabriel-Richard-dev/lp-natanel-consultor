import { BedDouble, Building2, CalendarClock, Ruler, ShowerHead } from "lucide-react";
import type { Imovel } from "@/lib/api";
import { formatPreco } from "@/lib/contato";
import { cn } from "@/lib/utils";

export function OfertaCard({ oferta, onAbrir }: { oferta: Imovel; onAbrir: (oferta: Imovel) => void }) {
  return (
    <div className="flex flex-col overflow-hidden rounded-lg border border-black/10 bg-white font-corpo">
      {/* o botão abaixo é o controle de teclado; clicar na foto faz o mesmo para quem usa mouse/toque */}
      <div className="group relative h-48 w-full cursor-pointer overflow-hidden bg-black/5" onClick={() => onAbrir(oferta)}>
        {oferta.imagem ? (
          <img
            alt={oferta.titulo}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
            decoding="async"
            loading="lazy"
            src={oferta.imagem}
          />
        ) : (
          <div className="flex h-full items-center justify-center text-fundo-marca/20">
            <Building2 className="h-10 w-10" />
          </div>
        )}
        {oferta.fase && (
          <span className="absolute top-3 left-3 rounded-sm bg-fundo-marca px-2.5 py-1 font-medium text-gold text-xs">
            {oferta.fase}
          </span>
        )}
      </div>
      <div className="flex flex-1 flex-col p-5">
        {oferta.construtora && <span className="mb-1 font-medium text-ouro-texto text-sm">{oferta.construtora}</span>}
        {oferta.preco != null && (
          <span className="mb-1 font-display font-semibold text-fundo-marca text-xl">{formatPreco(oferta.preco)}</span>
        )}
        <h3
          className={cn(
            "mb-2 line-clamp-2 font-display text-fundo-marca leading-snug",
            oferta.preco != null ? "font-medium text-sm" : "font-semibold text-lg"
          )}
        >
          {oferta.titulo}
        </h3>
        <p className="mb-4 text-fundo-marca/70 text-xs">{[oferta.bairro, oferta.cidade].filter(Boolean).join(", ")}</p>

        <div className={cn("flex items-center gap-4 text-fundo-marca/70 text-xs", oferta.entrega ? "mb-2" : "mb-5")}>
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
          <p className="mb-5 flex items-center gap-1 text-fundo-marca/70 text-xs">
            <CalendarClock className="h-3.5 w-3.5" /> Entrega prevista: {oferta.entrega}
          </p>
        )}

        <button
          className="mt-auto rounded-md bg-gold py-2.5 text-center font-semibold text-black text-sm transition-colors hover:bg-gold-claro"
          onClick={() => onAbrir(oferta)}
          type="button"
        >
          Ver detalhes
        </button>
      </div>
    </div>
  );
}
