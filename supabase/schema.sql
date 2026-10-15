-- ==============================================
-- MenuLiz: Esquema de Base de Datos para Supabase
-- Ejecuta este script en Supabase -> SQL Editor
-- ==============================================

-- 1. Crear tabla de items del menú
CREATE TABLE IF NOT EXISTS public.menu_items (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  price NUMERIC(10, 2) NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('entradas', 'segundos', 'bebidas', 'postres', 'combos')),
  image_url TEXT NOT NULL,
  is_available BOOLEAN DEFAULT true,
  is_daily_special BOOLEAN DEFAULT false,
  badge TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Habilitar Row Level Security (RLS)
ALTER TABLE public.menu_items ENABLE ROW LEVEL SECURITY;

-- 3. Permitir lectura pública a cualquiera
CREATE POLICY "Permitir lectura publica del menu" 
  ON public.menu_items 
  FOR SELECT 
  TO anon, authenticated 
  USING (true);

-- 4. Permitir modificación con la clave anon/authenticated
CREATE POLICY "Permitir insercion del menu" 
  ON public.menu_items 
  FOR ALL 
  TO anon, authenticated 
  USING (true)
  WITH CHECK (true);

-- 5. Insertar datos iniciales
INSERT INTO public.menu_items (id, name, description, price, category, image_url, is_available, is_daily_special, badge)
VALUES
  ('1', 'Lomo Saltado Criollo', 'Jugosos trozos de lomo fino salteados al wok con cebolla, tomate, ají amarillo y papas fritas.', 18.00, 'segundos', 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=800&q=80', true, true, 'Plato Estrella'),
  ('2', 'Ají de Gallina Tradicional', 'Pechuga de pollo deshilachada en crema suave de ají amarillo con papas nativas.', 15.00, 'segundos', 'https://images.unsplash.com/photo-1565299585323-38d6b0865b47?auto=format&fit=crop&w=800&q=80', true, true, 'Menú del Día'),
  ('3', 'Arroz con Pollo & Papa Huancaína', 'Arroz graneado al culantro con presa dorada y crema huancaína artesanal.', 16.00, 'segundos', 'https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?auto=format&fit=crop&w=800&q=80', true, true, 'Menú del Día'),
  ('4', 'Seco de Res con Frejoles', 'Asado de tira macerado al culantro con frejoles cremosos y sarsa criolla.', 17.50, 'segundos', 'https://images.unsplash.com/photo-1547496502-affa22d38842?auto=format&fit=crop&w=800&q=80', true, false, 'Recomendado'),
  ('5', 'Milanesa de Pollo Especial', 'Crujiente pechuga apanada con ensalada fresca, papas fritas y arroz.', 14.50, 'segundos', 'https://images.unsplash.com/photo-1598515214211-89d3c73ae83b?auto=format&fit=crop&w=800&q=80', true, true, NULL),
  ('6', 'Causa Rellena de Pollo', 'Masa de papa amarilla al limón y ají amarillo con pollo deshilachado y palta.', 7.00, 'entradas', 'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=800&q=80', true, true, 'Entrada del Día'),
  ('7', 'Sopa Criolla Calientita', 'Sustanciosa sopa casera con carne picada, leche, fideos y huevo escalfado.', 8.00, 'entradas', 'https://images.unsplash.com/photo-1547592166-23ac45744acd?auto=format&fit=crop&w=800&q=80', true, true, 'Entrada del Día'),
  ('8', 'Tequeños de Queso con Guacamole', 'Masa wantán crocante con queso andino y guacamole criollo.', 10.00, 'entradas', 'https://images.unsplash.com/photo-1582169505937-b9992bd01ed9?auto=format&fit=crop&w=800&q=80', true, false, NULL),
  ('9', 'Combo Ejecutivo Completo', 'Entrada a elección + Segundo del día + Vaso de Chicha Morada + Postre.', 16.00, 'combos', 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&w=800&q=80', true, true, 'Ahorro Especial'),
  ('10', 'Combo Pareja Liz', '2 Segundos + 2 Entradas + 1L Chicha Morada + Tequeños.', 36.00, 'combos', 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=800&q=80', true, false, 'Ideal para 2'),
  ('11', 'Chicha Morada Artesanal (500ml)', 'Elaborada con maíz morado selecto, piña, manzana y canela.', 4.50, 'bebidas', 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?auto=format&fit=crop&w=800&q=80', true, true, '100% Natural'),
  ('12', 'Refresco de Maracuyá Frío (500ml)', 'Pulpa pura de maracuyá refrescante recién preparada.', 4.00, 'bebidas', 'https://images.unsplash.com/photo-1621263764928-df1444c5e859?auto=format&fit=crop&w=800&q=80', true, true, NULL),
  ('13', 'Inca Kola Personal (500ml)', 'Bien helada para acompañar tu menú.', 4.00, 'bebidas', 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?auto=format&fit=crop&w=800&q=80', true, false, NULL),
  ('14', 'Mazamorra & Arroz con Leche', 'Clásico combinado limeño con canela y frutas secas.', 5.50, 'postres', 'https://images.unsplash.com/photo-1563729784474-d77dbb933a9e?auto=format&fit=crop&w=800&q=80', true, true, 'Casero'),
  ('15', 'Crema Volteada Artesanal', 'Suave flan acaramelado con textura sedosa.', 6.00, 'postres', 'https://images.unsplash.com/photo-1528975604071-b4dc52a2d18c?auto=format&fit=crop&w=800&q=80', true, false, NULL)
ON CONFLICT (id) DO UPDATE 
SET 
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  price = EXCLUDED.price,
  category = EXCLUDED.category,
  image_url = EXCLUDED.image_url,
  is_available = EXCLUDED.is_available,
  is_daily_special = EXCLUDED.is_daily_special,
  badge = EXCLUDED.badge;
