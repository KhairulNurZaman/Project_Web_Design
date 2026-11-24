(function () {
  'use strict';
  var U = SP.util, esc = U.esc, P = SP.panel;
  function render(ses, el) {
    var list = SP.transaksi.byStaff(ses.id_admin), rows = '';
    if (!list.length) rows = '<tr><td colspan="6" class="t-center py-5 t-muted"><i class="ico ico-inbox" style="font-size:2rem;"></i><p class="mt-2">Belum ada transaksi.</p></td></tr>';
    list.forEach(function (t) {
      rows += '<tr><td class="pl-3 mono t-sm bold" style="color:#0f4c81;">' + esc(t.no_tiket) + '</td><td class="t-sm">' + esc(t.nama_cust || 'Walk-in') + '</td>' +
        '<td class="t-sm t-muted">' + U.dmYHi(t.tanggal) + '</td><td class="t-sm semibold">' + U.rp(t.total_bayar) + '</td><td>' + P.badge(t.status) + '</td>' +
        '<td class="pr-3"><div class="flex gap-1"><a href="detail-transaksi.html?no=' + encodeURIComponent(t.no_tiket) + '" class="ui-btn ui-btn-sm ui-btn-outline-secondary r-pill py-0 px-2" title="Detail"><i class="ico ico-eye"></i></a>' +
        '<a href="cetak-struk.html?no=' + encodeURIComponent(t.no_tiket) + '" target="_blank" class="ui-btn ui-btn-sm ui-btn-outline-primary r-pill py-0 px-2" title="Cetak"><i class="ico ico-printer"></i></a></div></td></tr>';
    });
    el.innerHTML = '<div class="mb-4"><h4 class="bold mb-0" style="color:#0f4c81;"><i class="ico ico-clock-history mr-2"></i>Riwayat Transaksi Saya</h4><p class="t-muted t-sm">Transaksi yang diproses oleh Anda</p></div>' +
      '<div class="panel-card"><div class="ui-table-wrap"><table class="ui-table ui-table-hover v-middle mb-0">' + P.thead(['No. Tiket', 'Customer', 'Tanggal', 'Total', 'Status', { t: 'Aksi', last: true }]) + '<tbody>' + rows + '</tbody></table></div></div>';
  }
  P.mount({ roles: ['manajer', 'admin'], active: 'riwayat', title: 'Riwayat Transaksi', render: render });
})();
