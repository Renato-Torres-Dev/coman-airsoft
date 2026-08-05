"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase";
import Link from "next/link";

type Produto = {
  id: string;
  titulo: string;
  descricao: string;
  preco: number;
  imagem_url: string;
  user_id: string;
  whatsapp: string;
};

export default function DetalhesProduto() {
  const params = useParams(); // Pega o ID da URL
  const router = useRouter();
  const [produto, setProduto] = useState<Produto | null>(null);
  const [loading, setLoading] = useState(true);
  
  const supabase = createClient();

  useEffect(() => {
    const fetchProduto = async () => {
      // Busca apenas o item que tem o ID igual ao da URL
      const { data, error } = await supabase
        .from("mercado")
        .select("*")
        .eq("id", params.id)
        .single(); // Garante que vai retornar só 1 item, não uma lista

      if (error) {
        console.error("Erro ao buscar detalhes:", error);
        router.push("/mercado"); // Se der erro ou não achar, chuta de volta pro mercado
      } else {
        setProduto(data);
      }
      setLoading(false);
    };

    if (params.id) {
      fetchProduto();
    }
  }, [params.id, router, supabase]);

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center text-green-500 animate-pulse">Carregando informações...</div>;
  }

  if (!produto) return null;

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 min-h-screen">
      
      {/* Botão de Voltar */}
      <Link href="/mercado" className="text-slate-400 hover:text-green-500 mb-6 inline-block transition-colors">
        &larr; Voltar para o Mercado
      </Link>

      <div className="bg-slate-950 border border-slate-800 rounded-lg overflow-hidden flex flex-col md:flex-row gap-8 p-6">
        
        {/* Lado da Imagem */}
        <div className="w-full md:w-1/2 flex items-center justify-center bg-slate-900 rounded-lg overflow-hidden border border-slate-800">
          <img 
            src={produto.imagem_url} 
            alt={produto.titulo}
            className="w-full object-cover max-h-[500px]"
          />
        </div>

        {/* Lado das Informações */}
        <div className="w-full md:w-1/2 flex flex-col justify-center">
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-2 uppercase tracking-wider">
            {produto.titulo}
          </h1>
          
          <div className="text-4xl font-black text-green-500 mb-6">
            R$ {produto.preco.toFixed(2).replace('.', ',')}
          </div>
          
          <div className="bg-slate-900 p-4 rounded-lg border border-slate-800 mb-8">
            <h3 className="text-slate-300 font-semibold mb-2 uppercase text-sm border-b border-slate-700 pb-2">
              Detalhes do Equipamento
            </h3>
            <p className="text-slate-400 whitespace-pre-wrap leading-relaxed">
              {produto.descricao}
            </p>
          </div>

          {/* Botão de Contato */}
          <a 
            href={`https://wa.me/${produto.whatsapp.replace(/\D/g, '')}?text=Olá! Vi seu anúncio "${produto.titulo}" no portal COMAN e tenho interesse.`}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full bg-green-700 hover:bg-green-600 text-white font-bold py-4 px-6 rounded-lg transition-colors text-lg uppercase tracking-widest shadow-lg flex items-center justify-center gap-2"
          >
            Falar com Vendedor
          </a>
          <p className="text-center text-slate-500 text-xs mt-3">
            Negocie diretamente com o proprietário. O COMAN não cobra taxas.
          </p>
        </div>

      </div>
    </div>
  );
}