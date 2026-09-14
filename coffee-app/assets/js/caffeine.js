/* 카페인 트래커 — 하루 섭취량과 최근 7일 추이 */
(function (global) {
  'use strict';

  var D = global.CoffeeData;
  var S = global.Store;
  var $ = S.$, el = S.el;
  var C = D.CAFFEINE;

  var selectedDrink = 'americano';

  function all() { return S.read('caffeine', {}); }
  function saveAll(v) { S.write('caffeine', v); }

  function entriesFor(key) {
    var log = all();
    return Array.isArray(log[key]) ? log[key] : [];
  }

  function totalFor(key) {
    return entriesFor(key).reduce(function (sum, e) { return sum + (Number(e.mg) || 0); }, 0);
  }

  function add(label, mg) {
    var key = S.dateKey();
    var log = all();
    if (!Array.isArray(log[key])) log[key] = [];
    log[key].push({ id: S.uid(), label: label, mg: Math.round(mg), at: new Date().toISOString() });
    saveAll(log);
    render();
  }

  function remove(id) {
    var key = S.dateKey();
    var log = all();
    log[key] = entriesFor(key).filter(function (e) { return e.id !== id; });
    saveAll(log);
    render();
  }

  function beanFactor(id) {
    for (var i = 0; i < C.beanFactor.length; i++) if (C.beanFactor[i].id === id) return C.beanFactor[i];
    return C.beanFactor[0];
  }

  function estimate() {
    var drink = D.drinkById(selectedDrink);
    var shots = parseInt($('#drink-shots').value, 10);
    var count = S.clamp(parseInt($('#drink-count').value, 10) || 1, 1, 10);
    var bean = beanFactor($('#drink-bean').value);
    var base = typeof drink.baseCaffeine === 'number'
      ? drink.baseCaffeine
      : (isNaN(shots) ? drink.shots : shots) * C.shotMg;
    var mg = Math.round(base * bean.factor * count);
    var parts = [drink.name];
    if (drink.shots > 0 && !isNaN(shots)) parts.push(shots + '샷');
    if (bean.factor !== 1) parts.push(bean.name);
    if (count > 1) parts.push(count + '잔');
    return { mg: mg, label: parts.join(' · '), drink: drink };
  }

  /* ---------- 렌더 ---------- */
  function renderDrinkChips() {
    var box = S.clear($('#drink-chips'));
    D.DRINKS.forEach(function (d) {
      box.appendChild(el('button', {
        type: 'button',
        class: 'chip',
        'aria-pressed': String(d.id === selectedDrink),
        onclick: function () {
          selectedDrink = d.id;
          var shotBox = $('#drink-shots');
          shotBox.disabled = d.shots === 0;
          if (d.shots > 0) shotBox.value = d.shots;
          renderDrinkChips();
          renderEstimate();
        }
      }, [document.createTextNode(d.name)]));
    });
  }

  function renderEstimate() {
    var e = estimate();
    $('#drink-estimate').textContent = '추정 ' + e.mg + 'mg';
  }

  function renderToday() {
    var key = S.dateKey();
    var list = entriesFor(key);
    var total = totalFor(key);
    var pct = S.clamp((total / C.dailyLimitMg) * 100, 0, 100);
    var over = total > C.dailyLimitMg;

    $('#today-label').textContent = key;
    var fill = $('#caff-fill');
    fill.style.width = pct + '%';
    fill.className = 'gauge-fill' + (over ? ' over' : '');

    $('#caff-summary').textContent = over
      ? total + 'mg — 권장 한도 400mg을 ' + (total - C.dailyLimitMg) + 'mg 넘었습니다.'
      : total + 'mg / 400mg · 남은 여유 ' + (C.dailyLimitMg - total) + 'mg (에스프레소 약 ' +
        Math.floor((C.dailyLimitMg - total) / C.shotMg) + '샷)';

    var ul = S.clear($('#caff-list'));
    if (!list.length) {
      ul.appendChild(el('li', { class: 'empty', text: '오늘 기록한 음료가 없습니다.' }));
      return;
    }
    list.slice().reverse().forEach(function (e) {
      var at = new Date(e.at);
      ul.appendChild(el('li', { class: 'list-item' }, [
        el('div', { class: 'main' }, [
          el('div', { class: 'title', text: e.label }),
          el('div', { class: 'sub', text: isNaN(at.getTime()) ? '' : S.formatTime(at) })
        ]),
        el('div', { class: 'row' }, [
          el('span', { class: 'val', text: e.mg + 'mg' }),
          el('button', {
            type: 'button', class: 'icon-x', 'aria-label': e.label + ' 기록 삭제',
            onclick: function () { remove(e.id); }
          }, [document.createTextNode('×')])
        ])
      ]));
    });
  }

  function renderWeek() {
    var box = S.clear($('#week-chart'));
    var today = new Date();
    var days = [];
    for (var i = 6; i >= 0; i--) days.push(S.shiftDays(today, -i));
    var max = Math.max(C.dailyLimitMg, Math.max.apply(null, days.map(function (d) { return totalFor(S.dateKey(d)); })));

    days.forEach(function (d, idx) {
      var key = S.dateKey(d);
      var total = totalFor(key);
      var h = max > 0 ? (total / max) * 100 : 0;
      box.appendChild(el('div', { class: 'week-day' + (idx === 6 ? ' today' : '') }, [
        el('span', { class: 'd', text: total ? total + '' : '' }),
        el('div', { class: 'week-bar', title: key + ' · ' + total + 'mg' }, [
          el('i', {
            class: total > C.dailyLimitMg ? 'over' : '',
            style: 'height:' + Math.max(total ? 3 : 0, h) + '%'
          })
        ]),
        el('span', { class: 'd', text: (d.getMonth() + 1) + '/' + d.getDate() })
      ]));
    });
  }

  function render() {
    renderToday();
    renderWeek();
    renderEstimate();
  }

  function init() {
    var beanSel = S.clear($('#drink-bean'));
    C.beanFactor.forEach(function (b) {
      beanSel.appendChild(el('option', { value: b.id, text: b.name + (b.factor !== 1 ? ' (×' + b.factor + ')' : '') }));
    });

    renderDrinkChips();
    $('#drink-shots').addEventListener('input', renderEstimate);
    $('#drink-count').addEventListener('input', renderEstimate);
    beanSel.addEventListener('change', renderEstimate);

    $('#drink-add').addEventListener('click', function () {
      var e = estimate();
      if (e.mg <= 0) {
        global.App.toast('카페인이 0mg인 조합입니다. 샷 수를 확인하세요.');
        return;
      }
      add(e.label, e.mg);
      global.App.toast(e.label + ' · ' + e.mg + 'mg 기록');
    });

    render();
  }

  global.CaffeineView = { init: init, add: add, render: render };
})(window);
