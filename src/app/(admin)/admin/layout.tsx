'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { RESTAURANT_NAME } from '@/lib/constants';
import {
  LayoutDashboard,
  UtensilsCrossed,
  CalendarDays,
  ClipboardList,
  Share2,
  Users,
  Settings,
  LogOut,
  ExternalLink,
  Menu,
  X,
  ChefHat,
} from 'lucide-react';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const supabase = createClient();

  useEffect(() => {
    if (typeof window !== 'undefined' && !sessionStorage.getItem('menuliz_admin_auth')) {
      router.replace('/login');
    }
  }, [router]);

  const navItems = [
    { href: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/admin/platos', label: 'Platos', icon: UtensilsCrossed },
    { href: '/admin/menu-hoy', label: 'Menú Hoy', icon: CalendarDays },
    { href: '/admin/pedidos', label: 'Pedidos', icon: ClipboardList },
    { href: '/admin/compartir', label: 'Compartir', icon: Share2 },
    { href: '/admin/clientes', label: 'Clientes', icon: Users },
    { href: '/admin/configuracion', label: 'Configuración', icon: Settings },
  ];

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
    } catch {
      // ignore
    }
    if (typeof window !== 'undefined') {
      sessionStorage.removeItem('menuliz_admin_auth');
      sessionStorage.removeItem('menuliz_admin_email');
    }
    router.push('/login');
  };

  return (
    <div className="min-h-screen bg-stone-100 flex flex-col md:flex-row pb-16 md:pb-0">
      
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex w-64 bg-stone-900 text-stone-200 flex-col shrink-0 border-r border-stone-800">
        
        {/* Brand Header */}
        <div className="p-6 border-b border-stone-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-orange-500 text-white flex items-center justify-center shadow-md">
              <ChefHat className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xl font-black text-white">
                Menu<span className="text-orange-500">Liz</span>
              </span>
              <p className="text-[11px] text-stone-400 font-semibold">Panel de Control</p>
            </div>
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 p-4 space-y-1.5 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-2xl text-xs sm:text-sm font-bold transition-all ${
                  isActive
                    ? 'bg-orange-500 text-white shadow-md shadow-orange-500/20'
                    : 'text-stone-400 hover:text-white hover:bg-stone-800/60'
                }`}
              >
                <Icon className={`w-5 h-5 ${isActive ? 'text-white' : 'text-stone-400'}`} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Footer Actions */}
        <div className="p-4 border-t border-stone-800 space-y-2">
          <Link
            href="/"
            target="_blank"
            className="flex items-center justify-between w-full px-4 py-2.5 rounded-xl text-xs font-semibold text-stone-400 hover:text-white hover:bg-stone-800 transition-colors"
          >
            <span className="flex items-center gap-2">
              <ExternalLink className="w-4 h-4 text-orange-400" />
              <span>Ver Menú Público</span>
            </span>
            <span className="text-[10px] bg-stone-800 px-1.5 py-0.5 rounded text-stone-400">↗</span>
          </Link>

          <button
            onClick={handleLogout}
            className="flex items-center gap-2 w-full px-4 py-2.5 rounded-xl text-xs font-bold text-red-400 hover:text-red-300 hover:bg-red-950/40 transition-colors cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            <span>Cerrar Sesión</span>
          </button>
        </div>

      </aside>

      {/* Mobile Top Header */}
      <header className="md:hidden sticky top-0 z-30 bg-stone-900 text-white px-4 py-3 flex items-center justify-between border-b border-stone-800 shadow-md">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-orange-500 flex items-center justify-center text-white">
            <ChefHat className="w-5 h-5" />
          </div>
          <span className="text-lg font-black">
            Menu<span className="text-orange-500">Liz</span> Admin
          </span>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/"
            target="_blank"
            className="p-2 rounded-xl text-stone-400 hover:text-white bg-stone-800"
            title="Ver Menú Público"
          >
            <ExternalLink className="w-4 h-4 text-orange-400" />
          </Link>
          <button
            onClick={handleLogout}
            className="p-2 rounded-xl text-red-400 hover:text-red-300 bg-stone-800"
            title="Cerrar Sesión"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto p-4 sm:p-8">
        <div className="max-w-6xl mx-auto">
          {children}
        </div>
      </main>

      {/* Mobile Bottom Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-stone-900 border-t border-stone-800 px-2 py-1 shadow-2xl">
        <div className="grid grid-cols-7 gap-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex flex-col items-center justify-center py-2 rounded-xl text-[10px] font-bold transition-all ${
                  isActive
                    ? 'text-orange-400 bg-stone-800'
                    : 'text-stone-400 hover:text-white'
                }`}
              >
                <Icon className={`w-5 h-5 ${isActive ? 'text-orange-500' : 'text-stone-400'}`} />
                <span className="mt-1 truncate">{item.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>

    </div>
  );
}
