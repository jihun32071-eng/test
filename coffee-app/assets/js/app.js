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
    try {
      if (global.location.hash.slice(1) !== name) global.history.replaceState(null, '', '#' + name);
    } catch (e) { /* 샌드박스 등 히스토리 조작이 막힌 환경은 무시합니다. */ }
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

  /* 설치 배너 — Chrome 계열만 beforeinstallprompt를 제공합니다. */
  function initInstall() {
    var deferred = null;
    var btn = $('#install-btn');
    var state = $('#install-state');
    var standalone = global.matchMedia('(display-mode: standalone)').matches || global.navigator.standalone === true;

    if (standalone) {
      if (state) state.textContent = '이미 설치된 앱으로 실행 중입니다.';
      return;
    }

    global.addEventListener('beforeinstallprompt', function (e) {
      e.preventDefault();
      deferred = e;
      btn.hidden = false;
      if (state) state.textContent = '이 브라우저는 바로 설치할 수 있습니다. 상단의 \u2018홈 화면에 추가\u2019 버튼을 누르세요.';
    });

    btn.addEventListener('click', function () {
      if (!deferred) return;
      deferred.prompt();
      deferred.userChoice.then(function (choice) {
        if (choice.outcome === 'accepted') toast('홈 화면에 추가했습니다.');
        deferred = null;
        btn.hidden = true;
      });
    });

    global.addEventListener('appinstalled', function () {
      btn.hidden = true;
      if (state) state.textContent = '설치가 완료되었습니다. 홈 화면에서 실행해 보세요.';
      toast('설치가 완료되었습니다.');
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
    initInstall();
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
