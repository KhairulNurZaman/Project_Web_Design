(function () {
  'use strict';
  var U = SP.util, esc = U.esc, P = SP.panel;
  var no = U.qs('no');

  function render(ses, el) {
    var t = no ? SP.transaksi.getJoin(no) : null;
    if (!t) { P.flashTo('error', 'Transaksi tidak ditemukan!', 'transaksi.html'); return; }
    var det = SP.transaksi.detail(no), s = t.status;
    var info = [
      ['No. Tiket', t.no_tiket, 'mono bold'], ['Customer', t.nama_cust || '-', ''], ['Email', t.email || '-', ''], ['No. HP', t.no_hp || '-', ''],
      ['Tanggal Transaksi', U.dMYHi(t.tanggal), ''], ['Tanggal Kunjungan', t.tgl_kunjungan ? U.dMY(t.tgl_kunjungan) : '-', ''],
      ['Manajer/Staff', t.nama_admin || 'Online', ''], ['Metode Bayar', t.metode_bayar, ''],
      ['Jml Bayar', U.rp(t.jum_bayar || 0), ''], ['Kembalian', U.rp(t.changes || 0), '']
    ], ih = '';
    info.forEach(function (r) { ih += '<div class="span-sm-6"><div class="t-sm t-muted">' + r[0] + '</div><div class="semibold ' + r[2] + '">' + esc(r[1]) + '</div></div>'; });
    var rows = '';
    det.forEach(function (d) {
      rows += '<tr><td class="pl-3 semibold">' + esc(d.nama_layanan) + '</td><td>' + esc(d.qty) + ' orang</td><td>' + U.rp(d.harga_satuan) + '</td><td class="pr-3 bold">' + U.rp(d.subtotal) + '</td></tr>';
    });
    var actions = '<a href="cetak-struk.html?no=' + encodeURIComponent(no) + '" target="_blank" class="ui-btn ui-btn-outline-primary r-pill"><i class="ico ico-printer mr-2"></i>Cetak Struk</a>';
    if (s === 'menunggu_pembayaran') {
      actions += '<button type="button" data-act="verif" class="ui-btn ui-btn-success r-pill t-white"><i class="ico ico-check-circle mr-2"></i>Verifikasi Pembayaran</button>' +
        '<button type="button" data-act="tolak" class="ui-btn ui-btn-danger r-pill"><i class="ico ico-x-circle mr-2"></i>Tolak Pembayaran</button>';
    } else if (s === 'aktif') {
      actions += '<button type="button" data-act="checkin" class="ui-btn ui-btn-primary r-pill"><i class="ico ico-box-arrow-in-right mr-2"></i>Check-in Manual</button>';
    }
    if (t.bukti_bayar) actions += '<button type="button" data-act="bukti" class="ui-btn ui-btn-outline-secondary r-pill"><i class="ico ico-image mr-2"></i>Lihat Bukti Bayar</button>';

    el.innerHTML =
      '<div class="flex items-center gap-3 mb-4"><a href="transaksi.html" class="ui-btn ui-btn-outline-secondary r-pill ui-btn-sm"><i class="ico ico-arrow-left mr-1"></i>Kembali</a>' +
      '<div><h4 class="bold mb-0" style="color:#0f4c81;">Detail Transaksi</h4><p class="t-muted t-sm mb-0">No. Tiket: <strong>' + esc(t.no_tiket) + '</strong></p></div></div>' +
      '<div class="grid gap-4"><div class="span-lg-7"><div class="panel-card mb-4"><div class="panel-header"><h5><i class="ico ico-info-circle mr-2"></i>Informasi Transaksi</h5>' + P.badge(s, true) + '</div>' +
      '<div class="p-4"><div class="grid gap-3">' + ih + '</div></div></div>' +
      '<div class="panel-card"><div class="panel-header"><h5><i class="ico ico-list-ul mr-2"></i>Item Tiket</h5></div><div class="ui-table-wrap"><table class="ui-table mb-0">' +
      '<thead style="background:#f8faff;"><tr><th class="pl-3 semibold t-sm">Layanan</th><th class="semibold t-sm">Qty</th><th class="semibold t-sm">Harga Sat.</th><th class="semibold t-sm pr-3">Subtotal</th></tr></thead>' +
      '<tbody>' + rows + '</tbody><tfoot><tr style="background:#f8faff;"><td colspan="3" class="pl-3 bold">TOTAL</td><td class="pr-3 bold" style="color:#f4a61c;font-size:1.1rem;">' + U.rp(t.total_bayar) + '</td></tr></tfoot></table></div></div></div>' +
      '<div class="span-lg-5"><div class="panel-card mb-3"><div class="panel-header"><h5><i class="ico ico-gear mr-2"></i>Aksi</h5></div><div class="p-4 flex flex-col gap-2" id="actBox">' + actions + '</div></div>' +
      '<div class="panel-card"><div class="panel-header"><h5><i class="ico ico-qr-code mr-2"></i>QR Tiket</h5></div><div class="p-4 t-center">' +
      '<div class="mx-auto mb-2 flex items-center justify-center r-3" style="width:150px;height:150px;background:#fff;border:2px solid #e9ecef;overflow:hidden;">' + SP.qr.svg(t.no_tiket, 146) + '</div>' +
      '<div class="mono t-sm t-muted">' + esc(t.no_tiket) + '</div></div></div></div></div>';

    function back(type, msg) { P.flashReload(type, msg); }
    P.on(el, {
      verif: function () {
        if (!confirm('Verifikasi pembayaran ini?')) return;
        var cur = SP.transaksi.get(no);
        if (!cur || cur.status !== 'menunggu_pembayaran') { back('error', 'Transaksi ini tidak berstatus menunggu pembayaran.'); return; }
        SP.transaksi.setStatus(no, 'aktif'); back('success', 'Pembayaran berhasil diverifikasi! Tiket sekarang aktif.');
      },
      tolak: function () {
        if (!confirm('Tolak/batalkan transaksi ini?')) return;
        var cur = SP.transaksi.get(no);
        if (!cur || cur.status !== 'menunggu_pembayaran') { back('error', 'Transaksi ini tidak berstatus menunggu pembayaran.'); return; }
        SP.transaksi.setStatus(no, 'dibatalkan'); back('success', 'Transaksi telah dibatalkan.');
      },
      checkin: function () {
        if (!confirm('Lakukan check-in untuk tiket ini?')) return;
        if (SP.scanlog.checkin(no, ses.id_admin, ses.nama)) back('success', 'CHECK-IN BERHASIL! Selamat datang di Sangkan Resort Aqua Park 🎉');
        else back('error', 'Tiket tidak bisa di-check-in karena statusnya sudah berubah.');
      },
      bukti: function () { P.showBukti(t.bukti_bayar, t.no_tiket); }
    });
  }
  P.mount({ roles: ['admin', 'manajer'], active: 'transaksi', title: 'Detail Transaksi', render: render });
})();
