'use client';

import { motion } from 'framer-motion';
import type { MemberAnalysis } from '@/lib/supabase';
import ReactMarkdown from 'react-markdown';

interface DetailedProfileCardProps {
  member: MemberAnalysis;
  rank: number;
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

export default function DetailedProfileCard({ member, rank }: DetailedProfileCardProps) {
  const rankStyle = RANK_STYLES[rank] || {
    border: 'border-white/10',
    glow: 'shadow-white/5',
    badge: 'bg-white/20 text-white',
  };
  const gradient = GRADIENT_PALETTES[(rank - 1) % GRADIENT_PALETTES.length];

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
        <div className="flex items-start justify-between gap-4 mb-6 pb-6 border-b border-white/10">
          <div className="flex items-center gap-4">
            <div className={`w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold ${rankStyle.badge} flex-shrink-0 shadow-lg`}>
              {rank <= 3 ? ['👑', '🥈', '🥉'][rank - 1] : `#${rank}`}
            </div>
            
            <div className="w-14 h-14 rounded-full border-2 border-white/20 bg-white/5 overflow-hidden flex-shrink-0">
              <img 
                src={`https://api.dicebear.com/7.x/notionists/svg?seed=${encodeURIComponent(member.name)}&backgroundColor=transparent`} 
                alt={`${member.name} avatar`}
                className="w-full h-full object-cover"
              />
            </div>

            <div className="ml-2">
              <h3 className="text-2xl font-bold text-white tracking-tight">{member.name}</h3>
              <p className="text-sm text-white/60 mt-1">{member.title}</p>
            </div>
          </div>

          <div className="text-right flex-shrink-0 bg-white/5 px-4 py-2 rounded-xl backdrop-blur-md border border-white/5">
            <p className="text-xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-pink-400">
              {member.message_count.toLocaleString()}
            </p>
            <p className="text-[10px] uppercase tracking-wider text-white/40 mt-0.5">메시지</p>
          </div>
        </div>

        {/* Markdown Content */}
        <div className="prose prose-invert max-w-none prose-headings:text-white/90 prose-h3:text-lg prose-p:text-white/70 prose-a:text-violet-400 prose-blockquote:border-violet-500/50 prose-blockquote:bg-white/5 prose-blockquote:py-1 prose-blockquote:px-4 prose-blockquote:rounded-r-lg prose-ul:text-white/70 prose-li:marker:text-violet-500">
          {member.detailed_markdown ? (
            <ReactMarkdown>{member.detailed_markdown}</ReactMarkdown>
          ) : (
            <p className="text-white/40 italic text-center py-8">상세 분석 데이터가 없습니다.</p>
          )}
        </div>
      </div>
    </motion.div>
  );
}
