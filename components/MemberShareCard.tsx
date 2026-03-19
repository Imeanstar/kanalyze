'use client';

import { forwardRef } from 'react';
import type { MemberAnalysis } from '@/lib/supabase';

interface MemberShareCardProps {
  member: MemberAnalysis;
  rank: number;
  totalMessages?: number;
  totalSpeakers?: number;
}

const RANK_COLORS: Record<number, { border: string; badge: string; glow: string }> = {
  1: { border: '#f59e0b', badge: '#f59e0b', glow: 'rgba(245,158,11,0.3)' },
  2: { border: '#94a3b8', badge: '#94a3b8', glow: 'rgba(148,163,184,0.3)' },
  3: { border: '#f97316', badge: '#f97316', glow: 'rgba(249,115,22,0.3)' },
};

const MemberShareCard = forwardRef<HTMLDivElement, MemberShareCardProps>(
  ({ member, rank, totalMessages = 0, totalSpeakers = 0 }, ref) => {
    const rankStyle = RANK_COLORS[rank] || { border: '#a855f7', badge: '#a855f7', glow: 'rgba(168,85,247,0.3)' };
    const rankEmoji = rank <= 3 ? ['👑', '🥈', '🥉'][rank - 1] : `#${rank}`;

    const percentage = totalMessages > 0 ? ((member.message_count / totalMessages) * 100).toFixed(1) : '0.0';

    const avatarUrl = `https://api.dicebear.com/7.x/adventurer/png?seed=${encodeURIComponent(member.name)}&backgroundColor=b6e3f4,c0aede,d1d4f9&size=200`;

    return (
      <div
        ref={ref}
        style={{
          width: '600px',
          height: '280px',
          background: 'linear-gradient(135deg, #0f0c29, #1a1040, #24243e)',
          border: `2px solid ${rankStyle.border}`,
          borderRadius: '20px',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          fontFamily: 'system-ui, -apple-system, sans-serif',
          position: 'relative',
          boxShadow: `0 0 40px ${rankStyle.glow}`,
        }}
      >
        {/* Top accent bar */}
        <div style={{ height: '4px', background: 'linear-gradient(90deg, #7c3aed, #ec4899, #f97316)', flexShrink: 0 }} />

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 20px 6px', flexShrink: 0 }}>
          <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: '11px', fontWeight: 700, letterSpacing: '3px', textTransform: 'uppercase' }}>
            🤖 KANALYZE AI 분석카드
          </span>
          <span style={{ color: 'rgba(255,255,255,0.3)', fontSize: '10px' }}>www.kanalyze.cloud</span>
        </div>

        {/* Main body */}
        <div style={{ display: 'flex', flex: 1, padding: '8px 20px 16px', gap: '20px', minHeight: 0 }}>
          {/* Left: Avatar */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
            <div style={{
              width: '120px', height: '120px', borderRadius: '50%',
              border: `3px solid ${rankStyle.border}`,
              background: 'rgba(255,255,255,0.08)',
              overflow: 'hidden',
              boxShadow: `0 0 20px ${rankStyle.glow}`,
            }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={avatarUrl} alt={member.name} width={120} height={120} style={{ objectFit: 'cover' }} />
            </div>
            {/* Rank badge */}
            <div style={{
              background: rankStyle.badge,
              borderRadius: '20px',
              padding: '3px 12px',
              fontSize: '12px', fontWeight: 800, color: '#000',
            }}>
              {rankEmoji} {rank}위
            </div>
          </div>

          {/* Right: Info */}
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: '6px', minWidth: 0 }}>
            <div>
              <div style={{ color: 'white', fontSize: '26px', fontWeight: 900, lineHeight: 1.1, letterSpacing: '-0.5px' }}>
                {member.name}
              </div>
              <div style={{ color: rankStyle.badge, fontSize: '13px', fontWeight: 700, marginTop: '2px' }}>
                {member.title}
              </div>
            </div>

            <div style={{ width: '40px', height: '2px', background: `linear-gradient(90deg, ${rankStyle.border}, transparent)`, marginTop: '4px' }} />

            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginTop: '10px' }}>
              <div style={{ background: 'rgba(255,255,255,0.06)', borderRadius: '10px', padding: '6px 12px', textAlign: 'center', minWidth: '72px' }}>
                <div style={{ color: 'white', fontSize: '16px', fontWeight: 900 }}>{member.message_count.toLocaleString()}</div>
                <div style={{ color: 'rgba(255,255,255,0.35)', fontSize: '10px', letterSpacing: '1px', marginTop: '2px' }}>메시지</div>
              </div>
              <div style={{ background: 'rgba(255,255,255,0.06)', borderRadius: '10px', padding: '6px 12px', textAlign: 'center', minWidth: '64px' }}>
                <div style={{ color: 'white', fontSize: '16px', fontWeight: 900 }}>{percentage}%</div>
                <div style={{ color: 'rgba(255,255,255,0.35)', fontSize: '10px', letterSpacing: '1px', marginTop: '2px' }}>비중</div>
              </div>
              <div style={{ background: 'rgba(255,255,255,0.06)', borderRadius: '10px', padding: '6px 12px', textAlign: 'center', minWidth: '64px' }}>
                <div style={{ color: 'white', fontSize: '15px', fontWeight: 900 }}>{totalSpeakers > 0 ? `${totalSpeakers}명` : '-'}</div>
                <div style={{ color: 'rgba(255,255,255,0.35)', fontSize: '10px', letterSpacing: '1px', marginTop: '2px' }}>인원</div>
              </div>
              <div style={{ background: 'rgba(255,255,255,0.06)', borderRadius: '10px', padding: '6px 10px', textAlign: 'center', flex: 1 }}>
                <div style={{ color: 'white', fontSize: '12px', fontWeight: 700, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{member.active_time || '-'}</div>
                <div style={{ color: 'rgba(255,255,255,0.35)', fontSize: '10px', letterSpacing: '1px', marginTop: '2px' }}>활동시간</div>
              </div>
            </div>
          </div>
        </div>

        {/* Decorative corner circles */}
        <div style={{ position: 'absolute', top: '-30px', right: '-30px', width: '100px', height: '100px', borderRadius: '50%', background: `radial-gradient(circle, ${rankStyle.glow}, transparent)`, pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: '-40px', left: '100px', width: '120px', height: '120px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(139,92,246,0.1), transparent)', pointerEvents: 'none' }} />
      </div>
    );
  }
);

MemberShareCard.displayName = 'MemberShareCard';
export default MemberShareCard;
