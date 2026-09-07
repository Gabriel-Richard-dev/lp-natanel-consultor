import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { BedDouble, Ruler, ShowerHead } from "lucide-react";
import { useEffect, useRef } from "react";
import type { Imovel } from "@/lib/api";
import { useTilt } from "@/hooks/use-tilt";

gsap.registerPlugin(ScrollTrigger);

const WHATSAPP_NUMBER = "5585987785187";

const formatPreco = (valor: number) =>
  valor.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

function waLinkPara(titulo: string, url: string) {
  const texto = `Olá Natanael! Tenho interesse nessa oferta: "${titulo}" — ${url}`;
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(texto)}`;
}

export function OfertaRow({
  oferta,
  index,
}: {
  oferta: Imovel;
  index: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const tiltRef = useTilt<HTMLDivElement>(6, { scale: false });
  const invertido = index % 2 === 1;

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const ctx = gsap.context(() => {
      gsap.fromTo(
        ".oferta-row-foto",
        { scale: 1.15, opacity: 0 },
        {
          scale: 1,
          opacity: 1,
          ease: "power2.out",
          scrollTrigger: {
            trigger: el,
            start: "top 85%",
            end: "top 40%",
            scrub: 0.6,
          },
        }
      );
      gsap.to(".oferta-row-img", {
        yPercent: 10,
        ease: "none",
        scrollTrigger: {
          trigger: el,
          start: "top bottom",
          end: "bottom top",
          scrub: true,
        },
      });
      gsap.fromTo(
        ".oferta-row-info > *",
        { opacity: 0, x: invertido ? -40 : 40 },
        {
          opacity: 1,
          x: 0,
          stagger: 0.08,
          ease: "power3.out",
          scrollTrigger: {
            trigger: el,
            start: "top 75%",
            end: "top 45%",
            scrub: 0.6,
          },
        }
      );
    }, el);

    return () => ctx.revert();
  }, [invertido]);

  return (
    <div
      className="oferta-row grid items-center gap-8 py-12 transition-[opacity,filter] duration-300 md:grid-cols-2 md:gap-12 md:py-20"
      ref={ref}
    >
      <div
        className={`oferta-row-foto relative h-72 overflow-hidden rounded-2xl shadow-lg md:h-[26rem] ${
          invertido ? "md:order-2" : ""
        }`}
        ref={tiltRef}
        style={{ perspective: "1000px", transformStyle: "preserve-3d" }}
      >
        <img
          alt={oferta.titulo}
          className="oferta-row-img absolute inset-0 h-[125%] w-full object-cover"
          loading="lazy"
          src={oferta.imagem ?? undefined}
        />
      </div>

      <div
        className={`oferta-row-info ${invertido ? "md:order-1" : ""}`}
      >
        <span className="mb-3 block font-bold text-6xl text-border md:text-7xl">
          {String(index + 1).padStart(2, "0")}
        </span>
        <span className="mb-2 block font-semibold text-emerald-700 text-3xl dark:text-emerald-400">
          {formatPreco(oferta.preco)}
        </span>
        <h3 className="mb-2 font-medium text-xl leading-snug">
          {oferta.titulo}
        </h3>
        <p className="mb-5 text-muted-foreground text-sm">
          {oferta.bairro}, {oferta.cidade}
        </p>

        <div className="mb-6 flex items-center gap-5 text-muted-foreground text-sm">
          {oferta.quartos && (
            <span className="flex items-center gap-1.5">
              <BedDouble className="h-4 w-4" /> {oferta.quartos}
            </span>
          )}
          {oferta.banheiros && (
            <span className="flex items-center gap-1.5">
              <ShowerHead className="h-4 w-4" /> {oferta.banheiros}
            </span>
          )}
          {oferta.area && (
            <span className="flex items-center gap-1.5">
              <Ruler className="h-4 w-4" /> {oferta.area}
            </span>
          )}
        </div>

        <a
          className="inline-flex items-center rounded-lg bg-emerald-600 px-6 py-2.5 font-medium text-sm text-white transition-colors hover:bg-emerald-700"
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
