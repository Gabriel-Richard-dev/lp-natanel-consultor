create table if not exists imoveis (
  id text primary key,
  titulo text not null,
  preco integer,
  url text not null,
  imagem text,
  bairro text,
  cidade text,
  quartos int,
  banheiros int,
  area text,
  origem text not null check (origem in ('habitnet', 'manual')),
  criado_em timestamptz not null default now(),
  atualizado_em timestamptz not null default now()
);

-- imóvel manual pode não ter anúncio publicado
alter table imoveis alter column url drop not null;

-- migrações: o portal Habitnet substituiu o Chaves na Mão (empreendimentos não trazem preço)
alter table imoveis alter column preco drop not null;
alter table imoveis add column if not exists construtora text;
alter table imoveis add column if not exists fase text;
alter table imoveis add column if not exists entrega text;
alter table imoveis add column if not exists imagem_fonte text;
delete from imoveis where origem = 'chaves_na_mao';
alter table imoveis drop constraint if exists imoveis_origem_check;
alter table imoveis add constraint imoveis_origem_check check (origem in ('habitnet', 'manual'));

-- contatos captados pelo formulário do site
create table if not exists leads (
  id text primary key,
  nome text not null,
  telefone text not null,
  interesse text,
  orcamento text,
  cidade text,
  imovel text,
  mensagem text,
  origem text,
  atendido boolean not null default false,
  criado_em timestamptz not null default now()
);

-- sessões do painel: refresh tokens (guardados só como hash sha256)
create table if not exists sessoes (
  token_hash text primary key,
  criada_em timestamptz not null default now(),
  ultimo_uso timestamptz not null default now(),
  expira_em timestamptz not null
);
