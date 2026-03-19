'use client';

interface RelationshipGraphProps {
  // Can be string (new API) or array (old API)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  edges: any;
}

export default function RelationshipGraph({ edges }: RelationshipGraphProps) {
  if (!edges || (Array.isArray(edges) && edges.length === 0)) {
    return (
      <div className="py-32 text-center text-emerald-400/50 font-bold text-xl">
        결과를 표시할 수 없는 데이터 형식입니다.
        <div className="text-sm mt-2 font-normal">새로 분석을 진행하시면 멋진 관계도를 볼 수 있습니다!</div>
      </div>
    );
  }

  // Handle older array-based data gracefully by mapping to text
  let content = '';
  if (Array.isArray(edges)) {
    content = edges.map(e => `[${e.source}] ────(${e.label})────▶ [${e.target}]`).join('\n');
  } else if (typeof edges === 'string') {
    content = edges;
  } else {
    content = JSON.stringify(edges, null, 2);
  }

  // Ensure robust unescaping of newlines
  const displayContent = content.replace(/\\n/g, '\n').replace(/\\"/g, '"');

  return (
    <div className="w-full flex justify-center py-4">
      {/* CLI Terminal Container */}
      <div className="w-full max-w-4xl bg-[#0d0d12] rounded-xl border border-white/10 shadow-2xl overflow-hidden flex flex-col">
        {/* Terminal Header */}
        <div className="bg-[#1a1a24] px-4 py-2 border-b border-white/5 flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-red-500/80" />
          <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
          <div className="w-3 h-3 rounded-full bg-green-500/80" />
          <span className="ml-2 text-xs font-mono text-white/40">kanalyze_relationship_map.txt</span>
        </div>

        {/* Terminal Body */}
        <div className="p-4 md:p-8 flex flex-col gap-2 max-h-[800px] overflow-x-auto overflow-y-auto custom-scrollbar bg-[#0f111a]">
          <pre className="font-mono text-[12px] md:text-[15px] leading-[1.6] text-[#e2e8f0] tracking-wider whitespace-pre" style={{ fontFamily: "'Fira Code', 'Consolas', monospace" }}>
            {displayContent}
          </pre>
        </div>
      </div>
    </div>
  );
}
