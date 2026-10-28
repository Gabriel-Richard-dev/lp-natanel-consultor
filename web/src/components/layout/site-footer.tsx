import { MessageCircle } from "lucide-react";
import logo from "@/assets/logo/logo-alves-costa.webp";
import { Horario } from "@/components/layout/horario";
import { whatsappLink } from "@/lib/contato";

const NAV = [
  { href: "/catalogo", label: "Catálogo de imóveis" },
  { href: "#simulador", label: "Simular financiamento" },
  { href: "#como-funciona", label: "Como funciona" },
  { href: "#sobre", label: "Quem somos" },
  { href: "#contato", label: "Contato" },
];

export function SiteFooter() {
  return (
    <footer className="folha bg-preto pt-4 text-white/65 md:pt-6">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-14 md:grid-cols-[1.2fr_1fr_1.2fr] md:px-6">
        <div>
          <img alt="Alves Costa" className="mb-4 h-20 w-auto" src={logo} />
          <p className="max-w-xs text-sm leading-relaxed">
            Consultoria imobiliária em Fortaleza, Eusébio, Maracanaú e Caucaia. Do primeiro contato até a entrega das chaves.
          </p>
        </div>
        <nav aria-label="Rodapé">
          <h2 className="mb-4 font-display font-semibold text-white">Navegue</h2>
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
          <h2 className="mb-4 font-display font-semibold text-white">Horário de atendimento</h2>
          <Horario />
          <a
            className="mt-5 inline-flex items-center gap-2 rounded-md bg-gold px-4 py-2.5 font-semibold text-black text-sm transition-colors hover:bg-gold-claro"
            href={whatsappLink()}
            rel="noreferrer"
            target="_blank"
          >
            <MessageCircle className="h-4 w-4" /> Chamar no WhatsApp
          </a>
        </div>
      </div>
      <div className="border-white/10 border-t">
        <p className="mx-auto max-w-6xl px-4 py-5 text-white/45 text-xs md:px-6">
          © {new Date().getFullYear()} Alves Costa. Imagens ilustrativas dos empreendimentos; valores, condições e
          disponibilidade sujeitos a alteração sem aviso prévio. Seus dados são usados só para o nosso contato com você.
        </p>
      </div>
    </footer>
  );
}
