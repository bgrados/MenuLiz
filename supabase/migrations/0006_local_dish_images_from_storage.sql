-- ==========================================================
-- MenuLiz · Migración 0006
-- Guarda localmente en /public/images las fotos que la dueña había subido
-- al bucket de Storage (dish-images) y apunta dishes.image_url a la ruta
-- local. Es exactamente la misma imagen, pero ahora la sirve la propia app
-- (cacheable por la PWA, sin depender de Storage y más rápido).
--
-- Además corrige dos URLs absolutas que apuntaban a menuliz.vercel.app.
--
-- Idempotente. Ejecutar en Supabase -> SQL Editor.
-- ==========================================================

-- Platos que usaban Storage -> ruta local (misma foto)
UPDATE public.dishes SET image_url = '/images/aji-de-gallina.webp'                WHERE id = 'd0000002-0000-0000-0000-000000000002';
UPDATE public.dishes SET image_url = '/images/arroz-chaufa-de-pollo.webp'         WHERE id = '0846af68-bd78-48b1-bfbc-f55b78e122f4';
UPDATE public.dishes SET image_url = '/images/bisteck-con-frejoles.webp'          WHERE id = '3863d81f-bde4-4fdd-bbab-af7443bd10f9';
UPDATE public.dishes SET image_url = '/images/filete-de-pollo-a-la-plancha.webp'  WHERE id = '283f46d1-be44-4b8d-95dc-8f6fc6bd8172';
UPDATE public.dishes SET image_url = '/images/gelatina.webp'                      WHERE id = '995e7f3f-7009-4bb3-b494-8773dbe411e7';
UPDATE public.dishes SET image_url = '/images/agua-de-hierba-luisa.webp'          WHERE id = '57556b6a-4a71-4695-8581-0957e1e2db92';
UPDATE public.dishes SET image_url = '/images/lomo-saltado-de-carne.webp'         WHERE id = 'aafcacda-f58c-432d-bb9a-db1ff86b9f8a';
UPDATE public.dishes SET image_url = '/images/menestron-de-carne.webp'            WHERE id = '01f2d522-277e-4c4b-9a59-c8beb95e55ca';
UPDATE public.dishes SET image_url = '/images/milanesa-apanada-con-papas.webp'    WHERE id = '43a80610-e2a1-476b-a0c3-617297781e2a';
UPDATE public.dishes SET image_url = '/images/olluquito-con-charqui.webp'         WHERE id = 'dbe6ef01-552d-4248-b416-409a42c3d232';
UPDATE public.dishes SET image_url = '/images/pollo-al-horno-con-papas.webp'      WHERE id = 'ff66525f-9a43-48fa-aa2c-fbe8264a3ef3';
UPDATE public.dishes SET image_url = '/images/refresco-de-carambola-peruano.webp' WHERE id = 'cfbe2a71-1b79-40b2-b794-43c0ebceadc9';
UPDATE public.dishes SET image_url = '/images/sopa-de-casa.webp'                  WHERE id = 'e4b130f5-afa4-4c5c-82f2-861057f87446';
UPDATE public.dishes SET image_url = '/images/sopalaminuta.webp'                  WHERE id = '33e45f5e-0d24-44c2-bae5-24cb5b6a9b98';
UPDATE public.dishes SET image_url = '/images/suprema-a-lo-pobre.webp'            WHERE id = 'ab84bbe2-9bf6-4b29-8192-38b15a77ccab';
UPDATE public.dishes SET image_url = '/images/trucha-frita-con-yuca.webp'         WHERE id = '6bb8ca8a-d1f3-4cce-8082-ac2c9752f8fa';

-- URLs absolutas al dominio de Vercel -> ruta relativa local
UPDATE public.dishes SET image_url = '/images/bisteckpobre.webp'         WHERE id = 'd0000004-0000-0000-0000-000000000001';
UPDATE public.dishes SET image_url = '/images/tallarinverdebisteck.webp' WHERE id = 'd0000004-0000-0000-0000-000000000003';
