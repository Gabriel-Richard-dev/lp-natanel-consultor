// Snapshot das ofertas do perfil no Chaves na Mão -> src/data/ofertas.json
// ponytail: roda sob demanda (`npm run scrape:ofertas`), não é live. Se quiser
// dados sempre atualizados, precisa de um backend/cron chamando isso periodicamente.
import { writeFile } from "node:fs/promises";

const PROFILE_URL =
  "https://www.chavesnamao.com.br/corretor/natanael-machado/id-616202/";
const OUTPUT_PATH = new URL("../src/data/ofertas.json", import.meta.url);

const res = await fetch(PROFILE_URL, {
  headers: { "User-Agent": "Mozilla/5.0 (compatible; ofertas-sync/1.0)" },
});
if (!res.ok) {
  throw new Error(`Falha ao buscar perfil: ${res.status}`);
}
const html = await res.text();

const blocks = [
  ...html.matchAll(
    /<script type="application\/ld\+json">([\s\S]*?)<\/script>/g
  ),
];

const listing = blocks
  .map((m) => {
    try {
      return JSON.parse(m[1].trim());
    } catch {
      return null;
    }
  })
  .find((d) => d?.["@type"] === "RealEstateListing");

if (!listing) {
  throw new Error("Bloco RealEstateListing não encontrado na página.");
}

const ofertas = listing.offers.itemListElement.map((offer) => {
  const item = offer.itemOffered;
  return {
    id: offer.url.match(/id-(\d+)/)?.[1] ?? offer.url,
    titulo: offer.name,
    preco: Number(offer.price),
    url: offer.url,
    imagem: item.image,
    bairro: item.address?.addressLocality ?? "",
    cidade: item.address?.addressRegion?.split(",")[0]?.trim() ?? "",
    quartos: item.numberOfBedrooms ?? null,
    banheiros: item.numberOfBathroomsTotal ?? null,
    area: item.floorSize?.unitText ?? null,
  };
});

await writeFile(OUTPUT_PATH, `${JSON.stringify(ofertas, null, 2)}\n`);
console.log(`${ofertas.length} ofertas salvas em src/data/ofertas.json`);
