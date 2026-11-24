(function () {
  'use strict';
  var U = SP.util, esc = U.esc;
  var ses = SP.guard.customer(); if (!ses) return;
  document.getElementById('btnLogout').addEventListener('click', function (e) { e.preventDefault(); SP.auth.logout(); window.location.href = 'index.html'; });

  var user = SP.user.get(ses.id_user), ids = [];
  SP.customer.all().forEach(function (c) {
    if (c.id_user === ses.id_user || (user && c.email && String(c.email).toLowerCase() === String(user.email).toLowerCase())) ids.push(c.id_cust);
  });
  var list = ids.length ? SP.transaksi.byCustomerIds(ids) : [];
  var box = document.getElementById('list');

  if (!list.length) {
    box.innerHTML = '<div class="t-center py-5"><i class="ico ico-inbox" style="font-size:3rem;color:#dee2e6;"></i>' +
      '<p class="t-muted mt-3">Belum ada riwayat pesanan.</p>' +
      '<a href="pesan.html" class="ui-btn" style="background:#0f4c81;color:#fff;border-radius:50px;"><i class="ico ico-ticket mr-1"></i>Pesan Sekarang</a></div>';
    return;
  }
  var sc = { menunggu_pembayaran: 's-menunggu', aktif: 's-aktif', digunakan: 's-digunakan', dibatalkan: 's-dibatalkan' };
  var sl = { menunggu_pembayaran: 'Menunggu Bayar', aktif: 'Aktif', digunakan: 'Digunakan', dibatalkan: 'Dibatalkan' };
  var h = '';
  list.forEach(function (t) {
    h += '<div class="order-card"><div class="flex justify-between items-start flex-wrap gap-2"><div>' +
      '<div class="bold mono" style="color:#0f4c81;">' + esc(t.no_tiket) + '</div>' +
      '<div class="t-muted t-sm">' + U.dMYHi(t.tanggal) + '</div>' +
      (t.tgl_kunjungan ? '<div class="t-sm"><i class="ico ico-calendar-event t-primary mr-1"></i>Kunjungan: ' + U.dMY(t.tgl_kunjungan) + '</div>' : '') +
      '</div><div class="t-right"><span class="status-badge ' + (sc[t.status] || 's-menunggu') + '">' + esc(sl[t.status] || t.status) + '</span>' +
      '<div class="bold mt-1" style="color:#f4a61c;">' + U.rp(t.total_bayar) + '</div></div></div>' +
      '<div class="flex gap-2 mt-3 flex-wrap"><a href="sukses.html?no=' + encodeURIComponent(t.no_tiket) + '" class="ui-btn ui-btn-sm ui-btn-outline-primary r-pill"><i class="ico ico-eye mr-1"></i>Detail</a>' +
      ((t.status === 'aktif' || t.status === 'digunakan') ? '<a href="print-tiket.html?no=' + encodeURIComponent(t.no_tiket) + '" target="_blank" class="ui-btn ui-btn-sm r-pill" style="background:#0f4c81;color:#fff;border:none;"><i class="ico ico-printer mr-1"></i>Cetak</a>' : '') +
      '</div></div>';
  });
  box.innerHTML = h;
})();
