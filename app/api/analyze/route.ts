import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';
import { supabase } from '@/lib/supabase';

// Vercel/Next.js 타임아웃 연장 (재시도 대기 포함 최대 5분)
export const maxDuration = 300;


// ── Types ─────────────────────────────────────────────────────────────────────

interface Top10Member {
  name: string;
  message_count: number;
  active_time: string;
  samples: string[];
  mentions?: Record<string, number>;
}

interface GroupStats {
  total_messages: number;
  total_speakers: number;
  others_message_count?: number;
  date_range: string;
}

interface ParsedPayload {
  group_stats: GroupStats;
  top10: Top10Member[];
}

// ── Gemini client ─────────────────────────────────────────────────────────────

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY!,
});

// ── Prompt builder (경량화 버전) ───────────────────────────────────────────────
// 수정된 부분: 샘플 200줄 → 80줄로 축소, 불필요한 프롬프트 설명 제거

const SAMPLE_LINES = 80; // 멤버당 최대 샘플 줄 수

function buildGroupSummaryPrompt(group_stats: GroupStats, top10: Top10Member[]): string {
  const mentionsText = top10.map(m => {
    if (!m.mentions) return '';
    const sortedMentions = Object.entries(m.mentions).sort((a,b) => b[1] - a[1]).slice(0, 3);
    if (sortedMentions.length === 0) return '';
    const mentionsStr = sortedMentions.map(([name, count]) => `${name}(${count}회)`).join(', ');
    return `- [${m.name}]님이 많이 언급한 사람: ${mentionsStr}`;
  }).filter(Boolean).join('\n');

  return `당신은 날카롭고 유머러스한 심리 분석가입니다. 아래 카카오톡 단체채팅방 데이터를 보고 전체 분위기를 한 줄로 요약하고, 멤버 간의 관계도를 ASCII 아트로 그려주세요.
채팅방: ${group_stats.total_messages.toLocaleString()}개 메시지 / ${group_stats.total_speakers}명 / ${group_stats.date_range}

[멤버 간 언급 횟수 (관계도 참고용)]
${mentionsText}

위의 언급 횟수를 바탕으로 각 멤버가 누구와 가장 친하고 연결되어 있는지 분석하여, 두 사람 간의 관계를 정의해주세요.
중요: 두 사람 간의 관계를 설명하는 짧은 텍스트 라벨을 반드시 추가해주세요. (예시: "영양제 추천", "잔소리 담당")

아래 JSON 형식으로만 응답하세요 (설명 없이 JSON만. 코드 블록(\`\`\`json) 기호도 절대 쓰지 말고 오직 순수 JSON 텍스트 상태로 반환하세요. 내부 문자열의 따옴표(")나 줄바꿈(\n)은 반드시 JSON 문법에 맞게 백슬래시(\)로 이스케이프 처리하세요):
{ 
  "group_summary": "단톡방 전체 분위기 한 줄 요약 (재미있고 날카롭게)",
  "relationship_map": [
    { "source": "A이름", "target": "B이름", "label": "짧은 관계 설명" },
    { "source": "C이름", "target": "D이름", "label": "짧은 관계 설명" }
  ]
}`;
}

function buildMemberPrompt(m: Top10Member): string {
  return `당신은 날카롭고 유머러스한 심리 분석가입니다. 아래 멤버의 대화 샘플을 분석해주세요.

멤버: [${m.name}] (메시지 ${m.message_count.toLocaleString()}개, 주활동 ${m.active_time})
대화 샘플:
${m.samples.slice(0, SAMPLE_LINES).join('\n')}

이 멤버의 성격을 아주 깊이 있게 분석해서, 디테일한 보고서 형식의 장문 마크다운(Markdown) 텍스트를 작성해주세요.
반드시 포함할 내용: 핵심 정체성, 유머 감각, 감정 표현, 정보 공유 성향, 친근한 말투 등 5~7개 항목.
각 항목마다 대화 샘플에서 찾은 실제 대사를 직접 인용해서 뒷받침해주세요. 

아래 JSON 형식으로만 응답하세요 (설명 없이 JSON만. 코드 블록(\`\`\`json) 기호도 절대 쓰지 말고 오직 순수 JSON 텍스트 상태로 반환하세요. 문자열 내부의 따옴표나 줄바꿈은 반드시 JSON 규칙에 맞게 이스케이프 처리하세요):
{
  "name": "${m.name}",
  "title": "이 사람을 한마디로 표현하는 직함 (예: 팀의 정신적 지주, 팩트폭격기)",
  "detailed_markdown": "작성한 마크다운 보고서 전체 내용 (줄바꿈은 \\n 으로 이스케이프 처리할 것)"
}`;
}

