import type { NextConfig } from "next";

// GitHub Pages(https://hipergroup.github.io/bujeok-app/)는 하위 경로에서 서빙되므로
// CI 배포 빌드에서만 GITHUB_PAGES=true로 basePath를 적용한다. 로컬 dev는 루트 그대로.
const isGitHubPages = process.env.GITHUB_PAGES === "true";

const nextConfig: NextConfig = {
  output: "export",
  basePath: isGitHubPages ? "/bujeok-app" : undefined,
  // 디렉터리/index.html 형태로 내보내 /encyclopedia 와 /encyclopedia/ 둘 다 동작하게 한다.
  trailingSlash: true,
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
