// Conferência do simulador: `node web/src/lib/financiamento.check.ts` (Node 22.18+).
// Compara as fórmulas fechadas com uma amortização feita mês a mês.
import { type Sistema, simular } from "./financiamento.ts";

function confere(ok: boolean, oque: string) {
  if (!ok) throw new Error(`falhou: ${oque}`);
}

function mesAMes(financiado: number, n: number, i: number, sistema: Sistema) {
  const pmt = i === 0 ? financiado / n : (financiado * i) / (1 - (1 + i) ** -n);
  let saldo = financiado;
  let juros = 0;
  const parcelas: number[] = [];
  for (let mes = 0; mes < n; mes++) {
    const jurosMes = saldo * i;
    const amortizacao = sistema === "sac" ? financiado / n : pmt - jurosMes;
    parcelas.push(amortizacao + jurosMes);
    juros += jurosMes;
    saldo -= amortizacao;
  }
  return { parcelas, juros, saldo };
}

for (const sistema of ["sac", "price"] as const) {
  for (const taxaAnual of [0, 10.5, 13.75]) {
    const s = simular({ valor: 300_000, entrada: 60_000, anos: 30, taxaAnual, sistema });
    const i = (1 + taxaAnual / 100) ** (1 / 12) - 1;
    const ref = mesAMes(240_000, 360, i, sistema);
    const caso = `${sistema} a ${taxaAnual}%`;
    confere(s.financiado === 240_000, `${caso}: valor financiado`);
    confere(Math.abs(s.primeira - ref.parcelas[0]) < 0.01, `${caso}: primeira parcela`);
    confere(Math.abs(s.ultima - ref.parcelas[359]) < 0.01, `${caso}: última parcela`);
    confere(Math.abs(s.totalJuros - ref.juros) < 1, `${caso}: total de juros`);
    confere(Math.abs(ref.saldo) < 0.01, `${caso}: saldo quitado no fim`);
    confere(Math.abs(s.totalPago - (300_000 + ref.juros)) < 1, `${caso}: total pago`);
  }
}

const base = { valor: 300_000, entrada: 60_000, anos: 30, taxaAnual: 10.5 };
const sac = simular({ ...base, sistema: "sac" });
const price = simular({ ...base, sistema: "price" });
confere(sac.primeira > price.primeira, "SAC começa acima do Price");
confere(sac.ultima < price.ultima, "SAC termina abaixo do Price");
confere(sac.totalJuros < price.totalJuros, "SAC paga menos juros");
confere(Math.abs(sac.rendaMinima - sac.primeira / 0.3) < 0.01, "renda mínima = parcela / 30%");
confere(simular({ ...base, entrada: 400_000, sistema: "sac" }).financiado === 0, "entrada maior que o valor");

console.log("ok");
