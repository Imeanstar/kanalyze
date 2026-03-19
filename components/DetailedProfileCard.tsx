'use client';

import { useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { Download, Share2 } from 'lucide-react';
import type { MemberAnalysis } from '@/lib/supabase';
import ReactMarkdown from 'react-markdown';
import MemberShareCard from './MemberShareCard';

interface DetailedProfileCardProps {
  member: MemberAnalysis;
  rank: number;
  totalMessages?: number;
  totalSpeakers?: number;
}

const RANK_STYLES: Record<number, { border: string; glow: string; badge: string }> = {
  1: {
    border: 'border-yellow-400/40',
    glow: 'shadow-yellow-500/20',
    badge: 'bg-yellow-400 text-yellow-900',
  },
  2: {
    border: 'border-slate-300/40',
    glow: 'shadow-slate-400/20',
    badge: 'bg-slate-300 text-slate-800',
  },
  3: {
    border: 'border-orange-400/40',
    glow: 'shadow-orange-500/20',
    badge: 'bg-orange-400 text-orange-900',
  },
};

const GRADIENT_PALETTES = [
  'from-violet-600/20 to-pink-600/10',
  'from-blue-600/20 to-cyan-600/10',
  'from-emerald-600/20 to-teal-600/10',
  'from-orange-600/20 to-red-600/10',
  'from-pink-600/20 to-rose-600/10',
  'from-indigo-600/20 to-violet-600/10',
  'from-amber-600/20 to-yellow-600/10',
  'from-cyan-600/20 to-sky-600/10',
  'from-rose-600/20 to-pink-600/10',
  'from-purple-600/20 to-indigo-600/10',
];

export default function DetailedProfileCard({ member, rank, totalMessages = 0, totalSpeakers = 0 }: DetailedProfileCardProps) {
  const rankStyle = RANK_STYLES[rank] || {
    border: 'border-white/10',
    glow: 'shadow-white/5',
    badge: 'bg-white/20 text-white',
  };
  const gradient = GRADIENT_PALETTES[(rank - 1) % GRADIENT_PALETTES.length];
  const cardRef = useRef<HTMLDivElement>(null);
  const [sharing, setSharing] = useState(false);
  const [shareOk, setShareOk] = useState(false);

  const handleShareCard = async () => {
    if (!cardRef.current || sharing) return;
    setSharing(true);
    try {
      // Dynamic import to avoid SSR issues
      const { toPng } = await import('html-to-image');
      const dataUrl = await toPng(cardRef.current, { cacheBust: true, pixelRatio: 2 });

      const isMobile = typeof navigator.share === 'function' && navigator.maxTouchPoints > 0;
      if (isMobile) {
        // Convert dataUrl to Blob for Web Share API
        const res = await fetch(dataUrl);
        const blob = await res.blob();
        const file = new File([blob], `${member.name}_kanalyze.png`, { type: 'image/png' });
        if (navigator.canShare?.({ files: [file] })) {
          await navigator.share({ files: [file], title: `${member.name} — Kanalyze AI 분석카드` });
          setShareOk(true);
          setTimeout(() => setShareOk(false), 2500);
          return;
        }
      }
      // Desktop / fallback: download as PNG
      const link = document.createElement('a');
      link.download = `${member.name}_kanalyze.png`;
      link.href = dataUrl;
      link.click();
      setShareOk(true);
      setTimeout(() => setShareOk(false), 2500);
    } finally {
      setSharing(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-80px' }}
      transition={{ duration: 0.5, delay: 0.1 }}
      className={`relative rounded-2xl border ${rankStyle.border} bg-gradient-to-br ${gradient} backdrop-blur-sm shadow-xl ${rankStyle.glow} overflow-hidden`}
    >
      {/* Top accent bar */}
      <div className="h-1 w-full bg-gradient-to-r from-violet-500 via-pink-500 to-orange-500" />

      <div className="p-6 md:p-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 mb-6 pb-6 border-b border-white/10">
          <div className="flex items-center gap-4 w-full md:w-auto">
            <div className={`w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold ${rankStyle.badge} flex-shrink-0 shadow-lg`}>
              {rank <= 3 ? ['👑', '🥈', '🥉'][rank - 1] : `#${rank}`}
            </div>
            
            <div className="w-14 h-14 md:w-16 md:h-16 rounded-full border-2 border-white/20 bg-white/5 overflow-hidden flex-shrink-0">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img 
                src={`https://api.dicebear.com/7.x/adventurer/svg?seed=${encodeURIComponent(member.name)}&backgroundColor=transparent`} 
                alt={`${member.name} avatar`}
                className="w-full h-full object-cover"
              />
            </div>

            <div className="flex-1 min-w-0 ml-1">
              <h3 className="text-xl md:text-2xl font-bold text-white tracking-tight truncate">{member.name}</h3>
              <p className="text-xs md:text-sm text-white/60 mt-0.5 truncate">{member.title}</p>
            </div>
          </div>

          <div className="flex flex-row md:flex-col items-center md:items-end justify-between md:justify-start w-full md:w-auto gap-3 flex-shrink-0 bg-white/5 md:bg-transparent px-4 py-3 md:p-0 rounded-2xl md:rounded-none">
            <div className="md:text-right md:bg-white/5 md:px-4 md:py-2 md:rounded-xl md:backdrop-blur-md md:border border-white/5 flex items-baseline gap-2 md:block">
              <p className="text-xl md:text-xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-pink-400">
                {member.message_count.toLocaleString()}
              </p>
              <p className="text-xs md:text-[10px] md:uppercase text-white/40 md:mt-0.5 font-medium">메시지</p>
            </div>

            {/* Share card button */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleShareCard}
              disabled={sharing}
              className={`inline-flex w-full md:w-auto justify-center items-center gap-1.5 px-4 py-2.5 md:px-3 md:py-1.5 rounded-xl md:rounded-lg text-sm md:text-xs font-bold transition-all ${
                shareOk
                  ? 'bg-emerald-500 text-black'
                  : sharing
                  ? 'bg-violet-500/50 text-white/50 cursor-wait'
                  : 'bg-violet-600 hover:bg-violet-500 text-white'
              }`}
            >
              {shareOk ? (
                '✅ 저장됨!'
              ) : sharing ? (
                '처리 중...'
              ) : (
                <>
                  {typeof navigator !== 'undefined' && navigator.maxTouchPoints > 0
                    ? <><Share2 className="w-4 h-4 md:w-3 md:h-3" /> 카드 공유</>
                    : <><Download className="w-4 h-4 md:w-3 md:h-3" /> 카드 저장</>
                  }
                </>
              )}
            </motion.button>
          </div>
        </div>

        {/* Hidden share card (captured by html-to-image) */}
        <div className="mb-6 flex justify-center">
          <MemberShareCard ref={cardRef} member={member} rank={rank} totalMessages={totalMessages} totalSpeakers={totalSpeakers} />
        </div>

        {/* Markdown Content */}
        <div className="prose prose-invert max-w-none prose-headings:text-white/90 prose-h3:text-lg prose-p:text-white/70 prose-a:text-violet-400 prose-blockquote:border-violet-500/50 prose-blockquote:bg-white/5 prose-blockquote:py-1 prose-blockquote:px-4 prose-blockquote:rounded-r-lg prose-ul:text-white/70 prose-li:marker:text-violet-500">
          {member.detailed_markdown ? (
            <ReactMarkdown>
              {/* AI sometimes outputs literal '\n' escape sequences instead of real newlines */}
              {member.detailed_markdown.replace(/\\n/g, '\n')}
            </ReactMarkdown>
          ) : (
            <p className="text-white/40 italic text-center py-8">상세 분석 데이터가 없습니다.</p>
          )}
        </div>
      </div>
    </motion.div>
  );
}
