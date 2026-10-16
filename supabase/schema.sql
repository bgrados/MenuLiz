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
  initial_stock INTEGER NOT NULL DEFAULT 0,
  is_available BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  CONSTRAINT unique_daily_dish_date UNIQUE (date, dish_id),
  CONSTRAINT daily_menu_stock_non_negative CHECK (stock >= 0)
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
  payment_receipt_path TEXT,
  payment_note TEXT,
  payment_confirmed_at TIMESTAMPTZ,
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
--    Nota: se evita usar variables PL/pgSQL dentro del UPDATE (Postgres las confunde con
--    relaciones y lanza "42P01 relation does not exist"). Se calcula todo desde columnas.
CREATE OR REPLACE FUNCTION public.decrement_daily_menu_stock()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.dish_id IS NOT NULL THEN
    -- Descuenta solo si hay stock suficiente
    UPDATE public.daily_menus
    SET
      stock = stock - NEW.quantity,
      initial_stock = CASE
        WHEN COALESCE(initial_stock, 0) = 0 THEN stock
        ELSE GREATEST(initial_stock, stock)
      END,
      is_available = CASE
        WHEN (stock - NEW.quantity) <= 0 THEN false
        ELSE is_available
      END
    WHERE
      dish_id = NEW.dish_id
      AND date = CURRENT_DATE
      AND stock >= NEW.quantity;

    -- Si no actualizó filas: o no estaba en el menú de hoy, o no había stock suficiente
    IF NOT FOUND THEN
      PERFORM 1
      FROM public.daily_menus
      WHERE dish_id = NEW.dish_id AND date = CURRENT_DATE;

      IF FOUND THEN
        RAISE EXCEPTION 'Stock insuficiente para el plato %', NEW.dish_id;
      END IF;
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

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

-- Permitir que el admin elimine pedidos (p. ej. limpiar registros de prueba).
-- Al borrar el pedido, sus order_items se eliminan por ON DELETE CASCADE.
CREATE POLICY "Admins eliminan pedidos"
  ON public.orders FOR DELETE
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

-- 11. Habilitar Supabase Realtime para la tabla de pedidos y menú del día
ALTER PUBLICATION supabase_realtime ADD TABLE public.orders;
ALTER PUBLICATION supabase_realtime ADD TABLE public.daily_menus;

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

-- 12b. Bucket privado para constancias de pago (Yape/Plin/Lemon)
--      El cliente las sube; solo el admin las ve (signed URLs).
INSERT INTO storage.buckets (id, name, public)
VALUES ('payment-receipts', 'payment-receipts', false)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Clientes suben constancias de pago"
  ON storage.objects FOR INSERT
  TO anon, authenticated
  WITH CHECK (bucket_id = 'payment-receipts');

CREATE POLICY "Admins ven constancias de pago"
  ON storage.objects FOR SELECT
  TO authenticated
  USING (bucket_id = 'payment-receipts');

