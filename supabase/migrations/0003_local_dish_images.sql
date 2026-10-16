-- ==========================================================
-- MenuLiz · Migración 0003
-- Reemplaza las fotos externas (Unsplash) por las fotos locales de /public/images.
-- Se empareja por nombre de plato para cubrir tanto los seeds como platos creados a mano.
--
-- Es idempotente: se puede ejecutar varias veces sin problema.
-- Ejecutar en Supabase -> SQL Editor.
-- ==========================================================

UPDATE public.dishes SET image_url = '/images/sopa-criolla.webp'                   WHERE name ILIKE '%sopa criolla%';
UPDATE public.dishes SET image_url = '/images/causa-rellena.webp'                  WHERE name ILIKE '%causa rellena%';
UPDATE public.dishes SET image_url = '/images/tequenos-palta.jpg'                  WHERE name ILIKE '%teque%';
UPDATE public.dishes SET image_url = '/images/Lomo-Saltado.webp'                   WHERE name ILIKE '%lomo saltado%';
UPDATE public.dishes SET image_url = '/images/aji-de-gallina.webp'                 WHERE name ILIKE '%aji de gallina%';
UPDATE public.dishes SET image_url = '/images/arrozconpollo.webp'                  WHERE name ILIKE '%arroz con pollo%';
UPDATE public.dishes SET image_url = '/images/seco-de-carne-con-frejoles.webp'     WHERE name ILIKE '%seco de%';
UPDATE public.dishes SET image_url = '/images/milanesa-de-pollo.webp'              WHERE name ILIKE '%milanesa%';
UPDATE public.dishes SET image_url = '/images/chichamorada.webp'                   WHERE name ILIKE '%chicha morada%';
UPDATE public.dishes SET image_url = '/images/maracuya.webp'                       WHERE name ILIKE '%maracuya%' OR name ILIKE '%maracuyá%';
UPDATE public.dishes SET image_url = '/images/bisteckpobre.webp'                   WHERE name ILIKE '%bistec%' OR name ILIKE '%a lo pobre%';
UPDATE public.dishes SET image_url = '/images/tallarinverdebisteck.webp'           WHERE name ILIKE '%tallarin%verde%' OR name ILIKE '%tallarines verdes%';
UPDATE public.dishes SET image_url = '/images/tallarines_rojos_con_pollo_77014_600.webp' WHERE name ILIKE '%tallarin%rojo%';

-- Platos frecuentes que quizá ya existan con otro id/nombre
UPDATE public.dishes SET image_url = '/images/Aguadito_de_Pollo-Peruano.webp'      WHERE name ILIKE '%aguadito%';
UPDATE public.dishes SET image_url = '/images/Caldo-de-Gallina-Tradicional.webp'   WHERE name ILIKE '%caldo de gallina%';
UPDATE public.dishes SET image_url = '/images/Carapulcra-de-Pollo-Receta.webp'     WHERE name ILIKE '%carapulcra%';
UPDATE public.dishes SET image_url = '/images/cau-cau-de-mondongo.webp'            WHERE name ILIKE '%cau cau%' OR name ILIKE '%cau-cau%';
UPDATE public.dishes SET image_url = '/images/escabeche-de-pescado.webp'           WHERE name ILIKE '%escabeche%';
UPDATE public.dishes SET image_url = '/images/estofado-de-pollo.webp'              WHERE name ILIKE '%estofado%';
UPDATE public.dishes SET image_url = '/images/menestron-de-carne.webp'             WHERE name ILIKE '%menestron%' OR name ILIKE '%menestrón%';
UPDATE public.dishes SET image_url = '/images/Pallares-pescado.webp'               WHERE name ILIKE '%pallares%';
UPDATE public.dishes SET image_url = '/images/paltarellena.webp'                   WHERE name ILIKE '%palta rellena%';
UPDATE public.dishes SET image_url = '/images/sancochado.webp'                     WHERE name ILIKE '%sancochado%';
UPDATE public.dishes SET image_url = '/images/solterito-arequipeno.webp'           WHERE name ILIKE '%solterito%';
UPDATE public.dishes SET image_url = '/images/sopalaminuta.webp'                   WHERE name ILIKE '%sopa a la minuta%';
UPDATE public.dishes SET image_url = '/images/sudado-de-pescado_web.jpg.webp'      WHERE name ILIKE '%sudado%';
UPDATE public.dishes SET image_url = '/images/refresco-de-cebada.webp'             WHERE name ILIKE '%cebada%';
UPDATE public.dishes SET image_url = '/images/agua-de-hierba-luisa.webp'           WHERE name ILIKE '%hierba luisa%';
UPDATE public.dishes SET image_url = '/images/asadopure.jpg'                       WHERE name ILIKE '%asado%';
