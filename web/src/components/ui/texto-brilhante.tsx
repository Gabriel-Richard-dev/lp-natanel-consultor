import type { CSSProperties, ReactNode } from "react";

const ESTRELAS: { posicao: string; tamanho: string; atraso: string }[] = [
  { posicao: "-top-3 -right-6", tamanho: "h-6 w-6", atraso: "0s" },
  { posicao: "top-2 -left-6", tamanho: "h-4 w-4", atraso: "0.9s" },
  { posicao: "-bottom-2 -right-7", tamanho: "h-4 w-4", atraso: "1.6s" },
  { posicao: "-top-5 left-1/3", tamanho: "h-3.5 w-3.5", atraso: "0.5s" },
];

// Texto com gradiente dourado que corre pelas letras e brilhos que acendem em volta
export function TextoBrilhante({ children }: { children: ReactNode }) {
  return (
    <span className="relative inline-block">
      <span
        className="animate-gradient bg-[linear-gradient(90deg,#d4af4b,#fff1bf,#d4af4b,#fff1bf,#d4af4b)] bg-[length:300%_100%] bg-clip-text text-transparent motion-reduce:animate-none"
        style={{ "--bg-size": "300%", animationDuration: "6s" } as CSSProperties}
      >
        {children}
      </span>
      {ESTRELAS.map((e) => (
        <svg
          aria-hidden="true"
          className={`absolute ${e.posicao} ${e.tamanho} animate-brilho text-gold motion-reduce:hidden`}
          key={e.posicao}
          style={{ animationDelay: e.atraso }}
          viewBox="0 0 24 24"
        >
          <path d="M12 0C12 7 17 12 24 12C17 12 12 17 12 24C12 17 7 12 0 12C7 12 12 7 12 0Z" fill="currentColor" />
        </svg>
      ))}
    </span>
  );
}
