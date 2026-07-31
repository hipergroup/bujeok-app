import type { Metadata, Viewport } from "next";
import { Gowun_Batang, Song_Myung } from "next/font/google";
import "./globals.css";

// 본문·제목용 명조 (무료 상업용, OFL)
const serifKr = Gowun_Batang({
  weight: ["400", "700"],
  subsets: ["latin"],
  variable: "--font-serif-kr",
  display: "swap",
});

// 큰 제목·낙관용 — 붓글씨 느낌의 세리프 (무료 상업용, OFL)
const brush = Song_Myung({
  weight: "400",
  variable: "--font-brush",
  display: "swap",
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
  themeColor: "#F2E6CC",
};

export const metadata: Metadata = {
  title: "수호부 - 마음을 지키는 부적",
  description:
    "전통 부적을 현대적으로 재해석한 힐링 앱. 마음을 한 줄로 적으면 당신만의 부적이 됩니다.",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "수호부",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="ko"
      className={`h-full antialiased ${serifKr.variable} ${brush.variable}`}
    >
      <body className="min-h-dvh flex flex-col">{children}</body>
    </html>
  );
}
