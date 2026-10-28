"""Checagens rápidas sem banco/MinIO: `python test_app.py`."""

import io
import os

os.environ.setdefault("DATABASE_URL", "postgresql://x@localhost/x")
os.environ.setdefault("JWT_SECRET", "x" * 32)
os.environ.setdefault("CORS_ORIGINS", "http://localhost")
for k in ("MINIO_ENDPOINT", "MINIO_ACCESS_KEY", "MINIO_SECRET_KEY", "MINIO_BUCKET", "MINIO_PUBLIC_URL"):
    os.environ.setdefault(k, "localhost:9000")

from argon2 import PasswordHasher
from fastapi import HTTPException
from PIL import Image
from pydantic import ValidationError

from app import auth, config, fotos, leads
from app import habitnet
from app.habitnet import extrair_cards
from app.main import ImovelIn, LeadIn

HTML = """
<a class="card" href="https://imoveis.habitnet.com.br/parque-marista/pedro-pimenta" data-r="fortaleza" data-s="new">
  <div class="ph"><img src="https://imoveis.habitnet.com.br/assets/mrv-parque-marista/hero.webp?v=1" alt="x"><span class="st new">Lançamento</span></div>
  <div class="bd"><h3>Parque Marista</h3><span class="loc">Centro · Fortaleza/CE</span>
  <ul><li>2 quartos, de 38,80 a 40,44 m²</li><li>Entrega prevista: Fevereiro/2029</li><li>18 itens de lazer</li></ul></div></a>
<a class="card" href="https://imoveis.habitnet.com.br/portal-da-barra/pedro-pimenta">
  <div class="ph"><img src="https://imoveis.habitnet.com.br/assets/tnd/logo.jpg?v=1" alt="x"></div>
  <div class="bd"><h3>Portal da Barra</h3><span class="loc">Barra do Ceará · Fortaleza/CE</span>
  <ul><li>2 quartos com 38,40 m² a 38,66 m²</li><li>Shopping RioMar</li><li>Em obras · acabamento</li></ul></div></a>
<a class="rcard" href="https://imoveis.habitnet.com.br/estilo-praia/pedro-pimenta">
  <div class="ph"><img src="https://imoveis.habitnet.com.br/assets/dir-estilo-praia/hero.webp?v=1" alt="x"><span>Reta final de obra</span></div>
  <div class="bd"><h3>Estilo Praia</h3><span class="loc">Praia do Futuro · Fortaleza/CE</span>
  <ul><li>2 e 3 quartos com suíte</li><li>48,18 a 76,77 m²</li><li>Entrega prevista: Out/2026</li></ul></div></a>
<a class="card" href="https://imoveis.habitnet.com.br/rooftop/pedro-pimenta">
  <div class="bd"><h3>Rooftop &amp; Co</h3><span class="loc">Pacheco · Caucaia/CE</span>
  <ul><li>Casas duplex com 123,51 m² de área privativa</li><li>Pronto para morar</li></ul></div></a>"""

a, b, r, c = extrair_cards(HTML, "MRV")
assert (r["id"], r["fase"], r["area"], r["quartos"], r["entrega"]) == ("hb-estilo-praia", "Reta final de obra", "48,18 a 76,77 m²", 2, "Out/2026")
assert (a["id"], a["titulo"], a["bairro"], a["cidade"], a["quartos"], a["area"], a["fase"], a["entrega"], a["construtora"]) == (
    "hb-parque-marista", "Parque Marista", "Centro", "Fortaleza", 2, "38,80 a 40,44 m²", "Lançamento", "Fevereiro/2029", "MRV")
assert a["imagem_fonte"].endswith("hero.webp?v=1")
assert (b["quartos"], b["area"], b["fase"], b["entrega"]) == (2, "38,40 a 38,66 m²", "Em obras · acabamento", None)
assert (c["titulo"], c["quartos"], c["area"], c["fase"], c["imagem_fonte"]) == ("Rooftop & Co", None, "123,51 m²", "Pronto para morar", None)

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

# leads: telefone vira só dígitos; sem consentimento, nome curto ou telefone ruim são recusados
lead = LeadIn(nome="Ana", telefone="(85) 98778-5187", consentimento=True, cidade="")
assert lead.telefone == "85987785187" and lead.cidade is None
for ruim in ({"nome": "A", "telefone": "85987785187", "consentimento": True},
             {"nome": "Ana", "telefone": "123", "consentimento": True},
             {"nome": "Ana", "telefone": "85987785187", "consentimento": False}):
    try:
        LeadIn(**ruim)
        raise AssertionError(f"aceitou {ruim}")
    except ValidationError:
        pass

ip = "9.9.9.9"
for _ in range(leads.MAX_POR_JANELA):
    assert not leads.limitado(ip, 10)
    leads.registrar(ip, 10)
assert leads.limitado(ip, 10)
assert not leads.limitado(ip, 10 + leads.JANELA_S + 1)

# download do portal: repete falha de rede, mas não repete 404
import urllib.error
import urllib.request

class _Resposta:
    def __init__(self, corpo): self.corpo = corpo
    def read(self, n): return self.corpo[:n]
    def __enter__(self): return self
    def __exit__(self, *a): return False

def _simular(erros):
    chamadas = []
    def falso(req, timeout):
        chamadas.append(1)
        if erros:
            raise erros.pop(0)
        return _Resposta(b"<html>ok</html>")
    urllib.request.urlopen = falso
    habitnet.time.sleep = lambda s: None
    return chamadas

original = urllib.request.urlopen
try:
    ch = _simular([urllib.error.URLError("dns"), TimeoutError("lento")])
    assert habitnet._baixar("https://imoveis.habitnet.com.br/x", 100) == b"<html>ok</html>" and len(ch) == 3
    ch = _simular([urllib.error.HTTPError("u", 404, "nao achou", {}, None)])
    try:
        habitnet._baixar("https://imoveis.habitnet.com.br/x", 100)
        raise AssertionError("repetiu 404")
    except urllib.error.HTTPError:
        assert len(ch) == 1
    ch = _simular([urllib.error.URLError("dns")] * 3)
    try:
        habitnet._baixar("https://imoveis.habitnet.com.br/x", 100)
        raise AssertionError("não desistiu")
    except urllib.error.URLError:
        assert len(ch) == 3
finally:
    urllib.request.urlopen = original

print("ok")
