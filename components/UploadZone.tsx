'use client';

import { useCallback, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, FileText, AlertCircle } from 'lucide-react';
import { PARSER_WORKER_CODE } from '@/lib/parserWorkerCode';

interface UploadZoneProps {
  onParsingStart: () => void;
  onParsingProgress: (stage: 'reading' | 'parsing' | 'done') => void;
  onParseComplete: (data: { group_stats: object; top10: object[] }) => void;
  onError: (msg: string) => void;
}

export default function UploadZone({
  onParsingStart,
  onParsingProgress,
  onParseComplete,
  onError,
}: UploadZoneProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  const processFile = useCallback(
    (file: File) => {
      if (!file.name.endsWith('.txt')) {
        const msg = '.txt 파일만 업로드할 수 있어요.';
        setErrorMsg(msg);
        onError(msg);
        return;
      }
      setErrorMsg('');
      onParsingStart();

      // Create Web Worker via Blob URL (Next.js App Router compatible)
      const blob = new Blob([PARSER_WORKER_CODE], { type: 'application/javascript' });
      const workerUrl = URL.createObjectURL(blob);
      const worker = new Worker(workerUrl);

      worker.onmessage = (e: MessageEvent) => {
        const { type, stage, payload, message } = e.data;
        if (type === 'progress') {
          onParsingProgress(stage);
        } else if (type === 'result') {
          worker.terminate();
          onParseComplete(payload);
        } else if (type === 'error') {
          worker.terminate();
          const errMsg = message || '파싱 중 오류가 발생했습니다.';
          setErrorMsg(errMsg);
          onError(errMsg);
        }
      };

      worker.onerror = (e) => {
        worker.terminate();
        const errMsg = `Worker 오류: ${e.message}`;
        setErrorMsg(errMsg);
        onError(errMsg);
      };

      worker.postMessage(file);
    },
    [onParsingStart, onParsingProgress, onParseComplete, onError]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      setIsDragging(false);
      const file = e.dataTransfer.files[0];
      if (file) processFile(file);
    },
    [processFile]
  );

  const handleFileInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) processFile(file);
    },
    [processFile]
  );

  return (
    <div className="w-full max-w-xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className={`relative border-2 border-dashed rounded-2xl p-12 text-center cursor-pointer transition-all duration-200 ${
          isDragging
            ? 'border-violet-400 bg-violet-500/10 scale-[1.02]'
            : 'border-white/20 bg-white/5 hover:border-violet-400/60 hover:bg-violet-500/5'
        }`}
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
      >
        <input
          ref={inputRef}
          type="file"
          accept=".txt"
          className="hidden"
          onChange={handleFileInput}
        />

        <motion.div
          animate={{ y: isDragging ? -6 : 0 }}
          transition={{ type: 'spring', stiffness: 300 }}
          className="flex flex-col items-center gap-4"
        >
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-violet-500 to-pink-500 flex items-center justify-center shadow-lg shadow-violet-500/30">
            {isDragging ? (
              <FileText className="w-8 h-8 text-white" />
            ) : (
              <Upload className="w-8 h-8 text-white" />
            )}
          </div>

          <div>
            <p className="text-white font-semibold text-lg">
              {isDragging ? '놓아서 업로드' : '카카오톡 대화 파일 업로드'}
            </p>
            <p className="text-white/50 text-sm mt-1">
              .txt 파일을 드래그하거나 클릭해서 선택하세요
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs text-white/30 mt-2">
            <span className="w-2 h-2 rounded-full bg-green-400 inline-block" />
            최대 50MB · 모든 분석은 브라우저에서 처리됩니다
          </div>
        </motion.div>
      </motion.div>

      <AnimatePresence>
        {errorMsg && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="mt-3 flex items-center gap-2 text-red-400 text-sm bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3"
          >
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            {errorMsg}
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="mt-6 bg-white/5 border border-white/10 rounded-xl p-4 text-sm text-white/40 space-y-1"
      >
        <p className="font-medium text-white/60 mb-2">📱 파일 내보내기 방법</p>
        <p>카카오톡 채팅방 → 우상단 메뉴 → 대화 내용 내보내기 → .txt</p>
      </motion.div>
    </div>
  );
}
