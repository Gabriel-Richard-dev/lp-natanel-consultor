import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const mensagemDe = (err: unknown, padrao: string) =>
  err instanceof Error ? err.message : padrao

// Para busca: "joquei" encontra "Jóquei"
export const normalizar = (texto: string) =>
  texto.normalize("NFD").replace(/\p{Diacritic}/gu, "").toLowerCase()
