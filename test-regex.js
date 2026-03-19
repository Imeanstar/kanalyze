const testLines = [
  "--------------- 2023년 10월 5일 목요일 ---------------",
  "[홍길동] [오전 10:11] 윈도우 PC 테스트",
  "2023년 10월 15일 일요일",
  "2023. 10. 15. 오후 12:30, 방제 : 안드로이드/아이폰 테스트",
  "2024년 1월 26일 오후 10:11",
  "2024년 1월 26일 오후 10:11, 후움 : ㄷㄷ",
  "2024년 1월 27일 오전 1:16, 눈빛 애교 어피치 : 안녕하세요",
];

const MSG_LINE_RE = /^\[(.+?)\]\s+\[(오전|오후)\s+(\d+):(\d+)\]\s+(.*)$/;
const MOBILE_MSG_LINE_RE = /^\d{4}\.\s+\d{1,2}\.\s+\d{1,2}\.\s+(?:(오전|오후)\s+)?(\d+):(\d+),\s+(.+?)\s+:\s+(.*)$/;
const ANDROID_MSG_LINE_RE = /^\d{4}년\s+\d{1,2}월\s+\d{1,2}일\s+(오전|오후)\s+(\d+):(\d+),\s+(.+?)\s+:\s+(.*)$/;

function toHour24(period, h) {
  if (!period) return h;
  if (period === '오전') return h === 12 ? 0 : h;
  return h === 12 ? 12 : h + 12;
}

testLines.forEach(raw => {
  let m = MSG_LINE_RE.exec(raw);
  if (m) {
    console.log("WIN PC MATCH:", m[1], toHour24(m[2], parseInt(m[3])), m[5]);
    return;
  }

  m = MOBILE_MSG_LINE_RE.exec(raw);
  if (m) {
    console.log("iOS/MAC MATCH:", m[4], toHour24(m[1], parseInt(m[2])), m[5]);
    return;
  }

  m = ANDROID_MSG_LINE_RE.exec(raw);
  if (m) {
    console.log("ANDROID MATCH:", m[4], toHour24(m[1], parseInt(m[2])), m[5]);
    return;
  }
  
  console.log("NO MATCH:", raw);
});
