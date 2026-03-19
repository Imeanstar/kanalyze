'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ExternalLink } from 'lucide-react';

interface Edge {
  source: string;
  target: string;
  label: string;
}

interface RelationshipGraphProps {
  edges: Edge[];
}

export default function RelationshipGraph({ edges }: RelationshipGraphProps) {
  const [selectedEdge, setSelectedEdge] = useState<Edge | null>(null);

  if (!Array.isArray(edges) || edges.length === 0) {
    return (
      <div className="py-32 text-center text-emerald-400/50 blink font-bold text-xl">
        결과를 표시할 수 없는 데이터 형식입니다.
        <div className="text-sm mt-2 font-normal">새로 분석을 진행하시면 멋진 관계도를 볼 수 있습니다!</div>
      </div>
    );
  }

  const renderCliRow = (edge: Edge, index: number) => {
    return (
      <motion.button
        key={`${edge.source}-${edge.target}-${index}`}
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: index * 0.05 }}
        onClick={() => setSelectedEdge(edge)}
        className="w-full text-left font-mono text-sm md:text-base px-2 md:px-4 py-3 bg-black/40 hover:bg-violet-900/40 border border-white/5 hover:border-violet-500/50 rounded-lg flex items-center transition-all group overflow-hidden whitespace-nowrap"
      >
        <span className="text-emerald-400 font-bold">[{edge.source}]</span>
        
        {/* Arrow & Label */}
        <div className="flex-1 mx-2 flex items-center justify-center opacity-60 group-hover:opacity-100 group-hover:text-violet-300 transition-all overflow-hidden min-w-[50px]">
          <div className="h-[1px] bg-current flex-1 min-w-[10px]" />
          <span className="px-2 text-[10px] md:text-xs truncate max-w-[100px] md:max-w-none">
            ({edge.label})
          </span>
          <div className="h-[1px] bg-current flex-1 min-w-[10px]" />
          <span className="ml-[-4px]">▶</span>
        </div>

        <span className="text-pink-400 font-bold">[{edge.target}]</span>
        
        <ExternalLink className="w-3 h-3 ml-2 md:ml-3 opacity-0 group-hover:opacity-100 transition-opacity text-white/50 shrink-0 hidden md:block" />
      </motion.button>
    );
  };

  return (
    <div className="w-full flex justify-center py-4">
      {/* CLI Terminal Container */}
      <div className="w-full max-w-3xl bg-[#0d0d12] rounded-xl border border-white/10 shadow-2xl overflow-hidden flex flex-col">
        {/* Terminal Header */}
        <div className="bg-[#1a1a24] px-4 py-2 border-b border-white/5 flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-red-500/80" />
          <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
          <div className="w-3 h-3 rounded-full bg-green-500/80" />
          <span className="ml-2 text-xs font-mono text-white/40">kanalyze_relationship_map.exe</span>
        </div>

        {/* Terminal Body */}
        <div className="p-3 md:p-6 flex flex-col gap-2 max-h-[600px] overflow-y-auto custom-scrollbar">
          {edges.map((edge, i) => renderCliRow(edge, i))}
        </div>
      </div>

      {/* Detail Modal */}
      <AnimatePresence>
        {selectedEdge && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="bg-[#13131e] border border-white/10 rounded-2xl p-6 w-full max-w-md relative shadow-2xl"
            >
              <button
                onClick={() => setSelectedEdge(null)}
                className="absolute top-4 right-4 text-white/40 hover:text-white transition-colors"
                aria-label="닫기"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="flex flex-col items-center mt-4">
                <div className="flex items-center justify-center gap-4 md:gap-8 w-full mb-6">
                  {/* Source Avatar */}
                  <div className="flex flex-col items-center">
                    <div className="w-20 h-20 rounded-full bg-black/50 border-2 border-emerald-500/50 flex items-center justify-center overflow-hidden shadow-[0_0_15px_rgba(16,185,129,0.2)]">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img 
                        src={`https://api.dicebear.com/7.x/adventurer/svg?seed=${encodeURIComponent(selectedEdge.source)}&backgroundColor=transparent`} 
                        alt={selectedEdge.source}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <span className="mt-3 font-bold text-emerald-400">{selectedEdge.source}</span>
                  </div>

                  {/* Icon */}
                  <div className="flex flex-col items-center justify-center px-2 animate-pulse">
                    <span className="text-2xl">⚡</span>
                  </div>

                  {/* Target Avatar */}
                  <div className="flex flex-col items-center">
                    <div className="w-20 h-20 rounded-full bg-black/50 border-2 border-pink-500/50 flex items-center justify-center overflow-hidden shadow-[0_0_15px_rgba(236,72,153,0.2)]">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img 
                        src={`https://api.dicebear.com/7.x/adventurer/svg?seed=${encodeURIComponent(selectedEdge.target)}&backgroundColor=transparent`} 
                        alt={selectedEdge.target}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <span className="mt-3 font-bold text-pink-400">{selectedEdge.target}</span>
                  </div>
                </div>

                <div className="w-full bg-white/5 border border-white/10 rounded-xl p-5 text-center relative overflow-hidden group">
                  <div className="absolute inset-0 bg-gradient-to-br from-violet-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-duration-500" />
                  <p className="text-xs text-white/40 mb-1 font-mono uppercase tracking-widest">Relationship</p>
                  <p className="text-lg md:text-xl font-bold text-white relative z-10">
                    &quot;{selectedEdge.label}&quot;
                  </p>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
