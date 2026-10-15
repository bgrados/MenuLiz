'use client';

import { useState, useEffect } from 'react';
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
  // Entradas
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
    id: 'd0000001-0000-0000-0000-000000000003',
    name: 'Tequeños con Guacamole (4 und)',
    description: 'Crocantes wantanes rellenos de queso fresco andino derretido con salsa de palta criolla.',
    price: 6.00,
    category: 'entrada',
    image_url: 'https://images.unsplash.com/photo-1582169505937-b9992bd01ed9?auto=format&fit=crop&w=800&q=80',
    stock: 0,
    is_available: false,
  },

  // Segundos
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
    id: 'd0000002-0000-0000-0000-000000000002',
    name: 'Ají de Gallina Casero',
    description: 'Pechuga deshilachada en suave crema de ají amarillo con papas nativas, huevo y aceituna.',
    price: 10.00,
    category: 'segundo',
    image_url: 'https://images.unsplash.com/photo-1565299585323-38d6b0865b47?auto=format&fit=crop&w=800&q=80',
    stock: 10,
    is_available: true,
  },
  {
    id: 'd0000002-0000-0000-0000-000000000003',
    name: 'Arroz con Pollo & Huancaína',
    description: 'Arroz graneado al culantro con presa dorada y crema huancaína tradicional.',
    price: 10.00,
    category: 'segundo',
    image_url: 'https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?auto=format&fit=crop&w=800&q=80',
    stock: 14,
    is_available: true,
  },
  {
    id: 'd0000002-0000-0000-0000-000000000004',
    name: 'Seco de Res con Frejoles',
    description: 'Carne macerada en chicha de jora y culantro con frejoles cremosos y sarsa criolla.',
    price: 11.00,
    category: 'segundo',
    image_url: 'https://images.unsplash.com/photo-1547496502-affa22d38842?auto=format&fit=crop&w=800&q=80',
    stock: 6,
    is_available: true,
  },
  {
    id: 'd0000002-0000-0000-0000-000000000005',
    name: 'Milanesa de Pollo Crujiente',
    description: 'Pechuga apanada dorada con papas fritas, arroz blanco y ensalada fresca.',
    price: 10.00,
    category: 'segundo',
    image_url: 'https://images.unsplash.com/photo-1598515214211-89d3c73ae83b?auto=format&fit=crop&w=800&q=80',
    stock: 0,
    is_available: false,
  },

  // Refrescos
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
  {
    id: 'd0000003-0000-0000-0000-000000000002',
    name: 'Refresco de Maracuyá (Vaso)',
    description: 'Jugo natural de pura pulpa de maracuyá bien frío.',
    price: 3.00,
    category: 'refresco',
    image_url: 'https://images.unsplash.com/photo-1621263764928-df1444c5e859?auto=format&fit=crop&w=800&q=80',
    stock: 18,
    is_available: true,
  },

  // A la Carta
  {
    id: 'd0000004-0000-0000-0000-000000000001',
    name: 'Bistec a lo Pobre Especial',
    description: 'Bistec jugoso con plátano frito, dos huevos montados, papas fritas y arroz.',
    price: 24.00,
    category: 'a_la_carta',
    image_url: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&w=800&q=80',
    stock: 8,
    is_available: true,
  },
  {
    id: 'd0000004-0000-0000-0000-000000000002',
    name: 'Ceviche Mixto Carretillero',
    description: 'Pescado fresco y mariscos marinados al limón norteño con camote, choclo y canchita.',
    price: 26.00,
    category: 'a_la_carta',
    image_url: 'https://images.unsplash.com/photo-1535399831218-d5bd36d1a6b3?auto=format&fit=crop&w=800&q=80',
    stock: 5,
    is_available: true,
  },
  {
    id: 'd0000004-0000-0000-0000-000000000003',
    name: 'Tallarines Verdes con Churrasco',
    description: 'Fideos bañados en crema de espinaca, albahaca y queso con churrasco a la plancha.',
    price: 22.00,
    category: 'a_la_carta',
    image_url: 'https://images.unsplash.com/photo-1551183053-bf91a1d81141?auto=format&fit=crop&w=800&q=80',
    stock: 6,
    is_available: true,
  },
];

export function useDailyMenu() {
  const [items, setItems] = useState<DailyDishItem[]>(SEED_DAILY_DISHES);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const supabase = createClient();

  useEffect(() => {
    async function fetchMenu() {
      try {
        setLoading(true);
        const todayStr = new Date().toISOString().split('T')[0];

        // Fetch daily menus with joined dishes
        const { data, error: fetchErr } = await supabase
          .from('daily_menus')
          .select(`
            id,
            date,
            stock,
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
        } else {
          // If no specific daily menu row for today yet, check general dishes table
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
          } else {
            // Use resilient seed
            setItems(SEED_DAILY_DISHES);
          }
        }
      } catch (err: unknown) {
        console.warn('Error fetching daily menu from Supabase, using local seed:', err);
        setError(err instanceof Error ? err.message : 'Error al cargar el menú');
        setItems(SEED_DAILY_DISHES);
      } finally {
        setLoading(false);
      }
    }

    fetchMenu();
  }, []);

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
