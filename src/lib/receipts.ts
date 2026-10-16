import { createClient } from '@/lib/supabase/client';

/** Bucket privado donde se guardan las constancias de pago (Yape/Plin/Lemon). */
export const RECEIPTS_BUCKET = 'payment-receipts';

/** Métodos de pago que requieren constancia (adelantado, sin efectivo contra entrega). */
export function requiresPaymentReceipt(method: string | null | undefined): boolean {
  return method === 'yape' || method === 'plin' || method === 'lemon';
}

const MAX_RECEIPT_BYTES = 8 * 1024 * 1024; // 8 MB

function isAllowedReceipt(file: File): boolean {
  return file.type.startsWith('image/') || file.type === 'application/pdf';
}

/**
 * Sube la constancia al bucket privado y devuelve la ruta almacenada.
 * La ruta se guarda como `{orderId}/{timestamp}.{ext}`.
 */
export async function uploadPaymentReceipt(orderId: string, file: File): Promise<string> {
  if (!isAllowedReceipt(file)) {
    throw new Error('El archivo debe ser una imagen o un PDF (captura o constancia de Yape).');
  }
  if (file.size > MAX_RECEIPT_BYTES) {
    throw new Error('El archivo es demasiado grande (máximo 8 MB).');
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

/** Confirma el pago "en 1 toque" (para quien no sube constancia). */
export async function confirmOrderPayment(orderId: string, note?: string): Promise<void> {
  const supabase = createClient();
  const { error } = await supabase.rpc('confirm_order_payment', {
    p_order_id: orderId,
    p_note: note?.trim() ? note.trim() : null,
  });
  if (error) throw error;
}

export interface OrderPaymentInfo {
  id: string;
  order_number: number | null;
  customer_name: string | null;
  payment_method: string | null;
  total: number | null;
  has_receipt: boolean;
  payment_confirmed_at: string | null;
}

/** Datos mínimos del pedido para la página /pago/[id] (solo por UUID). */
export async function getOrderPaymentInfo(orderId: string): Promise<OrderPaymentInfo | null> {
  const supabase = createClient();
  const { data, error } = await supabase.rpc('get_order_payment_info', { p_order_id: orderId });
  if (error) return null;
  const row = Array.isArray(data) ? data[0] : data;
  return (row as OrderPaymentInfo) ?? null;
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
