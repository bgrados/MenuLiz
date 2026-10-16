-- ==========================================================
-- Sabor Norteño · Migración 0007
-- Cambia el nombre del restaurante (fuente única: restaurant_settings).
-- Este valor manda en el header, la landing, la confirmación, el panel
-- y los metadatos de la app. También se deja como valor por defecto para
-- instalaciones nuevas.
--
-- Idempotente. Ejecutar en Supabase -> SQL Editor.
-- ==========================================================

UPDATE public.restaurant_settings
   SET restaurant_name = 'Sabor Norteño',
       updated_at = timezone('utc'::text, now())
 WHERE id = 'main';

ALTER TABLE public.restaurant_settings
  ALTER COLUMN restaurant_name SET DEFAULT 'Sabor Norteño';
