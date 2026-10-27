import { MessageCircle } from "lucide-react";
import { whatsappLink } from "@/lib/contato";

export function WhatsappFlutuante() {
  return (
    <a
      aria-label="Falar com a Alves Costa no WhatsApp"
      className="fixed right-4 bottom-4 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-dourado text-nanquim shadow-lg shadow-nanquim/30 transition hover:scale-105 hover:brightness-110 md:right-6 md:bottom-6"
      href={whatsappLink("Olá! Vim pelo site da Alves Costa e gostaria de ajuda.")}
      rel="noreferrer"
      target="_blank"
    >
      <MessageCircle className="h-6 w-6" />
    </a>
  );
}
