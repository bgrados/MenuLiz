'use client';

import React from 'react';
import Link from 'next/link';
import { useDailyMenu } from '@/hooks/use-daily-menu';
import { useCart } from '@/hooks/use-cart';
import { DailyDishItem } from '@/types';
import { formatCurrency } from '@/lib/utils';
import { BookOpen, Plus, Minus, AlertCircle, ShoppingBag, ArrowRight } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

export default function CustomerCartaPage() {
  const { grouped, loading } = useDailyMenu();
  const { items: cartItems, addItem, removeItem, updateQuantity, subtotal, totalItemCount } = useCart();

  const getItemQuantity = (id: string) => {
    const found = cartItems.find((i) => i.id === id);
    return found ? found.quantity : 0;
  };

  const handleAdd = (dish: DailyDishItem) => {
    if (!dish.is_available || dish.stock <= 0) return;
    addItem(dish, 1);
  };

  const handleSubtract = (dish: DailyDishItem) => {
    const current = getItemQuantity(dish.id);
    if (current <= 1) {
      removeItem(dish.id);
    } else {
      updateQuantity(dish.id, current - 1);
    }
  };

  const cartaDishes = grouped.a_la_carta;

  return (
    <div className="space-y-8">
      
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-stone-900 to-stone-800 rounded-3xl p-6 text-white shadow-lg space-y-2">
        <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-amber-400">
          <BookOpen className="w-4 h-4" />
          <span>Especialidades Criollas & Marinas</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-black">Platos a la Carta</h2>
        <p className="text-xs sm:text-sm text-stone-300 max-w-xl">
          Nuestras mejores preparaciones especiales cocinadas al momento. Porciones contundentes con el auténtico toque del chef.
        </p>
      </div>

      {/* Dishes Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[1, 2, 3, 4].map((n) => (
            <Skeleton key={n} className="h-40 w-full rounded-2xl" />
          ))}
        </div>
      ) : cartaDishes.length === 0 ? (
        <div className="py-16 text-center space-y-3 bg-white rounded-3xl border border-stone-200 p-8 max-w-md mx-auto">
          <BookOpen className="w-12 h-12 text-stone-300 mx-auto" />
          <h3 className="text-base font-bold text-stone-800">No hay platos a la carta hoy</h3>
          <p className="text-xs text-stone-500">
            Revisa nuestro delicioso Menú del Día con entradas y segundos caseros.
          </p>
          <Link
            href="/menu"
            className="inline-flex px-4 py-2 rounded-xl bg-orange-500 text-white text-xs font-bold hover:bg-orange-600 shadow-xs"
          >
            Ver Menú del Día
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {cartaDishes.map((dish) => {
            const qty = getItemQuantity(dish.id);
            const isOutOfStock = !dish.is_available || dish.stock <= 0;

            return (
              <div
                key={dish.id}
                className={`flex flex-col sm:flex-row gap-3 p-4 rounded-2xl border transition-all ${
                  isOutOfStock
                    ? 'bg-stone-50 border-stone-200/60 opacity-60'
                    : 'bg-white border-stone-200 shadow-xs hover:border-orange-200'
                }`}
              >
                {/* Photo */}
                <div className="relative w-full sm:w-32 h-40 sm:h-32 rounded-xl overflow-hidden shrink-0 bg-stone-100">
                  <img
                    src={dish.image_url || 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=800&q=80'}
                    alt={dish.name}
                    className={`w-full h-full object-cover ${isOutOfStock ? 'grayscale' : ''}`}
                    loading="lazy"
                  />
                  {isOutOfStock ? (
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                      <span className="px-2.5 py-1 rounded-md bg-red-600 text-white font-black text-[11px] uppercase tracking-wider shadow-md">
                        AGOTADO
                      </span>
                    </div>
                  ) : (
                    <div className="absolute bottom-1.5 left-1.5">
                      <span className="px-2 py-0.5 rounded-md bg-stone-900/80 backdrop-blur-xs text-white text-[10px] font-bold">
                        Stock: {dish.stock}
                      </span>
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 flex flex-col justify-between">
                  <div>
                    <div className="flex items-start justify-between gap-2">
                      <h4 className="text-base font-bold text-stone-900 leading-snug">
                        {dish.name}
                      </h4>
                      <span className="text-sm font-black text-orange-600 whitespace-nowrap">
                        {formatCurrency(dish.price)}
                      </span>
                    </div>
                    {dish.description && (
                      <p className="text-xs text-stone-500 mt-1 line-clamp-2 leading-relaxed">
                        {dish.description}
                      </p>
                    )}
                  </div>

                  {/* Controls */}
                  <div className="mt-3 flex items-center justify-between pt-2 border-t border-stone-100">
                    <span className="text-[11px] text-stone-400 font-medium">
                      {isOutOfStock ? 'Agotado por hoy' : 'Preparación al momento'}
                    </span>

                    {isOutOfStock ? (
                      <span className="text-xs font-bold text-red-500 flex items-center gap-1">
                        <AlertCircle className="w-3.5 h-3.5" /> Agotado
                      </span>
                    ) : qty > 0 ? (
                      <div className="flex items-center gap-1 bg-orange-50 border border-orange-200 rounded-xl p-1">
                        <button
                          onClick={() => handleSubtract(dish)}
                          className="w-7 h-7 rounded-lg bg-white text-orange-700 flex items-center justify-center font-bold hover:bg-orange-100 shadow-xs cursor-pointer"
                          title="Disminuir"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <span className="text-xs font-black w-6 text-center text-orange-950">{qty}</span>
                        <button
                          onClick={() => handleAdd(dish)}
                          disabled={qty >= dish.stock}
                          className="w-7 h-7 rounded-lg bg-orange-500 text-white flex items-center justify-center font-bold hover:bg-orange-600 shadow-xs disabled:opacity-40 cursor-pointer"
                          title="Aumentar"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => handleAdd(dish)}
                        className="py-1.5 px-3 rounded-xl bg-orange-500 hover:bg-orange-600 active:scale-95 text-white text-xs font-bold transition-all flex items-center gap-1.5 shadow-xs cursor-pointer"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Agregar</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Floating Bottom Cart Bar */}
      {totalItemCount > 0 && (
        <div className="sticky bottom-20 sm:bottom-6 z-30">
          <div className="p-4 sm:p-5 rounded-2xl bg-stone-900 text-white shadow-2xl flex items-center justify-between gap-4 border border-stone-800">
            <div>
              <span className="text-xs text-stone-400 block font-medium">
                {totalItemCount} {totalItemCount === 1 ? 'item agregado' : 'items agregados'}
              </span>
              <span className="text-xl sm:text-2xl font-black text-orange-400">
                {formatCurrency(subtotal)}
              </span>
            </div>

            <Link
              href="/carrito"
              className="inline-flex items-center gap-2 py-3 px-6 rounded-xl bg-orange-500 hover:bg-orange-600 active:scale-95 text-white font-bold text-sm shadow-lg shadow-orange-500/25 transition-all whitespace-nowrap"
            >
              <ShoppingBag className="w-4 h-4" />
              <span>Ver Pedido</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      )}

    </div>
  );
}
