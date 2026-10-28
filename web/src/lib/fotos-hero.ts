import type { Imovel } from "@/lib/api";
import { grupoDaFase } from "@/lib/fase";
import { normalizar } from "@/lib/utils";

// Até cinco fotos de empreendimentos diferentes para o hero: pronto, lançamento, em obras, Eusébio e Maracanaú
export function escolherFotos(imoveis: Imovel[]) {
  const com = imoveis.filter((i) => i.imagem && i.origem === "habitnet");
  const em = (cidade: string) => (i: Imovel) => normalizar(i.cidade ?? "") === cidade;
  const escolhas = [
    com.find((i) => grupoDaFase(i.fase) === "pronto"),
    com.find((i) => grupoDaFase(i.fase) === "lancamento"),
    com.find((i) => grupoDaFase(i.fase) === "obras" && em("caucaia")(i)) ?? com.find((i) => grupoDaFase(i.fase) === "obras"),
    com.find(em("eusebio")),
    com.find(em("maracanau")),
  ].filter((i): i is Imovel => !!i);
  const unicos = [...new Map(escolhas.map((i) => [i.id, i])).values()];
  if (unicos.length) return unicos;
  const qualquer = imoveis.find((i) => i.imagem);
  return qualquer ? [qualquer] : [];
}

// Fotos que o hero não usa, de construtoras diferentes (para não repetir a mesma imagem logo abaixo)
export function outrasFotos(imoveis: Imovel[], quantas: number, pular = 0) {
  const noHero = new Set(escolherFotos(imoveis).map((i) => i.id));
  const vistas = new Set<string>();
  return imoveis
    .filter((i) => i.imagem && i.origem === "habitnet" && !noHero.has(i.id))
    .filter((i) => {
      const c = i.construtora ?? i.id;
      if (vistas.has(c)) return false;
      vistas.add(c);
      return true;
    })
    .slice(pular, pular + quantas);
}
