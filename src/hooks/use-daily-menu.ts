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

      if (fetchErr) {
        // Error real de red/servidor: conservamos el seed local para no dejar
        // la pantalla vacía por un fallo temporal de conexión.
        setError(fetchErr.message);
        return;
      }

      // El menú del día guardado por el admin es la ÚNICA fuente de verdad.
      // Si no hay ninguna fila para hoy, significa que NO hay platos publicados
      // (el admin deshabilitó todo), así que no se muestra nada y no se puede pedir.
      // Antes se caía a "todos los platos activos" y por eso se podía pedir igual.
      const mapped: DailyDishItem[] = (data || [])
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