(function () {
  'use strict';
  var U = SP.util, esc = U.esc, P = SP.panel;

  function render(ses, el) {
    var dari = U.qs('dari') || (U.today().slice(0, 8) + '01'), sampai = U.qs('sampai') || U.today();
    if (!/^\d{4}-\d{2}-\d{2}$/.test(dari)) dari = U.today().slice(0, 8) + '01';
    if (!/^\d{4}-\d{2}-\d{2}$/.test(sampai)) sampai = U.today();
    if (dari > sampai) { var tmp = dari; dari = sampai; sampai = tmp; }

    var list = SP.transaksi.laporan(dari, sampai);
    var total = list.reduce(function (s, t) { return s + (Number(t.total_bayar) || 0); }, 0);
    var tiket = list.reduce(function (s, t) { return s + (Number(t.jumlah_tiket) || 0); }, 0);
    var avg = list.length ? total / list.length : 0;

    // rekap per metode bayar & per tiket
    var met = {}; list.forEach(function (t) { met[t.metode_bayar] = met[t.metode_bayar] || { n: 0, rp: 0 }; met[t.metode_bayar].n++; met[t.metode_bayar].rp += Number(t.total_bayar) || 0; });
    var metRows = Object.keys(met).map(function (k) { return '<tr><td class="pl-3 t-sm">' + esc(k) + '</td><td class="t-sm t-center">' + met[k].n + '</td><td class="t-sm semibold pr-3 t-right">' + U.rp(met[k].rp) + '</td></tr>'; }).join('');
    if (!metRows) metRows = '<tr><td colspan="3" class="t-center t-muted t-sm py-3">Tidak ada data.</td></tr>';
    var tl = SP.transaksi.terlaris(dari, sampai);
    var tlRows = tl.map(function (x) { return '<tr><td class="pl-3 t-sm">' + esc(x.nama) + '</td><td class="t-sm t-center">' + U.num(x.qty) + '</td><td class="t-sm semibold pr-3 t-right">' + U.rp(x.omzet) + '</td></tr>'; }).join('');
    if (!tlRows) tlRows = '<tr><td colspan="3" class="t-center t-muted t-sm py-3">Tidak ada data.</td></tr>';

    var rows = '';
    if (!list.length) rows = '<tr><td colspan="8" class="t-center py-5 t-muted"><i class="ico ico-inbox" style="font-size:2rem;"></i><p class="mt-2">Tidak ada data untuk periode ini.</p></td></tr>';
    list.forEach(function (t, i) {
      rows += '<tr><td class="pl-3 t-muted t-sm">' + (i + 1) + '</td><td class="mono t-sm bold" style="color:#0f4c81;">' + esc(t.no_tiket) + '</td>' +
        '<td class="t-sm">' + esc(t.nama_cust || '-') + '</td><td class="t-sm t-muted">' + U.dmYHi(t.tanggal) + '</td><td class="t-sm">' + esc(t.nama_admin || 'Online') + '</td>' +
        '<td class="t-sm">' + esc(t.metode_bayar) + '</td><td class="t-sm semibold">' + U.rp(t.total_bayar) + '</td><td class="pr-3">' + P.badge(t.status) + '</td></tr>';
    });

    el.innerHTML =
      '<div class="flex justify-between items-center mb-4 flex-wrap gap-2"><div><h4 class="bold mb-0" style="color:#0f4c81;"><i class="ico ico-bar-chart-line mr-2"></i>Laporan Penjualan</h4>' +
      '<p class="t-muted t-sm mb-0">Rekap transaksi per periode</p></div><div class="flex gap-2 no-print">' +
      '<button type="button" class="ui-btn ui-btn-outline-success r-pill" id="btnCsv"><i class="ico ico-filetype-csv mr-1"></i>Unduh CSV</button>' +
      '<button type="button" class="ui-btn ui-btn-outline-secondary r-pill" id="btnPrint"><i class="ico ico-printer mr-1"></i>Cetak Laporan</button></div></div>' +
      '<div class="panel-card mb-4 no-print"><div class="p-4"><form method="GET" action="laporan.html" class="grid gap-3 items-end">' +
      '<div class="span-sm-4"><label class="ui-label semibold t-sm" for="dari">Dari Tanggal</label><input type="date" class="ui-input" name="dari" id="dari" value="' + esc(dari) + '"></div>' +
      '<div class="span-sm-4"><label class="ui-label semibold t-sm" for="sampai">Sampai Tanggal</label><input type="date" class="ui-input" name="sampai" id="sampai" value="' + esc(sampai) + '"></div>' +
      '<div class="span-sm-4"><button type="submit" class="ui-btn w-full bold" style="background:#0f4c81;color:#fff;border-radius:50px;"><i class="ico ico-filter mr-1"></i>Tampilkan Laporan</button></div></form></div></div>' +
      '<div class="grid gap-3 mb-4">' +
      '<div class="span-sm-6 span-xl-3"><div class="stat-card primary"><div class="stat-icon" style="background:#e0f0ff;color:#0f4c81;"><i class="ico ico-cash-stack"></i></div><div class="stat-label">Total Pendapatan</div><div class="stat-value">' + U.rp(total) + '</div><div class="stat-sub">' + U.dMY(dari) + ' - ' + U.dMY(sampai) + '</div></div></div>' +
      '<div class="span-sm-6 span-xl-3"><div class="stat-card success"><div class="stat-icon" style="background:#d1fae5;color:#065f46;"><i class="ico ico-receipt"></i></div><div class="stat-label">Jumlah Transaksi</div><div class="stat-value">' + list.length + '</div><div class="stat-sub">Transaksi sukses</div></div></div>' +
      '<div class="span-sm-6 span-xl-3"><div class="stat-card warning"><div class="stat-icon" style="background:#fef3c7;color:#92400e;"><i class="ico ico-graph-up"></i></div><div class="stat-label">Rata-rata/Transaksi</div><div class="stat-value">' + U.rp(avg) + '</div><div class="stat-sub">Per transaksi</div></div></div>' +
      '<div class="span-sm-6 span-xl-3"><div class="stat-card danger"><div class="stat-icon" style="background:#fee2e2;color:#991b1b;"><i class="ico ico-ticket-perforated"></i></div><div class="stat-label">Tiket Terjual</div><div class="stat-value">' + U.num(tiket) + '</div><div class="stat-sub">Jumlah tiket</div></div></div></div>' +
      '<div class="grid gap-3 mb-4"><div class="span-lg-6"><div class="panel-card h-full"><div class="panel-header"><h5><i class="ico ico-credit-card mr-2 t-primary"></i>Rekap per Metode Bayar</h5></div>' +
      '<div class="ui-table-wrap"><table class="ui-table mb-0"><thead style="background:#f8faff;"><tr><th class="pl-3 semibold t-sm t-muted">Metode</th><th class="semibold t-sm t-muted t-center">Transaksi</th><th class="semibold t-sm t-muted pr-3 t-right">Pendapatan</th></tr></thead><tbody>' + metRows + '</tbody></table></div></div></div>' +
      '<div class="span-lg-6"><div class="panel-card h-full"><div class="panel-header"><h5><i class="ico ico-ticket-perforated mr-2 t-warning"></i>Rekap per Tiket</h5></div>' +
      '<div class="ui-table-wrap"><table class="ui-table mb-0"><thead style="background:#f8faff;"><tr><th class="pl-3 semibold t-sm t-muted">Tiket</th><th class="semibold t-sm t-muted t-center">Jumlah</th><th class="semibold t-sm t-muted pr-3 t-right">Pendapatan</th></tr></thead><tbody>' + tlRows + '</tbody></table></div></div></div></div>' +
      '<div class="panel-card"><div class="panel-header"><h5><i class="ico ico-table mr-2"></i>Detail Laporan</h5><span class="ui-badge" style="background:#e0f0ff;color:#0f4c81;">' + list.length + ' transaksi</span></div>' +
      '<div class="ui-table-wrap"><table class="ui-table ui-table-hover v-middle mb-0"><thead style="background:#f8faff;"><tr>' +
      '<th class="pl-3 semibold t-sm t-muted">#</th><th class="semibold t-sm t-muted">No. Tiket</th><th class="semibold t-sm t-muted">Customer</th><th class="semibold t-sm t-muted">Tanggal</th>' +
      '<th class="semibold t-sm t-muted">Petugas</th><th class="semibold t-sm t-muted">Metode</th><th class="semibold t-sm t-muted">Total</th><th class="semibold t-sm t-muted pr-3">Status</th></tr></thead><tbody>' + rows + '</tbody>' +
      (list.length ? '<tfoot><tr style="background:#f0f8ff;"><td colspan="6" class="pl-3 bold">TOTAL PENDAPATAN</td><td class="bold" style="color:#f4a61c;font-size:1rem;">' + U.rp(total) + '</td><td class="pr-3"></td></tr></tfoot>' : '') +
      '</table></div></div>';

    document.getElementById('btnPrint').addEventListener('click', function () { window.print(); });
    document.getElementById('btnCsv').addEventListener('click', function () {
      var data = [['No', 'No. Tiket', 'Customer', 'Tanggal', 'Kunjungan', 'Petugas', 'Metode', 'Jumlah Tiket', 'Total', 'Status']];
      list.forEach(function (t, i) {
        data.push([i + 1, t.no_tiket, t.nama_cust || '-', U.dmYHi(t.tanggal), t.tgl_kunjungan ? U.dmY(t.tgl_kunjungan) : '-', t.nama_admin || 'Online', t.metode_bayar, t.jumlah_tiket, Math.round(t.total_bayar), t.status]);
      });
      data.push([]); data.push(['', '', '', '', '', '', '', 'TOTAL', Math.round(total), '']);
      P.downloadCsv('laporan-sangkan-' + dari + '_sd_' + sampai + '.csv', data);
    });
  }
  P.mount({ roles: ['admin', 'manajer'], active: 'laporan', title: 'Laporan', render: render });
})();
