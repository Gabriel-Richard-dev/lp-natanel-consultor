import { ArrowRight, MessageCircle } from "lucide-react";
import { useState } from "react";
import { ImovelDialog } from "@/components/sections/imovel-dialog";
import { OfertaCard } from "@/components/sections/oferta-card";
import { useImoveis } from "@/hooks/use-imoveis";
import { useOfertasScroll } from "@/hooks/use-ofertas-scroll";
import type { Imovel } from "@/lib/api";
import { whatsappLink } from "@/lib/contato";

const PREVIEW_COUNT = 6;

// A API devolve agrupado por construtora; na vitrine da home alterna entre elas
// para os 6 cards mostrarem variedade em vez de uma construtora só.
function intercalar(imoveis: Imovel[]) {
  const grupos = new Map<string, Imovel[]>();
  for (const i of imoveis) grupos.set(i.construtora ?? "", [...(grupos.get(i.construtora ?? "") ?? []), i]);
  const filas = [...grupos.values()];
  const saida: Imovel[] = [];
  for (let n = 0; saida.length < imoveis.length; n++) {
    for (const fila of filas) if (fila[n]) saida.push(fila[n]);
  }
  return saida;
}

export function Ofertas() {
  const { imoveis: ofertas, carregando, erro } = useImoveis();
  const [aberto, setAberto] = useState<Imovel | null>(null);
  const ref = useOfertasScroll<HTMLDivElement>([ofertas.length]);
  const preview = intercalar(ofertas).slice(0, PREVIEW_COUNT);

  return (
    <section className="mx-auto max-w-6xl px-4 py-24 md:px-6" id="ofertas">
      <h2 className="mb-4 text-center font-bold text-3xl tracking-tight md:text-4xl">
        Imóveis disponíveis agora
      </h2>
      <p className="mx-auto mb-16 max-w-xl text-center text-muted-foreground">
        Seleção atualizada com as melhores oportunidades de Fortaleza e região.
      </p>

      {carregando ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }, (_, i) => (
            <div className="h-96 animate-pulse rounded-2xl bg-muted" key={i} />
          ))}
        </div>
      ) : preview.length ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3" ref={ref}>
          {preview.map((oferta) => (
            <OfertaCard key={oferta.id} oferta={oferta} onAbrir={setAberto} />
          ))}
        </div>
      ) : (
        <div className="mx-auto max-w-xl rounded-2xl border border-border border-dashed py-14 text-center">
          <p className="font-medium">
            {erro ? "Não conseguimos carregar os imóveis agora." : "Estamos atualizando nossa seleção."}
          </p>
          <p className="mt-1 text-muted-foreground text-sm">Fale com a gente e receba as melhores opções direto no WhatsApp.</p>
          <a
            className="mt-5 inline-flex items-center gap-2 rounded-lg bg-fundo-marca px-5 py-3 font-medium text-gold text-sm hover:bg-marca-2"
            href={whatsappLink("Olá! Quero conhecer os imóveis disponíveis.")}
            rel="noreferrer"
            target="_blank"
          >
            <MessageCircle className="h-4 w-4" /> Chamar no WhatsApp
          </a>
        </div>
      )}
      {aberto && <ImovelDialog imovel={aberto} onFechar={() => setAberto(null)} />}

      {ofertas.length > PREVIEW_COUNT && (
        <div className="mt-12 text-center">
          <a
            className="inline-flex items-center gap-2 font-medium text-gold-fundo hover:underline dark:text-gold"
            href="/catalogo"
          >
            Ver catálogo completo ({ofertas.length} imóveis)
            <ArrowRight className="h-4 w-4" />
          </a>
        </div>
      )}
    </section>
  );
}
