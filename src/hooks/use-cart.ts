'use client';

import { useState, useEffect } from 'react';
import { CartItem, DailyDishItem, Dish } from '@/types';
import { calculateComboPricing } from '@/lib/utils';

const CART_STORAGE_KEY = 'menuliz_cart_v1';

// Shared state for cart across components
let globalCart: CartItem[] = [];
let listeners: Array<() => void> = [];

if (typeof window !== 'undefined') {
  try {
    const saved = localStorage.getItem(CART_STORAGE_KEY);
    if (saved) globalCart = JSON.parse(saved);
  } catch {
    globalCart = [];
  }
}

function notifyListeners() {
  listeners.forEach((listener) => listener());
  if (typeof window !== 'undefined') {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(globalCart));
  }
}

export function useCart() {
  const [items, setItems] = useState<CartItem[]>(() => [...globalCart]);

  useEffect(() => {
    const handleChange = () => setItems([...globalCart]);
    listeners.push(handleChange);
    return () => {
      listeners = listeners.filter((l) => l !== handleChange);
    };
  }, []);

  const addItem = (dish: DailyDishItem | Dish, quantity = 1) => {
    const existingIndex = globalCart.findIndex((i) => i.id === dish.id);
    if (existingIndex >= 0) {
      globalCart[existingIndex].quantity += quantity;
    } else {
      globalCart.push({
        id: dish.id,
        dish,
        quantity,
        unitPrice: dish.price,
      });
    }
    notifyListeners();
  };

  const removeItem = (dishId: string) => {
    globalCart = globalCart.filter((i) => i.id !== dishId);
    notifyListeners();
  };

  const updateQuantity = (dishId: string, quantity: number) => {
    if (quantity <= 0) {
      removeItem(dishId);
      return;
    }
    const item = globalCart.find((i) => i.id === dishId);
    if (item) {
      item.quantity = quantity;
      notifyListeners();
    }
  };

  const clearCart = () => {
    globalCart = [];
    notifyListeners();
  };

  const comboCalculation = calculateComboPricing(items);
  const totalItemCount = items.reduce((sum, item) => sum + item.quantity, 0);

  return {
    items,
    addItem,
    removeItem,
    updateQuantity,
    clearCart,
    fullCombosCount: comboCalculation.fullCombosCount,
    comboTotal: comboCalculation.comboTotal,
    leftoverTotal: comboCalculation.leftoverTotal,
    subtotal: comboCalculation.subtotal,
    totalItemCount,
  };
}