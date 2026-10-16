'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useCart } from '@/hooks/use-cart';
import { useRestaurantSettings } from '@/components/RestaurantSettingsProvider';
import { BrandMark } from '@/components/BrandMark';
import { ShoppingBag, Sparkles, BookOpen } from 'lucide-react';

export const CustomerHeader: React.FC = () => {
  const pathname = usePathname();
  const { totalItemCount, subtotal } = useCart();
  const { restaurantName } = useRestaurantSettings();

  // El nombre del restaurante se parte en dos: la última palabra va en naranja.
  const nameParts = restaurantName.trim().split(/\s+/);
  const brandTail = nameParts.length > 1 ? nameParts[nameParts.length - 1] : '';
  const brandLead = brandTail ? nameParts.slice(0, -1).join(' ') + ' ' : restaurantName.trim();

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-stone-200">
      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16 sm:h-20">
          
          {/* Logo & Brand */}
          <Link href="/" className="flex items-center gap-2.5 group">
            <BrandMark
              size={44}
              className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl shadow-md shadow-orange-500/25 group-hover:brightness-105 transition-all"
            />
            <div>
              <span className="text-xl sm:text-2xl font-black tracking-tight text-stone-900">
                {brandLead}
                {brandTail && <span className="text-orange-500">{brandTail}</span>}
              </span>
              <p className="text-[10px] sm:text-xs text-stone-500 font-medium -mt-1">Sabor del norte & Menú Casero</p>
            </div>
          </Link>

          {/* Desktop Nav Links */}
          <nav className="hidden sm:flex items-center gap-1 bg-stone-100 p-1.5 rounded-2xl border border-stone-200/80">
            <Link
              href="/menu"
              className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                pathname === '/menu'
                  ? 'bg-white text-orange-600 shadow-xs'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              <Sparkles className="w-4 h-4 text-orange-500" />
              <span>Menú del Día</span>
            </Link>
            <Link
              href="/carta"
              className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                pathname === '/carta'
                  ? 'bg-white text-orange-600 shadow-xs'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              <BookOpen className="w-4 h-4 text-orange-500" />
              <span>A la Carta</span>
            </Link>
          </nav>

          {/* Cart Button */}
          <Link
            href="/carrito"
            className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-orange-500 hover:bg-orange-600 active:scale-95 text-white font-bold text-xs sm:text-sm shadow-md shadow-orange-500/25 transition-all"
          >
            <div className="relative">
              <ShoppingBag className="w-4 h-4" />
              {totalItemCount > 0 && (
                <span className="absolute -top-2 -right-2 w-4 h-4 rounded-full bg-stone-900 text-white text-[10px] font-black flex items-center justify-center border border-white">
                  {totalItemCount}
                </span>
              )}
            </div>
            <span className="hidden xs:inline">Mi Pedido</span>
            {subtotal > 0 && (
              <span className="hidden sm:inline bg-orange-600/70 px-2 py-0.5 rounded-lg text-xs">
                S/ {subtotal.toFixed(2)}
              </span>
            )}
          </Link>

        </div>
      </div>
    </header>
  );
};
