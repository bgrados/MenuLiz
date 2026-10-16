'use client';

import React, { useId } from 'react';

/**
 * Logo de "Sabor Norteño": monograma "SN" sobre un badge con degradado naranja.
 * Se dibuja como SVG para verse nítido en cualquier tamaño (header, splash,
 * pantalla de instalación, etc.) sin depender de imágenes externas.
 */
export function BrandMark({
  size = 44,
  className = '',
  title = 'Sabor Norteño',
}: {
  size?: number;
  className?: string;
  title?: string;
}) {
  const gid = useId().replace(/[:]/g, '');
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      className={className}
      role="img"
      aria-label={title}
    >
      <defs>
        <linearGradient id={`sn-grad-${gid}`} x1="6" y1="2" x2="58" y2="62" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#fb923c" />
          <stop offset="0.5" stopColor="#f97316" />
          <stop offset="1" stopColor="#ea580c" />
        </linearGradient>
      </defs>
      <rect x="0" y="0" width="64" height="64" rx="16" fill={`url(#sn-grad-${gid})`} />
      <rect
        x="3.25"
        y="3.25"
        width="57.5"
        height="57.5"
        rx="13"
        fill="none"
        stroke="#ffffff"
        strokeOpacity="0.3"
        strokeWidth="1.5"
      />
      <text
        x="32"
        y="33"
        textAnchor="middle"
        dominantBaseline="central"
        fontFamily="'Segoe UI', system-ui, -apple-system, 'Helvetica Neue', Arial, sans-serif"
        fontSize="27"
        fontWeight="900"
        letterSpacing="-1"
        fill="#ffffff"
      >
        SN
      </text>
    </svg>
  );
}

export default BrandMark;
