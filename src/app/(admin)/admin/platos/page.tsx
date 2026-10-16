'use client';

import React, { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Dish, DishCategory } from '@/types';
import { CATEGORY_LABELS } from '@/lib/constants';
import { formatCurrency } from '@/lib/utils';
import { getDishImage, getLocalDishImage, DEFAULT_DISH_IMAGE } from '@/lib/dish-images';
import {
  UtensilsCrossed,
  Plus,
  Edit2,
  Trash2,
  Upload,
  Check,
  X,
  Search,
  Filter,
  AlertCircle,
  Eye,
  EyeOff,
} from 'lucide-react';

const INITIAL_DISHES: Dish[] = [
  {
    id: 'd1',
    name: 'Sopa Criolla Calientita',
    description: 'Sustanciosa sopa casera con carne de res molida, cabello de ángel, leche y huevo pochado.',
    price: 6.00,
    category: 'entrada',
    image_url: 'https://images.unsplash.com/photo-1547592166-23ac45744acd?auto=format&fit=crop&w=800&q=80',
    is_active: true,
  },
  {
    id: 'd2',
    name: 'Causa Rellena de Pollo',
    description: 'Masa suave de papa amarilla al limón y ají amarillo con pollo y palta fresca.',
    price: 6.00,
    category: 'entrada',
    image_url: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=800&q=80',
    is_active: true,
  },
  {
    id: 'd3',
    name: 'Tequeños con Guacamole (4 und)',
    description: 'Crocantes wantanes rellenos de queso fresco con salsa de palta criolla.',
    price: 6.00,
    category: 'entrada',
    image_url: 'https://images.unsplash.com/photo-1582169505937-b9992bd01ed9?auto=format&fit=crop&w=800&q=80',
    is_active: true,
  },
  {
    id: 'd4',
    name: 'Lomo Saltado al Wok',
    description: 'Trozos de lomo fino salteados con cebolla, tomate, ají amarillo, papas fritas y arroz.',
    price: 11.00,
    category: 'segundo',
    image_url: 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=800&q=80',
    is_active: true,
  },
  {
    id: 'd5',
    name: 'Ají de Gallina Casero',
    description: 'Pechuga deshilachada en crema de ají amarillo con papas nativas, huevo y aceituna.',
    price: 10.00,
    category: 'segundo',
    image_url: 'https://images.unsplash.com/photo-1565299585323-38d6b0865b47?auto=format&fit=crop&w=800&q=80',
    is_active: true,
  },
  {
    id: 'd6',
    name: 'Arroz con Pollo & Huancaína',
    description: 'Arroz graneado al culantro con presa dorada y crema huancaína tradicional.',
    price: 10.00,
    category: 'segundo',
    image_url: 'https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?auto=format&fit=crop&w=800&q=80',
    is_active: true,
  },
  {
    id: 'd7',
    name: 'Seco de Res con Frejoles',
    description: 'Carne macerada en chicha de jora y culantro con frejoles cremosos y sarsa criolla.',
    price: 11.00,
    category: 'segundo',
    image_url: 'https://images.unsplash.com/photo-1547496502-affa22d38842?auto=format&fit=crop&w=800&q=80',
    is_active: true,
  },
  {
    id: 'd8',
    name: 'Chicha Morada Natural (Vaso)',
    description: 'Preparada artesanalmente con maíz morado, piña, manzana y canela.',
    price: 3.00,
    category: 'refresco',
    image_url: 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?auto=format&fit=crop&w=800&q=80',
    is_active: true,
  },
  {
    id: 'd9',
    name: 'Refresco de Maracuyá (Vaso)',
    description: 'Jugo natural de pura pulpa de maracuyá bien frío.',
    price: 3.00,
    category: 'refresco',
    image_url: 'https://images.unsplash.com/photo-1621263764928-df1444c5e859?auto=format&fit=crop&w=800&q=80',
    is_active: true,
  },
  {
    id: 'd10',
    name: 'Bistec a lo Pobre Especial',
    description: 'Bistec jugoso con plátano frito, dos huevos montados, papas fritas y arroz.',
    price: 24.00,
    category: 'a_la_carta',
    image_url: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&w=800&q=80',
    is_active: true,
  },
];

