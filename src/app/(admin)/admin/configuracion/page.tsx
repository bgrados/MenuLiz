'use client';

import React, { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { RestaurantSettings } from '@/types';
import { DEFAULT_WHATSAPP_NUMBER, RESTAURANT_NAME } from '@/lib/constants';
import { formatCurrency } from '@/lib/utils';
import { Settings, Save, CheckCircle2, Loader2, MessageCircle, Truck, UtensilsCrossed } from 'lucide-react';

export default function AdminConfiguracionPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [whatsappNumber, setWhatsappNumber] = useState(DEFAULT_WHATSAPP_NUMBER);
  const [deliveryFee, setDeliveryFee] = useState(3.0);
  const [menuPrice, setMenuPrice] = useState(14.0);
  const [restaurantName, setRestaurantName] = useState(RESTAURANT_NAME);
  const [address, setAddress] = useState('Atención en local y delivery en zona');
  const [openingHours, setOpeningHours] = useState('Lunes a Domingo: 11:30 AM - 4:30 PM');

  const supabase = createClient();

  useEffect(() => {
    async function loadSettings() {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('restaurant_settings')
          .select('*')
          .eq('id', 'main')
          .maybeSingle();

        if (error && !error.message?.includes('relation')) {
          console.warn('Error cargando configuración:', error);
        }

        if (data) {
          setWhatsappNumber(data.whatsapp_number || DEFAULT_WHATSAPP_NUMBER);
          setDeliveryFee(Number(data.delivery_fee ?? 3.0));
          setMenuPrice(Number(data.menu_price ?? 14.0));
          setRestaurantName(data.restaurant_name || RESTAURANT_NAME);
          setAddress(data.address || 'Atención en local y delivery en zona');
          setOpeningHours(data.opening_hours || 'Lunes a Domingo: 11:30 AM - 4:30 PM');
        }
      } catch (err) {
        console.warn('Error cargando configuración:', err);
      } finally {
        setLoading(false);
      }
    }

    loadSettings();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSaved(false);
    setSaveError(null);

    try {
      const { error } = await supabase
        .from('restaurant_settings')
        .upsert({
          id: 'main',
          whatsapp_number: whatsappNumber.trim(),
          delivery_fee: deliveryFee,
          menu_price: menuPrice,
          restaurant_name: restaurantName.trim(),
          address: address.trim(),
          opening_hours: openingHours.trim(),
        });

      if (error) {
        console.error('Error guardando configuración:', error);
        const msg = `No se pudo guardar la configuración en Supabase.${error.message ? ` ${error.message}` : ''}${error.code ? ` (Código: ${error.code})` : ''}`;
        setSaveError(msg);
        alert(msg);
        return;
      }

      setSaveError(null);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      console.error('Error guardando configuración:', err);
      alert('No se pudo guardar la configuración.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-stone-900 tracking-tight">
            Configuración
          </h1>
          <p className="text-xs sm:text-sm text-stone-500 mt-1">
            Administra el teléfono de WhatsApp y datos básicos del restaurante
          </p>
        </div>
      </div>

      {loading ? (
        <div className="p-6 bg-white border border-stone-200 rounded-3xl">Cargando configuración...</div>
      ) : (
        <form onSubmit={handleSave} className="bg-white border border-stone-200 rounded-3xl p-6 space-y-6">
          <div className="space-y-2">
            <label className="text-xs font-bold text-stone-700">Número de WhatsApp para recibir pedidos</label>
            <div className="relative">
              <MessageCircle className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
              <input
                type="tel"
                required
                value={whatsappNumber}
                onChange={(e) => setWhatsappNumber(e.target.value)}
                placeholder="51999999999"
                className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-stone-200 text-xs sm:text-sm"
              />
            </div>
            <p className="text-[11px] text-stone-500">
              Formato recomendado: código de país + número, sin signos (+). Ejemplo: `51999999999`
            </p>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-stone-700">Tarifa de delivery (S/)</label>
            <div className="relative">
              <Truck className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
              <input
                type="number"
                step="0.50"
                required
                value={deliveryFee}
                onChange={(e) => setDeliveryFee(Number(e.target.value) || 0)}
                className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-stone-200 text-xs sm:text-sm"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-stone-700">Precio del menú completo (S/)</label>
            <div className="relative">
              <UtensilsCrossed className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
              <input
                type="number"
                step="0.50"
                min="0"
                required
                value={menuPrice}
                onChange={(e) => setMenuPrice(Number(e.target.value) || 0)}
                className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-stone-200 text-xs sm:text-sm"
              />
            </div>
            <p className="text-[11px] text-stone-500">
              Precio del combo (1 entrada + 1 segundo + 1 refresco). Este valor se usa en toda la app:
              carrito, menú del día, enlace para compartir y previsualización.
            </p>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-stone-700">Nombre del restaurante</label>
            <input
              type="text"
              required
              value={restaurantName}
              onChange={(e) => setRestaurantName(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 text-xs sm:text-sm"
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-stone-700">Dirección del local</label>
            <input
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="Ej: Av. Principal 123, Lima"
              className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 text-xs sm:text-sm"
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-stone-700">Horario de atención</label>
            <input
              type="text"
              value={openingHours}
              onChange={(e) => setOpeningHours(e.target.value)}
              placeholder="Ej: Lunes a Domingo: 11:30 AM - 4:30 PM. Festivos cerrado."
              className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 text-xs sm:text-sm"
            />
            <p className="text-[11px] text-stone-500">
              Texto libre: puedes indicar días cerrados (ej. “25 dic: cerrado”).
            </p>
          </div>

          <div className="flex items-center justify-end gap-2 pt-4 border-t border-stone-100">
            {saved && (
              <span className="text-xs font-bold text-emerald-600 flex items-center gap-1">
                <CheckCircle2 className="w-4 h-4" /> Guardado
              </span>
            )}
            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs sm:text-sm disabled:opacity-50"
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              <span>{saving ? 'Guardando...' : 'Guardar configuración'}</span>
            </button>
          </div>
          {saveError && (
            <div className="rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs p-3">
              {saveError}
            </div>
          )}
        </form>
      )}
    </div>
  );
}
