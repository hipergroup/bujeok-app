// ─── Talisman types ───

export type TalismanCategory = '수호' | '재물' | '건강' | '가정' | '학업' | '기타';

export interface TalismanInfo {
  id: string;
  name: string;
  hanja: string;
  category: TalismanCategory;
  description: string;
  whenToUse: string;
  symbolsExplained: string;
  howToUse: string;
  svgKey: string; // lookup key for the SVG illustration
}

export interface SavedTalisman extends TalismanInfo {
  savedAt: string; // ISO date string
  note?: string;
}

export const CATEGORY_COLORS: Record<TalismanCategory, string> = {
  수호: '#E63946',
  재물: '#F4A261',
  건강: '#2A9D8F',
  가정: '#E76F51',
  학업: '#457B9D',
  기타: '#6C757D',
};

export const CATEGORY_LIST: Array<{ label: string; value: TalismanCategory | '전체' }> = [
  { label: '전체', value: '전체' },
  { label: '수호', value: '수호' },
  { label: '재물', value: '재물' },
  { label: '건강', value: '건강' },
  { label: '가정', value: '가정' },
  { label: '학업', value: '학업' },
  { label: '기타', value: '기타' },
];
