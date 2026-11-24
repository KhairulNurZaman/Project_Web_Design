/*
 * ui.js — perilaku komponen UI native (modal, dropdown, accordion, menu, alert).
 * Tanpa library. Pemakaian lewat atribut data-*:
 *   [data-open-modal="#id"]  [data-close-modal]  [data-static] (pada .ui-modal)
 *   [data-dropdown]          [data-toggle-menu="#id"]
 *   [data-acc="panelId"]     [data-close-alert]
 */
(function (w) {
  'use strict';
  var UI = w.UI = {};
  var d = document, backdrop = null, current = null;

  function $(s) { return typeof s === 'string' ? d.querySelector(s) : s; }

  /* ---------- modal ---------- */
  function showModal(el) {
    if (!el || el.classList.contains('is-open')) return;
    if (current && current !== el) hideModal(current, true);
    if (!backdrop) { backdrop = d.createElement('div'); backdrop.className = 'ui-backdrop'; d.body.appendChild(backdrop); }
    el.classList.add('is-open');
    d.body.classList.add('modal-open');
    el.removeAttribute('aria-hidden'); el.setAttribute('aria-modal', 'true'); el.setAttribute('role', 'dialog');
    void el.offsetWidth; // paksa reflow agar transisi berjalan
    el.classList.add('is-shown'); backdrop.classList.add('is-shown');
    current = el;
    el.setAttribute('tabindex', '-1'); el.focus({ preventScroll: true });
  }
  function hideModal(el, instant) {
    if (!el || !el.classList.contains('is-open')) return;
    el.classList.remove('is-shown');
    var bd = backdrop; if (bd) bd.classList.remove('is-shown');
    function done() {
      el.classList.remove('is-open'); el.setAttribute('aria-hidden', 'true');
      if (current === el) {
        current = null; d.body.classList.remove('modal-open');
        if (bd && bd.parentNode) bd.parentNode.removeChild(bd);
        if (backdrop === bd) backdrop = null;
      }
    }
    if (instant) done(); else setTimeout(done, 300);
  }
  UI.modal = function (sel) { var el = $(sel); return { show: function () { showModal(el); }, hide: function () { hideModal(el); } }; };

  /* ---------- dropdown ---------- */
  function closeDropdowns(except) {
    d.querySelectorAll('.ui-dropdown-menu.is-open').forEach(function (m) { if (m !== except) m.classList.remove('is-open'); });
  }

  /* ---------- accordion ---------- */
  function setAcc(btn, open) {
    var panel = d.getElementById(btn.getAttribute('data-acc'));
    btn.classList.toggle('is-collapsed', !open); btn.setAttribute('aria-expanded', open ? 'true' : 'false');
    if (panel) panel.classList.toggle('is-open', open);
  }

  d.addEventListener('click', function (e) {
    var t = e.target, el;
    if (!t.closest) return;
    // modal: buka / tutup
    el = t.closest('[data-open-modal]');
    if (el) { e.preventDefault(); showModal($(el.getAttribute('data-open-modal'))); return; }
    el = t.closest('[data-close-modal]');
    if (el) { e.preventDefault(); hideModal(el.closest('.ui-modal')); return; }
    if (t.classList && t.classList.contains('ui-modal') && !t.hasAttribute('data-static')) { hideModal(t); return; }
    // alert
    el = t.closest('[data-close-alert]');
    if (el) { var al = el.closest('.ui-alert'); if (al && al.parentNode) al.parentNode.removeChild(al); return; }
    // menu responsif
    el = t.closest('[data-toggle-menu]');
    if (el) {
      var menu = $(el.getAttribute('data-toggle-menu')), open = !menu.classList.contains('is-open');
      menu.classList.toggle('is-open', open); el.setAttribute('aria-expanded', open ? 'true' : 'false'); return;
    }
    // accordion
    el = t.closest('[data-acc]');
    if (el) {
      var wasOpen = !el.classList.contains('is-collapsed'), root = el.closest('.ui-accordion');
      if (root) root.querySelectorAll('[data-acc]').forEach(function (b) { setAcc(b, false); });
      setAcc(el, !wasOpen); return;
    }
    // dropdown
    el = t.closest('[data-dropdown]');
    if (el) {
      var m = el.parentNode.querySelector('.ui-dropdown-menu'), open2 = !m.classList.contains('is-open');
      closeDropdowns(); m.classList.toggle('is-open', open2); el.setAttribute('aria-expanded', open2 ? 'true' : 'false'); return;
    }
    if (!t.closest('.ui-dropdown-menu')) closeDropdowns();
  });
  d.addEventListener('keydown', function (e) {
    if (e.key !== 'Escape') return;
    closeDropdowns();
    if (current) hideModal(current);
  });
})(window);
