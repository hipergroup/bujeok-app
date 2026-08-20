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
> = {
  "소아부": {
    "traditional": "/talismans/%E1%84%89%E1%85%A9%E1%84%8B%E1%85%A1%E1%84%87%E1%85%AE-%E1%84%8C%E1%85%A5%E1%86%AB%E1%84%90%E1%85%A9%E1%86%BC.png"
  },
  "수명장수부": {
    "traditional": "/talismans/%E1%84%89%E1%85%AE%E1%84%86%E1%85%A7%E1%86%BC%E1%84%8C%E1%85%A1%E1%86%BC%E1%84%89%E1%85%AE%E1%84%87%E1%85%AE-%E1%84%8C%E1%85%A5%E1%86%AB%E1%84%90%E1%85%A9%E1%86%BC.png"
  },
  "안태부": {
    "traditional": "/talismans/%E1%84%8B%E1%85%A1%E1%86%AB%E1%84%90%E1%85%A2%E1%84%87%E1%85%AE-%E1%84%8C%E1%85%A5%E1%86%AB%E1%84%90%E1%85%A9%E1%86%BC.png"
  },
  "개업대길부": {
    "traditional": "/talismans/%EA%B0%9C%EC%97%85%EB%8C%80%EA%B8%B8%EB%B6%80-%EC%A0%84%ED%86%B5.png"
  },
  "경면주사부": {
    "traditional": "/talismans/%EA%B2%BD%EB%A9%B4%EC%A3%BC%EC%82%AC%EB%B6%80-%EC%A0%84%ED%86%B5.png"
  },
  "매매부": {
    "traditional": "/talismans/%EB%A7%A4%EB%A7%A4%EB%B6%80-%EC%A0%84%ED%86%B5.png"
  },
  "벽사부": {
    "traditional": "/talismans/%EB%B2%BD%EC%82%AC%EB%B6%80-%EC%A0%84%ED%86%B5.png"
  },
  "부도옹부": {
    "traditional": "/talismans/%EB%B6%80%EB%8F%84%EC%98%B9%EB%B6%80-%EC%A0%84%ED%86%B5.png"
  },
  "사업번창부": {
    "traditional": "/talismans/%EC%82%AC%EC%97%85%EB%B2%88%EC%B0%BD%EB%B6%80-%EC%A0%84%ED%86%B5.png"
  },
  "삼재부": {
    "traditional": "/talismans/%EC%82%BC%EC%9E%AC%EB%B6%80-%EC%A0%84%ED%86%B5.png"
  },
  "수살막이부": {
    "traditional": "/talismans/%EC%88%98%EC%82%B4%EB%A7%89%EC%9D%B4%EB%B6%80-%EC%A0%84%ED%86%B5.png"
  },
  "승진부": {
    "traditional": "/talismans/%EC%8A%B9%EC%A7%84%EB%B6%80-%EC%A0%84%ED%86%B5.png"
  },
  "오방신장부": {
    "traditional": "/talismans/%EC%98%A4%EB%B0%A9%EC%8B%A0%EC%9E%A5%EB%B6%80-%EC%A0%84%ED%86%B5.png"
  },
  "재물부": {
    "traditional": "/talismans/%EC%9E%AC%EB%AC%BC%EB%B6%80-%EC%A0%84%ED%86%B5.png"
  },
  "천왕부": {
    "traditional": "/talismans/%EC%B2%9C%EC%99%95%EB%B6%80-%EC%A0%84%ED%86%B5.png"
  },
  "초복부": {
    "traditional": "/talismans/%EC%B4%88%EB%B3%B5%EB%B6%80-%EC%A0%84%ED%86%B5.png"
  },
  "호신부": {
    "traditional": "/talismans/%ED%98%B8%EC%8B%A0%EB%B6%80-%EC%A0%84%ED%86%B5.png"
  },
  "횡재부": {
    "traditional": "/talismans/%ED%9A%A1%EC%9E%AC%EB%B6%80-%EC%A0%84%ED%86%B5.png"
  }
};

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
