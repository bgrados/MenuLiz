import { MenuItem } from '@/types/menu';

export const INITIAL_MENU_ITEMS: MenuItem[] = [
  // Menú del Día / Segundos
  {
    id: '1',
    name: 'Lomo Saltado Criollo',
    description: 'Jugosos trozos de lomo fino salteados al wok con cebolla, tomate, ají amarillo y culantro, acompañados de papas fritas crocantes y arroz blanco.',
    price: 18.00,
    category: 'segundos',
    image_url: 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=800&q=80',
    is_available: true,
    is_daily_special: true,
    badge: 'Plato Estrella'
  },
  {
    id: '2',
    name: 'Ají de Gallina Tradicional',
    description: 'Pechuga de pollo deshilachada en crema suave de ají amarillo, queso paria y pecanas, servido con papas nativas, huevo duro y aceituna botija.',
    price: 15.00,
    category: 'segundos',
    image_url: 'https://images.unsplash.com/photo-1565299585323-38d6b0865b47?auto=format&fit=crop&w=800&q=80',
    is_available: true,
    is_daily_special: true,
    badge: 'Menú del Día'
  },
  {
    id: '3',
    name: 'Arroz con Pollo & Papa a la Huancaína',
    description: 'Clásico arroz graneado al culantro y chicha de jora con presa dorada, acompañado de suave papa con crema huancaína artesanal.',
    price: 16.00,
    category: 'segundos',
    image_url: 'https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?auto=format&fit=crop&w=800&q=80',
    is_available: true,
    is_daily_special: true,
    badge: 'Menú del Día'
  },
  {
    id: '4',
    name: 'Seco de Res con Frejoles',
    description: 'Tierno asado de tira macerado en chicha de jora y culantro, servido sobre una cama de frejoles canario cremosos y arroz con sarsa criolla.',
    price: 17.50,
    category: 'segundos',
    image_url: 'https://images.unsplash.com/photo-1547496502-affa22d38842?auto=format&fit=crop&w=800&q=80',
    is_available: true,
    is_daily_special: false,
    badge: 'Recomendado'
  },
  {
    id: '5',
    name: 'Milanesa de Pollo Especial',
    description: 'Crujiente pechuga apanada dorada a la perfección, servida con ensalada fresca, papas fritas caseras y arroz.',
    price: 14.50,
    category: 'segundos',
    image_url: 'https://images.unsplash.com/photo-1598515214211-89d3c73ae83b?auto=format&fit=crop&w=800&q=80',
    is_available: true,
    is_daily_special: true,
  },

  // Entradas
  {
    id: '6',
    name: 'Causa Rellena de Pollo',
    description: 'Masa suave de papa amarilla aromatizada con ají amarillo y limón sutil, rellena de pechuga de pollo y palta fresca.',
    price: 7.00,
    category: 'entradas',
    image_url: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=800&q=80',
    is_available: true,
    is_daily_special: true,
    badge: 'Entrada del Día'
  },
  {
    id: '7',
    name: 'Sopa Criolla Calientita',
    description: 'Sustanciosa sopa casera a base de carne picada, fideo cabello de ángel, ají panca, leche evaporada y huevo pochado.',
    price: 8.00,
    category: 'entradas',
    image_url: 'https://images.unsplash.com/photo-1547592166-23ac45744acd?auto=format&fit=crop&w=800&q=80',
    is_available: true,
    is_daily_special: true,
    badge: 'Entrada del Día'
  },
  {
    id: '8',
    name: 'Tequeños de Queso con Guacamole (6 und)',
    description: 'Masa wantán crocante rellena de queso fresco andino derretido, acompañados de guacamole criollo casero.',
    price: 10.00,
    category: 'entradas',
    image_url: 'https://images.unsplash.com/photo-1582169505937-b9992bd01ed9?auto=format&fit=crop&w=800&q=80',
    is_available: true,
    is_daily_special: false,
  },

  // Combos
  {
    id: '9',
    name: 'Combo Ejecutivo Completo',
    description: 'Entrada a elección + Segundo del día + Vaso de Chicha Morada artesanal + Postre del día.',
    price: 16.00,
    category: 'combos',
    image_url: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&w=800&q=80',
    is_available: true,
    is_daily_special: true,
    badge: 'Ahorro Especial'
  },
  {
    id: '10',
    name: 'Combo Pareja Liz',
    description: '2 Segundos a elección + 2 Entradas del día + 1 Jarra de Chicha Morada (1L) + Porción de Tequeños.',
    price: 36.00,
    category: 'combos',
    image_url: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=800&q=80',
    is_available: true,
    is_daily_special: false,
    badge: 'Ideal para 2'
  },

  // Bebidas
  {
    id: '11',
    name: 'Chicha Morada Artesanal (500ml)',
    description: 'Preparada diariamente con maíz morado selecto, manzana, piña, canela y gotas de limón fresco.',
    price: 4.50,
    category: 'bebidas',
    image_url: 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?auto=format&fit=crop&w=800&q=80',
    is_available: true,
    is_daily_special: true,
    badge: '100% Natural'
  },
  {
    id: '12',
    name: 'Refresco de Maracuyá Frío (500ml)',
    description: 'Pura pulpa de maracuyá refrescante, endulzada al punto justo.',
    price: 4.00,
    category: 'bebidas',
    image_url: 'https://images.unsplash.com/photo-1621263764928-df1444c5e859?auto=format&fit=crop&w=800&q=80',
    is_available: true,
    is_daily_special: true,
  },
  {
    id: '13',
    name: 'Inca Kola / Coca Cola Personal (500ml)',
    description: 'Bien helada en botella personal para acompañar tus comidas.',
    price: 4.00,
    category: 'bebidas',
    image_url: 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?auto=format&fit=crop&w=800&q=80',
    is_available: true,
    is_daily_special: false,
  },

  // Postres
  {
    id: '14',
    name: 'Mazamorra Morada & Arroz con Leche (Clásico)',
    description: 'El tradicional combinado limeño con canela en polvo y frutas secas maceradas.',
    price: 5.50,
    category: 'postres',
    image_url: 'https://images.unsplash.com/photo-1563729784474-d77dbb933a9e?auto=format&fit=crop&w=800&q=80',
    is_available: true,
    is_daily_special: true,
    badge: 'Casero'
  },
  {
    id: '15',
    name: 'Crema Volteada Artesanal',
    description: 'Suave flan acaramelado con textura sedosa y receta secreta de la casa.',
    price: 6.00,
    category: 'postres',
    image_url: 'https://images.unsplash.com/photo-1528975604071-b4dc52a2d18c?auto=format&fit=crop&w=800&q=80',
    is_available: true,
    is_daily_special: false,
  }
];
