import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { WhatsappFlutuante } from "@/components/layout/whatsapp-flutuante";
import { Captacao } from "@/components/sections/captacao";
import { Cidades } from "@/components/sections/cidades";
import { ComoFunciona } from "@/components/sections/como-funciona";
import { Construtoras } from "@/components/sections/construtoras";
import { Hero } from "@/components/sections/hero";
import { Ofertas } from "@/components/sections/ofertas";
import { SimulacaoFinanciamento } from "@/components/sections/simulacao-financiamento";
import { Sobre } from "@/components/sections/sobre";
import { Admin } from "@/pages/admin";
import { Catalogo } from "@/pages/catalogo";
import { useRota } from "@/lib/rota";

function App() {
  const rota = useRota();

  if (rota.startsWith("/admin")) {
    return <Admin rota={rota} />;
  }

  if (rota.startsWith("/catalogo")) {
    return <Catalogo />;
  }

  return (
    <div className="bg-fundo-marca font-corpo text-white">
      <SiteHeader />
      <main>
        <Hero />
        <Ofertas />
        <Construtoras />
        <Cidades />
        <SimulacaoFinanciamento />
        <ComoFunciona />
        <Sobre />
        <Captacao />
      </main>
      <SiteFooter />
      <WhatsappFlutuante />
    </div>
  );
}

export default App;
