export type Sistema = "sac" | "price";

export type Simulacao = {
  financiado: number;
  primeira: number;
  ultima: number;
  totalJuros: number;
  totalPago: number;
  rendaMinima: number;
};

// Bancos costumam limitar a parcela a 30% da renda bruta familiar.
const COMPROMETIMENTO_MAX = 0.3;

// Estimativa: não inclui seguros obrigatórios (MIP/DFI), taxa de
// administração nem TR. Conferência dos cálculos em financiamento.check.ts.
export function simular({
  valor,
  entrada,
  anos,
  taxaAnual,
  sistema,
}: {
  valor: number;
  entrada: number;
  anos: number;
  taxaAnual: number;
  sistema: Sistema;
}): Simulacao {
  const financiado = Math.max(valor - entrada, 0);
  const n = Math.max(Math.round(anos * 12), 1);
  // taxa efetiva ao ano -> equivalente ao mês
  const i = (1 + taxaAnual / 100) ** (1 / 12) - 1;

  let primeira: number;
  let ultima: number;
  let totalJuros: number;
  if (sistema === "sac") {
    // amortização constante: parcela = amortização + juros sobre o saldo
    const amortizacao = financiado / n;
    primeira = amortizacao + financiado * i;
    ultima = amortizacao * (1 + i);
    totalJuros = (financiado * i * (n + 1)) / 2;
  } else {
    primeira = i === 0 ? financiado / n : (financiado * i) / (1 - (1 + i) ** -n);
    ultima = primeira;
    totalJuros = primeira * n - financiado;
  }

  return {
    financiado,
    primeira,
    ultima,
    totalJuros,
    totalPago: Math.min(entrada, valor) + financiado + totalJuros,
    rendaMinima: primeira / COMPROMETIMENTO_MAX,
  };
}
