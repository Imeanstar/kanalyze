/**
 * parserWorker.ts
 * Web Worker for client-side KakaoTalk .txt parsing.
 * Runs off the main thread to prevent UI freezing on large files (up to 50MB+).
 *
 * Input:  File (via postMessage from main thread)
 * Output: { group_stats, top10 } (via postMessage back to main thread)
 */

// ── Types ────────────────────────────────────────────────────────────────────

interface SpeakerStats {
  name: string;
  message_count: number;
  hourly: number[]; // 24 buckets
  samples: string[];
}

interface Top10Member {
  name: string;
  message_count: number;
  active_time: string; // e.g. "오후 9시~11시"
  samples: string[];
}

interface GroupStats {
  total_messages: number;
  total_speakers: number;
  date_range: string;
}

interface ParseResult {
  group_stats: GroupStats;
  top10: Top10Member[];
}

// ── Regex patterns ────────────────────────────────────────────────────────────

// Date separator: --------------- 2025년 2월 11일 화요일 ---------------
const DATE_LINE_RE = /^-+\s+\d{4}년\s+\d+월\s+\d+일\s+.+요일\s+-+$/;

// Message line: [이름] [오전/오후 HH:MM] content
// Supports multi-character names including spaces (KakaoTalk allows it)
const MSG_LINE_RE = /^\[(.+?)\]\s+\[(?:오전|오후)\s+(\d+):(\d+)\]\s+(.*)$/;

// ── Hour normalization ────────────────────────────────────────────────────────

function toHour24(period: string, h: number): number {
  // period: '오전' | '오후'
  if (period === '오전') {
    return h === 12 ? 0 : h;
  } else {
    return h === 12 ? 12 : h + 12;
  }
}

function formatActiveTime(hourly: number[]): string {
  let maxCount = 0;
  let peakHour = 0;
  for (let i = 0; i < 24; i++) {
    if (hourly[i] > maxCount) {
      maxCount = hourly[i];
      peakHour = i;
    }
  }
  const endHour = (peakHour + 2) % 24;
  const fmt = (h: number) => {
    if (h === 0) return '자정';
    if (h < 12) return `오전 ${h}시`;
    if (h === 12) return '오후 12시';
    return `오후 ${h - 12}시`;
  };
  return `${fmt(peakHour)}~${fmt(endHour)}`;
}

// ── Main parsing logic ────────────────────────────────────────────────────────

function parseKakaoTxt(text: string): ParseResult {
  const speakers: Map<string, SpeakerStats> = new Map();

  let totalMessages = 0;
  let firstDate = '';
  let lastDate = '';
  let currentDate = '';

  const lines = text.split('\n');

  for (let i = 0; i < lines.length; i++) {
    const raw = lines[i].trim();
    if (!raw) continue;

    // Date separator
    if (DATE_LINE_RE.test(raw)) {
      currentDate = raw.replace(/-+/g, '').trim();
      if (!firstDate) firstDate = currentDate;
      lastDate = currentDate;
      continue;
    }

    // Message line
    const m = MSG_LINE_RE.exec(raw);
    if (!m) continue;

    const name = m[1].trim();
    const period = raw.match(/\[(오전|오후)/)![1];
    const hour = parseInt(m[2], 10);
    const content = m[4];

    // Skip system messages (이모티콘, 사진, 동영상, 파일, etc.)
    if (
      content === '이모티콘' ||
      content === '사진' ||
      content === '동영상' ||
      content === '파일' ||
      content === '음성메시지' ||
      content === '삭제된 메시지' ||
      content.startsWith('<') // system XML
    ) {
      continue;
    }

    totalMessages++;

    if (!speakers.has(name)) {
      speakers.set(name, {
        name,
        message_count: 0,
        hourly: new Array(24).fill(0),
        samples: [],
      });
    }

    const stats = speakers.get(name)!;
    stats.message_count++;

    // Track hourly activity
    const hour24 = toHour24(period, hour);
    stats.hourly[hour24]++;

    // Collect up to 200 sample lines (prefer non-trivial content)
    if (stats.samples.length < 200 && content.length > 5) {
      stats.samples.push(`${name}: ${content}`);
    }
  }

  // Sort by message count descending, take top 10
  const sorted = Array.from(speakers.values()).sort(
    (a, b) => b.message_count - a.message_count
  );
  const top10Raw = sorted.slice(0, 10);

  const top10: Top10Member[] = top10Raw.map((s) => ({
    name: s.name,
    message_count: s.message_count,
    active_time: formatActiveTime(s.hourly),
    samples: s.samples,
  }));

  return {
    group_stats: {
      total_messages: totalMessages,
      total_speakers: speakers.size,
      date_range: firstDate && lastDate ? `${firstDate} ~ ${lastDate}` : '알 수 없음',
    },
    top10,
  };
}

// ── Worker message handler ────────────────────────────────────────────────────

self.addEventListener('message', async (e: MessageEvent) => {
  const file: File = e.data;

  try {
    // Post initial progress
    self.postMessage({ type: 'progress', stage: 'reading' });

    // Read file as text (handles large files via FileReader)
    const text = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = () => reject(reader.error);
      reader.readAsText(file, 'utf-8');
    });

    self.postMessage({ type: 'progress', stage: 'parsing' });

    const result = parseKakaoTxt(text);

    self.postMessage({ type: 'progress', stage: 'done' });
    self.postMessage({ type: 'result', payload: result });
  } catch (err) {
    self.postMessage({ type: 'error', message: String(err) });
  }
});
