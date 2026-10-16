'use client';

import React, { useState } from 'react';
import { CartItem, OrderType, PaymentMethod } from '@/types/menu';
import { X, Trash2, Plus, Minus, Send, ShoppingBag, MapPin, CreditCard, User, Utensils, Phone, MessageSquare } from 'lucide-react';
import confetti from 'canvas-confetti';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  items: CartItem[];
  onUpdateQuantity: (id: string, delta: number) => void;
  onRemoveItem: (id: string) => void;
  onClearCart: () => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({
  isOpen,
  onClose,
  items,
  onUpdateQuantity,
  onRemoveItem,
  onClearCart,
}) => {
  const [customerName, setCustomerName] = useState('');
  const [phone, setPhone] = useState('');
  const [orderType, setOrderType] = useState<OrderType>('delivery');
  const [address, setAddress] = useState('');
  const [tableNumber, setTableNumber] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('yape');
  const [notes, setNotes] = useState('');
  const [whatsappNumber] = useState('51999999999'); // Default restaurant number

  if (!isOpen) return null;

  const subtotal = items.reduce((sum, item) => sum + item.item.price * item.quantity, 0);
  const deliveryFee = orderType === 'delivery' ? 3.00 : 0.00;
  const total = subtotal + deliveryFee;

  const handleSendWhatsApp = (e: React.FormEvent) => {
    e.preventDefault();

    if (!customerName.trim()) {
      alert('Por favor ingresa tu nombre para el pedido.');
      return;
    }

    if (orderType === 'delivery' && !address.trim()) {
      alert('Por favor ingresa la dirección para la entrega.');
      return;
    }

    if (orderType === 'mesa' && !tableNumber.trim()) {
      alert('Por favor ingresa el número de mesa.');
      return;
    }

    // Trigger celebratory confetti
    try {
      confetti({
        particleCount: 80,
        spread: 60,
        origin: { y: 0.6 },
      });
    } catch {
      // ignore
    }

    // Format WhatsApp message
    let message = `*¡Hola MenuLiz! Deseo realizar el siguiente pedido:* 🍲\n\n`;
    message += `📋 *Detalle del Pedido:*\n`;
    items.forEach((item) => {
      message += `• ${item.quantity}x ${item.item.name} - S/ ${(item.item.price * item.quantity).toFixed(2)}\n`;
    });

    message += `\n💵 *Subtotal:* S/ ${subtotal.toFixed(2)}`;
    if (orderType === 'delivery') {
      message += `\n🛵 *Delivery:* S/ ${deliveryFee.toFixed(2)}`;
    }
    message += `\n💰 *TOTAL A PAGAR: S/ ${total.toFixed(2)}*\n\n`;

    message += `👤 *Datos del Cliente:*\n`;
    message += `• *Nombre:* ${customerName.trim()}\n`;
    if (phone.trim()) message += `• *Teléfono:* ${phone.trim()}\n`;

    if (orderType === 'delivery') {
      message += `• *Tipo:* 🛵 Delivery a Domicilio\n`;
      message += `• *Dirección:* ${address.trim()}\n`;
    } else if (orderType === 'mesa') {
      message += `• *Tipo:* 🍽️ En Restaurante\n`;
      message += `• *Mesa N°:* ${tableNumber.trim()}\n`;
    } else {
      message += `• *Tipo:* 🛍️ Para Llevar (Recojo en local)\n`;
    }

    const paymentLabels: Record<PaymentMethod, string> = {
      yape: '📱 Yape',
      plin: '📱 Plin',
      efectivo: '💵 Efectivo (Pago contra entrega)',
      tarjeta: '💳 Tarjeta / POS',
    };
    message += `• *Método de Pago:* ${paymentLabels[paymentMethod]}\n`;

    if (notes.trim()) {
      message += `• *Instrucciones:* ${notes.trim()}\n`;
    }

    message += `\n_Muchas gracias, espero su confirmación._ 🙏`;

    const encoded = encodeURIComponent(message);
    // api.whatsapp.com/send directo (el redirect de wa.me rompe los emojis → U+FFFD)
    const url = `https://api.whatsapp.com/send?phone=${whatsappNumber.replace(/[^0-9]/g, '')}&text=${encoded}`;
    window.open(url, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/60 backdrop-blur-xs flex justify-end">
      
      {/* Background click to close */}
      <div className="absolute inset-0" onClick={onClose} />

      {/* Drawer content */}
      <div className="relative w-full max-w-lg bg-white h-full shadow-2xl flex flex-col z-10">
        
        {/* Header */}
        <div className="p-5 border-b border-stone-200 flex items-center justify-between bg-stone-50">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-orange-100 text-orange-600">
              <ShoppingBag className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-black text-stone-900">Tu Pedido</h2>
              <p className="text-xs text-stone-500">
                {items.length === 0 ? 'Sin platos agregados' : `${items.length} platos en la orden`}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {items.length > 0 && (
              <button
                onClick={onClearCart}
                className="text-xs text-stone-400 hover:text-red-500 font-semibold px-2 py-1 rounded-lg hover:bg-red-50 transition-colors"
                title="Vaciar todo el pedido"
              >
                Vaciar
              </button>
            )}
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-stone-400 hover:text-stone-700 hover:bg-stone-200/60 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-6">
          {items.length === 0 ? (
            <div className="py-16 text-center space-y-3">
              <div className="w-16 h-16 rounded-full bg-stone-100 mx-auto flex items-center justify-center text-stone-300">
                <Utensils className="w-8 h-8" />
              </div>
              <h3 className="text-base font-bold text-stone-800">Tu canasta está vacía</h3>
              <p className="text-xs text-stone-500 max-w-xs mx-auto">
                Explora nuestro menú diario y añade tus platos favoritos para enviarlos por WhatsApp.
              </p>
            </div>
          ) : (
            <>
              {/* Itemized List */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-stone-400">Platos Seleccionados</h4>
                <div className="divide-y divide-stone-100">
                  {items.map(({ item, quantity }) => (
                    <div key={item.id} className="py-3 flex items-center justify-between gap-3">
                      <img
                        src={item.image_url}
                        alt={item.name}
                        className="w-12 h-12 rounded-xl object-cover shrink-0 border border-stone-200"
                      />
                      <div className="flex-1 min-w-0">
                        <h5 className="text-xs sm:text-sm font-bold text-stone-900 truncate">{item.name}</h5>
                        <p className="text-xs text-orange-600 font-semibold">
                          S/ {(item.price * quantity).toFixed(2)}
                          <span className="text-stone-400 font-normal ml-1">
                            (S/ {item.price.toFixed(2)} c/u)
                          </span>
                        </p>
                      </div>

                      {/* Quantity Controls */}
                      <div className="flex items-center gap-1 bg-stone-100 p-1 rounded-xl">
                        <button
                          onClick={() => onUpdateQuantity(item.id, -1)}
                          className="w-6 h-6 rounded-lg bg-white flex items-center justify-center text-stone-700 hover:bg-stone-200 shadow-xs"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="text-xs font-bold w-5 text-center">{quantity}</span>
                        <button
                          onClick={() => onUpdateQuantity(item.id, 1)}
                          className="w-6 h-6 rounded-lg bg-white flex items-center justify-center text-stone-700 hover:bg-stone-200 shadow-xs"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>

                      {/* Remove Button */}
                      <button
                        onClick={() => onRemoveItem(item.id)}
                        className="p-1.5 text-stone-400 hover:text-red-500 transition-colors"
                        title="Eliminar plato"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Order Form Details */}
              <form id="order-form" onSubmit={handleSendWhatsApp} className="space-y-4 pt-4 border-t border-stone-200">
                <h4 className="text-xs font-bold uppercase tracking-wider text-stone-400">Datos para la Entrega</h4>

                {/* Tipo de Pedido */}
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'delivery', label: 'Delivery', icon: MapPin },
                    { id: 'mesa', label: 'En Mesa', icon: Utensils },
                    { id: 'llevar', label: 'Para Llevar', icon: ShoppingBag },
                  ].map((t) => {
                    const Icon = t.icon;
                    const isSelected = orderType === t.id;
                    return (
                      <button
                        key={t.id}
                        type="button"
                        onClick={() => setOrderType(t.id as OrderType)}
                        className={`p-2.5 rounded-xl border text-xs font-bold flex flex-col items-center gap-1 transition-all ${
                          isSelected
                            ? 'border-orange-600 bg-orange-50 text-orange-900 shadow-xs'
                            : 'border-stone-200 hover:border-stone-300 text-stone-600'
                        }`}
                      >
                        <Icon className={`w-4 h-4 ${isSelected ? 'text-orange-600' : 'text-stone-400'}`} />
                        <span>{t.label}</span>
                      </button>
                    );
                  })}
                </div>

                {/* Cliente Name */}
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">Tu Nombre *</label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
                    <input
                      type="text"
                      required
                      placeholder="Ej: Benjamín Grados"
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 rounded-xl border border-stone-200 text-xs sm:text-sm focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
                    />
                  </div>
                </div>

                {/* Teléfono */}
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">Teléfono de Contacto</label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
                    <input
                      type="tel"
                      placeholder="Ej: 999 888 777"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 rounded-xl border border-stone-200 text-xs sm:text-sm focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
                    />
                  </div>
                </div>

                {/* Address or Table depending on orderType */}
                {orderType === 'delivery' && (
                  <div>
                    <label className="block text-xs font-bold text-stone-700 mb-1">Dirección de Entrega *</label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
                      <input
                        type="text"
                        required
                        placeholder="Calle, número, referencia..."
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                        className="w-full pl-9 pr-3 py-2 rounded-xl border border-stone-200 text-xs sm:text-sm focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
                      />
                    </div>
                  </div>
                )}

                {orderType === 'mesa' && (
                  <div>
                    <label className="block text-xs font-bold text-stone-700 mb-1">Número de Mesa *</label>
                    <input
                      type="text"
                      required
                      placeholder="Ej: Mesa 4"
                      value={tableNumber}
                      onChange={(e) => setTableNumber(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-stone-200 text-xs sm:text-sm focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
                    />
                  </div>
                )}

                {/* Payment Method */}
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">Forma de Pago</label>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { id: 'yape', label: '📱 Yape' },
                      { id: 'plin', label: '📱 Plin' },
                      { id: 'efectivo', label: '💵 Efectivo' },
                      { id: 'tarjeta', label: '💳 Tarjeta POS' },
                    ].map((p) => (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => setPaymentMethod(p.id as PaymentMethod)}
                        className={`p-2 rounded-xl border text-xs font-bold text-left transition-all ${
                          paymentMethod === p.id
                            ? 'border-orange-600 bg-orange-50 text-orange-950 shadow-xs'
                            : 'border-stone-200 text-stone-600 hover:border-stone-300'
                        }`}
                      >
                        {p.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Special Instructions */}
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">Notas especiales o alergias</label>
                  <div className="relative">
                    <MessageSquare className="absolute left-3 top-2.5 w-4 h-4 text-stone-400" />
                    <textarea
                      rows={2}
                      placeholder="Ej: Ají aparte, sin cebolla, traer cambio de S/ 50..."
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 rounded-xl border border-stone-200 text-xs sm:text-sm focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
                    />
                  </div>
                </div>
              </form>
            </>
          )}
        </div>

        {/* Footer / Checkout Button */}
        {items.length > 0 && (
          <div className="p-5 border-t border-stone-200 bg-stone-50 space-y-3">
            <div className="space-y-1 text-xs">
              <div className="flex justify-between text-stone-500">
                <span>Subtotal</span>
                <span className="font-semibold text-stone-800">S/ {subtotal.toFixed(2)}</span>
              </div>
              {orderType === 'delivery' && (
                <div className="flex justify-between text-stone-500">
                  <span>Costo de Delivery</span>
                  <span className="font-semibold text-stone-800">S/ {deliveryFee.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between text-base font-black text-stone-900 pt-1 border-t border-stone-200">
                <span>Total a Pagar</span>
                <span className="text-orange-600">S/ {total.toFixed(2)}</span>
              </div>
            </div>

            <button
              type="submit"
              form="order-form"
              className="w-full py-3.5 px-4 rounded-2xl bg-emerald-600 hover:bg-emerald-700 active:scale-[0.98] text-white font-bold text-sm shadow-lg shadow-emerald-600/25 flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              <Send className="w-4 h-4" />
              <span>Enviar Pedido a WhatsApp</span>
            </button>
            <p className="text-[11px] text-center text-stone-400">
              Se abrirá WhatsApp con el resumen listo para enviar
            </p>
          </div>
        )}

      </div>
    </div>
  );
};
