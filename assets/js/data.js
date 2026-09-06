/* 산 데이터
 * 표고: 최고봉 기준(m)
 * 코스: 대표 등산로의 총 거리(km)와 누적 상승고도(m) 근사값
 * shape  : 왕복 | 순환 | 종주(편도)
 * terrain: earth(흙길·완경사) | stone(돌계단·너덜) | rock(암릉·철계단) | danger(로프·위험구간)
 * 수치는 공개된 탐방로 정보를 바탕으로 정리한 근사값입니다. 산행 전 공식 정보를 확인하세요.
 */
const MOUNTAINS = [
  {
    id: "geomdansan", name: "검단산", elev: 657, region: "수도권", area: "경기 하남",
    access: "5호선 하남검단산역 직통 · 30분",
    park: "", season: "사계절 · 한강 조망",
    summary: "5호선 종점에서 바로 붙는 산. 짧은 거리에 고도차가 몰려 있어 서울 근교 체력 훈련지로 많이 쓰인다.",
    courses: [
      { name: "애니메이션고 ~ 정상 왕복", dist: 6.4, gain: 570, shape: "왕복", terrain: "stone", note: "초반부터 끝까지 오르막. 정상에서 팔당호 조망" }
    ]
  },
  {
    id: "yebongsan", name: "예봉산", elev: 683, region: "수도권", area: "경기 남양주",
    access: "7호선 상봉 → 경의중앙선 팔당역 · 45분",
    park: "", season: "사계절 · 두물머리 조망",
    summary: "팔당역에서 바로 오르는 산. 검단산과 강을 사이에 두고 마주 보며 난이도도 비슷하다.",
    courses: [
      { name: "팔당역 ~ 정상 왕복", dist: 6, gain: 600, shape: "왕복", terrain: "stone", note: "급경사 구간이 길다. 하산은 무릎 부담 주의" }
    ]
  },
  {
    id: "buramsan", name: "불암산", elev: 508, region: "수도권", area: "서울 노원 · 경기 남양주",
    access: "7호선 노원 → 4호선 상계역 · 40분",
    park: "", season: "사계절 · 야경",
    summary: "정상부가 통바위라 짧은 거리에도 손을 쓰는 구간이 나온다. 암릉 입문에 적당하다.",
    courses: [
      { name: "상계역 ~ 정상 왕복", dist: 5, gain: 420, shape: "왕복", terrain: "rock", note: "정상 직전 밧줄·철난간 구간" }
    ]
  },
  {
    id: "soyosan", name: "소요산", elev: 587, region: "수도권", area: "경기 동두천",
    access: "7호선 도봉산 → 1호선 소요산역 · 1시간 20분",
    park: "", season: "10월 말 단풍",
    summary: "1호선 종점 역 앞에서 시작하는 능선 순환 코스. 경기 북부의 단풍 명소다.",
    courses: [
      { name: "소요산역 ~ 의상대 ~ 자재암 순환", dist: 6.5, gain: 540, shape: "순환", terrain: "stone", note: "하백운대부터 의상대까지 오르내림 반복" }
    ]
  },
  {
    id: "hallasan", name: "한라산", elev: 1947, region: "제주", area: "제주 서귀포·제주시",
    access: "5호선 김포공항역 직통 → 항공 · 3시간 30분",
    park: "국립공원", season: "5월 철쭉 · 1~2월 설경",
    summary: "남한 최고봉. 거리가 길어 체력 소모가 크고, 정상부 탐방은 시간제한(입산 통제 시각)이 엄격하다.",
    courses: [
      { name: "성판악 ~ 백록담 왕복", dist: 19.2, gain: 1350, shape: "왕복", terrain: "stone", note: "완만하지만 가장 길다. 예약제 운영" },
      { name: "관음사 ~ 백록담 왕복", dist: 17.4, gain: 1520, shape: "왕복", terrain: "stone", note: "삼각봉 이후 경사 급증" },
      { name: "영실 ~ 윗세오름 왕복", dist: 11.2, gain: 640, shape: "왕복", terrain: "stone", note: "정상 미등정 코스. 병풍바위 조망" }
    ]
  },
  {
    id: "jirisan", name: "지리산", elev: 1915, region: "전라·경상", area: "전남 구례 · 전북 남원 · 경남 산청",
    access: "7호선 고속터미널 → 구례·함양행 버스 · 4시간",
    park: "국립공원", season: "10월 단풍 · 12~2월 상고대",
    summary: "국내 첫 국립공원. 천왕봉 당일 산행부터 1박 2일 종주까지 난이도 폭이 가장 넓다.",
    courses: [
      { name: "중산리 ~ 천왕봉 왕복", dist: 10.8, gain: 1350, shape: "왕복", terrain: "stone", note: "짧은 거리에 고도차가 커 계속 오르막" },
      { name: "성삼재 ~ 노고단 왕복", dist: 8.4, gain: 400, shape: "왕복", terrain: "earth", note: "지리산 입문 코스. 노고단 정상은 예약 필요" },
      { name: "화대종주(화엄사~대원사)", dist: 45, gain: 3000, shape: "종주", terrain: "rock", note: "대피소 1박 이상 필수. 사전 예약 필수" }
    ]
  },
  {
    id: "seoraksan", name: "설악산", elev: 1708, region: "강원", area: "강원 속초·양양·인제",
    access: "2호선 강변역 동서울터미널 → 속초·오색행 · 2시간 30분",
    park: "국립공원", season: "10월 초 단풍 · 6월 야생화",
    summary: "암릉과 급경사가 이어지는 국내 최고 난도 지대. 공룡능선은 당일 완주 시 12시간 이상 걸린다.",
    courses: [
      { name: "오색 ~ 대청봉 왕복", dist: 10, gain: 1300, shape: "왕복", terrain: "stone", note: "쉼 없는 계단 오르막. 최단이지만 가장 가파름" },
      { name: "울산바위 왕복", dist: 7.6, gain: 550, shape: "왕복", terrain: "rock", note: "808계단 철계단 구간" },
      { name: "공룡능선 순환(소공원~마등령~비선대)", dist: 24, gain: 1900, shape: "순환", terrain: "rock", note: "탈출로 없음. 일출 전 출발 권장" }
    ]
  },
  {
    id: "deogyusan", name: "덕유산", elev: 1614, region: "전라", area: "전북 무주 · 경남 거창",
    access: "7호선 고속터미널 → 무주행 버스 · 3시간 30분",
    park: "국립공원", season: "1~2월 상고대 · 6월 원추리",
    summary: "곤돌라로 표고 1,520m까지 올라갈 수 있어 겨울 설경 산행의 입문지로 꼽힌다.",
    courses: [
      { name: "곤돌라 ~ 향적봉 왕복", dist: 5, gain: 250, shape: "왕복", terrain: "earth", note: "곤돌라 운행 시간 확인 필수" },
      { name: "삼공리 ~ 백련사 ~ 향적봉 왕복", dist: 17, gain: 1100, shape: "왕복", terrain: "stone", note: "계곡 따라 완만하게 오르다 후반 급경사" }
    ]
  },
  {
    id: "gyebangsan", name: "계방산", elev: 1577, region: "강원", area: "강원 평창·홍천",
    access: "동서울터미널 → 진부행 버스 + 택시 · 3시간 20분",
    park: "국립공원", season: "12~2월 설경",
    summary: "남한에서 다섯 번째로 높지만 들머리 운두령이 이미 1,089m라 겨울 눈산행 입문 코스로 인기.",
    courses: [
      { name: "운두령 ~ 정상 왕복", dist: 8.8, gain: 500, shape: "왕복", terrain: "earth", note: "겨울에는 아이젠·스패츠 필수" }
    ]
  },
  {
    id: "hambaeksan", name: "함백산", elev: 1573, region: "강원", area: "강원 태백·정선",
    access: "동서울터미널 → 태백행 버스 + 택시 · 4시간",
    park: "국립공원", season: "1~2월 설경 · 7월 야생화",
    summary: "만항재(1,330m)에서 출발해 고도 대비 힘이 덜 드는 고산. 능선 조망이 트여 있다.",
    courses: [
      { name: "만항재 ~ 정상 왕복", dist: 5.4, gain: 380, shape: "왕복", terrain: "earth", note: "바람이 강해 방풍 의류 필요" }
    ]
  },
  {
    id: "taebaeksan", name: "태백산", elev: 1567, region: "강원", area: "강원 태백",
    access: "동서울터미널 → 태백행 버스 · 3시간 30분",
    park: "국립공원", season: "1~2월 눈꽃 · 주목 군락",
    summary: "완만한 육산으로 겨울 눈꽃 산행의 대표지. 초보자도 도전할 만한 1,500m급.",
    courses: [
      { name: "유일사 ~ 천제단 왕복", dist: 8.8, gain: 620, shape: "왕복", terrain: "earth", note: "주목 군락 통과. 겨울 성수기 혼잡" }
    ]
  },
  {
    id: "odaesan", name: "오대산", elev: 1563, region: "강원", area: "강원 평창·강릉·홍천",
    access: "동서울터미널 → 진부행 버스 · 2시간 40분",
    park: "국립공원", season: "10월 단풍 · 전나무숲",
    summary: "상원사에서 시작하면 고도차가 적어 1,500m급 중 가장 수월한 편에 속한다.",
    courses: [
      { name: "상원사 ~ 비로봉 왕복", dist: 7, gain: 570, shape: "왕복", terrain: "stone", note: "정비된 계단길" },
      { name: "소금강 ~ 노인봉 왕복", dist: 13.4, gain: 900, shape: "왕복", terrain: "stone", note: "계곡 절경. 비 온 뒤 미끄럼 주의" }
    ]
  },
  {
    id: "sobaeksan", name: "소백산", elev: 1439, region: "충청·경상", area: "충북 단양 · 경북 영주",
    access: "1호선 청량리 → KTX-이음 단양역 · 2시간",
    park: "국립공원", season: "5월 말 철쭉 · 1월 칼바람 설경",
    summary: "정상부가 초원 능선이라 조망이 시원하지만, 바람이 세기로 유명해 방풍 대비가 필요하다.",
    courses: [
      { name: "삼가리 ~ 비로봉 왕복", dist: 11.6, gain: 1000, shape: "왕복", terrain: "earth", note: "가장 대중적인 최단 코스" },
      { name: "희방사 ~ 연화봉 ~ 비로봉", dist: 13, gain: 1000, shape: "종주", terrain: "stone", note: "천문대 경유 능선길" }
    ]
  },
  {
    id: "gayasan", name: "가야산", elev: 1433, region: "경상", area: "경남 합천 · 경북 성주",
    access: "7호선 고속터미널 → 해인사행 버스 · 4시간",
    park: "국립공원", season: "10월 단풍 · 만물상 능선",
    summary: "짧은 거리에 고도차가 몰려 있어 체감 경사가 매우 급하다. 만물상 코스는 암릉 구간.",
    courses: [
      { name: "백운동 ~ 상왕봉 왕복", dist: 8.6, gain: 1000, shape: "왕복", terrain: "stone", note: "계단 위주의 급경사" },
      { name: "만물상 ~ 상왕봉 ~ 백운동 순환", dist: 9.4, gain: 1050, shape: "순환", terrain: "rock", note: "만물상 구간 암릉 연속" }
    ]
  },
  {
    id: "chiaksan", name: "치악산", elev: 1288, region: "강원", area: "강원 원주",
    access: "동서울터미널 → 원주행 버스 · 1시간 40분",
    park: "국립공원", season: "10월 단풍",
    summary: "'사다리병창'으로 불리는 끝없는 돌계단 때문에 높이에 비해 힘든 산으로 악명이 높다.",
    courses: [
      { name: "구룡사 ~ 비로봉 왕복", dist: 10.6, gain: 950, shape: "왕복", terrain: "stone", note: "사다리병창 급경사 계단" }
    ]
  },
  {
    id: "myeongjisan", name: "명지산", elev: 1267, region: "수도권", area: "경기 가평",
    access: "7호선 상봉 → 경춘선 가평역 → 버스 · 2시간",
    park: "도립공원", season: "10월 단풍 · 계곡",
    summary: "경기도에서 화악산 다음으로 높은 산. 수도권에서 고도차 1,000m급 훈련 산행지로 쓰인다.",
    courses: [
      { name: "익근리 ~ 정상 왕복", dist: 12, gain: 1000, shape: "왕복", terrain: "stone", note: "계곡길 이후 지속 오르막" }
    ]
  },
  {
    id: "gajisan", name: "가지산", elev: 1241, region: "경상", area: "울산 울주 · 경남 밀양",
    access: "서울역 KTX 울산 → 언양 버스 · 4시간",
    park: "도립공원", season: "5월 철쭉 · 10월 억새",
    summary: "영남알프스 최고봉. 석남터널에서 시작하면 고도차가 크게 줄어든다.",
    courses: [
      { name: "석남터널 ~ 정상 왕복", dist: 7, gain: 620, shape: "왕복", terrain: "stone", note: "정상 직전 너덜 구간" }
    ]
  },
  {
    id: "palgongsan", name: "팔공산", elev: 1193, region: "경상", area: "대구 · 경북 영천·군위",
    access: "서울역 KTX 동대구 → 버스 · 3시간",
    park: "국립공원", season: "10월 단풍 · 4월 벚꽃길",
    summary: "2023년 국립공원으로 승격. 갓바위 계단 코스는 짧지만 오르막이 이어진다.",
    courses: [
      { name: "동화사 ~ 비로봉 왕복", dist: 10, gain: 800, shape: "왕복", terrain: "stone", note: "임도와 등산로가 섞인 구간" },
      { name: "갓바위 왕복", dist: 2.4, gain: 380, shape: "왕복", terrain: "stone", note: "1,300여 개 돌계단. 거리는 짧지만 급경사" }
    ]
  },
  {
    id: "mudeungsan", name: "무등산", elev: 1187, region: "전라", area: "광주 · 전남 화순·담양",
    access: "용산역 KTX 광주송정 → 버스 · 3시간",
    park: "국립공원", season: "10월 억새 · 1월 상고대",
    summary: "주상절리 서석대·입석대가 핵심. 정상 천왕봉은 군부대로 평소 통제된다.",
    courses: [
      { name: "원효사 ~ 서석대 왕복", dist: 8.4, gain: 800, shape: "왕복", terrain: "stone", note: "목교·계단 정비 양호" },
      { name: "증심사 ~ 중머리재 ~ 장불재 왕복", dist: 10, gain: 750, shape: "왕복", terrain: "stone", note: "광주 도심에서 접근 편리" }
    ]
  },
  {
    id: "sinbulsan", name: "신불산", elev: 1159, region: "경상", area: "울산 울주",
    access: "서울역 KTX 울산 → 버스 · 4시간",
    park: "군립공원", season: "10월 억새 평원",
    summary: "간월재 억새밭으로 유명한 영남알프스의 대표 능선 산행지.",
    courses: [
      { name: "배내고개 ~ 간월재 ~ 신불산 왕복", dist: 12, gain: 800, shape: "왕복", terrain: "stone", note: "임도 구간이 길어 페이스 조절 쉬움" }
    ]
  },
  {
    id: "yongmunsan", name: "용문산", elev: 1157, region: "수도권", area: "경기 양평",
    access: "7호선 상봉 → 경의중앙선 용문역 · 1시간 40분",
    park: "", season: "10월 단풍 · 용문사 은행나무",
    summary: "수도권에서 손꼽히는 빡센 산. 정상 직전까지 계속되는 급경사가 특징이다.",
    courses: [
      { name: "용문사 ~ 가섭봉 왕복", dist: 11, gain: 950, shape: "왕복", terrain: "stone", note: "후반 급경사 계단 연속" }
    ]
  },
  {
    id: "hwangmaesan", name: "황매산", elev: 1113, region: "경상", area: "경남 합천·산청",
    access: "7호선 고속터미널 → 합천행 버스 · 4시간 30분",
    park: "군립공원", season: "5월 철쭉 · 10월 억새",
    summary: "정상 가까이까지 차로 접근할 수 있어 고도 대비 가장 수월한 1,000m급.",
    courses: [
      { name: "오토캠핑장 ~ 정상 왕복", dist: 4.4, gain: 350, shape: "왕복", terrain: "earth", note: "철쭉제 기간 극심한 혼잡" }
    ]
  },
  {
    id: "woraksan", name: "월악산", elev: 1097, region: "충청", area: "충북 제천·충주·단양",
    access: "동서울터미널 → 충주행 버스 · 2시간 40분",
    park: "국립공원", season: "10월 단풍 · 충주호 조망",
    summary: "정상 영봉 직전 철계단 구간이 길고 가팔라 고소공포가 있으면 부담스럽다.",
    courses: [
      { name: "덕주사 ~ 영봉 왕복", dist: 13.4, gain: 1000, shape: "왕복", terrain: "rock", note: "마지막 철계단 약 1km 구간" }
    ]
  },
  {
    id: "songnisan", name: "속리산", elev: 1058, region: "충청", area: "충북 보은 · 경북 상주",
    access: "동서울터미널 → 속리산행 버스 · 3시간",
    park: "국립공원", season: "10월 단풍 · 법주사",
    summary: "법주사에서 문장대까지 완만한 계곡길이 길게 이어져 초·중급자에게 적합하다.",
    courses: [
      { name: "법주사 ~ 문장대 왕복", dist: 14, gain: 800, shape: "왕복", terrain: "earth", note: "거리는 길지만 경사는 완만" },
      { name: "화북 ~ 문장대 왕복", dist: 7, gain: 700, shape: "왕복", terrain: "stone", note: "최단 코스. 경사는 더 급함" }
    ]
  },
  {
    id: "geumosan", name: "금오산", elev: 977, region: "경상", area: "경북 구미·김천",
    access: "서울역 KTX 구미역 → 버스 · 2시간 40분",
    park: "도립공원", season: "10월 단풍 · 대혜폭포",
    summary: "케이블카 상부에서도 정상까지 급경사가 남아 있어 체감 난도가 높다.",
    courses: [
      { name: "주차장 ~ 현월봉 왕복", dist: 8.6, gain: 850, shape: "왕복", terrain: "stone", note: "할딱고개 급경사 구간" }
    ]
  },
  {
    id: "unaksan", name: "운악산", elev: 936, region: "수도권", area: "경기 포천·가평",
    access: "7호선 상봉 → 경춘선 가평역 → 버스 · 2시간 10분",
    park: "군립공원", season: "10월 단풍 · 기암",
    summary: "경기 5악 중 가장 험한 산으로 꼽힌다. 암릉과 철계단이 반복된다.",
    courses: [
      { name: "현등사 ~ 정상 왕복", dist: 7.4, gain: 750, shape: "왕복", terrain: "rock", note: "미륵바위 일대 암릉·철계단" }
    ]
  },
  {
    id: "daedunsan", name: "대둔산", elev: 878, region: "충청·전라", area: "전북 완주 · 충남 논산·금산",
    access: "7호선 고속터미널 → 대전 → 버스 · 3시간 30분",
    park: "도립공원", season: "10월 단풍 · 구름다리",
    summary: "금강구름다리와 삼선계단이 명물. 케이블카를 타면 짧게 정상을 밟을 수 있다.",
    courses: [
      { name: "케이블카 ~ 마천대 왕복", dist: 2.4, gain: 240, shape: "왕복", terrain: "rock", note: "삼선계단 경사 약 51도" },
      { name: "수락계곡 ~ 마천대 왕복", dist: 9, gain: 700, shape: "왕복", terrain: "rock", note: "계곡과 암릉을 함께 지나는 코스" }
    ]
  },
  {
    id: "bukhansan", name: "북한산", elev: 836, region: "수도권", area: "서울 강북·은평 · 경기 고양",
    access: "7호선 노원 → 4호선 수유역 → 버스 · 1시간",
    park: "국립공원", season: "10월 단풍 · 사계절",
    summary: "세계적으로 방문객이 많은 도심 국립공원. 백운대 정상부는 바위에 설치된 난간을 잡고 오른다.",
    courses: [
      { name: "북한산성탐방센터 ~ 백운대 왕복", dist: 8.6, gain: 780, shape: "왕복", terrain: "rock", note: "정상부 쇠난간 구간. 겨울 결빙 주의" },
      { name: "우이동 ~ 백운대 왕복", dist: 6.4, gain: 690, shape: "왕복", terrain: "rock", note: "최단 코스. 하루재 이후 급경사" },
      { name: "불광동 ~ 비봉 ~ 구기동", dist: 6.5, gain: 500, shape: "종주", terrain: "rock", note: "진흥왕 순수비 경유 능선길" }
    ]
  },
  {
    id: "gyeryongsan", name: "계룡산", elev: 845, region: "충청", area: "충남 공주·계룡·논산",
    access: "7호선 고속터미널 → 공주행 버스 · 2시간 30분",
    park: "국립공원", season: "10월 단풍 · 4월 벚꽃",
    summary: "관음봉 일대 계단이 가파르지만 전체 거리가 짧아 반나절 산행으로 적당하다.",
    courses: [
      { name: "동학사 ~ 관음봉 ~ 은선폭포 순환", dist: 9, gain: 700, shape: "순환", terrain: "rock", note: "자연성릉 구간 철계단" },
      { name: "갑사 ~ 금잔디고개 ~ 동학사", dist: 8.5, gain: 600, shape: "종주", terrain: "stone", note: "고전적인 횡단 코스" }
    ]
  },
  {
    id: "wolchulsan", name: "월출산", elev: 809, region: "전라", area: "전남 영암·강진",
    access: "용산역 KTX 나주 → 버스 · 4시간",
    park: "국립공원", season: "10월 단풍 · 11월 억새",
    summary: "평지에서 갑자기 솟은 바위산. 높이는 낮지만 암릉 난도는 국내 최상급으로 평가된다.",
    courses: [
      { name: "천황사 ~ 천황봉 왕복", dist: 6.4, gain: 750, shape: "왕복", terrain: "danger", note: "구름다리와 연속 철계단" },
      { name: "천황사 ~ 천황봉 ~ 도갑사 종주", dist: 9, gain: 900, shape: "종주", terrain: "danger", note: "탈출로가 적어 시간 배분 중요" }
    ]
  },
  {
    id: "geumjeongsan", name: "금정산", elev: 801, region: "경상", area: "부산 금정·북구",
    access: "서울역 KTX 부산 → 1호선 범어사역 · 3시간 30분",
    park: "", season: "사계절 · 금정산성",
    summary: "부산 도심에서 접근성이 좋고, 국내 최장 산성 능선을 따라 걷는 코스가 인기.",
    courses: [
      { name: "범어사 ~ 고당봉 왕복", dist: 6.6, gain: 550, shape: "왕복", terrain: "stone", note: "정상 직전 계단 구간" }
    ]
  },
  {
    id: "moaksan", name: "모악산", elev: 794, region: "전라", area: "전북 김제·완주",
    access: "용산역 KTX 전주 → 버스 · 3시간",
    park: "도립공원", season: "4월 벚꽃 · 10월 단풍",
    summary: "호남평야가 한눈에 들어오는 조망 산. 정비된 길이라 가족 산행에 무난하다.",
    courses: [
      { name: "금산사 ~ 정상 왕복", dist: 8, gain: 650, shape: "왕복", terrain: "stone", note: "중계탑까지 완만한 오름" }
    ]
  },
  {
    id: "naejangsan", name: "내장산", elev: 763, region: "전라", area: "전북 정읍·순창",
    access: "5호선 왕십리 → 경의중앙선 용산역 KTX 정읍 · 2시간 40분",
    park: "국립공원", season: "11월 초 단풍 절정",
    summary: "국내 최고의 단풍 명산. 케이블카와 순환 능선을 조합해 난이도를 조절할 수 있다.",
    courses: [
      { name: "내장사 ~ 신선봉 ~ 금선폭포 순환", dist: 9, gain: 650, shape: "순환", terrain: "stone", note: "단풍철 인파로 실제 소요시간 증가" }
    ]
  },
  {
    id: "dobongsan", name: "도봉산", elev: 740, region: "수도권", area: "서울 도봉 · 경기 의정부",
    access: "7호선 도봉산역 직통 · 45분",
    park: "국립공원", season: "사계절 · 암릉 조망",
    summary: "선인봉·만장봉 등 화강암 봉우리가 밀집한 암산. 신선대 정상은 마지막에 바위를 붙잡고 오른다.",
    courses: [
      { name: "도봉탐방센터 ~ 신선대 왕복", dist: 7.4, gain: 640, shape: "왕복", terrain: "rock", note: "마당바위 이후 암릉" }
    ]
  },
  {
    id: "juwangsan", name: "주왕산", elev: 720, region: "경상", area: "경북 청송",
    access: "동서울터미널 → 청송행 버스 · 4시간 30분",
    park: "국립공원", season: "10월 단풍 · 주산지",
    summary: "협곡 폭포 탐방로는 거의 평지에 가깝고, 정상 능선까지 붙이면 난도가 올라간다.",
    courses: [
      { name: "대전사 ~ 주왕산 ~ 용추폭포 순환", dist: 10, gain: 550, shape: "순환", terrain: "stone", note: "폭포 구간은 유모차도 다니는 평탄길" }
    ]
  },
  {
    id: "maisan", name: "마이산", elev: 687, region: "전라", area: "전북 진안",
    access: "7호선 고속터미널 → 진안행 버스 · 3시간 30분",
    park: "도립공원", season: "4월 벚꽃 · 10월 단풍",
    summary: "말 귀 모양 두 봉우리와 돌탑군. 산행보다 탐방에 가까워 입문자에게 적합하다.",
    courses: [
      { name: "남부주차장 ~ 탑사 ~ 봉두봉 왕복", dist: 4.4, gain: 300, shape: "왕복", terrain: "stone", note: "암마이봉 등정로는 별도 계단" }
    ]
  },
  {
    id: "surak", name: "수락산", elev: 638, region: "수도권", area: "서울 노원 · 경기 남양주",
    access: "7호선 수락산역 직통 · 40분",
    park: "", season: "사계절",
    summary: "화강암 슬랩과 기암이 많아 짧은 거리에도 손을 쓰는 구간이 나온다.",
    courses: [
      { name: "장암역 ~ 주봉 왕복", dist: 6.2, gain: 540, shape: "왕복", terrain: "rock", note: "슬랩 구간, 비 온 뒤 미끄럼 주의" }
    ]
  },
  {
    id: "gwanaksan", name: "관악산", elev: 632, region: "수도권", area: "서울 관악·금천 · 경기 안양·과천",
    access: "7호선 건대입구 → 2호선 서울대입구역 · 50분",
    park: "", season: "사계절 · 야간 조망",
    summary: "서울 남부의 대표 훈련 산행지. 들머리에 따라 난도 편차가 크다.",
    courses: [
      { name: "서울대 ~ 연주대 왕복", dist: 7.2, gain: 560, shape: "왕복", terrain: "rock", note: "가장 대중적인 코스" },
      { name: "사당역 ~ 관악문 ~ 연주대 왕복", dist: 9, gain: 620, shape: "왕복", terrain: "rock", note: "능선 암릉 구간이 길다" }
    ]
  },
  {
    id: "cheonggyesan", name: "청계산", elev: 618, region: "수도권", area: "서울 서초 · 경기 성남·과천·의왕",
    access: "7호선 고속터미널 → 신분당선 청계산입구역 · 55분",
    park: "", season: "사계절",
    summary: "흙길 비중이 높고 계단이 잘 정비돼 첫 산행지로 가장 많이 추천된다.",
    courses: [
      { name: "원터골 ~ 매봉 왕복", dist: 6.4, gain: 480, shape: "왕복", terrain: "stone", note: "매봉까지 계단 위주" }
    ]
  },
  {
    id: "chilgapsan", name: "칠갑산", elev: 561, region: "충청", area: "충남 청양",
    access: "7호선 고속터미널 → 청양행 버스 · 3시간",
    park: "도립공원", season: "10월 단풍 · 콩밭길",
    summary: "높이가 낮고 길이 부드러워 가족 단위 나들이 산행에 알맞다.",
    courses: [
      { name: "장곡사 ~ 정상 왕복", dist: 5.4, gain: 400, shape: "왕복", terrain: "earth", note: "정비된 흙길과 계단" }
    ]
  },
  {
    id: "manisan", name: "마니산", elev: 472, region: "수도권", area: "인천 강화",
    access: "7호선 건대입구 → 2호선 신촌 → 강화행 버스 · 2시간 20분",
    park: "", season: "사계절 · 서해 조망",
    summary: "참성단까지 계단 918개가 이어진다. 표고는 낮지만 쉬는 구간이 거의 없다.",
    courses: [
      { name: "화도 ~ 참성단 왕복", dist: 5.6, gain: 420, shape: "왕복", terrain: "rock", note: "능선길과 계단길 중 선택 가능" }
    ]
  },
  {
    id: "inwangsan", name: "인왕산", elev: 338, region: "수도권", area: "서울 종로·서대문",
    access: "5호선 종로3가 → 3호선 경복궁역 · 35분",
    park: "", season: "사계절 · 야경",
    summary: "한양도성 성곽을 따라 걷는 도심 산. 1~2시간이면 충분해 퇴근 후 산행지로 좋다.",
    courses: [
      { name: "사직공원 ~ 정상 ~ 윤동주문학관 순환", dist: 3.4, gain: 240, shape: "순환", terrain: "stone", note: "성곽 계단 구간" }
    ]
  },
  {
    id: "achasan", name: "아차산", elev: 296, region: "수도권", area: "서울 광진 · 경기 구리",
    access: "5호선 아차산역 · 1정거장 5분",
    park: "", season: "사계절 · 일출",
    summary: "지하철역에서 바로 붙는 완만한 산. 용마산·망우산·봉화산으로 능선이 이어져, 같은 들머리에서 입문부터 중급까지 난이도를 올릴 수 있다.",
    courses: [
      { name: "아차산역 ~ 정상 왕복", dist: 4, gain: 220, shape: "왕복", terrain: "earth", note: "고구려 보루 유적 경유" },
      { name: "아차산 ~ 용마산 종주", dist: 6.5, gain: 420, shape: "종주", terrain: "stone", note: "용마산(348m) 찍고 7호선 용마산역으로 하산" },
      { name: "아차산 ~ 용마산 ~ 망우산 ~ 봉화산 종주", dist: 11.5, gain: 620, shape: "종주", terrain: "stone", note: "능선 4개를 잇는 장거리 연습. 날머리는 6호선 봉화산역" }
    ]
  }
];

