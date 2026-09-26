import json
import re
import urllib.request

from . import config
from .db import pool

LD_JSON = re.compile(r'<script type="application/ld\+json">(.*?)</script>', re.S)


def extrair_ofertas(html: str) -> list[dict]:
    listing = None
    for bloco in LD_JSON.findall(html):
        try:
            dado = json.loads(bloco.strip())
        except ValueError:
            continue
        if isinstance(dado, dict) and dado.get("@type") == "RealEstateListing":
            listing = dado
            break
    if not listing:
        raise ValueError("Bloco RealEstateListing não encontrado na página.")

    ofertas = []
    for oferta in listing["offers"]["itemListElement"]:
        item = oferta["itemOffered"]
        endereco = item.get("address") or {}
        id_match = re.search(r"id-(\d+)", oferta["url"])
        ofertas.append(
            {
                "id": id_match.group(1) if id_match else oferta["url"],
                "titulo": oferta["name"],
                "preco": int(float(oferta["price"])),
                "url": oferta["url"],
                "imagem": item.get("image"),
                "bairro": endereco.get("addressLocality", ""),
                "cidade": (endereco.get("addressRegion") or "").split(",")[0].strip(),
                "quartos": item.get("numberOfBedrooms"),
                "banheiros": item.get("numberOfBathroomsTotal"),
                "area": (item.get("floorSize") or {}).get("unitText"),
            }
        )
    return ofertas


def sincronizar() -> int:
    req = urllib.request.Request(
        config.CHAVES_NA_MAO_URL,
        headers={"User-Agent": "Mozilla/5.0 (compatible; ofertas-sync/1.0)"},
    )
    with urllib.request.urlopen(req, timeout=30) as res:
        html = res.read().decode("utf-8")

    ofertas = extrair_ofertas(html)
    # Página mudou de layout ou veio vazia: não apaga o catálogo inteiro.
    if not ofertas:
        raise ValueError("Nenhum imóvel encontrado no perfil.")

    # Só mexe em linhas origem='chaves_na_mao'; cadastros manuais ficam intactos.
    with pool.connection() as conn:
        for o in ofertas:
            conn.execute(
                """insert into imoveis (id, titulo, preco, url, imagem, bairro, cidade,
                     quartos, banheiros, area, origem, atualizado_em)
                   values (%(id)s, %(titulo)s, %(preco)s, %(url)s, %(imagem)s, %(bairro)s,
                     %(cidade)s, %(quartos)s, %(banheiros)s, %(area)s, 'chaves_na_mao', now())
                   on conflict (id) do update set
                     titulo = excluded.titulo, preco = excluded.preco, url = excluded.url,
                     imagem = excluded.imagem, bairro = excluded.bairro, cidade = excluded.cidade,
                     quartos = excluded.quartos, banheiros = excluded.banheiros,
                     area = excluded.area, atualizado_em = now()
                   where imoveis.origem = 'chaves_na_mao'""",
                o,
            )
        conn.execute(
            "delete from imoveis where origem = 'chaves_na_mao' and not (id = any(%s))",
            [[o["id"] for o in ofertas]],
        )
    return len(ofertas)
