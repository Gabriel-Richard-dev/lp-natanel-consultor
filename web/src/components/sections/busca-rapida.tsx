import { Search } from "lucide-react";
import { useState } from "react";
import { FASES } from "@/lib/fase";
import { navegar } from "@/lib/rota";

const CIDADES = ["Fortaleza", "Eusébio", "Maracanaú", "Caucaia"];

const campo =
  "w-full rounded-lg border border-white/15 bg-white/5 px-3 py-3 text-sm text-white outline-none focus:border-gold focus:ring-2 focus:ring-gold/25";

// Leva os filtros para o catálogo pela URL (o catálogo lê ?cidade=&fase=&quartos=)
export function BuscaRapida() {
  const [cidade, setCidade] = useState("");
  const [fase, setFase] = useState("");
  const [quartos, setQuartos] = useState("");

  function buscar(e: React.FormEvent) {
    e.preventDefault();
    const q = new URLSearchParams();
    if (cidade) q.set("cidade", cidade);
    if (fase) q.set("fase", fase);
    if (quartos) q.set("quartos", quartos);
    navegar(`/catalogo${q.size ? `?${q}` : ""}`);
  }

  return (
    <form
      aria-label="Buscar imóveis"
      className="mb-6 grid gap-3 rounded-2xl border border-white/10 bg-white/[0.04] p-3 backdrop-blur sm:grid-cols-[1fr_1fr_auto_auto]"
      onSubmit={buscar}
    >
      <select aria-label="Cidade" className={campo} onChange={(e) => setCidade(e.target.value)} value={cidade}>
        <option className="text-black" value="">
          Qualquer cidade
        </option>
        {CIDADES.map((c) => (
          <option className="text-black" key={c}>
            {c}
          </option>
        ))}
      </select>
      <select aria-label="Fase" className={campo} onChange={(e) => setFase(e.target.value)} value={fase}>
        <option className="text-black" value="">
          Qualquer fase
        </option>
        {FASES.map((f) => (
          <option className="text-black" key={f.valor} value={f.valor}>
            {f.label}
          </option>
        ))}
      </select>
      <select aria-label="Quartos" className={campo} onChange={(e) => setQuartos(e.target.value)} value={quartos}>
        <option className="text-black" value="">
          Quartos
        </option>
        {[1, 2, 3].map((q) => (
          <option className="text-black" key={q} value={q}>
            {q}+
          </option>
        ))}
      </select>
      <button
        className="flex items-center justify-center gap-2 rounded-lg bg-gold px-5 py-3 font-semibold text-black text-sm transition-colors hover:bg-gold-claro"
        type="submit"
      >
        <Search className="h-4 w-4" /> Buscar
      </button>
    </form>
  );
}
