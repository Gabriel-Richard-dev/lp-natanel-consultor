import { Mail, MessageCircle } from "lucide-react";
import AttractButton from "@/components/kokonutui/attract-button";
import { useScrollReveal } from "@/hooks/use-scroll-reveal";

const WHATSAPP_NUMBER = "5585987785187";

export function Contato() {
  const ref = useScrollReveal<HTMLDivElement>();

  return (
    <section
      className="mx-auto max-w-3xl px-4 py-24 text-center md:px-6"
      id="contato"
      ref={ref}
    >
      <h2 className="mb-4 font-bold text-3xl tracking-tight md:text-4xl">
        Vamos conversar sobre seu próximo imóvel?
      </h2>
      <p className="mb-10 text-muted-foreground">
        Atendimento em Fortaleza, Eusébio e Maracanaú. Responda em minutos
        pelo WhatsApp.
      </p>

      <a
        href={`https://wa.me/${WHATSAPP_NUMBER}`}
        rel="noreferrer"
        target="_blank"
      >
        <AttractButton className="mx-auto gap-2 bg-emerald-600 text-white hover:bg-emerald-700">
          <MessageCircle className="h-4 w-4" />
          Chamar no WhatsApp
        </AttractButton>
      </a>

      <div className="mt-10 flex items-center justify-center gap-6 text-muted-foreground">
        <a
          aria-label="Instagram"
          className="hover:text-foreground"
          href="https://instagram.com"
          rel="noreferrer"
          target="_blank"
        >
          <svg
            className="h-5 w-5"
            fill="none"
            role="img"
            aria-hidden="true"
            stroke="currentColor"
            strokeWidth="2"
            viewBox="0 0 24 24"
          >
            <rect height="20" rx="5" ry="5" width="20" x="2" y="2" />
            <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
            <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
          </svg>
        </a>
        <a
          aria-label="E-mail"
          className="hover:text-foreground"
          href="mailto:contato@natanaelmachado.com.br"
        >
          <Mail className="h-5 w-5" />
        </a>
      </div>
    </section>
  );
}
