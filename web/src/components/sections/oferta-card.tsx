import { BedDouble, Building2, Ruler, ShowerHead } from "lucide-react";
import type { Imovel } from "@/lib/api";
import { useTilt } from "@/hooks/use-tilt";
import { formatPreco, whatsappOferta } from "@/lib/contato";

export function OfertaCard({ oferta }: { oferta: Imovel }) {
  const tiltRef = useTilt<HTMLDivElement>();

  return (
    <div
      className="oferta-card flex flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-sm transition-shadow hover:shadow-xl"
      ref={tiltRef}
      style={{ perspective: "1000px", transformStyle: "preserve-3d" }}
    >
      <div className="relative h-48 w-full overflow-hidden bg-muted">
        {/* 135% de altura centralizada: sobra margem para o parallax da home
            (yPercent ±12) sem mostrar borda, e fica centrada onde não há parallax */}
        {oferta.imagem ? (
          <img
            alt={oferta.titulo}
            className="oferta-img absolute inset-x-0 top-[-17.5%] h-[135%] w-full object-cover"
            loading="lazy"
            src={oferta.imagem}
          />
        ) : (
          <div className="flex h-full items-center justify-center text-muted-foreground/40">
            <Building2 className="h-10 w-10" />
          </div>
        )}
      </div>
      <div className="flex flex-1 flex-col p-5">
        <span className="mb-1 font-semibold text-emerald-700 text-xl dark:text-emerald-400">
          {formatPreco(oferta.preco)}
        </span>
        <h3 className="mb-2 line-clamp-2 font-medium text-sm leading-snug">
          {oferta.titulo}
        </h3>
        <p className="mb-4 text-muted-foreground text-xs">
          {[oferta.bairro, oferta.cidade].filter(Boolean).join(", ")}
        </p>

        <div className="mb-5 flex items-center gap-4 text-muted-foreground text-xs">
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

        <a
          className="mt-auto rounded-lg bg-emerald-600 py-2.5 text-center font-medium text-sm text-white transition-colors hover:bg-emerald-700"
          href={whatsappOferta(oferta.titulo, oferta.url)}
          rel="noreferrer"
          target="_blank"
        >
          Quero essa oferta
        </a>
      </div>
    </div>
  );
}
