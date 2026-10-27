import { Loader2 } from "lucide-react";
import { useState } from "react";
import logo from "@/assets/logo/logo-alves-costa.png";
import { login } from "@/lib/api";
import { cn, mensagemDe } from "@/lib/utils";
import { botaoPrimario, inputCls } from "./ui";

export function Login({ onEntrar }: { onEntrar: () => void }) {
  const [senha, setSenha] = useState("");
  const [erro, setErro] = useState("");
  const [enviando, setEnviando] = useState(false);

  async function entrar(e: React.FormEvent) {
    e.preventDefault();
    setEnviando(true);
    setErro("");
    try {
      await login(senha);
      onEntrar();
    } catch (err) {
      setErro(mensagemDe(err, "erro ao entrar"));
    } finally {
      setEnviando(false);
    }
  }

  return (
    <main className="grid min-h-screen bg-papel lg:grid-cols-2">
      <div className="hidden items-center justify-center bg-fundo-marca p-12 lg:flex">
        <img alt="Alves Costa, a chave da felicidade é sonhar" className="w-full max-w-lg" src={logo} />
      </div>

      <div className="flex items-center justify-center px-6 py-12">
        <form className="w-full max-w-xs" onSubmit={entrar}>
          <img alt="Alves Costa" className="mb-12 h-20 w-auto rounded-lg bg-fundo-marca p-2 lg:hidden" src={logo} />
          <h1 className="font-semibold text-tinta text-xl">Painel do corretor</h1>
          <p className="mt-1 mb-8 text-apagado text-sm">
            Entre com sua senha para cuidar dos imóveis do site.
          </p>

          <label className="mb-1.5 block font-medium text-apagado text-xs" htmlFor="senha">
            Senha
          </label>
          <input
            autoFocus
            className={inputCls}
            id="senha"
            onChange={(e) => setSenha(e.target.value)}
            type="password"
            value={senha}
          />
          {erro && (
            <p className="mt-2 text-red-700 text-sm" role="alert">
              {erro}
            </p>
          )}

          <button
            className={cn(botaoPrimario, "mt-6 w-full py-2.5")}
            disabled={enviando || !senha}
            type="submit"
          >
            {enviando && <Loader2 className="h-4 w-4 animate-spin" />}
            Entrar
          </button>
          <a className="mt-8 inline-block text-apagado text-sm hover:text-tinta" href="/">
            ← Voltar para o site
          </a>
        </form>
      </div>
    </main>
  );
}
