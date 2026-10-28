import { cn } from "@/lib/utils";

type Opcao<T extends string | number> = { valor: T; label: string };

// Opções lado a lado (fase, quartos): dá para ver tudo sem abrir uma lista
export function Segmentado<T extends string | number>({
  rotulo,
  opcoes,
  valor,
  onChange,
  className,
  claro = false,
}: {
  rotulo: string;
  opcoes: Opcao<T>[];
  valor: T;
  onChange: (valor: T) => void;
  className?: string;
  claro?: boolean;
}) {
  return (
    <div
      aria-label={rotulo}
      className={cn("flex gap-1 rounded-lg border p-1", claro ? "border-black/15 bg-white" : "border-white/15 bg-white/5", className)}
      role="group"
    >
      {opcoes.map((o) => (
        <button
          aria-pressed={valor === o.valor}
          className={cn(
            "h-10 grow whitespace-nowrap rounded-md px-2 text-sm transition-colors",
            valor === o.valor
              ? "bg-gold font-semibold text-black"
              : claro
                ? "text-fundo-marca/75 hover:bg-black/5 hover:text-fundo-marca"
                : "text-white/75 hover:bg-white/10 hover:text-white"
          )}
          key={String(o.valor)}
          onClick={() => onChange(o.valor)}
          type="button"
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}
