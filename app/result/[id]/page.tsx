import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import type { AnalysisRow } from '@/lib/supabase';
import ResultClient from './ResultClient';

interface PageProps {
  params: Promise<{ id: string }>;
}

async function getAnalysis(id: string): Promise<AnalysisRow | null> {
  const { data, error } = await supabase
    .from('analyses')
    .select('*')
    .eq('id', id)
    .single();

  if (error || !data) return null;
  return data as AnalysisRow;
}

// ── Phase 5: Dynamic OG tags ──────────────────────────────────────────────────

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const analysis = await getAnalysis(id);

  const title = '🔥 우리 단톡방 분석 결과 도착! 나의 역할은?';
  const description = analysis?.data?.group_summary
    ? `${analysis.data.group_summary} — AI가 분석한 우리 단톡방 캐릭터를 확인해보세요!`
    : 'AI가 카카오톡 대화 내역을 분석해 단톡방 수다쟁이 Top 10의 성격과 역할을 낱낱이 공개합니다.';

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://kanalyze.vercel.app';

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url: `${baseUrl}/result/${id}`,
      siteName: 'Kanalyze — AI 카톡 분석기',
      images: [
        {
          url: 'https://www.kanalyze.cloud/og-default.png?v=2',
          width: 1200,
          height: 630,
          alt: '카카오톡 단톡방 AI 분석 결과',
        },
      ],
      type: 'website',
      locale: 'ko_KR',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
    },
  };
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default async function ResultPage({ params }: PageProps) {
  const { id } = await params;
  const analysis = await getAnalysis(id);

  if (!analysis) {
    notFound();
  }

  return <ResultClient analysis={analysis} />;
}
