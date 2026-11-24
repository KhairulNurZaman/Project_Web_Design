(function () {
  'use strict';
  var U = SP.util, esc = U.esc;
  var ses = SP.guard.staff(['admin', 'manajer']); if (!ses) return;
  var no = U.qs('no'), t = no ? SP.transaksi.getJoin(no) : null, app = document.getElementById('app');
  if (!t) { app.innerHTML = '<p style="text-align:center;font-family:sans-serif;">Transaksi tidak ditemukan.</p>'; return; }
  document.title = (ses.role === 'admin' ? 'Struk - ' : 'Struk ') + t.no_tiket;
  var det = SP.transaksi.detail(no), isAdmin = ses.role === 'admin', n = function (v) { return U.num(v); };
  var h = '';
  if (isAdmin) {
    document.body.classList.add('admin');
    h += '<div class="no-print" style="text-align:center;margin-bottom:16px;"><button type="button" id="bp" style="background:#0f4c81;color:#fff;border:none;padding:8px 24px;border-radius:50px;cursor:pointer;font-weight:700;">&#128438; Cetak Struk</button>' +
      '<button type="button" id="bc" style="background:#6c757d;color:#fff;border:none;padding:8px 20px;border-radius:50px;cursor:pointer;margin-left:8px;">Tutup</button></div>' +
      '<div class="struk"><div class="c b" style="font-size:14px;">SANGKAN RESORT AQUA PARK</div><div class="c" style="font-size:10px;">Jl. Raya Bandorasa Km.12, Kuningan</div><div class="c" style="font-size:10px;">Telp: (0232) 615168</div>' +
      '<div class="line"></div><div class="c b">STRUK TIKET</div><div class="line"></div>' +
      '<div class="srow"><span>No. Tiket</span><span class="b">' + esc(t.no_tiket.slice(-12)) + '</span></div>' +
      '<div class="srow"><span>Tanggal</span><span>' + U.dmYHi(t.tanggal) + '</span></div>' +
      '<div class="srow"><span>Petugas</span><span>' + esc(t.nama_admin || 'Tiketing') + '</span></div>' +
      '<div class="srow"><span>Customer</span><span>' + esc((t.nama_cust || 'Guest').slice(0, 15)) + '</span></div>' +
      (t.tgl_kunjungan ? '<div class="srow"><span>Kunjungan</span><span>' + U.dmY(t.tgl_kunjungan) + '</span></div>' : '') +
      '<div class="line"></div><div class="b">ITEM:</div>';
    det.forEach(function (d) {
      h += '<div>' + esc(d.nama_layanan) + '</div><div class="srow"><span>&nbsp;&nbsp;' + esc(d.qty) + ' x ' + U.rp(d.harga_satuan) + '</span><span>' + U.rp(d.subtotal) + '</span></div>';
    });
    h += '<div class="line"></div><div class="srow"><span class="b">TOTAL</span><span class="b">' + U.rp(t.total_bayar) + '</span></div>' +
      '<div class="srow"><span>Bayar (' + esc(t.metode_bayar) + ')</span><span>' + U.rp(t.jum_bayar != null ? t.jum_bayar : t.total_bayar) + '</span></div>' +
      '<div class="srow"><span>Kembali</span><span>' + U.rp(t.changes || 0) + '</span></div><div class="line"></div>' +
      '<div class="c">Status: <span class="b">' + esc(String(t.status).toUpperCase()) + '</span></div><div class="line"></div>' +
      '<div class="c" style="font-size:10px;">Terima kasih telah berkunjung!</div><div class="c" style="font-size:10px;">Friendly, Safety and Fun</div>' +
      '<div class="c b" style="font-size:16px;margin-top:8px;">|||||||||||||||||||</div><div class="c" style="font-size:9px;">' + esc(t.no_tiket) + '</div></div>';
  } else {
    h += '<div class="no-print c" style="margin-bottom:12px;"><button type="button" id="bp" style="background:#0f4c81;color:#fff;border:none;padding:6px 20px;border-radius:50px;cursor:pointer;font-weight:700;">Cetak</button>' +
      '<button type="button" id="bc" style="background:#6c757d;color:#fff;border:none;padding:6px 16px;border-radius:50px;cursor:pointer;margin-left:8px;">Tutup</button></div>' +
      '<div class="struk"><div class="c b" style="font-size:13px;">SANGKAN RESORT AQUA PARK</div><div class="c" style="font-size:10px;">Jl. Raya Bandorasa Km.12, Kuningan</div><div class="line"></div>' +
      '<div class="srow"><span>No</span><span class="b">' + esc(t.no_tiket.slice(-10)) + '</span></div>' +
      '<div class="srow"><span>Tgl</span><span>' + U.dmYHi(t.tanggal) + '</span></div>' +
      '<div class="srow"><span>Manajer</span><span>' + esc(t.nama_admin || 'Tiketing') + '</span></div>' +
      '<div class="srow"><span>Customer</span><span>' + esc((t.nama_cust || 'Walk-in').slice(0, 12)) + '</span></div><div class="line"></div>';
    det.forEach(function (d) {
      h += '<div class="b">' + esc(d.nama_layanan) + '</div><div class="srow"><span>&nbsp;' + esc(d.qty) + ' x ' + n(d.harga_satuan) + '</span><span>' + n(d.subtotal) + '</span></div>';
    });
    h += '<div class="line"></div><div class="srow b"><span>TOTAL</span><span>' + U.rp(t.total_bayar) + '</span></div>' +
      '<div class="srow"><span>Bayar</span><span>' + U.rp(t.jum_bayar != null ? t.jum_bayar : t.total_bayar) + '</span></div>' +
      '<div class="srow"><span>Kembali</span><span>' + U.rp(t.changes || 0) + '</span></div><div class="line"></div>' +
      '<div class="c" style="font-size:10px;">Terima kasih! Friendly, Safety and Fun</div>' +
      '<div class="c b" style="letter-spacing:2px;margin-top:6px;">|||||||||||||||</div><div class="c" style="font-size:9px;">' + esc(t.no_tiket) + '</div></div>';
  }
  app.innerHTML = h;
  document.getElementById('bp').addEventListener('click', function () { window.print(); });
  document.getElementById('bc').addEventListener('click', function () { window.close(); });
  if (!isAdmin) setTimeout(function () { window.print(); }, 500);
})();
