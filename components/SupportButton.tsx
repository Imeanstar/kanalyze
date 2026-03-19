'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, Copy, Check, X } from 'lucide-react';

export default function SupportButton() {
  const [isOpen, setIsOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const accountInfo = "1000-4845-5561";
  const bank = "토스뱅크";
  const name = "김민성";

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(accountInfo);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  return (
    <>
      <motion.button
        onClick={() => setIsOpen(true)}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="inline-flex items-center gap-2 px-5 py-2 rounded-full border border-violet-500/30 bg-violet-500/10 text-violet-300 hover:text-violet-200 hover:border-violet-500/50 hover:bg-violet-500/20 text-sm font-bold transition-all shadow-[0_0_15px_rgba(139,92,246,0.1)]"
      >
        <Heart className="w-4 h-4 fill-violet-400" /> 서버비 일조하기
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="bg-[#13131e] border border-white/10 rounded-2xl p-6 w-full max-w-sm relative shadow-2xl"
            >
              <button
                onClick={() => setIsOpen(false)}
                className="absolute top-4 right-4 text-white/40 hover:text-white transition-colors"
                aria-label="닫기"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="flex flex-col items-center text-center mt-2">
                <div className="w-12 h-12 rounded-full bg-blue-500/20 flex items-center justify-center mb-4">
                  <Heart className="w-6 h-6 text-blue-400 fill-blue-400" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">서버비 후원하기</h3>
                <p className="text-white/60 text-sm mb-6 leading-relaxed">
                  Kanalyze는 무료로 운영됩니다.<br />
                  서비스 유지에 큰 힘이 됩니다! 🚀
                </p>

                <div className="w-full bg-white/5 rounded-xl p-4 border border-white/5 relative overflow-hidden group">
                  {/* Subtle highlight gradient */}
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-xs text-white/50">{bank}</span>
                    <span className="text-xs font-medium text-white/70">{name}</span>
                  </div>
                  <div className="flex items-center justify-between mt-2">
                    <span className="font-mono text-lg tracking-wider text-blue-300">{accountInfo}</span>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={handleCopy}
                      className={`flex items-center justify-center w-8 h-8 rounded-lg transition-colors ${
                        copied ? 'bg-emerald-500/20 text-emerald-400' : 'bg-white/10 text-white/60 hover:bg-white/20 hover:text-white'
                      }`}
                      title="계좌번호 복사"
                    >
                      {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    </motion.button>
                  </div>
                </div>

                <AnimatePresence>
                  {copied && (
                    <motion.p
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      className="text-emerald-400 text-xs font-medium mt-3 absolute bottom-3"
                    >
                      ✅ 계좌번호가 복사되었습니다!
                    </motion.p>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
