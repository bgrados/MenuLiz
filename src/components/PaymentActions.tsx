'use client';

import React, { useState } from 'react';
import { CheckCircle2, Loader2, AlertCircle, ThumbsUp, HelpCircle } from 'lucide-react';
import { confirmOrderPayment } from '@/lib/receipts';
import { PAYMENT_LABELS } from '@/lib/constants';
import PaymentReceiptUpload from '@/components/PaymentReceiptUpload';

interface PaymentActionsProps {
  orderId: string;
  paymentMethod?: string | null;
  initialConfirmed?: boolean;
  initialReceiptPath?: string | null;
  /** Si ya existe constancia (cuando solo conocemos el booleano). */
  initialHasReceipt?: boolean;
  /** Se llama cuando el pago queda resuelto (confirmado o con constancia). */
  onDone?: () => void;
}

/**
 * Tres caminos, del más fácil al más completo, para dejar el pago resuelto:
 *  1) "Ya pagué" en 1 toque (con nota opcional).
 *  2) Compartir la constancia desde Yape por WhatsApp.
 *  3) Subir la foto o el archivo desde la app.
 */
export default function PaymentActions({
  orderId,
  paymentMethod,
  initialConfirmed = false,
  initialReceiptPath,
  initialHasReceipt = false,
  onDone,
}: PaymentActionsProps) {
  const hasReceipt = initialHasReceipt || Boolean(initialReceiptPath);
  const [confirmed, setConfirmed] = useState(initialConfirmed);
  const [showNote, setShowNote] = useState(false);
  const [note, setNote] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const methodLabel = paymentMethod
    ? PAYMENT_LABELS[paymentMethod as keyof typeof PAYMENT_LABELS] || paymentMethod
    : 'Yape';

  const handleConfirm = async () => {
    setSubmitting(true);
    setError(null);
    try {
      await confirmOrderPayment(orderId, note);
      setConfirmed(true);
      setShowNote(false);
      onDone?.();
    } catch (err) {
      console.error('Error confirmando pago:', err);
      setError('No se pudo registrar. Revisa tu conexión e intenta de nuevo.');
    } finally {
      setSubmitting(false);
    }
  };

  if (confirmed && !hasReceipt) {
    return (
      <div className="rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 p-4 text-sm font-bold flex items-center gap-2">
        <CheckCircle2 className="w-5 h-5 shrink-0" />
        <span>¡Listo! Anotamos que ya pagaste con {methodLabel}. Gracias.</span>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {confirmed && (
        <div className="rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 p-3 text-xs font-bold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>Pago confirmado con {methodLabel}.</span>
        </div>
      )}

      {!confirmed && (
        <>
          {!showNote ? (
            <button
              type="button"
              onClick={() => setShowNote(true)}
              className="w-full inline-flex items-center justify-center gap-2 px-5 py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-black shadow-lg shadow-emerald-600/20 cursor-pointer"
            >
              <ThumbsUp className="w-4 h-4" />
              <span>Ya pagué con {methodLabel}</span>
            </button>
          ) : (
            <div className="space-y-2 p-3 rounded-2xl bg-emerald-50/60 border border-emerald-200">
              <label className="block text-[11px] font-bold text-emerald-900">
                ¿Quieres dejar un dato? (opcional)
              </label>
              <input
                type="text"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Ej: 5321, o el nombre con el que pagaste"
                className="w-full px-3 py-2.5 rounded-xl border border-emerald-200 text-xs sm:text-sm focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 bg-white"
              />
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={handleConfirm}
                  disabled={submitting}
                  className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold disabled:opacity-60 cursor-pointer"
                >
                  {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                  <span>{submitting ? 'Registrando…' : 'Confirmar que ya pagué'}</span>
                </button>
                <button
                  type="button"
                  onClick={() => setShowNote(false)}
                  disabled={submitting}
                  className="px-4 py-2.5 rounded-xl border border-stone-200 bg-white text-stone-500 text-xs font-bold cursor-pointer"
                >
                  Cancelar
                </button>
              </div>
            </div>
          )}
        </>
      )}

      {error && (
        <p className="text-[11px] text-red-600 flex items-center gap-1">
          <AlertCircle className="w-3.5 h-3.5 shrink-0" />
          <span>{error}</span>
        </p>
      )}

      <div className="flex items-center gap-3 py-1">
        <div className="flex-1 h-px bg-stone-200" />
        <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400">
          o sube tu constancia
        </span>
        <div className="flex-1 h-px bg-stone-200" />
      </div>

      <PaymentReceiptUpload
        orderId={orderId}
        initialPath={initialReceiptPath || (initialHasReceipt ? 'existing' : undefined)}
        onDone={() => {
          setConfirmed(true);
          onDone?.();
        }}
      />

      <details className="text-[11px] text-stone-500 bg-stone-50 border border-stone-200 rounded-xl p-3">
        <summary className="font-bold text-stone-600 flex items-center gap-1.5 cursor-pointer list-none">
          <HelpCircle className="w-3.5 h-3.5 text-orange-500" />
          ¿No sabes cómo enviar tu constancia?
        </summary>
        <div className="mt-2 space-y-1.5 leading-relaxed">
          <p>
            <strong className="text-stone-700">Opción fácil:</strong> en tu app de Yape, en la
            pantalla de la constancia, toca el botón <strong>Compartir</strong> y envíala al
            WhatsApp de la dueña.
          </p>
          <p>
            <strong className="text-stone-700">Otra opción:</strong> toca “Elegir de la galería”
            arriba si ya guardaste una captura. También puedes confirmar con el botón
            “Ya pagué” de arriba.
          </p>
        </div>
      </details>
    </div>
  );
}
