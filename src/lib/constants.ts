export const RESTAURANT_NAME = process.env.NEXT_PUBLIC_RESTAURANT_NAME || 'MenuLiz';
export const MENU_PRICE = Number(process.env.NEXT_PUBLIC_MENU_PRICE) || 14;
export const CURRENCY = 'S/';
export const DEFAULT_WHATSAPP_NUMBER = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '51999999999';
export const DELIVERY_FEE = 3.00;

export const CATEGORY_LABELS = {
  entrada: '🥗 Entradas',
  segundo: '🍛 Segundos',
  refresco: '🥤 Refrescos',
  a_la_carta: '📋 A la Carta',
} as const;

export const STATUS_LABELS = {
  nuevo: '📩 Nuevo',
  confirmado: '✅ Confirmado',
  en_preparacion: '🍳 En preparación',
  en_camino: '🛵 En camino',
  listo_para_recoger: '🏠 Listo para recoger',
  completado: '✅ Completado',
  cancelado: '❌ Cancelado',
} as const;

export const PAYMENT_LABELS = {
  efectivo: '💵 Efectivo',
  yape: '📱 Yape',
  plin: '📱 Plin',
  lemon: '📱 Lemon',
} as const;

export const STATUS_COLORS = {
  nuevo: 'bg-blue-100 text-blue-800 border-blue-200',
  confirmado: 'bg-amber-100 text-amber-800 border-amber-200',
  en_preparacion: 'bg-orange-100 text-orange-800 border-orange-200',
  en_camino: 'bg-purple-100 text-purple-800 border-purple-200',
  listo_para_recoger: 'bg-indigo-100 text-indigo-800 border-indigo-200',
  completado: 'bg-emerald-100 text-emerald-800 border-emerald-200',
  cancelado: 'bg-red-100 text-red-800 border-red-200',
} as const;