const TERRAIN = {
  earth:  { label: "흙길·완경사", factor: 1.0,  desc: "잘 정비된 흙길과 완만한 임도 위주" },
  stone:  { label: "돌계단·너덜", factor: 1.1,  desc: "긴 계단이나 돌이 깔린 너덜 구간 포함" },
  rock:   { label: "암릉·철계단", factor: 1.2,  desc: "손을 쓰는 바위 구간, 철계단·난간 포함" },
  danger: { label: "로프·위험구간", factor: 1.3, desc: "추락 위험이 있는 노출 구간, 로프·사다리 통과" }
};

const GRADES = [
  { key: "g1", name: "입문", range: "0 ~ 49",   min: 0,   max: 50,       tone: "d1", who: "산행 경험이 없어도 가능", time: "2시간 내외" },
  { key: "g2", name: "초급", range: "50 ~ 89",  min: 50,  max: 90,       tone: "d2", who: "평소 걷기 운동을 하는 성인", time: "3~4시간" },
  { key: "g3", name: "중급", range: "90 ~ 149", min: 90,  max: 150,      tone: "d3", who: "월 1회 이상 산행하는 사람", time: "4~6시간" },
  { key: "g4", name: "상급", range: "150 ~ 219", min: 150, max: 220,     tone: "d4", who: "체력 훈련이 된 정기 산행자", time: "6~9시간" },
  { key: "g5", name: "최상급", range: "220 이상", min: 220, max: Infinity, tone: "d5", who: "장거리 산행 경험자 · 1박 검토", time: "9시간 이상" }
];
