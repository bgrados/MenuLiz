'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useCart } from '@/hooks/use-cart';
import { Home, Sparkles, BookOpen, ShoppingBag } from 'lucide-react';

export const CustomerBottomNav: React.FC = () => {
  const pathname = usePathname();
  const { totalItemCount } = useCart();

  const links = [
    { href: '/', label: 'Inicio', icon: Home },
    { href: '/menu', label: 'Menú Hoy', icon: Sparkles },
    { href: '/carta', label: 'A la Carta', icon: BookOpen },
    { href: '/carrito', label: 'Pedido', icon: ShoppingBag, badge: totalItemCount },
  ];

  return (
    <nav className="sm:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-stone-200 px-3 py-1.5 shadow-lg">
      <div className="grid grid-cols-4 gap-1">
        {links.map((link) => {
          const Icon = link.icon;
          const isActive = pathname === link.href;

          return (
            <Link
              key={link.href}
              href={link.href}
              className={`flex flex-col items-center justify-center py-1.5 rounded-xl text-[11px] font-bold transition-all relative ${
                isActive
                  ? 'text-orange-600 bg-orange-50'
                  : 'text-stone-500 hover:text-stone-900'
              }`}
            >
              <div className="relative">
                <Icon className={`w-5 h-5 ${isActive ? 'text-orange-500' : 'text-stone-400'}`} />
                {link.badge !== undefined && link.badge > 0 && (
                  <span className="absolute -top-1.5 -right-2.5 min-w-[18px] h-[18px] px-1 rounded-full bg-orange-500 text-white text-[10px] font-black flex items-center justify-center shadow-xs">
                    {link.badge}
                  </span>
                )}
              </div>
              <span className="mt-1">{link.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
};
