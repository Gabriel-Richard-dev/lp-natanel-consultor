import { Loader2 } from "lucide-react";
import { useState } from "react";
import { OfertaCard } from "@/components/sections/oferta-card";
import { atualizarImovel, criarImovel, enviarImagem, type ImovelInput } from "@/lib/api";
import { navegar } from "@/lib/rota";
import { cn, mensagemDe } from "@/lib/utils";
import {
  botaoPrimario,
  botaoSecundario,
  Cabecalho,
  Campo,
  cartao,
  inputCls,
  type Painel,
  Secao,
} from "./ui";

// igual ao limite da API (api/app/fotos.py)
const MAX_FOTO_MB = 20;

const FORM_VAZIO: ImovelInput = {
  titulo: "",
  preco: null,
  url: "",
  imagem: "",
  bairro: "",
  cidade: "",
  quartos: null,
  banheiros: null,
  area: "",
};

const NUMERICOS = new Set<keyof ImovelInput>(["preco", "quartos", "banheiros"]);

export function PaginaImovel({ painel, id }: { painel: Painel; id?: string }) {
  if (!id) return <Formulario inicial={FORM_VAZIO} painel={painel} />;
  if (painel.imoveis === null) {
    return <p className="py-16 text-center text-apagado text-sm">Carregando…</p>;
  }

  const imovel = painel.imoveis.find((i) => i.id === id && i.origem === "manual");
  if (!imovel) {
    return (
      <div className="py-16 text-center">
        <p className="font-medium">Imóvel não encontrado</p>
        <p className="mt-1 mb-5 text-apagado text-sm">
          Ele pode ter sido excluído, ou é um anúncio do Chaves na Mão (esses não são editados aqui).
        </p>
        <a className={botaoSecundario} href="/admin/imoveis">
          Voltar para imóveis
        </a>
      </div>
    );
  }
  return <Formulario id={id} inicial={imovel} key={id} painel={painel} />;
}