// v1beta API 실제 조회로 확인된 모델 목록
const MODELS = [
  'gemini-2.5-flash',       // 1순위: 최신 + 빠름 + 고품질
  'gemini-2.0-flash',       // 2순위: stable 폴백
  'gemini-flash-latest',    // 3순위: latest alias
];

// 에러 메시지에서 실제 대기 시간(초) 파싱
function parseRetryDelay(err: unknown): number {
  if (!(err instanceof Error)) return 35;
  const match = err.message.match(/"retryDelay":\s*"(\d+(?:\.\d+)?)s"/);
  if (match) return Math.ceil(parseFloat(match[1])) + 5; // 여유 5초 추가
  return 35;
}

// 수정된 부분: 실제 retryDelay 사용 + 모델별 폴백
async function generateWithRetry(prompt: string): Promise<string> {
  for (const model of MODELS) {
    let lastErr: unknown;
    for (let attempt = 0; attempt < 2; attempt++) {
      try {
        const response = await ai.models.generateContent({
          model,
          contents: prompt,
          config: { 
            temperature: 0.85, 
            maxOutputTokens: 8192,
            // v1 API에서는 responseMimeType 미지원으로 제거
          },
        });
        return response.text ?? '';
      } catch (err: unknown) {
        lastErr = err;
        const is429 =
          err instanceof Error &&
          (err.message.includes('429') || err.message.includes('RESOURCE_EXHAUSTED'));

        if (is429 && attempt === 0) {
          const waitSec = parseRetryDelay(err);
          console.log(`[${model}] Rate limit. Retrying in ${waitSec}s...`);
          await new Promise((r) => setTimeout(r, waitSec * 1000));
          continue;
        }
        // 404(모델 없음)이거나 2회 재시도 모두 실패 → 다음 모델로 폴백
        console.log(`[${model}] Failed (${attempt + 1}/2). Error: ${err instanceof Error ? err.message : String(err)}. Trying next model...`);
        break;
      }
    }
    // 마지막 모델까지 실패하면 마지막 에러 throw
    if (model === MODELS[MODELS.length - 1] && lastErr) throw lastErr;
  }
  throw new Error('모든 모델에서 분석 실패. 잠시 후 다시 시도해주세요.');
}


