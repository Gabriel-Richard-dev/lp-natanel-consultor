// Horário comercial (fuso de Fortaleza). dias: 0 = domingo ... 6 = sábado
export const HORARIOS = [
  { dias: [1, 2, 3, 4, 5], rotulo: "Segunda a sexta", abre: 8, fecha: 18 },
  { dias: [6], rotulo: "Sábado", abre: 8, fecha: 14 },
] as const;

export const horaCurta = (h: number) => `${h}h`;

const DIA = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 } as const;

export function abertoAgora(agora = new Date()) {
  const partes = new Intl.DateTimeFormat("en-US", {
    timeZone: "America/Fortaleza",
    weekday: "short",
    hour: "numeric",
    hourCycle: "h23",
  }).formatToParts(agora);
  const dia = DIA[partes.find((p) => p.type === "weekday")?.value as keyof typeof DIA];
  const hora = Number(partes.find((p) => p.type === "hour")?.value);
  return HORARIOS.some((h) => (h.dias as readonly number[]).includes(dia) && hora >= h.abre && hora < h.fecha);
}
