import asyncio
import logging
import re
import uuid
from contextlib import asynccontextmanager
from typing import Annotated

from fastapi import Cookie, Depends, FastAPI, File, HTTPException, Request, Response, UploadFile
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel, Field, field_validator

from . import auth, config, fotos, habitnet, leads, sessions
from .db import aplicar_schema, pool

REFRESH_COOKIE = "refresh"
COOKIE_PATH = "/auth"

log = logging.getLogger("uvicorn.error")


@asynccontextmanager
async def lifespan(_app: FastAPI):
    pool.open(wait=True)
    aplicar_schema()
    sessions.limpar_vencidas()
    fotos.garantir_bucket()
    yield
    pool.close()


app = FastAPI(lifespan=lifespan, docs_url=None, redoc_url=None, openapi_url=None)

Admin = Depends(auth.exigir_admin)


# O front lê `{erro: "..."}`; mantém o mesmo formato de resposta de erro.
@app.exception_handler(HTTPException)
async def erro_http(_req, exc: HTTPException):
    return JSONResponse({"erro": exc.detail}, exc.status_code, headers=exc.headers)


@app.exception_handler(RequestValidationError)
async def erro_validacao(_req, exc: RequestValidationError):
    campo = exc.errors()[0]["loc"][-1]
    return JSONResponse({"erro": f"campo inválido: {campo}"}, 400)


# Barra upload grande antes do multipart ser lido (o parse acontece antes do auth)
# e devolve erro inesperado como JSON. Fica registrado antes do CORS: o último
# middleware registrado é o mais externo, então o CORS marca também estas
# respostas. Sem isso o navegador esconde o erro e o painel só vê "Failed to fetch".
@app.middleware("http")
async def proteger(request: Request, call_next):
    if request.url.path == "/upload" and request.method == "POST":
        tamanho = request.headers.get("content-length", "")
        if not tamanho.isdigit() or int(tamanho) > fotos.MAX_BYTES + 64 * 1024:
            return JSONResponse({"erro": f"foto maior que {fotos.MAX_MB}MB"}, 413)
    try:
        return await call_next(request)
    except Exception:
        log.exception("erro não tratado em %s", request.url.path)
        return JSONResponse({"erro": "erro interno, tente de novo"}, 500)


# allow_credentials: o navegador precisa enviar o cookie do refresh nas
# chamadas a /auth. Exige origem específica (nunca "*"), que já é o caso.
app.add_middleware(
    CORSMiddleware,
    allow_origins=config.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE"],
    allow_headers=["Authorization", "Content-Type"],
)


class Login(BaseModel):
    senha: str = Field(min_length=1, max_length=200)


Texto = Annotated[str | None, Field(max_length=120)]
Link = Annotated[str | None, Field(max_length=1000, pattern=r"^https?://\S+$")]
Contagem = Annotated[int | None, Field(ge=0, le=50)]


class ImovelIn(BaseModel):
    titulo: str = Field(min_length=1, max_length=200)
    preco: int = Field(gt=0, lt=1_000_000_000)
    url: Link = None
    imagem: Link = None
    bairro: Texto = None
    cidade: Texto = None
    quartos: Contagem = None
    banheiros: Contagem = None
    area: Annotated[str | None, Field(max_length=30)] = None

    @field_validator("*", mode="before")
    @classmethod
    def vazio_vira_nulo(cls, v):
        return None if isinstance(v, str) and not v.strip() else v


class LeadIn(BaseModel):
    nome: str = Field(min_length=2, max_length=100)
    telefone: str
    interesse: Texto = None
    orcamento: Texto = None
    cidade: Texto = None
    imovel: Annotated[str | None, Field(max_length=200)] = None
    mensagem: Annotated[str | None, Field(max_length=500)] = None
    origem: Annotated[str | None, Field(max_length=40)] = None
    consentimento: bool
    site: str | None = None  # isca para robôs: pessoa nenhuma vê nem preenche

    @field_validator("telefone")
    @classmethod
    def so_digitos(cls, v: str) -> str:
        digitos = re.sub(r"\D", "", v)
        if not 10 <= len(digitos) <= 13:
            raise ValueError("telefone inválido")
        return digitos

    @field_validator("consentimento")
    @classmethod
    def precisa_aceitar(cls, v: bool) -> bool:
        if not v:
            raise ValueError("consentimento obrigatório")
        return v

    @field_validator("*", mode="before")
    @classmethod
    def vazio_vira_nulo(cls, v):
        return None if isinstance(v, str) and not v.strip() else v


CAMPOS = "titulo, preco, url, imagem, bairro, cidade, quartos, banheiros, area"
VALORES = "%(titulo)s, %(preco)s, %(url)s, %(imagem)s, %(bairro)s, %(cidade)s, %(quartos)s, %(banheiros)s, %(area)s"


@app.get("/health")
def health():
    return {"ok": True}


def _set_refresh(resposta: Response, token: str) -> None:
    resposta.set_cookie(
        REFRESH_COOKIE,
        token,
        max_age=int(sessions.REFRESH_VALIDADE.total_seconds()),
        httponly=True,
        secure=config.COOKIE_SECURE,
        samesite=config.COOKIE_SAMESITE,
        path=COOKIE_PATH,
    )


