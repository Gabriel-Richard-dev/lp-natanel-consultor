import os

DATABASE_URL = os.environ["DATABASE_URL"]
JWT_SECRET = os.environ["JWT_SECRET"]
ADMIN_PASSWORD_HASH = os.environ.get("ADMIN_PASSWORD_HASH", "")
CORS_ORIGINS = [o.strip() for o in os.environ["CORS_ORIGINS"].split(",") if o.strip()]

MINIO_ENDPOINT = os.environ["MINIO_ENDPOINT"]
MINIO_ACCESS_KEY = os.environ["MINIO_ACCESS_KEY"]
MINIO_SECRET_KEY = os.environ["MINIO_SECRET_KEY"]
MINIO_BUCKET = os.environ["MINIO_BUCKET"]
MINIO_PUBLIC_URL = os.environ["MINIO_PUBLIC_URL"].rstrip("/")

CHAVES_NA_MAO_URL = os.environ["CHAVES_NA_MAO_URL"]

# Cookie do refresh token. Em produção (HTTPS) defina COOKIE_SECURE=true.
# Se o site e a API ficarem em domínios diferentes, use COOKIE_SAMESITE=none
# (exige COOKIE_SECURE=true).
COOKIE_SECURE = os.environ.get("COOKIE_SECURE", "false").lower() == "true"
COOKIE_SAMESITE = os.environ.get("COOKIE_SAMESITE", "lax").lower()

if len(JWT_SECRET) < 32:
    raise SystemExit("JWT_SECRET precisa ter pelo menos 32 caracteres")
