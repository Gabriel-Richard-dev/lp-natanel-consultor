import { ArrowLeft } from "lucide-react";
import logo from "@/assets/logo/logo-natanael.png";
import { OfertaRow } from "@/components/sections/oferta-row";
import { useImoveis } from "@/hooks/use-imoveis";

export function Catalogo() {
  const { imoveis: ofertas } = useImoveis();

  return (
    <main className="mx-auto max-w-5xl px-4 py-16 md:px-6">
      <div className="mb-10 flex items-center justify-between">
        <img alt="Natanael Machado" className="h-14 w-auto" src={logo} />
        <a
          className="flex items-center gap-1.5 font-medium text-muted-foreground text-sm hover:text-foreground"
          href="#"
        >
          <ArrowLeft className="h-4 w-4" />
          Voltar para o site
        </a>
      </div>

      <h1 className="mb-2 font-bold text-3xl tracking-tight md:text-4xl">
        Catálogo completo
      </h1>
      <p className="mb-4 text-muted-foreground">
        Todos os {ofertas.length} imóveis disponíveis com Natanael Machado
        agora.
      </p>

      <div className="divide-y divide-border">
        {ofertas.map((oferta, index) => (
          <OfertaRow index={index} key={oferta.id} oferta={oferta} />
        ))}
      </div>
    </main>
  );
}
