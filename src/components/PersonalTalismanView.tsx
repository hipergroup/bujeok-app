'use client';

// ============================================================
// 개인 부적 화면 렌더러
//
// 원형 부적(이미지 또는 코드 생성 SVG)을 그대로 그리고, 그 위에
// 이름 인장을 "별도 레이어"로 얹는다. 원본 파일은 손대지 않는다.
// 저장된 svg 를 쓰지 않고 매번 다시 합성하므로 저장 용량을 먹지 않는다.
// ============================================================

import { useMemo } from 'react';
import type { SavedTalisman } from '@/lib/types';
import { getOriginTalisman } from '@/data/talisman-origin';
import { seedVariation, stampSvgFragment } from '@/lib/personal-talisman';
import { generateTalismanSVG } from '@/lib/talisman-generator';

/** 이름 인장 — 붉은 낙관. 1자는 크게, 2~3자는 세로, 4자는 2×2 배치 */
export function NameStamp({
  text,
  side,
  rotation = 0,
  opacity = 0.94,
}: {
  text: string;
  /** 한 변 길이(px) */
  side: number;
  rotation?: number;
  opacity?: number;
}) {
  const chars = [...text].slice(0, 4);
  const n = chars.length;

  // 이름 길이에 따라 글자 크기 자동 조절
  const fontSize =
    n <= 1 ? side * 0.5 : n === 2 ? side * 0.34 : n === 3 ? side * 0.26 : side * 0.28;

  let inner: React.ReactNode;
  if (n <= 3) {
    inner = (
      <div
        className="flex flex-col items-center justify-center"
        style={{ height: '100%', gap: n === 2 ? side * 0.05 : side * 0.02 }}
      >
        {chars.map((c, i) => (
          <span key={i} style={{ fontSize, lineHeight: 1 }}>
            {c}
          </span>
        ))}
      </div>
    );
  } else {
    // 전통 인장의 순서 — 오른쪽 위 → 오른쪽 아래 → 왼쪽 위 → 왼쪽 아래
    const grid = [chars[2], chars[0], chars[3], chars[1]];
    inner = (
      <div
        className="grid h-full grid-cols-2 place-items-center"
        style={{ padding: side * 0.08 }}
      >
        {grid.map((c, i) => (
          <span key={i} style={{ fontSize, lineHeight: 1 }}>
            {c}
          </span>
        ))}
      </div>
    );
  }

  return (
    <div
      aria-hidden
      style={{
        width: side,
        height: side,
        transform: `rotate(${rotation}deg)`,
        opacity,
        background: '#A72B21',
        borderRadius: side * 0.1,
        boxShadow: `inset 0 0 0 ${Math.max(1, side * 0.028)}px rgba(246,237,217,0.9), inset 0 0 ${side * 0.18}px rgba(90,15,10,0.35)`,
        color: '#F6EDD9',
        fontFamily: "var(--font-serif-kr), 'AppleMyungjo', serif",
        fontWeight: 700,
        padding: side * 0.09,
        boxSizing: 'border-box',
      }}
    >
      {inner}
    </div>
  );
}

/**
 * 개인 부적 한 장 — width 만 주면 360:560 비율로 그린다.
 * personal 정보가 없으면 원형만 그린다.
 */
export default function PersonalTalismanView({
  talisman,
  width,
  className = '',
}: {
  talisman: SavedTalisman;
  width: number | string;
  className?: string;
}) {
  const sourceId = talisman.sourceId ?? talisman.id;
  const origin = getOriginTalisman(sourceId);
  const p = talisman.personal;
  const hasPersonal = !!p;

  // 원형 이미지가 없는 부적은 기존 코드 생성 SVG 가 원형이다
  const baseSvg = useMemo(() => {
    if (origin?.imagePath) return null;
    const t = origin?.talisman ?? talisman;
    return generateTalismanSVG({
      type: t.id,
      style: 'traditional',
      background: 'hwangji',
      title: t.name,
      hanja: t.hanja,
      message: '',
      mantra: t.mantra ?? '',
      symbols: [...(t.design?.patterns ?? []), ...(t.design?.symbols ?? [])],
      noSeal: hasPersonal,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sourceId, hasPersonal]);

  const v = p ? seedVariation(p.visualSeed) : null;

  return (
    <div
      className={`relative overflow-hidden ${className}`}
      style={{ width, aspectRatio: '360 / 560' }}
    >
      {/* 원형 부적 — 그대로 */}
      {origin?.imagePath ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={origin.imagePath}
          alt={talisman.name}
          className="absolute inset-0 h-full w-full object-contain"
          style={{ background: '#F2E7CE' }}
          draggable={false}
        />
      ) : baseSvg ? (
        <div
          className="absolute inset-0"
          dangerouslySetInnerHTML={{ __html: baseSvg }}
        />
      ) : null}

      {/* 사용자별 미세한 종이 결 (원본을 가리지 않는 아주 옅은 층) */}
      {p && v && (
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0"
          style={{
            background: `radial-gradient(85% 85% at ${(v.grainX * 100).toFixed(1)}% ${(v.grainY * 100).toFixed(1)}%, rgba(122,74,52,${(0.015 + v.inkShift * 0.5).toFixed(3)}), transparent 100%)`,
          }}
        />
      )}

      {/* 이름 인장은 얹지 않는다 — 그림과 어긋나 보여 뺐다 (2026-08-21) */}
    </div>
  );
}

