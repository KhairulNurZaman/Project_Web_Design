(function () {
  'use strict';
  var U = SP.util, esc = U.esc;
  document.getElementById('btnPrint').addEventListener('click', function () { window.print(); });
  document.getElementById('btnClose').addEventListener('click', function () { window.close(); if (!window.closed) window.history.length > 1 ? window.history.back() : (window.location.href = 'index.html'); });

  var no = U.qs('no'), t = no ? SP.transaksi.getJoin(no) : null, box = document.getElementById('content');
  if (!t) { box.innerHTML = '<p class="t-center">Tiket tidak ditemukan.</p>'; return; }
  document.title = 'Tiket - ' + t.no_tiket;
  var detail = SP.transaksi.detail(no), s = t.status;
  var sc = s === 'aktif' ? 'aktif' : (s === 'digunakan' ? 'used' : (s === 'dibatalkan' ? 'batal' : 'menunggu'));
  var sl = s === 'aktif' ? 'AKTIF' : (s === 'digunakan' ? 'SUDAH DIPAKAI' : (s === 'dibatalkan' ? 'DIBATALKAN' : 'MENUNGGU BAYAR'));
  var rows = '';
  detail.forEach(function (d) {
    rows += '<div class="row-info"><div><div class="lbl">Tiket</div><div class="val">' + esc(d.nama_layanan) + '</div></div>' +
      '<div class="t-right"><div class="lbl">Qty</div><div class="val">' + esc(d.qty) + ' orang</div></div></div>' +
      '<div class="row-info"><div class="lbl">Harga Satuan</div><div class="val">' + U.rp(d.harga_satuan) + '</div></div>';
  });
  box.innerHTML = '<div class="ticket"><div class="ticket-head"><div>' +
    '<div style="font-size:.75rem;opacity:.7;">E-Tiket Resmi</div><div style="font-size:1.1rem;font-weight:700;">Sangkan Resort Aqua Park</div>' +
    '<div style="font-size:.75rem;opacity:.7;">Jl. Raya Bandorasa Km.12, Kuningan</div></div>' +
    '<img src="assets/img/logo_sangkan-removebg-preview.png" style="height:50px;" alt=""></div><div class="perf"></div>' +
    '<div class="ticket-body"><div class="flex justify-between items-start mb-3"><div>' +
    '<div style="font-size:.72rem;color:#999;">No. Tiket</div>' +
    '<div style="font-size:1.2rem;font-weight:700;font-family:monospace;color:#0f4c81;">' + esc(t.no_tiket) + '</div></div>' +
    '<span class="status-badge ' + sc + '">' + sl + '</span></div>' + rows +
    '<div class="row-info"><div class="lbl">Nama Pemesan</div><div class="val">' + esc(t.nama_cust || '-') + '</div></div>' +
    '<div class="row-info"><div class="lbl">Tanggal Transaksi</div><div class="val">' + U.dMYHi(t.tanggal) + '</div></div>' +
    '<div class="row-info"><div class="lbl">Tanggal Kunjungan</div><div class="val">' + (t.tgl_kunjungan ? U.dMY(t.tgl_kunjungan) : '-') + '</div></div>' +
    '<div class="row-info"><div class="lbl">Metode Bayar</div><div class="val">' + esc(t.metode_bayar) + '</div></div>' +
    '<div class="row-info" style="border-top:2px solid #0f4c81;margin-top:.5rem;padding-top:.75rem;"><div style="font-weight:700;color:#0f4c81;">Total Bayar</div>' +
    '<div style="font-weight:800;font-size:1.2rem;color:#f4a61c;">' + U.rp(t.total_bayar) + '</div></div>' +
    '<div class="qr-box">' + SP.qr.svg(t.no_tiket, 140) +
    '<div style="font-family:monospace;font-size:.8rem;color:#555;margin-top:.5rem;">' + esc(t.no_tiket) + '</div>' +
    '<div style="font-size:.7rem;color:#999;">Tunjukkan kode ini kepada petugas saat masuk</div></div>' +
    '<div style="font-size:.68rem;color:#aaa;text-align:center;margin-top:1rem;line-height:1.6;">Tiket ini adalah bukti pemesanan resmi. Tidak dapat di-refund.<br>Jam Operasional: 08.00–17.00 WIB | Berlaku sesuai tanggal kunjungan.</div>' +
    '</div></div>';
})();
