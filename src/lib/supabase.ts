import { createClient } from '@supabase/supabase-js';
import { MenuItem } from '@/types/menu';
import { INITIAL_MENU_ITEMS } from '@/data/initialMenu';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://zwdfwasdmlsjunpezhsm.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'sb_publishable_794mkDhmQwvlaVLFin2FwA_DMcSNLc4';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

const LOCAL_STORAGE_KEY = 'menuliz_items_cache';

export async function fetchMenuItems(): Promise<MenuItem[]> {
  try {
    const { data, error } = await supabase
      .from('menu_items')
      .select('*')
      .order('is_daily_special', { ascending: false })
      .order('name', { ascending: true });

    if (!error && data && data.length > 0) {
      if (typeof window !== 'undefined') {
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(data));
      }
      return data as MenuItem[];
    }
  } catch (err) {
    console.warn('Supabase fetch failed, checking local cache or defaults', err);
  }

  // Fallback to local storage if available
  if (typeof window !== 'undefined') {
    const cached = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (cached) {
      try {
        return JSON.parse(cached);
      } catch {
        // ignore parse error
      }
    }
  }

  return INITIAL_MENU_ITEMS;
}

export async function saveMenuItem(item: MenuItem): Promise<MenuItem> {
  // Try Supabase first
  try {
    const { data, error } = await supabase
      .from('menu_items')
      .upsert(item)
      .select()
      .single();

    if (!error && data) {
      return data as MenuItem;
    }
  } catch (err) {
    console.warn('Supabase save error, persisting locally', err);
  }

  // Update in local cache
  if (typeof window !== 'undefined') {
    const cached = localStorage.getItem(LOCAL_STORAGE_KEY);
    let items: MenuItem[] = cached ? JSON.parse(cached) : INITIAL_MENU_ITEMS;
    const index = items.findIndex((i) => i.id === item.id);
    if (index >= 0) {
      items[index] = item;
    } else {
      items = [item, ...items];
    }
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(items));
  }

  return item;
}

export async function removeMenuItem(id: string): Promise<boolean> {
  try {
    await supabase.from('menu_items').delete().eq('id', id);
  } catch (err) {
    console.warn('Supabase delete error', err);
  }

  if (typeof window !== 'undefined') {
    const cached = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (cached) {
      const items: MenuItem[] = JSON.parse(cached);
      const filtered = items.filter((i) => i.id !== id);
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(filtered));
    }
  }

  return true;
}
