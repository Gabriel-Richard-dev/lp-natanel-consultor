# Natanael Machado — Consultor Imobiliário

```
web/      site (React + Vite) e painel admin em /#/admin
api/      API (FastAPI + Postgres), fotos no MinIO, sync com o Chaves na Mão
```

## Rodar

```sh
cp .env.example .env   # preencha as senhas e o JWT_SECRET
docker compose build api
docker compose run --rm --no-deps api python -m app.hash_senha 'senha-do-painel'
# cole o hash em ADMIN_PASSWORD_HASH (entre aspas simples)
docker compose up -d --build
```

- Site: http://localhost:8080 — painel: http://localhost:8080/admin
- API: http://localhost:8080/api (e direto em http://localhost:3001, só na própria máquina)
- MinIO (console das fotos): http://localhost:9001 — só acessível na própria máquina

Os imóveis do Chaves na Mão só são sincronizados pelo botão no painel. Imóveis cadastrados à mão nunca são alterados pelo sync.

## Desenvolvimento

```sh
docker compose up -d db minio api
cd web && npm install && npm run dev
```

## Segurança

- Login: senha com bcrypt, 5 tentativas erradas por IP bloqueiam 15 min, sessão de 24h.
- CORS: a API só aceita o navegador vindo de `CORS_ORIGINS`.
- Fotos: toda imagem é reprocessada para WebP (bloqueia arquivo disfarçado e remove GPS/EXIF), máx. 5MB.
- Postgres não é exposto fora do Docker; console do MinIO só em 127.0.0.1.
- Checagens: `docker compose run --rm --no-deps api python test_app.py`
