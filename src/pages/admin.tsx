import { useEffect, useState } from "react";
import {
  atualizarImovel,
  criarImovel,
  enviarImagem,
  type Imovel,
  type ImovelInput,
  listarImoveis,
  login,
  removerImovel,
  sincronizarChavesNaMao,
} from "@/lib/api";

const TOKEN_KEY = "natanael_admin_token";

const FORM_VAZIO: ImovelInput = {
  titulo: "",
  preco: 0,
  url: "",
  imagem: "",
  bairro: "",
  cidade: "",
  quartos: null,
  banheiros: null,
  area: "",
};

function LoginForm({ onEntrar }: { onEntrar: (token: string) => void }) {
  const [senha, setSenha] = useState("");
  const [erro, setErro] = useState("");
  const [enviando, setEnviando] = useState(false);

  async function entrar(e: React.FormEvent) {
    e.preventDefault();
    setEnviando(true);
    setErro("");
    try {
      const { token } = await login(senha);
      onEntrar(token);
    } catch (err) {
      setErro(err instanceof Error ? err.message : "erro ao entrar");
    } finally {
      setEnviando(false);
    }
  }

  return (
    <form
      className="mx-auto mt-24 max-w-sm space-y-4 rounded-2xl border border-border bg-card p-6"
      onSubmit={entrar}
    >
      <h1 className="font-bold text-xl">Entrar no painel</h1>
      <input
        autoFocus
        className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
        onChange={(e) => setSenha(e.target.value)}
        placeholder="senha"
        type="password"
        value={senha}
      />
      {erro && <p className="text-red-600 text-sm">{erro}</p>}
      <button
        className="w-full rounded-lg bg-emerald-600 py-2 font-medium text-sm text-white disabled:opacity-50"
        disabled={enviando}
        type="submit"
      >
        Entrar
      </button>
    </form>
  );
}

function ImovelForm({
  inicial,
  onSalvar,
  onCancelar,
  token,
}: {
  inicial: ImovelInput;
  onSalvar: (dados: ImovelInput) => Promise<void>;
  onCancelar?: () => void;
  token: string;
}) {
  const [dados, setDados] = useState(inicial);
  const [enviandoImagem, setEnviandoImagem] = useState(false);
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState("");

  useEffect(() => setDados(inicial), [inicial]);

  function campo<K extends keyof ImovelInput>(chave: K) {
    return {
      value: dados[chave] ?? "",
      onChange: (e: React.ChangeEvent<HTMLInputElement>) => {
        const bruto = e.target.value;
        const numerico = chave === "preco" || chave === "quartos" || chave === "banheiros";
        setDados((d) => ({
          ...d,
          [chave]: numerico ? (bruto === "" ? null : Number(bruto)) : bruto,
        }));
      },
    };
  }

  async function handleImagem(e: React.ChangeEvent<HTMLInputElement>) {
    const arquivo = e.target.files?.[0];
    if (!arquivo) return;
    setEnviandoImagem(true);
    try {
      const { url } = await enviarImagem(token, arquivo);
      setDados((d) => ({ ...d, imagem: url }));
    } catch (err) {
      setErro(err instanceof Error ? err.message : "falha no upload");
    } finally {
      setEnviandoImagem(false);
    }
  }

  async function salvar(e: React.FormEvent) {
    e.preventDefault();
    setSalvando(true);
    setErro("");
    try {
      await onSalvar(dados);
      if (!onCancelar) setDados(FORM_VAZIO);
    } catch (err) {
      setErro(err instanceof Error ? err.message : "erro ao salvar");
    } finally {
      setSalvando(false);
    }
  }

  return (
    <form
      className="grid gap-3 rounded-2xl border border-border bg-card p-5 sm:grid-cols-2"
      onSubmit={salvar}
    >
      <input
        className="rounded-lg border border-border bg-background px-3 py-2 text-sm sm:col-span-2"
        placeholder="Título"
        required
        {...campo("titulo")}
      />
      <input
        className="rounded-lg border border-border bg-background px-3 py-2 text-sm"
        placeholder="Preço (R$)"
        required
        type="number"
        {...campo("preco")}
      />
      <input
        className="rounded-lg border border-border bg-background px-3 py-2 text-sm sm:col-span-2"
        placeholder="URL do anúncio"
        required
        {...campo("url")}
      />
      <input
        className="rounded-lg border border-border bg-background px-3 py-2 text-sm"
        placeholder="Bairro"
        {...campo("bairro")}
      />
      <input
        className="rounded-lg border border-border bg-background px-3 py-2 text-sm"
        placeholder="Cidade"
        {...campo("cidade")}
      />
      <input
        className="rounded-lg border border-border bg-background px-3 py-2 text-sm"
        placeholder="Quartos"
        type="number"
        {...campo("quartos")}
      />
      <input
        className="rounded-lg border border-border bg-background px-3 py-2 text-sm"
        placeholder="Banheiros"
        type="number"
        {...campo("banheiros")}
      />
      <input
        className="rounded-lg border border-border bg-background px-3 py-2 text-sm"
        placeholder="Área (ex: 45m²)"
        {...campo("area")}
      />
      <div className="sm:col-span-2">
        <input accept="image/*" onChange={handleImagem} type="file" />
        {enviandoImagem && (
          <span className="ml-2 text-muted-foreground text-xs">
            enviando imagem…
          </span>
        )}
        {dados.imagem && (
          <img
            alt="preview"
            className="mt-2 h-24 w-32 rounded-lg object-cover"
            src={dados.imagem}
          />
        )}
      </div>

      {erro && <p className="text-red-600 text-sm sm:col-span-2">{erro}</p>}

      <div className="flex gap-2 sm:col-span-2">
        <button
          className="rounded-lg bg-emerald-600 px-4 py-2 font-medium text-sm text-white disabled:opacity-50"
          disabled={salvando || enviandoImagem}
          type="submit"
        >
          {onCancelar ? "Salvar alterações" : "Adicionar imóvel"}
        </button>
        {onCancelar && (
          <button
            className="rounded-lg border border-border px-4 py-2 font-medium text-sm"
            onClick={onCancelar}
            type="button"
          >
            Cancelar
          </button>
        )}
      </div>
    </form>
  );
}

