/* 커핑 노트 — 5개 항목 평가와 100점 환산 */
(function (global) {
  'use strict';

  var D = global.CoffeeData;
  var S = global.Store;
  var $ = S.$, el = S.el;
  var CUP = D.CUPPING;

  var scores = {};
  var tags = [];

  function defaults() {
    var o = {};
    CUP.attrs.forEach(function (a) { o[a.id] = 8; });
    return o;
  }

  function total() {
    return CUP.attrs.reduce(function (sum, a) { return sum + (scores[a.id] || 0); }, 0) * 2;
  }

  function notes() {
    var list = S.read('cupping', []);
    return Array.isArray(list) ? list : [];
  }
  function saveNotes(list) { S.write('cupping', list); }

  /* ---------- 렌더 ---------- */
  function renderAttrs() {
    var box = S.clear($('#cup-attrs'));
    CUP.attrs.forEach(function (a) {
      var val = el('span', { class: 'v', text: scores[a.id].toFixed(2) });
      var input = el('input', {
        type: 'range', min: CUP.min, max: CUP.max, step: CUP.step,
        value: scores[a.id], 'aria-label': a.name + ' 점수',
        oninput: function () {
          scores[a.id] = parseFloat(this.value);
          val.textContent = scores[a.id].toFixed(2);
          renderScore();
        }
      });
      box.appendChild(el('div', { class: 'cup-attr' }, [
        el('div', { class: 'n' }, [
          document.createTextNode(a.name),
          el('small', { text: a.desc })
        ]),
        input,
        val
      ]));
    });
  }

  function renderScore() {
    var t = total();
    var node = $('#cup-score');
    node.textContent = t.toFixed(2);
    node.className = 'score-big' + (t >= CUP.specialtyScore ? ' specialty' : '');
    $('#cup-verdict').textContent = t >= CUP.specialtyScore
      ? 'SCA 기준 스페셜티 등급 (80점 이상)'
      : '스페셜티 기준까지 ' + (CUP.specialtyScore - t).toFixed(2) + '점';
  }

  function renderTags() {
    var box = S.clear($('#cup-tags'));
    D.FLAVOR_TAGS.forEach(function (t) {
      box.appendChild(el('button', {
        type: 'button', class: 'chip', 'aria-pressed': String(tags.indexOf(t) >= 0),
        onclick: function () {
          var i = tags.indexOf(t);
          if (i >= 0) tags.splice(i, 1); else tags.push(t);
          renderTags();
        }
      }, [document.createTextNode(t)]));
    });
  }

  function refreshBeans() {
    var sel = $('#cup-bean');
    if (!sel) return;
    var prev = sel.value;
    S.clear(sel);
    sel.appendChild(el('option', { value: '', text: '선반에 없는 원두' }));
    global.BeansView.options().forEach(function (b) {
      sel.appendChild(el('option', { value: b.id, text: b.name }));
    });
    sel.value = prev;
    if (sel.selectedIndex < 0) sel.selectedIndex = 0;
    /* 선반에 원두가 있는데 아무것도 고르지 않았다면 첫 원두를 기본값으로 */
    if (!sel.value && sel.options.length > 1) sel.selectedIndex = 1;
  }

  function renderNotes() {
    var ul = S.clear($('#cup-list'));
    var list = notes().slice().reverse();
    if (!list.length) {
      ul.appendChild(el('li', { class: 'empty', text: '저장된 커핑 노트가 없습니다.' }));
      return;
    }
    list.forEach(function (n) {
      var at = new Date(n.at);
      var sub = [
        isNaN(at.getTime()) ? '' : S.dateKey(at),
        n.methodName,
        n.tags && n.tags.length ? n.tags.join(', ') : ''
      ].filter(Boolean).join(' · ');
      ul.appendChild(el('li', { class: 'list-item' }, [
        el('div', { class: 'main' }, [
          el('div', { class: 'title', text: n.beanName || '이름 없는 원두' }),
          el('div', { class: 'sub', text: sub }),
          n.memo ? el('div', { class: 'sub', style: 'margin-top:4px;', text: n.memo }) : null
        ]),
        el('div', { class: 'row' }, [
          el('span', {
            class: n.total >= CUP.specialtyScore ? 'tag ok' : 'tag',
            text: n.total.toFixed(2) + '점'
          }),
          el('button', {
            type: 'button', class: 'icon-x', 'aria-label': '노트 삭제',
            onclick: function () {
              saveNotes(notes().filter(function (x) { return x.id !== n.id; }));
              renderNotes();
            }
          }, [document.createTextNode('×')])
        ])
      ]));
    });
  }

  function reset() {
    scores = defaults();
    tags = [];
    renderAttrs();
    renderScore();
    renderTags();
  }

  function init() {
    scores = defaults();

    var msel = S.clear($('#cup-method'));
    D.METHODS.forEach(function (m) { msel.appendChild(el('option', { value: m.id, text: m.name })); });

    renderAttrs();
    renderScore();
    renderTags();
    refreshBeans();
    renderNotes();

    $('#cup-reset').addEventListener('click', reset);

    $('#cup-save').addEventListener('click', function () {
      var beanSel = $('#cup-bean');
      var beanName = beanSel.value ? beanSel.options[beanSel.selectedIndex].text : '이름 없는 원두';
      var m = D.methodById($('#cup-method').value);
      var list = notes();
      list.push({
        id: S.uid(),
        beanId: beanSel.value || null,
        beanName: beanName,
        methodId: m.id,
        methodName: m.name,
        scores: JSON.parse(JSON.stringify(scores)),
        total: total(),
        tags: tags.slice(),
        memo: $('#cup-memo').value.trim(),
        at: new Date().toISOString()
      });
      saveNotes(list);
      $('#cup-memo').value = '';
      reset();
      renderNotes();
      global.App.toast(beanName + ' · ' + list[list.length - 1].total.toFixed(2) + '점 저장');
    });
  }

  global.CuppingView = { init: init, refreshBeans: refreshBeans };
})(window);
