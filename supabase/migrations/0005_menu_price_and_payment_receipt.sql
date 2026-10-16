-- ==========================================================
-- MenuLiz · Migración 0005
-- 1) Precio del menú (combo) configurable desde Admin -> Configuración.
--    Ese valor manda en toda la app (carrito, menú, compartir, admin).
-- 2) Constancia de pago (Yape/Plin/Lemon): el CLIENTE la sube desde la
--    pantalla de confirmación y queda guardada en el historial del pedido.
--
-- Idempotente. Ejecutar en Supabase -> SQL Editor.
-- ==========================================================

-- 1. Precio del menú completo (combo: 1 entrada + 1 segundo + 1 refresco)
ALTER TABLE public.restaurant_settings
  ADD COLUMN IF NOT EXISTS menu_price NUMERIC(10, 2) NOT NULL DEFAULT 14.00;

-- 2. Constancia de pago asociada al pedido.
--    Guardamos la RUTA dentro del bucket privado (no una URL pública).
ALTER TABLE public.orders
  ADD COLUMN IF NOT EXISTS payment_receipt_path TEXT;

-- 2b. Función para asociar la constancia a un pedido (sin exponer UPDATE a anon)
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

-- 3. Bucket privado para las constancias (solo el admin las ve; el cliente sube)
INSERT INTO storage.buckets (id, name, public)
VALUES ('payment-receipts', 'payment-receipts', false)
ON CONFLICT (id) DO NOTHING;

-- El cliente (anon) sube su constancia
DROP POLICY IF EXISTS "Clientes suben constancias de pago" ON storage.objects;
CREATE POLICY "Clientes suben constancias de pago"
  ON storage.objects FOR INSERT
  TO anon, authenticated
  WITH CHECK (bucket_id = 'payment-receipts');

-- Solo el admin autenticado puede leerlas (se usan signed URLs desde el panel)
DROP POLICY IF EXISTS "Admins ven constancias de pago" ON storage.objects;
CREATE POLICY "Admins ven constancias de pago"
  ON storage.objects FOR SELECT
  TO authenticated
  USING (bucket_id = 'payment-receipts');

-- 4. Realtime para que el precio cambie en vivo en las pantallas abiertas
DO $$
BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE public.restaurant_settings;
EXCEPTION WHEN others THEN NULL;
END $$;
