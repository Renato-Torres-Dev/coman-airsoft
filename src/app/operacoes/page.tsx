"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase";
import Link from "next/link";

// 1. Adicionamos o user_id no tipo para sabermos quem é o dono
type Operacao = {
  id: string;
  titulo: string;
  data_operacao: string;
  local: string;
  link_inscricao: string;
  imagem_url?: string;
  user_id: string; 
};

export default function CalendarioOperacoes() {
  const [operacoes, setOperacoes] = useState<Operacao[]>([]);
  const [currentUser, setCurrentUser] = useState<any>(null); // Guardar o usuário logado
  const [loading, setLoading] = useState(true);
  
  const [currentDate, setCurrentDate] = useState(new Date());
  const supabase = createClient();

  useEffect(() => {
    const fetchOperacoesEUsuario = async () => {
      setLoading(true);
      
      // Busca quem é o usuário logado agora
      const { data: { session } } = await supabase.auth.getSession();
      setCurrentUser(session?.user || null);

      const year = currentDate.getFullYear();
      const month = currentDate.getMonth();
      const firstDay = new Date(year, month, 1).toISOString().split('T')[0];
      const lastDay = new Date(year, month + 1, 0).toISOString().split('T')[0];

      const { data, error } = await supabase
        .from("operacoes")
        .select("*")
        .gte("data_operacao", firstDay)
        .lte("data_operacao", lastDay)
        .order("data_operacao", { ascending: true });

      if (data) setOperacoes(data);
      setLoading(false);
    };

    fetchOperacoesEUsuario();
  }, [currentDate, supabase]);

  // Função para deletar a operação
  const handleDelete = async (id: string, imagemUrl?: string) => {
    // Pede uma confirmação antes de apagar
    if (!confirm("Tem certeza que deseja excluir esta operação do calendário?")) return;

    try {
      // 1. Se a operação tiver uma imagem, tentamos apagar ela do Storage para não ocupar espaço
      if (imagemUrl) {
        const fileName = imagemUrl.split('/').pop(); // Pega só o nome do arquivo no final do link
        if (fileName) {
          await supabase.storage.from('operacoes').remove([fileName]);
        }
      }

      // 2. Apaga a operação do banco de dados
      const { error } = await supabase.from('operacoes').delete().eq('id', id);

      if (error) throw error;

      // 3. Atualiza a tela removendo o bloco instantaneamente, sem precisar recarregar a página
      setOperacoes(operacoes.filter(op => op.id !== id));
      
    } catch (error: any) {
      alert("Erro ao excluir: " + error.message);
    }
  };

  const prevMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayOfMonth = new Date(year, month, 1).getDay();
  
  const diasVazios = Array.from({ length: firstDayOfMonth }, (_, i) => null);
  const diasDoMes = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  const meses = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"];
  const diasSemana = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

  const formatarDataDb = (dia: number) => {
    const m = String(month + 1).padStart(2, '0');
    const d = String(dia).padStart(2, '0');
    return `${year}-${m}-${d}`;
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 min-h-screen flex flex-col">
      
      {/* CABEÇALHO */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 border-b border-green-700/50 pb-4 gap-4">
        <div>
          <h1 className="text-3xl font-bold uppercase tracking-wider text-white">
            Calendário de <span className="text-green-500">Operações</span>
          </h1>
          <p className="text-slate-400 mt-1">Programe-se para os próximos combates na região.</p>
        </div>
        
        <div className="flex flex-col sm:flex-row items-center gap-4">
          <Link href="/operacoes/novo" className="bg-green-700 hover:bg-green-600 px-4 py-2 rounded text-white font-bold text-xs uppercase tracking-wide transition-colors whitespace-nowrap">
            + Cadastrar Operação
          </Link>

          <div className="flex items-center gap-4 bg-slate-900 border border-slate-700 rounded-lg p-2">
            <button onClick={prevMonth} className="px-3 py-1 text-slate-300 hover:text-green-500 transition-colors font-bold">&larr;</button>
            <span className="text-lg font-bold text-white uppercase tracking-widest min-w-[160px] text-center">
              {meses[month]} {year}
            </span>
            <button onClick={nextMonth} className="px-3 py-1 text-slate-300 hover:text-green-500 transition-colors font-bold">&rarr;</button>
          </div>
        </div>
      </div>

      {/* GRID DO CALENDÁRIO */}
      <div className="flex-grow bg-slate-950 border border-slate-800 rounded-lg overflow-hidden flex flex-col shadow-2xl">
        <div className="grid grid-cols-7 bg-slate-900 border-b border-slate-800">
          {diasSemana.map((dia) => (
            <div key={dia} className="p-3 md:p-4 text-center font-bold text-slate-400 text-sm md:text-base uppercase tracking-wider">
              {dia}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7 flex-grow auto-rows-fr">
          {diasVazios.map((_, index) => (
            <div key={`empty-${index}`} className="border-b border-r border-slate-800/50 bg-slate-950/30 p-2 min-h-[140px]"></div>
          ))}
          
          {diasDoMes.map((dia) => {
            const dataDb = formatarDataDb(dia);
            const opsDoDia = operacoes.filter(op => op.data_operacao === dataDb);
            
            const hojeLocal = new Date();
            const dataHojeStr = `${hojeLocal.getFullYear()}-${String(hojeLocal.getMonth() + 1).padStart(2, '0')}-${String(hojeLocal.getDate()).padStart(2, '0')}`;
            const isHoje = dataHojeStr === dataDb;

            return (
              <div 
                key={dia} 
                className={`border-b border-r border-slate-800/50 p-2 md:p-3 min-h-[140px] transition-colors hover:bg-slate-900/50 group/dia relative
                  ${isHoje ? 'bg-slate-900/80 ring-1 ring-inset ring-green-500/50' : 'bg-slate-950'}
                `}
              >
                <div className={`font-bold mb-2 flex items-center justify-between ${isHoje ? 'text-green-500' : 'text-slate-500 group-hover/dia:text-slate-300'}`}>
                  <span>{dia}</span>
                  {isHoje && <span className="text-[10px] uppercase tracking-wider bg-green-900/50 text-green-400 px-2 py-0.5 rounded">Hoje</span>}
                </div>
                
                <div className="space-y-2">
                  {opsDoDia.map((op) => (
                    // Adicionamos 'relative' no card principal para ancorar o botão de deletar
                    <div key={op.id} className="bg-slate-900 border border-slate-700/50 rounded overflow-hidden shadow-md hover:border-green-700/50 transition-colors relative group/card">
                      
                      {/* BOTÃO DE DELETAR (Aparece apenas se o usuário for dono da operação) */}
                      {currentUser?.id === op.user_id && (
                        <button 
                          onClick={() => handleDelete(op.id, op.imagem_url)}
                          className="absolute top-1 right-1 bg-red-600/90 hover:bg-red-500 text-white p-1.5 rounded-full z-10 transition-colors opacity-0 group-hover/card:opacity-100"
                          title="Excluir Operação"
                        >
                          {/* Ícone de Lixeira (SVG) */}
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                          </svg>
                        </button>
                      )}

                      {op.imagem_url && (
                        <div className="h-20 w-full relative overflow-hidden bg-black">
                          <img 
                            src={op.imagem_url} 
                            alt={op.titulo}
                            className="w-full h-full object-cover opacity-80 hover:opacity-100 transition-opacity"
                          />
                        </div>
                      )}

                      <div className="p-2 relative z-0">
                        <div className="text-white text-xs md:text-sm font-bold truncate" title={op.titulo}>{op.titulo}</div>
                        <div className="text-slate-400 text-[10px] md:text-xs truncate" title={op.local}>📍 {op.local}</div>
                        {op.link_inscricao && (
                          <a href={op.link_inscricao} target="_blank" rel="noreferrer" className="mt-2 block text-center bg-green-700 hover:bg-green-600 text-white text-[10px] md:text-xs font-bold uppercase py-1 rounded transition-colors">
                            Inscrever-se
                          </a>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}