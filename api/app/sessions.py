import hashlib
import secrets
from datetime import datetime, timedelta, timezone

from .db import pool

REFRESH_VALIDADE = timedelta(days=30)


def _hash(token: str) -> str:
    # guardamos só o hash: um vazamento do banco não expõe tokens usáveis.
    return hashlib.sha256(token.encode()).hexdigest()


def criar() -> str:
    token = secrets.token_urlsafe(32)
    with pool.connection() as conn:
        conn.execute(
            "insert into sessoes (token_hash, expira_em) values (%s, %s)",
            [_hash(token), datetime.now(timezone.utc) + REFRESH_VALIDADE],
        )
    return token


def validar(token: str | None) -> bool:
    """Sessão existe e não venceu? Renova o prazo (expiração deslizante)."""
    if not token:
        return False
    agora = datetime.now(timezone.utc)
    with pool.connection() as conn:
        cur = conn.execute(
            "update sessoes set ultimo_uso = %s, expira_em = %s "
            "where token_hash = %s and expira_em > %s",
            [agora, agora + REFRESH_VALIDADE, _hash(token), agora],
        )
        return cur.rowcount > 0


def encerrar(token: str | None) -> None:
    if not token:
        return
    with pool.connection() as conn:
        conn.execute("delete from sessoes where token_hash = %s", [_hash(token)])


def limpar_vencidas() -> None:
    with pool.connection() as conn:
        conn.execute("delete from sessoes where expira_em < now()")
