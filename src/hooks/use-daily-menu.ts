'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { DailyDishItem, DishCategory } from '@/types';
import { createClient } from '@/lib/supabase/client';

export interface GroupedMenu {
  entradas: DailyDishItem[];
  segundos: DailyDishItem[];
  refrescos: DailyDishItem[];
  a_la_carta: DailyDishItem[];
}

// Fallback seed items for instant preview and offline resilience
const SEED_DAILY_DISHES: DailyDishItem[] = [
  {
    id: 'd0000001-0000-0000-0000-000000000001',
    name: 'Sopa Criolla Calientita',
    description: 'Sustanciosa sopa casera con carne de res molida, cabello de ángel, leche y huevo pochado.',
    price: 6.00,
    category: 'entrada',
    image_url: 'https://images.unsplash.com/photo-1547592166-23ac45744acd?auto=format&fit=crop&w=800&q=80',
    stock: 12,
    is_available: true,
  },
  {
    id: 'd0000001-0000-0000-0000-000000000002',
    name: 'Causa Rellena de Pollo',
    description: 'Masa suave de papa amarilla al limón y ají amarillo con pechuga de pollo y palta fresca.',
    price: 6.00,
    category: 'entrada',
    image_url: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=800&q=80',
    stock: 8,
    is_available: true,
  },
  {
    id: 'd0000002-0000-0000-0000-000000000001',
    name: 'Lomo Saltado al Wok',
    description: 'Trozos de lomo fino salteados con cebolla crocante, tomate, ají amarillo, papas fritas y arroz.',
    price: 11.00,
    category: 'segundo',
    image_url: 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=800&q=80',
    stock: 15,
    is_available: true,
  },
  {
    id: 'd0000003-0000-0000-0000-000000000001',
    name: 'Chicha Morada Natural (Vaso)',
    description: 'Preparada artesanalmente con maíz morado selecto, piña, manzana y canela.',
    price: 3.00,
    category: 'refresco',
    image_url: 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?auto=format&fit=crop&w=800&q=80',
    stock: 25,
    is_available: true,
  },
];

export function useDailyMenu() {
  const [items, setItems] = useState<DailyDishItem[]>(SEED_DAILY_DISHES);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const supabase = useMemo(() => createClient(), []);
  const todayStr = useMemo(() => new Date().toISOString().split('T')[0], []);

  const fetchMenu = useCallback(async () => {
    try {
      const { data, error: fetchErr } = await supabase
        .from('daily_menus')
        .select(`
          id,
          date,
          stock,
          initial_stock,
          is_available,
          dishes (
            id,
            name,
            description,
            price,
            category,
            image_url,
            is_active
          )
        `)
        .eq('date', todayStr);

      if (!fetchErr && data && data.length > 0) {
        const mapped: DailyDishItem[] = data
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          .filter((row: any) => row.dishes && row.dishes.is_active)
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          .map((row: any) => ({
            id: row.dishes.id,
            daily_menu_id: row.id,
            name: row.dishes.name,
            description: row.dishes.description,
            price: Number(row.dishes.price),
            category: row.dishes.category as DishCategory,
            image_url: row.dishes.image_url,
            stock: row.stock,
            is_available: row.is_available && row.stock > 0,
          }));

        setItems(mapped);
        return;
      }

      // If no daily menu row, fall back to all active dishes (stock 10)
      const { data: dishesData, error: dishesErr } = await supabase
        .from('dishes')
        .select('*')
        .eq('is_active', true);

      if (!dishesErr && dishesData && dishesData.length > 0) {
        const mappedDishes: DailyDishItem[] = dishesData.map((d) => ({
          id: d.id,
          name: d.name,
          description: d.description,
          price: Number(d.price),
          category: d.category as DishCategory,
          image_url: d.image_url,
          stock: 10,
          is_available: true,
        }));
        setItems(mappedDishes);
      }
    } catch (err: unknown) {
      console.warn('Error fetching daily menu from Supabase, using local seed:', err);
      setError(err instanceof Error ? err.message : 'Error al cargar el menú');
    } finally {
      setLoading(false);
    }
  }, [supabase, todayStr]);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      await fetchMenu();
    }
    load();

    const channel = supabase
      .channel(`menu-live-${todayStr}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'daily_menus', filter: `date=eq.${todayStr}` },
        () => {
          if (!cancelled) void fetchMenu();
        }
      )
      .subscribe();

    const handleVisibility = () => {
      if (!cancelled && !document.hidden) void fetchMenu();
    };
    document.addEventListener('visibilitychange', handleVisibility);

    return () => {
      cancelled = true;
      supabase.removeChannel(channel);
      document.removeEventListener('visibilitychange', handleVisibility);
    };
  }, [fetchMenu, supabase, todayStr]);

  const grouped: GroupedMenu = {
    entradas: items.filter((i) => i.category === 'entrada'),
    segundos: items.filter((i) => i.category === 'segundo'),
    refrescos: items.filter((i) => i.category === 'refresco'),
    a_la_carta: items.filter((i) => i.category === 'a_la_carta'),
  };

  return {
    items,
    grouped,
    loading,
    error,
  };
}