/* 추출 레시피 계산기 · 브루잉 타이머 · 콜드브루 침출 기록 */
(function (global) {
  'use strict';

  var D = global.CoffeeData;
  var S = global.Store;
  var $ = S.$, el = S.el;

  /* 원두 1g당 대략적인 카페인 추출량(mg). 매뉴얼의 드립 240ml=95mg,
     에스프레소 30ml=63mg 기준을 일반적인 도징량으로 환산한 값입니다. */
  var CAFFEINE_PER_G = { v60: 6.3, french: 6, espresso: 3.5, coldbrew: 7 };
  var CUP_ML = 240;

  var state = {
    methodId: 'v60',
    dose: 20,
    ratio: 16,
    cups: ''
  };

  var timer = { running: false, startedAt: 0, elapsed: 0, tick: null, lastStep: -1 };
  var audioCtx = null;

  function method() { return D.methodById(state.methodId); }
  function waterMl() { return state.dose * state.ratio; }

  /* ---------- 계산 ---------- */
  function stepWater(step, total) {
    if (step.bloom) return S.round(state.dose * 2, 0);
    if (step.to === null || step.to === undefined) return null;
    return S.round(total * step.to, 0);
  }

  function schedule() {
    var m = method();
    if (!m.schedule) return [];
    var total = waterMl();
    var prev = 0;
    return m.schedule.map(function (s) {
      var target = stepWater(s, total);
      var add = target === null ? null : Math.max(0, S.round(target - prev, 0));
      if (target !== null) prev = target;
      return {
        at: s.at,
        label: s.label,
        desc: s.desc,
        end: !!s.end,
        target: target,
        add: add
      };
    });
  }

  /* ---------- 렌더 ---------- */
  function renderMethods() {
    var box = S.clear($('#method-chips'));
    D.METHODS.forEach(function (m) {
      box.appendChild(el('button', {
        type: 'button',
        class: 'chip',
        'aria-pressed': String(m.id === state.methodId),
        onclick: function () { selectMethod(m.id); }
      }, [
        el('span', { text: m.name }),
        el('small', { text: '1 : ' + m.ratio + ' · ' + m.sub })
      ]));
    });
  }

  function renderFigures() {
    var m = method();
    var box = S.clear($('#figures'));
    var total = waterMl();

    box.appendChild(figure('원두', S.round(state.dose, 1), 'g'));
    box.appendChild(figure(m.id === 'espresso' ? '추출량' : '물', S.round(total, 0), 'ml'));
    box.appendChild(figure('온도', m.tempC ? m.tempC[0] + '~' + m.tempC[1] : '냉장', m.tempC ? '°C' : ''));
    box.appendChild(figure('시간', m.steepHours ? steepChoice() + '시간' : (m.timeLabel || S.formatClock(m.totalSec)), ''));
    box.appendChild(figure('비율', '1 : ' + S.round(state.ratio, 1), ''));

    $('#ratio-view').textContent = '1 : ' + S.round(state.ratio, 1);
    $('#method-note').textContent = m.note + ' 분쇄도: ' + m.grind + '.';

    var track = S.clear($('#grind-track'));
    track.appendChild(el('div', {
      class: 'scale-marker dot',
      style: 'left:' + m.grindPos + '%'
    }, [el('span', { class: 'tip', text: m.name })]));
  }

  function figure(k, v, u) {
    return el('div', { class: 'figure' }, [
      el('div', { class: 'k', text: k }),
      el('div', { class: 'v' }, [document.createTextNode(String(v)), u ? el('span', { class: 'u', text: u }) : null])
    ]);
  }

  function renderSteps() {
    var list = S.clear($('#steps'));
    var steps = schedule();
    var elapsed = timer.elapsed;

    steps.forEach(function (s, i) {
      var next = steps[i + 1];
      var isCurrent = timer.running && elapsed >= s.at && (!next || elapsed < next.at);
      var isDone = elapsed > s.at && !isCurrent;
      list.appendChild(el('li', {
        class: 'step' + (isCurrent ? ' current' : '') + (isDone ? ' done' : '')
      }, [
        el('span', { class: 'at', text: S.formatClock(s.at) }),
        el('span', {}, [
          el('div', { class: 'name', text: s.label }),
          s.target !== null && !s.end
            ? el('div', { class: 'water', text: '누적 ' + s.target + 'ml' + (s.add ? ' (+' + s.add + 'ml)' : '') })
            : null,
          el('div', { class: 'desc', text: s.desc })
        ])
      ]));
    });
  }

  function renderTimer() {
    var m = method();
    var steps = schedule();
    $('#clock').textContent = S.formatClock(timer.elapsed);
    $('#clock-total').textContent = ' / ' + S.formatClock(m.totalSec);
    $('#timer-toggle').textContent = timer.running ? '일시정지' : (timer.elapsed > 0 ? '이어서' : '시작');
    var pct = S.clamp((timer.elapsed / m.totalSec) * 100, 0, 100);
    $('#timer-progress').style.width = pct + '%';

    var status = '';
    if (timer.elapsed >= m.totalSec) {
      status = '추출 완료 — ' + S.formatClock(m.totalSec) + ' 도달';
    } else {
      for (var i = steps.length - 1; i >= 0; i--) {
        if (timer.elapsed >= steps[i].at) {
          status = steps[i].label + (steps[i].target !== null && !steps[i].end ? ' · 누적 ' + steps[i].target + 'ml까지' : '') ;
          break;
        }
      }
    }
    $('#timer-status').textContent = status;
  }

  function renderSteep() {
    var m = method();
    var isSteep = !!m.steepHours;
    $('#timer-panel').hidden = isSteep;
    $('#steep-panel').hidden = !isSteep;
    if (!isSteep) return;

    var box = S.clear($('#steep-hours'));
    m.steepHours.forEach(function (h) {
      box.appendChild(el('button', {
        type: 'button',
        class: 'chip',
        'aria-pressed': String(h === steepChoice()),
        onclick: function () { S.write('steep-hours', h); renderSteep(); renderFigures(); }
      }, [document.createTextNode(h + '시간')]));
    });
    renderSteepStatus();
  }

  function steepChoice() { return S.read('steep-hours', 18); }

  function renderSteepStatus() {
    var startedAt = S.read('steep-started', null);
    var out = $('#steep-status');
    if (!startedAt) {
      out.textContent = '아직 담근 기록이 없습니다.';
      return;
    }
    var start = new Date(startedAt);
    var hours = steepChoice();
    var done = new Date(start.getTime() + hours * 3600000);
    var leftMin = Math.round((done.getTime() - Date.now()) / 60000);
    var when = (done.getDate() !== start.getDate() ? '다음날 ' : '') + S.formatTime(done);
    out.textContent = leftMin > 0
      ? '담근 시각 ' + S.formatTime(start) + ' · 완료 예정 ' + when +
        ' (약 ' + Math.floor(leftMin / 60) + '시간 ' + (leftMin % 60) + '분 남음)'
      : '침출 완료 — ' + when + '에 ' + hours + '시간을 채웠습니다. 원액을 걸러 냉장 보관하세요.';
  }

  /* ---------- 타이머 ---------- */
  function beep() {
    try {
      if (!audioCtx) {
        var Ctx = global.AudioContext || global.webkitAudioContext;
        if (!Ctx) return;
        audioCtx = new Ctx();
      }
      var osc = audioCtx.createOscillator();
      var gain = audioCtx.createGain();
      osc.frequency.value = 660;
      gain.gain.setValueAtTime(0.14, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.35);
      osc.connect(gain).connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.36);
    } catch (e) { /* 소리는 부가 기능이므로 실패해도 무시합니다. */ }
  }

  function tick() {
    timer.elapsed = (Date.now() - timer.startedAt) / 1000;
    var steps = schedule();
    var idx = -1;
    for (var i = 0; i < steps.length; i++) if (timer.elapsed >= steps[i].at) idx = i;
    if (idx !== timer.lastStep) {
      timer.lastStep = idx;
      if (idx > 0) beep();
    }
    if (timer.elapsed >= method().totalSec) {
      timer.elapsed = method().totalSec;
      stopTimer();
      beep();
    }
    renderTimer();
    renderSteps();
  }

  function startTimer() {
    if (timer.running) return;
    timer.running = true;
    timer.startedAt = Date.now() - timer.elapsed * 1000;
    timer.tick = setInterval(tick, 200);
    tick();
  }

  function stopTimer() {
    timer.running = false;
    if (timer.tick) clearInterval(timer.tick);
    timer.tick = null;
    renderTimer();
    renderSteps();
  }

  function resetTimer() {
    stopTimer();
    timer.elapsed = 0;
    timer.lastStep = -1;
    renderTimer();
    renderSteps();
  }

  /* ---------- 입력 ---------- */
  function selectMethod(id) {
    state.methodId = id;
    var m = method();
    state.ratio = m.ratio;
    state.dose = m.defaultDose;
    state.cups = '';
    $('#dose').value = state.dose;
    $('#dose').min = m.doseRange[0];
    $('#dose').max = m.doseRange[1];
    $('#ratio').value = state.ratio;
    $('#cups').value = '';
    $('#cups').disabled = (id === 'espresso' || id === 'coldbrew');
    resetTimer();
    persist();
    renderAll();
  }

  function applyCups() {
    if (!state.cups) return;
    var total = Number(state.cups) * CUP_ML;
    state.dose = S.round(total / state.ratio, 1);
    $('#dose').value = state.dose;
  }

  function persist() {
    S.write('brew', { methodId: state.methodId, dose: state.dose, ratio: state.ratio });
  }

  function restore() {
    var saved = S.read('brew', null);
    if (!saved) return;
    if (saved.methodId) state.methodId = saved.methodId;
    var m = method();
    state.ratio = typeof saved.ratio === 'number' ? saved.ratio : m.ratio;
    state.dose = typeof saved.dose === 'number' ? saved.dose : m.defaultDose;
  }

  function renderAll() {
    renderMethods();
    renderFigures();
    renderSteps();
    renderTimer();
    renderSteep();
  }

  function brewCaffeineMg() {
    var m = method();
    if (m.id === 'coldbrew') return { mg: 150, label: '콜드브루 1잔 (200ml)' };
    var perG = CAFFEINE_PER_G[m.id] || 6;
    return {
      mg: Math.round(state.dose * perG),
      label: m.name + ' ' + S.round(state.dose, 1) + 'g / ' + S.round(waterMl(), 0) + 'ml'
    };
  }

  function init() {
    restore();
    var m = method();
    $('#dose').value = state.dose;
    $('#dose').min = m.doseRange[0];
    $('#dose').max = m.doseRange[1];
    $('#ratio').value = state.ratio;
    $('#cups').disabled = (m.id === 'espresso' || m.id === 'coldbrew');

    $('#dose').addEventListener('input', function () {
      var v = parseFloat(this.value);
      if (isNaN(v)) return;
      state.dose = S.clamp(v, 1, 500);
      state.cups = '';
      $('#cups').value = '';
      persist();
      renderFigures();
      renderSteps();
    });

    $('#ratio').addEventListener('input', function () {
      state.ratio = parseFloat(this.value);
      applyCups();
      persist();
      renderFigures();
      renderSteps();
    });

    $('#cups').addEventListener('change', function () {
      state.cups = this.value;
      applyCups();
      persist();
      renderFigures();
      renderSteps();
    });

    $('#timer-toggle').addEventListener('click', function () {
      if (timer.running) stopTimer(); else startTimer();
    });
    $('#timer-reset').addEventListener('click', resetTimer);

    $('#log-brew').addEventListener('click', function () {
      var c = brewCaffeineMg();
      global.CaffeineView.add(c.label, c.mg);
      global.App.toast(c.label + ' · 약 ' + c.mg + 'mg 기록했습니다.');
    });

    $('#steep-start').addEventListener('click', function () {
      S.write('steep-started', new Date().toISOString());
      renderSteepStatus();
      global.App.toast('침출 시작 시각을 기록했습니다.');
    });
    $('#steep-clear').addEventListener('click', function () {
      S.write('steep-started', null);
      renderSteepStatus();
    });

    renderAll();
    setInterval(function () {
      if (!$('#steep-panel').hidden) renderSteepStatus();
    }, 60000);
  }

  global.BrewView = { init: init, state: state };
})(window);
