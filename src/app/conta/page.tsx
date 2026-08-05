"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase";
import Link from "next/link";

type Produto = {
  id: string;
  titulo: string;
  preco: number;
  created_at: string;
};

export default function MinhaConta() {
  const [user, setUser] = useState<any>(null);
  const [meusProdutos, setMeusProdutos] = useState<Produto[]>([]);
  
  // Estados para as ações do usuário
  const [novaSenha, setNovaSenha] = useState("");
  const [senhaLoading, setSenhaLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(true);
  
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    const fetchMeusDados = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        router.push("/login");
        return;
      }
      
      setUser(session.user);

      const { data } = await supabase
        .from("mercado")
        .select("id, titulo, preco, created_at")
        .eq("user_id", session.user.id)
        .order("created_at", { ascending: false });

      if (data) setMeusProdutos(data);
      setLoading(false);
    };

    fetchMeusDados();
  }, [router, supabase]);

  // Função para excluir um anúncio
  const handleExcluir = async (id: string, titulo: string) => {
    if (window.confirm(`Tem certeza que deseja excluir o anúncio "${titulo}"?`)) {
      const { error } = await supabase.from("mercado").delete().eq("id", id);
      if (!error) {
        setMeusProdutos(meusProdutos.filter(item => item.id !== id));
      } else {
        alert("Erro ao excluir: " + error.message);
      }
    }
  };

  // Função para trocar a senha
  const handleTrocarSenha = async (e: React.FormEvent) => {
    e.preventDefault();
    setSenhaLoading(true);
    
    const { error } = await supabase.auth.updateUser({ password: novaSenha });
    
    if (error) {
      alert("Erro ao trocar senha: " + error.message);
    } else {
      alert("Senha atualizada com sucesso!");
      setNovaSenha("");
    }
    setSenhaLoading(false);
  };

  // Função para enviar Foto de Perfil
  const uploadAvatar = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setUploading(true);
      
      if (!event.target.files || event.target.files.length === 0) {
        throw new Error("Você precisa selecionar uma imagem.");
      }

      const file = event.target.files[0];
      const fileExt = file.name.split('.').pop();
      const filePath = `${user.id}-${Math.random()}.${fileExt}`;

      // 1. Envia a imagem pro Storage
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // 2. Pega a URL pública da imagem
      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      // 3. Atualiza os metadados do usuário com a nova URL
      const { error: updateError } = await supabase.auth.updateUser({
        data: { avatar_url: publicUrl }
      });

      if (updateError) throw updateError;
      
      // Atualiza o estado local para a foto aparecer na hora
      setUser({ ...user, user_metadata: { ...user.user_metadata, avatar_url: publicUrl } });
      alert("Foto de perfil atualizada!");

    } catch (error: any) {
      alert("Erro ao enviar foto: " + error.message);
    } finally {
      setUploading(false);
    }
  };

  if (loading) return <div className="min-h-screen flex justify-center items-center text-green-500">Carregando QG...</div>;
  if (!user) return null;

  const { nome, sobrenome, avatar_url } = user.user_metadata || {};

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 min-h-screen space-y-8">
      
      {/* CABEÇALHO DO PAINEL */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-green-700/50 pb-6 gap-4">
        <div>
          <h1 className="text-3xl font-bold uppercase tracking-wider text-white">
            QG <span className="text-green-500">Operacional</span>
          </h1>
          <p className="text-slate-400 mt-1">Gerencie seu perfil e seu arsenal à venda.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        
        {/* COLUNA ESQUERDA: PERFIL E SENHA */}
        <div className="space-y-8">
          
          {/* Cartão de Perfil */}
          <div className="bg-slate-950 border border-slate-800 p-6 rounded-lg text-center shadow-lg">
            <div className="relative w-32 h-32 mx-auto mb-4">
              <img 
                src={avatar_url || "https://i.pravatar.cc/150?u=" + user.id} 
                alt="Foto do Operador" 
                className="w-full h-full rounded-full object-cover border-2 border-green-500 shadow-lg"
              />
              <label className="absolute bottom-0 right-0 bg-green-700 hover:bg-green-600 text-white p-2 rounded-full cursor-pointer transition-colors" title="Trocar foto">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <input 
                  type="file" 
                  accept="image/*" 
                  className="hidden" 
                  onChange={uploadAvatar} 
                  disabled={uploading}
                />
              </label>
            </div>
            
            <h2 className="text-xl font-bold text-white uppercase">{nome} {sobrenome}</h2>
            <p className="text-sm text-slate-400">{user.email}</p>
            {uploading && <p className="text-xs text-green-500 mt-2">Enviando foto...</p>}
          </div>

          {/* Cartão de Alterar Senha */}
          <div className="bg-slate-950 border border-slate-800 p-6 rounded-lg shadow-lg">
            <h3 className="text-lg font-bold text-slate-200 mb-4 uppercase border-b border-slate-800 pb-2">Segurança</h3>
            <form onSubmit={handleTrocarSenha} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Nova Senha</label>
                <input 
                  type="password" 
                  required 
                  minLength={6}
                  value={novaSenha}
                  onChange={(e) => setNovaSenha(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded px-3 py-2 text-white focus:outline-none focus:border-green-500" 
                  placeholder="Mínimo 6 caracteres" 
                />
              </div>
              <button
                type="submit"
                disabled={senhaLoading || !novaSenha}
                className="w-full bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white font-bold py-2 rounded transition-colors disabled:opacity-50 text-sm uppercase"
              >
                {senhaLoading ? "Atualizando..." : "Atualizar Senha"}
              </button>
            </form>
          </div>
        </div>

        {/* COLUNA DIREITA: MEUS ANÚNCIOS */}
        <div className="md:col-span-2">
          <div className="bg-slate-950 border border-slate-800 p-6 rounded-lg shadow-lg h-full">
            <div className="flex justify-between items-center mb-6 border-b border-slate-800 pb-2">
              <h3 className="text-lg font-bold text-slate-200 uppercase">Meu Arsenal à Venda</h3>
              <Link href="/mercado/novo" className="bg-green-700 hover:bg-green-600 px-4 py-2 rounded text-white font-bold text-xs uppercase tracking-wide transition-colors">
                + Novo Anúncio
              </Link>
            </div>

            {meusProdutos.length === 0 ? (
              <div className="text-center py-12 text-slate-500">
                Você não possui itens anunciados no momento.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse min-w-full">
                  <thead>
                    <tr className="border-b border-slate-800 text-slate-400 text-xs uppercase tracking-wider">
                      <th className="p-3 font-semibold">Equipamento</th>
                      <th className="p-3 font-semibold">Preço</th>
                      <th className="p-3 font-semibold text-right">Ação</th>
                    </tr>
                  </thead>
                  <tbody>
                    {meusProdutos.map((item) => (
                      <tr key={item.id} className="border-b border-slate-800/50 hover:bg-slate-900/50 transition-colors">
                        <td className="p-3 text-white font-medium">{item.titulo}</td>
                        <td className="p-3 text-green-500 font-semibold">R$ {item.preco.toFixed(2).replace('.', ',')}</td>
                        <td className="p-3 text-right">
                          <button 
                            onClick={() => handleExcluir(item.id, item.titulo)}
                            className="text-red-500 hover:text-red-400 font-bold text-xs uppercase tracking-wide border border-red-500/30 hover:border-red-400 px-3 py-1 rounded transition-colors"
                          >
                            Excluir
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}