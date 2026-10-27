// O portal escreve a fase de dezenas de jeitos ("Obras avançadas", "Reta final de obra",
// "Em obras · acabamento"...). Para filtrar, agrupa em três.
export type FaseGrupo = "lancamento" | "obras" | "pronto";

export const FASES: { valor: FaseGrupo; label: string }[] = [
  { valor: "lancamento", label: "Lançamentos" },
  { valor: "obras", label: "Em obras" },
  { valor: "pronto", label: "Prontos para morar" },
];

export function grupoDaFase(fase: string | null): FaseGrupo | null {
  if (!fase) return null;
  if (/pronto/i.test(fase)) return "pronto";
  if (/lan[cç]amento|na planta/i.test(fase)) return "lancamento";
  if (/obra|constru|reta final|morar em breve|iniciad/i.test(fase)) return "obras";
  return null;
}
