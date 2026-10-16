'use client';

import React, { useId } from 'react';

/**
 * Logo de "Sabor Norteño": badge con degradado naranja, cubiertos cruzados en
 * negro (bien visibles) y las iniciales "SN" en blanco.
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
      {/* Cubiertos cruzados (tenedor y cuchillo) en negro */}
      <g
        transform="translate(18.2 7.5) scale(1.15)"
        fill="none"
        stroke="#1c1917"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="m16 2-2.3 2.3a3 3 0 0 0 0 4.2l1.8 1.8a3 3 0 0 0 4.2 0L22 8" />
        <path d="M15 15 3.3 3.3a4.2 4.2 0 0 0 0 6l7.3 7.3c.7.7 2 .7 2.8 0L15 15Zm0 0 7 7" />
        <path d="m2.1 21.8 6.4-6.3" />
        <path d="m19 5-7 7" />
      </g>
      <text
        x="32"
        y="49"
        textAnchor="middle"
        fontFamily="'Segoe UI', system-ui, -apple-system, 'Helvetica Neue', Arial, sans-serif"
        fontSize="15"
        fontWeight="900"
        letterSpacing="0.5"
        fill="#ffffff"
      >
        SN
      </text>
    </svg>
  );
}

export default BrandMark;
