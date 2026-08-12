// ============================================================
// public/talismans 폴더를 훑어 부적 이미지 목록을 만든다.
//
//   public/talismans/호신부-전통.png  →  { 호신부: { traditional: '...' } }
//   public/talismans/호신부-감성.png  →  { 호신부: { emotional:  '...' } }
//
// 왜 스캔해서 목록을 만드나:
//  · 정적 사이트라 실행 중에 폴더를 볼 수 없다.
//  · macOS가 만든 한글 파일명은 자모 분리(NFD) 형태라, 코드에서 이름을
//    조합해 경로를 만들면 서버의 실제 파일명과 어긋나 404가 난다.
//    → 실제 파일명을 그대로 읽어 URL로 굳혀두면 이 문제가 사라진다.
//
// `npm run build` 앞에 자동 실행된다 (package.json prebuild).
// ============================================================

import { readdirSync, writeFileSync, existsSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';

const ASSET_DIR = 'public/talismans';
const OUT_FILE = 'src/data/talisman-assets.ts';

// GitHub Pages 배포 빌드는 하위 경로(/bujeok-app)에서 서빙되므로
// next.config와 같은 조건으로 그림 URL에도 basePath를 붙인다.
// (SVG 문자열 안의 <image href>는 Next가 보정해 주지 않는다)
const BASE_PATH = process.env.GITHUB_PAGES === 'true' ? '/bujeok-app' : '';

/** 파일명 접미사 → 부적의 모습 */
const STYLE_SUFFIX = {
  전통: 'traditional',
  감성: 'emotional',
};

const IMAGE_EXT = /\.(png|jpg|jpeg|webp)$/i;

function scan() {
  if (!existsSync(ASSET_DIR)) return {};

  /** @type {Record<string, Record<string, string>>} */
  const assets = {};

  for (const file of readdirSync(ASSET_DIR)) {
    if (!IMAGE_EXT.test(file)) continue;

    const base = file.replace(IMAGE_EXT, '');
    const dash = base.lastIndexOf('-');
    if (dash < 1) continue;

    const suffix = base.slice(dash + 1).normalize('NFC').trim();
    const style = STYLE_SUFFIX[suffix];
    if (!style) continue;

    // 키는 비교하기 쉽게 NFC로, 경로는 실제 파일명 그대로 인코딩한다
    const name = base.slice(0, dash).normalize('NFC').trim();
    assets[name] ??= {};
    assets[name][style] = `${BASE_PATH}/talismans/${encodeURIComponent(file)}`;
  }

  return assets;
}

const assets = scan();
const count = Object.values(assets).reduce(
  (sum, styles) => sum + Object.keys(styles).length,
  0
);

const body = `// 이 파일은 자동 생성됩니다 — 직접 수정하지 마세요.
// 부적 이미지를 추가하려면 public/talismans 에 파일을 넣으세요:
//   <부적이름>-전통.png  /  <부적이름>-감성.png
// (생성기: tools/gen-talisman-assets.mjs)

/** 부적을 간직하는 모습 */
export type TalismanStyle = 'traditional' | 'emotional';

/** 부적 이름 → 모습별 이미지 경로 */
export const TALISMAN_ASSETS: Record<
  string,
  Partial<Record<TalismanStyle, string>>
> = ${JSON.stringify(assets, null, 2)};

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
`;

mkdirSync('src/data', { recursive: true });
writeFileSync(join(process.cwd(), OUT_FILE), body);
console.log(
  `[talisman-assets] ${Object.keys(assets).length}종 · 이미지 ${count}장 → ${OUT_FILE}`
);
