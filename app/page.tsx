'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import UploadZone from '@/components/UploadZone';
import LoadingScreen from '@/components/LoadingScreen';
import AdBanner from '@/components/AdBanner';

type LoadingStage = 'reading' | 'parsing' | 'analyzing' | 'saving';

export default function HomePage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [loadingStage, setLoadingStage] = useState<LoadingStage>('reading');
  const [error, setError] = useState('');

  const handleParsingStart = useCallback(() => {
    setIsLoading(true);
    setLoadingStage('reading');
    setError('');
  }, []);

  const handleParsingProgress = useCallback((stage: 'reading' | 'parsing' | 'done') => {
    if (stage === 'reading') setLoadingStage('reading');
    else if (stage === 'parsing') setLoadingStage('parsing');
    // 'done' transitions handled by onParseComplete
  }, []);

  const handleParseComplete = useCallback(
    async (data: { group_stats: object; top10: object[] }) => {
      try {
        setLoadingStage('analyzing');

        const res = await fetch('/api/analyze', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
        });

        setLoadingStage('saving');

        // 수정된 부분: res.text() 먼저 읽고, JSON 파싱 실패(HTML 에러 페이지 등) 시 안전하게 처리
        const rawText = await res.text();
        let parsed: { id?: string; error?: string };
        try {
          parsed = JSON.parse(rawText);
        } catch {
          throw new Error(
            `서버 오류가 발생했습니다. (${res.status})\n환경변수(.env.local)가 올바르게 설정됐는지 확인해주세요.`
          );
        }

        if (!res.ok) {
          throw new Error(parsed.error || `API 오류 (${res.status})`);
        }

        const { id } = parsed as { id: string };
        router.push(`/result/${id}`);
      } catch (err) {
        setIsLoading(false);
        setError(err instanceof Error ? err.message : '알 수 없는 오류가 발생했습니다.');
      }
    },
    [router]
  );

  const handleError = useCallback((msg: string) => {
    setIsLoading(false);
    setError(msg);
  }, []);

  return (
    <main className="min-h-screen bg-[#0a0a14] text-white relative overflow-hidden">
      {/* Background glow elements */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-[-20%] left-[10%] w-[600px] h-[600px] bg-violet-600/20 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[5%] w-[500px] h-[500px] bg-pink-600/15 rounded-full blur-[100px]" />
        <div className="absolute top-[40%] left-[60%] w-[300px] h-[300px] bg-blue-600/10 rounded-full blur-[80px]" />
      </div>

      {/* Loading overlay */}
      <AnimatePresence>
        {isLoading && <LoadingScreen stage={loadingStage} />}
      </AnimatePresence>

      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-4 py-16">
        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-6 px-4 py-1.5 rounded-full border border-violet-500/30 bg-violet-500/10 text-violet-300 text-xs font-semibold tracking-widest uppercase"
        >
          🔥 AI 카톡 분석기 — Beta
        </motion.div>

        {/* Hero title */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="text-4xl md:text-6xl font-extrabold text-center leading-tight mb-4"
        >
          우리 단톡방,{' '}
          <span className="bg-gradient-to-r from-violet-400 via-pink-400 to-orange-400 bg-clip-text text-transparent">
            AI의 시선으로
          </span>
        </motion.h1>

        {/* Sub */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-white/50 text-center text-lg mb-12 max-w-xl"
        >
          카카오톡 대화 파일을 올리면 AI가 성격과 역할을 분석해 드립니다.
          <br />
          <span className="text-white/30 text-sm">파일은 서버에 저장되지 않습니다.</span>
          <br />
          <span className="text-emerald-400/70 text-sm font-medium">✨ PC 및 모바일 카카오톡 대화 내역 모두 지원합니다!</span>
        </motion.p>

        {/* Upload Zone */}
        <UploadZone
          onParsingStart={handleParsingStart}
          onParsingProgress={handleParsingProgress}
          onParseComplete={handleParseComplete}
          onError={handleError}
        />

        {/* Error message */}
        <AnimatePresence>
          {error && (
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="mt-4 text-red-400 text-sm text-center"
            >
              ⚠️ {error}
            </motion.p>
          )}
        </AnimatePresence>

        {/* Feature pills */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="mt-16 flex flex-wrap gap-3 justify-center"
        >
          {[
            '🧠 AI 심리 분석',
            '📊 Top 10 추출',
            '💬 실제 대화 인용',
            '🔗 링크 공유',
            '🔒 완전 익명',
          ].map((label) => (
            <span
              key={label}
              className="px-4 py-2 rounded-full bg-white/5 border border-white/10 text-white/60 text-sm"
            >
              {label}
            </span>
          ))}
        </motion.div>

        <div className="max-w-xl w-full">
          <AdBanner />
        </div>
      </div>
    </main>
  );
}
