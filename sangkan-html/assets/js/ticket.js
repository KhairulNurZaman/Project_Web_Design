/* ticket.js — komponen kartu e-tiket (dipakai sukses.html & tiket.html) */
(function (w) {
  'use strict';
  var SP = w.SP, U = SP.util, esc = U.esc;

  SP.ticketCard = function (t, detail) {
    var st = t.status;
    var cls = st === 'aktif' ? 'aktif' : (st === 'digunakan' ? 'aktif' : (st === 'dibatalkan' ? 'batal' : 'menunggu'));
    var label = st === 'aktif' ? 'Tiket Aktif' : (st === 'digunakan' ? 'Sudah Digunakan' : (st === 'dibatalkan' ? 'Dibatalkan' : 'Menunggu Pembayaran'));
    var rows = '';
    detail.forEach(function (d) {
      rows += '<div class="ticket-row"><div><div class="ticket-label">Tiket</div><div class="ticket-value">' + esc(d.nama_layanan) + '</div></div>' +
        '<div class="t-right"><div class="ticket-label">Qty</div><div class="ticket-value">' + esc(d.qty) + ' orang</div></div></div>';
    });
    return '<div class="ticket-box mb-4">' +
      '<div class="ticket-top"><div class="flex items-center gap-4"><div class="grow">' +
      '<div class="t-sm op-75">No. Tiket</div><h4 class="bold mb-0 mono">' + esc(t.no_tiket) + '</h4>' +
      '<div class="mt-2"><span class="status-badge status-' + cls + '">' + label + '</span></div></div>' +
      '<div class="noshrink"><img src="' + SP.url('assets/img/logo_sangkan-removebg-preview.png') + '" style="height:50px;" alt=""></div></div></div>' +
      '<div class="perforated"></div>' +
      '<div class="ticket-body"><div class="grid"><div class="span-md-7">' + rows +
      '<div class="ticket-row"><div class="ticket-label">Tanggal Kunjungan</div><div class="ticket-value">' + (t.tgl_kunjungan ? U.dMY(t.tgl_kunjungan) : '-') + '</div></div>' +
      '<div class="ticket-row"><div class="ticket-label">Nama Pemesan</div><div class="ticket-value">' + esc(t.nama_cust || '-') + '</div></div>' +
      '<div class="ticket-row"><div class="ticket-label">Metode Bayar</div><div class="ticket-value">' + esc(t.metode_bayar) + '</div></div>' +
      '<div class="ticket-row"><div class="ticket-label">Total Bayar</div><div class="ticket-value" style="color:#f4a61c;font-size:1.1rem;">' + U.rp(t.total_bayar) + '</div></div>' +
      '</div><div class="span-md-5 flex flex-col items-center justify-center pt-3 pt-md-0">' +
      '<div class="qr-placeholder">' + SP.qr.svg(t.no_tiket, 150) + '</div>' +
      '<div class="mono mt-1" style="font-size:.65rem;color:#aaa;">' + esc(t.no_tiket.slice(-8)) + '</div>' +
      '<div class="t-sm t-muted mt-1 t-center">Tunjukkan kode ini saat masuk</div></div></div></div></div>';
  };
})(window);