function Painel({ token, onSair }: { token: string; onSair: () => void }) {
  const [imoveis, setImoveis] = useState<Imovel[]>([]);
  const [editando, setEditando] = useState<Imovel | null>(null);
  const [sincronizando, setSincronizando] = useState(false);
  const [mensagemSync, setMensagemSync] = useState("");

  async function recarregar() {
    setImoveis(await listarImoveis());
  }

  useEffect(() => {
    recarregar();
  }, []);

  async function sincronizar() {
    setSincronizando(true);
    setMensagemSync("");
    try {
      const { total } = await sincronizarChavesNaMao(token);
      setMensagemSync(`${total} imóveis sincronizados do Chaves na Mão.`);
      await recarregar();
    } catch (err) {
      setMensagemSync(
        err instanceof Error ? err.message : "falha ao sincronizar"
      );
    } finally {
      setSincronizando(false);
    }
  }

  async function excluir(id: string) {
    if (!confirm("Excluir este imóvel manual?")) return;
    await removerImovel(token, id);
    await recarregar();
  }

  return (
    <div className="mx-auto max-w-4xl space-y-8 px-4 py-16 md:px-6">
      <div className="flex items-center justify-between">
        <h1 className="font-bold text-2xl">Gestão de imóveis</h1>
        <button
          className="text-muted-foreground text-sm hover:text-foreground"
          onClick={onSair}
          type="button"
        >
          Sair
        </button>
      </div>

      <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-border bg-card p-5">
        <button
          className="rounded-lg bg-emerald-600 px-4 py-2 font-medium text-sm text-white disabled:opacity-50"
          disabled={sincronizando}
          onClick={sincronizar}
          type="button"
        >
          {sincronizando ? "Sincronizando…" : "Resincronizar com Chaves na Mão"}
        </button>
        {mensagemSync && (
          <span className="text-muted-foreground text-sm">
            {mensagemSync}
          </span>
        )}
      </div>

      <div>
        <h2 className="mb-3 font-semibold text-lg">
          {editando ? "Editar imóvel manual" : "Adicionar imóvel manual"}
        </h2>
        <ImovelForm
          inicial={editando ?? FORM_VAZIO}
          key={editando?.id ?? "novo"}
          onCancelar={editando ? () => setEditando(null) : undefined}
          onSalvar={async (dados) => {
            if (editando) {
              await atualizarImovel(token, editando.id, dados);
              setEditando(null);
            } else {
              await criarImovel(token, dados);
            }
            await recarregar();
          }}
          token={token}
        />
      </div>

      <div className="space-y-2">
        <h2 className="font-semibold text-lg">
          Todos os imóveis ({imoveis.length})
        </h2>
        {imoveis.map((imovel) => (
          <div
            className="flex items-center justify-between gap-3 rounded-xl border border-border bg-card p-3"
            key={imovel.id}
          >
            <div className="flex items-center gap-3 overflow-hidden">
              {imovel.imagem && (
                <img
                  alt=""
                  className="h-12 w-16 shrink-0 rounded-md object-cover"
                  src={imovel.imagem}
                />
              )}
              <div className="overflow-hidden">
                <p className="truncate font-medium text-sm">
                  {imovel.titulo}
                </p>
                <p className="text-muted-foreground text-xs">
                  {imovel.bairro}, {imovel.cidade} ·{" "}
                  <span
                    className={
                      imovel.origem === "manual"
                        ? "text-emerald-700 dark:text-emerald-400"
                        : ""
                    }
                  >
                    {imovel.origem === "manual" ? "manual" : "Chaves na Mão"}
                  </span>
                </p>
              </div>
            </div>
            {imovel.origem === "manual" && (
              <div className="flex shrink-0 gap-2">
                <button
                  className="text-sm hover:underline"
                  onClick={() => setEditando(imovel)}
                  type="button"
                >
                  Editar
                </button>
                <button
                  className="text-red-600 text-sm hover:underline"
                  onClick={() => excluir(imovel.id)}
                  type="button"
                >
                  Excluir
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export function Admin() {
  const [token, setToken] = useState(() => localStorage.getItem(TOKEN_KEY));

  function entrar(novoToken: string) {
    localStorage.setItem(TOKEN_KEY, novoToken);
    setToken(novoToken);
  }

  function sair() {
    localStorage.removeItem(TOKEN_KEY);
    setToken(null);
  }

  if (!token) return <LoginForm onEntrar={entrar} />;
  return <Painel onSair={sair} token={token} />;
}
