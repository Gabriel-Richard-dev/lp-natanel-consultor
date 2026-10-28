// Fundo do hero: grade de planta com quadrados dourados que acendem e apagam e um holofote que se desloca.
// Os quadrados ficam na mesma grade de 56px do .planta, então encaixam nas linhas.
const CELULA = 56;

// posições fixas (gerador simples com semente) para o fundo não mudar a cada render
function sorteio(semente: number) {
  let x = semente;
  return () => {
    x = (x * 1664525 + 1013904223) % 4294967296;
    return x / 4294967296;
  };
}
const aleatorio = sorteio(7);
// o bloco do texto (colunas 2 a 12, linhas 3 a 9) fica sem quadrados, para não atrapalhar a leitura
const noTexto = (coluna: number, linha: number) => coluna >= 2 && coluna <= 12 && linha >= 3 && linha <= 9;
const QUADRADOS: { coluna: number; linha: number; atraso: number; duracao: number }[] = [];
while (QUADRADOS.length < 20) {
  const coluna = Math.floor(aleatorio() * 25);
  const linha = Math.floor(aleatorio() * 14);
  if (noTexto(coluna, linha) || QUADRADOS.some((q) => q.coluna === coluna && q.linha === linha)) continue;
  QUADRADOS.push({ coluna, linha, atraso: aleatorio() * 8, duracao: 4 + aleatorio() * 5 });
}

export function FundoPlanta() {
  return (
    <>
      <div
        aria-hidden="true"
        className="-z-10 absolute -top-48 -left-48 h-[46rem] w-[46rem] animate-holofote rounded-full bg-[radial-gradient(closest-side,rgb(212_175_75/0.17),transparent)] blur-2xl motion-reduce:animate-none"
      />
      <div aria-hidden="true" className="-z-10 absolute -top-40 -right-40 h-[38rem] w-[38rem] rounded-full bg-gold/10 blur-3xl" />
      <div aria-hidden="true" className="planta -z-10 absolute inset-0 overflow-hidden">
        {QUADRADOS.map((q) => (
          <span
            className="absolute animate-quadrado bg-gold/15 motion-reduce:hidden"
            key={`${q.coluna}-${q.linha}`}
            style={{
              animationDelay: `${q.atraso.toFixed(2)}s`,
              animationDuration: `${q.duracao.toFixed(2)}s`,
              height: CELULA,
              left: q.coluna * CELULA,
              top: q.linha * CELULA,
              width: CELULA,
            }}
          />
        ))}
      </div>
    </>
  );
}
