export type Category = 'todos' | 'menu_del_dia' | 'entradas' | 'segundos' | 'bebidas' | 'postres' | 'combos';

export interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  category: 'entradas' | 'segundos' | 'bebidas' | 'postres' | 'combos';
  image_url: string;
  is_available: boolean;
  is_daily_special: boolean;
  badge?: string;
}

export interface CartItem {
  item: MenuItem;
  quantity: number;
  notes?: string;
}

export type OrderType = 'delivery' | 'mesa' | 'llevar';
export type PaymentMethod = 'yape' | 'plin' | 'efectivo' | 'tarjeta';

export interface OrderDetails {
  customerName: string;
  phone: string;
  orderType: OrderType;
  tableNumber?: string;
  address?: string;
  paymentMethod: PaymentMethod;
  notes?: string;
}
