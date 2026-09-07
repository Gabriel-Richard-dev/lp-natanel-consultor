import { pool } from "./db/pool.js";

// ponytail: heurística de resync é "merge por id + origem" — o upsert só
// mexe em linhas origem='chaves_na_mao' (garantido pelo WHERE do próprio
// upsert), então imóveis cadastrados manualmente nunca são tocados aqui.
export async function sincronizarChavesNaMao() {
  const url = process.env.CHAVES_NA_MAO_URL;
  const res = await fetch(url, {
    headers: { "User-Agent": "Mozilla/5.0 (compatible; ofertas-sync/1.0)" },
  });
  if (!res.ok) throw new Error(`Falha ao buscar perfil: ${res.status}`);
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

  const client = await pool.connect();
  try {
    await client.query("begin");

    for (const o of ofertas) {
      await client.query(
        `insert into imoveis (id, titulo, preco, url, imagem, bairro, cidade, quartos, banheiros, area, origem, atualizado_em)
         values ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,'chaves_na_mao', now())
         on conflict (id) do update set
           titulo = excluded.titulo, preco = excluded.preco, url = excluded.url,
           imagem = excluded.imagem, bairro = excluded.bairro, cidade = excluded.cidade,
           quartos = excluded.quartos, banheiros = excluded.banheiros, area = excluded.area,
           atualizado_em = now()
         where imoveis.origem = 'chaves_na_mao'`,
        [
          o.id,
          o.titulo,
          o.preco,
          o.url,
          o.imagem,
          o.bairro,
          o.cidade,
          o.quartos,
          o.banheiros,
          o.area,
        ]
      );
    }

    const idsAtuais = ofertas.map((o) => o.id);
    await client.query(
      `delete from imoveis where origem = 'chaves_na_mao' and not (id = any($1::text[]))`,
      [idsAtuais.length ? idsAtuais : [""]]
    );

    await client.query("commit");
  } catch (err) {
    await client.query("rollback");
    throw err;
  } finally {
    client.release();
  }

  return ofertas.length;
}
