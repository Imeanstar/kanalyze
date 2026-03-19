/**
 * parserWorkerCode.ts
 * Worker source as a string for Blob-URL instantiation.
 * This avoids Next.js App Router bundling issues with Web Workers.
 */

export const PARSER_WORKER_CODE = /* javascript */ `
// ── Regex ────────────────────────────────────────────────────────────────────
const DATE_LINE_RE = /^-+\\s+\\d{4}년\\s+\\d+월\\s+\\d+일\\s+.+요일\\s+-+$/;
const MOBILE_DATE_LINE_RE = /^\\d{4}년\\s+\\d+월\\s+\\d+일\\s+.+요일$/;

const MSG_LINE_RE  = /^\\[(.+?)\\]\\s+\\[(오전|오후)\\s+(\\d+):(\\d+)\\]\\s+(.*)$/;
const MOBILE_MSG_LINE_RE = /^\\d{4}\\.\\s+\\d{1,2}\\.\\s+\\d{1,2}\\.\\s+(?:(오전|오후)\\s+)?(\\d+):(\\d+),\\s+(.+?)\\s+:\\s+(.*)$/;
const ANDROID_MSG_LINE_RE = /^\\d{4}년\\s+\\d{1,2}월\\s+\\d{1,2}일\\s+(오전|오후)\\s+(\\d+):(\\d+),\\s+(.+?)\\s+:\\s+(.*)$/;

// ── Helpers ───────────────────────────────────────────────────────────────────
function toHour24(period, h) {
  if (!period) return h === 24 ? 0 : h;
  if (period === '오전') return h === 12 ? 0 : h;
  return h === 12 ? 12 : h + 12;
}

function formatActiveTime(hourly) {
  let maxCount = 0, peakHour = 0;
  for (let i = 0; i < 24; i++) {
    if (hourly[i] > maxCount) { maxCount = hourly[i]; peakHour = i; }
  }
  const endHour = (peakHour + 2) % 24;
  const fmt = (h) => {
    if (h === 0) return '자정';
    if (h < 12)  return '오전 ' + h + '시';
    if (h === 12) return '오후 12시';
    return '오후 ' + (h - 12) + '시';
  };
  return fmt(peakHour) + '~' + fmt(endHour);
}

// ── Parser ────────────────────────────────────────────────────────────────────
function parseKakaoTxt(text) {
  const speakers = new Map();
  let totalMessages = 0;
  let firstDate = '', lastDate = '';

  const lines = text.split('\\n');

  for (let i = 0; i < lines.length; i++) {
    const raw = lines[i].trim();
    if (!raw) continue;

    if (DATE_LINE_RE.test(raw) || MOBILE_DATE_LINE_RE.test(raw)) {
      const d = raw.replace(/-+/g, '').trim();
      if (!firstDate) firstDate = d;
      lastDate = d;
      continue;
    }

    let name, period, hour, content;
    let m = MSG_LINE_RE.exec(raw);
    if (m) {
      name    = m[1].trim();
      period  = m[2];
      hour    = parseInt(m[3], 10);
      content = m[5];
    } else {
      m = MOBILE_MSG_LINE_RE.exec(raw);
      if (m) {
        period  = m[1];
        hour    = parseInt(m[2], 10);
        name    = m[4].trim();
        content = m[5];
      } else {
        m = ANDROID_MSG_LINE_RE.exec(raw);
        if (m) {
          period  = m[1];
          hour    = parseInt(m[2], 10);
          name    = m[4].trim();
          content = m[5];
        } else {
          continue;
        }
      }
    }

    const SKIP = ['이모티콘','사진','동영상','파일','음성메시지','삭제된 메시지'];
    if (SKIP.includes(content) || content.startsWith('<')) continue;

    totalMessages++;

    if (!speakers.has(name)) {
      speakers.set(name, { name, message_count: 0, hourly: new Array(24).fill(0), samples: [] });
    }

    const s = speakers.get(name);
    s.message_count++;
    s.hourly[toHour24(period, hour)]++;
    if (s.samples.length < 200 && content.length > 5) {
      s.samples.push(name + ': ' + content);
    }
  }

  const sorted = Array.from(speakers.values()).sort((a, b) => b.message_count - a.message_count);
  const top10List = sorted.slice(0, 10);
  const top10Names = top10List.map(s => s.name);
  const top10TotalMessages = top10List.reduce((sum, s) => sum + s.message_count, 0);

  // -- 2차 패스: 멘션(언급) 횟수 계산 (관계도용) --
  const mentionMatrix = {};
  top10Names.forEach(n => {
    mentionMatrix[n] = {};
    top10Names.forEach(target => {
      if (n !== target) mentionMatrix[n][target] = 0;
    });
  });

  for (let i = 0; i < lines.length; i++) {
    const raw = lines[i].trim();
    if (!raw) continue;
    
    let name, content;
    let m = MSG_LINE_RE.exec(raw);
    if (m) {
      name = m[1].trim();
      content = m[5];
    } else {
      m = MOBILE_MSG_LINE_RE.exec(raw);
      if (m) {
        name = m[4].trim();
        content = m[5];
      } else {
        m = ANDROID_MSG_LINE_RE.exec(raw);
        if (m) {
          name = m[4].trim();
          content = m[5];
        } else {
          continue;
        }
      }
    }

    if (!top10Names.includes(name)) continue;

    const SKIP = ['이모티콘','사진','동영상','파일','음성메시지','삭제된 메시지'];
    if (SKIP.includes(content) || content.startsWith('<')) continue;

    for (let j = 0; j < top10Names.length; j++) {
      const target = top10Names[j];
      if (name !== target && content.includes(target)) {
        mentionMatrix[name][target]++;
      }
    }
  }

  const top10  = top10List.map(s => ({
    name: s.name,
    message_count: s.message_count,
    active_time: formatActiveTime(s.hourly),
    samples: s.samples,
    mentions: mentionMatrix[s.name],
  }));

  return {
    group_stats: {
      total_messages: totalMessages, // 포인트 1, 4: 제외 라우트 제외한 실제 총 메시지량
      total_speakers: speakers.size, // 포인트 1: 전체 스피커 수
      others_message_count: totalMessages - top10TotalMessages, // 포인트 4: 기타 그룹 계산
      date_range: firstDate && lastDate ? firstDate + ' ~ ' + lastDate : '알 수 없음',
    },
    top10,
  };
}

// ── Worker handler ────────────────────────────────────────────────────────────
self.addEventListener('message', async (e) => {
  const file = e.data;
  try {
    self.postMessage({ type: 'progress', stage: 'reading' });

    const text = await new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload  = () => resolve(reader.result);
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
`;
