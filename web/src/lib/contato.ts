const WHATSAPP_NUMBER = "5585987785187";

export const whatsappLink = (texto?: string) =>
  `https://wa.me/${WHATSAPP_NUMBER}${texto ? `?text=${encodeURIComponent(texto)}` : ""}`;

export const whatsappOferta = (titulo: string, url: string | null) =>
  whatsappLink(
    `Olá Natanael! Tenho interesse nessa oferta: "${titulo}"${url ? ` — ${url}` : ""}`
  );

export const formatPreco = (valor: number) =>
  valor.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
    maximumFractionDigits: 0,
  });
