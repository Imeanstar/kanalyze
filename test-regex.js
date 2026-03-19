const testLines = [
  "--------------- 2023년 10월 5일 목요일 ---------------",
  "[홍길동] [오전 10:11] 윈도우 PC 테스트",
  "2023년 10월 15일 일요일",
  "2023. 10. 15. 오후 12:30, 방제 : 안드로이드 테스트",
  "2023. 10. 5. 오후 3:30, 김영희 : 맥 PC 테스트",
  "2024. 2. 1. 14:20, 철수 : 24시간제 테스트"
];

const DATE_LINE_RE = /^-+\s+\d{4}년\s+\d+월\s+\d+일\s+.+요일\s+-+$/;
const MOBILE_DATE_LINE_RE = /^\d{4}년\s+\d+월\s+\d+일\s+.+요일$/;

const MSG_LINE_RE = /^\[(.+?)\]\s+\[(오전|오후)\s+(\d+):(\d+)\]\s+(.*)$/;
const MOBILE_MSG_LINE_RE = /^\d{4}\.\s+\d{1,2}\.\s+\d{1,2}\.\s+(?:(오전|오후)\s+)?(\d+):(\d+),\s+(.+?)\s+:\s+(.*)$/;

function toHour24(period, h) {
  if (!period) return h;
  if (period === '오전') return h === 12 ? 0 : h;
  return h === 12 ? 12 : h + 12;
}

testLines.forEach(raw => {
  if (DATE_LINE_RE.test(raw) || MOBILE_DATE_LINE_RE.test(raw)) {
    console.log("DATE MATCH:", raw);
    return;
  }
  
  let m = MSG_LINE_RE.exec(raw);
  if (m) {
    console.log("WIN PC MATCH:", m[1], toHour24(m[2], parseInt(m[3])), m[5]);
    return;
  }

  m = MOBILE_MSG_LINE_RE.exec(raw);
  if (m) {
    console.log("MOBILE/MAC MATCH:", m[4], toHour24(m[1], parseInt(m[2])), m[5]);
    return;
  }
  
  console.log("NO MATCH:", raw);
});
