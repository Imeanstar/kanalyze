'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import UploadZone from '@/components/UploadZone';
import LoadingScreen from '@/components/LoadingScreen';

type LoadingStage = 'reading' | 'parsing' | 'analyzing' | 'saving' | 'cached';

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

        const { id, cached } = parsed as { id: string; cached?: boolean };
        
        if (cached) {
          setLoadingStage('cached');
          await new Promise(r => setTimeout(r, 2000));
        }
        
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

        {/* SEO & FAQ Section for AdSense Approval */}
        <div className="max-w-3xl w-full mt-24 space-y-12 text-white/80 bg-white/[0.02] p-8 md:p-12 rounded-3xl border border-white/[0.05]">
          <section>
            <h2 className="text-2xl font-bold text-white mb-4">Kanalyze(카널라이즈)란 무엇인가요?</h2>
            <p className="leading-relaxed opacity-80">
              Kanalyze는 카카오톡 대화 내역 파일을 업로드하면 최신 AI 모델(Gemini 2.5 Flash)이 대화방의 전반적인 분위기, 
              Top 10 멤버들의 성격 및 특징, 그리고 멤버들 간의 관계망을 정밀하게 분석해주는 서비스입니다. 
              단순한 텍스트 빈도수 측정을 넘어, 지능적인 저수지 샘플링(Reservoir Sampling) 기법을 통해 
              과거부터 현재까지의 대화 흐름을 균형 있게 파악하여 소름 돋게 정확한 심리 분석 결과 리포트를 제공합니다.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">이용 방법 및 주요 기능</h2>
            <ul className="list-disc list-inside space-y-2 ml-2 opacity-80">
              <li><strong>대화 내보내기:</strong> 모바일 앱이나 PC 버전에서 분석하고 싶은 단체 채팅방의 &apos;대화 내보내기(텍스트만)&apos;를 수행합니다.</li>
              <li><strong>파일 업로드:</strong> 다운로드된 카카오톡 .txt 파일을 화면 중앙 영역에 드래그 앤 드롭하시면 자동으로 1차 데이터 파싱이 시작됩니다.</li>
              <li><strong>AI 성격 진단:</strong> 각 멤버별로 가장 많이 사용한 단어, 핵심 역할, 즐겨 쓰는 문장 등 실제 대화 예시를 인용한 전문적인 프로필이 생성됩니다.</li>
              <li><strong>관계의 거미줄:</strong> 대화 내역의 언급량과 흐름을 토대로 구성원 간의 사회적 관계도(ASCII 아트)를 정리해 한 눈에 볼 수 있게 그려줍니다.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">자주 묻는 질문 (FAQ)</h2>
            <div className="space-y-6">
              <div>
                <h3 className="font-semibold text-emerald-400">Q. 제 사적인 대화 내용이 서버에 몰래 저장되나요?</h3>
                <p className="text-sm mt-1.5 opacity-80 leading-relaxed">A. 전혀 그렇지 않습니다! 업로드하신 카카오톡 파일은 사용자의 브라우저 환경(Web Worker)에서 안전하게 1차 가공을 거치며, 통계 처리가 완료된 익명성 데이터 및 무작위 추출 문장만이 일시적으로 AI에 전달됩니다. <strong>서버에는 원본 .txt 파일이 단 1초도 저장되지 않고 즉각 소멸</strong>되며 철저한 보안 원칙을 준수합니다.</p>
              </div>
              <div>
                <h3 className="font-semibold text-emerald-400">Q. 시간이 너무 오래 걸리거나 멈춰있는 것 같습니다.</h3>
                <p className="text-sm mt-1.5 opacity-80 leading-relaxed">A. 수년 치의 엄청난 대화방일 경우 브라우저 렌더링에 수 초가 걸릴 수 있으며, 여러 사용자가 동시에 몰려 무료 AI 할당량 제한(429 Error)이 초과된 경우 시스템이 스스로 30초가량 대기열에 들어갔다가 자동으로 재시도합니다. 창을 닫지 말고 조금만 기다려 주시면 완벽한 분석을 보실 수 있습니다.</p>
              </div>
              <div>
                <h3 className="font-semibold text-emerald-400">Q. 이용 요금이 청구되진 않나요?</h3>
                <p className="text-sm mt-1.5 opacity-80 leading-relaxed">A. 네! Kanalyze는 모두가 재밌게 즐길 수 있도록 <strong>100% 무료</strong>로 제공되고 있습니다. 무거운 서버 유지비를 조금이라도 보태기 위해 결과 페이지에 뜨는 작은 배너 광고나 후원으로만 소소하게 운영되고 있으니 마음껏 즐겨주세요.</p>
              </div>
            </div>
          </section>

          <section className="text-[11px] text-white/40 pt-10 border-t border-white/10 leading-relaxed">
            <strong>[ 개인정보처리방침(Privacy Policy) 및 서비스 운영 약관 ]</strong><br/><br/>
            본 서비스(Kanalyze)는 사용자의 개인 식별 데이터 및 카카오톡 원본 데이터를 무단 수집, 저장, 제3자 제공, 마케팅 활용을 절대 하지 않음을 엄격히 약속합니다. 분석을 위해 추출된 최소한의 통계 결과값(요약본)만이 사용자 개개인에게 고유한 공유용 결과 URL을 제공하기 위해 암호화된 데이터베이스에 저장됩니다. (결과 URL 방문자가 0원 캐싱을 누리기 위함) 만약 본인의 분석 결과 및 관련 메타데이터의 영구 삭제를 원하실 경우 하단의 제작자 문의 이메일로 요청해주시면 24시간 내에 완전히 파기해 드립니다. 본 애플리케이션의 AI가 생성하는 모든 분석은 통계 표본과 생성형 AI의 추론을 기반으로 한 오락성 콘텐츠이며, 어떠한 법적, 의학적, 객관적 효력이나 책임을 지지 않습니다. 
          </section>
        </div>

        {/* Footer / Contact */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="mt-12 flex flex-col items-center gap-2"
        >
          <a
            href="mailto:mike4404@naver.com?subject=[Kanalyze]%20문의/제안사항"
            className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-white/5 border border-white/10 text-sm font-medium text-white/70 hover:bg-white/10 hover:text-white transition-colors cursor-pointer"
          >
            📬 제작자에게 버그 제보 / 의견 제안하기
          </a>
          <p className="text-xs text-white/30 text-center">클릭 시 기본 메일 앱(mike4404@naver.com)이 열립니다.</p>
        </motion.div>
      </div>
    </main>
  );
}
