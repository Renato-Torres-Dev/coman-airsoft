"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase";
import Link from "next/link";

export default function NovoVideo() {
  const [titulo, setTitulo] = useState("");
  const [urlVideo, setUrlVideo] = useState("");
  const [loading, setLoading] = useState(false);
  
  const router = useRouter();
  const supabase = createClient();

  const handleCadastro = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        alert("Você precisa estar logado para enviar um vídeo.");
        return;
      }

      const { error } = await supabase.from("videos_comunidade").insert({
        titulo,
        url_video: urlVideo,
        user_id: session.user.id
      });

      if (error) throw error;

      alert("Vídeo publicado com sucesso!");
      router.push("/videos");

    } catch (error: any) {
      alert("Erro ao publicar vídeo: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 min-h-screen">
      <Link href="/videos" className="text-slate-400 hover:text-green-500 mb-6 inline-block transition-colors font-medium">
        &larr; Voltar para Galeria
      </Link>

      <div className="bg-slate-950 border border-slate-800 p-8 rounded-lg shadow-xl">
        <h1 className="text-2xl font-bold uppercase text-white mb-6 border-b border-slate-800 pb-4">
          Enviar <span className="text-green-500">Vídeo</span>
        </h1>

        <form onSubmit={handleCadastro} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-slate-400 mb-1">Título do Vídeo *</label>
            <input 
              type="text" 
              required 
              value={titulo} 
              onChange={e => setTitulo(e.target.value)} 
              placeholder="Ex: Operação Blackout - Sniper Gameplay"
              className="w-full bg-slate-900 border border-slate-700 rounded px-4 py-3 text-white focus:outline-none focus:border-green-500" 
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-400 mb-1">Link do YouTube *</label>
            <input 
              type="url" 
              required
              value={urlVideo} 
              onChange={e => setUrlVideo(e.target.value)} 
              placeholder="https://www.youtube.com/watch?v=..." 
              className="w-full bg-slate-900 border border-slate-700 rounded px-4 py-3 text-white focus:outline-none focus:border-green-500" 
            />
            <p className="text-xs text-slate-500 mt-2">Cole o link completo do seu vídeo do YouTube.</p>
          </div>

          <button 
            type="submit" 
            disabled={loading} 
            className="w-full bg-green-700 hover:bg-green-600 text-white font-bold py-3 rounded mt-6 transition-colors uppercase tracking-wider"
          >
            {loading ? "Processando..." : "Publicar Vídeo"}
          </button>
        </form>
      </div>
    </div>
  );
}