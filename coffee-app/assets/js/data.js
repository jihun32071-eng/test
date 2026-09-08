/* 커피 필드 매뉴얼의 레퍼런스 데이터를 앱에서 쓰는 형태로 정리한 모듈. */
(function (global) {
  'use strict';

  /* 07 브루잉 방식별 원두-물 비율 / 08 물과 온도 / 06 그라인딩 */
  var METHODS = [
    {
      id: 'v60',
      name: '핸드드립',
      sub: 'V60 · 칼리타',
      ratio: 16,
      defaultDose: 20,
      doseRange: [10, 60],
      tempC: [92, 96],
      grind: '중간 (백설탕 정도)',
      grindPos: 38,
      totalSec: 240,
      note: '92~96도 물로 30초간 블루밍 후 원을 그리며 붓습니다. 산미와 향이 살아있는 깔끔한 맛.',
      /* 물 붓기 스케줄: at(초), 누적 비율(0~1) */
      schedule: [
        { at: 0, to: null, bloom: true, label: '블루밍', desc: '원두 무게의 2배 물을 붓고 30초간 뜸들이기' },
        { at: 30, to: 0.6, label: '1차 푸어', desc: '중심에서 바깥으로 원을 그리며' },
        { at: 90, to: 1, label: '2차 푸어', desc: '목표 물량까지 천천히' },
        { at: 240, to: 1, end: true, label: '추출 완료', desc: '드리퍼의 물이 모두 내려가면 분리' }
      ]
    },
    {
      id: 'french',
      name: '프렌치프레스',
      sub: '침출식',
      ratio: 15,
      defaultDose: 20,
      doseRange: [10, 60],
      tempC: [93, 96],
      grind: '굵게 (거친 소금)',
      grindPos: 70,
      totalSec: 210,
      note: '금속 필터라 오일 성분이 남아 바디감이 묵직합니다. 침전물을 줄이려면 굵은 분쇄도가 필수.',
      schedule: [
        { at: 0, to: 1, label: '전량 붓기', desc: '물을 한 번에 붓고 뚜껑을 덮어 둡니다' },
        { at: 60, to: 1, label: '크러스트 깨기', desc: '표면에 뜬 커피층을 스푼으로 저어 가라앉히기' },
        { at: 210, to: 1, end: true, label: '플런저 내리기', desc: '천천히 눌러 내린 뒤 바로 다른 잔에 옮기기' }
      ]
    },
    {
      id: 'espresso',
      name: '에스프레소',
      sub: '9바 가압 추출',
      ratio: 2,
      defaultDose: 18,
      doseRange: [7, 25],
      tempC: [92, 94],
      grind: '아주 곱게 (설탕가루)',
      grindPos: 8,
      totalSec: 27,
      timeLabel: '20~30초',
      note: '9바 전후의 고압으로 짧게 추출하는 농축 커피. 분쇄도가 맛을 좌우하는 가장 중요한 변수.',
      schedule: [
        { at: 0, to: 0, label: '추출 시작', desc: '첫 방울까지 보통 5~8초' },
        { at: 27, to: 1, end: true, label: '추출 종료', desc: '20~30초 안에 목표 추출량 도달' }
      ]
    },
    {
      id: 'coldbrew',
      name: '콜드브루 원액',
      sub: '냉장 침출',
      ratio: 17,
      defaultDose: 60,
      doseRange: [20, 200],
      tempC: null,
      grind: '아주 굵게',
      grindPos: 95,
      steepHours: [12, 18, 24],
      note: '상온이 아닌 냉장에서 장시간 침출. 산미가 적고 부드러우며 카페인 함량이 높은 편.',
      schedule: null
    }
  ];

  /* 05 로스팅 */
  var ROASTS = [
    { id: 'light', name: '라이트', desc: '산미 최대', swatch: 1 },
    { id: 'medium', name: '미디엄', desc: '산미·단맛 균형', swatch: 2 },
    { id: 'mediumdark', name: '미디엄다크', desc: '카라멜·초콜릿', swatch: 3 },
    { id: 'dark', name: '다크', desc: '쓴맛·바디 강조', swatch: 4 }
  ];

  /* 12 음료의 종류 — 구성 비율은 개략적 표현 */
  var DRINKS = [
    { id: 'espresso', name: '에스프레소', shots: 1, parts: [['espresso', 100, '에스프레소']] },
    { id: 'americano', name: '아메리카노', shots: 2, parts: [['espresso', 30, ''], ['water', 70, '뜨거운 물']] },
    { id: 'latte', name: '카페라떼', shots: 1, parts: [['espresso', 20, ''], ['milk', 75, '스팀 밀크'], ['foam', 5, '']] },
    { id: 'cappuccino', name: '카푸치노', shots: 1, parts: [['espresso', 33, ''], ['milk', 33, '밀크'], ['foam', 34, '거품']] },
    { id: 'flatwhite', name: '플랫화이트', shots: 2, parts: [['espresso', 35, ''], ['milk', 60, '얇은 밀크폼'], ['foam', 5, '']] },
    { id: 'macchiato', name: '마키아토', shots: 1, parts: [['espresso', 88, '에스프레소'], ['foam', 12, '']] },
    { id: 'mocha', name: '모카', shots: 1, parts: [['espresso', 22, ''], ['milk', 68, '밀크+초콜릿'], ['foam', 10, '']] },
    { id: 'drip', name: '드립 커피 (240ml)', shots: 0, baseCaffeine: 95, parts: [['water', 100, '드립 추출액']] },
    { id: 'coldbrew', name: '콜드브루 (200ml)', shots: 0, baseCaffeine: 150, parts: [['espresso', 45, ''], ['water', 55, '물·얼음']] }
  ];

  /* 11 카페인과 건강 */
  var CAFFEINE = {
    dailyLimitMg: 400,
    shotMg: 63,          /* 에스프레소 30ml */
    dripMg: 95,          /* 드립 240ml */
    /* 02 품종 — 로부스타는 아라비카의 약 2배 */
    beanFactor: [
      { id: 'arabica', name: '아라비카', factor: 1 },
      { id: 'blend', name: '블렌드', factor: 1.3 },
      { id: 'robusta', name: '로부스타', factor: 2 }
    ]
  };

  /* 10 테이스팅과 커핑 — 5개 항목 × 10점, 합계 ×2 = 100점 환산 */
  var CUPPING = {
    min: 6,
    max: 10,
    step: 0.25,
    specialtyScore: 80,
    attrs: [
      { id: 'aroma', name: '아로마', desc: '코로 느끼는 향' },
      { id: 'flavor', name: '플레이버', desc: '맛과 향이 결합된 전체적 인상' },
      { id: 'acidity', name: '애시디티', desc: '산미, 밝고 경쾌한 느낌' },
      { id: 'body', name: '바디', desc: '입 안에서 느껴지는 무게감·질감' },
      { id: 'aftertaste', name: '애프터테이스트', desc: '삼킨 후 남는 여운' }
    ]
  };

  /* SCA 플레이버 휠을 단순화한 향미 태그 */
  var FLAVOR_TAGS = [
    '베리', '감귤', '열대과일', '자두', '자스민', '장미',
    '꿀', '카라멜', '흑설탕', '초콜릿', '너트', '곡물',
    '허브', '스파이스', '흙내음', '스모키', '와인', '발효'
  ];

  /* 04 가공 방식 */
  var PROCESSES = ['워시드', '내추럴', '허니', '무산소 발효', '기타'];

  /* 03 재배와 산지 */
  var ORIGINS = ['에티오피아', '케냐', '콜롬비아', '브라질', '과테말라', '코스타리카', '파나마', '인도네시아', '베트남', '블렌드', '기타'];

  /* 09 보관법 — 로스팅 후 경과일에 따른 상태 */
  var FRESHNESS = [
    { maxDays: 1, id: 'gassing', label: '가스 배출 중', desc: '이산화탄소가 많아 맛이 아직 불안정합니다.' },
    { maxDays: 14, id: 'peak', label: '최적 구간', desc: '디게싱이 끝나 향미가 가장 안정적인 시기입니다.' },
    { maxDays: 28, id: 'good', label: '양호', desc: '2~4주 이내 소비를 권장합니다.' },
    { maxDays: Infinity, id: 'old', label: '기한 지남', desc: '산화가 진행되었습니다. 밀폐·차광·건조 보관을 확인하세요.' }
  ];

  global.CoffeeData = {
    METHODS: METHODS,
    ROASTS: ROASTS,
    DRINKS: DRINKS,
    CAFFEINE: CAFFEINE,
    CUPPING: CUPPING,
    FLAVOR_TAGS: FLAVOR_TAGS,
    PROCESSES: PROCESSES,
    ORIGINS: ORIGINS,
    FRESHNESS: FRESHNESS,
    methodById: function (id) {
      for (var i = 0; i < METHODS.length; i++) if (METHODS[i].id === id) return METHODS[i];
      return METHODS[0];
    },
    drinkById: function (id) {
      for (var i = 0; i < DRINKS.length; i++) if (DRINKS[i].id === id) return DRINKS[i];
      return DRINKS[0];
    },
    freshnessOf: function (days) {
      for (var i = 0; i < FRESHNESS.length; i++) if (days <= FRESHNESS[i].maxDays) return FRESHNESS[i];
      return FRESHNESS[FRESHNESS.length - 1];
    }
  };
})(window);
