(function () {
  'use strict';
  var U = SP.util, esc = U.esc;
  function $(id) { return document.getElementById(id); }

  var layanan = SP.layanan.get(U.qs('tiket'));
  if (!layanan || layanan.status !== 'aktif') { window.location.replace('pesan.html'); return; }
  var qty = parseInt(U.qs('qty'), 10); if (!(qty >= 1)) qty = 1; if (qty > 20) qty = 20;
  var tglQs = U.qs('tgl');
  var tgl = (/^\d{4}-\d{2}-\d{2}$/.test(tglQs) && tglQs >= U.today()) ? tglQs : U.today();

  var ses = SP.session.get(), user = (ses && ses.type === 'customer') ? SP.user.get(ses.id_user) : null;
  if (user) {
    $('f_nama').value = user.nama_lengkap || '';
    $('f_email').value = user.email || '';
    $('f_hp').value = user.no_telp || '';
  }
  $('f_tgl').min = U.today(); $('f_tgl').value = tgl;
  $('f_qty').value = qty + ' orang';

  var total = Number(layanan.harga) * qty;
  $('orderSummary').innerHTML =
    '<h5 class="bold mb-3" style="color:#0f4c81;"><i class="ico ico-receipt mr-2"></i>Ringkasan Pesanan</h5>' +
    '<div class="tiket-preview mb-3"><div class="t-sm op-75 mb-1">Tiket yang dipilih</div>' +
    '<h5 class="bold">' + esc(layanan.nama_layanan) + '</h5>' +
    '<div class="flex justify-between items-end mt-2"><div><div class="t-sm op-75">Harga satuan</div><div>' + U.rp(layanan.harga) + '</div></div>' +
    '<div class="t-right"><div class="t-sm op-75">Jumlah</div><div class="bold">' + qty + ' tiket</div></div></div></div>' +
    '<div class="flex justify-between py-2 bd-b"><span class="t-muted t-sm">Subtotal (' + qty + ' x ' + U.rp(layanan.harga) + ')</span><span class="semibold">' + U.rp(total) + '</span></div>' +
    '<div class="flex justify-between py-2 bd-b"><span class="t-muted t-sm">Biaya Admin</span><span class="semibold t-success">Gratis</span></div>' +
    '<div class="flex justify-between py-3"><span class="bold">Total Pembayaran</span><span class="bold" style="font-size:1.3rem;color:#f4a61c;">' + U.rp(total) + '</span></div>' +
    '<div class="bgc-light r-3 p-3 mt-2"><div class="flex items-center gap-2 mb-2"><i class="ico ico-bank2 t-primary"></i><strong class="t-sm">Info Transfer Bank</strong></div>' +
    '<div class="t-sm t-muted"><div>Bank BRI: <strong>1234-5678-9012-3456</strong></div><div>A.N: <strong>PT. Sangkan Park</strong></div></div></div>' +
    '<div class="mt-3 flex gap-2 justify-center"><i class="ico ico-shield-check t-success"></i><span class="t-sm t-muted">Transaksi aman &amp; terlindungi</span></div>';

  // pilihan metode bayar
  Array.prototype.forEach.call(document.querySelectorAll('input[name="metode_bayar"]'), function (r) {
    r.addEventListener('change', function () {
      document.querySelectorAll('.metode-bayar').forEach(function (m) { m.classList.remove('selected'); });
      r.closest('.metode-bayar').classList.add('selected');
    });
  });

  function showError(msg) {
    $('flashBox').innerHTML = '<div class="ui-alert ui-alert-danger"><i class="ico ico-exclamation-circle mr-2"></i>' + esc(msg) + '</div>';
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  $('formCheckout').addEventListener('submit', function (e) {
    e.preventDefault();
    var metode = document.querySelector('input[name="metode_bayar"]:checked').value;
    var btn = $('btnSubmit'); btn.disabled = true;
    var r = SP.checkout({
      nama: $('f_nama').value, email: $('f_email').value, no_hp: $('f_hp').value.trim(),
      id_layanan: layanan.id_layanan, qty: qty, tgl_kunjungan: $('f_tgl').value, metode: metode
    });
    if (!r.ok) { btn.disabled = false; showError(r.msg); return; }
    window.location.href = 'sukses.html?no=' + encodeURIComponent(r.no_tiket);
  });
})();
