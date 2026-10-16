import { ImageResponse } from 'next/og';

export const size = { width: 48, height: 48 };
export const contentType = 'image/png';

// Favicon de "Sabor Norteño" (monograma SN sobre degradado naranja).
export default function Icon() {
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
          fontSize: 21,
          fontWeight: 900,
          letterSpacing: '-0.5px',
        }}
      >
        SN
      </div>
    ),
    size
  );
}
