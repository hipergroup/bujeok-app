// ============================================================
// 연락기원부(雁書符) — 기러기가 기다리던 소식을 전해오는 부적
//
// 옛사람들은 멀리서 온 편지를 안서(雁書), 기러기가 전해온 글이라 불렀다.
// 이 부적은 도감 47종과 별개의 특별 부적이다 — 두 기러기 사이의
// 빈 획을 사용자가 직접 이어야 완성되는, 의식(儀式)이 있는 한 장.
//
// 봉인 약속: 사용자가 적은 한마디는 완성 순간에 한 번 보여준 뒤
// 다시는 화면에 펼치지 않는다.
// ============================================================

import { TalismanCategory, type TalismanType } from '@/data/talismans';
import type { SavedTalisman } from './types';
import { stampSvgFragment, seedVariation } from './personal-talisman';
import { assetPath } from './assetPath';

export const ANSEO_ID = 'anseo-01';

/** 도감 밖 특별 부적 — 기존 47종 카탈로그는 건드리지 않는다 */
export const ANSEO_TALISMAN: TalismanType = {
  id: ANSEO_ID,
  name: '연락기원부',
  hanja: '雁書符',
  category: TalismanCategory.Love,
  description:
    '기러기가 기다리던 소식을 전해오는 부적입니다.\n아직 닿지 못한 말이 길을 잃지 않고, 가장 알맞은 때에 무사히 닿기를 기원합니다.',
  meaning: [
    '옛사람들은 멀리서 도착한 편지를 안서(雁書), 기러기가 전해온 글이라 불렀다.',
    '계절이 바뀌고 먼 길을 돌아서도 돌아갈 곳을 잊지 않는 새에게, 아직 전하지 못한 마음을 맡겼다.',
    '두 기러기 사이의 마지막 한 획은 부적을 지니는 사람이 직접 잇는다 — 그 획이 소식이 오갈 길이 된다.',
  ],
  situations: [
    '오래 소식을 기다리는 사람이 있을 때',
    '먼저 연락할 용기가 나지 않을 때',
    '조급한 마음을 내려놓고 싶을 때',
  ],
  design: {
    centerText: '雁書',
    patterns: ['구름', '달'],
    symbols: ['마주 나는 기러기 두 마리', '두 기러기를 잇는 붉은 획'],
    inkColor: '주사(朱砂) 붉은색',
    paperColor: '황지(黃紙)',
    notes:
      '두 기러기 사이는 비워 두고, 지니는 사람이 마지막 획을 직접 잇는다. 봉인한 한마디는 그림에 쓰지 않는다.',
  },
  usage: [
    '7일 동안 위젯(홈 화면)에 지니고, 마음이 흔들릴 때 한 번 바라본다.',
    '봉인한 문장은 다시 열어보지 않는다.',
    '소식이 닿은 날, 부적함에서 「소식이 닿았어요」를 눌러 도착인을 찍는다.',
  ],
  placement: '홈 화면 위젯, 또는 늘 여는 화면 곁',
  replacement: '소식이 닿아 도착인이 찍히면 이 부적의 소임은 끝난다',
  mantra: '안서속달 음신상통 급급여율령(雁書速達 音信相通 急急如律令)',
  colors: ['#B22222', '#F5E6B8', '#D4788C'],
};

// ─── 화폭 (기존 부적과 같은 360×560 좌표계) ───

export const ANSEO_W = 360;
export const ANSEO_H = 560;

/** 마지막 획의 시작(위 기러기 부리 곁)과 끝(아래 기러기 머리 곁) */
export const STROKE_START = { x: 202, y: 168 };
export const STROKE_END = { x: 146, y: 384 };
/** 시작·끝 판정 반경 */
export const STROKE_TOLERANCE = 40;

/** 원형 그림에서 뽑은 색 — 획·인장·도착인이 그림과 한 몸처럼 보이게 */
export const ANSEO_RED = '#931B0E';
export const ANSEO_PAPER = '#DAA43B';
const RED = ANSEO_RED;
const PAPER = ANSEO_PAPER;

/** 원형 그림 경로 — GitHub Pages basePath 보정 */
function anseoImageUrl(): string {
  return assetPath('/yeollak/anseo-base.jpg');
}

export interface AnseoArt {
  /** 완성 전 화면(그리기 단계)에 쓰는 바탕 — 획 없이 */
  base: string;
  /** 안내용 점선 길 */
  guide: string;
}