-- 13. Datos Semilla Iniciales
INSERT INTO public.dishes (id, name, description, price, category, image_url, is_active)
VALUES
  -- Entradas
  ('d0000001-0000-0000-0000-000000000001', 'Sopa Criolla Calientita', 'Sustanciosa sopa casera con carne de res molida, cabello de ángel, leche y huevo pochado.', 6.00, 'entrada', '/images/sopa-criolla.webp', true),
  ('d0000001-0000-0000-0000-000000000002', 'Causa Rellena de Pollo', 'Masa suave de papa amarilla al limón y ají amarillo con pollo y palta fresca.', 6.00, 'entrada', '/images/causa-rellena.webp', true),
  ('d0000001-0000-0000-0000-000000000003', 'Tequeños con Guacamole (4 und)', 'Crocantes wantanes rellenos de queso fresco con salsa de palta criolla.', 6.00, 'entrada', '/images/tequenos-palta.jpg', true),
  
  -- Segundos
  ('d0000002-0000-0000-0000-000000000001', 'Lomo Saltado al Wok', 'Trozos de lomo fino salteados con cebolla, tomate, ají amarillo, papas fritas y arroz.', 11.00, 'segundo', '/images/Lomo-Saltado.webp', true),
  ('d0000002-0000-0000-0000-000000000002', 'Ají de Gallina Casero', 'Pechuga deshilachada en crema de ají amarillo con papas nativas, huevo y aceituna.', 10.00, 'segundo', '/images/aji-de-gallina.webp', true),
  ('d0000002-0000-0000-0000-000000000003', 'Arroz con Pollo & Huancaína', 'Arroz graneado al culantro con presa dorada y crema huancaína tradicional.', 10.00, 'segundo', '/images/arrozconpollo.webp', true),
  ('d0000002-0000-0000-0000-000000000004', 'Seco de Res con Frejoles', 'Carne macerada en chicha de jora y culantro con frejoles cremosos y sarsa criolla.', 11.00, 'segundo', '/images/seco-de-carne-con-frejoles.webp', true),
  ('d0000002-0000-0000-0000-000000000005', 'Milanesa de Pollo Crujiente', 'Pechuga apanada dorada con papas fritas, arroz blanco y ensalada fresca.', 10.00, 'segundo', '/images/milanesa-de-pollo.webp', true),

  -- Refrescos
  ('d0000003-0000-0000-0000-000000000001', 'Chicha Morada Natural (Vaso)', 'Preparada artesanalmente con maíz morado, piña, manzana y canela.', 3.00, 'refresco', '/images/chichamorada.webp', true),
  ('d0000003-0000-0000-0000-000000000002', 'Refresco de Maracuyá (Vaso)', 'Jugo natural de pura pulpa de maracuyá bien frío.', 3.00, 'refresco', '/images/maracuya.webp', true),

  -- A la Carta
  ('d0000004-0000-0000-0000-000000000001', 'Bistec a lo Pobre Especial', 'Bistec jugoso con plátano frito, dos huevos montados, papas fritas y arroz.', 24.00, 'a_la_carta', '/images/bisteckpobre.webp', true),
  ('d0000004-0000-0000-0000-000000000002', 'Ceviche Mixto Carretillero', 'Pescado fresco y mariscos marinados al limón norteño con camote, choclo y canchita.', 26.00, 'a_la_carta', '/images/placeholder-dish.svg', true),
  ('d0000004-0000-0000-0000-000000000003', 'Tallarines Verdes con Churrasco', 'Fideos bañados en crema de espinaca, albahaca y queso con churrasco a la plancha.', 22.00, 'a_la_carta', '/images/tallarinverdebisteck.webp', true)
ON CONFLICT (id) DO NOTHING;

