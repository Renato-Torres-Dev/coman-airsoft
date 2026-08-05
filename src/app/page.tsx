"use client";

import { Autoplay, Navigation, Pagination } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";

export default function Home() {
  return (
    <div>
      {/* Banner Slider */}
      <section className="w-full h-[60vh] md:h-[80vh] relative bg-black">
        <Swiper
          spaceBetween={0}
          centeredSlides={true}
          autoplay={{
            delay: 4000,
            disableOnInteraction: false,
          }}
          pagination={{
            clickable: true,
          }}
          navigation={true}
          modules={[Autoplay, Pagination, Navigation]}
          className="w-full h-full"
        >
          {/* Slide 1 */}
          <SwiperSlide>
            <div className="w-full h-full bg-[url('https://images.unsplash.com/photo-1599839619722-39751411ea63?q=80&w=2000')] bg-cover bg-center flex items-center justify-center">
              <div className="absolute inset-0 bg-black/60" />
              <div className="relative z-10 text-center px-4">
                <h1 className="text-4xl md:text-6xl font-bold uppercase tracking-wide text-white mb-4">
                  Bem-vindo ao <span className="text-green-500">COMAN</span>
                </h1>
                <p className="text-lg md:text-xl text-gray-300 max-w-2xl mx-auto">
                  O maior portal integrado para operadores e equipes de Airsoft da região do Nordeste.
                </p>
              </div>
            </div>
          </SwiperSlide>

          {/* Slide 2 */}
          <SwiperSlide>
            <div className="w-full h-full bg-[url('https://images.unsplash.com/photo-1620002093397-6a4a1599ffc2?q=80&w=2000')] bg-cover bg-center flex items-center justify-center">
              <div className="absolute inset-0 bg-black/60"></div>
              <div className="relative z-10 text-center px-4">
                <h1 className="text-4xl md:text-6xl font-bold uppercase tracking-widest text-white mb-4">
                  Operações <span className="text-green-500">Épicas</span>
                </h1>
                <p className="text-lg md:text-xl text-gray-300 max-w-2xl mx-auto">
                  Inscreva-se nos melhores eventos, acompanhe o briefing e participe do combate.
                </p>
              </div>
            </div>
          </SwiperSlide>
        </Swiper>
      </section>

      {/* SEÇÃO RÁPIDA (Exemplo do que virá a seguir) */}
      <section className="max-w-7xl mx-auto py-16 px-4 text-center">
        <h2 className="text-3xl font-bold uppercase mb-8 border-b-2 border-green-700 pb-2 inline-block">
          Últimas Novidades
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-8">
          <div className="bg-slate-800 p-6 rounded-lg border border-slate-700">Mercado (Em Breve)</div>
          <div className="bg-slate-800 p-6 rounded-lg border border-slate-700">Operações (Em Breve)</div>
          <div className="bg-slate-800 p-6 rounded-lg border border-slate-700">Vídeos (Em Breve)</div>
        </div>
      </section>
    </div>
  )
}