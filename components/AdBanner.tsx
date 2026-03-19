'use client';

import { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';

export default function AdBanner() {
  const scriptElement = useRef<HTMLScriptElement | null>(null);

  useEffect(() => {
    // Inject the Kakao Adfit script dynamically on the client
    const script = document.createElement('script');
    script.setAttribute('src', '//t1.daumcdn.net/kas/static/ba.min.js');
    script.setAttribute('charset', 'utf-8');
    script.setAttribute('async', 'true');
    
    // Get the wrapper and append the script
    const container = document.getElementById('kakao-ad-wrapper');
    if (container && !scriptElement.current) {
      container.appendChild(script);
      scriptElement.current = script;
    }

    return () => {
      // Clean up script on unmount to prevent dupes in React strict mode/routing
      if (scriptElement.current && scriptElement.current.parentNode) {
        scriptElement.current.parentNode.removeChild(scriptElement.current);
        scriptElement.current = null;
      }
    };
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="w-full max-w-[320px] mx-auto my-8 relative group"
    >
      <div className="flex flex-col items-center">
        <span className="text-[10px] font-bold text-white/30 uppercase tracking-[0.2em] mb-1.5 flex items-center justify-center gap-1.5 w-full">
          <div className="h-px bg-white/10 flex-1" />
          Sponsored
          <div className="h-px bg-white/10 flex-1" />
        </span>
        
        {/* Ad Container */}
        <div 
          id="kakao-ad-wrapper" 
          className="min-w-[320px] min-h-[100px] bg-white/[0.02] border border-white/[0.05] rounded-xl flex items-center justify-center relative overflow-hidden transition-all duration-300 group-hover:bg-white/[0.04] group-hover:border-white/10"
        >
          {/* Fallback/Loading state (hidden once ad loads) */}
          <p className="text-white/20 text-xs font-medium absolute z-0 pointer-events-none text-center leading-relaxed">
            광고를 불러오는 중입니다<br/>(AdFit 연동 완료)
          </p>

          {/* Kakao AdFit INS tag */}
          <ins 
            className="kakao_ad_area relative z-10" 
            style={{ display: 'none' }}
            data-ad-unit="DAN-58vQ78e9HE4gxDXl"
            data-ad-width="320"
            data-ad-height="100"
          />
        </div>
      </div>
    </motion.div>
  );
}
