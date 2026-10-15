'use client';

import React from 'react';
import { Sparkles, Flame, CheckCircle2, ArrowDown } from 'lucide-react';

interface HeroProps {
  onScrollToMenu: () => void;
}

export const Hero: React.FC<HeroProps> = ({ onScrollToMenu }) => {
  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-orange-50/70 via-stone-50 to-stone-50 pt-8 pb-12 sm:pt-14 sm:pb-16 border-b border-stone-200/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="grid lg:grid-cols-12 gap-8 items-center">
          
          {/* Text Content */}
          <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
            
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-orange-100/90 border border-orange-200 text-orange-900 text-xs font-bold tracking-wide uppercase shadow-xs">
              <Flame className="w-3.5 h-3.5 text-orange-600 fill-orange-500" />
              <span>Menú del Día Fresco & Recién Preparado</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-stone-900 tracking-tight leading-[1.15]">
              El auténtico sabor <span className="text-orange-600 underline decoration-amber-400 decoration-wavy decoration-2">casero</span> que alegra tu almuerzo.
            </h1>

            <p className="text-base sm:text-lg text-stone-600 max-w-2xl mx-auto lg:mx-0 leading-relaxed font-normal">
              Entradas calientitas, platos criollos de bandera, refrescos naturales y postres tradicionales. Elige tu menú y pídelo en 1 clic directo por WhatsApp.
            </p>

            {/* Value props */}
            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4 pt-1 text-xs sm:text-sm font-semibold text-stone-700">
              <div className="flex items-center gap-1.5 bg-white px-3 py-1.5 rounded-lg border border-stone-200 shadow-xs">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Ingredientes del Día</span>
              </div>
              <div className="flex items-center gap-1.5 bg-white px-3 py-1.5 rounded-lg border border-stone-200 shadow-xs">
                <CheckCircle2 className="w-4 h-4 text-orange-600" />
                <span>Porciones Generosas</span>
              </div>
              <div className="flex items-center gap-1.5 bg-white px-3 py-1.5 rounded-lg border border-stone-200 shadow-xs">
                <CheckCircle2 className="w-4 h-4 text-amber-600" />
                <span>Pagos con Yape & Plin</span>
              </div>
            </div>

            {/* CTAs */}
            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3">
              <button
                onClick={onScrollToMenu}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl bg-orange-600 hover:bg-orange-700 text-white font-bold text-base shadow-lg shadow-orange-600/30 transition-all hover:-translate-y-0.5 active:translate-y-0"
              >
                <span>Ver Menú de Hoy</span>
                <ArrowDown className="w-4 h-4" />
              </button>

              <div className="text-xs text-stone-500 font-medium">
                Almuerzos ejecutivos desde <strong className="text-stone-900 font-bold">S/ 14.50</strong>
              </div>
            </div>

          </div>

          {/* Featured Visual Banner */}
          <div className="lg:col-span-5 relative">
            <div className="relative mx-auto max-w-md lg:max-w-none">
              
              {/* Decorative Glow */}
              <div className="absolute -inset-2 bg-gradient-to-r from-orange-500 to-amber-500 rounded-3xl blur-2xl opacity-20 transform -rotate-1"></div>

              {/* Card Container */}
              <div className="relative rounded-3xl overflow-hidden border border-stone-200 bg-white shadow-xl shadow-stone-900/5">
                <img
                  src="https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=1000&q=80"
                  alt="Plato estrella Lomo Saltado Criollo"
                  className="w-full h-64 sm:h-72 object-cover"
                />

                <div className="p-5 bg-white">
                  <div className="flex items-center justify-between mb-2">
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800">
                      <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                      Recomendado de hoy
                    </span>
                    <span className="text-xl font-black text-orange-600">S/ 18.00</span>
                  </div>
                  <h3 className="text-lg font-bold text-stone-900">Lomo Saltado Criollo al Wok</h3>
                  <p className="text-xs text-stone-500 mt-1 line-clamp-2">
                    Lomo fino tierno con cebollas crujientes, tomates frescos, culantro y papas doradas.
                  </p>
                </div>
              </div>

            </div>
          </div>

        </div>

      </div>
    </section>
  );
};
