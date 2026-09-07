import { gsap } from "gsap";
import { MessageCircle } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import AttractButton from "@/components/kokonutui/attract-button";
import { useScrollReveal } from "@/hooks/use-scroll-reveal";
import { cn } from "@/lib/utils";

const WHATSAPP_NUMBER = "5585987785187";

const formatPreco = (valor: number) =>
  valor.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
    maximumFractionDigits: 0,
  });

function calcularParcela(financiado: number, anos: number, taxaAnual: number) {
  const i = taxaAnual / 100 / 12;
  const n = anos * 12;
  return financiado * (i / (1 - (1 + i) ** -n));
}

function AnimatedValor({
  value,
  className,
}: {
  value: number;
  className?: string;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const tweened = useRef({ v: value });

  useEffect(() => {
    const obj = tweened.current;
    gsap.to(obj, {
      v: value,
      duration: 0.6,
      ease: "power2.out",
      onUpdate: () => {
        if (ref.current) ref.current.textContent = formatPreco(obj.v);
      },
    });
  }, [value]);

  return (
    <span className={className} ref={ref}>
      {formatPreco(value)}
    </span>
  );
}

export function SimulacaoFinanciamento() {
  const ref = useScrollReveal<HTMLDivElement>({ selector: ".sim-anim" });
  const [valorImovel, setValorImovel] = useState(300_000);
  const [entradaModo, setEntradaModo] = useState<"percentual" | "valor">(
    "percentual"
  );
  const [entradaPercentual, setEntradaPercentual] = useState(20);
  const [entradaValor, setEntradaValor] = useState(60_000);
  const [anos, setAnos] = useState(30);
  const [taxaAnual, setTaxaAnual] = useState(10.5);

  const entrada =
    entradaModo === "percentual"
      ? valorImovel * (entradaPercentual / 100)
      : Math.min(entradaValor, valorImovel);

  const { financiado, parcela } = useMemo(() => {
    const fin = Math.max(valorImovel - entrada, 0);
    return { financiado: fin, parcela: calcularParcela(fin, anos, taxaAnual) };
  }, [valorImovel, entrada, anos, taxaAnual]);

  const waLink = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(
    `Olá Natanael! Fiz uma simulação de financiamento: imóvel de ${formatPreco(
      valorImovel
    )}, entrada de ${formatPreco(entrada)} e parcela estimada em ${formatPreco(
      parcela
    )}/mês (${anos} anos). Podemos conversar?`
  )}`;

  return (
    <section className="mx-auto max-w-3xl px-4 py-24 md:px-6" id="simulador" ref={ref}>
      <h2 className="sim-anim mb-4 text-center font-bold text-3xl tracking-tight md:text-4xl">
        Simule seu financiamento
      </h2>
      <p className="sim-anim mx-auto mb-12 max-w-xl text-center text-muted-foreground">
        Ajuste os valores e veja uma estimativa da parcela mensal. Valores
        aproximados, sujeitos a análise de crédito do banco.
      </p>

      <div className="sim-anim rounded-2xl border border-border bg-card p-6 shadow-sm md:p-8">
        <div className="grid gap-6 sm:grid-cols-2">
          <div>
            <label className="mb-1.5 block text-sm" htmlFor="valor-imovel">
              Valor do imóvel
            </label>
            <div className="flex items-center rounded-lg border border-input bg-background px-3 focus-within:ring-2 focus-within:ring-emerald-600/40">
              <span className="text-muted-foreground text-sm">R$</span>
              <input
                className="w-full bg-transparent px-2 py-2 text-sm outline-none"
                id="valor-imovel"
                min={0}
                onChange={(e) => setValorImovel(Number(e.target.value) || 0)}
                step={5_000}
                type="number"
                value={valorImovel}
              />
            </div>
          </div>

          <div>
            <div className="mb-1.5 flex items-center justify-between">
              <label className="text-sm" htmlFor="entrada">
                Entrada
              </label>
              <div className="flex overflow-hidden rounded-md border border-border text-xs">
                <button
                  className={cn(
                    "px-2 py-0.5 transition-colors",
                    entradaModo === "percentual"
                      ? "bg-emerald-500 text-black"
                      : "hover:bg-muted"
                  )}
                  onClick={() => setEntradaModo("percentual")}
                  type="button"
                >
                  %
                </button>
                <button
                  className={cn(
                    "px-2 py-0.5 transition-colors",
                    entradaModo === "valor"
                      ? "bg-emerald-500 text-black"
                      : "hover:bg-muted"
                  )}
                  onClick={() => setEntradaModo("valor")}
                  type="button"
                >
                  R$
                </button>
              </div>
            </div>
            <div className="flex items-center rounded-lg border border-input bg-background px-3 focus-within:ring-2 focus-within:ring-emerald-600/40">
              <span className="text-muted-foreground text-sm">
                {entradaModo === "percentual" ? "%" : "R$"}
              </span>
              {entradaModo === "percentual" ? (
                <input
                  className="w-full bg-transparent px-2 py-2 text-sm outline-none"
                  id="entrada"
                  max={100}
                  min={0}
                  onChange={(e) =>
                    setEntradaPercentual(Number(e.target.value) || 0)
                  }
                  step={1}
                  type="number"
                  value={entradaPercentual}
                />
              ) : (
                <input
                  className="w-full bg-transparent px-2 py-2 text-sm outline-none"
                  id="entrada"
                  min={0}
                  onChange={(e) =>
                    setEntradaValor(Number(e.target.value) || 0)
                  }
                  step={5_000}
                  type="number"
                  value={entradaValor}
                />
              )}
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-sm" htmlFor="prazo">
              Prazo (anos)
            </label>
            <div className="flex items-center rounded-lg border border-input bg-background px-3 focus-within:ring-2 focus-within:ring-emerald-600/40">
              <input
                className="w-full bg-transparent px-2 py-2 text-sm outline-none"
                id="prazo"
                max={35}
                min={1}
                onChange={(e) => setAnos(Number(e.target.value) || 0)}
                step={1}
                type="number"
                value={anos}
              />
              <span className="text-muted-foreground text-sm">anos</span>
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-sm" htmlFor="taxa">
              Taxa de juros (a.a.)
            </label>
            <div className="flex items-center rounded-lg border border-input bg-background px-3 focus-within:ring-2 focus-within:ring-emerald-600/40">
              <input
                className="w-full bg-transparent px-2 py-2 text-sm outline-none"
                id="taxa"
                min={0}
                onChange={(e) => setTaxaAnual(Number(e.target.value) || 0)}
                step={0.1}
                type="number"
                value={taxaAnual}
              />
              <span className="text-muted-foreground text-sm">%</span>
            </div>
          </div>
        </div>

        <div className="mt-8 flex flex-wrap items-end justify-between gap-6 border-border border-t pt-6">
          <div>
            <span className="text-muted-foreground text-xs">
              Parcela estimada
            </span>
            <div className="font-bold text-3xl text-emerald-700 tracking-tight dark:text-emerald-400">
              <AnimatedValor value={parcela} />
              <span className="font-normal text-base text-muted-foreground">
                /mês
              </span>
            </div>
            <p className="mt-1 text-muted-foreground text-xs">
              Entrada de <AnimatedValor value={entrada} /> · financiado{" "}
              <AnimatedValor value={financiado} />
            </p>
          </div>

          <a href={waLink} rel="noreferrer" target="_blank">
            <AttractButton className="gap-2 bg-emerald-600 text-white hover:bg-emerald-700">
              <MessageCircle className="h-4 w-4" />
              Simular com Natanael
            </AttractButton>
          </a>
        </div>
      </div>
    </section>
  );
}
