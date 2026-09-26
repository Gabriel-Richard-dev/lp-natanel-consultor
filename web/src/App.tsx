import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useEffect } from "react";
import { AreaAtuacao } from "@/components/sections/area-atuacao";
import { Contato } from "@/components/sections/contato";
import { Hero } from "@/components/sections/hero";
import { Ofertas } from "@/components/sections/ofertas";
import { SimulacaoFinanciamento } from "@/components/sections/simulacao-financiamento";
import { Sobre } from "@/components/sections/sobre";
import { Admin } from "@/pages/admin";
import { Catalogo } from "@/pages/catalogo";
import { useRota } from "@/lib/rota";

// Os imóveis chegam da API depois do primeiro render e a página cresce; sem
// recalcular, os gatilhos de scroll das seções abaixo disparam no lugar errado
// e escondem o conteúdo que está na tela.
function useRecalcularScroll() {
  useEffect(() => {
    const observer = new ResizeObserver(() => ScrollTrigger.refresh());
    observer.observe(document.body);
    return () => observer.disconnect();
  }, []);
}

function App() {
  const rota = useRota();
  useRecalcularScroll();

  if (rota.startsWith("/admin")) {
    return <Admin rota={rota} />;
  }

  if (rota.startsWith("/catalogo")) {
    return <Catalogo />;
  }

  return (
    <main>
      <Hero />
      <Sobre />
      <Ofertas />
      <SimulacaoFinanciamento />
      <AreaAtuacao />
      <Contato />
    </main>
  );
}

export default App;
