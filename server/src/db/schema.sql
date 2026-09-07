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
