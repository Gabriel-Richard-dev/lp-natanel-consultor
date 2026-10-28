import type { ElementType, ReactNode } from "react";
import { useVisivel } from "@/hooks/use-visivel";
import { cn } from "@/lib/utils";

// Entra com um leve deslize quando aparece na tela. `atraso` escalona itens de uma lista.
export function Revelar({
  as: Tag = "div",
  atraso = 0,
  className,
  children,
}: {
  as?: ElementType;
  atraso?: number;
  className?: string;
  children: ReactNode;
}) {
  const [ref, visivel] = useVisivel<HTMLElement>();
  return (
    <Tag
      className={cn(
        "transition-[opacity,transform] duration-700 ease-out",
        visivel ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0",
        className
      )}
      ref={ref}
      style={{ transitionDelay: visivel ? `${atraso}ms` : undefined }}
    >
      {children}
    </Tag>
  );
}
