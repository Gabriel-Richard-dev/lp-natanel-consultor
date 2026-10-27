import { Menu, MessageCircle, X } from "lucide-react";
import { useEffect, useState } from "react";
import logo from "@/assets/logo/logo-alves-costa.png";
import { whatsappLink } from "@/lib/contato";
import { cn } from "@/lib/utils";

const LINKS = [
  { href: "#ofertas", label: "Imóveis" },
  { href: "#captacao", label: "Receba ofertas" },
  { href: "#simulador", label: "Financiamento" },
  { href: "#sobre", label: "Quem somos" },
  { href: "#contato", label: "Contato" },
];

export function SiteHeader() {
  const [rolou, setRolou] = useState(false);
  const [aberto, setAberto] = useState(false);

  useEffect(() => {
    const onScroll = () => setRolou(window.scrollY > 40);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const solido = rolou || aberto;

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-50 transition-colors duration-300",
        solido ? "border-white/10 border-b bg-fundo-marca/90 backdrop-blur" : "bg-transparent"
      )}
    >
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 md:px-6">
        <a aria-label="Alves Costa, início" href="#top">
          <img alt="Alves Costa" className="h-11 w-auto" src={logo} />
        </a>

        <nav aria-label="Principal" className="hidden items-center gap-7 md:flex">
          {LINKS.map((l) => (
            <a className="text-sm text-white/70 transition-colors hover:text-gold" href={l.href} key={l.href}>
              {l.label}
            </a>
          ))}
          <a
            className="flex items-center gap-2 rounded-lg bg-gold px-4 py-2 font-medium text-black text-sm transition-colors hover:bg-gold-claro"
            href={whatsappLink()}
            rel="noreferrer"
            target="_blank"
          >
            <MessageCircle className="h-4 w-4" /> WhatsApp
          </a>
        </nav>

        <button
          aria-expanded={aberto}
          aria-label={aberto ? "Fechar menu" : "Abrir menu"}
          className="p-2 text-white md:hidden"
          onClick={() => setAberto((v) => !v)}
          type="button"
        >
          {aberto ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {aberto && (
        <nav aria-label="Principal" className="flex flex-col gap-1 px-4 pb-5 md:hidden">
          {LINKS.map((l) => (
            <a
              className="rounded-lg px-3 py-3 text-white/80 hover:bg-white/5 hover:text-gold"
              href={l.href}
              key={l.href}
              onClick={() => setAberto(false)}
            >
              {l.label}
            </a>
          ))}
          <a
            className="mt-2 flex items-center justify-center gap-2 rounded-lg bg-gold px-4 py-3 font-medium text-black"
            href={whatsappLink()}
            rel="noreferrer"
            target="_blank"
          >
            <MessageCircle className="h-4 w-4" /> Falar no WhatsApp
          </a>
        </nav>
      )}
    </header>
  );
}
