'use client';

import React, { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Order, OrderStatus } from '@/types';
import { STATUS_LABELS, STATUS_COLORS, PAYMENT_LABELS } from '@/lib/constants';
import { formatCurrency, formatDateSpanish } from '@/lib/utils';
import { getPaymentReceiptSignedUrl, requiresPaymentReceipt } from '@/lib/receipts';
import PaymentReceiptUpload from '@/components/PaymentReceiptUpload';
import {
  ClipboardList,
  Phone,
  MessageCircle,
  MapPin,
  Store,
  Clock,
  CheckCircle2,
  AlertCircle,
  Filter,
  Check,
  X,
  Radio,
  Trash2,
  Paperclip,
} from 'lucide-react';

export default function AdminPedidosPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<'todos' | OrderStatus>('todos');

  const supabase = createClient();

  useEffect(() => {
    async function loadOrders() {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('orders')
          .select(`
            *,
            order_items (*)
          `)
          .order('created_at', { ascending: false });

        if (!error && data && data.length > 0) {
          setOrders(data as Order[]);
        } else {
          // Fallback initial orders for demonstration
          setOrders([
            {
              id: 'ord-104',
              order_number: 104,
              customer_name: 'Rosa Palacios',
              customer_phone: '987654321',
              delivery_type: 'delivery',
              delivery_address: 'Av. Larco 450, Dpto 302, Miraflores',
              delivery_fee: 3.00,
              subtotal: 28.00,
              total: 31.00,
              payment_method: 'yape',
              notes: 'Enviar ají extra y cubiertos por favor',
              status: 'nuevo',
              created_at: new Date().toISOString(),
              order_items: [
                { dish_name: 'Lomo Saltado al Wok', quantity: 2, unit_price: 11.00, category: 'segundo', is_combo_part: true },
                { dish_name: 'Sopa Criolla Calientita', quantity: 1, unit_price: 6.00, category: 'entrada', is_combo_part: true },
                { dish_name: 'Chicha Morada Natural', quantity: 2, unit_price: 3.00, category: 'refresco', is_combo_part: true },
              ],
            },
            {
              id: 'ord-103',
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
              order_items: [
                { dish_name: 'Ají de Gallina Casero', quantity: 1, unit_price: 10.00, category: 'segundo', is_combo_part: true },
                { dish_name: 'Causa Rellena de Pollo', quantity: 1, unit_price: 6.00, category: 'entrada', is_combo_part: true },
                { dish_name: 'Refresco de Maracuyá', quantity: 1, unit_price: 3.00, category: 'refresco', is_combo_part: true },
              ],
            },
            {
              id: 'ord-102',
              order_number: 102,
              customer_name: 'Mariana Vega',
              customer_phone: '998877665',
              delivery_type: 'delivery',
              delivery_address: 'Calle San Martín 122',
              delivery_fee: 3.00,
              subtotal: 24.00,
              total: 27.00,
              payment_method: 'efectivo',
              status: 'en_camino',
              created_at: new Date(Date.now() - 35 * 60000).toISOString(),
              order_items: [
                { dish_name: 'Bistec a lo Pobre Especial', quantity: 1, unit_price: 24.00, category: 'a_la_carta', is_combo_part: false },
              ],
            },
            {
              id: 'ord-101',
              order_number: 101,
              customer_name: 'Jorge Quispe',
              customer_phone: '955443322',
              delivery_type: 'delivery',
              delivery_address: 'Jr. Bolognesi 340',
              delivery_fee: 3.00,
              subtotal: 14.00,
              total: 17.00,
              payment_method: 'lemon',
              status: 'completado',
              created_at: new Date(Date.now() - 75 * 60000).toISOString(),
              order_items: [
                { dish_name: 'Arroz con Pollo', quantity: 1, unit_price: 10.00, category: 'segundo', is_combo_part: true },
                { dish_name: 'Tequeños con Guacamole', quantity: 1, unit_price: 6.00, category: 'entrada', is_combo_part: true },
                { dish_name: 'Chicha Morada Natural', quantity: 1, unit_price: 3.00, category: 'refresco', is_combo_part: true },
              ],
            },
          ]);
        }
      } catch (err) {
        console.error('Error loading orders', err);
      } finally {
        setLoading(false);
      }
    }

    loadOrders();

    // Setup Supabase Realtime Channel
    const channel = supabase
      .channel('realtime:orders')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'orders' },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            setOrders((prev) => [payload.new as Order, ...prev]);
          } else if (payload.eventType === 'UPDATE') {
            setOrders((prev) =>
              prev.map((o) => (o.id === payload.new.id ? { ...o, ...payload.new } : o))
            );
          } else if (payload.eventType === 'DELETE') {
            setOrders((prev) => prev.filter((o) => o.id !== payload.old.id));
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const handleUpdateStatus = async (orderId: string, newStatus: OrderStatus) => {
    // Optimistic UI update
    setOrders((prev) =>
      prev.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o))
    );

    try {
      await supabase.from('orders').update({ status: newStatus }).eq('id', orderId);
    } catch (err) {
      console.warn('Error updating status in Supabase', err);
    }
  };

  const handleDeleteOrder = async (order: Order) => {
    if (!confirm(`¿Eliminar el pedido #${order.order_number || order.id.slice(0, 6)} de ${order.customer_name}? Esto también repondrá el stock de los platos. Esta acción no se puede deshacer.`)) {
      return;
    }

    try {
      const dateKey = getLocalDateKey(order.created_at);

      // Reponer stock antes de borrar el pedido (el trigger solo descuenta, no repone al borrar)
      if (order.order_items) {
        for (const item of order.order_items) {
          if (!item.dish_id) continue;
          const { data: dm } = await supabase
            .from('daily_menus')
            .select('id, stock')
            .eq('date', dateKey)
            .eq('dish_id', item.dish_id)
            .maybeSingle();

          if (dm) {
            await supabase
              .from('daily_menus')
              .update({
                stock: Number(dm.stock || 0) + Number(item.quantity || 0),
                is_available: true,
              })
              .eq('id', dm.id);
          }
        }
      }

      const { error: delErr } = await supabase.from('orders').delete().eq('id', order.id);
      if (delErr) {
        alert(`No se pudo eliminar el pedido: ${delErr.message || 'Error'}${delErr.code ? ` (Código: ${delErr.code})` : ''}`);
        return;
      }

      setOrders((prev) => prev.filter((o) => o.id !== order.id));
    } catch (err) {
      console.error('Error eliminando pedido:', err);
      alert('Ocurrió un error al eliminar el pedido.');
    }
  };

  const handleViewReceipt = async (order: Order) => {
    if (!order.payment_receipt_path) return;
    const url = await getPaymentReceiptSignedUrl(order.payment_receipt_path);
    if (url) {
      window.open(url, '_blank', 'noopener,noreferrer');
    } else {
      alert('No se pudo abrir la constancia. Vuelve a intentarlo en unos segundos.');
    }
  };

  const handleReceiptUploaded = (orderId: string, path: string) => {
    setOrders((prev) =>
      prev.map((o) => (o.id === orderId ? { ...o, payment_receipt_path: path } : o))
    );
  };

  const filteredOrders = orders.filter((o) => {
    if (statusFilter !== 'todos' && o.status !== statusFilter) return false;
    return true;
  });

  // Agrupar los pedidos filtrados por fecha (local) para ver las ventas por día
  const getLocalDateKey = (iso: string) => {
    const d = new Date(iso);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  };

  const groupedOrders = React.useMemo(() => {
    const map = new Map<string, Order[]>();
    for (const o of filteredOrders) {
      const key = getLocalDateKey(o.created_at);
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(o);
    }
    return [...map.entries()].sort(([a], [b]) => b.localeCompare(a));
  }, [filteredOrders]);

  return (
    <div className="space-y-6">
      
      {/* Title & Realtime Badge */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-black text-stone-900 tracking-tight">
              Gestión de Pedidos
            </h1>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 text-[11px] font-bold">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
              <span>Realtime Activo</span>
            </span>
          </div>
          <p className="text-xs sm:text-sm text-stone-500 mt-1">
            Recepción, despacho y actualización de estados en tiempo real
          </p>
        </div>
      </div>

      {/* Filter Tabs by Status */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
        <button
          onClick={() => setStatusFilter('todos')}
          className={`px-3 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
            statusFilter === 'todos'
              ? 'bg-stone-900 text-white shadow-xs'
              : 'bg-white text-stone-600 border border-stone-200 hover:bg-stone-50'
          }`}
        >
          Todos ({orders.length})
        </button>

        {(
          [
            'nuevo',
            'confirmado',
            'en_preparacion',
            'en_camino',
            'listo_para_recoger',
            'completado',
            'cancelado',
          ] as OrderStatus[]
        ).map((st) => {
          const count = orders.filter((o) => o.status === st).length;
          return (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
                statusFilter === st
                  ? 'bg-orange-500 text-white shadow-xs'
                  : 'bg-white text-stone-600 border border-stone-200 hover:bg-stone-50'
              }`}
            >
              <span>{STATUS_LABELS[st]}</span>
              {count > 0 && (
                <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                  statusFilter === st ? 'bg-white text-orange-600' : 'bg-stone-100 text-stone-600'
                }`}>
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Orders List Cards */}
      <div className="space-y-4">
        {filteredOrders.length === 0 ? (
          <div className="py-16 text-center space-y-2 bg-white rounded-3xl border border-stone-200 p-8 max-w-md mx-auto">
            <ClipboardList className="w-12 h-12 text-stone-300 mx-auto" />
            <h3 className="text-base font-bold text-stone-800">No hay pedidos con este estado</h3>
            <p className="text-xs text-stone-400">
              Selecciona &quot;Todos&quot; para revisar la lista completa.
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {groupedOrders.map(([dateKey, ordersOfDay]) => {
              const dayTotal = ordersOfDay.reduce(
                (sum, o) => sum + (o.status === 'cancelado' ? 0 : o.total),
                0
              );
              return (
                <section key={dateKey} className="space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 rounded-2xl bg-white border border-stone-200 px-4 py-2.5 shadow-xs">
                    <h2 className="text-sm font-black text-stone-900">
                      {formatDateSpanish(new Date(dateKey + 'T00:00:00'))}
                    </h2>
                    <span className="text-xs text-stone-500">
                      {ordersOfDay.length} pedido(s) · Total: {formatCurrency(dayTotal)}
                    </span>
                  </div>
                  <div className="space-y-4">
                    {ordersOfDay.map((order) => {
                      const timeFormatted = new Date(order.created_at).toLocaleTimeString('es-PE', {
                        hour: '2-digit',
                        minute: '2-digit',
                      });

                      return (
                        <div
                          key={order.id}
                          className="bg-white rounded-3xl border border-stone-200 p-5 shadow-xs space-y-4 hover:border-orange-200 transition-all"
                        >
                {/* Header: Order info and status */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-stone-100">
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-base font-black text-orange-600 bg-orange-50 px-2.5 py-1 rounded-xl border border-orange-200">
                      #{order.order_number || order.id.slice(0, 6)}
                    </span>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-base font-bold text-stone-900">{order.customer_name}</h3>
                        <a
                          href={`https://api.whatsapp.com/send?phone=51${order.customer_phone.replace(/[^0-9]/g, '')}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-xs text-emerald-600 hover:text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded-lg border border-emerald-200"
                        >
                          <MessageCircle className="w-3.5 h-3.5" />
                          <span>{order.customer_phone}</span>
                        </a>
                      </div>
                      <span className="text-xs text-stone-400 flex items-center gap-1 mt-0.5">
                        <Clock className="w-3 h-3" />
                        <span>Hora: {timeFormatted}</span>
                      </span>
                    </div>
                  </div>

                  {/* Badge */}
                  <div className="flex items-center gap-2">
                    <span
                      className={`px-3 py-1 rounded-xl text-xs font-bold border ${
                        STATUS_COLORS[order.status] || 'bg-stone-100 text-stone-700'
                      }`}
                    >
                      {STATUS_LABELS[order.status] || order.status}
                    </span>
                  </div>
                </div>

                {/* Delivery and payment details */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs bg-stone-50 p-3.5 rounded-2xl">
                  <div>
                    <span className="text-stone-400 font-medium block">Modalidad:</span>
                    <span className="font-bold text-stone-800 flex items-center gap-1 mt-0.5">
                      {order.delivery_type === 'delivery' ? (
                        <>
                          <MapPin className="w-3.5 h-3.5 text-orange-500" /> Delivery
                        </>
                      ) : (
                        <>
                          <Store className="w-3.5 h-3.5 text-orange-500" /> Recojo en Local
                        </>
                      )}
                    </span>
                    {order.delivery_address && (
                      <p className="text-stone-600 mt-0.5 truncate">{order.delivery_address}</p>
                    )}
                  </div>

                  <div>
                    <span className="text-stone-400 font-medium block">Forma de Pago:</span>
                    <span className="font-bold text-stone-800 block mt-0.5">
                      {PAYMENT_LABELS[order.payment_method] || order.payment_method}
                    </span>
                  </div>

                  <div>
                    <span className="text-stone-400 font-medium block">Total a Cobrar:</span>
                    <span className="text-base font-black text-orange-600 block mt-0.5">
                      {formatCurrency(order.total)}
                    </span>
                  </div>
                </div>

                {/* Constancia de pago (Yape / Plin / Lemon) */}
                {(requiresPaymentReceipt(order.payment_method) || order.payment_receipt_path) && (
                  <div className="flex flex-wrap items-center gap-2">
                    {order.payment_receipt_path ? (
                      <button
                        onClick={() => handleViewReceipt(order)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 text-xs font-bold cursor-pointer"
                      >
                        <Paperclip className="w-3.5 h-3.5" />
                        <span>Ver constancia de pago</span>
                      </button>
                    ) : (
                      <span className="text-[11px] font-bold uppercase tracking-wider text-stone-400">
                        Constancia de pago:
                      </span>
                    )}
                    <PaymentReceiptUpload
                      compact
                      orderId={order.id}
                      onUploaded={(path) => handleReceiptUploaded(order.id, path)}
                      label={order.payment_receipt_path ? 'Reemplazar' : 'Adjuntar'}
                    />
                  </div>
                )}

                {/* Order Items */}
                {order.order_items && order.order_items.length > 0 && (
                  <div className="space-y-1.5">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-stone-400">
                      Platos Pedidos:
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {order.order_items.map((it, idx) => (
                        <div
                          key={idx}
                          className="p-2 rounded-xl bg-white border border-stone-200 text-xs flex justify-between items-center"
                        >
                          <span className="font-semibold text-stone-800 truncate">
                            {it.quantity}x {it.dish_name}
                          </span>
                          <span className="text-stone-500 font-bold shrink-0 ml-2">
                            {formatCurrency(it.quantity * it.unit_price)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {order.notes && (
                  <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900">
                    <strong className="font-bold">Nota del cliente:</strong> {order.notes}
                  </div>
                )}

                {/* Change Status Action Buttons */}
                <div className="pt-2 border-t border-stone-100 flex flex-wrap items-center justify-between gap-2">
                  <span className="text-xs font-bold text-stone-400">Actualizar Estado:</span>

                  <div className="flex flex-wrap items-center gap-1.5">
                    {order.status === 'nuevo' && (
                      <button
                        onClick={() => handleUpdateStatus(order.id, 'confirmado')}
                        className="px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold shadow-xs cursor-pointer"
                      >
                        Confirmar Pedido
                      </button>
                    )}

                    {order.status === 'confirmado' && (
                      <button
                        onClick={() => handleUpdateStatus(order.id, 'en_preparacion')}
                        className="px-3 py-1.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold shadow-xs cursor-pointer"
                      >
                        Pasar a Cocina 🍳
                      </button>
                    )}

                    {order.status === 'en_preparacion' && (
                      <>
                        {order.delivery_type === 'delivery' ? (
                          <button
                            onClick={() => handleUpdateStatus(order.id, 'en_camino')}
                            className="px-3 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold shadow-xs cursor-pointer"
                          >
                            En Camino 🛵
                          </button>
                        ) : (
                          <button
                            onClick={() => handleUpdateStatus(order.id, 'listo_para_recoger')}
                            className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-xs cursor-pointer"
                          >
                            Listo para Recoger 🏠
                          </button>
                        )}
                      </>
                    )}

                    {(order.status === 'en_camino' || order.status === 'listo_para_recoger') && (
                      <button
                        onClick={() => handleUpdateStatus(order.id, 'completado')}
                        className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs cursor-pointer"
                      >
                        Completar Entrega ✅
                      </button>
                    )}

                    {order.status !== 'completado' && order.status !== 'cancelado' && (
                      <button
                        onClick={() => {
                          if (confirm('¿Deseas marcar este pedido como cancelado?')) {
                            handleUpdateStatus(order.id, 'cancelado');
                          }
                        }}
                        className="px-3 py-1.5 rounded-xl bg-stone-100 hover:bg-red-50 text-stone-500 hover:text-red-600 text-xs font-bold cursor-pointer"
                      >
                        Cancelar
                      </button>
                    )}

                    <button
                      onClick={() => handleDeleteOrder(order)}
                      className="px-3 py-1.5 rounded-xl bg-red-50 hover:bg-red-600 text-red-600 hover:text-white text-xs font-bold cursor-pointer flex items-center gap-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      Eliminar
                    </button>
                  </div>
                </div>

                      </div>
                    );
                  })}
                </div>
              </section>
            );
          })}
        </div>
        )}
      </div>

    </div>
  );
}
