import time
from collections import defaultdict, deque

MAX_POR_JANELA = 5
JANELA_S = 60 * 60

# ponytail: em memória por IP (zera ao reiniciar, não é compartilhado entre
# réplicas), no mesmo espírito do limite de login em auth.py.
_envios: dict[str, deque[float]] = defaultdict(deque)


def limitado(ip: str, agora: float | None = None) -> bool:
    agora = agora or time.monotonic()
    fila = _envios[ip]
    while fila and agora - fila[0] > JANELA_S:
        fila.popleft()
    return len(fila) >= MAX_POR_JANELA


def registrar(ip: str, agora: float | None = None) -> None:
    _envios[ip].append(agora or time.monotonic())
