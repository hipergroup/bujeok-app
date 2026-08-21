// ============================================================
// 개인 부적 — 원형 부적 위에 한 사람의 기록을 얹는다
//
//  · 원형 부적 이미지는 절대 편집하지 않는다. 별도 레이어(이름 인장,
//    미세한 먹 농도)만 얹고, 저장할 때도 이미지가 아니라 기록만 남긴다.
//  · visualSeed 가 같으면 언제 다시 열어도 같은 모습이다.
// ============================================================

import type { SavedTalisman, PersonalMeta } from './types';
import type { TalismanType } from '@/data/talismans';
import { getOriginTalisman, SERIAL_CODE, type StampAnchor } from '@/data/talisman-origin';
import { generateTalismanSVG } from './talisman-generator';

const COLLECTION_KEY = 'bujeok-collection';
const SERIAL_SEQ_KEY = 'bujeok-serial-seq';

// ─── 결정적 난수 — visualSeed 하나로 모든 미세 개인화를 정한다 ───

function hashString(str: string): number {
  let h = 0;
  for (let i = 0; i < str.length; i++) {
    h = ((h << 5) - h + str.charCodeAt(i)) | 0;
  }
  return Math.abs(h) || 1;
}

/** mulberry32 — 같은 씨앗이면 항상 같은 수열 */
function seededRng(seed: number): () => number {
  let s = seed >>> 0;
  return () => {
    s = (s + 0x6d2b79f5) >>> 0;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** 씨앗에서 나오는 미세 개인화 값들 — 렌더러와 SVG 합성이 함께 쓴다 */
export interface SeedVariation {
  rotation: number;      // 인장 회전 (-2 ~ 2도)
  opacity: number;       // 인장 먹 농도 (0.88 ~ 0.98)
  anchorDx: number;      // 인장 자리 미세 이동 (이미지 너비 비율, ±0.008)
  anchorDy: number;
  inkShift: number;      // 붉은 먹의 미세한 투명도 차 (0 ~ 0.04)
  grainX: number;        // 종이 결 오버레이 위치 (0 ~ 1)
  grainY: number;
}

export function seedVariation(visualSeed: number): SeedVariation {
  const rng = seededRng(visualSeed);
  return {
    rotation: (rng() * 4 - 2),
    opacity: 0.88 + rng() * 0.1,
    anchorDx: (rng() * 2 - 1) * 0.008,
    anchorDy: (rng() * 2 - 1) * 0.008,
    inkShift: rng() * 0.04,
    grainX: rng(),
    grainY: rng(),
  };
}

// ─── 부적 번호 ───

/** 같은 기기·같은 보관함 안에서 겹치지 않는 순번 (전 세계 유일을 주장하지 않는다) */
function nextSerialSeq(): number {
  try {
    const n = parseInt(localStorage.getItem(SERIAL_SEQ_KEY) || '0', 10) + 1;
    localStorage.setItem(SERIAL_SEQ_KEY, String(n));
    return n;
  } catch {
    return Math.floor(Math.random() * 900) + 100;
  }
}

function serialNumberOf(serialCode: string, date: Date): string {
  const ymd = `${date.getFullYear()}${String(date.getMonth() + 1).padStart(2, '0')}${String(
    date.getDate()
  ).padStart(2, '0')}`;
  return `${serialCode}-${ymd}-${String(nextSerialSeq()).padStart(3, '0')}`;
}

// ─── 인장 글자 ───

/** 인장에 새길 이름 — 1~4자로 다듬고, 없으면 '수호부' */
export function stampTextOf(ownerName: string): string {
  const t = ownerName.trim().replace(/\s+/g, '');
  if (!t) return '수호부';
  return [...t].slice(0, 4).join('');
}

// ─── 개인 부적 만들기 ───

export interface CreatePersonalInput {
  talisman: TalismanType;
  ownerName: string;
  wishText: string;
  recommendationReason: string;
}

/**
 * 개인 부적 기록을 만든다. 아직 저장하지는 않는다 —
 * 완성 화면에서 보여주고, '간직하기'를 눌렀을 때 saveToCollection 으로 담는다.
 */
export function createPersonalTalisman(input: CreatePersonalInput): SavedTalisman {
  const now = new Date();
  const internalId =
    typeof crypto !== 'undefined' && 'randomUUID' in crypto
      ? `personal-${crypto.randomUUID()}`
      : `personal-${Date.now()}-${Math.floor(Math.random() * 1e6)}`;

  const origin = getOriginTalisman(input.talisman.id);
  const visualSeed = hashString(internalId);
  const v = seedVariation(visualSeed);

  const personal: PersonalMeta = {
    ownerName: input.ownerName.trim(),
    wishText: input.wishText.trim().slice(0, 50),
    recommendationReason: input.recommendationReason,
    serialNumber: serialNumberOf(
      origin?.serialCode ?? SERIAL_CODE[input.talisman.category] ?? '願',
      now
    ),
    stampText: stampTextOf(input.ownerName),
    stampRotation: Math.round(v.rotation * 100) / 100,
    stampOpacity: Math.round(v.opacity * 1000) / 1000,
    visualSeed,
  };

  return {
    ...input.talisman,
    id: internalId,
    sourceId: input.talisman.id,
    savedAt: now.toISOString(),
    note: personal.wishText || undefined,
    // svg 는 저장하지 않는다 — 원형 이미지 경로 + personal 로 매번 다시 합성
    personal,
  };
}

// ─── 보관함 저장 ───

export function saveToCollection(talisman: SavedTalisman): boolean {
  try {
    const existing: SavedTalisman[] = JSON.parse(
      localStorage.getItem(COLLECTION_KEY) || '[]'
    );
    if (existing.some((t) => t.id === talisman.id)) return true; // 이미 담김
    existing.unshift(talisman);
    localStorage.setItem(COLLECTION_KEY, JSON.stringify(existing));
    return true;
  } catch {
    return false; // storage full 등
  }
}

/** 이 부적을 홈 화면의 대표 부적으로 — 다른 부적의 표식은 내린다 */
export function markPlacedOnHome(talismanId: string): void {
  try {
    const existing: SavedTalisman[] = JSON.parse(
      localStorage.getItem(COLLECTION_KEY) || '[]'
    );
    for (const t of existing) {
      if (!t.personal) continue;
      t.personal.isPlacedOnHome = t.id === talismanId;
    }
    localStorage.setItem(COLLECTION_KEY, JSON.stringify(existing));
  } catch {
    // ignore
  }
}

/** 홈 화면에 모신 대표 부적 (없으면 null) */
export function getPlacedTalisman(): SavedTalisman | null {
  try {
    const existing: SavedTalisman[] = JSON.parse(
      localStorage.getItem(COLLECTION_KEY) || '[]'
    );
    return existing.find((t) => t.personal?.isPlacedOnHome) ?? null;
  } catch {
    return null;
  }
}

// ─── SVG 합성 (공유·위젯 전용) ───
// 화면에서는 PersonalTalismanView 가 이미지 + 인장 레이어로 그리고,
// 이미지 파일이 필요할 때만 여기서 SVG 한 장으로 합쳐 기존 파이프라인
// (composeShareImage / pushTalismanToWidget)에 태운다.

const STAMP_RED = '#A72B21';
const STAMP_PAPER = '#F6EDD9';

/** 이름 인장 SVG 조각 — 중심 (0,0) 기준, side = 한 변 px */
export function stampSvgFragment(
  stampText: string,
  side: number,
  rotation: number,
  opacity: number
): string {
  const chars = [...stampText];
  const n = chars.length;
  const esc = (c: string) =>
    c.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  const font = `font-family="'Gowun Batang', 'AppleMyungjo', serif" font-weight="bold" fill="${STAMP_PAPER}"`;

  let glyphs = '';
  if (n <= 1) {
    const fs = side * 0.52;
    glyphs = `<text x="0" y="${fs * 0.36}" text-anchor="middle" font-size="${fs}" ${font}>${esc(chars[0] ?? '福')}</text>`;
  } else if (n <= 3) {
    // 세로 한 줄
    const fs = n === 2 ? side * 0.36 : side * 0.27;
    const gap = n === 2 ? side * 0.4 : side * 0.29;
    const startY = -((n - 1) / 2) * gap;
    glyphs = chars
      .map(
        (c, i) =>
          `<text x="0" y="${startY + i * gap + fs * 0.36}" text-anchor="middle" font-size="${fs}" ${font}>${esc(c)}</text>`
      )
      .join('');
  } else {
    // 4자 — 전통 인장처럼 2×2 (오른쪽 위부터 세로로 읽는다)
    const fs = side * 0.3;
    const off = side * 0.21;
    const pos = [
      { x: off, y: -off },  // 1번째: 오른쪽 위
      { x: off, y: off },   // 2번째: 오른쪽 아래
      { x: -off, y: -off }, // 3번째: 왼쪽 위
      { x: -off, y: off },  // 4번째: 왼쪽 아래
    ];
    glyphs = chars
      .slice(0, 4)
      .map(
        (c, i) =>
          `<text x="${pos[i].x}" y="${pos[i].y + fs * 0.36}" text-anchor="middle" font-size="${fs}" ${font}>${esc(c)}</text>`
      )
      .join('');
  }

  const half = side / 2;
  const inner = half - side * 0.09;
  return `<g transform="rotate(${rotation})" opacity="${opacity}">
    <rect x="${-half}" y="${-half}" width="${side}" height="${side}" rx="${side * 0.1}" fill="${STAMP_RED}"/>
    <rect x="${-inner}" y="${-inner}" width="${inner * 2}" height="${inner * 2}" rx="${side * 0.07}" fill="none" stroke="${STAMP_PAPER}" stroke-width="${Math.max(1, side * 0.03)}" opacity="0.9"/>
    ${glyphs}
  </g>`;
}

/**
 * 개인 부적 한 장을 SVG 문자열로 — 원형(이미지 또는 코드 생성) 위에
 * 종이 결·이름 인장을 얹는다. 원본 문양은 건드리지 않는다.
 */
export function buildPersonalSVG(saved: SavedTalisman): string {
  const p = saved.personal;
  const sourceId = saved.sourceId ?? saved.id;
  const origin = getOriginTalisman(sourceId);
  const talisman = origin?.talisman ?? saved;

  // 원형 — 이미지가 있으면 이미지 그대로, 없으면 기존 코드 생성 부적
  const base = generateTalismanSVG({
    type: talisman.id,
    style: 'traditional',
    background: 'hwangji',
    title: talisman.name,
    hanja: talisman.hanja,
    message: '',           // 앞면에 긴 염원을 쓰지 않는다
    mantra: talisman.mantra ?? '',
    symbols: [...(talisman.design?.patterns ?? []), ...(talisman.design?.symbols ?? [])],
    assetUrl: origin?.imagePath,
    noSeal: true,          // 기본 낙관 대신 개인 인장을 얹는다
  });

  if (!p) return base;

  const W = 360;
  const H = 560;
  const anchor: StampAnchor = origin?.stampAnchor ?? { x: 0.79, y: 0.82, size: 0.13 };
  const v = seedVariation(p.visualSeed);
  const cx = (anchor.x + v.anchorDx) * W;
  const cy = (anchor.y + v.anchorDy) * H;
  const side = anchor.size * W;

  // 사용자별 미세한 먹·종이 결 (원본 위 아주 옅은 오버레이 — 문양 변형 아님)
  const grain = `<radialGradient id="p-grain" cx="${(v.grainX * 100).toFixed(1)}%" cy="${(v.grainY * 100).toFixed(1)}%" r="85%">
      <stop offset="0%" stop-color="#7A4A34" stop-opacity="${(0.015 + v.inkShift * 0.5).toFixed(3)}"/>
      <stop offset="100%" stop-color="#7A4A34" stop-opacity="0"/>
    </radialGradient>`;

  const overlay = `<defs>${grain}</defs>
  <rect width="${W}" height="${H}" fill="url(#p-grain)"/>
  <g transform="translate(${cx.toFixed(1)}, ${cy.toFixed(1)})">${stampSvgFragment(
    p.stampText,
    side,
    p.stampRotation,
    p.stampOpacity
  )}</g>`;

  // </svg> 앞에 개인화 레이어 삽입
  const idx = base.lastIndexOf('</svg>');
  if (idx === -1) return base;
  return base.slice(0, idx) + overlay + base.slice(idx);
}
