'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useCart } from '@/hooks/use-cart';
import { DeliveryType, PaymentMethod, OrderItem } from '@/types';
import { DELIVERY_FEE, PAYMENT_LABELS } from '@/lib/constants';
import { formatCurrency } from '@/lib/utils';
import { getDishImage } from '@/lib/dish-images';
import { generateWhatsAppMessage, openWhatsApp } from '@/lib/whatsapp';
import { createClient } from '@/lib/supabase/client';
import { Trash2, Plus, Minus, ArrowLeft, Send, MapPin, Store, CreditCard, User, Phone, FileText, CheckCircle2 } from 'lucide-react';
import confetti from 'canvas-confetti';

export default function CustomerCartPage() {
  const router = useRouter();
  const {
    items,
    removeItem,
    updateQuantity,
    clearCart,
    fullCombosCount,
    comboTotal,
    leftoverTotal,
    subtotal,
  } = useCart();

  const [deliveryType, setDeliveryType] = useState<DeliveryType>('delivery');
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [deliveryCoords, setDeliveryCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [mapsLink, setMapsLink] = useState('');
  // Dirección para la que se capturó la ubicación (para avisar si el cliente la cambia)
  const [locationAddress, setLocationAddress] = useState('');
  const [locStatus, setLocStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [locError, setLocError] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('yape');
  const [notes, setNotes] = useState('');
  const [marketingConsent, setMarketingConsent] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [configuredDeliveryFee, setConfiguredDeliveryFee] = useState(DELIVERY_FEE);

  React.useEffect(() => {
    let cancelled = false;

    async function loadSettings() {
      try {
        const { data } = await createClient().from('restaurant_settings').select('delivery_fee').eq('id', 'main').maybeSingle();
        if (!cancelled && data?.delivery_fee !== null && data?.delivery_fee !== undefined) {
          setConfiguredDeliveryFee(Number(data.delivery_fee));
        }
      } catch {
        // keep default
      }

      // Autocompletar datos del último cliente registrado en este navegador
      try {
        const raw = window.localStorage.getItem('menuliz_customer_v1');
        if (!cancelled && raw) {
          const saved = JSON.parse(raw);
          if (saved?.name) setCustomerName(saved.name);
          if (saved?.phone) setCustomerPhone(saved.phone);
          if (saved?.address) setDeliveryAddress(saved.address);
          if (typeof saved?.marketingConsent === 'boolean') setMarketingConsent(saved.marketingConsent);

          // Ubicación guardada de un pedido anterior (para no volver a compartirla)
          const hasSavedCoords = typeof saved?.lat === 'number' && typeof saved?.lng === 'number';
          if (hasSavedCoords) setDeliveryCoords({ lat: saved.lat, lng: saved.lng });
          if (typeof saved?.mapsLink === 'string') setMapsLink(saved.mapsLink);
          if (typeof saved?.locationAddress === 'string') setLocationAddress(saved.locationAddress);
          if (hasSavedCoords || (typeof saved?.mapsLink === 'string' && saved.mapsLink.trim())) {
            setLocStatus('success');
          }
        }
      } catch {
        // ignore
      }
    }

    loadSettings();

    return () => {
      cancelled = true;
    };
  }, []);

  const deliveryFee = deliveryType === 'delivery' ? configuredDeliveryFee : 0.00;
  const total = subtotal + deliveryFee;

  const normalizeMapsLink = (value: string) => {
    const v = value.trim();
    if (!v) return '';
    return /^https?:\/\//i.test(v) ? v : `https://${v}`;
  };

  const hasLocation = !!deliveryCoords || mapsLink.trim().length > 0;
  const locationViewUrl = deliveryCoords
    ? `https://www.google.com/maps?q=${deliveryCoords.lat},${deliveryCoords.lng}`
    : normalizeMapsLink(mapsLink);
  const isLocationStale =
    hasLocation &&
    locationAddress.trim().length > 0 &&
    locationAddress.trim() !== deliveryAddress.trim();

  const handleShareLocation = () => {
    if (typeof navigator === 'undefined' || !navigator.geolocation) {
      setLocStatus('error');
      setLocError('Tu dispositivo no permite compartir la ubicación. Puedes pegar tu link de Google Maps abajo.');
      return;
    }

    setLocStatus('loading');
    setLocError('');

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setDeliveryCoords({
          lat: Number(pos.coords.latitude.toFixed(6)),
          lng: Number(pos.coords.longitude.toFixed(6)),
        });
        setMapsLink('');
        setLocationAddress(deliveryAddress);
        setLocStatus('success');
      },
      (err) => {
        setLocStatus('error');
        setLocError(
          err.code === err.PERMISSION_DENIED
            ? 'No nos diste permiso de ubicación. Puedes pegar tu link de Google Maps abajo.'
            : 'No pudimos obtener tu ubicación. Puedes pegar tu link de Google Maps abajo.'
        );
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };

  const handleClearLocation = () => {
    setDeliveryCoords(null);
    setMapsLink('');
    setLocationAddress('');
    setLocStatus('idle');
    setLocError('');
  };

  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();

    if (items.length === 0) return;

    if (!customerName.trim()) {
      alert('Por favor ingresa tu nombre.');
      return;
    }
    if (!customerPhone.trim()) {
      alert('Por favor ingresa tu número de teléfono.');
      return;
    }
    if (deliveryType === 'delivery' && !deliveryAddress.trim()) {
      alert('Por favor ingresa la dirección de entrega para el delivery.');
      return;
    }

    setIsSubmitting(true);

    try {
      const supabase = createClient();

      // Validar stock actual en tiempo real antes de confirmar
      const todayStr = new Date().toISOString().split('T')[0];
      const { data: stockRows } = await supabase
        .from('daily_menus')
        .select('dish_id, stock, is_available')
        .eq('date', todayStr)
        .in('dish_id', items.map((i) => i.dish.id));

      const stockMap = new Map((stockRows || []).map((r) => [r.dish_id, r]));
      for (const item of items) {
        const row = stockMap.get(item.dish.id);
        const available = row?.stock ?? 0;
        if (!row || row.is_available === false || available < item.quantity) {
          alert(`Lo sentimos, "${item.dish.name}" ya no tiene stock suficiente (${available} disponibles). Ajusta tu pedido.`);
          setIsSubmitting(false);
          return;
        }
      }

      // 1. Prepare Order Object
      const orderPayload = {
        customer_name: customerName.trim(),
        customer_phone: customerPhone.trim(),
        delivery_type: deliveryType,
        delivery_address: deliveryType === 'delivery' ? deliveryAddress.trim() : null,
        delivery_fee: deliveryFee,
        subtotal: subtotal,
        total: total,
        payment_method: paymentMethod,
        notes: notes.trim() || null,
        status: 'nuevo' as const,
      };

      // 2. Prepare Order Items
      const orderItemsPayload: OrderItem[] = items.map((i) => ({
        dish_id: i.dish.id,
        dish_name: i.dish.name,
        category: i.dish.category,
        quantity: i.quantity,
        unit_price: i.unitPrice,
        is_combo_part: i.dish.category !== 'a_la_carta' && fullCombosCount > 0,
      }));

      let orderId = `PED-${Date.now().toString().slice(-6)}`;

      // 3. Insert into Supabase (graceful fallback if table not yet migrated)
      try {
        // Usamos una función RPC SECURITY DEFINER para insertar el pedido
        // sin requerir permisos de SELECT directo al rol anon (evita RLS).
        const { data: rpcData, error: orderErr } = await supabase.rpc('create_order', {
          p_customer_name: orderPayload.customer_name,
          p_customer_phone: orderPayload.customer_phone,
          p_delivery_type: orderPayload.delivery_type,
          p_delivery_address: orderPayload.delivery_address,
          p_delivery_fee: orderPayload.delivery_fee,
          p_subtotal: orderPayload.subtotal,
          p_total: orderPayload.total,
          p_payment_method: orderPayload.payment_method,
          p_notes: orderPayload.notes,
          p_status: orderPayload.status,
        });

        // rpc devuelve un array cuando la función retorna TABLE
        const createdOrder = Array.isArray(rpcData) ? rpcData[0] : rpcData;

        if (orderErr) {
          console.error('Error guardando pedido en Supabase:', orderErr);
          alert('No se pudo guardar el pedido en la base de datos. Revisa las políticas RLS o la consola.');
        }

        if (!orderErr && createdOrder) {
          orderId = createdOrder.order_number ? `#${createdOrder.order_number}` : String(createdOrder.id).slice(0, 8);

          // Insert order items (anon tiene permiso de INSERT)
          const itemsWithOrderId = orderItemsPayload.map((it) => ({
            ...it,
            order_id: createdOrder.id,
          }));

          const { error: itemsErr } = await supabase.from('order_items').insert(itemsWithOrderId);
          if (itemsErr) {
            console.error('Error insertando items del pedido:', itemsErr);
          }

          // Base de clientes: upsert por teléfono (SP security definer, anon-safe)
          try {
            await supabase.rpc('upsert_customer', {
              p_phone: orderPayload.customer_phone,
              p_name: orderPayload.customer_name,
              p_address: deliveryType === 'delivery' ? deliveryAddress.trim() : null,
              p_marketing_consent: marketingConsent,
              p_total: total,
            });
          } catch (custErr) {
            console.warn('No se pudo actualizar la base de clientes:', custErr);
          }
        }
      } catch (dbErr) {
        console.warn('Database insert failed, proceeding with WhatsApp dispatch:', dbErr);
      }

      // 4. Trigger Celebration Confetti
      try {
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 },
        });
      } catch {
        // ignore
      }

      // Read owner's configured WhatsApp number, falling back to the env variable
      let ownerPhone = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '51999999999';
      try {
        const { data: settings } = await supabase
          .from('restaurant_settings')
          .select('whatsapp_number')
          .eq('id', 'main')
          .maybeSingle();
        if (settings?.whatsapp_number) ownerPhone = settings.whatsapp_number;
      } catch (cfgErr) {
        console.warn('No se pudo leer la configuración de WhatsApp:', cfgErr);
      }

      // 5. Generate and Open WhatsApp Message
      const whatsappMsg = generateWhatsAppMessage(
        { ...orderPayload, order_number: parseInt(orderId.replace(/[^0-9]/g, '')) || undefined },
        orderItemsPayload,
        deliveryType === 'delivery'
          ? {
              lat: deliveryCoords?.lat ?? null,
              lng: deliveryCoords?.lng ?? null,
              mapsLink: mapsLink.trim() ? normalizeMapsLink(mapsLink) : null,
            }
          : undefined
      );

      openWhatsApp(whatsappMsg, ownerPhone);

      // Autoguardar datos del cliente en este navegador (autocompletado futuro).
      // Se conservan dirección y ubicación aunque el pedido sea para recojo,
      // para que el cliente que pide seguido no tenga que volver a escribirlas.
      try {
        let prev: Record<string, unknown> = {};
        try {
          const rawPrev = window.localStorage.getItem('menuliz_customer_v1');
          prev = rawPrev ? JSON.parse(rawPrev) : {};
        } catch {
          prev = {};
        }

        const saved: Record<string, unknown> = {
          ...prev,
          name: customerName.trim(),
          phone: customerPhone.trim(),
          marketingConsent,
        };

        if (deliveryType === 'delivery') {
          saved.address = deliveryAddress.trim();
          saved.lat = deliveryCoords?.lat;
          saved.lng = deliveryCoords?.lng;
          saved.mapsLink = mapsLink.trim() ? normalizeMapsLink(mapsLink) : '';
          saved.locationAddress = locationAddress.trim() || deliveryAddress.trim();
        }

        window.localStorage.setItem('menuliz_customer_v1', JSON.stringify(saved));
      } catch {
        // ignore
      }

      // 6. Clear cart and redirect to confirmation
      clearCart();
      router.push(`/confirmacion?orderId=${encodeURIComponent(orderId)}&name=${encodeURIComponent(customerName)}&total=${total.toFixed(2)}&type=${deliveryType}`);
    } catch (err) {
      console.error('Error submitting order:', err);
      alert('Ocurrió un error al procesar el pedido. Por favor intenta nuevamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="py-16 text-center space-y-4 bg-white rounded-3xl border border-stone-200 p-8 max-w-md mx-auto my-8">
        <div className="w-16 h-16 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center mx-auto">
          <Store className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-black text-stone-900">Tu canasta está vacía</h2>
        <p className="text-xs text-stone-500">
          Aún no has agregado ningún plato. Visita nuestro Menú del Día o la Carta para armar tu pedido.
        </p>
        <div className="pt-2 flex flex-col gap-2">
          <Link
            href="/menu"
            className="w-full py-3 px-5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs shadow-md transition-all"
          >
            Ver Menú del Día (S/ 14)
          </Link>
          <Link
            href="/carta"
            className="w-full py-3 px-5 rounded-xl border border-stone-200 text-stone-700 hover:bg-stone-50 font-bold text-xs transition-all"
          >
            Ver Platos a la Carta
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-3xl mx-auto">
      
      {/* Header */}
      <div className="flex items-center justify-between border-b border-stone-200 pb-4">
        <Link
          href="/menu"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-stone-500 hover:text-stone-900"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Seguir pidiendo</span>
        </Link>
        <button
          onClick={clearCart}
          className="text-xs font-bold text-stone-400 hover:text-red-600 transition-colors cursor-pointer"
        >
          Vaciar Canasta
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Column: Items List */}
        <div className="lg:col-span-7 space-y-4">
          <h2 className="text-xl font-black text-stone-900">Tu Pedido</h2>

          {/* Items breakdown */}
          <div className="bg-white rounded-3xl border border-stone-200 divide-y divide-stone-100 overflow-hidden shadow-xs">
            {items.map((item) => (
              <div key={item.id} className="p-4 flex items-center justify-between gap-3">
                <img
                  src={getDishImage(item.dish.name, item.dish.image_url)}
                  alt={item.dish.name}
                  className="w-14 h-14 rounded-2xl object-cover shrink-0 border border-stone-200"
                />

                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-bold text-stone-900 truncate">{item.dish.name}</h4>
                  <p className="text-xs font-bold text-orange-600 mt-0.5">
                    {formatCurrency(item.unitPrice * item.quantity)}
                    <span className="text-stone-400 font-normal ml-1">
                      ({formatCurrency(item.unitPrice)} c/u)
                    </span>
                  </p>
                </div>

                {/* Quantity */}
                <div className="flex items-center gap-1 bg-stone-100 p-1 rounded-xl">
                  <button
                    onClick={() => updateQuantity(item.id, item.quantity - 1)}
                    className="w-6 h-6 rounded-lg bg-white flex items-center justify-center text-stone-700 hover:bg-stone-200 shadow-xs cursor-pointer"
                  >
                    <Minus className="w-3 h-3" />
                  </button>
                  <span className="text-xs font-black w-6 text-center">{item.quantity}</span>
                  <button
                    onClick={() => updateQuantity(item.id, item.quantity + 1)}
                    className="w-6 h-6 rounded-lg bg-white flex items-center justify-center text-stone-700 hover:bg-stone-200 shadow-xs cursor-pointer"
                  >
                    <Plus className="w-3 h-3" />
                  </button>
                </div>

                {/* Trash */}
                <button
                  onClick={() => removeItem(item.id)}
                  className="p-1.5 text-stone-400 hover:text-red-500 transition-colors cursor-pointer"
                  title="Eliminar plato"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>

          {/* Combo badge note */}
          {fullCombosCount > 0 && (
            <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 flex items-start gap-2.5">
              <CheckCircle2 className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              <div className="text-xs">
                <p className="font-bold">
                  {fullCombosCount} {fullCombosCount === 1 ? 'Combo Menú Completo aplicado' : 'Combos Menú Completos aplicados'} (S/ 14.00 c/u)
                </p>
                <p className="text-amber-700 mt-0.5">
                  1 Entrada + 1 Segundo + 1 Refresco = S/ 14. {leftoverTotal > 0 && 'Los ítems adicionales se calculan a su precio individual.'}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Checkout Form */}
        <div className="lg:col-span-5 bg-white rounded-3xl border border-stone-200 p-6 shadow-sm space-y-6">
          <h3 className="text-lg font-black text-stone-900">Datos para la Entrega</h3>

          <form id="checkout-form" onSubmit={handleSubmitOrder} className="space-y-4">
            
            {/* Delivery Type */}
            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1.5">Tipo de Entrega</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setDeliveryType('delivery')}
                  className={`p-3 rounded-2xl border text-xs font-bold flex flex-col items-center gap-1 transition-all cursor-pointer ${
                    deliveryType === 'delivery'
                      ? 'border-orange-500 bg-orange-50 text-orange-950 shadow-xs'
                      : 'border-stone-200 text-stone-600 hover:border-stone-300'
                  }`}
                >
                  <MapPin className={`w-4 h-4 ${deliveryType === 'delivery' ? 'text-orange-500' : 'text-stone-400'}`} />
                  <span>Delivery (+S/ 3.00)</span>
                </button>

                <button
                  type="button"
                  onClick={() => setDeliveryType('recojo')}
                  className={`p-3 rounded-2xl border text-xs font-bold flex flex-col items-center gap-1 transition-all cursor-pointer ${
                    deliveryType === 'recojo'
                      ? 'border-orange-500 bg-orange-50 text-orange-950 shadow-xs'
                      : 'border-stone-200 text-stone-600 hover:border-stone-300'
                  }`}
                >
                  <Store className={`w-4 h-4 ${deliveryType === 'recojo' ? 'text-orange-500' : 'text-stone-400'}`} />
                  <span>Recojo en Local (Gratis)</span>
                </button>
              </div>
            </div>

            {/* Name */}
            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">Tu Nombre Completo *</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
                <input
                  type="text"
                  required
                  placeholder="Ej: Benjamín Grados"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-stone-200 text-xs sm:text-sm focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 shadow-xs"
                />
              </div>
            </div>

            {/* Phone */}
            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">Teléfono / WhatsApp *</label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
                <input
                  type="tel"
                  required
                  placeholder="Ej: 999 888 777"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-stone-200 text-xs sm:text-sm focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 shadow-xs"
                />
              </div>
            </div>

            {/* Address + Ubicación (Delivery only) */}
            {deliveryType === 'delivery' && (
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">Dirección de Entrega *</label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
                    <input
                      type="text"
                      required
                      placeholder="Calle, número, piso o referencia..."
                      value={deliveryAddress}
                      onChange={(e) => setDeliveryAddress(e.target.value)}
                      className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-stone-200 text-xs sm:text-sm focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 shadow-xs"
                    />
                  </div>
                </div>

                {/* Ubicación para el motorizado */}
                <div className="rounded-2xl border border-stone-200 bg-stone-50 p-3 space-y-2">
                  <div>
                    <p className="text-xs font-bold text-stone-700 flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-orange-500" />
                      Ubicación para el motorizado (opcional)
                    </p>
                    <p className="text-[10px] text-stone-400 mt-0.5">
                      Envía un pin para que tu pedido llegue más rápido y sin confusiones.
                    </p>
                  </div>

                  {hasLocation ? (
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5">
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-100 px-2 py-1 rounded-lg">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Ubicación lista
                      </span>
                      {locationViewUrl && (
                        <a
                          href={locationViewUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="text-[11px] font-bold text-orange-600 underline"
                        >
                          Ver en mapa
                        </a>
                      )}
                      <button
                        type="button"
                        onClick={handleShareLocation}
                        disabled={locStatus === 'loading'}
                        className="text-[11px] font-bold text-stone-600 underline cursor-pointer disabled:opacity-50"
                      >
                        {locStatus === 'loading' ? 'Actualizando…' : 'Actualizar'}
                      </button>
                      <button
                        type="button"
                        onClick={handleClearLocation}
                        className="text-[11px] font-bold text-red-500 underline cursor-pointer"
                      >
                        Quitar
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={handleShareLocation}
                      disabled={locStatus === 'loading'}
                      className="w-full py-2 px-3 rounded-xl border border-orange-300 bg-white text-orange-700 text-xs font-bold hover:bg-orange-50 inline-flex items-center justify-center gap-1.5 transition-all cursor-pointer disabled:opacity-50"
                    >
                      <MapPin className="w-3.5 h-3.5" />
                      {locStatus === 'loading' ? 'Obteniendo ubicación…' : 'Usar mi ubicación actual'}
                    </button>
                  )}

                  {isLocationStale && (
                    <p className="text-[10px] font-semibold text-amber-600">
                      Cambiaste la dirección. Toca “Actualizar” para que el pin coincida con la nueva.
                    </p>
                  )}

                  {locStatus === 'error' && locError && (
                    <p className="text-[10px] font-semibold text-amber-700">{locError}</p>
                  )}

                  {!deliveryCoords && (
                    <div>
                      <label className="block text-[10px] font-bold text-stone-500 mb-1">
                        ¿No funciona? Pega tu link de Google Maps (opcional)
                      </label>
                      <input
                        type="url"
                        inputMode="url"
                        placeholder="https://maps.app.goo.gl/..."
                        value={mapsLink}
                        onChange={(e) => {
                          setMapsLink(e.target.value);
                          setLocationAddress(deliveryAddress);
                          if (locStatus === 'error') setLocStatus('idle');
                        }}
                        className="w-full px-3 py-2 rounded-xl border border-stone-200 text-xs focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 shadow-xs"
                      />
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Payment Method */}
            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1.5">Método de Pago</label>
              <div className="grid grid-cols-2 gap-2">
                {(['yape', 'plin', 'efectivo', 'lemon'] as PaymentMethod[]).map((p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setPaymentMethod(p)}
                    className={`p-2.5 rounded-xl border text-xs font-bold text-left transition-all cursor-pointer ${
                      paymentMethod === p
                        ? 'border-orange-500 bg-orange-50 text-orange-950 shadow-xs'
                        : 'border-stone-200 text-stone-600 hover:border-stone-300'
                    }`}
                  >
                    {PAYMENT_LABELS[p]}
                  </button>
                ))}
              </div>
            </div>

            {/* Notes */}
            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">Notas especiales (Opcional)</label>
              <div className="relative">
                <FileText className="absolute left-3 top-2.5 w-4 h-4 text-stone-400" />
                <textarea
                  rows={2}
                  placeholder="Ej: Ají aparte, sin cebolla, traer cambio de S/ 50..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 rounded-xl border border-stone-200 text-xs sm:text-sm focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 shadow-xs"
                />
              </div>
            </div>

            {/* Consentimiento para comunicaciones */}
            <label className="flex items-start gap-2 text-xs text-stone-600 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={marketingConsent}
                onChange={(e) => setMarketingConsent(e.target.checked)}
                className="mt-0.5 w-4 h-4 accent-orange-500 rounded cursor-pointer"
              />
              <span>Quiero recibir el menú del día y promociones por WhatsApp (opcional)</span>
            </label>

            {/* Price breakdown */}
            <div className="pt-3 border-t border-stone-100 space-y-1.5 text-xs">
              <div className="flex justify-between text-stone-500">
                <span>Subtotal Platos</span>
                <span className="font-bold text-stone-800">{formatCurrency(subtotal)}</span>
              </div>
              {deliveryType === 'delivery' && (
                <div className="flex justify-between text-stone-500">
                  <span>Costo de Delivery</span>
                  <span className="font-bold text-stone-800">{formatCurrency(deliveryFee)}</span>
                </div>
              )}
              <div className="flex justify-between text-base font-black text-stone-900 pt-2 border-t border-stone-200">
                <span>Total a Pagar</span>
                <span className="text-orange-600">{formatCurrency(total)}</span>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-4 px-6 rounded-2xl bg-emerald-600 hover:bg-emerald-700 active:scale-[0.98] text-white font-black text-sm shadow-xl shadow-emerald-600/25 flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50"
            >
              <Send className="w-4 h-4" />
              <span>{isSubmitting ? 'Procesando...' : 'Confirmar y Enviar a WhatsApp'}</span>
            </button>

            <p className="text-[11px] text-center text-stone-400 leading-tight">
              Se guardará tu pedido y se abrirá WhatsApp con el mensaje prellenado para la dueña de MenuLiz.
            </p>

          </form>
        </div>

      </div>

    </div>
  );
}
