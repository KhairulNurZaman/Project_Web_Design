(function () {
  'use strict';
  var U = SP.util;
  var no = U.qs('no'), t = no ? SP.transaksi.getJoin(no) : null, box = document.getElementById('content');
  if (!t) {
    box.innerHTML = '<div class="t-center py-5"><i class="ico ico-x-circle" style="font-size:3rem;color:#dc3545;"></i>' +
      '<h4 class="bold mt-3" style="color:#0f4c81;">Tiket Tidak Ditemukan</h4>' +
      '<p class="t-muted">Nomor tiket tidak ada di sistem. Periksa kembali nomor tiket Anda.</p>' +
      '<a href="index.html#cek-tiket" class="ui-btn r-pill px-4" style="background:#0f4c81;color:#fff;">Cek Tiket Lain</a></div>';
    return;
  }
  var msg = {
    menunggu_pembayaran: ['warning', 'ico-hourglass-split', 'Tiket belum aktif. Selesaikan pembayaran agar tiket dapat digunakan.'],
    aktif: ['success', 'ico-check-circle', 'Tiket aktif dan siap digunakan pada tanggal kunjungan.'],
    digunakan: ['info', 'ico-check-all', 'Tiket ini sudah digunakan untuk masuk.'],
    dibatalkan: ['danger', 'ico-x-circle', 'Tiket ini telah dibatalkan.']
  }[t.status] || ['secondary', 'ico-info-circle', ''];
  var h = '<div class="ui-alert ui-alert-' + msg[0] + ' t-center mx-auto" style="max-width:650px;"><i class="ico ' + msg[1] + ' mr-2"></i>' + msg[2] + '</div>';
  h += SP.ticketCard(t, SP.transaksi.detail(no));
  h += '<div class="flex flex-wrap gap-3 justify-center mb-4">';
  if (t.status === 'menunggu_pembayaran') h += '<a href="sukses.html?no=' + encodeURIComponent(t.no_tiket) + '" class="ui-btn r-pill px-4" style="background:#f4a61c;color:#fff;border:none;"><i class="ico ico-credit-card mr-2"></i>Lanjut Pembayaran</a>';
  h += '<a href="print-tiket.html?no=' + encodeURIComponent(t.no_tiket) + '" target="_blank" class="ui-btn ui-btn-outline-primary r-pill px-4"><i class="ico ico-printer mr-2"></i>Cetak Tiket</a>' +
    '<a href="index.html" class="ui-btn ui-btn-outline-secondary r-pill px-4"><i class="ico ico-house mr-2"></i>Ke Beranda</a></div>';
  box.innerHTML = h;
})();
