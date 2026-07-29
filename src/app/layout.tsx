import type { Metadata, Viewport } from "next";
import "./globals.css";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
  themeColor: "#0a0a1a",
};

export const metadata: Metadata = {
  title: "수호부적 - 맞춤형 디지털 부적",
  description:
    "당신만을 위한 맞춤형 디지털 부적. 운세 확인부터 부적 생성까지, 수호부적이 함께합니다.",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "수호부적",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" className="h-full antialiased">
      <body className="min-h-dvh flex flex-col">{children}</body>
    </html>
  );
}
