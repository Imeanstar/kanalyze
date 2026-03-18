'use client';

import { motion } from 'framer-motion';
import type { MemberAnalysis } from '@/lib/supabase';

interface ProfileCardProps {
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

export default function ProfileCard({ member, rank }: ProfileCardProps) {
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
      transition={{ duration: 0.5, delay: Math.min((rank - 1) * 0.05, 0.3) }}
      className={`relative rounded-2xl border ${rankStyle.border} bg-gradient-to-br ${gradient} backdrop-blur-sm shadow-xl ${rankStyle.glow} overflow-hidden`}
    >
      {/* Top accent bar */}
      <div className="h-1 w-full bg-gradient-to-r from-violet-500 via-pink-500 to-orange-500" />

      <div className="p-6 md:p-8">
        {/* Header */}
        <div className="flex items-start justify-between gap-4 mb-6">
          <div className="flex items-center gap-4">
            {/* Rank badge */}
            <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold ${rankStyle.badge} flex-shrink-0 z-10 shadow-md`}>
              {rank <= 3 ? ['👑', '🥈', '🥉'][rank - 1] : `#${rank}`}
            </div>
            
            {/* Avatar */}
            <div className="w-12 h-12 rounded-full border-2 border-white/20 bg-white/5 overflow-hidden flex-shrink-0 -ml-6 shadow-md">
              <img 
                src={`https://api.dicebear.com/7.x/notionists/svg?seed=${encodeURIComponent(member.name)}&backgroundColor=transparent`} 
                alt={`${member.name} avatar`}
                className="w-full h-full object-cover"
              />
            </div>

            <div className="ml-1">
              <h3 className="text-xl font-bold text-white tracking-tight">{member.name}</h3>
              <p className="text-sm text-white/50 mt-0.5 italic">{member.title}</p>
            </div>
          </div>

          {/* Message count stat */}
          <div className="text-right flex-shrink-0">
            <p className="text-2xl font-extrabold text-white">
              {member.message_count.toLocaleString()}
            </p>
            <p className="text-xs text-white/40">총 메시지</p>
          </div>
        </div>

      </div>
    </motion.div>
  );
}
