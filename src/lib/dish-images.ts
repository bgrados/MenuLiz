/**
 * Mapeo central de platos → fotos locales (public/images).
 *
 * Se resuelve por palabras clave sobre el nombre del plato (sin acentos ni mayúsculas),
 * así funciona tanto para los platos de la base de datos como para los seeds/fallbacks,
 * sin depender de coincidencias exactas.
 */

export const DEFAULT_DISH_IMAGE = '/images/placeholder-dish.svg';

interface DishImageRule {
  keywords: string[];
  image: string;
}

/**
 * El orden importa: gana la primera regla que coincida.
 * Las reglas más específicas van primero (p. ej. "aji de gallina" antes que "gallina").
 */
const DISH_IMAGE_RULES: DishImageRule[] = [
  // --- Platos actuales del menú ---
  { keywords: ['aji de gallina'], image: '/images/aji-de-gallina.webp' },
  { keywords: ['seco de'], image: '/images/seco-de-carne-con-frejoles.webp' },
  { keywords: ['lomo saltado'], image: '/images/Lomo-Saltado.webp' },
  { keywords: ['arroz con pollo'], image: '/images/arrozconpollo.webp' },
  { keywords: ['milanesa'], image: '/images/milanesa-de-pollo.webp' },
  { keywords: ['causa rellena'], image: '/images/causa-rellena.webp' },
  { keywords: ['sopa criolla'], image: '/images/sopa-criolla.webp' },
  { keywords: ['teque'], image: '/images/tequenos-palta.jpg' },
  { keywords: ['bistec', 'bisteck', 'a lo pobre'], image: '/images/bisteckpobre.webp' },
  { keywords: ['tallarines rojos', 'tallarin rojo'], image: '/images/tallarines_rojos_con_pollo_77014_600.webp' },
  { keywords: ['tallarines verdes', 'tallarin verde'], image: '/images/tallarinverdebisteck.webp' },
  { keywords: ['chicha morada'], image: '/images/chichamorada.webp' },
  { keywords: ['maracuya'], image: '/images/maracuya.webp' },

  // --- Platos que ya tienen foto lista para agregar al menú ---
  { keywords: ['aguadito'], image: '/images/Aguadito_de_Pollo-Peruano.webp' },
  { keywords: ['caldo de gallina'], image: '/images/Caldo-de-Gallina-Tradicional.webp' },
  { keywords: ['carapulcra'], image: '/images/Carapulcra-de-Pollo-Receta.webp' },
  { keywords: ['cau cau'], image: '/images/cau-cau-de-mondongo.webp' },
  { keywords: ['escabeche'], image: '/images/escabeche-de-pescado.webp' },
  { keywords: ['estofado'], image: '/images/estofado-de-pollo.webp' },
  { keywords: ['menestron'], image: '/images/menestron-de-carne.webp' },
  { keywords: ['pallares'], image: '/images/Pallares-pescado.webp' },
  { keywords: ['palta rellena'], image: '/images/paltarellena.webp' },
  { keywords: ['cebada'], image: '/images/refresco-de-cebada.webp' },
  { keywords: ['hierba luisa'], image: '/images/agua-de-hierba-luisa.webp' },
  { keywords: ['sancochado'], image: '/images/sancochado.webp' },
  { keywords: ['solterito'], image: '/images/solterito-arequipeno.webp' },
  { keywords: ['sopa a la minuta', 'sopa minuta', 'sopa la minuta'], image: '/images/sopalaminuta.webp' },
  { keywords: ['sudado'], image: '/images/sudado-de-pescado_web.jpg.webp' },
  { keywords: ['asado'], image: '/images/asadopure.jpg' },

  // --- Platos del menú actual con foto local propia ---
  { keywords: ['sopa de casa'], image: '/images/sopa-de-casa.webp' },
  { keywords: ['gelatina'], image: '/images/gelatina.webp' },
  { keywords: ['carambola'], image: '/images/refresco-de-carambola-peruano.webp' },
  { keywords: ['olluco', 'olluquito'], image: '/images/olluquito-con-charqui.webp' },
];

/** Quita acentos y mayúsculas para comparar de forma robusta. */
export function normalizeDishName(name: string): string {
  return (name || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();
}

/** Devuelve la foto local que corresponde al nombre del plato, o null si no hay coincidencia. */
export function getLocalDishImage(name: string): string | null {
  const normalized = normalizeDishName(name);
  for (const rule of DISH_IMAGE_RULES) {
    if (rule.keywords.some((keyword) => normalized.includes(keyword))) {
      return rule.image;
    }
  }
  return null;
}

/**
 * Resuelve la imagen a mostrar para un plato:
 *  1. Si el plato ya tiene una imagen propia (subida a Storage o URL externa que no sea
 *     el placeholder de Unsplash), se respeta.
 *  2. Si no, se busca una foto local por nombre.
 *  3. Si nada coincide, se usa la imagen recibida o el placeholder.
 */
export function getDishImage(name: string, imageUrl?: string | null): string {
  const trimmed = (imageUrl || '').trim();
  if (trimmed && !trimmed.includes('unsplash.com')) {
    return trimmed;
  }
  return getLocalDishImage(name) || trimmed || DEFAULT_DISH_IMAGE;
}
