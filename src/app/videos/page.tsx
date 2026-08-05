"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase";
import Link from "next/link";

type Video = {
  id: string;
  titulo: string;
  url_video: string;
  user_id: string;
};

export default function GaleriaVideos() {
  const [videos, setVideos] = useState<Video[]>([]);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  
  // Estado para controlar o Modal
  const [videoAtivo, setVideoAtivo] = useState<{id: string, titulo: string, youtubeId: string} | null>(null);
  
  const supabase = createClient();

  useEffect(() => {
    const fetchVideos = async () => {
      setLoading(true);
      const { data: { session } } = await supabase.auth.getSession();
      setCurrentUser(session?.user || null);

      const { data, error } = await supabase
        .from("videos_comunidade")
        .select("*")
        .order("created_at", { ascending: false });

      if (data) setVideos(data);
      setLoading(false);
    };

    fetchVideos();
  }, [supabase]);

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation(); // Evita que o clique na lixeira abra o vídeo
    if (!confirm("Tem certeza que deseja apagar este vídeo da galeria?")) return;

    try {
      const { error } = await supabase.from('videos_comunidade').delete().eq('id', id);
      if (error) throw error;
      setVideos(videos.filter(v => v.id !== id));
    } catch (error: any) {
      alert("Erro ao excluir: " + error.message);
    }
  };

  const getYouTubeId = (url: string) => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
  };

  // Função para fechar o modal ao clicar fora do vídeo
  const handleCloseModal = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).id === "modal-backdrop") {
      setVideoAtivo(null);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 min-h-screen flex flex-col relative">
      
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 border-b border-green-700/50 pb-4 gap-4">
        <div>
          <h1 className="text-3xl font-bold uppercase tracking-wider text-white">
            COMAN <span className="text-green-500">Play</span>
          </h1>
          <p className="text-slate-400 mt-1">Assista às gameplays e registros táticos da comunidade.</p>
        </div>
        
        <Link href="/videos/novo" className="bg-green-700 hover:bg-green-600 px-6 py-3 rounded text-white font-bold text-sm uppercase tracking-wide transition-colors whitespace-nowrap">
          + Enviar Vídeo
        </Link>
      </div>

      {loading ? (
        <div className="text-center text-slate-400 py-12">Carregando galeria...</div>
      ) : videos.length === 0 ? (
        <div className="text-center text-slate-400 py-12 bg-slate-950 rounded-lg border border-slate-800">
          Nenhum vídeo publicado ainda. Seja o primeiro a compartilhar uma operação!
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {videos.map((video) => {
            const videoId = getYouTubeId(video.url_video);
            // Pegamos a thumbnail em alta qualidade que o próprio YouTube gera automaticamente
            const thumbnailUrl = videoId ? `https://img.youtube.com/vi/${videoId}/hqdefault.jpg` : "";

            return (
              <div 
                key={video.id} 
                className="bg-slate-950 border border-slate-800 rounded-lg overflow-hidden group shadow-xl hover:border-green-500 transition-all flex flex-col cursor-pointer transform hover:-translate-y-1"
                onClick={() => videoId && setVideoAtivo({ id: video.id, titulo: video.titulo, youtubeId: videoId })}
              >
                
                <div className="aspect-video w-full bg-slate-900 relative">
                  {/* Botão de excluir */}
                  {currentUser?.id === video.user_id && (
                    <button 
                      onClick={(e) => handleDelete(e, video.id)}
                      className="absolute top-2 right-2 bg-red-600/90 hover:bg-red-500 text-white p-2 rounded-full z-20 transition-colors opacity-0 group-hover:opacity-100 shadow-lg"
                      title="Excluir Vídeo"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                    </button>
                  )}

                  {/* Imagem de Capa do Vídeo */}
                  {videoId ? (
                    <>
                      <img src={thumbnailUrl} alt={video.titulo} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" />
                      
                      {/* Ícone de Play centralizado */}
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="bg-green-600/80 text-white rounded-full p-4 transform group-hover:scale-110 transition-transform shadow-lg">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 ml-1" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                          </svg>
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className="flex items-center justify-center h-full text-slate-500 text-sm text-center px-4">
                      Formato inválido. Use links do YouTube.
                    </div>
                  )}
                </div>

                <div className="p-4 flex-grow flex items-center bg-slate-900 border-t border-slate-800">
                  <h3 className="font-bold text-white uppercase tracking-wide text-sm line-clamp-2">
                    {video.titulo}
                  </h3>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* MODAL DO VÍDEO (Aparece apenas quando videoAtivo não for nulo) */}
      {videoAtivo && (
        <div 
          id="modal-backdrop"
          onClick={handleCloseModal}
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-sm flex items-center justify-center p-4 md:p-10"
        >
          <div className="w-full max-w-5xl bg-slate-900 rounded-xl overflow-hidden shadow-2xl border border-slate-700 animate-in fade-in zoom-in-95 duration-200">
            
            {/* Cabeçalho do Modal */}
            <div className="flex justify-between items-center p-4 border-b border-slate-800">
              <h3 className="text-white font-bold uppercase tracking-wider truncate mr-4">
                {videoAtivo.titulo}
              </h3>
              <button 
                onClick={() => setVideoAtivo(null)}
                className="text-slate-400 hover:text-red-500 transition-colors p-1"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            {/* Player do YouTube (Toca automaticamente ao abrir) */}
            <div className="aspect-video w-full bg-black">
              <iframe
                width="100%"
                height="100%"
                src={`https://www.youtube.com/embed/${videoAtivo.youtubeId}?autoplay=1`}
                title={videoAtivo.titulo}
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              ></iframe>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}