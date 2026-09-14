/* 가이드 탭 — 매뉴얼의 참조표를 데이터에서 생성 */
(function (global) {
  'use strict';

  var D = global.CoffeeData;
  var S = global.Store;
  var $ = S.$, el = S.el;

  function renderMethodTable() {
    var tbody = S.clear($('#guide-methods'));
    D.METHODS.forEach(function (m) {
      tbody.appendChild(el('tr', {}, [
        el('td', {}, [el('b', { text: m.name }), document.createTextNode(' ' + m.sub)]),
        el('td', { class: 'mono', text: '1 : ' + m.ratio }),
        el('td', { class: 'mono', text: m.tempC ? m.tempC[0] + '~' + m.tempC[1] + '°C' : '냉장' }),
        el('td', { text: m.grind }),
        el('td', {
          class: 'mono',
          text: m.steepHours
            ? m.steepHours[0] + '~' + m.steepHours[m.steepHours.length - 1] + '시간'
            : (m.timeLabel || S.formatClock(m.totalSec))
        })
      ]));
    });
  }

  function renderDrinks() {
    var box = S.clear($('#guide-drinks'));
    D.DRINKS.filter(function (d) { return d.id !== 'drip' && d.id !== 'coldbrew'; }).forEach(function (d) {
      var bar = el('div', { class: 'comp-bar' }, d.parts.map(function (p) {
        return el('span', { class: 'comp-' + p[0], style: 'width:' + p[1] + '%', text: p[2] || '' });
      }));
      box.appendChild(el('div', { class: 'drink-row' }, [
        el('span', { class: 'name', text: d.name }),
        bar
      ]));
    });
  }

  function init() {
    renderMethodTable();
    renderDrinks();
  }

  global.GuideView = { init: init };
})(window);
