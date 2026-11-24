(function () {
  'use strict';
  var U = SP.util, esc = U.esc, P = SP.panel;
  var s0 = SP.session.get();
  var isManajer = s0 && s0.role === 'manajer';

  function tabelTerbaru(rows, emptyText) {
    var h = '<div class="ui-table-wrap"><table class="ui-table ui-table-hover v-middle mb-0">' +
      P.thead(['No. Tiket', 'Customer', 'Tanggal', 'Total', 'Status', { t: 'Aksi', last: true }]) + '<tbody>';
    if (!rows.length) h += '<tr><td colspan="6" class="t-center py-4 t-muted">' + emptyText + '</td></tr>';
    rows.forEach(function (p) {
      h += '<tr><td class="pl-3 mono t-sm bold" style="color:#0f4c81;">' + esc(p.no_tiket.slice(-10)) + '</td>' +
        '<td class="t-sm">' + esc(p.nama_cust || 'Guest') + '</td>' +
        '<td class="t-sm t-muted">' + U.dMHi(p.tanggal) + '</td>' +
        '<td class="t-sm semibold">' + U.rp(p.total_bayar) + '</td>' +
        '<td>' + P.badge(p.status) + '</td>' +
        '<td class="pr-3"><a href="detail-transaksi.html?no=' + encodeURIComponent(p.no_tiket) + '" class="ui-btn ui-btn-sm ui-btn-outline-primary r-pill py-0">Detail</a></td></tr>';
    });
    return h + '</tbody></table></div>';
  }

  function chartData() {
    var c = SP.transaksi.chartHarian(7);
    return { labels: c.map(function (x) { return U.dMY(x.tgl).slice(0, 6); }), values: c.map(function (x) { return x.total; }) };
  }

  /* ================= DASHBOARD ADMIN ================= */
  function renderAdmin(ses, el) {
    var menus = [
      ['layanan.html', 'ico-ticket-perforated', 'Kelola Layanan', 'Tambah/edit tiket', '#0f4c81', '#e0f0ff'],
      ['transaksi.html', 'ico-receipt', 'Transaksi', 'Lihat semua pesanan', '#f4a61c', '#fff8e1'],
      ['verifikasi.html', 'ico-qr-code-scan', 'Verifikasi', 'Cek QR tiket', '#28a745', '#d1fae5'],
      ['laporan.html', 'ico-bar-chart', 'Laporan', 'Laporan penjualan', '#6f42c1', '#ede7f6'],
      ['customer.html', 'ico-people', 'Customer', 'Data pengunjung', '#00b4d8', '#e0f8ff'],
      ['staff.html', 'ico-person-badge', 'Staff', 'Kelola manajer & admin', '#dc3545', '#fee2e2']
    ], q = '';
    menus.forEach(function (m) {
      q += '<div class="span-6"><a href="' + m[0] + '" class="flex items-center gap-2 p-3 r-3 no-underline h-full" style="background:' + m[5] + ';">' +
        '<i class="ico ' + m[1] + '" style="font-size:1.3rem;color:' + m[4] + ';flex-shrink:0;"></i>' +
        '<div><div class="semibold t-sm" style="color:#1a1a2e;">' + m[2] + '</div><div class="t-muted" style="font-size:.7rem;">' + m[3] + '</div></div></a></div>';
    });
    el.innerHTML =
      '<div class="grid gap-4 mb-4">' +
      '<div class="span-sm-6 span-xl-3"><div class="stat-card primary"><div class="stat-icon" style="background:#e0f0ff;color:#0f4c81;"><i class="ico ico-cash-stack"></i></div><div class="stat-label">Total Pendapatan</div><div class="stat-value">' + U.rp(SP.transaksi.totalPendapatan()) + '</div><div class="stat-sub">Semua transaksi aktif</div></div></div>' +
      '<div class="span-sm-6 span-xl-3"><div class="stat-card success"><div class="stat-icon" style="background:#d1fae5;color:#065f46;"><i class="ico ico-ticket-perforated"></i></div><div class="stat-label">Tiket Terjual</div><div class="stat-value">' + U.num(SP.transaksi.totalTiketTerjual()) + '</div><div class="stat-sub">Total tiket</div></div></div>' +
      '<div class="span-sm-6 span-xl-3"><div class="stat-card warning"><div class="stat-icon" style="background:#fef3c7;color:#92400e;"><i class="ico ico-people"></i></div><div class="stat-label">Total Transaksi</div><div class="stat-value">' + U.num(SP.transaksi.totalTransaksi()) + '</div><div class="stat-sub">Semua pesanan</div></div></div>' +
      '<div class="span-sm-6 span-xl-3"><div class="stat-card danger"><div class="stat-icon" style="background:#fee2e2;color:#991b1b;"><i class="ico ico-clock-history"></i></div><div class="stat-label">Menunggu Verifikasi</div><div class="stat-value">' + SP.transaksi.countMenunggu() + '</div><div class="stat-sub"><a href="transaksi.html" class="t-danger t-sm">Lihat semua →</a></div></div></div>' +
      '</div>' +
      '<div class="grid gap-4"><div class="span-lg-7"><div class="panel-card"><div class="panel-header"><h5><i class="ico ico-bar-chart-line mr-2 t-primary"></i>Pendapatan 7 Hari Terakhir</h5></div><div style="padding:1.25rem;"><div id="chartHarian"></div></div></div></div>' +
      '<div class="span-lg-5"><div class="panel-card h-full"><div class="panel-header"><h5><i class="ico ico-lightning mr-2 t-warning"></i>Akses Cepat</h5></div><div class="p-3"><div class="grid gap-2">' + q + '</div></div></div></div></div>' +
      '<div class="panel-card mt-4"><div class="panel-header"><h5><i class="ico ico-receipt mr-2 t-primary"></i>Transaksi Terbaru</h5><a href="transaksi.html" class="ui-btn ui-btn-sm ui-btn-outline-primary r-pill">Lihat Semua</a></div>' +
      tabelTerbaru(SP.transaksi.recent(8), 'Belum ada transaksi.') + '</div>' +
      '<div class="panel-card mt-4"><div class="panel-header"><h5><i class="ico ico-database-gear mr-2 t-secondary"></i>Pengelolaan Data</h5></div><div class="p-3 flex flex-wrap items-center gap-2">' +
      '<span class="t-sm t-muted mr-auto">Data aplikasi tersimpan di browser ini (localStorage). Gunakan data contoh untuk demonstrasi.</span>' +
      '<button type="button" class="ui-btn ui-btn-sm ui-btn-outline-primary r-pill" id="btnDemo"><i class="ico ico-plus-circle mr-1"></i>Isi Data Contoh</button>' +
      '<button type="button" class="ui-btn ui-btn-sm ui-btn-outline-danger r-pill" id="btnReset"><i class="ico ico-trash mr-1"></i>Reset Semua Data</button></div></div>';
    var c = chartData(); P.barChart(document.getElementById('chartHarian'), c.labels, c.values);

    document.getElementById('btnDemo').addEventListener('click', function () {
      if (!confirm('Tambahkan data transaksi contoh (7 hari terakhir)?')) return;
      if (SP.demo()) P.flashReload('success', 'Data contoh berhasil ditambahkan.');
    });
    document.getElementById('btnReset').addEventListener('click', function () {
      if (!confirm('Reset SEMUA data (transaksi, customer, akun, pesan) ke kondisi awal?\n\nTindakan ini tidak dapat dibatalkan.')) return;
      var keep = SP.session.get();
      SP.db.reset();
      SP.session.clear();
      SP.flash.set('success', 'Data direset ke kondisi awal. Silakan login kembali.');
      SP.go('login.html');
    });
  }

  /* ================= DASHBOARD MANAJER ================= */
  function renderManajer(ses, el) {
    var today = U.today(), monthStart = today.slice(0, 8) + '01';
    var hariIni = SP.transaksi.laporan(today, today);
    var bulanIni = SP.transaksi.laporan(monthStart, today);
    var sum = function (arr, k) { return arr.reduce(function (s, t) { return s + (Number(t[k]) || 0); }, 0); };
    var kap = Number(SP.settings.get('kapasitas_harian', 1500));
    var terpesan = SP.transaksi.terpesan(today);
    var db = SP.db.get();
    var masuk = db.transaksi.filter(function (t) { return t.tgl_kunjungan === today && t.status === 'digunakan'; })
      .reduce(function (s, t) { return s + (Number(t.jumlah_tiket) || 0); }, 0);
    var pct = kap ? Math.min(100, Math.round(terpesan * 100 / kap)) : 0;
    var barCls = pct >= 90 ? 'bgc-danger' : (pct >= 70 ? 'bgc-warning' : 'bgc-success');

    // kuota 7 hari ke depan
    var kuota = '';
    for (var i = 0; i < 7; i++) {
      var d = U.addDays(today, i), tp = SP.transaksi.terpesan(d), p = kap ? Math.min(100, Math.round(tp * 100 / kap)) : 0;
      kuota += '<div class="mb-2"><div class="flex justify-between t-sm"><span>' + (i === 0 ? 'Hari ini' : U.dMY(d)) + '</span><span class="t-muted">' + U.num(tp) + ' / ' + U.num(kap) + '</span></div>' +
        '<div class="ui-progress" style="height:6px;"><div class="ui-progress-bar ' + (p >= 90 ? 'bgc-danger' : (p >= 70 ? 'bgc-warning' : 'bgc-primary')) + '" style="width:' + p + '%"></div></div></div>';
    }

    // tiket terlaris bulan ini
    var tl = SP.transaksi.terlaris(monthStart, today), maxQ = tl.length ? tl[0].qty : 1, tlh = '';
    tl.slice(0, 5).forEach(function (x, idx) {
      tlh += '<div class="mb-3"><div class="flex justify-between t-sm"><span class="semibold">' + (idx + 1) + '. ' + esc(x.nama) + '</span><span class="t-muted">' + U.num(x.qty) + ' tiket</span></div>' +
        '<div class="ui-progress" style="height:6px;"><div class="ui-progress-bar" style="width:' + Math.round(x.qty * 100 / maxQ) + '%;background:#f4a61c;"></div></div>' +
        '<div class="t-muted" style="font-size:.72rem;">' + U.rp(x.omzet) + '</div></div>';
    });
    if (!tl.length) tlh = '<p class="t-muted t-sm t-center my-4">Belum ada penjualan bulan ini.</p>';

    var pending = SP.transaksi.allJoin().filter(function (t) { return t.status === 'menunggu_pembayaran'; });

    el.innerHTML =
      '<div class="mb-4"><h4 class="bold mb-0" style="color:#0f4c81;"><i class="ico ico-speedometer2 mr-2"></i>Dashboard Manajer</h4>' +
      '<p class="t-muted t-sm mb-0">Ringkasan operasional Sangkan Resort Aqua Park — ' + U.hariLengkap().replace(/\s\d{2}:\d{2}$/, '') + '</p></div>' +
      '<div class="grid gap-4 mb-4">' +
      '<div class="span-sm-6 span-xl-3"><div class="stat-card primary"><div class="stat-icon" style="background:#e0f0ff;color:#0f4c81;"><i class="ico ico-cash-stack"></i></div><div class="stat-label">Pendapatan Hari Ini</div><div class="stat-value">' + U.rp(sum(hariIni, 'total_bayar')) + '</div><div class="stat-sub">' + hariIni.length + ' transaksi</div></div></div>' +
      '<div class="span-sm-6 span-xl-3"><div class="stat-card success"><div class="stat-icon" style="background:#d1fae5;color:#065f46;"><i class="ico ico-door-open"></i></div><div class="stat-label">Pengunjung Masuk</div><div class="stat-value">' + U.num(masuk) + '</div><div class="stat-sub">dari ' + U.num(terpesan) + ' tiket terpesan hari ini</div></div></div>' +
      '<div class="span-sm-6 span-xl-3"><div class="stat-card danger"><div class="stat-icon" style="background:#fee2e2;color:#991b1b;"><i class="ico ico-hourglass-split"></i></div><div class="stat-label">Menunggu Persetujuan</div><div class="stat-value">' + pending.length + '</div><div class="stat-sub"><a href="transaksi.html" class="t-danger t-sm">Tinjau pembayaran →</a></div></div></div>' +
      '<div class="span-sm-6 span-xl-3"><div class="stat-card warning"><div class="stat-icon" style="background:#fef3c7;color:#92400e;"><i class="ico ico-calendar3"></i></div><div class="stat-label">Pendapatan Bulan Ini</div><div class="stat-value">' + U.rp(sum(bulanIni, 'total_bayar')) + '</div><div class="stat-sub">' + U.num(sum(bulanIni, 'jumlah_tiket')) + ' tiket terjual</div></div></div>' +
      '</div>' +
      '<div class="grid gap-4"><div class="span-lg-7"><div class="panel-card"><div class="panel-header"><h5><i class="ico ico-bar-chart-line mr-2 t-primary"></i>Pendapatan 7 Hari Terakhir</h5></div><div style="padding:1.25rem;"><div id="chartHarian"></div></div></div></div>' +
      '<div class="span-lg-5"><div class="panel-card h-full"><div class="panel-header"><h5><i class="ico ico-people mr-2 t-success"></i>Kapasitas Harian</h5><button type="button" class="ui-btn ui-btn-sm ui-btn-outline-primary r-pill" data-open-modal="#modalKap"><i class="ico ico-pencil mr-1"></i>Atur</button></div>' +
      '<div class="p-3"><div class="flex justify-between items-end mb-1"><div><div class="t-sm t-muted">Terpesan hari ini</div><div class="bold" style="font-size:1.4rem;">' + U.num(terpesan) + ' <small class="t-muted normal" style="font-size:.8rem;">/ ' + U.num(kap) + '</small></div></div><span class="bold">' + pct + '%</span></div>' +
      '<div class="ui-progress mb-3" style="height:10px;"><div class="ui-progress-bar ' + barCls + '" id="kapBar" style="width:' + pct + '%"></div></div>' +
      '<div class="t-sm semibold mb-2 t-muted">Kuota 7 hari ke depan</div>' + kuota + '</div></div></div></div>' +
      '<div class="grid gap-4 mt-4"><div class="span-lg-5"><div class="panel-card h-full"><div class="panel-header"><h5><i class="ico ico-trophy mr-2 t-warning"></i>Tiket Terlaris Bulan Ini</h5></div><div class="p-3">' + tlh + '</div></div></div>' +
      '<div class="span-lg-7"><div class="panel-card h-full"><div class="panel-header"><h5><i class="ico ico-hourglass-split mr-2 t-danger"></i>Menunggu Persetujuan</h5><a href="transaksi.html" class="ui-btn ui-btn-sm ui-btn-outline-primary r-pill">Lihat Semua</a></div>' +
      tabelTerbaru(pending.slice(0, 5), 'Tidak ada pembayaran yang menunggu.') + '</div></div></div>' +
      // modal atur kapasitas
      '<div class="ui-modal ui-fade" id="modalKap" tabindex="-1"><div class="ui-modal-dialog ui-modal-sm"><div class="ui-modal-content r-4 bd-0 elev"><form id="formKap">' +
      '<div class="ui-modal-header" style="background:#0f4c81;color:#fff;border-radius:1rem 1rem 0 0;"><h6 class="ui-modal-title bold"><i class="ico ico-people mr-2"></i>Kapasitas Harian</h6><button type="button" class="ui-close ui-close-white" data-close-modal aria-label="Tutup"></button></div>' +
      '<div class="ui-modal-body p-4"><label class="ui-label semibold t-sm" for="kapInput">Maksimal tiket per hari kunjungan</label>' +
      '<input type="number" class="ui-input" id="kapInput" min="1" max="100000" value="' + kap + '" required><div class="ui-hint">Pemesanan online akan ditolak jika kuota tanggal kunjungan terlampaui.</div></div>' +
      '<div class="ui-modal-footer bd-0"><button type="button" class="ui-btn ui-btn-light r-pill" data-close-modal>Batal</button><button type="submit" class="ui-btn r-pill px-4" style="background:#0f4c81;color:#fff;"><i class="ico ico-save mr-1"></i>Simpan</button></div></form></div></div></div>';
    var c = chartData(); P.barChart(document.getElementById('chartHarian'), c.labels, c.values);
    document.getElementById('formKap').addEventListener('submit', function (e) {
      e.preventDefault();
      var v = parseInt(document.getElementById('kapInput').value, 10);
      if (!(v >= 1 && v <= 100000)) { alert('Kapasitas harus antara 1 dan 100.000.'); return; }
      if (SP.settings.set('kapasitas_harian', v)) P.flashReload('success', 'Kapasitas harian diperbarui menjadi <strong>' + U.num(v) + '</strong> tiket.');
    });
  }

  P.mount({
    roles: ['admin', 'manajer'], active: 'index',
    title: isManajer ? 'Dashboard Manajer' : 'Dashboard Admin',
    render: function (ses, el) { if (ses.role === 'manajer') renderManajer(ses, el); else renderAdmin(ses, el); }
  });
})();
