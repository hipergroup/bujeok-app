<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# ⚠️ 협업 규칙 (여러 Claude 세션이 이 저장소를 동시에 작업함 — 반드시 준수)

1. **push 전에 반드시 `git pull` 먼저. force push(`push -f`) 절대 금지.**
   - 2026-07-31~08-03 사이 force push로 다른 세션의 커밋이 원격에서 세 번 유실됨.
   - pull 후 충돌이 나면 abort하지 말고 해소할 것 — 그 충돌이 곧 유실 복구임.
2. **gh-pages 브랜치에 직접 푸시 금지.** 배포는 main에 푸시하면 GitHub Actions
   (.github/workflows/deploy.yml)가 자동으로 빌드해 gh-pages로 올린다.
   수동으로 빌드 결과물을 올리면 다른 세션의 최신 배포를 덮어쓴다.
3. **커밋은 자기가 수정한 파일만 골라 `git add`.** 작업 트리에 다른 세션의
   미커밋 변경이 함께 있을 수 있다. `git add -A` 금지.
4. GitHub Pages는 basePath(`/bujeok-app`) 밖 절대경로가 404가 된다.
   `window.location.href='/'`나 생 `<a href="/...">` 금지 — next/link와 router만 사용.
5. 부적 데이터의 단일 원천은 `src/data/talismans.ts`(43종). UI 팔레트·컴포넌트는
   한지 디자인 시스템(`src/components/hanji/`, globals.css의 한지 토큰)을 재사용할 것.
