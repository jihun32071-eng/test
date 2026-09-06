/* 난이도 지수 계산 — index.html과 curriculum.html이 함께 쓴다. */
(function (global) {
  "use strict";

  var RULER_MAX = 300;

  function factor(terrain) {
    return (TERRAIN[terrain] || TERRAIN.earth).factor;
  }

  /* 지수 = √(2 × 누적상승 × 거리) × 지형계수 */
  function difficulty(dist, gain, terrain) {
    return Math.sqrt(2 * gain * dist) * factor(terrain);
  }

  /* 소요시간 = (거리 ÷ 3km/h + 누적상승 ÷ 450m/h) × 지형 보정 */
  function hours(dist, gain, terrain) {
    return (dist / 3 + gain / 450) * (1 + (factor(terrain) - 1) / 2);
  }

  function gradeOf(idx) {
    for (var i = 0; i < GRADES.length; i++) {
      if (idx < GRADES[i].max) return GRADES[i];
    }
    return GRADES[GRADES.length - 1];
  }

  function fmtTime(h) {
    var total = Math.round(h * 60);
    var hh = Math.floor(total / 60);
    var mm = total % 60;
    if (hh === 0) return mm + "분";
    return mm === 0 ? hh + "시간" : hh + "시간 " + mm + "분";
  }

  function rulerPos(idx) {
    return Math.min(idx / RULER_MAX, 1) * 100;
  }

  /* 모든 코스에 지수·소요시간·등급을 붙인다. */
  function enrich(mountains) {
    mountains.forEach(function (m) {
      m.courses.forEach(function (c) {
        c.idx = difficulty(c.dist, c.gain, c.terrain);
        c.hrs = hours(c.dist, c.gain, c.terrain);
        c.grade = gradeOf(c.idx);
        c.mountain = m;
      });
      var rep = m.courses.reduce(function (a, c) { return c.idx < a.idx ? c : a; });
      m.rep = rep;
      m.idx = rep.idx;
      m.grade = rep.grade;
      m.maxIdx = Math.max.apply(null, m.courses.map(function (c) { return c.idx; }));
      m.maxGrade = gradeOf(m.maxIdx);
    });
    return mountains;
  }

  function findCourse(id, needle) {
    var m = MOUNTAINS.filter(function (x) { return x.id === id; })[0];
    if (!m) return null;
    var c = m.courses.filter(function (x) { return x.name.indexOf(needle) >= 0; })[0];
    return c || null;
  }

  global.HikeCalc = {
    RULER_MAX: RULER_MAX,
    difficulty: difficulty,
    hours: hours,
    gradeOf: gradeOf,
    fmtTime: fmtTime,
    rulerPos: rulerPos,
    enrich: enrich,
    findCourse: findCourse
  };
})(window);
