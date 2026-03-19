'use client';

import { motion } from 'framer-motion';
import { Coffee } from 'lucide-react';

export default function SupportButton() {
  return (
    <motion.a
      href="https://toss.me/kanalyze" // Placeholder: user can modify this later
      target="_blank"
      rel="noopener noreferrer"
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      className="inline-flex items-center gap-2 px-5 py-2 rounded-full border border-violet-500/30 bg-violet-500/10 text-violet-300 hover:text-violet-200 hover:border-violet-500/50 hover:bg-violet-500/20 text-sm font-bold transition-all shadow-[0_0_15px_rgba(139,92,246,0.1)]"
    >
      <Coffee className="w-4 h-4" /> 커피 사주기
    </motion.a>
  );
}
