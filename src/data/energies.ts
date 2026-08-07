// ============================================================
// 기운(마음의 방향) 정의 — 홈 카테고리·기운 선택·부적함 필터의 단일 소스
// 기존 상담 플로우(TalismanCategory)와 매핑되어 기능을 그대로 잇는다
// ============================================================

import { TalismanCategory } from './talismans';

export type MotifKind =
  | 'knot' // 전통 매듭
  | 'cloud' // 구름
  | 'flame' // 불꽃
  | 'mountain' // 산수
  | 'jangseung' // 장승
  | 'lotus'; // 연꽃 문양

export interface Energy {
  id: string;
  /** 홈 카드·필터에 쓰는 이름 */
  title: string;
  /** 홈 카드 보조 문구 */
  subtitle: string;
  /** 검증된 한자 표기 */
  hanja: string;
  /** 포인트 컬러 (부적 테두리·강조) */
  color: string;
  /** 상담·추천에 연결되는 기존 카테고리 */
  category: TalismanCategory;
  motif: MotifKind;
  /** 기본 바탕 종이 (BackgroundPreset.id) — 시안의 색지 매핑 */
  paper: string;
}

export const ENERGIES: Energy[] = [
  {
    id: 'aegun',
    paper: 'hwangji',
    title: '액운 막기',
    subtitle: '나쁜 기운 차단',
    hanja: '厄除',
    color: '#A72B21',
    category: TalismanCategory.Protection,
    motif: 'jangseung',
  },
  {
    id: 'yeonae',
    paper: 'hwangji',
    title: '인연의 기운',
    subtitle: '설레는 마음과 좋은 인연',
    hanja: '因緣',
    color: '#C25B78',
    category: TalismanCategory.Love,
    motif: 'knot',
  },
  {
    id: 'maeum',
    paper: 'namsaekji',
    title: '마음 안정',
    subtitle: '불안과 걱정 내려놓기',
    hanja: '平安',
    color: '#6B7D63',
    category: TalismanCategory.Health,
    motif: 'lotus',
  },
  {
    id: 'jaebok',
    paper: 'geumji',
    title: '재복 기원',
    subtitle: '재물과 복 불러오기',
    hanja: '財福',
    color: '#DAA017',
    category: TalismanCategory.Wealth,
    motif: 'flame',
  },
  {
    id: 'geongang',
    paper: 'hwangji',
    title: '건강 기원',
    subtitle: '몸과 마음의 건강',
    hanja: '健康',
    color: '#1F3E63',
    category: TalismanCategory.Health,
    motif: 'mountain',
  },
  {
    id: 'sowon',
    paper: 'hwangji',
    title: '소원 성취',
    subtitle: '바라는 일 이루기',
    hanja: '所願',
    color: '#DAA017',
    category: TalismanCategory.Other,
    motif: 'flame',
  },
  {
    id: 'gajeong',
    paper: 'ssukji',
    title: '가정 수호',
    subtitle: '가족의 평안과 화합',
    hanja: '家宅平安',
    color: '#7A4A34',
    category: TalismanCategory.Family,
    motif: 'knot',
  },
  {
    id: 'hakeop',
    paper: 'geumji',
    title: '학업·시험',
    subtitle: '집중력과 좋은 결과',
    hanja: '合格',
    color: '#2E2E2E',
    category: TalismanCategory.Study,
    motif: 'cloud',
  },
];

/** 홈 그리드에 보여줄 6종 */
// 홈 그리드: 전 카테고리 노출 (2열 × 4행) — 연애·재물이 빠져 있던 문제 수정
export const HOME_ENERGIES = ENERGIES;

export function getEnergyById(id: string): Energy | undefined {
  return ENERGIES.find((e) => e.id === id);
}

/** 저장된 부적의 카테고리 → 대표 기운 (부적함 필터·색상용) */
export function getEnergyByCategory(category: string): Energy {
  return ENERGIES.find((e) => e.category === category) ?? ENERGIES[0];
}
