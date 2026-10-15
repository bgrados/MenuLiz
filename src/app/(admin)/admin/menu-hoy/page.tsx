'use client';

import React, { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Dish, DishCategory } from '@/types';
import { CATEGORY_LABELS, MENU_PRICE } from '@/lib/constants';
import { formatCurrency, formatDateSpanish } from '@/lib/utils';
import {
  CalendarDays,
  Save,
  CheckCircle2,
  Sparkles,
  Smartphone,
  Eye,
  AlertCircle,
  Plus,
} from 'lucide-react';

interface MenuSelectionState {
  [dishId: string]: {
    selected: boolean;
    stock: number;
  };
}

export default function AdminMenuHoyPage() {
  const [selectedDate, setSelectedDate] = useState(() => {
    return new Date().toISOString().split('T')[0];
  });
  const [dishes, setDishes] = useState<Dish[]>([]);
  const [selection, setSelection] = useState<MenuSelectionState>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [showPreview, setShowPreview] = useState(true);
  const [initialStock, setInitialStock] = useState<Record<string, number>>({});

  const supabase = createClient();

  // Load active dishes and existing daily menu for selectedDate
  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        // 1. Fetch active dishes
        const { data: dishesData, error: dishesErr } = await supabase
          .from('dishes')
          .select('*')
          .eq('is_active', true)
          .neq('category', 'a_la_carta')
          .order('name');

        let loadedDishes: Dish[] = [];
        if (!dishesErr && dishesData && dishesData.length > 0) {
          loadedDishes = dishesData as Dish[];
        } else {
          // Fallback dishes
          loadedDishes = [
            { id: 'd1', name: 'Sopa Criolla Calientita', price: 6, category: 'entrada', is_active: true, description: 'Sopa casera con carne y huevo pochado' },
            { id: 'd2', name: 'Causa Rellena de Pollo', price: 6, category: 'entrada', is_active: true, description: 'Papa amarilla con pollo y palta' },
            { id: 'd3', name: 'Tequeños con Guacamole (4 und)', price: 6, category: 'entrada', is_active: true, description: 'Wantanes crocantes con queso fresco' },
            { id: 'd4', name: 'Lomo Saltado al Wok', price: 11, category: 'segundo', is_active: true, description: 'Lomo fino con papas y arroz' },
            { id: 'd5', name: 'Ají de Gallina Casero', price: 10, category: 'segundo', is_active: true, description: 'Crema de ají amarillo con papas y huevo' },
            { id: 'd6', name: 'Arroz con Pollo & Huancaína', price: 10, category: 'segundo', is_active: true, description: 'Arroz al culantro con papa a la huancaína' },
            { id: 'd7', name: 'Seco de Res con Frejoles', price: 11, category: 'segundo', is_active: true, description: 'Carne al culantro con frejoles cremosos' },
            { id: 'd8', name: 'Chicha Morada Natural (Vaso)', price: 3, category: 'refresco', is_active: true, description: 'Elaborada con maíz morado y frutas' },
            { id: 'd9', name: 'Refresco de Maracuyá (Vaso)', price: 3, category: 'refresco', is_active: true, description: 'Pura fruta refrescante' },
          ];
        }
        setDishes(loadedDishes);

        // 2. Fetch existing daily_menus for date
        const { data: menuData, error: menuErr } = await supabase
          .from('daily_menus')
          .select('*')
          .eq('date', selectedDate);

        const initialSelection: MenuSelectionState = {};
        const initialStockMap: Record<string, number> = {};
        // Initialize all as unselected with default stock 15
        loadedDishes.forEach((d) => {
          initialSelection[d.id] = { selected: false, stock: 15 };
        });

        if (!menuErr && menuData && menuData.length > 0) {
          menuData.forEach((row: { dish_id: string; stock: number; initial_stock?: number; is_available: boolean }) => {
            initialSelection[row.dish_id] = {
              selected: true,
              stock: row.stock,
            };
            initialStockMap[row.dish_id] = Number(row.initial_stock ?? row.stock);
          });
        } else {
          // Preselect all dishes by default if no configuration yet
          loadedDishes.forEach((d) => {
            initialSelection[d.id] = { selected: true, stock: 15 };
            initialStockMap[d.id] = 15;
          });
        }

        setSelection(initialSelection);
        setInitialStock(initialStockMap);
      } catch (err) {
        console.error('Error loading daily menu config', err);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [selectedDate]);

  const handleToggleDish = (dishId: string) => {
    setSelection((prev) => ({
      ...prev,
      [dishId]: {
        selected: !prev[dishId]?.selected,
        stock: prev[dishId]?.stock ?? 15,
      },
    }));
  };

  const handleStockChange = (dishId: string, val: number) => {
    setSelection((prev) => ({
      ...prev,
      [dishId]: {
        selected: prev[dishId]?.selected ?? true,
        stock: Math.max(0, val),
      },
    }));
  };

  const handleSaveMenu = async () => {
    setSaving(true);
    setSavedSuccess(false);

    try {
      const selectedDishIds = Object.keys(selection).filter((id) => selection[id]?.selected);

      // Leer configuración previa para preservar stock inicial/vendidos
      const { data: existingRows } = await supabase
        .from('daily_menus')
        .select('dish_id, initial_stock, stock')
        .eq('date', selectedDate);

      const existingMap = new Map((existingRows || []).map((r) => [r.dish_id, r]));

      // Eliminar platos deseleccionados
      if (selectedDishIds.length > 0) {
        await supabase
          .from('daily_menus')
          .delete()
          .eq('date', selectedDate)
          .not('dish_id', 'in', `(${selectedDishIds.join(',')})`);
      } else {
        await supabase.from('daily_menus').delete().eq('date', selectedDate);
      }

      // Actualizar/insertar platos seleccionados preservando stock inicial cuando exista
      for (const dishId of selectedDishIds) {
        const enteredStock = selection[dishId].stock;
        const existing = existingMap.get(dishId);
        const initial = existing?.initial_stock && existing.initial_stock > 0
          ? Math.max(Number(existing.initial_stock), enteredStock)
          : enteredStock;

        const payload = {
          date: selectedDate,
          dish_id: dishId,
          stock: enteredStock,
          initial_stock: initial,
          is_available: enteredStock > 0,
        };

        const { error: upErr } = await supabase
          .from('daily_menus')
          .upsert(payload, { onConflict: 'date,dish_id' });

        if (upErr) throw upErr;
      }

      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
    } catch (err) {
      console.error('Error guardando menú del día en Supabase:', err);
      alert('No se pudo guardar el menú del día. Revisa la consola.');
    } finally {
      setSaving(false);
    }
  };

  // Suscripción en tiempo real al stock del menú del día seleccionado
  useEffect(() => {
    const channel = supabase
      .channel(`stock-${selectedDate}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'daily_menus', filter: `date=eq.${selectedDate}` },
        (payload) => {
          const row = (payload.new ?? payload.old) as { dish_id?: string; stock?: number; initial_stock?: number; is_available?: boolean };
          if (!row?.dish_id) return;
          const realtimeDishId = row.dish_id;

          setSelection((prev) => {
            const next = { ...prev };
            if (payload.eventType === 'DELETE') {
              const existed = next[realtimeDishId];
              if (existed) next[realtimeDishId] = { selected: false, stock: existed.stock };
              return next;
            }
            if (payload.new) {
              const nr = payload.new as { dish_id: string; stock: number; is_available: boolean };
              if (next[nr.dish_id]) {
                next[nr.dish_id] = { selected: true, stock: Number(nr.stock ?? 0) };
              }
            }
            return next;
          });

          if (payload.new) {
            const nr = payload.new as { dish_id: string; initial_stock?: number; stock: number };
            setInitialStock((prev) => {
              if (prev[nr.dish_id] === undefined) {
                return { ...prev, [nr.dish_id]: Number(nr.initial_stock ?? nr.stock) };
              }
              return prev;
            });
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [selectedDate, supabase]);

  const entradas = dishes.filter((d) => d.category === 'entrada');
  const segundos = dishes.filter((d) => d.category === 'segundo');
  const refrescos = dishes.filter((d) => d.category === 'refresco');

  const selectedEntradas = entradas.filter((d) => selection[d.id]?.selected);
  const selectedSegundos = segundos.filter((d) => selection[d.id]?.selected);
  const selectedRefrescos = refrescos.filter((d) => selection[d.id]?.selected);

  return (
    <div className="space-y-6">
      
      {/* Title & Date Picker Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-stone-200 shadow-xs">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-stone-900 tracking-tight">
            Configuración del Menú Diario
          </h1>
          <p className="text-xs sm:text-sm text-stone-500 mt-1">
            Selecciona qué platos van hoy y define el stock de porciones disponibles
          </p>
        </div>

        {/* Date Selector */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-stone-50 border border-stone-200 px-3.5 py-2 rounded-xl text-xs font-bold text-stone-700">
            <CalendarDays className="w-4 h-4 text-orange-500" />
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="bg-transparent focus:outline-hidden font-bold text-stone-900 cursor-pointer"
            />
          </div>

          <button
            onClick={handleSaveMenu}
            disabled={saving}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs sm:text-sm shadow-md shadow-orange-500/25 transition-all cursor-pointer disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            <span>{saving ? 'Guardando...' : 'Guardar Menú'}</span>
          </button>
        </div>
      </div>

      {savedSuccess && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>¡Menú del día guardado correctamente! Los clientes ya pueden ver los platos y stock actualizados.</span>
        </div>
      )}

      {/* Grid: Editor Left + Preview Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Editor Form Column */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* Helper alert */}
          <div className="p-4 rounded-2xl bg-orange-50 border border-orange-200 text-orange-950 text-xs flex items-center justify-between gap-3">
            <div>
              <p className="font-bold">Regla del Menú:</p>
              <p className="text-stone-600 mt-0.5">
                Recomendamos activar 2-3 entradas, 4-5 segundos y 1-2 refrescos para el Combo de S/ {MENU_PRICE.toFixed(2)}.
              </p>
            </div>
            <div className="text-right shrink-0">
              <span className="font-mono text-xs font-black text-orange-600 block">
                {selectedEntradas.length}E / {selectedSegundos.length}S / {selectedRefrescos.length}R
              </span>
            </div>
          </div>

          {/* Group: Entradas */}
          <div className="bg-white rounded-3xl border border-stone-200 p-5 shadow-xs space-y-3">
            <h3 className="text-sm font-black text-stone-900 uppercase tracking-wider flex items-center justify-between">
              <span>{CATEGORY_LABELS.entrada}</span>
              <span className="text-xs text-stone-400 font-bold lowercase">
                {selectedEntradas.length} seleccionadas
              </span>
            </h3>

            <div className="divide-y divide-stone-100">
              {entradas.map((dish) => {
                const isSelected = selection[dish.id]?.selected ?? false;
                const stock = selection[dish.id]?.stock ?? 15;

                return (
                  <div key={dish.id} className="py-3 flex items-center justify-between gap-3">
                    <label className="flex items-center gap-3 cursor-pointer flex-1 min-w-0 select-none">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => handleToggleDish(dish.id)}
                        className="w-4 h-4 accent-orange-500 rounded cursor-pointer shrink-0"
                      />
                      <div className="min-w-0">
                        <h4 className={`text-xs sm:text-sm font-bold truncate ${isSelected ? 'text-stone-900' : 'text-stone-400'}`}>
                          {dish.name}
                        </h4>
                        <span className="text-[11px] text-stone-400">{formatCurrency(dish.price)}</span>
                      </div>
                    </label>

                    {isSelected && (
                      <div className="flex items-center gap-1.5 shrink-0">
                        <span className="text-[11px] text-stone-400 font-bold">Stock:</span>
                        <input
                          type="number"
                          min="0"
                          value={stock}
                          onChange={(e) => handleStockChange(dish.id, parseInt(e.target.value) || 0)}
                          className="w-16 px-2 py-1 rounded-lg border border-stone-200 text-xs font-bold text-center bg-stone-50"
                        />
                        <span className="text-[10px] text-stone-500 font-bold whitespace-nowrap">
                          Vendido: {Math.max(0, (initialStock[dish.id] ?? stock) - stock)}
                        </span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Group: Segundos */}
          <div className="bg-white rounded-3xl border border-stone-200 p-5 shadow-xs space-y-3">
            <h3 className="text-sm font-black text-stone-900 uppercase tracking-wider flex items-center justify-between">
              <span>{CATEGORY_LABELS.segundo}</span>
              <span className="text-xs text-stone-400 font-bold lowercase">
                {selectedSegundos.length} seleccionados
              </span>
            </h3>

            <div className="divide-y divide-stone-100">
              {segundos.map((dish) => {
                const isSelected = selection[dish.id]?.selected ?? false;
                const stock = selection[dish.id]?.stock ?? 15;

                return (
                  <div key={dish.id} className="py-3 flex items-center justify-between gap-3">
                    <label className="flex items-center gap-3 cursor-pointer flex-1 min-w-0 select-none">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => handleToggleDish(dish.id)}
                        className="w-4 h-4 accent-orange-500 rounded cursor-pointer shrink-0"
                      />
                      <div className="min-w-0">
                        <h4 className={`text-xs sm:text-sm font-bold truncate ${isSelected ? 'text-stone-900' : 'text-stone-400'}`}>
                          {dish.name}
                        </h4>
                        <span className="text-[11px] text-stone-400">{formatCurrency(dish.price)}</span>
                      </div>
                    </label>

                    {isSelected && (
                      <div className="flex items-center gap-1.5 shrink-0">
                        <span className="text-[11px] text-stone-400 font-bold">Stock:</span>
                        <input
                          type="number"
                          min="0"
                          value={stock}
                          onChange={(e) => handleStockChange(dish.id, parseInt(e.target.value) || 0)}
                          className="w-16 px-2 py-1 rounded-lg border border-stone-200 text-xs font-bold text-center bg-stone-50"
                        />
                        <span className="text-[10px] text-stone-500 font-bold whitespace-nowrap">
                          Vendido: {Math.max(0, (initialStock[dish.id] ?? stock) - stock)}
                        </span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Group: Refrescos */}
          <div className="bg-white rounded-3xl border border-stone-200 p-5 shadow-xs space-y-3">
            <h3 className="text-sm font-black text-stone-900 uppercase tracking-wider flex items-center justify-between">
              <span>{CATEGORY_LABELS.refresco}</span>
              <span className="text-xs text-stone-400 font-bold lowercase">
                {selectedRefrescos.length} seleccionados
              </span>
            </h3>

            <div className="divide-y divide-stone-100">
              {refrescos.map((dish) => {
                const isSelected = selection[dish.id]?.selected ?? false;
                const stock = selection[dish.id]?.stock ?? 25;

                return (
                  <div key={dish.id} className="py-3 flex items-center justify-between gap-3">
                    <label className="flex items-center gap-3 cursor-pointer flex-1 min-w-0 select-none">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => handleToggleDish(dish.id)}
                        className="w-4 h-4 accent-orange-500 rounded cursor-pointer shrink-0"
                      />
                      <div className="min-w-0">
                        <h4 className={`text-xs sm:text-sm font-bold truncate ${isSelected ? 'text-stone-900' : 'text-stone-400'}`}>
                          {dish.name}
                        </h4>
                        <span className="text-[11px] text-stone-400">{formatCurrency(dish.price)}</span>
                      </div>
                    </label>

                    {isSelected && (
                      <div className="flex items-center gap-1.5 shrink-0">
                        <span className="text-[11px] text-stone-400 font-bold">Stock:</span>
                        <input
                          type="number"
                          min="0"
                          value={stock}
                          onChange={(e) => handleStockChange(dish.id, parseInt(e.target.value) || 0)}
                          className="w-16 px-2 py-1 rounded-lg border border-stone-200 text-xs font-bold text-center bg-stone-50"
                        />
                        <span className="text-[10px] text-stone-500 font-bold whitespace-nowrap">
                          Vendido: {Math.max(0, (initialStock[dish.id] ?? stock) - stock)}
                        </span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

        </div>

        {/* Right Column: Live Customer Preview */}
        <div className="lg:col-span-5 sticky top-24">
          <div className="bg-white rounded-3xl border border-stone-200 overflow-hidden shadow-md">
            
            <div className="p-4 bg-stone-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Smartphone className="w-4 h-4 text-orange-400" />
                <span className="text-xs font-bold">Vista Previa para Clientes</span>
              </div>
              <span className="text-[10px] bg-stone-800 px-2 py-0.5 rounded text-stone-300">
                Página /menu
              </span>
            </div>

            <div className="p-5 space-y-4 max-h-[600px] overflow-y-auto bg-stone-50 text-xs">
              
              <div className="bg-orange-500 rounded-2xl p-4 text-white text-center space-y-1">
                <span className="text-[10px] font-black uppercase text-amber-200">Menú del Día</span>
                <p className="font-bold text-sm">Combo Completo: S/ {MENU_PRICE.toFixed(2)}</p>
                <p className="text-[10px] text-orange-100">1 Entrada + 1 Segundo + 1 Refresco</p>
              </div>

              {/* Entradas preview */}
              <div className="space-y-1.5">
                <span className="font-bold text-stone-800 block text-[11px]">🥗 Entradas:</span>
                {selectedEntradas.length === 0 ? (
                  <p className="text-stone-400 italic text-[11px]">Ninguna seleccionada</p>
                ) : (
                  selectedEntradas.map((d) => (
                    <div key={d.id} className="p-2 rounded-xl bg-white border border-stone-200 flex justify-between items-center shadow-2xs">
                      <span className="font-semibold text-stone-800 truncate">{d.name}</span>
                      <span className="text-[10px] font-bold text-stone-400">
                        Stock: {selection[d.id]?.stock} · Vendido: {Math.max(0, (initialStock[d.id] ?? selection[d.id]?.stock ?? 0) - (selection[d.id]?.stock ?? 0))}
                      </span>
                    </div>
                  ))
                )}
              </div>

              {/* Segundos preview */}
              <div className="space-y-1.5">
                <span className="font-bold text-stone-800 block text-[11px]">🍛 Segundos:</span>
                {selectedSegundos.length === 0 ? (
                  <p className="text-stone-400 italic text-[11px]">Ninguno seleccionado</p>
                ) : (
                  selectedSegundos.map((d) => (
                    <div key={d.id} className="p-2 rounded-xl bg-white border border-stone-200 flex justify-between items-center shadow-2xs">
                      <span className="font-semibold text-stone-800 truncate">{d.name}</span>
                      <span className="text-[10px] font-bold text-stone-400">
                        Stock: {selection[d.id]?.stock} · Vendido: {Math.max(0, (initialStock[d.id] ?? selection[d.id]?.stock ?? 0) - (selection[d.id]?.stock ?? 0))}
                      </span>
                    </div>
                  ))
                )}
              </div>

              {/* Refrescos preview */}
              <div className="space-y-1.5">
                <span className="font-bold text-stone-800 block text-[11px]">🥤 Refrescos:</span>
                {selectedRefrescos.length === 0 ? (
                  <p className="text-stone-400 italic text-[11px]">Ninguno seleccionado</p>
                ) : (
                  selectedRefrescos.map((d) => (
                    <div key={d.id} className="p-2 rounded-xl bg-white border border-stone-200 flex justify-between items-center shadow-2xs">
                      <span className="font-semibold text-stone-800 truncate">{d.name}</span>
                      <span className="text-[10px] font-bold text-stone-400">
                        Stock: {selection[d.id]?.stock} · Vendido: {Math.max(0, (initialStock[d.id] ?? selection[d.id]?.stock ?? 0) - (selection[d.id]?.stock ?? 0))}
                      </span>
                    </div>
                  ))
                )}
              </div>

            </div>

          </div>
        </div>

      </div>

    </div>
  );
}
