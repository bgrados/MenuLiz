import { ImageResponse } from 'next/og';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const rawSize = Number(searchParams.get('size') || '192');
  const size = [192, 512].includes(rawSize) ? rawSize : 192;

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#f97316',
          color: 'white',
          fontSize: Math.round(size * 0.45),
          fontWeight: 900,
          borderRadius: Math.round(size * 0.18),
        }}
      >
        ML
      </div>
    ),
    {
      width: size,
      height: size,
    }
  );
}