export default function AdminPlatosPage() {
  const [dishes, setDishes] = useState<Dish[]>(INITIAL_DISHES);
  const [loading, setLoading] = useState(true);
  const [categoryFilter, setCategoryFilter] = useState<'todas' | DishCategory>('todas');
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDish, setEditingDish] = useState<Partial<Dish> | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);

  const supabase = createClient();

  useEffect(() => {
    async function fetchDishes() {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('dishes')
          .select('*')
          .order('category')
          .order('name');

        if (!error && data && data.length > 0) {
          setDishes(data as Dish[]);
        }
      } catch (err) {
        console.warn('Error fetching dishes, using default catalogue', err);
      } finally {
        setLoading(false);
      }
    }

    fetchDishes();
  }, []);

  // Upload image to Supabase Storage "dish-images" bucket
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingImage(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
      const filePath = `dishes/${fileName}`;

      const { data, error } = await supabase.storage
        .from('dish-images')
        .upload(filePath, file, { cacheControl: '3600', upsert: true });

      if (error) {
        throw error;
      }

      const { data: urlData } = supabase.storage
        .from('dish-images')
        .getPublicUrl(filePath);

      setEditingDish((prev) => ({
        ...prev,
        image_url: urlData.publicUrl,
      }));
    } catch (err) {
      console.warn('Supabase storage upload error, using local object URL', err);
      // Fallback preview
      const localUrl = URL.createObjectURL(file);
      setEditingDish((prev) => ({
        ...prev,
        image_url: localUrl,
      }));
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSaveDish = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingDish || !editingDish.name || !editingDish.price) return;

    const isUuid = (value?: string) =>
      !!value && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value);

    const dishPayload: {
      name: string;
      description: string;
      price: number;
      category: DishCategory;
      image_url: string;
      is_active: boolean;
      id?: string;
    } = {
      name: editingDish.name,
      description: editingDish.description || '',
      price: Number(editingDish.price),
      category: (editingDish.category as DishCategory) || 'segundo',
      image_url:
        editingDish.image_url ||
        getLocalDishImage(editingDish.name || '') ||
        DEFAULT_DISH_IMAGE,
      is_active: editingDish.is_active !== undefined ? editingDish.is_active : true,
    };

    // Solo enviar id si es un UUID válido (edición de un plato existente en Supabase).
    // Para platos nuevos (o ids locales antiguos como dish-...) eliminamos el id
    // para que la base de datos genere un UUID y evitar el error 22P02.
    if (isUuid(editingDish.id)) {
      dishPayload.id = editingDish.id;
    } else {
      delete dishPayload.id;
    }

    let savedDish: Dish = {
      id: editingDish.id || `local-${Date.now()}`,
      name: dishPayload.name,
      description: dishPayload.description,
      price: dishPayload.price,
      category: dishPayload.category,
      image_url: dishPayload.image_url,
      is_active: dishPayload.is_active,
    };

    // Try Supabase insert/upsert
    try {
      const { data, error: saveErr } = await supabase
        .from('dishes')
        .upsert(dishPayload)
        .select()
        .single();

      if (saveErr) {
        console.error('Error guardando plato en Supabase:', saveErr);
        alert(`No se pudo guardar el plato en Supabase.\n${saveErr.message || 'Error'}${saveErr.code ? ` (Código: ${saveErr.code})` : ''}`);
        return;
      }

      if (data) {
        savedDish = data as Dish;
      }
    } catch (err) {
      console.error('Supabase dish upsert failed, updating state locally', err);
    }

    // Update state
    setDishes((prev) => {
      const targetId = isUuid(editingDish.id) ? editingDish.id! : savedDish.id;
      const idx = prev.findIndex((d) => d.id === targetId || d.id === editingDish.id);
      if (idx >= 0) {
        const copy = [...prev];
        copy[idx] = savedDish;
        return copy;
      }
      return [savedDish, ...prev];
    });

    setIsModalOpen(false);
    setEditingDish(null);
  };

  const handleToggleActive = async (dish: Dish) => {
    const updated = { ...dish, is_active: !dish.is_active };
    try {
      await supabase.from('dishes').update({ is_active: updated.is_active }).eq('id', dish.id);
    } catch {
      // ignore
    }
    setDishes((prev) => prev.map((d) => (d.id === dish.id ? updated : d)));
  };

  const handleDeleteDish = async (id: string, name: string) => {
    if (!confirm(`¿Estás segura de eliminar el plato "${name}"?`)) return;

    try {
      await supabase.from('dishes').delete().eq('id', id);
    } catch {
      // ignore
    }
    setDishes((prev) => prev.filter((d) => d.id !== id));
  };

  // Filtered dishes
  const filteredDishes = dishes.filter((dish) => {
    if (categoryFilter !== 'todas' && dish.category !== categoryFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        dish.name.toLowerCase().includes(q) ||
        (dish.description && dish.description.toLowerCase().includes(q))
      );
    }
    return true;
  });

  return (
    <div className="space-y-6">
      
      {/* Title & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-stone-900 tracking-tight">
            Catálogo de Platos
          </h1>
          <p className="text-xs sm:text-sm text-stone-500 mt-1">
            Gestiona los platos disponibles, precios y fotos del restaurante
          </p>
        </div>

        <button
          onClick={() => {
            setEditingDish({
              category: 'segundo',
              is_active: true,
              price: 10,
              image_url: '',
            });
            setIsModalOpen(true);
          }}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs sm:text-sm shadow-md shadow-orange-500/25 transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Nuevo Plato</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
        
        {/* Search */}
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
          <input
            type="text"
            placeholder="Buscar por nombre o descripción..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 rounded-xl border border-stone-200 bg-white text-xs sm:text-sm focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 shadow-xs"
          />
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
          <button
            onClick={() => setCategoryFilter('todas')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
              categoryFilter === 'todas'
                ? 'bg-stone-900 text-white shadow-xs'
                : 'bg-white text-stone-600 border border-stone-200 hover:bg-stone-50'
            }`}
          >
            Todas ({dishes.length})
          </button>

          {(['entrada', 'segundo', 'refresco', 'a_la_carta'] as DishCategory[]).map((cat) => (
            <button
              key={cat}
              onClick={() => setCategoryFilter(cat)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                categoryFilter === cat
                  ? 'bg-orange-500 text-white shadow-xs'
                  : 'bg-white text-stone-600 border border-stone-200 hover:bg-stone-50'
              }`}
            >
              {CATEGORY_LABELS[cat]}
            </button>
          ))}
        </div>

      </div>

      {/* Dishes Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredDishes.map((dish) => (
          <div
            key={dish.id}
            className={`bg-white rounded-3xl border overflow-hidden shadow-xs flex flex-col justify-between transition-all ${
              dish.is_active ? 'border-stone-200' : 'border-stone-200/50 opacity-60 bg-stone-50'
            }`}
          >
            <div>
              {/* Photo */}
              <div className="relative h-44 w-full bg-stone-100 overflow-hidden">
                <img
                  src={getDishImage(dish.name, dish.image_url)}
                  alt={dish.name}
                  className={`w-full h-full object-cover ${dish.is_active ? '' : 'grayscale'}`}
                  loading="lazy"
                />
                
                {/* Category badge */}
                <span className="absolute top-3 left-3 px-2.5 py-1 rounded-lg bg-stone-900/80 backdrop-blur-xs text-white text-[11px] font-bold">
                  {CATEGORY_LABELS[dish.category] || dish.category}
                </span>

                {/* Price Tag */}
                <span className="absolute bottom-3 right-3 px-3 py-1 rounded-xl bg-white/95 backdrop-blur-xs text-stone-900 text-xs font-black shadow-md">
                  {formatCurrency(dish.price)}
                </span>
              </div>

              {/* Info */}
              <div className="p-5">
                <div className="flex items-center justify-between gap-2">
                  <h3 className="text-base font-bold text-stone-900">{dish.name}</h3>
                  <span
                    className={`w-2.5 h-2.5 rounded-full shrink-0 ${
                      dish.is_active ? 'bg-emerald-500' : 'bg-stone-300'
                    }`}
                    title={dish.is_active ? 'Activo en el catálogo' : 'Inactivo'}
                  />
                </div>
                {dish.description && (
                  <p className="text-xs text-stone-500 mt-1 line-clamp-2 leading-relaxed">
                    {dish.description}
                  </p>
                )}
              </div>
            </div>

            {/* Actions Bar */}
            <div className="p-4 bg-stone-50/80 border-t border-stone-100 flex items-center justify-between">
              {/* Active Toggle */}
              <button
                onClick={() => handleToggleActive(dish)}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  dish.is_active
                    ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                    : 'bg-stone-200 text-stone-600 hover:bg-stone-300'
                }`}
              >
                {dish.is_active ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                <span>{dish.is_active ? 'Activo' : 'Inactivo'}</span>
              </button>

              <div className="flex items-center gap-1">
                <button
                  onClick={() => {
                    setEditingDish(dish);
                    setIsModalOpen(true);
                  }}
                  className="p-2 rounded-xl text-stone-500 hover:text-stone-900 hover:bg-white border border-transparent hover:border-stone-200 transition-all cursor-pointer"
                  title="Editar plato"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDeleteDish(dish.id, dish.name)}
                  className="p-2 rounded-xl text-stone-400 hover:text-red-600 hover:bg-red-50 transition-all cursor-pointer"
                  title="Eliminar plato"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>

          </div>
        ))}
      </div>

      {/* Create / Edit Modal */}
      {isModalOpen && editingDish && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-stone-200 space-y-5 my-8">
            
            <div className="flex items-center justify-between border-b border-stone-100 pb-3">
              <h3 className="text-lg font-bold text-stone-900">
                {editingDish.id?.startsWith('dish-') ? 'Crear Nuevo Plato' : 'Editar Plato'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 rounded-xl text-stone-400 hover:text-stone-700 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveDish} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">Nombre del Plato *</label>
                <input
                  type="text"
                  required
                  placeholder="Ej: Seco de Res con Frejoles"
                  value={editingDish.name || ''}
                  onChange={(e) => setEditingDish({ ...editingDish, name: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 text-xs sm:text-sm focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 shadow-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">Precio Individual (S/) *</label>
                  <input
                    type="number"
                    step="0.50"
                    required
                    placeholder="11.00"
                    value={editingDish.price ?? ''}
                    onChange={(e) => setEditingDish({ ...editingDish, price: parseFloat(e.target.value) })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 text-xs sm:text-sm focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 shadow-xs"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">Categoría</label>
                  <select
                    value={editingDish.category || 'segundo'}
                    onChange={(e) => setEditingDish({ ...editingDish, category: e.target.value as DishCategory })}
                    className="w-full px-3 py-2.5 rounded-xl border border-stone-200 text-xs sm:text-sm focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 shadow-xs bg-white"
                  >
                    <option value="entrada">🥗 Entrada</option>
                    <option value="segundo">🍛 Segundo</option>
                    <option value="refresco">🥤 Refresco</option>
                    <option value="a_la_carta">📋 A la Carta</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">Descripción</label>
                <textarea
                  rows={2}
                  placeholder="Ingredientes principales, guarniciones y preparación..."
                  value={editingDish.description || ''}
                  onChange={(e) => setEditingDish({ ...editingDish, description: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl border border-stone-200 text-xs sm:text-sm focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 shadow-xs"
                />
              </div>

              {/* Photo Upload & URL */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-stone-700">Foto del Plato</label>
                
                <div className="flex items-center gap-3">
                  {editingDish.image_url && (
                    <img
                      src={editingDish.image_url}
                      alt="Preview"
                      className="w-16 h-16 rounded-xl object-cover border border-stone-200 shrink-0"
                    />
                  )}
                  <div className="flex-1 space-y-1.5">
                    <input
                      type="url"
                      placeholder="https://images.unsplash.com/..."
                      value={editingDish.image_url || ''}
                      onChange={(e) => setEditingDish({ ...editingDish, image_url: e.target.value })}
                      className="w-full px-3 py-1.5 rounded-xl border border-stone-200 text-xs shadow-xs"
                    />
                    
                    <label className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-stone-200 text-[11px] font-bold text-stone-700 hover:bg-stone-50 cursor-pointer shadow-xs">
                      <Upload className="w-3.5 h-3.5 text-orange-500" />
                      <span>{uploadingImage ? 'Subiendo imagen...' : 'Subir foto a Supabase'}</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="hidden"
                      />
                    </label>
                  </div>
                </div>
              </div>

              {/* Active Toggle */}
              <div className="pt-2">
                <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-stone-700 select-none">
                  <input
                    type="checkbox"
                    checked={editingDish.is_active ?? true}
                    onChange={(e) => setEditingDish({ ...editingDish, is_active: e.target.checked })}
                    className="w-4 h-4 accent-orange-500 rounded cursor-pointer"
                  />
                  <span>Plato Activo (disponible para el menú o carta)</span>
                </label>
              </div>

              {/* Form buttons */}
              <div className="flex items-center justify-end gap-2 pt-4 border-t border-stone-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-stone-200 text-xs font-bold text-stone-600 hover:bg-stone-50 cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold shadow-md shadow-orange-500/25 cursor-pointer"
                >
                  Guardar Plato
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

    </div>
  );
}
