-- ==========================================================
-- MenuLiz · Migración 0002
-- - Corrige el trigger de stock (evita el error 42P01 "relation v_current_stock does not exist")
-- - Permite al admin ELIMINAR pedidos (limpiar registros de prueba)
-- - Lectura pública de restaurant_settings
-- - Semilla de initial_stock en daily_menus
--
-- Es idempotente: se puede ejecutar varias veces sin problema.
-- ==========================================================

-- 1) Trigger de descuento de stock corregido (sin variables dentro del UPDATE)
CREATE OR REPLACE FUNCTION public.decrement_daily_menu_stock()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.dish_id IS NOT NULL THEN
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

-- 2) Política para que el admin elimine pedidos (los items caen por cascade)
DROP POLICY IF EXISTS "Admins eliminan pedidos" ON public.orders;
CREATE POLICY "Admins eliminan pedidos"
  ON public.orders FOR DELETE
  TO authenticated
  USING (true);

-- 3) Lectura pública de la configuración del restaurante
DROP POLICY IF EXISTS "Lectura pública de configuración" ON public.restaurant_settings;
CREATE POLICY "Lectura pública de configuración"
  ON public.restaurant_settings FOR SELECT
  TO public
  USING (true);

-- 4) Semilla de initial_stock para el menú de hoy (si faltaba)
UPDATE public.daily_menus
SET initial_stock = stock
WHERE initial_stock = 0;
