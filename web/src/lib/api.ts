export type Imovel = {
  id: string;
  titulo: string;
  // empreendimentos do portal não trazem preço: null = "consulte valores"
  preco: number | null;
  url: string | null;
  imagem: string | null;
  bairro: string | null;
  cidade: string | null;
  quartos: number | null;
  banheiros: number | null;
  area: string | null;
  construtora: string | null;
  fase: string | null;
  entrega: string | null;
  origem: "habitnet" | "manual";
  atualizado_em: string;
};

// preço fica null enquanto o campo do formulário está vazio
export type ImovelInput = Omit<
  Imovel,
  "id" | "origem" | "atualizado_em" | "preco" | "construtora" | "fase" | "entrega"
> & {
  preco: number | null;
};

export type Lead = {
  id: string;
  nome: string;
  telefone: string;
  interesse: string | null;
  orcamento: string | null;
  cidade: string | null;
  imovel: string | null;
  mensagem: string | null;
  origem: string | null;
  atendido: boolean;
  criado_em: string;
};

export type LeadInput = Pick<Lead, "nome" | "telefone"> &
  Partial<Pick<Lead, "interesse" | "orcamento" | "cidade" | "imovel" | "mensagem" | "origem">> & {
    consentimento: boolean;
    site?: string;
  };

const API_URL = import.meta.env.VITE_API_URL ?? "/api";

// Access token curto: fica só na memória (nunca no localStorage, imune a XSS).
// O refresh token vive num cookie httpOnly que o navegador manda sozinho.
let accessToken: string | null = null;

async function renovar(): Promise<boolean> {
  try {
    const res = await fetch(`${API_URL}/auth/refresh`, {
      method: "POST",
      credentials: "include",
    });
    if (!res.ok) return false;
    accessToken = (await res.json()).token;
    return true;
  } catch {
    return false;
  }
}

async function request<T>(
  path: string,
  options: RequestInit = {},
  jaRenovou = false
): Promise<T> {
  const json = typeof options.body === "string";
  let res: Response;
  try {
    res = await fetch(`${API_URL}${path}`, {
      ...options,
      credentials: "include",
      headers: {
        ...(json && { "Content-Type": "application/json" }),
        ...(accessToken && { Authorization: `Bearer ${accessToken}` }),
        ...options.headers,
      },
    });
  } catch {
    throw new Error("Sem conexão com o servidor. Tente de novo.");
  }
  // access token venceu no meio do uso: renova pelo cookie e repete uma vez
  if (res.status === 401 && accessToken && !jaRenovou) {
    if (await renovar()) return request(path, options, true);
    accessToken = null;
  }
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.erro ?? `Erro ${res.status}`);
  }
  return res.status === 204 ? (undefined as T) : res.json();
}

export async function login(senha: string): Promise<void> {
  const { token } = await request<{ token: string }>("/auth/login", {
    method: "POST",
    body: JSON.stringify({ senha }),
  });
  accessToken = token;
}

// Ao abrir o painel: tenta um access token novo com o cookie de refresh.
export const restaurarSessao = () => renovar();

export async function logout(): Promise<void> {
  try {
    await fetch(`${API_URL}/auth/logout`, { method: "POST", credentials: "include" });
  } catch {
    // rede caiu: descartar o token local já basta para deslogar aqui
  }
  accessToken = null;
}

export const listarImoveis = () => request<Imovel[]>("/imoveis");

export const criarImovel = (dados: ImovelInput) =>
  request<Imovel>("/imoveis", { method: "POST", body: JSON.stringify(dados) });

export const atualizarImovel = (id: string, dados: ImovelInput) =>
  request<Imovel>(`/imoveis/${id}`, { method: "PUT", body: JSON.stringify(dados) });

export const removerImovel = (id: string) =>
  request<void>(`/imoveis/${id}`, { method: "DELETE" });

export const sincronizarHabitnet = () =>
  request<{ ok: true; total: number; falhas: string[] }>("/sync/habitnet", { method: "POST" });

export function enviarImagem(arquivo: File) {
  const form = new FormData();
  form.append("imagem", arquivo);
  return request<{ url: string }>("/upload", { method: "POST", body: form });
}

// público: é o formulário da landing
export const enviarLead = (dados: LeadInput) =>
  request<{ ok: true }>("/leads", { method: "POST", body: JSON.stringify(dados) });

export const listarLeads = () => request<Lead[]>("/leads");

export const marcarLead = (id: string, atendido: boolean) =>
  request<Lead>(`/leads/${id}?atendido=${atendido}`, { method: "PUT" });

export const removerLead = (id: string) => request<void>(`/leads/${id}`, { method: "DELETE" });
