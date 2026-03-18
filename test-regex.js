const jsonString = `{
  "group_summary": "58명 중 소수정예 핵심 멤버들이 25만 개 메시지를 폭파시키며 우정인지 덕질인지 모를 관계를 쌓아 올린, '그들만의 리그'가 격렬하게 펼쳐지는 아지트.",
  "relationship_map": "                              아루\n                             / | \\ \n                            /  | \\ \n                   (찐친 케미) /   |   \\ (아루 바라기)\n                             륑 <-----> ㅁㄹㄹ\n          |    ^    |\n                      (일상 공유) |    |    | (조용한 지지)\n                             |    |    |\n                             칭 <---- 첼 ----> 돼지댕\n                            / \\  / \\  / \\\n                           /   \\/   \\/   \\\n             (칭 전담) (관찰자) (재미 담당) (피스메이커)\n              흐루종일   눈썹달    백 수 는 라   피스메이 커 김윙스"
}`;

const extractStringField = (key) => {
  const regex = new RegExp(`"${key}"\\s*:\\s*"([\\s\\S]*?)"(?:\\s*,\\s*"|\\s*})`);
  const match = jsonString.match(regex);
  if (match) {
    return match[1].replace(/\\n/g, '\n').replace(/\\"/g, '"');
  }
  return null;
};

console.log('relationship_map:', extractStringField('relationship_map'));
