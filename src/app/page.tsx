'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { MenuItem, Category, CartItem } from '@/types/menu';
import { fetchMenuItems, saveMenuItem, removeMenuItem } from '@/lib/supabase';
import { Navbar } from '@/components/Navbar';
import { Hero } from '@/components/Hero';
import { CategoryFilter } from '@/components/CategoryFilter';
import { DishCard } from '@/components/DishCard';
import { CartDrawer } from '@/components/CartDrawer';
import { AdminModal } from '@/components/AdminModal';
import { ShoppingBag, Sparkles, MapPin, Phone, Clock, Heart, ChefHat } from 'lucide-react';

export default function Home() {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState<Category>('todos');
  const [searchQuery, setSearchQuery] = useState('');
  const [onlyAvailable, setOnlyAvailable] = useState(false);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isAdminOpen, setIsAdminOpen] = useState(false);

  // Load menu items
  useEffect(() => {
    async function loadData() {
      try {
        const items = await fetchMenuItems();
        setMenuItems(items);
      } catch (err) {
        console.error('Error loading menu:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  // Filtered menu items
  const filteredItems = useMemo(() => {
    return menuItems.filter((item) => {
      // Category filter
      if (activeCategory === 'menu_del_dia') {
        if (!item.is_daily_special) return false;
      } else if (activeCategory !== 'todos') {
        if (item.category !== activeCategory) return false;
      }

      // Availability filter
      if (onlyAvailable && !item.is_available) {
        return false;
      }

      // Search query filter
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesName = item.name.toLowerCase().includes(query);
        const matchesDesc = item.description.toLowerCase().includes(query);
        const matchesBadge = item.badge?.toLowerCase().includes(query);
        if (!matchesName && !matchesDesc && !matchesBadge) return false;
      }

      return true;
    });
  }, [menuItems, activeCategory, onlyAvailable, searchQuery]);

  // Cart operations
  const handleAddToCart = (item: MenuItem) => {
    setCart((prev) => {
      const existing = prev.find((ci) => ci.item.id === item.id);
      if (existing) {
        return prev.map((ci) =>
          ci.item.id === item.id ? { ...ci, quantity: ci.quantity + 1 } : ci
        );
      }
      return [...prev, { item, quantity: 1 }];
    });
  };

  const handleRemoveFromCart = (item: MenuItem) => {
    setCart((prev) => {
      const existing = prev.find((ci) => ci.item.id === item.id);
      if (!existing) return prev;
      if (existing.quantity <= 1) {
        return prev.filter((ci) => ci.item.id !== item.id);
      }
      return prev.map((ci) =>
        ci.item.id === item.id ? { ...ci, quantity: ci.quantity - 1 } : ci
      );
    });
  };

  const handleUpdateCartQuantity = (id: string, delta: number) => {
    setCart((prev) => {
      const existing = prev.find((ci) => ci.item.id === id);
      if (!existing) return prev;
      const newQty = existing.quantity + delta;
      if (newQty <= 0) {
        return prev.filter((ci) => ci.item.id !== id);
      }
      return prev.map((ci) =>
        ci.item.id === id ? { ...ci, quantity: newQty } : ci
      );
    });
  };

  const handleRemoveCartItem = (id: string) => {
    setCart((prev) => prev.filter((ci) => ci.item.id !== id));
  };

  const handleClearCart = () => {
    setCart([]);
  };

  // Admin operations
  const handleSaveItem = async (item: MenuItem) => {
    const saved = await saveMenuItem(item);
    setMenuItems((prev) => {
      const idx = prev.findIndex((i) => i.id === saved.id);
      if (idx >= 0) {
        const copy = [...prev];
        copy[idx] = saved;
        return copy;
      }
      return [saved, ...prev];
    });
  };

  const handleDeleteItem = async (id: string) => {
    await removeMenuItem(id);
    setMenuItems((prev) => prev.filter((i) => i.id !== id));
    setCart((prev) => prev.filter((ci) => ci.item.id !== id));
  };

  const handleToggleAvailability = async (item: MenuItem) => {
    const updated = { ...item, is_available: !item.is_available };
    await handleSaveItem(updated);
  };

  const handleToggleDailySpecial = async (item: MenuItem) => {
    const updated = { ...item, is_daily_special: !item.is_daily_special };
    await handleSaveItem(updated);
  };

  const totalCartCount = cart.reduce((sum, ci) => sum + ci.quantity, 0);
  const totalCartPrice = cart.reduce((sum, ci) => sum + ci.item.price * ci.quantity, 0);

  const scrollToMenu = () => {
    const el = document.getElementById('menu-section');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-stone-50 text-stone-900">
      
      {/* Navigation */}
      <Navbar
        cartCount={totalCartCount}
        onOpenCart={() => setIsCartOpen(true)}
        onOpenAdmin={() => setIsAdminOpen(true)}
      />

      {/* Hero Section */}
      <Hero onScrollToMenu={scrollToMenu} />

      {/* Main Menu Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        
        {/* Filters and Search */}
        <CategoryFilter
          activeCategory={activeCategory}
          onSelectCategory={setActiveCategory}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          onlyAvailable={onlyAvailable}
          onToggleOnlyAvailable={() => setOnlyAvailable(!onlyAvailable)}
          totalCount={filteredItems.length}
        />

        {/* Menu Grid */}
        {loading ? (
          <div className="py-20 text-center space-y-3">
            <div className="w-10 h-10 border-4 border-orange-600 border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-sm font-semibold text-stone-500">Cargando delicias caseras...</p>
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="py-16 text-center space-y-3 bg-white rounded-3xl border border-stone-200 p-8 max-w-md mx-auto">
            <ChefHat className="w-12 h-12 text-stone-300 mx-auto" />
            <h3 className="text-base font-bold text-stone-800">No encontramos platos con ese filtro</h3>
            <p className="text-xs text-stone-500">
              Prueba cambiando la categoría o borrando el término de búsqueda.
            </p>
            <button
              onClick={() => {
                setActiveCategory('todos');
                setSearchQuery('');
                setOnlyAvailable(false);
              }}
              className="px-4 py-2 rounded-xl bg-orange-600 text-white text-xs font-bold hover:bg-orange-700 shadow-xs cursor-pointer"
            >
              Ver todo el menú
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredItems.map((item) => {
              const inCart = cart.find((ci) => ci.item.id === item.id);
              return (
                <DishCard
                  key={item.id}
                  item={item}
                  cartQuantity={inCart ? inCart.quantity : 0}
                  onAddToCart={handleAddToCart}
                  onRemoveFromCart={handleRemoveFromCart}
                />
              );
            })}
          </div>
        )}

      </main>

      {/* Floating Bottom Bar on Mobile when Cart has items */}
      {totalCartCount > 0 && (
        <div className="fixed bottom-4 left-4 right-4 z-40 sm:hidden">
          <button
            onClick={() => setIsCartOpen(true)}
            className="w-full py-3.5 px-5 rounded-2xl bg-orange-600 active:bg-orange-700 text-white font-bold text-sm shadow-xl shadow-orange-600/30 flex items-center justify-between transition-all"
          >
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-white text-orange-600 text-xs font-black flex items-center justify-center">
                {totalCartCount}
              </span>
              <span>Ver mi Pedido</span>
            </div>
            <span>S/ {totalCartPrice.toFixed(2)}</span>
          </button>
        </div>
      )}

      {/* Cart Drawer Modal */}
      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        items={cart}
        onUpdateQuantity={handleUpdateCartQuantity}
        onRemoveItem={handleRemoveCartItem}
        onClearCart={handleClearCart}
      />

      {/* Admin Management Modal */}
      <AdminModal
        isOpen={isAdminOpen}
        onClose={() => setIsAdminOpen(false)}
        items={menuItems}
        onSaveItem={handleSaveItem}
        onDeleteItem={handleDeleteItem}
        onToggleAvailability={handleToggleAvailability}
        onToggleDailySpecial={handleToggleDailySpecial}
      />

      {/* Footer */}
      <footer className="bg-stone-900 text-stone-300 mt-20 border-t border-stone-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            
            {/* Brand Info */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-white">
                <span className="text-2xl font-black">
                  Menu<span className="text-orange-500">Liz</span>
                </span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-orange-600 text-white font-bold">
                  Restaurante
                </span>
              </div>
              <p className="text-xs text-stone-400 leading-relaxed max-w-sm">
                Cocina con cariño y sazón de hogar. Cada día un menú nuevo, balanceado y listo para disfrutar en nuestro local o en la comodidad de tu hogar.
              </p>
            </div>

            {/* Hours & Service */}
            <div className="space-y-3 text-xs">
              <h4 className="text-sm font-bold text-white uppercase tracking-wider">Horario de Atención</h4>
              <ul className="space-y-2 text-stone-400">
                <li className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-orange-500" />
                  <span>Lunes a Sábado: 11:30 AM - 4:30 PM</span>
                </li>
                <li className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-stone-600" />
                  <span>Domingos: 12:00 PM - 4:00 PM</span>
                </li>
              </ul>
            </div>

            {/* Location & Orders */}
            <div className="space-y-3 text-xs">
              <h4 className="text-sm font-bold text-white uppercase tracking-wider">Pedidos & Ubicación</h4>
              <ul className="space-y-2 text-stone-400">
                <li className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-orange-500" />
                  <span>Atención en salón, para llevar y delivery</span>
                </li>
                <li className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-orange-500" />
                  <span>Pedidos WhatsApp: +51 999 999 999</span>
                </li>
              </ul>
            </div>

          </div>

          <div className="mt-8 pt-8 border-t border-stone-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-stone-500">
            <p>© 2026 MenuLiz. Todos los derechos reservados.</p>
            <p className="flex items-center gap-1">
              Hecho con <Heart className="w-3.5 h-3.5 text-red-500 fill-red-500" /> para los amantes del buen menú.
            </p>
          </div>
        </div>
      </footer>

    </div>
  );
}
