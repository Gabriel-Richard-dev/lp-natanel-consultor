create table if not exists imoveis (
  id text primary key,
  titulo text not null,
  preco integer not null,
  url text not null,
  imagem text,
  bairro text,
  cidade text,
  quartos int,
  banheiros int,
  area text,
  origem text not null check (origem in ('chaves_na_mao', 'manual')),
  criado_em timestamptz not null default now(),
  atualizado_em timestamptz not null default now()
);

-- imóvel manual pode não ter anúncio publicado
alter table imoveis alter column url drop not null;

-- sessões do painel: refresh tokens (guardados só como hash sha256)
create table if not exists sessoes (
  token_hash text primary key,
  criada_em timestamptz not null default now(),
  ultimo_uso timestamptz not null default now(),
  expira_em timestamptz not null
);
