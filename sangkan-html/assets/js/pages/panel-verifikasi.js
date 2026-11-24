(function () {
  'use strict';
  var U = SP.util, esc = U.esc, P = SP.panel;
  var keyword = U.qs('keyword').trim();

  function render(ses, el) {
    var t = null, det = null;
    if (keyword) {
      t = SP.transaksi.getJoin(keyword) || SP.transaksi.getJoin(keyword.toUpperCase());
      if (t) det = SP.transaksi.detail(t.no_tiket);
      else P.showAlert('danger', 'Kode tiket tidak ditemukan!');
    }
    var result = '';
    if (t) {
      var s = t.status, map = { aktif: ['#28a745', '✓ TIKET VALID'], menunggu_pembayaran: ['#f4a61c', '⚠ BELUM DIBAYAR'], digunakan: ['#0f4c81', '✓ SUDAH DIGUNAKAN'], dibatalkan: ['#dc3545', '✗ DIBATALKAN'] };
      var si = map[s] || ['#888', 'UNKNOWN'];
      var ico = s === 'aktif' ? 'ico-check-lg' : (s === 'digunakan' ? 'ico-check-all' : 'ico-x-lg');
      var infos = [['Nama Customer', t.nama_cust || '-'], ['No. HP', t.no_hp || '-'], ['Tanggal Transaksi', U.dMYHi(t.tanggal)],
        ['Tanggal Kunjungan', t.tgl_kunjungan ? U.dMY(t.tgl_kunjungan) : '-'], ['Metode Bayar', t.metode_bayar], ['Total Bayar', U.rp(t.total_bayar)]], ih = '';
      infos.forEach(function (i) { ih += '<div class="span-sm-6"><div class="t-sm t-muted">' + i[0] + '</div><div class="semibold">' + esc(i[1]) + '</div></div>'; });
      var drows = '';
      det.forEach(function (d) { drows += '<tr><td class="t-sm">' + esc(d.nama_layanan) + '</td><td class="t-sm">' + esc(d.qty) + '</td><td class="t-sm">' + U.rp(d.harga_satuan) + '</td></tr>'; });
      var action;
      if (s === 'aktif') {
        var warn = (t.tgl_kunjungan && t.tgl_kunjungan !== U.today())
          ? '<div class="ui-alert ui-alert-warning t-sm r-3"><i class="ico ico-calendar-x mr-2"></i>Perhatian: tanggal kunjungan tiket ini <strong>' + U.dMY(t.tgl_kunjungan) + '</strong>, bukan hari ini.</div>' : '';
        action = warn + '<button type="button" data-act="checkin" class="ui-btn w-full bold r-pill py-2" style="background:#28a745;color:#fff;border:none;"><i class="ico ico-box-arrow-in-right mr-2"></i>CHECK-IN PENGUNJUNG</button>';
      } else if (s === 'digunakan') action = '<div class="ui-alert ui-alert-info t-center r-3 mb-0"><i class="ico ico-info-circle mr-2"></i>Tiket ini sudah digunakan untuk masuk.</div>';
      else if (s === 'dibatalkan') action = '<div class="ui-alert ui-alert-danger t-center r-3 mb-0"><i class="ico ico-x-circle mr-2"></i>Tiket ini sudah dibatalkan.</div>';
      else action = '<div class="ui-alert ui-alert-warning t-center r-3 mb-0"><i class="ico ico-exclamation-triangle mr-2"></i>Pembayaran belum diverifikasi. Tiket belum bisa digunakan.</div>';

      result = '<div class="panel-card"><div class="p-4" style="background:' + si[0] + '15;border-bottom:3px solid ' + si[0] + ';"><div class="flex items-center gap-3">' +
        '<div class="r-3 flex items-center justify-center" style="width:56px;height:56px;background:' + si[0] + ';color:#fff;font-size:1.5rem;flex-shrink:0;"><i class="ico ' + ico + '"></i></div>' +
        '<div><div class="bold" style="color:' + si[0] + ';font-size:1.1rem;">' + si[1] + '</div><div class="mono t-sm t-muted">' + esc(t.no_tiket) + '</div></div></div></div>' +
        '<div class="p-4"><div class="grid gap-3 mb-4">' + ih + '</div>' +
        (det.length ? '<div class="ui-table-wrap mb-4"><table class="ui-table ui-table-sm r-3 clip mb-0" style="background:#f8faff;"><thead><tr><th class="t-sm semibold">Tiket</th><th class="t-sm semibold">Qty</th><th class="t-sm semibold">Harga</th></tr></thead><tbody>' + drows + '</tbody></table></div>' : '') +
        action + '</div></div>';
    } else if (keyword) {
      result = '<div class="panel-card"><div class="p-5 t-center"><i class="ico ico-x-circle" style="font-size:3rem;color:#dc3545;"></i><h5 class="mt-3 bold t-danger">Tiket Tidak Ditemukan</h5>' +
        '<p class="t-muted">Kode tiket <strong>' + esc(keyword) + '</strong> tidak ada di sistem.</p></div></div>';
    } else {
      result = '<div class="panel-card"><div class="p-5 t-center"><i class="ico ico-qr-code" style="font-size:3.5rem;color:#dee2e6;"></i><p class="t-muted mt-3">Masukkan No. Tiket untuk memulai verifikasi</p></div></div>';
    }

    el.innerHTML =
      '<div class="mb-4"><h4 class="bold mb-0" style="color:#0f4c81;"><i class="ico ico-qr-code-scan mr-2"></i>Verifikasi Tiket</h4>' +
      '<p class="t-muted t-sm">Input No. Tiket (atau kode pada QR) untuk verifikasi kedatangan pengunjung</p></div>' +
      '<div class="grid gap-4"><div class="span-lg-5"><div class="panel-card mb-4"><div class="panel-header"><h5><i class="ico ico-search mr-2"></i>Cari Tiket</h5></div><div class="p-4">' +
      '<form method="GET" action="verifikasi.html"><div class="mb-3"><label class="ui-label semibold t-sm" for="kw">No. Tiket / Kode QR</label><div class="ui-group">' +
      '<span class="ui-group-text"><i class="ico ico-qr-code"></i></span><input type="text" class="ui-input" name="keyword" id="kw" value="' + esc(keyword) + '" placeholder="Contoh: WP2026111414052345" autofocus autocomplete="off">' +
      '<button type="submit" class="ui-btn" style="background:#0f4c81;color:#fff;" aria-label="Cari"><i class="ico ico-search"></i></button></div></div></form>' +
      '<div class="bgc-light r-3 p-3 t-sm t-muted"><div class="semibold mb-2"><i class="ico ico-info-circle mr-1"></i>Cara Verifikasi:</div><ol class="mb-0 pl-3">' +
      '<li>Baca QR Code pengunjung atau input nomor tiket manual</li><li>Pastikan status tiket <strong>Aktif</strong></li><li>Klik tombol <strong>Check-In</strong></li><li>Tiket otomatis berubah jadi Digunakan</li></ol></div></div></div></div>' +
      '<div class="span-lg-7">' + result + '</div></div>';

    P.on(el, {
      checkin: function () {
        if (!confirm('Konfirmasi check-in pengunjung ini?')) return;
        var no = t.no_tiket, target = 'verifikasi.html?keyword=' + encodeURIComponent(no);
        var cur = SP.transaksi.get(no);
        if (!cur) { P.flashTo('error', 'Tiket tidak ditemukan!', 'verifikasi.html'); return; }
        if (cur.status !== 'aktif') {
          var label = { menunggu_pembayaran: 'belum dibayar', digunakan: 'sudah digunakan', dibatalkan: 'dibatalkan' };
          P.flashTo('error', 'Tiket tidak bisa di-check-in karena status: <strong>' + (label[cur.status] || cur.status) + '</strong>', target); return;
        }
        if (SP.scanlog.checkin(no, ses.id_admin, ses.nama)) P.flashTo('success', 'CHECK-IN BERHASIL! Selamat datang di Sangkan Resort Aqua Park 🎉', target);
      }
    });
  }
  P.mount({ roles: ['admin', 'manajer'], active: 'verifikasi', title: 'Verifikasi Tiket', render: render });
})();
