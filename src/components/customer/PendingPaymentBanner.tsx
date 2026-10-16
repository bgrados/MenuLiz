'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { AlertCircle, ChevronRight, X } from 'lucide-react';
import {
  clearPendingPayment,
  getPendingPayment,
  paymentPath,
  type PendingPayment,
} from '@/lib/pending-payment';

/**
 * Aviso persistente para quien hizo un pedido con Yape/Plin/Lemon y todavía
 * no confirmó el pago ni subió la constancia.
 */
export default function PendingPaymentBanner() {
  const pathname = usePathname();
  const [pending, setPending] = useState<PendingPayment | null>(null);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    let active = true;
    const read = () => {
      if (active) setPending(getPendingPayment());
    };
    // Diferido (no setState síncrono dentro del efecto) para evitar renders en cascada.
    const t = window.setTimeout(read, 0);
    window.addEventListener('focus', read);
    document.addEventListener('visibilitychange', read);
    return () => {
      active = false;
      window.clearTimeout(t);
      window.removeEventListener('focus', read);
      document.removeEventListener('visibilitychange', read);
    };
  }, [pathname]);

  const hideHere =
    pathname.startsWith('/pago/') || pathname.startsWith('/confirmacion') || pathname.startsWith('/carrito');

  if (dismissed || !pending || hideHere) return null;

  return (
    <div className="max-w-5xl w-full mx-auto px-4 sm:px-6 pt-4">
      <div className="flex items-center gap-2 rounded-2xl bg-amber-50 border border-amber-300 p-3 shadow-xs">
        <AlertCircle className="w-5 h-5 text-amber-600 shrink-0" />
        <Link
          href={paymentPath(pending.oid)}
          className="flex-1 min-w-0 text-xs font-bold text-amber-900 flex items-center justify-between gap-2"
        >
          <span className="truncate">
            Te falta confirmar el pago de tu pedido{pending.orderId ? ` ${pending.orderId}` : ''}.
            <span className="block font-medium text-amber-700">
              Toca aquí para confirmarlo o subir tu constancia.
            </span>
          </span>
          <ChevronRight className="w-4 h-4 text-amber-600 shrink-0" />
        </Link>
        <button
          type="button"
          onClick={() => {
            setDismissed(true);
            clearPendingPayment();
          }}
          className="p-1.5 rounded-lg text-amber-500 hover:text-amber-800 hover:bg-amber-100 transition-colors cursor-pointer"
          aria-label="Cerrar recordatorio"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
