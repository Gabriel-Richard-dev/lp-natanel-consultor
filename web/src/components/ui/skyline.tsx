// Silhueta de prédios, em eco às três barras da logo
const BARRAS = [34, 56, 42, 78, 52, 96, 64, 44, 84, 58, 38, 70, 50, 90, 46, 60];

export function Skyline({ className }: { className?: string }) {
  return (
    <svg aria-hidden="true" className={className} preserveAspectRatio="none" viewBox={`0 0 ${BARRAS.length * 20} 100`}>
      {BARRAS.map((h, i) => (
        <rect fill="currentColor" height={h} key={`${i}-${h}`} width="14" x={i * 20 + 3} y={100 - h} />
      ))}
    </svg>
  );
}
