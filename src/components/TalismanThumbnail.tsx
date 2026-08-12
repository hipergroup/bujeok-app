'use client';

import { TalismanCategory, CATEGORY_COLORS } from '@/lib/types';
import { getTalismanById } from '@/data/talismans';
import { getTalismanAsset } from '@/data/talisman-assets';

/**
 * Generates a compact talisman-style thumbnail SVG based on the talisman's id.
 * Used in collection grid, encyclopedia list, and modals.
 * 전통 부적 그림(public/talismans)이 있는 부적은 그림을 우선 보여준다.
 */
export default function TalismanThumbnail({
  id,
  category,
  size = 120,
  className = '',
  grayed = false,
}: {
  id: string;
  category: TalismanCategory;
  size?: number;
  className?: string;
  grayed?: boolean;
}) {
  const art = getTalismanAsset(getTalismanById(id)?.name, 'traditional');
  if (art) {
    return (
      <div
        className={className}
        style={{ width: size, height: size * 1.4 }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element -- 정적 export, 크기 고정 썸네일 */}
        <img
          src={art}
          alt=""
          className="h-full w-full object-cover"
          style={{
            borderRadius: 6,
            border: '1px solid rgba(122, 74, 52, 0.35)',
            ...(grayed ? { filter: 'grayscale(1)', opacity: 0.55 } : null),
          }}
        />
      </div>
    );
  }
  // simple hash for deterministic variation
  const hash = id.split('').reduce((a, c) => a + c.charCodeAt(0), 0);
  const accent = grayed ? '#555' : CATEGORY_COLORS[category];
  const bg = grayed ? '#222' : '#1a1008';
  const stroke = grayed ? '#444' : '#c5973a';
  const textColor = grayed ? '#666' : '#e8c36a';

  // pick pattern variant (0-4)
  const variant = hash % 5;
  // rotation seed
  const rot = (hash * 7) % 360;
  // inner shapes count
  const shapes = 3 + (hash % 4);

  const innerPatterns = Array.from({ length: shapes }, (_, i) => {
    const angle = (360 / shapes) * i + rot;
    const r = size * 0.18;
    const cx = size / 2 + r * Math.cos((angle * Math.PI) / 180);
    const cy = size / 2 + r * Math.sin((angle * Math.PI) / 180);
    const symSize = size * 0.06;

    if (variant === 0) {
      return `<circle cx="${cx}" cy="${cy}" r="${symSize}" fill="none" stroke="${textColor}" stroke-width="1" opacity="0.7"/>`;
    } else if (variant === 1) {
      return `<rect x="${cx - symSize}" y="${cy - symSize}" width="${symSize * 2}" height="${symSize * 2}" fill="none" stroke="${textColor}" stroke-width="1" transform="rotate(${angle} ${cx} ${cy})" opacity="0.7"/>`;
    } else if (variant === 2) {
      return `<polygon points="${cx},${cy - symSize} ${cx + symSize},${cy + symSize} ${cx - symSize},${cy + symSize}" fill="none" stroke="${textColor}" stroke-width="1" opacity="0.7"/>`;
    } else if (variant === 3) {
      return `<line x1="${cx - symSize}" y1="${cy}" x2="${cx + symSize}" y2="${cy}" stroke="${textColor}" stroke-width="1.5" opacity="0.6"/><line x1="${cx}" y1="${cy - symSize}" x2="${cx}" y2="${cy + symSize}" stroke="${textColor}" stroke-width="1.5" opacity="0.6"/>`;
    } else {
      return `<circle cx="${cx}" cy="${cy}" r="${symSize * 0.5}" fill="${textColor}" opacity="0.5"/>`;
    }
  });

  // unique ids for this instance
  const uid = `thumb-${id}`;

  const svgContent = `
    <svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size * 1.4}" viewBox="0 0 ${size} ${size * 1.4}">
      <defs>
        <linearGradient id="bg-${uid}" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="${bg}"/>
          <stop offset="100%" stop-color="${grayed ? '#1a1a1a' : '#2a1a0a'}"/>
        </linearGradient>
        <filter id="glow-${uid}">
          <feGaussianBlur stdDeviation="2" result="blur"/>
          <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
        </filter>
      </defs>
      <!-- Paper background -->
      <rect x="2" y="2" width="${size - 4}" height="${size * 1.4 - 4}" rx="4" fill="url(#bg-${uid})" stroke="${stroke}" stroke-width="2"/>
      <!-- Border ornament -->
      <rect x="8" y="8" width="${size - 16}" height="${size * 1.4 - 16}" rx="2" fill="none" stroke="${stroke}" stroke-width="0.8" opacity="0.5"/>
      <!-- Top accent bar -->
      <rect x="${size * 0.25}" y="14" width="${size * 0.5}" height="3" rx="1.5" fill="${accent}" opacity="0.8"/>
      <!-- Central symbol circle -->
      <circle cx="${size / 2}" cy="${size * 0.55}" r="${size * 0.25}" fill="none" stroke="${stroke}" stroke-width="1.5" filter="url(#glow-${uid})" opacity="0.8"/>
      <circle cx="${size / 2}" cy="${size * 0.55}" r="${size * 0.15}" fill="none" stroke="${accent}" stroke-width="1" opacity="0.6"/>
      <!-- Inner patterns -->
      <g transform="translate(0, ${size * 0.55 - size / 2})">${innerPatterns.join('')}</g>
      <!-- Category dot -->
      <circle cx="${size / 2}" cy="${size * 0.55}" r="${size * 0.04}" fill="${accent}"/>
      <!-- Bottom lines (text placeholder) -->
      <line x1="${size * 0.2}" y1="${size * 1.05}" x2="${size * 0.8}" y2="${size * 1.05}" stroke="${textColor}" stroke-width="1" opacity="0.4"/>
      <line x1="${size * 0.3}" y1="${size * 1.12}" x2="${size * 0.7}" y2="${size * 1.12}" stroke="${textColor}" stroke-width="0.8" opacity="0.3"/>
      <line x1="${size * 0.35}" y1="${size * 1.19}" x2="${size * 0.65}" y2="${size * 1.19}" stroke="${textColor}" stroke-width="0.6" opacity="0.2"/>
    </svg>
  `;

  return (
    <div
      className={className}
      dangerouslySetInnerHTML={{ __html: svgContent }}
    />
  );
}
