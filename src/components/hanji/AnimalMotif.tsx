'use client';

import Image from 'next/image';
import { ANIMAL_PATHS } from '@/lib/talisman-generator';
import { SealLogo } from './motifs';

// 12지신 전통 문양 — 타원 테두리와 지지(地支) 한자가 함께 그려진 그림.
// next/image 가 경로를 basePath 와 함께 처리하도록 정적 import 로 묶는다.
import 쥐 from '../../../public/zodiac/쥐.png';
import 소 from '../../../public/zodiac/소.png';
import 호랑이 from '../../../public/zodiac/호랑이.png';
import 토끼 from '../../../public/zodiac/토끼.png';
import 용 from '../../../public/zodiac/용.png';
import 뱀 from '../../../public/zodiac/뱀.png';
import 말 from '../../../public/zodiac/말.png';
import 양 from '../../../public/zodiac/양.png';
import 원숭이 from '../../../public/zodiac/원숭이.png';
import 닭 from '../../../public/zodiac/닭.png';
import 개 from '../../../public/zodiac/개.png';
import 돼지 from '../../../public/zodiac/돼지.png';

const ZODIAC_ART = {
  쥐, 소, 호랑이, 토끼, 용, 뱀, 말, 양, 원숭이, 닭, 개, 돼지,
} as const;

/**
 * 띠 동물 그림.
 * 12지신 전통 문양이 있으면 그 그림을, 없으면 선화(부적 생성기와 같은 그림)를,
 * 그마저 없으면 낙관을 보여준다.
 *
 * `line` 을 주면 그림 대신 선화를 강제한다 — 색을 부모의 currentColor 로
 * 물들여야 하는 자리(작은 아이콘 등)에서 쓴다.
 */
export default function AnimalMotif({
  animal,
  size = 32,
  className = '',
  line = false,
}: {
  animal?: string;
  size?: number;
  className?: string;
  line?: boolean;
}) {
  const art = animal ? ZODIAC_ART[animal as keyof typeof ZODIAC_ART] : undefined;

  if (art && !line) {
    return (
      <Image
        src={art}
        alt={`${animal}띠`}
        width={size}
        height={size}
        className={className}
        style={{ width: size, height: size, objectFit: 'contain' }}
      />
    );
  }

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
