import html
import logging
import re
import time
import urllib.error
import urllib.request
from urllib.parse import urlparse

from . import config, fotos
from .db import pool

log = logging.getLogger("uvicorn.error")

# slug da vitrine no portal -> nome exibido no site
CONSTRUTORAS = {
    "victa": "Victa",
    "mrv": "MRV",
    "direcional": "Direcional",
    "pramorar": "Pra Morar Brasil",
    "mlar": "M.Lar",
    "engeplan": "Engeplan",
    "casas-manager": "Casas Manager",
    "cmm": "CMM",
    "tenda": "Tenda",
    "cr-duarte": "CR Duarte",
}

# card normal, rcard (Riva) e scard (Sensia) têm o mesmo miolo com classes diferentes
CARD = re.compile(r'<a class="(?:card|rcard|scard)"[^>]*href="([^"]+)"[^>]*>(.*?)</a>', re.S)
SELO = re.compile(r'<div class="ph">[^<]*<img[^>]*>\s*<span[^>]*>(.*?)</span>', re.S)
IMG = re.compile(r'<img[^>]*\ssrc="([^"]+)"')
OG_IMAGE = re.compile(r'<meta property="og:image" content="([^"]+)"')
AREA = re.compile(r"(\d+(?:,\d+)?)(?:\s*m²)?(?:\s+a\s+(\d+(?:,\d+)?))?\s*m²")
QUARTOS = re.compile(r"(\d+)(?:\s+e\s+\d+)?\s+(?:quartos?|su[ií]tes?)\b")  # "2 e 3 quartos" -> 2
FASES = ("Pronto para morar", "Em obras", "Em construção", "Reta final", "Lançamento")


def _texto(trecho: str) -> str:
    return html.unescape(re.sub(r"<[^>]+>", "", trecho)).strip()


def extrair_cards(pagina: str, construtora: str) -> list[dict]:
    """Lê os cards da vitrine de uma construtora (ver README: sem preço no portal)."""
    cards = []
    for href, corpo in CARD.findall(pagina):
        slug = href.rstrip("/").split("/")[-2]
        nome = re.search(r"<h3>(.*?)</h3>", corpo, re.S)
        if not nome:
            continue
        local = re.search(r'<span class="loc">(.*?)</span>', corpo, re.S)
        bairro, _, cidade = (_texto(local.group(1)) if local else "").partition(" · ")
        itens = [_texto(i) for i in re.findall(r"<li>(.*?)</li>", corpo, re.S)]
        selo = SELO.search(corpo)
        img = IMG.search(corpo)

        quartos = next(filter(None, map(QUARTOS.search, itens)), None)
        area = next(filter(None, map(AREA.search, itens)), None)
        entrega = next((i.split(":", 1)[1].strip() for i in itens if i.startswith("Entrega prevista:")), None)
        fase = _texto(selo.group(1)) if selo else next(
            (i for i in itens if i.startswith(FASES)), None
        )
        cards.append(
            {
                "id": f"hb-{slug}",
                "slug": slug,
                "titulo": _texto(nome.group(1)),
                "bairro": bairro or None,
                "cidade": cidade.split("/")[0].strip() or None,
                "quartos": int(quartos.group(1)) if quartos else None,
                "area": (f"{area.group(1)} a {area.group(2)} m²" if area.group(2) else f"{area.group(1)} m²")
                if area
                else None,
                "fase": fase,
                "entrega": entrega,
                "construtora": construtora,
                "imagem_fonte": img.group(1) if img else None,
            }
        )
    return cards


TENTATIVAS = 3


def _com_tentativas(req: urllib.request.Request, limite: int) -> bytes:
    """A rede do servidor oscila (DNS, timeout, conexão derrubada): repete com espera crescente.
    Resposta de erro do portal (404, 403...) não melhora ao repetir, então sobe na hora."""
    for tentativa in range(1, TENTATIVAS + 1):
        try:
            with urllib.request.urlopen(req, timeout=30) as res:
                return res.read(limite + 1)
        except urllib.error.HTTPError as err:
            if err.code < 500 or tentativa == TENTATIVAS:
                raise
        except OSError:  # URLError, timeout, conexão encerrada
            if tentativa == TENTATIVAS:
                raise
        time.sleep(1.5 * tentativa)
    raise AssertionError("inalcançável")


