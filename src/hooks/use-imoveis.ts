import { useEffect, useState } from "react";
import { type Imovel, listarImoveis } from "@/lib/api";

export function useImoveis() {
  const [imoveis, setImoveis] = useState<Imovel[]>([]);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    listarImoveis()
      .then(setImoveis)
      .catch(() => setImoveis([]))
      .finally(() => setCarregando(false));
  }, []);

  return { imoveis, carregando };
}
