'use client';

import { useMemo, useRef, useEffect, useState } from 'react';
import dynamic from 'next/dynamic';

// Next.js SSR 환경에서 canvas 기반 라이브러리를 안전하게 불러오기 위함
const ForceGraph2D = dynamic(() => import('react-force-graph-2d'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-[500px] flex items-center justify-center text-emerald-400 font-mono animate-pulse">
      [Loading Graph Engine...]
    </div>
  ),
});

interface Edge {
  source: string;
  target: string;
  label: string;
}



interface RelationshipGraphProps {
  edges: Edge[];
}

export default function RelationshipGraph({ edges }: RelationshipGraphProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 800, height: 600 });

  // 화면 크기에 맞게 리사이징
  useEffect(() => {
    if (!containerRef.current) return;
    const updateDimensions = () => {
      setDimensions({
        width: containerRef.current?.offsetWidth || 800,
        height: window.innerWidth < 768 ? 400 : 600,
      });
    };
    
    updateDimensions();
    window.addEventListener('resize', updateDimensions);
    return () => window.removeEventListener('resize', updateDimensions);
  }, []);

  const graphData = useMemo(() => {
    // 노드 추출 (중복 제거)
    const nodeSet = new Set<string>();
    edges.forEach((edge) => {
      nodeSet.add(edge.source);
      nodeSet.add(edge.target);
    });

    const nodes = Array.from(nodeSet).map((id) => ({
      id,
      name: id,
      val: 20, // 노드 크기 (기본값)
    }));

    // 노드별 연결 횟수 계산해 크기에 반영
    edges.forEach((edge) => {
      const sourceNode = nodes.find(n => n.id === edge.source);
      const targetNode = nodes.find(n => n.id === edge.target);
      if (sourceNode) sourceNode.val += 2;
      if (targetNode) targetNode.val += 2;
    });

    return {
      nodes,
      links: edges.map(e => ({ ...e })), // 객체 복사본 전달 (ForceGraph 내부 돌연변이 방지)
    };
  }, [edges]);

  // 관계도 데이터가 올바른 형식이 아닌 경우 (기존 ASCII 아트 등이 들어왔을 때 처리)
  if (!Array.isArray(edges) || edges.length === 0) {
    return (
      <div className="py-32 text-center text-emerald-400/50 blink font-bold text-xl">
        결과를 표시할 수 없는 데이터 형식입니다.
        <div className="text-sm mt-2 font-normal">새로 분석을 진행하시면 멋진 관계도를 볼 수 있습니다!</div>
      </div>
    );
  }

  return (
    <div ref={containerRef} className="w-full h-full min-h-[400px] md:min-h-[600px] rounded-xl overflow-hidden bg-black/40 border border-white/5 relative">
      <div className="absolute top-4 left-4 z-10 bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/10 text-xs text-white/70 font-mono hidden md:block pointer-events-none">
        마우스 휠(Zoom) / 드래그(Pan) / 노드 드래그(Move)
      </div>
      <ForceGraph2D
        width={dimensions.width}
        height={dimensions.height}
        graphData={graphData}
        nodeLabel="name"
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        nodeColor={(node: any) => {
          // 이름 해시를 기반으로 랜덤 색상 부여 (단톡방 멤버별 고유 색상 느낌)
          let hash = 0;
          for (let i = 0; i < (node.id as string).length; i++) {
            hash = (node.id as string).charCodeAt(i) + ((hash << 5) - hash);
          }
          const c = (hash & 0x00ffffff).toString(16).toUpperCase();
          return '#' + '00000'.substring(0, 6 - c.length) + c;
        }}
        nodeRelSize={6}
        linkDirectionalArrowLength={3.5}
        linkDirectionalArrowRelPos={1}
        linkColor={() => 'rgba(255,255,255,0.2)'}
        linkWidth={1.5}
        // 라벨 그리기 커스텀
        linkCanvasObjectMode={() => 'after'}
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        linkCanvasObject={(link: any, ctx: CanvasRenderingContext2D, globalScale: number) => {
          const MAX_FONT_SIZE = 4;
          const start = link.source;
          const end = link.target;
          
          if (!start || !end || start.x === undefined || start.y === undefined || end.x === undefined || end.y === undefined) return; // 초기화 전 방어코드

          // 텍스트 위치 계산 (선의 중앙)
          const textPos = {
            x: start.x + (end.x - start.x) / 2,
            y: start.y + (end.y - start.y) / 2
          };

          const relLink = { x: end.x - start.x, y: end.y - start.y };
          
          let textAngle = Math.atan2(relLink.y, relLink.x);
          // Maintain label upright
          if (textAngle > Math.PI / 2) textAngle = -(Math.PI - textAngle);
          if (textAngle < -Math.PI / 2) textAngle = -(Math.PI + textAngle);

          const label = link.label;
          // Zoom level에 따라 글씨 크기 조절
          const fontSize = Math.max(MAX_FONT_SIZE, 12 / globalScale);
          ctx.font = `${fontSize}px Inter, sans-serif`;
          
          const textWidth = ctx.measureText(label).width;
          const bgDimensions = [textWidth, fontSize].map(n => n + fontSize * 0.2); // 여백

          ctx.save();
          ctx.translate(textPos.x, textPos.y);
          ctx.rotate(textAngle);

          // 배경 그리기
          ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
          ctx.fillRect(-bgDimensions[0] / 2, -bgDimensions[1] / 2, bgDimensions[0], bgDimensions[1]);

          // 텍스트 그리기
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
          ctx.fillText(label, 0, 0);
          ctx.restore();
        }}
        // 노드 커스텀 렌더링 (이름 보이기)
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        nodeCanvasObject={(node: any, ctx: CanvasRenderingContext2D, globalScale: number) => {
          if (node.x === undefined || node.y === undefined) return;

          const label = node.name;
          const fontSize = 14 / globalScale;
          ctx.font = `bold ${fontSize}px Inter, sans-serif`;
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          
          // Image avatar (Lazy loading SVG onto canvas)
          if (!node.img) {
            const img = new Image();
            img.src = `https://api.dicebear.com/7.x/notionists/svg?seed=${encodeURIComponent(node.id)}&backgroundColor=transparent`;
            node.img = img;
          }

          const r = Math.sqrt(Math.max(0, node.val || 1)) * 3 / globalScale; // 노드 반지름
          
          // 배경 원
          ctx.beginPath();
          ctx.arc(node.x, node.y, r, 0, 2 * Math.PI, false);
          ctx.fillStyle = node.color || '#fff';
          ctx.fill();

          // 아바타 그리기
          if (node.img && node.img.complete) {
            ctx.save();
            ctx.beginPath();
            ctx.arc(node.x, node.y, r, 0, 2 * Math.PI, false);
            ctx.clip(); // 원형 마스킹
            ctx.drawImage(node.img, node.x - r, node.y - r, r * 2, r * 2);
            ctx.restore();
          }
          
          // 이름표 배경
          const textWidth = ctx.measureText(label).width;
          const bgWidth = textWidth + (4/globalScale);
          const bgHeight = fontSize + (4/globalScale);
          
          ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
          ctx.fillRect(node.x - bgWidth / 2, node.y + r + (2/globalScale), bgWidth, bgHeight);
          
          // 이름표 텍스트
          ctx.fillStyle = '#ffffff';
          ctx.fillText(label, node.x, node.y + r + (bgHeight/2) + (2/globalScale));
        }}
      />
    </div>
  );
}
