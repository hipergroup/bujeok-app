// 오늘의 운세 표시용 상수 — 계산과 화면을 섞지 않으려고 분리해 둔다.

import type { FortuneAreaKey, FortuneTier } from './today-fortune';

export const FORTUNE_AREAS: {
  key: FortuneAreaKey;
  label: string;
  icon: string;
}[] = [
  { key: 'work', label: '일·학업', icon: '\u{1F4DA}' },
  { key: 'money', label: '재물', icon: '\u{1FA99}' },
  { key: 'relation', label: '관계', icon: '\u{1F91D}' },
  { key: 'mind', label: '마음·건강', icon: '\u{1F33F}' },
];

/** 등급 뱃지 색 — 점수 숫자 대신 쓰는 표시 */
export const TIER_STYLE: Record<FortuneTier, { color: string; bg: string }> = {
  '흐름이 좋은 날': { color: '#A72B21', bg: 'rgba(167,43,33,0.08)' },
  '차분히 나아갈 날': { color: '#8F6B14', bg: 'rgba(218,160,23,0.12)' },
  '신중함이 필요한 날': { color: '#5C6B57', bg: 'rgba(107,125,99,0.12)' },
  '잠시 쉬어갈 날': { color: '#4A5A6B', bg: 'rgba(31,62,99,0.10)' },
};
