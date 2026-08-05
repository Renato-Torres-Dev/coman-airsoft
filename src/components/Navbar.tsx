"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase";

export default function Navbar() {
  const [user, setUser] = useState<any>(null);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    // Busca a sessão do usuário assim que o menu carrega
    const getUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user || null);
    };
    
    getUser();

    // Fica "escutando" se o usuário logou ou deslogou em outra aba/página
    const { data: authListener } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setUser(session?.user || null);
      }
    );

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, [supabase.auth]);

  // Função para deslogar
  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  };

  return (
    <nav className="bg-slate-950 border-b border-green-700/50 p-4 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        {/* LOGO */}
        <Link href="/" className="text-2xl font-bold tracking-tighter text-white">
          COMAN <span className="text-green-600 text-sm">NORDESTE</span>
        </Link>
        
        {/* LINKS PRINCIPAIS */}
        <ul className="hidden md:flex gap-6 font-semibold uppercase text-sm">
          <Link href="/" className="hover:text-green-500 cursor-pointer transition-colors">Início</Link>
          <Link href="/mercado" className="hover:text-green-500 cursor-pointer transition-colors">Mercado</Link>
          <Link href="/noticias" className="text-slate-300 hover:text-green-500 font-semibold transition-colors">Notícias</Link>
          <Link href="/operacoes" className="text-slate-300 hover:text-green-500 font-semibold transition-colors">Operações</Link>
          <Link href="/videos" className="text-slate-300 hover:text-green-500 font-semibold transition-colors">Vídeos</Link>
        </ul>
        
        {/* ÁREA DO USUÁRIO */}
        {user ? (
          <div className="flex items-center gap-4">
            <Link href="/conta" className="text-sm text-green-500 font-bold hover:text-green-400 hidden md:block transition-colors underline-offset-4 hover:underline uppercase">
              Operador(a) {user.user_metadata?.nome || 'Logado'}
            </Link>
            <button 
              onClick={handleLogout}
              className="bg-red-900/80 hover:bg-red-800 border border-red-700 px-4 py-2 rounded font-bold transition-colors text-sm"
            >
              Sair
            </button>
          </div>
        ) : (
          <Link href="/login" className="bg-green-700 hover:bg-green-600 px-4 py-2 rounded font-bold transition-colors text-sm">
            Login / Cadastrar
          </Link>
        )}
      </div>
    </nav>
  );
}