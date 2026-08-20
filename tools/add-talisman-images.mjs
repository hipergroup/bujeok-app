// ============================================================
// 부적 그림 반입 — public/talismans/_들어올그림/ 에 넣은 이미지를
// 규격(-전통.png, 세로 900px)으로 정리해 커밋·푸시한다.
//
// 사용법:
//   1) public/talismans/_들어올그림/ 폴더에 이미지를 넣는다
//      파일명은 부적 이름만: 합격부.png, 인연부.jpg …
//      (43종 이름은 /atelier 화첩 페이지 참고)
//   2) npm run add-images   (또는 바탕화면 "부적 올리기.command")
//
// 하는 일: 이름이 카탈로그 43종과 일치하는지 검사 → sips 로 세로
// 900px 리사이즈 → <이름>-전통.png 로 이동 → git commit & push.
// 푸시되면 GitHub Actions 가 빌드하며 카탈로그 연결까지 자동.
// ============================================================

import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const INBOX = path.join(ROOT, 'public/talismans/_들어올그림');
const DEST = path.join(ROOT, 'public/talismans');

// 카탈로그의 부적 이름 43종 — talismans.ts 에서 name 만 뽑는다
const catalogSrc = fs.readFileSync(
  path.join(ROOT, 'src/data/talismans.ts'),
  'utf8'
);
const NAMES = new Set(
  [...catalogSrc.matchAll(/^\s*name:\s*'([^']+)'/gm)].map((m) =>
    m[1].normalize('NFC')
  )
);

fs.mkdirSync(INBOX, { recursive: true });

const files = fs
  .readdirSync(INBOX)
  .filter((f) => /\.(png|jpe?g|webp)$/i.test(f));

if (files.length === 0) {
  console.log(`넣을 그림이 없어요. 이 폴더에 이미지를 넣어주세요:\n  ${INBOX}`);
  console.log('파일명은 부적 이름만: 합격부.png, 인연부.jpg …');
  process.exit(0);
}

const done = [];
const skipped = [];

for (const f of files) {
  const name = path.parse(f).name.normalize('NFC').trim();
  if (!NAMES.has(name)) {
    skipped.push(`${f} — "${name}"은(는) 카탈로그 43종에 없는 이름이에요`);
    continue;
  }
  const src = path.join(INBOX, f);
  const dst = path.join(DEST, `${name}-전통.png`);
  // sips: 세로 900px 로 축소(작으면 그대로) + png 변환
  execFileSync('sips', ['-Z', '900', '-s', 'format', 'png', src, '--out', dst], {
    stdio: 'pipe',
  });
  fs.unlinkSync(src);
  done.push(name);
}

for (const s of skipped) console.log(`⚠️  건너뜀: ${s}`);
if (done.length === 0) {
  console.log('반입된 그림이 없어요.');
  process.exit(skipped.length ? 1 : 0);
}

console.log(`✅ 반입: ${done.join(', ')}`);

// 커밋·푸시 — 반입된 그림 파일만 정확히 스테이징 (다른 작업 휩쓸림 방지)
const git = (args) => execFileSync('git', args, { cwd: ROOT, stdio: 'pipe' });
git(['pull', '--rebase', '--autostash']);
git(['add', '--', ...done.map((n) => `public/talismans/${n}-전통.png`)]);
git([
  'commit',
  '-m',
  `🖼️ 부적 그림 ${done.length}종 반입 — ${done.join('·')}\n\n(tools/add-talisman-images.mjs 로 추가)`,
]);
git(['push']);

console.log('🚀 푸시 완료 — 1~2분 뒤 앱과 화첩(/atelier)에 반영돼요.');
