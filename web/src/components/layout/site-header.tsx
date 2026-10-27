import { Menu, MessageCircle, X } from "lucide-react";
import { useState } from "react";
import logo from "@/assets/logo/logo-alves-costa.webp";
import { whatsappLink } from "@/lib/contato";

const LINKS = [
  { href: "#ofertas", label: "Imóveis" },
  { href: "#simulador", label: "Financiamento" },
  { href: "#como-funciona", label: "Como funciona" },
  { href: "#sobre", label: "Quem somos" },
  { href: "#contato", label: "Contato" },
];

export function SiteHeader() {
  const [aberto, setAberto] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-white/10 border-b bg-fundo-marca/90 text-white backdrop-blur">
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
            className="flex items-center gap-2 rounded-md bg-gold px-4 py-2 font-semibold text-black text-sm transition-colors hover:bg-gold-claro"
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
          className="p-2 md:hidden"
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
              className="rounded-md px-3 py-3 text-white/85 hover:bg-white/5 hover:text-gold"
              href={l.href}
              key={l.href}
              onClick={() => setAberto(false)}
            >
              {l.label}
            </a>
          ))}
          <a
            className="mt-2 flex items-center justify-center gap-2 rounded-md bg-gold px-4 py-3 font-semibold text-black"
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