def _baixar(url: str, limite: int) -> bytes:
    # só fala com o próprio portal: a URL vem de HTML de terceiro
    if urlparse(url).hostname != urlparse(config.HABITNET_URL).hostname:
        raise ValueError(f"endereço fora do portal: {url}")
    req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0 (compatible; ofertas-sync/1.0)"})
    dados = _com_tentativas(req, limite)
    if len(dados) > limite:
        raise ValueError("resposta grande demais")
    return dados


def _url_vitrine(slug: str) -> str:
    return f"{config.HABITNET_URL}/{slug}/{config.HABITNET_CONSULTOR}"


def _imagem_do_empreendimento(card: dict) -> str | None:
    """Foto do card quando é a perspectiva (hero/galeria); senão a og:image da página,
    porque o card de várias construtoras traz só o logo."""
    fonte = card["imagem_fonte"] or ""
    if re.search(r"/(hero|g\d+)\.", fonte):
        return fonte
    try:
        pagina = _baixar(_url_vitrine(card["slug"]), 2_000_000).decode("utf-8", "replace")
        achou = OG_IMAGE.search(pagina)
        if achou:
            return achou.group(1)
    except Exception:
        log.warning("sem og:image de %s", card["slug"], exc_info=True)
    return card["imagem_fonte"]


def _guardar_foto(url: str) -> str:
    return fotos.salvar_foto(fotos.normalizar(_baixar(url, fotos.MAX_BYTES)))


def sincronizar() -> dict:
    cards: list[dict] = []
    falhas: list[str] = []
    for slug, nome in CONSTRUTORAS.items():
        try:
            pagina = _baixar(_url_vitrine(slug), 3_000_000).decode("utf-8")
            achados = extrair_cards(pagina, nome)
            if not achados:
                raise ValueError("nenhum empreendimento na vitrine")
            cards += achados
        except Exception as err:
            log.warning("vitrine %s falhou", slug, exc_info=True)
            falhas.append(f"{nome}: {err}")

    # Portal fora do ar ou mudou de layout: não apaga o catálogo inteiro.
    if not cards:
        raise ValueError("Nenhum empreendimento encontrado no portal. " + "; ".join(falhas))
    ok = {c["construtora"] for c in cards}
    vistos = {c["id"] for c in cards}

    with pool.connection() as conn:
        existentes = {
            r["id"]: r
            for r in conn.execute(
                "select id, imagem, imagem_fonte from imoveis where origem = 'habitnet'"
            ).fetchall()
        }

    for c in cards:
        antigo = existentes.get(c["id"])
        if antigo and antigo["imagem"] and antigo["imagem_fonte"] == c["imagem_fonte"]:
            c["imagem"] = antigo["imagem"]  # foto já guardada: não baixa de novo
            continue
        try:
            fonte = _imagem_do_empreendimento(c)
            c["imagem"] = _guardar_foto(fonte) if fonte else None
        except Exception:
            log.warning("foto de %s falhou", c["id"], exc_info=True)
            c["imagem"] = antigo["imagem"] if antigo else None

    # Só mexe em origem='habitnet'; cadastros manuais ficam intactos.
    with pool.connection() as conn:
        for c in cards:
            conn.execute(
                """insert into imoveis (id, titulo, preco, url, imagem, imagem_fonte, bairro,
                     cidade, quartos, area, construtora, fase, entrega, origem, atualizado_em)
                   values (%(id)s, %(titulo)s, null, null, %(imagem)s, %(imagem_fonte)s, %(bairro)s,
                     %(cidade)s, %(quartos)s, %(area)s, %(construtora)s, %(fase)s, %(entrega)s,
                     'habitnet', now())
                   on conflict (id) do update set
                     titulo = excluded.titulo, imagem = excluded.imagem,
                     imagem_fonte = excluded.imagem_fonte, bairro = excluded.bairro,
                     cidade = excluded.cidade, quartos = excluded.quartos, area = excluded.area,
                     construtora = excluded.construtora, fase = excluded.fase,
                     entrega = excluded.entrega, atualizado_em = now()
                   where imoveis.origem = 'habitnet'""",
                c,
            )
        # remove só o que sumiu de vitrines lidas com sucesso; vitrine que falhou fica como está
        conn.execute(
            "delete from imoveis where origem = 'habitnet' and construtora = any(%s) and not (id = any(%s))",
            [list(ok), list(vistos)],
        )
    return {"total": len(cards), "falhas": falhas}
