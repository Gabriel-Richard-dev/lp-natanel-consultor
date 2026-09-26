import { Building2, ExternalLink, LayoutDashboard, Loader2, LogOut, Plus } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import logo from "@/assets/logo/logo-natanael.png";
import { type Imovel, listarImoveis, logout, restaurarSessao } from "@/lib/api";
import { cn, mensagemDe } from "@/lib/utils";
import { ListaImoveis } from "./imoveis";
import { PaginaImovel } from "./imovel-form";
import { Login } from "./login";
import type { Painel } from "./ui";
import { VisaoGeral } from "./visao-geral";

// Rotas: /admin, /admin/imoveis, /admin/imoveis/<id>, /admin/novo
const NAV = [
  { href: "/admin", secao: "", label: "Visão geral", curto: "Início", icone: LayoutDashboard },
  { href: "/admin/imoveis", secao: "imoveis", label: "Imóveis", curto: "Imóveis", icone: Building2 },
  { href: "/admin/novo", secao: "novo", label: "Cadastrar imóvel", curto: "Cadastrar", icone: Plus },
];

function Layout({ rota, onSair }: { rota: string; onSair: () => void }) {
  const [imoveis, setImoveis] = useState<Imovel[] | null>(null);
  const [aviso, setAviso] = useState<{ texto: string; erro: boolean } | null>(null);
  const [, , secao = "", id] = rota.split("/");

  const avisar = useCallback((texto: string, erro = false) => setAviso({ texto, erro }), []);

  const recarregar = useCallback(async () => {
    try {
      setImoveis(await listarImoveis());
    } catch (err) {
      setImoveis((atual) => atual ?? []);
      avisar(mensagemDe(err, "não foi possível carregar os imóveis"), true);
    }
  }, [avisar]);

  useEffect(() => {
    listarImoveis()
      .then(setImoveis)
      .catch((err) => {
        setImoveis([]);
        avisar(mensagemDe(err, "não foi possível carregar os imóveis"), true);
      });
  }, [avisar]);

  useEffect(() => {
    if (!aviso) return;
    const t = setTimeout(() => setAviso(null), 4000);
    return () => clearTimeout(t);
  }, [aviso]);

  const painel: Painel = { imoveis, recarregar, avisar };
  const pagina =
    secao === "imoveis" && id ? (
      <PaginaImovel id={id} painel={painel} />
    ) : secao === "imoveis" ? (
      <ListaImoveis painel={painel} />
    ) : secao === "novo" ? (
      <PaginaImovel painel={painel} />
    ) : (
      <VisaoGeral painel={painel} />
    );

  return (
    <div className="min-h-screen bg-papel text-tinta md:pl-60">
      <aside className="fixed inset-y-0 left-0 hidden w-60 flex-col bg-[#0b1210] py-6 md:flex">
        <a className="mb-10 px-6" href="/admin">
          <img alt="Natanael Machado" className="h-14 w-auto" src={logo} />
        </a>
        <nav>
          {NAV.map((item) => {
            const ativo = item.secao === secao;
            return (
              <a
                aria-current={ativo ? "page" : undefined}
                className={cn(
                  "flex items-center gap-3 border-l-2 px-6 py-2.5 text-sm transition",
                  ativo
                    ? "border-ouro bg-white/[0.04] font-medium text-white"
                    : "border-transparent text-white/55 hover:text-white"
                )}
                href={item.href}
                key={item.href}
              >
                <item.icone className="h-4 w-4" /> {item.label}
              </a>
            );
          })}
        </nav>
        <div className="mt-auto border-white/10 border-t px-3 pt-4">
          <a
            className="flex items-center gap-3 rounded-md px-3 py-2 text-sm text-white/55 transition hover:text-white"
            href="/"
          >
            <ExternalLink className="h-4 w-4" /> Ver o site
          </a>
          <button
            className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm text-white/55 transition hover:text-white"
            onClick={onSair}
            type="button"
          >
            <LogOut className="h-4 w-4" /> Sair
          </button>
        </div>
      </aside>

      <header className="sticky top-0 z-20 flex items-center justify-between bg-[#0b1210] px-4 py-2.5 md:hidden">
        <img alt="Natanael Machado" className="h-9 w-auto" src={logo} />
        <div className="flex items-center">
          <a aria-label="Ver o site" className="p-2 text-white/60 hover:text-white" href="/">
            <ExternalLink className="h-5 w-5" />
          </a>
          <button aria-label="Sair" className="p-2 text-white/60 hover:text-white" onClick={onSair} type="button">
            <LogOut className="h-5 w-5" />
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 pt-6 pb-28 md:px-10 md:py-10">{pagina}</main>

      <nav className="fixed inset-x-0 bottom-0 z-20 grid grid-cols-3 border-linha border-t bg-white pb-[env(safe-area-inset-bottom)] md:hidden">
        {NAV.map((item) => {
          const ativo = item.secao === secao;
          return (
            <a
              aria-current={ativo ? "page" : undefined}
              className={cn(
                "flex flex-col items-center gap-1 border-t-2 py-2 text-[11px]",
                ativo ? "border-ouro font-medium text-tinta" : "border-transparent text-apagado"
              )}
              href={item.href}
              key={item.href}
            >
              <item.icone className="h-5 w-5" /> {item.curto}
            </a>
          );
        })}
      </nav>

      {aviso && (
        <div
          className={cn(
            "fixed right-4 bottom-20 left-4 z-50 rounded-md px-4 py-3 text-sm text-white shadow-lg sm:left-auto md:bottom-6",
            aviso.erro ? "bg-red-700" : "bg-tinta"
          )}
          role="status"
        >
          {aviso.texto}
        </div>
      )}
    </div>
  );
}

export function Admin({ rota }: { rota: string }) {
  const [estado, setEstado] = useState<"carregando" | "dentro" | "fora">("carregando");

  // Ao abrir: o cookie de refresh (se houver) devolve um access token novo.
  useEffect(() => {
    restaurarSessao().then((ok) => setEstado(ok ? "dentro" : "fora"));
  }, []);

  async function sair() {
    await logout();
    setEstado("fora");
  }

  if (estado === "carregando") {
    return (
      <main className="flex min-h-screen items-center justify-center bg-papel">
        <Loader2 className="h-6 w-6 animate-spin text-apagado" />
      </main>
    );
  }
  if (estado === "fora") return <Login onEntrar={() => setEstado("dentro")} />;
  return <Layout onSair={sair} rota={rota} />;
}
