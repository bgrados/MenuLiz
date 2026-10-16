import { ImageResponse } from 'next/og';

export const size = { width: 180, height: 180 };
export const contentType = 'image/png';

// Ícono para iPhone/iPad "Añadir a pantalla de inicio".
// Va a sangre (sin esquinas redondeadas): iOS aplica su propia máscara.
export default function AppleIcon() {
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
          fontSize: 78,
          fontWeight: 900,
          letterSpacing: '-2px',
        }}
      >
        SN
      </div>
    ),
    size
  );
}
