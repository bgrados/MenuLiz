'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { Order } from '@/types';
import { STATUS_LABELS, STATUS_COLORS, PAYMENT_LABELS } from '@/lib/constants';
import { formatCurrency, formatDateSpanish } from '@/lib/utils';
import {
  ShoppingBag,
  TrendingUp,
  Clock,
  CheckCircle2,
  CalendarDays,
  UtensilsCrossed,
  ArrowRight,
  ExternalLink,
  ChefHat,
} from 'lucide-react';

export default function AdminDashboardPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    async function loadDashboardData() {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('orders')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(20);

        if (!error && data) {
          setOrders(data as Order[]);
        } else {
          // Mock data for initial presentation
          setOrders([
            {
              id: 'ord-1',
              order_number: 104,
              customer_name: 'Rosa Palacios',
              customer_phone: '987654321',
              delivery_type: 'delivery',
              delivery_address: 'Av. Larco 450, Miraflores',
              delivery_fee: 3.00,
              subtotal: 28.00,
              total: 31.00,
              payment_method: 'yape',
              notes: 'Ají extra por favor',
              status: 'en_camino',
              created_at: new Date().toISOString(),
            },
            {
              id: 'ord-2',
              order_number: 103,
              customer_name: 'Carlos Mendoza',
              customer_phone: '912345678',
              delivery_type: 'recojo',
              delivery_fee: 0,
              subtotal: 14.00,
              total: 14.00,
              payment_method: 'plin',
              status: 'en_preparacion',
              created_at: new Date(Date.now() - 15 * 60000).toISOString(),
            },
            {
              id: 'ord-3',
              order_number: 102,
              customer_name: 'Mariana Vega',
              customer_phone: '998877665',
              delivery_type: 'delivery',
              delivery_address: 'Calle San Martín 122',
              delivery_fee: 3.00,
              subtotal: 14.00,
              total: 17.00,
              payment_method: 'efectivo',
              status: 'nuevo',
              created_at: new Date(Date.now() - 30 * 60000).toISOString(),
            },
            {
              id: 'ord-4',
              order_number: 101,
              customer_name: 'Jorge Quispe',
              customer_phone: '955443322',
              delivery_type: 'delivery',
              delivery_address: 'Jr. Bolognesi 340',
              delivery_fee: 3.00,
              subtotal: 28.00,
              total: 31.00,
              payment_method: 'lemon',
              status: 'completado',
              created_at: new Date(Date.now() - 60 * 60000).toISOString(),
            },
          ]);
        }
      } catch (err) {
        console.error('Failed to load dashboard orders', err);
      } finally {
        setLoading(false);
      }
    }

    loadDashboardData();
  }, []);

  // Compute KPIs
  const totalOrdersToday = orders.length;
  const totalRevenueToday = orders
    .filter((o) => o.status !== 'cancelado')
    .reduce((sum, o) => sum + Number(o.total || 0), 0);
  const pendingOrdersCount = orders.filter(
    (o) => o.status === 'nuevo' || o.status === 'confirmado' || o.status === 'en_preparacion'
  ).length;
  const completedOrdersCount = orders.filter((o) => o.status === 'completado').length;

  const lastFiveOrders = orders.slice(0, 5);

  // Resumen por método de pago (solo pedidos no cancelados)
  const paymentSummary = (['efectivo', 'yape', 'plin', 'lemon'] as const).map((method) => {
    const list = orders.filter((o) => o.payment_method === method && o.status !== 'cancelado');
    return {
      method,
      count: list.length,
      total: list.reduce((sum, o) => sum + Number(o.total || 0), 0),
    };
  });

  // Mini-resumen de ventas por día (últimos 7 días presentes en el historial)
  const dailySales = React.useMemo(() => {
    const map = new Map<string, { count: number; total: number }>();
    for (const o of orders) {
      if (o.status === 'cancelado') continue;
      const d = new Date(o.created_at);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
      if (!map.has(key)) map.set(key, { count: 0, total: 0 });
      const g = map.get(key)!;
      g.count++;
      g.total += Number(o.total || 0);
    }
    return [...map.entries()]
      .sort(([a], [b]) => b.localeCompare(a))
      .slice(0, 7);
  }, [orders]);

  return (
    <div className="space-y-8">
      
      {/* Title Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-stone-900 tracking-tight">
            Dashboard General
          </h1>
          <p className="text-xs sm:text-sm text-stone-500 mt-1">
            Resumen en tiempo real de los almuerzos de hoy
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/admin/menu-hoy"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs shadow-md shadow-orange-500/20 transition-all"
          >
            <CalendarDays className="w-4 h-4" />
            <span>Configurar Menú de Hoy</span>
          </Link>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Pedidos Hoy */}
        <div className="p-5 rounded-2xl bg-white border border-stone-200 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-stone-500">
            <span className="text-xs font-bold uppercase tracking-wider">Pedidos Hoy</span>
            <div className="p-2 rounded-xl bg-blue-50 text-blue-600">
              <ShoppingBag className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-black text-stone-900">{totalOrdersToday}</p>
          <span className="text-[11px] text-stone-400 font-medium">Registrados en la plataforma</span>
        </div>

        {/* Ingresos Hoy */}
        <div className="p-5 rounded-2xl bg-white border border-stone-200 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-stone-500">
            <span className="text-xs font-bold uppercase tracking-wider">Ingresos Estimados</span>
            <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-black text-emerald-600">
            {formatCurrency(totalRevenueToday)}
          </p>
          <span className="text-[11px] text-stone-400 font-medium">Excluye pedidos cancelados</span>
        </div>

        {/* Pendientes */}
        <div className="p-5 rounded-2xl bg-white border border-stone-200 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-stone-500">
            <span className="text-xs font-bold uppercase tracking-wider">En Cocina / Espera</span>
            <div className="p-2 rounded-xl bg-amber-50 text-amber-600">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-black text-amber-600">{pendingOrdersCount}</p>
          <span className="text-[11px] text-stone-400 font-medium">Nuevos o en preparación</span>
        </div>

        {/* Completados */}
        <div className="p-5 rounded-2xl bg-white border border-stone-200 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-stone-500">
            <span className="text-xs font-bold uppercase tracking-wider">Entregados</span>
            <div className="p-2 rounded-xl bg-purple-50 text-purple-600">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-black text-purple-600">{completedOrdersCount}</p>
          <span className="text-[11px] text-stone-400 font-medium">Pedidos finalizados con éxito</span>
        </div>

      </div>

      {/* Mini-resumen de ventas por día */}
      <div className="bg-white rounded-3xl border border-stone-200 overflow-hidden shadow-xs">
        <div className="p-5 border-b border-stone-200 flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-stone-900 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-emerald-600" /> Ventas por Día
            </h3>
            <p className="text-xs text-stone-500">Resumen de ingresos y pedidos por fecha (últimos días)</p>
          </div>
          <Link
            href="/admin/pedidos"
            className="text-xs font-bold text-orange-600 hover:text-orange-700 flex items-center gap-1"
          >
            <span>Ver todos</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="divide-y divide-stone-100">
          {dailySales.length === 0 ? (
            <div className="py-8 text-center text-xs text-stone-400">
              Sin ventas registradas todavía.
            </div>
          ) : (
            dailySales.map(([dateKey, data]) => (
              <div
                key={dateKey}
                className="p-4 sm:px-6 flex items-center justify-between gap-3 hover:bg-stone-50/60 transition-colors"
              >
                <div className="space-y-0.5">
                  <p className="text-sm font-bold text-stone-900">
                    {formatDateSpanish(new Date(dateKey + 'T00:00:00'))}
                  </p>
                  <p className="text-xs text-stone-500">
                    {data.count} pedido(s) · Ticket prom.: {formatCurrency(data.total / (data.count || 1))}
                  </p>
                </div>
                <span className="text-sm font-black text-emerald-600">
                  {formatCurrency(data.total)}
                </span>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Quick Navigation Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        
        <Link
          href="/admin/platos"
          className="p-5 rounded-2xl bg-white border border-stone-200 hover:border-orange-300 hover:shadow-md transition-all flex items-center justify-between group"
        >
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-orange-100 text-orange-600 group-hover:scale-105 transition-transform">
              <UtensilsCrossed className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-stone-900">Catálogo de Platos</h4>
              <p className="text-xs text-stone-500">Crear y editar platos y fotos</p>
            </div>
          </div>
          <ArrowRight className="w-4 h-4 text-stone-400 group-hover:text-orange-500 transition-colors" />
        </Link>

        <Link
          href="/admin/menu-hoy"
          className="p-5 rounded-2xl bg-white border border-stone-200 hover:border-orange-300 hover:shadow-md transition-all flex items-center justify-between group"
        >
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-amber-100 text-amber-600 group-hover:scale-105 transition-transform">
              <CalendarDays className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-stone-900">Menú del Día & Stock</h4>
              <p className="text-xs text-stone-500">Definir platos y stock de hoy</p>
            </div>
          </div>
          <ArrowRight className="w-4 h-4 text-stone-400 group-hover:text-orange-500 transition-colors" />
        </Link>

        <Link
          href="/admin/pedidos"
          className="p-5 rounded-2xl bg-white border border-stone-200 hover:border-orange-300 hover:shadow-md transition-all flex items-center justify-between group"
        >
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-emerald-100 text-emerald-600 group-hover:scale-105 transition-transform">
              <ShoppingBag className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-stone-900">Gestión de Pedidos</h4>
              <p className="text-xs text-stone-500">Actualizar estados en tiempo real</p>
            </div>
          </div>
          <ArrowRight className="w-4 h-4 text-stone-400 group-hover:text-orange-500 transition-colors" />
        </Link>

      </div>

      {/* Resumen de pagos por método */}
      <div className="bg-white rounded-3xl border border-stone-200 overflow-hidden shadow-xs">
        <div className="p-5 border-b border-stone-200">
          <h3 className="text-base font-bold text-stone-900">Pagos por Método</h3>
          <p className="text-xs text-stone-500">Cantidad y monto cobrado por canal de pago (excluye cancelados)</p>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-y md:divide-y-0 divide-stone-100">
          {paymentSummary.map((p) => (
            <div key={p.method} className="p-4 space-y-1">
              <span className="text-xs font-bold text-stone-500 uppercase tracking-wider">
                {PAYMENT_LABELS[p.method]}
              </span>
              <p className="text-xl font-black text-stone-900">{p.count} pedido(s)</p>
              <p className="text-sm font-bold text-emerald-600">{formatCurrency(p.total)}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Last 5 Orders Table */}
      <div className="bg-white rounded-3xl border border-stone-200 overflow-hidden shadow-xs">
        
        <div className="p-5 border-b border-stone-200 flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-stone-900">Últimos Pedidos Registrados</h3>
            <p className="text-xs text-stone-500">Pedidos recientes recibidos</p>
          </div>
          <Link
            href="/admin/pedidos"
            className="text-xs font-bold text-orange-600 hover:text-orange-700 flex items-center gap-1"
          >
            <span>Ver todos</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="divide-y divide-stone-100 overflow-x-auto">
          {lastFiveOrders.length === 0 ? (
            <div className="py-12 text-center text-xs text-stone-400">
              No hay pedidos registrados todavía.
            </div>
          ) : (
            lastFiveOrders.map((ord) => (
              <div
                key={ord.id}
                className="p-4 sm:px-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-stone-50/60 transition-colors"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-stone-500">
                      #{ord.order_number || ord.id.slice(0, 6)}
                    </span>
                    <span className="text-sm font-bold text-stone-900">{ord.customer_name}</span>
                    <span className="text-xs text-stone-400">({ord.customer_phone})</span>
                  </div>
                  <div className="flex flex-wrap items-center gap-2 text-xs text-stone-500">
                    <span className="capitalize">{ord.delivery_type === 'delivery' ? '🛵 Delivery' : '🏠 Recojo'}</span>
                    <span>•</span>
                    <span>Pago: {PAYMENT_LABELS[ord.payment_method] || ord.payment_method}</span>
                    {ord.delivery_address && (
                      <>
                        <span>•</span>
                        <span className="truncate max-w-xs">{ord.delivery_address}</span>
                      </>
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-4">
                  <span className="text-sm font-black text-stone-900">
                    {formatCurrency(ord.total)}
                  </span>
                  <span
                    className={`px-2.5 py-1 rounded-full text-xs font-bold border ${
                      STATUS_COLORS[ord.status] || 'bg-stone-100 text-stone-700'
                    }`}
                  >
                    {STATUS_LABELS[ord.status] || ord.status}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>

      </div>

    </div>
  );
}
