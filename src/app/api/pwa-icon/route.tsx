/**
 * Compatibilidad: algunos clientes ya instalados tienen guardado el ícono
 * dinámico `/api/pwa-icon?size=...`. Ahora los íconos son estáticos, así que
 * redirigimos a la versión nueva (con los cubiertos negros).
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const rawSize = Number(searchParams.get('size') || '512');
  const maskable = searchParams.get('maskable') === '1';

  let file = '/icons/icon-512.png';
  if (maskable) file = '/icons/maskable-512.png';
  else if (rawSize <= 192) file = '/icons/icon-192.png';

  return Response.redirect(new URL(file, request.url), 307);
}
