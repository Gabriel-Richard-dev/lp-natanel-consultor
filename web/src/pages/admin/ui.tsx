import type { Imovel } from "@/lib/api";

// O que o layout do painel entrega para cada página.
export type Painel = {
  imoveis: Imovel[] | null;
  recarregar: () => Promise<void>;
  avisar: (texto: string, erro?: boolean) => void;
};

export const inputCls =
  "w-full rounded-md border border-linha bg-white px-3 py-2 text-sm text-tinta outline-none transition placeholder:text-apagado/50 focus:border-ouro focus:ring-2 focus:ring-ouro/20";

export const botaoPrimario =
  "inline-flex items-center justify-center gap-2 rounded-md bg-marca px-4 py-2 font-medium text-sm text-white transition hover:bg-marca-2 disabled:pointer-events-none disabled:opacity-50";

export const botaoSecundario =
  "inline-flex items-center justify-center gap-2 rounded-md border border-linha bg-white px-4 py-2 font-medium text-sm text-tinta transition hover:bg-papel disabled:pointer-events-none disabled:opacity-50";

export const cartao = "rounded-lg border border-linha bg-white";

export function Cabecalho({
  titulo,
  sobre,
  children,
}: {
  titulo: string;
  sobre?: React.ReactNode;
  children?: React.ReactNode;
}) {
  return (
    <header className="flex flex-col gap-4 border-linha border-b pb-5 sm:flex-row sm:items-end sm:justify-between">
      <div>
        {sobre && <div className="mb-1 text-apagado text-sm">{sobre}</div>}
        <h1 className="font-semibold text-2xl text-tinta tracking-tight">{titulo}</h1>
      </div>
      {children && <div className="flex gap-2">{children}</div>}
    </header>
  );
}

// Linha de formulário: título e explicação à esquerda, campos à direita.
export function Secao({
  titulo,
  dica,
  children,
}: {
  titulo: string;
  dica?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="grid gap-4 border-linha border-b px-5 py-6 last:border-b-0 md:grid-cols-[180px_1fr] md:gap-8 md:px-6">
      <div>
        <h2 className="font-medium text-sm text-tinta">{titulo}</h2>
        {dica && <p className="mt-1 text-apagado text-xs leading-relaxed">{dica}</p>}
      </div>
      <div className="min-w-0">{children}</div>
    </section>
  );
}

export function Campo({
  label,
  className,
  children,
}: {
  label: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <label className={className ?? "block"}>
      <span className="mb-1.5 block font-medium text-apagado text-xs">{label}</span>
      {children}
    </label>
  );
}
