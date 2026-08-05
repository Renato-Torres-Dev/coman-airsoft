"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "@/utils/supabase";

// Isso ajuda o código a entender a estrutura do nosso produto
type Produto = {
  id: string;
  titulo: string;
  descricao: string;
  preco: number;
  imagem_url: string;
};

export default function Mercado() {
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    const fetchProdutos = async () => {
      // Busca todos os itens da tabela mercado, ordenando do mais novo pro mais velho
      const { data, error } = await supabase
        .from("mercado")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Erro ao buscar produtos:", error);
      } else {
        setProdutos(data || []);
      }
      setLoading(false);
    };

    fetchProdutos();
  }, [supabase]);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 min-h-screen">
      {/* CABEÇALHO DO MERCADO */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 border-b border-green-700/50 pb-4 gap-4">
        <div>
          <h1 className="text-3xl font-bold uppercase tracking-wider text-white">
            Mercado <span className="text-green-500">COMAN</span>
          </h1>
          <p className="text-slate-400 mt-1">Compra e venda de equipamentos entre operadores.</p>
        </div>
        <Link 
          href="/mercado/novo" 
          className="bg-green-700 hover:bg-green-600 px-6 py-2 rounded font-bold text-white transition-colors text-sm uppercase"
        >
          + Anunciar Item
        </Link>
      </div>

      {/* ÁREA DOS PRODUTOS */}
      {loading ? (
        <div className="text-center text-slate-400 py-12 animate-pulse">Carregando arsenal...</div>
      ) : produtos.length === 0 ? (
        <div className="text-center text-slate-400 py-12 bg-slate-950 rounded-lg border border-slate-800">
          Nenhum equipamento à venda no momento. Seja o primeiro a anunciar!
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {produtos.map((produto) => (
            <div key={produto.id} className="bg-slate-950 border border-slate-800 rounded-lg overflow-hidden hover:border-green-500/50 transition-colors group flex flex-col">
              
              {/* Imagem do Produto */}
              <div className="h-48 bg-slate-900 relative overflow-hidden flex items-center justify-center">
                <img 
                  src={produto.imagem_url} 
                  alt={produto.titulo}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
              </div>
              
              {/* Informações do Produto */}
              <div className="p-4 flex flex-col flex-grow">
                <h3 className="font-bold text-lg text-white mb-1 line-clamp-1" title={produto.titulo}>
                  {produto.titulo}
                </h3>
                <p className="text-green-500 font-bold text-xl mb-2">
                  R$ {produto.preco.toFixed(2).replace('.', ',')}
                </p>
                <p className="text-slate-400 text-sm line-clamp-2 mb-4 flex-grow" title={produto.descricao}>
                  {produto.descricao}
                </p>
                
                <Link 
                    href={`/mercado/${produto.id}`}
                    className="w-full bg-slate-800 hover:bg-slate-700 text-center text-white font-semibold py-2 rounded transition-colors mt-auto text-sm uppercase tracking-wider block"
                >
                    Ver Detalhes
                </Link>
              </div>

            </div>
          ))}
        </div>
      )}
    </div>
  );
}