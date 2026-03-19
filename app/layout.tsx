import type { Metadata } from 'next';
import { Noto_Sans_KR } from 'next/font/google';
import Script from 'next/script';
import './globals.css';

const notoSansKr = Noto_Sans_KR({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800', '900'],
  variable: '--font-noto-sans-kr',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Kanalyze — AI 카카오톡 분석기',
  description:
    '카카오톡 대화 파일을 업로드하면 AI가 수다쟁이 Top 10의 성격과 단톡방 역할을 분석해 드립니다.',
  metadataBase: new URL(process.env.NEXT_PUBLIC_BASE_URL || 'https://kanalyze.vercel.app'),
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" className={notoSansKr.variable}>
      <head>
        <Script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-9950230676038014"
          crossorigin="anonymous"
          strategy="afterInteractive"
        />
      </head>
      <body className="font-sans antialiased bg-[#0a0a14] text-white">
        {children}
      </body>
    </html>
  );
}
