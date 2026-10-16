'use client';

import React, { Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { CheckCircle2, MessageCircle, Home, Sparkles, Clock, MapPin, Store } from 'lucide-react';
import { RESTAURANT_NAME, DEFAULT_WHATSAPP_NUMBER } from '@/lib/constants';

function ConfirmationContent() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get('orderId') || '#PED-101';
  const name = searchParams.get('name') || 'Estimado cliente';
  const total = searchParams.get('total') || '14.00';
  const type = searchParams.get('type') || 'delivery';

  return (
    <div className="max-w-md mx-auto py-10 text-center space-y-6">
      
      {/* Icon Badge */}
      <div className="w-20 h-20 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-md shadow-emerald-500/15 animate-bounce">
        <CheckCircle2 className="w-10 h-10" />
      </div>

      <div className="space-y-2">
        <span className="text-xs font-black uppercase tracking-wider text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
          ¡Pedido Registrado con Éxito!
        </span>
        <h1 className="text-2xl sm:text-3xl font-black text-stone-900">
          ¡Muchas gracias, {name}!
        </h1>
        <p className="text-xs sm:text-sm text-stone-500">
          Tu pedido <strong className="text-stone-800 font-bold">{orderId}</strong> ha sido enviado a la dueña de {RESTAURANT_NAME} por WhatsApp para ser preparado.
        </p>
      </div>

      {/* Summary Card */}
      <div className="bg-white rounded-3xl border border-stone-200 p-5 shadow-xs text-left space-y-3 text-xs sm:text-sm">
        <div className="flex items-center justify-between pb-2 border-b border-stone-100">
          <span className="text-stone-500 font-medium">Estado del Pedido</span>
          <span className="font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-lg border border-emerald-200">
            📩 Recibido
          </span>
        </div>

        <div className="flex items-center justify-between pb-2 border-b border-stone-100">
          <span className="text-stone-500 font-medium">Modalidad</span>
          <span className="font-bold text-stone-800 flex items-center gap-1">
            {type === 'delivery' ? (
              <>
                <MapPin className="w-3.5 h-3.5 text-orange-500" /> Delivery
              </>
            ) : (
              <>
                <Store className="w-3.5 h-3.5 text-orange-500" /> Recojo en Local
              </>
            )}
          </span>
        </div>

        <div className="flex items-center justify-between pt-1">
          <span className="text-stone-500 font-medium">Total a Pagar</span>
          <span className="text-base font-black text-orange-600">S/ {total}</span>
        </div>
      </div>

      {/* Time Notice */}
      <div className="p-4 rounded-2xl bg-orange-50 border border-orange-200 text-orange-950 text-xs flex items-center gap-2.5 text-left">
        <Clock className="w-5 h-5 text-orange-500 shrink-0" />
        <p>
          El tiempo estimado de preparación es de <strong className="font-bold">20 a 35 minutos</strong>. Te confirmaremos por WhatsApp en cuanto tu pedido esté en camino o listo para recoger.
        </p>
      </div>

      {/* Action Buttons */}
      <div className="pt-2 flex flex-col gap-2.5">
        <a
          href={`https://api.whatsapp.com/send?phone=${DEFAULT_WHATSAPP_NUMBER}`}
          target="_blank"
          rel="noopener noreferrer"
          className="w-full py-3.5 px-5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 active:scale-[0.98] text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/20 transition-all"
        >
          <MessageCircle className="w-4 h-4" />
          <span>Escribir a la Dueña por WhatsApp</span>
        </a>

        <Link
          href="/"
          className="w-full py-3 px-5 rounded-2xl border border-stone-200 bg-white hover:bg-stone-50 text-stone-700 font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-xs"
        >
          <Home className="w-4 h-4" />
          <span>Volver al Inicio</span>
        </Link>
      </div>

    </div>
  );
}

export default function ConfirmationPage() {
  return (
    <Suspense fallback={<div className="py-20 text-center text-xs text-stone-400">Cargando confirmación...</div>}>
      <ConfirmationContent />
    </Suspense>
  );
}
