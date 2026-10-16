'use client';

import React from 'react';
import Link from 'next/link';
import { useDailyMenu } from '@/hooks/use-daily-menu';
import { useCart } from '@/hooks/use-cart';
import { DailyDishItem } from '@/types';
import { CATEGORY_LABELS } from '@/lib/constants';
import { useRestaurantSettings } from '@/components/RestaurantSettingsProvider';
import { formatDateSpanish, formatCurrency } from '@/lib/utils';
import { getDishImage } from '@/lib/dish-images';
import { Sparkles, Plus, Minus, ShoppingBag, AlertCircle, ArrowRight, CheckCircle2 } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

export default function CustomerMenuPage() {
  const { items, grouped, loading } = useDailyMenu();
  const { menuPrice } = useRestaurantSettings();
  const { items: cartItems, addItem, removeItem, updateQuantity, fullCombosCount, comboTotal, leftoverTotal, subtotal, totalItemCount } = useCart();

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

  const renderDishItem = (dish: DailyDishItem) => {
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
        {/* Dish Photo */}
        <div className="relative w-full sm:w-28 h-36 sm:h-28 rounded-xl overflow-hidden shrink-0 bg-stone-100">
          <img
            src={getDishImage(dish.name, dish.image_url)}
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

        {/* Dish Info */}
        <div className="flex-1 flex flex-col justify-between">
          <div>
            <div className="flex items-start justify-between gap-2">
              <h4 className="text-sm sm:text-base font-bold text-stone-900 leading-snug">
                {dish.name}
              </h4>
              <span className="text-xs sm:text-sm font-extrabold text-stone-700 whitespace-nowrap">
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
              {isOutOfStock ? 'No disponible hoy' : 'Precio individual o en combo'}
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
  };

  return (
    <div className="space-y-8">
      
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-orange-500 to-amber-500 rounded-3xl p-6 text-white shadow-lg space-y-2">
        <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-amber-200">
          <Sparkles className="w-4 h-4" />
          <span>Almuerzo Casero de Hoy • {formatDateSpanish(new Date())}</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-black">Menú del Día</h2>
        <p className="text-xs sm:text-sm text-orange-100 max-w-xl">
          ¡Arma tu almuerzo a tu gusto! 1 Entrada + 1 Segundo + 1 Refresco por solo <strong className="text-white underline font-black">S/ {menuPrice.toFixed(2)}</strong>. También puedes pedir platos sueltos o en cualquier combinación.
        </p>
      </div>

      {/* Categories Sections */}
      {loading ? (
        <div className="space-y-6">
          {[1, 2, 3].map((n) => (
            <div key={n} className="space-y-3">
              <Skeleton className="h-6 w-32" />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Skeleton className="h-32 w-full rounded-2xl" />
                <Skeleton className="h-32 w-full rounded-2xl" />
              </div>
            </div>
          ))}
        </div>
      ) : items.length === 0 ? (
        <div className="py-16 px-6 text-center space-y-3 bg-white rounded-3xl border border-stone-200 max-w-md mx-auto">
          <AlertCircle className="w-12 h-12 text-stone-300 mx-auto" />
          <h3 className="text-base font-bold text-stone-800">
            Hoy aún no hay menú disponible
          </h3>
          <p className="text-xs text-stone-500">
            El restaurante todavía no ha publicado el menú del día. Vuelve a intentarlo en un momento o revisa los platos a la carta.
          </p>
          <Link
            href="/carta"
            className="inline-flex px-4 py-2 rounded-xl bg-orange-500 text-white text-xs font-bold hover:bg-orange-600 shadow-xs"
          >
            Ver Platos a la Carta
          </Link>
        </div>
      ) : (
        <div className="space-y-8">
          
          {/* Entradas */}
          <section className="space-y-3">
            <div className="flex items-center justify-between border-b border-stone-200 pb-2">
              <h3 className="text-base sm:text-lg font-black text-stone-900 flex items-center gap-2">
                <span>{CATEGORY_LABELS.entrada}</span>
              </h3>
              <span className="text-xs text-stone-400 font-semibold">
                {grouped.entradas.length} opciones
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {grouped.entradas.map(renderDishItem)}
            </div>
          </section>

          {/* Segundos */}
          <section className="space-y-3">
            <div className="flex items-center justify-between border-b border-stone-200 pb-2">
              <h3 className="text-base sm:text-lg font-black text-stone-900 flex items-center gap-2">
                <span>{CATEGORY_LABELS.segundo}</span>
              </h3>
              <span className="text-xs text-stone-400 font-semibold">
                {grouped.segundos.length} opciones
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {grouped.segundos.map(renderDishItem)}
            </div>
          </section>

          {/* Refrescos */}
          <section className="space-y-3">
            <div className="flex items-center justify-between border-b border-stone-200 pb-2">
              <h3 className="text-base sm:text-lg font-black text-stone-900 flex items-center gap-2">
                <span>{CATEGORY_LABELS.refresco}</span>
              </h3>
              <span className="text-xs text-stone-400 font-semibold">
                {grouped.refrescos.length} opciones
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {grouped.refrescos.map(renderDishItem)}
            </div>
          </section>

        </div>
      )}

      {/* Floating Bottom Cart Bar when items are selected */}
      {totalItemCount > 0 && (
        <div className="sticky bottom-20 sm:bottom-6 z-30">
          <div className="p-4 sm:p-5 rounded-2xl bg-stone-900 text-white shadow-2xl flex flex-col sm:flex-row items-center justify-between gap-4 border border-stone-800">
            
            <div className="space-y-1 text-center sm:text-left w-full sm:w-auto">
              <div className="flex items-center justify-center sm:justify-start gap-2">
                <span className="px-2 py-0.5 rounded-full bg-orange-500 text-white text-xs font-black">
                  {totalItemCount} {totalItemCount === 1 ? 'item' : 'items'}
                </span>
                {fullCombosCount > 0 && (
                  <span className="text-xs font-bold text-amber-300 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5 text-amber-300" />
                    {fullCombosCount} {fullCombosCount === 1 ? 'Combo Completo (S/ 14)' : 'Combos Completos'}
                  </span>
                )}
              </div>
              <p className="text-xs text-stone-400">
                {fullCombosCount > 0 && leftoverTotal > 0
                  ? `Combos: S/ ${comboTotal.toFixed(2)} + Extras: S/ ${leftoverTotal.toFixed(2)}`
                  : fullCombosCount > 0
                  ? '¡Combo menú aplicado automáticamente!'
                  : 'Suma de platos individuales'}
              </p>
            </div>

            <div className="flex items-center justify-between sm:justify-end gap-4 w-full sm:w-auto">
              <div className="text-right">
                <span className="text-[11px] text-stone-400 block uppercase font-bold">Total Estimado</span>
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
        </div>
      )}

    </div>
  );
}
