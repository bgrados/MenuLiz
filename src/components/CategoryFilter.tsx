'use client';

import React from 'react';
import { Category } from '@/types/menu';
import { Search, Sparkles, Utensils, Coffee, Cake, Layers, Soup, X } from 'lucide-react';

interface CategoryFilterProps {
  activeCategory: Category;
  onSelectCategory: (cat: Category) => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  onlyAvailable: boolean;
  onToggleOnlyAvailable: () => void;
  totalCount: number;
}

const CATEGORIES: { id: Category; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { id: 'todos', label: 'Todo el Menú', icon: Utensils },
  { id: 'menu_del_dia', label: 'Menú de Hoy', icon: Sparkles },
  { id: 'segundos', label: 'Segundos', icon: Utensils },
  { id: 'entradas', label: 'Entradas', icon: Soup },
  { id: 'combos', label: 'Combos & Ofertas', icon: Layers },
  { id: 'bebidas', label: 'Bebidas & Jugos', icon: Coffee },
  { id: 'postres', label: 'Postres Caseros', icon: Cake },
];

export const CategoryFilter: React.FC<CategoryFilterProps> = ({
  activeCategory,
  onSelectCategory,
  searchQuery,
  onSearchChange,
  onlyAvailable,
  onToggleOnlyAvailable,
  totalCount,
}) => {
  return (
    <div id="menu-section" className="space-y-4 pt-4">
      
      {/* Top Bar: Search & Availability Filter */}
      <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
        
        {/* Search Input */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
          <input
            type="text"
            placeholder="Buscar por plato, ingrediente..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-10 pr-9 py-2.5 rounded-xl border border-stone-200 bg-white text-sm text-stone-800 placeholder-stone-400 focus:outline-hidden focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all shadow-xs"
          />
          {searchQuery && (
            <button
              onClick={() => onSearchChange('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 p-0.5"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Available Toggle & Count */}
        <div className="flex items-center justify-between sm:justify-end gap-3 text-xs sm:text-sm">
          <span className="text-stone-500 font-medium">
            <strong className="text-stone-900 font-bold">{totalCount}</strong> opciones
          </span>

          <label className="flex items-center gap-2 cursor-pointer bg-white px-3 py-2 rounded-xl border border-stone-200 shadow-xs hover:border-stone-300 select-none">
            <input
              type="checkbox"
              checked={onlyAvailable}
              onChange={onToggleOnlyAvailable}
              className="w-4 h-4 rounded text-orange-600 focus:ring-orange-500 border-stone-300 cursor-pointer accent-orange-600"
            />
            <span className="font-semibold text-stone-700">Solo disponibles</span>
          </label>
        </div>

      </div>

      {/* Category Pills Slider */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none -mx-4 px-4 sm:mx-0 sm:px-0">
        {CATEGORIES.map((cat) => {
          const Icon = cat.icon;
          const isActive = activeCategory === cat.id;

          return (
            <button
              key={cat.id}
              onClick={() => onSelectCategory(cat.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all select-none ${
                isActive
                  ? 'bg-orange-600 text-white shadow-md shadow-orange-600/25 scale-[1.02]'
                  : 'bg-white text-stone-600 border border-stone-200 hover:bg-stone-50 hover:text-stone-900 shadow-xs'
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-orange-600'}`} />
              <span>{cat.label}</span>
            </button>
          );
        })}
      </div>

    </div>
  );
};
