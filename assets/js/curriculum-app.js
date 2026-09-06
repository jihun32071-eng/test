/* 커리큘럼 페이지 — 진행 사다리, 단계 카드, 일정 계산, 진도 저장 */
(function () {
  "use strict";

  var HC = window.HikeCalc;
  HC.enrich(MOUNTAINS);

  var $ = function (s, r) { return (r || document).querySelector(s); };
  function el(tag, cls, text) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (text != null) n.textContent = text;
    return n;
  }

  /* 단계별 목표 코스를 데이터에서 해석 */
  STAGES.forEach(function (st) {
    st.courses = st.targets.map(function (t) {
      var c = HC.findCourse(t[0], t[1]);
      if (!c) throw new Error("코스를 찾을 수 없음: " + t.join(" / "));
      return c;
    }).sort(function (a, b) { return a.idx - b.idx; });
    st.min = st.courses[0].idx;
    st.max = st.courses[st.courses.length - 1].idx;
    st.required = Math.min(st.outings, st.courses.length);
  });

  var TOTAL_OUTINGS = STAGES.reduce(function (n, s) { return n + s.outings; }, 0);
  var TOTAL_COURSES = STAGES.reduce(function (n, s) { return n + s.courses.length; }, 0);
  function key(c) { return c.mountain.id + "|" + c.name; }

  /* ── 진도 저장 ───────────────────────────────────────
     기본은 이 브라우저(localStorage). claude.ai에 게시된 페이지에서는
     db 기능이 붙으면 기기 간에 공유된다. */
  var LS_KEY = "gunja-curriculum-v1";
  var done = {};
  var remote = null;

  function readLocal() {
    try { return JSON.parse(localStorage.getItem(LS_KEY) || "{}"); } catch (e) { return {}; }
  }
  function writeLocal() {
    try { localStorage.setItem(LS_KEY, JSON.stringify(done)); } catch (e) { /* 사생활 보호 모드 등 */ }
  }
  function pushRemote() {
    if (!remote) return;
    remote.set({ done: done, updatedAt: new Date().toISOString() })["catch"](function () { /* 저장 실패는 조용히 무시 */ });
  }

  done = readLocal();

  if (window.claude && typeof window.claude.use === "function") {
    window.claude.use("db").then(function (db) {
      if (!db) return;
      remote = db.doc("progress/state");
      var seeded = false;
      remote.onSnapshot(function (snap) {
        var server = (snap.exists && snap.data() && snap.data().done) || {};
        var merged = {}, k;
        for (k in done) if (Object.prototype.hasOwnProperty.call(done, k)) merged[k] = done[k];
        for (k in server) if (Object.prototype.hasOwnProperty.call(server, k)) merged[k] = server[k];
        var changed = JSON.stringify(merged) !== JSON.stringify(done);
        done = merged;
        writeLocal();
        if (!seeded) {
          seeded = true;
          if (Object.keys(done).length && JSON.stringify(server) !== JSON.stringify(done)) pushRemote();
        }
        if (changed) renderAll();
        markSync("기기 간 저장됨");
      }, function () { remote = null; });
    })["catch"](function () { /* db 없음 — 로컬 저장만 */ });
  }

  function markSync(text) {
    var n = $("#sync-note");
    if (n) n.textContent = text;
  }

  function isDone(c) { return !!done[key(c)]; }
  function toggle(c) {
    var k = key(c);
    if (done[k]) delete done[k];
    else done[k] = new Date().toISOString().slice(0, 10);
    writeLocal();
    pushRemote();
    renderAll();
  }

  /* ── 진행 상태 계산 ─────────────────────────────────── */
  function progress() {
    var completed = [], best = 0;
    STAGES.forEach(function (st) {
      st.doneCount = st.courses.filter(isDone).length;
      st.complete = st.doneCount >= st.required;
      st.courses.forEach(function (c) {
        if (isDone(c)) { completed.push(c); best = Math.max(best, c.idx); }
      });
    });
    var current = STAGES.filter(function (s) { return !s.complete; })[0] || STAGES[STAGES.length - 1];
    return { count: completed.length, best: best, current: current };
  }

  /* ── 일정 ───────────────────────────────────────────── */
  var pace = PACES[0];

  /* 12~2월에는 상급 단계를 올리지 않는다. 겨울에 걸리면 3월로 미루고
     그 사이는 '겨울 유지기'로 둔다. */
  function computeSchedule() {
    var cursor = new Date(START);
    STAGES.forEach(function (st) {
      st.winterGapBefore = false;
      if (st.n >= 3) {
        var m = cursor.getMonth() + 1;
        if (m === 12 || m === 1 || m === 2) {
          cursor = new Date(cursor.getFullYear() + (m === 12 ? 1 : 0), 2, 1);
          st.winterGapBefore = true;
        }
      }
      var end = new Date(cursor);
      end.setDate(end.getDate() + (st.outings - 1) * pace.days);
      st.sched = { start: new Date(cursor), end: end };
      cursor = new Date(end);
      cursor.setDate(cursor.getDate() + pace.days);
    });
  }

  function scheduleFor(stage) { return stage.sched; }

  function fmtMonth(d) { return (d.getMonth() + 1) + "월"; }
  function fmtSpan(s) {
    var a = s.start, b = s.end;
    var head = a.getFullYear() + "년 " + fmtMonth(a);
    if (a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth()) return head;
    if (a.getFullYear() === b.getFullYear()) return head + " ~ " + fmtMonth(b);
    return head + " ~ " + b.getFullYear() + "년 " + fmtMonth(b);
  }
  function hitsWinter(s) {
    var d = new Date(s.start);
    while (d <= s.end) {
      var m = d.getMonth() + 1;
      if (m === 12 || m === 1 || m === 2) return true;
      d.setMonth(d.getMonth() + 1);
    }
    var m2 = s.end.getMonth() + 1;
    return m2 === 12 || m2 === 1 || m2 === 2;
  }

  /* ── 상단 요약 ──────────────────────────────────────── */
  function renderStats() {
    var p = progress();
    var host = $("#progress-stats");
    host.textContent = "";
    var rows = [
      [p.count + " / " + TOTAL_COURSES, "완주한 코스"],
      [p.best ? Math.round(p.best) : "—", "최고 지수 기록"],
      [p.current.n + "단계", p.current.label],
      [fmtSpan(scheduleFor(STAGES[STAGES.length - 1])).replace(/^(\d+)년.*/, "$1년"), "목표 시기 · " + pace.label]
    ];
    rows.forEach(function (r) {
      var d = el("div");
      d.appendChild(el("b", null, r[0]));
      d.appendChild(el("span", null, r[1]));
      host.appendChild(d);
    });
  }

  /* ── 진행 사다리 ────────────────────────────────────── */
  var GRIDS = [
    { v: 50, label: "50" }, { v: 90, label: "90" },
    { v: 150, label: "150" }, { v: 220, label: "220" }
  ];

  function renderLadder() {
    var p = progress();
    var host = $("#ladder");
    host.textContent = "";

    var axis = el("div", "ladder-axis");
    axis.appendChild(el("span", null, "지수 0"));
    GRIDS.forEach(function (g) {
      var s = el("span", null, g.label);
      s.style.left = HC.rulerPos(g.v) + "%";
      axis.appendChild(s);
    });
    var last = el("span", null, "300+");
    last.style.left = "100%";
    axis.appendChild(last);
    host.appendChild(axis);

    var chart = el("div", "ladder-rows");

    /* 눈금선과 현재 기록선은 막대 트랙과 정확히 겹치는 레이어에 올린다 */
    var overlay = el("div", "ladder-grid");
    GRIDS.forEach(function (g) {
      var line = el("i", "gridline");
      line.style.left = HC.rulerPos(g.v) + "%";
      overlay.appendChild(line);
    });
    if (p.best > 0) {
      var mark = el("i", "bestline");
      mark.style.left = HC.rulerPos(p.best) + "%";
      overlay.appendChild(mark);
      var tag = el("span", "bestline-tag", "현재 기록 " + Math.round(p.best));
      tag.style.left = HC.rulerPos(p.best) + "%";
      overlay.appendChild(tag);
    }
    chart.appendChild(overlay);

    STAGES.forEach(function (st) {
      var row = el("div", "ladder-row" + (st.complete ? " is-done" : ""));
      var g = HC.gradeOf(st.max);
      row.style.setProperty("--tone", "var(--" + g.tone + ")");

      var name = el("div", "ladder-name");
      name.appendChild(el("b", null, st.n));
      name.appendChild(el("span", null, st.label));
      row.appendChild(name);

      var track = el("div", "ladder-track");
      var bar = el("i", "ladder-bar" + (st.max > HC.RULER_MAX ? " is-capped" : ""));
      bar.style.width = HC.rulerPos(st.max) + "%";
      track.appendChild(bar);
      row.appendChild(track);

      row.appendChild(el("div", "ladder-val num", Math.round(st.max)));
      chart.appendChild(row);
    });

    host.appendChild(chart);
  }

  /* ── 단계 카드 ──────────────────────────────────────── */
  function list(title, items) {
    var box = el("div", "stage-col");
    box.appendChild(el("h4", null, title));
    var ul = el("ul");
    items.forEach(function (t) { ul.appendChild(el("li", null, t)); });
    box.appendChild(ul);
    return box;
  }

  function courseRow(c) {
    var row = el("label", "target" + (isDone(c) ? " is-done" : ""));
    var g = c.grade;
    row.style.setProperty("--tone", "var(--" + g.tone + ")");
    row.style.setProperty("--tone-bg", "var(--" + g.tone + "-bg)");

    var box = document.createElement("input");
    box.type = "checkbox";
    box.checked = isDone(c);
    box.addEventListener("change", function () { toggle(c); });
    row.appendChild(box);

    var main = el("div", "target-main");

    var head = el("div", "target-head");
    head.appendChild(el("b", null, c.mountain.name));
    head.appendChild(el("span", "target-course", c.name));
    var pill = el("span", "pill");
    pill.appendChild(el("span", null, g.name));
    pill.appendChild(el("span", "num", Math.round(c.idx)));
    head.appendChild(pill);
    main.appendChild(head);

    var figs = el("div", "target-figs num");
    figs.textContent = c.dist.toFixed(1) + "km · 누적 " + c.gain.toLocaleString() + "m · " + HC.fmtTime(c.hrs);
    main.appendChild(figs);

    if (c.mountain.access) {
      var acc = el("div", "target-access");
      acc.appendChild(el("span", "access-label", "군자역에서"));
      acc.appendChild(el("span", null, c.mountain.access));
      main.appendChild(acc);
    }

    if (c.note) main.appendChild(el("div", "target-note", c.note));

    var when = done[key(c)];
    if (when) main.appendChild(el("div", "target-when", when + " 완주"));

    row.appendChild(main);
    return row;
  }

  function stageCard(st, prevMax) {
    var g = HC.gradeOf(st.max);
    var card = el("article", "stage" + (st.complete ? " is-done" : ""));
    card.style.setProperty("--tone", "var(--" + g.tone + ")");
    card.style.setProperty("--tone-bg", "var(--" + g.tone + "-bg)");

    var head = el("header", "stage-head");
    var left = el("div", "stage-id");
    left.appendChild(el("b", null, st.n));
    left.appendChild(el("h3", null, st.label));
    head.appendChild(left);

    var right = el("div", "stage-meta");
    var sched = scheduleFor(st);
    right.appendChild(el("span", "stage-when", fmtSpan(sched)));
    right.appendChild(el("span", "stage-count num",
      st.doneCount + "/" + st.required + " 완주 · 권장 " + st.outings + "회"));
    head.appendChild(right);
    card.appendChild(head);

    card.appendChild(el("p", "stage-goal", st.goal));

    var jump = Math.round(st.max - prevMax);
    if (st.n > 0) {
      var chip = el("p", "stage-jump" + (jump > 40 ? " is-warn" : ""));
      chip.textContent = jump > 40
        ? "이전 단계보다 지수 +" + jump + " — 규칙을 넘는 유일한 구간입니다. 6단계를 여러 번 반복한 뒤에 붙으세요."
        : "이전 단계보다 지수 +" + jump;
      card.appendChild(chip);
    }

    if (hitsWinter(sched) && st.n >= 2) {
      var w = el("p", "stage-winter");
      w.textContent = "이 단계의 마지막 산행이 12~2월에 걸칩니다. 결빙이 있으면 무리하지 말고 겨울 유지기 코스로 대체하세요.";
      card.appendChild(w);
    }

    var targets = el("div", "targets");
    st.courses.forEach(function (c) { targets.appendChild(courseRow(c)); });
    card.appendChild(targets);

    var cols = el("div", "stage-cols");
    cols.appendChild(list("이 단계에서 익히는 것", st.learn));
    cols.appendChild(list("통과 기준", st.pass));
    cols.appendChild(list("추가로 필요한 장비", st.gear));
    card.appendChild(cols);

    return card;
  }

  function winterCard() {
    var card = el("article", "stage stage-rest");
    var head = el("header", "stage-head");
    var left = el("div", "stage-id");
    left.appendChild(el("b", null, "❄"));
    left.appendChild(el("h3", null, "겨울 유지기"));
    head.appendChild(left);
    var right = el("div", "stage-meta");
    right.appendChild(el("span", "stage-when", "매년 12월 ~ 2월"));
    right.appendChild(el("span", "stage-count", "지수를 올리지 않는 구간"));
    head.appendChild(right);
    card.appendChild(head);

    card.appendChild(el("p", "stage-goal",
      "결빙된 암릉은 같은 코스라도 난도가 한 단계 이상 올라갑니다. 겨울에는 지수를 올리는 대신 유지하고, " +
      "눈 산행은 경사가 완만한 육산에서 배웁니다. 아래 네 곳은 모두 들머리 표고가 높아 고도차가 적습니다."));

    var targets = el("div", "targets");
    WINTER_SWAP.map(function (t) { return HC.findCourse(t[0], t[1]); })
      .filter(Boolean)
      .sort(function (a, b) { return a.idx - b.idx; })
      .forEach(function (c) { targets.appendChild(courseRow(c)); });
    card.appendChild(targets);

    var cols = el("div", "stage-cols");
    cols.appendChild(list("이 시기에 하는 것", [
      "주중 아차산 유지 산행 — 눈이 와도 그대로",
      "완만한 육산에서 아이젠 걷기 연습",
      "체력을 올리기보다 떨어뜨리지 않기"
    ]));
    cols.appendChild(list("피할 것", [
      "북한산·도봉산·수락산 등 바위 구간의 결빙",
      "해가 짧은 시기의 늦은 출발",
      "젖은 면 소재 옷"
    ]));
    cols.appendChild(list("겨울 장비", [
      "아이젠(체인젠 이상)과 스패츠",
      "보온 장갑·모자, 여벌 장갑",
      "보온병과 따뜻한 행동식"
    ]));
    card.appendChild(cols);
    return card;
  }

  function renderStages() {
    var host = $("#stages");
    host.textContent = "";
    var prev = 0, restShown = false;
    STAGES.forEach(function (st) {
      if (st.winterGapBefore && !restShown) {
        host.appendChild(winterCard());
        restShown = true;
      }
      host.appendChild(stageCard(st, prev));
      prev = st.max;
    });
  }

  /* ── 페이스 ─────────────────────────────────────────── */
  function renderPace() {
    var host = $("#paceChips");
    host.textContent = "";
    PACES.forEach(function (p) {
      var b = el("button", "chip", p.label);
      b.type = "button";
      b.setAttribute("aria-pressed", p === pace ? "true" : "false");
      b.addEventListener("click", function () { pace = p; renderAll(); });
      host.appendChild(b);
    });
    var end = scheduleFor(STAGES[STAGES.length - 1]).end;
    $("#pace-summary").textContent =
      "총 " + TOTAL_OUTINGS + "회 산행입니다. " + pace.label + "로 가면 마지막 단계는 " +
      end.getFullYear() + "년 " + (end.getMonth() + 1) + "월쯤입니다. " +
      "빈도를 바꾸면 아래 단계의 시기가 다시 계산됩니다.";
  }

  function renderAll() {
    computeSchedule();
    renderStats();
    renderLadder();
    renderStages();
    renderPace();
  }

  /* ── 등고선 배경 ────────────────────────────────────── */
  (function contour() {
    var canvas = $("#contour");
    if (!canvas || !canvas.getContext) return;
    var ctx = canvas.getContext("2d");
    function draw() {
      var host = canvas.parentNode;
      var w = host.offsetWidth, h = host.offsetHeight;
      var dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = w * dpr; canvas.height = h * dpr;
      canvas.style.width = w + "px"; canvas.style.height = h + "px";
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, w, h);
      ctx.strokeStyle = getComputedStyle(document.documentElement).getPropertyValue("--contour").trim() || "rgba(0,0,0,.1)";
      ctx.lineWidth = 1;
      var cx = w * 0.84, cy = h * 0.52, base = Math.max(w, h) * 0.06;
      for (var ring = 0; ring < 16; ring++) {
        var r0 = base + ring * Math.max(w, h) * 0.035;
        ctx.beginPath();
        for (var a = 0; a <= 360; a += 3) {
          var t = a * Math.PI / 180;
          var r = r0 * (1 + 0.16 * Math.sin(3 * t + ring * 0.22) + 0.07 * Math.sin(5 * t - ring * 0.15));
          var x = cx + r * Math.cos(t) * 1.35, y = cy + r * Math.sin(t);
          if (a === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
        }
        ctx.closePath(); ctx.stroke();
      }
    }
    draw();
    var t;
    window.addEventListener("resize", function () { clearTimeout(t); t = setTimeout(draw, 150); });
    if (window.matchMedia) {
      var mq = window.matchMedia("(prefers-color-scheme: dark)");
      if (mq.addEventListener) mq.addEventListener("change", draw);
    }
  })();

  renderAll();
})();
