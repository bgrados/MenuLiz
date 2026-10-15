import { Order, OrderItem } from '@/types';
import { DEFAULT_WHATSAPP_NUMBER, RESTAURANT_NAME, PAYMENT_LABELS } from './constants';
import { formatDateSpanish, formatCurrency } from './utils';

export function generateWhatsAppMessage(order: Partial<Order>, items: OrderItem[]): string {
  const dateFormatted = formatDateSpanish(new Date());

  let message = `🍽️ *NUEVO PEDIDO - ${RESTAURANT_NAME}*\n`;
  message += `📅 *Fecha:* ${dateFormatted}\n\n`;

  message += `👤 *Cliente:* ${order.customer_name || 'Sin nombre'}\n`;
  message += `📱 *Teléfono:* ${order.customer_phone || 'Sin teléfono'}\n`;
  message += `🛵 *Tipo de Entrega:* ${order.delivery_type === 'delivery' ? 'Delivery a Domicilio' : 'Recojo en Local'}\n`;

  if (order.delivery_type === 'delivery' && order.delivery_address) {
    message += `📍 *Dirección:* ${order.delivery_address}\n`;
  }

  message += `\n📋 *Detalle del Pedido:*\n`;
  items.forEach((item) => {
    const isCombo = item.is_combo_part ? ' (En Combo Menú)' : '';
    const itemTotal = (item.quantity * item.unit_price).toFixed(2);
    message += `• ${item.quantity}x ${item.dish_name}${isCombo} - S/ ${itemTotal}\n`;
  });

  message += `\n💵 *Subtotal:* S/ ${(order.subtotal || 0).toFixed(2)}\n`;
  if (order.delivery_type === 'delivery') {
    message += `🛵 *Delivery:* S/ ${(order.delivery_fee || 0).toFixed(2)}\n`;
  }
  message += `💰 *TOTAL A PAGAR: S/ ${(order.total || 0).toFixed(2)}*\n\n`;

  const paymentMethodKey = order.payment_method || 'efectivo';
  const paymentText = PAYMENT_LABELS[paymentMethodKey] || order.payment_method;
  message += `💳 *Método de Pago:* ${paymentText}\n`;

  if (order.notes && order.notes.trim()) {
    message += `📝 *Notas:* ${order.notes.trim()}\n`;
  }

  message += `\n_Muchas gracias por su preferencia._ 🙏✨`;

  return message;
}

export function openWhatsApp(message: string, phoneNumber: string = DEFAULT_WHATSAPP_NUMBER): void {
  const cleanNumber = phoneNumber.replace(/[^0-9]/g, '');
  const encodedText = encodeURIComponent(message);
  const url = `https://wa.me/${cleanNumber}?text=${encodedText}`;
  window.open(url, '_blank');
}
