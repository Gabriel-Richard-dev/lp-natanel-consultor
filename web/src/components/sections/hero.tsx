import { MessageCircle } from "lucide-react";
import { useState } from "react";
import { Horario } from "@/components/layout/horario";
import { useImoveis } from "@/hooks/use-imoveis";
import { CIDADES_ATENDIDAS } from "@/lib/cidades";
import { whatsappLink } from "@/lib/contato";
import { FASES, grupoDaFase } from "@/lib/fase";
import { navegar } from "@/lib/rota";
import { normalizar } from "@/lib/utils";

const QUARTOS = [1, 2, 3];

export function Hero() {
  const { imoveis, carregando } = useImoveis();
  const [cidade, setCidade] = useState("");
  const [fase, setFase] = useState("");
  const [quartos, setQuartos] = useState(0);

  // mesmo critério do catálogo: cidade igual, fase do grupo, quartos a partir de N
  const encontrados = imoveis.filter(
    (i) =>
      (!cidade || normalizar(i.cidade ?? "") === normalizar(cidade)) &&
      (!fase || grupoDaFase(i.fase) === fase) &&
      (!quartos || (i.quartos ?? 0) >= quartos)
  ).length;

  const porFase = FASES.map((f) => ({ ...f, n: imoveis.filter((i) => grupoDaFase(i.fase) === f.valor).length }));
  const maior = Math.max(1, ...porFase.map((f) => f.n));
  const comFase = porFase.reduce((soma, f) => soma + f.n, 0);

  function buscar(e: React.FormEvent) {
    e.preventDefault();
    const q = new URLSearchParams();
    if (cidade) q.set("cidade", cidade);
    if (fase) q.set("fase", fase);
    if (quartos) q.set("quartos", String(quartos));
    navegar(`/catalogo${q.size ? `?${q}` : ""}`);
  }

  return (
    <section className="bg-cal pt-14 pb-20 md:pt-20 md:pb-28" id="top">
      <h1 className="sr-only">Alves Costa: imóveis em Fortaleza, Eusébio, Maracanaú e Caucaia</h1>
      <div className="mx-auto max-w-6xl px-4 md:px-6">
        <form aria-label="Buscar imóveis" onSubmit={buscar}>
          <p className="max-w-4xl font-display font-semibold text-[clamp(1.9rem,4.6vw,3.25rem)] text-nanquim leading-[1.35] tracking-tight">
            Quero morar em{" "}
            <select aria-label="Cidade" className="campo-frase" onChange={(e) => setCidade(e.target.value)} value={cidade}>
              <option value="">qualquer cidade</option>
              {CIDADES_ATENDIDAS.map((c) => (
                <option key={c}>{c}</option>
              ))}
            </select>
            , num imóvel{" "}
            <select aria-label="Fase da obra" className="campo-frase" onChange={(e) => setFase(e.target.value)} value={fase}>
              <option value="">em qualquer fase</option>
              {FASES.map((f) => (
                <option key={f.valor} value={f.valor}>
                  {f.label.toLowerCase()}
                </option>
              ))}
            </select>
            , com{" "}
            <select
              aria-label="Quartos"
              className="campo-frase"
              onChange={(e) => setQuartos(Number(e.target.value))}
              value={quartos}
            >
              <option value={0}>qualquer número de</option>
              {QUARTOS.map((q) => (
                <option key={q} value={q}>
                  {q} ou mais
                </option>
              ))}
            </select>{" "}
            quartos.
          </p>

          <div className="mt-10 grid gap-12 lg:grid-cols-[1.4fr_1fr] lg:items-start">
            <div>
              <div className="flex flex-wrap items-center gap-x-6 gap-y-4">
                <button
                  className="rounded-md bg-nanquim px-7 py-4 font-semibold text-cal transition-colors hover:bg-mar"
                  type="submit"
                >
                  {carregando ? "Ver imóveis" : `Ver ${encontrados} ${encontrados === 1 ? "imóvel" : "imóveis"}`}
                </button>
                <a
                  className="flex items-center gap-2 font-medium text-mar underline decoration-2 underline-offset-4"
                  href={whatsappLink("Olá! Vim pelo site da Alves Costa e gostaria de ajuda para encontrar um imóvel.")}
                  rel="noreferrer"
                  target="_blank"
                >
                  <MessageCircle className="h-4 w-4" /> Prefiro falar no WhatsApp
                </a>
              </div>

              <div className="mt-12">
                <Horario />
              </div>
            </div>

            <div className="rounded-lg border border-concreto bg-white p-6">
              <h2 className="font-display font-semibold text-lg text-nanquim">Empreendimentos por fase</h2>
              <p className="mt-1 text-nanquim/70 text-sm">
                {carregando ? "Carregando…" : `${comFase} com fase informada. Toque numa fase para ver a lista.`}
              </p>
              <ul className="mt-6 space-y-5">
                {porFase.map((f) => (
                  <li key={f.valor}>
                    <a className="group block" href={`/catalogo?fase=${f.valor}`}>
                      <span className="flex items-baseline justify-between gap-3 text-sm">
                        <span className="font-medium text-nanquim group-hover:text-mar">{f.label}</span>
                        <span className="font-display font-semibold text-nanquim text-xl tabular-nums">{f.n}</span>
                      </span>
                      <span className="mt-2 block h-3 rounded-sm bg-cal">
                        <span
                          className="block h-full origin-left rounded-sm bg-mar motion-safe:animate-crescer"
                          key={carregando ? "carregando" : "pronto"}
                          style={{ width: `${(f.n / maior) * 100}%` }}
                        />
                      </span>
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </form>
      </div>
    </section>
  );
}
