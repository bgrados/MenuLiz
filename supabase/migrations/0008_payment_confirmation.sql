-- ==========================================================
-- Sabor Norteño · Migración 0008
-- Confirmación de pago "en 1 toque" (Yape / Plin / Lemon).
--
-- Muchos clientes no saben descargar ni tomar una captura de su constancia.
-- Para ellos, la app permite tocar "Ya pagué": el pedido queda marcado como
-- pago por confirmar (con una nota opcional, p. ej. el N° de operación) y la
-- dueña lo coteja con la notificación que ya recibe en su propio Yape.
--
-- Además se agrega una función de solo lectura para que la página
-- /pago/[id] (el enlace que va en el mensaje de WhatsApp) pueda mostrar
-- los datos básicos del pedido sin exponer la tabla orders al rol anon.
--
-- Idempotente. Ejecutar en Supabase -> SQL Editor.
-- ==========================================================

ALTER TABLE public.orders
  ADD COLUMN IF NOT EXISTS payment_note TEXT;
ALTER TABLE public.orders
  ADD COLUMN IF NOT EXISTS payment_confirmed_at TIMESTAMPTZ;

-- 1. El cliente confirma que ya pagó (sin necesidad de subir imagen)
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

-- 2. Lectura mínima del pedido para la página de pago (solo por UUID)
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
