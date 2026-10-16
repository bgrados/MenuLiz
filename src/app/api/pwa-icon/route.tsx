import { ImageResponse } from 'next/og';

const ALLOWED_SIZES = [180, 192, 512, 1024];

/**
 * Genera el ícono de la PWA en los tamaños que piden los dispositivos.
 * - `?size=192|512` → ícono normal (esquinas redondeadas).
 * - `?maskable=1`    → ícono adaptativo de Android: a sangre y con el
 *   contenido dentro de la "zona segura" para que ningún launcher lo recorte.
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const rawSize = Number(searchParams.get('size') || '512');
  const size = ALLOWED_SIZES.includes(rawSize) ? rawSize : 512;
  const maskable = searchParams.get('maskable') === '1';

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundImage: 'linear-gradient(135deg, #fb923c 0%, #f97316 52%, #ea580c 100%)',
          color: '#ffffff',
          fontSize: Math.round(size * (maskable ? 0.28 : 0.4)),
          fontWeight: 900,
          letterSpacing: '-0.03em',
        }}
      >
        SN
      </div>
    ),
    {
      width: size,
      height: size,
    }
  );
}
