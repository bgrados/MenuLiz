import { Order, OrderItem } from '@/types';
import { DEFAULT_WHATSAPP_NUMBER, RESTAURANT_NAME, PAYMENT_LABELS } from './constants';
import { formatDateSpanish } from './utils';

/**
 * Emojis "seguros" para WhatsApp.
 *
 * Reglas que seguimos para que se vean igual en iPhone y en Android:
 *  - Todos tienen presentación de color por defecto (Emoji_Presentation=Yes).
 *  - Todos existen desde Unicode 6.0 (año 2010), así que cualquier Android moderno los trae.
 *  - NO usamos emojis con "presentación de texto" (p. ej. 🍽 U+1F37D), porque en algunos
 *    Android/WhatsApp se muestran como "?" o un cuadro vacío.
 *  - NO usamos secuencias ZWJ ni selectores de variación, que son las que más fallan.
 *
 * Además los escribimos con code points explícitos (String.fromCodePoint) para blindarlos
 * ante cualquier editor o proceso de build que pueda alterar la codificación.
 */
const EMOJI = {
  entrada: String.fromCodePoint(0x1f372), // 🍲 olla de comida
  segundo: String.fromCodePoint(0x1f35b), // 🍛 curry con arroz
  refresco: String.fromCodePoint(0x1f379), // 🍹 bebida tropical
  a_la_carta: String.fromCodePoint(0x1f374), // 🍴 tenedor y cuchillo
} as const;

const CATEGORY_EMOJI: Record<string, string> = {
  entrada: EMOJI.entrada,
  segundo: EMOJI.segundo,
  refresco: EMOJI.refresco,
  a_la_carta: EMOJI.a_la_carta,
};

// Etiqueta de texto como respaldo (si un equipo muy antiguo no renderiza el emoji, igual se entiende)
const CATEGORY_TAG: Record<string, string> = {
  entrada: 'Entrada',
  segundo: 'Segundo',
  refresco: 'Refresco',
  a_la_carta: 'A la carta',
};

// Íconos de ubicación para el delivery (también "seguros": Unicode 6.0, Emoji_Presentation=Yes)
const PIN = String.fromCodePoint(0x1f4cd); // 📍
const CAR = String.fromCodePoint(0x1f697); // 🚗

export interface OrderLocation {
  lat?: number | null;
  lng?: number | null;
  /** Link de Google Maps/Waze que el cliente pega manualmente (respaldo del GPS). */
  mapsLink?: string | null;
}

export function generateWhatsAppMessage(
  order: Partial<Order>,
  items: OrderItem[],
  location?: OrderLocation
): string {
  const dateFormatted = formatDateSpanish(new Date());

  let message = `*NUEVO PEDIDO - ${RESTAURANT_NAME}*\n`;
  message += `*Fecha:* ${dateFormatted}\n\n`;

  message += `*Cliente:* ${order.customer_name || 'Sin nombre'}\n`;
  message += `*Telefono:* ${order.customer_phone || 'Sin telefono'}\n`;
  message += `*Tipo de Entrega:* ${order.delivery_type === 'delivery' ? 'Delivery a Domicilio' : 'Recojo en Local'}\n`;

  if (order.delivery_type === 'delivery' && order.delivery_address) {
    message += `*Direccion:* ${order.delivery_address}\n`;
  }

  // Ayuda al motorizado: links de mapa clicables (solo delivery)
  if (order.delivery_type === 'delivery') {
    const hasCoords = typeof location?.lat === 'number' && typeof location?.lng === 'number';
    if (hasCoords) {
      const lat = (location?.lat as number).toFixed(6);
      const lng = (location?.lng as number).toFixed(6);
      const pin = `${lat},${lng}`;
      message += `${PIN} Ubicacion: https://www.google.com/maps?q=${pin}\n`;
      message += `${CAR} Como llegar: https://www.google.com/maps/dir/?api=1&destination=${pin}\n`;
      message += `${CAR} Waze: https://waze.com/ul?ll=${pin}&navigate=yes\n`;
    }
    if (location?.mapsLink && location.mapsLink.trim()) {
      message += `${PIN} Ubicacion: ${location.mapsLink.trim()}\n`;
    }
  }

  message += `\n*Detalle del Pedido:*\n`;
  items.forEach((item) => {
    const isCombo = item.is_combo_part ? ' (Combo Menu)' : '';
    const itemTotal = (item.quantity * item.unit_price).toFixed(2);
    const emoji = CATEGORY_EMOJI[item.category] || '';
    const tag = CATEGORY_TAG[item.category] || 'Plato';
    const emojiPrefix = emoji ? ` ${emoji}` : '';
    // El emoji va DESPUÉS de la etiqueta: así, si algún equipo no lo renderiza,
    // la línea igual queda legible ("[Entrada] 1x Causa Rellena - S/ 4.00").
    message += `[${tag}]${emojiPrefix} ${item.quantity}x ${item.dish_name}${isCombo} - S/ ${itemTotal}\n`;
  });

  message += `\n*Subtotal:* S/ ${(order.subtotal || 0).toFixed(2)}\n`;
  if (order.delivery_type === 'delivery') {
    message += `*Delivery:* S/ ${(order.delivery_fee || 0).toFixed(2)}\n`;
  }
  message += `*TOTAL A PAGAR: S/ ${(order.total || 0).toFixed(2)}*\n\n`;

  // Los emojis de PAYMENT_LABELS (💵 U+1F4B5 / 📱 U+1F4F1) también son "seguros" (Unicode 6.0),
  // así que los dejamos tal cual para que el mensaje se vea más colorido.
  const paymentMethodKey = order.payment_method || 'efectivo';
  const paymentText = PAYMENT_LABELS[paymentMethodKey] || order.payment_method || 'Efectivo';
  message += `*Metodo de Pago:* ${paymentText}\n`;

  if (order.notes && order.notes.trim()) {
    message += `*Notas:* ${order.notes.trim()}\n`;
  }

  message += `\nMuchas gracias por su preferencia.`;

  return message;
}

export function openWhatsApp(message: string, phoneNumber: string = DEFAULT_WHATSAPP_NUMBER): void {
  const cleanNumber = phoneNumber.replace(/[^0-9]/g, '');
  const encodedText = encodeURIComponent(message);
  const url = `https://wa.me/${cleanNumber}?text=${encodedText}`;
  window.open(url, '_blank');
}
