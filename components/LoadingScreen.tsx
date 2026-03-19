'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Brain, Zap, ChartBar } from 'lucide-react';

type LoadingStage = 'reading' | 'parsing' | 'analyzing' | 'saving';

interface LoadingScreenProps {
  stage: LoadingStage;
}

const STAGES: {
  key: LoadingStage;
  icon: React.ReactNode;
  label: string;
  sub: string;
}[] = [
  {
    key: 'reading',
    icon: <ChartBar className="w-6 h-6" />,
    label: '대화량 계산 중...',
    sub: '파일을 읽고 있어요. 대용량 파일은 잠시 걸릴 수 있어요.',
  },
  {
    key: 'parsing',
    icon: <Zap className="w-6 h-6" />,
    label: 'Top 10 수다쟁이 추출 중...',
    sub: '누가 제일 말이 많은지 세고 있어요.',
  },
  {
    key: 'analyzing',
    icon: <Brain className="w-6 h-6" />,
    label: 'AI가 성격 분석 중...',
    sub: 'Gemini AI가 대화 패턴을 심층 분석하고 있어요.',
  },
  {
    key: 'saving',
    icon: <Brain className="w-6 h-6" />,
    label: '결과 저장 중...',
    sub: '분석 완료! 결과 페이지를 준비하고 있어요.',
  },
];

const stageIndex: Record<LoadingStage, number> = {
  reading: 0,
  parsing: 1,
  analyzing: 2,
  saving: 3,
};

export default function LoadingScreen({ stage }: LoadingScreenProps) {
  const currentIdx = stageIndex[stage];
  const [particles, setParticles] = useState<{ x: number; y: number; id: number }[]>([]);

  useEffect(() => {
    const arr = Array.from({ length: 12 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
    }));
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setParticles(arr);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#0a0a14]/95 backdrop-blur-sm"
    >
      {/* Background particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {particles.map((p) => (
          <motion.div
            key={p.id}
            className="absolute w-1 h-1 rounded-full bg-violet-400/30"
            style={{ left: `${p.x}%`, top: `${p.y}%` }}
            animate={{
              y: [0, -20, 0],
              opacity: [0.3, 0.8, 0.3],
            }}
            transition={{
              duration: 2 + (p.id % 3),
              repeat: Infinity,
              delay: p.id * 0.15,
            }}
          />
        ))}
      </div>

      <div className="relative z-10 flex flex-col items-center gap-10 px-6 max-w-sm w-full">
        {/* Spinner orb */}
        <div className="relative">
          <motion.div
            className="w-24 h-24 rounded-full bg-gradient-to-br from-violet-500 to-pink-500 flex items-center justify-center text-white shadow-2xl shadow-violet-500/40"
            animate={{ rotate: 360 }}
            transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
          >
            <div className="absolute inset-0 rounded-full bg-gradient-to-br from-violet-500 to-pink-500 animate-ping opacity-20" />
            <AnimatePresence mode="wait">
              <motion.div
                key={stage}
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0, opacity: 0 }}
                transition={{ duration: 0.3 }}
              >
                {STAGES[currentIdx].icon}
              </motion.div>
            </AnimatePresence>
          </motion.div>
        </div>

        {/* Stage label */}
        <div className="text-center space-y-2">
          <AnimatePresence mode="wait">
            <motion.h2
              key={stage + '-label'}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.4 }}
              className="text-2xl font-bold text-white"
            >
              {STAGES[currentIdx].label}
            </motion.h2>
          </AnimatePresence>
          <AnimatePresence mode="wait">
            <motion.p
              key={stage + '-sub'}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-white/50 text-sm"
            >
              {STAGES[currentIdx].sub}
            </motion.p>
          </AnimatePresence>
        </div>

        {/* Progress dots */}
        <div className="flex gap-3">
          {STAGES.map((s, i) => (
            <motion.div
              key={s.key}
              className={`h-2 rounded-full transition-all duration-500 ${
                i <= currentIdx ? 'bg-violet-400' : 'bg-white/20'
              }`}
              animate={{ width: i === currentIdx ? 32 : 8 }}
            />
          ))}
        </div>

        {/* Ad Slot in Loading */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="w-full mt-4"
        >
          <div className="flex flex-col items-center gap-2">
            <span className="text-[9px] font-bold text-white/20 uppercase tracking-[0.2em]">Sponsored Analysis</span>
            <div className="w-full p-4 rounded-xl bg-white/[0.03] border border-white/5 flex items-center justify-center h-20">
               <p className="text-white/20 text-xs text-center leading-relaxed">
                 분석 결과를 준비하는 동안<br/>잠시만 기다려 주세요
               </p>
            </div>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}
