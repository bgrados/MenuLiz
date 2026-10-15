export type DishCategory = 'entrada' | 'segundo' | 'refresco' | 'a_la_carta';

export type OrderStatus =
  | 'nuevo'
  | 'confirmado'
  | 'en_preparacion'
  | 'en_camino'
  | 'listo_para_recoger'
  | 'completado'
  | 'cancelado';

export type PaymentMethod = 'efectivo' | 'yape' | 'plin' | 'lemon';

export type DeliveryType = 'delivery' | 'recojo';

export interface Dish {
  id: string;
  name: string;
  description?: string | null;
  price: number;
  category: DishCategory;
  image_url?: string | null;
  is_active: boolean;
  created_at?: string;
}

export interface DailyMenu {
  id: string;
  date: string;
  dish_id: string;
  stock: number;
  is_available: boolean;
  created_at?: string;
  dish?: Dish;
}

export interface DailyDishItem {
  id: string; // dish id
  daily_menu_id?: string;
  name: string;
  description?: string | null;
  price: number;
  category: DishCategory;
  image_url?: string | null;
  stock: number;
  is_available: boolean;
}

export interface CartItem {
  id: string; // dish id
  dish: DailyDishItem | Dish;
  quantity: number;
  unitPrice: number;
}

export interface Order {
  id: string;
  order_number?: number;
  customer_name: string;
  customer_phone: string;
  delivery_type: DeliveryType;
  delivery_address?: string | null;
  delivery_fee: number;
  subtotal: number;
  total: number;
  payment_method: PaymentMethod;
  notes?: string | null;
  status: OrderStatus;
  created_at: string;
  order_items?: OrderItem[];
}

export interface OrderItem {
  id?: string;
  order_id?: string;
  dish_id?: string | null;
  dish_name: string;
  category: string;
  quantity: number;
  unit_price: number;
  is_combo_part: boolean;
  created_at?: string;
}

export interface ComboCalculationResult {
  fullCombosCount: number;
  comboTotal: number;
  leftoverItems: CartItem[];
  leftoverTotal: number;
  subtotal: number;
}

export interface RestaurantSettings {
  id: string;
  phone_number?: string | null;
  whatsapp_number: string;
  restaurant_name?: string | null;
  delivery_fee?: number | null;
  updated_at?: string;
}
