import { createClient } from '@/lib/supabase/client';

/** Bucket privado donde se guardan las constancias de pago (Yape/Plin/Lemon). */
export const RECEIPTS_BUCKET = 'payment-receipts';

/** Métodos de pago que requieren constancia (adelantado, sin efectivo contra entrega). */
export function requiresPaymentReceipt(method: string | null | undefined): boolean {
  return method === 'yape' || method === 'plin' || method === 'lemon';
}

const MAX_RECEIPT_BYTES = 8 * 1024 * 1024; // 8 MB

/**
 * Sube la constancia al bucket privado y devuelve la ruta almacenada.
 * La ruta se guarda como `{orderId}/{timestamp}.{ext}`.
 */
export async function uploadPaymentReceipt(orderId: string, file: File): Promise<string> {
  if (!file.type.startsWith('image/')) {
    throw new Error('El archivo debe ser una imagen (foto o captura de pantalla).');
  }
  if (file.size > MAX_RECEIPT_BYTES) {
    throw new Error('La imagen es demasiado grande (máximo 8 MB).');
  }

  const supabase = createClient();
  const rawExt = (file.name.split('.').pop() || 'jpg').toLowerCase().replace(/[^a-z0-9]/g, '');
  const ext = rawExt || 'jpg';
  const path = `${orderId}/${Date.now()}.${ext}`;

  const { error } = await supabase.storage.from(RECEIPTS_BUCKET).upload(path, file, {
    cacheControl: '3600',
    upsert: false,
    contentType: file.type || 'image/jpeg',
  });

  if (error) throw error;
  return path;
}

/** Asocia una constancia ya subida al pedido (RPC SECURITY DEFINER, anon-safe). */
export async function attachPaymentReceipt(orderId: string, receiptPath: string): Promise<void> {
  const supabase = createClient();
  const { error } = await supabase.rpc('attach_payment_receipt', {
    p_order_id: orderId,
    p_receipt_path: receiptPath,
  });
  if (error) throw error;
}

/** Genera una URL firmada temporal para ver la constancia (solo admin autenticado). */
export async function getPaymentReceiptSignedUrl(
  receiptPath: string,
  expiresIn = 3600
): Promise<string | null> {
  const supabase = createClient();
  const { data, error } = await supabase.storage
    .from(RECEIPTS_BUCKET)
    .createSignedUrl(receiptPath, expiresIn);
  if (error) return null;
  return data?.signedUrl ?? null;
}
