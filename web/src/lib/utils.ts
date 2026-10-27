import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Quem pediu menos movimento no sistema não recebe animação de scroll/entrada
export const movimentoReduzido = () =>
  typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches

export const mensagemDe = (err: unknown, padrao: string) =>
  err instanceof Error ? err.message : padrao

// Para busca: "joquei" encontra "Jóquei"
export const normalizar = (texto: string) =>
  texto.normalize("NFD").replace(/\p{Diacritic}/gu, "").toLowerCase()
