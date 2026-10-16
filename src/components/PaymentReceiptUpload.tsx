'use client';

import React, { useRef, useState } from 'react';
import { Camera, Image as ImageIcon, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import { attachPaymentReceipt, uploadPaymentReceipt } from '@/lib/receipts';

interface PaymentReceiptUploadProps {
  /** UUID real del pedido al que se asociará la constancia. */
  orderId: string;
  /** Ruta ya guardada (si existe, se muestra como subida). */
  initialPath?: string | null;
  /** Se llama con la ruta nueva tras subir correctamente. */
  onUploaded?: (path: string) => void;
  /** Se llama una vez subida la constancia (para limpiar recordatorios). */
  onDone?: () => void;
  /** Estilo compacto (para el panel de admin). */
  compact?: boolean;
  /** Texto del botón (modo compacto). */
  label?: string;
}

export default function PaymentReceiptUpload({
  orderId,
  initialPath,
  onUploaded,
  onDone,
  compact = false,
  label,
}: PaymentReceiptUploadProps) {
  const cameraRef = useRef<HTMLInputElement>(null);
  const galleryRef = useRef<HTMLInputElement>(null);
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
      onDone?.();
    } catch (err) {
      console.error('Error subiendo constancia:', err);
      setError(err instanceof Error ? err.message : 'No se pudo subir la constancia. Intenta nuevamente.');
    } finally {
      setUploading(false);
    }
  };

  const resetAndOpenGallery = () => {
    setDone(false);
    galleryRef.current?.click();
  };

  if (compact) {
    const compactBase =
      'inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold cursor-pointer transition-all';
    return (
      <div className="space-y-1">
        <input
          ref={galleryRef}
          type="file"
          accept="image/*,application/pdf"
          className="hidden"
          onChange={handleChange}
        />
        {done ? (
          <div className={`${compactBase} bg-emerald-50 text-emerald-700 border border-emerald-200`}>
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Constancia recibida</span>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => galleryRef.current?.click()}
            disabled={uploading}
            className={`${compactBase} bg-orange-500 hover:bg-orange-600 text-white shadow-md shadow-orange-500/20 disabled:opacity-60`}
          >
            {uploading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <ImageIcon className="w-3.5 h-3.5" />}
            <span>{uploading ? 'Subiendo…' : label || 'Adjuntar'}</span>
          </button>
        )}
        {done && (
          <button
            type="button"
            onClick={resetAndOpenGallery}
            className="block text-[11px] font-bold text-stone-400 hover:text-orange-600 cursor-pointer"
          >
            Reemplazar
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

  // Modo cliente: dos caminos claros (cámara o galería), sin forzar la cámara.
  return (
    <div className="space-y-2">
      <input
        ref={cameraRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={handleChange}
      />
      <input
        ref={galleryRef}
        type="file"
        accept="image/*,application/pdf"
        className="hidden"
        onChange={handleChange}
      />

      {done ? (
        <div className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-emerald-50 text-emerald-700 border border-emerald-200 text-sm font-bold">
          <CheckCircle2 className="w-4 h-4" />
          <span>¡Constancia recibida, gracias!</span>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => cameraRef.current?.click()}
            disabled={uploading}
            className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 rounded-2xl bg-orange-500 hover:bg-orange-600 text-white text-sm font-bold shadow-md shadow-orange-500/20 disabled:opacity-60 cursor-pointer"
          >
            {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Camera className="w-4 h-4" />}
            <span>Tomar foto</span>
          </button>
          <button
            type="button"
            onClick={() => galleryRef.current?.click()}
            disabled={uploading}
            className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 rounded-2xl border border-orange-300 bg-white hover:bg-orange-50 text-orange-700 text-sm font-bold disabled:opacity-60 cursor-pointer"
          >
            {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <ImageIcon className="w-4 h-4" />}
            <span>Elegir de la galería</span>
          </button>
        </div>
      )}

      {uploading && (
        <p className="text-[11px] text-stone-500 text-center">Subiendo tu constancia…</p>
      )}

      {done && (
        <button
          type="button"
          onClick={resetAndOpenGallery}
          className="block mx-auto text-[11px] font-bold text-stone-400 hover:text-orange-600 cursor-pointer"
        >
          Subir otra constancia
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
