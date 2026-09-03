import { BedDouble, Ruler, ShowerHead } from "lucide-react";

const WHATSAPP_NUMBER = "5585987785187";

const formatPreco = (valor: number) =>
  valor.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

function waLinkPara(titulo: string, url: string) {
  const texto = `Olá Natanael! Tenho interesse nessa oferta: "${titulo}" — ${url}`;
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(texto)}`;
}

export type Oferta = {
  id: string;
  titulo: string;
  preco: number;
  url: string;
  imagem: string;
  bairro: string;
  cidade: string;
  quartos: number | null;
  banheiros: number | null;
  area: string | null;
};

export function OfertaCard({ oferta }: { oferta: Oferta }) {
  return (
    <div
      className="oferta-card flex flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-sm"
      style={{ perspective: "1000px" }}
    >
      <img
        alt={oferta.titulo}
        className="h-48 w-full object-cover"
        loading="lazy"
        src={oferta.imagem}
      />
      <div className="flex flex-1 flex-col p-5">
        <span className="mb-1 font-semibold text-emerald-700 text-xl dark:text-emerald-400">
          {formatPreco(oferta.preco)}
        </span>
        <h3 className="mb-2 line-clamp-2 font-medium text-sm leading-snug">
          {oferta.titulo}
        </h3>
        <p className="mb-4 text-muted-foreground text-xs">
          {oferta.bairro}, {oferta.cidade}
        </p>

        <div className="mb-5 flex items-center gap-4 text-muted-foreground text-xs">
          {oferta.quartos && (
            <span className="flex items-center gap-1">
              <BedDouble className="h-3.5 w-3.5" /> {oferta.quartos}
            </span>
          )}
          {oferta.banheiros && (
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
          href={waLinkPara(oferta.titulo, oferta.url)}
          rel="noreferrer"
          target="_blank"
        >
          Quero essa oferta
        </a>
      </div>
    </div>
  );
}
