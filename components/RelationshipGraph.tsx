'use client';

import { motion } from 'framer-motion';

interface Top10Member {
  name: string;
  message_count: number;
  mentions?: Record<string, number>;
}

interface RelationshipGraphProps {
  aiSummary: string;
  members: Top10Member[];
}

export default function RelationshipGraph({ aiSummary, members }: RelationshipGraphProps) {
  // Extract only clean text lines (not ASCII-art symbol lines)
  const lines = (aiSummary || '').split('\n').filter(l => l.trim().length > 0);
  const quote = lines.find(l => !/^[\s/\\|\-.()[\]─━┃+*=<>]+$/.test(l)) || '대화 속에서 피어난 끈끈한 관계들입니다.';

  // Calculate pair interaction counts
  const edgesMap: Record<string, number> = {};
  const incomingMentions: Record<string, number> = {};

  members.forEach(m => {
    if (!m.mentions) return;
    Object.entries(m.mentions).forEach(([target, count]) => {
      const pair = [m.name, target].sort().join('|||');
      edgesMap[pair] = (edgesMap[pair] || 0) + count;
      incomingMentions[target] = (incomingMentions[target] || 0) + count;
    });
  });

  const topDuos = Object.entries(edgesMap)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([pairStr, count]) => {
      const [p1, p2] = pairStr.split('|||');
      return { p1, p2, count };
    });

  const topMentioned = Object.entries(incomingMentions)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([name, count]) => ({ name, count }));

  if (topDuos.length === 0) {
    return (
      <div className="py-20 text-center text-white/50">
        충분한 대화 데이터가 없어 관계도를 구성하지 못했습니다.
      </div>
    );
  }

  const podiumColors = [
    'from-yellow-400 to-orange-500',
    'from-slate-300 to-slate-500',
    'from-amber-600 to-amber-800',
  ];

  return (
    <div className="w-full max-w-4xl mx-auto flex flex-col gap-16 py-8">
      {/* AI Quote */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative bg-white/[0.03] border border-white/10 rounded-2xl p-6 md:p-10 text-center shadow-lg mx-4"
      >
        <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#0f111a] px-4 py-0.5 text-xs font-bold text-violet-400 tracking-widest border border-violet-500/30 rounded-full">
          AI 관계 요약
        </div>
        <p className="text-[15px] md:text-lg font-medium text-emerald-300 italic leading-relaxed break-keep-all">
          &quot;{quote}&quot;
        </p>
      </motion.div>

      {/* Top 5 Duos */}
      <div className="px-2">
        <div className="flex items-center justify-center gap-3 mb-8">
          <span className="text-2xl">🔥</span>
          <h3 className="text-2xl font-black bg-clip-text text-transparent bg-gradient-to-r from-pink-400 to-violet-400">
            베스트 케미 TOP 5
          </h3>
          <span className="text-2xl">🔥</span>
        </div>

        <div className="flex flex-col gap-4">
          {topDuos.map((duo, i) => (
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.1 }}
              key={i}
              className="flex items-center justify-between p-4 md:p-6 rounded-2xl bg-white/[0.02] border border-white/[0.05] hover:bg-white/[0.06] hover:border-white/20 transition-all relative overflow-hidden"
            >
              {/* Rank */}
              <div className="absolute top-0 left-0 bottom-0 w-12 md:w-16 bg-white/[0.02] flex items-center justify-center border-r border-white/5">
                <span className={`text-xl md:text-2xl font-black ${i === 0 ? 'text-yellow-400 drop-shadow-[0_0_5px_rgba(250,204,21,0.8)]' : 'text-white/20'}`}>
                  {i + 1}
                </span>
              </div>

              <div className="flex items-center justify-between w-full pl-16 md:pl-20">
                {/* Person 1 */}
                <div className="flex flex-col items-center gap-2 w-20 md:w-24">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={`https://api.dicebear.com/7.x/adventurer/svg?seed=${encodeURIComponent(duo.p1)}&backgroundColor=transparent`} alt="" className="w-12 h-12 md:w-16 md:h-16 rounded-full bg-white/10" />
                  <span className="text-xs md:text-sm font-bold text-white max-w-[80px] lg:max-w-full truncate text-center">{duo.p1}</span>
                </div>

                {/* Connection Line */}
                <div className="flex-1 flex flex-col items-center px-2 md:px-6">
                  <span className="text-[10px] md:text-xs font-bold text-violet-400 mb-1.5 bg-violet-400/10 px-2 py-0.5 rounded-full border border-violet-400/20">
                    {duo.count}회 상호작용
                  </span>
                  {/* Track: endpoint dots + laser rail */}
                  <div className="w-full relative h-6 flex items-center">
                    <div className="w-2 h-2 rounded-full bg-violet-500/60 absolute left-0 z-10" />
                    {/* Static rail */}
                    <div className="absolute left-3 right-3 h-px bg-gradient-to-r from-violet-500/20 via-pink-500/40 to-violet-500/20" />
                    {/* Laser — animates by `left` so it travels the full track */}
                    <div className="absolute left-3 right-3 overflow-hidden h-4 flex items-center">
                      <motion.div
                        animate={{ left: ['-10%', '110%'] }}
                        transition={{
                          duration: 2 + i * 0.4,
                          repeat: Infinity,
                          ease: 'linear',
                          delay: i * 0.45,
                        }}
                        className="absolute w-10 h-px bg-gradient-to-r from-transparent via-white to-transparent shadow-[0_0_8px_2px_rgba(255,255,255,0.9)]"
                      />
                    </div>
                    <div className="w-2 h-2 rounded-full bg-pink-500/60 absolute right-0 z-10" />
                  </div>
                </div>

                {/* Person 2 */}
                <div className="flex flex-col items-center gap-2 w-20 md:w-24">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={`https://api.dicebear.com/7.x/adventurer/svg?seed=${encodeURIComponent(duo.p2)}&backgroundColor=transparent`} alt="" className="w-12 h-12 md:w-16 md:h-16 rounded-full bg-white/10" />
                  <span className="text-xs md:text-sm font-bold text-white max-w-[80px] lg:max-w-full truncate text-center">{duo.p2}</span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Most Mentioned */}
      {topMentioned.length > 0 && (
        <div className="mt-4 mb-12">
          {/* mb-40 gives enough room below h3 for the bouncing crown (-top-16 + 10px bounce) */}
          <div className="flex items-center justify-center gap-3 mb-40">
            <span className="text-2xl">👑</span>
            <h3 className="text-2xl font-black text-yellow-400 drop-shadow-[0_0_5px_rgba(250,204,21,0.5)]">
              단톡방의 중심 (인싸 랭킹)
            </h3>
            <span className="text-2xl">👑</span>
          </div>

          <div className="flex items-end justify-center gap-2 md:gap-4 h-64">
            {[1, 0, 2].map(orderedIndex => {
              const user = topMentioned[orderedIndex];
              if (!user) return <div key={orderedIndex} className="w-24 md:w-32" />;

              const isFirst = orderedIndex === 0;
              const height = isFirst ? 'h-40' : orderedIndex === 1 ? 'h-32' : 'h-24';
              const gradient = podiumColors[orderedIndex];
              const rankStr = isFirst ? '1위' : orderedIndex === 1 ? '2위' : '3위';

              return (
                <motion.div
                  initial={{ opacity: 0, y: 50 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 + orderedIndex * 0.1 }}
                  key={user.name}
                  className="flex flex-col items-center relative w-24 md:w-32"
                >
                  {isFirst && (
                    <motion.span
                      animate={{ y: [0, -10, 0] }}
                      transition={{ repeat: Infinity, duration: 2 }}
                      className="absolute -top-16 text-4xl drop-shadow-[0_0_10px_rgba(250,204,21,0.8)]"
                    >
                      👑
                    </motion.span>
                  )}

                  <div className="flex flex-col items-center gap-2 mb-3 relative z-10">
                    <div className={`rounded-full bg-white/10 border-2 overflow-hidden shadow-2xl ${isFirst ? 'w-20 h-20 border-yellow-400' : 'w-16 h-16 border-white/20'}`}>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={`https://api.dicebear.com/7.x/adventurer/svg?seed=${encodeURIComponent(user.name)}&backgroundColor=transparent`} alt="" className="w-full h-full object-cover" />
                    </div>
                  </div>

                  <div className={`w-full ${height} bg-gradient-to-t ${gradient} rounded-t-2xl flex flex-col items-center justify-start pt-4 shadow-[inset_0_5px_15px_rgba(255,255,255,0.2),_0_0_20px_rgba(0,0,0,0.5)] border border-white/10 border-b-0 relative overflow-hidden`}>
                    <div className="absolute inset-0 bg-white/5" />
                    <span className="font-black text-white text-lg md:text-xl drop-shadow-md relative z-10">{rankStr}</span>
                  </div>

                  <div className="w-[120%] bg-[#1a1c29] mt-3 py-2 md:py-3 rounded-xl text-center border border-white/10 shadow-lg relative z-20">
                    <div className="text-[11px] md:text-sm font-bold text-white truncate px-2">{user.name}</div>
                    <div className="text-[10px] md:text-xs font-medium text-emerald-400 mt-0.5">{user.count}회 언급됨</div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
