'use client';

import React from 'react';
import Link from 'next/link';
import { formatDateSpanish } from '@/lib/utils';
import { RESTAURANT_NAME } from '@/lib/constants';
import { useRestaurantSettings } from '@/components/RestaurantSettingsProvider';
import { Sparkles, BookOpen, Utensils, Flame, CheckCircle2, ShieldCheck, ArrowRight } from 'lucide-react';

export default function CustomerLandingPage() {
  const todayFormatted = formatDateSpanish(new Date());
  const { menuPrice } = useRestaurantSettings();

  return (
    <div className="space-y-8 sm:space-y-12">
      
      {/* Top Banner / Hero */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-orange-500 via-orange-600 to-amber-600 text-white p-6 sm:p-10 shadow-xl shadow-orange-500/20 text-center">
        
        {/* Background Decorative Rings */}
        <div className="absolute -top-12 -right-12 w-48 h-48 rounded-full bg-white/10 blur-xl pointer-events-none" />
        <div className="absolute -bottom-12 -left-12 w-48 h-48 rounded-full bg-amber-300/20 blur-xl pointer-events-none" />

        <div className="relative max-w-xl mx-auto space-y-4">
          
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/20 backdrop-blur-md text-white text-xs font-bold tracking-wide uppercase shadow-xs">
            <Flame className="w-4 h-4 text-amber-200 fill-amber-200" />
            <span className="capitalize">{todayFormatted}</span>
          </div>

          <h1 className="text-4xl sm:text-5xl font-black tracking-tight text-white leading-tight">
            Bienvenido a <span className="underline decoration-amber-300 decoration-wavy decoration-2">{RESTAURANT_NAME}</span>
          </h1>

          <p className="text-sm sm:text-base text-orange-100 font-medium leading-relaxed">
            El sabor criollo y casero que te reconforta todos los días. Almuerza como en casa con ingredientes frescos y porciones generosas.
          </p>

          {/* Pricing Highlight Pill */}
          <div className="inline-flex flex-col sm:flex-row items-center gap-1.5 sm:gap-2 px-5 py-2.5 rounded-2xl bg-white text-stone-900 shadow-lg font-bold text-xs sm:text-sm">
            <div className="flex items-center gap-1.5 text-orange-600">
              <Sparkles className="w-4 h-4 text-orange-500" />
              <span>Combo Menú Completo:</span>
            </div>
            <span className="text-stone-700">1 Entrada + 1 Segundo + 1 Refresco por</span>
            <span className="text-base sm:text-lg font-black text-orange-600">S/ {menuPrice.toFixed(2)}</span>
          </div>

          {/* Main Action Buttons */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-4">
            <Link
              href="/menu"
              className="w-full inline-flex items-center justify-center gap-2 py-4 px-6 rounded-2xl bg-white text-orange-600 hover:bg-orange-50 active:scale-[0.98] font-black text-sm sm:text-base shadow-lg transition-all"
            >
              <Sparkles className="w-5 h-5 text-orange-500" />
              <span>Ver Menú del Día</span>
              <ArrowRight className="w-4 h-4" />
            </Link>

            <Link
              href="/carta"
              className="w-full inline-flex items-center justify-center gap-2 py-4 px-6 rounded-2xl bg-stone-900/40 hover:bg-stone-900/60 active:scale-[0.98] border border-white/30 text-white font-black text-sm sm:text-base shadow-lg transition-all backdrop-blur-md"
            >
              <BookOpen className="w-5 h-5 text-amber-300" />
              <span>Ver Platos a la Carta</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

        </div>

      </section>

      {/* Feature cards */}
      <section className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        
        <div className="p-5 rounded-2xl bg-white border border-stone-200 shadow-xs flex items-start gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-orange-100 text-orange-600 flex items-center justify-center shrink-0">
            <Utensils className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-stone-900">Menú Variable Diario</h3>
            <p className="text-xs text-stone-500 mt-1 leading-relaxed">
              Opciones frescas preparadas cada mañana: 2-3 entradas, 4-5 segundos criollos y refrescos naturales.
            </p>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-stone-200 shadow-xs flex items-start gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-stone-900">Sin Registros Difíciles</h3>
            <p className="text-xs text-stone-500 mt-1 leading-relaxed">
              Pide directo con tu nombre y teléfono. Confirmas y enviamos el pedido automáticamente al WhatsApp del restaurante.
            </p>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-stone-200 shadow-xs flex items-start gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center shrink-0">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-stone-900">Pagos Fáciles y Rápidos</h3>
            <p className="text-xs text-stone-500 mt-1 leading-relaxed">
              Aceptamos Yape, Plin, Efectivo contra entrega y Lemon. Paga cómodamente al recibir o recoger.
            </p>
          </div>
        </div>

      </section>

      {/* Admin Access Footer Link */}
      <div className="text-center pt-2">
        <Link
          href="/login"
          className="inline-flex items-center gap-1.5 text-xs text-stone-400 hover:text-stone-700 transition-colors py-1 px-3 rounded-lg hover:bg-stone-100"
        >
          <ShieldCheck className="w-4 h-4 text-stone-400" />
          <span>Acceso para dueña / administración</span>
        </Link>
      </div>

    </div>
  );
}
