-- ==========================================================
-- MenuLiz: Esquema de Base de Datos Integral para Supabase
-- Ejecuta este script en Supabase -> SQL Editor
-- ==========================================================

-- 1. Extensiones necesarias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Tabla de perfiles de usuario (Admin)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  role TEXT NOT NULL DEFAULT 'admin',
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 3. Tabla de Platos (Catálogo General)
CREATE TABLE IF NOT EXISTS public.dishes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  price NUMERIC(10, 2) NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('entrada', 'segundo', 'refresco', 'a_la_carta')),
  image_url TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 4. Tabla de Menú Diario (Stock y disponibilidad por fecha)
CREATE TABLE IF NOT EXISTS public.daily_menus (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  dish_id UUID NOT NULL REFERENCES public.dishes(id) ON DELETE CASCADE,
  stock INTEGER NOT NULL DEFAULT 10,
  is_available BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  CONSTRAINT unique_daily_dish_date UNIQUE (date, dish_id)
);

-- 5. Tabla de Pedidos
CREATE TABLE IF NOT EXISTS public.orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_number SERIAL,
  customer_name TEXT NOT NULL,
  customer_phone TEXT NOT NULL,
  delivery_type TEXT NOT NULL CHECK (delivery_type IN ('delivery', 'recojo')),
  delivery_address TEXT,
  delivery_fee NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
  subtotal NUMERIC(10, 2) NOT NULL,
  total NUMERIC(10, 2) NOT NULL,
  payment_method TEXT NOT NULL CHECK (payment_method IN ('efectivo', 'yape', 'plin', 'lemon')),
  notes TEXT,
  status TEXT NOT NULL DEFAULT 'nuevo' CHECK (status IN ('nuevo', 'confirmado', 'en_preparacion', 'en_camino', 'listo_para_recoger', 'completado', 'cancelado')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 6. Tabla de Ítems de Pedidos
CREATE TABLE IF NOT EXISTS public.order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  dish_id UUID REFERENCES public.dishes(id) ON DELETE SET NULL,
  dish_name TEXT NOT NULL,
  category TEXT NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 1,
  unit_price NUMERIC(10, 2) NOT NULL,
  is_combo_part BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 7. Índices de Alto Rendimiento
CREATE INDEX IF NOT EXISTS idx_dishes_category ON public.dishes(category);
CREATE INDEX IF NOT EXISTS idx_dishes_is_active ON public.dishes(is_active);
CREATE INDEX IF NOT EXISTS idx_daily_menus_date ON public.daily_menus(date);
CREATE INDEX IF NOT EXISTS idx_daily_menus_dish_id ON public.daily_menus(dish_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON public.orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON public.orders(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON public.order_items(order_id);

-- 8. Trigger para Descontar Stock Automáticamente en daily_menus
CREATE OR REPLACE FUNCTION public.decrement_daily_menu_stock()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.dish_id IS NOT NULL THEN
    UPDATE public.daily_menus
    SET 
      stock = GREATEST(0, stock - NEW.quantity),
      is_available = CASE WHEN (stock - NEW.quantity) <= 0 THEN false ELSE is_available END
    WHERE 
      dish_id = NEW.dish_id 
      AND date = CURRENT_DATE;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_decrement_stock ON public.order_items;
CREATE TRIGGER trg_decrement_stock
AFTER INSERT ON public.order_items
FOR EACH ROW
EXECUTE FUNCTION public.decrement_daily_menu_stock();

-- 9. Habilitar Row Level Security (RLS)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dishes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_menus ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;

-- 10. Políticas de Seguridad (RLS)
-- Profiles: Solo usuario autenticado lee su propio perfil
CREATE POLICY "Usuarios pueden leer su perfil"
  ON public.profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

-- Dishes: Lectura pública, modificación solo admins
CREATE POLICY "Lectura pública de platos"
  ON public.dishes FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Admins gestionan platos"
  ON public.dishes FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Daily Menus: Lectura pública, modificación solo admins
CREATE POLICY "Lectura pública del menú del día"
  ON public.daily_menus FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Admins gestionan menú del día"
  ON public.daily_menus FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Orders: Inserción pública para clientes, lectura y modificación para admins
CREATE POLICY "Clientes pueden crear pedidos"
  ON public.orders FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Admins ven todos los pedidos"
  ON public.orders FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admins actualizan pedidos"
  ON public.orders FOR UPDATE
  TO authenticated
  USING (true);

-- Order Items: Inserción pública
CREATE POLICY "Clientes pueden crear items de pedido"
  ON public.order_items FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Admins ven items de pedido"
  ON public.order_items FOR SELECT
  TO authenticated
  USING (true);

-- 11. Habilitar Supabase Realtime para la tabla de pedidos
ALTER PUBLICATION supabase_realtime ADD TABLE public.orders;

-- 12. Creación del Storage Bucket para fotos de platos
INSERT INTO storage.buckets (id, name, public) 
VALUES ('dish-images', 'dish-images', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Fotos de platos son públicas"
  ON storage.objects FOR SELECT
  TO public
  USING (bucket_id = 'dish-images');

CREATE POLICY "Admins suben fotos de platos"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'dish-images');

-- 13. Datos Semilla Iniciales
INSERT INTO public.dishes (id, name, description, price, category, image_url, is_active)
VALUES
  -- Entradas
  ('d0000001-0000-0000-0000-000000000001', 'Sopa Criolla Calientita', 'Sustanciosa sopa casera con carne de res molida, cabello de ángel, leche y huevo pochado.', 6.00, 'entrada', 'https://images.unsplash.com/photo-1547592166-23ac45744acd?auto=format&fit=crop&w=800&q=80', true),
  ('d0000001-0000-0000-0000-000000000002', 'Causa Rellena de Pollo', 'Masa suave de papa amarilla al limón y ají amarillo con pollo y palta fresca.', 6.00, 'entrada', 'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=800&q=80', true),
  ('d0000001-0000-0000-0000-000000000003', 'Tequeños con Guacamole (4 und)', 'Crocantes wantanes rellenos de queso fresco con salsa de palta criolla.', 6.00, 'entrada', 'https://images.unsplash.com/photo-1582169505937-b9992bd01ed9?auto=format&fit=crop&w=800&q=80', true),
  
  -- Segundos
  ('d0000002-0000-0000-0000-000000000001', 'Lomo Saltado al Wok', 'Trozos de lomo fino salteados con cebolla, tomate, ají amarillo, papas fritas y arroz.', 11.00, 'segundo', 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=800&q=80', true),
  ('d0000002-0000-0000-0000-000000000002', 'Ají de Gallina Casero', 'Pechuga deshilachada en crema de ají amarillo con papas nativas, huevo y aceituna.', 10.00, 'segundo', 'https://images.unsplash.com/photo-1565299585323-38d6b0865b47?auto=format&fit=crop&w=800&q=80', true),
  ('d0000002-0000-0000-0000-000000000003', 'Arroz con Pollo & Huancaína', 'Arroz graneado al culantro con presa dorada y crema huancaína tradicional.', 10.00, 'segundo', 'https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?auto=format&fit=crop&w=800&q=80', true),
  ('d0000002-0000-0000-0000-000000000004', 'Seco de Res con Frejoles', 'Carne macerada en chicha de jora y culantro con frejoles cremosos y sarsa criolla.', 11.00, 'segundo', 'https://images.unsplash.com/photo-1547496502-affa22d38842?auto=format&fit=crop&w=800&q=80', true),
  ('d0000002-0000-0000-0000-000000000005', 'Milanesa de Pollo Crujiente', 'Pechuga apanada dorada con papas fritas, arroz blanco y ensalada fresca.', 10.00, 'segundo', 'https://images.unsplash.com/photo-1598515214211-89d3c73ae83b?auto=format&fit=crop&w=800&q=80', true),

  -- Refrescos
  ('d0000003-0000-0000-0000-000000000001', 'Chicha Morada Natural (Vaso)', 'Preparada artesanalmente con maíz morado, piña, manzana y canela.', 3.00, 'refresco', 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?auto=format&fit=crop&w=800&q=80', true),
  ('d0000003-0000-0000-0000-000000000002', 'Refresco de Maracuyá (Vaso)', 'Jugo natural de pura pulpa de maracuyá bien frío.', 3.00, 'refresco', 'https://images.unsplash.com/photo-1621263764928-df1444c5e859?auto=format&fit=crop&w=800&q=80', true),

  -- A la Carta
  ('d0000004-0000-0000-0000-000000000001', 'Bistec a lo Pobre Especial', 'Bistec jugoso con plátano frito, dos huevos montados, papas fritas y arroz.', 24.00, 'a_la_carta', 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&w=800&q=80', true),
  ('d0000004-0000-0000-0000-000000000002', 'Ceviche Mixto Carretillero', 'Pescado fresco y mariscos marinados al limón norteño con camote, choclo y canchita.', 26.00, 'a_la_carta', 'https://images.unsplash.com/photo-1535399831218-d5bd36d1a6b3?auto=format&fit=crop&w=800&q=80', true),
  ('d0000004-0000-0000-0000-000000000003', 'Tallarines Verdes con Churrasco', 'Fideos bañados en crema de espinaca, albahaca y queso con churrasco a la plancha.', 22.00, 'a_la_carta', 'https://images.unsplash.com/photo-1551183053-bf91a1d81141?auto=format&fit=crop&w=800&q=80', true)
ON CONFLICT (id) DO NOTHING;

-- Asignar los platos de hoy al menú diario
INSERT INTO public.daily_menus (date, dish_id, stock, is_available)
SELECT CURRENT_DATE, id, 15, true
FROM public.dishes
WHERE is_active = true
ON CONFLICT (date, dish_id) DO NOTHING;
