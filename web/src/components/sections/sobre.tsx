import logo from "@/assets/logo/logo-alves-costa.webp";
import { Revelar } from "@/components/ui/revelar";
import { Skyline } from "@/components/ui/skyline";
import { useImoveis } from "@/hooks/use-imoveis";
import { useParallax } from "@/hooks/use-parallax";
import { useVisivel } from "@/hooks/use-visivel";
import { outrasFotos } from "@/lib/fotos-hero";
import { cn } from "@/lib/utils";

// Janela em arco (o mesmo desenho do hero): a foto "abre" de baixo para cima e anda num ritmo próprio na rolagem
function Arco({ src, className, fator, atraso }: { src?: string | null; className?: string; fator: number; atraso: number }) {
  const paralaxe = useParallax<HTMLDivElement>(fator);
  const [ref, visivel] = useVisivel<HTMLDivElement>();
  return (
    <div className={className} ref={paralaxe}>
      <div className="relative h-full" ref={ref}>
        <div aria-hidden="true" className="absolute inset-0 -translate-x-2 translate-y-2 rounded-t-[999px] rounded-b-xl border border-gold/40" />
        <div
          className={cn(
            "relative h-full overflow-hidden rounded-t-[999px] rounded-b-xl bg-marca transition-[clip-path] duration-[1200ms] ease-out",
            visivel ? "[clip-path:inset(0_0_0_0)]" : "[clip-path:inset(100%_0_0_0)]"
          )}
          style={{ transitionDelay: visivel ? `${atraso}ms` : undefined }}
        >
          {src && <img alt="" className="h-full w-full object-cover" decoding="async" loading="lazy" src={src} />}
        </div>
      </div>
    </div>
  );
}

export function Sobre() {
  const { imoveis } = useImoveis();
  const [a, b] = outrasFotos(imoveis, 2, 1);

  return (
    <section className="folha overflow-hidden bg-fundo-marca pt-24 pb-32 text-white md:pt-[7.5rem] md:pb-40" id="sobre">
      <div className="mx-auto grid max-w-6xl items-center gap-14 px-4 md:px-6 lg:grid-cols-[0.9fr_1.1fr]">
        <div className="mx-auto flex w-full max-w-sm gap-5">
          <Arco atraso={0} className="mt-14 aspect-[3/5] w-1/2" fator={0.06} src={a?.imagem} />
          <Arco atraso={200} className="aspect-[3/5] w-1/2" fator={-0.05} src={b?.imagem} />
        </div>
        <Revelar>
          <img alt="Alves Costa" className="mb-8 w-48" loading="lazy" src={logo} />
          <h2 className="font-display font-semibold text-3xl tracking-tight md:text-4xl">
            Consultoria imobiliária em Fortaleza e região
          </h2>
          <p className="mt-5 max-w-xl text-white/65 leading-relaxed">
            A Alves Costa atende quem quer comprar, investir ou vender um imóvel em Fortaleza, Eusébio, Maracanaú e
            Caucaia. Acompanhamos as visitas, a simulação e a documentação até a entrega das chaves.
          </p>
        </Revelar>
      </div>
      <Skyline className="absolute inset-x-0 bottom-0 h-20 w-full text-gold/10 md:h-28" />
    </section>
  );
}
