import { Building2, MessageCircle } from "lucide-react";
import { useState } from "react";
import { Revelar } from "@/components/ui/revelar";
import { ImovelDialog } from "@/components/sections/imovel-dialog";
import { useImoveis } from "@/hooks/use-imoveis";
import type { Imovel } from "@/lib/api";
import { escolherFotos } from "@/lib/fotos-hero";
import { whatsappLink } from "@/lib/contato";

const NA_LISTA = 4;

// A API devolve agrupado por construtora; na vitrine da home alterna entre elas
// para os destaques mostrarem variedade em vez de uma construtora só.
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

const quem = (i: Imovel) => [i.construtora, i.fase].filter(Boolean).join(", ");
const onde = (i: Imovel) => [i.bairro, i.cidade].filter(Boolean).join(", ");
const ficha = (i: Imovel) =>
  [
    i.quartos ? `${i.quartos} ${i.quartos === 1 ? "quarto" : "quartos"}` : null,
    i.area,
    i.entrega ? `entrega ${i.entrega}` : null,
  ]
    .filter(Boolean)
    .join(", ");

function Foto({ imovel, className }: { imovel: Imovel; className: string }) {
  return (
    <div className={`overflow-hidden bg-black/5 ${className}`}>
      {imovel.imagem ? (
        <img
          alt=""
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
          decoding="async"
          loading="lazy"
          src={imovel.imagem}
        />
      ) : (
        <div className="flex h-full items-center justify-center text-fundo-marca/20">
          <Building2 className="h-10 w-10" />
        </div>
      )}
    </div>
  );
}

export function Ofertas() {
  const { imoveis, carregando, erro } = useImoveis();
  const [aberto, setAberto] = useState<Imovel | null>(null);
  const noHero = new Set(escolherFotos(imoveis).map((i) => i.id));
  const [destaque, ...resto] = intercalar(imoveis.filter((i) => !noHero.has(i.id))).slice(0, NA_LISTA + 1);

  return (
    <section className="bg-prata folha pt-24 pb-20 md:pt-[7.5rem] md:pb-24" id="ofertas">
      <div className="mx-auto max-w-6xl px-4 md:px-6">
        <Revelar>
          <h2 className="max-w-2xl font-display font-semibold text-3xl text-fundo-marca tracking-tight md:text-4xl">
            Alguns para começar
          </h2>
          <p className="mt-3 max-w-xl text-fundo-marca/70 leading-relaxed">
            O valor muda de unidade para unidade, então confirmamos com você no atendimento.
          </p>
        </Revelar>

        {carregando ? (
          <div className="mt-12 grid gap-8 lg:grid-cols-[1.4fr_1fr]">
            <div className="h-96 animate-pulse rounded-lg bg-black/5" />
            <div className="h-96 animate-pulse rounded-lg bg-black/5" />
          </div>
        ) : destaque ? (
          <div className="mt-12 grid gap-10 lg:grid-cols-[1.4fr_1fr]">
            <button
              className="group text-left"
              onClick={() => setAberto(destaque)}
              type="button"
            >
              <Foto className="aspect-[16/10] rounded-lg" imovel={destaque} />
              <span className="mt-4 block text-ouro-texto text-sm">{quem(destaque)}</span>
              <span className="mt-1 block font-display font-semibold text-2xl text-fundo-marca leading-snug group-hover:text-ouro-texto">
                {destaque.titulo}
              </span>
              <span className="mt-1 block text-fundo-marca/70 text-sm">{onde(destaque)}</span>
              <span className="mt-1 block text-fundo-marca/70 text-sm">{ficha(destaque)}</span>
              <span className="mt-3 inline-block font-medium text-fundo-marca text-sm underline decoration-2 decoration-gold underline-offset-4">
                Ver detalhes
              </span>
            </button>

            <ul className="divide-y divide-black/10 border-black/10 border-y lg:self-start">
              {resto.map((i, n) => (
                <Revelar as="li" atraso={n * 90} key={i.id}>
                  <button
                    className="group flex w-full gap-4 py-4 text-left"
                    onClick={() => setAberto(i)}
                    type="button"
                  >
                    <Foto className="h-24 w-28 shrink-0 rounded-md" imovel={i} />
                    <span className="min-w-0">
                      <span className="block text-ouro-texto text-xs">{quem(i)}</span>
                      <span className="mt-0.5 line-clamp-2 block font-display font-semibold text-fundo-marca leading-snug group-hover:text-ouro-texto">
                        {i.titulo}
                      </span>
                      <span className="mt-1 block truncate text-fundo-marca/70 text-xs">{onde(i)}</span>
                    </span>
                  </button>
                </Revelar>
              ))}
            </ul>
          </div>
        ) : (
          <div className="mt-12 max-w-xl rounded-lg border border-black/10 border-dashed p-8">
            <p className="font-display font-semibold text-lg text-fundo-marca">
              {erro ? "Não conseguimos carregar os imóveis agora." : "Estamos atualizando a lista de imóveis."}
            </p>
            <p className="mt-1 text-fundo-marca/70 text-sm">Chame a gente e receba as opções direto no WhatsApp.</p>
            <a
              className="mt-5 inline-flex items-center gap-2 rounded-md bg-gold px-5 py-3 font-semibold text-black text-sm hover:bg-gold-claro"
              href={whatsappLink("Olá! Quero conhecer os imóveis disponíveis.")}
              rel="noreferrer"
              target="_blank"
            >
              <MessageCircle className="h-4 w-4" /> Chamar no WhatsApp
            </a>
          </div>
        )}

        {imoveis.length > NA_LISTA + 1 && (
          <a
            className="mt-12 inline-block rounded-md border-2 border-fundo-marca px-6 py-3 font-semibold text-fundo-marca transition-colors hover:bg-fundo-marca hover:text-gold"
            href="/catalogo"
          >
            Ver os {imoveis.length} imóveis do catálogo
          </a>
        )}
      </div>
      {aberto && <ImovelDialog imovel={aberto} onFechar={() => setAberto(null)} />}
    </section>
  );
}
