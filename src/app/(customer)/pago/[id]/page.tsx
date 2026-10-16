'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { Loader2, Paperclip, Home, AlertCircle } from 'lucide-react';
import {
  getOrderPaymentInfo,
  requiresPaymentReceipt,
  type OrderPaymentInfo,
} from '@/lib/receipts';
import { clearPendingPayment } from '@/lib/pending-payment';
import { PAYMENT_LABELS } from '@/lib/constants';
import { formatCurrency } from '@/lib/utils';
import PaymentActions from '@/components/PaymentActions';

export default function PagoPage() {
  const params = useParams<{ id: string }>();
  const id = Array.isArray(params?.id) ? params.id[0] : params?.id || '';

  const [loading, setLoading] = useState(true);
  const [info, setInfo] = useState<OrderPaymentInfo | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (!id) {
        setLoading(false);
        return;
      }
      const data = await getOrderPaymentInfo(id);
      if (!cancelled) {
        setInfo(data);
        setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [id]);

  if (loading) {
    return (
      <div className="py-24 text-center text-stone-400 text-sm flex flex-col items-center gap-3">
        <Loader2 className="w-6 h-6 animate-spin text-orange-500" />
        Cargando tu pedido…
      </div>
    );
  }

  if (!info) {
    return (
      <div className="max-w-md mx-auto py-16 text-center space-y-4">
        <div className="w-16 h-16 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center mx-auto">
          <AlertCircle className="w-8 h-8" />
        </div>
        <h1 className="text-xl font-black text-stone-900">No encontramos este pedido</h1>
        <p className="text-xs text-stone-500">
          El enlace puede haber expirado o ser incorrecto. Si acabas de pedir, escríbenos por WhatsApp.
        </p>
        <Link
          href="/"
          className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs"
        >
          <Home className="w-4 h-4" />
          Volver al inicio
        </Link>
      </div>
    );
  }

  const methodLabel = info.payment_method
    ? PAYMENT_LABELS[info.payment_method as keyof typeof PAYMENT_LABELS] || info.payment_method
    : 'Yape';
  const needsReceipt = requiresPaymentReceipt(info.payment_method);
  const orderRef = info.order_number ? `#${info.order_number}` : String(info.id).slice(0, 8);

  return (
    <div className="max-w-md mx-auto py-8 space-y-6">
      <div className="text-center space-y-2">
        <span className="w-14 h-14 rounded-2xl bg-orange-100 text-orange-600 flex items-center justify-center mx-auto">
          <Paperclip className="w-7 h-7" />
        </span>
        <h1 className="text-2xl font-black text-stone-900">Confirma tu pago</h1>
        {info.customer_name && (
          <p className="text-xs text-stone-500">
            Pedido {orderRef} de <strong className="text-stone-700">{info.customer_name}</strong>
          </p>
        )}
      </div>

      <div className="bg-white rounded-3xl border border-stone-200 p-5 shadow-xs space-y-3 text-xs sm:text-sm">
        <div className="flex items-center justify-between pb-2 border-b border-stone-100">
          <span className="text-stone-500 font-medium">Forma de Pago</span>
          <span className="font-bold text-stone-800">{methodLabel}</span>
        </div>
        <div className="flex items-center justify-between pt-1">
          <span className="text-stone-500 font-medium">Total</span>
          <span className="text-base font-black text-orange-600">{formatCurrency(info.total || 0)}</span>
        </div>
      </div>

      {needsReceipt ? (
        <div className="bg-white rounded-3xl border border-orange-200 p-5 shadow-xs space-y-3">
          <p className="text-[11px] text-stone-500">
            Elige lo más fácil para ti. Con cualquiera de estas opciones quedamos avisados de tu pago.
          </p>
          <PaymentActions
            orderId={info.id}
            paymentMethod={info.payment_method}
            initialConfirmed={Boolean(info.payment_confirmed_at)}
            initialHasReceipt={info.has_receipt}
            onDone={() => clearPendingPayment(info.id)}
          />
        </div>
      ) : (
        <div className="rounded-2xl bg-stone-100 border border-stone-200 p-4 text-xs text-stone-600">
          Este pedido es con {methodLabel}, así que lo pagas al recibir o recoger. ¡No necesitas subir nada!
        </div>
      )}

      <Link
        href="/"
        className="w-full py-3 px-5 rounded-2xl border border-stone-200 bg-white hover:bg-stone-50 text-stone-700 font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-xs"
      >
        <Home className="w-4 h-4" />
        Volver al inicio
      </Link>
    </div>
  );
}