// 더 강력한 JSON 추출 헬퍼 함수
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function extractJsonString(rawText: string): any {
  let jsonString = rawText.trim();
  
  // 1. Remove markdown code blocks if present
  const mdMatch = jsonString.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (mdMatch) {
    jsonString = mdMatch[1].trim();
  } else if (jsonString.startsWith('```')) {
    jsonString = jsonString.replace(/^```(?:json)?/i, '').replace(/```$/, '').trim();
  }

  // 2. Extract strictly from first '{' to last '}'
  const firstBrace = jsonString.indexOf('{');
  const lastBrace = jsonString.lastIndexOf('}');
  if (firstBrace !== -1 && lastBrace !== -1) {
    jsonString = jsonString.substring(firstBrace, lastBrace + 1);
  }

  // 먼저 정상적인 파싱 시도
  try {
    return JSON.parse(jsonString);
  } catch {
    // 실패 시, 정규식을 사용하여 휴리스틱하게 키-값 추출 시도
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const result: any = {};
    
    // 이스케이프되지 않은 따옴표 처리를 위한 헬퍼 정규식 및 indexOf 조합
    const extractStringField = (key: string, isLast: boolean = false) => {
      const marker = `"${key}"`;
      const keyIdx = jsonString.indexOf(marker);
      if (keyIdx === -1) return null;
      
      const colonIdx = jsonString.indexOf(':', keyIdx + marker.length);
      if (colonIdx === -1) return null;
      
      const startQuoteIdx = jsonString.indexOf('"', colonIdx);
      if (startQuoteIdx === -1) return null;
      
      // 값의 안쪽 내용은 startQuoteIdx + 1 부터 시작
      const rest = jsonString.substring(startQuoteIdx + 1);
      
      let endIdx = -1;
      if (isLast) {
        // 마지막 필드인 경우 (주로 relationship_map이나 detailed_markdown)
        // json 파싱 실패를 감안하여 제일 마지막에 등장하는 " } 또는 "\n} 문자열의 패턴을 찾음
        const lastBraceMatch = [...rest.matchAll(/"\s*}/g)].pop();
        if (lastBraceMatch && lastBraceMatch.index !== undefined) {
          endIdx = lastBraceMatch.index;
        }
      } else {
        // 중간 필드인 경우 (group_summary, name, title 등)
        // 다음 키가 시작되는 패턴 ", " 또는 ",\n" 을 찾음
        const nextCommaMatch = rest.match(/"\s*,\s*"/);
        if (nextCommaMatch && nextCommaMatch.index !== undefined) {
          endIdx = nextCommaMatch.index;
        }
      }
      
      if (endIdx !== -1 && endIdx !== undefined) {
        return rest.substring(0, endIdx).replace(/\\n/g, '\n').replace(/\\"/g, '"');
      }
      // 실패 시 끝까지
      return rest.replace(/\\n/g, '\n').replace(/\\"/g, '"');
    };

    // group summary payload fields
    if (jsonString.includes('"group_summary"')) {
      const gs = extractStringField('group_summary');
      if (gs) result.group_summary = gs;
      
      const rmMatch = jsonString.match(/"relationship_map"\s*:\s*(\[[\s\S]*?\])/);
      if (rmMatch) {
        try {
          result.relationship_map = JSON.parse(rmMatch[1]);
        } catch {
          result.relationship_map = []; // If array extraction fails, fallback to empty
        }
      } else {
        const rmStringFallback = extractStringField('relationship_map', true);
        if (rmStringFallback) result.relationship_map = rmStringFallback;
      }
    }
    
    // member payload fields
    if (jsonString.includes('"detailed_markdown"')) {
      const n = extractStringField('name');
      if (n) result.name = n;
      
      const t = extractStringField('title');
      if (t) result.title = t;
      
      const dm = extractStringField('detailed_markdown', true);
      if (dm) result.detailed_markdown = dm;
      else {
        // Fallback for detailed markdown which is often the last field and longest
        const match = jsonString.match(/"detailed_markdown"\s*:\s*"([\s\S]*?)(?:"\s*}|}$)/);
        if (match) result.detailed_markdown = match[1].replace(/\\n/g, '\n').replace(/\\"/g, '"');
      }
    }
    
    return result;
  }
}

// ── API Route ─────────────────────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  try {
    const body: ParsedPayload = await req.json();
    const { group_stats, top10 } = body;

    if (!top10 || top10.length === 0) {
      return NextResponse.json({ error: '분석할 데이터가 없습니다.' }, { status: 400 });
    }
    // 1. 단체방 요약 및 관계도 (1회 호출)
    const summaryPrompt = buildGroupSummaryPrompt(group_stats, top10);
    const summaryRaw = await generateWithRetry(summaryPrompt);
    let groupSummary = "즐겁고 활기찬 대화가 오가는 단톡방입니다.";
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let relationshipMap: any = []; // 기본값을 빈 배열로 변경
    try {
      const parsed = extractJsonString(summaryRaw);
      if (parsed.group_summary) groupSummary = parsed.group_summary;
      if (parsed.relationship_map) relationshipMap = parsed.relationship_map;
    } catch {
      console.error('Group summary parse failed. Falling back to default string.');
    }

    // 2. 멤버별 개별 분석 (병렬 호출, 에러 발생 시 해당 멤버만 기본값 처리)
    const memberPromises = top10.map(async (member) => {
      try {
        const prompt = buildMemberPrompt(member);
        const rawText = await generateWithRetry(prompt);
        const parsed = extractJsonString(rawText);
        return {
          ...parsed,
          name: parsed.name || member.name, 
          message_count: member.message_count,
        };
      } catch (err) {
        console.error(`Member analysis failed for ${member.name}:`, err);
        return null;
      }
    });

    const membersResults = await Promise.all(memberPromises);
    const successfulMembers = membersResults.filter((m) => m !== null);

    if (successfulMembers.length === 0) {
      throw new Error('모든 멤버 분석에 실패했습니다. API 연결 상태를 확인해주세요.');
    }

    const analysisData = {
      group_summary: groupSummary,
      relationship_map: relationshipMap,
      members: successfulMembers,
      others_message_count: group_stats.others_message_count,
    };

    // Supabase 저장
    const { data, error } = await supabase
      .from('analyses')
      .insert({ data: analysisData })
      .select('id')
      .single();

    if (error) {
      console.error('Supabase insert error:', error);
      return NextResponse.json({ error: 'DB 저장 실패: ' + error.message }, { status: 500 });
    }

    return NextResponse.json({ id: data.id });
  } catch (err) {
    console.error('API route error:', err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : '알 수 없는 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
