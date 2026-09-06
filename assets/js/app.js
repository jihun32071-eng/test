/* 산길 난이도 도감 — 렌더링 및 상호작용 */
(function () {
  "use strict";

  /* ── 계산 ─────────────────────────────────────────── */
  function difficulty(dist, gain, terrain) {
    var f = (TERRAIN[terrain] || TERRAIN.earth).factor;
    return Math.sqrt(2 * gain * dist) * f;
  }

  function hours(dist, gain, terrain) {
    var f = (TERRAIN[terrain] || TERRAIN.earth).factor;
    return (dist / 3 + gain / 450) * (1 + (f - 1) / 2);
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

  var RULER_MAX = 300;
  function rulerPos(idx) { return Math.min(idx / RULER_MAX, 1) * 100; }

  /* 산의 대표 코스 = 가장 수월한 코스 */
  function easiest(m) {
    return m.courses.reduce(function (a, c) {
      return difficulty(c.dist, c.gain, c.terrain) < difficulty(a.dist, a.gain, a.terrain) ? c : a;
    });
  }

  MOUNTAINS.forEach(function (m) {
    m.courses.forEach(function (c) {
      c.idx = difficulty(c.dist, c.gain, c.terrain);
      c.hrs = hours(c.dist, c.gain, c.terrain);
      c.grade = gradeOf(c.idx);
    });
    var rep = easiest(m);
    m.idx = rep.idx;
    m.grade = rep.grade;
    m.rep = rep;
    m.maxIdx = Math.max.apply(null, m.courses.map(function (c) { return c.idx; }));
    m.maxGrade = gradeOf(m.maxIdx);
  });

  var $ = function (s, r) { return (r || document).querySelector(s); };
  var el = function (tag, cls, text) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (text != null) n.textContent = text;
    return n;
  };

  /* ── 요약 수치 ────────────────────────────────────── */
  (function stats() {
    var courses = MOUNTAINS.reduce(function (n, m) { return n + m.courses.length; }, 0);
    var highest = MOUNTAINS.reduce(function (a, m) { return m.elev > a.elev ? m : a; });
    var data = [
      [MOUNTAINS.length, "개 산"],
      [courses, "개 코스"],
      [highest.elev.toLocaleString() + "m", "최고 표고 · " + highest.name],
      ["5", "난이도 등급"]
    ];
    var heading = document.getElementById("list-heading");
    if (heading) heading.textContent = MOUNTAINS.length + "개 산, " + courses + "개 코스";
    var wrap = $("#stats");
    data.forEach(function (d) {
      var row = el("div");
      row.appendChild(el("b", null, d[0]));
      row.appendChild(el("span", null, d[1]));
      wrap.appendChild(row);
    });
  })();

  /* ── 등급 띠 ──────────────────────────────────────── */
  (function gradeBand() {
    var wrap = $("#gradeBand");
    GRADES.forEach(function (g) {
      var box = el("div");
      box.style.setProperty("--tone", "var(--" + g.tone + ")");
      box.appendChild(el("h3", null, g.name));
      box.appendChild(el("p", "idx num", "지수 " + g.range));
      box.appendChild(el("p", "who", g.who));
      box.appendChild(el("p", "hrs", g.time));
      wrap.appendChild(box);
    });
  })();

  /* ── 지형계수 표 ──────────────────────────────────── */
  (function terrainTable() {
    var body = $("#terrainTable tbody");
    Object.keys(TERRAIN).forEach(function (k) {
      var t = TERRAIN[k];
      var tr = el("tr");
      tr.appendChild(el("td", null, t.label));
      tr.appendChild(el("td", null, t.desc));
      tr.appendChild(el("td", null, "×" + t.factor.toFixed(1)));
      body.appendChild(tr);
    });
  })();

  /* ── 계산기 ───────────────────────────────────────── */
  (function calculator() {
    var dist = $("#in-dist"), gain = $("#in-gain"), terrain = $("#in-terrain");
    var score = $("#calc-score"), gradeOut = $("#calc-grade"), time = $("#calc-time");
    var ruler = $("#calc-ruler"), note = $("#calc-note"), readout = $("#readout");

    Object.keys(TERRAIN).forEach(function (k) {
      var o = el("option", null, TERRAIN[k].label + " (×" + TERRAIN[k].factor.toFixed(1) + ")");
      o.value = k;
      terrain.appendChild(o);
    });
    terrain.value = "rock";

    function update() {
      var d = parseFloat(dist.value), g = parseFloat(gain.value);
      if (!(d > 0) || !(g > 0)) {
        score.firstChild.nodeValue = "—";
        gradeOut.textContent = "";
        time.textContent = "—";
        note.textContent = "거리와 누적 상승고도를 0보다 큰 값으로 입력하세요.";
        return;
      }
      var idx = difficulty(d, g, terrain.value);
      var gr = gradeOf(idx);
      readout.style.setProperty("--tone", "var(--" + gr.tone + ")");
      score.firstChild.nodeValue = Math.round(idx);
      gradeOut.textContent = gr.name;
      time.textContent = fmtTime(hours(d, g, terrain.value));
      ruler.style.setProperty("--pos", rulerPos(idx).toFixed(1) + "%");
      note.textContent = gr.who + " 수준입니다. 평균 경사는 " +
        (g / (d * 1000) * 100).toFixed(1) + "%이며, 지형계수 ×" +
        TERRAIN[terrain.value].factor.toFixed(1) + "가 적용됐습니다.";
    }

    [dist, gain, terrain].forEach(function (n) {
      n.addEventListener("input", update);
      n.addEventListener("change", update);
    });
    update();
  })();

  /* ── 필터 ─────────────────────────────────────────── */
  var state = { q: "", regions: [], grades: [], sort: "idx-asc" };

  var REGIONS = MOUNTAINS.reduce(function (acc, m) {
    m.region.split("·").forEach(function (r) { if (acc.indexOf(r) < 0) acc.push(r); });
    return acc;
  }, []);

  function makeChips(host, items, key, toneOf) {
    items.forEach(function (item) {
      var b = el("button", "chip" + (toneOf ? " g" : ""), item.label);
      b.type = "button";
      b.setAttribute("aria-pressed", "false");
      if (toneOf) b.style.setProperty("--tone", "var(--" + toneOf(item) + ")");
      b.addEventListener("click", function () {
        var on = b.getAttribute("aria-pressed") === "true";
        b.setAttribute("aria-pressed", on ? "false" : "true");
        var arr = state[key];
        var i = arr.indexOf(item.value);
        if (on) { if (i >= 0) arr.splice(i, 1); } else if (i < 0) { arr.push(item.value); }
        render();
      });
      host.appendChild(b);
    });
  }

  makeChips($("#regionChips"), REGIONS.map(function (r) { return { label: r, value: r }; }), "regions");
  makeChips($("#gradeChips"), GRADES.map(function (g) { return { label: g.name, value: g.key, tone: g.tone }; }),
    "grades", function (item) { return item.tone; });

  $("#q").addEventListener("input", function (e) { state.q = e.target.value.trim(); render(); });
  $("#sort").addEventListener("change", function (e) { state.sort = e.target.value; render(); });
  $("#reset").addEventListener("click", function () {
    state = { q: "", regions: [], grades: [], sort: state.sort };
    $("#q").value = "";
    Array.prototype.forEach.call(document.querySelectorAll(".chip"), function (c) {
      c.setAttribute("aria-pressed", "false");
    });
    render();
  });

  var SORTS = {
    "idx-asc": function (a, b) { return a.idx - b.idx; },
    "idx-desc": function (a, b) { return b.idx - a.idx; },
    "elev-desc": function (a, b) { return b.elev - a.elev; },
    "elev-asc": function (a, b) { return a.elev - b.elev; },
    "name": function (a, b) { return a.name.localeCompare(b.name, "ko"); }
  };

  function matches(m) {
    if (state.q) {
      var hay = (m.name + " " + m.region + " " + m.area + " " + m.summary).toLowerCase();
      if (hay.indexOf(state.q.toLowerCase()) < 0) return false;
    }
    if (state.regions.length && !state.regions.some(function (r) { return m.region.indexOf(r) >= 0; })) return false;
    if (state.grades.length && state.grades.indexOf(m.grade.key) < 0) return false;
    return true;
  }

  /* ── 카드 ─────────────────────────────────────────── */
  function card(m) {
    var b = el("button", "card");
    b.type = "button";
    b.style.setProperty("--tone", "var(--" + m.grade.tone + ")");
    b.style.setProperty("--tone-bg", "var(--" + m.grade.tone + "-bg)");
    b.setAttribute("aria-label", m.name + " 상세 보기");

    var top = el("div", "card-top");
    top.appendChild(el("h3", null, m.name));
    top.appendChild(el("span", "elev num", m.elev.toLocaleString() + "m"));
    b.appendChild(top);

    var meta = el("div", "meta");
    var pill = el("span", "pill");
    pill.appendChild(el("span", null, m.grade.name));
    pill.appendChild(el("span", "num", Math.round(m.idx)));
    meta.appendChild(pill);
    if (m.maxGrade.key !== m.grade.key) {
      var range = el("span", "pill ghost");
      range.style.setProperty("--tone", "var(--" + m.maxGrade.tone + ")");
      range.appendChild(el("span", null, "최고 " + m.maxGrade.name));
      range.appendChild(el("span", "num", Math.round(m.maxIdx)));
      meta.appendChild(range);
    }
    meta.appendChild(el("span", "tag", m.region));
    if (m.park) meta.appendChild(el("span", "tag", m.park));
    b.appendChild(meta);

    b.appendChild(el("p", "summary", m.summary));

    var foot = el("div", "foot");
    foot.appendChild(el("span", "courses-n", "코스 " + m.courses.length + "개 · " + fmtTime(m.rep.hrs) + "부터"));
    var bar = el("div", "minibar");
    var fill = el("i");
    fill.style.width = rulerPos(m.idx).toFixed(1) + "%";
    bar.appendChild(fill);
    foot.appendChild(bar);
    b.appendChild(foot);

    b.addEventListener("click", function () { openSheet(m); });
    return b;
  }

  function render() {
    var list = MOUNTAINS.filter(matches).sort(SORTS[state.sort]);
    var grid = $("#grid");
    grid.textContent = "";
    list.forEach(function (m) { grid.appendChild(card(m)); });
    $("#count").textContent = list.length;
    $("#empty").hidden = list.length > 0;
  }

  /* ── 상세 ─────────────────────────────────────────── */
  var sheet = $("#sheet");

  function figure(label, value) {
    var d = el("div");
    d.appendChild(el("dt", null, label));
    d.appendChild(el("dd", null, value));
    return d;
  }

  function openSheet(m) {
    sheet.textContent = "";
    var box = el("div", "sheet");

    var head = el("div", "sheet-head");
    var titles = el("div");
    var h2 = el("h2", null, m.name);
    h2.id = "sheet-title";
    titles.appendChild(h2);
    titles.appendChild(el("p", "elev num", m.elev.toLocaleString() + "m · " + m.area));
    head.appendChild(titles);
    var close = el("button", "close", "닫기");
    close.type = "button";
    close.addEventListener("click", function () { sheet.close(); });
    head.appendChild(close);
    box.appendChild(head);

    var body = el("div", "sheet-body");

    var meta = el("div", "meta");
    if (m.park) meta.appendChild(el("span", "tag", m.park));
    meta.appendChild(el("span", "tag", m.region));
    if (m.season) meta.appendChild(el("span", "tag", m.season));
    body.appendChild(meta);

    body.appendChild(el("p", null, m.summary));

    m.courses.slice().sort(function (a, b) { return a.idx - b.idx; }).forEach(function (c) {
      var wrap = el("div", "course");
      wrap.style.setProperty("--tone", "var(--" + c.grade.tone + ")");
      wrap.style.setProperty("--tone-bg", "var(--" + c.grade.tone + "-bg)");

      var top = el("div", "course-top");
      top.appendChild(el("h4", null, c.name));
      var pill = el("span", "pill");
      pill.appendChild(el("span", null, c.grade.name));
      pill.appendChild(el("span", "num", Math.round(c.idx)));
      top.appendChild(pill);
      wrap.appendChild(top);

      var figs = el("dl", "figures");
      figs.appendChild(figure("거리", c.dist.toFixed(1) + " km"));
      figs.appendChild(figure("누적 상승", c.gain.toLocaleString() + " m"));
      figs.appendChild(figure("형태", c.shape));
      figs.appendChild(figure("지형", TERRAIN[c.terrain].label));
      figs.appendChild(figure("예상 시간", fmtTime(c.hrs)));
      wrap.appendChild(figs);

      var ruler = el("div", "ruler");
      ruler.style.setProperty("--pos", rulerPos(c.idx).toFixed(1) + "%");
      ruler.appendChild(el("div", "ruler-track"));
      ruler.appendChild(el("div", "ruler-mark"));
      var ticks = el("div", "ruler-ticks");
      ["0", "50", "90", "150", "220", "300+"].forEach(function (t) { ticks.appendChild(el("span", null, t)); });
      ruler.appendChild(ticks);
      wrap.appendChild(ruler);

      if (c.note) wrap.appendChild(el("p", "note", c.note));
      body.appendChild(wrap);
    });

    body.appendChild(el("p", "disclaimer",
      "거리와 누적 상승고도는 근사값이며, 실제 경로·측정 방식에 따라 달라집니다. " +
      "탐방로 개방 여부와 입산 통제 시각은 국립공원공단 등 관리 기관의 공지를 확인하세요."));

    box.appendChild(body);
    sheet.appendChild(box);
    sheet.showModal();
  }

  sheet.addEventListener("click", function (e) {
    if (e.target === sheet) sheet.close();
  });

  /* ── 등고선 배경 ──────────────────────────────────── */
  (function contour() {
    var canvas = $("#contour");
    if (!canvas || !canvas.getContext) return;
    var ctx = canvas.getContext("2d");

    function draw() {
      var host = canvas.parentNode;
      var w = host.offsetWidth, h = host.offsetHeight;
      var dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      canvas.style.width = w + "px";
      canvas.style.height = h + "px";
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, w, h);
      ctx.strokeStyle = getComputedStyle(document.documentElement).getPropertyValue("--contour").trim() || "rgba(0,0,0,.1)";
      ctx.lineWidth = 1;

      var cx = w * 0.84, cy = h * 0.52;
      var base = Math.max(w, h) * 0.06;
      for (var ring = 0; ring < 16; ring++) {
        var r0 = base + ring * Math.max(w, h) * 0.035;
        ctx.beginPath();
        for (var a = 0; a <= 360; a += 3) {
          var t = a * Math.PI / 180;
          var r = r0 * (1 + 0.16 * Math.sin(3 * t + ring * 0.22) + 0.07 * Math.sin(5 * t - ring * 0.15));
          var x = cx + r * Math.cos(t) * 1.35;
          var y = cy + r * Math.sin(t);
          if (a === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
        }
        ctx.closePath();
        ctx.stroke();
      }
    }

    draw();
    var t;
    window.addEventListener("resize", function () {
      clearTimeout(t);
      t = setTimeout(draw, 150);
    });
    if (window.matchMedia) {
      var mq = window.matchMedia("(prefers-color-scheme: dark)");
      if (mq.addEventListener) mq.addEventListener("change", draw);
    }
  })();

  render();
})();
