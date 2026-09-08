/* 앱 셸 — 탭 전환, 테마, 토스트 */
(function (global) {
  'use strict';

  var S = global.Store;
  var $ = S.$, $$ = S.$$;

  var VIEWS = ['brew', 'caffeine', 'beans', 'cupping', 'guide'];
  var toastTimer = null;

  function showView(name) {
    if (VIEWS.indexOf(name) < 0) name = VIEWS[0];
    $$('.tab').forEach(function (t) {
      t.setAttribute('aria-selected', String(t.dataset.view === name));
      t.tabIndex = t.dataset.view === name ? 0 : -1;
    });
    VIEWS.forEach(function (v) { $('#view-' + v).hidden = v !== name; });
    S.write('view', name);
    if (name === 'caffeine') global.CaffeineView.render();
    if (name === 'beans') global.BeansView.render();
    if (global.location.hash.slice(1) !== name) global.history.replaceState(null, '', '#' + name);
  }

  function toast(msg) {
    var node = $('#toast');
    node.textContent = msg;
    node.hidden = false;
    if (toastTimer) clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { node.hidden = true; }, 2600);
  }

  function applyTheme(mode) {
    var root = document.documentElement;
    if (mode === 'auto') root.removeAttribute('data-theme');
    else root.setAttribute('data-theme', mode);
    $('#theme-toggle').textContent = mode === 'auto' ? '테마 · 자동' : (mode === 'dark' ? '테마 · 다크' : '테마 · 라이트');
    S.write('theme', mode);
  }

  function initTabs() {
    var tabs = $$('.tab');
    tabs.forEach(function (t) {
      t.addEventListener('click', function () { showView(t.dataset.view); });
      t.addEventListener('keydown', function (e) {
        var i = tabs.indexOf(t);
        var next = e.key === 'ArrowRight' ? i + 1 : (e.key === 'ArrowLeft' ? i - 1 : -1);
        if (next < 0 || next >= tabs.length) return;
        e.preventDefault();
        tabs[next].focus();
        showView(tabs[next].dataset.view);
      });
    });
  }

  function init() {
    applyTheme(S.read('theme', 'auto'));
    $('#theme-toggle').addEventListener('click', function () {
      var order = ['auto', 'light', 'dark'];
      var now = S.read('theme', 'auto');
      applyTheme(order[(order.indexOf(now) + 1) % order.length]);
    });

    initTabs();
    global.BrewView.init();
    global.CaffeineView.init();
    global.BeansView.init();
    global.CuppingView.init();
    global.GuideView.init();

    var fromHash = global.location.hash.slice(1);
    showView(VIEWS.indexOf(fromHash) >= 0 ? fromHash : S.read('view', 'brew'));

    global.addEventListener('hashchange', function () {
      showView(global.location.hash.slice(1));
    });
  }

  global.App = { init: init, toast: toast, showView: showView };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})(window);
