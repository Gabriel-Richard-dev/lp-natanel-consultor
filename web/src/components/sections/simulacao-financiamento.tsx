import { gsap } from "gsap";
import { MessageCircle } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Revelar } from "@/components/ui/revelar";
import { formatPreco, whatsappLink } from "@/lib/contato";
import { type Sistema, simular } from "@/lib/financiamento";
import { cn } from "@/lib/utils";

const SISTEMAS: { valor: Sistema; nome: string; descricao: string }[] = [
  { valor: "sac", nome: "SAC", descricao: "Começa maior e diminui todo mês" },
  { valor: "price", nome: "Price", descricao: "Parcela igual do início ao fim" },
];

function AnimatedValor({ value, className }: { value: number; className?: string }) {
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

// Campo digitável + régua (slider) controlando o mesmo valor.
function Controle({
  id,
  label,
  value,
  onChange,
  min,
  max,
  step,
  prefixo,
  sufixo,
  dinheiro = false,
  dica,
  alerta = false,
}: {
  id: string;
  label: string;
  value: number;
  onChange: (v: number) => void;
  min: number;
  max: number;
  step: number;
  prefixo?: string;
  sufixo?: string;
  dinheiro?: boolean;
  dica?: string;
  alerta?: boolean;
}) {
  const pct = Math.min(Math.max(((value - min) / (max - min)) * 100, 0), 100);
  // extremos da régua: "R$ 100 mil" e "R$ 2 mi" em reais; "5 anos" e "6%" nos demais
  const extremo = (n: number) =>
    dinheiro
      ? new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL", notation: "compact", maximumFractionDigits: 1 }).format(n)
      : `${n}${sufixo === "%" ? "%" : sufixo ? ` ${sufixo}` : ""}`;

  return (
    <div>
      <div className="mb-2 flex items-center justify-between gap-3">
        <label className="font-medium text-sm" htmlFor={id}>
          {label}
        </label>
        <div className="flex h-10 w-36 items-center rounded-lg border border-white/15 bg-white/5 px-3 transition-colors focus-within:border-gold focus-within:ring-2 focus-within:ring-gold/25 hover:border-white/30 sm:w-40">
          {prefixo && <span className="text-white/60 text-xs">{prefixo}</span>}
          {/* reais: texto com separador de milhar; o resto: campo numérico nativo
              (aceita "10,5" sem engolir a vírgula no meio da digitação) */}
          <input
            className="w-full min-w-0 bg-transparent px-1.5 py-1.5 text-right text-sm tabular-nums outline-none"
            id={id}
            inputMode={dinheiro ? "numeric" : "decimal"}
            onChange={(e) =>
              onChange(Number(dinheiro ? e.target.value.replace(/\D/g, "") : e.target.value) || 0)
            }
            step={dinheiro ? undefined : step}
            type={dinheiro ? "text" : "number"}
            value={dinheiro ? value.toLocaleString("pt-BR") : value}
          />
          {sufixo && <span className="text-white/60 text-xs">{sufixo}</span>}
        </div>
      </div>
      <input
        aria-label={label}
        className="regua"
        max={max}
        min={min}
        onChange={(e) => onChange(Number(e.target.value))}
        step={step}
        style={{ "--pct": `${pct}%` } as React.CSSProperties}
        type="range"
        value={Math.min(Math.max(value, min), max)}
      />
      <div aria-hidden="true" className="-mt-0.5 flex justify-between text-white/45 text-xs tabular-nums">
        <span>{extremo(min)}</span>
        <span>{extremo(max)}</span>
      </div>
      {dica && (
        <p className={cn("mt-1 text-xs", alerta ? "text-amber-400" : "text-white/60")}>
          {dica}
        </p>
      )}
    </div>
  );
}

export function SimulacaoFinanciamento() {
  const [valorImovel, setValorImovel] = useState(300_000);
  const [entradaPct, setEntradaPct] = useState(20);
  const [anos, setAnos] = useState(30);
  const [taxaAnual, setTaxaAnual] = useState(10.5);
  const [sistema, setSistema] = useState<Sistema>("sac");

  const entrada = Math.round((valorImovel * entradaPct) / 100);
  const s = simular({ valor: valorImovel, entrada, anos, taxaAnual, sistema });
  const partes = [
    { nome: "Entrada", valor: Math.min(entrada, valorImovel), cor: "bg-white/80" },
    { nome: "Valor financiado", valor: s.financiado, cor: "bg-gold" },
    { nome: "Juros", valor: s.totalJuros, cor: "bg-white/35" },
  ];

  const waLink = whatsappLink(
    `Olá! Fiz uma simulação no site da Alves Costa: imóvel de ${formatPreco(valorImovel)}, ` +
      `entrada de ${formatPreco(entrada)} (${Math.round(entradaPct)}%), ${anos} anos, ` +
      `tabela ${sistema === "sac" ? "SAC" : "Price"} a ${String(taxaAnual).replace(".", ",")}% ao ano. ` +
      `${sistema === "sac" ? "Primeira parcela" : "Parcela"} estimada em ${formatPreco(s.primeira)}. Podemos conversar?`
  );

  return (
    <section className="folha relative isolate overflow-hidden bg-fundo-marca pt-24 pb-20 md:pt-[7.5rem] md:pb-24" id="simulador">
      <div aria-hidden="true" className="planta -z-10 absolute inset-0" />
      <div aria-hidden="true" className="-z-10 pointer-events-none absolute -top-20 -left-24 hidden h-[30rem] w-[19rem] rounded-t-full border border-gold/12 lg:block" />
      <div className="mx-auto max-w-6xl px-4 md:px-6">
      <Revelar>
        <h2 className="font-display font-semibold text-3xl text-white tracking-tight md:text-4xl">
          Simule seu financiamento
        </h2>
        <p className="mt-3 mb-12 max-w-xl text-white/70 leading-relaxed">
          Veja quanto fica a parcela, quanto você paga de juros e qual renda os bancos
          costumam pedir.
        </p>
      </Revelar>

      <div className="grid items-start gap-6 lg:grid-cols-[1.15fr_1fr]">
        <Revelar className="space-y-7 rounded-lg border border-white/10 bg-marca p-6 md:p-8">
          <Controle
            dinheiro
            id="valor-imovel"
            label="Valor do imóvel"
            max={2_000_000}
            min={100_000}
            onChange={setValorImovel}
            prefixo="R$"
            step={10_000}
            value={valorImovel}
          />
          <Controle
            alerta={entradaPct < 20}
            dica={
              entradaPct < 20
                ? `${Math.round(entradaPct)}% do valor · a maioria dos bancos pede pelo menos 20%`
                : `${Math.round(entradaPct)}% do valor do imóvel`
            }
            dinheiro
            id="entrada"
            label="Entrada"
            max={valorImovel}
            min={0}
            onChange={(v) => setEntradaPct(valorImovel ? Math.min((v / valorImovel) * 100, 100) : 0)}
            prefixo="R$"
            step={5_000}
            value={entrada}
          />
          <Controle
            dica={`${anos * 12} parcelas mensais`}
            id="prazo"
            label="Prazo"
            max={35}
            min={5}
            onChange={(v) => setAnos(Math.min(Math.max(Math.round(v), 1), 35))}
            step={1}
            sufixo="anos"
            value={anos}
          />
          <Controle
            dica="Taxa efetiva anual. Cada banco tem a sua: confira a do seu."
            id="taxa"
            label="Juros ao ano"
            max={16}
            min={6}
            onChange={setTaxaAnual}
            step={0.25}
            sufixo="%"
            value={taxaAnual}
          />

          <fieldset>
            <legend className="mb-2 font-medium text-sm">Tabela de amortização</legend>
            <div className="grid grid-cols-2 gap-3">
              {SISTEMAS.map((opcao) => (
                <button
                  aria-pressed={sistema === opcao.valor}
                  className={cn(
                    "rounded-xl border p-3 text-left transition",
                    sistema === opcao.valor
                      ? "border-gold bg-gold/10 ring-1 ring-gold"
                      : "border-white/10 bg-marca hover:border-gold"
                  )}
                  key={opcao.valor}
                  onClick={() => setSistema(opcao.valor)}
                  type="button"
                >
                  <span className="block font-semibold text-sm">{opcao.nome}</span>
                  <span className="mt-0.5 block text-white/60 text-xs leading-snug">
                    {opcao.descricao}
                  </span>
                </button>
              ))}
            </div>
          </fieldset>
        </Revelar>

        <Revelar atraso={120} className="lg:sticky lg:top-28">
        <div className="rounded-lg bg-preto p-6 text-white md:p-8">
          <p className="text-sm text-white/60">
            {sistema === "sac" ? "Primeira parcela" : "Parcela fixa"}
          </p>
          <p className="font-display font-semibold text-4xl text-gold tracking-tight md:text-5xl">
            <AnimatedValor value={s.primeira} />
            <span className="font-normal text-base text-white/50"> /mês</span>
          </p>
          <p className="mt-2 text-sm text-white/60">
            {sistema === "sac" ? (
              <>
                Diminui aos poucos até <AnimatedValor className="text-white" value={s.ultima} /> na
                última parcela.
              </>
            ) : (
              <>Mesmo valor nas {anos * 12} parcelas.</>
            )}
          </p>

          <div className="mt-6 rounded-xl bg-white/[0.06] p-4">
            <p className="text-white/60 text-xs">Renda familiar sugerida</p>
            <p className="mt-0.5 font-semibold text-xl">
              <AnimatedValor value={s.rendaMinima} />
              <span className="font-normal text-sm text-white/50"> /mês</span>
            </p>
            <p className="mt-1 text-white/45 text-xs">
              Os bancos costumam limitar a parcela a 30% da renda.
            </p>
          </div>

          <div className="mt-6">
            <div className="flex h-2.5 overflow-hidden rounded-full bg-white/10">
              {partes.map((p) => (
                <div
                  className={cn("transition-[width] duration-500", p.cor)}
                  key={p.nome}
                  style={{ width: `${s.totalPago ? (p.valor / s.totalPago) * 100 : 0}%` }}
                />
              ))}
            </div>
            <dl className="mt-4 space-y-2 text-sm">
              {partes.map((p) => (
                <div className="flex items-center justify-between gap-3" key={p.nome}>
                  <dt className="flex items-center gap-2 text-white/70">
                    <span className={cn("h-2 w-2 rounded-full", p.cor)} />
                    {p.nome}
                  </dt>
                  <dd className="tabular-nums">
                    <AnimatedValor value={p.valor} />
                  </dd>
                </div>
              ))}
              <div className="flex items-center justify-between gap-3 border-white/10 border-t pt-2 font-semibold">
                <dt>Total pago no fim</dt>
                <dd className="tabular-nums">
                  <AnimatedValor value={s.totalPago} />
                </dd>
              </div>
            </dl>
          </div>

          <a
            className="mt-7 flex w-full items-center justify-center gap-2 rounded-lg bg-gold px-5 py-3 font-medium text-black transition-colors hover:bg-gold-claro"
            href={waLink}
            rel="noreferrer"
            target="_blank"
          >
            <MessageCircle className="h-4 w-4" />
            Enviar simulação pelo WhatsApp
          </a>
          <p className="mt-3 text-white/40 text-xs leading-relaxed">
            Estimativa sem seguros obrigatórios, taxas do banco e TR. O valor final depende da
            análise de crédito.
          </p>
        </div>
        </Revelar>
      </div>
      </div>
    </section>
  );
}