function Formulario({
  painel,
  inicial,
  id,
}: {
  painel: Painel;
  inicial: ImovelInput;
  id?: string;
}) {
  const { recarregar, avisar } = painel;
  const [dados, setDados] = useState(inicial);
  const [enviandoFoto, setEnviandoFoto] = useState(false);
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState("");

  function campo(chave: keyof ImovelInput) {
    return {
      value: dados[chave] ?? "",
      onChange: (e: React.ChangeEvent<HTMLInputElement>) => {
        const bruto = e.target.value;
        setDados((d) => ({
          ...d,
          [chave]: NUMERICOS.has(chave) ? (bruto === "" ? null : Number(bruto)) : bruto,
        }));
      },
    };
  }

  async function enviarFoto(arquivo: File | undefined) {
    if (!arquivo) return;
    setErro("");
    if (arquivo.size > MAX_FOTO_MB * 1024 * 1024) {
      setErro(`A foto tem mais de ${MAX_FOTO_MB}MB. Escolha uma menor.`);
      return;
    }
    setEnviandoFoto(true);
    try {
      const { url } = await enviarImagem(arquivo);
      setDados((d) => ({ ...d, imagem: url }));
    } catch (err) {
      setErro(mensagemDe(err, "falha ao enviar a foto"));
    } finally {
      setEnviandoFoto(false);
    }
  }

  async function salvar(e: React.FormEvent) {
    e.preventDefault();
    setSalvando(true);
    setErro("");
    try {
      if (id) await atualizarImovel(id, dados);
      else await criarImovel(dados);
      await recarregar();
      avisar(id ? "Alterações salvas" : "Imóvel publicado no site");
      navegar("/admin/imoveis");
    } catch (err) {
      setErro(mensagemDe(err, "erro ao salvar"));
      setSalvando(false);
    }
  }

  const preview = {
    ...dados,
    id: "preview",
    origem: "manual" as const,
    atualizado_em: "",
    titulo: dados.titulo || "Título do anúncio",
    preco: dados.preco ?? 0,
  };

  return (
    <form className="space-y-6" onSubmit={salvar}>
      <Cabecalho
        sobre={
          <a className="hover:text-tinta" href="/admin/imoveis">
            ← Imóveis
          </a>
        }
        titulo={id ? "Editar imóvel" : "Cadastrar imóvel"}
      />

      <div className="grid items-start gap-8 lg:grid-cols-[1fr_300px]">
        <div className={cartao}>
          <Secao dica="É a primeira coisa que o cliente vê. Foto na horizontal fica melhor." titulo="Foto">
            <label
              className={cn(
                "relative flex aspect-[16/10] cursor-pointer items-center justify-center overflow-hidden rounded-md border border-dashed transition",
                dados.imagem ? "border-transparent" : "border-linha bg-papel/60 hover:border-ouro"
              )}
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault();
                enviarFoto(e.dataTransfer.files[0]);
              }}
            >
              <input
                accept="image/*"
                className="sr-only"
                onChange={(e) => {
                  enviarFoto(e.target.files?.[0]);
                  e.target.value = "";
                }}
                type="file"
              />
              {dados.imagem ? (
                <img alt="Foto do imóvel" className="absolute inset-0 h-full w-full object-cover" src={dados.imagem} />
              ) : (
                <span className="px-4 text-center text-apagado text-sm">
                  <span className="font-medium text-tinta underline decoration-ouro underline-offset-4">
                    Escolher foto
                  </span>{" "}
                  ou arraste aqui
                  <span className="mt-1 block text-xs">JPG, PNG ou WebP, até {MAX_FOTO_MB}MB</span>
                </span>
              )}
              {enviandoFoto && (
                <span className="absolute inset-0 flex items-center justify-center gap-2 bg-white/80 text-sm">
                  <Loader2 className="h-4 w-4 animate-spin" /> Enviando foto…
                </span>
              )}
            </label>
            {dados.imagem && !enviandoFoto && (
              <div className="mt-2 flex gap-4 text-sm">
                <label className="cursor-pointer text-ouro-texto hover:underline">
                  Trocar foto
                  <input
                    accept="image/*"
                    className="sr-only"
                    onChange={(e) => {
                      enviarFoto(e.target.files?.[0]);
                      e.target.value = "";
                    }}
                    type="file"
                  />
                </label>
                <button
                  className="text-apagado hover:text-red-700"
                  onClick={() => setDados((d) => ({ ...d, imagem: "" }))}
                  type="button"
                >
                  Remover
                </button>
              </div>
            )}
          </Secao>

          <Secao dica="Título e preço aparecem em destaque no card do site." titulo="Anúncio">
            <div className="space-y-4">
              <Campo label="Título">
                <input
                  className={inputCls}
                  maxLength={200}
                  placeholder="Apartamento 2 quartos perto do shopping"
                  required
                  {...campo("titulo")}
                />
              </Campo>
              <Campo label="Preço (R$)">
                <input
                  className={inputCls}
                  inputMode="numeric"
                  min={1}
                  placeholder="250000"
                  required
                  type="number"
                  {...campo("preco")}
                />
              </Campo>
              <Campo label="Link do anúncio (opcional)">
                <input className={inputCls} placeholder="https://" type="url" {...campo("url")} />
              </Campo>
            </div>
          </Secao>

          <Secao titulo="Localização">
            <div className="grid gap-4 sm:grid-cols-2">
              <Campo label="Bairro">
                <input className={inputCls} maxLength={120} placeholder="Pici" {...campo("bairro")} />
              </Campo>
              <Campo label="Cidade">
                <input className={inputCls} maxLength={120} placeholder="Fortaleza" {...campo("cidade")} />
              </Campo>
            </div>
          </Secao>

          <Secao titulo="Características">
            <div className="grid grid-cols-3 gap-4">
              <Campo label="Quartos">
                <input className={inputCls} max={50} min={0} placeholder="2" type="number" {...campo("quartos")} />
              </Campo>
              <Campo label="Banheiros">
                <input className={inputCls} max={50} min={0} placeholder="1" type="number" {...campo("banheiros")} />
              </Campo>
              <Campo label="Área">
                <input className={inputCls} maxLength={30} placeholder="45m²" {...campo("area")} />
              </Campo>
            </div>
          </Secao>

          <div className="sticky bottom-[calc(3.75rem+env(safe-area-inset-bottom))] flex flex-wrap items-center justify-end gap-3 rounded-b-lg border-linha border-t bg-white px-5 py-3 md:bottom-0 md:px-6">
            {erro && (
              <p className="mr-auto text-red-700 text-sm" role="alert">
                {erro}
              </p>
            )}
            <a className={botaoSecundario} href="/admin/imoveis">
              Cancelar
            </a>
            <button className={botaoPrimario} disabled={salvando || enviandoFoto} type="submit">
              {salvando && <Loader2 className="h-4 w-4 animate-spin" />}
              {id ? "Salvar alterações" : "Publicar no site"}
            </button>
          </div>
        </div>

        <aside className="lg:sticky lg:top-10">
          <p className="mb-3 text-apagado text-xs">Prévia no site</p>
          <div inert>
            <OfertaCard oferta={preview} />
          </div>
        </aside>
      </div>
    </form>
  );
}
