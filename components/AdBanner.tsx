'use client';

import { motion } from 'framer-motion';

export default function AdBanner() {
  return (
    <div className="w-full my-8">
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="w-full p-4 rounded-2xl bg-white/[0.02] border border-white/5 flex flex-col items-center justify-center relative overflow-hidden group hover:border-white/10 transition-colors"
      >
        {/* Subtle background pattern */}
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:20px_20px]" />
        
        <div className="flex flex-col items-center py-4">
          <span className="text-[10px] font-bold text-white/20 uppercase tracking-[0.2em] mb-3">Advertisement / Sponsor</span>
          <div className="w-full h-24 md:h-28 flex items-center justify-center border-2 border-dashed border-white/5 rounded-xl group-hover:border-white/10 transition-all">
            <p className="text-white/15 text-sm font-medium tracking-tight">여기에 광고가 표시됩니다</p>
          </div>
          <p className="mt-3 text-[10px] text-white/20 font-medium">광고 수익은 AI 서버 유지비로 사용됩니다</p>
        </div>
      </motion.div>
    </div>
  );
}
