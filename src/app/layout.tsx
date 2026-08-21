import type { Metadata, Viewport } from "next";
import { Gowun_Batang, Song_Myung, Nanum_Brush_Script } from "next/font/google";
import ServiceWorkerRegister from "@/components/ServiceWorkerRegister";
import ScrollToTop from "@/components/ScrollToTop";
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

// 손으로 적은 글씨 — 붓으로 눌러쓴 한글 (무료 상업용, OFL)
// 걱정 태우기처럼 "사용자가 직접 쓴 글" 에만 쓴다
const hand = Nanum_Brush_Script({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-hand",
  display: "swap",
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
  themeColor: "#F2E7CE",
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
      className={`h-full antialiased ${serifKr.variable} ${brush.variable} ${hand.variable}`}
    >
      <body className="min-h-dvh flex flex-col">
        <ScrollToTop />
        {children}
        <ServiceWorkerRegister />
      </body>
    </html>
  );
}
