'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Share2, PieChart as PieChartIcon, Network, UserSquare2, Home, Lock, Play } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import ProfileCard from '@/components/ProfileCard';
import DetailedProfileCard from '@/components/DetailedProfileCard';
import AdBanner from '@/components/AdBanner';
import SupportButton from '@/components/SupportButton';
import RelationshipGraph from '@/components/RelationshipGraph';
import type { AnalysisRow } from '@/lib/supabase';

interface ResultClientProps {
  analysis: AnalysisRow;
}

const COLORS = [
  '#a855f7', // purple
  '#ec4899', // pink
  '#f97316', // orange
  '#3b82f6', // blue
  '#10b981', // emerald
  '#f43f5e', // rose
  '#6366f1', // indigo
  '#eab308', // yellow
  '#06b6d4', // cyan
  '#84cc16', // lime
  '#64748b'  // slate (for others)
];

export default function ResultClient({ analysis }: ResultClientProps) {
  const [activeTab, setActiveTab] = useState<'summary' | 'relationship' | 'detailed'>('summary');
  const [selectedDetailedMember, setSelectedDetailedMember] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [unlockedTabs, setUnlockedTabs] = useState<Set<string>>(new Set());
  const [isUnlocking, setIsUnlocking] = useState(false);

  const { data } = analysis;
  const members = data.members ?? [];
  const groupStats = data.group_summary;
  const othersCount = data.others_message_count || 0;
  
  const top10Total = members.reduce((sum, m) => sum + m.message_count, 0);
  const totalMessages = top10Total + othersCount;

  const handleShare = async () => {
    const resultUrl = window.location.href.includes('?') ? window.location.href : window.location.href + '?ref=share';
    const serviceUrl = window.location.origin + '?ref=share';

    const top3 = members.slice(0, 3);
    const rankEmojis = ['👑', '🥈', '🥉'];
    const top3Lines = top3
      .map((m, i) => `  ${rankEmojis[i]} ${m.name} — ${m.title}`)
      .join('\n');

    const summarySlice = typeof groupStats === 'string'
      ? groupStats.slice(0, 120) + (groupStats.length > 120 ? '...' : '')
      : '우리 단톡방 AI 분석 완료!';

    const shareText = [
      `🔥 우리 단톡방, AI가 낱낱이 분석했다!`,
      ``,
      `📊 ${summarySlice}`,
      ``,
      `🏆 TOP 3 캐릭터`,
      top3Lines,
      ``,
      `👉 우리 결과 보기: ${resultUrl}`,
      `🤖 내 단톡방도 분석하기: ${serviceUrl}`,
    ].join('\n');

    try {
      const isMobile = typeof navigator.share === 'function' && navigator.maxTouchPoints > 0;
      if (isMobile) {
        await navigator.share({ title: '🔥 우리 단톡방 AI 분석 결과!', text: shareText });
      } else {
        await navigator.clipboard.writeText(shareText);
        setCopied(true);
        setTimeout(() => setCopied(false), 2500);
      }
    } catch {
      try {
        await navigator.clipboard.writeText(shareText);
        setCopied(true);
        setTimeout(() => setCopied(false), 2500);
      } catch { /* ignore */ }
    }
  };

  const handleUnlock = (tab: string) => {
    setIsUnlocking(true);
    // Simulate ad viewing / preparation (1.5s for habit building during approval period)
    setTimeout(() => {
      setUnlockedTabs(prev => new Set(prev).add(tab));
      setIsUnlocking(false);
    }, 1500);
  };

  const onTabChange = (tab: 'summary' | 'relationship' | 'detailed') => {
    setActiveTab(tab);
    if (tab === 'detailed') setSelectedDetailedMember(null);
  };

  const chartData = members.map((m, i) => ({
    name: m.name,
    value: m.message_count,
    color: COLORS[i % (COLORS.length - 1)]
  }));

  if (othersCount > 0) {
    chartData.push({
      name: '기타 (Others)',
      value: othersCount,
      color: COLORS[COLORS.length - 1]
    });
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const renderTooltipContent = (props: any) => {
    const { active, payload } = props;
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      const percentage = ((data.value / totalMessages) * 100).toFixed(1);
      return (
        <div className="bg-[#1e1e2e]/95 border border-white/20 p-3 rounded-xl shadow-2xl backdrop-blur-md">
          <p className="text-white font-bold mb-1 flex items-center gap-2">
            <span className="w-3 h-3 rounded-full" style={{ backgroundColor: data.color }} />
            {data.name}
          </p>
          <p className="text-white/80 text-sm">{data.value.toLocaleString()}건 ({percentage}%)</p>
        </div>
      );
    }
    return null;
  };

  const renderLockedOverlay = (tab: 'relationship' | 'detailed') => (
    <div className="bg-[#121217] border border-white/10 rounded-3xl p-10 md:p-16 shadow-2xl flex flex-col items-center text-center relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-transparent to-violet-900/10 pointer-events-none" />
      <div className="w-20 h-20 rounded-full bg-violet-500/10 flex items-center justify-center mb-6 border border-violet-500/20">
        <Lock className="w-8 h-8 text-violet-400" />
      </div>
      <h3 className="text-2xl font-black text-white mb-4">심층 분석 결과 잠금</h3>
      <p className="text-white/50 mb-8 max-w-sm leading-relaxed">
        {tab === 'relationship' ? '우리 방의 복잡한 관계도를 확인하시겠습니까?' : '멤버별 상세 성격 분석 리포트를 확인하시겠습니까?'}
        <br/>짧은 광고 시청 후 바로 확인하실 수 있습니다.
      </p>
      
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        disabled={isUnlocking}
        onClick={() => handleUnlock(tab)}
        className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl bg-gradient-to-r from-violet-600 to-indigo-600 text-white font-bold shadow-xl hover:shadow-violet-500/40 transition-all disabled:opacity-50"
      >
        {isUnlocking ? (
          <>
            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            분석 결과 준비 중...
          </>
        ) : (
          <>
            <Play className="w-5 h-5 fill-current" /> 광고 보고 결과 확인하기
          </>
        )}
      </motion.button>
      
      <p className="mt-6 text-[11px] text-white/20">광고 수익은 서비스의 지속적인 AI 운영비로 사용됩니다. 감사합니다!</p>
    </div>
  );

  return (
    <main className="min-h-screen bg-[#09090b] text-white selection:bg-violet-500/30 font-sans">
      {/* Background ambient glows */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-[10%] w-[600px] h-[400px] bg-violet-600/10 rounded-full blur-[140px]" />
        <div className="absolute bottom-0 right-[10%] w-[500px] h-[400px] bg-pink-600/5 rounded-full blur-[120px]" />
      </div>

      <div className="relative z-10 max-w-4xl mx-auto px-4 py-8 md:py-16">
        <AdBanner />

        {/* ── Header ─────────────────────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-10 mt-6"
        >
          <div className="inline-flex items-center gap-2 mb-4 px-4 py-1.5 rounded-full border border-violet-500/40 bg-violet-500/10 text-violet-300 text-sm font-bold tracking-widest uppercase shadow-[0_0_15px_rgba(139,92,246,0.15)]">
            <span>✨</span> AI 정밀 분석 완료
          </div>
          <h1 className="text-4xl md:text-6xl font-black mb-4 leading-tight tracking-tight">
            단톡방 <br className="md:hidden" />
            <span className="bg-gradient-to-r from-violet-400 via-fuchsia-400 to-orange-400 bg-clip-text text-transparent drop-shadow-sm">
              심층 성격 분석 결과
            </span>
          </h1>

          <div className="flex flex-col items-center gap-3">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleShare}
              className={`mt-6 inline-flex items-center gap-2 px-8 py-3.5 rounded-full font-bold shadow-xl hover:shadow-2xl transition-all ${
                copied
                  ? 'bg-emerald-400 text-black'
                  : 'bg-white text-black hover:bg-gray-100'
              }`}
            >
              {copied ? '✅ 복사됨! 카톡에 붙여넣기 하세요' : <><Share2 className="w-5 h-5" /> 단톡방에 결과 공유하기</>}
            </motion.button>

            <div className="flex items-center gap-3 mt-1">
              <motion.a
                href="/"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="inline-flex items-center gap-2 px-5 py-2 rounded-full border border-white/20 text-white/60 hover:text-white hover:border-white/40 text-sm font-medium transition-all"
              >
                <Home className="w-4 h-4" /> 처음으로
              </motion.a>
              <SupportButton />
            </div>
          </div>
        </motion.div>

        {/* ── Tabs Navigation ────────────────────────────────────────────── */}
        <div className="flex bg-[#18181b] p-2 rounded-2xl mb-10 border border-white/5 shadow-2xl overflow-x-auto scrollbar-hide">
          <button
            onClick={() => onTabChange('summary')}
            className={`flex items-center gap-2 px-5 py-3.5 rounded-xl text-sm md:text-base font-bold transition-all whitespace-nowrap flex-1 justify-center ${
              activeTab === 'summary' ? 'bg-gradient-to-r from-violet-600 to-indigo-600 shadow-lg text-white' : 'text-white/40 hover:text-white hover:bg-white/5'
            }`}
          >
            <PieChartIcon className="w-5 h-5" /> TOP10 요약
          </button>
          <button
            onClick={() => onTabChange('relationship')}
            className={`flex items-center gap-2 px-5 py-3.5 rounded-xl text-sm md:text-base font-bold transition-all whitespace-nowrap flex-1 justify-center ${
              activeTab === 'relationship' ? 'bg-gradient-to-r from-pink-600 to-rose-600 shadow-lg text-white' : 'text-white/40 hover:text-white hover:bg-white/5'
            }`}
          >
            <div className="relative">
              <Network className="w-5 h-5" />
              {!unlockedTabs.has('relationship') && <span className="absolute -top-1 -right-1 w-2 h-2 bg-yellow-400 rounded-full animate-pulse" />}
            </div>
            관계도
          </button>
          <button
            onClick={() => onTabChange('detailed')}
            className={`flex items-center gap-2 px-5 py-3.5 rounded-xl text-sm md:text-base font-bold transition-all whitespace-nowrap flex-1 justify-center ${
              activeTab === 'detailed' ? 'bg-gradient-to-r from-orange-500 to-amber-500 shadow-lg text-white' : 'text-white/40 hover:text-white hover:bg-white/5'
            }`}
          >
            <div className="relative">
              <UserSquare2 className="w-5 h-5" />
              {!unlockedTabs.has('detailed') && <span className="absolute -top-1 -right-1 w-2 h-2 bg-yellow-400 rounded-full animate-pulse" />}
            </div>
            개인 상세 분석
          </button>
        </div>

        {/* ── Tab Content ────────────────────────────────────────────────── */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            {/* ── TAB 1: SUMMARY ── */}
            {activeTab === 'summary' && (
              <div className="space-y-8">
                {/* Group Summary Card */}
                <div className="bg-[#121217] border border-white/10 rounded-3xl p-6 md:p-10 shadow-2xl relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-violet-500 to-pink-500" />
                  
                  <h2 className="text-2xl font-black mb-6 flex items-center gap-3 text-white">
                    <span className="text-3xl">📝</span> 전체 분석 평
                  </h2>
                  <p className="text-white/80 leading-relaxed text-lg md:text-xl font-medium whitespace-pre-line">
                    {groupStats}
                  </p>
                  
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-8 pt-8 border-t border-white/10">
                    <div className="bg-white/5 rounded-2xl p-4 text-center">
                      <p className="text-sm font-semibold tracking-wide text-white/40 mb-1">총 분석 멤버</p>
                      <p className="text-2xl font-black text-violet-400">{members.length}명 <span className="text-xs text-white/30 font-normal">/ {othersCount > 0 ? members.length + Math.round(othersCount / 100) : members.length}명+</span></p>
                    </div>
                    <div className="bg-white/5 rounded-2xl p-4 text-center">
                      <p className="text-sm font-semibold tracking-wide text-white/40 mb-1">총 메시지</p>
                      <p className="text-2xl font-black text-pink-400">{totalMessages.toLocaleString()}건</p>
                    </div>
                    <div className="bg-white/5 rounded-2xl p-4 text-center md:col-span-1 col-span-2">
                      <p className="text-sm font-semibold tracking-wide text-white/40 mb-1">분석일시</p>
                      <p className="text-xl font-bold text-orange-400 mt-1">{new Date(analysis.created_at).toLocaleDateString()}</p>
                    </div>
                  </div>
                </div>

                {/* Pie Chart Widget */}
                <div className="bg-[#121217] border border-white/10 rounded-3xl p-6 md:p-10 shadow-2xl flex flex-col items-center">
                  <h3 className="text-xl font-black text-white mb-2 text-center">대화량 지분율</h3>
                  <p className="text-sm font-medium text-white/40 mb-8 text-center">(마우스를 올리면 퍼센트 확인 가능)</p>
                  
                  <div className="w-full h-[350px] md:h-[450px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={chartData}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          outerRadius="80%"
                          innerRadius="40%"
                          dataKey="value"
                          stroke="#121217"
                          strokeWidth={4}
                          paddingAngle={2}
                        >
                          {chartData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip content={renderTooltipContent} cursor={{ fill: 'transparent' }} isAnimationActive={false} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>

                  {/* Legend */}
                  <div className="flex flex-wrap justify-center gap-x-4 gap-y-3 mt-8 max-w-lg">
                    {chartData.map((entry) => (
                      <div key={entry.name} className="flex items-center gap-1.5 text-sm font-medium text-white/80">
                        <span className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: entry.color }} />
                        <span className="truncate max-w-[100px]">{entry.name}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <AdBanner unit="DAN-pK4q1Pq0rfIGc9hN" width={300} height={250} />

                <div className="pt-8 mb-6">
                  <h3 className="text-3xl font-black text-center text-white">🏆 TOP 10 랭킹</h3>
                  <p className="text-center text-white/40 mt-2 font-medium">우리 방 최고의 수다쟁이들</p>
                </div>
                
                <div className="space-y-4">
                  {members.map((member, i) => (
                    <ProfileCard 
                      key={member.name} 
                      member={member} 
                      rank={i + 1} 
                      totalMessages={totalMessages}
                      totalSpeakers={data.total_speakers || (members.length + (othersCount > 0 ? Math.round(othersCount / 100) + 1 : 0))}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* ── TAB 2: RELATIONSHIP ── */}
            {activeTab === 'relationship' && (
              <div className="space-y-8">
                {unlockedTabs.has('relationship') ? (
                  <div className="bg-[#0f111a] border border-violet-500/30 rounded-3xl p-6 md:p-8 overflow-hidden shadow-2xl relative">
                    <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-6 bg-black/20 -mx-8 -mt-8 px-8 pt-6">
                      <div className="flex items-center gap-2">
                        <div className="w-3.5 h-3.5 rounded-full bg-[#ff5f56] shadow-[0_0_10px_#ff5f56]" />
                        <div className="w-3.5 h-3.5 rounded-full bg-[#ffbd2e] shadow-[0_0_10px_#ffbd2e]" />
                        <div className="w-3.5 h-3.5 rounded-full bg-[#27c93f] shadow-[0_0_10px_#27c93f]" />
                        <span className="ml-4 text-sm font-mono text-emerald-400 font-bold tracking-wider">root@kanalyze:~/relationship_map.exe</span>
                      </div>
                    </div>

                    <div className="overflow-x-auto relative z-10 custom-scrollbar pb-4 min-h-[400px]">
                      <RelationshipGraph edges={data.relationship_map} />
                    </div>
                  </div>
                ) : renderLockedOverlay('relationship')}
                <AdBanner unit="DAN-pK4q1Pq0rfIGc9hN" width={300} height={250} />
              </div>
            )}

            {/* ── TAB 3: DETAILED ── */}
            {activeTab === 'detailed' && (
              <div className="space-y-8">
                {unlockedTabs.has('detailed') ? (
                  <>
                    <div className="text-center">
                      <h2 className="text-3xl font-black text-white mb-3">프리미엄 정밀 분석 리포트</h2>
                      <p className="text-white/50 text-base font-medium">✨ 궁금한 사람을 클릭해서 심층 분석을 확인하세요! ✨</p>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
                      {members.map((m, i) => {
                        const rankEmojis = ['👑', '🥈', '🥉'];
                        const isSelected = selectedDetailedMember === m.name;
                        return (
                          <button
                            key={m.name}
                            onClick={() => setSelectedDetailedMember(isSelected ? null : m.name)}
                            className={`flex flex-col items-center gap-2 p-3 rounded-2xl border transition-all duration-200 ${
                              isSelected
                                ? 'border-violet-500 bg-violet-500/20 shadow-lg shadow-violet-500/20'
                                : 'border-white/10 bg-white/5 hover:bg-white/10 hover:border-white/30'
                            }`}
                          >
                            <div className="relative">
                              <div className="w-14 h-14 rounded-full border-2 border-white/20 bg-white/5 overflow-hidden">
                                <img
                                  src={`https://api.dicebear.com/7.x/adventurer/svg?seed=${encodeURIComponent(m.name)}&backgroundColor=transparent`}
                                  alt={m.name}
                                  className="w-full h-full object-cover"
                                />
                              </div>
                              {i < 3 && (
                                <span className="absolute -top-1 -right-1 text-sm">{rankEmojis[i]}</span>
                              )}
                            </div>
                            <span className="text-white text-xs font-bold text-center leading-tight line-clamp-2">{m.name}</span>
                          </button>
                        );
                      })}
                    </div>

                    <AnimatePresence mode="wait">
                      {selectedDetailedMember && (
                        <motion.div
                          key={selectedDetailedMember}
                          initial={{ opacity: 0, y: 30 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, scale: 0.95 }}
                          transition={{ type: "spring", stiffness: 200, damping: 20 }}
                          className="pt-4"
                        >
                          <DetailedProfileCard 
                            member={members.find(m => m.name === selectedDetailedMember)!} 
                            rank={members.findIndex(m => m.name === selectedDetailedMember) + 1}
                            totalMessages={totalMessages}
                            totalSpeakers={data.total_speakers || members.length}
                          />
                        </motion.div>
                      )}
                    </AnimatePresence>
                    
                    {!selectedDetailedMember && (
                      <div className="text-center py-20 border-2 border-dashed border-white/10 rounded-3xl mt-4">
                        <p className="text-white/30 text-lg font-bold">👆 위에서 멤버를 선택해주세요</p>
                      </div>
                    )}
                  </>
                ) : renderLockedOverlay('detailed')}
                <AdBanner unit="DAN-pK4q1Pq0rfIGc9hN" width={300} height={250} />
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        {/* ── Footer ─────────────────────────────────────────────────────── */}
        <footer className="mt-20 text-center text-white/30 text-sm pb-12 font-medium">
          <p>Kanalyze — AI 카카오톡 분석기</p>
          <p className="mt-2 text-xs">본 분석 결과는 AI에 의해 무작위로 생성된 텍스트이며, 재미 목적 외의 기준으로 사용할 수 없습니다.</p>
        </footer>
      </div>
    </main>
  );
}
