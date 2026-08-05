"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase";
import Link from "next/link";

export default function NovaOperacao() {
  const [titulo, setTitulo] = useState("");
  const [dataOperacao, setDataOperacao] = useState("");
  const [local, setLocal] = useState("");
  const [linkInscricao, setLinkInscricao] = useState("");
  const [imagem, setImagem] = useState<File | null>(null);
  
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  const handleCadastro = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        alert("Você precisa estar logado para cadastrar operações.");
        return;
      }

      let imagemUrl = "";

      // Se o usuário selecionou uma imagem, fazemos o upload
      if (imagem) {
        const fileExt = imagem.name.split('.').pop();
        const filePath = `${Date.now()}-${Math.random()}.${fileExt}`;
        
        const { error: uploadError } = await supabase.storage
          .from('operacoes')
          .upload(filePath, imagem);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from('operacoes')
          .getPublicUrl(filePath);
          
        imagemUrl = publicUrl;
      }

      // Salva a operação no banco de dados
      const { error } = await supabase.from("operacoes").insert({
        titulo,
        data_operacao: dataOperacao,
        local,
        link_inscricao: linkInscricao,
        imagem_url: imagemUrl,
        user_id: session.user.id
      });

      if (error) throw error;

      alert("Operação cadastrada com sucesso!");
      router.push("/operacoes");

    } catch (error: any) {
      alert("Erro ao cadastrar: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 min-h-screen">
      <Link href="/operacoes" className="text-slate-400 hover:text-green-500 mb-6 inline-block transition-colors font-medium">
        &larr; Voltar para o Calendário
      </Link>

      <div className="bg-slate-950 border border-slate-800 p-8 rounded-lg shadow-xl">
        <h1 className="text-2xl font-bold uppercase text-white mb-6 border-b border-slate-800 pb-4">
          Cadastrar <span className="text-green-500">Operação</span>
        </h1>

        <form onSubmit={handleCadastro} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-slate-400 mb-1">Nome da Operação *</label>
            <input type="text" required value={titulo} onChange={e => setTitulo(e.target.value)} className="w-full bg-slate-900 border border-slate-700 rounded px-4 py-2 text-white focus:outline-none focus:border-green-500" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-1">Data *</label>
              <input type="date" required value={dataOperacao} onChange={e => setDataOperacao(e.target.value)} className="w-full bg-slate-900 border border-slate-700 rounded px-4 py-2 text-white focus:outline-none focus:border-green-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-1">Local (Campo/Cidade) *</label>
              <input type="text" required value={local} onChange={e => setLocal(e.target.value)} className="w-full bg-slate-900 border border-slate-700 rounded px-4 py-2 text-white focus:outline-none focus:border-green-500" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-400 mb-1">Link de Inscrição / Mais Informações</label>
            <input type="url" value={linkInscricao} onChange={e => setLinkInscricao(e.target.value)} placeholder="https://..." className="w-full bg-slate-900 border border-slate-700 rounded px-4 py-2 text-white focus:outline-none focus:border-green-500" />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-400 mb-1">Pôster / Imagem da Operação</label>
            <input type="file" accept="image/*" onChange={e => setImagem(e.target.files?.[0] || null)} className="w-full bg-slate-900 border border-slate-700 rounded px-4 py-2 text-slate-300 focus:outline-none focus:border-green-500" />
          </div>

          <button type="submit" disabled={loading} className="w-full bg-green-700 hover:bg-green-600 text-white font-bold py-3 rounded mt-6 transition-colors uppercase tracking-wider">
            {loading ? "Processando..." : "Confirmar Cadastro"}
          </button>
        </form>
      </div>
    </div>
  );
}