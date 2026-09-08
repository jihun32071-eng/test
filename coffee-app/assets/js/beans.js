/* 원두 선반 — 로스팅 날짜 기반 디게싱·신선도 관리 */
(function (global) {
  'use strict';

  var D = global.CoffeeData;
  var S = global.Store;
  var $ = S.$, el = S.el;

  var SHELF_LIFE_DAYS = 28; /* 09 보관법: 2~4주 이내 소비 권장 */

  function all() {
    var list = S.read('beans', []);
    return Array.isArray(list) ? list : [];
  }
  function saveAll(list) { S.write('beans', list); }

  function roastMeta(id) {
    for (var i = 0; i < D.ROASTS.length; i++) if (D.ROASTS[i].id === id) return D.ROASTS[i];
    return D.ROASTS[1];
  }

  function statusOf(bean) {
    var days = S.daysBetween(bean.roastDate);
    if (days === null || days < 0) return { days: days, state: D.FRESHNESS[0], remain: null };
    return {
      days: days,
      state: D.freshnessOf(days),
      remain: SHELF_LIFE_DAYS - days
    };
  }

  function add(bean) {
    var list = all();
    list.push(bean);
    saveAll(list);
    render();
  }

  function remove(id) {
    saveAll(all().filter(function (b) { return b.id !== id; }));
    render();
  }

  function render() {
    var box = S.clear($('#bean-list'));
    var list = all().slice().sort(function (a, b) {
      return String(b.roastDate).localeCompare(String(a.roastDate));
    });

    if (!list.length) {
      box.appendChild(el('div', { class: 'empty', text: '등록된 원두가 없습니다. 위에서 원두를 추가해 보세요.' }));
      global.CuppingView && global.CuppingView.refreshBeans();
      return;
    }

    list.forEach(function (bean) {
      var st = statusOf(bean);
      var roast = roastMeta(bean.roast);
      var pos = S.clamp(((st.days || 0) / SHELF_LIFE_DAYS) * 100, 0, 100);
      var tagClass = st.state.id === 'peak' ? 'tag ok' : (st.state.id === 'old' ? 'tag warn' : 'tag');

      box.appendChild(el('article', { class: 'bean-card' }, [
        el('div', { class: 'spread' }, [
          el('h4', { text: bean.name }),
          el('button', {
            type: 'button', class: 'icon-x', 'aria-label': bean.name + ' 삭제',
            onclick: function () { remove(bean.id); }
          }, [document.createTextNode('×')])
        ]),
        el('div', { class: 'bean-meta' }, [
          el('span', { class: 'roast-dot roast-' + roast.swatch }),
          document.createTextNode([bean.origin, roast.name, bean.process].filter(Boolean).join(' · ') +
            (bean.weight ? ' · ' + bean.weight + 'g' : ''))
        ]),
        el('div', {}, [
          el('span', { class: tagClass, text: st.state.label }),
          el('span', {
            class: 'bean-meta', style: 'margin-left:8px;',
            text: st.days === null ? '날짜 미입력'
              : st.days < 0 ? '로스팅 예정일'
              : '로스팅 D+' + st.days + (st.remain > 0 ? ' · 권장 소비까지 ' + st.remain + '일' : ' · 권장 기한 초과')
          })
        ]),
        el('div', {}, [
          el('div', { class: 'fresh-track' }, [el('div', { class: 'now', style: 'left:' + pos + '%' })]),
          el('div', { class: 'fresh-legend' }, [
            el('span', { text: '0일' }), el('span', { text: '2일' }),
            el('span', { text: '14일' }), el('span', { text: '28일' })
          ])
        ]),
        el('p', { class: 'hint', style: 'margin:0;', text: st.state.desc })
      ]));
    });

    global.CuppingView && global.CuppingView.refreshBeans();
  }

  function options() {
    return all().map(function (b) { return { id: b.id, name: b.name }; });
  }

  function init() {
    var origin = S.clear($('#bean-origin'));
    D.ORIGINS.forEach(function (o) { origin.appendChild(el('option', { value: o, text: o })); });

    var roast = S.clear($('#bean-roast'));
    D.ROASTS.forEach(function (r) { roast.appendChild(el('option', { value: r.id, text: r.name + ' — ' + r.desc })); });
    roast.value = 'medium';

    var proc = S.clear($('#bean-process'));
    D.PROCESSES.forEach(function (p) { proc.appendChild(el('option', { value: p, text: p })); });

    $('#bean-date').value = S.dateKey();

    $('#bean-add').addEventListener('click', function () {
      var name = $('#bean-name').value.trim();
      if (!name) {
        global.App.toast('원두 이름을 입력하세요.');
        $('#bean-name').focus();
        return;
      }
      add({
        id: S.uid(),
        name: name,
        origin: $('#bean-origin').value,
        roast: $('#bean-roast').value,
        process: $('#bean-process').value,
        roastDate: $('#bean-date').value || S.dateKey(),
        weight: parseInt($('#bean-weight').value, 10) || 0
      });
      $('#bean-name').value = '';
      global.App.toast('\u2018' + name + '\u2019 원두를 선반에 추가했습니다.');
    });

    render();
  }

  global.BeansView = { init: init, render: render, options: options };
})(window);
