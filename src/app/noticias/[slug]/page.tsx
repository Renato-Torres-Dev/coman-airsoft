import Link from "next/link";
import { notFound } from "next/navigation";

// A URL do seu WordPress local
const WP_URL = "http://coman-news.local";

async function getPost(slug: string) {
  try {
    const res = await fetch(`${WP_URL}/wp-json/wp/v2/posts?slug=${slug}&_embed`, {
      cache: "no-store",
    });
    
    if (!res.ok) return null;
    
    const posts = await res.json();
    return posts.length > 0 ? posts[0] : null;
  } catch (error) {
    console.error("Erro ao buscar a notícia:", error);
    return null;
  }
}

export default async function NoticiaDetalhe({ params }: { params: Promise<{ slug: string }> }) {
  const resolvedParams = await params;
  const post = await getPost(resolvedParams.slug);

  if (!post) {
    notFound();
  }

  const imagemUrl = post._embedded?.['wp:featuredmedia']?.[0]?.source_url;

  const dataPublicacao = new Date(post.date).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric'
  });

  // Lógica para extrair o ID do vídeo do YouTube recebido via ACF
  const videoUrl = post.acf?.link_do_video;
  let videoId = null;
  
  if (videoUrl) {
    if (videoUrl.includes("youtube.com/watch?v=")) {
      videoId = videoUrl.split("v=")[1].split("&")[0];
    } else if (videoUrl.includes("youtu.be/")) {
      videoId = videoUrl.split("youtu.be/")[1].split("?")[0];
    }
  }

  return (
    <article className="max-w-4xl mx-auto px-4 py-8 min-h-screen">
      
      <Link href="/noticias" className="text-slate-400 hover:text-green-500 mb-8 inline-block transition-colors font-medium">
        &larr; Voltar para SitRep
      </Link>

      <header className="mb-10 text-center">
        <h1 
          className="text-4xl md:text-5xl font-black text-white mb-4 uppercase tracking-wider leading-tight"
          dangerouslySetInnerHTML={{ __html: post.title.rendered }}
        />
        <div className="text-green-500 font-semibold text-sm uppercase tracking-widest">
          Publicado em {dataPublicacao}
        </div>
      </header>

      {/* Imagem Destacada */}
      {imagemUrl && (
        <div className="w-full h-64 md:h-[500px] rounded-xl overflow-hidden border border-slate-800 mb-12 shadow-2xl">
          <img 
            src={imagemUrl} 
            alt="Imagem da notícia"
            className="w-full h-full object-cover"
          />
        </div>
      )}

      {/* Player de Vídeo Dinâmico (Só aparece se você cadastrar o link no WP) */}
      {videoId && (
        <div className="mb-12 aspect-video w-full rounded-xl overflow-hidden border border-slate-800 shadow-2xl bg-black">
          <iframe
            width="100%"
            height="100%"
            src={`https://www.youtube.com/embed/${videoId}`}
            title="Vídeo da Operação"
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          ></iframe>
        </div>
      )}

      {/* Corpo do Texto da Notícia */}
      <div 
        className="prose prose-invert prose-green max-w-none text-slate-300 text-lg leading-relaxed
                   prose-headings:text-white prose-a:text-green-500 hover:prose-a:text-green-400 
                   prose-img:rounded-lg prose-img:border prose-img:border-slate-800"
        dangerouslySetInnerHTML={{ __html: post.content.rendered }}
      />
      
      <div className="mt-16 pt-8 border-t border-slate-800 flex justify-center">
        <Link href="/noticias" className="bg-slate-900 hover:bg-slate-800 text-white px-8 py-3 rounded border border-slate-700 transition-colors uppercase font-bold text-sm tracking-wider">
          Fim do Relatório
        </Link>
      </div>

    </article>
  );
}