import { useEffect, useState } from "react";
import { type Imovel, listarImoveis } from "@/lib/api";

export function useImoveis() {
  const [imoveis, setImoveis] = useState<Imovel[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState(false);

  useEffect(() => {
    listarImoveis()
      .then(setImoveis)
      .catch(() => setErro(true))
      .finally(() => setCarregando(false));
  }, []);

  return { imoveis, carregando, erro };
}
