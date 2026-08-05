"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase";

export default function LoginPage() {
  // Controle de qual tela mostrar
  const [isLogin, setIsLogin] = useState(true);

  // Estados dos campos
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [nome, setNome] = useState("");
  const [sobrenome, setSobrenome] = useState("");
  const [cpf, setCpf] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  // Função para aplicar Máscara no CPF
  const handleCpfChange = (valor: string) => {
    let v = valor.replace(/\D/g, ""); // Tira tudo que não é número
    if (v.length > 11) v = v.slice(0, 11); // Limita a 11 dígitos
    
    // Adiciona a máscara XXX.XXX.XXX-XX
    v = v.replace(/(\d{3})(\d)/, "$1.$2");
    v = v.replace(/(\d{3})(\d)/, "$1.$2");
    v = v.replace(/(\d{3})(\d{1,2})$/, "$1-$2");
    
    setCpf(v);
  };

  // Função para Entrar
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      setError("Erro ao entrar: E-mail ou senha incorretos.");
    } else {
      router.push("/conta"); // Redireciona direto pro painel do usuário
      router.refresh();
    }
    setLoading(false);
  };

  // Função para Cadastrar novo usuário com os Metadados
  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validação básica de CPF
    if (cpf.replace(/\D/g, "").length !== 11) {
      setError("Por favor, digite um CPF válido com 11 números.");
      return;
    }

    setLoading(true);
    setError(null);

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          nome,
          sobrenome,
          cpf: cpf.replace(/\D/g, ""), // Salva só os números no banco
          whatsapp,
          avatar_url: "" // Deixamos vazio para ele preencher depois na Minha Conta
        }
      }
    });

    if (error) {
      setError("Erro ao cadastrar: " + error.message);
    } else {
      alert("Cadastro realizado com sucesso! Bem-vindo ao COMAN.");
      router.push("/conta");
      router.refresh();
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-900 px-4 py-12">
      <div className="max-w-md w-full bg-slate-950 border border-green-700/50 p-8 rounded-lg shadow-2xl">
        
        {/* Botões de Alternância */}
        <div className="flex mb-8 border-b border-slate-800">
          <button 
            onClick={() => { setIsLogin(true); setError(null); }}
            className={`flex-1 py-3 text-sm font-bold uppercase transition-colors ${isLogin ? 'text-green-500 border-b-2 border-green-500' : 'text-slate-500 hover:text-slate-300'}`}
          >
            Acessar Conta
          </button>
          <button 
            onClick={() => { setIsLogin(false); setError(null); }}
            className={`flex-1 py-3 text-sm font-bold uppercase transition-colors ${!isLogin ? 'text-green-500 border-b-2 border-green-500' : 'text-slate-500 hover:text-slate-300'}`}
          >
            Criar Cadastro
          </button>
        </div>

        <form onSubmit={isLogin ? handleLogin : handleSignUp} className="space-y-5">
          
          {/* CAMPOS EXCLUSIVOS DE CADASTRO */}
          {!isLogin && (
            <>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">Nome</label>
                  <input type="text" required value={nome} onChange={(e) => setNome(e.target.value)} className="w-full bg-slate-900 border border-slate-700 rounded px-3 py-2 text-white focus:outline-none focus:border-green-500" placeholder="Seu nome" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">Sobrenome</label>
                  <input type="text" required value={sobrenome} onChange={(e) => setSobrenome(e.target.value)} className="w-full bg-slate-900 border border-slate-700 rounded px-3 py-2 text-white focus:outline-none focus:border-green-500" placeholder="Seu sobrenome" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">CPF</label>
                  <input type="text" required value={cpf} onChange={(e) => handleCpfChange(e.target.value)} className="w-full bg-slate-900 border border-slate-700 rounded px-3 py-2 text-white focus:outline-none focus:border-green-500" placeholder="000.000.000-00" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">WhatsApp</label>
                  <input type="text" required maxLength={11} value={whatsapp} onChange={(e) => setWhatsapp(e.target.value.replace(/\D/g, ""))} className="w-full bg-slate-900 border border-slate-700 rounded px-3 py-2 text-white focus:outline-none focus:border-green-500" placeholder="DDD + Número" />
                </div>
              </div>
            </>
          )}

          {/* CAMPOS PADRÃO (LOGIN E CADASTRO) */}
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">E-mail</label>
            <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="w-full bg-slate-900 border border-slate-700 rounded px-3 py-2 text-white focus:outline-none focus:border-green-500" placeholder="operador@exemplo.com" />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">Senha</label>
            <input type="password" required minLength={6} value={password} onChange={(e) => setPassword(e.target.value)} className="w-full bg-slate-900 border border-slate-700 rounded px-3 py-2 text-white focus:outline-none focus:border-green-500" placeholder="••••••••" />
          </div>

          {error && <div className="text-red-500 text-sm font-semibold">{error}</div>}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-green-700 hover:bg-green-600 text-white font-bold py-3 rounded transition-colors disabled:opacity-50 mt-2 uppercase tracking-wide text-sm"
          >
            {loading ? "Aguarde..." : (isLogin ? "Acessar QG" : "Concluir Alistamento")}
          </button>
        </form>
      </div>
    </div>
  );
}