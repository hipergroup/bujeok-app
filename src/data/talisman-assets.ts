// 이 파일은 자동 생성됩니다 — 직접 수정하지 마세요.
// 부적 이미지를 추가하려면 public/talismans 에 파일을 넣으세요:
//   <부적이름>-전통.png  /  <부적이름>-감성.png
// (생성기: tools/gen-talisman-assets.mjs)

/** 부적을 간직하는 모습 */
export type TalismanStyle = 'traditional' | 'emotional';

/** 부적 이름 → 모습별 이미지 경로 */
export const TALISMAN_ASSETS: Record<
  string,
  Partial<Record<TalismanStyle, string>>
> = {};

/**
 * 해당 부적·모습의 그림 파일 경로. 없으면 undefined —
 * 이 경우 코드로 그리는 SVG 부적을 그대로 사용한다.
 */
export function getTalismanAsset(
  name: string | undefined,
  style: TalismanStyle
): string | undefined {
  if (!name) return undefined;
  return TALISMAN_ASSETS[name.normalize('NFC')]?.[style];
}
