import { MessageCircle } from "lucide-react";
import logo from "@/assets/logo/logo-alves-costa.png";
import { whatsappLink } from "@/lib/contato";

const NAV = [
  { href: "/catalogo", label: "Catálogo de imóveis" },
  { href: "#captacao", label: "Receba ofertas" },
  { href: "#simulador", label: "Simular financiamento" },
  { href: "#sobre", label: "Quem somos" },
  { href: "#contato", label: "Contato" },
];

export function SiteFooter() {
  return (
    <footer className="bg-fundo-marca text-white/70">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-14 md:grid-cols-[1.2fr_1fr_1fr] md:px-6">
        <div>
          <img alt="Alves Costa" className="mb-4 h-20 w-auto" src={logo} />
          <p className="max-w-xs text-sm leading-relaxed">
            Consultoria imobiliária em Fortaleza, Eusébio e Maracanaú. Do primeiro contato até a entrega das chaves.
          </p>
        </div>
        <nav aria-label="Rodapé">
          <h2 className="mb-4 font-medium text-gold text-sm uppercase tracking-wide">Navegue</h2>
          <ul className="space-y-2.5 text-sm">
            {NAV.map((l) => (
              <li key={l.href}>
                <a className="transition-colors hover:text-gold" href={l.href}>
                  {l.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>
        <div>
          <h2 className="mb-4 font-medium text-gold text-sm uppercase tracking-wide">Fale com a gente</h2>
          <a
            className="inline-flex items-center gap-2 rounded-lg bg-gold px-4 py-2.5 font-medium text-black text-sm transition-colors hover:bg-gold-claro"
            href={whatsappLink()}
            rel="noreferrer"
            target="_blank"
          >
            <MessageCircle className="h-4 w-4" /> Chamar no WhatsApp
          </a>
          <p className="mt-4 text-sm">Atendimento em Fortaleza, Eusébio e Maracanaú.</p>
        </div>
      </div>
      <div className="border-white/10 border-t">
        <p className="mx-auto max-w-6xl px-4 py-5 text-white/40 text-xs md:px-6">
          © {new Date().getFullYear()} Alves Costa. Imagens ilustrativas dos empreendimentos; valores, condições e
          disponibilidade sujeitos a alteração sem aviso prévio. Seus dados são usados só para o nosso contato com você.
        </p>
      </div>
    </footer>
  );
}