-- 13b. Platos extra (INACTIVOS): listos para editar y activar desde el admin.
-- Precios referenciales/editables. No se muestran al cliente ni entran al menú del día.
INSERT INTO public.dishes (id, name, description, price, category, image_url, is_active)
VALUES
  -- Entradas
  ('d0000005-0000-0000-0000-000000000001', 'Aguadito de Pollo', 'Arroz caldoso con culantro, presa de pollo, arvejas y zanahoria. Reconfortante y sabroso.', 6.00, 'entrada', '/images/Aguadito_de_Pollo-Peruano.webp', false),
  ('d0000005-0000-0000-0000-000000000002', 'Caldo de Gallina Tradicional', 'Caldo sustancioso de gallina de corral con fideos, huevo, cebolla china y kion.', 6.00, 'entrada', '/images/Caldo-de-Gallina-Tradicional.webp', false),
  ('d0000005-0000-0000-0000-000000000003', 'Sopa a la Minuta', 'Sopa criolla de carne molida con fideos, leche, ají panca y huevo pochado.', 6.00, 'entrada', '/images/sopalaminuta.webp', false),
  ('d0000005-0000-0000-0000-000000000004', 'Solterito Arequipeño', 'Ensalada fresca de habas, queso fresco, tomate, cebolla, aceituna y rocoto al limón.', 6.00, 'entrada', '/images/solterito-arequipeno.webp', false),
  ('d0000005-0000-0000-0000-000000000005', 'Palta Rellena', 'Palta fresca rellena de ensalada de pollo con mayonesa, acompañada de lechuga y tomate.', 7.00, 'entrada', '/images/paltarellena.webp', false),

  -- Segundos
  ('d0000006-0000-0000-0000-000000000001', 'Carapulcra de Pollo', 'Guiso de papa seca y pollo al ají panca con aroma de clavo y canela, acompañado de arroz.', 10.00, 'segundo', '/images/Carapulcra-de-Pollo-Receta.webp', false),
  ('d0000006-0000-0000-0000-000000000002', 'Cau Cau de Mondongo', 'Guiso de mondongo con papa amarilla, arvejas y cúrcuma, servido con arroz blanco.', 10.00, 'segundo', '/images/cau-cau-de-mondongo.webp', false),
  ('d0000006-0000-0000-0000-000000000003', 'Estofado de Pollo', 'Presa de pollo guisada con papas, zanahoria y arvejas en salsa de tomate criolla, con arroz.', 10.00, 'segundo', '/images/estofado-de-pollo.webp', false),
  ('d0000006-0000-0000-0000-000000000004', 'Menestrón de Carne', 'Sopa contundente de fideos con carne, garbanzos, verduras y albahaca fresca.', 10.00, 'segundo', '/images/menestron-de-carne.webp', false),
  ('d0000006-0000-0000-0000-000000000005', 'Pallares con Pescado', 'Pallares cremosos con cebolla y ají amarillo acompañados de pescado frito crocante.', 11.00, 'segundo', '/images/Pallares-pescado.webp', false),
  ('d0000006-0000-0000-0000-000000000006', 'Sudado de Pescado', 'Filete de pescado sudado con tomate, cebolla, ají amarillo y culantro, con arroz y yuca.', 11.00, 'segundo', '/images/sudado-de-pescado_web.jpg.webp', false),
  ('d0000006-0000-0000-0000-000000000007', 'Tallarines Rojos con Pollo', 'Fideos en salsa de tomate con presa de pollo guisada y queso parmesano.', 10.00, 'segundo', '/images/tallarines_rojos_con_pollo_77014_600.webp', false),
  ('d0000006-0000-0000-0000-000000000008', 'Asado con Puré', 'Carne de res asada al horno con papas doradas y puré de papa cremoso.', 11.00, 'segundo', '/images/asadopure.jpg', false),
  ('d0000006-0000-0000-0000-000000000009', 'Sancochado', 'Caldo criollo de res con repollo, zanahoria, papa, choclo y yuca. Bien caliente.', 11.00, 'segundo', '/images/sancochado.webp', false),
  ('d0000006-0000-0000-0000-000000000010', 'Escabeche de Pescado', 'Pescado marinado al escabeche con cebolla, ají y especias, acompañado de camote y choclo.', 12.00, 'segundo', '/images/escabeche-de-pescado.webp', false),

  -- Refrescos
  ('d0000007-0000-0000-0000-000000000001', 'Refresco de Cebada', 'Refresco natural de cebada tostada con canela y limón, servido bien frío.', 3.00, 'refresco', '/images/refresco-de-cebada.webp', false),
  ('d0000007-0000-0000-0000-000000000002', 'Agua de Hierba Luisa', 'Infusión natural de hierba luisa bien helada, refrescante y digestiva.', 3.00, 'refresco', '/images/agua-de-hierba-luisa.webp', false)
ON CONFLICT (id) DO NOTHING;

-- Asignar los platos de hoy al menú diario
INSERT INTO public.daily_menus (date, dish_id, stock, initial_stock, is_available)
SELECT CURRENT_DATE, id, 15, 15, true
FROM public.dishes
WHERE is_active = true
ON CONFLICT (date, dish_id) DO NOTHING;

