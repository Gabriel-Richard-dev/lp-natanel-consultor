from pathlib import Path

from psycopg.rows import dict_row
from psycopg_pool import ConnectionPool

from . import config

pool = ConnectionPool(
    config.DATABASE_URL, kwargs={"row_factory": dict_row}, open=False
)


def aplicar_schema() -> None:
    """schema.sql é idempotente: roda a cada boot e aplica migrações novas."""
    with pool.connection() as conn:
        conn.execute((Path(__file__).parent / "schema.sql").read_text())
