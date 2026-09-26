import time
from collections import defaultdict, deque

import jwt
from argon2 import PasswordHasher
from argon2.exceptions import Argon2Error
from fastapi import Header, HTTPException

from . import config

# access token curto: quando vence, o front renova pelo refresh (cookie).
ACCESS_VALIDADE_S = 15 * 60
MAX_TENTATIVAS = 5
JANELA_S = 15 * 60

_ph = PasswordHasher()

# ponytail: rate limit em memória por IP; zera ao reiniciar e não é
# compartilhado entre réplicas. Troque por Redis se escalar a API.
_tentativas: dict[str, deque[float]] = defaultdict(deque)


def bloqueado(ip: str, agora: float | None = None) -> bool:
    agora = agora or time.monotonic()
    fila = _tentativas[ip]
    while fila and agora - fila[0] > JANELA_S:
        fila.popleft()
    return len(fila) >= MAX_TENTATIVAS


def registrar_falha(ip: str, agora: float | None = None) -> None:
    _tentativas[ip].append(agora or time.monotonic())


def senha_confere(senha: str) -> bool:
    if not config.ADMIN_PASSWORD_HASH:
        return False
    try:
        return _ph.verify(config.ADMIN_PASSWORD_HASH, senha)
    except Argon2Error:
        return False


def emitir_access_token() -> str:
    agora = int(time.time())
    return jwt.encode(
        {"role": "admin", "iat": agora, "exp": agora + ACCESS_VALIDADE_S},
        config.JWT_SECRET,
        algorithm="HS256",
    )


def exigir_admin(authorization: str = Header("")) -> None:
    if not authorization.startswith("Bearer "):
        raise HTTPException(401, "não autenticado")
    try:
        jwt.decode(authorization[7:], config.JWT_SECRET, algorithms=["HS256"])
    except jwt.PyJWTError:
        raise HTTPException(401, "sessão expirada, entre novamente")
