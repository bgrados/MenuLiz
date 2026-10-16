'use client';

import React, { useRef, useState } from 'react';
import { Camera, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import { attachPaymentReceipt, uploadPaymentReceipt } from '@/lib/receipts';

interface PaymentReceiptUploadProps {
  /** UUID real del pedido al que se asociará la constancia. */
  orderId: string;
  /** Ruta ya guardada (si existe, se muestra como subida). */
  initialPath?: string | null;
  /** Se llama con la ruta nueva tras subir correctamente. */
  onUploaded?: (path: string) => void;
  /** Estilo compacto (para el panel de admin). */
  compact?: boolean;
  /** Texto del botón. */
  label?: string;
}

export default function PaymentReceiptUpload({
  orderId,
  initialPath,
  onUploaded,
  compact = false,
  label,
}: PaymentReceiptUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [done, setDone] = useState(Boolean(initialPath));
  const [error, setError] = useState<string | null>(null);

  const handleChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    // Permite volver a elegir el mismo archivo luego
    e.target.value = '';
    if (!file) return;

    setUploading(true);
    setError(null);
    try {
      const path = await uploadPaymentReceipt(orderId, file);
      await attachPaymentReceipt(orderId, path);
      setDone(true);
      onUploaded?.(path);
    } catch (err) {
      console.error('Error subiendo constancia:', err);
      setError(err instanceof Error ? err.message : 'No se pudo subir la constancia. Intenta nuevamente.');
    } finally {
      setUploading(false);
    }
  };

  const buttonBase = compact
    ? 'inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold cursor-pointer transition-all'
    : 'w-full inline-flex items-center justify-center gap-2 px-5 py-3 rounded-2xl text-sm font-bold cursor-pointer transition-all';

  return (
    <div className={compact ? 'space-y-1' : 'space-y-2'}>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={handleChange}
      />

      {done ? (
        <div
          className={`${buttonBase} bg-emerald-50 text-emerald-700 border border-emerald-200`}
        >
          <CheckCircle2 className="w-3.5 h-3.5" />
          <span>Constancia recibida</span>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          className={`${buttonBase} bg-orange-500 hover:bg-orange-600 text-white shadow-md shadow-orange-500/20 disabled:opacity-60`}
        >
          {uploading ? (
            <Loader2 className={`${compact ? 'w-3.5 h-3.5' : 'w-4 h-4'} animate-spin`} />
          ) : (
            <Camera className={compact ? 'w-3.5 h-3.5' : 'w-4 h-4'} />
          )}
          <span>{uploading ? 'Subiendo…' : label || (compact ? 'Adjuntar constancia' : 'Subir constancia de pago')}</span>
        </button>
      )}

      {done && (
        <button
          type="button"
          onClick={() => {
            setDone(false);
            inputRef.current?.click();
          }}
          className="block text-[11px] font-bold text-stone-400 hover:text-orange-600 cursor-pointer"
        >
          {compact ? 'Reemplazar' : 'Subir otra constancia'}
        </button>
      )}

      {error && (
        <p className="text-[11px] text-red-600 flex items-center gap-1">
          <AlertCircle className="w-3.5 h-3.5 shrink-0" />
          <span>{error}</span>
        </p>
      )}
    </div>
  );
}
