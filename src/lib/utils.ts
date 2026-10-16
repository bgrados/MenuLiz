import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { CartItem, ComboCalculationResult } from '@/types';
import { MENU_PRICE, CURRENCY } from './constants';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number): string {
  return `${CURRENCY} ${amount.toFixed(2)}`;
}

export function formatDateSpanish(date: Date | string = new Date()): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return new Intl.DateTimeFormat('es-PE', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(d);
}

export function calculateComboPricing(
  items: CartItem[],
  menuPrice: number = MENU_PRICE
): ComboCalculationResult {
  // Count items by category for menu combo detection
  let entradasCount = 0;
  let segundosCount = 0;
  let refrescosCount = 0;

  items.forEach((item) => {
    const cat = item.dish.category;
    if (cat === 'entrada') entradasCount += item.quantity;
    else if (cat === 'segundo') segundosCount += item.quantity;
    else if (cat === 'refresco') refrescosCount += item.quantity;
  });

  // A complete combo is 1 Entrada + 1 Segundo + 1 Refresco
  const fullCombosCount = Math.min(entradasCount, segundosCount, refrescosCount);
  const comboTotal = fullCombosCount * menuPrice;

  // Track how many of each category are absorbed by full combos
  let remainingEntradas = fullCombosCount;
  let remainingSegundos = fullCombosCount;
  let remainingRefrescos = fullCombosCount;

  let leftoverTotal = 0;
  const leftoverItems: CartItem[] = [];

  // Items are charged at individual price if they're not part of a combo or if they are a_la_carta
  items.forEach((item) => {
    const cat = item.dish.category;
    let qtyLeftover = item.quantity;

    if (cat === 'entrada' && remainingEntradas > 0) {
      const used = Math.min(qtyLeftover, remainingEntradas);
      qtyLeftover -= used;
      remainingEntradas -= used;
    } else if (cat === 'segundo' && remainingSegundos > 0) {
      const used = Math.min(qtyLeftover, remainingSegundos);
      qtyLeftover -= used;
      remainingSegundos -= used;
    } else if (cat === 'refresco' && remainingRefrescos > 0) {
      const used = Math.min(qtyLeftover, remainingRefrescos);
      qtyLeftover -= used;
      remainingRefrescos -= used;
    }

    if (qtyLeftover > 0) {
      const cost = qtyLeftover * item.unitPrice;
      leftoverTotal += cost;
      leftoverItems.push({
        ...item,
        quantity: qtyLeftover,
      });
    }
  });

  const subtotal = comboTotal + leftoverTotal;

  return {
    fullCombosCount,
    comboTotal,
    leftoverItems,
    leftoverTotal,
    subtotal,
  };
}
