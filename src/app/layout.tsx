import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "가차겟차 - 전국 가차샵과 캡슐토이 정보",
  description: "전국 가차샵 위치와 캡슐토이(가챠) 상품 정보를 한눈에 확인하세요. 가까운 가차샵을 찾고, 신상 가차를 확인하고, 나만의 컬렉션을 만들어보세요.",
  keywords: ["가차", "가챠", "캡슐토이", "가차샵", "반다이", "가챠폰"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen flex flex-col bg-gradient-to-b from-rose-50/50 to-sky-50/50`}
      >
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