/**
 * 바탕 — 직접 그린 원형 그림(기러기 둘 + 봉인된 소식)을 그대로 쓴다.
 * 그림은 1024×1536(2:3)이라 360×560 화폭에 살짝 잘라(slice) 채운다.
 */
export function anseoBaseArt(): AnseoArt {
  const base = `
  <rect width="${ANSEO_W}" height="${ANSEO_H}" fill="${PAPER}"/>
  <image href="${anseoImageUrl()}" x="0" y="0" width="${ANSEO_W}" height="${ANSEO_H}" preserveAspectRatio="xMidYMid slice"/>`;

  // 길은 가운데 봉인된 소식을 오른쪽으로 돌아 지난다
  const guide = `<path d="M${STROKE_START.x} ${STROKE_START.y} C 262 226, 248 330, ${STROKE_END.x} ${STROKE_END.y}" fill="none" stroke="${RED}" stroke-width="2" stroke-dasharray="2 9" stroke-linecap="round" opacity="0.5"/>`;

  return { base, guide };
}

/** 도착인 — 소식이 닿은 날 찍는 붉은 원형 인 */
function arrivalStamp(arrivedAt: string): string {
  const d = new Date(arrivedAt);
  const dateStr = Number.isNaN(d.getTime())
    ? ''
    : `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, '0')}.${String(d.getDate()).padStart(2, '0')}`;
  return `<g transform="translate(86, 300) rotate(-7)" opacity="0.92">
    <circle r="27" fill="none" stroke="${RED}" stroke-width="2.5"/>
    <circle r="22.5" fill="none" stroke="${RED}" stroke-width="1"/>
    <text x="0" y="-2" text-anchor="middle" font-size="15" font-weight="bold" fill="${RED}" font-family="'Gowun Batang', 'AppleMyungjo', serif">到着</text>
    <text x="0" y="13" text-anchor="middle" font-size="7.5" fill="${RED}" font-family="'Gowun Batang', 'AppleMyungjo', serif">${dateStr}</text>
  </g>`;
}

/**
 * 완성된 연락기원부 한 장 — 화면·공유·위젯이 모두 이 한 벌을 쓴다.
 * 사용자가 그은 획(strokePath)과 이름 인장, 도착인까지 담는다.
 */
export function buildAnseoSVG(saved: SavedTalisman): string {
  const { base } = anseoBaseArt();
  const a = saved.anseo;
  const p = saved.personal;

  const stroke = a?.strokePath
    ? `<path d="${a.strokePath}" fill="none" stroke="${RED}" stroke-width="5" stroke-linecap="round" stroke-linejoin="round" opacity="0.9"/>`
    : '';

  let seal = '';
  if (p) {
    const v = seedVariation(p.visualSeed);
    // 인장도 그림에서 뽑은 붉은색·종이색으로 — 한 화폭에서 나온 것처럼
    const fragment = stampSvgFragment(
      p.stampText,
      0.13 * ANSEO_W,
      p.stampRotation,
      p.stampOpacity
    )
      .replaceAll('#A72B21', RED)
      .replaceAll('#F6EDD9', '#F2DFA6');
    seal = `<g transform="translate(${(0.79 + v.anchorDx) * ANSEO_W}, ${(0.82 + v.anchorDy) * ANSEO_H})">${fragment}</g>`;
  }

  const arrival = a?.arrivedAt ? arrivalStamp(a.arrivedAt) : '';

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${ANSEO_W} ${ANSEO_H}" preserveAspectRatio="xMidYMid meet">
  <rect width="${ANSEO_W}" height="${ANSEO_H}" fill="${PAPER}"/>
  ${base}
  ${stroke}
  ${arrival}
  ${seal}
</svg>`;
}

/** 부적함에서 「소식이 닿았어요」 — 도착인을 찍는다 */
export function markAnseoArrived(talismanId: string): SavedTalisman | null {
  try {
    const list: SavedTalisman[] = JSON.parse(
      localStorage.getItem('bujeok-collection') || '[]'
    );
    const t = list.find((x) => x.id === talismanId);
    if (!t?.anseo || t.anseo.arrivedAt) return t ?? null;
    t.anseo.arrivedAt = new Date().toISOString();
    localStorage.setItem('bujeok-collection', JSON.stringify(list));
    return t;
  } catch {
    return null;
  }
}
