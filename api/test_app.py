"""Checagens rápidas sem banco/MinIO: `python test_app.py`."""

import io
import os

os.environ.setdefault("DATABASE_URL", "postgresql://x@localhost/x")
os.environ.setdefault("JWT_SECRET", "x" * 32)
os.environ.setdefault("CORS_ORIGINS", "http://localhost")
os.environ.setdefault("CHAVES_NA_MAO_URL", "http://localhost")
for k in ("MINIO_ENDPOINT", "MINIO_ACCESS_KEY", "MINIO_SECRET_KEY", "MINIO_BUCKET", "MINIO_PUBLIC_URL"):
    os.environ.setdefault(k, "localhost:9000")

from argon2 import PasswordHasher
from fastapi import HTTPException
from PIL import Image
from pydantic import ValidationError

from app import auth, config, fotos
from app.chaves_na_mao import extrair_ofertas
from app.main import ImovelIn

HTML = """<script type="application/ld+json">{"@type":"Organization"}</script>
<script type="application/ld+json">{"@type":"RealEstateListing","offers":{"itemListElement":[
{"name":"Apto","url":"https://x/imovel/apto/id-123/","price":"270000","itemOffered":{
"image":"https://x/a.jpg","numberOfBedrooms":2,"floorSize":{"unitText":"35m²"},
"address":{"addressLocality":"Pici","addressRegion":"Fortaleza, CE"}}}]}}</script>"""

o = extrair_ofertas(HTML)[0]
assert (o["id"], o["preco"], o["bairro"], o["cidade"], o["area"]) == ("123", 270000, "Pici", "Fortaleza", "35m²")

ip = "1.2.3.4"
for _ in range(auth.MAX_TENTATIVAS):
    assert not auth.bloqueado(ip, 100)
    auth.registrar_falha(ip, 100)
assert auth.bloqueado(ip, 100)
assert not auth.bloqueado(ip, 100 + auth.JANELA_S + 1)

# senha: argon2 confere a certa e recusa a errada
config.ADMIN_PASSWORD_HASH = PasswordHasher().hash("senha-certa")
assert auth.senha_confere("senha-certa")
assert not auth.senha_confere("senha-errada")
config.ADMIN_PASSWORD_HASH = ""
assert not auth.senha_confere("qualquer")  # sem hash configurado

# access token: emitido é aceito; sem "Bearer", lixo ou vazio são recusados
auth.exigir_admin(f"Bearer {auth.emitir_access_token()}")
for ruim in ("", auth.emitir_access_token(), "Bearer abc", "Bearer x.y.z"):
    try:
        auth.exigir_admin(ruim)
        raise AssertionError(f"aceitou credencial ruim: {ruim!r}")
    except HTTPException:
        pass

buf = io.BytesIO()
Image.new("RGB", (3000, 2000)).save(buf, "PNG")
webp = fotos.normalizar(buf.getvalue())
assert Image.open(io.BytesIO(webp)).size == (1600, 1067)
try:
    fotos.normalizar(b"<html>nao sou imagem</html>")
    raise AssertionError("aceitou arquivo que não é imagem")
except Image.UnidentifiedImageError:
    pass

assert ImovelIn(titulo="Casa", preco=1, url="", quartos=0).url is None
for ruim in ({"titulo": "", "preco": 1}, {"titulo": "a", "preco": 0},
             {"titulo": "a", "preco": 1, "imagem": "javascript:alert(1)"}):
    try:
        ImovelIn(**ruim)
        raise AssertionError(f"aceitou {ruim}")
    except ValidationError:
        pass

print("ok")