@app.post("/auth/login")
def login(dados: Login, request: Request, resposta: Response):
    ip = request.client.host if request.client else "?"
    if auth.bloqueado(ip):
        raise HTTPException(429, "muitas tentativas, aguarde 15 minutos")
    if not auth.senha_confere(dados.senha):
        auth.registrar_falha(ip)
        raise HTTPException(401, "senha inválida")
    _set_refresh(resposta, sessions.criar())
    return {"token": auth.emitir_access_token()}


@app.post("/auth/refresh")
def refresh(token: str | None = Cookie(default=None, alias=REFRESH_COOKIE)):
    if not sessions.validar(token):
        raise HTTPException(401, "sessão expirada, entre novamente")
    return {"token": auth.emitir_access_token()}


@app.post("/auth/logout", status_code=204)
def logout(token: str | None = Cookie(default=None, alias=REFRESH_COOKIE)):
    sessions.encerrar(token)
    resposta = Response(status_code=204)
    resposta.delete_cookie(REFRESH_COOKIE, path=COOKIE_PATH)
    return resposta


@app.get("/imoveis")
def listar():
    with pool.connection() as conn:
        return conn.execute(
            "select * from imoveis order by criado_em desc, construtora, titulo"
        ).fetchall()


@app.post("/imoveis", status_code=201, dependencies=[Admin])
def criar(dados: ImovelIn):
    with pool.connection() as conn:
        return conn.execute(
            f"insert into imoveis (id, {CAMPOS}, origem) values (%(id)s, {VALORES}, 'manual') returning *",
            {"id": str(uuid.uuid4()), **dados.model_dump()},
        ).fetchone()


@app.put("/imoveis/{id}", dependencies=[Admin])
def atualizar(id: str, dados: ImovelIn):
    with pool.connection() as conn:
        linha = conn.execute(
            f"update imoveis set ({CAMPOS}, atualizado_em) = ({VALORES}, now()) "
            "where id = %(id)s and origem = 'manual' returning *",
            {"id": id, **dados.model_dump()},
        ).fetchone()
    if not linha:
        raise HTTPException(404, "imóvel manual não encontrado")
    return linha


@app.delete("/imoveis/{id}", status_code=204, dependencies=[Admin])
def remover(id: str):
    with pool.connection() as conn:
        cur = conn.execute("delete from imoveis where id = %s and origem = 'manual'", [id])
    if not cur.rowcount:
        raise HTTPException(404, "imóvel manual não encontrado")
    return Response(status_code=204)


@app.post("/leads", status_code=201)
def novo_lead(dados: LeadIn, request: Request):
    if dados.site:
        return {"ok": True}  # robô: finge que deu certo e não guarda
    ip = request.client.host if request.client else "?"
    if leads.limitado(ip):
        raise HTTPException(429, "muitas solicitações, tente de novo mais tarde")
    leads.registrar(ip)
    campos = dados.model_dump(exclude={"consentimento", "site"})
    with pool.connection() as conn:
        conn.execute(
            """insert into leads (id, nome, telefone, interesse, orcamento, cidade, imovel, mensagem, origem)
               values (%(id)s, %(nome)s, %(telefone)s, %(interesse)s, %(orcamento)s, %(cidade)s,
                 %(imovel)s, %(mensagem)s, %(origem)s)""",
            {"id": str(uuid.uuid4()), **campos},
        )
    return {"ok": True}


@app.get("/leads", dependencies=[Admin])
def listar_leads():
    with pool.connection() as conn:
        return conn.execute("select * from leads order by atendido, criado_em desc").fetchall()


@app.put("/leads/{id}", dependencies=[Admin])
def marcar_lead(id: str, atendido: bool = True):
    with pool.connection() as conn:
        linha = conn.execute(
            "update leads set atendido = %s where id = %s returning *", [atendido, id]
        ).fetchone()
    if not linha:
        raise HTTPException(404, "contato não encontrado")
    return linha


@app.delete("/leads/{id}", status_code=204, dependencies=[Admin])
def remover_lead(id: str):
    with pool.connection() as conn:
        cur = conn.execute("delete from leads where id = %s", [id])
    if not cur.rowcount:
        raise HTTPException(404, "contato não encontrado")
    return Response(status_code=204)


@app.post("/sync/habitnet", dependencies=[Admin])
def sync():
    try:
        return {"ok": True, **habitnet.sincronizar()}
    except Exception as err:
        raise HTTPException(502, f"falha ao sincronizar: {err}")


@app.post("/upload", dependencies=[Admin])
async def upload(imagem: UploadFile = File(...)):
    dados = await imagem.read(fotos.MAX_BYTES + 1)
    if len(dados) > fotos.MAX_BYTES:
        raise HTTPException(413, f"foto maior que {fotos.MAX_MB}MB")
    try:
        webp = await asyncio.to_thread(fotos.normalizar, dados)
    except Exception:
        raise HTTPException(400, "arquivo não é uma imagem válida")
    return {"url": await asyncio.to_thread(fotos.salvar_foto, webp)}
