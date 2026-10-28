import { abertoAgora, HORARIOS, horaCurta } from "@/lib/atendimento";
import { cn } from "@/lib/utils";

export function Horario({ claro = false }: { claro?: boolean }) {
  const aberto = abertoAgora();

  return (
    <div>
      <p className={cn("flex items-center gap-2 font-medium text-sm", claro ? "text-fundo-marca" : "text-white")}>
        <span aria-hidden="true" className={cn("h-2 w-2 rounded-full", aberto ? "bg-emerald-500" : claro ? "bg-black/25" : "bg-white/30")} />
        {aberto ? "Aberto agora" : "Fechado agora"}
      </p>
      <dl className={cn("mt-2 space-y-1 text-sm", claro ? "text-fundo-marca/70" : "text-white/65")}>
        {HORARIOS.map((h) => (
          <div className="flex gap-3" key={h.rotulo}>
            <dt className="w-32 shrink-0">{h.rotulo}</dt>
            <dd className="tabular-nums">
              {horaCurta(h.abre)} às {horaCurta(h.fecha)}
            </dd>
          </div>
        ))}
      </dl>
    </div>
  );
}
