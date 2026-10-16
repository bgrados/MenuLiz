'use client';

import React, { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { formatCurrency } from '@/lib/utils';
import { Users, Search, Phone, MapPin, CalendarDays, ShoppingBag, MessageCircle } from 'lucide-react';

interface Customer {
  id: string;
  phone: string;
  name: string | null;
  address: string | null;
  marketing_consent: boolean;
  total_orders: number;
  total_spent: number;
  last_order_at: string | null;
}

export default function AdminClientesPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  const supabase = createClient();

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('customers')
          .select('*')
          .order('last_order_at', { ascending: false });
        if (!error && data) setCustomers(data as Customer[]);
      } catch (err) {
        console.warn('Error cargando clientes', err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const filtered = customers.filter((c) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      (c.name || '').toLowerCase().includes(q) ||
      (c.phone || '').includes(q) ||
      (c.address || '').toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-black text-stone-900 tracking-tight">
          Base de Clientes
        </h1>
        <p className="text-xs sm:text-sm text-stone-500 mt-1">
          Clientes recurrentes, sus pedidos y preferencias de contacto
        </p>
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
        <input
          type="text"
          placeholder="Buscar por nombre, teléfono o dirección..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-9 pr-3 py-2 rounded-xl border border-stone-200 bg-white text-xs sm:text-sm focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 shadow-xs"
        />
      </div>

      {loading ? (
        <div className="p-6 bg-white border border-stone-200 rounded-3xl">Cargando clientes...</div>
      ) : (
        <div className="space-y-3">
          {filtered.length === 0 ? (
            <div className="py-12 text-center bg-white rounded-3xl border border-stone-200">
              <Users className="w-10 h-10 text-stone-300 mx-auto" />
              <p className="text-xs text-stone-400 mt-2">No hay clientes registrados todavía.</p>
            </div>
          ) : (
            filtered.map((c) => (
              <div key={c.id} className="bg-white rounded-3xl border border-stone-200 p-4 shadow-xs space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <h3 className="text-sm font-bold text-stone-900">{c.name || 'Sin nombre'}</h3>
                    <a
                      href={`https://api.whatsapp.com/send?phone=51${c.phone.replace(/[^0-9]/g, '')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-xs text-emerald-600 font-bold"
                    >
                      <MessageCircle className="w-3.5 h-3.5" />
                      <span>{c.phone}</span>
                    </a>
                  </div>
                  <span
                    className={`px-2.5 py-1 rounded-full text-[11px] font-bold border ${
                      c.marketing_consent
                        ? 'bg-emerald-100 text-emerald-800 border-emerald-200'
                        : 'bg-stone-100 text-stone-600 border-stone-200'
                    }`}
                  >
                    {c.marketing_consent ? 'Acepta promo' : 'Sin consentimiento'}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
                  <div className="flex items-center gap-1.5 text-stone-600">
                    <MapPin className="w-3.5 h-3.5 text-orange-500" />
                    <span className="truncate">{c.address || 'Sin dirección'}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-stone-600">
                    <ShoppingBag className="w-3.5 h-3.5 text-orange-500" />
                    <span>{c.total_orders} pedido(s) · {formatCurrency(Number(c.total_spent))}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-stone-600">
                    <CalendarDays className="w-3.5 h-3.5 text-orange-500" />
                    <span>
                      {c.last_order_at
                        ? new Date(c.last_order_at).toLocaleDateString('es-PE')
                        : 'Sin pedidos'}
                    </span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}