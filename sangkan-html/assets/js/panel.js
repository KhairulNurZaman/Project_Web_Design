/*
 * panel.js — kerangka halaman staf (sidebar + topbar) dan komponen bersama.
 * Satu kerangka untuk dua peran: admin dan manajer.
 */
(function (w) {
  'use strict';
  var SP = w.SP, U = SP.util, esc = U.esc;
  var P = SP.panel = {};

  /* ---------- menu per peran ---------- */
  // [file, ikon, label, kunci aktif]
  var MENU = {
    admin: [
      { label: 'Main', items: [['index.html', 'ico-speedometer2', 'Dashboard', 'index']] },
      { label: 'Manajemen Tiket', items: [
        ['layanan.html', 'ico-ticket-perforated', 'Layanan & Tiket', 'layanan'],
        ['transaksi.html', 'ico-receipt', 'Data Transaksi', 'transaksi'],
        ['verifikasi.html', 'ico-qr-code-scan', 'Verifikasi Tiket', 'verifikasi']] },
      { label: 'Data Master', items: [
        ['customer.html', 'ico-people', 'Data Customer', 'customer'],
        ['staff.html', 'ico-person-badge', 'Kelola Staff', 'staff'],
        ['pesan-masuk.html', 'ico-envelope', 'Pesan Masuk', 'pesan-masuk']] },
      { label: 'Laporan', items: [['laporan.html', 'ico-bar-chart-line', 'Laporan Penjualan', 'laporan']] }
    ],
    manajer: [
      { label: 'Manajer', items: [['index.html', 'ico-speedometer2', 'Dashboard', 'index']] },
      { label: 'Operasional', items: [
        ['pos.html', 'ico-cash-coin', 'Point of Sale', 'pos'],
        ['verifikasi.html', 'ico-qr-code-scan', 'Verifikasi Tiket', 'verifikasi']] },
      { label: 'Transaksi', items: [
        ['transaksi.html', 'ico-receipt', 'Data Transaksi', 'transaksi'],
        ['riwayat.html', 'ico-clock-history', 'Riwayat Saya', 'riwayat']] },
      { label: 'Laporan', items: [['laporan.html', 'ico-bar-chart-line', 'Laporan Penjualan', 'laporan']] }
    ]
  };

  /*
   * P.mount({ roles, active, title, render(session, content) })
   * Menjaga akses, menggambar kerangka, lalu memanggil render().
   */
  P.mount = function (opt) {
    var ses = SP.guard.staff(opt.roles);
    if (!ses) return null;
    var menu = MENU[ses.role] || MENU.admin, nav = '';
    var unread = ses.role === 'admin' ? SP.pesan.unread() : 0;
    var menunggu = SP.transaksi.countMenunggu();
    menu.forEach(function (g, gi) {
      nav += '<div class="nav-label' + (gi ? ' mt-2' : '') + '">' + esc(g.label) + '</div>';
      g.items.forEach(function (it) {
        var badge = '';
        if (it[3] === 'pesan-masuk' && unread) badge = '<span class="nav-badge">' + unread + '</span>';
        if (it[3] === 'transaksi' && ses.role === 'manajer' && menunggu) badge = '<span class="nav-badge">' + menunggu + '</span>';
        nav += '<a href="' + it[0] + '" class="' + (opt.active === it[3] ? 'active' : '') + '"><i class="ico ' + it[1] + '"></i> ' + esc(it[2]) + badge + '</a>';
      });
    });
    var isAdmin = ses.role === 'admin';
    var logo = SP.url('assets/img/logo_sangkan-removebg-preview.png');
    var sidebar =
      '<nav class="sidebar" id="sidebar"><div class="sidebar-brand"><img src="' + logo + '" alt="Logo"><div class="sidebar-brand-text"><span>Sangkan Park</span><small>' +
      (isAdmin ? 'E-Ticketing System' : 'Manajer Panel') + '</small></div></div><div class="sidebar-nav">' + nav + '</div>' +
      '<div class="sidebar-footer"><a href="' + SP.url('index.html') + '" target="_blank"><i class="ico ico-globe"></i> ' + (isAdmin ? 'Lihat Website' : 'Website') + '</a>' +
      '<a href="#" class="mt-1" data-logout><i class="ico ico-box-arrow-left"></i> Logout</a></div></nav>';
    var title = String(opt.title || 'Dashboard').split(' | ')[0];
    var main =
      '<div class="main-content w-full"><div class="topbar"><div class="topbar-left">' +
      '<button class="btn-toggle" id="sidebarToggle" type="button" aria-label="Menu"><i class="ico ico-list"></i></button>' +
      '<h6 class="mb-0 t-muted normal">' + esc(title) + '</h6></div><div class="topbar-right"><div class="ui-dropdown">' +
      '<button class="ui-btn ui-btn-sm ui-btn-light ui-dropdown-toggle flex items-center gap-2" data-dropdown type="button">' +
      '<div class="r-circle ' + (isAdmin ? 'bgc-primary t-white' : 'bgc-warning t-dark') + ' flex items-center justify-center" style="width:30px;height:30px;font-size:0.8rem;">' + esc(U.initial(ses.nama, 'A')) + '</div>' +
      '<span class="hidden md-inline">' + esc(ses.nama || 'Admin') + '</span></button>' +
      '<ul class="ui-dropdown-menu ui-dropdown-end"><li><span class="ui-dropdown-text t-sm t-muted">Role: <strong>' + esc(U.ucfirst(ses.role)) + '</strong></span></li>' +
      '<li><hr class="ui-dropdown-divider"></li><li><a class="ui-dropdown-item t-danger" href="#" data-logout><i class="ico ico-box-arrow-left mr-2"></i>Logout</a></li></ul></div></div></div>' +
      '<div class="page-content" id="pageContent"></div></div>';
    document.getElementById('app').innerHTML = '<div class="flex">' + sidebar + main + '</div>';
    document.title = (opt.title || 'Dashboard') + ' | Sangkan Park';

    document.addEventListener('click', function (e) {
      var sb = document.getElementById('sidebar'), tg = document.getElementById('sidebarToggle');
      if (tg && tg.contains(e.target)) { sb.classList.toggle('is-open'); return; }
      if (sb && !sb.contains(e.target)) sb.classList.remove('is-open');
      var lo = e.target.closest ? e.target.closest('[data-logout]') : null;
      if (lo) { e.preventDefault(); SP.auth.logout(); SP.go('index.html'); }
    });
    var content = document.getElementById('pageContent');
    // pesan flash (alert) di atas isi halaman
    var f = SP.flash.take(), fh = '';
    if (f.success) fh += '<div class="ui-alert ui-alert-success ui-alert-dismiss"><i class="ico ico-check-circle mr-2"></i>' + f.success + '<button type="button" class="ui-close" data-close-alert aria-label="Tutup"></button></div>';
    if (f.error) fh += '<div class="ui-alert ui-alert-danger ui-alert-dismiss"><i class="ico ico-exclamation-circle mr-2"></i>' + f.error + '<button type="button" class="ui-close" data-close-alert aria-label="Tutup"></button></div>';
    content.innerHTML = '<div id="flashArea">' + fh + '</div><div id="pageBody"></div>';
    var body = document.getElementById('pageBody');
    if (opt.render) opt.render(ses, body);
    return { session: ses, body: body };
  };

  /* ---------- helper umum ---------- */
  P.badge = function (status, longLabel) {
    var cls = U.status.badgeAdmin[status] || 'badge-menunggu';
    var lb = (longLabel ? U.status.labelLong : U.status.labelShort)[status] || status;
    return '<span class="ui-badge r-pill ' + cls + '">' + esc(lb) + '</span>';
  };
  // aksi dengan konfirmasi: elemen [data-act] dalam container
  P.on = function (root, handlers) {
    root.addEventListener('click', function (e) {
      var el = e.target.closest ? e.target.closest('[data-act]') : null;
      if (!el || !root.contains(el)) return;
      var h = handlers[el.getAttribute('data-act')];
      if (h) { e.preventDefault(); h(el, el.getAttribute('data-id')); }
    });
  };
  P.flashReload = function (type, msg) { SP.flash.set(type, msg); w.location.reload(); };
  P.flashTo = function (type, msg, page) { SP.flash.set(type, msg); w.location.href = page; };
  P.showAlert = function (type, html) {
    var a = document.getElementById('flashArea');
    if (a) a.innerHTML = '<div class="ui-alert ui-alert-' + type + ' ui-alert-dismiss"><i class="ico ' + (type === 'success' ? 'ico-check-circle' : 'ico-exclamation-circle') + ' mr-2"></i>' + html + '<button type="button" class="ui-close" data-close-alert aria-label="Tutup"></button></div>';
    w.scrollTo({ top: 0, behavior: 'smooth' });
  };
  // modal bukti pembayaran (data URL tidak bisa dibuka di tab baru)
  P.showBukti = function (dataUrl, no) {
    var m = document.getElementById('modalBukti');
    if (!m) {
      m = document.createElement('div');
      m.className = 'ui-modal'; m.id = 'modalBukti'; m.tabIndex = -1;
      m.innerHTML = '<div class="ui-modal-dialog ui-modal-centered"><div class="ui-modal-content r-4 bd-0"><div class="ui-modal-header bd-0 pb-0"><h6 class="ui-modal-title bold">Bukti Pembayaran <span id="buktiNo" class="mono t-sm t-muted"></span></h6><button type="button" class="ui-close" data-close-modal aria-label="Tutup"></button></div><div class="ui-modal-body t-center"><img id="buktiImg" src="" alt="Bukti pembayaran" class="img-fit r-3"></div></div></div>';
      document.body.appendChild(m);
    }
    document.getElementById('buktiImg').src = dataUrl;
    document.getElementById('buktiNo').textContent = no || '';
    UI.modal(m).show();
  };

  /* ---------- grafik batang (SVG) ---------- */
  function niceMax(v) {
    if (v <= 0) return 100000;
    var exp = Math.pow(10, Math.floor(Math.log(v) / Math.LN10)), f = v / exp, nf;
    nf = f <= 1 ? 1 : f <= 2 ? 2 : f <= 5 ? 5 : 10;
    return nf * exp;
  }
  P.barChart = function (el, labels, values) {
    if (!labels.length) { labels = ['Tidak ada data']; values = [0]; }
    var W = 640, H = 270, ml = 96, mr = 12, mt = 12, mb = 30, pw = W - ml - mr, ph = H - mt - mb;
    var max = niceMax(Math.max.apply(null, values)), ticks = 5, i, s;
    s = '<svg viewBox="0 0 ' + W + ' ' + H + '" role="img" aria-label="Grafik batang pendapatan">';
    for (i = 0; i <= ticks; i++) {
      var y = mt + ph - (ph * i / ticks), val = max * i / ticks;
      s += '<line class="grid" x1="' + ml + '" x2="' + (W - mr) + '" y1="' + y + '" y2="' + y + '"/>' +
        '<text x="' + (ml - 8) + '" y="' + (y + 4) + '" text-anchor="end">' + U.rp(val) + '</text>';
    }
    var slot = pw / labels.length, bw = Math.min(slot * 0.6, 56);
    labels.forEach(function (lb, k) {
      var h = max ? (ph * values[k] / max) : 0, x = ml + slot * k + (slot - bw) / 2, yy = mt + ph - h, r = Math.min(6, bw / 2, h / 2);
      var tip = esc(lb) + ': ' + U.rp(values[k]);
      if (h > 0) {
        s += '<path class="bar" tabindex="0" data-tip="' + tip + '" data-cx="' + (x + bw / 2) + '" data-cy="' + yy + '" d="M' + x + ' ' + (yy + h) + 'V' + (yy + r) + 'Q' + x + ' ' + yy + ' ' + (x + r) + ' ' + yy +
          'H' + (x + bw - r) + 'Q' + (x + bw) + ' ' + yy + ' ' + (x + bw) + ' ' + (yy + r) + 'V' + (yy + h) + 'Z"/>';
      }
      s += '<text x="' + (x + bw / 2) + '" y="' + (H - 10) + '" text-anchor="middle">' + esc(lb) + '</text>';
    });
    s += '</svg><div class="tip"></div>';
    el.classList.add('bar-chart'); el.innerHTML = s;
    var tipEl = el.querySelector('.tip'), svg = el.querySelector('svg');
    function show(b) {
      var r = svg.getBoundingClientRect(), sc = r.width / W;
      tipEl.textContent = b.getAttribute('data-tip');
      tipEl.style.left = (parseFloat(b.getAttribute('data-cx')) * sc) + 'px';
      tipEl.style.top = (parseFloat(b.getAttribute('data-cy')) * sc) + 'px';
      tipEl.style.display = 'block';
    }
    Array.prototype.forEach.call(el.querySelectorAll('.bar'), function (b) {
      b.addEventListener('mouseenter', function () { show(b); });
      b.addEventListener('focus', function () { show(b); });
      b.addEventListener('mouseleave', function () { tipEl.style.display = 'none'; });
      b.addEventListener('blur', function () { tipEl.style.display = 'none'; });
    });
  };

  /* ---------- tabel transaksi (dipakai beberapa halaman) ---------- */
  P.thead = function (cols) {
    var h = '<thead style="background:#f8faff;"><tr>';
    cols.forEach(function (c, i) {
      h += '<th class="' + (i === 0 ? 'pl-3 ' : '') + (i === cols.length - 1 && c.last ? 'pr-3 ' : '') + 'semibold t-sm t-muted">' + esc(c.t || c) + '</th>';
    });
    return h + '</tr></thead>';
  };

  // unduh CSV (BOM agar Excel membaca UTF-8)
  P.downloadCsv = function (filename, rows) {
    var csv = rows.map(function (r) {
      return r.map(function (c) {
        c = String(c == null ? '' : c);
        // cegah formula injection di spreadsheet
        if (/^[=+\-@\t\r]/.test(c)) c = "'" + c;
        return '"' + c.replace(/"/g, '""') + '"';
      }).join(';');
    }).join('\r\n');
    var blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' });
    var a = document.createElement('a');
    a.href = URL.createObjectURL(blob); a.download = filename;
    document.body.appendChild(a); a.click();
    setTimeout(function () { URL.revokeObjectURL(a.href); a.remove(); }, 500);
  };
})(window);
