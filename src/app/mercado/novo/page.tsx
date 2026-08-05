"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase";

export default function NovoAnuncio() {
  const [titulo, setTitulo] = useState("");
  const [descricao, setDescricao] = useState("");
  const [preco, setPreco] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [imagemUrl, setImagemUrl] = useState("");
  
  const [userId, setUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  
  const router = useRouter();
  const supabase = createClient();

  // Verifica se o usuário está logado
  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        // Se não tiver logado, manda pro login
        router.push("/login");
      } else {
        setUserId(session.user.id);
      }
    };
    checkUser();
  }, [router, supabase]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // Envia os dados para a tabela 'mercado' no Supabase
    const { error } = await supabase
      .from("mercado")
      .insert([
        {
          titulo,
          descricao,
          preco: parseFloat(preco), // Garante que o preço vá como número
          imagem_url: imagemUrl,
          user_id: userId,
          whatsapp,
        }
      ]);

    if (error) {
      alert("Erro ao postar anúncio: " + error.message);
    } else {
      alert("Operador, seu item foi postado com sucesso!");
      router.push("/mercado"); // Manda o usuário de volta pro mercado geral
    }
    setLoading(false);
  };

  const formatWhatsapp = (value: string) => {
    const numbers = value.replace(/\D/g, '').slice(0, 11);

    if (numbers.length <= 2) {
      return `(${numbers})`;
    }

    if (numbers.length <= 7) {
      return `(${numbers.slice(0, 2)}) ${numbers.slice(2)}`;
    }

    return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 7)}-${numbers.slice(7)}`;
  };

  // Enquanto verifica o login, não mostra nada
  if (!userId) return null;

  return (
    <div className="min-h-screen p-8 bg-slate-900">
      <div className="max-w-2xl mx-auto bg-slate-950 border border-green-700/50 p-8 rounded-lg shadow-2xl">
        <h2 className="text-3xl font-bold text-white uppercase tracking-wider mb-2">
          Anunciar <span className="text-green-500">Equipamento</span>
        </h2>
        <p className="text-slate-400 mb-8 text-sm">
          Preencha os dados abaixo para colocar seu item à venda no QG.
        </p>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Título do Anúncio</label>
            <input
              type="text"
              required
              value={titulo}
              onChange={(e) => setTitulo(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded px-4 py-2 text-white focus:outline-none focus:border-green-500"
              placeholder="Ex: M4A1 G&G CM16"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Descrição</label>
            <textarea
              required
              rows={4}
              value={descricao}
              onChange={(e) => setDescricao(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded px-4 py-2 text-white focus:outline-none focus:border-green-500"
              placeholder="Tempo de uso, upgrades, detalhes..."
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Preço (R$)</label>
              <input
                type="number"
                required
                step="0.01"
                value={preco}
                onChange={(e) => setPreco(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded px-4 py-2 text-white focus:outline-none focus:border-green-500"
                placeholder="Ex: 1500.00"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">WhatsApp (com DDD)</label>
              <input
                type="text"
                required
                maxLength={15}
                value={formatWhatsapp(whatsapp)}
                onChange={(e) => {
                  const numbers = e.target.value.replace(/\D/g, '').slice(0, 15);
                  setWhatsapp(numbers);
                }}
                className="w-full bg-slate-900 border border-slate-700 rounded px-4 py-2 text-white focus:outline-none focus:border-green-500"
                placeholder="Ex: (81) 99999-9999"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Link da Imagem</label>
              <input
                type="url"
                required
                value={imagemUrl}
                onChange={(e) => setImagemUrl(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded px-4 py-2 text-white focus:outline-none focus:border-green-500"
                placeholder="https://..."
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-green-700 hover:bg-green-600 text-white font-bold py-3 px-4 rounded transition-colors disabled:opacity-50 mt-4"
          >
            {loading ? "Processando..." : "Publicar Anúncio"}
          </button>
        </form>
      </div>
    </div>
  );
}