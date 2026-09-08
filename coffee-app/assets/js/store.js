/* localStorage 기반 저장소와 공용 유틸리티. */
(function (global) {
  'use strict';

  var PREFIX = 'coffee-app:';
  var memory = {}; /* 스토리지를 쓸 수 없는 환경(사생활 보호 모드 등)에서의 대체 저장소 */

  function read(key, fallback) {
    var raw = null;
    try {
      raw = global.localStorage.getItem(PREFIX + key);
    } catch (e) {
      raw = Object.prototype.hasOwnProperty.call(memory, key) ? memory[key] : null;
    }
    if (raw === null || raw === undefined) return fallback;
    try {
      var parsed = JSON.parse(raw);
      return parsed === null || parsed === undefined ? fallback : parsed;
    } catch (e) {
      return fallback;
    }
  }

  function write(key, value) {
    var raw = JSON.stringify(value);
    memory[key] = raw;
    try {
      global.localStorage.setItem(PREFIX + key, raw);
    } catch (e) {
      /* 저장 불가 환경에서는 세션 동안만 유지됩니다. */
    }
  }

  function uid() {
    return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
  }

  /* ---------- 날짜 ---------- */
  function pad(n) { return n < 10 ? '0' + n : String(n); }

  function dateKey(d) {
    var t = d || new Date();
    return t.getFullYear() + '-' + pad(t.getMonth() + 1) + '-' + pad(t.getDate());
  }

  function parseDateKey(key) {
    var p = String(key || '').split('-');
    if (p.length !== 3) return null;
    var d = new Date(Number(p[0]), Number(p[1]) - 1, Number(p[2]));
    return isNaN(d.getTime()) ? null : d;
  }

  function daysBetween(fromKey, toDate) {
    var from = parseDateKey(fromKey);
    if (!from) return null;
    var to = toDate || new Date();
    var a = new Date(from.getFullYear(), from.getMonth(), from.getDate()).getTime();
    var b = new Date(to.getFullYear(), to.getMonth(), to.getDate()).getTime();
    return Math.round((b - a) / 86400000);
  }

  function shiftDays(date, delta) {
    var d = new Date(date.getTime());
    d.setDate(d.getDate() + delta);
    return d;
  }

  function formatClock(totalSec) {
    var s = Math.max(0, Math.round(totalSec));
    return Math.floor(s / 60) + ':' + pad(s % 60);
  }

  function formatTime(date) {
    return pad(date.getHours()) + ':' + pad(date.getMinutes());
  }

  /* ---------- DOM ---------- */
  function $(sel, root) { return (root || document).querySelector(sel); }
  function $$(sel, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(sel));
  }

  function el(tag, attrs, children) {
    var node = document.createElement(tag);
    if (attrs) {
      Object.keys(attrs).forEach(function (k) {
        var v = attrs[k];
        if (v === null || v === undefined || v === false) return;
        if (k === 'class') node.className = v;
        else if (k === 'text') node.textContent = v;
        else if (k === 'html') node.innerHTML = v;
        else if (k.slice(0, 2) === 'on' && typeof v === 'function') node.addEventListener(k.slice(2), v);
        else if (k === 'dataset') Object.keys(v).forEach(function (dk) { node.dataset[dk] = v[dk]; });
        else node.setAttribute(k, v === true ? '' : v);
      });
    }
    (children || []).forEach(function (c) {
      if (c === null || c === undefined || c === false) return;
      node.appendChild(typeof c === 'string' ? document.createTextNode(c) : c);
    });
    return node;
  }

  function clear(node) {
    while (node && node.firstChild) node.removeChild(node.firstChild);
    return node;
  }

  function clamp(n, min, max) { return Math.min(max, Math.max(min, n)); }

  function round(n, digits) {
    var f = Math.pow(10, digits || 0);
    return Math.round(n * f) / f;
  }

  global.Store = {
    read: read,
    write: write,
    uid: uid,
    dateKey: dateKey,
    parseDateKey: parseDateKey,
    daysBetween: daysBetween,
    shiftDays: shiftDays,
    formatClock: formatClock,
    formatTime: formatTime,
    pad: pad,
    $: $,
    $$: $$,
    el: el,
    clear: clear,
    clamp: clamp,
    round: round
  };
})(window);
