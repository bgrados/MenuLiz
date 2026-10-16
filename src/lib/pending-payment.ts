/**
 * Recordatorio de pago pendiente.
 *
 * Cuando el cliente hace un pedido con Yape/Plin/Lemon y todavía no confirmó
 * el pago ni subió su constancia, guardamos un aviso en su propio celular para
 * volver a recordárselo (banner en la app) hasta que lo resuelva.
 */

const KEY = 'menuliz_pending_payment_v1';
const MAX_AGE_MS = 24 * 60 * 60 * 1000; // 24 horas

export interface PendingPayment {
  oid: string;
  pay: string;
  orderId?: string;
  ts: number;
}

export function savePendingPayment(p: { oid: string; pay: string; orderId?: string }): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(KEY, JSON.stringify({ ...p, ts: Date.now() }));
  } catch {
    // ignore
  }
}

export function getPendingPayment(): PendingPayment | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return null;
    const p = JSON.parse(raw) as PendingPayment;
    if (!p?.oid || !p?.ts || Date.now() - p.ts > MAX_AGE_MS) {
      window.localStorage.removeItem(KEY);
      return null;
    }
    return p;
  } catch {
    return null;
  }
}

/** Limpia el aviso. Si se pasa un oid, solo borra si coincide (no pisa otro pedido). */
export function clearPendingPayment(oid?: string): void {
  if (typeof window === 'undefined') return;
  try {
    if (oid) {
      const p = getPendingPayment();
      if (p && p.oid !== oid) return;
    }
    window.localStorage.removeItem(KEY);
  } catch {
    // ignore
  }
}

export function paymentPath(oid: string): string {
  return `/pago/${oid}`;
}
