import { Menu, MessageCircle, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import logo from "@/assets/logo/logo-alves-costa.webp";
import { abertoAgora } from "@/lib/atendimento";
import { whatsappLink } from "@/lib/contato";
import { cn } from "@/lib/utils";

const LINKS = [
  { href: "#ofertas", label: "Imóveis" },
  { href: "#simulador", label: "Financiamento" },
  { href: "#como-funciona", label: "Como funciona" },
  { href: "#sobre", label: "Quem somos" },
  { href: "#contato", label: "Contato" },
];

export function SiteHeader() {
  const [aberto, setAberto] = useState(false);
  const [rolou, setRolou] = useState(false);
  const [ativo, setAtivo] = useState("");
  const progresso = useRef<HTMLSpanElement>(null);
  const aberta = abertoAgora();

  // sombra mais forte depois de rolar e linha dourada que acompanha o progresso da página
  useEffect(() => {
    const aoRolar = () => {
      setRolou(window.scrollY > 24);
      const total = document.documentElement.scrollHeight - window.innerHeight;
      progresso.current?.style.setProperty("--p", String(total > 0 ? Math.min(window.scrollY / total, 1) : 0));
    };
    aoRolar();
    window.addEventListener("scroll", aoRolar, { passive: true });
    return () => window.removeEventListener("scroll", aoRolar);
  }, []);

  // destaca no menu a seção que está no meio da tela
  useEffect(() => {
    const alvos = LINKS.map((l) => document.querySelector(l.href)).filter((el): el is Element => !!el);
    const io = new IntersectionObserver(
      (entradas) => {
        for (const e of entradas) if (e.isIntersecting) setAtivo(`#${e.target.id}`);
      },
      { rootMargin: "-45% 0px -50% 0px" }
    );
    for (const el of alvos) io.observe(el);
    const aoTopo = () => window.scrollY < 200 && setAtivo("");
    window.addEventListener("scroll", aoTopo, { passive: true });
    return () => {
      io.disconnect();
      window.removeEventListener("scroll", aoTopo);
    };
  }, []);

  return (
    <header className="fixed inset-x-0 top-3 z-50 px-3 md:top-4 md:px-6">
      <div
        className={cn(
          "relative mx-auto max-w-6xl border border-white/10 backdrop-blur-xl transition-[background-color,box-shadow,border-radius] duration-300",
          aberto ? "rounded-3xl" : "rounded-full",
          rolou || aberto ? "bg-fundo-marca/90 shadow-2xl shadow-black/40" : "bg-fundo-marca/55"
        )}
      >
        <div className="flex h-14 items-center justify-between pr-2 pl-5 md:h-16 md:pl-7">
          <a aria-label="Alves Costa, início" href="#top">
            <img alt="Alves Costa" className="h-10 w-auto md:h-11" src={logo} />
          </a>

          <nav aria-label="Principal" className="hidden items-center gap-1 md:flex">
            {LINKS.map((l) => (
              <a
                aria-current={ativo === l.href ? "location" : undefined}
                className={cn(
                  "relative rounded-full px-3.5 py-2 text-sm transition-colors",
                  ativo === l.href ? "text-gold" : "text-white/70 hover:text-white"
                )}
                href={l.href}
                key={l.href}
              >
                {l.label}
                <span
                  aria-hidden="true"
                  className={cn(
                    "-translate-x-1/2 absolute bottom-0.5 left-1/2 h-1 w-1 rounded-full bg-gold transition-all duration-300",
                    ativo === l.href ? "scale-100 opacity-100" : "scale-0 opacity-0"
                  )}
                />
              </a>
            ))}
          </nav>

          <div className="flex items-center gap-3">
            <span className="hidden items-center gap-2 text-white/70 text-xs xl:flex">
              <span aria-hidden="true" className={cn("h-2 w-2 rounded-full", aberta ? "bg-emerald-400" : "bg-white/30")} />
              {aberta ? "Aberto agora" : "Fechado agora"}
            </span>
            <a
              className="hidden items-center gap-2 rounded-full bg-gold px-5 py-2.5 font-semibold text-black text-sm transition-colors hover:bg-gold-claro md:flex"
              href={whatsappLink()}
              rel="noreferrer"
              target="_blank"
            >
              <MessageCircle className="h-4 w-4" /> WhatsApp
            </a>
            <button
              aria-expanded={aberto}
              aria-label={aberto ? "Fechar menu" : "Abrir menu"}
              className="flex h-10 w-10 items-center justify-center rounded-full text-white md:hidden"
              onClick={() => setAberto((v) => !v)}
              type="button"
            >
              {aberto ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {aberto && (
          <nav aria-label="Principal" className="flex flex-col gap-1 px-3 pb-4 md:hidden">
            {LINKS.map((l) => (
              <a
                className={cn(
                  "rounded-xl px-4 py-3 transition-colors hover:bg-white/5",
                  ativo === l.href ? "text-gold" : "text-white/85"
                )}
                href={l.href}
                key={l.href}
                onClick={() => setAberto(false)}
              >
                {l.label}
              </a>
            ))}
            <a
              className="mt-2 flex items-center justify-center gap-2 rounded-full bg-gold px-4 py-3 font-semibold text-black"
              href={whatsappLink()}
              rel="noreferrer"
              target="_blank"
            >
              <MessageCircle className="h-4 w-4" /> Falar no WhatsApp
            </a>
          </nav>
        )}

        <span
          aria-hidden="true"
          className="absolute right-8 bottom-0 left-8 h-px origin-left bg-gold"
          ref={progresso}
          style={{ transform: "scaleX(var(--p, 0))" }}
        />
      </div>
    </header>
  );
}
