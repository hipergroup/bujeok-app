'use client';

import { ANIMAL_PATHS } from '@/lib/talisman-generator';
import { SealLogo } from './motifs';

/**
 * 12지 동물 선화(線畵) — 부적 생성기와 같은 그림을 UI에서 재사용.
 * 색은 부모의 color(currentColor)를 따른다. 동물을 모르면 낙관으로 대체.
 */
export default function AnimalMotif({
  animal,
  size = 32,
  className = '',
}: {
  animal?: string;
  size?: number;
  className?: string;
}) {
  const path = animal ? ANIMAL_PATHS[animal] : undefined;
  if (!path) return <SealLogo size={size} className={className} />;
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 48 52"><g transform="translate(24,27)">${path}</g></svg>`;
  return (
    <span
      className={className}
      style={{ display: 'inline-flex', lineHeight: 0 }}
      dangerouslySetInnerHTML={{ __html: svg }}
      aria-hidden
    />
  );
}
