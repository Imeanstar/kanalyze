'use client';

interface RelationshipGraphProps {
  // Can be string (new API) or array (old API)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  edges: any;
}

/**
 * 설명 텍스트(초록)와 ASCII 아트(흰색)를 분리합니다.
 * AI가 생성하는 relationship_map 형식:
 *   [2~3줄 관계 해석 텍스트]
 *   [빈 줄]
 *   [ASCII 아트 다이어그램]
 */
function splitDescriptionAndArt(content: string): { description: string; art: string } {
  const lines = content.split('\n');

  // 1순위: 첫 번째 빈 줄을 구분점으로 사용
  const blankIdx = lines.findIndex(l => l.trim() === '');
  if (blankIdx > 0) {
    const description = lines.slice(0, blankIdx).join('\n').trim();
    // 빈 줄 이후부터 art (선두 빈 줄 제거)
    let artStart = blankIdx + 1;
    while (artStart < lines.length && lines[artStart].trim() === '') artStart++;
    const art = lines.slice(artStart).join('\n');
    if (description && art) return { description, art };
  }

  // 2순위: 빈 줄 없으면 ASCII 아트 시작 줄을 탐지
  for (let i = 1; i < lines.length; i++) {
    const raw = lines[i];
    const t = raw.trim();
    if (!t) continue;

    // 거의 기호/공백만으로 이루어진 줄 (순수 아트 라인)
    if (/^[\s/\\|\-.()\[\]─━┃+*=<>]+$/.test(raw)) {
      return { description: lines.slice(0, i).join('\n').trim(), art: lines.slice(i).join('\n') };
    }
    // [이름] 형태로 시작하는 노드 라인
    if (/^\s*\[/.test(raw)) {
      return { description: lines.slice(0, i).join('\n').trim(), art: lines.slice(i).join('\n') };
    }
  }

  // 분리 불가: 전체를 아트로 처리
  return { description: '', art: content };
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

  // Ensure robust unescaping: \\ → \ must come first, then \n → newline
  const displayContent = content
    .replace(/\\\\/g, '\\')
    .replace(/\\n/g, '\n')
    .replace(/\\"/g, '"');

  const { description, art } = splitDescriptionAndArt(displayContent);

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
        <div className="p-4 md:p-8 overflow-x-auto custom-scrollbar bg-[#0f111a]">
          {/* 설명 텍스트: 초록색 터미널 스타일 */}
          {description && (
            <p className="font-mono text-[13px] md:text-[15px] leading-relaxed text-emerald-400 drop-shadow-[0_0_2px_rgba(52,211,153,0.8)] mb-6 whitespace-pre-wrap">
              {description}
            </p>
          )}
          {/* ASCII 아트: 흰색 고정폭 */}
          {art && (
            <pre
              className="font-mono text-[12px] md:text-[15px] leading-[1.6] text-[#e2e8f0] tracking-wider whitespace-pre"
              style={{ fontFamily: "'Fira Code', 'Consolas', monospace" }}
            >
              {art}
            </pre>
          )}
        </div>
      </div>
    </div>
  );
}
