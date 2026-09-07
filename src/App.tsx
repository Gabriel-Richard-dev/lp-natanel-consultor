import { useEffect, useState } from "react";
import { AreaAtuacao } from "@/components/sections/area-atuacao";
import { Contato } from "@/components/sections/contato";
import { Hero } from "@/components/sections/hero";
import { Ofertas } from "@/components/sections/ofertas";
import { SimulacaoFinanciamento } from "@/components/sections/simulacao-financiamento";
import { Sobre } from "@/components/sections/sobre";
import { Catalogo } from "@/pages/catalogo";

function useHashRoute() {
  const [hash, setHash] = useState(window.location.hash);

  useEffect(() => {
    const onHashChange = () => {
      setHash(window.location.hash);
      window.scrollTo(0, 0);
    };
    window.addEventListener("hashchange", onHashChange);
    return () => window.removeEventListener("hashchange", onHashChange);
  }, []);

  return hash;
}

function App() {
  const hash = useHashRoute();

  if (hash.startsWith("#/catalogo")) {
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
