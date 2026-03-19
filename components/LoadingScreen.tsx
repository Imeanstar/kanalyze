'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Brain, Zap, ChartBar } from 'lucide-react';
import AdBanner from '@/components/AdBanner';

type LoadingStage = 'reading' | 'parsing' | 'analyzing' | 'saving';

interface LoadingScreenProps {
  stage: LoadingStage;
}

const STAGES: {
  key: LoadingStage;
  icon: React.ReactNode;
  label: string;
  sub: string | string[];
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
    sub: [
      '누가 제일 말이 많은지 세고 있어요.',
      '숨어있는 프로 토커를 발굴하는 중...',
      '가장 많이 등장한 텍스트 패턴을 분석하고 있어요.',
      '단톡방의 지배자가 누구인지 찾는 중...'
    ],
  },
  {
    key: 'analyzing',
    icon: <Brain className="w-6 h-6" />,
    label: 'AI가 성격 분석 중...',
    sub: [
      'Gemini AI가 대화 패턴을 심층 분석하고 있어요.',
      '이 구역의 감성 장인을 찾고 있어요 ✨',
      '조용한 암살자(눈팅족)들을 색출하고 있어요!',
      '서로 주고받은 팩트폭행의 흔적을 찾는 중 ⚔️',
      '대화 패턴에서 성격을 유추하는 중입니다 🧠',
      'AI가 단톡방의 숨겨진 서사를 읽어내고 있습니다 📖',
      '누가 가장 "ㅋㅋㅋ"를 많이 쳤는지 기싸움 중...'
    ],
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
  const [subMsgIndex, setSubMsgIndex] = useState(0);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setSubMsgIndex(0);
  }, [stage]);

  useEffect(() => {
    const currentSub = STAGES[currentIdx].sub;
    if (Array.isArray(currentSub)) {
      const interval = setInterval(() => {
        setSubMsgIndex((prev) => (prev + 1) % currentSub.length);
      }, 2500);
      return () => clearInterval(interval);
    }
  }, [currentIdx]);

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
              key={stage + '-' + subMsgIndex}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-white/50 text-sm h-5"
            >
              {Array.isArray(STAGES[currentIdx].sub)
                ? (STAGES[currentIdx].sub as string[])[subMsgIndex]
                : STAGES[currentIdx].sub}
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

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="w-full mt-4"
        >
          <div className="flex flex-col items-center gap-2">
            <AdBanner unit="DAN-pK4q1Pq0rfIGc9hN" width={300} height={250} />
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}
