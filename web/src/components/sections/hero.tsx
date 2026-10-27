import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ChevronDown, MessageCircle } from "lucide-react";
import logo from "@/assets/logo/logo-alves-costa.png";
import { BuscaRapida } from "@/components/sections/busca-rapida";
import { Particles } from "@/components/sections/particles";
import { useImoveis } from "@/hooks/use-imoveis";
import { whatsappLink } from "@/lib/contato";
import { movimentoReduzido } from "@/lib/utils";

export function Hero() {
  const ref = useRef<HTMLDivElement>(null);
  const { imoveis } = useImoveis();

  useEffect(() => {
    if (movimentoReduzido()) return;
    const ctx = gsap.context(() => {
      gsap.from(".hero-text > *", {
        opacity: 0,
        y: 24,
        duration: 0.8,
        stagger: 0.12,
        ease: "power3.out",
      });
      gsap.from(".hero-photo", {
        opacity: 0,
        scale: 1.04,
        duration: 1.1,
        ease: "power3.out",
      });
    }, ref);
    return () => ctx.revert();
  }, []);

  return (
    <section
      className="relative flex min-h-screen w-full items-center overflow-hidden bg-[#0b0d12]"
      ref={ref}
    >
      <div className="hero-photo pointer-events-none absolute inset-0 bg-[radial-gradient(60%_70%_at_75%_45%,rgb(212_175_75/0.14),transparent_70%)]" />
      <img
        alt=""
        aria-hidden="true"
        className="hero-photo pointer-events-none absolute top-1/2 right-[6%] hidden w-[42%] max-w-2xl -translate-y-1/2 md:block"
        src={logo}
      />

      <Particles className="pointer-events-none absolute inset-0 z-[5]" />

      <div className="container relative z-10 mx-auto px-4 py-28 md:px-6">
        <div className="hero-text max-w-xl">
          <h1 className="mb-6 font-bold text-4xl text-white tracking-tight sm:text-5xl md:text-6xl">
            Encontre o imóvel
            <br />
            <span className="bg-linear-to-r from-gold via-gold-claro to-gold bg-clip-text font-serif text-transparent italic">
              dos seus sonhos
            </span>
          </h1>

          <p className="mb-6 max-w-md text-base text-white/60 leading-relaxed sm:text-lg">
            A Alves Costa é uma consultoria imobiliária em Fortaleza, Eusébio e
            Maracanaú. Acompanhamos você do primeiro contato até a entrega das
            chaves.
          </p>

          <BuscaRapida />

          <div className="flex flex-wrap gap-3">
            <a
              className="flex items-center gap-2 rounded-lg bg-gold px-6 py-3 font-medium text-black transition-colors hover:bg-gold-claro"
              href={whatsappLink()}
              rel="noreferrer"
              target="_blank"
            >
              <MessageCircle className="h-4 w-4" />
              Falar no WhatsApp
            </a>
            <a
              className="flex items-center rounded-lg border border-white/20 px-6 py-3 font-medium text-white transition-colors hover:bg-white/10"
              href="/catalogo"
            >
              Ver todos os imóveis
            </a>
          </div>

          <p className="mt-8 border-white/15 border-t pt-4 text-white/50 text-xs tracking-wide sm:text-sm">
            Fortaleza, Eusébio e Maracanaú &nbsp;·&nbsp; {imoveis.length}{" "}
            imóveis disponíveis
          </p>
        </div>
      </div>

      <a
        aria-label="Rolar para saber mais"
        className="-translate-x-1/2 absolute bottom-6 left-1/2 z-10 animate-bounce text-white/60 transition-colors hover:text-white"
        href="#ofertas"
      >
        <ChevronDown className="h-8 w-8" />
      </a>
    </section>
  );
}
