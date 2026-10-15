'use client';

import React, { useState } from 'react';
import { MenuItem } from '@/types/menu';
import { X, Lock, CheckCircle2, AlertCircle, Plus, Edit2, Trash2, Database, Copy, Check, Sparkles } from 'lucide-react';

interface AdminModalProps {
  isOpen: boolean;
  onClose: () => void;
  items: MenuItem[];
  onSaveItem: (item: MenuItem) => void;
  onDeleteItem: (id: string) => void;
  onToggleAvailability: (item: MenuItem) => void;
  onToggleDailySpecial: (item: MenuItem) => void;
}

const DEFAULT_PIN = '1234';

export const AdminModal: React.FC<AdminModalProps> = ({
  isOpen,
  onClose,
  items,
  onSaveItem,
  onDeleteItem,
  onToggleAvailability,
  onToggleDailySpecial,
}) => {
  const [pin, setPin] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [pinError, setPinError] = useState(false);
  const [activeTab, setActiveTab] = useState<'items' | 'supabase'>('items');
  const [editingItem, setEditingItem] = useState<Partial<MenuItem> | null>(null);
  const [copiedSql, setCopiedSql] = useState(false);

  if (!isOpen) return null;

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (pin === DEFAULT_PIN) {
      setIsAuthenticated(true);
      setPinError(false);
    } else {
      setPinError(true);
    }
  };

  const handleSaveForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingItem || !editingItem.name || !editingItem.price) return;

    const fullItem: MenuItem = {
      id: editingItem.id || String(Date.now()),
      name: editingItem.name,
      description: editingItem.description || '',
      price: Number(editingItem.price),
      category: (editingItem.category as MenuItem['category']) || 'segundos',
      image_url: editingItem.image_url || 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=800&q=80',
      is_available: editingItem.is_available !== undefined ? editingItem.is_available : true,
      is_daily_special: editingItem.is_daily_special || false,
      badge: editingItem.badge || undefined,
    };

    onSaveItem(fullItem);
    setEditingItem(null);
  };

  const sqlSample = `-- Ejecuta esto en Supabase -> SQL Editor para crear la tabla de menu:
CREATE TABLE IF NOT EXISTS public.menu_items (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  price NUMERIC(10, 2) NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('entradas', 'segundos', 'bebidas', 'postres', 'combos')),
  image_url TEXT NOT NULL,
  is_available BOOLEAN DEFAULT true,
  is_daily_special BOOLEAN DEFAULT false,
  badge TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.menu_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Lectura y escritura publica" 
  ON public.menu_items FOR ALL 
  TO anon, authenticated USING (true) WITH CHECK (true);`;

  const copySql = () => {
    navigator.clipboard.writeText(sqlSample);
    setCopiedSql(true);
    setTimeout(() => setCopiedSql(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="relative w-full max-w-3xl bg-white rounded-3xl shadow-2xl border border-stone-200 overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="p-5 border-b border-stone-200 flex items-center justify-between bg-stone-900 text-white">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-orange-600 text-white">
              <Lock className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold">Panel de Administración MenuLiz</h2>
              <p className="text-xs text-stone-400">Actualización en tiempo real del menú y disponibilidad</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-stone-400 hover:text-white hover:bg-stone-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        {!isAuthenticated ? (
          // PIN Login Screen
          <div className="p-8 max-w-sm mx-auto text-center space-y-4 my-auto">
            <div className="w-14 h-14 rounded-2xl bg-orange-100 text-orange-600 flex items-center justify-center mx-auto">
              <Lock className="w-7 h-7" />
            </div>
            <h3 className="text-lg font-bold text-stone-900">Acceso Administrativo</h3>
            <p className="text-xs text-stone-500">
              Ingresa el PIN de seguridad para gestionar los platos y precios. (PIN por defecto: <strong className="text-stone-800">1234</strong>)
            </p>

            <form onSubmit={handleLogin} className="space-y-3 pt-2">
              <input
                type="password"
                maxLength={6}
                value={pin}
                onChange={(e) => {
                  setPin(e.target.value);
                  setPinError(false);
                }}
                placeholder="Ingresa PIN (1234)"
                className="w-full text-center tracking-widest text-lg font-mono font-bold py-3 rounded-xl border border-stone-300 focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
              />
              {pinError && (
                <p className="text-xs text-red-500 font-semibold flex items-center justify-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5" /> PIN incorrecto (Prueba con 1234)
                </p>
              )}
              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-bold text-sm shadow-md shadow-orange-600/20 transition-all cursor-pointer"
              >
                Ingresar al Panel
              </button>
            </form>
          </div>
        ) : (
          // Authenticated Dashboard
          <div className="flex-1 flex flex-col overflow-hidden">
            
            {/* Tabs */}
            <div className="flex items-center justify-between border-b border-stone-200 px-6 py-2.5 bg-stone-50">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setActiveTab('items')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                    activeTab === 'items'
                      ? 'bg-white text-orange-600 shadow-xs border border-stone-200'
                      : 'text-stone-500 hover:text-stone-900'
                  }`}
                >
                  Platos del Menú ({items.length})
                </button>
                <button
                  onClick={() => setActiveTab('supabase')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                    activeTab === 'supabase'
                      ? 'bg-white text-orange-600 shadow-xs border border-stone-200'
                      : 'text-stone-500 hover:text-stone-900'
                  }`}
                >
                  Estado de Supabase
                </button>
              </div>

              {activeTab === 'items' && !editingItem && (
                <button
                  onClick={() =>
                    setEditingItem({
                      category: 'segundos',
                      is_available: true,
                      is_daily_special: true,
                    })
                  }
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-orange-600 hover:bg-orange-700 text-white text-xs font-bold shadow-xs cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Nuevo Plato</span>
                </button>
              )}
            </div>

            {/* Tab Body */}
            <div className="flex-1 overflow-y-auto p-6">
              
              {/* Form Modal when editing/creating */}
              {editingItem ? (
                <form onSubmit={handleSaveForm} className="space-y-4 max-w-lg mx-auto bg-stone-50 p-6 rounded-2xl border border-stone-200">
                  <div className="flex items-center justify-between border-b border-stone-200 pb-3">
                    <h4 className="text-sm font-bold text-stone-900">
                      {editingItem.id ? 'Editar Plato' : 'Crear Nuevo Plato'}
                    </h4>
                    <button
                      type="button"
                      onClick={() => setEditingItem(null)}
                      className="text-xs text-stone-400 hover:text-stone-600"
                    >
                      Cancelar
                    </button>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-stone-700 mb-1">Nombre del Plato *</label>
                    <input
                      type="text"
                      required
                      value={editingItem.name || ''}
                      onChange={(e) => setEditingItem({ ...editingItem, name: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-stone-300 text-xs sm:text-sm bg-white"
                      placeholder="Ej: Seco de Pollo con Frejoles"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-stone-700 mb-1">Precio (S/) *</label>
                      <input
                        type="number"
                        step="0.5"
                        required
                        value={editingItem.price || ''}
                        onChange={(e) => setEditingItem({ ...editingItem, price: parseFloat(e.target.value) })}
                        className="w-full px-3 py-2 rounded-xl border border-stone-300 text-xs sm:text-sm bg-white"
                        placeholder="16.00"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-stone-700 mb-1">Categoría</label>
                      <select
                        value={editingItem.category || 'segundos'}
                        onChange={(e) => setEditingItem({ ...editingItem, category: e.target.value as MenuItem['category'] })}
                        className="w-full px-3 py-2 rounded-xl border border-stone-300 text-xs sm:text-sm bg-white"
                      >
                        <option value="entradas">Entradas</option>
                        <option value="segundos">Segundos</option>
                        <option value="combos">Combos</option>
                        <option value="bebidas">Bebidas</option>
                        <option value="postres">Postres</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-stone-700 mb-1">Descripción</label>
                    <textarea
                      rows={2}
                      value={editingItem.description || ''}
                      onChange={(e) => setEditingItem({ ...editingItem, description: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-stone-300 text-xs sm:text-sm bg-white"
                      placeholder="Ingredientes principales y guarniciones..."
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-stone-700 mb-1">URL de Foto (Unsplash o enlace)</label>
                    <input
                      type="url"
                      value={editingItem.image_url || ''}
                      onChange={(e) => setEditingItem({ ...editingItem, image_url: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-stone-300 text-xs sm:text-sm bg-white"
                      placeholder="https://..."
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-stone-700 mb-1">Insignia / Badge (Opcional)</label>
                    <input
                      type="text"
                      value={editingItem.badge || ''}
                      onChange={(e) => setEditingItem({ ...editingItem, badge: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-stone-300 text-xs sm:text-sm bg-white"
                      placeholder="Ej: Plato Estrella, Especial"
                    />
                  </div>

                  <div className="flex items-center gap-4 pt-1">
                    <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-stone-700">
                      <input
                        type="checkbox"
                        checked={editingItem.is_daily_special ?? false}
                        onChange={(e) => setEditingItem({ ...editingItem, is_daily_special: e.target.checked })}
                        className="w-4 h-4 accent-orange-600 rounded"
                      />
                      <span>⭐ Menú de Hoy</span>
                    </label>

                    <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-stone-700">
                      <input
                        type="checkbox"
                        checked={editingItem.is_available ?? true}
                        onChange={(e) => setEditingItem({ ...editingItem, is_available: e.target.checked })}
                        className="w-4 h-4 accent-orange-600 rounded"
                      />
                      <span>🟢 Disponible</span>
                    </label>
                  </div>

                  <div className="flex items-center justify-end gap-2 pt-3 border-t border-stone-200">
                    <button
                      type="button"
                      onClick={() => setEditingItem(null)}
                      className="px-4 py-2 rounded-xl border border-stone-300 text-xs font-semibold text-stone-700 hover:bg-stone-100"
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      className="px-5 py-2 rounded-xl bg-orange-600 hover:bg-orange-700 text-white text-xs font-bold shadow-xs cursor-pointer"
                    >
                      Guardar Plato
                    </button>
                  </div>
                </form>
              ) : activeTab === 'items' ? (
                // Item List Table / Cards
                <div className="space-y-3">
                  <div className="text-xs text-stone-500 font-medium">
                    Cambia la disponibilidad o resalta como "Menú de Hoy" con un solo clic:
                  </div>

                  <div className="divide-y divide-stone-100 border border-stone-200 rounded-2xl overflow-hidden bg-white">
                    {items.map((item) => (
                      <div key={item.id} className="p-3 sm:p-4 flex items-center justify-between gap-3 hover:bg-stone-50/80 transition-colors">
                        
                        <div className="flex items-center gap-3 min-w-0">
                          <img
                            src={item.image_url}
                            alt={item.name}
                            className="w-12 h-12 rounded-xl object-cover shrink-0 border border-stone-200"
                          />
                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <h5 className="text-xs sm:text-sm font-bold text-stone-900 truncate">{item.name}</h5>
                              <span className="text-[10px] uppercase font-bold text-stone-400 bg-stone-100 px-1.5 py-0.5 rounded">
                                {item.category}
                              </span>
                            </div>
                            <p className="text-xs font-bold text-orange-600">S/ {item.price.toFixed(2)}</p>
                          </div>
                        </div>

                        {/* Quick Action Toggles */}
                        <div className="flex items-center gap-2 shrink-0">
                          {/* Toggle Menú de Hoy */}
                          <button
                            onClick={() => onToggleDailySpecial(item)}
                            title="Alternar Menú del Día"
                            className={`p-2 rounded-xl text-xs font-bold flex items-center gap-1 transition-all ${
                              item.is_daily_special
                                ? 'bg-amber-100 text-amber-900'
                                : 'bg-stone-100 text-stone-400 hover:text-stone-700'
                            }`}
                          >
                            <Sparkles className="w-3.5 h-3.5" />
                            <span className="hidden sm:inline">Hoy</span>
                          </button>

                          {/* Toggle Disponibilidad */}
                          <button
                            onClick={() => onToggleAvailability(item)}
                            title="Alternar Disponibilidad"
                            className={`px-2.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                              item.is_available
                                ? 'bg-emerald-100 text-emerald-800'
                                : 'bg-red-100 text-red-800'
                            }`}
                          >
                            {item.is_available ? 'Disponible' : 'Agotado'}
                          </button>

                          {/* Edit */}
                          <button
                            onClick={() => setEditingItem(item)}
                            className="p-2 rounded-xl text-stone-400 hover:text-stone-700 hover:bg-stone-100"
                            title="Editar"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>

                          {/* Delete */}
                          <button
                            onClick={() => {
                              if (confirm(`¿Eliminar ${item.name} del menú?`)) {
                                onDeleteItem(item.id);
                              }
                            }}
                            className="p-2 rounded-xl text-stone-400 hover:text-red-600 hover:bg-red-50"
                            title="Eliminar"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>

                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                // Supabase Connection Status Tab
                <div className="space-y-6">
                  
                  <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                    <div className="space-y-1 text-xs sm:text-sm">
                      <p className="font-bold">Conexión de Supabase Activa</p>
                      <p className="text-emerald-700">
                        Endpoint: <code className="font-mono bg-emerald-100 px-1 py-0.5 rounded">https://zwdfwasdmlsjunpezhsm.supabase.co</code>
                      </p>
                      <p className="text-emerald-700">
                        Las modificaciones que realices se guardan automáticamente tanto en tu base de datos de Supabase como en la memoria del navegador.
                      </p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-stone-500">
                        Script SQL para crear la tabla en Supabase
                      </h4>
                      <button
                        onClick={copySql}
                        className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold bg-stone-900 text-white hover:bg-stone-800 cursor-pointer shadow-xs"
                      >
                        {copiedSql ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                        <span>{copiedSql ? 'Copiado al portapapeles' : 'Copiar SQL'}</span>
                      </button>
                    </div>

                    <pre className="p-4 rounded-2xl bg-stone-900 text-stone-200 font-mono text-xs overflow-x-auto max-h-56 leading-relaxed">
                      {sqlSample}
                    </pre>
                  </div>

                </div>
              )}

            </div>
          </div>
        )}

      </div>
    </div>
  );
};
