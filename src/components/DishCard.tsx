'use client';

import React from 'react';
import { MenuItem } from '@/types/menu';
import { Plus, Minus, Check, Sparkles, AlertCircle } from 'lucide-react';

interface DishCardProps {
  item: MenuItem;
  cartQuantity: number;
  onAddToCart: (item: MenuItem) => void;
  onRemoveFromCart: (item: MenuItem) => void;
}

export const DishCard: React.FC<DishCardProps> = ({
  item,
  cartQuantity,
  onAddToCart,
  onRemoveFromCart,
}) => {
  const isAvailable = item.is_available;

  return (
    <div
      className={`group relative flex flex-col bg-white rounded-2xl border overflow-hidden transition-all duration-200 ${
        isAvailable
          ? 'border-stone-200 hover:border-orange-300 hover:shadow-xl hover:shadow-orange-950/5 hover:-translate-y-1'
          : 'border-stone-200/60 opacity-70 bg-stone-50'
      }`}
    >
      {/* Dish Image Container */}
      <div className="relative h-48 w-full overflow-hidden bg-stone-100">
        <img
          src={item.image_url}
          alt={item.name}
          className={`w-full h-full object-cover transition-transform duration-300 ${
            isAvailable ? 'group-hover:scale-105' : 'grayscale'
          }`}
          loading="lazy"
        />

        {/* Gradient overlay for contrast */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20" />

        {/* Top Badges */}
        <div className="absolute top-3 left-3 right-3 flex items-start justify-between gap-2">
          <div className="flex flex-wrap gap-1.5">
            {item.is_daily_special && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-black bg-orange-600 text-white shadow-md shadow-orange-950/20">
                <Sparkles className="w-3 h-3" />
                Menú de Hoy
              </span>
            )}
            {item.badge && (
              <span className="inline-flex items-center px-2 py-1 rounded-lg text-xs font-bold bg-amber-400 text-stone-900 shadow-xs">
                {item.badge}
              </span>
            )}
          </div>

          {!isAvailable && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold bg-stone-900/90 text-white backdrop-blur-xs">
              <AlertCircle className="w-3 h-3 text-red-400" />
              Agotado
            </span>
          )}
        </div>

        {/* Bottom Price Tag */}
        <div className="absolute bottom-3 right-3">
          <span className="px-3 py-1 rounded-xl bg-white/95 backdrop-blur-md text-stone-900 font-black text-sm shadow-md">
            S/ {item.price.toFixed(2)}
          </span>
        </div>
      </div>

      {/* Dish Information */}
      <div className="flex-1 p-5 flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between gap-2">
            <span className="text-[11px] font-bold tracking-wider uppercase text-orange-600">
              {item.category}
            </span>
          </div>

          <h3 className="text-base font-bold text-stone-900 mt-1 line-clamp-1 group-hover:text-orange-600 transition-colors">
            {item.name}
          </h3>

          <p className="text-xs text-stone-500 mt-1.5 line-clamp-2 leading-relaxed">
            {item.description}
          </p>
        </div>

        {/* Action Controls */}
        <div className="mt-4 pt-3 border-t border-stone-100 flex items-center justify-between gap-2">
          {isAvailable ? (
            cartQuantity > 0 ? (
              <div className="w-full flex items-center justify-between bg-orange-50 border border-orange-200 rounded-xl p-1">
                <button
                  onClick={() => onRemoveFromCart(item)}
                  className="w-8 h-8 rounded-lg bg-white text-orange-700 flex items-center justify-center font-bold hover:bg-orange-100 shadow-xs transition-colors"
                  title="Disminuir"
                >
                  <Minus className="w-3.5 h-3.5" />
                </button>
                <div className="flex items-center gap-1 text-xs font-black text-orange-950">
                  <Check className="w-3.5 h-3.5 text-orange-600" />
                  <span>{cartQuantity} en pedido</span>
                </div>
                <button
                  onClick={() => onAddToCart(item)}
                  className="w-8 h-8 rounded-lg bg-orange-600 text-white flex items-center justify-center font-bold hover:bg-orange-700 shadow-xs transition-colors"
                  title="Aumentar"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <button
                onClick={() => onAddToCart(item)}
                className="w-full py-2.5 px-4 rounded-xl bg-stone-900 hover:bg-orange-600 active:scale-[0.98] text-white text-xs font-bold transition-all flex items-center justify-center gap-2 shadow-xs"
              >
                <Plus className="w-4 h-4" />
                <span>Agregar al Pedido</span>
              </button>
            )
          ) : (
            <div className="w-full py-2.5 px-4 rounded-xl bg-stone-100 text-stone-400 text-xs font-medium text-center select-none">
              No disponible por hoy
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