-- 14. Configuración del restaurante (teléfono WhatsApp, tarifa delivery, nombre)
CREATE TABLE IF NOT EXISTS public.restaurant_settings (
  id TEXT PRIMARY KEY DEFAULT 'main',
  whatsapp_number TEXT NOT NULL DEFAULT '51999999999',
  delivery_fee NUMERIC(10, 2) NOT NULL DEFAULT 3.00,
  menu_price NUMERIC(10, 2) NOT NULL DEFAULT 14.00,
  restaurant_name TEXT NOT NULL DEFAULT 'Sabor Norteño',
  address TEXT DEFAULT 'Atención en local y delivery en zona',
  opening_hours TEXT DEFAULT 'Lunes a Domingo: 11:30 AM - 4:30 PM',
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

ALTER TABLE public.restaurant_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins gestionan configuración"
  ON public.restaurant_settings FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Lectura pública para que el cliente y el layout puedan mostrar nombre, horario y dirección
CREATE POLICY "Lectura pública de configuración"
  ON public.restaurant_settings FOR SELECT
  TO public
  USING (true);

INSERT INTO public.restaurant_settings (id, whatsapp_number, delivery_fee, restaurant_name)
VALUES ('main', '51999999999', 3.00, 'Sabor Norteño')
ON CONFLICT (id) DO NOTHING;

-- 15. Función RPC para crear pedidos sin exponer SELECT directo al rol anon
CREATE OR REPLACE FUNCTION public.create_order(
  p_customer_name TEXT,
  p_customer_phone TEXT,
  p_delivery_type TEXT,
  p_delivery_address TEXT,
  p_delivery_fee NUMERIC,
  p_subtotal NUMERIC,
  p_total NUMERIC,
  p_payment_method TEXT,
  p_notes TEXT,
  p_status TEXT DEFAULT 'nuevo'
) RETURNS TABLE (id UUID, order_number INTEGER)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_id UUID;
  v_number INTEGER;
BEGIN
  INSERT INTO public.orders (
    customer_name, customer_phone, delivery_type, delivery_address,
    delivery_fee, subtotal, total, payment_method, notes, status
  ) VALUES (
    p_customer_name, p_customer_phone, p_delivery_type, p_delivery_address,
    p_delivery_fee, p_subtotal, p_total, p_payment_method, p_notes, p_status
  )
  RETURNING orders.id, orders.order_number INTO v_id, v_number;

  RETURN QUERY SELECT v_id, v_number;
END;
$$;

GRANT EXECUTE ON FUNCTION public.create_order(
  TEXT, TEXT, TEXT, TEXT, NUMERIC, NUMERIC, NUMERIC, TEXT, TEXT, TEXT
) TO anon, authenticated;

-- 15b. RPC para que el cliente asocie la constancia de pago a su pedido
CREATE OR REPLACE FUNCTION public.attach_payment_receipt(
  p_order_id UUID,
  p_receipt_path TEXT
) RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.orders
     SET payment_receipt_path = p_receipt_path
   WHERE id = p_order_id;
END;
$$;

GRANT EXECUTE ON FUNCTION public.attach_payment_receipt(UUID, TEXT) TO anon, authenticated;

-- 15c. Confirmación de pago "en 1 toque" (para quien no sabe subir/adjuntar la constancia)
CREATE OR REPLACE FUNCTION public.confirm_order_payment(
  p_order_id UUID,
  p_note TEXT DEFAULT NULL
) RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.orders
     SET payment_confirmed_at = timezone('utc'::text, now()),
         payment_note = NULLIF(trim(coalesce(p_note, '')), '')
   WHERE id = p_order_id;
END;
$$;

GRANT EXECUTE ON FUNCTION public.confirm_order_payment(UUID, TEXT) TO anon, authenticated;

-- 15d. Lectura mínima del pedido para la página /pago/[id] (solo por UUID)
CREATE OR REPLACE FUNCTION public.get_order_payment_info(p_order_id UUID)
RETURNS TABLE (
  id UUID,
  order_number INTEGER,
  customer_name TEXT,
  payment_method TEXT,
  total NUMERIC,
  has_receipt BOOLEAN,
  payment_confirmed_at TIMESTAMPTZ
)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT o.id,
         o.order_number,
         o.customer_name,
         o.payment_method,
         o.total,
         (o.payment_receipt_path IS NOT NULL) AS has_receipt,
         o.payment_confirmed_at
    FROM public.orders o
   WHERE o.id = p_order_id;
$$;

GRANT EXECUTE ON FUNCTION public.get_order_payment_info(UUID) TO anon, authenticated;

-- 16. Base de clientes (CRM simple para comensales recurrentes)
CREATE TABLE IF NOT EXISTS public.customers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  phone TEXT NOT NULL UNIQUE,
  name TEXT,
  address TEXT,
  marketing_consent BOOLEAN NOT NULL DEFAULT false,
  total_orders INTEGER NOT NULL DEFAULT 0,
  total_spent NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
  last_order_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins gestionan clientes"
  ON public.customers FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE OR REPLACE FUNCTION public.upsert_customer(
  p_phone TEXT,
  p_name TEXT,
  p_address TEXT,
  p_marketing_consent BOOLEAN,
  p_total NUMERIC
) RETURNS TABLE (id UUID)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_id UUID;
BEGIN
  INSERT INTO public.customers (phone, name, address, marketing_consent, total_orders, total_spent, last_order_at)
  VALUES (p_phone, p_name, p_address, p_marketing_consent, 1, p_total, now())
  ON CONFLICT (phone) DO UPDATE SET
    name = EXCLUDED.name,
    address = COALESCE(EXCLUDED.address, public.customers.address),
    marketing_consent = public.customers.marketing_consent OR EXCLUDED.marketing_consent,
    total_orders = public.customers.total_orders + 1,
    total_spent = public.customers.total_spent + EXCLUDED.total_spent,
    last_order_at = now(),
    updated_at = now()
  RETURNING customers.id INTO v_id;

  RETURN QUERY SELECT v_id;
END;
$$;

GRANT EXECUTE ON FUNCTION public.upsert_customer(TEXT, TEXT, TEXT, BOOLEAN, NUMERIC) TO anon, authenticated;