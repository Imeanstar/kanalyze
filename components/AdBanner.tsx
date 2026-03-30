'use client';

import { useEffect, useRef, useId, useState } from 'react';
import { motion } from 'framer-motion';

interface AdBannerProps {
  unit?: string;
  width?: number;
  height?: number;
}

export default function AdBanner({
  unit = 'DAN-58vQ78e9HE4gxDXl',
  width = 320,
  height = 100,
}: AdBannerProps) {
  const scriptElement = useRef<HTMLScriptElement | null>(null);
  const idValue = useId().replace(/:/g, '');
  const wrapperId = `kakao-ad-${idValue}`;
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    // Inject the Kakao Adfit script dynamically on the client
    const script = document.createElement('script');
    script.setAttribute('src', '//t1.daumcdn.net/kas/static/ba.min.js');
    script.setAttribute('charset', 'utf-8');
    script.setAttribute('async', 'true');
    
    // Get the wrapper and append the script
    const container = document.getElementById(wrapperId);
    if (container && !scriptElement.current) {
      container.appendChild(script);
      scriptElement.current = script;
      // Mark as loaded slightly after mount to hide fallback
      setTimeout(() => setIsLoaded(true), 1500);
    }

    return () => {
      // Clean up script on unmount to prevent dupes in React strict mode/routing
      if (scriptElement.current && scriptElement.current.parentNode) {
        scriptElement.current.parentNode.removeChild(scriptElement.current);
        scriptElement.current = null;
      }
    };
  }, [wrapperId]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      style={{ maxWidth: width }}
      className="w-full mx-auto my-8 relative group"
    >
      <div className="flex flex-col items-center">
        <span className="text-[10px] font-bold text-white/30 uppercase tracking-[0.2em] mb-1.5 flex items-center justify-center gap-1.5 w-full">
          <div className="h-px bg-white/10 flex-1" />
          Sponsored
          <div className="h-px bg-white/10 flex-1" />
        </span>
        
        {/* Ad Container */}
        <div 
          id={wrapperId}
          style={{ minWidth: width, minHeight: height }}
          className="bg-white/[0.02] border border-white/[0.05] flex items-center justify-center relative transition-all duration-300 group-hover:bg-white/[0.04] group-hover:border-white/10"
        >
          {/* Fallback/Loading state (hidden once ad loads) */}
          {!isLoaded && (
            <p className="text-white/20 text-xs font-medium absolute z-0 pointer-events-none text-center leading-relaxed">
              광고를 불러오는 중입니다<br/>(AdFit 연동 완료)
            </p>
          )}

          {/* Kakao AdFit INS tag */}
          <ins 
            className="kakao_ad_area relative z-10" 
            style={{ display: 'none' }}
            data-ad-unit={unit}
            data-ad-width={width}
            data-ad-height={height}
          />
        </div>
      </div>
    </motion.div>
  );
}
