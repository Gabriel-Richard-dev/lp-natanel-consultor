import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ChevronDown, MessageCircle } from "lucide-react";
import logo from "@/assets/logo/logo-natanael.png";
import natanaelFoto from "@/assets/natanael/natanael-1.jpeg";
import { Particles } from "@/components/sections/particles";
import { useImoveis } from "@/hooks/use-imoveis";

const WHATSAPP_NUMBER = "5585987785187";

export function Hero() {
  const ref = useRef<HTMLDivElement>(null);
  const { imoveis } = useImoveis();

  useEffect(() => {
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
        scale: 1.06,
        duration: 1.1,
        ease: "power3.out",
      });
    }, ref);
    return () => ctx.revert();
  }, []);

  return (
    <section
      className="relative flex min-h-screen w-full items-center overflow-hidden bg-[#0b1210]"
      ref={ref}
    >
      <div className="hero-photo absolute inset-0 md:left-[38%]">
        <img
          alt="Natanael Machado, consultor de imóveis"
          className="h-full w-full scale-x-[-1] object-cover object-[center_10%] md:hidden"
          src={natanaelFoto}
        />
        <img
          alt="Natanael Machado, consultor de imóveis"
          className="hidden h-full w-full scale-x-[-1] object-cover object-[center_10%] md:block"
          src={natanaelFoto}
        />
        <div className="absolute inset-0 bg-linear-to-r from-[#0b1210] via-[#0b1210]/60 to-transparent md:hidden" />
        <div className="absolute inset-0 bg-linear-to-t from-[#0b1210] via-[#0b1210]/10 to-transparent md:hidden" />
        <div className="absolute inset-0 hidden bg-linear-to-r from-[#0b1210] via-[#0b1210]/70 to-transparent md:block" />
      </div>

      <Particles className="pointer-events-none absolute inset-0 z-[5]" />

      <div className="container relative z-10 mx-auto px-4 py-28 md:px-6">
        <div className="hero-text max-w-xl">
          <img alt="Natanael Machado" className="mb-8 h-24 w-auto" src={logo} />

          <h1 className="mb-6 font-bold text-4xl text-white tracking-tight sm:text-5xl md:text-6xl">
            Encontre o imóvel
            <br />
            <span className="bg-linear-to-r from-amber-300 via-amber-100 to-amber-300 bg-clip-text font-serif text-transparent italic">
              dos seus sonhos
            </span>
          </h1>

          <p className="mb-8 max-w-md text-base text-white/60 leading-relaxed sm:text-lg">
            Sou Natanael Machado, consultor de imóveis em Fortaleza, Eusébio
            e Maracanaú. Acompanho você do primeiro contato até as chaves na
            mão.
          </p>

          <p className="mb-10 border-white/15 border-t pt-4 text-white/50 text-xs tracking-wide sm:text-sm">
            CRECI-CE 20127 &nbsp;·&nbsp; Fortaleza, Eusébio e Maracanaú
            &nbsp;·&nbsp; {imoveis.length} imóveis disponíveis
          </p>

          <div className="flex flex-wrap gap-4">
            <a
              href={`https://wa.me/${WHATSAPP_NUMBER}`}
              rel="noreferrer"
              target="_blank"
            >
              <button
                className="flex items-center gap-2 rounded-lg bg-emerald-500 px-6 py-3 font-medium text-black transition-colors hover:bg-emerald-400"
                type="button"
              >
                <MessageCircle className="h-4 w-4" />
                Falar com Natanael
              </button>
            </a>
            <a
              className="flex items-center rounded-lg border border-white/20 px-6 py-3 font-medium text-white transition-colors hover:bg-white/10"
              href="#ofertas"
            >
              Ver imóveis
            </a>
          </div>
        </div>
      </div>

      <a
        aria-label="Rolar para saber mais"
        className="-translate-x-1/2 absolute bottom-6 left-1/2 z-10 animate-bounce text-white/60 transition-colors hover:text-white"
        href="#sobre"
      >
        <ChevronDown className="h-8 w-8" />
      </a>
    </section>
  );
}
