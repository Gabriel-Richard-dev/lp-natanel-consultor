import io
import json
import uuid
import warnings

from minio import Minio
from PIL import Image, ImageOps

from . import config

# foto de celular tem 3–12MB; o que fica guardado é o WebP reduzido
MAX_MB = 20
MAX_BYTES = MAX_MB * 1024 * 1024
MAX_LADO_PX = 1600

# imagem gigante "comprimida" (decompression bomb) vira erro em vez de aviso
warnings.simplefilter("error", Image.DecompressionBombWarning)

cliente = Minio(
    config.MINIO_ENDPOINT,
    access_key=config.MINIO_ACCESS_KEY,
    secret_key=config.MINIO_SECRET_KEY,
    secure=False,
)


def garantir_bucket() -> None:
    if cliente.bucket_exists(config.MINIO_BUCKET):
        return
    cliente.make_bucket(config.MINIO_BUCKET)
    cliente.set_bucket_policy(
        config.MINIO_BUCKET,
        json.dumps(
            {
                "Version": "2012-10-17",
                "Statement": [
                    {
                        "Effect": "Allow",
                        "Principal": {"AWS": ["*"]},
                        "Action": ["s3:GetObject"],
                        "Resource": [f"arn:aws:s3:::{config.MINIO_BUCKET}/*"],
                    }
                ],
            }
        ),
    )


def normalizar(dados: bytes) -> bytes:
    """Reencoda como WebP: rejeita o que não é imagem e remove EXIF (GPS do celular)."""
    with Image.open(io.BytesIO(dados)) as img:
        img.draft("RGB", (MAX_LADO_PX, MAX_LADO_PX))  # JPEG grande já decodifica reduzido
        img = ImageOps.exif_transpose(img).convert("RGB")
        img.thumbnail((MAX_LADO_PX, MAX_LADO_PX))
        saida = io.BytesIO()
        img.save(saida, "WEBP", quality=82)
        return saida.getvalue()


def salvar_foto(webp: bytes) -> str:
    chave = f"{uuid.uuid4()}.webp"
    cliente.put_object(
        config.MINIO_BUCKET,
        chave,
        io.BytesIO(webp),
        len(webp),
        content_type="image/webp",
    )
    return f"{config.MINIO_PUBLIC_URL}/{chave}"
