import { CONSTRUTORAS } from "@/lib/construtoras";

export function Construtoras() {
  return (
    <section aria-label="Construtoras" className="border-white/10 border-b bg-fundo-marca">
      <div className="mx-auto max-w-6xl px-4 py-8 md:px-6">
        <p className="mb-5 text-center text-white/50 text-xs uppercase tracking-[0.2em]">
          Lançamentos e imóveis prontos das principais construtoras da região
        </p>
        <ul className="flex flex-wrap items-center justify-center gap-x-8 gap-y-3">
          {CONSTRUTORAS.map((nome) => (
            <li className="font-semibold text-lg text-white/70 tracking-tight" key={nome}>
              {nome}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
