const WHATSAPP_NUMBER = "5585987785187";

export const whatsappLink = (texto?: string) =>
  `https://wa.me/${WHATSAPP_NUMBER}${texto ? `?text=${encodeURIComponent(texto)}` : ""}`;

export const whatsappOferta = (titulo: string, url: string | null, construtora?: string | null) =>
  whatsappLink(
    `Olá! Tenho interesse nesse imóvel da Alves Costa: "${titulo}"${construtora ? ` (${construtora})` : ""}${url ? ` — ${url}` : ""}`
  );

export const formatPrecoOuConsulta = (valor: number | null) =>
  valor == null ? "Consulte valores" : formatPreco(valor);

export const formatPreco = (valor: number) =>
  valor.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
    maximumFractionDigits: 0,
  });
