import { useEffect, useState } from "react";

// Rotas por caminho (/admin, /catalogo). O nginx (try_files) e o Vite já
// devolvem o index.html para qualquer caminho; aqui só trocamos a URL.
export function navegar(caminho: string) {
  history.pushState(null, "", caminho);
  window.dispatchEvent(new PopStateEvent("popstate"));
  window.scrollTo(0, 0);
}

// links antigos (#/admin, #/catalogo) viram o caminho equivalente
function rotaAtual() {
  if (location.hash.startsWith("#/")) {
    history.replaceState(null, "", location.hash.slice(1));
    window.scrollTo(0, 0);
  }
  return location.pathname;
}

export function useRota() {
  const [rota, setRota] = useState(rotaAtual);

  useEffect(() => {
    const aoMudar = () => setRota(rotaAtual());

    // <a href="/..."> interno navega sem recarregar; âncoras (#ofertas),
    // links externos, target=_blank e ctrl/cmd+clique seguem o padrão.
    const aoClicar = (e: MouseEvent) => {
      const link = (e.target as Element).closest("a");
      const href = link?.getAttribute("href");
      if (
        !link ||
        !href?.startsWith("/") ||
        href.startsWith("//") ||
        link.target ||
        e.defaultPrevented ||
        e.button !== 0 ||
        e.metaKey ||
        e.ctrlKey ||
        e.shiftKey ||
        e.altKey
      ) {
        return;
      }
      e.preventDefault();
      navegar(href);
    };

    window.addEventListener("popstate", aoMudar);
    window.addEventListener("hashchange", aoMudar);
    document.addEventListener("click", aoClicar);
    return () => {
      window.removeEventListener("popstate", aoMudar);
      window.removeEventListener("hashchange", aoMudar);
      document.removeEventListener("click", aoClicar);
    };
  }, []);

  return rota;
}
