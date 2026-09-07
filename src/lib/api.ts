export type Imovel = {
  id: string;
  titulo: string;
  preco: number;
  url: string;
  imagem: string | null;
  bairro: string | null;
  cidade: string | null;
  quartos: number | null;
  banheiros: number | null;
  area: string | null;
  origem: "chaves_na_mao" | "manual";
};

export type ImovelInput = Omit<Imovel, "id" | "origem">;

const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:3001";

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: { "Content-Type": "application/json", ...options.headers },
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.erro ?? `Erro ${res.status}`);
  }
  return res.status === 204 ? (undefined as T) : res.json();
}

function authHeaders(token: string) {
  return { Authorization: `Bearer ${token}` };
}

export const listarImoveis = () => request<Imovel[]>("/imoveis");

export const login = (senha: string) =>
  request<{ token: string }>("/auth/login", {
    method: "POST",
    body: JSON.stringify({ senha }),
  });

export const criarImovel = (token: string, dados: ImovelInput) =>
  request<Imovel>("/imoveis", {
    method: "POST",
    headers: authHeaders(token),
    body: JSON.stringify(dados),
  });

export const atualizarImovel = (
  token: string,
  id: string,
  dados: ImovelInput
) =>
  request<Imovel>(`/imoveis/${id}`, {
    method: "PUT",
    headers: authHeaders(token),
    body: JSON.stringify(dados),
  });

export const removerImovel = (token: string, id: string) =>
  request<void>(`/imoveis/${id}`, {
    method: "DELETE",
    headers: authHeaders(token),
  });

export const sincronizarChavesNaMao = (token: string) =>
  request<{ ok: true; total: number }>("/sync/chaves-na-mao", {
    method: "POST",
    headers: authHeaders(token),
  });

export async function enviarImagem(token: string, arquivo: File) {
  const form = new FormData();
  form.append("imagem", arquivo);
  const res = await fetch(`${API_URL}/upload`, {
    method: "POST",
    headers: authHeaders(token),
    body: form,
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.erro ?? `Erro ${res.status}`);
  }
  return (await res.json()) as { url: string };
}
