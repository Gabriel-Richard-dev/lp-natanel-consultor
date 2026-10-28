import { useVisivel } from "@/hooks/use-visivel";

// Silhueta de prédios, em eco às três barras da logo; os prédios crescem quando a seção aparece
const BARRAS = [34, 56, 42, 78, 52, 96, 64, 44, 84, 58, 38, 70, 50, 90, 46, 60];

export function Skyline({ className }: { className?: string }) {
  const [ref, visivel] = useVisivel<SVGSVGElement>("0px 0px 0px 0px");
  return (
    <svg
      aria-hidden="true"
      className={className}
      preserveAspectRatio="none"
      ref={ref}
      viewBox={`0 0 ${BARRAS.length * 20} 100`}
    >
      {BARRAS.map((h, i) => (
        <rect
          fill="currentColor"
          height={h}
          key={`${i}-${h}`}
          style={{
            transform: `scaleY(${visivel ? 1 : 0})`,
            transformBox: "fill-box",
            transformOrigin: "bottom",
            transition: "transform 900ms cubic-bezier(0.22, 1, 0.36, 1)",
            transitionDelay: `${i * 55}ms`,
          }}
          width="14"
          x={i * 20 + 3}
          y={100 - h}
        />
      ))}
    </svg>
  );
}
