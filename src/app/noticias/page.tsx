import Link from "next/link";

// Cole aqui a URL exata que aparece no seu programa LocalWP
const WP_URL = "http://coman-news.local";

// Função para buscar as notícias do WordPress
async function getNoticias() {
  try {
    // O parâmetro ?_embed é o segredo para o WP trazer a foto da notícia junto
    const res = await fetch(`${WP_URL}/wp-json/wp/v2/posts?_embed`, {
      cache: "no-store", // Garante que sempre pegará a notícia mais recente
    });
    
    if (!res.ok) {
      throw new Error("Erro ao conectar com o QG de Notícias");
    }
    
    return res.json();
  } catch (error) {
    console.error("Erro ao buscar posts:", error);
    return [];
  }
}

export default async function Noticias() {
  const posts = await getNoticias();

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 min-h-screen">
      {/* CABEÇALHO */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 border-b border-green-700/50 pb-4">
        <div>
          <h1 className="text-3xl font-bold uppercase tracking-wider text-white">
            SitRep <span className="text-green-500">Notícias</span>
          </h1>
          <p className="text-slate-400 mt-1">Cobertura de operações, reviews e novidades do mundo do Airsoft.</p>
        </div>
      </div>

      {/* ÁREA DE NOTÍCIAS */}
      {posts.length === 0 ? (
        <div className="text-center text-slate-400 py-12 bg-slate-950 rounded-lg border border-slate-800">
          Nenhum relatório de missão publicado no momento.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {posts.map((post: any) => {
            // Pegando a imagem destacada (se existir)
            const imagemUrl = post._embedded?.['wp:featuredmedia']?.[0]?.source_url || "https://via.placeholder.com/600x400?text=Sem+Imagem";
            
            return (
              <div key={post.id} className="bg-slate-950 border border-slate-800 rounded-lg overflow-hidden hover:border-green-500/50 transition-colors group flex flex-col">
                
                {/* Imagem da Notícia */}
                <div className="h-56 bg-slate-900 relative overflow-hidden">
                  <img 
                    src={imagemUrl} 
                    alt={post.title.rendered}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
                
                {/* Conteúdo */}
                <div className="p-6 flex flex-col flex-grow">
                  <h3 
                    className="font-bold text-xl text-white mb-3 line-clamp-2"
                    dangerouslySetInnerHTML={{ __html: post.title.rendered }}
                  />
                  
                  {/* O trecho (resumo) da notícia vem com tags HTML do WP, o Next resolve isso assim: */}
                  <div 
                    className="text-slate-400 text-sm line-clamp-3 mb-6 flex-grow"
                    dangerouslySetInnerHTML={{ __html: post.excerpt.rendered }}
                  />
                  
                  <Link 
                    href={`/noticias/${post.slug}`}
                    className="mt-auto inline-block text-green-500 font-bold text-sm uppercase hover:text-green-400 transition-colors tracking-wider"
                  >
                    Ler Relatório Completo &rarr;
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}