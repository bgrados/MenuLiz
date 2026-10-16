-- ==========================================================
-- MenuLiz · Migración 0004
-- Agrega 17 platos extra aprovechando las fotos locales de /public/images.
--
-- IMPORTANTE: se crean como is_active = false (INACTIVOS).
--   - NO se muestran al cliente.
--   - NO se agregan automáticamente al menú del día.
--   - Aparecen solo en Admin -> Platos, para que edites precio/nombre/categoría
--     y los actives cuando quieras.
--
-- Los precios son REFERENCIALES (editables). Es idempotente (ON CONFLICT DO NOTHING).
-- Ejecutar en Supabase -> SQL Editor.
-- ==========================================================

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
