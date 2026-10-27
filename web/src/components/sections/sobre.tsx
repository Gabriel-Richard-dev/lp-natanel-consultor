import logo from "@/assets/logo/logo-alves-costa.webp";
import { Skyline } from "@/components/ui/skyline";
import { useImoveis } from "@/hooks/use-imoveis";
import { outrasFotos } from "@/lib/fotos-hero";

// Janela em arco: o mesmo desenho do hero
function Arco({ src, className }: { src?: string | null; className?: string }) {
  return (
    <div className={`relative ${className ?? ""}`}>
      <div aria-hidden="true" className="absolute inset-0 -translate-x-2 translate-y-2 rounded-t-[999px] rounded-b-xl border border-gold/40" />
      <div className="relative h-full overflow-hidden rounded-t-[999px] rounded-b-xl bg-marca">
        {src && <img alt="" className="h-full w-full object-cover" decoding="async" loading="lazy" src={src} />}
      </div>
    </div>
  );
}

export function Sobre() {
  const { imoveis } = useImoveis();
  const [a, b] = outrasFotos(imoveis, 2, 1);

  return (
    <section className="folha overflow-hidden bg-fundo-marca pt-[6.5rem] pb-32 text-white md:pt-[8.5rem] md:pb-40" id="sobre">
      <div className="mx-auto grid max-w-6xl items-center gap-14 px-4 md:px-6 lg:grid-cols-[0.9fr_1.1fr]">
        <div className="mx-auto flex w-full max-w-sm gap-5">
          <Arco className="mt-14 aspect-[3/5] w-1/2" src={a?.imagem} />
          <Arco className="aspect-[3/5] w-1/2" src={b?.imagem} />
        </div>
        <div>
          <img alt="Alves Costa" className="mb-8 w-48" loading="lazy" src={logo} />
          <h2 className="font-display font-semibold text-3xl tracking-tight md:text-4xl">
            Uma busca tranquila, com transparência do início ao fim
          </h2>
          <p className="mt-5 max-w-xl text-white/65 leading-relaxed">
            Na Alves Costa, procurar um novo lar não precisa ser cansativo. Conhecemos a fundo o mercado da região
            metropolitana de Fortaleza e ajudamos cada cliente a escolher bem, seja para morar ou para investir.
          </p>
        </div>
      </div>
      <Skyline className="absolute inset-x-0 bottom-0 h-20 w-full text-gold/10 md:h-28" />
    </section>
  );
}
